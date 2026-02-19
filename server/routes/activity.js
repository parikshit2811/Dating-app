const express = require('express');
const store = require('../store');
const auth = require('../middleware/auth');

const router = express.Router();

// Create activity
router.post('/', auth, (req, res) => {
  const { title, category, description, date, location, maxParticipants, imageUrl } = req.body;

  const activity = store.createActivity({
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

  res.json(store.populateActivity(activity));
});

// Get upcoming activities
router.get('/', auth, (req, res) => {
  const { category } = req.query;
  const activities = store.findActivities({ upcoming: true, category: category || undefined });
  res.json(activities.map(a => store.populateActivity(a)));
});

// Join activity
router.post('/:activityId/join', auth, (req, res) => {
  const activity = store.findActivityById(req.params.activityId);
  if (!activity) return res.status(404).json({ msg: 'Activity not found' });

  if (activity.participants.includes(req.user.id)) {
    return res.status(400).json({ msg: 'Already joined' });
  }

  if (activity.participants.length >= activity.maxParticipants) {
    return res.status(400).json({ msg: 'Activity is full' });
  }

  activity.participants.push(req.user.id);
  res.json(store.populateActivity(activity));
});

// Leave activity
router.post('/:activityId/leave', auth, (req, res) => {
  const activity = store.findActivityById(req.params.activityId);
  if (!activity) return res.status(404).json({ msg: 'Activity not found' });

  activity.participants = activity.participants.filter(p => p !== req.user.id);
  res.json(store.populateActivity(activity));
});

// Get single activity
router.get('/:activityId', auth, (req, res) => {
  const activity = store.findActivityById(req.params.activityId);
  if (!activity) return res.status(404).json({ msg: 'Activity not found' });
  res.json(store.populateActivity(activity));
});

module.exports = router;
