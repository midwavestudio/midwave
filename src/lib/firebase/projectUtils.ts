'use client';

import { collection, getDocs, doc, getDoc, query, where, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import { db, storage } from './firebase';

// Firebase Storage folder structure
export const STORAGE_FOLDERS = {
  PROJECTS: 'projects',
  THUMBNAILS: 'thumbnails',
};

// Project interface
export interface Project {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  fullDescription?: string;
  client?: string;
  date?: string;
  services?: string[];
  technologies?: string[];
  thumbnailUrl: string; // Can be a URL or base64 encoded image
  imageUrls: string[]; // Can be URLs or base64 encoded images
  url?: string; // External URL to the live project
  featured?: boolean;
  order?: number;
}

/**
 * Create the necessary folders in Firebase Storage
 */
export const createStorageFolders = async () => {
  try {
    // We don't actually need to create folders in Firebase Storage
    // They are automatically created when files are uploaded
    console.log('Firebase Storage folders will be created automatically when files are uploaded');
    return true;
  } catch (error) {
    console.error('Error creating storage folders:', error);
    throw error;
  }
};

/**
 * Upload a project image to Firebase Storage
 */
export const uploadProjectImage = async (
  projectId: string, 
  file: File, 
  isThumbnail: boolean = false
): Promise<string> => {
  try {
    const folder = isThumbnail ? STORAGE_FOLDERS.THUMBNAILS : STORAGE_FOLDERS.PROJECTS;
    const path = `${folder}/${projectId}/${file.name}`;
    const storageRef = ref(storage, path);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading project image:', error);
    throw error;
  }
};

/**
 * Get all project images for a specific project
 */
export const getProjectImages = async (projectId: string): Promise<string[]> => {
  try {
    const storageRef = ref(storage, `${STORAGE_FOLDERS.PROJECTS}/${projectId}`);
    const result = await listAll(storageRef);
    
    const urls = await Promise.all(
      result.items.map(async (itemRef) => {
        return getDownloadURL(itemRef);
      })
    );
    
    return urls;
  } catch (error) {
    console.error('Error getting project images:', error);
    return [];
  }
};

/**
 * Get all projects from Firestore
 */
export const getProjects = async (): Promise<Project[]> => {
  try {
    console.log('Getting all projects...');
    
    // Initialize an array to store all projects
    let allProjects: Project[] = [];
    
    // First, try to get projects from localStorage
    if (typeof window !== 'undefined') {
      const localProjects = localStorage.getItem('localProjects');
      if (localProjects) {
        try {
          const parsedProjects = JSON.parse(localProjects) as Project[];
          console.log('Found projects in localStorage:', parsedProjects.length);
          
          // Add localStorage projects to the array
          allProjects = [...parsedProjects];
        } catch (error) {
          console.error('Error parsing localStorage projects:', error);
        }
      }
    }
    
    // Then, try to get projects from Firestore
    try {
      // Import Firebase modules dynamically
      const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
      const { db } = await import('./firebase');
      
      // Check if Firestore is available
      if (db && typeof db === 'object' && Object.keys(db).length > 0) {
        console.log('Fetching projects from Firestore...');
        
        const projectsRef = collection(db, 'projects');
        const projectsQuery = query(projectsRef, orderBy('order', 'asc'));
        const snapshot = await getDocs(projectsQuery);
        
        if (!snapshot.empty) {
          console.log('Found projects in Firestore:', snapshot.docs.length);
          
          // Process Firestore projects
          for (const doc of snapshot.docs) {
            const projectData = doc.data() as Omit<Project, 'id'>;
            
            // Create a valid project object
            const project: Project = {
              id: doc.id,
              title: projectData.title || '',
              slug: projectData.slug || '',
              category: projectData.category || '',
              description: projectData.description || '',
              fullDescription: projectData.fullDescription || '',
              client: projectData.client || '',
              date: projectData.date || '',
              services: Array.isArray(projectData.services) ? projectData.services : [],
              technologies: Array.isArray(projectData.technologies) ? projectData.technologies : [],
              thumbnailUrl: projectData.thumbnailUrl || '',
              imageUrls: Array.isArray(projectData.imageUrls) ? projectData.imageUrls : [],
              url: projectData.url || '',
              featured: !!projectData.featured,
              order: projectData.order || 0
            };
            
            // Add to allProjects if not already there (avoid duplicates)
            if (!allProjects.some(p => p.id === project.id)) {
              allProjects.push(project);
            }
          }
        }
      }
    } catch (firestoreError) {
      console.error('Error fetching from Firestore:', firestoreError);
    }
    
    // If we have projects, return them
    if (allProjects.length > 0) {
      console.log('Returning total projects:', allProjects.length);
      
      // Sort by order
      return allProjects.sort((a, b) => {
        const orderA = a.order || 0;
        const orderB = b.order || 0;
        return orderA - orderB;
      });
    }
    
    // If no projects found, use sample projects as fallback
    console.log('No projects found, using sample projects');
    return sampleProjects;
  } catch (error) {
    console.error('Error getting projects:', error);
    
    // If all else fails, return sample projects
    return sampleProjects;
  }
};

/**
 * Get a specific project by slug
 */
export const getProjectBySlug = async (slug: string): Promise<Project | null> => {
  try {
    const projectsRef = collection(db, 'projects');
    const projectQuery = query(projectsRef, where('slug', '==', slug));
    const snapshot = await getDocs(projectQuery);
    
    if (snapshot.empty) {
      return null;
    }
    
    const projectDoc = snapshot.docs[0];
    const projectData = projectDoc.data() as Omit<Project, 'id'>;
    
    // Only try to get images from Storage if they're not already in the document
    let imageUrls = Array.isArray(projectData.imageUrls) ? projectData.imageUrls : [];
    if (imageUrls.length === 0) {
      try {
        // Try to get images from Firebase Storage
        imageUrls = await getProjectImages(projectDoc.id);
      } catch (error) {
        console.warn(`Could not get images for project ${projectDoc.id} from Storage:`, error);
        // Continue with empty imageUrls array
      }
    }
    
    // Filter out any invalid image URLs
    imageUrls = imageUrls.filter(url => url && typeof url === 'string');
    
    return {
      id: projectDoc.id,
      ...projectData,
      imageUrls,
      thumbnailUrl: projectData.thumbnailUrl || ''
    };
  } catch (error) {
    console.error('Error getting project by slug:', error);
    return null;
  }
};

/**
 * Get featured projects
 */
export const getFeaturedProjects = async (): Promise<Project[]> => {
  try {
    console.log('Getting featured projects...');
    
    // First get all projects (which includes localStorage and Firestore projects)
    const allProjects = await getProjects();
    console.log('Total projects retrieved:', allProjects.length);
    
    // Filter for featured projects
    const featuredProjects = allProjects.filter(project => project.featured);
    console.log('Featured projects found:', featuredProjects.length);
    
    // If we have featured projects, return them
    if (featuredProjects.length > 0) {
      return featuredProjects;
    }
    
    // If no featured projects found, use sample featured projects as fallback
    console.log('No featured projects found, using sample featured projects');
    return sampleProjects.filter(project => project.featured);
  } catch (error) {
    console.error('Error getting featured projects:', error);
    
    // If all else fails, return sample featured projects
    return sampleProjects.filter(project => project.featured);
  }
}; 