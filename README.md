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

## Setup

### Prerequisites

- Node.js (for frontend development)
- Python 3.8+ (for backend development)
- A Supabase project (create your own and get the URL and keys)

### Environment Variables

Create a `.env` file in the `back/` directory:

```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
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
   - `SUPABASE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - (Optional) `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL` for the frontend (if not set, the frontend will use the defaults from `front/.env` but note that Vercel will override with its own env vars if set).

Vercel will automatically build the frontend and backend according to `vercel.json`.

## API Endpoints

- `POST /api/generate-workout` - Generate a workout (requires authentication)
- `GET /api/health` - Health check

## Frontend Routes

- `/login` - Login page
- `/workout` - Workout generator page (protected)

## Notes

- The frontend uses `import.meta.env.VITE_API_URL` for API calls, falling back to `/api` in production.
- Authentication is handled via Supabase Auth. The frontend stores the access token in localStorage and sends it as a Bearer token in the Authorization header.
- The backend verifies the token with Supabase using the service role key.

## License

MIT