// ============================================================================
// CREATE CHAT MODAL — Search users + New Support Case + Order Context
// ============================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  Search, X, MessageCircle, Headphones, User, Mail, 
  ShoppingBag, Clock, AlertCircle, ChevronRight, Loader2 
} from 'lucide-react';

const CreateChatModal = ({ isOpen, onClose, onConversationCreated, orderContext = null }) => {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'support'
  const [recentConversations, setRecentConversations] = useState([]);
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
      fetchRecentConversations();
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(searchQuery.trim());
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const performSearch = async (query) => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const res = await api.get(`/conversations/search-users?q=${encodeURIComponent(query)}`);
      setSearchResults(res.data.data || []);
    } catch (err) {
      console.error('User search failed:', err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentConversations = async () => {
    if (!isAuthenticated) return;
    
    try {
      const res = await api.get('/conversations');
      // Get last 5 conversations
      const recent = (res.data.data || []).slice(0, 5);
      setRecentConversations(recent);
    } catch (err) {
      console.error('Failed to fetch recent conversations:', err);
    }
  };

  const handleStartDirectChat = async (targetUser) => {
    setLoading(true);
    try {
      const payload = {
        participant_id: targetUser.id,
        type: 'direct',
      };

      const res = await api.post('/conversations', payload);
      const conversation = res.data.data;
      
      onConversationCreated?.(conversation);
      onClose();
    } catch (err) {
      console.error('Failed to start conversation:', err);
      alert('Failed to start conversation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSupportChat = async () => {
    setLoading(true);
    try {
      const payload = {
        type: orderContext ? 'order_support' : 'support',
        title: orderContext ? `Order Support: ${orderContext.orderNumber}` : 'New Support Case',
      };

      if (orderContext?.id) {
        payload.order_id = orderContext.id;
      }

      const res = await api.post('/conversations', payload);
      const conversation = res.data.data;
      
      onConversationCreated?.(conversation);
      onClose();
    } catch (err) {
      console.error('Failed to start support chat:', err);
      alert('Failed to start support chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeConversation = (conversation) => {
    onConversationCreated?.(conversation);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">New Conversation</h3>
            <p className="text-sm text-gray-500">
              {orderContext ? `About Order #${orderContext.orderNumber}` : 'Start a chat with a user or support'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'users' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Find User
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'support' 
                ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/50' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Headphones className="w-4 h-4 inline mr-2" />
            Support Case
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          
          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or username..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                {loading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 animate-spin" />
                )}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">
                    Search Results
                  </p>
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleStartDirectChat(result)}
                      className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 rounded-xl transition-colors text-left group"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {result.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{result.name}</p>
                        <p className="text-sm text-gray-500 truncate">{result.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          result.role === 'seller' ? 'bg-purple-100 text-purple-700' :
                          result.role === 'admin' || result.role === 'super_admin' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {result.role}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* No Results */}
              {searchQuery.trim().length >= 2 && !loading && searchResults.length === 0 && (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No users found matching "{searchQuery}"</p>
                </div>
              )}

              {/* Recent Conversations */}
              {!searchQuery.trim() && recentConversations.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">
                    Recent Conversations
                  </p>
                  {recentConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => handleResumeConversation(conv)}
                      className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 rounded-xl transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {conv.title || conv.other_participant?.name || 'Chat'}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {conv.last_message || 'No messages yet'}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!searchQuery.trim() && recentConversations.length === 0 && (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Type to search for users</p>
                </div>
              )}
            </div>
          )}

          {/* SUPPORT TAB */}
          {activeTab === 'support' && (
            <div className="space-y-4">
              {/* Order Context Banner */}
              {orderContext && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <ShoppingBag className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-orange-900">Order Context</p>
                      <p className="text-sm text-orange-700">
                        This support case will be linked to Order #{orderContext.orderNumber}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Support Options */}
              <div className="space-y-3">
                <button
                  onClick={handleStartSupportChat}
                  disabled={loading}
                  className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Headphones className="w-6 h-6" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-bold text-lg">New Support Case</p>
                    <p className="text-sm text-white/80">
                      {orderContext 
                        ? 'Get help with this order' 
                        : 'Contact platform support team'}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Quick Support Topics */}
                {!orderContext && (
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: ShoppingBag, label: 'Order Issue', desc: 'Problem with an order' },
                      { icon: Mail, label: 'Account Help', desc: 'Login or profile' },
                      { icon: AlertCircle, label: 'Report Problem', desc: 'Bug or complaint' },
                      { icon: Clock, label: 'Delivery Question', desc: 'Shipping status' },
                    ].map((topic) => (
                      <button
                        key={topic.label}
                        onClick={handleStartSupportChat}
                        className="flex flex-col items-start gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
                      >
                        <topic.icon className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-sm text-gray-900">{topic.label}</p>
                          <p className="text-xs text-gray-500">{topic.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Support Hours</p>
                    <p>Monday - Friday: 8:00 AM - 6:00 PM EAT</p>
                    <p>Saturday: 9:00 AM - 3:00 PM EAT</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            {isAuthenticated 
              ? 'All conversations are monitored for quality and safety' 
              : 'Please sign in to start a conversation'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateChatModal;
