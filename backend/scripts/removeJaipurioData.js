/**
 * Remove Jaipurio (terracotta/handmade) catalog data and restore Sadabharat Ayurvedic categories + banners.
 * Run: node scripts/removeJaipurioData.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Category = require('../models/categoryModel');
const Banner = require('../models/bannerModel');
const Product = require('../models/productModel');
const { invalidateCatalog } = require('../utils/cache');

const ORIGINAL_CATEGORIES = [
  { title: 'Hair Care', url: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=150&q=80' },
  { title: 'Skin Care', url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=150&q=80' },
  { title: 'Health Care', url: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=150&q=80' },
  { title: 'Herbal Tea', url: 'https://images.unsplash.com/photo-1576092762791-dd9e2220afa1?w=150&q=80' },
  { title: 'Supplements', url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=150&q=80' },
  { title: 'Body Care', url: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=150&q=80' },
  { title: 'Aromatherapy', url: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?w=150&q=80' },
  { title: 'Baby Care', url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=150&q=80' },
  { title: 'Wellness', url: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=150&q=80' },
  { title: 'Immunity', url: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=150&q=80' },
  { title: 'Digestive Care', url: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=150&q=80' },
];

const ORIGINAL_PRODUCTS = [
  {
    name: 'Bhringraj Hair Oil',
    price: 349,
    oldPrice: 499,
    rating: 4.8,
    reviews: 320,
    image: '/bhringraj_hair_oil.png',
    category: 'Hair Care',
    packSize: '200 ml',
    description: 'Traditional hair oil with pure Bhringraj and amla extracts for deep root nourishment.',
    bestseller: true,
    recommended: false,
    status: 'approved',
  },
  {
    name: 'Neem Tulsi Face Wash',
    price: 299,
    oldPrice: 399,
    rating: 4.7,
    reviews: 280,
    image: '/neem_tulsi_face_wash.png',
    category: 'Skin Care',
    packSize: '100 ml',
    description: 'Purifying Ayurvedic blend to fight acne, deep clean pores, and restore natural glow.',
    bestseller: true,
    recommended: false,
    status: 'approved',
  },
  {
    name: 'Ashwagandha Capsules',
    price: 349,
    oldPrice: 450,
    rating: 4.6,
    reviews: 210,
    image: '/ashwagandha_capsules.png',
    category: 'Supplements',
    packSize: '60 Capsules',
    description: 'Organic stress support and vitality capsules containing pure root extract.',
    bestseller: true,
    recommended: false,
    status: 'approved',
  },
  {
    name: 'Aloe Vera Gel',
    price: 249,
    oldPrice: 350,
    rating: 4.5,
    reviews: 198,
    image: '/aloe_vera_gel.png',
    category: 'Skin Care',
    packSize: '150 ml',
    description: 'Pure, multi-purpose organic aloe vera gel for soothing skin and scalp conditioning.',
    bestseller: true,
    recommended: false,
    status: 'approved',
  },
  {
    name: 'Tulsi Green Tea',
    price: 199,
    oldPrice: 299,
    rating: 4.8,
    reviews: 120,
    image: '/tulsi_green_tea.png',
    category: 'Herbal Tea',
    packSize: '25 Tea Bags',
    description: 'Antioxidant-rich herbal green tea blended with fresh tulsi leaves to boost immunity.',
    bestseller: true,
    recommended: false,
    status: 'approved',
  },
  {
    name: 'Vitamin C Face Serum',
    price: 499,
    oldPrice: 699,
    rating: 4.8,
    reviews: 160,
    image: '/skin_care_offer.png',
    category: 'Skin Care',
    packSize: '30 ml',
    description: 'Natural brightening and glow serum infused with Amla extract and Vitamin C.',
    recommended: true,
    bestseller: false,
    status: 'approved',
  },
  {
    name: 'Neem Karela Juice',
    price: 349,
    oldPrice: 499,
    rating: 4.6,
    reviews: 140,
    image: '/hair_care_offer.png',
    category: 'Health Care',
    packSize: '500 ml',
    description: 'Purifying organic wellness juice for digestion and natural blood cleansing.',
    recommended: true,
    bestseller: false,
    status: 'approved',
  },
  {
    name: 'Rosemary Essential Oil',
    price: 399,
    oldPrice: 599,
    rating: 4.7,
    reviews: 98,
    image: '/ayurvedic_hero.png',
    category: 'Aromatherapy',
    packSize: '15 ml',
    description: 'Pure therapeutic grade rosemary essential oil for focus and hair revitalization.',
    recommended: true,
    bestseller: false,
    status: 'approved',
  },
  {
    name: 'Triphala Powder',
    price: 199,
    oldPrice: 299,
    rating: 4.6,
    reviews: 110,
    image: '/herbal_tea_offer.png',
    category: 'Health Care',
    packSize: '100 gm',
    description: 'Classic three-herb digestion support powder sourced from pure organic harvest.',
    recommended: true,
    bestseller: false,
    status: 'approved',
  },
  {
    name: 'Giloy Capsules',
    price: 299,
    oldPrice: 399,
    rating: 4.7,
    reviews: 150,
    image: '/ashwagandha_capsules.png',
    category: 'Supplements',
    packSize: '60 Capsules',
    description: 'Traditional immunity booster capsules with pure Guduchi (Giloy) root extracts.',
    recommended: true,
    bestseller: false,
    status: 'approved',
  },
];

const ORIGINAL_BANNERS = [
  {
    title: 'Pure Ayurvedic Goodness',
    image: '/src/assets/images/banner3.png',
    link: '/shop',
    type: 'Main Slider',
    badge: '100% Natural',
    heading: 'Pure Ayurvedic<br />Goodness',
    subtitle: 'Natural ingredients for a healthy<br className="hidden sm:block" /> body, mind & soul',
    btnText: 'Shop Now',
  },
  {
    title: 'Sada Bharat Standard Banner',
    image: '/src/assets/images/sadabharat_banner.png',
    type: 'Main Slider',
  },
  {
    title: 'Traditional Healing Modern Life',
    image: '/src/assets/images/sadabharat_banner1.png',
    link: '/shop',
    type: 'Main Slider',
    badge: 'Authentic Care',
    heading: 'Traditional Healing<br />Modern Life',
    subtitle: 'Experience the magic of Ayurveda<br className="hidden sm:block" /> in your daily routine',
    btnText: 'Explore More',
  },
];

const JAIPURIO_CATEGORIES = [
  'Home Decor',
  'Kitchen Mitti',
  'Kulhads',
  'Matkas',
  'Planters',
  'Puja Essentials',
];

const JAIPURIO_PATTERN = /jaipurio|mitti|rajasthan|handmade|khushboo|pehchaan|terracotta|kulhad|matka|planter|jaipuri/i;

async function main() {
  await connectDB();

  const beforeCats = await Category.find({});
  console.log('Categories before:', beforeCats.map((c) => c.title).join(', '));

  const removedProducts = await Product.deleteMany({
    $or: [
      { category: { $in: JAIPURIO_CATEGORIES } },
      { name: JAIPURIO_PATTERN },
      { category: JAIPURIO_PATTERN },
      { description: JAIPURIO_PATTERN },
    ],
  });
  console.log(`Removed ${removedProducts.deletedCount} Jaipurio products.`);

  await Product.insertMany(ORIGINAL_PRODUCTS);
  console.log(`Restored ${ORIGINAL_PRODUCTS.length} Sadabharat Ayurvedic products.`);

  await Category.deleteMany({});
  await Category.insertMany(ORIGINAL_CATEGORIES);
  console.log(`Restored ${ORIGINAL_CATEGORIES.length} Sadabharat categories.`);

  await Banner.deleteMany({});
  await Banner.insertMany(ORIGINAL_BANNERS);
  console.log(`Restored ${ORIGINAL_BANNERS.length} Sadabharat banners.`);

  const afterCats = await Category.find({}).sort('title');
  const afterBanners = await Banner.find({});
  const remainingProducts = await Product.countDocuments();

  console.log('\nCategories after:', afterCats.map((c) => c.title).join(', '));
  console.log('Banners after:', afterBanners.map((b) => b.title).join(', '));
  console.log('Remaining products:', remainingProducts);

  try {
    await invalidateCatalog('categories', 'banners', 'products');
    console.log('Catalog cache invalidated.');
  } catch (err) {
    console.warn('Cache invalidation skipped:', err.message);
  }

  await mongoose.disconnect();
  console.log('Done.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
