// ============================================================================
// SERVICE WORKER - Enhanced with Web Push & Background Sync
// Oshocks Junior Bike Shop - Phase 7 Implementation
// ============================================================================

const CACHE_NAME = 'oshocks-v1';
const STATIC_ASSETS = [
  '/',
  '/static/js/main.js',
  '/static/css/main.css',
  '/icon-192x192.png',
  '/badge-72x72.png',
  '/manifest.json'
];

// ============================================================================
// INSTALL & ACTIVATE
// ============================================================================

self.addEventListener('install', (event) => {
  console.log('✅ Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((err) => {
        console.error('❌ Service Worker: Cache failed', err);
      })
  );
  
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  
  event.waitUntil(self.clients.claim());
});

// ============================================================================
// FETCH HANDLER - Exclude API calls
// ============================================================================

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // CRITICAL: Don't intercept API calls
  const isApiCall = 
    url.pathname.startsWith('/api/') || 
    url.hostname.includes('railway.app') ||
    url.hostname.includes('onrender.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('strava.com') ||
    url.hostname.includes('cloudinary.com');
  
  if (isApiCall) {
    return; // Pass through without interception
  }
  
  // Cache-first for static assets
  if (event.request.mode === 'navigate' || 
      event.request.destination === 'image' ||
      event.request.destination === 'style' ||
      event.request.destination === 'script') {
    
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(event.request).then((response) => {
          // Cache new static assets
          if (response.status === 200 && response.type === 'basic') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      })
    );
  }
});

// ============================================================================
// PUSH NOTIFICATION HANDLER - Phase 7 Core Feature
// ============================================================================

self.addEventListener('push', (event) => {
  console.log('🔔 Push received:', event);
  
  let notificationData = {};
  
  try {
    notificationData = event.data.json();
  } catch (e) {
    // If not JSON, use text
    notificationData = {
      title: 'Oshocks Notification',
      body: event.data.text(),
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: 'general',
      data: { url: '/' }
    };
  }

  const title = notificationData.title || 'Oshocks Junior Bike Shop';
  const options = {
    body: notificationData.body || 'You have a new notification',
    icon: notificationData.icon || '/oshocks-pwa.png',
    badge: notificationData.badge || '/apple-touch-icon.png',
    image: notificationData.image || null,
    tag: notificationData.tag || `notification-${Date.now()}`,
    requireInteraction: notificationData.requireInteraction || false,
    renotify: notificationData.renotify || false,
    silent: notificationData.silent || false,
    timestamp: notificationData.timestamp || Date.now(),
    actions: notificationData.actions || [
      { action: 'view', title: 'View', icon: '/oshocks-pwa.png' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    data: {
      url: notificationData.data?.url || '/notifications',
      notificationId: notificationData.data?.notification_id || null,
      type: notificationData.data?.type || 'general',
      ...notificationData.data
    }
  };

  // Handle urgent notifications differently
  if (notificationData.urgency === 'high' || notificationData.priority === 'urgent') {
    options.requireInteraction = true;
    options.badge = '/badge-urgent-72x72.png'; // Optional urgent badge
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => {
        console.log('✅ Notification displayed:', title);
        
        // Track delivery via background sync if available
        if (notificationData.data?.notificationId && 'sync' in self.registration) {
          return self.registration.sync.register(`track-delivery-${notificationData.data.notificationId}`);
        }
      })
      .catch((err) => {
        console.error('❌ Failed to show notification:', err);
      })
  );
});

// ============================================================================
// NOTIFICATION CLICK HANDLER
// ============================================================================

self.addEventListener('notificationclick', (event) => {
  console.log('👆 Notification clicked:', event.action, event.notification);
  
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};
  const url = data.url || '/notifications';
  const notificationId = data.notificationId || data.notification_id;

  // Close the notification
  notification.close();

  // Handle actions
  if (action === 'dismiss') {
    // Just close - no tracking needed
    return;
  }

  if (action === 'view' || !action) {
    event.waitUntil(
      // Track click first
      trackNotificationClick(notificationId, url)
        .then(() => {
          // Open or focus window
          return clients.matchAll({
            type: 'window',
            includeUncontrolled: true
          });
        })
        .then((clientList) => {
          // Check if app is already open
          for (const client of clientList) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              // Navigate to the URL and focus
              client.navigate(url);
              return client.focus();
            }
          }
          
          // If not open, open new window
          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
        .catch((err) => {
          console.error('❌ Error handling notification click:', err);
          // Still try to open window even if tracking fails
          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
    );
  }

  // Handle custom actions
  if (action === 'mark-read' && notificationId) {
    event.waitUntil(
      markNotificationAsRead(notificationId)
        .then(() => {
          // Notify all clients to refresh notifications
          return notifyClients('notification-marked-read', { notificationId });
        })
    );
  }
});

// ============================================================================
// NOTIFICATION CLOSE HANDLER (Dismiss without click)
// ============================================================================

self.addEventListener('notificationclose', (event) => {
  console.log('❌ Notification dismissed:', event.notification);
  // Optional: Track dismiss event
});

// ============================================================================
// BACKGROUND SYNC HANDLER
// ============================================================================

self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync:', event.tag);
  
  if (event.tag.startsWith('track-delivery-')) {
    const notificationId = event.tag.replace('track-delivery-', '');
    event.waitUntil(trackNotificationDelivery(notificationId));
  }
  
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncPendingNotifications());
  }
  
  if (event.tag === 'mark-read-') {
    // Extract notification ID from tag
    const match = event.tag.match(/mark-read-(.+)/);
    if (match) {
      event.waitUntil(markNotificationAsRead(match[1]));
    }
  }
});

