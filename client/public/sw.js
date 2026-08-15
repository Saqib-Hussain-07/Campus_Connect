const CACHE_NAME = 'campusconnect-v3';
const DYNAMIC_CACHE = 'campusconnect-dynamic-v3';
const FONT_CACHE = 'campusconnect-fonts-v3';
const MAX_DYNAMIC_ITEMS = 60;

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

// Core SPA shell routes to pre-cache for offline availability
const OFFLINE_ROUTES = [
  '/dashboard',
  '/projects',
  '/events',
  '/groups',
  '/resources',
  '/notices',
  '/leaderboard',
  '/saved',
  '/search'
];

// Helper: Trim cache to limit max stored entries (LRU eviction)
async function trimCache(cacheName, maxItems) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
      await cache.delete(keys[0]);
      await trimCache(cacheName, maxItems);
    }
  } catch (e) {}
}

// Install Event - Pre-cache core static shell & offline routes
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Pre-caching app shell & static assets (v3)');
        return cache.addAll([...STATIC_ASSETS, ...OFFLINE_ROUTES]);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up stale cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME && cache !== DYNAMIC_CACHE && cache !== FONT_CACHE) {
              console.log('[ServiceWorker] Purging stale cache version:', cache);
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Message Event - Handle SKIP_WAITING from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
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

  // 1. External CDN Fonts & Stylesheets -> Stale-While-Revalidate Strategy
  if (
    url.origin.includes('fonts.googleapis.com') ||
    url.origin.includes('fonts.gstatic.com') ||
    url.origin.includes('cdnjs.cloudflare.com') ||
    url.origin.includes('jsdelivr.net') ||
    url.origin.includes('images.unsplash.com')
  ) {
    event.respondWith(
      caches.open(FONT_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => null);

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
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseToCache);
              trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_ITEMS);
            });
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
    const isSensitiveAuth =
      url.pathname.startsWith('/api/auth/me') ||
      url.pathname.startsWith('/api/auth/logout') ||
      url.pathname.startsWith('/api/auth/login');

    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && !isSensitiveAuth) {
            const responseToCache = networkResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseToCache);
              trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_ITEMS);
            });
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
      return fetch(request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (request.destination === 'style' ||
              request.destination === 'script' ||
              request.destination === 'image' ||
              request.destination === 'font')
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseToCache);
              trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_ITEMS);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          if (request.destination === 'image' && !url.pathname.includes('logo192.png')) {
            return caches.match('/logo192.png');
          }
        });
    })
  );
});

// Background Sync Handler
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-queue' || event.tag === 'sync-campusconnect-data') {
    console.log('[ServiceWorker] Background Sync: Replaying queued offline actions');
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'PROCESS_OFFLINE_QUEUE' });
        });
      })
    );
  }
});

// Push notification event handlers
self.addEventListener('push', (event) => {
  let data = { title: 'CampusConnect', body: 'New campus updates available!', url: '/' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: 'Open CampusConnect' },
      { action: 'close', title: 'Dismiss' }
    ]
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
