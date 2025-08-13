const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  alt: { type: String },
  language: { type: String, enum: ['english', 'hindi'], default: 'english' }
}, { _id: false });

const subcategorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true },
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    required: true,
    index: true
  },
  isSuspended: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  images: { type: [imageSchema], default: [] },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

// Create compound index for category and slug uniqueness
subcategorySchema.index({ category: 1, slug: 1 }, { unique: true });

// Create index for active subcategories
subcategorySchema.index({ category: 1, isDeleted: 1, isSuspended: 1 });

module.exports = mongoose.model('Subcategory', subcategorySchema);