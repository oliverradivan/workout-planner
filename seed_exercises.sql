-- Insert sample exercises
INSERT INTO public.exercises (name, target_muscle_group, equipment_required, location_tags, difficulty, default_sets, default_reps) VALUES
-- Bodyweight exercises (home, park)
('Push-ups', 'chest, shoulders, triceps', 'none', ARRAY['home', 'park'], 'beginner', 3, '10-15'),
('Squats', 'quads, glutes', 'none', ARRAY['home', 'gym', 'park'], 'beginner', 3, '12-20'),
('Lunges', 'quads, glutes', 'none', ARRAY['home', 'gym', 'park'], 'beginner', 3, '10-15 each leg'),
('Plank', 'core', 'none', ARRAY['home', 'gym', 'park'], 'beginner', 3, '30-60s'),
('Pull-ups', 'back, biceps', 'pull-up bar', ARRAY['home', 'gym', 'park'], 'intermediate', 3, '5-10'),
('Dips', 'chest, triceps', 'parallel bars or chair', ARRAY['home', 'gym', 'park'], 'intermediate', 3, '8-12'),
('Burpees', 'full body', 'none', ARRAY['home', 'park'], 'intermediate', 3, '8-12'),
('Mountain Climbers', 'core, cardio', 'none', ARRAY['home', 'park'], 'beginner', 3, '30-60s'),

-- Dumbbell exercises (home with equipment, gym)
('Dumbbell Bench Press', 'chest', 'dumbbells', ARRAY['home_equipment', 'gym'], 'beginner', 3, '8-12'),
('Dumbbell Rows', 'back', 'dumbbells', ARRAY['home_equipment', 'gym'], 'beginner', 3, '8-12 each side'),
('Dumbbell Shoulder Press', 'shoulders', 'dumbbells', ARRAY['home_equipment', 'gym'], 'beginner', 3, '8-12'),
('Dumbbell Bicep Curls', 'biceps', 'dumbbells', ARRAY['home_equipment', 'gym'], 'beginner', 3, '10-15'),
('Dumbbell Tricep Extensions', 'triceps', 'dumbbells', ARRAY['home_equipment', 'gym'], 'beginner', 3, '10-15'),
('Dumbbell Squats', 'quads, glutes', 'dumbbells', ARRAY['home_equipment', 'gym'], 'beginner', 3, '10-15'),
('Dumbbell Deadlifts', 'hamstrings, glutes', 'dumbbells', ARRAY['home_equipment', 'gym'], 'beginner', 3, '8-12'),
('Dumbbell Lunges', 'quads, glutes', 'dumbbells', ARRAY['home_equipment', 'gym'], 'beginner', 3, '10-15 each leg'),

-- Barbell exercises (gym)
('Barbell Bench Press', 'chest', 'barbell', ARRAY['gym'], 'beginner', 4, '8-10'),
('Barbell Back Squat', 'quads, glutes', 'barbell', ARRAY['gym'], 'beginner', 4, '8-10'),
('Barbell Deadlift', 'hamstrings, glutes, back', 'barbell', ARRAY['gym'], 'beginner', 3, '6-8'),
('Barbell Overhead Press', 'shoulders', 'barbell', ARRAY['gym'], 'beginner', 3, '8-12'),
('Barbell Bicep Curl', 'biceps', 'barbell', ARRAY['gym'], 'beginner', 3, '10-15'),
('Barbell Tricep Extension', 'triceps', 'barbell', ARRAY['gym'], 'beginner', 3, '10-15'),

-- Machine exercises (gym)
('Leg Press Machine', 'quads, glutes', 'machine', ARRAY['gym'], 'beginner', 3, '10-12'),
('Lat Pulldown Machine', 'back', 'machine', ARRAY['gym'], 'beginner', 3, '8-12'),
('Leg Extension Machine', 'quads', 'machine', ARRAY['gym'], 'beginner', 3, '12-15'),
('Leg Curl Machine', 'hamstrings', 'machine', ARRAY['gym'], 'beginner', 3, '12-15'),
('Chest Fly Machine', 'chest', 'machine', ARRAY['gym'], 'beginner', 3, '12-15'),

-- Resistance band (home, park)
('Band Rows', 'back', 'resistance band', ARRAY['home', 'park'], 'beginner', 3, '12-15'),
('Band Chest Press', 'chest', 'resistance band', ARRAY['home', 'park'], 'beginner', 3, '12-15'),
('Band Squats', 'quads, glutes', 'resistance band', ARRAY['home', 'park'], 'beginner', 3, '15-20'),

-- Park-specific
('Bench Dips', 'triceps', 'bench', ARRAY['park'], 'beginner', 3, '10-15'),
('Incline Push-ups', 'chest', 'bench', ARRAY['park'], 'beginner', 3, '10-15'),
('Decline Push-ups', 'chest', 'bench', ARRAY['park'], 'intermediate', 3, '8-12'),
('Step-ups', 'quads, glutes', 'bench or step', ARRAY['park'], 'beginner', 3, '10-15 each leg');