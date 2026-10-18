/* অফলাইন ক্যাশ — আমন্ত্রণ কার্ড */
var CACHE = "einvite-v2";
var CORE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./images/cover-1200.webp",
  "./images/cover-1200.jpg",
  "./images/qr.svg",
  "./images/favicon.svg",
  "./images/apple-touch-icon.png",
  "./images/icon-192.png",
  "./images/icon-512.png",
  "./images/flag-sri-lanka.svg",
  "./images/flag-bangladesh.svg",
  "./fonts/hind-siliguri-400-bengali.woff2",
  "./fonts/hind-siliguri-400-latin.woff2",
  "./fonts/hind-siliguri-400-latin-ext.woff2",
  "./fonts/hind-siliguri-600-bengali.woff2",
  "./fonts/hind-siliguri-600-latin.woff2",
  "./fonts/hind-siliguri-700-bengali.woff2",
  "./fonts/hind-siliguri-700-latin.woff2",
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches
      .open(CACHE)
      .then(function (c) {
        return c.addAll(CORE);
      })
      .then(function () {
        return self.skipWaiting();
      }),
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches
      .keys()
      .then(function (ks) {
        return Promise.all(
          ks.map(function (k) {
            return k === CACHE ? null : caches.delete(k);
          }),
        );
      })
      .then(function () {
        return self.clients.claim();
      }),
  );
});

self.addEventListener("fetch", function (e) {
  var r = e.request;
  if (r.method !== "GET") return;

  var url = new URL(r.url);
  if (url.origin !== self.location.origin) return;

  if (r.mode === "navigate") {
    e.respondWith(
      fetch(r)
        .then(function (res) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) {
            c.put(r, copy);
          });
          return res;
        })
        .catch(function () {
          return caches.match("./index.html").then(function (m) {
            return m || caches.match("./");
          });
        }),
    );
    return;
  }

  e.respondWith(
    caches.match(r).then(function (m) {
      var net = fetch(r)
        .then(function (res) {
          if (res && res.status === 200 && res.type === "basic") {
            var copy = res.clone();
            caches.open(CACHE).then(function (c) {
              c.put(r, copy);
            });
          }
          return res;
        })
        .catch(function () {
          return m;
        });
      return m || net;
    }),
  );
});
