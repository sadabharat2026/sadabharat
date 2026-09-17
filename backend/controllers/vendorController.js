const Vendor = require('../models/vendorModel');
const EmailOtp = require('../models/emailOtpModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendNotificationToUser } = require('../utils/pushNotificationHelper');
const { sendOtpEmail } = require('../services/emailService');

const generateToken = (id) => {
  return jwt.sign({ id, role: 'vendor' }, process.env.JWT_ACCESS_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const createAndSendEmailOtp = async ({ email, purpose, name }) => {
  const otp =
    process.env.USE_DEFAULT_OTP === 'true'
      ? '989898'
      : Math.floor(100000 + Math.random() * 900000).toString();
  const expiryMinutes = Number(process.env.OTP_EXPIRY_MINUTES) || 10;
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  await EmailOtp.deleteMany({ email, purpose });
  await EmailOtp.create({ email, otp, purpose, expiresAt, verified: false });

  const mailResult = await sendOtpEmail({ to: email, otp, purpose, name });
  return { mailResult, otp, expiresAt };
};

const consumeVerifiedOtp = async ({ email, otp, purpose }) => {
  const record = await EmailOtp.findOne({ email, purpose }).sort({ createdAt: -1 });
  if (!record || record.otp !== String(otp).trim() || record.expiresAt < new Date()) {
    return { ok: false, message: 'Invalid or expired OTP' };
  }
  record.verified = true;
  await record.save();
  return { ok: true, record };
};

// @desc    Send OTP to vendor email (registration)
// @route   POST /api/vendors/send-register-otp
// @access  Public
const sendVendorRegisterOtp = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const name = String(req.body.name || '').trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400);
      throw new Error('Please provide a valid email address');
    }

    const exists = await Vendor.findOne({ email });
    if (exists) {
      res.status(400);
      throw new Error('A vendor with this email already exists. Please sign in instead.');
    }

    const { mailResult, otp } = await createAndSendEmailOtp({
      email,
      purpose: 'vendor_register',
      name,
    });

    if (!mailResult.success) {
      res.status(502);
      throw new Error(`Failed to send OTP email. Please try again. (${mailResult.message})`);
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email address',
      ...(mailResult.devOtp && { devOtp: otp, devNote: 'OTP visible when SMTP mock / default OTP is enabled' }),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify registration OTP
// @route   POST /api/vendors/verify-register-otp
// @access  Public
const verifyVendorRegisterOtp = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || '').trim();

    if (!email || !otp) {
      res.status(400);
      throw new Error('Email and OTP are required');
    }

    const result = await consumeVerifiedOtp({ email, otp, purpose: 'vendor_register' });
    if (!result.ok) {
      res.status(401);
      throw new Error(result.message);
    }

    res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Send forgot-password OTP
// @route   POST /api/vendors/forgot-password
// @access  Public
const forgotVendorPassword = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) {
      res.status(400);
      throw new Error('Please provide your registered email');
    }

    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        code: 'VENDOR_NOT_FOUND',
        message: 'No seller account found with this email. Please register first.',
      });
    }

    if (vendor.isBlocked) {
      res.status(403);
      throw new Error('Your account has been blocked by the admin.');
    }

    const { mailResult, otp } = await createAndSendEmailOtp({
      email,
      purpose: 'vendor_reset',
      name: vendor.fullName,
    });

    if (!mailResult.success) {
      res.status(502);
      throw new Error(`Failed to send OTP email. Please try again. (${mailResult.message})`);
    }

    res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to your email',
      ...(mailResult.devOtp && { devOtp: otp, devNote: 'OTP visible when SMTP mock / default OTP is enabled' }),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset vendor password with email OTP
