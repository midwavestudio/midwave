'use client';

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';

import { db, auth, initializeFirebase } from './firebase';
import { sampleProjects } from './sampleData';

// Helper function to check if Firebase is properly initialized
const isFirebaseInitialized = () => {
  // Server-side rendering check
  if (typeof window === 'undefined') return false;
  
  try {
    // Simple check if Firebase objects exist and have properties
    const authInitialized = auth && typeof auth === 'object' && Object.keys(auth).length > 0;
    const dbInitialized = db && typeof db === 'object' && Object.keys(db).length > 0;
    
    return authInitialized && dbInitialized;
  } catch (error) {
    console.error('Error checking Firebase initialization:', error);
    return false;
  }
};

// Ensure Firebase is initialized before performing operations
const ensureFirebaseInitialized = async () => {
  console.log('Checking Firebase initialization status...');
  if (!isFirebaseInitialized()) {
    console.log('Firebase not initialized, initializing now...');
    try {
      const { auth: newAuth, db: newDb } = await initializeFirebase();
      console.log('Firebase initialization result:', { success: true, auth: !!newAuth, db: !!newDb });
      return { success: true, auth: newAuth, db: newDb };
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      return { success: false, error };
    }
  }
  console.log('Firebase already initialized');
  return { success: true, auth, db };
};

// ======== Authentication Utilities ========

export const registerUser = async (email: string, password: string, displayName: string) => {
  try {
    if (!isFirebaseInitialized() || !auth.createUserWithEmailAndPassword) {
      console.error("Firebase auth not initialized");
      throw new Error("Firebase authentication not initialized");
    }
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with display name
    await updateProfile(user, {
      displayName: displayName
    });
    
    // Create user document in Firestore
    if (!db.doc) {
      console.error("Firestore not initialized");
      return user;
    }
    
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: displayName,
      role: 'client', // Default role
      createdAt: serverTimestamp()
    });
    
    return user;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    if (!isFirebaseInitialized() || !auth.signInWithEmailAndPassword) {
      console.error("Firebase auth not initialized");
      throw new Error("Firebase authentication not initialized");
    }
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    if (!isFirebaseInitialized() || !auth.signOut) {
      console.error("Firebase auth not initialized");
      throw new Error("Firebase authentication not initialized");
    }
    
    await signOut(auth);
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    if (!isFirebaseInitialized() || !auth.sendPasswordResetEmail) {
      console.error("Firebase auth not initialized");
      throw new Error("Firebase authentication not initialized");
    }
    
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    console.error("Password reset error:", error);
    throw error;
  }
};

// ======== Firestore Database Utilities ========

