// ============================================================================
// MESSAGING HOOK — Conversations, messages, real-time inbox (FIXED)
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { useWebSocket } from './useWebSocket';

export const useMessaging = (userId) => {
  const { isConnected, subscribeToConversation, subscribeToUser, echo } = useWebSocket(userId);
  
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [incomingCall, setIncomingCall] = useState(null);
  
  const messagesEndRef = useRef(null);

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

  const fetchMessages = useCallback(async (conversationId, cursor = null) => {
    if (!conversationId) return;
    setLoading(true);
    try {
      const url = `/conversations/${conversationId}/messages${cursor ? `?cursor=${cursor}` : ''}`;
      const res = await api.get(url);
      const newMessages = res.data.data || [];
      setMessages(prev => cursor ? [...newMessages, ...prev] : newMessages);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (conversationId, body, type = 'text', metadata = null) => {
    if (!body.trim() || !conversationId) return;
    
    setSending(true);
    try {
      const res = await api.post(`/conversations/${conversationId}/messages`, {
        body,
        type,
        metadata,
      });
      
      setMessages(prev => [...prev, res.data.data]);
      scrollToBottom();
      
      setConversations(prev => prev.map(c => 
        c.id === conversationId 
          ? { ...c, last_message: body, last_message_at: new Date().toISOString() }
          : c
      ));
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  }, []);

  const startConversation = useCallback(async (participantId, type = 'direct', title = null) => {
    try {
      const res = await api.post('/conversations', {
        participant_id: participantId,
        type,
        title,
      });
      const conversation = res.data.data;
      setConversations(prev => [conversation, ...prev]);
      return conversation;
    } catch (err) {
      console.error('Failed to start conversation:', err);
      return null;
    }
  }, []);

  const markAsRead = useCallback(async (conversationId) => {
    try {
      await api.post(`/conversations/${conversationId}/read`);
      setConversations(prev => prev.map(c => 
        c.id === conversationId ? { ...c, unread_count: 0 } : c
      ));
      setUnreadTotal(prev => Math.max(0, prev - (conversations.find(c => c.id === conversationId)?.unread_count || 0)));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }, [conversations]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!activeConversation?.id || !isConnected) return;

    const unsubscribe = subscribeToConversation(activeConversation.id, (event) => {
      setMessages(prev => {
        const exists = prev.some(m => m.id === event.id);
        if (exists) return prev;
        return [...prev, event];
      });
      
      scrollToBottom();
      
      setConversations(prev => prev.map(c => 
        c.id === activeConversation.id
          ? { ...c, last_message: event.body, last_message_at: event.created_at }
          : c
      ));
    });

    return unsubscribe;
  }, [activeConversation?.id, isConnected, subscribeToConversation, scrollToBottom]);

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

  useEffect(() => {
    if (userId) fetchConversations();
  }, [userId, fetchConversations]);

  return {
    conversations,
    activeConversation,
    messages,
    loading,
    sending,
    unreadTotal,
    incomingCall,
    messagesEndRef,
    echo, // <-- EXPOSED for useWebRTC
    setActiveConversation,
    fetchConversations,
    fetchMessages,
    sendMessage,
    startConversation,
    markAsRead,
    scrollToBottom,
    dismissIncomingCall,
    isConnected,
  };
};

export default useMessaging;
