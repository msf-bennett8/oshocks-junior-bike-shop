// ============================================================================
// WEBRTC HOOK — Peer-to-peer voice/video calls with Laravel signaling (FIXED)
// ============================================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export const useWebRTC = (userId, echoInstance) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callState, setCallState] = useState('idle');
  const [callType, setCallType] = useState(null);
  const [currentCall, setCurrentCall] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [callError, setCallError] = useState(null);

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const durationIntervalRef = useRef(null);
  const signalQueueRef = useRef([]);
  const echoRef = useRef(echoInstance);
  const currentCallRef = useRef(null);

  // Sync ref with state
  useEffect(() => {
    echoRef.current = echoInstance;
  }, [echoInstance]);

  useEffect(() => {
    currentCallRef.current = currentCall;
  }, [currentCall]);

  // Cleanup on unmount
  useEffect(() => {
    return () => endCall();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getLocalStream = useCallback(async (withVideo = false) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: withVideo ? { width: 640, height: 480 } : false,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error('Failed to get media:', err);
      setCallError('Could not access microphone/camera. Check permissions.');
      throw err;
    }
  }, []);

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate && currentCallRef.current) {
        sendSignal('ice_candidate', { candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      console.log('📡 Remote track received');
      setRemoteStream(event.streams[0]);
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'failed') {
        setCallError('Connection failed. Falling back to messaging...');
        setTimeout(() => endCall(), 3000);
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, []);

  const sendSignal = useCallback(async (signalType, payload) => {
    const sessionId = currentCallRef.current?.sessionId;
    if (!sessionId) return;
    try {
      await api.post('/calls/signal', {
        session_id: sessionId,
        signal_type: signalType,
        payload,
      });
    } catch (err) {
      console.error('Signal failed:', err);
    }
  }, []);

  const initiateCall = useCallback(async (conversationId, calleeId, type = 'voice') => {
    try {
      setCallState('calling');
      setCallType(type);
      setCallError(null);

      await getLocalStream(type === 'video');

      const res = await api.post('/calls/initiate', {
        conversation_id: conversationId,
        call_type: type,
        callee_id: calleeId,
      });

      const { session_id } = res.data.data;

      const callData = {
        sessionId: session_id,
        conversationId,
        calleeId,
        type,
      };

      setCurrentCall(callData);
      currentCallRef.current = callData;

      const pc = createPeerConnection();
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      sendSignal('offer', { sdp: offer });

      // Subscribe to signals for THIS session
      subscribeToCallSignals(session_id, conversationId);

    } catch (err) {
      console.error('Call initiation failed:', err);
      setCallState('idle');
      cleanup();
    }
  }, [getLocalStream, createPeerConnection, sendSignal]);

  const answerCall = useCallback(async (incomingCallData) => {
    try {
      setCallState('ringing');
      setCallType(incomingCallData.callType);

      const callData = {
        sessionId: incomingCallData.sessionId,
        conversationId: incomingCallData.conversationId,
        caller: incomingCallData.caller,
        type: incomingCallData.callType,
      };

      setCurrentCall(callData);
      currentCallRef.current = callData;

      await getLocalStream(incomingCallData.callType === 'video');

      const pc = createPeerConnection();
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });

      sendSignal('accept', {});

      subscribeToCallSignals(incomingCallData.sessionId, incomingCallData.conversationId);

      setCallState('active');
      startDurationTimer();

    } catch (err) {
      console.error('Failed to answer call:', err);
      declineCall(incomingCallData.sessionId);
    }
  }, [getLocalStream, createPeerConnection, sendSignal]);

  const declineCall = useCallback(async (sessionId) => {
    try {
      await api.post('/calls/signal', {
        session_id: sessionId,
        signal_type: 'decline',
        payload: {},
      });
    } catch (err) {
      console.error('Decline failed:', err);
    } finally {
      cleanup();
      setCallState('idle');
    }
  }, []);

  const endCall = useCallback(async () => {
    const sessionId = currentCallRef.current?.sessionId;
    if (sessionId) {
      await sendSignal('end', { reason: 'user_hung_up' });
    }
    cleanup();
    setCallState('idle');
  }, [sendSignal]);

  const handleSignal = useCallback(async (signal) => {
    const pc = peerConnectionRef.current;
    if (!pc) return;

    try {
      switch (signal.signal_type) {
        case 'offer':
          await pc.setRemoteDescription(new RTCSessionDescription(signal.payload.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendSignal('answer', { sdp: answer });
          setCallState('active');
          startDurationTimer();
          processQueuedCandidates();
          break;

        case 'answer':
          await pc.setRemoteDescription(new RTCSessionDescription(signal.payload.sdp));
          setCallState('active');
          startDurationTimer();
          processQueuedCandidates();
          break;

        case 'ice_candidate':
          const candidate = new RTCIceCandidate(signal.payload.candidate);
          if (pc.remoteDescription) {
            await pc.addIceCandidate(candidate);
          } else {
            signalQueueRef.current.push(candidate);
          }
          break;

        case 'end':
          cleanup();
          setCallState('idle');
          break;

        default:
          break;
      }
    } catch (err) {
      console.error('Signal handling error:', err);
    }
  }, [sendSignal]);

  const processQueuedCandidates = useCallback(() => {
    const pc = peerConnectionRef.current;
    while (signalQueueRef.current.length > 0) {
      const candidate = signalQueueRef.current.shift();
      pc.addIceCandidate(candidate).catch(console.error);
    }
  }, []);

  const subscribeToCallSignals = useCallback((sessionId, conversationId) => {
    const echo = echoRef.current;
    if (!echo || !conversationId) return;

    const channel = echo.channel(`conversation.${conversationId}`);
    channel.listen('.call.signal', (event) => {
      if (event.session_id === sessionId) {
        handleSignal(event);
      }
    });

    console.log(`📡 Subscribed to call signals: conversation.${conversationId}`);
  }, [handleSignal]);

  const startDurationTimer = useCallback(() => {
    setCallDuration(0);
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    durationIntervalRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  }, []);

  const cleanup = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    setLocalStream(null);
    setRemoteStream(null);
    setCallDuration(0);
    setCurrentCall(null);
    currentCallRef.current = null;
    signalQueueRef.current = [];
  }, []);

  const formattedDuration = useCallback(() => {
    const mins = Math.floor(callDuration / 60);
    const secs = callDuration % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [callDuration]);

  return {
    localStream,
    remoteStream,
    callState,
    callType,
    currentCall,
    callDuration,
    callError,
    formattedDuration: formattedDuration(),
    initiateCall,
    answerCall,
    declineCall,
    endCall,
    cleanup,
  };
};

export default useWebRTC;
