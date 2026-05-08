import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSupportCases } from '../../hooks/useSupportCases';
import supportCaseService from '../../services/supportCaseService';
import { CaseStatusChip } from '../../components/messaging/CaseStatusChip';
import {
  Inbox, Users, AlertTriangle, CheckCircle, Clock, TrendingUp,
  Search, Filter, RefreshCw, ChevronDown, Eye, UserCheck,
  ArrowRightCircle, XCircle, MessageSquare, Package, Mail,
  AlertCircle, Truck, Loader2
} from 'lucide-react';

const TABS = [
  { key: 'unclaimed', label: 'Unclaimed', icon: Inbox, color: 'text-gray-600' },
  { key: 'my-cases', label: 'My Cases', icon: UserCheck, color: 'text-blue-600' },
  { key: 'escalated', label: 'Escalated', icon: AlertTriangle, color: 'text-red-600' },
  { key: 'resolved', label: 'Resolved', icon: CheckCircle, color: 'text-green-600' },
  { key: 'all', label: 'All Active', icon: Clock, color: 'text-amber-600' },
  { key: 'history', label: 'History', icon: Clock, color: 'text-slate-600' },
];

const TYPE_FILTERS = [
  { key: 'all', label: 'All Types', icon: MessageSquare },
  { key: 'order_issue', label: 'Order Issues', icon: Package },
  { key: 'account_help', label: 'Account Help', icon: Mail },
  { key: 'report_problem', label: 'Problems', icon: AlertCircle },
  { key: 'delivery_question', label: 'Delivery', icon: Truck },
];

