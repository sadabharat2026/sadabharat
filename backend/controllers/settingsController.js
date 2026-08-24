const Settings = require('../models/settingsModel');
const { invalidateCatalog } = require('../utils/cache');

// @desc    Get settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({});
    if (!settings) {
      settings = await Settings.create({});
    }
    res.status(200).json({ success: true, data: { settings } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update settings
// @route   PUT /api/settings
// @access  Public/Admin
const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({});
    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      settings = await Settings.findOneAndUpdate({}, req.body, { new: true });
    }
    invalidateCatalog('settings').catch(() => {});
    res.status(200).json({ success: true, data: { settings } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
