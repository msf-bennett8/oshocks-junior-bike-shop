import { useState } from 'react';
import { CheckCircle, Truck, DollarSign, Clock, MapPin, Shield, Upload, X, AlertCircle, Phone, Mail, User, Calendar, FileText, Award, Navigation, Home, Briefcase, ChevronRight, Star, TrendingUp, Users } from 'lucide-react';

const BecomeDeliveryAgent = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    idNumber: '',
    gender: '',
    
    // Address Information
    county: '',
    subCounty: '',
    ward: '',
    street: '',
    building: '',
    
    // Vehicle Information
    vehicleType: '',
    vehicleNumber: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    hasInsurance: '',
    insuranceExpiry: '',
    
    // License Information
    hasLicense: '',
    licenseNumber: '',
    licenseExpiry: '',
    licenseCategory: '',
    
    // Experience & Availability
    hasExperience: '',
    yearsExperience: '',
    previousCompanies: '',
    deliveryZones: [],
    availability: [],
    startDate: '',
    
    // Documents
    idDocument: null,
    licenseDocument: null,
    vehicleDocument: null,
    insuranceDocument: null,
    profilePhoto: null,
    
    // Emergency Contact
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: '',
    
    // Terms
    agreeTerms: false,
    agreeBackground: false
  });

  const [uploadedFiles, setUploadedFiles] = useState({
    idDocument: null,
    licenseDocument: null,
    vehicleDocument: null,
    insuranceDocument: null,
    profilePhoto: null
  });

  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);

  const kenyaCounties = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Kiambu', 'Machakos', 'Kajiado',
    'Thika', 'Eldoret', 'Nyeri', 'Meru', 'Kisii', 'Kakamega', 'Bungoma'
  ];

  const vehicleTypes = ['Motorcycle', 'Bicycle', 'Van', 'Truck', 'Car'];
  
  const deliveryZonesList = [
    'Nairobi CBD', 'Westlands', 'Kilimani', 'Parklands', 'Karen', 'Langata',
    'Kasarani', 'Roysambu', 'Thome', 'Embakasi', 'Donholm', 'Pipeline',
    'Kileleshwa', 'Lavington', 'Upperhill', 'Hurlingham', 'Ngong Road',
    'Industrial Area', 'South B', 'South C', 'Imara Daima'
  ];

  const availabilityOptions = [
    'Monday - Friday (8AM - 5PM)',
    'Monday - Friday (5PM - 10PM)',
    'Weekends (8AM - 8PM)',
    'Full Time (All Days)',
    'Night Shifts',
    'Flexible Hours'
  ];

  const benefits = [
    {
      icon: DollarSign,
      title: 'Competitive Earnings',
      description: 'Earn KES 50,000 - 150,000 per month based on deliveries completed'
    },
    {
      icon: Clock,
      title: 'Flexible Schedule',
      description: 'Choose your working hours and days. Work when it suits you best'
    },
    {
      icon: MapPin,
      title: 'Choose Your Zones',
      description: 'Select delivery areas you know best and are comfortable with'
    },
    {
      icon: Shield,
      title: 'Insurance Coverage',
      description: 'Comprehensive insurance coverage for you and your vehicle'
    },
    {
      icon: TrendingUp,
      title: 'Growth Opportunities',
      description: 'Bonuses, incentives, and opportunities to grow with the company'
    },
    {
      icon: Users,
      title: 'Support Team',
      description: '24/7 support team available to help with any issues or questions'
    }
  ];

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Address', icon: Home },
    { number: 3, title: 'Vehicle Info', icon: Truck },
    { number: 4, title: 'Experience', icon: Briefcase },
    { number: 5, title: 'Documents', icon: FileText },
    { number: 6, title: 'Review', icon: CheckCircle }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleZoneToggle = (zone) => {
    setFormData(prev => ({
      ...prev,
      deliveryZones: prev.deliveryZones.includes(zone)
        ? prev.deliveryZones.filter(z => z !== zone)
        : [...prev.deliveryZones, zone]
    }));
  };

  const handleAvailabilityToggle = (slot) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(slot)
        ? prev.availability.filter(s => s !== slot)
        : [...prev.availability, slot]
    }));
  };

  const handleFileUpload = (field, event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFiles(prev => ({ ...prev, [field]: file }));
      handleInputChange(field, file);
    }
  };

  const removeFile = (field) => {
    setUploadedFiles(prev => ({ ...prev, [field]: null }));
    handleInputChange(field, null);
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.phone) newErrors.phone = 'Phone number is required';
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.idNumber) newErrors.idNumber = 'ID number is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
    }

    if (step === 2) {
      if (!formData.county) newErrors.county = 'County is required';
      if (!formData.street) newErrors.street = 'Street is required';
    }

    if (step === 3) {
      if (!formData.vehicleType) newErrors.vehicleType = 'Vehicle type is required';
      if (formData.vehicleType !== 'Bicycle') {
        if (!formData.vehicleNumber) newErrors.vehicleNumber = 'Vehicle number is required';
      }
    }

    if (step === 4) {
      if (!formData.hasExperience) newErrors.hasExperience = 'Please select experience';
      if (formData.deliveryZones.length === 0) newErrors.deliveryZones = 'Select at least one zone';
      if (formData.availability.length === 0) newErrors.availability = 'Select availability';
    }

    if (step === 5) {
      if (!uploadedFiles.idDocument) newErrors.idDocument = 'ID document is required';
      if (!uploadedFiles.profilePhoto) newErrors.profilePhoto = 'Profile photo is required';
      if (formData.hasLicense === 'yes' && !uploadedFiles.licenseDocument) {
        newErrors.licenseDocument = 'License document is required';
      }
    }

    if (step === 6) {
      if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to terms';
      if (!formData.agreeBackground) newErrors.agreeBackground = 'You must agree to background check';
      if (!formData.emergencyName) newErrors.emergencyName = 'Emergency contact name required';
      if (!formData.emergencyPhone) newErrors.emergencyPhone = 'Emergency contact phone required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(6)) {
      return;
    }

    setSubmitStatus('loading');

    // Simulate API call
    setTimeout(() => {
      setSubmitStatus('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 2000);
  };

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted Successfully!</h1>
          <p className="text-lg text-gray-600 mb-6">
            Thank you for applying to become a delivery agent with Oshocks Junior Bike Shop.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">What Happens Next?</h3>
            <ul className="text-left text-blue-800 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>Our team will review your application within 2-3 business days</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>We'll verify your documents and conduct a background check</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>You'll receive an email with the next steps and interview schedule</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>Once approved, you'll receive training and onboarding materials</span>
              </li>
            </ul>
          </div>
          <p className="text-gray-600 mb-6">
            Application Reference: <span className="font-bold text-gray-900">OSH-{Date.now().toString().slice(-8)}</span>
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Become a Delivery Agent</h1>
            <p className="text-xl text-blue-100 mb-8">
              Join our growing team of delivery professionals and earn on your own schedule
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div>
                <div className="text-3xl font-bold">50K - 150K</div>
                <div className="text-blue-100">Monthly Earnings</div>
              </div>
              <div>
                <div className="text-3xl font-bold">500+</div>
                <div className="text-blue-100">Active Agents</div>
              </div>
              <div>
                <div className="text-3xl font-bold">4.8★</div>
                <div className="text-blue-100">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Join Us?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <benefit.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Application Form */}
      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-colors ${
                        currentStep >= step.number
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {currentStep > step.number ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <step.icon className="w-6 h-6" />
                      )}
                    </div>
                    <span className="text-xs mt-2 text-gray-600 hidden md:block">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 w-8 md:w-16 mx-2 transition-colors ${
                        currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Kamau"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+254 712 345 678"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.dateOfBirth && (
                      <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.idNumber}
                      onChange={(e) => handleInputChange('idNumber', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.idNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="12345678"
                    />
                    {errors.idNumber && (
                      <p className="mt-1 text-sm text-red-500">{errors.idNumber}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={formData.gender === 'male'}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          className="mr-2"
                        />
                        Male
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={formData.gender === 'female'}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          className="mr-2"
                        />
                        Female
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          value="other"
                          checked={formData.gender === 'other'}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          className="mr-2"
                        />
                        Other
                      </label>
                    </div>
                    {errors.gender && (
                      <p className="mt-1 text-sm text-red-500">{errors.gender}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Address */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Address Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      County <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.county}
                      onChange={(e) => handleInputChange('county', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.county ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select County</option>
                      {kenyaCounties.map(county => (
                        <option key={county} value={county}>{county}</option>
                      ))}
                    </select>
                    {errors.county && (
                      <p className="mt-1 text-sm text-red-500">{errors.county}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sub-County
                    </label>
                    <input
                      type="text"
                      value={formData.subCounty}
                      onChange={(e) => handleInputChange('subCounty', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter sub-county"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ward
                    </label>
                    <input
                      type="text"
                      value={formData.ward}
                      onChange={(e) => handleInputChange('ward', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter ward"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street/Road <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.street}
                      onChange={(e) => handleInputChange('street', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.street ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Kenyatta Avenue"
                    />
                    {errors.street && (
                      <p className="mt-1 text-sm text-red-500">{errors.street}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Building/Apartment
                    </label>
                    <input
                      type="text"
                      value={formData.building}
                      onChange={(e) => handleInputChange('building', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Building name or apartment number"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Vehicle Information */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Vehicle Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.vehicleType}
                      onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.vehicleType ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Vehicle Type</option>
                      {vehicleTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    {errors.vehicleType && (
                      <p className="mt-1 text-sm text-red-500">{errors.vehicleType}</p>
                    )}
                  </div>

                  {formData.vehicleType && formData.vehicleType !== 'Bicycle' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Vehicle Registration Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.vehicleNumber}
                          onChange={(e) => handleInputChange('vehicleNumber', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors.vehicleNumber ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="KCA 123A"
                        />
                        {errors.vehicleNumber && (
                          <p className="mt-1 text-sm text-red-500">{errors.vehicleNumber}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Vehicle Make
                        </label>
                        <input
                          type="text"
                          value={formData.vehicleMake}
                          onChange={(e) => handleInputChange('vehicleMake', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Honda, Toyota"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Vehicle Model
                        </label>
                        <input
                          type="text"
                          value={formData.vehicleModel}
                          onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., CB150, Hilux"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Year of Manufacture
                        </label>
                        <input
                          type="number"
                          value={formData.vehicleYear}
                          onChange={(e) => handleInputChange('vehicleYear', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="2020"
                          min="1990"
                          max={new Date().getFullYear()}
                        />
                      </div>
                    </>
                  )}

                  {formData.vehicleType && formData.vehicleType !== 'Bicycle' && (
                    <>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Do you have valid insurance? <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="hasInsurance"
                              value="yes"
                              checked={formData.hasInsurance === 'yes'}
                              onChange={(e) => handleInputChange('hasInsurance', e.target.value)}
                              className="mr-2"
                            />
                            Yes
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="hasInsurance"
                              value="no"
                              checked={formData.hasInsurance === 'no'}
                              onChange={(e) => handleInputChange('hasInsurance', e.target.value)}
                              className="mr-2"
                            />
                            No
                          </label>
                        </div>
                      </div>

                      {formData.hasInsurance === 'yes' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Insurance Expiry Date
                          </label>
                          <input
                            type="date"
                            value={formData.insuranceExpiry}
                            onChange={(e) => handleInputChange('insuranceExpiry', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}
                    </>
                  )}

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Do you have a valid driving license? <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="hasLicense"
                          value="yes"
                          checked={formData.hasLicense === 'yes'}
                          onChange={(e) => handleInputChange('hasLicense', e.target.value)}
                          className="mr-2"
                        />
                        Yes
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="hasLicense"
                          value="no"
                          checked={formData.hasLicense === 'no'}
                          onChange={(e) => handleInputChange('hasLicense', e.target.value)}
                          className="mr-2"
                        />
                        No
                      </label>
                    </div>
                  </div>

                  {formData.hasLicense === 'yes' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          License Number
                        </label>
                        <input
                          type="text"
                          value={formData.licenseNumber}
                          onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="DL-123456"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          License Category
                        </label>
                        <select
                          value={formData.licenseCategory}
                          onChange={(e) => handleInputChange('licenseCategory', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Category</option>
                          <option value="A">A - Motorcycles</option>
                          <option value="B">B - Light Vehicles</option>
                          <option value="C">C - Medium Vehicles</option>
                          <option value="D">D - Heavy Vehicles</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          License Expiry Date
                        </label>
                        <input
                          type="date"
                          value={formData.licenseExpiry}
                          onChange={(e) => handleInputChange('licenseExpiry', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Experience & Availability */}
            {currentStep === 4 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Experience & Availability</h2>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do you have delivery experience? <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="hasExperience"
                        value="yes"
                        checked={formData.hasExperience === 'yes'}
                        onChange={(e) => handleInputChange('hasExperience', e.target.value)}
                        className="mr-2"
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="hasExperience"
                        value="no"
                        checked={formData.hasExperience === 'no'}
                        onChange={(e) => handleInputChange('hasExperience', e.target.value)}
                        className="mr-2"
                      />
                      No
                    </label>
                  </div>
                  {errors.hasExperience && (
                    <p className="mt-1 text-sm text-red-500">{errors.hasExperience}</p>
                  )}
                </div>

                {formData.hasExperience === 'yes' && (
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        value={formData.yearsExperience}
                        onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="2"
                        min="0"
                        max="50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Previous Companies (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.previousCompanies}
                        onChange={(e) => handleInputChange('previousCompanies', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Company names, separated by commas"
                      />
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Preferred Delivery Zones <span className="text-red-500">*</span> (Select at least one)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                    {deliveryZonesList.map(zone => (
                      <label key={zone} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.deliveryZones.includes(zone)}
                          onChange={() => handleZoneToggle(zone)}
                          className="mr-2"
                        />
                        <span className="text-sm">{zone}</span>
                      </label>
                    ))}
                  </div>
                  {errors.deliveryZones && (
                    <p className="mt-1 text-sm text-red-500">{errors.deliveryZones}</p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Availability <span className="text-red-500">*</span> (Select your preferred working hours)
                  </label>
                  <div className="space-y-2">
                    {availabilityOptions.map(slot => (
                      <label key={slot} className="flex items-center cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={formData.availability.includes(slot)}
                          onChange={() => handleAvailabilityToggle(slot)}
                          className="mr-3"
                        />
                        <span className="text-sm">{slot}</span>
                      </label>
                    ))}
                  </div>
                  {errors.availability && (
                    <p className="mt-1 text-sm text-red-500">{errors.availability}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    When can you start?
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            )}

            {/* Step 5: Documents */}
            {currentStep === 5 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Documents</h2>
                <p className="text-gray-600 mb-6">Please upload clear, readable copies of the following documents:</p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      National ID or Passport <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                      {uploadedFiles.idDocument ? (
                        <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8 text-blue-600" />
                            <div className="text-left">
                              <p className="font-medium text-gray-900">{uploadedFiles.idDocument.name}</p>
                              <p className="text-sm text-gray-500">{(uploadedFiles.idDocument.size / 1024).toFixed(2)} KB</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile('idDocument')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                          <p className="text-sm text-gray-500">PDF, JPG, PNG up to 5MB</p>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload('idDocument', e)}
                            className="hidden"
                            id="idDocument"
                          />
                          <label
                            htmlFor="idDocument"
                            className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700"
                          >
                            Choose File
                          </label>
                        </>
                      )}
                    </div>
                    {errors.idDocument && (
                      <p className="mt-1 text-sm text-red-500">{errors.idDocument}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Photo <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                      {uploadedFiles.profilePhoto ? (
                        <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8 text-blue-600" />
                            <div className="text-left">
                              <p className="font-medium text-gray-900">{uploadedFiles.profilePhoto.name}</p>
                              <p className="text-sm text-gray-500">{(uploadedFiles.profilePhoto.size / 1024).toFixed(2)} KB</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile('profilePhoto')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600 mb-2">Upload a clear passport-size photo</p>
                          <p className="text-sm text-gray-500">JPG, PNG up to 5MB</p>
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload('profilePhoto', e)}
                            className="hidden"
                            id="profilePhoto"
                          />
                          <label
                            htmlFor="profilePhoto"
                            className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700"
                          >
                            Choose File
                          </label>
                        </>
                      )}
                    </div>
                    {errors.profilePhoto && (
                      <p className="mt-1 text-sm text-red-500">{errors.profilePhoto}</p>
                    )}
                  </div>

                  {formData.hasLicense === 'yes' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Driving License <span className="text-red-500">*</span>
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                        {uploadedFiles.licenseDocument ? (
                          <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="w-8 h-8 text-blue-600" />
                              <div className="text-left">
                                <p className="font-medium text-gray-900">{uploadedFiles.licenseDocument.name}</p>
                                <p className="text-sm text-gray-500">{(uploadedFiles.licenseDocument.size / 1024).toFixed(2)} KB</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile('licenseDocument')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600 mb-2">Upload both sides of your license</p>
                            <p className="text-sm text-gray-500">PDF, JPG, PNG up to 5MB</p>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileUpload('licenseDocument', e)}
                              className="hidden"
                              id="licenseDocument"
                            />
                            <label
                              htmlFor="licenseDocument"
                              className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700"
                            >
                              Choose File
                            </label>
                          </>
                        )}
                      </div>
                      {errors.licenseDocument && (
                        <p className="mt-1 text-sm text-red-500">{errors.licenseDocument}</p>
                      )}
                    </div>
                  )}

                  {formData.vehicleType && formData.vehicleType !== 'Bicycle' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Vehicle Registration/Logbook (Optional)
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                          {uploadedFiles.vehicleDocument ? (
                            <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
                              <div className="flex items-center gap-3">
                                <FileText className="w-8 h-8 text-blue-600" />
                                <div className="text-left">
                                  <p className="font-medium text-gray-900">{uploadedFiles.vehicleDocument.name}</p>
                                  <p className="text-sm text-gray-500">{(uploadedFiles.vehicleDocument.size / 1024).toFixed(2)} KB</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile('vehicleDocument')}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileUpload('vehicleDocument', e)}
                                className="hidden"
                                id="vehicleDocument"
                              />
                              <label
                                htmlFor="vehicleDocument"
                                className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700"
                              >
                                Choose File
                              </label>
                            </>
                          )}
                        </div>
                      </div>

                      {formData.hasInsurance === 'yes' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Insurance Certificate (Optional)
                          </label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                            {uploadedFiles.insuranceDocument ? (
                              <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <FileText className="w-8 h-8 text-blue-600" />
                                  <div className="text-left">
                                    <p className="font-medium text-gray-900">{uploadedFiles.insuranceDocument.name}</p>
                                    <p className="text-sm text-gray-500">{(uploadedFiles.insuranceDocument.size / 1024).toFixed(2)} KB</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFile('insuranceDocument')}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => handleFileUpload('insuranceDocument', e)}
                                  className="hidden"
                                  id="insuranceDocument"
                                />
                                <label
                                  htmlFor="insuranceDocument"
                                  className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700"
                                >
                                  Choose File
                                </label>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Step 6: Review & Submit */}
            {currentStep === 6 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Submit</h2>

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Emergency Contact</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.emergencyName}
                        onChange={(e) => handleInputChange('emergencyName', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors.emergencyName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter emergency contact name"
                      />
                      {errors.emergencyName && (
                        <p className="mt-1 text-sm text-red-500">{errors.emergencyName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.emergencyPhone}
                        onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors.emergencyPhone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="+254 712 345 678"
                      />
                      {errors.emergencyPhone && (
                        <p className="mt-1 text-sm text-red-500">{errors.emergencyPhone}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Relationship
                      </label>
                      <input
                        type="text"
                        value={formData.emergencyRelation}
                        onChange={(e) => handleInputChange('emergencyRelation', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Spouse, Parent, Sibling"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Application Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{formData.firstName} {formData.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{formData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{formData.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{formData.county}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vehicle Type:</span>
                      <span className="font-medium">{formData.vehicleType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Zones:</span>
                      <span className="font-medium">{formData.deliveryZones.length} selected</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreeTerms}
                      onChange={(e) => handleInputChange('agreeTerms', e.target.checked)}
                      className="mt-1 mr-3"
                    />
                    <span className="text-sm text-gray-700">
                      I agree to the <a href="#" className="text-blue-600 hover:underline">Terms and Conditions</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a> <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {errors.agreeTerms && (
                    <p className="ml-6 text-sm text-red-500">{errors.agreeTerms}</p>
                  )}

                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreeBackground}
                      onChange={(e) => handleInputChange('agreeBackground', e.target.checked)}
                      className="mt-1 mr-3"
                    />
                    <span className="text-sm text-gray-700">
                      I consent to a background check and verification of my documents <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {errors.agreeBackground && (
                    <p className="ml-6 text-sm text-red-500">{errors.agreeBackground}</p>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900 mb-1">Before you submit:</p>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Double-check all information is accurate</li>
                        <li>• Ensure all required documents are uploaded</li>
                        <li>• Verify your contact details are correct</li>
                        <li>• Review will take 2-3 business days</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold"
                >
                  Previous
                </button>
              )}

              {currentStep < 6 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className={`flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold ${
                    currentStep === 1 ? 'ml-auto' : ''
                  }`}
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitStatus === 'loading'}
                  className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                >
                  {submitStatus === 'loading' ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Submit Application
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What are the minimum requirements?</h3>
                <p className="text-gray-600">
                  You must be at least 18 years old, have a valid Kenyan ID, own or have access to a vehicle (motorcycle, bicycle, or van), 
                  and have a smartphone with internet access. A driving license is required for motorized vehicles.
                </p>
              </div>

              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How long does the application process take?</h3>
                <p className="text-gray-600">
                  The review process typically takes 2-3 business days. Once approved, you'll receive training materials and can start 
                  accepting deliveries within a week.
                </p>
              </div>

              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How much can I earn?</h3>
                <p className="text-gray-600">
                  Earnings vary based on the number of deliveries completed, distance, and time. On average, agents earn between KES 50,000 
                  to KES 150,000 per month. You also get bonuses for high ratings and completing milestones.
                </p>
              </div>

              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Do I need my own vehicle?</h3>
                <p className="text-gray-600">
                  Yes, you need access to a working vehicle (motorcycle, bicycle, van, or car). For motorized vehicles, you must have 
                  valid insurance and registration.
                </p>
              </div>

              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What support do you provide?</h3>
                <p className="text-gray-600">
                  We provide comprehensive training, insurance coverage, 24/7 support team, protective gear, and access to our mobile app 
                  for managing deliveries. You'll also have a dedicated account manager.
                </p>
              </div>

              <div className="pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I work part-time?</h3>
                <p className="text-gray-600">
                  Absolutely! You choose your own schedule. Many of our agents work part-time, especially during evenings and weekends. 
                  The platform is flexible to accommodate your availability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Support Section */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help with Your Application?</h2>
            <p className="text-gray-600 mb-6">
              Our recruitment team is here to answer any questions you may have
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <a
                href="tel:+254712345678"
                className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Phone className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <p className="text-xs text-gray-500">Call Us</p>
                  <p className="font-semibold text-gray-900">+254 712 345 678</p>
                </div>
              </a>
              <a
                href="mailto:careers@oshocks.com"
                className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Mail className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <p className="text-xs text-gray-500">Email Us</p>
                  <p className="font-semibold text-gray-900">careers@oshocks.com</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeDeliveryAgent;