const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true, unique: true },
  password: { type: String, required: false, default: '' },
  
  businessName: { type: String, required: true },
  gstNumber: { type: String, required: true },
  businessType: { type: String, required: true },
  businessAddress: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  
  accountHolderName: { type: String, required: true },
  bankName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  ifscCode: { type: String, required: true },
  upiId: { type: String },
  
  storeName: { type: String, required: true },
  storeDescription: { type: String, required: true },
  categories: [{ type: String }],
  documents: [{ type: String }],
  
  isApproved: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  role: { type: String, default: 'vendor' },
  fcmTokens: { type: [String], default: [] }
}, {
  timestamps: true
});

module.exports = mongoose.model('Vendor', vendorSchema);
