'use client';

import { motion } from 'framer-motion';
import { Project } from '@/lib/firebase/projectUtils';
import ProjectCard from './ProjectCard';

interface ProjectGridProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
  isLoading: boolean;
}

export default function ProjectGrid({ projects, onProjectClick, isLoading }: ProjectGridProps) {
  if (isLoading && projects.length === 0) {
    return (
      <div className="flex justify-center items-center py-12 md:py-20">
        <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-t-2 border-b-2 border-[#b85a00]"></div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 md:py-20">
        <p className="text-gray-400 mb-3 md:mb-4 text-sm md:text-base">No projects found.</p>
        <p className="text-gray-500 max-w-xl mx-auto text-xs md:text-sm">
          Check back later for new project updates.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-4 md:gap-y-12 md:gap-x-8">
      {projects.map((project, index) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.5, 
            delay: 0.1 * Math.min(index, 5) // Cap the delay for better UX with many items
          }}
          layout // Smooth layout transitions when filtering
        >
          <ProjectCard
            project={project}
            onClick={() => onProjectClick(project)}
          />
        </motion.div>
      ))}
    </div>
  );
} 