import React, { useState } from 'react';
import { Gift, ShoppingCart, Calendar, Mail, User, MessageSquare, Check, CreditCard, Smartphone, Search, Copy, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

const GiftCards = () => {
  const [activeTab, setActiveTab] = useState('purchase');
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [senderName, setSenderName] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [selectedDesign, setSelectedDesign] = useState('cycling');
  const [deliveryMethod, setDeliveryMethod] = useState('email');
  const [addedToCart, setAddedToCart] = useState(false);
  const [checkBalance, setCheckBalance] = useState('');
  const [balanceResult, setBalanceResult] = useState(null);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemResult, setRedeemResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [isTabsSticky, setIsTabsSticky] = useState(false);
  const [showStickyTabs, setShowStickyTabs] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Check if user has scrolled past the threshold
      if (currentScrollY > 400) {
        setIsTabsSticky(true);
        
        // Show tabs when scrolling down, hide when scrolling up
        if (currentScrollY > lastScrollY) {
          setShowStickyTabs(true);
        } else {
          setShowStickyTabs(false);
        }
      } else {
        setIsTabsSticky(false);
        setShowStickyTabs(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const predefinedAmounts = [1000, 2500, 5000, 10000, 15000, 25000];
  
  const giftCardDesigns = [
    { id: 'cycling', name: 'Mountain Cycling', color: 'from-green-600 to-blue-600' },
    { id: 'road', name: 'Road Biking', color: 'from-orange-500 to-red-600' },
    { id: 'urban', name: 'Urban Rider', color: 'from-purple-600 to-pink-600' },
    { id: 'classic', name: 'Classic Style', color: 'from-gray-700 to-gray-900' },
  ];

  const faqItems = [
    {
      id: 1,
      question: 'How do I redeem a gift card?',
      answer: 'Simply enter the gift card code at checkout or show the code to our staff when shopping in-store. The balance will be automatically applied to your purchase.'
    },
    {
      id: 2,
      question: 'Do gift cards expire?',
      answer: 'No! Our gift cards never expire. Your recipient can use them whenever they\'re ready to shop.'
    },
    {
      id: 3,
      question: 'Can I check my gift card balance?',
      answer: 'Yes, visit our Balance Check page or contact our customer support with your gift card code to check the remaining balance.'
    },
    {
      id: 4,
      question: 'What if my purchase is less than the gift card value?',
      answer: 'The remaining balance stays on your gift card and can be used for future purchases. No value is lost!'
    },
    {
      id: 5,
      question: 'Can I use multiple gift cards?',
      answer: 'Yes! You can combine multiple gift cards on a single purchase, and even add a payment method for any remaining amount.'
    },
    {
      id: 6,
      question: 'Can gift cards be refunded?',
      answer: 'Gift cards are non-refundable once purchased. However, they never expire, giving you unlimited time to use them.'
    },
    {
      id: 7,
      question: 'Where can I find my gift card code?',
      answer: 'Your gift card code was sent to you via email or SMS when the gift card was purchased. Check your inbox or messages.'
    },
    {
      id: 8,
      question: 'Can I use gift cards for sale items?',
      answer: 'Yes! Gift cards can be used on any products in our store, including items on sale and promotional offers.'
    }
  ];

  const handleAddToCart = () => {
    const amount = selectedAmount === 'custom' ? parseFloat(customAmount) : selectedAmount;
    
    if (!amount || amount < 500) {
      alert('Please select or enter a valid amount (minimum KES 500)');
      return;
    }

    if (deliveryMethod === 'email' && !recipientEmail) {
      alert('Please enter recipient email address');
      return;
    }

    if (deliveryMethod === 'sms' && !recipientEmail) {
      alert('Please enter recipient phone number');
      return;
    }

    const giftCardData = {
      type: 'gift-card',
      amount,
      recipientEmail,
      recipientName,
      senderName,
      personalMessage,
      deliveryDate: deliveryDate || 'immediate',
      design: selectedDesign,
      deliveryMethod
    };

    console.log('Adding to cart:', giftCardData);
    setAddedToCart(true);
    
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const handleCheckBalance = () => {
    setTimeout(() => {
      setBalanceResult({
        code: checkBalance,
        balance: 4500,
        isValid: true
      });
    }, 800);
  };

  const handleRedeem = () => {
    setTimeout(() => {
      setRedeemResult({
        code: redeemCode,
        amount: 5000,
        success: true,
        message: 'Gift card successfully added to your account!'
      });
    }, 800);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const getAmountValue = () => {
    return selectedAmount === 'custom' ? parseFloat(customAmount) || 0 : selectedAmount || 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center mb-4">
            <Gift className="w-12 h-12 mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold">Gift Cards</h1>
          </div>
          <p className="text-center text-xl text-blue-100 max-w-2xl mx-auto">
            Give the perfect gift for cycling enthusiasts. Let them choose their dream bike or accessories!
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={`bg-white transition-all duration-300 ${isTabsSticky ? 'fixed top-16 left-0 right-0 z-40 shadow-md' : ''}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('purchase')}
              className={`flex-1 px-2 sm:px-4 md:px-6 py-3 font-semibold transition-colors flex flex-col sm:flex-row items-center justify-center ${
                activeTab === 'purchase'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Gift className="w-5 h-5 sm:mr-2 mb-1 sm:mb-0" />
              <span className="text-xs sm:text-sm md:text-base">Purchase</span>
            </button>
            <button
              onClick={() => setActiveTab('check')}
              className={`flex-1 px-2 sm:px-4 md:px-6 py-3 font-semibold transition-colors flex flex-col sm:flex-row items-center justify-center ${
                activeTab === 'check'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Search className="w-5 h-5 sm:mr-2 mb-1 sm:mb-0" />
              <span className="text-xs sm:text-sm md:text-base">Check Balance</span>
            </button>
            <button
              onClick={() => setActiveTab('redeem')}
              className={`flex-1 px-2 sm:px-4 md:px-6 py-3 font-semibold transition-colors flex flex-col sm:flex-row items-center justify-center ${
                activeTab === 'redeem'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <CreditCard className="w-5 h-5 sm:mr-2 mb-1 sm:mb-0" />
              <span className="text-xs sm:text-sm md:text-base">Redeem</span>
            </button>
          </div>
        </div>
      </div>

      {/* Spacer when tabs are sticky */}
      {isTabsSticky && <div className="h-[57px]"></div>}

      <div className="max-w-7xl mx-auto px-4 py-8 mt-8">

        {/* Purchase Tab */}
        {activeTab === 'purchase' && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Gift Card Preview */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Gift Card Preview</h2>
                
                {/* Gift Card Design */}
                <div className={`bg-gradient-to-br ${giftCardDesigns.find(d => d.id === selectedDesign).color} rounded-xl p-8 text-white shadow-2xl transform transition-transform hover:scale-105`}>
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-2xl font-bold">Oshocks Junior</h3>
                      <p className="text-sm opacity-90">Bike Shop</p>
                    </div>
                    <Gift className="w-12 h-12 opacity-80" />
                  </div>
                  
                  <div className="my-12 text-center">
                    <div className="text-5xl font-bold mb-2">
                      KES {getAmountValue().toLocaleString()}
                    </div>
                    <p className="text-sm opacity-90">Gift Card Value</p>
                  </div>
                  
                  <div className="border-t border-white border-opacity-30 pt-4 text-sm">
                    {recipientName && (
                      <p className="mb-2">To: <span className="font-semibold">{recipientName}</span></p>
                    )}
                    {senderName && (
                      <p>From: <span className="font-semibold">{senderName}</span></p>
                    )}
                  </div>
                </div>

                {/* Design Selection */}
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Choose Design</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {giftCardDesigns.map((design) => (
                      <button
                        key={design.id}
                        onClick={() => setSelectedDesign(design.id)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedDesign === design.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`h-20 bg-gradient-to-br ${design.color} rounded mb-2`}></div>
                        <p className="text-sm font-medium text-gray-700">{design.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Benefits Section */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Why Gift Cards?</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Valid on all products - bikes, accessories, and gear</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">No expiration date - use anytime</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Can be combined with promotional offers</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Instant delivery or schedule for special dates</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Redeemable online and in-store</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column - Gift Card Configuration */}
            <div className="space-y-6">
              {/* Amount Selection */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Select Amount</h2>
                
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {predefinedAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => {
                        setSelectedAmount(amount);
                        setCustomAmount('');
                      }}
                      className={`p-4 rounded-lg border-2 transition-all font-semibold ${
                        selectedAmount === amount
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-200 text-gray-700 hover:border-blue-400'
                      }`}
                    >
                      KES {amount.toLocaleString()}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or Enter Custom Amount (Min: KES 500)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500 font-medium">KES</span>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedAmount('custom');
                      }}
                      placeholder="Enter amount"
                      min="500"
                      className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Method */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Delivery Method</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={() => setDeliveryMethod('email')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      deliveryMethod === 'email'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Mail className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <p className="font-semibold text-gray-800">Email</p>
                    <p className="text-xs text-gray-600 mt-1">Instant delivery</p>
                  </button>
                  
                  <button
                    onClick={() => setDeliveryMethod('sms')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      deliveryMethod === 'sms'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Smartphone className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <p className="font-semibold text-gray-800">SMS</p>
                    <p className="text-xs text-gray-600 mt-1">Text message</p>
                  </button>
                </div>

                {/* Recipient Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recipient's {deliveryMethod === 'email' ? 'Email' : 'Phone Number'} *
                    </label>
                    <div className="relative">
                      {deliveryMethod === 'email' ? (
                        <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      ) : (
                        <Smartphone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      )}
                      <input
                        type={deliveryMethod === 'email' ? 'email' : 'tel'}
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder={deliveryMethod === 'email' ? 'recipient@example.com' : '+254 712 345 678'}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recipient's Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="Your name"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Date (Optional)
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Leave empty for immediate delivery</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Personal Message (Optional)
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <textarea
                        value={personalMessage}
                        onChange={(e) => setPersonalMessage(e.target.value)}
                        placeholder="Write a personal message..."
                        rows="4"
                        maxLength="250"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{personalMessage.length}/250 characters</p>
                  </div>
                </div>
              </div>

              {/* Payment Methods Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start">
                  <CreditCard className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">Payment Options</h4>
                    <p className="text-sm text-blue-800">
                      Pay securely with M-Pesa, Visa, Mastercard, or other accepted payment methods. 
                      Gift cards are delivered immediately after payment confirmation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={addedToCart}
                className={`w-full py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center ${
                  addedToCart
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-6 h-6 mr-2" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-6 h-6 mr-2" />
                    Add to Cart - KES {getAmountValue().toLocaleString()}
                  </>
                )}
              </button>

              <p className="text-center text-sm text-gray-600">
                By purchasing, you agree to our{' '}
                <a href="/terms" className="text-blue-600 hover:underline">
                  Gift Card Terms & Conditions
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Check Balance Tab */}
        {activeTab === 'check' && (
          <div className="max-w-2xl mx-auto mb-12">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold mb-6">Check Gift Card Balance</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Gift Card Code
                  </label>
                  <input
                    type="text"
                    value={checkBalance}
                    onChange={(e) => setCheckBalance(e.target.value.toUpperCase())}
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-mono"
                  />
                </div>
                <button
                  onClick={handleCheckBalance}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Check Balance
                </button>
              </div>

              {balanceResult && (
                <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Check className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-bold text-green-800">Balance Found</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <span className="font-medium">Card Code:</span> {balanceResult.code}
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      Available Balance: KES {balanceResult.balance.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* How to Check Balance */}
            <div className="mt-8 bg-white rounded-lg shadow-md p-8">
              <h3 className="text-xl font-bold mb-4">How to Check Your Balance</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                  <div>
                    <p className="font-semibold text-gray-800">Locate Your Gift Card Code</p>
                    <p className="text-gray-600 text-sm">Find the code in your email or SMS message from when you received the gift card.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                  <div>
                    <p className="font-semibold text-gray-800">Enter the Code Above</p>
                    <p className="text-gray-600 text-sm">Type or paste your gift card code in the field provided.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                  <div>
                    <p className="font-semibold text-gray-800">View Your Balance</p>
                    <p className="text-gray-600 text-sm">Your current balance and card details will be displayed instantly.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Redeem Tab */}
        {activeTab === 'redeem' && (
          <div className="max-w-2xl mx-auto mb-12">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold mb-6">Redeem Gift Card</h2>
              <p className="text-gray-600 mb-6">
                Add your gift card to your account balance or apply it during checkout.
              </p>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Gift Card Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={redeemCode}
                      onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyCode(redeemCode)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Copy code"
                    >
                      {copied ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-gray-600" />}
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleRedeem}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Redeem Gift Card
                </button>
              </div>

              {redeemResult && redeemResult.success && (
                <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-bold text-green-800">Success!</h3>
                  </div>
                  <p className="text-gray-700 mb-2">{redeemResult.message}</p>
                  <p className="text-xl font-bold text-green-600">
                    KES {redeemResult.amount.toLocaleString()} added to your account
                  </p>
                </div>
              )}
            </div>

            {/* How to Use Section */}
            <div className="mt-8 bg-white rounded-lg shadow-md p-8">
              <h3 className="text-xl font-bold mb-4">How to Use Your Gift Card</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                  <div>
                    <p className="font-semibold text-gray-800">During Checkout</p>
                    <p className="text-gray-600 text-sm">Enter your gift card code in the payment section when checking out.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                  <div>
                    <p className="font-semibold text-gray-800">Add to Account Balance</p>
                    <p className="text-gray-600 text-sm">Redeem your gift card here to add funds to your account for future purchases.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                  <div>
                    <p className="font-semibold text-gray-800">Check Remaining Balance</p>
                    <p className="text-gray-600 text-sm">Any unused balance stays on your card for future purchases.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Oshocks Gift Cards?</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold mb-2">Perfect Gift</h3>
              <p className="text-gray-600 text-sm">Let them choose exactly what they want from our extensive catalog</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold mb-2">Never Expires</h3>
              <p className="text-gray-600 text-sm">No expiration date means they can shop whenever they're ready</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold mb-2">Instant Delivery</h3>
              <p className="text-gray-600 text-sm">Email or SMS delivery means they get it immediately</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-bold mb-2">Easy to Use</h3>
              <p className="text-gray-600 text-sm">Simple redemption process at checkout or add to account</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section - Collapsible */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            {faqItems.map((faq) => (
              <div key={faq.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <span className="font-bold text-lg text-gray-800 text-left">{faq.question}</span>
                  {expandedFaq === faq.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-600 flex-shrink-0 ml-4" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0 ml-4" />
                  )}
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-6 py-4 bg-white">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftCards;