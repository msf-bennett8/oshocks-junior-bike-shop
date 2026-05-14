import React, { useState } from 'react';
import { CheckCircle, Copy, X, MessageCircle } from 'lucide-react';

const CaseSuccessModal = ({ caseId, message, onClose, onViewChat }) => {
  const [copied, setCopied] = useState(false);

const handleCopy = () => {
    navigator.clipboard.writeText(caseId);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      onClose(); // Close modal only — banner stays
    }, 1500);
  };

  if (!caseId) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 text-center relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {/* Success icon */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">Support Case Created!</h3>
        <p className="text-sm text-gray-600 mb-5">{message || 'Our team will get back to you within 24 hours.'}</p>

        {/* Case ID with copy */}
        <div className="bg-gray-50 rounded-xl p-4 mb-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Case Reference</p>
          <div className="flex items-center justify-center gap-3">
            <code className="text-lg font-mono font-bold text-gray-900 tracking-wider">{caseId}</code>
            <button
              onClick={handleCopy}
              className={`p-2 rounded-lg transition-all ${
                copied ? 'bg-green-100 text-green-600' : 'bg-white hover:bg-gray-100 text-gray-500 border border-gray-200'
              }`}
              title={copied ? 'Copied!' : 'Copy Case ID'}
            >
              {copied ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          {copied && (
            <p className="text-xs text-green-600 mt-2 font-medium">Copied to clipboard!</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          {onViewChat && (
            <button
              onClick={onViewChat}
              className="w-full flex items-center justify-center gap-2 py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              View in Chat
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all"
          >
            Done
          </button>
        </div>

        <p className="mt-4 text-xs text-gray-400">
          Save this Case ID for your records
        </p>
      </div>
    </div>
  );
};

export default CaseSuccessModal;
