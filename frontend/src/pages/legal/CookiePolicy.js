import React, { useState, useEffect } from 'react';
import { Cookie, Shield, Settings, BarChart3, MessageSquare, CreditCard, ChevronDown, ChevronUp, ArrowLeft, ExternalLink, Info } from 'lucide-react';

const CookiePolicy = () => {
  const [expandedSections, setExpandedSections] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsLoading(false);
  }, []);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const lastUpdated = "November 15, 2024";

  const cookieCategories = [
    {
      id: 'essential',
      name: 'Essential Cookies',
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'These cookies are necessary for the website to function and cannot be switched off.',
      cookies: [
        { name: 'session_id', purpose: 'Maintains your login session and shopping cart', duration: 'Session', provider: 'Oshocks' },
        { name: 'csrf_token', purpose: 'Protects against cross-site request forgery attacks', duration: '24 hours', provider: 'Oshocks' },
        { name: 'cart_token', purpose: 'Stores your shopping cart items', duration: '7 days', provider: 'Oshocks' },
        { name: 'auth_token', purpose: 'Authenticates your user account', duration: '30 days', provider: 'Oshocks' },
        { name: 'cookie_consent', purpose: 'Remembers your cookie preferences', duration: '1 year', provider: 'Oshocks' }
      ]
    },
    {
      id: 'functional',
      name: 'Functional Cookies',
      icon: Settings,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'These cookies enable enhanced functionality and personalization.',
      cookies: [
        { name: 'language_pref', purpose: 'Remembers your language preference', duration: '1 year', provider: 'Oshocks' },
        { name: 'currency_pref', purpose: 'Stores your preferred currency (KES/USD)', duration: '1 year', provider: 'Oshocks' },
        { name: 'location_city', purpose: 'Remembers your delivery location for faster checkout', duration: '90 days', provider: 'Oshocks' },
        { name: 'recently_viewed', purpose: 'Tracks recently viewed products for your convenience', duration: '30 days', provider: 'Oshocks' },
        { name: 'wishlist_items', purpose: 'Saves your wishlist items', duration: '1 year', provider: 'Oshocks' }
      ]
    },
    {
      id: 'analytics',
      name: 'Analytics Cookies',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'These cookies help us understand how visitors interact with our website.',
      cookies: [
        { name: '_ga', purpose: 'Google Analytics - distinguishes users', duration: '2 years', provider: 'Google' },
        { name: '_gid', purpose: 'Google Analytics - distinguishes users', duration: '24 hours', provider: 'Google' },
        { name: '_gat', purpose: 'Google Analytics - throttles request rate', duration: '1 minute', provider: 'Google' },
        { name: 'algolia_analytics', purpose: 'Tracks product search behavior', duration: '6 months', provider: 'Algolia' },
        { name: 'session_recording', purpose: 'Records user interactions for improvement', duration: 'Session', provider: 'Oshocks' }
      ]
    },
    {
      id: 'marketing',
      name: 'Marketing Cookies',
      icon: MessageSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'These cookies track your activity to deliver personalized advertisements.',
      cookies: [
        { name: '_fbp', purpose: 'Facebook Pixel - tracks conversions and retargeting', duration: '3 months', provider: 'Facebook' },
        { name: 'IDE', purpose: 'Google Ads - serves targeted advertisements', duration: '1 year', provider: 'Google' },
        { name: 'fr', purpose: 'Facebook advertising delivery and metrics', duration: '3 months', provider: 'Facebook' },
        { name: 'personalization_id', purpose: 'Twitter - personalizes ads and content', duration: '2 years', provider: 'Twitter' },
        { name: 'affiliate_ref', purpose: 'Tracks affiliate marketing referrals', duration: '30 days', provider: 'Oshocks' }
      ]
    },
    {
      id: 'payment',
      name: 'Payment Processing Cookies',
      icon: CreditCard,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'These cookies are used to process payments securely.',
      cookies: [
        { name: 'stripe_mid', purpose: 'Stripe fraud detection and processing', duration: '1 year', provider: 'Stripe' },
        { name: 'stripe_sid', purpose: 'Stripe session management', duration: '30 minutes', provider: 'Stripe' },
        { name: 'mpesa_session', purpose: 'M-Pesa payment session tracking', duration: 'Session', provider: 'Safaricom' },
        { name: 'flutterwave_ref', purpose: 'Flutterwave transaction reference', duration: '24 hours', provider: 'Flutterwave' }
      ]
    },
    {
      id: 'support',
      name: 'Customer Support Cookies',
      icon: MessageSquare,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      description: 'These cookies enable our live chat and customer support features.',
      cookies: [
        { name: 'tawk_uuid', purpose: 'Tawk.to - identifies returning chat users', duration: '6 months', provider: 'Tawk.to' },
        { name: 'tawk_visitor', purpose: 'Tawk.to - tracks visitor information', duration: '6 months', provider: 'Tawk.to' },
        { name: 'support_history', purpose: 'Stores your support ticket history', duration: '1 year', provider: 'Oshocks' }
      ]
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Cookie Policy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Back Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-2 py-1"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Back</span>
          </button>
        </div>
      </div>

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center mb-4" aria-hidden="true">
            <Cookie className="w-16 h-16" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Cookie Policy
          </h1>
          <p className="text-xl text-center text-blue-100">
            Oshocks Junior Bike Shop - Kenya's Premier Cycling Marketplace
          </p>
          <p className="text-center text-blue-200 mt-4">
            <time dateTime={lastUpdated}>Last Updated: {lastUpdated}</time>
          </p>
        </div>
      </header>

      {/* Quick Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-[52px] z-40 shadow-sm" aria-label="Page navigation">
        <div className="max-w-5xl mx-auto px-4 py-3 overflow-x-auto">
          <div className="flex space-x-4 min-w-max">
            <a href="#what-are-cookies" className="text-sm text-gray-600 hover:text-blue-600 whitespace-nowrap transition-colors">
              What Are Cookies
            </a>
            <a href="#cookie-types" className="text-sm text-gray-600 hover:text-blue-600 whitespace-nowrap transition-colors">
              Cookie Types
            </a>
            <a href="#why-we-use" className="text-sm text-gray-600 hover:text-blue-600 whitespace-nowrap transition-colors">
              Why We Use Them
            </a>
            <a href="#manage-cookies" className="text-sm text-gray-600 hover:text-blue-600 whitespace-nowrap transition-colors">
              Manage Cookies
            </a>
            <a href="#contact" className="text-sm text-gray-600 hover:text-blue-600 whitespace-nowrap transition-colors">
              Contact
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Introduction */}
        <section id="what-are-cookies" className="bg-white rounded-lg shadow-md p-8 mb-8 scroll-mt-32">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What Are Cookies?</h2>
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
            <p>
              Cookies are small text files that are placed on your computer or mobile device when you visit our website. 
              They are widely used to make websites work more efficiently and provide a better user experience. Cookies 
              help us remember your preferences, understand how you use our site, and improve our services.
            </p>
            <p>
              At Oshocks Junior Bike Shop, we use cookies to enhance your shopping experience, process your orders securely, 
              remember your cart items, and provide personalized product recommendations. This Cookie Policy explains what 
              cookies we use, why we use them, and how you can manage your cookie preferences.
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mt-6" role="note">
              <div className="flex">
                <Info className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Your Control</h3>
                  <p className="text-sm text-blue-800">
                    You can control and manage cookies in various ways. Please note that removing or blocking cookies 
                    can impact your user experience and may prevent certain features from working properly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cookie Categories */}
        <section id="cookie-types" className="bg-white rounded-lg shadow-md p-8 mb-8 scroll-mt-32">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Types of Cookies We Use</h2>
          <p className="text-gray-600 mb-8">
            We categorize cookies based on their purpose and functionality. Click on each category to view detailed 
            information about the specific cookies we use.
          </p>

          <div className="space-y-4">
            {cookieCategories.map((category) => {
              const Icon = category.icon;
              const isExpanded = expandedSections[category.id];

              return (
                <article key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection(category.id)}
                    className="w-full flex items-center justify-between p-6 bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                    aria-expanded={isExpanded}
                    aria-controls={`cookie-category-${category.id}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`${category.bgColor} p-3 rounded-lg`} aria-hidden="true">
                        <Icon className={`w-6 h-6 ${category.color}`} />
                      </div>
                      <div className="text-left">
                        <h3 className="text-xl font-semibold text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-6 h-6 text-gray-400" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-400" aria-hidden="true" />
                    )}
                  </button>

                  {isExpanded && (
                    <div id={`cookie-category-${category.id}`} className="p-6 bg-white">
                      <div className="overflow-x-auto">
                        <table className="w-full" role="table">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th scope="col" className="text-left py-3 px-4 font-semibold text-gray-700">Cookie Name</th>
                              <th scope="col" className="text-left py-3 px-4 font-semibold text-gray-700">Purpose</th>
                              <th scope="col" className="text-left py-3 px-4 font-semibold text-gray-700">Duration</th>
                              <th scope="col" className="text-left py-3 px-4 font-semibold text-gray-700">Provider</th>
                            </tr>
                          </thead>
                          <tbody>
                            {category.cookies.map((cookie, idx) => (
                              <tr key={idx} className="border-b border-gray-100">
                                <td className="py-3 px-4 font-mono text-sm text-gray-800">{cookie.name}</td>
                                <td className="py-3 px-4 text-sm text-gray-600">{cookie.purpose}</td>
                                <td className="py-3 px-4 text-sm text-gray-600">{cookie.duration}</td>
                                <td className="py-3 px-4 text-sm text-gray-600">{cookie.provider}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        {/* First-Party vs Third-Party */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">First-Party and Third-Party Cookies</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
              <h3 className="text-xl font-semibold text-blue-900 mb-3">First-Party Cookies</h3>
              <p className="text-gray-700 mb-4">
                These cookies are set directly by Oshocks Junior Bike Shop and are used exclusively by our website. 
                They help us provide essential functionality like shopping cart management, user authentication, and 
                order processing.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Shopping cart and checkout functionality</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>User account and authentication</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Your preferences and settings</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Security and fraud prevention</span>
                </li>
              </ul>
            </div>

            <div className="border border-purple-200 rounded-lg p-6 bg-purple-50">
              <h3 className="text-xl font-semibold text-purple-900 mb-3">Third-Party Cookies</h3>
              <p className="text-gray-700 mb-4">
                These cookies are set by external services we use to enhance your experience. These include analytics 
                tools, payment processors, advertising networks, and customer support services.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span>Google Analytics for website analytics</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span>Stripe and Flutterwave for payment processing</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span>Facebook and Google for advertising</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span>Tawk.to for live chat support</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Why We Use Cookies */}
        <section id="why-we-use" className="bg-white rounded-lg shadow-md p-8 mb-8 scroll-mt-32">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why We Use Cookies</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-green-100 rounded-full p-2 mr-4 mt-1">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Essential Functionality</h3>
                  <p className="text-gray-600 text-sm">
                    To provide core e-commerce features like shopping cart, checkout, user accounts, and secure payments.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-blue-100 rounded-full p-2 mr-4 mt-1">
                  <Settings className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Personalization</h3>
                  <p className="text-gray-600 text-sm">
                    To remember your preferences, language, currency, delivery location, and provide personalized recommendations.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-purple-100 rounded-full p-2 mr-4 mt-1">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Analytics & Improvement</h3>
                  <p className="text-gray-600 text-sm">
                    To understand how customers use our marketplace, identify issues, and continuously improve our services.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-orange-100 rounded-full p-2 mr-4 mt-1">
                  <MessageSquare className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Marketing & Advertising</h3>
                  <p className="text-gray-600 text-sm">
                    To show you relevant products and offers, measure campaign effectiveness, and provide personalized shopping experiences.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-emerald-100 rounded-full p-2 mr-4 mt-1">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Secure Payments</h3>
                  <p className="text-gray-600 text-sm">
                    To process M-Pesa and card payments securely through our payment partners and prevent fraud.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-pink-100 rounded-full p-2 mr-4 mt-1">
                  <MessageSquare className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Customer Support</h3>
                  <p className="text-gray-600 text-sm">
                    To provide live chat support, remember your support history, and deliver better customer service.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Managing Cookies */}
        <section id="manage-cookies" className="bg-white rounded-lg shadow-md p-8 mb-8 scroll-mt-32">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Managing Your Cookie Preferences</h2>
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
            <p>
              You have the right to decide whether to accept or reject cookies. You can manage your cookie preferences 
              through our Cookie Consent Manager, which appears when you first visit our website. You can also change 
              your preferences at any time by clicking the "Cookie Settings" link in our website footer.
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-6" role="alert">
              <div className="flex">
                <Info className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">Important Note</h3>
                  <p className="text-yellow-800 text-sm mb-0">
                    Please note that blocking essential cookies will prevent certain features from working properly. You may 
                    not be able to add items to your cart, complete purchases, or access your account if essential cookies 
                    are disabled.
                  </p>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Browser Cookie Settings</h3>
            <p>
              Most web browsers allow you to control cookies through their settings. You can set your browser to reject 
              cookies or to alert you when cookies are being sent. Here's how to manage cookies in popular browsers:
            </p>

            <ul className="space-y-2 ml-6">
              <li className="text-gray-700">
                <strong>Google Chrome:</strong> Settings → Privacy and security → Cookies and other site data
              </li>
              <li className="text-gray-700">
                <strong>Mozilla Firefox:</strong> Options → Privacy & Security → Cookies and Site Data
              </li>
              <li className="text-gray-700">
                <strong>Safari:</strong> Preferences → Privacy → Cookies and website data
              </li>
              <li className="text-gray-700">
                <strong>Microsoft Edge:</strong> Settings → Cookies and site permissions → Cookies and site data
              </li>
              <li className="text-gray-700">
                <strong>Opera:</strong> Settings → Privacy & security → Cookies
              </li>
            </ul>

            <p className="mt-4">
              For more information about managing cookies in your specific browser, please visit your browser's help section 
              or support website.
            </p>
          </div>
        </section>

        {/* Mobile Apps */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Cookies in Mobile Applications</h2>
          <p className="text-gray-700 mb-4">
            Our mobile applications may use technologies similar to cookies, including mobile identifiers, SDKs, and 
            local storage. These technologies serve similar purposes to web cookies, helping us provide a personalized 
            shopping experience on mobile devices.
          </p>
          <p className="text-gray-700">
            You can manage mobile tracking through your device settings. On iOS, go to Settings → Privacy → Tracking. 
            On Android, go to Settings → Google → Ads → Opt out of Ads Personalization.
          </p>
        </section>

        {/* Updates to Policy */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Updates to This Cookie Policy</h2>
          <p className="text-gray-700 mb-4">
            We may update this Cookie Policy from time to time to reflect changes in our practices, technologies, legal 
            requirements, or other factors. When we make significant changes, we will notify you by updating the "Last 
            Updated" date at the top of this policy and, where appropriate, provide additional notice such as through 
            email or a prominent notification on our website.
          </p>
          <p className="text-gray-700">
            We encourage you to review this Cookie Policy periodically to stay informed about how we use cookies and 
            similar technologies. Your continued use of our website after any changes indicates your acceptance of the 
            updated Cookie Policy.
          </p>
        </section>

        {/* Third-Party Services */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Third-Party Cookie Policies</h2>
          <p className="text-gray-700 mb-6">
            Some of the cookies on our website are set by third-party services. We do not control these cookies, and we 
            recommend reviewing the cookie policies of these third parties for more information:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Analytics & Performance</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <a 
                    href="https://policies.google.com/privacy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                  >
                    Google Analytics
                    <ExternalLink className="w-3 h-3 ml-1" aria-hidden="true" />
                  </a>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <a 
                    href="https://www.algolia.com/policies/privacy/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                  >
                    Algolia
                    <ExternalLink className="w-3 h-3 ml-1" aria-hidden="true" />
                  </a>
                </li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Payment Processing</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <a 
                    href="https://stripe.com/privacy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                  >
                    Stripe
                    <ExternalLink className="w-3 h-3 ml-1" aria-hidden="true" />
                  </a>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <a 
                    href="https://flutterwave.com/privacy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                  >
                    Flutterwave
                    <ExternalLink className="w-3 h-3 ml-1" aria-hidden="true" />
                  </a>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <a 
                    href="https://www.safaricom.co.ke/privacy-policy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                  >
                    Safaricom M-Pesa
                    <ExternalLink className="w-3 h-3 ml-1" aria-hidden="true" />
                  </a>
                </li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Advertising</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <a 
                    href="https://policies.google.com/privacy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                  >
                    Google Ads
                    <ExternalLink className="w-3 h-3 ml-1" aria-hidden="true" />
                  </a>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <a 
                    href="https://www.facebook.com/privacy/explanation" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                  >
                    Facebook Pixel
                    <ExternalLink className="w-3 h-3 ml-1" aria-hidden="true" />
                  </a>
                </li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Customer Support</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <a 
                    href="https://www.tawk.to/privacy-policy/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                  >
                    Tawk.to
                    <ExternalLink className="w-3 h-3 ml-1" aria-hidden="true" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section id="contact" className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-md p-8 text-white scroll-mt-32">
          <h2 className="text-3xl font-bold mb-6">Questions About Cookies?</h2>
          <p className="mb-6 text-blue-100">
            If you have any questions or concerns about our use of cookies or this Cookie Policy, please don't hesitate 
            to contact us. We're here to help and ensure your privacy is protected.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Email Us</h3>
              <p className="text-blue-100">privacy@oshocksjunior.co.ke</p>
              <p className="text-blue-100">support@oshocksjunior.co.ke</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Visit Our Shop</h3>
              <p className="text-blue-100">Oshocks Junior Bike Shop</p>
              <p className="text-blue-100">Nairobi, Kenya</p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-blue-500">
            <p className="text-sm text-blue-200">
              For general inquiries about our marketplace, products, or services, please visit our Contact page or use 
              our live chat feature. For privacy-related concerns, please use the privacy email address above.
            </p>
          </div>
        </section>

        {/* Related Policies */}
        <section className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Policies</h3>
          <div className="flex flex-wrap gap-3">
            <a href="/privacy-policy" className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700">
              Privacy Policy
            </a>
            <a href="/terms-of-service" className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700">
              Terms of Service
            </a>
            <a href="/data-protection" className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700">
              Data Protection
            </a>
            <a href="/gdpr-compliance" className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700">
              GDPR Compliance
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 mt-12">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm">
            © 2025 Oshocks Junior Bike Shop. All rights reserved. Kenya's Premier Cycling Marketplace.
          </p>
          <p className="text-xs mt-2">
            This Cookie Policy was last updated on {lastUpdated}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CookiePolicy;