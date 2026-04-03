import api from './api';

// Track pending requests to prevent duplicates
const pendingRequests = new Map();

const profileService = {
  // Get user stats (orders, spent, wishlist count, loyalty points)
  getStats: async () => {
    const response = await api.get('/user/stats');
    return response.data;
  },

  // Get saved payment methods (M-Pesa + Cards) - with deduplication
  getPaymentMethods: async () => {
    const key = 'getPaymentMethods';
    if (pendingRequests.has(key)) {
      return pendingRequests.get(key);
    }
    
    const promise = api.get('/payment-methods').then(response => {
      pendingRequests.delete(key);
      return response.data;
    }).catch(error => {
      pendingRequests.delete(key);
      throw error;
    });
    
    pendingRequests.set(key, promise);
    return promise;
  },

  // Create new payment method
  createPaymentMethod: async (paymentData) => {
    const response = await api.post('/payment-methods', paymentData);
    return response.data;
  },

  // Update payment method
  updatePaymentMethod: async (id, paymentData) => {
    const response = await api.put(`/payment-methods/${id}`, paymentData);
    return response.data;
  },

  // Delete payment method
  deletePaymentMethod: async (id) => {
    const response = await api.delete(`/payment-methods/${id}`);
    return response.data;
  },

  // Set payment method as default
  setDefaultPaymentMethod: async (id) => {
    const response = await api.put(`/payment-methods/${id}/set-default`);
    return response.data;
  },

  // Get login activity for security section
  getLoginActivity: async () => {
    const response = await api.get('/user/login-activity');
    return response.data;
  },

  // Get user preferences
  getPreferences: async () => {
    const response = await api.get('/user/preferences');
    return response.data;
  },

  // Update user preferences
  updatePreferences: async (preferences) => {
    const response = await api.put('/user/preferences', preferences);
    return response.data;
  },
};

export default profileService;
