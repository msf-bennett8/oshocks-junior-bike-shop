import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, AlertTriangle, AlertCircle, CheckCircle, X, 
  Bell, Filter, RefreshCw, Archive, CheckCheck, 
  ExternalLink, Clock, User, Lock, CreditCard, 
  ShoppingBag, Database, Settings, FileText, MoreHorizontal,
  ShieldAlert, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import notificationService from '../../services/notificationService';
import auditService from '../../services/auditService';
import toast from 'react-hot-toast';

// Icon mapping for audit notification types
const auditIconMap = {
  security_alert: { icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' },
  mass_purchase: { icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200' },
  bulk_operation: { icon: Database, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' },
  admin_action: { icon: User, color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200' },
  payment_alert: { icon: CreditCard, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' },
  system_alert: { icon: Settings, color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200' },
  audit_alert: { icon: FileText, color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' },
};

const priorityConfig = {
  urgent: { label: 'Urgent', color: 'text-red-700', bg: 'bg-red-100', dot: 'bg-red-500' },
  high: { label: 'High', color: 'text-orange-700', bg: 'bg-orange-100', dot: 'bg-orange-500' },
  medium: { label: 'Medium', color: 'text-yellow-700', bg: 'bg-yellow-100', dot: 'bg-yellow-500' },
  low: { label: 'Low', color: 'text-blue-700', bg: 'bg-blue-100', dot: 'bg-blue-500' },
};

const SuperAdminNotificationCenter = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, urgent, security, system
  const [acknowledging, setAcknowledging] = useState(new Set());

  const fetchAuditNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        type: 'audit_alert,security_alert,mass_purchase,bulk_operation,admin_action,payment_alert,system_alert',
        per_page: 20,
      };
      
      if (filter === 'unread') {
        params.read_status = 'unread';
      } else if (filter === 'urgent') {
        params.priority = 'urgent';
      } else if (filter !== 'all') {
        params.type = filter;
      }

      const response = await notificationService.getNotifications(params);
      const auditNotifications = response.data?.data?.filter(n => 
        n.metadata?.is_audit_alert || 
        ['audit_alert', 'security_alert', 'mass_purchase', 'bulk_operation', 'admin_action', 'payment_alert', 'system_alert'].includes(n.type)
      ) || [];
      
      setNotifications(auditNotifications);
      
      // Count unread audit notifications
      const unread = auditNotifications.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to fetch audit notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (isOpen) {
      fetchAuditNotifications();
    }
  }, [isOpen, fetchAuditNotifications]);

  // Poll for new notifications every 15 seconds (more frequent for audit alerts)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isOpen) {
        // Just update count when closed
        notificationService.getUnreadCount().then(response => {
          setUnreadCount(response.data?.count || 0);
        });
      }
    }, 15000);
    
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleAcknowledge = async (e, notification) => {
    e.stopPropagation();
    
    if (acknowledging.has(notification.id)) return;
    
    setAcknowledging(prev => new Set(prev).add(notification.id));
    
    try {
      await notificationService.markAsRead(notification.id);
      
      // Also call audit acknowledge if it exists
      if (notification.metadata?.requires_acknowledgment) {
        await auditService.acknowledgeAuditNotification(notification.notification_id);
      }
      
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      toast.success('Alert acknowledged');
    } catch (error) {
      toast.error('Failed to acknowledge');
    } finally {
      setAcknowledging(prev => {
        const next = new Set(prev);
        next.delete(notification.id);
        return next;
      });
    }
  };

  const handleMarkAllAcknowledged = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success('All alerts acknowledged');
    } catch (error) {
      toast.error('Failed to acknowledge all');
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.is_read) {
      handleAcknowledge({ stopPropagation: () => {} }, notification);
    }
    
    setIsOpen(false);
    
    // Navigate to action URL or audit logs
    const url = notification.action?.url || notification.metadata?.action_url || '/super-admin/audit-logs';
    navigate(url);
  };

  const getIconConfig = (type) => {
    return auditIconMap[type] || auditIconMap.audit_alert;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.is_read;
    if (filter === 'urgent') return n.priority === 'urgent' || n.metadata?.priority === 'urgent';
    return n.type === filter;
  });

  // Only render for SuperAdmins
  if (!user || !['super_admin', 'owner', 'admin'].includes(user.role)) {
    return null;
  }

  return (
    <div className="relative">
      {/* Shield Icon with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title="Admin Alerts"
      >
        <Shield className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        {unreadCount === 0 && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full ring-2 ring-white" />
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-[480px] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Admin Alert Center</h3>
                    <p className="text-xs text-slate-400">
                      {unreadCount} unacknowledged {unreadCount === 1 ? 'alert' : 'alerts'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchAuditNotifications}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-1 p-3 border-b border-gray-200 bg-gray-50 overflow-x-auto">
              {[
                { key: 'all', label: 'All', icon: Bell },
                { key: 'unread', label: 'Unread', icon: AlertCircle },
                { key: 'urgent', label: 'Urgent', icon: AlertTriangle },
                { key: 'security_alert', label: 'Security', icon: Lock },
                { key: 'system_alert', label: 'System', icon: Settings },
              ].map((f) => {
                const Icon = f.icon;
                const isActive = filter === f.key;
                const count = f.key === 'unread' ? unreadCount : 
                             f.key === 'urgent' ? notifications.filter(n => n.priority === 'urgent').length :
                             null;
                
                return (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                      isActive 
                        ? 'bg-slate-800 text-white' 
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {f.label}
                    {count !== null && count > 0 && (
                      <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                        isActive ? 'bg-white/20' : 'bg-red-100 text-red-600'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Notification List */}
            <div className="max-h-[400px] overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="p-8 space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-full" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => {
                  const { icon: Icon, color, bg, border } = getIconConfig(notification.type);
                  const priority = notification.priority || notification.metadata?.priority || 'medium';
                  const priorityStyle = priorityConfig[priority];
                  const isAcknowledging = acknowledging.has(notification.id);
                  
                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-all ${
                        !notification.is_read ? 'bg-blue-50/50' : ''
                      } ${notification.priority === 'urgent' ? 'border-l-4 border-l-red-500' : ''}`}
                    >
                      <div className="flex gap-3">
                        <div className={`flex-shrink-0 w-10 h-10 ${bg} ${border} border rounded-lg flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <h4 className={`text-sm font-semibold ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </h4>
                              {!notification.is_read && (
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${priorityStyle.bg} ${priorityStyle.color}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot}`} />
                                  {priorityStyle.label}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatTime(notification.created_at)}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          {/* Metadata badges */}
                          {notification.metadata && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {notification.metadata.audit_event_type && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded">
                                  {notification.metadata.audit_event_type}
                                </span>
                              )}
                              {notification.metadata.user_id && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  User {notification.metadata.user_id}
                                </span>
                              )}
                              {notification.metadata.requires_acknowledgment && !notification.is_read && (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] rounded flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Requires Ack
                                </span>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-3">
                            <button
                              onClick={(e) => handleNotificationClick(notification)}
                              className="text-xs text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1"
                            >
                              {notification.action?.text || 'View Details'}
                              <ExternalLink className="w-3 h-3" />
                            </button>
                            
                            {!notification.is_read && (
                              <button
                                onClick={(e) => handleAcknowledge(e, notification)}
                                disabled={isAcknowledging}
                                className="flex items-center gap-1 px-3 py-1 bg-slate-800 text-white text-xs rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
                              >
                                {isAcknowledging ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-3 h-3" />
                                )}
                                Acknowledge
                              </button>
                            )}
                            
                            {notification.is_read && (
                              <span className="flex items-center gap-1 text-xs text-green-600">
                                <CheckCheck className="w-3 h-3" />
                                Acknowledged
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center">
                  <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No admin alerts</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {filter === 'all' 
                      ? 'All systems operating normally' 
                      : 'No alerts match the selected filter'}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 bg-gray-50 space-y-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAcknowledged}
                  className="w-full py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCheck className="w-4 h-4" />
                  Acknowledge All ({unreadCount})
                </button>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/super-admin/audit-logs');
                  }}
                  className="flex-1 py-2 text-center text-sm text-slate-600 hover:text-slate-800 font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  View Audit Logs
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/notifications?type=audit');
                  }}
                  className="flex-1 py-2 text-center text-sm text-slate-600 hover:text-slate-800 font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  All Notifications
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SuperAdminNotificationCenter;