const SupportInboxPage = () => {
  const { user } = useAuth();
  const {
    cases,
    loading,
    stats,
    fetchQueue,
    fetchStats,
    claimCase,
    resolveCase,
    closeCase,
    escalateCase,
    fetchHistory,
  } = useSupportCases();

  const [activeTab, setActiveTab] = useState('unclaimed');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [escalationReason, setEscalationReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const canHandleCases = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'support_agent';

  const loadData = useCallback(async () => {
    const params = {};
    if (activeTab === 'unclaimed') params.unclaimed = true;
    if (activeTab === 'my-cases') params.mine = true;
    if (activeTab === 'escalated') params.status = 'escalated';
    if (activeTab === 'resolved') params.status = 'resolved';
    if (activeTab === 'history') {
      await fetchHistory({ case_type: typeFilter !== 'all' ? typeFilter : undefined });
      await fetchStats();
      return;
    }
    if (typeFilter !== 'all') params.queue = typeFilter;

    await fetchQueue(params);
    await fetchStats();
  }, [activeTab, typeFilter, fetchQueue, fetchStats]);

  useEffect(() => {
    if (canHandleCases) {
      loadData();
    }
  }, [loadData, canHandleCases]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleClaim = async (caseId) => {
    setActionLoading(true);
    try {
      await claimCase(caseId);
      await loadData();
    } catch (err) {
      console.error('Claim failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async (caseId) => {
    if (!resolutionNotes.trim()) return;
    setActionLoading(true);
    try {
      await resolveCase(caseId, resolutionNotes);
      setShowResolveModal(false);
      setResolutionNotes('');
      setSelectedCase(null);
      await loadData();
    } catch (err) {
      console.error('Resolve failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEscalate = async (caseId) => {
    if (!escalationReason.trim() || escalationReason.length < 10) {
      alert('Please provide a reason (min 10 characters)');
      return;
    }
    setActionLoading(true);
    try {
      await escalateCase(caseId, escalationReason);
      setShowEscalateModal(false);
      setEscalationReason('');
      setSelectedCase(null);
      await loadData();
    } catch (err) {
      console.error('Escalation failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClose = async (caseId) => {
    setActionLoading(true);
    try {
      await closeCase(caseId);
      await loadData();
    } catch (err) {
      console.error('Close failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const openCaseDetail = (supportCase) => {
    setSelectedCase(supportCase);
    setShowDetailDrawer(true);
  };

  const filteredCases = cases.filter(c => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      c.case_id?.toLowerCase().includes(query) ||
      c.subject?.toLowerCase().includes(query) ||
      c.user?.name?.toLowerCase().includes(query) ||
      c.user?.email?.toLowerCase().includes(query)
    );
  });

  if (!canHandleCases) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-500">You don't have permission to access the support queue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Inbox className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Support Queue</h1>
                <p className="text-xs text-gray-500">Manage customer support cases</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <StatCard icon={Inbox} label="Unclaimed" value={stats.total_unclaimed} color="text-gray-600" bg="bg-gray-50" />
              <StatCard icon={Clock} label="Active" value={stats.total_active} color="text-amber-600" bg="bg-amber-50" />
              <StatCard icon={AlertTriangle} label="Escalated" value={stats.total_escalated} color="text-red-600" bg="bg-red-50" />
              <StatCard icon={UserCheck} label="My Cases" value={stats.my_open} color="text-blue-600" bg="bg-blue-50" />
              <StatCard icon={TrendingUp} label="SLA Breached" value={stats.sla_breached} color="text-orange-600" bg="bg-orange-50" />
              <StatCard icon={CheckCircle} label="By Priority" value={`U:${stats.by_priority?.urgent || 0} H:${stats.by_priority?.high || 0}`} color="text-green-600" bg="bg-green-50" />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs & Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.key ? 'text-white' : tab.color}`} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Type Filter */}
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-xl pl-10 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
              >
                {TYPE_FILTERS.map(t => (
                  <option key={t.key} value={t.key}>{t.label}</option>
                ))}
              </select>
              <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cases..."
                className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-64"
              />
            </div>
          </div>
        </div>

        {/* Cases Table */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Case</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && cases.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">Loading cases...</p>
                    </td>
                  </tr>
                ) : filteredCases.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No cases found</p>
                    </td>
                  </tr>
                ) : (
                  filteredCases.map((supportCase) => (
                    <tr
                      key={supportCase.case_id}
                      className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                      onClick={() => openCaseDetail(supportCase)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-mono text-sm font-bold text-gray-900">{supportCase.case_id}</span>
                          <span className="text-xs text-gray-500 truncate max-w-[200px]">{supportCase.subject}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                            {supportCase.user?.name?.[0]?.toUpperCase() || 'G'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{supportCase.user?.name || 'Guest'}</p>
                            <p className="text-xs text-gray-500">{supportCase.user?.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <TypeBadge type={supportCase.case_type} />
                      </td>
                      <td className="px-6 py-4">
                        <CaseStatusChip status={supportCase.status} size="sm" />
                      </td>
                      <td className="px-6 py-4">
                        <PriorityBadge priority={supportCase.priority} />
                      </td>
                      <td className="px-6 py-4">
                        {supportCase.assigned_agent ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold">
                              {supportCase.assigned_agent.name?.[0]?.toUpperCase()}
                            </div>
                            <span className="text-sm text-gray-700">{supportCase.assigned_agent.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Unclaimed</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-500">
                          {new Date(supportCase.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); openCaseDetail(supportCase); }}
                            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          {supportCase.status === 'new' && !supportCase.assigned_to && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleClaim(supportCase.case_id); }}
                              disabled={actionLoading}
                              className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Claim case"
                            >
                              <UserCheck className="w-4 h-4 text-blue-600" />
                            </button>
                          )}
                          {['open', 'in_progress', 'pending_user'].includes(supportCase.status) && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedCase(supportCase); setShowResolveModal(true); }}
                              className="p-1.5 hover:bg-green-100 rounded-lg transition-colors"
                              title="Resolve"
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </button>
                          )}
                          {supportCase.status !== 'escalated' && supportCase.status !== 'closed' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedCase(supportCase); setShowEscalateModal(true); }}
                              className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                              title="Escalate"
                            >
                              <AlertTriangle className="w-4 h-4 text-red-600" />
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
      </div>

      {/* Detail Drawer */}
      {showDetailDrawer && selectedCase && (
        <CaseDetailDrawer
          supportCase={selectedCase}
          onClose={() => { setShowDetailDrawer(false); setSelectedCase(null); }}
          onClaim={() => handleClaim(selectedCase.case_id)}
          onResolve={() => { setShowResolveModal(true); }}
          onEscalate={() => { setShowEscalateModal(true); }}
          onCloseCase={() => handleClose(selectedCase.case_id)}
        />
      )}

      {/* Resolve Modal */}
      {showResolveModal && selectedCase && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Resolve Case</h3>
            <p className="text-sm text-gray-500 mb-4">{selectedCase.case_id} — {selectedCase.subject}</p>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Describe how this case was resolved..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowResolveModal(false); setResolutionNotes(''); }}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResolve(selectedCase.case_id)}
                disabled={!resolutionNotes.trim() || actionLoading}
                className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Mark Resolved
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Escalate Modal */}
      {showEscalateModal && selectedCase && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Escalate Case</h3>
            <p className="text-sm text-gray-500 mb-4">{selectedCase.case_id} — {selectedCase.subject}</p>
            <textarea
              value={escalationReason}
              onChange={(e) => setEscalationReason(e.target.value)}
              placeholder="Explain why this case needs escalation (min 10 chars)..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowEscalateModal(false); setEscalationReason(''); }}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleEscalate(selectedCase.case_id)}
                disabled={escalationReason.length < 10 || actionLoading}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                Escalate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-components
const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className={`${bg} rounded-xl p-3 flex items-center gap-3`}>
    <Icon className={`w-5 h-5 ${color}`} />
    <div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  </div>
);

const TypeBadge = ({ type }) => {
  const config = {
    order_issue: { icon: Package, label: 'Order', color: 'bg-orange-100 text-orange-700' },
    account_help: { icon: Mail, label: 'Account', color: 'bg-indigo-100 text-indigo-700' },
    report_problem: { icon: AlertCircle, label: 'Report', color: 'bg-red-100 text-red-700' },
    delivery_question: { icon: Truck, label: 'Delivery', color: 'bg-cyan-100 text-cyan-700' },
  };
  const c = config[type] || { icon: MessageSquare, label: 'Support', color: 'bg-gray-100 text-gray-600' };
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${c.color}`}>
      <Icon className="w-3 h-3" />
      {c.label}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const colors = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${colors[priority] || colors.medium}`}>
      {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
    </span>
  );
};

const CaseDetailDrawer = ({ supportCase, onClose, onClaim, onResolve, onEscalate, onCloseCase }) => {
  const [activeTab, setActiveTab] = useState('details');
  const { user } = useAuth();
  const isAgent = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'support_agent';
  const isAssigned = supportCase.assigned_to === user?.id;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-lg bg-white shadow-2xl flex flex-col h-full animate-slide-in-right">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{supportCase.case_id}</h2>
            <p className="text-sm text-gray-500">{supportCase.subject}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <XCircle className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {['details', 'conversation', 'history', 'notes'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InfoCard label="Status" value={<CaseStatusChip status={supportCase.status} />} />
                <InfoCard label="Priority" value={<PriorityBadge priority={supportCase.priority} />} />
                <InfoCard label="Type" value={<TypeBadge type={supportCase.case_type} />} />
                <InfoCard label="Source" value={supportCase.source || 'Web'} />
                <InfoCard label="Created" value={new Date(supportCase.created_at).toLocaleString()} />
                <InfoCard label="Case ID" value={supportCase.case_id} />
              </div>

              {supportCase.description && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{supportCase.description}</p>
                </div>
              )}

              {supportCase.order && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-orange-800 mb-2 flex items-center gap-2">
                    <Package className="w-4 h-4" /> Linked Order
                  </h4>
                  <div className="space-y-1 text-sm text-orange-700">
                    <p><span className="font-medium">Order #:</span> {supportCase.order.order_number}</p>
                    <p><span className="font-medium">Status:</span> {supportCase.order.status}</p>
                    <p><span className="font-medium">Total:</span> ${supportCase.order.total}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              {isAgent && (
                <div className="flex flex-wrap gap-2 pt-4">
                  {supportCase.status === 'new' && !supportCase.assigned_to && (
                    <button onClick={onClaim} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                      Claim Case
                    </button>
                  )}
                  {['open', 'in_progress', 'pending_user'].includes(supportCase.status) && (
                    <button onClick={onResolve} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                      Resolve
                    </button>
                  )}
                  {supportCase.status !== 'escalated' && supportCase.status !== 'closed' && (
                    <button onClick={onEscalate} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                      Escalate
                    </button>
                  )}
                  {supportCase.status === 'resolved' && (
                    <button onClick={onCloseCase} className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
                      Close
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'conversation' && (
            <div className="text-center py-12 text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Conversation view coming soon</p>
              <p className="text-xs text-gray-400 mt-1">Navigate to Messages to chat</p>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              {supportCase.history?.length > 0 ? (
                supportCase.history.map((h, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold flex-shrink-0">
                      {h.changed_by?.name?.[0] || 'S'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">
                        <span className="font-medium">{h.changed_by?.name || 'System'}</span>
                        {' '}changed status from <span className="font-medium">{h.from_status}</span> to <span className="font-medium">{h.to_status}</span>
                      </p>
                      {h.reason && <p className="text-xs text-gray-500 mt-1">{h.reason}</p>}
                      <p className="text-xs text-gray-400 mt-1">{new Date(h.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 text-sm py-8">No history yet</p>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">Internal notes coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ label, value }) => (
  <div className="bg-gray-50 rounded-xl p-3">
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <div className="text-sm font-medium text-gray-900">{value}</div>
  </div>
);

export default SupportInboxPage;
