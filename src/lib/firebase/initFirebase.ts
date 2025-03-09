'use client';

import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { STORAGE_FOLDERS, Project } from './projectUtils';

// Sample project data
import { sampleProjects } from './sampleData';

/**
 * Initialize Firebase Storage folders and Firestore collections
 */
export const initializeFirebase = async () => {
  try {
    console.log('Initializing Firebase...');
    
    // Create projects collection in Firestore
    await initializeFirestoreProjects();
    
    // Create folders in Firebase Storage
    await initializeStorageFolders();
    
    console.log('Firebase initialization complete!');
    return true;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
};

/**
 * Initialize Firestore projects collection
 */
const initializeFirestoreProjects = async () => {
  try {
    console.log('Initializing Firestore projects collection...');
    
    // Check if projects collection already has data
    const projectsRef = collection(db, 'projects');
    const projectsSnapshot = await getDocs(projectsRef);
    
    if (!projectsSnapshot.empty) {
      console.log('Projects collection already initialized');
      return;
    }
    
    // Add sample projects to Firestore
    for (const project of sampleProjects) {
      const { id, imageUrls, ...projectData } = project;
      
      await setDoc(doc(db, 'projects', id), {
        ...projectData,
        order: sampleProjects.indexOf(project),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      console.log(`Added project: ${project.title}`);
    }
    
    console.log('Firestore projects collection initialized successfully');
  } catch (error) {
    console.error('Error initializing Firestore projects:', error);
    throw error;
  }
};

/**
 * Initialize Firebase Storage folders
 */
const initializeStorageFolders = async () => {
  try {
    console.log('Initializing Firebase Storage folders...');
    
    // Create a dummy file in each folder to ensure they exist
    const projectsRef = ref(storage, `${STORAGE_FOLDERS.PROJECTS}/.placeholder`);
    const thumbnailsRef = ref(storage, `${STORAGE_FOLDERS.THUMBNAILS}/.placeholder`);
    
    // Create a simple text file
    const placeholderContent = new Blob(['This is a placeholder file to ensure the folder exists.'], { type: 'text/plain' });
    
    await uploadBytes(projectsRef, placeholderContent);
    await uploadBytes(thumbnailsRef, placeholderContent);
    
    console.log('Firebase Storage folders initialized successfully');
  } catch (error) {
    console.error('Error initializing Storage folders:', error);
    throw error;
  }
};

export default initializeFirebase; 