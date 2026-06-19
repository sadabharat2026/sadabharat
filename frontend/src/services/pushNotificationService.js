import { messaging, getToken, onMessage } from '../firebase';
import api from '../utils/api';

const VAPID_KEY = "BLZJOuqmrktdjuHnFKrjSLGMqAF0h2mVNvv5rAFEP4vuVs66ySe9gR_20QcMHCEwFsuDMu6nV5PppBmU1RlFvhE";

// Register service worker
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('FCM: Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('FCM: Service Worker registration failed:', error);
      throw error;
    }
  } else {
    throw new Error('Service Workers are not supported in this browser');
  }
}

// Request notification permission
async function requestNotificationPermission() {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('FCM: Notification permission granted');
      return true;
    } else {
      console.log('FCM: Notification permission denied');
      return false;
    }
  }
  return false;
}

// Get FCM token
async function getFCMToken() {
  try {
    const registration = await registerServiceWorker();
    await registration.update(); // Update service worker to latest
    
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });
    
    if (token) {
      console.log('FCM: Token obtained:', token);
      return token;
    } else {
      console.log('FCM: No token available.');
      return null;
    }
  } catch (error) {
    console.error('FCM: Error getting token:', error);
    throw error;
  }
}

// Register FCM token with backend
async function registerFCMToken(forceUpdate = false) {
  try {
    // Check if token already stored in localStorage to avoid redundant calls
    const savedToken = localStorage.getItem('fcm_token_web');
    if (savedToken && !forceUpdate) {
      console.log('FCM: Token already registered with backend.');
      return savedToken;
    }
    
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      throw new Error('FCM: Notification permission not granted');
    }
    
    const token = await getFCMToken();
    if (!token) {
      throw new Error('FCM: Failed to retrieve token');
    }
    
    // Save to backend using our custom interceptor api instance
    const response = await api.post('/notifications/save-fcm-token', { token });
    
    if (response.data?.success) {
      localStorage.setItem('fcm_token_web', token);
      console.log('FCM: Token registered with backend successfully.');
      return token;
    } else {
      throw new Error(response.data?.message || 'FCM: Backend registration failed');
    }
  } catch (error) {
    console.error('FCM: Error registering token:', error);
    throw error;
  }
}

let unsubscribeForeground = null;

// Setup foreground notification handler
function setupForegroundNotificationHandler(handler) {
  if (unsubscribeForeground) {
    unsubscribeForeground();
  }

  unsubscribeForeground = onMessage(messaging, (payload) => {
    console.log('FCM: Foreground message received:', payload);
    
    // Trigger standard Web notification if permission is granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: payload.notification.icon || '/logo.png',
        tag: payload.messageId || 'fcm-foreground-notification',
        data: payload.data
      });
    }
    
    // Call custom handler
    if (handler) {
      handler(payload);
    }
  });

  return unsubscribeForeground;
}

// Initialize push notifications
async function initializePushNotifications() {
  try {
    await registerServiceWorker();
    // Register token if user is already logged in (checked by looking at local tokens)
    const hasToken = localStorage.getItem('customer_token') || localStorage.getItem('vendor_token') || localStorage.getItem('vendor_auth') || localStorage.getItem('admin_token');
    if (hasToken) {
      await registerFCMToken();
    }
  } catch (error) {
    console.error('FCM: Error during initialization:', error);
  }
}

export {
  initializePushNotifications,
  registerFCMToken,
  setupForegroundNotificationHandler,
  requestNotificationPermission
};
