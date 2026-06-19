const Product = require('../models/productModel');
const Inventory = require('../models/inventoryModel');

// Helper to inject stock into product responses
const injectStock = async (products) => {
  const isArray = Array.isArray(products);
  const prodArray = isArray ? products : [products];
  if (prodArray.length === 0) return isArray ? [] : null;

  const productIds = prodArray.map(p => p._id);
  const inventories = await Inventory.find({ product: { $in: productIds } });
  
  const mapped = prodArray.map(p => {
    const pObj = p.toObject ? p.toObject() : p;
    const inv = inventories.find(i => i.product.toString() === pObj._id.toString());
    pObj.stock = inv ? inv.stock : 0;
    return pObj;
  });
  return isArray ? mapped : mapped[0];
};

// @desc    Get all approved products (Public)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: 'approved' }).populate('vendor', 'storeName fullName').populate('admin', 'name');
    const productsWithStock = await injectStock(products);
    res.status(200).json({ success: true, data: { products: productsWithStock } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private (Vendor/Admin)
const createProduct = async (req, res) => {
  try {
    const productData = { ...req.body };
    
    // Check if the creator is an admin or a vendor
    if (req.user.role === 'admin') {
      productData.admin = req.user._id;
      productData.status = 'approved';
    } else {
      productData.vendor = req.user._id;
      productData.status = 'pending';
    }

    const product = await Product.create(productData);

    // Create inventory record immediately after product creation
    await Inventory.create({
      product: product._id,
      vendor: product.vendor,
      admin: product.admin,
      stock: req.body.stock || 0
    });

    const productWithStock = await injectStock(product);
    res.status(201).json({ success: true, data: productWithStock });

    // Notify Admin if created by Vendor
    if (req.user.role === 'vendor') {
      try {
        const { sendNotificationToUser } = require('../utils/pushNotificationHelper');
        await sendNotificationToUser(
          null,
          'admin',
          {
            title: 'New Product Pending Approval',
            body: `Vendor has submitted a new product "${product.name}" for review.`
          },
          'info'
        );
      } catch (err) {
        console.error('FCM Product Creation Error:', err);
      }
    }
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get vendor's own products
// @route   GET /api/products/vendor
// @access  Private (Vendor)
const getVendorProducts = async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.user._id }).sort('-createdAt');
    const productsWithStock = await injectStock(products);
    res.status(200).json({ success: true, data: productsWithStock });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all products for admin
// @route   GET /api/products/admin
// @access  Private (Admin)
const getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate('vendor', 'storeName fullName')
      .populate('admin', 'name')
      .sort('-createdAt');
    const productsWithStock = await injectStock(products);
    res.status(200).json({ success: true, data: productsWithStock });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product status
// @route   PUT /api/products/:id/status
// @access  Private (Admin)
const updateProductStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: product });

    // Notify Vendor about status change
    if (product.vendor) {
      try {
        const { sendNotificationToUser } = require('../utils/pushNotificationHelper');
        let title = 'Product Status Updated';
        let type = 'info';
        if (status === 'approved') {
          title = 'Product Approved';
          type = 'success';
        } else if (status === 'rejected') {
          title = 'Product Rejected';
          type = 'alert';
        }

        await sendNotificationToUser(
          product.vendor,
          'vendor',
          {
            title,
            body: `Your product "${product.name}" has been ${status}.`
          },
          type
        );
      } catch (err) {
        console.error('FCM Product Status Error:', err);
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Admin or Owner Vendor)
const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check ownership
    if (req.user.role === 'vendor' && product.vendor?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this product' });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    const productWithStock = await injectStock(product);
    res.status(200).json({ success: true, data: productWithStock });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Admin or Owner Vendor)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check ownership
    if (req.user.role === 'vendor' && product.vendor?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this product' });
    }

    await product.deleteOne();

    // Also delete associated inventory
    await Inventory.deleteOne({ product: req.params.id });

    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProducts,
  createProduct,
  getVendorProducts,
  getAdminProducts,
  updateProductStatus,
  updateProduct,
  deleteProduct
};
