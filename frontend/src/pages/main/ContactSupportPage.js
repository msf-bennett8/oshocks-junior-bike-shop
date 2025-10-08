import React, { useState, useEffect } from 'react';
import { 
  Mail, Phone, MessageCircle, MapPin, Clock, Send, Loader, CheckCircle, 
  AlertCircle, User, HelpCircle, Package, CreditCard, Truck, Shield,
  ChevronRight, X, Headphones, FileText, ExternalLink
} from 'lucide-react';

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

  const categories = [
    { value: 'order', label: 'Order Issues', icon: Package },
    { value: 'payment', label: 'Payment & Billing', icon: CreditCard },
    { value: 'shipping', label: 'Shipping & Delivery', icon: Truck },
    { value: 'product', label: 'Product Information', icon: HelpCircle },
    { value: 'account', label: 'Account & Login', icon: User },
    { value: 'returns', label: 'Returns & Refunds', icon: Shield },
    { value: 'technical', label: 'Technical Support', icon: Headphones },
    { value: 'other', label: 'Other', icon: MessageCircle }
  ];

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setValidationErrors(prev => ({ 
          ...prev, 
          attachment: 'File size must be less than 5MB' 
        }));
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setValidationErrors(prev => ({ 
          ...prev, 
          attachment: 'Only JPG, PNG, and PDF files are allowed' 
        }));
        return;
      }
      
      setFormData(prev => ({ ...prev, attachment: file }));
      setValidationErrors(prev => ({ ...prev, attachment: '' }));
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
      errors.category = 'Please select a category';
    }

    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      errors.message = 'Message is required';
    } else if (formData.message.trim().length < 20) {
      errors.message = 'Please provide more details (at least 20 characters)';
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

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      setSuccessMessage('Your message has been sent successfully! Our support team will get back to you within 24 hours.');
      
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

      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      console.error('Support submission error:', err);
      setValidationErrors({
        general: 'Failed to send your message. Please try again or contact us directly.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFAB = () => {
    setIsFABOpen(!isFABOpen);
  };

  return (
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
        {successMessage && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
            <button 
              onClick={() => setSuccessMessage('')}
              className="text-green-600 hover:text-green-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
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
                      Order Number (Optional)
                    </label>
                    <div className="relative">
                      <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="orderNumber"
                        name="orderNumber"
                        type="text"
                        value={formData.orderNumber}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="ORD-12345"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                          className={`p-3 border-2 rounded-lg text-left transition-all ${
                            formData.category === cat.value
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className={`w-5 h-5 mb-1 ${
                            formData.category === cat.value ? 'text-blue-600' : 'text-gray-400'
                          }`} />
                          <div className="text-xs font-medium text-gray-900">{cat.label}</div>
                        </button>
                      );
                    })}
                  </div>
                  {validationErrors.category && (
                    <p className="mt-2 text-xs text-red-600">{validationErrors.category}</p>
                  )}
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
                  <div className="flex items-center space-x-4">
                    <label className="flex-1 cursor-pointer">
                      <div className={`border-2 border-dashed ${
                        validationErrors.attachment ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg p-4 text-center hover:border-blue-400 transition-colors`}>
                        <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {formData.attachment ? formData.attachment.name : 'Click to upload (Max 5MB)'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG, or PDF</p>
                      </div>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="hidden"
                      />
                    </label>
                    {formData.attachment && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, attachment: null }))}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  {validationErrors.attachment && (
                    <p className="mt-1 text-xs text-red-600">{validationErrors.attachment}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
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
              <a
                href="mailto:support@oshocks.co.ke"
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Mail className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">Email Us</span>
              </a>
              <a
                href="https://wa.me/254712345678"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">WhatsApp</span>
              </a>
              <a
                href="tel:+254712345678"
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Phone className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">Call Us</span>
              </a>
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
                  <a
                    href="tel:+254712345678"
                    className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Call Us Now</p>
                      <p className="text-xs text-gray-600">+254 712 345 678</p>
                    </div>
                  </a>

                  <a
                    href="https://wa.me/254712345678"
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

            {isFABOpen && (
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
    </div>
  );
};

export default ContactSupportPage;