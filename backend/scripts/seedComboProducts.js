/**
 * Ensure Combo category exists and upsert Complete Hair Care Kit combo product.
 * Run: node scripts/seedComboProducts.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const { invalidateCatalog } = require('../utils/cache');

const COMBO_CATEGORY = {
  title: 'Combo',
  url: 'https://res.cloudinary.com/drcbbgjuq/image/upload/v1788208382/sadabharat_icons/arsoz6x6lz9fof1x8llx.jpg',
};

const COMBO_PRODUCT = {
  sku: 'sada-bharat-complete-hair-care-kit',
  name: 'Sada Bharat Complete Hair Care Kit',
  price: 999,
  oldPrice: 1347,
  rating: 4.9,
  reviews: 64,
  image: '/combo1.jpeg',
  images: ['/combo1.jpeg', '/combo2.jpeg', '/combo3.jpeg'],
  category: 'Combo',
  packSize: 'Oil 100ml + Spray 100ml + Serum 50ml',
  description:
    'Sada Bharat Complete Hair Care Kit is a 100% natural Ayurvedic premium gift set for strong, healthy & beautiful hair. The kit includes Ayurvedic Hair Oil (100 ml), Hair Spray (100 ml), and Hair Serum (50 ml) — a full ritual of scalp nourishment, daily refresh, and finishing shine in one combo.',
  ingredients:
    'Hair Oil: Amla, Hibiscus, Neem, Coconut oil base, Methi, Kalonji, Sesame. Hair Spray: Aloe Vera, Lemon, Hibiscus, Rosemary, Lavender. Hair Serum: Amla, Hibiscus, Neem, Methi, Kalonji and Ayurvedic botanical oils.',
  benefits:
    'Complete hair care in one kit — nourishes roots, refreshes hair daily, controls frizz, adds shine, and makes an ideal premium gift.',
  dosage:
    'Oil: Massage into scalp 2–3 times a week. Spray: Mist daily on hair as needed. Serum: Apply 2–4 drops on mid-lengths and ends after wash or before styling.',
  disclaimer: 'For external use only. Patch test recommended. Store in a cool, dry place away from direct sunlight.',
  bestseller: true,
  recommended: true,
  comingSoon: false,
  status: 'approved',
  tags: 'main,combo,hair-care-kit,ayurvedic',
};

async function main() {
  await connectDB();

  const existingCat = await Category.findOne({ title: COMBO_CATEGORY.title });
  if (existingCat) {
    if (!existingCat.url) {
      existingCat.url = COMBO_CATEGORY.url;
      await existingCat.save();
    }
    console.log('Combo category already exists.');
  } else {
    await Category.create(COMBO_CATEGORY);
    console.log('Created Combo category.');
  }

  const existing = await Product.findOne({
    $or: [
      { sku: COMBO_PRODUCT.sku },
      { image: '/combo1.jpeg' },
      { name: COMBO_PRODUCT.name },
    ],
  });

  if (existing) {
    Object.assign(existing, COMBO_PRODUCT);
    await existing.save();
    console.log(`Updated combo product: ${COMBO_PRODUCT.name}`);
  } else {
    await Product.create(COMBO_PRODUCT);
    console.log(`Created combo product: ${COMBO_PRODUCT.name}`);
  }

  try {
    await invalidateCatalog('products', 'categories');
    console.log('Catalog cache invalidated.');
  } catch (err) {
    console.warn('Cache invalidation skipped:', err.message);
  }

  const combo = await Product.findOne({ sku: COMBO_PRODUCT.sku }).select(
    'name category image images comingSoon packSize price'
  );
  console.log('\nCombo product:', JSON.stringify(combo, null, 2));

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
