const express = require('express');
const {
  registerVendor,
  loginVendor,
  getPendingVendors,
  getApprovedVendors,
  getBlockedVendors,
  approveVendor,
  blockVendor,
  unblockVendor,
  getVendorEarnings,
  getVendorReviews,
  getVendorDashboardStats,
  getVendorProfile
} = require('../controllers/vendorController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', registerVendor);
router.post('/login', loginVendor);

// Vendor specific routes
router.get('/profile', protect, authorize('vendor'), getVendorProfile);
router.get('/dashboard-stats', protect, authorize('vendor'), getVendorDashboardStats);
router.get('/earnings', protect, authorize('vendor'), getVendorEarnings);
router.get('/reviews', protect, authorize('vendor'), getVendorReviews);

// Admin routes
router.get('/pending', protect, authorize('admin'), getPendingVendors);
router.get('/approved', protect, authorize('admin'), getApprovedVendors);
router.get('/blocked', protect, authorize('admin'), getBlockedVendors);
router.put('/:id/approve', protect, authorize('admin'), approveVendor);
router.put('/:id/block', protect, authorize('admin'), blockVendor);
router.put('/:id/unblock', protect, authorize('admin'), unblockVendor);

module.exports = router;
