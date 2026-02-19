const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Update profile (bio, location, interests, vibe profile)
router.put('/', auth, async (req, res) => {
  try {
    const { bio, location, interests, vibeProfile } = req.body;
    const updates = {};
    if (bio !== undefined) updates.bio = bio;
    if (location !== undefined) updates.location = location;
    if (interests !== undefined) updates.interests = interests;
    if (vibeProfile !== undefined) updates.vibeProfile = vibeProfile;

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Upload social screenshots (1-10)
router.post('/screenshots', auth, upload.array('screenshots', 10), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

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
      platform: platforms[i] || 'other',
      imageUrl: `/uploads/${file.filename}`
    }));

    user.socialScreenshots.push(...newScreenshots);
    await user.save();

    res.json({ screenshots: user.socialScreenshots });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete a screenshot
router.delete('/screenshots/:screenshotId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.socialScreenshots = user.socialScreenshots.filter(
      s => s._id.toString() !== req.params.screenshotId
    );
    await user.save();
    res.json({ screenshots: user.socialScreenshots });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get a user's public profile
router.get('/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password -email');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
