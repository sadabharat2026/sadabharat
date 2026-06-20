require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const InstagramPost = require('./models/instagramPostModel');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const seedPosts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Clear existing posts
    await InstagramPost.deleteMany();
    console.log('Cleared existing Instagram posts');

    const imagesToUpload = [
      'ig_1.png',
      'ig_2.png',
      'ig_3.png',
      'ig_4.png',
      'ig_5.png',
    ];

    const frontendPublicPath = path.join(__dirname, '..', 'frontend', 'public');

    for (const imageName of imagesToUpload) {
      const imagePath = path.join(frontendPublicPath, imageName);
      
      console.log(`Uploading ${imageName} to Cloudinary...`);
      const result = await cloudinary.uploader.upload(imagePath, {
        folder: 'sadabharat',
      });

      console.log(`Uploaded! URL: ${result.secure_url}`);

      await InstagramPost.create({
        image: result.secure_url,
        link: 'https://www.instagram.com/sadabharatayurvedic?utm_source=qr',
      });
    }

    console.log('Instagram Posts seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding Instagram posts:', error);
    process.exit(1);
  }
};

seedPosts();
