const Order = require('../models/orderModel');
const Earning = require('../models/earningModel');
const Vendor = require('../models/vendorModel');
const Review = require('../models/reviewModel');
const Testimonial = require('../models/testimonialModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const { sendNotificationToUser } = require('../utils/pushNotificationHelper');

// @desc    Get Finance Stats
// @route   GET /api/admins/finance-stats
// @access  Private/Admin
const getFinanceStats = async (req, res) => {
  try {
    // 1. Calculate stats from Orders (Completed, Refunded, Pending)
    const orders = await Order.find();
    
    let totalCompleted = 0;
    let completedCount = 0;
    let totalRefunded = 0;
    let totalPending = 0;
    let pendingCount = 0;

    orders.forEach(o => {
      if (o.paymentResult?.status === 'completed' || o.isPaid) {
        totalCompleted += o.totalPrice;
        completedCount += 1;
      } else if (o.paymentResult?.status === 'Refunded' || o.returnStatus === 'Refunded') {
        totalRefunded += o.totalPrice;
      } else {
        totalPending += o.totalPrice;
        pendingCount += 1;
      }
    });

    // 2. Calculate platform revenue and vendor payouts from Earnings
    const earnings = await Earning.find();
    let totalCommission = 0;
    let totalVendorPayout = 0;
    
    earnings.forEach(e => {
      if (e.status !== 'Refunded') {
        totalCommission += e.commissionAmount;
        totalVendorPayout += e.netEarning;
      }
    });

    const stats = [
      { _id: 'Completed', total: totalCompleted, count: completedCount },
      { _id: 'Refunded', total: totalRefunded, count: 0 },
      { _id: 'Pending', total: totalPending, count: pendingCount },
      { _id: 'PlatformCommission', total: totalCommission, count: 0 },
      { _id: 'VendorPayout', total: totalVendorPayout, count: 0 }
    ];

    // 3. Fetch Recent Orders to guarantee data is shown, then attach Earnings
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('orderItems.product');

    const recentOrderIds = recentOrders.map(o => o._id);
    const recentEarnings = await Earning.find({ order: { $in: recentOrderIds } })
      .populate('vendor', 'storeName');

    // 4. Format transactions for frontend (Mix of Earnings and Admin Orders)
    let formattedTransactions = [];

    recentOrders.forEach(order => {
      const orderEarnings = recentEarnings.filter(e => e.order.toString() === order._id.toString());
      
      if (orderEarnings.length > 0) {
        // Has vendor earnings, add each earning item
        orderEarnings.forEach(e => {
          formattedTransactions.push({
            _id: e._id,
            orderId: order._id.toString().substring(0, 8).toUpperCase(),
            vendorName: e.vendor?.storeName || 'Unknown Vendor',
            productName: e.productName,
            totalAmount: e.totalAmount,
            commissionRate: e.commissionRate || 15,
            platformShare: e.commissionAmount,
            vendorShare: e.netEarning,
            status: e.status,
            isEditable: true
          });
        });
      } else {
        // No vendor earnings, likely a legacy order or pure admin sale
        formattedTransactions.push({
          _id: order._id,
          orderId: order._id.toString().substring(0, 8).toUpperCase(),
          vendorName: 'Platform / Admin',
          productName: order.orderItems.length > 0 ? (order.orderItems.length === 1 ? order.orderItems[0].name : `${order.orderItems.length} Items`) : 'Order',
          totalAmount: order.totalPrice,
          commissionRate: 100,
          platformShare: order.totalPrice,
          vendorShare: 0,
          status: order.isPaid ? 'Completed' : 'Pending',
          isEditable: false
        });
      }
    });

    res.status(200).json({
      success: true,
      data: {
        stats,
        recentTransactions: formattedTransactions.slice(0, 15) // Limit to max 15 rows
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Commission for an Earning record
// @route   PATCH /api/admins/finance/earnings/:id/commission
// @access  Private/Admin
const updateEarningCommission = async (req, res) => {
  try {
    const { commissionRate } = req.body;
    
    if (commissionRate === undefined || commissionRate < 0 || commissionRate > 100) {
      return res.status(400).json({ success: false, message: 'Invalid commission rate' });
    }

    const earning = await Earning.findById(req.params.id);
    if (!earning) {
      return res.status(404).json({ success: false, message: 'Earning record not found' });
    }

    earning.commissionRate = commissionRate;
    earning.commissionAmount = (earning.totalAmount * commissionRate) / 100;
    earning.netEarning = earning.totalAmount - earning.commissionAmount;

    await earning.save();

    res.status(200).json({ success: true, data: earning, message: 'Commission updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Admin Payouts List
// @route   GET /api/admins/payouts
// @access  Private/Admin
const getAdminPayouts = async (req, res) => {
  try {
    const payouts = await Earning.aggregate([
      {
        $group: {
          _id: "$vendor",
          totalPending: {
            $sum: {
              $cond: [{ $eq: ["$status", "Pending"] }, "$netEarning", 0]
            }
          },
          totalCleared: {
            $sum: {
              $cond: [{ $eq: ["$status", "Cleared"] }, "$netEarning", 0]
            }
          },
          lastTransactionDate: { $max: "$createdAt" }
        }
      },
      {
        $lookup: {
          from: "vendors",
          localField: "_id",
          foreignField: "_id",
          as: "vendorDetails"
        }
      },
      {
        $unwind: "$vendorDetails"
      },
      {
        $project: {
          vendorId: "$_id",
          storeName: "$vendorDetails.storeName",
          vendorName: "$vendorDetails.fullName",
          bankDetails: {
            accountHolderName: "$vendorDetails.accountHolderName",
            bankName: "$vendorDetails.bankName",
            accountNumber: "$vendorDetails.accountNumber",
            ifscCode: "$vendorDetails.ifscCode",
            upiId: "$vendorDetails.upiId"
          },
          totalPending: 1,
          totalCleared: 1,
          lastTransactionDate: 1
        }
      },
      {
        $sort: { totalPending: -1 }
      }
    ]);

    // Only return vendors that have actual earnings/dues
    const filteredPayouts = payouts.filter(p => p.totalPending > 0 || p.totalCleared > 0);

    res.status(200).json({ success: true, data: filteredPayouts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear Vendor Payouts
// @route   POST /api/admins/payouts/:vendorId/clear
// @access  Private/Admin
const clearVendorPayout = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const result = await Earning.updateMany(
      { vendor: vendorId, status: 'Pending' },
      { $set: { status: 'Cleared' } }
    );

    // Trigger push notification to vendor
    try {
      await sendNotificationToUser(
        vendorId,
        'vendor',
        {
          title: 'Payout Cleared & Disbursed',
          body: `Good news! Your pending payouts have been successfully cleared and disbursed by the admin.`
        },
        'success'
      );
    } catch (notifErr) {
      console.error('FCM: Error sending payout clearance notification:', notifErr);
    }

    res.status(200).json({
      success: true,
      message: `Cleared ${result.modifiedCount} pending transactions successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Reviews Management ---
const getAdminReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('product', 'name image images')
      .populate('user', 'name phone mobile')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: { reviews } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const toggleReviewApproval = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    review.isApproved = !review.isApproved;
    await review.save();
    res.status(200).json({ success: true, message: 'Review status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const replyReview = async (req, res) => {
  try {
    const reply = String(req.body.reply ?? req.body.adminReply ?? '').trim();
    if (!reply) {
      return res.status(400).json({ success: false, message: 'Reply text is required' });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.adminReply = reply;
    review.adminReplyAt = new Date();
    if (req.user?._id) review.adminReplyBy = req.user._id;
    await review.save();

    if (review.user) {
      sendNotificationToUser(
        review.user,
        'user',
        {
          title: 'Reply to your feedback',
          body: reply.length > 140 ? `${reply.slice(0, 140)}…` : reply,
          data: { relatedId: review._id, relatedModel: 'Review' }
        },
        'info'
      ).catch(() => {});
    }

    const populated = await Review.findById(review._id)
      .populate('product', 'name image images')
      .populate('user', 'name phone mobile');

    res.status(200).json({ success: true, message: 'Reply saved', data: { review: populated } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Testimonials Management ---
const getAdminTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: { testimonials } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const toggleTestimonialApproval = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    testimonial.isApproved = !testimonial.isApproved;
    await testimonial.save();
    res.status(200).json({ success: true, message: 'Testimonial status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.create(req.body);
    res.status(201).json({ success: true, data: { testimonial } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!testimonial) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    res.status(200).json({ success: true, data: { testimonial } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteTestimonial = async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Testimonial deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Dashboard Stats
// @route   GET /api/admins/dashboard-stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ isPaid: false });
    const totalProducts = await Product.countDocuments();

    const paidOrders = await Order.find({ isPaid: true });
    let totalRevenue = 0;
    paidOrders.forEach(o => {
      totalRevenue += o.totalPrice;
    });

    res.status(200).json({
      success: true,
      status: 'success',
      data: {
        totalUsers,
        totalOrders,
        pendingOrders,
        totalProducts,
        totalRevenue: `₹${totalRevenue}`
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user / repeat-customer analytics
// @route   GET /api/admins/analytics
// @access  Private/Admin
const getUserAnalytics = async (req, res) => {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 30, 7), 365);
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - (days - 1));

    const customerFilter = { role: { $nin: ['admin', 'vendor'] } };
    const toDateKey = (value) => {
      const d = new Date(value);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const [
      totalUsers,
      newSignupsInRange,
      totalOrdersAll,
      pendingOrders,
      totalProducts,
      customerOrderStats,
      topRepeatCustomers,
      signupTrendRaw,
      ordersInRange,
      recentUsers
    ] = await Promise.all([
      User.countDocuments(customerFilter),
      User.countDocuments({ ...customerFilter, createdAt: { $gte: since } }),
      Order.countDocuments(),
      Order.countDocuments({ isPaid: false }),
      Product.countDocuments(),
      Order.aggregate([
        { $match: { user: { $ne: null } } },
        {
          $group: {
            _id: '$user',
            orderCount: { $sum: 1 },
            totalSpent: { $sum: '$totalPrice' },
            firstOrderAt: { $min: '$createdAt' },
            lastOrderAt: { $max: '$createdAt' }
          }
        }
      ]),
      Order.aggregate([
        { $match: { user: { $ne: null } } },
        {
          $group: {
            _id: '$user',
            orderCount: { $sum: 1 },
            totalSpent: { $sum: '$totalPrice' },
            lastOrderAt: { $max: '$createdAt' }
          }
        },
        { $match: { orderCount: { $gte: 2 } } },
        { $sort: { orderCount: -1, totalSpent: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            orderCount: 1,
            totalSpent: 1,
            lastOrderAt: 1,
            name: { $ifNull: ['$user.name', 'Unknown'] },
            mobile: { $ifNull: ['$user.mobile', ''] },
            email: { $ifNull: ['$user.email', ''] },
            createdAt: '$user.createdAt'
          }
        }
      ]),
      User.aggregate([
        { $match: { ...customerFilter, createdAt: { $gte: since } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt',
                timezone: 'Asia/Kolkata'
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Order.find({ user: { $ne: null }, createdAt: { $gte: since } })
        .select('user createdAt totalPrice isPaid')
        .sort({ createdAt: 1 })
        .lean(),
      User.find(customerFilter)
        .select('name email mobile createdAt isBlocked isActive')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
    ]);

    let oneTimeCustomers = 0;
    let repeatCustomers = 0;
    let totalOrdersFromCustomers = 0;
    let totalRevenueFromCustomers = 0;
    const frequencyBuckets = {
      '1 order': 0,
      '2 orders': 0,
      '3-5 orders': 0,
      '6+ orders': 0
    };

    const firstOrderByUser = {};
    customerOrderStats.forEach((c) => {
      totalOrdersFromCustomers += c.orderCount;
      totalRevenueFromCustomers += c.totalSpent || 0;
      firstOrderByUser[c._id.toString()] = c.firstOrderAt;

      if (c.orderCount === 1) {
        oneTimeCustomers += 1;
        frequencyBuckets['1 order'] += 1;
      } else {
        repeatCustomers += 1;
        if (c.orderCount === 2) frequencyBuckets['2 orders'] += 1;
        else if (c.orderCount <= 5) frequencyBuckets['3-5 orders'] += 1;
        else frequencyBuckets['6+ orders'] += 1;
      }
    });

    const customersWithOrders = oneTimeCustomers + repeatCustomers;
    const usersNeverOrdered = Math.max(totalUsers - customersWithOrders, 0);
    const repeatRate = customersWithOrders
      ? Math.round((repeatCustomers / customersWithOrders) * 1000) / 10
      : 0;
    const avgOrdersPerCustomer = customersWithOrders
      ? Math.round((totalOrdersFromCustomers / customersWithOrders) * 10) / 10
      : 0;

    const dayKeys = [];
    for (let i = 0; i < days; i += 1) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      dayKeys.push(toDateKey(d));
    }

    const signupMap = Object.fromEntries(signupTrendRaw.map((r) => [r._id, r.count]));
    const signupTrend = dayKeys.map((date) => ({
      date,
      label: date.slice(5).replace('-', '/'),
      signups: signupMap[date] || 0
    }));

    const newVsRepeatMap = {};
    dayKeys.forEach((date) => {
      newVsRepeatMap[date] = { newOrders: 0, repeatOrders: 0 };
    });

    const seenUsers = new Set();
    Object.entries(firstOrderByUser).forEach(([userId, firstAt]) => {
      if (new Date(firstAt) < since) seenUsers.add(userId);
    });

    ordersInRange.forEach((order) => {
      const date = toDateKey(order.createdAt);
      if (!newVsRepeatMap[date]) return;
      const userId = order.user.toString();
      if (seenUsers.has(userId)) {
        newVsRepeatMap[date].repeatOrders += 1;
      } else {
        newVsRepeatMap[date].newOrders += 1;
        seenUsers.add(userId);
      }
    });

    const repeatTrend = dayKeys.map((date) => ({
      date,
      label: date.slice(5).replace('-', '/'),
      newOrders: newVsRepeatMap[date].newOrders,
      repeatOrders: newVsRepeatMap[date].repeatOrders,
      totalOrders: newVsRepeatMap[date].newOrders + newVsRepeatMap[date].repeatOrders
    }));

    const frequencyDistribution = Object.entries(frequencyBuckets).map(([name, value]) => ({
      name,
      value
    }));

    res.status(200).json({
      success: true,
      status: 'success',
      data: {
        rangeDays: days,
        summary: {
          totalUsers,
          newSignupsInRange,
          customersWithOrders,
          oneTimeCustomers,
          repeatCustomers,
          usersNeverOrdered,
          repeatRate,
          avgOrdersPerCustomer,
          totalOrders: totalOrdersAll,
          totalOrdersFromCustomers,
          pendingOrders,
          totalProducts,
          totalRevenue: Math.round(totalRevenueFromCustomers)
        },
        frequencyDistribution,
        signupTrend,
        repeatTrend,
        topRepeatCustomers,
        recentUsers
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getFinanceStats,
  updateEarningCommission,
  getAdminPayouts,
  clearVendorPayout,
  getAdminReviews,
  toggleReviewApproval,
  deleteReview,
  replyReview,
  getAdminTestimonials,
  toggleTestimonialApproval,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getDashboardStats,
  getUserAnalytics
};
