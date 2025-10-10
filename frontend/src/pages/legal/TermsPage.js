<tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-900">International</td>
                    <td className="px-4 py-3 text-gray-700">10-21 business days</td>
                    <td className="px-4 py-3 text-red-600 font-semibold">Contact Us</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              * Free shipping on orders over KES 10,000 within Nairobi. Delivery times are estimates and may vary.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-5 rounded-lg border-2 border-blue-200">
              <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                Delivery Process
              </h5>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <div className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                  <span>Order confirmation and processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
                  <span>Dispatch notification with tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
                  <span>In-transit updates via SMS/Email</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</div>
                  <span>Delivery to your address</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">5</div>
                  <span>Confirmation of receipt</span>
                </li>
              </ul>
            </div>

            <div className="bg-green-50 p-5 rounded-lg border-2 border-green-200">
              <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Package className="w-5 h-5 text-green-600" />
                Delivery Options
              </h5>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded">
                  <p className="font-semibold text-gray-900 text-sm mb-1">Standard Delivery</p>
                  <p className="text-xs text-gray-700">Regular timeframes, most cost-effective</p>
                </div>
                <div className="bg-white p-3 rounded">
                  <p className="font-semibold text-gray-900 text-sm mb-1">Express Delivery</p>
                  <p className="text-xs text-gray-700">Next-day in Nairobi (+KES 500)</p>
                </div>
                <div className="bg-white p-3 rounded">
                  <p className="font-semibold text-gray-900 text-sm mb-1">Pick-up</p>
                  <p className="text-xs text-gray-700">Free collection from our store</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-lg">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Delivery Terms & Conditions
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Someone must be present to receive and sign for the delivery</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Inspect package before signing for any visible damage</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Failed delivery attempts may incur redelivery charges</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>Provide accurate address and phone number for delivery</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>We're not liable for delays beyond our control (weather, strikes, etc.)</span>
              </li>
            </ul>
          </div>

          <div className="bg-purple-50 p-5 rounded-lg border-2 border-purple-200">
            <h4 className="font-semibold text-gray-900 mb-3">Tracking Your Order</h4>
            <p className="text-sm text-gray-700 mb-3">
              Once your order ships, you'll receive a tracking number via email and SMS. Track your order in real-time through:
            </p>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-gray-700">Your account dashboard</span>
              </div>
              <div className="bg-white p-3 rounded flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-gray-700">Email tracking links</span>
              </div>
              <div className="bg-white p-3 rounded flex items-center gap-2">
                <Phone className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-gray-700">SMS updates</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'sellers',
      icon: Users,
      title: '7. Marketplace Seller Terms',
      category: 'sellers',
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 p-5 rounded-r-lg">
            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-600" />
              Seller Responsibilities
            </h4>
            <p className="text-sm text-gray-700">
              Third-party sellers on our marketplace must adhere to high standards of service and quality. This section applies to all registered sellers.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Product Listings</h4>
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
                <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Sellers Must:
                </h5>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Provide accurate product descriptions and specifications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Use genuine, high-quality product images</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Set fair and competitive pricing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Maintain accurate inventory levels</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Honor listed prices and availability</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Comply with all applicable laws and regulations</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
                <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  Prohibited Listings:
                </h5>
                <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-700">
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Counterfeit or fake products</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Stolen goods</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Recalled or unsafe products</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Items violating intellectual property</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Misleading or deceptive listings</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Non-cycling related products</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Commission & Fees</h4>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-5 rounded-lg border-2 border-blue-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-blue-300">
                      <th className="text-left py-3 px-2 font-semibold text-gray-900">Product Category</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-900">Commission Rate</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-900">Payment Terms</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-2 text-sm text-gray-700">Complete Bicycles</td>
                      <td className="py-3 px-2 text-sm font-semibold text-blue-600">10%</td>
                      <td className="py-3 px-2 text-sm text-gray-700">Weekly payout</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-2 text-sm text-gray-700">Accessories & Parts</td>
                      <td className="py-3 px-2 text-sm font-semibold text-blue-600">15%</td>
                      <td className="py-3 px-2 text-sm text-gray-700">Weekly payout</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-2 text-sm text-gray-700">Cycling Apparel</td>
                      <td className="py-3 px-2 text-sm font-semibold text-blue-600">12%</td>
                      <td className="py-3 px-2 text-sm text-gray-700">Weekly payout</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-2 text-sm text-gray-700">Services</td>
                      <td className="py-3 px-2 text-sm font-semibold text-blue-600">8%</td>
                      <td className="py-3 px-2 text-sm text-gray-700">Upon completion</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-600 mt-3">
                * Transaction fees and payment processing fees may apply. Commission is calculated on the final sale price excluding shipping.
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Order Fulfillment</h4>
            <div className="bg-orange-50 p-5 rounded-lg border-2 border-orange-200">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <p className="font-semibold text-gray-900">Process orders within 24 hours</p>
                    <p className="text-sm text-gray-700">Confirm order and prepare for shipment</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <p className="font-semibold text-gray-900">Ship within stated timeframes</p>
                    <p className="text-sm text-gray-700">Meet promised delivery dates</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <p className="font-semibold text-gray-900">Provide tracking information</p>
                    <p className="text-sm text-gray-700">Update system with courier details</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">4</div>
                  <div>
                    <p className="font-semibold text-gray-900">Handle returns professionally</p>
                    <p className="text-sm text-gray-700">Follow marketplace return policy</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-lg">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-600" />
              Seller Violations & Penalties
            </h4>
            <p className="text-sm text-gray-700 mb-3">Sellers who violate our terms may face:</p>
            <div className="space-y-2">
              <div className="bg-white p-3 rounded flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Warning</p>
                  <p className="text-xs text-gray-700">First offense, minor violations</p>
                </div>
              </div>
              <div className="bg-white p-3 rounded flex items-start gap-2">
                <XCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Listing Removal</p>
                  <p className="text-xs text-gray-700">Violation of listing policies</p>
                </div>
              </div>
              <div className="bg-white p-3 rounded flex items-start gap-2">
                <Ban className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Account Suspension</p>
                  <p className="text-xs text-gray-700">Repeated violations or serious breaches</p>
                </div>
              </div>
              <div className="bg-white p-3 rounded flex items-start gap-2">
                <Ban className="w-5 h-5 text-red-800 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Permanent Ban</p>
                  <p className="text-xs text-gray-700">Fraudulent activity or severe misconduct</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'intellectual',
      icon: Shield,
      title: '8. Intellectual Property Rights',
      category: 'legal',
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Our Intellectual Property</h4>
            <div className="bg-blue-50 p-5 rounded-lg border-2 border-blue-200">
              <p className="text-gray-700 mb-3">
                All content on the Oshocks Junior Platform, including but not limited to:
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded flex items-start gap-2">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Logos, trademarks, and brand names</span>
                </div>
                <div className="bg-white p-3 rounded flex items-start gap-2">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Website design and layout</span>
                </div>
                <div className="bg-white p-3 rounded flex items-start gap-2">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Software and source code</span>
                </div>
                <div className="bg-white p-3 rounded flex items-start gap-2">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Text, graphics, and images</span>
                </div>
                <div className="bg-white p-3 rounded flex items-start gap-2">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Product descriptions and content</span>
                </div>
                <div className="bg-white p-3 rounded flex items-start gap-2">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Database and data compilations</span>
                </div>
              </div>
              <p className="text-sm text-gray-700 mt-3">
                is owned by or licensed to Oshocks Junior Bike Shop and protected by Kenyan and international intellectual property laws.
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">License to Use</h4>
            <div className="bg-green-50 p-5 rounded-lg border-l-4 border-green-500">
              <p className="text-gray-700 mb-3">We grant you a limited, non-exclusive, non-transferable license to:</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Access and use the Platform for personal, non-commercial purposes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>View and download content for personal reference</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Print pages for personal use only</span>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Restrictions</h4>
            <div className="bg-red-50 p-5 rounded-lg border-l-4 border-red-500">
              <p className="text-gray-700 mb-3 font-semibold">You may NOT:</p>
              <div className="space-y-2">
                <div className="bg-white p-3 rounded flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Reproduce, distribute, or display Platform content commercially</span>
                </div>
                <div className="bg-white p-3 rounded flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Modify, adapt, or create derivative works</span>
                </div>
                <div className="bg-white p-3 rounded flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Remove copyright or proprietary notices</span>
                </div>
                <div className="bg-white p-3 rounded flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Use content on other websites or platforms</span>
                </div>
                <div className="bg-white p-3 rounded flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Reverse engineer or decompile our software</span>
                </div>
                <div className="bg-white p-3 rounded flex items-start gap-2">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Use our trademarks without written permission</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">User Content Ownership</h4>
            <div className="bg-purple-50 p-5 rounded-lg border-2 border-purple-200">
              <p className="text-sm text-gray-700 mb-3">
                You retain ownership of content you submit (reviews, photos, etc.), but grant us a worldwide, royalty-free license to:
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-purple-600" />
                  <span>Display your content on our Platform</span>
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-purple-600" />
                  <span>Use in marketing and promotional materials</span>
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-purple-600" />
                  <span>Modify for technical or formatting purposes</span>
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-purple-600" />
                  <span>Sublicense to third parties as needed</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-lg">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Copyright Infringement
            </h4>
            <p className="text-sm text-gray-700 mb-3">
              If you believe content on our Platform infringes your copyright, contact us at:
            </p>
            <div className="bg-white p-3 rounded">
              <p className="text-sm text-gray-700">
                <strong>Email:</strong> <a href="mailto:legal@oshocksjunior.co.ke" className="text-blue-600 hover:underline">legal@oshocksjunior.co.ke</a>
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Include: description of copyrighted work, location of infringing content, your contact information, and statement of good faith belief.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'liability',
      icon: Scale,
      title: '9. Limitation of Liability',
      category: 'legal',
      content: (
        <div className="space-y-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-lg">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              Important Legal Notice
            </h4>
            <p className="text-sm text-gray-700 mb-3">
              TO THE MAXIMUM EXTENTimport { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, Shield, AlertTriangle, Users, ShoppingCart, CreditCard, Truck, Scale, Globe, Lock, UserCheck, Ban, CheckCircle, XCircle, Info, Search, BookOpen, Gavel, Building, Mail, Phone, MessageSquare, Download, Printer, Share2, Clock, Package, MapPin, DollarSign, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function TermsPage() {
  const [expandedSections, setExpandedSections] = useState({ acceptance: true });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showTOC, setShowTOC] = useState(true);
  
  const lastUpdated = "October 11, 2025";
  const effectiveDate = "January 15, 2025";

  const toggleSection = (id) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const expandAll = () => {
    const allExpanded = {};
    sections.forEach(section => {
      allExpanded[section.id] = true;
    });
    setExpandedSections(allExpanded);
  };

  const collapseAll = () => {
    setExpandedSections({});
  };

  const filters = [
    { id: 'all', label: 'All Terms', icon: FileText, count: 0 },
    { id: 'buyers', label: 'For Buyers', icon: ShoppingCart, count: 0 },
    { id: 'sellers', label: 'For Sellers', icon: Users, count: 0 },
    { id: 'legal', label: 'Legal', icon: Gavel, count: 0 }
  ];

  const sections = [
    {
      id: 'acceptance',
      icon: FileText,
      title: '1. Acceptance of Terms',
      category: 'legal',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Welcome to Oshocks Junior Bike Shop ("we," "us," "our," or "Company"). These Terms and Conditions ("Terms," "Terms of Service," or "Agreement") constitute a legally binding agreement between you ("User," "you," or "your") and Oshocks Junior Bike Shop.
          </p>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 p-5 rounded-r-lg">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Info className="w-6 h-6 text-blue-600" />
              By Using Our Platform, You Agree To:
            </h4>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-white/70 p-3 rounded flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">These Terms and Conditions in their entirety</span>
              </div>
              <div className="bg-white/70 p-3 rounded flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Our Privacy Policy and Cookie Policy</span>
              </div>
              <div className="bg-white/70 p-3 rounded flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Our Refund and Returns Policy</span>
              </div>
              <div className="bg-white/70 p-3 rounded flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">All applicable laws and regulations in Kenya</span>
              </div>
              <div className="bg-white/70 p-3 rounded md:col-span-2 flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Any additional terms for specific services or products</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 p-5 rounded-r-lg">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              Important Notice
            </h4>
            <p className="text-gray-700 mb-2">
              <strong>IF YOU DO NOT AGREE WITH THESE TERMS, YOU MUST IMMEDIATELY DISCONTINUE USE OF OUR PLATFORM.</strong>
            </p>
            <p className="text-sm text-gray-600">
              Your continued access or use of our services constitutes acceptance of any modifications to these Terms.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Who Can Use Our Services</h4>
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Age Requirement</p>
                    <p className="text-sm text-gray-700">You must be at least 18 years old or have parental/guardian consent</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                    <Scale className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Legal Capacity</p>
                    <p className="text-sm text-gray-700">You must have the legal capacity to enter into binding contracts</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
                    <Globe className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Location</p>
                    <p className="text-sm text-gray-700">You must be located in a jurisdiction where our services are available</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-orange-100 p-2 rounded-lg flex-shrink-0">
                    <Lock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Account Responsibility</p>
                    <p className="text-sm text-gray-700">You are responsible for maintaining account confidentiality</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-red-100 p-2 rounded-lg flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Accurate Information</p>
                    <p className="text-sm text-gray-700">You must provide truthful and complete information</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
            <p className="text-sm text-gray-700">
              <strong>Language:</strong> These Terms are provided in English. In case of translation discrepancies, the English version shall prevail.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'definitions',
      icon: BookOpen,
      title: '2. Definitions & Interpretations',
      category: 'legal',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">For the purposes of these Terms, the following definitions apply:</p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
              <h5 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                "Platform"
              </h5>
              <p className="text-sm text-gray-700">
                The Oshocks Junior Bike Shop website, mobile applications, and all related services, features, and content.
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-green-500 hover:shadow-lg transition-shadow">
              <h5 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-green-600" />
                "Marketplace"
              </h5>
              <p className="text-sm text-gray-700">
                The multi-vendor e-commerce platform where third-party sellers can list and sell cycling products.
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
              <h5 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                "Seller"
              </h5>
              <p className="text-sm text-gray-700">
                Any individual or business entity that lists products for sale on our Marketplace, including Oshocks Junior itself.
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
              <h5 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-orange-600" />
                "Buyer"
              </h5>
              <p className="text-sm text-gray-700">
                Any user who purchases products through our Platform, whether from Oshocks Junior or third-party sellers.
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-pink-500 hover:shadow-lg transition-shadow">
              <h5 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-pink-600" />
                "User Content"
              </h5>
              <p className="text-sm text-gray-700">
                Any content, information, data, text, photos, reviews, or materials uploaded or posted by users.
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-indigo-500 hover:shadow-lg transition-shadow">
              <h5 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                "Intellectual Property"
              </h5>
              <p className="text-sm text-gray-700">
                All trademarks, logos, designs, content, software, and proprietary information owned by Oshocks Junior.
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-teal-500 hover:shadow-lg transition-shadow">
              <h5 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Building className="w-5 h-5 text-teal-600" />
                "Services"
              </h5>
              <p className="text-sm text-gray-700">
                All services provided through the Platform including but not limited to product sales, marketplace facilitation, and customer support.
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-red-500 hover:shadow-lg transition-shadow">
              <h5 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-red-600" />
                "Transaction"
              </h5>
              <p className="text-sm text-gray-700">
                Any purchase, sale, exchange, or return of products through the Platform.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 p-5 rounded-lg border-2 border-blue-200">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Interpretation Rules
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Headings are for convenience only and do not affect interpretation</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Singular includes plural and vice versa where context requires</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>"Including" means "including without limitation"</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>References to "days" mean calendar days unless specified as business days</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>All monetary amounts are in Kenyan Shillings (KES) unless stated otherwise</span>
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'account',
      icon: UserCheck,
      title: '3. Account Registration & Management',
      category: 'buyers',
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Creating an Account</h4>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-5 rounded-lg border-2 border-blue-200">
              <p className="text-gray-700 mb-4">To access certain features, you must create an account by providing:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Required Information:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span>Full legal name</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span>Valid email address</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span>Phone number (for M-Pesa verification)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span>Secure password</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span>Delivery address</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-600" />
                    Optional Information:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span>Date of birth</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span>Profile photo</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span>Billing address (if different)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span>Payment preferences</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Account Responsibilities</h4>
            <div className="space-y-3">
              <div className="bg-green-50 p-5 rounded-lg border-l-4 border-green-500">
                <h5 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  You Must:
                </h5>
                <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Provide accurate, current, and complete information</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Maintain and update your information as needed</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Keep your password secure and confidential</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Notify us immediately of any unauthorized access</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Take responsibility for all activities under your account</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Use your own identity (no impersonation)</span>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 p-5 rounded-lg border-l-4 border-red-500">
                <h5 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <XCircle className="w-6 h-6 text-red-600" />
                  You Must NOT:
                </h5>
                <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-700">
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Share your account credentials with others</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Create multiple accounts to abuse promotions</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Use another person's account without permission</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Circumvent security measures</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Use automated tools to create accounts</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Provide false or misleading information</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Account Suspension & Termination</h4>
            <div className="bg-amber-50 p-5 rounded-lg border-2 border-amber-300">
              <p className="text-gray-700 mb-3 font-semibold">
                We reserve the right to suspend or terminate your account immediately without prior notice if:
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded flex items-start gap-2">
                  <Ban className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">You violate these Terms and Conditions</span>
                </div>
                <div className="bg-white p-3 rounded flex items-start gap-2">
                  <Ban className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">You engage in fraudulent or illegal activities</span>
                </div>
                <div className="bg-white p-3 rounded flex items-start gap-2">
                  <Ban className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">You abuse refund or return policies</span>
                </div>
                <div className="bg-white p-3 rounded flex items-start gap-2">
                  <Ban className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">You harass other users or our staff</span>
                </div>
                <div className="bg-white p-3 rounded flex items-start gap-2">
                  <Ban className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Your account is inactive for 24+ months</span>
                </div>
                <div className="bg-white p-3 rounded flex items-start gap-2">
                  <Ban className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">You fail to pay for confirmed orders repeatedly</span>
                </div>
              </div>
              <div className="mt-4 bg-red-100 p-3 rounded">
                <p className="text-xs text-red-800 font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Upon termination, you forfeit access to your account, pending orders may be cancelled, and outstanding balances become immediately due.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Seller Accounts</h4>
            <div className="bg-purple-50 p-5 rounded-lg border-2 border-purple-200">
              <p className="text-gray-700 mb-4">
                To become a seller on our Marketplace, you must additionally:
              </p>
              <div className="space-y-2">
                <div className="bg-white p-3 rounded flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Complete seller verification process</p>
                    <p className="text-xs text-gray-600">Identity and business verification required</p>
                  </div>
                </div>
                <div className="bg-white p-3 rounded flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Provide business registration documents (if applicable)</p>
                    <p className="text-xs text-gray-600">Certificate of incorporation or business permit</p>
                  </div>
                </div>
                <div className="bg-white p-3 rounded flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Submit tax identification information</p>
                    <p className="text-xs text-gray-600">KRA PIN and tax compliance certificate</p>
                  </div>
                </div>
                <div className="bg-white p-3 rounded flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Verify bank account or M-Pesa details</p>
                    <p className="text-xs text-gray-600">For payment disbursement</p>
                  </div>
                </div>
                <div className="bg-white p-3 rounded flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Agree to Seller Terms and Commission Structure</p>
                    <p className="text-xs text-gray-600">Marketplace fees and seller obligations</p>
                  </div>
                </div>
                <div className="bg-white p-3 rounded flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Pass background and compliance checks</p>
                    <p className="text-xs text-gray-600">Quality and reliability verification</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 bg-purple-100 p-3 rounded">
                <p className="text-xs text-purple-800">
                  <strong>Note:</strong> Seller approval typically takes 3-5 business days. Additional terms apply to seller accounts.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'purchasing',
      icon: ShoppingCart,
      title: '4. Purchasing & Orders',
      category: 'buyers',
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Order Process</h4>
            <div className="space-y-3">
              {[
                { num: 1, title: 'Product Selection', desc: 'Browse products, add items to cart, and review specifications carefully.', icon: ShoppingCart, color: 'blue' },
                { num: 2, title: 'Checkout', desc: 'Provide shipping information and select payment method (M-Pesa, Card).', icon: CreditCard, color: 'green' },
                { num: 3, title: 'Order Confirmation', desc: 'Review order summary and confirm. You receive an order confirmation email.', icon: CheckCircle, color: 'purple' },
                { num: 4, title: 'Payment Processing', desc: 'Complete payment via M-Pesa STK push or card payment gateway.', icon: DollarSign, color: 'orange' },
                { num: 5, title: 'Order Processing', desc: 'Seller receives order notification and begins preparing shipment.', icon: Package, color: 'pink' }
              ].map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.num} className="flex items-start gap-4 bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                    <div className={`bg-gradient-to-br from-${step.color}-600 to-${step.color}-700 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 shadow-md`}>
                      {step.num}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-5 h-5 text-${step.color}-600`} />
                        <h5 className="font-semibold text-gray-900">{step.title}</h5>
                      </div>
                      <p className="text-sm text-gray-700">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 p-5 rounded-r-lg">
            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Info className="w-6 h-6 text-blue-600" />
              Important: When Does a Contract Form?
            </h4>
            <p className="text-sm text-gray-700 mb-3">
              A binding contract is formed when:
            </p>
            <div className="grid md:grid-cols-3 gap-2 mb-3">
              <div className="bg-white/70 p-3 rounded flex items-center gap-2">
                <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <span className="text-sm text-gray-700">You place an order</span>
              </div>
              <div className="bg-white/70 p-3 rounded flex items-center gap-2">
                <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <span className="text-sm text-gray-700">Payment is processed</span>
              </div>
              <div className="bg-white/70 p-3 rounded flex items-center gap-2">
                <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <span className="text-sm text-gray-700">You receive confirmation</span>
              </div>
            </div>
            <p className="text-xs text-blue-800">
              Product availability shown on the website does not guarantee stock. We reserve the right to cancel orders if items become unavailable.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Pricing & Availability</h4>
            <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
              <div className="space-y-3">
                <div className="flex items-start gap-3 pb-3 border-b border-gray-200">
                  <DollarSign className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Price Accuracy</p>
                    <p className="text-sm text-gray-700">We strive for accurate pricing but errors may occur. We reserve the right to correct pricing errors and cancel affected orders.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 pb-3 border-b border-gray-200">
                  <Globe className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Currency</p>
                    <p className="text-sm text-gray-700">All prices are in Kenyan Shillings (KES) unless otherwise stated.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 pb-3 border-b border-gray-200">
                  <Scale className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Taxes</p>
                    <p className="text-sm text-gray-700">Prices include applicable VAT where required by law.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 pb-3 border-b border-gray-200">
                  <Clock className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Price Changes</p>
                    <p className="text-sm text-gray-700">Prices may change without notice. The price at checkout applies to your order.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 pb-3 border-b border-gray-200">
                  <Package className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Stock Availability</p>
                    <p className="text-sm text-gray-700">Products are subject to availability. Out-of-stock items will be refunded or substituted with consent.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Pre-orders</p>
                    <p className="text-sm text-gray-700">For pre-order items, estimated delivery dates are approximate and subject to change.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Order Cancellation</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-5 rounded-lg border-2 border-green-200">
                <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  You Can Cancel:
                </h5>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Before order is marked "Processing"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Within 1 hour of order placement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>If seller hasn't confirmed order yet</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Through your account dashboard</span>
                  </li>
                </ul>
                <div className="mt-3 bg-green-100 p-3 rounded">
                  <p className="text-xs text-green-800 font-semibold">✓ Full refund within 3-5 business days</p>
                </div>
              </div>
              <div className="bg-red-50 p-5 rounded-lg border-2 border-red-200">
                <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  We May Cancel:
                </h5>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Pricing or product description errors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Payment issues or fraud detection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Product unavailability</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Delivery address concerns</span>
                  </li>
                </ul>
                <div className="mt-3 bg-red-100 p-3 rounded">
                  <p className="text-xs text-red-800 font-semibold">⚠ You'll be notified immediately with refund</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 p-5 rounded-lg border-l-4 border-amber-500">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Building className="w-5 h-5 text-amber-600" />
              Bulk Orders
            </h4>
            <p className="text-sm text-gray-700 mb-3">
              Orders of 10+ units of the same item or orders exceeding KES 100,000 may require additional verification and approval.
            </p>
            <p className="text-sm text-gray-700">
              Contact our wholesale team at <a href="mailto:wholesale@oshocksjunior.co.ke" className="text-blue-600 hover:underline font-semibold">wholesale@oshocksjunior.co.ke</a> for special pricing and terms.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'payment',
      icon: CreditCard,
      title: '5. Payment Terms',
      category: 'buyers',
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Accepted Payment Methods</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg border-2 border-green-300 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-600 p-3 rounded-lg shadow-md">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <h5 className="font-bold text-gray-900 text-lg">M-Pesa</h5>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>STK Push for instant payment</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Paybill option available</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>No additional fees</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Instant confirmation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Refunds in 3-5 business days</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border-2 border-blue-300 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-600 p-3 rounded-lg shadow-md">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <h5 className="font-bold text-gray-900 text-lg">Credit/Debit Cards</h5>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span>Visa, Mastercard accepted</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span>Processed via Stripe/Flutterwave</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span>3D Secure authentication</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span>Save cards for future purchases</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span>Refunds in 5-10 business days</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 p-5 rounded-r-lg">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              Payment Security
            </h4>
            <p className="text-sm text-gray-700 mb-4">
              All payment transactions are encrypted using SSL/TLS technology and processed through PCI DSS compliant payment gateways. 
              We do not store complete credit card information on our servers.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 bg-white/70 px-4 py-2 rounded-full">
                <Lock className="w-4 h-4 text-green-600" />
                <span className="text-xs font-semibold text-gray-700">256-bit SSL</span>
              </div>
              <div className="flex items-center gap-2 bg-white/70 px-4 py-2 rounded-full">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-gray-700">PCI DSS Compliant</span>
              </div>
              <div className="flex items-center gap-2 bg-white/70 px-4 py-2 rounded-full">
                <CheckCircle className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-semibold text-gray-700">3D Secure</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Payment Terms & Conditions</h4>
            <div className="space-y-3">
              <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-green-500">
                <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Authorization & Processing
                </h5>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Payment must be authorized before order processing begins</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>You authorize us to charge the payment method provided</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Payment authorization may be verified before shipment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Insufficient funds may result in order cancellation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>You're responsible for all charges including taxes and shipping</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-red-500">
                <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  Failed Payments
                </h5>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Orders with failed payments are automatically cancelled after 24 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>You'll receive notification to update payment method</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Multiple failed payment attempts may flag your account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Contact support if you experience persistent payment issues</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-blue-500">
                <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-blue-600" />
                  Billing Disputes
                </h5>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Contact us within 30 days of charge for disputes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Provide order number and detailed explanation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>We'll investigate and respond within 10 business days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Chargebacks may result in account suspension pending review</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-5 rounded-lg border-2 border-purple-200">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              Promotional Codes & Discounts
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>Promo codes must be entered at checkout before payment</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>One promotional code per order unless stated otherwise</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>Codes cannot be combined with other offers unless specified</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>Expired or invalid codes will not be honored</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>We reserve the right to cancel orders using fraudulent codes</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>Promotional discounts are non-transferable and have no cash value</span>
              </li>
            </ul>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-lg">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
              Payment Fraud Prevention
            </h4>
            <p className="text-sm text-gray-700 mb-3">
              We employ advanced fraud detection systems to protect both buyers and sellers. Suspicious transactions may be flagged for verification.
            </p>
            <div className="bg-white p-3 rounded">
              <p className="text-sm text-gray-700">
                You may be asked to provide additional identification or documentation before order fulfillment. 
                Confirmed fraudulent activity will result in immediate account termination and legal action.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'shipping',
      icon: Truck,
      title: '6. Shipping & Delivery',
      category: 'buyers',
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Shipping Areas & Timeframes</h4>
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full border-collapse bg-white">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
                    <th className="px-4 py-3 text-left font-semibold">Location</th>
                    <th className="px-4 py-3 text-left font-semibold">Delivery Time</th>
                    <th className="px-4 py-3 text-left font-semibold">Shipping Cost</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-900">Nairobi CBD</td>
                    <td className="px-4 py-3 text-gray-700">1-2 business days</td>
                    <td className="px-4 py-3 text-green-600 font-semibold">KES 200</td>
                  </tr>
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-900">Nairobi Suburbs</td>
                    <td className="px-4 py-3 text-gray-700">2-3 business days</td>
                    <td className="px-4 py-3 text-green-600 font-semibold">KES 300</td>
                  </tr>
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-900">Major Cities</td>
                    <td className="px-4 py-3 text-gray-700">3-5 business days</td>
                    <td className="px-4 py-3 text-blue-600 font-semibold">KES 500</td>
                  </tr>
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-900">Rural Areas</td>
                    <td className="px-4 py-3 text-gray-700">5-7 business days</td>
                    <td className="px-4 py-3 text-orange-600 font-semibold">KES 800</td>
                  </tr>