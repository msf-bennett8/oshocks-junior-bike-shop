// ============================================================================
// CONVERSATION LIST — Sidebar with search, unread badges, previews, archive, pin
// ============================================================================

import React, { useState, useMemo } from 'react';
import { Search, Archive, Pin, MoreVertical, Phone, Video, Inbox } from 'lucide-react';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'pinned', label: 'Pinned' },
  { key: 'archived', label: 'Archived' },
];

const ConversationList = ({
  conversations,
  activeId,
  onSelect,
  unreadTotal,
  onClose,
  compact = false,
  entryPoint = 'support',
}) => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [contextMenu, setContextMenu] = useState(null); // { convId, x, y }

  const filtered = useMemo(() => {
    let result = conversations.filter(c => {
      const name = c.title || c.other_participant?.name || '';
      const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;
      
      switch (activeFilter) {
        case 'unread': return c.unread_count > 0;
        case 'pinned': return c.is_pinned;
        case 'archived': return c.is_archived;
        default: return !c.is_archived; // Hide archived in 'all' unless explicitly filtered
      }
    });

    // Sort: pinned first, then by last_message_at desc
    return result.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0);
    });
  }, [conversations, search, activeFilter]);

  const formatTime = (iso) => {
    if (!iso) return '';
    const date = new Date(iso);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now - 86400000).toDateString() === date.toDateString();
    
    if (isToday) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isYesterday) return 'Yesterday';
    if (now - date < 7 * 86400000) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleContextMenu = (e, conv) => {
    e.preventDefault();
    setContextMenu({ convId: conv.id, x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => setContextMenu(null);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Search Bar */}
      <div className="px-3 py-2 border-b border-gray-200 bg-white">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search messages..."
            className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      {!compact && (
        <div className="flex items-center gap-1 px-3 py-2 overflow-x-auto scrollbar-hide bg-white border-b border-gray-100">
          {FILTERS.map(filter => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeFilter === filter.key
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {filter.label}
              {filter.key === 'unread' && unreadTotal > 0 && (
                <span className="ml-1 bg-white text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadTotal}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto" onClick={closeContextMenu}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Inbox className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">{search ? 'No conversations found' : 'No conversations yet'}</p>
          </div>
        ) : (
          filtered.map(conv => {
            const isActive = conv.id === activeId;
            const hasUnread = conv.unread_count > 0;
            const isPinned = conv.is_pinned;
            const isArchived = conv.is_archived;
            
            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv)}
                onContextMenu={(e) => handleContextMenu(e, conv)}
                className={`w-full flex items-start gap-3 px-3 py-3 hover:bg-gray-100 transition-colors text-left relative group ${
                  isActive ? 'bg-blue-50 border-l-4 border-blue-600' : 'border-l-4 border-transparent'
                } ${isArchived ? 'opacity-60' : ''}`}
              >
                {/* Avatar with online indicator */}
                <div className="relative flex-shrink-0">
                  <img
                    src={conv.avatar || conv.other_participant?.avatar || '/default-avatar.png'}
                    alt=""
                    className="w-12 h-12 rounded-full bg-gray-200 object-cover"
                    onError={(e) => { e.target.src = '/default-avatar.png'; }}
                  />
                  {conv.other_participant?.is_online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                  {isPinned && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <Pin className="w-2.5 h-2.5 text-white" />
                    </span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className={`text-sm font-medium truncate ${
                      hasUnread ? 'text-gray-900 font-semibold' : 'text-gray-700'
                    }`}>
                      {conv.title || conv.other_participant?.name || 'Support'}
                    </h4>
                    <span className={`text-[11px] flex-shrink-0 ${hasUnread ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                      {formatTime(conv.last_message_at)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {conv.last_message_sender_id === conv.other_participant?.id && hasUnread && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                    )}
                    <p className={`text-sm truncate flex-1 ${
                      hasUnread ? 'text-gray-800 font-medium' : 'text-gray-500'
                    }`}>
                      {conv.is_typing ? (
                        <span className="text-blue-600 italic">typing...</span>
                      ) : (
                        conv.last_message || 'Start a conversation...'
                      )}
                    </p>
                    {hasUnread && (
                      <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ml-1">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>

                {/* Hover actions */}
                <div className="hidden group-hover:flex items-center gap-1 absolute right-2 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-lg p-1">
                  <button 
                    className="p-1 hover:bg-gray-100 rounded"
                    onClick={(e) => { e.stopPropagation(); /* TODO: pin toggle */ }}
                  >
                    <Pin className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                  <button 
                    className="p-1 hover:bg-gray-100 rounded"
                    onClick={(e) => { e.stopPropagation(); /* TODO: archive toggle */ }}
                  >
                    <Archive className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="fixed bg-white shadow-xl rounded-lg py-1 z-50 border border-gray-200 w-48"
          style={{ top: contextMenu.y, left: Math.min(contextMenu.x, window.innerWidth - 200) }}
        >
          <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
            <Pin className="w-4 h-4" /> {conversations.find(c => c.id === contextMenu.convId)?.is_pinned ? 'Unpin' : 'Pin'}
          </button>
          <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
            <Archive className="w-4 h-4" /> {conversations.find(c => c.id === contextMenu.convId)?.is_archived ? 'Unarchive' : 'Archive'}
          </button>
          <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2">
            <MoreVertical className="w-4 h-4" /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default ConversationList;
