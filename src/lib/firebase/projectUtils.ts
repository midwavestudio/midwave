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
          
          // Normalize featured flag to boolean
          const normalizedProjects = parsedProjects.map(project => {
            const normalizedFeatured = project.featured === true || 
                                      (typeof project.featured === 'string' && 
                                       (project.featured.toLowerCase() === 'true' || 
                                        project.featured === '1'));
            
            console.log(`Normalizing localStorage project "${project.title}": ${project.featured} (${typeof project.featured}) -> ${normalizedFeatured}`);
            
            return {
              ...project,
              featured: normalizedFeatured
            };
          });
          
          console.log('Normalized localStorage projects featured flags');
          
          // Add localStorage projects to the array
          allProjects = [...normalizedProjects];
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
            
            // Normalize featured flag to boolean
            const normalizedFeatured = projectData.featured === true || 
                                      (typeof projectData.featured === 'string' && 
                                       (projectData.featured.toLowerCase() === 'true' || 
                                        projectData.featured === '1'));
            
            console.log(`Normalizing Firestore project "${projectData.title}": ${projectData.featured} (${typeof projectData.featured}) -> ${normalizedFeatured}`);
            
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
              featured: normalizedFeatured,
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
    
    // Return the projects we found, even if the array is empty
    console.log('Returning total projects:', allProjects.length);
    
    // Sort by order
    return allProjects.sort((a, b) => {
      const orderA = a.order || 0;
      const orderB = b.order || 0;
      return orderA - orderB;
    });
  } catch (error) {
    console.error('Error getting projects:', error);
    
    // Return an empty array if there was an error
    return [];
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
 * Retrieves featured projects from localStorage or Firestore
 * @param includeTestProjects Whether to include test projects in the results (false by default)
 * @returns Array of featured projects
 */
export const getFeaturedProjects = async (includeTestProjects: boolean = false): Promise<Project[]> => {
  console.log(`Getting featured projects. Include test projects: ${includeTestProjects}`);
  
  try {
    // First try to get all projects
    const allProjects = await getProjects();
    console.log(`Retrieved ${allProjects.length} total projects`);
    
    // Filter for featured projects with robust type checking
    const featuredProjects = allProjects.filter(project => {
      // Skip test projects unless specifically included
      if (!includeTestProjects && project.title?.toLowerCase().includes('test')) {
        console.log(`Skipping test project: ${project.title}`);
        return false;
      }
      
      // Log the featured status for debugging
      console.log(`Project "${project.title}" featured status: ${project.featured} (${typeof project.featured})`);
      
      // Check different possible types of the featured flag
      return (
        project.featured === true || 
        project.featured === 'true' || 
        project.featured === 1 || 
        project.featured === '1'
      );
    });
    
    const featuredCount = featuredProjects.length;
    console.log(`Found ${featuredCount} featured projects`);
    
    // If no featured projects found, return default ones
    if (featuredCount === 0) {
      console.warn('No featured projects found, returning default projects');
      return getDefaultFeaturedProjects();
    }
    
    return featuredProjects;
  } catch (error) {
    console.error('Error in getFeaturedProjects:', error);
    // Return default projects in case of error
    return getDefaultFeaturedProjects();
  }
};

/**
 * Provides default featured projects when no projects are found
 * This ensures the site always displays meaningful content
 */
const getDefaultFeaturedProjects = (): Project[] => {
  return [
    {
      id: 'default-1',
      title: 'Marketing Agency Website',
      slug: 'marketing-agency-website',
      category: 'Web Development',
      description: 'A modern website for a digital marketing agency with custom animations and responsive design.',
      thumbnailUrl: 'https://via.placeholder.com/800x600/1a1a1a/FFFFFF/?text=Marketing+Agency',
      imageUrls: ['https://via.placeholder.com/1200x800/1a1a1a/FFFFFF/?text=Marketing+Agency'],
      featured: true,
      createdAt: new Date().toISOString(),
      client: 'XYZ Digital Agency',
      services: ['Web Design', 'Frontend Development', 'CMS Integration'],
      technologies: ['React', 'Next.js', 'Tailwind CSS'],
      order: 1
    },
    {
      id: 'default-2',
      title: 'E-commerce Platform',
      slug: 'ecommerce-platform',
      category: 'E-commerce',
      description: 'Full-featured e-commerce platform with product management, cart functionality, and payment integration.',
      thumbnailUrl: 'https://via.placeholder.com/800x600/1a1a1a/FFFFFF/?text=E-commerce+Platform',
      imageUrls: ['https://via.placeholder.com/1200x800/1a1a1a/FFFFFF/?text=E-commerce+Platform'],
      featured: true,
      createdAt: new Date().toISOString(),
      client: 'Fashion Retailer',
      services: ['Web Development', 'Payment Integration', 'UX Design'],
      technologies: ['Next.js', 'Stripe', 'Firebase'],
      order: 2
    },
    {
      id: 'default-3',
      title: 'Mobile App Design',
      slug: 'mobile-app-design',
      category: 'UI/UX Design',
      description: 'Intuitive and elegant mobile application interface design for a fitness tracking app.',
      thumbnailUrl: 'https://via.placeholder.com/800x600/1a1a1a/FFFFFF/?text=Mobile+App+Design',
      imageUrls: ['https://via.placeholder.com/1200x800/1a1a1a/FFFFFF/?text=Mobile+App+Design'],
      featured: true,
      createdAt: new Date().toISOString(),
      client: 'FitTrack',
      services: ['UI Design', 'UX Research', 'Prototyping'],
      technologies: ['Figma', 'Adobe XD', 'Protopie'],
      order: 3
    }
  ];
};

/**
 * Creates a test featured project in localStorage
 * This function only works in development mode
 * @returns The created test project or null if creation failed
 */
export const createTestFeaturedProject = (): Project | null => {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV === 'production') {
      console.error('Test projects cannot be created in production mode');
      return null;
    }
    
    // Check if running on client
    if (typeof window === 'undefined') {
      console.error('Cannot create test project on server - no localStorage available');
      return null;
    }
    
    console.log('Creating test featured project...');
    
    // Get existing projects from localStorage
    let projects: Project[] = [];
    try {
      const existingProjects = localStorage.getItem('localProjects');
      projects = existingProjects ? JSON.parse(existingProjects) : [];
      console.log(`Found ${projects.length} existing projects in localStorage`);
    } catch (parseError) {
      console.error('Error parsing existing projects:', parseError);
      projects = [];
    }
    
    // Create a unique ID for the test project
    const id = `test-${Date.now()}`;
    
    // Create the test project with featured flag as a boolean
    const testProject: Project = {
      id,
      title: `Test Project ${Math.floor(Math.random() * 1000)}`,
      description: 'This is a test project created for debugging purposes.',
      category: 'Test',
      thumbnailUrl: 'https://via.placeholder.com/600x400/2a2a2a/FFFFFF/?text=Test+Project',
      featured: true, // Explicitly set as boolean true
      createdAt: new Date().toISOString(),
      slug: `test-project-${Date.now()}`,
      imageUrls: []
    };
    
    // Add the test project to localStorage
    projects.push(testProject);
    
    try {
      localStorage.setItem('localProjects', JSON.stringify(projects));
      
      // Verify that the project was saved correctly
      const updatedProjects = localStorage.getItem('localProjects');
      const parsedProjects = updatedProjects ? JSON.parse(updatedProjects) : [];
      const totalProjects = parsedProjects.length;
      const featuredProjects = parsedProjects.filter((p: Project) => 
        p.featured === true || 
        p.featured === 'true' || 
        p.featured === 1 || 
        p.featured === '1'
      ).length;
      
      console.log(`Test project saved. Total projects: ${totalProjects}, Featured projects: ${featuredProjects}`);
      console.log(`Test project created with ID: ${id} and title: ${testProject.title}`);
      
      return testProject;
    } catch (storageError) {
      console.error('Error saving to localStorage:', storageError);
      alert('Failed to save test project. You may be in private/incognito mode or localStorage may be disabled.');
      return null;
    }
  } catch (error) {
    console.error('Error creating test project:', error);
    return null;
  }
}; 