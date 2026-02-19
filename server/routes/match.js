const express = require('express');
const User = require('../models/User');
const Match = require('../models/Match');
const auth = require('../middleware/auth');

const router = express.Router();

// Vibe match algorithm
function calculateVibeScore(userA, userB) {
  // Interest overlap (weighted 40%)
  const sharedInterests = userA.interests.filter(i => userB.interests.includes(i));
  const totalUnique = new Set([...userA.interests, ...userB.interests]).size;
  const interestScore = totalUnique > 0 ? (sharedInterests.length / totalUnique) * 100 : 0;

  // Vibe profile similarity (weighted 40%)
  const dims = ['adventurous', 'intellectual', 'social', 'creative', 'wellness'];
  let vibeDiff = 0;
  for (const dim of dims) {
    vibeDiff += Math.abs((userA.vibeProfile[dim] || 50) - (userB.vibeProfile[dim] || 50));
  }
  const vibeScore = 100 - (vibeDiff / dims.length);

  // Screenshot count bonus (weighted 20%) - more screenshots = more authentic
  const screenshotBonus = Math.min(
    ((userA.socialScreenshots.length + userB.socialScreenshots.length) / 20) * 100,
    100
  );

  const total = Math.round(
    (interestScore * 0.4) + (vibeScore * 0.4) + (screenshotBonus * 0.2)
  );

  return { score: Math.min(total, 100), sharedInterests };
}

// Discover - get potential matches
router.get('/discover', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);

    // Find existing match user IDs to exclude
    const existingMatches = await Match.find({ users: req.user.id });
    const matchedUserIds = existingMatches.flatMap(m =>
      m.users.map(u => u.toString())
    ).filter(id => id !== req.user.id);

    const candidates = await User.find({
      _id: { $ne: req.user.id, $nin: matchedUserIds },
      socialScreenshots: { $exists: true, $not: { $size: 0 } }
    }).select('-password -email').limit(20);

    const results = candidates.map(candidate => {
      const { score, sharedInterests } = calculateVibeScore(currentUser, candidate);
      return {
        user: candidate,
        vibeScore: score,
        sharedInterests
      };
    }).sort((a, b) => b.vibeScore - a.vibeScore);

    res.json(results);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Send a vibe match request
router.post('/request/:userId', auth, async (req, res) => {
  try {
    const existing = await Match.findOne({
      users: { $all: [req.user.id, req.params.userId] }
    });
    if (existing) return res.status(400).json({ msg: 'Match already exists' });

    const userA = await User.findById(req.user.id);
    const userB = await User.findById(req.params.userId);
    if (!userB) return res.status(404).json({ msg: 'User not found' });

    const { score, sharedInterests } = calculateVibeScore(userA, userB);

    const match = new Match({
      users: [req.user.id, req.params.userId],
      vibeScore: score,
      sharedInterests,
      initiatedBy: req.user.id
    });
    await match.save();

    res.json(match);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Accept / decline match
router.put('/:matchId', auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ msg: 'Status must be accepted or declined' });
    }

    const match = await Match.findById(req.params.matchId);
    if (!match) return res.status(404).json({ msg: 'Match not found' });

    if (!match.users.includes(req.user.id)) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    match.status = status;
    await match.save();
    res.json(match);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get my matches
router.get('/', auth, async (req, res) => {
  try {
    const matches = await Match.find({
      users: req.user.id,
      status: 'accepted'
    }).populate('users', '-password -email');
    res.json(matches);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get pending match requests for me
router.get('/pending', auth, async (req, res) => {
  try {
    const matches = await Match.find({
      users: req.user.id,
      initiatedBy: { $ne: req.user.id },
      status: 'pending'
    }).populate('users', '-password -email');
    res.json(matches);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
