import React, { useState } from 'react';
import { Store, TrendingUp, X, Users, Package, Shield, CreditCard, Truck, BarChart3, Headphones, Zap, CheckCircle, ArrowRight, Mail, Phone, MapPin, Clock, Award, Target, DollarSign, Globe, Briefcase, MessageSquare, FileText, Star, Heart, ThumbsUp } from 'lucide-react';

const PartnerWithUsPage = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    location: '',
    businessType: '',
    productsCount: '',
    monthlyRevenue: '',
    experience: '',
    website: '',
    description: ''
  });

  const [activeTab, setActiveTab] = useState('benefits');
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus('loading');
    
    try {
      const response = await fetch('/api/seller-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        
        // Send confirmation email
        await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: formData.email,
            subject: 'Seller Application Received - Oshocks Junior',
            template: 'seller-application-confirmation',
            data: {
              name: formData.ownerName,
              businessName: formData.businessName
            }
          }),
        });

        setTimeout(() => {
          setSubmitStatus(null);
          setFormData({
            businessName: '',
            ownerName: '',
            email: '',
            phone: '',
            location: '',
            businessType: '',
            productsCount: '',
            monthlyRevenue: '',
            experience: '',
            website: '',
            description: ''
          });
        }, 5000);
      } else {
        setSubmitStatus('error');
        setTimeout(() => setSubmitStatus(null), 5000);
      }
    } catch (error) {
      console.error('Application submission error:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus(null), 5000);
    }
  };

  const benefits = [
    {
      icon: Users,
      title: 'Access to Thousands of Customers',
      description: 'Reach cycling enthusiasts across Kenya through our growing marketplace with active buyers looking for quality products.',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: TrendingUp,
      title: 'Grow Your Business',
      description: 'Expand beyond your local market with our nationwide delivery network and online presence.',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable Platform',
      description: 'Built with enterprise-grade security to protect your business data and customer transactions.',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: CreditCard,
      title: 'Multiple Payment Options',
      description: 'Accept M-Pesa and card payments seamlessly with instant settlement to your account.',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Track your sales, monitor inventory, and gain insights with comprehensive dashboard analytics.',
      color: 'bg-indigo-100 text-indigo-600'
    },
    {
      icon: Headphones,
      title: '24/7 Seller Support',
      description: 'Dedicated support team to help you succeed with technical assistance and business guidance.',
      color: 'bg-pink-100 text-pink-600'
    }
  ];

  const features = [
    {
      icon: Package,
      title: 'Easy Product Management',
      description: 'Intuitive dashboard to list, edit, and manage your entire product catalog with bulk upload capabilities.'
    },
    {
      icon: Truck,
      title: 'Flexible Fulfillment',
      description: 'Choose your preferred fulfillment method - handle shipping yourself or use our logistics partners.'
    },
    {
      icon: Zap,
      title: 'Quick Setup',
      description: 'Get your store up and running in minutes with our streamlined onboarding process.'
    },
    {
      icon: Target,
      title: 'Marketing Tools',
      description: 'Promote your products with built-in promotional tools, featured listings, and discount capabilities.'
    },
    {
      icon: Globe,
      title: 'Multi-Channel Integration',
      description: 'Sync your inventory across multiple platforms and manage everything from one dashboard.'
    },
    {
      icon: Award,
      title: 'Seller Ratings & Reviews',
      description: 'Build trust and credibility with customer reviews and seller performance ratings.'
    }
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Apply to Join',
      description: 'Fill out our simple application form with your business details and product information.',
      icon: FileText
    },
    {
      step: '02',
      title: 'Verification Process',
      description: 'Our team reviews your application and verifies your business credentials (usually within 24-48 hours).',
      icon: Shield
    },
    {
      step: '03',
      title: 'Setup Your Store',
      description: 'Once approved, set up your seller profile, upload products, and configure your preferences.',
      icon: Store
    },
    {
      step: '04',
      title: 'Start Selling',
      description: 'Go live and start receiving orders from customers across Kenya. We handle payments and you fulfill orders.',
      icon: TrendingUp
    }
  ];

  const testimonials = [
    {
      name: 'James Mwangi',
      business: 'Nairobi Bike Center',
      image: '👨‍💼',
      rating: 5,
      text: 'Joining Oshocks Junior has tripled our online sales. The platform is easy to use and the support team is always helpful. Best decision we made for our business!'
    },
    {
      name: 'Sarah Wanjiku',
      business: 'Rift Valley Cycles',
      image: '👩‍💼',
      rating: 5,
      text: 'As a small bike shop in Nakuru, we struggled to reach customers beyond our town. This marketplace opened up opportunities we never imagined. Highly recommend!'
    },
    {
      name: 'David Omondi',
      business: 'Coast Cycling Accessories',
      image: '👨‍💼',
      rating: 5,
      text: 'The analytics dashboard helps us understand our customers better and make smart inventory decisions. Sales have grown 200% in just 3 months.'
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: 'Free',
      period: 'Forever',
      description: 'Perfect for small sellers just getting started',
      features: [
        'Up to 50 product listings',
        '5% commission per sale',
        'Basic analytics',
        'Email support',
        'Standard listing visibility',
        'Payment processing'
      ],
      highlighted: false,
      buttonText: 'Get Started',
      color: 'border-gray-300'
    },
    {
      name: 'Professional',
      price: 'KES 2,999',
      period: '/month',
      description: 'For established sellers ready to scale',
      features: [
        'Unlimited product listings',
        '3% commission per sale',
        'Advanced analytics & reports',
        'Priority support',
        'Featured store placement',
        'Promotional tools',
        'Bulk upload capabilities',
        'Custom branding options'
      ],
      highlighted: true,
      buttonText: 'Start Free Trial',
      color: 'border-blue-600'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'Contact Us',
      description: 'Tailored solutions for large businesses',
      features: [
        'Everything in Professional',
        '2% commission per sale',
        'Dedicated account manager',
        'API integration',
        'White-label options',
        'Custom payment terms',
        'Priority fulfillment',
        'Custom reporting'
      ],
      highlighted: false,
      buttonText: 'Contact Sales',
      color: 'border-purple-600'
    }
  ];

  const faqs = [
    {
      question: 'How much does it cost to sell on Oshocks Junior?',
      answer: 'We offer flexible pricing with a free starter plan. You can begin selling with no upfront costs and only pay a small commission on successful sales. Premium plans are available for sellers who want additional features and lower commission rates.'
    },
    {
      question: 'How long does the approval process take?',
      answer: 'Our verification process typically takes 24-48 hours. We review your application to ensure quality standards and verify business credentials. You\'ll receive an email notification once your application is approved.'
    },
    {
      question: 'What types of products can I sell?',
      answer: 'We accept all cycling-related products including bicycles, accessories, spare parts, protective gear, clothing, and maintenance tools. Products must be genuine, in good condition, and comply with Kenyan regulations.'
    },
    {
      question: 'How do I receive payments?',
      answer: 'Payments are processed automatically when customers complete their orders. Funds are transferred to your registered M-Pesa or bank account within 3-5 business days after order confirmation. You can track all transactions in your seller dashboard.'
    },
    {
      question: 'Do I need to handle shipping myself?',
      answer: 'You have flexibility in fulfillment. You can handle shipping yourself, use our recommended logistics partners, or combine both methods. We provide shipping labels and tracking integration to make the process seamless.'
    },
    {
      question: 'What support do you provide to sellers?',
      answer: 'We offer comprehensive seller support including onboarding assistance, technical help, business guidance, and marketing tips. Our support team is available via email, phone, and live chat to help you succeed.'
    }
  ];

  const stats = [
    { icon: Users, value: '10,000+', label: 'Active Customers' },
    { icon: Store, value: '250+', label: 'Seller Partners' },
    { icon: Package, value: '50,000+', label: 'Products Listed' },
    { icon: TrendingUp, value: '95%', label: 'Seller Satisfaction' }
  ];

  const scrollToApplication = (e) => {
    e.preventDefault();
    const element = document.getElementById('application');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToHowItWorks = (e) => {
    e.preventDefault();
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full mb-6">
              <Store className="w-5 h-5" />
              <span className="text-sm font-medium">Grow Your Cycling Business</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Partner With Kenya's
              <br />
              <span className="text-yellow-300">Premier Cycling Marketplace</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Join hundreds of successful sellers reaching thousands of cycling enthusiasts across Kenya. 
              Start selling in minutes with zero upfront costs.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="#application"
                onClick={scrollToApplication}
                className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center gap-2"
              >
                Start Selling Today
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#how-it-works"
                onClick={scrollToHowItWorks}
                className="px-8 py-4 bg-white bg-opacity-20 rounded-lg font-semibold hover:bg-opacity-30 transition-colors"
              >
                Learn How It Works
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center p-6 bg-white bg-opacity-10 rounded-lg backdrop-blur-sm">
                  <Icon className="w-10 h-10 mx-auto mb-3" />
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-blue-100 text-sm">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Why Partner Section */}
      <div className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Sell on Oshocks Junior?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide everything you need to succeed in the online cycling marketplace
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow p-8">
                  <div className={`w-16 h-16 ${benefit.color} rounded-lg flex items-center justify-center mb-6`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="bg-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Start selling in 4 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute top-0 right-0 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold text-gray-900">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Seller Features
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to manage and grow your online store
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Flexible Pricing Plans
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your business needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl border-2 ${plan.color} p-8 ${
                  plan.highlighted ? 'shadow-2xl transform scale-105' : 'shadow-sm'
                }`}
              >
                {plan.highlighted && (
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-full inline-block mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <button
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.buttonText}
                </button>
                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Sellers Say
            </h2>
            <p className="text-xl text-gray-600">
              Join successful sellers who trust Oshocks Junior
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-8">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{testimonial.image}</div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.business}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Application Form Section */}
      <div id="application" className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Apply to Become a Seller
            </h2>
            <p className="text-xl text-gray-600">
              Fill out the form below and we'll get back to you within 24-48 hours
            </p>
          </div>

          {submitStatus === 'success' ? (
            <div className="bg-green-50 border-2 border-green-600 rounded-xl p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
              <p className="text-gray-600 mb-6">
                Thank you for your interest in partnering with us. Our team will review your application and get back to you within 24-48 hours.
              </p>
              <button
                onClick={() => setSubmitStatus(null)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Submit Another Application
              </button>
            </div>
          ) : submitStatus === 'error' ? (
            <div className="bg-red-50 border-2 border-red-600 rounded-xl p-12 text-center">
              <X className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Submission Failed</h3>
              <p className="text-gray-600 mb-6">
                We encountered an error while submitting your application. Please try again or contact us directly.
              </p>
              <button
                onClick={() => setSubmitStatus(null)}
                className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-8">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your Bike Shop"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Owner Name *
                  </label>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+254 700 000 000"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Business Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nairobi, Kenya"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Business Type *
                  </label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select type</option>
                    <option value="retail">Retail Shop</option>
                    <option value="wholesale">Wholesale Distributor</option>
                    <option value="manufacturer">Manufacturer</option>
                    <option value="individual">Individual Seller</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Expected Products Count *
                  </label>
                  <select
                    name="productsCount"
                    value={formData.productsCount}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select range</option>
                    <option value="1-50">1-50 products</option>
                    <option value="51-200">51-200 products</option>
                    <option value="201-500">201-500 products</option>
                    <option value="500+">500+ products</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Monthly Revenue (Optional)
                  </label>
                  <select
                    name="monthlyRevenue"
                    value={formData.monthlyRevenue}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select range</option>
                    <option value="0-100k">Less than KES 100,000</option>
                    <option value="100k-500k">KES 100,000 - 500,000</option>
                    <option value="500k-1m">KES 500,000 - 1,000,000</option>
                    <option value="1m+">Over KES 1,000,000</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Years in Business *
                  </label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select experience</option>
                    <option value="0-1">Less than 1 year</option>
                    <option value="1-3">1-3 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5+">5+ years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Website (Optional)
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tell Us About Your Business *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your business, products, and why you'd like to partner with us..."
                ></textarea>
              </div>

              <div className="mb-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the <a href="/terms" className="text-blue-600 hover:underline">Terms and Conditions</a> and <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>. I understand that my application will be reviewed and I'll receive a response within 24-48 hours.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitStatus === 'loading'}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitStatus === 'loading' ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Submit Application
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Got questions? We've got answers
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="bg-white rounded-lg shadow-sm p-6 group"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  <ArrowRight className="w-5 h-5 text-gray-400 transform group-open:rotate-90 transition-transform flex-shrink-0" />
                </summary>
                <p className="text-gray-600 mt-4 leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              Contact Our Team
            </a>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h2>
            <p className="text-xl text-gray-600">
              Our team is here to help you get started
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone</h3>
              <p className="text-gray-600 mb-2">Call us Monday - Saturday</p>
              <a href="tel:+254700000000" className="text-blue-600 font-semibold hover:underline">
                +254 700 000 000
              </a>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600 mb-2">We'll respond within 24 hours</p>
              <a href="mailto:sellers@oshocksjunior.com" className="text-green-600 font-semibold hover:underline">
                sellers@oshocksjunior.com
              </a>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Visit Us</h3>
              <p className="text-gray-600 mb-2">Come see us in person</p>
              <p className="text-purple-600 font-semibold">
                Nairobi, Kenya
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Your Success Story?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join Kenya's fastest-growing cycling marketplace and reach thousands of customers nationwide. 
            No setup fees, no monthly minimums - just pure growth potential.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="#application"
              onClick={scrollToApplication}
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center gap-2"
            >
              Apply Now
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="/downloads/oshocks-seller-guide.pdf"
              download
              className="px-8 py-4 bg-white bg-opacity-20 rounded-lg font-semibold hover:bg-opacity-30 transition-colors inline-flex items-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Download Seller Guide
            </a>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <Shield className="w-10 h-10 mx-auto mb-3 text-blue-400" />
              <div className="text-sm font-semibold mb-1">Secure Platform</div>
              <div className="text-xs text-gray-400">Bank-level security</div>
            </div>
            <div>
              <Award className="w-10 h-10 mx-auto mb-3 text-green-400" />
              <div className="text-sm font-semibold mb-1">Trusted by 250+ Sellers</div>
              <div className="text-xs text-gray-400">Growing community</div>
            </div>
            <div>
              <ThumbsUp className="w-10 h-10 mx-auto mb-3 text-purple-400" />
              <div className="text-sm font-semibold mb-1">95% Satisfaction</div>
              <div className="text-xs text-gray-400">Happy sellers</div>
            </div>
            <div>
              <Headphones className="w-10 h-10 mx-auto mb-3 text-pink-400" />
              <div className="text-sm font-semibold mb-1">24/7 Support</div>
              <div className="text-xs text-gray-400">Always here to help</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Oshocks Junior</h3>
              <p className="text-sm mb-4">Kenya's premier cycling marketplace connecting sellers with thousands of cycling enthusiasts.</p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <span className="text-lg">f</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <span className="text-lg">𝕏</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <span className="text-lg">in</span>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">For Sellers</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/sell" className="hover:text-white transition-colors">Start Selling</a></li>
                <li><a href="/seller-dashboard" className="hover:text-white transition-colors">Seller Dashboard</a></li>
                <li><a href="/seller-resources" className="hover:text-white transition-colors">Resources</a></li>
                <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="/careers" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="/blog" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/help" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/seller-agreement" className="hover:text-white transition-colors">Seller Agreement</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© {new Date().getFullYear()} Oshocks Junior Bike Shop. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PartnerWithUsPage;