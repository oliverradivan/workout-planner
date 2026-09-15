# Workout Generator App

A full-stack workout/exercise generator application built with:

- **Frontend:** React, Vite, CSS
- **Backend:** Python, FastAPI
- **Database & Auth:** Supabase (PostgreSQL + Supabase Auth)
- **Deployment:** Vercel

## Project Structure

- `front/` - React + Vite web application
- `back/` - FastAPI application
- `api/index.py` - Vercel serverless entry point that imports the FastAPI app
- `vercel.json` - Vercel configuration for building and routing

## Core Flow

1. **Questionnaire First**: Users start with a questionnaire (no account required) to collect:
   - Goal (lose weight, build muscle, general fitness, strength, endurance)
   - Age
   - Weight
   - Gender
   - Number of days per week they want to work out
   - Training location and equipment available

2. **Workout Preview**: After completing the questionnaire, users see a preview of day 1's workout to see the payoff before committing.

3. **Sign Up / Log In**: Users are prompted to create an account to save their plan. Authentication is handled via Supabase Auth, but we issue our own JWTs from the FastAPI backend for session handling.

4. **Workout Generation**: Based on the questionnaire answers, a personalized workout plan is generated (split, day-by-day workouts) using exercises from the Supabase exercise database.

5. **Ongoing Use**: Users can log in daily to see their scheduled workout and mark it as complete.

## Database Schema

The application uses the following Supabase tables:

### exercises
- id (UUID)
- name (TEXT)
- target_muscle_group (TEXT)
- equipment_required (TEXT)
- location_tags (TEXT[])
- difficulty_level (TEXT)
- default_sets (INTEGER)
- default_reps (INTEGER)
- default_duration (TEXT)
- created_at, updated_at

### user_profiles
- id (UUID)
- supabase_user_id (UUID, unique)
- goal (TEXT)
- age (INTEGER)
- weight (DECIMAL)
- gender (TEXT)
- training_days_per_week (INTEGER)
- training_location (TEXT)
- equipment_details (TEXT)
- consent_privacy (BOOLEAN)
- consent_terms (BOOLEAN)
- created_at, updated_at

### workout_plans
- id (UUID)
- user_profile_id (UUID, FK)
- plan_name (TEXT)
- start_date (DATE)
- end_date (DATE)
- is_active (BOOLEAN)
- created_at, updated_at

### workout_plan_days
- id (UUID)
- workout_plan_id (UUID, FK)
- day_number (INTEGER)
- workout_date (DATE)
- exercises (JSONB)
- is_completed (BOOLEAN)
- completed_at (TIMESTAMP)
- created_at, updated_at

### workout_logs
- id (UUID)
- user_profile_id (UUID, FK)
- workout_plan_day_id (UUID, FK)
- completed_at (TIMESTAMP)
- notes (TEXT)
- created_at

## Setup

### Prerequisites

- Node.js (for frontend development)
- Python 3.8+ (for backend development)
- A Supabase project (create your own and get the URL and keys)

### Environment Variables

Create a `.env` file in the `back/` directory:

```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret_key_change_in_production
```

Create a `.env` file in the `front/` directory:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:8000/api
```

### Installation

#### Backend

```bash
cd back
pip install -r requirements.txt
```

#### Frontend

```bash
cd front
npm install
```

### Development

#### Start the backend server

```bash
cd back
uvicorn main:app --reload
```

#### Start the frontend development server

```bash
cd front
npm run dev
```

### Deployment to Vercel

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Set the environment variables in Vercel Settings:
   - `SUPABASE_URL`
   - `SUPABASE_KEY` (anon key)
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
   - (Optional) `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL` for the frontend

Vercel will automatically build the frontend and backend according to `vercel.json`.

## API Endpoints

### Public Endpoints
- `POST /api/generate-workout-preview` - Generate a workout preview (no auth required)
- `POST /api/auth/login` - Exchange Supabase access token for our JWT
- `POST /api/auth/register` - Exchange Supabase access token for our JWT and store questionnaire answers

### Authenticated Endpoints (require our JWT)
- `POST /api/generate-workout-plan` - Generate and save a full workout plan
- `GET /api/workout-plans` - Get user's workout plans
- `GET /api/workout-plan/{plan_id}` - Get a specific workout plan with its days
- `POST /api/workout-logs` - Log a completed workout
- `GET /api/workout-logs` - Get user's workout logs
- `GET /api/me` - Get user profile and questionnaire answers
- `DELETE /api/account` - Delete account data (note: Supabase auth user must be deleted separately)
- `GET /api/export-data` - Export user data

## Frontend Routes

- `/questionnaire` - Questionnaire component (step-by-step form)
- `/preview` - Workout preview after questionnaire
- `/login` - Login page (exchange Supabase token for our JWT)
- `/signup` - Sign up page (exchange Supabase token for our JWT and store questionnaire answers)
- `/workout` - Workout dashboard (shows today's workout and upcoming week)

## Notes

- The frontend uses `import.meta.env.VITE_API_URL` for API calls, falling back to `/api` in development.
- Authentication flow: User signs up/logs in via Supabase Auth, then exchanges the Supabase access token for our JWT issued by the FastAPI backend.
- Our own JWTs are signed with the JWT_SECRET and used for session handling between the frontend and backend.
- The workout generation logic is a placeholder and should be replaced with a proper algorithm based on goal, days/week, equipment, and location.
- The exercise database should be seeded with a variety of exercises for different equipment and locations.

## License

MIT
