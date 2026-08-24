const Product = require('../models/productModel');
const Coupon = require('../models/couponModel');
const Settings = require('../models/settingsModel');

const roundMoney = (value) => Math.round((Number(value) || 0) * 100) / 100;

const unitPriceFromProduct = (product, size) => {
  if (size && Array.isArray(product.variants) && product.variants.length) {
    const match = product.variants.find(
      (variant) => String(variant.size || '').trim().toLowerCase() === String(size).trim().toLowerCase()
    );
    if (match && match.price != null) return Number(match.price) || 0;
  }
  return Number(product.price) || 0;
};

const isCouponValid = (coupon) => {
  if (!coupon || !coupon.isActive) return false;
  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) return false;
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) return false;
  return true;
};

const computeOrderQuote = async ({ items = [], couponCode, paymentMethod } = {}) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('No items to price');
  }

  const settings = (await Settings.findOne({}).lean()) || {};
  const taxRate = Number(settings.taxRate) || 0;
  const listedShipping = Number(settings.deliveryCharge) || 0;
  const freeDeliveryThreshold = Number(settings.freeDeliveryThreshold) || 0;
  const isCodEnabled = settings.isCodEnabled !== false;
  const codCharge = Number(settings.codCharge) || 0;

  const pricedItems = [];
  for (const row of items) {
    const productId = row.product || row._id;
    const quantity = Math.max(1, Number(row.quantity || row.qty) || 1);
    const size = row.size || row.selectedSize || null;
    const product = await Product.findById(productId).lean();
    if (!product) throw new Error('One or more products were not found');

    const price = unitPriceFromProduct(product, size);
    const image = Array.isArray(product.images) && product.images[0]
      ? product.images[0]
      : product.image || row.image || '';

    pricedItems.push({
      product: product._id,
      name: product.name,
      quantity,
      size,
      price,
      lineTotal: roundMoney(price * quantity),
      image,
      vendor: product.vendor || null,
      admin: product.admin || null
    });
  }

  const subtotal = roundMoney(pricedItems.reduce((sum, item) => sum + item.lineTotal, 0));

  let coupon = null;
  let discountAmount = 0;
  const code = (couponCode || '').toString().trim().toUpperCase();
  if (code) {
    coupon = await Coupon.findOne({ code }).lean();
    if (!coupon || !isCouponValid(coupon)) {
      throw new Error('Invalid or expired coupon code');
    }
    if (coupon.discountType === 'percentage') {
      discountAmount = roundMoney(subtotal * (Number(coupon.discountValue) || 0) / 100);
    } else {
      discountAmount = roundMoney(Number(coupon.discountValue) || 0);
    }
    discountAmount = Math.min(discountAmount, subtotal);
  }

  const taxableBase = Math.max(0, subtotal - discountAmount);
  const taxAmount = roundMoney(taxableBase * (taxRate / 100));
  const shippingAmount = freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold ? 0 : listedShipping;
  const wantsCod = String(paymentMethod || '').toLowerCase() === 'cod';
  const codFee = wantsCod && isCodEnabled ? roundMoney(codCharge) : 0;
  const total = roundMoney(Math.max(0, subtotal - discountAmount + shippingAmount + codFee));

  return {
    items: pricedItems,
    subtotal,
    discountAmount,
    taxRate,
    taxAmount,
    shippingAmount,
    listedShipping,
    codFee,
    isCodEnabled,
    total,
    coupon: coupon ? {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue
    } : null
  };
};

module.exports = { computeOrderQuote, unitPriceFromProduct, roundMoney };
