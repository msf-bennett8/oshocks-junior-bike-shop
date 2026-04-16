// ============================================================================
// AUDIT UTILITIES - Frontend Audit Logging Support
// ============================================================================

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// SERVICE HEALTH TRACKING - For THIRD_PARTY_INTEGRATION_RECOVERY detection
// ============================================================================

const serviceHealth = {
  lastError: {},
  consecutiveSuccesses: {},
  
  recordError(serviceName) {
    this.lastError[serviceName] = Date.now();
    this.consecutiveSuccesses[serviceName] = 0;
  },
  
  recordSuccess(serviceName) {
    if (!this.consecutiveSuccesses[serviceName]) {
      this.consecutiveSuccesses[serviceName] = 0;
    }
    this.consecutiveSuccesses[serviceName]++;
    
    // Detect recovery after 3 consecutive successes following an error
    if (this.consecutiveSuccesses[serviceName] === 3 && this.lastError[serviceName]) {
      const downtime = Math.floor((Date.now() - this.lastError[serviceName]) / 1000);
      logIntegrationRecovery(serviceName, downtime);
      delete this.lastError[serviceName];
    }
  }
};

// ============================================================================
// EVENT METADATA MAPPINGS - Aligned with backend specification
// ============================================================================

const EVENT_SEVERITY = {
  // Phase 5: API & Integrations
  THIRD_PARTY_INTEGRATION_ERROR: 'high',
  THIRD_PARTY_INTEGRATION_RECOVERY: 'medium',
  WEBHOOK_SUBSCRIPTION_CREATED: 'low',
  WEBHOOK_DELIVERED: 'low',
  WEBHOOK_FAILED: 'high',
  WEBHOOK_RETRY_SCHEDULED: 'medium',
  WEBHOOK_DISABLED: 'high',
  API_REQUEST_RECEIVED: 'low',
  API_RATE_LIMIT_TRIGGERED: 'medium',
  
  // Phase 1: Auth
  LOGIN_SUCCESS: 'medium',
  LOGIN_FAILED: 'high',
  LOGOUT: 'low',
  SESSION_REVOKED: 'high',
  PASSWORD_CHANGED: 'medium',
  PASSWORD_RESET_REQUESTED: 'medium',
  PASSWORD_RESET_COMPLETED: 'medium',
  PASSWORD_RESET_FAILED: 'high',
  
  // Phase 2: Financial
  PAYMENT_INTENT_CREATED: 'medium',
  PAYMENT_SUCCESSFUL: 'medium',
  PAYMENT_FAILED: 'high',
  PAYMENT_RETRIED: 'medium',
  ORDER_PLACED: 'medium',
  ORDER_FAILED: 'high',
};

const EVENT_CATEGORIES = {
  // Phase 5: API & Integrations
  THIRD_PARTY_INTEGRATION_ERROR: 'api',
  THIRD_PARTY_INTEGRATION_RECOVERY: 'api',
  WEBHOOK_SUBSCRIPTION_CREATED: 'api',
  WEBHOOK_DELIVERED: 'api',
  WEBHOOK_FAILED: 'api',
  WEBHOOK_RETRY_SCHEDULED: 'api',
  WEBHOOK_DISABLED: 'api',
  API_REQUEST_RECEIVED: 'api',
  API_RATE_LIMIT_TRIGGERED: 'api',
  
  // Phase 1: Auth
  LOGIN_SUCCESS: 'security',
  LOGIN_FAILED: 'security',
  LOGOUT: 'security',
  
  // Phase 2: Order/Financial
  PAYMENT_INTENT_CREATED: 'financial',
  PAYMENT_SUCCESSFUL: 'financial',
  PAYMENT_FAILED: 'financial',
  ORDER_PLACED: 'order',
  ORDER_FAILED: 'order',
};

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

