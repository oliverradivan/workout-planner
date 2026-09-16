import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get questionnaire answers and consent from location state (if coming from preview)
  const { answers, consent } = location.state || {};

  useEffect(() => {
    // If someone lands here directly (e.g. typed the URL, refreshed the page),
    // there's no questionnaire data to register with — send them back to start.
    if (!answers || !consent) {
      navigate('/questionnaire');
    }
  }, [answers, consent, navigate]);

  if (!answers || !consent) {
    return <div>Redirecting...</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase environment variables are not set');
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data: sessionData, error: supabaseError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (supabaseError) throw supabaseError;

      const { session, user } = sessionData;
      if (session && session.access_token) {
        // Exchange Supabase token for our JWT and send questionnaire answers
        const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
        const exchangeResponse = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            supabase_access_token: session.access_token,
            questionnaire: answers,
            consent_privacy: consent.privacy,
            consent_terms: consent.terms,
          }),
        });

        if (!exchangeResponse.ok) {
          throw new Error(`HTTP error! status: ${exchangeResponse.status}`);
        }

        const { access_token } = await exchangeResponse.json();
        // Store our JWT and user info
        localStorage.setItem('accessToken', access_token);
        localStorage.setItem('user', JSON.stringify(user));
        // Navigate to workout dashboard
        navigate('/workout');
      } else {
        // Email verification required
        setError('Please check your email to verify your account before logging in.');
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '40px auto' }}>
      <h2>Sign Up to Save Your Plan</h2>
      {answers && (
        <>
          <p><strong>Goal:</strong> {answers.goal}</p>
          <p><strong>Training Days:</strong> {answers.training_days_per_week} days/week</p>
          <p><strong>Location:</strong> {answers.training_location}</p>
        </>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="button" disabled={loading}>
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
      <p>
        Already have an account? <a href="/login">Log in</a>
      </p>
    </div>
  );
};

export default Signup;