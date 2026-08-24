const { dtdcApi, dtdcTrackApi } = require('../config/dtdc');

const isDtdcConfigured = () =>
  Boolean(process.env.DTDC_API_KEY && process.env.DTDC_CUSTOMER_CODE);

const requireConfig = () => {
  if (!isDtdcConfigured()) {
    throw new Error('DTDC is not configured. Set DTDC_API_KEY and DTDC_CUSTOMER_CODE in backend/.env');
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

class DtdcService {
  async createShipment(consignment) {
    requireConfig();
    const paths = [
      '/rest/api/crd/softdata',
      '/api/customer/integration/consignment/softdata'
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
      '/api/customer/integration/consignment/shippinglabel/stream'
    ];
    let lastError;
    for (const path of paths) {
      try {
        const response = await dtdcApi.get(path, {
          params: {
            reference_number: awbCode,
            label_code: process.env.DTDC_LABEL_CODE || 'SHIP_LABEL_4X6',
            label_format: 'pdf'
          },
          responseType: 'arraybuffer'
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
          addtnlDtl: 'Y'
        }
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
        cancellation_reason: reason
      });
      return response.data;
    } catch (error) {
      throw new Error(axiosMessage(error, 'DTDC cancel failed'));
    }
  }
}

module.exports = new DtdcService();
module.exports.isDtdcConfigured = isDtdcConfigured;
