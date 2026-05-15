// ============================================================================
// CREATE CHAT MODAL — Search users + New Support Case + Order Context
// ============================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import supportCaseService from '../../services/supportCaseService';
import {
  Search, X, MessageCircle, Headphones, User, Mail,
  ShoppingBag, Clock, AlertCircle, ChevronRight, Loader2,
  Truck, Wrench, MessageSquare, CreditCard, Package, RotateCcw, Cpu, HelpCircle,
  Paperclip, FileText
} from 'lucide-react';
import CaseSuccessModal from './CaseSuccessModal';

const CreateChatModal = ({ isOpen, onClose, onConversationCreated, orderContext = null }) => {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [createdCaseId, setCreatedCaseId] = useState('');
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

  // Guest contact fields
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [validatingOrder, setValidatingOrder] = useState(false);
  const [orderValid, setOrderValid] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [recentConversations, setRecentConversations] = useState([]);
  
  // Attachment state
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [attachmentError, setAttachmentError] = useState(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const fileInputRef = useRef(null);
  
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf',
    'text/plain', 'text/csv',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip', 'application/x-zip-compressed',
    'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav'
  ];
  const BLOCKED_EXTENSIONS = ['.exe', '.dll', '.bat', '.cmd', '.sh', '.php', '.js', '.html', '.htm', '.jar', '.apk', '.ipa'];
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

    const resetForm = () => {
      setSearchQuery('');
      setSearchResults([]);
      setCreatingForUserId(null);
      setSupportStep('select');
      setSelectedCaseType(null);
      setCaseForm({ subject: '', description: '', order_number: '', priority: 'medium' });
      setGuestName('');
      setGuestEmail('');
      setGuestPhone('');
      setOrderValid(null);
      setOrderData(null);
      setError(null);
      setAttachment(null);
      setAttachmentPreview(null);
      setAttachmentError(null);
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
      account_login: 'Account & Login',
      report_problem: 'Report a Problem',
      shipment_delivery: 'Shipment & Delivery',
      services_booking: 'Services & Booking',
      general_inquiry: 'General Inquiry',
      payment_billing: 'Payment & Billing',
      product_info: 'Product Information',
      returns_refund: 'Returns & Refund',
      technical_support: 'Technical Support',
      other: 'Other',
    };
    setCaseForm(prev => ({
      ...prev,
      subject: orderContext ? `${labels[type]}: ${orderContext.purchaseId || orderContext.orderNumber}` : labels[type],
      order_number: orderContext?.purchaseId || orderContext?.orderNumber || '',
    }));
    if (orderContext?.orderNumber) {
      validateOrder(orderContext.orderNumber);
    }
  };

    // ─── ATTACHMENT HANDLERS ───
  const validateFile = (file) => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB.`;
    }
    
    // Check MIME type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `File type "${file.type || 'unknown'}" not allowed. Allowed: images, PDF, DOC, XLS, CSV, TXT, ZIP, MP4, MP3.`;
    }
    
    // Check blocked extensions (extra security)
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (BLOCKED_EXTENSIONS.includes(ext)) {
      return `File extension "${ext}" is blocked for security reasons.`;
    }
    
    // Check for double extensions (common virus trick)
    const nameParts = file.name.split('.');
    if (nameParts.length > 2) {
      const lastTwo = '.' + nameParts.slice(-2).join('.').toLowerCase();
      if (BLOCKED_EXTENSIONS.some(blocked => lastTwo.includes(blocked))) {
        return `Suspicious file name detected. Please rename your file.`;
      }
    }
    
    return null;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setAttachmentError(null);
    const error = validateFile(file);
    if (error) {
      setAttachmentError(error);
      setAttachment(null);
      setAttachmentPreview(null);
      return;
    }
    
    setAttachment(file);
    
    // Generate preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setAttachmentPreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setAttachmentPreview(null);
    }
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
    setAttachmentError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadAttachmentToCloudinary = async (file, caseId = null) => {
    if (caseId) {
      const { default: attachmentService } = await import('../../services/attachmentService');
      const res = await attachmentService.uploadCaseAttachment(file, caseId);
      return {
        url: res.data.data.cloudinary_secure_url,
        public_id: res.data.data.cloudinary_public_id,
        resource_type: res.data.data.cloudinary_resource_type,
        format: file.name.split('.').pop().toLowerCase(),
        bytes: res.data.data.file_size,
        secure_url: res.data.data.cloudinary_secure_url,
        attachment_id: res.data.data.id,
      };
    }
    
    console.warn('[Attachment] No caseId provided, using placeholder');
    return {
      url: `https://res.cloudinary.com/demo/image/upload/${Date.now()}_${file.name}`,
      public_id: `temp/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}`,
      resource_type: file.type.startsWith('image/') ? 'image' : 'raw',
      format: file.name.split('.').pop().toLowerCase(),
      bytes: file.size,
      secure_url: `https://res.cloudinary.com/demo/image/upload/${Date.now()}_${file.name}`,
    };
  };

  const validateOrder = async (orderNumber) => {
    if (!orderNumber?.trim()) return;
    setValidatingOrder(true);
    try {
      const res = await supportCaseService.validateOrder(orderNumber.trim());
      // Note: validateOrder already searches order_display as primary
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
      let attachmentData = null;
      
      // Attachment will be uploaded after case creation with proper case_id folder

      // Step 1: Create or get the support conversation
      const convPayload = {
        type: selectedCaseType === 'order_issue' ? 'order_support' : 'support',
      };
      
      // Get guest session for anonymous users
      const getGuestSessionId = () => {
        let sessionId = localStorage.getItem('oshocks_guest_session_id');
        if (!sessionId) {
          sessionId = 'guest_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
          localStorage.setItem('oshocks_guest_session_id', sessionId);
        }
        return sessionId;
      };
      
      const guestId = !user ? getGuestSessionId() : null;
      const headers = guestId ? { 'X-Guest-Session-ID': guestId } : {};
      
      const convRes = await api.post('/conversations', convPayload, { headers });
      const conversation = convRes.data.data;

      // Step 2: Create the case IN the conversation (this creates messages too)
      const caseFormData = new FormData();
      caseFormData.append('case_type', selectedCaseType);
      caseFormData.append('subject', caseForm.subject);
      caseFormData.append('description', caseForm.description);
      caseFormData.append('priority', caseForm.priority);
      if (selectedCaseType === 'order_issue' && caseForm.order_number) {
        caseFormData.append('purchase_id', caseForm.order_number);
      }
      if (!user) {
        caseFormData.append('guest_name', guestName.trim());
        caseFormData.append('guest_email', guestEmail.trim());
        if (guestPhone.trim()) caseFormData.append('guest_phone', guestPhone.trim());
      }
      if (attachment) {
        caseFormData.append('attachment_file', attachment);
        caseFormData.append('attachment[name]', attachment.name);
        caseFormData.append('attachment[type]', attachment.type);
        caseFormData.append('attachment[size]', attachment.size);
      }

      const caseRes = await api.post(`/conversations/${conversation.id}/cases`, caseFormData, {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const newCaseId = caseRes.data.data?.support_case?.case_id || '';
      setCreatedCaseId(newCaseId);
      setShowSuccessModal(true);

      // Merge conversation with case messages for immediate display
      const conversationWithMessages = {
        ...conversation,
        messages: [
          caseRes.data.data.system_message,
          caseRes.data.data.user_message,
        ],
        support_case: caseRes.data.data.support_case,
      };

      onConversationCreated?.(conversationWithMessages, false, caseRes.data.data.support_case);
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-fade-in max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
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
        <div className="p-4 overflow-y-auto flex-1">
          
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
                        This support case will be linked to Purchase ID {orderContext.purchaseId || orderContext.orderNumber}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Select Case Type */}
              {supportStep === 'select' && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
                    What do you need help with?
                  </p>

                  <div className="grid grid-cols-1 gap-2 max-h-[50vh] overflow-y-auto pr-1">
                    {[
                      { id: 'order_issue', icon: ShoppingBag, label: 'Order Issue', desc: 'Problem with an order', color: 'from-orange-500 to-red-500', bg: 'bg-orange-50', border: 'border-orange-200', hover: 'hover:border-orange-400' },
                      { id: 'account_login', icon: User, label: 'Account & Login', desc: 'Login or profile issues', color: 'from-indigo-500 to-purple-500', bg: 'bg-indigo-50', border: 'border-indigo-200', hover: 'hover:border-indigo-400' },
                      { id: 'report_problem', icon: AlertCircle, label: 'Report Problem', desc: 'Bugs or abuse', color: 'from-red-500 to-rose-500', bg: 'bg-red-50', border: 'border-red-200', hover: 'hover:border-red-400' },
                      { id: 'shipment_delivery', icon: Truck, label: 'Shipment & Delivery', desc: 'Shipping & tracking', color: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-50', border: 'border-cyan-200', hover: 'hover:border-cyan-400' },
                      { id: 'services_booking', icon: Wrench, label: 'Services & Booking', desc: 'Book a service', color: 'from-emerald-500 to-green-500', bg: 'bg-emerald-50', border: 'border-emerald-200', hover: 'hover:border-emerald-400' },
                      { id: 'general_inquiry', icon: MessageSquare, label: 'General Inquiry', desc: 'General questions', color: 'from-violet-500 to-purple-500', bg: 'bg-violet-50', border: 'border-violet-200', hover: 'hover:border-violet-400' },
                      { id: 'payment_billing', icon: CreditCard, label: 'Payment & Billing', desc: 'Payment issues', color: 'from-amber-500 to-yellow-500', bg: 'bg-amber-50', border: 'border-amber-200', hover: 'hover:border-amber-400' },
                      { id: 'product_info', icon: Package, label: 'Product Info', desc: 'Product details', color: 'from-teal-500 to-cyan-500', bg: 'bg-teal-50', border: 'border-teal-200', hover: 'hover:border-teal-400' },
                      { id: 'returns_refund', icon: RotateCcw, label: 'Returns & Refund', desc: 'Return requests', color: 'from-pink-500 to-rose-500', bg: 'bg-pink-50', border: 'border-pink-200', hover: 'hover:border-pink-400' },
                      { id: 'technical_support', icon: Cpu, label: 'Technical Support', desc: 'Troubleshooting', color: 'from-slate-500 to-gray-500', bg: 'bg-slate-50', border: 'border-slate-200', hover: 'hover:border-slate-400' },
                      { id: 'other', icon: HelpCircle, label: 'Other', desc: 'Anything else', color: 'from-gray-500 to-slate-500', bg: 'bg-gray-50', border: 'border-gray-200', hover: 'hover:border-gray-400' },
                    ].map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => handleSelectCaseType(topic.id)}
                        className={`w-full flex items-center gap-3 p-3 ${topic.bg} border-2 ${topic.border} ${topic.hover} rounded-xl transition-all text-left group`}
                      >
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${topic.color} flex items-center justify-center text-white flex-shrink-0 shadow-sm`}>
                          <topic.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-900">{topic.label}</p>
                          <p className="text-xs text-gray-600">{topic.desc}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Case Details Form */}
              {supportStep === 'form' && (
                <div className="space-y-3">
                  {/* Back button */}
                  <button
                    onClick={() => setSupportStep('select')}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    Back to case types
                  </button>

                  {/* Selected case type badge */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedCaseType === 'order_issue' && <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold"><ShoppingBag className="w-3.5 h-3.5" /> Order Issue</div>}
                    {selectedCaseType === 'account_login' && <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold"><User className="w-3.5 h-3.5" /> Account & Login</div>}
                    {selectedCaseType === 'report_problem' && <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold"><AlertCircle className="w-3.5 h-3.5" /> Report Problem</div>}
                    {selectedCaseType === 'shipment_delivery' && <div className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-100 text-cyan-700 rounded-full text-xs font-semibold"><Truck className="w-3.5 h-3.5" /> Shipment & Delivery</div>}
                    {selectedCaseType === 'services_booking' && <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold"><Wrench className="w-3.5 h-3.5" /> Services & Booking</div>}
                    {selectedCaseType === 'general_inquiry' && <div className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-100 text-violet-700 rounded-full text-xs font-semibold"><MessageSquare className="w-3.5 h-3.5" /> General Inquiry</div>}
                    {selectedCaseType === 'payment_billing' && <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold"><CreditCard className="w-3.5 h-3.5" /> Payment & Billing</div>}
                    {selectedCaseType === 'product_info' && <div className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-100 text-teal-700 rounded-full text-xs font-semibold"><Package className="w-3.5 h-3.5" /> Product Information</div>}
                    {selectedCaseType === 'returns_refund' && <div className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-100 text-pink-700 rounded-full text-xs font-semibold"><RotateCcw className="w-3.5 h-3.5" /> Returns & Refund</div>}
                    {selectedCaseType === 'technical_support' && <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold"><Cpu className="w-3.5 h-3.5" /> Technical Support</div>}
                    {selectedCaseType === 'other' && <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold"><HelpCircle className="w-3.5 h-3.5" /> Other</div>}
                  </div>

                  {/* Guest Contact Info */}
                  {!user && (
                    <div className="space-y-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-semibold text-amber-800">Your Contact Info</span>
                        <span className="text-xs text-amber-600 ml-auto">Required for guest support</span>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                        <input
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="Your full name"
                          required={!user}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                        <input
                          type="email"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          placeholder="your@email.com"
                          required={!user}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Phone (optional)</label>
                        <input
                          type="tel"
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          placeholder="+254 712 345 678"
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                  )}

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

                  {/* Order Number (only for order-related types) */}
                  {(selectedCaseType === 'order_issue' || selectedCaseType === 'returns_refund' || selectedCaseType === 'payment_billing') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Purchase ID *</label>
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
                            placeholder="e.g. AF7SEIV1U0"
                            className={`w-full pl-9 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                              orderValid === true ? 'bg-green-50 border-2 border-green-300 focus:ring-green-500' :
                              orderValid === false ? 'bg-red-50 border-2 border-red-300 focus:ring-red-500' :
                              'bg-gray-100 focus:ring-orange-500'
                            }`}
                          />
                        </div>
                        <button
                          onClick={() => {
                            if (!user) {
                              setShowLoginPrompt(true);
                              return;
                            }
                            if (caseForm.order_number) validateOrder(caseForm.order_number);
                          }}
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
                            Purchase ID {orderData.data?.purchase_id || orderData.purchase_id || orderData.data?.order_number || orderData.order_number} • {orderData.data?.status || orderData.status} • ${orderData.data?.total || orderData.total}
                          </p>
                        </div>
                      )}
                      {orderValid === false && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-red-700">Order not found. Please check your Purchase ID.</span>
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

                  {/* Attachment Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Attachment (Optional)</label>
                    
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      accept={ALLOWED_TYPES.join(',')}
                    />
                    
                    {!attachment ? (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAttachment}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-orange-400 hover:text-orange-600 transition-colors disabled:opacity-50"
                      >
                        <Paperclip className="w-4 h-4" />
                        Click to upload file (max 10MB)
                      </button>
                    ) : (
                      <div className={`relative p-3 rounded-xl border-2 ${attachmentError ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}>
                        <div className="flex items-center gap-3">
                          {attachmentPreview ? (
                            <img src={attachmentPreview} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                              <FileText className="w-6 h-6 text-green-600" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{attachment.name}</p>
                            <p className="text-xs text-gray-500">{(attachment.size / 1024).toFixed(1)} KB • {attachment.type}</p>
                          </div>
                          <button
                            onClick={handleRemoveAttachment}
                            disabled={uploadingAttachment}
                            className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                            title="Remove attachment"
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                        {uploadingAttachment && (
                          <div className="absolute inset-0 bg-green-50/80 rounded-xl flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
                            <span className="ml-2 text-xs text-green-700 font-medium">Uploading...</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {attachmentError && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-red-600">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        {attachmentError}
                      </div>
                    )}
                    
                    <p className="mt-1.5 text-[11px] text-gray-400">
                      Allowed: JPG, PNG, GIF, PDF, DOC, XLS, CSV, TXT, ZIP, MP4, MP3. Max 10MB. No executables.
                    </p>
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

                  {/* Submit helper text for unverified orders */}
                  {selectedCaseType && ['order_issue', 'returns_refund', 'payment_billing'].includes(selectedCaseType) && orderValid !== true && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span className="text-sm text-amber-700">
                        {!user 
                          ? 'Please log in to verify your order before submitting.' 
                          : 'Please click "Verify" to validate your Purchase ID before submitting.'}
                      </span>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    onClick={handleCreateSupportCase}
                    disabled={loading || uploadingAttachment || !caseForm.subject.trim() || (!user && (!guestName.trim() || !guestEmail.trim())) || ((selectedCaseType === 'order_issue' || selectedCaseType === 'returns_refund' || selectedCaseType === 'payment_billing') && orderValid !== true)}
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
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <p className="text-xs text-gray-500 text-center">
            {isAuthenticated 
              ? 'All conversations are monitored for quality and safety' 
              : 'Please sign in to start a conversation'}
          </p>
        </div>
      </div>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Log In Required</h3>
            <p className="text-sm text-gray-600 mb-5">
              To verify your order and create a case, please log in to your account. This helps us protect your order information.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => window.location.href = '/login'}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all"
              >
                Log In
              </button>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Continue as Guest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <CaseSuccessModal
          caseId={createdCaseId}
          message="Our team will get back to you within 24 hours. Check your messages for updates."
          onClose={() => {
            setShowSuccessModal(false);
            setCreatedCaseId('');
            onClose();
          }}
          onViewChat={() => {
            setShowSuccessModal(false);
            setCreatedCaseId('');
            // Keep modal open for chat continuation
          }}
        />
      )}
    </div>
  );
};

export default CreateChatModal;
