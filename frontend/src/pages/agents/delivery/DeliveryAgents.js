import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Star, Package, TrendingUp, Award, ChevronDown, Users, Clock, CheckCircle, XCircle, AlertCircle, Phone, Mail, Truck, Navigation, BarChart3, Calendar, Download, Upload, Eye, Edit, Trash2, Plus, X, Activity } from 'lucide-react';

const DeliveryAgents = () => {
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('cards');
  const [sortBy, setSortBy] = useState('performance');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    totalAgents: 0,
    activeAgents: 0,
    onDelivery: 0,
    avgRating: 0,
    totalDeliveries: 0
  });
  
  const [filters, setFilters] = useState({
    status: '',
    location: '',
    minRating: 0,
    availability: '',
    vehicleType: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    vehicleType: '',
    vehicleNumber: '',
    licenseNumber: '',
    idNumber: ''
  });

  useEffect(() => {
    const mockAgents = [
      {
        id: 1,
        name: 'John Kamau',
        email: 'john.kamau@oshocks.com',
        phone: '+254 712 345 678',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        status: 'active',
        availability: 'available',
        location: 'Nairobi CBD',
        rating: 4.9,
        reviewCount: 342,
        totalDeliveries: 1247,
        completedToday: 12,
        onTimeRate: 98,
        vehicleType: 'Motorcycle',
        vehicleNumber: 'KCA 123A',
        licenseNumber: 'DL-123456',
        joinedDate: '2023-01-15',
        lastActive: '2 mins ago',
        currentDelivery: 'Order #12456',
        earnings: 125000,
        zones: ['Nairobi CBD', 'Westlands', 'Kilimani']
      },
      {
        id: 2,
        name: 'Mary Wanjiku',
        email: 'mary.wanjiku@oshocks.com',
        phone: '+254 723 456 789',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        status: 'active',
        availability: 'on-delivery',
        location: 'Westlands',
        rating: 4.8,
        reviewCount: 298,
        totalDeliveries: 987,
        completedToday: 8,
        onTimeRate: 96,
        vehicleType: 'Bicycle',
        vehicleNumber: 'N/A',
        licenseNumber: 'N/A',
        joinedDate: '2023-02-20',
        lastActive: 'Active now',
        currentDelivery: 'Order #12457',
        earnings: 98000,
        zones: ['Westlands', 'Parklands', 'Highridge']
      },
      {
        id: 3,
        name: 'David Ochieng',
        email: 'david.ochieng@oshocks.com',
        phone: '+254 734 567 890',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
        status: 'active',
        availability: 'available',
        location: 'Karen',
        rating: 4.7,
        reviewCount: 456,
        totalDeliveries: 1456,
        completedToday: 15,
        onTimeRate: 95,
        vehicleType: 'Van',
        vehicleNumber: 'KCB 456C',
        licenseNumber: 'DL-234567',
        joinedDate: '2022-11-10',
        lastActive: '5 mins ago',
        currentDelivery: null,
        earnings: 156000,
        zones: ['Karen', 'Langata', 'Ngong Road']
      },
      {
        id: 4,
        name: 'Grace Akinyi',
        email: 'grace.akinyi@oshocks.com',
        phone: '+254 745 678 901',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
        status: 'active',
        availability: 'on-delivery',
        location: 'Kasarani',
        rating: 4.9,
        reviewCount: 523,
        totalDeliveries: 1678,
        completedToday: 10,
        onTimeRate: 99,
        vehicleType: 'Motorcycle',
        vehicleNumber: 'KCC 789D',
        licenseNumber: 'DL-345678',
        joinedDate: '2022-08-05',
        lastActive: 'Active now',
        currentDelivery: 'Order #12458',
        earnings: 189000,
        zones: ['Kasarani', 'Roysambu', 'Thome']
      },
      {
        id: 5,
        name: 'Peter Mwangi',
        email: 'peter.mwangi@oshocks.com',
        phone: '+254 756 789 012',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
        status: 'inactive',
        availability: 'unavailable',
        location: 'Thika',
        rating: 4.5,
        reviewCount: 234,
        totalDeliveries: 678,
        completedToday: 0,
        onTimeRate: 92,
        vehicleType: 'Motorcycle',
        vehicleNumber: 'KCD 234E',
        licenseNumber: 'DL-456789',
        joinedDate: '2023-05-12',
        lastActive: '2 days ago',
        currentDelivery: null,
        earnings: 67000,
        zones: ['Thika', 'Ruiru', 'Juja']
      },
      {
        id: 6,
        name: 'Susan Njeri',
        email: 'susan.njeri@oshocks.com',
        phone: '+254 767 890 123',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        status: 'active',
        availability: 'on-break',
        location: 'Kileleshwa',
        rating: 4.8,
        reviewCount: 389,
        totalDeliveries: 1123,
        completedToday: 7,
        onTimeRate: 97,
        vehicleType: 'Bicycle',
        vehicleNumber: 'N/A',
        licenseNumber: 'N/A',
        joinedDate: '2023-03-18',
        lastActive: '30 mins ago',
        currentDelivery: null,
        earnings: 112000,
        zones: ['Kileleshwa', 'Lavington', 'Valley Arcade']
      }
    ];

    setTimeout(() => {
      setAgents(mockAgents);
      setFilteredAgents(mockAgents);
      
      const activeCount = mockAgents.filter(a => a.status === 'active').length;
      const onDeliveryCount = mockAgents.filter(a => a.availability === 'on-delivery').length;
      const avgRating = mockAgents.reduce((sum, a) => sum + a.rating, 0) / mockAgents.length;
      const totalDeliveries = mockAgents.reduce((sum, a) => sum + a.totalDeliveries, 0);
      
      setStats({
        totalAgents: mockAgents.length,
        activeAgents: activeCount,
        onDelivery: onDeliveryCount,
        avgRating: avgRating.toFixed(1),
        totalDeliveries
      });
      
      setLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    let result = [...agents];

    if (searchTerm) {
      result = result.filter(agent =>
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.phone.includes(searchTerm) ||
        agent.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.status) {
      result = result.filter(agent => agent.status === filters.status);
    }

    if (filters.location) {
      result = result.filter(agent =>
        agent.location.toLowerCase().includes(filters.location.toLowerCase()) ||
        agent.zones.some(zone => zone.toLowerCase().includes(filters.location.toLowerCase()))
      );
    }

    if (filters.minRating > 0) {
      result = result.filter(agent => agent.rating >= filters.minRating);
    }

    if (filters.availability) {
      result = result.filter(agent => agent.availability === filters.availability);
    }

    if (filters.vehicleType) {
      result = result.filter(agent => agent.vehicleType === filters.vehicleType);
    }

    switch (sortBy) {
      case 'performance':
        result.sort((a, b) => b.onTimeRate - a.onTimeRate);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'deliveries':
        result.sort((a, b) => b.totalDeliveries - a.totalDeliveries);
        break;
      case 'earnings':
        result.sort((a, b) => b.earnings - a.earnings);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    setFilteredAgents(result);
  }, [searchTerm, filters, sortBy, agents]);

  const clearFilters = () => {
    setFilters({
      status: '',
      location: '',
      minRating: 0,
      availability: '',
      vehicleType: ''
    });
    setSearchTerm('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'available':
        return 'bg-green-500';
      case 'on-delivery':
        return 'bg-blue-500';
      case 'on-break':
        return 'bg-yellow-500';
      case 'unavailable':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getAvailabilityText = (availability) => {
    switch (availability) {
      case 'available':
        return 'Available';
      case 'on-delivery':
        return 'On Delivery';
      case 'on-break':
        return 'On Break';
      case 'unavailable':
        return 'Unavailable';
      default:
        return 'Unknown';
    }
  };

  const openModal = (type, agent = null) => {
    setModalType(type);
    setSelectedAgent(agent);
    if (agent && type === 'edit') {
      setFormData({
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        location: agent.location,
        vehicleType: agent.vehicleType,
        vehicleNumber: agent.vehicleNumber,
        licenseNumber: agent.licenseNumber,
        idNumber: ''
      });
    } else if (type === 'add') {
      setFormData({
        name: '',
        email: '',
        phone: '',
        location: '',
        vehicleType: '',
        vehicleNumber: '',
        licenseNumber: '',
        idNumber: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAgent(null);
    setModalType('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    closeModal();
  };

  const handleDelete = (agentId) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      console.log('Delete agent:', agentId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading delivery agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Delivery Agents</h1>
              <p className="text-blue-100">Manage your delivery workforce</p>
            </div>
            <button
              onClick={() => openModal('add')}
              className="mt-4 md:mt-0 flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add New Agent
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Agents</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalAgents}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Now</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.activeAgents}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">On Delivery</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.onDelivery}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Truck className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg Rating</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.avgRating}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Deliveries</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{stats.totalDeliveries.toLocaleString()}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Package className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-4 py-3 rounded-lg border ${
                  viewMode === 'cards'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-3 rounded-lg border ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Table
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-5 h-5" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            <button className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Download className="w-5 h-5" />
              Export
            </button>
          </div>

          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="performance">Performance</option>
                    <option value="rating">Highest Rated</option>
                    <option value="deliveries">Most Deliveries</option>
                    <option value="earnings">Highest Earnings</option>
                    <option value="name">Name (A-Z)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                  <select
                    value={filters.availability}
                    onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All</option>
                    <option value="available">Available</option>
                    <option value="on-delivery">On Delivery</option>
                    <option value="on-break">On Break</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                  <select
                    value={filters.vehicleType}
                    onChange={(e) => setFilters({ ...filters, vehicleType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Vehicles</option>
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Bicycle">Bicycle</option>
                    <option value="Van">Van</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Rating: {filters.minRating > 0 ? filters.minRating.toFixed(1) : 'Any'}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={filters.minRating}
                    onChange={(e) => setFilters({ ...filters, minRating: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Filter by location..."
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredAgents.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{agents.length}</span> agents
          </p>
        </div>

        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAgents.map((agent) => (
              <div key={agent.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={agent.avatar}
                          alt={agent.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${getAvailabilityColor(agent.availability)}`}></div>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{agent.name}</h3>
                        <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(agent.status)}`}>
                          {agent.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {agent.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Truck className="w-4 h-4" />
                      {agent.vehicleType}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      {agent.lastActive}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4 pb-4 border-b">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-gray-900">{agent.rating}</span>
                      <span className="text-sm text-gray-500">({agent.reviewCount})</span>
                    </div>
                    <span className="text-sm font-semibold text-green-600">{agent.onTimeRate}%</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Total Deliveries</p>
                      <p className="text-lg font-bold text-gray-900">{agent.totalDeliveries}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Today</p>
                      <p className="text-lg font-bold text-blue-600">{agent.completedToday}</p>
                    </div>
                  </div>

                  {agent.currentDelivery && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-600 font-semibold mb-1">Current Delivery</p>
                      <p className="text-sm text-gray-900">{agent.currentDelivery}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal('view', agent)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => openModal('edit', agent)}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(agent.id)}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Agent</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Vehicle</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Rating</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Deliveries</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">On-Time</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Earnings</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAgents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={agent.avatar}
                              alt={agent.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getAvailabilityColor(agent.availability)}`}></div>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{agent.name}</p>
                            <p className="text-sm text-gray-500">{agent.location}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900">{agent.phone}</p>
                          <p className="text-gray-500">{agent.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(agent.status)}`}>
                            {agent.status}
                          </span>
                          <p className="text-xs text-gray-500">{getAvailabilityText(agent.availability)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900">{agent.vehicleType}</p>
                          <p className="text-gray-500">{agent.vehicleNumber}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-gray-900">{agent.rating}</span>
                          <span className="text-sm text-gray-500">({agent.reviewCount})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-semibold text-gray-900">{agent.totalDeliveries}</p>
                          <p className="text-gray-500">{agent.completedToday} today</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-green-600">{agent.onTimeRate}%</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900">KES {agent.earnings.toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openModal('view', agent)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openModal('edit', agent)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(agent.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredAgents.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No agents found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {modalType === 'view' && selectedAgent && (
              <div>
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={selectedAgent.avatar}
                          alt={selectedAgent.name}
                          className="w-20 h-20 rounded-full object-cover border-4 border-white"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white ${getAvailabilityColor(selectedAgent.availability)}`}></div>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{selectedAgent.name}</h2>
                        <p className="text-blue-100">{selectedAgent.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedAgent.status)}`}>
                            {selectedAgent.status}
                          </span>
                          <span className="text-sm text-blue-100">{getAvailabilityText(selectedAgent.availability)}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={closeModal}
                      className="text-white hover:bg-blue-700 p-2 rounded-lg"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-5 h-5 text-blue-600" />
                        <p className="text-sm text-gray-600">Rating</p>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{selectedAgent.rating}</p>
                      <p className="text-xs text-gray-500">{selectedAgent.reviewCount} reviews</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <p className="text-sm text-gray-600">On-Time Rate</p>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{selectedAgent.onTimeRate}%</p>
                      <p className="text-xs text-gray-500">Excellent</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-5 h-5 text-purple-600" />
                        <p className="text-sm text-gray-600">Deliveries</p>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{selectedAgent.totalDeliveries}</p>
                      <p className="text-xs text-gray-500">{selectedAgent.completedToday} today</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-yellow-600" />
                        <p className="text-sm text-gray-600">Earnings</p>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">KES {selectedAgent.earnings.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">This month</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Contact Information</h3>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-semibold text-gray-900">{selectedAgent.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-semibold text-gray-900">{selectedAgent.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Location</p>
                          <p className="font-semibold text-gray-900">{selectedAgent.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Joined</p>
                          <p className="font-semibold text-gray-900">{new Date(selectedAgent.joinedDate).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Vehicle Information</h3>
                      <div className="flex items-center gap-3">
                        <Truck className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Vehicle Type</p>
                          <p className="font-semibold text-gray-900">{selectedAgent.vehicleType}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Navigation className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Vehicle Number</p>
                          <p className="font-semibold text-gray-900">{selectedAgent.vehicleNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Award className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">License Number</p>
                          <p className="font-semibold text-gray-900">{selectedAgent.licenseNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Last Active</p>
                          <p className="font-semibold text-gray-900">{selectedAgent.lastActive}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Delivery Zones</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedAgent.zones.map((zone, idx) => (
                        <span key={idx} className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium">
                          {zone}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedAgent.currentDelivery && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-bold text-gray-900">Current Delivery</h3>
                      </div>
                      <p className="text-gray-700">{selectedAgent.currentDelivery}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        closeModal();
                        openModal('edit', selectedAgent);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Edit className="w-5 h-5" />
                      Edit Agent
                    </button>
                    <button
                      onClick={closeModal}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {(modalType === 'add' || modalType === 'edit') && (
              <div>
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">
                      {modalType === 'add' ? 'Add New Agent' : 'Edit Agent'}
                    </h2>
                    <button
                      onClick={closeModal}
                      className="text-white hover:bg-blue-700 p-2 rounded-lg"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter agent name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="agent@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+254 712 345 678"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Nairobi CBD"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vehicle Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.vehicleType}
                        onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select vehicle type</option>
                        <option value="Motorcycle">Motorcycle</option>
                        <option value="Bicycle">Bicycle</option>
                        <option value="Van">Van</option>
                        <option value="Truck">Truck</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vehicle Number
                      </label>
                      <input
                        type="text"
                        value={formData.vehicleNumber}
                        onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., KCA 123A"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        License Number
                      </label>
                      <input
                        type="text"
                        value={formData.licenseNumber}
                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., DL-123456"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ID Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.idNumber}
                        onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="National ID Number"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                    <button
                      type="submit"
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                    >
                      {modalType === 'add' ? (
                        <>
                          <Plus className="w-5 h-5" />
                          Add Agent
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryAgents;