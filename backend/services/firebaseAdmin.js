const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');

// Build service account from environment variables (no JSON file needed)
const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  universe_domain: 'googleapis.com'
};

// Initialize only once and only if credentials are set
let firebaseApp = null;
if (process.env.FIREBASE_PROJECT_ID && getApps().length === 0) {
  try {
    firebaseApp = initializeApp({ credential: cert(serviceAccount) });
    console.log('FCM: Firebase Admin initialized successfully.');
  } catch (err) {
    console.error('FCM: Firebase Admin initialization failed:', err.message);
  }
} else if (getApps().length > 0) {
  firebaseApp = getApps()[0];
}

/**
 * Sends a push notification to multiple FCM tokens.
 * @param {string[]} tokens Array of FCM registration tokens.
 * @param {object} payload Notification details { title, body, data }
 */
async function sendPushNotification(tokens, payload) {
  if (!tokens || tokens.length === 0) {
    console.log('FCM: No tokens provided to sendPushNotification.');
    return null;
  }

  if (!firebaseApp) {
    console.warn('FCM: Firebase Admin not initialized. Skipping push notification.');
    return null;
  }

  try {
    const messaging = getMessaging(firebaseApp);
    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data
        ? Object.fromEntries(Object.entries(payload.data).map(([k, v]) => [k, String(v)]))
        : {},
      tokens: tokens,
    };

    const response = await messaging.sendEachForMulticast(message);
    console.log(`FCM: Successfully sent: ${response.successCount} messages`);
    console.log(`FCM: Failed: ${response.failureCount} messages`);
    return response;
  } catch (error) {
    console.error('FCM: Error sending push notification:', error);
    throw error;
  }
}

function getFirebaseAdminApp() {
  return firebaseApp;
}

module.exports = { sendPushNotification, getFirebaseAdminApp };
