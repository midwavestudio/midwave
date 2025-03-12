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
 * Get featured projects
 * @param includeTestProjects Whether to include test projects in the results (default: false)
 */
export const getFeaturedProjects = async (includeTestProjects: boolean = false): Promise<Project[]> => {
  try {
    console.log('getFeaturedProjects called with includeTestProjects =', includeTestProjects);
    
    // Get all projects
    const allProjects = await getProjects();
    console.log('Total projects retrieved:', allProjects.length);
    
    if (allProjects.length === 0) {
      console.warn('No projects found at all. Check if localStorage is accessible.');
      
      // Try to directly access localStorage as a fallback
      if (typeof window !== 'undefined') {
        try {
          const localProjects = localStorage.getItem('localProjects');
          if (localProjects) {
            const parsedProjects = JSON.parse(localProjects) as Project[];
            console.log('Direct localStorage access found projects:', parsedProjects.length);
            
            // Filter for featured projects
            const featuredProjects = parsedProjects.filter(project => {
              // Check if it's a test project
              const isTestProject = project.title.toLowerCase().includes('test');
              
              // Skip test projects if includeTestProjects is false
              if (isTestProject && !includeTestProjects) {
                return false;
              }
              
              // More aggressive check for featured flag
              return project.featured === true || 
                     project.featured === 'true' || 
                     project.featured === 1 ||
                     project.featured === '1';
            });
            
            console.log('Direct localStorage featured projects found:', featuredProjects.length);
            return featuredProjects;
          }
        } catch (error) {
          console.error('Error accessing localStorage directly:', error);
        }
      }
    }
    
    // Log each project's featured status for debugging
    allProjects.forEach(project => {
      console.log(`Project "${project.title}" (ID: ${project.id}):`, {
        featured: project.featured,
        featuredType: typeof project.featured,
        isTestProject: project.title.toLowerCase().includes('test'),
        rawValue: JSON.stringify(project.featured)
      });
    });
    
    // Filter for featured projects with more robust checking
    const featuredProjects = allProjects.filter(project => {
      // Check if it's a test project
      const isTestProject = project.title.toLowerCase().includes('test');
      
      // Skip test projects if includeTestProjects is false
      if (isTestProject && !includeTestProjects) {
        console.log(`Skipping test project: ${project.title}`);
        return false;
      }
      
      // More robust check for featured flag
      const isFeatured = 
        project.featured === true || 
        project.featured === 'true' || 
        project.featured === 1 ||
        project.featured === '1' ||
        (typeof project.featured === 'string' && 
         project.featured.toLowerCase() === 'true');
      
      console.log(`Project "${project.title}" featured status: ${isFeatured} (raw value: ${JSON.stringify(project.featured)})`);
      return isFeatured;
    });
    
    console.log('Featured projects found:', featuredProjects.length);
    
    if (featuredProjects.length === 0) {
      console.warn('WARNING: No featured projects found!');
    }
    
    return featuredProjects;
  } catch (error) {
    console.error('Error getting featured projects:', error);
    return [];
  }
};

/**
 * Create a test featured project in localStorage
 * This is useful for debugging and testing the featured projects functionality
 */
export const createTestFeaturedProject = (): void => {
  try {
    console.log('Creating test featured project...');
    
    // Generate a unique ID
    const id = `test-${Date.now()}`;
    
    // Create a test project
    const testProject: Project = {
      id,
      title: `Test Project ${new Date().toLocaleTimeString()}`,
      slug: `test-project-${Date.now()}`,
      category: 'Test',
      description: 'This is a test project created for debugging purposes.',
      fullDescription: 'This is a test project created for debugging the featured projects functionality. It is automatically marked as featured.',
      client: 'Test Client',
      date: new Date().toLocaleDateString(),
      services: ['Testing', 'Debugging'],
      technologies: ['React', 'Next.js', 'Firebase'],
      thumbnailUrl: 'https://via.placeholder.com/800x600/b85a00/ffffff?text=Test+Project',
      imageUrls: [
        'https://via.placeholder.com/800x600/b85a00/ffffff?text=Test+Image+1',
        'https://via.placeholder.com/800x600/b85a00/ffffff?text=Test+Image+2'
      ],
      url: 'https://example.com',
      featured: true, // Explicitly set to true as a boolean
      order: Date.now()
    };
    
    // Save to localStorage with error handling
    if (typeof window !== 'undefined') {
      try {
        // First, try to get existing projects
        let projects: Project[] = [];
        const localProjects = localStorage.getItem('localProjects');
        
        if (localProjects) {
          try {
            projects = JSON.parse(localProjects) as Project[];
            console.log('Found existing projects in localStorage:', projects.length);
          } catch (parseError) {
            console.error('Error parsing existing projects:', parseError);
            // If parsing fails, start with an empty array
            projects = [];
          }
        } else {
          console.log('No existing projects in localStorage, creating new array');
        }
        
        // Add the test project
        projects.push(testProject);
        
        // Save back to localStorage
        const projectsJson = JSON.stringify(projects);
        localStorage.setItem('localProjects', projectsJson);
        
        // Verify the save was successful
        const verifyProjects = localStorage.getItem('localProjects');
        if (verifyProjects) {
          try {
            const parsedVerify = JSON.parse(verifyProjects) as Project[];
            const featuredCount = parsedVerify.filter(p => p.featured === true).length;
            console.log(`Test project saved successfully. Total projects: ${parsedVerify.length}, Featured: ${featuredCount}`);
            
            // Find our test project
            const savedTestProject = parsedVerify.find(p => p.id === id);
            if (savedTestProject) {
              console.log('Test project found in localStorage with featured =', savedTestProject.featured);
            } else {
              console.warn('Test project not found in localStorage after saving!');
            }
          } catch (verifyError) {
            console.error('Error verifying saved projects:', verifyError);
          }
        } else {
          console.warn('Failed to verify localStorage after saving!');
        }
      } catch (storageError) {
        console.error('Error accessing localStorage:', storageError);
        alert('Error saving test project to localStorage. Your browser may have restrictions on localStorage in private/incognito mode.');
      }
    } else {
      console.warn('Window is not defined, cannot access localStorage');
    }
  } catch (error) {
    console.error('Error creating test featured project:', error);
    throw error;
  }
}; 