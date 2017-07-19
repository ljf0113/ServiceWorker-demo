/**
 * Created by liangjianfeng on 2017/7/15.
 */

const VERSION = '1.28';

self.addEventListener('install', function(event) {
  function addCache() {
    return caches.open(VERSION)
      .then((cache) => {
        //预加载资源 本地跑服务器会加载两次 略坑 线上未知 不知道有cahce的情况下会不会读
        return cache.addAll(['/vue.js', '/index.js', '/index.html']);
      })
      .catch(err => console.log(err))
  }

  //直接更新到最新，新的serviceworker接管页面
  function skipWaiting() {
    return self.skipWaiting();
  }

  //waitUntil 即等待promise执行完 不报错之后再触发事件
  event.waitUntil(Promise.all([skipWaiting(), addCache()]).catch(err => console.log(err)))
});

self.addEventListener('activate', function(event) {
  //首次加载才用到 目的是不用reload serviceworker接管页面 马上可监听fetch等事件
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
        console.log(err);
      })
    })
  }

  //与控制页面通讯 重载页面
  function sendMessagerToRload() {
    //获得所有控制的页面 进行通讯
    return self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage('reload');
      })
    })
  }

  event.waitUntil(Promise.all([clientClaim(), clearCahce(), sendMessagerToRload()]).catch(err => console.log(err)))
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
