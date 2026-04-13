import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bell, X, Check, Trash2, Settings, Mail, 
  ShoppingBag, Truck, DollarSign, AlertCircle, Info, Package,
  CreditCard, Tag, Heart, MessageSquare, Sparkles, Shield,
  TrendingDown, Users, FileText, Megaphone, Wallet, Pin,
  RefreshCw, CheckCheck, Archive
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logFrontendAuditEvent, AUDIT_EVENTS } from '../../utils/auditUtils';
import notificationService from '../../services/notificationService';
import useNotifications from '../../hooks/useNotifications';
import toast from 'react-hot-toast';

// Icon mapping for notification types
const iconMap = {
  order: { icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100' },
  shipping: { icon: Truck, color: 'text-violet-600', bg: 'bg-violet-100' },
  payment: { icon: CreditCard, color: 'text-green-600', bg: 'bg-green-100' },
  promo: { icon: Tag, color: 'text-orange-600', bg: 'bg-orange-100' },
  wishlist: { icon: Heart, color: 'text-pink-600', bg: 'bg-pink-100' },
  messages: { icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  inventory: { icon: Package, color: 'text-amber-600', bg: 'bg-amber-100' },
  audit: { icon: FileText, color: 'text-slate-600', bg: 'bg-slate-100' },
  admin: { icon: Shield, color: 'text-cyan-600', bg: 'bg-cyan-100' },
  system: { icon: Sparkles, color: 'text-gray-600', bg: 'bg-gray-100' },
  alert: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
  mass_purchase: { icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  low_stock: { icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-100' },
  maintenance: { icon: Megaphone, color: 'text-cyan-600', bg: 'bg-cyan-100' },
  refund: { icon: Wallet, color: 'text-amber-600', bg: 'bg-amber-100' },
};

const NotificationCenter = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    refresh,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    archiveNotification,
    startPolling,
    stopPolling,
  } = useNotifications();

  // Start polling when mounted, stop when unmounted
  useEffect(() => {
    const cleanup = startPolling(30000); // Poll every 30 seconds
    return () => {
      cleanup();
      stopPolling();
    };
  }, [startPolling, stopPolling]);

  // Load notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications({ archived: false }, true);
    }
  }, [isOpen, fetchNotifications]);

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    
    // Log notification clicked event
    try {
      await logFrontendAuditEvent(AUDIT_EVENTS.NOTIFICATION_CLICKED, {
        category: 'notification',
        severity: 'low',
        metadata: {
          notification_id: notification.id,
          notification_type: notification.type,
          clicked_url: notification.action?.url || '/notifications',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (e) {
      // Silently fail
    }
    
    // Close dropdown
    setIsOpen(false);
    
    // Navigate to action URL or notifications page
    if (notification.action?.url && notification.action.url !== '#') {
      navigate(notification.action.url);
    } else {
      navigate(`/notifications?id=${notification.id}`);
    }
  };

  // Handle notification open
  const handleNotificationOpen = async () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    if (newIsOpen) {
      // Log notification opened event
      try {
        await logFrontendAuditEvent(AUDIT_EVENTS.NOTIFICATION_OPENED, {
          category: 'notification',
          severity: 'low',
          metadata: {
            unread_count: unreadCount,
            total_notifications: notifications.length,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (e) {
        // Silently fail
      }
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  // Handle delete
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await deleteNotification(id);
  };

  // Handle archive
  const handleArchive = async (e, id) => {
    e.stopPropagation();
    await archiveNotification(id);
  };

  // Get notification icon config
  const getIconConfig = (type) => {
    return iconMap[type] || iconMap.system;
  };

  // Format timestamp
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

  // Filter notifications
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.is_read;
    return n.type === filter;
  });

  // Take only first 10 for dropdown
  const displayNotifications = filteredNotifications.slice(0, 10);

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={handleNotificationOpen}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                Notifications
                {loading && <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => refresh({ archived: false }, true)}
                  className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                  title="Refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                  disabled={unreadCount === 0}
                >
                  Mark all read
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-1 p-2 border-b border-gray-200 overflow-x-auto">
              {['all', 'unread', 'order', 'payment', 'shipping'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-xs font-medium rounded-full capitalize whitespace-nowrap ${
                    filter === f 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f === 'all' ? 'All' : f}
                  {f === 'unread' && unreadCount > 0 && ` (${unreadCount})`}
                </button>
              ))}
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto">
              {loading && notifications.length === 0 ? (
                // Loading skeletons
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : displayNotifications.length > 0 ? (
                displayNotifications.map((notification) => {
                  const { icon: Icon, color, bg } = getIconConfig(notification.type);
                  
                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        !notification.is_read ? 'bg-blue-50' : ''
                      } ${notification.is_pinned ? 'border-l-4 border-l-orange-400' : ''}`}
                    >
                      <div className="flex gap-3">
                        <div className={`flex-shrink-0 w-10 h-10 ${bg} rounded-full flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-sm font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                              {notification.is_pinned && <Pin className="w-3 h-3 inline ml-1 text-orange-500 fill-current" />}
                            </h4>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => handleArchive(e, notification.id)}
                                className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Archive"
                              >
                                <Archive size={14} />
                              </button>
                              <button
                                onClick={(e) => handleDelete(e, notification.id)}
                                className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {formatTime(notification.created_at)}
                            </span>
                            {!notification.is_read && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No notifications</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/notifications');
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all notifications
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/notifications?settings=true');
                }}
                className="w-full text-center text-xs text-gray-500 hover:text-gray-700 mt-2"
              >
                Notification settings
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;