import { useState, useEffect } from 'react';
import { CreditCard, Truck, MapPin, Phone, Mail, User, ShoppingBag, AlertCircle, CheckCircle, Loader, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const CheckoutPage = () => {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [shippingInfo, setShippingInfo] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: '', // This will now be county/city
    zone: '', // This will be the selected zone
    postalCode: '',
    deliveryInstructions: '' 
  });

  // Add state for available zones based on selected county
  const [availableZones, setAvailableZones] = useState([]);
  // Add state for zone selection modal
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [selectedZoneForModal, setSelectedZoneForModal] = useState(null);
  const [showCountyModal, setShowCountyModal] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState({});
  
  
  // County/City options with their zones
    const countyZones = {
      'Nairobi County': [
    { 
      name: 'Kasarani Area (0-5km)', 
      locations: 'Kahawa West, Kahawa Sukari, Kahawa Wendani, Kasarani (parts near Mwiki), Mwiki',
      cost: 150 
    },
    { 
      name: 'Roysambu Area (5-10km)', 
      locations: 'Roysambu, Garden Estate, Thome, Ruaraka, Kasarani (central), Lucky Summer, Clay City',
      cost: 250 
    },
    { 
      name: 'Parklands Area (10-15km)', 
      locations: 'Pangani, Muthaiga, Parklands, Highridge, Ngara, Eastleigh, Huruma, Mathare, Kariobangi',
      cost: 350 
    },
    { 
      name: 'CBD & Westlands (15-25km)', 
      locations: 'CBD, Westlands, Kilimani, Kileleshwa, Lavington, Upper Hill, South B, South C, Buru Buru, Donholm, Umoja, Embakasi, Starehe, Hurlingham, Spring Valley, Madaraka, Industrial Area, Dagoretti, Kariokor, Loresho',
      cost: 500 
    },
    { 
      name: 'Karen & Suburbs (25-40km)', 
      locations: 'Karen, Langata, Runda, Gigiri, Kitisuru, Nairobi West, Ruai, Utawala, Syokimau',
      cost: 700 
    },
    { 
      name: 'Outer Limits (40-50km)', 
      locations: 'Ngong (Nairobi side), Mlolongo (Nairobi side)',
      cost: 1000 
    }
  ],
    'Machakos County': [
      { 
        name: 'Zone 1 (40-60km)', 
        locations: 'Mlolongo (Machakos side), Athi River (Machakos side), Katani',
        cost: 1000 
      },
      { 
        name: 'Zone 2 (60-80km)', 
        locations: 'Machakos Town, Tala, Kangundo',
        cost: 1500 
      }
    ],
    'Kiambu County': [
      { 
        name: 'Githurai Area (0-10km)', 
        locations: 'Githurai 44, Githurai 45, Zimmerman, Kiambu Town, Thindigua, Ridgeways',
        cost: 200 
      },
      { 
        name: 'Ruiru Area (10-20km)', 
        locations: 'Ruiru Town, Juja Road, Bypass (Kiambu Road), Cianda, Village Market area, Ndumberi, Membley',
        cost: 350 
      },
      { 
        name: 'Ruaka & Kikuyu (20-30km)', 
        locations: 'Ruaka, Rosslyn, Limuru, Kikuyu, Kabete, Banana Hill, Wangige',
        cost: 500 
      },
      { 
        name: 'Thika Town (30-45km)', 
        locations: 'Thika Town, Juja Town, Kalimoni, Gatuanyaga, Makongeni (Thika), Gatundu',
        cost: 700 
      },
      { 
        name: 'Far Kiambu (45km+)', 
        locations: 'Gatanga, Githunguri, Lari, Karuri (far areas)',
        cost: 1000 
      }
    ],
    'Kajiado County': [
      { 
        name: 'Zone 1 (35-50km)', 
        locations: 'Kitengela, Ongata Rongai',
        cost: 800 
      },
      { 
        name: 'Zone 2 (50-70km)', 
        locations: 'Ngong (Kajiado side), Kiserian, Kajiado Town',
        cost: 1200 
      }
    ],
    'Other (Arrange own courier)': [
      { 
        name: 'Self-arranged courier service', 
        locations: 'Contact us at +254 700 000 000 for packaging assistance and courier recommendations',
        cost: 0 
      }
    ]
  };

  // County information with descriptions
