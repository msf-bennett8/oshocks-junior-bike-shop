import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Package, Truck, CreditCard, Tag, Heart, MessageSquare, Gift, CheckCircle, X, Settings, Trash2, MailOpen, Clock, ArrowLeft, Star, Zap } from 'lucide-react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState({
    orders: true,
    promotions: true,
    messages: true,
    updates: true,
    wishlist: true,
    reviews: true
  });

  // Notification categories with icons and colors
  const categories = [
    { id: 'all', label: 'All', icon: Bell, color: 'blue', count: 0 },
    { id: 'orders', label: 'Orders', icon: Package, color: 'green', count: 0 },
    { id: 'shipping', label: 'Shipping', icon: Truck, color: 'purple', count: 0 },
    { id: 'payments', label: 'Payments', icon: CreditCard, color: 'orange', count: 0 },
    { id: 'promotions', label: 'Promotions', icon: Tag, color: 'red', count: 0 },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, color: 'pink', count: 0 },
    { id: 'messages', label: 'Messages', icon: MessageSquare, color: 'indigo', count: 0 }
  ];

  // Sample notifications data
  const sampleNotifications = [
    {
      id: 1,
      type: 'orders',
      title: 'Order Confirmed',
      message: 'Your order #OJ2024-1234 has been confirmed and is being processed.',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      isRead: false,
      icon: CheckCircle,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
      actionUrl: '/orders/OJ2024-1234',
      actionLabel: 'View Order'
    },
    {
      id: 2,
      type: 'shipping',
      title: 'Out for Delivery',
      message: 'Great news! Your Trek Precaliber 16 is out for delivery and will arrive today.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      isRead: false,
      icon: Truck,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
      actionUrl: '/track/TRK-789456',
      actionLabel: 'Track Package'
    },
    {
      id: 3,
      type: 'promotions',
      title: 'Flash Sale Alert! 🔥',
      message: '40% OFF on all Mountain Bikes! Limited time offer ends in 6 hours.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      isRead: true,
      icon: Tag,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
      actionUrl: '/flash-sale',
      actionLabel: 'Shop Now'
    },
    {
      id: 4,
      type: 'payments',
      title: 'Payment Successful',
      message: 'Your payment of KES 65,000 via M-Pesa has been received successfully.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      isRead: true,
      icon: CreditCard,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-100',
      actionUrl: '/payments/receipt/PAY-2024-567',
      actionLabel: 'View Receipt'
    },
    {
      id: 5,
      type: 'wishlist',
      title: 'Price Drop Alert',
      message: 'The Giant Talon 2 29er in your wishlist is now KES 10,000 cheaper!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
      isRead: false,
      icon: Heart,
      iconColor: 'text-pink-600',
      iconBg: 'bg-pink-100',
      actionUrl: '/product/giant-talon-2',
      actionLabel: 'View Product'
    },
    {
      id: 6,
      type: 'orders',
      title: 'Order Delivered',
      message: 'Your order #OJ2024-1198 has been delivered successfully. Rate your experience!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      isRead: true,
      icon: Package,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
      actionUrl: '/orders/OJ2024-1198/review',
      actionLabel: 'Rate Order'
    },
    {
      id: 7,
      type: 'messages',
      title: 'New Message from Support',
      message: 'Customer support has replied to your inquiry about bike assembly services.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      isRead: false,
      icon: MessageSquare,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-100',
      actionUrl: '/messages/support-thread-456',
      actionLabel: 'View Message'
    },
    {
      id: 8,
      type: 'promotions',
      title: 'New Arrival: Electric Bikes',
      message: 'Check out our latest collection of electric bikes with advanced features.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36),
      isRead: true,
      icon: Zap,
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
      actionUrl: '/category/electric-bikes',
      actionLabel: 'Browse Collection'
    },
    {
      id: 9,
      type: 'wishlist',
      title: 'Back in Stock',
      message: 'Scott Aspect 970 from your wishlist is now back in stock!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
      isRead: true,
      icon: Package,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      actionUrl: '/product/scott-aspect-970',
      actionLabel: 'Buy Now'
    },
    {
      id: 10,
      type: 'orders',
      title: 'Order Shipped',
      message: 'Your order #OJ2024-1234 has been shipped and is on the way.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
      isRead: true,
      icon: Truck,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
      actionUrl: '/track/TRK-123789',
      actionLabel: 'Track Shipment'
    },
    {
      id: 11,
      type: 'promotions',
      title: 'Weekend Special Offer',
      message: 'Get free accessories worth KES 5,000 on orders above KES 50,000 this weekend!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96),
      isRead: true,
      icon: Gift,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
      actionUrl: '/weekend-deals',
      actionLabel: 'Shop Deals'
    },
    {
      id: 12,
      type: 'messages',
      title: 'Review Request',
      message: 'How was your experience with the Specialized Sirrus X 2.0? Share your feedback!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 120),
      isRead: true,
      icon: Star,
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
      actionUrl: '/product/specialized-sirrus/review',
      actionLabel: 'Write Review'
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      setNotifications(sampleNotifications);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getCategoryCounts = () => {
    const counts = { all: notifications.length };
    notifications.forEach(notif => {
      counts[notif.type] = (counts[notif.type] || 0) + 1;
    });
    return counts;
  };

  const categoryCounts = getCategoryCounts();
  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const formatTimestamp = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setSelectedNotifications(prev => prev.filter(nId => nId !== id));
  };

  const deleteSelected = () => {
    setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
    setSelectedNotifications([]);
  };

  const toggleSelection = (id) => {
    setSelectedNotifications(prev =>
      prev.includes(id) ? prev.filter(nId => nId !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const toggleNotificationSetting = (key) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getCategoryColor = (color, isActive) => {
    const colors = {
      blue: isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700',
      green: isActive ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700',
      purple: isActive ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700',
      orange: isActive ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700',
      red: isActive ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700',
      pink: isActive ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-700',
      indigo: isActive ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
    };
    return colors[color] || colors.blue;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </div>

          <div className="flex items-center gap-4 mb-2">
            <div className="relative">
              <Bell className="w-12 h-12" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-4xl font-bold">Notifications</h1>
              <p className="text-blue-100">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="bg-white border-b border-gray-200 py-6 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Notification Preferences</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(notificationSettings).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900 capitalize">{key} Notifications</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleNotificationSetting(key);
                    }}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      value ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border-b border-gray-200 py-4 px-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex overflow-x-auto space-x-3 pb-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const count = categoryCounts[category.id] || 0;
              const isActive = filter === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setFilter(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${getCategoryColor(category.color, isActive)} ${!isActive && 'hover:bg-gray-200'}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{category.label}</span>
                  {count > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white bg-opacity-30' : 'bg-gray-200'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {notifications.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                    onChange={selectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {selectedNotifications.length > 0 
                      ? `${selectedNotifications.length} selected` 
                      : 'Select all'}
                  </span>
                </label>
                {selectedNotifications.length > 0 && (
                  <button
                    onClick={deleteSelected}
                    className="flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Delete Selected</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <MailOpen className="w-4 h-4" />
                    <span className="text-sm font-medium">Mark all as read</span>
                  </button>
                )}
                <span className="text-sm text-gray-600">
                  {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        )}

        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <BellOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "You're all caught up! Check back later for updates."
                : `No ${filter} notifications at the moment.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const Icon = notification.icon;
              const isSelected = selectedNotifications.includes(notification.id);

              return (
                <div
                  key={notification.id}
                  className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all ${
                    !notification.isRead ? 'border-l-4 border-blue-600' : ''
                  } ${isSelected ? 'ring-2 ring-blue-600' : ''}`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(notification.id)}
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />

                      <div className={`flex-shrink-0 w-12 h-12 ${notification.iconBg} rounded-full flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${notification.iconColor}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {notification.title}
                            {!notification.isRead && (
                              <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                          </h3>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimestamp(notification.timestamp)}
                            </span>
                          </div>
                        </div>

                        <p className="text-gray-600 mb-3">{notification.message}</p>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              markAsRead(notification.id);
                              window.location.href = notification.actionUrl;
                            }}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                          >
                            {notification.actionLabel}
                          </button>
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-sm text-gray-600 hover:text-gray-700"
                            >
                              Mark as read
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="text-sm text-red-600 hover:text-red-700 ml-auto"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredNotifications.length > 0 && (
          <div className="mt-8 text-center">
            <button className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              Load More Notifications
            </button>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12 px-4 mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Quick Actions</h2>
          <p className="text-blue-100 mb-6">
            Manage your shopping experience
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <a
              href="/orders"
              className="p-6 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-colors"
            >
              <Package className="w-8 h-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">My Orders</h3>
              <p className="text-sm text-blue-100">Track and manage orders</p>
            </a>
            <a
              href="/wishlist"
              className="p-6 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-colors"
            >
              <Heart className="w-8 h-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Wishlist</h3>
              <p className="text-sm text-blue-100">View saved items</p>
            </a>
            <a
              href="/messages"
              className="p-6 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-colors"
            >
              <MessageSquare className="w-8 h-8 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Messages</h3>
              <p className="text-sm text-blue-100">Chat with support</p>
            </a>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-gray-400 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} Oshocks Junior Bike Shop. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default NotificationsPage;