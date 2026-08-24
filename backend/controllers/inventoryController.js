const Inventory = require('../models/inventoryModel');
const Product = require('../models/productModel');
const { invalidateCatalog } = require('../utils/cache');

// @desc    Update stock for a specific product
// @route   PUT /api/inventory/:productId
// @access  Private (Vendor/Admin)
const updateStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { stock } = req.body;

    if (stock === undefined) {
      return res.status(400).json({ success: false, message: 'Stock value is required' });
    }

    // Check if inventory exists
    let inventory = await Inventory.findOne({ product: productId });
    
    if (!inventory) {
      // Create if missing
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      inventory = await Inventory.create({
        product: product._id,
        vendor: product.vendor,
        admin: product.admin,
        stock: Number(stock)
      });
    } else {
      // Update
      inventory.stock = Number(stock);
      await inventory.save();
    }

    invalidateCatalog('products').catch(() => {});
    res.status(200).json({ success: true, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  updateStock
};
