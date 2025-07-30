# Razorpay Integration Guide - Direct Checkout

## Overview

This guide explains how to integrate Razorpay's hosted checkout page for fixed amount payments in your application.

## 🔧 Setup

### 1. Install Dependencies
```bash
npm install razorpay
```

### 2. Environment Variables
Add to your `.env` file:
```env
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

### 3. Get Razorpay Credentials
1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to Settings → API Keys
3. Generate test keys for development
4. Use live keys for production

## 🚀 Payment Flow

### Step 1: Create Payment Order
**Frontend App** calls your backend API to create a payment order.

```javascript
// Frontend code
const response = await fetch('/users/payment/create-order', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`
  },
  body: JSON.stringify({
    amount: 99900, // ₹999 in paise
    description: 'Premium Subscription',
    notes: 'Monthly payment'
  })
});

const data = await response.json();
if (data.status) {
  // Redirect to Razorpay checkout
  window.location.href = data.data.checkoutUrl;
}
```

### Step 2: Razorpay Checkout
User is redirected to Razorpay's hosted checkout page:
```
https://checkout.razorpay.com/v1/checkout.html?key=rzp_test_123&amount=99900&currency=INR&name=Your%20Company&description=Premium%20Subscription&order_id=order_123&prefill[name]=User&prefill[email]=user@example.com&prefill[contact]=9999999999&notes[transactionId]=64f8a1b2c3d4e5f6a7b8c9d0&theme[color]=#667eea&callback_url=https%3A//yourdomain.com/payment-success.html%3FtransactionId%3D64f8a1b2c3d4e5f6a7b8c9d0
```

### Step 3: Payment Completion
After successful payment, Razorpay redirects to your success page with payment details.

### Step 4: Payment Verification
Your success page automatically verifies the payment with your backend.

## 📋 API Endpoints

### 1. Create Payment Order
**POST** `/users/payment/create-order`

**Request:**
```json
{
  "amount": 99900,           // Amount in paise (₹999)
  "currency": "INR",         // Optional, default: "INR"
  "description": "Premium Subscription",  // Optional
  "notes": "Monthly payment" // Optional
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
    "transactionId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "checkoutUrl": "https://checkout.razorpay.com/v1/checkout.html?...",
    "description": "Premium Subscription"
  }
}
```

### 2. Verify Payment
**POST** `/users/payment/verify`

**Request:**
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
      "subscriptionEndDate": "2023-10-06T10:30:00.000Z",
      "description": "Premium Subscription"
    }
  }
}
```

### 3. Get Payment Status
**GET** `/users/payment/status/{orderId}`

**Response:**
```json
{
  "status": true,
  "message": "Payment status fetched successfully",
  "data": {
    "transaction": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "status": "completed",
      "amount": 99900,
      "currency": "INR",
      "description": "Premium Subscription",
      "createdAt": "2023-09-06T10:30:00.000Z",
      "updatedAt": "2023-09-06T10:30:00.000Z",
      "user": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "9999999999"
      }
    }
  }
}
```

## 🎯 Frontend Integration Examples

### React Native / Mobile App
```javascript
// Create payment order
const createPayment = async (amount, description) => {
  try {
    const response = await fetch('https://yourdomain.com/users/payment/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to paise
        description: description
      })
    });

    const data = await response.json();
    
    if (data.status) {
      // Open Razorpay checkout in WebView or browser
      Linking.openURL(data.data.checkoutUrl);
    }
  } catch (error) {
    console.error('Payment error:', error);
  }
};
```

### Web Application
```javascript
// Create payment order
const initiatePayment = async (amount, description) => {
  try {
    const response = await fetch('/users/payment/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        amount: amount * 100,
        description: description
      })
    });

    const data = await response.json();
    
    if (data.status) {
      // Redirect to Razorpay checkout
      window.location.href = data.data.checkoutUrl;
    }
  } catch (error) {
    console.error('Payment error:', error);
  }
};

