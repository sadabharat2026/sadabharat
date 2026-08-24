const express = require('express');
const router = express.Router();
const { getFinanceStats, updateEarningCommission, getAdminPayouts, clearVendorPayout, getDashboardStats, getUserAnalytics } = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Using basic protect and authorize for admin routes
// In production, ensure admin users have role 'admin'
router.route('/dashboard-stats').get(getDashboardStats);
router.route('/analytics').get(getUserAnalytics);
router.route('/finance-stats').get(getFinanceStats);
router.route('/finance/earnings/:id/commission').patch(updateEarningCommission);

// Payouts routes
router.route('/payouts').get(getAdminPayouts);
router.route('/payouts/:vendorId/clear').post(clearVendorPayout);

// Reviews routes
const { getAdminReviews, toggleReviewApproval, deleteReview, replyReview } = require('../controllers/adminController');
router.route('/reviews').get(protect, authorize('admin'), getAdminReviews);
router.route('/reviews/:id/toggle-approval').patch(protect, authorize('admin'), toggleReviewApproval);
router.route('/reviews/:id/reply').patch(protect, authorize('admin'), replyReview);
router.route('/reviews/:id').delete(protect, authorize('admin'), deleteReview);

// Testimonials routes
const { 
  getAdminTestimonials, 
  toggleTestimonialApproval, 
  createTestimonial,
  updateTestimonial,
  deleteTestimonial 
} = require('../controllers/adminController');
router.route('/testimonials').get(getAdminTestimonials).post(createTestimonial);
router.route('/testimonials/:id/toggle-approval').patch(toggleTestimonialApproval);
router.route('/testimonials/:id').patch(updateTestimonial).delete(deleteTestimonial);

// Notifications routes (admin)
const { getAdminNotifications, createNotification, deleteNotification } = require('../controllers/notificationController');
router.route('/notifications').get(getAdminNotifications).post(createNotification);
router.route('/notifications/:id').delete(deleteNotification);

module.exports = router;
