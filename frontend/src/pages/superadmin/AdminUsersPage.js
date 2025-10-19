import React, { useState } from 'react';
import { Search, Filter, UserPlus, MoreVertical, Mail, Phone, MapPin, Calendar, Shield, ShoppingBag, Ban, CheckCircle, Edit, Trash2, Eye, Download, Store, User } from 'lucide-react';

const AdminUsersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Mock users data - replace with API call
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'John Kamau',
      email: 'john.kamau@email.com',
      phone: '+254712345678',
      role: 'consumer',
      status: 'active',
      location: 'Nairobi',
      joinDate: '2024-01-15',
      totalOrders: 12,
      totalSpent: 145000,
      lastActive: '2025-10-08',
      avatar: 'JK',
      address: 'Kilimani, Nairobi'
    },
    {
      id: 2,
      name: 'Sarah Wanjiru',
      email: 'sarah.w@email.com',
      phone: '+254723456789',
      role: 'seller',
      status: 'active',
      location: 'Mombasa',
      joinDate: '2024-02-20',
      totalOrders: 156,
      totalSpent: 2340000,
      lastActive: '2025-10-10',
      avatar: 'SW',
      shopName: 'Kenya Cycles Ltd',
      productsListed: 45,
      totalSales: 2340000,
      commission: 234000
    },
    {
      id: 3,
      name: 'David Ochieng',
      email: 'david.o@email.com',
      phone: '+254734567890',
      role: 'consumer',
      status: 'active',
      location: 'Kisumu',
      joinDate: '2024-03-10',
      totalOrders: 8,
      totalSpent: 89000,
      lastActive: '2025-10-09',
      avatar: 'DO',
      address: 'Milimani, Kisumu'
    },
    {
      id: 4,
      name: 'Peter Mwangi',
      email: 'peter.m@email.com',
      phone: '+254756789012',
      role: 'seller',
      status: 'suspended',
      location: 'Nakuru',
      joinDate: '2024-04-12',
      totalOrders: 45,
      totalSpent: 678000,
      lastActive: '2025-09-28',
      avatar: 'PM',
      shopName: 'Nakuru Bike Shop',
      productsListed: 28,
      totalSales: 678000,
      commission: 67800
    },
    {
      id: 5,
      name: 'Grace Akinyi',
      email: 'grace.a@email.com',
      phone: '+254767890123',
      role: 'consumer',
      status: 'active',
      location: 'Eldoret',
      joinDate: '2024-05-08',
      totalOrders: 15,
      totalSpent: 178000,
      lastActive: '2025-10-07',
      avatar: 'GA',
      address: 'Pioneer Estate, Eldoret'
    },
    {
      id: 6,
      name: 'James Kipchoge',
      email: 'james.k@email.com',
      phone: '+254778901234',
      role: 'consumer',
      status: 'inactive',
      location: 'Thika',
      joinDate: '2024-02-28',
      totalOrders: 3,
      totalSpent: 42000,
      lastActive: '2025-08-15',
      avatar: 'JK',
      address: 'Blue Post, Thika'
    },
    {
      id: 7,
      name: 'Lucy Waithera',
      email: 'lucy.w@email.com',
      phone: '+254789012345',
      role: 'seller',
      status: 'active',
      location: 'Mombasa',
      joinDate: '2024-03-22',
      totalOrders: 89,
      totalSpent: 1234000,
      lastActive: '2025-10-09',
      avatar: 'LW',
      shopName: 'Mombasa Wheels',
      productsListed: 62,
      totalSales: 1234000,
      commission: 123400
    },
    {
      id: 8,
      name: 'Michael Otieno',
      email: 'michael.o@email.com',
      phone: '+254790123456',
      role: 'seller',
      status: 'active',
      location: 'Nairobi',
      joinDate: '2024-06-15',
      totalOrders: 67,
      totalSpent: 890000,
      lastActive: '2025-10-10',
      avatar: 'MO',
      shopName: 'Nairobi Bike Hub',
      productsListed: 38,
      totalSales: 890000,
      commission: 89000
    }
  ]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      seller: 'bg-blue-100 text-blue-800',
      consumer: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || colors.consumer;
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm);
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleStatusChange = (userId, newStatus) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setUsers(users.filter(user => user.id !== userId));
      if (showModal) setShowModal(false);
    }
  };

  const exportUsers = () => {
    alert('Exporting users to CSV... (This would trigger a download in production)');
  };

  const stats = [
    { label: 'Total Users', value: users.length, icon: Shield, color: 'bg-blue-500' },
    { label: 'Consumers', value: users.filter(u => u.role === 'consumer').length, icon: User, color: 'bg-green-500' },
    { label: 'Sellers', value: users.filter(u => u.role === 'seller').length, icon: Store, color: 'bg-purple-500' },
    { label: 'Suspended', value: users.filter(u => u.status === 'suspended').length, icon: Ban, color: 'bg-red-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
              <p className="text-gray-600">Manage consumers and sellers on your marketplace</p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <button 
                onClick={exportUsers}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                <Download size={18} />
                Export
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <UserPlus size={18} />
                Add User
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="text-white" size={24} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="consumer">Consumers</option>
                <option value="seller">Sellers</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {filterRole === 'seller' ? 'Products' : 'Orders'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {filterRole === 'seller' ? 'Total Sales' : 'Total Spent'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold mr-3">
                          {user.avatar}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          {user.shopName && (
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Store size={12} />
                              {user.shopName}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {user.role === 'seller' ? `${user.productsListed} items` : `${user.totalOrders} orders`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                      {user.role === 'seller' 
                        ? formatCurrency(user.totalSales) 
                        : (user.totalSpent > 0 ? formatCurrency(user.totalSpent) : '-')
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition"
                          title="Edit User"
                        >
                          <Edit size={18} />
                        </button>
                        {user.status === 'active' ? (
                          <button
                            onClick={() => handleStatusChange(user.id, 'suspended')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Suspend User"
                          >
                            <Ban size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(user.id, 'active')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Activate User"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-4 py-2 rounded-lg transition ${
                    currentPage === index + 1
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl mr-4">
                  {selectedUser.avatar}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedUser.name}</h3>
                  {selectedUser.shopName && (
                    <p className="text-gray-600 flex items-center gap-1">
                      <Store size={16} />
                      {selectedUser.shopName}
                    </p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getRoleBadge(selectedUser.role)}`}>
                      {selectedUser.role}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(selectedUser.status)}`}>
                      {selectedUser.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="text-gray-400 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{selectedUser.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="text-gray-400 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900">{selectedUser.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="text-gray-400 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium text-gray-900">{selectedUser.location}</p>
                      {selectedUser.address && (
                        <p className="text-sm text-gray-600">{selectedUser.address}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="text-gray-400 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Joined</p>
                      <p className="font-medium text-gray-900">{formatDate(selectedUser.joinDate)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedUser.role === 'consumer' ? (
                    <>
                      <div className="flex items-start gap-3">
                        <ShoppingBag className="text-gray-400 mt-1" size={20} />
                        <div>
                          <p className="text-sm text-gray-500">Total Orders</p>
                          <p className="font-medium text-gray-900">{selectedUser.totalOrders}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Shield className="text-gray-400 mt-1" size={20} />
                        <div>
                          <p className="text-sm text-gray-500">Total Spent</p>
                          <p className="font-medium text-gray-900">
                            {selectedUser.totalSpent > 0 ? formatCurrency(selectedUser.totalSpent) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start gap-3">
                        <Store className="text-gray-400 mt-1" size={20} />
                        <div>
                          <p className="text-sm text-gray-500">Products Listed</p>
                          <p className="font-medium text-gray-900">{selectedUser.productsListed} items</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <ShoppingBag className="text-gray-400 mt-1" size={20} />
                        <div>
                          <p className="text-sm text-gray-500">Total Sales</p>
                          <p className="font-medium text-gray-900">{formatCurrency(selectedUser.totalSales)}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Shield className="text-gray-400 mt-1" size={20} />
                        <div>
                          <p className="text-sm text-gray-500">Commission (10%)</p>
                          <p className="font-medium text-green-600">{formatCurrency(selectedUser.commission)}</p>
                        </div>
                      </div>
                    </>
                  )}
                  <div className="flex items-start gap-3">
                    <Calendar className="text-gray-400 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Last Active</p>
                      <p className="font-medium text-gray-900">{formatDate(selectedUser.lastActive)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  Edit User
                </button>
                {selectedUser.status === 'active' ? (
                  <button
                    onClick={() => {
                      handleStatusChange(selectedUser.id, 'suspended');
                      setShowModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Suspend User
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleStatusChange(selectedUser.id, 'active');
                      setShowModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Activate User
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Add New User</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+254712345678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="consumer">Consumer</option>
                    <option value="seller">Seller</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="City, Kenya"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter password"
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Add User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;