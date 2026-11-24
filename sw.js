/* IronLog 서비스 워커: 네트워크 우선 → 실패하면 캐시 (정적 파일을 바꾸면 CACHE 숫자를 올린다) */
const CACHE = 'ironlog-cache-12';
const FILES = [
  './', './index.html', './styles.css', './app.js', './exercises.js',
  './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png',
  './icons/muscles/chest.png', './icons/muscles/back.png', './icons/muscles/traps.png', './icons/muscles/lowerback.png', './icons/muscles/shoulders.png', './icons/muscles/biceps.png', './icons/muscles/triceps.png', './icons/muscles/forearms.png', './icons/muscles/abs.png', './icons/muscles/thighs.png', './icons/muscles/glutes.png', './icons/muscles/calves.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
