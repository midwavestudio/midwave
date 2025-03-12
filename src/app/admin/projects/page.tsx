'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/firebase/auth';
import { getProjects, Project, createTestFeaturedProject } from '@/lib/firebase/projectUtils';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BackgroundDesign from '../../components/BackgroundDesign';
import { motion } from 'framer-motion';
import { FiEdit, FiTrash2, FiPlus, FiStar } from 'react-icons/fi';

export default function AdminProjectsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (user) {
        try {
          setIsLoading(true);
          const allProjects = await getProjects();
          setProjects(allProjects);
        } catch (error) {
          console.error('Error fetching projects:', error);
          setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProjects();
  }, [user]);

  const handleCreateTestProject = () => {
    try {
      createTestFeaturedProject();
      setTimeout(() => {
        router.refresh();
      }, 500);
    } catch (error) {
      console.error('Error creating test project:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Error creating test project');
    }
  };

  const toggleFeatured = async (project: Project) => {
    try {
      // In a real application, you would update the project in Firestore
      // For now, we'll just update it in localStorage
      
      if (typeof window !== 'undefined') {
        const localProjects = localStorage.getItem('localProjects');
        if (localProjects) {
          try {
            const parsedProjects = JSON.parse(localProjects) as Project[];
            
            // Find and update the project
            const updatedProjects = parsedProjects.map(p => {
              if (p.id === project.id) {
                // Ensure featured is set as a boolean
                const newFeatured = !p.featured;
                console.log(`Toggling project "${p.title}" featured status from ${p.featured} to ${newFeatured}`);
                
                return {
                  ...p,
                  featured: newFeatured
                };
              }
              return p;
            });
            
            // Save back to localStorage
            localStorage.setItem('localProjects', JSON.stringify(updatedProjects));
            
            // Verify the save was successful
            const verifyProjects = localStorage.getItem('localProjects');
            if (verifyProjects) {
              try {
                const parsedVerify = JSON.parse(verifyProjects) as Project[];
                const updatedProject = parsedVerify.find(p => p.id === project.id);
                if (updatedProject) {
                  console.log(`Project "${updatedProject.title}" featured status is now ${updatedProject.featured} (type: ${typeof updatedProject.featured})`);
                }
              } catch (verifyError) {
                console.error('Error verifying saved projects:', verifyError);
              }
            }
            
            // Update state
            setProjects(prev => prev.map(p => {
              if (p.id === project.id) {
                return {
                  ...p,
                  featured: !p.featured
                };
              }
              return p;
            }));
          } catch (parseError) {
            console.error('Error parsing localStorage projects:', parseError);
            setErrorMessage('Error parsing projects from localStorage');
          }
        } else {
          console.warn('No projects found in localStorage');
          setErrorMessage('No projects found in localStorage');
        }
      } else {
        console.warn('Window is not defined, cannot access localStorage');
        setErrorMessage('Cannot access localStorage');
      }
    } catch (error) {
      console.error('Error toggling featured status:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Error updating project');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BackgroundDesign />
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b85a00]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <BackgroundDesign />
      <Header />
      
      <main className="pt-24 md:pt-32 pb-16 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 md:p-6 mb-6"
          >
            <div className="flex justify-between items-center">
              <h1 className="text-2xl md:text-3xl font-bold text-white">Manage Projects</h1>
              <div className="flex gap-2">
                <Link 
                  href="/admin/projects/new" 
                  className="flex items-center space-x-2 bg-[#b85a00] hover:bg-[#a04d00] text-white px-3 py-1.5 rounded-lg transition-colors text-sm"
                >
                  <FiPlus size={16} />
                  <span>New Project</span>
                </Link>
                <button 
                  onClick={handleCreateTestProject}
                  className="flex items-center space-x-2 bg-blue-900/30 text-blue-300 px-3 py-1.5 rounded-lg transition-colors text-sm"
                >
                  <FiPlus size={16} />
                  <span>Test Project</span>
                </button>
              </div>
            </div>
            <p className="text-gray-400 text-sm md:text-base mt-2">
              Manage your projects and set featured status
            </p>
          </motion.div>
          
          {errorMessage && (
            <div className="bg-red-900/20 text-red-300 p-4 rounded-lg mb-6 text-sm md:text-base">
              <p>Error: {errorMessage}</p>
            </div>
          )}
          
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#b85a00]"></div>
            </div>
          ) : (
            <>
              {projects.length > 0 ? (
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 md:p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-800">
                      <thead>
                        <tr>
                          <th className="px-3 py-3 text-left text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wider">Title</th>
                          <th className="px-3 py-3 text-left text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wider">Category</th>
                          <th className="px-3 py-3 text-left text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wider">Featured</th>
                          <th className="px-3 py-3 text-left text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {projects.map((project) => (
                          <tr key={project.id} className="hover:bg-gray-800/30">
                            <td className="px-3 py-3 whitespace-nowrap">
                              <div className="text-sm md:text-base font-medium text-white">{project.title}</div>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <div className="text-xs md:text-sm text-gray-300">{project.category || 'Uncategorized'}</div>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <button 
                                onClick={() => toggleFeatured(project)}
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs md:text-sm font-medium ${
                                  project.featured 
                                    ? 'bg-[#b85a00]/20 text-[#b85a00]' 
                                    : 'bg-gray-800/50 text-gray-400 hover:bg-[#b85a00]/10 hover:text-[#b85a00]/70'
                                }`}
                              >
                                <FiStar className="mr-1" size={12} />
                                {project.featured ? 'Featured' : 'Not Featured'}
                              </button>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm md:text-base font-medium">
                              <div className="flex space-x-2">
                                <Link 
                                  href={`/admin/projects/edit/${project.id}`}
                                  className="text-blue-400 hover:text-blue-300"
                                >
                                  <FiEdit size={18} />
                                </Link>
                                <Link 
                                  href={`/admin/projects/delete/${project.id}`}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <FiTrash2 size={18} />
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
                <div className="text-center py-8 bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 md:p-6">
                  <p className="text-gray-400 mb-4 text-sm md:text-base">No projects found.</p>
                  <div className="flex justify-center gap-4">
                    <Link 
                      href="/admin/projects/new"
                      className="px-4 py-2 bg-[#b85a00] text-white rounded-lg hover:bg-[#a04d00] transition-colors inline-block text-sm"
                    >
                      Add Your First Project
                    </Link>
                    <button 
                      onClick={handleCreateTestProject}
                      className="px-4 py-2 bg-blue-900/30 text-blue-300 rounded-lg hover:bg-blue-900/50 transition-colors text-sm"
                    >
                      Create Test Project
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 