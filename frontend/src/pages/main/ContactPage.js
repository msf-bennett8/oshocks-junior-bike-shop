import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  MessageSquare,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  CheckCircle,
  AlertCircle,
  Smartphone,
  HeadphonesIcon,
  Building,
  Users
} from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: 'general',
    message: ''
  });

  const [formStatus, setFormStatus] = useState({
    type: '', // 'success' or 'error'
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormStatus({ type: '', message: '' });

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setFormStatus({
        type: 'success',
        message: 'Thank you for contacting us! We will get back to you within 24 hours.'
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        category: 'general',
        message: ''
      });

      // Clear success message after 5 seconds
      setTimeout(() => {
        setFormStatus({ type: '', message: '' });
      }, 5000);
    }, 1500);
  };

  const contactMethods = [
    {
      icon: <Phone className="text-blue-600" size={24} />,
      title: 'Phone',
      details: '+254 700 000 000',
      subDetails: 'Mon-Sat, 8AM-8PM',
      link: 'tel:+254700000000'
    },
    {
      icon: <Mail className="text-purple-600" size={24} />,
      title: 'Email',
      details: 'support@oshocks.co.ke',
      subDetails: 'We reply within 24 hours',
      link: 'mailto:support@oshocks.co.ke'
    },
    {
      icon: <Smartphone className="text-green-600" size={24} />,
      title: 'WhatsApp',
      details: '+254 700 000 000',
      subDetails: 'Quick responses',
      link: 'https://wa.me/254700000000'
    },
    {
      icon: <MessageSquare className="text-orange-600" size={24} />,
      title: 'Live Chat',
      details: 'Chat with us',
      subDetails: 'Available 24/7',
      link: '#'
    }
  ];

  const officeLocations = [
    {
      name: 'Main Store - Nairobi CBD',
      address: 'Tom Mboya Street, Nairobi',
      hours: 'Mon-Sat: 8:00 AM - 8:00 PM',
      sunday: 'Sunday: 10:00 AM - 6:00 PM',
      phone: '+254 700 000 000'
    },
    {
      name: 'Westlands Branch',
      address: 'Westlands, Nairobi',
      hours: 'Mon-Sat: 9:00 AM - 7:00 PM',
      sunday: 'Sunday: 10:00 AM - 5:00 PM',
      phone: '+254 700 000 001'
    },
    {
      name: 'Mombasa Branch',
      address: 'Moi Avenue, Mombasa',
      hours: 'Mon-Sat: 8:30 AM - 7:30 PM',
      sunday: 'Sunday: Closed',
      phone: '+254 700 000 002'
    }
  ];

  const departments = [
    {
      icon: <HeadphonesIcon size={20} />,
      name: 'Customer Support',
      description: 'General inquiries and product questions'
    },
    {
      icon: <Building size={20} />,
      name: 'Sales Department',
      description: 'Bulk orders and business inquiries'
    },
    {
      icon: <Users size={20} />,
      name: 'Partnership',
      description: 'Become a seller or partner with us'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4">Get In Touch</h1>
            <p className="text-base sm:text-lg md:text-xl text-blue-100 px-4">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Methods */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactMethods.map((method, index) => (
            <a
              key={index}
              href={method.link}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 hover:-translate-y-1 transform"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-3 bg-gray-50 rounded-full">
                  {method.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{method.title}</h3>
                <p className="text-gray-700 font-medium mb-1">{method.details}</p>
                <p className="text-sm text-gray-500">{method.subDetails}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Send Us a Message</h2>
                <p className="text-gray-600">Fill out the form below and our team will get back to you within 24 hours.</p>
              </div>

              {/* Status Message */}
              {formStatus.message && (
                <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                  formStatus.type === 'success' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  {formStatus.type === 'success' ? (
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                  ) : (
                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  )}
                  <p className={formStatus.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                    {formStatus.message}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                      placeholder="+254 700 000 000"
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      Inquiry Type *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="product">Product Question</option>
                      <option value="order">Order Status</option>
                      <option value="technical">Technical Support</option>
                      <option value="partnership">Partnership/Business</option>
                      <option value="feedback">Feedback/Complaint</option>
                      <option value="wholesale">Wholesale Inquiry</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    placeholder="How can we help you?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-none"
                    placeholder="Tell us more about your inquiry..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Office Hours */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="text-blue-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Business Hours</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monday - Friday</span>
                  <span className="font-semibold text-gray-900">8:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saturday</span>
                  <span className="font-semibold text-gray-900">8:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sunday</span>
                  <span className="font-semibold text-gray-900">10:00 AM - 6:00 PM</span>
                </div>
              </div>
            </div>

            {/* Departments */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Departments</h3>
              <div className="space-y-4">
                {departments.map((dept, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg text-purple-600 flex-shrink-0">
                      {dept.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{dept.name}</h4>
                      <p className="text-xs text-gray-600 mt-1">{dept.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Follow Us</h3>
              <p className="text-sm text-gray-600 mb-4">Stay connected on social media</p>
              <div className="flex gap-3">
                <a href="#" className="p-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                  <Facebook size={20} />
                </a>
                <a href="#" className="p-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                  <Twitter size={20} />
                </a>
                <a href="#" className="p-3 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition-colors">
                  <Instagram size={20} />
                </a>
                <a href="#" className="p-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                  <Linkedin size={20} />
                </a>
                <a href="#" className="p-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
                  <Youtube size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Office Locations */}
        <div className="mt-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Visit Our Stores</h2>
            <p className="text-gray-600">Find us at any of our convenient locations across Kenya</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {officeLocations.map((location, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                    <MapPin className="text-blue-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{location.name}</h3>
                    <p className="text-sm text-gray-600">{location.address}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock size={16} className="text-gray-400" />
                    <span>{location.hours}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock size={16} className="text-gray-400" />
                    <span>{location.sunday}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone size={16} className="text-gray-400" />
                    <span>{location.phone}</span>
                  </div>
                </div>
                <button className="mt-4 w-full py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm">
                  Get Directions
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-16 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="aspect-video bg-gray-200 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Interactive Map Coming Soon</p>
                <p className="text-sm text-gray-500 mt-2">Find us on Google Maps</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;