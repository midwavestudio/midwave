'use client';

import { collection, getDocs, doc, getDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { sampleProjects } from './sampleData';

// Remove STORAGE_FOLDERS constant
// Instead, create a constant for placeholder images
export const PLACEHOLDER_IMAGES = {
  THUMBNAIL: 'https://via.placeholder.com/600x400/2a2a2a/FFFFFF/?text=Project+Thumbnail',
  PROJECT: 'https://via.placeholder.com/1200x800/2a2a2a/FFFFFF/?text=Project+Image',
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
  thumbnailUrl: string; // External URL or base64 encoded image
  imageUrls: string[]; // Array of external URLs or base64 encoded images
  url?: string; // External URL to the live project
  featured?: boolean;
  order?: number;
}

/**
 * Check if a string is a valid URL
 */
export const isValidUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Check if it's a base64 image
  if (url.startsWith('data:image/')) {
    return true;
  }
  
  // Check if it's a URL
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Replace Firebase Storage functions with utility functions for external images

/**
 * Create an array of placeholder image URLs
 * @param count Number of placeholder images to create
 * @returns Array of placeholder image URLs
 */
export const createPlaceholderImages = (count: number = 3): string[] => {
  return Array(count).fill(0).map((_, index) => 
    `https://via.placeholder.com/1200x800/2a2a2a/FFFFFF/?text=Project+Image+${index + 1}`
  );
};

/**
 * Get recommended image hosting services
 * @returns List of image hosting services
 */
export const getImageHostingServices = (): { name: string, url: string, description: string }[] => {
  return [
    {
      name: 'ImgBB',
      url: 'https://imgbb.com/',
      description: 'Free image hosting service with API support'
    },
    {
      name: 'Imgur',
      url: 'https://imgur.com/',
      description: 'Popular image hosting platform'
    },
    {
      name: 'Cloudinary',
      url: 'https://cloudinary.com/',
      description: 'Media management platform with free tier'
    },
    {
      name: 'Postimages',
      url: 'https://postimages.org/',
      description: 'Free, anonymous image hosting'
    }
  ];
};

/**
 * Get a Land Development project
 * This is a template that will be updated by the admin interface
 */
export const getLandDevelopmentProject = (): Project => {
  // For the Land Development project, we should check localStorage first
  // before falling back to the default template
  if (typeof window !== 'undefined') {
    try {
      const localProjects = localStorage.getItem('localProjects');
      if (localProjects) {
        const projects = JSON.parse(localProjects);
        const landDevelopment = projects.find((p: any) => 
          p.id === 'land-development' || p.slug === 'land-development'
        );
        
        if (landDevelopment) {
          console.log('Found Land Development project in localStorage');
          return landDevelopment;
        }
      }
    } catch (error) {
      console.error('Error getting Land Development from localStorage:', error);
    }
  }
  
  // If not found in localStorage or error occurred, return default template
  return {
    id: 'land-development',
    title: 'Land Development',
    slug: 'land-development',
    category: 'Web Development',
    description: 'Land development project with custom features and responsive design.',
    fullDescription: 'Comprehensive land development platform that provides tools for property developers and investors.',
    client: 'Land Development Client',
    date: '2023',
    services: ['Web Design', 'Frontend Development', 'CMS Integration'],
    technologies: ['React', 'Next.js', 'Tailwind CSS'],
    thumbnailUrl: '/images/adhocthumb.png',
    imageUrls: [
      '/images/adhocthumb.png' // Only include one default image
    ],
    url: 'https://example.com/land-development',
    featured: true,
    order: 2
  };
};

/**
 * Get all projects from cloud storage with localStorage migration
 */
export const getProjects = async (): Promise<Project[]> => {
  try {
    console.log('Getting all projects from cloud storage...');
    
    // Import the API function dynamically to avoid server-side issues
    const { getProjectsWithMigration } = await import('@/lib/api/projectsApi');
    
    const projects = await getProjectsWithMigration();
    
    // Normalize featured flag to boolean and ensure required fields
    const normalizedProjects = projects.map(project => {
      const normalizedFeatured = project.featured === true || 
                                (typeof project.featured === 'string' && 
                                 (project.featured.toLowerCase() === 'true' || 
                                  project.featured === '1'));
      
      // Ensure thumbnailUrl and imageUrls exist
      let thumbnailUrl = project.thumbnailUrl || project.thumbnail || '';
      if (!thumbnailUrl) {
        thumbnailUrl = PLACEHOLDER_IMAGES.THUMBNAIL;
      }
      
      let imageUrls = Array.isArray(project.imageUrls) ? project.imageUrls : [];
      if (imageUrls.length === 0) {
        imageUrls = createPlaceholderImages(3);
      }
      
      return {
        ...project,
        featured: normalizedFeatured,
        thumbnailUrl,
        imageUrls
      };
    });
    
    console.log(`Returning ${normalizedProjects.length} total projects from cloud`);
    return normalizedProjects.sort((a, b) => {
      const orderA = a.order || 0;
      const orderB = b.order || 0;
      return orderA - orderB;
    });
  } catch (error) {
    console.error('Error in getProjects:', error);
    
    // Fallback to localStorage if cloud fails
    if (typeof window !== 'undefined') {
      try {
        const localProjects = localStorage.getItem('localProjects');
        if (localProjects) {
          const parsedProjects = JSON.parse(localProjects) as Project[];
          console.log('Falling back to localStorage projects:', parsedProjects.length);
          return parsedProjects;
        }
      } catch (localError) {
        console.error('Error parsing localStorage fallback:', localError);
      }
    }
    
    // Final fallback to default projects
    console.log('All sources failed, using default projects');
    return getDefaultFeaturedProjects();
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
    
    // Ensure thumbnailUrl and imageUrls exist
    let thumbnailUrl = projectData.thumbnailUrl || projectData.thumbnail || '';
    if (!thumbnailUrl) {
      thumbnailUrl = PLACEHOLDER_IMAGES.THUMBNAIL;
    }
    
    let imageUrls = Array.isArray(projectData.imageUrls) ? projectData.imageUrls : [];
    if (imageUrls.length === 0) {
      imageUrls = createPlaceholderImages(3);
    }
    
    // Filter out any invalid image URLs
    imageUrls = imageUrls.filter(url => url && typeof url === 'string');
    
    return {
      id: projectDoc.id,
      ...projectData,
      imageUrls,
      thumbnailUrl
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
    
    // If no featured projects found, return only Marketing Agency Website
    if (featuredCount === 0) {
      console.warn('No featured projects found, returning default Marketing Agency Website');
      return [getMarketingAgencyWebsite()];
    }
    
    return featuredProjects;
  } catch (error) {
    console.error('Error in getFeaturedProjects:', error);
    // Return only Marketing Agency Website in case of error
    return [getMarketingAgencyWebsite()];
  }
};

/**
 * Provides only the Marketing Agency Website when no projects are found
 */
export const getMarketingAgencyWebsite = (): Project => {
  return {
    id: 'default-1',
    title: 'Marketing Agency Website',
    slug: 'marketing-agency-website',
    category: 'Web Development',
    description: 'A modern website for a digital marketing agency with custom animations and responsive design.',
    thumbnailUrl: '/images/HOME (1).jpg',
    imageUrls: ['/images/HOME (1).jpg'],
    featured: true,
    createdAt: new Date().toISOString(),
    client: 'XYZ Digital Agency',
    services: ['Web Design', 'Frontend Development', 'CMS Integration'],
    technologies: ['React', 'Next.js', 'Tailwind CSS'],
    order: 1
  };
};

// Create a duplicate of the Marketing Agency Website data for server-side use
// This needs to be outside the 'use client' directive
export const marketingAgencyWebsiteData = {
  id: 'default-1',
  title: 'Marketing Agency Website',
  slug: 'marketing-agency-website',
  category: 'Web Development',
  description: 'A modern website for a digital marketing agency with custom animations and responsive design.',
  thumbnailUrl: '/images/HOME (1).jpg',
  imageUrls: ['/images/HOME (1).jpg'],
  featured: true,
  client: 'XYZ Digital Agency',
  services: ['Web Design', 'Frontend Development', 'CMS Integration'],
  technologies: ['React', 'Next.js', 'Tailwind CSS'],
  order: 1
};

/**
 * Provides default featured projects when no projects are found
 * This ensures the site always displays meaningful content
 */
const getDefaultFeaturedProjects = (): Project[] => {
  return [getMarketingAgencyWebsite()];
};

/**
 * Creates a test featured project for development and testing
 * @returns The created project or null if creation failed
 */
export const createTestFeaturedProject = async (): Promise<{success: boolean, message?: string, project?: Project}> => {
  try {
    // Only allow in development mode or if explicitly allowed
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_ALLOW_TEST_PROJECTS !== 'true') {
      console.error('Test projects cannot be created in production mode');
      return { success: false, message: 'Test projects cannot be created in production mode' };
    }
    
    // Check if running on client
    if (typeof window === 'undefined') {
      console.error('Cannot create test project on server - no localStorage available');
      return { success: false, message: 'Cannot create test project on server' };
    }
    
    console.log('Creating test featured project...');
    
    // Create a unique slug for the test project
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    const title = `Test Project ${randomNum}`;
    const slug = `test-project-${randomNum}-${timestamp}`;
    
    // Create test project images
    const imageUrls = createPlaceholderImages(5);
    
    // Create the test project data
    const testProjectData = {
      title,
      description: 'This is a test project created for debugging purposes.',
      fullDescription: 'This is a detailed description of the test project. It includes multiple paragraphs of text to demonstrate how the full description field works.\n\nThis project was automatically generated for testing purposes.',
      category: 'Test',
      thumbnailUrl: PLACEHOLDER_IMAGES.THUMBNAIL,
      imageUrls,
      featured: true,
      slug,
      client: 'Test Client',
      date: new Date().toISOString().split('T')[0],
      services: ['Testing', 'Development', 'Debugging'],
      technologies: ['React', 'Next.js', 'Firebase'],
      url: 'https://example.com',
      order: 0
    };
    
    try {
      // Try to use the addDocument function from firebaseUtils
      try {
        const { addDocument } = await import('./firebaseUtils');
        const result = await addDocument('projects', testProjectData);
        console.log('Test project created successfully using addDocument:', result);
        return { 
          success: true, 
          message: 'Test project created successfully', 
          project: result as Project 
        };
      } catch (addDocError) {
        console.error('Error using addDocument, falling back to localStorage:', addDocError);
        
        // Fallback to direct localStorage manipulation
        // Get existing projects from localStorage
        let projects: Project[] = [];
        const existingProjects = localStorage.getItem('localProjects');
        projects = existingProjects ? JSON.parse(existingProjects) : [];
        
        // Create a unique ID for the test project
        const id = `test-${timestamp}`;
        
        // Create the complete test project object
        const testProject: Project = {
          id,
          ...testProjectData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Add the test project to localStorage
        projects.push(testProject);
        localStorage.setItem('localProjects', JSON.stringify(projects));
        
        console.log(`Test project created with ID: ${id} and title: ${testProject.title}`);
        return { 
          success: true, 
          message: 'Test project created successfully (localStorage fallback)', 
          project: testProject 
        };
      }
    } catch (storageError) {
      console.error('Error saving to localStorage:', storageError);
      return { 
        success: false, 
        message: 'Failed to save test project. You may be in private/incognito mode or localStorage may be disabled.' 
      };
    }
  } catch (error) {
    console.error('Error creating test project:', error);
    return { 
      success: false, 
      message: 'An unexpected error occurred while creating the test project' 
    };
  }
};

// Add new utility functions for image handling

/**
 * Convert a file to a base64 string
 * @param file File to convert
 * @returns Promise resolving to the base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

/**
 * Convert a base64 string to a Blob object
 * @param base64 Base64 string to convert
 * @returns Blob object
 */
export const base64ToBlob = (base64: string): Blob => {
  const parts = base64.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);
  
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  
  return new Blob([uInt8Array], { type: contentType });
};

/**
 * Compress an image file with optimized settings for different image types
 * @param file File to compress
 * @param maxWidth Maximum width
 * @param maxHeight Maximum height
 * @param quality Quality (0-1)
 * @returns Promise resolving to the compressed image as a base64 string
 */
export const compressImage = (
  file: File,
  maxWidth: number = 4800,
  maxHeight: number = 3600,
  quality: number = 0.98
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Preserve aspect ratio while ensuring image isn't too large
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        
        // Ensure image is never smaller than minimum dimensions for readability
        const minDimension = 1600;
        if (width < minDimension && height < minDimension) {
          // Scale up small images to be at least minDimension on smallest side
          if (width <= height) {
            height = Math.round((height * minDimension) / width);
            width = minDimension;
          } else {
            width = Math.round((width * minDimension) / height);
            height = minDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        
        // Optimized image quality settings for better text readability
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          // Additional quality improvements for better rendering
          ctx.globalCompositeOperation = 'source-over';
          
          // Only add white background for transparent images
          if (file.type === 'image/png') {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);
          }
          
          ctx.drawImage(img, 0, 0, width, height);
        }
        
        // Use image/png for better quality when possible, especially for images with text
        const isVertical = img.height > img.width;
        const hasText = isVertical || file.name.toLowerCase().includes('text') || file.name.toLowerCase().includes('document');
        
        // Use PNG for better quality with text, JPEG for photos
        const mimeType = (file.type === 'image/png' || hasText) ? 'image/png' : 'image/jpeg';
        const adjustedQuality = mimeType === 'image/png' ? 1.0 : Math.max(quality, 0.98);
        
        const result = canvas.toDataURL(mimeType, adjustedQuality);
        resolve(result);
      };
      
      img.onerror = (error) => {
        reject(error);
      };
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
  });
};

