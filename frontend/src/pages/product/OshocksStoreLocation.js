import { useState } from 'react';
import { MapPin, Clock, Phone, Mail, Navigation, Car, Bus, Train, MessageCircle, Calendar, CheckCircle, Star, Users, Package, Wrench, Shield, Award, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

const StoreLocation = () => {
  const [selectedStore, setSelectedStore] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Store locations data
  const stores = [
    {
      id: 1,
      name: 'Oshocks Junior Bike Shop - Nairobi Main',
      type: 'Flagship Store',
      address: 'Moi Avenue, Nairobi CBD',
      fullAddress: 'Building 45, Moi Avenue, Near Kenya National Archives, Nairobi, Kenya',
      city: 'Nairobi',
      phone: '+254 700 123 456',
      whatsapp: '+254 700 123 456',
      email: 'nairobi@oshocksjunior.co.ke',
      coordinates: { lat: -1.2864, lng: 36.8172 },
      image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600',
      hours: {
        monday: '8:00 AM - 7:00 PM',
        tuesday: '8:00 AM - 7:00 PM',
        wednesday: '8:00 AM - 7:00 PM',
        thursday: '8:00 AM - 7:00 PM',
        friday: '8:00 AM - 8:00 PM',
        saturday: '9:00 AM - 8:00 PM',
        sunday: '10:00 AM - 6:00 PM'
      },
      services: [
        'Complete Bicycle Sales',
        'Professional Bike Fitting',
        'Repair & Maintenance',
        'Custom Bike Building',
        'Test Rides Available',
        'Trade-in Program',
        'Bike Rental Service',
        'Parts & Accessories'
      ],
      features: [
        'Over 200 bikes in stock',
        'Expert mechanics on-site',
        'Free bike check-up',
        'Parking available',
        'Wheelchair accessible',
        'Kids play area'
      ],
      payment: ['Cash', 'M-Pesa', 'Card', 'Bank Transfer'],
      transportation: {
        matatu: 'Route 46, 33, 111 - Stop at Kenya National Archives',
        bus: 'City Hoppa Bus 19, 23 - Moi Avenue stop',
        uber: 'Set destination to "Oshocks Junior - Moi Avenue"',
        parking: 'Street parking available, paid parking 100m away'
      },
      manager: 'John Kamau',
      rating: 4.8,
      reviews: 342,
      isOpen: true
    },
    {
      id: 2,
      name: 'Oshocks Junior - Westlands Branch',
      type: 'Branch Store',
      address: 'Westlands, Nairobi',
      fullAddress: 'Sarit Centre, 3rd Floor, Shop 312, Westlands, Nairobi, Kenya',
      city: 'Nairobi',
      phone: '+254 700 654 321',
      whatsapp: '+254 700 654 321',
      email: 'westlands@oshocksjunior.co.ke',
      coordinates: { lat: -1.2649, lng: 36.8061 },
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600',
      hours: {
        monday: '10:00 AM - 8:00 PM',
        tuesday: '10:00 AM - 8:00 PM',
        wednesday: '10:00 AM - 8:00 PM',
        thursday: '10:00 AM - 8:00 PM',
        friday: '10:00 AM - 9:00 PM',
        saturday: '10:00 AM - 9:00 PM',
        sunday: '11:00 AM - 7:00 PM'
      },
      services: [
        'Bicycle Sales',
        'Bike Fitting',
        'Basic Repairs',
        'Accessories Shop',
        'Test Rides',
        'Online Order Pickup'
      ],
      features: [
        '100+ bikes on display',
        'Mall convenience',
        'Ample parking',
        'Food court nearby',
        'ATM available'
      ],
      payment: ['Cash', 'M-Pesa', 'Card'],
      transportation: {
        matatu: 'Route 23, 44 - Sarit Centre stop',
        bus: 'City Hoppa to Westlands',
        uber: 'Set destination to "Sarit Centre"',
        parking: 'Free parking at Sarit Centre for 3 hours'
      },
      manager: 'Jane Wanjiku',
      rating: 4.7,
      reviews: 198,
      isOpen: true
    },
    {
      id: 3,
      name: 'Oshocks Junior - Karen Outlet',
      type: 'Outlet Store',
      address: 'Karen, Nairobi',
      fullAddress: 'Karen Shopping Centre, Ground Floor, Karen Road, Nairobi, Kenya',
      city: 'Nairobi',
      phone: '+254 700 789 012',
      whatsapp: '+254 700 789 012',
      email: 'karen@oshocksjunior.co.ke',
      coordinates: { lat: -1.3197, lng: 36.7076 },
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600',
      hours: {
        monday: '9:00 AM - 6:00 PM',
        tuesday: '9:00 AM - 6:00 PM',
        wednesday: '9:00 AM - 6:00 PM',
        thursday: '9:00 AM - 6:00 PM',
        friday: '9:00 AM - 7:00 PM',
        saturday: '9:00 AM - 7:00 PM',
        sunday: 'Closed'
      },
      services: [
        'Premium Bike Sales',
        'Professional Bike Fitting',
        'Advanced Repairs',
        'Custom Orders',
        'Test Rides'
      ],
      features: [
        'Specialized in high-end bikes',
        'Quiet neighborhood location',
        'Free parking',
        'By appointment available'
      ],
      payment: ['Cash', 'M-Pesa', 'Card', 'Bank Transfer'],
      transportation: {
        matatu: 'Route 111 - Karen stop',
        uber: 'Set destination to "Karen Shopping Centre"',
        parking: 'Free parking available'
      },
      manager: 'David Omondi',
      rating: 4.9,
      reviews: 156,
      isOpen: true
    }
  ];

  const faqs = [
    {
      question: 'Do I need an appointment to visit?',
      answer: 'No appointment necessary! Walk-ins are welcome during business hours. However, for bike fitting sessions or consultations, we recommend booking ahead to ensure dedicated time with our experts.'
    },
    {
      question: 'Can I test ride bikes before purchasing?',
      answer: 'Absolutely! All our stores offer free test rides. Bring a valid ID and our staff will help you test ride different models to find your perfect match.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept Cash, M-Pesa, Credit/Debit Cards (Visa, Mastercard), and Bank Transfers. Some locations also offer installment payment plans.'
    },
    {
      question: 'Do you offer bike repair services?',
      answer: 'Yes! Our main store in Nairobi CBD offers comprehensive repair and maintenance services. Minor repairs can be done while you wait, while major work may take 1-3 days.'
    },
    {
      question: 'Can I order online and pick up in-store?',
      answer: 'Yes! Order through our website and select "Store Pickup" at checkout. We\'ll notify you when your order is ready for collection at your chosen location.'
    },
    {
      question: 'Do you buy used bikes?',
      answer: 'Yes, we have a trade-in program at our Nairobi Main store. Bring your bike for evaluation and get credit towards a new purchase.'
    }
  ];

  const getCurrentDay = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  };

  const store = stores[selectedStore];
  const currentDay = getCurrentDay();

  const openGoogleMaps = (lat, lng) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  };

  const openWhatsApp = (phone) => {
    window.open(`https://wa.me/${phone.replace(/\s+/g, '')}`, '_blank');
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Visit Our Stores</h1>
          <p className="text-xl opacity-90">Experience quality cycling products in person</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Store Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stores.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setSelectedStore(idx)}
              className={`text-left p-4 rounded-lg border-2 transition-all ${
                selectedStore === idx
                  ? 'border-orange-600 bg-orange-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-orange-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{s.name}</h3>
                  <span className="inline-block text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-medium">
                    {s.type}
                  </span>
                </div>
                {s.isOpen && (
                  <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                    Open
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                <MapPin className="w-4 h-4" />
                <span>{s.address}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(s.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-600">{s.rating} ({s.reviews} reviews)</span>
              </div>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Store Image & Quick Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Store Image */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={store.image}
                alt={store.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-4">
                <h2 className="text-2xl font-bold mb-2">{store.name}</h2>
                <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{store.fullAddress}</span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(store.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{store.rating}</span>
                  <span className="text-sm text-gray-500">({store.reviews} reviews)</span>
                </div>
                <button
                  onClick={() => openGoogleMaps(store.coordinates.lat, store.coordinates.lng)}
                  className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Navigation className="w-5 h-5" />
                  Get Directions
                </button>
              </div>
            </div>

            {/* Quick Contact */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-bold text-lg mb-4">Quick Contact</h3>
              <div className="space-y-3">
                <a
                  href={`tel:${store.phone}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="bg-orange-100 p-2 rounded-full">
                    <Phone className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-medium">{store.phone}</p>
                  </div>
                </a>

                <button
                  onClick={() => openWhatsApp(store.whatsapp)}
                  className="w-full flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="bg-green-500 p-2 rounded-full">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-500">WhatsApp</p>
                    <p className="font-medium">{store.whatsapp}</p>
                  </div>
                </button>

                <a
                  href={`mailto:${store.email}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium text-sm">{store.email}</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Store Manager */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-bold text-lg mb-3">Store Manager</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {store.manager.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{store.manager}</p>
                  <p className="text-sm text-gray-500">Available to assist you</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="flex border-b overflow-x-auto">
                {[
                  { id: 'overview', label: 'Overview', icon: MapPin },
                  { id: 'hours', label: 'Hours', icon: Clock },
                  { id: 'services', label: 'Services', icon: Wrench },
                  { id: 'transportation', label: 'How to Reach', icon: Car }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-b-2 border-orange-600 text-orange-600 bg-orange-50'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-bold text-xl mb-4">Store Features</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {store.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-xl mb-4">Payment Methods</h3>
                      <div className="flex flex-wrap gap-2">
                        {store.payment.map((method, idx) => (
                          <span
                            key={idx}
                            className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium"
                          >
                            {method}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-semibold text-blue-900 mb-2">COVID-19 Safety Measures</h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Sanitization stations available</li>
                            <li>• Regular store cleaning</li>
                            <li>• Contactless payment options</li>
                            <li>• Social distancing maintained</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hours Tab */}
                {activeTab === 'hours' && (
                  <div>
                    <h3 className="font-bold text-xl mb-4">Opening Hours</h3>
                    <div className="space-y-2">
                      {Object.entries(store.hours).map(([day, hours]) => (
                        <div
                          key={day}
                          className={`flex justify-between items-center p-3 rounded-lg ${
                            day === currentDay
                              ? 'bg-orange-50 border-2 border-orange-200'
                              : 'bg-gray-50'
                          }`}
                        >
                          <span className={`font-medium capitalize ${
                            day === currentDay ? 'text-orange-600' : ''
                          }`}>
                            {day}
                            {day === currentDay && (
                              <span className="ml-2 text-xs bg-orange-600 text-white px-2 py-1 rounded">
                                Today
                              </span>
                            )}
                          </span>
                          <span className={day === currentDay ? 'font-semibold text-orange-600' : ''}>
                            {hours}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-yellow-900 mb-1">Special Hours</p>
                          <p className="text-sm text-yellow-800">
                            Hours may vary during public holidays. Please call ahead to confirm.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Services Tab */}
                {activeTab === 'services' && (
                  <div>
                    <h3 className="font-bold text-xl mb-4">Available Services</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {store.services.map((service, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200"
                        >
                          <div className="bg-orange-600 p-2 rounded-full flex-shrink-0">
                            <Wrench className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1">{service}</h4>
                            <p className="text-xs text-gray-600">Available at this location</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Award className="w-6 h-6 text-green-600 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-green-900 mb-2">Expert Staff</h4>
                          <p className="text-sm text-green-800">
                            Our certified mechanics have over 50 years of combined experience in bicycle repair and maintenance.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Transportation Tab */}
                {activeTab === 'transportation' && (
                  <div>
                    <h3 className="font-bold text-xl mb-4">How to Reach Us</h3>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Bus className="w-6 h-6 text-blue-600" />
                          <h4 className="font-semibold">Matatu</h4>
                        </div>
                        <p className="text-sm text-gray-700">{store.transportation.matatu}</p>
                      </div>

                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Train className="w-6 h-6 text-green-600" />
                          <h4 className="font-semibold">Bus</h4>
                        </div>
                        <p className="text-sm text-gray-700">{store.transportation.bus}</p>
                      </div>

                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Car className="w-6 h-6 text-orange-600" />
                          <h4 className="font-semibold">Uber / Taxi</h4>
                        </div>
                        <p className="text-sm text-gray-700">{store.transportation.uber}</p>
                      </div>

                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Car className="w-6 h-6 text-purple-600" />
                          <h4 className="font-semibold">Parking</h4>
                        </div>
                        <p className="text-sm text-gray-700">{store.transportation.parking}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => openGoogleMaps(store.coordinates.lat, store.coordinates.lng)}
                      className="w-full mt-6 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Open in Google Maps
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* FAQs */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-xl mb-4">Frequently Asked Questions</h3>
              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-medium text-left">{faq.question}</span>
                      {expandedFaq === idx ? (
                        <ChevronUp className="w-5 h-5 text-gray-600 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0" />
                      )}
                    </button>
                    {expandedFaq === idx && (
                      <div className="p-4 bg-white border-t">
                        <p className="text-gray-700">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-12 px-4 mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Can't Visit in Person?</h2>
          <p className="text-xl mb-6 opacity-90">
            Shop online and get your products delivered to your doorstep!
          </p>
          <button className="bg-white text-orange-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-lg">
            Shop Online Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreLocation;