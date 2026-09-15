import { useState } from 'react';

const WorkoutGenerator = () => {
  const [muscleGroup, setMuscleGroup] = useState('full body');
  const [difficulty, setDifficulty] = useState('medium');
  const [equipment, setEquipment] = useState('bodyweight');
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

  const generateWorkout = async () => {
    setLoading(true);
    setError(null);
    setWorkout(null);
    try {
      const accessToken = localStorage.getItem('supabaseAccessToken');
      if (!accessToken) {
        throw new Error('No access token found. Please log in again.');
      }

      const response = await fetch(`${API_BASE_URL}/generate-workout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          muscle_group: muscleGroup,
          difficulty: difficulty,
          equipment: equipment,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setWorkout(data);
    } catch (err) {
      setError(err.message || 'Failed to generate workout');
    } finally {
      setLoading(false);
    }
  };

  if (!workout) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '40px auto' }}>
        <h2>Generate Workout</h2>
        <div>
          <label htmlFor="muscleGroup">Muscle Group:</label>
          <select
            id="muscleGroup"
            value={muscleGroup}
            onChange={(e) => setMuscleGroup(e.target.value)}
          >
            <option value="full body">Full Body</option>
            <option value="upper">Upper Body</option>
            <option value="lower">Lower Body</option>
            <option value="chest">Chest</option>
            <option value="back">Back</option>
            <option value="legs">Legs</option>
            <option value="arms">Arms</option>
            <option value="shoulders">Shoulders</option>
            <option value="abs">Abs</option>
          </select>
        </div>
        <div>
          <label htmlFor="difficulty">Difficulty:</label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div>
          <label htmlFor="equipment">Equipment:</label>
          <select
            id="equipment"
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
          >
            <option value="bodyweight">Bodyweight</option>
            <option value="dumbbells">Dumbbells</option>
            <option value="barbell">Barbell</option>
            <option value="machines">Machines</option>
            <option value="bands">Resistance Bands</option>
          </select>
        </div>
        <button className="button" onClick={generateWorkout} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Workout'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '40px auto' }}>
      <h2>Your Workout</h2>
      <p><strong>Muscle Group:</strong> {workout.muscle_group}</p>
      <p><strong>Difficulty:</strong> {workout.difficulty}</p>
      <p><strong>Equipment:</strong> {workout.equipment}</p>
      <div>
        <h3>Exercises:</h3>
        {workout.exercises.map((ex, index) => (
          <div key={index} className="exercise-item">
            <span>{ex.name}</span>
            <span>
              {ex.sets ? `${ex.sets} sets` : ''}
              {ex.reps ? ` ${ex.reps} reps` : ''}
              {ex.duration ? ` ${ex.duration}` : ''}
            </span>
          </div>
        ))}
      </div>
      <button className="button" onClick={() => setWorkout(null)}>
        Generate New Workout
      </button>
    </div>
  );
};

export default WorkoutGenerator;