const express = require('express');
const router = express.Router();
const { getPublicTestimonials } = require('../controllers/testimonialController');
const { cachePublic } = require('../utils/cache');

router.get('/', cachePublic('testimonials', 300), getPublicTestimonials);

module.exports = router;
