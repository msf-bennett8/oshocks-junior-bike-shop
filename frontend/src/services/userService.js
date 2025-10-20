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
  }
};

export default userService;