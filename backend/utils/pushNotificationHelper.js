const { sendPushNotification } = require('../services/firebaseAdmin');
const User = require('../models/userModel');
const Vendor = require('../models/vendorModel');
const Notification = require('../models/notificationModel');

/**
 * Sends a push notification and records an in-app notification in the database.
 * @param {string} recipientId The User or Vendor model ID.
 * @param {string} targetRole The recipient role ('user' or 'vendor' or 'admin').
 * @param {object} payload Notification details { title, message || body, data }
 * @param {string} type Notification type/severity level ('info', 'success', 'warning', 'alert')
 */
async function sendNotificationToUser(recipientId, targetRole, payload, type = 'info') {
  try {
    const textBody = payload.body || payload.message;
    
    // 1. Log in the database as an in-app notification
    await Notification.create({
      title: payload.title,
      message: textBody,
      type: type,
      targetRole: targetRole,
      targetId: targetRole === 'admin' ? null : recipientId,
      relatedId: payload.data?.relatedId || null,
      relatedModel: payload.data?.relatedModel || null
    });

    // 2. Fetch FCM tokens from DB
    let tokens = [];

    if (targetRole === 'admin') {
      const admins = await User.find({ role: 'admin' });
      admins.forEach(admin => {
        if (admin.fcmTokens) {
          tokens.push(...admin.fcmTokens);
        }
      });
      if (admins.length === 0) {
        console.log(`Notification Helper: No admin users found.`);
        return;
      }
    } else if (targetRole === 'vendor') {
      const recipient = await Vendor.findById(recipientId);
      if (!recipient) {
        console.log(`Notification Helper: Vendor ${recipientId} not found.`);
        return;
      }
      tokens = recipient.fcmTokens || [];
    } else {
      const recipient = await User.findById(recipientId);
      if (!recipient) {
        console.log(`Notification Helper: User ${recipientId} not found.`);
        return;
      }
      tokens = recipient.fcmTokens || [];
    }

    const uniqueTokens = [...new Set(tokens)].filter(Boolean);

    if (uniqueTokens.length === 0) {
      console.log(`Notification Helper: No FCM registration tokens found for ${targetRole}.`);
      return;
    }

    // 3. Dispatch Push Notification via Firebase
    await sendPushNotification(uniqueTokens, {
      title: payload.title,
      body: textBody,
      data: payload.data || {}
    });

  } catch (error) {
    console.error('Notification Helper: Error dispatching notification:', error);
  }
}

module.exports = { sendNotificationToUser };
