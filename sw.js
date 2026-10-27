const CACHE="encadena-v4";
const SHELL=["./","index.html","three.min.js","manifest.webmanifest","icon-192.png","icon-512.png","apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(SHELL.map(u=>fetch(new Request(u,{cache:"reload"})).then(r=>{if(r.ok)return c.put(u,r)}).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const req=e.request;if(req.method!=="GET")return;
  const url=new URL(req.url);
  const isFont=url.hostname==="fonts.googleapis.com"||url.hostname==="fonts.gstatic.com";
  if(url.origin!==location.origin&&!isFont)return;
  const isPage=req.mode==="navigate"||url.pathname.endsWith("/")||url.pathname.endsWith("index.html");
  if(isPage){
    e.respondWith((async()=>{const c=await caches.open(CACHE);
      try{const ctl=new AbortController();const t=setTimeout(()=>ctl.abort(),4000);
        const r=await fetch(new Request(url.origin+url.pathname,{cache:"no-cache",signal:ctl.signal}));clearTimeout(t);
        if(r.ok){c.put("index.html",r.clone());return r}throw new Error("bad")}
      catch(err){return (await c.match("index.html"))||(await c.match("./"))||Response.error()}})());
    return;
  }
  e.respondWith(caches.open(CACHE).then(async c=>{
    const hit=await c.match(req,{ignoreSearch:true});
    const net=fetch(req,{cache:"no-cache"}).then(r=>{if(r&&(r.ok||r.type==="opaque"))c.put(req,r.clone());return r}).catch(()=>hit);
    return hit||net;
  }));
});
