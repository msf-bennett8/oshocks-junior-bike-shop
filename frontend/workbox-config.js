module.exports = {
  globDirectory: 'build/',
  globPatterns: [
    '**/*.{html,js,css,png,svg,jpg,jpeg,gif,ico,woff,woff2,ttf,eot,json,webmanifest,txt,xml}'
  ],
  swDest: 'build/service-worker.js',
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
  mode: 'production',
  
  runtimeCaching: [
    {
      urlPattern: ({ request }) => request.destination === 'image',
      handler: 'CacheFirst',
      options: {
        cacheName: 'oshocks-images',
        expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com' ||
                               url.origin === 'https://fonts.gstatic.com',
      handler: 'CacheFirst',
      options: {
        cacheName: 'oshocks-fonts',
        expiration: { maxEntries: 30, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
      handler: 'NetworkFirst',
      options: {
        cacheName: 'oshocks-api',
        expiration: { maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
    {
      urlPattern: ({ request }) => request.destination === 'script' ||
                                   request.destination === 'style',
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'oshocks-static',
        expiration: { maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
  ],
  
  skipWaiting: true,
  clientsClaim: true,
};
