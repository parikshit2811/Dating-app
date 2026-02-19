import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Discover from './pages/Discover';
import Matches from './pages/Matches';
import Activities from './pages/Activities';
import CreateActivity from './pages/CreateActivity';

function PrivateRoute({ children }) {
  const { token, loading } = useContext(AuthContext);
  if (loading) return <div className="main-content">Loading...</div>;
  return token ? children : <Navigate to="/login" />;
}

function App() {
  const { token, loading } = useContext(AuthContext);

  if (loading) return null;

  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={token ? <Navigate to="/discover" /> : <Landing />} />
          <Route path="/login" element={token ? <Navigate to="/discover" /> : <Login />} />
          <Route path="/register" element={token ? <Navigate to="/discover" /> : <Register />} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/discover" element={<PrivateRoute><Discover /></PrivateRoute>} />
          <Route path="/matches" element={<PrivateRoute><Matches /></PrivateRoute>} />
          <Route path="/activities" element={<PrivateRoute><Activities /></PrivateRoute>} />
          <Route path="/activities/create" element={<PrivateRoute><CreateActivity /></PrivateRoute>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
