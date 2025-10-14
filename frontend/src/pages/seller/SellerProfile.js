import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Store, MapPin, Phone, Mail, Calendar, Star, Package, 
  TrendingUp, Award, CheckCircle, AlertCircle, Edit, 
  ExternalLink, MessageCircle, ThumbsUp, Clock, Truck,
  Filter, Search, Grid, List, ChevronDown, Share2
} from 'lucide-react';

const SellerProfile = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Fetch seller data
  useEffect(() => {
    fetchSellerData();
  }, [sellerId]);

  const fetchSellerData = async () => {
    try {
      setLoading(true);
      // API calls
      const sellerResponse = await fetch(`/api/sellers/${sellerId}`);
      const productsResponse = await fetch(`/api/sellers/${sellerId}/products`);
      const reviewsResponse = await fetch(`/api/sellers/${sellerId}/reviews`);
      
      const sellerData = await sellerResponse.json();
      const productsData = await productsResponse.json();
      const reviewsData = await reviewsResponse.json();
      
      setSeller(sellerData);
      setProducts(productsData);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching seller data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort products
  const getFilteredProducts = () => {
    let filtered = [...products];
    
    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(p => p.category === filterCategory);
    }
    
    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        filtered.sort((a, b) => b.sales_count - a.sales_count);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }
    
    return filtered;
  };

  // Pagination
  const getPaginatedProducts = () => {
    const filtered = getFilteredProducts();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(getFilteredProducts().length / itemsPerPage);

  // Calculate seller stats
  const calculateStats = () => {
    if (!seller) return {};
    
    const totalSales = products.reduce((sum, p) => sum + (p.sales_count || 0), 0);
    const avgRating = seller.rating || 0;
    const totalReviews = reviews.length;
    const responseRate = seller.response_rate || 0;
    const onTimeDelivery = seller.on_time_delivery_rate || 0;
    
    return {
      totalSales,
      avgRating,
      totalReviews,
      responseRate,
      onTimeDelivery,
      totalProducts: products.length
    };
  };

  const stats = calculateStats();

  // Get unique categories
  const categories = ['all', ...new Set(products.map(p => p.category))];

  // Handle contact seller
  const handleContactSeller = () => {
    setShowContactModal(true);
  };

  // Handle follow seller
  const handleFollowSeller = async () => {
    try {
      await fetch(`/api/sellers/${sellerId}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      // Update local state
      setSeller({ ...seller, is_following: !seller.is_following });
    } catch (error) {
      console.error('Error following seller:', error);
    }
  };

  // Share profile
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: seller.shop_name,
          text: `Check out ${seller.shop_name} on Oshocks Junior Bike Shop`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Seller Not Found</h2>
          <p className="text-gray-600 mb-4">The seller you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/sellers')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Browse All Sellers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Seller Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Seller Logo */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                {seller.logo_url ? (
                  <img 
                    src={seller.logo_url} 
                    alt={seller.shop_name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Store className="h-16 w-16 text-white" />
                )}
              </div>
            </div>

            {/* Seller Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{seller.shop_name}</h1>
                    {seller.is_verified && (
                      <span className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        <CheckCircle className="h-4 w-4" />
                        Verified Seller
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold">{stats.avgRating.toFixed(1)}</span>
                    <span>({stats.totalReviews} reviews)</span>
                    <span className="mx-2">•</span>
                    <span>{stats.totalSales.toLocaleString()} sales</span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{seller.city}, {seller.country}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {new Date(seller.joined_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      <span>{stats.totalProducts} products</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleFollowSeller}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      seller.is_following
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {seller.is_following ? 'Following' : 'Follow'}
                  </button>
                  <button
                    onClick={handleContactSeller}
                    className="flex items-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Contact
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 border-2 border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Seller Description */}
              <p className="text-gray-700 mb-4">{seller.description}</p>

              {/* Performance Badges */}
              <div className="flex flex-wrap gap-3">
                {seller.is_top_rated && (
                  <span className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                    <Award className="h-4 w-4" />
                    Top Rated Seller
                  </span>
                )}
                {stats.responseRate >= 90 && (
                  <span className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    <Clock className="h-4 w-4" />
                    Fast Responder
                  </span>
                )}
                {stats.onTimeDelivery >= 95 && (
                  <span className="flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                    <Truck className="h-4 w-4" />
                    Reliable Shipping
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-gray-600">Total Sales</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSales.toLocaleString()}</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-600">Average Rating</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.avgRating.toFixed(1)}/5.0</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-purple-600" />
                <span className="text-sm text-gray-600">Response Rate</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.responseRate}%</p>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="h-5 w-5 text-orange-600" />
                <span className="text-sm text-gray-600">On-time Delivery</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.onTimeDelivery}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 font-medium border-b-2 transition-colors ${
                activeTab === 'products'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-4 font-medium border-b-2 transition-colors ${
                activeTab === 'reviews'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Reviews ({reviews.length})
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`py-4 font-medium border-b-2 transition-colors ${
                activeTab === 'about'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              About
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Category Filter */}
                <div className="relative">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="appearance-none px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>

                {/* Sort */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="newest">Newest First</option>
                    <option value="popular">Most Popular</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>

                {/* View Mode Toggle */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${
                      viewMode === 'grid'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Grid className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${
                      viewMode === 'list'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {getPaginatedProducts().length > 0 ? (
              <>
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
                }>
                  {getPaginatedProducts().map(product => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      viewMode={viewMode}
                      onClick={() => navigate(`/products/${product.id}`)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-4 py-2 rounded-lg ${
                          currentPage === i + 1
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
                <p className="text-gray-600">Try adjusting your filters or search query</p>
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Rating Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold mb-4">Customer Reviews</h3>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    {stats.avgRating.toFixed(1)}
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(stats.avgRating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">{stats.totalReviews} reviews</p>
                </div>
                
                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map(rating => {
                    const count = reviews.filter(r => r.rating === rating).length;
                    const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                    return (
                      <div key={rating} className="flex items-center gap-3 mb-2">
                        <span className="text-sm text-gray-600 w-12">{rating} star</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-4">
              {reviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
              
              {reviews.length === 0 && (
                <div className="text-center py-16 bg-white rounded-lg">
                  <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
                  <p className="text-gray-600">Be the first to review this seller's products</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold mb-4">About {seller.shop_name}</h3>
              <p className="text-gray-700 leading-relaxed mb-6">{seller.about || seller.description}</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                  <div className="space-y-2">
                    {seller.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-5 w-5" />
                        <a href={`mailto:${seller.email}`} className="hover:text-blue-600">
                          {seller.email}
                        </a>
                      </div>
                    )}
                    {seller.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-5 w-5" />
                        <a href={`tel:${seller.phone}`} className="hover:text-blue-600">
                          {seller.phone}
                        </a>
                      </div>
                    )}
                    {seller.address && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-5 w-5" />
                        <span>{seller.address}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Shop Policies</h4>
                  <div className="space-y-2 text-gray-600">
                    <p><strong>Return Policy:</strong> {seller.return_policy || '30 days return'}</p>
                    <p><strong>Shipping:</strong> {seller.shipping_info || 'Ships within 1-3 business days'}</p>
                    <p><strong>Payment:</strong> M-Pesa, Credit/Debit Cards</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <ContactSellerModal 
          seller={seller} 
          onClose={() => setShowContactModal(false)} 
        />
      )}
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product, viewMode, onClick }) => {
  if (viewMode === 'list') {
    return (
      <div 
        onClick={onClick}
        className="bg-white rounded-lg shadow-sm p-4 flex gap-4 hover:shadow-md transition-shadow cursor-pointer"
      >
        <img
          src={product.image_url || 'https://via.placeholder.com/150'}
          alt={product.name}
          className="w-32 h-32 object-cover rounded-lg"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium">{product.rating}</span>
              <span className="text-sm text-gray-500">({product.reviews_count})</span>
            </div>
            <span className="text-sm text-gray-500">{product.sales_count} sold</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-blue-600">KSh {product.price.toLocaleString()}</span>
              {product.original_price && (
                <span className="text-gray-400 line-through ml-2">KSh {product.original_price.toLocaleString()}</span>
              )}
            </div>
            {product.stock > 0 ? (
              <span className="text-green-600 text-sm font-medium">In Stock</span>
            ) : (
              <span className="text-red-600 text-sm font-medium">Out of Stock</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="relative pb-[100%]">
        <img
          src={product.image_url || 'https://via.placeholder.com/300'}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {product.discount_percentage && (
          <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
            -{product.discount_percentage}%
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold">OUT OF STOCK</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 h-12">{product.name}</h3>
        <div className="flex items-center gap-1 mb-2">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-medium">{product.rating}</span>
          <span className="text-sm text-gray-500">({product.reviews_count})</span>
        </div>
        <div className="mb-2">
          <span className="text-xl font-bold text-blue-600">KSh {product.price.toLocaleString()}</span>
          {product.original_price && (
            <span className="text-gray-400 line-through text-sm ml-2">
              KSh {product.original_price.toLocaleString()}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">{product.sales_count} sold</p>
      </div>
    </div>
  );
};

// Review Card Component
const ReviewCard = ({ review }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
            {review.user_name ? review.user_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{review.user_name || 'Anonymous'}</h4>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {new Date(review.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
        {review.verified_purchase && (
          <span className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
            <CheckCircle className="h-3 w-3" />
            Verified Purchase
          </span>
        )}
      </div>
      
      {review.product_name && (
        <p className="text-sm text-gray-600 mb-2">
          Product: <span className="font-medium">{review.product_name}</span>
        </p>
      )}
      
      <p className="text-gray-700 mb-3">{review.comment}</p>
      
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mb-3">
          {review.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Review ${idx + 1}`}
              className="w-20 h-20 object-cover rounded-lg"
            />
          ))}
        </div>
      )}
      
      {review.seller_response && (
        <div className="bg-gray-50 rounded-lg p-4 mt-4">
          <div className="flex items-start gap-2">
            <Store className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900 mb-1">Seller Response</p>
              <p className="text-gray-700 text-sm">{review.seller_response}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(review.response_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex items-center gap-4 mt-4 pt-4 border-t">
        <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 text-sm">
          <ThumbsUp className="h-4 w-4" />
          <span>Helpful ({review.helpful_count || 0})</span>
        </button>
      </div>
    </div>
  );
};

// Contact Seller Modal Component
const ContactSellerModal = ({ seller, onClose }) => {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    email: '',
    phone: ''
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    
    try {
      await fetch(`/api/sellers/${seller.id}/contact`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      setSent(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Contact {seller.shop_name}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {sent ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
              <p className="text-gray-600">The seller will respond to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="What's your inquiry about?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Phone (Optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+254 700 000000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Type your message here..."
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>Response Time:</strong> {seller.shop_name} typically responds within 24 hours
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;