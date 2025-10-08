import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { productAPI } from '../../services/api';

const HomePage = () => {
  console.log('🏠 HomePage component mounted');
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🎯 useEffect triggered - calling fetchProducts');
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      console.log('🔍 Starting to fetch products...');
      console.log('📍 API Base URL:', process.env.REACT_APP_API_URL);
      
      setLoading(true);
      setError(null);
      
      // Using your existing API service with axios
      const response = await productAPI.getProducts({ limit: 12 });
      
      console.log('✅ API Response received:', response);
      console.log('📦 Response data:', response.data);
      console.log('🔢 Response status:', response.status);
      console.log('📋 Response headers:', response.headers);
      
      // Check the structure of the response
      if (response.data) {
        console.log('📊 Data structure:', {
          hasData: !!response.data.data,
          isArray: Array.isArray(response.data),
          keys: Object.keys(response.data),
          dataType: typeof response.data
        });
        
        // Axios returns data in response.data, and your Laravel API has data array
        if (response.data && response.data.data) {
          console.log('✨ Using response.data.data');
          console.log('📝 Products found:', response.data.data.length);
          console.log('🎯 First product:', response.data.data[0]);
          setProducts(response.data.data);
        } else if (Array.isArray(response.data)) {
          console.log('✨ Using response.data (is array)');
          console.log('📝 Products found:', response.data.length);
          console.log('🎯 First product:', response.data[0]);
          setProducts(response.data);
        } else {
          console.log('⚠️ Unexpected data structure:', response.data);
          setProducts([]);
        }
      } else {
        console.log('❌ No data in response');
        setProducts([]);
      }
      
      setLoading(false);
      console.log('✅ Fetch complete, loading set to false');
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      console.error('❌ Error message:', err.message);
      console.error('❌ Error response:', err.response);
      console.error('❌ Error request:', err.request);
      
      if (err.response) {
        console.error('🔴 Server responded with error:');
        console.error('   Status:', err.response.status);
        console.error('   Data:', err.response.data);
        console.error('   Headers:', err.response.headers);
        setError(`Server error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`);
      } else if (err.request) {
        console.error('🔴 No response received from server');
        console.error('   Request:', err.request);
        setError('No response from server. Please check if the backend is running at http://127.0.0.1:8000');
      } else {
        console.error('🔴 Error setting up request:', err.message);
        setError(`Request setup error: ${err.message}`);
      }
      
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading products...</p>
        </div>
      </div>
    );
  }

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
          content="Shop thousands of bicycles, cycling accessories & spare parts online in Kenya."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Welcome to Oshocks 🚴
            </h1>
            <p className="text-xl md:text-2xl mb-4">Kenya's Premier Cycling Marketplace</p>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Discover thousands of bicycles, cycling accessories & spare parts. 
              Fast delivery nationwide, M-Pesa & card payments accepted.
            </p>
            <Link
              to="/shop"
              className="inline-block px-8 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-200"
            >
              Shop Now →
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6">
                <div className="text-5xl mb-4">🚚</div>
                <h3 className="text-xl font-bold mb-2">Fast Delivery</h3>
                <p className="text-gray-600">
                  Quick delivery across Kenya. Get your bike delivered to your doorstep.
                </p>
              </div>
              <div className="p-6">
                <div className="text-5xl mb-4">💳</div>
                <h3 className="text-xl font-bold mb-2">M-Pesa Payments</h3>
                <p className="text-gray-600">
                  Easy payments with M-Pesa, cards, and other secure payment methods.
                </p>
              </div>
              <div className="p-6">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-bold mb-2">Quality Guaranteed</h3>
                <p className="text-gray-600">
                  All products are verified for quality. 100% satisfaction guaranteed.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Products</h2>
                <p className="text-gray-600">Check out our latest bikes and accessories</p>
              </div>
              <Link
                to="/shop"
                className="text-purple-600 hover:text-purple-700 font-semibold flex items-center"
              >
                View All <span className="ml-1">→</span>
              </Link>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-lg shadow">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-gray-600 text-lg mb-2">No products available yet.</p>
                <p className="text-gray-500 text-sm">Check back soon for new arrivals!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.slice(0, 12).map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    {/* Product Image */}
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
                      
                      {/* Featured Badge */}
                      {product.is_featured && (
                        <span className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow">
                          ⭐ Featured
                        </span>
                      )}
                      
                      {/* Discount Badge */}
                      {product.compare_price && Number(product.compare_price) > Number(product.price) && (
                        <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                          {Math.round((1 - Number(product.price) / Number(product.compare_price)) * 100)}% OFF
                        </span>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 h-12 text-sm">
                        {product.name}
                      </h3>
                      
                      {product.brand && (
                        <p className="text-xs text-gray-500 mb-2">
                          Brand: <span className="font-medium">{product.brand}</span>
                        </p>
                      )}
                      
                      {/* Price */}
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
                      
                      {/* Condition & Stock */}
                      <div className="flex items-center justify-between mt-3">
                        {product.condition && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {product.condition}
                          </span>
                        )}
                        {product.quantity && product.quantity > 0 ? (
                          <span className="text-xs text-green-600 font-medium">
                            In Stock
                          </span>
                        ) : (
                          <span className="text-xs text-red-600 font-medium">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* View More Button */}
            {products.length > 0 && (
              <div className="text-center mt-12">
                <Link
                  to="/shop"
                  className="inline-block px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition shadow-lg hover:shadow-xl"
                >
                  View All Products ({products.length}+)
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Quick Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Link to="/shop" className="p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition text-center">
                <div className="text-4xl mb-3">🏪</div>
                <h3 className="font-semibold text-lg">Shop</h3>
                <p className="text-sm text-gray-600 mt-2">Browse all products</p>
              </Link>
              <Link to="/about" className="p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition text-center">
                <div className="text-4xl mb-3">ℹ️</div>
                <h3 className="font-semibold text-lg">About</h3>
                <p className="text-sm text-gray-600 mt-2">Learn about us</p>
              </Link>
              <Link to="/contact" className="p-6 bg-green-50 rounded-lg hover:bg-green-100 transition text-center">
                <div className="text-4xl mb-3">📞</div>
                <h3 className="font-semibold text-lg">Contact</h3>
                <p className="text-sm text-gray-600 mt-2">Get in touch</p>
              </Link>
              <Link to="/faq" className="p-6 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition text-center">
                <div className="text-4xl mb-3">❓</div>
                <h3 className="font-semibold text-lg">FAQ</h3>
                <p className="text-sm text-gray-600 mt-2">Find answers</p>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Start Cycling?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Browse our collection of premium bicycles and accessories. 
              Quality products, fast delivery, and excellent customer service.
            </p>
            <Link
              to="/shop"
              className="inline-block px-8 py-4 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition shadow-lg hover:shadow-2xl transform hover:-translate-y-1 duration-200 text-lg"
            >
              Explore Products 🚴
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;
