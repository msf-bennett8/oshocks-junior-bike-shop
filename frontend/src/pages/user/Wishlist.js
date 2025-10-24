import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Share2, X, Eye, Filter, SortAsc, Grid, List, Trash2, Tag, TrendingUp, Clock, DollarSign, Package, CheckCircle, AlertCircle, Copy, Facebook, Twitter, Mail, MessageCircle, Download, Plus, Minus, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist, clearWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('date-added');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [shareableLink, setShareableLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [expandedStats, setExpandedStats] = useState(true);

  // Get unique categories from wishlist items
  const categories = ['all', ...new Set(wishlistItems.map(item => item.category).filter(Boolean))];
  const sortOptions = [
    { value: 'date-added', label: 'Date Added' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name', label: 'Name A-Z' },
    { value: 'priority', label: 'Priority' },
    { value: 'discount', label: 'Highest Discount' }
  ];

  // Calculate statistics
  const calculateStats = () => {
    const total = wishlistItems.reduce((sum, item) => sum + Number(item.price), 0);
    const savings = wishlistItems.reduce((sum, item) => {
      const original = Number(item.originalPrice || item.price);
      const current = Number(item.price);
      return sum + (original - current);
    }, 0);
    const inStockCount = wishlistItems.filter(item => item.stock > 0 || item.is_active).length;
    const onSaleCount = wishlistItems.filter(item => item.originalPrice && Number(item.originalPrice) > Number(item.price)).length;
    
    return { total, savings, inStockCount, onSaleCount };
  };

  const stats = calculateStats();

// Filter and sort items
  const getFilteredAndSortedItems = () => {
    let filtered = [...wishlistItems];

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    // Price range filter
    filtered = filtered.filter(item => {
      const price = Number(item.price);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return Number(a.price) - Number(b.price);
        case 'price-high':
          return Number(b.price) - Number(a.price);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date-added':
        default:
          return new Date(b.added_at || b.created_at) - new Date(a.added_at || a.created_at);
      }
    });

    return filtered;
  };

  const filteredItems = getFilteredAndSortedItems();

  // Handle item selection
  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const selectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

// Remove items
  const removeItem = async (itemId) => {
    const result = await removeFromWishlist(itemId);
    if (result.success) {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  const removeSelectedItems = async () => {
    for (const itemId of selectedItems) {
      await removeFromWishlist(itemId);
    }
    setSelectedItems([]);
  };

// Add to cart
  const handleAddToCart = async (item) => {
    const variant = item.variant;
    const result = await addToCart(item, 1, variant);
    if (result.success) {
      alert('✅ Added to cart!');
    } else {
      alert('❌ ' + result.error);
    }
  };

  const addSelectedToCart = async () => {
    for (const itemId of selectedItems) {
      const item = wishlistItems.find(i => i.id === itemId);
      if (item) {
        await handleAddToCart(item);
      }
    }
  };

  // Share functionality
  const generateShareableLink = () => {
    const link = `${window.location.origin}/wishlist/share/${Math.random().toString(36).substr(2, 9)}`;
    setShareableLink(link);
    setShowShareModal(true);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const shareVia = (platform) => {
    const text = `Check out my wishlist on Oshocks Bike Shop!`;
    const url = shareableLink;

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      email: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank');
    }
  };

  // Export wishlist
  const exportWishlist = () => {
    const data = wishlistItems.map(item => ({
      Name: item.name,
      Category: item.category,
      Price: `KES ${item.price.toLocaleString()}`,
      'In Stock': item.stock > 0 && item.is_active ? 'Yes' : 'No',
      Discount: `${item.discount}%`,
      Notes: item.notes
    }));

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wishlist.csv';
    a.click();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Heart className="w-8 h-8 text-red-500 fill-red-500" />
                My Wishlist
              </h1>
              <p className="text-gray-600 mt-1">{wishlistItems.length} items saved</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={generateShareableLink}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button
                onClick={exportWishlist}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <button
              onClick={() => setExpandedStats(!expandedStats)}
              className="flex items-center justify-between w-full"
            >
              <h3 className="text-lg font-semibold text-gray-900">Wishlist Summary</h3>
              {expandedStats ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            {expandedStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-600">Total Value</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">KES {stats.total.toLocaleString()}</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-600">Total Savings</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">KES {stats.savings.toLocaleString()}</p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-5 h-5 text-purple-600" />
                    <span className="text-sm text-gray-600">In Stock</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">{stats.inStockCount} items</p>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                    <span className="text-sm text-gray-600">On Sale</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">{stats.onSaleCount} items</p>
                </div>
              </div>
            )}
          </div>

          {/* Controls Bar */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {selectedItems.length > 0 && (
                  <>
                    <span className="text-sm text-gray-600">
                      {selectedItems.length} selected
                    </span>
                    <button
                      onClick={addSelectedToCart}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                    <button
                      onClick={removeSelectedItems}
                      className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filter</span>
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <div className="flex gap-1 border border-gray-300 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilterPanel && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat === 'all' ? 'All Categories' : cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range: KES {priceRange[0].toLocaleString()} - KES {priceRange[1].toLocaleString()}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                        placeholder="Min"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 100000])}
                        placeholder="Max"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Items Display */}
        {loading ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="animate-spin w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading wishlist...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your filters or add items to your wishlist</p>
              <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              Browse Shop
            </Link>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map(item => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-xl ${
                      selectedItems.includes(item.id) ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={item.image || item.thumbnail || 'https://via.placeholder.com/400x300?text=No+Image'}
                        alt={item.name}
                        className="w-full h-48 object-cover"
                      />
                      {item.originalPrice && Number(item.originalPrice) > Number(item.price) && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
                          -{Math.round((1 - Number(item.price) / Number(item.originalPrice)) * 100)}%
                        </div>
                      )}
                      {(!item.stock || item.stock === 0 || !item.is_active) && (
                        <div className="absolute top-2 right-2 bg-gray-800 text-white px-2 py-1 rounded-lg text-sm font-semibold">
                          Out of Stock
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleItemSelection(item.id)}
                          className="w-5 h-5 rounded border-2 border-white shadow-lg"
                        />
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 flex-1">{item.name}</h3>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <p className="text-sm text-gray-600 mb-2">{item.category}</p>

                      {item.rating && (
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(Number(item.rating))
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-600 ml-1">({Number(item.rating).toFixed(1)})</span>
                        </div>
                      )}

                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-2xl font-bold text-gray-900">
                          KSh {Number(item.price).toLocaleString()}
                        </span>
                        {item.originalPrice && Number(item.originalPrice) > Number(item.price) && (
                          <span className="text-sm text-gray-500 line-through">
                            KSh {Number(item.originalPrice).toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(item.added_at || item.created_at).toLocaleDateString()}</span>
                        </div>
                        {item.condition && (
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {item.condition}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={!item.stock || item.stock === 0 || !item.is_active}
                        className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-colors ${
                          item.stock > 0 && item.is_active
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {item.stock > 0 && item.is_active ? 'Add to Cart' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map(item => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-xl ${
                      selectedItems.includes(item.id) ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row gap-4 p-4">
                      <div className="relative flex-shrink-0">
                        <img
                          src={item.image || item.thumbnail}
                          alt={item.name}
                          className="w-full sm:w-48 h-48 object-cover rounded-lg"
                        />
                        {item.discount > 0 && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
                            -{item.discount}%
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item.id)}
                              onChange={() => toggleItemSelection(item.id)}
                              className="w-5 h-5 rounded mt-1"
                            />
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                              <p className="text-sm text-gray-600">{item.category}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(item.rating)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-600 ml-1">({item.rating})</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mb-3">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-gray-900">
                              KES {item.price.toLocaleString()}
                            </span>
                            {item.discount > 0 && (
                              <span className="text-sm text-gray-500 line-through">
                                KES {item.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>

                          <div className={`text-xs px-2 py-1 rounded border ${getPriorityColor(item.priority)}`}>
                            {item.priority} priority
                          </div>

                          {!item.stock > 0 && item.is_active && (
                            <span className="text-sm font-semibold text-red-600">Out of Stock</span>
                          )}
                        </div>

                        {item.notes && (
                          <p className="text-sm text-gray-600 italic mb-3">"{item.notes}"</p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              <span>{item.views} views</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>Added {new Date(item.dateAdded).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleAddToCart(item)}
                            disabled={!item.stock > 0 && item.is_active}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                              item.stock > 0 && item.is_active
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            <ShoppingCart className="w-4 h-4" />
                            {item.stock > 0 && item.is_active ? 'Add to Cart' : 'Out of Stock'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bulk Actions Footer */}
            {selectedItems.length > 0 && (
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-30">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredItems.length}
                      onChange={selectAll}
                      className="w-5 h-5 rounded"
                    />
                    <span className="font-medium text-gray-900">
                      {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addSelectedToCart}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                    <button
                      onClick={removeSelectedItems}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Share Wishlist</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-gray-600 mb-4">Share your wishlist with friends and family</p>

            <div className="bg-gray-50 rounded-lg p-3 mb-4 flex items-center gap-2">
              <input
                type="text"
                value={shareableLink}
                readOnly
                className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
              />
              <button
                onClick={copyLink}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                {linkCopied ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <button
                onClick={() => shareVia('facebook')}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <Facebook className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-gray-700">Facebook</span>
              </button>

              <button
                onClick={() => shareVia('twitter')}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center">
                  <Twitter className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-gray-700">Twitter</span>
              </button>

              <button
                onClick={() => shareVia('whatsapp')}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-gray-700">WhatsApp</span>
              </button>

              <button
                onClick={() => shareVia('email')}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-gray-700">Email</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;