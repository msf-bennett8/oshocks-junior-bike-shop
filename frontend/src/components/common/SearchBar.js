// frontend/src/components/common/SearchBar.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, X, TrendingUp, Package, FileText, Wrench, User, Tag } from 'lucide-react';

const SearchBar = ({ 
  placeholder = 'Search for bikes, accessories, parts, blogs...',
  onClose,
  autoFocus = true,
  variant = 'overlay' // 'overlay' | 'inline'
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Search filters/categories
  const filters = [
    { id: 'all', label: 'All', icon: Search },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'blogs', label: 'Blogs', icon: FileText },
    { id: 'services', label: 'Services', icon: Wrench },
    { id: 'sellers', label: 'Sellers', icon: User },
    { id: 'categories', label: 'Categories', icon: Tag }
  ];

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('oshocks_recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  }, []);

  // Auto-focus input
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Debounced search function
  const performSearch = useCallback(async (searchQuery, filter) => {
    if (!searchQuery.trim()) {
      setResults(null);
      return;
    }

    setIsLoading(true);
    
    try {
      // API endpoint for universal search
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/search?q=${encodeURIComponent(searchQuery)}&type=${filter}`,
        {
          headers: {
            'Content-Type': 'application/json',
            // Add auth token if needed
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to mock data for development
      setResults(getMockResults(searchQuery, filter));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle query change with debouncing
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for search
    if (query.length > 0) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(query, activeFilter);
      }, 300); // 300ms debounce
    } else {
      setResults(null);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, activeFilter, performSearch]);

  // Save to recent searches
  const saveRecentSearch = (searchText) => {
    const updated = [
      searchText,
      ...recentSearches.filter(s => s !== searchText)
    ].slice(0, 10);
    
    setRecentSearches(updated);
    try {
      localStorage.setItem('oshocks_recent_searches', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save search:', error);
    }
  };

  // Handle result click
  const handleResultClick = (result) => {
    saveRecentSearch(query);
    
    // Navigate based on result type
    switch (result.type) {
      case 'product':
        navigate(`/product/${result.id}`);
        break;
      case 'blog':
        navigate(`/blog/${result.slug || result.id}`);
        break;
      case 'service':
        navigate(`/services#${result.slug || result.id}`);
        break;
      case 'seller':
        navigate(`/seller/${result.id}`);
        break;
      case 'category':
        navigate(`/shop?category=${result.slug || result.id}`);
        break;
      default:
        navigate(`/search?q=${encodeURIComponent(query)}`);
    }
    
    if (onClose) onClose();
  };

  // Handle recent search click
  const handleRecentClick = (search) => {
    setQuery(search);
    performSearch(search, activeFilter);
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('oshocks_recent_searches');
    } catch (error) {
      console.error('Failed to clear searches:', error);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!results) return;

      const allResults = getAllResultsFlat(results);
      
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
  }, [results, selectedIndex, onClose]);

  // Get all results as flat array for keyboard navigation
  const getAllResultsFlat = (resultsData) => {
    if (!resultsData) return [];
    const flat = [];
    Object.values(resultsData).forEach(category => {
      if (Array.isArray(category)) {
        flat.push(...category);
      }
    });
    return flat;
  };

  // Get icon for result type
  const getResultIcon = (type) => {
    const icons = {
      product: Package,
      blog: FileText,
      service: Wrench,
      seller: User,
      category: Tag
    };
    return icons[type] || Package;
  };

  // Highlight matching text
  const highlightText = (text, query) => {
    if (!query.trim()) return text;
    
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
        className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
          isSelected 
            ? 'bg-blue-50 border-l-4 border-blue-600' 
            : 'hover:bg-gray-50'
        }`}
      >
        <div className="flex-shrink-0 mt-1">
          <Icon size={18} className={isSelected ? 'text-blue-600' : 'text-gray-400'} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 truncate">
            {highlightText(item.title || item.name, query)}
          </div>
          {item.description && (
            <div className="text-sm text-gray-600 truncate mt-0.5">
              {item.description}
            </div>
          )}
          {item.price && (
            <div className="text-sm font-semibold text-green-600 mt-1">
              KSh {item.price.toLocaleString()}
            </div>
          )}
        </div>
        {item.badge && (
          <span className="flex-shrink-0 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className={variant === 'overlay' ? 'fixed inset-0 bg-black bg-opacity-50 z-50 animate-fade-in' : ''}>
      <div className={
        variant === 'overlay' 
          ? 'bg-white w-full max-w-4xl mx-auto mt-20 rounded-lg shadow-2xl overflow-hidden'
          : 'w-full'
      }>
        
        {/* Search Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Search size={20} className="text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="flex-1 outline-none text-lg"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={18} className="text-gray-400" />
              </button>
            )}
            {onClose && variant === 'overlay' && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
            {filters.map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    activeFilter === filter.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon size={14} />
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Area */}
        <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto">
          {isLoading && (
            <div className="p-8 text-center">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 mt-3">Searching...</p>
            </div>
          )}

          {!query && !isLoading && (
            <div className="p-4">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Clock size={16} />
                      Recent Searches
                    </h3>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecentClick(search)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3 group"
                      >
                        <Clock size={14} className="text-gray-400 group-hover:text-blue-600" />
                        <span className="text-gray-700 group-hover:text-blue-600">
                          {search}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular/Trending */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingUp size={16} />
                  Trending Searches
                </h3>
                <div className="grid grid-cols-2 gap-2">
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
                      className="text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm text-gray-700"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {results && !isLoading && (
            <div>
              {/* Products */}
              {results.products && results.products.length > 0 && (
                <div className="border-b border-gray-200">
                  <h3 className="px-4 py-2 text-xs font-bold text-gray-500 uppercase bg-gray-50">
                    Products ({results.products.length})
                  </h3>
                  <div>
                    {results.products.map((item, idx) => 
                      renderResultItem(item, idx)
                    )}
                  </div>
                </div>
              )}

              {/* Blogs */}
              {results.blogs && results.blogs.length > 0 && (
                <div className="border-b border-gray-200">
                  <h3 className="px-4 py-2 text-xs font-bold text-gray-500 uppercase bg-gray-50">
                    Blog Posts ({results.blogs.length})
                  </h3>
                  <div>
                    {results.blogs.map((item, idx) => 
                      renderResultItem(item, idx + (results.products?.length || 0))
                    )}
                  </div>
                </div>
              )}

              {/* Services */}
              {results.services && results.services.length > 0 && (
                <div className="border-b border-gray-200">
                  <h3 className="px-4 py-2 text-xs font-bold text-gray-500 uppercase bg-gray-50">
                    Services ({results.services.length})
                  </h3>
                  <div>
                    {results.services.map((item, idx) => 
                      renderResultItem(item, idx + (results.products?.length || 0) + (results.blogs?.length || 0))
                    )}
                  </div>
                </div>
              )}

              {/* Sellers */}
              {results.sellers && results.sellers.length > 0 && (
                <div className="border-b border-gray-200">
                  <h3 className="px-4 py-2 text-xs font-bold text-gray-500 uppercase bg-gray-50">
                    Sellers ({results.sellers.length})
                  </h3>
                  <div>
                    {results.sellers.map((item, idx) => 
                      renderResultItem(item, idx + (results.products?.length || 0) + (results.blogs?.length || 0) + (results.services?.length || 0))
                    )}
                  </div>
                </div>
              )}

              {/* Categories */}
              {results.categories && results.categories.length > 0 && (
                <div>
                  <h3 className="px-4 py-2 text-xs font-bold text-gray-500 uppercase bg-gray-50">
                    Categories ({results.categories.length})
                  </h3>
                  <div>
                    {results.categories.map((item, idx) => 
                      renderResultItem(item, idx + (results.products?.length || 0) + (results.blogs?.length || 0) + (results.services?.length || 0) + (results.sellers?.length || 0))
                    )}
                  </div>
                </div>
              )}

              {/* No results */}
              {Object.values(results).every(arr => !arr || arr.length === 0) && (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-gray-600 font-medium">No results found for "{query}"</p>
                  <p className="text-sm text-gray-500 mt-1">Try different keywords or browse categories</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Tips */}
        {variant === 'overlay' && (
          <div className="border-t border-gray-200 px-4 py-2 bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>ESC Close</span>
            </div>
            <span>Searching: {activeFilter}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Mock results for development
const getMockResults = (query, filter) => {
  const mockData = {
    products: [
      { id: 1, type: 'product', title: 'Mountain Bike Pro X', description: '27.5" Aluminum Frame', price: 45000, badge: 'New' },
      { id: 2, type: 'product', title: 'Road Bike Elite', description: 'Carbon Fiber, 21 Speed', price: 85000 },
      { id: 3, type: 'product', title: 'Electric Bike City', description: '250W Motor, 50km Range', price: 120000, badge: 'Hot' }
    ],
    blogs: [
      { id: 1, type: 'blog', title: 'Top 10 Mountain Bikes in Kenya', description: 'Complete buyer\'s guide for 2024', slug: 'top-10-mountain-bikes' },
      { id: 2, type: 'blog', title: 'Bike Maintenance Tips', description: 'Keep your bike running smoothly', slug: 'maintenance-tips' }
    ],
    services: [
      { id: 1, type: 'service', title: 'Bike Repair Service', description: 'Professional repairs and maintenance', price: 2000 },
      { id: 2, type: 'service', title: 'Custom Bike Build', description: 'Build your dream bike', price: 15000 }
    ],
    sellers: [
      { id: 1, type: 'seller', name: 'Oshocks Junior', description: 'Verified Seller • 500+ Sales' },
      { id: 2, type: 'seller', name: 'Bike Master Kenya', description: 'Premium Bikes • 200+ Sales' }
    ],
    categories: [
      { id: 1, type: 'category', name: 'Mountain Bikes', description: '150 products', slug: 'mountain' },
      { id: 2, type: 'category', name: 'Accessories', description: '300+ products', slug: 'accessories' }
    ]
  };

  if (filter === 'all') return mockData;
  return { [filter]: mockData[filter] || [] };
};

export default SearchBar;