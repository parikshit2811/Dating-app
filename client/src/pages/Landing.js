import React from 'react';
import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div className="landing">
      <h1>Find Your <span>Vibe</span></h1>
      <p className="subtitle">
        A dating experience designed for distinguished men 45-65.
        Share your social presence, discover your vibe match, and connect
        over real experiences — from wine tastings to stargazing.
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link to="/register" className="btn btn-primary">Get Started</Link>
        <Link to="/login" className="btn btn-outline">Log In</Link>
      </div>

      <div className="features">
        <div className="feature-card">
          <div className="feature-icon">&#128247;</div>
          <h3>Social Screenshots</h3>
          <p>
            Upload 1-10 screenshots from LinkedIn, Instagram, Facebook, X,
            Snapchat, TikTok — let your social presence tell your story.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">&#10024;</div>
          <h3>Vibe Match</h3>
          <p>
            Our algorithm matches you based on shared interests, personality
            vibes, and social authenticity. No swiping — just real compatibility.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">&#127863;</div>
          <h3>Real Experiences</h3>
          <p>
            Wine tastings, Sufi nights, stargazing, cooking classes, golf —
            connect over activities that matter, not just coffee dates.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Landing;
