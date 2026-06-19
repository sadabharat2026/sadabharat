// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Firebase configuration (same as frontend)
const firebaseConfig = {
  apiKey: "AIzaSyBCbd4bNuYJ3XXdZleyBzlMIA-M1YIsXFc",
  authDomain: "sadabharat-65670.firebaseapp.com",
  projectId: "sadabharat-65670",
  storageBucket: "sadabharat-65670.firebasestorage.app",
  messagingSenderId: "751373581927",
  appId: "1:751373581927:web:b8c1f7b3765d5d1a355ec2",
  measurementId: "G-NSDT53M6Q9"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message', payload);
  
  const notificationTitle = payload.notification ? payload.notification.title : (payload.data?.title || 'New Notification');
  const notificationOptions = {
    body: payload.notification ? payload.notification.body : (payload.data?.body || 'You have a new message.'),
    icon: payload.notification ? payload.notification.icon : (payload.data?.icon || '/logo.png'),
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const data = event.notification.data;
  const urlToOpen = data?.link || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
