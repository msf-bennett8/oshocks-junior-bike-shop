import { useState, useEffect } from 'react';
import { CheckCircle, Package, Truck, MapPin, Phone, Mail, Download, Share2, ArrowRight, Calendar, CreditCard, ShoppingBag, Home, MessageCircle } from 'lucide-react';

const OrderSuccessPage = () => {
  const [orderData, setOrderData] = useState(null);
  const [countdown, setCountdown] = useState(5);
  
  // Mock order data - In production, this would come from URL params or API
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
        method: 'M-Pesa',
        transactionId: 'QGH7X9K2M1',
        amount: 52140,
        status: 'completed'
      },
      items: [
        {
          id: 1,
          name: 'Mountain Bike Pro X1 - 26" Aluminum Frame',
          price: 45000,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=200&h=200&fit=crop',
          seller: 'Oshocks Junior Bike Shop'
        },
        {
          id: 2,
          name: 'Cycling Helmet - Safety Plus with LED Light',
          price: 3500,
          quantity: 2,
          image: 'https://images.unsplash.com/photo-1557803175-8e6eeeeaf4dd?w=200&h=200&fit=crop',
          seller: 'Oshocks Junior Bike Shop'
        }
      ],
      summary: {
        subtotal: 52000,
        shipping: 500,
        tax: 8400,
        discount: 0,
        total: 52140
      }
    };
    
    setOrderData(mockOrder);
    
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
    // Navigate to order tracking page
    window.location.href = `/orders/${orderData?.orderNumber}`;
  };
  
  const handleContinueShopping = () => {
    window.location.href = '/';
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={handleTrackOrder}
            className="bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 transition flex items-center justify-center"
          >
            <Truck className="w-5 h-5 mr-2" />
            Track Order
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
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg border border-gray-200"
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
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">VAT (16%)</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(orderData.summary.tax)}
                  </span>
                </div>
                
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
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-green-900">Payment Status</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-200 text-green-900">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Confirmed
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-green-800">
                    <CreditCard className="w-4 h-4 mr-2" />
                    <span>{orderData.payment.method}</span>
                  </div>
                  <p className="text-xs text-green-700 ml-6">
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
            {[
              {
                name: 'Bike Lock - Heavy Duty',
                price: 2500,
                image: 'https://images.unsplash.com/photo-1589118949245-7d38baf380d6?w=300&h=300&fit=crop'
              },
              {
                name: 'Water Bottle Holder',
                price: 800,
                image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=300&h=300&fit=crop'
              },
              {
                name: 'Cycling Gloves Pro',
                price: 1500,
                image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&h=300&fit=crop'
              },
              {
                name: 'Bike Repair Kit',
                price: 3200,
                image: 'https://images.unsplash.com/photo-1593764379523-3b28c4077b7e?w=300&h=300&fit=crop'
              }
            ].map((product, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition cursor-pointer">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">{product.name}</h3>
                <p className="text-orange-600 font-bold">{formatCurrency(product.price)}</p>
                <button className="w-full mt-3 bg-orange-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-orange-700 transition">
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;