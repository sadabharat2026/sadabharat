const Policy = require('../models/policyModel');
const { invalidateCatalog } = require('../utils/cache');

// @desc    Get policy by type
// @route   GET /api/policies/:type
// @access  Public
const getPolicy = async (req, res) => {
  try {
    const { type } = req.params;
    let policy = await Policy.findOne({ type });
    
    // If policy doesn't exist yet, return a default placeholder instead of 404
    if (!policy) {
      policy = {
        type,
        content: `Default ${type} policy content. Please update in the Admin Panel.`
      };
    }

    res.status(200).json({
      success: true,
      data: policy
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all policies
// @route   GET /api/policies
// @access  Public
const getAllPolicies = async (req, res) => {
  try {
    const policies = await Policy.find();
    res.status(200).json({
      success: true,
      data: policies
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update or create a policy
// @route   PUT /api/policies/:type
// @access  Private/Admin
const updatePolicy = async (req, res) => {
  try {
    const { type } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: 'Content is required.' });
    }

    let policy = await Policy.findOne({ type });

    if (policy) {
      policy.content = content;
      await policy.save();
    } else {
      policy = await Policy.create({ type, content });
    }

    invalidateCatalog('policies').catch(() => {});
    res.status(200).json({
      success: true,
      message: 'Policy updated successfully.',
      data: policy
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPolicy,
  getAllPolicies,
  updatePolicy
};
