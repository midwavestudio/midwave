'use client';

import { useState, useEffect } from 'react';
import { auth, db, storage } from '@/lib/firebase/firebase';

const FirebaseStatus = () => {
  const [status, setStatus] = useState<'checking' | 'initialized' | 'error'>('checking');
  const [details, setDetails] = useState<string>('');

  useEffect(() => {
    checkFirebaseStatus();
  }, []);

  const checkFirebaseStatus = () => {
    try {
      // Check if we're in the browser
      if (typeof window === 'undefined') {
        setStatus('error');
        setDetails('Cannot check Firebase status on server-side');
        return;
      }

      // Simple check if Firebase objects exist and have properties
      const authInitialized = auth && typeof auth === 'object' && Object.keys(auth).length > 0;
      const dbInitialized = db && typeof db === 'object' && Object.keys(db).length > 0;
      const storageInitialized = storage && typeof storage === 'object' && Object.keys(storage).length > 0;
      
      if (authInitialized && dbInitialized && storageInitialized) {
        setStatus('initialized');
        setDetails('Firebase is properly initialized');
      } else {
        setStatus('error');
        let errorDetails = 'Firebase initialization issues';
        setDetails(errorDetails);
      }
    } catch (error) {
      setStatus('error');
      setDetails('Error checking Firebase status');
    }
  };

  return (
    <div className={`text-xs px-3 py-1 rounded-full inline-flex items-center ${
      status === 'checking' ? 'bg-blue-900/20 text-blue-300' :
      status === 'initialized' ? 'bg-green-900/20 text-green-300' :
      'bg-red-900/20 text-red-300'
    }`}>
      <span className={`w-2 h-2 rounded-full mr-2 ${
        status === 'checking' ? 'bg-blue-400' :
        status === 'initialized' ? 'bg-green-400' :
        'bg-red-400'
      }`}></span>
      {status === 'checking' ? 'Checking Firebase...' :
       status === 'initialized' ? 'Firebase Connected' :
       'Firebase Error'}
    </div>
  );
};

export default FirebaseStatus; 