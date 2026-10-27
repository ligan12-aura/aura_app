// Service worker de AURA: guarda la app completa para uso sin conexión.
// Al publicar cambios, incremente VERSION para que los dispositivos descarguen la nueva versión.
const VERSION = "aura-v10";
const ARCHIVOS = [
  "./",
  "./index.html",
  "./acero.html",
  "./hormigon.html",
  "./madera.html",
  "./espectros.html",
  "./vial.html",
  "./memo.js",
  "./manifest.webmanifest",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
];
// KaTeX (ecuaciones de la memoria). Las fuentes .woff2 se guardan al usarse por primera vez.
const KATEX = [
  "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) =>
    c.addAll(ARCHIVOS).then(() =>
      // Si el CDN no responde, la app igual se instala; KaTeX se guardará en el próximo uso con conexión.
      Promise.all(KATEX.map((u) => c.add(new Request(u, { mode: "cors" })).catch(() => {}))))
  ).then(() => self.skipWaiting()));
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
          e.waitUntil(caches.open(VERSION).then((c) => c.put(req, copia)));
        }
        return resp;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((r) =>
        r || (req.mode === "navigate" ? caches.match("./index.html") : Response.error())))
  );
});
