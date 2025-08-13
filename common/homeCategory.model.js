const mongoose = require('mongoose');

const homeCategorySchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  isSuspended: {
    type: Boolean,
    default: false
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
homeCategorySchema.index({ categoryId: 1 });
homeCategorySchema.index({ isSuspended: 1 });

// Compound index to prevent duplicate categories
homeCategorySchema.index({ categoryId: 1 }, { unique: true });

// Method to check if category is active
homeCategorySchema.methods.isActive = function() {
  return !this.isSuspended;
};

module.exports = mongoose.model('HomeCategory', homeCategorySchema); 