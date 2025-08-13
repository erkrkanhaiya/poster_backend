# Razorpay Payment Integration API Documentation

## Overview

This document describes the complete Razorpay payment gateway integration for subscription plans. The system includes plan management, payment processing, transaction tracking, and a checkout page.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install razorpay
```

### 2. Environment Variables

Add these to your `.env` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

### 3. Get Razorpay Credentials

1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to Settings → API Keys
3. Generate a new key pair
4. Use Test keys for development, Live keys for production

## Database Models

### Plan Model (`common/plan.model.js`)

```javascript
{
  name: String,           // Plan name (e.g., "Premium Plan")
  description: String,    // Plan description
  price: Number,          // Price in paise (INR)
  currency: String,       // Currency code (default: "INR")
  duration: Number,       // Duration in days
  features: [String],     // Array of features
  isActive: Boolean,      // Whether plan is active
  sortOrder: Number,      // Display order
  razorpayPlanId: String  // Razorpay plan ID (optional)
}
```

### Transaction Model (`common/transaction.model.js`)

```javascript
{
  user: ObjectId,         // Reference to User
  plan: ObjectId,         // Reference to Plan
  amount: Number,         // Amount in paise
  currency: String,       // Currency code
  status: String,         // pending, completed, failed, refunded, cancelled
  paymentMethod: String,  // Payment method used
  razorpayOrderId: String,    // Razorpay order ID
  razorpayPaymentId: String,  // Razorpay payment ID
  razorpaySignature: String,  // Razorpay signature
  receipt: String,        // Receipt number
  notes: String,          // Additional notes
  failureReason: String,  // Reason for failure
  subscriptionStartDate: Date,
  subscriptionEndDate: Date,
  isActive: Boolean       // Whether subscription is active
}
```

## API Endpoints

### 1. Get All Plans

**GET** `/users/payment/plans`

**Description:** Get all active subscription plans

**Response:**
```json
{
  "status": true,
  "message": "Plans fetched successfully",
  "data": {
    "plans": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "Premium Plan",
        "description": "Access to all premium features",
        "price": 99900,
        "currency": "INR",
        "duration": 30,
        "features": [
          "Unlimited access",
          "Premium support",
          "Advanced analytics"
        ]
      }
    ],
    "total": 1
  }
}
```

### 2. Create Payment Order

**POST** `/users/payment/create-order`

**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "planId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "notes": "Monthly subscription"
}
```

**Response:**
```json
{
  "status": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "id": "order_123456789",
      "amount": 99900,
      "currency": "INR",
      "receipt": "receipt_123456789"
    },
    "plan": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Premium Plan",
      "description": "Access to all premium features",
      "price": 99900,
      "duration": 30,
      "features": ["Unlimited access", "Premium support"]
    },
    "transactionId": "64f8a1b2c3d4e5f6a7b8c9d0"
  }
}
```

### 3. Verify Payment

**POST** `/users/payment/verify`

