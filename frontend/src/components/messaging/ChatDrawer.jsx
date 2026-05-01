// ============================================================================
// CHAT DRAWER — Responsive: Desktop Split-Pane | Mobile WhatsApp-Style
// ============================================================================
// Desktop (>1024px): Website content on left, chat panel on right (Intercom-style)
// Mobile (<1024px): WhatsApp-style — list → tap → thread → back button
// ============================================================================

import React, { useEffect, useCallback } from 'react';
import ConversationList from './ConversationList';
import MessageThread from './MessageThread';
import { useMessaging } from '../../hooks/useMessaging';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, X } from 'lucide-react';

const ChatDrawer = ({ isOpen, onClose, onStartCall, entryPoint = 'support' }) => {
  const { user } = useAuth();
  const {
    conversations,
    activeConversation,
    messages,
    loading,
    sending,
    unreadTotal,
    typingUsers,
    messagesEndRef,
    setActiveConversation,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markAsRead,
    sendTypingIndicator,
  } = useMessaging(user?.id);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  const [view, setView] = React.useState('list'); // 'list' | 'thread' — mobile only

  // Reset to list view when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setView('list');
      setActiveConversation(null);
    }
  }, [isOpen, setActiveConversation]);

  // Load conversations when drawer opens
  useEffect(() => {
    if (isOpen && (user?.id || localStorage.getItem('oshocks_guest_session_id'))) {
      fetchConversations();
    }
  }, [isOpen, user?.id, fetchConversations]);

  // Load messages when conversation selected
  useEffect(() => {
    if (activeConversation?.id) {
      fetchMessages(activeConversation.id);
      markAsRead(activeConversation.id);
      if (isMobile) setView('thread');
    }
  }, [activeConversation?.id, fetchMessages, markAsRead, isMobile]);

  const handleSend = (body, replyTo = null, attachments = []) => {
    if (activeConversation?.id) {
      sendMessage(activeConversation.id, body, 'text', null, replyTo, attachments);
    }
  };

  const handleStartCall = (type) => {
    if (!activeConversation || !onStartCall) return;
    const calleeId = activeConversation.other_participant?.id;
    if (!calleeId) {
      alert('Cannot call this conversation');
      return;
    }
    onStartCall(activeConversation.id, calleeId, type);
  };

  const handleBackToList = useCallback(() => {
    setView('list');
    setActiveConversation(null);
  }, [setActiveConversation]);

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
  };

  // ─── DESKTOP: SPLIT-PANE LAYOUT ───
  const DesktopLayout = () => (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop — click to close */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Chat Panel — Right Side */}
      <div className="relative ml-auto flex w-[480px] xl:w-[520px] h-full bg-white shadow-2xl animate-slide-in-right flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-gray-900 text-lg">Messages</h2>
            {unreadTotal > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadTotal}
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Split Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Conversation List — Narrow sidebar */}
          <div className="w-64 border-r border-gray-100 flex-shrink-0">
            <ConversationList
              conversations={conversations}
              activeId={activeConversation?.id}
              onSelect={handleSelectConversation}
              unreadTotal={unreadTotal}
              onClose={onClose}
              compact={true}
              entryPoint={entryPoint}
            />
          </div>
          
          {/* Message Thread — Main area */}
          <div className="flex-1 flex flex-col min-w-0">
            {activeConversation ? (
              <MessageThread
                conversation={activeConversation}
                messages={messages}
                loading={loading}
                sending={sending}
                typingUsers={typingUsers}
                onSendMessage={handleSend}
                onStartCall={handleStartCall}
                messagesEndRef={messagesEndRef}
                onSendTyping={sendTypingIndicator}
                isMobile={false}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50/50">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-base font-medium text-gray-500">Select a conversation</p>
                <p className="text-sm text-gray-400 mt-1">Choose from the list to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // ─── MOBILE: WHATSAPP-STYLE LAYOUT ───
  const MobileLayout = () => (
    <div className={`fixed inset-0 z-50 bg-white transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      {view === 'list' ? (
        /* Conversation List View */
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
            <h2 className="font-semibold text-gray-900 text-lg">Messages</h2>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ConversationList
              conversations={conversations}
              activeId={activeConversation?.id}
              onSelect={handleSelectConversation}
              unreadTotal={unreadTotal}
              onClose={onClose}
              compact={false}
              entryPoint={entryPoint}
            />
          </div>
        </div>
      ) : (
        /* Message Thread View */
        <div className="flex flex-col h-full">
          <MessageThread
            conversation={activeConversation}
            messages={messages}
            loading={loading}
            sending={sending}
            typingUsers={typingUsers}
            onSendMessage={handleSend}
            onStartCall={handleStartCall}
            messagesEndRef={messagesEndRef}
            onSendTyping={sendTypingIndicator}
            isMobile={true}
            onBack={handleBackToList}
          />
        </div>
      )}
    </div>
  );

  if (!isOpen) return null;

  return isMobile ? <MobileLayout /> : <DesktopLayout />;
};

export default ChatDrawer;
