const shiprocketApi = require('../config/shiprocket');
const tokenManager = require('../utils/tokenManager');

class ShiprocketService {
  /**
   * Check Serviceability
   */
  async checkServiceability(pickupPostcode, deliveryPostcode, weight, cod) {
    try {
      const response = await shiprocketApi.get('/courier/serviceability/', {
        params: {
          pickup_postcode: pickupPostcode,
          delivery_postcode: deliveryPostcode,
          weight,
          cod
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error checking serviceability:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Create Custom Order
   * @param {Object} orderData 
   */
  async createOrder(orderData) {
    try {
      const response = await shiprocketApi.post('/orders/create/adhoc', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order in Shiprocket:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Assign AWB (Airway Bill)
   * @param {Object} data { shipment_id, courier_id }
   */
  async assignAWB(data) {
    try {
      const response = await shiprocketApi.post('/courier/assign/awb', data);
      return response.data;
    } catch (error) {
      console.error('Error assigning AWB:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Generate Pickup Request
   * @param {Object} data { shipment_id }
   */
  async generatePickup(data) {
    try {
      const response = await shiprocketApi.post('/courier/generate/pickup', data);
      return response.data;
    } catch (error) {
      console.error('Error generating pickup:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Generate Shipping Label
   * @param {Object} data { shipment_id }
   */
  async generateLabel(data) {
    try {
      const response = await shiprocketApi.post('/courier/generate/label', data);
      return response.data;
    } catch (error) {
      console.error('Error generating label:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Generate Invoice
   * @param {Object} data { ids: [order_id] }
   */
  async generateInvoice(data) {
    try {
      const response = await shiprocketApi.post('/orders/print/invoice', data);
      return response.data;
    } catch (error) {
      console.error('Error generating invoice:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Track Shipment via AWB
   * @param {String} awbCode 
   */
  async trackShipment(awbCode) {
    try {
      const response = await shiprocketApi.get(`/courier/track/awb/${awbCode}`);
      return response.data;
    } catch (error) {
      console.error(`Error tracking shipment for AWB ${awbCode}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Cancel Shipment
   * @param {Object} data { ids: [order_id] }
   */
  async cancelShipment(data) {
    try {
      const response = await shiprocketApi.post('/orders/cancel', data);
      return response.data;
    } catch (error) {
      console.error('Error cancelling shipment:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new ShiprocketService();
