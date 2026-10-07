import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getDatabase } from 'firebase/database';
import { getAuth, signInWithCustomToken } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBCbd4bNuYJ3XXdZleyBzlMIA-M1YIsXFc",
  authDomain: "sadabharat-65670.firebaseapp.com",
  projectId: "sadabharat-65670",
  storageBucket: "sadabharat-65670.firebasestorage.app",
  messagingSenderId: "751373581927",
  appId: "1:751373581927:web:b8c1f7b3765d5d1a355ec2",
  measurementId: "G-NSDT53M6Q9",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://sadabharat-65670-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
const db = getDatabase(app);
const auth = getAuth(app);

// The chat feature (Realtime Database) requires a signed-in Firebase user —
// our own backend issues a custom token for the already-logged-in app user.
// This is cached per tab so repeated chat opens don't re-fetch a token.
let firebaseAuthPromise = null;
const ensureFirebaseAuth = async () => {
  if (auth.currentUser) return auth.currentUser;
  if (!firebaseAuthPromise) {
    firebaseAuthPromise = (async () => {
      const apiModule = await import('./utils/api');
      const api = apiModule.default;
      const res = await api.get('/firebase/custom-token');
      const token = res.data?.data?.token;
      if (!token) throw new Error('No Firebase token returned');
      const cred = await signInWithCustomToken(auth, token);
      return cred.user;
    })().catch((err) => {
      firebaseAuthPromise = null; // allow retry on next call
      throw err;
    });
  }
  return firebaseAuthPromise;
};

export { messaging, getToken, onMessage, db, auth, ensureFirebaseAuth };
