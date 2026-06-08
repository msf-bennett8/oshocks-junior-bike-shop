import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Shield, CheckCircle, XCircle, Pause, Play, Wrench, Search,
  Package2, AlertTriangle, Clock, Plus, Eye, Edit3, Trash2,
  ArrowRight, Loader, Ban, Settings, TrendingUp, DollarSign
} from 'lucide-react';
import resourceService from '../../services/resourceService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/ToastContainer';
import ModerationActionModal from '../../components/common/ModerationActionModal';

const TABS = [
  { key: 'all', label: 'All Assets', icon: Package2 },
  { key: 'pending', label: 'Pending Review', icon: Clock },
  { key: 'approved', label: 'Active', icon: CheckCircle },
  { key: 'paused', label: 'Paused', icon: Pause },
  { key: 'rejected', label: 'Rejected', icon: XCircle },
  { key: 'out_of_stock', label: 'Out of Stock', icon: Ban },
  { key: 'low_stock', label: 'Low Stock', icon: AlertTriangle },
];

const ResourceAssetModerationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [resources, setResources] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ type: 'confirm', title: '', message: '', onConfirm: null });
  const [selectedResource, setSelectedResource] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [inventoryAdjustment, setInventoryAdjustment] = useState('');
  const [inventoryReason, setInventoryReason] = useState('');
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    fetchResources();
    fetchStats();
  }, [activeTab, currentPage]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = {
        tab: activeTab,
        page: currentPage,
        per_page: 20,
        ...(searchQuery && { search: searchQuery }),
      };
      const response = await resourceService.getModerationResources(params);
      // Filter to only assets
      const allResources = response.data?.data?.data || response.data?.data || [];
      const assetResources = allResources.filter(r => r.resource_type === 'asset');
      setResources(assetResources);
    } catch (err) {
      console.error('Failed to fetch resources:', err);
      toast.error('Failed to load resources');
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

  const openModal = (config) => { setModalConfig(config); setModalOpen(true); };
  const closeModal = () => setModalOpen(false);

  const handleApprove = async (resourceCode) => {
    try {
      setActionLoading(true);
      await resourceService.approveResource(resourceCode);
      toast.success('Resource approved');
      fetchResources();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    try {
      setActionLoading(true);
      await resourceService.rejectResource(selectedResource.resource_code, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedResource(null);
      toast.success('Resource rejected');
      fetchResources();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = async (resourceCode) => {
    try {
      setActionLoading(true);
      await resourceService.pauseResource(resourceCode);
      toast.success('Resource paused');
      fetchResources();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to pause');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async (resourceCode) => {
    try {
      setActionLoading(true);
      await resourceService.resumeResource(resourceCode);
      toast.success('Resource resumed');
      fetchResources();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resume');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdjustInventory = async () => {
    if (!inventoryAdjustment || !inventoryReason.trim()) return;
    try {
      setActionLoading(true);
      await resourceService.adjustInventory(
        selectedResource.resource_code,
        parseInt(inventoryAdjustment),
        inventoryReason
      );
      setShowInventoryModal(false);
      setInventoryAdjustment('');
      setInventoryReason('');
      setSelectedResource(null);
      toast.success('Inventory adjusted');
      fetchResources();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to adjust inventory');
    } finally {
      setActionLoading(false);
    }
  };

  const handleForcePriceUpdate = async (resourceCode) => {
    try {
      setActionLoading(true);
      await resourceService.forcePriceUpdate(resourceCode);
      toast.success('Price updated');
      fetchResources();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update price');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (resource) => {
    if (resource.deleted_at) return { label: 'Deleted', color: 'gray', icon: Trash2 };
    if (resource.status === 'pending_review') return { label: 'Pending', color: 'yellow', icon: Clock };
    if (resource.status === 'rejected') return { label: 'Rejected', color: 'red', icon: XCircle };
    if (resource.status === 'paused') return { label: 'Paused', color: 'orange', icon: Pause };
    if (resource.status === 'out_of_stock') return { label: 'Out of Stock', color: 'red', icon: Ban };
    if (resource.status === 'approved' && resource.is_active) {
      if (resource.available_quantity <= 0) return { label: 'Out of Stock', color: 'red', icon: Ban };
      if (resource.is_low_stock) return { label: 'Low Stock', color: 'orange', icon: AlertTriangle };
      return { label: 'Active', color: 'green', icon: CheckCircle };
    }
    return { label: resource.status, color: 'gray', icon: Package2 };
  };

  const assetCategories = [
    'helmet', 'bike_light', 'u_lock', 'repair_kit', 'water_bottle',
    'gloves', 'cycling_kit', 'pump', 'tool_kit', 'rack', 'fenders',
    'computer', 'lights_set', 'lock_set', 'tool_set'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet><title>Asset Moderation | Admin</title></Helmet>

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-purple-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Asset Moderation</h1>
                <p className="text-gray-600">Manage physical equipment: helmets, lights, locks, repair kits, water bottles, gloves, cycling kits, and more.</p>
              </div>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              Upload New Asset
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { label: 'Total Assets', value: stats.total_assets || 0, icon: Package2, color: 'blue' },
              { label: 'Pending', value: stats.pending_review || 0, icon: Clock, color: 'yellow' },
              { label: 'Active', value: stats.approved_active || 0, icon: CheckCircle, color: 'green' },
              { label: 'Paused', value: stats.paused || 0, icon: Pause, color: 'orange' },
              { label: 'Rejected', value: stats.rejected || 0, icon: XCircle, color: 'red' },
              { label: 'Out of Stock', value: stats.out_of_stock || 0, icon: Ban, color: 'red' },
              { label: 'Low Stock', value: stats.low_stock || 0, icon: AlertTriangle, color: 'orange' },
              { label: 'Bookings', value: stats.total_bookings || 0, icon: TrendingUp, color: 'indigo' },
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
                    ? 'text-purple-600 border-b-2 border-purple-500 bg-purple-50'
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
                placeholder="Search assets by name, code, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchResources()}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Results count */}
          <div className="px-4 py-2 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Showing <span className="font-semibold">{resources.length}</span> assets
            </p>
          </div>

          {/* Resources Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-semibold">
                <tr>
                  <th className="px-4 py-3">Asset</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Inventory</th>
                  <th className="px-4 py-3">Pricing</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    <Loader className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading...
                  </td></tr>
                ) : resources.length === 0 ? (
                  <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">No assets found</td></tr>
                ) : (
                  resources.map((resource) => {
                    const statusBadge = getStatusBadge(resource);
                    return (
                      <tr key={resource.resource_code} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={resource.images?.[0] || '/placeholder-resource.jpg'}
                              alt=""
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-semibold text-gray-900 line-clamp-1">{resource.name}</p>
                              <p className="text-xs text-gray-500">{resource.resource_code}</p>
                              <p className="text-xs text-gray-400">{resource.brand} {resource.model}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium capitalize">
                            {resource.category.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs">
                            <p className="font-semibold text-gray-900">
                              {resource.available_quantity} / {resource.total_quantity} available
                            </p>
                            <p className="text-gray-500">{resource.reserved_quantity} reserved</p>
                            {resource.is_low_stock && (
                              <p className="text-orange-600 font-medium">Low stock alert!</p>
                            )}
                            {resource.available_quantity <= 0 && (
                              <p className="text-red-600 font-medium">Out of stock!</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs">
                            <p className="font-semibold text-gray-900">{resource.formatted_price}</p>
                            <p className="text-gray-500">Base: {resource.formatted_base_price}</p>
                            {resource.surge_multiplier > 1.0 && (
                              <p className="text-orange-600 font-medium">Surge: {resource.surge_multiplier}x</p>
                            )}
                            <p className="text-gray-400">
                              {resource.dynamic_pricing_enabled ? 'Dynamic pricing ON' : 'Dynamic pricing OFF'}
                            </p>
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
                            {/* Approve */}
                            {resource.status === 'pending_review' && (
                              <button
                                onClick={() => handleApprove(resource.resource_code)}
                                disabled={actionLoading}
                                className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}

                            {/* Reject */}
                            {resource.status === 'pending_review' && (
                              <button
                                onClick={() => { setSelectedResource(resource); setShowRejectModal(true); }}
                                disabled={actionLoading}
                                className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}

                            {/* Pause/Resume */}
                            {resource.status === 'approved' && resource.is_active && (
                              <button
                                onClick={() => handlePause(resource.resource_code)}
                                disabled={actionLoading}
                                className="p-1.5 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200"
                                title="Pause"
                              >
                                <Pause className="w-4 h-4" />
                              </button>
                            )}
                            {resource.status === 'paused' && (
                              <button
                                onClick={() => handleResume(resource.resource_code)}
                                disabled={actionLoading}
                                className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                                title="Resume"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                            )}

                            {/* Inventory Adjust */}
                            <button
                              onClick={() => { setSelectedResource(resource); setShowInventoryModal(true); }}
                              disabled={actionLoading}
                              className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                              title="Adjust Inventory"
                            >
                              <Settings className="w-4 h-4" />
                            </button>

                            {/* Force Price Update */}
                            <button
                              onClick={() => handleForcePriceUpdate(resource.resource_code)}
                              disabled={actionLoading}
                              className="p-1.5 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200"
                              title="Update Price"
                            >
                              <DollarSign className="w-4 h-4" />
                            </button>

                            {/* View */}
                            <button
                              onClick={() => navigate(`/resources/${resource.resource_code}`)}
                              className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
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

      {/* Reject Modal */}
      {showRejectModal && selectedResource && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reject Asset</h3>
            <p className="text-gray-600 text-sm mb-4">
              Rejecting <strong>{selectedResource.name}</strong>. The uploader will be notified.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm mb-4"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowRejectModal(false); setSelectedResource(null); setRejectReason(''); }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || actionLoading}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Adjust Modal */}
      {showInventoryModal && selectedResource && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Adjust Inventory</h3>
            <p className="text-gray-600 text-sm mb-4">
              <strong>{selectedResource.name}</strong> — Current: {selectedResource.total_quantity} total, {selectedResource.available_quantity} available
            </p>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adjustment (+/-)</label>
                <input
                  type="number"
                  value={inventoryAdjustment}
                  onChange={(e) => setInventoryAdjustment(e.target.value)}
                  placeholder="e.g., +5 or -3"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Positive to add, negative to remove</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <input
                  type="text"
                  value={inventoryReason}
                  onChange={(e) => setInventoryReason(e.target.value)}
                  placeholder="e.g., New stock arrived, Damaged items removed"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowInventoryModal(false); setSelectedResource(null); setInventoryAdjustment(''); setInventoryReason(''); }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustInventory}
                disabled={!inventoryAdjustment || !inventoryReason.trim() || actionLoading}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {actionLoading ? 'Adjusting...' : 'Adjust'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal - Placeholder - will be replaced by full component */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Upload New Asset</h3>
            <p className="text-gray-600 mb-4">
              Use the Resource Upload page for full upload functionality. This will be implemented as a separate modal component.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => { setShowUploadModal(false); navigate('/admin/resource-upload'); }}
                className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
              >
                Go to Upload Page
              </button>
            </div>
          </div>
        </div>
      )}

      <ModerationActionModal
        isOpen={modalOpen}
        onClose={closeModal}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onCancel={closeModal}
        isLoading={actionLoading}
      />
    </div>
  );
};

export default ResourceAssetModerationPage;
