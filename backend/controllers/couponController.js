const Coupon = require('../models/couponModel');
const { invalidateCatalog } = require('../utils/cache');

const isCouponCurrentlyValid = (coupon) => {
    if (!coupon.isActive) return false;
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) return false;
    if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) return false;
    return true;
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Public/Admin/Vendor
const getCoupons = async (req, res) => {
    try {
        const query = {};
        if (req.query.active === 'true') {
            query.isActive = true;
        }

        const coupons = await Coupon.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            status: 'success',
            data: {
                coupons
            }
        });
    } catch (error) {
        res.status(500).json({ status: 'fail', message: error.message });
    }
};

// @desc    Get valid public coupons for checkout
// @route   GET /api/coupons/public
// @access  Public
const getPublicCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({ isActive: true }).sort({ createdAt: -1 });
        const validCoupons = coupons.filter(isCouponCurrentlyValid);

        res.status(200).json({
            status: 'success',
            data: {
                coupons: validCoupons
            }
        });
    } catch (error) {
        res.status(500).json({ status: 'fail', message: error.message });
    }
};

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Public
const validateCoupon = async (req, res) => {
    try {
        const code = (req.body.code || '').toString().trim().toUpperCase();
        if (!code) {
            return res.status(400).json({ status: 'fail', message: 'Please enter a coupon code' });
        }

        const coupon = await Coupon.findOne({ code });
        if (!coupon) {
            return res.status(404).json({ status: 'fail', message: 'Invalid coupon code' });
        }
        if (!coupon.isActive) {
            return res.status(400).json({ status: 'fail', message: 'This coupon is inactive' });
        }
        if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
            return res.status(400).json({ status: 'fail', message: 'This coupon has expired' });
        }
        if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ status: 'fail', message: 'This coupon has reached its usage limit' });
        }

        res.status(200).json({
            status: 'success',
            data: { coupon }
        });
    } catch (error) {
        res.status(500).json({ status: 'fail', message: error.message });
    }
};

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Admin
const createCoupon = async (req, res) => {
    try {
        const { code, discountType, discountValue, usageLimit, expiryDate } = req.body;

        const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
        if (couponExists) {
            return res.status(400).json({ status: 'fail', message: 'Coupon code already exists' });
        }

        const coupon = await Coupon.create({
            code,
            discountType,
            discountValue,
            usageLimit: usageLimit || null,
            expiryDate
        });

        invalidateCatalog('coupons').catch(() => {});
        res.status(201).json({
            status: 'success',
            data: {
                coupon
            }
        });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// @desc    Update a coupon
// @route   PATCH /api/coupons/:id
// @access  Admin
const updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!coupon) {
            return res.status(404).json({ status: 'fail', message: 'Coupon not found' });
        }

        invalidateCatalog('coupons').catch(() => {});
        res.status(200).json({
            status: 'success',
            data: {
                coupon
            }
        });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Admin
const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!coupon) {
            return res.status(404).json({ status: 'fail', message: 'Coupon not found' });
        }

        invalidateCatalog('coupons').catch(() => {});
        res.status(200).json({ status: 'success', message: 'Coupon deleted successfully' });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
};

module.exports = {
    getCoupons,
    getPublicCoupons,
    validateCoupon,
    createCoupon,
    updateCoupon,
    deleteCoupon
};
