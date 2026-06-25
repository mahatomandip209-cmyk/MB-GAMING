// Progressive Web App (PWA) Service Worker for MB Gaming Store
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker...');
  event.waitUntil(self.clients.claim());
});

// Set to track shown notification IDs to prevent duplicates
let displayedNotificationIds = new Set();

// Periodically check for new notifications in the background
async function checkForNewPushNotifications() {
  try {
    const isLocalOrPreview = self.location.hostname.includes('run.app') || 
                             self.location.hostname.includes('localhost') || 
                             self.location.hostname.includes('127.0.0.1');
    const backendBase = isLocalOrPreview 
      ? '' 
      : 'https://ais-pre-ieaqsnp6gakw5nbka46zmw-976319483466.asia-southeast1.run.app';
      
    const response = await fetch(`${backendBase}/api/notifications`);
    const data = await response.json();
    if (data && data.success && data.notifications) {
      const list = data.notifications;
      if (list.length > 0) {
        // Let's inspect the latest notification
        const latest = list[0];
        
        // Ensure it's very recent (sent in the last 15 minutes) so we don't spam historical messages and we handle clock drift easily
        const isRecent = (Date.now() - latest.timestamp) < 900000;
        
        if (isRecent && !displayedNotificationIds.has(latest.id)) {
          displayedNotificationIds.add(latest.id);
          
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
