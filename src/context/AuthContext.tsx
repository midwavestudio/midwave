'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define user type
type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  isAdmin?: boolean;
};

// Define auth context type
type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

// Create auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
});

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth state observer effect
  useEffect(() => {
    setLoading(false);
    return () => {};
  }, []);

  // Auth methods
  const signIn = async (email: string, password: string): Promise<void> => {
    setError(null);
    try {
      console.log('Sign in placeholder. Not implemented.');
    } catch (err) {
      setError('Failed to sign in');
      throw err;
    }
  };

  const signUp = async (email: string, password: string, displayName: string): Promise<void> => {
    setError(null);
    try {
      console.log('Sign up placeholder. Not implemented.');
    } catch (err) {
      setError('Failed to create an account');
      throw err;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      console.log('Sign out placeholder. Not implemented.');
    } catch (err) {
      setError('Failed to sign out');
      throw err;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    setError(null);
    try {
      console.log('Reset password placeholder. Not implemented.');
    } catch (err) {
      setError('Failed to reset password');
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export const useAuth = () => useContext(AuthContext); 