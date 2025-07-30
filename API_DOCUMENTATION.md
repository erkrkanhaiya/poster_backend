# Banner App API Documentation

## OTP-Based Authentication System

This application now uses OTP-based authentication instead of password-based authentication for users.

### Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/banner-app

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=4000

# OTP Configuration
DEV_BYPASS=true
```

### API Endpoints

#### 1. Send OTP (Login/Register)
**POST** `/user/login`

Sends OTP to the provided phone number for authentication.

**Request Body:**
```json
{
  "phone": "+1234567890"
}
```

**Response (Development Mode):**
```json
{
  "status": true,
  "message": "OTP sent successfully",
  "data": {
    "otp": "123456",
    "message": "Use this OTP for verification (development mode)"
  }
}
```

**Response (Production Mode):**
```json
{
  "status": true,
  "message": "OTP sent successfully",
  "data": {}
}
```

#### 2. Send OTP (Alternative Endpoint)
**POST** `/user/send-otp`

Same functionality as `/user/login` but with rate limiting (1 minute between requests).

**Request Body:**
```json
{
  "phone": "+1234567890"
}
```

**Response:** Same as above

#### 3. Verify OTP
**POST** `/user/verify-otp`

Verifies the OTP and creates/logs in the user.

**Request Body:**
```json
{
  "phone": "+1234567890",
  "otp": "123456"
}
```

**Response:**
```json
{
  "status": true,
  "message": "OTP verified successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "phone": "+1234567890",
      "name": "John Doe",
      "email": "john@example.com",
      "isProfileCompleted": true,
      "createdAt": "2023-09-06T10:30:00.000Z",
      "updatedAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

#### 4. Complete Profile
**POST** `/user/complete-profile`

Completes the user profile with name (required field).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "John Doe"
}
```

**Response:**
```json
{
  "status": true,
  "message": "Profile completed",
  "data": {
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "phone": "+1234567890",
      "name": "John Doe",
      "email": "john@example.com",
      "isProfileCompleted": true
    }
  }
}
```

#### 5. Get User Profile
**GET** `/user/profile`

Gets the current user's profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "status": true,
  "message": "User profile retrieved",
  "data": {
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "phone": "+1234567890",
      "name": "John Doe",
      "email": "john@example.com",
      "isProfileCompleted": true
    }
  }
}
```

#### 6. Update User Profile
**PUT** `/user/profile`

Updates the user's profile information. All fields are optional - only provided fields will be updated.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body (all fields optional):**
```json
{
  "name": "John Doe Updated",
  "email": "john.updated@example.com",
  "password": "newpassword123",
  "interests": ["64f8a1b2c3d4e5f6a7b8c9d0", "64f8a1b2c3d4e5f6a7b8c9d1"],
  "profilePhoto": "https://example.com/profile.jpg",
  "logo": "https://example.com/logo.png"
}
```

**Example - Update only profile photo:**
```json
{
  "profilePhoto": "https://example.com/new-profile.jpg"
}
```

**Example - Update only interests:**
```json
{
  "interests": ["64f8a1b2c3d4e5f6a7b8c9d0"]
}
```

**Example - Clear interests (set to empty array):**
```json
{
  "interests": []
}
```

**Response:**
```json
{
  "status": true,
  "message": "User profile updated",
  "data": {
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "phone": "+1234567890",
      "name": "John Doe Updated",
      "email": "john.updated@example.com",
      "isProfileCompleted": true
    }
  }
}
```

#### 7. Get All User (Admin Only)
**GET** `/user/all`

