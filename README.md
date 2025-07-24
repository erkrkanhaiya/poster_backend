# Banner Node.js Project

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up your MongoDB connection in `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/bannerdb
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
3. Start the server:
   ```bash
   node server.js
   ```

## API Endpoints

### Admin Login
- **POST** `/admin/login`
  - Body: `{ "email": "admin@example.com", "password": "yourpassword" }`
  - Returns: `{ token: "JWT_TOKEN" }`

### User Login
- **POST** `/users/login`
  - Body: `{ "email": "user@example.com", "password": "yourpassword" }`
  - Returns: `{ token: "JWT_TOKEN" }`

## Folder Structure
- `admin/` - Admin models, controllers, routes
- `users/` - User models, controllers, routes
- `server.js` - Main server file 