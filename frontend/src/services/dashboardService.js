// ============================================================================
// DASHBOARD SERVICE - Admin Dashboard API Calls
// ============================================================================
import api from './api';

const dashboardService = {
  // ============================================================================
  // OWNER DASHBOARD ENDPOINTS
  // ============================================================================
  
  /**
   * Get platform overview statistics
   * @param {string} period - 'today', 'week', 'month'
   */
  getOwnerOverview: async (period = 'month') => {
    try {
      console.log('📊 Fetching owner dashboard overview:', period);
      const response = await api.get(`/dashboard/owner/overview`, {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching owner overview:', error);
      throw error;
    }
  },

  /**
   * Get payment methods breakdown
   * @param {string} period - 'today', 'week', 'month'
   */
  getPaymentMethodsBreakdown: async (period = 'month') => {
    try {
      console.log('💳 Fetching payment methods breakdown:', period);
      const response = await api.get(`/dashboard/owner/payment-methods-breakdown`, {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching payment methods:', error);
      throw error;
    }
  },

  /**
   * Get sale channels breakdown
   * @param {string} period - 'today', 'week', 'month'
   */
  getSaleChannelsBreakdown: async (period = 'month') => {
    try {
      console.log('📦 Fetching sale channels breakdown:', period);
      const response = await api.get(`/dashboard/owner/sale-channels-breakdown`, {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching sale channels:', error);
      throw error;
    }
  },

  /**
   * Get top performing sellers
   * @param {number} limit - Number of sellers to return
   * @param {string} period - 'today', 'week', 'month'
   */
  getTopSellers: async (limit = 10, period = 'month') => {
    try {
      console.log('🏆 Fetching top sellers:', { limit, period });
      const response = await api.get(`/dashboard/owner/top-sellers`, {
        params: { limit, period }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching top sellers:', error);
      throw error;
    }
  },

  /**
   * Get recent orders
   * @param {number} limit - Number of orders to return
   */
  getRecentOrders: async (limit = 10) => {
    try {
      console.log('📦 Fetching recent orders:', limit);
      const response = await api.get(`/dashboard/owner/recent-orders`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching recent orders:', error);
      throw error;
    }
  },

  /**
   * Get order status distribution
   * @param {string} period - 'today', 'week', 'month'
   */
  getOrderStatusDistribution: async (period = 'month') => {
    try {
      console.log('📊 Fetching order status distribution:', period);
      const response = await api.get(`/dashboard/owner/order-status-distribution`, {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching order status:', error);
      throw error;
    }
  },

  // ============================================================================
  // TRANSACTION ENDPOINTS
  // ============================================================================
  
  /**
   * Get all transactions with filters
   * @param {object} filters - Filter parameters
   */
  getTransactions: async (filters = {}) => {
    try {
      console.log('💰 Fetching transactions:', filters);
      const response = await api.get(`/transactions`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching transactions:', error);
      throw error;
    }
  },

  /**
   * Get single transaction details
   * @param {number} id - Transaction ID
   */
  getTransaction: async (id) => {
    try {
      console.log('🔍 Fetching transaction details:', id);
      const response = await api.get(`/transactions/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching transaction:', error);
      throw error;
    }
  },

  // ============================================================================
  // PAYOUT ENDPOINTS
  // ============================================================================
  
  /**
   * Get pending payouts grouped by seller
   */
  getPendingPayouts: async () => {
    try {
      console.log('⏳ Fetching pending payouts');
      const response = await api.get(`/payouts/pending`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching pending payouts:', error);
      throw error;
    }
  },

  /**
   * Get pending payments for specific seller
   * @param {number} sellerId - Seller ID
   */
  getSellerPendingPayments: async (sellerId) => {
    try {
      console.log('📋 Fetching seller pending payments:', sellerId);
      const response = await api.get(`/payouts/seller/${sellerId}/pending-payments`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching seller pending payments:', error);
      throw error;
    }
  },

  /**
   * Process payouts for selected sellers
   * @param {object} payoutData - Payout processing data
   */
  processPayouts: async (payoutData) => {
    try {
      console.log('✅ Processing payouts:', payoutData);
      const response = await api.post(`/payouts/process`, payoutData);
      return response.data;
    } catch (error) {
      console.error('❌ Error processing payouts:', error);
      throw error;
    }
  },

  /**
   * Get payout history
   * @param {object} filters - Filter parameters
   */
  getPayoutHistory: async (filters = {}) => {
    try {
      console.log('📜 Fetching payout history:', filters);
      const response = await api.get(`/payouts/history`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching payout history:', error);
      throw error;
    }
  },
};

export default dashboardService;