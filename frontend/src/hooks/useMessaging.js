// ============================================================================
// MESSAGING HOOK — Conversations, messages, real-time, optimistic UI, retry queue
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { useWebSocket } from './useWebSocket';
import { getGuestSessionId, getGuestProfile, setGuestProfile, linkGuestSessionOnLogin } from '../utils/guestSession';

// Message retry queue
class MessageQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }
  
  add(message) {
    this.queue.push({ ...message, retryCount: 0, maxRetries: 3 });
    this.process();
  }
  
  async process() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;
    
    while (this.queue.length > 0) {
      const msg = this.queue[0];
      try {
        // Attempt send — api interceptor handles auth headers automatically
      const url = msg.caseId
          ? `/conversations/${msg.conversationId}/cases/${msg.caseId}/messages`
          : `/conversations/${msg.conversationId}/messages`;

        let requestData;
        let requestHeaders = {};

        if (msg.attachments && msg.attachments.length > 0) {
          // Use FormData for file uploads
          requestData = new FormData();
          requestData.append('body', msg.body);
          requestData.append('type', msg.type);
          if (msg.metadata) requestData.append('metadata', JSON.stringify(msg.metadata));
          if (msg.replyTo) requestData.append('reply_to', msg.replyTo);
          if (msg.senderName) requestData.append('sender_name', msg.senderName);
          if (msg.senderEmail) requestData.append('sender_email', msg.senderEmail);
          if (msg.caseId) requestData.append('case_id', msg.caseId);
          msg.attachments.forEach((file, idx) => {
            requestData.append('attachment_file', file);
          });
          requestHeaders['Content-Type'] = 'multipart/form-data';
        } else {
          requestData = {
            body: msg.body,
            type: msg.type,
            metadata: msg.metadata,
            reply_to: msg.replyTo,
            sender_name: msg.senderName,
            sender_email: msg.senderEmail,
          };
        }

        const res = await api.post(url, requestData, { headers: requestHeaders });
        
        msg.onSuccess?.(res.data.data);
        this.queue.shift(); // Remove on success
      } catch (err) {
        msg.retryCount++;
        if (msg.retryCount >= msg.maxRetries) {
          msg.onFail?.(err);
          this.queue.shift(); // Remove after max retries
        } else {
          // Wait before retry (exponential backoff)
          await new Promise(r => setTimeout(r, 1000 * Math.pow(2, msg.retryCount - 1)));
        }
      }
    }
    
    this.processing = false;
  }
}

const messageQueue = new MessageQueue();

