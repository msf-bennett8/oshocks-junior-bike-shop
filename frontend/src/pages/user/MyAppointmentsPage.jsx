import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBookings } from '../../hooks/useBookings';
import {
  Calendar, Clock, Wrench, User, Phone, Mail, MapPin,
  CheckCircle, XCircle, RefreshCw, Loader2, Search,
  ChevronDown, ChevronUp, MessageSquare,
  AlertCircle, Copy, Check, ArrowLeft, CalendarDays,
  ClipboardList, MoreVertical
} from 'lucide-react';
import AppointmentPanel from '../../components/appointments/AppointmentPanel';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Wrench },
  ready: { label: 'Ready', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: ClipboardList },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
  rescheduled: { label: 'Rescheduled', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: CalendarDays },
  no_show: { label: 'No Show', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: AlertCircle },
};

const MyAppointmentsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { myBookings, loading, error, fetchMyBookings, cancelBooking, rescheduleBooking } = useBookings();

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [rescheduleData, setRescheduleData] = useState({ new_date: '', reason: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [panelBooking, setPanelBooking] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    fetchMyBookings();
  }, [fetchMyBookings]);

  const filteredBookings = myBookings.filter(b => {
    const matchesFilter = filter === 'all' || b.status === filter;
      const matchesSearch = !search ||
        b.service_type?.toLowerCase().includes(search.toLowerCase()) ||
        b.case_id?.toLowerCase().includes(search.toLowerCase()) ||
        b.id?.toLowerCase().includes(search.toLowerCase()) ||
        b.shop_location?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusCounts = {
    all: myBookings.length,
    pending: myBookings.filter(b => b.status === 'pending').length,
    confirmed: myBookings.filter(b => b.status === 'confirmed').length,
    in_progress: myBookings.filter(b => b.status === 'in_progress').length,
    completed: myBookings.filter(b => b.status === 'completed').length,
    cancelled: myBookings.filter(b => b.status === 'cancelled').length,
    rescheduled: myBookings.filter(b => b.status === 'rescheduled').length,
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCancel = async () => {
    if (!selectedBooking || !cancelReason.trim()) return;
    setActionLoading(true);
    const res = await cancelBooking(selectedBooking.case_id, cancelReason.trim());
    setActionLoading(false);
    if (res.success) {
      setShowCancelModal(false);
      setSelectedBooking(null);
      setCancelReason('');
    }
  };

  const handleReschedule = async () => {
    if (!selectedBooking || !rescheduleData.new_date || !rescheduleData.reason.trim()) return;
    setActionLoading(true);
    const res = await rescheduleBooking(selectedBooking.case_id, {
      new_date: rescheduleData.new_date,
      reason: rescheduleData.reason.trim(),
    });
    setActionLoading(false);
    if (res.success) {
      setShowRescheduleModal(false);
      setSelectedBooking(null);
      setRescheduleData({ new_date: '', reason: '' });
    }
  };

  const openCancelModal = (booking) => {
    setSelectedBooking(booking);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const openRescheduleModal = (booking) => {
    setSelectedBooking(booking);
    setRescheduleData({ new_date: booking.confirmed_date?.split('T')[0] || '', reason: '' });
    setShowRescheduleModal(true);
  };

  const navigateToMessages = (booking) => {
    // For case-linked bookings: conversation is on supportCase
    const conversationId = booking?.support_case?.conversation_id || booking?.support_case?.conversation?.id;
    if (conversationId) {
      window.dispatchEvent(new CustomEvent('open-chat-drawer', {
        detail: { conversationId: conversationId }
      }));
    } else {
      // Standalone booking — no conversation. Open chat modal to create support case if needed.
      window.dispatchEvent(new CustomEvent('open-create-chat-modal', {
        detail: { prefillType: 'services_booking', bookingId: booking.id }
      }));
    }
  };

  const canRequestCancellation = (booking) => {
    return ['pending', 'confirmed', 'rescheduled'].includes(booking.status)
      && booking.cancellation_request_status === 'none';
  };
  const canReschedule = (status) => ['pending', 'confirmed', 'rescheduled'].includes(status);

  return (
    <div className="min-h-screen bg-gray-50 pt-[120px] md:pt-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">My Appointments</h1>
                <p className="text-sm text-gray-500">Track your service bookings</p>
              </div>
            </div>
            <button
              onClick={() => fetchMyBookings()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'confirmed', label: 'Confirmed' },
            { key: 'in_progress', label: 'In Progress' },
            { key: 'completed', label: 'Completed' },
            { key: 'cancelled', label: 'Cancelled' },
          ].map(stat => (
            <button
              key={stat.key}
              onClick={() => setFilter(stat.key)}
              className={`p-3 rounded-xl text-left transition-all border ${
                filter === stat.key
                  ? 'bg-white border-emerald-300 ring-2 ring-emerald-100 shadow-sm'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="text-2xl font-bold text-gray-900">{statusCounts[stat.key] || 0}</p>
              <p className="text-xs font-medium text-gray-500">{stat.label}</p>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by service, appointment ID, or location..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">No appointments found</p>
            <button
              onClick={() => navigate('/services')}
              className="text-emerald-600 font-medium hover:underline text-sm"
            >
              Book a service →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBookings.map(booking => {
              const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
              const StatusIcon = statusConfig.icon;
              const isExpanded = expandedBooking === booking.id;

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div
                    className="p-4 sm:p-5 cursor-pointer"
                    onClick={() => setExpandedBooking(isExpanded ? null : booking.id)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCopyId(booking.case_id || booking.id); }}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-mono text-gray-600 transition-colors"
                            title="Copy Appointment ID"
                          >
                            {copiedId === (booking.case_id || booking.id) ? (
                              <><Check className="w-3 h-3 text-green-600" /> Copied</>
                            ) : (
                              <><Copy className="w-3 h-3" /> {booking.case_id || booking.id}</>
                            )}
                          </button>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(booking.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-base sm:text-lg">
                          <Wrench className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span className="capitalize">{booking.service_type?.replace(/_/g, ' ')}</span>
                        </h3>

                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1 text-sm">
                          {booking.confirmed_date && (
                            <div className="flex items-center gap-1.5 text-emerald-700">
                              <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="font-medium">
                                {new Date(booking.confirmed_date).toLocaleDateString()}
                              </span>
                              {booking.confirmed_time && (
                                <span className="text-emerald-600">• {booking.confirmed_time}</span>
                              )}
                            </div>
                          )}
                          {booking.requested_date && !booking.confirmed_date && (
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
                              Requested: {new Date(booking.requested_date).toLocaleDateString()}
                            </div>
                          )}
                          {booking.shop_location && (
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                              {booking.shop_location}
                            </div>
                          )}
                          {booking.seller?.shop_name && (
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <User className="w-3.5 h-3.5 flex-shrink-0" />
                              {booking.seller.shop_name}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {canReschedule(booking.status) && (
                          <button
                            onClick={(e) => { e.stopPropagation(); openRescheduleModal(booking); }}
                            className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                          >
                            Reschedule
                          </button>
                        )}
                        {canRequestCancellation(booking) && (
                          <button
                            onClick={(e) => { e.stopPropagation(); openCancelModal(booking); }}
                            className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                          >
                            Request Cancel
                          </button>
                        )}
                        {booking.cancellation_request_status === 'pending_review' && (
                          <span className="px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg text-xs font-medium border border-yellow-200">
                            Cancel Pending
                          </span>
                        )}
                        {booking.cancellation_request_status === 'denied' && (
                          <span className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium border border-orange-200">
                            Cancel Denied
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPanelBooking(booking);
                            setIsPanelOpen(true);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Open Messages"
                        >
                          <MessageSquare className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPanelBooking(booking);
                            setIsPanelOpen(true);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="More Options"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors hidden sm:block">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 sm:px-5 pb-4 border-t border-gray-100 bg-gray-50/50">
                      <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Service Description</p>
                          <p className="text-gray-700">{booking.service_description || 'No description provided'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Customer Info</p>
                          <div className="space-y-1">
                            <p className="flex items-center gap-1.5 text-gray-700">
                              <User className="w-3.5 h-3.5" /> {booking.customer_name}
                            </p>
                            {booking.customer_phone && (
                              <p className="flex items-center gap-1.5 text-gray-700">
                                <Phone className="w-3.5 h-3.5" /> {booking.customer_phone}
                              </p>
                            )}
                            {booking.customer_email && (
                              <p className="flex items-center gap-1.5 text-gray-700">
                                <Mail className="w-3.5 h-3.5" /> {booking.customer_email}
                              </p>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Pricing</p>
                          <div className="space-y-1">
                            {booking.estimated_price && (
                              <p className="text-gray-700">Estimated: KSh {booking.estimated_price}</p>
                            )}
                            {booking.final_price && (
                              <p className="text-gray-700 font-medium">Final: KSh {booking.final_price}</p>
                            )}
                          </div>
                        </div>
                        {booking.staff_notes && (
                          <div className="sm:col-span-2 lg:col-span-3">
                            <p className="text-xs text-gray-500 mb-1">Staff Notes</p>
                            <p className="text-gray-700 bg-white p-2 rounded-lg border border-gray-100">{booking.staff_notes}</p>
                          </div>
                        )}
                        {booking.customer_notes && (
                          <div className="sm:col-span-2 lg:col-span-3">
                            <p className="text-xs text-gray-500 mb-1">Your Notes</p>
                            <p className="text-gray-700 bg-white p-2 rounded-lg border border-gray-100">{booking.customer_notes}</p>
                          </div>
                        )}
                        {booking.cancellation_request_status !== 'none' && (
                          <div className="sm:col-span-2 lg:col-span-3">
                            <p className="text-xs text-gray-500 mb-1">Cancellation Status</p>
                            <div className="bg-white p-3 rounded-lg border border-gray-100 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  booking.cancellation_request_status === 'pending_review' ? 'bg-yellow-100 text-yellow-700' :
                                  booking.cancellation_request_status === 'approved' ? 'bg-green-100 text-green-700' :
                                  'bg-orange-100 text-orange-700'
                                }`}>
                                  {booking.cancellation_request_status === 'pending_review' ? 'Awaiting Staff Review' :
                                   booking.cancellation_request_status === 'approved' ? 'Approved' : 'Denied'}
                                </span>
                              </div>
                              {booking.cancellation_reason && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Your reason:</span> {booking.cancellation_reason}
                                </p>
                              )}
                              {booking.cancellation_denial_reason && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Staff response:</span> {booking.cancellation_denial_reason}
                                </p>
                              )}
                              {booking.cancellation_requested_at && (
                                <p className="text-xs text-gray-400">
                                  Requested: {new Date(booking.cancellation_requested_at).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Appointment Panel */}
      <AppointmentPanel
        booking={panelBooking}
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
          setPanelBooking(null);
        }}
        onNavigateToMessages={(booking) => {
          const convId = booking?.conversation?.id || booking?.conversation_id || booking?.support_case?.conversation_id || booking?.support_case?.conversation?.id;
          if (convId) {
            window.dispatchEvent(new CustomEvent('open-chat-drawer', {
              detail: { conversationId: convId }
            }));
          }
        }}
      />

      {/* Cancel Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Request Cancellation</h3>
                <p className="text-sm text-gray-500">{selectedBooking.case_id}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Cancellation *
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  placeholder="Please let us know why you're cancelling..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowCancelModal(false); setSelectedBooking(null); setCancelReason(''); }}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Keep Appointment
                </button>
                <button
                  onClick={handleCancel}
                  disabled={!cancelReason.trim() || actionLoading}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Reschedule Appointment</h3>
                <p className="text-sm text-gray-500">{selectedBooking.case_id}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Date *
                </label>
                <input
                  type="date"
                  value={rescheduleData.new_date}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, new_date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Rescheduling *
                </label>
                <textarea
                  value={rescheduleData.reason}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                  placeholder="Please let us know why you need to reschedule..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowRescheduleModal(false); setSelectedBooking(null); setRescheduleData({ new_date: '', reason: '' }); }}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReschedule}
                  disabled={!rescheduleData.new_date || !rescheduleData.reason.trim() || actionLoading}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarDays className="w-4 h-4" />}
                  Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointmentsPage;
