const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    description: 'User who made the payment'
  },
  description: {
    type: String,
    default: 'Payment',
    description: 'Payment description'
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
    description: 'Amount in paise (INR)'
  },
  currency: {
    type: String,
    default: 'INR',
    description: 'Currency code'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending',
    description: 'Payment status'
  },
  paymentMethod: {
    type: String,
    default: 'razorpay',
    description: 'Payment method used'
  },
  razorpayOrderId: {
    type: String,
    required: true,
    unique: true,
    description: 'Razorpay order ID'
  },
  razorpayPaymentId: {
    type: String,
    description: 'Razorpay payment ID (after successful payment)'
  },
  razorpaySignature: {
    type: String,
    description: 'Razorpay signature for verification'
  },
  receipt: {
    type: String,
    description: 'Receipt number'
  },
  notes: {
    type: String,
    description: 'Additional notes'
  },
  failureReason: {
    type: String,
    description: 'Reason for payment failure'
  },
  subscriptionStartDate: {
    type: Date,
    description: 'When the subscription starts'
  },
  subscriptionEndDate: {
    type: Date,
    description: 'When the subscription ends'
  },
  isActive: {
    type: Boolean,
    default: true,
    description: 'Whether the subscription is active'
  }
}, { 
  timestamps: true,
  collection: 'transactions'
});

// Create indexes
transactionSchema.index({ user: 1, status: 1 });
transactionSchema.index({ razorpayOrderId: 1 });
transactionSchema.index({ razorpayPaymentId: 1 });
transactionSchema.index({ status: 1, createdAt: 1 });

module.exports = mongoose.model('Transaction', transactionSchema); 