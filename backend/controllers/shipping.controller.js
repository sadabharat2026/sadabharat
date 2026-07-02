const Order = require('../models/orderModel');
const shiprocketService = require('../services/shiprocket.service');

// Generate a random string for order_id required by Shiprocket (has to be unique)
const generateShiprocketOrderId = (dbOrderId) => {
  return `${dbOrderId}_${Date.now()}`;
};

/**
 * Core logic to process an order via Shiprocket
 * @param {String} orderId 
 */
const processShiprocketOrder = async (orderId) => {
  try {
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    const order = await Order.findById(orderId).populate('user');
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.shiprocketOrderId) {
      throw new Error('Shipping already created for this order');
    }

    const srOrderId = generateShiprocketOrderId(order._id);

    // 1. Prepare Order Data for Shiprocket
    const orderItems = order.orderItems.map(item => ({
      name: item.name,
      sku: item.product.toString(), // Using Product ID as SKU
      units: item.qty,
      selling_price: item.price,
      discount: 0,
      tax: 0,
      hsn: 0
    }));

    const orderData = {
      order_id: srOrderId,
      order_date: new Date(order.createdAt).toISOString().split('T')[0],
      pickup_location: "Primary", // Requires a setup pickup location name from Shiprocket dashboard
      billing_customer_name: order.user.name.split(' ')[0],
      billing_last_name: order.user.name.split(' ').slice(1).join(' ') || '',
      billing_address: order.shippingAddress.address,
      billing_city: order.shippingAddress.city,
      billing_pincode: order.shippingAddress.postalCode,
      billing_state: order.shippingAddress.state || 'Unknown',
      billing_country: order.shippingAddress.country,
      billing_email: order.user.email,
      billing_phone: order.shippingAddress.phone || order.user.mobile,
      shipping_is_billing: true,
      order_items: orderItems,
      payment_method: order.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
      sub_total: order.itemsPrice,
      length: 10,
      breadth: 10,
      height: 10,
      weight: 1 // Default to 1kg if not available
    };

    // 2. Create Order in Shiprocket
    const createOrderResponse = await shiprocketService.createOrder(orderData);
    
    const shipmentId = createOrderResponse.shipment_id;
    const orderIdInShiprocket = createOrderResponse.order_id;

    // 3. Assign AWB
    let awbCode, courierName;
    try {
      const awbResponse = await shiprocketService.assignAWB({ shipment_id: shipmentId });
      awbCode = awbResponse.response.data.awb_code;
      courierName = awbResponse.response.data.courier_name;
    } catch (e) {
      console.error("AWB generation failed, skipping to next step", e.message);
    }

    // 4. Generate Pickup
    let pickupScheduled = false;
    try {
      if (shipmentId) {
        await shiprocketService.generatePickup({ shipment_id: [shipmentId] });
        pickupScheduled = true;
      }
    } catch (e) {
      console.error("Pickup generation failed", e.message);
    }

    // 5. Generate Label
    let labelUrl;
    try {
      if (shipmentId) {
        const labelResponse = await shiprocketService.generateLabel({ shipment_id: [shipmentId] });
        labelUrl = labelResponse.label_url;
      }
    } catch (e) {
      console.error("Label generation failed", e.message);
    }

    // 6. Update MongoDB Order
    order.shiprocketOrderId = orderIdInShiprocket;
    order.shipmentId = shipmentId;
    order.awbCode = awbCode;
    order.courierName = courierName;
    order.pickupScheduled = pickupScheduled;
    order.labelUrl = labelUrl;
    order.shippingStatus = 'Order Created';

    await order.save();

    return {
      success: true,
      data: {
        shiprocketOrderId: order.shiprocketOrderId,
        shipmentId: order.shipmentId,
        awbCode: order.awbCode,
        courierName: order.courierName,
        labelUrl: order.labelUrl,
      }
    };
  } catch (error) {
    console.error("Error in processShiprocketOrder:", error.message);
    throw error;
  }
};

/**
 * @desc    Create Shiprocket Order and handle the entire flow
 * @route   POST /api/shipping/create
 * @access  Private
 */
