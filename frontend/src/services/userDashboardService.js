import api from './api';

const userDashboardService = {
  /**
   * Get dashboard stats with time period filtering
   * @param {string} period - 'today', '7days', '30days', 'thisyear', 'all'
   */
  getDashboardStats: async (period = 'all') => {
    const response = await api.get('/user/dashboard-stats', {
      params: { period }
    });
    return response.data;
  },

  /**
   * Get spending analytics by month
   * @param {number} months - Number of months to fetch (default 7)
   */
  getSpendingAnalytics: async (months = 7) => {
    const response = await api.get('/user/spending-analytics', {
      params: { months }
    });
    return response.data;
  },

  /**
   * Get rewards program data
   */
  getRewards: async () => {
    const response = await api.get('/user/rewards');
    return response.data;
  },

  /**
   * Get referral code
   */
  getReferralCode: async () => {
    const response = await api.get('/user/referral-code');
    return response.data;
  },

  /**
   * Regenerate referral code
   */
  regenerateReferralCode: async () => {
    const response = await api.post('/user/referral-code/regenerate');
    return response.data;
  },

  /**
   * Get user's orders
   */
  getOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  /**
   * Get user's wishlist
   */
  getWishlist: async () => {
    const response = await api.get('/wishlist');
    return response.data;
  },
};

export default userDashboardService;
