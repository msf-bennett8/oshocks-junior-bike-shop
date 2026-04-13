// ============================================================================
// NOTIFICATION SERVICE - API Integration for Notifications
// ============================================================================

import api from './api';

/**
 * Get notifications with filtering and pagination
 */
export const getNotifications = async (params = {}) => {
  const response = await api.get('/notifications', { params });
  return response.data;
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async () => {
  const response = await api.get('/notifications/unread-count');
  return response.data;
};

/**
 * Get single notification details
 */
export const getNotification = async (id) => {
  const response = await api.get(`/notifications/${id}`);
  return response.data;
};

/**
 * Mark notification as read
 */
export const markAsRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (type = null) => {
  const params = type ? { type } : {};
  const response = await api.put('/notifications/read-all', null, { params });
  return response.data;
};

/**
 * Delete notification (soft delete)
 */
export const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};

/**
 * Archive notification
 */
export const archiveNotification = async (id) => {
  const response = await api.post(`/notifications/${id}/archive`);
  return response.data;
};

/**
 * Unarchive notification
 */
export const unarchiveNotification = async (id) => {
  const response = await api.post(`/notifications/${id}/unarchive`);
  return response.data;
};

/**
 * Pin notification
 */
export const pinNotification = async (id) => {
  const response = await api.post(`/notifications/${id}/pin`);
  return response.data;
};

/**
 * Unpin notification
 */
export const unpinNotification = async (id) => {
  const response = await api.post(`/notifications/${id}/unpin`);
  return response.data;
};

/**
 * Bulk delete notifications
 */
export const bulkDeleteNotifications = async (ids) => {
  const response = await api.post('/notifications/bulk-delete', { ids });
  return response.data;
};

/**
 * Bulk archive notifications
 */
export const bulkArchiveNotifications = async (ids) => {
  const response = await api.post('/notifications/bulk-archive', { ids });
  return response.data;
};

/**
 * Bulk mark notifications as read
 */
export const bulkMarkAsRead = async (ids) => {
  const response = await api.post('/notifications/bulk-mark-read', { ids });
  return response.data;
};

/**
 * Get notification preferences
 */
export const getNotificationPreferences = async () => {
  const response = await api.get('/user/notification-preferences');
  return response.data;
};

/**
 * Update notification preferences
 */
export const updateNotificationPreferences = async (preferences) => {
  const response = await api.put('/user/notification-preferences', preferences);
  return response.data;
};

// ============================================================================
// PUSH NOTIFICATION SUBSCRIPTION
// ============================================================================

/**
 * Get user's push subscriptions
 */
export const getPushSubscriptions = async () => {
  const response = await api.get('/push-subscriptions');
  return response.data;
};

/**
 * Subscribe to push notifications
 */
export const subscribeToPush = async (subscription) => {
  const response = await api.post('/push-subscriptions', {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    device_info: {
      platform: navigator.platform,
      browser: navigator.userAgent,
    },
  });
  return response.data;
};

/**
 * Unsubscribe from push notifications
 */
export const unsubscribeFromPush = async (id) => {
  const response = await api.delete(`/push-subscriptions/${id}`);
  return response.data;
};

/**
 * Send test push notification
 */
export const sendTestPush = async () => {
  const response = await api.post('/push-subscriptions/test');
  return response.data;
};

// ============================================================================
// SERVICE WORKER REGISTRATION FOR PUSH
// ============================================================================

/**
 * Register service worker for push notifications
 */
export const registerPushNotifications = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push notifications not supported');
    return { supported: false };
  }

  try {
    // Get VAPID public key from backend (you'll need to add this endpoint)
    const registration = await navigator.serviceWorker.ready;
    
    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return { supported: true, permission: false };
      }

      // Subscribe with VAPID key
      const vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY || 
        'BLZWRkpWcYxFT4mCZKXuio9h8kdTasrmT7Bp12NlbKPPRhz-HGYktiX15JCG8qODNdsxtt8fT8GirYUMvOU3VZ0';
      
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
      
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });

      // Send to backend
      await subscribeToPush(subscription);
    }

    return { supported: true, permission: true, subscription };
  } catch (error) {
    console.error('Push registration failed:', error);
    return { supported: true, permission: false, error: error.message };
  }
};

/**
 * Unregister push notifications
 */
export const unregisterPushNotifications = async () => {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  
  if (subscription) {
    // Get subscription ID from backend first
    const subscriptions = await getPushSubscriptions();
    const matchingSub = subscriptions.subscriptions?.find(
      s => s.endpoint === subscription.endpoint
    );
    
    if (matchingSub) {
      await unsubscribeFromPush(matchingSub.id);
    }
    
    await subscription.unsubscribe();
  }
  
  return { success: true };
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// ============================================================================
// REAL-TIME NOTIFICATIONS (WebSocket/SSE placeholder)
// ============================================================================

let eventSource = null;

/**
 * Subscribe to real-time notifications via SSE
 */
export const subscribeToRealtimeNotifications = (onNotification) => {
  // Close existing connection
  if (eventSource) {
    eventSource.close();
  }

  const token = localStorage.getItem('authToken');
  if (!token) return null;

  // Create SSE connection (you'll need to implement backend SSE endpoint)
  // eventSource = new EventSource(`/api/v1/notifications/stream?token=${token}`);
  
  // For now, use polling fallback
  const intervalId = setInterval(async () => {
    try {
      const { unread_count } = await getUnreadCount();
      onNotification({ type: 'unread_count', count: unread_count });
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, 30000); // Poll every 30 seconds

  return {
    close: () => clearInterval(intervalId),
  };
};

// Default export
const notificationService = {
  getNotifications,
  getUnreadCount,
  getNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  archiveNotification,
  unarchiveNotification,
  pinNotification,
  unpinNotification,
  bulkDeleteNotifications,
  bulkArchiveNotifications,
  bulkMarkAsRead,
  getNotificationPreferences,
  updateNotificationPreferences,
  getPushSubscriptions,
  subscribeToPush,
  unsubscribeFromPush,
  sendTestPush,
  registerPushNotifications,
  unregisterPushNotifications,
  subscribeToRealtimeNotifications,
};

export default notificationService;
