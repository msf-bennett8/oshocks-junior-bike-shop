// ============================================================================
// USE AUDIT HOOK - React hook for audit logging
// ============================================================================

import { useCallback, useEffect } from 'react';
import { 
  logFrontendAuditEvent, 
  getAuditHeaders, 
  AUDIT_EVENTS,
  clearAuditSession 
} from '../utils/auditUtils';

export const useAudit = () => {
  // Log auth events
  const logAuthEvent = useCallback((eventType, metadata = {}) => {
    logFrontendAuditEvent(eventType, {
      category: 'auth',
      severity: ['LOGIN_FAILED', 'LOGIN_FAILURE', 'UNAUTHORIZED_ACCESS', 'PASSWORD_RESET_FAILED'].includes(eventType) ? 'high' : 'medium',
      metadata,
    });
  }, []);

  // Log cart events
  const logCartEvent = useCallback((eventType, metadata = {}) => {
    logFrontendAuditEvent(eventType, {
      category: 'cart',
      severity: 'low',
      metadata,
    });
  }, []);

  // Log checkout events
  const logCheckoutEvent = useCallback((eventType, metadata = {}) => {
    const severity = eventType.includes('ABANDONED') ? 'medium' : 'low';
    logFrontendAuditEvent(eventType, {
      category: 'checkout',
      severity,
      metadata,
    });
  }, []);

  // Log order events
  const logOrderEvent = useCallback((eventType, metadata = {}) => {
    const severity = eventType.includes('FAILED') ? 'high' : 'medium';
    logFrontendAuditEvent(eventType, {
      category: 'order',
      severity,
      metadata,
    });
  }, []);

  // Log wishlist events
  const logWishlistEvent = useCallback((eventType, metadata = {}) => {
    logFrontendAuditEvent(eventType, {
      category: 'wishlist',
      severity: 'low',
      metadata,
    });
  }, []);

  // Log product events
  const logProductEvent = useCallback((eventType, metadata = {}) => {
    logFrontendAuditEvent(eventType, {
      category: 'product',
      severity: 'low',
      metadata,
    });
  }, []);

  // Log error events (404, 500, etc.)
  const logErrorEvent = useCallback((eventType, metadata = {}) => {
    const severityMap = {
      'RESOURCE_ACCESS_DENIED': 'low',      // 404, 401, 403
      'THIRD_PARTY_INTEGRATION_ERROR': 'critical', // 500, 503
      'CLIENT_ERROR_OCCURRED': 'medium',      // React errors
      'PAYMENT_FAILED': 'high',
    };
    
    logFrontendAuditEvent(eventType, {
      category: eventType === 'PAYMENT_FAILED' ? 'financial' : 'system',
      severity: severityMap[eventType] || 'medium',
      metadata,
    });
  }, []);

  // Log security events
  const logSecurityEvent = useCallback((eventType, metadata = {}) => {
    logFrontendAuditEvent(eventType, {
      category: 'security',
      severity: 'high',
      metadata,
    });
  }, []);

  // Log system events (connectivity, cache, etc.)
  const logSystemEvent = useCallback((eventType, metadata = {}) => {
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
    logFrontendAuditEvent(eventData.event_type || eventData.eventType, {
      category: eventData.event_category || eventData.category || 'system',
      severity: eventData.severity || 'low',
      description: eventData.description,
      metadata: eventData.metadata || {},
    });
  }, []);

  // Log page view
  const logPageView = useCallback((page, metadata = {}) => {
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
