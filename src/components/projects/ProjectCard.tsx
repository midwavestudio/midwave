'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Project } from '@/lib/firebase/projectUtils';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [validThumbnail, setValidThumbnail] = useState(false);

  // Safely access project properties
  const title = project?.title || 'Untitled Project';
  const description = project?.description || 'No description available';
  const thumbnailUrl = project?.thumbnailUrl || project?.thumbnail || '';
  const projectUrl = project?.url || '';
  const category = project?.category || '';

  // Check if URL is external (starts with http:// or https://)
  const isExternalUrl = (url: string) => {
    return url?.startsWith('http://') || url?.startsWith('https://');
  };

  // Check if the thumbnail URL is valid
  useEffect(() => {
    if (!thumbnailUrl) {
      setValidThumbnail(false);
      setImageError(true);
      return;
    }

    // For base64 images, check if they start with data:image
    if (thumbnailUrl.startsWith('data:image')) {
      setValidThumbnail(true);
      return;
    }

    // For URLs, check if they're valid
    if (isExternalUrl(thumbnailUrl)) {
      setValidThumbnail(true);
      return;
    }

    // For other cases, assume it's valid but let the error handler catch issues
    setValidThumbnail(true);
  }, [thumbnailUrl]);

  // Handle click on the card vs. clicking on the visit site button
  const handleCardClick = (e: React.MouseEvent) => {
    if (e.defaultPrevented) {
      // If the event was already handled (e.g., by the Visit Site button)
      return;
    }
    onClick();
  };

  return (
    <motion.div
      className="group cursor-pointer overflow-hidden rounded-lg bg-background-lighter aspect-[4/3] relative"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      onClick={handleCardClick}
      title={`View details for ${title}`}
    >
      {/* Project Image */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br h-full w-full overflow-hidden">
        {validThumbnail && !imageError ? (
          <>
            {/* Loading placeholder */}
            <div 
              className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-700 opacity-100 transition-opacity duration-500"
              style={{ opacity: isLoading ? 1 : 0 }}
            />
            
            {isExternalUrl(thumbnailUrl) ? (
              // Use regular img tag for external URLs
              <img
                src={thumbnailUrl}
                alt={title}
                className="absolute inset-0 w-full h-full object-contain transition-all duration-500 group-hover:scale-105"
                style={{ opacity: isLoading ? 0 : 1 }}
                onLoad={() => setIsLoading(false)}
                onError={() => setImageError(true)}
                loading="lazy"
                decoding="async"
              />
            ) : (
              // Use Next.js Image for internal URLs
              <Image
                src={thumbnailUrl}
                alt={title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-contain transition-all duration-500 group-hover:scale-105"
                style={{ opacity: isLoading ? 0 : 1 }}
                quality={95}
                priority={false}
                onLoadingComplete={() => setIsLoading(false)}
                onError={() => setImageError(true)}
              />
            )}
          </>
        ) : (
          // Fallback for invalid images
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-10 opacity-80 group-hover:opacity-70 transition-opacity duration-300" />

      {/* Category badge */}
      {category && (
        <div className="absolute top-4 left-4 z-20">
          <span className="px-3 py-1 bg-[#b85a00]/80 text-white text-xs rounded-full">
            {category}
          </span>
        </div>
      )}

      {/* Expand indicator */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="bg-black/70 rounded-full p-3 transform transition-transform duration-300 group-hover:scale-110">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-20">
        <h3 className="text-base sm:text-lg font-bold text-white mb-1 group-hover:text-[#b85a00] transition-colors line-clamp-2">
          {title}
        </h3>
        <p className="text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-1">
          {description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center text-[#b85a00] text-xs font-medium group-hover:translate-x-1 transition-transform">
            View Details
            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
          
          {projectUrl && (
            <a 
              href={projectUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center bg-[#b85a00] hover:bg-[#a04d00] text-white text-xs font-medium px-2 sm:px-3 py-1 sm:py-1.5 rounded-md transition-colors shadow-lg shadow-black/20"
            >
              Visit Site
              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
} 