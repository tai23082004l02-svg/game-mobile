const CACHE='frontier-assets-v2.2';
const root=self.registration.scope;
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 const response=await fetch(new URL('assets/manifest.json',root),{cache:'no-store'});if(!response.ok)throw new Error('Asset manifest unavailable');const m=await response.json();
 const assets=['manifest.json','effects.svg','props.svg','frontier-cover.png',...Object.values(m.units).flatMap(p=>Object.values(p)),...Object.values(m.environment),...Object.keys(m.icons).map(k=>`icon-${k}.svg`),...Object.keys(m.units).map(k=>`portrait-${k}.svg`)];
 const files=['./','index.html','style.css','game.mjs','art.mjs','library.mjs','engine.mjs','app.webmanifest',...assets.map(f=>'assets/'+f)];
 await cache.addAll(files.map(f=>new URL(f,root).href));await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const k of await caches.keys())if(k.startsWith('frontier-assets-')&&k!==CACHE)await caches.delete(k);await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);if(event.request.method!=='GET'||!url.href.startsWith(root)||url.pathname.endsWith('.zip'))return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE);if(event.request.mode==='navigate'){try{const r=await fetch(event.request);if(r.ok)await cache.put(event.request,r.clone());return r;}catch{return await cache.match(event.request)||await cache.match(new URL('index.html',root));}}
 return await cache.match(event.request)||fetch(event.request);
 })());
});
