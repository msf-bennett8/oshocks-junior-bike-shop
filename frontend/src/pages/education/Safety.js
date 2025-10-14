import React, { useState } from 'react';
import { AlertTriangle, Shield, CheckCircle, ChevronDown, ChevronUp, AlertCircle, Lock, Package, CreditCard, Users } from 'lucide-react';

const Safety = () => {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const safetyCategories = [
    {
      id: 'riding',
      icon: <AlertTriangle className="w-6 h-6" />,
      title: 'Cycling Safety Guidelines',
      color: 'bg-blue-500',
      items: [
        {
          title: 'Essential Safety Gear',
          content: 'Always wear a properly fitted helmet that meets safety standards. Use reflective clothing and lights when riding at dawn, dusk, or night. Wear appropriate footwear and consider gloves for better grip and protection.'
        },
        {
          title: 'Road Safety Rules',
          content: 'Obey all traffic laws and signals. Ride in the same direction as traffic. Use hand signals to indicate turns. Stay alert and avoid distractions like mobile phones. Maintain a safe distance from vehicles and other cyclists.'
        },
        {
          title: 'Bike Inspection Before Riding',
          content: 'Check tire pressure and tread condition. Test brakes for proper function. Ensure the chain is lubricated and clean. Verify that handlebars and seat are secure. Check that lights and reflectors are working properly.'
        },
        {
          title: 'Weather Considerations',
          content: 'Avoid riding in heavy rain, strong winds, or poor visibility conditions. Reduce speed on wet or slippery surfaces. Be extra cautious during Nairobi\'s rainy seasons (March-May, October-December). Dress appropriately for weather conditions.'
        }
      ]
    },
    {
      id: 'maintenance',
      icon: <Shield className="w-6 h-6" />,
      title: 'Bike Maintenance Safety',
      color: 'bg-green-500',
      items: [
        {
          title: 'Proper Tool Usage',
          content: 'Use the correct tools for each job to prevent damage. Keep tools clean and in good condition. Never force components that don\'t fit. Wear safety glasses when working with springs or under pressure.'
        },
        {
          title: 'Brake System Safety',
          content: 'Regularly inspect brake pads for wear. Check brake cables for fraying or damage. Test brakes before every ride. Replace worn components immediately. If unsure about brake repairs, consult a professional.'
        },
        {
          title: 'Tire Safety',
          content: 'Maintain proper tire pressure as indicated on tire sidewall. Inspect for cuts, embedded objects, or excessive wear. Replace tires showing cords or significant damage. Use tire levers carefully to avoid puncturing tubes.'
        },
        {
          title: 'Chain and Drivetrain',
          content: 'Keep chain clean and properly lubricated. Check for chain wear regularly. Ensure derailleurs are properly adjusted. Keep fingers away from moving parts. Clean drivetrain components regularly to prevent premature wear.'
        }
      ]
    },
    {
      id: 'marketplace',
      icon: <Lock className="w-6 h-6" />,
      title: 'Marketplace Safety & Security',
      color: 'bg-purple-500',
      items: [
        {
          title: 'Secure Shopping',
          content: 'Only make purchases through our official payment channels (M-Pesa and card payments). Never share your payment information via email or chat. Look for the secure checkout badge before completing transactions. Keep your account password strong and unique.'
        },
        {
          title: 'Verify Sellers',
          content: 'Check seller ratings and reviews before purchasing. Look for verified seller badges. Read product descriptions carefully. Contact sellers through our platform\'s messaging system. Report suspicious listings immediately.'
        },
        {
          title: 'Product Authentication',
          content: 'Purchase from reputable sellers with good ratings. Check for detailed product photos and descriptions. Verify that products meet safety standards. Be cautious of prices that seem too good to be true. Request additional information if needed.'
        },
        {
          title: 'Account Security',
          content: 'Use a strong, unique password for your account. Enable two-factor authentication if available. Never share your login credentials. Log out from shared devices. Regularly review your order history and account activity.'
        }
      ]
    },
    {
      id: 'delivery',
      icon: <Package className="w-6 h-6" />,
      title: 'Delivery & Inspection Safety',
      color: 'bg-orange-500',
      items: [
        {
          title: 'Package Inspection',
          content: 'Inspect packages for damage upon delivery. Open packages carefully to avoid injury. Check that all items match your order. Test products as soon as possible after delivery. Report any damage or missing items within 24 hours.'
        },
        {
          title: 'Assembly Safety',
          content: 'Follow assembly instructions carefully. Have bikes professionally assembled if you\'re uncertain. Use proper tools for assembly. Don\'t skip safety checks after assembly. Test ride in a safe area before regular use.'
        },
        {
          title: 'Product Recalls',
          content: 'Register products to receive recall notifications. Check our website regularly for safety updates. Stop using recalled products immediately. Contact us if you have concerns about product safety. Keep receipts and product documentation.'
        },
        {
          title: 'Return Process Safety',
          content: 'Package items securely for return shipment. Remove personal information from returned items. Use tracked shipping for returns. Keep proof of return shipment. Follow our return policy guidelines for smooth processing.'
        }
      ]
    }
  ];

  const emergencyContacts = [
    { name: 'Customer Support', contact: '+254 798 558 285', available: '8 AM - 8 PM EAT' },
    { name: 'Emergency Support', contact: 'oshocksjuniorbikeshop@gmail.com', available: '24/7 Email' },
    { name: 'Nairobi Traffic Police', contact: '999', available: 'Emergency' }
  ];

  const safetyTips = [
    'Always inspect your bike before each ride',
    'Keep emergency contact information while riding',
    'Carry a basic repair kit on longer rides',
    'Stay hydrated, especially in Nairobi\'s warm climate',
    'Know your route and share it with someone',
    'Trust your instincts - if something feels unsafe, stop and assess'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Shield className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Safety First</h1>
            <p className="text-xl text-red-100">
              Your safety is our priority. Learn essential safety guidelines for cycling, bike maintenance, and secure shopping on our platform.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Safety Tips Banner */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6">
        <div className="container mx-auto px-4">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-yellow-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Quick Safety Reminder</h3>
              <p className="text-yellow-700">
                Before every ride, perform the ABC Quick Check: <strong>A</strong>ir (tire pressure), <strong>B</strong>rakes (working properly), <strong>C</strong>hain (lubricated and clean). This simple routine can prevent accidents and equipment failure.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Safety Categories */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-6">
            {safetyCategories.map((category) => (
              <div key={category.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className={`${category.color} text-white p-6`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {category.icon}
                      <h2 className="text-2xl font-bold">{category.title}</h2>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {category.items.map((item, idx) => (
                      <div key={idx} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                        <button
                          onClick={() => toggleSection(`${category.id}-${idx}`)}
                          className="w-full flex items-center justify-between text-left hover:text-blue-600 transition-colors"
                        >
                          <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                          {openSection === `${category.id}-${idx}` ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </button>
                        {openSection === `${category.id}-${idx}` && (
                          <div className="mt-3 text-gray-600 leading-relaxed pl-4 border-l-2 border-blue-500">
                            {item.content}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* General Safety Tips */}
          <div className="mt-12 bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center space-x-3 mb-6">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <h2 className="text-2xl font-bold text-gray-800">Essential Safety Tips</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {safetyTips.map((tip, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="mt-12 bg-red-50 rounded-lg shadow-md p-8 border-2 border-red-200">
            <div className="flex items-center space-x-3 mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-800">Emergency Contacts</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {emergencyContacts.map((contact, idx) => (
                <div key={idx} className="bg-white rounded-lg p-4 border border-red-200">
                  <h3 className="font-semibold text-gray-800 mb-2">{contact.name}</h3>
                  <p className="text-lg font-bold text-red-600 mb-1">{contact.contact}</p>
                  <p className="text-sm text-gray-600">{contact.available}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Report Safety Concerns */}
          <div className="mt-12 bg-blue-50 rounded-lg shadow-md p-8">
            <div className="text-center max-w-2xl mx-auto">
              <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Report Safety Concerns</h2>
              <p className="text-gray-700 mb-6">
                If you encounter any safety issues with products purchased from our marketplace, experience unsafe seller behavior, or have concerns about product authenticity, please report it immediately to our team. Your safety reports help us maintain a secure marketplace for all users.
              </p>
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Report a Safety Concern
              </button>
            </div>
          </div>

          {/* Legal Disclaimer */}
          <div className="mt-12 bg-gray-100 rounded-lg p-6 text-sm text-gray-600">
            <h3 className="font-semibold text-gray-800 mb-2">Safety Disclaimer</h3>
            <p className="leading-relaxed">
              The safety information provided on this page is for general guidance purposes only. Oshocks Junior Bike Shop is not responsible for accidents, injuries, or damages resulting from the use of products purchased through our marketplace. Users are responsible for ensuring proper bike maintenance, using appropriate safety equipment, and following all applicable traffic laws and regulations in Kenya. Always consult professional mechanics for complex repairs and seek professional instruction if you're new to cycling. By using our platform, you acknowledge that cycling carries inherent risks and agree to take appropriate safety precautions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Safety;