const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number, required: true, min: 45, max: 65 },
  bio: { type: String, default: '' },
  location: { type: String, default: '' },
  socialScreenshots: [{
    platform: {
      type: String,
      enum: ['linkedin', 'instagram', 'facebook', 'x', 'snapchat', 'tiktok', 'other']
    },
    imageUrl: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  interests: [{
    type: String,
    enum: [
      'wine-tasting', 'sufi-nights', 'star-gazing', 'cooking',
      'pickleball', 'golf', 'astronomy', 'astrology',
      'hiking', 'book-club', 'jazz-nights', 'whiskey-tasting',
      'photography', 'sailing', 'meditation', 'travel',
      'art-gallery', 'theater', 'cigar-lounge', 'fishing'
    ]
  }],
  vibeProfile: {
    adventurous: { type: Number, default: 50, min: 0, max: 100 },
    intellectual: { type: Number, default: 50, min: 0, max: 100 },
    social: { type: Number, default: 50, min: 0, max: 100 },
    creative: { type: Number, default: 50, min: 0, max: 100 },
    wellness: { type: Number, default: 50, min: 0, max: 100 }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
