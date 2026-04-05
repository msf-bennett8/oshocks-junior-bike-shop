// ============================================================================
// DEVICE FINGERPRINT HOOK - Generate and manage device fingerprint
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { getCanvasFingerprint, getScreenInfo, getTimezone } from '../utils/auditUtils';

export const useDeviceFingerprint = () => {
  const [fingerprint, setFingerprint] = useState({
    hash: null,
    components: {},
    confidence: 0,
  });
  const [isTrusted, setIsTrusted] = useState(false);

  useEffect(() => {
    const generateFingerprint = () => {
      const components = {
        user_agent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screen: getScreenInfo(),
        timezone: getTimezone(),
        color_depth: window.screen.colorDepth,
        pixel_ratio: window.devicePixelRatio,
        canvas: getCanvasFingerprint(),
        touch_support: 'ontouchstart' in window,
        cookies_enabled: navigator.cookieEnabled,
        local_storage: !!window.localStorage,
        session_storage: !!window.sessionStorage,
        hardware_concurrency: navigator.hardwareConcurrency || 'unknown',
        memory: navigator.deviceMemory || 'unknown',
      };

      // Create hash from components
      const fingerprintString = Object.values(components).join('|');
      const hash = btoa(fingerprintString).slice(0, 64); // Simple hash

      // Calculate confidence (more components = higher confidence)
      let confidence = 50;
      if (components.canvas !== 'unknown') confidence += 20;
      if (components.screen !== 'unknown') confidence += 15;
      if (components.timezone !== 'unknown') confidence += 10;
      if (components.hardware_concurrency !== 'unknown') confidence += 5;

      const fingerprintData = {
        hash,
        components,
        confidence: Math.min(confidence, 100),
      };

      setFingerprint(fingerprintData);

      // Store in sessionStorage for API headers
      sessionStorage.setItem('device_fingerprint', hash);
      
      // Check if device is trusted
      const trustedDevices = JSON.parse(localStorage.getItem('trusted_devices') || '[]');
      setIsTrusted(trustedDevices.includes(hash));
      
      // Log device fingerprint created if new
      const existingFp = sessionStorage.getItem('device_fingerprint_logged');
      if (!existingFp) {
        logFingerprintCreated(fingerprintData);
        sessionStorage.setItem('device_fingerprint_logged', 'true');
      }
    };

    const logFingerprintCreated = async (fpData) => {
      try {
        const { logFrontendAuditEvent, AUDIT_EVENTS } = await import('../utils/auditUtils');
        await logFrontendAuditEvent(AUDIT_EVENTS.DEVICE_FINGERPRINT_CREATED, {
          category: 'security',
          severity: 'low',
          metadata: {
            fingerprint_hash: fpData.hash,
            device_characteristics: {
              user_agent: fpData.components.user_agent?.substring(0, 200),
              screen_resolution: fpData.components.screen,
              color_depth: fpData.components.color_depth,
              timezone: fpData.components.timezone,
              language: fpData.components.language,
            },
            confidence_score: fpData.confidence,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (e) {
        // Silently fail
      }
    };

    generateFingerprint();
  }, []);

  const refreshFingerprint = useCallback(() => {
    sessionStorage.removeItem('device_fingerprint');
    sessionStorage.removeItem('device_fingerprint_logged');
    window.location.reload();
  }, []);

  const trustDevice = useCallback(async (expiryDays = 30) => {
    if (!fingerprint.hash) return;
    
    const trustedDevices = JSON.parse(localStorage.getItem('trusted_devices') || '[]');
    if (!trustedDevices.includes(fingerprint.hash)) {
      trustedDevices.push(fingerprint.hash);
      localStorage.setItem('trusted_devices', JSON.stringify(trustedDevices));
      
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expiryDays);
      
      try {
        const { logFrontendAuditEvent, AUDIT_EVENTS } = await import('../utils/auditUtils');
        await logFrontendAuditEvent(AUDIT_EVENTS.DEVICE_TRUSTED, {
          category: 'security',
          severity: 'medium',
          metadata: {
            fingerprint_hash: fingerprint.hash,
            expiry_date: expiryDate.toISOString(),
            timestamp: new Date().toISOString(),
          },
        });
      } catch (e) {
        // Silently fail
      }
    }
    
    setIsTrusted(true);
  }, [fingerprint.hash]);

  const checkFingerprintMismatch = useCallback(async () => {
    const storedFp = sessionStorage.getItem('device_fingerprint');
    if (storedFp && storedFp !== fingerprint.hash && fingerprint.hash) {
      try {
        const { logFrontendAuditEvent, AUDIT_EVENTS } = await import('../utils/auditUtils');
        await logFrontendAuditEvent(AUDIT_EVENTS.DEVICE_FINGERPRINT_MISMATCH, {
          category: 'security',
          severity: 'high',
          metadata: {
            fingerprint_hash: fingerprint.hash,
            stored_fingerprint: storedFp,
            similarity_score: 0.3,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (e) {
        // Silently fail
      }
    }
  }, [fingerprint.hash]);

  return {
    fingerprint: fingerprint.hash,
    components: fingerprint.components,
    confidence: fingerprint.confidence,
    isTrusted,
    refreshFingerprint,
    trustDevice,
    checkFingerprintMismatch,
  };
};

export default useDeviceFingerprint;