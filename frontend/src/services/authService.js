// frontend/src/services/authService.js
import api from './api';

const TOKEN_KEY = 'authToken';

export const authService = {
  // Token management
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      password_confirmation: userData.passwordConfirmation || userData.password_confirmation,
      phone: userData.phone,
      address: userData.address || ''
    });
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', {
      email: credentials.email,
      password: credentials.password
    });
    return response.data;
  },

  // Logout user
  logout: async () => {
    const token = authService.getToken();
    if (token) {
      try {
        await api.post('/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Logout API error:', error);
      }
    }
    authService.removeToken();
  },

  // Get current authenticated user
  getCurrentUser: async () => {
    const token = authService.getToken();
    const response = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Update user profile
  updateProfile: async (updates) => {
    const token = authService.getToken();
    const response = await api.put('/auth/profile', updates, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const token = authService.getToken();
    const response = await api.post('/auth/change-password', {
      current_password: passwordData.currentPassword || passwordData.current_password,
      new_password: passwordData.newPassword || passwordData.new_password,
      new_password_confirmation: passwordData.newPasswordConfirmation || passwordData.new_password_confirmation
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Request password reset
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password with token
  resetPassword: async (resetData) => {
    const response = await api.post('/auth/reset-password', {
      email: resetData.email,
      token: resetData.token,
      password: resetData.password,
      password_confirmation: resetData.passwordConfirmation || resetData.password_confirmation
    });
    return response.data;
  }
};

export default authService;