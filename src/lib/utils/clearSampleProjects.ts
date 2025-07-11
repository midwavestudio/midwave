/**
 * Utility to clear all sample projects and keep only user-added projects
 */

// List of all sample project IDs and titles to remove
const SAMPLE_PROJECT_IDENTIFIERS = [
  // Sample projects from sampleData.ts
  'luxury-real-estate',
  'skyline-properties',
  'Skyline Properties',
  'boutique-travel',
  'wanderlust-expeditions', 
  'Wanderlust Expeditions',
  'creative-studio',
  'lumina-studios',
  'Lumina Studios',
  'luxury-brand',
  'elysian-collection',
  'Elysian Collection',
  'wellness-app',
  'serenity-wellness',
  'Serenity Wellness',
  'culinary-platform',
  'gastronome',
  'Gastronome',
  
  // Default projects that were being auto-added
  'marketing-agency-website',
  'Marketing Agency Website',
  'land-development',
  'Land Development',
  'architectural-visualization-studio',
  'Architectural Visualization Studio',
  
  // Test projects
  'default-1',
  'test-project',
  
  // Any project with "test" in the ID
];

/**
 * Check if a project is a sample/default project
 */
export const isSampleProject = (project: any): boolean => {
  if (!project) return false;
  
  // Check by ID, slug, or title
  const identifiers = [
    project.id?.toLowerCase(),
    project.slug?.toLowerCase(), 
    project.title?.toLowerCase()
  ].filter(Boolean);
  
  return SAMPLE_PROJECT_IDENTIFIERS.some(sampleId => 
    identifiers.some(id => 
      id === sampleId.toLowerCase() || 
      id.includes('test-project') ||
      id.includes('sample-project')
    )
  );
};

/**
 * Clear all sample projects from localStorage
 */
export const clearAllSampleProjects = (): { success: boolean; message: string; removedCount: number } => {
  try {
    if (typeof window === 'undefined') {
      return { success: false, message: 'Cannot access localStorage on server side', removedCount: 0 };
    }
    
    const localData = localStorage.getItem('localProjects');
    if (!localData) {
      return { success: true, message: 'No projects found in localStorage', removedCount: 0 };
    }
    
    let projects = JSON.parse(localData);
    const originalCount = projects.length;
    
    // Filter out sample projects
    const userProjects = projects.filter((project: any) => !isSampleProject(project));
    const removedCount = originalCount - userProjects.length;
    
    // Save back to localStorage
    localStorage.setItem('localProjects', JSON.stringify(userProjects));
    
    console.log(`Removed ${removedCount} sample projects, kept ${userProjects.length} user projects`);
    
    return {
      success: true,
      message: `Successfully removed ${removedCount} sample projects. ${userProjects.length} user projects remain.`,
      removedCount
    };
    
  } catch (error) {
    console.error('Error clearing sample projects:', error);
    return {
      success: false,
      message: `Failed to clear sample projects: ${error instanceof Error ? error.message : 'Unknown error'}`,
      removedCount: 0
    };
  }
};

/**
 * Get only user-added projects (excluding samples)
 */
export const getUserProjects = (): any[] => {
  try {
    if (typeof window === 'undefined') return [];
    
    const localData = localStorage.getItem('localProjects');
    if (!localData) return [];
    
    const projects = JSON.parse(localData);
    return projects.filter((project: any) => !isSampleProject(project));
    
  } catch (error) {
    console.error('Error getting user projects:', error);
    return [];
  }
};

/**
 * Check if localStorage contains any sample projects
 */
export const hasSampleProjects = (): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    
    const localData = localStorage.getItem('localProjects');
    if (!localData) return false;
    
    const projects = JSON.parse(localData);
    return projects.some((project: any) => isSampleProject(project));
    
  } catch (error) {
    console.error('Error checking for sample projects:', error);
    return false;
  }
}; 