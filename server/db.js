const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      age INTEGER NOT NULL,
      bio TEXT DEFAULT '',
      location TEXT DEFAULT '',
      social_screenshots JSONB DEFAULT '[]',
      interests JSONB DEFAULT '[]',
      vibe_profile JSONB DEFAULT '{"adventurous":50,"intellectual":50,"social":50,"creative":50,"wellness":50}',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      users JSONB NOT NULL DEFAULT '[]',
      vibe_score INTEGER DEFAULT 0,
      shared_interests JSONB DEFAULT '[]',
      status TEXT DEFAULT 'pending',
      initiated_by TEXT,
      matched_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      date TIMESTAMPTZ NOT NULL,
      location TEXT NOT NULL,
      max_participants INTEGER DEFAULT 10,
      participants JSONB DEFAULT '[]',
      created_by TEXT,
      image_url TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

module.exports = { pool, initDB };
