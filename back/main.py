import os
from typing import Any, List, Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from dotenv import load_dotenv
import jwt
import datetime
from pydantic import BaseModel

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")  # For frontend, but we may not need it in backend
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("Supabase URL and Service Role Key must be set in environment variables")

# Initialize Supabase client with service role key for backend operations
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

app = FastAPI(title="Workout Generator API")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with ["https://your-app.vercel.app"] in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security scheme
bearer_scheme = HTTPBearer()

# Pydantic models
class QuestionnaireAnswers(BaseModel):
    goal: str
    age: int
    weight: float
    gender: str
    training_days_per_week: int
    training_location: str
    equipment_details: Optional[str] = None

class UserProfileResponse(BaseModel):
    id: str
    goal: str
    age: int
    weight: float
    gender: str
    training_days_per_week: int
    training_location: str
    equipment_details: Optional[str]
    consent_privacy: bool
    consent_terms: bool

class WorkoutPlanResponse(BaseModel):
    id: str
    plan_name: str
    start_date: str
    end_date: Optional[str]
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
    notes: Optional[str]

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class LoginRequest(BaseModel):
    supabase_access_token: str

class RegisterRequest(BaseModel):
    supabase_access_token: str
    questionnaire: QuestionnaireAnswers
    consent_privacy: bool
    consent_terms: bool

# Helper functions
def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_supabase_token(token: str) -> dict:
    """Verify Supabase token and return user data."""
    try:
        # Use Supabase to get user from token
        user_response = supabase.auth.get_user(token)
        user = user_response.user
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Supabase token",
            )
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Supabase token: {str(e)}",
        )

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> dict:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )
        # Fetch user profile from Supabase
        user_response = supabase.table("user_profiles").select("*").eq("supabase_user_id", user_id).single().execute()
        if not user_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found",
            )
        return user_response.data
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

# Health check endpoint
@app.get("/api/health")
def health_check():
    return {"status": "ok"}

# Public endpoint: generate workout preview (no auth)
@app.post("/api/generate-workout-preview")
def generate_workout_preview(answers: QuestionnaireAnswers):
    # In a real app, we would generate a workout plan based on answers and return day 1
    # For now, return a dummy preview
    preview = {
        "day": 1,
        "exercises": [
            {"name": "Push-ups", "sets": 3, "reps": 10},
            {"name": "Squats", "sets": 3, "reps": 15},
            {"name": "Plank", "sets": 3, "duration": "30s"}
        ]
    }
    return preview

