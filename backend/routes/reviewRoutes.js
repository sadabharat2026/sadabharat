const express = require('express');
const router = express.Router();
const { getProductReviews } = require('../controllers/reviewController');

router.get('/product/:productId', getProductReviews);

module.exports = router;
