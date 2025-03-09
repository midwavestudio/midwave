'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Project, getFeaturedProjects } from '@/lib/firebase/projectUtils';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';
import { sampleProjects } from '@/lib/firebase/sampleData';

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
];

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
        
        // Log sample projects to verify they exist
        console.log('Sample projects available:', sampleProjects.length);
        console.log('Sample featured projects:', sampleProjects.filter(p => p.featured).length);
        console.log('Fallback projects available:', FALLBACK_PROJECTS.length);
        
        // Get featured projects
        const featuredProjects = await getFeaturedProjects();
        console.log('Featured projects fetched:', featuredProjects.length);
        
        if (featuredProjects.length > 0) {
          console.log('Setting featured projects from fetch');
          setProjects(featuredProjects);
        } else {
          console.log('No featured projects found, using fallback data');
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