// Sampling rates by event category
const SAMPLING_RATES = {
    'frontend': 1.0,      // 100% - always log
    'auth': 1.0,          // 100% - always log
    'cart': 1.0,          // 100% - always log
    'checkout': 1.0,      // 100% - always log
    'order': 1.0,         // 100% - always log
    'wishlist': 0.5,      // 50% - sample half
    'product': 0.1,       // 10% - sample 10%
    'analytics': 0.05,    // 5% - sample 5%
};

// ============================================================================
// BATCH QUEUE FOR HIGH-VOLUME EVENTS
// ============================================================================

class AuditBatchQueue {
  constructor() {
    this.queue = [];
    this.flushInterval = 5000; // 5 seconds
    this.maxBatchSize = 50;
    this.flushTimer = null;
    this.startFlushTimer();
  }

  enqueue(event) {
    this.queue.push(event);
    
    // Auto-flush if batch size reached
    if (this.queue.length >= this.maxBatchSize) {
      this.flush();
    }
  }

  startFlushTimer() {
    this.flushTimer = setInterval(() => this.flush(), this.flushInterval);
  }

  async flush() {
    if (this.queue.length === 0) return;
    
    const batch = this.queue.splice(0, this.maxBatchSize);
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
      const token = localStorage.getItem('authToken');
      
      // Send batch to backend audit endpoint
      fetch(`${apiUrl}/audit-logs/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ events: batch }), // Backend now accepts both 'events' and 'logs'
        keepalive: true,
      }).catch(() => {});
    } catch (error) {
      // Silent fail - audit should not break app
      
      // Re-queue for retry (limited attempts)
      if (batch[0].retryAttempt < 3) {
        batch.forEach(e => {
          e.retryAttempt = (e.retryAttempt || 0) + 1;
          this.queue.unshift(e);
        });
      }
    }
  }

  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flush(); // Final flush
    }
  }
}

// Global batch queue instance
const auditQueue = new AuditBatchQueue();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    auditQueue.destroy();
  });
}

// Event categories (aligned with backend)
export const CATEGORIES = {
  SECURITY: 'security',
  ORDER: 'order',
  FINANCIAL: 'financial',
  USER: 'user',
  ADMIN: 'admin',
  API: 'api',
  SYSTEM: 'system',
  NOTIFICATION: 'notification',
  MARKETING: 'marketing',
  BUSINESS: 'business',
  PRIVACY: 'privacy',
  LOYALTY: 'loyalty',
  PRODUCT: 'product',
  REVIEW: 'review',
  FRONTEND: 'frontend',
  AUTH: 'auth',
  CART: 'cart',
  CHECKOUT: 'checkout',
  WISHLIST: 'wishlist',
  ANALYTICS: 'analytics',
};

// Check if event should be sampled
const shouldSample = (category) => {
    const rate = SAMPLING_RATES[category] ?? 1.0;
    return Math.random() < rate;
};

// Log frontend audit event (send to backend)
export const logFrontendAuditEvent = async (eventType, eventData = {}) => {
  const category = eventData.category || EVENT_CATEGORIES[eventType] || 'frontend';
  
  // Apply sampling for high-volume events
  if (!shouldSample(category)) {
    return; // Skip this event due to sampling
  }
  
  try {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
    const token = localStorage.getItem('authToken');
    
    // Build event payload per backend specification
    const payload = {
      event_type: eventType,
      event_category: category,
      severity: eventData.severity || EVENT_SEVERITY[eventType] || 'low',
      actor_type: eventData.actor_type || 'user',
      description: eventData.description || '',
      correlation_id: getCorrelationId(),
      session_id: getSessionId(),
      user_agent: navigator.userAgent,
      ip_address: window.clientIp || null, // Set by backend on first request
      device_fingerprint: getCanvasFingerprint(),
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      metadata: {
        url: window.location.href,
        referrer: document.referrer,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        ...eventData.metadata
      }
    };

    // Add user_id if authenticated
    if (token) {
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        payload.user_id = tokenPayload.sub || tokenPayload.user_id || null;
      } catch (e) {
        // Invalid token format
      }
    }

    // Use batching for non-critical events, immediate for critical
    const isCritical = payload.severity === 'critical' || payload.severity === 'high';
    if (isCritical || eventData.immediate) {
      // Send immediately for critical events
      fetch(`${apiUrl}/audit-logs/frontend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...getAuditHeaders(),
        },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    } else {
      // Queue for batching
      auditQueue.enqueue(payload);
    }
  } catch (e) {
    // Silently fail
  }
};

