import React, { useState, useEffect } from 'react';
import { RotateCcw, Package, CheckCircle, XCircle, Clock, AlertTriangle, TruckIcon, Shield, ArrowLeft, Info, PackageCheck, PackageX, Calendar, DollarSign } from 'lucide-react';

const ReturnPolicy = () => {
  const [expandedSections, setExpandedSections] = useState({});
  const [isLoading, setIsLoading] = useState(true);

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

  const returnEligibility = [
    {
      category: 'Bicycles (Complete)',
      period: '14 days',
      conditions: [
        'Must be unused and in original packaging',
        'All accessories and documentation included',
        'No scratches, dents, or modifications',
        'Original tags and labels attached'
      ],
      icon: Package,
      color: 'blue'
    },
    {
      category: 'Bike Parts & Accessories',
      period: '30 days',
      conditions: [
        'Unopened original packaging (for most items)',
        'No signs of installation or use',
        'All components and manuals included',
        'Receipt or proof of purchase required'
      ],
      icon: PackageCheck,
      color: 'green'
    },
    {
      category: 'Cycling Apparel',
      period: '30 days',
      conditions: [
        'Unworn with original tags attached',
        'No washing or alterations',
        'Hygiene seal intact (if applicable)',
        'Original packaging preferred'
      ],
      icon: PackageCheck,
      color: 'purple'
    },
    {
      category: 'Electronics & Gadgets',
      period: '7 days',
      conditions: [
        'Factory sealed packaging unopened',
        'All accessories in original condition',
        'Warranty seal intact',
        'Original invoice required'
      ],
      icon: Clock,
      color: 'orange'
    }
  ];

  const nonReturnableItems = [
    {
      item: 'Custom-Built Bicycles',
      reason: 'Made to your specific requirements',
      icon: XCircle
    },
    {
      item: 'Clearance/Sale Items',
      reason: 'Marked as final sale (unless defective)',
      icon: XCircle
    },
    {
      item: 'Used or Installed Parts',
      reason: 'Once installed or used, cannot be resold',
      icon: XCircle
    },
    {
      item: 'Helmets & Safety Gear',
      reason: 'Hygiene and safety regulations',
      icon: XCircle
    },
    {
      item: 'Opened Lubricants/Chemicals',
      reason: 'Cannot be resold once seal is broken',
      icon: XCircle
    },
    {
      item: 'Gift Cards',
      reason: 'Non-refundable as per policy',
      icon: XCircle
    }
  ];

  const returnProcess = [
    {
      step: 1,
      title: 'Initiate Return Request',
      description: 'Log into your account and navigate to Order History. Select the order and click "Request Return". Provide reason for return and upload photos if applicable.',
      timeline: 'Within return period',
      icon: RotateCcw
    },
    {
      step: 2,
      title: 'Receive Return Authorization',
      description: 'Our team will review your request within 24-48 hours. You will receive a Return Authorization Number (RAN) via email along with return instructions.',
      timeline: '1-2 business days',
      icon: CheckCircle
    },
    {
      step: 3,
      title: 'Package Your Item',
      description: 'Pack the item securely in original packaging. Include all accessories, manuals, and tags. Print and attach the return label provided in the authorization email.',
      timeline: 'Before pickup',
      icon: Package
    },
    {
      step: 4,
      title: 'Schedule Pickup or Drop-off',
      description: 'Choose between free pickup (within Nairobi) or drop off at our store. For pickup, schedule a convenient time. For drop-off, visit us during business hours.',
      timeline: 'Within 7 days of approval',
      icon: TruckIcon
    },
    {
      step: 5,
      title: 'Item Inspection',
      description: 'Once we receive your return, our team will inspect it to verify condition and eligibility. This process typically takes 2-3 business days.',
      timeline: '2-3 business days',
      icon: Shield
    },
    {
      step: 6,
      title: 'Refund Processing',
      description: 'If approved, refund will be initiated to your original payment method. You will receive confirmation via email. See refund timelines for different payment methods.',
      timeline: '1-10 business days',
      icon: DollarSign
    }
  ];

  const refundOptions = [
    {
      option: 'Original Payment Method',
      description: 'Full refund to the card, M-Pesa, or bank account used for purchase',
      processingTime: '1-10 business days depending on method',
      recommended: true
    },
    {
      option: 'Store Credit',
      description: 'Instant credit to your Oshocks account, can be used immediately for future purchases',
      processingTime: 'Immediate',
      recommended: false
    },
    {
      option: 'Exchange',
      description: 'Exchange for a different size, color, or similar product of equal value',
      processingTime: 'Upon approval and availability',
      recommended: false
    }
  ];

  const colorMap = {
    blue: { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    green: { text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    purple: { text: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
    orange: { text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Return Policy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Back Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-2 py-1"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Back</span>
          </button>
        </div>
      </div>

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center mb-4" aria-hidden="true">
            <RotateCcw className="w-16 h-16" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Return & Refund Policy
          </h1>
          <p className="text-xl text-center text-blue-100">
            Hassle-Free Returns for Your Peace of Mind
          </p>
          <p className="text-center text-blue-200 mt-4">
            <time dateTime={lastUpdated}>Last Updated: {lastUpdated}</time>
          </p>
        </div>
      </header>

      {/* Quick Stats Banner */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">30</div>
              <div className="text-sm text-gray-600 mt-1">Days Return Period</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">100%</div>
              <div className="text-sm text-gray-600 mt-1">Money Back Guarantee</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">Free</div>
              <div className="text-sm text-gray-600 mt-1">Returns in Nairobi</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">24-48h</div>
              <div className="text-sm text-gray-600 mt-1">Request Processing</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-[52px] z-40 shadow-sm" aria-label="Page navigation">
        <div className="max-w-6xl mx-auto px-4 py-3 overflow-x-auto">
          <div className="flex space-x-4 min-w-max">
            <a href="#overview" className="text-sm text-gray-600 hover:text-blue-600 whitespace-nowrap transition-colors">
              Overview
            </a>
            <a href="#eligibility" className="text-sm text-gray-600 hover:text-blue-600 whitespace-nowrap transition-colors">
              Return Eligibility
            </a>
            <a href="#process" className="text-sm text-gray-600 hover:text-blue-600 whitespace-nowrap transition-colors">
              Return Process
            </a>
            <a href="#non-returnable" className="text-sm text-gray-600 hover:text-blue-600 whitespace-nowrap transition-colors">
              Non-Returnable Items
            </a>
            <a href="#refunds" className="text-sm text-gray-600 hover:text-blue-600 whitespace-nowrap transition-colors">
              Refunds
            </a>
            <a href="#exchanges" className="text-sm text-gray-600 hover:text-blue-600 whitespace-nowrap transition-colors">
              Exchanges
            </a>
            <a href="#contact" className="text-sm text-gray-600 hover:text-blue-600 whitespace-nowrap transition-colors">
              Contact
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">

        {/* Overview */}
        <section id="overview" className="bg-white rounded-lg shadow-md p-8 mb-8 scroll-mt-32">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Return Policy Overview</h2>
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
            <p>
              At Oshocks Junior Bike Shop, we want you to be completely satisfied with your purchase. We understand that 
              sometimes products may not meet your expectations or requirements. That's why we offer a flexible and 
              customer-friendly return policy designed to make your shopping experience worry-free.
            </p>
            <p>
              This Return and Refund Policy outlines the conditions, procedures, and timelines for returning products 
              purchased from our online marketplace or physical store. Please read this policy carefully before making 
              a purchase to understand your rights and responsibilities.
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mt-6" role="note">
              <div className="flex">
                <Shield className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Your Satisfaction Guaranteed</h3>
                  <p className="text-sm text-blue-800">
                    We stand behind the quality of our products. If you're not satisfied with your purchase for any 
                    reason within the return period, we'll make it right with a full refund, exchange, or store credit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Return Eligibility by Category */}
        <section id="eligibility" className="bg-white rounded-lg shadow-md p-8 mb-8 scroll-mt-32">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Return Eligibility by Product Category</h2>
          <p className="text-gray-600 mb-8">
            Different product categories have different return periods and conditions. Review the specific requirements 
            for your purchased items below.
          </p>

          <div className="space-y-6">
            {returnEligibility.map((item, idx) => {
              const Icon = item.icon;
              const colors = colorMap[item.color];
              
              return (
                <div key={idx} className={`border ${colors.border} rounded-lg p-6 ${colors.bg}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-lg bg-white border ${colors.border}`}>
                        <Icon className={`w-6 h-6 ${colors.text}`} />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-xl font-semibold text-gray-900">{item.category}</h3>
                        <div className="flex items-center mt-1">
                          <Calendar className={`w-4 h-4 ${colors.text} mr-1`} />
                          <span className={`text-sm font-medium ${colors.text}`}>Return Period: {item.period}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Return Conditions:</h4>
                    <ul className="space-y-2">
                      {item.conditions.map((condition, condIdx) => (
                        <li key={condIdx} className="flex items-start text-sm text-gray-700">
                          <CheckCircle className={`w-4 h-4 ${colors.text} mr-2 flex-shrink-0 mt-0.5`} />
                          <span>{condition}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-500 p-4" role="note">
            <div className="flex">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">Important Notice</h3>
                <p className="text-sm text-yellow-800">
                  The return period begins from the date of delivery, not the date of purchase. For multi-vendor orders, 
                  each seller's items may have different return policies. Check individual product pages for specific details.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Return Process Steps */}
        <section id="process" className="bg-white rounded-lg shadow-md p-8 mb-8 scroll-mt-32">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Return an Item</h2>
          <p className="text-gray-600 mb-8">
            Follow these simple steps to return your purchase. Our team is here to assist you throughout the process.
          </p>

          <div className="space-y-6">
            {returnProcess.map((step) => {
              const Icon = step.icon;
              
              return (
                <div key={step.step} className="relative">
                  {step.step !== returnProcess.length && (
                    <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-blue-200" aria-hidden="true"></div>
                  )}
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg z-10">
                      {step.step}
                    </div>
                    
                    <div className="ml-6 flex-1 bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <Icon className="w-5 h-5 text-blue-600 mr-2" />
                          <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full whitespace-nowrap">
                          {step.timeline}
                        </span>
                      </div>
                      <p className="text-gray-700">{step.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
              <Info className="w-5 h-5 mr-2" />
              Need Help with Your Return?
            </h3>
            <p className="text-green-800 text-sm mb-3">
              Our customer service team is available to assist you with the return process. Contact us via:
            </p>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="bg-white rounded p-3 border border-green-200">
                <div className="font-semibold text-gray-900 text-sm">Email Support</div>
                <a href="mailto:returns@oshocksjunior.co.ke" className="text-blue-600 hover:underline text-sm">
                  returns@oshocksjunior.co.ke
                </a>
              </div>
              <div className="bg-white rounded p-3 border border-green-200">
                <div className="font-semibold text-gray-900 text-sm">Live Chat</div>
                <div className="text-gray-600 text-sm">Available on website 24/7</div>
              </div>
              <div className="bg-white rounded p-3 border border-green-200">
                <div className="font-semibold text-gray-900 text-sm">Phone Support</div>
                <div className="text-gray-600 text-sm">Mon-Sat: 8AM - 8PM</div>
              </div>
            </div>
          </div>
        </section>

        {/* Non-Returnable Items */}
        <section id="non-returnable" className="bg-white rounded-lg shadow-md p-8 mb-8 scroll-mt-32">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Non-Returnable Items</h2>
          <p className="text-gray-600 mb-6">
            For hygiene, safety, and quality reasons, certain items cannot be returned once purchased. Please review 
            this list carefully before completing your order.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {nonReturnableItems.map((item, idx) => {
              const Icon = item.icon;
              
              return (
                <div key={idx} className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <div className="flex items-start">
                    <Icon className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.item}</h3>
                      <p className="text-sm text-gray-600 mt-1">{item.reason}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
              <Info className="w-5 h-5 mr-2" />
              Defective Non-Returnable Items
            </h3>
            <p className="text-sm text-blue-800">
              If any non-returnable item arrives defective or damaged, please contact us within 48 hours of delivery. 
              We will arrange for a replacement or full refund in such cases, as these are covered under our 
              manufacturer's warranty and defect policy.
            </p>
          </div>
        </section>

        {/* Refund Options */}
        <section id="refunds" className="bg-white rounded-lg shadow-md p-8 mb-8 scroll-mt-32">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Refund Options</h2>
          <p className="text-gray-600 mb-8">
            Once your return is approved and inspected, you can choose from the following refund options:
          </p>

          <div className="space-y-4">
            {refundOptions.map((option, idx) => (
              <div 
                key={idx} 
                className={`border rounded-lg p-6 ${option.recommended ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-semibold text-gray-900">{option.option}</h3>
                      {option.recommended && (
                        <span className="ml-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mt-2">{option.description}</p>
                    <div className="flex items-center mt-3 text-sm">
                      <Clock className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-gray-600">Processing Time: <strong>{option.processingTime}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Refund Processing Times by Payment Method</h3>
            <div className="overflow-x-auto">
              <table className="w-full" role="table">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="text-left py-3 px-4 font-semibold text-gray-700">Payment Method</th>
                    <th scope="col" className="text-left py-3 px-4 font-semibold text-gray-700">Processing Time</th>
                    <th scope="col" className="text-left py-3 px-4 font-semibold text-gray-700">Additional Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-900">M-Pesa</td>
                    <td className="py-3 px-4 text-gray-700">1-3 business days</td>
                    <td className="py-3 px-4 text-sm text-gray-600">Fastest refund method</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-900">Credit/Debit Card</td>
                    <td className="py-3 px-4 text-gray-700">5-10 business days</td>
                    <td className="py-3 px-4 text-sm text-gray-600">Depends on your bank's processing</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-900">Bank Transfer</td>
                    <td className="py-3 px-4 text-gray-700">3-7 business days</td>
                    <td className="py-3 px-4 text-sm text-gray-600">Bank details required</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-900">Store Credit</td>
                    <td className="py-3 px-4 text-gray-700">Immediate</td>
                    <td className="py-3 px-4 text-sm text-gray-600">Instant credit to account</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 p-4" role="alert">
            <div className="flex">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h4 className="font-semibold text-yellow-900 mb-1">Shipping Costs</h4>
                <p className="text-sm text-yellow-800">
                  Original shipping costs are non-refundable unless the return is due to our error (wrong item sent, 
                  defective product, etc.). Return shipping is free for pickups within Nairobi. Outside Nairobi, 
                  return shipping costs may apply unless the return is due to our error.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Exchanges */}
        <section id="exchanges" className="bg-white rounded-lg shadow-md p-8 mb-8 scroll-mt-32">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Product Exchanges</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Exchange Policy</h3>
              <p className="text-gray-700 mb-4">
                If you'd prefer to exchange your item rather than receive a refund, we're happy to facilitate an exchange 
                for a different size, color, or model of equal or lesser value. Exchanges are subject to product availability.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">How Exchanges Work</h3>
              <ol className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="font-semibold text-blue-600 mr-3">1.</span>
                  <span>Initiate a return request and select "Exchange" as your preferred option</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold text-blue-600 mr-3">2.</span>
                  <span>Specify the product you'd like to receive in exchange (size, color, model)</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold text-blue-600 mr-3">3.</span>
                  <span>We'll verify availability and send you an exchange authorization</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold text-blue-600 mr-3">4.</span>
                  <span>Return your original item following our standard return process</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold text-blue-600 mr-3">5.</span>
                  <span>Once we receive and inspect your return, we'll ship your exchange item at no extra cost</span>
                </li>
              </ol>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Exchange Considerations</h3>
              <ul className="space-y-2 ml-6 text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Exchanges are processed faster than refunds (typically 3-5 business days)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>No shipping charges for equal-value exchanges within Kenya</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>If the exchange item is of higher value, you can pay the difference</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>If the exchange item is of lower value, we'll issue a partial refund or store credit</span>
                </li>
                <li className="flex items-start">
                  <XCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Exchanges are subject to product availability; if unavailable, we'll offer a refund</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Damaged or Defective Items */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Damaged or Defective Products</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Reporting Damage or Defects</h3>
              <p className="text-gray-700 mb-4">
                If you receive a damaged or defective product, please notify us immediately. We take product quality 
                seriously and will resolve the issue promptly.
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-3">Required Steps:</h4>
                <ol className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="font-semibold text-red-600 mr-2">1.</span>
                    <span>Contact us within <strong>48 hours of delivery</strong> via email or live chat</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold text-red-600 mr-2">2.</span>
                    <span>Provide your order number and clear photos/videos of the damage or defect</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold text-red-600 mr-2">3.</span>
                    <span>Include photos of the packaging if it shows damage</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold text-red-600 mr-2">4.</span>
                    <span>Describe the issue in detail</span>
                  </li>
                </ol>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Our Response to Defective Items</h3>
              <p className="text-gray-700 mb-3">
                For damaged or defective products, we offer the following solutions at no cost to you:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <PackageCheck className="w-8 h-8 text-green-600 mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-2">Free Replacement</h4>
                  <p className="text-sm text-gray-600">We'll send a replacement item at no charge with expedited shipping</p>
                </div>
                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <DollarSign className="w-8 h-8 text-blue-600 mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-2">Full Refund</h4>
                  <p className="text-sm text-gray-600">Receive a complete refund including original shipping costs</p>
                </div>
                <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                  <RotateCcw className="w-8 h-8 text-purple-600 mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-2">Repair Service</h4>
                  <p className="text-sm text-gray-600">For bicycles, we can arrange free repair at our workshop</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Manufacturer's Warranty</h3>
              <p className="text-gray-700 mb-3">
                Many products come with manufacturer warranties that extend beyond our return period:
              </p>
              <ul className="space-y-2 ml-6 text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Bicycles: 6-12 months warranty on frame and components (varies by brand)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Electronics: 3-12 months manufacturer warranty</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Bike parts: 3-6 months warranty against manufacturing defects</span>
                </li>
              </ul>
              <p className="text-gray-700 mt-3">
                For warranty claims after the return period, please contact us with your proof of purchase and we'll 
                coordinate with the manufacturer on your behalf.
              </p>
            </div>
          </div>
        </section>

        {/* Return Shipping */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Return Shipping Information</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Free Return Shipping</h3>
              <p className="text-gray-700 mb-4">
                We offer free return pickup within Nairobi for all approved returns. Simply schedule a convenient pickup 
                time and our courier partner will collect the package from your location.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Return Shipping Options</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
                  <div className="flex items-center mb-3">
                    <TruckIcon className="w-6 h-6 text-blue-600 mr-2" />
                    <h4 className="font-semibold text-blue-900">Pickup Service</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Free within Nairobi and suburbs</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Schedule via website or customer service</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Available Monday - Saturday, 9AM - 6PM</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Pickup within 2-3 business days</span>
                    </li>
                  </ul>
                </div>

                <div className="border border-green-200 rounded-lg p-6 bg-green-50">
                  <div className="flex items-center mb-3">
                    <Package className="w-6 h-6 text-green-600 mr-2" />
                    <h4 className="font-semibold text-green-900">Drop-off Service</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Visit our Nairobi store location</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Immediate processing upon drop-off</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Bring your Return Authorization Number</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Get instant receipt and confirmation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Returns from Outside Nairobi</h3>
              <p className="text-gray-700 mb-3">
                For customers outside Nairobi:
              </p>
              <ul className="space-y-2 ml-6 text-gray-700">
                <li className="flex items-start">
                  <Info className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>You can ship the item to our Nairobi address using your preferred courier</span>
                </li>
                <li className="flex items-start">
                  <Info className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Keep your shipping receipt for reimbursement consideration</span>
                </li>
                <li className="flex items-start">
                  <Info className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Return shipping costs are reimbursed if return is due to our error</span>
                </li>
                <li className="flex items-start">
                  <Info className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>We can arrange courier pickup with costs deducted from refund (if applicable)</span>
                </li>
              </ul>
            </div>

            <div className="bg-orange-50 border-l-4 border-orange-500 p-4" role="alert">
              <div className="flex">
                <AlertTriangle className="w-5 h-5 text-orange-600 mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h4 className="font-semibold text-orange-900 mb-1">Package Safely</h4>
                  <p className="text-sm text-orange-800">
                    Please ensure items are securely packaged to prevent damage during return shipping. Items damaged 
                    during return transit may not qualify for full refund. Use original packaging when possible and 
                    include adequate protection for fragile items.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Multi-Vendor Returns */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Multi-Vendor Marketplace Returns</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Returning Items from Multiple Sellers</h3>
              <p className="text-gray-700 mb-4">
                If your order contains items from multiple sellers, you can return items from one or more sellers 
                independently. Each seller's items will be processed separately with individual refunds.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">How Multi-Vendor Returns Work</h3>
              <ol className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="font-semibold text-blue-600 mr-3">1.</span>
                  <span>Initiate return for specific items (you can select items from different sellers)</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold text-blue-600 mr-3">2.</span>
                  <span>Each seller reviews and approves their respective items independently</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold text-blue-600 mr-3">3.</span>
                  <span>You may receive multiple Return Authorization Numbers</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold text-blue-600 mr-3">4.</span>
                  <span>All items can be returned together in one package (label items clearly)</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold text-blue-600 mr-3">5.</span>
                  <span>Refunds are processed separately for each seller's items</span>
                </li>
              </ol>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Processing Times</h3>
              <p className="text-gray-700 mb-3">
                Different sellers may have varying processing times:
              </p>
              <ul className="space-y-2 ml-6 text-gray-700">
                <li className="flex items-start">
                  <Clock className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Oshocks direct items: 1-2 business days approval</span>
                </li>
                <li className="flex items-start">
                  <Clock className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Third-party seller items: 2-3 business days approval</span>
                </li>
                <li className="flex items-start">
                  <Clock className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Refunds are issued within 2 business days of inspection approval</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Important Reminders */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-md p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-6">Important Reminders</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Calendar className="w-5 h-5 mr-2" />
                <h3 className="font-semibold">Check Return Periods</h3>
              </div>
              <p className="text-sm text-blue-100">
                Different products have different return windows. The clock starts from delivery date, not purchase date.
              </p>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Package className="w-5 h-5 mr-2" />
                <h3 className="font-semibold">Keep Original Packaging</h3>
              </div>
              <p className="text-sm text-blue-100">
                Save all boxes, tags, and documentation. Returns in original packaging are processed faster.
              </p>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Shield className="w-5 h-5 mr-2" />
                <h3 className="font-semibold">Inspect Upon Delivery</h3>
              </div>
              <p className="text-sm text-blue-100">
                Check your order immediately upon delivery. Report damage or defects within 48 hours for fastest resolution.
              </p>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Info className="w-5 h-5 mr-2" />
                <h3 className="font-semibold">Contact Us First</h3>
              </div>
              <p className="text-sm text-blue-100">
                Always initiate returns through our official channels. Do not ship items back without authorization.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section id="contact" className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-lg shadow-md p-8 text-white scroll-mt-32">
          <h2 className="text-3xl font-bold mb-6">Need Help with a Return?</h2>
          <p className="mb-6 text-green-100">
            Our customer service team is ready to assist you with any return or refund questions. We're committed to 
            making the process as smooth as possible.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center">
                <RotateCcw className="w-5 h-5 mr-2" />
                Returns Department
              </h3>
              <p className="text-green-100 text-sm mb-2">
                For return requests and status updates
              </p>
              <a 
                href="mailto:returns@oshocksjunior.co.ke" 
                className="text-white underline hover:text-green-200 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-700 rounded"
              >
                returns@oshocksjunior.co.ke
              </a>
            </div>

            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Refunds Team
              </h3>
              <p className="text-green-100 text-sm mb-2">
                For refund status and payment questions
              </p>
              <a 
                href="mailto:refunds@oshocksjunior.co.ke" 
                className="text-white underline hover:text-green-200 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-700 rounded"
              >
                refunds@oshocksjunior.co.ke
              </a>
            </div>

            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                General Support
              </h3>
              <p className="text-green-100 text-sm mb-2">
                For all other questions and assistance
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
            <h3 className="font-semibold mb-3">Return Center Address</h3>
            <address className="text-green-100 not-italic">
              <p className="font-medium text-white">Oshocks Junior Bike Shop</p>
              <p>Returns Department</p>
              <p>Nairobi, Kenya</p>
              <p className="mt-2 text-sm">Business Hours: Monday - Saturday, 8:00 AM - 6:00 PM</p>
            </address>
          </div>

          <div className="mt-6 pt-6 border-t border-green-500">
            <p className="text-sm text-green-200">
              For fastest resolution, log into your account and initiate the return request online. You can track your 
              return status in real-time through your account dashboard.
            </p>
          </div>
        </section>

        {/* Related Policies */}
        <nav className="mt-8 bg-gray-50 rounded-lg p-6" aria-label="Related policies">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Policies & Information</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <a 
              href="/payment-terms" 
              className="px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-between"
            >
              <span>Payment Terms</span>
              <DollarSign className="w-4 h-4 text-gray-400" />
            </a>
            <a 
              href="/shipping-policy" 
              className="px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-between"
            >
              <span>Shipping Policy</span>
              <TruckIcon className="w-4 h-4 text-gray-400" />
            </a>
            <a 
              href="/warranty-policy" 
              className="px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-between"
            >
              <span>Warranty Policy</span>
              <Shield className="w-4 h-4 text-gray-400" />
            </a>
            <a 
              href="/terms-of-service" 
              className="px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-between"
            >
              <span>Terms of Service</span>
              <CheckCircle className="w-4 h-4 text-gray-400" />
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
            This Return Policy was last updated on <time dateTime={lastUpdated}>{lastUpdated}</time>
          </p>
          <p className="text-xs mt-2 text-gray-500">
            Your satisfaction is our priority. We're here to help make returns easy and hassle-free.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ReturnPolicy;