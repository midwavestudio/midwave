'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Project, getFeaturedProjects, initializeSampleProjects } from '@/lib/firebase/projectUtils';
import ProjectCard from '@/components/projects/ProjectCard';
import ProjectModal from '@/components/projects/ProjectModal';

// Client-side only component wrapper to prevent hydration errors
const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return null;
  }
  
  return <>{children}</>;
};

const FeaturedProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Check for client-side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      console.log('Fetching featured projects...');
      
      // Only include actual featured projects, no test projects
      const featuredProjects = await getFeaturedProjects(false);
      console.log('Featured projects fetched:', featuredProjects.length);
      
      if (featuredProjects.length > 0) {
        setProjects(featuredProjects);
      } else {
        setProjects([]);
        setErrorMessage('No featured projects found. Projects can be marked as featured in the admin dashboard.');
      }
    } catch (error) {
      console.error('Error in fetchProjects:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred while loading projects';
      setErrorMessage(errorMsg);
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
    console.log('Project clicked in FeaturedProjects:', project.title);
    setSelectedProject(project);
    setIsModalOpen(true);
    console.log('Modal should be open now. isModalOpen:', true);
  };

  // Debug modal state changes
  useEffect(() => {
    console.log('FeaturedProjects - Modal state changed. isModalOpen:', isModalOpen);
    console.log('FeaturedProjects - Selected project:', selectedProject?.title);
  }, [isModalOpen, selectedProject]);

  return (
    <section className="py-24 relative z-10">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6">Featured Projects</h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-medium">
            Explore our recent work crafted with precision and purpose.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b85a00]"></div>
          </div>
        ) :
          <>
            {errorMessage && (
              <div className="bg-red-900/20 text-red-300 p-4 rounded-lg mb-6 text-center">
                <p>{errorMessage}</p>
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
                <p className="text-gray-400 mb-4">No featured projects found.</p>
                <ClientOnly>
                  {isClient && (
                    <Link 
                      href="/admin/projects"
                      className="px-4 py-2 bg-[#b85a00] text-white rounded-lg hover:bg-[#a04d00] transition-colors inline-block"
                    >
                      Manage Projects
                    </Link>
                  )}
                </ClientOnly>
              </div>
            )}

            {/* "View All Projects" button temporarily hidden */}
          </>
        }
      </div>

      {/* Project Modal */}
      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={() => {
          console.log('FeaturedProjects - Modal closing...');
          setIsModalOpen(false);
          // Small delay to ensure state updates properly
          setTimeout(() => {
            console.log('FeaturedProjects - Modal closed, checking state:', isModalOpen);
          }, 100);
        }}
      />
    </section>
  );
};

export default FeaturedProjects; 