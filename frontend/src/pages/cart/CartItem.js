import React, { useState } from 'react';
import { Plus, Minus, Trash2, Heart, Package, AlertCircle } from 'lucide-react';

/**
 * CartItem Component
 * A comprehensive, reusable cart item component for Oshocks Junior Bike Shop
 * Handles individual product display, quantity management, and user interactions
 */
const CartItem = ({ 
  item, 
  onUpdateQuantity, 
  onRemoveItem, 
  onAddToWishlist,
  showStock = true,
  compact = false,
  editable = true 
}) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const [quantityError, setQuantityError] = useState('');

  // Format price in KES
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Calculate item total - ensure price is a number
  const itemPrice = Number(item.price) || 0;
  const itemTotal = itemPrice * item.quantity;

  // Handle quantity increase
  const handleIncrease = () => {
    if (item.stock && item.quantity >= item.stock) {
      setQuantityError('Maximum stock reached');
      setTimeout(() => setQuantityError(''), 3000);
      return;
    }
    onUpdateQuantity(item.id, item.quantity + 1);
    setQuantityError('');
  };

  // Handle quantity decrease
  const handleDecrease = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
      setQuantityError('');
    } else {
      setQuantityError('Minimum quantity is 1');
      setTimeout(() => setQuantityError(''), 3000);
    }
  };

  // Handle direct quantity input
  const handleQuantityInput = (e) => {
    const value = parseInt(e.target.value) || 1;
    const newQuantity = Math.max(1, Math.min(value, item.stock || 999));
    
    if (item.stock && value > item.stock) {
      setQuantityError(`Only ${item.stock} available`);
      setTimeout(() => setQuantityError(''), 3000);
    }
    
    onUpdateQuantity(item.id, newQuantity);
  };

  // Handle remove with animation
  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemoveItem(item.id);
    }, 300);
  };

  // Handle move to wishlist
  const handleMoveToWishlist = () => {
    if (onAddToWishlist) {
      onAddToWishlist(item);
      handleRemove();
    }
  };

  // Check if item is low stock
  const isLowStock = item.stock && item.stock <= 5;
  const isOutOfStock = item.stock === 0;

  // Compact view (for mini cart or mobile)
  if (compact) {
    return (
      <div className={`flex gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg border border-gray-200 transition-all duration-300 ${isRemoving ? 'opacity-0 scale-95' : 'opacity-100'}`}>
        <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
          <img
            src={item.thumbnail || item.image || '/api/placeholder/64/64'}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-xs sm:text-sm text-gray-800 line-clamp-2">{item.name}</h4>
          <p className="text-xs text-gray-500 mt-1">{formatPrice(item.price)} × {item.quantity}</p>
          <p className="text-blue-600 font-bold text-sm sm:text-base mt-1">{formatPrice(itemTotal)}</p>
        </div>
        
        {editable && (
          <button
            onClick={handleRemove}
            className="self-start p-1 sm:p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
            aria-label="Remove item"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        )}
      </div>
    );
  }

  // Full view (for main cart page)
  return (
    <div className={`bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300 ${isRemoving ? 'opacity-0 scale-95' : 'opacity-100'}`}>
      <div className="p-3 sm:p-4">
        <div className="flex gap-3 sm:gap-4">
          {/* Product Image */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative">
            <img
              src={item.thumbnail || item.image || '/api/placeholder/128/128'}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white text-xs font-bold px-2 py-1 bg-red-600 rounded">
                  OUT OF STOCK
                </span>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between gap-2 sm:gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm sm:text-base md:text-lg text-gray-800 mb-1 line-clamp-2">
                  {item.name}
                </h3>
                
                {/* Category & Seller Info */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs text-gray-500 mb-2">
                  {item.category && (
                    <span className="bg-gray-100 px-2 py-0.5 sm:py-1 rounded">{item.category}</span>
                  )}
                  {(item.seller || item.seller_name) && (
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      <span className="hidden sm:inline">{item.seller_name || item.seller}</span>
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                {showStock && item.stock !== undefined && (
                  <div className="mb-2">
                    {isOutOfStock ? (
                      <p className="text-red-600 text-xs sm:text-sm font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        Out of Stock
                      </p>
                    ) : isLowStock ? (
                      <p className="text-orange-600 text-xs sm:text-sm flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        Only {item.stock} left
                      </p>
                    ) : (
                      <p className="text-green-600 text-xs sm:text-sm">In Stock</p>
                    )}
                  </div>
                )}

                {/* Price Info */}
                <div className="mb-2 sm:mb-3">
                  <p className="text-blue-600 font-bold text-base sm:text-lg">
                    {formatPrice(itemPrice)}
                  </p>
                  {item.originalPrice && Number(item.originalPrice) > itemPrice && (
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <span className="text-gray-400 line-through text-xs sm:text-sm">
                        {formatPrice(Number(item.originalPrice))}
                      </span>
                      <span className="text-green-600 text-xs sm:text-sm font-medium">
                        Save {formatPrice(Number(item.originalPrice) - itemPrice)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Remove Button - Desktop */}
              {editable && (
                <button
                  onClick={handleRemove}
                  className="hidden sm:flex self-start p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>

            {/* Quantity Controls & Actions */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
              {/* Quantity Selector */}
              {editable ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-gray-600 font-medium">Qty:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={handleDecrease}
                      disabled={item.quantity <= 1}
                      className="p-1.5 sm:p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={handleQuantityInput}
                      min="1"
                      max={item.stock || 999}
                      className="w-10 sm:w-12 text-center text-xs sm:text-sm font-medium border-x border-gray-300 outline-none"
                    />
                    <button
                      onClick={handleIncrease}
                      disabled={item.stock && item.quantity >= item.stock}
                      className="p-1.5 sm:p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              ) : (
                <span className="text-xs sm:text-sm text-gray-600">Qty: {item.quantity}</span>
              )}

              {/* Item Subtotal */}
              <div className="sm:ml-auto">
                <p className="text-xs sm:text-sm text-gray-600">Subtotal:</p>
                <p className="text-base sm:text-lg font-bold text-gray-900">{formatPrice(itemTotal)}</p>
              </div>
            </div>

            {/* Error Message */}
            {quantityError && (
              <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {quantityError}
              </p>
            )}

            {/* Action Buttons - Mobile */}
            {editable && (
              <div className="flex sm:hidden gap-2 mt-3 pt-3 border-t border-gray-200">
                {onAddToWishlist && (
                  <button
                    onClick={handleMoveToWishlist}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Save for Later</span>
                    <span className="xs:hidden">Save</span>
                  </button>
                )}
                <button
                  onClick={handleRemove}
                  className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Remove
                </button>
              </div>
            )}

            {/* Save for Later - Desktop */}
            {editable && onAddToWishlist && (
              <button
                onClick={handleMoveToWishlist}
                className="hidden sm:flex items-center gap-1 text-xs sm:text-sm text-blue-600 hover:text-blue-700 mt-2"
              >
                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Save for Later
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};



export default CartItem;