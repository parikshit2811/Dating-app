# VibeMatch

A dating app for distinguished men (45-65) — upload social screenshots, find your vibe match, and connect over real experiences.

## Features

- **Social Screenshot Profiles** — Upload 1-10 screenshots from LinkedIn, Instagram, Facebook, X, Snapchat, TikTok to showcase your authentic social presence
- **Vibe Matching** — Algorithm matches users based on shared interests, personality vibe dimensions (adventurous, intellectual, social, creative, wellness), and social authenticity
- **Real Experiences** — Wine tastings, Sufi nights, stargazing, cooking classes, golf, pickleball, jazz nights, whiskey tastings, and more — connect over activities that matter

## Tech Stack

- **Frontend:** React 18, React Router, Axios
- **Backend:** Node.js, Express, MongoDB/Mongoose
- **Auth:** JWT-based authentication with bcrypt
- **Uploads:** Multer for image handling

## Getting Started

```bash
# Install all dependencies
npm run install-all

# Create .env from example
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Run both frontend and backend
npm run dev
```

The backend runs on port 5000, the React frontend on port 3000 (proxied to the backend).

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/register` | POST | Register (name, email, password, age 45-65) |
| `/api/auth/login` | POST | Login |
| `/api/auth/me` | GET | Current user |
| `/api/profile` | PUT | Update bio, location, interests, vibe profile |
| `/api/profile/screenshots` | POST | Upload 1-10 social screenshots |
| `/api/profile/screenshots/:id` | DELETE | Remove a screenshot |
| `/api/match/discover` | GET | Find potential vibe matches |
| `/api/match/request/:userId` | POST | Send vibe match request |
| `/api/match/pending` | GET | Incoming match requests |
| `/api/match/:matchId` | PUT | Accept/decline match |
| `/api/match` | GET | Accepted matches |
| `/api/activities` | GET/POST | List/create activities |
| `/api/activities/:id/join` | POST | Join an activity |
| `/api/activities/:id/leave` | POST | Leave an activity |
