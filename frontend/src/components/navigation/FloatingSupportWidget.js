import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, X, Mail, Phone, Clock, ChevronRight, 
  Headphones, ExternalLink
} from 'lucide-react';
import ChatDrawer from '../messaging/ChatDrawer';
import CallOverlay from '../messaging/CallOverlay';
import { useMessaging } from '../../hooks/useMessaging';
import { useWebRTC } from '../../hooks/useWebRTC';
import { useAuth } from '../../context/AuthContext';

const FloatingSupportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // In-app messaging & calls
  const [chatOpen, setChatOpen] = useState(false);
  const [supportUser, setSupportUser] = useState(null);
  const { user } = useAuth();
  const { incomingCall, dismissIncomingCall, startConversation } = useMessaging(user?.id);
  const {
    localStream,
    remoteStream,
    callState,
    callType,
    currentCall,
    callDuration,
    callError,
    formattedDuration,
    initiateCall,
    answerCall,
    declineCall,
    endCall,
  } = useWebRTC(user?.id);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch support user (super_admin or owner) on mount
  useEffect(() => {
    const fetchSupportUser = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL?.replace('/api/v1', '')}/support-user`);
        if (res.ok) {
          const data = await res.json();
          if (data.data) {
            setSupportUser(data.data);
            return;
          }
        }
      } catch (err) {
        console.log('Could not fetch support user, using fallback');
      }
      setSupportUser({ id: 1, name: 'Oshocks Support', role: 'super_admin' });
    };

    if (user?.id) fetchSupportUser();
  }, [user?.id]);

  const toggleWidget = () => {
    setIsOpen(!isOpen);
  };

  const navigateToFullSupport = () => {
    window.location.href = '/contact-support';
  };

  // Start in-app call to support (dynamically finds super_admin/owner)
  const handleCallSupport = async () => {
    const supportId = supportUser?.id || 1;
    try {
      setIsOpen(false);
      const supportConv = await startConversation(supportId, 'support', 'Oshocks Support');
      if (supportConv?.id) {
        initiateCall(supportConv.id, supportId, 'voice');
      }
    } catch (err) {
      console.error('In-app call failed, falling back to phone:', err);
      window.location.href = 'tel:+254798558285';
    }
  };

  // Open chat with support
  const handleChatSupport = async () => {
    const supportId = supportUser?.id || 1;
    setIsOpen(false);
    setChatOpen(true);
    await startConversation(supportId, 'support', 'Oshocks Support');
  };

  return (
    <>
      {/* Floating Action Button */}
      {isVisible && (
        <button
          onClick={toggleWidget}
          className={`fixed right-0 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 ${
            isOpen ? 'w-0 opacity-0' : 'w-12 h-16 rounded-l-full'
          }`}
          aria-label="Open support panel"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Support Panel */}
      {isVisible && (
        <>
          <div
            className={`fixed inset-y-0 right-0 w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
              isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold">Need Help?</h3>
                <button
                  onClick={toggleWidget}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Close support panel"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-sm text-blue-100 mb-3">Contact Support!</p>
              
              {/* Full Support Page Button */}
              <button
                onClick={navigateToFullSupport}
                className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 border border-white/30"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm">View Full Support Page</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-180px)]">
              {/* Contact Options */}
              <div className="space-y-3">
                {/* Chat with Us — In-app messaging */}
                <button
                  onClick={handleChatSupport}
                  className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg hover:shadow-md transition-all text-left"
                >
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Chat with Us</p>
                    <p className="text-xs text-gray-600">In-app messaging</p>
                  </div>
                </button>

                {/* Call Us — WebRTC first, fallback to phone */}
                <button
                  onClick={handleCallSupport}
                  className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg hover:shadow-md transition-all text-left"
                >
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Call Us Now</p>
                    <p className="text-xs text-gray-600">Free in-app or +254 798 558 285</p>
                  </div>
                </button>

                <a
                  href="https://wa.me/254798558285"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-100 border border-green-200 rounded-lg hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">WhatsApp Chat</p>
                    <p className="text-xs text-gray-600">Quick response</p>
                  </div>
                </a>

                <a
                  href="mailto:support@oshocks.co.ke"
                  className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Email Support</p>
                    <p className="text-xs text-gray-600">support@oshocks.co.ke</p>
                  </div>
                </a>

                <button
                  onClick={async () => {
                    // Try in-app chat first (if user is logged in)
                    if (user?.id) {
                      setIsOpen(false);
                      setChatOpen(true);
                      const supportId = supportUser?.id || 1;
                      await startConversation(supportId, 'support', 'Oshocks Support');
                    } else if (window.Tawk_API) {
                      // Fallback to Tawk.to for guests
                      window.Tawk_API.maximize();
                      toggleWidget();
                    } else {
                      // Final fallback: redirect to contact page
                      window.location.href = '/contact-support';
                    }
                  }}
                  className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Headphones className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-sm">Live Chat</p>
                    <p className="text-xs text-gray-600">
                      {user?.id ? 'Chat with an agent' : 'Chat with an agent (Tawk.to)'}
                    </p>
                  </div>
                </button>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 my-4"></div>

              {/* Quick Links */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">Quick Links</h4>
                <div className="space-y-2">
                  <a
                    href="/track-order"
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-sm text-gray-900">Track Order</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </a>
                  <a
                    href="/returns"
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-sm text-gray-900">Returns</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </a>
                  <a
                    href="/faq"
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-sm text-gray-900">FAQs</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </a>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Clock className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">Business Hours</p>
                    <p className="text-xs text-gray-600">
                      Mon - Fri: 8:00 AM - 6:00 PM<br />
                      Sat: 9:00 AM - 5:00 PM<br />
                      Sun: Closed
                    </p>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-800">
                  <strong>Average Response Time:</strong> Within 2 hours during business hours
                </p>
              </div>
            </div>
          </div>

          {/* Overlay */}
          {isOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={toggleWidget}
            />
          )}
        </>
      )}

      {/* In-app Chat Drawer */}
      <ChatDrawer 
        isOpen={chatOpen} 
        onClose={() => setChatOpen(false)}
        onStartCall={(convId, calleeId, type) => {
          setChatOpen(false);
          initiateCall(convId, calleeId, type);
        }}
      />

      {/* In-app Call Overlay */}
      <CallOverlay
        callState={callState}
        callType={callType}
        incomingCall={incomingCall}
        currentCall={currentCall}
        localStream={localStream}
        remoteStream={remoteStream}
        callDuration={formattedDuration}
        callError={callError}
        onAnswer={(call) => {
          dismissIncomingCall();
          answerCall(call);
        }}
        onDecline={() => {
          declineCall(incomingCall?.sessionId);
          dismissIncomingCall();
        }}
        onEndCall={endCall}
        onDismissError={() => {}}
      />
    </>
  );
};

export default FloatingSupportWidget;
