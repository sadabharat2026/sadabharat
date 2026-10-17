const express = require('express');
const router = express.Router();
const { getProductOgHtml } = require('../controllers/ogController');

router.get('/product/:id', getProductOgHtml);

module.exports = router;
