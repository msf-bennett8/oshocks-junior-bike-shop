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

      setFingerprint({
        hash,
        components,
        confidence: Math.min(confidence, 100),
      });

      // Store in sessionStorage for API headers
      sessionStorage.setItem('device_fingerprint', hash);
    };

    generateFingerprint();
  }, []);

  const refreshFingerprint = useCallback(() => {
    sessionStorage.removeItem('device_fingerprint');
    window.location.reload();
  }, []);

  return {
    fingerprint: fingerprint.hash,
    components: fingerprint.components,
    confidence: fingerprint.confidence,
    refreshFingerprint,
  };
};

export default useDeviceFingerprint;
