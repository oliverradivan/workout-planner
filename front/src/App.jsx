import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Questionnaire from './components/questionnaire/Questionnaire';
import Preview from './components/questionnaire/Preview';
import Login from './components/Login';
import Signup from './components/Signup';
import WorkoutDashboard from './components/workout-plan/WorkoutDashboard';
import { useState, useEffect } from 'react';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if there's a user in localStorage on app start
    const userJson = localStorage.getItem('user');
    if (userJson) {
      // User is logged in
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <div className="App">
        {!localStorage.getItem('accessToken') && (
          <Navigate replace to="/questionnaire" />
        )}
        {localStorage.getItem('accessToken') && (
          <>
            <header className="App-header">
              <h1>Workout Generator</h1>
              <p>Welcome, {JSON.parse(localStorage.getItem('user') || '{}').email || ''}!</p>
              <button onClick={() => {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
              }} className="button">
                Logout
              </button>
            </header>
            <main className="main-container">
              <Routes>
                <Route path="/questionnaire" element={<Questionnaire />} />
                <Route path="/preview" element={<Preview />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/workout" element={<WorkoutDashboard />} />
                <Route path="/" element={<Navigate replace to="/questionnaire" />} />
              </Routes>
            </main>
          </>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
