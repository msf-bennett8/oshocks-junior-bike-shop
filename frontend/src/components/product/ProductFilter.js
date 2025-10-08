import React, { useState } from 'react';

// ============================================================================
// PRODUCT FILTER COMPONENT
// ============================================================================

const ProductFilter = ({ 
  onFilterChange, 
  onClearFilters,
  totalProducts = 0,
  isMobile = false 
}) => {
  const [isOpen, setIsOpen] = useState(!isMobile);
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    brands: true,
    features: true,
    rating: true,
    availability: true
  });

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 200000 });
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [availability, setAvailability] = useState({
    inStock: false,
    onSale: false,
    newArrivals: false,
    freeShipping: false
  });

  // Sample filter data for Oshocks Junior Bike Shop
  const categories = [
    { id: 1, name: 'Mountain Bikes', count: 145, icon: '⛰️' },
    { id: 2, name: 'Road Bikes', count: 89, icon: '🚴' },
    { id: 3, name: 'City Bikes', count: 67, icon: '🏙️' },
    { id: 4, name: 'Electric Bikes', count: 42, icon: '⚡' },
    { id: 5, name: 'Kids Bikes', count: 78, icon: '👶' },
    { id: 6, name: 'BMX Bikes', count: 34, icon: '🎪' },
    { id: 7, name: 'Folding Bikes', count: 28, icon: '📦' },
    { id: 8, name: 'Hybrid Bikes', count: 56, icon: '🔄' }
  ];

  const brands = [
    { id: 1, name: 'Trek', count: 92 },
    { id: 2, name: 'Giant', count: 78 },
    { id: 3, name: 'Specialized', count: 65 },
    { id: 4, name: 'Cannondale', count: 54 },
    { id: 5, name: 'Scott', count: 48 },
    { id: 6, name: 'Mongoose', count: 41 },
    { id: 7, name: 'Schwinn', count: 36 },
    { id: 8, name: 'Rad Power', count: 29 }
  ];

  const features = [
    { id: 1, name: 'Disc Brakes', count: 234 },
    { id: 2, name: 'Suspension', count: 189 },
    { id: 3, name: 'Aluminum Frame', count: 312 },
    { id: 4, name: 'Carbon Frame', count: 67 },
    { id: 5, name: '21-Speed', count: 156 },
    { id: 6, name: '27-Speed', count: 89 },
    { id: 7, name: 'Hydraulic Brakes', count: 78 },
    { id: 8, name: 'Quick Release', count: 145 }
  ];

  const priceRanges = [
    { id: 1, label: 'Under KES 20,000', min: 0, max: 20000, count: 45 },
    { id: 2, label: 'KES 20,000 - 40,000', min: 20000, max: 40000, count: 128 },
    { id: 3, label: 'KES 40,000 - 60,000', min: 40000, max: 60000, count: 156 },
    { id: 4, label: 'KES 60,000 - 100,000', min: 60000, max: 100000, count: 89 },
    { id: 5, label: 'Over KES 100,000', min: 100000, max: 200000, count: 34 }
  ];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleBrandToggle = (brandId) => {
    setSelectedBrands(prev => 
      prev.includes(brandId) 
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };

  const handleFeatureToggle = (featureId) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const handlePriceRangeSelect = (min, max) => {
    setPriceRange({ min, max });
  };

  const handleAvailabilityToggle = (key) => {
    setAvailability(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
    setPriceRange({ min: 0, max: 200000 });
    setSelectedBrands([]);
    setSelectedFeatures([]);
    setMinRating(0);
    setAvailability({
      inStock: false,
      onSale: false,
      newArrivals: false,
      freeShipping: false
    });
    if (onClearFilters) onClearFilters();
  };

  const getActiveFiltersCount = () => {
    return selectedCategories.length + 
           selectedBrands.length + 
           selectedFeatures.length +
           (minRating > 0 ? 1 : 0) +
           Object.values(availability).filter(Boolean).length;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Mobile Filter Toggle */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 border-b border-gray-200"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="font-semibold text-gray-900">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <svg 
            className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      {/* Filter Content */}
      <div className={`${isMobile && !isOpen ? 'hidden' : 'block'}`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900">Filter Products</h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={handleClearAll}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear All
              </button>
            )}
          </div>
          <p className="text-sm text-gray-600">{totalProducts} products available</p>
        </div>

        {/* Availability Quick Filters */}
        <div className="p-4 border-b border-gray-200">
          <div className="space-y-2">
            {[
              { key: 'inStock', label: 'In Stock', icon: '✓' },
              { key: 'onSale', label: 'On Sale', icon: '🏷️' },
              { key: 'newArrivals', label: 'New Arrivals', icon: '✨' },
              { key: 'freeShipping', label: 'Free Shipping', icon: '🚚' }
            ].map((item) => (
              <label key={item.key} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={availability[item.key]}
                  onChange={() => handleAvailabilityToggle(item.key)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="flex items-center gap-2 text-sm text-gray-700 group-hover:text-gray-900">
                  <span>{item.icon}</span>
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection('categories')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-gray-900">Categories</span>
            <svg 
              className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.categories ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.categories && (
            <div className="px-4 pb-4 space-y-2">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleCategoryToggle(category.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="flex items-center gap-2 text-sm text-gray-700 group-hover:text-gray-900">
                      <span>{category.icon}</span>
                      {category.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">({category.count})</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Price Range */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection('price')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-gray-900">Price Range</span>
            <svg 
              className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.price ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.price && (
            <div className="px-4 pb-4 space-y-3">
              {priceRanges.map((range) => (
                <button
                  key={range.id}
                  onClick={() => handlePriceRangeSelect(range.min, range.max)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                    priceRange.min === range.min && priceRange.max === range.max
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className={`text-sm font-medium ${
                    priceRange.min === range.min && priceRange.max === range.max
                      ? 'text-blue-600'
                      : 'text-gray-700'
                  }`}>
                    {range.label}
                  </span>
                  <span className="text-xs text-gray-500">({range.count})</span>
                </button>
              ))}
              
              {/* Custom Range */}
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-700 mb-2">Custom Range</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min || ''}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max || ''}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 200000 }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Brands */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection('brands')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-gray-900">Brands</span>
            <svg 
              className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.brands ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.brands && (
            <div className="px-4 pb-4">
              <input
                type="text"
                placeholder="Search brands..."
                className="w-full px-3 py-2 mb-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {brands.map((brand) => (
                  <label key={brand.id} className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand.id)}
                        onChange={() => handleBrandToggle(brand.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">{brand.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">({brand.count})</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection('features')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-gray-900">Features</span>
            <svg 
              className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.features ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.features && (
            <div className="px-4 pb-4 space-y-2">
              {features.map((feature) => (
                <label key={feature.id} className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedFeatures.includes(feature.id)}
                      onChange={() => handleFeatureToggle(feature.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">{feature.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">({feature.count})</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Rating */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection('rating')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-gray-900">Minimum Rating</span>
            <svg 
              className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.rating ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.rating && (
            <div className="px-4 pb-4 space-y-2">
              {[4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setMinRating(rating === minRating ? 0 : rating)}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${
                    minRating === rating ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-700">& Up</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Apply Filters Button (Mobile) */}
        {isMobile && (
          <div className="p-4">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Apply Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// DEMO COMPONENT WITH FILTER
// ============================================================================

const ProductFilterDemo = () => {
  const [filters, setFilters] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Filters</h1>
        <p className="text-gray-600 mb-8">Comprehensive filtering system for Oshocks Junior Bike Shop</p>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Desktop Filter Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-4">
              <ProductFilter
                totalProducts={452}
                onFilterChange={(filters) => {
                  setFilters(filters);
                  console.log('Filters changed:', filters);
                }}
                onClearFilters={() => {
                  setFilters(null);
                  console.log('Filters cleared');
                }}
                isMobile={false}
              />
            </div>
          </div>

          {/* Products Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Filter Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700">8 product categories with icons</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700">Quick availability filters</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700">5 predefined price ranges + custom</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700">8 premium bike brands</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700">Brand search functionality</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700">8 bike features/specifications</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700">Star rating filter (1-4+ stars)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700">Expandable/collapsible sections</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700">Active filters counter badge</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700">Clear all filters button</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700">Mobile-responsive design</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-700">Product count per filter option</span>
                </div>
              </div>
            </div>

            {/* Sample Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg mb-3 flex items-center justify-center">
                    <span className="text-4xl">🚴</span>
                  </div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-2 line-clamp-2">
                    Sample Bike Product {item}
                  </h3>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    KES {(35000 + item * 5000).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFilterDemo;
