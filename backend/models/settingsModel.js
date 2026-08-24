const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  taxRate: { type: Number, default: 18 },
  deliveryCharge: { type: Number, default: 50 },
  freeDeliveryThreshold: { type: Number, default: 1000 },
  estDeliveryDays: { type: String, default: '3-5 Business Days' },
  shippingPartner: { type: String, default: 'Standard Courier' },
  trackingUrl: { type: String, default: 'https://shiprocket.co/tracking/' },
  supportContact: { type: String, default: '+91 74071 75567' },
  isCodEnabled: { type: Boolean, default: true },
  codCharge: { type: Number, default: 0 },
  
  // Security / Admin Preferences
  pushNotifications: { type: Boolean, default: true },
  emailDispatch: { type: Boolean, default: false },
  smsGateway: { type: Boolean, default: true },
  soundAlerts: { type: Boolean, default: true },
  currency: { type: String, default: 'INR (₹)' },
  taxComputation: { type: String, default: 'Automatic (GST)' },
  maintenanceMode: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
