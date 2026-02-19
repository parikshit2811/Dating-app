const express = require('express');
const Activity = require('../models/Activity');
const auth = require('../middleware/auth');

const router = express.Router();

// Create an activity
router.post('/', auth, async (req, res) => {
  try {
    const { title, category, description, date, location, maxParticipants, imageUrl } = req.body;

    const activity = new Activity({
      title,
      category,
      description,
      date,
      location,
      maxParticipants: maxParticipants || 10,
      imageUrl: imageUrl || '',
      createdBy: req.user.id,
      participants: [req.user.id]
    });

    await activity.save();
    res.json(activity);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all upcoming activities
router.get('/', auth, async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { date: { $gte: new Date() } };
    if (category) filter.category = category;

    const activities = await Activity.find(filter)
      .populate('createdBy', 'name')
      .populate('participants', 'name')
      .sort({ date: 1 });
    res.json(activities);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Join an activity
router.post('/:activityId/join', auth, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.activityId);
    if (!activity) return res.status(404).json({ msg: 'Activity not found' });

    if (activity.participants.includes(req.user.id)) {
      return res.status(400).json({ msg: 'Already joined' });
    }

    if (activity.participants.length >= activity.maxParticipants) {
      return res.status(400).json({ msg: 'Activity is full' });
    }

    activity.participants.push(req.user.id);
    await activity.save();
    res.json(activity);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Leave an activity
router.post('/:activityId/leave', auth, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.activityId);
    if (!activity) return res.status(404).json({ msg: 'Activity not found' });

    activity.participants = activity.participants.filter(
      p => p.toString() !== req.user.id
    );
    await activity.save();
    res.json(activity);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get single activity
router.get('/:activityId', auth, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.activityId)
      .populate('createdBy', 'name')
      .populate('participants', 'name');
    if (!activity) return res.status(404).json({ msg: 'Activity not found' });
    res.json(activity);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
