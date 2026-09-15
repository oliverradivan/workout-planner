import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import WorkoutGenerator from './components/WorkoutGenerator';
import { useState, useEffect } from 'react';

function App() {
  const [user, setUser] = useState(() => {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if there's a user in localStorage on app start
    const userJson = localStorage.getItem('user');
    if (userJson) {
      setUser(JSON.parse(userJson));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('supabaseAccessToken');
    setUser(null);
    // Redirect to login
    window.location.href = '/login';
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <div className="App">
        {!user && (
          <Navigate replace to="/login" />
        )}
        {user && (
          <>
            <header className="App-header">
              <h1>Workout Generator</h1>
              <p>Welcome, {user.email || ''}!</p>
              <button onClick={handleLogout} className="button">
                Logout
              </button>
            </header>
            <main className="main-container">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/workout" element={<WorkoutGenerator />} />
                <Route path="/" element={<Navigate replace to="/workout" />} />
              </Routes>
            </main>
          </>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;