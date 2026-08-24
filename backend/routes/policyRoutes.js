const express = require('express');
const router = express.Router();
const { getPolicy, getAllPolicies, updatePolicy } = require('../controllers/policyController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { cachePublic } = require('../utils/cache');

router.route('/')
  .get(cachePublic('policies', 600), getAllPolicies);

router.route('/:type')
  .get(cachePublic('policies', 600), getPolicy)
  .put(protect, authorize('admin'), updatePolicy);

module.exports = router;
