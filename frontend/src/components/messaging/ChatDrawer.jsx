// ============================================================================
// CHAT DRAWER — Responsive: Desktop Split-Pane | Mobile WhatsApp-Style
// ============================================================================
// Desktop (>1024px): Website content on left, chat panel on right (resizable)
// Mobile (<1024px): WhatsApp-style — list → tap → thread → back button
// ============================================================================

import React, { useEffect, useCallback, useRef, useState } from 'react';
import ConversationList from './ConversationList';
import MessageThread from './MessageThread';
import { useMessaging } from '../../hooks/useMessaging';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, X, GripVertical } from 'lucide-react';

const MIN_CHAT_WIDTH = 280;   // px — allow slightly narrower
const MAX_CHAT_WIDTH = 800;   // px
const DEFAULT_CHAT_WIDTH = 480; // px
const NARROW_BREAKPOINT = 480; // px — where layout switches to mobile style

const ChatDrawer = ({ isOpen, onClose, onStartCall, entryPoint = 'support' }) => {
  const { user } = useAuth();
  const {
    conversations,
    activeConversation,
    messages,
    loading,
    sending,
    unreadTotal,
    typingUsers,
    messagesEndRef,
    setActiveConversation,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markAsRead,
    pinConversation: onPinToggle,
    archiveConversation: onArchiveToggle,
    deleteConversation: onDelete,
    sendTypingIndicator,
  } = useMessaging(user?.id);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  const [view, setView] = React.useState('list'); // 'list' | 'thread' — mobile only

  // ─── SPLIT-PANE STATE ───
  const [chatWidth, setChatWidth] = useState(() => {
    const saved = localStorage.getItem('oshocks_chat_width');
    return saved ? parseInt(saved, 10) : DEFAULT_CHAT_WIDTH;
  });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(chatWidth);

  // Persist width
  useEffect(() => {
    localStorage.setItem('oshocks_chat_width', chatWidth.toString());
  }, [chatWidth]);

  // ─── DYNAMIC CSS INJECTION FOR CONTAINER-QUERY BEHAVIOR ───
  const styleTagRef = useRef(null);
  const resizeObserverRef = useRef(null);

  // Generate CSS based on pane width
  const generatePaneCSS = (paneWidth) => {
    let size = 'xl';
    if (paneWidth < 480) size = 'xs';
    else if (paneWidth < 640) size = 'sm';
    else if (paneWidth < 768) size = 'md';
    else if (paneWidth < 1024) size = 'lg';

    // Grid column overrides
    let gridCols = '';
    if (size === 'xs') {
      gridCols = `
        .product-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 0.75rem !important; }
        .grid-cols-2, .grid-cols-3, .grid-cols-4, .grid-cols-5, .grid-cols-6 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
        .category-grid { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
        .dashboard-layout, .checkout-container { grid-template-columns: 1fr !important; }
        .hero-title { font-size: 1.75rem !important; }
        .page-container { padding: 1.5rem 0.75rem !important; }
        .container { padding-left: 0.75rem !important; padding-right: 0.75rem !important; }
      `;
    } else if (size === 'sm') {
      gridCols = `
        .product-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 1rem !important; }
        .grid-cols-3, .grid-cols-4, .grid-cols-5, .grid-cols-6 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        .category-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        .dashboard-layout, .checkout-container { grid-template-columns: 1fr !important; }
        .hero-title { font-size: 2rem !important; }
        .page-container { padding: 2rem 1rem !important; }
        .container { padding-left: 1rem !important; padding-right: 1rem !important; }
      `;
    } else if (size === 'md') {
      gridCols = `
        .product-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
        .grid-cols-4, .grid-cols-5, .grid-cols-6 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        .category-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
        .checkout-container { grid-template-columns: 1fr !important; }
        .hero-title { font-size: 2.5rem !important; }
        .page-container { padding: 3rem 1.5rem !important; }
      `;
    } else if (size === 'lg') {
      gridCols = `
        .product-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
        .grid-cols-5, .grid-cols-6 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
        .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
        .hero-title { font-size: 3rem !important; }
      `;
    }

    // Navbar visibility overrides
    let navOverrides = '';
    if (size === 'xs' || size === 'sm') {
      navOverrides = `
        nav .hidden.lg\\\\:flex, nav .hidden.md\\\\:flex { display: none !important; }
        nav .lg\\\\:hidden, nav .md\\\\:hidden { display: flex !important; }
        nav .hidden.sm\\\\:flex { display: none !important; }
        nav .sm\\\\:hidden { display: flex !important; }
      `;
    } else if (size === 'md') {
      navOverrides = `
        nav .hidden.lg\\\\:flex, nav .hidden.xl\\\\:flex { display: none !important; }
        nav .lg\\\\:hidden { display: flex !important; }
        nav .md\\\\:hidden { display: none !important; }
        nav .hidden.md\\\\:flex { display: flex !important; }
      `;
    }

    // Footer grid override
    let footerOverrides = '';
    if (size === 'xs') {
      footerOverrides = `
        footer .grid-cols-2 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
        footer .grid-cols-3 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
        footer .lg\\\\:col-span-1, footer .lg\\\\:col-span-2 { grid-column: span 1 / span 1 !important; }
        footer .lg\\\\:grid-cols-3 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
      `;
    } else if (size === 'sm') {
      footerOverrides = `
        footer .lg\\\\:grid-cols-3 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
        footer .lg\\\\:grid-cols-6 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
      `;
    } else if (size === 'md') {
      footerOverrides = `
        footer .lg\\\\:grid-cols-6 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
      `;
    }

    return `
      /* Split-pane breakpoint: ${size} (${paneWidth}px) */
      #app-main-content { width: calc(100% - ${chatWidth}px) !important; flex-shrink: 0 !important; }
      ${gridCols}
      ${navOverrides}
      ${footerOverrides}
    `;
  };

  // Apply split-pane with ResizeObserver
  useEffect(() => {
    if (!isOpen || isMobile) {
      // Cleanup
      document.body.classList.remove('chat-split-active');
      document.documentElement.style.removeProperty('--chat-width');
      if (styleTagRef.current) {
        styleTagRef.current.remove();
        styleTagRef.current = null;
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      const main = document.getElementById('app-main-content');
      if (main) {
        main.style.width = '';
        main.style.flexShrink = '';
        main.removeAttribute('data-pane-width');
      }
      return;
    }

    // Activate split pane
    document.body.classList.add('chat-split-active');
    document.documentElement.style.setProperty('--chat-width', `${chatWidth}px`);

    const main = document.getElementById('app-main-content');
    if (!main) return;

    // Create or get style tag
    if (!styleTagRef.current) {
      styleTagRef.current = document.createElement('style');
      styleTagRef.current.id = 'split-pane-breakpoints';
      document.head.appendChild(styleTagRef.current);
    }

    // Update CSS immediately
    const updateCSS = () => {
      if (!main) return;
      const paneWidth = main.clientWidth;
      let size = 'xl';
      if (paneWidth < 480) size = 'xs';
      else if (paneWidth < 640) size = 'sm';
      else if (paneWidth < 768) size = 'md';
      else if (paneWidth < 1024) size = 'lg';
      
      main.setAttribute('data-pane-width', size);
      if (styleTagRef.current) {
        styleTagRef.current.textContent = generatePaneCSS(paneWidth);
      }
    };

    // Use ResizeObserver for continuous updates
    resizeObserverRef.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        updateCSS();
      }
    });
    resizeObserverRef.current.observe(main);

    // Initial update
    updateCSS();

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
    };
  }, [isOpen, isMobile, chatWidth]);

  // Handle drag resize with live CSS updates
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      // Divider is on left edge of chat panel
      // Dragging left (smaller e.clientX) = wider chat
      // Dragging right (larger e.clientX) = narrower chat
      const delta = startXRef.current - e.clientX;
      const newWidth = Math.max(MIN_CHAT_WIDTH, Math.min(MAX_CHAT_WIDTH, startWidthRef.current + delta));
      
      setChatWidth(newWidth);
      document.documentElement.style.setProperty('--chat-width', `${newWidth}px`);
      
      // Force immediate CSS update during drag (ResizeObserver may lag)
      if (styleTagRef.current) {
        const main = document.getElementById('app-main-content');
        if (main) {
          const paneWidth = main.clientWidth;
          styleTagRef.current.textContent = generatePaneCSS(paneWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.body.classList.remove('is-dragging');
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.body.classList.add('is-dragging');

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleDividerMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    startXRef.current = e.clientX;
    startWidthRef.current = chatWidth;
  };

  // Reset to list view when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setView('list');
      setActiveConversation(null);
    }
  }, [isOpen, setActiveConversation]);

  // Load conversations when drawer opens
  useEffect(() => {
    if (isOpen && (user?.id || localStorage.getItem('oshocks_guest_session_id'))) {
      fetchConversations();
    }
  }, [isOpen, user?.id, fetchConversations]);

  // ─── AUTO-SELECT CONVERSATION WHEN SET FROM OUTSIDE ───
  // When activeConversation is set (e.g., from CreateChatModal via Navbar),
  // ensure we fetch messages and mark as read
  useEffect(() => {
    if (activeConversation?.id && isOpen) {
      // Only fetch if we haven't loaded messages for this conversation
      const hasMessagesForConv = messages.some(m => m.conversation_id === activeConversation.id);
      if (!hasMessagesForConv || messages.length === 0) {
        fetchMessages(activeConversation.id);
      }
      markAsRead(activeConversation.id);
      
      // On mobile, ensure we're in thread view
      if (isMobile) {
        setView('thread');
      }
    }
  }, [activeConversation?.id, isOpen, isMobile]);

  // Load messages when conversation selected (mobile only — desktop handles in click)
  useEffect(() => {
    if (activeConversation?.id && isMobile) {
      fetchMessages(activeConversation.id);
      markAsRead(activeConversation.id);
      setView('thread');
    }
  }, [activeConversation?.id, isMobile]);

  const handleSend = (body, replyTo = null, attachments = []) => {
    if (activeConversation?.id) {
      sendMessage(activeConversation.id, body, 'text', null, replyTo, attachments);
    }
  };

  const handleStartCall = (type) => {
    if (!activeConversation || !onStartCall) return;
    const calleeId = activeConversation.other_participant?.id;
    if (!calleeId) {
      alert('Cannot call this conversation');
      return;
    }
    onStartCall(activeConversation.id, calleeId, type);
  };

  const handleBackToList = useCallback(() => {
    setView('list');
    setActiveConversation(null);
  }, [setActiveConversation]);

  const handleSelectConversation = useCallback((conv) => {
    console.log('[ChatDrawer] Clicked conv:', conv?.id);
    setActiveConversation(conv);
    if (conv?.id) {
      fetchMessages(conv.id);
      markAsRead(conv.id);
    }
  }, [setActiveConversation, fetchMessages, markAsRead]);

  // Sync body class for z-index management
  useEffect(() => {
    if (isOpen && !isMobile) {
      document.body.classList.add('chat-drawer-open');
    } else {
      document.body.classList.remove('chat-drawer-open');
    }
    return () => document.body.classList.remove('chat-drawer-open');
  }, [isOpen, isMobile]);

    // ─── DESKTOP: RESIZABLE SPLIT-PANE LAYOUT ───
  const DesktopLayout = () => {
    // When chat panel is narrow, use mobile-style layout
    const isNarrow = chatWidth < NARROW_BREAKPOINT;
    const [chatView, setChatView] = useState('list'); // 'list' | 'thread' for narrow mode

    // Reset to list when closing or widening
    useEffect(() => {
      if (!isNarrow) setChatView('list');
    }, [isNarrow]);

    const handleSelectConv = useCallback((conv) => {
      setActiveConversation(conv);
      if (isNarrow) setChatView('thread');
    }, [setActiveConversation, isNarrow]);

    const handleBackToList = () => {
      setChatView('list');
      setActiveConversation(null);
    };

    return (
    <div className="fixed inset-0 z-50 flex pointer-events-none">
      {/* Left side — completely transparent, no click handler, no overlay */}
      <div 
        className="flex-1 pointer-events-none"
        aria-hidden="true"
      />
      
      {/* Resizable Chat Panel — Right Side */}
      <div 
        ref={containerRef}
        className="relative flex h-full bg-white shadow-2xl flex-col pointer-events-auto chat-panel"
        style={{ width: `${chatWidth}px`, flexShrink: 0 }}
      >
        {/* Draggable Divider — ALWAYS visible so user can resize back up from narrow */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-6 -translate-x-1/2 cursor-col-resize z-30 flex items-center justify-center group ${isDragging ? 'bg-blue-500/10' : ''}`}
          onMouseDown={handleDividerMouseDown}
          title="Drag to resize"
        >
          <div className={`w-1.5 h-20 rounded-full transition-colors ${isDragging ? 'bg-blue-500' : 'bg-gray-300 group-hover:bg-blue-400'}`} />
          <GripVertical className={`absolute w-5 h-5 transition-colors ${isDragging ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-400'}`} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0 relative">
          {/* Resize hint when narrow */}
          {isNarrow && !isDragging && (
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-400 rounded-full animate-pulse" title="Drag left to expand" />
          )}
          <div className="flex items-center gap-3">
            {isNarrow && chatView === 'thread' && activeConversation && (
              <button 
                onClick={handleBackToList}
                className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="font-semibold text-gray-900 text-lg">
              {isNarrow && chatView === 'thread' && activeConversation 
                ? (activeConversation.title || activeConversation.other_participant?.name || 'Chat')
                : 'Messages'
              }
            </h2>
            {unreadTotal > 0 && chatView === 'list' && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadTotal}
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content — Split or Mobile style based on width */}
        {isNarrow ? (
          /* Narrow: WhatsApp-style single view — pointer-events-none so divider gets clicks */
          <div className="flex-1 overflow-hidden relative z-10 pointer-events-none">
            {chatView === 'list' ? (
              <div className="h-full pointer-events-auto">
              <ConversationList
                conversations={conversations}
                activeId={activeConversation?.id}
                onSelect={handleSelectConv}
                unreadTotal={unreadTotal}
                onClose={onClose}
                onPinToggle={onPinToggle}
                onArchiveToggle={onArchiveToggle}
                onDelete={onDelete}
                compact={false}
                entryPoint={entryPoint}
              />
              </div>
            ) : (
              <div className="flex flex-col h-full pointer-events-auto">
                <MessageThread
                  conversation={activeConversation}
                  messages={messages}
                  loading={loading}
                  sending={sending}
                  typingUsers={typingUsers}
                  onSendMessage={handleSend}
                  onStartCall={handleStartCall}
                  messagesEndRef={messagesEndRef}
                  onSendTyping={sendTypingIndicator}
                  isMobile={true}
                  onBack={handleBackToList}
                />
              </div>
            )}
          </div>
        ) : (
          /* Wide: Split pane view */
        <div className="flex flex-1 overflow-hidden">
          {/* Conversation List — Responsive width based on chat panel size */}
          <div 
            className="border-r border-gray-100 flex-shrink-0 transition-all duration-200"
            style={{ 
              width: chatWidth < 550 ? '200px' : '256px',
              display: chatWidth < 400 ? 'none' : 'block'
            }}
          >
            <ConversationList
              conversations={conversations}
              activeId={activeConversation?.id}
              onSelect={handleSelectConversation}
              unreadTotal={unreadTotal}
              onClose={onClose}
              onPinToggle={onPinToggle}
              onArchiveToggle={onArchiveToggle}
              onDelete={onDelete}
              compact={true}
              entryPoint={entryPoint}
              key={`conv-list-${activeConversation?.id || 'none'}`}
            />
          </div>
          
          {/* Message Thread — Main area */}
          <div className="flex-1 flex flex-col min-w-0">
            {activeConversation ? (
              <MessageThread
                key={activeConversation.id}
                conversation={activeConversation}
                messages={messages}
                loading={loading}
                sending={sending}
                typingUsers={typingUsers}
                onSendMessage={handleSend}
                onStartCall={handleStartCall}
                messagesEndRef={messagesEndRef}
                onSendTyping={sendTypingIndicator}
                isMobile={false}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50/50">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-base font-medium text-gray-500">Select a conversation</p>
                <p className="text-sm text-gray-400 mt-1">Choose from the list to start chatting</p>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
    );
  };

  // ─── MOBILE: WHATSAPP-STYLE LAYOUT ───
  const MobileLayout = () => (
    <div className={`fixed inset-0 z-50 bg-white transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      {view === 'list' ? (
        /* Conversation List View */
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
            <h2 className="font-semibold text-gray-900 text-lg">Messages</h2>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ConversationList
              conversations={conversations}
              activeId={activeConversation?.id}
              onSelect={handleSelectConversation}
              unreadTotal={unreadTotal}
              onClose={onClose}
              onPinToggle={onPinToggle}
              onArchiveToggle={onArchiveToggle}
              onDelete={onDelete}
              compact={false}
              entryPoint={entryPoint}
            />
          </div>
        </div>
      ) : (
        /* Message Thread View */
        <div className="flex flex-col h-full">
          <MessageThread
            conversation={activeConversation}
            messages={messages}
            loading={loading}
            sending={sending}
            typingUsers={typingUsers}
            onSendMessage={handleSend}
            onStartCall={handleStartCall}
            messagesEndRef={messagesEndRef}
            onSendTyping={sendTypingIndicator}
            isMobile={true}
            onBack={handleBackToList}
          />
        </div>
      )}
    </div>
  );

  if (!isOpen) return null;

  return isMobile ? <MobileLayout /> : <DesktopLayout />;
};

export default ChatDrawer;
