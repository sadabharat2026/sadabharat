/**
 * Ensure Hair Serum has packSize 50 ml and description includes it.
 * Run: node scripts/updateHairSerumPackSize.js
 */
require('dotenv').config();
const connectDB = require('../config/db');
const Product = require('../models/productModel');
const { invalidateCatalog } = require('../utils/cache');

const DESCRIPTION =
  'Sada Bharat Ayurvedic Hair Serum (50 ml) is a lightweight finishing serum for strong, healthy & beautiful hair. Enriched with Amla, Hibiscus and herbal extracts, it nourishes from root to tip for soft shine and frizz control without heaviness.';

(async () => {
  await connectDB();
  const result = await Product.updateMany(
    {
      $or: [
        { sku: 'sada-bharat-ayurvedic-hair-serum' },
        { name: /hair serum/i },
      ],
    },
    {
      $set: {
        packSize: '50 ml',
        description: DESCRIPTION,
        comingSoon: false,
        status: 'approved',
      },
    }
  );
  await invalidateCatalog('products').catch(() => {});
  console.log(`Updated ${result.modifiedCount} Hair Serum product(s) → packSize 50 ml`);
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
