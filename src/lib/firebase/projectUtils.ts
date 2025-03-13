'use client';

import { collection, getDocs, doc, getDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';

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
      thumbnailUrl: '/images/HOMEthumb.jpg',
      imageUrls: ['/images/HOME.png'],
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
    
    // Create test project images
    const imageUrls = createPlaceholderImages(5);
    
    // Create the test project with featured flag as a boolean
    const testProject: Project = {
      id,
      title: `Test Project ${Math.floor(Math.random() * 1000)}`,
      description: 'This is a test project created for debugging purposes.',
      category: 'Test',
      thumbnailUrl: PLACEHOLDER_IMAGES.THUMBNAIL,
      imageUrls,
      featured: true, // Explicitly set as boolean true
      createdAt: new Date().toISOString(),
      slug: `test-project-${Date.now()}`,
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
 * Compress an image file
 * @param file File to compress
 * @param maxWidth Maximum width
 * @param maxHeight Maximum height
 * @param quality Quality (0-1)
 * @returns Promise resolving to the compressed image as a base64 string
 */
export const compressImage = (
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 800,
  quality: number = 0.8
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
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const result = canvas.toDataURL(file.type, quality);
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