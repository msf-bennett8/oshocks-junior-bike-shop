// ============================================================================
// SELLER DASHBOARD SERVICE - Seller-specific API Calls
// ============================================================================
import api from './api';

const sellerDashboardService = {
  // ============================================================================
  // SELLER DASHBOARD ENDPOINTS
  // ============================================================================
  
  /**
   * Get seller overview statistics
   * @param {string} period - 'today', 'week', 'month'
   */
  getOverview: async (period = 'month') => {
    try {
      console.log('📊 Fetching seller dashboard overview:', period);
      const response = await api.get('/dashboard/seller/overview', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching seller overview:', error);
      throw error;
    }
  },

  /**
   * Get seller transactions with pagination and filters
   * @param {object} params - { page, per_page, payment_method, status, payout_status, start_date, end_date }
   */
  getTransactions: async (params = {}) => {
    try {
      console.log('💰 Fetching seller transactions:', params);
      const response = await api.get('/dashboard/seller/transactions', {
        params: {
          page: params.page || 1,
          per_page: params.per_page || 20,
          ...params
        }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching seller transactions:', error);
      throw error;
    }
  },

  /**
   * Get commission breakdown
   * @param {string} period - 'today', 'week', 'month'
   */
  getCommissionBreakdown: async (period = 'month') => {
    try {
      console.log('📈 Fetching commission breakdown:', period);
      const response = await api.get('/dashboard/seller/commission-breakdown', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching commission breakdown:', error);
      throw error;
    }
  },

  /**
   * Get payout history
   */
  getPayouts: async () => {
    try {
      console.log('💸 Fetching seller payouts');
      const response = await api.get('/dashboard/seller/payouts');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching seller payouts:', error);
      throw error;
    }
  },
};

export default sellerDashboardService;