const { dtdcApi, dtdcTrackApi } = require('../config/dtdc');

const trim = (value) => (value == null ? '' : String(value).trim());

const isDtdcConfigured = () =>
  Boolean(trim(process.env.DTDC_API_KEY) && trim(process.env.DTDC_CUSTOMER_CODE));

const requireConfig = () => {
  if (!isDtdcConfigured()) {
    throw new Error(
      'DTDC is not configured. Set DTDC_API_KEY and DTDC_CUSTOMER_CODE in backend/.env'
    );
  }
};

const axiosMessage = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return error.message || fallback;
  if (typeof data === 'string') return data;
  return data.message || data.status || data.error || fallback;
};

const pickAwb = (payload) => {
  if (!payload) return '';
  if (typeof payload === 'string') return payload;
  const rows = []
    .concat(payload.data || [])
    .concat(payload.consignments || [])
    .concat(payload.data?.consignments || []);
  const first = rows.find((row) => row && typeof row === 'object') || payload.data || payload;
  return String(
    first?.reference_number ||
      first?.referenceNumber ||
      first?.consignment_number ||
      first?.consignmentNumber ||
      first?.awb_number ||
      first?.awbNumber ||
      first?.awb ||
      payload.reference_number ||
      payload.consignment_number ||
      ''
  ).trim();
};

/**
 * Build DTDC softdata consignment from Sadabharat order document.
 */
const buildConsignmentFromOrder = (order) => {
  const user = order.user || {};
  const address = order.shippingAddress || {};
  const fullName = String(user.name || user.fullName || 'Customer').trim();
  const phone = String(address.phone || user.mobile || '').replace(/\D/g, '').slice(-10);
  const pincode = String(address.postalCode || '').replace(/\D/g, '');
  const isCod = String(order.paymentMethod || '').toUpperCase() === 'COD';
  const commodity = (order.orderItems || [])
    .map((item) => item.name)
    .filter(Boolean)
    .slice(0, 3)
    .join(', ') || 'Ayurvedic Products';

  const weightKg = Number(process.env.DTDC_DEFAULT_WEIGHT_KG || 0.5);
  const pieces = Math.max(
    1,
    (order.orderItems || []).reduce((sum, item) => sum + (Number(item.qty) || 1), 0)
  );

  return {
    customer_code: trim(process.env.DTDC_CUSTOMER_CODE),
    reference_number: '',
    service_type_id: trim(process.env.DTDC_SERVICE_TYPE) || 'B2C PRIORITY',
    load_type: 'NON-DOCUMENT',
    description: commodity.slice(0, 100),
    num_pieces: String(pieces),
    weight: String(weightKg),
    weight_unit: 'kg',
    dimension_unit: 'cm',
    length: String(process.env.DTDC_DEFAULT_LENGTH || 20),
    width: String(process.env.DTDC_DEFAULT_WIDTH || 15),
    height: String(process.env.DTDC_DEFAULT_HEIGHT || 10),
    declared_value: String(order.totalPrice || order.itemsPrice || 0),
    cod_amount: isCod ? String(order.totalPrice || 0) : '0',
    cod_collection_mode: isCod ? 'CASH' : '',
    commodity_id: trim(process.env.DTDC_COMMODITY_ID) || '99',
    consignment_type: 'Forward',

    origin_details: {
      name: trim(process.env.DTDC_ORIGIN_NAME) || 'Sada Bharat Ayurvedic',
      phone: trim(process.env.DTDC_ORIGIN_PHONE) || '',
      alternate_phone: '',
      address_line_1: trim(process.env.DTDC_ORIGIN_ADDRESS) || '',
      address_line_2: '',
      pincode: trim(process.env.DTDC_ORIGIN_PINCODE) || '',
      city: trim(process.env.DTDC_ORIGIN_CITY) || '',
      state: trim(process.env.DTDC_ORIGIN_STATE) || '',
    },

    destination_details: {
      name: fullName,
      phone,
      alternate_phone: '',
      address_line_1: String(address.address || '').slice(0, 200),
      address_line_2: '',
      pincode,
      city: String(address.city || ''),
      state: String(address.state || ''),
    },

    customer_reference_number: String(order._id),
    invoice_number: String(order._id).slice(-8).toUpperCase(),
    invoice_date: new Date(order.createdAt || Date.now()).toISOString().slice(0, 10),
  };
};

class DtdcService {
  buildConsignmentFromOrder(order) {
    return buildConsignmentFromOrder(order);
  }

  async createShipment(consignment) {
    requireConfig();
    const paths = [
      '/rest/api/crd/softdata',
      '/api/customer/integration/consignment/softdata',
    ];
    let lastError;
    for (const path of paths) {
      try {
        const response = await dtdcApi.post(path, { consignments: [consignment] });
        const data = response.data || {};
        const awb = pickAwb(data);
        if (awb) return { raw: data, awb };
        const failed = String(data.status || data.message || '').toUpperCase();
        if (failed && failed !== 'OK' && failed !== 'SUCCESS') {
          lastError = new Error(data.message || failed);
          continue;
        }
        lastError = new Error(data.message || 'DTDC did not return an AWB / reference number');
      } catch (error) {
        lastError = new Error(axiosMessage(error, 'DTDC shipment booking failed'));
      }
    }
    throw lastError;
  }

  async getLabel(awbCode) {
    requireConfig();
    const paths = [
      '/api/custOrder/shippinglabel/stream',
      '/api/customer/integration/consignment/shippinglabel/stream',
    ];
    let lastError;
    for (const path of paths) {
      try {
        const response = await dtdcApi.get(path, {
          params: {
            reference_number: awbCode,
            label_code: process.env.DTDC_LABEL_CODE || 'SHIP_LABEL_4X6',
            label_format: 'pdf',
          },
          responseType: 'arraybuffer',
        });
        return response.data;
      } catch (error) {
        lastError = new Error(axiosMessage(error, 'DTDC label download failed'));
      }
    }
    throw lastError;
  }

  async trackShipment(awbCode) {
    requireConfig();
    try {
      const response = await dtdcTrackApi.get('/rest/JSONTrakingRestService.jsp', {
        params: {
          TrkType: 'cnno',
          strcnno: awbCode,
          addtnlDtl: 'Y',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(axiosMessage(error, 'DTDC tracking failed'));
    }
  }

  async cancelShipment(awbCode, reason = 'Cancelled by seller') {
    requireConfig();
    try {
      const response = await dtdcApi.post('/api/customer/integration/consignment/cancel', {
        reference_number: awbCode,
        cancellation_reason: reason,
      });
      return response.data;
    } catch (error) {
      throw new Error(axiosMessage(error, 'DTDC cancel failed'));
    }
  }
}

module.exports = new DtdcService();
module.exports.isDtdcConfigured = isDtdcConfigured;
module.exports.buildConsignmentFromOrder = buildConsignmentFromOrder;
