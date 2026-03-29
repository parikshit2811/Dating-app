const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: [
      'wine-tasting', 'sufi-nights', 'star-gazing', 'cooking',
      'pickleball', 'golf', 'astronomy', 'astrology',
      'hiking', 'book-club', 'jazz-nights', 'whiskey-tasting',
      'photography', 'sailing', 'meditation', 'travel',
      'art-gallery', 'theater', 'cigar-lounge', 'fishing'
    ]
  },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  maxParticipants: { type: Number, default: 10 },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  imageUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', activitySchema);
