import React, { useState } from 'react';
import { FileText, Shield, Cookie, ChevronRight } from 'lucide-react';
import ReadOnlyLegalModal from './ReadOnlyLegalModal';

const LegalUpdateModal = ({ visible, onAccept, updatedDocuments }) => {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showCookie, setShowCookie] = useState(false);

  if (!visible) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop - Cannot be dismissed */}
        <div className="fixed inset-0 bg-black bg-opacity-80" />
        
        {/* Modal */}
        <div className="fixed inset-0 overflow-hidden flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-primary-600" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
              Terms & Policies Updated
            </h2>

            {/* Message */}
            <p className="text-gray-600 text-center mb-6 leading-relaxed">
              We've updated our Terms of Service, Privacy Policy, and Cookie Policy. Please review and accept them to continue using the platform.
            </p>

            {/* Document Links */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => setShowTerms(true)}
                className="w-full flex items-center justify-between p-4 bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary-600" />
                  <span className="font-semibold text-primary-700">
                    View Terms of Service
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-primary-600 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setShowPrivacy(true)}
                className="w-full flex items-center justify-between p-4 bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary-600" />
                  <span className="font-semibold text-primary-700">
                    View Privacy Policy
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-primary-600 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setShowCookie(true)}
                className="w-full flex items-center justify-between p-4 bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Cookie className="w-5 h-5 text-primary-600" />
                  <span className="font-semibold text-primary-700">
                    View Cookie Policy
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-primary-600 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Accept Button */}
            <button
              onClick={onAccept}
              className="w-full py-4 px-6 bg-success-600 hover:bg-success-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              I Accept
            </button>

            {/* Footer Note */}
            <p className="text-xs text-gray-500 text-center mt-4 leading-relaxed">
              By continuing, you agree to our updated terms and policies
            </p>
          </div>
        </div>
      </div>

      {/* Terms Modal */}
      <ReadOnlyLegalModal
        visible={showTerms}
        onClose={() => setShowTerms(false)}
        initialTab="terms"
      />

      {/* Privacy Modal */}
      <ReadOnlyLegalModal
        visible={showPrivacy}
        onClose={() => setShowPrivacy(false)}
        initialTab="privacy"
      />

      {/* Cookie Modal */}
      <ReadOnlyLegalModal
        visible={showCookie}
        onClose={() => setShowCookie(false)}
        initialTab="cookie"
      />
    </>
  );
};

export default LegalUpdateModal;