/**
 * Clear all projects from both localStorage and Firestore
 * This is a destructive operation and should be used with caution
 */
export const clearAllProjects = async (): Promise<{ success: boolean, message: string }> => {
  try {
    let localCleared = false;
    let firestoreCleared = false;
    
    // Clear projects from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('localProjects');
      console.log('Cleared projects from localStorage');
      localCleared = true;
    }
    
    // Clear projects from Firestore if available
    try {
      // Import Firebase modules dynamically
      const { collection, getDocs, deleteDoc, doc } = await import('firebase/firestore');
      const { db } = await import('./firebase');
      
      // Check if Firestore is available
      if (db && typeof db === 'object' && Object.keys(db).length > 0) {
        console.log('Clearing projects from Firestore...');
        
        const projectsRef = collection(db, 'projects');
        const snapshot = await getDocs(projectsRef);
        
        if (!snapshot.empty) {
          const deletePromises = snapshot.docs.map(document => 
            deleteDoc(doc(db, 'projects', document.id))
          );
          
          await Promise.all(deletePromises);
          console.log(`Deleted ${snapshot.docs.length} projects from Firestore`);
          firestoreCleared = true;
        } else {
          console.log('No projects found in Firestore to clear');
          firestoreCleared = true;
        }
      }
    } catch (firestoreError) {
      console.error('Error clearing Firestore projects:', firestoreError);
      return { 
        success: localCleared, 
        message: `localStorage projects ${localCleared ? 'cleared' : 'failed to clear'}. Firestore projects failed to clear: ${firestoreError.message}` 
      };
    }
    
    return { 
      success: true, 
      message: `Successfully cleared projects from ${localCleared ? 'localStorage' : ''} ${firestoreCleared ? 'and Firestore' : ''}` 
    };
  } catch (error) {
    console.error('Error clearing projects:', error);
    return { success: false, message: `Failed to clear projects: ${error.message}` };
  }
};

