// EVI — zodat het telscherm ook zonder internet opent (koelcel, vriezer).
// Pagina: eerst het netwerk, anders de laatst bewaarde versie. Bestanden (js/css/plaatjes): uit de bewaarde kopie.
// Gegevens (Supabase) gaan hier niet doorheen; die bewaart de app zelf (wachtrij + kopie).
const KAST = 'evi-v1'

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== KAST).map((k) => caches.delete(k)))).then(() => self.clients.claim()))
})

self.addEventListener('fetch', (e) => {
  const r = e.request
  const url = new URL(r.url)
  if (r.method !== 'GET' || url.origin !== self.location.origin || url.searchParams.has('versiecheck')) return
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then((antw) => {
      const kopie = antw.clone()
      caches.open(KAST).then((c) => c.put('./', kopie))
      return antw
    }).catch(() => caches.match('./').then((x) => x || Response.error())))
    return
  }
  e.respondWith(caches.match(r).then((x) => x || fetch(r).then((antw) => {
    if (antw.ok) { const kopie = antw.clone(); caches.open(KAST).then((c) => c.put(r, kopie)) }
    return antw
  })))
})
