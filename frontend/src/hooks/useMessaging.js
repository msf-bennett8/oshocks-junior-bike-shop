// ============================================================================
// MESSAGING HOOK — Conversations, messages, real-time inbox (GUEST SUPPORT)
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { useWebSocket } from './useWebSocket';
import { getGuestSessionId, getGuestProfile, setGuestProfile, linkGuestSessionOnLogin } from '../utils/guestSession';

export const useMessaging = (userId) => {
  const { isConnected, subscribeToConversation, subscribeToUser, echo } = useWebSocket(userId);
  
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [incomingCall, setIncomingCall] = useState(null);
  const [guestProfile, setGuestProfileState] = useState(getGuestProfile());
  
  const messagesEndRef = useRef(null);

  // Generate anonymous display name for guests (anonXXXX where X = random 4 digits)
  const generateAnonName = useCallback(() => {
    const digits = Math.floor(1000 + Math.random() * 9000); // 1000-9999
    return `anon${digits}`;
  }, []);

  // Ensure guest session exists and has anon name
  useEffect(() => {
    if (!userId) {
      const sessionId = getGuestSessionId(); // Initialize if not exists
      const profile = getGuestProfile();
      
      // Auto-generate anon name if guest hasn't set one
      if (!profile.name) {
        const anonName = generateAnonName();
        setGuestProfile(anonName, profile.email || null);
        setGuestProfileState(getGuestProfile());
      }
    }
  }, [userId, generateAnonName]);

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
      const payload = {
        body,
        type,
        metadata,
      };

      // Add guest profile info if not authenticated
      if (!userId) {
        const profile = getGuestProfile();
        if (profile.name) payload.sender_name = profile.name;
        if (profile.email) payload.sender_email = profile.email;
      }

      const res = await api.post(`/conversations/${conversationId}/messages`, payload);
      
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
  }, [userId]);

  const startConversation = useCallback(async (participantId, type = 'direct', title = null, guestName = null, guestEmail = null) => {
    try {
      const payload = {
        participant_id: participantId,
        type,
        title,
      };

      // Add guest info for anonymous users
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
    // Ensure guest has anon name before starting chat
    const profile = getGuestProfile();
    const effectiveName = guestName || profile.name || generateAnonName();
    const effectiveEmail = guestEmail || profile.email || null;
    
    // Save guest profile
    setGuestProfile(effectiveName, effectiveEmail);
    setGuestProfileState(getGuestProfile());

    return startConversation(supportUserId, 'support', 'Oshocks Support', effectiveName, effectiveEmail);
  }, [startConversation, generateAnonName]);

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

  // Link guest sessions when user logs in
  useEffect(() => {
    if (userId) {
      linkGuestSessionOnLogin(api).then(() => {
        // Refresh conversations after linking
        fetchConversations();
      }).catch(err => {
        console.log('Guest session link skipped or failed:', err.message);
      });
    }
  }, [userId]); // Removed fetchConversations from deps to prevent loop

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
    // Only fetch conversations when we have auth OR guest session is ready
    // This prevents 401 spam when component mounts before guest session init
    if (userId || getGuestSessionId()) {
      fetchConversations();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only fetch on mount

  return {
    conversations,
    activeConversation,
    messages,
    loading,
    sending,
    unreadTotal,
    incomingCall,
    messagesEndRef,
    echo,
    guestProfile,
    setGuestProfile: (name, email) => {
      setGuestProfile(name, email);
      setGuestProfileState(getGuestProfile());
    },
    setActiveConversation,
    fetchConversations,
    fetchMessages,
    sendMessage,
    startConversation,
    startSupportChat,
    markAsRead,
    scrollToBottom,
    dismissIncomingCall,
    isConnected,
  };
};

export default useMessaging;
