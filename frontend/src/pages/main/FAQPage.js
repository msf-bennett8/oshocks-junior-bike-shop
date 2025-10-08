import React, { useState } from 'react';
import { Search, ChevronDown, ShoppingCart, CreditCard, Truck, RefreshCw, HelpCircle, Phone, MessageCircle, Shield } from 'lucide-react';

const FAQPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openItem, setOpenItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Questions', icon: <HelpCircle className="w-5 h-5" /> },
    { id: 'ordering', name: 'Ordering', icon: <ShoppingCart className="w-5 h-5" /> },
    { id: 'payment', name: 'Payment', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'shipping', name: 'Shipping', icon: <Truck className="w-5 h-5" /> },
    { id: 'returns', name: 'Returns', icon: <RefreshCw className="w-5 h-5" /> },
    { id: 'products', name: 'Products', icon: <Shield className="w-5 h-5" /> }
  ];

  const faqs = [
    {
      category: 'ordering',
      question: 'How do I place an order on Oshocks Junior Bike Shop?',
      answer: 'Placing an order is simple! Browse our products, add items to your cart by clicking "Add to Cart", review your cart, and proceed to checkout. You\'ll need to create an account or log in, enter your shipping information, choose your payment method (M-Pesa or Card), and confirm your order. You\'ll receive an email confirmation immediately after placing your order.'
    },
    {
      category: 'ordering',
      question: 'Can I modify or cancel my order after placing it?',
      answer: 'Yes, you can modify or cancel your order within 2 hours of placing it. After this window, orders are processed and shipped quickly, making changes difficult. To modify or cancel, go to "My Orders" in your account dashboard and select the order you wish to change. For urgent requests, contact our support team immediately via live chat or call us.'
    },
    {
      category: 'ordering',
      question: 'Do I need to create an account to shop?',
      answer: 'While you can browse products without an account, you\'ll need to create one to complete a purchase. Having an account allows you to track orders, save items to your wishlist, view order history, manage shipping addresses, and receive personalized product recommendations. Registration is quick and free!'
    },
    {
      category: 'ordering',
      question: 'Can I order multiple items at once?',
      answer: 'Absolutely! You can add as many items as you want to your cart before checking out. There\'s no limit to the number of products you can order in a single transaction. We also offer bulk discounts for certain products when ordering in large quantities - contact us for more details.'
    },
    {
      category: 'payment',
      question: 'What payment methods do you accept?',
      answer: 'We accept multiple payment methods for your convenience: M-Pesa (via STK push and Paybill), Visa and Mastercard credit/debit cards, and bank transfers for large orders. All payments are processed securely using industry-standard encryption. Your financial information is never stored on our servers.'
    },
    {
      category: 'payment',
      question: 'How do I pay using M-Pesa?',
      answer: 'When you select M-Pesa at checkout, enter your M-Pesa registered phone number. You\'ll receive an STK push prompt on your phone to enter your M-Pesa PIN and complete the payment. If you don\'t receive the prompt, you can manually pay to our Paybill number which will be displayed. Once payment is confirmed (usually within 1-2 minutes), your order will be processed immediately.'
    },
    {
      category: 'payment',
      question: 'Is it safe to use my credit card on your website?',
      answer: 'Yes, absolutely! We use Stripe and Flutterwave, industry-leading payment processors with bank-level security. All card transactions are encrypted using SSL/TLS technology. We never store your complete card details on our servers. Additionally, our checkout page is PCI DSS compliant, ensuring the highest security standards for online payments.'
    },
    {
      category: 'payment',
      question: 'What happens if my payment fails?',
      answer: 'If your payment fails, don\'t worry - your order won\'t be processed and you won\'t be charged. Common reasons include insufficient funds, incorrect PIN/card details, or network issues. You can retry the payment immediately or choose a different payment method. If problems persist, contact your bank or M-Pesa customer service, or reach out to our support team for assistance.'
    },
    {
      category: 'payment',
      question: 'Do you offer installment payment plans?',
      answer: 'Currently, we don\'t offer direct installment plans, but we\'re working on partnerships with financing providers to make this available soon. For large purchases over KSh 50,000, you can contact us directly to discuss flexible payment arrangements. Stay tuned for updates on our installment payment options!'
    },
    {
      category: 'shipping',
      question: 'Where do you deliver in Kenya?',
      answer: 'We deliver nationwide across all 47 counties in Kenya! Whether you\'re in Nairobi, Mombasa, Kisumu, Eldoret, Nakuru, or any other town, we\'ll get your order to you. Delivery times vary by location: Nairobi and major cities typically receive orders within 1-3 business days, while remote areas may take 3-7 business days.'
    },
    {
      category: 'shipping',
      question: 'How much does shipping cost?',
      answer: 'Shipping costs depend on your location and order size. Within Nairobi, delivery is KSh 300 for orders under KSh 10,000. For orders over KSh 10,000, shipping is FREE nationwide! Other major cities have flat rates starting from KSh 500. Remote areas may have additional charges based on courier fees. Exact shipping costs are calculated at checkout based on your delivery address.'
    },
    {
      category: 'shipping',
      question: 'How can I track my order?',
      answer: 'Once your order ships, you\'ll receive an email with a tracking number and link. You can track your order in real-time by logging into your account and visiting "My Orders", or by clicking the tracking link in your shipping confirmation email. You\'ll receive updates via SMS and email at key milestones: order confirmed, order shipped, out for delivery, and delivered.'
    },
    {
      category: 'shipping',
      question: 'Can I pick up my order instead of having it delivered?',
      answer: 'Yes! If you\'re in Nairobi, you can choose "Store Pickup" at checkout to collect your order from our physical shop in Nairobi. Orders are usually ready for pickup within 24 hours. You\'ll receive a notification when your order is ready. Please bring your order confirmation and a valid ID when collecting. Store pickup is completely FREE!'
    },
    {
      category: 'shipping',
      question: 'What if I\'m not home when delivery arrives?',
      answer: 'Our courier will attempt to contact you via the phone number provided. If you\'re unavailable, they\'ll leave a notification with instructions. You can reschedule delivery for a convenient time or arrange pickup from the courier\'s nearest office. Packages are held securely for up to 5 days before being returned to us.'
    },
    {
      category: 'returns',
      question: 'What is your return policy?',
      answer: 'We offer a 14-day return policy for most products. Items must be unused, in original packaging, and in the same condition you received them. To initiate a return, log into your account, go to "My Orders", select the order, and click "Return Items". You\'ll receive instructions on how to return the product. Once we receive and inspect the item, we\'ll process your refund within 5-7 business days.'
    },
    {
      category: 'returns',
      question: 'Can I exchange a product instead of returning it?',
      answer: 'Yes! If you want a different size, color, or model, you can request an exchange instead of a refund. Select "Exchange" when initiating your return, specify what you\'d like instead, and we\'ll ship the replacement item once we receive your return. If there\'s a price difference, we\'ll either refund you or send a payment request for the additional amount.'
    },
    {
      category: 'returns',
      question: 'Who pays for return shipping?',
      answer: 'If the return is due to our error (wrong item, damaged, or defective product), we cover all return shipping costs. If you\'re returning for other reasons (changed mind, wrong size ordered, etc.), you\'ll be responsible for return shipping fees. However, if you exchange for a different product, we\'ll cover the shipping for the replacement item.'
    },
    {
      category: 'returns',
      question: 'How long does it take to get my refund?',
      answer: 'Once we receive your returned item and verify its condition, refunds are processed within 5-7 business days. M-Pesa refunds typically appear within 24 hours, while card refunds may take 5-10 business days depending on your bank. You\'ll receive an email notification when your refund is processed. The refund will be issued to your original payment method.'
    },
    {
      category: 'products',
      question: 'Are all the bikes on your site brand new?',
      answer: 'Yes! All bicycles and products sold on Oshocks Junior Bike Shop are brand new unless explicitly marked as "Refurbished" or "Open Box". We source directly from authorized distributors and manufacturers. Every bike comes with manufacturer warranties where applicable, and we guarantee authenticity for all branded products.'
    },
    {
      category: 'products',
      question: 'Do your bikes come assembled?',
      answer: 'Most bikes come 85% assembled. You\'ll need to attach the front wheel, handlebars, pedals, and seat, then adjust the brakes and gears. Detailed assembly instructions are included. If you\'re not comfortable assembling yourself, you can visit our Nairobi shop for professional assembly (KSh 1,500), or we can recommend certified bike mechanics in your area.'
    },
    {
      category: 'products',
      question: 'How do I choose the right bike size?',
      answer: 'Bike size depends on your height and the type of bike. Each product page has a detailed size chart. Generally: for mountain bikes, riders 5\'0"-5\'4" need 15-16" frames, 5\'5"-5\'9" need 17-18" frames, 5\'10"-6\'1" need 19-20" frames, and over 6\'1" need 21"+ frames. Our customer support team can help you choose the perfect size - just provide your height and inseam measurement.'
    },
    {
      category: 'products',
      question: 'Do you offer warranties on your products?',
      answer: 'Yes! Most bikes and accessories come with manufacturer warranties ranging from 6 months to 2 years, depending on the brand and product type. Warranties typically cover manufacturing defects and frame integrity but don\'t cover normal wear and tear, accidents, or improper maintenance. Warranty details are listed on each product page. Register your product after purchase to activate the warranty.'
    },
    {
      category: 'products',
      question: 'Can I get help choosing the right bike for my needs?',
      answer: 'Absolutely! Our team of cycling experts is here to help. You can use our live chat feature (bottom right of any page), call us during business hours, or visit our Nairobi shop for personalized recommendations. Tell us about your riding style, terrain, budget, and experience level, and we\'ll help you find the perfect bike. We also have detailed buying guides in our blog section.'
    },
    {
      category: 'products',
      question: 'Do you sell spare parts and accessories?',
      answer: 'Yes! We stock a comprehensive range of spare parts including chains, cassettes, brake pads, tubes, tires, derailleurs, and more. We also carry accessories like helmets, lights, locks, water bottles, bike computers, repair kits, and cycling apparel. If you can\'t find a specific part, contact us - we can often special order items from our suppliers.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleItem = (index) => {
    setOpenItem(openItem === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <HelpCircle className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Find answers to common questions about ordering, payments, shipping, and more
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto py-4 gap-3 scrollbar-hide">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.icon}
                <span className="font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No questions found</h3>
              <p className="text-gray-500">Try adjusting your search or browse different categories</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 text-lg pr-4">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-blue-600 flex-shrink-0 transition-transform ${
                        openItem === index ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openItem === index && (
                    <div className="px-6 pb-5 pt-2">
                      <div className="text-gray-700 leading-relaxed border-t pt-4">
                        {faq.answer}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Still Have Questions Section */}
          <div className="mt-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Still have questions?
              </h2>
              <p className="text-gray-700 text-lg">
                Our support team is here to help you with any inquiries
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 text-center hover:shadow-md transition-shadow">
                <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Chat with our team in real-time
                </p>
                <button className="text-blue-600 font-semibold hover:text-blue-700">
                  Start Chat
                </button>
              </div>

              <div className="bg-white rounded-lg p-6 text-center hover:shadow-md transition-shadow">
                <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Call Us</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Mon-Sat, 8AM-6PM EAT
                </p>
                <a href="tel:+254700000000" className="text-green-600 font-semibold hover:text-green-700">
                  +254 700 000 000
                </a>
              </div>

              <div className="bg-white rounded-lg p-6 text-center hover:shadow-md transition-shadow">
                <div className="bg-purple-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Help Center</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Browse guides and tutorials
                </p>
                <button className="text-purple-600 font-semibold hover:text-purple-700">
                  Visit Center
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;