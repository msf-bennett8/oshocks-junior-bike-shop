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

  // Calculate item total
  const itemTotal = item.price * item.quantity;

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
      <div className={`flex gap-3 p-2 bg-white rounded-lg border border-gray-200 transition-all duration-300 ${isRemoving ? 'opacity-0 scale-95' : 'opacity-100'}`}>
        <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
          <img
            src={item.image || '/api/placeholder/64/64'}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-gray-800 truncate">{item.name}</h4>
          <p className="text-xs text-gray-500">{formatPrice(item.price)} × {item.quantity}</p>
          <p className="text-blue-600 font-bold text-sm mt-1">{formatPrice(itemTotal)}</p>
        </div>
        
        {editable && (
          <button
            onClick={handleRemove}
            className="self-start p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  // Full view (for main cart page)
  return (
    <div className={`bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300 ${isRemoving ? 'opacity-0 scale-95' : 'opacity-100'}`}>
      <div className="p-4">
        <div className="flex gap-4">
          {/* Product Image */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative">
            <img
              src={item.image || '/api/placeholder/128/128'}
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
            <div className="flex justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-bold text-base sm:text-lg text-gray-800 mb-1">
                  {item.name}
                </h3>
                
                {/* Category & Seller Info */}
                <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
                  <span className="bg-gray-100 px-2 py-1 rounded">{item.category}</span>
                  {item.seller && (
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {item.seller}
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                {showStock && item.stock !== undefined && (
                  <div className="mb-2">
                    {isOutOfStock ? (
                      <p className="text-red-600 text-sm font-medium flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Out of Stock
                      </p>
                    ) : isLowStock ? (
                      <p className="text-orange-600 text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Only {item.stock} left in stock
                      </p>
                    ) : (
                      <p className="text-green-600 text-sm">In Stock</p>
                    )}
                  </div>
                )}

                {/* Price Info */}
                <div className="mb-3">
                  <p className="text-blue-600 font-bold text-lg">
                    {formatPrice(item.price)}
                  </p>
                  {item.originalPrice && item.originalPrice > item.price && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 line-through text-sm">
                        {formatPrice(item.originalPrice)}
                      </span>
                      <span className="text-green-600 text-sm font-medium">
                        Save {formatPrice(item.originalPrice - item.price)}
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
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Quantity Controls & Actions */}
            <div className="flex flex-wrap items-center gap-3 mt-3">
              {/* Quantity Selector */}
              {editable ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium">Qty:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={handleDecrease}
                      disabled={item.quantity <= 1}
                      className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4 text-gray-600" />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={handleQuantityInput}
                      min="1"
                      max={item.stock || 999}
                      className="w-12 text-center text-sm font-medium border-x border-gray-300 outline-none"
                    />
                    <button
                      onClick={handleIncrease}
                      disabled={item.stock && item.quantity >= item.stock}
                      className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              ) : (
                <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
              )}

              {/* Item Subtotal */}
              <div className="ml-auto">
                <p className="text-sm text-gray-600">Subtotal:</p>
                <p className="text-lg font-bold text-gray-900">{formatPrice(itemTotal)}</p>
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
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                    Save for Later
                  </button>
                )}
                <button
                  onClick={handleRemove}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
            )}

            {/* Save for Later - Desktop */}
            {editable && onAddToWishlist && (
              <button
                onClick={handleMoveToWishlist}
                className="hidden sm:flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-2"
              >
                <Heart className="w-4 h-4" />
                Save for Later
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Demo Component
const CartItemDemo = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Mountain Bike Pro X1 - 21 Speed Shimano',
      category: 'Mountain Bikes',
      price: 45000,
      originalPrice: 52000,
      quantity: 1,
      stock: 8,
      seller: 'Oshocks Junior',
      image: '/api/placeholder/200/200'
    },
    {
      id: 2,
      name: 'Professional Cycling Helmet - Safety Certified',
      category: 'Safety Gear',
      price: 2500,
      quantity: 2,
      stock: 3,
      seller: 'BikeGear Kenya',
      image: '/api/placeholder/200/200'
    },
    {
      id: 3,
      name: 'Heavy Duty U-Lock with Cable',
      category: 'Security',
      price: 1800,
      quantity: 1,
      stock: 15,
      seller: 'SecureBikes',
      image: '/api/placeholder/200/200'
    },
    {
      id: 4,
      name: 'LED Bike Light Set (Front + Rear)',
      category: 'Accessories',
      price: 1200,
      originalPrice: 1500,
      quantity: 1,
      stock: 0,
      seller: 'Oshocks Junior',
      image: '/api/placeholder/200/200'
    }
  ]);

  const [wishlist, setWishlist] = useState([]);

  const handleUpdateQuantity = (id, newQuantity) => {
    setCartItems(cartItems.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleRemoveItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const handleAddToWishlist = (item) => {
    setWishlist([...wishlist, item]);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Shopping Cart
          </h1>
          <p className="text-gray-600">
            Oshocks Junior Bike Shop - {totalItems} items in cart
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map(item => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onAddToWishlist={handleAddToWishlist}
                showStock={true}
                editable={true}
              />
            ))}

            {cartItems.length === 0 && (
              <div className="bg-white rounded-lg p-12 text-center">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-xl text-gray-600">Your cart is empty</p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4 pb-4 border-b">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600 font-medium">
                    {subtotal > 5000 ? 'FREE' : formatPrice(300)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between text-lg font-bold mb-6">
                <span>Total</span>
                <span className="text-blue-600">
                  {formatPrice(subtotal + (subtotal > 5000 ? 0 : 300))}
                </span>
              </div>
              <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md">
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>

        {/* Wishlist Preview */}
        {wishlist.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Saved for Later ({wishlist.length})</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {wishlist.map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  compact={true}
                  editable={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartItemDemo;