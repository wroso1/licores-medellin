/* Licores Medellín — service worker
   Guarda el armazón de la tienda para que abra sin señal
   y para que el navegador la ofrezca como aplicación. */

var CACHE = "lm-v4";
var SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./data.js",
  "./app.js",
  "./motion.js",
  "./manifest.json",
  "./img/icon-192.png",
  "./img/icon-512.png",
  "./img/hero-black-label.webp",
  "./logo/marca-copa.png",
  "./logo/logo-blanco.png"
];

/* Archivos que cambian seguido. GitHub Pages los manda con max-age=600
   (10 minutos), así que un fetch normal puede devolver la copia vieja
   aunque el archivo ya esté actualizado en el servidor.
   Con cache:"reload" se va siempre a la red, ignorando esa caché. */
var FRESCOS = ["index.html", "data.js", "app.js", "motion.js", "styles.css", "manifest.json"];
function esFresco(pathname) {
  if (pathname.charAt(pathname.length - 1) === "/") return true;
  return FRESCOS.indexOf(pathname.slice(pathname.lastIndexOf("/") + 1)) !== -1;
}

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(SHELL).catch(function () {});
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  var opciones = esFresco(url.pathname) ? { cache: "reload" } : undefined;

  // Navegación: red primero, y si no hay señal, lo guardado
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req, opciones).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put("./index.html", copy); });
        return res;
      }).catch(function () {
        return caches.match("./index.html", { ignoreSearch: true });
      })
    );
    return;
  }

  // Resto: red primero (así los cambios llegan de una) y caché si no hay señal
  e.respondWith(
    fetch(req, opciones).then(function (res) {
      if (res && res.ok) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req, { ignoreSearch: true });
    })
  );
});
