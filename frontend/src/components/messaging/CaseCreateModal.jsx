import React, { useState, useRef } from 'react';
import { X, Package, User, AlertTriangle, Truck, Send, Wrench, MessageSquare, CreditCard, RotateCcw, Cpu, HelpCircle, Paperclip, FileText, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import CaseSuccessModal from './CaseSuccessModal';

const caseTypes = [
  { value: 'order_issue', label: 'Order Issue', icon: Package, color: 'bg-orange-100 text-orange-700' },
  { value: 'account_login', label: 'Account & Login', icon: User, color: 'bg-indigo-100 text-indigo-700' },
  { value: 'report_problem', label: 'Report Problem', icon: AlertTriangle, color: 'bg-red-100 text-red-700' },
  { value: 'shipment_delivery', label: 'Shipment & Delivery', icon: Truck, color: 'bg-cyan-100 text-cyan-700' },
  { value: 'services_booking', label: 'Services & Booking', icon: Wrench, color: 'bg-emerald-100 text-emerald-700' },
  { value: 'general_inquiry', label: 'General Inquiry', icon: MessageSquare, color: 'bg-violet-100 text-violet-700' },
  { value: 'payment_billing', label: 'Payment & Billing', icon: CreditCard, color: 'bg-amber-100 text-amber-700' },
  { value: 'product_info', label: 'Product Information', icon: Package, color: 'bg-teal-100 text-teal-700' },
  { value: 'returns_refund', label: 'Returns & Refund', icon: RotateCcw, color: 'bg-pink-100 text-pink-700' },
  { value: 'technical_support', label: 'Technical Support', icon: Cpu, color: 'bg-slate-100 text-slate-700' },
  { value: 'other', label: 'Other', icon: HelpCircle, color: 'bg-gray-100 text-gray-700' },
];

export const CaseCreateModal = ({ conversationId, onClose, onCreated }) => {
  const [type, setType] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [createdCaseId, setCreatedCaseId] = useState('');
  
  // Order validation state
  const [validatingOrder, setValidatingOrder] = useState(false);
  const [orderValid, setOrderValid] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [orderError, setOrderError] = useState(null);

  // Guest contact fields
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  // Check if user is authenticated (try multiple possible token keys)
  const isOrderRelated = ['order_issue', 'returns_refund', 'payment_billing'].includes(type);
  
  const { user, isAuthenticated } = useAuth();
  
  // Attachment state
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [attachmentError, setAttachmentError] = useState(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const fileInputRef = useRef(null);
  
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
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

    // ─── ATTACHMENT HANDLERS ───
  const validateFile = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB.`;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `File type "${file.type || 'unknown'}" not allowed.`;
    }
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (BLOCKED_EXTENSIONS.includes(ext)) {
      return `File extension "${ext}" is blocked for security reasons.`;
    }
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
    // If we have a caseId, upload via backend to proper case folder
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
    
    // Fallback: direct upload (should not happen in normal flow)
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

  const validateOrder = async (purchaseId) => {
    if (!purchaseId?.trim()) return;
    setValidatingOrder(true);
    setOrderError(null);
    try {
      const res = await api.post('/support-cases/validate-order', { purchase_id: purchaseId.trim() });
      setOrderValid(true);
      setOrderData(res.data);
      setOrderError(null);
    } catch (err) {
      setOrderValid(false);
      setOrderData(null);
      setOrderError(err.response?.data?.message || 'Invalid Purchase ID. Please check and try again.');
    } finally {
      setValidatingOrder(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[CaseCreateModal] handleSubmit called');
    if (!type || !subject.trim()) {
      console.log('[CaseCreateModal] Validation failed - type or subject missing');
      alert('Please select a case type and enter a subject.');
      return;
    }

    setLoading(true);
    console.log('[CaseCreateModal] Loading state set to true');

    try {
      // Ensure guest session is initialized for anonymous users
      console.log('[CaseCreateModal] Loading guest session utils...');
      
      // Inline guest session utils to avoid dynamic import issues in production
      const getGuestSessionId = () => {
        let sessionId = localStorage.getItem('oshocks_guest_session_id');
        if (!sessionId) {
          sessionId = 'guest_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
          localStorage.setItem('oshocks_guest_session_id', sessionId);
        }
        return sessionId;
      };
      
      const getGuestProfile = () => ({
        name: localStorage.getItem('oshocks_guest_name'),
        email: localStorage.getItem('oshocks_guest_email'),
      });
      
      const setGuestProfile = (name, email) => {
        if (name) localStorage.setItem('oshocks_guest_name', name);
        if (email) localStorage.setItem('oshocks_guest_email', email);
      };
      
      const generateAnonName = () => {
        const digits = Math.floor(1000 + Math.random() * 9000);
        return 'anon' + digits;
      };
      
      console.log('[CaseCreateModal] Guest session utils loaded');

      const guestId = getGuestSessionId();
      console.log('[CaseCreateModal] Guest session ID:', guestId);

      const profile = getGuestProfile();
      console.log('[CaseCreateModal] Guest profile:', profile);

      if (!profile.name) {
        const anonName = generateAnonName();
        setGuestProfile(anonName, profile.email);
        console.log('[CaseCreateModal] Generated guest name:', anonName);
      }
      let attachmentData = null;
      // Note: We upload after case creation to have the case_id for folder organization
      // The attachment will be passed in payload and backend handles the upload

      const payload = {
        case_type: type,
        subject: subject.trim(),
        description: description.trim(),
        priority,
      };

      // Add guest contact info for anonymous users
      if (!isAuthenticated) {
        payload.guest_name = guestName.trim();
        payload.guest_email = guestEmail.trim();
        if (guestPhone.trim()) {
          payload.guest_phone = guestPhone.trim();
        }
      }

      const trimmedOrder = orderNumber.trim();
      if (trimmedOrder) {
        payload.purchase_id = trimmedOrder;
      }

      // We need to use FormData to send the file
      const formData = new FormData();
      formData.append('case_type', type);
      formData.append('subject', subject.trim());
      formData.append('description', description.trim());
      formData.append('priority', priority);
      if (trimmedOrder) formData.append('purchase_id', trimmedOrder);
      if (!isAuthenticated) {
        formData.append('guest_name', guestName.trim());
        formData.append('guest_email', guestEmail.trim());
        if (guestPhone.trim()) formData.append('guest_phone', guestPhone.trim());
      }
      if (attachment) {
        formData.append('attachment_file', attachment);
        formData.append('attachment[name]', attachment.name);
        formData.append('attachment[type]', attachment.type);
        formData.append('attachment[size]', attachment.size);
      }

      console.log('[CaseCreateModal] Sending POST to /conversations/' + conversationId + '/cases with FormData');
      console.log('[CaseCreateModal] API baseURL:', api.defaults.baseURL);

      const response = await api.post(`/conversations/${conversationId}/cases`, formData, {
        headers: {
          'X-Guest-Session-ID': guestId,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('[CaseCreateModal] Sending POST to /conversations/' + conversationId + '/cases with payload:', payload);
      console.log('[CaseCreateModal] API baseURL:', api.defaults.baseURL);

      console.log('[CaseCreateModal] API response:', response);
      console.log('[CaseCreateModal] Response data:', response.data);

      const newCaseId = response.data.data?.support_case?.case_id || '';
      setCreatedCaseId(newCaseId);
      setShowSuccessModal(true);
      onCreated?.(response.data.data);
    } catch (err) {
      console.error('[CaseCreateModal] Case creation failed:', err);
      console.error('[CaseCreateModal] Error response:', err.response);
      console.error('[CaseCreateModal] Error message:', err.message);
      console.error('[CaseCreateModal] Error config:', err.config);
      alert('Case creation failed: ' + (err.response?.data?.message || err.message || 'Unknown error'));
    } finally {
      setLoading(false);
      console.log('[CaseCreateModal] Loading state set to false');
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-fade-in max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900 text-lg">New Support Case</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1">
          {/* Case Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Case Type *</label>
            <div className="grid grid-cols-2 gap-2">
              {caseTypes.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      type === t.value
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1 ${type === t.value ? 'text-orange-600' : 'text-gray-400'}`} />
                    <span className="text-xs font-medium text-gray-700">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of your issue"
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more details..."
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          

          {/* Guest Contact Info */}
          {!isAuthenticated && (
            <div className="space-y-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
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
                  required={!isAuthenticated}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="bennett@example.com"
                  required={!isAuthenticated}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Phone (optional)</label>
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="+254 712 345 678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          )}

          {/* Purchase ID / Order Lookup (required for order-related cases) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purchase ID {isOrderRelated ? '*' : '(optional)'}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => {
                    setOrderNumber(e.target.value);
                    setOrderValid(null);
                    setOrderData(null);
                    setOrderError(null);
                  }}
                  onBlur={(e) => {
                    if (isOrderRelated && !isAuthenticated && e.target.value.trim().length >= 3) {
                      setShowLoginPrompt(true);
                      return;
                    }
                    if (isOrderRelated && e.target.value.trim().length >= 3) {
                      validateOrder(e.target.value.trim());
                    }
                  }}
                  placeholder="e.g. AF7SEIV1U0"
                  required={isOrderRelated}
                  className={`w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                    orderValid === true ? 'bg-green-50 border-green-300 focus:ring-green-500' :
                    orderValid === false ? 'bg-red-50 border-red-300 focus:ring-red-500' :
                    'border-gray-300 focus:ring-orange-500'
                  }`}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) {
                    setShowLoginPrompt(true);
                    return;
                  }
                  if (orderNumber) validateOrder(orderNumber);
                }}
                disabled={validatingOrder || !orderNumber.trim()}
                className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
              >
                {validatingOrder ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
              </button>
            </div>
            
            {orderValid === true && orderData && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-green-800">Order validated</span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  Purchase ID {orderData.data?.purchase_id || orderData.purchase_id} • {orderData.data?.status || orderData.status} • ${orderData.data?.total || orderData.total}
                </p>
              </div>
            )}
            {orderValid === false && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700">{orderError}</span>
              </div>
            )}
            {isOrderRelated && !orderValid && !orderError && (
              <p className="text-xs text-amber-600 mt-1">Purchase ID is required for this case type. Please verify your order.</p>
            )}
          </div>

          {/* Attachment Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (Optional)</label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept={ALLOWED_TYPES.join(',')}
            />
            
            {!attachment ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAttachment}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-orange-400 hover:text-orange-600 transition-colors disabled:opacity-50"
              >
                <Paperclip className="w-4 h-4" />
                Click to upload file (max 10MB)
              </button>
            ) : (
              <div className={`relative p-3 rounded-xl border-2 ${attachmentError ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}>
                <div className="flex items-center gap-3">
                  {attachmentPreview ? (
                    <img src={attachmentPreview} alt="Preview" className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-green-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{attachment.name}</p>
                    <p className="text-xs text-gray-500">{(attachment.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveAttachment}
                    disabled={uploadingAttachment}
                    className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
                {uploadingAttachment && (
                  <div className="absolute inset-0 bg-green-50/80 rounded-xl flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
                  </div>
                )}
              </div>
            )}
            
            {attachmentError && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {attachmentError}
              </p>
            )}
            <p className="mt-1 text-[11px] text-gray-400">
              Allowed: JPG, PNG, GIF, PDF, DOC, XLS, CSV, TXT, ZIP, MP4, MP3. Max 10MB.
            </p>
          </div>

          {/* Submit helper text for unverified orders */}
          {isOrderRelated && orderValid !== true && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span className="text-sm text-amber-700">
                {!isAuthenticated 
                  ? 'Please log in to verify your order before submitting.' 
                  : 'Please click "Verify" to validate your Purchase ID before submitting.'}
              </span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!type || !subject.trim() || loading || uploadingAttachment || (!isAuthenticated && (!guestName.trim() || !guestEmail.trim())) || (isOrderRelated && orderValid !== true)}
              className="flex-1 py-2.5 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Create Case
            </button>
          </div>
        </form>
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
            onClose();
          }}
        />
      )}
    </div>
  );
};

export default CaseCreateModal;