/**
 * Initialize localStorage with sample projects if no projects exist
 * This function is now disabled to prevent automatic sample project creation
 * Users should add their own projects through the admin interface
 */
export const initializeSampleProjects = async (): Promise<{ success: boolean, message: string }> => {
  try {
    if (typeof window === 'undefined') {
      return { success: false, message: 'Cannot initialize projects on server side' };
    }
    
    // Check if projects already exist in localStorage
    const existingProjects = localStorage.getItem('localProjects');
    if (existingProjects) {
      const projects = JSON.parse(existingProjects);
      if (projects.length > 0) {
        console.log('Projects already exist in localStorage, no initialization needed');
        return { success: true, message: 'Projects already exist' };
      }
    }
    
    // Initialize with empty array instead of sample projects
    console.log('Initializing localStorage with empty projects array...');
    localStorage.setItem('localProjects', JSON.stringify([]));
    
    console.log('Initialized empty projects array in localStorage');
    return { success: true, message: 'Initialized empty projects array - ready for user projects' };
  } catch (error) {
    console.error('Error initializing projects:', error);
    return { success: false, message: 'Failed to initialize projects' };
  }
};

/**
 * Remove specific projects by ID or slug
 * @param projectIdentifiers Array of project IDs or slugs to remove
 * @returns Promise resolving to success status and message
 */
