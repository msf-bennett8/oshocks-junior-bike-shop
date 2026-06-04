import { useState, useEffect } from 'react';
import { MessageCircle, Phone, X, Mail, ChevronRight, User } from 'lucide-react';
import ChatDrawer from './ChatDrawer';
import CallOverlay from './CallOverlay';
import { useMessaging } from '../../hooks/useMessaging';
import { useWebRTC } from '../../hooks/useWebRTC';
import { useAuth } from '../../context/AuthContext';
import { getGuestSessionId, setGuestProfile, getGuestProfile } from '../../utils/guestSession';
import dataSourceManager from '../../services/dataSourceManager';

const GlobalChatFAB = ({ excludePaths = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [supportUser, setSupportUser] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const { user } = useAuth();
  
  const { 
    incomingCall, 
    dismissIncomingCall, 
    startSupportChat,
    conversations,
    fetchConversations,
  } = useMessaging(user?.id);
  
  const {
    localStream,
    remoteStream,
    callState,
    callType,
    currentCall,
    callError,
    formattedDuration,
    initiateCall,
    answerCall,
    declineCall,
    endCall,
  } = useWebRTC(user?.id);

  const currentPath = window.location.pathname;
  const isExcluded = excludePaths.some(path => currentPath.startsWith(path));

  // Show FAB after scrolling
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch support user on mount (for both auth and guest)
  useEffect(() => {
    const fetchSupportUser = async () => {
      try {
        const res = await fetch(`${dataSourceManager.getApiUrl()}/support-user`);
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

    fetchSupportUser();
  }, []);

  // Start in-app call to support (requires auth)
  const handleCallSupport = async () => {
    if (!user?.id) {
      // Redirect to login for calls
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }
    
    const supportId = supportUser?.id || 1;
    try {
      setIsOpen(false);
      const supportConv = await startSupportChat(supportId);
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
    
    // For guests, show form first if no profile exists
    if (!user?.id) {
      const existingProfile = getGuestProfile();
      if (!existingProfile.name) {
        setShowGuestForm(true);
        setIsOpen(false);
        return;
      }
    }
    
    setIsOpen(false);
    setChatOpen(true);
    await startSupportChat(supportId);
  };

  // Handle guest form submission
  const handleGuestFormSubmit = async (e) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    
    setGuestProfile(guestName.trim(), guestEmail.trim() || null);
    setShowGuestForm(false);
    setChatOpen(true);
    
    const supportId = supportUser?.id || 1;
    await startSupportChat(supportId, guestName.trim(), guestEmail.trim() || null);
  };

  if (isExcluded) return null;

  return (
    <>
      {/* Guest Info Modal */}
      {showGuestForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-lg">Start Chat</h3>
              <button
                onClick={() => setShowGuestForm(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Enter your details so our support team can assist you better.
            </p>
            
            <form onSubmit={handleGuestFormSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGuestForm(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Chat
                </button>
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                Already have an account?{' '}
                <a href="/login" className="text-blue-600 hover:underline">Log in</a>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* FAB Button - Bottom Left */}
      <div className="fixed left-4 bottom-4 z-50 flex flex-col items-start gap-2">
        {/* Options Panel */}
        {isOpen && (
          <div className="bg-white rounded-xl shadow-2xl p-3 w-64 mb-2 animate-fade-in border border-gray-100">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="font-bold text-gray-900 text-sm">Need Help?</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-2">
              {/* Chat with Us */}
              <button
                onClick={handleChatSupport}
                className="w-full flex items-center space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
              >
                <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900">Chat with Us</span>
                  <span className="block text-[10px] text-green-600">● In-app messaging</span>
                </div>
              </button>

              {/* Call Us */}
              <button
                onClick={handleCallSupport}
                className="w-full flex items-center space-x-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
              >
                <div className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900">Call Us</span>
                  <span className="block text-[10px] text-gray-500">
                    {user?.id ? 'Free in-app or dial' : 'Login required'}
                  </span>
                </div>
              </button>

              {/* Email */}
              <a
                href="mailto:support@oshocks.co.ke"
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-9 h-9 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900">Email Us</span>
              </a>
            </div>
          </div>
        )}

        {/* Main FAB Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
            isOpen 
              ? 'bg-gray-800 text-white rotate-0' 
              : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
          }`}
          style={{
            boxShadow: '0 8px 32px rgba(37, 99, 235, 0.4)'
          }}
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
          
          {!isOpen && (
            <span className="absolute inset-0 rounded-full animate-ping bg-blue-500 opacity-20" />
          )}
        </button>
      </div>

      {/* In-app Chat Drawer */}
      <ChatDrawer 
        isOpen={chatOpen} 
        onClose={() => setChatOpen(false)}
        onStartCall={(convId, calleeId, type) => {
          if (!user?.id) {
            alert('Please log in to make calls');
            return;
          }
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

export default GlobalChatFAB;
