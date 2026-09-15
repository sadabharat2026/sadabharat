const express = require('express');
const router = express.Router();
const {
  createShipping,
  trackShipment,
  getAdminShippingDetails,
  cancelShipping,
  shiprocketWebhook,
  dtdcWebhook,
} = require('../controllers/shipping.controller');

// Create shipment (DTDC or Shiprocket based on SHIPPING_PROVIDER)
router.post('/create', createShipping);

// Track shipment
router.get('/track/:orderId', trackShipment);

// Admin shipping details (AWB, label, tracking)
router.get('/admin/:orderId', getAdminShippingDetails);

// Cancel shipment
router.post('/cancel', cancelShipping);

// Provider webhooks
router.post('/webhook', shiprocketWebhook);
router.post('/webhook/dtdc', dtdcWebhook);

module.exports = router;
