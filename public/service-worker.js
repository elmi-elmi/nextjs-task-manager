// const CACHE_NAME = "tasks-app-cache-v1";
// const ASSETS_TO_CACHE = [
//     "/",
//     "/favicon.ico",
//     "/_next/static/chunks/main.js",
//     "/_next/static/chunks/pages/index.js"
// ];
//
// self.addEventListener("install", (event) => {
//     console.log("[SW] Install");
//     event.waitUntil(
//         caches.open(CACHE_NAME).then(async (cache) => {
//             for (const url of ASSETS_TO_CACHE) {
//                 try {
//                     await cache.add(url);
//                 } catch (err) {
//                     console.warn("[SW] Failed to cache", url, err);
//                 }
//             }
//         })
//     );
//     self.skipWaiting();
// });
//
// self.addEventListener("activate", (event) => {
//     console.log("[SW] Activate");
//     event.waitUntil(
//         caches.keys().then((keys) =>
//             Promise.all(
//                 keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
//             )
//         )
//     );
//     self.clients.claim();
// });
//
// self.addEventListener("fetch", (event) => {
//     if (event.request.method !== "GET") return;
//
//     event.respondWith(
//         caches.match(event.request).then((cached) => {
//             if (cached) return cached;
//
//             return fetch(event.request)
//                 .then((response) => {
//                     return caches.open(CACHE_NAME).then((cache) => {
//                         cache.put(event.request, response.clone());
//                         return response;
//                     });
//                 })
//                 .catch(() => caches.match("/"))
//         })
//     );
// });
