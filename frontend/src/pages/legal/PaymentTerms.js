import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, Shield, AlertCircle, CheckCircle, XCircle, Clock, RefreshCw, Lock, ArrowLeft, Info, DollarSign, Wallet } from 'lucide-react';

const PaymentTerms = () => {
  const [expandedSections, setExpandedSections] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsLoading(false);
  }, []);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const lastUpdated = "November 15, 2024";

  const paymentMethods = [
    {
      id: 'mpesa',
      name: 'M-Pesa',
      icon: Smartphone,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      description: 'Mobile money payment via Safaricom M-Pesa',
      processingTime: 'Instant',
      fees: 'No additional fees',
      availability: 'Available 24/7',
      features: [
        'Instant payment confirmation',
        'No credit card required',
        'Pay from your mobile phone',
        'Secure STK push payment',
        'Transaction receipt via SMS'
      ]
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: 'Visa, Mastercard, and other major cards',
      processingTime: 'Instant',
      fees: 'No additional fees',
      availability: 'Available 24/7',
      features: [
        'Accept Visa, Mastercard, Amex',
        'Secure 3D authentication',
        'International cards accepted',
        'Save card for future purchases',
        'Instant payment confirmation'
      ]
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: Wallet,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      description: 'Direct bank transfer to our account',
      processingTime: '1-3 business days',
      fees: 'Bank charges may apply',
      availability: 'During banking hours',
      features: [
        'Transfer from any Kenyan bank',
        'Suitable for large orders',
        'Payment verification required',
        'Email payment confirmation upon receipt',
        'Retain transfer receipt'
      ]
    }
  ];

  const refundTimelines = [
    { method: 'M-Pesa', timeline: '1-3 business days', icon: Smartphone },
    { method: 'Credit/Debit Card', timeline: '5-10 business days', icon: CreditCard },
    { method: 'Bank Transfer', timeline: '3-7 business days', icon: Wallet }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Payment Terms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Helmet>
        <title>Payment Terms & Conditions - Oshocks Junior Bike Shop | Secure Payments</title>
        <meta name="description" content="Understand our payment terms, accepted payment methods including M-Pesa and credit cards, refund policies, and secure checkout process at Oshocks Junior Bike Shop." />
        <meta name="keywords" content="payment terms, M-Pesa payment, credit card payment, refund policy, payment methods Kenya, Oshocks Junior" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.oshocksjunior.co.ke/payment-terms" />
        
        <meta property="og:title" content="Payment Terms - Oshocks Junior Bike Shop" />
        <meta property="og:description" content="Secure payment options including M-Pesa, credit cards, and bank transfers. Learn about our payment terms and refund policies." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.oshocksjunior.co.ke/payment-terms" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Payment Terms",
            "description": "Payment Terms and Conditions for Oshocks Junior Bike Shop",
            "publisher": {
              "@type": "Organization",
              "name": "Oshocks Junior Bike Shop",
              "url": "https://www.oshocksjunior.co.ke"
            },
            "dateModified": lastUpdated
          })}
        </script>
      </Helmet>

      {/* Back Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-2 py-1"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Back</span>
          </button>
        </div>
      </div>

      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center mb-4" aria-hidden="true">
            <DollarSign className="w-16 h-16" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Payment Terms & Conditions
          </h1>
          <p className="text-xl text-center text-green-100">
            Secure and Convenient Payment Options for Your Cycling Needs
          </p>
          <p className="text-center text-green-200 mt-4">
            <time dateTime={lastUpdated}>Last Updated: {lastUpdated}</time>
          </p>
        </div>
      </header>

      {/* Quick Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-[52px] z-40 shadow-sm" aria-label="Page navigation">
        <div className="max-w-6xl mx-auto px-4 py-3 overflow-x-auto">
          <div className="flex space-x-4 min-w-max">
            <a href="#payment-methods" className="text-sm text-gray-600 hover:text-green-600 whitespace-nowrap transition-colors">
              Payment Methods
            </a>
            <a href="#pricing-currency" className="text-sm text-gray-600 hover:text-green-600 whitespace-nowrap transition-colors">
              Pricing & Currency
            </a>
            <a href="#payment-security" className="text-sm text-gray-600 hover:text-green-600 whitespace-nowrap transition-colors">
              Security
            </a>
            <a href="#refunds" className="text-sm text-gray-600 hover:text-green-600 whitespace-nowrap transition-colors">
              Refunds
            </a>
            <a href="#failed-payments" className="text-sm text-gray-600 hover:text-green-600 whitespace-nowrap transition-colors">
              Failed Payments
            </a>
            <a href="#contact" className="text-sm text-gray-600 hover:text-green-600 whitespace-nowrap transition-colors">
              Contact
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">

        {/* Introduction */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Payment Terms Overview</h2>
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
            <p>
              Welcome to Oshocks Junior Bike Shop's Payment Terms and Conditions. These terms govern all transactions 
              made on our platform and outline the payment methods we accept, our pricing policies, refund procedures, 
              and payment security measures. By making a purchase on our website, you agree to comply with and be bound 
              by these payment terms.
            </p>
            <p>
              We are committed to providing secure, convenient, and transparent payment options for all our customers 
              across Kenya. Whether you prefer mobile money through M-Pesa, credit/debit card payments, or bank transfers, 
              we ensure your transactions are processed safely and efficiently.
            </p>
            
            <div className="bg-green-50 border-l-4 border-green-600 p-4 mt-6" role="note">
              <div className="flex">
                <Shield className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold text-green-900 mb-1">Secure Payments Guaranteed</h3>
                  <p className="text-sm text-green-800">
                    All payments are processed through industry-leading payment gateways with bank-level encryption. 
                    Your financial information is never stored on our servers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Accepted Payment Methods */}
        <section id="payment-methods" className="bg-white rounded-lg shadow-md p-8 mb-8 scroll-mt-32">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Accepted Payment Methods</h2>
          <p className="text-gray-600 mb-8">
            We offer multiple secure payment options to suit your preferences. All payment methods are processed through 
            verified and certified payment service providers.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <div key={method.id} className={`border ${method.borderColor} rounded-lg p-6 ${method.bgColor}`}>
                  <div className="flex items-center mb-4">
                    <div className={`${method.bgColor} p-3 rounded-lg border ${method.borderColor}`}>
                      <Icon className={`w-8 h-8 ${method.color}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 ml-3">{method.name}</h3>
                  </div>
                  <p className="text-gray-700 mb-4">{method.description}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <Clock className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-gray-600">Processing: <strong>{method.processingTime}</strong></span>
                    </div>
                    <div className="flex items-center text-sm">
                      <DollarSign className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-gray-600">Fees: <strong>{method.fees}</strong></span>
                    </div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-gray-600">{method.availability}</span>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {method.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-sm text-gray-700">
                        <CheckCircle className={`w-4 h-4 ${method.color} mr-2 flex-shrink-0 mt-0.5`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* M-Pesa Detailed Instructions */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Smartphone className="w-6 h-6 text-green-600 mr-2" />
              How to Pay with M-Pesa
            </h3>
            <ol className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="font-semibold text-green-600 mr-3">1.</span>
                <span>Select M-Pesa as your payment method during checkout</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-green-600 mr-3">2.</span>
                <span>Enter your M-Pesa registered phone number (07XX XXX XXX or 01XX XXX XXX)</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-green-600 mr-3">3.</span>
                <span>You will receive an STK push notification on your phone</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-green-600 mr-3">4.</span>
                <span>Enter your M-Pesa PIN to authorize the payment</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-green-600 mr-3">5.</span>
                <span>You will receive an SMS confirmation from M-Pesa and your order will be confirmed instantly</span>
              </li>
            </ol>
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800 flex items-start">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                <span>Ensure you have sufficient balance in your M-Pesa account. Transaction will fail if balance is insufficient.</span>
              </p>
            </div>
          </div>
        </section>

        {/* Pricing and Currency */}
        <section id="pricing-currency" className="bg-white rounded-lg shadow-md p-8 mb-8 scroll-mt-32">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Pricing and Currency</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Currency</h3>
              <p className="text-gray-700 mb-2">
                All prices on our website are displayed in <strong>Kenyan Shillings (KES)</strong> unless otherwise stated. 
                For international customers, prices may be displayed in US Dollars (USD) based on your location.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Price Accuracy</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>We make every effort to ensure prices are accurate at the time of display</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Prices are subject to change without notice</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>The price confirmed in your order confirmation email is the final price</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>In case of pricing errors, we will contact you before processing your order</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Value Added Tax (VAT)</h3>
              <p className="text-gray-700">
                All prices include VAT at the prevailing rate (currently 16% in Kenya) unless explicitly stated as 
                "VAT exclusive". The VAT amount will be clearly shown during checkout and on your invoice.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Delivery Charges</h3>
              <p className="text-gray-700 mb-2">
                Delivery charges are calculated based on:
              </p>
              <ul className="space-y-1 ml-6 text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Your delivery location within Kenya</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Total weight and size of your order</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Selected delivery speed (standard or express)</span>
                </li>
              </ul>
              <p className="text-gray-700 mt-2">
                Delivery charges will be displayed clearly before you complete your purchase. Free delivery may be 
                available for orders above a certain value.
              </p>
            </div>
          </div>
        </section>

        {/* Payment Security */}
        <section id="payment-security" className="bg-white rounded-lg shadow-md p-8 mb-8 scroll-mt-32">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <Lock className="w-8 h-8 text-green-600 mr-3" />
            Payment Security
          </h2>
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
            <p>
              Your payment security is our top priority. We employ industry-standard security measures to protect your 
              financial information and ensure safe transactions.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
                <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Encryption & Security
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>256-bit SSL encryption for all transactions</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>PCI DSS Level 1 compliant payment processors</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>No storage of card details on our servers</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Secure tokenization of payment information</span>
                  </li>
                </ul>
              </div>

              <div className="border border-green-200 rounded-lg p-6 bg-green-50">
                <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  3D Secure Authentication
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Additional authentication for card payments</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>OTP verification via SMS or email</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Protection against unauthorized use</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Verified by Visa and Mastercard SecureCode</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-6" role="alert">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">Important Security Notice</h3>
                  <p className="text-sm text-red-800">
                    We will never ask for your M-Pesa PIN, credit card CVV, or full card details via email or phone. 
                    If you receive such requests, do not respond and report them to our security team immediately at 
                    security@oshocksjunior.co.ke
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Processing */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Payment Processing</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Order Confirmation</h3>
              <p className="text-gray-700">
                Once your payment is successfully processed, you will receive:
              </p>
              <ul className="mt-2 space-y-2 ml-6 text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>An on-screen confirmation message</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>An order confirmation email with your order number and details</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>An SMS notification (for M-Pesa payments)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>A tax invoice with VAT details</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Payment Authorization</h3>
              <p className="text-gray-700">
                By completing a purchase, you authorize us to charge the total amount shown during checkout, including 
                product costs, delivery charges, and applicable taxes. You confirm that you are authorized to use the 
                payment method provided.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Payment Verification</h3>
              <p className="text-gray-700 mb-2">
                We reserve the right to verify payment details before processing orders. This may involve:
              </p>
              <ul className="space-y-1 ml-6 text-gray-700">
                <li>• Contacting you to confirm order details</li>
                <li>• Requesting additional identification documents</li>
                <li>• Verifying delivery address information</li>
                <li>• Checking payment method validity</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Refunds and Cancellations */}
        <section id="refunds" className="bg-white rounded-lg shadow-md p-8 mb-8 scroll-mt-32">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Refunds and Cancellations</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Refund Policy</h3>
              <p className="text-gray-700 mb-4">
                We process refunds in accordance with our Return Policy. Approved refunds will be processed back to 
                the original payment method used for the purchase.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-4">Refund Processing Times</h4>
                <div className="space-y-3">
                  {refundTimelines.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white rounded border border-blue-100">
                        <div className="flex items-center">
                          <Icon className="w-5 h-5 text-blue-600 mr-3" />
                          <span className="font-medium text-gray-900">{item.method}</span>
                        </div>
                        <span className="text-sm text-gray-600">{item.timeline}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-sm text-blue-800 mt-4 flex items-start">
                  <Info className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Refund timelines may vary depending on your bank or payment provider. We initiate all approved refunds within 2 business days.</span>
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Order Cancellation</h3>
              <p className="text-gray-700 mb-2">
                You may cancel your order under the following conditions:
              </p>
              <ul className="space-y-2 ml-6 text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Before the order has been shipped - full refund</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>After shipping but before delivery - refund minus shipping costs</span>
                </li>
                <li className="flex items-start">
                  <XCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>After delivery - subject to our Return Policy terms</span>
                </li>
              </ul>
              <p className="text-gray-700 mt-3">
                To cancel an order, contact our customer service team at support@oshocksjunior.co.ke or call us 
                during business hours. Please have your order number ready.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Partial Refunds</h3>
              <p className="text-gray-700">
                Partial refunds may be issued in cases where only some items in your order are returned or if products 
                are returned in used or damaged condition. The refund amount will be calculated based on the condition 
                of returned items and our Return Policy guidelines.
              </p>
            </div>
          </div>
        </section>

        {/* Failed Payments */}
        <section id="failed-payments" className="bg-white rounded-lg shadow-md p-8 mb-8 scroll-mt-32">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Failed or Declined Payments</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Common Reasons for Payment Failure</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <h4 className="font-semibold text-red-900 mb-2 flex items-center">
                    <XCircle className="w-5 h-5 mr-2" />
                    M-Pesa Payment Issues
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Insufficient M-Pesa balance</li>
                    <li>• Incorrect PIN entered</li>
                    <li>• Transaction timeout (STK push not completed)</li>
                    <li>• Daily transaction limit exceeded</li>
                    <li>• Phone number not registered with M-Pesa</li>
                  </ul>
                </div>

                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <h4 className="font-semibold text-red-900 mb-2 flex items-center">
                    <XCircle className="w-5 h-5 mr-2" />
                    Card Payment Issues
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Insufficient funds in account</li>
                    <li>• Card expired or blocked</li>
                    <li>• Incorrect card details entered</li>
                    <li>• 3D Secure authentication failed</li>
                    <li>• International transactions not enabled</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">What to Do if Payment Fails</h3>
              <ol className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="font-semibold text-blue-600 mr-3">1.</span>
                  <div>
                    <strong>Check your payment method:</strong> Ensure sufficient balance, correct details, and that 
                    your payment method is active and valid.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold text-blue-600 mr-3">2.</span>
                  <div>
                    <strong>Try again:</strong> Return to the checkout page and attempt the payment again. Sometimes 
                    temporary network issues can cause failures.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold text-blue-600 mr-3">3.</span>
                  <div>
                    <strong>Use an alternative payment method:</strong> If one method fails repeatedly, try a different 
                    payment option (e.g., switch from card to M-Pesa).
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold text-blue-600 mr-3">4.</span>
                  <div>
                    <strong>Contact your bank or M-Pesa:</strong> If issues persist, contact your payment provider to 
                    ensure there are no restrictions on your account.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold text-blue-600 mr-3">5.</span>
                  <div>
                    <strong>Contact our support team:</strong> If you continue experiencing issues, reach out to our 
                    customer service at support@oshocksjunior.co.ke with your order details.
                  </div>
                </li>
              </ol>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4" role="alert">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h4 className="font-semibold text-yellow-900 mb-1">Pending Payments</h4>
                  <p className="text-sm text-yellow-800">
                    If payment was deducted from your account but the order wasn't confirmed, please wait 15-30 minutes. 
                    If the issue persists, contact us with your transaction reference number. We will verify the payment 
                    status and assist you accordingly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Disputed Payments */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Payment Disputes and Chargebacks</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Disputing a Payment</h3>
              <p className="text-gray-700 mb-4">
                If you believe there has been an error with your payment or you have been charged incorrectly, please 
                contact our customer service team immediately at support@oshocksjunior.co.ke before initiating a 
                chargeback with your bank or payment provider.
              </p>
              <p className="text-gray-700">
                We are committed to resolving all payment disputes fairly and promptly. Most issues can be resolved 
                within 3-5 business days when reported directly to us.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Chargeback Policy</h3>
              <p className="text-gray-700 mb-3">
                Chargebacks should be a last resort. Please note:
              </p>
              <ul className="space-y-2 ml-6 text-gray-700">
                <li className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-orange-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Initiating a chargeback without contacting us first may result in suspension of your account</span>
                </li>
                <li className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-orange-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>We will provide all transaction documentation to your bank or payment provider</span>
                </li>
                <li className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-orange-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Fraudulent chargebacks may result in legal action and permanent account ban</span>
                </li>
                <li className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-orange-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Chargeback fees may be passed on to customers in cases of unjustified disputes</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Fraud Prevention</h3>
              <p className="text-gray-700">
                We actively monitor all transactions for fraudulent activity. If we suspect fraud, we may:
              </p>
              <ul className="space-y-2 ml-6 text-gray-700 mt-2">
                <li>• Contact you to verify the transaction</li>
                <li>• Request additional identification or payment verification</li>
                <li>• Cancel the order and refund the payment</li>
                <li>• Report suspected fraud to relevant authorities</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Multi-Vendor Marketplace */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Multi-Vendor Marketplace Payments</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Split Payments</h3>
              <p className="text-gray-700 mb-4">
                When you purchase items from multiple sellers in a single order, your payment is processed as one 
                transaction but distributed to the respective sellers according to their sales. You will receive a 
                single invoice showing the breakdown of items from each seller.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Seller Payment Processing</h3>
              <p className="text-gray-700 mb-2">
                As the marketplace operator, we:
              </p>
              <ul className="space-y-2 ml-6 text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Collect payment from customers on behalf of all sellers</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Hold funds securely until order fulfillment is confirmed</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Release payment to sellers after successful delivery</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Handle all refunds and payment disputes centrally</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Refunds for Multi-Vendor Orders</h3>
              <p className="text-gray-700">
                If you need to return items from a multi-vendor order, refunds are processed separately for each seller's 
                items. You may receive multiple refund transactions if returning products from different sellers. Each 
                refund will be processed according to our standard refund timelines.
              </p>
            </div>
          </div>
        </section>

        {/* Payment Records and Invoices */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Payment Records and Invoices</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Tax Invoices</h3>
              <p className="text-gray-700 mb-3">
                Every purchase includes a tax invoice that contains:
              </p>
              <ul className="space-y-2 ml-6 text-gray-700">
                <li>• Order number and date</li>
                <li>• Itemized list of products purchased</li>
                <li>• Prices including VAT breakdown</li>
                <li>• Delivery charges</li>
                <li>• Payment method used</li>
                <li>• Our company details and PIN number</li>
              </ul>
              <p className="text-gray-700 mt-3">
                Invoices are automatically sent to your registered email address and can be downloaded from your account 
                dashboard at any time.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Payment History</h3>
              <p className="text-gray-700">
                You can view your complete payment history, including all transactions, refunds, and pending payments, 
                by logging into your account and navigating to "Order History" or "Payment Records". We maintain these 
                records for a minimum of 7 years for accounting and legal purposes.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Receipt Requests</h3>
              <p className="text-gray-700">
                If you need additional copies of receipts or invoices, or require specific invoice formats for your 
                business accounting, please contact our accounts department at accounts@oshocksjunior.co.ke with your 
                order number and requirements.
              </p>
            </div>
          </div>
        </section>

        {/* Changes to Payment Terms */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Changes to Payment Terms</h2>
          <p className="text-gray-700 mb-4">
            We reserve the right to modify these Payment Terms and Conditions at any time. Changes will be effective 
            immediately upon posting on our website. The "Last Updated" date at the top of this page indicates when 
            these terms were last revised.
          </p>
          <p className="text-gray-700 mb-4">
            Material changes to payment terms will be communicated via email to registered users. Your continued use 
            of our platform after such changes constitutes your acceptance of the new terms.
          </p>
          <p className="text-gray-700">
            We encourage you to review these payment terms periodically to stay informed about how we process and 
            protect your payments.
          </p>
        </section>

        {/* Contact Information */}
        <section id="contact" className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-lg shadow-md p-8 text-white scroll-mt-32">
          <h2 className="text-3xl font-bold mb-6">Payment Support & Assistance</h2>
          <p className="mb-6 text-green-100">
            If you have any questions about our payment terms, need assistance with a transaction, or want to report 
            a payment issue, our team is here to help.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment Issues
              </h3>
              <p className="text-green-100 text-sm mb-2">
                For payment failures, refund queries, or transaction problems
              </p>
              <a 
                href="mailto:payments@oshocksjunior.co.ke" 
                className="text-white underline hover:text-green-200 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-700 rounded"
              >
                payments@oshocksjunior.co.ke
              </a>
            </div>

            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Fraud & Security
              </h3>
              <p className="text-green-100 text-sm mb-2">
                Report suspicious activity or security concerns
              </p>
              <a 
                href="mailto:security@oshocksjunior.co.ke" 
                className="text-white underline hover:text-green-200 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-700 rounded"
              >
                security@oshocksjunior.co.ke
              </a>
            </div>

            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center">
                <RefreshCw className="w-5 h-5 mr-2" />
                General Support
              </h3>
              <p className="text-green-100 text-sm mb-2">
                For all other payment-related questions
              </p>
              <a 
                href="mailto:support@oshocksjunior.co.ke" 
                className="text-white underline hover:text-green-200 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-700 rounded"
              >
                support@oshocksjunior.co.ke
              </a>
            </div>
          </div>

          <div className="border-t border-green-500 pt-6">
            <h3 className="font-semibold mb-3">Business Hours</h3>
            <div className="grid md:grid-cols-2 gap-4 text-green-100">
              <div>
                <p className="font-medium text-white">Customer Support</p>
                <p className="text-sm">Monday - Friday: 8:00 AM - 8:00 PM</p>
                <p className="text-sm">Saturday: 9:00 AM - 6:00 PM</p>
                <p className="text-sm">Sunday: 10:00 AM - 4:00 PM</p>
              </div>
              <div>
                <p className="font-medium text-white">Payment Processing</p>
                <p className="text-sm">M-Pesa & Cards: 24/7 automated</p>
                <p className="text-sm">Bank Transfers: During banking hours</p>
                <p className="text-sm">Payment Support: Business hours only</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-green-500">
            <p className="text-sm text-green-200">
              Our physical store is located in Nairobi, Kenya. Visit us for in-person payment assistance or walk-in 
              purchases. For online payment support, please use the contact methods above.
            </p>
          </div>
        </section>

        {/* Related Policies */}
        <nav className="mt-8 bg-gray-50 rounded-lg p-6" aria-label="Related policies">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Policies & Information</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <a 
              href="/terms-of-service" 
              className="px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-between"
            >
              <span>Terms of Service</span>
              <CheckCircle className="w-4 h-4 text-gray-400" />
            </a>
            <a 
              href="/return-policy" 
              className="px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-between"
            >
              <span>Return & Refund Policy</span>
              <RefreshCw className="w-4 h-4 text-gray-400" />
            </a>
            <a 
              href="/privacy-policy" 
              className="px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-between"
            >
              <span>Privacy Policy</span>
              <Shield className="w-4 h-4 text-gray-400" />
            </a>
            <a 
              href="/shipping-policy" 
              className="px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-between"
            >
              <span>Shipping & Delivery</span>
              <Clock className="w-4 h-4 text-gray-400" />
            </a>
          </div>
        </nav>

      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 mt-12">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} Oshocks Junior Bike Shop. All rights reserved. Kenya's Premier Cycling Marketplace.
          </p>
          <p className="text-xs mt-2">
            This Payment Terms document was last updated on <time dateTime={lastUpdated}>{lastUpdated}</time>
          </p>
          <p className="text-xs mt-2 text-gray-500">
            Secure payments powered by Stripe, Flutterwave, and Safaricom M-Pesa
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PaymentTerms;