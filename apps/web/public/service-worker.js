/**
 * Service Worker for TARA Delivery
 * Handles caching, offline support, and push notifications
 */

const CACHE_NAME = "tara-delivery-v1";
const STATIC_CACHE = "tara-static-v1";
const DYNAMIC_CACHE = "tara-dynamic-v1";
const API_CACHE = "tara-api-v1";

// Static assets to cache immediately
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/favicon.svg",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/offline.html",
];

// API routes to cache with network-first strategy
const API_ROUTES = ["/api/orders", "/api/auth", "/api/users", "/api/riders"];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log("Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting(),
    ]),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(
              (name) =>
                name !== STATIC_CACHE &&
                name !== DYNAMIC_CACHE &&
                name !== API_CACHE,
            )
            .map((name) => {
              console.log("Deleting old cache:", name);
              return caches.delete(name);
            }),
        );
      }),
      // Claim all clients immediately
      self.clients.claim(),
    ]),
  );
});

// Push notification event
self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || "/icons/icon-192x192.png",
      badge: data.badge || "/icons/badge-72x72.png",
      image: data.image,
      tag: data.tag || "tara-notification",
      requireInteraction: data.requireInteraction || false,
      actions: data.actions || [],
      data: data.data || {},
      vibrate: [200, 100, 200],
      timestamp: Date.now(),
    };

    event.waitUntil(
      self.registration.showNotification(
        data.title || "TARA DELIVERY",
        options,
      ),
    );
  } catch (error) {
    console.error("Error showing notification:", error);
  }
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const notificationData = event.notification.data;
  let url = "/";

  // Navigate based on notification type
  if (notificationData?.actionUrl) {
    url = notificationData.actionUrl;
  } else if (notificationData?.orderId) {
    url = `/customer/orders/${notificationData.orderId}`;
  } else if (
    notificationData?.type === "CHAT_MESSAGE" &&
    notificationData?.conversationId
  ) {
    url = `/customer/messages/${notificationData.conversationId}`;
  } else if (notificationData?.type === "NEW_ORDER_ALERT") {
    url = "/rider/dashboard";
  } else if (notificationData?.type?.includes("PAYMENT")) {
    url = "/customer/payments";
  } else if (notificationData?.type?.includes("ORDER")) {
    url = "/customer/orders";
  } else if (notificationData?.type === "DELIVERY_IN_PROGRESS") {
    url = "/customer/orders/track";
  } else if (notificationData?.type === "PROMOTION") {
    url = "/customer/pricing";
  }

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing tab if open
        for (const client of clientList) {
          if (client.url.includes(url) && "focus" in client) {
            return client.focus();
          }
        }
        // Open new window if not
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      }),
  );
});

// Background sync (for offline form submissions)
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-orders") {
    event.waitUntil(syncPendingOrders());
  } else if (event.tag === "sync-location") {
    event.waitUntil(syncRiderLocation());
  }
});

async function syncPendingOrders() {
  try {
    // Get pending orders from IndexedDB
    const pendingOrders = await getFromIndexedDB("pending-orders");

    for (const order of pendingOrders) {
      try {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(order),
        });

        if (response.ok) {
          await removeFromIndexedDB("pending-orders", order.id);
        }
      } catch (error) {
        console.error("Failed to sync order:", order.id, error);
      }
    }
  } catch (error) {
    console.error("Sync failed:", error);
  }
}

async function syncRiderLocation() {
  try {
    const location = await getFromIndexedDB("last-location");
    if (location) {
      await fetch("/api/riders/me/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location }),
      });
    }
  } catch (error) {
    console.error("Location sync failed:", error);
  }
}

// Fetch event - handle different strategies based on request type
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith("http")) return;

  // API requests - Network first, fallback to cache
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // Static assets - Cache first, fallback to network
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // HTML pages - Network first, fallback to cache, then offline page
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(networkFirstWithOffline(request));
    return;
  }

  // Default - Network first, fallback to cache
  event.respondWith(networkFirst(request, DYNAMIC_CACHE));
});

// Check if the URL is a static asset
function isStaticAsset(pathname) {
  const staticExtensions = [
    ".js",
    ".css",
    ".png",
    ".jpg",
    ".jpeg",
    ".svg",
    ".ico",
    ".woff",
    ".woff2",
    ".ttf",
    ".json",
  ];
  return staticExtensions.some((ext) => pathname.endsWith(ext));
}

// Network first strategy
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Cache first strategy
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    // Update cache in background
    fetch(request).then((response) => {
      if (response.ok) {
        caches.open(cacheName).then((cache) => {
          cache.put(request, response);
        });
      }
    });

    return cachedResponse;
  }

  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error("Fetch failed:", error);
    throw error;
  }
}

// Network first with offline fallback
async function networkFirstWithOffline(request) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page
    const offlineResponse = await caches.match("/offline.html");
    if (offlineResponse) {
      return offlineResponse;
    }

    return new Response("Offline", {
      status: 503,
      statusText: "Service Unavailable",
    });
  }
}

// IndexedDB helpers
async function getFromIndexedDB(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("tara-offline", 1);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const getRequest = store.getAll();

      getRequest.onsuccess = () => resolve(getRequest.result);
      getRequest.onerror = () => reject(getRequest.error);
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id" });
      }
    };
  });
}

async function removeFromIndexedDB(storeName, id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("tara-offline", 1);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const deleteRequest = store.delete(id);

      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}
