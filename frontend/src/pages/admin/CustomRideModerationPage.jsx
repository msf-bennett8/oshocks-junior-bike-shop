import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Shield, CheckCircle, XCircle, Trash2, RotateCcw, AlertTriangle,
  Search, Calendar, Clock, Bike, MapPin, DollarSign, Eye, Users,
  RefreshCw, Check, X, MessageSquare, Edit3, Save, ArrowRight,
  Loader2
} from 'lucide-react';
import customRideService from '../../services/customRideService';
import { useAuth } from '../../context/AuthContext';
import ModerationActionModal from '../../components/common/ModerationActionModal';

const TABS = [
  { key: 'all', label: 'All Requests', icon: Bike },
  { key: 'reviewing', label: 'Pending Review', icon: AlertTriangle },
  { key: 'quoted', label: 'Quoted', icon: DollarSign },
  { key: 'accepted', label: 'Accepted', icon: CheckCircle },
  { key: 'converted', label: 'Converted', icon: RefreshCw },
  { key: 'scheduled', label: 'Scheduled', icon: Calendar },
  { key: 'completed', label: 'Completed', icon: CheckCircle },
  { key: 'declined', label: 'Declined', icon: XCircle },
  { key: 'cancelled', label: 'Cancelled', icon: Trash2 },
];

const CustomRideModerationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [quoteForm, setQuoteForm] = useState({
    base_rental_price: '',
    add_ons_price: '',
    insurance_price: '',
    transport_price: '',
    security_deposit: '',
    total_price: '',
    base_rental_adjustment_note: '',
    add_ons_adjustment_note: '',
    insurance_adjustment_note: '',
    transport_adjustment_note: '',
    security_deposit_adjustment_note: '',
    total_price_adjustment_note: '',
    general_adjustment_notes: '',
    staff_notes: '',
  });
  const [staffNotes, setStaffNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
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

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, [activeTab, currentPage, searchQuery]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const statusFilter = activeTab === 'all' ? null : activeTab;
      const params = {
        page: currentPage,
        per_page: 20,
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter && { status: statusFilter }),
      };
      const response = await customRideService.getAllRequests(params);
      setRequests(response.data?.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch custom ride requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await customRideService.getStats();
      setStats(response.data?.data || null);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleUpdateStatus = async (requestId, newStatus, notes = '') => {
    openModal({
      type: 'confirm',
      title: `Confirm ${newStatus}`,
      message: `Are you sure you want to mark this request as "${newStatus}"?`,
      confirmText: 'Yes, Proceed',
      cancelText: 'Cancel',
      onConfirm: async () => {
        closeModal();
        try {
          setActionLoading(true);
          await customRideService.updateStatus(requestId, newStatus, notes);
          fetchRequests();
          fetchStats();
          openModal({
            type: 'success',
            title: 'Success',
            message: `Request status updated to ${newStatus} successfully.`,
            showCancel: false,
            onConfirm: closeModal,
          });
        } catch (err) {
          openModal({
            type: 'error',
            title: 'Error',
            message: err.response?.data?.message || 'Failed to update status',
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

  const handleQuote = async () => {
    if (!selectedRequest) return;
    try {
      setActionLoading(true);
      await customRideService.quoteRequest(selectedRequest.request_id, quoteForm);
      fetchRequests();
      fetchStats();
      setShowQuoteModal(false);
      setSelectedRequest(null);
      setQuoteForm({
        base_rental_price: '',
        add_ons_price: '',
        insurance_price: '',
        transport_price: '',
        security_deposit: '',
        total_price: '',
        base_rental_adjustment_note: '',
        add_ons_adjustment_note: '',
        insurance_adjustment_note: '',
        transport_adjustment_note: '',
        security_deposit_adjustment_note: '',
        total_price_adjustment_note: '',
        general_adjustment_notes: '',
        staff_notes: '',
      });
      openModal({
        type: 'success',
        title: 'Quote Sent',
        message: 'The quote has been sent to the customer successfully.',
        showCancel: false,
        onConfirm: closeModal,
      });
    } catch (err) {
      openModal({
        type: 'error',
        title: 'Quote Failed',
        message: err.response?.data?.message || 'Failed to send quote',
        showCancel: false,
        onConfirm: closeModal,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handlePreviewConversion = async (requestId) => {
    try {
      setActionLoading(true);
      const response = await customRideService.getConversionPreview(requestId);
      setConversionPreview(response.data?.data || null);
      setShowConvertModal(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to preview conversion');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvertToEvent = async (requestId) => {
    openModal({
      type: 'confirm',
      title: 'Convert to Event',
      message: 'This will create a new cycling event from this request. Continue?',
      confirmText: 'Convert',
      cancelText: 'Cancel',
      onConfirm: async () => {
        closeModal();
        try {
          setActionLoading(true);
          const response = await customRideService.convertToEvent(requestId);
          const eventCode = response.data?.data?.event_code;
          setShowConvertModal(false);
          setConversionPreview(null);
          fetchRequests();
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
      },
      onCancel: closeModal,
    });
  };

  const openQuoteModal = (request) => {
    setSelectedRequest(request);
    setQuoteForm({
      base_rental_price: request.base_rental_price || '',
      add_ons_price: request.add_ons_price || '',
      insurance_price: request.insurance_price || '',
      transport_price: request.transport_price || '',
      security_deposit: request.security_deposit || '',
      total_price: request.total_price || '',
      base_rental_adjustment_note: request.base_rental_adjustment_note || '',
      add_ons_adjustment_note: request.add_ons_adjustment_note || '',
      insurance_adjustment_note: request.insurance_adjustment_note || '',
      transport_adjustment_note: request.transport_adjustment_note || '',
      security_deposit_adjustment_note: request.security_deposit_adjustment_note || '',
      total_price_adjustment_note: request.total_price_adjustment_note || '',
      general_adjustment_notes: request.general_adjustment_notes || '',
      staff_notes: request.staff_notes || '',
    });
    setShowQuoteModal(true);
  };

  // Auto-calculate total when any component price changes
  useEffect(() => {
    if (!showQuoteModal || !selectedRequest) return;
    
    const base = Number(quoteForm.base_rental_price) || 0;
    const addons = Number(quoteForm.add_ons_price) || 0;
    const insurance = Number(quoteForm.insurance_price) || 0;
    const transport = Number(quoteForm.transport_price) || 0;
    const deposit = Number(quoteForm.security_deposit) || 0;
    
    const calculatedTotal = base + addons + insurance + transport + deposit;
    
    // Only auto-update if user hasn't manually entered a total
    const currentTotal = Number(quoteForm.total_price);
    if (!currentTotal || currentTotal === 0) {
      setQuoteForm(prev => ({ ...prev, total_price: calculatedTotal.toString() }));
    }
  }, [
    quoteForm.base_rental_price,
    quoteForm.add_ons_price,
    quoteForm.insurance_price,
    quoteForm.transport_price,
    quoteForm.security_deposit,
    showQuoteModal,
    selectedRequest
  ]);

  const openNotesModal = (request) => {
    setSelectedRequest(request);
    setStaffNotes(request.staff_notes || '');
    setShowNotesModal(true);
  };

  const handleSaveNotes = async () => {
    if (!selectedRequest) return;
    try {
      setActionLoading(true);
      await customRideService.updateStatus(selectedRequest.request_id, selectedRequest.status, staffNotes);
      fetchRequests();
      setShowNotesModal(false);
      setSelectedRequest(null);
      setStaffNotes('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save notes');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      reviewing: { label: 'Pending Review', color: 'yellow', icon: AlertTriangle },
      quoted: { label: 'Quoted', color: 'blue', icon: DollarSign },
      accepted: { label: 'Accepted', color: 'green', icon: CheckCircle },
      converted: { label: 'Converted', color: 'purple', icon: RefreshCw },
      scheduled: { label: 'Scheduled', color: 'purple', icon: Calendar },
      completed: { label: 'Completed', color: 'emerald', icon: CheckCircle },
      declined: { label: 'Declined', color: 'red', icon: XCircle },
      cancelled: { label: 'Cancelled', color: 'gray', icon: Trash2 },
      expired: { label: 'Expired', color: 'slate', icon: Clock },
    };
    return map[status] || { label: status, color: 'gray', icon: Bike };
  };

  // Helper to open moderation modal
  const openModal = (config) => {
    setModalConfig(config);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalConfig({ type: 'confirm', title: '', message: '', onConfirm: null, onCancel: null });
  };

  const formatPrice = (amount) => {
    return amount ? `KSh ${Number(amount).toLocaleString()}` : '-';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet><title>Custom Ride Requests | Admin</title></Helmet>

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-indigo-500" />
            <h1 className="text-2xl font-bold text-gray-900">Custom Ride Requests</h1>
          </div>
          <p className="text-gray-600">Manage custom ride requests, quotes, and conversions.</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { label: 'Total', value: stats.total, icon: Bike, color: 'blue' },
              { label: 'Pending', value: stats.reviewing, icon: AlertTriangle, color: 'yellow' },
              { label: 'Quoted', value: stats.quoted, icon: DollarSign, color: 'blue' },
              { label: 'Accepted', value: stats.accepted, icon: CheckCircle, color: 'green' },
              { label: 'Scheduled', value: stats.scheduled, icon: Calendar, color: 'purple' },
              { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'emerald' },
              { label: 'Declined', value: stats.declined, icon: XCircle, color: 'red' },
              { label: 'Today', value: stats.today, icon: Clock, color: 'indigo' },
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

          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Requests Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-semibold">
                <tr>
                  <th className="px-4 py-3">Request</th>
                  <th className="px-4 py-3">Submitted By</th>
                  <th className="px-4 py-3">Date & Riders</th>
                  <th className="px-4 py-3">Pricing</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
                ) : requests.length === 0 ? (
                  <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">No requests found</td></tr>
                ) : (
                  requests.map((request) => {
                    const statusBadge = getStatusBadge(request.status);
                    return (
                      <tr key={request.request_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={request.images?.[0]?.secure_url || '/placeholder-bike.jpg'}
                              alt=""
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-semibold text-gray-900 line-clamp-1">{request.title}</p>
                              <p className="text-xs text-gray-500">{request.request_id}</p>
                              <p className="text-xs text-gray-400 capitalize">{request.difficulty} • {request.terrain}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {(request.submitted_by || 'G').charAt(0)}
                            </div>
                            <div>
                              <span className="text-gray-700 text-sm">{request.submitted_by || 'Guest'}</span>
                              <span className="block text-[10px] text-gray-400">{request.contact_phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-gray-600">
                            <div className="flex items-center gap-1 mb-0.5">
                              <Calendar className="w-3 h-3" />
                              {new Date(request.preferred_date).toLocaleDateString()}
                              {request.date_flexible && <span className="text-yellow-600"> (±{request.date_flexibility_days}d)</span>}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {request.rider_count || request.group_size} riders
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {request.distance_km}km • {request.duration_hours}h
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs">
                            <p className="font-semibold text-gray-900">{formatPrice(request.total_price)}</p>
                            <p className="text-gray-400">Budget: {formatPrice(request.budget_estimate)}</p>
                            {request.base_rental_price > 0 && (
                              <p className="text-gray-400">Base: {formatPrice(request.base_rental_price)}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            <span className={`px-2 py-0.5 bg-${statusBadge.color}-100 text-${statusBadge.color}-700 rounded-full text-xs font-medium flex items-center gap-1`}>
                              <statusBadge.icon className="w-3 h-3" />
                              {statusBadge.label}
                            </span>
                            {request.converted_event_code && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                → {request.converted_event_code}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 flex-wrap">
                            {/* Quote (reviewing only) */}
                            {request.status === 'reviewing' && (
                              <button
                                onClick={() => openQuoteModal(request)}
                                disabled={actionLoading}
                                className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                                title="Quote request"
                              >
                                <DollarSign className="w-4 h-4" />
                              </button>
                            )}

                            {/* Accept (quoted only) */}
                            {request.status === 'quoted' && (
                              <button
                                onClick={() => handleUpdateStatus(request.request_id, 'accepted')}
                                disabled={actionLoading}
                                className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                                title="Accept request"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}

                            {/* Decline (reviewing or quoted) */}
                            {(request.status === 'reviewing' || request.status === 'quoted') && (
                              <button
                                onClick={() => handleUpdateStatus(request.request_id, 'declined')}
                                disabled={actionLoading}
                                className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                title="Decline request"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}

                            {/* Convert to Event (accepted, not converted) */}
                            {request.status === 'accepted' && !request.converted_event_code && (
                              <>
                                <button
                                  onClick={() => handlePreviewConversion(request.request_id)}
                                  disabled={actionLoading}
                                  className="p-1.5 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200"
                                  title="Preview conversion"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleConvertToEvent(request.request_id)}
                                  disabled={actionLoading}
                                  className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                                  title="Convert to event"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </button>
                              </>
                            )}

                            {/* View converted event */}
                            {request.converted_event_code && (
                              <button
                                onClick={() => navigate(`/events/${request.converted_event_code}`)}
                                className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                                title="View event"
                              >
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            )}

                            {/* View details */}
                            <button
                              onClick={() => navigate(`/rides/${request.request_id}`)}
                              className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Staff notes */}
                            <button
                              onClick={() => openNotesModal(request)}
                              disabled={actionLoading}
                              className="p-1.5 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200"
                              title="Staff notes"
                            >
                              <MessageSquare className="w-4 h-4" />
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

      {/* Quote Modal */}
      {showQuoteModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 my-8">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Quote Request</h3>
            <p className="text-gray-600 text-sm mb-4">
              Review original pricing and set adjusted values for <strong>{selectedRequest.title}</strong>
            </p>

            <div className="space-y-4 mb-4 max-h-[60vh] overflow-y-auto pr-2">
              {/* Base Rental */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Base Rental</label>
                  <span className="text-xs text-gray-500">
                    Original: <span className="line-through text-gray-400 mr-1">KSh {Number(selectedRequest.base_rental_price || 0).toLocaleString()}</span>
                    {Number(quoteForm.base_rental_price || 0) !== Number(selectedRequest.base_rental_price || 0) && (
                      <span className="text-green-600 font-semibold">→ KSh {Number(quoteForm.base_rental_price || 0).toLocaleString()}</span>
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1">Adjusted Price (KSh)</label>
                    <input
                      type="number"
                      value={quoteForm.base_rental_price}
                      onChange={(e) => setQuoteForm({...quoteForm, base_rental_price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="e.g. 5000"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1">Adjustment Note</label>
                    <input
                      type="text"
                      value={quoteForm.base_rental_adjustment_note}
                      onChange={(e) => setQuoteForm({...quoteForm, base_rental_adjustment_note: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="Why changed?"
                    />
                  </div>
                </div>
              </div>

              {/* Add-ons */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Add-ons</label>
                  <span className="text-xs text-gray-500">
                    Original: <span className="line-through text-gray-400 mr-1">KSh {Number(selectedRequest.add_ons_price || 0).toLocaleString()}</span>
                    {Number(quoteForm.add_ons_price || 0) !== Number(selectedRequest.add_ons_price || 0) && (
                      <span className="text-green-600 font-semibold">→ KSh {Number(quoteForm.add_ons_price || 0).toLocaleString()}</span>
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1">Adjusted Price (KSh)</label>
                    <input
                      type="number"
                      value={quoteForm.add_ons_price}
                      onChange={(e) => setQuoteForm({...quoteForm, add_ons_price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="e.g. 800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1">Adjustment Note</label>
                    <input
                      type="text"
                      value={quoteForm.add_ons_adjustment_note}
                      onChange={(e) => setQuoteForm({...quoteForm, add_ons_adjustment_note: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="Why changed?"
                    />
                  </div>
                </div>
              </div>

              {/* Insurance */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Insurance</label>
                  <span className="text-xs text-gray-500">
                    Original: <span className="line-through text-gray-400 mr-1">KSh {Number(selectedRequest.insurance_price || 0).toLocaleString()}</span>
                    {Number(quoteForm.insurance_price || 0) !== Number(selectedRequest.insurance_price || 0) && (
                      <span className="text-green-600 font-semibold">→ KSh {Number(quoteForm.insurance_price || 0).toLocaleString()}</span>
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1">Adjusted Price (KSh)</label>
                    <input
                      type="number"
                      value={quoteForm.insurance_price}
                      onChange={(e) => setQuoteForm({...quoteForm, insurance_price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="e.g. 500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1">Adjustment Note</label>
                    <input
                      type="text"
                      value={quoteForm.insurance_adjustment_note}
                      onChange={(e) => setQuoteForm({...quoteForm, insurance_adjustment_note: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="Why changed?"
                    />
                  </div>
                </div>
              </div>

              {/* Transport */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Transport</label>
                  <span className="text-xs text-gray-500">
                    Original: <span className="line-through text-gray-400 mr-1">KSh {Number(selectedRequest.transport_price || 0).toLocaleString()}</span>
                    {Number(quoteForm.transport_price || 0) !== Number(selectedRequest.transport_price || 0) && (
                      <span className="text-green-600 font-semibold">→ KSh {Number(quoteForm.transport_price || 0).toLocaleString()}</span>
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1">Adjusted Price (KSh)</label>
                    <input
                      type="number"
                      value={quoteForm.transport_price}
                      onChange={(e) => setQuoteForm({...quoteForm, transport_price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="e.g. 1500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1">Adjustment Note</label>
                    <input
                      type="text"
                      value={quoteForm.transport_adjustment_note}
                      onChange={(e) => setQuoteForm({...quoteForm, transport_adjustment_note: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="Why changed?"
                    />
                  </div>
                </div>
              </div>

              {/* Security Deposit */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Security Deposit</label>
                  <span className="text-xs text-gray-500">
                    Original: <span className="line-through text-gray-400 mr-1">KSh {Number(selectedRequest.security_deposit || 0).toLocaleString()}</span>
                    {Number(quoteForm.security_deposit || 0) !== Number(selectedRequest.security_deposit || 0) && (
                      <span className="text-green-600 font-semibold">→ KSh {Number(quoteForm.security_deposit || 0).toLocaleString()}</span>
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1">Adjusted Price (KSh)</label>
                    <input
                      type="number"
                      value={quoteForm.security_deposit}
                      onChange={(e) => setQuoteForm({...quoteForm, security_deposit: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="e.g. 3000"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1">Adjustment Note</label>
                    <input
                      type="text"
                      value={quoteForm.security_deposit_adjustment_note}
                      onChange={(e) => setQuoteForm({...quoteForm, security_deposit_adjustment_note: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="Why changed?"
                    />
                  </div>
                </div>
              </div>

              {/* Total Price - Auto-calculated */}
              <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-orange-800 uppercase tracking-wider">Total Price</label>
                  <div className="text-right">
                    <span className="text-xs text-orange-600 block">
                      Original: <span className="line-through text-orange-400 mr-1">KSh {Number(selectedRequest.total_price || 0).toLocaleString()}</span>
                    </span>
                    <span className="text-xs font-bold text-orange-800">
                      Auto: KSh {(
                        Number(quoteForm.base_rental_price || 0) +
                        Number(quoteForm.add_ons_price || 0) +
                        Number(quoteForm.insurance_price || 0) +
                        Number(quoteForm.transport_price || 0) +
                        Number(quoteForm.security_deposit || 0)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-orange-600 mb-1">Adjusted Total (KSh)</label>
                    <input
                      type="number"
                      value={quoteForm.total_price}
                      onChange={(e) => setQuoteForm({...quoteForm, total_price: e.target.value})}
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg text-sm bg-white font-bold"
                      placeholder="Auto-calculated or override"
                    />
                    <p className="text-[10px] text-orange-500 mt-1">Leave empty to use auto-calculation</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-orange-600 mb-1">Adjustment Note</label>
                    <input
                      type="text"
                      value={quoteForm.total_price_adjustment_note}
                      onChange={(e) => setQuoteForm({...quoteForm, total_price_adjustment_note: e.target.value})}
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg text-sm bg-white"
                      placeholder="Summary of changes"
                    />
                  </div>
                </div>
              </div>

              {/* General Notes */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <label className="block text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">General Adjustment Notes</label>
                <textarea
                  value={quoteForm.general_adjustment_notes}
                  onChange={(e) => setQuoteForm({...quoteForm, general_adjustment_notes: e.target.value})}
                  placeholder="Overall explanation for the customer about pricing changes..."
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm bg-white"
                  rows={3}
                />
              </div>

              {/* Staff Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Internal Staff Notes</label>
                <textarea
                  value={quoteForm.staff_notes}
                  onChange={(e) => setQuoteForm({...quoteForm, staff_notes: e.target.value})}
                  placeholder="Internal notes for staff only (not visible to customer)..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => { setShowQuoteModal(false); setSelectedRequest(null); }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleQuote}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                {actionLoading ? 'Saving...' : 'Send Quote'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                <span className="text-gray-500">Price</span>
                <span className="font-semibold text-gray-900">KSh {Number(conversionPreview.event_preview?.price_per_person).toLocaleString()}</span>
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
                <RefreshCw className="w-4 h-4" />
                {actionLoading ? 'Converting...' : 'Convert to Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Notes Modal */}
      {showNotesModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Staff Notes</h3>
            <p className="text-gray-600 text-sm mb-4">
              For request <strong>{selectedRequest.request_id}</strong>
            </p>
            <textarea
              value={staffNotes}
              onChange={(e) => setStaffNotes(e.target.value)}
              placeholder="Add internal notes..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm mb-4"
              rows={4}
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowNotesModal(false); setSelectedRequest(null); setStaffNotes(''); }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
              >
                {actionLoading ? 'Saving...' : 'Save Notes'}
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
      >
        {modalConfig.children}
      </ModerationActionModal>
    </div>
  );
};

export default CustomRideModerationPage;
