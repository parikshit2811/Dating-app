import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const formatInterest = (s) => s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

function Discover() {
  const { user } = useContext(AuthContext);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState(new Set());

  useEffect(() => {
    api.get('/match/discover')
      .then(res => setCandidates(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const sendRequest = async (userId) => {
    try {
      await api.post(`/match/request/${userId}`);
      setSentRequests(prev => new Set([...prev, userId]));
    } catch (err) {
      // already matched or error
    }
  };

  if (loading) return <div>Finding your vibe matches...</div>;

  const needsScreenshots = !user?.socialScreenshots?.length;

  return (
    <div>
      <div className="page-header">
        <h1>Discover</h1>
        <p>People who match your vibe, ranked by compatibility</p>
      </div>

      {needsScreenshots && (
        <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid #C9A84C' }}>
          <h3>Complete Your Profile First</h3>
          <p style={{ color: '#4A4A4A', marginTop: '0.5rem' }}>
            Upload at least one social screenshot and set your interests to start discovering matches.
          </p>
          <a href="/profile" className="btn btn-secondary btn-sm" style={{ marginTop: '0.75rem', display: 'inline-block' }}>
            Go to Profile
          </a>
        </div>
      )}

      {candidates.length === 0 && !needsScreenshots ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>No new matches right now</h3>
          <p style={{ color: '#4A4A4A', marginTop: '0.5rem' }}>
            Check back soon — new members are joining every day.
          </p>
        </div>
      ) : (
        <div className="grid-2">
          {candidates.map(({ user: candidate, vibeScore, sharedInterests }) => (
            <div className="card match-card" key={candidate._id}>
              <div className={`vibe-score ${vibeScore >= 70 ? 'high' : ''}`}>
                {vibeScore}
              </div>
              <div className="match-info">
                <h3>{candidate.name}, {candidate.age}</h3>
                <div className="match-details">
                  {candidate.location && <span>{candidate.location}</span>}
                  <span>{candidate.socialScreenshots.length} social screenshots</span>
                </div>
                {candidate.bio && (
                  <p style={{ fontSize: '0.9rem', color: '#4A4A4A', marginBottom: '0.5rem' }}>
                    {candidate.bio.length > 120 ? candidate.bio.slice(0, 120) + '...' : candidate.bio}
                  </p>
                )}
                {sharedInterests.length > 0 && (
                  <div>
                    {sharedInterests.map(i => (
                      <span key={i} className="tag gold">{formatInterest(i)}</span>
                    ))}
                  </div>
                )}
                <div className="match-actions">
                  {sentRequests.has(candidate._id) ? (
                    <span className="btn btn-sm btn-outline" style={{ opacity: 0.6 }}>Request Sent</span>
                  ) : (
                    <button className="btn btn-primary btn-sm" onClick={() => sendRequest(candidate._id)}>
                      Send Vibe Match
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Discover;
