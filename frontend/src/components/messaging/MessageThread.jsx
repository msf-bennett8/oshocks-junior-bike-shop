// ============================================================================
// MESSAGE THREAD — Active conversation with input, scroll, call button
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import MessageBubble from './MessageBubble';
import { useAuth } from '../../context/AuthContext';

const MessageThread = ({
  conversation,
  messages,
  loading,
  sending,
  onSendMessage,
  onStartCall,
  messagesEndRef,
}) => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  // Auto-focus input when conversation changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [conversation?.id]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, messagesEndRef]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const otherParticipant = conversation?.other_participant;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <img
            src={otherParticipant?.avatar || '/default-avatar.png'}
            alt={otherParticipant?.name}
            className="w-10 h-10 rounded-full bg-gray-200"
          />
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">
              {otherParticipant?.name || conversation?.title || 'Unknown'}
            </h3>
            <p className="text-xs text-green-500">Online</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onStartCall('voice')}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
            title="Voice call"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
          <button
            onClick={() => onStartCall('video')}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
            title="Video call"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {loading && messages.length === 0 && (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
          </div>
        )}
        
        {messages.map((msg, idx) => {
          const isOwn = msg.sender_id === user?.id;
          const prevMsg = messages[idx - 1];
          const showAvatar = !prevMsg || prevMsg.sender_id !== msg.sender_id;
          
          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={isOwn}
              showAvatar={showAvatar}
            />
          );
        })}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-gray-200 bg-white">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none max-h-32 px-4 py-2.5 bg-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ minHeight: '44px' }}
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className={`p-3 rounded-full transition-colors ${
              input.trim() && !sending
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageThread;
