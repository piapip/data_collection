const receivePushNotification = (event) => {
  console.log('[Service Worker] Push Received.');

  const { title, text, data, tag } = event.data.json();

  const options = {
    data: data,
    body: text,
    vibrate: [200, 100, 200],
    tag: tag,
    badge: 'https://spyna.it/icons/favicon.ico',
    actions: [{ action: 'Detail', title: 'View', icon: 'https://via.placeholder.com/128/ff0000' }]
  };

  event.waitUntil(self.registration.showNotification(title, options));
}

const openPushNotification = (event) => {
  console.log('[Service Worker] Notification click Received.', event.notification.data);

  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data));
}

self.addEventListener('push', receivePushNotification);
self.addEventListener('notificationclick', openPushNotification);