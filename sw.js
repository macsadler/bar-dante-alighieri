/* Service worker: lets the menu open with no signal (in the bar's back room, on a bad connection).
   - Stale-while-revalidate for the site's own files: the cached copy opens instantly, and a fresh copy is fetched in the
     background for next time. So there is no version number to bump and nothing to maintain.
   - Only the site's own files are touched; the map, WhatsApp and TripAdvisor always use the network.
   - No tracking, no analytics, nothing is sent anywhere. */
const CACHE = 'bda-site-v2';
const PRECACHE = [
  './', 'index.html', 'styles.css', 'script.js', 'config.js', 'photos.js', 'menu-photos.js',
  'data/daily.json', 'data/hours.json', 'manifest.webmanifest',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
  'fonts/cormorant-garamond-latin-500-normal.woff2', 'fonts/cormorant-garamond-latin-600-normal.woff2', 'fonts/cormorant-garamond-latin-500-italic.woff2',
  'fonts/lato-latin-400-normal.woff2', 'fonts/lato-latin-700-normal.woff2'
];
const FONT_HOSTS = []; // fonts are self-hosted in /fonts, so nothing outside this site is ever cached
const INDEX = new URL('index.html', self.registration.scope).href;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.all(PRECACHE.map((u) => c.add(u).catch(() => {})))) // a missing file never blocks installing
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  if (!sameOrigin && FONT_HOSTS.indexOf(url.hostname) < 0) return;
  const isNav = req.mode === 'navigate';
  // Files the page asks for with cache:'no-store' (data/today.json) must be fresh: network first, cached copy only if offline.
  if (req.cache === 'no-store' || req.cache === 'reload') {
    const k = new Request(req.url); // plain request as the cache key
    event.respondWith(
      fetch(req).then((res) => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(k, copy)).catch(() => {}); } // clone BEFORE the page reads it
        return res;
      }).catch(() => caches.match(k).then((hit) => hit || Response.error()))
    );
    return;
  }
  // every page address (?table=7, ?cat=panini, #carta ...) is the same single-page site
  const key = isNav ? INDEX : req;
  event.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(key).then((cached) => {
        const network = fetch(req).then((res) => {
          if (res && (res.ok || res.type === 'opaque')) cache.put(key, res.clone());
          return res;
        });
        if (cached) { network.catch(() => {}); return cached; } // fresh copy arrives in the background
        return network.catch(() => (isNav ? cache.match(INDEX) : Response.error()));
      })
    )
  );
});
