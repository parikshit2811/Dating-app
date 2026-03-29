const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  const header = req.header('Authorization');
  if (!header) return res.status(401).json({ msg: 'No token, access denied' });

  const token = header.startsWith('Bearer ') ? header.slice(7) : header;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vibematch_dev_secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Invalid token' });
  }
};
