-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    target_muscle_group TEXT NOT NULL, -- e.g., push, pull, legs, core, full body
    equipment_required TEXT NOT NULL, -- e.g., none/bodyweight, dumbbell, barbell, machine, pull-up bar, resistance band, park/outdoor-friendly
    location_tags TEXT[] NOT NULL, -- e.g., {home, gym, park}
    difficulty_level TEXT NOT NULL, -- beginner, intermediate, advanced
    default_sets INTEGER,
    default_reps INTEGER,
    default_duration TEXT, -- e.g., '30s' for plank
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supabase_user_id UUID UNIQUE NOT NULL, -- references auth.users(id)
    goal TEXT NOT NULL, -- lose weight, build muscle, general fitness, strength, endurance
    age INTEGER NOT NULL,
    weight DECIMAL(5,2) NOT NULL,
    gender TEXT NOT NULL,
    training_days_per_week INTEGER NOT NULL,
    training_location TEXT NOT NULL, -- Home (bodyweight only), Home (has some equipment), Gym, Park/outdoor
    equipment_details TEXT, -- optional specification of equipment if Home (has some equipment)
    consent_privacy BOOLEAN NOT NULL DEFAULT FALSE,
    consent_terms BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workout_plans table
CREATE TABLE IF NOT EXISTS workout_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_profile_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL, -- e.g., "Week 1 Plan"
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workout_plan_days table (to store day-by-day workouts)
CREATE TABLE IF NOT EXISTS workout_plan_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_plan_id UUID NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL, -- 1, 2, 3, ... up to 7 or more
    workout_date DATE NOT NULL,
    exercises JSONB NOT NULL, -- array of exercise objects: {exercise_id, sets, reps, duration, notes}
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workout_logs table (for tracking completed workouts)
CREATE TABLE IF NOT EXISTS workout_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_profile_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    workout_plan_day_id UUID REFERENCES workout_plan_days(id) ON DELETE SET NULL,
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some initial exercises
INSERT INTO exercises (name, target_muscle_group, equipment_required, location_tags, difficulty_level, default_sets, default_reps, default_duration) VALUES
('Push-ups', 'push', 'none/bodyweight', '{home, gym, park}', 'beginner', 3, 10, NULL),
('Squats', 'legs', 'none/bodyweight', '{home, gym, park}', 'beginner', 3, 15, NULL),
('Plank', 'core', 'none/bodyweight', '{home, gym, park}', 'beginner', 3, NULL, '30s'),
('Dumbbell Bench Press', 'push', 'dumbbell', '{home, gym}', 'beginner', 3, 10, NULL),
('Dumbbell Row', 'pull', 'dumbbell', '{home, gym}', 'beginner', 3, 10, NULL),
('Barbell Squat', 'legs', 'barbell', '{gym}', 'intermediate', 4, 8, NULL),
('Pull-ups', 'pull', 'pull-up bar', '{gym, park}', 'intermediate', 3, 8, NULL),
('Running', 'full body', 'none/bodyweight', '{park}', 'beginner', 1, NULL, '30 minutes'),
('Cycling', 'legs', 'none/bodyweight', '{park, gym}', 'beginner', 1, NULL, '45 minutes'),
('Yoga Stretch', 'full body', 'none/bodyweight', '{home, gym, park}', 'beginner', 1, NULL, '20 minutes')
ON CONFLICT DO NOTHING;
