module.exports = {
  globDirectory: 'build/',
  globPatterns: [
    '**/*.{html,js,css,png,svg,jpg,jpeg,gif,ico,woff,woff2,ttf,eot,json,webmanifest,txt,xml}'
  ],
  swSrc: 'public/service-worker.js',
  swDest: 'build/service-worker.js',
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
};
