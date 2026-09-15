import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const WorkoutDashboard = () => {
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState(null);
  const [days, setDays] = useState([]);
  const [todayWorkout, setTodayWorkout] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      setUser(JSON.parse(userJson));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchWorkoutPlan();
    }
  }, [user]);

  const fetchWorkoutPlan = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token found');
      }

      const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

      // Get user's workout plans
      const plansResponse = await fetch(`${API_BASE_URL}/workout-plans`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!plansResponse.ok) {
        throw new Error(`Failed to fetch plans: ${plansResponse.status}`);
      }

      const plansData = await plansResponse.json();
      if (plansData.length === 0) {
        // No plan found, maybe generate one? But we should have a plan from registration.
        // For now, show a message to generate a plan.
        setError('No workout plan found. Please generate a plan.');
        setLoading(false);
        return;
      }

      // Assume the most recent active plan
      const activePlan = plansData.find(p => p.is_active) || plansData[0];
      setPlan(activePlan);

      // Get the days for this plan
      const daysResponse = await fetch(`${API_BASE_URL}/workout-plan/${activePlan.id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!daysResponse.ok) {
        throw new Error(`Failed to fetch workout days: ${daysResponse.status}`);
      }

      const daysData = await daysResponse.json();
      setDays(daysData.days || []);

      // Find today's workout (assuming day number corresponds to day of week or we can use date)
      const today = new Date();
      today.setHours(0,0,0,0);
      const todayWorkoutDay = daysData.days.find(day => {
        const workoutDate = new Date(day.workout_date);
        workoutDate.setHours(0,0,0,0);
        return workoutDate.getTime() === today.getTime();
      });

      if (todayWorkoutDay) {
        setTodayWorkout(todayWorkoutDay);
      } else {
        // If no workout for today, show the first incomplete day or day 1
        const incompleteDay = daysData.days.find(day => !day.is_completed) || daysData.days[0];
        setTodayWorkout(incompleteDay);
      }
    } catch (err) {
      setError(err.message || 'Failed to load workout plan');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteWorkout = async () => {
    if (!todayWorkout) return;
    try {
      const accessToken = localStorage.getItem('accessToken');
      const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${API_BASE_URL}/workout-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          day_id: todayWorkout.id,
          notes: `Completed on ${new Date().toLocaleDateString()}`
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to log workout: ${response.status}`);
      }

      // Refetch to update status
      await fetchWorkoutPlan();
    } catch (err) {
      setError(err.message || 'Failed to mark workout as complete');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="card" style={{ maxWidth: '500px', margin: '40px auto' }}>
      <h2>Error</h2>
      <p>{error}</p>
      <button onClick={() => window.location.reload()} className="button">
        Try Again
      </button>
    </div>;
  }

  if (!user) {
    return <div>Redirecting to login...</div>;
  }

  return (
    <div className="App">
      {!user && (
        <p>Redirecting to login...</p>
      )}
      {user && (
        <>
          <header className="App-header">
            <h1>Workout Generator</h1>
            <p>Welcome, {user.email || ''}!</p>
            <button onClick={() => {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('user');
              navigate('/login');
            }} className="button">
              Logout
            </button>
          </header>
          <main className="main-container">
            <h2>Your Workout Plan</h2>
            {plan && (
              <div>
                <h3>{plan.plan_name}</h3>
                <p>From: {plan.start_date} {plan.end_date ? `to: {plan.end_date}` : ''}</p>
              </div>
            )}
            <div>
              <h3>Today's Workout</h3>
              {todayWorkout ? (
                <div>
                  <p>Day {todayWorkout.day_number} - {new Date(todayWorkout.workout_date).toLocaleDateString()}</p>
                  {todayWorkout.exercises.map((ex, index) => (
                    <div key={index} className="exercise-item">
                      <span>{ex.name}</span>
                      <span>
                        {ex.sets ? `${ex.sets} sets` : ''}
                        {ex.reps ? ` ${ex.reps} reps` : ''}
                        {ex.duration ? ` ${ex.duration}` : ''}
                      </span>
                    </div>
                  ))}
                  {!todayWorkout.is_completed && (
                    <button onClick={handleCompleteWorkout} className="button">
                      Mark as Complete
                    </button>
                  )}
                  {todayWorkout.is_completed && (
                    <p style={{ color: 'green' }}>Completed on {new Date(todayWorkout.completed_at).toLocaleDateString()}</p>
                  )}
                </div>
              ) : (
                <p>No workout scheduled for today.</p>
              )}
            </div>
            <div>
              <h3>Upcoming Week</h3>
              {days.map(day => (
                <div key={day.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                  <p>Day {day.day_number} - {new Date(day.workout_date).toLocaleDateString()} {day.is_completed ? '(Completed)' : ''}</p>
                  {day.exercises.map((ex, index) => (
                    <div key={index} style={{ fontSize: '0.9em', marginLeft: '20px' }}>
                      <span>{ex.name}</span>
                      <span>
                        {ex.sets ? `${ex.sets} sets` : ''}
                        {ex.reps ? ` ${ex.reps} reps` : ''}
                        {ex.duration ? ` ${ex.duration}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </main>
        </>
      )}
    </div>
  );
};

export default WorkoutDashboard;