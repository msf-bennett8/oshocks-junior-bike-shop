import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState(''); // 'loading', 'success', 'error'

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setSubscribeStatus('error');
      setTimeout(() => setSubscribeStatus(''), 3000);
      return;
    }

    setSubscribeStatus('loading');
    
    // Simulate API call - Replace with actual newsletter API
    setTimeout(() => {
      setSubscribeStatus('success');
      setEmail('');
      setTimeout(() => setSubscribeStatus(''), 5000);
    }, 1000);

    // TODO: Integrate with actual newsletter service
    // try {
    //   await fetch('/api/newsletter/subscribe', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email })
    //   });
    //   setSubscribeStatus('success');
    //   setEmail('');
    // } catch (error) {
    //   setSubscribeStatus('error');
    // }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerLinks = {
    shop: [
      { name: 'All Products', path: '/shop' },
      { name: 'Mountain Bikes', path: '/shop/mountain-bikes' },
      { name: 'Road Bikes', path: '/shop/road-bikes' },
      { name: 'Accessories', path: '/shop/accessories' },
      { name: 'Spare Parts', path: '/shop/spare-parts' },
      { name: 'New Arrivals', path: '/shop/new-arrivals' },
      { name: 'Sale Items', path: '/shop/sale' }
    ],
    account: [
      { name: 'My Account', path: '/account' },
      { name: 'Order History', path: '/account/orders' },
      { name: 'Wishlist', path: '/account/wishlist' },
      { name: 'Track Order', path: '/track-order' },
      { name: 'Sell on Oshocks', path: '/seller/register' }
    ],
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'Our Story', path: '/our-story' },
      { name: 'Contact Us', path: '/contact' },
      { name: 'Careers', path: '/careers' },
      { name: 'Press Kit', path: '/press' },
      { name: 'Blog', path: '/blog' }
    ],
    support: [
      { name: 'Help Center', path: '/help' },
      { name: 'FAQ', path: '/faq' },
      { name: 'Shipping Policy', path: '/shipping-policy' },
      { name: 'Returns & Refunds', path: '/refund-policy' },
      { name: 'Size Guide', path: '/size-guide' },
      { name: 'Payment Methods', path: '/payment-methods' }
    ],
    legal: [
      { name: 'Terms of Service', path: '/terms-of-service' },
      { name: 'Privacy Policy', path: '/privacy-policy' },
      { name: 'Cookie Policy', path: '/cookie-policy' },
      { name: 'Data Protection', path: '/data-protection' }
    ]
  };

  const socialLinks = [
    { name: 'Facebook', icon: '📘', url: 'https://facebook.com/oshocks', color: 'hover:text-blue-400' },
    { name: 'Twitter', icon: '🐦', url: 'https://twitter.com/oshocks', color: 'hover:text-blue-400' },
    { name: 'Instagram', icon: '📷', url: 'https://instagram.com/oshocks', color: 'hover:text-pink-400' },
    { name: 'LinkedIn', icon: '💼', url: 'https://linkedin.com/company/oshocks', color: 'hover:text-blue-500' },
    { name: 'YouTube', icon: '📺', url: 'https://youtube.com/oshocks', color: 'hover:text-red-500' },
    { name: 'TikTok', icon: '🎵', url: 'https://tiktok.com/@oshocks', color: 'hover:text-pink-400' }
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white relative">
      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:shadow-purple-500/50 hover:scale-110 transition-all duration-300 group"
        aria-label="Back to top"
      >
        <span className="text-2xl group-hover:animate-bounce inline-block">⬆️</span>
      </button>

      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-3xl font-bold mb-3">Stay in the Loop! 🚴‍♂️</h3>
            <p className="text-purple-100 mb-6">
              Subscribe to get exclusive deals, cycling tips, and early access to new products
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30"
                disabled={subscribeStatus === 'loading'}
              />
              <button
                type="submit"
                disabled={subscribeStatus === 'loading'}
                className="px-8 py-4 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {subscribeStatus === 'loading' ? '⏳ Subscribing...' : '📧 Subscribe'}
              </button>
            </form>

            {subscribeStatus === 'success' && (
              <p className="mt-4 text-green-200 font-semibold animate-pulse">
                ✅ Successfully subscribed! Check your inbox for a welcome email.
              </p>
            )}
            {subscribeStatus === 'error' && (
              <p className="mt-4 text-red-200 font-semibold">
                ❌ Please enter a valid email address.
              </p>
            )}

            <p className="text-sm text-purple-200 mt-4">
              🔒 We respect your privacy. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-6">
          
          {/* Brand Section - Spans 2 columns on large screens */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-6 group">
              <span className="text-5xl group-hover:scale-110 transition-transform duration-300">🚴‍♂️</span>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Oshocks
                </span>
                <p className="text-xs text-gray-400">Junior Bike Shop</p>
              </div>
            </Link>
            
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Kenya's Premier Cycling Marketplace. We bring together quality bicycles, 
              accessories, and spare parts from trusted sellers across the country. 
              Ride with confidence! 🇰🇪
            </p>

            {/* Social Media Links */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-300 mb-3">Follow Us</p>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-2xl text-gray-400 ${social.color} transition-all duration-300 transform hover:scale-125`}
                    aria-label={social.name}
                    title={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* App Download Badges (Placeholder) */}
            <div>
              <p className="text-sm font-semibold text-gray-300 mb-3">Download Our App</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors cursor-pointer border border-gray-700">
                  <p className="text-xs text-gray-400">Download on the</p>
                  <p className="text-sm font-semibold">🍎 App Store</p>
                </div>
                <div className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors cursor-pointer border border-gray-700">
                  <p className="text-xs text-gray-400">Get it on</p>
                  <p className="text-sm font-semibold">📱 Google Play</p>
                </div>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Shop</h3>
            <ul className="space-y-2.5">
              {footerLinks.shop.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-purple-400 transition-colors text-sm block hover:translate-x-1 transform duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">My Account</h3>
            <ul className="space-y-2.5">
              {footerLinks.account.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-purple-400 transition-colors text-sm block hover:translate-x-1 transform duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Company</h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-purple-400 transition-colors text-sm block hover:translate-x-1 transform duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Support</h3>
            <ul className="space-y-2.5 mb-6">
              {footerLinks.support.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-purple-400 transition-colors text-sm block hover:translate-x-1 transform duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Contact Info */}
            <div className="space-y-2.5 text-sm">
              <p className="font-semibold text-gray-300 mb-2">Contact Us</p>
              <a
                href="mailto:info@oshocks.co.ke"
                className="text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-2"
              >
                <span>📧</span>
                <span>info@oshocks.co.ke</span>
              </a>
              <a
                href="tel:+254712345678"
                className="text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-2"
              >
                <span>📱</span>
                <span>+254 712 345 678</span>
              </a>
              <p className="text-gray-400 flex items-start gap-2">
                <span>📍</span>
                <span>Nairobi, Kenya</span>
              </p>
            </div>
          </div>
        </div>

        {/* Payment Methods & Trust Badges */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Payment Methods */}
            <div className="text-center md:text-left">
              <p className="text-sm font-semibold text-gray-300 mb-3">We Accept</p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
                  <p className="text-sm font-semibold text-green-400">💚 M-Pesa</p>
                </div>
                <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
                  <p className="text-sm font-semibold">💳 Visa</p>
                </div>
                <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
                  <p className="text-sm font-semibold">💳 Mastercard</p>
                </div>
                <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
                  <p className="text-sm font-semibold">💰 PayPal</p>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="text-center md:text-right">
              <p className="text-sm font-semibold text-gray-300 mb-3">Secure Shopping</p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-end">
                <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
                  <p className="text-sm">🔒 SSL Secure</p>
                </div>
                <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
                  <p className="text-sm">✅ Verified</p>
                </div>
                <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
                  <p className="text-sm">🛡️ Safe</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Links */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            {footerLinks.legal.map((link, index) => (
              <React.Fragment key={link.path}>
                <Link
                  to={link.path}
                  className="text-xs text-gray-500 hover:text-purple-400 transition-colors"
                >
                  {link.name}
                </Link>
                {index < footerLinks.legal.length - 1 && (
                  <span className="text-gray-700">•</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 pt-6 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-400 mb-2">
            © {currentYear} Oshocks Junior Bike Shop. All rights reserved.
          </p>
          <p className="text-sm text-gray-500">
            Made with <span className="text-red-500 animate-pulse">❤️</span> in Kenya 🇰🇪
          </p>
          <p className="text-xs text-gray-600 mt-3">
            Empowering cyclists across Kenya, one pedal at a time 🚴‍♂️
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;