const Settings = require('../common/settings.model');

// Get public settings (for client apps)
exports.getPublicSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    
    // Only return public settings (no sensitive admin data)
    const publicSettings = {
      isForceUpdate: settings.isForceUpdate,
      appVersion: settings.appVersion,
      isMaintenance: settings.isMaintenance,
      maintenanceMessage: settings.maintenanceMessage,
      minVersion: settings.minVersion,
      updateMessage: settings.updateMessage,
      playStoreUrl: settings.playStoreUrl,
      appStoreUrl: settings.appStoreUrl
    };
    
    res.json({ 
      status: true, 
      message: 'Public settings fetched successfully', 
      data: { settings: publicSettings } 
    });
  } catch (err) {
    console.error('Error in getPublicSettings:', err);
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

// Check app version (public endpoint)
exports.checkAppVersion = async (req, res) => {
  try {
    const { currentVersion, platform } = req.body;
    
    if (!currentVersion) {
      return res.status(400).json({ status: false, message: 'Current version is required', data: {} });
    }

    const settings = await Settings.getSettings();
    
    // Compare versions (simple string comparison for now)
    const needsUpdate = currentVersion < settings.minVersion;
    const needsForceUpdate = currentVersion < settings.appVersion && settings.isForceUpdate;
    
    res.json({ 
      status: true, 
      message: 'Version check completed', 
      data: { 
        currentVersion,
        latestVersion: settings.appVersion,
        minVersion: settings.minVersion,
        needsUpdate,
        needsForceUpdate,
        isMaintenance: settings.isMaintenance,
        maintenanceMessage: settings.maintenanceMessage,
        updateMessage: settings.updateMessage,
        playStoreUrl: settings.playStoreUrl,
        appStoreUrl: settings.appStoreUrl
      } 
    });
  } catch (err) {
    console.error('Error in checkAppVersion:', err);
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
}; 