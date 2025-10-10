import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API base URL - update with your Laravel backend URL
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  // Initialize authentication state on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check if user is authenticated (on app load)
  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setLoading(false);
        return;
      }

      // Verify token with backend
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(response.data.user);
      setIsAuthenticated(true);
      setError(null);
    } catch (err) {
      console.error('Auth check failed:', err);
      logout(); // Clear invalid token
    } finally {
      setLoading(false);
    }
  };

  // Register new user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/auth/register`, {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        password_confirmation: userData.passwordConfirmation,
        phone: userData.phone,
        address: userData.address
      });

      const { token, user: newUser } = response.data;

      // Store token
      localStorage.setItem('authToken', token);

      // Update state
      setUser(newUser);
      setIsAuthenticated(true);

      return { success: true, user: newUser };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/auth/login`, {
        email: credentials.email,
        password: credentials.password
      });

      const { token, user: loggedInUser } = response.data;

      // Store token
      localStorage.setItem('authToken', token);

      // Update state
      setUser(loggedInUser);
      setIsAuthenticated(true);

      return { success: true, user: loggedInUser };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        // Notify backend
        await axios.post(`${API_URL}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear local state regardless of API call success
      localStorage.removeItem('authToken');
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    }
  };

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      const response = await axios.put(`${API_URL}/auth/profile`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      await axios.post(`${API_URL}/auth/change-password`, {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
        new_password_confirmation: passwordData.newPasswordConfirmation
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return { success: true, message: 'Password changed successfully' };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Password change failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Request password reset
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);

      await axios.post(`${API_URL}/auth/forgot-password`, { email });

      return { success: true, message: 'Password reset link sent to your email' };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Request failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Reset password with token
  const resetPassword = async (resetData) => {
    try {
      setLoading(true);
      setError(null);

      await axios.post(`${API_URL}/auth/reset-password`, {
        email: resetData.email,
        token: resetData.token,
        password: resetData.password,
        password_confirmation: resetData.passwordConfirmation
      });

      return { success: true, message: 'Password reset successful' };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Password reset failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Get auth token
  const getToken = () => {
    return localStorage.getItem('authToken');
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    getToken,
    hasRole,
    hasAnyRole,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};