import { useCallback } from 'react';
import { logFrontendAuditEvent, AUDIT_EVENTS } from '../utils/auditUtils';

/**
 * Hook for standardized payment audit logging
 * Ensures PCI DSS compliance and complete audit trails
 */
export const usePaymentAudit = () => {
  const logPaymentMethodAdded = useCallback(async (paymentMethodData) => {
    return logFrontendAuditEvent(AUDIT_EVENTS.PAYMENT_METHOD_ADDED, {
      category: 'payment',
      severity: 'medium',
      metadata: {
        payment_method_id: paymentMethodData.id,
        method_type: paymentMethodData.type,
        last_four_digits: paymentMethodData.last4,
        expiry_month: paymentMethodData.expMonth,
        expiry_year: paymentMethodData.expYear,
        billing_address_id: paymentMethodData.billingAddressId,
        timestamp: new Date().toISOString(),
        verified: true,
      },
    });
  }, []);

  const logPaymentMethodRemoved = useCallback(async (paymentMethodData) => {
    return logFrontendAuditEvent(AUDIT_EVENTS.PAYMENT_METHOD_REMOVED, {
      category: 'payment',
      severity: 'medium',
      metadata: {
        payment_method_id: paymentMethodData.id,
        method_type: paymentMethodData.type,
        last_four_digits: paymentMethodData.last4,
        removed_at: new Date().toISOString(),
        timestamp: new Date().toISOString(),
      },
    });
  }, []);

  const logPaymentSuccessful = useCallback(async (paymentData) => {
    return logFrontendAuditEvent(AUDIT_EVENTS.PAYMENT_SUCCESSFUL, {
      category: 'payment',
      severity: 'medium',
      metadata: {
        order_id: paymentData.orderId,
        payment_intent_id: paymentData.paymentIntentId,
        transaction_id: paymentData.transactionId,
        amount: paymentData.amount,
        currency: paymentData.currency || 'KES',
        payment_method_type: paymentData.methodType,
        settlement_date: paymentData.settlementDate || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        timestamp: new Date().toISOString(),
      },
    });
  }, []);

  const logPaymentFailed = useCallback(async (paymentData) => {
    return logFrontendAuditEvent(AUDIT_EVENTS.PAYMENT_FAILED, {
      category: 'payment',
      severity: 'high',
      metadata: {
        order_id: paymentData.orderId,
        payment_intent_id: paymentData.paymentIntentId,
        amount: paymentData.amount,
        failure_reason: paymentData.failureReason,
        payment_method_type: paymentData.methodType,
        processor_error_code: paymentData.errorCode,
        retryable: paymentData.retryable || false,
        timestamp: new Date().toISOString(),
      },
    });
  }, []);

  const logPaymentRetried = useCallback(async (retryData) => {
    return logFrontendAuditEvent(AUDIT_EVENTS.PAYMENT_RETRIED, {
      category: 'payment',
      severity: 'medium',
      metadata: {
        order_id: retryData.orderId,
        attempt_number: retryData.attemptNumber,
        payment_method_type: retryData.methodType,
        timestamp: new Date().toISOString(),
      },
    });
  }, []);

  return {
    logPaymentMethodAdded,
    logPaymentMethodRemoved,
    logPaymentSuccessful,
    logPaymentFailed,
    logPaymentRetried,
  };
};