import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const ALL_INTERESTS = [
  'wine-tasting', 'sufi-nights', 'star-gazing', 'cooking',
  'pickleball', 'golf', 'astronomy', 'astrology',
  'hiking', 'book-club', 'jazz-nights', 'whiskey-tasting',
  'photography', 'sailing', 'meditation', 'travel',
  'art-gallery', 'theater', 'cigar-lounge', 'fishing'
];

const PLATFORMS = ['linkedin', 'instagram', 'facebook', 'x', 'snapchat', 'tiktok', 'other'];

const formatInterest = (s) => s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

function Profile() {
  const { user, setUser } = useContext(AuthContext);
  const fileInputRef = useRef();

  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [interests, setInterests] = useState([]);
  const [vibeProfile, setVibeProfile] = useState({
    adventurous: 50, intellectual: 50, social: 50, creative: 50, wellness: 50
  });
  const [screenshots, setScreenshots] = useState([]);
  const [uploadPlatform, setUploadPlatform] = useState('linkedin');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/auth/me').then(res => {
      const u = res.data;
      setBio(u.bio || '');
      setLocation(u.location || '');
      setInterests(u.interests || []);
      if (u.vibeProfile) setVibeProfile(u.vibeProfile);
      setScreenshots(u.socialScreenshots || []);
      setUser(u);
    });
  }, [setUser]);

  const saveProfile = async () => {
    setMsg('');
    setError('');
    try {
      const res = await api.put('/profile', { bio, location, interests, vibeProfile });
      setUser(res.data);
      setMsg('Profile saved');
    } catch (err) {
      setError(err.response?.data?.msg || 'Save failed');
    }
  };

  const toggleInterest = (interest) => {
    setInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    if (screenshots.length + files.length > 10) {
      setError(`Can upload up to 10 screenshots total. You have ${screenshots.length}.`);
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('screenshots', files[i]);
      formData.append('platforms', uploadPlatform);
    }

    try {
      const res = await api.post('/profile/screenshots', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setScreenshots(res.data.screenshots);
      setMsg('Screenshots uploaded');
    } catch (err) {
      setError(err.response?.data?.msg || 'Upload failed');
    }
  };

  const removeScreenshot = async (id) => {
    try {
      const res = await api.delete(`/profile/screenshots/${id}`);
      setScreenshots(res.data.screenshots);
    } catch (err) {
      setError('Failed to remove screenshot');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Your Profile</h1>
        <p>Build your presence — let your vibe do the talking</p>
      </div>

      {msg && <div style={{ background: '#F0FFF0', color: '#2D6A2D', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', borderLeft: '4px solid #4A7C59' }}>{msg}</div>}
      {error && <div className="error-msg">{error}</div>}

      <div className="grid-2">
        {/* Left column - Basic Info */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>About You</h3>
          <div className="form-group">
            <label>Bio</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell others what makes you tick..."
              maxLength={500}
            />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="City, State"
            />
          </div>

          <h3 style={{ marginBottom: '0.75rem', marginTop: '1.5rem' }}>Your Vibe</h3>
          <div className="vibe-slider">
            {Object.keys(vibeProfile).map(dim => (
              <div className="slider-row" key={dim}>
                <label>{dim.charAt(0).toUpperCase() + dim.slice(1)}</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={vibeProfile[dim]}
                  onChange={e => setVibeProfile({ ...vibeProfile, [dim]: parseInt(e.target.value) })}
                />
                <span className="slider-val">{vibeProfile[dim]}</span>
              </div>
            ))}
          </div>

          <button className="btn btn-primary btn-block" onClick={saveProfile} style={{ marginTop: '1rem' }}>
            Save Profile
          </button>
        </div>

        {/* Right column - Screenshots & Interests */}
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.75rem' }}>Social Screenshots ({screenshots.length}/10)</h3>
            <p style={{ color: '#4A4A4A', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Upload screenshots from your social profiles to show your authentic self
            </p>

            {screenshots.length > 0 && (
              <div className="screenshot-grid" style={{ marginBottom: '1rem' }}>
                {screenshots.map(s => (
                  <div className="screenshot-item" key={s._id}>
                    <img src={s.imageUrl} alt={s.platform} />
                    <span className="platform-badge">{s.platform}</span>
                    <button className="remove-btn" onClick={() => removeScreenshot(s._id)}>X</button>
                  </div>
                ))}
              </div>
            )}

            {screenshots.length < 10 && (
              <>
                <div className="form-group">
                  <label>Platform</label>
                  <select value={uploadPlatform} onChange={e => setUploadPlatform(e.target.value)}>
                    {PLATFORMS.map(p => (
                      <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="upload-area" onClick={() => fileInputRef.current.click()}>
                  <h3>Drop screenshots here</h3>
                  <p>or click to browse (JPEG, PNG, WebP - max 5MB each)</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    onChange={handleUpload}
                    style={{ display: 'none' }}
                  />
                </div>
              </>
            )}
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '0.75rem' }}>Interests</h3>
            <p style={{ color: '#4A4A4A', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Pick what excites you — this drives your vibe match
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {ALL_INTERESTS.map(interest => (
                <span
                  key={interest}
                  className={`tag ${interests.includes(interest) ? 'active' : ''}`}
                  onClick={() => toggleInterest(interest)}
                  style={{ cursor: 'pointer' }}
                >
                  {formatInterest(interest)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
