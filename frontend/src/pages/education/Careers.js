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
      title: 'Senior Full Stack Developer',
      department: 'Engineering',
      location: 'Nairobi, Kenya',
      type: 'Full-time',
      salary: 'KSh 150,000 - 250,000',
      experience: '3-5 years',
      description: 'We are looking for an experienced Full Stack Developer to join our engineering team and help build the future of cycling e-commerce in Kenya.',
      responsibilities: [
        'Develop and maintain React.js frontend applications',
        'Build robust Laravel backend APIs and services',
        'Implement M-Pesa and payment gateway integrations',
        'Optimize database queries and application performance',
        'Collaborate with designers and product managers',
        'Write clean, maintainable, and well-documented code'
      ],
      requirements: [
        'Bachelor\'s degree in Computer Science or related field',
        '3+ years of experience with React.js and Laravel',
        'Strong knowledge of MySQL and database design',
        'Experience with RESTful API development',
        'Familiarity with payment integrations (M-Pesa, Stripe)',
        'Excellent problem-solving and communication skills'
      ],
      benefits: [
        'Competitive salary and performance bonuses',
        'Health insurance coverage',
        'Professional development opportunities',
        'Flexible working hours',
        'Remote work options'
      ]
    },
    {
      id: 2,
      title: 'Digital Marketing Manager',
      department: 'Marketing',
      location: 'Nairobi, Kenya',
      type: 'Full-time',
      salary: 'KSh 100,000 - 150,000',
      experience: '2-4 years',
      description: 'Join our marketing team to drive growth and brand awareness for Kenya\'s premier cycling marketplace.',
      responsibilities: [
        'Develop and execute digital marketing strategies',
        'Manage social media channels and content calendar',
        'Run paid advertising campaigns (Google Ads, Facebook)',
        'Analyze marketing metrics and optimize campaigns',
        'Collaborate with content creators and designers',
        'Build partnerships with cycling communities'
      ],
      requirements: [
        'Bachelor\'s degree in Marketing or related field',
        '2+ years of digital marketing experience',
        'Proven track record with social media marketing',
        'Experience with Google Analytics and advertising platforms',
        'Strong copywriting and communication skills',
        'Knowledge of the Kenyan cycling community is a plus'
      ],
      benefits: [
        'Competitive salary package',
        'Marketing tools and software subscriptions',
        'Conference and workshop attendance',
        'Creative freedom and autonomy',
        'Cycling gear discounts'
      ]
    },
    {
      id: 3,
      title: 'Customer Success Specialist',
      department: 'Customer Support',
      location: 'Nairobi, Kenya',
      type: 'Full-time',
      salary: 'KSh 60,000 - 90,000',
      experience: '1-3 years',
      description: 'Help our customers have an exceptional experience shopping for cycling products on our platform.',
      responsibilities: [
        'Respond to customer inquiries via chat, email, and phone',
        'Resolve customer issues and complaints efficiently',
        'Process orders, returns, and refunds',
        'Gather customer feedback and insights',
        'Maintain customer satisfaction metrics',
        'Create help documentation and FAQs'
      ],
      requirements: [
        'Diploma or Bachelor\'s degree in any field',
        '1+ years of customer service experience',
        'Excellent communication skills in English and Swahili',
        'Problem-solving mindset and patience',
        'Experience with CRM tools is a plus',
        'Passion for cycling and helping people'
      ],
      benefits: [
        'Competitive salary',
        'Training and development programs',
        'Health insurance',
        'Employee discounts',
        'Supportive team environment'
      ]
    },
    {
      id: 4,
      title: 'Logistics Coordinator',
      department: 'Operations',
      location: 'Nairobi, Kenya',
      type: 'Full-time',
      salary: 'KSh 70,000 - 110,000',
      experience: '2-3 years',
      description: 'Manage our delivery operations and ensure timely fulfillment of orders across Kenya.',
      responsibilities: [
        'Coordinate delivery schedules and routes',
        'Manage relationships with courier partners',
        'Track shipments and resolve delivery issues',
        'Optimize logistics processes for efficiency',
        'Maintain inventory accuracy',
        'Handle warehouse operations'
      ],
      requirements: [
        'Bachelor\'s degree in Supply Chain or related field',
        '2+ years of logistics experience',
        'Knowledge of Kenyan delivery landscape',
        'Strong organizational and planning skills',
        'Proficiency with logistics software',
        'Valid driving license is a plus'
      ],
      benefits: [
        'Competitive salary',
        'Transport allowance',
        'Health insurance',
        'Performance bonuses',
        'Career growth opportunities'
      ]
    },
    {
      id: 5,
      title: 'Product Manager',
      department: 'Product',
      location: 'Nairobi, Kenya',
      type: 'Full-time',
      salary: 'KSh 120,000 - 180,000',
      experience: '3-5 years',
      description: 'Lead product strategy and development for our e-commerce marketplace platform.',
      responsibilities: [
        'Define product vision and roadmap',
        'Conduct market research and user analysis',
        'Prioritize features and manage product backlog',
        'Work closely with engineering and design teams',
        'Monitor product metrics and KPIs',
        'Gather stakeholder and customer feedback'
      ],
      requirements: [
        'Bachelor\'s degree in Business or related field',
        '3+ years of product management experience',
        'Strong analytical and strategic thinking',
        'Experience with e-commerce platforms',
        'Excellent communication and leadership skills',
        'Understanding of Agile methodologies'
      ],
      benefits: [
        'Competitive salary and equity options',
        'Health insurance',
        'Professional development budget',
        'Flexible working arrangements',
        'Impact on product direction'
      ]
    },
    {
      id: 6,
      title: 'Bike Mechanic',
      department: 'Technical',
      location: 'Nairobi, Kenya',
      type: 'Full-time',
      salary: 'KSh 50,000 - 80,000',
      experience: '2+ years',
      description: 'Provide expert bicycle assembly, maintenance, and repair services for our customers.',
      responsibilities: [
        'Assemble new bicycles and check quality',
        'Perform bike repairs and maintenance',
        'Diagnose mechanical issues',
        'Advise customers on bike care',
        'Manage tools and spare parts inventory',
        'Create maintenance guides and tutorials'
      ],
      requirements: [
        'Certificate in bicycle mechanics or equivalent',
        '2+ years of hands-on bike repair experience',
        'Deep knowledge of bike components and systems',
        'Ability to work with various bike types',
        'Good customer service skills',
        'Physical fitness for manual work'
      ],
      benefits: [
        'Competitive salary',
        'Tools and equipment provided',
        'Training on new bike technologies',
        'Health insurance',
        'Employee bike discounts'
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
    'Health Insurance',
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