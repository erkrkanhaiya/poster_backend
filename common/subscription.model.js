const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    required: true,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'expired'],
    default: 'active'
  },
  razorpaySubscriptionId: {
    type: String,
    required: true,
    unique: true
  },
  razorpayPlanId: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  nextBillingDate: {
    type: Date,
    required: true
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  paymentMethod: {
    type: String,
    default: 'razorpay'
  },
  description: {
    type: String,
    default: 'Monthly Subscription'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient querying
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ razorpaySubscriptionId: 1 });
subscriptionSchema.index({ endDate: 1 });
subscriptionSchema.index({ nextBillingDate: 1 });

// Method to check if subscription is active
subscriptionSchema.methods.isActive = function() {
  return this.status === 'active' && this.endDate > new Date();
};

// Method to extend subscription
subscriptionSchema.methods.extend = function(months = 1) {
  const newEndDate = new Date(this.endDate);
  newEndDate.setMonth(newEndDate.getMonth() + months);
  
  this.endDate = newEndDate;
  this.nextBillingDate = newEndDate;
  return this.save();
};

module.exports = mongoose.model('Subscription', subscriptionSchema); 