// frontend/src/services/userService.js
import api from './api';
import authService from './authService';

const userService = {
  /**
   * Get all users (Admin/Super Admin only)
   */
  getAllUsers: async (params = {}) => {
    try {
      const token = authService.getToken();
      const response = await api.get('/admin/users', {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch users:', error);
      throw error;
    }
  },

  /**
   * Get pending sellers (Super Admin only)
   */
  getPendingSellers: async () => {
    try {
      const token = authService.getToken();
      const response = await api.get('/super-admin/pending-sellers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch pending sellers:', error);
      throw error;
    }
  },

  /**
   * Approve seller (Super Admin only)
   */
  approveSeller: async (userId) => {
    try {
      const token = authService.getToken();
      const response = await api.put(`/super-admin/sellers/${userId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Failed to approve seller:', error);
      throw error;
    }
  },

  /**
   * Reject seller (Super Admin only)
   */
  rejectSeller: async (userId) => {
    try {
      const token = authService.getToken();
      const response = await api.put(`/super-admin/sellers/${userId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Failed to reject seller:', error);
      throw error;
    }
  },

  /**
   * Change user role (Super Admin only)
   */
  changeUserRole: async (userId, newRole) => {
    try {
      const token = authService.getToken();
      const response = await api.put(`/super-admin/users/${userId}/role`, 
        { role: newRole },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Failed to change user role:', error);
      throw error;
    }
  },

  /**
   * Update user status (Admin/Super Admin)
   */
  updateUserStatus: async (userId, isActive) => {
    try {
      const token = authService.getToken();
      const response = await api.put(`/admin/users/${userId}/status`, 
        { is_active: isActive },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update user status:', error);
      throw error;
    }
  },

  /**
   * Delete user (Admin/Super Admin)
   */
  deleteUser: async (userId) => {
    try {
      const token = authService.getToken();
      const response = await api.delete(`/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Failed to delete user:', error);
      throw error;
    }
  },

  /**
   * Get user details with all roles and profiles (Admin/Super Admin)
   */
  getUserDetails: async (userId) => {
    try {
      const token = authService.getToken();
      const response = await api.get(`/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch user details:', error);
      throw error;
    }
  },

  /**
   * Elevate user - Add multiple roles (Admin/Super Admin)
   */
  elevateUser: async (userId, roles) => {
    try {
      const token = authService.getToken();
      const response = await api.post(`/admin/users/${userId}/elevate`, 
        { roles },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Failed to elevate user:', error);
      throw error;
    }
  },

  /**
   * Remove role from user (Admin/Super Admin)
   */
  removeRole: async (userId, role) => {
    try {
      const token = authService.getToken();
      const response = await api.post(`/admin/users/${userId}/remove-role`, 
        { role },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Failed to remove role:', error);
      throw error;
    }
  },

  /**
   * Toggle user status (Admin/Super Admin)
   */
  toggleUserStatus: async (userId) => {
    try {
      const token = authService.getToken();
      const response = await api.post(`/admin/users/${userId}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Failed to toggle user status:', error);
      throw error;
    }
  },

  /**
   * Manage payment recorder profile (Admin/Super Admin)
   */
  managePaymentRecorder: async (userId, recorderData) => {
    try {
      const token = authService.getToken();
      const response = await api.post(`/admin/users/${userId}/payment-recorder`, 
        recorderData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Failed to manage payment recorder:', error);
      throw error;
    }
  },

  /**
   * Manage seller profile (Admin/Super Admin)
   */
  manageSellerProfile: async (userId, profileData) => {
    try {
      const token = authService.getToken();
      const response = await api.post(`/admin/users/${userId}/seller-profile`, 
        profileData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Failed to manage seller profile:', error);
      throw error;
    }
  }
};

export default userService;