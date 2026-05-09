import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSupportCases } from '../../hooks/useSupportCases';
import supportCaseService from '../../services/supportCaseService';
import api from '../../services/api';
import { CaseStatusChip } from '../../components/messaging/CaseStatusChip';
import { SystemMessage } from '../../components/messaging/SystemMessage';
import {
  Inbox, Users, AlertTriangle, CheckCircle, Clock, TrendingUp,
  Search, Filter, RefreshCw, ChevronDown, Eye, UserCheck,
  ArrowRightCircle, XCircle, MessageSquare, Package, Mail,
  AlertCircle, Truck, Loader2, Copy, Check, ClipboardCopy,
  Send, ArrowLeft, Phone, Video, MoreVertical, Paperclip, Smile,
  X, Reply, Pencil, Trash2, CheckCheck, Headphones, ShoppingBag,
  Pin, Archive, Star, History, StickyNote, User, Calendar,
  DollarSign, CreditCard, MapPin, FileText, Tag, ChevronRight,
  RotateCcw, Lock, Unlock, Plus, Save, CornerUpLeft
} from 'lucide-react';

const TABS = [
  { key: 'unclaimed', label: 'Unclaimed', icon: Inbox, color: 'text-gray-600' },
  { key: 'my-cases', label: 'My Cases', icon: UserCheck, color: 'text-blue-600' },
  { key: 'escalated', label: 'Escalated', icon: AlertTriangle, color: 'text-red-600' },
  { key: 'resolved', label: 'Resolved', icon: CheckCircle, color: 'text-green-600' },
  { key: 'all', label: 'All Active', icon: Clock, color: 'text-amber-600' },
  { key: 'history', label: 'History', icon: History, color: 'text-slate-600' },
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
    reopenCase,
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
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [escalationReason, setEscalationReason] = useState('');
  const [reopenReason, setReopenReason] = useState('');
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
  }, [activeTab, typeFilter, fetchQueue, fetchStats, fetchHistory]);

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
      // Refresh selected case if open
      if (selectedCase?.case_id === caseId) {
        const refreshed = await supportCaseService.getCase(caseId);
        setSelectedCase(refreshed.data.data);
      }
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
      await loadData();
      if (selectedCase?.case_id === caseId) {
        const refreshed = await supportCaseService.getCase(caseId);
        setSelectedCase(refreshed.data.data);
      }
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
      await loadData();
      if (selectedCase?.case_id === caseId) {
        const refreshed = await supportCaseService.getCase(caseId);
        setSelectedCase(refreshed.data.data);
      }
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
      if (selectedCase?.case_id === caseId) {
        const refreshed = await supportCaseService.getCase(caseId);
        setSelectedCase(refreshed.data.data);
      }
    } catch (err) {
      console.error('Close failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReopen = async (caseId) => {
    if (!reopenReason.trim()) {
      alert('Please provide a reason for reopening');
      return;
    }
    setActionLoading(true);
    try {
      await reopenCase(caseId, reopenReason);
      setShowReopenModal(false);
      setReopenReason('');
      await loadData();
      if (selectedCase?.case_id === caseId) {
        const refreshed = await supportCaseService.getCase(caseId);
        setSelectedCase(refreshed.data.data);
      }
    } catch (err) {
      console.error('Reopen failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const openCaseDetail = async (supportCase) => {
    // Fetch full case details with all relationships
    try {
      const res = await supportCaseService.getCase(supportCase.case_id);
      setSelectedCase(res.data.data);
      setShowDetailDrawer(true);
    } catch (err) {
      console.error('Failed to load case details:', err);
      setSelectedCase(supportCase);
      setShowDetailDrawer(true);
    }
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
          onReopen={() => { setShowReopenModal(true); }}
          user={user}
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

      {/* Reopen Modal */}
      {showReopenModal && selectedCase && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reopen Case</h3>
            <p className="text-sm text-gray-500 mb-4">{selectedCase.case_id} — {selectedCase.subject}</p>
            <textarea
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="Explain why this case is being reopened..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowReopenModal(false); setReopenReason(''); }}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReopen(selectedCase.case_id)}
                disabled={!reopenReason.trim() || actionLoading}
                className="flex-1 py-2.5 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                Reopen Case
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

// ============================================================================
// CASE DETAIL DRAWER — Enhanced with all tabs
// ============================================================================
const CaseDetailDrawer = ({ supportCase, onClose, onClaim, onResolve, onEscalate, onCloseCase, onReopen, user }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [caseData, setCaseData] = useState(supportCase);
  const [loading, setLoading] = useState(false);
  const isAgent = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'support_agent';
  const isAssigned = caseData.assigned_to === user?.id;

  // Refresh case data when tab changes
  const refreshCase = async () => {
    try {
      setLoading(true);
      const res = await supportCaseService.getCase(caseData.case_id);
      setCaseData(res.data.data);
    } catch (err) {
      console.error('Failed to refresh case:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCase();
  }, [activeTab]);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-2xl bg-white shadow-2xl flex flex-col h-full animate-slide-in-right">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{caseData.case_id}</h2>
              <p className="text-sm text-gray-500 truncate max-w-[300px]">{caseData.subject}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <XCircle className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-white">
          {[
            { key: 'details', label: 'Details', icon: FileText },
            { key: 'conversation', label: 'Conversation', icon: MessageSquare },
            { key: 'history', label: 'History', icon: History },
            { key: 'notes', label: 'Notes', icon: StickyNote },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === tab.key ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'details' && (
            <DetailsTab caseData={caseData} isAgent={isAgent} isAssigned={isAssigned} onClaim={onClaim} onResolve={onResolve} onEscalate={onEscalate} onCloseCase={onCloseCase} onReopen={onReopen} />
          )}
          {activeTab === 'conversation' && (
            <ConversationTab caseData={caseData} user={user} />
          )}
          {activeTab === 'history' && (
            <HistoryTab caseData={caseData} user={user} />
          )}
          {activeTab === 'notes' && (
            <NotesTab caseData={caseData} user={user} onRefresh={refreshCase} />
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// DETAILS TAB
// ============================================================================
const DetailsTab = ({ caseData, isAgent, isAssigned, onClaim, onResolve, onEscalate, onCloseCase, onReopen }) => {
  const [copiedField, setCopiedField] = useState(null);

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyButton = ({ text, field }) => (
    <button
      onClick={() => copyToClipboard(text, field)}
      className="p-1 hover:bg-gray-200 rounded transition-colors ml-1"
      title="Copy to clipboard"
    >
      {copiedField === field ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-gray-400" />}
    </button>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Status Grid */}
      <div className="grid grid-cols-2 gap-4">
        <InfoCard label="Status" value={<CaseStatusChip status={caseData.status} />} />
        <InfoCard label="Priority" value={<PriorityBadge priority={caseData.priority} />} />
        <InfoCard label="Type" value={<TypeBadge type={caseData.case_type} />} />
        <InfoCard label="Source" value={caseData.source || 'Web'} />
        <InfoCard label="Created" value={new Date(caseData.created_at).toLocaleString()} />
        <InfoCard label="Case ID" value={
          <span className="font-mono">{caseData.case_id}<CopyButton text={caseData.case_id} field="case_id" /></span>
        } />
      </div>

      {/* Subject & Description */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Subject</h4>
          <p className="text-sm font-medium text-gray-900">{caseData.subject}</p>
        </div>
        {caseData.description && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</h4>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{caseData.description}</p>
          </div>
        )}
      </div>

      {/* Linked Order Card */}
      {caseData.case_type === 'order_issue' && (
        caseData.order?.id || caseData.order?.order_display || caseData.order?.order_number ? (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag className="w-4 h-4 text-orange-600" />
              <h4 className="text-sm font-semibold text-orange-800">Linked Order</h4>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Order Display</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-mono font-medium text-gray-900">{caseData.order.order_display || caseData.order.order_number || caseData.order.purchase_id}</span>
                  <CopyButton text={caseData.order.order_display || caseData.order.order_number || caseData.order.purchase_id} field="order_display" />
                </div>
              </div>

              {caseData.order.purchase_id && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Purchase ID</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-mono text-gray-700">{caseData.order.purchase_id}</span>
                    <CopyButton text={caseData.order.purchase_id} field="purchase_id" />
                  </div>
                </div>
              )}

              {caseData.order.customer_name && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Customer</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-900">{caseData.order.customer_name}</span>
                    <CopyButton text={caseData.order.customer_name} field="customer_name" />
                  </div>
                </div>
              )}

              {caseData.order.customer_email && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Email</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-900">{caseData.order.customer_email}</span>
                    <CopyButton text={caseData.order.customer_email} field="customer_email" />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Status</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  caseData.order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                  caseData.order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                  caseData.order.status === 'processing' ? 'bg-amber-100 text-amber-700' :
                  caseData.order.status === 'pending' ? 'bg-gray-100 text-gray-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {caseData.order.status?.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Total</span>
                <span className="text-sm font-bold text-gray-900">${caseData.order.total ? parseFloat(caseData.order.total).toFixed(2) : '0.00'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBag className="w-4 h-4 text-orange-600" />
              <h4 className="text-sm font-semibold text-orange-800">Linked Order</h4>
            </div>
            <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-100 rounded-lg px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Order not linked — no order data available</span>
            </div>
          </div>
        )
      )}

      {/* Customer Info */}
      <div className="bg-blue-50 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-3 flex items-center gap-2">
          <User className="w-3 h-3" /> Customer Information
        </h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Name</span>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-900">{caseData.user?.name || 'Guest'}</span>
              {caseData.user?.name && <CopyButton text={caseData.user.name} field="user_name" />}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Email</span>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-900">{caseData.user?.email || 'N/A'}</span>
              {caseData.user?.email && <CopyButton text={caseData.user.email} field="user_email" />}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">User ID</span>
            <span className="text-sm font-mono text-gray-900">{caseData.user_id || 'Guest'}</span>
          </div>
        </div>
      </div>

      {/* Agent Actions */}
      {isAgent && (
        <div className="flex flex-wrap gap-2 pt-2">
          {caseData.status === 'new' && !caseData.assigned_to && (
            <button onClick={onClaim} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
              <UserCheck className="w-4 h-4" /> Claim Case
            </button>
          )}
          {['open', 'in_progress', 'pending_user', 'escalated'].includes(caseData.status) && (
            <button onClick={onResolve} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Resolve
            </button>
          )}
          {caseData.status !== 'escalated' && caseData.status !== 'closed' && (
            <button onClick={onEscalate} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Escalate
            </button>
          )}
          {caseData.status === 'resolved' && (
            <>
              <button onClick={onCloseCase} className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors flex items-center gap-2">
                <XCircle className="w-4 h-4" /> Close
              </button>
              <button onClick={onReopen} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors flex items-center gap-2">
                <RotateCcw className="w-4 h-4" /> Reopen
              </button>
            </>
          )}
          {caseData.status === 'closed' && (
            <button onClick={onReopen} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> Reopen
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// CONVERSATION TAB
// ============================================================================
const ConversationTab = ({ caseData, user }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMessages();
  }, [caseData.case_id]);

  const [showFullConversation, setShowFullConversation] = useState(false);
  const [loadingFullConversation, setLoadingFullConversation] = useState(false);

  const loadMessages = async (includeFullConversation = false) => {
    try {
      setLoading(true);
      // Load messages from the case's conversation
      const res = await api.get(`/conversations/${caseData.conversation_id}/cases/${caseData.case_id}/messages`, {
        params: includeFullConversation ? { include_full_conversation: true } : {}
      });
      const data = res.data?.data;
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load messages:', err);
      // Fallback: try loading all conversation messages
      try {
        const res = await api.get(`/conversations/${caseData.conversation_id}/messages`);
        const data = res.data?.data;
        setMessages(Array.isArray(data) ? data : []);
      } catch (err2) {
        console.error('Fallback also failed:', err2);
        setMessages([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoadFullConversation = async () => {
    setLoadingFullConversation(true);
    try {
      await loadMessages(true);
      setShowFullConversation(true);
    } catch (err) {
      console.error('Failed to load full conversation:', err);
    } finally {
      setLoadingFullConversation(false);
    }
  };

  const handleShowCaseOnly = async () => {
    setShowFullConversation(false);
    await loadMessages(false);
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      await api.post(`/conversations/${caseData.conversation_id}/cases/${caseData.case_id}/messages`, {
        body: input.trim(),
        type: 'text'
      });
      setInput('');
      await loadMessages();
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (iso) => {
    if (!iso) return '';
    const date = new Date(iso);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No messages yet</p>
            <p className="text-xs text-gray-400 mt-1">Start the conversation below</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === user?.id;
            const isSystem = msg.type === 'system';

            if (isSystem) {
              // Parse system message for case creation with order info
              const orderMatch = msg.body?.match(/for order ([A-Z0-9]+)/i);
              const orderDisplay = orderMatch?.[1];
              const caseMatch = msg.body?.match(/Case Created:.*?\(([A-Z0-9]+)\)/i);
              const caseId = caseMatch?.[1];

              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <div className="bg-gray-100 border border-gray-200 rounded-full px-4 py-1.5 flex items-center gap-2 max-w-lg">
                    <SystemMessage
                      event={msg.metadata?.event_type || 'created'}
                      timestamp={msg.created_at}
                      details={msg.body}
                      caseId={caseId}
                      orderDisplay={orderDisplay}
                    />
                    <span className="text-[10px] text-gray-400">{formatTime(msg.created_at)}</span>
                  </div>
                </div>
              );
            }

            const isContextMessage = showFullConversation && msg.case_id && msg.case_id !== caseData.case_id && msg.type !== 'system';

            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${isContextMessage ? 'opacity-60' : ''}`}>
                <div className={`max-w-[80%] ${isOwn ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'} rounded-2xl px-4 py-2.5 ${isContextMessage ? 'border border-dashed border-gray-300' : ''}`}>
                  {isContextMessage && (
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-medium">
                        #{msg.case_id?.slice(-6) || 'General'}
                      </span>
                    </div>
                  )}
                  {!isOwn && (
                    <p className="text-[10px] font-medium text-gray-500 mb-0.5">{msg.sender?.name || msg.sender_name || 'Guest'}</p>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                  <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                    <span className={`text-[10px] ${isOwn ? 'text-blue-200' : 'text-gray-400'}`}>{formatTime(msg.created_at)}</span>
                    {isOwn && (
                      <CheckCheck className="w-3 h-3 text-blue-300" />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        {/* See Full Conversation Button */}
        {!showFullConversation && (
          <div className="flex justify-center py-4">
            <button
              onClick={handleLoadFullConversation}
              disabled={loadingFullConversation}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-full border border-gray-200 transition-colors disabled:opacity-50"
            >
              {loadingFullConversation ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  See Full Conversation
                </>
              )}
            </button>
          </div>
        )}

        {/* Full Conversation Loaded Indicator */}
        {showFullConversation && (
          <div className="flex justify-center py-2">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Showing full conversation history
              <button
                onClick={handleShowCaseOnly}
                className="text-blue-500 hover:text-blue-700 font-medium ml-1"
              >
                Show case only
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none max-h-32 px-4 py-2.5 bg-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            style={{ minHeight: '44px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className={`p-3 rounded-full transition-all ${
              input.trim() && !sending
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// HISTORY TAB — All user's past cases
// ============================================================================
const HistoryTab = ({ caseData, user }) => {
  const [historyCases, setHistoryCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHistoryCase, setSelectedHistoryCase] = useState(null);

  useEffect(() => {
    loadUserHistory();
  }, [caseData.user_id]);

  const loadUserHistory = async () => {
    try {
      setLoading(true);
      // Get all cases for this user
      const res = await api.get(`/support-cases?user_id=${caseData.user_id}`);
      const data = res.data?.data?.data || res.data?.data;
      setHistoryCases(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load user history:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <History className="w-4 h-4" />
          All Cases for {caseData.user?.name || 'Guest'}
        </h3>
        <p className="text-xs text-gray-500 mt-1">Complete case history across all interactions</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
        </div>
      ) : historyCases.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <History className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No case history found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {historyCases.map((hc) => (
            <div
              key={hc.case_id}
              onClick={() => setSelectedHistoryCase(hc)}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-gray-900">{hc.case_id}</span>
                    <CaseStatusChip status={hc.status} size="sm" />
                    <PriorityBadge priority={hc.priority} />
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate">{hc.subject}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {hc.case_type?.replace('_', ' ')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(hc.created_at).toLocaleDateString()}
                    </span>
                    {hc.assigned_agent && (
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3 h-3" />
                        {hc.assigned_agent.name}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History Case Modal */}
      {selectedHistoryCase && (
        <HistoryCaseModal
          supportCase={selectedHistoryCase}
          onClose={() => setSelectedHistoryCase(null)}
        />
      )}
    </div>
  );
};

const HistoryCaseModal = ({ supportCase, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Case Details</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">{supportCase.case_id}</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label="Status" value={<CaseStatusChip status={supportCase.status} />} />
            <InfoCard label="Priority" value={<PriorityBadge priority={supportCase.priority} />} />
            <InfoCard label="Type" value={<TypeBadge type={supportCase.case_type} />} />
            <InfoCard label="Created" value={new Date(supportCase.created_at).toLocaleDateString()} />
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Subject</h4>
            <p className="text-sm font-medium text-gray-900">{supportCase.subject}</p>
          </div>

          {supportCase.description && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Description</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{supportCase.description}</p>
            </div>
          )}

          {supportCase.resolution_notes && (
            <div className="bg-green-50 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-green-700 uppercase mb-2">Resolution</h4>
              <p className="text-sm text-green-800 whitespace-pre-wrap">{supportCase.resolution_notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// NOTES TAB — Internal staff notes
// ============================================================================
const NotesTab = ({ caseData, user, onRefresh }) => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPrivate, setIsPrivate] = useState(true);

  useEffect(() => {
    loadNotes();
  }, [caseData.case_id]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const res = await supportCaseService.getCaseNotes(caseData.case_id);
      const data = res.data?.data;
      setNotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load notes:', err);
      // Fallback to case data notes
      setNotes(Array.isArray(caseData.notes) ? caseData.notes : []);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || saving) return;
    setSaving(true);
    try {
      await supportCaseService.addNote(caseData.case_id, newNote.trim(), isPrivate);
      setNewNote('');
      await loadNotes();
      onRefresh?.();
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <StickyNote className="w-4 h-4" />
            Internal Notes
          </h3>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Staff only
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <StickyNote className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No notes yet</p>
            <p className="text-xs text-gray-400 mt-1">Add a note below</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-yellow-200 flex items-center justify-center text-yellow-800 text-xs font-bold">
                      {note.agent?.name?.[0]?.toUpperCase() || 'S'}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900">{note.agent?.name || 'Staff'}</p>
                      <p className="text-[10px] text-gray-500">{new Date(note.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  {note.is_private && (
                    <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" /> Private
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Note Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="space-y-2">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add an internal note..."
            rows={3}
            className="w-full px-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
              />
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3" /> Private (staff only)
              </span>
            </label>
            <button
              onClick={handleAddNote}
              disabled={!newNote.trim() || saving}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add Note
            </button>
          </div>
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
