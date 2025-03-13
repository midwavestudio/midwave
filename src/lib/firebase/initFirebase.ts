'use client';

import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { Project } from './projectUtils';

// Sample project data
import { sampleProjects } from './sampleData';

/**
 * Initialize Firebase Firestore collections
 */
export const initializeFirebase = async () => {
  try {
    console.log('Initializing Firebase...');
    
    // Create projects collection in Firestore
    await initializeFirestoreProjects();
    
    // No longer need to initialize Storage folders
    
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

export default initializeFirebase; 