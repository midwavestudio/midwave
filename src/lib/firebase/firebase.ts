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
    console.log('Starting Firebase initialization...');
    
    if (!Object.keys(firebaseApp).length) {
      console.log('Firebase app not initialized, importing modules...');
      
      try {
        const { initializeApp } = await import('firebase/app');
        console.log('Firebase app module imported successfully');
        
        firebaseApp = initializeApp(firebaseConfig);
        console.log('Firebase app initialized successfully');
        
        const { getFirestore } = await import('firebase/firestore');
        console.log('Firestore module imported successfully');
        
        db = getFirestore(firebaseApp);
        console.log('Firestore initialized successfully');
        
        const { getAuth } = await import('firebase/auth');
        console.log('Auth module imported successfully');
        
        auth = getAuth(firebaseApp);
        console.log('Auth initialized successfully');
        
        console.log('Firebase initialized successfully');
      } catch (importError) {
        console.error('Error importing Firebase modules:', importError);
        throw importError;
      }
    } else {
      console.log('Firebase already initialized');
    }
    
    return { app: firebaseApp, auth, db };
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return { app: {} as FirebaseApp, auth: {} as Auth, db: {} as Firestore };
  }
};

// Check if Firebase is initialized
const isFirebaseInitialized = () => {
  // Server-side rendering check
  if (typeof window === 'undefined') {
    console.log('Firebase check called on server side, returning false');
    return false;
  }
  
  try {
    // Simple check if Firebase objects exist and have properties
    const authInitialized = auth && typeof auth === 'object' && Object.keys(auth).length > 0;
    const dbInitialized = db && typeof db === 'object' && Object.keys(db).length > 0;
    
    console.log('Firebase initialization check:', { authInitialized, dbInitialized });
    
    return authInitialized && dbInitialized;
  } catch (error) {
    console.error('Error checking Firebase initialization:', error);
    return false;
  }
};

// Ensure Firebase is initialized
const ensureFirebaseInitialized = async () => {
  console.log('Ensuring Firebase is initialized...');
  
  if (!isFirebaseInitialized()) {
    console.log('Firebase not initialized, initializing now...');
    try {
      await initializeFirebase();
      const initialized = isFirebaseInitialized();
      console.log('Firebase initialization completed, initialized:', initialized);
      return initialized;
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      return false;
    }
  }
  
  console.log('Firebase already initialized');
  return true;
};

export { firebaseApp, auth, db, initializeFirebase, isFirebaseInitialized, ensureFirebaseInitialized }; 