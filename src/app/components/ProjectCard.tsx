'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Project } from '@/lib/firebase/projectUtils';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

const ProjectCard = ({ project, onClick }: ProjectCardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [validThumbnail, setValidThumbnail] = useState(false);

  // Check if URL is external (starts with http:// or https://)
  const isExternalUrl = (url: string) => {
    return url.startsWith('http://') || url.startsWith('https://');
  };

  // Check if the thumbnail URL is valid
  useEffect(() => {
    if (!project.thumbnailUrl) {
      setValidThumbnail(false);
      setImageError(true);
      return;
    }

    // For base64 images, check if they start with data:image
    if (project.thumbnailUrl.startsWith('data:image')) {
      setValidThumbnail(true);
      return;
    }

    // For URLs, check if they're valid
    if (isExternalUrl(project.thumbnailUrl)) {
      setValidThumbnail(true);
      return;
    }

    // For other cases, assume it's valid but let the error handler catch issues
    setValidThumbnail(true);
  }, [project.thumbnailUrl]);

  return (
    <motion.div
      className="group cursor-pointer overflow-hidden rounded-lg bg-background-lighter h-[350px] sm:h-[400px] relative"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
    >
      {/* Project Image */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br h-full w-full">
        {validThumbnail && !imageError ? (
          <>
            <div 
              className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-700 opacity-100 transition-opacity duration-500"
              style={{ opacity: isLoading ? 1 : 0 }}
            />
            {isExternalUrl(project.thumbnailUrl) ? (
              // Use regular img tag for external URLs
              <img
                src={project.thumbnailUrl}
                alt={project.title}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                style={{ opacity: isLoading ? 0 : 1 }}
                onLoad={() => setIsLoading(false)}
                onError={() => setImageError(true)}
              />
            ) : (
              // Use Next.js Image for internal URLs
              <Image
                src={project.thumbnailUrl}
                alt={project.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                className="object-cover transition-opacity duration-500"
                style={{ opacity: isLoading ? 0 : 1 }}
                onLoadingComplete={() => setIsLoading(false)}
                onError={() => setImageError(true)}
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f13] to-[#1a1a1a]">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <svg className="w-16 sm:w-24 h-16 sm:h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-10 opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 z-20">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2 group-hover:text-[#b85a00] transition-colors line-clamp-2">
          {project.title}
        </h3>
        <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
          {project.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center text-[#b85a00] text-xs sm:text-sm font-medium group-hover:translate-x-2 transition-transform">
            View Project
            <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
          
          {project.url && (
            <a 
              href={project.url} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center bg-[#b85a00] hover:bg-[#a04d00] text-white text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 sm:py-1.5 rounded-md transition-colors"
            >
              Visit Site
              <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard; 