**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "razorpay_order_id": "order_123456789",
  "razorpay_payment_id": "pay_123456789",
  "razorpay_signature": "abc123def456...",
  "transactionId": "64f8a1b2c3d4e5f6a7b8c9d0"
}
```

**Response:**
```json
{
  "status": true,
  "message": "Payment verified successfully",
  "data": {
    "transaction": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "status": "completed",
      "amount": 99900,
      "subscriptionEndDate": "2023-10-06T10:30:00.000Z"
    }
  }
}
```

### 4. Get Transaction History

**GET** `/users/payment/transactions?page=1&limit=10`

**Authentication:** Required (Bearer Token)

**Response:**
```json
{
  "status": true,
  "message": "Transaction history fetched successfully",
  "data": {
    "transactions": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "amount": 99900,
        "currency": "INR",
        "status": "completed",
        "plan": {
          "name": "Premium Plan",
          "description": "Access to all premium features",
          "price": 99900,
          "duration": 30
        },
        "createdAt": "2023-09-06T10:30:00.000Z"
      }
    ],
    "totalPages": 1,
    "currentPage": 1,
    "total": 1
  }
}
```

### 5. Get Subscription Status

**GET** `/users/payment/subscription`

**Authentication:** Required (Bearer Token)

**Response:**
```json
{
  "status": true,
  "message": "Subscription status fetched successfully",
  "data": {
    "hasActiveSubscription": true,
    "subscription": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "plan": {
        "name": "Premium Plan",
        "description": "Access to all premium features",
        "price": 99900,
        "duration": 30,
        "features": ["Unlimited access", "Premium support"]
      },
      "startDate": "2023-09-06T10:30:00.000Z",
      "endDate": "2023-10-06T10:30:00.000Z",
      "amount": 99900,
      "status": "completed"
    }
  }
}
```

## Frontend Integration

### Checkout Page

The system includes a ready-to-use checkout page at `/checkout.html`

**Usage:**
```
https://yourdomain.com/checkout.html?planId=64f8a1b2c3d4e5f6a7b8c9d0&token=user-jwt-token
```

**Features:**
- Beautiful, responsive design
- Plan details display
- Razorpay checkout integration
- Payment verification
- Success/error handling
- Automatic redirect after payment

### Success Page

After successful payment, users are redirected to `/success.html`

**URL Parameters:**
- `transactionId`: Transaction ID
- `planName`: Plan name
- `amount`: Payment amount

## Payment Flow

### 1. User Flow

1. **Browse Plans:** User views available plans via `/users/payment/plans`
2. **Select Plan:** User chooses a plan and clicks "Subscribe"
3. **Create Order:** Frontend calls `/users/payment/create-order`
4. **Redirect to Checkout:** User is redirected to checkout page
5. **Payment:** User completes payment on Razorpay
6. **Verification:** Frontend calls `/users/payment/verify`
7. **Success:** User is redirected to success page

### 2. Technical Flow

1. **Order Creation:**
   - Validate plan and user
   - Check for existing active subscription
   - Create Razorpay order
   - Save transaction record (status: pending)

2. **Payment Processing:**
   - User pays on Razorpay
   - Razorpay sends payment details to frontend

3. **Payment Verification:**
   - Verify Razorpay signature
   - Update transaction status to "completed"
   - Update user subscription status
   - Set subscription end date

## Error Handling

### Common Error Responses

**Invalid Plan:**
```json
{
  "status": false,
  "message": "Invalid or inactive plan",
  "data": {}
}
```

**Already Subscribed:**
```json
{
  "status": false,
  "message": "You already have an active subscription",
  "data": {}
}
```

**Invalid Signature:**
```json
{
  "status": false,
  "message": "Invalid payment signature",
  "data": {}
}
```

**Payment Already Verified:**
```json
{
  "status": false,
  "message": "Payment already verified",
  "data": {}
}
```

## Security Considerations

### 1. Signature Verification

Always verify Razorpay signatures to prevent payment tampering:

```javascript
const body = razorpay_order_id + "|" + razorpay_payment_id;
const expectedSignature = crypto
  .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
  .update(body.toString())
  .digest("hex");

if (expectedSignature !== razorpay_signature) {
  // Invalid payment
}
```

### 2. Authentication

All payment endpoints require user authentication via JWT tokens.

### 3. Input Validation

All inputs are validated to prevent injection attacks.

## Testing

### Test Cards (Razorpay Test Mode)

- **Success:** 4111 1111 1111 1111
- **Failure:** 4000 0000 0000 0002
- **CVV:** Any 3 digits
- **Expiry:** Any future date

### Test Environment Setup

1. Use Razorpay test keys
2. Create test plans in database
3. Use test cards for payments
4. Monitor transactions in Razorpay dashboard

## Production Deployment

### 1. Environment Setup

- Use live Razorpay keys
- Set up proper SSL certificates
- Configure webhook endpoints (optional)
- Set up monitoring and logging

### 2. Database Indexes

Ensure these indexes are created:

```javascript
// Transaction indexes
transactionSchema.index({ user: 1, status: 1 });
transactionSchema.index({ razorpayOrderId: 1 });
transactionSchema.index({ razorpayPaymentId: 1 });

// Plan indexes
planSchema.index({ isActive: 1, sortOrder: 1 });
```

### 3. Monitoring

- Monitor payment success/failure rates
- Track transaction volumes
- Set up alerts for failed payments
- Monitor subscription renewals

## Webhook Integration (Optional)

For enhanced security, you can set up Razorpay webhooks:

1. Configure webhook URL in Razorpay dashboard
2. Create webhook endpoint in your API
3. Verify webhook signatures
4. Update transaction status based on webhook events

## Support

For issues related to:
- **Razorpay Integration:** Check Razorpay documentation
- **API Issues:** Check server logs and API responses
- **Frontend Issues:** Check browser console and network tab

## Example Usage

### Complete Payment Flow Example

```javascript
// 1. Get plans
const plansResponse = await fetch('/users/payment/plans');
const plans = await plansResponse.json();

// 2. Create order
const orderResponse = await fetch('/users/payment/create-order', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    planId: '64f8a1b2c3d4e5f6a7b8c9d0'
  })
});

const orderData = await orderResponse.json();

// 3. Initialize Razorpay
const options = {
  key: 'YOUR_RAZORPAY_KEY_ID',
  amount: orderData.data.order.amount,
  currency: orderData.data.order.currency,
  name: 'Your Company',
  description: orderData.data.plan.name,
  order_id: orderData.data.order.id,
  handler: function (response) {
    // 4. Verify payment
    verifyPayment(response);
  }
};

const rzp = new Razorpay(options);
rzp.open();

// 5. Verify payment
async function verifyPayment(response) {
  const verifyResponse = await fetch('/users/payment/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
      transactionId: orderData.data.transactionId
    })
  });

  const verifyData = await verifyResponse.json();
  if (verifyData.status) {
    // Payment successful
    window.location.href = '/success.html';
  }
}
``` 