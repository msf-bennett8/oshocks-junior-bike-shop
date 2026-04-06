import React, { useState, useEffect } from 'react';
import { 
  Bell, X, Check, Trash2, Settings, Mail, 
  ShoppingBag, Truck, DollarSign, AlertCircle, Info 
} from 'lucide-react';
import { logFrontendAuditEvent, AUDIT_EVENTS } from '../../utils/auditUtils';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');

  // Check for settings param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('settings') === 'true') {
      setShowSettings(true);
    }
    const notificationId = params.get('id');
    if (notificationId) {
      // Find and open specific notification
      const found = notifications.find(n => n.id === notificationId);
      if (found) {
        setSelectedNotification(found);
        setShowModal(true);
      }
    }
  }, []);

  // Load notifications (mock data - replace with API call)
  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        type: 'order',
        title: 'Order Shipped',
        message: 'Your order #10234 has been shipped and is on its way!',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
        read: false,
        actionUrl: '/orders/10234',
        actionText: 'View Order',
      },
      {
        id: 2,
        type: 'payment',
        title: 'Payment Successful',
        message: 'Your payment of KES 46,000 for order #10234 was successful.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        read: false,
        actionUrl: '/orders/10234',
        actionText: 'View Receipt',
      },
      {
        id: 3,
        type: 'promo',
        title: 'Special Offer',
        message: 'Get 20% off on all mountain bikes this weekend!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        read: true,
        actionUrl: '/products?category=mountain-bikes',
        actionText: 'Shop Now',
      },
    ];
    
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.read) {
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    
    // Log notification clicked event
    try {
      await logFrontendAuditEvent(AUDIT_EVENTS.NOTIFICATION_CLICKED, {
        category: 'notification',
        severity: 'low',
        metadata: {
          notification_id: notification.id,
          notification_type: notification.type,
          clicked_url: notification.actionUrl || '/notifications',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (e) {
      // Silently fail
    }
    
    // Close dropdown
    setIsOpen(false);
    
    // Navigate to action URL or notifications page
    if (notification.actionUrl && notification.actionUrl !== '#') {
      window.location.href = notification.actionUrl;
    } else {
      // Navigate to full notifications page for detailed view
      window.location.href = `/notifications?id=${notification.id}`;
    }
  };

  const handleNotificationOpen = async () => {
    setIsOpen(!isOpen);
    
    if (!isOpen) {
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

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = async (e, id) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order': return <ShoppingBag className="w-5 h-5 text-blue-600" />;
      case 'payment': return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'shipping': return <Truck className="w-5 h-5 text-purple-600" />;
      case 'promo': return <Mail className="w-5 h-5 text-orange-600" />;
      case 'alert': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={handleNotificationOpen}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
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
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
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
              {['all', 'unread', 'order', 'payment', 'promo'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-xs font-medium rounded-full capitalize whitespace-nowrap ${
                    filter === f 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h4>
                          <button
                            onClick={(e) => deleteNotification(e, notification.id)}
                            className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {formatTime(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
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
                  // Log notification settings changed if applicable
                  window.location.href = '/notifications';
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all notifications
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  window.location.href = '/notifications?settings=true';
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
