'use client';

import { useState, useEffect } from 'react';
import { Project, getProjects, getMarketingAgencyWebsite, getLandDevelopmentProject } from '@/lib/firebase/projectUtils';
import ProjectGrid from './ProjectGrid';
import ProjectModal from './ProjectModal';
import ProjectFilters from './ProjectFilters';
import BackgroundDesign from '@/app/components/BackgroundDesign';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Analytics from '@/utils/analytics';
import { motion } from 'framer-motion';

interface ProjectsProps {
  initialProjects: Project[];
}

export default function Projects({ initialProjects }: ProjectsProps) {
  // Use initial projects or empty array to start
  const startingProjects = initialProjects.length > 0 
    ? initialProjects 
    : [];
    
  const [projects, setProjects] = useState<Project[]>(startingProjects);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(startingProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Clear localStorage to force sync from cloud storage
  useEffect(() => {
    const forceCloudSync = async () => {
      if (typeof window === 'undefined') return;
      
      try {
        console.log('Clearing localStorage to force cloud sync...');
        // Clear localStorage so all devices fetch from cloud
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
    
    forceCloudSync();
  }, []);

  // Fetch projects from cloud storage on the client side
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        
        // Use the cloud-based getProjects function which handles migration
        const fetchedProjects = await getProjects();
        
        // Log what projects were found
        console.log('Projects loaded from cloud:');
        fetchedProjects.forEach(p => console.log(`- ${p.title} (Category: ${p.category}, Featured: ${p.featured})`));
        
        setProjects(fetchedProjects);
        setFilteredProjects(fetchedProjects);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching projects:', error);
        // Fallback to default projects if cloud fails
        const fallbackProjects = [getMarketingAgencyWebsite(), getLandDevelopmentProject()];
        setProjects(fallbackProjects);
        setFilteredProjects(fallbackProjects);
        setErrorMessage('Failed to load projects from cloud, showing default projects.');
        setIsLoading(false);
      }
    };

    // Always fetch from cloud, even if we have initial projects
    fetchProjects();
  }, []); // Remove dependencies to prevent infinite loop

  // Get unique categories from projects
  const categories = ['all', ...new Set(projects.map(project => project.category))];

  // Handle filtering by category
  const filterByCategory = (category: string) => {
    setActiveCategory(category);
    
    if (category === 'all') {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(projects.filter(project => project.category === category));
    }
    
    // Track filter usage in analytics
    Analytics.custom('filter_projects', { category });
  };

  // Handle project click
  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
    
    // Track project view in analytics
    Analytics.projectViewed(project.id, project.title);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Give time for the close animation
    setTimeout(() => setSelectedProject(null), 300);
  };

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
          
          {/* Category filters */}
          {categories.length > 1 && (
            <ProjectFilters 
              categories={categories} 
              activeCategory={activeCategory} 
              onFilterChange={filterByCategory} 
            />
          )}
          
          {/* Error message */}
          {errorMessage && (
            <div className="bg-red-900/20 text-red-300 p-4 rounded-lg mb-6 text-sm md:text-base">
              <p>Error loading projects: {errorMessage}</p>
            </div>
          )}
          
          {/* Projects Grid */}
          <ProjectGrid 
            projects={filteredProjects} 
            onProjectClick={handleProjectClick} 
            isLoading={isLoading} 
          />
        </section>
      </main>
      
      {/* Project Modal */}
      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
      
      <Footer />
    </div>
  );
} 