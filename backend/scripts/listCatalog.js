require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
  const products = await Product.find({}).select('name sku image images category comingSoon packSize price').sort('name');
  const cats = await Category.find({}).select('title');
  console.log('CATEGORIES:', cats.map((c) => c.title).join(', '));
  console.log('\nPRODUCTS:');
  products.forEach((p) => {
    console.log(
      JSON.stringify({
        name: p.name,
        sku: p.sku,
        category: p.category,
        comingSoon: p.comingSoon,
        image: p.image,
        images: p.images,
        packSize: p.packSize,
        price: p.price,
      })
    );
  });
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
