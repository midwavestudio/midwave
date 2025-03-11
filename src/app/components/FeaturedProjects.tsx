'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Project, getFeaturedProjects } from '@/lib/firebase/projectUtils';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';

const FeaturedProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching featured projects...');
        
        // Get featured projects
        const featuredProjects = await getFeaturedProjects();
        console.log('Featured projects fetched:', featuredProjects.length);
        
        if (featuredProjects.length > 0) {
          console.log('Setting featured projects from fetch');
          setProjects(featuredProjects);
        } else {
          console.log('No featured projects found');
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

    fetchProjects();
  }, [retryCount]);

  // Open project modal
  const handleProjectClick = (project: Project) => {
    console.log('Project clicked:', project.title);
    setSelectedProject(project);
    setIsModalOpen(true);
    console.log('Modal should be open now. isModalOpen:', true);
  };

  // Debug modal state changes
  useEffect(() => {
    console.log('Modal state changed. isModalOpen:', isModalOpen);
    console.log('Selected project:', selectedProject?.title);
  }, [isModalOpen, selectedProject]);

  // Debug projects state changes
  useEffect(() => {
    console.log('Projects state changed. Count:', projects.length);
    if (projects.length > 0) {
      console.log('First project:', projects[0].title);
    }
  }, [projects]);

  return (
    <section className="py-24 bg-[#09090b]">
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
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b85a00]"></div>
          </div>
        ) : (
          <>
            {errorMessage && (
              <div className="bg-red-900/20 text-red-300 p-4 rounded-lg mb-6">
                <p>Error loading projects: {errorMessage}</p>
                <button 
                  onClick={() => setRetryCount(prev => prev + 1)}
                  className="mt-2 px-3 py-1 bg-red-800/30 hover:bg-red-800/50 rounded text-sm"
                >
                  Retry
                </button>
                <Link 
                  href="/admin/projects"
                  className="mt-2 ml-2 px-3 py-1 bg-[#b85a00]/30 hover:bg-[#b85a00]/50 rounded text-sm"
                >
                  Manage Projects
                </Link>
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
                <Link 
                  href="/admin/projects"
                  className="mt-4 px-4 py-2 bg-[#b85a00] text-white rounded-lg hover:bg-[#a04d00] transition-colors inline-block"
                >
                  Add Projects
                </Link>
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
        )}
      </div>

      {/* Project Modal */}
      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={() => {
          console.log('Modal closing...');
          setIsModalOpen(false);
        }}
      />
    </section>
  );
};

export default FeaturedProjects; 