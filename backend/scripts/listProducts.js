require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/productModel');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
  const all = await Product.find({}).select('name category');
  console.log('Total products:', all.length);
  all.forEach((p) => console.log('-', p.category, '|', p.name));
  await mongoose.disconnect();
}

main().catch(console.error);
