import os
import datetime
from typing import Any, List, Optional
from pydantic import BaseModel, validator
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
JWT_SECRET = os.getenv("JWT_SECRET")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("Supabase URL and Service Role Key must be set in environment variables")

# Initialize Supabase client with service role key for backend operations
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

app = FastAPI(title="Workout Generator API")

# CORS Middleware
# NOTE: allow_origins=["*"] is INVALID together with allow_credentials=True —
# browsers reject wildcard origins when credentials are allowed. Replace the
# list below with your actual frontend origin(s).
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://your-app.vercel.app",  # TODO: replace with your real Vercel domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

bearer_scheme = HTTPBearer()

# --- Pydantic Models ---

class QuestionnaireAnswers(BaseModel):
    goal: str
    age: int
    weight: float
    gender: str
    training_days_per_week: int
    training_location: str
    equipment_details: Optional[str] = None

    @validator('age')
    def age_must_be_teen_or_adult(cls, v):
        if v < 13:
            raise ValueError('Age must be at least 13')
        if v > 120:
            raise ValueError('Age must not exceed 120')
        return v

    @validator('weight')
    def weight_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Weight must be positive')
        if v > 500:
            raise ValueError('Weight must not exceed 500 kg')
        return v

class UserProfileResponse(BaseModel):
    id: str
    goal: str
    age: int
    weight: float
    gender: str
    training_days_per_week: int
    training_location: str
    equipment_details: Optional[str] = None
    consent_privacy: bool
    consent_terms: bool

class WorkoutPlanResponse(BaseModel):
    id: str
    plan_name: str
    start_date: str
    end_date: Optional[str] = None
    is_active: bool

class WorkoutPlanDayResponse(BaseModel):
    id: str
    day_number: int
    workout_date: str
    exercises: List[dict]
    is_completed: bool

class WorkoutLogResponse(BaseModel):
    id: str
    completed_at: str
    notes: Optional[str] = None

class TokenExchangeRequest(BaseModel):
    supabase_access_token: str

class RegisterRequest(BaseModel):
    supabase_access_token: str
    questionnaire: QuestionnaireAnswers
    consent_privacy: bool
    consent_terms: bool

class WorkoutLogRequest(BaseModel):
    day_id: str
    notes: Optional[str] = None

def get_exercises_for_user(answers: QuestionnaireAnswers, limit: int = 3) -> List[dict]:
    """Fetch exercises suitable for the user's equipment and location."""
    try:
        # Fetch all exercises (in a real app, we'd filter in the DB)
        response = supabase.table("exercises").select("*").execute()
        if not response.data:
            return []
        
        exercises = response.data
        filtered = []
        for ex in exercises:
            # Check location: training_location should be in location_tags array
            loc_tags = ex.get("location_tags", [])
            if isinstance(loc_tags, str):
                # In case it's a string, convert to list? But it's stored as array.
                # We'll assume it's a list.
                loc_tags = [loc_tags]
            if answers.training_location not in loc_tags:
                continue
            
            # Check equipment: if equipment_details provided, see if equipment_required matches
            eq_required = ex.get("equipment_required", "").lower()
            if answers.equipment_details:
                # Split by commas and/or spaces, remove empty
                eq_keywords = [e.strip().lower() for e in answers.equipment_details.replace(',', ' ').split() if e.strip()]
                if not any(keyword in eq_required for keyword in eq_keywords):
                    continue
            # If no equipment_details, we accept any equipment
            
            filtered.append(ex)
        
        # Limit to the requested number
        limited = filtered[:limit]
        
        # Convert to the expected format
        result = []
        for ex in limited:
            exercise_obj = {"name": ex["name"]}
            if ex.get("default_sets") is not None:
                exercise_obj["sets"] = ex["default_sets"]
            if ex.get("default_reps") is not None:
                exercise_obj["reps"] = ex["default_reps"]
            if ex.get("default_duration") is not None:
                exercise_obj["duration"] = ex["default_duration"]
            result.append(exercise_obj)
        
        return result
    except Exception as e:
        print(f"Error fetching exercises: {e}")
        return []

