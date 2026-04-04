// frontend/src/services/authService.js
import axios from 'axios';
import { fetchCsrfCookie } from './csrfService';
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
  await fetchCsrfCookie();
  
  const requestData = {
    name: userData.name,
    username: userData.username || null,
    email: userData.email || null,
    password: userData.password,
    password_confirmation: userData.passwordConfirmation || userData.password_confirmation,
    phone: userData.phone || null,
    address: userData.address || ''
  };

  console.log('📝 Registration request data:', {
    name: requestData.name,
    username: requestData.username,
    email: requestData.email,
    phone: requestData.phone,
    address: requestData.address,
    hasPassword: !!requestData.password
  });

  // Try different endpoint patterns
  const endpoints = [
    '/auth/register',
    '/auth/signup',
    '/register'
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
 * Supports email, phone, or username + password
 * @param {Object} credentials - Login identifier and password
 * @returns {Promise<Object>} Login response with token and user
 */
login: async (credentials) => {
  await fetchCsrfCookie();
  
  // Support both 'email' (legacy) and 'login' (new flexible field)
  const loginIdentifier = credentials.login || credentials.email;
  
  const requestData = {
    login: loginIdentifier,
    password: credentials.password
  };

  console.log('🔐 Login attempt with:', loginIdentifier);

  const endpoints = [
    '/auth/login',
    '/login'
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

      // Log successful login audit event
      try {
        const { logFrontendAuditEvent, AUDIT_EVENTS } = await import('../utils/auditUtils');
        logFrontendAuditEvent(AUDIT_EVENTS.LOGIN_SUCCESS, {
          category: 'auth',
          severity: 'medium',
          metadata: {
            login_identifier: requestData.login,
            method: 'password',
            endpoint: endpoint,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (e) {
        // Silently fail - audit should not break auth
      }

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
        const endpoints = ['/auth/logout', '/logout'];
        
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
      // Log logout audit event
      try {
        const { logFrontendAuditEvent, AUDIT_EVENTS } = await import('../utils/auditUtils');
        logFrontendAuditEvent(AUDIT_EVENTS.LOGOUT, {
          category: 'auth',
          severity: 'low',
          metadata: { timestamp: new Date().toISOString() },
        });
      } catch (e) {
        // Silently fail
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

      const endpoints = ['/auth/me', '/user', '/auth/user'];

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

      const response = await api.put('/auth/profile', updates, {
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

      const response = await api.post('/auth/change-password', {
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

      const response = await api.post('/auth/forgot-password', { email });

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

      const response = await api.post('/auth/reset-password', {
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
  },

// ============================================================================
// OAUTH AUTHENTICATION - Replace these functions in authService.js
// ============================================================================

/**
 * Handle Google OAuth callback
 * @param {string} code - Authorization code from Google
 * @returns {Promise<Object>} Auth response with token and user
 */
googleLogin: async (code) => {
  try {
    console.log('🔐 Google OAuth login initiated');
    console.log('📋 Authorization code:', code?.substring(0, 20) + '...');

   await fetchCsrfCookie();
    console.log('🍪 CSRF cookie fetched');

    const response = await api.post('/auth/google', { code });

    console.log('✅ Google login API response:', {
      status: response.status,
      statusText: response.statusText,
      hasData: !!response.data,
      dataKeys: response.data ? Object.keys(response.data) : [],
      fullResponse: response.data
    });

    // Handle different response structures
    let authData;
    if (response.data?.data) {
      authData = response.data.data;
    } else if (response.data?.token) {
      authData = response.data;
    } else {
      console.error('❌ Unexpected response structure:', response.data);
      throw new Error('Invalid response format from server');
    }

    console.log('📦 Extracted auth data:', {
      hasToken: !!authData?.token,
      hasUser: !!authData?.user,
      userName: authData?.user?.name,
      userEmail: authData?.user?.email,
    });

    // Store token
    if (authData?.token) {
      authService.setToken(authData.token);
      console.log('✅ Token stored successfully');
    } else {
      console.error('❌ No token in response');
      throw new Error('No authentication token received');
    }

    // Log Google login success
    try {
      const { logFrontendAuditEvent, AUDIT_EVENTS } = await import('../utils/auditUtils');
      logFrontendAuditEvent(AUDIT_EVENTS.LOGIN_SUCCESS, {
        category: 'auth',
        severity: 'medium',
        metadata: {
          method: 'google_oauth',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (e) {
      // Silently fail
    }

    return authData;
  } catch (error) {
    console.error('❌ Google login failed');
    console.error('📊 Error details:', {
      message: error.message,
      code: error.code,
      hasResponse: !!error.response,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      responseHeaders: error.response?.headers,
      requestURL: error.config?.url,
      requestMethod: error.config?.method,
      requestData: error.config?.data,
    });

    // Log the full error response body for debugging
    if (error.response?.data) {
      console.error('🔴 Full error response:', JSON.stringify(error.response.data, null, 2));
    }

    throw error;
  }
},

/**
 * Handle Strava OAuth callback
 * @param {string} code - Authorization code from Strava
 * @returns {Promise<Object>} Auth response with token and user
 */
stravaLogin: async (code) => {
  try {
    console.log('🚴 Strava OAuth login initiated');
    console.log('📋 Authorization code:', code?.substring(0, 20) + '...');

    await fetchCsrfCookie();
    console.log('🍪 CSRF cookie fetched');

    const response = await api.post('/auth/strava', { code });

    console.log('✅ Strava login API response:', {
      status: response.status,
      statusText: response.statusText,
      hasData: !!response.data,
      dataKeys: response.data ? Object.keys(response.data) : [],
      fullResponse: response.data
    });

    // Handle different response structures
    let authData;
    if (response.data?.data) {
      authData = response.data.data;
    } else if (response.data?.token) {
      authData = response.data;
    } else {
      console.error('❌ Unexpected response structure:', response.data);
      throw new Error('Invalid response format from server');
    }

    console.log('📦 Extracted auth data:', {
      hasToken: !!authData?.token,
      hasUser: !!authData?.user,
      userName: authData?.user?.name,
      userEmail: authData?.user?.email,
    });

    // Store token
    if (authData?.token) {
      authService.setToken(authData.token);
      console.log('✅ Token stored successfully');
    } else {
      console.error('❌ No token in response');
      throw new Error('No authentication token received');
    }

    // Log Strava login success
    try {
      const { logFrontendAuditEvent, AUDIT_EVENTS } = await import('../utils/auditUtils');
      logFrontendAuditEvent(AUDIT_EVENTS.LOGIN_SUCCESS, {
        category: 'auth',
        severity: 'medium',
        metadata: {
          method: 'strava_oauth',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (e) {
      // Silently fail
    }

    return authData;
  } catch (error) {
    console.error('❌ Strava login failed');
    console.error('📊 Error details:', {
      message: error.message,
      code: error.code,
      hasResponse: !!error.response,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      responseHeaders: error.response?.headers,
      requestURL: error.config?.url,
      requestMethod: error.config?.method,
      requestData: error.config?.data,
    });

    // Log the full error response body for debugging
    if (error.response?.data) {
      console.error('🔴 Full error response:', JSON.stringify(error.response.data, null, 2));
    }

    throw error;
  }
},

/**
   * Elevate user to admin or super admin with secret password
   * @param {string} password - Admin or super admin password
   * @returns {Promise<Object>} Elevation response with new role
   */
  secretElevate: async (password) => {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      console.log('🔐 Attempting privilege elevation');

      const response = await api.post('/auth/secret-elevate', 
        { password }, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('✅ Elevation successful:', response.data.data?.role);

      return response.data;
    } catch (error) {
      console.error('❌ Elevation failed:', error.response?.data?.message || error.message);
      throw error;
    }
  },

  /**
   * Revoke admin/super admin privileges back to buyer
   * @returns {Promise<Object>} Success response
   */
  revokePrivileges: async () => {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      console.log('⬇️ Revoking admin privileges');

      const response = await api.post('/auth/revoke-privileges', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Privileges revoked successfully');

      return response.data;
    } catch (error) {
      console.error('❌ Privilege revocation failed:', error.message);
      throw error;
    }
  },

};

export default authService;