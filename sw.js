// Service worker de AURA: guarda la app completa para uso sin conexión.
// Al publicar cambios, incremente VERSION para que los dispositivos descarguen la nueva versión.
const VERSION = "aura-v6";
const ARCHIVOS = [
  "./",
  "./index.html",
  "./acero.html",
  "./hormigon.html",
  "./madera.html",
  "./espectros.html",
  "./memo.js",
  "./manifest.webmanifest",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Red primero (para recibir actualizaciones) y caché como respaldo sin conexión.
self.addEventListener("fetch", (e) => {
  const req = e.request;
  // Propios y KaTeX (cdnjs) para que las ecuaciones también se vean sin conexión.
  const url = new URL(req.url);
  if (req.method !== "GET" || (url.origin !== self.location.origin && url.hostname !== "cdnjs.cloudflare.com")) return;
  e.respondWith(
    fetch(req)
      .then((resp) => {
        if (resp.ok) {
          const copia = resp.clone();
          caches.open(VERSION).then((c) => c.put(req, copia));
        }
        return resp;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match("./index.html")))
  );
});
