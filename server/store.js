// In-memory data store — replaces MongoDB for prototype/demo
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const db = {
  users: [],
  matches: [],
  activities: []
};

// Helper: generate a fake ObjectId-like string
const newId = () => uuidv4().replace(/-/g, '').slice(0, 24);

// ---- Users ----
const store = {
  // Find user by query object (supports {email}, {_id})
  findUser(query) {
    if (query.email) return db.users.find(u => u.email === query.email) || null;
    if (query._id) return db.users.find(u => u._id === query._id) || null;
    return null;
  },

  findUserById(id) {
    return db.users.find(u => u._id === id) || null;
  },

  createUser({ name, email, password, age }) {
    const user = {
      _id: newId(),
      name,
      email,
      password,
      age,
      bio: '',
      location: '',
      socialScreenshots: [],
      interests: [],
      vibeProfile: { adventurous: 50, intellectual: 50, social: 50, creative: 50, wellness: 50 },
      createdAt: new Date()
    };
    db.users.push(user);
    return user;
  },

  updateUser(id, updates) {
    const user = db.users.find(u => u._id === id);
    if (!user) return null;
    Object.assign(user, updates);
    return user;
  },

  // Return user without password
  sanitize(user) {
    if (!user) return null;
    const { password, ...rest } = user;
    return rest;
  },

  // Return user without password and email
  publicProfile(user) {
    if (!user) return null;
    const { password, email, ...rest } = user;
    return rest;
  },

  findUsers(filter = {}) {
    let results = [...db.users];
    if (filter.excludeId) {
      results = results.filter(u => u._id !== filter.excludeId);
    }
    if (filter.excludeIds) {
      results = results.filter(u => !filter.excludeIds.includes(u._id));
    }
    if (filter.hasScreenshots) {
      results = results.filter(u => u.socialScreenshots.length > 0);
    }
    if (filter.limit) {
      results = results.slice(0, filter.limit);
    }
    return results;
  },

  // ---- Matches ----
  findMatch(query) {
    if (query._id) return db.matches.find(m => m._id === query._id) || null;
    if (query.users) {
      return db.matches.find(m =>
        query.users.every(uid => m.users.includes(uid))
      ) || null;
    }
    return null;
  },

  createMatch({ users, vibeScore, sharedInterests, initiatedBy }) {
    const match = {
      _id: newId(),
      users,
      vibeScore,
      sharedInterests,
      status: 'pending',
      initiatedBy,
      matchedAt: new Date()
    };
    db.matches.push(match);
    return match;
  },

  updateMatch(id, updates) {
    const match = db.matches.find(m => m._id === id);
    if (!match) return null;
    Object.assign(match, updates);
    return match;
  },

  findMatches(filter = {}) {
    let results = [...db.matches];
    if (filter.userId) {
      results = results.filter(m => m.users.includes(filter.userId));
    }
    if (filter.status) {
      results = results.filter(m => m.status === filter.status);
    }
    if (filter.notInitiatedBy) {
      results = results.filter(m => m.initiatedBy !== filter.notInitiatedBy);
    }
    return results;
  },

  // Populate match users with user objects
  populateMatch(match) {
    return {
      ...match,
      users: match.users.map(uid => this.publicProfile(this.findUserById(uid))).filter(Boolean)
    };
  },

  // ---- Activities ----
  createActivity(data) {
    const activity = {
      _id: newId(),
      title: data.title,
      category: data.category,
      description: data.description,
      date: new Date(data.date),
      location: data.location,
      maxParticipants: data.maxParticipants || 10,
      participants: data.participants || [],
      createdBy: data.createdBy,
      imageUrl: data.imageUrl || '',
      createdAt: new Date()
    };
    db.activities.push(activity);
    return activity;
  },

  findActivities(filter = {}) {
    let results = [...db.activities];
    if (filter.upcoming) {
      results = results.filter(a => new Date(a.date) >= new Date());
    }
    if (filter.category) {
      results = results.filter(a => a.category === filter.category);
    }
    results.sort((a, b) => new Date(a.date) - new Date(b.date));
    return results;
  },

  findActivityById(id) {
    return db.activities.find(a => a._id === id) || null;
  },

  // Populate activity with user names
  populateActivity(activity) {
    return {
      ...activity,
      createdBy: (() => {
        const u = this.findUserById(activity.createdBy);
        return u ? { _id: u._id, name: u.name } : null;
      })(),
      participants: activity.participants.map(pid => {
        const u = this.findUserById(pid);
        return u ? { _id: u._id, name: u.name } : null;
      }).filter(Boolean)
    };
  },

  // ---- Seed demo data ----
  async seed() {
    if (db.users.length > 0) return; // already seeded

    const salt = await bcrypt.genSalt(10);
    const demoPassword = await bcrypt.hash('demo123', salt);

    const demoUsers = [
      {
        name: 'James Mitchell', age: 52, email: 'james@demo.com',
        bio: 'Wine collector, amateur astronomer. Spent 20 years in tech, now enjoying the finer things.',
        location: 'Napa Valley, CA',
        interests: ['wine-tasting', 'astronomy', 'star-gazing', 'golf', 'photography', 'travel'],
        vibeProfile: { adventurous: 75, intellectual: 85, social: 60, creative: 70, wellness: 55 },
        socialScreenshots: [
          { _id: newId(), platform: 'linkedin', imageUrl: '', uploadedAt: new Date() },
          { _id: newId(), platform: 'instagram', imageUrl: '', uploadedAt: new Date() }
        ]
      },
      {
        name: 'Robert Chen', age: 48, email: 'robert@demo.com',
        bio: 'Former chef turned food critic. Love Sufi music and spontaneous road trips.',
        location: 'San Francisco, CA',
        interests: ['cooking', 'sufi-nights', 'travel', 'whiskey-tasting', 'book-club', 'meditation'],
        vibeProfile: { adventurous: 80, intellectual: 65, social: 90, creative: 85, wellness: 70 },
        socialScreenshots: [
          { _id: newId(), platform: 'instagram', imageUrl: '', uploadedAt: new Date() },
          { _id: newId(), platform: 'facebook', imageUrl: '', uploadedAt: new Date() },
          { _id: newId(), platform: 'x', imageUrl: '', uploadedAt: new Date() }
        ]
      },
      {
        name: 'David Okafor', age: 55, email: 'david@demo.com',
        bio: 'Jazz enthusiast, weekend sailor. Looking for genuine connections over shared experiences.',
        location: 'Chicago, IL',
        interests: ['jazz-nights', 'sailing', 'wine-tasting', 'theater', 'cigar-lounge', 'fishing'],
        vibeProfile: { adventurous: 60, intellectual: 70, social: 75, creative: 80, wellness: 45 },
        socialScreenshots: [
          { _id: newId(), platform: 'linkedin', imageUrl: '', uploadedAt: new Date() },
          { _id: newId(), platform: 'facebook', imageUrl: '', uploadedAt: new Date() }
        ]
      },
      {
        name: 'Michael Torres', age: 50, email: 'michael@demo.com',
        bio: 'Retired architect. Now I stargaze, play pickleball, and cook Italian food for friends.',
        location: 'Austin, TX',
        interests: ['star-gazing', 'pickleball', 'cooking', 'art-gallery', 'hiking', 'photography'],
        vibeProfile: { adventurous: 70, intellectual: 75, social: 65, creative: 90, wellness: 80 },
        socialScreenshots: [
          { _id: newId(), platform: 'instagram', imageUrl: '', uploadedAt: new Date() },
          { _id: newId(), platform: 'x', imageUrl: '', uploadedAt: new Date() },
          { _id: newId(), platform: 'linkedin', imageUrl: '', uploadedAt: new Date() }
        ]
      },
      {
        name: 'William Park', age: 61, email: 'william@demo.com',
        bio: 'Golf addict, whiskey connoisseur. Believe the best conversations happen under the stars.',
        location: 'Scottsdale, AZ',
        interests: ['golf', 'whiskey-tasting', 'star-gazing', 'cigar-lounge', 'travel', 'astrology'],
        vibeProfile: { adventurous: 55, intellectual: 60, social: 85, creative: 40, wellness: 50 },
        socialScreenshots: [
          { _id: newId(), platform: 'linkedin', imageUrl: '', uploadedAt: new Date() },
          { _id: newId(), platform: 'facebook', imageUrl: '', uploadedAt: new Date() },
          { _id: newId(), platform: 'snapchat', imageUrl: '', uploadedAt: new Date() }
        ]
      }
    ];

    for (const data of demoUsers) {
      const user = {
        _id: newId(),
        name: data.name,
        email: data.email,
        password: demoPassword,
        age: data.age,
        bio: data.bio,
        location: data.location,
        interests: data.interests,
        vibeProfile: data.vibeProfile,
        socialScreenshots: data.socialScreenshots,
        createdAt: new Date()
      };
      db.users.push(user);
    }

    // Seed some activities
    const now = new Date();
    const demoActivities = [
      {
        title: 'Napa Valley Evening Wine Tasting',
        category: 'wine-tasting',
        description: 'Join us for a curated tasting of reserve cabernets at a private estate. Small group, great conversation.',
        date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        location: 'St. Helena, Napa Valley',
        maxParticipants: 8,
        createdBy: db.users[0]._id,
        participants: [db.users[0]._id, db.users[2]._id]
      },
      {
        title: 'Sufi Music & Poetry Night',
        category: 'sufi-nights',
        description: 'An evening of Sufi qawwali music, Rumi poetry readings, and chai. Open hearts welcome.',
        date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        location: 'The Mystic Lounge, San Francisco',
        maxParticipants: 15,
        createdBy: db.users[1]._id,
        participants: [db.users[1]._id]
      },
      {
        title: 'Stargazing at Mount Tam',
        category: 'star-gazing',
        description: 'Bring a blanket and a thermos. Telescopes provided. We\'ll spot Jupiter, the Pleiades, and maybe a few shooting stars.',
        date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        location: 'Mount Tamalpais, Mill Valley',
        maxParticipants: 12,
        createdBy: db.users[3]._id,
        participants: [db.users[3]._id, db.users[0]._id, db.users[4]._id]
      },
      {
        title: 'Italian Cooking Masterclass',
        category: 'cooking',
        description: 'Handmade pasta, osso buco, and tiramisu. We cook together, eat together, and have a great time.',
        date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        location: 'Chef\'s Kitchen, Austin TX',
        maxParticipants: 6,
        createdBy: db.users[3]._id,
        participants: [db.users[3]._id, db.users[1]._id]
      },
      {
        title: 'Weekend Golf & Whiskey',
        category: 'golf',
        description: '18 holes at TPC Scottsdale followed by a private whiskey tasting. Handicap doesn\'t matter, camaraderie does.',
        date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        location: 'TPC Scottsdale, AZ',
        maxParticipants: 4,
        createdBy: db.users[4]._id,
        participants: [db.users[4]._id]
      }
    ];

    for (const data of demoActivities) {
      this.createActivity(data);
    }

    console.log(`Seeded ${db.users.length} demo users and ${db.activities.length} demo activities`);
    console.log('\nDemo login: any email above with password "demo123"');
    console.log('  e.g.  email: james@demo.com  password: demo123\n');
  }
};

module.exports = store;
