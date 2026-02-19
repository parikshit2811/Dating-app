import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Register() {
  const { register } = useContext(AuthContext);
  const [form, setForm] = useState({ name: '', email: '', password: '', age: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const age = parseInt(form.age, 10);
    if (age < 45 || age > 65) {
      setError('This app is designed for ages 45-65');
      return;
    }

    try {
      await register(form.name, form.email, form.password, age);
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="card">
        <h2>Join VibeMatch</h2>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              minLength={6}
              required
            />
          </div>
          <div className="form-group">
            <label>Age (45-65)</label>
            <input
              type="number"
              min="45"
              max="65"
              value={form.age}
              onChange={e => setForm({ ...form, age: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block">Create Account</button>
        </form>
        <p className="switch-link">
          Already a member? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
