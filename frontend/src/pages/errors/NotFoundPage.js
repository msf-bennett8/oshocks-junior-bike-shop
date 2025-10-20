import React, { useState, useEffect } from 'react';
import { Search, Home, ShoppingBag, Bike, Package, Wrench, Shield, MapPin, ArrowRight, TrendingUp } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories } from '../../redux/slices/productSlice';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useDispatch();
    const { items: products, categories, loading } = useSelector(
      (state) => state.products
    );

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProducts({ sort: 'popular', page: 1, limit: 4 }));
  }, [dispatch]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Map categories from database with icons and colors
  const categoryIcons = {
    'Mountain Bikes': { icon: <Bike className="w-5 h-5" />, color: 'bg-orange-500' },
    'Road Bikes': { icon: <Bike className="w-5 h-5" />, color: 'bg-blue-500' },
    'Accessories': { icon: <ShoppingBag className="w-5 h-5" />, color: 'bg-green-500' },
    'Spare Parts': { icon: <Wrench className="w-5 h-5" />, color: 'bg-purple-500' },
    'Safety Gear': { icon: <Shield className="w-5 h-5" />, color: 'bg-red-500' },
    'Kids Bikes': { icon: <Package className="w-5 h-5" />, color: 'bg-pink-500' },
    'Electric Bikes': { icon: <Bike className="w-5 h-5" />, color: 'bg-indigo-500' },
    'BMX Bikes': { icon: <Bike className="w-5 h-5" />, color: 'bg-yellow-500' },
  };

  const popularCategories = categories.slice(0, 6).map(cat => ({
    name: cat.name,
    icon: categoryIcons[cat.name]?.icon || <Package className="w-5 h-5" />,
    link: `/shop?category=${cat.id}`,
    color: categoryIcons[cat.name]?.color || 'bg-gray-500'
  }));

  // Use real products from database (limit to 4)
  const trendingProducts = products.slice(0, 4).map(product => ({
    name: product.name,
    price: `KSh ${Number(product.price).toLocaleString()}`,
    image: product.image_url || product.images?.[0],
    link: `/product/${product.id}`,
    id: product.id
  }));

  const helpfulLinks = [
    { name: 'Home', link: '/', icon: <Home className="w-4 h-4" /> },
    { name: 'Shop All Products', link: '/shop', icon: <ShoppingBag className="w-4 h-4" /> },
    { name: 'My Orders', link: '/my-orders', icon: <Package className="w-4 h-4" /> },
    { name: 'Store Locations', link: '/locations', icon: <MapPin className="w-4 h-4" /> },
    { name: 'Contact Support', link: '/contact', icon: <Search className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-500 rounded-lg p-2">
                <Bike className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Oshocks Junior Bike Shop</h1>
                <p className="text-xs text-gray-500">Kenya's Premier Cycling Marketplace</p>
              </div>
            </div>
            <Link 
              to="/"
              className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Go Home</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 404 Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-orange-100 rounded-full mb-6 animate-bounce">
            <span className="text-6xl">🚴</span>
          </div>
          <h1 className="text-6xl sm:text-8xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-3">Page Not Found</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
            Looks like this page took a wrong turn! The page you're looking for doesn't exist or has been moved. 
            Let's get you back on track.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search for bikes, accessories, parts..."
                className="w-full px-6 py-4 pr-32 text-lg border-2 border-gray-300 rounded-full focus:outline-none focus:border-orange-500 transition-colors shadow-lg"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors flex items-center space-x-2"
              >
                <Search className="w-5 h-5" />
                <span>Search</span>
              </button>
            </div>
          </div>
        </div>

        {/* Popular Categories */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Browse Popular Categories</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {loading && categories.length === 0 ? (
                // Show loading skeletons
                [1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-xl p-6 shadow-md">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg mb-3 mx-auto animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded mx-auto w-20 animate-pulse"></div>
                  </div>
                ))
              ) : popularCategories.length > 0 ? (
                popularCategories.map((category, index) => (
                  <Link
                    key={index}
                    to={category.link}
                    className="group bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer block"
                  >
                <div className={`${category.color} w-12 h-12 rounded-lg flex items-center justify-center text-white mb-3 mx-auto group-hover:scale-110 transition-transform`}>
                  {category.icon}
                </div>
                <p className="text-center font-semibold text-gray-800 text-sm group-hover:text-orange-500 transition-colors">
                  {category.name}
                </p></Link>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No categories available
                  </div>
                )}
          </div>
        </div>

        {/* Trending Products */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <TrendingUp className="w-6 h-6 text-orange-500" />
            <h3 className="text-2xl font-bold text-gray-900">Trending Products</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading && products.length === 0 ? (
              // Show loading skeletons
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md">
                  <div className="bg-gray-200 h-48 animate-pulse"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </div>
                </div>
              ))
            ) : trendingProducts.length > 0 ? (
              trendingProducts.map((product, index) => (
                <Link
                  key={product.id || index}
                  to={product.link}
                  className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer block"
                >
                  <div className="bg-gradient-to-br from-orange-100 to-orange-50 h-48 flex items-center justify-center overflow-hidden">
                    {product.image && typeof product.image === 'string' && !product.image.startsWith('http') ? (
                      <span className="text-7xl">{product.image}</span>
                    ) : product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<span class="text-7xl">🚴</span>';
                        }}
                      />
                    ) : (
                      <span className="text-7xl">🚴</span>
                    )}
                  </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-800 mb-2 group-hover:text-orange-500 transition-colors">
                    {product.name}
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-orange-500 font-bold text-lg">{product.price}</span>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div></Link>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No products available
                  </div>
                )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quick Links</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {helpfulLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.link}
                  className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all group cursor-pointer"
                >
                <div className="text-gray-600 group-hover:text-orange-500 transition-colors">
                  {link.icon}
                </div>
                <span className="font-medium text-gray-800 group-hover:text-orange-500 transition-colors">
                  {link.name}
                </span>
                  </Link>
                ))}
          </div>
        </div>

        {/* Contact Support Card */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-3">Still Can't Find What You're Looking For?</h3>
          <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
            Our customer support team is here to help! We can assist you with product inquiries, order tracking, 
            and any other questions you might have.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link
              to="/contact"
              className="bg-white text-orange-500 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg inline-block"
            >
              Contact Support
            </Link>
            <Link
              to="/"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-orange-500 transition-colors inline-block"
            >
              Return Home
            </Link>
          </div>
          <div className="mt-6 text-orange-100 text-sm">
            <p>📞 Call us: +254 700 000 000 | 📧 Email: support@oshocksjunior.co.ke</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-sm">© 2025 Oshocks Junior Bike Shop. All rights reserved.</p>
            <p className="text-xs text-gray-500 mt-2">Kenya's Premier Cycling Marketplace</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NotFoundPage;