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
    // Step 1: Get order details to extract order_id
    const orderResponse = await api.get('/orders/search', {
      params: { order_number: orderNumber }
    });
    
    const order = orderResponse.data.data;
    
    // Step 2: Transform payload for PaymentController
    const payload = {
      order_id: order.id,                        // ← Changed from orderNumber
      payment_method: paymentData.payment_method,
      amount: paymentData.amount_received,       // ← Changed field name
      county: paymentData.county,
      zone: paymentData.zone,
      customer_phone: paymentData.customer_phone,
      external_reference: paymentData.external_reference,
      external_transaction_id: paymentData.external_transaction_id,
      notes: paymentData.notes
    };
    
    // Step 3: Call PaymentController endpoint
    const response = await api.post('/payments/record', payload);  // ← Changed endpoint
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