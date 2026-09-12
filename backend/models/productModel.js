const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  oldPrice: { type: Number },
  rating: { type: Number },
  reviews: { type: Number },
  image: { type: String, required: true },
  category: { type: String, required: true },
  packSize: { type: String },
  description: { type: String },
  ingredients: { type: String },
  benefits: { type: String },
  dosage: { type: String },
  disclaimer: { type: String },
  hasVariants: { type: Boolean, default: false },
  variants: [{
    size: String,
    price: Number,
    oldPrice: Number,
    stock: Number,
    sku: String
  }],
  sku: { type: String },
  images: [{ type: String }],
  prescriptionRequired: { type: Boolean, default: false },
  noRefund: { type: Boolean, default: false },
  codAvailable: { type: Boolean, default: false },
  tags: { type: String },
  bestseller: { type: Boolean, default: false },
  recommended: { type: Boolean, default: false },
  comingSoon: { type: Boolean, default: false },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
