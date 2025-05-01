/**
 * Idle Heroes Account Viewer - Service Worker
 * Provides offline capabilities and caching
 */

const CACHE_NAME = 'idle-heroes-viewer-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/viewer.html',
  '/landing.html',
  '/js/app.js',
  '/js/data-compressor.js',
  '/js/db-manager.js',
  '/js/url-utility.js',
  '/js/idle-heroes-viewer.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/pako@2.1.0/dist/pako.min.js',
  'https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css'
];

// Install event - cache key assets
self.addEventListener('install', (event) => {
  // Skip waiting forces newly installed service worker to activate
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch(err => {
        console.error('Service worker cache installation error:', err);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return cacheNames.filter(
          (cacheName) => !currentCaches.includes(cacheName)
        );
      })
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.startsWith('https://cdn.jsdelivr.net')) {
    return;
  }
  
  // For HTML files: try network first, then cache
  if (event.request.mode === 'navigate' || 
      (event.request.method === 'GET' && 
       event.request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If valid response, clone and cache it
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(err => {
          // Network failed, try the cache
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // For other requests: try cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        // Make a network request
        return fetch(fetchRequest)
          .then(response => {
            // If valid response, clone and cache it
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          });
      })
  );
});

// Handle offline analytics or pending actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// Function to handle data syncing when back online
async function syncData() {
  // This would handle any operations that need to be performed
  // when the user comes back online, if any
  // For now it's just a placeholder as we don't have backend syncing
  console.log('Syncing data after coming back online');
}
