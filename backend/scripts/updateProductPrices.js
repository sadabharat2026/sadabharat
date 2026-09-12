/**
 * Set official retail prices from client WhatsApp list.
 * Run: node scripts/updateProductPrices.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/productModel');
const { invalidateCatalog } = require('../utils/cache');

const PRICE_UPDATES = [
  {
    match: {
      $or: [
        { sku: 'sada-bharat-ayurvedic-hair-oil' },
        { name: /hair oil/i, comingSoon: false },
      ],
    },
    price: 1299,
    oldPrice: null,
    packSize: '100 ml',
  },
  {
    match: {
      $or: [
        { sku: 'sada-bharat-ayurvedic-hair-spray' },
        { name: /hair spray/i, comingSoon: false },
      ],
    },
    price: 1199,
    oldPrice: null,
    packSize: '100 ml',
  },
  {
    match: {
      $or: [
        { sku: 'sada-bharat-ayurvedic-hair-serum' },
        { name: /hair serum/i, comingSoon: false },
      ],
    },
    price: 1499,
    oldPrice: null,
    packSize: '30 ml',
  },
  {
    match: {
      $or: [
        { sku: 'sada-bharat-complete-hair-care-kit' },
        { name: /hair care kit/i, comingSoon: false },
        { category: 'Combo', comingSoon: false },
      ],
    },
    price: 2499,
    oldPrice: 3999,
    packSize: 'Oil 100ml + Spray 100ml + Serum 30ml',
  },
];

async function main() {
  await connectDB();

  for (const row of PRICE_UPDATES) {
    const product = await Product.findOne(row.match);
    if (!product) {
      console.log('NOT FOUND:', JSON.stringify(row.match));
      continue;
    }
    product.price = row.price;
    if (row.oldPrice == null) {
      product.oldPrice = undefined;
      product.markModified('oldPrice');
    } else {
      product.oldPrice = row.oldPrice;
    }
    if (row.packSize) product.packSize = row.packSize;
    await product.save();
    if (row.oldPrice == null) {
      await Product.updateOne({ _id: product._id }, { $unset: { oldPrice: 1 } });
    }
    console.log(
      `Updated ${product.name}: ₹${product.price}` +
        (product.oldPrice ? ` (was ₹${product.oldPrice})` : '') +
        ` | ${product.packSize}`
    );
  }

  try {
    await invalidateCatalog('products');
    console.log('Catalog cache invalidated.');
  } catch (err) {
    console.warn('Cache skip:', err.message);
  }

  const active = await Product.find({ comingSoon: false }).select('name price oldPrice packSize category');
  console.log('\nActive prices:');
  active.forEach((p) =>
    console.log(
      `- [${p.category}] ${p.name}: ₹${p.price}` +
        (p.oldPrice ? ` / MRP ₹${p.oldPrice}` : '') +
        ` (${p.packSize})`
    )
  );

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