// Predefined audit event types (aligned with backend - ALL 158 EVENTS)
export const AUDIT_EVENTS = {
  // ==========================================
  // PHASE 1: AUTH & SECURITY (14 events)
  // ==========================================
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',
  SESSION_REVOKED: 'SESSION_REVOKED',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  PASSWORD_RESET_REQUESTED: 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_COMPLETED: 'PASSWORD_RESET_COMPLETED',
  PASSWORD_RESET_FAILED: 'PASSWORD_RESET_FAILED',
  TWO_FACTOR_ENABLED: 'TWO_FACTOR_ENABLED',
  TWO_FACTOR_DISABLED: 'TWO_FACTOR_DISABLED',
  TWO_FACTOR_CHALLENGE: 'TWO_FACTOR_CHALLENGE',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED: 'ACCOUNT_UNLOCKED',
  SUSPICIOUS_ACTIVITY_DETECTED: 'SUSPICIOUS_ACTIVITY_DETECTED',
  
  // ==========================================
  // PHASE 2: ORDER LIFECYCLE (35 events)
  // ==========================================
  CART_CREATED: 'CART_CREATED',
  CART_ITEM_ADDED: 'CART_ITEM_ADDED',
  CART_ITEM_REMOVED: 'CART_ITEM_REMOVED',
  CART_ABANDONED: 'CART_ABANDONED',
  CHECKOUT_STEP_STARTED: 'CHECKOUT_STEP_STARTED',
  CHECKOUT_STEP_COMPLETED: 'CHECKOUT_STEP_COMPLETED',
  CHECKOUT_STEP_ABANDONED: 'CHECKOUT_STEP_ABANDONED',
  INVENTORY_RESERVED: 'INVENTORY_RESERVED',
  INVENTORY_RESERVATION_EXPIRED: 'INVENTORY_RESERVATION_EXPIRED',
  INVENTORY_RELEASED: 'INVENTORY_RELEASED',
  ORDER_PLACED: 'ORDER_PLACED',
  ORDER_FAILED: 'ORDER_FAILED',
  ORDER_PAYMENT_PENDING: 'ORDER_PAYMENT_PENDING',
  ORDER_PAYMENT_PROCESSING: 'ORDER_PAYMENT_PROCESSING',
  ORDER_STATUS_CHANGED: 'ORDER_STATUS_CHANGED',
  ORDER_SHIPPED: 'ORDER_SHIPPED',
  ORDER_DELIVERED: 'ORDER_DELIVERED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  ORDER_RETURN_REQUESTED: 'ORDER_RETURN_REQUESTED',
  ORDER_RETURN_APPROVED: 'ORDER_RETURN_APPROVED',
  ORDER_RETURN_RECEIVED: 'ORDER_RETURN_RECEIVED',
  ORDER_RETURN_COMPLETED: 'ORDER_RETURN_COMPLETED',
  PAYMENT_METHOD_ADDED: 'PAYMENT_METHOD_ADDED',
  PAYMENT_METHOD_REMOVED: 'PAYMENT_METHOD_REMOVED',
  PAYMENT_METHOD_DEFAULT_CHANGED: 'PAYMENT_METHOD_DEFAULT_CHANGED',
  PAYMENT_INTENT_CREATED: 'PAYMENT_INTENT_CREATED',
  PAYMENT_SUCCESSFUL: 'PAYMENT_SUCCESSFUL',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_RETRIED: 'PAYMENT_RETRIED',
  PAYMENT_DISPUTE_OPENED: 'PAYMENT_DISPUTE_OPENED',
  PAYMENT_DISPUTE_UPDATED: 'PAYMENT_DISPUTE_UPDATED',
  PAYMENT_DISPUTE_RESOLVED: 'PAYMENT_DISPUTE_RESOLVED',
  CHARGEBACK_RECEIVED: 'CHARGEBACK_RECEIVED',
  CHARGEBACK_CONTESTED: 'CHARGEBACK_CONTESTED',
  CHARGEBACK_RESOLVED: 'CHARGEBACK_RESOLVED',
  REFUND_REQUESTED: 'REFUND_REQUESTED',
  REFUND_PROCESSED: 'REFUND_PROCESSED',
  PARTIAL_REFUND_PROCESSED: 'PARTIAL_REFUND_PROCESSED',
  REFUND_REJECTED: 'REFUND_REJECTED',
  POINTS_EARNED: 'POINTS_EARNED',
  POINTS_REDEEMED: 'POINTS_REDEEMED',
  POINTS_EXPIRED: 'POINTS_EXPIRED',
  POINTS_ADJUSTED: 'POINTS_ADJUSTED',
  
  // ==========================================
  // PHASE 3: ADMIN & SYSTEM CONTROL (14 events)
  // ==========================================
  USER_ROLE_CHANGED: 'USER_ROLE_CHANGED',
  PERMISSIONS_UPDATED: 'PERMISSIONS_UPDATED',
  ADMIN_IMPERSONATION_STARTED: 'ADMIN_IMPERSONATION_STARTED',
  ADMIN_IMPERSONATION_ENDED: 'ADMIN_IMPERSONATION_ENDED',
  PRODUCT_CREATED: 'PRODUCT_CREATED',
  PRODUCT_UPDATED: 'PRODUCT_UPDATED',
  PRODUCT_DELETED: 'PRODUCT_DELETED',
  PRODUCT_PRICE_MODIFIED: 'PRODUCT_PRICE_MODIFIED',
  BULK_PRODUCT_PRICE_UPDATED: 'BULK_PRODUCT_PRICE_UPDATED',
  INVENTORY_UPDATED: 'INVENTORY_UPDATED',
  INVENTORY_AUTO_ADJUSTED: 'INVENTORY_AUTO_ADJUSTED',
  INVENTORY_LOW_THRESHOLD_TRIGGERED: 'INVENTORY_LOW_THRESHOLD_TRIGGERED',
  INVENTORY_TRANSFER_INITIATED: 'INVENTORY_TRANSFER_INITIATED',
  INVENTORY_TRANSFER_COMPLETED: 'INVENTORY_TRANSFER_COMPLETED',
  ORDER_STATUS_MANUALLY_CHANGED: 'ORDER_STATUS_MANUALLY_CHANGED',
  
  // ==========================================
  // PHASE 4: USER DATA & COMPLIANCE (20 events)
  // ==========================================
  ACCOUNT_CREATED: 'ACCOUNT_CREATED',
  EMAIL_VERIFICATION_SENT: 'EMAIL_VERIFICATION_SENT',
  EMAIL_VERIFIED: 'EMAIL_VERIFIED',
  PROFILE_UPDATED: 'PROFILE_UPDATED',
  EMAIL_CHANGED: 'EMAIL_CHANGED',
  PHONE_CHANGED: 'PHONE_CHANGED',
  ADDRESS_ADDED: 'ADDRESS_ADDED',
  ADDRESS_UPDATED: 'ADDRESS_UPDATED',
  ADDRESS_DELETED: 'ADDRESS_DELETED',
  ACCOUNT_DEACTIVATED: 'ACCOUNT_DEACTIVATED',
  ACCOUNT_REACTIVATED: 'ACCOUNT_REACTIVATED',
  ACCOUNT_DELETED: 'ACCOUNT_DELETED',
  DATA_ANONYMIZED: 'DATA_ANONYMIZED',
  DATA_EXPORT_REQUESTED: 'DATA_EXPORT_REQUESTED',
  DATA_EXPORT_GENERATED: 'DATA_EXPORT_GENERATED',
  DATA_EXPORT_DOWNLOADED: 'DATA_EXPORT_DOWNLOADED',
  DATA_EXPORT_EXPIRED: 'DATA_EXPORT_EXPIRED',
  CONSENT_GIVEN: 'CONSENT_GIVEN',
  CONSENT_WITHDRAWN: 'CONSENT_WITHDRAWN',
  CONSENT_PREFERENCES_EXPORTED: 'CONSENT_PREFERENCES_EXPORTED',
  PRIVACY_REQUEST_RECEIVED: 'PRIVACY_REQUEST_RECEIVED',
  PRIVACY_REQUEST_ACKNOWLEDGED: 'PRIVACY_REQUEST_ACKNOWLEDGED',
  PRIVACY_REQUEST_FULFILLED: 'PRIVACY_REQUEST_FULFILLED',
  PRIVACY_REQUEST_REJECTED: 'PRIVACY_REQUEST_REJECTED',
  DATA_TRANSFERRED_CROSS_BORDER: 'DATA_TRANSFERRED_CROSS_BORDER',
  AUTOMATED_DECISION_MADE: 'AUTOMATED_DECISION_MADE',
  AUTOMATED_DECISION_CONTESTED: 'AUTOMATED_DECISION_CONTESTED',
  AUTOMATED_DECISION_REVIEWED: 'AUTOMATED_DECISION_REVIEWED',
  
  // ==========================================
  // PHASE 5: API & INTEGRATIONS (12 events)
  // ==========================================
  API_KEY_CREATED: 'API_KEY_CREATED',
  API_KEY_ROTATED: 'API_KEY_ROTATED',
  API_KEY_REVOKED: 'API_KEY_REVOKED',
  API_REQUEST_RECEIVED: 'API_REQUEST_RECEIVED',
  API_RATE_LIMIT_TRIGGERED: 'API_RATE_LIMIT_TRIGGERED',
  WEBHOOK_SUBSCRIPTION_CREATED: 'WEBHOOK_SUBSCRIPTION_CREATED',
  WEBHOOK_DELIVERED: 'WEBHOOK_DELIVERED',
  WEBHOOK_FAILED: 'WEBHOOK_FAILED',
  WEBHOOK_RETRY_SCHEDULED: 'WEBHOOK_RETRY_SCHEDULED',
  WEBHOOK_DISABLED: 'WEBHOOK_DISABLED',
  THIRD_PARTY_INTEGRATION_ERROR: 'THIRD_PARTY_INTEGRATION_ERROR',
  THIRD_PARTY_INTEGRATION_RECOVERY: 'THIRD_PARTY_INTEGRATION_RECOVERY',
  
  // ==========================================
  // PHASE 6: SYSTEM HEALTH (11 events)
  // ==========================================
  DATABASE_BACKUP_STARTED: 'DATABASE_BACKUP_STARTED',
  DATABASE_BACKUP_COMPLETED: 'DATABASE_BACKUP_COMPLETED',
  DATABASE_BACKUP_FAILED: 'DATABASE_BACKUP_FAILED',
  DATABASE_RESTORE_REQUESTED: 'DATABASE_RESTORE_REQUESTED',
  DATABASE_RESTORE_COMPLETED: 'DATABASE_RESTORE_COMPLETED',
  SCHEDULED_JOB_STARTED: 'SCHEDULED_JOB_STARTED',
  SCHEDULED_JOB_COMPLETED: 'SCHEDULED_JOB_COMPLETED',
  SCHEDULED_JOB_FAILED: 'SCHEDULED_JOB_FAILED',
  SCHEDULED_JOB_TIMEOUT: 'SCHEDULED_JOB_TIMEOUT',
  CACHE_INVALIDATION: 'CACHE_INVALIDATION',
  CACHE_WARMUP_COMPLETED: 'CACHE_WARMUP_COMPLETED',
  SEARCH_INDEX_UPDATED: 'SEARCH_INDEX_UPDATED',
  
  // ==========================================
  // PHASE 7: SECURITY MONITORING (11 events)
  // ==========================================
  RESOURCE_ACCESSED: 'RESOURCE_ACCESSED',
  RESOURCE_ACCESS_DENIED: 'RESOURCE_ACCESS_DENIED',
  PRIVILEGED_QUERY_EXECUTED: 'PRIVILEGED_QUERY_EXECUTED',
  PRIVILEGED_QUERY_BLOCKED: 'PRIVILEGED_QUERY_BLOCKED',
  VELOCITY_CHECK_TRIGGERED: 'VELOCITY_CHECK_TRIGGERED',
  DEVICE_FINGERPRINT_CREATED: 'DEVICE_FINGERPRINT_CREATED',
  DEVICE_FINGERPRINT_MISMATCH: 'DEVICE_FINGERPRINT_MISMATCH',
  DEVICE_TRUSTED: 'DEVICE_TRUSTED',
  SUSPICIOUS_IP_DETECTED: 'SUSPICIOUS_IP_DETECTED',
  GEOLOCATION_ANOMALY: 'GEOLOCATION_ANOMALY',
  DATA_EXFILTRATION_ATTEMPT: 'DATA_EXFILTRATION_ATTEMPT',
  
  // ==========================================
  // PHASE 8: NOTIFICATIONS (14 events)
  // ==========================================
  NOTIFICATION_CREATED: 'NOTIFICATION_CREATED',
  NOTIFICATION_SENT: 'NOTIFICATION_SENT',
  NOTIFICATION_DELIVERED: 'NOTIFICATION_DELIVERED',
  NOTIFICATION_OPENED: 'NOTIFICATION_OPENED',
  NOTIFICATION_CLICKED: 'NOTIFICATION_CLICKED',
  NOTIFICATION_DELETED: 'NOTIFICATION_DELETED',
  NOTIFICATION_BULK_DELETED: 'NOTIFICATION_BULK_DELETED',
  NOTIFICATION_ARCHIVED: 'NOTIFICATION_ARCHIVED',
  NOTIFICATION_UNARCHIVED: 'NOTIFICATION_UNARCHIVED',
  NOTIFICATION_SETTINGS_CHANGED: 'NOTIFICATION_SETTINGS_CHANGED',
  CHANNEL_PREFERENCES_UPDATED: 'CHANNEL_PREFERENCES_UPDATED',
  QUIET_HOURS_TOGGLED: 'QUIET_HOURS_TOGGLED',
  DESKTOP_NOTIFICATIONS_TOGGLED: 'DESKTOP_NOTIFICATIONS_TOGGLED',
  
  // ==========================================
  // PHASE 9: MARKETING & COMMUNICATIONS (12 events)
  // ==========================================
  MARKETING_EMAIL_SENT: 'MARKETING_EMAIL_SENT',
  MARKETING_EMAIL_DELIVERED: 'MARKETING_EMAIL_DELIVERED',
  MARKETING_EMAIL_OPENED: 'MARKETING_EMAIL_OPENED',
  MARKETING_EMAIL_CLICKED: 'MARKETING_EMAIL_CLICKED',
  MARKETING_EMAIL_BOUNCED: 'MARKETING_EMAIL_BOUNCED',
  MARKETING_EMAIL_COMPLAINED: 'MARKETING_EMAIL_COMPLAINED',
  MARKETING_EMAIL_UNSUBSCRIBED: 'MARKETING_EMAIL_UNSUBSCRIBED',
  SMS_DELIVERED: 'SMS_DELIVERED',
  SMS_FAILED: 'SMS_FAILED',
  PUSH_NOTIFICATION_SENT: 'PUSH_NOTIFICATION_SENT',
  PUSH_NOTIFICATION_DELIVERED: 'PUSH_NOTIFICATION_DELIVERED',
  
  // ==========================================
  // PHASE 10: BUSINESS OPERATIONS (15 events)
  // ==========================================
  SERVICE_BOOKED: 'SERVICE_BOOKED',
  SERVICE_RESCHEDULED: 'SERVICE_RESCHEDULED',
  SERVICE_COMPLETED: 'SERVICE_COMPLETED',
  SERVICE_CANCELLED: 'SERVICE_CANCELLED',
  SERVICE_NO_SHOW: 'SERVICE_NO_SHOW',
  REVIEW_SUBMITTED: 'REVIEW_SUBMITTED',
  REVIEW_MODERATED: 'REVIEW_MODERATED',
  REVIEW_EDITED: 'REVIEW_EDITED',
  REVIEW_DELETED: 'REVIEW_DELETED',
  REVIEW_HELPFUL_MARKED: 'REVIEW_HELPFUL_MARKED',
  LOYALTY_TIER_CHANGED: 'LOYALTY_TIER_CHANGED',
  REFERRAL_CODE_GENERATED: 'REFERRAL_CODE_GENERATED',
  REFERRAL_COMPLETED: 'REFERRAL_COMPLETED',
  WISHLIST_ITEM_ADDED: 'WISHLIST_ITEM_ADDED',
  WISHLIST_ITEM_REMOVED: 'WISHLIST_ITEM_REMOVED',
  PRODUCT_VIEWED: 'PRODUCT_VIEWED',
};

