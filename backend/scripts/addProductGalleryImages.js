require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/productModel');

const insertCloudinaryTransform = (url, transform) => {
  const marker = '/upload/';
  const at = url.indexOf(marker);
  if (at === -1) return url;
  const rest = url.slice(at + marker.length);
  return `${url.slice(0, at + marker.length)}${transform}/${rest}`;
};

const expandGallery = (url) => {
  if (!url || typeof url !== 'string' || url.startsWith('blob:')) return [];

  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    return [
      url,
      insertCloudinaryTransform(url, 'c_fill,g_center,z_1.22,w_900,h_900,q_auto:good,f_webp'),
      insertCloudinaryTransform(url, 'c_fill,g_auto,z_1.42,w_900,h_900,q_auto:good,f_webp'),
    ];
  }

  if (url.includes('images.unsplash.com')) {
    const base = url.split('?')[0];
    return [
      url,
      `${base}?w=800&h=800&fit=crop&crop=entropy&q=80`,
      `${base}?w=800&h=800&fit=crop&crop=top&q=80`,
    ];
  }

  return [url];
};

(async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('Missing MONGODB_URI');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    const products = await Product.find({});
    let updated = 0;

    for (const product of products) {
      const existing = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
      if (existing.length >= 2) continue;

      const gallery = expandGallery(product.image);
      if (gallery.length < 2) continue;

      product.images = gallery;
      product.image = gallery[0];
      await product.save();
      updated += 1;
      console.log(`Updated gallery for: ${product.name} (${gallery.length} images)`);
    }

    console.log(`Done. Updated ${updated} of ${products.length} products.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
