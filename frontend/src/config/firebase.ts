import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Production Firebase Configuration for CampiFa
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC_2av-s-VtEXutQt11SQVoM5880xoxdrE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "campifa-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "campifa-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "campifa-app.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "537017278757",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:537017278757:web:52c5e7a2ddf9fc465bbacc",
  measurementId: "G-547S42KLKW",
};

export const isFirebaseConfigured = (): boolean => {
  return (
    !!firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== '' &&
    firebaseConfig.apiKey !== 'YOUR_API_KEY'
  );
};

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;
const googleProvider = new GoogleAuthProvider();

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  authInstance = getAuth(app);
  dbInstance = getFirestore(app);
  storageInstance = getStorage(app);
} catch (error) {
  console.warn('Firebase initialization error:', error);
}

export const auth = authInstance;
export const db = dbInstance;
export const storage = storageInstance;
export { googleProvider };
