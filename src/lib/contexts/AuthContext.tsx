'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: string;
  createdAt: any;
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  isLoading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userData: null,
  isLoading: true,
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if we're in the browser and if auth is properly initialized
    if (typeof window === 'undefined' || !auth || !auth.onAuthStateChanged) {
      setIsLoading(false);
      return () => {};
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        
        if (user) {
          try {
            // Check if db is properly initialized
            if (!db || !db.doc) {
              setIsLoading(false);
              return;
            }
            
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              setUserData(userDoc.data() as UserData);
            } else {
              console.error('User document does not exist in Firestore');
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        } else {
          setUserData(null);
        }
        
        setIsLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up auth state listener:', error);
      setIsLoading(false);
      return () => {};
    }
  }, []);

  const isAdmin = userData?.role === 'admin';

  const value = {
    currentUser,
    userData,
    isLoading,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 