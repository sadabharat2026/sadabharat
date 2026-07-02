const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendSmsOtp } = require('../services/otpService');
// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_ACCESS_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

// @desc    Register a new Admin or Vendor
// @route   POST /api/users/signup
// @access  Public
const signup = async (req, res, next) => {
  try {
    const { 
      fullName, name, email, password, role, mobile,
      // Vendor specific fields from frontend
      businessName, gstNumber, businessType, businessAddress, city, state,
      accountHolderName, bankName, accountNumber, ifscCode, upiId,
      storeName, storeDescription, categories
    } = req.body;

    const actualName = fullName || name;
    const userRole = role || 'user'; // Defaults to user if not provided

    if (!actualName || !email || !password) {
      res.status(400);
      throw new Error('Please add all required fields (name, email, password)');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User with this email already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const vendorDetails = userRole === 'vendor' ? {
      businessName, gstNumber, businessType, businessAddress, city, state,
      accountHolderName, bankName, accountNumber, ifscCode, upiId,
      storeName, storeDescription, categories
    } : undefined;

    // Create user
    const user = await User.create({
      name: actualName,
      email,
      password: hashedPassword,
      role: userRole,
      mobile,
      vendorDetails
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id, user.role)
        }
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Login Admin or Vendor
// @route   POST /api/users/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    if (user.isBlocked) {
      res.status(403);
      throw new Error('Your account has been blocked by the admin.');
    }

    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      res.status(200).json({
        success: true,
        data: {
          _id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id, user.role)
        }
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Send OTP for new customer registration
// @route   POST /api/users/send-register-otp
// @access  Public
const sendRegisterOtp = async (req, res, next) => {
  try {
    const { mobile } = req.body;
    if (!mobile) {
      res.status(400);
      throw new Error('Please provide a mobile number');
    }

    let user = await User.findOne({ mobile });
    if (user && user.name !== 'New Customer') {
      res.status(400);
      throw new Error('Account already exists. Please Sign In.');
    }

    if (!user) {
      user = await User.create({
        name: 'New Customer',
        mobile,
        role: 'user',
        isActive: false // pending verification
      });
    }

    const otp = process.env.USE_DEFAULT_OTP === 'false' ? Math.floor(100000 + Math.random() * 900000).toString() : '989898';
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    user.otp = otp;
    user.otpExpiry = expiry;
    await user.save();

    console.log(`Registration OTP for ${mobile} is ${otp}`);

    // Send real SMS
    const smsResult = await sendSmsOtp(mobile, otp);
    if (!smsResult.success) {
      console.warn(`Failed to send SMS to ${mobile}: ${smsResult.message}`);
    }

    const isDev = process.env.USE_DEFAULT_OTP !== 'false';
    res.status(200).json({ 
      success: true, 
      message: 'OTP sent successfully',
      ...(isDev && { devOtp: otp, devNote: 'OTP visible in dev mode only' })
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete Registration (Verify OTP & Save Data)
// @route   POST /api/users/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, gender, email, mobile, otp } = req.body;
    
    if (!mobile || !otp || !name || !email || !gender) {
      res.status(400);
      throw new Error('Please provide all required fields including OTP');
    }

    const user = await User.findOne({ mobile });
    if (!user || user.otp !== otp || user.otpExpiry < new Date()) {
      res.status(401);
      throw new Error('Invalid or expired OTP');
    }

    // Update user details
    user.name = name;
    user.gender = gender;
    user.email = email;
    user.isActive = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        _id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send OTP for Login
// @route   POST /api/users/send-otp
// @access  Public
const sendOtp = async (req, res, next) => {
  try {
    const { mobile } = req.body;
    if (!mobile) {
      res.status(400);
      throw new Error('Please provide a mobile number');
    }

    let user = await User.findOne({ mobile });
    if (!user || user.name === 'New Customer') {
      res.status(404);
      throw new Error('User not found. Please register first.');
    }

    if (user.isBlocked) {
      res.status(403);
      throw new Error('Your account has been blocked by the admin.');
    }

    const otp = process.env.USE_DEFAULT_OTP === 'false' ? Math.floor(100000 + Math.random() * 900000).toString() : '989898';
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = expiry;
    await user.save();

    console.log(`Login OTP for ${mobile} is ${otp}`);

    // Send real SMS
    const smsResult = await sendSmsOtp(mobile, otp);
    if (!smsResult.success) {
      console.warn(`Failed to send SMS to ${mobile}: ${smsResult.message}`);
    }

    const isDev = process.env.USE_DEFAULT_OTP !== 'false';
    res.status(200).json({ 
      success: true, 
      message: 'OTP sent successfully',
      ...(isDev && { devOtp: otp, devNote: 'OTP visible in dev mode only' })
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP and Login Customer
// @route   POST /api/users/verify-otp
// @access  Public
const verifyOtp = async (req, res, next) => {
  try {
    const { mobile, otp } = req.body;
    if (!mobile || !otp) {
      res.status(400);
      throw new Error('Please provide mobile and OTP');
    }

    const user = await User.findOne({ mobile });
    if (!user || user.otp !== otp || user.otpExpiry < new Date()) {
      res.status(401);
      throw new Error('Invalid or expired OTP');
    }

    if (user.isBlocked) {
      res.status(403);
      throw new Error('Your account has been blocked by the admin.');
    }

    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        _id: user.id,
        name: user.name,
        mobile: user.mobile,
        role: user.role,
        token: generateToken(user._id, user.role)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active customers
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'user', isBlocked: { $ne: true } }).select('-password').lean();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all blocked customers
// @route   GET /api/users/blocked
// @access  Private/Admin
const getBlockedUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'user', isBlocked: true }).select('-password').lean();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Block a customer
// @route   PUT /api/users/:id/block
// @access  Private/Admin
const blockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.isBlocked = true;
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Customer blocked successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unblock a customer
// @route   PUT /api/users/:id/unblock
// @access  Private/Admin
const unblockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.isBlocked = false;
    user.isActive = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Customer unblocked successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: { user: req.user }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile (Name, Email, Mobile)
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.mobile = req.body.mobile || user.mobile;
    if (req.body.gender) user.gender = req.body.gender;

    const updatedUser = await user.save();
    res.status(200).json({ success: true, data: { user: updatedUser } });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new address
// @route   POST /api/users/addresses
// @access  Private
const addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const newAddress = {
      title: req.body.title || 'Home',
      addressLine: req.body.addressLine,
      mobile: req.body.mobile,
      isDefault: req.body.isDefault || false
    };

    if (newAddress.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({ success: true, data: { addresses: user.addresses } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an address
// @route   PUT /api/users/addresses/:id
// @access  Private
const updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const address = user.addresses.id(req.params.id);
    if (!address) {
      res.status(404);
      throw new Error('Address not found');
    }

    if (req.body.title !== undefined) address.title = req.body.title;
    if (req.body.addressLine !== undefined) address.addressLine = req.body.addressLine;
    if (req.body.mobile !== undefined) address.mobile = req.body.mobile;
    
    if (req.body.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
      address.isDefault = true;
    }

    await user.save();
    res.status(200).json({ success: true, data: { addresses: user.addresses } });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an address
// @route   DELETE /api/users/addresses/:id
// @access  Private
const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.addresses = user.addresses.filter((addr) => addr._id.toString() !== req.params.id);

    await user.save();
    res.status(200).json({ success: true, data: { addresses: user.addresses } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  sendRegisterOtp,
  register,
  sendOtp,
  verifyOtp,
  getMe,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  getUsers,
  getBlockedUsers,
  blockUser,
  unblockUser
};
