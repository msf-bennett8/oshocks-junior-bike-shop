import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Smartphone,
  ShieldCheck,
  Truck,
  Clock,
  Award
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const shopCategories = [
    { name: 'Mountain Bikes', link: '/shop?category=mountain' },
    { name: 'Road Bikes', link: '/shop?category=road' },
    { name: 'Electric Bikes', link: '/shop?category=electric' },
    { name: 'Kids Bikes', link: '/shop?category=kids' },
    { name: 'Accessories', link: '/shop?category=accessories' },
    { name: 'Spare Parts', link: '/spare-parts-accessories' },
    { name: 'Helmets & Safety', link: '/safety' },
    { name: 'Bike Maintenance', link: '/bike-maintenance' }
  ];

  const quickLinks = [
    { name: 'Shop All Products', link: '/shop' },
    { name: 'New Arrivals', link: '/new-arrivals' },
    { name: 'Best Sellers', link: '/best-sellers' },
    { name: 'Special Offers', link: '/special-offers' },
    { name: 'Clearance Sale', link: '/clearance-sale' },
    { name: 'Gift Cards', link: '/gift-cards' },
    { name: 'Blog', link: '/blog' },
    { name: 'Bike Finder', link: '/bike-finder' }
  ];

  const customerService = [
    { name: 'Help Center', link: '/faq' },
    { name: 'Track Your Order', link: '/order-history' },
    { name: 'Shipping Information', link: '/shipping-policy' },
    { name: 'Returns & Refunds', link: '/return-policy' },
    { name: 'Warranty Information', link: '/warranty-information' },
    { name: 'Bike Assembly Guide', link: '#' },
    { name: 'Size Guide', link: '/size-guide' },
    { name: 'Documentations', link: '#' },
    { name: 'FAQ', link: '/faq' }
  ];

  const aboutCompany = [
    { name: 'About Us', link: '/about' },
    { name: 'Our Story', link: '/about' },
    { name: 'Our Services', link: '/services' },
    { name: 'Contact Us', link: '/contact' },
    { name: 'Careers', link: '/careers' },
    { name: 'Jobs', link: '/#' },
    { name: 'Store Locations', link: '/store-locations' },
    { name: 'Partner With Us', link: '/partner-with-us' },
    { name: 'Become a Seller', link: '/become-a-seller' }
  ];

  const policies = [
    { name: 'Privacy Policy', link: '/privacy-policy' },
    { name: 'Terms of Service', link: '/terms-of-service' },
    { name: 'Cookie Policy', link: '/cookie-policy' },
    { name: 'Payment Terms', link: '/payment-terms' },
    { name: 'Shipping Policy', link: '/shipping-policy' },
    { name: 'Return Policy', link: '/return-policy' },
    { name: 'Refund Policy', link: '/refund-policy' }
  ];

  const myAccount = [
    { name: 'My Account', link: '/dashboard' },
    { name: 'Order History', link: '/order-history' },
    { name: 'Wishlist', link: '/wishlist' },
    { name: 'Saved Addresses', link: '/addresses' },
    { name: 'Payment Methods', link: '/PaymentMethod' },
    { name: 'Documentary', link: '/Documentary' },
    { name: 'Notifications', link: '/Notifications' }
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 relative">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12 pt-16">
        {/* Top Section - Brand & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10 border-b border-gray-800">
          {/* Brand Info */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">OS</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
                  Oshocks
                </span>
                <span className="text-sm text-gray-400">A Premier Cycling Marketplace</span>
              </div>
            </Link>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Quality bicycles, accessories, bike repairs and spare parts for all your cycling needs. Fast delivery around Nairobi. Your trusted partner for everything cycling.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Phone size={18} className="text-blue-400" />
                <span>+254 798 558 285</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail size={18} className="text-blue-400" />
                <span>oshocksjuniorbikeshop@gmail.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin size={18} className="text-blue-400" />
                <span>Nairobi, Kenya</span>
              </div>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-bold text-lg mb-4">Stay Updated</h3>
            <p className="text-sm text-gray-400 mb-4">
              Subscribe to our newsletter for exclusive deals, new arrivals, and cycling tips!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium whitespace-nowrap">
                Subscribe Now
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="flex items-center gap-2 text-xs">
                <Truck size={20} className="text-green-400" />
                <span>Free Shipping Over 1,000 KES</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <ShieldCheck size={20} className="text-blue-400" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Clock size={20} className="text-purple-400" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Award size={20} className="text-yellow-400" />
                <span>Quality Guaranteed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 py-10">
          {/* Shop Categories */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Shop Categories</h3>
            <ul className="space-y-2">
              {shopCategories.map((item, index) => (
                <li key={index}>
                  <Link 
                    to={item.link}
                    className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200 block"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((item, index) => (
                <li key={index}>
                  <Link 
                    to={item.link}
                    className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200 block"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Customer Service</h3>
            <ul className="space-y-2">
              {customerService.map((item, index) => (
                <li key={index}>
                  <Link 
                    to={item.link}
                    className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200 block"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Company */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">About Company</h3>
            <ul className="space-y-2">
              {aboutCompany.map((item, index) => (
                <li key={index}>
                  <Link 
                    to={item.link}
                    className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200 block"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* My Account */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">My Account</h3>
            <ul className="space-y-2">
              {myAccount.map((item, index) => (
                <li key={index}>
                  <Link 
                    to={item.link}
                    className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200 block"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Policies</h3>
            <ul className="space-y-2">
              {policies.map((item, index) => (
                <li key={index}>
                  <Link 
                    to={item.link}
                    className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200 block"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="py-8 border-t border-gray-800">
          <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-4 text-center">Secure Payment Methods</h3>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {/* M-Pesa Logo */}
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/1/15/M-PESA_LOGO-01.svg" 
              alt="M-Pesa" 
              className="h-12 object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
            {/* Visa Logo */}
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" 
              alt="Visa" 
              className="h-6 object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
            {/* Mastercard Logo */}
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" 
              alt="Mastercard" 
              className="h-10 object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </div>
      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400 text-center md:text-left">
              © {currentYear} Oshocks Junior Bike Shop. All rights reserved.
            </p>
            
            {/* Social Media Links */}
            <div className="flex items-center gap-4">
              <a 
                href="https://facebook.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1877F2] hover:text-[#0C63D4] transition-colors transform hover:scale-110 duration-200"
                aria-label="Facebook"
              >
                <Facebook size={20} fill="currentColor" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1DA1F2] hover:text-[#0C85D0] transition-colors transform hover:scale-110 duration-200"
                aria-label="Twitter"
              >
                <Twitter size={20} fill="currentColor" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E4405F] hover:text-[#C13584] transition-colors transform hover:scale-110 duration-200"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0A66C2] hover:text-[#004182] transition-colors transform hover:scale-110 duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} fill="currentColor" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FF0000] hover:text-[#CC0000] transition-colors transform hover:scale-110 duration-200"
                aria-label="YouTube"
              >
                <Youtube size={20} />
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Nairobi, Kenya</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;