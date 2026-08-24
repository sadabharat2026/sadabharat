const express = require('express');
const { signup, login, sendRegisterOtp, register, sendOtp, verifyOtp, getMe, updateProfile, addAddress, updateAddress, deleteAddress, getUsers, getBlockedUsers, blockUser, unblockUser, updatePassword } = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { otpMobileLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.route('/')
  .get(protect, authorize('admin'), getUsers);

router.get('/blocked', protect, authorize('admin'), getBlockedUsers);
router.put('/:id/block', protect, authorize('admin'), blockUser);
router.put('/:id/unblock', protect, authorize('admin'), unblockUser);

router.post('/signup', signup);
router.post('/login', login);

router.post('/send-register-otp', otpMobileLimiter, sendRegisterOtp);
router.post('/register', register);

router.post('/send-otp', otpMobileLimiter, sendOtp);
router.post('/verify-otp', verifyOtp);

router.route('/profile')
  .get(protect, getMe)
  .put(protect, updateProfile);

router.patch('/update-password', protect, updatePassword);

router.route('/addresses')
  .post(protect, addAddress);

router.route('/addresses/:id')
  .put(protect, updateAddress)
  .delete(protect, deleteAddress);

module.exports = router;
