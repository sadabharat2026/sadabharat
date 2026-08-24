const Order = require('../models/orderModel');
const Coupon = require('../models/couponModel');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { sendNotificationToUser } = require('../utils/pushNotificationHelper');
const { processShiprocketOrder } = require('./shipping.controller');
const { computeOrderQuote } = require('../utils/pricing');

const quoteItemsPayload = (items = []) => items.map((item) => ({
  product: item.product || item._id,
  quantity: item.quantity || item.qty || 1,
  size: item.size || item.selectedSize || null,
  image: item.image
}));

const savePricedOrder = async ({ userId, quote, shippingAddress, paymentMethod, paymentResult, isPaid }) => {
  const orderItems = quote.items.map((item) => ({
    product: item.product,
    name: item.name,
    qty: item.quantity,
    price: item.price,
    lineTotal: item.lineTotal,
    image: item.image || '',
    vendor: item.vendor,
    admin: item.admin,
    status: 'Processing'
  }));

  const order = await Order.create({
    user: userId,
    orderItems,
    shippingAddress,
    paymentMethod,
    paymentResult,
    itemsPrice: quote.subtotal,
    taxPrice: quote.taxAmount,
    shippingPrice: quote.shippingAmount,
    totalPrice: quote.total,
    couponCode: quote.coupon?.code || '',
    discountAmount: quote.discountAmount || 0,
    taxRate: quote.taxRate || 0,
    isPaid: Boolean(isPaid),
    paidAt: isPaid ? Date.now() : undefined
  });

  if (quote.coupon?.code) {
    await Coupon.updateOne({ code: quote.coupon.code }, { $inc: { usedCount: 1 } });
  }

  const Earning = require('../models/earningModel');
  for (const item of order.orderItems) {
    if (!item.vendor) continue;
    const commissionRate = 15;
    const itemTotal = item.lineTotal != null ? item.lineTotal : item.price * item.qty;
    const commissionAmount = (itemTotal * commissionRate) / 100;
    await Earning.create({
      vendor: item.vendor,
      order: order._id,
      orderItem: item._id,
      productName: item.name,
      totalAmount: itemTotal,
      commissionRate,
      commissionAmount,
      netEarning: itemTotal - commissionAmount,
      status: 'Pending'
    });
  }

  return order;
};

