import { useState, useEffect } from 'react';
import { FileText, ChevronDown, ChevronUp, Shield, AlertTriangle, Users, ShoppingCart, CreditCard, Truck, Scale, Globe, Lock, UserCheck, Ban, CheckCircle, XCircle, Info, Search, BookOpen, Gavel, Building, Mail, Phone, MessageSquare, Download, Printer, Share2, Clock, Package, MapPin, DollarSign, Eye, ArrowRight } from 'lucide-react';

export default function TermsPage() {
  const [expandedSections, setExpandedSections] = useState({ acceptance: true });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showTOC, setShowTOC] = useState(true);
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  const lastUpdated = "October 11, 2025";
  const effectiveDate = "January 15, 2025";

  // Handle scroll to show/hide search and filter bar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsSearchBarVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 150) {
        setIsSearchBarVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const toggleSection = (id) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const expandAll = () => {
    const allExpanded = {};
    sections.forEach(section => {
      allExpanded[section.id] = true;
    });
    setExpandedSections(allExpanded);
  };

  const collapseAll = () => {
    setExpandedSections({});
  };

  const filters = [
    { id: 'all', label: 'All Terms', icon: FileText, count: 0 },
    { id: 'buyers', label: 'For Buyers', icon: ShoppingCart, count: 0 },
    { id: 'sellers', label: 'For Sellers', icon: Users, count: 0 },
    { id: 'legal', label: 'Legal', icon: Gavel, count: 0 }
  ];

  const sections = [
    {
      id: 'acceptance',
      icon: FileText,
      title: '1. Acceptance of Terms',
      category: 'legal',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Welcome to Oshocks Junior Bike Shop. These Terms and Conditions constitute a legally binding agreement between you and Oshocks Junior Bike Shop.
          </p>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 p-4 sm:p-5 rounded-r-lg">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
              <Info className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              By Using Our Platform, You Agree To:
            </h4>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-white/70 p-3 rounded flex items-start gap-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-700">These Terms and Conditions in their entirety</span>
              </div>
              <div className="bg-white/70 p-3 rounded flex items-start gap-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-700">Our Privacy Policy and Cookie Policy</span>
              </div>
              <div className="bg-white/70 p-3 rounded flex items-start gap-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-700">Our Refund and Returns Policy</span>
              </div>
              <div className="bg-white/70 p-3 rounded flex items-start gap-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-700">All applicable laws and regulations in Kenya</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 p-4 sm:p-5 rounded-r-lg">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              Important Notice
            </h4>
            <p className="text-xs sm:text-sm text-gray-700 mb-2">
              <strong>IF YOU DO NOT AGREE WITH THESE TERMS, YOU MUST IMMEDIATELY DISCONTINUE USE OF OUR PLATFORM.</strong>
            </p>
            <p className="text-xs text-gray-600">
              Your continued access constitutes acceptance of any modifications to these Terms.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'account',
      icon: UserCheck,
      title: '2. Account Registration',
      category: 'buyers',
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 sm:p-5 rounded-lg border-2 border-blue-200">
            <p className="text-sm text-gray-700 mb-4">To access certain features, you must create an account by providing:</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                <p className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Required Information:
                </p>
                <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span>Full legal name</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span>Valid email address</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span>Phone number</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span>Secure password</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                <p className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                  <Info className="w-5 h-5 text-blue-600" />
                  Optional Information:
                </p>
                <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>Date of birth</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>Profile photo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>Billing address</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'purchasing',
      icon: ShoppingCart,
      title: '3. Purchasing & Orders',
      category: 'buyers',
      content: (
        <div className="space-y-6">
          <div className="space-y-3">
            {[
              { num: 1, title: 'Product Selection', desc: 'Browse and add items to cart', icon: ShoppingCart },
              { num: 2, title: 'Checkout', desc: 'Provide shipping and payment info', icon: CreditCard },
              { num: 3, title: 'Order Confirmation', desc: 'Review and receive confirmation', icon: CheckCircle },
              { num: 4, title: 'Payment Processing', desc: 'Complete payment securely', icon: DollarSign },
              { num: 5, title: 'Order Processing', desc: 'Seller prepares shipment', icon: Package }
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="flex items-start gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 shadow-md text-sm sm:text-base">
                    {step.num}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      <h5 className="font-semibold text-gray-900 text-sm sm:text-base">{step.title}</h5>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )
    },
    {
      id: 'payment',
      icon: CreditCard,
      title: '4. Payment Terms',
      category: 'buyers',
      content: (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-5 rounded-lg border-2 border-green-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-600 p-2 sm:p-3 rounded-lg shadow-md">
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h5 className="font-bold text-gray-900 text-base sm:text-lg">M-Pesa</h5>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>STK Push payment</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>No additional fees</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Instant confirmation</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-5 rounded-lg border-2 border-blue-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-600 p-2 sm:p-3 rounded-lg shadow-md">
                  <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h5 className="font-bold text-gray-900 text-base sm:text-lg">Cards</h5>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Visa, Mastercard</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>3D Secure auth</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Save for future</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'shipping',
      icon: Truck,
      title: '5. Shipping & Delivery',
      category: 'buyers',
      content: (
        <div className="space-y-6">
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="w-full border-collapse bg-white text-xs sm:text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold">Location</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold">Time</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold">Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-3 sm:px-4 py-2 sm:py-3 font-semibold">Nairobi CBD</td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3">1-2 days</td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-green-600 font-semibold">KES 200</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-3 sm:px-4 py-2 sm:py-3 font-semibold">Suburbs</td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3">2-3 days</td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-green-600 font-semibold">KES 300</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-3 sm:px-4 py-2 sm:py-3 font-semibold">Major Cities</td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3">3-5 days</td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-blue-600 font-semibold">KES 500</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-3 sm:px-4 py-2 sm:py-3 font-semibold">Rural</td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3">5-7 days</td>
                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-orange-600 font-semibold">KES 800</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )
    },
    {
      id: 'contact',
      icon: MessageSquare,
      title: '6. Contact Information',
      category: 'legal',
      content: (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg border-l-4 border-green-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-600 p-2 sm:p-3 rounded-lg">
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h5 className="font-bold text-gray-900 text-sm sm:text-base">Phone Support</h5>
                  <p className="text-xs text-gray-600">Mon-Sat: 9 AM - 6 PM</p>
                </div>
              </div>
              <a href="tel:+254712345678" className="text-base sm:text-lg font-bold text-green-600 hover:underline block">
                +254 712 345 678
              </a>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-600 p-2 sm:p-3 rounded-lg">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h5 className="font-bold text-gray-900 text-sm sm:text-base">Email Support</h5>
                  <p className="text-xs text-gray-600">Response within 24 hours</p>
                </div>
              </div>
              <a href="mailto:legal@oshocksjunior.co.ke" className="text-sm sm:text-base text-blue-600 hover:underline font-semibold block break-all">
                legal@oshocksjunior.co.ke
              </a>
            </div>
          </div>
        </div>
      )
    }
  ];

  // Update filter counts
  filters.forEach(filter => {
    if (filter.id === 'all') {
      filter.count = sections.length;
    } else {
      filter.count = sections.filter(s => s.category === filter.id).length;
    }
  });

  // Filter sections
  const filteredSections = sections.filter(section => {
    const matchesSearch = searchTerm === '' || 
      section.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || section.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white shadow-lg mt-16">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-green-600 p-2 sm:p-3 rounded-lg shadow-lg">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Terms & Conditions</h1>
                <p className="text-sm sm:text-base text-gray-600">Oshocks Junior Bike Shop - Legal Agreement</p>
              </div>
            </div>
            <div className="hidden sm:flex gap-2">
              <button className="flex items-center gap-2 px-3 sm:px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm">
                <Download className="w-4 h-4" />
                <span className="hidden md:inline">Download</span>
              </button>
              <button className="flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm">
                <Printer className="w-4 h-4" />
                <span className="hidden md:inline">Print</span>
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Last Updated: {lastUpdated}</span>
              <span className="sm:hidden">{lastUpdated}</span>
            </div>
            <div className="flex items-center gap-2 text-blue-600 font-semibold">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Legally Binding Agreement</span>
              <span className="sm:hidden">Binding</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Search and Filter Bar */}
      <div className={`sticky top-16 z-30 transition-transform duration-300 ${
        isSearchBarVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="bg-white shadow-md border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex flex-col lg:flex-row gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search terms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={expandAll}
                  className="flex-1 lg:flex-none px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <ChevronDown className="w-4 h-4" />
                  <span className="hidden sm:inline">Expand</span>
                </button>
                <button
                  onClick={collapseAll}
                  className="flex-1 lg:flex-none px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <ChevronUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Collapse</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => {
                const Icon = filter.icon;
                return (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all text-xs sm:text-sm ${
                      activeFilter === filter.id
                        ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{filter.label}</span>
                    <span className="sm:hidden">{filter.label.split(' ')[0]}</span>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{filter.count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Important Notice */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 sm:p-6 rounded-lg shadow-xl mb-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">Important Legal Notice</h3>
              <p className="text-xs sm:text-sm">
                Please read these Terms carefully. By using Oshocks Junior Bike Shop, you agree to be bound by these terms.
              </p>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        {filteredSections.length > 0 ? (
          <div className="space-y-6">
            {filteredSections.map((section) => {
              const Icon = section.icon;
              const isExpanded = expandedSections[section.id];

              return (
                <div
                  key={section.id}
                  id={section.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg"
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="bg-gradient-to-br from-blue-100 to-green-100 p-2 sm:p-3 rounded-lg">
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      </div>
                      <h2 className="text-base sm:text-xl font-bold text-gray-900 text-left">
                        {section.title}
                      </h2>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 flex-shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-gray-700 leading-relaxed">
                      {section.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
            <Search className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No Results Found</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              We couldn't find any sections matching "{searchTerm}"
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setActiveFilter('all');
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Footer CTA */}
        <div className="mt-12 bg-gradient-to-br from-blue-600 to-green-600 p-6 sm:p-8 rounded-lg shadow-xl text-white">
          <div className="text-center">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">Have Questions About Our Terms?</h3>
            <p className="mb-4 sm:mb-6 text-blue-100 max-w-2xl mx-auto text-sm sm:text-base">
              Our legal team is here to help clarify any questions you may have about these Terms and Conditions.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button className="bg-white text-blue-600 px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors shadow-md flex items-center justify-center gap-2 text-sm sm:text-base">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                Contact Legal Team
              </button>
              <button className="bg-blue-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-bold hover:bg-blue-800 transition-colors shadow-md border-2 border-white flex items-center justify-center gap-2 text-sm sm:text-base">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                Live Chat Support
              </button>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <h4 className="font-bold text-gray-900 text-sm sm:text-base">Shipping Policy</h4>
            </div>
            <p className="text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4">
              Learn about our delivery process and shipping rates.
            </p>
            <a href="/shipping-policy" className="text-blue-600 hover:underline font-semibold text-xs sm:text-sm flex items-center gap-1">
              Read More <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </a>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <h4 className="font-bold text-gray-900 text-sm sm:text-base">Privacy Policy</h4>
            </div>
            <p className="text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4">
              Review how we protect and use your personal data.
            </p>
            <a href="/privacy-policy" className="text-green-600 hover:underline font-semibold text-xs sm:text-sm flex items-center gap-1">
              Read More <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </a>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <h4 className="font-bold text-gray-900 text-sm sm:text-base">Contact Support</h4>
            </div>
            <p className="text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4">
              Get help with your orders and account questions.
            </p>
            <a href="/contact-support" className="text-purple-600 hover:underline font-semibold text-xs sm:text-sm flex items-center gap-1">
              Contact Us <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </a>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </a>
        </div>

        {/* Footer Note */}
        <div className="mt-8 bg-gray-100 p-4 sm:p-6 rounded-lg text-center">
          <p className="text-xs sm:text-sm text-gray-600 mb-2">
            By using Oshocks Junior Bike Shop, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
          </p>
          <p className="text-xs text-gray-500">
            Last updated: {lastUpdated} | Effective date: {effectiveDate}
          </p>
        </div>
      </div>

      {/* Floating Help Button */}
      <div className="fixed bottom-6 right-4 sm:right-6 z-50">
        <button className="bg-gradient-to-br from-blue-600 to-green-600 text-white p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 group">
          <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-40 bg-white text-gray-700 p-2.5 sm:p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 border-2 border-gray-200"
        aria-label="Scroll to top"
      >
        <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  );
}