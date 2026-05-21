// ============================================================================
// CONVERSATION LIST — Sidebar with search, unread badges, previews, archive, pin
// ============================================================================

import React, { useState, useMemo } from 'react';
import { Search, Archive, Pin, MoreVertical, Trash2, Phone, Video, Inbox, Headphones, AlertCircle, ShoppingBag, Mail, Clock, Truck, Wrench, MessageSquare, CreditCard, Package, RotateCcw, Cpu, HelpCircle } from 'lucide-react';
import Avatar from '../common/Avatar';
import ProfilePreviewModal from '../common/ProfilePreviewModal';
import { useAuth } from '../../context/AuthContext';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'pinned', label: 'Pinned' },
  { key: 'support', label: 'Support' },
  { key: 'archived', label: 'Archived' },
];

const ConversationList = ({
  conversations,
  activeId,
  onSelect,
  unreadTotal,
  onClose,
  onPinToggle,
  onArchiveToggle,
  onDelete,
  compact = false,
  entryPoint = 'support',
}) => {
  const { user, hasAnyRole } = useAuth();
  const isStaff = hasAnyRole(['admin', 'super_admin', 'support_agent', 'service_agent']);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [contextMenu, setContextMenu] = useState(null); // { convId, x, y }
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedConv, setSelectedConv] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const filtered = useMemo(() => {
    if (!conversations?.length) return [];
    let result = conversations.filter(c => {
      const name = c.title || c.other_participant?.name || '';
      const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;
      
      switch (activeFilter) {
        case 'unread': return c.unread_count > 0;
        case 'pinned': return c.is_pinned;
        case 'support': return c.type === 'support' || c.type === 'order_support';
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

  const openOptionsModal = (e, conv) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedConv(conv);
    setModalOpen(true);
    setConfirmDelete(false);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedConv(null);
    setConfirmDelete(false);
  };

  const handlePin = () => {
    if (selectedConv && onPinToggle) onPinToggle(selectedConv.id);
    closeModal();
  };

  const handleArchive = () => {
    if (selectedConv && onArchiveToggle) onArchiveToggle(selectedConv.id);
    closeModal();
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    if (selectedConv && onDelete) onDelete(selectedConv.id);
    closeModal();
  };

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
      <div className={`flex items-center overflow-x-auto scrollbar-hide bg-white border-b border-gray-100 ${compact ? 'gap-[2px] px-1.5 py-1' : 'gap-1 px-3 py-2'}`}>
        {FILTERS.map(filter => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            title={filter.label}
            className={`rounded-md font-semibold whitespace-nowrap transition-colors flex-shrink-0 leading-none ${
              compact 
                ? `px-[5px] py-[3px] text-[9px] ${activeFilter === filter.key ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`
                : `px-3 py-1.5 text-xs ${activeFilter === filter.key ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`
            }`}
          >
            {compact ? filter.label.slice(0, 2) : filter.label}
            {filter.key === 'unread' && unreadTotal > 0 && (
              <span className={`bg-white text-blue-600 font-bold rounded-full inline-block ${compact ? 'ml-[1px] text-[8px] px-[2px] py-0 min-w-[10px]' : 'ml-1 text-[10px] px-1.5 py-0.5'}`}>
                {unreadTotal}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto overscroll-contain" onClick={closeContextMenu}>
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
              <div
                key={conv.id}
                onClick={() => onSelect(conv)}
                onContextMenu={(e) => handleContextMenu(e, conv)}
                className={`w-full flex items-start gap-3 px-3 py-3 hover:bg-gray-100 active:bg-blue-50 transition-colors cursor-pointer text-left relative group select-none ${
                  isActive ? 'bg-blue-50 border-l-4 border-blue-600' : 'border-l-4 border-transparent'
                } ${isArchived ? 'opacity-60' : ''}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(conv); }}
              >
                {/* Avatar with online indicator — STAFF sees last sender for support chats */}
                <div className="relative flex-shrink-0">
                  {(() => {
                    const isSupportChat = conv.type === 'support' || conv.type === 'order_support' || conv.is_support_case;
                    const displayUser = (isSupportChat && isStaff && conv.last_sender)
                      ? conv.last_sender
                      : (conv.other_participant || { name: conv.guest_name || conv.title || 'Support', avatar: conv.avatar });
                    
                    const avatarEl = (
                      <Avatar
                        src={displayUser.avatar}
                        name={displayUser.name}
                        size={48}
                      />
                    );

                    // Staff hovering over support chat avatar → show profile preview
                    if (isSupportChat && isStaff && conv.last_sender) {
                      return (
                        <ProfilePreviewModal user={conv.last_sender}>
                          {avatarEl}
                        </ProfilePreviewModal>
                      );
                    }
                    return avatarEl;
                  })()}
                  {conv.other_participant?.is_online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                  {isPinned && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <Pin className="w-2.5 h-2.5 text-white" />
                    </span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 relative">
                  <div className="flex items-center gap-1.5 min-w-0 pr-10">
                    {(() => {
                      const isSupportChat = conv.type === 'support' || conv.type === 'order_support' || conv.is_support_case;
                      const displayName = (isSupportChat && isStaff && conv.last_sender)
                        ? conv.last_sender.name
                        : (conv.title || conv.other_participant?.name || conv.guest_name || 'Support');
                      const displayUser = (isSupportChat && isStaff && conv.last_sender) ? conv.last_sender : null;

                      const nameEl = (
                        <h4 className={`text-sm font-medium truncate ${
                          hasUnread ? 'text-gray-900 font-semibold' : 'text-gray-700'
                        }`}>
                          {isSupportChat && isStaff ? (
                            <span className="flex items-center gap-1.5">
                              <span className="text-gray-400 text-xs font-normal">Oshocks Support</span>
                              <span className="text-gray-300">•</span>
                              <span>{displayName}</span>
                            </span>
                          ) : displayName}
                        </h4>
                      );

                      return displayUser ? (
                        <ProfilePreviewModal user={displayUser}>
                          {nameEl}
                        </ProfilePreviewModal>
                      ) : nameEl;
                    })()}
                    {/* Support Case Badge */}
                    {conv.support_case && (
                      <span className={`flex-shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        conv.support_case.status === 'escalated' ? 'bg-red-100 text-red-700' :
                        conv.support_case.status === 'resolved' ? 'bg-green-100 text-green-700' :
                        conv.support_case.status === 'closed' ? 'bg-slate-100 text-slate-600' :
                        conv.support_case.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {conv.support_case.case_type === 'order_issue' && <ShoppingBag className="w-2.5 h-2.5" />}
                        {conv.support_case.case_type === 'account_login' && <Mail className="w-2.5 h-2.5" />}
                        {conv.support_case.case_type === 'report_problem' && <AlertCircle className="w-2.5 h-2.5" />}
                        {conv.support_case.case_type === 'shipment_delivery' && <Truck className="w-2.5 h-2.5" />}
                        {conv.support_case.case_type === 'services_booking' && <Wrench className="w-2.5 h-2.5" />}
                        {conv.support_case.case_type === 'general_inquiry' && <MessageSquare className="w-2.5 h-2.5" />}
                        {conv.support_case.case_type === 'payment_billing' && <CreditCard className="w-2.5 h-2.5" />}
                        {conv.support_case.case_type === 'product_info' && <Package className="w-2.5 h-2.5" />}
                        {conv.support_case.case_type === 'returns_refund' && <RotateCcw className="w-2.5 h-2.5" />}
                        {conv.support_case.case_type === 'technical_support' && <Cpu className="w-2.5 h-2.5" />}
                        {conv.support_case.case_type === 'other' && <HelpCircle className="w-2.5 h-2.5" />}
                        {conv.support_case.case_id?.slice(-6)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 mt-0.5">
                    {conv.last_message_sender_id === conv.other_participant?.id && hasUnread && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                    )}
                    <p className={`text-sm truncate flex-1 ${
                      hasUnread ? 'text-gray-800 font-medium' : 'text-gray-500'
                    }`}>
                      {conv.is_typing ? (
                      <span className="text-blue-600 italic">typing...</span>
                    ) : (
                      (typeof conv.last_message === 'string' ? conv.last_message 
                        : conv.last_message && typeof conv.last_message === 'object' ? '[Message]'
                        : null) || 'Start a conversation...'
                    )}
                    </p>
                    {hasUnread && (
                      <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ml-1">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>

                  {/* Timestamp — bottom right */}
                  <span className={`absolute right-0 bottom-0 text-[10px] ${hasUnread ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                    {formatTime(conv.last_message_at)}
                  </span>
                </div>

                {/* More options button */}
                <button
                  className="hidden group-hover:flex items-center justify-center w-8 h-8 absolute right-2 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full hover:bg-gray-100 z-10"
                  onClick={(e) => openOptionsModal(e, conv)}
                >
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
               </div>
            );
          })
        )}
      </div>

            {/* Options Modal */}
      {modalOpen && selectedConv && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-80 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">
                {selectedConv.title || selectedConv.other_participant?.name || 'Chat Options'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Choose an action for this conversation</p>
            </div>

            {/* Options */}
            <div className="py-1">
              <button
                onClick={handlePin}
                className="w-full text-left px-5 py-3 text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                  <Pin className={`w-4 h-4 ${selectedConv.is_pinned ? 'text-blue-600 fill-blue-600' : 'text-blue-500'}`} />
                </div>
                <div>
                  <span className="font-medium text-gray-900">
                    {selectedConv.is_pinned ? 'Unpin Chat' : 'Pin Chat'}
                  </span>
                  <p className="text-xs text-gray-500">
                    {selectedConv.is_pinned ? 'Remove from top of list' : 'Keep at top of list'}
                  </p>
                </div>
              </button>

              <button
                onClick={handleArchive}
                className="w-full text-left px-5 py-3 text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                  <Archive className={`w-4 h-4 ${selectedConv.is_archived ? 'text-amber-600 fill-amber-600' : 'text-amber-500'}`} />
                </div>
                <div>
                  <span className="font-medium text-gray-900">
                    {selectedConv.is_archived ? 'Unarchive Chat' : 'Archive Chat'}
                  </span>
                  <p className="text-xs text-gray-500">
                    {selectedConv.is_archived ? 'Move back to inbox' : 'Hide from main list'}
                  </p>
                </div>
              </button>

              <div className="mx-5 my-1 h-px bg-gray-100" />

              {!confirmDelete ? (
                <button
                  onClick={handleDelete}
                  className="w-full text-left px-5 py-3 text-sm hover:bg-red-50 flex items-center gap-3 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <span className="font-medium text-red-600">Delete Chat</span>
                    <p className="text-xs text-red-400">Permanently remove this conversation</p>
                  </div>
                </button>
              ) : (
                <div className="px-5 py-3">
                  <p className="text-sm text-red-600 font-medium mb-2">Are you sure?</p>
                  <p className="text-xs text-gray-500 mb-3">This will permanently delete all messages. This cannot be undone.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={closeModal}
                      className="flex-1 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex-1 px-3 py-2 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Yes, Delete
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cancel */}
            {!confirmDelete && (
              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                <button
                  onClick={closeModal}
                  className="w-full py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationList;
