import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Shield, CheckCircle, XCircle, Clock, Bike, DollarSign, 
  RotateCcw, AlertTriangle, Search, Calendar, TrendingUp,
  ArrowRight, RefreshCw, Ban, Wallet, Check, Info, User
} from 'lucide-react';
import bikeService from '../../services/bikeService';
import { useAuth } from '../../context/AuthContext';

const TABS = [
  { key: 'all', label: 'All Bookings', icon: Bike },
  { key: 'active', label: 'Active Rentals', icon: Clock },
  { key: 'pending_payment', label: 'Pending Payment', icon: DollarSign },
  { key: 'completed', label: 'Completed', icon: CheckCircle },
  { key: 'overdue', label: 'Overdue', icon: AlertTriangle },
  { key: 'pending_recirculation', label: 'Pending Recirculation', icon: RotateCcw },
];

const BikeBookingModerationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
    fetchStats();
  }, [activeTab]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        status: activeTab === 'overdue' || activeTab === 'pending_recirculation' ? 'active' : activeTab,
        page: '1',
        per_page: '20',
      });
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`/api/v1/admin/bike-bookings?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      
      let data = result.data?.data || [];
      
      const now = new Date();
      if (activeTab === 'overdue') {
        data = data.filter(b => new Date(b.end_datetime) < now && b.status === 'active');
      } else if (activeTab === 'pending_recirculation') {
        data = data.filter(b => new Date(b.end_datetime) < now && !b.recirculated);
      }
      
      setBookings(data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/admin/bike-bookings/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      setStats(result.data || null);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleRecirculate = async (bookingCode) => {
    if (!window.confirm('Mark this bike as returned and recirculate to fleet?')) return;
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      await fetch(`/api/v1/admin/bike-bookings/${bookingCode}/recirculate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchBookings();
      fetchStats();
    } catch (err) {
      alert('Failed to recirculate');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefundDeposit = async (bookingCode) => {
    if (!window.confirm('Refund security deposit for this booking?')) return;
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      await fetch(`/api/v1/admin/bike-bookings/${bookingCode}/refund-deposit`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchBookings();
    } catch (err) {
      alert('Failed to refund deposit');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (booking) => {
    if (booking.recirculated) return { label: 'Recirculated', color: 'green', icon: RefreshCw };
    if (booking.status === 'active' && new Date(booking.end_datetime) < new Date()) {
      return { label: 'Overdue', color: 'red', icon: AlertTriangle };
    }
    const configs = {
      pending_payment: { label: 'Pending Payment', color: 'yellow', icon: DollarSign },
      confirmed: { label: 'Confirmed', color: 'blue', icon: CheckCircle },
      active: { label: 'Active', color: 'indigo', icon: Clock },
      returned: { label: 'Returned', color: 'orange', icon: RotateCcw },
      completed: { label: 'Completed', color: 'green', icon: CheckCircle },
      cancelled: { label: 'Cancelled', color: 'gray', icon: Ban },
      disputed: { label: 'Disputed', color: 'red', icon: AlertTriangle },
    };
    return configs[booking.status] || { label: booking.status, color: 'gray', icon: Bike };
  };

  const canRecirculate = (booking) => {
    return booking.status === 'active' && 
           new Date(booking.end_datetime) < new Date() && 
           !booking.recirculated;
  };

  const canRefundDeposit = (booking) => {
    return (booking.status === 'returned' || booking.recirculated) && 
           !booking.deposit_refunded && 
           booking.security_deposit > 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet><title>Bike Booking Moderation | Admin</title></Helmet>

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-green-500" />
            <h1 className="text-2xl font-bold text-gray-900">Bike Booking Moderation</h1>
          </div>
          <p className="text-gray-600">Manage bike rentals, returns, recirculation, deposits, and payouts.</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { label: 'Total', value: stats.total_bookings, icon: Bike, color: 'blue' },
              { label: 'Active', value: stats.active_rentals, icon: Clock, color: 'indigo' },
              { label: 'Pending', value: stats.pending_payment, icon: DollarSign, color: 'yellow' },
              { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'green' },
              { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'red' },
              { label: 'Pending Recirc.', value: stats.pending_recirculation, icon: RotateCcw, color: 'orange' },
              { label: 'Revenue', value: `KSh ${(stats.total_revenue || 0).toLocaleString()}`, icon: TrendingUp, color: 'emerald' },
              { label: 'Commission', value: `KSh ${(stats.total_commission || 0).toLocaleString()}`, icon: Wallet, color: 'purple' },
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

      {/* Tabs & Search */}
      <div className="container mx-auto px-4 pb-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Tab Bar */}
          <div className="flex overflow-x-auto border-b border-gray-200">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); }}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? 'text-green-600 border-b-2 border-green-500 bg-green-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings by code, bike, or renter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchBookings()}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Bookings Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-semibold">
                <tr>
                  <th className="px-4 py-3">Booking</th>
                  <th className="px-4 py-3">Bike</th>
                  <th className="px-4 py-3">Renter</th>
                  <th className="px-4 py-3">Period</th>
                  <th className="px-4 py-3">Financial</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
                ) : bookings.length === 0 ? (
                  <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">No bookings found</td></tr>
                ) : (
                  bookings.map((booking) => {
                    const statusBadge = getStatusBadge(booking);
                    const showRecirculate = canRecirculate(booking);
                    const showRefund = canRefundDeposit(booking);
                    return (
                      <tr key={booking.booking_code} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-900">{booking.booking_code}</p>
                          <p className="text-xs text-gray-500 capitalize">{booking.duration_type || 'daily'} rental</p>
                          {booking.duration_hours && (
                            <p className="text-xs text-gray-400">{booking.duration_hours} hours</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <img src={booking.bike?.images?.[0] || '/placeholder-bike.jpg'} alt="" className="w-8 h-8 rounded object-cover" />
                            <div>
                              <span className="text-sm text-gray-700 block">{booking.bike?.name}</span>
                              <span className="text-xs text-gray-400">{booking.bike?.listing_code}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                              {(booking.renter?.name || 'U').charAt(0)}
                            </div>
                            <span className="text-sm text-gray-700">{booking.renter?.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs">
                            <p className="font-medium text-gray-700">{new Date(booking.start_datetime).toLocaleDateString()}</p>
                            <p className="text-gray-400">→ {new Date(booking.end_datetime).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {Math.ceil((new Date(booking.end_datetime) - new Date(booking.start_datetime)) / (1000 * 60 * 60 * 24))} days
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs space-y-1">
                            <p className="font-semibold text-gray-900">Total: KSh {Number(booking.grand_total).toLocaleString()}</p>
                            <p className="text-gray-500">Rental: KSh {Number(booking.total_rental_fee).toLocaleString()}</p>
                            <p className="text-gray-500">Deposit: KSh {Number(booking.security_deposit).toLocaleString()}</p>
                            <p className="text-gray-500">Commission: KSh {Number(booking.platform_fee).toLocaleString()}</p>
                            <p className="text-green-600 font-medium">Lister gets: KSh {Number(booking.owner_payout).toLocaleString()}</p>
                            {booking.late_return_fine > 0 && (
                              <p className="text-red-600 font-medium">Fine: KSh {Number(booking.late_return_fine).toLocaleString()}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className={`px-2 py-0.5 bg-${statusBadge.color}-100 text-${statusBadge.color}-700 rounded-full text-xs font-medium flex items-center gap-1 w-fit`}>
                              <statusBadge.icon className="w-3 h-3" />
                              {statusBadge.label}
                            </span>
                            {booking.deposit_refunded && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium w-fit">
                                <Check className="w-3 h-3 inline" /> Deposit Refunded
                              </span>
                            )}
                            {booking.recirculated && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium w-fit">
                                <RefreshCw className="w-3 h-3 inline" /> Back in Fleet
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 flex-wrap">
                            {showRecirculate && (
                              <button
                                onClick={() => handleRecirculate(booking.booking_code)}
                                disabled={actionLoading}
                                className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 flex items-center gap-1 transition-colors"
                              >
                                <RotateCcw className="w-3 h-3" />
                                Return to Fleet
                              </button>
                            )}
                            {showRefund && (
                              <button
                                onClick={() => handleRefundDeposit(booking.booking_code)}
                                disabled={actionLoading}
                                className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 flex items-center gap-1 transition-colors"
                              >
                                <DollarSign className="w-3 h-3" />
                                Refund Deposit
                              </button>
                            )}
                            <button
                              onClick={() => navigate(`/bike-bookings/${booking.booking_code}`)}
                              className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                              title="View details"
                            >
                              <Info className="w-4 h-4" />
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
    </div>
  );
};

export default BikeBookingModerationPage;
