import { useState, useEffect } from 'react';
import { Tag, Clock, Percent, Flame, Gift, ShoppingCart, Heart, Star, AlertCircle, TrendingUp, Award, Zap, Calendar, ArrowRight, Filter, X } from 'lucide-react';

const SpecialOffer = () => {
  const [timeLeft, setTimeLeft] = useState({});
  const [selectedOfferType, setSelectedOfferType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [wishlist, setWishlist] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('ending-soon');

  // Mock offer data
  const offers = [
    {
      id: 1,
      name: 'Professional Road Bike - Aero Carbon Frame',
      category: 'bicycles',
      originalPrice: 185000,
      offerPrice: 129500,
      discount: 30,
      image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500',
      stock: 3,
      soldCount: 12,
      totalStock: 15,
      rating: 4.8,
      reviews: 34,
      dealEndTime: new Date(Date.now() + 3600000 * 8).toISOString(),
      dealType: 'flash',
      seller: 'Oshocks Junior',
      features: ['Carbon Frame', 'Shimano 105', '11-Speed', 'Disc Brakes'],
      badges: ['limited-stock', 'hot-deal']
    },
    {
      id: 2,
      name: 'Electric Mountain Bike 29" - 500W Motor',
      category: 'bicycles',
      originalPrice: 220000,
      offerPrice: 176000,
      discount: 20,
      image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=500',
      stock: 7,
      soldCount: 8,
      totalStock: 15,
      rating: 4.9,
      reviews: 56,
      dealEndTime: new Date(Date.now() + 3600000 * 48).toISOString(),
      dealType: 'weekend',
      seller: 'Oshocks Junior',
      features: ['500W Motor', '50km Range', 'Hydraulic Brakes', 'LCD Display'],
      badges: ['bestseller', 'eco-friendly']
    },
    {
      id: 3,
      name: 'Complete Bike Tool Kit Professional 45pcs',
      category: 'accessories',
      originalPrice: 8500,
      offerPrice: 5100,
      discount: 40,
      image: 'https://images.unsplash.com/photo-1581954144976-22ee9aa6c8f1?w=500',
      stock: 25,
      soldCount: 67,
      totalStock: 92,
      rating: 4.7,
      reviews: 123,
      dealEndTime: new Date(Date.now() + 3600000 * 24).toISOString(),
      dealType: 'clearance',
      seller: 'ProTools Kenya',
      features: ['45 Pieces', 'Case Included', 'Lifetime Warranty', 'Pro Grade'],
      badges: ['value-pack']
    },
    {
      id: 4,
      name: 'Premium Cycling Shoes - Carbon Sole',
      category: 'gear',
      originalPrice: 12000,
      offerPrice: 7200,
      discount: 40,
      image: 'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?w=500',
      stock: 15,
      soldCount: 28,
      totalStock: 43,
      rating: 4.6,
      reviews: 89,
      dealEndTime: new Date(Date.now() + 3600000 * 72).toISOString(),
      dealType: 'seasonal',
      seller: 'SpeedGear',
      features: ['Carbon Sole', 'BOA System', 'Breathable', 'SPD Compatible'],
      badges: ['premium']
    },
    {
      id: 5,
      name: 'Kids Mountain Bike 24" - Suspension Fork',
      category: 'bicycles',
      originalPrice: 32000,
      offerPrice: 22400,
      discount: 30,
      image: 'https://images.unsplash.com/photo-1558617142-cd295c68f95e?w=500',
      stock: 9,
      soldCount: 21,
      totalStock: 30,
      rating: 4.5,
      reviews: 67,
      dealEndTime: new Date(Date.now() + 3600000 * 96).toISOString(),
      dealType: 'bundle',
      seller: 'Oshocks Junior',
      features: ['24" Wheels', 'Front Suspension', '18-Speed', 'Ages 8-12'],
      badges: ['family-favorite']
    },
    {
      id: 6,
      name: 'Smart Bike Computer GPS - Heart Rate Monitor',
      category: 'accessories',
      originalPrice: 15000,
      offerPrice: 9750,
      discount: 35,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
      stock: 18,
      soldCount: 45,
      totalStock: 63,
      rating: 4.8,
      reviews: 134,
      dealEndTime: new Date(Date.now() + 3600000 * 36).toISOString(),
      dealType: 'flash',
      seller: 'TechCycle',
      features: ['GPS Navigation', 'Heart Rate', 'Bluetooth', 'Waterproof'],
      badges: ['tech', 'bestseller']
    },
    {
      id: 7,
      name: 'Cycling Jersey & Shorts Set - Pro Team Design',
      category: 'gear',
      originalPrice: 6500,
      offerPrice: 3900,
      discount: 40,
      image: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=500',
      stock: 32,
      soldCount: 89,
      totalStock: 121,
      rating: 4.4,
      reviews: 156,
      dealEndTime: new Date(Date.now() + 3600000 * 60).toISOString(),
      dealType: 'seasonal',
      seller: 'RideStyle',
      features: ['Moisture Wicking', 'Padded Shorts', 'UV Protection', '5 Sizes'],
      badges: ['comfort']
    },
    {
      id: 8,
      name: 'Heavy Duty Bike Lock Set - 5-Digit Combo',
      category: 'accessories',
      originalPrice: 3500,
      offerPrice: 1750,
      discount: 50,
      image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500',
      stock: 42,
      soldCount: 178,
      totalStock: 220,
      rating: 4.7,
      reviews: 267,
      dealEndTime: new Date(Date.now() + 3600000 * 16).toISOString(),
      dealType: 'clearance',
      seller: 'SecureLock',
      features: ['Hardened Steel', '5-Digit Code', '2 Locks', 'Portable'],
      badges: ['security', 'value-pack']
    }
  ];

  const offerTypes = [
    { id: 'all', name: 'All Offers', icon: Tag, color: 'gray' },
    { id: 'flash', name: 'Flash Deals', icon: Flame, color: 'red' },
    { id: 'weekend', name: 'Weekend Special', icon: Calendar, color: 'blue' },
    { id: 'clearance', name: 'Clearance', icon: Percent, color: 'green' },
    { id: 'seasonal', name: 'Seasonal', icon: Gift, color: 'purple' },
    { id: 'bundle', name: 'Bundle Deals', icon: Award, color: 'orange' }
  ];

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'bicycles', name: 'Bicycles' },
    { id: 'accessories', name: 'Accessories' },
    { id: 'gear', name: 'Cycling Gear' },
    { id: 'parts', name: 'Spare Parts' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = {};
      offers.forEach(offer => {
        const diff = new Date(offer.dealEndTime) - new Date();
        if (diff > 0) {
          newTimeLeft[offer.id] = {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / 1000 / 60) % 60),
            seconds: Math.floor((diff / 1000) % 60)
          };
        }
      });
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const filteredOffers = offers
    .filter(offer => {
      const matchesType = selectedOfferType === 'all' || offer.dealType === selectedOfferType;
      const matchesCategory = selectedCategory === 'all' || offer.category === selectedCategory;
      return matchesType && matchesCategory;
    })
    .sort((a, b) => {
      switch(sortBy) {
        case 'discount':
          return b.discount - a.discount;
        case 'price-low':
          return a.offerPrice - b.offerPrice;
        case 'price-high':
          return b.offerPrice - a.offerPrice;
        case 'ending-soon':
        default:
          return new Date(a.dealEndTime) - new Date(b.dealEndTime);
      }
    });

  const toggleWishlist = (id) => {
    setWishlist(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  const calculateProgress = (sold, total) => {
    return (sold / total) * 100;
  };

  const getBadgeColor = (badge) => {
    const colors = {
      'limited-stock': 'bg-red-100 text-red-700',
      'hot-deal': 'bg-orange-100 text-orange-700',
      'bestseller': 'bg-blue-100 text-blue-700',
      'eco-friendly': 'bg-green-100 text-green-700',
      'value-pack': 'bg-purple-100 text-purple-700',
      'premium': 'bg-yellow-100 text-yellow-700',
      'family-favorite': 'bg-pink-100 text-pink-700',
      'tech': 'bg-indigo-100 text-indigo-700',
      'comfort': 'bg-teal-100 text-teal-700',
      'security': 'bg-gray-100 text-gray-700'
    };
    return colors[badge] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-3 mb-4 animate-pulse">
              <Zap className="w-12 h-12" />
              <h1 className="text-5xl font-bold">Special Offers</h1>
              <Zap className="w-12 h-12" />
            </div>
            <p className="text-2xl opacity-90 mb-2">Save up to 50% on Premium Cycling Products!</p>
            <p className="text-lg opacity-75">Limited time deals • While stocks last</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Offer Type Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-3 justify-center mb-4">
            {offerTypes.map(type => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedOfferType(type.id)}
                  className={`px-4 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
                    selectedOfferType === type.id
                      ? `bg-${type.color}-600 text-white shadow-md`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={selectedOfferType === type.id ? {
                    backgroundColor: type.color === 'red' ? '#dc2626' :
                                    type.color === 'blue' ? '#2563eb' :
                                    type.color === 'green' ? '#16a34a' :
                                    type.color === 'purple' ? '#9333ea' :
                                    type.color === 'orange' ? '#ea580c' : '#6b7280'
                  } : {}}
                >
                  <Icon className="w-4 h-4" />
                  {type.name}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="ending-soon">Ending Soon</option>
              <option value="discount">Highest Discount</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg p-4 shadow-md">
            <div className="flex items-center gap-3">
              <Flame className="w-10 h-10" />
              <div>
                <p className="text-2xl font-bold">{offers.filter(o => o.dealType === 'flash').length}</p>
                <p className="text-sm opacity-90">Flash Deals</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4 shadow-md">
            <div className="flex items-center gap-3">
              <Percent className="w-10 h-10" />
              <div>
                <p className="text-2xl font-bold">Up to 50%</p>
                <p className="text-sm opacity-90">Max Discount</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4 shadow-md">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-10 h-10" />
              <div>
                <p className="text-2xl font-bold">{filteredOffers.length}</p>
                <p className="text-sm opacity-90">Active Offers</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-4 shadow-md">
            <div className="flex items-center gap-3">
              <Award className="w-10 h-10" />
              <div>
                <p className="text-2xl font-bold">24/7</p>
                <p className="text-sm opacity-90">New Deals</p>
              </div>
            </div>
          </div>
        </div>

        {/* Offers Grid */}
        {filteredOffers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map(offer => {
              const time = timeLeft[offer.id] || {};
              const progress = calculateProgress(offer.soldCount, offer.totalStock);

              return (
                <div
                  key={offer.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1"
                >
                  {/* Image Section */}
                  <div className="relative">
                    <img
                      src={offer.image}
                      alt={offer.name}
                      className="w-full h-64 object-cover"
                    />
                    
                    {/* Discount Badge */}
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-4 py-2 rounded-full text-xl font-bold shadow-lg animate-pulse">
                      -{offer.discount}% OFF
                    </div>

                    {/* Deal Type Badge */}
                    <div className="absolute top-3 right-3 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm">
                      {offerTypes.find(t => t.id === offer.dealType)?.name}
                    </div>

                    {/* Wishlist */}
                    <button
                      onClick={() => toggleWishlist(offer.id)}
                      className="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          wishlist.includes(offer.id)
                            ? 'fill-red-500 text-red-500'
                            : 'text-gray-600'
                        }`}
                      />
                    </button>

                    {/* Stock Warning */}
                    {offer.stock <= 5 && (
                      <div className="absolute bottom-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        Only {offer.stock} left!
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Badges */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {offer.badges.map((badge, idx) => (
                        <span
                          key={idx}
                          className={`text-xs px-2 py-1 rounded-full font-medium ${getBadgeColor(badge)}`}
                        >
                          {badge.replace('-', ' ')}
                        </span>
                      ))}
                    </div>

                    {/* Seller */}
                    <p className="text-xs text-gray-500 mb-2">by {offer.seller}</p>

                    {/* Title */}
                    <h3 className="font-bold text-lg mb-2 line-clamp-2 h-14">
                      {offer.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(offer.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {offer.rating} ({offer.reviews})
                      </span>
                    </div>

                    {/* Features */}
                    <div className="mb-3 flex flex-wrap gap-1">
                      {offer.features.slice(0, 3).map((feature, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-bold text-orange-600">
                          {formatPrice(offer.offerPrice)}
                        </span>
                        <span className="text-lg text-gray-400 line-through">
                          {formatPrice(offer.originalPrice)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-green-600">
                        Save {formatPrice(offer.originalPrice - offer.offerPrice)}!
                      </p>
                    </div>

                    {/* Countdown */}
                    {time.days !== undefined && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-center gap-1 mb-2">
                          <Clock className="w-4 h-4 text-red-600" />
                          <span className="text-xs font-semibold text-gray-700">
                            Offer ends in:
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-center">
                          {[
                            { label: 'D', value: time.days },
                            { label: 'H', value: time.hours },
                            { label: 'M', value: time.minutes },
                            { label: 'S', value: time.seconds }
                          ].map((unit, idx) => (
                            <div key={idx}>
                              <div className="bg-white rounded font-bold text-lg text-red-600 py-1">
                                {String(unit.value).padStart(2, '0')}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {unit.label}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>{offer.soldCount} sold</span>
                        <span>{offer.stock} remaining</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button className="flex-1 bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 shadow-md">
                        <ShoppingCart className="w-5 h-5" />
                        Add to Cart
                      </button>
                      <button className="bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No offers available
            </h3>
            <p className="text-gray-500 mb-4">
              Try selecting different filters
            </p>
            <button
              onClick={() => {
                setSelectedOfferType('all');
                setSelectedCategory('all');
              }}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Bottom CTA Banner */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-12 px-4 mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Don't Miss Out!</h2>
          <p className="text-xl mb-6 opacity-90">
            New deals added daily. Subscribe to get notified about exclusive offers.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-orange-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-lg">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialOffer;