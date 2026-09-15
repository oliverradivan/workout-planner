-- Create exercises table
CREATE TABLE IF NOT EXISTS public.exercises (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    target_muscle_group VARCHAR(100),
    equipment_required VARCHAR(100),
    location_tags TEXT[], -- Array of strings: e.g., ['home', 'gym', 'park']
    difficulty VARCHAR(50), -- beginner, intermediate, advanced
    default_sets INTEGER,
    default_reps VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create questionnaires table to store onboarding data
CREATE TABLE IF NOT EXISTS public.questionnaires (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    goal VARCHAR(100),
    age INTEGER,
    weight DECIMAL(5,2),
    gender VARCHAR(50),
    days_per_week INTEGER,
    location VARCHAR(100), -- e.g., home_bodyweight, home_equipment, gym, park
    equipment TEXT, -- for home_equipment, list of equipment
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create workout_plans table to store generated plans
CREATE TABLE IF NOT EXISTS public.workout_plans (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    plan_data JSONB, -- Stores the entire plan (weeks, days, exercises)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create workout_logs table to track completed workouts
CREATE TABLE IF NOT EXISTS public.workout_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    workout_plan_id INTEGER REFERENCES public.workout_plans(id),
    day_date DATE, -- The date the workout was done
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable row level security for all tables (optional but recommended)
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (example: users can only see their own data)
CREATE POLICY "Users can view their own questionnaires" ON public.questionnaires
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own questionnaires" ON public.questionnaires
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questionnaires" ON public.questionnaires
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own workout plans" ON public.workout_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout plans" ON public.workout_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own workout logs" ON public.workout_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout logs" ON public.workout_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Exercises can be viewed by everyone (since they are public data)
CREATE POLICY "Anyone can view exercises" ON public.exercises
    FOR SELECT USING (true);

-- Only service role or admins can modify exercises (we'll leave this to be defined by the app's logic)
-- For simplicity, we'll allow authenticated users to insert exercises (but in production, restrict to admins)
CREATE POLICY "Authenticated users can insert exercises" ON public.exercises
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');