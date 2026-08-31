/**
 * Upload Sadabharat category icons + hero banners/video to Cloudinary and update MongoDB.
 * Run: node scripts/restoreSadabharatMedia.js
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const connectDB = require('../config/db');
const Category = require('../models/categoryModel');
const Banner = require('../models/bannerModel');
const { invalidateCatalog } = require('../utils/cache');

const ROOT = path.resolve(__dirname, '../../frontend');
const ICONS_DIR = path.join(ROOT, 'src/assets/images/icons');
const IMAGES_DIR = path.join(ROOT, 'src/assets/images');
const TOP_VIDEO = path.join(ROOT, 'public/top_banner_video.mp4');
const PERFUME_VIDEO = path.join(ROOT, 'src/assets/videos/perfume_video.mp4');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFile = (localPath, options = {}) =>
  new Promise((resolve, reject) => {
    if (!fs.existsSync(localPath)) {
      return reject(new Error(`Missing file: ${localPath}`));
    }
    cloudinary.uploader.upload(localPath, options, (error, result) => {
      if (error) return reject(error);
      resolve(result.secure_url);
    });
  });

const categoryIconMap = {
  'hair care': 'icon_hair_care_1779911677580.png',
  'skin care': 'icon_skin_care_1779911695841.png',
  'health care': 'icon_health_care_1779911711916.png',
  'herbal tea': 'icon_herbal_tea_1779911729080.png',
  supplements: 'icon_supplements_1779911746926.png',
  'body care': 'icon_body_care_1779911767707.png',
  aromatherapy: 'icon_aromatherapy_1779911786264.png',
  'baby care': 'icon_baby_care_1779911800390.png',
  wellness: 'icon_wellness.png',
  immunity: 'icon_immunity.png',
  'digestive care': 'icon_digestive_care.png',
};

async function restoreCategories() {
  const categories = await Category.find({});
  for (const cat of categories) {
    const key = cat.title.toLowerCase().trim();
    const iconFile = categoryIconMap[key];
    if (!iconFile) {
      console.warn(`No icon mapping for category: ${cat.title}`);
      continue;
    }
    const iconPath = path.join(ICONS_DIR, iconFile);
    const url = await uploadFile(iconPath, {
      folder: 'sadabharat_icons',
      resource_type: 'image',
    });
    await Category.updateOne({ _id: cat._id }, { $set: { url } });
    console.log(`Category "${cat.title}" -> ${url}`);
  }
}

async function restoreBanners() {
  const videoPath = fs.existsSync(TOP_VIDEO) ? TOP_VIDEO : PERFUME_VIDEO;
  const videoUrl = await uploadFile(videoPath, {
    folder: 'sadabharat_banners',
    resource_type: 'video',
    quality: 'auto:eco',
  });

  const banner3Url = await uploadFile(path.join(IMAGES_DIR, 'banner3.png'), {
    folder: 'sadabharat_banners',
    resource_type: 'image',
    format: 'webp',
    quality: 'auto:good',
  });
  const standardUrl = await uploadFile(path.join(IMAGES_DIR, 'sadabharat_banner.png'), {
    folder: 'sadabharat_banners',
    resource_type: 'image',
    format: 'webp',
    quality: 'auto:good',
  });
  const healingUrl = await uploadFile(path.join(IMAGES_DIR, 'sadabharat_banner1.png'), {
    folder: 'sadabharat_banners',
    resource_type: 'image',
    format: 'webp',
    quality: 'auto:good',
  });

  await Banner.deleteMany({});

  await Banner.insertMany([
    {
      title: 'Pure Ayurvedic Goodness',
      image: videoUrl,
      link: '/shop',
      type: 'Main Slider',
      badge: '100% Natural',
      heading: 'Pure Ayurvedic<br />Goodness',
      subtitle: 'Natural ingredients for a healthy<br className="hidden sm:block" /> body, mind & soul',
      btnText: 'Shop Now',
      isVideo: true,
      slot: 1,
      sequence: 1,
      status: 'active',
    },
    {
      title: 'Sada Bharat Standard Banner',
      image: standardUrl,
      type: 'Main Slider',
      slot: 2,
      sequence: 2,
      status: 'active',
    },
    {
      title: 'Pure Ayurvedic Goodness Slide',
      image: banner3Url,
      link: '/shop',
      type: 'Main Slider',
      badge: '100% Natural',
      heading: 'Pure Ayurvedic<br />Goodness',
      subtitle: 'Natural ingredients for a healthy<br className="hidden sm:block" /> body, mind & soul',
      btnText: 'Shop Now',
      isVideo: false,
      slot: 3,
      sequence: 3,
      status: 'active',
    },
    {
      title: 'Traditional Healing Modern Life',
      image: healingUrl,
      link: '/shop',
      type: 'Main Slider',
      badge: 'Authentic Care',
      heading: 'Traditional Healing<br />Modern Life',
      subtitle: 'Experience the magic of Ayurveda<br className="hidden sm:block" /> in your daily routine',
      btnText: 'Explore More',
      isVideo: false,
      slot: 4,
      sequence: 4,
      status: 'active',
    },
  ]);

  console.log('Banners restored with video + images.');
}

async function main() {
  await connectDB();
  console.log('Restoring category icons...');
  await restoreCategories();
  console.log('Restoring hero banners...');
  await restoreBanners();
  try {
    await invalidateCatalog('categories', 'banners');
    console.log('Cache invalidated.');
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
