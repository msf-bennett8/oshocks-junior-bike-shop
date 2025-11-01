import { useState, useEffect } from 'react';
import { CheckCircle, Package, Truck, MapPin, Phone, Mail, Download, Share2, ArrowRight, Calendar, CreditCard, ShoppingBag, Home, MessageCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLocation, Link, useNavigate } from 'react-router-dom';

const OrderSuccessPage = () => {
  const { cartItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loadingRecommended, setLoadingRecommended] = useState(true);
  const [showReceivedModal, setShowReceivedModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);

  // Get order data from location state or create from cart
  useEffect(() => {
    // Simulate fetching order data
    const mockOrder = {
      orderNumber: `OS${Date.now().toString().slice(-8)}`,
      orderDate: new Date().toISOString(),
      status: 'confirmed',
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      customer: {
        name: 'John Kamau',
        email: 'john.kamau@example.com',
        phone: '+254712345678'
      },
      shipping: {
        address: '123 Kimathi Street, Apartment 4B',
        city: 'Nairobi',
        county: 'Nairobi',
        postalCode: '00100'
      },
      payment: {
        method: location.state?.orderData?.payment?.method || 'M-Pesa',
        transactionId: location.state?.orderData?.payment?.method === 'Cash on Delivery' 
          ? `COD-${Date.now().toString().slice(-8)}-${new Date().toISOString().replace(/[-:]/g, '').slice(0, 14)}`
          : location.state?.orderData?.payment?.transactionId || 'QGH7X9K2M1',
        amount: 52140,
        status: location.state?.orderData?.payment?.method === 'Cash on Delivery' ? 'pending' : 'completed'
      },
      items: (location.state?.items || cartItems || []).map(item => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
        image: item.thumbnail || item.image || '/api/placeholder/200/200',
        seller: 'Oshocks Junior Bike Shop'
      })),
      summary: (() => {
        const items = location.state?.items || cartItems || [];
        const subtotal = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
        
        // Get shipping cost from orderData if available, otherwise default to 500
        const shipping = location.state?.orderData?.payment?.shippingCost || 500;
        
        // const tax = Math.round(subtotal * 0.16); // 16% VAT - Commented out (business under KSh 5M threshold)
        const tax = 0; // No VAT charged for small businesses
        const discount = location.state?.discount || 0;
        const total = subtotal + shipping + tax - discount;
        
        return { subtotal, shipping, tax, discount, total };
      })()
    };
    
    // If order data was passed from checkout, use it; otherwise use mock
      if (location.state?.orderData) {
        setOrderData({
          ...mockOrder,
          ...location.state.orderData,
          payment: {
            ...location.state.orderData.payment,
            // Generate proper transaction ID for COD orders
            transactionId: location.state.orderData.payment?.method === 'Cash on Delivery'
              ? `COD-${mockOrder.orderNumber}-${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}`
              : location.state.orderData.payment?.transactionId || mockOrder.payment.transactionId
          },
          items: (location.state.items || cartItems || []).map(item => ({
            id: item.id,
            name: item.name,
            price: Number(item.price),
            quantity: item.quantity,
            image: item.thumbnail || item.image || '/api/placeholder/200/200',
            seller: 'Oshocks Junior Bike Shop'
          })),
          summary: (() => {
            const items = location.state.items || cartItems || [];
            const subtotal = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
            const shipping = location.state?.orderData?.payment?.shippingCost || 500;
            
            // const tax = subtotal * 0.16; // 16% VAT - Commented out (business under KSh 5M threshold)
            const tax = 0; // No VAT charged for small businesses
            const discount = location.state.discount || 0;
            const total = subtotal + shipping + tax - discount;
            
            return { subtotal, shipping, tax, discount, total };
          })()
        });
    } else {
      setOrderData(mockOrder);
    }
    
    // Countdown for redirect suggestion
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [location.state, cartItems]);

  // Fetch recommended products from API
  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      try {
        setLoadingRecommended(true);
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
        
        // Fetch top-selling or featured accessories
        const response = await fetch(`${apiUrl}/products?category=accessories&limit=4&sort=popularity`);
        
        if (response.ok) {
          const data = await response.json();
          const products = (data.data || data).slice(0, 4).map(product => ({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            originalPrice: product.compare_price ? Number(product.compare_price) : null,
            image: product.images?.[0]?.thumbnail_url || product.images?.[0]?.image_url || '/api/placeholder/150/150'
          }));
          setRecommendedProducts(products);
        }
      } catch (err) {
        console.error('Error fetching recommended products:', err);
      } finally {
        setLoadingRecommended(false);
      }
    };

    fetchRecommendedProducts();
  }, []);
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  const handleDownloadInvoice = () => {
    // In production, this would generate and download a PDF invoice
    alert('Invoice download functionality will be implemented with PDF generation');
  };
  
  const handleShareOrder = () => {
    // In production, this would use Web Share API or copy link to clipboard
    if (navigator.share) {
      navigator.share({
        title: 'My Order from Oshocks Junior Bike Shop',
        text: `Order #${orderData.orderNumber} - ${formatCurrency(orderData.summary.total)}`,
        url: window.location.href
      });
    } else {
      alert('Order link copied to clipboard!');
    }
  };
  
  const handleTrackOrder = () => {
    // ✅ CORRECT WAY - Pass state data
    navigate(`/orders/${orderData?.orderNumber}`, {
      state: {
        orderData: orderData,
        items: orderData.items,
        discount: orderData.summary?.discount || 0
      }
    });
  };
  
  const handleContinueShopping = () => {
    // ✅ Also fix this one
    navigate('/');
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6 text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Order Placed Successfully! 🎉
          </h1>
          
          <p className="text-lg text-gray-600 mb-2">
            Thank you for shopping with Oshocks Junior Bike Shop
          </p>
          
          <div className="inline-flex items-center bg-orange-50 border border-orange-200 rounded-lg px-6 py-3 mb-4">
            <Package className="w-5 h-5 text-orange-600 mr-2" />
            <span className="text-orange-900 font-semibold">
              Order #{orderData.orderNumber}
            </span>
          </div>
          
          <p className="text-gray-600">
            We've sent a confirmation email to <strong>{orderData.customer.email}</strong>
          </p>
        </div>
        
        {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <button
              onClick={handleTrackOrder}
              className="bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 transition flex items-center justify-center"
            >
              <Truck className="w-5 h-5 mr-2" />
              Track Order
            </button>

            <button
              onClick={() => setShowReceivedModal(true)}
              className="bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Order Delivered
            </button>
            
            <button
              onClick={handleDownloadInvoice}
              className="bg-gray-800 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-900 transition flex items-center justify-center"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Invoice
            </button>
            
            <button
              onClick={handleShareOrder}
              className="bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share Order
            </button>
            
            <button
              onClick={handleContinueShopping}
              className="bg-white border-2 border-gray-300 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:border-gray-400 transition flex items-center justify-center"
            >
              <Home className="w-5 h-5 mr-2" />
              Continue Shopping
            </button>
          </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Timeline */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Truck className="w-6 h-6 text-orange-600 mr-2" />
                Delivery Information
              </h2>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-900 font-semibold">Estimated Delivery</p>
                    <p className="text-green-800 text-sm">
                      {orderData.estimatedDelivery}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              {/* Delivery Steps */}
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 border-2 border-green-600 mr-4 flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Order Confirmed</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(orderData.orderDate).toLocaleString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 border-2 border-orange-600 mr-4 flex-shrink-0 animate-pulse">
                    <Package className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Processing Order</h3>
                    <p className="text-sm text-gray-600">Your order is being prepared</p>
                  </div>
                </div>
                
                <div className="flex items-start opacity-50">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 border-2 border-gray-300 mr-4 flex-shrink-0">
                    <Truck className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Out for Delivery</h3>
                    <p className="text-sm text-gray-600">On the way to your address</p>
                  </div>
                </div>
                
                <div className="flex items-start opacity-50">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 border-2 border-gray-300 mr-4 flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Delivered</h3>
                    <p className="text-sm text-gray-600">Package delivered successfully</p>
                  </div>
                </div>
              </div>
              
              {/* Shipping Address */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <MapPin className="w-5 h-5 text-orange-600 mr-2" />
                  Shipping Address
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-900">{orderData.customer.name}</p>
                  <p className="text-gray-600 text-sm mt-1">{orderData.shipping.address}</p>
                  <p className="text-gray-600 text-sm">
                    {orderData.shipping.city}, {orderData.shipping.county} {orderData.shipping.postalCode}
                  </p>
                  <div className="flex items-center text-sm text-gray-600 mt-2">
                    <Phone className="w-4 h-4 mr-1" />
                    {orderData.customer.phone}
                  </div>
                  {orderData.deliveryInstructions && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Delivery Instructions:</p>
                      <p className="text-sm text-gray-600">{orderData.deliveryInstructions}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <ShoppingBag className="w-6 h-6 text-orange-600 mr-2" />
                Order Items ({orderData.items.length})
              </h2>
              
              <div className="space-y-4">
                {orderData.items.map(item => (
                  <div key={item.id} className="flex items-start gap-4 pb-4 border-b border-gray-200 last:border-0">
                    <img
                      src={item.image || '/api/placeholder/96/96'}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                      onError={(e) => { e.target.src = '/api/placeholder/96/96'; }}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-1">Sold by: {item.seller}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(item.price)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* What's Next Section */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">What Happens Next?</h2>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <ArrowRight className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    You'll receive an email confirmation with your order details
                  </p>
                </div>
                
                <div className="flex items-start">
                  <ArrowRight className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    We'll send you tracking information once your order ships
                  </p>
                </div>
                
                <div className="flex items-start">
                  <ArrowRight className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    Our delivery partner will contact you before delivery
                  </p>
                </div>
                
                <div className="flex items-start">
                  <ArrowRight className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    You can track your order anytime from your account dashboard
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(orderData.summary.subtotal)}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(orderData.summary.shipping)}
                  </span>
                </div>
                
                {/* VAT display removed - business under KSh 5M annual turnover threshold
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">VAT (16%)</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(orderData.summary.tax)}
                    </span>
                  </div>
                  */}
                
                {orderData.summary.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Discount</span>
                    <span className="font-medium text-green-600">
                      -{formatCurrency(orderData.summary.discount)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold text-gray-900">Total Paid</span>
                <span className="text-2xl font-bold text-orange-600">
                  {formatCurrency(orderData.summary.total)}
                </span>
              </div>
              
              {/* Payment Info */}
                <div className={`${
                  orderData.payment.status === 'pending' 
                    ? 'bg-yellow-50 border-yellow-200' 
                    : 'bg-green-50 border-green-200'
                } border rounded-lg p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-semibold ${
                      orderData.payment.status === 'pending' ? 'text-yellow-900' : 'text-green-900'
                    }`}>
                      Payment Status
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                      orderData.payment.status === 'pending'
                        ? 'bg-yellow-200 text-yellow-900'
                        : 'bg-green-200 text-green-900'
                    }`}>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {orderData.payment.status === 'pending' ? 'Pending' : 'Confirmed'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className={`flex items-center text-sm ${
                      orderData.payment.status === 'pending' ? 'text-yellow-800' : 'text-green-800'
                    }`}>
                      <CreditCard className="w-4 h-4 mr-2" />
                      <span>{orderData.payment.method}</span>
                    </div>
                    <p className={`text-xs ml-6 ${
                      orderData.payment.status === 'pending' ? 'text-yellow-700' : 'text-green-700'
                    }`}>
                      Transaction ID: {orderData.payment.transactionId}
                    </p>
                  </div>
                </div>
            </div>
            
            {/* Need Help */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                <MessageCircle className="w-5 h-5 text-blue-600 mr-2" />
                Need Help?
              </h3>
              
              <p className="text-sm text-gray-700 mb-4">
                Our customer support team is here to assist you with any questions.
              </p>
              
              <div className="space-y-2">
                <a
                  href="tel:+254712345678"
                  className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  +254 712 345 678
                </a>
                
                <a
                  href="mailto:support@oshocksjr.com"
                  className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  support@oshocksjr.com
                </a>
              </div>
              
              <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-blue-700 transition flex items-center justify-center">
                <MessageCircle className="w-4 h-4 mr-2" />
                Live Chat Support
              </button>
            </div>
            
            {/* Continue Shopping Prompt */}
            {countdown > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                <p className="text-sm text-orange-900 mb-2">
                  Continue shopping in <strong>{countdown}</strong> seconds
                </p>
                <button
                  onClick={handleContinueShopping}
                  className="text-orange-600 text-sm font-semibold hover:text-orange-700"
                >
                  Browse More Products →
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Recommendations Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">You Might Also Like</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loadingRecommended ? (
              // Loading skeleton
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                  <div className="w-full h-40 bg-gray-200 rounded-lg mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-5 bg-gray-200 rounded w-2/3 mb-3"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))
            ) : recommendedProducts.length > 0 ? (
              recommendedProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition cursor-pointer block"
                >
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-40 object-cover rounded-lg mb-3"
                      onError={(e) => { e.target.src = '/api/placeholder/300/300'; }}
                    />
                    {product.originalPrice && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                        -{Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm line-clamp-2 h-10">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-orange-600 font-bold">{formatCurrency(product.price)}</p>
                      {product.originalPrice && (
                        <p className="text-xs text-gray-400 line-through">
                          {formatCurrency(product.originalPrice)}
                        </p>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      // Add to cart functionality can be added here
                      window.location.href = `/product/${product.id}`;
                    }}
                    className="w-full bg-orange-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-orange-700 transition"
                  >
                    View Product
                  </button>
                </Link>
              ))
            ) : (
              <div className="col-span-4 text-center py-8 text-gray-500">
                <p>No recommendations available at the moment</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Order Received Modal */}
      {showReceivedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fadeIn">
            {/* Close Button */}
            <button
              onClick={() => setShowReceivedModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            {/* Content */}
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
              Thank You! 🎉
            </h2>
            <p className="text-gray-600 text-center mb-2">
              Thank you for confirming delivery of your order!
            </p>
            <p className="text-sm text-gray-500 text-center mb-6">
              We hope you enjoy your purchase from Oshocks Junior Bike Shop.
            </p>

            {/* Rating Section */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <p className="text-sm font-semibold text-orange-900 mb-2 text-center">
                  How was your experience?
                </p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className={`transition-colors ${
                        star <= (hoveredStar || rating)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      } hover:text-yellow-400`}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      onClick={() => {
                        setRating(star);
                        // Handle rating - you can add API call here
                        setTimeout(() => {
                          alert(`Thank you for rating us ${star} star${star > 1 ? 's' : ''}!`);
                        }, 100);
                      }}
                    >
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-xs text-center text-gray-600 mt-2">
                    You rated: {rating} star{rating > 1 ? 's' : ''}
                  </p>
                )}
              </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowReceivedModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowReceivedModal(false);
                  navigate('/');
                }}
                className="flex-1 bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 transition"
              >
                Continue Shopping
              </button>
            </div>

            {/* Support Link */}
            <div className="text-center mt-4">
              <Link
                to="/contact"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Need help? Contact Support
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderSuccessPage;