// ============================================================================
// CONVERSATION LIST — Sidebar with search, unread badges, previews
// ============================================================================

import React, { useState } from 'react';

const ConversationList = ({
  conversations,
  activeId,
  onSelect,
  unreadTotal,
  onClose,
}) => {
  const [search, setSearch] = useState('');

  const filtered = conversations.filter(c => {
    const name = c.title || c.other_participant?.name || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const formatTime = (iso) => {
    if (!iso) return '';
    const date = new Date(iso);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 border-r border-gray-200 w-80">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Messages</h2>
          {unreadTotal > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadTotal}
            </span>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            {search ? 'No conversations found' : 'No conversations yet'}
          </div>
        ) : (
          filtered.map(conv => {
            const isActive = conv.id === activeId;
            const hasUnread = conv.unread_count > 0;
            
            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv)}
                className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-100 transition-colors text-left ${
                  isActive ? 'bg-blue-50 border-l-3 border-blue-600' : 'border-l-3 border-transparent'
                }`}
              >
                <img
                  src={conv.avatar || conv.other_participant?.avatar || '/default-avatar.png'}
                  alt=""
                  className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className={`text-sm font-medium truncate ${
                      hasUnread ? 'text-gray-900 font-semibold' : 'text-gray-700'
                    }`}>
                      {conv.title || conv.other_participant?.name || 'Unknown'}
                    </h4>
                    <span className="text-[11px] text-gray-400 flex-shrink-0">
                      {formatTime(conv.last_message_at)}
                    </span>
                  </div>
                  
                  <p className={`text-sm truncate ${
                    hasUnread ? 'text-gray-900 font-medium' : 'text-gray-500'
                  }`}>
                    {conv.last_message || 'Start a conversation...'}
                  </p>
                </div>
                
                {hasUnread && (
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 mt-1">
                    {conv.unread_count}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;
