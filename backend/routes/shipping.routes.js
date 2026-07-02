const express = require('express');
const router = express.Router();
const { 
  createShipping, 
  trackShipment, 
  getAdminShippingDetails, 
  cancelShipping,
  shiprocketWebhook
} = require('../controllers/shipping.controller');

// Import authentication middlewares assuming they exist
// const { protect, admin } = require('../middlewares/authMiddleware');

// If you have auth middlewares, uncomment them and add them to the routes below.
// For now, these are open or assumed to be handled by the client properly.

// Create a new shipment (usually called internally or via a webhook, but exposed here as API)
router.post('/create', createShipping); // In production, add: protect, admin

// Track a shipment (Customer or Admin)
router.get('/track/:orderId', trackShipment); // In production, add: protect

// Get full shipping details including invoice/label (Admin only)
router.get('/admin/:orderId', getAdminShippingDetails); // In production, add: protect, admin

// Cancel a shipment (Admin only)
router.post('/cancel', cancelShipping); // In production, add: protect, admin

// Webhook for automatic status updates from Shiprocket
router.post('/webhook', shiprocketWebhook);

module.exports = router;
