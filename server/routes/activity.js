const express = require('express');
const store = require('../store');
const auth = require('../middleware/auth');

const router = express.Router();

// Create activity
router.post('/', auth, async (req, res) => {
  const { title, category, description, date, location, maxParticipants, imageUrl } = req.body;

  const activity = await store.createActivity({
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

  const populated = await store.populateActivity(activity);
  res.json(populated);
});

// Get upcoming activities
router.get('/', auth, async (req, res) => {
  const { category } = req.query;
  const activities = await store.findActivities({ upcoming: true, category: category || undefined });
  const populated = await Promise.all(activities.map(a => store.populateActivity(a)));
  res.json(populated);
});

// Join activity
router.post('/:activityId/join', auth, async (req, res) => {
  const activity = await store.findActivityById(req.params.activityId);
  if (!activity) return res.status(404).json({ msg: 'Activity not found' });

  if (activity.participants.map(p => p.toString()).includes(req.user.id)) {
    return res.status(400).json({ msg: 'Already joined' });
  }

  if (activity.participants.length >= activity.maxParticipants) {
    return res.status(400).json({ msg: 'Activity is full' });
  }

  const updated = await store.joinActivity(req.params.activityId, req.user.id);
  const populated = await store.populateActivity(updated);
  res.json(populated);
});

// Leave activity
router.post('/:activityId/leave', auth, async (req, res) => {
  const activity = await store.findActivityById(req.params.activityId);
  if (!activity) return res.status(404).json({ msg: 'Activity not found' });

  const updated = await store.leaveActivity(req.params.activityId, req.user.id);
  const populated = await store.populateActivity(updated);
  res.json(populated);
});

// Get single activity
router.get('/:activityId', auth, async (req, res) => {
  const activity = await store.findActivityById(req.params.activityId);
  if (!activity) return res.status(404).json({ msg: 'Activity not found' });
  const populated = await store.populateActivity(activity);
  res.json(populated);
});

module.exports = router;
