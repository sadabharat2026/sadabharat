require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/categoryModel');
const Banner = require('../models/bannerModel');
const Product = require('../models/productModel');

const rx = /jaipurio|mitti|rajasthan|handmade|khushboo|pehchaan/i;

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
  const cats = await Category.find({}).sort('title');
  const banners = await Banner.find({}).sort('order');
  const products = await Product.find({
    $or: [
      { name: rx },
      { category: rx },
      { description: rx },
    ],
  }).limit(50);

  console.log('=== CATEGORIES', cats.length, '===');
  cats.forEach((c) => console.log('-', c.title));

  console.log('\n=== BANNERS', banners.length, '===');
  banners.forEach((b) =>
    console.log('-', b.title, '| subtitle:', b.subtitle, '| type:', b.type)
  );

  console.log('\n=== MATCHING PRODUCTS', products.length, '===');
  products.forEach((p) => console.log('-', p.name, '|', p.category));

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
