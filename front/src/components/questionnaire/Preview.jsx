import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Preview = () => {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Get questionnaire answers and consent from location state
  const { answers, consent } = location.state || {};

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        setLoading(true);
        const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
        const response = await fetch(`${API_BASE_URL}/generate-workout-preview`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(answers),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setPreview(data);
      } catch (err) {
        setError(err.message || 'Failed to generate preview');
      } finally {
        setLoading(false);
      }
    };

    if (answers && consent) {
      fetchPreview();
    } else {
      navigate('/questionnaire');
    }
  }, [answers, consent, navigate]);

  if (!answers || !consent) {
    return <div>Redirecting...</div>;
  }

  const handleLogin = () => {
    navigate('/login', { state: { answers, consent } });
  };

  const handleSignUp = () => {
    navigate('/signup', { state: { answers, consent } });
  };

  return (
    <div className="card" style={{ maxWidth: '500px', margin: '40px auto' }}>
      <h2>Your Workout Preview</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading ? (
        <p>Generating your preview...</p>
      ) : (
        <>
          <p><strong>Goal:</strong> {answers.goal}</p>
          <p><strong>Training Days:</strong> {answers.training_days_per_week} days/week</p>
          <p><strong>Location:</strong> {answers.training_location}</p>
          <h3>Day 1 Workout:</h3>
          {preview.exercises.map((ex, index) => (
            <div key={index} className="exercise-item">
              <span>{ex.name}</span>
              <span>
                {ex.sets ? `${ex.sets} sets` : ''}
                {ex.reps ? ` ${ex.reps} reps` : ''}
                {ex.duration ? ` ${ex.duration}` : ''}
              </span>
            </div>
          ))}
          <p style={{ fontSize: '0.9em', color: '#666' }}>
            This is a preview of day 1. Sign up or log in to see your full workout plan and save it.
          </p>
          <div style={{ marginTop: '20px' }}>
            <button onClick={handleLogin} className="button">
              Log In
            </button>
            <button onClick={handleSignUp} className="button" style={{ marginLeft: '10px' }}>
              Sign Up
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Preview;
