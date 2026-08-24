const express = require('express');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { toWebpUrl } = require('../utils/imageOptimize');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage for uploading directly to Cloudinary
const storage = multer.memoryStorage();

function checkFileType(file, cb) {
  // Allowed extensions: images, pdfs, videos
  const filetypes = /jpg|jpeg|png|webp|gif|pdf|mp4|mov|avi|mkv|webm/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype) || file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/');

  if (extname || mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images, PDFs, and Videos only!'));
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

const isVideoFile = (name = '', mime = '') =>
  mime.startsWith('video/') || /\.(mp4|mov|avi|mkv|webm)$/i.test(name);

const isPdfFile = (name = '', mime = '') =>
  mime === 'application/pdf' || /\.pdf$/i.test(name);

const isSvgFile = (name = '', mime = '') =>
  mime.includes('svg') || /\.svg$/i.test(name);

const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const originalname = file.originalname || '';
    const mimetype = file.mimetype || '';
    const video = isVideoFile(originalname, mimetype);
    const pdf = isPdfFile(originalname, mimetype);
    const svg = isSvgFile(originalname, mimetype);

    const uploadOptions = {
      folder: 'sadabharat',
      resource_type: video ? 'video' : pdf ? 'raw' : 'image'
    };

    if (video) {
      uploadOptions.quality = 'auto:eco';
      uploadOptions.transformation = [{ quality: 'auto:eco' }, { video_codec: 'auto' }];
    } else if (!pdf && !svg) {
      // Store as WebP at visually similar quality, cap huge camera uploads
      uploadOptions.format = 'webp';
      uploadOptions.quality = 'auto:good';
      uploadOptions.transformation = [
        { width: 2000, crop: 'limit', fetch_format: 'webp', quality: 'auto:good' }
      ];
    }

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) return reject(error);
        const url = result.secure_url || '';
        resolve(video || pdf || svg ? url : toWebpUrl(url));
      }
    );
    stream.end(file.buffer);
  });
};

router.post('/', upload.array('documents', 10), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  try {
    const uploadPromises = req.files.map((file) => uploadToCloudinary(file));
    
    const fileUrls = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      data: fileUrls,
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Cloudinary upload failed',
      error: error.message,
    });
  }
});

module.exports = router;
