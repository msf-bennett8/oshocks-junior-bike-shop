import { useState, useEffect } from 'react';
import { Bell, Mail, MapPin, Users, Package, Bike, TrendingUp, Star, CheckCircle, ArrowRight, Facebook, Twitter, Instagram, Linkedin, Clock, Gift, Zap, Shield, Truck, Calendar, Phone, Share2, Copy, Heart } from 'lucide-react';

const ComingSoonPage = () => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedInterest, setSelectedInterest] = useState([]);
  
  // Launch date countdown
  const launchDate = new Date('2025-12-01T00:00:00');
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = launchDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const interests = [
    { id: 'mountain', label: 'Mountain Bikes', icon: <Bike className="w-4 h-4" /> },
    { id: 'road', label: 'Road Bikes', icon: <Bike className="w-4 h-4" /> },
    { id: 'accessories', label: 'Accessories', icon: <Package className="w-4 h-4" /> },
    { id: 'parts', label: 'Spare Parts', icon: <Package className="w-4 h-4" /> },
    { id: 'gear', label: 'Cycling Gear', icon: <Package className="w-4 h-4" /> },
    { id: 'kids', label: 'Kids Bikes', icon: <Bike className="w-4 h-4" /> }
  ];

  const handleInterestToggle = (interestId) => {
    setSelectedInterest(prev => 
      prev.includes(interestId) 
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!email) return;

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setSubscribed(true);
      setLoading(false);
      
      // Track subscription
      if (window.gtag) {
        window.gtag('event', 'newsletter_signup', {
          method: 'coming_soon_page'
        });
      }
    }, 1500);
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = 'Check out Oshocks Junior Bike Shop - Kenya\'s Premier Cycling Marketplace Coming Soon!';
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const features = [
    {
      icon: <Package className="w-8 h-8" />,
      title: 'Thousands of Products',
      description: 'Browse our extensive catalog of bicycles, accessories, and spare parts from top brands.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: 'Nationwide Delivery',
      description: 'Fast and reliable delivery across Kenya. Get your cycling gear delivered to your doorstep.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure Payments',
      description: 'Pay safely with M-Pesa, credit cards, or debit cards. Your transactions are protected.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Multi-Vendor Marketplace',
      description: 'Connect with trusted bicycle sellers across Kenya all in one convenient platform.',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: 'Reviews & Ratings',
      description: 'Make informed decisions with genuine customer reviews and product ratings.',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Lightning Fast',
      description: 'Experience blazing-fast search and seamless browsing powered by modern technology.',
      color: 'from-pink-500 to-pink-600'
    }
  ];

  const launchBenefits = [
    {
      title: 'Early Bird Discount',
      description: 'Get 15% off your first purchase',
      icon: <Gift className="w-6 h-6" />
    },
    {
      title: 'Exclusive Access',
      description: 'Be the first to shop new arrivals',
      icon: <Star className="w-6 h-6" />
    },
    {
      title: 'Free Delivery',
      description: 'Free shipping on your first order',
      icon: <Truck className="w-6 h-6" />
    },
    {
      title: 'Priority Support',
      description: 'Dedicated customer service',
      icon: <Heart className="w-6 h-6" />
    }
  ];

  const milestones = [
    { label: 'Products Ready', value: '5000+', achieved: true },
    { label: 'Vendors Onboarded', value: '50+', achieved: true },
    { label: 'Categories', value: '25+', achieved: true },
    { label: 'Cities Covered', value: '10+', achieved: true }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F46E5' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Navigation Bar */}
      <nav className="relative bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                <span className="text-white font-bold text-2xl">OS</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Oshocks Junior Bike Shop</h1>
                <p className="text-sm text-blue-600 font-semibold">Kenya's Premier Cycling Marketplace</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="tel:+254712345678" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                <Phone className="w-4 h-4" />
                <span className="text-sm font-medium">+254 712 345 678</span>
              </a>
              <button
                onClick={() => handleShare('whatsapp')}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-sm font-semibold">Share</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Countdown */}
      <div className="relative py-16 sm:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6 animate-pulse">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-semibold">Launching Soon</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
              Your Cycling Journey
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Starts Here
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
              Kenya's first comprehensive online marketplace for bicycles, accessories, and cycling gear. 
              Connecting riders with trusted sellers across the nation.
            </p>

            {/* Countdown Timer */}
            <div className="flex justify-center mb-12">
              <div className="grid grid-cols-4 gap-4 sm:gap-8">
                {[
                  { label: 'Days', value: timeLeft.days },
                  { label: 'Hours', value: timeLeft.hours },
                  { label: 'Minutes', value: timeLeft.minutes },
                  { label: 'Seconds', value: timeLeft.seconds }
                ].map((item, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border-2 border-blue-100 transform hover:scale-105 transition-transform">
                    <div className="text-3xl sm:text-5xl font-bold text-blue-600 mb-2">
                      {String(item.value).padStart(2, '0')}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 font-semibold uppercase tracking-wide">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subscription Form */}
            {!subscribed ? (
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    🎉 Get Launch Day Benefits
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Subscribe now to receive exclusive early access, special discounts, and be the first to know when we launch!
                  </p>
                  
                  <form onSubmit={handleSubscribe} className="space-y-4">
                    <div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        required
                        className="w-full px-4 py-4 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-lg"
                      />
                    </div>
                    
                    <div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone number (optional)"
                        className="w-full px-4 py-4 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-lg"
                      />
                    </div>

                    {/* Interest Selection */}
                    <div className="text-left">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        What are you interested in? (Optional)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {interests.map((interest) => (
                          <button
                            key={interest.id}
                            type="button"
                            onClick={() => handleInterestToggle(interest.id)}
                            className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all ${
                              selectedInterest.includes(interest.id)
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                            }`}
                          >
                            {interest.icon}
                            <span className="text-sm font-medium">{interest.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                          <span>Subscribing...</span>
                        </>
                      ) : (
                        <>
                          <Bell className="w-5 h-5" />
                          <span>Notify Me at Launch</span>
                        </>
                      )}
                    </button>
                  </form>
                  
                  <p className="text-xs text-gray-500 mt-4">
                    By subscribing, you agree to receive updates from Oshocks Junior Bike Shop. Unsubscribe anytime.
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-2xl p-8 border-2 border-green-200">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-3">
                  You're on the List! 🎉
                </h3>
                <p className="text-lg text-gray-700 mb-6">
                  Thank you for subscribing! We'll send you exclusive updates and notify you the moment we launch.
                </p>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-gray-600 mb-2 font-semibold">Share with friends and family:</p>
                  <div className="flex items-center justify-center space-x-3">
                    <button
                      onClick={() => handleShare('facebook')}
                      className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                    >
                      <Facebook className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleShare('twitter')}
                      className="p-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-all"
                    >
                      <Twitter className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleShare('whatsapp')}
                      className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                    >
                      <Phone className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
                    >
                      {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Launch Benefits */}
      <div className="py-16 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Early Subscriber Benefits
            </h2>
            <p className="text-xl text-blue-100">
              Join now and enjoy exclusive perks when we launch
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {launchBenefits.map((benefit, index) => (
              <div key={index} className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20 hover:bg-opacity-20 transition-all">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                <p className="text-blue-100">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Features */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Oshocks Junior Bike Shop?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're building the most comprehensive cycling marketplace in Kenya with features that put you first
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border-2 border-gray-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Milestones */}
      <div className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              We're Ready to Launch
            </h2>
            <p className="text-xl text-gray-600">
              Our preparation progress - everything is set for your amazing shopping experience
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {milestones.map((milestone, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200 text-center">
                <div className="text-4xl sm:text-5xl font-bold text-blue-600 mb-2">
                  {milestone.value}
                </div>
                <div className="text-sm sm:text-base text-gray-700 font-semibold mb-3">
                  {milestone.label}
                </div>
                {milestone.achieved && (
                  <div className="flex items-center justify-center space-x-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-semibold">Ready</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Location & Contact */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Visit Our Physical Store
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                While our online marketplace is launching soon, you can already visit our physical bike shop in Nairobi for all your cycling needs!
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Location</h3>
                    <p className="text-gray-600">Nairobi CBD, Kenya</p>
                    <p className="text-sm text-blue-600 mt-1">Opening Hours: Mon-Sat, 9AM-6PM</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                    <a href="tel:+254712345678" className="text-gray-600 hover:text-blue-600 transition-colors">
                      +254 712 345 678
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <a href="mailto:info@oshocksjunior.co.ke" className="text-gray-600 hover:text-blue-600 transition-colors">
                      info@oshocksjunior.co.ke
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Social Media */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Stay Connected
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Follow us on social media for updates, cycling tips, and exclusive sneak peeks of our platform!
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <Facebook className="w-6 h-6" />
                  <span className="font-semibold">Facebook</span>
                </a>
                
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 bg-gradient-to-br from-pink-500 to-purple-600 text-white p-4 rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <Instagram className="w-6 h-6" />
                  <span className="font-semibold">Instagram</span>
                </a>
                
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 bg-gradient-to-br from-sky-400 to-blue-500 text-white p-4 rounded-xl hover:from-sky-500 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl"
                >
                  <Twitter className="w-6 h-6" />
                  <span className="font-semibold">Twitter</span>
                </a>
                
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 bg-gradient-to-br from-blue-600 to-blue-700 text-white p-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
                >
                  <Linkedin className="w-6 h-6" />
                  <span className="font-semibold">LinkedIn</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to Ride?
          </h2>
          <p className="text-xl sm:text-2xl mb-10 text-blue-100">
            Join thousands of cycling enthusiasts waiting for Kenya's most comprehensive bike marketplace
          </p>
          
          {!subscribed && (
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center space-x-3 bg-white text-blue-600 px-10 py-5 rounded-full font-bold text-lg hover:bg-blue-50 transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105"
            >
              <span>Subscribe for Updates</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          )}
          
          <div className="mt-12 flex items-center justify-center space-x-8 text-blue-100">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">100%</div>
              <div className="text-sm">Secure</div>
            </div>
            <div className="w-px h-12 bg-blue-400"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">24/7</div>
              <div className="text-sm">Support</div>
            </div>
            <div className="w-px h-12 bg-blue-400"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">Free</div>
              <div className="text-sm">Returns</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">OS</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Oshocks Junior Bike Shop</h3>
                  <p className="text-sm text-gray-400">Coming Soon</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Kenya's premier online cycling marketplace. Connecting riders with quality bicycles, 
                accessories, and gear from trusted sellers nationwide.
              </p>
              <div className="flex items-center space-x-4">
                <a href="https://facebook.com" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://twitter.com" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-sky-500 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="https://instagram.com" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://linkedin.com" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="/faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="/blog" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/shipping" className="hover:text-white transition-colors">Shipping Policy</a></li>
                <li><a href="/returns" className="hover:text-white transition-colors">Return Policy</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2025 Oshocks Junior Bike Shop. All rights reserved.
              </p>
              <div className="flex items-center space-x-6 text-sm">
                <span className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span>Nairobi, Kenya</span>
                </span>
                <span className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <a href="mailto:info@oshocksjunior.co.ke" className="hover:text-white transition-colors">
                    info@oshocksjunior.co.ke
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Action Button */}
      {!subscribed && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center group hover:scale-110 z-50"
          title="Subscribe for updates"
        >
          <Bell className="w-6 h-6 group-hover:animate-bounce" />
        </button>
      )}
    </div>
  );
};

export default ComingSoonPage;