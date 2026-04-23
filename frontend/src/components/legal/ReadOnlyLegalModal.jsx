// frontend/src/components/legal/ReadOnlyLegalModal.jsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getLegalDocumentContent } from '../../utils/legalTracker';

const TABS = {
  terms: { label: 'Terms of Service', key: 'terms' },
  privacy: { label: 'Privacy Policy', key: 'privacy' },
  cookie: { label: 'Cookie Policy', key: 'cookie' },
};

const ReadOnlyLegalModal = ({ visible, onClose, initialTab = 'terms' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [content, setContent] = useState({
    terms: 'Loading...',
    privacy: 'Loading...',
    cookie: 'Loading...',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadContent();
      setActiveTab(initialTab);
    }
  }, [visible, initialTab]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const [termsContent, privacyContent, cookieContent] = await Promise.all([
        getLegalDocumentContent('terms'),
        getLegalDocumentContent('privacy'),
        getLegalDocumentContent('cookie'),
      ]);
      
      setContent({
        terms: termsContent || '# Terms of Service\n\nContent unavailable.',
        privacy: privacyContent || '# Privacy Policy\n\nContent unavailable.',
        cookie: cookieContent || '# Cookie Policy\n\nContent unavailable.',
      });
    } catch (err) {
      console.error('Failed to load legal docs:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 overflow-hidden flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col">
          {/* Drag Handle */}
          <div className="flex justify-center py-3">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-start justify-between px-6 pb-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{TABS[activeTab].label}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {Object.entries(TABS).map(([key, { label }]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`
                  flex-1 px-4 py-3 text-sm font-medium transition-colors relative
                  ${activeTab === key 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <span className="flex items-center justify-center gap-2">
                  {label}
                </span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-h1:text-2xl prose-h1:font-bold prose-h2:text-xl prose-h2:font-bold prose-h3:text-lg prose-h3:font-semibold prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900 prose-table:w-full prose-table:border-collapse prose-th:bg-gray-100 prose-th:p-3 prose-th:text-left prose-th:font-semibold prose-th:text-gray-900 prose-td:p-3 prose-td:border-t prose-td:border-gray-200 prose-td:text-gray-700 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:p-4 prose-blockquote:rounded-r-lg prose-hr:my-6">
                <ReactMarkdown>{content[activeTab]}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4">
            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadOnlyLegalModal;