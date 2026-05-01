// ============================================================================
// MESSAGE THREAD — Active conversation with input, scroll, call, reply, reactions
// ============================================================================
// Features: Read receipts, reply-to, edit, delete, reactions, typing indicator
// ============================================================================

import React, { useEffect, useRef, useState, useCallback } from 'react';
import MessageBubble from './MessageBubble';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeft, Phone, Video, MoreVertical, Send, Paperclip, 
  Smile, X, Reply, Pencil, Trash2, CheckCheck, Check
} from 'lucide-react';

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉'];

const MessageThread = ({
  conversation,
  messages,
  loading,
  sending,
  typingUsers,
  onSendMessage,
  onStartCall,
  messagesEndRef,
  onSendTyping,
  isMobile = false,
  onBack,
}) => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const otherParticipant = conversation?.other_participant;
  const isOnline = otherParticipant?.is_online;
  const lastSeen = otherParticipant?.last_seen;

  // Auto-focus input
  useEffect(() => {
    if (!isMobile) inputRef.current?.focus();
  }, [conversation?.id, isMobile]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers, messagesEndRef]);

  // Mark messages as read when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const msgId = entry.target.dataset.messageId;
            if (msgId) {
              // TODO: Emit read receipt via WebSocket
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    const messageElements = messagesContainerRef.current?.querySelectorAll('[data-message-id]');
    messageElements?.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    
    if (editingMessage) {
      // TODO: Implement edit API
      onSendMessage(input.trim(), null, [], editingMessage.id);
      setEditingMessage(null);
    } else {
      onSendMessage(input.trim(), replyTo?.id);
    }
    
    setInput('');
    setReplyTo(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    
    // Send typing indicator
    if (onSendTyping && conversation?.id) {
      onSendTyping(conversation.id, true);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      // Stop typing after 3 seconds
      typingTimeoutRef.current = setTimeout(() => {
        onSendTyping(conversation.id, false);
      }, 3000);
    }
  };

  const handleReply = (message) => {
    setReplyTo(message);
    setEditingMessage(null);
    inputRef.current?.focus();
  };

  const handleEdit = (message) => {
    if (message.sender_id !== user?.id) return;
    setEditingMessage(message);
    setInput(message.body);
    setReplyTo(null);
    inputRef.current?.focus();
  };

  const handleDelete = (message) => {
    if (message.sender_id !== user?.id) return;
    // TODO: Implement soft delete API
    if (window.confirm('Delete this message?')) {
      // onDeleteMessage(message.id);
    }
  };

  const handleReaction = (messageId, reaction) => {
    // TODO: Implement reaction API
    console.log('Reaction:', messageId, reaction);
  };

  const cancelReply = () => {
    setReplyTo(null);
    setEditingMessage(null);
    setInput('');
  };

  const formatLastSeen = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    if (now - d < 60000) return 'just now';
    if (now - d < 3600000) return `${Math.floor((now - d) / 60000)}m ago`;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ─── HEADER ─── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {isMobile && (
            <button 
              onClick={onBack}
              className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          
          <div className="relative flex-shrink-0">
            <img
              src={otherParticipant?.avatar || '/default-avatar.png'}
              alt={otherParticipant?.name}
              className="w-10 h-10 rounded-full bg-gray-200 object-cover"
              onError={(e) => { e.target.src = '/default-avatar.png'; }}
            />
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>
          
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate">
              {otherParticipant?.name || conversation?.title || 'Support'}
            </h3>
            <p className="text-xs text-gray-500">
              {isOnline ? (
                <span className="text-green-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  Online
                </span>
              ) : lastSeen ? (
                `Last seen ${formatLastSeen(lastSeen)}`
              ) : (
                'Offline'
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onStartCall('voice')}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
            title="Voice call"
          >
            <Phone className="w-5 h-5" />
          </button>
          <button
            onClick={() => onStartCall('video')}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
            title="Video call"
          >
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ─── MESSAGES ─── */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1 bg-gray-50/30"
      >
        {loading && messages.length === 0 && (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
          </div>
        )}
        
        {/* Date separator — TODO: group by date */}
        
        {messages.map((msg, idx) => {
          const isOwn = msg.sender_id === user?.id;
          const prevMsg = messages[idx - 1];
          const nextMsg = messages[idx + 1];
          const showAvatar = !prevMsg || prevMsg.sender_id !== msg.sender_id;
          const isLastInGroup = !nextMsg || nextMsg.sender_id !== msg.sender_id;
          
          return (
            <div 
              key={msg.id} 
              data-message-id={msg.id}
              className="group relative"
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({ msgId: msg.id, x: e.clientX, y: e.clientY });
              }}
            >
              <MessageBubble
                message={msg}
                isOwn={isOwn}
                showAvatar={showAvatar}
                isLastInGroup={isLastInGroup}
                onReply={() => handleReply(msg)}
                onEdit={() => handleEdit(msg)}
                onDelete={() => handleDelete(msg)}
                onReaction={(reaction) => handleReaction(msg.id, reaction)}
                replyToMessage={msg.reply_to ? messages.find(m => m.id === msg.reply_to) : null}
              />
              
              {/* Hover reaction bar */}
              <div className={`absolute ${isOwn ? 'left-0' : 'right-0'} top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-lg rounded-full px-2 py-1 flex items-center gap-1 z-10`}>
                {REACTIONS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(msg.id, emoji)}
                    className="hover:scale-125 transition-transform text-sm"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        
        {/* Typing indicator */}
        {typingUsers?.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs text-gray-500">
              {typingUsers.map(u => u.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* ─── REPLY / EDIT PREVIEW ─── */}
      {(replyTo || editingMessage) && (
        <div className="px-4 py-2 bg-blue-50 border-t border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {editingMessage ? <Pencil className="w-4 h-4 text-blue-600 flex-shrink-0" /> : <Reply className="w-4 h-4 text-blue-600 flex-shrink-0" />}
            <div className="min-w-0">
              <p className="text-xs text-blue-600 font-medium">
                {editingMessage ? 'Editing message' : `Replying to ${replyTo?.sender?.name || 'Guest'}`}
              </p>
              <p className="text-xs text-gray-500 truncate">{editingMessage?.body || replyTo?.body}</p>
            </div>
          </div>
          <button onClick={cancelReply} className="p-1 hover:bg-blue-100 rounded-full flex-shrink-0">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      )}

      {/* ─── INPUT ─── */}
      <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-end gap-2">
          {/* Attachment button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              className="p-2.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors flex-shrink-0"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            {showAttachmentMenu && (
              <div className="absolute bottom-full left-0 mb-2 bg-white shadow-xl rounded-xl border border-gray-200 py-2 w-48 z-20">
                <button type="button" className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                  📷 Photo
                </button>
                <button type="button" className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                  🎥 Video
                </button>
                <button type="button" className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                  📄 Document
                </button>
              </div>
            )}
          </div>

          {/* Emoji button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors flex-shrink-0"
            >
              <Smile className="w-5 h-5" />
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2 bg-white shadow-xl rounded-xl border border-gray-200 p-3 grid grid-cols-6 gap-2 z-20">
                {REACTIONS.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => { setInput(prev => prev + emoji); setShowEmojiPicker(false); }}
                    className="text-xl hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Text input */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={editingMessage ? 'Edit your message...' : replyTo ? 'Write a reply...' : 'Type a message...'}
            rows={1}
            className="flex-1 resize-none max-h-32 px-4 py-2.5 bg-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            style={{ minHeight: '44px' }}
          />
          
          {/* Send button */}
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className={`p-3 rounded-full transition-all flex-shrink-0 ${
              input.trim() && !sending
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>

      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="fixed bg-white shadow-xl rounded-lg py-1 z-50 border border-gray-200 w-40"
          style={{ top: contextMenu.y, left: Math.min(contextMenu.x, window.innerWidth - 170) }}
          onClick={() => setContextMenu(null)}
        >
          <button 
            onClick={() => handleReply(messages.find(m => m.id === contextMenu.msgId))}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
          >
            <Reply className="w-4 h-4" /> Reply
          </button>
          {messages.find(m => m.id === contextMenu.msgId)?.sender_id === user?.id && (
            <>
              <button 
                onClick={() => handleEdit(messages.find(m => m.id === contextMenu.msgId))}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Pencil className="w-4 h-4" /> Edit
              </button>
              <button 
                onClick={() => handleDelete(messages.find(m => m.id === contextMenu.msgId))}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageThread;
