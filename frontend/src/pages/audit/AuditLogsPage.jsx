import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import auditService from '../../services/auditService';
import {
  Shield, AlertTriangle, Info, CheckCircle, XCircle, Search, Filter,
  Calendar, Download, RefreshCw, ChevronDown, ChevronLeft, ChevronRight,
  User, Activity, ShoppingCart, Package, DollarSign, Eye, Clock,
  TrendingUp, BarChart3, FileText, AlertCircle, Lock, Unlock,
  UserCheck, UserX, Settings, LogIn, LogOut, CreditCard, Truck,
  Star, MessageSquare, Tag, Percent, ArrowUp, ArrowDown, Zap, Archive, Plus 
} from 'lucide-react';

const AuditLogsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0
  });

  // Filters
  const [filters, setFilters] = useState({
    event_category: '',
    severity: '',
    is_suspicious: '',
    search: '',
    date_from: '',
    date_to: '',
    sort_by: 'occurred_at',
    sort_order: 'desc',
    per_page: 20
  });

  const [activeFilter, setActiveFilter] = useState(null); // Track which card is active

  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDropdown, setShowDeleteDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteParams, setDeleteParams] = useState(null);
  const [deletePreview, setDeletePreview] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const [dateRangeSelection, setDateRangeSelection] = useState({
    mode: '', // 'quick' or 'custom'
    quickOption: '', // '30days', '3months', '6months', '1year'
    customStart: '',
    customEnd: ''
  });

  useEffect(() => {
    loadAuditLogs();
    loadStats();
  }, [filters.event_category, filters.severity, filters.is_suspicious, pagination.current_page]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await auditService.getAuditLogs({
        ...filters,
        page: pagination.current_page
      });

      if (response.success) {
        setAuditLogs(response.data.data || []);
        setPagination({
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total
        });
      }
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await auditService.getAuditStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAuditLogs();
    await loadStats();
    setRefreshing(false);
  };

  const handleSearch = async () => {
    setPagination(prev => ({ ...prev, current_page: 1 }));
    await loadAuditLogs();
  };

  const handleStatCardClick = (filterKey, filterValue) => {
    // Toggle filter: if same card clicked, clear filter; otherwise apply new filter
    if (activeFilter === filterKey) {
      // Clear filter
      setFilters({
        event_category: '',
        severity: '',
        is_suspicious: '',
        search: '',
        date_from: '',
        date_to: '',
        sort_by: 'occurred_at',
        sort_order: 'desc',
        per_page: 20
      });
      setActiveFilter(null);
    } else {
      // Apply filter
      const newFilters = {
        ...filters,
        event_category: '',
        severity: '',
        is_suspicious: ''
      };

      // Set the specific filter
      if (filterKey === 'event_category') {
        newFilters.event_category = filterValue;
      } else if (filterKey === 'is_suspicious') {
        newFilters.is_suspicious = filterValue;
      }

      setFilters(newFilters);
      setActiveFilter(filterKey);
    }

    // Reset to first page
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const handleExport = async () => {
    try {
      const response = await auditService.exportAuditLogs({
        date_from: filters.date_from,
        date_to: filters.date_to,
        event_category: filters.event_category
      });

      if (response.success) {
        // Create downloadable file
        const dataStr = JSON.stringify(response.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
      }
    } catch (error) {
      console.error('Failed to export logs:', error);
    }
  };

  const handleDeleteRequest = async (type) => {
    let params = {};
    
    switch(type) {
      case 'all':
        params = { delete_all: true };
        break;
      case 'suspicious':
        params = { is_suspicious: '1' };
        break;
      case 'low_severity':
        params = { severity: 'low' };
        break;
      case 'medium_severity':
        params = { severity: 'medium' };
        break;
      case 'high_severity':
        params = { severity: 'high' };
        break;
      case 'date_range':
        if (!filters.date_from || !filters.date_to) {
          alert('Please select a date range in the filters first');
          return;
        }
        params = { 
          date_from: filters.date_from,
          date_to: filters.date_to 
        };
        break;
    }

    try {
      // Preview deletion first
      const preview = await auditService.previewDeletion(params);
      if (preview.success) {
        setDeleteParams(params);
        setDeletePreview(preview.data);
        setShowDeleteModal(true);
        setShowDeleteDropdown(false);
      }
    } catch (error) {
      console.error('Failed to preview deletion:', error);
      alert('Failed to preview deletion. Please try again.');
    }
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      const response = await auditService.deleteAuditLogs(deleteParams);
      
      if (response.success) {
        alert(`✅ Successfully deleted ${response.results?.archived || 0} audit logs`);
        setShowDeleteModal(false);
        setDeleteParams(null);
        setDeletePreview(null);
        // Refresh the page data
        await handleRefresh();
      } else {
        alert('❌ Deletion failed: ' + response.message);
      }
    } catch (error) {
      console.error('Failed to delete logs:', error);
      alert('❌ Failed to delete logs. Please try again.');
    } finally {
      setDeleting(false);
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

const previewDateRangeDeletion = async () => {
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
    // Preview deletion first
    const preview = await auditService.previewDeletion({
      date_from: dateRange.start,
      date_to: dateRange.end
    });
    
    if (preview.success) {
      setDeleteParams({
        date_from: dateRange.start,
        date_to: dateRange.end
      });
      setDeletePreview(preview.data);
      setShowDateRangeModal(false);
      setShowDeleteModal(true);
    }
  } catch (error) {
    console.error('Failed to preview deletion:', error);
    alert('Failed to preview deletion. Please try again.');
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

  const getEventIcon = (eventType) => {
    const icons = {
      login_success: LogIn,
      login_failed: XCircle,
      logout: LogOut,
      order_created: ShoppingCart,
      order_status_changed: Truck,
      order_cancelled: XCircle,
      payment_recorded: DollarSign,
      product_created: Package,
      product_updated: Settings,
      product_deleted: XCircle,
      user_registered: UserCheck,
      user_deleted: UserX,
      privilege_elevated: ArrowUp,
      privilege_elevation_failed: XCircle
    };
    return icons[eventType] || Activity;
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

  const StatCard = ({ icon: Icon, label, value, color, trend, filterKey, filterValue, isActive, onClick }) => (
    <div 
      onClick={onClick}
      className={`bg-white rounded-lg shadow-sm p-3 md:p-4 border-2 cursor-pointer transition-all hover:shadow-md ${
        isActive ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-100'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${color} ${isActive ? 'ring-2 ring-white' : ''}`}>
          <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${
            trend > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className={`text-xs md:text-sm mb-1 ${isActive ? 'text-orange-600 font-semibold' : 'text-gray-600'} truncate`}>
        {label}
      </p>
      <p className="text-lg md:text-xl font-bold text-gray-900">{value}</p>
      {isActive && (
        <p className="text-xs text-orange-600 mt-1 font-medium">
          ✓ Active
        </p>
      )}
    </div>
  );

  if (loading && !auditLogs.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Shield className="w-8 h-8 text-orange-600" />
                Audit Logs
              </h1>
              <p className="text-gray-600">
                Complete system activity and security audit trail
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
                className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm md:text-base bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>

              <button
                onClick={() => navigate('/archives/archives')}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Archive className="w-4 h-4" />
                View Archives
              </button>
              
              {/* Cleanup Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDeleteDropdown(!showDeleteDropdown)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Cleanup
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showDeleteDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="p-2">
                      <button
                        onClick={() => handleDeleteRequest('suspicious')}
                        className="w-full text-left px-4 py-2 hover:bg-red-50 rounded-lg text-sm font-medium text-gray-700 flex items-center gap-2"
                      >
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        Delete Suspicious Logs
                      </button>
                      
                      <button
                        onClick={() => handleDeleteRequest('low_severity')}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 rounded-lg text-sm font-medium text-gray-700 flex items-center gap-2"
                      >
                        <Info className="w-4 h-4 text-blue-600" />
                        Delete Low Severity
                      </button>
                      
                      <button
                        onClick={() => handleDeleteRequest('medium_severity')}
                        className="w-full text-left px-4 py-2 hover:bg-yellow-50 rounded-lg text-sm font-medium text-gray-700 flex items-center gap-2"
                      >
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        Delete Medium Severity
                      </button>
                      
                      <button
                        onClick={() => handleDeleteRequest('high_severity')}
                        className="w-full text-left px-4 py-2 hover:bg-orange-50 rounded-lg text-sm font-medium text-gray-700 flex items-center gap-2"
                      >
                        <AlertCircle className="w-4 h-4 text-orange-600" />
                        Delete High Severity
                      </button>
                      
                      <button
                        onClick={() => setShowDateRangeModal(true)}
                        className="w-full text-left px-4 py-2 hover:bg-purple-50 rounded-lg text-sm font-medium text-gray-700 flex items-center gap-2"
                      >
                        <Calendar className="w-4 h-4 text-purple-600" />
                        Delete by Date Range
                      </button>
                      
                      <div className="border-t border-gray-200 my-2"></div>
                      
                      <button
                        onClick={() => handleDeleteRequest('all')}
                        className="w-full text-left px-4 py-2 hover:bg-red-100 rounded-lg text-sm font-bold text-red-600 flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        ⚠️ Delete ALL Logs
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
            <StatCard
              icon={Activity}
              label="Total Events"
              value={stats.total_logs?.toLocaleString() || '0'}
              color="bg-blue-600"
              filterKey="all"
              filterValue=""
              isActive={activeFilter === 'all'}
              onClick={() => handleStatCardClick('all', '')}
            />
            <StatCard
              icon={AlertTriangle}
              label="Suspicious"
              value={stats.suspicious_count?.toLocaleString() || '0'}
              color="bg-red-600"
              filterKey="is_suspicious"
              filterValue="1"
              isActive={activeFilter === 'is_suspicious'}
              onClick={() => handleStatCardClick('is_suspicious', '1')}
            />
            <StatCard
              icon={Shield}
              label="Security Events"
              value={stats.by_category?.find(c => c.event_category === 'security')?.count || '0'}
              color="bg-purple-600"
              filterKey="event_category"
              filterValue="security"
              isActive={activeFilter === 'event_category' && filters.event_category === 'security'}
              onClick={() => handleStatCardClick('event_category', 'security')}
            />
            <StatCard
              icon={ShoppingCart}
              label="Order Events"
              value={stats.by_category?.find(c => c.event_category === 'order')?.count || '0'}
              color="bg-green-600"
              filterKey="event_category"
              filterValue="order"
              isActive={activeFilter === 'event_category' && filters.event_category === 'order'}
              onClick={() => handleStatCardClick('event_category', 'order')}
            />
            <StatCard
              icon={DollarSign}
              label="Payment Events"
              value={stats.by_category?.find(c => c.event_category === 'payment')?.count || '0'}
              color="bg-orange-600"
              filterKey="event_category"
              filterValue="payment"
              isActive={activeFilter === 'event_category' && filters.event_category === 'payment'}
              onClick={() => handleStatCardClick('event_category', 'payment')}
            />
            
            {/* Add Task Card */}
            <div 
              onClick={() => {
                // TODO: Add your task assignment logic here
                alert('Add task functionality - Coming soon!');
              }}
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-sm p-3 md:p-4 border-2 border-dashed border-gray-300 cursor-pointer transition-all hover:shadow-md hover:border-orange-400 hover:from-orange-50 hover:to-orange-100 group"
            >
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 rounded-lg bg-gray-400 group-hover:bg-orange-500 transition-colors">
                  <Plus className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
              </div>
              <p className="text-xs md:text-sm mb-1 text-gray-600 group-hover:text-orange-600 text-center font-medium truncate">
                Add Task
              </p>
              <p className="text-lg md:text-xl font-bold text-gray-400 group-hover:text-orange-500 text-center transition-colors">
                + New
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Search
              {activeFilter && (
                <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                  Active Filter
                </span>
              )}
            </h2>
            <div className="flex items-center gap-2">
              {activeFilter && (
                <button
                  onClick={() => handleStatCardClick(activeFilter, '')}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                {showFilters ? 'Hide' : 'Show'} Advanced Filters
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by description, user, or event type..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <button
              onClick={handleSearch}
              className="w-full sm:w-auto px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Search
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.event_category}
                  onChange={(e) => setFilters({ ...filters, event_category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">All Severities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Suspicious Only
                </label>
                <select
                  value={filters.is_suspicious}
                  onChange={(e) => setFilters({ ...filters, is_suspicious: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">All Events</option>
                  <option value="1">Suspicious Only</option>
                  <option value="0">Normal Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date From
                </label>
                <input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {auditLogs.map((log) => {
                  const categoryInfo = getCategoryIcon(log.event_category);
                  const CategoryIcon = categoryInfo.icon;
                  const EventIcon = getEventIcon(log.event_type);

                  return (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <div className="flex flex-wrap items-center gap-2 md:gap-3">
                          <div className={`p-2 rounded-lg ${categoryInfo.bg}`}>
                            <CategoryIcon className={`w-5 h-5 ${categoryInfo.color}`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {log.event_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </p>
                            <p className="text-xs text-gray-500">{log.event_category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          {log.is_suspicious && (
                            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                          )}
                          <p className="text-sm text-gray-900 max-w-md truncate">
                            {log.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {log.user?.name || 'System'}
                            </p>
                            <p className="text-xs text-gray-500">{log.user_role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-900 font-mono">{log.ip_address}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getSeverityBadge(log.severity)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <p className="text-sm text-gray-900">{formatDate(log.occurred_at)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => {
                            setSelectedLog(log);
                            setShowModal(true);
                          }}
                          className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                        >
                          View Details
                        </button>
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
                  className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600">
                  Page {pagination.current_page} of {pagination.last_page}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
                  disabled={pagination.current_page === pagination.last_page}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Detail Modal */}
        {showModal && selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto mx-4">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Audit Log Details</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <XCircle className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Event Info */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Event Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Event Type:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedLog.event_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Category:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedLog.event_category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Severity:</span>
                      {getSeverityBadge(selectedLog.severity)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Action:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedLog.action}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                  <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-4">{selectedLog.description}</p>
                </div>

                {/* User Info */}
                {selectedLog.user && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">User Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Name:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedLog.user.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedLog.user.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Role:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedLog.user_role}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Technical Details */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Technical Details</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">IP Address:</span>
                      <span className="text-sm font-mono text-gray-900">{selectedLog.ip_address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">User Agent:</span>
                      <span className="text-sm text-gray-900 truncate max-w-md">{selectedLog.user_agent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Request Method:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedLog.request_method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Request URL:</span>
                      <span className="text-sm text-gray-900 truncate max-w-md">{selectedLog.request_url}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Timestamp:</span>
                      <span className="text-sm text-gray-900">{formatDate(selectedLog.occurred_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Changes (if any) */}
                {(selectedLog.old_values || selectedLog.new_values) && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Changes</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {selectedLog.old_values && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-600 mb-2">Old Values:</p>
                          <pre className="text-xs text-gray-900 overflow-x-auto">
                            {JSON.stringify(selectedLog.old_values, null, 2)}
                          </pre>
                        </div>
                      )}
                      {selectedLog.new_values && (
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-2">New Values:</p>
                          <pre className="text-xs text-gray-900 overflow-x-auto">
                            {JSON.stringify(selectedLog.new_values, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Metadata (if any) */}
                {selectedLog.metadata && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Additional Metadata</h3>
                    <pre className="text-xs text-gray-900 bg-gray-50 rounded-lg p-4 overflow-x-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full sm:w-auto px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && deletePreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-red-100 rounded-full">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Confirm Deletion</h2>
                    <p className="text-sm text-gray-600">This action cannot be undone</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4">
                  <p className="text-sm font-medium text-red-800 mb-2">
                    ⚠️ You are about to delete:
                  </p>
                  <p className="text-2xl font-bold text-red-900">
                    {deletePreview.would_archive?.toLocaleString() || '0'} audit logs
                  </p>
                </div>

                {deletePreview.breakdown && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-xs font-medium text-gray-600 mb-2">Breakdown:</p>
                    {deletePreview.breakdown.standard > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">Standard logs:</span>
                        <span className="font-medium text-gray-900">{deletePreview.breakdown.standard}</span>
                      </div>
                    )}
                    {deletePreview.breakdown.high_severity > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">High severity:</span>
                        <span className="font-medium text-gray-900">{deletePreview.breakdown.high_severity}</span>
                      </div>
                    )}
                    {deletePreview.breakdown.suspicious > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">Suspicious:</span>
                        <span className="font-medium text-gray-900">{deletePreview.breakdown.suspicious}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-xs text-blue-800">
                    ℹ️ Logs will be archived before deletion. You can restore them from archives if needed.
                  </p>
                </div>
              </div>

              <div className="p-4 md:p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-2 md:gap-3 flex-shrink-0">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteParams(null);
                    setDeletePreview(null);
                  }}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      Yes, Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Date Range Selection Modal */}
        {showDateRangeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
              <div className="p-4 md:p-6 border-b border-gray-200 flex-shrink-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="p-2 md:p-3 bg-purple-100 rounded-full flex-shrink-0">
                      <Calendar className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-lg md:text-xl font-bold text-gray-900">Select Time Range for Deletion</h2>
                      <p className="text-xs md:text-sm text-gray-600">Choose a quick option or set custom dates</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowDateRangeModal(false);
                      setDateRangeSelection({ mode: '', quickOption: '', customStart: '', customEnd: '' });
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg absolute top-4 right-4 md:relative md:top-0 md:right-0"
                  >
                    <XCircle className="w-5 h-5 md:w-6 md:h-6 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto flex-1">
                {/* Quick Select Options */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2 md:mb-3">Quick Select:</h3>
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    <button
                      onClick={() => handleQuickDateRangeSelect('30days')}
                      className={`p-3 md:p-4 border-2 rounded-lg text-center transition-all ${
                        dateRangeSelection.quickOption === '30days'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <Calendar className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-1 md:mb-2 text-purple-600" />
                      <p className="text-xs md:text-sm font-semibold text-gray-900">Last 30 Days</p>
                      <p className="text-xs text-gray-500 mt-0.5 md:mt-1 leading-tight">
                        {(() => {
                          const range = calculateDateRange('30days');
                          return `${range.start} to ${range.end}`;
                        })()}
                      </p>
                    </button>

                    <button
                      onClick={() => handleQuickDateRangeSelect('3months')}
                      className={`p-3 md:p-4 border-2 rounded-lg text-center transition-all ${
                        dateRangeSelection.quickOption === '3months'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <Calendar className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-1 md:mb-2 text-purple-600" />
                      <p className="text-xs md:text-sm font-semibold text-gray-900">Last 3 Months</p>
                      <p className="text-xs text-gray-500 mt-0.5 md:mt-1 leading-tight">
                        {(() => {
                          const range = calculateDateRange('3months');
                          return `${range.start} to ${range.end}`;
                        })()}
                      </p>
                    </button>

                    <button
                      onClick={() => handleQuickDateRangeSelect('6months')}
                      className={`p-3 md:p-4 border-2 rounded-lg text-center transition-all ${
                        dateRangeSelection.quickOption === '6months'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <Calendar className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-1 md:mb-2 text-purple-600" />
                      <p className="text-xs md:text-sm font-semibold text-gray-900">Last 6 Months</p>
                      <p className="text-xs text-gray-500 mt-0.5 md:mt-1 leading-tight">
                        {(() => {
                          const range = calculateDateRange('6months');
                          return `${range.start} to ${range.end}`;
                        })()}
                      </p>
                    </button>

                    <button
                      onClick={() => handleQuickDateRangeSelect('1year')}
                      className={`p-3 md:p-4 border-2 rounded-lg text-center transition-all ${
                        dateRangeSelection.quickOption === '1year'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <Calendar className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-1 md:mb-2 text-purple-600" />
                      <p className="text-xs md:text-sm font-semibold text-gray-900">Last 1 Year</p>
                      <p className="text-xs text-gray-500 mt-0.5 md:mt-1 leading-tight">
                        {(() => {
                          const range = calculateDateRange('1year');
                          return `${range.start} to ${range.end}`;
                        })()}
                      </p>
                    </button>
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
                  <div className="flex items-center justify-between mb-2 md:mb-3">
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

                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 p-3 md:p-4 rounded-lg border-2 transition-all ${
                    dateRangeSelection.mode === 'custom'
                      ? 'border-purple-300 bg-purple-50'
                      : 'border-gray-200 bg-gray-50 opacity-50'
                  }`}>
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        disabled={dateRangeSelection.mode !== 'custom'}
                        value={dateRangeSelection.customStart}
                        onChange={(e) => setDateRangeSelection(prev => ({ ...prev, customStart: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        disabled={dateRangeSelection.mode !== 'custom'}
                        value={dateRangeSelection.customEnd}
                        onChange={(e) => setDateRangeSelection(prev => ({ ...prev, customEnd: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Warning */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs md:text-sm text-red-800">
                      <p className="font-medium">⚠️ Warning:</p>
                      <p className="mt-1">All logs within the selected date range will be archived and deleted. You'll see a preview before final deletion.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-2 md:gap-3 flex-shrink-0">
                <button
                  onClick={() => {
                    setShowDateRangeModal(false);
                    setDateRangeSelection({ mode: '', quickOption: '', customStart: '', customEnd: '' });
                  }}
                  className="flex-1 px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={previewDateRangeDeletion}
                  disabled={!dateRangeSelection.mode}
                  className="flex-1 px-4 py-2 text-sm md:text-base bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview Deletion</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogsPage;