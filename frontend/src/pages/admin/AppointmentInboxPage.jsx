import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBookings } from '../../hooks/useBookings';
import api from '../../services/api';
import { CaseStatusChip } from '../../components/messaging/CaseStatusChip';
import {
  Calendar, Clock, Wrench, User, Phone, Mail, MapPin,
  CheckCircle, XCircle, RefreshCw, Loader2, Search,
  Filter, ChevronDown, ChevronUp, Eye, MessageSquare, Users,
  AlertCircle, Copy, Check, DollarSign, MoreVertical
} from 'lucide-react';
import AppointmentPanel from '../../components/appointments/AppointmentPanel';

const AppointmentInboxPage = () => {
  const { user } = useAuth();
  const {
    bookings,
    loading,
    error,
    fetchBookings,
    confirmBooking,
    rescheduleBooking,
    completeBooking,
    cancelBooking,
  } = useBookings();

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showApproveCancelModal, setShowApproveCancelModal] = useState(false);
  const [showDenyCancelModal, setShowDenyCancelModal] = useState(false);
  const [denialReason, setDenialReason] = useState('');
  const [confirmData, setConfirmData] = useState({
    confirmed_date: '',
    confirmed_time: '',
    staff_notes: '',
    seller_id: '',
    assigned_mechanic_id: '',
  });
  const [sellers, setSellers] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [sellerAvailability, setSellerAvailability] = useState([]);
  const [loadingSellers, setLoadingSellers] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [panelBooking, setPanelBooking] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    fetchBookings();
    fetchSellersList();
  }, [fetchBookings]);

  const fetchSellersList = async () => {
    setLoadingSellers(true);
    try {
      const res = await api.get('/service-bookings/sellers');
      setSellers(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch sellers:', err);
    } finally {
      setLoadingSellers(false);
    }
  };

  const fetchSellerAvailability = async (sellerId, date) => {
    if (!sellerId || !date) return;
    setLoadingAvailability(true);
    try {
      const res = await api.get(`/sellers/${sellerId}/availability`, {
        params: { date }
      });
      setSellerAvailability(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch availability:', err);
      setSellerAvailability([]);
    } finally {
      setLoadingAvailability(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesFilter = filter === 'all' || 
      b.status === filter || 
      (filter === 'pending_review' && b.cancellation_request_status === 'pending_review');
      const matchesSearch = !search ||
        b.service_type?.toLowerCase().includes(search.toLowerCase()) ||
        b.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
        b.case_id?.toLowerCase().includes(search.toLowerCase()) ||
        b.id?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusCounts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    in_progress: bookings.filter(b => b.status === 'in_progress').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    pending_review: bookings.filter(b => b.cancellation_request_status === 'pending_review').length,
  };

  const handleConfirm = async () => {
    if (!selectedBooking || !confirmData.confirmed_date) return;
    setActionLoading(true);
    const res = await confirmBooking(selectedBooking.case_id, {
      confirmed_date: confirmData.confirmed_date,
      confirmed_time: confirmData.confirmed_time || '09:00',
      staff_notes: confirmData.staff_notes,
      seller_id: confirmData.seller_id || null,
      assigned_mechanic_id: confirmData.assigned_mechanic_id || null,
    });
    setActionLoading(false);
    if (res.success) {
      setShowConfirmModal(false);
      setSelectedBooking(null);
      setConfirmData({ confirmed_date: '', confirmed_time: '', staff_notes: '' });
    }
  };

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeTarget, setCompleteTarget] = useState(null);

  const handleComplete = async (caseId) => {
    setCompleteTarget(caseId);
    setShowCompleteModal(true);
  };

  const submitComplete = async () => {
    if (!completeTarget) return;
    setActionLoading(true);
    await completeBooking(completeTarget);
    setActionLoading(false);
    setShowCompleteModal(false);
    setCompleteTarget(null);
  };

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const handleCancel = async (caseId) => {
    setCancelTarget(caseId);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const submitCancel = async () => {
    if (!cancelTarget || !cancelReason.trim()) return;
    setActionLoading(true);
    await cancelBooking(cancelTarget, cancelReason.trim());
    setActionLoading(false);
    setShowCancelModal(false);
    setCancelTarget(null);
    setCancelReason('');
  };

    const handleApproveCancellation = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    const res = await cancelBooking(selectedBooking.case_id, null, 'approve');
    setActionLoading(false);
    if (res.success) {
      setShowApproveCancelModal(false);
      setSelectedBooking(null);
    }
  };

  const handleDenyCancellation = async () => {
    if (!selectedBooking || !denialReason.trim()) return;
    setActionLoading(true);
    const res = await cancelBooking(selectedBooking.case_id, null, 'deny', denialReason.trim());
    setActionLoading(false);
    if (res.success) {
      setShowDenyCancelModal(false);
      setSelectedBooking(null);
      setDenialReason('');
    }
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePhoneClick = (phone) => {
    window.location.href = `tel:${phone.replace(/\s/g, '')}`;
  };

  const handleEmailClick = () => {
    window.location.href = 'mailto:oshocksstores@gmail.com';
  };

  if (!user || !['admin', 'super_admin', 'support_agent', 'seller'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-500">You don't have permission to view appointments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Appointment Inbox</h1>
                <p className="text-sm text-gray-500">Manage service bookings and appointments</p>
              </div>
            </div>
            <button
              onClick={() => fetchBookings()}
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {[
            { key: 'all', label: 'All', color: 'bg-gray-100 text-gray-700' },
            { key: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
            { key: 'confirmed', label: 'Confirmed', color: 'bg-emerald-100 text-emerald-700' },
            { key: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
            { key: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700' },
            { key: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700' },
            { key: 'pending_review', label: 'Cancel Requests', color: 'bg-yellow-100 text-yellow-700' },
          ].map(stat => (
            <button
              key={stat.key}
              onClick={() => setFilter(stat.key)}
              className={`p-3 rounded-xl text-left transition-all ${
                filter === stat.key ? `${stat.color} ring-2 ring-offset-1 ring-gray-300` : 'bg-white hover:bg-gray-50'
              }`}
            >
              <p className="text-2xl font-bold">{statusCounts[stat.key] || 0}</p>
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
              placeholder="Search by service, customer, booking ID, or case ID..."
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
            <p className="text-gray-500">No appointments found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBookings.map(booking => (
                            <div
                key={booking.id}
                className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
              >
                <div 
                  className="p-5 cursor-pointer"
                  onClick={() => setExpandedBooking(expandedBooking === booking.id ? null : booking.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CaseStatusChip
                          status={booking.support_case?.status}
                          appointmentStatus={booking.status}
                          size="sm"
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); handleCopyId(booking.case_id || booking.id); }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-mono text-gray-600 transition-colors"
                          title="Copy Appointment ID"
                        >
                          {copiedId === (booking.case_id || booking.id) ? (
                            <><Check className="w-3 h-3 text-green-600" /> Copied</>
                          ) : (
                            <><Copy className="w-3 h-3" /> {booking.case_id || booking.id}</>
                          )}
                        </button>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(booking.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-emerald-600" />
                      {booking.service_type?.replace(/_/g, ' ')}
                    </h3>

                      <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <User className="w-3.5 h-3.5" />
                          {booking.customer_name}
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handlePhoneClick(booking.customer_phone); }}
                          className="flex items-center gap-1.5 text-gray-600 hover:text-emerald-600 transition-colors text-left"
                          title="Click to call"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {booking.customer_phone || 'N/A'}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEmailClick(); }}
                          className="flex items-center gap-1.5 text-gray-600 hover:text-emerald-600 transition-colors text-left"
                          title="Click to email oshocksstores@gmail.com"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          {booking.customer_email || 'N/A'}
                        </button>
                      </div>

                    {booking.requested_date && (
                      <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-600">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        Requested: {new Date(booking.requested_date).toLocaleDateString()}
                        {booking.preferred_time && (
                          <span className="text-emerald-600 font-medium"> • {booking.preferred_time}</span>
                        )}
                      </div>
                    )}

                    {booking.confirmed_date && (
                      <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Confirmed: {new Date(booking.confirmed_date).toLocaleDateString()}
                        {booking.confirmed_time && (
                          <span> • {booking.confirmed_time}</span>
                        )}
                      </div>
                    )}

                    {booking.staff_notes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded-lg text-xs text-gray-600">
                        <span className="font-medium">Notes:</span> {booking.staff_notes}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    {booking.cancellation_request_status === 'pending_review' && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-xs font-bold border border-yellow-300 animate-pulse">
                        Cancel Requested
                      </span>
                    )}

                    {booking.status === 'pending' && booking.cancellation_request_status !== 'pending_review' && (
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowConfirmModal(true);
                        }}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Confirm
                      </button>
                    )}
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => handleComplete(booking.case_id)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Complete
                      </button>
                    )}
                    {booking.cancellation_request_status === 'pending_review' ? (
                      <>
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowApproveCancelModal(true);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowDenyCancelModal(true);
                          }}
                          className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-xs font-medium hover:bg-orange-200 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Deny
                        </button>
                      </>
                    ) : (
                      ['pending', 'confirmed', 'rescheduled'].includes(booking.status) && booking.cancellation_request_status === 'none' && (
                        <button
                          onClick={() => handleCancel(booking.case_id)}
                          disabled={actionLoading}
                          className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )
                    )}
                                        <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPanelBooking(booking);
                        setIsPanelOpen(true);
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
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
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      title="More Options"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors hidden sm:block"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {expandedBooking === booking.id ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* COLLAPSIBLE DETAILS SECTION */}
              {expandedBooking === booking.id && (
                <div className="px-5 pb-5 border-t border-gray-100 bg-gray-50/50">
                  <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {/* Service Description */}
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5" /> Service Description
                      </p>
                      <p className="text-gray-700">{booking.service_description || 'No description provided'}</p>
                    </div>

                    {/* Customer Info */}
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> Customer Info
                      </p>
                      <div className="space-y-1.5">
                        <p className="text-gray-700">{booking.customer_name}</p>
                        {booking.customer_phone && (
                          <button
                            onClick={() => handlePhoneClick(booking.customer_phone)}
                            className="flex items-center gap-1.5 text-gray-700 hover:text-emerald-600 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" /> {booking.customer_phone}
                          </button>
                        )}
                        {booking.customer_email && (
                          <button
                            onClick={handleEmailClick}
                            className="flex items-center gap-1.5 text-gray-700 hover:text-emerald-600 transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5" /> {booking.customer_email}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Pricing */}
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5" /> Pricing
                      </p>
                      <div className="space-y-1">
                        {booking.estimated_price && (
                          <p className="text-gray-700">Estimated: KSh {booking.estimated_price}</p>
                        )}
                        {booking.final_price && (
                          <p className="text-gray-700 font-medium">Final: KSh {booking.final_price}</p>
                        )}
                        {!booking.estimated_price && !booking.final_price && (
                          <p className="text-gray-500 italic">Pricing to be determined</p>
                        )}
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> Location
                      </p>
                      <div className="space-y-1">
                        {booking.shop_location && (
                          <p className="text-gray-700 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" /> {booking.shop_location}
                          </p>
                        )}
                        {booking.service_address && (
                          <p className="text-gray-600">{booking.service_address}</p>
                        )}
                        {!booking.shop_location && !booking.service_address && (
                          <p className="text-gray-500 italic">No location specified</p>
                        )}
                      </div>
                    </div>

                    {/* User Notes */}
                    {booking.customer_notes && (
                      <div className="md:col-span-2">
                        <p className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5" /> Customer Notes
                        </p>
                        <div className="bg-white p-3 rounded-lg border border-gray-100">
                          <p className="text-gray-700">{booking.customer_notes}</p>
                        </div>
                      </div>
                    )}

                    {/* Staff Notes */}
                    {booking.staff_notes && (
                      <div className="md:col-span-2">
                        <p className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5" /> Staff Notes
                        </p>
                        <div className="bg-white p-3 rounded-lg border border-gray-100">
                          <p className="text-gray-700">{booking.staff_notes}</p>
                        </div>
                      </div>
                    )}

                    {/* Appointment Status */}
                    <div className="md:col-span-2">
                      <p className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Appointment Status
                      </p>
                      <div className="flex items-center gap-2">
                        {booking.case_id ? (
                          <CaseStatusChip
                            status={booking.support_case?.status}
                            appointmentStatus={booking.status}
                            size="sm"
                          />
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium border border-gray-200">
                            <Wrench className="w-3 h-3" /> Standalone
                          </span>
                        )}
                        <span className="text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          Last updated: {new Date(booking.updated_at).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Cancellation Status */}
                    {booking.cancellation_request_status !== 'none' && (
                      <div className="md:col-span-2">
                        <p className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" /> Cancellation Status
                        </p>
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
                              <span className="font-medium">User reason:</span> {booking.cancellation_reason}
                            </p>
                          )}
                          {booking.cancellation_denial_reason && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Staff response:</span> {booking.cancellation_denial_reason}
                            </p>
                          )}
                          {booking.cancellation_requested_at && (
                            <p className="text-xs text-gray-400">
                              Requested: {new Date(booking.cancellation_requested_at).toLocaleString()}
                            </p>
                          )}
                          {booking.cancelled_at && (
                            <p className="text-xs text-gray-400">
                              Cancelled at: {new Date(booking.cancelled_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            ))}
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
          const convId = booking?.support_case?.conversation_id || booking?.support_case?.conversation?.id;
          if (convId) {
            window.location.href = `/messages?conversationId=${convId}`;
          } else {
            // Standalone booking — no conversation
            alert('This is a standalone booking with no associated chat. Customer booked directly from Services Page.');
          }
        }}
      />

      {/* Confirm Modal */}
      {showConfirmModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Appointment</h3>
            <div className="space-y-4">
              {/* Seller / Mechanic Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Seller / Mechanic *</label>
                <div className="relative">
                  <select
                    value={confirmData.seller_id}
                    onChange={(e) => {
                      const sellerId = e.target.value;
                      setConfirmData(prev => ({ ...prev, seller_id: sellerId, assigned_mechanic_id: '' }));
                      setSelectedSeller(sellers.find(s => s.id === parseInt(sellerId)) || null);
                      if (sellerId && confirmData.confirmed_date) {
                        fetchSellerAvailability(sellerId, confirmData.confirmed_date);
                      }
                    }}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
                  >
                    <option value="">Select a seller/mechanic...</option>
                    {loadingSellers ? (
                      <option disabled>Loading sellers...</option>
                    ) : (
                      sellers.map(seller => (
                        <option key={seller.id} value={seller.id}>
                          {seller.shop_name || seller.name} {seller.specialty ? `(${seller.specialty})` : ''}
                        </option>
                      ))
                    )}
                  </select>
                  <Users className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                {selectedSeller && (
                  <div className="mt-2 p-2 bg-emerald-50 rounded-lg text-xs text-emerald-800">
                    <span className="font-medium">{selectedSeller.shop_name || selectedSeller.name}</span>
                    {selectedSeller.phone && <span> • {selectedSeller.phone}</span>}
                    {selectedSeller.location && <span> • {selectedSeller.location}</span>}
                  </div>
                )}
              </div>

              {/* Confirmed Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmed Date *</label>
                <input
                  type="date"
                  value={confirmData.confirmed_date}
                  onChange={(e) => {
                    const date = e.target.value;
                    setConfirmData(prev => ({ ...prev, confirmed_date: date }));
                    if (confirmData.seller_id && date) {
                      fetchSellerAvailability(confirmData.seller_id, date);
                    }
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Availability Calendar / Time Slots */}
              {confirmData.seller_id && confirmData.confirmed_date && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available Time Slots
                    {loadingAvailability && <Loader2 className="inline w-3 h-3 ml-2 animate-spin" />}
                  </label>
                  {sellerAvailability.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {sellerAvailability.map((slot, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setConfirmData(prev => ({ ...prev, confirmed_time: slot.start_time }))}
                          className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                            confirmData.confirmed_time === slot.start_time
                              ? 'bg-emerald-600 text-white'
                              : slot.is_available
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                          disabled={!slot.is_available}
                          title={slot.is_available ? 'Available' : 'Booked'}
                        >
                          {slot.start_time?.substring(0, 5) || slot.time}
                          {slot.max_bookings > 1 && (
                            <span className="block text-[10px] opacity-75">
                              {slot.current_bookings}/{slot.max_bookings}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-yellow-50 rounded-lg flex items-center gap-2 text-xs text-yellow-800">
                      <AlertCircle className="w-4 h-4" />
                      {loadingAvailability ? 'Checking availability...' : 'No availability set for this date. Please select a different date or assign manually.'}
                    </div>
                  )}
                </div>
              )}

              {/* Manual Time Input (fallback) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time (Manual Override)</label>
                <input
                  type="time"
                  value={confirmData.confirmed_time}
                  onChange={(e) => setConfirmData(prev => ({ ...prev, confirmed_time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Staff Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Staff Notes</label>
                <textarea
                  value={confirmData.staff_notes}
                  onChange={(e) => setConfirmData(prev => ({ ...prev, staff_notes: e.target.value }))}
                  rows={3}
                  placeholder="Any special instructions..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setSelectedSeller(null);
                    setSellerAvailability([]);
                  }}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!confirmData.confirmed_date || actionLoading}
                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Cancel Appointment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Cancellation *</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  placeholder="Enter reason..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowCancelModal(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200">Cancel</button>
                <button onClick={submitCancel} disabled={!cancelReason.trim() || actionLoading} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50">Confirm Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complete Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Complete Service</h3>
            <p className="text-gray-600 mb-4">Mark this appointment as completed?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowCompleteModal(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200">Cancel</button>
              <button onClick={submitComplete} disabled={actionLoading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50">Confirm Complete</button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Cancellation Modal */}
      {showApproveCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Approve Cancellation</h3>
                <p className="text-sm text-gray-500">{selectedBooking.case_id}</p>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">Customer reason:</span> {selectedBooking.cancellation_reason}
              </p>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              This will immediately cancel the booking and notify the customer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowApproveCancelModal(false); setSelectedBooking(null); }}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
              >
                Back
              </button>
              <button
                onClick={handleApproveCancellation}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Approve Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deny Cancellation Modal */}
      {showDenyCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <XCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Deny Cancellation</h3>
                <p className="text-sm text-gray-500">{selectedBooking.case_id}</p>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">Customer reason:</span> {selectedBooking.cancellation_reason}
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Denial *
                </label>
                <textarea
                  value={denialReason}
                  onChange={(e) => setDenialReason(e.target.value)}
                  rows={3}
                  placeholder="Explain why this cancellation cannot be approved..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowDenyCancelModal(false); setSelectedBooking(null); setDenialReason(''); }}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
                >
                  Back
                </button>
                <button
                  onClick={handleDenyCancellation}
                  disabled={!denialReason.trim() || actionLoading}
                  className="flex-1 py-2.5 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Deny Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AppointmentInboxPage;
