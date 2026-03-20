import React, { useEffect, useState } from 'react';
import { Heart, ShoppingCart, CheckCircle, XCircle, X } from 'lucide-react';

const ActionModal = ({ isOpen, onClose, type, action, productName, section = 'hero' }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Color schemes based on section (hero = orange, newArrivals = orange-red)
  const colors = {
    hero: {
      bg: 'from-gray-900 via-gray-800 to-gray-900',
      accent: 'orange-500',
      accentGradient: 'from-orange-400 to-red-500',
      iconBg: 'bg-orange-500/20',
      border: 'border-orange-500/30'
    },
    newArrivals: {
      bg: 'from-gray-900 via-red-950/30 to-gray-900',
      accent: 'red-500',
      accentGradient: 'from-orange-500 to-red-600',
      iconBg: 'bg-red-500/20',
      border: 'border-red-500/30'
    }
  };

  const theme = colors[section] || colors.hero;

  // Content based on type and action
  const content = {
    wishlist: {
      add: {
        icon: <Heart className="w-8 h-8 text-white fill-current" />,
        title: 'Added to Wishlist',
        message: `${productName} has been saved to your wishlist.`,
        bgColor: theme.iconBg
      },
      remove: {
        icon: <Heart className="w-8 h-8 text-gray-400" />,
        title: 'Removed from Wishlist',
        message: `${productName} has been removed from your wishlist.`,
        bgColor: 'bg-gray-700/50'
      }
    },
    cart: {
      add: {
        icon: <ShoppingCart className="w-8 h-8 text-white" />,
        title: 'Added to Cart',
        message: `${productName} has been added to your cart.`,
        bgColor: theme.iconBg
      },
      error: {
        icon: <XCircle className="w-8 h-8 text-red-400" />,
        title: 'Error',
        message: productName,
        bgColor: 'bg-red-500/20'
      }
    }
  };

  const currentContent = content[type]?.[action] || content.cart.error;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      />
      
      {/* Modal */}
      <div 
        className={`relative w-full max-w-sm transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        <div 
          className={`relative bg-gradient-to-br ${theme.bg} backdrop-blur-xl rounded-2xl border ${theme.border} shadow-2xl overflow-hidden`}
        >
          {/* Top gradient line */}
          <div className={`h-1 w-full bg-gradient-to-r ${theme.accentGradient}`} />
          
          {/* Close button */}
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="absolute top-3 right-3 p-1 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Content */}
          <div className="p-6 text-center">
            {/* Icon */}
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${currentContent.bgColor} mb-4`}>
              {currentContent.icon}
            </div>

            {/* Title */}
            <h3 className={`text-xl font-bold text-white mb-2`}>
              {currentContent.title}
            </h3>

            {/* Message */}
            <p className="text-gray-300 text-sm leading-relaxed">
              {currentContent.message}
            </p>

            {/* Action buttons */}
            <div className="mt-6 flex gap-3 justify-center">
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onClose, 300);
                }}
                className={`px-6 py-2 bg-gradient-to-r ${theme.accentGradient} text-white font-semibold rounded-full hover:shadow-lg hover:shadow-${theme.accent}/30 transition-all hover:-translate-y-0.5 text-sm`}
              >
                Continue Shopping
              </button>
              
              {type === 'wishlist' && action === 'add' && (
                <button
                  onClick={() => {
                    window.location.href = '/wishlist';
                  }}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full border border-white/20 transition-all hover:-translate-y-0.5 text-sm"
                >
                  View Wishlist
                </button>
              )}
              
              {type === 'cart' && action === 'add' && (
                <button
                  onClick={() => {
                    window.location.href = '/cart';
                  }}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full border border-white/20 transition-all hover:-translate-y-0.5 text-sm"
                >
                  View Cart
                </button>
              )}
            </div>
          </div>

          {/* Decorative elements */}
          <div className={`absolute -top-10 -right-10 w-32 h-32 bg-${theme.accent}/20 rounded-full blur-3xl`} />
          <div className={`absolute -bottom-10 -left-10 w-24 h-24 bg-${theme.accent}/10 rounded-full blur-2xl`} />
        </div>
      </div>
    </div>
  );
};

export default ActionModal;