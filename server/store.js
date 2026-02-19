// MongoDB-backed data store using Mongoose models
const User = require('./models/User');
const Match = require('./models/Match');
const Activity = require('./models/Activity');

const store = {
  // ---- Users ----
  async findUser(query) {
    return User.findOne(query).lean();
  },

  async findUserById(id) {
    return User.findById(id).lean();
  },

  async createUser({ name, email, password, age }) {
    const user = await User.create({ name, email, password, age });
    return user.toObject();
  },

  async updateUser(id, updates) {
    return User.findByIdAndUpdate(id, updates, { new: true }).lean();
  },

  sanitize(user) {
    if (!user) return null;
    const { password, ...rest } = user;
    return rest;
  },

  publicProfile(user) {
    if (!user) return null;
    const { password, email, ...rest } = user;
    return rest;
  },

  async findUsers(filter = {}) {
    const query = {};
    const excludeIds = [];

    if (filter.excludeId) excludeIds.push(filter.excludeId);
    if (filter.excludeIds) excludeIds.push(...filter.excludeIds);
    if (excludeIds.length > 0) query._id = { $nin: excludeIds };
    if (filter.hasScreenshots) query['socialScreenshots.0'] = { $exists: true };

    let q = User.find(query);
    if (filter.limit) q = q.limit(filter.limit);
    return q.lean();
  },

  // ---- Matches ----
  async findMatch(query) {
    if (query.users) {
      return Match.findOne({ users: { $all: query.users } }).lean();
    }
    return Match.findOne(query).lean();
  },

  async createMatch({ users, vibeScore, sharedInterests, initiatedBy }) {
    const match = await Match.create({ users, vibeScore, sharedInterests, initiatedBy });
    return match.toObject();
  },

  async updateMatch(id, updates) {
    return Match.findByIdAndUpdate(id, updates, { new: true }).lean();
  },

  async findMatches(filter = {}) {
    const query = {};
    if (filter.userId) query.users = filter.userId;
    if (filter.status) query.status = filter.status;
    if (filter.notInitiatedBy) query.initiatedBy = { $ne: filter.notInitiatedBy };
    return Match.find(query).lean();
  },

  async populateMatch(match) {
    const users = await Promise.all(
      match.users.map(async uid => {
        const u = await this.findUserById(uid);
        return this.publicProfile(u);
      })
    );
    return { ...match, users: users.filter(Boolean) };
  },

  // ---- Activities ----
  async createActivity(data) {
    const activity = await Activity.create({
      title: data.title,
      category: data.category,
      description: data.description,
      date: new Date(data.date),
      location: data.location,
      maxParticipants: data.maxParticipants || 10,
      participants: data.participants || [],
      createdBy: data.createdBy,
      imageUrl: data.imageUrl || ''
    });
    return activity.toObject();
  },

  async findActivities(filter = {}) {
    const query = {};
    if (filter.upcoming) query.date = { $gte: new Date() };
    if (filter.category) query.category = filter.category;
    return Activity.find(query).sort({ date: 1 }).lean();
  },

  async findActivityById(id) {
    return Activity.findById(id).lean();
  },

  async populateActivity(activity) {
    const createdByUser = await this.findUserById(activity.createdBy);
    const participants = await Promise.all(
      activity.participants.map(async pid => {
        const u = await this.findUserById(pid);
        return u ? { _id: u._id, name: u.name } : null;
      })
    );
    return {
      ...activity,
      createdBy: createdByUser ? { _id: createdByUser._id, name: createdByUser.name } : null,
      participants: participants.filter(Boolean)
    };
  },

  async joinActivity(activityId, userId) {
    return Activity.findByIdAndUpdate(
      activityId,
      { $addToSet: { participants: userId } },
      { new: true }
    ).lean();
  },

  async leaveActivity(activityId, userId) {
    return Activity.findByIdAndUpdate(
      activityId,
      { $pull: { participants: userId } },
      { new: true }
    ).lean();
  },

  async addScreenshot(userId, screenshot) {
    return User.findByIdAndUpdate(
      userId,
      { $push: { socialScreenshots: screenshot } },
      { new: true }
    ).lean();
  },

  async removeScreenshot(userId, screenshotId) {
    return User.findByIdAndUpdate(
      userId,
      { $pull: { socialScreenshots: { _id: screenshotId } } },
      { new: true }
    ).lean();
  }
};

module.exports = store;
