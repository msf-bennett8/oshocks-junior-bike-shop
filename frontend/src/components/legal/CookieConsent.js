import React, { useState, useEffect } from 'react';
import { Cookie, X, Shield, Settings } from 'lucide-react';
import { logFrontendAuditEvent, AUDIT_EVENTS } from '../utils/auditUtils';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    } else {
      setPreferences(JSON.parse(consent));
    }
  }, []);

  const handleAcceptAll = async () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    
    localStorage.setItem('cookieConsent', JSON.stringify(allAccepted));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setPreferences(allAccepted);
    setShowBanner(false);
    
    // Log consent given event
    try {
      await logFrontendAuditEvent(AUDIT_EVENTS.CONSENT_GIVEN, {
        category: 'privacy',
        severity: 'low',
        metadata: {
          consent_type: 'all',
          version: '1.0',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (e) {
      // Silently fail
    }
  };

  const handleAcceptSelected = async () => {
    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setShowBanner(false);
    setShowPreferences(false);
    
    // Log consent given event
    try {
      await logFrontendAuditEvent(AUDIT_EVENTS.CONSENT_GIVEN, {
        category: 'privacy',
        severity: 'low',
        metadata: {
          consent_type: 'selected',
          preferences: preferences,
          version: '1.0',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (e) {
      // Silently fail
    }
  };

  const handleRejectAll = async () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    
    localStorage.setItem('cookieConsent', JSON.stringify(onlyNecessary));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setPreferences(onlyNecessary);
    setShowBanner(false);
    setShowPreferences(false);
    
    // Log consent withdrawn event (effectively rejecting optional cookies)
    try {
      await logFrontendAuditEvent(AUDIT_EVENTS.CONSENT_WITHDRAWN, {
        category: 'privacy',
        severity: 'low',
        metadata: {
          consent_type: 'rejected',
          withdrawn_types: ['analytics', 'marketing', 'preferences'],
          timestamp: new Date().toISOString(),
        },
      });
    } catch (e) {
      // Silently fail
    }
  };

  const handleWithdrawConsent = async () => {
    localStorage.removeItem('cookieConsent');
    localStorage.removeItem('cookieConsentDate');
    setShowBanner(true);
    
    // Log consent withdrawn event
    try {
      await logFrontendAuditEvent(AUDIT_EVENTS.CONSENT_WITHDRAWN, {
        category: 'privacy',
        severity: 'low',
        metadata: {
          withdrawal_method: 'manual',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (e) {
      // Silently fail
    }
  };

  const togglePreference = (key) => {
    if (key === 'necessary') return; // Always required
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Main Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Cookie className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">We value your privacy</h3>
                <p className="text-sm text-gray-600 max-w-2xl">
                  We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                  By clicking "Accept All", you consent to our use of cookies.
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <button
                onClick={() => setShowPreferences(true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
              >
                <Settings size={16} />
                Preferences
              </button>
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Reject All
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Cookie Preferences</h2>
              </div>
              <button
                onClick={() => setShowPreferences(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Necessary Cookies */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-900">Necessary Cookies</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Essential for the website to function properly. Cannot be disabled.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.necessary}
                  disabled
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-not-allowed opacity-50"
                />
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-900">Analytics Cookies</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Help us understand how visitors interact with our website.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={() => togglePreference('analytics')}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-900">Marketing Cookies</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Used to deliver personalized advertisements and content.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={() => togglePreference('marketing')}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
              </div>

              {/* Preferences Cookies */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-900">Preference Cookies</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Remember your settings and preferences for a better experience.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.preferences}
                  onChange={() => togglePreference('preferences')}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={handleRejectAll}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Reject All
              </button>
              <button
                onClick={handleAcceptSelected}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieConsent;
