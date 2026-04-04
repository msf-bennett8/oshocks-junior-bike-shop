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
      severity: ['LOGIN_FAILURE', 'UNAUTHORIZED_ACCESS'].includes(eventType) ? 'high' : 'medium',
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
