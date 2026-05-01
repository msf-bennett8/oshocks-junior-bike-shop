// ============================================================================
// CONVERSATION LIST — Sidebar with search, unread badges, previews, filters, new chat
// ============================================================================

import React, { useState } from 'react';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'favourites', label: 'Favourites' },
  { key: 'groups', label: 'Groups' },
];

const ConversationList = ({
  conversations,
  activeId,
  onSelect,
  unreadTotal,
  onClose,
  onStartNewConversation,
}) => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatForm, setNewChatForm] = useState({ name: '', identifier: '' });

  const filtered = conversations.filter(c => {
    const name = c.title || c.other_participant?.name || '';
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (activeFilter) {
      case 'unread': return c.unread_count > 0;
      case 'favourites': return c.is_favourite;
      case 'groups': return c.is_group;
      default: return true;
    }
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

  const handleStartNewChat = () => {
    if (!newChatForm.name.trim() || !newChatForm.identifier.trim()) return;
    onStartNewConversation?.(newChatForm);
    setNewChatForm({ name: '', identifier: '' });
    setShowNewChatModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 border-r border-gray-200 w-80 relative">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-gray-900">Messages</h2>
            {unreadTotal > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadTotal}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setShowNewChatModal(true)}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              title="New conversation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="relative mb-3">
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

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {FILTERS.map(filter => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeFilter === filter.key
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {filter.label}
            </button>
          ))}
          <button className="p-1 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
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

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">New Conversation</h3>
              <button 
                onClick={() => setShowNewChatModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newChatForm.name}
                  onChange={(e) => setNewChatForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter contact name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone / Email / Username
                </label>
                <input
                  type="text"
                  value={newChatForm.identifier}
                  onChange={(e) => setNewChatForm(prev => ({ ...prev, identifier: e.target.value }))}
                  placeholder="Enter phone, email or username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <button
                onClick={handleStartNewChat}
                disabled={!newChatForm.name.trim() || !newChatForm.identifier.trim()}
                className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Start Conversation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationList;
