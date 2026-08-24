const StoreLocation = require('../models/storeLocationModel');
const { invalidateCatalog } = require('../utils/cache');

// @desc    Get all store locations
// @route   GET /api/locations
// @access  Public
const getLocations = async (req, res, next) => {
  try {
    const locations = await StoreLocation.find({}).sort('-createdAt');
    res.status(200).json({
      success: true,
      data: { locations }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a store location
// @route   POST /api/locations
// @access  Private (Admin only)
const createLocation = async (req, res, next) => {
  try {
    const { pincode, city, district, state, isActive } = req.body;

    if (!pincode || !city || !district || !state) {
      res.status(400);
      throw new Error('Please fill in required fields');
    }

    const location = await StoreLocation.create({
      pincode,
      city,
      district,
      state,
      isActive
    });

    invalidateCatalog('locations').catch(() => {});
    res.status(201).json({
      success: true,
      data: location
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a store location
// @route   PUT /api/locations/:id
// @access  Private (Admin only)
const updateLocation = async (req, res, next) => {
  try {
    let location = await StoreLocation.findById(req.params.id);

    if (!location) {
      res.status(404);
      throw new Error('Location not found');
    }

    location = await StoreLocation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    invalidateCatalog('locations').catch(() => {});
    res.status(200).json({
      success: true,
      data: location
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a store location
// @route   DELETE /api/locations/:id
// @access  Private (Admin only)
const deleteLocation = async (req, res, next) => {
  try {
    const location = await StoreLocation.findById(req.params.id);

    if (!location) {
      res.status(404);
      throw new Error('Location not found');
    }

    await location.deleteOne();

    invalidateCatalog('locations').catch(() => {});
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation
};
