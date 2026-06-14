const CACHE_NAME = '100citas-v22';
const SHELL = [
  './index.html',
  './manifest.json',
  './portada.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const { request } = e;
  if (request.method !== 'GET') return;

  e.respondWith(
    caches.match(request).then(cached => {
      const fetchAndUpdate = fetch(request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
        }
        return res;
      }).catch(() => cached);

      if (cached) {
        fetchAndUpdate.catch(() => {});
        return cached;
      }
      return fetchAndUpdate.catch(() => caches.match('./index.html'));
    })
  );
});