// ============================================================================
// PUSH SUBSCRIPTION CHANGE HANDLER
// ============================================================================

self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('🔄 Push subscription changed');
  
  event.waitUntil(
    // Re-subscribe with new subscription
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: event.oldSubscription.options.applicationServerKey
    }).then((newSubscription) => {
      // Send new subscription to server
      return fetch('/api/v1/push-subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: newSubscription.endpoint,
          keys: {
            p256dh: newSubscription.keys.p256dh,
            auth: newSubscription.keys.auth
          }
        })
      });
    })
  );
});

// ============================================================================
// MESSAGE HANDLER (from main app)
// ============================================================================

self.addEventListener('message', (event) => {
  console.log('📨 Message from main thread:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    // For scheduled notifications (using setTimeout in SW)
    const { title, options, delay } = event.data;
    setTimeout(() => {
      self.registration.showNotification(title, options);
    }, delay);
  }
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Track notification click via API
 */
async function trackNotificationClick(notificationId, url) {
  if (!notificationId) return Promise.resolve();
  
  try {
    const response = await fetch(`/api/v1/notifications/track-click/${notificationId}?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`Tracking failed: ${response.status}`);
    }
    
    console.log('✅ Click tracked:', notificationId);
    return response.json();
  } catch (error) {
    console.error('❌ Failed to track click:', error);
    // Don't throw - tracking failure shouldn't break UX
    return Promise.resolve();
  }
}

/**
 * Track notification delivery via API
 */
async function trackNotificationDelivery(notificationId) {
  if (!notificationId) return Promise.resolve();
  
  try {
    // Use beacon API for reliable delivery tracking
    const success = navigator.sendBeacon(
      `/api/v1/notifications/track-delivery/${notificationId}`,
      JSON.stringify({ delivered_at: new Date().toISOString() })
    );
    
    if (!success) {
      // Fallback to fetch
      await fetch(`/api/v1/notifications/track-delivery/${notificationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delivered_at: new Date().toISOString() })
      });
    }
    
    console.log('✅ Delivery tracked:', notificationId);
  } catch (error) {
    console.error('❌ Failed to track delivery:', error);
  }
}

/**
 * Mark notification as read via API
 */
async function markNotificationAsRead(notificationId) {
  if (!notificationId) return Promise.resolve();
  
  try {
    const response = await fetch(`/api/v1/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ Marked as read:', notificationId);
    return response.json();
  } catch (error) {
    console.error('❌ Failed to mark as read:', error);
    return Promise.resolve();
  }
}

/**
 * Sync pending notifications (for offline queue)
 */
async function syncPendingNotifications() {
  // Get pending actions from IndexedDB and process them
  console.log('🔄 Syncing pending notifications...');
  // Implementation depends on your IndexedDB setup
}

/**
 * Notify all clients of an event
 */
async function notifyClients(type, data) {
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach(client => {
    client.postMessage({ type, data });
  });
}

// ============================================================================
// PERIODIC SYNC (if supported)
// ============================================================================

if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'notification-cleanup') {
      event.waitUntil(cleanupOldNotifications());
    }
  });
}

async function cleanupOldNotifications() {
  // Clean up expired notifications from cache
  console.log('🧹 Cleaning up old notifications...');
}

console.log('✅ Service Worker: Loaded and ready');