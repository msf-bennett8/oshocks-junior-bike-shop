import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Truck, 
  Tag, 
  Shield, 
  CreditCard,
  ArrowRight,
  Check,
  X,
  Gift,
  MapPin,
  Clock,
  AlertCircle,
  Info
} from 'lucide-react';

/**
 * CartSummary Component - Production Ready
 * Comprehensive order summary with pricing, shipping, discounts, and payment methods
 * for Oshocks Junior Bike Shop e-commerce platform
 */
const CartSummary = ({
  cartItems = [],
  onCheckout,
  showPromoCode = true,
  showShippingEstimate = true,
  showPaymentMethods = true,
  deliveryLocation = 'Nairobi',
  sticky = true,
  className = ''
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('mpesa');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  // TODO: In production, validate promo codes via API endpoint
  // Example: POST /api/v1/cart/validate-promo with { code: promoCode, cart_total: subtotal }
  
  // Mock promo codes (in production, validate via API)
  const promoCodes = {
    'BIKE10': { discount: 0.10, type: 'percentage', description: '10% off' },
    'WELCOME500': { discount: 500, type: 'fixed', description: 'KES 500 off' },
    'FREESHIP': { discount: 0, type: 'shipping', description: 'Free shipping' },
    'BIKE2024': { discount: 0.15, type: 'percentage', description: '15% off', minOrder: 10000 }
  };

  // Calculate pricing - ensure all prices are numbers
  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Shipping calculation
  const freeShippingThreshold = 5000;
  const baseShipping = 300;
  
  let shippingCost = subtotal >= freeShippingThreshold ? 0 : baseShipping;
  
  // Apply free shipping promo
  if (appliedPromo?.type === 'shipping') {
    shippingCost = 0;
  }

  // Discount calculation
  let discount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === 'percentage') {
      discount = subtotal * appliedPromo.discount;
    } else if (appliedPromo.type === 'fixed') {
      discount = appliedPromo.discount;
    }
  }

  // Tax calculation (16% VAT in Kenya, already included in prices)
  const taxRate = 0.16;
  const taxAmount = (subtotal - discount) * taxRate / (1 + taxRate);

  // Total calculation
  const total = subtotal - discount + shippingCost;

  // Savings calculation
  const regularPriceTotal = cartItems.reduce((sum, item) => 
    sum + ((Number(item.originalPrice) || Number(item.price)) * item.quantity), 0
  );
  const priceSavings = regularPriceTotal - subtotal;
  const totalSavings = priceSavings + discount;

  // Format currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Handle promo code application
  const handleApplyPromo = async () => {
    setIsApplyingPromo(true);
    setPromoError('');

    // TODO: Replace with actual API call
    // Example:
    // const response = await fetch(`${API_URL}/cart/validate-promo`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ code: promoCode, cart_total: subtotal })
    // });
    
    // Simulate API call (remove this in production)
    setTimeout(() => {
      const promo = promoCodes[promoCode.toUpperCase()];
      
      if (!promo) {
        setPromoError('Invalid promo code');
        setIsApplyingPromo(false);
        return;
      }

      if (promo.minOrder && subtotal < promo.minOrder) {
        setPromoError(`Minimum order of ${formatPrice(promo.minOrder)} required`);
        setIsApplyingPromo(false);
        return;
      }

      setAppliedPromo(promo);
      setPromoError('');
      setIsApplyingPromo(false);
    }, 500);
  };

  // Remove promo code
  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
    setPromoError('');
  };

  // Estimated delivery date
  const getEstimatedDelivery = () => {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + (shippingCost === 0 ? 3 : 5));
    return deliveryDate.toLocaleDateString('en-KE', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Payment methods
  const paymentMethods = [
    { id: 'mpesa', name: 'M-Pesa', icon: '📱', description: 'Pay via mobile money' },
    { id: 'card', name: 'Card', icon: '💳', description: 'Credit/Debit card' },
    { id: 'cash', name: 'Cash on Delivery', icon: '💵', description: 'Pay when delivered' }
  ];

  // If cart is empty
  if (cartItems.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-4 sm:p-6 ${className}`}>
        <div className="text-center py-6 sm:py-8">
          <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300" />
          <p className="text-gray-600 text-base sm:text-lg">Your cart is empty</p>
          <p className="text-gray-400 text-xs sm:text-sm mt-2">Add items to see summary</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${sticky ? 'lg:sticky lg:top-4' : ''} ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 sm:p-4 rounded-t-lg">
        <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
          Order Summary
        </h2>
        <p className="text-blue-100 text-xs sm:text-sm mt-1">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
      </div>

      <div className="p-3 sm:p-4 md:p-5 lg:p-6 space-y-4 sm:space-y-5 md:space-y-6">
        {/* Price Breakdown */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex justify-between text-sm sm:text-base text-gray-700">
            <span>Subtotal ({itemCount} items)</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>

          {/* Shipping */}
          <div className="flex justify-between text-sm sm:text-base text-gray-700">
            <div className="flex items-center gap-1">
              <Truck className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Shipping</span>
            </div>
            <div className="text-right">
              {shippingCost === 0 ? (
                <span className="text-green-600 font-semibold">FREE</span>
              ) : (
                <span className="font-medium">{formatPrice(shippingCost)}</span>
              )}
            </div>
          </div>

          {/* Free shipping progress */}
          {subtotal < freeShippingThreshold && !appliedPromo?.type === 'shipping' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3">
              <div className="flex items-start gap-2">
                <Info className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-blue-800">
                    Add <span className="font-bold">{formatPrice(freeShippingThreshold - subtotal)}</span> more for FREE shipping!
                  </p>
                  <div className="w-full bg-blue-200 rounded-full h-1.5 sm:h-2 mt-1.5 sm:mt-2">
                    <div 
                      className="bg-blue-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(subtotal / freeShippingThreshold) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Discount */}
          {discount > 0 && (
            <div className="flex justify-between text-sm sm:text-base text-green-600">
              <div className="flex items-center gap-1">
                <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Discount ({appliedPromo.description})</span>
              </div>
              <span className="font-semibold">-{formatPrice(discount)}</span>
            </div>
          )}

          {/* Tax Info */}
          <div className="flex justify-between text-gray-500 text-xs sm:text-sm">
            <span>VAT (16% included)</span>
            <span>{formatPrice(taxAmount)}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-300 pt-2 sm:pt-3">
          <div className="flex justify-between items-center">
            <span className="text-base sm:text-lg font-bold text-gray-900">Total</span>
            <div className="text-right">
              <p className="text-xl sm:text-2xl font-bold text-blue-600">{formatPrice(total)}</p>
              {totalSavings > 0 && (
                <p className="text-xs sm:text-sm text-green-600">
                  You save {formatPrice(totalSavings)}!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Promo Code Section */}
        {showPromoCode && (
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-1">
              <Gift className="w-3 h-3 sm:w-4 sm:h-4" />
              Promo Code
            </label>
            
            {appliedPromo ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-800 text-sm sm:text-base">{promoCode.toUpperCase()}</p>
                    <p className="text-xs sm:text-sm text-green-600">{appliedPromo.description} applied</p>
                  </div>
                </div>
                <button
                  onClick={handleRemovePromo}
                  className="p-1 hover:bg-green-100 rounded transition-colors flex-shrink-0"
                  aria-label="Remove promo code"
                >
                  <X className="w-4 h-4 text-green-600" />
                </button>
              </div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleApplyPromo()}
                  />
                  <button
                    onClick={handleApplyPromo}
                    disabled={!promoCode || isApplyingPromo}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isApplyingPromo ? 'Applying...' : 'Apply'}
                  </button>
                </div>
                {promoError && (
                  <p className="text-red-500 text-xs sm:text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    {promoError}
                  </p>
                )}
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500">Try these codes:</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.keys(promoCodes).map(code => (
                      <button
                        key={code}
                        onClick={() => setPromoCode(code)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Shipping Estimate */}
        {showShippingEstimate && (
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-700">Delivering to</p>
                <p className="text-xs sm:text-sm text-gray-600 truncate">{deliveryLocation}</p>
                <button className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 mt-1">
                  Change location
                </button>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-700">Estimated Delivery</p>
                <p className="text-xs sm:text-sm text-gray-600">{getEstimatedDelivery()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Methods */}
        {showPaymentMethods && (
          <div className="space-y-2 sm:space-y-3">
            <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-1">
              <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
              Payment Method
            </label>
            <div className="space-y-2">
              {paymentMethods.map(method => (
                <button
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id)}
                  className={`w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border-2 rounded-lg transition-all ${
                    selectedPayment === method.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl sm:text-2xl flex-shrink-0">{method.icon}</span>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium text-gray-800 text-sm sm:text-base">{method.name}</p>
                    <p className="text-xs text-gray-500 truncate">{method.description}</p>
                  </div>
                  {selectedPayment === method.id && (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Checkout Button */}
        <button
          onClick={onCheckout}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-bold text-base sm:text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
        >
          <span>Proceed to Checkout</span>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500">
          <Shield className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="text-center">Secure checkout • 256-bit SSL encryption</span>
        </div>

        {/* Benefits */}
        <div className="space-y-1.5 sm:space-y-2 pt-3 sm:pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
            <span>Free returns within 30 days</span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
            <span>1-year warranty on all bikes</span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
            <span>Expert assembly available</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Demo Component
const CartSummaryDemo = () => {
  const [cartItems] = useState([
    {
      id: 1,
      name: 'Mountain Bike Pro X1',
      price: 45000,
      originalPrice: 52000,
      quantity: 1
    },
    {
      id: 2,
      name: 'Cycling Helmet',
      price: 2500,
      quantity: 2
    },
    {
      id: 3,
      name: 'Bike Lock',
      price: 1800,
      quantity: 1
    }
  ]);

  const handleCheckout = () => {
    alert('Proceeding to checkout with selected payment method!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
            Cart Summary
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Oshocks Junior Bike Shop - Production Ready Component
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Full featured cart */}
          <div className="w-full">
            <CartSummary
              cartItems={cartItems}
              onCheckout={handleCheckout}
              showPromoCode={true}
              showShippingEstimate={true}
              showPaymentMethods={true}
              deliveryLocation="Nairobi CBD, Kenya"
              sticky={false}
            />
          </div>

          {/* Empty cart demo */}
          <div className="w-full">
            <CartSummary
              cartItems={[]}
              onCheckout={handleCheckout}
              sticky={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;