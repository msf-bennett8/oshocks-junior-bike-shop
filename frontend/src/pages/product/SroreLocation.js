import { useState, useEffect } from 'react';
import { MapPin, Clock, Phone, Mail, Navigation, Car, Bus, Train, MessageCircle, Calendar, CheckCircle, Star, Users, Package, Wrench, Shield, Award, ExternalLink, ChevronDown, ChevronUp, Search, Filter, ShoppingBag, TrendingUp, Bike } from 'lucide-react';

const StoreLocation = () => {
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCity, setFilterCity] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Sellers/Vendors data with their locations and products
  const sellers = [
    {
      id: 1,
      businessName: 'Oshocks Junior Bike Shop',
      sellerType: 'Premium Seller',
      ownerName: 'John Kamau',
      description: 'Leading bicycle retailer in Kenya with over 10 years of experience',
      address: 'Moi Avenue, Nairobi CBD',
      fullAddress: 'Building 45, Moi Avenue, Near Kenya National Archives, Nairobi, Kenya',
      city: 'Nairobi',
      county: 'Nairobi',
      phone: '+254 700 123 456',
      whatsapp: '+254 700 123 456',
      email: 'info@oshocksjunior.co.ke',
      website: 'www.oshocksjunior.co.ke',
      coordinates: { lat: -1.2864, lng: 36.8172 },
      image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600',
      storefront: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
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
      categories: ['Bicycles', 'Accessories', 'Spare Parts', 'Gear'],
      productCount: 487,
      totalSales: 2456,
      rating: 4.8,
      reviews: 342,
      joinedDate: 'January 2020',
      verified: true,
      responseTime: '< 1 hour',
      deliveryOptions: ['Pickup', 'Local Delivery', 'Nationwide Shipping'],
      payment: ['Cash', 'M-Pesa', 'Card', 'Bank Transfer'],
      isPhysicalStore: true,
      hasOnlineStore: true
    },
    {
      id: 2,
      businessName: 'CycleHub Westlands',
      sellerType: 'Verified Seller',
      ownerName: 'Jane Wanjiku',
      description: 'Your neighborhood cycling accessories specialist',
      address: 'Sarit Centre, Westlands',
      fullAddress: 'Sarit Centre, 3rd Floor, Shop 312, Westlands, Nairobi, Kenya',
      city: 'Nairobi',
      county: 'Nairobi',
      phone: '+254 700 654 321',
      whatsapp: '+254 700 654 321',
      email: 'contact@cyclehub.co.ke',
      website: 'www.cyclehub.co.ke',
      coordinates: { lat: -1.2649, lng: 36.8061 },
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600',
      storefront: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400',
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
        'Bicycle Accessories',
        'Bike Fitting',
        'Basic Repairs',
        'Online Order Pickup'
      ],
      categories: ['Accessories', 'Gear', 'Spare Parts'],
      productCount: 234,
      totalSales: 1823,
      rating: 4.7,
      reviews: 198,
      joinedDate: 'June 2021',
      verified: true,
      responseTime: '< 2 hours',
      deliveryOptions: ['Pickup', 'Local Delivery'],
      payment: ['Cash', 'M-Pesa', 'Card'],
      isPhysicalStore: true,
      hasOnlineStore: true
    },
    {
      id: 3,
      businessName: 'Mombasa Bike Traders',
      sellerType: 'Verified Seller',
      ownerName: 'Ahmed Hassan',
      description: 'Coastal Kenya\'s premier bicycle destination',
      address: 'Nyali, Mombasa',
      fullAddress: 'Nyali Cinemax Mall, Ground Floor, Mombasa, Kenya',
      city: 'Mombasa',
      county: 'Mombasa',
      phone: '+254 700 111 222',
      whatsapp: '+254 700 111 222',
      email: 'sales@mombasabikes.co.ke',
      website: null,
      coordinates: { lat: -4.0435, lng: 39.6682 },
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600',
      storefront: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400',
      hours: {
        monday: '9:00 AM - 7:00 PM',
        tuesday: '9:00 AM - 7:00 PM',
        wednesday: '9:00 AM - 7:00 PM',
        thursday: '9:00 AM - 7:00 PM',
        friday: '9:00 AM - 8:00 PM',
        saturday: '9:00 AM - 8:00 PM',
        sunday: '10:00 AM - 6:00 PM'
      },
      services: [
        'Bicycle Sales',
        'Repairs',
        'Parts Supply',
        'Beach Cruiser Specialist'
      ],
      categories: ['Bicycles', 'Accessories'],
      productCount: 156,
      totalSales: 892,
      rating: 4.6,
      reviews: 127,
      joinedDate: 'March 2022',
      verified: true,
      responseTime: '< 3 hours',
      deliveryOptions: ['Pickup', 'Coastal Region Delivery'],
      payment: ['Cash', 'M-Pesa', 'Card'],
      isPhysicalStore: true,
      hasOnlineStore: true
    },
    {
      id: 4,
      businessName: 'SpeedGear Kenya',
      sellerType: 'Online Seller',
      ownerName: 'David Omondi',
      description: 'Premium cycling gear and accessories - Online only',
      address: 'Karen, Nairobi',
      fullAddress: 'Karen, Nairobi (Warehouse - Online Orders Only)',
      city: 'Nairobi',
      county: 'Nairobi',
      phone: '+254 700 333 444',
      whatsapp: '+254 700 333 444',
      email: 'orders@speedgear.co.ke',
      website: 'www.speedgear.co.ke',
      coordinates: { lat: -1.3197, lng: 36.7076 },
      image: 'https://images.unsplash.com/photo-1558617142-cd295c68f95e?w=600',
      storefront: 'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?w=400',
      hours: {
        monday: 'Online 24/7 - Order Processing 9AM-6PM',
        tuesday: 'Online 24/7 - Order Processing 9AM-6PM',
        wednesday: 'Online 24/7 - Order Processing 9AM-6PM',
        thursday: 'Online 24/7 - Order Processing 9AM-6PM',
        friday: 'Online 24/7 - Order Processing 9AM-6PM',
        saturday: 'Online 24/7 - Order Processing 10AM-4PM',
        sunday: 'Online 24/7 - No Processing'
      },
      services: [
        'Online Shopping',
        'Fast Delivery',
        'Returns & Exchanges',
        'Bulk Orders'
      ],
      categories: ['Gear', 'Accessories'],
      productCount: 312,
      totalSales: 1654,
      rating: 4.9,
      reviews: 267,
      joinedDate: 'August 2021',
      verified: true,
      responseTime: '< 30 mins',
      deliveryOptions: ['Nationwide Shipping', 'Express Delivery'],
      payment: ['M-Pesa', 'Card', 'Bank Transfer'],
      isPhysicalStore: false,
      hasOnlineStore: true
    },
    {
      id: 5,
      businessName: 'Nakuru Cycle World',
      sellerType: 'Verified Seller',
      ownerName: 'Peter Kariuki',
      description: 'Rift Valley\'s trusted bicycle shop',
      address: 'Nakuru Town',
      fullAddress: 'Kenyatta Avenue, Opposite Nakuru Law Courts, Nakuru, Kenya',
      city: 'Nakuru',
      county: 'Nakuru',
      phone: '+254 700 555 666',
      whatsapp: '+254 700 555 666',
      email: 'info@nakurucycles.co.ke',
      website: null,
      coordinates: { lat: -0.2827, lng: 36.0800 },
      image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600',
      storefront: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      hours: {
        monday: '8:00 AM - 6:00 PM',
        tuesday: '8:00 AM - 6:00 PM',
        wednesday: '8:00 AM - 6:00 PM',
        thursday: '8:00 AM - 6:00 PM',
        friday: '8:00 AM - 7:00 PM',
        saturday: '8:00 AM - 7:00 PM',
        sunday: 'Closed'
      },
      services: [
        'Bicycle Sales',
        'Repair Services',
        'Spare Parts',
        'School Supplies'
      ],
      categories: ['Bicycles', 'Spare Parts', 'Accessories'],
      productCount: 189,
      totalSales: 743,
      rating: 4.5,
      reviews: 94,
      joinedDate: 'November 2022',
      verified: true,
      responseTime: '< 4 hours',
      deliveryOptions: ['Pickup', 'Nakuru County Delivery'],
      payment: ['Cash', 'M-Pesa'],
      isPhysicalStore: true,
      hasOnlineStore: true
    },
    {
      id: 6,
      businessName: 'Kisumu BikeHub',
      sellerType: 'Verified Seller',
      ownerName: 'Mary Achieng',
      description: 'Western Kenya\'s cycling headquarters',
      address: 'Kisumu City',
      fullAddress: 'Oginga Odinga Street, West End Mall, Kisumu, Kenya',
      city: 'Kisumu',
      county: 'Kisumu',
      phone: '+254 700 777 888',
      whatsapp: '+254 700 777 888',
      email: 'hello@kisumubikes.co.ke',
      website: 'www.kisumubikehub.co.ke',
      coordinates: { lat: -0.0917, lng: 34.7680 },
      image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=600',
      storefront: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=400',
      hours: {
        monday: '8:30 AM - 6:30 PM',
        tuesday: '8:30 AM - 6:30 PM',
        wednesday: '8:30 AM - 6:30 PM',
        thursday: '8:30 AM - 6:30 PM',
        friday: '8:30 AM - 7:00 PM',
        saturday: '9:00 AM - 7:00 PM',
        sunday: '10:00 AM - 5:00 PM'
      },
      services: [
        'Bicycle Sales',
        'Maintenance',
        'Parts & Accessories',
        'Tourist Rentals'
      ],
      categories: ['Bicycles', 'Accessories', 'Gear'],
      productCount: 167,
      totalSales: 634,
      rating: 4.6,
      reviews: 86,
      joinedDate: 'February 2023',
      verified: true,
      responseTime: '< 3 hours',
      deliveryOptions: ['Pickup', 'Kisumu County Delivery'],
      payment: ['Cash', 'M-Pesa', 'Card'],
      isPhysicalStore: true,
      hasOnlineStore: true
    }
  ];

  const cities = ['all', 'Nairobi', 'Mombasa', 'Nakuru', 'Kisumu'];
  const categories = ['all', 'Bicycles', 'Accessories', 'Spare Parts', 'Gear'];

  useEffect(() => {
    if (sellers.length > 0) {
      setSelectedSeller(sellers[0]);
    }
  }, []);

  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = seller.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         seller.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         seller.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = filterCity === 'all' || seller.city === filterCity;
    const matchesCategory = filterCategory === 'all' || seller.categories.includes(filterCategory);
    
    return matchesSearch && matchesCity && matchesCategory;
  });

  const getCurrentDay = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  };

  const openGoogleMaps = (lat, lng) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  };

  const openWhatsApp = (phone) => {
    window.open(`https://wa.me/${phone.replace(/\s+/g, '')}`, '_blank');
  };

  const viewSellerProducts = (sellerId) => {
    // Navigate to seller's product page
    console.log(`Viewing products for seller: ${sellerId}`);
    // window.location.href = `/seller/${sellerId}/products`;
  };

  if (!selectedSeller) return null;

  const currentDay = getCurrentDay();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Seller Locations</h1>
          <p className="text-xl opacity-90">Find trusted bicycle sellers near you</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by seller name, city, or owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Cities</option>
              {cities.slice(1).map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Categories</option>
              {categories.slice(1).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm text-center">
            <Users className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{sellers.length}</p>
            <p className="text-sm text-gray-600">Total Sellers</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm text-center">
            <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{cities.length - 1}</p>
            <p className="text-sm text-gray-600">Cities</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm text-center">
            <Package className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{sellers.reduce((sum, s) => sum + s.productCount, 0)}</p>
            <p className="text-sm text-gray-600">Products</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm text-center">
            <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{sellers.reduce((sum, s) => sum + s.totalSales, 0)}</p>
            <p className="text-sm text-gray-600">Total Sales</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sellers List */}
          <div className="lg:col-span-1 space-y-4 max-h-[800px] overflow-y-auto">
            {filteredSellers.map((seller) => (
              <div
                key={seller.id}
                onClick={() => setSelectedSeller(seller)}
                className={`bg-white rounded-lg p-4 cursor-pointer transition-all border-2 ${
                  selectedSeller.id === seller.id
                    ? 'border-orange-600 shadow-lg'
                    : 'border-transparent hover:border-orange-300'
                }`}
              >
                <div className="flex gap-3 mb-3">
                  <img
                    src={seller.storefront}
                    alt={seller.businessName}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold text-sm">{seller.businessName}</h3>
                      {seller.verified && (
                        <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-orange-600 font-medium mb-1">{seller.sellerType}</p>
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(seller.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-xs text-gray-600 ml-1">{seller.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                  <MapPin className="w-3 h-3" />
                  <span>{seller.city}, {seller.county}</span>
                </div>

                <div className="flex flex-wrap gap-1 mb-2">
                  {seller.categories.slice(0, 3).map((cat, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                    >
                      {cat}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">{seller.productCount} products</span>
                  <span className={`px-2 py-0.5 rounded ${
                    seller.isPhysicalStore ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {seller.isPhysicalStore ? 'Physical Store' : 'Online Only'}
                  </span>
                </div>
              </div>
            ))}

            {filteredSellers.length === 0 && (
              <div className="bg-white rounded-lg p-8 text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No sellers found</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterCity('all');
                    setFilterCategory('all');
                  }}
                  className="mt-3 text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {/* Seller Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Info Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={selectedSeller.image}
                alt={selectedSeller.businessName}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-2xl font-bold">{selectedSeller.businessName}</h2>
                      {selectedSeller.verified && (
                        <CheckCircle className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <p className="text-orange-600 font-medium mb-2">{selectedSeller.sellerType}</p>
                    <p className="text-gray-600 mb-3">{selectedSeller.description}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(selectedSeller.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-medium">{selectedSeller.rating}</span>
                      <span className="text-gray-500">({selectedSeller.reviews} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <Package className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                    <p className="text-xl font-bold">{selectedSeller.productCount}</p>
                    <p className="text-xs text-gray-600">Products</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <ShoppingBag className="w-6 h-6 text-green-600 mx-auto mb-1" />
                    <p className="text-xl font-bold">{selectedSeller.totalSales}</p>
                    <p className="text-xs text-gray-600">Total Sales</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Clock className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-sm font-bold">{selectedSeller.responseTime}</p>
                    <p className="text-xs text-gray-600">Response</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                    <p className="text-xs font-bold">{selectedSeller.joinedDate}</p>
                    <p className="text-xs text-gray-600">Member Since</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => viewSellerProducts(selectedSeller.id)}
                    className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    View Products
                  </button>
                  {selectedSeller.isPhysicalStore && (
                    <button
                      onClick={() => openGoogleMaps(selectedSeller.coordinates.lat, selectedSeller.coordinates.lng)}
                      className="bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                      <Navigation className="w-5 h-5" />
                      Directions
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Location & Contact */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-5">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  Location
                </h3>
                <p className="text-gray-700 mb-3">{selectedSeller.fullAddress}</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>City:</strong> {selectedSeller.city}</p>
                  <p><strong>County:</strong> {selectedSeller.county}</p>
                  <p><strong>Store Type:</strong> {selectedSeller.isPhysicalStore ? 'Physical Store' : 'Online Only'}</p>
                </div>
                {selectedSeller.website && (
                  <a
                    href={`https://${selectedSeller.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visit Website
                  </a>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-md p-5">
                <h3 className="font-bold text-lg mb-4">Contact Seller</h3>
                <div className="space-y-3">
                  <a
                    href={`tel:${selectedSeller.phone}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="bg-orange-100 p-2 rounded-full">
                      <Phone className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="font-medium text-sm">{selectedSeller.phone}</p>
                    </div>
                  </a>

                  <button
                    onClick={() => openWhatsApp(selectedSeller.whatsapp)}
                    className="w-full flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <div className="bg-green-500 p-2 rounded-full">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-gray-500">WhatsApp</p>
                      <p className="font-medium text-sm">{selectedSeller.whatsapp}</p>
                    </div>
                  </button>

                  <a
                    href={`mailto:${selectedSeller.email}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Mail className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium text-sm break-all">{selectedSeller.email}</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Categories & Services */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Bike className="w-5 h-5 text-orange-600" />
                    Product Categories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSeller.categories.map((cat, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm font-medium"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-orange-600" />
                    Services Offered
                  </h3>
                  <div className="space-y-2">
                    {selectedSeller.services.slice(0, 4).map((service, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{service}</span>
                      </div>
                    ))}
                    {selectedSeller.services.length > 4 && (
                      <p className="text-sm text-orange-600 font-medium">
                        +{selectedSeller.services.length - 4} more services
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Operating Hours */}
            {selectedSeller.isPhysicalStore && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  Operating Hours
                </h3>
                <div className="space-y-2">
                  {Object.entries(selectedSeller.hours).map(([day, hours]) => (
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
                      <span className={`text-sm ${day === currentDay ? 'font-semibold text-orange-600' : ''}`}>
                        {hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery & Payment */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-5">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Car className="w-5 h-5 text-orange-600" />
                  Delivery Options
                </h3>
                <div className="space-y-2">
                  {selectedSeller.deliveryOptions.map((option, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{option}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-5">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-orange-600" />
                  Payment Methods
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSeller.payment.map((method, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium"
                    >
                      {method}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Seller Profile */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                  {selectedSeller.ownerName.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">Meet the Owner</h3>
                  <p className="text-xl font-semibold text-orange-600 mb-2">{selectedSeller.ownerName}</p>
                  <p className="text-sm text-gray-700 mb-3">
                    {selectedSeller.ownerName} has been serving the cycling community since {selectedSeller.joinedDate}. 
                    With {selectedSeller.totalSales} successful sales and a {selectedSeller.rating}-star rating, 
                    you can trust this seller for quality products and excellent service.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-white border border-orange-300 text-orange-700 rounded-full text-xs font-medium flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      {selectedSeller.verified ? 'Verified Seller' : 'New Seller'}
                    </span>
                    <span className="px-3 py-1 bg-white border border-orange-300 text-orange-700 rounded-full text-xs font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Responds in {selectedSeller.responseTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-12 px-4 mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Want to Become a Seller?</h2>
          <p className="text-xl mb-6 opacity-90">
            Join Kenya's premier cycling marketplace and reach thousands of customers
          </p>
          <button className="bg-white text-orange-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-lg">
            Register as Seller
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreLocation;