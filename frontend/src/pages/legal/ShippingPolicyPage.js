import { useState, useEffect } from 'react';
import { Truck, Package, MapPin, Clock, DollarSign, Shield, AlertTriangle, CheckCircle, XCircle, Info, Search, ChevronDown, ChevronUp, Phone, Mail, MessageSquare, Download, Printer, Share2, Calendar, Map, Navigation, Box, Archive, Star, Zap, Globe, ArrowRight, FileText } from 'lucide-react';

export default function ShippingPolicyPage() {
  const [expandedSections, setExpandedSections] = useState({ overview: true });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('nairobi-cbd');
  const [estimatedWeight, setEstimatedWeight] = useState('');
  const [calculatorResult, setCalculatorResult] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  const lastUpdated = "October 11, 2025";

  // Handle scroll to show/hide search and filter bar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show search bar when scrolling up, hide when scrolling down
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

  const calculateShipping = () => {
    const weight = parseFloat(estimatedWeight);
    if (isNaN(weight) || weight <= 0) {
      setCalculatorResult({ error: 'Please enter a valid weight' });
      return;
    }

    const zones = {
      'nairobi-cbd': { name: 'Nairobi CBD', base: 200, perKg: 50, days: '1-2' },
      'nairobi-suburbs': { name: 'Nairobi Suburbs', base: 300, perKg: 60, days: '2-3' },
      'major-cities': { name: 'Major Cities', base: 500, perKg: 80, days: '3-5' },
      'rural': { name: 'Rural Areas', base: 800, perKg: 100, days: '5-7' }
    };

    const zone = zones[selectedZone];
    let cost = zone.base;
    
    if (weight > 5) {
      cost += (weight - 5) * zone.perKg;
    }

    const isFreeEligible = (selectedZone === 'nairobi-cbd' || selectedZone === 'nairobi-suburbs');

    setCalculatorResult({
      cost: cost.toFixed(0),
      zone: zone.name,
      deliveryDays: zone.days,
      weight: weight,
      freeShippingThreshold: isFreeEligible ? 10000 : null
    });
  };

  const shippingZones = [
    { 
      id: 'nairobi-cbd', 
      name: 'Nairobi CBD', 
      time: '1-2 business days', 
      cost: 'KES 200',
      icon: MapPin,
      color: 'green',
      description: 'Central Business District and surrounding areas'
    },
    { 
      id: 'nairobi-suburbs', 
      name: 'Nairobi Suburbs', 
      time: '2-3 business days', 
      cost: 'KES 300',
      icon: MapPin,
      color: 'blue',
      description: 'Residential areas around Nairobi'
    },
    { 
      id: 'major-cities', 
      name: 'Major Cities', 
      time: '3-5 business days', 
      cost: 'KES 500',
      icon: Globe,
      color: 'purple',
      description: 'Mombasa, Kisumu, Nakuru, Eldoret, etc.'
    },
    { 
      id: 'rural', 
      name: 'Rural Areas', 
      time: '5-7 business days', 
      cost: 'KES 800',
      icon: Map,
      color: 'orange',
      description: 'Remote and rural locations'
    }
  ];

  const sections = [
    {
      id: 'overview',
      icon: Truck,
      title: '1. Shipping Overview',
      category: 'general',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            At Oshocks Junior Bike Shop, we're committed to delivering your cycling products safely and efficiently across Kenya. 
            This Shipping Policy outlines our delivery methods, timeframes, costs, and what you can expect when ordering from us.
          </p>

          <div className="bg-gradient-to-r from-blue-50 to-green-50 border-l-4 border-blue-500 p-5 rounded-r-lg">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-blue-600" />
              What We Offer
            </h4>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-white/70 p-3 rounded flex items-start gap-2">
                <Truck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Nationwide Delivery</p>
                  <p className="text-xs text-gray-700">We ship to all major cities and rural areas in Kenya</p>
                </div>
              </div>
              <div className="bg-white/70 p-3 rounded flex items-start gap-2">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Fast Processing</p>
                  <p className="text-xs text-gray-700">Orders processed within 24 hours on business days</p>
                </div>
              </div>
              <div className="bg-white/70 p-3 rounded flex items-start gap-2">
                <Shield className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Secure Packaging</p>
                  <p className="text-xs text-gray-700">Professional packaging to protect your items</p>
                </div>
              </div>
              <div className="bg-white/70 p-3 rounded flex items-start gap-2">
                <Navigation className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Real-Time Tracking</p>
                  <p className="text-xs text-gray-700">Track your order from dispatch to delivery</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-5 rounded-lg border-2 border-green-200">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-green-600" />
              Free Shipping Available!
            </h4>
            <p className="text-sm text-gray-700 mb-2">
              Enjoy <strong>FREE standard shipping</strong> on orders over <strong>KES 10,000</strong> within Nairobi (CBD and Suburbs).
            </p>
            <p className="text-xs text-gray-600">
              Offer applies to standard delivery only. Express delivery charges still apply.
            </p>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Info className="w-5 h-5 text-amber-600" />
              Important Notice
            </h4>
            <p className="text-sm text-gray-700">
              Delivery times are estimates and may vary due to factors beyond our control, including weather conditions, 
              courier delays, public holidays, or security situations. We'll keep you informed of any delays.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'zones',
      icon: MapPin,
      title: '2. Delivery Zones & Rates',
      category: 'rates',
      content: (
        <div className="space-y-6">
          <p className="text-gray-700">
            We've divided Kenya into four shipping zones based on location and accessibility. 
            Shipping costs and delivery times vary by zone.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {shippingZones.map((zone) => {
              const Icon = zone.icon;
              
              return (
                <div 
                  key={zone.id}
                  className={`bg-gradient-to-br from-${zone.color}-50 to-${zone.color}-100 p-5 rounded-lg border-2 border-${zone.color}-300 hover:shadow-lg transition-all`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`bg-${zone.color}-600 p-3 rounded-lg shadow-md`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{zone.name}</h4>
                      <p className="text-xs text-gray-600">{zone.description}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between bg-white/70 p-2 rounded">
                      <span className="text-gray-700 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Delivery Time:
                      </span>
                      <span className="font-semibold text-gray-900">{zone.time}</span>
                    </div>
                    <div className="flex items-center justify-between bg-white/70 p-2 rounded">
                      <span className="text-gray-700 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Starting From:
                      </span>
                      <span className="font-semibold text-green-600">{zone.cost}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-blue-50 p-5 rounded-lg border-2 border-blue-200">
            <h4 className="font-semibold text-gray-900 mb-3">Detailed Shipping Rates Table</h4>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full border-collapse bg-white text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
                    <th className="px-4 py-3 text-left font-semibold">Zone</th>
                    <th className="px-4 py-3 text-left font-semibold">Standard (0-5kg)</th>
                    <th className="px-4 py-3 text-left font-semibold">Per Additional Kg</th>
                    <th className="px-4 py-3 text-left font-semibold">Express</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold">Nairobi CBD</td>
                    <td className="px-4 py-3 text-green-600 font-semibold">KES 200</td>
                    <td className="px-4 py-3">+KES 50</td>
                    <td className="px-4 py-3">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">Yes (+500)</span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold">Nairobi Suburbs</td>
                    <td className="px-4 py-3 text-blue-600 font-semibold">KES 300</td>
                    <td className="px-4 py-3">+KES 60</td>
                    <td className="px-4 py-3">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">Yes (+600)</span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold">Major Cities</td>
                    <td className="px-4 py-3 text-purple-600 font-semibold">KES 500</td>
                    <td className="px-4 py-3">+KES 80</td>
                    <td className="px-4 py-3">
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-semibold">Limited</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold">Rural Areas</td>
                    <td className="px-4 py-3 text-orange-600 font-semibold">KES 800</td>
                    <td className="px-4 py-3">+KES 100</td>
                    <td className="px-4 py-3">
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold">No</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-purple-50 p-5 rounded-lg border-l-4 border-purple-500">
            <h4 className="font-semibold text-gray-900 mb-3">Zone Coverage Details</h4>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded">
                <p className="font-semibold text-gray-900 mb-1">Nairobi CBD:</p>
                <p className="text-sm text-gray-700">City Centre, Upperhill, Westlands, Parklands, Kilimani, Lavington</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="font-semibold text-gray-900 mb-1">Nairobi Suburbs:</p>
                <p className="text-sm text-gray-700">Kasarani, Embakasi, Ngong, Karen, Langata, Donholm, South B/C, Rongai</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="font-semibold text-gray-900 mb-1">Major Cities:</p>
                <p className="text-sm text-gray-700">Mombasa, Kisumu, Nakuru, Eldoret, Thika, Machakos, Nyeri, Meru, Kisii</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="font-semibold text-gray-900 mb-1">Rural Areas:</p>
                <p className="text-sm text-gray-700">All other locations not listed above</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'calculator',
      icon: DollarSign,
      title: '3. Shipping Cost Calculator',
      category: 'tools',
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-blue-600" />
              Estimate Your Shipping Cost
            </h4>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Delivery Zone
                </label>
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {shippingZones.map(zone => (
                    <option key={zone.id} value={zone.id}>{zone.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Estimated Weight (kg)
                </label>
                <input
                  type="number"
                  value={estimatedWeight}
                  onChange={(e) => setEstimatedWeight(e.target.value)}
                  placeholder="e.g., 8"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <button
              onClick={calculateShipping}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 rounded-lg font-bold hover:from-blue-700 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
            >
              Calculate Shipping Cost
            </button>
            
            {calculatorResult && (
              <div className="mt-6">
                {calculatorResult.error ? (
                  <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-r-lg">
                    <p className="text-red-700 font-semibold">{calculatorResult.error}</p>
                  </div>
                ) : (
                  <div className="bg-white p-5 rounded-lg shadow-md border-2 border-green-300">
                    <h5 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      Shipping Estimate
                    </h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded">
                        <p className="text-sm text-gray-600 mb-1">Delivery Zone</p>
                        <p className="text-lg font-bold text-gray-900">{calculatorResult.zone}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded">
                        <p className="text-sm text-gray-600 mb-1">Shipping Cost</p>
                        <p className="text-2xl font-bold text-green-600">KES {calculatorResult.cost}</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded">
                        <p className="text-sm text-gray-600 mb-1">Package Weight</p>
                        <p className="text-lg font-bold text-gray-900">{calculatorResult.weight} kg</p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded">
                        <p className="text-sm text-gray-600 mb-1">Estimated Delivery</p>
                        <p className="text-lg font-bold text-gray-900">{calculatorResult.deliveryDays} days</p>
                      </div>
                    </div>
                    
                    {calculatorResult.freeShippingThreshold && (
                      <div className="mt-4 bg-gradient-to-r from-green-100 to-blue-100 p-4 rounded-lg border-2 border-green-300">
                        <p className="text-sm text-gray-700">
                          <strong>💡 Tip:</strong> Orders over <strong>KES {calculatorResult.freeShippingThreshold.toLocaleString()}</strong> qualify for FREE shipping in your zone!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-semibold text-gray-900 mb-2">Weight Guidelines</h5>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• <strong>Accessories:</strong> 0.5 - 2 kg</li>
              <li>• <strong>Bike parts:</strong> 1 - 5 kg</li>
              <li>• <strong>Complete bicycles:</strong> 10 - 20 kg</li>
              <li>• <strong>E-bikes:</strong> 20 - 30 kg</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'contact',
      icon: MessageSquare,
      title: '4. Shipping Support',
      category: 'support',
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 border-l-4 border-blue-500 p-5 rounded-r-lg">
            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              Need Shipping Help?
            </h4>
            <p className="text-sm text-gray-700">
              Our shipping support team is here to assist with tracking, delivery issues, or any shipping-related questions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-600 p-3 rounded-lg">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h5 className="font-bold text-gray-900">Phone Support</h5>
                  <p className="text-xs text-gray-600">Mon-Sat: 9 AM - 6 PM EAT</p>
                </div>
              </div>
              <a href="tel:+254712345678" className="text-lg font-bold text-green-600 hover:underline block mb-2">
                +254 712 345 678
              </a>
              <p className="text-xs text-gray-600">Toll-free within Kenya</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-600 p-3 rounded-lg">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h5 className="font-bold text-gray-900">Email Support</h5>
                  <p className="text-xs text-gray-600">Response within 24 hours</p>
                </div>
              </div>
              <a href="mailto:shipping@oshocksjunior.co.ke" className="text-blue-600 hover:underline font-semibold block mb-2">
                shipping@oshocksjunior.co.ke
              </a>
              <p className="text-xs text-gray-600">Include order number for faster service</p>
            </div>
          </div>

          <div className="bg-gray-50 p-5 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Store Location - Pickup Available</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">Physical Address</h5>
                <div className="text-sm text-gray-700 space-y-1">
                  <p className="font-semibold text-blue-600">Oshocks Junior Bike Shop</p>
                  <p>Nairobi, Kenya</p>
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <p className="font-semibold mb-1">Store Hours:</p>
                    <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p>Saturday: 9:00 AM - 4:00 PM</p>
                    <p className="text-red-600 font-semibold">Sunday: Closed</p>
                  </div>
                </div>
              </div>
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">What to Bring for Pickup</h5>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Order confirmation email</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Valid photo ID</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Pickup notification</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const filteredSections = sections.filter(section => {
    const matchesSearch = searchQuery === '' || 
      section.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || section.category === activeTab;
    return matchesSearch && matchesTab;
  });

  const tabs = [
    { id: 'all', label: 'All Sections', count: sections.length },
    { id: 'general', label: 'General Info', count: sections.filter(s => s.category === 'general').length },
    { id: 'rates', label: 'Rates & Zones', count: sections.filter(s => s.category === 'rates').length },
    { id: 'tools', label: 'Tools', count: sections.filter(s => s.category === 'tools').length },
    { id: 'support', label: 'Support', count: sections.filter(s => s.category === 'support').length }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
      {/* Header - will scroll under navbar */}
      <div className="bg-white shadow-lg mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Content Sections */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-green-600 p-3 rounded-lg shadow-lg">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Shipping Policy</h1>
                <p className="text-gray-600">Oshocks Junior Bike Shop - Delivery Information</p>
              </div>
            </div>
            <div className="hidden md:flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                <span className="text-sm">Download</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Printer className="w-4 h-4" />
                <span className="text-sm">Print</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Last Updated: {lastUpdated}</span>
            </div>
            <div className="flex items-center gap-2 text-green-600 font-semibold">
              <CheckCircle className="w-4 h-4" />
              <span>Free Shipping Over KES 10,000</span>
            </div>
            <div className="flex items-center gap-2 text-blue-600 font-semibold">
              <Truck className="w-4 h-4" />
              <span>Nationwide Delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Tabs - Sticky below navbar */}
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
                  placeholder="Search shipping policy..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={expandAll}
                  className="flex-1 lg:flex-none px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <ChevronDown className="w-4 h-4" />
                  <span className="hidden sm:inline">Expand All</span>
                  <span className="sm:hidden">Expand</span>
                </button>
                <button
                  onClick={collapseAll}
                  className="flex-1 lg:flex-none px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-semibold flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <ChevronUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Collapse All</span>
                  <span className="sm:hidden">Collapse</span>
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all text-xs sm:text-sm ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  {' '}({tab.count})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
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
                    className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-blue-100 to-green-100 p-3 rounded-lg">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 text-left">
                        {section.title}
                      </h2>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-6 text-gray-700 leading-relaxed">
                      {section.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Results Found</h3>
            <p className="text-gray-600 mb-4">
              We couldn't find any sections matching "{searchQuery}"
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveTab('all');
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-br from-blue-600 to-green-600 p-6 sm:p-8 rounded-lg shadow-xl text-white">
          <div className="text-center">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">Need Shipping Assistance?</h3>
            <p className="mb-4 sm:mb-6 text-blue-100 max-w-2xl mx-auto text-sm sm:text-base">
              Our shipping support team is ready to help with tracking, delivery questions, or any shipping concerns.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button className="bg-white text-blue-600 px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors shadow-md flex items-center justify-center gap-2 text-sm sm:text-base">
                <Navigation className="w-4 h-4 sm:w-5 sm:h-5" />
                Track My Order
              </button>
              <button className="bg-blue-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-bold hover:bg-blue-800 transition-colors shadow-md border-2 border-white flex items-center justify-center gap-2 text-sm sm:text-base">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                Contact Support
              </button>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <h4 className="font-bold text-gray-900 text-sm sm:text-base">Returns Policy</h4>
            </div>
            <p className="text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4">
              Learn about our return process and refund timelines.
            </p>
            <a href="/refund-policy" className="text-blue-600 hover:underline font-semibold text-xs sm:text-sm flex items-center gap-1">
              Read More <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </a>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <h4 className="font-bold text-gray-900 text-sm sm:text-base">Terms & Conditions</h4>
            </div>
            <p className="text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4">
              Review our complete terms of service and policies.
            </p>
            <a href="/terms-of-service" className="text-green-600 hover:underline font-semibold text-xs sm:text-sm flex items-center gap-1">
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
              Get help with your orders and shipping questions.
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
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </a>
        </div>

        {/* Footer Note */}
        <div className="mt-8 bg-gray-100 p-4 sm:p-6 rounded-lg text-center">
          <p className="text-xs sm:text-sm text-gray-600 mb-2">
            Questions about shipping? Our support team is available Monday to Saturday, 9 AM - 6 PM EAT.
          </p>
          <p className="text-xs text-gray-500">
            Last updated: {lastUpdated} | All shipping times are estimates and may vary.
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