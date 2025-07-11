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
  // Always include the Marketing Agency Website
  const marketingAgencyWebsite = getMarketingAgencyWebsite();
  const landDevelopmentProject = getLandDevelopmentProject();
  const startingProjects = initialProjects.length > 0 
    ? initialProjects 
    : [marketingAgencyWebsite, landDevelopmentProject];
    
  const [projects, setProjects] = useState<Project[]>(startingProjects);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(startingProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Ensure Marketing Agency Website is in localStorage
  useEffect(() => {
    const ensureDefaultProjects = () => {
      if (typeof window === 'undefined') return;
      
      try {
        console.log('Checking if default projects are in localStorage...');
        const localData = localStorage.getItem('localProjects');
        let projects: Project[] = [];
        
        if (localData) {
          try {
            projects = JSON.parse(localData);
            console.log(`Found ${projects.length} projects in localStorage`);
            
            // Log all projects in localStorage
            projects.forEach((p, i) => {
              console.log(`Project ${i+1}: ${p.title}, ID: ${p.id}, Images: ${p.imageUrls?.length || 0}`);
            });
            
          } catch (error) {
            console.error('Error parsing localStorage projects:', error);
            projects = [];
          }
        } else {
          console.log('No projects found in localStorage');
        }
        
        let hasUpdated = false;
        
        // Check if Marketing Agency Website exists
        if (!projects.some(p => p.title === 'Marketing Agency Website' || p.id === 'marketing-agency-website')) {
          console.log('Adding Marketing Agency Website to localStorage');
          projects.push(marketingAgencyWebsite);
          hasUpdated = true;
        }
        
        // Check if Land Development exists - check by both ID and title to avoid duplicates
        if (!projects.some(p => 
          p.title === 'Land Development' || 
          p.id === 'land-development' || 
          p.slug === 'land-development'
        )) {
          console.log('Adding Land Development to localStorage');
          
          // Log the Land Development project being added
          console.log('Land Development project data:');
          console.log(`- Title: ${landDevelopmentProject.title}`);
          console.log(`- ID: ${landDevelopmentProject.id}`);
          console.log(`- Thumbnail: ${landDevelopmentProject.thumbnailUrl}`);
          console.log(`- Images: ${landDevelopmentProject.imageUrls.length}`);
          console.log(`- Image URLs: ${landDevelopmentProject.imageUrls.join(', ')}`);
          
          projects.push(landDevelopmentProject);
          hasUpdated = true;
        }
        
        // Only update localStorage if we added a project
        if (hasUpdated) {
          console.log('Updating localStorage with default projects');
          localStorage.setItem('localProjects', JSON.stringify(projects));
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }
    };
    
    ensureDefaultProjects();
  }, [marketingAgencyWebsite, landDevelopmentProject]);

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
        const fallbackProjects = [marketingAgencyWebsite, landDevelopmentProject];
        setProjects(fallbackProjects);
        setFilteredProjects(fallbackProjects);
        setErrorMessage('Failed to load projects from cloud, showing default projects.');
        setIsLoading(false);
      }
    };

    // Always fetch from cloud, even if we have initial projects
    fetchProjects();
  }, [marketingAgencyWebsite, landDevelopmentProject]);

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