export const removeProjects = async (projectIdentifiers: string[]): Promise<{ success: boolean, message: string }> => {
  try {
    if (typeof window === 'undefined') {
      return { success: false, message: 'Cannot remove projects on server side' };
    }

    // Get existing projects from localStorage
    const localProjects = localStorage.getItem('localProjects');
    if (!localProjects) {
      return { success: true, message: 'No projects found to remove' };
    }

    const projects = JSON.parse(localProjects) as Project[];
    const initialCount = projects.length;

    // Filter out projects that match the identifiers
    const filteredProjects = projects.filter(project => 
      !projectIdentifiers.includes(project.id) && 
      !projectIdentifiers.includes(project.slug) &&
      !projectIdentifiers.includes(project.title)
    );

    const removedCount = initialCount - filteredProjects.length;

    // Save the filtered projects back to localStorage
    localStorage.setItem('localProjects', JSON.stringify(filteredProjects));

    console.log(`Removed ${removedCount} projects from localStorage`);
    return { 
      success: true, 
      message: `Successfully removed ${removedCount} project(s)` 
    };
  } catch (error) {
    console.error('Error removing projects:', error);
    return { success: false, message: `Failed to remove projects: ${error.message}` };
  }
};

/**
 * Add a new project to localStorage
 * @param projectData Project data to add
 * @returns Promise resolving to success status and message
 */
