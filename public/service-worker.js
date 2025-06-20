// Cache name and version for this service worker
const CACHE_NAME = 'gaza-aid-sync-v2';
const VERSION = 'v2'; // Update this version whenever you change the service worker code
// This service worker caches essential files for offline access and handles network requests intelligently.

// List of URLs that should be cached for offline access
const URLS_TO_CACHE = [
  '/',
  '/manifest.json'
];

// When service worker is installed:
// 1. Log installation messages
// 2. Open a new cache with CACHE_NAME
// 3. Try to cache all URLs in URLS_TO_CACHE (but continue even if some fail)
// 4. Skip waiting to activate immediately
self.addEventListener('install', async (event) => {
  console.log('[SW] Installing new version');
  // console.log('Service Worker installing with version:', CACHE_NAME);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Cache what we can, but don't fail if some resources are unavailable
        return Promise.allSettled(
          URLS_TO_CACHE.map(url => 
            cache.add(url).catch(err => 
              console.log(`[SW] Failed to cache ${url}:`, err)
            )
          )
        );
      })
  );
});

// When service worker is activated:
// 1. Get all existing cache names
// 2. Delete any old caches that don't match current CACHE_NAME
// 3. Claim all open clients so the new service worker takes control immediately
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new version');
  event.waitUntil(
      Promise.all([
          // Clean old caches
          caches.keys().then(cacheNames => {
              return Promise.all(
                  cacheNames.map(cacheName => {
                      if (cacheName !== CACHE_NAME) {
                          console.log('[SW] Deleting old cache:', cacheName);
                          return caches.delete(cacheName);
                      }
                  })
              );
          }),
          // Take control immediately
          clients.claim()
      ])
  );
});

// When fetching resources:
// 1. Only handle GET requests
// 2. Try to fetch from network first
// 3. If network fails:
//    - Try to return cached version if available
//    - For navigation requests, return offline page
//    - Otherwise return a timeout response
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            if (event.request.mode === 'navigate') {
              return caches.match('/offline');
            }
            
            return new Response('', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Listen for skip waiting message:
// When received, activate the waiting service worker immediately
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
  }
});