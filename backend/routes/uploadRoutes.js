const express = require('express');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;

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

// Helper to upload a buffer to Cloudinary with automatic optimization & compression
const uploadToCloudinary = (fileBuffer, originalname) => {
  return new Promise((resolve, reject) => {
    const isVideoFile = /\.(mp4|mov|avi|mkv|webm)$/i.test(originalname);
    
    const uploadOptions = {
      resource_type: isVideoFile ? 'video' : 'auto',
      folder: 'sadabharat',
      // Auto compress videos / images to modern high-efficiency web format
      quality: 'auto:good',
      fetch_format: 'auto'
    };

    if (isVideoFile) {
      // Automatic video compression transformations
      uploadOptions.transformation = [
        { quality: 'auto:eco' }, // Compress bitrate efficiently for web fast loading
        { video_codec: 'auto' }
      ];
    }

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};

router.post('/', upload.array('documents', 5), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  try {
    const uploadPromises = req.files.map(file =>
      uploadToCloudinary(file.buffer, file.originalname)
    );
    
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
