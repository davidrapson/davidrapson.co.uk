---
---
'use strict';

var version = 'davidrapson.15::';

var staticCacheName = version + 'static';
var pagesCacheName = version + 'pages';
var imagesCacheName = version + 'images';

var offlinePages = [
    '/',
    '/about/'
];

var staticAssets = [
    '/public/dist/javascripts/{{ site.data.javascripts["combined.js"] }}',
    '{{ site.profile_image }}'
];

function stashInCache(cacheName, request, response) {
    caches.open(cacheName).then(function (cache) {
        return cache.put(request, response);
    });
}

function updateStaticCache() {
    // Try to fetch static top level pages - can be done after install.
    // These items must be cached for the Service Worker to complete installation
    caches.open(staticCacheName).then(function (cache) {
        return cache.addAll(offlinePages.map(url => new Request(url)));
    });

    // These items must be cached for the Service Worker to complete installation
    return caches.open(staticCacheName).then(function (cache) {
        return cache.addAll(staticAssets.map(url => new Request(url)));
    });
}

function clearOldCaches() {
    return caches.keys().then(keys => {
        return Promise.all(keys
            .filter(key => key.indexOf(version) !== 0)
            .map(key => caches.delete(key))
        );
    });
}

self.addEventListener('install', event => {
    event.waitUntil(updateStaticCache().then(function() {
        return self.skipWaiting();
    }));
});

self.addEventListener('activate', function (event) {
    event.waitUntil(clearOldCaches().then(function() {
        return self.clients.claim();
    }));
});

self.addEventListener('fetch', function (event) {
    let request = event.request;
    let url = new URL(request.url);

    if (request.url.indexOf('google-analytics') !== -1) {
        return;
    }

    // Ignore non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    /**
     * For HTML requests:
     * 1. try the network first
     * 2. fall back to the cache
     * 3. finally the offline page
     */
    if (request.headers.get('Accept').indexOf('text/html') !== -1) {
        event.respondWith(fetch(request).then(function (response) {
            // NETWORK FIRST
            // Stash a copy of this page in the pages cache
            var copy = response.clone();
            if (offlinePages.includes(url.pathname) || offlinePages.includes(url.pathname + '/')) {
                stashInCache(staticCacheName, request, copy);
            } else {
                stashInCache(pagesCacheName, request, copy);
            }

            return response;
        }).catch(function () {
            // CACHE or FALLBACK
            return caches.match(request).then(function(response) {
                return response || caches.match('/offline.html');
            });
        }));

        return;
    }

    /**
     * For non-HTML requests:
     * 1. look in the cache first
     * 2. fall back to the network
     */
    event.respondWith(caches.match(request).then(function (response) {
        // CACHE FIRST
        return response || fetch(request).then(function (response) {
            // NETWORK
            // If the request is for an image, stash a copy of this image in the images cache
            if (request.headers.get('Accept').indexOf('image') !== -1) {
                let copy = response.clone();
                stashInCache(imagesCacheName, request, copy);
            }
            return response;
        }).catch(function () {
            // OFFLINE
            // If the request is for an image, show an offline placeholder
            if (request.headers.get('Accept').indexOf('image') !== -1) {
                return new Response('<svg role="img" aria-labelledby="offline-title" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><title id="offline-title">Offline</title><g fill="none" fill-rule="evenodd"><path fill="#D8D8D8" d="M0 0h400v300H0z"/><text fill="#9B9B9B" font-family="Helvetica Neue,Arial,Helvetica,sans-serif" font-size="72" font-weight="bold"><tspan x="93" y="172">offline</tspan></text></g></svg>', {headers: {'Content-Type': 'image/svg+xml'}});
            }
        });
    }));
});
