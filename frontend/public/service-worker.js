// Service Worker - Fixed to exclude API calls
// Location: /public/service-worker.js

self.addEventListener('install', (event) => {
  console.log('✅ Service Worker: Installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Activated');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // CRITICAL FIX: Don't intercept API calls
  const isApiCall = 
    url.pathname.startsWith('/api/') || 
    url.hostname.includes('onrender.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('strava.com');
  
  if (isApiCall) {
    // Let API calls pass through WITHOUT interception
    return; // This is the key fix!
  }
  
  // Only handle static assets
  event.respondWith(fetch(event.request));
});