// Progressive Web App (PWA) Service Worker for MB Gaming Store
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker...');
  event.waitUntil(self.clients.claim());
});

// Cache utility functions to persist last shown notification ID in service worker environment
async function getLastSeenId() {
  try {
    const cache = await caches.open('mb-notifications-v1');
    const response = await cache.match('/last-seen-id');
    if (response) {
      return await response.text();
    }
  } catch (e) {
    console.warn('[Service Worker] Error reading last seen ID:', e);
  }
  return null;
}

async function setLastSeenId(id) {
  try {
    const cache = await caches.open('mb-notifications-v1');
    await cache.put('/last-seen-id', new Response(id));
  } catch (e) {
    console.warn('[Service Worker] Error writing last seen ID:', e);
  }
}

let customBackendBase = '';

// Listen for backend URL changes from the React app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SET_BACKEND_URL') {
    customBackendBase = event.data.url;
    console.log('[Service Worker] Custom backend base updated to:', customBackendBase);
  }
});

// Periodically check for new notifications in the background
async function checkForNewPushNotifications() {
  try {
    const isLocalOrPreview = self.location.hostname.includes('run.app') || 
                             self.location.hostname.includes('localhost') || 
                             self.location.hostname.includes('127.0.0.1');
    const backendBase = customBackendBase || (isLocalOrPreview 
      ? '' 
      : 'https://ais-pre-ieaqsnp6gakw5nbka46zmw-976319483466.asia-southeast1.run.app');
      
    const response = await fetch(`${backendBase}/api/notifications`);
    const data = await response.json();
    if (data && data.success && data.notifications) {
      const list = data.notifications;
      if (list.length > 0) {
        // Let's inspect the latest notification
        const latest = list[0];
        const lastSeenId = await getLastSeenId();
        
        // If it's a completely new notification we haven't shown yet
        if (latest.id !== lastSeenId) {
          // If this is the first time running (no cached lastSeenId),
          // only show if it was sent in the last 24 hours to prevent historical spam.
          // If there is an existing lastSeenId, show it regardless of age to ensure delivery.
          const isFresh = lastSeenId === null 
            ? (Date.now() - latest.timestamp) < 86400000 
            : true;
            
          if (isFresh) {
            await setLastSeenId(latest.id);
            console.log('[Service Worker] Displaying background notification:', latest.title);
            
            // Trigger native notification with custom MB Gaming Store logo!
            await self.registration.showNotification(latest.title, {
              body: latest.body,
              icon: latest.iconUrl || "https://i.ibb.co/DhS7g1V/FB-IMG-1780450529119.jpg",
              badge: "https://i.ibb.co/DhS7g1V/FB-IMG-1780450529119.jpg",
              vibrate: [300, 100, 300],
              data: {
                url: latest.linkUrl || '/'
              },
              actions: [
                { action: 'open', title: 'Open Store' }
              ]
            });
          } else {
            // Just mark it as seen without showing if it's very old historical data
            await setLastSeenId(latest.id);
          }
        }
      }
    }
  } catch (error) {
    // Fail silently in service worker background
  }
}

// Polling interval in the background process
// Wakes up every 5 seconds to query the backend database for any real-time broadcasts
setInterval(() => {
  checkForNewPushNotifications();
}, 5000);

// Listen to push events if standard push notifications are integrated
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received.');
  let payload = {
    title: 'MB GAMING STORE Alert',
    body: 'New update available on MB Gaming Store!',
    icon: 'https://i.ibb.co/DhS7g1V/FB-IMG-1780450529119.jpg',
    url: '/'
  };

  if (event.data) {
    try {
      payload = event.data.json();
    } catch (e) {
      payload.body = event.data.text();
    }
  }

  const title = payload.title;
  const options = {
    body: payload.body,
    icon: payload.icon || 'https://i.ibb.co/DhS7g1V/FB-IMG-1780450529119.jpg',
    badge: 'https://i.ibb.co/DhS7g1V/FB-IMG-1780450529119.jpg',
    vibrate: [200, 100, 200],
    data: {
      url: payload.url || '/'
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handles clicking on the notification on mobile & desktop
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a tab of our app is already open, focus it
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new tab
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
