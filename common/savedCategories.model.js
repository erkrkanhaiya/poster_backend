const mongoose = require('mongoose');

const savedCategoriesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  subcategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subcategory',
    required: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, { 
  timestamps: true,
  collection: 'savedcategories'
});

// Index for better performance
savedCategoriesSchema.index({ isActive: 1, sortOrder: 1 });
savedCategoriesSchema.index({ createdBy: 1 });

module.exports = mongoose.model('SavedCategories', savedCategoriesSchema);