// ============================================================================
// APPOINTMENT PANEL — 4-Tab Slide-Out Drawer for Appointment Management
// Tabs: Details | Conversation | History | Notes
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBookings } from '../../hooks/useBookings';
import api from '../../services/api';
import bookingService from '../../services/bookingService';
import {
  X, FileText, MessageSquare, History, StickyNote,
  Calendar, Clock, Wrench, User, Phone, Mail, MapPin,
  DollarSign, CheckCircle, Loader2, Send, ChevronDown,
  ChevronUp, Lock, Unlock, Eye, EyeOff, Plus, Copy, Check,
  AlertCircle, ExternalLink
} from 'lucide-react';

const TABS = [
  { key: 'details', label: 'Details', icon: FileText },
  { key: 'conversation', label: 'Conversation', icon: MessageSquare },
  { key: 'history', label: 'History', icon: History },
  { key: 'notes', label: 'Notes', icon: StickyNote },
];

const AppointmentPanel = ({ booking, isOpen, onClose, onNavigateToMessages }) => {
  const { user } = useAuth();
  const { fetchNotes, addNote, fetchHistory, fetchUserAppointments } = useBookings();

  const [activeTab, setActiveTab] = useState('details');
  const [notes, setNotes] = useState([]);
  const [history, setHistory] = useState([]);
  const [userAppointments, setUserAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedHistoryItem, setExpandedHistoryItem] = useState(null);

  const isStaff = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'support_agent' || user?.role === 'service_agent';

  // Load tab data when tab changes
  useEffect(() => {
    if (!booking?.case_id || !isOpen) return;

    const loadTabData = async () => {
      setLoading(true);
      try {
        switch (activeTab) {
          case 'notes':
            const notesRes = await fetchNotes(booking.case_id);
            if (notesRes.success) setNotes(notesRes.data);
            break;
          case 'history':
            const [historyRes, appointmentsRes] = await Promise.all([
              fetchHistory(booking.case_id),
              fetchUserAppointments(booking.support_case?.user_id || user?.id),
            ]);
            if (historyRes.success) setHistory(historyRes.data?.data || historyRes.data || []);
            if (appointmentsRes.success) setUserAppointments(appointmentsRes.data);
            break;
          case 'conversation':
            // Conversation data is loaded on-demand in the ConversationTab
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
  }, [activeTab, booking?.case_id, isOpen]);

  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-2xl bg-white shadow-2xl flex flex-col h-full animate-slide-in-right">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{booking.case_id}</h2>
              <p className="text-sm text-gray-500 truncate max-w-[250px]">
                {booking.service_type?.replace(/_/g, ' ')}
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
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
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
          {activeTab === 'details' && <DetailsTab booking={booking} isStaff={isStaff} />}
          {activeTab === 'conversation' && (
            <ConversationTab
              booking={booking}
              user={user}
              onNavigateToMessages={onNavigateToMessages}
            />
          )}
          {activeTab === 'history' && (
            <HistoryTab
              booking={booking}
              history={history}
              userAppointments={userAppointments}
              loading={loading}
              expandedItem={expandedHistoryItem}
              setExpandedItem={setExpandedHistoryItem}
              isStaff={isStaff}
            />
          )}
          {activeTab === 'notes' && (
            <NotesTab
              booking={booking}
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
const DetailsTab = ({ booking, isStaff }) => {
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

  return (
    <div className="p-6 space-y-6">
      {/* Status & Type */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Status</h3>
        <div className="space-y-2">
          <InfoRow
            label="Booking Status"
            value={
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                booking.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {booking.status?.replace(/_/g, ' ').toUpperCase()}
              </span>
            }
          />
          <InfoRow
            label="Service Type"
            value={<span className="capitalize">{booking.service_type?.replace(/_/g, ' ')}</span>}
            icon={Wrench}
          />
          {booking.support_case?.case_id && (
            <InfoRow
              label="Case ID"
              value={<span className="font-mono">{booking.support_case.case_id}</span>}
              copyable={booking.support_case.case_id}
              field="case_id"
            />
          )}
        </div>
      </div>

      {/* Scheduling */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Scheduling</h3>
        <div className="space-y-2">
          {booking.requested_date && (
            <InfoRow
              label="Requested Date"
              value={new Date(booking.requested_date).toLocaleDateString()}
              icon={Calendar}
            />
          )}
          {booking.preferred_time && (
            <InfoRow
              label="Preferred Time"
              value={booking.preferred_time}
              icon={Clock}
            />
          )}
          {booking.confirmed_date && (
            <InfoRow
              label="Confirmed Date"
              value={new Date(booking.confirmed_date).toLocaleDateString()}
              icon={CheckCircle}
            />
          )}
          {booking.confirmed_time && (
            <InfoRow
              label="Confirmed Time"
              value={booking.confirmed_time}
              icon={Clock}
            />
          )}
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-blue-50 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-3 flex items-center gap-2">
          <User className="w-4 h-4" /> Customer
        </h3>
        <div className="space-y-2">
          <InfoRow label="Name" value={booking.customer_name || 'Guest'} icon={User} />
          {booking.customer_phone && (
            <InfoRow label="Phone" value={booking.customer_phone} icon={Phone} copyable={booking.customer_phone} field="phone" />
          )}
          {booking.customer_email && (
            <InfoRow label="Email" value={booking.customer_email} icon={Mail} copyable={booking.customer_email} field="email" />
          )}
        </div>
      </div>

      {/* Location & Pricing */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Location & Pricing</h3>
        <div className="space-y-2">
          {booking.shop_location && (
            <InfoRow label="Shop Location" value={booking.shop_location} icon={MapPin} />
          )}
          {booking.seller?.shop_name && (
            <InfoRow label="Seller" value={booking.seller.shop_name} icon={User} />
          )}
          {booking.estimated_price && (
            <InfoRow label="Estimated" value={`KSh ${booking.estimated_price}`} icon={DollarSign} />
          )}
          {booking.final_price && (
            <InfoRow label="Final Price" value={`KSh ${booking.final_price}`} icon={DollarSign} />
          )}
        </div>
      </div>

      {/* Service Description */}
      {booking.service_description && (
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Description</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{booking.service_description}</p>
        </div>
      )}

      {/* Staff-only: Internal Notes */}
      {isStaff && booking.staff_notes && (
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <h3 className="text-xs font-semibold text-yellow-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Lock className="w-3 h-3" /> Staff Notes
          </h3>
          <p className="text-sm text-yellow-900">{booking.staff_notes}</p>
        </div>
      )}

      {/* Cancellation Status */}
      {booking.cancellation_request_status !== 'none' && (
        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <h3 className="text-xs font-semibold text-red-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <AlertCircle className="w-3 h-3" /> Cancellation
          </h3>
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">Status:</span>{' '}
              <span className={`${
                booking.cancellation_request_status === 'pending_review' ? 'text-yellow-700' :
                booking.cancellation_request_status === 'approved' ? 'text-green-700' :
                'text-red-700'
              }`}>
                {booking.cancellation_request_status === 'pending_review' ? 'Pending Review' :
                 booking.cancellation_request_status === 'approved' ? 'Approved' : 'Denied'}
              </span>
            </p>
            {booking.cancellation_reason && (
              <p><span className="font-medium">Reason:</span> {booking.cancellation_reason}</p>
            )}
            {booking.cancellation_denial_reason && (
              <p><span className="font-medium">Staff Response:</span> {booking.cancellation_denial_reason}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// CONVERSATION TAB
// ============================================================================
const ConversationTab = ({ booking, user, onNavigateToMessages }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFullConversation, setShowFullConversation] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const conversationId = booking.support_case?.conversation_id;
  const caseId = booking.case_id;

  useEffect(() => {
    if (conversationId && caseId) {
      loadMessages();
    }
  }, [conversationId, caseId]);

  const loadMessages = async (includeFull = false) => {
    if (!conversationId || !caseId) return;
    setLoading(true);
    try {
      const url = `/conversations/${conversationId}/cases/${caseId}/messages`;
      const params = includeFull ? { include_full_conversation: true } : {};
      const res = await api.get(url, { params });
      const data = res.data?.data;
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load messages:', err);
      // Fallback to general conversation messages
      try {
        const res = await api.get(`/conversations/${conversationId}/messages`);
        const data = res.data?.data;
        setMessages(Array.isArray(data) ? data : []);
      } catch (err2) {
        setMessages([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || sending || !conversationId || !caseId) return;
    setSending(true);
    try {
      await api.post(`/conversations/${conversationId}/cases/${caseId}/messages`, {
        body: input.trim(),
        type: 'text',
      });
      setInput('');
      await loadMessages(showFullConversation);
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

  const formatTime = (iso) => {
    if (!iso) return '';
    const date = new Date(iso);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
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
            const isSystem = msg.type === 'system';

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
                  isOwn ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-900'
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
                    <span className={`text-[10px] ${isOwn ? 'text-emerald-200' : 'text-gray-400'}`}>
                      {formatTime(msg.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Full conversation toggle */}
        {!showFullConversation && messages.length > 0 && (
          <div className="flex justify-center py-2">
            <button
              onClick={() => { setShowFullConversation(true); loadMessages(true); }}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              See Full Conversation
            </button>
          </div>
        )}
        {showFullConversation && (
          <div className="flex justify-center py-2">
            <button
              onClick={() => { setShowFullConversation(false); loadMessages(false); }}
              className="text-xs text-gray-500 hover:text-gray-700 font-medium"
            >
              Show Case Only
            </button>
          </div>
        )}
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
            className="flex-1 resize-none max-h-32 px-4 py-2.5 bg-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            style={{ minHeight: '44px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className={`p-3 rounded-full transition-all ${
              input.trim() && !sending
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Navigate to full chat */}
      <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
        <button
          onClick={() => onNavigateToMessages?.(booking)}
          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
        >
          <ExternalLink className="w-3 h-3" />
          Open in Messages
        </button>
        <span className="text-[10px] text-gray-400">
          #{booking.case_id}
        </span>
      </div>
    </div>
  );
};

// ============================================================================
// HISTORY TAB
// ============================================================================
const HistoryTab = ({ booking, history, userAppointments, loading, expandedItem, setExpandedItem, isStaff }) => {
  const formatDate = (iso) => {
    if (!iso) return 'N/A';
    return new Date(iso).toLocaleString();
  };

  const getChangeLabel = (item) => {
    const changes = [];
    if (item.from_status !== item.to_status) {
      changes.push(`Status: ${item.from_status || '—'} → ${item.to_status || '—'}`);
    }
    if (item.from_date || item.to_date) {
      changes.push(`Date: ${formatDate(item.from_date)} → ${formatDate(item.to_date)}`);
    }
    if (item.from_time || item.to_time) {
      changes.push(`Time: ${item.from_time || '—'} → ${item.to_time || '—'}`);
    }
    if (item.from_seller_id || item.to_seller_id) {
      changes.push(`Seller changed`);
    }
    if (item.from_mechanic_id || item.to_mechanic_id) {
      changes.push(`Mechanic changed`);
    }
    return changes.length > 0 ? changes.join(' • ') : 'General update';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Current Booking Audit Trail */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <History className="w-4 h-4" /> This Appointment History
        </h3>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
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
                      {item.metadata && Object.keys(item.metadata).length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-gray-500">Metadata:</span>
                          <pre className="mt-1 p-2 bg-gray-100 rounded-lg text-xs text-gray-600 overflow-x-auto">
                            {JSON.stringify(item.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                      {item.from_seller_id && (
                        <p className="text-gray-600">From Seller: {item.from_seller?.shop_name || 'N/A'}</p>
                      )}
                      {item.to_seller_id && (
                        <p className="text-gray-600">To Seller: {item.to_seller?.shop_name || 'N/A'}</p>
                      )}
                      {item.from_mechanic_id && (
                        <p className="text-gray-600">From Mechanic: {item.from_mechanic?.name || 'N/A'}</p>
                      )}
                      {item.to_mechanic_id && (
                        <p className="text-gray-600">To Mechanic: {item.to_mechanic?.name || 'N/A'}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Appointment History */}
      {isStaff && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> All User Appointments
          </h3>
          {userAppointments.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No other appointments for this user</p>
            </div>
          ) : (
            <div className="space-y-2">
              {userAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className={`bg-white border rounded-xl overflow-hidden ${
                    apt.case_id === booking.case_id ? 'border-emerald-300 ring-1 ring-emerald-100' : 'border-gray-200'
                  }`}
                >
                  <button
                    onClick={() => setExpandedItem(expandedItem === `apt-${apt.id}` ? null : `apt-${apt.id}`)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        apt.case_id === booking.case_id ? 'bg-emerald-100' : 'bg-gray-100'
                      }`}>
                        <Wrench className={`w-4 h-4 ${
                          apt.case_id === booking.case_id ? 'text-emerald-600' : 'text-gray-500'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">
                            {apt.service_type?.replace(/_/g, ' ')}
                          </p>
                          {apt.case_id === booking.case_id && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium">
                              CURRENT
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {apt.case_id} • {new Date(apt.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                        apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                        apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {apt.status?.toUpperCase()}
                      </span>
                      {expandedItem === `apt-${apt.id}` ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {expandedItem === `apt-${apt.id}` && (
                    <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50/50">
                      <div className="pt-3 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-xs text-gray-500">Date:</span>
                          <p className="text-gray-700">
                            {apt.confirmed_date
                              ? new Date(apt.confirmed_date).toLocaleDateString()
                              : apt.requested_date
                                ? new Date(apt.requested_date).toLocaleDateString()
                                : 'N/A'
                            }
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Time:</span>
                          <p className="text-gray-700">{apt.confirmed_time || apt.preferred_time || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Shop:</span>
                          <p className="text-gray-700">{apt.shop_location || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Price:</span>
                          <p className="text-gray-700">
                            {apt.final_price ? `KSh ${apt.final_price}` : apt.estimated_price ? `KSh ${apt.estimated_price} (est.)` : 'N/A'}
                          </p>
                        </div>
                        {apt.service_description && (
                          <div className="col-span-2">
                            <span className="text-xs text-gray-500">Description:</span>
                            <p className="text-gray-700 mt-0.5">{apt.service_description}</p>
                          </div>
                        )}
                        {apt.staff_notes && (
                          <div className="col-span-2">
                            <span className="text-xs text-gray-500">Staff Notes:</span>
                            <p className="text-gray-700 mt-0.5">{apt.staff_notes}</p>
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
      )}
    </div>
  );
};

// ============================================================================
// NOTES TAB
// ============================================================================
const NotesTab = ({ booking, notes, setNotes, loading, isStaff, user, onAddNote }) => {
  const [newNote, setNewNote] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [sending, setSending] = useState(false);

  // Visibility options for staff
  const visibilityOptions = isStaff ? [
    { value: 'public', label: 'Public', desc: 'User + All Staff', icon: Unlock, color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { value: 'staff_public', label: 'Staff Only', desc: 'All Staff Only', icon: Eye, color: 'bg-purple-100 text-purple-700 border-purple-200' },
    { value: 'private', label: 'Private', desc: 'Only Me', icon: Lock, color: 'bg-gray-100 text-gray-700 border-gray-200' },
  ] : [
    { value: 'public', label: 'Public', desc: 'Staff can see', icon: Unlock, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  ];

  const handleSubmit = async () => {
    if (!newNote.trim() || sending) return;
    setSending(true);
    const res = await onAddNote(booking.case_id, newNote.trim(), visibility);
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
            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
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
            const isOwnNote = note.user_id === user?.id;
            const isStaffNote = note.is_staff_note;

            return (
              <div
                key={note.id}
                className={`rounded-xl p-4 border ${
                  isOwnNote ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isStaffNote ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {note.creator_initials || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{note.creator_name || 'Unknown'}</p>
                      <p className="text-[10px] text-gray-500">{note.creator_role || 'User'}</p>
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
        {/* Visibility Selector (staff only) */}
        {isStaff && (
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
        )}

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
            className="flex-1 resize-none max-h-32 px-4 py-2.5 bg-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={handleSubmit}
            disabled={!newNote.trim() || sending}
            className={`p-3 rounded-full transition-all ${
              newNote.trim() && !sending
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'
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

export default AppointmentPanel;
         