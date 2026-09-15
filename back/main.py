import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
import jwt
from datetime import datetime, timedelta
from typing import Optional, List
from pydantic import BaseModel

# Initialize Supabase client
supabase_url: str = os.getenv("SUPABASE_URL")
supabase_service_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(supabase_url, supabase_service_key)

# JWT settings
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

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
    token_type: str

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

# Helper functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    # Optionally fetch user from Supabase to verify
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
    
    # If email confirmation is not required, we can proceed
    # Create a profile in our custom table (e.g., public.profiles)
    # For now, we'll just return a token from our own JWT
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    # Store questionnaire data linked to the user (we need to get the user id from auth_response)
    user_id = auth_response.user.id
    # Insert questionnaire data into a table (e.g., public.questionnaires)
    # We'll skip for brevity but should be implemented
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/login", response_model=Token)
async def login(user: UserLogin):
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": user.email,
            "password": user.password,
        })
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

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

# Workout generation endpoint
@app.post("/workouts/generate")
async def generate_workout_plan(workout_data: WorkoutGenerate, current_user: dict = Depends(get_current_user)):
    # This is a simplified version - in reality, you'd have a complex algorithm
    # For now, we'll return a mock plan based on days_per_week
    # We'll fetch exercises from the database based on location and equipment
    
    # Determine location filter
    location_filter = workout_data.location
    if workout_data.location == "home_equipment":
        location_filter = "home"  # We'll assume home equipment is still home location
        # We might need to adjust the query to also consider equipment
    
    # Fetch exercises
    exercises_response = supabase.table("exercises").select("*").contains("location_tags", [location_filter]).execute()
    available_exercises = exercises_response.data
    
    # Very simple mock generation
    plan = []
    for day in range(1, workout_data.days_per_week + 1):
        # Pick some exercises (this is where the real logic would go)
        day_exercises = []
        if available_exercises:
            # Just take first 3 for demo
            for ex in available_exercises[:3]:
                day_exercises.append({
                    "name": ex["name"],
                    "sets": ex["default_sets"],
                    "reps": ex["default_reps"]
                })
        plan.append({
            "day": day,
            "date": f"2024-01-{10 + day}",  # dummy date
            "workout_name": f"Day {day} Workout",
            "exercises": day_exercises
        })
    
    return plan

# Get today's workout (simplified)
@app.get("/workouts/today")
async def get_today_workout(current_user: dict = Depends(get_current_user)):
    # In reality, you'd calculate based on the user's plan and current date
    return {
        "day": 1,
        "date": "2024-01-15",
        "workout_name": "Full Body A",
        "exercises": [
            {"name": "Push-ups", "sets": 3, "reps": "10-15"},
            {"name": "Squats", "sets": 3, "reps": "12-20"},
            {"name": "Plank", "sets": 3, "reps": "30-60s"}
        ]
    }

# Health check
@app.get("/health")
async def health_check():
    return {"status": "ok"}