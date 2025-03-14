'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiAlertTriangle, FiCheck, FiX } from 'react-icons/fi';
import AdminLayout from '../../AdminLayout';
import { Project } from '@/lib/firebase/projectUtils';

interface DeleteProjectPageProps {
  params: {
    id: string;
  };
}

export default function DeleteProjectPage({ params }: DeleteProjectPageProps) {
  const router = useRouter();
  const { id } = params;
  
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (typeof window === 'undefined') return;
        
        // Get data from localStorage
        const localData = localStorage.getItem('localProjects');
        
        if (localData) {
          try {
            const projects = JSON.parse(localData) as Project[];
            const foundProject = projects.find(p => p.id === id);
            
            if (foundProject) {
              setProject(foundProject);
            } else {
              setError('Project not found');
            }
          } catch (parseError) {
            console.error('Error parsing localStorage projects:', parseError);
            setError('Failed to parse project data');
          }
        } else {
          setError('No projects found');
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        setError('Failed to load project data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProject();
  }, [id]);
  
  // Handle project deletion
  const handleDelete = async () => {
    if (!project) return;
    
    setIsDeleting(true);
    
    try {
      if (typeof window === 'undefined') return;
      
      // Get data from localStorage
      const localData = localStorage.getItem('localProjects');
      
      if (localData) {
        let projects: Project[] = [];
        
        try {
          projects = JSON.parse(localData) as Project[];
        } catch (parseError) {
          console.error('Error parsing localStorage projects:', parseError);
          throw new Error('Failed to parse localStorage data');
        }
        
        // Remove the project
        const filteredProjects = projects.filter(p => p.id !== id);
        
        // Save back to localStorage
        localStorage.setItem('localProjects', JSON.stringify(filteredProjects));
        
        console.log(`Project "${project.title}" deleted successfully`);
        
        // Redirect back to projects page
        router.push('/admin/projects');
      } else {
        throw new Error('No projects found in localStorage');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      setError(`Failed to delete project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b85a00]"></div>
        </div>
      </AdminLayout>
    );
  }
  
  // Error state
  if (error || !project) {
    return (
      <AdminLayout>
        <div className="p-4 bg-red-900/20 text-red-300 rounded-lg">
          {error || 'Project not found or failed to load.'}
        </div>
        <div className="mt-4">
          <button
            onClick={() => router.push('/admin/projects')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
          >
            Back to Projects
          </button>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold">Delete Project</h1>
          <p className="text-gray-400">Please confirm that you want to delete this project</p>
        </div>
        
        {/* Confirmation Card */}
        <div className="bg-red-900/10 border border-red-900/30 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="text-red-500">
              <FiAlertTriangle size={24} />
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white mb-2">
                Are you sure you want to delete this project?
              </h2>
              
              <p className="text-gray-300 mb-4">
                This action cannot be undone. This will permanently delete the
                project "{project.title}" and all associated data.
              </p>
              
              {/* Project Details */}
              <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Project Title</h3>
                    <p className="text-white">{project.title}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Category</h3>
                    <p className="text-white">{project.category}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Featured</h3>
                    <p className="text-white">{project.featured ? 'Yes' : 'No'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Client</h3>
                    <p className="text-white">{project.client || 'Not specified'}</p>
                  </div>
                </div>
                
                {project.thumbnailUrl && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Thumbnail</h3>
                    <div className="w-32 h-24 overflow-hidden rounded-md">
                      <img 
                        src={project.thumbnailUrl} 
                        alt={project.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).onerror = null;
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200/2a2a2a/FFFFFF/?text=Error+Loading+Image';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
                >
                  {isDeleting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <FiCheck size={16} />
                  )}
                  <span>Yes, Delete Project</span>
                </button>
                
                <button
                  onClick={() => router.push('/admin/projects')}
                  disabled={isDeleting}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50"
                >
                  <FiX size={16} />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 