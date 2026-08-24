const Product = require('../models/productModel');
const Inventory = require('../models/inventoryModel');
const { invalidateCatalog } = require('../utils/cache');
const { optimizeMediaUrls } = require('../utils/imageOptimize');

const isUsableImageUrl = (url) =>
  typeof url === 'string' && url.trim() !== '' && !url.startsWith('blob:');

const normalizeProductMedia = (body = {}) => {
  const images = [...new Set([
    ...(Array.isArray(body.images) ? body.images : []),
    body.image,
  ].filter(isUsableImageUrl))];
  return {
    images,
    image: images[0] || body.image
  };
};

// Helper to inject stock into product responses
const injectStock = async (products) => {
  const isArray = Array.isArray(products);
  const prodArray = isArray ? products : [products];
  if (prodArray.length === 0) return isArray ? [] : null;

  const productIds = prodArray.map(p => p._id);
  const inventories = await Inventory.find({ product: { $in: productIds } });
  
  const mapped = prodArray.map(p => {
    const pObj = p.toObject ? p.toObject() : { ...p };
    if (pObj._id) pObj._id = pObj._id.toString();
    if (pObj.vendor && typeof pObj.vendor === 'object') {
      pObj.vendor = {
        ...pObj.vendor,
        _id: pObj.vendor._id ? pObj.vendor._id.toString() : pObj.vendor._id
      };
    }
    if (pObj.admin && typeof pObj.admin === 'object') {
      pObj.admin = {
        ...pObj.admin,
        _id: pObj.admin._id ? pObj.admin._id.toString() : pObj.admin._id
      };
    }
    const images = (Array.isArray(pObj.images) ? pObj.images : []).filter(isUsableImageUrl);
    pObj.images = images;
    if (!isUsableImageUrl(pObj.image)) pObj.image = images[0] || '';
    const inv = inventories.find(i => i.product.toString() === pObj._id.toString());
    pObj.stock = inv ? inv.stock : 0;
    return optimizeMediaUrls(pObj);
  });
  return isArray ? mapped : mapped[0];
};

// @desc    Get all approved products (Public)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: 'approved' })
      .populate('vendor', 'storeName fullName')
      .populate('admin', 'name')
      .lean();
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
    const productData = { ...req.body, ...normalizeProductMedia(req.body) };
    
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
    invalidateCatalog('products').catch(() => {});
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
    const LOW_STOCK_ALERT = 15;
    const summary = productsWithStock.reduce((acc, product) => {
      const stock = Number(product.stock) || 0;
      const price = Number(product.price) || 0;
      acc.totalValuation += price * stock;
      if (stock === 0) acc.outOfStockCount += 1;
      else if (stock < LOW_STOCK_ALERT) acc.lowStockCount += 1;
      else acc.healthyStockCount += 1;
      return acc;
    }, { totalValuation: 0, outOfStockCount: 0, lowStockCount: 0, healthyStockCount: 0 });
    summary.totalValuation = Math.round(summary.totalValuation * 100) / 100;
    summary.valuationLabel = `₹${(summary.totalValuation / 100000).toFixed(2)}L`;
    res.status(200).json({ success: true, data: productsWithStock, summary });
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

    invalidateCatalog('products').catch(() => {});
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

    product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, ...normalizeProductMedia(req.body) },
      {
        new: true,
        runValidators: true
      }
    );

    const productWithStock = await injectStock(product);
    invalidateCatalog('products').catch(() => {});
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

    invalidateCatalog('products').catch(() => {});
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
