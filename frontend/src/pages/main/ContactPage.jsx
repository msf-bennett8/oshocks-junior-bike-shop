import { useState, useRef, useEffect } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  MessageSquare,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  CheckCircle,
  AlertCircle,
  Smartphone,
  HeadphonesIcon,
  Building,
  Users,
  User,
  Package,
  Loader2,
  FileText,
  X,
  Paperclip,
  Headphones,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import CaseSuccessModal from '../../components/messaging/CaseSuccessModal';

// ─── CASE TYPES (12 items including new Partnership & Business) ───
const caseTypes = [
  { value: 'partnership_business', label: 'Partnership & Business', icon: Building, color: 'bg-purple-100 text-purple-700 border-purple-200', desc: 'Partner with us or business inquiries' },
  { value: 'order_issue', label: 'Order Issue', icon: Package, color: 'bg-orange-100 text-orange-700 border-orange-200', desc: 'Problem with an order' },
  { value: 'account_login', label: 'Account & Login', icon: User, color: 'bg-indigo-100 text-indigo-700 border-indigo-200', desc: 'Login or profile issues' },
  { value: 'report_problem', label: 'Report Problem', icon: AlertCircle, color: 'bg-red-100 text-red-700 border-red-200', desc: 'Bugs or abuse' },
  { value: 'shipment_delivery', label: 'Shipment & Delivery', icon: MapPin, color: 'bg-cyan-100 text-cyan-700 border-cyan-200', desc: 'Shipping & tracking' },
  { value: 'services_booking', label: 'Services & Booking', icon: Clock, color: 'bg-emerald-100 text-emerald-700 border-emerald-200', desc: 'Book a service' },
  { value: 'general_inquiry', label: 'General Inquiry', icon: MessageSquare, color: 'bg-violet-100 text-violet-700 border-violet-200', desc: 'General questions' },
  { value: 'payment_billing', label: 'Payment & Billing', icon: Mail, color: 'bg-amber-100 text-amber-700 border-amber-200', desc: 'Payment issues' },
  { value: 'product_info', label: 'Product Information', icon: Package, color: 'bg-teal-100 text-teal-700 border-teal-200', desc: 'Product details' },
  { value: 'returns_refund', label: 'Returns & Refund', icon: AlertCircle, color: 'bg-pink-100 text-pink-700 border-pink-200', desc: 'Return requests' },
  { value: 'technical_support', label: 'Technical Support', icon: Smartphone, color: 'bg-slate-100 text-slate-700 border-slate-200', desc: 'Troubleshooting' },
  { value: 'other', label: 'Other', icon: HeadphonesIcon, color: 'bg-gray-100 text-gray-700 border-gray-200', desc: 'Anything else' },
];

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700 border-red-200' },
];

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