const createShipping = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const result = await processShiprocketOrder(orderId);
    res.status(200).json({
      success: true,
      message: 'Shipping processing completed successfully',
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Track Shipment
 * @route   GET /api/shipping/track/:orderId
 * @access  Private
 */
const trackShipment = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!order.awbCode) {
      return res.status(400).json({ success: false, message: 'Tracking AWB not generated for this order yet' });
    }

    const trackingData = await shiprocketService.trackShipment(order.awbCode);
    
    // Update local status with latest tracking data optionally
    if (trackingData && trackingData.tracking_data && trackingData.tracking_data.track_status) {
       order.shippingStatus = trackingData.tracking_data.track_status === 1 ? 'Delivered' : 'In Transit';
       // We can map this to our internal order statuses
       await order.save();
    }

    res.status(200).json({
      success: true,
      data: trackingData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Admin Shipping Details (Including Label & Invoice)
 * @route   GET /api/shipping/admin/:orderId
 * @access  Private/Admin
 */
const getAdminShippingDetails = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Try to fetch Invoice if not already present
    if (!order.invoiceUrl && order.shiprocketOrderId) {
      try {
        const invoiceResponse = await shiprocketService.generateInvoice({ ids: [order.shiprocketOrderId] });
        order.invoiceUrl = invoiceResponse.invoice_url;
        await order.save();
      } catch (e) {
        console.error('Could not generate invoice', e.message);
      }
    }

    // Fetch tracking details if AWB exists
    let tracking = null;
    if (order.awbCode) {
       try {
         tracking = await shiprocketService.trackShipment(order.awbCode);
       } catch (e) {
         console.error('Could not fetch tracking', e.message);
       }
    }

    res.status(200).json({
      success: true,
      data: {
        shiprocketOrderId: order.shiprocketOrderId,
        shipmentId: order.shipmentId,
        awbCode: order.awbCode,
        courierName: order.courierName,
        labelUrl: order.labelUrl,
        invoiceUrl: order.invoiceUrl,
        shippingStatus: order.shippingStatus,
        trackingData: tracking
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel Shipment
 * @route   POST /api/shipping/cancel
 * @access  Private/Admin
 */
const cancelShipping = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!order.shiprocketOrderId) {
       return res.status(400).json({ success: false, message: 'No shipment to cancel' });
    }

    const response = await shiprocketService.cancelShipment({ ids: [order.shiprocketOrderId] });
    
    order.shippingStatus = 'Cancelled';
    order.status = 'Cancelled';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Shipment cancelled successfully',
      data: response
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Shiprocket Webhook Receiver for automatic status sync
 * @route   POST /api/shipping/webhook
 * @access  Public (Called by Shiprocket)
 */
const shiprocketWebhook = async (req, res, next) => {
  try {
    const { awb, current_status, current_status_id, order_id } = req.body;

    // Acknowledge receipt immediately
    res.status(200).send('OK');

    if (awb || order_id) {
      // Find the order by awbCode or shiprocketOrderId
      let query = {};
      if (awb) query.awbCode = awb;
      else if (order_id) query.shiprocketOrderId = order_id;

      const order = await Order.findOne(query);
      if (order) {
        order.shippingStatus = current_status || 'Updated';
        
        // Optionally map Shiprocket status IDs to your internal statuses
        // 7 = Delivered, 8 = Cancelled, etc. (check Shiprocket docs)
        if (current_status_id === 7 || current_status === 'DELIVERED') {
          order.status = 'Delivered';
          order.isDelivered = true;
          order.deliveredAt = new Date();
        } else if (current_status_id === 8 || current_status === 'CANCELLED') {
          order.status = 'Cancelled';
        }

        await order.save();
        console.log(`Order ${order._id} shipping status updated to: ${order.shippingStatus}`);
      }
    }
  } catch (error) {
    console.error('Webhook error:', error.message);
  }
};

module.exports = {
  createShipping,
  processShiprocketOrder,
  trackShipment,
  getAdminShippingDetails,
  cancelShipping,
  shiprocketWebhook
};
