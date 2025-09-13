// Minimal service worker: makes the app installable and claim clients
self.addEventListener("install", (event) => {
self.skipWaiting();
});


self.addEventListener("activate", (event) => {
event.waitUntil(self.clients.claim());
});


// (Optional) You can add caching here if you want offline, but not required for tests.
