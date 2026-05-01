// ============================================================================
// CHAT DRAWER — Slide-out panel with conversation list + thread
// ============================================================================

import React, { useEffect } from 'react';
import ConversationList from './ConversationList';
import MessageThread from './MessageThread';
import { useMessaging } from '../../hooks/useMessaging';
import { useAuth } from '../../context/AuthContext';

const ChatDrawer = ({ isOpen, onClose, onStartCall }) => {
  const { user } = useAuth();
  const {
    conversations,
    activeConversation,
    messages,
    loading,
    sending,
    unreadTotal,
    messagesEndRef,
    setActiveConversation,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markAsRead,
  } = useMessaging(user?.id);

  // Load conversations when drawer opens
  useEffect(() => {
    if (isOpen && user?.id) {
      fetchConversations();
    }
  }, [isOpen, user?.id, fetchConversations]);

  // Load messages when conversation selected
  useEffect(() => {
    if (activeConversation?.id) {
      fetchMessages(activeConversation.id);
      markAsRead(activeConversation.id);
    }
  }, [activeConversation?.id, fetchMessages, markAsRead]);

  const handleSend = (body) => {
    if (activeConversation?.id) {
      sendMessage(activeConversation.id, body);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="relative flex w-[900px] max-w-[95vw] h-full bg-white shadow-2xl animate-slide-in-right">
        <ConversationList
          conversations={conversations}
          activeId={activeConversation?.id}
          onSelect={setActiveConversation}
          unreadTotal={unreadTotal}
          onClose={onClose}
          onStartNewConversation={(formData) => {
            console.log('Start new conversation:', formData);
            // TODO: Implement createConversation(formData.name, formData.identifier)
          }}
        />
        
        <div className="flex-1">
          {activeConversation ? (
            <MessageThread
              conversation={activeConversation}
              messages={messages}
              loading={loading}
              sending={sending}
              onSendMessage={handleSend}
              onStartCall={handleStartCall}
              messagesEndRef={messagesEndRef}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm">Or start a new one from a product or order</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatDrawer;