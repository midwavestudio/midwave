'use client';

import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';

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
let storage: FirebaseStorage = {} as FirebaseStorage;

// Initialize Firebase lazily to avoid SSR issues
const initializeFirebase = async () => {
  try {
    console.log('Initializing Firebase...');
    
    // Dynamically import Firebase modules
    const { initializeApp, getApps } = await import('firebase/app');
    const { getAuth } = await import('firebase/auth');
    const { getFirestore } = await import('firebase/firestore');
    const { getStorage } = await import('firebase/storage');

    console.log('Firebase modules imported successfully');
    console.log('Firebase config:', JSON.stringify({
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      // Omit sensitive values
    }));

    // Check if Firebase is already initialized
    if (getApps().length === 0) {
      // Initialize Firebase
      firebaseApp = initializeApp(firebaseConfig);
      console.log("Firebase initialized successfully");
    } else {
      // Use existing Firebase app
      firebaseApp = getApps()[0];
      console.log("Using existing Firebase app");
    }
    
    // Initialize Firebase services
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
    storage = getStorage(firebaseApp);
    
    console.log("Firebase services initialized successfully");
    return { auth, db, storage };
  } catch (error) {
    console.error("Firebase initialization error:", error);
    return { auth, db, storage };
  }
};

// Only initialize Firebase if we're in the browser
if (typeof window !== 'undefined') {
  // Initialize Firebase immediately but don't block rendering
  initializeFirebase().catch(error => {
    console.error("Failed to initialize Firebase:", error);
  });
}

export { auth, db, storage, initializeFirebase }; 