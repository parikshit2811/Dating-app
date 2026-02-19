const express = require('express');
const store = require('../store');
const auth = require('../middleware/auth');

const router = express.Router();

// Vibe match algorithm
function calculateVibeScore(userA, userB) {
  // Interest overlap (40%)
  const sharedInterests = userA.interests.filter(i => userB.interests.includes(i));
  const totalUnique = new Set([...userA.interests, ...userB.interests]).size;
  const interestScore = totalUnique > 0 ? (sharedInterests.length / totalUnique) * 100 : 0;

  // Vibe profile similarity (40%)
  const dims = ['adventurous', 'intellectual', 'social', 'creative', 'wellness'];
  let vibeDiff = 0;
  for (const dim of dims) {
    vibeDiff += Math.abs((userA.vibeProfile[dim] || 50) - (userB.vibeProfile[dim] || 50));
  }
  const vibeScore = 100 - (vibeDiff / dims.length);

  // Screenshot authenticity bonus (20%)
  const screenshotBonus = Math.min(
    ((userA.socialScreenshots.length + userB.socialScreenshots.length) / 20) * 100,
    100
  );

  const total = Math.round(
    (interestScore * 0.4) + (vibeScore * 0.4) + (screenshotBonus * 0.2)
  );

  return { score: Math.min(total, 100), sharedInterests };
}

// Discover potential matches
router.get('/discover', auth, (req, res) => {
  const currentUser = store.findUserById(req.user.id);
  if (!currentUser) return res.status(404).json({ msg: 'User not found' });

  const existingMatches = store.findMatches({ userId: req.user.id });
  const matchedUserIds = existingMatches.flatMap(m => m.users).filter(id => id !== req.user.id);

  const candidates = store.findUsers({
    excludeId: req.user.id,
    excludeIds: matchedUserIds,
    hasScreenshots: true,
    limit: 20
  });

  const results = candidates.map(candidate => {
    const { score, sharedInterests } = calculateVibeScore(currentUser, candidate);
    return {
      user: store.publicProfile(candidate),
      vibeScore: score,
      sharedInterests
    };
  }).sort((a, b) => b.vibeScore - a.vibeScore);

  res.json(results);
});

// Send a vibe match request
router.post('/request/:userId', auth, (req, res) => {
  const existing = store.findMatch({ users: [req.user.id, req.params.userId] });
  if (existing) return res.status(400).json({ msg: 'Match already exists' });

  const userA = store.findUserById(req.user.id);
  const userB = store.findUserById(req.params.userId);
  if (!userB) return res.status(404).json({ msg: 'User not found' });

  const { score, sharedInterests } = calculateVibeScore(userA, userB);

  const match = store.createMatch({
    users: [req.user.id, req.params.userId],
    vibeScore: score,
    sharedInterests,
    initiatedBy: req.user.id
  });

  res.json(match);
});

// Accept / decline match
router.put('/:matchId', auth, (req, res) => {
  const { status } = req.body;
  if (!['accepted', 'declined'].includes(status)) {
    return res.status(400).json({ msg: 'Status must be accepted or declined' });
  }

  const match = store.findMatch({ _id: req.params.matchId });
  if (!match) return res.status(404).json({ msg: 'Match not found' });
  if (!match.users.includes(req.user.id)) {
    return res.status(403).json({ msg: 'Not authorized' });
  }

  store.updateMatch(req.params.matchId, { status });
  res.json(match);
});

// Get accepted matches
router.get('/', auth, (req, res) => {
  const matches = store.findMatches({ userId: req.user.id, status: 'accepted' });
  res.json(matches.map(m => store.populateMatch(m)));
});

// Get pending requests for me
router.get('/pending', auth, (req, res) => {
  const matches = store.findMatches({
    userId: req.user.id,
    status: 'pending',
    notInitiatedBy: req.user.id
  });
  res.json(matches.map(m => store.populateMatch(m)));
});

module.exports = router;
