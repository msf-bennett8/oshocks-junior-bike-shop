// ============================================================================
// AUDIT UTILITIES - Frontend Audit Logging Support
// ============================================================================

import { v4 as uuidv4 } from 'uuid';

// Generate or retrieve correlation ID for request tracing
export const getCorrelationId = () => {
  let correlationId = sessionStorage.getItem('x_correlation_id');
  if (!correlationId) {
    correlationId = uuidv4();
    sessionStorage.setItem('x_correlation_id', correlationId);
  }
  return correlationId;
};

// Generate new correlation ID (for new sessions)
export const generateCorrelationId = () => {
  const correlationId = uuidv4();
  sessionStorage.setItem('x_correlation_id', correlationId);
  return correlationId;
};

// Get or create session ID
export const getSessionId = () => {
  let sessionId = sessionStorage.getItem('x_session_id');
  if (!sessionId) {
    sessionId = uuidv4();
    sessionStorage.setItem('x_session_id', sessionId);
  }
  return sessionId;
};

// Generate request ID (unique per request)
export const generateRequestId = () => {
  return uuidv4();
};

// Get timezone info
export const getTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {
    return 'unknown';
  }
};

// Get screen info
export const getScreenInfo = () => {
  try {
    return `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
  } catch (e) {
    return 'unknown';
  }
};

// Simple canvas fingerprint
export const getCanvasFingerprint = () => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 50;
    
    // Draw something unique
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(0, 0, 200, 50);
    ctx.fillStyle = '#069';
    ctx.fillText('Oshocks Audit v1.0', 10, 20);
    
    return canvas.toDataURL().slice(-50); // Last 50 chars as fingerprint
  } catch (e) {
    return 'unknown';
  }
};

// Get all audit headers for API requests
export const getAuditHeaders = () => {
  return {
    'X-Correlation-ID': getCorrelationId(),
    'X-Session-ID': getSessionId(),
    'X-Request-ID': generateRequestId(),
    'X-Timezone': getTimezone(),
    'X-Screen-Info': getScreenInfo(),
    'X-Canvas-Fingerprint': getCanvasFingerprint(),
  };
};

// Clear audit session data (on logout)
export const clearAuditSession = () => {
  sessionStorage.removeItem('x_correlation_id');
  sessionStorage.removeItem('x_session_id');
};

// Log frontend audit event (send to backend)
export const logFrontendAuditEvent = async (eventType, eventData = {}) => {
  try {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
    const token = localStorage.getItem('authToken');
    
    const payload = {
      event_type: eventType,
      event_category: eventData.category || 'frontend',
      severity: eventData.severity || 'low',
      description: eventData.description || '',
      metadata: {
        ...eventData.metadata,
        user_agent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer,
        timestamp: new Date().toISOString(),
      }
    };

    // Fire and forget - don't block UI
    fetch(`${apiUrl}/audit-logs/frontend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...getAuditHeaders(),
      },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // Silently fail - audit should never break functionality
    });
  } catch (e) {
    // Silently fail
  }
};

// Predefined audit event types (aligned with backend)
export const AUDIT_EVENTS = {
  // Auth events
  LOGIN_ATTEMPT: 'LOGIN_ATTEMPT',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_ATTEMPT: 'REGISTER_ATTEMPT',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  
  // Cart events
  CART_ITEM_ADDED: 'CART_ITEM_ADDED',
  CART_ITEM_REMOVED: 'CART_ITEM_REMOVED',
  CART_CLEARED: 'CART_CLEARED',
  CART_ABANDONED: 'CART_ABANDONED',
  
  // Checkout events
  CHECKOUT_STARTED: 'CHECKOUT_STARTED',
  CHECKOUT_STEP_SHIPPING: 'CHECKOUT_STEP_SHIPPING',
  CHECKOUT_STEP_PAYMENT: 'CHECKOUT_STEP_PAYMENT',
  CHECKOUT_COMPLETED: 'CHECKOUT_COMPLETED',
  CHECKOUT_ABANDONED: 'CHECKOUT_ABANDONED',
  
  // Order events
  ORDER_CREATED: 'ORDER_CREATED',
  ORDER_PAYMENT_INITIATED: 'ORDER_PAYMENT_INITIATED',
  ORDER_PAYMENT_SUCCESS: 'ORDER_PAYMENT_SUCCESS',
  ORDER_PAYMENT_FAILED: 'ORDER_PAYMENT_FAILED',
  
  // Wishlist events
  WISHLIST_ITEM_ADDED: 'WISHLIST_ITEM_ADDED',
  WISHLIST_ITEM_REMOVED: 'WISHLIST_ITEM_REMOVED',
  
  // Product events
  PRODUCT_VIEWED: 'PRODUCT_VIEWED',
  PRODUCT_SEARCH: 'PRODUCT_SEARCH',
  
  // Navigation events
  PAGE_VIEW: 'PAGE_VIEW',
  NAVIGATION_ERROR: 'NAVIGATION_ERROR',
};

export default {
  getCorrelationId,
  generateCorrelationId,
  getSessionId,
  generateRequestId,
  getTimezone,
  getScreenInfo,
  getCanvasFingerprint,
  getAuditHeaders,
  clearAuditSession,
  logFrontendAuditEvent,
  AUDIT_EVENTS,
};
