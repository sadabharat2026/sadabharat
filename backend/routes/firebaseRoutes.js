const express = require('express');
const router = express.Router();
const { getCustomToken } = require('../controllers/firebaseController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/custom-token', protect, getCustomToken);

module.exports = router;
