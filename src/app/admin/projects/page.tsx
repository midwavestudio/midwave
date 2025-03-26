'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProjects, Project, createTestFeaturedProject } from '@/lib/firebase/projectUtils';
import { FiEdit, FiTrash2, FiPlus, FiStar } from 'react-icons/fi';
import AdminLayout from './AdminLayout';

export default function ProjectsAdminPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [firebaseInitialized, setFirebaseInitialized] = useState<boolean | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Load projects on component mount or when refresh is triggered
  useEffect(() => {
    const initializeAndLoad = async () => {
      try {
        // First, ensure Firebase is initialized
        const { ensureFirebaseInitialized } = await import('@/lib/firebase/firebase');
        const result = await ensureFirebaseInitialized();
        
        console.log('Firebase initialization check result:', result);
        setFirebaseInitialized(result);
        
        // Then load projects
        await loadProjects();
      } catch (error) {
        console.error('Error during initialization:', error);
        setErrorMessage('Failed to initialize the application. Please try refreshing the page.');
        setIsLoading(false);
      }
    };
    
    initializeAndLoad();
  }, [lastRefresh]);

  // Function to manually refresh projects
  const refreshProjects = () => {
    setIsLoading(true);
    setLastRefresh(new Date());
  };

  // Function to load projects from firestore/localStorage
  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      console.log('Starting to load projects...');
      const allProjects = await getProjects();
      console.log(`Loaded ${allProjects.length} projects`);
      
      // Sort projects by featured status (featured first) and then by title
      const sortedProjects = allProjects.sort((a, b) => {
        if (a.featured === b.featured) {
          return (a.title || '').localeCompare(b.title || '');
        }
        return a.featured ? -1 : 1;
      });
      
      setProjects(sortedProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      setErrorMessage('Failed to load projects. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to create a test project
  const handleCreateTestProject = async () => {
    try {
      setErrorMessage(null);
      const result = await createTestFeaturedProject();
      if (result.success) {
        setSuccessMessage('Test project created successfully!');
        // Reload projects
        loadProjects();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage(result.message || 'Failed to create test project');
      }
    } catch (error) {
      console.error('Error creating test project:', error);
      setErrorMessage('Failed to create test project. Please try again.');
    }
  };

  // Function to toggle featured status
  const toggleFeatured = async (project: Project) => {
    try {
      // This will be handled in the edit page for simplicity
      console.log('Toggle featured status for project:', project.id);
    } catch (error) {
      console.error('Error toggling featured status:', error);
      setErrorMessage('Failed to update project. Please try again.');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header with action buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Projects</h1>
            <p className="text-gray-400">Manage your portfolio projects</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Link 
              href="/admin/projects/new"
              className="flex items-center gap-2 px-4 py-2 bg-[#b85a00] hover:bg-[#a04d00] text-white rounded-lg"
            >
              <FiPlus size={16} />
              <span>New Project</span>
            </Link>
            
            <button 
              onClick={handleCreateTestProject}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
            >
              <FiPlus size={16} />
              <span>Test Project</span>
            </button>
            
            <button 
              onClick={refreshProjects}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              <span>Refresh</span>
            </button>
          </div>
        </div>
        
        {/* Firebase Status */}
        {firebaseInitialized === false && (
          <div className="p-4 bg-yellow-900/20 text-yellow-300 rounded-lg">
            <p className="font-medium">Firebase is not initialized</p>
            <p className="text-sm mt-1">Projects will be stored in your browser's localStorage instead.</p>
          </div>
        )}
        
        {/* Error and Success Messages */}
        {errorMessage && (
          <div className="p-4 bg-red-900/20 text-red-300 rounded-lg">
            {errorMessage}
          </div>
        )}
        
        {successMessage && (
          <div className="p-4 bg-green-900/20 text-green-300 rounded-lg">
            {successMessage}
          </div>
        )}
        
        {/* Projects List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b85a00]"></div>
            <p className="text-gray-400">Loading projects...</p>
          </div>
        ) : projects.length > 0 ? (
          <div className="bg-gray-800/50 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr className="bg-gray-900/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Featured</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-700/30">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          {project.thumbnailUrl && (
                            <div className="flex-shrink-0 h-10 w-10 mr-3">
                              <img 
                                className="h-10 w-10 rounded-md object-cover" 
                                src={project.thumbnailUrl} 
                                alt={project.title || 'Project thumbnail'} 
                                onError={(e) => {
                                  (e.target as HTMLImageElement).onerror = null; 
                                  (e.target as HTMLImageElement).src = '/images/fallback-thumbnail.jpg';
                                }}
                              />
                            </div>
                          )}
                          <div className="ml-0">
                            <div className="text-sm font-medium text-white">{project.title || 'Untitled Project'}</div>
                            <div className="text-sm text-gray-400 truncate max-w-xs">{project.description?.substring(0, 60) || 'No description'}{project.description && project.description.length > 60 ? '...' : ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{project.category || 'Uncategorized'}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          project.featured 
                            ? 'bg-amber-900/30 text-amber-300' 
                            : 'bg-gray-800 text-gray-400'
                        }`}>
                          <FiStar className={`${project.featured ? 'text-amber-300' : 'text-gray-500'} mr-1`} size={12} />
                          {project.featured ? 'Featured' : 'Not Featured'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-3">
                          <Link 
                            href={`/admin/projects/edit/${project.id}`}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title="Edit Project"
                          >
                            <FiEdit size={20} />
                          </Link>
                          <Link 
                            href={`/admin/projects/delete/${project.id}`}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Delete Project"
                          >
                            <FiTrash2 size={20} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-800/50 rounded-lg">
            <p className="text-gray-400 mb-4">No projects found.</p>
            <div className="flex justify-center gap-4">
              <Link 
                href="/admin/projects/new"
                className="px-4 py-2 bg-[#b85a00] text-white rounded-lg hover:bg-[#a04d00] transition-colors"
              >
                Add Your First Project
              </Link>
              <button 
                onClick={handleCreateTestProject}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Create Test Project
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 