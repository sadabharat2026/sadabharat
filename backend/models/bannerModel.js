const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  image: { type: String, required: true },
  link: { type: String },
  type: {
    type: String,
    enum: ['Main Slider', 'Mid-Section', 'Category Banner', 'Trending', 'Offers', 'AppPromo', 'Vendor Dashboard'],
    default: 'Main Slider',
  },
  description: { type: String },
  badge: { type: String },
  heading: { type: String },
  price: { type: String },
  btnText: { type: String, default: 'SHOP NOW' },
  isVideo: { type: Boolean, default: false },
  slot: { type: Number, default: 1, min: 1 },
  sequence: { type: Number, default: 1 },
  seoTitle: { type: String },
  seoDescription: { type: String },
  seoKeywords: { type: String },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Banner', bannerSchema);
