import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBar = ({ 
  placeholder = 'Search for bikes, accessories, parts...',
  onSearch,
  showSuggestions = true,
  showFilters = true,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isListening, setIsListening] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Mock data - Replace with API calls
  const popularSearches = [
    { text: 'Mountain bikes', icon: '🏔️', category: 'bikes' },
    { text: 'Road bikes', icon: '🛣️', category: 'bikes' },
    { text: 'Bike helmets', icon: '🪖', category: 'accessories' },
    { text: 'Cycling shoes', icon: '👟', category: 'accessories' },
    { text: 'Bike lights', icon: '💡', category: 'accessories' },
    { text: 'Water bottles', icon: '🚰', category: 'accessories' }
  ];

  const categories = [
    { id: 'all', name: 'All', icon: '🔍' },
    { id: 'bikes', name: 'Bikes', icon: '🚴' },
    { id: 'accessories', name: 'Accessories', icon: '🎽' },
    { id: 'parts', name: 'Parts', icon: '⚙️' },
    { id: 'gear', name: 'Gear', icon: '🎒' }
  ];

  // Size variants
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

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

  // Generate suggestions based on query
  useEffect(() => {
    if (query.length > 1) {
      // Simulate API call - Replace with actual search API
      const filtered = popularSearches.filter(item =>
        item.text.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [query]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search submission
  const handleSearch = (searchText = query) => {
    if (!searchText.trim()) return;

    // Save to recent searches
    const updatedRecent = [
      searchText,
      ...recentSearches.filter(s => s !== searchText)
    ].slice(0, 5);
    
    setRecentSearches(updatedRecent);
    try {
      localStorage.setItem('oshocks_recent_searches', JSON.stringify(updatedRecent));
    } catch (error) {
      console.error('Failed to save search:', error);
    }

    // Execute search
    if (onSearch) {
      onSearch(searchText, selectedFilter);
    } else {
      navigate(`/shop?search=${encodeURIComponent(searchText)}&category=${selectedFilter}`);
    }

    setIsFocused(false);
    setQuery('');
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  // Handle suggestion click
  const handleSuggestionClick = (text) => {
    setQuery(text);
    handleSearch(text);
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

  // Voice search (if supported)
  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        handleSearch(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert('Voice search is not supported in your browser');
    }
  };

  // Render different variants
  const renderSearchInput = () => {
    const baseClasses = `w-full ${sizeClasses[size]} pr-24 border-2 rounded-lg transition-all duration-200 focus:outline-none ${
      isFocused 
        ? 'border-purple-500 shadow-lg shadow-purple-100' 
        : 'border-gray-300 hover:border-gray-400'
    }`;

    return (
      <div className="relative flex-1">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className={baseClasses}
          autoComplete="off"
        />
        
        {/* Clear button */}
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-20 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✖️
          </button>
        )}

        {/* Voice search button */}
        <button
          type="button"
          onClick={handleVoiceSearch}
          className={`absolute right-12 top-1/2 transform -translate-y-1/2 transition-all duration-200 ${
            isListening 
              ? 'text-red-500 animate-pulse' 
              : 'text-gray-400 hover:text-purple-600'
          }`}
          title="Voice search"
        >
          🎤
        </button>

        {/* Search button */}
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-md hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          🔍
        </button>
      </div>
    );
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="flex gap-2">
        {/* Category filter dropdown */}
        {showFilters && variant !== 'compact' && (
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 bg-white hover:border-gray-400 transition-colors cursor-pointer font-medium text-gray-700"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        )}

        {/* Search input */}
        {renderSearchInput()}
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && isFocused && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          
          {/* Search suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 px-3 py-2">
                Suggestions
              </div>
              {suggestions.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(item.text)}
                  className="w-full text-left px-4 py-3 hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-3 group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">
                    {item.icon}
                  </span>
                  <div className="flex-1">
                    <span className="text-gray-700 group-hover:text-purple-600 font-medium">
                      {item.text}
                    </span>
                  </div>
                  <span className="text-gray-400 text-sm">↵</span>
                </button>
              ))}
            </div>
          )}

          {/* Recent searches */}
          {recentSearches.length > 0 && suggestions.length === 0 && (
            <div className="p-2">
              <div className="flex items-center justify-between px-3 py-2">
                <div className="text-xs font-semibold text-gray-500">
                  Recent Searches
                </div>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                >
                  Clear all
                </button>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(search)}
                  className="w-full text-left px-4 py-3 hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-3 group"
                >
                  <span className="text-gray-400 group-hover:text-purple-600">🕐</span>
                  <span className="text-gray-700 group-hover:text-purple-600 flex-1">
                    {search}
                  </span>
                  <span className="text-gray-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    ↵
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Popular searches */}
          {query.length === 0 && (
            <div className="p-2 border-t border-gray-100">
              <div className="text-xs font-semibold text-gray-500 px-3 py-2">
                Popular Searches
              </div>
              <div className="grid grid-cols-2 gap-2">
                {popularSearches.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(item.text)}
                    className="text-left px-4 py-3 hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-2 group"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                    <span className="text-sm text-gray-700 group-hover:text-purple-600">
                      {item.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick tips */}
          {query.length === 0 && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-t border-purple-100">
              <div className="text-xs font-semibold text-purple-900 mb-2">
                💡 Pro Tips
              </div>
              <ul className="text-xs text-purple-700 space-y-1">
                <li>• Try searching by brand, model, or product type</li>
                <li>• Use filters to narrow down your results</li>
                <li>• Click 🎤 to search using your voice</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Compact variant for mobile/header
export const CompactSearchBar = ({ onSearch }) => {
  return (
    <SearchBar
      placeholder="Search..."
      onSearch={onSearch}
      showFilters={false}
      size="sm"
      variant="compact"
    />
  );
};

// Hero search variant (for homepage)
export const HeroSearchBar = ({ onSearch }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-4xl font-bold text-gray-900 mb-3">
          Find Your Perfect Ride 🚴‍♂️
        </h2>
        <p className="text-gray-600">
          Search thousands of bikes, accessories, and parts from trusted sellers
        </p>
      </div>
      <SearchBar
        placeholder="What are you looking for today?"
        onSearch={onSearch}
        size="lg"
        className="shadow-2xl"
      />
    </div>
  );
};

// Advanced search with more filters
export const AdvancedSearchBar = ({ onSearch }) => {
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [condition, setCondition] = useState('all');
  const [location, setLocation] = useState('all');
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-4">
      <SearchBar onSearch={onSearch} />
      
      {/* Advanced filters toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-purple-600 text-sm font-medium hover:text-purple-700 flex items-center gap-2"
      >
        <span>⚙️</span>
        <span>Advanced Filters</span>
        <span className="text-xs">{showAdvanced ? '▲' : '▼'}</span>
      </button>

      {/* Advanced filters panel */}
      {showAdvanced && (
        <div className="bg-gray-50 rounded-lg p-6 space-y-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Price range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Conditions</option>
                <option value="new">New</option>
                <option value="like-new">Like New</option>
                <option value="used">Used</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Kenya</option>
                <option value="nairobi">Nairobi</option>
                <option value="mombasa">Mombasa</option>
                <option value="kisumu">Kisumu</option>
                <option value="nakuru">Nakuru</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;