import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export const useReturnAudit = () => {
  const { user } = useAuth();
  
  const logReturnEvent = async (eventType, orderId, returnData) => {
    try {
      const { logFrontendAuditEvent, AUDIT_EVENTS } = await import('../../utils/auditUtils');
      
      const baseMetadata = {
        order_id: orderId,
        return_id: returnData.returnId,
        customer_id: returnData.customerId,
        processed_by: user?.id || 'seller',
        timestamp: new Date().toISOString(),
      };
      
      switch (eventType) {
        case 'REQUESTED':
          await logFrontendAuditEvent(AUDIT_EVENTS.ORDER_RETURN_REQUESTED, {
            category: 'order',
            severity: 'medium',
            actor_type: 'customer', // Customer initiates
            metadata: {
              ...baseMetadata,
              items: returnData.items,
              reason: returnData.reason,
              condition_assessment: returnData.condition,
            },
          });
          break;
          
        case 'APPROVED':
          await logFrontendAuditEvent(AUDIT_EVENTS.ORDER_RETURN_APPROVED, {
            category: 'order',
            severity: 'medium',
            actor_type: 'seller',
            user_id: user?.id,
            metadata: {
              ...baseMetadata,
              approved_items: returnData.approvedItems,
              shipping_label: returnData.shippingLabel,
              return_window_days: returnData.returnWindow,
            },
          });
          break;
          
        case 'RECEIVED':
          await logFrontendAuditEvent(AUDIT_EVENTS.ORDER_RETURN_RECEIVED, {
            category: 'order',
            severity: 'medium',
            actor_type: 'seller',
            user_id: user?.id,
            metadata: {
              ...baseMetadata,
              received_items: returnData.receivedItems,
              condition_assessment: returnData.conditionAssessment,
              received_at: new Date().toISOString(),
            },
          });
          break;
          
        case 'COMPLETED':
          await logFrontendAuditEvent(AUDIT_EVENTS.ORDER_RETURN_COMPLETED, {
            category: 'order',
            severity: 'medium',
            actor_type: 'seller',
            user_id: user?.id,
            metadata: {
              ...baseMetadata,
              refund_amount: returnData.refundAmount,
              refund_method: returnData.refundMethod,
              items_disposition: returnData.itemsDisposition,
              completed_at: new Date().toISOString(),
            },
          });
          break;
      }
    } catch (e) {
      console.error(`Failed to log return event ${eventType}:`, e);
    }
  };
  
  return { logReturnEvent };
};