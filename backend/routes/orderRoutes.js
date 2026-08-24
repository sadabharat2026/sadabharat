const express = require('express');
const router = express.Router();
const { getVendorOrders, getAdminOrders, updateOrderItemStatus, createOrder, getMyOrders, createRazorpayOrder, verifyRazorpayOrder, getOrderById, requestReturn, updateRefundDetails, adminUpdateReturn, quoteOrder } = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/quote', quoteOrder);
router.post('/', protect, createOrder);
router.post('/razorpay/create', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayOrder);
router.get('/my-orders', protect, getMyOrders);

router.get('/vendor', protect, getVendorOrders);
router.get('/admin', protect, authorize('admin'), getAdminOrders);
router.put('/:orderId/item/:itemId/status', protect, updateOrderItemStatus);

router.patch('/:id/request-return', protect, requestReturn);
router.patch('/:id/update-refund-details', protect, updateRefundDetails);
router.patch('/:id/admin-update-return', protect, authorize('admin'), adminUpdateReturn);

// Put /:id at the end to avoid matching /my-orders, /vendor, etc.
router.get('/:id', protect, getOrderById);

module.exports = router;
