import { Project } from '@/lib/firebase/projectUtils';

const API_BASE = '/api/projects';

// Fetch all projects from the cloud
export async function fetchProjects(): Promise<Project[]> {
  try {
    const response = await fetch(API_BASE);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const projects = await response.json();
    return projects;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
}

// Create a new project in the cloud
export async function createProject(projectData: Omit<Project, 'id'>): Promise<Project> {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'create',
        project: projectData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const project = await response.json();
    return project;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

// Update an existing project in the cloud
export async function updateProject(id: string, projectData: Partial<Project>): Promise<Project> {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'update',
        id,
        project: projectData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const project = await response.json();
    return project;
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
}

// Delete a project from the cloud
export async function deleteProject(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
}

// Migrate projects from localStorage to cloud storage
export async function migrateProjects(projects: Project[]): Promise<{ success: boolean; count: number }> {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'migrate',
        projects,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error migrating projects:', error);
    throw error;
  }
}

// Clear all projects (for admin use)
export async function clearAllProjects(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}?action=clear-all`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error clearing projects:', error);
    throw error;
  }
}

// Get projects with localStorage fallback for migration
export async function getProjectsWithMigration(): Promise<Project[]> {
  try {
    // First try to get projects from the cloud
    const cloudProjects = await fetchProjects();
    
    // If we have cloud projects, clear localStorage and return them
    if (cloudProjects.length > 0) {
      // Clear localStorage to ensure all devices sync from cloud
      if (typeof window !== 'undefined') {
        localStorage.removeItem('localProjects');
        console.log('localStorage cleared - using cloud projects');
      }
      return cloudProjects;
    }

    // If no cloud projects, check localStorage for migration
    if (typeof window !== 'undefined') {
      const localData = localStorage.getItem('localProjects');
      if (localData) {
        try {
          const localProjects = JSON.parse(localData) as Project[];
          if (localProjects.length > 0) {
            console.log(`Found ${localProjects.length} projects in localStorage, migrating to cloud...`);
            
            // Migrate to cloud
            await migrateProjects(localProjects);
            
            // Clear localStorage after successful migration
            localStorage.removeItem('localProjects');
            
            console.log('Migration completed, localStorage cleared');
            return localProjects;
          }
        } catch (error) {
          console.error('Error parsing localStorage projects:', error);
        }
      }
    }

    // No projects found anywhere
    return [];
  } catch (error) {
    console.error('Error in getProjectsWithMigration:', error);
    
    // Fallback to localStorage if cloud fails
    if (typeof window !== 'undefined') {
      const localData = localStorage.getItem('localProjects');
      if (localData) {
        try {
          const localProjects = JSON.parse(localData) as Project[];
          console.log('Cloud failed, falling back to localStorage');
          return localProjects;
        } catch (error) {
          console.error('Error parsing localStorage fallback:', error);
        }
      }
    }
    
    return [];
  }
} 