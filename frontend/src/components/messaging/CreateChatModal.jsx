// ============================================================================
// CREATE CHAT MODAL — Search users + New Support Case + Order Context
// ============================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import supportCaseService from '../../services/supportCaseService';
import { 
  Search, X, MessageCircle, Headphones, User, Mail, 
  ShoppingBag, Clock, AlertCircle, ChevronRight, Loader2 
} from 'lucide-react';

const CreateChatModal = ({ isOpen, onClose, onConversationCreated, orderContext = null }) => {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creatingForUserId, setCreatingForUserId] = useState(null); // Track who we're creating for
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'support'
  const [supportStep, setSupportStep] = useState('select'); // 'select' | 'form'
  const [selectedCaseType, setSelectedCaseType] = useState(null);
  const [caseForm, setCaseForm] = useState({
    subject: '',
    description: '',
    order_number: '',
    priority: 'medium',
  });
  const [validatingOrder, setValidatingOrder] = useState(false);
  const [orderValid, setOrderValid] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [recentConversations, setRecentConversations] = useState([]);
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

    const resetForm = () => {
      setSearchQuery('');
      setSearchResults([]);
      setCreatingForUserId(null);
      setSupportStep('select');
      setSelectedCaseType(null);
      setCaseForm({ subject: '', description: '', order_number: '', priority: 'medium' });
      setOrderValid(null);
      setOrderData(null);
      setError(null);
    };

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
      fetchRecentConversations();
      setSupportStep('select');
      setSelectedCaseType(null);
      setCaseForm({ subject: '', description: '', order_number: '', priority: 'medium' });
      setOrderValid(null);
      setOrderData(null);
      setError(null);
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

    // ─── ATOMIC CREATION GUARD ───
  const isCreatingRef = useRef(false);

  const handleStartDirectChat = async (targetUser) => {
    // Prevent double-clicks and concurrent creation
    if (isCreatingRef.current) return;
    if (creatingForUserId === targetUser.id) return;
    
    isCreatingRef.current = true;
    setCreatingForUserId(targetUser.id);
    setLoading(true);

    try {
      const payload = {
        participant_id: targetUser.id,
        type: 'direct',
      };

      const res = await api.post('/conversations', payload);
      const conversation = res.data.data;
      const isExisting = res.data.existing === true;

      // CRITICAL: Pass both conversation AND whether it existed
      // This lets parent decide to fetch messages or not
      onConversationCreated?.(conversation, isExisting);
      onClose();
    } catch (err) {
      console.error('Failed to start conversation:', err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to start conversation. Please try again.';
      alert(errorMsg);
    } finally {
      setLoading(false);
      setCreatingForUserId(null);
      // Delay reset to prevent rapid-fire clicks
      setTimeout(() => {
        isCreatingRef.current = false;
      }, 500);
    }
  };

  const handleSelectCaseType = (type) => {
    setSelectedCaseType(type);
    setSupportStep('form');
    const labels = {
      order_issue: 'Order Issue',
      account_help: 'Account Help',
      report_problem: 'Report a Problem',
      delivery_question: 'Delivery Question',
    };
    setCaseForm(prev => ({
      ...prev,
      subject: orderContext ? `${labels[type]}: ${orderContext.orderNumber}` : labels[type],
      order_number: orderContext?.orderNumber || '',
    }));
    if (orderContext?.orderNumber) {
      validateOrder(orderContext.orderNumber);
    }
  };

  const validateOrder = async (orderNumber) => {
    if (!orderNumber?.trim()) return;
    setValidatingOrder(true);
    try {
      const res = await supportCaseService.validateOrder(orderNumber.trim());
      setOrderValid(true);
      setOrderData(res.data);
      setError(null);
    } catch (err) {
      setOrderValid(false);
      setOrderData(null);
      setError(err.response?.data?.message || 'Invalid order number');
    } finally {
      setValidatingOrder(false);
    }
  };

  const handleCreateSupportCase = async () => {
    if (!caseForm.subject.trim()) {
      setError('Subject is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        type: selectedCaseType === 'order_issue' ? 'order_support' : 'support',
        case_type: selectedCaseType,
        subject: caseForm.subject,
        description: caseForm.description,
        priority: caseForm.priority,
        ...(selectedCaseType === 'order_issue' && caseForm.order_number && {
          order_number: caseForm.order_number,
        }),
      };

      const res = await api.post('/conversations', payload);
      const conversation = res.data.data;
      const supportCase = res.data.support_case;

      onConversationCreated?.(conversation, false, supportCase);
      onClose();
    } catch (err) {
      console.error('Failed to create support case:', err);
      setError(err.response?.data?.message || 'Failed to create support case');
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
                      disabled={creatingForUserId === result.id || isCreatingRef.current}
                      className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 rounded-xl transition-colors text-left group disabled:opacity-50 disabled:cursor-not-allowed"
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
                        {creatingForUserId === result.id ? (
                          <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        )}
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
              {/* Error Display */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}

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

              {/* Step 1: Select Case Type */}
              {supportStep === 'select' && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
                    What do you need help with?
                  </p>
                  
                  {[
                    { id: 'order_issue', icon: ShoppingBag, label: 'Order Issue', desc: 'Problem with an existing order', color: 'from-orange-500 to-red-500', bg: 'bg-orange-50', border: 'border-orange-200', hover: 'hover:border-orange-400' },
                    { id: 'account_help', icon: Mail, label: 'Account Help', desc: 'Login, profile, or account issues', color: 'from-indigo-500 to-purple-500', bg: 'bg-indigo-50', border: 'border-indigo-200', hover: 'hover:border-indigo-400' },
                    { id: 'report_problem', icon: AlertCircle, label: 'Report a Problem', desc: 'Bugs, abuse, or platform issues', color: 'from-red-500 to-rose-500', bg: 'bg-red-50', border: 'border-red-200', hover: 'hover:border-red-400' },
                    { id: 'delivery_question', icon: Clock, label: 'Delivery Question', desc: 'Shipping, tracking, or delivery', color: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-50', border: 'border-cyan-200', hover: 'hover:border-cyan-400' },
                  ].map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => handleSelectCaseType(topic.id)}
                      className={`w-full flex items-center gap-4 p-4 ${topic.bg} border-2 ${topic.border} ${topic.hover} rounded-xl transition-all text-left group`}
                    >
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${topic.color} flex items-center justify-center text-white flex-shrink-0 shadow-sm`}>
                        <topic.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900">{topic.label}</p>
                        <p className="text-sm text-gray-600">{topic.desc}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </button>
                  ))}
                </div>
              )}

              {/* Step 2: Case Details Form */}
              {supportStep === 'form' && (
                <div className="space-y-4">
                  {/* Back button */}
                  <button
                    onClick={() => setSupportStep('select')}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    Back to case types
                  </button>

                  {/* Selected case type badge */}
                  <div className="flex items-center gap-2">
                    {selectedCaseType === 'order_issue' && <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold"><ShoppingBag className="w-3.5 h-3.5" /> Order Issue</div>}
                    {selectedCaseType === 'account_help' && <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold"><Mail className="w-3.5 h-3.5" /> Account Help</div>}
                    {selectedCaseType === 'report_problem' && <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold"><AlertCircle className="w-3.5 h-3.5" /> Report Problem</div>}
                    {selectedCaseType === 'delivery_question' && <div className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-100 text-cyan-700 rounded-full text-xs font-semibold"><Clock className="w-3.5 h-3.5" /> Delivery Question</div>}
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject *</label>
                    <input
                      type="text"
                      value={caseForm.subject}
                      onChange={(e) => setCaseForm(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Brief summary of your issue"
                      className="w-full px-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    />
                  </div>

                  {/* Order Number (only for order_issue) */}
                  {selectedCaseType === 'order_issue' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Order Number *</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <ShoppingBag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={caseForm.order_number}
                            onChange={(e) => {
                              setCaseForm(prev => ({ ...prev, order_number: e.target.value }));
                              setOrderValid(null);
                              setOrderData(null);
                            }}
                            onBlur={(e) => {
                              if (e.target.value.trim().length >= 3) validateOrder(e.target.value.trim());
                            }}
                            placeholder="e.g. ORD-2026-0001"
                            className={`w-full pl-9 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                              orderValid === true ? 'bg-green-50 border-2 border-green-300 focus:ring-green-500' :
                              orderValid === false ? 'bg-red-50 border-2 border-red-300 focus:ring-red-500' :
                              'bg-gray-100 focus:ring-orange-500'
                            }`}
                          />
                        </div>
                        <button
                          onClick={() => caseForm.order_number && validateOrder(caseForm.order_number)}
                          disabled={validatingOrder || !caseForm.order_number.trim()}
                          className="px-4 py-3 bg-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                        >
                          {validatingOrder ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                          Verify
                        </button>
                      </div>
                      {orderValid === true && orderData && (
                        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-sm font-medium text-green-800">Order validated</span>
                          </div>
                          <p className="text-xs text-green-700 mt-1">
                            Order #{orderData.data?.order_number || orderData.order_number} • {orderData.data?.status || orderData.status} • ${orderData.data?.total || orderData.total}
                          </p>
                        </div>
                      )}
                      {orderValid === false && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-red-700">Order not found. Please check the number.</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                    <textarea
                      value={caseForm.description}
                      onChange={(e) => setCaseForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      placeholder="Describe your issue in detail..."
                      className="w-full px-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none"
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { value: 'low', label: 'Low', color: 'bg-green-100 text-green-700 border-green-200' },
                        { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-700 border-blue-200' },
                        { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700 border-orange-200' },
                        { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700 border-red-200' },
                      ].map((p) => (
                        <button
                          key={p.value}
                          onClick={() => setCaseForm(prev => ({ ...prev, priority: p.value }))}
                          className={`py-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                            caseForm.priority === p.value 
                              ? `${p.color} ring-2 ring-offset-1 ring-gray-300` 
                              : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleCreateSupportCase}
                    disabled={loading || !caseForm.subject.trim() || (selectedCaseType === 'order_issue' && orderValid !== true)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating Support Case...
                      </>
                    ) : (
                      <>
                        <Headphones className="w-5 h-5" />
                        Create Support Case
                      </>
                    )}
                  </button>
                </div>
              )}

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
