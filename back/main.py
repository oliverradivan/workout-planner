import os
from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
import jwt
from datetime import datetime, timedelta
from typing import Optional, List
from pydantic import BaseModel
import hashlib
import secrets

# Initialize Supabase client
supabase_url: str = os.getenv("SUPABASE_URL")
supabase_service_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(supabase_url, supabase_service_key)

# JWT settings
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

app = FastAPI(title="Workout Planner API")

# CORS middleware - adjust origins as needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Pydantic models
class UserSignup(BaseModel):
    email: str
    password: str
    username: Optional[str] = None
    agreeToTerms: bool
    agreeToPrivacy: bool
    questionnaireData: dict

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class ExerciseBase(BaseModel):
    name: str
    target_muscle_group: str
    equipment_required: str
    location_tags: List[str]
    difficulty: str
    default_sets: int
    default_reps: str

class ExerciseCreate(ExerciseBase):
    pass

class Exercise(ExerciseBase):
    id: int

    class Config:
        orm_mode = True

class WorkoutGenerate(BaseModel):
    goal: str
    age: int
    weight: float
    gender: str
    days_per_week: int
    location: str
    equipment: Optional[str] = None

class WorkoutDay(BaseModel):
    day: int
    date: str
    workout_name: str
    exercises: List[dict]

class WorkoutPlanResponse(BaseModel):
    plan_id: int
    plan: List[WorkoutDay]

class WorkoutLogCreate(BaseModel):
    workout_plan_id: int
    day_date: str  # YYYY-MM-DD
    completed: bool = False
    notes: Optional[str] = None

class WorkoutLog(BaseModel):
    id: int
    user_id: str
    workout_plan_id: int
    day_date: str
    completed: bool
    completed_at: Optional[str] = None
    notes: Optional[str] = None
    created_at: str

# Helper functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        # Check token type
        if payload.get("type") == "refresh":
            raise HTTPException(status_code=401, detail="Cannot use refresh token for access")
        # Optionally, we can also include user_id in the token
        user_id: str = payload.get("user_id")
        if user_id is None:
            # If not in token, we'll fetch from email (less efficient)
            user_response = supabase.auth.admin.get_user_by_email(email)
            user_id = user_response.user.id
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    return {"email": email, "user_id": user_id}

async def get_current_user_from_refresh_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    return {"email": email}

# Routes
@app.post("/auth/signup", response_model=Token)
async def signup(user: UserSignup):
    # Check agreement
    if not user.agreeToTerms or not user.agreeToPrivacy:
        raise HTTPException(status_code=400, detail="Must agree to terms and privacy")
    
    # Create user in Supabase Auth
    try:
        auth_response = supabase.auth.sign_up({
            "email": user.email,
            "password": user.password,
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Get the user id from the auth response
    user_id = auth_response.user.id
    
    # Create access and refresh tokens
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user_id}, expires_delta=access_token_expires
    )
    
    refresh_token = create_refresh_token(
        data={"sub": user.email, "user_id": user_id}, expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    )
    
    # Store hashed refresh token in database
    hashed_token = hash_refresh_token(refresh_token)
    supabase.table("refresh_tokens").insert({
        "hashed_token": hashed_token,
        "user_id": user_id,
        "expires_at": (datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)).isoformat()
    }).execute()
    
    # Store questionnaire data linked to the user
    supabase.table("questionnaires").insert({
        "user_id": user_id,
        **user.questionnaireData
    }).execute()
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@app.post("/auth/login", response_model=Token)
async def login(user: UserLogin):
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": user.email,
            "password": user.password,
        })
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Get the user id from the auth response
    user_id = auth_response.user.id
    
    # Create access and refresh tokens
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user_id}, expires_delta=access_token_expires
    )
    
    refresh_token = create_refresh_token(
        data={"sub": user.email, "user_id": user_id}, expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    )
    
    # Store hashed refresh token in database
    hashed_token = hash_refresh_token(refresh_token)
    supabase.table("refresh_tokens").insert({
        "hashed_token": hashed_token,
        "user_id": user_id,
        "expires_at": (datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)).isoformat()
    }).execute()
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@app.post("/auth/refresh", response_model=Token)
async def refresh_token(request: RefreshTokenRequest):
    # Validate the refresh token
    user_data = await get_current_user_from_refresh_token(request.refresh_token)
    
    # Check if the token exists in the database and is not expired
    hashed_token = hash_refresh_token(request.refresh_token)
    token_record = supabase.table("refresh_tokens").select("*").eq("hashed_token", hashed_token).execute()
    
    if not token_record.data:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    token_data = token_record.data[0]
    if datetime.fromisoformat(token_data["expires_at"]) < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Refresh token expired")
    
    # Create new access and refresh tokens
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    new_access_token = create_access_token(
        data={"sub": user_data["email"], "user_id": user_data.get("user_id")}, expires_delta=access_token_expires
    )
    
    new_refresh_token = create_refresh_token(
        data={"sub": user_data["email"], "user_id": user_data.get("user_id")}, expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    )
    
    # Update the refresh token in database (rotate tokens)
    new_hashed_token = hash_refresh_token(new_refresh_token)
    supabase.table("refresh_tokens").update({
        "hashed_token": new_hashed_token,
        "expires_at": (datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)).isoformat()
    }).eq("id", token_data["id"]).execute()
    
    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }

