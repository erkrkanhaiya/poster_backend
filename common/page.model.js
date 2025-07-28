const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    description: 'Unique identifier for the page (e.g., about-us, privacy-policy)'
  },
  title: {
    type: String,
    required: true,
    trim: true,
    description: 'Page title'
  },
  description: {
    type: String,
    required: true,
    description: 'Page content/description'
  },
  isActive: {
    type: Boolean,
    default: true,
    description: 'Whether the page is active and visible'
  },
  metaTitle: {
    type: String,
    description: 'SEO meta title'
  },
  metaDescription: {
    type: String,
    description: 'SEO meta description'
  },
  sortOrder: {
    type: Number,
    default: 0,
    description: 'Sort order for displaying pages'
  }
}, { 
  timestamps: true,
  collection: 'pages'
});

// Create index for slug
pageSchema.index({ slug: 1 });
pageSchema.index({ isActive: 1, sortOrder: 1 });

module.exports = mongoose.model('Page', pageSchema); 