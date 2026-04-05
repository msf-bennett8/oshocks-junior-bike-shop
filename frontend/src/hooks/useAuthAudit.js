// ============================================================================
// USE AUTH AUDIT HOOK - Specialized hook for authentication audit events
// ============================================================================

import { useCallback } from 'react';
import { logFrontendAuditEvent, AUDIT_EVENTS } from '../utils/auditUtils';
import { useDeviceFingerprint } from './useDeviceFingerprint';

export const useAuthAudit = () => {
  const { fingerprint } = useDeviceFingerprint();

  // Generic auth event logger with fingerprint auto-included
  const logAuthEvent = useCallback((eventType, metadata = {}, severity = 'medium') => {
    return logFrontendAuditEvent(eventType, {
      category: 'auth',
      severity,
      metadata: {
        ...metadata,
        device_fingerprint: fingerprint,
        timestamp: new Date().toISOString(),
      },
    });
  }, [fingerprint]);

  // Specific event loggers
  const logLoginSuccess = useCallback((method = 'password', additionalMetadata = {}) => {
    return logAuthEvent(AUDIT_EVENTS.LOGIN_SUCCESS, {
      method,
      ...additionalMetadata,
    }, 'medium');
  }, [logAuthEvent]);

  const logLoginFailed = useCallback((identifierAttempted, failureReason, failureCount, additionalMetadata = {}) => {
    const severity = failureCount >= 3 ? 'critical' : 'high';
    return logAuthEvent(AUDIT_EVENTS.LOGIN_FAILED, {
      identifier_attempted: identifierAttempted,
      failure_reason: failureReason,
      failure_count: failureCount,
      ...additionalMetadata,
    }, severity);
  }, [logAuthEvent]);

  const logLogout = useCallback((sessionDurationSeconds, logoutReason = 'explicit', additionalMetadata = {}) => {
    return logAuthEvent(AUDIT_EVENTS.LOGOUT, {
      session_duration_seconds: sessionDurationSeconds,
      logout_reason: logoutReason,
      ...additionalMetadata,
    }, 'low');
  }, [logAuthEvent]);

  const logPasswordResetRequested = useCallback((identifierAttempted, deliveryMethod = 'email', additionalMetadata = {}) => {
    return logAuthEvent(AUDIT_EVENTS.PASSWORD_RESET_REQUESTED, {
      identifier_attempted: identifierAttempted,
      delivery_method: deliveryMethod,
      ...additionalMetadata,
    }, 'medium');
  }, [logAuthEvent]);

  const logPasswordResetCompleted = useCallback((resetMethod = 'token', additionalMetadata = {}) => {
    return logAuthEvent(AUDIT_EVENTS.PASSWORD_RESET_COMPLETED, {
      reset_method: resetMethod,
      ...additionalMetadata,
    }, 'medium');
  }, [logAuthEvent]);

  const logPasswordResetFailed = useCallback((failureReason, additionalMetadata = {}) => {
    return logAuthEvent(AUDIT_EVENTS.PASSWORD_RESET_FAILED, {
      failure_reason: failureReason,
      ...additionalMetadata,
    }, 'high');
  }, [logAuthEvent]);

  const logSuspiciousActivity = useCallback((activityType, riskScore, additionalMetadata = {}) => {
    return logAuthEvent(AUDIT_EVENTS.SUSPICIOUS_ACTIVITY_DETECTED, {
      activity_type: activityType,
      risk_score: riskScore,
      ...additionalMetadata,
    }, 'critical');
  }, [logAuthEvent]);

  const logAccountLocked = useCallback((reason, triggeredBy, lockDuration, additionalMetadata = {}) => {
    return logAuthEvent(AUDIT_EVENTS.ACCOUNT_LOCKED, {
      reason,
      triggered_by: triggeredBy,
      lock_duration: lockDuration,
      ...additionalMetadata,
    }, 'high');
  }, [logAuthEvent]);

  const logAccountUnlocked = useCallback((reason, additionalMetadata = {}) => {
    return logAuthEvent(AUDIT_EVENTS.ACCOUNT_UNLOCKED, {
      reason,
      ...additionalMetadata,
    }, 'medium');
  }, [logAuthEvent]);

  const logPasswordChanged = useCallback((changedBy = 'self', method = 'manual', additionalMetadata = {}) => {
    return logAuthEvent(AUDIT_EVENTS.PASSWORD_CHANGED, {
      changed_by: changedBy,
      method,
      ...additionalMetadata,
    }, 'high');
  }, [logAuthEvent]);

  const logTwoFactorEnabled = useCallback((methodType, additionalMetadata = {}) => {
    return logAuthEvent(AUDIT_EVENTS.TWO_FACTOR_ENABLED, {
      method_type: methodType,
      ...additionalMetadata,
    }, 'high');
  }, [logAuthEvent]);

  const logTwoFactorDisabled = useCallback((methodType, reason, additionalMetadata = {}) => {
    return logAuthEvent(AUDIT_EVENTS.TWO_FACTOR_DISABLED, {
      method_type: methodType,
      reason,
      ...additionalMetadata,
    }, 'high');
  }, [logAuthEvent]);

  const logTwoFactorChallenge = useCallback((methodType, success, additionalMetadata = {}) => {
    return logAuthEvent(AUDIT_EVENTS.TWO_FACTOR_CHALLENGE, {
      method_type: methodType,
      success,
      ...additionalMetadata,
    }, success ? 'low' : 'high');
  }, [logAuthEvent]);

  const logSessionRevoked = useCallback((targetUserId, reason, revokedBySession, additionalMetadata = {}) => {
    return logAuthEvent(AUDIT_EVENTS.SESSION_REVOKED, {
      target_user_id: targetUserId,
      reason,
      revoked_by_session: revokedBySession,
      ...additionalMetadata,
    }, 'high');
  }, [logAuthEvent]);

  return {
    logAuthEvent,
    logLoginSuccess,
    logLoginFailed,
    logLogout,
    logPasswordResetRequested,
    logPasswordResetCompleted,
    logPasswordResetFailed,
    logSuspiciousActivity,
    logAccountLocked,
    logAccountUnlocked,
    logPasswordChanged,
    logTwoFactorEnabled,
    logTwoFactorDisabled,
    logTwoFactorChallenge,
    logSessionRevoked,
    fingerprint,
    AUDIT_EVENTS,
  };
};

export default useAuthAudit;