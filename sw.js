const CACHE = "belleza-de-lujo-v17";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./logo.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Para el HTML: siempre intenta traer la versión más nueva de internet primero
// (para que las actualizaciones se vean de inmediato); si no hay internet, usa la copia guardada.
// Para el resto de archivos (íconos, logo): usa la copia guardada primero, más rápido y funciona offline.
self.addEventListener("fetch", (e) => {
  const isHTML = e.request.mode === "navigate" || e.request.destination === "document";

  if (isHTML) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE).then((cache) => cache.put(e.request, resClone));
          return res;
        })
        .catch(() => caches.match(e.request).then((c) => c || caches.match("./index.html")))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cached) => {
      return (
        cached ||
        fetch(e.request)
          .then((res) => {
            const resClone = res.clone();
            caches.open(CACHE).then((cache) => cache.put(e.request, resClone));
            return res;
          })
          .catch(() => cached)
      );
    })
  );
});
