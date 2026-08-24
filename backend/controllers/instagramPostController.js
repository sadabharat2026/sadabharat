const InstagramPost = require('../models/instagramPostModel');
const { invalidateCatalog } = require('../utils/cache');

// @desc    Get all Instagram posts
// @route   GET /api/instagram
// @access  Public
const getInstagramPosts = async (req, res, next) => {
  try {
    const posts = await InstagramPost.find({}).sort('-createdAt').lean();
    res.status(200).json({
      success: true,
      data: { posts }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add an Instagram post
// @route   POST /api/instagram
// @access  Private (Admin only)
const createInstagramPost = async (req, res, next) => {
  try {
    const { image, link } = req.body;

    if (!image) {
      res.status(400);
      throw new Error('Please provide an image URL');
    }

    const post = await InstagramPost.create({ image, link });

    invalidateCatalog('instagram').catch(() => {});
    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an Instagram post
// @route   DELETE /api/instagram/:id
// @access  Private (Admin only)
const deleteInstagramPost = async (req, res, next) => {
  try {
    const post = await InstagramPost.findById(req.params.id);

    if (!post) {
      res.status(404);
      throw new Error('Instagram post not found');
    }

    await post.deleteOne();

    invalidateCatalog('instagram').catch(() => {});
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInstagramPosts,
  createInstagramPost,
  deleteInstagramPost
};
