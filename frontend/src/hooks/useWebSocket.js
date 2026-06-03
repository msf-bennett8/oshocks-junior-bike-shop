// ============================================================================
// WEBSOCKET HOOK — Vite + Laravel Reverb with auto-reconnect & presence
// ============================================================================

import { useEffect, useRef, useCallback, useState } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import getReverbConfig from '../config/reverb';

window.Pusher = Pusher;

export const useWebSocket = (userId) => {
  const echoRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const reconnectTimerRef = useRef(null);
  const maxReconnectAttempts = 10;

  const connect = useCallback(() => {
    // Allow guests: use guest session ID if no user/token
    const token = localStorage.getItem('authToken');
    const guestSessionId = localStorage.getItem('oshocks_guest_session_id');

    if (!userId && !guestSessionId) return;

    const config = getReverbConfig();

    const authHeaders = {};
    if (token) {
      authHeaders.Authorization = `Bearer ${token}`;
    }
    if (guestSessionId) {
      authHeaders['X-Guest-Session-ID'] = guestSessionId;
    }

    const echo = new Echo({
      broadcaster: 'reverb',
      key: config.key,
      host: config.host,
      wsPort: config.port,
      wssPort: config.port,
      forceTLS: config.scheme === 'https',
      enabledTransports: config.scheme === 'https' ? ['wss'] : ['ws', 'wss'],
      auth: {
        headers: authHeaders,
      },
      authEndpoint: `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}/broadcasting/auth`,
    });

    // Connection handlers
    echo.connector.pusher.connection.bind('connected', () => {
      console.log('🔌 WebSocket connected');
      setIsConnected(true);
      setConnectionError(null);
      setReconnectAttempt(0);
      
      // Expose Echo globally so api.js can access socketId
      window.Echo = echo;
    });

    echo.connector.pusher.connection.bind('disconnected', () => {
      console.log('🔌 WebSocket disconnected');
      setIsConnected(false);
    });

    echo.connector.pusher.connection.bind('error', (err) => {
      console.error('🔌 WebSocket error:', err);
      setConnectionError(err);
      setIsConnected(false);
    });

    // Auto-reconnect on connection failure
    echo.connector.pusher.connection.bind('failed', () => {
      console.error('🔌 WebSocket connection failed');
      setIsConnected(false);
      
      if (reconnectAttempt < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempt), 30000); // Max 30s
        console.log(`🔌 Reconnecting in ${delay}ms... (attempt ${reconnectAttempt + 1}/${maxReconnectAttempts})`);
        
        reconnectTimerRef.current = setTimeout(() => {
          setReconnectAttempt(prev => prev + 1);
          connect();
        }, delay);
      }
    });

    echoRef.current = echo;

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      echo.disconnect();
      echoRef.current = null;
      setIsConnected(false);
    };
  }, [userId, reconnectAttempt]);

  useEffect(() => {
    const cleanup = connect();
    return () => {
      if (cleanup) cleanup();
    };
  }, [connect]);

  const reconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }
    setReconnectAttempt(0);
    connect();
  }, [connect]);

    // Track active subscriptions to prevent duplicates
  const listenersRef = useRef(new Map());

  const subscribeToChannel = useCallback((channelName, eventName, callback) => {
    if (!echoRef.current) return null;

    const key = `${channelName}:${eventName}`;
    
    // Remove any existing listener for this key to prevent duplicates
    const existing = listenersRef.current.get(key);
    if (existing) {
      existing.channel.stopListening(eventName, existing.callback);
      listenersRef.current.delete(key);
    }

    let channel;
    if (channelName.startsWith('private-')) {
      const privateName = channelName.replace('private-', '');
      channel = echoRef.current.private(privateName);
    } else if (channelName.startsWith('presence-')) {
      const presenceName = channelName.replace('presence-', '');
      channel = echoRef.current.join(presenceName);
    } else {
      channel = echoRef.current.channel(channelName);
    }

    // Wrap callback to ensure stable reference for cleanup
    const wrappedCallback = (data) => callback(data);
    channel.listen(eventName, wrappedCallback);
    listenersRef.current.set(key, { channel, callback: wrappedCallback, eventName });
    console.log(`📡 Subscribed to ${channelName}:${eventName}`);

    return () => {
      const stored = listenersRef.current.get(key);
      if (stored) {
        stored.channel.stopListening(eventName, stored.callback);
        listenersRef.current.delete(key);
      }
      console.log(`📡 Unsubscribed from ${channelName}:${eventName}`);
    };
  }, []);

  const subscribeToUser = useCallback((callback) => {
    if (!userId || !echoRef.current) return null;
    return subscribeToChannel(`private-user.${userId}`, '.call.initiated', callback);
  }, [userId, subscribeToChannel]);

  const subscribeToConversation = useCallback((conversationId, onMessageSent, onMessageDelivered, onMessageRead) => {
    if (!echoRef.current) return null;

    const unsubscribers = [];

    // Listen for new messages
    if (onMessageSent) {
      unsubscribers.push(subscribeToChannel(`private-conversation.${conversationId}`, '.message.sent', onMessageSent));
    }

    // Listen for delivery confirmations
    if (onMessageDelivered) {
      unsubscribers.push(subscribeToChannel(`private-conversation.${conversationId}`, '.message.delivered', onMessageDelivered));
    }

    // Listen for read receipts
    if (onMessageRead) {
      unsubscribers.push(subscribeToChannel(`private-conversation.${conversationId}`, '.message.read', onMessageRead));
    }

    return () => {
      unsubscribers.forEach(unsub => unsub && unsub());
    };
  }, [subscribeToChannel]);

  return {
    isConnected,
    connectionError,
    reconnectAttempt,
    connectionState: isConnected ? 'connected' : connectionError ? 'error' : reconnectAttempt > 0 ? 'reconnecting' : 'disconnected',
    echo: echoRef.current,
    subscribeToChannel,
    subscribeToUser,
    subscribeToConversation,
    reconnect,
  };
};

export default useWebSocket;
