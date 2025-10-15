// frontend/src/services/authService.js
import api from './api';

const TOKEN_KEY = 'authToken';

const authService = {
  // ============================================================================
  // TOKEN MANAGEMENT
  // ============================================================================
  
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token);
    console.log('✅ Token stored successfully');
  },

  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
    console.log('🗑️ Token removed');
  },

  // ============================================================================
  // AUTHENTICATION ENDPOINTS
  // ============================================================================

  /**
   * Register new user - tries multiple endpoint patterns
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration response with token and user
   */
  register: async (userData) => {
    const requestData = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      password_confirmation: userData.passwordConfirmation || userData.password_confirmation,
      phone: userData.phone,
      address: userData.address || ''
    };

    console.log('📝 Registration request data:', {
      name: requestData.name,
      email: requestData.email,
      phone: requestData.phone,
      address: requestData.address,
      hasPassword: !!requestData.password
    });

    // Try different endpoint patterns
    const endpoints = [
      '/auth/register',       // This works! (from your local success log)
      '/v1/auth/register',    // Fallback
      '/register',            // Simple fallback
      '/auth/signup',         // Alternative
      '/v1/register',         // Alternative
      '/signup'               // Simplest fallback
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`🔄 Trying endpoint: ${endpoint}`);
        
        const response = await api.post(endpoint, requestData);

        console.log('✅ Registration successful with endpoint:', endpoint, {
          status: response.status,
          hasToken: !!response.data?.token,
          hasUser: !!response.data?.user
        });

        return response.data;
      } catch (error) {
        // If it's a 404, try next endpoint
        if (error.response?.status === 404) {
          console.log(`❌ 404 on ${endpoint}, trying next...`);
          continue;
        }
        
        // If it's any other error (validation, etc.), throw it
        console.error('❌ Registration failed:', {
          endpoint,
          status: error.response?.status,
          message: error.response?.data?.message,
          errors: error.response?.data?.errors
        });
        throw error;
      }
    }

    // If all endpoints failed with 404
    throw new Error(
      'Registration endpoint not found. Please contact support. ' +
      'Tried endpoints: ' + endpoints.join(', ')
    );
  },

  /**
   * Login user - tries multiple endpoint patterns
   * @param {Object} credentials - Email and password
   * @returns {Promise<Object>} Login response with token and user
   */
  login: async (credentials) => {
    const requestData = {
      email: credentials.email,
      password: credentials.password
    };

    console.log('🔐 Login attempt for:', requestData.email);

    const endpoints = [
      '/auth/login',      // Match your working registration pattern
      '/login',           // Fallback
      '/v1/auth/login',   // Alternative
      '/v1/login'         // Alternative
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`🔄 Trying login endpoint: ${endpoint}`);
        
        const response = await api.post(endpoint, requestData);

        console.log('✅ Login successful with endpoint:', endpoint, {
          status: response.status,
          hasToken: !!response.data?.token,
          hasUser: !!response.data?.user
        });

        return response.data;
      } catch (error) {
        if (error.response?.status === 404) {
          console.log(`❌ 404 on ${endpoint}, trying next...`);
          continue;
        }
        
        console.error('❌ Login failed:', {
          endpoint,
          status: error.response?.status,
          message: error.response?.data?.message
        });
        throw error;
      }
    }

    throw new Error(
      'Login endpoint not found. Please contact support. ' +
      'Tried endpoints: ' + endpoints.join(', ')
    );
  },

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  logout: async () => {
    const token = authService.getToken();
    
    if (token) {
      try {
        console.log('👋 Logging out user');
        
        // Try multiple logout endpoints
        const endpoints = ['/v1/auth/logout', '/auth/logout', '/v1/logout', '/logout'];
        
        for (const endpoint of endpoints) {
          try {
            await api.post(endpoint, {}, {
              headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ Logout successful via:', endpoint);
            break;
          } catch (error) {
            if (error.response?.status !== 404) {
              console.error('⚠️ Logout error:', error.message);
              break;
            }
          }
        }
      } catch (error) {
        console.error('⚠️ Logout API error (continuing anyway):', error.message);
      }
    }
    
    authService.removeToken();
  },

  /**
   * Get current authenticated user
   * @returns {Promise<Object>} Current user data
   */
  getCurrentUser: async () => {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('👤 Fetching current user');

      const endpoints = ['/v1/auth/me', '/auth/me', '/v1/user', '/user', '/v1/auth/user', '/auth/user'];

      for (const endpoint of endpoints) {
        try {
          const response = await api.get(endpoint, {
            headers: { Authorization: `Bearer ${token}` }
          });

          console.log('✅ User data retrieved via:', endpoint, {
            id: response.data?.user?.id,
            email: response.data?.user?.email
          });

          return response.data;
        } catch (error) {
          if (error.response?.status === 404) {
            continue;
          }
          throw error;
        }
      }

      throw new Error('User endpoint not found');
    } catch (error) {
      console.error('❌ Failed to get current user:', error.message);
      throw error;
    }
  },

  /**
   * Update user profile
   * @param {Object} updates - Profile updates
   * @returns {Promise<Object>} Updated user data
   */
  updateProfile: async (updates) => {
    try {
      const token = authService.getToken();
      
      console.log('✏️ Updating user profile');

      const response = await api.put('/v1/auth/profile', updates, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Profile updated successfully');

      return response.data;
    } catch (error) {
      console.error('❌ Profile update failed:', error.message);
      throw error;
    }
  },

  /**
   * Change password
   * @param {Object} passwordData - Current and new password
   * @returns {Promise<Object>} Success message
   */
  changePassword: async (passwordData) => {
    try {
      const token = authService.getToken();
      
      console.log('🔒 Changing password');

      const response = await api.post('/v1/auth/change-password', {
        current_password: passwordData.currentPassword || passwordData.current_password,
        new_password: passwordData.newPassword || passwordData.new_password,
        new_password_confirmation: passwordData.newPasswordConfirmation || passwordData.new_password_confirmation
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Password changed successfully');

      return response.data;
    } catch (error) {
      console.error('❌ Password change failed:', error.message);
      throw error;
    }
  },

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} Success message
   */
  forgotPassword: async (email) => {
    try {
      console.log('📧 Requesting password reset for:', email);

      const response = await api.post('/v1/auth/forgot-password', { email });

      console.log('✅ Password reset email sent');

      return response.data;
    } catch (error) {
      console.error('❌ Password reset request failed:', error.message);
      throw error;
    }
  },

  /**
   * Reset password with token
   * @param {Object} resetData - Email, token, and new password
   * @returns {Promise<Object>} Success message
   */
  resetPassword: async (resetData) => {
    try {
      console.log('🔑 Resetting password');

      const response = await api.post('/v1/auth/reset-password', {
        email: resetData.email,
        token: resetData.token,
        password: resetData.password,
        password_confirmation: resetData.passwordConfirmation || resetData.password_confirmation
      });

      console.log('✅ Password reset successful');

      return response.data;
    } catch (error) {
      console.error('❌ Password reset failed:', error.message);
      throw error;
    }
  },

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    return !!authService.getToken();
  },

  /**
   * Verify token validity
   * @returns {Promise<boolean>}
   */
  verifyToken: async () => {
    try {
      await authService.getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }
};

export default authService;