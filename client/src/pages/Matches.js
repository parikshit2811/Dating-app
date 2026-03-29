import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

function Matches() {
  const { user } = useContext(AuthContext);
  const [matches, setMatches] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [matchRes, pendingRes] = await Promise.all([
        api.get('/match'),
        api.get('/match/pending')
      ]);
      setMatches(matchRes.data);
      setPending(pendingRes.data);
    } catch (err) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const respondToMatch = async (matchId, status) => {
    try {
      await api.put(`/match/${matchId}`, { status });
      fetchData();
    } catch (err) {
      // handle error
    }
  };

  const getOtherUser = (match) => {
    return match.users.find(u => u._id !== user?.id && u._id !== user?._id);
  };

  if (loading) return <div>Loading matches...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Your Matches</h1>
        <p>People you've vibed with</p>
      </div>

      {pending.length > 0 && (
        <>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Pending Requests</h2>
          <div className="grid-2" style={{ marginBottom: '2rem' }}>
            {pending.map(match => {
              const other = getOtherUser(match);
              if (!other) return null;
              return (
                <div className="card match-card" key={match._id}>
                  <div className={`vibe-score ${match.vibeScore >= 70 ? 'high' : ''}`}>
                    {match.vibeScore}
                  </div>
                  <div className="match-info">
                    <h3>{other.name}, {other.age}</h3>
                    {other.location && <div className="match-details">{other.location}</div>}
                    {match.sharedInterests.length > 0 && (
                      <div style={{ marginBottom: '0.5rem' }}>
                        {match.sharedInterests.map(i => (
                          <span key={i} className="tag gold">
                            {i.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="match-actions">
                      <button className="btn btn-success btn-sm" onClick={() => respondToMatch(match._id, 'accepted')}>
                        Accept
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => respondToMatch(match._id, 'declined')}>
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Accepted Matches</h2>
      {matches.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <h3>No matches yet</h3>
          <p style={{ color: '#4A4A4A', marginTop: '0.5rem' }}>
            Head to <a href="/discover">Discover</a> to find your vibe match.
          </p>
        </div>
      ) : (
        <div className="grid-2">
          {matches.map(match => {
            const other = getOtherUser(match);
            if (!other) return null;
            return (
              <div className="card match-card" key={match._id}>
                <div className={`vibe-score ${match.vibeScore >= 70 ? 'high' : ''}`}>
                  {match.vibeScore}
                </div>
                <div className="match-info">
                  <h3>{other.name}, {other.age}</h3>
                  {other.location && <div className="match-details">{other.location}</div>}
                  {other.bio && (
                    <p style={{ fontSize: '0.9rem', color: '#4A4A4A' }}>
                      {other.bio.length > 150 ? other.bio.slice(0, 150) + '...' : other.bio}
                    </p>
                  )}
                  {match.sharedInterests.length > 0 && (
                    <div>
                      {match.sharedInterests.map(i => (
                        <span key={i} className="tag gold">
                          {i.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Matches;
