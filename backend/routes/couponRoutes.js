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

router.get('/public', getPublicCoupons);
router.post('/validate', validateCoupon);

router.route('/')
    .get(getCoupons)
    .post(createCoupon);

router.route('/:id')
    .patch(updateCoupon)
    .delete(deleteCoupon);

module.exports = router;
