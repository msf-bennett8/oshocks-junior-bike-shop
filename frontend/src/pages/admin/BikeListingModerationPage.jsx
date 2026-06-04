import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Shield, CheckCircle, XCircle, Trash2, RotateCcw, AlertTriangle,
  Search, Calendar, Clock, Bike, MapPin, DollarSign, Eye, Pause, Play,
  Archive, Wrench, Check, X, Save, Edit3, Star
} from 'lucide-react';
import bikeService from '../../services/bikeService';
import { useAuth } from '../../context/AuthContext';

const TABS = [
  { key: 'all', label: 'All Listings', icon: Bike },
  { key: 'pending', label: 'Pending Review', icon: AlertTriangle },
  { key: 'approved', label: 'Active', icon: CheckCircle },
  { key: 'paused', label: 'Paused', icon: Pause },
  { key: 'rejected', label: 'Rejected', icon: XCircle },
  { key: 'scheduled', label: 'Scheduled for Deletion', icon: Clock },
  { key: 'deleted', label: 'Deleted', icon: Trash2 },
];

const BikeListingModerationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOutOfServiceModal, setShowOutOfServiceModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [deletionReason, setDeletionReason] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [oosForm, setOosForm] = useState({ reason: '', start_datetime: '', end_datetime: '' });

  const isSuperAdmin = user?.role === 'super_admin';

  useEffect(() => {
    fetchListings();
    fetchStats();
  }, [activeTab, currentPage, searchQuery]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params = {
        tab: activeTab,
        page: currentPage,
        per_page: 20,
        ...(searchQuery && { search: searchQuery }),
      };
      const response = await bikeService.getModerationListings(params);
      setListings(response.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await bikeService.getModerationStats();
      setStats(response.data?.data || null);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleApprove = async (listingCode) => {
    try {
      setActionLoading(true);
      await bikeService.approveListing(listingCode);
      fetchListings();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve listing');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    try {
      setActionLoading(true);
      await bikeService.rejectListing(selectedListing.listing_code, rejectionReason);
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedListing(null);
      fetchListings();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject listing');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateListing = async () => {
    try {
      setActionLoading(true);
      await bikeService.updateListingAdmin(selectedListing.listing_code, editForm);
      setShowEditModal(false);
      setSelectedListing(null);
      setEditForm({});
      fetchListings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update listing');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = async (listingCode) => {
    try {
      setActionLoading(true);
      await bikeService.pauseListing(listingCode);
      fetchListings();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to pause listing');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async (listingCode) => {
    try {
      setActionLoading(true);
      await bikeService.resumeListing(listingCode);
      fetchListings();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resume listing');
    } finally {
      setActionLoading(false);
    }
  };

  const handleScheduleDeletion = async () => {
    if (!deletionReason.trim()) return;
    try {
      setActionLoading(true);
      await bikeService.scheduleListingDeletion(selectedListing.listing_code, deletionReason);
      setShowScheduleModal(false);
      setDeletionReason('');
      setSelectedListing(null);
      fetchListings();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule deletion');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkOutOfService = async () => {
    if (!oosForm.reason.trim() || !oosForm.start_datetime || !oosForm.end_datetime) return;
    try {
      setActionLoading(true);
      await bikeService.markOutOfService(selectedListing.listing_code, oosForm);
      setShowOutOfServiceModal(false);
      setOosForm({ reason: '', start_datetime: '', end_datetime: '' });
      setSelectedListing(null);
      fetchListings();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark out of service');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveDeletion = async (listingCode) => {
    if (!window.confirm('Approve permanent deletion? This cannot be undone.')) return;
    try {
      setActionLoading(true);
      await bikeService.approveListingDeletion(listingCode);
      fetchListings();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve deletion');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async (listingCode) => {
    try {
      setActionLoading(true);
      await bikeService.restoreListing(listingCode);
      fetchListings();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to restore listing');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePermanentDelete = async (listingCode) => {
    if (!window.confirm('PERMANENTLY DELETE? This cannot be undone.')) return;
    try {
      setActionLoading(true);
      await bikeService.permanentDeleteListing(listingCode);
      fetchListings();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete listing');
    } finally {
      setActionLoading(false);
    }
  };

  const openScheduleModal = (listing) => {
    setSelectedListing(listing);
    setShowScheduleModal(true);
  };

  const openRejectModal = (listing) => {
    setSelectedListing(listing);
    setShowRejectModal(true);
  };

  const openEditModal = (listing) => {
    setSelectedListing(listing);
    setEditForm({
      name: listing.name,
      brand: listing.brand,
      model: listing.model,
      year: listing.year,
      category: listing.category,
      frame_size: listing.frame_size,
      wheel_size: listing.wheel_size,
      bike_condition: listing.bike_condition,
      description: listing.description,
      daily_rate: listing.daily_rate,
      hourly_rate: listing.hourly_rate,
      weekly_rate: listing.weekly_rate,
      monthly_rate: listing.monthly_rate,
      security_deposit: listing.security_deposit,
      min_rental_hours: listing.min_rental_hours,
      max_rental_days: listing.max_rental_days,
      location_address: listing.location_address,
      pickup_type: listing.pickup_type,
      delivery_fee: listing.delivery_fee,
      instant_book: listing.instant_book,
      response_time_hours: listing.response_time_hours,
      rental_rules: listing.rental_rules,
      cancellation_policy: listing.cancellation_policy,
      insurance_included: listing.insurance_included,
      listing_status: listing.listing_status,
      is_active: listing.is_active,
      is_verified: listing.is_verified,
    });
    setShowEditModal(true);
  };

  const openOutOfServiceModal = (listing) => {
    setSelectedListing(listing);
    setOosForm({ reason: '', start_datetime: '', end_datetime: '' });
    setShowOutOfServiceModal(true);
  };

  const getStatusBadge = (listing) => {
    if (listing.deleted_at) return { label: 'Deleted', color: 'gray', icon: Trash2 };
    if (listing.scheduled_for_deletion_at) return { label: 'Scheduled', color: 'red', icon: Clock };
    if (listing.listing_status === 'pending_review') return { label: 'Pending', color: 'yellow', icon: AlertTriangle };
    if (listing.listing_status === 'rejected') return { label: 'Rejected', color: 'red', icon: XCircle };
    if (listing.listing_status === 'paused') return { label: 'Paused', color: 'orange', icon: Pause };
    if (listing.is_archived) return { label: 'Archived', color: 'purple', icon: Archive };
    if (listing.listing_status === 'approved') return { label: 'Active', color: 'green', icon: CheckCircle };
    return { label: listing.listing_status, color: 'gray', icon: Bike };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet><title>Bike Listing Moderation | Admin</title></Helmet>

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-green-500" />
            <h1 className="text-2xl font-bold text-gray-900">Bike Listing Moderation</h1>
          </div>
          <p className="text-gray-600">Approve, edit, and manage bike rental listings.</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { label: 'Total', value: stats.total_listings, icon: Bike, color: 'blue' },
              { label: 'Pending', value: stats.pending_review, icon: AlertTriangle, color: 'yellow' },
              { label: 'Active', value: stats.approved_listings, icon: CheckCircle, color: 'green' },
              { label: 'Paused', value: stats.paused_listings, icon: Pause, color: 'orange' },
              { label: 'Rejected', value: stats.rejected_listings, icon: XCircle, color: 'red' },
              { label: 'Archived', value: stats.archived_listings, icon: Archive, color: 'purple' },
              { label: 'Scheduled', value: stats.scheduled_for_deletion, icon: Clock, color: 'red' },
              { label: 'Bookings', value: stats.active_bookings, icon: Star, color: 'indigo' },
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
                    ? 'text-green-600 border-b-2 border-green-500 bg-green-50'
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
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Listings Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-semibold">
                <tr>
                  <th className="px-4 py-3">Bike</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
                ) : listings.length === 0 ? (
                  <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">No listings found</td></tr>
                ) : (
                  listings.map((listing) => {
                    const statusBadge = getStatusBadge(listing);
                    return (
                      <tr key={listing.listing_code} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={listing.images?.[0] || '/placeholder-bike.jpg'}
                              alt=""
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-semibold text-gray-900 line-clamp-1">{listing.name}</p>
                              <p className="text-xs text-gray-500">{listing.listing_code}</p>
                              <p className="text-xs text-gray-400">{listing.brand} {listing.model} {listing.year}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {(listing.owner_name || 'A').charAt(0)}
                            </div>
                            <div>
                              <span className="text-gray-700 text-sm">{listing.owner_name || 'Unknown'}</span>
                              <span className={`block text-[10px] uppercase ${
                                listing.owner_role === 'admin' || listing.owner_role === 'super_admin'
                                  ? 'text-purple-600 font-semibold'
                                  : 'text-gray-400'
                              }`}>
                                {listing.submitted_by || listing.owner_role}
                              </span>
                              {listing.seller_name && (
                                <span className="text-[10px] text-gray-400">{listing.seller_name}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs">
                            <p className="font-semibold text-gray-900">{listing.formatted_daily_rate}</p>
                            <p className="text-gray-400">Dep: KSh {Number(listing.security_deposit).toLocaleString()}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <MapPin className="w-3 h-3" />
                            {listing.location_address?.split(',')[0] || listing.location_address}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            <span className={`px-2 py-0.5 bg-${statusBadge.color}-100 text-${statusBadge.color}-700 rounded-full text-xs font-medium flex items-center gap-1`}>
                              <statusBadge.icon className="w-3 h-3" />
                              {statusBadge.label}
                            </span>
                            {listing.is_verified && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                Verified
                              </span>
                            )}
                            {listing.active_bookings_count > 0 && (
                              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                                {listing.active_bookings_count} booking{listing.active_bookings_count > 1 ? 's' : ''}
                              </span>
                            )}
                            {listing.deletion_approved_by && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                <CheckCircle className="w-3 h-3 inline" /> Del. Approved
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 flex-wrap">
                            {/* Approve (pending only) */}
                            {listing.listing_status === 'pending_review' && !listing.deleted_at && (
                              <button
                                onClick={() => handleApprove(listing.listing_code)}
                                disabled={actionLoading}
                                className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                                title="Approve listing"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}

                            {/* Reject (pending only) */}
                            {listing.listing_status === 'pending_review' && !listing.deleted_at && (
                              <button
                                onClick={() => openRejectModal(listing)}
                                disabled={actionLoading}
                                className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                title="Reject listing"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}

                            {/* Edit */}
                            {!listing.deleted_at && (
                              <button
                                onClick={() => openEditModal(listing)}
                                disabled={actionLoading}
                                className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                                title="Edit listing"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            )}

                            {/* View */}
                            <button
                              onClick={() => navigate(`/bikes/${listing.slug || listing.listing_code}`)}
                              className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                              title="View listing"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Pause / Resume */}
                            {listing.listing_status === 'approved' && !listing.deleted_at && (
                              <button
                                onClick={() => handlePause(listing.listing_code)}
                                disabled={actionLoading}
                                className="p-1.5 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200"
                                title="Pause listing"
                              >
                                <Pause className="w-4 h-4" />
                              </button>
                            )}
                            {listing.listing_status === 'paused' && !listing.deleted_at && (
                              <button
                                onClick={() => handleResume(listing.listing_code)}
                                disabled={actionLoading}
                                className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                                title="Resume listing"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                            )}

                            {/* Out of Service */}
                            {(listing.listing_status === 'approved' || listing.listing_status === 'paused') && !listing.deleted_at && (
                              <button
                                onClick={() => openOutOfServiceModal(listing)}
                                disabled={actionLoading}
                                className="p-1.5 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200"
                                title="Mark out of service"
                              >
                                <Wrench className="w-4 h-4" />
                              </button>
                            )}

                            {/* Schedule Deletion */}
                            {!listing.scheduled_for_deletion_at && !listing.deleted_at && listing.listing_status !== 'pending_review' && (
                              <button
                                onClick={() => openScheduleModal(listing)}
                                disabled={actionLoading}
                                className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                title="Schedule deletion"
                              >
                                <Clock className="w-4 h-4" />
                              </button>
                            )}

                            {/* Approve Deletion (Super Admin only) */}
                            {listing.scheduled_for_deletion_at && !listing.deletion_approved_by && isSuperAdmin && (
                              <button
                                onClick={() => handleApproveDeletion(listing.listing_code)}
                                disabled={actionLoading}
                                className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                                title="Approve deletion"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}

                            {/* Restore */}
                            {(listing.scheduled_for_deletion_at || listing.deleted_at) && (
                              <button
                                onClick={() => handleRestore(listing.listing_code)}
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
                                onClick={() => handlePermanentDelete(listing.listing_code)}
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

      {/* Reject Modal */}
      {showRejectModal && selectedListing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reject Listing</h3>
            <p className="text-gray-600 text-sm mb-4">
              Rejecting <strong>{selectedListing.name}</strong>. The owner will be notified.
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
                onClick={() => { setShowRejectModal(false); setSelectedListing(null); setRejectionReason(''); }}
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
      {showScheduleModal && selectedListing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Schedule for Deletion</h3>
            <p className="text-gray-600 text-sm mb-4">
              Listing will be permanently deleted in 30 days. Super admin approval is required.
            </p>
            <textarea
              value={deletionReason}
              onChange={(e) => setDeletionReason(e.target.value)}
              placeholder="Reason for deletion..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm mb-4"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowScheduleModal(false); setSelectedListing(null); setDeletionReason(''); }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleDeletion}
                disabled={!deletionReason.trim() || actionLoading}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {actionLoading ? 'Scheduling...' : 'Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Out of Service Modal */}
      {showOutOfServiceModal && selectedListing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Mark Out of Service</h3>
            <p className="text-gray-600 text-sm mb-4">
              Block <strong>{selectedListing.name}</strong> from being booked during this period.
            </p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Reason</label>
                <input
                  type="text"
                  value={oosForm.reason}
                  onChange={(e) => setOosForm({...oosForm, reason: e.target.value})}
                  placeholder="e.g., Maintenance, Repair, Seasonal"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">From</label>
                <input
                  type="datetime-local"
                  value={oosForm.start_datetime}
                  onChange={(e) => setOosForm({...oosForm, start_datetime: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Until</label>
                <input
                  type="datetime-local"
                  value={oosForm.end_datetime}
                  onChange={(e) => setOosForm({...oosForm, end_datetime: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowOutOfServiceModal(false); setSelectedListing(null); setOosForm({ reason: '', start_datetime: '', end_datetime: '' }); }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkOutOfService}
                disabled={!oosForm.reason.trim() || !oosForm.start_datetime || !oosForm.end_datetime || actionLoading}
                className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
              >
                {actionLoading ? 'Saving...' : 'Mark Out of Service'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedListing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 my-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Listing</h3>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Name</label>
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                  <select
                    value={editForm.listing_status || ''}
                    onChange={(e) => setEditForm({...editForm, listing_status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value="pending_review">Pending Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="paused">Paused</option>
                    <option value="delisted">Delisted</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Brand</label>
                  <input
                    type="text"
                    value={editForm.brand || ''}
                    onChange={(e) => setEditForm({...editForm, brand: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Model</label>
                  <input
                    type="text"
                    value={editForm.model || ''}
                    onChange={(e) => setEditForm({...editForm, model: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Year</label>
                  <input
                    type="number"
                    value={editForm.year || ''}
                    onChange={(e) => setEditForm({...editForm, year: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
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
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                  <select
                    value={editForm.category || ''}
                    onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value="road">Road</option>
                    <option value="mtb">Mountain</option>
                    <option value="gravel">Gravel</option>
                    <option value="ebike">E-Bike</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="kids">Kids</option>
                    <option value="cargo">Cargo</option>
                    <option value="tandem">Tandem</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Condition</label>
                  <select
                    value={editForm.bike_condition || ''}
                    onChange={(e) => setEditForm({...editForm, bike_condition: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value="new">New</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Frame Size</label>
                  <select
                    value={editForm.frame_size || ''}
                    onChange={(e) => setEditForm({...editForm, frame_size: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value="xs">XS</option>
                    <option value="s">S</option>
                    <option value="m">M</option>
                    <option value="l">L</option>
                    <option value="xl">XL</option>
                    <option value="xxl">XXL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Wheel Size</label>
                  <select
                    value={editForm.wheel_size || ''}
                    onChange={(e) => setEditForm({...editForm, wheel_size: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value="20">20"</option>
                    <option value="24">24"</option>
                    <option value="26">26"</option>
                    <option value="27.5">27.5"</option>
                    <option value="29">29"</option>
                    <option value="700c">700c</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Daily Rate (KSh)</label>
                  <input
                    type="number"
                    value={editForm.daily_rate || ''}
                    onChange={(e) => setEditForm({...editForm, daily_rate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Hourly Rate</label>
                  <input
                    type="number"
                    value={editForm.hourly_rate || ''}
                    onChange={(e) => setEditForm({...editForm, hourly_rate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Weekly Rate</label>
                  <input
                    type="number"
                    value={editForm.weekly_rate || ''}
                    onChange={(e) => setEditForm({...editForm, weekly_rate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Monthly Rate</label>
                  <input
                    type="number"
                    value={editForm.monthly_rate || ''}
                    onChange={(e) => setEditForm({...editForm, monthly_rate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Security Deposit (KSh)</label>
                  <input
                    type="number"
                    value={editForm.security_deposit || ''}
                    onChange={(e) => setEditForm({...editForm, security_deposit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Delivery Fee (KSh)</label>
                  <input
                    type="number"
                    value={editForm.delivery_fee || ''}
                    onChange={(e) => setEditForm({...editForm, delivery_fee: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Min Rental Hours</label>
                  <input
                    type="number"
                    value={editForm.min_rental_hours || ''}
                    onChange={(e) => setEditForm({...editForm, min_rental_hours: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Max Rental Days</label>
                  <input
                    type="number"
                    value={editForm.max_rental_days || ''}
                    onChange={(e) => setEditForm({...editForm, max_rental_days: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Location Address</label>
                <input
                  type="text"
                  value={editForm.location_address || ''}
                  onChange={(e) => setEditForm({...editForm, location_address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Pickup Type</label>
                  <select
                    value={editForm.pickup_type || ''}
                    onChange={(e) => setEditForm({...editForm, pickup_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value="shop">Shop</option>
                    <option value="owner_location">Owner Location</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Response Time (hrs)</label>
                  <input
                    type="number"
                    value={editForm.response_time_hours || ''}
                    onChange={(e) => setEditForm({...editForm, response_time_hours: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-instant-book"
                    checked={editForm.instant_book || false}
                    onChange={(e) => setEditForm({...editForm, instant_book: e.target.checked})}
                    className="w-4 h-4 text-green-500 rounded"
                  />
                  <label htmlFor="edit-instant-book" className="text-sm text-gray-700">Instant Book</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-insurance"
                    checked={editForm.insurance_included || false}
                    onChange={(e) => setEditForm({...editForm, insurance_included: e.target.checked})}
                    className="w-4 h-4 text-green-500 rounded"
                  />
                  <label htmlFor="edit-insurance" className="text-sm text-gray-700">Insurance Included</label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-active"
                    checked={editForm.is_active || false}
                    onChange={(e) => setEditForm({...editForm, is_active: e.target.checked})}
                    className="w-4 h-4 text-green-500 rounded"
                  />
                  <label htmlFor="edit-active" className="text-sm text-gray-700">Is Active</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-verified"
                    checked={editForm.is_verified || false}
                    onChange={(e) => setEditForm({...editForm, is_verified: e.target.checked})}
                    className="w-4 h-4 text-green-500 rounded"
                  />
                  <label htmlFor="edit-verified" className="text-sm text-gray-700">Is Verified</label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => { setShowEditModal(false); setSelectedListing(null); setEditForm({}); }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateListing}
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
    </div>
  );
};

export default BikeListingModerationPage;