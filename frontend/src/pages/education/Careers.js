import { useState } from 'react';
import { Briefcase, MapPin, Clock, DollarSign, Users, TrendingUp, Heart, Award, ChevronRight, Search, Filter, X } from 'lucide-react';

const Careers = () => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const jobOpenings = [
    {
      id: 1,
      title: 'Senior Full Stack Developer (React & Laravel)',
      department: 'Engineering',
      location: 'Nairobi, Kenya',
      type: 'Full-time',
      salary: 'KSh 150,000 - 250,000',
      experience: '3-5 years',
      description: 'Build the future of cycling e-commerce in Kenya! Join Oshocks Junior Bike Shop as we develop a world-class marketplace platform using React.js and Laravel.',
      responsibilities: [
        'Develop and maintain React.js frontend for our cycling marketplace',
        'Build robust Laravel backend APIs for product catalog and orders',
        'Implement M-Pesa Daraja API and Stripe payment integrations',
        'Optimize MySQL database queries and application performance',
        'Integrate Cloudinary for product image management',
        'Implement real-time features using Redis caching',
        'Write clean, maintainable, and well-documented code'
      ],
      requirements: [
        'Bachelor\'s degree in Computer Science or related field',
        '3+ years of experience with React.js and Laravel PHP',
        'Strong knowledge of MySQL database design and optimization',
        'Experience with RESTful API development',
        'Familiarity with M-Pesa, Stripe, or payment gateway integrations',
        'Experience with cloud services (Vercel, Railway, PlanetScale)',
        'Understanding of e-commerce platforms and shopping cart systems',
        'Excellent problem-solving and communication skills'
      ],
      benefits: [
        'Competitive salary and performance bonuses',
        'Financial Guidance',
        'Professional development opportunities',
        'Flexible working hours and remote work options',
        'Bicycle and cycling gear discounts',
        'Work on cutting-edge e-commerce technology'
      ]
    },
    {
      id: 2,
      title: 'Cycling Products Content Creator',
      department: 'Marketing',
      location: 'Nairobi, Kenya',
      type: 'Full-time',
      salary: 'KSh 80,000 - 120,000',
      experience: '2-3 years',
      description: 'Create compelling content for Kenya\'s premier cycling marketplace. Showcase bicycles, accessories, and gear through engaging photography, videos, and product descriptions.',
      responsibilities: [
        'Photograph bicycles and cycling products for the marketplace',
        'Write detailed, SEO-optimized product descriptions',
        'Create engaging social media content showcasing cycling gear',
        'Produce video content including bike reviews and tutorials',
        'Develop blog content about cycling in Kenya',
        'Manage product image uploads to Cloudinary',
        'Collaborate with the cycling community for authentic content'
      ],
      requirements: [
        'Diploma or Bachelor\'s degree in Marketing, Communications, or related field',
        '2+ years of content creation experience',
        'Photography and videography skills (product photography experience preferred)',
        'Strong copywriting abilities',
        'Knowledge of SEO best practices',
        'Passion for cycling and understanding of bicycle products',
        'Proficiency with Adobe Creative Suite or similar tools',
        'Ability to work independently and meet deadlines'
      ],
      benefits: [
        'Competitive salary package',
        'Photography equipment and software provided',
        'Bicycle and accessories discounts',
        'Creative freedom and autonomy',
        'Access to latest cycling products for content creation',
        'Professional portfolio building opportunities'
      ]
    },
    {
      id: 3,
      title: 'E-commerce Customer Support Specialist',
      department: 'Customer Support',
      location: 'Nairobi, Kenya',
      type: 'Full-time',
      salary: 'KSh 55,000 - 85,000',
      experience: '1-3 years',
      description: 'Provide exceptional customer service for Kenya\'s growing cycling marketplace. Help customers find the perfect bikes and accessories while managing inquiries across multiple channels.',
      responsibilities: [
        'Respond to customer inquiries via Tawk.to live chat, email, and phone',
        'Assist customers with product selection and recommendations',
        'Process orders, track shipments, and handle returns/refunds',
        'Resolve M-Pesa payment issues and transaction queries',
        'Help sellers navigate the multi-vendor marketplace',
        'Gather customer feedback for platform improvements',
        'Create and maintain help documentation and FAQs',
        'Maintain excellent customer satisfaction ratings'
      ],
      requirements: [
        'Diploma or Bachelor\'s degree in any field',
        '1+ years of customer service experience (e-commerce preferred)',
        'Excellent communication skills in English and Swahili',
        'Knowledge of bicycles and cycling products is highly advantageous',
        'Familiarity with M-Pesa and online payment systems',
        'Problem-solving mindset and patience',
        'Experience with live chat platforms and CRM tools',
        'Ability to multitask and work in a fast-paced environment'
      ],
      benefits: [
        'Competitive salary',
        'Comprehensive training on cycling products',
        'Financial Guidance',
        'Generous employee discounts on bicycles and gear',
        'Supportive team environment',
        'Career growth opportunities'
      ]
    },
    {
      id: 4,
      title: 'Bicycle Delivery & Logistics Coordinator',
      department: 'Operations',
      location: 'Nairobi, Kenya',
      type: 'Full-time',
      salary: 'KSh 70,000 - 110,000',
      experience: '2-3 years',
      description: 'Manage the logistics of delivering bicycles and cycling products across Kenya. Coordinate with courier services and ensure safe, timely delivery of orders from our marketplace.',
      responsibilities: [
        'Coordinate delivery schedules for bicycles and cycling products',
        'Manage relationships with courier partners across Kenya',
        'Handle specialized packaging for bicycle shipments',
        'Track shipments and resolve delivery issues promptly',
        'Optimize delivery routes and logistics processes',
        'Maintain accurate inventory records in the system',
        'Coordinate with sellers for order fulfillment',
        'Handle warehouse operations and bicycle assembly area'
      ],
      requirements: [
        'Diploma or Bachelor\'s degree in Supply Chain, Logistics, or related field',
        '2+ years of logistics experience (e-commerce preferred)',
        'Knowledge of Kenyan delivery landscape and courier services',
        'Understanding of bicycle packaging and handling requirements',
        'Strong organizational and planning skills',
        'Proficiency with logistics software and Excel',
        'Valid driving license is a plus',
        'Physical fitness for handling bicycles and equipment'
      ],
      benefits: [
        'Competitive salary',
        'Transport allowance',
        'Financial Guidance',
        'Performance bonuses',
        'Bicycle discounts',
        'Career growth opportunities in e-commerce logistics'
      ]
    },
    {
      id: 5,
      title: 'E-commerce Marketplace Manager',
      department: 'Product',
      location: 'Nairobi, Kenya',
      type: 'Full-time',
      salary: 'KSh 120,000 - 180,000',
      experience: '3-5 years',
      description: 'Lead the strategic development of Oshocks Junior Bike Shop marketplace. Shape the future of cycling e-commerce in Kenya by managing platform features, seller relationships, and customer experience.',
      responsibilities: [
        'Define marketplace vision and strategic roadmap',
        'Manage product catalog expansion and categorization',
        'Onboard and support third-party bicycle sellers',
        'Conduct market research on cycling trends in Kenya',
        'Prioritize platform features and enhancements',
        'Work closely with engineering team on React/Laravel development',
        'Monitor marketplace metrics, sales, and user behavior',
        'Develop seller commission structures and policies',
        'Gather feedback from buyers and sellers for improvements'
      ],
      requirements: [
        'Bachelor\'s degree in Business, E-commerce, or related field',
        '3+ years of marketplace or e-commerce management experience',
        'Strong analytical and strategic thinking',
        'Understanding of multi-vendor marketplace platforms',
        'Knowledge of the Kenyan cycling industry is highly advantageous',
        'Experience with product management tools and methodologies',
        'Excellent communication and stakeholder management skills',
        'Data-driven decision-making approach'
      ],
      benefits: [
        'Competitive salary and potential equity options',
        'Financial Guidance',
        'Professional development budget',
        'Flexible working arrangements',
        'Significant impact on platform direction',
        'Bicycle and cycling gear discounts'
      ]
    },
    {
      id: 6,
      title: 'Professional Bicycle Mechanic & Assembly Technician',
      department: 'Technical',
      location: 'Nairobi, Kenya',
      type: 'Full-time',
      salary: 'KSh 50,000 - 80,000',
      experience: '2+ years',
      description: 'Join our technical team to assemble, service, and repair bicycles sold through our marketplace. Provide expert mechanical support and create educational content for our cycling community.',
      responsibilities: [
        'Assemble new bicycles from shipments and verify quality',
        'Perform pre-delivery inspections and adjustments',
        'Provide repair and maintenance services for customer bikes',
        'Diagnose and troubleshoot mechanical issues',
        'Advise customers on bike care and maintenance',
        'Manage bicycle tools, spare parts, and component inventory',
        'Create video tutorials and maintenance guides for the website',
        'Support product descriptions with technical specifications'
      ],
      requirements: [
        'Certificate in bicycle mechanics or equivalent training',
        '2+ years of hands-on bike repair and assembly experience',
        'Deep knowledge of bicycle components, systems, and brands',
        'Ability to work with road bikes, mountain bikes, and specialty cycles',
        'Good customer service and communication skills',
        'Physical fitness for manual work and lifting bicycles',
        'Attention to detail for quality control',
        'Willingness to learn about new bicycle technologies'
      ],
      benefits: [
        'Competitive salary',
        'Professional tools and equipment provided',
        'Training on new bike technologies and components',
        'Financial Guidance',
        'Generous employee bicycle and parts discounts',
        'Opportunity to work with latest cycling products'
      ]
    },
    {
      id: 7,
      title: 'Digital Marketing Specialist - Cycling E-commerce',
      department: 'Marketing',
      location: 'Nairobi, Kenya',
      type: 'Full-time',
      salary: 'KSh 90,000 - 140,000',
      experience: '2-4 years',
      description: 'Drive growth for Kenya\'s premier cycling marketplace through strategic digital marketing. Reach cycling enthusiasts across Kenya and build our brand in the cycling community.',
      responsibilities: [
        'Develop and execute digital marketing strategies for cycling products',
        'Manage social media channels (Instagram, Facebook, Twitter, TikTok)',
        'Run paid advertising campaigns (Google Ads, Facebook Ads)',
        'Optimize marketplace SEO and product discoverability',
        'Create email marketing campaigns using SendGrid/Resend',
        'Analyze marketing metrics using Google Analytics',
        'Build partnerships with Kenyan cycling clubs and communities',
        'Manage influencer relationships in the cycling space',
        'Develop promotional campaigns for different cycling seasons'
      ],
      requirements: [
        'Bachelor\'s degree in Marketing, Communications, or related field',
        '2+ years of digital marketing experience (e-commerce preferred)',
        'Proven track record with social media marketing',
        'Experience with Google Ads, Facebook Ads, and analytics platforms',
        'Strong copywriting and content creation skills',
        'Understanding of SEO and marketplace optimization',
        'Knowledge of Kenyan cycling community is a major plus',
        'Data-driven approach to campaign optimization'
      ],
      benefits: [
        'Competitive salary package',
        'Marketing tools and software subscriptions',
        'Attendance at cycling events and conferences',
        'Creative freedom and autonomy',
        'Bicycle and cycling gear discounts',
        'Opportunity to shape a growing cycling brand'
      ]
    },
    {
      id: 8,
      title: 'Marketplace Vendor Success Manager',
      department: 'Operations',
      location: 'Nairobi, Kenya',
      type: 'Full-time',
      salary: 'KSh 75,000 - 115,000',
      experience: '2-3 years',
      description: 'Help bicycle sellers across Kenya succeed on our marketplace platform. Onboard new vendors, provide training, and ensure they maximize their sales potential on Oshocks.',
      responsibilities: [
        'Onboard new bicycle sellers to the marketplace',
        'Train vendors on platform features and best practices',
        'Help sellers optimize product listings and descriptions',
        'Assist with inventory management and order fulfillment',
        'Resolve seller issues and technical support queries',
        'Monitor seller performance metrics and provide insights',
        'Develop resources and documentation for sellers',
        'Build relationships with cycling shops across Kenya',
        'Identify opportunities for platform improvement'
      ],
      requirements: [
        'Bachelor\'s degree in Business, Marketing, or related field',
        '2+ years of account management or vendor relations experience',
        'Strong interpersonal and communication skills',
        'Understanding of e-commerce and marketplace dynamics',
        'Knowledge of cycling products and the Kenyan bicycle industry',
        'Problem-solving abilities and customer service mindset',
        'Proficiency with CRM tools and data analysis',
        'Ability to travel occasionally across Kenya'
      ],
      benefits: [
        'Competitive salary',
        'Travel allowance for vendor visits',
        'Financial Guidance',
        'Performance-based bonuses',
        'Bicycle discounts',
        'Impact on growing Kenya\'s cycling economy'
      ]
    }
  ];

  const departments = ['all', 'Engineering', 'Marketing', 'Customer Support', 'Operations', 'Product', 'Technical'];
  const locations = ['all', 'Nairobi, Kenya', 'Remote'];

  const companyValues = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Customer First',
      description: 'We put our customers at the center of everything we do'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Collaboration',
      description: 'We believe in teamwork and supporting each other'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Innovation',
      description: 'We constantly seek better ways to serve our community'
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Excellence',
      description: 'We strive for quality in every aspect of our work'
    }
  ];

  const perks = [
    'Competitive Salaries',
    'Financial Guidance',
    'Flexible Hours',
    'Remote Work Options',
    'Professional Development',
    'Team Building Events',
    'Bike Discounts',
    'Performance Bonuses',
    'Paid Time Off',
    'Modern Office Space',
    'Free Coffee & Snacks',
    'Cycling Community'
  ];

  const filteredJobs = jobOpenings.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || job.department === selectedDepartment;
    const matchesLocation = selectedLocation === 'all' || job.location === selectedLocation;
    
    return matchesSearch && matchesDepartment && matchesLocation;
  });

  const handleApply = (jobId) => {
    alert(`Application form for job ID: ${jobId} would open here. Connect this to your application system.`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Join Our Team</h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">
            Help us revolutionize cycling e-commerce in Kenya
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-lg">
            <div className="flex items-center gap-2">
              <Briefcase className="w-6 h-6" />
              <span>{jobOpenings.length} Open Positions</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-6 h-6" />
              <span>Nairobi & Remote</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6" />
              <span>Growing Team</span>
            </div>
          </div>
        </div>
      </div>

      {/* Company Values */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {companyValues.map((value, index) => (
            <div key={index} className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4">
                {value.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Perks & Benefits */}
      <div className="bg-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Perks & Benefits</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            We believe in taking care of our team members with competitive benefits and a supportive work environment
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {perks.map((perk, index) => (
              <div key={index} className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                <ChevronRight className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-gray-900 font-medium">{perk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Job Listings Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Open Positions</h2>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search job titles..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>
                        {dept === 'all' ? 'All Departments' : dept}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    {locations.map(loc => (
                      <option key={loc} value={loc}>
                        {loc === 'all' ? 'All Locations' : loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Job Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredJobs.map(job => (
            <div
              key={job.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setSelectedJob(job)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {job.department}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      {job.type}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 flex-shrink-0" />
                  <span>{job.salary}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>{job.experience} experience</span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedJob(job);
                }}
                className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                View Details
              </button>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No positions found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedDepartment('all');
                setSelectedLocation('all');
              }}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {selectedJob.department}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {selectedJob.type}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5 flex-shrink-0" />
                  <span>{selectedJob.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="w-5 h-5 flex-shrink-0" />
                  <span>{selectedJob.salary}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-5 h-5 flex-shrink-0" />
                  <span>{selectedJob.experience}</span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">About the Role</h3>
                  <p className="text-gray-600">{selectedJob.description}</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Responsibilities</h3>
                  <ul className="space-y-2">
                    {selectedJob.responsibilities.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-600">
                        <ChevronRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Requirements</h3>
                  <ul className="space-y-2">
                    {selectedJob.requirements.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-600">
                        <ChevronRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Benefits</h3>
                  <ul className="space-y-2">
                    {selectedJob.benefits.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-600">
                        <ChevronRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button
                  onClick={() => handleApply(selectedJob.id)}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Apply Now
                </button>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Don't See a Perfect Fit?</h2>
          <p className="text-xl text-blue-100 mb-8">
            We're always looking for talented individuals. Send us your CV and let us know how you can contribute to our mission.
          </p>
          <button className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Send General Application
          </button>
        </div>
      </div>
    </div>
  );
};

export default Careers;