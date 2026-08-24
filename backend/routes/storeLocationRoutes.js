const express = require('express');
const router = express.Router();
const { getLocations, createLocation, updateLocation, deleteLocation } = require('../controllers/storeLocationController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { cachePublic } = require('../utils/cache');

router.route('/')
  .get(cachePublic('locations', 300), getLocations)
  .post(protect, authorize('admin'), createLocation);

router.route('/:id')
  .put(protect, authorize('admin'), updateLocation)
  .delete(protect, authorize('admin'), deleteLocation);

module.exports = router;
