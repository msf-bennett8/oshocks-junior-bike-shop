import React, { useState, useEffect } from 'react';
import { Eye, LogOut, Shield } from 'lucide-react';
import { logFrontendAuditEvent, AUDIT_EVENTS } from '../../utils/auditUtils';

const ImpersonationBanner = () => {
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonationData, setImpersonationData] = useState(null);

  useEffect(() => {
    const checkImpersonation = () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const impData = JSON.parse(sessionStorage.getItem('impersonation_data') || '{}');
      
      if (user.is_impersonating && impData.target_user_id) {
        setIsImpersonating(true);
        setImpersonationData(impData);
      }
    };
    
    checkImpersonation();
  }, []);

  const handleEndImpersonation = async () => {
    const impersonationData = JSON.parse(sessionStorage.getItem('impersonation_data') || '{}');
    
    if (!impersonationData.target_user_id) {
      window.location.href = '/superadmin/users';
      return;
    }

    const durationSeconds = impersonationData.started_at ? 
      Math.floor((Date.now() - new Date(impersonationData.started_at).getTime()) / 1000) : 0;

    try {
      // Log impersonation ended event
      const fingerprint = sessionStorage.getItem('device_fingerprint');
      await logFrontendAuditEvent(AUDIT_EVENTS.ADMIN_IMPERSONATION_ENDED, {
        category: 'admin',
        severity: 'critical',
        metadata: {
          target_user_id: impersonationData.target_user_id,
          target_user_email: impersonationData.target_user_email,
          duration_seconds: durationSeconds,
          actions_taken_summary: sessionStorage.getItem('impersonation_actions') || 'none_logged',
          timestamp: new Date().toISOString(),
          session_id: impersonationData.session_id,
          device_fingerprint: fingerprint,
        },
      });
    } catch (e) {
      console.error('Failed to log impersonation end:', e);
    }

    // Restore original admin session
    const originalToken = sessionStorage.getItem('original_admin_token');
    const originalSession = JSON.parse(sessionStorage.getItem('original_admin_session') || '{}');
    
    if (originalToken) {
      localStorage.setItem('authToken', originalToken);
      localStorage.setItem('user', JSON.stringify(originalSession));
    }

    // Clear impersonation data
    sessionStorage.removeItem('impersonation_data');
    sessionStorage.removeItem('original_admin_token');
    sessionStorage.removeItem('original_admin_session');
    sessionStorage.removeItem('impersonation_actions');

    // Redirect back to admin panel
    window.location.href = '/superadmin/users';
  };

  if (!isImpersonating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-purple-600 text-white z-50 px-4 py-2 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-white/20 rounded-lg">
            <Eye className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-200" />
            <span className="font-semibold">IMPERSONATION MODE</span>
            <span className="text-purple-200">|</span>
            <span>Logged in as: <strong>{impersonationData?.target_user_name}</strong></span>
            <span className="text-purple-200 text-sm">({impersonationData?.target_user_email})</span>
            <span className="text-purple-200">|</span>
            <span className="text-sm text-purple-200">Role: {impersonationData?.target_user_role}</span>
          </div>
        </div>
        <button
          onClick={handleEndImpersonation}
          className="flex items-center gap-2 px-4 py-1.5 bg-white text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          End Impersonation
        </button>
      </div>
    </div>
  );
};

export default ImpersonationBanner;
