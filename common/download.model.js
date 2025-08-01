const mongoose = require('mongoose');

const downloadSchema = new mongoose.Schema({
  bannerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Banner',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  downloadCount: {
    type: Number,
    default: 1
  },
  downloadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate downloads from same user for same banner
downloadSchema.index({ bannerId: 1, userId: 1 }, { unique: true });

// Index for efficient querying by banner
downloadSchema.index({ bannerId: 1 });

// Index for trending queries
downloadSchema.index({ downloadedAt: -1 });

module.exports = mongoose.model('Download', downloadSchema); 