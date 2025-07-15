/**
 * Force clear localStorage and sync from cloud storage
 * This ensures all devices show the same projects from cloud storage
 */

export const forceCloudSync = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    console.log('Forcing cloud sync - clearing localStorage...');
    
    // Clear all project-related localStorage
    localStorage.removeItem('localProjects');
    
    // Also clear any other project-related keys that might exist
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('project') || key.includes('sample'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`Cleared localStorage key: ${key}`);
    });
    
    console.log('localStorage cleared - all projects will now load from cloud storage');
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

/**
 * Check if localStorage has any project data and clear it
 */
export const ensureCloudSync = (): void => {
  if (typeof window === 'undefined') return;
  
  const localData = localStorage.getItem('localProjects');
  if (localData) {
    console.log('Found localStorage projects, clearing to force cloud sync...');
    forceCloudSync();
  }
}; 