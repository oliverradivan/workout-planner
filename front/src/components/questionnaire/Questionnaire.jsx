import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Questionnaire = () => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    goal: '',
    age: '',
    weight: '',
    gender: '',
    training_days_per_week: '',
    training_location: '',
    equipment_details: ''
  });
  const [consent, setConsent] = useState({
    privacy: false,
    terms: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAnswers(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConsentChange = (e) => {
    const { name, checked } = e.target;
    setConsent(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleNext = () => {
    // Basic validation
    if (!answers.goal || !answers.age || !answers.weight || !answers.gender || !answers.training_days_per_week || !answers.training_location) {
      setError('Please fill in all required fields');
      return;
    }
    if (step < 3) {
      setStep(step + 1);
    } else {
      // All steps done, proceed to preview
      navigate('/preview', { state: { answers, consent } });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2>Step 1: Your Goal</h2>
            <div>
              <label htmlFor="goal">Goal:</label>
              <select id="goal" name="goal" value={answers.goal} onChange={handleChange} required>
                <option value="">Select a goal</option>
                <option value="lose weight">Lose Weight</option>
                <option value="build muscle">Build Muscle</option>
                <option value="general fitness">General Fitness</option>
                <option value="strength">Strength</option>
                <option value="endurance">Endurance</option>
              </select>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <h2>Step 2: Personal Info</h2>
            <div>
              <label htmlFor="age">Age:</label>
              <input type="number" id="age" name="age" value={answers.age} onChange={handleChange} min="13" max="120" required />
            </div>
            <div>
              <label htmlFor="weight">Weight (kg):</label>
              <input type="number" id="weight" name="weight" value={answers.weight} onChange={handleChange} step="0.1" min="20" max="300" required />
            </div>
            <div>
              <label htmlFor="gender">Gender:</label>
              <select id="gender" name="gender" value={answers.gender} onChange={handleChange} required>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h2>Step 3: Training Details</h2>
            <div>
              <label htmlFor="training_days_per_week">Training Days per Week:</label>
              <select id="training_days_per_week" name="training_days_per_week" value={answers.training_days_per_week} onChange={handleChange} required>
                <option value="">Select days</option>
                {[1,2,3,4,5,6,7].map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="training_location">Training Location:</label>
              <select id="training_location" name="training_location" value={answers.training_location} onChange={handleChange} required>
                <option value="">Select location</option>
                <option value="Home (bodyweight only)">Home (bodyweight only)</option>
                <option value="Home (has some equipment)">Home (has some equipment)</option>
                <option value="Gym">Gym</option>
                <option value="Park/outdoor">Park/outdoor</option>
              </select>
            </div>
            {answers.training_location === 'Home (has some equipment)' && (
              <div>
                <label htmlFor="equipment_details">Equipment Details (optional):</label>
                <input type="text" id="equipment_details" name="equipment_details" value={answers.equipment_details} onChange={handleChange} placeholder="e.g., dumbbells, resistance band" />
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="card" style={{ maxWidth: '500px', margin: '40px auto' }}>
      <h2>Workout Questionnaire</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <p>Step {step} of 3</p>
        <div style={{ height: '20px', backgroundColor: '#eee', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ width: `${(step/3)*100}%`, height: '100%', backgroundColor: '#4caf50' }}></div>
        </div>
      </div>
      {renderStep()}
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
        {step > 1 && (
          <button onClick={handleBack} className="button">
            Back
          </button>
        )}
        {step < 3 && (
          <button onClick={handleNext} className="button" disabled={loading}>
            {loading ? 'Next...' : 'Next'}
          </button>
        )}
        {step === 3 && (
          <>
            <button onClick={handleNext} className="button" disabled={loading}>
              {loading ? 'See Preview...' : 'See Preview'}
            </button>
          </>
        )}
      </div>
      {step === 3 && (
        <div style={{ marginTop: '20px' }}>
          <div>
            <label>
              <input
                type="checkbox"
                checked={consent.privacy}
                onChange={e => setConsent(prev => ({ ...prev, privacy: e.target.checked }))}
              />
              I agree to the Privacy Policy
            </label>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                checked={consent.terms}
                onChange={e => setConsent(prev => ({ ...prev, terms: e.target.checked }))}
              />
              I agree to the Terms of Service
            </label>
          </div>
          {!consent.privacy || !consent.terms && (
            <p style={{ color: 'red', fontSize: '0.8em' }}>Please accept both privacy policy and terms to continue</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Questionnaire;
