const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'alert'],
    default: 'info'
  },
  targetRole: {
    type: String,
    enum: ['admin', 'vendor', 'user', 'all'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null  // null means broadcast to all of the targetRole
  },
  isRead: {
    type: Boolean,
    default: false
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  relatedModel: {
    type: String,
    enum: ['Order', 'Vendor', 'Product', 'User', 'Review', 'SupportTicket', null],
    default: null
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