const countyInfo = {
  'Nairobi County': {
    icon: '🏙️',
    description: 'Capital city with same-day delivery available',
    zones: 6,
    startingFrom: 150
  },
  'Kiambu County': {
    icon: '🌳',
    description: 'Neighboring county with reliable delivery',
    zones: 5,
    startingFrom: 200
  },
  'Machakos County': {
    icon: '⛰️',
    description: 'Eastern region with 2-3 day delivery',
    zones: 2,
    startingFrom: 1000
  },
  'Kajiado County': {
    icon: '🦁',
    description: 'Southern region with scheduled delivery',
    zones: 2,
    startingFrom: 800
  },
  'Other (Arrange own courier)': {
    icon: '📦',
    description: 'Nationwide coverage - arrange your own courier',
    zones: 1,
    startingFrom: 0
  }
};
  
  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

  // Calculate shipping cost based on selected zone
  const shippingCost = (() => {
    if (!shippingInfo.zone || !shippingInfo.city) return 0;
    const zones = countyZones[shippingInfo.city];
    // Extract just the zone name part (e.g., "Zone 1 (0-5km)") from the full selection
    const zoneName = shippingInfo.zone.split(' - ')[0];
    const selectedZone = zones?.find(z => z.name === zoneName);
    return selectedZone?.cost || 0;
  })();

  // const tax = subtotal * 0.16; // 16% VAT - Commented out (business under KSh 5M threshold)
  const tax = 0; // No VAT charged for small businesses
  const total = subtotal + shippingCost + tax;
  
  // Validation functions
  const validateShipping = () => {
    const newErrors = {};
    
    if (!shippingInfo.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!shippingInfo.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!shippingInfo.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(shippingInfo.email)) newErrors.email = 'Email is invalid';
    if (!shippingInfo.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^(254|0)[17]\d{8}$/.test(shippingInfo.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Enter valid Kenyan phone number';
    }
    if (!shippingInfo.address.trim()) newErrors.address = 'Address is required';
    if (!shippingInfo.city) newErrors.city = 'County/City is required';
    if (!shippingInfo.zone) newErrors.zone = 'Zone is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validatePayment = () => {
    const newErrors = {};
    
    if (paymentMethod === 'mpesa') {
      if (!mpesaPhone.trim()) newErrors.mpesaPhone = 'M-Pesa number is required';
      else if (!/^(254|0)[17]\d{8}$/.test(mpesaPhone.replace(/\s/g, ''))) {
        newErrors.mpesaPhone = 'Enter valid M-Pesa number';
      }
    } else if (paymentMethod === 'card') {
      if (!cardInfo.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
      else if (!/^\d{16}$/.test(cardInfo.cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = 'Enter valid 16-digit card number';
      }
      if (!cardInfo.cardName.trim()) newErrors.cardName = 'Cardholder name is required';
      if (!cardInfo.expiryDate.trim()) newErrors.expiryDate = 'Expiry date is required';
      if (!cardInfo.cvv.trim()) newErrors.cvv = 'CVV is required';
      else if (!/^\d{3}$/.test(cardInfo.cvv)) newErrors.cvv = 'CVV must be 3 digits';
    }
    
    if (!agreedToTerms) newErrors.terms = 'You must agree to terms and conditions';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (validateShipping()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!validatePayment()) return;
    
    setLoading(true);
    
    // Simulate API call - replace with actual API integration
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Prepare order data to pass to success page
      const orderData = {
        orderNumber: `OS${Date.now().toString().slice(-8)}`,
        orderDate: new Date().toISOString(),
        status: 'confirmed',
        customer: {
          name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
          email: shippingInfo.email,
          phone: shippingInfo.phone
        },
        shipping: {
          address: shippingInfo.address,
          county: shippingInfo.city, // Now contains the county
          zone: shippingInfo.zone,
          postalCode: shippingInfo.postalCode
        },
        payment: {
          method: paymentMethod === 'mpesa' ? 'M-Pesa' : 
                  paymentMethod === 'cod' ? 'Cash on Delivery' : 
                  'Credit/Debit Card',
          transactionId: paymentMethod === 'cod' ? 'COD-PENDING' : `TXN${Date.now().toString().slice(-10)}`,
          amount: total,
          status: paymentMethod === 'cod' ? 'pending' : 'completed',
          shippingCost: shippingCost // Pass the actual shipping cost
        },
        deliveryInstructions: shippingInfo.deliveryInstructions || '' // Add this line
      };
      
      // Navigate to success page with order data
      navigate('/order-success', {
        state: {
          orderData: orderData,
          items: cartItems,
          discount: 0 // Add discount if you have it
        }
      });
      
      // Clear the cart after successful order
      // clearCart(); // Uncomment this when you want to clear cart after order
      
    } catch (error) {
      setErrors({ submit: 'Payment failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Auto-fill shopping form when user data becomes available
  useEffect(() => {
    if (user) {
      setShippingInfo(prev => ({
        ...prev,
        firstName: user.name?.split(' ')[0] || prev.firstName,
        lastName: user.name?.split(' ').slice(1).join(' ') || prev.lastName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        address: user.address || prev.address
      }));
    }
  }, [user]);
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    return parts.length ? parts.join(' ') : value;
  };
  
  // Redirect if cart is empty
  if (!loading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <ShoppingBag className="w-20 h-20 mx-auto mb-6 text-gray-300" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">
              Add some items to your cart before checking out.
            </p>
            <Link
              to="/shop"
              className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your purchase in a few easy steps</p>
        </div>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-orange-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                1
              </div>
              <span className="ml-2 font-medium text-gray-700">Shipping</span>
            </div>
            <div className={`w-24 h-1 mx-4 ${step >= 2 ? 'bg-orange-600' : 'bg-gray-300'}`}></div>
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-orange-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                2
              </div>
              <span className="ml-2 font-medium text-gray-700">Payment</span>
            </div>
            <div className={`w-24 h-1 mx-4 ${step >= 3 ? 'bg-orange-600' : 'bg-gray-300'}`}></div>
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-orange-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                3
              </div>
              <span className="ml-2 font-medium text-gray-700">Confirm</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-6">
                  <Truck className="w-6 h-6 text-orange-600 mr-2" />
                  <h2 className="text-2xl font-bold text-gray-900">Shipping Information</h2>
                </div>
                
                <form onSubmit={handleShippingSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={shippingInfo.firstName}
                          onChange={(e) => setShippingInfo({...shippingInfo, firstName: e.target.value})}
                          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="John"
                        />
                      </div>
                      {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={shippingInfo.lastName}
                          onChange={(e) => setShippingInfo({...shippingInfo, lastName: e.target.value})}
                          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="Doe"
                        />
                      </div>
                      {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={shippingInfo.email}
                          onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="john@example.com"
                        />
                      </div>
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={shippingInfo.phone}
                          onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="0712345678 or 254712345678"
                        />
                      </div>
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="123 Main Street, Apartment 4B"
                      />
                    </div>
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                  </div>
                  
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      County/City *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowCountyModal(true)}
                      className={`w-full px-4 py-2 border rounded-lg text-left focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.city ? 'border-red-500' : 'border-gray-300'} hover:border-orange-400 text-gray-900`}
                    >
                      {shippingInfo.city ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{countyInfo[shippingInfo.city]?.icon}</span>
                          <span className="truncate">{shippingInfo.city}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Click to select county</span>
                      )}
                    </button>
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zone *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (shippingInfo.city) {
                          setShowZoneModal(true);
                        }
                      }}
                      disabled={!shippingInfo.city}
                      className={`w-full px-4 py-2 border rounded-lg text-left focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.zone ? 'border-red-500' : 'border-gray-300'} ${!shippingInfo.city ? 'bg-gray-100 cursor-not-allowed text-gray-400' : 'hover:border-orange-400 text-gray-900'}`}
                    >
                      {shippingInfo.zone ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-900">
                              {shippingInfo.zone.includes(' - ') 
                                ? shippingInfo.zone.split(' - ')[1] 
                                : shippingInfo.zone}
                            </span>
                            <span className="text-orange-600 font-semibold ml-2">
                              KSh {(() => {
                                const zoneName = shippingInfo.zone.split(' - ')[0];
                                const zone = availableZones.find(z => z.name === zoneName);
                                return zone?.cost.toLocaleString() || '0';
                              })()}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {shippingInfo.zone.split(' - ')[0]}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Click to select location</span>
                      )}
                    </button>
                    {errors.zone && <p className="text-red-500 text-xs mt-1">{errors.zone}</p>}
                    {shippingInfo.city === 'Other (Arrange own courier)' && (
                      <p className="text-xs text-gray-600 mt-1">
                        Contact us at +254 700 000 000 for courier assistance
                      </p>
                    )}
                  </div>
                  
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.postalCode}
                    onChange={(e) => setShippingInfo({...shippingInfo, postalCode: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="00100"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Instructions (Optional)
                  </label>
                  <textarea
                    value={shippingInfo.deliveryInstructions || ''}
                    onChange={(e) => setShippingInfo({...shippingInfo, deliveryInstructions: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., Please call before delivery, gate code is 1234, leave with security..."
                    rows="3"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Any special instructions for the delivery person (e.g., gate codes, building access, preferred delivery time)
                  </p>
                </div>
                </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
                  >
                    Continue to Payment
                  </button>
                </form>
              </div>
            )}
            
            {step === 2 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-6">
                  <CreditCard className="w-6 h-6 text-orange-600 mr-2" />
                  <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
                </div>
                
                <form onSubmit={handlePaymentSubmit}>
                    {/* Payment Method Selection */}
                    <div className="mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('mpesa')}
                          className={`p-4 border-2 rounded-lg flex items-center justify-center transition ${
                            paymentMethod === 'mpesa' 
                              ? 'border-orange-600 bg-orange-50' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="text-center">
                            <img 
                              src="https://upload.wikimedia.org/wikipedia/commons/1/15/M-PESA_LOGO-01.svg" 
                              alt="M-Pesa" 
                              className="h-12 w-auto mx-auto mb-2 object-contain"
                            />
                            <div className="text-sm text-gray-600">Pay with M-Pesa</div>
                          </div>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('card')}
                          className={`p-4 border-2 rounded-lg flex items-center justify-center transition ${
                            paymentMethod === 'card' 
                              ? 'border-orange-600 bg-orange-50' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-3 mb-2">
                              <img 
                                src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" 
                                alt="Visa" 
                                className="h-5 w-auto object-contain"
                              />
                              <img 
                                src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" 
                                alt="Mastercard" 
                                className="h-8 w-auto object-contain"
                              />
                            </div>
                            <div className="text-sm text-gray-600">Credit/Debit Card</div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('cod')}
                          className={`p-4 border-2 rounded-lg flex items-center justify-center transition ${
                            paymentMethod === 'cod' 
                              ? 'border-orange-600 bg-orange-50' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </div>
                            <div className="text-sm text-gray-600">Cash on Delivery</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  
                  {/* M-Pesa Payment */}
                  {paymentMethod === 'mpesa' && (
                    <div className="mb-6">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <h3 className="font-semibold text-green-900 mb-2">How M-Pesa Payment Works:</h3>
                        <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                          <li>Enter your M-Pesa phone number below</li>
                          <li>You'll receive an STK push notification on your phone</li>
                          <li>Enter your M-Pesa PIN to complete payment</li>
                          <li>You'll receive a confirmation SMS immediately</li>
                        </ol>
                      </div>
                      
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        M-Pesa Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={mpesaPhone}
                          onChange={(e) => setMpesaPhone(e.target.value)}
                          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.mpesaPhone ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="0712345678 or 254712345678"
                        />
                      </div>
                      {errors.mpesaPhone && <p className="text-red-500 text-xs mt-1">{errors.mpesaPhone}</p>}
                    </div>
                  )}
                  
                  {/* Card Payment */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Card Number *
                        </label>
                        <input
                          type="text"
                          value={cardInfo.cardNumber}
                          onChange={(e) => setCardInfo({...cardInfo, cardNumber: formatCardNumber(e.target.value)})}
                          maxLength="19"
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="1234 5678 9012 3456"
                        />
                        {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cardholder Name *
                        </label>
                        <input
                          type="text"
                          value={cardInfo.cardName}
                          onChange={(e) => setCardInfo({...cardInfo, cardName: e.target.value})}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.cardName ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="JOHN DOE"
                        />
                        {errors.cardName && <p className="text-red-500 text-xs mt-1">{errors.cardName}</p>}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expiry Date *
                          </label>
                          <input
                            type="text"
                            value={cardInfo.expiryDate}
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, '');
                              if (value.length >= 2) {
                                value = value.slice(0, 2) + '/' + value.slice(2, 4);
                              }
                              setCardInfo({...cardInfo, expiryDate: value});
                            }}
                            maxLength="5"
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="MM/YY"
                          />
                          {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVV *
                          </label>
                          <input
                            type="text"
                            value={cardInfo.cvv}
                            onChange={(e) => setCardInfo({...cardInfo, cvv: e.target.value.replace(/\D/g, '')})}
                            maxLength="3"
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.cvv ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="123"
                          />
                          {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cash on Delivery */}
                  {paymentMethod === 'cod' && (
                    <div className="mb-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Cash on Delivery Information
                        </h3>
                        <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
                          <li>Pay with cash when your order is delivered</li>
                          <li>Please have exact change ready for the delivery person</li>
                          <li>Inspect your items before making payment</li>
                          <li>COD fee: KSh 50 (included in total)</li>
                        </ul>
                      </div>
                      
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Order Confirmation</p>
                            <p className="text-xs text-gray-600 mt-1">
                              Your order will be confirmed immediately. Our delivery team will contact you to schedule delivery.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Terms and Conditions */}
                    <div className="mb-6">
                      <label className="flex items-start">
                        <input
                          type="checkbox"
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          className="mt-1 mr-2 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">
                          I agree to the{' '}
                          <Link to="/terms-of-service" className="text-orange-600 hover:underline font-medium">
                            Terms and Conditions
                          </Link>
                          {' and '}
                          <Link to="/privacy-policy" className="text-orange-600 hover:underline font-medium">
                            Privacy Policy
                          </Link>
                          {' *'}
                        </span>
                      </label>
                      {errors.terms && <p className="text-red-500 text-xs mt-1">{errors.terms}</p>}
                    </div>
                  
                  {errors.submit && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                      <p className="text-red-600 text-sm">{errors.submit}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                    >
                      Back to Shipping
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        `Pay ${formatCurrency(total)}`
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Policy Links Footer */}
            <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
              By completing this purchase, you agree to our{' '}
              <Link to="/terms-of-service" className="text-orange-600 hover:underline font-medium">
                Terms of Service
              </Link>
              {', '}
              <Link to="/privacy-policy" className="text-orange-600 hover:underline font-medium">
                Privacy Policy
              </Link>
              {', '}
              <Link to="/shipping-policy" className="text-orange-600 hover:underline font-medium">
                Shipping Policy
              </Link>
              {', and '}
              <Link to="/refund-policy" className="text-orange-600 hover:underline font-medium">
                Refund Policy
              </Link>
              .
            </div>
          
          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="flex items-center mb-4">
                <ShoppingBag className="w-5 h-5 text-orange-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">Order Summary</h3>
              </div>
              
              {/* Cart Items */}
              <div className="mb-4 max-h-60 overflow-y-auto">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200 last:border-0">
                    <img 
                      src={item.thumbnail || item.image || '/api/placeholder/64/64'} 
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{item.name}</h4>
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Price Breakdown */}
              <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-gray-900">
                    {shippingInfo.city && shippingInfo.zone ? formatCurrency(shippingCost) : 'TBD'}
                  </span>
                </div>
                {/* VAT display removed - business under KSh 5M annual turnover threshold
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">VAT (16%)</span>
                  <span className="font-medium text-gray-900">{formatCurrency(tax)}</span>
                </div>
                */}
              </div>
              
              {/* Total */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-orange-600">{formatCurrency(total)}</span>
              </div>
              
              {/* Shipping Info Display */}
              {shippingInfo.city && shippingInfo.zone && (
                <div className="bg-orange-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center text-sm text-orange-800 mb-1">
                    <Truck className="w-4 h-4 mr-1" />
                    <span className="font-semibold">
                      {shippingInfo.city === 'Nairobi County' ? 'Same-day delivery available' : 'Delivery in 2-3 days'}
                    </span>
                  </div>
                  <p className="text-xs text-orange-700">
                    Shipping to: <span className="font-semibold">
                      {shippingInfo.zone.includes(' - ') 
                        ? shippingInfo.zone.split(' - ')[1] 
                        : shippingInfo.zone}
                    </span>
                  </p>
                  <p className="text-xs text-orange-600">
                    {shippingInfo.city} ({shippingInfo.zone.split(' - ')[0]})
                  </p>
                </div>
              )}
              
              {/* Security Badge */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center text-xs text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span>Secure checkout with 256-bit SSL encryption</span>
                </div>
              </div>
              
              {/* Accepted Payment Methods */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-2">We accept:</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/1/15/M-PESA_LOGO-01.svg" 
                    alt="M-Pesa" 
                    className="h-8 w-auto object-contain opacity-80"
                  />
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" 
                    alt="Visa" 
                    className="h-4 w-auto object-contain opacity-80"
                  />
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" 
                    alt="Mastercard" 
                    className="h-6 w-auto object-contain opacity-80"
                  />
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center opacity-80" title="Cash on Delivery">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
             {/* Support Info */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-2">Need help?</p>
                <Link 
                  to="/contact-support" 
                  className="flex items-center text-xs text-orange-600 hover:text-orange-700 transition-colors"
                >
                  <Phone className="w-3 h-3 mr-1" />
                  <span>Contact Support</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Trust Badges */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Secure Payment</h4>
                <p className="text-sm text-gray-600">Your payment is 100% secure</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Fast Delivery</h4>
                <p className="text-sm text-gray-600">Delivered to your doorstep</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Easy Returns</h4>
                <p className="text-sm text-gray-600">7-day return policy</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Privacy Protected</h4>
                <p className="text-sm text-gray-600">
                  <Link to="/privacy-policy" className="text-orange-600 hover:underline">
                    View our privacy policy
                  </Link>
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* County Selection Modal */}
      {showCountyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">Select County/City</h3>
                  <p className="text-orange-100 text-sm mt-1">Choose your delivery location</p>
                </div>
                <button
                  onClick={() => setShowCountyModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-3">
                {Object.keys(countyZones).map((county, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setShippingInfo({
                        ...shippingInfo, 
                        city: county,
                        zone: '' // Reset zone when county changes
                      });
                      setAvailableZones(countyZones[county] || []);
                      setShowCountyModal(false);
                    }}
                    className={`w-full text-left p-5 border-2 rounded-xl transition-all hover:border-orange-500 hover:shadow-lg ${
                      shippingInfo.city === county
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:bg-orange-50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="text-4xl flex-shrink-0">
                        {countyInfo[county]?.icon}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-lg mb-1">{county}</h4>
                        <p className="text-sm text-gray-600 mb-2">{countyInfo[county]?.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {countyInfo[county]?.zones} {countyInfo[county]?.zones === 1 ? 'zone' : 'zones'}
                          </span>
                          {countyInfo[county]?.startingFrom > 0 && (
                            <span className="flex items-center gap-1">
                              <Truck className="w-3 h-3" />
                              From KSh {countyInfo[county]?.startingFrom.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Selected Indicator */}
                      {shippingInfo.city === county && (
                        <div className="flex-shrink-0">
                          <CheckCircle className="w-6 h-6 text-orange-600" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <button
                onClick={() => setShowCountyModal(false)}
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
              >
                {shippingInfo.city ? 'Continue' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zone Selection Modal */}
      {showZoneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">Select Delivery Zone</h3>
                  <p className="text-orange-100 text-sm mt-1">{shippingInfo.city}</p>
                </div>
                <button
                  onClick={() => setShowZoneModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-3">
                {availableZones.map((zone, index) => {
                  const locationList = zone.locations.split(',').map(loc => loc.trim());
                  const isZoneSelected = shippingInfo.zone?.startsWith(zone.name);
                  
                  return (
                    <div
                      key={index}
                      className={`border-2 rounded-xl transition-all ${
                        isZoneSelected
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-gray-900 text-lg">{zone.name}</h4>
                          <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg font-bold text-lg whitespace-nowrap">
                            KSh {zone.cost.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <p className="text-xs text-gray-500 mb-3 font-medium">Click on your specific location:</p>
                        <div className="flex flex-wrap gap-2">
                          {locationList.map((location, locIndex) => {
                            const fullZoneValue = `${zone.name} - ${location}`;
                            const isSelected = shippingInfo.zone === fullZoneValue;
                            
                            return (
                              <button
                                key={locIndex}
                                type="button"
                                onClick={() => {
                                  setShippingInfo({...shippingInfo, zone: fullZoneValue});
                                  setShowZoneModal(false);
                                }}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                  isSelected
                                    ? 'bg-orange-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-700'
                                }`}
                              >
                                {location}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <button
                onClick={() => setShowZoneModal(false)}
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
              >
                {shippingInfo.zone ? 'Confirm Selection' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;