export const addDocument = async (collectionName: string, data: any) => {
  try {
    // Ensure Firebase is initialized
    await ensureFirebaseInitialized();
    
    // Normalize featured flag to boolean if it's a project
    if (collectionName === 'projects' && 'featured' in data) {
      const originalFeatured = data.featured;
      data.featured = data.featured === true || 
                     data.featured === 'true' || 
                     data.featured === 'True' || 
                     data.featured === '1' ||
                     data.featured === 'yes' ||
                     data.featured === 'Yes';
      console.log(`Normalized featured flag for new project: ${originalFeatured} (${typeof originalFeatured}) -> ${data.featured} (boolean)`);
    }
    
    if (!isFirebaseInitialized()) {
      console.warn('Firebase not initialized, storing in localStorage');
      
      // Store in localStorage as fallback
      const localData = {
        id: `local_${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Get existing local data for this collection
      const localCollection = localStorage.getItem(`local${collectionName}`);
      let localItems = [];
      
      if (localCollection) {
        localItems = JSON.parse(localCollection);
      }
      
      // Add new item
      localItems.push(localData);
      
      // Save back to localStorage
      localStorage.setItem(`local${collectionName}`, JSON.stringify(localItems));
      
      // Also store in a combined localProjects key for easier access
      if (collectionName === 'projects') {
        const existingProjects = localStorage.getItem('localProjects');
        let localProjects = existingProjects ? JSON.parse(existingProjects) : [];
        localProjects.push(localData);
        localStorage.setItem('localProjects', JSON.stringify(localProjects));
        console.log(`Added project to localStorage: ${localData.id}`);
        console.log('Project data:', localData);
      }
      
      return localData;
    }
    
    // Add timestamp
    const docData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Add to Firestore
    const collectionRef = collection(db, collectionName);
    const docRef = await addDoc(collectionRef, docData);
    
    console.log(`Added document to Firestore: ${collectionName}/${docRef.id}`);
    console.log('Document data:', docData);
    
    return {
      id: docRef.id,
      ...docData
    };
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    
    // Store in localStorage as fallback
    const localData = {
      id: `local_${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Normalize featured flag if it's a project
    if (collectionName === 'projects' && 'featured' in data) {
      const originalFeatured = localData.featured;
      localData.featured = localData.featured === true || 
                          localData.featured === 'true' || 
                          localData.featured === 'True' || 
                          localData.featured === '1' ||
                          localData.featured === 'yes' ||
                          localData.featured === 'Yes';
      console.log(`Normalized featured flag in localStorage fallback: ${originalFeatured} -> ${localData.featured}`);
    }
    
    // Save to localStorage
    const localCollectionKey = `local${collectionName}`;
    const existingData = localStorage.getItem(localCollectionKey);
    let localItems = existingData ? JSON.parse(existingData) : [];
    localItems.push(localData);
    localStorage.setItem(localCollectionKey, JSON.stringify(localItems));
    
    // Also store in a combined localProjects key for easier access
    if (collectionName === 'projects') {
      const existingProjects = localStorage.getItem('localProjects');
      let localProjects = existingProjects ? JSON.parse(existingProjects) : [];
      localProjects.push(localData);
      localStorage.setItem('localProjects', JSON.stringify(localProjects));
      console.log(`Added project to localStorage as fallback: ${localData.id}`);
    }
    
    return localData;
  }
};

export const getDocument = async (collectionName: string, documentId: string) => {
  try {
    // Ensure Firebase is initialized
    await ensureFirebaseInitialized();
    
    if (!isFirebaseInitialized()) {
      console.warn('Firebase not initialized, checking localStorage');
      
      // Check localStorage for the document
      if (collectionName === 'projects') {
        const localProjects = localStorage.getItem('localProjects');
        if (localProjects) {
          const projects = JSON.parse(localProjects);
          const project = projects.find((p: any) => p.id === documentId);
          if (project) {
            return project;
          }
        }
      }
      
      // Check collection-specific localStorage
      const localCollection = localStorage.getItem(`local${collectionName}`);
      if (localCollection) {
        const items = JSON.parse(localCollection);
        const item = items.find((item: any) => item.id === documentId);
        if (item) {
          return item;
        }
      }
      
      throw new Error(`Document not found in localStorage: ${collectionName}/${documentId}`);
    }
    
    // Get from Firestore
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      // Check localStorage as fallback
      if (collectionName === 'projects') {
        const localProjects = localStorage.getItem('localProjects');
        if (localProjects) {
          const projects = JSON.parse(localProjects);
          const project = projects.find((p: any) => p.id === documentId);
          if (project) {
            return project;
          }
        }
      }
      
      throw new Error(`Document not found: ${collectionName}/${documentId}`);
    }
  } catch (error) {
    console.error(`Error getting document ${collectionName}/${documentId}:`, error);
    
    // Check localStorage as fallback
    if (collectionName === 'projects') {
      const localProjects = localStorage.getItem('localProjects');
      if (localProjects) {
        const projects = JSON.parse(localProjects);
        const project = projects.find((p: any) => p.id === documentId);
        if (project) {
          return project;
        }
      }
    }
    
    throw error;
  }
};

export const updateDocument = async (collectionName: string, documentId: string, data: any) => {
  try {
    console.log(`Attempting to update document ${collectionName}/${documentId}`);
    
    // Ensure Firebase is initialized
    const initResult = await ensureFirebaseInitialized();
    console.log('Firebase initialization check result:', initResult);
    
    // Normalize featured flag to boolean if it's a project
    if (collectionName === 'projects' && 'featured' in data) {
      const originalFeatured = data.featured;
      data.featured = data.featured === true || 
                     data.featured === 'true' || 
                     data.featured === 'True' || 
                     data.featured === '1' ||
                     data.featured === 'yes' ||
                     data.featured === 'Yes';
      console.log(`Normalized featured flag for project update: ${originalFeatured} (${typeof originalFeatured}) -> ${data.featured} (boolean)`);
    }
    
    if (!isFirebaseInitialized()) {
      console.warn('Firebase not initialized, updating in localStorage');
      
      // Check if document exists in localStorage
      if (collectionName === 'projects') {
        const localProjects = localStorage.getItem('localProjects');
        if (localProjects) {
          let projects = JSON.parse(localProjects);
          
          // Find and update the project
          const index = projects.findIndex((p: any) => p.id === documentId);
          if (index !== -1) {
            // Update the document
            projects[index] = {
              ...projects[index],
              ...data,
              updatedAt: new Date().toISOString()
            };
            
            // Save back to localStorage
            localStorage.setItem('localProjects', JSON.stringify(projects));
            
            console.log(`Updated project in localStorage: ${documentId}`);
            console.log('Updated data:', data);
            
            return projects[index];
          } else {
            console.error(`Project with ID ${documentId} not found in localStorage`);
          }
        } else {
          console.error('No projects found in localStorage');
        }
      }
      
      throw new Error(`Document not found in localStorage: ${documentId}`);
    }
    
    // Add timestamp
    const updateData = {
      ...data,
      updatedAt: serverTimestamp()
    };
    
    console.log('Updating document in Firestore with data:', updateData);
    
    // Update in Firestore
    try {
      const docRef = doc(db, collectionName, documentId);
      await updateDoc(docRef, updateData);
      
      console.log(`Updated document in Firestore: ${collectionName}/${documentId}`);
      
      return {
        id: documentId,
        ...updateData
      };
    } catch (firestoreError) {
      console.error('Firestore update error:', firestoreError);
      throw firestoreError;
    }
  } catch (error) {
    console.error(`Error updating document ${collectionName}/${documentId}:`, error);
    
    // Try to update in localStorage as fallback
    if (collectionName === 'projects') {
      const localProjects = localStorage.getItem('localProjects');
      if (localProjects) {
        try {
          let projects = JSON.parse(localProjects);
          
          // Find and update the project
          const index = projects.findIndex((p: any) => p.id === documentId);
          if (index !== -1) {
            // Normalize featured flag
            if ('featured' in data) {
              const originalFeatured = data.featured;
              data.featured = data.featured === true || 
                             data.featured === 'true' || 
                             data.featured === 'True' || 
                             data.featured === '1' ||
                             data.featured === 'yes' ||
                             data.featured === 'Yes';
              console.log(`Normalized featured flag in localStorage fallback: ${originalFeatured} -> ${data.featured}`);
            }
            
            // Update the document
            projects[index] = {
              ...projects[index],
              ...data,
              updatedAt: new Date().toISOString()
            };
            
            // Save back to localStorage
            localStorage.setItem('localProjects', JSON.stringify(projects));
            
            console.log(`Updated project in localStorage as fallback: ${documentId}`);
            return projects[index];
          } else {
            console.error(`Project with ID ${documentId} not found in localStorage fallback`);
          }
        } catch (localError) {
          console.error('Error updating in localStorage:', localError);
        }
      } else {
        console.error('No projects found in localStorage fallback');
      }
    }
    
    throw error;
  }
};

export const deleteDocument = async (collectionName: string, documentId: string) => {
  try {
    // Check if it's a localStorage project (ID starts with 'local_')
    if (documentId.startsWith('local_') && collectionName === 'projects') {
      console.warn("Deleting localStorage project:", documentId);
      
      // Get existing projects from localStorage
      const existingProjects = localStorage.getItem('localProjects');
      if (!existingProjects) {
        throw new Error("Project not found in localStorage");
      }
      
      const projects = JSON.parse(existingProjects) as any[];
      const updatedProjects = projects.filter(p => p.id !== documentId);
      
      if (projects.length === updatedProjects.length) {
        throw new Error("Project not found in localStorage");
      }
      
      // Save back to localStorage
      localStorage.setItem('localProjects', JSON.stringify(updatedProjects));
      
      return true;
    }
    
    // Otherwise, use Firestore
    if (!isFirebaseInitialized()) {
      console.error("Firestore not initialized");
      throw new Error("Firestore not initialized");
    }
    
    await deleteDoc(doc(db, collectionName, documentId));
    return true;
  } catch (error) {
    console.error("Delete document error:", error);
    throw error;
  }
};

export const getCollection = async (
  collectionName: string, 
  conditions: Array<{field: string, operator: string, value: any}> = [],
  sortBy: string | null = null,
  sortDirection: 'asc' | 'desc' = 'desc',
  limitCount: number | null = null
) => {
  try {
    let q = collection(db, collectionName);
    
    // Apply filters
    if (conditions.length > 0) {
      q = query(q, ...conditions.map(condition => 
        where(condition.field, condition.operator as any, condition.value)
      ));
    }
    
    // Apply sorting
    if (sortBy) {
      q = query(q, orderBy(sortBy, sortDirection));
    }
    
    // Apply limit
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const querySnapshot = await getDocs(q);
    
    const documents: Array<{id: string} & DocumentData> = [];
    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    return documents;
  } catch (error) {
    throw error;
  }
};

// ======== Firebase Storage Utilities ========

export const uploadFile = async (path: string, file: File) => {
  // Return a placeholder URL instead
  console.log('Firebase Storage has been removed. Please use base64 encoding or external image hosting.');
  return 'https://via.placeholder.com/800x600/2a2a2a/FFFFFF/?text=External+Image+Required';
};

export const getFileURL = async (path: string) => {
  // Return a placeholder URL instead
  console.log('Firebase Storage has been removed. Please use base64 encoding or external image hosting.');
  return 'https://via.placeholder.com/800x600/2a2a2a/FFFFFF/?text=External+Image+Required';
};

export const deleteFile = async (path: string) => {
  console.log('Firebase Storage has been removed. No file deletion needed.');
  return true;
};

export const listFiles = async (path: string) => {
  console.log('Firebase Storage has been removed. No file listing available.');
  return [];
};

/**
 * Function to guide users to add their own real projects instead of sample projects
 */
export const addSampleProjectsToFirestore = async (): Promise<{ success: boolean; message: string }> => {
  return {
    success: false, 
    message: 'Sample projects have been removed from the application. Please add your real projects using the admin interface.'
  };
}; 