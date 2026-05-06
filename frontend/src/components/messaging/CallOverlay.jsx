// ============================================================================
// CALL OVERLAY — Incoming call popup + active call screen
// ============================================================================

import React, { useEffect, useRef } from 'react';
import Avatar from '../common/Avatar';

const CallOverlay = ({
  callState,
  callType,
  incomingCall,
  currentCall,
  localStream,
  remoteStream,
  callDuration,
  callError,
  onAnswer,
  onDecline,
  onEndCall,
  onDismissError,
}) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Attach streams to video elements
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Incoming call popup
  if (callState === 'idle' && incomingCall) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-sm w-full mx-4 animate-bounce-in">
          <div className="w-24 h-24 mx-auto mb-4">
            <Avatar src={incomingCall.caller?.avatar} name={incomingCall.caller?.name} size={96} />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {incomingCall.caller?.name || 'Unknown'}
          </h3>
          <p className="text-gray-500 mb-8">
            Incoming {incomingCall.callType === 'video' ? 'video' : 'voice'} call...
          </p>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={onDecline}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center group-hover:bg-red-600 transition-colors">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                </svg>
              </div>
              <span className="text-sm text-gray-600">Decline</span>
            </button>
            
            <button
              onClick={() => onAnswer(incomingCall)}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center group-hover:bg-green-600 transition-colors">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <span className="text-sm text-gray-600">Answer</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active call screen
  if (callState === 'active' || callState === 'calling' || callState === 'ringing') {
    const isVideo = callType === 'video';
    
    return (
      <div className="fixed inset-0 z-[60] bg-gray-900 flex flex-col">
        {/* Video streams */}
        {isVideo ? (
          <>
            {/* Remote video (full screen) */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Local video (picture-in-picture) */}
            <div className="absolute top-4 right-4 w-32 h-44 rounded-xl overflow-hidden border-2 border-white/30 shadow-lg">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
          </>
        ) : (
          /* Voice call - avatar + wave animation */
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-gray-700 mb-6 ring-4 ring-blue-500/30 animate-pulse">
              <Avatar src={currentCall?.caller?.avatar || currentCall?.callee?.avatar} name={currentCall?.caller?.name || currentCall?.callee?.name} size={128} />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              {currentCall?.caller?.name || currentCall?.callee?.name || 'Unknown'}
            </h3>
            <p className="text-gray-400 text-lg font-mono">
              {callState === 'calling' ? 'Calling...' : callState === 'ringing' ? 'Ringing...' : callDuration}
            </p>
          </div>
        )}

        {/* Error banner */}
        {callError && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
            <span>{callError}</span>
            <button onClick={onDismissError} className="font-bold">×</button>
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6">
          <button className="w-12 h-12 rounded-full bg-gray-700/80 flex items-center justify-center hover:bg-gray-600 transition-colors">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          
          <button
            onClick={onEndCall}
            className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
            </svg>
          </button>
          
          {isVideo && (
            <button className="w-12 h-12 rounded-full bg-gray-700/80 flex items-center justify-center hover:bg-gray-600 transition-colors">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default CallOverlay;
