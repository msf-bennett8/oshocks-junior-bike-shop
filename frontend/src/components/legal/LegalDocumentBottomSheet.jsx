import React, { useState, useRef, useEffect } from 'react';
import { X, Check, FileText, Shield, Cookie } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getLegalDocumentContent, trackDocumentOpened, trackDocumentScrolledToBottom } from '../../utils/legalTracker';

const TABS = {
  terms: { label: 'Terms of Service', icon: FileText, key: 'terms' },
  privacy: { label: 'Privacy Policy', icon: Shield, key: 'privacy' },
  cookie: { label: 'Cookie Policy', icon: Cookie, key: 'cookie' },
};

const LegalDocumentBottomSheet = ({
  visible,
  onClose,
  onAcceptAll,
  termsRead,
  privacyRead,
  cookieRead,
  setTermsRead,
  setPrivacyRead,
  setCookieRead,
}) => {
  const [activeTab, setActiveTab] = useState('terms');
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState({
    terms: false,
    privacy: false,
    cookie: false,
  });
  const [hasStartedScrolling, setHasStartedScrolling] = useState({
    terms: false,
    privacy: false,
    cookie: false,
  });
  const [content, setContent] = useState({
    terms: 'Loading...',
    privacy: 'Loading...',
    cookie: 'Loading...',
  });
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef(null);
  const currentScrollPosition = useRef(0);

  // Load markdown files when modal opens
  useEffect(() => {
    if (visible) {
      loadContent();
    }
  }, [visible]);

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

  // Track when tab is opened
  useEffect(() => {
    if (visible && activeTab) {
      trackDocumentOpened(activeTab);
    }
  }, [activeTab, visible]);

  // Reset scroll position on tab change
  useEffect(() => {
    if (visible && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
      currentScrollPosition.current = 0;
    }
  }, [activeTab, visible]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 20;
    const hasScrolled = scrollTop > 10;

    currentScrollPosition.current = scrollTop;

    if (hasScrolled && !hasStartedScrolling[activeTab]) {
      setHasStartedScrolling(prev => ({ ...prev, [activeTab]: true }));
    }

    if (isAtBottom && !hasScrolledToBottom[activeTab]) {
      setHasScrolledToBottom(prev => ({ ...prev, [activeTab]: true }));
      trackDocumentScrolledToBottom(activeTab);
      
      // Automatically mark as read when scrolled to bottom
      if (activeTab === 'terms') setTermsRead(true);
      else if (activeTab === 'privacy') setPrivacyRead(true);
      else if (activeTab === 'cookie') setCookieRead(true);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  };

  const canAccept = hasScrolledToBottom.terms && hasScrolledToBottom.privacy && hasScrolledToBottom.cookie;

  const getButtonText = () => {
    if (canAccept) return 'I Accept All Terms and Policies';
    if (!hasStartedScrolling[activeTab]) return 'Please Read These Documents';
    if (!hasScrolledToBottom[activeTab]) return 'Continue Scrolling';
    const remaining = ['terms', 'privacy', 'cookie'].filter(t => !hasScrolledToBottom[t]);
    return `Read ${remaining.length} More Document${remaining.length > 1 ? 's' : ''}`;
  };

  const getButtonHint = () => {
    if (canAccept) return null;
    
    const currentDocRead = hasScrolledToBottom[activeTab];
    const unreadDocs = Object.entries(TABS)
      .filter(([key]) => !hasScrolledToBottom[key])
      .map(([_, val]) => val.label);
    
    if (!hasStartedScrolling[activeTab]) {
      return 'Start scrolling to read the document';
    }
    
    if (!currentDocRead) {
      return 'Continue scrolling to the bottom';
    }
    
    if (currentDocRead && unreadDocs.length > 0) {
      return `Please read: ${unreadDocs.join(', ')}`;
    }
    
    return null;
  };

  const handleContinueScrolling = () => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientHeight * 0.8;
      scrollRef.current.scrollTop = currentScrollPosition.current + scrollAmount;
    }
  };

  const handleButtonClick = () => {
    if (canAccept) {
      onAcceptAll();
    } else if (hasStartedScrolling[activeTab] && !hasScrolledToBottom[activeTab]) {
      handleContinueScrolling();
    }
  };

  if (!visible) return null;

  const ActiveIcon = TABS[activeTab].icon;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 overflow-hidden flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col">
          {/* Drag Handle (Visual Only) */}
          <div className="flex justify-center py-3">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <ActiveIcon className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Legal Documents</h2>
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
            {Object.entries(TABS).map(([key, { label, icon: Icon }]) => (
              <button
                key={key}
                onClick={() => handleTabChange(key)}
                className={`
                  flex-1 px-4 py-3 text-sm font-medium transition-colors relative
                  ${activeTab === key 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <span className="flex items-center justify-center gap-2">
                  <Icon className="w-4 h-4" />
                  {label}
                  {hasScrolledToBottom[key] && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                </span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-6 py-6"
          >
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{content[activeTab]}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4">
            {/* Progress indicator */}
            <div className="flex items-center gap-2 mb-3">
              {Object.entries(TABS).map(([key, { label }]) => (
                <div key={key} className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    hasScrolledToBottom[key] ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  <span className={`text-xs ${
                    hasScrolledToBottom[key] ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {label.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>

            {getButtonHint() && (
              <p className="text-xs text-gray-600 text-center mb-3">
                {getButtonHint()}
              </p>
            )}
            
            <button
              onClick={handleButtonClick}
              disabled={!canAccept && !hasStartedScrolling[activeTab]}
              className={`
                w-full py-3 px-4 rounded-lg font-semibold text-white transition-all
                ${canAccept
                  ? 'bg-green-600 hover:bg-green-700 cursor-pointer'
                  : hasStartedScrolling[activeTab]
                  ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                  : 'bg-gray-300 cursor-not-allowed'
                }
              `}
            >
              {getButtonText()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalDocumentBottomSheet;
