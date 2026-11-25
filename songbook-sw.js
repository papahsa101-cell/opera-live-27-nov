const prefix = 'opera-songbook-offline-';
const cacheName = prefix + '1';
const shell = new URL('./songbook.html', self.location.href);
const files = [
  shell.href,
  new URL('./songbook.webmanifest', self.location.href).href,
  new URL('./songbook-icon-192.png', self.location.href).href,
  new URL('./songbook-icon-512.png', self.location.href).href,
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    await cache.addAll(files.map(url => new Request(url, {cache:'reload'})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name=>name.startsWith(prefix) && name!==cacheName).map(name=>caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method!=='GET' || url.origin!==shell.origin) return;
  if (url.pathname===shell.pathname && request.mode==='navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(cacheName);
      const controller = new AbortController();
      const timeout = setTimeout(()=>controller.abort(),2000);
      try {
        const response = await fetch(request,{signal:controller.signal});
        if (!response.ok) throw Error('Songbook unavailable');
        await cache.put(shell.href,response.clone());
        return response;
      } catch {
        return (await cache.match(shell.href)) || Response.error();
      } finally {
        clearTimeout(timeout);
      }
    })());
  } else if (files.includes(url.href)) {
    event.respondWith(caches.match(request).then(cached=>cached || fetch(request)));
  }
});
