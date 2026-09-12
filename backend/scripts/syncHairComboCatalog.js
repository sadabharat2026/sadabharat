/**
 * Compare new hair/combo photos with catalog.
 * Same products → refresh images + descriptions only (no duplicates).
 * Others → Coming Soon.
 * Run: node scripts/syncHairComboCatalog.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const { invalidateCatalog } = require('../utils/cache');

const ACTIVE = [
  {
    sku: 'sada-bharat-ayurvedic-hair-oil',
    name: 'Sada Bharat Ayurvedic Hair Oil',
    category: 'Hair Care',
    price: 399,
    oldPrice: 549,
    rating: 4.9,
    reviews: 128,
    image: '/hair-oil-lifestyle.webp',
    images: ['/hair-oil-lifestyle.webp', '/product1.jpeg'],
    packSize: '100 ml',
    description:
      'Sada Bharat Ayurvedic Hair Oil (100 ml) is a 100% natural, unisex blend for strong, healthy & beautiful hair. Premium oils with Amla, Hibiscus, Neem and coconut base nourish the scalp, reduce hair fall, and restore natural shine — traditional Ayurvedic care in every drop.',
    ingredients:
      'Amla, Hibiscus, Neem, Coconut oil base, Methi (fenugreek), Kalonji, Sesame and other Ayurvedic herbs.',
    benefits:
      'Strengthens roots, supports healthy growth, adds natural shine, and keeps hair soft and manageable.',
    dosage:
      'Warm slightly and massage into scalp and hair. Leave 30–60 minutes or overnight, then wash with a mild shampoo. Use 2–3 times a week.',
    disclaimer: 'For external use only. Patch test recommended. Store in a cool, dry place away from direct sunlight.',
    bestseller: true,
    recommended: true,
    comingSoon: false,
    status: 'approved',
    tags: 'main,hair-oil,ayurvedic,haircare',
  },
  {
    sku: 'sada-bharat-ayurvedic-hair-serum',
    name: 'Sada Bharat Ayurvedic Hair Serum',
    category: 'Hair Care',
    price: 349,
    oldPrice: 499,
    rating: 4.8,
    reviews: 96,
    image: '/hair-serum-lifestyle.webp',
    images: ['/hair-serum-lifestyle.webp', '/product2.jpeg'],
    packSize: '50 ml',
    description:
      'Sada Bharat Ayurvedic Hair Serum (50 ml) is a lightweight finishing serum for strong, healthy & beautiful hair. Enriched with Amla, Hibiscus and herbal extracts, it nourishes from root to tip for soft shine and frizz control without heaviness.',
    ingredients:
      'Amla extract, Hibiscus, Neem, Methi, Kalonji and Ayurvedic botanical oils in a lightweight serum base.',
    benefits:
      'Controls frizz, adds shine, softens strands, and supports a healthy-looking scalp and hair texture.',
    dosage:
      'Apply 2–4 drops on damp or dry hair, focusing on mid-lengths and ends. Style as usual. Use daily or as needed.',
    disclaimer: 'For external use only. Avoid contact with eyes. Keep out of reach of children.',
    bestseller: true,
    recommended: true,
    comingSoon: false,
    status: 'approved',
    tags: 'main,hair-serum,ayurvedic,haircare',
  },
  {
    sku: 'sada-bharat-ayurvedic-hair-spray',
    name: 'Sada Bharat Ayurvedic Hair Spray',
    category: 'Hair Care',
    price: 299,
    oldPrice: 449,
    rating: 4.7,
    reviews: 84,
    image: '/hair-spray-lifestyle.webp',
    images: ['/hair-spray-lifestyle.webp', '/product3.jpeg'],
    packSize: '100 ml',
    description:
      'Sada Bharat Ayurvedic Hair Spray (100 ml) refreshes and fortifies hair for a strong, healthy & beautiful look. Fine mist with Aloe Vera, citrus botanicals and herbal extracts — easy everyday Ayurvedic care for soft, lively hair.',
    ingredients:
      'Aloe Vera, Lemon extract, Hibiscus, Rosemary, Lavender and other Ayurvedic botanicals in a fine mist base.',
    benefits:
      'Hydrates hair, adds freshness, supports shine, and makes daily styling easier with a light natural finish.',
    dosage:
      'Shake well. Spray evenly on hair from 15–20 cm. Style as desired. Suitable for daily use.',
    disclaimer: 'For external use only. Do not spray near eyes or open flame. Store upright in a cool place.',
    bestseller: true,
    recommended: true,
    comingSoon: false,
    status: 'approved',
    tags: 'main,hair-spray,ayurvedic,haircare',
  },
  {
    sku: 'sada-bharat-complete-hair-care-kit',
    name: 'Sada Bharat Complete Hair Care Kit',
    category: 'Combo',
    price: 999,
    oldPrice: 1347,
    rating: 4.9,
    reviews: 64,
    image: '/combo-kit-gift.jpg',
    images: [
      '/combo-kit-gift.jpg',
      '/combo-kit-alt.webp',
      '/combo-trio-wood.webp',
      '/combo-trio-white.webp',
      '/combo1.jpeg',
      '/combo2.jpeg',
    ],
    packSize: 'Oil 100ml + Spray 100ml + Serum 50ml',
    description:
      'Sada Bharat Complete Hair Care Kit is a 100% natural Ayurvedic premium gift set for strong, healthy & beautiful hair. Includes Ayurvedic Hair Oil (100 ml), Hair Spray (100 ml), and Hair Serum (50 ml) — full scalp nourishment, daily refresh, and finishing shine in one combo.',
    ingredients:
      'Hair Oil: Amla, Hibiscus, Neem, Coconut oil base, Methi, Kalonji, Sesame. Hair Spray: Aloe Vera, Lemon, Hibiscus, Rosemary, Lavender. Hair Serum: Amla, Hibiscus, Neem, Methi, Kalonji and Ayurvedic botanical oils.',
    benefits:
      'Complete 3-step hair care — nourishes roots, refreshes daily, controls frizz, adds shine, and makes an ideal premium gift.',
    dosage:
      'Oil: Massage into scalp 2–3 times a week. Spray: Mist daily as needed. Serum: Apply 2–4 drops on mid-lengths and ends after wash or before styling.',
    disclaimer: 'For external use only. Patch test recommended. Store in a cool, dry place away from direct sunlight.',
    bestseller: true,
    recommended: true,
    comingSoon: false,
    status: 'approved',
    tags: 'main,combo,hair-care-kit,ayurvedic',
  },
];

async function ensureCategories() {
  for (const title of ['Hair Care', 'Combo']) {
    const existing = await Category.findOne({ title });
    if (!existing) {
      await Category.create({
        title,
        url: title === 'Combo' ? '/combo-kit-gift.jpg' : '/hair-oil-lifestyle.webp',
      });
      console.log(`Created category: ${title}`);
    } else if (title === 'Combo') {
      existing.url = '/combo-kit-gift.jpg';
      await existing.save();
    }
  }
}

async function upsertActive() {
  const skus = [];
  for (const data of ACTIVE) {
    skus.push(data.sku);
    const existing = await Product.findOne({
      $or: [{ sku: data.sku }, { name: data.name }],
    });
    if (existing) {
      Object.assign(existing, data);
      await existing.save();
      console.log(`UPDATED (same product, no duplicate): ${data.name} [${data.category}]`);
    } else {
      await Product.create(data);
      console.log(`CREATED (new): ${data.name} [${data.category}]`);
    }
  }
  return skus;
}

async function markOthersComingSoon(activeSkus) {
  const result = await Product.updateMany(
    { sku: { $nin: activeSkus }, name: { $nin: ACTIVE.map((p) => p.name) } },
    { $set: { comingSoon: true, recommended: false, bestseller: false } }
  );
  await Product.updateMany(
    { $or: [{ sku: { $in: activeSkus } }, { name: { $in: ACTIVE.map((p) => p.name) } }] },
    { $set: { comingSoon: false, status: 'approved' } }
  );
  console.log(`Marked ${result.modifiedCount} other products as Coming Soon.`);
}

async function main() {
  await connectDB();
  await ensureCategories();
  const skus = await upsertActive();
  await markOthersComingSoon(skus);

  console.log('\n=== Comparison summary ===');
  console.log('Hair Spray photo      → same as existing Hair Spray (gallery refresh)');
  console.log('Hair Serum photo      → same as existing Hair Serum (gallery refresh)');
  console.log('Hair Oil photo        → same as existing Hair Oil (gallery refresh)');
  console.log('Trio white / wood     → same as Complete Hair Care Kit (gallery refresh)');
  console.log('Complete Kit photos   → same as Complete Hair Care Kit (gallery refresh)');
  console.log('No duplicate products created.');

  try {
    await invalidateCatalog('products', 'categories');
    console.log('\nCatalog cache invalidated.');
  } catch (err) {
    console.warn('Cache invalidation skipped:', err.message);
  }

  const active = await Product.find({ comingSoon: false }).select('name category image');
  console.log('\nActive products:');
  active.forEach((p) => console.log(`- [${p.category}] ${p.name} → ${p.image}`));

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
