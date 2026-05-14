import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSupportCases } from '../../hooks/useSupportCases';
import {
  Inbox, Clock, CheckCircle, XCircle, AlertTriangle, RefreshCw,
  Loader2, Search, ChevronDown, ChevronUp, MessageSquare, Copy, Check,
  ArrowLeft, History, StickyNote, Eye, Tag, Calendar, User, FileText,
  ArrowRight, Shield, Star, Send, Plus, MoreVertical, Phone, Mail,
  CreditCard, Package, RotateCcw, Cpu, HelpCircle, Truck, Wrench
} from 'lucide-react';
import { CaseStatusChip } from '../../components/messaging/CaseStatusChip';
import CasePanel from '../../components/messaging/CasePanel';

const TYPE_CONFIG = {
  order_issue: { label: 'Order Issue', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Tag },
  account_login: { label: 'Account & Login', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: User },
  report_problem: { label: 'Report Problem', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle },
  shipment_delivery: { label: 'Shipment & Delivery', color: 'bg-cyan-100 text-cyan-700 border-cyan-200', icon: Send },
  services_booking: { label: 'Services & Booking', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Calendar },
  general_inquiry: { label: 'General Inquiry', color: 'bg-violet-100 text-violet-700 border-violet-200', icon: FileText },
  payment_billing: { label: 'Payment & Billing', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: CreditCard },
  product_info: { label: 'Product Information', color: 'bg-teal-100 text-teal-700 border-teal-200', icon: Package },
  returns_refund: { label: 'Returns & Refund', color: 'bg-pink-100 text-pink-700 border-pink-200', icon: RotateCcw },
  technical_support: { label: 'Technical Support', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: Cpu },
  other: { label: 'Other', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: HelpCircle },
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'bg-green-100 text-green-700' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700' },
};

const MySupportCasesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { fetchMyCases, loading, error, cases, createCase } = useSupportCases();

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loadAll, setLoadAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState(null);
  const [expandedCase, setExpandedCase] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [panelCase, setPanelCase] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Create form state
  const [createForm, setCreateForm] = useState({
    case_type: 'order_issue',
    subject: '',
    description: '',
    priority: 'medium',
    order_id: '',
  });

  useEffect(() => {
    const params = {};
    if (!loadAll) {
      params.per_page = 25;
      params.page = currentPage;
    } else {
      params.per_page = 'all';
    }
    if (filter !== 'all') {
      params.status = filter;
    }
    fetchMyCases(params).then(res => {
      setPaginationMeta(res?.data);
      setTotalPages(res?.data?.last_page || 1);
    }).catch(() => {
      setPaginationMeta(null);
      setTotalPages(1);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, loadAll, currentPage]);

  const filteredCases = cases.filter(c => {
    const matchesFilter = filter === 'all' || c.status === filter;
    const matchesSearch = !search ||
      c.case_id?.toLowerCase().includes(search.toLowerCase()) ||
      c.subject?.toLowerCase().includes(search.toLowerCase()) ||
      c.case_type?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusCounts = {
    all: cases.length,
    new: cases.filter(c => c.status === 'new').length,
    open: cases.filter(c => c.status === 'open').length,
    in_progress: cases.filter(c => c.status === 'in_progress').length,
    pending_user: cases.filter(c => c.status === 'pending_user').length,
    resolved: cases.filter(c => c.status === 'resolved').length,
    closed: cases.filter(c => c.status === 'closed').length,
    escalated: cases.filter(c => c.status === 'escalated').length,
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateCase = async () => {
    if (!createForm.subject.trim() || !createForm.description.trim()) return;
    setActionLoading(true);
    try {
      const res = await createCase(createForm);
      if (res.success) {
        setShowCreateModal(false);
        setCreateForm({ case_type: 'order_issue', subject: '', description: '', priority: 'medium', order_id: '' });
        await fetchMyCases();
      }
    } catch (err) {
      console.error('Create case failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const navigateToMessages = (supportCase) => {
    const conversationId = supportCase.conversation_id;
    if (conversationId) {
      window.dispatchEvent(new CustomEvent('open-chat-drawer', { 
        detail: { conversationId: conversationId } 
      }));
    }
  };

  const openCaseDetail = (supportCase) => {
    setPanelCase(supportCase);
    setIsPanelOpen(true);
  };

  const getTypeConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.inquiry;
  const getPriorityConfig = (priority) => PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;

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
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Inbox className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">My Support Cases</h1>
                <p className="text-sm text-gray-500">Track and manage your support requests</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchMyCases()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm font-medium hover:shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                New Case
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
          {[
            { key: 'all', label: 'All' },
            { key: 'new', label: 'New' },
            { key: 'open', label: 'Open' },
            { key: 'in_progress', label: 'In Progress' },
            { key: 'pending_user', label: 'Pending You' },
            { key: 'resolved', label: 'Resolved' },
            { key: 'closed', label: 'Closed' },
            { key: 'escalated', label: 'Escalated' },
          ].map(stat => (
            <button
              key={stat.key}
              onClick={() => { setFilter(stat.key); setCurrentPage(1); }}
              className={`p-3 rounded-xl text-left transition-all border ${
                filter === stat.key
                  ? 'bg-white border-orange-300 ring-2 ring-orange-100 shadow-sm'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="text-2xl font-bold text-gray-900">{statusCounts[stat.key] || 0}</p>
              <p className="text-xs font-medium text-gray-500">{stat.label}</p>
            </button>
          ))}
        </div>

        {/* Load All / Paginated Toggle */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => { setLoadAll(!loadAll); setCurrentPage(1); }}
            className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
              loadAll 
                ? 'bg-orange-50 border-orange-200 text-orange-700' 
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {loadAll ? 'Paginated' : 'Load All'}
          </button>
        </div>

        {/* Search + Mobile Create */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by case ID, subject, or type..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="sm:hidden flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              New
            </button>
          </div>
        </div>

        {/* Cases List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">No support cases found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-orange-600 font-medium hover:underline text-sm"
            >
              Create a new case →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCases.map(supportCase => {
              const typeConfig = getTypeConfig(supportCase.case_type);
              const TypeIcon = typeConfig.icon;
              const priorityConfig = getPriorityConfig(supportCase.priority);
              const isExpanded = expandedCase === supportCase.case_id;

              return (
                <div
                  key={supportCase.case_id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div
                    className="p-4 sm:p-5 cursor-pointer"
                    onClick={() => setExpandedCase(isExpanded ? null : supportCase.case_id)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <CaseStatusChip status={supportCase.status} size="sm" />
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${priorityConfig.color}`}>
                            {priorityConfig.label}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCopyId(supportCase.case_id); }}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-mono text-gray-600 transition-colors"
                            title="Copy Case ID"
                          >
                            {copiedId === supportCase.case_id ? (
                              <><Check className="w-3 h-3 text-green-600" /> Copied</>
                            ) : (
                              <><Copy className="w-3 h-3" /> {supportCase.case_id}</>
                            )}
                          </button>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(supportCase.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-base sm:text-lg">
                          <TypeIcon className="w-4 h-4 text-orange-600 flex-shrink-0" />
                          <span className="truncate">{supportCase.subject}</span>
                        </h3>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${typeConfig.color}`}>
                            <TypeIcon className="w-3 h-3" />
                            {typeConfig.label}
                          </span>
                          {supportCase.assigned_agent && (
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <User className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>Agent: {supportCase.assigned_agent.name}</span>
                            </div>
                          )}
                          {supportCase.sla_deadline && (
                            <div className={`flex items-center gap-1.5 text-xs ${
                              new Date(supportCase.sla_deadline) < new Date() ? 'text-red-600 font-medium' : 'text-gray-500'
                            }`}>
                              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                              SLA: {new Date(supportCase.sla_deadline).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigateToMessages(supportCase); }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Open Messages"
                        >
                          <MessageSquare className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); openCaseDetail(supportCase); }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
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
                      <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Description</p>
                          <p className="text-gray-700">{supportCase.description || 'No description provided'}</p>
                        </div>
                        {supportCase.order && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Linked Order</p>
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                              <p className="font-mono text-xs text-orange-800">{supportCase.order.order_display || supportCase.order.order_number}</p>
                              <p className="text-xs text-orange-600">Status: {supportCase.order.status}</p>
                            </div>
                          </div>
                        )}
                        {supportCase.resolution_notes && (
                          <div className="sm:col-span-2">
                            <p className="text-xs text-gray-500 mb-1">Resolution Notes</p>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <p className="text-green-800 text-sm">{supportCase.resolution_notes}</p>
                              {supportCase.resolved_at && (
                                <p className="text-xs text-green-600 mt-1">
                                  Resolved: {new Date(supportCase.resolved_at).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        {supportCase.escalation_reason && (
                          <div className="sm:col-span-2">
                            <p className="text-xs text-gray-500 mb-1">Escalation Reason</p>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                              <p className="text-red-800 text-sm">{supportCase.escalation_reason}</p>
                              {supportCase.escalated_at && (
                                <p className="text-xs text-red-600 mt-1">
                                  Escalated: {new Date(supportCase.escalated_at).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        {supportCase.satisfaction_rating && (
                          <div className="sm:col-span-2">
                            <p className="text-xs text-gray-500 mb-1">Your Rating</p>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= supportCase.satisfaction_rating
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                              {supportCase.satisfaction_comment && (
                                <span className="text-xs text-gray-600 ml-2">"{supportCase.satisfaction_comment}"</span>
                              )}
                            </div>
                          </div>
                        )}
                        <div className="sm:col-span-2 flex gap-2 pt-2">
                          <button
                            onClick={() => navigateToMessages(supportCase)}
                            className="flex-1 py-2 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors flex items-center justify-center gap-2"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Open Conversation
                          </button>
                          <button
                            onClick={() => openCaseDetail(supportCase)}
                            className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Full Details
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {!loadAll && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
            {paginationMeta?.total && ` (${paginationMeta.total} total)`}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Create Case Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">New Support Case</h3>
                  <p className="text-sm text-gray-500">Describe your issue and we'll help you</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Case Type *</label>
                <select
                  value={createForm.case_type}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, case_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="order_issue">Order Issue</option>
                  <option value="account_login">Account & Login</option>
                  <option value="report_problem">Report Problem</option>
                  <option value="shipment_delivery">Shipment & Delivery</option>
                  <option value="services_booking">Services & Booking</option>
                  <option value="general_inquiry">General Inquiry</option>
                  <option value="payment_billing">Payment & Billing</option>
                  <option value="product_info">Product Information</option>
                  <option value="returns_refund">Returns & Refund</option>
                  <option value="technical_support">Technical Support</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <div className="flex gap-2">
                  {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setCreateForm(prev => ({ ...prev, priority: key }))}
                      className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium border-2 transition-all ${
                        createForm.priority === key
                          ? `${config.color} ring-2 ring-offset-1 ring-gray-300`
                          : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <input
                  type="text"
                  value={createForm.subject}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Brief summary of your issue..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  placeholder="Please provide details about your issue..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                />
              </div>

              {createForm.case_type === 'order_issue' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order ID (Optional)</label>
                  <input
                    type="text"
                    value={createForm.order_id}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, order_id: e.target.value }))}
                    placeholder="e.g., ORD-12345"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCase}
                  disabled={!createForm.subject.trim() || !createForm.description.trim() || actionLoading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Submit Case
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Case Panel */}
      <CasePanel
        supportCase={panelCase}
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
          setPanelCase(null);
        }}
        onNavigateToMessages={(supportCase) => {
          const convId = supportCase?.conversation_id;
          if (convId) {
            window.dispatchEvent(new CustomEvent('open-chat-drawer', {
              detail: { conversationId: convId }
            }));
          }
        }}
      />
    </div>
  );
};

export default MySupportCasesPage;

