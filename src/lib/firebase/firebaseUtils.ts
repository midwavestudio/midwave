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
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  listAll
} from 'firebase/storage';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';

import { db, auth, storage, initializeFirebase } from './firebase';
import { sampleProjects } from './sampleData';

// Helper function to check if Firebase is properly initialized
const isFirebaseInitialized = () => {
  // Server-side rendering check
  if (typeof window === 'undefined') return false;
  
  try {
    // Simple check if Firebase objects exist and have properties
    const authInitialized = auth && typeof auth === 'object' && Object.keys(auth).length > 0;
    const dbInitialized = db && typeof db === 'object' && Object.keys(db).length > 0;
    const storageInitialized = storage && typeof storage === 'object' && Object.keys(storage).length > 0;
    
    return authInitialized && dbInitialized && storageInitialized;
  } catch (error) {
    console.error('Error checking Firebase initialization:', error);
    return false;
  }
};

// Ensure Firebase is initialized before performing operations
const ensureFirebaseInitialized = async () => {
  if (!isFirebaseInitialized()) {
    console.log('Firebase not initialized, initializing now...');
    try {
      const { auth: newAuth, db: newDb, storage: newStorage } = await initializeFirebase();
      return { success: true, auth: newAuth, db: newDb, storage: newStorage };
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      return { success: false, error };
    }
  }
  return { success: true, auth, db, storage };
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
    // Ensure Firebase is initialized
    await ensureFirebaseInitialized();
    
    if (!isFirebaseInitialized()) {
      console.warn('Firebase not initialized, updating in localStorage');
      
      // Update in localStorage
      if (collectionName === 'projects') {
        const localProjects = localStorage.getItem('localProjects');
        if (localProjects) {
          const projects = JSON.parse(localProjects);
          const projectIndex = projects.findIndex((p: any) => p.id === documentId);
          
          if (projectIndex !== -1) {
            // Update the project
            projects[projectIndex] = {
              ...projects[projectIndex],
              ...data,
              updatedAt: new Date().toISOString()
            };
            
            // Save back to localStorage
            localStorage.setItem('localProjects', JSON.stringify(projects));
            return projects[projectIndex];
          }
        }
      }
      
      // Update in collection-specific localStorage
      const localCollectionKey = `local${collectionName}`;
      const localCollection = localStorage.getItem(localCollectionKey);
      if (localCollection) {
        const items = JSON.parse(localCollection);
        const itemIndex = items.findIndex((item: any) => item.id === documentId);
        
        if (itemIndex !== -1) {
          // Update the item
          items[itemIndex] = {
            ...items[itemIndex],
            ...data,
            updatedAt: new Date().toISOString()
          };
          
          // Save back to localStorage
          localStorage.setItem(localCollectionKey, JSON.stringify(items));
          return items[itemIndex];
        }
      }
      
      throw new Error(`Document not found in localStorage: ${collectionName}/${documentId}`);
    }
    
    // Add timestamp
    const updateData = {
      ...data,
      updatedAt: serverTimestamp()
    };
    
    // Update in Firestore
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, updateData);
    
    // Get the updated document
    const updatedDoc = await getDoc(docRef);
    return {
      id: updatedDoc.id,
      ...updatedDoc.data()
    };
  } catch (error) {
    console.error(`Error updating document ${collectionName}/${documentId}:`, error);
    
    // Try to update in localStorage as fallback
    if (collectionName === 'projects') {
      const localProjects = localStorage.getItem('localProjects');
      if (localProjects) {
        const projects = JSON.parse(localProjects);
        const projectIndex = projects.findIndex((p: any) => p.id === documentId);
        
        if (projectIndex !== -1) {
          // Update the project
          projects[projectIndex] = {
            ...projects[projectIndex],
            ...data,
            updatedAt: new Date().toISOString()
          };
          
          // Save back to localStorage
          localStorage.setItem('localProjects', JSON.stringify(projects));
          return projects[projectIndex];
        }
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
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    throw error;
  }
};

export const getFileURL = async (path: string) => {
  try {
    const storageRef = ref(storage, path);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    throw error;
  }
};

export const deleteFile = async (path: string) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    throw error;
  }
};

export const listFiles = async (path: string) => {
  try {
    const storageRef = ref(storage, path);
    const res = await listAll(storageRef);
    
    const fileURLs = await Promise.all(
      res.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return {
          name: itemRef.name,
          url,
          fullPath: itemRef.fullPath
        };
      })
    );
    
    return fileURLs;
  } catch (error) {
    throw error;
  }
};

/**
 * Add sample projects to Firestore if they don't already exist
 */
export const addSampleProjectsToFirestore = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Check if projects already exist
    const projectsRef = collection(db, 'projects');
    const snapshot = await getDocs(projectsRef);
    
    if (!snapshot.empty) {
      return { 
        success: true, 
        message: `${snapshot.size} projects already exist in Firestore. No sample projects were added.` 
      };
    }
    
    // Add sample projects to Firestore
    const addedProjects = [];
    
    for (const project of sampleProjects) {
      // Check if project with this slug already exists
      const slugQuery = query(projectsRef, where('slug', '==', project.slug));
      const slugSnapshot = await getDocs(slugQuery);
      
      if (slugSnapshot.empty) {
        // Remove the id field as Firestore will generate one
        const { id, imageUrls, ...projectData } = project;
        
        // Add order field for sorting
        const projectWithOrder = {
          ...projectData,
          order: addedProjects.length + 1,
        };
        
        const docRef = await addDoc(projectsRef, projectWithOrder);
        addedProjects.push(docRef.id);
      }
    }
    
    if (addedProjects.length > 0) {
      return { 
        success: true, 
        message: `Successfully added ${addedProjects.length} sample projects to Firestore.` 
      };
    } else {
      return { 
        success: true, 
        message: 'No new sample projects were added to Firestore.' 
      };
    }
  } catch (error) {
    console.error('Error adding sample projects to Firestore:', error);
    return { 
      success: false, 
      message: `Error adding sample projects to Firestore: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}; 