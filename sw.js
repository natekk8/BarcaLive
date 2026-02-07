const CACHE_NAME = 'barcalive-v4';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/overview.html',
    '/schedule.html',
    '/results.html',
    '/la-liga.html',
    '/ucl.html',
    '/css/styles_final.css',
    '/assets/css/ui-effects.css',
    '/js/app.js',
    '/js/i18n.js',
    '/js/dynamic-island.js',
    '/assets/js/main.js',
    '/assets/js/core/api.js',
    '/assets/js/core/config.js',
    '/assets/js/core/state.js',
    '/assets/js/core/utils.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Network first, fall back to cache for HTML, Cache first for assets
    const url = new URL(event.request.url);

    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    return caches.match(event.request).then(cachedResponse => {
                        return cachedResponse || fetch(event.request);
                    });
                })
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        }).catch(() => {
            // If both cache and network fail, return a basic response
            return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        })
    );
});

// Placeholder for Push Notifications
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'BarcaLive';
    const options = {
        body: data.body || 'New update!',
        icon: '/assets/favicons/android-chrome-192x192.png',
        badge: '/assets/favicons/favicon-96x96.png'
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            if (clientList.length > 0) {
                let client = clientList[0];
                for (let i = 0; i < clientList.length; i++) {
                    if (clientList[i].focused) {
                        client = clientList[i];
                    }
                }
                return client.focus();
            }
            return clients.openWindow('/');
        })
    );
});
