
// Simple offline-first cache
const CACHE = 'vive-qr-v4';

const ASSETS = [
  '/', '/index.html', '/styles.css', '/app.js',
  '/assets/icons/icon-192.png', '/assets/icons/icon-512.png',
  '/manifest.webmanifest'
];
self.addEventListener('fetch', (e) => {
  const req = e.request;

  // Navegaciones (HTML): network-first
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // CSS/JS/íconos: cache-first
  e.respondWith(
    caches.match(req).then(cached => cached ||
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match('/index.html'))
    )
  );
});
