const CACHE_NAME = 'campusconnect-v2';
const DYNAMIC_CACHE = 'campusconnect-dynamic-v2';
const FONT_CACHE = 'campusconnect-fonts-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/maskable512.png',
  '/apple-touch-icon.png'
];

// Install Event - Pre-cache core static shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching app shell & static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up stale cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache !== DYNAMIC_CACHE && cache !== FONT_CACHE) {
            console.log('[ServiceWorker] Removing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Strategic Caching Strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests, chrome-extension schemes, and Webpack HMR dev scripts
  if (
    request.method !== 'GET' ||
    url.protocol === 'chrome-extension:' ||
    url.pathname.includes('hot-update') ||
    url.pathname.includes('sockjs-node')
  ) {
    return;
  }

  // 1. External CDN Fonts & Stylesheets (Google Fonts, FontAwesome, Bootstrap) -> Stale-While-Revalidate Strategy
  if (
    url.origin.includes('fonts.googleapis.com') ||
    url.origin.includes('fonts.gstatic.com') ||
    url.origin.includes('cdnjs.cloudflare.com') ||
    url.origin.includes('jsdelivr.net')
  ) {
    event.respondWith(
      caches.open(FONT_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => null);

        // Return cached font immediately if present, otherwise wait for network fetch
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 2. Navigation requests (HTML pages) -> Network First with SPA index.html & Offline Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, responseToCache));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // For SPA client-side routing, try returning pre-cached index.html first
          const indexShell = await caches.match('/index.html');
          if (indexShell) {
            return indexShell;
          }
          // If offline and index.html unavailable, return offline.html
          return caches.match('/offline.html');
        })
    );
    return;
  }

  // 3. API Requests -> Network First, fallback to Dynamic Cache (excluding sensitive auth endpoints)
  if (url.pathname.startsWith('/api/')) {
    const isSensitiveAuth = url.pathname.startsWith('/api/auth/me') ||
                            url.pathname.startsWith('/api/auth/logout') ||
                            url.pathname.startsWith('/api/auth/login');

    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && !isSensitiveAuth) {
            const responseToCache = networkResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => {
          if (!isSensitiveAuth) {
            return caches.match(request);
          }
          return Promise.reject('Offline sensitive auth request');
        })
    );
    return;
  }

  // 4. Local Static Assets (JS, CSS, Images) -> Cache First, fallback to Network
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (request.destination === 'style' ||
           request.destination === 'script' ||
           request.destination === 'image' ||
           request.destination === 'font')
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, responseToCache));
        }
        return networkResponse;
      }).catch(() => {
        if (request.destination === 'image' && !url.pathname.includes('logo192.png')) {
          return caches.match('/logo192.png');
        }
      });
    })
  );
});

// Background sync handler for mobile network recovery
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-campusconnect-data') {
    console.log('[ServiceWorker] Background sync triggered for CampusConnect');
  }
});

// Push notification event handlers
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'CampusConnect', body: 'New campus updates available!' };
  const options = {
    body: data.body,
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' }
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
