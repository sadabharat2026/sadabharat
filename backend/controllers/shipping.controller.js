const fs = require('fs');
const path = require('path');
const Order = require('../models/orderModel');
const shiprocketService = require('../services/shiprocket.service');
const dtdcService = require('../services/dtdc.service');

const shippingProvider = () =>
  String(process.env.SHIPPING_PROVIDER || 'SHIPROCKET').trim().toUpperCase();

const generateShiprocketOrderId = (dbOrderId) => `${dbOrderId}_${Date.now()}`;

const ensureLabelDir = () => {
  const dir = path.join(__dirname, '../uploads/labels');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
};

const saveDtdcLabelPdf = async (awbCode, pdfBuffer) => {
  if (!pdfBuffer || !pdfBuffer.byteLength) return '';
  try {
    const dir = ensureLabelDir();
    const fileName = `dtdc-${awbCode}-${Date.now()}.pdf`;
    const filePath = path.join(dir, fileName);
    fs.writeFileSync(filePath, Buffer.from(pdfBuffer));
    return `/uploads/labels/${fileName}`;
  } catch (err) {
    console.error('Could not save DTDC label PDF:', err.message);
    return '';
  }
};

/**
 * Core Shiprocket flow
 */
const processShiprocketOrder = async (orderId) => {
  if (!orderId) throw new Error('Order ID is required');

  const order = await Order.findById(orderId).populate('user');
  if (!order) throw new Error('Order not found');
  if (order.shiprocketOrderId || order.dtdcReferenceNumber) {
    throw new Error('Shipping already created for this order');
  }

  const srOrderId = generateShiprocketOrderId(order._id);
  const orderItems = order.orderItems.map((item) => ({
    name: item.name,
    sku: item.product.toString(),
    units: item.qty,
    selling_price: item.price,
    discount: 0,
    tax: 0,
    hsn: 0,
  }));

  const orderData = {
    order_id: srOrderId,
    order_date: new Date(order.createdAt).toISOString().split('T')[0],
    pickup_location: 'Primary',
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
    weight: 1,
  };

  const createOrderResponse = await shiprocketService.createOrder(orderData);
  const shipmentId = createOrderResponse.shipment_id;
  const orderIdInShiprocket = createOrderResponse.order_id;

  let awbCode;
  let courierName;
  try {
    const awbResponse = await shiprocketService.assignAWB({ shipment_id: shipmentId });
    awbCode = awbResponse.response.data.awb_code;
    courierName = awbResponse.response.data.courier_name;
  } catch (e) {
    console.error('AWB generation failed, skipping to next step', e.message);
  }

  let pickupScheduled = false;
  try {
    if (shipmentId) {
      await shiprocketService.generatePickup({ shipment_id: [shipmentId] });
      pickupScheduled = true;
    }
  } catch (e) {
    console.error('Pickup generation failed', e.message);
  }

  let labelUrl;
  try {
    if (shipmentId) {
      const labelResponse = await shiprocketService.generateLabel({ shipment_id: [shipmentId] });
      labelUrl = labelResponse.label_url;
    }
  } catch (e) {
    console.error('Label generation failed', e.message);
  }

  order.shiprocketOrderId = orderIdInShiprocket;
  order.shipmentId = shipmentId;
  order.awbCode = awbCode;
  order.courierName = courierName || 'Shiprocket';
  order.pickupScheduled = pickupScheduled;
  order.labelUrl = labelUrl;
  order.shippingStatus = 'Order Created';
  order.trackingUrl = process.env.SHIPROCKET_TRACKING_URL || 'https://shiprocket.co/tracking/';
  await order.save();

  return {
    success: true,
    provider: 'SHIPROCKET',
    data: {
      shiprocketOrderId: order.shiprocketOrderId,
      shipmentId: order.shipmentId,
      awbCode: order.awbCode,
      courierName: order.courierName,
      labelUrl: order.labelUrl,
    },
  };
};

/**
 * Core DTDC flow
 */
const processDtdcOrder = async (orderId) => {
  if (!orderId) throw new Error('Order ID is required');
  if (!dtdcService.isDtdcConfigured()) {
    throw new Error('DTDC credentials missing. Set DTDC_API_KEY and DTDC_CUSTOMER_CODE in .env');
  }

  const order = await Order.findById(orderId).populate('user');
  if (!order) throw new Error('Order not found');
  if (order.dtdcReferenceNumber || order.awbCode) {
    throw new Error('Shipping already created for this order');
  }

  const consignment = dtdcService.buildConsignmentFromOrder(order);
  const { awb, raw } = await dtdcService.createShipment(consignment);

  let labelUrl = '';
  try {
    const pdfBuffer = await dtdcService.getLabel(awb);
    labelUrl = await saveDtdcLabelPdf(awb, pdfBuffer);
  } catch (e) {
    console.error('DTDC label download failed:', e.message);
  }

  order.dtdcReferenceNumber = awb;
  order.awbCode = awb;
  order.courierName = 'DTDC';
  order.shipmentId = awb;
  order.pickupScheduled = true;
  order.labelUrl = labelUrl;
  order.shippingStatus = 'Order Created';
  order.trackingUrl =
    process.env.DTDC_TRACKING_PAGE_URL ||
    `https://www.dtdc.in/tracking.asp?strCnno=${encodeURIComponent(awb)}`;
  await order.save();

  return {
    success: true,
    provider: 'DTDC',
    data: {
      dtdcReferenceNumber: order.dtdcReferenceNumber,
      awbCode: order.awbCode,
      courierName: order.courierName,
      labelUrl: order.labelUrl,
      trackingUrl: order.trackingUrl,
      raw,
    },
  };
};

/**
 * Provider switch: SHIPPING_PROVIDER=DTDC | SHIPROCKET
 */