// Usage
initiatePayment(999, 'Premium Subscription');
```

## 🔐 Security Features

### 1. Signature Verification
All payments are verified using Razorpay's signature verification:

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
All payment endpoints require JWT authentication.

### 3. Input Validation
All inputs are validated to prevent injection attacks.

## 📱 Success Page Configuration

### URL Parameters
The success page receives these parameters from Razorpay:
- `razorpay_payment_id`: Payment ID
- `razorpay_order_id`: Order ID  
- `razorpay_signature`: Payment signature
- `transactionId`: Your transaction ID

### Customization
Update `public/payment-success.html` to:
1. Change company name and branding
2. Update return URLs for your app
3. Customize success message
4. Add your support contact

## 🧪 Testing

### Test Cards (Razorpay Test Mode)
- **Success:** 4111 1111 1111 1111
- **Failure:** 4000 0000 0000 0002
- **CVV:** Any 3 digits
- **Expiry:** Any future date

### Test Environment Setup
1. Use Razorpay test keys
2. Test with small amounts
3. Monitor transactions in Razorpay dashboard

## 🚀 Production Deployment

### 1. Environment Setup
- Use live Razorpay keys
- Set up SSL certificates
- Configure proper domain URLs

### 2. Webhook Setup (Optional)
For enhanced security, set up Razorpay webhooks:
1. Configure webhook URL in Razorpay dashboard
2. Create webhook endpoint in your API
3. Verify webhook signatures
4. Update transaction status based on webhook events

### 3. Monitoring
- Monitor payment success/failure rates
- Track transaction volumes
- Set up alerts for failed payments

## 🔧 Customization Options

### 1. Checkout URL Parameters
You can customize the Razorpay checkout URL with these parameters:

```javascript
const checkoutUrl = `https://checkout.razorpay.com/v1/checkout.html?
  key=${process.env.RAZORPAY_KEY_ID}&
  amount=${amount}&
  currency=${currency}&
  name=${encodeURIComponent(companyName)}&
  description=${encodeURIComponent(description)}&
  order_id=${orderId}&
  prefill[name]=${userName}&
  prefill[email]=${userEmail}&
  prefill[contact]=${userPhone}&
  notes[transactionId]=${transactionId}&
  theme[color]=${themeColor}&
  callback_url=${encodeURIComponent(successUrl)}`;
```

### 2. Success Page Customization
Update the success page to match your branding and requirements.

### 3. Error Handling
Implement proper error handling for:
- Network failures
- Payment failures
- Invalid signatures
- Duplicate payments

## 📞 Support

For issues related to:
- **Razorpay Integration:** Check [Razorpay Documentation](https://razorpay.com/docs/)
- **API Issues:** Check server logs and API responses
- **Frontend Issues:** Check browser console and network tab

## 📋 Complete Example

```javascript
// Complete payment flow example
class PaymentService {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  async createPayment(amount, description) {
    try {
      const response = await fetch(`${this.baseUrl}/users/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          amount: amount * 100,
          description: description
        })
      });

      const data = await response.json();
      
      if (data.status) {
        return {
          success: true,
          checkoutUrl: data.data.checkoutUrl,
          transactionId: data.data.transactionId
        };
      } else {
        return {
          success: false,
          error: data.message
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Network error'
      };
    }
  }

  async verifyPayment(paymentData) {
    try {
      const response = await fetch(`${this.baseUrl}/users/payment/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        status: false,
        message: 'Verification failed'
      };
    }
  }
}

// Usage
const paymentService = new PaymentService('https://yourdomain.com', userToken);

// Create payment
const payment = await paymentService.createPayment(999, 'Premium Subscription');
if (payment.success) {
  // Redirect to checkout
  window.location.href = payment.checkoutUrl;
}
```

This integration provides a secure, reliable, and user-friendly payment experience using Razorpay's hosted checkout page. 