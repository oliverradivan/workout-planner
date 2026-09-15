# Workout Planner App

A cross-platform workout/exercise generator app built with React Native Web (frontend) and FastAPI (backend), using Supabase for authentication and database.

## Tech Stack

- **Frontend:** React Native Web (built with Vite)
- **Backend:** Python, FastAPI
- **Database & Auth:** Supabase (Postgres + Supabase Auth)
- **Deployment:** Vercel

## Project Structure

```
workout planner/
├── front/                 # React Native Web app
├── back/                  # FastAPI app
├── api/                   # Vercel entry point
├── vercel.json            # Vercel configuration
├── database_schema.sql    # Supabase database schema
├── seed_exercises.sql     # Sample exercise data
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- Python (v3.8+)
- Supabase account (create a project at [supabase.com](https://supabase.com))

### Environment Variables

Create a `.env` file in the root directory (or set them in your Vercel project settings):

```
# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key

# JWT
JWT_SECRET_KEY=your_jwt_secret_key

# Optional: API URL for frontend (used in development)
VITE_API_URL=http://localhost:8000/api
```

### Local Development

#### Backend

1. Navigate to the `back/` directory:
   ```bash
   cd back
   ```

2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Create a `requirements.txt` file in `back/` with:
   ```
   fastapi
   uvicorn
   supabase
   pyjwt
   ```

4. Run the backend server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

#### Frontend

1. Navigate to the `front/` directory:
   ```bash
   cd front
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. The frontend will be available at `http://localhost:5173` (or another port shown in the terminal).

### Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com).

2. Copy the project URL and service role key to your `.env` file.

3. Run the SQL commands in `database_schema.sql` to create the necessary tables.
   You can do this via the Supabase SQL editor or using the `supabase` CLI.

4. Run the SQL commands in `seed_exercises.sql` to populate the exercises table.

### Deployment to Vercel

1. Install the Vercel CLI (if you haven't already):
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. From the root directory, deploy:
   ```bash
   vercel
   ```

4. During setup, make sure to set the environment variables in the Vercel project settings.

### API Endpoints

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/exercises` - Get exercises (with optional filters)
- `POST /api/workouts/generate` - Generate a workout plan
- `GET /api/workouts/today` - Get today's workout
- `GET /api/health` - Health check

## Features

1. **Onboarding Questionnaire**: Users answer questions about their goals, age, weight, gender, workout frequency, and equipment/location.
2. **Workout Preview**: After completing the questionnaire, users see a preview of their workout plan.
3. **Account Creation**: Users can sign up to save their plan (email/password auth via Supabase).
4. **Personalized Workout Generation**: Based on questionnaire answers, the app generates a workout split and day-by-day exercises.
5. **Workout Tracking**: Users can view today's workout, mark it as complete, and see their weekly schedule.
6. **Exercise Database**: Backend-owned exercise database with filtering by equipment, location, muscle group, and difficulty.
7. **GDPR/CCPA Compliance**: Designed with data minimization, user consent, and data export/deletion capabilities.

## Notes

- The frontend uses environment variable `VITE_API_URL` to communicate with the backend.
- In production, ensure CORS is properly configured in `back/main.py`.
- Passwords are handled securely via Supabase Auth (hashed with bcrypt).
- JWT tokens are issued by the FastAPI backend for session management.
- The app is structured for Vercel deployment with separate frontend and backend builds.

## License

MIT