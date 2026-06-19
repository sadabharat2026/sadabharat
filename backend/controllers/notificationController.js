const Notification = require('../models/notificationModel');

// GET /api/notifications/me — vendor or user fetches their own notifications
const getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const role = req.user.role; // 'vendor' or 'user'

    const notifications = await Notification.find({
      $or: [
        { targetRole: 'all' },
        { targetRole: role, targetId: null },
        { targetRole: role, targetId: userId }
      ]
    }).sort({ createdAt: -1 });

    // Attach isRead per user
    const result = notifications.map(n => ({
      ...n.toObject(),
      isRead: n.readBy?.some(id => id.toString() === userId.toString())
    }));

    res.status(200).json({ success: true, data: { notifications: result } });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/notifications/:id/read
const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });

    if (!notification.readBy.some(id => id.toString() === userId.toString())) {
      notification.readBy.push(userId);
      await notification.save();
    }

    res.status(200).json({ success: true, message: 'Marked as read' });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/notifications/mark-all-read
const markAllRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    const notifications = await Notification.find({
      $or: [
        { targetRole: 'all' },
        { targetRole: role, targetId: null },
        { targetRole: role, targetId: userId }
      ],
      readBy: { $ne: userId }
    });

    await Promise.all(notifications.map(n => {
      n.readBy.push(userId);
      return n.save();
    }));

    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// GET /api/admins/notifications — Admin views all
const getAdminNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ targetRole: { $ne: 'admin' } }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: { notifications } });
  } catch (error) {
    next(error);
  }
};

// POST /api/admins/notifications — Admin creates a notification
const createNotification = async (req, res, next) => {
  try {
    const { title, message, type, targetRole, targetId } = req.body;
    const notification = await Notification.create({
      title,
      message,
      type: type || 'info',
      targetRole,
      targetId: targetId || null
    });
    res.status(201).json({ success: true, data: { notification } });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admins/notifications/:id — Admin deletes
const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};

// POST /api/notifications/save-fcm-token
const saveFCMToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'FCM token is required' });
    }

    const recipient = req.user; // populated by protect middleware (Vendor or User)
    if (!recipient.fcmTokens) {
      recipient.fcmTokens = [];
    }

    if (!recipient.fcmTokens.includes(token)) {
      recipient.fcmTokens.push(token);
      // Keep only last 10 tokens to prevent document size bloat
      if (recipient.fcmTokens.length > 10) {
        recipient.fcmTokens = recipient.fcmTokens.slice(-10);
      }
      await recipient.save();
    }

    res.status(200).json({ success: true, message: 'FCM token saved successfully' });
  } catch (error) {
    next(error);
  }
};

// POST /api/notifications/remove-fcm-token
const removeFCMToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'FCM token is required' });
    }

    const recipient = req.user;
    if (recipient.fcmTokens) {
      recipient.fcmTokens = recipient.fcmTokens.filter(t => t !== token);
      await recipient.save();
    }

    res.status(200).json({ success: true, message: 'FCM token removed successfully' });
  } catch (error) {
    next(error);
  }
};

// POST /api/notifications/chat
const sendChatNotification = async (req, res, next) => {
  try {
    const { recipientId, recipientRole, title, message } = req.body;
    const { sendNotificationToUser } = require('../utils/pushNotificationHelper');
    
    await sendNotificationToUser(
      recipientId,
      recipientRole,
      {
        title,
        body: message
      },
      'info'
    );
    res.status(200).json({ success: true, message: 'Chat notification triggered' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllRead,
  getAdminNotifications,
  createNotification,
  deleteNotification,
  saveFCMToken,
  removeFCMToken,
  sendChatNotification
};
