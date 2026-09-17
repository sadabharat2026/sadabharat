const mongoose = require('mongoose');

const emailOtpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    otp: { type: String, required: true },
    purpose: {
      type: String,
      required: true,
      enum: ['vendor_register', 'vendor_reset', 'vendor_login'],
      index: true,
    },
    verified: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

emailOtpSchema.index({ email: 1, purpose: 1 });

module.exports = mongoose.model('EmailOtp', emailOtpSchema);
