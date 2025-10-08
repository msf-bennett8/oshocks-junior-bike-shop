// Simple service worker - create this file in public folder
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
});

self.addEventListener('fetch', (event) => {
  // Just pass through for now
  event.respondWith(fetch(event.request));
});