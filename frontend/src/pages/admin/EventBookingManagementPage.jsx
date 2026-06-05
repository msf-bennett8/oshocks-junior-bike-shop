import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Calendar, CheckCircle, XCircle, Users, DollarSign, Download,
  Search, Filter, ArrowLeft, QrCode, RotateCcw, Check,
  AlertTriangle, Clock, Bike, Mail, Phone, MapPin
} from 'lucide-react';
import eventService from '../../services/eventService';
import { useAuth } from '../../context/AuthContext';
import ModerationActionModal from '../../components/common/ModerationActionModal';

const EventBookingManagementPage = () => {
  const { eventCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRegistrations, setSelectedRegistrations] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ type: 'confirm', title: '', message: '', onConfirm: null });

  useEffect(() => {
    fetchEventBookings();
  }, [eventCode, statusFilter]);

  const fetchEventBookings = async () => {
    try {
      setLoading(true);
      const params = {
        status: statusFilter === 'all' ? null : statusFilter,
        ...(searchQuery && { search: searchQuery }),
      };
      const response = await eventService.getEventBookings(eventCode, params);
      setEvent(response.data?.data?.event);
      setRegistrations(response.data?.data?.registrations || []);
      setSummary(response.data?.data?.summary);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (config) => { setModalConfig(config); setModalOpen(true); };
  const closeModal = () => setModalOpen(false);

  const handleBulkCheckIn = async () => {
    if (selectedRegistrations.length === 0) return;
    openModal({
      type: 'confirm',
      title: 'Bulk Check-In',
      message: `Check in ${selectedRegistrations.length} selected participants?`,
      onConfirm: async () => {
        closeModal();
        try {
          setActionLoading(true);
          await eventService.bulkCheckIn(selectedRegistrations);
          setSelectedRegistrations([]);
          fetchEventBookings();
        } catch (e) {
          alert(e.response?.data?.message || 'Bulk check-in failed');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleExport = async () => {
    try {
      const response = await eventService.exportEventBookings(eventCode);
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${eventCode}_bookings.csv`;
      a.click();
    } catch (e) {
      alert('Export failed');
    }
  };

  const toggleSelection = (code) => {
    setSelectedRegistrations(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const selectAll = () => {
    const allCodes = registrations.filter(r => !r.checked_in_at && r.status === 'registered')
      .map(r => r.registration_code);
    setSelectedRegistrations(allCodes);
  };

  if (loading && !event) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet><title>Event Bookings | Admin</title></Helmet>

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/admin/events')}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{event?.title}</h1>
          <p className="text-gray-600">Booking Management • {event?.event_code}</p>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Total Bookings', value: summary.total_bookings, icon: Users, color: 'blue' },
              { label: 'Revenue', value: `KSh ${Number(summary.total_revenue).toLocaleString()}`, icon: DollarSign, color: 'green' },
              { label: 'Checked In', value: summary.checked_in, icon: CheckCircle, color: 'emerald' },
              { label: 'Waitlisted', value: summary.waitlisted, icon: Clock, color: 'yellow' },
              { label: 'Capacity', value: `${summary.capacity_percent}%`, icon: AlertTriangle, color: summary.capacity_percent >= 90 ? 'red' : 'orange' },
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

      {/* Filters & Actions */}
      <div className="container mx-auto px-4 pb-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search participants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="registered">Registered</option>
              <option value="waitlisted">Waitlisted</option>
              <option value="cancelled">Cancelled</option>
              <option value="checked_in">Checked In</option>
            </select>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>

          {/* Bulk Actions */}
          {selectedRegistrations.length > 0 && (
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-600">{selectedRegistrations.length} selected</span>
              <button
                onClick={handleBulkCheckIn}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50"
              >
                <Check className="w-4 h-4" /> Check In Selected
              </button>
              <button
                onClick={() => setSelectedRegistrations([])}
                className="px-4 py-2 text-gray-600 text-sm hover:text-gray-900"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-semibold">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    onChange={(e) => e.target.checked ? selectAll() : setSelectedRegistrations([])}
                    checked={selectedRegistrations.length > 0 && selectedRegistrations.length === registrations.filter(r => !r.checked_in_at && r.status === 'registered').length}
                  />
                </th>
                <th className="px-4 py-3">Participant</th>
                <th className="px-4 py-3">Registration</th>
                <th className="px-4 py-3">Participants</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="8" className="px-4 py-8 text-center">Loading...</td></tr>
              ) : registrations.length === 0 ? (
                <tr><td colSpan="8" className="px-4 py-8 text-center text-gray-500">No registrations found</td></tr>
              ) : (
                registrations.map((reg) => (
                  <tr key={reg.registration_code} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {!reg.checked_in_at && reg.status === 'registered' && (
                        <input
                          type="checkbox"
                          checked={selectedRegistrations.includes(reg.registration_code)}
                          onChange={() => toggleSelection(reg.registration_code)}
                        />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {(reg.user?.name || 'G').charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{reg.user?.name || 'Guest'}</p>
                          <p className="text-xs text-gray-500">{reg.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs text-gray-600">{reg.registration_code}</p>
                      <p className="text-[10px] text-gray-400">{new Date(reg.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium">{reg.participant_count}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-sm">KSh {Number(reg.final_amount).toLocaleString()}</p>
                      {reg.discount_amount > 0 && (
                        <p className="text-[10px] text-green-600">Saved KSh {Number(reg.discount_amount).toLocaleString()}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        reg.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                        reg.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {reg.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${
                        reg.checked_in_at ? 'bg-emerald-100 text-emerald-700' :
                        reg.status === 'registered' ? 'bg-green-100 text-green-700' :
                        reg.status === 'waitlisted' ? 'bg-yellow-100 text-yellow-700' :
                        reg.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {reg.checked_in_at ? <CheckCircle className="w-3 h-3" /> :
                         reg.status === 'waitlisted' ? <Clock className="w-3 h-3" /> :
                         reg.status === 'cancelled' ? <XCircle className="w-3 h-3" /> :
                         <CheckCircle className="w-3 h-3" />}
                        {reg.checked_in_at ? 'Checked In' : reg.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {!reg.checked_in_at && reg.status === 'registered' && (
                          <button
                            onClick={async () => {
                              try {
                                await eventService.checkInBooking(reg.registration_code);
                                fetchEventBookings();
                              } catch (e) {
                                alert(e.response?.data?.message || 'Check-in failed');
                              }
                            }}
                            className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                            title="Check in"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {reg.status === 'registered' && (
                          <button
                            onClick={() => {/* TODO: Open cancel modal */}}
                            className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                            title="Cancel booking"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModerationActionModal
        isOpen={modalOpen}
        onClose={closeModal}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onCancel={closeModal}
      />
    </div>
  );
};

export default EventBookingManagementPage;