const processShippingOrder = async (orderId) => {
  const provider = shippingProvider();
  if (provider === 'DTDC') return processDtdcOrder(orderId);
  return processShiprocketOrder(orderId);
};

const createShipping = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const result = await processShippingOrder(orderId);
    res.status(200).json({
      success: true,
      message: `Shipping processed via ${result.provider}`,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

const trackShipment = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (!order.awbCode) {
      return res.status(400).json({
        success: false,
        message: 'Tracking AWB not generated for this order yet',
      });
    }

    let trackingData;
    if (order.dtdcReferenceNumber || shippingProvider() === 'DTDC') {
      trackingData = await dtdcService.trackShipment(order.awbCode);
      const statusText = JSON.stringify(trackingData || {}).toUpperCase();
      if (statusText.includes('DELIVERED')) {
        order.shippingStatus = 'Delivered';
        order.isDelivered = true;
        order.deliveredAt = new Date();
      } else if (statusText.includes('TRANSIT') || statusText.includes('OUT FOR')) {
        order.shippingStatus = 'In Transit';
      }
      await order.save();
    } else {
      trackingData = await shiprocketService.trackShipment(order.awbCode);
      if (trackingData?.tracking_data?.track_status) {
        order.shippingStatus =
          trackingData.tracking_data.track_status === 1 ? 'Delivered' : 'In Transit';
        await order.save();
      }
    }

    res.status(200).json({ success: true, data: trackingData });
  } catch (error) {
    next(error);
  }
};

const getAdminShippingDetails = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (!order.invoiceUrl && order.shiprocketOrderId) {
      try {
        const invoiceResponse = await shiprocketService.generateInvoice({
          ids: [order.shiprocketOrderId],
        });
        order.invoiceUrl = invoiceResponse.invoice_url;
        await order.save();
      } catch (e) {
        console.error('Could not generate invoice', e.message);
      }
    }

    let tracking = null;
    if (order.awbCode) {
      try {
        tracking =
          order.dtdcReferenceNumber || shippingProvider() === 'DTDC'
            ? await dtdcService.trackShipment(order.awbCode)
            : await shiprocketService.trackShipment(order.awbCode);
      } catch (e) {
        console.error('Could not fetch tracking', e.message);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        provider: order.dtdcReferenceNumber ? 'DTDC' : order.shiprocketOrderId ? 'SHIPROCKET' : shippingProvider(),
        shiprocketOrderId: order.shiprocketOrderId,
        dtdcReferenceNumber: order.dtdcReferenceNumber,
        shipmentId: order.shipmentId,
        awbCode: order.awbCode,
        courierName: order.courierName,
        labelUrl: order.labelUrl,
        invoiceUrl: order.invoiceUrl,
        trackingUrl: order.trackingUrl,
        shippingStatus: order.shippingStatus,
        trackingData: tracking,
      },
    });
  } catch (error) {
    next(error);
  }
};

const cancelShipping = async (req, res, next) => {
  try {
    const { orderId, reason } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    let response = null;
    if (order.dtdcReferenceNumber || (shippingProvider() === 'DTDC' && order.awbCode)) {
      response = await dtdcService.cancelShipment(
        order.dtdcReferenceNumber || order.awbCode,
        reason || 'Cancelled by seller'
      );
    } else if (order.shiprocketOrderId) {
      response = await shiprocketService.cancelShipment({ ids: [order.shiprocketOrderId] });
    } else {
      return res.status(400).json({ success: false, message: 'No shipment to cancel' });
    }

    order.shippingStatus = 'Cancelled';
    order.status = 'Cancelled';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Shipment cancelled successfully',
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

/** Shiprocket webhook */
const shiprocketWebhook = async (req, res) => {
  try {
    const { awb, current_status, current_status_id, order_id } = req.body;
    res.status(200).send('OK');

    if (awb || order_id) {
      const query = {};
      if (awb) query.awbCode = awb;
      else if (order_id) query.shiprocketOrderId = order_id;

      const order = await Order.findOne(query);
      if (order) {
        order.shippingStatus = current_status || 'Updated';
        if (current_status_id === 7 || current_status === 'DELIVERED') {
          order.status = 'Delivered';
          order.isDelivered = true;
          order.deliveredAt = new Date();
        } else if (current_status_id === 8 || current_status === 'CANCELLED') {
          order.status = 'Cancelled';
        }
        await order.save();
      }
    }
  } catch (error) {
    console.error('Shiprocket webhook error:', error.message);
  }
};

/** Optional DTDC status webhook */
const dtdcWebhook = async (req, res) => {
  try {
    res.status(200).send('OK');
    const body = req.body || {};
    const awb =
      body.reference_number ||
      body.strcnno ||
      body.awb ||
      body.AWBNumber ||
      body.consignment_number;
    const status = body.status || body.current_status || body.Status || body.strStatus;

    if (!awb) return;
    const order = await Order.findOne({
      $or: [{ awbCode: awb }, { dtdcReferenceNumber: awb }],
    });
    if (!order) return;

    order.shippingStatus = status || 'Updated';
    const upper = String(status || '').toUpperCase();
    if (upper.includes('DELIVER')) {
      order.status = 'Delivered';
      order.isDelivered = true;
      order.deliveredAt = new Date();
    } else if (upper.includes('CANCEL')) {
      order.status = 'Cancelled';
    }
    await order.save();
  } catch (error) {
    console.error('DTDC webhook error:', error.message);
  }
};

module.exports = {
  createShipping,
  processShippingOrder,
  processShiprocketOrder,
  processDtdcOrder,
  trackShipment,
  getAdminShippingDetails,
  cancelShipping,
  shiprocketWebhook,
  dtdcWebhook,
};
