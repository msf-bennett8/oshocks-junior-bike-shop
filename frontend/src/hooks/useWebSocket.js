// ============================================================================
// WEBSOCKET HOOK — Vite + Laravel Reverb
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

  useEffect(() => {
    if (!userId) return;

    const token = localStorage.getItem('authToken');
    if (!token) return;

    const config = getReverbConfig();

    const echo = new Echo({
      broadcaster: 'reverb',
      key: config.key,
      wsHost: config.host,
      wsPort: config.port,
      wssPort: config.port,
      forceTLS: config.scheme === 'https',
      enabledTransports: config.scheme === 'https' ? ['wss'] : ['ws', 'wss'],
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      authEndpoint: `${process.env.REACT_APP_API_URL?.replace('/api/v1', '')}/broadcasting/auth`,
    });

    echo.connector.pusher.connection.bind('connected', () => {
      console.log('🔌 WebSocket connected');
      setIsConnected(true);
      setConnectionError(null);
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

    echoRef.current = echo;

    return () => {
      echo.disconnect();
      echoRef.current = null;
      setIsConnected(false);
    };
  }, [userId]);

  const subscribeToChannel = useCallback((channelName, eventName, callback) => {
    if (!echoRef.current) return null;

    const channel = channelName.startsWith('private-') 
      ? echoRef.current.private(channelName.replace('private-', ''))
      : echoRef.current.channel(channelName);

    channel.listen(eventName, callback);
    console.log(`📡 Subscribed to ${channelName}:${eventName}`);

    return () => {
      channel.stopListening(eventName);
      console.log(`📡 Unsubscribed from ${channelName}:${eventName}`);
    };
  }, []);

  const subscribeToUser = useCallback((callback) => {
    if (!userId || !echoRef.current) return null;
    return subscribeToChannel(`private-user.${userId}`, '.call.initiated', callback);
  }, [userId, subscribeToChannel]);

  const subscribeToConversation = useCallback((conversationId, callback) => {
    if (!echoRef.current) return null;
    return subscribeToChannel(`conversation.${conversationId}`, '.message.sent', callback);
  }, [subscribeToChannel]);

  return {
    isConnected,
    connectionError,
    echo: echoRef.current,
    subscribeToChannel,
    subscribeToUser,
    subscribeToConversation,
  };
};

export default useWebSocket;
