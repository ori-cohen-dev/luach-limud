// Offline support: the app shell is cached on install; pages are network-first, other files cache-first.
const CACHE='luach-v15';
const SHELL=['./','index.html','privacy.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png','fonts/frank-ruhl-libre-hebrew-500-normal.woff2','fonts/frank-ruhl-libre-hebrew-700-normal.woff2','fonts/assistant-hebrew-400-normal.woff2','fonts/assistant-hebrew-600-normal.woff2','fonts/assistant-hebrew-700-normal.woff2'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(req,c));return r}).catch(()=>caches.match(req).then(r=>r||caches.match('index.html'))));
    return;
  }
  if(url.origin===location.origin){
    e.respondWith(caches.match(req).then(hit=>{
      const net=fetch(req).then(r=>{if(r&&r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(req,c));}return r}).catch(()=>hit);
      return hit||net;
    }));
  }
});
