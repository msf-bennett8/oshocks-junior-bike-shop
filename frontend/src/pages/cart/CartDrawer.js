import React, { useEffect } from 'react';
import { X, ShoppingCart, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';

const CartDrawer = ({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, onCheckout }) => {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 5000 ? 0 : 300;
  const total = subtotal + shipping;

  // Format currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 sm:max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <h2 className="text-base sm:text-lg font-bold truncate">Shopping Cart</h2>
            <span className="bg-white text-blue-600 text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex-shrink-0">
              {cartItems.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-800 rounded-full transition-colors flex-shrink-0"
            aria-label="Close cart"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Cart Items - Scrollable */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 px-4">
              <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4" />
              <p className="text-base sm:text-lg font-medium text-gray-600 text-center">Your cart is empty</p>
              <p className="text-xs sm:text-sm mt-2 text-center">Add some bikes to get started!</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  {/* Product Image */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-white rounded-md overflow-hidden border border-gray-200">
                    <img
                      src={item.image || '/api/placeholder/80/80'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0 flex flex-col">
                    <h3 className="font-medium text-xs sm:text-sm text-gray-800 line-clamp-2 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-1">{item.category}</p>
                    <p className="text-blue-600 font-bold text-sm sm:text-base">
                      {formatPrice(item.price)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-auto pt-2">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <button
                          onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3 text-gray-600" />
                        </button>
                        <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3 text-gray-600" />
                        </button>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Summary & Checkout */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 p-3 sm:p-4 bg-gray-50 flex-shrink-0">
            {/* Price Summary */}
            <div className="space-y-2 mb-3 sm:mb-4">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    formatPrice(shipping)
                  )}
                </span>
              </div>
              {subtotal < 5000 && (
                <p className="text-xs text-gray-500 italic">
                  Add {formatPrice(5000 - subtotal)} more for free shipping
                </p>
              )}
              <div className="flex justify-between text-sm sm:text-base font-bold pt-2 border-t border-gray-300">
                <span>Total</span>
                <span className="text-blue-600">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={onCheckout}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-semibold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              </button>
              <button
                onClick={onClose}
                className="w-full bg-white text-gray-700 py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// Demo Component with Sample Data
const CartDrawerDemo = () => {
  const [isOpen, setIsOpen] = React.useState(true);
  const [cartItems, setCartItems] = React.useState([
    {
      id: 1,
      name: 'Mountain Bike Pro X1',
      category: 'Mountain Bikes',
      price: 45000,
      quantity: 1,
      image: '/api/placeholder/80/80'
    },
    {
      id: 2,
      name: 'Bicycle Helmet - Safety First',
      category: 'Accessories',
      price: 2500,
      quantity: 2,
      image: '/api/placeholder/80/80'
    },
    {
      id: 3,
      name: 'Bike Lock Heavy Duty',
      category: 'Security',
      price: 1800,
      quantity: 1,
      image: '/api/placeholder/80/80'
    }
  ]);

  const handleUpdateQuantity = (id, newQuantity) => {
    setCartItems(cartItems.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleRemoveItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const handleCheckout = () => {
    alert('Proceeding to checkout...');
    setIsOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
          Oshocks Junior Bike Shop
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
          Cart Drawer Component - Fully Responsive
        </p>
        
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
          Open Cart ({cartItems.length})
        </button>

        <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Fixed Issues:</h2>
          <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
            <li>✅ Proper width constraints on mobile (w-full sm:w-96)</li>
            <li>✅ Flexible image sizes (w-16 h-16 sm:w-20 sm:h-20)</li>
            <li>✅ Text truncation with line-clamp-2</li>
            <li>✅ Responsive spacing throughout</li>
            <li>✅ Proper min-w-0 for flex children</li>
            <li>✅ Touch-friendly button sizes</li>
            <li>✅ Scrollable content area</li>
            <li>✅ No content overflow</li>
          </ul>
        </div>
      </div>

      <CartDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default CartDrawer;