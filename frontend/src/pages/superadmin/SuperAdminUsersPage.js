import React, { useState, useEffect } from 'react';
import { Search, Filter, UserPlus, MoreVertical, Mail, Phone, MapPin, Calendar, Shield, ShoppingBag, Ban, CheckCircle, Edit, Trash2, Eye, Download, Store, User, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';

const SuperAdminAdminUsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      alert('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'seller': return 'bg-blue-100 text-blue-800';
      case 'pending_seller': return 'bg-yellow-100 text-yellow-800';
      case 'buyer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplay = (role) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'pending_seller': return 'Pending Seller';
      default: return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
    setActionMenuOpen(null);
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    const newStatus = !currentStatus;
    try {
      await userService.updateUserStatus(userId, newStatus);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_active: newStatus } : user
      ));
      alert(`User ${newStatus ? 'activated' : 'suspended'} successfully`);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update user status');
    }
    setActionMenuOpen(null);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await userService.deleteUser(userId);
        setUsers(users.filter(user => user.id !== userId));
        alert('User deleted successfully');
        if (showModal) setShowModal(false);
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete user');
      }
    }
    setActionMenuOpen(null);
  };

  const handleRoleChange = async (userId, currentRole, action) => {
    let newRole;
    let confirmMessage;

    switch (action) {
      case 'upgrade_to_seller':
        newRole = 'pending_seller';
        confirmMessage = 'Upgrade this user to pending seller status?';
        break;
      case 'remove_seller':
        newRole = 'buyer';
        confirmMessage = 'Remove seller privileges from this user?';
        break;
      case 'make_admin':
        if (currentUser.role !== 'super_admin') {
          alert('Only super admins can promote users to admin');
          return;
        }
        newRole = 'admin';
        confirmMessage = 'Promote this user to admin?';
        break;
      case 'remove_admin':
        if (currentUser.role !== 'super_admin') {
          alert('Only super admins can demote admins');
          return;
        }
        newRole = 'buyer';
        confirmMessage = 'Demote this admin to regular buyer?';
        break;
      case 'approve_seller':
        if (currentUser.role !== 'super_admin') {
          alert('Only super admins can approve sellers');
          return;
        }
        try {
          await userService.approveSeller(userId);
          setUsers(users.map(user => 
            user.id === userId ? { ...user, role: 'seller' } : user
          ));
          alert('Seller approved successfully!');
          setActionMenuOpen(null);
          return;
        } catch (error) {
          alert(error.response?.data?.message || 'Failed to approve seller');
          return;
        }
      case 'reject_seller':
        if (currentUser.role !== 'super_admin') {
          alert('Only super admins can reject sellers');
          return;
        }
        try {
          await userService.rejectSeller(userId);
          setUsers(users.map(user => 
            user.id === userId ? { ...user, role: 'buyer' } : user
          ));
          alert('Seller rejected successfully!');
          setActionMenuOpen(null);
          return;
        } catch (error) {
          alert(error.response?.data?.message || 'Failed to reject seller');
          return;
        }
      default:
        return;
    }

    if (window.confirm(confirmMessage)) {
      try {
        await userService.changeUserRole(userId, newRole);
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ));
        alert('Role updated successfully!');
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to update role');
      }
    }
    setActionMenuOpen(null);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone?.includes(searchTerm);
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.is_active) ||
                         (filterStatus === 'inactive' && !user.is_active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const stats = [
    { label: 'Total Users', value: users.length, icon: Shield, color: 'bg-blue-500' },
    { label: 'Buyers', value: users.filter(u => u.role === 'buyer').length, icon: User, color: 'bg-green-500' },
    { label: 'Sellers', value: users.filter(u => u.role === 'seller').length, icon: Store, color: 'bg-purple-500' },
    { label: 'Pending', value: users.filter(u => u.role === 'pending_seller').length, icon: Calendar, color: 'bg-yellow-500' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
              <p className="text-gray-600">Manage buyers and sellers on your marketplace</p>
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
                <option value="buyer">Buyers</option>
                <option value="seller">Sellers</option>
                <option value="pending_seller">Pending Sellers</option>
                <option value="admin">Admins</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Suspended</option>
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
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold mr-3">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{user.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                        {getRoleDisplay(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(user.is_active)}`}>
                        {user.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2 relative">
                        <button
                          onClick={() => setActionMenuOpen(actionMenuOpen === user.id ? null : user.id)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {/* Dropdown Menu */}
                        {actionMenuOpen === user.id && (
                          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                            <button
                              onClick={() => handleViewUser(user)}
                              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition text-left"
                            >
                              <Eye size={16} className="text-gray-600" />
                              <span>View Details</span>
                            </button>

                            <hr className="my-2" />

                            {/* Role Actions */}
                            {user.role === 'buyer' && (
                              <button
                                onClick={() => handleRoleChange(user.id, user.role, 'upgrade_to_seller')}
                                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-blue-50 transition text-left"
                              >
                                <UserPlus size={16} className="text-blue-600" />
                                <span className="text-blue-600">Upgrade to Seller</span>
                              </button>
                            )}

                            {user.role === 'pending_seller' && currentUser.role === 'super_admin' && (
                              <>
                                <button
                                  onClick={() => handleRoleChange(user.id, user.role, 'approve_seller')}
                                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-green-50 transition text-left"
                                >
                                  <CheckCircle size={16} className="text-green-600" />
                                  <span className="text-green-600">Approve Seller</span>
                                </button>
                                <button
                                  onClick={() => handleRoleChange(user.id, user.role, 'reject_seller')}
                                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 transition text-left"
                                >
                                  <X size={16} className="text-red-600" />
                                  <span className="text-red-600">Reject Seller</span>
                                </button>
                              </>
                            )}

                            {user.role === 'seller' && (
                              <button
                                onClick={() => handleRoleChange(user.id, user.role, 'remove_seller')}
                                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-orange-50 transition text-left"
                              >
                                <X size={16} className="text-orange-600" />
                                <span className="text-orange-600">Remove Seller</span>
                              </button>
                            )}

                            {(user.role === 'buyer' || user.role === 'seller') && currentUser.role === 'super_admin' && (
                              <button
                                onClick={() => handleRoleChange(user.id, user.role, 'make_admin')}
                                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-purple-50 transition text-left"
                              >
                                <Shield size={16} className="text-purple-600" />
                                <span className="text-purple-600">Make Admin</span>
                              </button>
                            )}

                            {user.role === 'admin' && currentUser.role === 'super_admin' && (
                              <button
                                onClick={() => handleRoleChange(user.id, user.role, 'remove_admin')}
                                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 transition text-left"
                              >
                                <X size={16} className="text-red-600" />
                                <span className="text-red-600">Remove Admin</span>
                              </button>
                            )}

                            <hr className="my-2" />

                            {/* Status Toggle */}
                            {user.is_active ? (
                              <button
                                onClick={() => handleStatusToggle(user.id, user.is_active)}
                                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-orange-50 transition text-left"
                              >
                                <Ban size={16} className="text-orange-600" />
                                <span className="text-orange-600">Suspend</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStatusToggle(user.id, user.is_active)}
                                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-green-50 transition text-left"
                              >
                                <CheckCircle size={16} className="text-green-600" />
                                <span className="text-green-600">Activate</span>
                              </button>
                            )}

                            {user.role !== 'super_admin' && (
                              <>
                                <hr className="my-2" />
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 transition text-left"
                                >
                                  <Trash2 size={16} className="text-red-600" />
                                  <span className="text-red-600">Delete</span>
                                </button>
                              </>
                            )}
                          </div>
                        )}
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
              {totalPages > 0 && [...Array(Math.min(totalPages, 5))].map((_, index) => {
                const pageNum = index + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 rounded-lg transition ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
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

        {/* Close dropdown when clicking outside */}
        {actionMenuOpen && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setActionMenuOpen(null)}
          />
        )}
      </div>
    </div>
  );
};

export default SuperAdminAdminUsersPage;