import React, { useState } from 'react';
import { 
  Wrench, Package, Zap, Shield, Clock, CheckCircle, 
  Calendar, MapPin, Phone, Mail, X 
} from 'lucide-react';

const ServicesPage = () => {
  const [selectedService, setSelectedService] = useState(null);

  const services = [
    {
      id: 1,
      icon: <Wrench className="w-12 h-12" />,
      title: "Bike Repair & Maintenance",
      subtitle: "Keep your ride in perfect condition",
      price: "From KSh 500",
      description: "Our expert technicians provide comprehensive bike repair and maintenance services to keep your bicycle running smoothly and safely.",
      features: [
        "Basic tune-up and adjustments",
        "Brake system repair and replacement",
        "Gear shifting optimization",
        "Chain cleaning and lubrication",
        "Tire repair and replacement",
        "Wheel truing and spoke replacement",
        "Bottom bracket service",
        "Headset maintenance"
      ],
      turnaround: "24-48 hours",
      warranty: "30-day service warranty",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"
    },
    {
      id: 2,
      icon: <Package className="w-12 h-12" />,
      title: "Custom Bike Assembly",
      subtitle: "Build your dream bike",
      price: "From KSh 2,500",
      description: "Whether you've purchased a new bike or want to build a custom setup, our professional assembly service ensures everything is perfectly configured.",
      features: [
        "Complete bike assembly from box",
        "Custom component installation",
        "Professional cable routing",
        "Precise brake and gear setup",
        "Wheel alignment and truing",
        "Safety inspection checklist",
        "Test ride and final adjustments",
        "Setup recommendations"
      ],
      turnaround: "2-3 business days",
      warranty: "90-day assembly warranty",
      image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80"
    },
    {
      id: 3,
      icon: <Zap className="w-12 h-12" />,
      title: "E-Bike Service & Repair",
      subtitle: "Specialized electric bike care",
      price: "From KSh 1,500",
      description: "Specialized service for electric bikes including motor diagnostics, battery maintenance, and electrical system troubleshooting.",
      features: [
        "Motor performance diagnostics",
        "Battery health assessment",
        "Electrical system inspection",
        "Display and controller setup",
        "Wiring and connection check",
        "Software updates when available",
        "Range optimization tips",
        "Charging system maintenance"
      ],
      turnaround: "3-5 business days",
      warranty: "60-day service warranty",
      image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80"
    },
    {
      id: 4,
      icon: <Shield className="w-12 h-12" />,
      title: "Annual Service Package",
      subtitle: "Complete yearly maintenance",
      price: "KSh 8,000/year",
      description: "Comprehensive annual maintenance package to keep your bike in top condition all year round with regular check-ups and priority service.",
      features: [
        "4 comprehensive tune-ups per year",
        "Priority booking and service",
        "20% discount on parts",
        "Free emergency adjustments",
        "Complimentary bike cleaning",
        "Seasonal readiness checks",
        "Wear item inspections",
        "Service history documentation"
      ],
      turnaround: "Scheduled appointments",
      warranty: "Full year coverage",
      image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80"
    },
    {
      id: 5,
      icon: <Clock className="w-12 h-12" />,
      title: "Express Service",
      subtitle: "Same-day repairs when you need them",
      price: "From KSh 1,000",
      description: "Need your bike fixed urgently? Our express service prioritizes your repair with same-day completion for most issues.",
      features: [
        "Same-day service completion",
        "Priority queue placement",
        "Quick diagnosis and repair",
        "Available for most repairs",
        "Emergency support",
        "Flat tire fixes (30 minutes)",
        "Brake adjustments (45 minutes)",
        "Basic tune-ups (2 hours)"
      ],
      turnaround: "Same day",
      warranty: "30-day service warranty",
      image: "https://images.unsplash.com/photo-1511994714008-b6fc8e15f98e?w=800&q=80"
    },
    {
      id: 6,
      icon: <CheckCircle className="w-12 h-12" />,
      title: "Pre-Purchase Inspection",
      subtitle: "Expert evaluation before you buy",
      price: "KSh 1,500",
      description: "Planning to buy a used bike? Get a professional inspection to ensure you're making a sound investment.",
      features: [
        "Comprehensive frame inspection",
        "Component wear assessment",
        "Safety system evaluation",
        "Value estimation",
        "Detailed written report",
        "Photo documentation",
        "Repair cost estimates",
        "Purchase recommendations"
      ],
      turnaround: "24 hours",
      warranty: "Inspection report guarantee",
      image: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800&q=80"
    }
  ];

  const whyChooseUs = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Certified Technicians",
      description: "Our mechanics are elite cyclists with experience in bicycle repair and maintenance."
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "Quality Guarantee",
      description: "We stand behind our work with comprehensive approach to ensure better user experience on all services and use only genuine parts."
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Fast Turnaround",
      description: "Most repairs completed within 24-48 hours, with express service available for urgent needs."
    },
    {
      icon: <Package className="w-8 h-8" />,
      title: "Genuine Parts",
      description: "We use only authentic manufacturer parts and premium aftermarket components for all repairs."
    }
  ];

  const processSteps = [
    {
      step: "1",
      title: "Book Your Service",
      description: "Schedule an appointment online, via phone, or walk into our Nairobi shop."
    },
    {
      step: "2",
      title: "Drop Off Your Bike",
      description: "Bring your bike to our service center. We'll do a quick assessment and provide an estimate."
    },
    {
      step: "3",
      title: "Expert Service",
      description: "Our experienced technicians will perform the required service with attention to detail."
    },
    {
      step: "4",
      title: "Pick Up & Ride",
      description: "We'll notify you when ready. Pick up your bike and enjoy a smooth, safe ride!"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Wrench className="w-20 h-20 mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Bike Services by Experienced Mechanics
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Expert maintenance and repair to keep you riding safe and smooth
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#services" className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-lg">
                View Services
              </a>
              <a href="#contact" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors text-lg">
                Book Appointment
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Oshocks Service Center
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Trusted by many cyclists for reliable and professional bike services
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div id="services" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From basic maintenance to complete overhauls, we offer comprehensive bike services
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow cursor-pointer"
                onClick={() => setSelectedService(service)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full">
                    <span className="text-blue-600 font-bold">{service.price}</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-blue-600 mb-4">{service.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.subtitle}</p>
                  <p className="text-gray-700 mb-4 line-clamp-2">{service.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{service.turnaround}</span>
                    </div>
                    <button className="text-blue-600 font-semibold hover:text-blue-700">
                      Learn More →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Service Process */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Getting your bike serviced is simple and hassle-free
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {processSteps.map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
                {index < processSteps.length - 1 && (
                  <div className="hidden md:block absolute top-8 right-0 transform translate-x-1/2 w-full">
                    <div className="border-t-2 border-dashed border-blue-300"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Table */}
      <div className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Service Pricing
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Transparent pricing with no hidden fees
            </p>
          </div>
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left">Service</th>
                    <th className="px-6 py-4 text-left">Starting Price</th>
                    <th className="px-6 py-4 text-left">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">Basic Tune-Up</td>
                    <td className="px-6 py-4 text-gray-700">KSh 1,000</td>
                    <td className="px-6 py-4 text-gray-700">1-2 hours</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">Flat Tire Repair</td>
                    <td className="px-6 py-4 text-gray-700">KSh 50</td>
                    <td className="px-6 py-4 text-gray-700">30 minutes</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">Brake Adjustment</td>
                    <td className="px-6 py-4 text-gray-700">KSh 300</td>
                    <td className="px-6 py-4 text-gray-700">45 minutes</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">Gear Tune-Up</td>
                    <td className="px-6 py-4 text-gray-700">KSh 5,000</td>
                    <td className="px-6 py-4 text-gray-700">1 hour</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">Wheel Truing</td>
                    <td className="px-6 py-4 text-gray-700">KSh 700</td>
                    <td className="px-6 py-4 text-gray-700">1-2 hours</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">Complete Overhaul</td>
                    <td className="px-6 py-4 text-gray-700">KSh 1,000</td>
                    <td className="px-6 py-4 text-gray-700">1-2 days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Contact/Booking Section */}
      <div id="contact" className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Book Your Service Today
              </h2>
              <p className="text-xl text-blue-100">
                Visit our shop or schedule an appointment online
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Contact Info */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Visit Our Shop</h3>
                    <p className="text-blue-100">Nairobi, Kenya</p>
                    <p className="text-blue-100 text-sm">Open Mon-Sat, 8AM-6PM</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Call Us</h3>
                    <p className="text-blue-100">+254 798 558 285</p>
                    <p className="text-blue-100 text-sm">Available during business hours</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Email Us</h3>
                    <p className="text-blue-100">oshocksjuniorbikeshop@gmail.com</p>
                    <p className="text-blue-100 text-sm">We'll respond within 24 hours</p>
                  </div>
                </div>
              </div>

              {/* Quick Booking Form */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Quick Booking</h3>
                <form className="space-y-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full px-4 py-3 rounded-lg bg-white/90 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full px-4 py-3 rounded-lg bg-white/90 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <select className="w-full px-4 py-3 rounded-lg bg-white/90 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300">
                    <option>Select Service</option>
                    <option>Basic Maintenance</option>
                    <option>Repair Service</option>
                    <option>Custom Assembly</option>
                    <option>E-Bike Service</option>
                    <option>Express Service</option>
                  </select>
                  <textarea
                    placeholder="Additional Details (Optional)"
                    rows="3"
                    className="w-full px-4 py-3 rounded-lg bg-white/90 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  ></textarea>
                  <button className="w-full bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Book Appointment
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Modal */}
      {selectedService && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedService(null)}
        >
          <div
            className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-64">
              <img
                src={selectedService.image}
                alt={selectedService.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedService(null)}
                className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {selectedService.title}
                  </h2>
                  <p className="text-lg text-gray-600">{selectedService.subtitle}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{selectedService.price}</div>
                </div>
              </div>
              <p className="text-gray-700 mb-6">{selectedService.description}</p>
              
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">What's Included:</h3>
                <ul className="grid md:grid-cols-2 gap-2">
                  {selectedService.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Clock className="w-5 h-5" />
                    <span className="font-semibold">Turnaround Time:</span>
                  </div>
                  <p className="text-gray-900 ml-7">{selectedService.turnaround}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Shield className="w-5 h-5" />
                    <span className="font-semibold">Warranty:</span>
                  </div>
                  <p className="text-gray-900 ml-7">{selectedService.warranty}</p>
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2">
                <Calendar className="w-5 h-5" />
                Book This Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;
