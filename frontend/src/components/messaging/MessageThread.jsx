// ============================================================================
// MESSAGE THREAD — Active conversation with input, scroll, call, reply, reactions
// ============================================================================
// Features: Read receipts, reply-to, edit, delete, reactions, typing indicator
// ============================================================================

import React, { useEffect, useRef, useState, useCallback } from 'react';
import MessageBubble from './MessageBubble';
import CaseThreadHeader from './CaseThreadHeader';
import CaseCreateModal from './CaseCreateModal';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft, Phone, Video, MoreVertical, Send, Paperclip,
  Smile, X, Reply, Pencil, Trash2, CheckCheck, Check,
  Copy, CheckCircle2, Headphones, ShoppingBag, AlertCircle
} from 'lucide-react';
import Avatar from '../common/Avatar';

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉'];

const MessageThread = ({
  conversation,
  messages,
  setMessages,        // ✅ ADD THIS
  loading,
  sending,
  typingUsers,
  onSendMessage,
  onStartCall,
  messagesEndRef,
  onSendTyping,
  isMobile = false,
  onBack,
  onClaimCase,
  onResolveCase,
  onEscalateCase,
  onCloseCase,
  onMessagesAppended,
  onLoadFullConversation,
}) => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [showCaseActions, setShowCaseActions] = useState(false);
  const [showCreateCase, setShowCreateCase] = useState(false);
  const [showFullConversation, setShowFullConversation] = useState(false);
  const [loadingFullConversation, setLoadingFullConversation] = useState(false);
  const [activeCaseId, setActiveCaseId] = useState(null);
  const [conversationCases, setConversationCases] = useState([]);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Fetch cases in this conversation
  useEffect(() => {
    if (conversation?.id && conversation?.is_support_case) {
      api.get(`/conversations/${conversation.id}/cases`).then(res => {
        setConversationCases(res.data.data || []);
        // Auto-select first active case
        const active = res.data.data?.find(c => !['resolved', 'closed'].includes(c.status));
        if (active) setActiveCaseId(active.case_id);
      }).catch(() => {});
    }
  }, [conversation?.id]);

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

  // Close case actions dropdown on click outside
  useEffect(() => {
    if (!showCaseActions) return;
    const handleClick = () => setShowCaseActions(false);
    setTimeout(() => document.addEventListener('click', handleClick), 0);
    return () => document.removeEventListener('click', handleClick);
  }, [showCaseActions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
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
      e.stopPropagation();
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

  const formatTime = (iso) => {
    if (!iso) return '';
    const date = new Date(iso);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
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
            <Avatar
              src={otherParticipant?.avatar}
              name={otherParticipant?.name}
              size={40}
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

      {/* ─── CASE THREAD HEADERS (All Cases in Conversation) ─── */}
      {conversation?.is_support_case && conversationCases.length > 0 && (
        <div className="px-2 py-2 bg-gray-50/50 border-b border-gray-100 flex-shrink-0 max-h-[200px] overflow-y-auto">
          <div className="flex items-center justify-between px-2 mb-1.5">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Active Cases</span>
            <button
              onClick={() => setShowCreateCase(true)}
              className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full hover:bg-orange-200 transition-colors font-medium"
            >
              + New Case
            </button>
          </div>
          {conversationCases.map(c => (
            <CaseThreadHeader
              key={c.case_id}
              supportCase={c}
              isActive={activeCaseId === c.case_id}
              onClick={() => setActiveCaseId(c.case_id === activeCaseId ? null : c.case_id)}
            />
          ))}
        </div>
      )}

      {/* ─── CASE INFO BANNER (Legacy Single Case) ─── */}
      {conversation?.support_case && !conversationCases.length && (
        <div className="px-4 py-2.5 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100 flex-shrink-0">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1 px-2 py-1 bg-white/80 rounded-lg border border-orange-200">
                <Headphones className="w-3.5 h-3.5 text-orange-600" />
                <span className="text-xs font-mono font-bold text-orange-800">
                  {conversation.support_case.case_id}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(conversation.support_case.case_id);
                    // Optional: show toast
                  }}
                  className="p-0.5 hover:bg-orange-100 rounded transition-colors"
                  title="Copy case ID"
                >
                  <Copy className="w-3 h-3 text-orange-400" />
                </button>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                conversation.support_case.status === 'new' ? 'bg-gray-100 text-gray-600' :
                conversation.support_case.status === 'open' ? 'bg-blue-100 text-blue-700' :
                conversation.support_case.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                conversation.support_case.status === 'pending_user' ? 'bg-purple-100 text-purple-700' :
                conversation.support_case.status === 'resolved' ? 'bg-green-100 text-green-700' :
                conversation.support_case.status === 'closed' ? 'bg-slate-100 text-slate-600' :
                'bg-red-100 text-red-700'
              }`}>
                {conversation.support_case.status?.replace('_', ' ').toUpperCase()}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                conversation.support_case.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                conversation.support_case.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                conversation.support_case.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                'bg-green-100 text-green-700'
              }`}>
                {conversation.support_case.priority?.toUpperCase()}
              </span>
            </div>
            
            {/* Agent actions dropdown */}
            {user?.canHandleSupportCases && (
              <div className="relative">
                <button
                  onClick={() => setShowCaseActions(!showCaseActions)}
                  className="text-xs bg-white border border-orange-200 text-orange-700 px-2.5 py-1 rounded-lg hover:bg-orange-50 transition-colors font-medium flex items-center gap-1"
                >
                  Actions
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showCaseActions && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-30 min-w-[140px] py-1">
                    {conversation.support_case.status === 'new' && !conversation.support_case.assigned_to && (
                      <button
                        onClick={() => { onClaimCase?.(conversation.support_case.case_id); setShowCaseActions(false); }}
                        className="w-full text-left px-3 py-2 text-xs text-blue-700 hover:bg-blue-50 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Claim Case
                      </button>
                    )}
                    {['open', 'in_progress', 'pending_user', 'escalated'].includes(conversation.support_case.status) && (
                      <button
                        onClick={() => { onResolveCase?.(conversation.support_case.case_id); setShowCaseActions(false); }}
                        className="w-full text-left px-3 py-2 text-xs text-green-700 hover:bg-green-50 flex items-center gap-1.5"
                      >
                        <CheckCheck className="w-3.5 h-3.5" /> Resolve
                      </button>
                    )}
                    {conversation.support_case.status !== 'escalated' && conversation.support_case.status !== 'closed' && (
                      <button
                        onClick={() => { onEscalateCase?.(conversation.support_case.case_id); setShowCaseActions(false); }}
                        className="w-full text-left px-3 py-2 text-xs text-red-700 hover:bg-red-50 flex items-center gap-1.5"
                      >
                        <AlertCircle className="w-3.5 h-3.5" /> Escalate
                      </button>
                    )}
                    {conversation.support_case.status === 'resolved' && (
                      <button
                        onClick={() => { onCloseCase?.(conversation.support_case.case_id); setShowCaseActions(false); }}
                        className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" /> Close
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Order link if applicable — check both conversation.order and support_case.order */}
          {(conversation.order || conversation.support_case?.order) && (
            <div className="mt-1.5 flex items-center gap-2 text-[11px] text-gray-500">
              <ShoppingBag className="w-3 h-3" />
              <span className="font-mono text-gray-600">
                {(conversation.support_case?.order?.order_display || conversation.support_case?.order?.order_number || conversation.support_case?.order?.purchase_id) ||
                 (conversation.order?.order_display || conversation.order?.order_number || conversation.order?.purchase_id)}
              </span>
              <button
                onClick={() => {
                  const orderDisplay = (conversation.support_case?.order?.order_display || conversation.support_case?.order?.order_number || conversation.support_case?.order?.purchase_id) ||
                                       (conversation.order?.order_display || conversation.order?.order_number || conversation.order?.purchase_id);
                  navigator.clipboard.writeText(orderDisplay);
                }}
                className="p-0.5 hover:bg-orange-100 rounded transition-colors"
                title="Copy order ID"
              >
                <Copy className="w-3 h-3 text-orange-400" />
              </button>
              <span>•</span>
              <span>{conversation.support_case?.order?.status || conversation.order?.status}</span>
            </div>
          )}
        </div>
      )}

      {/* ─── CREATE CASE MODAL ─── */}
            {showCreateCase && (
        <CaseCreateModal
          conversationId={conversation.id}
          onClose={() => setShowCreateCase(false)}
          onCreated={(data) => {
            setConversationCases(prev => [data.support_case, ...prev]);
            setActiveCaseId(data.support_case.case_id);
            
            if (data.system_message) {
              setMessages(prev => [...prev, data.system_message]);
            }
            if (data.user_message) {
              setMessages(prev => [...prev, data.user_message]);
            }
          }}
        />
      )}

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
              {/* Non-case message indicator (when showing full conversation) */}
              {showFullConversation && msg.case_id && msg.case_id !== activeCaseId && activeCaseId && (
                <div className="flex justify-center my-1">
                  <div className="bg-orange-50 border border-orange-100 rounded-lg px-3 py-1 flex items-center gap-1.5 cursor-pointer hover:bg-orange-100 transition-colors"
                    onClick={() => setActiveCaseId(msg.case_id)}
                  >
                    <span className="text-[10px] text-orange-500 font-mono">{msg.case_id}</span>
                    <span className="text-[10px] text-orange-400">Click to view</span>
                  </div>
                </div>
              )}

              {/* System messages */}
              {msg.type === 'system' ? (
                <div className="flex justify-center my-3">
                  <div className={`border rounded-full px-4 py-1.5 flex items-center gap-2 ${
                    msg.body?.includes('New Case Created') 
                      ? 'bg-orange-100 border-orange-200' 
                      : 'bg-gray-100 border-gray-200'
                  }`}>
                    <span className={msg.body?.includes('New Case Created') ? 'text-orange-500' : 'text-gray-400'}>📌</span>
                    <span className={`text-xs ${
                      msg.body?.includes('New Case Created') ? 'text-orange-700 font-medium' : 'text-gray-500'
                    }`}>{msg.body}</span>
                    <span className="text-[10px] text-gray-400">{formatTime(msg.created_at)}</span>
                  </div>
                </div>
              ) : (
                <MessageBubble
                  message={msg}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                  isLastInGroup={isLastInGroup}
                  isContextMessage={showFullConversation && msg.case_id !== activeCaseId && msg.type !== 'system'}
                  onReply={() => handleReply(msg)}
                  onEdit={() => handleEdit(msg)}
                  onDelete={() => handleDelete(msg)}
                  onReaction={(reaction) => handleReaction(msg.id, reaction)}
                  replyToMessage={msg.reply_to ? messages.find(m => m.id === msg.reply_to) : null}
                />
              )}
              
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
        
        {/* ─── SEE FULL CONVERSATION BUTTON ─── */}
        {conversation?.is_support_case && !showFullConversation && onLoadFullConversation && (
          <div className="flex justify-center py-4">
            <button
              onClick={async () => {
                setLoadingFullConversation(true);
                try {
                  await onLoadFullConversation?.(conversation.id, activeCaseId, true);
                  setShowFullConversation(true);
                } catch (err) {
                  console.error('Failed to load full conversation:', err);
                } finally {
                  setLoadingFullConversation(false);
                }
              }}
              disabled={loadingFullConversation}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-full border border-gray-200 transition-colors disabled:opacity-50"
            >
              {loadingFullConversation ? (
                <>
                  <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  See Full Conversation
                </>
              )}
            </button>
          </div>
        )}

        {/* ─── FULL CONVERSATION LOADED INDICATOR ─── */}
        {showFullConversation && (
          <div className="flex justify-center py-2">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Showing full conversation history
              <button
                onClick={() => {
                  setShowFullConversation(false);
                  // Reload case-only messages
                  onLoadFullConversation?.(conversation.id, activeCaseId, false);
                }}
                className="text-blue-500 hover:text-blue-700 font-medium ml-1"
              >
                Show case only
              </button>
            </div>
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