# --- Authentication Dependency ---

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> dict:
    token = credentials.credentials
    try:
        # Validate Supabase token directly
        user_response = supabase.auth.get_user(token)
        user = user_response.user
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
            )
        
        # Fetch user profile from Supabase
        profile = supabase.table("user_profiles").select("*").eq("supabase_user_id", user.id).execute()
        if not profile.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found. Please register.",
            )
        return profile.data[0]
    except Exception as e:
        # Log the error for debugging (in production, use proper logging)
        print(f"Authentication error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed. Please check your credentials.",
        )

def _create_initial_workout_plan(user_profile: dict) -> str:
    """Creates a 7-day workout plan for a freshly registered user."""
    plan_data = {
        "user_profile_id": user_profile["id"],
        "plan_name": f"Plan for {user_profile['goal']}",
        "start_date": datetime.date.today().isoformat(),
        "end_date": (datetime.date.today() + datetime.timedelta(days=6)).isoformat(),
        "is_active": True,
    }
    plan_response = supabase.table("workout_plans").insert(plan_data).execute()
    if not plan_response.data:
        raise HTTPException(status_code=500, detail="Failed to create workout plan")

    plan_id = plan_response.data[0]["id"]

    for day in range(1, 8):
        # Get exercises for user
        answers_dict = {
            "goal": user_profile["goal"],
            "age": user_profile["age"],
            "weight": user_profile["weight"],
            "gender": user_profile["gender"],
            "training_days_per_week": user_profile["training_days_per_week"],
            "training_location": user_profile["training_location"],
            "equipment_details": user_profile.get("equipment_details")
        }
        answers_obj = QuestionnaireAnswers(**answers_dict)
        exercises = get_exercises_for_user(answers_obj, limit=3)
        if not exercises:
            exercises = [
                {"name": "Push-ups", "sets": 3, "reps": 10},
                {"name": "Squats", "sets": 3, "reps": 15},
                {"name": "Plank", "sets": 3, "duration": "30s"},
            ]
        day_data = {
            "workout_plan_id": plan_id,
            "day_number": day,
            "workout_date": (datetime.date.today() + datetime.timedelta(days=day - 1)).isoformat(),
            "exercises": exercises,
            "is_completed": False,
        }
        supabase.table("workout_plan_days").insert(day_data).execute()

    return str(plan_id)

# --- Routes ---

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/generate-workout-preview")
def generate_workout_preview(answers: QuestionnaireAnswers):
    exercises = get_exercises_for_user(answers, limit=3)
    if not exercises:
        # Fallback to hardcoded exercises
        exercises = [
            {"name": "Push-ups", "sets": 3, "reps": 10},
            {"name": "Squats", "sets": 3, "reps": 15},
            {"name": "Plank", "sets": 3, "duration": "30s"}
        ]
    return {
        "day": 1,
        "exercises": exercises
    }

@app.post("/api/auth/login")
def login(request: TokenExchangeRequest):
    """
    Validates a Supabase session token and confirms the user has a profile.
    We don't mint a separate JWT — the validated Supabase access token IS
    the access token the frontend should keep using for subsequent calls.
    """
    user_response = supabase.auth.get_user(request.supabase_access_token)
    if not user_response.user:
        raise HTTPException(status_code=401, detail="Invalid token")

    supabase_user_id = user_response.user.id
    profile = supabase.table("user_profiles").select("id").eq("supabase_user_id", supabase_user_id).execute()
    if not profile.data:
        raise HTTPException(status_code=404, detail="User profile not found. Please register.")

    return {"access_token": request.supabase_access_token}

@app.post("/api/auth/register")
def register(request: RegisterRequest):
    # Validate the Supabase token passed in the body (not an Authorization header —
    # the frontend doesn't have a backend-issued token yet at this point)
    user_response = supabase.auth.get_user(request.supabase_access_token)
    if not user_response.user:
        raise HTTPException(status_code=401, detail="Invalid token")

    supabase_user_id = user_response.user.id

    existing = supabase.table("user_profiles").select("id").eq("supabase_user_id", supabase_user_id).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="User already registered")

    profile_data = {
        "supabase_user_id": supabase_user_id,
        "goal": request.questionnaire.goal,
        "age": request.questionnaire.age,
        "weight": request.questionnaire.weight,
        "gender": request.questionnaire.gender,
        "training_days_per_week": request.questionnaire.training_days_per_week,
        "training_location": request.questionnaire.training_location,
        "equipment_details": request.questionnaire.equipment_details,
        "consent_privacy": request.consent_privacy,
        "consent_terms": request.consent_terms,
    }

    profile_response = supabase.table("user_profiles").insert(profile_data).execute()
    if not profile_response.data:
        raise HTTPException(status_code=500, detail="Failed to create user profile")

    new_profile = profile_response.data[0]

    # Generate the user's first workout plan right away, so the dashboard
    # has something to show immediately after registration.
    _create_initial_workout_plan(new_profile)

    return {"access_token": request.supabase_access_token, "message": "Profile created successfully"}

