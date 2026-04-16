// ============================================================================
// USE AUDIT HOOK - React hook for audit logging
// ============================================================================

import { useCallback, useEffect, useRef } from 'react';
import { 
  logFrontendAuditEvent, 
  getAuditHeaders, 
  AUDIT_EVENTS,
  clearAuditSession 
} from '../utils/auditUtils';

// Track recently logged events to prevent duplicates
const recentLogs = new Set();
const LOG_COOLDOWN = 5000; // 5 seconds

const shouldLog = (eventType, key) => {
  const cacheKey = `${eventType}:${key}`;
  if (recentLogs.has(cacheKey)) {
    return false;
  }
  recentLogs.add(cacheKey);
  setTimeout(() => recentLogs.delete(cacheKey), LOG_COOLDOWN);
  return true;
};

export const useAudit = () => {
  // Log auth events
  const logAuthEvent = useCallback((eventType, metadata = {}) => {
    if (!shouldLog(eventType, metadata.user_id || 'anonymous')) {
      return;
    }
    logFrontendAuditEvent(eventType, {
      category: 'auth',
      severity: ['LOGIN_FAILED', 'LOGIN_FAILURE', 'UNAUTHORIZED_ACCESS', 'PASSWORD_RESET_FAILED'].includes(eventType) ? 'high' : 'medium',
      metadata,
    });
  }, []);

  // Log cart events
  const logCartEvent = useCallback((eventType, metadata = {}) => {
    if (!shouldLog(eventType, metadata.cart_id || 'unknown')) {
      return;
    }
    logFrontendAuditEvent(eventType, {
      category: 'cart',
      severity: 'low',
      metadata,
    });
  }, []);

  // Log checkout events
  const logCheckoutEvent = useCallback((eventType, metadata = {}) => {
    if (!shouldLog(eventType, metadata.cart_id || 'unknown')) {
      return;
    }
    const severity = eventType.includes('ABANDONED') ? 'medium' : 'low';
    logFrontendAuditEvent(eventType, {
      category: 'checkout',
      severity,
      metadata,
    });
  }, []);

  // Log order events
  const logOrderEvent = useCallback((eventType, metadata = {}) => {
    if (!shouldLog(eventType, metadata.order_id || 'unknown')) {
      return;
    }
    const severity = eventType.includes('FAILED') ? 'high' : 'medium';
    logFrontendAuditEvent(eventType, {
      category: 'order',
      severity,
      metadata,
    });
  }, []);

  // Log wishlist events
  const logWishlistEvent = useCallback((eventType, metadata = {}) => {
    if (!shouldLog(eventType, metadata.product_id || 'unknown')) {
      return;
    }
    logFrontendAuditEvent(eventType, {
      category: 'wishlist',
      severity: 'low',
      metadata,
    });
  }, []);

  // Log product events
  const logProductEvent = useCallback((eventType, metadata = {}) => {
    if (!shouldLog(eventType, metadata.product_id || 'unknown')) {
      return;
    }
    logFrontendAuditEvent(eventType, {
      category: 'product',
      severity: 'low',
      metadata,
    });
  }, []);

  // Log error events (404, 500, etc.)
  const logErrorEvent = useCallback((eventType, metadata = {}) => {
    if (!shouldLog(eventType, metadata.resource_id || metadata.error_code || 'unknown')) {
      return;
    }
    const severityMap = {
      'RESOURCE_ACCESS_DENIED': 'low',
      'THIRD_PARTY_INTEGRATION_ERROR': 'critical',
      'CLIENT_ERROR_OCCURRED': 'medium',
      'PAYMENT_FAILED': 'high',
    };
    
    if (metadata.resource_id === 'unknown' || metadata.resource_id === 'undefined') {
      metadata.resource_id = null;
      metadata.resource_id_invalid = true;
    }
    
    logFrontendAuditEvent(eventType, {
      category: eventType === 'PAYMENT_FAILED' ? 'financial' : 'system',
      severity: severityMap[eventType] || 'medium',
      metadata,
    });
  }, []);

  // Log security events
  const logSecurityEvent = useCallback((eventType, metadata = {}) => {
    if (!shouldLog(eventType, metadata.user_id || 'unknown')) {
      return;
    }
    logFrontendAuditEvent(eventType, {
      category: 'security',
      severity: 'high',
      metadata,
    });
  }, []);

  // Log system events (connectivity, cache, etc.)
  const logSystemEvent = useCallback((eventType, metadata = {}) => {
    if (!shouldLog(eventType, 'system')) {
      return;
    }
    const severityMap = {
      'OFFLINE_MODE_DETECTED': 'low',
      'CONNECTIVITY_RESTORED': 'low',
      'CACHE_INVALIDATION': 'low',
      'SEARCH_INDEX_UPDATED': 'low',
      'SESSION_TERMINATED': 'low',
    };
    
    logFrontendAuditEvent(eventType, {
      category: 'system',
      severity: severityMap[eventType] || 'low',
      metadata,
    });
  }, []);

  // Generic audit event logger (for custom events)
  const logAuditEvent = useCallback((eventData) => {
    if (!shouldLog(eventData.event_type || eventData.eventType, eventData.model_id || 'unknown')) {
      return;
    }
    logFrontendAuditEvent(eventData.event_type || eventData.eventType, {
      category: eventData.event_category || eventData.category || 'system',
      severity: eventData.severity || 'low',
      description: eventData.description,
      metadata: eventData.metadata || {},
    });
  }, []);

  // Log page view (deduplicated)
  const logPageView = useCallback((page, metadata = {}) => {
    if (!shouldLog('PAGE_VIEW', page)) {
      return;
    }
    
    logFrontendAuditEvent(AUDIT_EVENTS.PAGE_VIEW, {
      category: 'analytics',
      severity: 'low',
      description: `Page viewed: ${page}`,
      metadata: {
        page,
        ...metadata,
      },
    });
  }, []);

  // Clear audit session on logout
  const clearSession = useCallback(() => {
    clearAuditSession();
  }, []);

  // Get headers for API requests
  const getHeaders = useCallback(() => {
    return getAuditHeaders();
  }, []);

  return {
    logAuthEvent,
    logCartEvent,
    logCheckoutEvent,
    logOrderEvent,
    logWishlistEvent,
    logProductEvent,
    logErrorEvent,
    logSecurityEvent,
    logSystemEvent,
    logAuditEvent,
    logPageView,
    clearSession,
    getHeaders,
    AUDIT_EVENTS,
  };
};

// Hook for tracking page views
export const usePageViewTracking = (pageName) => {
  const { logPageView } = useAudit();

  useEffect(() => {
    logPageView(pageName);
  }, [pageName, logPageView]);
};

export default useAudit;