// ============================================================================
// API ERROR LOGGING HELPERS (Phase 5: API & Integrations)
// ============================================================================

/**
 * Determine service name from API URL
 * @param {string} url - API endpoint URL
 * @returns {string} Service name
 */
export const determineServiceName = (url) => {
  if (url.includes('/auth/')) return 'auth_service';
  if (url.includes('/payments/')) return 'payment_service';
  if (url.includes('/orders/')) return 'order_service';
  if (url.includes('/products/')) return 'product_service';
  if (url.includes('/audit-logs/')) return 'audit_service';
  if (url.includes('/webhooks/')) return 'webhook_service';
  return 'api_gateway';
};

/**
 * Sanitize request data to remove sensitive fields
 * @param {Object} data - Request data
 * @returns {Object} Sanitized data
 */
export const sanitizeRequestData = (data) => {
  if (!data) return null;
  
  // Remove sensitive fields
  const sensitive = ['password', 'token', 'credit_card', 'cvv', 'authorization_code', 'card_number', 'expiry_date'];
  const sanitized = { ...data };
  
  sensitive.forEach(field => {
    if (sanitized[field]) sanitized[field] = '[REDACTED]';
  });
  
  return sanitized;
};

/**
 * Log third-party integration error (THIRD_PARTY_INTEGRATION_ERROR)
 * @param {Error} error - Axios error object
 * @param {Object} context - Additional context
 */
