import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, X, Mail, Phone, Clock, ChevronRight, 
  Headphones, ExternalLink
} from 'lucide-react';

const FloatingSupportWidget = ({ excludePaths = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldShow, setShouldShow] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 100);
    };

    const checkPath = () => {
      const currentPath = window.location.pathname;
      const isExcluded = excludePaths.some(path => 
        currentPath === path || currentPath.startsWith(path)
      );
      setShouldShow(!isExcluded);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('popstate', checkPath);
    
    handleScroll();
    checkPath();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('popstate', checkPath);
    };
  }, [excludePaths]);

  const toggleWidget = () => {
    setIsOpen(!isOpen);
  };

  const navigateToFullSupport = () => {
    window.location.href = '/contact-support';
  };

  if (!shouldShow) return null;

  return (
    <>
      {/* Floating Action Button - Responsive positioning */}
      {isVisible && (
        <button
          onClick={toggleWidget}
          className={`fixed right-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 ${
            isOpen ? 'w-0 opacity-0' : 'w-10 h-14 sm:w-12 sm:h-16 md:w-14 md:h-20'
          } top-1/3 sm:top-1/2 transform -translate-y-1/2 rounded-l-full`}
          aria-label="Open support panel"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
        </button>
      )}

      {/* Support Panel - Fully responsive */}
      {isVisible && (
        <>
          <div
            className={`fixed inset-y-0 right-0 w-full sm:w-96 md:w-[420px] lg:w-[450px] max-w-full bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
              isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Header - Responsive padding and text */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 sm:p-4 md:p-5">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h3 className="text-base sm:text-lg md:text-xl font-bold">Need Help?</h3>
                <button
                  onClick={toggleWidget}
                  className="p-1 sm:p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Close support panel"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              <p className="text-xs sm:text-sm text-blue-100 mb-3 sm:mb-4">Contact Support!</p>
              
              {/* Full Support Page Button - Responsive */}
              <button
                onClick={navigateToFullSupport}
                className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg transition-colors flex items-center justify-center space-x-1.5 sm:space-x-2 border border-white/30"
              >
                <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">View Full Support Page</span>
              </button>
            </div>

            {/* Content - Responsive scrolling height */}
            <div className="p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4 overflow-y-auto h-[calc(100vh-160px)] sm:h-[calc(100vh-190px)] md:h-[calc(100vh-210px)]">
              {/* Contact Options - Responsive cards */}
              <div className="space-y-2.5 sm:space-y-3">
                <a
                  href="tel:+254712345678"
                  className="flex items-center space-x-2.5 sm:space-x-3 p-3 sm:p-3.5 md:p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl hover:shadow-md transition-all active:scale-[0.98]"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-xs sm:text-sm">Call Us Now</p>
                    <p className="text-[10px] sm:text-xs text-gray-600">+254 712 345 678</p>
                  </div>
                </a>

                <a
                  href="https://wa.me/254712345678"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2.5 sm:space-x-3 p-3 sm:p-3.5 md:p-4 bg-gradient-to-r from-green-50 to-emerald-100 border border-green-200 rounded-xl hover:shadow-md transition-all active:scale-[0.98]"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-xs sm:text-sm">WhatsApp Chat</p>
                    <p className="text-[10px] sm:text-xs text-gray-600">Quick response</p>
                  </div>
                </a>

                <a
                  href="mailto:support@oshocks.co.ke"
                  className="flex items-center space-x-2.5 sm:space-x-3 p-3 sm:p-3.5 md:p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl hover:shadow-md transition-all active:scale-[0.98]"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-xs sm:text-sm">Email Support</p>
                    <p className="text-[10px] sm:text-xs text-gray-600 truncate max-w-[200px] sm:max-w-full">support@oshocks.co.ke</p>
                  </div>
                </a>

                <button
                  onClick={() => {
                    if (window.Tawk_API) {
                      window.Tawk_API.maximize();
                    }
                    toggleWidget();
                  }}
                  className="w-full flex items-center space-x-2.5 sm:space-x-3 p-3 sm:p-3.5 md:p-4 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl hover:shadow-md transition-all active:scale-[0.98]"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Headphones className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-xs sm:text-sm">Live Chat</p>
                    <p className="text-[10px] sm:text-xs text-gray-600">Chat with an agent</p>
                  </div>
                </button>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 my-3 sm:my-4"></div>

              {/* Quick Links - Responsive */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-xs sm:text-sm">Quick Links</h4>
                <div className="space-y-1.5 sm:space-y-2">
                  <a
                    href="/orders"
                    className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors active:scale-[0.98]"
                  >
                    <span className="text-xs sm:text-sm text-gray-900">Track Order</span>
                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                  </a>
                  <a
                    href="/refund-policy"
                    className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors active:scale-[0.98]"
                  >
                    <span className="text-xs sm:text-sm text-gray-900">Returns</span>
                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                  </a>
                  <a
                    href="/faq"
                    className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors active:scale-[0.98]"
                  >
                    <span className="text-xs sm:text-sm text-gray-900">FAQs</span>
                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                  </a>
                </div>
              </div>

              {/* Business Hours - Responsive */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-3.5 md:p-4">
                <div className="flex items-start space-x-2 sm:space-x-2.5">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">Business Hours</p>
                    <p className="text-[10px] sm:text-xs text-gray-600 leading-relaxed">
                      Mon - Fri: 8:00 AM - 6:00 PM<br />
                      Sat: 9:00 AM - 5:00 PM<br />
                      Sun: Closed
                    </p>
                  </div>
                </div>
              </div>

              {/* Response Time - Responsive */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-3.5 md:p-4">
                <p className="text-[10px] sm:text-xs text-blue-800 leading-relaxed">
                  <strong>Average Response Time:</strong> Within 2 hours during business hours
                </p>
              </div>
            </div>
          </div>

          {/* Overlay - Responsive backdrop blur */}
          {isOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-40 sm:bg-opacity-50 z-40 backdrop-blur-[2px] sm:backdrop-blur-sm"
              onClick={toggleWidget}
            />
          )}
        </>
      )}
    </>
  );
};

export default FloatingSupportWidget;