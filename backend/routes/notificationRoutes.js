const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  markAsRead,
  markAllRead,
  saveFCMToken,
  removeFCMToken,
  sendChatNotification
} = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

// Vendor / User routes (authenticated)
router.get('/me', protect, getMyNotifications);
router.patch('/mark-all-read', protect, markAllRead);
router.patch('/:id/read', protect, markAsRead);
router.post('/save-fcm-token', protect, saveFCMToken);
router.post('/remove-fcm-token', protect, removeFCMToken);
router.post('/chat', protect, sendChatNotification);

module.exports = router;
