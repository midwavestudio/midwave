'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProjectCard from '../components/ProjectCard';
import ProjectModal from '../components/ProjectModal';
import { Project, getProjects } from '@/lib/firebase/projectUtils';
import { motion } from 'framer-motion';
import Link from 'next/link';
import BackgroundDesign from '../components/BackgroundDesign';

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch projects from Firebase
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching all projects...');
        
        // Get all projects
        const projectsData = await getProjects();
        console.log('Projects fetched:', projectsData.length);
        
        setProjects(projectsData);
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
    console.log('Project clicked in Projects page:', project.title);
    console.log('Project images:', project.imageUrls?.length || 0, 'images available');
    if (project.imageUrls?.length) {
      console.log('First image URL:', project.imageUrls[0]);
    }
    setSelectedProject(project);
    setIsModalOpen(true);
    console.log('Modal should be open now. isModalOpen:', true);
  };

  // Debug modal state changes
  useEffect(() => {
    console.log('Projects page - Modal state changed. isModalOpen:', isModalOpen);
    console.log('Projects page - Selected project:', selectedProject?.title);
  }, [isModalOpen, selectedProject]);

  // Debug projects state changes
  useEffect(() => {
    console.log('Projects state changed. Count:', projects.length);
    if (projects.length > 0) {
      console.log('First project:', projects[0].title);
    }
  }, [projects]);

  return (
    <div className="min-h-screen">
      <BackgroundDesign />
      <Header />
      
      <main className="pt-28 md:pt-48 pb-16 relative z-10">
        <section className="container mx-auto px-4 py-8 md:py-16">
          <motion.div 
            className="text-center mb-8 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4">Our Projects</h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
              Explore our portfolio of premium digital experiences crafted for discerning clients
              across various industries.
            </p>
          </motion.div>
          
          {errorMessage && (
            <div className="bg-red-900/20 text-red-300 p-4 rounded-lg mb-6 text-sm md:text-base">
              <p>Error loading projects: {errorMessage}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <button 
                  onClick={() => setRetryCount(prev => prev + 1)}
                  className="mt-2 px-3 py-1 bg-red-800/30 hover:bg-red-800/50 rounded text-sm"
                >
                  Retry
                </button>
                <Link 
                  href="/admin/projects"
                  className="mt-2 px-3 py-1 bg-[#b85a00]/30 hover:bg-[#b85a00]/50 rounded text-sm inline-block"
                >
                  Manage Projects
                </Link>
              </div>
            </div>
          )}
          
          {/* Projects Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12 md:py-20">
              <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-t-2 border-b-2 border-[#b85a00]"></div>
            </div>
          ) : (
            <>
              {projects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                  {projects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                    >
                      <ProjectCard
                        project={project}
                        onClick={() => handleProjectClick(project)}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 md:py-20">
                  <p className="text-gray-400 mb-3 md:mb-4 text-sm md:text-base">No projects found.</p>
                  <p className="text-gray-500 max-w-xl mx-auto mb-4 md:mb-6 text-xs md:text-sm">
                    Add your real projects from the admin panel to showcase your work.
                  </p>
                  <Link 
                    href="/admin/projects/new"
                    className="px-4 py-2 bg-[#b85a00] text-white rounded-lg hover:bg-[#a04d00] transition-colors inline-block text-sm md:text-base"
                  >
                    Add New Project
                  </Link>
                </div>
              )}
            </>
          )}
        </section>
      </main>
      
      {/* Project Modal */}
      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={() => {
          console.log('Projects page - Modal closing...');
          setIsModalOpen(false);
          // Small delay to ensure state updates properly
          setTimeout(() => {
            console.log('Projects page - Modal closed, checking state:', isModalOpen);
          }, 100);
        }}
      />
      
      <Footer />
    </div>
  );
} 