const express = require('express');
const router = express.Router();
const {
    getCoupons,
    getPublicCoupons,
    validateCoupon,
    createCoupon,
    updateCoupon,
    deleteCoupon
} = require('../controllers/couponController');
const { cachePublic } = require('../utils/cache');

router.get('/public', cachePublic('coupons', 60), getPublicCoupons);
router.post('/validate', validateCoupon);

router.route('/')
    .get(getCoupons)
    .post(createCoupon);

router.route('/:id')
    .patch(updateCoupon)
    .delete(deleteCoupon);

module.exports = router;
