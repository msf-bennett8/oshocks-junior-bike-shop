import { useState, useEffect, useRef } from 'react';
import {
  Mail, Phone, MessageCircle, MapPin, Clock, Send, Loader, CheckCircle,
  AlertCircle, User, HelpCircle, Package, CreditCard, Truck, Shield,
  ChevronRight, X, Headphones, FileText, ExternalLink, Video,
  Wrench, MessageSquare, RotateCcw, Cpu, Paperclip, Loader2, Copy, Briefcase, AlertTriangle
} from 'lucide-react';
import ChatDrawer from '../../components/messaging/ChatDrawer';
import CaseSuccessModal from '../../components/messaging/CaseSuccessModal';
import CallOverlay from '../../components/messaging/CallOverlay';
import { useMessaging } from '../../hooks/useMessaging';
import { useWebRTC } from '../../hooks/useWebRTC';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { getGuestSessionId, getGuestProfile, setGuestProfile } from '../../utils/guestSession';

const ContactSupportPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: '',
    orderNumber: '',
    message: '',
    attachment: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showFAB, setShowFAB] = useState(false);
  const [isFABOpen, setIsFABOpen] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  // Priority state
  const [priority, setPriority] = useState('medium');

  // Success modal state
  const [createdCaseId, setCreatedCaseId] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Order validation state
  const [validatingOrder, setValidatingOrder] = useState(false);
  const [orderValid, setOrderValid] = useState(null);
  const [orderData, setOrderData] = useState(null);

  // Attachment state (same as CaseCreateModal)
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
  
  // In-app messaging & calls
  const [chatOpen, setChatOpen] = useState(false);
  const { user } = useAuth();
  const { incomingCall, dismissIncomingCall, startSupportChat } = useMessaging(user?.id);
  const {
    localStream,
    remoteStream,
    callState,
    callType,
    currentCall,
    callDuration,
    callError,
    formattedDuration,
    initiateCall,
    answerCall,
    declineCall,
    endCall,
  } = useWebRTC(user?.id);

  const caseTypes = [
    { value: 'partnership_business', label: 'Partnership & Business', icon: Briefcase },
    { value: 'order_issue', label: 'Order Issue', icon: Package },
    { value: 'account_login', label: 'Account & Login', icon: User },
    { value: 'report_problem', label: 'Report Problem', icon: AlertTriangle },
    { value: 'shipment_delivery', label: 'Shipment & Delivery', icon: Truck },
    { value: 'services_booking', label: 'Services & Booking', icon: Wrench },
    { value: 'general_inquiry', label: 'General Inquiry', icon: MessageSquare },
    { value: 'payment_billing', label: 'Payment & Billing', icon: CreditCard },
    { value: 'product_info', label: 'Product Information', icon: Package },
    { value: 'returns_refund', label: 'Returns & Refund', icon: RotateCcw },
    { value: 'technical_support', label: 'Technical Support', icon: Cpu },
    { value: 'other', label: 'Other', icon: HelpCircle },
  ];

  const isOrderRelated = ['order_issue', 'returns_refund', 'payment_billing'].includes(formData.category);

  const faqs = [
    {
      question: 'How long does delivery take in Nairobi?',
      answer: 'Delivery within Nairobi typically takes 1-2 business days. For other cities in Kenya, delivery takes 3-5 business days.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept M-Pesa, Visa, Mastercard, and bank transfers. All payments are processed securely.'
    },
    {
      question: 'How do I track my order?',
      answer: 'Once your order ships, you\'ll receive a tracking number via SMS and email. You can also track your order from your account dashboard.'
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a 14-day return policy for unused items in original packaging. Shipping costs for returns are covered by the customer unless the item is defective.'
    },
    {
      question: 'Do you offer warranty on bicycles?',
      answer: 'Yes! All complete bicycles come with a 1-year manufacturer warranty covering defects in materials and workmanship.'
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setShowFAB(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Autofill form when user is authenticated
  useEffect(() => {
    if (user?.id) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

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

  const validateOrder = async (orderNumber) => {
    if (!orderNumber?.trim()) return;
    setValidatingOrder(true);
    try {
      const res = await api.post('/support-cases/validate-order', { purchase_id: orderNumber.trim() });
      setOrderValid(true);
      setOrderData(res.data);
      setValidationErrors(prev => ({ ...prev, orderNumber: '' }));
    } catch (err) {
      setOrderValid(false);
      setOrderData(null);
      setValidationErrors(prev => ({ ...prev, orderNumber: err.response?.data?.message || 'Invalid order number' }));
    } finally {
      setValidatingOrder(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^(\+254|0)[17]\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid Kenyan phone number';
    }

    if (!formData.category) {
      errors.category = 'Please select a case type';
    }

    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      errors.message = 'Description is required';
    } else if (formData.message.trim().length < 20) {
      errors.message = 'Please provide more details (at least 20 characters)';
    }

    if (isOrderRelated && orderValid !== true) {
      errors.orderNumber = 'Please verify your Purchase ID before submitting';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setValidationErrors({});

    try {
      // Step 1: Get or initialize guest session
      const getGuestSessionId = () => {
        let sessionId = localStorage.getItem('oshocks_guest_session_id');
        if (!sessionId) {
          sessionId = 'guest_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
          localStorage.setItem('oshocks_guest_session_id', sessionId);
        }
        return sessionId;
      };

      const guestId = getGuestSessionId();
      const headers = { 'X-Guest-Session-ID': guestId };

      // Step 2: Create support conversation (same as CreateChatModal)
      const convPayload = {
        type: 'support',
      };

      const convRes = await api.post('/conversations', convPayload, { headers });
      const conversation = convRes.data.data;

      // Step 3: Create case within conversation using FormData (same as CaseCreateModal)
      const caseFormData = new FormData();
      caseFormData.append('case_type', formData.category);
      caseFormData.append('subject', formData.subject.trim());
      caseFormData.append('description', formData.message.trim());
      caseFormData.append('priority', priority);
      if (formData.orderNumber.trim()) {
        caseFormData.append('purchase_id', formData.orderNumber.trim());
      }
      caseFormData.append('guest_name', formData.name.trim());
      caseFormData.append('guest_email', formData.email.trim());
      if (formData.phone.trim()) caseFormData.append('guest_phone', formData.phone.trim());
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
      setSuccessMessage(`Support case created successfully! Case ID: ${newCaseId}. Our team will get back to you within 24 hours.`);
      setShowSuccessModal(true);

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        category: '',
        orderNumber: '',
        message: '',
        attachment: null
      });
      setPriority('medium');
      setAttachment(null);
      setAttachmentPreview(null);
      setOrderValid(null);
      setOrderData(null);

      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      console.error('Support submission error:', err);
      setValidationErrors({
        general: err.response?.data?.message || 'Failed to create support case. Please try again or contact us directly.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFAB = () => {
    setIsFABOpen(!isFABOpen);
  };

  // Support user config — fetches super_admin/owner dynamically
  const [supportUser, setSupportUser] = useState(null);

  // Fetch support user (super_admin or owner) on mount — works for guests too
  useEffect(() => {
    const fetchSupportUser = async () => {
      try {
        const { data } = await api.get('/support-user');
        if (data.data) {
          setSupportUser(data.data);
          return;
        }
      } catch (err) {
        console.log('Could not fetch support user:', err.message);
      }
      setSupportUser({ id: 1, name: 'Oshocks Support', role: 'super_admin' });
    };

    fetchSupportUser();
  }, []);

  // Start in-app call to support (requires auth)
  const handleCallSupport = async () => {
    if (!user?.id) {
      alert('Please log in to make calls');
      return;
    }
    if (!supportUser?.id) {
      alert('No support agent is currently available. Please try WhatsApp or Email instead.');
      return;
    }
    try {
      setIsFABOpen(false);
      const supportConv = await startSupportChat(supportUser.id);
      if (supportConv?.id) {
        initiateCall(supportConv.id, supportUser.id, 'voice');
      }
    } catch (err) {
      console.error('In-app call failed, falling back to phone:', err);
      window.location.href = 'tel:+254798558285';
    }
  };

  // Open chat with support
  const handleChatSupport = async () => {
    if (!supportUser?.id) {
      alert('No support agent is currently available. Please try WhatsApp or Email instead.');
      return;
    }
    
    // For guests, show form first if no profile exists
    if (!user?.id) {
      const existingProfile = getGuestProfile();
      if (!existingProfile.name) {
        setShowGuestForm(true);
        setIsFABOpen(false);
        return;
      }
    }
    
    setIsFABOpen(false);
    setChatOpen(true);
    await startSupportChat(supportUser.id);
  };

  // Handle guest form submission
  const handleGuestFormSubmit = async (e) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    
    setGuestProfile(guestName.trim(), guestEmail.trim() || null);
    setShowGuestForm(false);
    setChatOpen(true);
    
    await startSupportChat(supportUser?.id, guestName.trim(), guestEmail.trim() || null);
  };

  return (
    <>
      {/* Guest Info Modal */}
      {showGuestForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-lg">Start Chat</h3>
              <button
                onClick={() => setShowGuestForm(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Enter your details so our support team can assist you better.
            </p>
            
            <form onSubmit={handleGuestFormSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGuestForm(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Chat
                </button>
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                Already have an account?{' '}
                <a href="/login" className="text-blue-600 hover:underline">Log in</a>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Login Prompt Modal for Guests trying to verify orders */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Log In Required</h3>
            <p className="text-sm text-gray-600 mb-5">
              To verify your order and create a case, please log in to your account. This helps us protect your order information.
            </p>
            <div className="space-y-2">
              <a
                href="/login"
                className="block w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all"
              >
                Log In
              </a>
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

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block mb-6">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xl">OS</span>
                </div>
                <span className="text-2xl font-bold">Oshocks</span>
              </div>
            </div>
            <h1 className="text-4xl font-extrabold mb-4">How can we help you?</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Our support team is here to assist you with any questions or concerns
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Banner */}
        {successMessage && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
              {createdCaseId && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-green-600">Case ID:</span>
                  <code className="text-sm font-mono font-bold text-green-800 bg-green-100 px-2 py-0.5 rounded">{createdCaseId}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(createdCaseId);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="p-1 hover:bg-green-200 rounded transition-colors"
                    title="Copy Case ID"
                  >
                    {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5 text-green-700" />}
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                setSuccessMessage('');
                setCreatedCaseId('');
                setCopied(false);
              }}
              className="text-green-600 hover:text-green-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <CaseSuccessModal
            caseId={createdCaseId}
            message="Our team will get back to you within 24 hours. Check your messages for updates."
            onClose={() => {
              setShowSuccessModal(false);
              // Keep successMessage and createdCaseId for the banner
              setCopied(false);
            }}
          />
        )}

        {validationErrors.general && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{validationErrors.general}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <a href="tel:+254712345678" className="text-sm text-blue-600 hover:text-blue-700">
                      +254 712 345 678
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <a href="mailto:support@oshocks.co.ke" className="text-sm text-blue-600 hover:text-blue-700">
                      support@oshocks.co.ke
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MessageCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">WhatsApp</p>
                    <a href="https://wa.me/254712345678" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-700">
                      +254 712 345 678
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Location</p>
                    <p className="text-sm text-gray-600">
                      Nairobi, Kenya<br />
                      CBD, Moi Avenue
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Business Hours</p>
                    <p className="text-sm text-gray-600">
                      Mon - Fri: 8:00 AM - 6:00 PM<br />
                      Sat: 9:00 AM - 5:00 PM<br />
                      Sun: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Links</h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <span className="text-sm font-medium text-gray-900">Track Your Order</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <span className="text-sm font-medium text-gray-900">Returns & Refunds</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <span className="text-sm font-medium text-gray-900">Shipping Information</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <span className="text-sm font-medium text-gray-900">Warranty Policy</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg shadow-md p-6">
              <Headphones className="w-12 h-12 mb-3" />
              <h3 className="text-lg font-bold mb-2">Need Instant Help?</h3>
              <p className="text-sm text-blue-100 mb-4">
                Chat with our support team in real-time
              </p>
              <button 
                onClick={() => {
                  if (window.Tawk_API) {
                    window.Tawk_API.maximize();
                  }
                }}
                className="w-full bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Start Live Chat
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-2.5 border ${
                          validationErrors.name ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
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
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-2.5 border ${
                          validationErrors.email ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder="you@example.com"
                      />
                    </div>
                    {validationErrors.email && (
                      <p className="mt-1 text-xs text-red-600">{validationErrors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number (Optional)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-2.5 border ${
                          validationErrors.phone ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder="+254 712 345 678"
                      />
                    </div>
                    {validationErrors.phone && (
                      <p className="mt-1 text-xs text-red-600">{validationErrors.phone}</p>
                    )}
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
                          className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                          if (!user?.id) {
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Case Type *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {caseTypes.map((t) => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, category: t.value }))}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${
                            formData.category === t.value
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className={`w-5 h-5 mb-1 ${formData.category === t.value ? 'text-orange-600' : 'text-gray-400'}`} />
                          <span className="text-xs font-medium text-gray-700">{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {validationErrors.category && (
                    <p className="mt-2 text-xs text-red-600">{validationErrors.category}</p>
                  )}
                </div>

                {/* Priority Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: 'low', label: 'Low', color: 'bg-green-100 text-green-700 border-green-200' },
                      { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-700 border-blue-200' },
                      { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700 border-orange-200' },
                      { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700 border-red-200' },
                    ].map((p) => (
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
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Brief description of your issue"
                  />
                  {validationErrors.subject && (
                    <p className="mt-1 text-xs text-red-600">{validationErrors.subject}</p>
                  )}
                </div>

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
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none`}
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
                    <label className="flex-1 cursor-pointer block">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-400 transition-colors">
                        <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Click to upload (Max 10MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        onChange={handleFileSelect}
                        accept={ALLOWED_TYPES.join(',')}
                        className="hidden"
                      />
                    </label>
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

                  <p className="mt-2 text-xs text-gray-500 text-center">
                    Allowed: JPG, PNG, GIF, PDF, DOC, XLS, CSV, TXT, ZIP, MP4, MP3. Max 10MB. No executables.
                  </p>
                </div>

                {isOrderRelated && orderValid !== true && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 mb-4">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span className="text-sm text-amber-700">
                      {!user?.id 
                        ? 'Please log in to verify your order before submitting.' 
                        : 'Please click "Verify" to validate your Purchase ID before submitting.'}
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !formData.category || !formData.subject.trim() || !formData.name.trim() || !formData.email.trim() || (isOrderRelated && orderValid !== true)}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
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

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <details key={index} className="group">
                    <summary className="flex items-center justify-between cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="font-medium text-gray-900">{faq.question}</span>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
                    </summary>
                    <div className="mt-2 p-4 text-sm text-gray-600 border-l-4 border-blue-500 bg-blue-50">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
              <div className="mt-6 text-center">
                <button className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700">
                  View All FAQs
                  <ExternalLink className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:block">
        {showFAB && (
          <button
            onClick={toggleFAB}
            className="fixed left-6 bottom-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center z-50"
          >
            {isFABOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
          </button>
        )}

        {isFABOpen && (
          <div className="fixed left-6 bottom-24 bg-white rounded-lg shadow-xl p-4 w-72 z-50">
            <h3 className="font-bold text-gray-900 mb-3">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-4">Contact our support team</p>
            <div className="space-y-2">
              {/* Chat with Us — In-app messaging */}
              <button
                onClick={handleChatSupport}
                className="w-full flex items-center space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
              >
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <div>
                  <span className="text-sm font-medium text-gray-900">Chat with Us</span>
                  <span className="block text-[10px] text-green-600">● In-app messaging</span>
                </div>
              </button>

              <a
                href="mailto:support@oshocks.co.ke"
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Mail className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">Email Us</span>
              </a>

              <a
                href="https://wa.me/254798558285"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-900">WhatsApp</span>
              </a>

              {/* Call Us — WebRTC first, fallback to phone */}
              <button
                onClick={handleCallSupport}
                className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <Phone className="w-5 h-5 text-blue-600" />
                <div>
                  <span className="text-sm font-medium text-gray-900">Call Us</span>
                  <span className="block text-[10px] text-gray-500">Free in-app call or dial</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="lg:hidden">
        {showFAB && (
          <>
            <button
              onClick={toggleFAB}
              className={`fixed right-0 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 ${
                isFABOpen ? 'w-0 opacity-0' : 'w-12 h-16 rounded-l-full'
              }`}
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div
              className={`fixed inset-y-0 right-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
                isFABOpen ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold">Need Help?</h3>
                  <button
                    onClick={toggleFAB}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-sm text-blue-100">Contact Support!</p>
              </div>

              <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-100px)]">
                <div className="space-y-3">
                  {/* Chat with Us — In-app */}
                  <button
                    onClick={handleChatSupport}
                    className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg hover:shadow-md transition-all text-left"
                  >
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Chat with Us</p>
                      <p className="text-xs text-gray-600">In-app messaging</p>
                    </div>
                  </button>

                  {/* Call Us — WebRTC first, fallback to phone */}
                  <button
                    onClick={handleCallSupport}
                    className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg hover:shadow-md transition-all text-left"
                  >
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Call Us Now</p>
                      <p className="text-xs text-gray-600">Free in-app or +254 798 558 285</p>
                    </div>
                  </button>

                  <a
                    href="https://wa.me/254798558285"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-100 border border-green-200 rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">WhatsApp Chat</p>
                      <p className="text-xs text-gray-600">Quick response</p>
                    </div>
                  </a>

                  <a
                    href="mailto:support@oshocks.co.ke"
                    className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Email Support</p>
                      <p className="text-xs text-gray-600">support@oshocks.co.ke</p>
                    </div>
                  </a>

                  <button
                    onClick={() => {
                      if (window.Tawk_API) {
                        window.Tawk_API.maximize();
                      }
                      toggleFAB();
                    }}
                    className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Headphones className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 text-sm">Live Chat</p>
                      <p className="text-xs text-gray-600">Chat with an agent</p>
                    </div>
                  </button>
                </div>

                <div className="border-t border-gray-200 my-4"></div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm">Quick Links</h4>
                  <div className="space-y-2">
                    <div
                      onClick={toggleFAB}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <span className="text-sm text-gray-900">Track Order</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                    <div
                      onClick={toggleFAB}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <span className="text-sm text-gray-900">Returns</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                    <div
                      onClick={toggleFAB}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <span className="text-sm text-gray-900">FAQs</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <Clock className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">Business Hours</p>
                      <p className="text-xs text-gray-600">
                        Mon - Fri: 8:00 AM - 6:00 PM<br />
                        Sat: 9:00 AM - 5:00 PM<br />
                        Sun: Closed
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-xs text-blue-800">
                    <strong>Average Response Time:</strong> Within 2 hours during business hours
                  </p>
                </div>
              </div>
            </div>

              {isFABOpen && !chatOpen && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={toggleFAB}
              />
            )}
          </>
        )}
      </div>

      {showFAB && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed right-6 bottom-6 w-12 h-12 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-all z-40 lg:block hidden"
        >
          <ChevronRight className="w-6 h-6 mx-auto transform -rotate-90" />
        </button>
      )}

      {/* In-app Chat Drawer — Enhanced with split-pane/desktop support */}
      <ChatDrawer 
        isOpen={chatOpen} 
        onClose={() => setChatOpen(false)}
        onStartCall={(convId, calleeId, type) => {
          setChatOpen(false);
          initiateCall(convId, calleeId, type);
        }}
        entryPoint="support"
      />

      {/* In-app Call Overlay */}
      <CallOverlay
        callState={callState}
        callType={callType}
        incomingCall={incomingCall}
        currentCall={currentCall}
        localStream={localStream}
        remoteStream={remoteStream}
        callDuration={formattedDuration}
        callError={callError}
        onAnswer={(call) => {
          dismissIncomingCall();
          answerCall(call);
        }}
        onDecline={() => {
          declineCall(incomingCall?.sessionId);
          dismissIncomingCall();
        }}
        onEndCall={endCall}
        onDismissError={() => {}}
      />
      </div>
    </>
  );
};

export default ContactSupportPage;