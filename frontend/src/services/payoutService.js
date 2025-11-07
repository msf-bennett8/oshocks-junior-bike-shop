// ============================================================================
// PAYOUT SERVICE - Payout Management API Calls
// ============================================================================
import api from './api';

const payoutService = {
  // ============================================================================
  // PENDING PAYOUTS
  // ============================================================================
  
  /**
   * Get all sellers with pending payouts
   * @returns {Promise} List of sellers with pending payout amounts
   */
  getPendingPayouts: async () => {
    try {
      console.log('⏳ Fetching pending payouts');
      const response = await api.get('/payouts/pending');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching pending payouts:', error);
      throw error;
    }
  },

  /**
   * Get detailed pending payments for a specific seller
   * @param {number} sellerId - Seller ID
   * @returns {Promise} Detailed list of pending payments
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

  // ============================================================================
  // PROCESS PAYOUTS
  // ============================================================================
  
  /**
   * Process payouts for selected sellers
   * @param {object} payoutData - {
   *   seller_ids: number[],
   *   payout_method: 'mpesa' | 'bank_transfer',
   *   payout_reference: string,
   *   notes?: string
   * }
   * @returns {Promise} Processed payout results
   */
  processPayouts: async (payoutData) => {
    try {
      console.log('✅ Processing payouts:', payoutData);
      const response = await api.post('/payouts/process', payoutData);
      return response.data;
    } catch (error) {
      console.error('❌ Error processing payouts:', error);
      throw error;
    }
  },

  // ============================================================================
  // PAYOUT HISTORY
  // ============================================================================
  
  /**
   * Get payout history with filters
   * @param {object} filters - {
   *   page?: number,
   *   per_page?: number,
   *   seller_id?: number,
   *   start_date?: string,
   *   end_date?: string
   * }
   * @returns {Promise} Paginated payout history
   */
  getPayoutHistory: async (filters = {}) => {
    try {
      console.log('📜 Fetching payout history:', filters);
      const response = await api.get('/payouts/history', {
        params: {
          page: filters.page || 1,
          per_page: filters.per_page || 20,
          ...filters
        }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching payout history:', error);
      throw error;
    }
  },

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  
  /**
   * Format currency for display
   * @param {number} amount - Amount in KES
   * @returns {string} Formatted currency string
   */
  formatCurrency: (amount) => {
    return `KES ${amount.toLocaleString('en-KE', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  },

  /**
   * Format date for display
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date string
   */
  formatDate: (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

export default payoutService;