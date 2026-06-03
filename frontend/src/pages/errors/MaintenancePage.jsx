import React, { useState, useEffect } from 'react';
import { 
  Wrench,
  Clock,
  Bike,
  Mail,
  Bell,
  CheckCircle,
  Zap,
  Shield,
  TrendingUp,
  Sparkles,
  Twitter,
  Facebook,
  Instagram,
  Phone,
  MessageCircle,
  Star,
  Award,
  Users
} from 'lucide-react';

const MaintenancePage = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [activeTab, setActiveTab] = useState('updates');
  const [timeRemaining, setTimeRemaining] = useState({
    hours: 2,
    minutes: 30,
    seconds: 45
  });

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubscribe = () => {
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubscribe();
    }
  };

  const improvements = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Performance Boost',
      description: 'Faster page loads and smoother browsing experience',
      color: 'bg-yellow-500'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Enhanced Security',
      description: 'Stronger protection for your data and transactions',
      color: 'bg-blue-500'
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'New Features',
      description: 'Exciting new tools to improve your shopping',
      color: 'bg-purple-500'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Better Search',
      description: 'Find exactly what you need even faster',
      color: 'bg-green-500'
    }
  ];

  const maintenanceSteps = [
    { step: 'Database optimization', status: 'completed', progress: 100 },
    { step: 'Server updates', status: 'in-progress', progress: 65 },
    { step: 'Security patches', status: 'pending', progress: 0 },
    { step: 'Testing & verification', status: 'pending', progress: 0 }
  ];

  const testimonials = [
    {
      name: 'James Kariuki',
      rating: 5,
      text: 'Best bike shop in Nairobi! Great selection and excellent service.',
      avatar: '👨🏾'
    },
    {
      name: 'Sarah Mwangi',
      rating: 5,
      text: 'Found the perfect bike for my son. Highly recommended!',
      avatar: '👩🏾'
    },
    {
      name: 'David Ochieng',
      rating: 5,
      text: 'Professional staff and competitive prices. Will shop here again.',
      avatar: '👨🏿'
    }
  ];

  const stats = [
    { icon: <Users className="w-6 h-6" />, value: '10,000+', label: 'Happy Customers' },
    { icon: <Bike className="w-6 h-6" />, value: '500+', label: 'Bikes Sold' },
    { icon: <Award className="w-6 h-6" />, value: '4.9/5', label: 'Average Rating' },
    { icon: <Star className="w-6 h-6" />, value: '15+', label: 'Years Experience' }
  ];

  const socialLinks = [
    { icon: <Twitter className="w-5 h-5" />, name: 'Twitter', link: '#', color: 'hover:bg-blue-400' },
    { icon: <Facebook className="w-5 h-5" />, name: 'Facebook', link: '#', color: 'hover:bg-blue-600' },
    { icon: <Instagram className="w-5 h-5" />, name: 'Instagram', link: '#', color: 'hover:bg-pink-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-64 h-64 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Logo Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center space-x-3 mb-6">
            <div className="bg-orange-500 rounded-lg p-3 shadow-lg">
              <Bike className="w-10 h-10 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-gray-900">Oshocks Junior Bike Shop</h1>
              <p className="text-sm text-gray-600">Kenya's Premier Cycling Marketplace</p>
            </div>
          </div>
        </div>

        {/* Main Maintenance Message */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 mb-8 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-orange-100 rounded-full mb-6 animate-bounce">
            <Wrench className="w-12 h-12 text-orange-500" />
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            We're Upgrading!
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Our platform is currently undergoing scheduled maintenance to bring you an even better shopping experience. 
            We'll be back online shortly!
          </p>

          {/* Countdown Timer */}
          <div className="inline-flex items-center space-x-2 mb-8">
            <Clock className="w-5 h-5 text-orange-500" />
            <span className="text-gray-700 font-medium">Estimated time remaining:</span>
          </div>
          
          <div className="flex justify-center space-x-4 mb-8">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 min-w-[100px] shadow-lg">
              <div className="text-4xl font-bold text-white mb-1">
                {String(timeRemaining.hours).padStart(2, '0')}
              </div>
              <div className="text-orange-100 text-sm font-medium uppercase">Hours</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 min-w-[100px] shadow-lg">
              <div className="text-4xl font-bold text-white mb-1">
                {String(timeRemaining.minutes).padStart(2, '0')}
              </div>
              <div className="text-orange-100 text-sm font-medium uppercase">Minutes</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 min-w-[100px] shadow-lg">
              <div className="text-4xl font-bold text-white mb-1">
                {String(timeRemaining.seconds).padStart(2, '0')}
              </div>
              <div className="text-orange-100 text-sm font-medium uppercase">Seconds</div>
            </div>
          </div>

          <p className="text-gray-500 text-sm">
            * This is an estimate. We'll have you back shopping as soon as possible!
          </p>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Why Choose Oshocks Junior?
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-3 text-orange-500">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabbed Content Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="flex justify-center space-x-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('updates')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'updates'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              What's New
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'progress'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Progress
            </button>
            <button
              onClick={() => setActiveTab('testimonials')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'testimonials'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Reviews
            </button>
          </div>

          {/* Updates Tab */}
          {activeTab === 'updates' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {improvements.map((item, index) => (
                <div key={index} className="text-center">
                  <div className={`${item.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg transform hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <div className="space-y-4">
              {maintenanceSteps.map((step, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {step.status === 'completed' && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      {step.status === 'in-progress' && (
                        <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                      )}
                      {step.status === 'pending' && (
                        <Clock className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="font-medium text-gray-900">{step.step}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      step.status === 'completed' ? 'bg-green-100 text-green-800' :
                      step.status === 'in-progress' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {step.status === 'completed' ? 'Completed' :
                       step.status === 'in-progress' ? 'In Progress' :
                       'Pending'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        step.status === 'completed' ? 'bg-green-500' :
                        step.status === 'in-progress' ? 'bg-orange-500' :
                        'bg-gray-300'
                      }`}
                      style={{ width: `${step.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Testimonials Tab */}
          {activeTab === 'testimonials' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="text-3xl">{testimonial.avatar}</div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm italic">"{testimonial.text}"</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Email Notification Signup */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl shadow-xl p-8 mb-8 text-white text-center">
          <Bell className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-3">Get Notified When We're Back!</h3>
          <p className="text-orange-100 mb-6 max-w-xl mx-auto">
            Enter your email and we'll send you a notification as soon as the site is back online. 
            Be the first to explore our improved platform!
          </p>

          {subscribed ? (
            <div className="max-w-md mx-auto bg-white/20 backdrop-blur-sm rounded-xl p-6 border-2 border-white/30">
              <CheckCircle className="w-12 h-12 mx-auto mb-3" />
              <p className="font-semibold text-lg">You're all set!</p>
              <p className="text-orange-100 text-sm">We'll email you when we're back online.</p>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="your@email.com"
                    className="w-full px-6 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-orange-300"
                  />
                </div>
                <button
                  onClick={handleSubscribe}
                  className="bg-white text-orange-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap shadow-lg"
                >
                  Notify Me
                </button>
              </div>
              <p className="text-orange-100 text-xs mt-3">
                We'll only send you one email when we're back. No spam!
              </p>
            </div>
          )}
        </div>

        {/* Contact & Support */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Need Immediate Assistance?</h3>
            <p className="text-gray-600 mb-6">
              While our website is down, our support team is still available to help you with urgent matters.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer">
                <Phone className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Call Us</p>
                  <p className="text-sm text-gray-600">+254 700 000 000</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer">
                <Mail className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email Support</p>
                  <p className="text-sm text-gray-600">support@oshocksjunior.co.ke</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer">
                <MessageCircle className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">WhatsApp</p>
                  <p className="text-sm text-gray-600">+254 700 000 000</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Visit Our Physical Store</h3>
            <p className="text-gray-600 mb-6">
              Our brick-and-mortar shop is open and ready to serve you during maintenance!
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="font-semibold text-gray-900 mb-2">Oshocks Junior Bike Shop</p>
              <p className="text-gray-600 text-sm mb-1">📍 Nairobi, Kenya</p>
              <p className="text-gray-600 text-sm mb-1">🕐 Mon-Sat: 9:00 AM - 6:00 PM</p>
              <p className="text-gray-600 text-sm">🕐 Sun: 10:00 AM - 4:00 PM</p>
            </div>
            <button className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
              Get Directions
            </button>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Stay Connected</h3>
          <p className="text-gray-600 mb-6">Follow us for real-time updates and cycling news</p>
          <div className="flex justify-center space-x-4">
            {socialLinks.map((social, index) => (
              <button
                key={index}
                onClick={() => window.open(social.link, '_blank')}
                className={`bg-gray-100 ${social.color} p-4 rounded-full transition-colors hover:text-white`}
              >
                {social.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Message */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-2">
            Thank you for your patience and understanding! 🚴‍♂️
          </p>
          <p className="text-gray-500 text-sm">
            © 2025 Oshocks Junior Bike Shop. All rights reserved.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default MaintenancePage;