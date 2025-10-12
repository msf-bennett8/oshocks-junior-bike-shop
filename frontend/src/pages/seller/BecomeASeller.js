import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Store, TrendingUp, DollarSign, Users, Package, BarChart3,
  CheckCircle, X, Upload, FileText, Building, MapPin, Phone,
  Mail, User, CreditCard, AlertCircle, Loader, Shield, Award,
  Truck, MessageSquare, Clock, Zap, Globe, Percent, Lock,
  ArrowRight, Check, PlayCircle, Star, ShoppingBag, Target,
  PieChart, Calendar, Download, ExternalLink, Eye, ChevronDown,
  ChevronUp, Info, HelpCircle, Image as ImageIcon, Camera
} from 'lucide-react';

const BecomeASeller = () => {
  const navigate = useNavigate();
  
  // Form steps
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Business Information
    businessName: '',
    businessType: 'individual',
    businessRegNumber: '',
    taxIdNumber: '',
    businessCategory: '',
    businessDescription: '',
    
    // Step 2: Contact & Location
    contactPerson: '',
    email: '',
    phone: '',
    alternatePhone: '',
    country: 'Kenya',
    city: '',
    address: '',
    postalCode: '',
    
    // Step 3: Bank & Payment
    bankName: '',
    accountNumber: '',
    accountName: '',
    mpesaNumber: '',
    mpesaName: '',
    preferredPaymentMethod: 'mpesa',
    
    // Step 4: Documents & Verification
    nationalId: null,
    businessLicense: null,
    taxCertificate: null,
    proofOfAddress: null,
    
    // Terms
    agreeToTerms: false,
    agreeToCommission: false,
    subscribeUpdates: true
  });

  // Validation errors
  const [errors, setErrors] = useState({});
  
  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [activeTab, setActiveTab] = useState('benefits');

  // File previews
  const [filePreviews, setFilePreviews] = useState({
    nationalId: null,
    businessLicense: null,
    taxCertificate: null,
    proofOfAddress: null
  });

  // Benefits data
  const benefits = [
    {
      icon: Users,
      title: 'Reach Thousands of Customers',
      description: 'Access Kenya\'s largest cycling community with over 50,000+ active buyers',
      color: 'blue'
    },
    {
      icon: TrendingUp,
      title: 'Boost Your Sales',
      description: 'Our sellers see an average 300% increase in monthly sales within 6 months',
      color: 'green'
    },
    {
      icon: DollarSign,
      title: 'Low Commission Rates',
      description: 'Only 8-12% commission on sales - one of the lowest in the market',
      color: 'yellow'
    },
    {
      icon: Package,
      title: 'Easy Inventory Management',
      description: 'Powerful dashboard to manage products, orders, and inventory in real-time',
      color: 'purple'
    },
    {
      icon: Truck,
      title: 'Flexible Fulfillment',
      description: 'Choose your own delivery partners or use our recommended logistics network',
      color: 'orange'
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Get paid directly via M-Pesa or bank transfer within 3-5 business days',
      color: 'red'
    }
  ];

  // Statistics
  const stats = [
    { value: '10,000+', label: 'Active Sellers', icon: Store },
    { value: '50,000+', label: 'Monthly Buyers', icon: Users },
    { value: 'KSh 2M+', label: 'Average Monthly Sales', icon: DollarSign },
    { value: '4.8/5', label: 'Seller Satisfaction', icon: Star }
  ];

  // How it works
  const howItWorks = [
    {
      step: 1,
      title: 'Register Your Business',
      description: 'Fill out our simple application form with your business details',
      icon: FileText
    },
    {
      step: 2,
      title: 'Verification Process',
      description: 'We verify your documents within 24-48 hours',
      icon: Shield
    },
    {
      step: 3,
      title: 'Set Up Your Store',
      description: 'Create your seller profile and start listing products',
      icon: Store
    },
    {
      step: 4,
      title: 'Start Selling',
      description: 'Receive orders, fulfill them, and get paid automatically',
      icon: TrendingUp
    }
  ];

  // Commission structure
  const commissionTiers = [
    { category: 'Complete Bicycles', commission: '12%', volume: 'All sales' },
    { category: 'Bicycle Parts & Components', commission: '10%', volume: 'All sales' },
    { category: 'Accessories & Gear', commission: '8%', volume: 'All sales' },
    { category: 'High-Volume Sellers', commission: '6-8%', volume: '100+ orders/month' }
  ];

  // FAQs
  const faqs = [
    {
      question: 'How much does it cost to become a seller?',
      answer: 'Registration is completely free! We only charge a small commission on successful sales. There are no monthly fees, listing fees, or hidden charges.'
    },
    {
      question: 'When and how do I get paid?',
      answer: 'Payments are processed within 3-5 business days after successful order delivery. You can receive payments via M-Pesa or direct bank transfer to your registered account.'
    },
    {
      question: 'What documents do I need to register?',
      answer: 'For individual sellers: National ID and proof of address. For registered businesses: Business registration certificate, KRA PIN certificate, and director\'s ID. Tax compliance certificate is recommended but not mandatory.'
    },
    {
      question: 'Can I sell used or second-hand bicycles?',
      answer: 'Yes! You can sell both new and used cycling products. However, all used items must be accurately described with clear photos showing their condition.'
    },
    {
      question: 'Who handles shipping and delivery?',
      answer: 'You are responsible for shipping your products. However, we provide recommendations for reliable logistics partners across Kenya and offer discounted shipping rates for our sellers.'
    },
    {
      question: 'How do I handle returns and refunds?',
      answer: 'You set your own return policy within our marketplace guidelines. The platform provides tools to manage returns efficiently, and we mediate disputes to ensure fair outcomes.'
    },
    {
      question: 'Is there a minimum number of products I need to list?',
      answer: 'No minimum required! Start with as few products as you like and scale at your own pace. However, we recommend listing at least 5-10 products for better visibility.'
    },
    {
      question: 'How long does verification take?',
      answer: 'Most applications are verified within 24-48 hours. If additional information is needed, our team will contact you directly via email or phone.'
    }
  ];

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle file upload
  const handleFileUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: 'Please upload a valid image (JPG, PNG) or PDF file'
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: 'File size must be less than 5MB'
      }));
      return;
    }

    // Set file
    setFormData(prev => ({ ...prev, [fieldName]: file }));

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews(prev => ({ ...prev, [fieldName]: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreviews(prev => ({ ...prev, [fieldName]: 'pdf' }));
    }

    // Clear error
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  // Remove file
  const removeFile = (fieldName) => {
    setFormData(prev => ({ ...prev, [fieldName]: null }));
    setFilePreviews(prev => ({ ...prev, [fieldName]: null }));
  };

  // Validate step
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.businessName.trim()) {
        newErrors.businessName = 'Business name is required';
      }
      if (!formData.businessCategory) {
        newErrors.businessCategory = 'Please select a business category';
      }
      if (formData.businessType === 'company' && !formData.businessRegNumber.trim()) {
        newErrors.businessRegNumber = 'Business registration number is required for companies';
      }
      if (!formData.businessDescription.trim()) {
        newErrors.businessDescription = 'Business description is required';
      } else if (formData.businessDescription.trim().length < 50) {
        newErrors.businessDescription = 'Description must be at least 50 characters';
      }
    }

    if (step === 2) {
      if (!formData.contactPerson.trim()) {
        newErrors.contactPerson = 'Contact person name is required';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email address';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^(\+254|0)[17]\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Invalid Kenyan phone number';
      }
      if (!formData.city.trim()) {
        newErrors.city = 'City is required';
      }
      if (!formData.address.trim()) {
        newErrors.address = 'Business address is required';
      }
    }

    if (step === 3) {
      if (formData.preferredPaymentMethod === 'bank') {
        if (!formData.bankName.trim()) {
          newErrors.bankName = 'Bank name is required';
        }
        if (!formData.accountNumber.trim()) {
          newErrors.accountNumber = 'Account number is required';
        }
        if (!formData.accountName.trim()) {
          newErrors.accountName = 'Account name is required';
        }
      } else if (formData.preferredPaymentMethod === 'mpesa') {
        if (!formData.mpesaNumber.trim()) {
          newErrors.mpesaNumber = 'M-Pesa number is required';
        } else if (!/^(\+254|0)[17]\d{8}$/.test(formData.mpesaNumber.replace(/\s/g, ''))) {
          newErrors.mpesaNumber = 'Invalid M-Pesa number';
        }
        if (!formData.mpesaName.trim()) {
          newErrors.mpesaName = 'M-Pesa account name is required';
        }
      }
    }

    if (step === 4) {
      if (!formData.nationalId) {
        newErrors.nationalId = 'National ID/Passport copy is required';
      }
      if (formData.businessType === 'company' && !formData.businessLicense) {
        newErrors.businessLicense = 'Business license is required for companies';
      }
      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = 'You must agree to the terms and conditions';
      }
      if (!formData.agreeToCommission) {
        newErrors.agreeToCommission = 'You must agree to the commission structure';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });

      // API call to submit seller application
      // await axios.post('/api/seller/apply', submitData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      setShowSuccessModal(true);
    } catch (err) {
      console.error('Application submission error:', err);
      setErrors({
        general: err.response?.data?.message || 'Failed to submit application. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle FAQ
  const toggleFAQ = (index) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  // Render progress bar
  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center flex-1">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
              step < currentStep ? 'bg-green-600 text-white' :
              step === currentStep ? 'bg-blue-600 text-white' :
              'bg-gray-200 text-gray-600'
            }`}>
              {step < currentStep ? <Check className="w-6 h-6" /> : step}
            </div>
            {step < 4 && (
              <div className={`flex-1 h-1 mx-2 ${
                step < currentStep ? 'bg-green-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-600 mt-2">
        <span className={currentStep === 1 ? 'font-semibold text-blue-600' : ''}>Business Info</span>
        <span className={currentStep === 2 ? 'font-semibold text-blue-600' : ''}>Contact</span>
        <span className={currentStep === 3 ? 'font-semibold text-blue-600' : ''}>Payment</span>
        <span className={currentStep === 4 ? 'font-semibold text-blue-600' : ''}>Verification</span>
      </div>
    </div>
  );

  // Success Modal
  if (showSuccessModal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for applying to become a seller on Oshocks Junior Bike Shop. We'll review your application and get back to you within 24-48 hours.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>What's Next?</strong><br />
              Check your email for application confirmation and next steps. Our team will contact you if additional information is needed.
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/seller-dashboard')}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Go to Seller Dashboard
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-6">
              <Store className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Start Selling on Oshocks
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Join Kenya's premier cycling marketplace and reach thousands of customers nationwide. 
              Free registration, low commissions, secure payments.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="#application-form"
                className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-bold text-lg shadow-lg"
              >
                Apply Now - It's Free
              </a>
              <a
                href="#how-it-works"
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-all font-bold text-lg"
              >
                Learn How It Works
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <Icon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'benefits', label: 'Benefits' },
              { id: 'how-it-works', label: 'How It Works' },
              { id: 'pricing', label: 'Pricing' },
              { id: 'faq', label: 'FAQ' },
              { id: 'application-form', label: 'Apply Now' }
            ].map((tab) => (
              <a
                key={tab.id}
                href={`#${tab.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(tab.id);
                  document.getElementById(tab.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`py-4 px-2 border-b-2 font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Benefits Section */}
        <section id="benefits" className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Sell on Oshocks?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join thousands of successful sellers who trust Oshocks to grow their cycling business
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              const colors = {
                blue: 'bg-blue-100 text-blue-600',
                green: 'bg-green-100 text-green-600',
                yellow: 'bg-yellow-100 text-yellow-600',
                purple: 'bg-purple-100 text-purple-600',
                orange: 'bg-orange-100 text-orange-600',
                red: 'bg-red-100 text-red-600'
              };
              return (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className={`w-12 h-12 rounded-lg ${colors[benefit.color]} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Getting started is easy. Follow these simple steps to begin your seller journey
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="text-center">
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white">
                      <Icon className="w-10 h-10" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="mb-16">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Transparent Pricing</h2>
              <p className="text-gray-600">
                No hidden fees. Only pay when you make a sale.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="border-2 border-blue-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">What's Free</h3>
                <ul className="space-y-3">
                  {[
                    'Account registration',
                    'Unlimited product listings',
                    'Seller dashboard access',
                    'Basic analytics & reports',
                    'Customer support',
                    'Marketing tools'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-2 border-purple-200 rounded-lg p-6 bg-gradient-to-br from-purple-50 to-blue-50">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Commission Rates</h3>
                <div className="space-y-4">
                  {commissionTiers.map((tier, index) => (
                    <div key={index} className="flex items-center justify-between pb-3 border-b border-gray-200 last:border-0">
                      <div>
                        <p className="font-semibold text-gray-900">{tier.category}</p>
                        <p className="text-xs text-gray-600">{tier.volume}</p>
                      </div>
                      <span className="text-lg font-bold text-blue-600">{tier.commission}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <Zap className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Volume Discounts Available</h4>
                  <p className="text-sm text-gray-700">
                    High-performing sellers with 100+ monthly orders qualify for reduced commission rates starting at 6%. 
                    The more you sell, the less you pay!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">
              Everything you need to know about selling on Oshocks
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 text-left">{faq.question}</span>
                  {expandedFAQ === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  )}
                </button>
                {expandedFAQ === index && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Application Form Section */}
        <section id="application-form" className="mb-16">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Seller Application Form</h2>
              <p className="text-gray-600">
                Complete the form below to start your journey as an Oshocks seller
              </p>
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{errors.general}</p>
              </div>
            )}

            {/* Progress Bar */}
            {renderProgressBar()}

            {/* Step 1: Business Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Business Information</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, businessType: 'individual' }))}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        formData.businessType === 'individual'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <User className="w-6 h-6 text-blue-600 mb-2" />
                      <div className="font-semibold text-gray-900">Individual Seller</div>
                      <div className="text-xs text-gray-600 mt-1">Sole proprietor or personal business</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, businessType: 'company' }))}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        formData.businessType === 'company'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Building className="w-6 h-6 text-blue-600 mb-2" />
                      <div className="font-semibold text-gray-900">Registered Company</div>
                      <div className="text-xs text-gray-600 mt-1">Limited company or partnership</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.businessName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your business or store name"
                  />
                  {errors.businessName && (
                    <p className="mt-1 text-xs text-red-600">{errors.businessName}</p>
                  )}
                </div>

                {formData.businessType === 'company' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Registration Number *
                      </label>
                      <input
                        type="text"
                        name="businessRegNumber"
                        value={formData.businessRegNumber}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.businessRegNumber ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="e.g., PVT-XXXXXX"
                      />
                      {errors.businessRegNumber && (
                        <p className="mt-1 text-xs text-red-600">{errors.businessRegNumber}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        KRA PIN Number
                      </label>
                      <input
                        type="text"
                        name="taxIdNumber"
                        value={formData.taxIdNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., AXXXXXXXXX"
                      />
                      <p className="mt-1 text-xs text-gray-500">Optional but recommended</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Category *
                  </label>
                  <select
                    name="businessCategory"
                    value={formData.businessCategory}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.businessCategory ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select your primary product category</option>
                    <option value="complete-bicycles">Complete Bicycles</option>
                    <option value="bicycle-parts">Bicycle Parts & Components</option>
                    <option value="accessories">Cycling Accessories</option>
                    <option value="apparel">Cycling Apparel & Gear</option>
                    <option value="electronics">Cycling Electronics</option>
                    <option value="maintenance">Maintenance & Tools</option>
                    <option value="multiple">Multiple Categories</option>
                  </select>
                  {errors.businessCategory && (
                    <p className="mt-1 text-xs text-red-600">{errors.businessCategory}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Description *
                  </label>
                  <textarea
                    name="businessDescription"
                    value={formData.businessDescription}
                    onChange={handleInputChange}
                    rows="5"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.businessDescription ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Tell us about your business, the products you sell, and what makes your store unique..."
                  />
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">Minimum 50 characters</p>
                    <p className="text-xs text-gray-500">
                      {formData.businessDescription.length} characters
                    </p>
                  </div>
                  {errors.businessDescription && (
                    <p className="mt-1 text-xs text-red-600">{errors.businessDescription}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleNextStep}
                    className="flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Contact & Location */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Contact & Location Information</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.contactPerson ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Full name of primary contact"
                  />
                  {errors.contactPerson && (
                    <p className="mt-1 text-xs text-red-600">{errors.contactPerson}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="your@email.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.phone ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="+254 712 345 678"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alternate Phone Number
                  </label>
                  <input
                    type="tel"
                    name="alternatePhone"
                    value={formData.alternatePhone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+254 700 000 000"
                  />
                  <p className="mt-1 text-xs text-gray-500">Optional</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value="Kenya"
                      disabled
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.city ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select city</option>
                      <option value="Nairobi">Nairobi</option>
                      <option value="Mombasa">Mombasa</option>
                      <option value="Kisumu">Kisumu</option>
                      <option value="Nakuru">Nakuru</option>
                      <option value="Eldoret">Eldoret</option>
                      <option value="Thika">Thika</option>
                      <option value="Malindi">Malindi</option>
                      <option value="Kitale">Kitale</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.city && (
                      <p className="mt-1 text-xs text-red-600">{errors.city}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.address ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Street address, building, floor"
                  />
                  {errors.address && (
                    <p className="mt-1 text-xs text-red-600">{errors.address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 00100"
                  />
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={handlePrevStep}
                    className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                  >
                    <ArrowRight className="w-5 h-5 rotate-180" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Bank & Payment */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Payment Information</h3>
                  <p className="text-gray-600">Choose how you'd like to receive payments for your sales</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Preferred Payment Method *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, preferredPaymentMethod: 'mpesa' }))}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        formData.preferredPaymentMethod === 'mpesa'
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Phone className="w-6 h-6 text-green-600 mb-2" />
                      <div className="font-semibold text-gray-900">M-Pesa</div>
                      <div className="text-xs text-gray-600 mt-1">Fast and convenient mobile payments</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, preferredPaymentMethod: 'bank' }))}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        formData.preferredPaymentMethod === 'bank'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <CreditCard className="w-6 h-6 text-blue-600 mb-2" />
                      <div className="font-semibold text-gray-900">Bank Transfer</div>
                      <div className="text-xs text-gray-600 mt-1">Direct deposit to your bank account</div>
                    </button>
                  </div>
                </div>

                {formData.preferredPaymentMethod === 'mpesa' && (
                  <div className="space-y-6 p-6 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        M-Pesa Number *
                      </label>
                      <input
                        type="tel"
                        name="mpesaNumber"
                        value={formData.mpesaNumber}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          errors.mpesaNumber ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="+254 712 345 678"
                      />
                      {errors.mpesaNumber && (
                        <p className="mt-1 text-xs text-red-600">{errors.mpesaNumber}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        M-Pesa Account Name *
                      </label>
                      <input
                        type="text"
                        name="mpesaName"
                        value={formData.mpesaName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          errors.mpesaName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Name as registered with M-Pesa"
                      />
                      {errors.mpesaName && (
                        <p className="mt-1 text-xs text-red-600">{errors.mpesaName}</p>
                      )}
                    </div>
                  </div>
                )}

                {formData.preferredPaymentMethod === 'bank' && (
                  <div className="space-y-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bank Name *
                      </label>
                      <select
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.bankName ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select your bank</option>
                        <option value="KCB">Kenya Commercial Bank (KCB)</option>
                        <option value="Equity">Equity Bank</option>
                        <option value="Cooperative">Co-operative Bank</option>
                        <option value="Absa">Absa Bank Kenya</option>
                        <option value="NCBA">NCBA Bank</option>
                        <option value="Stanbic">Stanbic Bank</option>
                        <option value="Standard Chartered">Standard Chartered</option>
                        <option value="DTB">Diamond Trust Bank (DTB)</option>
                        <option value="Family">Family Bank</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.bankName && (
                        <p className="mt-1 text-xs text-red-600">{errors.bankName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Number *
                      </label>
                      <input
                        type="text"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.accountNumber ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Your bank account number"
                      />
                      {errors.accountNumber && (
                        <p className="mt-1 text-xs text-red-600">{errors.accountNumber}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Name *
                      </label>
                      <input
                        type="text"
                        name="accountName"
                        value={formData.accountName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.accountName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Account holder name"
                      />
                      {errors.accountName && (
                        <p className="mt-1 text-xs text-red-600">{errors.accountName}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Lock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Secure Payment Processing</h4>
                      <p className="text-sm text-gray-700">
                        Your payment information is encrypted and secure. Payments are processed within 3-5 
                        business days after order delivery confirmation.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={handlePrevStep}
                    className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                  >
                    <ArrowRight className="w-5 h-5 rotate-180" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Documents & Verification */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Document Verification</h3>
                  <p className="text-gray-600">Upload the required documents to verify your identity and business</p>
                </div>

                {/* National ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    National ID / Passport Copy *
                  </label>
                  {!formData.nationalId ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Click to upload or drag and drop</span>
                      <span className="text-xs text-gray-500 mt-1">PNG, JPG or PDF (Max 5MB)</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload(e, 'nationalId')}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900">{formData.nationalId.name}</p>
                          <p className="text-xs text-gray-600">
                            {(formData.nationalId.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile('nationalId')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                  {errors.nationalId && (
                    <p className="mt-1 text-xs text-red-600">{errors.nationalId}</p>
                  )}
                </div>

                {/* Business License */}
                {formData.businessType === 'company' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Registration Certificate *
                    </label>
                    {!formData.businessLicense ? (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Click to upload or drag and drop</span>
                        <span className="text-xs text-gray-500 mt-1">PNG, JPG or PDF (Max 5MB)</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileUpload(e, 'businessLicense')}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                          <div>
                            <p className="font-medium text-gray-900">{formData.businessLicense.name}</p>
                            <p className="text-xs text-gray-600">
                              {(formData.businessLicense.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile('businessLicense')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                    {errors.businessLicense && (
                      <p className="mt-1 text-xs text-red-600">{errors.businessLicense}</p>
                    )}
                  </div>
                )}

                {/* Tax Certificate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    KRA Tax Certificate
                    <span className="text-gray-500 font-normal ml-2">(Optional)</span>
                  </label>
                  {!formData.taxCertificate ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Click to upload or drag and drop</span>
                      <span className="text-xs text-gray-500 mt-1">PNG, JPG or PDF (Max 5MB)</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload(e, 'taxCertificate')}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900">{formData.taxCertificate.name}</p>
                          <p className="text-xs text-gray-600">
                            {(formData.taxCertificate.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile('taxCertificate')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Proof of Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proof of Address
                    <span className="text-gray-500 font-normal ml-2">(Optional)</span>
                  </label>
                  {!formData.proofOfAddress ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Utility bill, lease agreement, or bank statement</span>
                      <span className="text-xs text-gray-500 mt-1">PNG, JPG or PDF (Max 5MB)</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload(e, 'proofOfAddress')}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900">{formData.proofOfAddress.name}</p>
                          <p className="text-xs text-gray-600">
                            {(formData.proofOfAddress.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile('proofOfAddress')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Terms & Conditions */}
                <div className="space-y-4 pt-6 border-t border-gray-200">
                  <div className="flex items-start">
                    <input
                      id="agreeToTerms"
                      name="agreeToTerms"
                      type="checkbox"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      className={`h-4 w-4 mt-1 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer ${
                        errors.agreeToTerms ? 'border-red-300' : ''
                      }`}
                    />
                    <label htmlFor="agreeToTerms" className="ml-3 block text-sm text-gray-700 cursor-pointer">
                      I agree to the{' '}
                      <Link to="/seller-terms" className="text-blue-600 hover:text-blue-700 font-medium">
                        Seller Terms & Conditions
                      </Link>
                      {' '}and{' '}
                      <Link to="/privacy-policy" className="text-blue-600 hover:text-blue-700 font-medium">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                  {errors.agreeToTerms && (
                    <p className="ml-7 text-xs text-red-600">{errors.agreeToTerms}</p>
                  )}

                  <div className="flex items-start">
                    <input
                      id="agreeToCommission"
                      name="agreeToCommission"
                      type="checkbox"
                      checked={formData.agreeToCommission}
                      onChange={handleInputChange}
                      className={`h-4 w-4 mt-1 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer ${
                        errors.agreeToCommission ? 'border-red-300' : ''
                      }`}
                    />
                    <label htmlFor="agreeToCommission" className="ml-3 block text-sm text-gray-700 cursor-pointer">
                      I understand and agree to the commission structure (8-12% per sale)
                    </label>
                  </div>
                  {errors.agreeToCommission && (
                    <p className="ml-7 text-xs text-red-600">{errors.agreeToCommission}</p>
                  )}

                  <div className="flex items-start">
                    <input
                      id="subscribeUpdates"
                      name="subscribeUpdates"
                      type="checkbox"
                      checked={formData.subscribeUpdates}
                      onChange={handleInputChange}
                      className="h-4 w-4 mt-1 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                    />
                    <label htmlFor="subscribeUpdates" className="ml-3 block text-sm text-gray-700 cursor-pointer">
                      Send me seller tips, product trends, and promotional opportunities
                    </label>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={handlePrevStep}
                    className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                  >
                    <ArrowRight className="w-5 h-5 rotate-180" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Application</span>
                        <CheckCircle className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-xl p-8 text-white">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">What Our Sellers Say</h2>
              <p className="text-purple-100">Join thousands of successful sellers across Kenya</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: 'James Mwangi',
                  business: 'Nairobi Cycles',
                  rating: 5,
                  comment: 'Oshocks transformed my business. I went from selling 5 bikes a month to over 50!'
                },
                {
                  name: 'Mary Wanjiku',
                  business: 'Cycling Gear Kenya',
                  rating: 5,
                  comment: 'The platform is easy to use and customer support is excellent. Highly recommend!'
                },
                {
                  name: 'David Omondi',
                  business: 'Bike Parts Pro',
                  rating: 5,
                  comment: 'Quick payments, great visibility, and amazing support. Best marketplace in Kenya!'
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-white bg-opacity-20 rounded-lg p-6 backdrop-blur-sm">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-white mb-4 italic">"{testimonial.comment}"</p>
                  <div>
                    <p className="font-bold text-white">{testimonial.name}</p>
                    <p className="text-purple-200 text-sm">{testimonial.business}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Support CTA */}
        <section className="text-center">
          <div className="bg-white rounded-lg shadow-md p-8">
            <MessageSquare className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Need Help?</h3>
            <p className="text-gray-600 mb-6">
              Our seller support team is here to help you succeed. Get in touch with any questions.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/seller-support"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Contact Seller Support
              </Link>
              <Link
                to="/seller-resources"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                View Seller Resources
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Note */}
      <div className="bg-gray-100 border-t border-gray-200 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-600">
            By submitting this application, you agree to comply with Oshocks marketplace policies and guidelines.
            Your application will be reviewed within 24-48 hours.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BecomeASeller;