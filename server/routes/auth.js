const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('../store');
const auth = require('../middleware/auth');

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'vibematch_dev_secret';

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, age } = req.body;

    if (age < 45 || age > 65) {
      return res.status(400).json({ msg: 'This app is designed for ages 45-65' });
    }

    const existing = store.findUser({ email });
    if (existing) return res.status(400).json({ msg: 'Email already registered' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = store.createUser({ name, email, password: hashed, age });
    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, age: user.age } });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = store.findUser({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, age: user.age } });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, (req, res) => {
  const user = store.findUserById(req.user.id);
  if (!user) return res.status(404).json({ msg: 'User not found' });
  res.json(store.sanitize(user));
});

module.exports = router;
