import { useState, useEffect } from 'react';
import { Tag, Clock, Percent, TrendingDown, Flame, Gift, ShoppingCart, Heart, Eye } from 'lucide-react';

const ProductOffer = () => {
  const [timeLeft, setTimeLeft] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [wishlist, setWishlist] = useState([]);

  // Mock offer data - replace with API calls
  const offers = [
    {
      id: 1,
      name: 'Mountain Pro X5 27.5" MTB',
      category: 'bicycles',
      originalPrice: 45000,
      offerPrice: 35000,
      discount: 22,
      image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400',
      stock: 5,
      soldCount: 23,
      rating: 4.5,
      reviews: 18,
      dealEndTime: new Date(Date.now() + 3600000 * 24).toISOString(),
      dealType: 'flash',
      seller: 'Oshocks Junior',
      features: ['Shimano Gears', 'Disc Brakes', 'Aluminum Frame']
    },
    {
      id: 2,
      name: 'Professional Cycling Helmet',
      category: 'accessories',
      originalPrice: 3500,
      offerPrice: 2450,
      discount: 30,
      image: 'https://images.unsplash.com/photo-1557803384-8c91d41d35e4?w=400',
      stock: 15,
      soldCount: 67,
      rating: 4.8,
      reviews: 45,
      dealEndTime: new Date(Date.now() + 3600000 * 48).toISOString(),
      dealType: 'clearance',
      seller: 'SafeRide Kenya',
      features: ['CE Certified', 'Adjustable', 'Lightweight']
    },
    {
      id: 3,
      name: 'Bike Repair Tool Kit 20pcs',
      category: 'spare-parts',
      originalPrice: 4200,
      offerPrice: 2940,
      discount: 30,
      image: 'https://images.unsplash.com/photo-1581954144976-22ee9aa6c8f1?w=400',
      stock: 25,
      soldCount: 89,
      rating: 4.6,
      reviews: 56,
      dealEndTime: new Date(Date.now() + 3600000 * 72).toISOString(),
      dealType: 'weekly',
      seller: 'Oshocks Junior',
      features: ['Complete Set', 'Portable Case', 'Durable']
    },
    {
      id: 4,
      name: 'LED Bike Light Set Front & Rear',
      category: 'accessories',
      originalPrice: 2000,
      offerPrice: 1200,
      discount: 40,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      stock: 8,
      soldCount: 134,
      rating: 4.7,
      reviews: 92,
      dealEndTime: new Date(Date.now() + 3600000 * 12).toISOString(),
      dealType: 'flash',
      seller: 'LightUp Cycling',
      features: ['USB Rechargeable', 'Waterproof', '5 Modes']
    },
    {
      id: 5,
      name: 'Kids BMX Bike 20"',
      category: 'bicycles',
      originalPrice: 18000,
      offerPrice: 14400,
      discount: 20,
      image: 'https://images.unsplash.com/photo-1558617142-cd295c68f95e?w=400',
      stock: 12,
      soldCount: 34,
      rating: 4.4,
      reviews: 28,
      dealEndTime: new Date(Date.now() + 3600000 * 96).toISOString(),
      dealType: 'seasonal',
      seller: 'Oshocks Junior',
      features: ['Training Wheels', 'Adjustable Seat', 'Safety Pads']
    },
    {
      id: 6,
      name: 'Cycling Gloves Full Finger',
      category: 'gear',
      originalPrice: 1500,
      offerPrice: 975,
      discount: 35,
      image: 'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?w=400',
      stock: 30,
      soldCount: 156,
      rating: 4.3,
      reviews: 87,
      dealEndTime: new Date(Date.now() + 3600000 * 36).toISOString(),
      dealType: 'weekly',
      seller: 'GearUp Kenya',
      features: ['Breathable', 'Anti-Slip', 'Touch Screen']
    }
  ];

  const categories = [
    { id: 'all', name: 'All Offers', icon: Tag },
    { id: 'bicycles', name: 'Bicycles', icon: Tag },
    { id: 'accessories', name: 'Accessories', icon: Tag },
    { id: 'spare-parts', name: 'Spare Parts', icon: Tag },
    { id: 'gear', name: 'Gear', icon: Tag }
  ];

  const dealTypes = {
    flash: { label: 'Flash Deal', color: 'bg-red-500', icon: Flame },
    weekly: { label: 'Weekly Deal', color: 'bg-blue-500', icon: TrendingDown },
    clearance: { label: 'Clearance', color: 'bg-green-500', icon: Percent },
    seasonal: { label: 'Seasonal', color: 'bg-purple-500', icon: Gift }
  };

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

  const filteredOffers = selectedCategory === 'all' 
    ? offers 
    : offers.filter(offer => offer.category === selectedCategory);

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

  const calculateSavings = (original, offer) => {
    return original - offer;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center mb-4">
            <Flame className="w-12 h-12 mr-3 animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold">Hot Deals & Offers</h1>
          </div>
          <p className="text-center text-xl opacity-90">
            Limited time offers on premium cycling products
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
                  selectedCategory === cat.id
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.map(offer => {
            const DealIcon = dealTypes[offer.dealType].icon;
            const time = timeLeft[offer.id] || {};

            return (
              <div
                key={offer.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Image Section */}
                <div className="relative">
                  <img
                    src={offer.image}
                    alt={offer.name}
                    className="w-full h-56 object-cover"
                  />
                  
                  {/* Deal Badge */}
                  <div className={`absolute top-3 left-3 ${dealTypes[offer.dealType].color} text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg`}>
                    <DealIcon className="w-4 h-4" />
                    {dealTypes[offer.dealType].label}
                  </div>

                  {/* Discount Badge */}
                  <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-lg font-bold shadow-lg">
                    -{offer.discount}%
                  </div>

                  {/* Wishlist Button */}
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

                  {/* Low Stock Warning */}
                  {offer.stock <= 10 && (
                    <div className="absolute bottom-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      Only {offer.stock} left!
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-4">
                  {/* Seller */}
                  <p className="text-xs text-gray-500 mb-1">by {offer.seller}</p>

                  {/* Product Name */}
                  <h3 className="font-bold text-lg mb-2 line-clamp-2 h-14">
                    {offer.name}
                  </h3>

                  {/* Rating & Reviews */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-sm ${
                            i < Math.floor(offer.rating)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {offer.rating} ({offer.reviews})
                    </span>
                  </div>

                  {/* Features */}
                  <div className="mb-3 flex flex-wrap gap-1">
                    {offer.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Price Section */}
                  <div className="mb-3">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-2xl font-bold text-orange-600">
                        {formatPrice(offer.offerPrice)}
                      </span>
                      <span className="text-lg text-gray-400 line-through">
                        {formatPrice(offer.originalPrice)}
                      </span>
                    </div>
                    <p className="text-sm text-green-600 font-medium">
                      You save {formatPrice(calculateSavings(offer.originalPrice, offer.offerPrice))}
                    </p>
                  </div>

                  {/* Countdown Timer */}
                  {time.days !== undefined && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <Clock className="w-4 h-4 text-orange-600" />
                        <span className="text-xs font-medium text-gray-600">
                          Offer ends in:
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        {[
                          { label: 'Days', value: time.days },
                          { label: 'Hours', value: time.hours },
                          { label: 'Mins', value: time.minutes },
                          { label: 'Secs', value: time.seconds }
                        ].map((unit, idx) => (
                          <div key={idx}>
                            <div className="bg-white rounded px-2 py-1 font-bold text-orange-600">
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
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Sold: {offer.soldCount}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {offer.soldCount + offer.stock} views
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${(offer.soldCount / (offer.soldCount + offer.stock)) * 100}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                    <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                      View
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredOffers.length === 0 && (
          <div className="text-center py-12">
            <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No offers available
            </h3>
            <p className="text-gray-500">
              Check back soon for amazing deals!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductOffer;