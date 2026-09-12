/**
 * Seed 3 main Sada Bharat hair products and mark all others Coming Soon.
 * Run: node scripts/seedMainHairProducts.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/productModel');
const { invalidateCatalog } = require('../utils/cache');

const MAIN_PRODUCTS = [
  {
    sku: 'sada-bharat-ayurvedic-hair-oil',
    name: 'Sada Bharat Ayurvedic Hair Oil',
    price: 399,
    oldPrice: 549,
    rating: 4.9,
    reviews: 128,
    image: '/product1.jpeg',
    images: ['/product1.jpeg'],
    category: 'Hair Care',
    packSize: '100 ml',
    description:
      'Sada Bharat Ayurvedic Hair Oil (100 ml) is crafted for strong, healthy & beautiful hair. This 100% natural blend uses traditional herbs and oils to nourish the scalp, reduce hair fall, and restore natural shine — pure Ayurvedic care in every drop.',
    ingredients:
      'Amla, Hibiscus, Neem, Coconut oil base, Methi (fenugreek), Kalonji, Sesame and other Ayurvedic herbs.',
    benefits:
      'Strengthens roots, supports healthy hair growth, adds natural shine, and helps keep hair soft and manageable.',
    dosage: 'Warm slightly and massage into scalp and hair. Leave for 30–60 minutes or overnight, then wash with a mild shampoo. Use 2–3 times a week.',
    disclaimer: 'For external use only. Patch test recommended. Store in a cool, dry place away from direct sunlight.',
    bestseller: true,
    recommended: true,
    comingSoon: false,
    status: 'approved',
    tags: 'main,hair-oil,ayurvedic',
  },
  {
    sku: 'sada-bharat-ayurvedic-hair-serum',
    name: 'Sada Bharat Ayurvedic Hair Serum',
    price: 349,
    oldPrice: 499,
    rating: 4.8,
    reviews: 96,
    image: '/product2.jpeg',
    images: ['/product2.jpeg'],
    category: 'Hair Care',
    packSize: '50 ml',
    description:
      'Sada Bharat Ayurvedic Hair Serum (50 ml) is formulated for strong, healthy & beautiful hair. Lightweight Ayurvedic drops with Amla, Hibiscus and herbal extracts nourish from root to tip — for soft, shiny, frizz-controlled hair without heaviness.',
    ingredients:
      'Amla extract, Hibiscus, Neem, Methi, Kalonji and Ayurvedic botanical oils in a lightweight serum base.',
    benefits:
      'Controls frizz, adds shine, softens hair strands, and supports a healthy-looking scalp and hair texture.',
    dosage: 'Apply 2–4 drops on damp or dry hair, focusing on mid-lengths and ends. Style as usual. Use daily or as needed.',
    disclaimer: 'For external use only. Avoid contact with eyes. Keep out of reach of children.',
    bestseller: true,
    recommended: true,
    comingSoon: false,
    status: 'approved',
    tags: 'main,hair-serum,ayurvedic',
  },
  {
    sku: 'sada-bharat-ayurvedic-hair-spray',
    name: 'Sada Bharat Ayurvedic Hair Spray',
    price: 299,
    oldPrice: 449,
    rating: 4.7,
    reviews: 84,
    image: '/product3.jpeg',
    images: ['/product3.jpeg'],
    category: 'Hair Care',
    packSize: '100 ml',
    description:
      'Sada Bharat Ayurvedic Hair Spray (100 ml) refreshes and fortifies hair for a strong, healthy & beautiful look. Mist enriched with Aloe Vera, citrus botanicals and herbal extracts — easy everyday Ayurvedic care for soft, lively hair.',
    ingredients:
      'Aloe Vera, Lemon extract, Hibiscus, Rosemary, Lavender and other Ayurvedic botanicals in a fine mist base.',
    benefits:
      'Hydrates hair, adds freshness, supports shine, and makes daily styling easier with a light natural finish.',
    dosage: 'Shake well. Spray evenly on hair from a distance of 15–20 cm. Style as desired. Suitable for daily use.',
    disclaimer: 'For external use only. Do not spray near eyes or open flame. Store upright in a cool place.',
    bestseller: true,
    recommended: true,
    comingSoon: false,
    status: 'approved',
    tags: 'main,hair-spray,ayurvedic',
  },
];

async function main() {
  await connectDB();

  const mainSkus = MAIN_PRODUCTS.map((p) => p.sku);
  const mainImages = MAIN_PRODUCTS.map((p) => p.image);

  for (const data of MAIN_PRODUCTS) {
    const existing = await Product.findOne({
      $or: [{ sku: data.sku }, { image: data.image }, { name: data.name }],
    });
    if (existing) {
      Object.assign(existing, data);
      await existing.save();
      console.log(`Updated main product: ${data.name}`);
    } else {
      await Product.create(data);
      console.log(`Created main product: ${data.name}`);
    }
  }

  const comingSoonResult = await Product.updateMany(
    {
      $and: [
        { sku: { $nin: mainSkus } },
        { image: { $nin: mainImages } },
        { name: { $nin: MAIN_PRODUCTS.map((p) => p.name) } },
      ],
    },
    { $set: { comingSoon: true, recommended: false, bestseller: false } }
  );

  await Product.updateMany(
    {
      $or: [
        { sku: { $in: mainSkus } },
        { image: { $in: mainImages } },
        { name: { $in: MAIN_PRODUCTS.map((p) => p.name) } },
      ],
    },
    { $set: { comingSoon: false, status: 'approved' } }
  );

  console.log(`Marked ${comingSoonResult.modifiedCount} other products as Coming Soon.`);

  const all = await Product.find({}).select('name comingSoon image sku');
  console.log('\nCatalog:');
  all.forEach((p) =>
    console.log(`- [${p.comingSoon ? 'COMING SOON' : 'MAIN'}] ${p.name} | ${p.image}`)
  );

  try {
    await invalidateCatalog('products');
    console.log('Catalog cache invalidated.');
  } catch (err) {
    console.warn('Cache invalidation skipped:', err.message);
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