export const logIntegrationError = (error, context = {}) => {
  const isNetworkError = !error.response;
  const statusCode = error.response?.status;
  
  // Determine impact level per backend spec
  let impactLevel = 'low';
  if (isNetworkError || statusCode >= 500) impactLevel = 'high';
  else if (statusCode === 429) impactLevel = 'medium';
  
  // Determine service name from URL
  const url = error.config?.url || '';
  const serviceName = context.service_name || determineServiceName(url);

  // Record for health tracking
  serviceHealth.recordError(serviceName);

  logFrontendAuditEvent(AUDIT_EVENTS.THIRD_PARTY_INTEGRATION_ERROR, {
    severity: impactLevel === 'high' ? 'high' : 'medium',
    metadata: {
      service_name: serviceName,
      error_code: isNetworkError ? 'NETWORK_ERROR' : `HTTP_${statusCode}`,
      error_message: error.message,
      impact_level: impactLevel,
      endpoint: url,
      method: error.config?.method?.toUpperCase(),
      request_data: sanitizeRequestData(error.config?.data),
      response_data: error.response?.data,
      correlation_id: error.config?.headers?.['X-Correlation-ID'],
      retry_attempt: context.retryAttempt || 0,
      downtime_duration_seconds: context.downtimeDuration || null,
      context: context.context || null,
    }
  });
};

