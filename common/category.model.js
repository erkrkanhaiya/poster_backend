const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  alt: { type: String }
}, { _id: false });

const categorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  isSuspended: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  images: { type: [imageSchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema); 