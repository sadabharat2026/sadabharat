require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

const EMAIL = 'admin@gmail.com';
const NEW_PASSWORD = 'Admin@12345';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
  const user = await User.findOne({ email: EMAIL, role: 'admin' });
  if (!user) {
    throw new Error(`Admin not found: ${EMAIL}`);
  }
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(NEW_PASSWORD, salt);
  await user.save();
  console.log(`Password reset for ${EMAIL}`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
