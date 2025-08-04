const jwt = require('jsonwebtoken');

/**
 * Optional authentication middleware
 * Sets req.user if valid token is provided, but doesn't reject if no token
 * This allows endpoints to work for both authenticated and non-authenticated users
 */
module.exports = function (req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    // No token provided - continue without setting req.user
    return next();
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Invalid token - continue without setting req.user (don't reject)
    console.log('Invalid token provided, continuing without authentication:', err.message);
    next();
  }
};