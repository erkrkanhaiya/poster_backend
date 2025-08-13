const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  isForceUpdate: {
    type: Boolean,
    default: false,
    description: 'Whether the app requires a force update'
  },
  appVersion: {
    type: String,
    required: true,
    default: '1.0.0',
    description: 'Current app version'
  },
  isMaintenance: {
    type: Boolean,
    default: false,
    description: 'Whether the app is in maintenance mode'
  },
  maintenanceMessage: {
    type: String,
    default: 'App is under maintenance. Please try again later.',
    description: 'Message to show during maintenance'
  },
  minVersion: {
    type: String,
    default: '1.0.0',
    description: 'Minimum required app version'
  },
  updateMessage: {
    type: String,
    default: 'Please update your app to the latest version.',
    description: 'Message to show when force update is required'
  },
  playStoreUrl: {
    type: String,
    default: '',
    description: 'Play Store URL for Android app'
  },
  appStoreUrl: {
    type: String,
    default: '',
    description: 'App Store URL for iOS app'
  }
}, { 
  timestamps: true,
  collection: 'settings'
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      appVersion: '1.0.0',
      isForceUpdate: false,
      isMaintenance: false,
      maintenanceMessage: 'App is under maintenance. Please try again later.',
      minVersion: '1.0.0',
      updateMessage: 'Please update your app to the latest version.',
      playStoreUrl: '',
      appStoreUrl: ''
    });
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema); 