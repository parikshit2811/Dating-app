// PostgreSQL-backed data store
const { pool } = require('./db');
const { v4: uuidv4 } = require('uuid');

function newId() {
  return uuidv4();
}

function transformUser(row) {
  if (!row) return null;
  return {
    _id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    age: row.age,
    bio: row.bio,
    location: row.location,
    socialScreenshots: row.social_screenshots || [],
    interests: row.interests || [],
    vibeProfile: row.vibe_profile,
    createdAt: row.created_at
  };
}

function transformMatch(row) {
  if (!row) return null;
  return {
    _id: row.id,
    users: row.users || [],
    vibeScore: row.vibe_score,
    sharedInterests: row.shared_interests || [],
    status: row.status,
    initiatedBy: row.initiated_by,
    matchedAt: row.matched_at
  };
}

function transformActivity(row) {
  if (!row) return null;
  return {
    _id: row.id,
    title: row.title,
    category: row.category,
    description: row.description,
    date: row.date,
    location: row.location,
    maxParticipants: row.max_participants,
    participants: row.participants || [],
    createdBy: row.created_by,
    imageUrl: row.image_url,
    createdAt: row.created_at
  };
}

const store = {
  // ---- Users ----
  async findUser(query) {
    let result;
    if (query.email) {
      result = await pool.query('SELECT * FROM users WHERE email = $1', [query.email]);
    } else if (query._id) {
      result = await pool.query('SELECT * FROM users WHERE id = $1', [query._id]);
    } else {
      return null;
    }
    return transformUser(result.rows[0]);
  },

  async findUserById(id) {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return transformUser(result.rows[0]);
  },

  async createUser({ name, email, password, age }) {
    const id = newId();
    const result = await pool.query(
      'INSERT INTO users (id, name, email, password, age) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, name, email, password, age]
    );
    return transformUser(result.rows[0]);
  },

  async updateUser(id, updates) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (updates.bio !== undefined) { fields.push(`bio = $${idx++}`); values.push(updates.bio); }
    if (updates.location !== undefined) { fields.push(`location = $${idx++}`); values.push(updates.location); }
    if (updates.interests !== undefined) { fields.push(`interests = $${idx++}`); values.push(JSON.stringify(updates.interests)); }
    if (updates.vibeProfile !== undefined) { fields.push(`vibe_profile = $${idx++}`); values.push(JSON.stringify(updates.vibeProfile)); }
    if (updates.socialScreenshots !== undefined) { fields.push(`social_screenshots = $${idx++}`); values.push(JSON.stringify(updates.socialScreenshots)); }

    if (fields.length === 0) return this.findUserById(id);

    values.push(id);
    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return transformUser(result.rows[0]);
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
    const conditions = [];
    const values = [];
    let idx = 1;

    if (filter.excludeId) {
      conditions.push(`id != $${idx++}`);
      values.push(filter.excludeId);
    }
    if (filter.excludeIds && filter.excludeIds.length > 0) {
      conditions.push(`NOT (id = ANY($${idx++}::text[]))`);
      values.push(filter.excludeIds);
    }
    if (filter.hasScreenshots) {
      conditions.push(`social_screenshots != '[]'::jsonb`);
    }

    let sql = 'SELECT * FROM users';
    if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
    if (filter.limit) { sql += ` LIMIT $${idx++}`; values.push(filter.limit); }

    const result = await pool.query(sql, values);
    return result.rows.map(transformUser);
  },

  // ---- Matches ----
  async findMatch(query) {
    let result;
    if (query._id) {
      result = await pool.query('SELECT * FROM matches WHERE id = $1', [query._id]);
    } else if (query.users) {
      result = await pool.query(
        'SELECT * FROM matches WHERE users @> $1::jsonb',
        [JSON.stringify(query.users)]
      );
    } else {
      return null;
    }
    return transformMatch(result.rows[0]);
  },

  async createMatch({ users, vibeScore, sharedInterests, initiatedBy }) {
    const id = newId();
    const result = await pool.query(
      'INSERT INTO matches (id, users, vibe_score, shared_interests, initiated_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, JSON.stringify(users), vibeScore, JSON.stringify(sharedInterests), initiatedBy]
    );
    return transformMatch(result.rows[0]);
  },

  async updateMatch(id, updates) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (updates.status) { fields.push(`status = $${idx++}`); values.push(updates.status); }

    if (fields.length === 0) return this.findMatch({ _id: id });

    values.push(id);
    const result = await pool.query(
      `UPDATE matches SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return transformMatch(result.rows[0]);
  },

  async findMatches(filter = {}) {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (filter.userId) {
      conditions.push(`users @> $${idx++}::jsonb`);
      values.push(JSON.stringify([filter.userId]));
    }
    if (filter.status) {
      conditions.push(`status = $${idx++}`);
      values.push(filter.status);
    }
    if (filter.notInitiatedBy) {
      conditions.push(`initiated_by != $${idx++}`);
      values.push(filter.notInitiatedBy);
    }

    let sql = 'SELECT * FROM matches';
    if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');

    const result = await pool.query(sql, values);
    return result.rows.map(transformMatch);
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
    const id = newId();
    const result = await pool.query(
      `INSERT INTO activities (id, title, category, description, date, location, max_participants, participants, created_by, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [id, data.title, data.category, data.description, new Date(data.date), data.location,
       data.maxParticipants || 10, JSON.stringify(data.participants || []), data.createdBy, data.imageUrl || '']
    );
    return transformActivity(result.rows[0]);
  },

  async findActivities(filter = {}) {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (filter.upcoming) {
      conditions.push(`date >= $${idx++}`);
      values.push(new Date());
    }
    if (filter.category) {
      conditions.push(`category = $${idx++}`);
      values.push(filter.category);
    }

    let sql = 'SELECT * FROM activities';
    if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY date ASC';

    const result = await pool.query(sql, values);
    return result.rows.map(transformActivity);
  },

  async findActivityById(id) {
    const result = await pool.query('SELECT * FROM activities WHERE id = $1', [id]);
    return transformActivity(result.rows[0]);
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
    const activity = await this.findActivityById(activityId);
    if (!activity) return null;
    const participants = [...activity.participants, userId];
    const result = await pool.query(
      'UPDATE activities SET participants = $1 WHERE id = $2 RETURNING *',
      [JSON.stringify(participants), activityId]
    );
    return transformActivity(result.rows[0]);
  },

  async leaveActivity(activityId, userId) {
    const activity = await this.findActivityById(activityId);
    if (!activity) return null;
    const participants = activity.participants.filter(p => p !== userId);
    const result = await pool.query(
      'UPDATE activities SET participants = $1 WHERE id = $2 RETURNING *',
      [JSON.stringify(participants), activityId]
    );
    return transformActivity(result.rows[0]);
  },

  async addScreenshot(userId, screenshot) {
    const user = await this.findUserById(userId);
    if (!user) return null;
    const screenshots = [...user.socialScreenshots, { ...screenshot, _id: newId() }];
    return this.updateUser(userId, { socialScreenshots: screenshots });
  },

  async removeScreenshot(userId, screenshotId) {
    const user = await this.findUserById(userId);
    if (!user) return null;
    const screenshots = user.socialScreenshots.filter(s => s._id !== screenshotId);
    return this.updateUser(userId, { socialScreenshots: screenshots });
  }
};

module.exports = store;
