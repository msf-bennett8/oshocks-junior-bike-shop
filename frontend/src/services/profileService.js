import api from './api';

const profileService = {
  // Get user stats (orders, spent, wishlist count, loyalty points)
  getStats: async () => {
    const response = await api.get('/user/stats');
    return response.data;
  },

  // Get saved payment methods (M-Pesa + Cards)
  getPaymentMethods: async () => {
    const response = await api.get('/user/payment-methods');
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