// @route   POST /api/vendors/reset-password
// @access  Public
const resetVendorPassword = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || '').trim();
    const { password, confirmPassword } = req.body;

    if (!email || !otp || !password) {
      res.status(400);
      throw new Error('Email, OTP and new password are required');
    }
    if (String(password).length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters');
    }
    if (confirmPassword != null && password !== confirmPassword) {
      res.status(400);
      throw new Error('Passwords do not match');
    }

    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      res.status(404);
      throw new Error('Vendor not found');
    }

    const result = await consumeVerifiedOtp({ email, otp, purpose: 'vendor_reset' });
    if (!result.ok) {
      res.status(401);
      throw new Error(result.message);
    }

    const salt = await bcrypt.genSalt(10);
    vendor.password = await bcrypt.hash(password, salt);
    await vendor.save();
    await EmailOtp.deleteMany({ email, purpose: 'vendor_reset' });

    res.status(200).json({
      success: true,
      message: 'Password updated successfully. You can now sign in.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new vendor
// @route   POST /api/vendors/register
// @access  Public
const registerVendor = async (req, res, next) => {
  try {
    const { email: rawEmail, mobile, otp } = req.body;
    const email = normalizeEmail(rawEmail);

    if (!email || !mobile) {
      res.status(400);
      throw new Error('Email and mobile are required');
    }

    if (!otp) {
      res.status(400);
      throw new Error('Please verify your email with the OTP sent to your inbox');
    }

    const otpCheck = await EmailOtp.findOne({
      email,
      purpose: 'vendor_register',
      otp: String(otp).trim(),
      verified: true,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otpCheck) {
      const live = await EmailOtp.findOne({ email, purpose: 'vendor_register' }).sort({ createdAt: -1 });
      if (!live || live.otp !== String(otp).trim() || live.expiresAt < new Date()) {
        res.status(401);
        throw new Error('Invalid or expired email OTP. Please verify your email again.');
      }
      live.verified = true;
      await live.save();
    }

    const vendorExists = await Vendor.findOne({ $or: [{ email }, { mobile }] });

    if (vendorExists) {
      res.status(400);
      throw new Error('Vendor with this email or mobile already exists');
    }

    // OTP-only auth — store a random unusable password hash for schema compatibility
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(
      `otp_${email}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      salt
    );

    const { password: _ignored, confirmPassword: _ignored2, ...rest } = req.body;

    const vendorReq = await Vendor.create({
      ...rest,
      email,
      password: hashedPassword,
      isApproved: false,
    });

    await EmailOtp.deleteMany({ email, purpose: 'vendor_register' });

    if (vendorReq) {
      try {
        await sendNotificationToUser(
          null,
          'admin',
          {
            title: 'New Vendor Joining Request',
            body: `${vendorReq.fullName} (${vendorReq.email}) applied as a seller${vendorReq.storeName ? ` — store: ${vendorReq.storeName}` : ''}. Review under New Joining Requests.`,
            data: {
              relatedId: vendorReq._id.toString(),
              relatedModel: 'Vendor',
              link: '/admin/vendors/pending',
            },
          },
          'alert'
        );
      } catch (notifyErr) {
        console.error('Failed to notify admin of new vendor:', notifyErr.message);
      }

      res.status(201).json({
        success: true,
        message: 'Registration successful! Your application is pending admin approval.',
      });
    } else {
      res.status(400);
      throw new Error('Invalid vendor data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Send login OTP to vendor email
// @route   POST /api/vendors/send-login-otp
// @access  Public
const sendVendorLoginOtp = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400);
      throw new Error('Please provide a valid email address');
    }

    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        code: 'VENDOR_NOT_FOUND',
        message: 'Seller account not found. Please register first.',
      });
    }

    if (vendor.isBlocked) {
      res.status(403);
      throw new Error('Your account has been blocked by the admin.');
    }

    const { mailResult, otp } = await createAndSendEmailOtp({
      email,
      purpose: 'vendor_login',
      name: vendor.fullName,
    });

    if (!mailResult.success) {
      res.status(502);
      throw new Error(`Failed to send OTP email. Please try again. (${mailResult.message})`);
    }

    res.status(200).json({
      success: true,
      message: 'Login OTP sent to your email',
      pendingApproval: !vendor.isApproved,
      ...(mailResult.devOtp && { devOtp: otp, devNote: 'OTP visible when SMTP mock / default OTP is enabled' }),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify login OTP and sign in vendor
// @route   POST /api/vendors/verify-login-otp
// @access  Public
const verifyVendorLoginOtp = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || '').trim();

    if (!email || !otp) {
      res.status(400);
      throw new Error('Email and OTP are required');
    }

    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      res.status(404);
      throw new Error('Seller account not found. Please register first.');
    }

    if (vendor.isBlocked) {
      res.status(403);
      throw new Error('Your account has been blocked by the admin.');
    }

    const result = await consumeVerifiedOtp({ email, otp, purpose: 'vendor_login' });
    if (!result.ok) {
      res.status(401);
      throw new Error(result.message);
    }

    if (!vendor.isApproved) {
      res.status(403);
      throw new Error('Your account is not approved or is pending admin approval.');
    }

    await EmailOtp.deleteMany({ email, purpose: 'vendor_login' });

    res.status(200).json({
      success: true,
      data: {
        _id: vendor.id,
        name: vendor.fullName,
        email: vendor.email,
        role: vendor.role,
        storeName: vendor.storeName,
        token: generateToken(vendor._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check vendor registration / approval status by email
// @route   POST /api/vendors/registration-status
// @access  Public
const getVendorRegistrationStatus = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) {
      res.status(400);
      throw new Error('Email is required');
    }
    const vendor = await Vendor.findOne({ email }).select('isApproved isBlocked fullName email');
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'No application found for this email' });
    }
    res.status(200).json({
      success: true,
      data: {
        email: vendor.email,
        name: vendor.fullName,
        isApproved: vendor.isApproved,
        isBlocked: vendor.isBlocked,
        status: vendor.isBlocked ? 'blocked' : vendor.isApproved ? 'approved' : 'pending',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login vendor (legacy password — kept for admin tools; prefer OTP)
// @route   POST /api/vendors/login
// @access  Public
const loginVendor = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password, otp } = req.body;

    // Prefer OTP login if otp provided
    if (otp) {
      req.body.email = email;
      return verifyVendorLoginOtp(req, res, next);
    }

    const vendor = await Vendor.findOne({ email });

    if (!vendor) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    if (vendor.isBlocked) {
      res.status(403);
      throw new Error('Your account has been blocked by the admin.');
    }

    if (!vendor.isApproved) {
      res.status(403);
      throw new Error('Your account is not approved or is pending admin approval.');
    }

    if (!vendor.password || !(await bcrypt.compare(String(password || ''), vendor.password))) {
      res.status(401);
      throw new Error('Invalid email or password. Please sign in with email OTP.');
    }

    res.status(200).json({
      success: true,
      data: {
        _id: vendor.id,
        name: vendor.fullName,
        email: vendor.email,
        role: vendor.role,
        storeName: vendor.storeName,
        token: generateToken(vendor._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vendor profile
// @route   GET /api/vendors/profile
// @access  Private/Vendor
const getVendorProfile = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.user._id).select('-password');
    if (!vendor) {
      res.status(404);
      throw new Error('Vendor not found');
    }
    res.status(200).json({ success: true, data: { vendor } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all pending vendors requests
// @route   GET /api/vendors/pending
// @access  Private/Admin
const getPendingVendors = async (req, res, next) => {
  try {
    const requests = await Vendor.find({ isApproved: false, isBlocked: { $ne: true } }).select('-password');
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all approved vendors
// @route   GET /api/vendors/approved
// @access  Private/Admin
const getApprovedVendors = async (req, res, next) => {
  try {
    const vendors = await Vendor.find({ isApproved: true, isBlocked: { $ne: true } }).select('-password').lean();
    res.status(200).json({ success: true, data: vendors });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all blocked vendors
// @route   GET /api/vendors/blocked
// @access  Private/Admin
const getBlockedVendors = async (req, res, next) => {
  try {
    const vendors = await Vendor.find({ isBlocked: true }).select('-password').lean();
    res.status(200).json({ success: true, data: vendors });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a vendor request
// @route   PUT /api/vendors/:id/approve
// @access  Private/Admin
const approveVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      res.status(404);
      throw new Error('Vendor not found');
    }

    vendor.isApproved = true;
    await vendor.save();

    // Trigger push notification to vendor
    try {
      await sendNotificationToUser(
        vendor._id,
        'vendor',
        {
          title: 'Account Approved',
          body: 'Congratulations! Your seller profile has been approved. You can now log in, upload products, and manage your store.'
        },
        'success'
      );
    } catch (notifErr) {
      console.error('FCM: Error sending vendor approval notification:', notifErr);
    }

    res.status(200).json({
      success: true,
      message: 'Vendor approved successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Block a vendor
// @route   PUT /api/vendors/:id/block
// @access  Private/Admin
const blockVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      res.status(404);
      throw new Error('Vendor not found');
    }

    vendor.isBlocked = true;
    await vendor.save();

    try {
      await sendNotificationToUser(
        vendor._id,
        'vendor',
        {
          title: 'Account Suspended',
          body: 'Your seller account has been temporarily suspended. Please contact support.'
        },
        'alert'
      );
    } catch (notifErr) {
      console.error('FCM: Error sending vendor block notification:', notifErr);
    }

    res.status(200).json({
      success: true,
      message: 'Vendor blocked successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unblock a vendor
// @route   PUT /api/vendors/:id/unblock
// @access  Private/Admin
const unblockVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      res.status(404);
      throw new Error('Vendor not found');
    }

    vendor.isBlocked = false;
    await vendor.save();

    try {
      await sendNotificationToUser(
        vendor._id,
        'vendor',
        {
          title: 'Account Reactivated',
          body: 'Your seller account has been reactivated. You can now log in.'
        },
        'success'
      );
    } catch (notifErr) {
      console.error('FCM: Error sending vendor unblock notification:', notifErr);
    }

    res.status(200).json({
      success: true,
      message: 'Vendor unblocked successfully'
    });
  } catch (error) {
    next(error);
  }
};

const Earning = require('../models/earningModel');

// @desc    Get vendor earnings stats
// @route   GET /api/vendors/earnings
// @access  Private/Vendor
const getVendorEarnings = async (req, res, next) => {
  try {
    const vendorId = req.user._id;

    const earnings = await Earning.find({ vendor: vendorId }).populate('order');

    let totalNet = 0;
    let totalCommission = 0;
    let todayEarning = 0;
    let weeklyEarning = 0;
    let monthlyEarning = 0;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    const chartDataMap = {};

    let pendingBalance = 0;
    let clearedBalance = 0;

    earnings.forEach(e => {
      if (e.status !== 'Refunded') {
        totalNet += e.netEarning;
        totalCommission += e.commissionAmount;

        if (e.status === 'Pending') {
          pendingBalance += e.netEarning;
        } else if (e.status === 'Cleared') {
          clearedBalance += e.netEarning;
        }

        const eDate = new Date(e.createdAt);
        if (eDate >= today) todayEarning += e.netEarning;
        if (eDate >= weekAgo) weeklyEarning += e.netEarning;
        if (eDate >= monthAgo) monthlyEarning += e.netEarning;

        // Chart Data (last 7 days grouped)
        if (eDate >= weekAgo) {
          const dateStr = eDate.toISOString().split('T')[0];
          chartDataMap[dateStr] = (chartDataMap[dateStr] || 0) + e.netEarning;
        }
      }
    });

    const chartData = Object.keys(chartDataMap).sort().map(date => ({
      date,
      value: chartDataMap[date]
    }));

    // Fetch recent transactions for the details table
    const recentTransactions = earnings
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map(e => ({
        _id: e._id,
        orderId: e.order?._id ? e.order._id.toString().substring(0, 8).toUpperCase() : 'UNKNOWN',
        productName: e.productName,
        totalAmount: e.totalAmount,
        commissionRate: e.commissionRate,
        commissionAmount: e.commissionAmount,
        netEarning: e.netEarning,
        status: e.status,
        date: new Date(e.createdAt).toLocaleDateString()
      }));

    res.status(200).json({
      success: true,
      data: {
        totalNet,
        totalCommission,
        todayEarning,
        weeklyEarning,
        monthlyEarning,
        pendingBalance,
        clearedBalance,
        chartData,
        recentTransactions
      }
    });
  } catch (error) {
    next(error);
  }
};

const Review = require('../models/reviewModel');

const getVendorReviews = async (req, res, next) => {
  try {
    const Product = require('../models/productModel');
    // Find all products uploaded by this vendor
    const vendorProducts = await Product.find({ vendor: req.user._id }).select('_id');
    const productIds = vendorProducts.map(p => p._id);

    // Find reviews for those products
    const reviews = await Review.find({ product: { $in: productIds } })
      .populate('product', 'name image images')
      .populate('user', 'name phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { reviews }
    });
  } catch (error) {
    next(error);
  }
};

const Order = require('../models/orderModel');
const Product = require('../models/productModel');

const getVendorDashboardStats = async (req, res, next) => {
  try {
    const vendorId = req.user._id;

    // Get all products of this vendor
    console.time('stats-products');
    const vendorProducts = await Product.find({ vendor: vendorId }).select('_id name');
    const productIds = vendorProducts.map(p => p._id);
    console.timeEnd('stats-products');

    // 1. Total Sales & Orders from Earnings
    console.time('stats-earnings');
    const earnings = await Earning.find({ vendor: vendorId, status: { $ne: 'Refunded' } });
    console.timeEnd('stats-earnings');
    
    let totalSales = 0;
    let totalCommission = 0;
    let totalPayouts = 0;
    
    let currentMonthSales = 0;
    let lastMonthSales = 0;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const uniqueOrdersSet = new Set();
    const currentMonthOrders = new Set();
    const lastMonthOrders = new Set();

    earnings.forEach(e => {
      totalSales += e.totalAmount;
      totalCommission += e.commissionAmount;
      if (e.status === 'Cleared') {
        totalPayouts += e.netEarning;
      }
      
      const isCurrentMonth = e.createdAt >= thirtyDaysAgo;
      const isLastMonth = e.createdAt >= sixtyDaysAgo && e.createdAt < thirtyDaysAgo;
      
      if (isCurrentMonth) currentMonthSales += e.totalAmount;
      if (isLastMonth) lastMonthSales += e.totalAmount;

      if (e.order) {
        const orderIdStr = e.order.toString();
        uniqueOrdersSet.add(orderIdStr);
        if (isCurrentMonth) currentMonthOrders.add(orderIdStr);
        if (isLastMonth) lastMonthOrders.add(orderIdStr);
      }
    });

    const totalOrders = uniqueOrdersSet.size;
    
    // Trend Calculations
    const calcTrend = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Number((((current - previous) / previous) * 100).toFixed(1));
    };
    
    const salesTrend = calcTrend(currentMonthSales, lastMonthSales);
    const ordersTrend = calcTrend(currentMonthOrders.size, lastMonthOrders.size);

    // 2. Total Customers from Orders
    console.time('stats-orders');
    const orders = await Order.find({ _id: { $in: Array.from(uniqueOrdersSet) } }).select('user createdAt');
    console.timeEnd('stats-orders');
    
    const currentMonthCustomers = new Set();
    const lastMonthCustomers = new Set();
    const uniqueCustomersSet = new Set();
    
    orders.forEach(o => {
      if (o.user) {
        const userIdStr = o.user.toString();
        uniqueCustomersSet.add(userIdStr);
        if (o.createdAt >= thirtyDaysAgo) currentMonthCustomers.add(userIdStr);
        if (o.createdAt >= sixtyDaysAgo && o.createdAt < thirtyDaysAgo) lastMonthCustomers.add(userIdStr);
      }
    });
    
    const totalCustomers = uniqueCustomersSet.size;
    const customersTrend = calcTrend(currentMonthCustomers.size, lastMonthCustomers.size);

    // 3. Average Store Rating
    console.time('stats-reviews');
    const reviews = await Review.find({ product: { $in: productIds } }).select('rating');
    console.timeEnd('stats-reviews');
    let storeRating = '4.5';
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      storeRating = (sum / reviews.length).toFixed(1);
    }

    // 4. Recent Orders
    console.time('stats-recentOrders');
    const recentOrders = await Order.find({ 'orderItems.product': { $in: productIds } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name');
    console.timeEnd('stats-recentOrders');

    const formattedOrders = recentOrders.map(o => {
      const vendorItems = o.orderItems.filter(item => productIds.some(pid => pid.toString() === item.product?.toString()));
      const vendorAmount = vendorItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      
      let status = 'Pending';
      if (o.isDelivered) status = 'Delivered';
      else if (o.isPaid) status = 'Processing';

      let statusColor = 'bg-[#FFF8E1] text-[#F9A825] border border-[#FFECB3]';
      if (status === 'Delivered') statusColor = 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]';

      return {
        id: `#SB${o._id.toString().substring(18).toUpperCase()}`,
        customer: o.user?.name || 'Unknown',
        date: new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        amount: `₹${vendorAmount}`,
        status,
        color: statusColor
      };
    });

    // 5. Top Selling Products
    console.time('stats-aggregate');
    const mongoose = require('mongoose');
    const topProductsRaw = await Earning.aggregate([
      { $match: { vendor: new mongoose.Types.ObjectId(vendorId.toString()), status: { $ne: 'Refunded' } } },
      { $group: { _id: '$productName', sales: { $sum: '$totalAmount' }, units: { $sum: 1 } } },
      { $sort: { units: -1 } },
      { $limit: 5 }
    ]);
    console.timeEnd('stats-aggregate');

    const topProducts = topProductsRaw.map(tp => ({
      name: tp._id || 'Unknown Product',
      sales: `₹${tp.sales}`,
      units: `${tp.units} Units`
    }));

    res.status(200).json({
      success: true,
      data: {
        totalSales: `₹${totalSales.toLocaleString('en-IN')}`,
        salesTrend,
        totalOrders,
        ordersTrend,
        totalCustomers,
        customersTrend,
        storeRating,
        ratingTrend: 0, // Mock rating trend
        recentOrders: formattedOrders,
        topProducts,
        commission: `₹${totalCommission.toLocaleString('en-IN')}`,
        payouts: `- ₹${totalPayouts.toLocaleString('en-IN')}`,
        availableBalance: `₹${(totalSales - totalCommission - totalPayouts).toLocaleString('en-IN')}`
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateVendorProfile = async (req, res, next) => {
  try {
    const vendorId = req.user._id;
    const { storeName, fullName, email, phone, gstNumber, panNumber, fssaiLicense, aadharNumber, bankName, accountNumber, ifscCode } = req.body;

    // Check if email is already taken by another vendor
    if (email) {
      const existingVendor = await Vendor.findOne({ email, _id: { $ne: vendorId } });
      if (existingVendor) {
        return res.status(400).json({ success: false, message: 'Email is already in use by another vendor.' });
      }
    }

    const updatedVendor = await Vendor.findByIdAndUpdate(
      vendorId,
      {
        storeName,
        fullName,
        email,
        phone,
        gstNumber,
        panNumber,
        fssaiLicense,
        aadharNumber,
        bankName,
        accountNumber,
        ifscCode
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { vendor: updatedVendor }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerVendor,
  loginVendor,
  sendVendorRegisterOtp,
  verifyVendorRegisterOtp,
  sendVendorLoginOtp,
  verifyVendorLoginOtp,
  getVendorRegistrationStatus,
  forgotVendorPassword,
  resetVendorPassword,
  getPendingVendors,
  getApprovedVendors,
  getBlockedVendors,
  approveVendor,
  blockVendor,
  unblockVendor,
  getVendorEarnings,
  getVendorReviews,
  getVendorDashboardStats,
  getVendorProfile,
  updateVendorProfile
};
