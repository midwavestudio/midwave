'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Project, getFeaturedProjects, createTestFeaturedProject } from '@/lib/firebase/projectUtils';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';

const FeaturedProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const [localStorageContent, setLocalStorageContent] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      console.log('Fetching featured projects...');
      
      // Check localStorage content for debugging
      if (typeof window !== 'undefined') {
        const localProjects = localStorage.getItem('localProjects');
        setLocalStorageContent(localProjects);
        
        if (localProjects) {
          try {
            const parsedProjects = JSON.parse(localProjects);
            console.log('Local projects found:', parsedProjects.length);
            console.log('Projects with featured flag:', 
              parsedProjects.filter((p: Project) => p.featured === true || p.featured === 'true').length
            );
          } catch (e) {
            console.error('Error parsing localStorage:', e);
          }
        } else {
          console.log('No projects found in localStorage');
        }
      }
      
      // Get featured projects, including test projects in development
      const includeTestProjects = process.env.NODE_ENV === 'development';
      console.log('Including test projects:', includeTestProjects);
      
      const featuredProjects = await getFeaturedProjects(includeTestProjects);
      console.log('Featured projects fetched:', featuredProjects.length);
      
      if (featuredProjects.length > 0) {
        setProjects(featuredProjects);
      } else {
        setProjects([]);
        setErrorMessage('No featured projects found. Please mark some projects as featured in the admin dashboard.');
      }
    } catch (error) {
      console.error('Error in fetchProjects:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Open project modal
  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  // Create a test featured project
  const handleCreateTestProject = async () => {
    try {
      createTestFeaturedProject();
      
      // Wait a moment for localStorage to update
      setTimeout(() => {
        fetchProjects();
      }, 500);
    } catch (error) {
      console.error('Error creating test project:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Error creating test project');
    }
  };

  // Toggle debug mode
  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
  };

  return (
    <section className="py-24 relative z-10">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Featured Projects</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Explore our most impactful work, showcasing our expertise in design and development
            across various industries.
          </p>
          
          {/* Debug button - always visible in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4">
              <button 
                onClick={toggleDebugMode}
                className="text-xs text-gray-500 underline"
              >
                {debugMode ? 'Hide Debug Tools' : 'Show Debug Tools'}
              </button>
              
              {debugMode && (
                <div className="mt-2 flex flex-col items-center">
                  <div className="flex justify-center gap-2 mb-2">
                    <button 
                      onClick={handleCreateTestProject}
                      className="px-3 py-1 bg-blue-900/30 text-blue-300 rounded text-xs"
                    >
                      Create Test Featured Project
                    </button>
                    <button 
                      onClick={fetchProjects}
                      className="px-3 py-1 bg-green-900/30 text-green-300 rounded text-xs"
                    >
                      Refresh Projects
                    </button>
                  </div>
                  
                  {localStorageContent && (
                    <div className="mt-2 text-left max-w-full overflow-x-auto">
                      <p className="text-xs text-gray-500 mb-1">LocalStorage Content:</p>
                      <div className="bg-gray-900/50 p-2 rounded text-xs text-gray-400 max-h-32 overflow-y-auto">
                        <pre>{localStorageContent}</pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b85a00]"></div>
          </div>
        ) :
          <>
            {errorMessage && (
              <div className="bg-red-900/20 text-red-300 p-4 rounded-lg mb-6">
                <p>Error loading projects: {errorMessage}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Link 
                    href="/admin/projects"
                    className="px-3 py-1 bg-[#b85a00]/30 hover:bg-[#b85a00]/50 rounded text-sm"
                  >
                    Manage Projects
                  </Link>
                </div>
              </div>
            )}
            
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <ProjectCard
                      project={project}
                      onClick={() => handleProjectClick(project)}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-400">No featured projects found.</p>
                <div className="mt-4 flex justify-center gap-4">
                  <Link 
                    href="/admin/projects"
                    className="px-4 py-2 bg-[#b85a00] text-white rounded-lg hover:bg-[#a04d00] transition-colors inline-block"
                  >
                    Add Projects
                  </Link>
                  <button 
                    onClick={handleCreateTestProject}
                    className="px-4 py-2 bg-blue-900/30 text-blue-300 rounded-lg hover:bg-blue-900/50 transition-colors"
                  >
                    Create Test Project
                  </button>
                </div>
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center mt-12"
            >
              <Link
                href="/projects"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#0f0f13] border border-[#b85a00]/30 text-white hover:bg-[#b85a00]/10 transition-colors duration-300"
              >
                <span>View All Projects</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </motion.div>
          </>
        }
      </div>

      {/* Project Modal */}
      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
};

export default FeaturedProjects; 