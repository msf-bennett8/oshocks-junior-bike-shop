import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { productAPI } from '../../services/api';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productAPI.getProducts({ limit: 12 });
      
      if (response.data && response.data.data) {
        setProducts(response.data.data);
      } else if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      
      if (err.response) {
        setError(`Server error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`);
      } else if (err.request) {
        setError('No response from server. Please check if the backend is running at http://127.0.0.1:8000');
      } else {
        setError(`Request setup error: ${err.message}`);
      }
      
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-4">
            Make sure your backend server is running at:<br />
            <code className="bg-gray-100 px-2 py-1 rounded">http://127.0.0.1:8000</code>
          </p>
          <button
            onClick={fetchProducts}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Oshocks Bike Shop - Kenya's Premier Cycling Marketplace</title>
        <meta
          name="description"
          content="Buy bicycles, book repairs, and discover cycling products in Kenya. Multi-vendor marketplace with M-Pesa payments, fast delivery, and professional bike services."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 text-white py-16 md:py-24 lg:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
                Welcome to Oshocks
              </h1>
              <p className="text-xl md:text-2xl lg:text-3xl mb-3 md:mb-4 font-semibold">
                A Premier Cycling Marketplace
              </p>
              <p className="text-base md:text-lg lg:text-xl mb-8 md:mb-10 max-w-3xl mx-auto leading-relaxed opacity-95">
                Shop bicycles and accessories from trusted sellers. Get professional bike repairs, 
                book service appointments, and enjoy fast deliveries.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to="/shop"
                  className="w-full sm:w-auto px-8 py-4 bg-white text-purple-600 font-bold rounded-lg hover:bg-gray-100 transition shadow-xl hover:shadow-2xl transform hover:-translate-y-1 duration-200 text-lg"
                >
                  Shop Now
                </Link>
                <Link
                  to="/book-service"
                  className="w-full sm:w-auto px-8 py-4 bg-purple-800 border-2 border-white text-white font-bold rounded-lg hover:bg-purple-900 transition shadow-xl hover:shadow-2xl transform hover:-translate-y-1 duration-200 text-lg"
                >
                  Book Repair Service
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features - Enhanced with Real Value Props */}
        <section className="py-12 md:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md hover:shadow-lg transition">
                <div className="text-5xl mb-4"></div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">Fast Delivery</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Fast and reliable delivery in Nairobi Metropolitan. Track your order in real-time from our stores to your doorstep.
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md hover:shadow-lg transition">
                <div className="text-5xl mb-4"></div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">Flexible Payments</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Pay conveniently with M-Pesa, Airtel Money, bank cards, or cash on delivery. Secure transactions guaranteed.
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-md hover:shadow-lg transition">
                <div className="text-5xl mb-4"></div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">Professional Repairs</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Expert bike mechanics available for repairs, maintenance, and custom builds. Book appointments online easily.
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-md hover:shadow-lg transition">
                <div className="text-5xl mb-4"></div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">Multi-Vendor Platform</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Access products from multiple verified sellers. More choices, competitive prices, quality assured.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Showcase */}
        <section className="py-12 md:py-16 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-800">Our Services</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                More than just a marketplace - we're your complete cycling solution
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition group">
                <div className="flex items-start space-x-4">
                  <div className="text-4xl group-hover:scale-110 transition-transform">🛍️</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Buy & Sell</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Browse bikes, parts, and accessories. Ask for delivery and it wll be delivered to your doorstep.
                    </p>
                    <Link to="/shop" className="text-purple-600 font-semibold text-sm hover:underline">
                      Start Shopping →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition group">
                <div className="flex items-start space-x-4">
                  <div className="text-4xl group-hover:scale-110 transition-transform">🔧</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Repair Services</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Professional bike repairs and maintenance by experienced mechanics. Quick turnaround, quality guaranteed.
                    </p>
                    <Link to="/book-service" className="text-purple-600 font-semibold text-sm hover:underline">
                      Book Now →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition group">
                <div className="flex items-start space-x-4">
                  <div className="text-4xl group-hover:scale-110 transition-transform">📦</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Custom Orders</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Can't find what you need? Request custom bike builds or special parts. We'll source it for you.
                    </p>
                    <Link to="/contact" className="text-purple-600 font-semibold text-sm hover:underline">
                      Inquire →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition group">
                <div className="flex items-start space-x-4">
                  <div className="text-4xl group-hover:scale-110 transition-transform">👥</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Become a Seller</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Join our marketplace and reach other cycling enthusiasts. Easy setup, powerful tools.
                    </p>
                    <Link to="/seller/register" className="text-purple-600 font-semibold text-sm hover:underline">
                      Register →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition group">
                <div className="flex items-start space-x-4">
                  <div className="text-4xl group-hover:scale-110 transition-transform">📱</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Trade-In Program</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Upgrade your bike with our trade-in program. Get fair value for your old bike towards a new purchase and get your bike a new owner.
                    </p>
                    <Link to="/trade-in" className="text-purple-600 font-semibold text-sm hover:underline">
                      Learn More →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition group">
                <div className="flex items-start space-x-4">
                  <div className="text-4xl group-hover:scale-110 transition-transform">💬</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Expert Support</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Connect, Get cycling advice, product recommendations, and technical support from our team and fellow cyclists.
                    </p>
                    <Link to="/contact" className="text-purple-600 font-semibold text-sm hover:underline">
                      Contact Us →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-12 md:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2 text-gray-800">Featured Products</h2>
                <p className="text-gray-600">Discover our handpicked selection of quality bikes and accessories</p>
              </div>
              <Link
                to="/shop"
                className="text-purple-600 hover:text-purple-700 font-semibold flex items-center text-lg group"
              >
                View All 
                <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            {loading ? (
              // Loading Skeleton
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <ProductCardSkeleton key={i} delay={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 md:py-20 bg-gray-50 rounded-xl shadow-inner">
                <div className="text-6xl md:text-7xl mb-4">📦</div>
                <p className="text-gray-600 text-lg md:text-xl mb-2 font-semibold">No products available yet</p>
                <p className="text-gray-500 text-sm md:text-base">Check back soon for exciting new arrivals!</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {products.slice(0, 12).map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                    >
                      <div className="relative pb-[75%] bg-gray-100">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<div class="absolute inset-0 flex items-center justify-center text-gray-400 text-6xl">🚴</div>';
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-6xl">
                            🚴
                          </div>
                        )}
                        
                        {product.is_featured && (
                          <span className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                            ⭐ Featured
                          </span>
                        )}
                        
                        {product.compare_price && Number(product.compare_price) > Number(product.price) && (
                          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                            {Math.round((1 - Number(product.price) / Number(product.compare_price)) * 100)}% OFF
                          </span>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 h-12 text-sm hover:text-purple-600 transition">
                          {product.name}
                        </h3>
                        
                        {product.brand && (
                          <p className="text-xs text-gray-500 mb-2">
                            Brand: <span className="font-medium text-gray-700">{product.brand}</span>
                          </p>
                        )}
                        
                        <div className="flex justify-between items-center mt-3">
                          <div>
                            <span className="text-xl font-bold text-purple-600">
                              KSh {Number(product.price).toLocaleString()}
                            </span>
                            {product.compare_price && Number(product.compare_price) > Number(product.price) && (
                              <span className="text-sm text-gray-400 line-through ml-2">
                                KSh {Number(product.compare_price).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          {product.condition && (
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium">
                              {product.condition}
                            </span>
                          )}
                          {product.quantity && product.quantity > 0 ? (
                            <span className="text-xs text-green-600 font-semibold flex items-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                              In Stock
                            </span>
                          ) : (
                            <span className="text-xs text-red-600 font-semibold flex items-center">
                              <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                              Out of Stock
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {products.length > 0 && (
                  <div className="text-center mt-10 md:mt-12">
                    <Link
                      to="/shop"
                      className="inline-block px-8 py-4 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition shadow-lg hover:shadow-xl text-lg"
                    >
                      Explore All {products.length}+ Products
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Why Choose Oshocks */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-purple-50 to-indigo-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-800">Why Choose Oshocks?</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Your trusted partner for all things cycling
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-md text-center">
                <div className="text-5xl mb-3"></div>
                <h3 className="text-lg font-bold mb-2">Quality Verified</h3>
                <p className="text-gray-600 text-sm">All our products are tested and undergo strict verification for authenticity and quality standards.</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md text-center">
                <div className="text-5xl mb-3"></div>
                <h3 className="text-lg font-bold mb-2">Best Prices</h3>
                <p className="text-gray-600 text-sm">Competitive pricing from multiple sellers to ensures you get the best deals on cycling products.</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md text-center">
                <div className="text-5xl mb-3"></div>
                <h3 className="text-lg font-bold mb-2">Secure Shopping</h3>
                <p className="text-gray-600 text-sm">Your transactions are protected with encrypted payments and buyer protection policies.</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md text-center">
                <div className="text-5xl mb-3"></div>
                <h3 className="text-lg font-bold mb-2">Fast Processing</h3>
                <p className="text-gray-600 text-sm">Ypur orders are processed within 24 hours and shipped quickly to your preferred location as by our shipping policy.</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md text-center">
                <div className="text-5xl mb-3"></div>
                <h3 className="text-lg font-bold mb-2">Satisfaction Guarantee</h3>
                <p className="text-gray-600 text-sm">Not happy with your purchase? Easy returns and refunds within 7 days of delivery as by our return and refund policy.</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md text-center">
                <div className="text-5xl mb-3"></div>
                <h3 className="text-lg font-bold mb-2">24/7 Support</h3>
                <p className="text-gray-600 text-sm">Our customer support team is always available to help with your inquiries and concerns.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Access Links */}
        <section className="py-12 md:py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-800">Explore More</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <Link to="/shop" className="p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition text-center group border-2 border-transparent hover:border-purple-300">
                <div className="text-4xl md:text-5xl mb-3 group-hover:scale-110 transition-transform">🏪</div>
                <h3 className="font-bold text-base md:text-lg text-gray-800">Shop</h3>
                <p className="text-xs md:text-sm text-gray-600 mt-2">Browse products</p>
              </Link>
              <Link to="/about" className="p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition text-center group border-2 border-transparent hover:border-blue-300">
                <div className="text-4xl md:text-5xl mb-3 group-hover:scale-110 transition-transform">ℹ️</div>
                <h3 className="font-bold text-base md:text-lg text-gray-800">About Us</h3>
                <p className="text-xs md:text-sm text-gray-600 mt-2">Our story</p>
              </Link>
              <Link to="/contact" className="p-6 bg-green-50 rounded-xl hover:bg-green-100 transition text-center group border-2 border-transparent hover:border-green-300">
                <div className="text-4xl md:text-5xl mb-3 group-hover:scale-110 transition-transform">📞</div>
                <h3 className="font-bold text-base md:text-lg text-gray-800">Contact</h3>
                <p className="text-xs md:text-sm text-gray-600 mt-2">Get in touch</p>
              </Link>
              <Link to="/faq" className="p-6 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition text-center group border-2 border-transparent hover:border-yellow-300">
                <div className="text-4xl md:text-5xl mb-3 group-hover:scale-110 transition-transform">❓</div>
                <h3 className="font-bold text-base md:text-lg text-gray-800">FAQ</h3>
                <p className="text-xs md:text-sm text-gray-600 mt-2">Find answers</p>
              </Link>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">Ready to Start Your Cycling Journey?</h2>
            <p className="text-lg md:text-xl lg:text-2xl mb-8 md:mb-10 max-w-3xl mx-auto leading-relaxed opacity-95">
              Join other satisfied customers who trust Oshocks for quality bikes, 
              professional repairs, and exceptional service. Your perfect ride awaits!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/shop"
                className="w-full sm:w-auto inline-block px-10 py-4 bg-white text-purple-600 font-bold rounded-lg hover:bg-gray-100 transition shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 duration-200 text-lg"
              >
                Browse Products
              </Link>
              <Link
                to="/seller/register"
                className="w-full sm:w-auto inline-block px-10 py-4 bg-purple-800 border-2 border-white text-white font-bold rounded-lg hover:bg-purple-900 transition shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 duration-200 text-lg"
              >
                Become a Seller
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

// Product Card Skeleton Component
const ProductCardSkeleton = ({ delay = 0 }) => {
  return (
    <div 
      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
      style={{ animationDelay: `${delay * 50}ms` }}
    >
      {/* Image skeleton */}
      <div className="relative pb-[75%] bg-gray-200 animate-pulse"></div>

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title skeleton - 2 lines */}
        <div className="space-y-2 h-12">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        </div>
        
        {/* Brand skeleton */}
        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        
        {/* Price skeleton */}
        <div className="flex items-center gap-2 pt-1">
          <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
        </div>
        
        {/* Bottom row skeleton */}
        <div className="flex items-center justify-between pt-1">
          <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