/**
 * Log integration recovery (THIRD_PARTY_INTEGRATION_RECOVERY)
 * @param {string} serviceName - Name of recovered service
 * @param {number} downtimeDuration - Downtime in seconds
 */
export const logIntegrationRecovery = (serviceName, downtimeDuration) => {
  logFrontendAuditEvent(AUDIT_EVENTS.THIRD_PARTY_INTEGRATION_RECOVERY, {
    severity: 'medium',
    metadata: {
      service_name: serviceName,
      downtime_duration: downtimeDuration,
      recovery_detected_at: new Date().toISOString(),
    }
  });
};

/**
 * Log API retry attempt (WEBHOOK_RETRY_SCHEDULED equivalent)
 * @param {string} endpoint - API endpoint
 * @param {number} attemptNumber - Current retry attempt
 * @param {number} maxAttempts - Maximum retry attempts
 * @param {number} nextRetryDelayMs - Delay before next retry
 */
export const logApiRetry = (endpoint, attemptNumber, maxAttempts, nextRetryDelayMs) => {
  logFrontendAuditEvent(AUDIT_EVENTS.WEBHOOK_RETRY_SCHEDULED, {
    severity: 'medium',
    metadata: {
      endpoint,
      attempt_number: attemptNumber,
      max_attempts: maxAttempts,
      next_retry_delay_ms: nextRetryDelayMs,
      will_retry: attemptNumber < maxAttempts,
    }
  });
};

/**
 * Record service success for health tracking
 * @param {string} url - API URL
 */
export const recordServiceSuccess = (url) => {
  const serviceName = determineServiceName(url);
  serviceHealth.recordSuccess(serviceName);
};

// Helper to sanitize resource IDs before logging
export const sanitizeResourceId = (id) => {
  if (!id || id === 'unknown' || id === 'null' || id === 'undefined' || id === '') {
    return null;
  }
  if (typeof id === 'string' && id.length > 64) {
    return id.substring(0, 32);
  }
  return id;
};

// Log impersonation action during impersonation session
export const logImpersonationAction = async (action, details = {}) => {
  try {
    const impersonationData = JSON.parse(sessionStorage.getItem('impersonation_data') || '{}');
    
    if (!impersonationData.target_user_id) {
      return; // Not in impersonation mode
    }

    // Store action in session for summary
    const actions = JSON.parse(sessionStorage.getItem('impersonation_actions') || '[]');
    actions.push({
      action,
      details,
      timestamp: new Date().toISOString(),
    });
    sessionStorage.setItem('impersonation_actions', JSON.stringify(actions));

    // Log the specific action as resource accessed
    await logFrontendAuditEvent(AUDIT_EVENTS.RESOURCE_ACCESSED, {
      category: 'admin',
      severity: 'medium',
      metadata: {
        impersonation_token: impersonationData.impersonation_token,
        target_user_id: impersonationData.target_user_id,
        action_performed: action,
        action_details: details,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (e) {
    // Silently fail
  }
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
  CATEGORIES,
  logImpersonationAction,
  logIntegrationError,
  logIntegrationRecovery,
  logApiRetry,
  determineServiceName,
  sanitizeRequestData,
  recordServiceSuccess,
};
