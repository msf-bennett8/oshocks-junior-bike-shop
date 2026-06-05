import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Shield, CheckCircle, XCircle, Trash2, RotateCcw, AlertTriangle,
  Search, Filter, Calendar, Clock, Users, Bike, MapPin, DollarSign,
  Eye, ChevronLeft, ChevronRight, Flag, Archive, RefreshCw,
  Edit3, Check, X, Save, MessageSquare, Ticket,
} from 'lucide-react';
import eventService from '../../services/eventService';
import customRideService from '../../services/customRideService';
import { useAuth } from '../../context/AuthContext';
import ModerationActionModal from '../../components/common/ModerationActionModal';

const TABS = [
  { key: 'all', label: 'All Events', icon: Calendar },
  { key: 'pending', label: 'Pending Approval', icon: AlertTriangle },
  { key: 'approved', label: 'Active', icon: CheckCircle },
  { key: 'bookings', label: 'Event Bookings', icon: Users },
  { key: 'custom-rides', label: 'Custom Ride Requests', icon: Bike },
  { key: 'scheduled', label: 'Scheduled for Deletion', icon: Clock },
  { key: 'auto-scheduled', label: 'Auto-Scheduled', icon: Calendar },
  { key: 'deleted', label: 'Deleted', icon: Trash2 },
];

const EventsModerationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    // Read tab from URL query param
    const params = new URLSearchParams(window.location.search);
    const tabFromUrl = params.get('tab');
    const validTabs = ['all', 'pending', 'approved', 'bookings', 'custom-rides', 'scheduled', 'auto-scheduled', 'deleted'];
    return validTabs.includes(tabFromUrl) ? tabFromUrl : 'all';
  });
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deletionReason, setDeletionReason] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [customRides, setCustomRides] = useState([]);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [conversionPreview, setConversionPreview] = useState(null);

  // ModerationActionModal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    type: 'confirm',
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
  });

  const isSuperAdmin = user?.role === 'super_admin';

  const openModal = (config) => {
    setModalConfig(config);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalConfig({ type: 'confirm', title: '', message: '', onConfirm: null, onCancel: null });
  };

  // Sync activeTab with URL query param
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tabFromUrl = params.get('tab');
      const validTabs = ['all', 'pending', 'approved', 'bookings', 'custom-rides', 'scheduled', 'auto-scheduled', 'deleted'];
      if (tabFromUrl && validTabs.includes(tabFromUrl) && tabFromUrl !== activeTab) {
        setActiveTab(tabFromUrl);
        setCurrentPage(1);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'custom-rides') {
      fetchCustomRides();
    } else if (activeTab === 'bookings') {
      fetchBookings();
    } else {
      fetchEvents();
    }
    fetchStats();
  }, [activeTab, currentPage, searchQuery]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {
        tab: activeTab === 'bookings' ? 'all' : activeTab,
        page: currentPage,
        per_page: 20,
        ...(searchQuery && { search: searchQuery }),
      };
      const response = await eventService.getModerationEvents(params);
      setEvents(response.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  const [bookings, setBookings] = useState([]);
  const [bookingStats, setBookingStats] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        per_page: 20,
        ...(searchQuery && { search: searchQuery }),
        ...(activeTab !== 'bookings' ? {} : {}),
      };
      const [bookingsRes, statsRes] = await Promise.all([
        eventService.getAllBookings(params),
        eventService.getBookingStats(),
      ]);
      setBookings(bookingsRes.data?.data || []);
      setBookingStats(statsRes.data?.data || null);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

    const fetchCustomRides = async () => {
    try {
      setLoading(true);
      // Map tab to status filter for custom rides
      const statusMap = {
        'all': null,
        'pending': 'reviewing',
        'quoted': 'quoted',
        'approved': 'accepted',
        'scheduled': 'scheduled',
        'completed': 'completed',
        'declined': 'declined',
        'cancelled': 'cancelled',
        'custom-rides': null, // Show all custom rides in this tab
      };
      const statusFilter = statusMap[activeTab] || null;
      const params = {
        page: currentPage,
        per_page: 20,
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter && { status: statusFilter }),
      };
      const response = await customRideService.getAllRequests(params);
      setCustomRides(response.data?.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch custom rides:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewConversion = async (requestId) => {
    try {
      setActionLoading(true);
      const response = await customRideService.getConversionPreview(requestId);
      setConversionPreview(response.data?.data || null);
      setShowConvertModal(true);
    } catch (err) {
      openModal({
        type: 'error',
        title: 'Preview Failed',
        message: err.response?.data?.message || 'Failed to preview conversion',
        showCancel: false,
        onConfirm: closeModal,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvertToEvent = async (requestId) => {
    try {
      setActionLoading(true);
      const response = await customRideService.convertToEvent(requestId);
      const eventCode = response.data?.data?.event_code;
      setShowConvertModal(false);
      setConversionPreview(null);
      fetchCustomRides();
      fetchStats();
      openModal({
        type: 'success',
        title: 'Converted Successfully',
        message: `Request converted to event ${eventCode}.`,
        confirmText: 'View Event',
        showCancel: false,
        onConfirm: () => {
          closeModal();
          navigate(`/events/${eventCode}`);
        },
      });
    } catch (err) {
      openModal({
        type: 'error',
        title: 'Conversion Failed',
        message: err.response?.data?.message || 'Failed to convert to event',
        showCancel: false,
        onConfirm: closeModal,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRideStatus = async (requestId, newStatus) => {
    try {
      setActionLoading(true);
      await customRideService.updateStatus(requestId, newStatus);
      fetchCustomRides();
      fetchStats();
    } catch (err) {
      openModal({
        type: 'error',
        title: 'Update Failed',
        message: err.response?.data?.message || 'Failed to update status',
        showCancel: false,
        onConfirm: closeModal,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await eventService.getModerationStats();
      setStats(response.data?.data || null);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleApprove = async (eventCode) => {
    try {
      setActionLoading(true);
      await eventService.approveEvent(eventCode);
      fetchEvents();
      fetchStats();
      openModal({
        type: 'success',
        title: 'Event Approved',
        message: `Event ${eventCode} has been approved successfully.`,
        showCancel: false,
        onConfirm: closeModal,
      });
    } catch (err) {
      openModal({
        type: 'error',
        title: 'Approval Failed',
        message: err.response?.data?.message || 'Failed to approve event',
        showCancel: false,
        onConfirm: closeModal,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    try {
      setActionLoading(true);
      await eventService.rejectEvent(selectedEvent.event_code, rejectionReason);
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedEvent(null);
      fetchEvents();
      fetchStats();
      openModal({
        type: 'success',
        title: 'Event Rejected',
        message: 'The event has been rejected and the organizer notified.',
        showCancel: false,
        onConfirm: closeModal,
      });
    } catch (err) {
      openModal({
        type: 'error',
        title: 'Rejection Failed',
        message: err.response?.data?.message || 'Failed to reject event',
        showCancel: false,
        onConfirm: closeModal,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateEvent = async () => {
    try {
      setActionLoading(true);
      await eventService.updateEventAdmin(selectedEvent.event_code, editForm);
      setShowEditModal(false);
      setSelectedEvent(null);
      setEditForm({});
      fetchEvents();
      openModal({
        type: 'success',
        title: 'Event Updated',
        message: 'Event details have been updated successfully.',
        showCancel: false,
        onConfirm: closeModal,
      });
    } catch (err) {
      openModal({
        type: 'error',
        title: 'Update Failed',
        message: err.response?.data?.message || 'Failed to update event',
        showCancel: false,
        onConfirm: closeModal,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleScheduleDeletion = async () => {
    if (!deletionReason.trim()) return;
    try {
      setActionLoading(true);
      await eventService.scheduleEventDeletion(selectedEvent.event_code, deletionReason);
      setShowScheduleModal(false);
      setDeletionReason('');
      setSelectedEvent(null);
      fetchEvents();
      fetchStats();
      openModal({
        type: 'success',
        title: 'Deletion Scheduled',
        message: 'Event scheduled for deletion in 30 days. Super admin approval required.',
        showCancel: false,
        onConfirm: closeModal,
      });
    } catch (err) {
      openModal({
        type: 'error',
        title: 'Scheduling Failed',
        message: err.response?.data?.message || 'Failed to schedule deletion',
        showCancel: false,
        onConfirm: closeModal,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveDeletion = (eventCode) => {
    openModal({
      type: 'confirm',
      title: 'Approve Permanent Deletion',
      message: 'This action cannot be undone. The event will be permanently deleted.',
      confirmText: 'Approve Deletion',
      cancelText: 'Cancel',
      onConfirm: async () => {
        closeModal();
        try {
          setActionLoading(true);
          await eventService.approveEventDeletion(eventCode);
          fetchEvents();
          fetchStats();
          openModal({
            type: 'success',
            title: 'Deletion Approved',
            message: 'Event has been permanently deleted.',
            showCancel: false,
            onConfirm: closeModal,
          });
        } catch (err) {
          openModal({
            type: 'error',
            title: 'Approval Failed',
            message: err.response?.data?.message || 'Failed to approve deletion',
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

  const handleRestore = async (eventCode) => {
    try {
      setActionLoading(true);
      await eventService.restoreEvent(eventCode);
      fetchEvents();
      fetchStats();
      openModal({
        type: 'success',
        title: 'Event Restored',
        message: 'Event has been restored successfully.',
        showCancel: false,
        onConfirm: closeModal,
      });
    } catch (err) {
      openModal({
        type: 'error',
        title: 'Restore Failed',
        message: err.response?.data?.message || 'Failed to restore event',
        showCancel: false,
        onConfirm: closeModal,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handlePermanentDelete = (eventCode) => {
    openModal({
      type: 'confirm',
      title: 'Permanent Deletion',
      message: 'This event will be permanently deleted. This action cannot be undone.',
      confirmText: 'Delete Permanently',
      cancelText: 'Cancel',
      onConfirm: async () => {
        closeModal();
        try {
          setActionLoading(true);
          await eventService.permanentDeleteEvent(eventCode);
          fetchEvents();
          fetchStats();
          openModal({
            type: 'success',
            title: 'Deleted',
            message: 'Event has been permanently deleted.',
            showCancel: false,
            onConfirm: closeModal,
          });
        } catch (err) {
          openModal({
            type: 'error',
            title: 'Deletion Failed',
            message: err.response?.data?.message || 'Failed to delete event',
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

  const openScheduleModal = (event) => {
    setSelectedEvent(event);
    setShowScheduleModal(true);
  };

  const openRejectModal = (event) => {
    setSelectedEvent(event);
    setShowRejectModal(true);
  };

  const openEditModal = (event) => {
    setSelectedEvent(event);
    setEditForm({
      title: event.title,
      short_description: event.short_description || '',
      description: event.description || '',
      start_datetime: event.start_datetime ? new Date(event.start_datetime).toISOString().slice(0, 16) : '',
      end_datetime: event.end_datetime ? new Date(event.end_datetime).toISOString().slice(0, 16) : '',
      registration_deadline: event.registration_deadline ? new Date(event.registration_deadline).toISOString().slice(0, 16) : '',
      max_participants: event.max_participants,
      min_participants: event.min_participants || '',
      price_per_person: event.price_per_person,
      member_price: event.member_price || '',
      meeting_point: event.meeting_point,
      distance_km: event.distance_km,
      estimated_duration_hours: event.estimated_duration_hours,
      difficulty: event.difficulty,
      terrain: event.terrain,
      status: event.status,
    });
    setShowEditModal(true);
  };

  const getStatusBadge = (event) => {
    if (event.deleted_at) return { label: 'Deleted', color: 'gray', icon: Trash2 };
    if (event.scheduled_for_deletion_at) return { label: 'Scheduled', color: 'red', icon: Clock };
    if (event.status === 'pending') return { label: 'Pending Approval', color: 'yellow', icon: AlertTriangle };
    if (event.status === 'rejected') return { label: 'Rejected', color: 'red', icon: XCircle };
    if (event.is_archived) return { label: 'Archived', color: 'purple', icon: Archive };
    if (event.status === 'open') return { label: 'Active', color: 'green', icon: CheckCircle };
    if (event.status === 'closed') return { label: 'Closed', color: 'blue', icon: XCircle };
    if (event.status === 'cancelled') return { label: 'Cancelled', color: 'red', icon: XCircle };
    if (event.status === 'completed') return { label: 'Completed', color: 'emerald', icon: CheckCircle };
    return { label: event.status, color: 'gray', icon: Calendar };
  };

  const getBookingStatusBadge = (reg) => {
    if (reg.status === 'registered' && reg.checked_in_at) return { label: 'Checked In', color: 'emerald', icon: CheckCircle };
    if (reg.status === 'registered') return { label: 'Registered', color: 'green', icon: CheckCircle };
    if (reg.status === 'waitlisted') return { label: `Waitlist #${reg.waitlist_position}`, color: 'yellow', icon: Clock };
    if (reg.status === 'cancelled') return { label: 'Cancelled', color: 'red', icon: XCircle };
    if (reg.status === 'no_show') return { label: 'No Show', color: 'gray', icon: XCircle };
    if (reg.status === 'attended') return { label: 'Attended', color: 'blue', icon: CheckCircle };
    return { label: reg.status, color: 'gray', icon: Calendar };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet><title>Events Moderation | Admin</title></Helmet>

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-orange-500" />
            <h1 className="text-2xl font-bold text-gray-900">Events Moderation</h1>
          </div>
          <p className="text-gray-600">Approve, edit, and manage cycling events.</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { label: 'Total', value: stats.total_events, icon: Calendar, color: 'blue' },
              { label: 'Pending', value: stats.pending_approval, icon: AlertTriangle, color: 'yellow' },
              { label: 'Active', value: stats.approved_events, icon: CheckCircle, color: 'green' },
              { label: 'Custom Rides', value: stats.custom_ride_events, icon: Bike, color: 'indigo' },
              { label: 'To Convert', value: stats.pending_custom_rides, icon: RefreshCw, color: 'cyan' },
              { label: 'Rejected', value: stats.rejected_events, icon: XCircle, color: 'red' },
              { label: 'Archived', value: stats.archived_events, icon: Archive, color: 'purple' },
              { label: 'Scheduled', value: stats.scheduled_for_deletion, icon: Clock, color: 'orange' },
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
                onClick={() => { 
                  setActiveTab(tab.key); 
                  setCurrentPage(1);
                  // Update URL without reload for shareable tabs
                  const url = new URL(window.location);
                  if (tab.key === 'all') {
                    url.searchParams.delete('tab');
                  } else {
                    url.searchParams.set('tab', tab.key);
                  }
                  window.history.replaceState({}, '', url);
                }}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Events Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-semibold">
                <tr>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Organizer</th>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Capacity</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
                ) : activeTab === 'bookings' ? (
                  bookings.length === 0 ? (
                    <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">No bookings found</td></tr>
                  ) : (
                    bookings.map((reg) => {
                      const status = getBookingStatusBadge(reg);
                      return (
                        <tr key={reg.registration_code} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {(reg.user?.name || 'G').charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">{reg.user?.name || 'Guest'}</p>
                                <p className="text-xs text-gray-500">{reg.user?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{reg.event?.title}</p>
                              <p className="text-xs text-gray-500">{reg.event?.event_code}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-xs text-gray-600">
                              <div className="flex items-center gap-1 mb-0.5">
                                <Calendar className="w-3 h-3" />
                                {reg.event ? new Date(reg.event.start_datetime).toLocaleDateString() : '—'}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Users className="w-3 h-3" />
                              {reg.participant_count}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-xs font-semibold text-gray-900">
                              KSh {Number(reg.final_amount).toLocaleString()}
                            </div>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                              reg.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                              reg.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {reg.payment_status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 bg-${status.color}-100 text-${status.color}-700 rounded-full text-xs font-medium flex items-center gap-1`}>
                              <status.icon className="w-3 h-3" />
                              {status.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => navigate(`/admin/event-bookings/${reg.event?.event_code}`)}
                                className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                                title="View details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {!reg.checked_in_at && reg.status === 'registered' && (
                                <button
                                  onClick={async () => {
                                    try {
                                      await eventService.checkInBooking(reg.registration_code);
                                      fetchBookings();
                                    } catch (e) {
                                      alert(e.response?.data?.message || 'Check-in failed');
                                    }
                                  }}
                                  disabled={actionLoading}
                                  className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                                  title="Check in"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )
                ) : activeTab === 'custom-rides' ? (
                  customRides.length === 0 ? (
                    <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">No custom ride requests found</td></tr>
                  ) : (
                    customRides.map((ride) => (
                      <tr key={ride.request_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={ride.images?.[0]?.secure_url || '/placeholder-bike.jpg'}
                              alt=""
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-semibold text-gray-900 line-clamp-1">{ride.title}</p>
                              <p className="text-xs text-gray-500">{ride.request_id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {(ride.submitted_by || 'G').charAt(0)}
                            </div>
                            <span className="text-gray-700 text-sm">{ride.submitted_by || 'Guest'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-gray-600">
                            <div className="flex items-center gap-1 mb-0.5">
                              <Calendar className="w-3 h-3" />
                              {new Date(ride.preferred_date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {ride.duration_hours}h
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Users className="w-3 h-3" />
                            {ride.rider_count || ride.group_size}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs font-semibold text-gray-900">
                            KSh {Number(ride.budget_estimate || 0).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            ride.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            ride.status === 'quoted' ? 'bg-blue-100 text-blue-700' :
                            ride.status === 'reviewing' ? 'bg-yellow-100 text-yellow-700' :
                            ride.status === 'converted' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {ride.status}
                          </span>
                          {ride.converted_event_code && (
                            <span className="block text-[10px] text-purple-600 mt-0.5">
                              → {ride.converted_event_code}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 flex-wrap">
                            {/* Quote (reviewing only) */}
                            {ride.status === 'reviewing' && (
                              <button
                                onClick={() => handleUpdateRideStatus(ride.request_id, 'quoted')}
                                disabled={actionLoading}
                                className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                                title="Mark as quoted"
                              >
                                <DollarSign className="w-4 h-4" />
                              </button>
                            )}

                            {/* Accept (quoted only) */}
                            {ride.status === 'quoted' && (
                              <button
                                onClick={() => handleUpdateRideStatus(ride.request_id, 'accepted')}
                                disabled={actionLoading}
                                className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                                title="Accept request"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}

                            {/* Decline (reviewing or quoted) */}
                            {(ride.status === 'reviewing' || ride.status === 'quoted') && (
                              <button
                                onClick={() => handleUpdateRideStatus(ride.request_id, 'declined')}
                                disabled={actionLoading}
                                className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                title="Decline request"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}

                            {/* Convert to Event (accepted only, not already converted) */}
                            {ride.status === 'accepted' && !ride.converted_event_code && (
                              <>
                                <button
                                  onClick={() => handlePreviewConversion(ride.request_id)}
                                  disabled={actionLoading}
                                  className="p-1.5 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200"
                                  title="Preview conversion"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleConvertToEvent(ride.request_id)}
                                  disabled={actionLoading}
                                  className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                                  title="Convert to event"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </button>
                              </>
                            )}

                            {/* View converted event */}
                            {ride.converted_event_code && (
                              <button
                                onClick={() => navigate(`/events/${ride.converted_event_code}`)}
                                className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                                title="View created event"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}

                            {/* View request details */}
                            <button
                              onClick={() => navigate(`/rides/${ride.request_id}`)}
                              className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                              title="View request"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )
                ) : events.length === 0 ? (
                  <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">No events found</td></tr>
                ) : (
                  events.map((event) => {
                    const statusBadge = getStatusBadge(event);
                    return (
                      <tr key={event.event_code} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={event.photos?.[0]?.url || event.photos?.[0] || '/placeholder-bike.jpg'}
                              alt=""
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-semibold text-gray-900 line-clamp-1">{event.title}</p>
                              <p className="text-xs text-gray-500">{event.event_code}</p>
                              <p className="text-xs text-gray-400">{event.meeting_point}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {(event.organizer_name || 'A').charAt(0)}
                            </div>
                            <div>
                              <span className="text-gray-700 text-sm">{event.organizer_name || 'Unknown'}</span>
                              <span className={`block text-[10px] uppercase ${
                                event.organizer_role === 'admin' || event.organizer_role === 'super_admin'
                                  ? 'text-purple-600 font-semibold'
                                  : 'text-gray-400'
                              }`}>
                                {event.submitted_by || event.organizer_role}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-gray-600">
                            <div className="flex items-center gap-1 mb-0.5">
                              <Calendar className="w-3 h-3" />
                              {new Date(event.start_datetime).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(event.start_datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Users className="w-3 h-3" />
                            {event.current_participants}/{event.max_participants}
                            <span className="text-gray-400">({event.seats_remaining} left)</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs font-semibold text-gray-900">
                            {event.formatted_price || `KSh ${Number(event.price_per_person).toLocaleString()}`}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            <span className={`px-2 py-0.5 bg-${statusBadge.color}-100 text-${statusBadge.color}-700 rounded-full text-xs font-medium flex items-center gap-1`}>
                              <statusBadge.icon className="w-3 h-3" />
                              {statusBadge.label}
                            </span>
                            {event.deletion_approved_by && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                <CheckCircle className="w-3 h-3 inline" /> Del. Approved
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {/* Approve (pending only) */}
                            {event.status === 'pending' && !event.deleted_at && (
                              <button
                                onClick={() => handleApprove(event.event_code)}
                                disabled={actionLoading}
                                className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                                title="Approve event"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}

                            {/* Reject (pending only) */}
                            {event.status === 'pending' && !event.deleted_at && (
                              <button
                                onClick={() => openRejectModal(event)}
                                disabled={actionLoading}
                                className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                title="Reject event"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}

                            {/* Edit */}
                            {!event.deleted_at && (
                              <button
                                onClick={() => openEditModal(event)}
                                disabled={actionLoading}
                                className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                                title="Edit event"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            )}

                            {/* View */}
                            <button
                              onClick={() => navigate(`/events/${event.slug || event.event_code}`)}
                              className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                              title="View event"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* View Bookings (for active/approved events with participants) */}
                            {(event.status === 'open' || event.status === 'closed' || event.current_participants > 0) && (
                              <button
                                onClick={() => navigate(`/admin/event-bookings/${event.event_code}`)}
                                className="relative p-1.5 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200"
                                title={`${event.current_participants} bookings — View & manage`}
                              >
                                <Ticket className="w-4 h-4" />
                                {event.current_participants > 0 && (
                                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-indigo-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                                    {event.current_participants > 9 ? '9+' : event.current_participants}
                                  </span>
                                )}
                              </button>
                            )}

                            {/* Schedule Deletion */}
                            {!event.scheduled_for_deletion_at && !event.deleted_at && event.status !== 'pending' && (
                              <button
                                onClick={() => openScheduleModal(event)}
                                disabled={actionLoading}
                                className="p-1.5 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200"
                                title="Schedule deletion"
                              >
                                <Clock className="w-4 h-4" />
                              </button>
                            )}

                            {/* Approve Deletion (Super Admin only) */}
                            {event.scheduled_for_deletion_at && !event.deletion_approved_by && isSuperAdmin && (
                              <button
                                onClick={() => handleApproveDeletion(event.event_code)}
                                disabled={actionLoading}
                                className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                                title="Approve deletion"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}

                            {/* Restore */}
                            {(event.scheduled_for_deletion_at || event.deleted_at) && (
                              <button
                                onClick={() => handleRestore(event.event_code)}
                                disabled={actionLoading}
                                className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                                title="Restore"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            )}

                            {/* Permanent Delete (Super Admin only) */}
                            {isSuperAdmin && (
                              <button
                                onClick={() => handlePermanentDelete(event.event_code)}
                                disabled={actionLoading}
                                className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                title="Permanent delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
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

      {/* Conversion Preview Modal */}
      {showConvertModal && conversionPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 my-8">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Convert to Event</h3>
            <p className="text-gray-600 text-sm mb-4">
              Preview of the event that will be created from <strong>{conversionPreview.ride_request?.title}</strong>.
            </p>
            
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Title</span>
                <span className="font-semibold text-gray-900">{conversionPreview.event_preview?.title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Type</span>
                <span className="font-semibold text-gray-900 capitalize">{conversionPreview.event_preview?.event_type?.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Difficulty</span>
                <span className="font-semibold text-gray-900 capitalize">{conversionPreview.event_preview?.difficulty}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Distance</span>
                <span className="font-semibold text-gray-900">{conversionPreview.event_preview?.distance_km} km</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Duration</span>
                <span className="font-semibold text-gray-900">{conversionPreview.event_preview?.estimated_duration_hours} hours</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Max Participants</span>
                <span className="font-semibold text-gray-900">{conversionPreview.event_preview?.max_participants}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Price</span>
                <span className="font-semibold text-gray-900">KSh {Number(conversionPreview.event_preview?.price_per_person).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Start</span>
                <span className="font-semibold text-gray-900">{new Date(conversionPreview.event_preview?.start_datetime).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Bike Included</span>
                <span className="font-semibold text-gray-900">{conversionPreview.event_preview?.bike_included ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Photos</span>
                <span className="font-semibold text-gray-900">{conversionPreview.event_preview?.photos_count} images</span>
              </div>
              <div className="p-2 bg-yellow-50 rounded-lg border border-yellow-200 mt-2">
                <p className="text-xs text-yellow-700">
                  <AlertTriangle className="w-3 h-3 inline mr-1" />
                  Meeting point will be set to "To be confirmed" — update after conversion.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowConvertModal(false); setConversionPreview(null); }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConvertToEvent(conversionPreview.ride_request?.request_id)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                {actionLoading ? 'Converting...' : 'Convert to Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reject Event</h3>
            <p className="text-gray-600 text-sm mb-4">
              Rejecting <strong>{selectedEvent.title}</strong>. The organizer will be notified.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm mb-4"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowRejectModal(false); setSelectedEvent(null); setRejectionReason(''); }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || actionLoading}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Deletion Modal */}
      {showScheduleModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Schedule for Deletion</h3>
            <p className="text-gray-600 text-sm mb-4">
              Event will be permanently deleted in 30 days. Super admin approval is required.
            </p>
            <textarea
              value={deletionReason}
              onChange={(e) => setDeletionReason(e.target.value)}
              placeholder="Reason for deletion..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm mb-4"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowScheduleModal(false); setSelectedEvent(null); setDeletionReason(''); }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleDeletion}
                disabled={!deletionReason.trim() || actionLoading}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
              >
                {actionLoading ? 'Scheduling...' : 'Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 my-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Event</h3>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Title</label>
                  <input
                    type="text"
                    value={editForm.title || ''}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                  <select
                    value={editForm.status || ''}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Short Description</label>
                <input
                  type="text"
                  value={editForm.short_description || ''}
                  onChange={(e) => setEditForm({...editForm, short_description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                <textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Start DateTime</label>
                  <input
                    type="datetime-local"
                    value={editForm.start_datetime || ''}
                    onChange={(e) => setEditForm({...editForm, start_datetime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">End DateTime</label>
                  <input
                    type="datetime-local"
                    value={editForm.end_datetime || ''}
                    onChange={(e) => setEditForm({...editForm, end_datetime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Registration Deadline</label>
                <input
                  type="datetime-local"
                  value={editForm.registration_deadline || ''}
                  onChange={(e) => setEditForm({...editForm, registration_deadline: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Max Participants</label>
                  <input
                    type="number"
                    value={editForm.max_participants || ''}
                    onChange={(e) => setEditForm({...editForm, max_participants: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Min Participants</label>
                  <input
                    type="number"
                    value={editForm.min_participants || ''}
                    onChange={(e) => setEditForm({...editForm, min_participants: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Price (KSh)</label>
                  <input
                    type="number"
                    value={editForm.price_per_person || ''}
                    onChange={(e) => setEditForm({...editForm, price_per_person: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Member Price (KSh)</label>
                  <input
                    type="number"
                    value={editForm.member_price || ''}
                    onChange={(e) => setEditForm({...editForm, member_price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Meeting Point</label>
                  <input
                    type="text"
                    value={editForm.meeting_point || ''}
                    onChange={(e) => setEditForm({...editForm, meeting_point: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.distance_km || ''}
                    onChange={(e) => setEditForm({...editForm, distance_km: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Duration (hrs)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editForm.estimated_duration_hours || ''}
                    onChange={(e) => setEditForm({...editForm, estimated_duration_hours: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Difficulty</label>
                  <select
                    value={editForm.difficulty || ''}
                    onChange={(e) => setEditForm({...editForm, difficulty: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="casual">Casual</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Terrain</label>
                  <select
                    value={editForm.terrain || ''}
                    onChange={(e) => setEditForm({...editForm, terrain: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value="road">Road</option>
                    <option value="gravel">Gravel</option>
                    <option value="mtb_trail">MTB Trail</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => { setShowEditModal(false); setSelectedEvent(null); setEditForm({}); }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateEvent}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {actionLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

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

export default EventsModerationPage;