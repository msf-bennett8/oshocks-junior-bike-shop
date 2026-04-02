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

  /**
   * Get seller orders with customer and product details
   */
  getOrders: async (params = {}) => {
    try {
      console.log('📦 Fetching seller orders:', params);
      const response = await api.get('/seller/orders', {
        params: {
          page: params.page || 1,
          per_page: params.per_page || 20,
          ...params
        }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching seller orders:', error);
      throw error;
    }
  },

  // ============================================================================
  // SELLER PRODUCTS ENDPOINTS
  // ============================================================================
  
  /**
   * Get seller's products with pagination and filters
   */
  getProducts: async (params = {}) => {
    try {
      console.log('[SERVICE] =========================================');
      console.log('[SERVICE] Fetching seller products:', params);
      console.log('[SERVICE] API baseURL:', api.defaults?.baseURL);
      console.log('[SERVICE] Token exists:', !!localStorage.getItem('authToken'));
      console.log('[SERVICE] Token:', localStorage.getItem('authToken')?.substring(0, 20) + '...');
      
      const response = await api.get('/seller/products', {
        params: {
          page: params.page || 1,
          per_page: params.per_page || 12,
          search: params.search,
          category: params.category,
          sort: params.sort || 'created_at',
          direction: params.direction || 'desc',
          ...params
        }
      });
      console.log('[SERVICE] ✅ SUCCESS! Status:', response.status);
      console.log('[SERVICE] Response.data:', response.data);
      console.log('[SERVICE] Products count:', response.data?.data?.length || 0);
      console.log('[SERVICE] =========================================');
      return response.data;
    } catch (error) {
      console.error('[SERVICE] Error fetching seller products:', error);
      console.error('[SERVICE] Error response:', error.response?.data);
      console.error('[SERVICE] Error status:', error.response?.status);
      console.error('[SERVICE] Error config:', error.config);
      throw error;
    }
  },

  /**
   * Get single product details
   */
  getProduct: async (productId) => {
    try {
      console.log('🔍 Fetching product:', productId);
      const response = await api.get(`/seller/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching product:', error);
      throw error;
    }
  },

  /**
   * Update product with FormData (supports images)
   */
  updateProduct: async (productId, formData) => {
    try {
      console.log('✏️ Updating product:', productId);
      const response = await api.post(`/seller/products/${productId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error updating product:', error);
      throw error;
    }
  },

  /**
   * Delete product (soft delete with Cloudinary cleanup)
   */
  deleteProduct: async (productId) => {
    try {
      console.log('🗑️ Deleting product:', productId);
      const response = await api.delete(`/seller/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      throw error;
    }
  },

  /**
   * Toggle product visibility (hide/unhide)
   */
  toggleProductVisibility: async (productId, isActive) => {
    try {
      console.log('👁️ Toggling visibility:', productId, isActive);
      const response = await api.put(`/seller/products/${productId}`, {
        is_active: isActive
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error toggling visibility:', error);
      throw error;
    }
  },

  /**
   * Update product stock quantity
   */
  updateProductStock: async (productId, quantity) => {
    try {
      console.log('📊 Updating stock:', productId, quantity);
      const response = await api.put(`/seller/products/${productId}`, {
        quantity: quantity
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error updating stock:', error);
      throw error;
    }
  },

  /**
   * Duplicate product
   */
  duplicateProduct: async (productId) => {
    try {
      console.log('📋 Duplicating product:', productId);
      const response = await api.post(`/seller/products/${productId}/duplicate`);
      return response.data;
    } catch (error) {
      console.error('❌ Error duplicating product:', error);
      throw error;
    }
  },

  /**
   * Get categories for product form
   */
  getCategories: async () => {
    try {
      console.log('📂 Fetching categories');
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      throw error;
    }
  },
};

export default sellerDashboardService;