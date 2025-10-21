import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart, ShoppingCart, Trash2, Share2, Eye, Star, TrendingDown,
  Package, Filter, Search, Grid, List, ChevronDown, X, Check,
  AlertCircle, Sparkles, Tag, Calendar, DollarSign, ArrowRight,
  Clock, Bell, Download, Mail, Facebook, Twitter, Link as LinkIcon,
  CheckCircle, XCircle, RefreshCw, SortAsc, SortDesc, Edit3
} from 'lucide-react';

const Wishlist = () => {
  const navigate = useNavigate();
  
  // State management
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('date-added');
  const [filterBy, setFilterBy] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPriceAlertModal, setShowPriceAlertModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [notification, setNotification] = useState(null);
  const [collections, setCollections] = useState([]);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [currentCollection, setCurrentCollection] = useState('all');
  const [bulkAction, setBulkAction] = useState('');

  // Fetch wishlist data
  useEffect(() => {
    fetchWishlistData();
  }, []);

  const fetchWishlistData = async () => {
    try {
      setLoading(true);
      const [wishlistRes, collectionsRes] = await Promise.all([
        fetch('/api/wishlist', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch('/api/wishlist/collections', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);

      const wishlistData = await wishlistRes.json();
      const collectionsData = await collectionsRes.json();

      setWishlistItems(wishlistData);
      setCollections(collectionsData);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      showNotification('Failed to load wishlist', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Remove from wishlist
  const removeFromWishlist = async (productId) => {
    try {
      await fetch(`/api/wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setWishlistItems(items => items.filter(item => item.product_id !== productId));
      setSelectedItems(selected => selected.filter(id => id !== productId));
      showNotification('Item removed from wishlist');
    } catch (error) {
      console.error('Error removing item:', error);
      showNotification('Failed to remove item', 'error');
    }
  };

  // Add to cart
  const addToCart = async (product) => {
    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          product_id: product.product_id,
          quantity: 1
        })
      });

      showNotification('Added to cart successfully');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showNotification('Failed to add to cart', 'error');
    }
  };

  // Move to cart and remove from wishlist
  const moveToCart = async (product) => {
    await addToCart(product);
    await removeFromWishlist(product.product_id);
  };

  // Toggle item selection
  const toggleItemSelection = (productId) => {
    setSelectedItems(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Select all items
  const selectAllItems = () => {
    const filteredIds = getFilteredItems().map(item => item.product_id);
    setSelectedItems(filteredIds);
  };

  // Deselect all items
  const deselectAllItems = () => {
    setSelectedItems([]);
  };

  // Bulk actions
  const handleBulkAction = async () => {
    if (!bulkAction || selectedItems.length === 0) return;

    try {
      switch (bulkAction) {
        case 'add-to-cart':
          await Promise.all(
            selectedItems.map(id => {
              const item = wishlistItems.find(i => i.product_id === id);
              return addToCart(item);
            })
          );
          showNotification(`${selectedItems.length} items added to cart`);
          break;

        case 'move-to-cart':
          await Promise.all(
            selectedItems.map(id => {
              const item = wishlistItems.find(i => i.product_id === id);
              return moveToCart(item);
            })
          );
          showNotification(`${selectedItems.length} items moved to cart`);
          break;

        case 'remove':
          await Promise.all(
            selectedItems.map(id => removeFromWishlist(id))
          );
          showNotification(`${selectedItems.length} items removed`);
          break;

        case 'create-collection':
          setShowCollectionModal(true);
          break;

        default:
          break;
      }

      setBulkAction('');
      setSelectedItems([]);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      showNotification('Failed to complete action', 'error');
    }
  };

  // Price alert
  const setPriceAlert = async (product, targetPrice) => {
    try {
      await fetch('/api/wishlist/price-alerts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          product_id: product.product_id,
          target_price: targetPrice
        })
      });

      showNotification('Price alert set successfully');
      setShowPriceAlertModal(false);
    } catch (error) {
      console.error('Error setting price alert:', error);
      showNotification('Failed to set price alert', 'error');
    }
  };

  // Share wishlist
  const shareWishlist = async (method) => {
    const url = `${window.location.origin}/wishlist/shared/${localStorage.getItem('userId')}`;
    
    switch (method) {
      case 'copy':
        navigator.clipboard.writeText(url);
        showNotification('Link copied to clipboard');
        break;
      
      case 'email':
        window.location.href = `mailto:?subject=Check out my wishlist&body=View my wishlist: ${url}`;
        break;
      
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
        break;
      
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=Check out my wishlist`, '_blank');
        break;
      
      default:
        break;
    }
    
    setShowShareModal(false);
  };

  // Export wishlist
  const exportWishlist = (format) => {
    const items = getFilteredItems();
    
    if (format === 'csv') {
      const csv = [
        ['Product Name', 'Price', 'Category', 'Stock Status', 'Date Added'],
        ...items.map(item => [
          item.product_name,
          item.price,
          item.category,
          item.in_stock ? 'In Stock' : 'Out of Stock',
          new Date(item.added_at).toLocaleDateString()
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'wishlist.csv';
      a.click();
    } else if (format === 'pdf') {
      showNotification('PDF export coming soon', 'info');
    }
  };

  // Create collection
  const createCollection = async (name, selectedItemIds) => {
    try {
      await fetch('/api/wishlist/collections', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          product_ids: selectedItemIds
        })
      });

      await fetchWishlistData();
      showNotification('Collection created successfully');
      setShowCollectionModal(false);
      setSelectedItems([]);
    } catch (error) {
      console.error('Error creating collection:', error);
      showNotification('Failed to create collection', 'error');
    }
  };

  // Filter and sort items
  const getFilteredItems = () => {
    let filtered = [...wishlistItems];

    // Filter by collection
    if (currentCollection !== 'all') {
      filtered = filtered.filter(item => item.collection_id === currentCollection);
    }

    // Filter by availability
    if (filterBy === 'in-stock') {
      filtered = filtered.filter(item => item.in_stock);
    } else if (filterBy === 'out-of-stock') {
      filtered = filtered.filter(item => !item.in_stock);
    } else if (filterBy === 'on-sale') {
      filtered = filtered.filter(item => item.discount_percentage > 0);
    } else if (filterBy === 'price-drop') {
      filtered = filtered.filter(item => item.price_dropped);
    }

    // Filter by price range
    filtered = filtered.filter(item => 
      item.price >= priceRange.min && item.price <= priceRange.max
    );

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    switch (sortBy) {
      case 'date-added':
        filtered.sort((a, b) => new Date(b.added_at) - new Date(a.added_at));
        break;
      case 'date-added-old':
        filtered.sort((a, b) => new Date(a.added_at) - new Date(b.added_at));
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.product_name.localeCompare(b.product_name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.product_name.localeCompare(a.product_name));
        break;
      case 'discount':
        filtered.sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0));
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredItems = getFilteredItems();

  // Calculate total value
  const totalValue = filteredItems.reduce((sum, item) => sum + item.price, 0);
  const totalSavings = filteredItems.reduce((sum, item) => {
    if (item.original_price) {
      return sum + (item.original_price - item.price);
    }
    return sum;
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          notification.type === 'success' ? 'bg-green-500' :
          notification.type === 'error' ? 'bg-red-500' :
          'bg-blue-500'
        } text-white`}>
          {notification.type === 'success' && <CheckCircle className="h-5 w-5" />}
          {notification.type === 'error' && <XCircle className="h-5 w-5" />}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Heart className="h-8 w-8 text-red-500 fill-red-500" />
                My Wishlist
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
              
              <div className="relative">
                <button
                  onClick={() => document.getElementById('export-menu').classList.toggle('hidden')}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
                <div id="export-menu" className="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                  <button
                    onClick={() => exportWishlist('csv')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={() => exportWishlist('pdf')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50"
                  >
                    Export as PDF
                  </button>
                </div>
              </div>

              <button
                onClick={fetchWishlistData}
                className="p-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Stats */}
          {filteredItems.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">KSh {totalValue.toLocaleString()}</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Potential Savings</p>
                <p className="text-2xl font-bold text-green-600">KSh {totalSavings.toLocaleString()}</p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">In Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredItems.filter(item => item.in_stock).length}
                </p>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">On Sale</p>
                <p className="text-2xl font-bold text-orange-600">
                  {filteredItems.filter(item => item.discount_percentage > 0).length}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Collections */}
      {collections.length > 0 && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setCurrentCollection('all')}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                  currentCollection === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Items ({wishlistItems.length})
              </button>
              {collections.map(collection => (
                <button
                  key={collection.id}
                  onClick={() => setCurrentCollection(collection.id)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                    currentCollection === collection.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {collection.name} ({collection.item_count})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters and Controls */}
        {filteredItems.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search wishlist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter */}
              <div className="relative">
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="appearance-none px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="all">All Items</option>
                  <option value="in-stock">In Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                  <option value="on-sale">On Sale</option>
                  <option value="price-drop">Price Drop</option>
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
                  <option value="date-added">Newest First</option>
                  <option value="date-added-old">Oldest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                  <option value="discount">Highest Discount</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>

              {/* View Mode */}
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

            {/* Bulk Actions */}
            {selectedItems.length > 0 && (
              <div className="mt-4 pt-4 border-t flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  {selectedItems.length} selected
                </span>
                
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Bulk Actions</option>
                  <option value="add-to-cart">Add to Cart</option>
                  <option value="move-to-cart">Move to Cart</option>
                  <option value="create-collection">Create Collection</option>
                  <option value="remove">Remove</option>
                </select>

                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply
                </button>

                <button
                  onClick={deselectAllItems}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear Selection
                </button>

                {selectedItems.length !== filteredItems.length && (
                  <button
                    onClick={selectAllItems}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Select All
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Wishlist Items */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg">
            <Heart className="h-20 w-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {wishlistItems.length === 0 ? 'Your Wishlist is Empty' : 'No Items Found'}
            </h2>
            <p className="text-gray-600 mb-6">
              {wishlistItems.length === 0 
                ? 'Save items you love to your wishlist'
                : 'Try adjusting your filters or search query'
              }
            </p>
            {wishlistItems.length === 0 && (
              <button
                onClick={() => navigate('/shop')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
              >
                Start Shopping
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {filteredItems.map(item => (
              <WishlistCard
                key={item.product_id}
                item={item}
                viewMode={viewMode}
                isSelected={selectedItems.includes(item.product_id)}
                onToggleSelect={() => toggleItemSelection(item.product_id)}
                onRemove={() => removeFromWishlist(item.product_id)}
                onAddToCart={() => addToCart(item)}
                onMoveToCart={() => moveToCart(item)}
                onViewProduct={() => navigate(`/products/${item.product_id}`)}
                onSetPriceAlert={() => {
                  setSelectedProduct(item);
                  setShowPriceAlertModal(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          onClose={() => setShowShareModal(false)}
          onShare={shareWishlist}
        />
      )}

      {/* Price Alert Modal */}
      {showPriceAlertModal && selectedProduct && (
        <PriceAlertModal
          product={selectedProduct}
          onClose={() => {
            setShowPriceAlertModal(false);
            setSelectedProduct(null);
          }}
          onSetAlert={setPriceAlert}
        />
      )}

      {/* Collection Modal */}
      {showCollectionModal && (
        <CollectionModal
          selectedItems={selectedItems}
          onClose={() => setShowCollectionModal(false)}
          onCreate={createCollection}
        />
      )}
    </div>
  );
};

// Wishlist Card Component
const WishlistCard = ({
  item,
  viewMode,
  isSelected,
  onToggleSelect,
  onRemove,
  onAddToCart,
  onMoveToCart,
  onViewProduct,
  onSetPriceAlert
}) => {
  const [showActions, setShowActions] = useState(false);

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 flex gap-4 relative">
        {/* Checkbox */}
        <div className="flex items-start pt-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Image */}
        <div className="relative flex-shrink-0">
          <img
            src={item.image_url || 'https://via.placeholder.com/150'}
            alt={item.product_name}
            className="w-32 h-32 object-cover rounded-lg cursor-pointer"
            onClick={onViewProduct}
          />
          {!item.in_stock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">OUT OF STOCK</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <h3
            onClick={onViewProduct}
            className="font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer line-clamp-2"
          >
            {item.product_name}
          </h3>

          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium">{item.rating}</span>
            </div>
            <span className="text-sm text-gray-500">({item.reviews_count} reviews)</span>
          </div>

          <div className="mb-3">
            <span className="text-2xl font-bold text-gray-900">
              KSh {item.price.toLocaleString()}
            </span>
            {item.original_price && (
              <>
                <span className="text-gray-400 line-through ml-2">
                  KSh {item.original_price.toLocaleString()}
                </span>
                <span className="text-green-600 font-semibold ml-2">
                  -{item.discount_percentage}%
                </span>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            {item.price_dropped && (
              <span className="flex items-center gap-1 bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                <TrendingDown className="h-3 w-3" />
                Price Dropped
              </span>
            )}
            {item.low_stock && (
              <span className="flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                <AlertCircle className="h-3 w-3" />
                Low Stock
              </span>
            )}
            <span className="text-xs text-gray-500">
              Added {new Date(item.added_at).toLocaleDateString()}
            </span>
          </div>

          <div className="flex gap-2">
            {item.in_stock ? (
              <>
                <button
                  onClick={onAddToCart}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </button>
                <button
                  onClick={onMoveToCart}
                  className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium text-sm"
                >
                  Move to Cart
                </button>
              </>
            ) : (
              <button
                onClick={onSetPriceAlert}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm"
              >
                <Bell className="h-4 w-4" />
                Notify When Available
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onSetPriceAlert}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
            title="Set Price Alert"
          >
            <Bell className="h-5 w-5" />
          </button>
          <button
            onClick={onRemove}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
            title="Remove"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow relative group">
      {/* Checkbox */}
      <div className="absolute top-3 left-3 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {/* Quick Actions */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onViewProduct}
          className="p-2 bg-white rounded-full shadow-md hover:bg-blue-50 text-blue-600"
          title="View Product"
        >
          <Eye className="h-4 w-4" />
        </button>
        <button
          onClick={onRemove}
          className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 text-red-600"
          title="Remove"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Image */}
      <div className="relative pb-[100%]">
        <img
          src={item.image_url || 'https://via.placeholder.com/300'}
          alt={item.product_name}
          className="absolute inset-0 w-full h-full object-cover cursor-pointer"
          onClick={onViewProduct}
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {item.discount_percentage > 0 && (
            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
              -{item.discount_percentage}%
            </span>
          )}
          {item.price_dropped && (
            <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              Price Drop
            </span>
          )}
        </div>

        {!item.in_stock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold">OUT OF STOCK</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-4">
        <h3
          onClick={onViewProduct}
          className="font-semibold text-gray-900 mb-2 line-clamp-2 h-12 cursor-pointer hover:text-blue-600"
        >
          {item.product_name}
        </h3>

        <div className="flex items-center gap-1 mb-2">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-medium">{item.rating}</span>
          <span className="text-sm text-gray-500">({item.reviews_count})</span>
        </div>

        <div className="mb-3">
          <div className="text-xl font-bold text-gray-900">
            KSh {item.price.toLocaleString()}
          </div>
          {item.original_price && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 line-through">
                KSh {item.original_price.toLocaleString()}
              </span>
              <span className="text-sm text-green-600 font-semibold">
                Save KSh {(item.original_price - item.price).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {item.low_stock && item.in_stock && (
          <div className="flex items-center gap-1 text-orange-600 text-xs font-medium mb-2">
            <AlertCircle className="h-3 w-3" />
            Only {item.quantity} left
          </div>
        )}

        <p className="text-xs text-gray-500 mb-3">
          Added {new Date(item.added_at).toLocaleDateString()}
        </p>

        {/* Action Buttons */}
        {item.in_stock ? (
          <div className="space-y-2">
            <button
              onClick={onAddToCart}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </button>
            <div className="flex gap-2">
              <button
                onClick={onSetPriceAlert}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <Bell className="h-3 w-3" />
                Alert
              </button>
              <button
                onClick={onMoveToCart}
                className="flex-1 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Move to Cart
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onSetPriceAlert}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            <Bell className="h-4 w-4" />
            Notify Me
          </button>
        )}
      </div>
    </div>
  );
};

// Share Modal Component
const ShareModal = ({ onClose, onShare }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Share Wishlist</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => onShare('copy')}
            className="w-full flex items-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <LinkIcon className="h-5 w-5 text-gray-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Copy Link</p>
              <p className="text-sm text-gray-600">Share via any platform</p>
            </div>
          </button>

          <button
            onClick={() => onShare('email')}
            className="w-full flex items-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Mail className="h-5 w-5 text-gray-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Share via Email</p>
              <p className="text-sm text-gray-600">Send to friends and family</p>
            </div>
          </button>

          <button
            onClick={() => onShare('facebook')}
            className="w-full flex items-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Facebook className="h-5 w-5 text-blue-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Share on Facebook</p>
              <p className="text-sm text-gray-600">Post to your timeline</p>
            </div>
          </button>

          <button
            onClick={() => onShare('twitter')}
            className="w-full flex items-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Twitter className="h-5 w-5 text-blue-400" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Share on Twitter</p>
              <p className="text-sm text-gray-600">Tweet your wishlist</p>
            </div>
          </button>
        </div>

        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-gray-600 text-center">
            Anyone with the link can view your public wishlist
          </p>
        </div>
      </div>
    </div>
  );
};

// Price Alert Modal Component
const PriceAlertModal = ({ product, onClose, onSetAlert }) => {
  const [targetPrice, setTargetPrice] = useState(product.price * 0.9);
  const [email, setEmail] = useState('');
  const [sms, setSms] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSetAlert(product, targetPrice);
  };

  const savingsAmount = product.price - targetPrice;
  const savingsPercentage = ((savingsAmount / product.price) * 100).toFixed(0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Set Price Alert</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex gap-4 mb-4">
            <img
              src={product.image_url || 'https://via.placeholder.com/100'}
              alt={product.product_name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                {product.product_name}
              </h4>
              <p className="text-sm text-gray-600">
                Current Price: <span className="font-bold">KSh {product.price.toLocaleString()}</span>
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alert me when price drops to:
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                KSh
              </span>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(parseFloat(e.target.value))}
                max={product.price}
                min={0}
                step="100"
                required
                className="w-full pl-14 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {targetPrice < product.price && (
              <p className="text-sm text-green-600 mt-2">
                You'll save KSh {savingsAmount.toLocaleString()} ({savingsPercentage}%)
              </p>
            )}
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Bell className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  We'll notify you when the price drops
                </p>
                <p className="text-xs text-gray-600">
                  You'll receive an email notification as soon as the price reaches your target.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="sms-alert"
              checked={sms}
              onChange={(e) => setSms(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="sms-alert" className="ml-2 text-sm text-gray-700">
              Also notify me via SMS
            </label>
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
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Set Alert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Collection Modal Component
const CollectionModal = ({ selectedItems, onClose, onCreate }) => {
  const [collectionName, setCollectionName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(collectionName, selectedItems);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Create Collection</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Collection Name *
            </label>
            <input
              type="text"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              required
              placeholder="e.g., Mountain Bikes, Accessories"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="private-collection"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="private-collection" className="ml-2 text-sm text-gray-700">
              Make this collection private
            </label>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              <strong>{selectedItems.length}</strong> items will be added to this collection
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
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Create Collection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Wishlist;