import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Shield, CheckCircle, XCircle, Clock, ArrowLeftRight, Search,
  Package, AlertTriangle, Loader, Ban, Calendar, User, DollarSign,
  RefreshCw, CheckSquare, Truck, RotateCcw
} from 'lucide-react';
import resourceService from '../../services/resourceService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/ToastContainer';

const TABS = [
  { key: 'all', label: 'All Bookings', icon: Package },
  { key: 'pending_payment', label: 'Pending Payment', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'picked_up', label: 'Picked Up', icon: Truck },
  { key: 'active', label: 'Active', icon: Shield },
  { key: 'returned', label: 'Returned', icon: ArrowLeftRight },
  { key: 'completed', label: 'Completed', icon: CheckSquare },
  { key: 'cancelled', label: 'Cancelled', icon: XCircle },
  { key: 'overdue', label: 'Overdue', icon: AlertTriangle },
  { key: 'pending_recirculation', label: 'Pending Recirculation', icon: RotateCcw },
];

const ResourceBookingModerationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

  useEffect(() => {
    fetchBookings();
    fetchStats();
  }, [activeTab, currentPage]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = {
        status: activeTab === 'all' || activeTab === 'overdue' || activeTab === 'pending_recirculation' ? undefined : activeTab,
        page: currentPage,
        per_page: 20,
        ...(searchQuery && { search: searchQuery }),
        ...(activeTab === 'overdue' && { overdue: true }),
        ...(activeTab === 'pending_recirculation' && { pending_recirculation: true }),
      };
      const response = await resourceService.getModerationBookings(params);
      setBookings(response.data?.data?.data || response.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await resourceService.getModerationStats();
      setStats(response.data?.data || null);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus || !selectedBooking) return;
    try {
      setActionLoading(true);
      await resourceService.updateBookingStatus(selectedBooking.booking_code, newStatus, statusNotes);
      setShowStatusModal(false);
      setSelectedBooking(null);
      setNewStatus('');
      setStatusNotes('');
      toast.success(`Status updated to ${newStatus}`);
      fetchBookings();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkReturned = async (bookingCode) => {
    try {
      setActionLoading(true);
      await resourceService.markReturned(bookingCode);
      toast.success('Marked as returned');
      fetchBookings();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark returned');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteRecirculation = async (bookingCode) => {
    try {
      setActionLoading(true);
      await resourceService.completeRecirculation(bookingCode);
      toast.success('Recirculation completed');
      fetchBookings();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete recirculation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAutoRecirculate = async () => {
    try {
      setActionLoading(true);
      const response = await resourceService.autoRecirculate();
      toast.success(response.data?.message || 'Auto-recirculation complete');
      fetchBookings();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to auto-recirculate');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (booking) => {
    const status = booking.display_status || booking.status;
    switch (status) {
      case 'pending_payment': return { label: 'Pending Payment', color: 'yellow', icon: Clock };
      case 'confirmed': return { label: 'Confirmed', color: 'blue', icon: CheckCircle };
      case 'picked_up': return { label: 'Picked Up', color: 'indigo', icon: Truck };
      case 'active': return { label: 'Active', color: 'green', icon: Shield };
      case 'returned': return { label: 'Returned', color: 'orange', icon: ArrowLeftRight };
      case 'completed': return { label: 'Completed', color: 'green', icon: CheckSquare };
      case 'cancelled': return { label: 'Cancelled', color: 'red', icon: XCircle };
      case 'no_show': return { label: 'No Show', color: 'gray', icon: Ban };
      case 'overdue': return { label: 'Overdue', color: 'red', icon: AlertTriangle };
      case 'auto_returned': return { label: 'Auto Returned', color: 'purple', icon: RefreshCw };
      case 'recirculated': return { label: 'Recirculated', color: 'green', icon: RotateCcw };
      default: return { label: status, color: 'gray', icon: Package };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet><title>Resource Booking Moderation | Admin</title></Helmet>

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-indigo-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Resource Booking Moderation</h1>
                <p className="text-gray-600">Manage all resource bookings, returns, and recirculation.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAutoRecirculate}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Auto Recirculate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Total Bookings', value: stats.total_bookings || 0, icon: Package, color: 'blue' },
              { label: 'Active', value: stats.active_bookings || 0, icon: Shield, color: 'green' },
              { label: 'Pending', value: stats.pending_bookings || 0, icon: Clock, color: 'yellow' },
              { label: 'Completed', value: stats.completed_bookings || 0, icon: CheckSquare, color: 'green' },
              { label: 'Overdue', value: stats.overdue_bookings || 0, icon: AlertTriangle, color: 'red' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
                  <span className="text-xs font-semibold text-gray-500 uppercase">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs & Table */}
      <div className="container mx-auto px-4 pb-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex overflow-x-auto border-b border-gray-200">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? 'text-indigo-600 border-b-2 border-indigo-500 bg-indigo-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-4 border-b border-gray-200">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings by code, user, or resource..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchBookings()}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-semibold">
                <tr>
                  <th className="px-4 py-3">Booking</th>
                  <th className="px-4 py-3">Resource</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Period</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    <Loader className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading...
                  </td></tr>
                ) : bookings.length === 0 ? (
                  <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">No bookings found</td></tr>
                ) : (
                  bookings.map((booking) => {
                    const statusBadge = getStatusBadge(booking);
                    return (
                      <tr key={booking.booking_code} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold text-gray-900">{booking.booking_code}</p>
                            <p className="text-xs text-gray-500">Qty: {booking.quantity_booked}</p>
                            {booking.auto_returned && <p className="text-xs text-purple-600">Auto-returned</p>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <img src={booking.resource_item?.images?.[0] || '/placeholder-resource.jpg'} alt="" className="w-8 h-8 rounded object-cover" />
                            <div>
                              <p className="font-medium text-gray-900">{booking.resource_item?.name}</p>
                              <p className="text-xs text-gray-500">{booking.resource_item?.resource_code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{booking.user?.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs">
                            <p className="text-gray-700">{new Date(booking.start_datetime).toLocaleDateString()}</p>
                            <p className="text-gray-500">to {new Date(booking.end_datetime).toLocaleDateString()}</p>
                            {booking.is_overdue && <p className="text-red-600 font-medium">Overdue!</p>}
                            {booking.days_remaining !== null && booking.days_remaining > 0 && (
                              <p className="text-green-600">{booking.days_remaining} days left</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs">
                            <p className="font-semibold text-gray-900">KSh {Number(booking.grand_total).toLocaleString()}</p>
                            <p className="text-gray-500">Unit: KSh {Number(booking.unit_price).toLocaleString()}</p>
                            {booking.surge_multiplier_applied > 1.0 && (
                              <p className="text-orange-600">Surge: {booking.surge_multiplier_applied}x</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 bg-${statusBadge.color}-100 text-${statusBadge.color}-700 rounded-full text-xs font-medium flex items-center gap-1 w-fit`}>
                            <statusBadge.icon className="w-3 h-3" />
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 flex-wrap">
                            {/* Status Update */}
                            <button
                              onClick={() => { setSelectedBooking(booking); setShowStatusModal(true); }}
                              disabled={actionLoading}
                              className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                              title="Update Status"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>

                            {/* Mark Returned */}
                            {(booking.status === 'active' || booking.status === 'picked_up') && !booking.auto_returned && (
                              <button
                                onClick={() => handleMarkReturned(booking.booking_code)}
                                disabled={actionLoading}
                                className="p-1.5 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200"
                                title="Mark Returned"
                              >
                                <ArrowLeftRight className="w-4 h-4" />
                              </button>
                            )}

                            {/* Complete Recirculation */}
                            {booking.status === 'returned' && !booking.recirculated && (
                              <button
                                onClick={() => handleCompleteRecirculation(booking.booking_code)}
                                disabled={actionLoading}
                                className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                                title="Complete Recirculation"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            )}

                            {/* View */}
                            <button
                              onClick={() => navigate(`/resource-bookings/${booking.booking_code}`)}
                              className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                              title="View Details"
                            >
                              <Calendar className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Update Booking Status</h3>
            <p className="text-gray-600 text-sm mb-4">
              <strong>{selectedBooking.booking_code}</strong> — Current: {selectedBooking.status}
            </p>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="">Select status...</option>
                  <option value="pending_payment">Pending Payment</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="picked_up">Picked Up</option>
                  <option value="active">Active</option>
                  <option value="returned">Returned</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No Show</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Optional notes..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowStatusModal(false); setSelectedBooking(null); setNewStatus(''); setStatusNotes(''); }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={!newStatus || actionLoading}
                className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50"
              >
                {actionLoading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceBookingModerationPage;
