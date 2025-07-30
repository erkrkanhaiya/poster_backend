const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    description: 'Plan name (e.g., Basic, Premium, Pro)'
  },
  description: {
    type: String,
    required: true,
    description: 'Plan description'
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    description: 'Plan price in INR (paise)'
  },
  currency: {
    type: String,
    default: 'INR',
    description: 'Currency code'
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
    description: 'Duration in days'
  },
  features: [{
    type: String,
    description: 'List of features included in this plan'
  }],
  isActive: {
    type: Boolean,
    default: true,
    description: 'Whether the plan is active'
  },
  sortOrder: {
    type: Number,
    default: 0,
    description: 'Sort order for displaying plans'
  },
  razorpayPlanId: {
    type: String,
    description: 'Razorpay plan ID (if using subscriptions)'
  }
}, { 
  timestamps: true,
  collection: 'plans'
});

// Create indexes
planSchema.index({ isActive: 1, sortOrder: 1 });
planSchema.index({ price: 1 });

module.exports = mongoose.model('Plan', planSchema); 