export const useMessaging = (userId) => {
  const { isConnected, subscribeToConversation, subscribeToUser, echo, reconnect } = useWebSocket(userId);
  
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [incomingCall, setIncomingCall] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [guestProfile, setGuestProfileState] = useState(getGuestProfile());
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // connecting, connected, disconnected
  
  const messagesEndRef = useRef(null);
  const typingTimeoutsRef = useRef(new Map());
  const optimisticIdRef = useRef(0);
  const sendingLockRef = useRef(new Set()); // Track in-flight message bodies to prevent duplicates

  // Generate anonymous display name for guests
  const generateAnonName = useCallback(() => {
    const digits = Math.floor(1000 + Math.random() * 9000);
    return `anon${digits}`;
  }, []);

  // Ensure guest session exists
  useEffect(() => {
    if (!userId) {
      getGuestSessionId();
      const profile = getGuestProfile();
      if (!profile.name) {
        const anonName = generateAnonName();
        setGuestProfile(anonName, profile.email || null);
        setGuestProfileState(getGuestProfile());
      }
    }
  }, [userId, generateAnonName]);

  // Connection status
  useEffect(() => {
    setConnectionStatus(isConnected ? 'connected' : 'disconnected');
  }, [isConnected]);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/conversations');
      const data = res.data.data || [];
      setConversations(data);
      const total = data.reduce((sum, c) => sum + (c.unread_count || 0), 0);
      setUnreadTotal(total);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId, cursor = null, includeFullConversation = false) => {
    if (!conversationId) return;
    setLoading(true);
    try {
      let url = `/conversations/${conversationId}/messages`;
      const params = new URLSearchParams();
      if (cursor) params.append('cursor', cursor);
      if (includeFullConversation) params.append('include_full_conversation', 'true');
      if (params.toString()) url += `?${params.toString()}`;

      const res = await api.get(url);
      // Handle both paginated and direct array responses
      const responseData = res.data.data || res.data || [];
      const newMessages = Array.isArray(responseData) ? responseData : responseData.data || [];
      setMessages(prev => cursor ? [...newMessages, ...prev] : newMessages);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch case-specific messages with optional full conversation context
  const fetchCaseMessages = useCallback(async (conversationId, caseId, includeFullConversation = false) => {
    if (!conversationId || !caseId) return;
    setLoading(true);
    try {
      const res = await api.get(`/conversations/${conversationId}/cases/${caseId}/messages`, {
        params: { include_full_conversation: includeFullConversation }
      });
      const responseData = res.data.data || [];
      const newMessages = Array.isArray(responseData) ? responseData : responseData.data || [];
      setMessages(prev => newMessages);
    } catch (err) {
      console.error('Failed to fetch case messages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Optimistic send with retry queue
  const sendMessage = useCallback(async (conversationId, body, type = 'text', metadata = null, replyTo = null, attachments = []) => {
    if (!body.trim() || !conversationId) return;
    
    // Prevent duplicate sends of the same message within 2 seconds
    const lockKey = `${conversationId}:${body.trim()}`;
    if (sendingLockRef.current.has(lockKey)) {
      console.warn('Duplicate send blocked:', lockKey);
      return;
    }
    sendingLockRef.current.add(lockKey);
    setTimeout(() => sendingLockRef.current.delete(lockKey), 2000);
    
    const optimisticId = `opt-${++optimisticIdRef.current}`;
    const profile = getGuestProfile();
    const now = new Date().toISOString();
    
    // Optimistic UI — add immediately
    const optimisticMessage = {
      id: optimisticId,
      conversation_id: conversationId,
      sender_id: userId || null,
      body: body.trim(),
      type,
      metadata,
      reply_to: replyTo,
      created_at: now,
      read_at: null,
      delivered_at: null,
      status: 'sending',
      is_edited: false,
      is_deleted: false,
      sender: userId ? null : { name: profile.name || 'Guest', avatar: null },
      sender_name: profile.name,
      _optimistic: true,
      _pending: true,
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    setSending(true);
    scrollToBottom();

    // Update conversation preview
    setConversations(prev => prev.map(c => 
      c.id === conversationId 
        ? { ...c, last_message: body.trim(), last_message_at: now }
        : c
    ));

        // Queue for actual send with retry
        messageQueue.add({
          conversationId,
          caseId: metadata?.case_id || null,
          body: body.trim(),
          type,
          metadata,
          replyTo,
          attachments, // Pass attachments for backend processing
          senderName: profile.name,
          senderEmail: profile.email,
          guestSessionId: getGuestSessionId(), // Include for guest auth
          onSuccess: (serverMessage) => {
        // Replace optimistic with real message, preserve status
        setMessages(prev => prev.map(m => 
          m.id === optimisticId ? { ...serverMessage, _pending: false, _optimistic: false, status: serverMessage.status || 'sent' } : m
        ));
        setSending(false);
      },
      onFail: (err) => {
        // Mark as failed
        setMessages(prev => prev.map(m => 
          m.id === optimisticId ? { ...m, _failed: true, _pending: false } : m
        ));
        setSending(false);
        console.error('Message failed after retries:', err);
      },
    });
  }, [userId]);

  const retryMessage = useCallback((optimisticId) => {
    // Find failed message and re-queue
    const failedMsg = messages.find(m => m.id === optimisticId);
    if (failedMsg && failedMsg._failed) {
      setMessages(prev => prev.map(m => 
        m.id === optimisticId ? { ...m, _failed: false, _pending: true } : m
      ));
      messageQueue.add({
        conversationId: failedMsg.conversation_id,
        body: failedMsg.body,
        type: failedMsg.type,
        metadata: failedMsg.metadata,
        replyTo: failedMsg.reply_to,
        senderName: failedMsg.sender_name,
        onSuccess: (serverMessage) => {
          setMessages(prev => prev.map(m => 
            m.id === optimisticId ? { ...serverMessage, _pending: false, _optimistic: false } : m
          ));
        },
        onFail: () => {
          setMessages(prev => prev.map(m => 
            m.id === optimisticId ? { ...m, _failed: true, _pending: false } : m
          ));
        },
      });
    }
  }, [messages]);

  const startConversation = useCallback(async (participantId, type = 'direct', title = null, guestName = null, guestEmail = null) => {
    try {
      const payload = {
        participant_id: participantId,
        type,
        title,
      };

      if (!userId) {
        const profile = getGuestProfile();
        payload.guest_name = guestName || profile.name || 'Guest';
        payload.guest_email = guestEmail || profile.email || null;
      }

      const res = await api.post('/conversations', payload);
      const conversation = res.data.data;
      setConversations(prev => [conversation, ...prev]);
      return conversation;
    } catch (err) {
      console.error('Failed to start conversation:', err);
      return null;
    }
  }, [userId]);

  const startSupportChat = useCallback(async (supportUserId, guestName = null, guestEmail = null) => {
    const profile = getGuestProfile();
    const effectiveName = guestName || profile.name || generateAnonName();
    const effectiveEmail = guestEmail || profile.email || null;
    
    // Ensure guest session exists first
    getGuestSessionId();
    
    // Update profile
    setGuestProfile(effectiveName, effectiveEmail);
    setGuestProfileState(getGuestProfile());

    return startConversation(supportUserId, 'support', 'Oshocks Support', effectiveName, effectiveEmail);
  }, [startConversation, generateAnonName]);

    const markAsRead = useCallback(async (conversationId) => {
    try {
      // Mark conversation as read (batch operation)
      await api.post(`/conversations/${conversationId}/read`);
      
      // Also mark all visible messages as read individually for real-time sync
      const unreadMessages = messages.filter(m => 
        m.conversation_id === conversationId && 
        !m.read_at && 
        m.sender_id !== userId &&
        !m._optimistic
      );
      
      // Batch mark messages as read
      if (unreadMessages.length > 0) {
        const messageIds = unreadMessages.map(m => m.id).filter(id => id && !id.startsWith('opt-'));
        if (messageIds.length > 0) {
          await api.post(`/conversations/${conversationId}/messages/read`, { message_ids: messageIds });
        }
      }

      setConversations(prev => prev.map(c =>
        c.id === conversationId ? { ...c, unread_count: 0 } : c
      ));
      setUnreadTotal(prev => Math.max(0, prev - (conversations.find(c => c.id === conversationId)?.unread_count || 0)));
      
      // Update local message statuses
      setMessages(prev => prev.map(m =>
        m.conversation_id === conversationId && m.sender_id !== userId
          ? { ...m, status: 'read', read_at: new Date().toISOString() }
          : m
      ));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }, [conversations, messages, userId]);

  const pinConversation = useCallback(async (conversationId) => {
    try {
      await api.post(`/conversations/${conversationId}/pin`);
      setConversations(prev => prev.map(c =>
        c.id === conversationId ? { ...c, is_pinned: !c.is_pinned } : c
      ));
    } catch (err) {
      console.error('Failed to pin conversation:', err);
    }
  }, []);

  const archiveConversation = useCallback(async (conversationId) => {
    try {
      await api.post(`/conversations/${conversationId}/archive`);
      setConversations(prev => prev.map(c =>
        c.id === conversationId ? { ...c, is_archived: !c.is_archived } : c
      ));
    } catch (err) {
      console.error('Failed to archive conversation:', err);
    }
  }, []);

  const deleteConversation = useCallback(async (conversationId) => {
    try {
      await api.delete(`/conversations/${conversationId}`);
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      if (activeConversation?.id === conversationId) {
        setActiveConversation(null);
      }
      setUnreadTotal(prev => Math.max(0, prev - (conversations.find(c => c.id === conversationId)?.unread_count || 0)));
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      throw err;
    }
  }, [activeConversation, conversations]);

  const sendTypingIndicator = useCallback((conversationId, isTyping) => {
    if (!echo) return;
    
    // Debounce: clear existing timeout for this conversation
    const key = `${conversationId}`;
    if (typingTimeoutsRef.current.has(key)) {
      clearTimeout(typingTimeoutsRef.current.get(key));
    }
    
    // Send via WebSocket
    try {
      echo.private(`conversation.${conversationId}`)
        .whisper('typing', {
          user_id: userId,
          guest_session_id: !userId ? getGuestSessionId() : null,
          name: getGuestProfile().name || 'Guest',
          is_typing: isTyping,
        });
    } catch (err) {
      console.error('Failed to send typing indicator:', err);
    }
    
    // Auto-clear after 5s
    if (isTyping) {
      const timeout = setTimeout(() => {
        sendTypingIndicator(conversationId, false);
      }, 5000);
      typingTimeoutsRef.current.set(key, timeout);
    }
  }, [echo, userId]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Link guest sessions on login
  useEffect(() => {
    if (userId) {
      linkGuestSessionOnLogin(api).then(() => {
        fetchConversations();
      }).catch(err => {
        console.log('Guest session link skipped or failed:', err.message);
      });
    }
  }, [userId]);

      // Subscribe to real-time messages
  useEffect(() => {
    if (!activeConversation?.id || !isConnected) return;

    // Prevent duplicate subscriptions for same conversation
    const convId = activeConversation.id;
    const unsubscribe = subscribeToConversation(
      convId,
      (event) => { // onMessageSent
        const messageData = event.message || event;
        console.log('📥 Message sent:', { id: messageData.id, body: messageData.body?.substring(0, 50), sender_id: messageData.sender_id });

        setMessages(prev => {
          // Deduplication: check by real ID
          const hasById = prev.some(m => m.id === messageData.id);
          if (hasById) return prev;

          // Check if there's a pending optimistic message from same sender with same body
          const optimisticIndex = prev.findIndex(m => 
            m._optimistic && 
            m.body === messageData.body && 
            m.sender_id === messageData.sender_id &&
            m._pending === true
          );

          if (optimisticIndex !== -1) {
            const next = [...prev];
            next[optimisticIndex] = { ...messageData, _pending: false, _optimistic: false, status: messageData.status || 'delivered' };
            return next;
          }

          // New message from other user — append it
          return [...prev, { ...messageData, _pending: false, _optimistic: false, status: messageData.status || 'delivered' }];
        });

        // Only scroll if message is from someone else
        if (messageData.sender_id !== userId) {
          scrollToBottom();
        }

        setConversations(prev => prev.map(c =>
          c.id === convId
            ? { ...c, last_message: messageData.body, last_message_at: messageData.created_at, unread_count: (c.unread_count || 0) + (messageData.sender_id !== userId ? 1 : 0) }
            : c
        ));
      },
      (event) => { // onMessageDelivered
        console.log('📬 Delivered:', event.message_id);
        setMessages(prev => prev.map(m =>
          m.id === event.message_id ? { ...m, status: 'delivered', delivered_at: event.delivered_at } : m
        ));
      },
      (event) => { // onMessageRead
        console.log('👁️ Read:', event.message_id);
        setMessages(prev => prev.map(m =>
          m.id === event.message_id ? { ...m, status: 'read', read_at: event.read_at } : m
        ));
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation?.id, isConnected]);

  // Subscribe to typing indicators
  useEffect(() => {
    if (!activeConversation?.id || !echo) return;

    const channel = echo.private(`conversation.${activeConversation.id}`);
    
    channel.listenForWhisper('typing', (event) => {
      if (event.user_id === userId) return; // Ignore self
      
      setTypingUsers(prev => {
        const filtered = prev.filter(u => u.user_id !== event.user_id && u.guest_session_id !== event.guest_session_id);
        if (event.is_typing) {
          return [...filtered, {
            user_id: event.user_id,
            guest_session_id: event.guest_session_id,
            name: event.name,
          }];
        }
        return filtered;
      });
    });

    return () => {
      channel.stopListeningForWhisper('typing');
    };
  }, [activeConversation?.id, echo, userId]);

  // Subscribe to incoming calls
  useEffect(() => {
    if (!userId || !isConnected) return;

    const unsubscribe = subscribeToUser((event) => {
      console.log('📞 Incoming call:', event);
      setIncomingCall({
        sessionId: event.session_id,
        callType: event.call_type,
        caller: event.caller,
        conversationId: event.conversation_id,
        startedAt: event.started_at,
      });
    });

    return unsubscribe;
  }, [userId, isConnected, subscribeToUser]);

  const dismissIncomingCall = useCallback(() => {
    setIncomingCall(null);
  }, []);

  // Initial fetch — for both auth users and guests
  useEffect(() => {
    const shouldFetch = userId || getGuestSessionId();
    if (shouldFetch) {
      fetchConversations();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return {
    conversations,
    activeConversation,
    messages,
    loading,
    sending,
    unreadTotal,
    incomingCall,
    typingUsers,
    messagesEndRef,
    echo,
    guestProfile,
    connectionStatus,
    setGuestProfile: (name, email) => {
      setGuestProfile(name, email);
      setGuestProfileState(getGuestProfile());
    },
    setActiveConversation,
    setMessages,        // ✅ ADD THIS
    fetchConversations,
    fetchMessages,
    fetchCaseMessages,
    sendMessage,
    retryMessage,
    startConversation,
    startSupportChat,
    markAsRead,
    pinConversation,
    archiveConversation,
    deleteConversation,
    scrollToBottom,
    dismissIncomingCall,
    sendTypingIndicator,
    isConnected,
    reconnect,
  };
};

export default useMessaging;
