const jwt = require('jsonwebtoken');

// Create a fresh JWT token for user ID: 6890d3221e8abc08c304b48a
const userId = '6890d3221e8abc08c304b48a';
const JWT_SECRET = 'dfasdfaserfasdfawerafsdwer'; // Actual JWT_SECRET from .env

const payload = {
  id: userId,
  role: 'user',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour from now
};

const token = jwt.sign(payload, JWT_SECRET);

console.log('Fresh JWT Token:');
console.log(token);
console.log('\nTest command:');
console.log(`curl -H "Authorization: Bearer ${token}" "http://localhost:4000/api/v1/users/subcategories?category=&limit=2"`);