const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String },
  phone: { type: String, required: true, unique: true },
  email: { type: String },
  password: { type: String, required: false, default: null, select: false },
  isProfileCompleted: { type: Boolean, default: false },
  interests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  profilePhoto: { type: String },
  logo: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 