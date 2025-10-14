import React from 'react';
import { Bike, Store, Users, Globe, Shield, Zap } from 'lucide-react';

const AboutPage = () => {
  const features = [
    {
      icon: <Store className="w-8 h-8" />,
      title: "Physical & Online Presence",
      description: "Based in Nairobi with a retail shop and delivery around Nairobi Metropolitan, bringing cycling products to every corner around you."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Multi-Vendor Marketplace",
      description: "Empowering bicycle sellers to reach more customers through our trusted platform."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Payments",
      description: "M-Pesa integration and international card payments with industry-standard security for safe transactions."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Fast & Reliable",
      description: "Lightning-fast search, real-time inventory updates, and efficient order processing for the best experience."
    }
  ];

  const stats = [
    { number: "1000+", label: "Products Available" },
    { number: "24/7", label: "Customer Support" },
    { number: "100%", label: "Secure Checkout" },
    { number: "NMS", label: "Delivery" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Bike className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              About Oshocks Junior Bike Shop
            </h1>
            <p className="text-xl md:text-2xl text-blue-100">
              Kenya's Premier Cycling Marketplace
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 md:p-12 mb-12">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Our Vision</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Oshocks Junior Bike Shop is more than just an online store—it's a comprehensive cycling ecosystem designed to revolutionize how Kenyans discover, purchase, and experience cycling products. Inspired by the functionality of the global marketplaces, we're building Kenya's first truly integrated cycling marketplace.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Starting from our physical shop in Nairobi, we're expanding to create a platform where cycling enthusiasts can find everything they need, from complete bicycles to the smallest spare parts, all while supporting local businesses and sellers across the country.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 text-sm md:text-base">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Features Grid */}
          <h2 className="text-3xl font-bold mb-8 text-gray-900 text-center">
            What Makes Us Different
          </h2>
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-700 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Story Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 md:p-12 mb-12">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Our Story</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Oshocks Junior Bike Shop began with a simple mission: make quality cycling products accessible to everyone in Kenya. As cycling enthusiasts ourselves, we understood the challenges of finding reliable suppliers, authentic products, and trustworthy service in the cycling industry.
              </p>
              <p>
                We wish to empower what started as a small retail operation to evolved into an ambitious project to build a comprehensive cycling marketplace. We're not just selling bikes—we're creating a platform that connects sellers with customers, supports local businesses, and builds a vibrant cycling community.
              </p>
              <p>
                By combining cutting-edge e-commerce technology with local payment solutions like M-Pesa, we're making it easier than ever for Kenyans to access quality cycling products, whether they're in Nairobi, Mombasa, Kisumu, Kisii, or anywhere in between.
              </p>
            </div>
          </div>

          {/* Technology & Innovation */}
          <div className="bg-white rounded-lg shadow-md p-8 md:p-12 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-8 h-8 text-blue-600" />
              <h2 className="text-3xl font-bold text-gray-900">Technology & Innovation</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              We're leveraging modern web technologies to create a platform that's fast, reliable, and user-friendly. Our marketplace features intelligent search capabilities, real-time inventory tracking, secure payment processing, and responsive design that works seamlessly across all devices.
            </p>
            <p className="text-gray-700 leading-relaxed">
              With integrated M-Pesa payments, live chat support, and automated email notifications, we're ensuring that every interaction with our platform is smooth and hassle-free. As we grow, we'll continue to invest in technology that enhances the shopping experience for our customers and provides powerful tools for our sellers.
            </p>
          </div>

          {/* Commitment Section */}
          <div className="bg-blue-600 text-white rounded-lg p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold mb-6">Our Commitment to You</h2>
            <p className="text-lg text-blue-100 leading-relaxed mb-6 max-w-3xl mx-auto">
              We're committed to providing authentic products, competitive prices, reliable delivery, and exceptional customer service. Whether you're a casual rider or an elite cyclist, we're here to support your cycling journey every step of the way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/products" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                Shop Now
              </a>
              <a href="/contact" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;