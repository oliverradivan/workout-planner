import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables from .env file (for local development)
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")  # This is the anon key for client-side
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # For backend

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("Supabase URL and Service Role Key must be set in environment variables")

# Initialize Supabase client with service role key for backend operations
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

app = FastAPI(title="Workout Generator API")

# Security scheme
bearer_scheme = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    token = credentials.credentials
    try:
        # Verify the JWT token with Supabase
        user_response = supabase.auth.get_user(token)
        user = user_response.user
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Example workout generation endpoint (placeholder)
@app.post("/api/generate-workout")
async def generate_workout(
    muscle_group: str = "full body",
    difficulty: str = "medium",
    equipment: str = "bodyweight",
    current_user: dict = Depends(get_current_user)
):
    # In a real app, we would generate a workout based on parameters and user history
    # For now, return a dummy workout
    workout = {
        "user_id": current_user.id,
        "muscle_group": muscle_group,
        "difficulty": difficulty,
        "equipment": equipment,
        "exercises": [
            {"name": "Push-ups", "sets": 3, "reps": 10},
            {"name": "Squats", "sets": 3, "reps": 15},
            {"name": "Plank", "sets": 3, "duration": "30s"}
        ]
    }
    # Optionally save to database
    # supabase.table("workouts").insert(workout).execute()
    return workout

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

# For Vercel serverless function, we need to expose the app
# The api/index.py will import this app