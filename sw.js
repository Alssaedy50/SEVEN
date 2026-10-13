// SEVEN — service worker for offline shell caching.
// Data is never cached here; it lives in IndexedDB. This only caches the app shell.
const CACHE = 'seven-shell-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './src/css/app.css',
  './src/js/app.js',
  './src/js/views.js',
  './src/js/store.js',
  './src/js/receipt.js',
  './src/js/utils.js',
  './src/js/icons.js',
  './assets/logo.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // Network-first: always prefer fresh app shell when online, fall back to
  // cache offline. Prevents stale modules after updates.
  e.respondWith(
    fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
  );
});
