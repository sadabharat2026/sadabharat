const express = require('express');
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

const router = express.Router();
const { cachePublic } = require('../utils/cache');

router.route('/')
  .post(createCategory)
  .get(cachePublic('categories', 300), getCategories);

router.route('/:id')
  .get(getCategoryById) // Get single category
  .put(updateCategory)  // Edit category
  .delete(deleteCategory); // Delete category

module.exports = router;