const ContactPage = () => {
  const { user, isAuthenticated } = useAuth();

  // ─── FORM STATE ───
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: '',
    message: '',
    orderNumber: '',
  });
  const [priority, setPriority] = useState('medium');
  const [validationErrors, setValidationErrors] = useState({});
  
  // ─── UI STATE ───
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdCaseId, setCreatedCaseId] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // ─── ORDER VALIDATION ───
  const [validatingOrder, setValidatingOrder] = useState(false);
  const [orderValid, setOrderValid] = useState(null);
  const [orderData, setOrderData] = useState(null);

  // ─── ATTACHMENT ───
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [attachmentError, setAttachmentError] = useState(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const fileInputRef = useRef(null);

  // ─── AUTOFILL FROM AUTH ───
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  const isOrderRelated = ['order_issue', 'returns_refund', 'payment_billing'].includes(formData.category);

  // ─── HANDLERS ───
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear validation error on change
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCategoryChange = (value) => {
    setFormData(prev => ({ ...prev, category: value }));
    setOrderValid(null);
    setOrderData(null);
    if (validationErrors.category) {
      setValidationErrors(prev => ({ ...prev, category: '' }));
    }
  };

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

  // ─── ORDER VALIDATION ───
  const validateOrder = async (purchaseId) => {
    if (!purchaseId?.trim()) return;
    setValidatingOrder(true);
    setOrderValid(null);
    try {
      const res = await api.post('/support-cases/validate-order', { purchase_id: purchaseId.trim() });
      setOrderValid(true);
      setOrderData(res.data);
    } catch (err) {
      setOrderValid(false);
      setOrderData(null);
    } finally {
      setValidatingOrder(false);
    }
  };

  // ─── VALIDATION ───
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required.';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!formData.category) errors.category = 'Please select a case type.';
    if (!formData.subject.trim()) errors.subject = 'Subject is required.';
    if (!formData.message.trim()) {
      errors.message = 'Message is required.';
    } else if (formData.message.trim().length < 20) {
      errors.message = 'Message must be at least 20 characters.';
    }
    if (isOrderRelated && orderValid !== true) {
      errors.orderNumber = 'Please verify your Purchase ID before submitting.';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ─── SUBMIT ───
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Get guest session for anonymous users
      const getGuestSessionId = () => {
        let sessionId = localStorage.getItem('oshocks_guest_session_id');
        if (!sessionId) {
          sessionId = 'guest_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
          localStorage.setItem('oshocks_guest_session_id', sessionId);
        }
        return sessionId;
      };

      const guestId = !isAuthenticated ? getGuestSessionId() : null;

      // Step 1: Create conversation
      const convPayload = {
        type: isOrderRelated ? 'order_support' : 'support',
      };
      const convRes = await api.post('/conversations', convPayload, {
        headers: guestId ? { 'X-Guest-Session-ID': guestId } : {}
      });
      const conversation = convRes.data.data;

      // Step 2: Create case in conversation
      const caseFormData = new FormData();
      caseFormData.append('case_type', formData.category);
      caseFormData.append('subject', formData.subject.trim());
      caseFormData.append('description', formData.message.trim());
      caseFormData.append('priority', priority);
      if (formData.orderNumber.trim()) {
        caseFormData.append('purchase_id', formData.orderNumber.trim());
      }
      if (!isAuthenticated) {
        caseFormData.append('guest_name', formData.name.trim());
        caseFormData.append('guest_email', formData.email.trim());
        if (formData.phone.trim()) caseFormData.append('guest_phone', formData.phone.trim());
      }
      if (attachment) {
        caseFormData.append('attachment_file', attachment);
        caseFormData.append('attachment[name]', attachment.name);
        caseFormData.append('attachment[type]', attachment.type);
        caseFormData.append('attachment[size]', attachment.size);
      }

      const caseRes = await api.post(`/conversations/${conversation.id}/cases`, caseFormData, {
        headers: {
          ...(guestId ? { 'X-Guest-Session-ID': guestId } : {}),
          'Content-Type': 'multipart/form-data',
        },
      });

      const newCaseId = caseRes.data.data?.support_case?.case_id || '';
      setCreatedCaseId(newCaseId);
      setShowSuccessModal(true);

      // Reset form
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        subject: '',
        category: '',
        message: '',
        orderNumber: '',
      });
      setPriority('medium');
      setOrderValid(null);
      setOrderData(null);
      setAttachment(null);
      setAttachmentPreview(null);
      setValidationErrors({});
    } catch (err) {
      console.error('Case creation failed:', err);
      setValidationErrors(prev => ({
        ...prev,
        submit: err.response?.data?.message || 'Failed to create support case. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCaseType = caseTypes.find(t => t.value === formData.category);

  const contactMethods = [
    {
      icon: <Phone className="text-orange-600" size={24} />,
      title: 'Phone',
      details: '+254 715 061 213',
      subDetails: 'Mon-Sat, 8AM-8PM',
      link: 'tel:+254715061213'
    },
    {
      icon: <Mail className="text-orange-600" size={24} />,
      title: 'Email',
      details: 'oshocksstores@gmail.com',
      subDetails: 'We reply within 24 hours',
      link: 'mailto:oshocksstores@gmail.com'
    },
    {
      icon: <Smartphone className="text-orange-600" size={24} />,
      title: 'WhatsApp',
      details: '+254 715 061 213',
      subDetails: 'Quick responses',
      link: 'https://wa.me/254715061213'
    },
    {
      icon: <MessageSquare className="text-orange-600" size={24} />,
      title: 'Live Chat',
      details: 'Chat with us',
      subDetails: 'Available 24/7',
      link: '#'
    }
  ];

  const officeLocations = [
    {
      name: 'Main Store - Nairobi Virtual',
      address: 'Online Store, Nationwide',
      hours: 'Mon-Sat: 8:00 AM - 8:00 PM',
      sunday: 'Sunday: 10:00 AM - 6:00 PM',
      phone: '+254 715 061 213'
    },
    {
      name: 'Mwihoko Branch',
      address: 'Cables Mwihoko, Nairobi',
      hours: 'Mon-Sat: 9:00 AM - 7:00 PM',
      sunday: 'Sunday: 10:00 AM - 5:00 PM',
      phone: '+254 715 061 213'
    },
    {
      name: 'Githurai Branch',
      address: 'Riflo Githurai, Nairobi',
      hours: 'Mon-Sat: 8:30 AM - 7:30 PM',
      sunday: 'Sunday: Closed',
      phone: '+254 715 061 213'
    }
  ];

  const departments = [
    {
      icon: <HeadphonesIcon size={20} />,
      name: 'Customer Support',
      description: 'General inquiries and product questions'
    },
    {
      icon: <Building size={20} />,
      name: 'Sales Department',
      description: 'Bulk orders and business inquiries'
    },
    {
      icon: <Users size={20} />,
      name: 'Partnership',
      description: 'Become a seller or partner with us'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-12 md:py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              background: 'radial-gradient(circle at 30% 50%, rgb(255, 69, 0) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgb(255, 165, 0) 0%, transparent 40%)',
            }}
          />
          <div className="absolute inset-0 bg-[url(https://images.unsplash.com/photo-1485965120184-e224f7a1d7f0?w=1920&q=80)] bg-cover bg-center opacity-20 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4">Get In Touch</h1>
            <p className="text-base sm:text-lg md:text-xl text-orange-100 px-4">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Methods */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactMethods.map((method, index) => (
            <a
              key={index}
              href={method.link}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 hover:-translate-y-1 transform"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-3 bg-gray-50 rounded-full">
                  {method.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{method.title}</h3>
                <p className="text-gray-700 font-medium mb-1">{method.details}</p>
                <p className="text-sm text-gray-500">{method.subDetails}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Send Us a Message</h2>
                <p className="text-gray-600">Fill out the form below and our team will get back to you within 24 hours.</p>
              </div>

              {/* Submit Error */}
              {validationErrors.submit && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-red-800">{validationErrors.submit}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-2.5 border ${
                          validationErrors.name ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                        placeholder="John Doe"
                      />
                    </div>
                    {validationErrors.name && (
                      <p className="mt-1 text-xs text-red-600">{validationErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-2.5 border ${
                          validationErrors.email ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                        placeholder="you@example.com"
                      />
                    </div>
                    {validationErrors.email && (
                      <p className="mt-1 text-xs text-red-600">{validationErrors.email}</p>
                    )}
                  </div>
                </div>

                {/* Phone & Order Number with Verify */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number (Optional)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="+254 712 345 678"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      Purchase ID {isOrderRelated ? '*' : '(Optional)'}
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          id="orderNumber"
                          name="orderNumber"
                          type="text"
                          value={formData.orderNumber}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, orderNumber: e.target.value }));
                            setOrderValid(null);
                            setOrderData(null);
                          }}
                          onBlur={(e) => {
                            if (e.target.value.trim().length >= 3) validateOrder(e.target.value.trim());
                          }}
                          className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                            orderValid === true ? 'bg-green-50 border-green-300' :
                            orderValid === false ? 'bg-red-50 border-red-300' :
                            'border-gray-300'
                          }`}
                          placeholder="e.g. AF7SEIV1U0"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!isAuthenticated) {
                            setShowLoginPrompt(true);
                            return;
                          }
                          if (formData.orderNumber) validateOrder(formData.orderNumber);
                        }}
                        disabled={validatingOrder || !formData.orderNumber.trim()}
                        className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
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
                        <span className="text-sm text-red-700">Order not found. Please check your Purchase ID.</span>
                      </div>
                    )}
                    {validationErrors.orderNumber && (
                      <p className="mt-1 text-xs text-red-600">{validationErrors.orderNumber}</p>
                    )}
                  </div>
                </div>

                {/* Case Type Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Case Type *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.category}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className={`block w-full px-3 py-2.5 border ${
                        validationErrors.category ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white appearance-none`}
                    >
                      <option value="">Select a case type...</option>
                      {caseTypes.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                    <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
                  </div>
                  {selectedCaseType && (
                    <p className="mt-1 text-xs text-gray-500">{selectedCaseType.desc}</p>
                  )}
                  {validationErrors.category && (
                    <p className="mt-1 text-xs text-red-600">{validationErrors.category}</p>
                  )}
                </div>

                {/* Priority/Severity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {priorityOptions.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setPriority(p.value)}
                        className={`py-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                          priority === p.value
                            ? `${p.color} ring-2 ring-offset-1 ring-gray-300`
                            : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2.5 border ${
                      validationErrors.subject ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                    placeholder="Brief description of your issue"
                  />
                  {validationErrors.subject && (
                    <p className="mt-1 text-xs text-red-600">{validationErrors.subject}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2.5 border ${
                      validationErrors.message ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none`}
                    placeholder="Please provide as much detail as possible about your inquiry..."
                  />
                  <div className="flex items-center justify-between mt-1">
                    {validationErrors.message ? (
                      <p className="text-xs text-red-600">{validationErrors.message}</p>
                    ) : (
                      <p className="text-xs text-gray-500">
                        {formData.message.length} characters (minimum 20)
                      </p>
                    )}
                  </div>
                </div>

                {/* Attachment Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attachment (Optional)
                  </label>
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
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-orange-400 hover:text-orange-600 transition-colors"
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
                          type="button"
                          onClick={handleRemoveAttachment}
                          className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                          title="Remove attachment"
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
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

                {/* Order verification warning */}
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

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.category || !formData.subject.trim() || !formData.name.trim() || !formData.email.trim() || (isOrderRelated && orderValid !== true)}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                      Creating Support Case...
                    </>
                  ) : (
                    <>
                      <Headphones className="w-5 h-5 mr-2" />
                      Create Support Case
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Office Hours */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="text-orange-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Business Hours</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monday - Friday</span>
                  <span className="font-semibold text-gray-900">8:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saturday</span>
                  <span className="font-semibold text-gray-900">8:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sunday</span>
                  <span className="font-semibold text-gray-900">10:00 AM - 6:00 PM</span>
                </div>
              </div>
            </div>

            {/* Departments */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Departments</h3>
              <div className="space-y-4">
                {departments.map((dept, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg text-orange-600 flex-shrink-0">
                      {dept.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{dept.name}</h4>
                      <p className="text-xs text-gray-600 mt-1">{dept.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Follow Us</h3>
              <p className="text-sm text-gray-600 mb-4">Stay connected on social media</p>
              <div className="flex gap-3">
                <a href="#" className="p-3 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors">
                  <Facebook size={20} />
                </a>
                <a href="#" className="p-3 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors">
                  <Twitter size={20} />
                </a>
                <a href="#" className="p-3 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors">
                  <Instagram size={20} />
                </a>
                <a href="#" className="p-3 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors">
                  <Linkedin size={20} />
                </a>
                <a href="#" className="p-3 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors">
                  <Youtube size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Office Locations */}
        <div className="mt-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Visit Our Stores</h2>
            <p className="text-gray-600">Find us at any of our convenient locations across Kenya</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {officeLocations.map((location, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-orange-100 to-orange-200 rounded-lg">
                    <MapPin className="text-orange-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{location.name}</h3>
                    <p className="text-sm text-gray-600">{location.address}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock size={16} className="text-gray-400" />
                    <span>{location.hours}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock size={16} className="text-gray-400" />
                    <span>{location.sunday}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone size={16} className="text-gray-400" />
                    <span>{location.phone}</span>
                  </div>
                </div>
                <button className="mt-4 w-full py-2 border border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-medium text-sm">
                  Get Directions
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-16 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="aspect-video bg-gray-200 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Interactive Map Coming Soon</p>
                <p className="text-sm text-gray-500 mt-2">Find us on Google Maps</p>
              </div>
            </div>
          </div>
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
          }}
          onViewChat={() => {
            setShowSuccessModal(false);
            setCreatedCaseId('');
            // Optionally navigate to messages
          }}
        />
      )}
    </div>
  );
};

export default ContactPage;