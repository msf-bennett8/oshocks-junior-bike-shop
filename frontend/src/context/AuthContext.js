// frontend/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize authentication state on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check if user is authenticated (on app load)
  const checkAuthStatus = async () => {
    try {
      const token = authService.getToken();
      
      if (!token) {
        setLoading(false);
        return;
      }

      // Verify token with backend
      const data = await authService.getCurrentUser();
      setUser(data.user);
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

      const data = await authService.register(userData);
      
      // Store token
      authService.setToken(data.token);

      // Update state
      setUser(data.user);
      setIsAuthenticated(true);

      return { success: true, user: data.user };
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

      const data = await authService.login(credentials);

      // Store token
      authService.setToken(data.token);

      // Update state
      setUser(data.user);
      setIsAuthenticated(true);

      return { success: true, user: data.user };
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
      const token = authService.getToken();
      
      if (token) {
        // Notify backend
        await authService.logout();
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear local state regardless of API call success
      authService.removeToken();
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

      const data = await authService.updateProfile(updates);
      setUser(data.user);
      
      return { success: true, user: data.user };
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

      await authService.changePassword(passwordData);

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

      await authService.forgotPassword(email);

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

      await authService.resetPassword(resetData);

      return { success: true, message: 'Password reset successful' };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Password reset failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth login
  const googleLogin = async (code) => {
    try {
      setLoading(true);
      setError(null);

      const data = await authService.googleLogin(code);

      // Update state
      setUser(data.user);
      setIsAuthenticated(true);

      return { success: true, user: data.user };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Google login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Handle Strava OAuth login
  const stravaLogin = async (code) => {
    try {
      setLoading(true);
      setError(null);

      const data = await authService.stravaLogin(code);

      // Update state
      setUser(data.user);
      setIsAuthenticated(true);

      return { success: true, user: data.user };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Strava login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
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
    hasRole,
    hasAnyRole,
    checkAuthStatus, 
    googleLogin, 
    stravaLogin 
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