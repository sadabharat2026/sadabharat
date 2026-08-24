require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const Product = require('./models/productModel');
const Banner = require('./models/bannerModel');
const Settings = require('./models/settingsModel');

const initialProducts = [
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
    recommended: false
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
    recommended: false
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
    recommended: false
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
    recommended: false
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
    recommended: false
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
    bestseller: false
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
    bestseller: false
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
    bestseller: false
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
    bestseller: false
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
    bestseller: false
  }
];

const fallbackBanners = [
  {
    title: 'Pure Ayurvedic\nGoodness',
    subtitle: '100% NATURAL',
    description: 'Natural ingredients for a healthy body, mind & soul',
    image: '/ayurvedic_hero.png',
    link: '/shop'
  }
];

const initialSettings = {
  taxRate: 18,
  deliveryCharge: 50,
  freeDeliveryThreshold: 1000,
  estDeliveryDays: '3-5 Business Days',
  shippingPartner: 'DTDC',
  trackingUrl: 'https://shiprocket.co/tracking/',
  supportContact: '+91 74071 75567'
};

const seedData = async () => {
  try {
    await connectDB();

    await Product.deleteMany();
    await Banner.deleteMany();
    await Settings.deleteMany();

    await Product.insertMany(initialProducts);
    await Banner.insertMany(fallbackBanners);
    await Settings.create(initialSettings);

    console.log('Products, Banners, and Settings seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
