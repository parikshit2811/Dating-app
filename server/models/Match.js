const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  vibeScore: { type: Number, min: 0, max: 100 },
  sharedInterests: [String],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  },
  initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  matchedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Match', matchSchema);