export const addProject = async (projectData: Omit<Project, 'id'>): Promise<{ success: boolean, message: string, project?: Project }> => {
  try {
    if (typeof window === 'undefined') {
      return { success: false, message: 'Cannot add project on server side' };
    }

    // Get existing projects from localStorage
    const localProjects = localStorage.getItem('localProjects');
    const projects = localProjects ? JSON.parse(localProjects) as Project[] : [];

    // Check if a project with the same title or slug already exists
    const existingProject = projects.find(p => 
      p.title === projectData.title || 
      (projectData.slug && p.slug === projectData.slug)
    );

    if (existingProject) {
      console.log(`Project with title "${projectData.title}" already exists, skipping...`);
      return { 
        success: true, 
        message: `Project "${projectData.title}" already exists`,
        project: existingProject
      };
    }

    // Generate a unique ID
    const timestamp = Date.now();
    const id = `project-${timestamp}`;

    // Create the complete project object
    const newProject: Project = {
      id,
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add the new project
    projects.push(newProject);

    // Save back to localStorage
    localStorage.setItem('localProjects', JSON.stringify(projects));

    console.log(`Added new project: ${newProject.title} with ID: ${id}`);
    return { 
      success: true, 
      message: `Successfully added project: ${newProject.title}`,
      project: newProject
    };
  } catch (error) {
    console.error('Error adding project:', error);
    return { success: false, message: `Failed to add project: ${error.message}` };
  }
}; 