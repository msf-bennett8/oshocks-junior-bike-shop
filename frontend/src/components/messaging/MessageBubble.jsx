// ============================================================================
// MESSAGE BUBBLE — Single message with avatar, timestamp, read status
// ============================================================================

import React from 'react';

const MessageBubble = ({ message, isOwn, showAvatar = true }) => {
  const isCallInvite = message.type === 'call_invite';
  
  const formatTime = (iso) => {
    const date = new Date(iso);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isOwn && showAvatar && message.sender && (
        <img
          src={message.sender.avatar || '/default-avatar.png'}
          alt={message.sender.name}
          className="w-8 h-8 rounded-full mr-2 self-end bg-gray-200"
        />
      )}
      
      <div className={`max-w-[75%] ${!isOwn && showAvatar ? 'ml-0' : !isOwn ? 'ml-10' : ''}`}>
        <div
          className={`px-4 py-2 rounded-2xl text-sm ${
            isOwn
              ? 'bg-blue-600 text-white rounded-br-md'
              : 'bg-gray-100 text-gray-800 rounded-bl-md'
          } ${isCallInvite ? 'border-2 border-blue-300' : ''}`}
        >
          {isCallInvite ? (
            <div className="flex items-center gap-2">
              <span className="text-lg">📞</span>
              <div>
                <p className="font-medium">Missed call</p>
                <p className="text-xs opacity-75">
                  {message.metadata?.call_type === 'video' ? 'Video call' : 'Voice call'}
                </p>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-words">{message.body}</p>
          )}
        </div>
        
        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[10px] text-gray-400">
            {formatTime(message.created_at)}
          </span>
          {isOwn && (
            <span className="text-[10px] text-gray-400">
              {message.read_at ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
