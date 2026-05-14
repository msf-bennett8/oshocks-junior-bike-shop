// ============================================================================
// CASE PANEL — 4-Tab Slide-Out Drawer for Support Case Management
// Tabs: Details | Conversation | History | Notes
// Modeled after AppointmentPanel.jsx
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSupportCases } from '../../hooks/useSupportCases';
import { useMessaging } from '../../hooks/useMessaging';
import {
  X, FileText, MessageSquare, History, StickyNote,
  Inbox, Clock, AlertTriangle, Shield, User, Phone, Mail,
  MapPin, Tag, CheckCircle, Loader2, Send, ChevronDown,
  ChevronUp, Lock, Unlock, Eye, EyeOff, Plus, Copy, Check,
  ExternalLink, Star, Calendar, ArrowLeft,
  CreditCard, Package, RotateCcw, Cpu, HelpCircle, Truck, Wrench
} from 'lucide-react';
import { CaseStatusChip } from './CaseStatusChip';

const TABS = [
  { key: 'details', label: 'Details', icon: FileText },
  { key: 'conversation', label: 'Conversation', icon: MessageSquare },
  { key: 'history', label: 'History', icon: History },
  { key: 'notes', label: 'Notes', icon: StickyNote },
];

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

const CasePanel = ({ supportCase, isOpen, onClose, onNavigateToMessages }) => {
  const { user } = useAuth();
  const { addNote, getHistory } = useSupportCases();
  const {
    messages,
    loading: msgLoading,
    sending,
    fetchCaseMessages,
    sendMessage,
    setMessages,
  } = useMessaging(user?.id);

  const [activeTab, setActiveTab] = useState('details');
  const [notes, setNotes] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedHistoryItem, setExpandedHistoryItem] = useState(null);

  const isStaff = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'support_agent';

  // Load tab data when tab changes
  useEffect(() => {
    if (!supportCase?.case_id || !isOpen) return;

    const loadTabData = async () => {
      setLoading(true);
      try {
        switch (activeTab) {
          case 'notes':
            // Notes come from the case object or fetch fresh
            if (supportCase.notes) {
              setNotes(supportCase.notes);
            }
            break;
          case 'history':
            const historyRes = await getHistory(supportCase.case_id);
            if (historyRes.success) {
              setHistory(historyRes.data?.data || historyRes.data || []);
            }
            break;
          case 'conversation':
            // Conversation data loaded on-demand in ConversationTab
            break;
          default:
            break;
        }
      } catch (err) {
        console.error('Failed to load tab data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (['notes', 'history'].includes(activeTab)) {
      loadTabData();
    }
  }, [activeTab, supportCase?.case_id, isOpen, supportCase?.notes, getHistory]);

  if (!isOpen || !supportCase) return null;

  const getTypeConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.inquiry;
  const getPriorityConfig = (priority) => PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-2xl bg-white shadow-2xl flex flex-col h-full animate-slide-in-right">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <Inbox className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{supportCase.case_id}</h2>
              <p className="text-sm text-gray-500 truncate max-w-[250px]">
                {supportCase.subject}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-white">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === tab.key
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
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
            <DetailsTab
              supportCase={supportCase}
              isStaff={isStaff}
              getTypeConfig={getTypeConfig}
              getPriorityConfig={getPriorityConfig}
            />
          )}
          {activeTab === 'conversation' && (
            <ConversationTab
              supportCase={supportCase}
              user={user}
              messages={messages}
              msgLoading={msgLoading}
              sending={sending}
              fetchCaseMessages={fetchCaseMessages}
              sendMessage={sendMessage}
              setMessages={setMessages}
              onNavigateToMessages={onNavigateToMessages}
            />
          )}
          {activeTab === 'history' && (
            <HistoryTab
              history={history}
              loading={loading}
              expandedItem={expandedHistoryItem}
              setExpandedItem={setExpandedHistoryItem}
            />
          )}
          {activeTab === 'notes' && (
            <NotesTab
              supportCase={supportCase}
              notes={notes}
              setNotes={setNotes}
              loading={loading}
              isStaff={isStaff}
              user={user}
              onAddNote={addNote}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// DETAILS TAB
// ============================================================================
const DetailsTab = ({ supportCase, isStaff, getTypeConfig, getPriorityConfig }) => {
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
      title="Copy"
    >
      {copiedField === field ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-gray-400" />}
    </button>
  );

  const InfoRow = ({ label, value, icon: Icon, copyable, field }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
      </div>
      <div className="flex items-center text-sm font-medium text-gray-900">
        {value}
        {copyable && <CopyButton text={copyable} field={field} />}
      </div>
    </div>
  );

  const typeConfig = getTypeConfig(supportCase.case_type);
  const priorityConfig = getPriorityConfig(supportCase.priority);
  const TypeIcon = typeConfig.icon;

  return (
    <div className="p-6 space-y-6">
      {/* Status & Type */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Status</h3>
        <div className="space-y-2">
          <InfoRow
            label="Case Status"
            value={<CaseStatusChip status={supportCase.status} />}
          />
          <InfoRow
            label="Priority"
            value={
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${priorityConfig.color}`}>
                {priorityConfig.label}
              </span>
            }
          />
          <InfoRow
            label="Case Type"
            value={
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${typeConfig.color}`}>
                <TypeIcon className="w-3 h-3" />
                {typeConfig.label}
              </span>
            }
          />
          {supportCase.conversation_id && (
            <InfoRow
              label="Conversation ID"
              value={<span className="font-mono text-xs">{supportCase.conversation_id}</span>}
              copyable={String(supportCase.conversation_id)}
              field="conversation_id"
            />
          )}
        </div>
      </div>

      {/* Subject & Description */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Subject</h3>
        <p className="text-sm font-medium text-gray-900 mb-3">{supportCase.subject}</p>
        {supportCase.description && (
          <>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{supportCase.description}</p>
          </>
        )}
      </div>

      {/* Customer Info */}
      <div className="bg-blue-50 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-3 flex items-center gap-2">
          <User className="w-4 h-4" /> Customer
        </h3>
        <div className="space-y-2">
          {/* Authenticated user */}
          {supportCase.user_id && supportCase.user ? (
            <>
              <InfoRow label="Name" value={supportCase.user.name || 'Unknown'} icon={User} />
              {supportCase.user.email && (
                <InfoRow label="Email" value={supportCase.user.email} icon={Mail} copyable={supportCase.user.email} field="email" />
              )}
              {supportCase.user.phone && (
                <InfoRow label="Phone" value={supportCase.user.phone} icon={Phone} copyable={supportCase.user.phone} field="phone" />
              )}
            </>
          ) : (
            <>
              {/* Guest user - show captured contact info */}
              <InfoRow 
                label="Name" 
                value={supportCase.guest_name || 'Guest'} 
                icon={User} 
                copyable={supportCase.guest_name || 'Guest'} 
                field="guest_name" 
              />
              {supportCase.guest_email && (
                <InfoRow 
                  label="Email" 
                  value={supportCase.guest_email} 
                  icon={Mail} 
                  copyable={supportCase.guest_email} 
                  field="guest_email" 
                />
              )}
              {supportCase.guest_phone && (
                <InfoRow 
                  label="Phone" 
                  value={supportCase.guest_phone} 
                  icon={Phone} 
                  copyable={supportCase.guest_phone} 
                  field="guest_phone" 
                />
              )}
              <InfoRow 
                label="Guest Session" 
                value={<span className="font-mono text-xs">{supportCase.guest_session_id?.slice(0, 16) || 'N/A'}...</span>} 
                icon={MapPin} 
              />
            </>
          )}
        </div>
      </div>

      {/* Assigned Agent */}
      {supportCase.assigned_agent && (
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
          <h3 className="text-xs font-semibold text-purple-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" /> Assigned Agent
          </h3>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center text-purple-800 text-sm font-bold">
              {supportCase.assigned_agent.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{supportCase.assigned_agent.name}</p>
              <p className="text-xs text-gray-500">{supportCase.assigned_agent.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Order Info */}
      {supportCase.order && (
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <h3 className="text-xs font-semibold text-orange-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4" /> Linked Order
          </h3>
          <div className="space-y-2">
            <InfoRow label="Order Number" value={supportCase.order.order_display || supportCase.order.order_number} icon={Tag} />
            <InfoRow label="Order Status" value={supportCase.order.status} />
            <InfoRow label="Total" value={`KSh ${supportCase.order.total}`} />
          </div>
        </div>
      )}

      {/* SLA */}
      {supportCase.sla_deadline && (
        <div className={`rounded-xl p-4 border ${
          new Date(supportCase.sla_deadline) < new Date() ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
        }`}>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" /> SLA Deadline
          </h3>
          <p className={`text-sm font-medium ${
            new Date(supportCase.sla_deadline) < new Date() ? 'text-red-700' : 'text-gray-900'
          }`}>
            {new Date(supportCase.sla_deadline).toLocaleString()}
          </p>
        </div>
      )}

      {/* Resolution */}
      {supportCase.resolution_notes && (
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <h3 className="text-xs font-semibold text-green-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Resolution
          </h3>
          <p className="text-sm text-green-800">{supportCase.resolution_notes}</p>
          {supportCase.resolved_at && (
            <p className="text-xs text-green-600 mt-2">
              Resolved on {new Date(supportCase.resolved_at).toLocaleDateString()}
              {supportCase.resolved_by?.name && ` by ${supportCase.resolved_by.name}`}
            </p>
          )}
        </div>
      )}

      {/* Escalation */}
      {supportCase.escalation_reason && (
        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <h3 className="text-xs font-semibold text-red-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Escalation
          </h3>
          <p className="text-sm text-red-800">{supportCase.escalation_reason}</p>
          {supportCase.escalated_at && (
            <p className="text-xs text-red-600 mt-2">
              Escalated on {new Date(supportCase.escalated_at).toLocaleDateString()}
              {supportCase.escalated_by?.name && ` by ${supportCase.escalated_by.name}`}
            </p>
          )}
        </div>
      )}

      {/* Satisfaction Rating */}
      {supportCase.satisfaction_rating && (
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <h3 className="text-xs font-semibold text-yellow-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Star className="w-4 h-4" /> Your Rating
          </h3>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= supportCase.satisfaction_rating
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          {supportCase.satisfaction_comment && (
            <p className="text-sm text-gray-600 mt-2">"{supportCase.satisfaction_comment}"</p>
          )}
        </div>
      )}

      {/* Staff-only: Metadata */}
      {isStaff && supportCase.metadata && Object.keys(supportCase.metadata).length > 0 && (
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <h3 className="text-xs font-semibold text-yellow-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Lock className="w-3 h-3" /> Internal Metadata
          </h3>
          <pre className="text-xs text-yellow-900 overflow-x-auto">
            {JSON.stringify(supportCase.metadata, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// CONVERSATION TAB
// ============================================================================
const ConversationTab = ({ supportCase, user, messages, msgLoading, sending, fetchCaseMessages, sendMessage, setMessages, onNavigateToMessages }) => {
  const [showFullConversation, setShowFullConversation] = useState(false);
  const [input, setInput] = useState('');

  const conversationId = supportCase.conversation_id;
  const caseId = supportCase.case_id;

  useEffect(() => {
    if (conversationId && caseId) {
      fetchCaseMessages(conversationId, caseId, showFullConversation);
    }
    return () => setMessages([]);
  }, [conversationId, caseId, showFullConversation, fetchCaseMessages, setMessages]);

  const handleSend = async () => {
    if (!input.trim() || sending || !conversationId || !caseId) return;
    try {
      await sendMessage(conversationId, input.trim(), 'text', { case_id: caseId });
      setInput('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (iso) => {
    if (!iso) return '';
    const date = new Date(iso);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {msgLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1">Start the conversation below</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === user?.id;
            const isSystem = msg.type === 'system' || msg.type === 'case_created' || msg.type === 'case_resolved' || msg.type === 'case_closed';

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <div className="bg-gray-100 border border-gray-200 rounded-full px-4 py-1.5 flex items-center gap-2">
                    <span className="text-xs text-gray-600">{msg.body}</span>
                    <span className="text-[10px] text-gray-400">{formatTime(msg.created_at)}</span>
                  </div>
                </div>
              );
            }

            const isContextMessage = showFullConversation && msg.case_id && msg.case_id !== caseId;

            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${isContextMessage ? 'opacity-60' : ''}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                  isOwn ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-900'
                } ${isContextMessage ? 'border border-dashed border-gray-300' : ''}`}>
                  {isContextMessage && (
                    <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded block mb-1">
                      #{msg.case_id?.slice(-6) || 'General'}
                    </span>
                  )}
                  {!isOwn && (
                    <p className="text-[10px] font-medium text-gray-500 mb-0.5">
                      {msg.sender?.name || msg.sender_name || 'Guest'}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                  <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                    <span className={`text-[10px] ${isOwn ? 'text-orange-200' : 'text-gray-400'}`}>
                      {formatTime(msg.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {!showFullConversation && messages.length > 0 && (
          <div className="flex justify-center py-2">
            <button
              onClick={() => setShowFullConversation(true)}
              className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              See Full Conversation
            </button>
          </div>
        )}
        {showFullConversation && (
          <div className="flex justify-center py-2">
            <button
              onClick={() => setShowFullConversation(false)}
              className="text-xs text-gray-500 hover:text-gray-700 font-medium"
            >
              Show Case Only
            </button>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none max-h-32 px-4 py-2.5 bg-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            style={{ minHeight: '44px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className={`p-3 rounded-full transition-all ${
              input.trim() && !sending
                ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-md'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
        <button
          onClick={() => onNavigateToMessages?.(supportCase)}
          className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
        >
          <ExternalLink className="w-3 h-3" />
          Open in Messages
        </button>
        <span className="text-[10px] text-gray-400">
          #{supportCase.case_id}
        </span>
      </div>
    </div>
  );
};

// ============================================================================
// HISTORY TAB
// ============================================================================
const HistoryTab = ({ history, loading, expandedItem, setExpandedItem }) => {
  const formatDate = (iso) => {
    if (!iso) return 'N/A';
    return new Date(iso).toLocaleString();
  };

  const getChangeLabel = (item) => {
    const changes = [];
    if (item.from_status !== item.to_status) {
      changes.push(`Status: ${item.from_status || '—'} → ${item.to_status || '—'}`);
    }
    if (item.from_priority !== item.to_priority) {
      changes.push(`Priority: ${item.from_priority || '—'} → ${item.to_priority || '—'}`);
    }
    if (item.from_assigned_to !== item.to_assigned_to) {
      changes.push(`Agent reassigned`);
    }
    if (item.action) {
      changes.push(item.action);
    }
    return changes.length > 0 ? changes.join(' • ') : 'General update';
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <History className="w-4 h-4" /> Case History
        </h3>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <History className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No history recorded yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{getChangeLabel(item)}</p>
                      <p className="text-xs text-gray-500">
                        by {item.changed_by?.name || 'System'} • {formatDate(item.created_at)}
                      </p>
                    </div>
                  </div>
                  {expandedItem === item.id ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {expandedItem === item.id && (
                  <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50/50">
                    <div className="pt-3 space-y-2 text-sm">
                      {item.reason && (
                        <div>
                          <span className="text-xs font-medium text-gray-500">Reason:</span>
                          <p className="text-gray-700 mt-0.5">{item.reason}</p>
                        </div>
                      )}
                      {item.notes && (
                        <div>
                          <span className="text-xs font-medium text-gray-500">Notes:</span>
                          <p className="text-gray-700 mt-0.5">{item.notes}</p>
                        </div>
                      )}
                      {item.metadata && Object.keys(item.metadata).length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-gray-500">Metadata:</span>
                          <pre className="mt-1 p-2 bg-gray-100 rounded-lg text-xs text-gray-600 overflow-x-auto">
                            {JSON.stringify(item.metadata, null, 2)}
                          </pre>
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
    </div>
  );
};

// ============================================================================
// NOTES TAB
// ============================================================================
const NotesTab = ({ supportCase, notes, setNotes, loading, isStaff, user, onAddNote }) => {
  const [newNote, setNewNote] = useState('');
  const [visibility, setVisibility] = useState(isStaff ? 'private' : 'public');
  const [sending, setSending] = useState(false);

  // Visibility options
  const visibilityOptions = isStaff ? [
    { value: 'public', label: 'Public', desc: 'User + All Staff', icon: Unlock, color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { value: 'staff_public', label: 'Staff Only', desc: 'All Staff Only', icon: Eye, color: 'bg-purple-100 text-purple-700 border-purple-200' },
    { value: 'private', label: 'Private', desc: 'Only Me', icon: Lock, color: 'bg-gray-100 text-gray-700 border-gray-200' },
  ] : [
    { value: 'public', label: 'Public', desc: 'Staff can see', icon: Unlock, color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { value: 'private', label: 'Private', desc: 'Only me', icon: Lock, color: 'bg-gray-100 text-gray-700 border-gray-200' },
  ];

  const handleSubmit = async () => {
    if (!newNote.trim() || sending) return;
    setSending(true);
    // Users cannot create staff_public notes
    const noteVisibility = !isStaff && visibility === 'staff_public' ? 'public' : visibility;
    const res = await onAddNote(supportCase.case_id, newNote.trim(), noteVisibility);
    setSending(false);
    if (res.success) {
      setNotes(prev => [res.data, ...prev]);
      setNewNote('');
      setVisibility(isStaff ? 'private' : 'public');
    }
  };

  const getVisibilityBadge = (v) => {
    switch (v) {
      case 'public': return { text: 'Public', color: 'bg-blue-100 text-blue-700', icon: Unlock };
      case 'staff_public': return { text: 'Staff', color: 'bg-purple-100 text-purple-700', icon: Eye };
      case 'private': return { text: 'Private', color: 'bg-gray-100 text-gray-700', icon: Lock };
      default: return { text: 'Public', color: 'bg-blue-100 text-blue-700', icon: Unlock };
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <StickyNote className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No notes yet</p>
            <p className="text-xs mt-1">Add a note below</p>
          </div>
        ) : (
          notes.map((note) => {
            const badge = getVisibilityBadge(note.visibility);
            const BadgeIcon = badge.icon;
            const isOwnNote = note.agent_id === user?.id;
            const isStaffNote = note.is_staff_note;

            return (
              <div
                key={note.id}
                className={`rounded-xl p-4 border ${
                  isOwnNote ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isStaffNote ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {note.agent?.name?.[0]?.toUpperCase() || note.creator_initials || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{note.agent?.name || note.creator_name || 'Unknown'}</p>
                      <p className="text-[10px] text-gray-500">{note.agent?.role || note.creator_role || 'User'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${badge.color}`}>
                      <BadgeIcon className="w-3 h-3" />
                      {badge.text}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                <p className="text-[10px] text-gray-400 mt-2">
                  {new Date(note.created_at).toLocaleString()}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Add Note Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        {/* Visibility Selector */}
        <div className="flex gap-2 mb-3">
          {visibilityOptions.map((opt) => {
            const OptIcon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => setVisibility(opt.value)}
                className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium border-2 transition-all ${
                  visibility === opt.value
                    ? `${opt.color} ring-2 ring-offset-1 ring-gray-300`
                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <OptIcon className="w-3.5 h-3.5 mx-auto mb-0.5" />
                <span className="block">{opt.label}</span>
                <span className="block text-[9px] opacity-75 font-normal">{opt.desc}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-end gap-2">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Write a note..."
            rows={2}
            className="flex-1 resize-none max-h-32 px-4 py-2.5 bg-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={handleSubmit}
            disabled={!newNote.trim() || sending}
            className={`p-3 rounded-full transition-all ${
              newNote.trim() && !sending
                ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-md'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CasePanel;
