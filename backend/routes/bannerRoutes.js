const express = require('express');
const router = express.Router();
const { 
  getBanners, 
  createBanner, 
  updateBanner, 
  deleteBanner 
} = require('../controllers/bannerController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { cachePublic } = require('../utils/cache');

router.route('/')
  .get(cachePublic('banners', 120), getBanners)
  .post(protect, authorize('admin'), createBanner);

router.route('/:id')
  .put(protect, authorize('admin'), updateBanner)
  .delete(protect, authorize('admin'), deleteBanner);

module.exports = router;
