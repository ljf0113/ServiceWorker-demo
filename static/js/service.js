/**
 * Created by liangjianfeng on 2017/7/15.
 */

const VERSION = '1.17';

self.addEventListener('install', function(event) {
  function addCache() {
    return caches.open(VERSION)
      .then((cache) => {
        return cache.addAll(['/vue.js', '/index.js', '/index.html']);
      })
      .catch(err => console.log(err))
  }

  function skipWaiting() {
    return self.skipWaiting();
  }

  event.waitUntil(Promise.all([skipWaiting(), addCache()]).catch(err => console.log(err)))
});

self.addEventListener('activate', function(event) {
  function clientClaim() {
    return self.clients.claim();
  }

  function clearCahce() {
    return caches.keys().then((cacheNames) => {
      return Promise.all(cacheNames.map((cahceName) => {
        if (cahceName !== VERSION) {
          caches.delete(cahceName);
        }
      })).catch((err) => {
        console.log(err)
      })
    })
  }

  event.waitUntil(Promise.all([clientClaim(), clearCahce()]).catch(err => console.log(err)))
});

self.addEventListener('fetch', function(event) {
  if (/json/.test(event.request.url)) {
    return;
  }
  event.respondWith(caches.match(event.request).then(function(res) {
    if (res) return res;
    const request = event.request.clone();
    return fetch(request).then(function(response) {
      if (!response || response.status !== 200) {
        return response;
      }
      const responseClone = response.clone();
      caches.open(VERSION).then(function(cache) {
        cache.put(event.request, responseClone);
      });
      return response;
    })
  }));
});