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
   */
  recordPayment: async (paymentData) => {
    const response = await api.post('/payments/record', paymentData);
    return response.data;
  },

  /**
   * Get order details by order number
   */
  getOrderDetails: async (orderNumber) => {
    const response = await api.get(`/orders/${orderNumber}`);
    return response.data;
  }
};

export default recorderService;
