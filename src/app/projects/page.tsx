'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProjectCard from '../components/ProjectCard';
import ProjectModal from '../components/ProjectModal';
import { Project, getProjects } from '@/lib/firebase/projectUtils';
import { sampleProjects } from '@/lib/firebase/sampleData';
import { motion } from 'framer-motion';

// Directly import sample projects as a fallback
const FALLBACK_PROJECTS = [
  {
    id: 'luxury-real-estate',
    title: 'Skyline Properties',
    slug: 'skyline-properties',
    category: 'Real Estate',
    description: 'A premium real estate platform showcasing luxury properties with immersive 3D tours and personalized client portals.',
    fullDescription: 'Skyline Properties is a premium real estate platform designed for high-end property listings. The platform features immersive 3D virtual tours, personalized client portals, and advanced property filtering. We created a seamless experience that highlights the luxury aspects of each property while providing powerful tools for both agents and clients.',
    client: 'Skyline Properties Inc.',
    date: 'January 2023',
    services: ['UX/UI Design', 'Web Development', 'CMS Integration'],
    technologies: ['React', 'Next.js', 'Three.js', 'Firebase'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80',
    ],
    featured: true,
  },
  {
    id: 'boutique-travel',
    title: 'Wanderlust Expeditions',
    slug: 'wanderlust-expeditions',
    category: 'Travel',
    description: 'Custom travel booking platform for curated, high-end travel experiences with AI-powered recommendations.',
    fullDescription: 'Wanderlust Expeditions is a custom travel booking platform that specializes in curated, high-end travel experiences. The platform features AI-powered recommendations based on user preferences, seamless booking integration, and personalized itinerary creation. We designed an intuitive interface that showcases stunning destinations while making the booking process effortless.',
    client: 'Wanderlust Travel Group',
    date: 'March 2023',
    services: ['UX/UI Design', 'Web Development', 'AI Integration'],
    technologies: ['React', 'Node.js', 'TensorFlow', 'MongoDB'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    ],
    featured: true,
  },
  {
    id: 'creative-studio',
    title: 'Lumina Studios',
    slug: 'lumina-studios',
    category: 'Creative',
    description: 'Portfolio and client management system for a high-end photography studio with integrated booking and asset delivery.',
    fullDescription: 'Lumina Studios is a comprehensive portfolio and client management system designed for a high-end photography studio. The platform features an elegant portfolio showcase, integrated booking system, and secure asset delivery portal. We created a solution that streamlines the client workflow while maintaining the studio\'s premium brand identity.',
    client: 'Lumina Photography',
    date: 'May 2023',
    services: ['Brand Identity', 'Web Development', 'System Integration'],
    technologies: ['Next.js', 'Prisma', 'PostgreSQL', 'AWS S3'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    ],
    featured: false,
  },
  {
    id: 'luxury-brand',
    title: 'Elysian Collection',
    slug: 'elysian-collection',
    category: 'E-Commerce',
    description: 'Bespoke e-commerce platform for a luxury fashion brand with personalized shopping experiences and exclusive member access.',
    fullDescription: 'Elysian Collection is a bespoke e-commerce platform designed for a luxury fashion brand. The platform features personalized shopping experiences, exclusive member access, and seamless checkout processes. We created an elegant digital storefront that reflects the brand\'s premium positioning while providing powerful e-commerce capabilities.',
    client: 'Elysian Fashion House',
    date: 'July 2023',
    services: ['UX/UI Design', 'E-commerce Development', 'Payment Integration'],
    technologies: ['React', 'Shopify', 'Tailwind CSS', 'Stripe'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
    ],
    featured: true,
  },
  {
    id: 'wellness-app',
    title: 'Serenity Wellness',
    slug: 'serenity-wellness',
    category: 'Health & Wellness',
    description: 'Mobile application for premium wellness services featuring appointment booking, personalized wellness plans, and progress tracking.',
    fullDescription: 'Serenity Wellness is a mobile application designed for premium wellness services. The app features appointment booking, personalized wellness plans, and progress tracking. We created an intuitive and calming user experience that helps users achieve their wellness goals while connecting them with premium service providers.',
    client: 'Serenity Wellness Group',
    date: 'September 2023',
    services: ['Mobile App Design', 'App Development', 'Health API Integration'],
    technologies: ['React Native', 'Firebase', 'HealthKit', 'Google Fit'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2020&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2020&q=80',
    ],
    featured: false,
  },
  {
    id: 'culinary-platform',
    title: 'Gastronome',
    slug: 'gastronome',
    category: 'Food & Beverage',
    description: 'Digital platform connecting high-end restaurants with discerning diners, featuring reservation management and culinary experiences.',
    fullDescription: 'Gastronome is a digital platform that connects high-end restaurants with discerning diners. The platform features reservation management, exclusive culinary experiences, and personalized recommendations. We created an elegant interface that showcases culinary artistry while providing powerful tools for both restaurants and diners.',
    client: 'Gastronome Ventures',
    date: 'November 2023',
    services: ['UX/UI Design', 'Web Development', 'Reservation System'],
    technologies: ['Vue.js', 'Node.js', 'MongoDB', 'Twilio'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    imageUrls: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    ],
    featured: false,
  },
];

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
        
        // Log sample projects to verify they exist
        console.log('Sample projects available:', sampleProjects.length);
        console.log('Fallback projects available:', FALLBACK_PROJECTS.length);
        
        // Get all projects
        const projectsData = await getProjects();
        console.log('Projects fetched:', projectsData.length);
        
        if (projectsData.length > 0) {
          console.log('Setting projects from fetch');
          setProjects(projectsData);
        } else {
          console.log('No projects found, using fallback data');
          setProjects(FALLBACK_PROJECTS);
        }
      } catch (error) {
        console.error('Error in fetchProjects:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
        
        // Use hardcoded fallback projects
        console.log('Using fallback projects due to error');
        setProjects(FALLBACK_PROJECTS);
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
    <div className="min-h-screen bg-[#09090b]">
      <Header />
      
      <main className="pt-24 pb-16">
        <section className="container mx-auto px-4 py-16">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Projects</h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Explore our portfolio of premium digital experiences crafted for discerning clients
              across various industries.
            </p>
          </motion.div>
          
          {errorMessage && (
            <div className="bg-red-900/20 text-red-300 p-4 rounded-lg mb-6">
              <p>Error loading projects: {errorMessage}</p>
              <button 
                onClick={() => setRetryCount(prev => prev + 1)}
                className="mt-2 px-3 py-1 bg-red-800/30 hover:bg-red-800/50 rounded text-sm"
              >
                Retry
              </button>
            </div>
          )}
          
          {/* Projects Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b85a00]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
          )}
          
          {projects.length === 0 && !isLoading && (
            <div className="text-center py-20">
              <p className="text-gray-400">No projects found.</p>
              <button 
                onClick={() => {
                  console.log('Manually setting fallback projects');
                  setProjects(FALLBACK_PROJECTS);
                }}
                className="mt-4 px-4 py-2 bg-[#b85a00] text-white rounded-lg hover:bg-[#a04d00] transition-colors"
              >
                Load Sample Projects
              </button>
            </div>
          )}
        </section>
      </main>
      
      {/* Project Modal */}
      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={() => {
          console.log('Modal closing...');
          setIsModalOpen(false);
        }}
      />
      
      <Footer />
    </div>
  );
} 