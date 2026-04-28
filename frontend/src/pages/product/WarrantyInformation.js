import { useState } from 'react';
import { Shield, CheckCircle, XCircle, Clock, FileText, AlertCircle, Phone, Mail, MapPin, Download, Search, ChevronDown, ChevronUp, Bike, Wrench, Settings, Package } from 'lucide-react';

const WarrantyInformation = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [warrantyLookup, setWarrantyLookup] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  const warrantyCategories = [
    {
      name: 'Complete Bicycles',
      period: '2 Years',
      icon: <Bike className="w-10 h-10 text-orange-600" />,
      coverage: ['Frame defects', 'Fork failures', 'Manufacturing defects'],
      exclusions: ['Normal wear', 'Crash damage', 'Improper maintenance']
    },
    {
      name: 'Bicycle Frames',
      period: '5 Years',
      icon: <Wrench className="w-10 h-10 text-orange-600" />,
      coverage: ['Frame cracks', 'Weld failures', 'Material defects'],
      exclusions: ['Paint chips', 'Cosmetic damage', 'Modifications']
    },
    {
      name: 'Components & Parts',
      period: '1 Year',
      icon: <Settings className="w-10 h-10 text-orange-600" />,
      coverage: ['Gear systems', 'Brakes', 'Wheels', 'Pedals'],
      exclusions: ['Brake pads', 'Tires', 'Chains', 'Cables']
    },
    {
      name: 'Accessories',
      period: '6 Months',
      icon: <Package className="w-10 h-10 text-orange-600" />,
      coverage: ['Lights', 'Locks', 'Pumps', 'Bottles'],
      exclusions: ['Batteries', 'Cosmetic wear', 'Lost items']
    }
  ];

  const warrantyProcess = [
    {
      step: 1,
      title: 'Report Issue',
      description: 'Contact our support team via phone, email, or visit our shop',
      icon: Phone
    },
    {
      step: 2,
      title: 'Documentation',
      description: 'Provide purchase receipt, product photos, and defect description',
      icon: FileText
    },
    {
      step: 3,
      title: 'Assessment',
      description: 'Our technicians will evaluate the warranty claim within 48 hours',
      icon: Search
    },
    {
      step: 4,
      title: 'Resolution',
      description: 'Approved claims are repaired, replaced, or refunded as applicable',
      icon: CheckCircle
    }
  ];

  const faqs = [
    {
      question: 'What does the warranty cover?',
      answer: 'Our warranty covers manufacturing defects, material failures, and workmanship issues. This includes frame cracks, component malfunctions, and defective parts that occur under normal use conditions.'
    },
    {
      question: 'How do I register my warranty?',
      answer: 'Warranty registration is automatic with purchase. Keep your receipt or order confirmation email as proof of purchase. You can also register online through your account dashboard for extended tracking.'
    },
    {
      question: 'What is NOT covered by warranty?',
      answer: 'Warranties do not cover normal wear and tear, damage from crashes or accidents, improper assembly or maintenance, modifications, commercial use, consumable items (brake pads, tires, chains), or products without proof of purchase.'
    },
    {
      question: 'Can I transfer my warranty to another person?',
      answer: 'Warranties are non-transferable and valid only for the original purchaser. If you sell your bicycle, the warranty does not transfer to the new owner.'
    },
    {
      question: 'How long does a warranty claim take?',
      answer: 'Initial assessment takes 48 hours. Simple repairs are completed within 5-7 business days. Replacements requiring parts ordering may take 2-3 weeks depending on availability.'
    },
    {
      question: 'Do I need to pay for warranty service?',
      answer: 'Approved warranty claims are processed at no cost. However, shipping costs for returns, service charges for non-warranty issues, and costs for unauthorized modifications are not covered.'
    },
    {
      question: 'What if my product is discontinued?',
      answer: 'If your exact model is discontinued, we will replace it with a comparable current model of equal or greater value, or offer a full refund at our discretion.'
    },
    {
      question: 'Does the warranty cover international purchases?',
      answer: 'Currently, our warranty is valid only for purchases made within Kenya. International warranty support may be available through authorized dealers in other countries.'
    }
  ];

  const handleWarrantyLookup = (e) => {
    e.preventDefault();
    if (warrantyLookup.trim()) {
      // Simulate warranty lookup
      setSearchResults({
        found: true,
        orderNumber: warrantyLookup,
        product: 'Mountain Bike Pro X3000',
        purchaseDate: '2024-03-15',
        warrantyEnd: '2026-03-15',
        status: 'Active',
        remainingDays: 487
      });
    }
  };

  const toggleFAQ = (index) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              background: 'radial-gradient(circle at 30% 50%, rgb(255, 69, 0) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgb(255, 165, 0) 0%, transparent 40%)',
            }}
          />
          <div className="absolute inset-0 bg-[url(https://images.unsplash.com/photo-1485965120184-e224f7a1d7f0?w=1920&q=80)] bg-cover bg-center opacity-20 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <Shield className="w-20 h-20 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Warranty Information</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              We stand behind every product we sell. Your satisfaction and peace of mind are our priority.
            </p>
          </div>
        </div>
      </div>

      {/* Warranty Lookup Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Search className="w-6 h-6" />
            Check Your Warranty Status
          </h2>
          <form onSubmit={handleWarrantyLookup} className="flex gap-4">
            <input
              type="text"
              value={warrantyLookup}
              onChange={(e) => setWarrantyLookup(e.target.value)}
              placeholder="Enter Order Number or Serial Number"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold"
            >
              Check Status
            </button>
          </form>

          {searchResults && (
            <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{searchResults.product}</h3>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Order Number:</strong> {searchResults.orderNumber}</p>
                    <p><strong>Purchase Date:</strong> {searchResults.purchaseDate}</p>
                    <p><strong>Warranty Valid Until:</strong> {searchResults.warrantyEnd}</p>
                    <p className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-orange-600" />
                      <strong>Status:</strong> <span className="text-orange-600">{searchResults.status}</span>
                    </p>
                    <p><strong>Remaining Coverage:</strong> {searchResults.remainingDays} days</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Certificate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-white rounded-lg shadow-md p-2 flex flex-wrap gap-2">
          {['overview', 'coverage', 'process', 'faq', 'contact'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === tab
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Warranty Overview</h2>
              <div className="prose max-w-none text-gray-700 space-y-4">
                <p className="text-lg">
                  At Oshocks Junior Bike Shop, we are committed to providing high-quality cycling products backed by comprehensive warranty protection. Our warranty program demonstrates our confidence in the products we sell and our dedication to customer satisfaction.
                </p>
                <p>
                  Every product purchased from our marketplace comes with manufacturer warranty coverage, and select items include extended protection from Oshocks. We carefully vet all vendors on our platform to ensure they honor warranty commitments and maintain quality standards.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-orange-50 rounded-lg">
                  <Clock className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 mb-2">Fast Response</h3>
                  <p className="text-gray-600">48-hour claim assessment guaranteed</p>
                </div>
                <div className="text-center p-6 bg-orange-50 rounded-lg">
                  <Shield className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 mb-2">Full Coverage</h3>
                  <p className="text-gray-600">Comprehensive protection against defects</p>
                </div>
                <div className="text-center p-6 bg-orange-50 rounded-lg">
                  <CheckCircle className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 mb-2">Easy Process</h3>
                  <p className="text-gray-600">Simple claim submission and tracking</p>
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Important Warranty Requirements</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Keep your original purchase receipt or order confirmation</li>
                    <li>• Register your product within 30 days for extended benefits</li>
                    <li>• Follow manufacturer maintenance guidelines</li>
                    <li>• Report defects immediately to avoid voiding coverage</li>
                    <li>• Do not attempt unauthorized repairs or modifications</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Coverage Tab */}
        {activeTab === 'coverage' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Warranty Coverage by Category</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {warrantyCategories.map((category, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">{category.icon}</div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                          <p className="text-orange-600 font-semibold">{category.period} Warranty</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          Covered
                        </h4>
                        <ul className="space-y-1 ml-7">
                          {category.coverage.map((item, i) => (
                            <li key={i} className="text-gray-700">• {item}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <XCircle className="w-5 h-5 text-red-600" />
                          Not Covered
                        </h4>
                        <ul className="space-y-1 ml-7">
                          {category.exclusions.map((item, i) => (
                            <li key={i} className="text-gray-700">• {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Extended Warranty Info */}
            <div className="bg-gray-900 text-white rounded-lg shadow-md p-8 relative overflow-hidden">
              <div className="absolute inset-0">
                <div 
                  className="absolute inset-0 opacity-40"
                  style={{
                    background: 'radial-gradient(circle at 30% 50%, rgb(255, 69, 0) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgb(255, 165, 0) 0%, transparent 40%)',
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
              </div>
              <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-4">Extended Warranty Available</h2>
              <p className="text-orange-100 mb-6">
                Protect your investment with our extended warranty plans. Get up to 5 additional years of coverage with enhanced benefits including accidental damage protection, free annual servicing, and priority support.
              </p>
              <button className="px-6 py-3 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition font-semibold">
                Learn More About Extended Protection
              </button>
              </div>
            </div>
          </div>
        )}

        {/* Process Tab */}
        {activeTab === 'process' && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Warranty Claim Process</h2>
            
            <div className="space-y-8">
              {warrantyProcess.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                        {step.step}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Icon className="w-8 h-8 text-orange-600" />
                        <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                      </div>
                      <p className="text-gray-700 text-lg">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 p-6 bg-orange-50 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-4">Required Documentation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Proof of Purchase</p>
                    <p className="text-gray-600 text-sm">Original receipt or order confirmation</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Product Photos</p>
                    <p className="text-gray-600 text-sm">Clear images showing the defect</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Serial Number</p>
                    <p className="text-gray-600 text-sm">Product identification number</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Issue Description</p>
                    <p className="text-gray-600 text-sm">Detailed explanation of the problem</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                  >
                    <span className="font-semibold text-gray-900 text-left">{faq.question}</span>
                    {expandedFAQ === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    )}
                  </button>
                  {expandedFAQ === index && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <p className="text-gray-700">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Warranty Support Contact</h2>
              <p className="text-gray-700 mb-8">
                Our warranty support team is here to help. Reach out through any of the following channels for assistance with your warranty claim or questions.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 border border-gray-200 rounded-lg hover:shadow-lg transition">
                  <Phone className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 mb-2">Phone Support</h3>
                  <p className="text-gray-600 mb-4">Mon-Sat: 8AM - 6PM</p>
                  <a href="tel:+254715061213" className="text-orange-600 hover:underline font-semibold">
                    +254 715 061 213
                  </a>
                </div>

                <div className="text-center p-6 border border-gray-200 rounded-lg hover:shadow-lg transition">
                  <Mail className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 mb-2">Email Support</h3>
                  <p className="text-gray-600 mb-4">24/7 Response</p>
                  <a href="mailto:oshocksstores@gmail.com" className="text-orange-600 hover:underline font-semibold">
                    oshocksstores@gmail.com
                  </a>
                </div>

                <div className="text-center p-6 border border-gray-200 rounded-lg hover:shadow-lg transition">
                  <MapPin className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 mb-2">Visit Our Shop</h3>
                  <p className="text-gray-600 mb-4">Walk-in Service</p>
                  <p className="text-orange-600 font-semibold">Nairobi, Kenya</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Submit Warranty Inquiry</h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Full Name *</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Zablon Bennett"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Email Address *</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="bennett@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="+254 700 000 000"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Order Number *</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="ACTBTHM7TX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Issue Description *</label>
                  <textarea
                    rows="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Please describe the issue you're experiencing with your product..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Upload Photos (Optional)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-500 transition cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full px-8 py-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold text-lg"
                >
                  Submit Warranty Inquiry
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Missing Upload icon - adding it here
const Upload = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

export default WarrantyInformation;