# Exercise endpoints
@app.get("/exercises", response_model=List[Exercise])
async def get_exercises(
    equipment: Optional[str] = None,
    location: Optional[str] = None,
    target_muscle_group: Optional[str] = None,
    difficulty: Optional[str] = None,
):
    query = supabase.table("exercises").select("*")
    if equipment:
        query = query.filter("equipment_required", "eq", equipment)
    if location:
        # Assuming location_tags is a array of strings, we need to check if location is in the array
        # Supabase has contains filter for arrays
        query = query.contains("location_tags", [location])
    if target_muscle_group:
        query = query.filter("target_muscle_group", "eq", target_muscle_group)
    if difficulty:
        query = query.filter("difficulty", "eq", difficulty)
    
    response = query.execute()
    return response.data

@app.post("/exercises", response_model=Exercise)
async def create_exercise(exercise: ExerciseCreate, current_user: dict = Depends(get_current_user)):
    # In a real app, you might want to restrict this to admins
    response = supabase.table("exercises").insert(exercise.dict()).execute()
    return response.data[0]

# Workout generation endpoint with actual algorithm
@app.post("/workouts/generate", response_model=WorkoutPlanResponse)
async def generate_workout_plan(workout_data: WorkoutGenerate, current_user: dict = Depends(get_current_user)):
    user_id = current_user["user_id"]
    
    # Determine location filter
    location_filter = workout_data.location
    # Adjust location filter for home_equipment to also consider equipment
    if workout_data.location == "home_equipment":
        # We'll treat home_equipment as home location but also filter by equipment if provided
        location_filter = "home"
    
    # Build exercise query
    query = supabase.table("exercises").select("*")
    
    # Filter by location
    query = query.contains("location_tags", [location_filter])
    
    # If equipment is specified for home_equipment, we need to filter by equipment as well
    if workout_data.location == "home_equipment" and workout_data.equipment:
        # We'll check if the equipment required contains any of the user's equipment
        # This is a simplification; in reality, we'd want to match more precisely
        user_equipment = [e.strip().lower() for e in workout_data.equipment.split(",")]
        # We'll get all exercises and then filter in memory for simplicity
        # For a production app, we'd want to do this in the database with text search
        all_exercises = query.execute().data
        filtered_exercises = []
        for ex in all_exercises:
            # Check if any of the user's equipment is in the exercise's equipment_required (case insensitive)
            if any(eq in ex["equipment_required"].lower() for eq in user_equipment):
                filtered_exercises.append(ex)
        available_exercises = filtered_exercises
    else:
        available_exercises = query.execute().data
    
    # If no exercises found, fall back to a broader search
    if not available_exercises:
        # Try without location filter
        query = supabase.table("exercises").select("*")
        if workout_data.location == "home_equipment" and workout_data.equipment:
            user_equipment = [e.strip().lower() for e in workout_data.equipment.split(",")]
            all_exercises = query.execute().data
            filtered_exercises = []
            for ex in all_exercises:
                if any(eq in ex["equipment_required"].lower() for eq in user_equipment):
                    filtered_exercises.append(ex)
            available_exercises = filtered_exercises
        else:
            available_exercises = query.execute().data
    
    # If still no exercises, we'll use a default set (should not happen with seed data)
    if not available_exercises:
        available_exercises = [
            {"name": "Push-ups", "target_muscle_group": "chest", "equipment_required": "none", 
             "location_tags": ["home", "park"], "difficulty": "beginner", "default_sets": 3, "default_reps": "10-15"},
            {"name": "Squats", "target_muscle_group": "legs", "equipment_required": "none", 
             "location_tags": ["home", "gym", "park"], "difficulty": "beginner", "default_sets": 3, "default_reps": "12-20"},
            {"name": "Plank", "target_muscle_group": "core", "equipment_required": "none", 
             "location_tags": ["home", "gym", "park"], "difficulty": "beginner", "default_sets": 3, "default_reps": "30-60s"}
        ]
    
    # Determine workout split based on goal and days per week
    goal = workout_data.goal.lower()
    days_per_week = workout_data.days_per_week
    
    # Define splits
    splits = {
        "lose weight": {
            1: ["full_body"],
            2: ["upper_body", "lower_body"],
            3: ["full_body", "upper_body", "lower_body"],
            4: ["upper_body", "lower_body", "upper_body", "lower_body"],
            5: ["full_body", "upper_body", "lower_body", "upper_body", "lower_body"],
            6: ["push", "pull", "legs", "push", "pull", "legs"],
            7: ["push", "pull", "legs", "push", "pull", "legs", "full_body"]
        },
        "build muscle": {
            1: ["full_body"],
            2: ["upper_body", "lower_body"],
            3: ["push", "pull", "legs"],
            4: ["upper_body", "lower_body", "upper_body", "lower_body"],
            5: ["push", "pull", "legs", "push", "pull"],
            6: ["push", "pull", "legs", "push", "pull", "legs"],
            7: ["push", "pull", "legs", "push", "pull", "legs", "full_body"]
        },
        "general fitness": {
            1: ["full_body"],
            2: ["upper_body", "lower_body"],
            3: ["full_body", "upper_body", "lower_body"],
            4: ["upper_body", "lower_body", "upper_body", "lower_body"],
            5: ["full_body", "upper_body", "lower_body", "upper_body", "lower_body"],
            6: ["push", "pull", "legs", "push", "pull", "legs"],
            7: ["push", "pull", "legs", "push", "pull", "legs", "full_body"]
        },
        "strength": {
            1: ["full_body"],
            2: ["upper_body", "lower_body"],
            3: ["push", "pull", "legs"],
            4: ["upper_body", "lower_body", "upper_body", "lower_body"],
            5: ["push", "pull", "legs", "push", "pull"],
            6: ["push", "pull", "legs", "push", "pull", "legs"],
            7: ["push", "pull", "legs", "push", "pull", "legs", "full_body"]
        },
        "endurance": {
            1: ["full_body"],
            2: ["upper_body", "lower_body"],
            3: ["full_body", "upper_body", "lower_body"],
            4: ["upper_body", "lower_body", "upper_body", "lower_body"],
            5: ["full_body", "upper_body", "lower_body", "upper_body", "lower_body"],
            6: ["push", "pull", "legs", "push", "pull", "legs"],
            7: ["push", "pull", "legs", "push", "pull", "legs", "full_body"]
        }
    }
    
    # Default to general fitness if goal not found
    goal_splits = splits.get(goal, splits["general fitness"])
    # Default to 3 day split if days not found
    weekly_split = goal_splits.get(days_per_week, goal_splits[3])
    
    # Map split types to muscle groups
    split_to_muscle_groups = {
        "full_body": ["chest", "back", "legs", "shoulders", "arms", "core"],
        "upper_body": ["chest", "back", "shoulders", "arms"],
        "lower_body": ["legs", "glutes"],
        "push": ["chest", "shoulders", "triceps"],
        "pull": ["back", "biceps"],
        "legs": ["quads", "hamstrings", "glutes", "calves"]
    }
    
    # Generate plan for each day
    plan = []
    start_date = datetime.utcnow()
    
    for week in range(1, 5):  # Generate 4 weeks of workouts
        for day_index, split_type in enumerate(weekly_split):
            day_num = (week - 1) * len(weekly_split) + day_index + 1
            date = (start_date + timedelta(days=day_num-1)).strftime("%Y-%m-%d")
            
            # Get target muscle groups for this split
            muscle_groups = split_to_muscle_groups.get(split_type, ["full_body"])
            
            # Filter exercises by muscle group
            day_exercises = []
            for mg in muscle_groups:
                mg_exercises = [ex for ex in available_exercises if mg in ex["target_muscle_group"].lower()]
                day_exercises.extend(mg_exercises)
            
            # Remove duplicates (based on name)
            seen = set()
            unique_exercises = []
            for ex in day_exercises:
                if ex["name"] not in seen:
                    seen.add(ex["name"])
                    unique_exercises.append(ex)
            
            # Select exercises for the day (aim for 3-5 exercises)
            num_exercises = min(len(unique_exercises), 5)
            if num_exercises == 0:
                # Fallback to any available exercises
                selected_exercises = available_exercises[:3]
            else:
                # We'll try to select a variety; for simplicity, we'll take the first few
                selected_exercises = unique_exercises[:num_exercises]
            
            # Format exercises for the response
            formatted_exercises = []
            for ex in selected_exercises:
                formatted_exercises.append({
                    "name": ex["name"],
                    "sets": ex["default_sets"],
                    "reps": ex["default_reps"]
                })
            
            # Determine workout name based on split and day
            workout_name_map = {
                "full_body": "Full Body",
                "upper_body": "Upper Body",
                "lower_body": "Lower Body",
                "push": "Push",
                "pull": "Pull",
                "legs": "Legs"
            }
            base_name = workout_name_map.get(split_type, split_type.capitalize())
            if len(weekly_split) > 1:
                workout_name = f"{base_name} {day_index + 1}"
            else:
                workout_name = base_name
            
            plan.append({
                "day": day_num,
                "date": date,
                "workout_name": workout_name,
                "exercises": formatted_exercises
            })
    
    # Save the generated plan to the database
    plan_response = supabase.table("workout_plans").insert({
        "user_id": user_id,
        "plan_data": plan  # Store the entire plan as JSONB
    }).execute()
    
    plan_id = plan_response.data[0]["id"]
    
    # Limit to 4 weeks (28 days max) but we'll return what we generated
    return {
        "plan_id": plan_id,
        "plan": plan
    }

