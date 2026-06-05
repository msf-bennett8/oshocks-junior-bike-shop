import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Calendar, CheckCircle, XCircle, Clock, MapPin, Users,
  Bike, ArrowRight, Search, Eye, AlertTriangle, Star,
  ChevronRight, Ticket, RotateCcw
} from 'lucide-react';
import eventService from '../../services/eventService';
import { useAuth } from '../../context/AuthContext';
import ModerationActionModal from '../../components/common/ModerationActionModal';

const TABS = [
  { key: 'upcoming', label: 'Upcoming', icon: Calendar },
  { key: 'past', label: 'Past', icon: Clock },
  { key: 'cancelled', label: 'Cancelled', icon: XCircle },
  { key: 'all', label: 'All', icon: Ticket },
];

const STATUS_CONFIG = {
  registered: { label: 'Registered', color: 'green', icon: CheckCircle },
  waitlisted: { label: 'Waitlisted', color: 'yellow', icon: AlertTriangle },
  cancelled: { label: 'Cancelled', color: 'red', icon: XCircle },
  no_show: { label: 'No Show', color: 'gray', icon: XCircle },
  attended: { label: 'Attended', color: 'emerald', icon: CheckCircle },
  checked_in: { label: 'Checked In', color: 'blue', icon: CheckCircle },
};

const MyEventBookingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ total: 0, upcoming: 0, past: 0, cancelled: 0 });

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    type: 'confirm',
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, [activeTab]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await eventService.getMyEventRegistrations({
        tab: activeTab,
        per_page: 50,
      });
      setRegistrations(response.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (config) => {
    setModalConfig(config);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalConfig({ type: 'confirm', title: '', message: '', onConfirm: null, onCancel: null });
  };

  const handleCancelRegistration = (registration) => {
    openModal({
      type: 'confirm',
      title: 'Cancel Registration',
      message: `Are you sure you want to cancel your registration for "${registration.event?.title}"? This action cannot be undone.`,
      confirmText: 'Yes, Cancel',
      cancelText: 'Keep Registration',
      onConfirm: async () => {
        closeModal();
        try {
          setActionLoading(true);
          await eventService.unregisterFromEvent(registration.event?.event_code, 'User cancelled');
          fetchRegistrations();
          openModal({
            type: 'success',
            title: 'Cancelled',
            message: 'Your registration has been cancelled successfully.',
            showCancel: false,
            onConfirm: closeModal,
          });
        } catch (err) {
          openModal({
            type: 'error',
            title: 'Error',
            message: err.response?.data?.message || 'Failed to cancel registration.',
            showCancel: false,
            onConfirm: closeModal,
          });
        } finally {
          setActionLoading(false);
        }
      },
      onCancel: closeModal,
    });
  };

  const filteredRegistrations = registrations.filter((reg) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      reg.event?.title?.toLowerCase().includes(q) ||
      reg.registration_code?.toLowerCase().includes(q) ||
      reg.event?.event_code?.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || { label: status, color: 'gray', icon: Ticket };
    return config;
  };

  const formatPrice = (amount) => {
    return amount ? `KSh ${Number(amount).toLocaleString()}` : '-';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet><title>My Event Bookings | Oshocks</title></Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Event Bookings</h1>
          <p className="text-gray-600">Track your cycling event registrations and attendance.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.total, icon: Ticket, color: 'blue' },
            { label: 'Upcoming', value: stats.upcoming, icon: Calendar, color: 'green' },
            { label: 'Past', value: stats.past, icon: Clock, color: 'purple' },
            { label: 'Cancelled', value: stats.cancelled, icon: XCircle, color: 'red' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
                <span className="text-xs font-semibold text-gray-500 uppercase">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search your bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Registrations List */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No bookings found</p>
            <button
              onClick={() => navigate('/events')}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Browse Events
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredRegistrations.map((reg) => {
              const status = getStatusBadge(reg.status);
              const event = reg.event;
              const isUpcoming = event && new Date(event.start_datetime) >= new Date();
              const isCancelled = reg.status === 'cancelled';

              return (
                <div
                  key={reg.registration_code}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={event?.photos?.[0]?.url || event?.photos?.[0] || '/placeholder-event.jpg'}
                      alt={event?.title}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{event?.title}</h3>
                        <span className={`px-2 py-0.5 bg-${status.color}-100 text-${status.color}-700 rounded-full text-xs font-medium flex items-center gap-1`}>
                          <status.icon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{reg.registration_code}</p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {event ? new Date(event.start_datetime).toLocaleDateString() : '—'}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event?.meeting_point?.split(',')[0] || '—'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {reg.participant_count} participant{reg.participant_count > 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <Bike className="w-3 h-3" />
                          {event?.distance_km}km
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatPrice(reg.final_amount)}
                        </span>
                        {reg.discount_amount > 0 && (
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            Saved {formatPrice(reg.discount_amount)}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          reg.payment_status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : reg.payment_status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {reg.payment_status}
                        </span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => navigate(`/events/${event?.slug || event?.event_code}`)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100"
                        >
                          <Eye className="w-3 h-3" /> View Event
                        </button>
                        
                        {/* Download Ticket (if registered and paid) */}
                        {reg.status === 'registered' && reg.payment_status === 'paid' && (
                          <button
                            onClick={async () => {
                              try {
                                const response = await eventService.downloadTicket(reg.registration_code);
                                const blob = new Blob([response.data], { type: 'application/pdf' });
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `ticket-${reg.registration_code}.pdf`;
                                a.click();
                              } catch (e) {
                                alert('Failed to download ticket');
                              }
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-100"
                          >
                            <Ticket className="w-3 h-3" /> Ticket
                          </button>
                        )}

                        {/* Request Refund (if refundable) */}
                        {reg.is_refundable && (
                          <button
                            onClick={() => {
                              const reason = prompt('Please provide a reason for your refund request:');
                              if (reason) {
                                eventService.requestRefund(reg.registration_code, reason)
                                  .then(() => {
                                    alert('Refund request submitted');
                                    fetchRegistrations();
                                  })
                                  .catch(e => alert(e.response?.data?.message || 'Request failed'));
                              }
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-100"
                          >
                            <RotateCcw className="w-3 h-3" /> Refund
                          </button>
                        )}

                        {/* Transfer Booking */}
                        {isUpcoming && reg.status === 'registered' && (
                          <button
                            onClick={() => {
                              const email = prompt('Enter the email of the person you want to transfer this booking to:');
                              if (email) {
                                eventService.transferMyBooking(reg.registration_code, email)
                                  .then(() => {
                                    alert('Transfer request submitted for approval');
                                    fetchRegistrations();
                                  })
                                  .catch(e => alert(e.response?.data?.message || 'Transfer failed'));
                              }
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100"
                          >
                            <Users className="w-3 h-3" /> Transfer
                          </button>
                        )}

                        {isUpcoming && !isCancelled && (
                          <button
                            onClick={() => handleCancelRegistration(reg)}
                            disabled={actionLoading}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-50"
                          >
                            <XCircle className="w-3 h-3" /> Cancel
                          </button>
                        )}
                        {reg.status === 'attended' && !reg.rating && (
                          <button
                            onClick={() => navigate(`/events/${event?.slug}/review`)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-yellow-50 text-yellow-600 rounded-lg text-sm font-medium hover:bg-yellow-100"
                          >
                            <Star className="w-3 h-3" /> Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Moderation Action Modal */}
      <ModerationActionModal
        isOpen={modalOpen}
        onClose={closeModal}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        showCancel={modalConfig.showCancel}
        onConfirm={modalConfig.onConfirm}
        onCancel={modalConfig.onCancel}
        isLoading={actionLoading}
      />
    </div>
  );
};

export default MyEventBookingsPage;
