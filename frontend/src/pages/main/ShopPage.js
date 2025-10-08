import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../../redux/slices/productSlice';

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
  });

  // Helper function to safely extract error messages
  const getErrorMessage = (error) => {
    if (!error) return null;
    
    // If error is a string, return it
    if (typeof error === 'string') return error;
    
    // If error is an object with message property
    if (error.message) return error.message;
    
    // If it's the backend error object with exception
    if (error.exception) return error.exception;
    
    // If it's an Axios error with response data
    if (error.response?.data?.message) return error.response.data.message;
    
    // Fallback
    return 'An unexpected error occurred. Please try again.';
  };

  useEffect(() => {
    // Fetch categories on mount
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    // Fetch products when filters change
    dispatch(fetchProducts(filters));
  }, [dispatch, filters]);

  const handleCategoryChange = (categoryId) => {
    setFilters({ ...filters, category: categoryId, page: 1 });
  };

  const handleSearchChange = (e) => {
    setFilters({ ...filters, search: e.target.value, page: 1 });
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Products</h2>
          {/* ✅ FIXED: Safely display error message */}
          <p className="text-gray-600 mb-4">{getErrorMessage(error)}</p>
          <p className="text-sm text-gray-500 mb-4">
            Please check your backend connection at:<br />
            <code className="bg-gray-100 px-2 py-1 rounded">http://127.0.0.1:8000</code>
          </p>
          <button 
            onClick={() => {
              dispatch(fetchCategories());
              dispatch(fetchProducts(filters));
            }}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Shop Bicycles & Accessories</h1>
          <p className="text-gray-600">
            Showing {products.length} {pagination?.total ? `of ${pagination.total}` : ''} products
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Filters</h2>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={handleSearchChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategoryChange('')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      filters.category === '' 
                        ? 'bg-purple-600 text-white' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories && categories.length > 0 ? (
                    categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryChange(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          filters.category === category.id 
                            ? 'bg-purple-600 text-white' 
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No categories available</p>
                  )}
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={filters.sort}
                  onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="latest">Latest</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {products.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold mb-2">No Products Found</h3>
                <p className="text-gray-600">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-8 gap-2">
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
                              ? 'bg-purple-600 text-white border-purple-600'
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product }) => {
  return (
    <Link 
      to={`/product/${product.id}`} 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {product.image_url || product.images?.[0] ? (
          <img
            src={product.image_url || product.images?.[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
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
        {product.compare_at_price && Number(product.compare_at_price) > Number(product.price) && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
            {Math.round((1 - Number(product.price) / Number(product.compare_at_price)) * 100)}% OFF
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 min-h-[3.5rem]">
          {product.name}
        </h3>
        
        {/* Rating */}
        {(product.rating || product.reviews_count) && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex text-yellow-400 text-sm">
              {'⭐'.repeat(Math.round(product.rating || 4))}
            </div>
            <span className="text-sm text-gray-600">
              ({product.reviews_count || 0})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl font-bold text-purple-600">
            KSh {Number(product.price).toLocaleString()}
          </span>
          {product.compare_at_price && Number(product.compare_at_price) > Number(product.price) && (
            <span className="text-sm text-gray-400 line-through">
              KSh {Number(product.compare_at_price).toLocaleString()}
            </span>
          )}
        </div>

        {/* Stock Status */}
        {product.stock !== undefined && (
          <div className="mt-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              product.stock > 10 
                ? 'bg-green-100 text-green-800' 
                : product.stock > 0
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {product.stock > 10 
                ? 'In Stock' 
                : product.stock > 0
                ? `Only ${product.stock} left`
                : 'Out of Stock'
              }
            </span>
          </div>
        )}

        {/* Brand */}
        {product.brand && (
          <p className="text-xs text-gray-500 mt-2">
            Brand: <span className="font-medium">{product.brand}</span>
          </p>
        )}
      </div>
    </Link>
  );
};

export default ShopPage;
