const CACHE_NAME = "schulportal-offline-v1";

const APP_FILES = [
  "./",
  "./index.html",
  "./schulportal.webmanifest",
  "./button-add.png",
  "./button-delete.png",
  "./button-download.png",
  "./button-incognito.png",
  "./button-upload.webp",
  "./calendar-icon.png",
  "./notes-icon.png",
  "./schulportal-app-icon-transparent-square.png",
  "./schulportal-app-icon-transparent.png",
  "./schulportal-app-icon.png",
  "./schulportal-header-logo.png",
  "./schulportal-icon.png",
  "./schulportal-logo-home.png",
  "./schulportal-logo-wide.png",
  "./schulportal-logo.png",
  ...Array.from({ length: 28 }, (_, index) => `./student-photos/5b/photo-${String(index + 1).padStart(2, "0")}.jpg`)
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", copy));
          return response;
        })
        .catch(() => caches.match("./index.html").then((response) => response || caches.match("./")))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      }
      return response;
    }))
  );
});
