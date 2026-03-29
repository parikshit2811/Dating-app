import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const CATEGORIES = [
  'wine-tasting', 'sufi-nights', 'star-gazing', 'cooking',
  'pickleball', 'golf', 'astronomy', 'astrology',
  'hiking', 'book-club', 'jazz-nights', 'whiskey-tasting',
  'photography', 'sailing', 'meditation', 'travel',
  'art-gallery', 'theater', 'cigar-lounge', 'fishing'
];

const formatCategory = (s) => s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

function CreateActivity() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    category: 'wine-tasting',
    description: '',
    date: '',
    location: '',
    maxParticipants: 10
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/activities', form);
      navigate('/activities');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to create activity');
    }
  };

  const update = (field, value) => setForm({ ...form, [field]: value });

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="page-header">
        <h1>Create an Experience</h1>
        <p>Plan something real — invite your matches along</p>
      </div>

      <div className="card">
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={form.title}
              onChange={e => update('title', e.target.value)}
              placeholder="e.g. Napa Valley Wine Tasting Evening"
              required
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={e => update('category', e.target.value)}>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{formatCategory(cat)}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={e => update('description', e.target.value)}
              placeholder="What's the plan? What should people expect?"
              required
            />
          </div>

          <div className="form-group">
            <label>Date & Time</label>
            <input
              type="datetime-local"
              value={form.date}
              onChange={e => update('date', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              value={form.location}
              onChange={e => update('location', e.target.value)}
              placeholder="Where is this happening?"
              required
            />
          </div>

          <div className="form-group">
            <label>Max Participants</label>
            <input
              type="number"
              min="2"
              max="50"
              value={form.maxParticipants}
              onChange={e => update('maxParticipants', parseInt(e.target.value))}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block">Create Experience</button>
        </form>
      </div>
    </div>
  );
}

export default CreateActivity;
