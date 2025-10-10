import { useState } from 'react';
import { Shield, ChevronDown, ChevronUp, Lock, Eye, Users, CreditCard, Mail, Phone, MapPin, Clock } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const [expandedSections, setExpandedSections] = useState({});
  const lastUpdated = "October 11, 2025";

  const toggleSection = (id) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const sections = [
    {
      id: 'introduction',
      icon: Shield,
      title: '1. Introduction',
      content: (
        <div className="space-y-4">
          <p>
            Welcome to Oshocks Junior Bike Shop ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
          </p>
          <p>
            Oshocks Junior Bike Shop operates as a multi-vendor e-commerce marketplace for cycling products in Kenya. By accessing or using our platform, you agree to the collection and use of information in accordance with this Privacy Policy.
          </p>
          <p className="font-semibold text-gray-900">
            If you do not agree with the terms of this Privacy Policy, please discontinue use of our services immediately.
          </p>
        </div>
      )
    },
    {
      id: 'information-collection',
      icon: Eye,
      title: '2. Information We Collect',
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">2.1 Personal Information You Provide</h4>
            <p className="mb-2">We collect information that you voluntarily provide when you:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Register an Account:</strong> Name, email address, phone number, password, and delivery address</li>
              <li><strong>Make a Purchase:</strong> Billing address, shipping address, payment information (M-Pesa phone number, credit/debit card details)</li>
              <li><strong>Become a Seller:</strong> Business name, business registration documents, tax identification number, bank account details, ID verification documents</li>
              <li><strong>Contact Us:</strong> Name, email, phone number, and message content</li>
              <li><strong>Leave Reviews:</strong> Review text, ratings, and optional photos</li>
              <li><strong>Use Live Chat:</strong> Chat transcripts and contact information</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">2.2 Information Automatically Collected</h4>
            <p className="mb-2">When you access our platform, we automatically collect:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
              <li><strong>Usage Data:</strong> Pages viewed, time spent on pages, links clicked, search queries</li>
              <li><strong>Location Data:</strong> Approximate location based on IP address for delivery estimates</li>
              <li><strong>Cookies and Tracking:</strong> Session IDs, preferences, shopping cart contents</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">2.3 Payment Information</h4>
            <p className="mb-2">For M-Pesa transactions processed through Safaricom Daraja API:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>M-Pesa phone number</li>
              <li>Transaction confirmation codes</li>
              <li>Transaction amount and timestamp</li>
            </ul>
            <p className="mt-3">
              For card payments through Stripe/Flutterwave, we do not store full credit card numbers. Payment processors handle and encrypt this data according to PCI DSS standards.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">2.4 Information from Third Parties</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>Social media platforms (if you choose to link accounts)</li>
              <li>Payment processors (transaction confirmations and fraud prevention)</li>
              <li>Delivery partners (shipping and tracking updates)</li>
              <li>Marketing partners (analytics and campaign performance)</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'information-use',
      icon: Users,
      title: '3. How We Use Your Information',
      content: (
        <div className="space-y-6">
          <p>We use the collected information for the following purposes:</p>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">3.1 Order Processing and Fulfillment</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>Process and complete your purchases</li>
              <li>Send order confirmations and shipping notifications</li>
              <li>Handle returns, exchanges, and refunds</li>
              <li>Coordinate delivery with logistics partners</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">3.2 Account Management</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>Create and maintain your user account</li>
              <li>Authenticate your identity and prevent fraud</li>
              <li>Manage your preferences and settings</li>
              <li>Provide customer support and respond to inquiries</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">3.3 Seller Operations</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>Verify seller identities and business credentials</li>
              <li>Process seller payments and commissions</li>
              <li>Monitor seller performance and compliance</li>
              <li>Facilitate communication between buyers and sellers</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">3.4 Platform Improvement</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>Analyze usage patterns to improve user experience</li>
              <li>Develop new features and services</li>
              <li>Conduct market research and trend analysis</li>
              <li>Optimize search functionality and product recommendations</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">3.5 Marketing and Communications</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>Send promotional offers and product updates (with your consent)</li>
              <li>Personalize your shopping experience</li>
              <li>Display targeted advertisements</li>
              <li>Conduct surveys and request feedback</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">3.6 Legal and Security</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>Comply with legal obligations and regulations</li>
              <li>Detect and prevent fraud, abuse, and security threats</li>
              <li>Enforce our Terms and Conditions</li>
              <li>Resolve disputes and troubleshoot problems</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'information-sharing',
      icon: Users,
      title: '4. How We Share Your Information',
      content: (
        <div className="space-y-6">
          <p className="font-semibold text-gray-900">
            We do not sell your personal information. We may share your information with the following parties:
          </p>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">4.1 Vendors and Sellers</h4>
            <p>
              When you purchase from third-party sellers on our marketplace, we share necessary information (name, shipping address, phone number, order details) to fulfill your order.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">4.2 Service Providers</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Payment Processors:</strong> Safaricom (M-Pesa), Stripe, Flutterwave for transaction processing</li>
              <li><strong>Hosting Services:</strong> Vercel, Railway, PlanetScale for platform infrastructure</li>
              <li><strong>Cloud Storage:</strong> Cloudinary for image hosting and management</li>
              <li><strong>Email Services:</strong> SendGrid/Resend for transactional emails</li>
              <li><strong>Customer Support:</strong> Tawk.to for live chat functionality</li>
              <li><strong>Analytics:</strong> Google Analytics, Algolia for usage insights</li>
              <li><strong>Delivery Partners:</strong> Shipping and logistics companies for order fulfillment</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">4.3 Legal Requirements</h4>
            <p>We may disclose your information when required by law or in response to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Court orders or legal processes</li>
              <li>Government agency requests</li>
              <li>Protection of our rights, property, or safety</li>
              <li>Investigation of fraud or security issues</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">4.4 Business Transfers</h4>
            <p>
              In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new entity. We will notify you of any such change via email or prominent notice on our platform.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">4.5 With Your Consent</h4>
            <p>
              We may share your information for any other purpose with your explicit consent at the time of collection.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'data-security',
      icon: Lock,
      title: '5. Data Security',
      content: (
        <div className="space-y-4">
          <p>
            We implement robust security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction:
          </p>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Technical Safeguards:</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Encryption:</strong> SSL/TLS encryption for data transmission</li>
              <li><strong>Secure Storage:</strong> Encrypted databases and secure cloud infrastructure</li>
              <li><strong>Access Controls:</strong> Role-based access with multi-factor authentication</li>
              <li><strong>Payment Security:</strong> PCI DSS compliant payment processing</li>
              <li><strong>Regular Audits:</strong> Security assessments and vulnerability scanning</li>
              <li><strong>Monitoring:</strong> 24/7 system monitoring for suspicious activities</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Organizational Safeguards:</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>Limited employee access to personal information</li>
              <li>Confidentiality agreements with staff and contractors</li>
              <li>Regular security training and awareness programs</li>
              <li>Incident response procedures and data breach protocols</li>
            </ul>
          </div>

          <p className="text-amber-700 font-semibold">
            However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee absolute security.
          </p>
        </div>
      )
    },
    {
      id: 'cookies',
      icon: CreditCard,
      title: '6. Cookies and Tracking Technologies',
      content: (
        <div className="space-y-6">
          <p>
            We use cookies and similar tracking technologies to enhance your experience on our platform.
          </p>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">6.1 Types of Cookies We Use</h4>
            <div className="space-y-3">
              <div>
                <p className="font-semibold">Essential Cookies (Required)</p>
                <p className="text-gray-700">Enable core functionality like user authentication, shopping cart, and secure checkout.</p>
              </div>
              <div>
                <p className="font-semibold">Performance Cookies</p>
                <p className="text-gray-700">Collect anonymous usage data to help us understand how visitors interact with our platform.</p>
              </div>
              <div>
                <p className="font-semibold">Functional Cookies</p>
                <p className="text-gray-700">Remember your preferences and settings for a personalized experience.</p>
              </div>
              <div>
                <p className="font-semibold">Marketing Cookies</p>
                <p className="text-gray-700">Track your activity across websites to deliver relevant advertisements.</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">6.2 Managing Cookies</h4>
            <p>
              You can control cookies through your browser settings. Disabling essential cookies may affect platform functionality. Most browsers allow you to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>View and delete existing cookies</li>
              <li>Block third-party cookies</li>
              <li>Block all cookies from specific websites</li>
              <li>Receive notifications when cookies are set</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">6.3 Third-Party Analytics</h4>
            <p>
              We use Google Analytics, Algolia, and other analytics services that use cookies to track user behavior. These services have their own privacy policies governing data collection.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'user-rights',
      icon: Shield,
      title: '7. Your Privacy Rights',
      content: (
        <div className="space-y-6">
          <p>
            Under Kenyan Data Protection Act, 2019 and international privacy standards, you have the following rights:
          </p>

          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-900">Right to Access</h4>
              <p className="text-gray-700">Request a copy of the personal information we hold about you.</p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-900">Right to Rectification</h4>
              <p className="text-gray-700">Request correction of inaccurate or incomplete information.</p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-900">Right to Erasure</h4>
              <p className="text-gray-700">Request deletion of your personal information (subject to legal obligations).</p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-900">Right to Restriction</h4>
              <p className="text-gray-700">Request limitation on how we process your information.</p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-900">Right to Data Portability</h4>
              <p className="text-gray-700">Receive your data in a structured, machine-readable format.</p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-900">Right to Object</h4>
              <p className="text-gray-700">Object to processing of your information for marketing purposes.</p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-900">Right to Withdraw Consent</h4>
              <p className="text-gray-700">Withdraw consent for data processing at any time.</p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-900">Right to Lodge a Complaint</h4>
              <p className="text-gray-700">File a complaint with the Office of the Data Protection Commissioner (ODPC) in Kenya.</p>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg mt-6">
            <h4 className="font-semibold text-gray-900 mb-2">How to Exercise Your Rights</h4>
            <p>
              To exercise any of these rights, please contact us at <a href="mailto:privacy@oshocksjunior.co.ke" className="text-blue-600 hover:underline">privacy@oshocksjunior.co.ke</a> or through your account settings. We will respond within 30 days of receiving your request.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'retention',
      icon: Clock,
      title: '8. Data Retention',
      content: (
        <div className="space-y-4">
          <p>
            We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.
          </p>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Retention Periods:</h4>
            <ul className="space-y-2">
              <li><strong>Account Information:</strong> Retained while your account is active plus 3 years after closure</li>
              <li><strong>Transaction Records:</strong> 7 years for tax and legal compliance</li>
              <li><strong>Marketing Data:</strong> Until you withdraw consent or 2 years of inactivity</li>
              <li><strong>Support Tickets:</strong> 3 years after resolution</li>
              <li><strong>Cookies:</strong> As specified in cookie settings (typically 1-24 months)</li>
              <li><strong>Analytics Data:</strong> 26 months (Google Analytics default)</li>
            </ul>
          </div>

          <p>
            After the retention period expires, we securely delete or anonymize your information. Some data may be retained in backup systems for an additional period.
          </p>
        </div>
      )
    },
    {
      id: 'children',
      icon: Shield,
      title: '9. Children\'s Privacy',
      content: (
        <div className="space-y-4">
          <p className="font-semibold text-gray-900">
            Our platform is not intended for users under the age of 18.
          </p>
          <p>
            We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately at <a href="mailto:privacy@oshocksjunior.co.ke" className="text-blue-600 hover:underline">privacy@oshocksjunior.co.ke</a>.
          </p>
          <p>
            Upon verification, we will promptly delete such information from our systems and terminate the associated account.
          </p>
        </div>
      )
    },
    {
      id: 'international',
      icon: MapPin,
      title: '10. International Data Transfers',
      content: (
        <div className="space-y-4">
          <p>
            Oshocks Junior Bike Shop primarily operates in Kenya. However, some of our service providers are located outside Kenya, including cloud infrastructure providers in the United States and Europe.
          </p>
          <p>
            When we transfer your information internationally, we ensure appropriate safeguards are in place:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Standard contractual clauses approved by relevant authorities</li>
            <li>Adequacy decisions recognizing equivalent data protection standards</li>
            <li>Service providers certified under recognized privacy frameworks</li>
            <li>Encryption during transmission and storage</li>
          </ul>
          <p className="text-gray-700">
            By using our platform, you consent to the transfer of your information to countries outside Kenya where data protection laws may differ.
          </p>
        </div>
      )
    },
    {
      id: 'changes',
      icon: Clock,
      title: '11. Changes to This Privacy Policy',
      content: (
        <div className="space-y-4">
          <p>
            We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors.
          </p>
          <p>
            When we make significant changes, we will:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Update the "Last Updated" date at the top of this policy</li>
            <li>Notify you via email (if you have an account)</li>
            <li>Display a prominent notice on our platform</li>
            <li>Request your consent for material changes where required by law</li>
          </ul>
          <p className="font-semibold">
            Your continued use of our platform after changes are posted constitutes acceptance of the updated Privacy Policy.
          </p>
        </div>
      )
    },
    {
      id: 'contact',
      icon: Mail,
      title: '12. Contact Information',
      content: (
        <div className="space-y-6">
          <p>
            If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
          </p>

          <div className="bg-gradient-to-br from-blue-50 to-green-50 p-6 rounded-lg space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="font-semibold text-gray-900">Email</p>
                <a href="mailto:privacy@oshocksjunior.co.ke" className="text-blue-600 hover:underline">
                  privacy@oshocksjunior.co.ke
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="font-semibold text-gray-900">Phone</p>
                <a href="tel:+254712345678" className="text-blue-600 hover:underline">
                  +254 712 345 678
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="font-semibold text-gray-900">Physical Address</p>
                <p className="text-gray-700">
                  Oshocks Junior Bike Shop<br />
                  Nairobi, Kenya<br />
                  P.O. Box [Your Box Number]
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Data Protection Officer</h4>
            <p className="text-gray-700">
              For data protection inquiries, you may also contact our Data Protection Officer at <a href="mailto:dpo@oshocksjunior.co.ke" className="text-blue-600 hover:underline">dpo@oshocksjunior.co.ke</a>
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Regulatory Authority</h4>
            <p className="text-gray-700 mb-2">
              If you believe we have not addressed your concerns adequately, you have the right to lodge a complaint with:
            </p>
            <p className="text-gray-900 font-semibold">
              Office of the Data Protection Commissioner (ODPC)<br />
            </p>
            <p className="text-gray-700">
              Website: <a href="https://www.odpc.go.ke" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.odpc.go.ke</a><br />
              Email: <a href="mailto:info@odpc.go.ke" className="text-blue-600 hover:underline">info@odpc.go.ke</a>
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
              <p className="text-gray-600">Oshocks Junior Bike Shop</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Last Updated: {lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Table of Contents</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {sections.map((section, index) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <section.icon className="w-4 h-4" />
                <span>{section.title}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {sections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSections[section.id] !== false;
            
            return (
              <div
                key={section.id}
                id={section.id}
                className="bg-white rounded-lg shadow-md overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
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

        {/* Footer Notice */}
        <div className="mt-12 bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-green-600 mt-1" />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Your Privacy Matters</h3>
              <p className="text-gray-700">
                At Oshocks Junior Bike Shop, we are committed to maintaining the highest standards of data protection and privacy. This policy reflects our dedication to transparency and compliance with the Kenya Data Protection Act, 2019. If you have any questions or concerns, please don't hesitate to reach out to our team.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-purple-100 p-2 rounded">
                <Eye className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900">Access Your Data</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Request a copy of all personal information we have stored about you.
            </p>
            <a
              href="/account/privacy"
              className="text-blue-600 hover:text-blue-800 text-sm font-semibold hover:underline"
            >
              Request Data →
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-orange-100 p-2 rounded">
                <Mail className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="font-bold text-gray-900">Manage Preferences</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Control your email subscriptions and communication preferences.
            </p>
            <a
              href="/account/preferences"
              className="text-blue-600 hover:text-blue-800 text-sm font-semibold hover:underline"
            >
              Update Preferences →
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-red-100 p-2 rounded">
                <Lock className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-bold text-gray-900">Delete Account</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Permanently delete your account and associated personal data.
            </p>
            <a
              href="/account/delete"
              className="text-blue-600 hover:text-blue-800 text-sm font-semibold hover:underline"
            >
              Delete Account →
            </a>
          </div>
        </div>

        {/* Compliance Badges */}
        <div className="mt-12 bg-white p-8 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Our Commitment to Data Protection
          </h3>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div className="space-y-2">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <p className="font-semibold text-gray-900">Kenya DPA</p>
              <p className="text-xs text-gray-600">Compliant</p>
            </div>
            <div className="space-y-2">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8 text-blue-600" />
              </div>
              <p className="font-semibold text-gray-900">SSL/TLS</p>
              <p className="text-xs text-gray-600">Encrypted</p>
            </div>
            <div className="space-y-2">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <CreditCard className="w-8 h-8 text-purple-600" />
              </div>
              <p className="font-semibold text-gray-900">PCI DSS</p>
              <p className="text-xs text-gray-600">Certified</p>
            </div>
            <div className="space-y-2">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Eye className="w-8 h-8 text-orange-600" />
              </div>
              <p className="font-semibold text-gray-900">Transparency</p>
              <p className="text-xs text-gray-600">Guaranteed</p>
            </div>
          </div>
        </div>

        {/* Download Options */}
        <div className="mt-8 flex justify-center gap-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download as PDF
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-md border border-gray-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share Policy
          </button>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold hover:underline"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </a>
        </div>
      </div>

      {/* Floating Help Button */}
      <div className="fixed bottom-6 right-6">
        <button className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
}