const quoteOrder = async (req, res) => {
  try {
    const quote = await computeOrderQuote({
      items: quoteItemsPayload(req.body.items),
      couponCode: req.body.couponCode,
      paymentMethod: req.body.paymentMethod
    });
    res.status(200).json({ success: true, data: quote });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items' });
    }

    const quote = await computeOrderQuote({
      items: quoteItemsPayload(items),
      couponCode,
      paymentMethod: paymentMethod || 'COD'
    });

    const createdOrder = await savePricedOrder({
      userId: req.user._id,
      quote,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      isPaid: false
    });

    // Trigger push notifications
    try {
      await sendNotificationToUser(
        createdOrder.user,
        'user',
        {
          title: 'Order Placed Successfully',
          body: `Thank you! Your order #${createdOrder._id} of ₹${createdOrder.totalPrice} has been placed and is being processed.`
        },
        'success'
      );

      const uniqueVendors = [...new Set(createdOrder.orderItems.map(item => item.vendor?.toString()).filter(Boolean))];
      for (const vendorId of uniqueVendors) {
        await sendNotificationToUser(
          vendorId,
          'vendor',
          {
            title: 'New Order Received',
            body: `You received a new order #${createdOrder._id}. Please review and prepare the items for delivery.`
          },
          'success'
        );
      }
    } catch (notifErr) {
      console.error('FCM: Error sending order creation notifications:', notifErr);
    }

    processShiprocketOrder(createdOrder._id).catch((err) => {
      console.error('Failed to process Shiprocket flow for COD order:', err.message);
    });

    res.status(201).json({
      success: true,
      data: {
        order: {
          orderId: createdOrder._id,
          ...createdOrder._doc
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create Razorpay Order
// @route   POST /api/orders/razorpay/create
// @access  Private
const createRazorpayOrder = async (req, res) => {
  try {
    const quote = await computeOrderQuote({
      items: quoteItemsPayload(req.body.items || []),
      couponCode: req.body.couponCode,
      paymentMethod: 'paynow'
    });

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.warn('Razorpay keys not found. Returning mock order id.');
      return res.status(200).json({
        success: true,
        data: {
          quote,
          order: {
            id: 'mock_order_' + Date.now(),
            amount: Math.round(quote.total * 100),
            currency: 'INR'
          }
        }
      });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await instance.orders.create({
      amount: Math.round(quote.total * 100),
      currency: 'INR',
      receipt: 'receipt_order_' + Date.now(),
    });

    if (!order) return res.status(500).send('Some error occured');

    res.status(200).json({ success: true, data: { order, quote } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Verify Razorpay Payment and Save Order
// @route   POST /api/orders/razorpay/verify
// @access  Private
const verifyRazorpayOrder = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderDetails } = req.body;

    // Verify signature only if keys exist
    if (process.env.RAZORPAY_KEY_SECRET) {
      const sign = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest("hex");

      if (razorpay_signature !== expectedSign) {
        return res.status(400).json({ success: false, message: "Invalid signature sent!" });
      }
    }

    const { items, shippingAddress, couponCode } = orderDetails || {};
    const quote = await computeOrderQuote({
      items: quoteItemsPayload(items || []),
      couponCode,
      paymentMethod: 'paynow'
    });

    const createdOrder = await savePricedOrder({
      userId: req.user._id,
      quote,
      shippingAddress,
      paymentMethod: 'Online',
      paymentResult: {
        id: razorpay_payment_id,
        status: 'completed',
        update_time: new Date().toISOString()
      },
      isPaid: true
    });

    // Trigger push notifications
    try {
      await sendNotificationToUser(
        createdOrder.user,
        'user',
        {
          title: 'Order Paid & Placed Successfully',
          body: `Thank you! Your payment of ₹${createdOrder.totalPrice} is verified and Order #${createdOrder._id} has been placed.`
        },
        'success'
      );

      const uniqueVendors = [...new Set(createdOrder.orderItems.map(item => item.vendor?.toString()).filter(Boolean))];
      for (const vendorId of uniqueVendors) {
        await sendNotificationToUser(
          vendorId,
          'vendor',
          {
            title: 'New Order Received',
            body: `You received a new paid order #${createdOrder._id}. Please review and prepare the items for delivery.`
          },
          'success'
        );
      }
    } catch (notifErr) {
      console.error('FCM: Error sending Razorpay order notifications:', notifErr);
    }

    processShiprocketOrder(createdOrder._id).catch((err) => {
      console.error('Failed to process Shiprocket flow for online order:', err.message);
    });

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: {
        order: {
          orderId: createdOrder._id,
          ...createdOrder._doc
        }
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
    res.status(200).json({ success: true, data: { orders } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      // Allow if admin or order belongs to user
      if (req.user.role === 'admin' || order.user.toString() === req.user._id.toString()) {
        return res.status(200).json({ success: true, data: order });
      } else {
        return res.status(401).json({ success: false, message: 'Not authorized to view this order' });
      }
    } else {
      res.status(404).json({ success: false, message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders containing items from the logged-in vendor
// @route   GET /api/orders/vendor
// @access  Private (Vendor)
const getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.user._id;

    // Find orders that have at least one item belonging to this vendor
    const orders = await Order.find({ 'orderItems.vendor': vendorId })
      .populate('user', 'name email')
      .sort('-createdAt')
      .lean(); // Use lean to easily modify the items array

    // Filter the items array in each order so the vendor ONLY sees their own products
    const filteredOrders = orders.map(order => {
      order.orderItems = order.orderItems
        .filter((item) => item.vendor && item.vendor.toString() === vendorId.toString())
        .map((item) => ({
          ...item,
          lineTotal: item.lineTotal != null ? item.lineTotal : item.price * item.qty
        }));
      order.vendorAmount = order.orderItems.reduce((acc, item) => acc + (item.lineTotal || 0), 0);
      return order;
    });

    res.status(200).json({ success: true, data: filteredOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders for the platform
// @route   GET /api/orders/admin
// @access  Private (Admin)
const getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .populate('orderItems.vendor', 'storeName fullName')
      .populate('orderItems.admin', 'name')
      .sort('-createdAt')
      .lean();

    const withTotals = orders.map((order) => ({
      ...order,
      orderItems: (order.orderItems || []).map((item) => ({
        ...item,
        lineTotal: item.lineTotal != null ? item.lineTotal : item.price * item.qty
      }))
    }));

    res.status(200).json({ success: true, data: withTotals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update the status of a specific item within an order
// @route   PUT /api/orders/:orderId/item/:itemId/status
// @access  Private (Admin or Vendor)
const updateOrderItemStatus = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { status, trackingNumber } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Find the specific item
    const item = order.orderItems.find(i => i._id.toString() === itemId.toString());
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in order' });
    }

    // Authorization check
    if (req.user.role === 'vendor' && (!item.vendor || item.vendor.toString() !== req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this item' });
    }

    // Update fields
    if (status) item.status = status;
    if (trackingNumber !== undefined) item.trackingNumber = trackingNumber;

    await order.save();

    // Trigger push notification to user
    try {
      await sendNotificationToUser(
        order.user,
        'user',
        {
          title: 'Order Status Update',
          body: `The status of your item "${item.name}" from Order #${order._id} has been updated to "${status}".`
        },
        'info'
      );
    } catch (notifErr) {
      console.error('FCM: Error sending order item status notification:', notifErr);
    }

    res.status(200).json({ success: true, message: 'Item status updated', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Request a return or replacement
// @route   PATCH /api/orders/:id/request-return
// @access  Private
const requestReturn = async (req, res) => {
  try {
    const { returnReason, returnAction, returnImages, refundAccountDetails } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const allDelivered = order.orderItems.length > 0 && order.orderItems.every(item => item.status === 'Delivered');
    if (!allDelivered) {
      return res.status(400).json({ success: false, message: 'Can only request return for fully delivered orders' });
    }

    order.returnStatus = returnAction === 'Replace' ? 'Replace Requested' : 'Return Requested';
    order.returnReason = returnReason;
    order.returnAction = returnAction;
    if (returnImages) order.returnImages = returnImages;
    if (refundAccountDetails) order.refundAccountDetails = refundAccountDetails;

    await order.save();

    // Trigger push notification to vendors
    try {
      const uniqueVendors = [...new Set(order.orderItems.map(item => item.vendor?.toString()).filter(Boolean))];
      for (const vendorId of uniqueVendors) {
        await sendNotificationToUser(
          vendorId,
          'vendor',
          {
            title: `${order.returnAction} Requested`,
            body: `A customer has requested a ${order.returnAction.toLowerCase()} for Order #${order._id}. Reason: ${order.returnReason}`
          },
          'warning'
        );
      }
    } catch (notifErr) {
      console.error('FCM: Error sending return request notification:', notifErr);
    }

    res.status(200).json({ success: true, message: 'Return/Replacement requested successfully', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update refund details
// @route   PATCH /api/orders/:id/update-refund-details
// @access  Private
const updateRefundDetails = async (req, res) => {
  try {
    const { refundAccountDetails } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    order.refundAccountDetails = refundAccountDetails;
    await order.save();

    res.status(200).json({ success: true, message: 'Refund details updated', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin update return/replacement status
// @route   PATCH /api/orders/:id/admin-update-return
// @access  Private (Admin)
const adminUpdateReturn = async (req, res) => {
  try {
    const { returnStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.returnStatus = returnStatus;
    await order.save();

    // Trigger push notification to user
    try {
      await sendNotificationToUser(
        order.user,
        'user',
        {
          title: 'Return Status Update',
          body: `Your return/replacement status for Order #${order._id} has been updated to "${returnStatus}".`
        },
        'info'
      );
    } catch (notifErr) {
      console.error('FCM: Error sending return status update notification:', notifErr);
    }

    res.status(200).json({ success: true, message: `Return status updated to ${returnStatus}`, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  quoteOrder,
  createOrder,
  createRazorpayOrder,
  verifyRazorpayOrder,
  getMyOrders,
  getOrderById,
  getVendorOrders,
  getAdminOrders,
  updateOrderItemStatus,
  requestReturn,
  updateRefundDetails,
  adminUpdateReturn
};
