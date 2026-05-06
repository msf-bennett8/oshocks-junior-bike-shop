// ============================================================================
// SUPPORT INBOX — Admin/SuperAdmin Support Ticket Management
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useMessaging } from '../../hooks/useMessaging';
import ChatDrawer from '../../components/messaging/ChatDrawer';
import {
  Inbox, Search, Filter, Clock, AlertCircle, CheckCircle, 
  User, ChevronRight, Loader2, ArrowUpCircle, XCircle,
  MessageSquare, Eye, UserCheck, Flag
} from 'lucide-react';

const SupportInboxPage = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, open, in_progress, escalated, resolved
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [assignmentLoading, setAssignmentLoading] = useState(null);

  const { setActiveConversation } = useMessaging(user?.id);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/support-inbox?status=${filter}&search=${encodeURIComponent(searchQuery)}`);
      setTickets(res.data.data.data || []);
      setStats(res.data.stats || null);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  }, [filter, searchQuery]);

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'super_admin') {
      fetchTickets();
    }
  }, [fetchTickets, user]);

  const handleClaimTicket = async (ticketId) => {
    setAssignmentLoading(ticketId);
    try {
      await api.post(`/support-inbox/${ticketId}/assign`);
      fetchTickets();
    } catch (err) {
      console.error('Failed to claim ticket:', err);
      alert('Failed to claim ticket');
    } finally {
      setAssignmentLoading(null);
    }
  };

  const handleOpenTicket = (ticket) => {
    setSelectedTicket(ticket);
    setActiveConversation(ticket);
    setChatOpen(true);
  };

  const getStatusConfig = (status) => {
    const configs = {
      open: { color: 'bg-blue-100 text-blue-800', icon: MessageSquare, label: 'Open' },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      in_progress: { color: 'bg-purple-100 text-purple-800', icon: UserCheck, label: 'In Progress' },
      escalated: { color: 'bg-red-100 text-red-800', icon: ArrowUpCircle, label: 'Escalated' },
      resolved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Resolved' },
      closed: { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Closed' },
    };
    return configs[status] || configs.open;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-gray-500',
      medium: 'text-blue-500',
      high: 'text-orange-500',
      urgent: 'text-red-500 animate-pulse',
    };
    return colors[priority] || colors.medium;
  };

  if (user?.role !== 'admin' && user?.role !== 'super_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view the support inbox.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Inbox className="w-8 h-8 text-orange-600" />
                Support Inbox
              </h1>
              <p className="text-gray-600 mt-1">Manage customer support tickets</p>
            </div>

            {/* Stats */}
            {stats && (
              <div className="flex gap-4">
                <div className="bg-blue-50 px-4 py-2 rounded-lg">
                  <p className="text-xs text-blue-600 font-medium">Open</p>
                  <p className="text-xl font-bold text-blue-900">{stats.total_open}</p>
                </div>
                <div className="bg-purple-50 px-4 py-2 rounded-lg">
                  <p className="text-xs text-purple-600 font-medium">In Progress</p>
                  <p className="text-xl font-bold text-purple-900">{stats.total_in_progress}</p>
                </div>
                <div className="bg-red-50 px-4 py-2 rounded-lg">
                  <p className="text-xs text-red-600 font-medium">Escalated</p>
                  <p className="text-xl font-bold text-red-900">{stats.total_escalated}</p>
                </div>
                <div className="bg-yellow-50 px-4 py-2 rounded-lg">
                  <p className="text-xs text-yellow-600 font-medium">Unassigned</p>
                  <p className="text-xl font-bold text-yellow-900">{stats.unassigned}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tickets..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'open', 'in_progress', 'escalated', 'resolved'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No tickets found</h3>
            <p className="text-gray-600">All caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => {
              const statusConfig = getStatusConfig(ticket.status);
              const StatusIcon = statusConfig.icon;
              const isAssigned = ticket.assigned_to !== null;
              const isMine = ticket.assigned_to === user?.id;

              return (
                <div 
                  key={ticket.id} 
                  className={`bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow ${
                    isMine ? 'border-l-4 border-orange-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                        <span className={`text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority?.toUpperCase()}
                        </span>
                        {ticket.flagged_for_review && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <Flag className="w-3 h-3" />
                            Flagged
                          </span>
                        )}
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-1">
                        {ticket.title || 'Untitled Ticket'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {ticket.last_message_preview || 'No messages yet'}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {ticket.participant_names || 'Unknown'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </span>
                        {ticket.order_id && (
                          <span className="flex items-center gap-1 text-orange-600">
                            <ShoppingBag className="w-3 h-3" />
                            Order #{ticket.order_id}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {!isAssigned && (
                        <button
                          onClick={() => handleClaimTicket(ticket.id)}
                          disabled={assignmentLoading === ticket.id}
                          className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                        >
                          {assignmentLoading === ticket.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Claim'
                          )}
                        </button>
                      )}
                      {isAssigned && !isMine && (
                        <span className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg">
                          Assigned
                        </span>
                      )}
                      <button
                        onClick={() => handleOpenTicket(ticket)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Chat Drawer for selected ticket */}
      <ChatDrawer
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        entryPoint="support_inbox"
      />
    </div>
  );
};

export default SupportInboxPage;
