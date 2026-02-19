const express = require('express');
const store = require('../store');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Update profile
router.put('/', auth, (req, res) => {
  const { bio, location, interests, vibeProfile } = req.body;
  const updates = {};
  if (bio !== undefined) updates.bio = bio;
  if (location !== undefined) updates.location = location;
  if (interests !== undefined) updates.interests = interests;
  if (vibeProfile !== undefined) updates.vibeProfile = vibeProfile;

  const user = store.updateUser(req.user.id, updates);
  if (!user) return res.status(404).json({ msg: 'User not found' });
  res.json(store.sanitize(user));
});

// Upload social screenshots (1-10)
router.post('/screenshots', auth, upload.array('screenshots', 10), (req, res) => {
  const user = store.findUserById(req.user.id);
  if (!user) return res.status(404).json({ msg: 'User not found' });

  const currentCount = user.socialScreenshots.length;
  const newCount = req.files.length;

  if (currentCount + newCount > 10) {
    return res.status(400).json({ msg: `You can upload up to 10 screenshots. You have ${currentCount}, trying to add ${newCount}.` });
  }

  if (newCount < 1) {
    return res.status(400).json({ msg: 'Upload at least 1 screenshot' });
  }

  const platforms = req.body.platforms
    ? (Array.isArray(req.body.platforms) ? req.body.platforms : [req.body.platforms])
    : [];

  const newScreenshots = req.files.map((file, i) => ({
    _id: uuidv4().replace(/-/g, '').slice(0, 24),
    platform: platforms[i] || 'other',
    imageUrl: `/uploads/${file.filename}`,
    uploadedAt: new Date()
  }));

  user.socialScreenshots.push(...newScreenshots);
  res.json({ screenshots: user.socialScreenshots });
});

// Delete a screenshot
router.delete('/screenshots/:screenshotId', auth, (req, res) => {
  const user = store.findUserById(req.user.id);
  if (!user) return res.status(404).json({ msg: 'User not found' });

  user.socialScreenshots = user.socialScreenshots.filter(
    s => s._id !== req.params.screenshotId
  );
  res.json({ screenshots: user.socialScreenshots });
});

// Get a user's public profile
router.get('/:userId', auth, (req, res) => {
  const user = store.findUserById(req.params.userId);
  if (!user) return res.status(404).json({ msg: 'User not found' });
  res.json(store.publicProfile(user));
});

module.exports = router;
