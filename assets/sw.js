const CACHE_NAME = 'astro-day-v2';
const APP_PREFIX = '/horoscope_by_dana';

const URLS_TO_CACHE = [
  `${APP_PREFIX}/`,
  `${APP_PREFIX}/index.html`,
  `${APP_PREFIX}/assets/manifest.webmanifest`,
  `${APP_PREFIX}/assets/icon-192.png`,
  `${APP_PREFIX}/assets/icon-512.png`
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        const responseClone = response.clone();

        if (
          response.status === 200 &&
          event.request.url.startsWith(self.location.origin + APP_PREFIX)
        ) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }

        return response;
      }).catch(() => {
        return caches.match(`${APP_PREFIX}/index.html`);
      });
    })
  );
});
