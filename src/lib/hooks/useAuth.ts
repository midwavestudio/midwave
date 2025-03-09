'use client';

import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  resetPassword 
} from '../firebase/firebaseUtils';

export const useAuth = () => {
  const auth = useContext(AuthContext);
  
  return {
    // User state
    currentUser: auth.currentUser,
    userData: auth.userData,
    isLoading: auth.isLoading,
    isAdmin: auth.isAdmin,
    isAuthenticated: !!auth.currentUser,
    
    // Authentication methods
    register: registerUser,
    login: loginUser,
    logout: logoutUser,
    resetPassword: resetPassword,
  };
};

export default useAuth; 