Gets all user in the system (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "status": true,
  "message": "Users fetched successfully",
  "data": {
    "users": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "phone": "+1234567890",
        "name": "John Doe",
        "email": "john@example.com",
        "isProfileCompleted": true,
        "createdAt": "2023-09-06T10:30:00.000Z",
        "updatedAt": "2023-09-06T10:30:00.000Z"
      }
    ],
    "total": 1
  }
}
```

#### 8. Get User by ID (Admin Only)
**GET** `/user/:id`

Gets a specific user by ID (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "status": true,
  "message": "User fetched successfully",
  "data": {
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "phone": "+1234567890",
      "name": "John Doe",
      "email": "john@example.com",
      "interests": [
        {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
          "title": "Guru Purnima",
          "slug": "guru-purnima"
        }
      ],
      "profilePhoto": "https://example.com/profile.jpg",
      "logo": "https://example.com/logo.png",
      "isProfileCompleted": true,
      "createdAt": "2023-09-06T10:30:00.000Z",
      "updatedAt": "2023-09-06T10:30:00.000Z"
    }
  }
}
```

#### 9. Get Categories for Interest Selection
**GET** `/user/categories`

Gets all available categories for user interest selection (public endpoint).

**Response:**
```json
{
  "status": true,
  "message": "Categories fetched successfully",
  "data": {
    "categories": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "title": "Guru Purnima",
        "slug": "guru-purnima",
        "images": []
      },
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "title": "Sawan Mahina",
        "slug": "sawan-mahina",
        "images": []
      }
    ],
    "total": 2
  }
}
```

#### 10. Logout
**POST** `/user/logout`

Logs out the user (client-side token deletion).

**Response:**
```json
{
  "status": true,
  "message": "Logged out successfully",
  "data": {}
}
```

### OTP System Features

1. **Database Storage**: OTPs are stored in MongoDB with automatic expiration
2. **Rate Limiting**: User can only request OTP once per minute
3. **Attempt Tracking**: Failed OTP attempts are tracked (max 3 attempts)
4. **Development Mode**: Set `DEV_BYPASS=true` to always use "123456" as OTP
5. **Automatic Cleanup**: Expired OTPs are automatically deleted from the database

### Profile Update Features

1. **Optional Fields**: All profile fields are optional - only provided fields will be updated
2. **Partial Updates**: User can update any combination of fields
3. **Field Validation**: Provided fields are validated before update
4. **Empty Values**: User can set fields to empty strings or null values
5. **Array Handling**: Interests can be updated to empty array to clear all interests

### Error Responses

#### Invalid Phone Number
```json
{
  "status": false,
  "message": "Valid phone number is required",
  "data": {}
}
```

#### OTP Not Found or Expired
```json
{
  "status": false,
  "message": "OTP not found or expired",
  "data": {}
}
```

#### Invalid OTP
```json
{
  "status": false,
  "message": "Invalid OTP",
  "data": {}
}
```

#### Too Many Failed Attempts
```json
{
  "status": false,
  "message": "Too many failed attempts. Please request a new OTP",
  "data": {}
}
```

#### Rate Limiting
```json
{
  "status": false,
  "message": "Please wait 1 minute before requesting another OTP",
  "data": {}
}
```

### Database Models

#### OTP Model
```javascript
{
  phone: String (required),
  otp: String (required),
  expiresAt: Date (required, TTL index),
  isUsed: Boolean (default: false),
  attempts: Number (default: 0),
  createdAt: Date (default: now)
}
```

#### User Model
```javascript
{
  phone: String (required, unique),
  name: String,
  email: String,
  password: String (optional, for future use),
  isProfileCompleted: Boolean (default: false),
  interests: [ObjectId] (references to Category model),
  profilePhoto: String (URL),
  logo: String (URL),
  createdAt: Date (default: now),
  updatedAt: Date (default: now)
}
```

### Testing the API

1. **Start the server**: `npm run start:backend`
2. **Send OTP**: Use `/user/login` or `/user/send-otp` with a phone number
3. **Verify OTP**: Use `/user/verify-otp` with the phone and OTP
4. **Complete Profile**: Use the returned JWT token to complete the profile
5. **Access Protected Routes**: Use the JWT token in the Authorization header

### Development vs Production

- **Development**: Set `DEV_BYPASS=true` to always use "123456" as OTP
- **Production**: Set `DEV_BYPASS=false` and implement SMS service integration 