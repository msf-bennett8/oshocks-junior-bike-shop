import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import auditService from '../../services/auditService';
import {
  Archive, AlertTriangle, Info, CheckCircle, XCircle, Search, Filter,
  Calendar, Download, RefreshCw, ChevronLeft, ChevronRight, RotateCcw,
  User, Activity, ShoppingCart, Package, DollarSign, Clock, Trash2,
  Shield, AlertCircle, Settings, ArrowLeft, FileArchive, Database
} from 'lucide-react';

const ArchivesPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [archives, setArchives] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedArchives, setSelectedArchives] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0
  });

  const [filters, setFilters] = useState({
    event_category: '',
    severity: '',
    archive_reason: '',
    start_date: '',
    end_date: '',
    sort_by: 'archived_at',
    sort_order: 'desc',
    per_page: 20
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedArchive, setSelectedArchive] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const [dateRangeForDeletion, setDateRangeForDeletion] = useState({
    start_date: '',
    end_date: ''
  });
  const [dateRangePreview, setDateRangePreview] = useState(null);
  const [dateRangeSelection, setDateRangeSelection] = useState({
    mode: '', // 'quick' or 'custom'
    quickOption: '', // '30days', '3months', '6months', '1year'
    customStart: '',
    customEnd: ''
  });

  useEffect(() => {
    loadArchives();
    loadStats();
  }, [filters.event_category, filters.severity, filters.archive_reason, pagination.current_page]);

  const loadArchives = async () => {
    try {
      setLoading(true);
      const response = await auditService.getArchivedLogs({
        ...filters,
        page: pagination.current_page
      });

      if (response.success) {
        setArchives(response.data.data || []);
        setPagination({
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total
        });
      }
    } catch (error) {
      console.error('Failed to load archives:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await auditService.getArchiveStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load archive stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadArchives();
    await loadStats();
    setRefreshing(false);
  };

  const handleRestore = async (archiveId) => {
    try {
      setProcessing(true);
      const response = await auditService.restoreArchivedLog(archiveId);
      
      if (response.success) {
        alert('✅ Log restored successfully!');
        await handleRefresh();
      } else {
        alert('❌ Restoration failed: ' + response.message);
      }
    } catch (error) {
      console.error('Failed to restore archive:', error);
      alert('❌ Failed to restore log. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkRestore = async () => {
    if (selectedArchives.length === 0) {
      alert('Please select logs to restore');
      return;
    }

    if (!window.confirm(`Restore ${selectedArchives.length} logs back to active audit logs?`)) {
      return;
    }

    try {
      setProcessing(true);
      const response = await auditService.bulkRestoreArchives(selectedArchives);
      
      if (response.success) {
        alert(`✅ Successfully restored ${response.restored_count || selectedArchives.length} logs!`);
        setSelectedArchives([]);
        await handleRefresh();
      } else {
        alert('❌ Bulk restoration failed: ' + response.message);
      }
    } catch (error) {
      console.error('Failed to bulk restore:', error);
      alert('❌ Failed to restore logs. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handlePermanentDelete = async (archiveId) => {
    if (!window.confirm('⚠️ PERMANENTLY delete this log? This cannot be undone!')) {
      return;
    }

    try {
      setProcessing(true);
      const response = await auditService.permanentlyDeleteArchive(archiveId);
      
      if (response.success) {
        alert('✅ Archive permanently deleted');
        await handleRefresh();
      } else {
        alert('❌ Deletion failed: ' + response.message);
      }
    } catch (error) {
      console.error('Failed to delete archive:', error);
      alert('❌ Failed to delete. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedArchives.length === 0) {
      alert('Please select logs to delete');
      return;
    }

    if (!window.confirm(`⚠️ PERMANENTLY delete ${selectedArchives.length} logs? This CANNOT be undone!`)) {
      return;
    }

    try {
      setProcessing(true);
      const response = await auditService.bulkDeleteArchives(selectedArchives);
      
      if (response.success) {
        alert(`✅ Successfully deleted ${response.deleted_count || selectedArchives.length} logs permanently!`);
        setSelectedArchives([]);
        await handleRefresh();
      } else {
        alert('❌ Bulk deletion failed: ' + response.message);
      }
    } catch (error) {
      console.error('Failed to bulk delete:', error);
      alert('❌ Failed to delete logs. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDateRangeDelete = async () => {
    if (!dateRangeForDeletion.start_date || !dateRangeForDeletion.end_date) {
        alert('Please select both start and end dates');
        return;
    }

    try {
        setProcessing(true);
        
        // First, preview how many logs will be deleted
        const previewResponse = await auditService.getArchivedLogs({
        start_date: dateRangeForDeletion.start_date,
        end_date: dateRangeForDeletion.end_date,
        per_page: 1000 // Get all matching logs for preview
        });

        if (previewResponse.success && previewResponse.data.data) {
        const logsToDelete = previewResponse.data.data;
        setDateRangePreview({
            count: logsToDelete.length,
            start_date: dateRangeForDeletion.start_date,
            end_date: dateRangeForDeletion.end_date,
            logs: logsToDelete
        });
        setShowDateRangeModal(true);
        }
    } catch (error) {
        console.error('Failed to preview date range deletion:', error);
        alert('❌ Failed to preview deletion. Please try again.');
    } finally {
        setProcessing(false);
    }
    };

    const confirmDateRangeDeletion = async () => {
    if (!dateRangePreview || dateRangePreview.count === 0) {
        alert('No logs to delete in this date range');
        return;
    }

    if (!window.confirm(`⚠️ PERMANENTLY delete ${dateRangePreview.count} logs from ${dateRangePreview.start_date} to ${dateRangePreview.end_date}? This CANNOT be undone!`)) {
        return;
    }

    try {
        setProcessing(true);
        const archiveIds = dateRangePreview.logs.map(log => log.id);
        const response = await auditService.bulkDeleteArchives(archiveIds);
        
        if (response.success) {
        alert(`✅ Successfully deleted ${response.deleted_count || dateRangePreview.count} logs!`);
        setShowDateRangeModal(false);
        setDateRangePreview(null);
        setDateRangeForDeletion({ start_date: '', end_date: '' });
        await handleRefresh();
        } else {
        alert('❌ Deletion failed: ' + response.message);
        }
    } catch (error) {
        console.error('Failed to delete by date range:', error);
        alert('❌ Failed to delete logs. Please try again.');
    } finally {
        setProcessing(false);
    }
    };

  const calculateDateRange = (option) => {
    const today = new Date();
    let startDate;
    
    switch(option) {
      case '30days':
        startDate = new Date(today.setDate(today.getDate() - 30));
        break;
      case '3months':
        startDate = new Date(today.setMonth(today.getMonth() - 3));
        break;
      case '6months':
        startDate = new Date(today.setMonth(today.getMonth() - 6));
        break;
      case '1year':
        startDate = new Date(today.setFullYear(today.getFullYear() - 1));
        break;
      default:
        startDate = new Date();
    }
    
    return {
      start: startDate.toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    };
  };

  const handleQuickDateRangeSelect = (option) => {
    setDateRangeSelection({
      mode: 'quick',
      quickOption: option,
      customStart: '',
      customEnd: ''
    });
  };

  const handleCustomDateRangeSelect = () => {
    setDateRangeSelection(prev => ({
      ...prev,
      mode: 'custom'
    }));
  };

  const previewTimeRangeDeletion = async () => {
    let dateRange;
    
    if (dateRangeSelection.mode === 'quick') {
      dateRange = calculateDateRange(dateRangeSelection.quickOption);
    } else if (dateRangeSelection.mode === 'custom') {
      if (!dateRangeSelection.customStart || !dateRangeSelection.customEnd) {
        alert('Please select both start and end dates');
        return;
      }
      dateRange = {
        start: dateRangeSelection.customStart,
        end: dateRangeSelection.customEnd
      };
    } else {
      alert('Please select a time range option');
      return;
    }

    try {
      setProcessing(true);
      
      const previewResponse = await auditService.getArchivedLogs({
        start_date: dateRange.start,
        end_date: dateRange.end,
        per_page: 1000
      });

      if (previewResponse.success && previewResponse.data.data) {
        const logsToDelete = previewResponse.data.data;
        setDateRangePreview({
          count: logsToDelete.length,
          start_date: dateRange.start,
          end_date: dateRange.end,
          logs: logsToDelete
        });
        setShowDateRangeModal(false);
      }
    } catch (error) {
      console.error('Failed to preview deletion:', error);
      alert('Failed to preview deletion. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await auditService.exportArchivedLogs({
        start_date: filters.start_date,
        end_date: filters.end_date,
        archive_reason: filters.archive_reason
      });

      if (response.success) {
        const dataStr = JSON.stringify(response.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `audit-archives-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
      }
    } catch (error) {
      console.error('Failed to export archives:', error);
    }
  };

  const toggleSelectArchive = (id) => {
    setSelectedArchives(prev => 
      prev.includes(id) ? prev.filter(archiveId => archiveId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedArchives.length === archives.length) {
      setSelectedArchives([]);
    } else {
      setSelectedArchives(archives.map(a => a.id));
    }
  };

  const getSeverityBadge = (severity) => {
    const styles = {
      low: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Info },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertTriangle },
      high: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle }
    };
    const style = styles[severity?.toLowerCase()] || styles.low;
    const Icon = style.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        <Icon className="w-3 h-3" />
        {severity}
      </span>
    );
  };

  const getCategoryIcon = (category) => {
    const icons = {
      security: { icon: Shield, color: 'text-purple-600', bg: 'bg-purple-100' },
      order: { icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-100' },
      payment: { icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
      product: { icon: Package, color: 'text-orange-600', bg: 'bg-orange-100' },
      user: { icon: User, color: 'text-indigo-600', bg: 'bg-indigo-100' }
    };
    return icons[category?.toLowerCase()] || icons.security;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getArchiveReasonBadge = (reason) => {
    const styles = {
      manual_deletion: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Manual' },
      standard_retention: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Auto Retention' },
      high_severity_retention: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'High Severity' },
      suspicious_retention: { bg: 'bg-red-100', text: 'text-red-800', label: 'Suspicious' }
    };
    const style = styles[reason] || { bg: 'bg-gray-100', text: 'text-gray-800', label: reason };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );

  if (loading && !archives.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading archives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/audit/audit-logs')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Active Logs
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Archive className="w-8 h-8 text-orange-600" />
                Archived Audit Logs
              </h1>
              <p className="text-gray-600">
                View and manage deleted audit logs • Restore or permanently delete
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
            <StatCard
              icon={Archive}
              label="Total Archived"
              value={stats.total_archived?.toLocaleString() || '0'}
              color="bg-blue-600"
            />
            <StatCard
              icon={Clock}
              label="Eligible for Deletion"
              value={stats.eligible_for_deletion?.toLocaleString() || '0'}
              color="bg-red-600"
            />
            <StatCard
              icon={Database}
              label="Storage Used"
              value={stats.storage_size || '0 MB'}
              color="bg-purple-600"
            />
            <StatCard
              icon={Calendar}
              label="Retention Days"
              value={stats.retention_days || '90'}
              color="bg-green-600"
            />
          </div>
        )}

        {/* Bulk Actions */}
        {selectedArchives.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <p className="text-sm font-medium text-orange-800">
              {selectedArchives.length} log(s) selected
            </p>
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <button
                onClick={handleBulkRestore}
                disabled={processing}
                className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm md:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                Restore Selected
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={processing}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete Permanently
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-orange-600 hover:text-orange-700 text-sm font-medium"
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.event_category}
                  onChange={(e) => setFilters({ ...filters, event_category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">All Categories</option>
                  <option value="security">Security</option>
                  <option value="order">Order</option>
                  <option value="payment">Payment</option>
                  <option value="product">Product</option>
                  <option value="user">User</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity
                </label>
                <select
                  value={filters.severity}
                  onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">All Severities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Archive Reason
                </label>
                <select
                  value={filters.archive_reason}
                  onChange={(e) => setFilters({ ...filters, archive_reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">All Reasons</option>
                  <option value="manual_deletion">Manual Deletion</option>
                  <option value="standard_retention">Auto Retention</option>
                  <option value="suspicious_retention">Suspicious</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Date Range Deletion Tool - Click to Open Modal */}
        <div className="bg-red-50 border-2 border-red-200 rounded-lg shadow-sm p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <div className="p-3 bg-red-600 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-red-900">Delete Archives by Time Range</h2>
                <p className="text-sm text-red-700">Choose quick options or set custom date range</p>
              </div>
            </div>
            <button
              onClick={() => setShowDateRangeModal(true)}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-medium"
            >
              <Calendar className="w-5 h-5" />
              Select Time Range
            </button>
          </div>

          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Warning: Permanent deletion!</p>
              <p>Click "Select Time Range" to choose which archives to delete. You'll preview before deletion.</p>
            </div>
          </div>
        </div>

        {/* Archives Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedArchives.length === archives.length && archives.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Archived
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {archives.map((archive) => {
                  const categoryInfo = getCategoryIcon(archive.event_category);
                  const CategoryIcon = categoryInfo.icon;

                  return (
                    <tr key={archive.id} className="hover:bg-gray-50">
                      <td className="px-3 md:px-6 py-3 md:py-4">
                        <input
                          type="checkbox"
                          checked={selectedArchives.includes(archive.id)}
                          onChange={() => toggleSelectArchive(archive.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <div className="flex flex-wrap items-center gap-2 md:gap-3">
                          <div className={`p-2 rounded-lg ${categoryInfo.bg}`}>
                            <CategoryIcon className={`w-5 h-5 ${categoryInfo.color}`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {archive.event_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </p>
                            <p className="text-xs text-gray-500">{archive.event_category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4">
                        <p className="text-sm text-gray-900 max-w-md truncate">
                          {archive.description}
                        </p>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(archive.archived_at)}</div>
                        <div className="text-xs text-gray-500">
                          Original: {formatDate(archive.occurred_at)}
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                      {getArchiveReasonBadge(archive.archive_reason)}
                    </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRestore(archive.id)}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => {
                              setSelectedArchive(archive);
                              setShowModal(true);
                            }}
                            className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handlePermanentDelete(archive.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 px-4 md:px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs md:text-sm text-gray-600 text-center sm:text-left">
                Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
                  disabled={pagination.current_page === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600">
                  Page {pagination.current_page} of {pagination.last_page}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
                  disabled={pagination.current_page === pagination.last_page}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Detail Modal */}
        {showModal && selectedArchive && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 my-8 max-h-[calc(100vh-4rem)] flex flex-col">
              <div className="p-4 md:p-6 border-b border-gray-200 flex-shrink-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">Archived Log Details</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg self-end md:self-auto"
                  >
                    <XCircle className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto flex-1">
                <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Archived Date:</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(selectedArchive.archived_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Archive Reason:</p>
                      {getArchiveReasonBadge(selectedArchive.archive_reason)}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Event Information</h3>
                  <div className="bg-gray-50 rounded-lg p-3 md:p-4 space-y-3">
                    <div className="flex justify-between flex-wrap gap-2">
                      <span className="text-sm text-gray-600">Event Type:</span>
                      <span className="text-sm font-medium break-all">{selectedArchive.event_type}</span>
                    </div>
                    <div className="flex justify-between flex-wrap gap-2">
                      <span className="text-sm text-gray-600">Category:</span>
                      <span className="text-sm font-medium">{selectedArchive.event_category}</span>
                    </div>
                    <div className="flex justify-between flex-wrap gap-2">
                      <span className="text-sm text-gray-600">Severity:</span>
                      {getSeverityBadge(selectedArchive.severity)}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                  <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3 md:p-4 break-words">{selectedArchive.description}</p>
                </div>
              </div>

              <div className="p-4 md:p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between gap-3 flex-shrink-0">
                <button
                  onClick={() => handleRestore(selectedArchive.id)}
                  className="px-6 py-2.5 md:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm md:text-base"
                >
                  Restore This Log
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 md:py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm md:text-base"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Time Range Selection Modal */}
        {showDateRangeModal && !dateRangePreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 my-8 max-h-[calc(100vh-4rem)] flex flex-col">
              <div className="p-4 md:p-6 border-b border-gray-200 flex-shrink-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-lg md:text-xl font-bold text-gray-900">Select Time Range for Deletion</h2>
                      <p className="text-xs md:text-sm text-gray-600">Choose quick option or set custom dates</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowDateRangeModal(false);
                      setDateRangeSelection({ mode: '', quickOption: '', customStart: '', customEnd: '' });
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg self-end md:self-auto"
                  >
                    <XCircle className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto flex-1">
                {/* Quick Select Options */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Select:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {['30days', '3months', '6months', '1year'].map((option) => {
                      const range = calculateDateRange(option);
                      const labels = {
                        '30days': 'Last 30 Days',
                        '3months': 'Last 3 Months',
                        '6months': 'Last 6 Months',
                        '1year': 'Last 1 Year'
                      };
                      
                      return (
                        <button
                          key={option}
                          onClick={() => handleQuickDateRangeSelect(option)}
                          className={`p-3 md:p-4 border-2 rounded-lg text-center transition-all ${
                            dateRangeSelection.quickOption === option
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <Calendar className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-1 md:mb-2 text-purple-600" />
                          <p className="text-xs md:text-sm font-semibold text-gray-900">{labels[option]}</p>
                          <p className="text-xs text-gray-500 mt-0.5 md:mt-1">{range.start}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">OR</span>
                  </div>
                </div>

                {/* Custom Date Range */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-700">Custom Date Range:</h3>
                    <button
                      onClick={handleCustomDateRangeSelect}
                      className={`text-xs md:text-sm font-medium ${
                        dateRangeSelection.mode === 'custom'
                          ? 'text-purple-600'
                          : 'text-gray-500 hover:text-purple-600'
                      }`}
                    >
                      {dateRangeSelection.mode === 'custom' ? '✓ Custom Mode Active' : 'Select Custom'}
                    </button>
                  </div>

                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-3 md:p-4 rounded-lg border-2 transition-all ${
                    dateRangeSelection.mode === 'custom'
                      ? 'border-purple-300 bg-purple-50'
                      : 'border-gray-200 bg-gray-50 opacity-50'
                  }`}>
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                        Start Date (Archived After)
                      </label>
                      <input
                        type="date"
                        disabled={dateRangeSelection.mode !== 'custom'}
                        value={dateRangeSelection.customStart}
                        onChange={(e) => setDateRangeSelection(prev => ({ ...prev, customStart: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                        End Date (Archived Before)
                      </label>
                      <input
                        type="date"
                        disabled={dateRangeSelection.mode !== 'custom'}
                        value={dateRangeSelection.customEnd}
                        onChange={(e) => setDateRangeSelection(prev => ({ ...prev, customEnd: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Warning */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs md:text-sm text-red-800">
                      <p className="font-medium">⚠️ Warning:</p>
                      <p>All archived logs within the selected range will be permanently deleted. You'll see a preview before final deletion.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <button
                  onClick={() => {
                    setShowDateRangeModal(false);
                    setDateRangeSelection({ mode: '', quickOption: '', customStart: '', customEnd: '' });
                  }}
                  className="flex-1 px-4 py-2.5 md:py-2 text-sm md:text-base border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={previewTimeRangeDeletion}
                  disabled={!dateRangeSelection.mode || processing}
                  className="flex-1 px-4 py-2.5 md:py-2 text-sm md:text-base bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      Preview Deletion
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Date Range Deletion Preview Modal */}
        {dateRangePreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 my-8 max-h-[calc(100vh-4rem)] flex flex-col">
              <div className="p-4 md:p-6 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-red-100 rounded-full">
                    <Calendar className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">Date Range Deletion Preview</h2>
                    <p className="text-xs md:text-sm text-gray-600">Review logs before permanent deletion</p>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6 space-y-3 md:space-y-4 overflow-y-auto flex-1">
                {/* Summary */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-red-600 flex-shrink-0" />
                    <p className="text-base md:text-lg font-semibold text-red-900">
                      {dateRangePreview.count} logs will be permanently deleted
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Start Date:</p>
                      <p className="font-medium text-gray-900 break-words">{dateRangePreview.start_date}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">End Date:</p>
                      <p className="font-medium text-gray-900 break-words">{dateRangePreview.end_date}</p>
                    </div>
                  </div>
                </div>

                {/* Breakdown by Category */}
                <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                  <h3 className="text-xs md:text-sm font-medium text-gray-700 mb-3">Breakdown by Category:</h3>
                  <div className="space-y-2">
                    {['security', 'order', 'payment', 'product', 'user'].map(category => {
                      const count = dateRangePreview.logs.filter(log => log.event_category === category).length;
                      if (count === 0) return null;
                      return (
                        <div key={category} className="flex justify-between text-xs md:text-sm">
                          <span className="text-gray-700 capitalize">{category}:</span>
                          <span className="font-medium text-gray-900">{count} logs</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Preview of logs (first 5) */}
                <div className="bg-gray-50 rounded-lg p-3 md:p-4 max-h-64 overflow-y-auto">
                  <h3 className="text-xs md:text-sm font-medium text-gray-700 mb-3">Sample Logs (first 5):</h3>
                  <div className="space-y-2">
                    {dateRangePreview.logs.slice(0, 5).map((log, index) => (
                      <div key={index} className="text-xs p-2 bg-white rounded border border-gray-200">
                        <p className="font-medium text-gray-900 break-words">{log.event_type}</p>
                        <p className="text-gray-600 truncate">{log.description}</p>
                        <p className="text-gray-500 mt-1">{formatDate(log.archived_at)}</p>
                      </div>
                    ))}
                    {dateRangePreview.count > 5 && (
                      <p className="text-xs text-gray-500 text-center pt-2">
                        ... and {dateRangePreview.count - 5} more logs
                      </p>
                    )}
                  </div>
                </div>

                {/* Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs md:text-sm text-yellow-800">
                      <p className="font-medium">⚠️ This action cannot be undone!</p>
                      <p>These {dateRangePreview.count} logs will be permanently removed from the database.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <button
                  onClick={() => {
                    setShowDateRangeModal(false);
                    setDateRangePreview(null);
                  }}
                  disabled={processing}
                  className="flex-1 px-4 py-2.5 md:py-2 text-sm md:text-base border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDateRangeDeletion}
                  disabled={processing}
                  className="flex-1 px-4 py-2.5 md:py-2 text-sm md:text-base bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Yes, Delete {dateRangePreview.count} Logs
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArchivesPage;