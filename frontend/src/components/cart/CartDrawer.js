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
  const shipping = subtotal > 5000 ? 0 : 300; // Free shipping over KES 5,000
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
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <h2 className="text-lg font-bold">Shopping Cart</h2>
            <span className="bg-white text-blue-600 text-xs font-bold px-2 py-1 rounded-full">
              {cartItems.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-800 rounded-full transition-colors"
            aria-label="Close cart"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingCart className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium text-gray-600">Your cart is empty</p>
              <p className="text-sm mt-2">Add some bikes to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  {/* Product Image */}
                  <div className="w-20 h-20 flex-shrink-0 bg-white rounded-md overflow-hidden border border-gray-200">
                    <img
                      src={item.image || '/api/placeholder/80/80'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-gray-800 truncate mb-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">{item.category}</p>
                    <p className="text-blue-600 font-bold text-sm">
                      {formatPrice(item.price)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3 text-gray-600" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3 text-gray-600" />
                      </button>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
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
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            {/* Price Summary */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
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
              <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-300">
                <span>Total</span>
                <span className="text-blue-600">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={onCheckout}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="w-full bg-white text-gray-700 py-2 px-4 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Oshocks Junior Bike Shop
        </h1>
        <p className="text-gray-600 mb-6">
          Cart Drawer Component Demo - Click the button to open the cart
        </p>
        
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <ShoppingCart className="w-5 h-5" />
          Open Cart ({cartItems.length})
        </button>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Features:</h2>
          <ul className="space-y-2 text-gray-700">
            <li>✅ Slide-in drawer animation from right</li>
            <li>✅ Backdrop overlay with click-to-close</li>
            <li>✅ Quantity controls (increase/decrease)</li>
            <li>✅ Remove item functionality</li>
            <li>✅ Real-time price calculations</li>
            <li>✅ Free shipping threshold (KES 5,000)</li>
            <li>✅ KES currency formatting</li>
            <li>✅ Empty cart state</li>
            <li>✅ Responsive design (mobile-friendly)</li>
            <li>✅ Smooth transitions and hover effects</li>
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

export default CartDrawerDemo;
