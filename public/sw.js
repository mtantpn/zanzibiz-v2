const CACHE_VERSION = 'v5';
const CACHE_NAME = `zanzibiz-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

const CACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/Zanzibiz.com-logo.png',
  '/favicon.png',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/auth/login.html',
  '/auth/signup.html',
  'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
];

const API_CACHE_NAME = `zanzibiz-api-${CACHE_VERSION}`;
const IMAGE_CACHE_NAME = `zanzibiz-images-${CACHE_VERSION}`;
const MAX_API_CACHE_AGE = 5 * 60 * 1000;
const MAX_IMAGE_CACHE_SIZE = 50;

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(CACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME &&
                cacheName !== API_CACHE_NAME &&
                cacheName !== IMAGE_CACHE_NAME) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  if (url.origin.includes('supabase.co')) {
    event.respondWith(handleSupabaseRequest(request));
    return;
  }

  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
    return;
  }

  if (url.pathname.startsWith('/api/') || url.pathname.includes('.json')) {
    event.respondWith(handleAPIRequest(request));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  if (request.destination === 'document' || request.destination === 'style' || request.destination === 'script' || request.destination === 'font') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }
});

async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache:', error);

    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    if (request.mode === 'navigate') {
      const offlineResponse = await caches.match(OFFLINE_URL);
      if (offlineResponse) {
        return offlineResponse;
      }
    }

    return new Response('Offline - Content not available', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain'
      })
    });
  }
}

async function handleSupabaseRequest(request) {
  try {
    const response = await fetch(request);

    if (response.ok && request.url.includes('/rest/v1/')) {
      const cache = await caches.open(API_CACHE_NAME);
      const cachedResponse = response.clone();

      const headers = new Headers(cachedResponse.headers);
      headers.append('sw-cached-at', Date.now().toString());

      const cachedResponseWithTimestamp = new Response(
        await cachedResponse.blob(),
        {
          status: cachedResponse.status,
          statusText: cachedResponse.statusText,
          headers: headers
        }
      );

      cache.put(request, cachedResponseWithTimestamp);
    }

    return response;
  } catch (error) {
    console.log('[Service Worker] Supabase request failed, trying cache');

    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      const cachedAt = cachedResponse.headers.get('sw-cached-at');
      const age = Date.now() - parseInt(cachedAt || '0');

      if (age < MAX_API_CACHE_AGE) {
        console.log('[Service Worker] Returning cached API response');
        return cachedResponse;
      }
    }

    return new Response(JSON.stringify({ error: 'Network unavailable', offline: true }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleAPIRequest(request) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response(JSON.stringify({ error: 'Offline', cached: false }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);

    if (response.ok) {
      cache.put(request, response.clone());

      const keys = await cache.keys();
      if (keys.length > MAX_IMAGE_CACHE_SIZE) {
        await cache.delete(keys[0]);
      }
    }

    return response;
  } catch (error) {
    return new Response('', {
      status: 503,
      statusText: 'Image unavailable offline'
    });
  }
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-favorites') {
    event.waitUntil(syncFavorites());
  }

  if (event.tag === 'sync-reviews') {
    event.waitUntil(syncReviews());
  }

  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

async function syncFavorites() {
  console.log('[Service Worker] Syncing favorites...');
}

async function syncReviews() {
  console.log('[Service Worker] Syncing reviews...');
}

async function syncMessages() {
  console.log('[Service Worker] Syncing messages...');
}

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};

  const title = data.title || 'ZanziBiz';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/untitled_design.png',
    badge: '/untitled_design.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'notification',
    data: data.url || '/',
    actions: [
      {
        action: 'open',
        title: 'View',
        icon: '/untitled_design.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/untitled_design.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    const urlToOpen = event.notification.data || '/';

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          for (let i = 0; i < clientList.length; i++) {
            const client = clientList[i];
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus();
            }
          }

          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});
