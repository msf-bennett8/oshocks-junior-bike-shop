import api from './api';

export const orderService = {
  create: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  
  getOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },
  
  /**
   * Get order by order_display (encoded) or order_number (legacy)
   */
  getOrderById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },
  
  /**
   * Get user's last delivery location for auto-fill
   */
  getLastDeliveryLocation: async () => {
    const response = await api.get('/user/last-delivery-location');
    return response.data;
  },
};

export default orderService;
