const Blog = require('../models/blogModel');
const { invalidateCatalog } = require('../utils/cache');

// @desc    Get all published blogs (Public)
// @route   GET /api/blogs
// @access  Public
const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'Published' }).sort('-createdAt').lean();
    res.status(200).json({ success: true, data: { blogs } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all blogs (Admin)
// @route   GET /api/blogs/admin
// @access  Private/Admin
const getAdminBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({}).sort('-createdAt');
    res.status(200).json({ success: true, data: { blogs } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single blog by ID
// @route   GET /api/blogs/:id
// @access  Public
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).lean();
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    res.status(200).json({ success: true, data: { blog } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a blog
// @route   POST /api/blogs
// @access  Private/Admin
const createBlog = async (req, res) => {
  try {
    const blog = await Blog.create(req.body);
    invalidateCatalog('blogs').catch(() => {});
    res.status(201).json({ success: true, data: { blog } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update a blog
// @route   PATCH /api/blogs/:id
// @access  Private/Admin
const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    invalidateCatalog('blogs').catch(() => {});
    res.status(200).json({ success: true, data: { blog } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a blog
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    invalidateCatalog('blogs').catch(() => {});
    res.status(200).json({ success: true, message: 'Blog removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBlogs,
  getAdminBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog
};
