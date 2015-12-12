---
---
'use strict';

var version = 'v4::';
var cacheName = 'davidrapson';

var offlineFundamentals = [
    '/',
    'public/dist/stylesheets/{{ site.data.stylesheets["head.css"] }}',
    'public/dist/stylesheets/{{ site.data.stylesheets["style.css"] }}',
    'public/dist/javascripts/{{ site.data.javascripts["combined.js"] }}',
    '{{ site.profile_image }}'
];

self.addEventListener("install", function (event) {
    event.waitUntil(
        caches
            .open(version + cacheName)
            .then(function (cache) {
                return cache.addAll(offlineFundamentals);
            })
    );
});

self.addEventListener("fetch", function (event) {
    function fetchedFromNetwork(response) {
        var cacheCopy = response.clone();
        caches
            .open(version + 'pages')
            .then(function add(cache) {
                cache.put(event.request, cacheCopy);
            });
        return response;
    }

    function unableToResolve() {
        return new Response('<h1>Service Unavailable</h1>', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({'Content-Type': 'text/html'})
        });
    }

    if (event.request.method === 'GET') {
        event.respondWith(
            caches
                .match(event.request)
                .then(function (cached) {
                    var networked = fetch(event.request)
                        .then(fetchedFromNetwork, unableToResolve)
                        .catch(unableToResolve);
                    return cached || networked;
                })
        );
    }
});

self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(
                keys.filter(function (key) {
                    return !key.startsWith(version);
                }).map(function (key) {
                    return caches.delete(key);
                })
            );
        })
    );
});
