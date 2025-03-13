'use client';

import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBhuB45ohHKmoZ_52xX3RDxJmkVBWzn9yw",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "midwavestudio1.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "midwavestudio1",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "midwavestudio1.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "805280308701",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:805280308701:web:bdd651f9300de5c05a6a34",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let firebaseApp: FirebaseApp = {} as FirebaseApp;
let auth: Auth = {} as Auth;
let db: Firestore = {} as Firestore;

// Initialize Firebase dynamically
const initializeFirebase = async () => {
  try {
    if (!Object.keys(firebaseApp).length) {
      const { initializeApp } = await import('firebase/app');
      firebaseApp = initializeApp(firebaseConfig);
      
      const { getFirestore } = await import('firebase/firestore');
      db = getFirestore(firebaseApp);
      
      const { getAuth } = await import('firebase/auth');
      auth = getAuth(firebaseApp);
      
      console.log('Firebase initialized successfully');
    }
    return { app: firebaseApp, auth, db };
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return { app: firebaseApp, auth, db };
  }
};

// Check if Firebase is initialized
const isFirebaseInitialized = () => {
  return Object.keys(firebaseApp).length > 0;
};

// Ensure Firebase is initialized
const ensureFirebaseInitialized = async () => {
  if (!isFirebaseInitialized()) {
    await initializeFirebase();
  }
  return isFirebaseInitialized();
};

export { firebaseApp, auth, db, initializeFirebase, isFirebaseInitialized, ensureFirebaseInitialized }; 