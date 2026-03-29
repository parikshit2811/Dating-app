const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./db');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const matchRoutes = require('./routes/match');
const activityRoutes = require('./routes/activity');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/activities', activityRoutes);

// Serve React build
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

const PORT = process.env.PORT || 5000;

initDB()
  .then(() => {
    console.log('Database tables ready');
    app.listen(PORT, () => {
      console.log(`\nVibeMatch server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database init error:', err.message);
    process.exit(1);
  });
