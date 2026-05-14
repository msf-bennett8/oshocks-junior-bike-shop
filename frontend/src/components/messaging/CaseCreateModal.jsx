import React, { useState, useRef } from 'react';
import { X, Package, User, AlertTriangle, Truck, Send, Wrench, MessageSquare, CreditCard, RotateCcw, Cpu, HelpCircle, Paperclip, FileText, Loader2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

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

  // Guest contact fields
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  // Check if user is authenticated (try multiple possible token keys)
  const isAuthenticated = !!(
    localStorage.getItem('token') || 
    localStorage.getItem('auth_token') || 
    localStorage.getItem('access_token') ||
    localStorage.getItem('user')
  );
  
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

  const uploadAttachmentToCloudinary = async (file) => {
    // TODO: Implement Cloudinary upload
    console.log('[Cloudinary Upload Placeholder]', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });
    await new Promise(r => setTimeout(r, 800));
    return {
      url: `https://res.cloudinary.com/demo/image/upload/${Date.now()}_${file.name}`,
      public_id: `attachments/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}`,
      resource_type: file.type.startsWith('image/') ? 'image' : 'raw',
      format: file.name.split('.').pop().toLowerCase(),
      bytes: file.size,
      secure_url: `https://res.cloudinary.com/demo/image/upload/${Date.now()}_${file.name}`,
    };
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
      if (attachment) {
        setUploadingAttachment(true);
        try {
          attachmentData = await uploadAttachmentToCloudinary(attachment);
        } catch (uploadErr) {
          alert('Failed to upload attachment. Please try again.');
          setUploadingAttachment(false);
          setLoading(false);
          return;
        }
        setUploadingAttachment(false);
      }

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

      if (attachmentData) {
        payload.attachment = {
          url: attachmentData.secure_url,
          public_id: attachmentData.public_id,
          name: attachment.name,
          type: attachment.type,
          size: attachment.size,
          resource_type: attachmentData.resource_type,
        };
      }

      console.log('[CaseCreateModal] Sending POST to /conversations/' + conversationId + '/cases with payload:', payload);
      console.log('[CaseCreateModal] API baseURL:', api.defaults.baseURL);

      const response = await api.post(`/conversations/${conversationId}/cases`, payload, {
        headers: {
          'X-Guest-Session-ID': guestId,
        },
      });
      console.log('[CaseCreateModal] API response:', response);
      console.log('[CaseCreateModal] Response data:', response.data);

      onCreated?.(response.data.data);
      onClose();
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

          {/* Purchase ID / Order Lookup (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purchase ID (optional)</label>
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. AF7SEIV1U0"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-xs text-gray-400 mt-1">Found in your order confirmation email or SMS</p>
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
              disabled={!type || !subject.trim() || loading || uploadingAttachment || (!isAuthenticated && (!guestName.trim() || !guestEmail.trim()))}
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
    </div>
  );
};

export default CaseCreateModal;
