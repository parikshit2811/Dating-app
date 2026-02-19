import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const { token, logout } = useContext(AuthContext);
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        Vibe<span>Match</span>
      </Link>
      <div className="nav-links">
        {token ? (
          <>
            <Link to="/discover" className={isActive('/discover')}>Discover</Link>
            <Link to="/matches" className={isActive('/matches')}>Matches</Link>
            <Link to="/activities" className={isActive('/activities')}>Activities</Link>
            <Link to="/profile" className={isActive('/profile')}>Profile</Link>
            <button onClick={logout}>Log Out</button>
          </>
        ) : (
          <>
            <Link to="/login">Log In</Link>
            <Link to="/register">
              <button>Join Now</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
