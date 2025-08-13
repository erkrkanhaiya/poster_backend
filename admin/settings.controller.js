const Settings = require('../common/settings.model');

// Get settings for admin
exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json({ 
      status: true, 
      message: 'Settings retrieved successfully', 
      data: { settings } 
    });
  } catch (err) {
    console.error('Error in getSettings:', err);
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
};

// Update or create settings (single API)
exports.updateSettings = async (req, res) => {
  try {
    const {
      isForceUpdate,
      appVersion,
      isMaintenance,
      maintenanceMessage,
      minVersion,
      updateMessage,
      playStoreUrl,
      appStoreUrl
    } = req.body;

    const updateData = {};
    
    // Only update fields that are provided
    if (isForceUpdate !== undefined) updateData.isForceUpdate = isForceUpdate;
    if (appVersion !== undefined) updateData.appVersion = appVersion;
    if (isMaintenance !== undefined) updateData.isMaintenance = isMaintenance;
    if (maintenanceMessage !== undefined) updateData.maintenanceMessage = maintenanceMessage;
    if (minVersion !== undefined) updateData.minVersion = minVersion;
    if (updateMessage !== undefined) updateData.updateMessage = updateMessage;
    if (playStoreUrl !== undefined) updateData.playStoreUrl = playStoreUrl;
    if (appStoreUrl !== undefined) updateData.appStoreUrl = appStoreUrl;

    // Check if any data was provided for update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ status: false, message: 'No data provided for update', data: {} });
    }

    const settings = await Settings.findOneAndUpdate(
      {}, // Update the first (and only) settings document
      updateData,
      { 
        new: true, 
        upsert: true, // Create if doesn't exist
        setDefaultsOnInsert: true 
      }
    );

    res.json({ 
      status: true, 
      message: 'Settings updated successfully', 
      data: { settings } 
    });
  } catch (err) {
    console.error('Error in updateSettings:', err);
    res.status(500).json({ status: false, message: 'Server error', data: {} });
  }
}; 