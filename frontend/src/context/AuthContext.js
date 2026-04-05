// frontend/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import { useDeviceFingerprint } from '../hooks/useDeviceFingerprint';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Device fingerprint for audit logging
  const { fingerprint } = useDeviceFingerprint();
  
  // Role switching state (for super_admin only)
  const [originalRole, setOriginalRole] = useState(null);
  const [switchedRole, setSwitchedRole] = useState(null);

  // Available roles for switching
  const AVAILABLE_ROLES = {
    USER: 'user',
    SELLER: 'seller',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin',
    DELIVERY_AGENT: 'delivery_agent',
    SHOP_ATTENDANT: 'shop_attendant',
    PAYMENT_RECORDER: 'payment_recorder'
  };

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
      const userData = data.user;
      
      setUser(userData);
      setOriginalRole(userData.role);
      setIsAuthenticated(true);
      setError(null);
      
      // Check for saved switched role in localStorage
      const savedSwitchedRole = localStorage.getItem('oshocks_switched_role');
      if (savedSwitchedRole && userData.role === 'super_admin') {
        setSwitchedRole(savedSwitchedRole);
      }
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

    // Support flexible login: use 'login' field or fallback to 'email' for backward compatibility
    const loginData = {
      login: credentials.login || credentials.email,
      password: credentials.password
    };

    const data = await authService.login(loginData);

    // Store token
    authService.setToken(data.token);

    // Update state
    setUser(data.user);
    setIsAuthenticated(true);

    // Trigger merge events for cart and wishlist
    window.dispatchEvent(new StorageEvent('storage', { key: 'authToken' }));
    
    // Small delay to allow contexts to pick up the new auth state
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('userLoggedIn'));
    }, 100);

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
      
      // Log logout event BEFORE clearing state
      try {
        const { logFrontendAuditEvent, AUDIT_EVENTS } = await import('../utils/auditUtils');
        const sessionId = sessionStorage.getItem('x_session_id');
        const sessionStart = sessionStorage.getItem('session_start_time');
        const sessionDuration = sessionStart ? Math.floor((Date.now() - parseInt(sessionStart)) / 1000) : null;
        
        await logFrontendAuditEvent(AUDIT_EVENTS.LOGOUT, {
          category: 'auth',
          severity: 'low',
          metadata: {
            session_id: sessionId,
            session_duration_seconds: sessionDuration,
            logout_reason: 'explicit',
            device_fingerprint: fingerprint,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (e) {
        // Silently fail - don't block logout
      }
      
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
      setOriginalRole(null);
      setSwitchedRole(null);
      localStorage.removeItem('oshocks_switched_role');
      
      // Clear audit session data
      const { clearAuditSession } = await import('../utils/auditUtils');
      clearAuditSession();
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

      // Log Google login success
      try {
        const { logFrontendAuditEvent, AUDIT_EVENTS } = await import('../utils/auditUtils');
        logFrontendAuditEvent(AUDIT_EVENTS.LOGIN_SUCCESS, {
          category: 'auth',
          severity: 'medium',
          metadata: {
            method: 'google_oauth',
            device_fingerprint: fingerprint,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (e) {
        // Silently fail
      }

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

      // Log Strava login success
      try {
        const { logFrontendAuditEvent, AUDIT_EVENTS } = await import('../utils/auditUtils');
        logFrontendAuditEvent(AUDIT_EVENTS.LOGIN_SUCCESS, {
          category: 'auth',
          severity: 'medium',
          metadata: {
            method: 'strava_oauth',
            device_fingerprint: fingerprint,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (e) {
        // Silently fail
      }

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
    const effectiveRole = switchedRole || user?.role;
    return roles.includes(effectiveRole);
  };

  // Role switching for super_admin
  const switchRole = (newRole) => {
    if (originalRole !== 'super_admin') {
      console.warn('Only super_admin can switch roles');
      return false;
    }
    
    if (!Object.values(AVAILABLE_ROLES).includes(newRole)) {
      console.warn('Invalid role:', newRole);
      return false;
    }
    
    setSwitchedRole(newRole);
    
    // Update user object with switched role for UI purposes
    setUser(prev => ({
      ...prev,
      role: newRole,
      isSwitchedRole: true,
      actualRole: originalRole
    }));
    
    // Store in localStorage for persistence
    localStorage.setItem('oshocks_switched_role', newRole);
    return true;
  };

  const resetRole = () => {
    setSwitchedRole(null);
    setUser(prev => ({
      ...prev,
      role: originalRole,
      isSwitchedRole: false,
      actualRole: null
    }));
    localStorage.removeItem('oshocks_switched_role');
  };

  // Get effective role (switched or actual)
  const getEffectiveRole = () => {
    return switchedRole || user?.role;
  };

  // Get user with effective role (for components that need the switched role)
  const getUserWithEffectiveRole = () => {
    if (!user) return null;
    const effectiveRole = getEffectiveRole();
    return {
      ...user,
      role: effectiveRole,
      isSwitchedRole: !!switchedRole,
      actualRole: originalRole
    };
  };

  // Check if current user is super_admin (even if switched)
  const isSuperAdmin = () => {
    return originalRole === 'super_admin';
  };

  // Refresh current user data (useful after role changes)
  const refreshUser = async () => {
    try {
      setLoading(true);
      const data = await authService.getCurrentUser();
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      console.error('Failed to refresh user:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
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
    stravaLogin,
    refreshUser,
    // Role switching
    switchRole,
    resetRole,
    getEffectiveRole,
    getUserWithEffectiveRole,
    isSuperAdmin,
    originalRole,
    switchedRole,
    availableRoles: AVAILABLE_ROLES
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