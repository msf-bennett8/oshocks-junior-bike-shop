import { useState } from 'react';
import { RotateCcw, ChevronDown, ChevronUp, Package, CreditCard, Clock, CheckCircle, XCircle, AlertCircle, Truck, Shield, DollarSign, FileText, Phone, Mail, MessageSquare, Calculator, ArrowRight, MapPin, Search, Download, Share2, Printer, BookOpen } from 'lucide-react';

export default function RefundPolicyPage() {
  const [expandedSections, setExpandedSections] = useState({ overview: true });
  const [searchQuery, setSearchQuery] = useState('');
  const [refundCalculator, setRefundCalculator] = useState({
    orderAmount: '',
    daysElapsed: '',
    condition: 'unopened'
  });
  const [calculatorResult, setCalculatorResult] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  
  const lastUpdated = "October 11, 2025";

  const toggleSection = (id) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const calculateRefund = () => {
    const amount = parseFloat(refundCalculator.orderAmount);
    const days = parseInt(refundCalculator.daysElapsed);
    
    if (isNaN(amount) || isNaN(days) || amount <= 0) {
      setCalculatorResult({ error: 'Please enter valid values' });
      return;
    }

    let refundPercentage = 100;
    let eligible = true;
    let reason = '';

    if (days > 30) {
      eligible = false;
      reason = 'Return window (30 days) has expired';
    } else if (days > 14 && refundCalculator.condition === 'opened') {
      refundPercentage = 70;
      reason = 'Opened items after 14 days receive 70% refund';
    } else if (refundCalculator.condition === 'damaged') {
      refundPercentage = 50;
      reason = 'Damaged items receive 50% refund (if not our fault)';
    } else if (refundCalculator.condition === 'opened') {
      refundPercentage = 85;
      reason = 'Opened items in good condition receive 85% refund';
    } else {
      reason = 'Full refund eligible for unopened items within 30 days';
    }

    const refundAmount = (amount * refundPercentage) / 100;
    const restockingFee = amount - refundAmount;

    setCalculatorResult({
      eligible,
      refundPercentage,
      refundAmount: refundAmount.toFixed(2),
      restockingFee: restockingFee.toFixed(2),
      reason,
      processingTime: eligible ? '5-10 business days' : 'N/A'
    });
  };

  const eligibilityChecklist = [
    { id: 1, text: 'Item purchased within the last 30 days', icon: Clock, required: true },
    { id: 2, text: 'Item is in original condition with tags/packaging', icon: Package, required: true },
    { id: 3, text: 'Proof of purchase (receipt or order confirmation)', icon: FileText, required: true },
    { id: 4, text: 'Item is not on the non-returnable list', icon: CheckCircle, required: true },
    { id: 5, text: 'Item was not purchased during final sale', icon: DollarSign, required: false }
  ];

  const refundTimeline = [
    { step: 1, title: 'Initiate Return', time: 'Day 0', description: 'Submit return request through your account or contact support', icon: FileText },
    { step: 2, title: 'Approval', time: '1-2 days', description: 'We review your request and send return instructions', icon: CheckCircle },
    { step: 3, title: 'Ship Item', time: '2-7 days', description: 'Package and ship item back to us with tracking', icon: Truck },
    { step: 4, title: 'Inspection', time: '1-3 days', description: 'We receive and inspect the returned item', icon: Package },
    { step: 5, title: 'Refund Processed', time: '3-5 days', description: 'Refund initiated to your original payment method', icon: CreditCard },
    { step: 6, title: 'Money Received', time: '2-7 days', description: 'Funds appear in your account (timing varies by bank/M-Pesa)', icon: DollarSign }
  ];

  const sections = [
    {
      id: 'overview',
      icon: RotateCcw,
      title: '1. Refund Policy Overview',
      category: 'general',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            At Oshocks Junior Bike Shop, we want you to be completely satisfied with your purchase. If you're not happy with your order for any reason, we offer a comprehensive refund and return policy to ensure your peace of mind.
          </p>
          
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-500 p-5 rounded-r-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-gray-900 mb-3">Our Promise to You</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-white/70 p-3 rounded-lg">
                    <p className="font-semibold text-gray-900 mb-1">✓ 30-Day Return Window</p>
                    <p className="text-sm text-gray-700">Full refund or exchange within 30 days</p>
                  </div>
                  <div className="bg-white/70 p-3 rounded-lg">
                    <p className="font-semibold text-gray-900 mb-1">✓ Quality Guarantee</p>
                    <p className="text-sm text-gray-700">Defective items replaced or refunded at no cost</p>
                  </div>
                  <div className="bg-white/70 p-3 rounded-lg">
                    <p className="font-semibold text-gray-900 mb-1">✓ Fair Process</p>
                    <p className="text-sm text-gray-700">Transparent and straightforward return procedure</p>
                  </div>
                  <div className="bg-white/70 p-3 rounded-lg">
                    <p className="font-semibold text-gray-900 mb-1">✓ Multiple Options</p>
                    <p className="text-sm text-gray-700">Choose between refund, exchange, or store credit</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-gray-700">
            This policy applies to all products purchased through Oshocks Junior Bike Shop, including items sold by third-party vendors on our marketplace. However, some product categories may have specific conditions outlined in the sections below.
          </p>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-semibold text-gray-900 mb-2">Multi-Vendor Marketplace Notice</h5>
            <p className="text-sm text-gray-700">
              For items sold by third-party vendors, return policies may vary slightly. Each product page clearly displays the seller's specific return terms. However, all sellers on our platform must meet our minimum standards for customer satisfaction.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'eligibility',
      icon: CheckCircle,
      title: '2. Return Eligibility Requirements',
      category: 'general',
      content: (
        <div className="space-y-6">
          <p className="text-gray-700">To be eligible for a return and refund, your item must meet the following criteria:</p>

          <div className="space-y-3">
            {eligibilityChecklist.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition-colors">
                  <div className="bg-blue-500 p-2 rounded-lg flex-shrink-0">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{item.text}</p>
                      {item.required && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">Required</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-gray-900 mb-3">Important Conditions</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>Items must be unused and in the same condition you received them</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>Original packaging, tags, and accessories must be included</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>Custom or personalized items may not be returnable</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>Bicycles must be unassembled and in original packaging</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>Electronics must have all original seals intact (unless defective)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              Condition-Based Refund Rates
            </h4>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full border-collapse bg-white">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
                    <th className="px-4 py-3 text-left font-semibold">Item Condition</th>
                    <th className="px-4 py-3 text-left font-semibold">Timeframe</th>
                    <th className="px-4 py-3 text-left font-semibold">Refund Amount</th>
                    <th className="px-4 py-3 text-left font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3">Unopened/Unused</td>
                    <td className="px-4 py-3">0-30 days</td>
                    <td className="px-4 py-3 font-semibold text-green-600">100% refund</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Full refund guaranteed</td>
                  </tr>
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3">Opened/Used (Good)</td>
                    <td className="px-4 py-3">0-14 days</td>
                    <td className="px-4 py-3 font-semibold text-green-600">85% refund</td>
                    <td className="px-4 py-3 text-sm text-gray-600">15% restocking fee</td>
                  </tr>
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3">Opened/Used (Good)</td>
                    <td className="px-4 py-3">15-30 days</td>
                    <td className="px-4 py-3 font-semibold text-yellow-600">70% refund</td>
                    <td className="px-4 py-3 text-sm text-gray-600">30% restocking fee</td>
                  </tr>
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3">Defective (Our fault)</td>
                    <td className="px-4 py-3">0-90 days</td>
                    <td className="px-4 py-3 font-semibold text-green-600">100% + shipping</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Extended warranty period</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3">Damaged (Customer fault)</td>
                    <td className="px-4 py-3">Any</td>
                    <td className="px-4 py-3 font-semibold text-red-600">Case-by-case (up to 50%)</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Subject to assessment</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'calculator',
      icon: Calculator,
      title: '3. Refund Calculator',
      category: 'tools',
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calculator className="w-6 h-6 text-blue-600" />
              Calculate Your Estimated Refund
            </h4>
            
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Order Amount (KES)
                </label>
                <input
                  type="number"
                  value={refundCalculator.orderAmount}
                  onChange={(e) => setRefundCalculator({...refundCalculator, orderAmount: e.target.value})}
                  placeholder="e.g., 15000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Days Since Purchase
                </label>
                <input
                  type="number"
                  value={refundCalculator.daysElapsed}
                  onChange={(e) => setRefundCalculator({...refundCalculator, daysElapsed: e.target.value})}
                  placeholder="e.g., 10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Item Condition
                </label>
                <select
                  value={refundCalculator.condition}
                  onChange={(e) => setRefundCalculator({...refundCalculator, condition: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="unopened">Unopened/Unused</option>
                  <option value="opened">Opened/Used (Good Condition)</option>
                  <option value="damaged">Damaged</option>
                  <option value="defective">Defective</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={calculateRefund}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 rounded-lg font-bold hover:from-blue-700 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
            >
              Calculate Refund Amount
            </button>
            
            {calculatorResult && (
              <div className="mt-6">
                {calculatorResult.error ? (
                  <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-r-lg">
                    <p className="text-red-700 font-semibold">{calculatorResult.error}</p>
                  </div>
                ) : (
                  <div className={`border-l-4 p-5 rounded-r-lg ${calculatorResult.eligible ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                    <div className="flex items-start gap-3 mb-4">
                      {calculatorResult.eligible ? (
                        <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <h5 className="font-bold text-gray-900 text-lg mb-2">
                          {calculatorResult.eligible ? 'Eligible for Return' : 'Not Eligible for Return'}
                        </h5>
                        <p className="text-gray-700 mb-4">{calculatorResult.reason}</p>
                        
                        {calculatorResult.eligible && (
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                              <p className="text-sm text-gray-600 mb-1">Refund Amount</p>
                              <p className="text-2xl font-bold text-green-600">KES {calculatorResult.refundAmount}</p>
                              <p className="text-xs text-gray-500 mt-1">{calculatorResult.refundPercentage}% of order value</p>
                            </div>
                            
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                              <p className="text-sm text-gray-600 mb-1">Restocking Fee</p>
                              <p className="text-2xl font-bold text-amber-600">KES {calculatorResult.restockingFee}</p>
                              <p className="text-xs text-gray-500 mt-1">{100 - calculatorResult.refundPercentage}% of order value</p>
                            </div>
                            
                            <div className="bg-white p-4 rounded-lg shadow-sm md:col-span-2">
                              <p className="text-sm text-gray-600 mb-1">Processing Time</p>
                              <p className="text-lg font-bold text-blue-600">{calculatorResult.processingTime}</p>
                              <p className="text-xs text-gray-500 mt-1">From approval to account credit</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> This calculator provides estimates only. Final refund amounts are determined after inspection of returned items. Shipping costs and payment processing fees may affect the final amount.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'non-returnable',
      icon: XCircle,
      title: '4. Non-Returnable Items',
      category: 'restrictions',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">For health, safety, and quality reasons, the following items cannot be returned or refunded:</p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-red-50 p-5 rounded-lg border-l-4 border-red-500 hover:shadow-md transition-shadow">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                Hygiene & Safety Items
              </h4>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Helmets (once removed from packaging)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Cycling gloves and clothing (if worn)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Bike seats and saddles (if installed)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Water bottles and hydration packs (if used)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Protective gear and pads (if worn)</span>
                </li>
              </ul>
            </div>

            <div className="bg-red-50 p-5 rounded-lg border-l-4 border-red-500 hover:shadow-md transition-shadow">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                Custom & Special Items
              </h4>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Custom-built bicycles</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Personalized/engraved items</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Made-to-order products</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Clearance/final sale items</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Gift cards and vouchers</span>
                </li>
              </ul>
            </div>

            <div className="bg-red-50 p-5 rounded-lg border-l-4 border-red-500 hover:shadow-md transition-shadow">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                Installation & Service
              </h4>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Professional assembly services</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Bike tune-up and maintenance services</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Installation fees</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Digital products and downloads</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Downloadable maintenance guides</span>
                </li>
              </ul>
            </div>

            <div className="bg-red-50 p-5 rounded-lg border-l-4 border-red-500 hover:shadow-md transition-shadow">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                Used & Modified Items
              </h4>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Items showing signs of wear or damage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Modified or altered products</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Items missing parts or accessories</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Products with removed serial numbers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Items with unauthorized repairs</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-500">
            <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Exception: Defective Items
            </h5>
            <p className="text-sm text-gray-700">
              Even if an item is listed as non-returnable, we will accept returns for defective products or items that arrive damaged during shipping at no cost to you. Your satisfaction and safety are our top priorities.
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h5 className="font-semibold text-gray-900 mb-2">Marketplace Seller Items</h5>
            <p className="text-sm text-gray-700">
              Third-party sellers may have additional non-returnable items. Always check the seller's specific return policy on the product page before purchasing.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'process',
      icon: Package,
      title: '5. Return Process & Timeline',
      category: 'process',
      content: (
        <div className="space-y-6">
          <p className="text-gray-700">Follow these steps to initiate and complete your return:</p>

          <div className="space-y-4">
            {refundTimeline.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="bg-gradient-to-br from-blue-600 to-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg">
                      {item.step}
                    </div>
                    {index < refundTimeline.length - 1 && (
                      <div className="w-1 h-full bg-gradient-to-b from-blue-300 to-green-300 my-2 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-blue-600 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Icon className="w-5 h-5 text-blue-600" />
                          <h4 className="font-bold text-gray-900">{item.title}</h4>
                        </div>
                        <span className="text-sm bg-gradient-to-r from-blue-100 to-green-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">{item.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-lg border-2 border-purple-200">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Truck className="w-6 h-6 text-purple-600" />
              How to Initiate a Return
            </h4>
            <div className="space-y-3">
              <div className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Through Your Account (Recommended)
                </p>
                <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
                  <li>Log in to your Oshocks Junior account</li>
                  <li>Go to "Order History" and select the order</li>
                  <li>Click "Return Item" and select reason</li>
                  <li>Upload photos if item is defective/damaged</li>
                  <li>Submit request and await approval email (usually within 24 hours)</li>
                </ol>
              </div>
              <div className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="bg-green-100 text-green-700 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Contact Support Directly
                </p>
                <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span>Email: returns@oshocksjunior.co.ke</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-green-600" />
                    <span>Phone: +254 712 345 678</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                    <span>Live Chat: 9 AM - 6 PM EAT</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-orange-600" />
                    <span>WhatsApp: +254 712 345 678</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 p-5 rounded-lg border-l-4 border-amber-500">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-600" />
              Packaging Instructions
            </h4>
            <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Use original packaging if possible</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Include all accessories, manuals, and parts</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Attach return authorization label (sent via email)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Use bubble wrap or padding for fragile items</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Get tracking number and keep receipt</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Remove any personal items from product</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-semibold text-gray-900 mb-2">Shipping Address for Returns</h5>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-700">
                <p className="font-semibold">Oshocks Junior Returns Department</p>
                <p>[Your Street Address]</p>
                <p>Nairobi, Kenya</p>
                <p className="mt-2 text-xs text-gray-600">Include your order number on the package exterior</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'refund-methods',
      icon: CreditCard,
      title: '6. Refund Methods & Processing',
      category: 'process',
      content: (
        <div className="space-y-6">
          <p className="text-gray-700">Once your return is approved and received, refunds are processed according to your original payment method:</p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 p-5 rounded-lg border-2 border-green-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-600 p-3 rounded-lg shadow-md">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">M-Pesa Refunds</h4>
                  <p className="text-sm text-gray-600">Mobile Money Returns</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-green-600 mt-0.5" />
                  <span><strong>Processing Time:</strong> 3-5 business days</span>
                </li>
                <li className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-green-600 mt-0.5" />
                  <span><strong>Method:</strong> Direct to M-Pesa number used</span>
                </li>
                <li className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-green-600 mt-0.5" />
                  <span><strong>Notification:</strong> SMS from Safaricom</span>
                </li>
                <li className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 text-green-600 mt-0.5" />
                  <span><strong>Transaction Fee:</strong> No fees deducted</span>
                </li>
              </ul>
              <div className="mt-4 bg-white p-3 rounded text-xs text-gray-600">
                <strong>Note:</strong> Ensure your M-Pesa number is active. If number has changed, contact support before return approval.
              </div>
            </div>

            <div className="bg-blue-50 p-5 rounded-lg border-2 border-blue-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-600 p-3 rounded-lg shadow-md">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Card Refunds</h4>
                  <p className="text-sm text-gray-600">Credit/Debit Cards</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
                  <span><strong>Processing Time:</strong> 5-10 business days</span>
                </li>
                <li className="flex items-start gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600 mt-0.5" />
                  <span><strong>Method:</strong> Original card used</span>
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-blue-600 mt-0.5" />
                  <span><strong>Notification:</strong> Email + bank statement</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                  <span><strong>Timeline:</strong> Depends on card issuer</span>
                </li>
              </ul>
              <div className="mt-4 bg-white p-3 rounded text-xs text-gray-600">
                <strong>Note:</strong> International cards may take up to 14 business days to reflect the refund.
              </div>
            </div>

            <div className="bg-purple-50 p-5 rounded-lg border-2 border-purple-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-600 p-3 rounded-lg shadow-md">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Store Credit</h4>
                  <p className="text-sm text-gray-600">Shop More, Save More</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-purple-600 mt-0.5" />
                  <span><strong>Processing:</strong> Instant upon approval</span>
                </li>
                <li className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 text-purple-600 mt-0.5" />
                  <span><strong>Bonus:</strong> +10% extra credit value</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-purple-600 mt-0.5" />
                  <span><strong>Expiration:</strong> 12 months from issue</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                  <span><strong>Usage:</strong> Any marketplace product</span>
                </li>
              </ul>
              <div className="mt-4 bg-white p-3 rounded text-xs text-purple-700 font-semibold">
                <strong>🎁 Benefit:</strong> Get 10% more value and shop immediately!
              </div>
            </div>

            <div className="bg-orange-50 p-5 rounded-lg border-2 border-orange-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-orange-600 p-3 rounded-lg shadow-md">
                  <RotateCcw className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Exchange</h4>
                  <p className="text-sm text-gray-600">Swap for Different Item</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-orange-600 mt-0.5" />
                  <span><strong>Processing:</strong> 2-3 business days</span>
                </li>
                <li className="flex items-start gap-2">
                  <RotateCcw className="w-4 h-4 text-orange-600 mt-0.5" />
                  <span><strong>Method:</strong> Direct product swap</span>
                </li>
                <li className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 text-orange-600 mt-0.5" />
                  <span><strong>Price Diff:</strong> Charged/refunded as needed</span>
                </li>
                <li className="flex items-start gap-2">
                  <Truck className="w-4 h-4 text-orange-600 mt-0.5" />
                  <span><strong>Shipping:</strong> Free for exchanges</span>
                </li>
              </ul>
              <div className="mt-4 bg-white p-3 rounded text-xs text-gray-600">
                <strong>Best For:</strong> Wrong size, color, or model preference.
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-5 rounded-lg border-2 border-blue-200">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              Refund Amount Breakdown
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center bg-white p-3 rounded shadow-sm">
                <span className="text-gray-700 font-medium">Product Cost</span>
                <span className="font-semibold text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Refunded
                </span>
              </div>
              <div className="flex justify-between items-center bg-white p-3 rounded shadow-sm">
                <span className="text-gray-700 font-medium">Original Shipping Fee</span>
                <span className="font-semibold text-red-600 flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> Non-refundable*
                </span>
              </div>
              <div className="flex justify-between items-center bg-white p-3 rounded shadow-sm">
                <span className="text-gray-700 font-medium">Return Shipping Fee</span>
                <span className="font-semibold text-amber-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> Customer pays**
                </span>
              </div>
              <div className="flex justify-between items-center bg-white p-3 rounded shadow-sm">
                <span className="text-gray-700 font-medium">Restocking Fee (if applicable)</span>
                <span className="font-semibold text-amber-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> 15-30% deducted
                </span>
              </div>
            </div>
            <div className="mt-4 bg-white/70 p-3 rounded text-xs text-gray-700">
              <p className="mb-1">*Shipping fees refunded if item is defective or we sent wrong item</p>
              <p>**Free return shipping for defective items or our errors</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'defective',
      icon: Shield,
      title: '7. Defective or Damaged Items',
      category: 'special',
      content: (
        <div className="space-y-6">
          <p className="text-gray-700">
            We take product quality seriously. If you receive a defective or damaged item, we'll make it right immediately.
          </p>

          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 p-5 rounded-r-lg">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Shield className="w-6 h-6 text-red-600" />
              Priority Handling for Defective Items
            </h4>
            <div className="grid md:grid-cols-2 gap-3 text-gray-700">
              <div className="flex items-start gap-2 bg-white/70 p-3 rounded">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Free return shipping</p>
                  <p className="text-sm text-gray-600">We cover all costs</p>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-white/70 p-3 rounded">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Fast-track processing</p>
                  <p className="text-sm text-gray-600">Priority inspection</p>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-white/70 p-3 rounded">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">100% refund</p>
                  <p className="text-sm text-gray-600">Product + shipping</p>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-white/70 p-3 rounded">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Extended window</p>
                  <p className="text-sm text-gray-600">Up to 90 days</p>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-white/70 p-3 rounded md:col-span-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Replacement option</p>
                  <p className="text-sm text-gray-600">Get new item sent immediately before we receive return</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">What to Do Upon Delivery</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-lg shadow-md border-t-4 border-blue-600 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-3">📦</div>
                <h5 className="font-bold text-gray-900 mb-2">1. Inspect Immediately</h5>
                <p className="text-sm text-gray-700">
                  Check package and contents before signing delivery. Document any visible damage with photos.
                </p>
              </div>
              <div className="bg-white p-5 rounded-lg shadow-md border-t-4 border-blue-600 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-3">📸</div>
                <h5 className="font-bold text-gray-900 mb-2">2. Take Photos</h5>
                <p className="text-sm text-gray-700">
                  Photograph any defects, damage, packaging issues, or missing items for your claim documentation.
                </p>
              </div>
              <div className="bg-white p-5 rounded-lg shadow-md border-t-4 border-blue-600 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-3">📞</div>
                <h5 className="font-bold text-gray-900 mb-2">3. Contact Us ASAP</h5>
                <p className="text-sm text-gray-700">
                  Report issues within 48 hours of delivery for fastest resolution and priority support.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Types of Defects Covered</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-purple-50 p-5 rounded-lg border-l-4 border-purple-500">
                <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-purple-600" />
                  Manufacturing Defects
                </h5>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">•</span>
                    <span>Broken or missing parts out of box</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">•</span>
                    <span>Frame cracks or structural issues</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">•</span>
                    <span>Gear/brake malfunctions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">•</span>
                    <span>Paint defects or finish problems</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">•</span>
                    <span>Electronic component failures</span>
                  </li>
                </ul>
              </div>
              <div className="bg-orange-50 p-5 rounded-lg border-l-4 border-orange-500">
                <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  Shipping Damage
                </h5>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold">•</span>
                    <span>Crushed or damaged packaging</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold">•</span>
                    <span>Bent frames or components</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold">•</span>
                    <span>Scratches from transit</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold">•</span>
                    <span>Missing accessories or parts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold">•</span>
                    <span>Water damage to package/product</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-5 rounded-lg border-2 border-green-200">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Truck className="w-5 h-5 text-green-600" />
              Expedited Resolution Process
            </h4>
            <p className="text-sm text-gray-700 mb-4">
              For defective items, we offer same-day approval and can ship replacement before receiving return:
            </p>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <div className="bg-green-600 text-white px-4 py-2 rounded-full font-semibold shadow-md">
                Contact Us
              </div>
              <ArrowRight className="w-5 h-5 text-green-600" />
              <div className="bg-green-600 text-white px-4 py-2 rounded-full font-semibold shadow-md">
                Approval (24hrs)
              </div>
              <ArrowRight className="w-5 h-5 text-green-600" />
              <div className="bg-green-600 text-white px-4 py-2 rounded-full font-semibold shadow-md">
                Replacement Shipped
              </div>
              <ArrowRight className="w-5 h-5 text-green-600" />
              <div className="bg-green-600 text-white px-4 py-2 rounded-full font-semibold shadow-md">
                Return Original
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-4">
              No need to wait! We trust our customers and want you back on the road as quickly as possible.
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-semibold text-gray-900 mb-2">Required Documentation</h5>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>✓ Photos of defect or damage (multiple angles)</li>
              <li>✓ Photos of packaging (showing damage if applicable)</li>
              <li>✓ Order number and purchase date</li>
              <li>✓ Description of the issue</li>
              <li>✓ Photos of product tags/serial numbers</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'special-cases',
      icon: AlertCircle,
      title: '8. Special Circumstances',
      category: 'special',
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Warranty Claims
            </h4>
            <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-500">
              <p className="text-gray-700 mb-3">
                Many bicycle products come with manufacturer warranties separate from our return policy. For warranty claims:
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span><strong>0-90 days:</strong> Contact us first - we handle the claim for you and provide full support</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                  <span><strong>91+ days:</strong> Contact manufacturer directly (we provide all necessary information)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5" />
                  <span><strong>Lifetime warranties:</strong> Handled through manufacturer with our ongoing support</span>
                </li>
              </ul>
              <p className="text-xs text-gray-600 mt-3 bg-white/70 p-3 rounded">
                Warranty periods vary by brand and product type. Check product page or manual for specific warranty terms and conditions.
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              Gift Returns
            </h4>
            <div className="bg-purple-50 p-5 rounded-lg border-l-4 border-purple-500">
              <p className="text-gray-700 mb-3">
                Received an item as a gift? We make returns easy:
              </p>
              <div className="space-y-3">
                <div className="bg-white/70 p-3 rounded">
                  <p className="font-semibold text-gray-900 mb-1">With Gift Receipt</p>
                  <p className="text-sm text-gray-700">Return for store credit or exchange within 30 days</p>
                </div>
                <div className="bg-white/70 p-3 rounded">
                  <p className="font-semibold text-gray-900 mb-1">Without Receipt</p>
                  <p className="text-sm text-gray-700">Contact gift giver for order details, or we can look up by recipient email</p>
                </div>
                <div className="bg-white/70 p-3 rounded">
                  <p className="font-semibold text-gray-900 mb-1">Refund Method</p>
                  <p className="text-sm text-gray-700">Store credit issued to recipient (not original purchaser)</p>
                </div>
                <div className="bg-white/70 p-3 rounded">
                  <p className="font-semibold text-gray-900 mb-1">Timeline</p>
                  <p className="text-sm text-gray-700">Same 30-day window applies from delivery date</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Missing Items or Incomplete Orders
            </h4>
            <div className="bg-red-50 p-5 rounded-lg border-l-4 border-red-500">
              <p className="text-gray-700 mb-3">
                If your order arrived with missing items or accessories:
              </p>
              <ol className="space-y-2 text-sm text-gray-700 list-decimal pl-5">
                <li>Contact us within 48 hours of delivery</li>
                <li>Provide order number and list of missing items</li>
                <li>We'll ship missing items immediately at no cost</li>
                <li>Or receive partial refund for missing components</li>
              </ol>
              <div className="mt-3 bg-amber-100 p-3 rounded flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 font-semibold">
                  Claims must be made within 48 hours of delivery confirmation to qualify for immediate replacement
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Bulk or Wholesale Returns
            </h4>
            <div className="bg-green-50 p-5 rounded-lg border-l-4 border-green-500">
              <p className="text-gray-700 mb-3">
                For business customers or bulk purchases (5+ items):
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Contact our B2B team at <a href="mailto:wholesale@oshocksjunior.co.ke" className="text-blue-600 hover:underline font-semibold">wholesale@oshocksjunior.co.ke</a></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Custom return arrangements available</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Potentially extended return windows for business accounts</span>
                </li>
                <li className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Negotiable restocking fees based on order size</span>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-600" />
              International Returns
            </h4>
            <div className="bg-orange-50 p-5 rounded-lg border-l-4 border-orange-500">
              <p className="text-gray-700 mb-3">
                Currently, we primarily serve Kenya. For international orders:
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-orange-600 mt-0.5" />
                  <span>Contact support before shipping return</span>
                </li>
                <li className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 text-orange-600 mt-0.5" />
                  <span>Customer pays return international shipping</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                  <span>Customs fees and import duties are non-refundable</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-orange-600 mt-0.5" />
                  <span>Extended processing time (10-15 business days)</span>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600" />
              Dispute Resolution
            </h4>
            <div className="bg-gray-50 p-5 rounded-lg border-l-4 border-gray-400">
              <p className="text-gray-700 mb-3">
                If you're not satisfied with a return decision:
              </p>
              <ol className="space-y-2 text-sm text-gray-700 list-decimal pl-5">
                <li>Contact our Returns Manager at <a href="mailto:returns.manager@oshocksjunior.co.ke" className="text-blue-600 hover:underline font-semibold">returns.manager@oshocksjunior.co.ke</a></li>
                <li>Escalate to Customer Service Director if needed</li>
                <li>Final arbitration available through Kenyan Consumer Protection Authority</li>
              </ol>
              <p className="text-xs text-gray-600 mt-3 bg-white p-3 rounded">
                We aim to resolve all disputes fairly and quickly, typically within 5 business days of escalation.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'contact',
      icon: MessageSquare,
      title: '9. Contact & Support',
      category: 'support',
      content: (
        <div className="space-y-6">
          <p className="text-gray-700">
            Our customer support team is here to help with all return and refund inquiries. Choose your preferred contact method:
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 p-5 rounded-lg border-2 border-green-200 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-600 p-3 rounded-lg">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Phone Support</h4>
                  <p className="text-sm text-gray-600">Speak with a specialist</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700">
                  <strong>Hours:</strong> Mon-Sat: 9 AM - 6 PM EAT
                </p>
                <a href="tel:+254712345678" className="text-green-600 hover:underline font-semibold text-lg block">
                  +254 712 345 678
                </a>
                <p className="text-xs text-gray-600">Average wait time: 2-3 minutes</p>
              </div>
            </div>

            <div className="bg-purple-50 p-5 rounded-lg border-2 border-purple-200 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-600 p-3 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Live Chat</h4>
                  <p className="text-sm text-gray-600">Instant support online</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700">
                  <strong>Hours:</strong> Daily: 9 AM - 6 PM EAT
                </p>
                <button className="text-purple-600 hover:underline font-semibold text-lg">
                  Start Chat Now →
                </button>
                <p className="text-xs text-gray-600">Typically responds within 1 minute</p>
              </div>
            </div>

            <div className="bg-blue-50 p-5 rounded-lg border-2 border-blue-200 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-600 p-3 rounded-lg">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Email Support</h4>
                  <p className="text-sm text-gray-600">Detailed inquiries</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700">
                  <strong>Response:</strong> Within 24 hours
                </p>
                <a href="mailto:returns@oshocksjunior.co.ke" className="text-blue-600 hover:underline font-semibold block">
                  returns@oshocksjunior.co.ke
                </a>
                <p className="text-xs text-gray-600">Include order number for faster service</p>
              </div>
            </div>

            <div className="bg-orange-50 p-5 rounded-lg border-2 border-orange-200 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-orange-600 p-3 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">WhatsApp</h4>
                  <p className="text-sm text-gray-600">Quick and convenient</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700">
                  <strong>Hours:</strong> Mon-Sat: 9 AM - 6 PM EAT
                </p>
                <a href="https://wa.me/254712345678" className="text-orange-600 hover:underline font-semibold text-lg block">
                  +254 712 345 678
                </a>
                <p className="text-xs text-gray-600">Fast responses during business hours</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-lg border-2 border-blue-200">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-blue-600" />
              Visit Our Returns Center
            </h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-semibold text-gray-900 mb-3">Physical Location</h5>
                <div className="space-y-2 text-sm text-gray-700">
                  <p className="font-semibold text-blue-600">Oshocks Junior Bike Shop</p>
                  <p>[Your Street Address]</p>
                  <p>Nairobi, Kenya</p>
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <p className="font-semibold mb-1">Returns Desk Hours:</p>
                    <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p>Saturday: 9:00 AM - 4:00 PM</p>
                    <p className="text-red-600 font-semibold">Sunday: Closed</p>
                  </div>
                </div>
              </div>
              <div>
                <h5 className="font-semibold text-gray-900 mb-3">What to Bring</h5>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Item to be returned (with packaging)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Order confirmation or receipt</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Valid ID (National ID or Passport)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Payment method used (for verification)</span>
                  </li>
                </ul>
                <div className="mt-4 bg-green-100 p-3 rounded">
                  <p className="text-xs text-green-800 font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Get instant refund approval when you drop off in person!
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 p-5 rounded-lg border-l-4 border-amber-500">
            <h4 className="font-bold text-gray-900 mb-3">Before Contacting Support</h4>
            <p className="text-sm text-gray-700 mb-3">Please have the following information ready for faster service:</p>
            <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-600" />
                <span>Order number (e.g., #OSJ-12345)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-600" />
                <span>Email address used for purchase</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-600" />
                <span>Reason for return</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-600" />
                <span>Photos (if damaged or defective)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-600" />
                <span>Preferred refund method</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-600" />
                <span>Product name and SKU</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'faq',
      icon: BookOpen,
      title: '10. Frequently Asked Questions',
      category: 'support',
      content: (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-blue-600">
            <h5 className="font-bold text-gray-900 mb-2">How long do I have to return an item?</h5>
            <p className="text-sm text-gray-700">
              You have 30 days from the delivery date to initiate a return for most items. Defective items have an extended 90-day window.
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-green-600">
            <h5 className="font-bold text-gray-900 mb-2">Do I have to pay for return shipping?</h5>
            <p className="text-sm text-gray-700">
              For defective items or our errors, we cover return shipping. For other returns, customers pay return shipping unless exchanging for a different item.
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-purple-600">
            <h5 className="font-bold text-gray-900 mb-2">Can I return an item I've used?</h5>
            <p className="text-sm text-gray-700">
              Yes, but restocking fees apply. Items used within 14 days receive 85% refund; 15-30 days receive 70% refund. Item must be in good condition.
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-orange-600">
            <h5 className="font-bold text-gray-900 mb-2">How do I get a refund to my M-Pesa account?</h5>
            <p className="text-sm text-gray-700">
              If you paid via M-Pesa, refunds are automatically sent to the same number within 3-5 business days of approval. You'll receive an SMS confirmation.
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-red-600">
            <h5 className="font-bold text-gray-900 mb-2">What if I lost my receipt?</h5>
            <p className="text-sm text-gray-700">
              No problem! We can look up your order using your email address or phone number. You can also access order history in your account.
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-yellow-600">
            <h5 className="font-bold text-gray-900 mb-2">Can I exchange for a different product?</h5>
            <p className="text-sm text-gray-700">
              Yes! Exchanges are free. If there's a price difference, you'll either pay the difference or receive a refund/store credit.
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-pink-600">
            <h5 className="font-bold text-gray-900 mb-2">What about items from third-party sellers?</h5>
            <p className="text-sm text-gray-700">
              Returns for marketplace sellers follow the same process. We facilitate all returns to ensure consistent service, though some sellers may have specific conditions.
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-indigo-600">
            <h5 className="font-bold text-gray-900 mb-2">Do you offer store credit?</h5>
            <p className="text-sm text-gray-700">
              Yes! Choose store credit and get 10% bonus value. Credit is valid for 12 months and can be used on any item in our marketplace.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'policy-changes',
      icon: Clock,
      title: '11. Policy Updates',
      category: 'legal',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            We may update this Refund Policy from time to time to reflect changes in our business practices, legal requirements, or customer feedback.
          </p>
          
          <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-500">
            <h4 className="font-semibold text-gray-900 mb-3">How We Notify You</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-blue-600 mt-0.5" />
                <span>Email notification to all registered customers</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                <span>Prominent banner on website for 30 days</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
                <span>Updated "Last Modified" date at top of policy</span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-blue-600 mt-0.5" />
                <span>Summary of changes in notification email</span>
              </li>
            </ul>
          </div>

          <div className="bg-green-50 p-5 rounded-lg border-l-4 border-green-500">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Your Protection</h4>
                <p className="text-sm text-gray-700">
                  Policy changes only apply to purchases made after the update date. Your order is governed by the policy in effect at the time of purchase.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-5 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Version History</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-start gap-3 bg-white p-3 rounded">
                <span className="font-bold text-blue-600">v3.0</span>
                <div>
                  <p className="font-semibold">October 11, 2025</p>
                  <p className="text-xs">Added refund calculator and marketplace seller returns</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white p-3 rounded">
                <span className="font-bold text-gray-600">v2.0</span>
                <div>
                  <p className="font-semibold">August 1, 2025</p>
                  <p className="text-xs">Expanded M-Pesa refund options</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white p-3 rounded">
                <span className="font-bold text-gray-600">v1.0</span>
                <div>
                  <p className="font-semibold">January 15, 2025</p>
                  <p className="text-xs">Initial policy release</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  // Filter sections based on search
  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (typeof section.content === 'string' && section.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filter by category
  const displaySections = activeTab === 'all' 
    ? filteredSections 
    : filteredSections.filter(s => s.category === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-gradient-to-br from-blue-600 to-green-600 p-3 rounded-lg shadow-lg">
              <RotateCcw className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Refund & Returns Policy</h1>
              <p className="text-gray-600">Oshocks Junior Bike Shop - Your Satisfaction Guaranteed</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Last Updated: {lastUpdated}</span>
            </div>
            <div className="flex items-center gap-2 text-green-600 font-semibold">
              <CheckCircle className="w-4 h-4" />
              <span>30-Day Return Window</span>
            </div>
            <div className="flex-1"></div>
            <button className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors">
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow border-t-4 border-blue-600">
            <div className="text-4xl font-bold text-blue-600 mb-1">30</div>
            <div className="text-sm text-gray-600">Days Return Window</div>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow border-t-4 border-green-600">
            <div className="text-4xl font-bold text-green-600 mb-1">100%</div>
            <div className="text-sm text-gray-600">Refund Guarantee*</div>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow border-t-4 border-purple-600">
            <div className="text-4xl font-bold text-purple-600 mb-1">5-10</div>
            <div className="text-sm text-gray-600">Business Days</div>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow border-t-4 border-orange-600">
            <div className="text-4xl font-bold text-orange-600 mb-1">FREE</div>
            <div className="text-sm text-gray-600">Exchange Shipping</div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search policy sections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {[
                { id: 'all', label: 'All', count: sections.length },
                { id: 'general', label: 'General', count: sections.filter(s => s.category === 'general').length },
                { id: 'process', label: 'Process', count: sections.filter(s => s.category === 'process').length },
                { id: 'special', label: 'Special Cases', count: sections.filter(s => s.category === 'special').length },
                { id: 'tools', label: 'Tools', count: sections.filter(s => s.category === 'tools').length },
                { id: 'support', label: 'Support', count: sections.filter(s => s.category === 'support').length },
                { id: 'restrictions', label: 'Restrictions', count: sections.filter(s => s.category === 'restrictions').length },
                { id: 'legal', label: 'Legal', count: sections.filter(s => s.category === 'legal').length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            Table of Contents
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {displaySections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline transition-colors p-2 rounded hover:bg-blue-50"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <section.icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{section.title}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        {displaySections.length > 0 ? (
          <div className="space-y-6">
            {displaySections.map((section) => {
              const Icon = section.icon;
              const isExpanded = expandedSections[section.id] !== false;
              
              return (
                <div
                  key={section.id}
                  id={section.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg"
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-blue-100 to-green-100 p-3 rounded-lg">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 text-left">
                        {section.title}
                      </h2>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-6 h-6 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                  
                  {isExpanded && (
                    <div className="px-6 pb-6 text-gray-700 leading-relaxed">
                      {section.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Results Found</h3>
            <p className="text-gray-600 mb-4">
              We couldn't find any sections matching "{searchQuery}"
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveTab('all');
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-br from-blue-600 to-green-600 p-8 rounded-lg shadow-xl text-white">
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Need to Start a Return?</h3>
            <p className="mb-6 text-blue-100 max-w-2xl mx-auto">
              Our team is ready to help you with a fast and easy return process. Get your refund processed within 5-10 business days.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors shadow-md flex items-center justify-center gap-2">
                <RotateCcw className="w-5 h-5" />
                Start Return Request
              </button>
              <button className="bg-blue-700 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-800 transition-colors shadow-md border-2 border-white flex items-center justify-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Contact Support
              </button>
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-bold text-gray-900">Shipping Policy</h4>
            </div>
            <p className="text-sm text-gray-700 mb-4">
              Learn about our delivery times, shipping costs, and tracking options.
            </p>
            <a href="/shipping-policy" className="text-blue-600 hover:underline font-semibold text-sm flex items-center gap-1">
              Read More <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-bold text-gray-900">Warranty Information</h4>
            </div>
            <p className="text-sm text-gray-700 mb-4">
              Understand product warranties and how to make warranty claims.
            </p>
            <a href="/refund-policy" className="text-green-600 hover:underline font-semibold text-sm flex items-center gap-1">
              Read More <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-bold text-gray-900">Help Center</h4>
            </div>
            <p className="text-sm text-gray-700 mb-4">
              Browse FAQs, guides, and tutorials for common questions.
            </p>
            <a href="/help" className="text-purple-600 hover:underline font-semibold text-sm flex items-center gap-1">
              Visit Help Center <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </a>
        </div>

        {/* Footer Note */}
        <div className="mt-8 bg-gray-100 p-6 rounded-lg text-center">
          <p className="text-sm text-gray-600">
            Have questions about our refund policy? Our customer support team is available Mon-Sat, 9 AM - 6 PM EAT.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            This policy is effective as of {lastUpdated} and supersedes all previous versions.
          </p>
        </div>
      </div>

      {/* Floating Help Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="bg-gradient-to-br from-blue-600 to-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 group">
          <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        </button>
        <div className="absolute bottom-full right-0 mb-2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Chat with us!
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-24 right-6 z-40 bg-white text-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 border-2 border-gray-200"
        aria-label="Scroll to top"
      >
        <ChevronUp className="w-5 h-5" />
      </button>
    </div>
  );
}