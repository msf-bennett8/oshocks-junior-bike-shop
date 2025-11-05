import api from '../api';

export const recorderService = {
  /**
   * Get pending payment orders (COD orders awaiting payment)
   */
  getPendingOrders: async (page = 1) => {
    const response = await api.get(`/orders/pending-payments?page=${page}`);
    return response.data;
  },

  /**
   * Search for order by order number
   */
  searchOrder: async (orderNumber) => {
    const response = await api.get('/orders/search', {
      params: { order_number: orderNumber }
    });
    return response.data;
  },

  /**
   * Record payment for an order
   * @param {string} orderNumber - The order number (e.g., "OS34618831")
   * @param {object} paymentData - Payment details { amount_received, payment_method, notes }
   */
  recordPayment: async (orderNumber, paymentData) => {
    const response = await api.post(`/orders/${orderNumber}/record-payment`, paymentData);
    return response.data;
  },

  /**
   * Get order details by order number (reuses search endpoint)
   */
  getOrderDetails: async (orderNumber) => {
    const response = await api.get('/orders/search', {
      params: { order_number: orderNumber }
    });
    return response.data;
  }
};

export default recorderService;