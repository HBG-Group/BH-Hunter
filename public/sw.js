/* Meino's service worker is intentionally minimal: it enables a valid PWA
   install without caching private listing or account responses. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