@app.post("/api/generate-workout-plan")
def generate_workout_plan(answers: QuestionnaireAnswers, current_user: dict = Depends(get_current_user)):
    plan_id = _create_initial_workout_plan(current_user)
    return {"plan_id": plan_id, "message": "Workout plan created"}

@app.get("/api/workout-plans", response_model=List[WorkoutPlanResponse])
def get_workout_plans(current_user: dict = Depends(get_current_user)):
    plans_response = supabase.table("workout_plans").select("*").eq("user_profile_id", current_user["id"]).execute()
    return plans_response.data

@app.get("/api/workout-plan/{plan_id}")
def get_workout_plan(plan_id: str, current_user: dict = Depends(get_current_user)):
    plan_response = supabase.table("workout_plans").select("*").eq("id", plan_id).eq("user_profile_id", current_user["id"]).execute()
    if not plan_response.data:
        raise HTTPException(status_code=404, detail="Workout plan not found")

    days_response = supabase.table("workout_plan_days").select("*").eq("workout_plan_id", plan_id).order("day_number").execute()
    
    return {
        "plan": plan_response.data[0],
        "days": days_response.data
    }

@app.post("/api/workout-logs")
def log_workout(request: WorkoutLogRequest, current_user: dict = Depends(get_current_user)):
    day_response = supabase.table("workout_plan_days").select("id, workout_plan_id").eq("id", request.day_id).execute()
    if not day_response.data:
        raise HTTPException(status_code=404, detail="Workout day not found")

    day = day_response.data[0]
    plan_response = supabase.table("workout_plans").select("id, user_profile_id").eq("id", day["workout_plan_id"]).execute()

    if not plan_response.data or plan_response.data[0]["user_profile_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to log this workout")

    log_data = {
        "user_profile_id": current_user["id"],
        "workout_plan_day_id": request.day_id,
        "notes": request.notes,
    }
    log_response = supabase.table("workout_logs").insert(log_data).execute()

    supabase.table("workout_plan_days").update({
        "is_completed": True,
        "completed_at": datetime.datetime.utcnow().isoformat()
    }).eq("id", request.day_id).execute()

    return {"log_id": log_response.data[0]["id"], "message": "Workout logged"}

@app.get("/api/workout-logs", response_model=List[WorkoutLogResponse])
def get_workout_logs(current_user: dict = Depends(get_current_user)):
    logs_response = supabase.table("workout_logs").select("*").eq("user_profile_id", current_user["id"]).order("completed_at", desc=True).execute()
    return logs_response.data

@app.get("/api/me", response_model=UserProfileResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

@app.delete("/api/account")
def delete_account(current_user: dict = Depends(get_current_user)):
    supabase.table("user_profiles").delete().eq("id", current_user["id"]).execute()
    return {"message": "Account data deleted"}

@app.get("/api/export-data")
def export_data(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    profile = supabase.table("user_profiles").select("*").eq("id", user_id).execute()
    plans = supabase.table("workout_plans").select("*").eq("user_profile_id", user_id).execute()
    
    plan_ids = [p["id"] for p in plans.data] if plans.data else []
    days = supabase.table("workout_plan_days").select("*").in_("workout_plan_id", plan_ids).execute() if plan_ids else {"data": []}
    logs = supabase.table("workout_logs").select("*").eq("user_profile_id", user_id).execute()

    return {
        "profile": profile.data[0] if profile.data else None,
        "plans": plans.data,
        "days": days.data,
        "logs": logs.data
    }