# Public endpoint: register (exchange Supabase token for our JWT and store questionnaire)
@app.post("/api/auth/register", response_model=TokenResponse)
def register(request: RegisterRequest):
    # Verify Supabase token
    supabase_user = verify_supabase_token(request.supabase_access_token)
    supabase_user_id = supabase_user.id

    # Check if user profile already exists
    existing = supabase.table("user_profiles").select("id").eq("supabase_user_id", supabase_user_id).execute()
    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already registered",
        )

    # Insert user profile
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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user profile",
        )
    user_id = profile_response.data[0]["id"]

    # Create our own JWT
    access_token = create_access_token(
        data={"sub": str(user_id)},
        expires_delta=datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Public endpoint: login (exchange Supabase token for our JWT)
@app.post("/api/auth/login", response_model=TokenResponse)
def login(request: LoginRequest):
    # Verify Supabase token
    supabase_user = verify_supabase_token(request.supabase_access_token)
    supabase_user_id = supabase_user.id

    # Fetch user profile
    profile_response = supabase.table("user_profiles").select("id").eq("supabase_user_id", supabase_user_id).single().execute()
    if not profile_response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found. Please register first.",
        )
    user_id = profile_response.data["id"]

    # Create our own JWT
    access_token = create_access_token(
        data={"sub": str(user_id)},
        expires_delta=datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Authenticated endpoint: generate and save full workout plan
@app.post("/api/generate-workout-plan")
def generate_workout_plan(answers: QuestionnaireAnswers, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    # In a real app, generate a workout plan based on answers and user's equipment/location
    # For now, create a dummy plan
    plan_data = {
        "user_profile_id": user_id,
        "plan_name": f"Plan for {current_user['goal']}",
        "start_date": datetime.date.today().isoformat(),
        "end_date": (datetime.date.today() + datetime.timedelta(days=6)).isoformat(),
        "is_active": True
    }
    plan_response = supabase.table("workout_plans").insert(plan_data).execute()
    if not plan_response.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create workout plan",
        )
    plan_id = plan_response.data[0]["id"]

    # Create workout plan days (dummy data for 7 days)
    for day in range(1, 8):
        day_data = {
            "workout_plan_id": plan_id,
            "day_number": day,
            "workout_date": (datetime.date.today() + datetime.timedelta(days=day-1)).isoformat(),
            "exercises": [
                {"name": "Push-ups", "sets": 3, "reps": 10},
                {"name": "Squats", "sets": 3, "reps": 15},
                {"name": "Plank", "sets": 3, "duration": "30s"}
            ],
            "is_completed": False
        }
        supabase.table("workout_plan_days").insert(day_data).execute()

    return {"plan_id": str(plan_id), "message": "Workout plan created"}

# Authenticated endpoint: get user's workout plans
@app.get("/api/workout-plans", response_model=List[WorkoutPlanResponse])
def get_workout_plans(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    plans_response = supabase.table("workout_plans").select("*").eq("user_profile_id", user_id).execute()
    return plans_response.data

# Authenticated endpoint: get a specific workout plan with its days
@app.get("/api/workout-plan/{plan_id}")
def get_workout_plan(plan_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    # Verify the plan belongs to the user
    plan_response = supabase.table("workout_plans").select("*").eq("id", plan_id).eq("user_profile_id", user_id).single().execute()
    if not plan_response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout plan not found",
        )
    plan = plan_response.data

    # Get the days for this plan
    days_response = supabase.table("workout_plan_days").select("*").eq("workout_plan_id", plan_id).order("day_number").execute()
    days = days_response.data

    return {
        "plan": plan,
        "days": days
    }

# Authenticated endpoint: log a completed workout
@app.post("/api/workout-logs")
def log_workout(day_id: str, notes: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    # Verify the day belongs to the user's plan
    day_response = supabase.table("workout_plan_days").select("id, workout_plan_id").eq("id", day_id).single().execute()
    if not day_response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout day not found",
        )
    day = day_response.data
    # Get the workout plan to verify user ownership
    plan_response = supabase.table("workout_plans").select("id, user_profile_id").eq("id", day["workout_plan_id"]).single().execute()
    if not plan_response.data or plan_response.data["user_profile_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to log this workout",
        )

    # Insert log
    log_data = {
        "user_profile_id": user_id,
        "workout_plan_day_id": day_id,
        "notes": notes
    }
    log_response = supabase.table("workout_logs").insert(log_data).execute()
    if not log_response.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to log workout",
        )

    # Mark the day as completed
    supabase.table("workout_plan_days").update({"is_completed": True, "completed_at": datetime.datetime.utcnow().isoformat()}).eq("id", day_id).execute()

    return {"log_id": log_response.data[0]["id"], "message": "Workout logged"}

# Authenticated endpoint: get user's workout logs
@app.get("/api/workout-logs", response_model=List[WorkoutLogResponse])
def get_workout_logs(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    logs_response = supabase.table("workout_logs").select("*").eq("user_profile_id", user_id).order("completed_at", desc=True).execute()
    return logs_response.data

# Authenticated endpoint: get user profile
@app.get("/api/me", response_model=UserProfileResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

# Authenticated endpoint: delete account and data
@app.delete("/api/account")
def delete_account(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    # Delete user profile (cascade will delete related data)
    supabase.table("user_profiles").delete().eq("id", user_id).execute()
    # Note: We cannot delete the Supabase auth user from here; that must be done via Supabase API or frontend.
    # For simplicity, we just delete our profile data.
    return {"message": "Account data deleted"}

# Authenticated endpoint: export user data
@app.get("/api/export-data")
def export_data(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    # Fetch all related data
    profile = supabase.table("user_profiles").select("*").eq("id", user_id).single().execute()
    plans = supabase.table("workout_plans").select("*").eq("user_profile_id", user_id).execute()
    days = supabase.table("workout_plan_days").select("*").eq("workout_plan_id", eq="id").in_("workout_plan_id", [p["id"] for p in plans.data]) if plans.data else []
    logs = supabase.table("workout_logs").select("*").eq("user_profile_id", user_id).execute()

    return {
        "profile": profile.data,
        "plans": plans.data,
        "days": days.data if plans.data else [],
        "logs": logs.data
    }

# For Vercel serverless function, we need to expose the app
# The api/index.py will import this app
