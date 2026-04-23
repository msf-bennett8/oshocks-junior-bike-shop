import React, { useState } from 'react';
import { FileText, Shield, Cookie, ChevronRight } from 'lucide-react';
import ReadOnlyLegalModal from './ReadOnlyLegalModal';

const LegalUpdateModal = ({ visible, onAccept, updatedDocuments }) => {
  const [showReadOnly, setShowReadOnly] = useState(false);
  const [readOnlyTab, setReadOnlyTab] = useState('terms');

  if (!visible) return null;

  const documents = [
    { 
      key: 'terms', 
      label: 'Terms of Service', 
      icon: FileText,
      updated: updatedDocuments?.terms 
    },
    { 
      key: 'privacy', 
      label: 'Privacy Policy', 
      icon: Shield,
      updated: updatedDocuments?.privacy 
    },
    { 
      key: 'cookie', 
      label: 'Cookie Policy', 
      icon: Cookie,
      updated: updatedDocuments?.cookie 
    },
  ].filter(d => d.updated);

  const openDocument = (key) => {
    setReadOnlyTab(key);
    setShowReadOnly(true);
  };

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
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
              Terms & Policies Updated
            </h2>

            {/* Message */}
            <p className="text-gray-600 text-center mb-6 leading-relaxed">
              We've updated our legal documents. Please review and accept them to continue using Oshocks.
            </p>

            {/* Document Links */}
            <div className="space-y-3 mb-6">
              {documents.map((doc) => {
                const Icon = doc.icon;
                return (
                  <button
                    key={doc.key}
                    onClick={() => openDocument(doc.key)}
                    className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-700">
                        View {doc.label}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                  </button>
                );
              })}
            </div>

            {/* Accept Button */}
            <button
              onClick={onAccept}
              className="w-full py-4 px-6 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              I Accept All Updates
            </button>

            {/* Footer Note */}
            <p className="text-xs text-gray-500 text-center mt-4 leading-relaxed">
              By continuing, you agree to our updated terms and policies
            </p>
          </div>
        </div>
      </div>

      {/* Read-Only Modal for viewing updates */}
      <ReadOnlyLegalModal
        visible={showReadOnly}
        onClose={() => setShowReadOnly(false)}
        initialTab={readOnlyTab}
      />
    </>
  );
};

export default LegalUpdateModal;
