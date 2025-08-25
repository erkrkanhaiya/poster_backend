# Fast2SMS Integration Guide

This guide explains how to set up and use Fast2SMS API for sending OTP messages in the Banner App.

## Overview

Fast2SMS is an Indian SMS service provider that allows you to send SMS messages to Indian mobile numbers. This integration has been added to send 4-digit OTP messages for user authentication.

## Features

- ✅ Send 4-digit OTP via SMS
- ✅ Custom message support
- ✅ Balance checking
- ✅ Phone number validation (10 digits for India)
- ✅ Error handling and logging
- ✅ Development mode support

## Setup Instructions

### 1. Install Dependencies

The Fast2SMS package has been added to `package.json`. Install it by running:

```bash
npm install
```

### 2. Environment Variables

Add the following variables to your `.env` file:

```env
# Fast2SMS Configuration
FAST2SMS_API_KEY=your-fast2sms-api-key
FAST2SMS_SENDER_ID=your-sender-id
FAST2SMS_ROUTE=otp
```

### 3. Get Fast2SMS API Key

1. Sign up at [Fast2SMS](https://www.fast2sms.com/)
2. Get your API key from the dashboard
3. Set up your sender ID (must be approved by Fast2SMS)
4. Add the API key to your `.env` file

## API Endpoints

### Send OTP (Login/Register)
- **POST** `/api/v1/users/login`
- **POST** `/api/v1/users/send-otp`

**Request Body:**
```json
{
  "phone": "9999999999"
}
```

**Response:**
```json
{
  "status": true,
  "message": "OTP sent successfully",
  "data": {}
}
```

### Verify OTP
- **POST** `/api/v1/users/verify-otp`

**Request Body:**
```json
{
  "phone": "9999999999",
  "otp": "1234"
}
```

**Response:**
```json
{
  "status": true,
  "message": "OTP verified successfully. Welcome back!",
  "data": {
    "token": "jwt_token_here",
    "requiresProfileCompletion": false,
    "isNewUser": false,
    "otpVerified": true,
    "user": {
      "id": "user_id",
      "phone": "9999999999",
      "name": "John Doe",
      "isProfileCompleted": true
    }
  }
}
```

### Resend OTP
- **POST** `/api/v1/users/resend-otp`

**Request Body:**
```json
{
  "phone": "9999999999"
}
```

**Response:**
```json
{
  "status": true,
  "message": "New OTP sent successfully via SMS",
  "data": {}
}
```

## Fast2SMS Service Methods

### 1. Send OTP
```javascript
const fast2smsService = require('./utils/fast2sms');

const result = await fast2smsService.sendOTP('9999999999', '1234');
```

### 2. Send Custom Message
```javascript
const result = await fast2smsService.sendCustomMessage(
  '9999999999', 
  'Your custom message here'
);
```

### 3. Check Balance
```javascript
const result = await fast2smsService.checkBalance();
```

## Development Mode

Set `DEV_BYPASS=true` in your `.env` file to:
- Always use "1234" as OTP
- Skip actual SMS sending
- Return OTP in API response for testing

```env
DEV_BYPASS=true
```

## Testing

### Quick Test
Run the basic test file to verify the integration:

```bash
node test_fast2sms.js
```

### Comprehensive OTP Flow Test
Run the complete OTP flow test (requires server to be running):

```bash
node test_otp_flow.js
```

### Manual API Testing

#### 1. Send OTP
```bash
curl -X POST http://localhost:4000/api/v1/users/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9999999999"}'
```

#### 2. Verify OTP
```bash
curl -X POST http://localhost:4000/api/v1/users/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9999999999", "otp": "1234"}'
```

#### 3. Resend OTP
```bash
curl -X POST http://localhost:4000/api/v1/users/resend-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9999999999"}'
```

**Note:** Replace the test phone number with a real number for actual testing.

## Enhanced Validation & Error Handling

The service includes comprehensive validation and error handling:

### Input Validation
- **Phone number**: Must be exactly 10 digits (India format)
- **OTP format**: Must be exactly 4 digits
- **Rate limiting**: 1 OTP per minute for send, 30 seconds for resend

### Error Responses

#### Invalid Phone Number
```json
{
  "status": false,
  "message": "Invalid phone number format. Must be 10 digits.",
  "data": {}
}
```

#### Invalid OTP Format
```json
{
  "status": false,
  "message": "Invalid OTP format. Must be 4 digits.",
  "data": {}
}
```

#### Wrong OTP (with attempts tracking)
```json
{
  "status": false,
  "message": "Invalid OTP. 2 attempts remaining.",
  "data": {
    "attemptsRemaining": 2
  }
}
```

#### Too Many Failed Attempts
```json
{
  "status": false,
  "message": "Too many failed attempts. Please request a new OTP via SMS.",
  "data": {
    "attemptsExceeded": true,
    "suggestion": "Use the send OTP endpoint to get a new code"
  }
}
```

#### Rate Limiting
```json
{
  "status": false,
  "message": "Please wait 30 seconds before requesting another OTP",
  "data": {}
}
```

#### SMS Sending Failed
```json
{
  "status": false,
  "message": "Failed to send OTP. Please try again.",
  "data": {}
}
```

## Message Format

The OTP message follows this format:
```
Your OTP for Banner App is 1234. Valid for 5 minutes. Do not share this OTP with anyone.
```

## Rate Limiting

- Users can only request OTP once per minute
- OTP expires after 5 minutes
- Maximum 3 failed attempts per OTP

## Cost Considerations

- Fast2SMS charges per SMS sent
- OTP route is typically cheaper than promotional route
- Check your balance regularly using the balance API

## Troubleshooting

### Common Issues

1. **"API key not configured"**
   - Ensure `FAST2SMS_API_KEY` is set in `.env`

2. **"Invalid phone number"**
   - Phone number must be exactly 10 digits
   - Remove country code if present

3. **"SMS sending failed"**
   - Check your Fast2SMS balance
   - Verify sender ID is approved
   - Check API key validity

4. **"Too many requests"**
   - Respect rate limiting (1 OTP per minute per phone)

### Debug Mode

Enable debug logging by checking console output:
```javascript
console.log('Fast2SMS Response:', response);
```

## Security Considerations

- Never expose API keys in client-side code
- Use environment variables for sensitive data
- Implement rate limiting to prevent abuse
- Validate phone numbers server-side
- Log SMS activities for audit purposes

## Migration from Previous OTP System

The existing OTP system has been enhanced with Fast2SMS:

- ✅ OTP generation remains the same (4 digits)
- ✅ Database schema unchanged
- ✅ API endpoints unchanged
- ✅ Development mode still supported
- ✅ Rate limiting preserved

## Support

For Fast2SMS API issues:
- Check [Fast2SMS Documentation](https://docs.fast2sms.com/)
- Contact Fast2SMS support
- Review API response logs

For application issues:
- Check server logs
- Verify environment variables
- Test with development mode first