# New endpoint to get a workout by date for a given plan
@app.get("/workouts/by-date")
async def get_workout_by_date(plan_id: int, date: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["user_id"]
    
    # Verify the workout plan belongs to the user
    plan_response = supabase.table("workout_plans").select("*").eq("id", plan_id).eq("user_id", user_id).execute()
    if not plan_response.data:
        raise HTTPException(status_code=404, detail="Workout plan not found or access denied")
    
    plan_data = plan_response.data[0]["plan_data"]
    
    # Find the workout for the given date
    workout = None
    for day_plan in plan_data:
        if day_plan["date"] == date:
            workout = day_plan
            break
    
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found for the given date")
    
    return workout

# Workout tracking endpoints
@app.post("/workouts/log", response_model=WorkoutLog)
async def log_workout(log: WorkoutLogCreate, current_user: dict = Depends(get_current_user)):
    user_id = current_user["user_id"]
    
    # Check if the workout plan exists and belongs to the user
    plan_response = supabase.table("workout_plans").select("*").eq("id", log.workout_plan_id).eq("user_id", user_id).execute()
    if not plan_response.data:
        raise HTTPException(status_code=404, detail="Workout plan not found or access denied")
    
    # Check if a log already exists for this day and plan
    existing_log = supabase.table("workout_logs").select("*").eq("workout_plan_id", log.workout_plan_id).eq("day_date", log.day_date).execute()
    if existing_log.data:
        # Update existing log
        update_data = {
            "completed": log.completed,
            "completed_at": datetime.utcnow().isoformat() if log.completed else None,
            "notes": log.notes
        }
        response = supabase.table("workout_logs").update(update_data).eq("id", existing_log.data[0]["id"]).execute()
        return response.data[0]
    else:
        # Create new log
        new_log = {
            "user_id": user_id,
            "workout_plan_id": log.workout_plan_id,
            "day_date": log.day_date,
            "completed": log.completed,
            "completed_at": datetime.utcnow().isoformat() if log.completed else None,
            "notes": log.notes
        }
        response = supabase.table("workout_logs").insert(new_log).execute()
        return response.data[0]

@app.get("/workouts/logs/{workout_plan_id}", response_model=List[WorkoutLog])
async def get_workout_logs(workout_plan_id: int, current_user: dict = Depends(get_current_user)):
    user_id = current_user["user_id"]
    
    # Verify the workout plan belongs to the user
    plan_response = supabase.table("workout_plans").select("*").eq("id", workout_plan_id).eq("user_id", user_id).execute()
    if not plan_response.data:
        raise HTTPException(status_code=404, detail="Workout plan not found or access denied")
    
    # Get logs
    response = supabase.table("workout_logs").select("*").eq("workout_plan_id", workout_plan_id).order("day_date").execute()
    return response.data

# GDPR compliance endpoints
@app.get("/user/export-data")
async def export_user_data(current_user: dict = Depends(get_current_user)):
    user_id = current_user["user_id"]
    
    # Collect all user data
    user_data = {}
    
    # Get user's questionnaire
    questionnaire_response = supabase.table("questionnaires").select("*").eq("user_id", user_id).execute()
    user_data["questionnaire"] = questionnaire_response.data
    
    # Get user's workout plans
    plans_response = supabase.table("workout_plans").select("*").eq("user_id", user_id).execute()
    user_data["workout_plans"] = plans_response.data
    
    # Get user's workout logs
    logs_response = supabase.table("workout_logs").select("*").eq("user_id", user_id).execute()
    user_data["workout_logs"] = logs_response.data
    
    # Get user's refresh tokens (hashed, for security we don't expose the actual tokens)
    tokens_response = supabase.table("refresh_tokens").select("id, created_at, expires_at").eq("user_id", user_id).execute()
    user_data["refresh_tokens"] = tokens_response.data
    
    return user_data

@app.delete("/user/delete-account")
async def delete_user_account(current_user: dict = Depends(get_current_user)):
    user_id = current_user["user_id"]
    
    # Delete user data in reverse order of foreign key dependencies
    # Delete workout logs
    supabase.table("workout_logs").delete().eq("user_id", user_id).execute()
    # Delete workout plans
    supabase.table("workout_plans").delete().eq("user_id", user_id).execute()
    # Delete questionnaires
    supabase.table("questionnaires").delete().eq("user_id", user_id).execute()
    # Delete refresh tokens
    supabase.table("refresh_tokens").delete().eq("user_id", user_id).execute()
    
    # Delete the user from Supabase Auth
    supabase.auth.admin.delete_user(user_id)
    
    return {"message": "Account deleted successfully"}

# Health check
@app.get("/health")
async def health_check():
    return {"status": "ok"}