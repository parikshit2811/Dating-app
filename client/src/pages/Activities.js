import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const CATEGORIES = [
  '', 'wine-tasting', 'sufi-nights', 'star-gazing', 'cooking',
  'pickleball', 'golf', 'astronomy', 'astrology',
  'hiking', 'book-club', 'jazz-nights', 'whiskey-tasting',
  'photography', 'sailing', 'meditation', 'travel',
  'art-gallery', 'theater', 'cigar-lounge', 'fishing'
];

const formatCategory = (s) => s ? s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'All';

function Activities() {
  const { user } = useContext(AuthContext);
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      const params = filter ? { category: filter } : {};
      const res = await api.get('/activities', { params });
      setActivities(res.data);
    } catch (err) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchActivities(); }, [filter]);

  const joinActivity = async (id) => {
    try {
      await api.post(`/activities/${id}/join`);
      fetchActivities();
    } catch (err) {
      // handle error
    }
  };

  const leaveActivity = async (id) => {
    try {
      await api.post(`/activities/${id}/leave`);
      fetchActivities();
    } catch (err) {
      // handle error
    }
  };

  const isJoined = (activity) => {
    return activity.participants.some(p =>
      (p._id || p) === (user?.id || user?._id)
    );
  };

  if (loading) return <div>Loading activities...</div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Real Experiences</h1>
          <p>Connect over things that matter — not just another coffee date</p>
        </div>
        <Link to="/activities/create" className="btn btn-primary">Create Activity</Link>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
        {CATEGORIES.map(cat => (
          <span
            key={cat || 'all'}
            className={`tag ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
            style={{ cursor: 'pointer' }}
          >
            {formatCategory(cat)}
          </span>
        ))}
      </div>

      {activities.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <h3>No upcoming activities</h3>
          <p style={{ color: '#4A4A4A', marginTop: '0.5rem' }}>
            Be the first to <Link to="/activities/create">create one</Link>!
          </p>
        </div>
      ) : (
        <div className="grid-3">
          {activities.map(activity => (
            <div className="card activity-card" key={activity._id}>
              <span className="activity-category">{formatCategory(activity.category)}</span>
              <h3>{activity.title}</h3>
              <div className="activity-meta">
                <span>{new Date(activity.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                <span>{activity.location}</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#4A4A4A', marginBottom: '0.75rem' }}>
                {activity.description.length > 100 ? activity.description.slice(0, 100) + '...' : activity.description}
              </p>
              <div className="participants-count">
                {activity.participants.length}/{activity.maxParticipants} joined
              </div>
              <div style={{ marginTop: '0.75rem' }}>
                {isJoined(activity) ? (
                  <button className="btn btn-outline btn-sm" onClick={() => leaveActivity(activity._id)}>
                    Leave
                  </button>
                ) : activity.participants.length >= activity.maxParticipants ? (
                  <span className="btn btn-sm" style={{ opacity: 0.5, cursor: 'default' }}>Full</span>
                ) : (
                  <button className="btn btn-secondary btn-sm" onClick={() => joinActivity(activity._id)}>
                    Join
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Activities;
