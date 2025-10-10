import { useState, useEffect } from 'react';
import { Clock, Bell, ArrowLeft, Home, CheckCircle, Sparkles, Zap, TrendingUp, Users, Package, Wrench, CreditCard, Truck, MessageSquare, Gift, Calendar, Mail, AlertCircle, ExternalLink, Star, Heart } from 'lucide-react';

const FeatureComingSoonPage = () => {
  const [email, setEmail] = useState('');
  const [notified, setNotified] = useState(false);
  const [loading, setLoading] = useState(false);

  // Feature details - can be passed as props in real implementation
  const featureData = {
    type: 'feature', // 'feature', 'product', 'service', 'category'
    name: 'Bike Rental Service',
    tagline: 'Rent Premium Bikes by the Hour or Day',
    description: 'Experience the freedom of cycling without the commitment. Our upcoming bike rental service will let you rent high-quality mountain bikes, road bikes, and city cruisers for your adventures across Nairobi and beyond.',
    icon: <Bike className="w-16 h-16" />,
    expectedLaunch: 'January 2026',
    status: 'In Development',
    progress: 65, // percentage
    image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800&q=80'
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleNotifyMe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setNotified(true);
      setLoading(false);
      
      // Track notification signup
      if (window.gtag) {
        window.gtag('event', 'feature_notification_signup', {
          feature_name: featureData.name
        });
      }
    }, 1500);
  };

  // Different feature types with their configurations
  const featureTypes = {
    feature: {
      title: 'New Feature',
      icon: <Sparkles className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      benefits: [
        { icon: <Zap className="w-5 h-5" />, text: 'Enhanced user experience' },
        { icon: <TrendingUp className="w-5 h-5" />, text: 'Improved efficiency' },
        { icon: <Users className="w-5 h-5" />, text: 'Better collaboration' }
      ]
    },
    product: {
      title: 'New Product',
      icon: <Package className="w-6 h-6" />,
      color: 'from-blue-500 to-indigo-500',
      benefits: [
        { icon: <Star className="w-5 h-5" />, text: 'Premium quality' },
        { icon: <Gift className="w-5 h-5" />, text: 'Special launch pricing' },
        { icon: <Truck className="w-5 h-5" />, text: 'Fast delivery' }
      ]
    },
    service: {
      title: 'New Service',
      icon: <Wrench className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500',
      benefits: [
        { icon: <Users className="w-5 h-5" />, text: 'Expert support' },
        { icon: <Clock className="w-5 h-5" />, text: 'Flexible scheduling' },
        { icon: <CheckCircle className="w-5 h-5" />, text: 'Quality guaranteed' }
      ]
    },
    category: {
      title: 'New Category',
      icon: <Package className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500',
      benefits: [
        { icon: <Package className="w-5 h-5" />, text: 'Wide selection' },
        { icon: <TrendingUp className="w-5 h-5" />, text: 'Competitive prices' },
        { icon: <Star className="w-5 h-5" />, text: 'Top brands' }
      ]
    }
  };

  const currentType = featureTypes[featureData.type] || featureTypes.feature;

  // What to expect section
  const expectations = [
    {
      icon: <Package className="w-6 h-6" />,
      title: 'Diverse Fleet',
      description: 'Choose from mountain bikes, road bikes, hybrid bikes, and e-bikes for every riding style.'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Flexible Duration',
      description: 'Rent by the hour, day, or week with transparent pricing and no hidden fees.'
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: 'Well-Maintained',
      description: 'All bikes are professionally serviced and inspected before every rental.'
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: 'Easy Booking',
      description: 'Reserve online, pay with M-Pesa or card, and pick up at your convenience.'
    },
    {
      icon: <Truck className="w-6 h-6" />,
      title: 'Delivery Option',
      description: 'Get your rental bike delivered to your location for an additional fee.'
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: '24/7 Support',
      description: 'Round-the-clock customer support for any issues during your rental period.'
    }
  ];

  // Development progress stages
  const progressStages = [
    { stage: 'Planning & Research', completed: true, percentage: 100 },
    { stage: 'Fleet Acquisition', completed: true, percentage: 100 },
    { stage: 'Platform Development', completed: false, percentage: 75 },
    { stage: 'Testing & Quality Assurance', completed: false, percentage: 40 },
    { stage: 'Launch Preparation', completed: false, percentage: 0 }
  ];

  // Alternative available features
  const availableNow = [
    {
      icon: <Package className="w-8 h-8" />,
      title: 'Buy New Bikes',
      description: 'Browse our extensive collection of brand new bicycles',
      link: '/shop/bikes',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <Wrench className="w-8 h-8" />,
      title: 'Repair Services',
      description: 'Get your bike serviced by our expert technicians',
      link: '/services/repair',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: <Package className="w-8 h-8" />,
      title: 'Accessories',
      description: 'Shop helmets, lights, locks, and more',
      link: '/shop/accessories',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  // FAQ Section
  const faqs = [
    {
      question: 'When will this service be available?',
      answer: `We're targeting ${featureData.expectedLaunch} for launch. Subscribe to get notified the moment we go live!`
    },
    {
      question: 'How much will it cost?',
      answer: 'Pricing will be competitive and transparent. We\'ll offer hourly, daily, and weekly rates with special discounts for extended rentals.'
    },
    {
      question: 'What areas will you serve?',
      answer: 'We\'re launching in Nairobi first, with plans to expand to Mombasa, Kisumu, and other major cities.'
    },
    {
      question: 'Will I need to leave a deposit?',
      answer: 'Yes, a refundable security deposit will be required. Details will be shared closer to launch.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">OS</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Oshocks Junior Bike Shop</h1>
                <p className="text-xs text-gray-500">Kenya's Premier Cycling Marketplace</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.history.back()}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline">Home</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative py-12 sm:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-4 py-2 rounded-full mb-6 border border-blue-200">
                {currentType.icon}
                <span className="text-sm font-semibold">{currentType.title}</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 leading-tight">
                {featureData.name}
              </h1>
              
              <p className="text-xl sm:text-2xl text-blue-600 font-semibold mb-6">
                {featureData.tagline}
              </p>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {featureData.description}
              </p>

              {/* Status Badge */}
              <div className="flex items-center space-x-4 mb-8">
                <div className="flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg border border-yellow-200">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-semibold">{featureData.status}</span>
                </div>
                <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg border border-green-200">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-semibold">Expected: {featureData.expectedLaunch}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Development Progress</span>
                  <span className="text-sm font-bold text-blue-600">{featureData.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${featureData.progress}%` }}
                  />
                </div>
              </div>

              {/* Notification Form */}
              {!notified ? (
                <form onSubmit={handleNotifyMe} className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Get Notified at Launch
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Be the first to know when this feature goes live and receive exclusive early access.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                          <span>Subscribing...</span>
                        </>
                      ) : (
                        <>
                          <Bell className="w-5 h-5" />
                          <span>Notify Me</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border-2 border-green-200">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        You're on the List! 🎉
                      </h3>
                      <p className="text-gray-700 mb-3">
                        We'll send you an email as soon as <strong>{featureData.name}</strong> launches. Thank you for your interest!
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-green-700">
                        <Mail className="w-4 h-4" />
                        <span>Confirmation sent to {email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Content - Image/Visual */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                <img 
                  src={featureData.image}
                  alt={featureData.name}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 bg-gradient-to-br ${currentType.color} rounded-lg flex items-center justify-center text-white`}>
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Coming Soon</p>
                        <p className="text-xs text-gray-600">{featureData.expectedLaunch}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Stats */}
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-4 border-2 border-blue-100 hidden lg:block">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">500+</p>
                    <p className="text-xs text-gray-600">Interested Users</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why You'll Love This
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover the benefits that make this feature worth the wait
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {currentType.benefits.map((benefit, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
                <div className={`w-12 h-12 bg-gradient-to-br ${currentType.color} rounded-lg flex items-center justify-center text-white mb-4`}>
                  {benefit.icon}
                </div>
                <p className="text-gray-900 font-semibold">{benefit.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* What to Expect Section */}
      <div className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What to Expect
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Here's everything you need to know about our upcoming service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {expectations.map((item, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all border border-gray-200">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Development Progress Timeline */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Development Timeline
            </h2>
            <p className="text-lg text-gray-600">
              Track our progress as we build this feature
            </p>
          </div>

          <div className="space-y-4">
            {progressStages.map((stage, index) => (
              <div key={index} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border-2 border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {stage.completed ? (
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{index + 1}</span>
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-gray-900">{stage.stage}</h3>
                  </div>
                  <span className={`text-sm font-semibold ${stage.completed ? 'text-green-600' : 'text-blue-600'}`}>
                    {stage.percentage}%
                  </span>
                </div>
                <div className="ml-11">
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ${stage.completed ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${stage.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Available Now Section */}
      <div className="py-16 bg-gradient-to-br from-gray-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Available Now
            </h2>
            <p className="text-xl text-blue-200">
              While you wait, check out these features already live on our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {availableNow.map((item, index) => (
              <a
                key={index}
                href={item.link}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all group"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 flex items-center space-x-2">
                  <span>{item.title}</span>
                  <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-blue-100">
                  {item.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Got questions? We've got answers!
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border-2 border-gray-200 hover:border-blue-300 transition-all group">
                <summary className="font-bold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                  <span className="text-lg">{faq.question}</span>
                  <AlertCircle className="w-5 h-5 text-blue-600 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full mb-6">
            <Heart className="w-10 h-10" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Can't Wait to Launch This!
          </h2>
          <p className="text-xl sm:text-2xl mb-10 text-blue-100">
            We're working hard to bring you {featureData.name}. Stay tuned for updates!
          </p>
          
          {!notified && (
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center space-x-3 bg-white text-blue-600 px-10 py-5 rounded-full font-bold text-lg hover:bg-blue-50 transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105"
            >
              <Bell className="w-6 h-6" />
              <span>Get Notified</span>
            </button>
          )}

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-blue-100">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">500+</div>
              <div className="text-sm">Waiting List</div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-blue-400"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">{featureData.progress}%</div>
              <div className="text-sm">Complete</div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-blue-400"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">{featureData.expectedLaunch}</div>
              <div className="text-sm">Expected Launch</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm mb-4 md:mb-0">
              © 2025 Oshocks Junior Bike Shop. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <a href="/contact" className="hover:text-white transition-colors">Contact Us</a>
              <a href="/help" className="hover:text-white transition-colors">Help Center</a>
              <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Helper component for Bike icon since it's not in lucide-react
const Bike = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5.5" cy="17.5" r="3.5"/>
    <circle cx="18.5" cy="17.5" r="3.5"/>
    <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
    <path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
  </svg>
);

export default FeatureComingSoonPage;