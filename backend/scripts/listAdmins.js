require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/userModel');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
  const admins = await User.find({ role: 'admin' }).select('name email mobile createdAt');
  console.log(JSON.stringify(admins, null, 2));
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
