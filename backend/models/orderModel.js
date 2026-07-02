const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      name: { type: String, required: true },
      qty: { type: Number, required: true },
      price: { type: Number, required: true },
      image: { type: String },
      vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor'
      },
      admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      status: {
        type: String,
        enum: ['Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Processing'
      },
      trackingNumber: { type: String }
    }
  ],
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String }
  },
  paymentMethod: {
    type: String,
    required: true,
    default: 'COD' // Cash on Delivery by default, or Razorpay/Stripe
  },
  paymentResult: {
    id: { type: String },
    status: { type: String },
    update_time: { type: String },
    email_address: { type: String }
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  returnStatus: {
    type: String,
    enum: ['Not Requested', 'Return Requested', 'Return Approved', 'Return Rejected', 'Returned', 'Replace Requested', 'Replace Approved', 'Replace Rejected', 'Replaced'],
    default: 'Not Requested'
  },
  returnReason: {
    type: String
  },
  returnAction: {
    type: String,
    enum: ['Refund', 'Replace']
  },
  returnImages: [{
    type: String
  }],
  refundAccountDetails: {
    accountName: String,
    bankName: String,
    accountNumber: String,
    ifscCode: String
  },
  
  // Shiprocket Integration Fields
  shiprocketOrderId: { type: String },
  shipmentId: { type: String },
  awbCode: { type: String },
  courierName: { type: String },
  trackingUrl: { type: String },
  shippingCharge: { type: Number },
  pickupScheduled: { type: Boolean, default: false },
  labelUrl: { type: String },
  invoiceUrl: { type: String },
  shippingStatus: { type: String },
  estimatedDelivery: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
