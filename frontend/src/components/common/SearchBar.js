import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Search, X, TrendingUp, Clock, Package, Tag, Store, User as UserIcon } from 'lucide-react';
import { searchProducts } from '../../redux/slices/productSlice';

const SearchBar = ({ 
  placeholder = 'Search for bikes, accessories, categories, sellers...',
  onClose,
  autoFocus = true,
  variant = 'overlay' // 'overlay' | 'inline'
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Get search results from Redux
  const { searchResults, searchLoading, searchError } = useSelector((state) => state.products);

  // Search filters/categories
  const filters = [
    { id: 'all', label: 'All', icon: Search },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'sellers', label: 'Sellers', icon: Store },
    { id: 'users', label: 'Users', icon: UserIcon }
  ];

  // Load recent searches (using state instead of localStorage)
  useEffect(() => {
    setRecentSearches([]);
  }, []);

  // Auto-focus input
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Debounced search function
// Debounced search function
const performSearch = useCallback(async (searchQuery) => {
  if (!searchQuery.trim()) {
    console.log('🔍 Search aborted: Empty query');
    return;
  }

  console.log('🔍 Performing search:', {
    query: searchQuery,
    filter: activeFilter,
    timestamp: new Date().toISOString()
  });

  // Dispatch Redux action to search with type filter
  dispatch(searchProducts({ query: searchQuery, type: activeFilter }));
}, [dispatch, activeFilter]);

  // Handle query change with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length > 0) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(query);
      }, 300);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, performSearch]);

  // Re-search when filter changes
  useEffect(() => {
    if (query.trim()) {
      performSearch(query);
    }
  }, [activeFilter]);

  // Save to recent searches (in memory only)
  const saveRecentSearch = (searchText) => {
    const updated = [
      searchText,
      ...recentSearches.filter(s => s !== searchText)
    ].slice(0, 10);
    
    setRecentSearches(updated);
  };

  // Handle result click - navigate based on type
  const handleResultClick = (result) => {
    saveRecentSearch(query);
    
    switch (result.type) {
      case 'product':
        navigate(`/product/${result.id}`);
        break;
      case 'category':
        navigate(`/shop?category=${result.id}`);
        break;
      case 'seller':
        navigate(`/seller/${result.id}`);
        break;
      case 'user':
        navigate(`/profile/${result.id}`);
        break;
      default:
        navigate(`/search?q=${encodeURIComponent(query)}`);
    }
    
    if (onClose) onClose();
  };

  // Handle recent search click
  const handleRecentClick = (search) => {
    setQuery(search);
    performSearch(search);
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  // Get all results as flat array for keyboard navigation
  const getAllResultsFlat = () => {
    if (!searchResults?.data) return [];
    
    const flat = [];
    Object.values(searchResults.data).forEach(category => {
      if (Array.isArray(category)) {
        flat.push(...category);
      }
    });
    return flat;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      const allResults = getAllResultsFlat();
      if (allResults.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < allResults.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && allResults[selectedIndex]) {
            handleResultClick(allResults[selectedIndex]);
          }
          break;
        case 'Escape':
          if (onClose) onClose();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchResults, selectedIndex, onClose]);

  // Get icon for result type
  const getResultIcon = (type) => {
    const icons = {
      product: Package,
      category: Tag,
      seller: Store,
      user: UserIcon
    };
    return icons[type] || Package;
  };

  // Highlight matching text
  const highlightText = (text, query) => {
    if (!query.trim() || !text) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 text-gray-900 font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Render result item
  const renderResultItem = (item, index) => {
    const Icon = getResultIcon(item.type);
    const isSelected = index === selectedIndex;

    return (
      <button
        key={`${item.type}-${item.id}`}
        onClick={() => handleResultClick(item)}
        className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 flex items-start gap-2 sm:gap-3 transition-all ${
          isSelected 
            ? 'bg-blue-50 border-l-4 border-blue-600 shadow-sm' 
            : 'hover:bg-gray-50 active:bg-gray-100'
        }`}
      >
        <div className="flex-shrink-0 mt-0.5 sm:mt-1">
          <Icon size={16} className={`sm:w-[18px] sm:h-[18px] ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm sm:text-base text-gray-900 truncate">
            {highlightText(item.name, query)}
          </div>
          {item.description && (
            <div className="text-xs sm:text-sm text-gray-600 truncate mt-0.5">
              {item.description.substring(0, 80)}...
            </div>
          )}
          {item.type === 'product' && item.price && (
            <div className="text-sm sm:text-base font-semibold text-green-600 mt-1">
              KSh {parseFloat(item.price).toLocaleString()}
            </div>
          )}
          {item.type === 'category' && item.product_count !== undefined && (
            <div className="text-xs sm:text-sm text-gray-500 mt-1">
              {item.product_count} products
            </div>
          )}
          {item.type === 'seller' && item.rating && (
            <div className="text-xs sm:text-sm text-gray-500 mt-1">
              ⭐ {item.rating} • {item.total_sales || 0} sales
            </div>
          )}
        </div>
        {item.type === 'product' && item.quantity === 0 && (
          <span className="flex-shrink-0 text-[10px] sm:text-xs bg-red-100 text-red-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium">
            Out of Stock
          </span>
        )}
        {item.type === 'product' && item.quantity > 0 && item.quantity < 5 && (
          <span className="flex-shrink-0 text-[10px] sm:text-xs bg-orange-100 text-orange-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium">
            Low Stock
          </span>
        )}
      </button>
    );
  };

  // Get total results count
  const getTotalCount = () => {
    if (!searchResults?.data) return 0;
    return Object.values(searchResults.data).reduce((total, arr) => {
      return total + (Array.isArray(arr) ? arr.length : 0);
    }, 0);
  };

  return (
    <div className={variant === 'overlay' ? 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-4 animate-fade-in' : ''}>
      <div className={
        variant === 'overlay' 
          ? 'bg-white w-full max-w-3xl mt-12 sm:mt-16 md:mt-20 rounded-xl shadow-2xl overflow-hidden animate-slide-down'
          : 'w-full'
      }>
        
        {/* Search Header */}
        <div className="border-b border-gray-200 p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex-1 flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 rounded-lg border-2 border-gray-300 focus-within:border-blue-500 focus-within:bg-white transition-all">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="flex-1 outline-none text-base sm:text-lg placeholder:text-gray-400 placeholder:text-sm sm:placeholder:text-base bg-transparent focus:ring-0 focus:outline-none"
                style={{ boxShadow: 'none' }}
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                  aria-label="Clear search"
                >
                  <X size={18} className="text-gray-400" />
                </button>
              )}
              <button
                onClick={() => {
                  if (query.trim()) {
                    performSearch(query);
                  }
                }}
                className="flex items-center gap-1.5 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg transition-all font-medium text-sm sm:text-base shadow-md hover:shadow-lg flex-shrink-0"
                aria-label="Search"
              >
                <Search size={18} className="md:hidden" />
                <Search size={16} className="hidden md:inline md:w-[18px] md:h-[18px]" />
                <span className="hidden md:inline">Search</span>
              </button>
            </div>
            {onClose && variant === 'overlay' && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                aria-label="Close search"
              >
                <X size={20} className="text-gray-600" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-1.5 sm:gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
            {filters.map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                    activeFilter === filter.id
                      ? 'bg-blue-600 text-white shadow-md scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'
                  }`}
                >
                  <Icon size={14} className="sm:w-4 sm:h-4" />
                  <span>{filter.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Area */}
        <div ref={resultsRef} className="max-h-[50vh] sm:max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {/* ADD THIS LOGGING EFFECT */}
            {(() => {
              console.log('🔍 Search State:', {
                loading: searchLoading,
                error: searchError,
                hasResults: !!searchResults,
                resultsData: searchResults?.data,
                totalCount: getTotalCount(),
                query: query
              });
              return null;
            })()}
          {searchLoading && (
            <div className="p-8 text-center">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 mt-3">Searching...</p>
            </div>
          )}

          {searchError && (
            <div className="p-8 text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <p className="text-red-600 font-medium">Search failed</p>
              <p className="text-sm text-gray-500 mt-1">
                {typeof searchError === 'string' 
                  ? searchError 
                  : searchError.message || 'An error occurred while searching'}
              </p>
            </div>
          )}

          {!query && !searchLoading && (
            <div className="p-4">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 flex items-center gap-1.5 sm:gap-2">
                      <Clock size={14} className="sm:w-4 sm:h-4" />
                      Recent Searches
                    </h3>
                    <button
                      onClick={clearRecentSearches}
                      className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-700 font-medium active:scale-95 transition-transform"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecentClick(search)}
                        className="w-full text-left px-2.5 sm:px-3 py-2 hover:bg-gray-50 active:bg-gray-100 rounded-lg transition-all flex items-center gap-2 sm:gap-3 group"
                      >
                        <Clock size={12} className="sm:w-[14px] sm:h-[14px] text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
                        <span className="text-sm sm:text-base text-gray-700 group-hover:text-blue-600 truncate">
                          {search}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular/Trending */}
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5 sm:gap-2">
                  <TrendingUp size={14} className="sm:w-4 sm:h-4" />
                  Trending Searches
                </h3>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                  {[
                    'Mountain Bikes',
                    'Road Bikes',
                    'Bike Helmets',
                    'Cycling Shoes',
                    'Bike Lights',
                    'Water Bottles'
                  ].map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(item)}
                      className="text-left px-2.5 sm:px-3 py-2 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-all text-xs sm:text-sm text-gray-700 font-medium"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {searchResults?.data && getTotalCount() > 0 && !searchLoading && (
            <div>
              {/* Products */}
              {searchResults.data.products && searchResults.data.products.length > 0 && (
                <div className="border-b border-gray-200">
                  <h3 className="px-3 sm:px-4 py-2 text-[10px] sm:text-xs font-bold text-gray-500 uppercase bg-gray-50 tracking-wide">
                    Products ({searchResults.data.products.length})
                  </h3>
                  <div>
                    {searchResults.data.products.map((item, idx) => 
                      renderResultItem(item, idx)
                    )}
                  </div>
                </div>
              )}

              {/* Categories */}
              {searchResults.data.categories && searchResults.data.categories.length > 0 && (
                <div className="border-b border-gray-200">
                  <h3 className="px-3 sm:px-4 py-2 text-[10px] sm:text-xs font-bold text-gray-500 uppercase bg-gray-50 tracking-wide">
                    Categories ({searchResults.data.categories.length})
                  </h3>
                  <div>
                    {searchResults.data.categories.map((item, idx) => 
                      renderResultItem(item, idx + (searchResults.data.products?.length || 0))
                    )}
                  </div>
                </div>
              )}

              {/* Sellers */}
              {searchResults.data.sellers && searchResults.data.sellers.length > 0 && (
                <div className="border-b border-gray-200">
                  <h3 className="px-3 sm:px-4 py-2 text-[10px] sm:text-xs font-bold text-gray-500 uppercase bg-gray-50 tracking-wide">
                    Sellers ({searchResults.data.sellers.length})
                  </h3>
                  <div>
                    {searchResults.data.sellers.map((item, idx) => 
                      renderResultItem(item, idx + (searchResults.data.products?.length || 0) + (searchResults.data.categories?.length || 0))
                    )}
                  </div>
                </div>
              )}

              {/* Users */}
              {searchResults.data.users && searchResults.data.users.length > 0 && (
                <div className="border-b border-gray-200">
                  <h3 className="px-3 sm:px-4 py-2 text-[10px] sm:text-xs font-bold text-gray-500 uppercase bg-gray-50 tracking-wide">
                    Users ({searchResults.data.users.length})
                  </h3>
                  <div>
                    {searchResults.data.users.map((item, idx) => 
                      renderResultItem(item, idx + (searchResults.data.products?.length || 0) + (searchResults.data.categories?.length || 0) + (searchResults.data.sellers?.length || 0))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {searchResults?.data && getTotalCount() === 0 && !searchLoading && query && (
            <div className="p-8 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-gray-600 font-medium">No results found for "{query}"</p>
              <p className="text-sm text-gray-500 mt-1">Try different keywords or browse categories</p>
            </div>
          )}
        </div>

        {/* Footer Tips */}
        {variant === 'overlay' && (
          <div className="border-t border-gray-200 px-3 sm:px-4 py-2 bg-gray-50 text-[10px] sm:text-xs text-gray-500 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="hidden sm:inline">↑↓ Navigate</span>
              <span className="hidden sm:inline">↵ Select</span>
              <span>ESC Close</span>
            </div>
            <span className="text-[10px] sm:text-xs">
              <span className="hidden sm:inline">Filter: </span>
              {filters.find(f => f.id === activeFilter)?.label || 'All'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;