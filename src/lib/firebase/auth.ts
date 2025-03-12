'use client';

import { createContext, useContext, useEffect, useState, ReactNode, createElement } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, initializeFirebase } from './firebase';

// Define user data interface
interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: string;
  createdAt: any;
}

// Define the auth context type
interface AuthContextType {
  user: User | null;
  currentUser: User | null; // For backward compatibility
  userData: UserData | null;
  loading: boolean;
  isLoading: boolean; // For backward compatibility
  isAdmin: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  currentUser: null,
  userData: null,
  loading: true,
  isLoading: true,
  isAdmin: false,
  error: null,
  signIn: async () => {},
  signOut: async () => {},
});

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize Firebase
  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeFirebase();
        setInitialized(true);
      } catch (err) {
        console.error('Error initializing Firebase:', err);
        setError('Failed to initialize Firebase authentication');
        setLoading(false);
      }
    };

    initialize();
  }, []);

  // Set up auth state listener
  useEffect(() => {
    if (!initialized) return;

    console.log('Setting up auth state listener...');
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      
      if (authUser) {
        try {
          // Fetch user data from Firestore
          const userDocRef = doc(db, 'users', authUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
          } else {
            console.log('User document does not exist in Firestore');
            // Create basic userData from auth user
            setUserData({
              uid: authUser.uid,
              email: authUser.email,
              displayName: authUser.displayName,
              photoURL: authUser.photoURL,
              role: 'user',
              createdAt: new Date()
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
      console.log('Auth state changed:', authUser ? 'User logged in' : 'No user');
    }, (err) => {
      console.error('Auth state change error:', err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [initialized]);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'Failed to sign in');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
    } catch (err: any) {
      console.error('Sign out error:', err);
      setError(err.message || 'Failed to sign out');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Determine if user is admin
  const isAdmin = userData?.role === 'admin';

  const contextValue = {
    user, 
    currentUser: user, // For backward compatibility
    userData, 
    loading, 
    isLoading: loading, // For backward compatibility
    isAdmin,
    error, 
    signIn, 
    signOut 
  };

  // Use createElement instead of JSX
  return createElement(AuthContext.Provider, { value: contextValue }, children);
}

// Custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
} 