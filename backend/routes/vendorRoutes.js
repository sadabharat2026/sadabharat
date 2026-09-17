const express = require('express');
const {
  registerVendor,
  loginVendor,
  sendVendorRegisterOtp,
  verifyVendorRegisterOtp,
  sendVendorLoginOtp,
  verifyVendorLoginOtp,
  getVendorRegistrationStatus,
  forgotVendorPassword,
  resetVendorPassword,
  getPendingVendors,
  getApprovedVendors,
  getBlockedVendors,
  approveVendor,
  blockVendor,
  unblockVendor,
  getVendorEarnings,
  getVendorReviews,
  getVendorDashboardStats,
  getVendorProfile,
  updateVendorProfile
} = require('../controllers/vendorController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', registerVendor);
router.post('/login', loginVendor);
router.post('/send-register-otp', sendVendorRegisterOtp);
router.post('/verify-register-otp', verifyVendorRegisterOtp);
router.post('/send-login-otp', sendVendorLoginOtp);
router.post('/verify-login-otp', verifyVendorLoginOtp);
router.post('/registration-status', getVendorRegistrationStatus);
router.post('/forgot-password', forgotVendorPassword);
router.post('/reset-password', resetVendorPassword);

// Vendor specific routes
router.get('/profile', protect, authorize('vendor'), getVendorProfile);
router.put('/profile', protect, authorize('vendor'), updateVendorProfile);
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
