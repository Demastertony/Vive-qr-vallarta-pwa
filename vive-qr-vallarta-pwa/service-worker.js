// PWA cache + update (HTML network-first, assets cache-first)
const CACHE = 'vive-qr-v9';

const ASSETS = [
  '/', '/index.html', '/styles.css', '/app.js',
  '/assets/icons/icon-192.png', '/assets/icons/icon-512.png',
  '/assets/assets/iu/logo-viveqr.png',
  '/assets/assets/iu/Pin.png',
  '/assets/assets/iu/Turista.png',
  '/assets/assets/iu/Antros.png',
  '/assets/assets/iu/Hoteles.png',
  '/assets/assets/iu/Restaurantes.png',
  '/manifest.webmanifest'
];

// Precache básico
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activar y limpiar versiones viejas
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE && caches.delete(k))))
  );
  self.clients.claim();
});

// Navegaciones (HTML): network-first; assets: cache-first
self.addEventListener('fetch', (e) => {
  const req = e.request;

  // HTML navegaciones
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put('/index.html', copy));
        return res;
      }).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Assets estáticos
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
