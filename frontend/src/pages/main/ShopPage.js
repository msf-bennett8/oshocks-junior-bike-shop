import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../../redux/slices/productSlice';
import { Search, SlidersHorizontal, X, Filter, ChevronDown, Star, Sparkles, TrendingUp, Percent, Zap } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import ActionModal from '../../components/common/ActionModal';
import { ProductRow } from '../../components/shop';
import productService from '../../services/productService';

const ShopPage = () => {
  const dispatch = useDispatch();
  const { items: products, categories, loading, error, pagination } = useSelector(
    (state) => state.products
  );

  const [filters, setFilters] = useState({
    category: '',
    search: '',
    sort: 'latest',
    page: 1,
    min_price: '',
    max_price: '',
    brand: '',
    condition: '',
    stock_status: '',
    min_rating: '',
  });

  const [brands, setBrands] = useState([]);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState({
    price: true,
    brand: true,
    condition: true,
    stock: true,
    rating: true
  });

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);

  const [loadedImages, setLoadedImages] = useState(new Set());

  // Modal state
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'wishlist',
    action: 'add',
    productName: '',
    section: 'shop'
  });

  // Sections state
  const [sections, setSections] = useState({
    featured: [],
    new_arrivals: [],
    best_sellers: [],
    deals: [],
    by_category: []
  });
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('sections'); // 'sections' or 'all'
  const navigate = useNavigate();

  const showModal = (type, action, productName, section = 'shop') => {
    setModal({ isOpen: true, type, action, productName, section });
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleImageLoad = (productId) => {
    setLoadedImages(prev => new Set([...prev, productId]));
  };

  // Helper function to safely extract error messages
  const getErrorMessage = (error) => {
    if (!error) return null;
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    if (error.exception) return error.exception;
    if (error.response?.data?.message) return error.response.data.message;
    return 'An unexpected error occurred. Please try again.';
  };

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    // Always fetch products with replace: true to show only current page
    dispatch(fetchProducts({ ...filters, replace: true }));
  }, [dispatch, filters]);

  const handleCategoryChange = (categoryId) => {
    setFilters(prev => ({ ...prev, category: categoryId, page: 1 }));
    setShowCategoryModal(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleSortChange = (sortValue) => {
    setFilters(prev => ({ ...prev, sort: sortValue, page: 1 }));
    setShowSortModal(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCategoryName = () => {
    if (!filters.category) return 'All Categories';
    const category = categories?.find(cat => cat.id === filters.category);
    return category ? category.name : 'All Categories';
  };

  const getSortName = () => {
    const sortOptions = {
      'latest': 'Latest',
      'price_low': 'Price: Low to High',
      'price_high': 'Price: High to Low',
      'popular': 'Most Popular'
    };
    return sortOptions[filters.sort] || 'Latest';
  };

  // Fetch unique brands for filter
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/products/brands`);
        if (response.ok) {
          const data = await response.json();
          setBrands(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
      }
    };
    fetchBrands();
  }, []);

  const handlePriceChange = (type, value) => {
    setFilters(prev => ({ ...prev, [type]: value, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      search: '',
      sort: 'latest',
      page: 1,
      min_price: '',
      max_price: '',
      brand: '',
      condition: '',
      stock_status: '',
      min_rating: '',
    });
    setShowFiltersModal(false);
  };

  const activeFiltersCount = () => {
    let count = 0;
    if (filters.min_price) count++;
    if (filters.max_price) count++;
    if (filters.brand) count++;
    if (filters.condition) count++;
    if (filters.stock_status) count++;
    if (filters.min_rating) count++;
    return count;
  };

  const toggleFilterSection = (section) => {
    setExpandedFilters(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Fetch product sections
  useEffect(() => {
    const loadSections = async () => {
      try {
        setSectionsLoading(true);
        const response = await productService.getProductSections(6);
        if (response.success) {
          setSections(response.data);
        }
      } catch (error) {
        console.error('Error loading sections:', error);
      } finally {
        setSectionsLoading(false);
      }
    };
    
    if (viewMode === 'sections') {
      loadSections();
    }
  }, [viewMode]);

  const handleViewAll = (section, params = {}) => {
    // Switch to all products view with filters applied
    setViewMode('all');
    
    // Apply section-specific filters
    switch(section) {
      case 'featured':
        // Could add is_featured filter if backend supports it
        break;
      case 'new_arrivals':
        setFilters(prev => ({ ...prev, sort: 'latest' }));
        break;
      case 'best_sellers':
        setFilters(prev => ({ ...prev, sort: 'popular' }));
        break;
      case 'deals':
        // Could filter by products with compare_price
        break;
      case 'category':
        if (params.category_id) {
          setFilters(prev => ({ ...prev, category: params.category_id }));
        }
        break;
      default:
        break;
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const switchToSections = () => {
    setViewMode('sections');
    setFilters({
      category: '',
      search: '',
      sort: 'latest',
      page: 1,
      min_price: '',
      max_price: '',
      brand: '',
      condition: '',
      stock_status: '',
      min_rating: '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Show full skeleton only on initial load
  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen py-4 md:py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Header Skeleton */}
          <div className="mb-4 md:mb-8">
            <div className="h-8 md:h-10 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>

          {/* Mobile Filter Bar Skeleton */}
          <div className="lg:hidden mb-4 space-y-3">
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="flex gap-3">
              <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Desktop Sidebar Skeleton */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="h-6 bg-gray-200 rounded w-24 mb-4 animate-pulse"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Products Grid Skeleton */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <ProductCardSkeleton key={i} delay={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Products</h2>
          <p className="text-gray-600 mb-4">{getErrorMessage(error)}</p>
          <p className="text-sm text-gray-500 mb-4">
            Please check your backend connection at:<br />
            <code className="bg-gray-100 px-2 py-1 rounded">{process.env.REACT_APP_API_URL || 'Not configured'}</code>
          </p>
          <button 
            onClick={() => {
              dispatch(fetchCategories());
              dispatch(fetchProducts(filters));
            }}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 md:py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-4 md:mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-2">Shop Bicycles & Accessories</h1>
            <p className="text-gray-600 text-sm md:text-base">
              {viewMode === 'sections' ? (
                'Discover our curated collections'
              ) : loading ? (
                <span className="inline-block h-4 w-32 bg-gray-200 rounded animate-pulse"></span>
              ) : (
                <>Showing {products.length} {pagination?.total ? `of ${pagination.total}` : ''} products</>
              )}
            </p>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={switchToSections}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'sections' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Collections
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'all' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              All Products
            </button>
          </div>
        </div>

        {/* Mobile Filter Bar */}
        <div className="lg:hidden mb-4 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowCategoryModal(true)}
              className="flex-1 flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <span className="font-medium text-sm">Categories</span>
              <span className="text-xs text-orange-600 font-semibold truncate ml-2">{getCategoryName()}</span>
            </button>
            
            <button
              onClick={() => setShowSortModal(true)}
              className="flex-1 flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-xs text-orange-600 font-semibold truncate ml-2">{getSortName()}</span>
            </button>
            
            <button
              onClick={() => setShowFiltersModal(true)}
              className="flex items-center justify-center px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition relative"
            >
              <Filter className="w-4 h-4" />
              {activeFiltersCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {activeFiltersCount()}
                </span>
              )}
            </button>
          </div>
        </div>

        {viewMode === 'sections' ? (
          /* SECTIONS VIEW */
          <div className="space-y-8">
            {/* Featured Products */}
            <ProductRow
              title="Featured Products"
              products={sections.featured}
              viewAllLink="/shop"
              viewAllParams={{ featured: true }}
              loading={sectionsLoading}
              showModal={showModal}
              loadedImages={loadedImages}
              onImageLoad={handleImageLoad}
              icon={Sparkles}
            />

            {/* Deals & Discounts */}
            <ProductRow
              title="Hot Deals"
              products={sections.deals}
              viewAllLink="/shop"
              viewAllParams={{ on_sale: true }}
              loading={sectionsLoading}
              showModal={showModal}
              loadedImages={loadedImages}
              onImageLoad={handleImageLoad}
              icon={Percent}
            />

            {/* New Arrivals */}
            <ProductRow
              title="New Arrivals"
              products={sections.new_arrivals}
              viewAllLink="/shop"
              viewAllParams={{ sort: 'latest' }}
              loading={sectionsLoading}
              showModal={showModal}
              loadedImages={loadedImages}
              onImageLoad={handleImageLoad}
              icon={Zap}
            />

            {/* Best Sellers */}
            <ProductRow
              title="Best Sellers"
              products={sections.best_sellers}
              viewAllLink="/shop"
              viewAllParams={{ sort: 'popular' }}
              loading={sectionsLoading}
              showModal={showModal}
              loadedImages={loadedImages}
              onImageLoad={handleImageLoad}
              icon={TrendingUp}
            />

            {/* Categories */}
            {!sectionsLoading && sections.by_category.map((category) => (
              <ProductRow
                key={category.id}
                title={category.name}
                products={category.products}
                viewAllLink="/shop"
                viewAllParams={{ category_id: category.id }}
                loading={false}
                showModal={showModal}
                loadedImages={loadedImages}
                onImageLoad={handleImageLoad}
              />
            ))}
          </div>
        ) : (
          /* ALL PRODUCTS VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Desktop Filters Sidebar */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md sticky top-24" style={{ maxHeight: 'calc(100vh - 7rem)' }}>
                <div className="p-6 border-b">
                  <h2 className="text-xl font-bold">Filters</h2>
                </div>
                
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
                  <div className="p-6">
                    {/* Search */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search products..."
                          value={filters.search}
                          onChange={handleSearchChange}
                          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>

                    {/* Categories */}
                    <div className="mb-6">
                      <h3 className="font-semibold mb-3">Categories</h3>
                      <div className="space-y-2">
                        <button
                          onClick={() => handleCategoryChange('')}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                            filters.category === '' 
                              ? 'bg-orange-600 text-white' 
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          All Categories
                        </button>
                        {!categories || categories.length === 0 ? (
                          <div className="space-y-2">
                            {[1, 2, 3].map(i => (
                              <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
                            ))}
                          </div>
                        ) : (
                          categories.map((category) => (
                            <button
                              key={category.id}
                              onClick={() => handleCategoryChange(category.id)}
                              className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                                filters.category === category.id 
                                  ? 'bg-orange-600 text-white' 
                                  : 'hover:bg-gray-100'
                              }`}
                            >
                              {category.name}
                            </button>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Sort */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                      <select
                        value={filters.sort}
                        onChange={(e) => {
                          setFilters(prev => ({ ...prev, sort: e.target.value, page: 1 }));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      >
                        <option value="latest">Latest</option>
                        <option value="price_low">Price: Low to High</option>
                        <option value="price_high">Price: High to Low</option>
                        <option value="popular">Most Popular</option>
                      </select>
                    </div>

                    {/* Price Range */}
                    <div className="mb-6">
                      <button 
                        onClick={() => toggleFilterSection('price')}
                        className="flex items-center justify-between w-full mb-3"
                      >
                        <h3 className="font-semibold text-sm">Price Range (KSh)</h3>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedFilters.price ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedFilters.price && (
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <input
                              type="number"
                              placeholder="Min"
                              value={filters.min_price}
                              onChange={(e) => handlePriceChange('min_price', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                            />
                            <input
                              type="number"
                              placeholder="Max"
                              value={filters.max_price}
                              onChange={(e) => handlePriceChange('max_price', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Brand Filter */}
                    <div className="mb-6">
                      <button 
                        onClick={() => toggleFilterSection('brand')}
                        className="flex items-center justify-between w-full mb-3"
                      >
                        <h3 className="font-semibold text-sm">Brand</h3>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedFilters.brand ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedFilters.brand && (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          <button
                            onClick={() => handleFilterChange('brand', '')}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                              filters.brand === '' ? 'bg-orange-600 text-white' : 'hover:bg-gray-100'
                            }`}
                          >
                            All Brands
                          </button>
                          {brands.map((brand) => (
                            <button
                              key={brand}
                              onClick={() => handleFilterChange('brand', brand)}
                              className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                                filters.brand === brand ? 'bg-orange-600 text-white' : 'hover:bg-gray-100'
                              }`}
                            >
                              {brand}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Condition Filter */}
                    <div className="mb-6">
                      <button 
                        onClick={() => toggleFilterSection('condition')}
                        className="flex items-center justify-between w-full mb-3"
                      >
                        <h3 className="font-semibold text-sm">Condition</h3>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedFilters.condition ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedFilters.condition && (
                        <div className="space-y-2">
                          {[
                            { value: '', label: 'All Conditions' },
                            { value: 'new', label: 'New' },
                            { value: 'used', label: 'Used' },
                            { value: 'refurbished', label: 'Refurbished' }
                          ].map((condition) => (
                            <button
                              key={condition.value}
                              onClick={() => handleFilterChange('condition', condition.value)}
                              className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                                filters.condition === condition.value ? 'bg-orange-600 text-white' : 'hover:bg-gray-100'
                              }`}
                            >
                              {condition.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Stock Status Filter */}
                    <div className="mb-6">
                      <button 
                        onClick={() => toggleFilterSection('stock')}
                        className="flex items-center justify-between w-full mb-3"
                      >
                        <h3 className="font-semibold text-sm">Stock Status</h3>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedFilters.stock ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedFilters.stock && (
                        <div className="space-y-2">
                          {[
                            { value: '', label: 'All' },
                            { value: 'in_stock', label: 'In Stock' },
                            { value: 'low_stock', label: 'Low Stock' },
                            { value: 'out_of_stock', label: 'Out of Stock' }
                          ].map((status) => (
                            <button
                              key={status.value}
                              onClick={() => handleFilterChange('stock_status', status.value)}
                              className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                                filters.stock_status === status.value ? 'bg-orange-600 text-white' : 'hover:bg-gray-100'
                              }`}
                            >
                              {status.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Rating Filter */}
                    <div className="mb-6">
                      <button 
                        onClick={() => toggleFilterSection('rating')}
                        className="flex items-center justify-between w-full mb-3"
                      >
                        <h3 className="font-semibold text-sm">Minimum Rating</h3>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedFilters.rating ? '' : '-rotate-90'}`} />
                      </button>
                      {expandedFilters.rating && (
                        <div className="space-y-2">
                          <button
                            onClick={() => handleFilterChange('min_rating', '')}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                              filters.min_rating === '' ? 'bg-orange-600 text-white' : 'hover:bg-gray-100'
                            }`}
                          >
                            Any Rating
                          </button>
                          {[4, 3, 2, 1].map((rating) => (
                            <button
                              key={rating}
                              onClick={() => handleFilterChange('min_rating', rating.toString())}
                              className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm flex items-center gap-2 ${
                                filters.min_rating === rating.toString() ? 'bg-orange-600 text-white' : 'hover:bg-gray-100'
                              }`}
                            >
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < rating ? 'fill-current' : ''}`}
                                  />
                                ))}
                              </div>
                              <span>& Up</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Clear Filters Button */}
                    {activeFiltersCount() > 0 && (
                      <button
                        onClick={clearFilters}
                        className="w-full py-2 border border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors text-sm font-medium"
                      >
                        Clear All Filters ({activeFiltersCount()})
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {products.length === 0 && !loading ? (
                <div className="bg-white rounded-lg shadow-md text-center py-16">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold mb-2">No Products Found</h3>
                  <p className="text-gray-600">Try adjusting your filters or search terms</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {loading ? (
                      // Show skeletons during loading
                      [1, 2, 3, 4, 5, 6].map(i => (
                        <ProductCardSkeleton key={`skeleton-${i}`} delay={i} />
                      ))
                    ) : (
                      // Show actual products
                      products.map((product) => (
                        <ProductCard 
                          key={product.id} 
                          product={product}
                          onImageLoad={() => handleImageLoad(product.id)}
                          isImageLoaded={loadedImages.has(product.id)}
                          showModal={showModal}
                        />
                      ))
                    )}
                  </div>

                  {/* Pagination */}
                  {pagination && pagination.totalPages > 1 && !loading && (
                    <div className="flex justify-center mt-8 gap-2 flex-wrap">
                      <button
                        onClick={() => handlePageChange(filters.page - 1)}
                        disabled={filters.page === 1}
                        className={`px-4 py-2 rounded-lg border transition ${
                          filters.page === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                        let page;
                        if (pagination.totalPages <= 5) {
                          page = i + 1;
                        } else if (filters.page <= 3) {
                          page = i + 1;
                        } else if (filters.page >= pagination.totalPages - 2) {
                          page = pagination.totalPages - 4 + i;
                        } else {
                          page = filters.page - 2 + i;
                        }
                        
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 rounded-lg border transition ${
                              page === filters.page
                                ? 'bg-orange-600 text-white border-orange-600'
                                : 'bg-white hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(filters.page + 1)}
                        disabled={filters.page === pagination.totalPages}
                        className={`px-4 py-2 rounded-lg border transition ${
                          filters.page === pagination.totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  )}

                  {/* Pagination Skeleton */}
                  {loading && pagination && pagination.totalPages > 1 && (
                    <div className="flex justify-center mt-8 gap-2">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Category Modal (Mobile) */}
        {showCategoryModal && (
          <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
            <div className="bg-white w-full rounded-t-2xl max-h-[80vh] overflow-hidden flex flex-col animate-slide-up">
              <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
                <h3 className="text-lg font-bold">Categories</h3>
                <button 
                  onClick={() => setShowCategoryModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="overflow-y-auto p-4 space-y-2">
                <button
                  onClick={() => handleCategoryChange('')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    filters.category === '' 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  All Categories
                </button>
                {!categories || categories.length === 0 ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        filters.category === category.id 
                          ? 'bg-orange-600 text-white' 
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sort Modal (Mobile) */}
        {showSortModal && (
          <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
            <div className="bg-white w-full rounded-t-2xl overflow-hidden animate-slide-up">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-bold">Sort By</h3>
                <button 
                  onClick={() => setShowSortModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 space-y-2">
                {[
                  { value: 'latest', label: 'Latest' },
                  { value: 'price_low', label: 'Price: Low to High' },
                  { value: 'price_high', label: 'Price: High to Low' },
                  { value: 'popular', label: 'Most Popular' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      filters.sort === option.value 
                        ? 'bg-orange-600 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filters Modal (Mobile) */}
        {showFiltersModal && (
          <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
            <div className="bg-white w-full rounded-t-2xl max-h-[85vh] overflow-hidden flex flex-col animate-slide-up">
              <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
                <h3 className="text-lg font-bold">Filters</h3>
                <div className="flex items-center gap-2">
                  {activeFiltersCount() > 0 && (
                    <button 
                      onClick={clearFilters}
                      className="text-sm text-orange-600 font-medium px-3 py-1"
                    >
                      Clear
                    </button>
                  )}
                  <button 
                    onClick={() => setShowFiltersModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="overflow-y-auto p-4 space-y-6">
                {/* Price Range */}
                <div>
                  <h4 className="font-semibold mb-3 text-sm">Price Range (KSh)</h4>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.min_price}
                      onChange={(e) => handlePriceChange('min_price', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.max_price}
                      onChange={(e) => handlePriceChange('max_price', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* Brand */}
                <div>
                  <h4 className="font-semibold mb-3 text-sm">Brand</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    <button
                      onClick={() => handleFilterChange('brand', '')}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                        filters.brand === '' ? 'bg-orange-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      All Brands
                    </button>
                    {brands.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => handleFilterChange('brand', brand)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                          filters.brand === brand ? 'bg-orange-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Condition */}
                <div>
                  <h4 className="font-semibold mb-3 text-sm">Condition</h4>
                  <div className="space-y-2">
                    {[
                      { value: '', label: 'All Conditions' },
                      { value: 'new', label: 'New' },
                      { value: 'used', label: 'Used' },
                      { value: 'refurbished', label: 'Refurbished' }
                    ].map((condition) => (
                      <button
                        key={condition.value}
                        onClick={() => handleFilterChange('condition', condition.value)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                          filters.condition === condition.value ? 'bg-orange-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {condition.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stock Status */}
                <div>
                  <h4 className="font-semibold mb-3 text-sm">Stock Status</h4>
                  <div className="space-y-2">
                    {[
                      { value: '', label: 'All' },
                      { value: 'in_stock', label: 'In Stock' },
                      { value: 'low_stock', label: 'Low Stock' },
                      { value: 'out_of_stock', label: 'Out of Stock' }
                    ].map((status) => (
                      <button
                        key={status.value}
                        onClick={() => handleFilterChange('stock_status', status.value)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                          filters.stock_status === status.value ? 'bg-orange-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <h4 className="font-semibold mb-3 text-sm">Minimum Rating</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleFilterChange('min_rating', '')}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                        filters.min_rating === '' ? 'bg-orange-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      Any Rating
                    </button>
                    {[4, 3, 2, 1].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleFilterChange('min_rating', rating.toString())}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm flex items-center gap-2 ${
                          filters.min_rating === rating.toString() ? 'bg-orange-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < rating ? 'fill-current' : ''}`}
                            />
                          ))}
                        </div>
                        <span>& Up</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <div className="p-4 border-t bg-gray-50">
                <button
                  onClick={() => setShowFiltersModal(false)}
                  className="w-full py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition"
                >
                  Show Results
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Modal */}
        <ActionModal 
          isOpen={modal.isOpen}
          onClose={closeModal}
          type={modal.type}
          action={modal.action}
          productName={modal.productName}
          section={modal.section}
        />

        {/* CSS Styles */}
        <style>{`
          @keyframes slide-up {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }
          .animate-slide-up {
            animation: slide-up 0.3s ease-out;
          }
          /* Hide scrollbar for variant thumbnails */
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </div>
  );
};

// Product Card Skeleton Component with staggered animation
const ProductCardSkeleton = ({ delay = 0 }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden"
      style={{ animationDelay: `${delay * 50}ms` }}
    >
      {/* Image skeleton */}
      <div className="aspect-square bg-gray-200 animate-pulse"></div>
      
      <div className="p-4 space-y-3">
        {/* Title skeleton - 2 lines to match min-h-[3.5rem] */}
        <div className="space-y-2 min-h-[3.5rem]">
          <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        </div>
        
        {/* Rating skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-10 animate-pulse"></div>
        </div>
        
        {/* Price skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-7 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
        </div>
        
        {/* Stock badge skeleton */}
        <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
        
        {/* Brand skeleton */}
        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
      </div>
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product, onImageLoad, isImageLoaded, showModal }) => {
  const { addToCart, toggleCart, loading: cartLoading, isInCart } = useCart();
  const { toggleWishlist, isInWishlist, loading: wishlistLoading } = useWishlist();
  const [isAdding, setIsAdding] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  // Check if product is in wishlist and cart
  const inWishlist = isInWishlist(product.id, null);
  const variant = product?.variants?.[0] || product?.colors?.[0] || null;
  const inCart = isInCart(product.id, variant);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsTogglingWishlist(true);
    
    try {
      const wasInWishlist = inWishlist;
      const result = await toggleWishlist(product, null);
      
      if (result.success) {
        showModal('wishlist', wasInWishlist ? 'remove' : 'add', product.name, 'shop');
      } else {
        showModal('cart', 'error', result.error, 'shop');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      showModal('cart', 'error', 'Failed to update wishlist', 'shop');
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAdding(true);
    
    try {
      const wasInCart = inCart;
      const result = await toggleCart(product, variant);
      
      if (result.success) {
        showModal('cart', wasInCart ? 'remove' : 'add', product.name, 'shop');
      } else {
        showModal('cart', 'error', result.error, 'shop');
      }
    } catch (error) {
      console.error('Error toggling cart:', error);
      showModal('cart', 'error', 'Failed to update cart', 'shop');
    } finally {
      setIsAdding(false);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.quantity === 0) return;
    
    setCheckingOut(product.id);
    
    try {
      const result = await toggleCart(product, variant);
      
      if (result.success) {
        window.location.href = '/checkout';
      } else {
        showModal('cart', 'error', result.error, 'shop');
        setCheckingOut(null);
      }
    } catch (error) {
      console.error('Error:', error);
      showModal('cart', 'error', 'Failed to proceed to checkout', 'shop');
      setCheckingOut(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 relative">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative pb-[75%] bg-gray-100 flex">
          {/* Variant Thumbnails Column - Top Left */}
          {product.variants && product.variants.length > 0 && (
            <div className="absolute top-2 left-2 z-20 flex flex-col gap-1.5 max-h-[70%] overflow-y-auto overflow-x-hidden scrollbar-hide">
              {product.variants.slice(0, 4).map((variant, idx) => {
                const variantImage = variant.images?.[0]?.thumbnail_url || 
                                     variant.images?.[0]?.image_url;
                
                return (
                  <button
                    key={variant.id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      const card = e.currentTarget.closest('.relative');
                      const mainImg = card?.querySelector('img[data-main-image="true"]');
                      
                      if (mainImg && variantImage) {
                        mainImg.style.opacity = '0.6';
                        mainImg.style.transform = 'scale(0.95)';
                        
                        setTimeout(() => {
                          mainImg.src = variant.images?.[0]?.image_url || variantImage;
                          mainImg.style.opacity = '1';
                          mainImg.style.transform = 'scale(1)';
                          
                          const allThumbs = e.currentTarget.parentElement.querySelectorAll('button');
                          allThumbs.forEach(thumb => {
                            thumb.classList.remove('ring-2', 'ring-orange-500', 'ring-offset-1');
                          });
                          e.currentTarget.classList.add('ring-2', 'ring-orange-500', 'ring-offset-1');
                        }, 150);
                      }
                    }}
                    className="group relative w-10 h-10 rounded-lg border-2 border-white/80 shadow-md overflow-hidden hover:scale-115 hover:z-10 transition-all duration-200 hover:border-orange-400 bg-gray-100"
                    title={variant.name || `Variant ${idx + 1}`}
                  >
                    <div className="w-full h-full overflow-hidden">
                      {variantImage ? (
                        <img
                          src={variantImage}
                          alt={variant.name || `Variant ${idx + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-125"
                          loading="lazy"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                    </div>
                    
                    <div 
                      className="absolute inset-0 items-center justify-center text-[8px] font-bold text-white uppercase"
                      style={{
                        display: variantImage ? 'none' : 'flex',
                        background: `linear-gradient(135deg, ${['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][idx % 6]} 0%, ${['#b91c1c', '#1d4ed8', '#047857', '#b45309', '#6d28d9', '#be185d'][idx % 6]} 100%)`
                      }}
                    >
                      {variant.name?.charAt(0) || (idx + 1)}
                    </div>
                    
                    <div className="absolute inset-0 rounded-lg ring-2 ring-transparent ring-offset-1 transition-all pointer-events-none" />
                    
                    <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-30">
                      {variant.name || `Variant ${idx + 1}`}
                    </span>
                  </button>
                );
              })}
              {/* Reset/Rollback to Original Image */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  const card = e.currentTarget.closest('.relative');
                  const mainImg = card?.querySelector('img[data-main-image="true"]');
                  const originalImage = product.images?.[0]?.image_url || product.image_url;
                  
                  if (mainImg && originalImage) {
                    mainImg.style.opacity = '0.6';
                    mainImg.style.transform = 'scale(0.95)';
                    
                    setTimeout(() => {
                      mainImg.src = originalImage;
                      mainImg.style.opacity = '1';
                      mainImg.style.transform = 'scale(1)';
                      
                      const allThumbs = e.currentTarget.parentElement.querySelectorAll('button');
                      allThumbs.forEach(thumb => {
                        thumb.classList.remove('ring-2', 'ring-orange-500', 'ring-offset-1');
                      });
                    }, 150);
                  }
                }}
                className="group relative w-10 h-10 rounded-lg border-2 border-white/80 shadow-md bg-gray-800/80 backdrop-blur-sm flex items-center justify-center text-white hover:bg-orange-500 hover:border-orange-400 transition-all duration-200"
                title="Reset to original image"
              >
                <svg 
                  className="w-5 h-5 transition-transform group-hover:rotate-[-45deg]" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" 
                  />
                </svg>
              </button>
            </div>
          )}
          
          {product.image_url || product.images?.[0]?.image_url ? (
            <>
              {!isImageLoaded && (product.images?.[0]?.thumbnail_url || product.image_url) && (
                <img
                  src={product.images?.[0]?.thumbnail_url || product.image_url}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover blur-sm"
                />
              )}
              <img
                src={product.images?.[0]?.image_url || product.image_url}
                alt={product.name}
                data-main-image="true"
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${
                  isImageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={onImageLoad}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div class="absolute inset-0 flex items-center justify-center bg-gray-50"><svg class="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg></div>';
                }}
              />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          )}
          
          {/* Featured Badge */}
          {product.is_featured && (
            <span className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Featured
            </span>
          )}
          
          {/* Discount Badge - Top Right */}
          {product.compare_price && Number(product.compare_price) > Number(product.price) && (
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 items-end">
              <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg animate-pulse flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                -{Math.round((1 - Number(product.price) / Number(product.compare_price)) * 100)}% OFF
              </span>
              <span className="bg-orange-500/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-md backdrop-blur-sm">
                Save KSh {(Number(product.compare_price) - Number(product.price)).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <div className="p-4 relative">
          {/* Action Icons - Top Right of Details */}
          <div className="absolute -top-3 -right-3 flex flex-col gap-1 bg-gray-100 rounded-lg p-1.5 border border-gray-200 shadow-md z-20">
            {/* Wishlist Icon */}
            <button
              onClick={handleWishlistToggle}
              disabled={isTogglingWishlist}
              className="p-1.5 rounded-md transition-all hover:scale-110 hover:bg-gray-200 disabled:opacity-50"
            >
              <svg 
                className={`w-4 h-4 ${inWishlist ? 'text-orange-500 fill-orange-500' : 'text-gray-600'}`} 
                fill={inWishlist ? 'currentColor' : 'none'} 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                />
              </svg>
            </button>

            {/* Cart Icon */}
            <button
              onClick={handleAddToCart}
              disabled={!product.quantity || cartLoading}
              className="p-1.5 rounded-md transition-all hover:scale-110 hover:bg-gray-200 disabled:opacity-50"
            >
              <svg 
                className={`w-4 h-4 ${inCart ? 'text-orange-500 fill-orange-500' : !product.quantity ? 'text-gray-400' : 'text-gray-600'}`} 
                fill={inCart ? 'currentColor' : 'none'} 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
          </div>

          {/* Brand - Above product name */}
          {product.brand && (
            <p className="text-xs text-gray-500 mb-1">
              Brand: <span className="font-medium text-gray-700">{product.brand}</span>
            </p>
          )}

          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 h-12 text-sm hover:text-green-600 transition pr-8">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex justify-between items-center mt-3">
            <div>
              <span className="text-xl font-bold text-green-600">
                KSh {Number(product.price).toLocaleString()}
              </span>
              {product.compare_price && Number(product.compare_price) > Number(product.price) && (
                <span className="text-sm text-gray-400 line-through ml-2">
                  KSh {Number(product.compare_price).toLocaleString()}
                </span>
              )}
            </div>
          </div>
          
          {/* Condition and Stock Status + Checkout */}
          <div className="flex items-center justify-between gap-2 mt-3">
            {/* Left side - Condition */}
            {product.condition && (
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium whitespace-nowrap">
                {product.condition}
              </span>
            )}
            
            {/* Right side - Stock Status + Checkout */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Stock Status */}
              {product.quantity && product.quantity > 0 ? (
                product.quantity <= 5 ? (
                  <span className="text-xs text-orange-600 font-semibold flex items-center whitespace-nowrap">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-1 animate-pulse"></span>
                    {product.quantity} left!
                  </span>
                ) : (
                  <span className="text-xs text-green-600 font-semibold flex items-center whitespace-nowrap">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    In Stock
                  </span>
                )
              ) : (
                <span className="text-xs text-red-600 font-semibold flex items-center whitespace-nowrap">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                  Out of Stock
                </span>
              )}
              
              {/* Checkout Button */}
              {product.quantity > 0 && (
                <button
                  onClick={handleCheckout}
                  disabled={checkingOut === product.id}
                  className={`text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 sm:px-3 py-1 rounded font-semibold hover:from-orange-600 hover:to-red-600 transition-colors whitespace-nowrap flex items-center gap-1 ${
                    checkingOut === product.id ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {checkingOut === product.id ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Adding...</span>
                    </>
                  ) : (
                    'Buy Now'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ShopPage;