'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '@/lib/firebase/projectUtils';
import useKeyPress from '@/hooks/useKeyPress';

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedImage, setExpandedImage] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const expandedImageRef = useRef<HTMLDivElement>(null);
  const [imageDimensions, setImageDimensions] = useState({ 
    width: 0, 
    height: 0, 
    isVertical: false, 
    aspectRatio: 1 
  });
  const [isLoading, setIsLoading] = useState(true);
  const [expandedImageLoading, setExpandedImageLoading] = useState(true);
  const [highQualityMode, setHighQualityMode] = useState(false);
  
  // Disable body scrolling when image is expanded
  useEffect(() => {
    const preventScroll = (e: Event) => {
      if (expandedImage) {
        e.preventDefault();
        return false;
      }
      return true;
    };

    // Handle wheel and touchmove events
    const options = { passive: false };
    
    if (expandedImage) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('wheel', preventScroll, options);
      document.addEventListener('touchmove', preventScroll, options);
    }
    
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('wheel', preventScroll);
      document.removeEventListener('touchmove', preventScroll);
    };
  }, [expandedImage]);
  
  // Handle click outside expanded image to close it
  useEffect(() => {
    if (!expandedImage) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const expandedContainer = expandedImageRef.current;
      
      if (expandedContainer && !expandedContainer.contains(target)) {
        // Check if the click is not on any of the control buttons
        const isControlButton = target.closest('button') || 
                               target.closest('.zoom-controls') || 
                               target.closest('.close-button') ||
                               target.closest('.instructions');
        
        if (!isControlButton) {
          if (zoomLevel > 1) {
            resetZoom();
          } else {
            setExpandedImage(false);
          }
        }
      }
    };

    // Add event listener with a small delay to avoid immediate closure
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expandedImage, zoomLevel]);
  
  // Reset current image index and zoom when project changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setExpandedImage(false);
    resetZoom();
  }, [project]);

  // Reset zoom and pan when expanded image state changes
  useEffect(() => {
    if (!expandedImage) {
      resetZoom();
    }
  }, [expandedImage]);
  
  // This hook previously appeared later in the component, moved here to fix hook order
  useEffect(() => {
    // This will run after we have computed filteredImageUrls and currentImageIndex
    const runAfterFiltering = () => {
      // Will be defined via function declarations below
      const filteredImageUrls = getFilteredImageUrls();
      
      // Reset the current image index if it's out of bounds
      if (filteredImageUrls.length > 0 && currentImageIndex >= filteredImageUrls.length) {
        setCurrentImageIndex(0);
      }
      
      // If we have no images, force isLoading to false to avoid endless spinner
      if (filteredImageUrls.length === 0) {
        setIsLoading(false);
      }
    };
    
    // Only run this effect if we have a project
    if (project) {
      runAfterFiltering();
    }
  }, [project, currentImageIndex]);

  // Check if URL is external (starts with http:// or https://)
  const isExternalUrl = (url: string) => {
    return url?.startsWith('http://') || url?.startsWith('https://');
  };

  // Reset zoom and pan position
  const resetZoom = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  // Handle zoom in
  const zoomIn = () => {
    setZoomLevel(prev => {
      // Use different zoom increments based on image orientation and current zoom
      let zoomIncrement;
      if (imageDimensions.isVertical) {
        // Larger increments for vertical images to make text readable faster
        zoomIncrement = prev < 2 ? 1.0 : prev < 4 ? 0.75 : prev < 8 ? 0.5 : 0.3;
      } else {
        // Standard increments for horizontal images
        zoomIncrement = prev < 2 ? 0.5 : prev < 4 ? 0.3 : 0.2;
      }
      
      const newZoom = Math.min(prev + zoomIncrement, 16); // Increased max zoom for better text readability
      // Round to 2 decimal places for stability
      const roundedZoom = Math.round(newZoom * 100) / 100;
      
      // If we're just starting to zoom, center the pan position
      if (prev === 1 && roundedZoom > 1) {
        setPanPosition({ x: 0, y: 0 });
      }
      return roundedZoom;
    });
  };

  // Handle zoom out
  const zoomOut = () => {
    setZoomLevel(prev => {
      // Use consistent zoom decrements
      let zoomDecrement;
      if (imageDimensions.isVertical) {
        zoomDecrement = prev > 8 ? 0.3 : prev > 4 ? 0.5 : prev > 2 ? 0.75 : 1.0;
      } else {
        zoomDecrement = prev > 4 ? 0.2 : prev > 2 ? 0.3 : 0.5;
      }
      
      const newZoom = Math.max(prev - zoomDecrement, 1);
      // Round to 2 decimal places for stability
      const roundedZoom = Math.round(newZoom * 100) / 100;
      
      // If we're zooming back to 1, reset pan position
      if (roundedZoom === 1) {
        setPanPosition({ x: 0, y: 0 });
      }
      return roundedZoom;
    });
  };

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      // Calculate new position
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Limit panning based on zoom level
      const maxPan = (zoomLevel - 1) * 200; // Adjust this value as needed
      
      // Apply constraints with smooth clamping
      const clampedX = Math.max(Math.min(newX, maxPan), -maxPan);
      const clampedY = Math.max(Math.min(newY, maxPan), -maxPan);
      
      setPanPosition({
        x: clampedX,
        y: clampedY
      });
    }
  };

  // Handle mouse up to end dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle wheel event for panning only (no zooming)
  const handleWheel = (e: React.WheelEvent) => {
    if (expandedImage) {
      e.preventDefault();
      e.stopPropagation();
      
      // Only allow panning when zoomed in - no mouse wheel zooming
      if (zoomLevel > 1) {
        const panSpeed = 2;
        const deltaY = e.deltaY * panSpeed;
        const deltaX = e.deltaX * panSpeed;
        
        setPanPosition(prev => ({
          x: prev.x - deltaX,
          y: prev.y - deltaY
        }));
      }
      // When not zoomed in, wheel does nothing - zoom only via +/- buttons
    }
  };

  // Handle keyboard navigation
  useKeyPress('Escape', () => {
    if (!isOpen) return;
    
    if (expandedImage) {
      if (zoomLevel > 1) {
        resetZoom();
      } else {
        setExpandedImage(false);
      }
    } else {
      onClose();
    }
  });

  useKeyPress('ArrowRight', () => {
    if (!isOpen || expandedImage || !project) return;
    
    setCurrentImageIndex((prev) => 
      prev < project.imageUrls.length - 1 ? prev + 1 : prev
    );
  });

  useKeyPress('ArrowLeft', () => {
    if (!isOpen || expandedImage || !project) return;
    
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : prev));
  });

  useKeyPress('+', () => {
    if (!isOpen || !expandedImage) return;
    zoomIn();
  });

  useKeyPress('-', () => {
    if (!isOpen || !expandedImage) return;
    zoomOut();
  });

  useKeyPress('0', () => {
    if (!isOpen || !expandedImage) return;
    resetZoom();
  });

  // Close when clicking outside the modal content
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        if (expandedImage) {
          if (zoomLevel > 1) {
            resetZoom();
          } else {
            setExpandedImage(false);
          }
        } else {
          onClose();
        }
      }
    },
    [onClose, expandedImage, zoomLevel]
  );

  // Function to handle image load and determine dimensions
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const isVertical = img.naturalHeight > img.naturalWidth;
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    
    // Determine if this is a high-resolution image
    const isHighRes = img.naturalWidth > 1600 || img.naturalHeight > 1200;
    
    // Set high quality mode for high-resolution images
    if (isHighRes) {
      setHighQualityMode(true);
      // Use optimized rendering for high-res images
      img.style.imageRendering = 'crisp-edges';
      img.style.imageRendering = '-webkit-optimize-contrast';
    }
    
    setImageDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
      isVertical,
      aspectRatio
    });
    
    setIsLoading(false);
    setExpandedImageLoading(false);
    
    // For vertical images, start with a better initial zoom for readability
    if (isVertical && expandedImage) {
      // Calculate optimal zoom for text readability
      const viewportHeight = window.innerHeight * 0.95;
      const viewportWidth = window.innerWidth * 0.95;
      const imageHeight = img.naturalHeight;
      const imageWidth = img.naturalWidth;
      
      // If image is very tall and likely contains text, start with higher zoom
      if (imageHeight > viewportHeight * 1.5) {
        // Calculate zoom to fit text readably
        const heightRatio = viewportHeight / imageHeight;
        const widthRatio = viewportWidth / imageWidth;
        const optimalZoom = Math.min(3.0, Math.max(heightRatio * 2, widthRatio * 2, 1.5));
        
        if (optimalZoom > 1) {
          setZoomLevel(optimalZoom);
        }
      }
    }
  };

  if (!project) return null;

  // Validate an image URL
  const isValidImage = (url: string | undefined): boolean => {
    if (!url) {
      console.log('Skipping invalid image: URL is undefined or empty');
      return false;
    }
    
    // For base64 images
    if (url.startsWith('data:image')) {
      return true;
    }
    
    // For URLs
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return true;
    }
    
    // For local images in public directory
    if (url.startsWith('/images/')) {
      // Add debugging to check which images are being loaded
      console.log(`Validating image URL: ${url}`);
      return true;
    }
    
    console.log(`Invalid image URL format: ${url}`);
    return false;
  };

  // Determine which image to display
  const getFilteredImageUrls = () => {
    if (!project) {
      console.log('No project found');
      return [];
    }
    
    // Create an array to collect all unique valid images
    let allImages: string[] = [];
    
    // Add thumbnail to images if it's valid
    if (project.thumbnailUrl && isValidImage(project.thumbnailUrl)) {
      allImages.push(project.thumbnailUrl);
    }
    
    // Add all other valid images from imageUrls
    if (project.imageUrls && project.imageUrls.length > 0) {
      console.log(`Project ${project.title} has ${project.imageUrls.length} images:`);
      project.imageUrls.forEach((url, index) => {
        if (isValidImage(url)) {
          console.log(`Image ${index + 1}: ${url} - Valid: true`);
          // Only add if not already in the array (avoid duplicating thumbnail)
          if (!allImages.includes(url)) {
            allImages.push(url);
          }
        } else {
          console.log(`Image ${index + 1}: ${url} - Valid: false - skipping`);
        }
      });
    } else {
      console.log('No image URLs found in project.imageUrls');
    }
    
    console.log(`Found ${allImages.length} total valid images`);
    
    // If no images at all, return empty array
    return allImages;
  };
  
  // Get all valid image URLs
  const filteredImageUrls = getFilteredImageUrls();
  
  // Determine which image to display
  const currentImage = filteredImageUrls.length > 0 
    ? filteredImageUrls[currentImageIndex] 
    : project.thumbnailUrl;

  // Check if the current image is valid
  const hasValidImage = isValidImage(currentImage);

  // Handle image expansion
  const handleImageExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (hasValidImage) {
      setExpandedImageLoading(true);
      setExpandedImage(true);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          {/* Expanded Image View */}
          <AnimatePresence>
            {expandedImage && hasValidImage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 hover:bg-black/90 transition-colors cursor-pointer"
                onClick={(e) => {
                  // Close when clicking on the backdrop (not on child elements)
                  if (e.target === e.currentTarget) {
                    if (zoomLevel > 1) {
                      resetZoom();
                    } else {
                      setExpandedImage(false);
                    }
                  }
                }}
                onWheel={handleWheel}
                style={{ 
                  overflow: 'hidden',
                  height: '100vh',
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              >
                {/* Background click area - ensures clicks outside image close the modal */}
                <div 
                  className="absolute inset-0 flex items-center justify-center"
                  onClick={(e) => {
                    // Only close if clicking directly on this background area
                    if (e.target === e.currentTarget) {
                      if (zoomLevel > 1) {
                        resetZoom();
                      } else {
                        setExpandedImage(false);
                      }
                    }
                  }}
                >
                  {/* Visual indicator */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-white/60 text-sm pointer-events-none"
                  >
                    <svg className="w-12 h-12 mx-auto opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.div>
                </div>

                <div 
                  ref={expandedImageRef}
                  className={`relative expanded-image-container ${isDragging ? 'cursor-grabbing' : zoomLevel > 1 ? 'cursor-grab' : 'cursor-zoom-in'}`}
                  onClick={(e) => {
                    // Only handle zoom if clicking directly on the image container
                    // but not on the image itself (image has its own click handler)
                    if (e.target === e.currentTarget) {
                      // Clicking on the container area around the image should close
                      if (zoomLevel > 1) {
                        resetZoom();
                      } else {
                        setExpandedImage(false);
                      }
                    }
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  style={{
                    height: 'calc(100vh - 80px)',
                    width: 'calc(100vw - 80px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative',
                    margin: '40px',
                    borderRadius: '8px',
                  }}
                >
                  {/* Loading spinner */}
                  {expandedImageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                        <p className="text-white mt-4 text-center">Loading high resolution image...</p>
                        {imageDimensions.isVertical && (
                          <p className="text-white/80 mt-2 text-sm text-center">Optimizing for text readability</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div 
                    className="relative"
                    style={{ 
                      transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                      transformOrigin: 'center center',
                      transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                      maxHeight: '100%',
                      maxWidth: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <img
                      src={currentImage}
                      alt={`${project.title} - Expanded View`}
                      className="max-w-full object-contain"
                      draggable="false"
                      onLoad={handleImageLoad}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Click on image: zoom in if at 1x, reset zoom if zoomed in
                        if (zoomLevel === 1) {
                          zoomIn();
                        } else {
                          resetZoom();
                        }
                      }}
                      style={{
                        // Allow full viewport usage for better zoom quality
                        maxHeight: imageDimensions.isVertical ? '98vh' : '95vh',
                        maxWidth: imageDimensions.isVertical ? '98vw' : '95vw',
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain',
                        display: expandedImageLoading ? 'none' : 'block',
                        // Use high-quality rendering for all zoom levels
                        imageRendering: zoomLevel > 1 ? 'crisp-edges' : 'auto',
                        willChange: 'transform',
                        backfaceVisibility: 'hidden',
                        // Enhanced contrast and sharpness for better text readability
                        filter: zoomLevel > 1 ? 'contrast(1.08) brightness(1.03) saturate(1.03)' : 'contrast(1.03)',
                        boxShadow: '0 0 20px rgba(0,0,0,0.5)',
                        // Better minimum sizes for vertical images
                        minHeight: imageDimensions.isVertical ? '85vh' : 'auto',
                        minWidth: imageDimensions.isVertical ? 'auto' : '70vw',
                        // Ensure crisp edges for text readability
                        WebkitFontSmoothing: 'antialiased',
                        MozOsxFontSmoothing: 'grayscale',
                        // Additional quality improvements
                      }}
                    />
                  </div>

                  {/* Zoom controls */}
                  <div 
                    className="zoom-controls fixed bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-black/80 backdrop-blur-sm rounded-full p-3 z-10 shadow-lg border border-white/10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        zoomOut();
                      }}
                      className="text-white p-2 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={zoomLevel <= 1}
                      aria-label="Zoom out"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="text-white text-sm">{Math.round(zoomLevel * 100)}%</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        zoomIn();
                      }}
                      className="text-white p-2 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={zoomLevel >= 16}
                      aria-label="Zoom in"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        resetZoom();
                      }}
                      className="text-white p-2 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={zoomLevel === 1}
                      aria-label="Reset zoom"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>

                  {/* Close button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedImage(false);
                    }}
                    className="close-button fixed top-4 right-4 bg-white/90 hover:bg-white rounded-full p-2 text-black shadow-lg transition-all z-20 transform hover:scale-110"
                    aria-label="Close expanded view"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {/* Zoom instructions */}
                  <div 
                    className="instructions fixed top-4 left-4 bg-black/70 rounded-lg p-3 text-white text-xs z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="mb-1">• Click image to zoom in</p>
                    <p className="mb-1">• Use +/- buttons or keys to zoom</p>
                    <p className="mb-1">• Mouse wheel scrolls when zoomed in</p>
                    <p className="mb-1">• Drag to pan when zoomed in</p>
                    {imageDimensions.isVertical && (
                      <p className="mb-1 text-yellow-300">• Zoom in more for better text readability</p>
                    )}
                    <p>• Press Escape or click outside to close</p>
                  </div>
                  
                  {/* Click-to-close indicator - display briefly when expanded view first opens */}
                  <motion.div 
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ delay: 2, duration: 1 }}
                    className="fixed bottom-16 left-1/2 transform -translate-x-1/2 bg-black/70 rounded-lg px-4 py-2 text-white text-sm z-10 pointer-events-none"
                  >
                    Click outside image to close
                  </motion.div>


                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-[#0f0f13] rounded-lg overflow-hidden max-w-6xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-[#b85a00]/20">
              <h2 className="text-xl font-bold text-white">{project.title}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image Gallery */}
                <div className="relative">
                  <div 
                    className="relative aspect-[4/3] bg-gray-800 rounded-lg overflow-hidden cursor-zoom-in"
                    onClick={handleImageExpand}
                  >
                    {hasValidImage ? (
                      <div className="w-full h-full">
                        <img
                          src={currentImage}
                          alt={`${project.title} - Image ${currentImageIndex + 1}`}
                          className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                          loading="eager"
                          style={{
                            imageRendering: 'auto',
                            objectFit: 'contain'
                          }}
                        />
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f0f13]">
                        <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500 mt-2">No image available</p>
                      </div>
                    )}
                    
                    {/* Click to expand indicator */}
                    {hasValidImage && (
                      <div 
                        className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black/30"
                      >
                        <div className="bg-black/70 rounded-full p-3 transform transition-transform duration-300 hover:scale-110">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                        <span className="absolute bottom-4 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
                          Click to expand
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Add a clear call-to-action button for expanding the image */}
                  {hasValidImage && (
                    <button
                      onClick={handleImageExpand}
                      className="mt-4 w-full py-2 bg-[#b85a00]/20 hover:bg-[#b85a00]/40 text-white rounded flex items-center justify-center transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                      Expand Image
                    </button>
                  )}

                  {/* Image Navigation - only show if there are multiple valid images */}
                  {filteredImageUrls.length > 1 && (
                    <div className="mt-4 flex justify-between">
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : prev))}
                        disabled={currentImageIndex === 0}
                        className={`p-2 rounded-full ${
                          currentImageIndex === 0
                            ? 'text-gray-600 cursor-not-allowed'
                            : 'text-white bg-[#b85a00]/20 hover:bg-[#b85a00]/40'
                        }`}
                        aria-label="Previous image"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <div className="text-sm text-gray-400">
                        {currentImageIndex + 1} / {filteredImageUrls.length}
                      </div>
                      <button
                        onClick={() =>
                          setCurrentImageIndex((prev) =>
                            prev < filteredImageUrls.length - 1 ? prev + 1 : prev
                          )
                        }
                        disabled={currentImageIndex === filteredImageUrls.length - 1}
                        className={`p-2 rounded-full ${
                          currentImageIndex === filteredImageUrls.length - 1
                            ? 'text-gray-600 cursor-not-allowed'
                            : 'text-white bg-[#b85a00]/20 hover:bg-[#b85a00]/40'
                        }`}
                        aria-label="Next image"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Thumbnail Navigation */}
                  {filteredImageUrls.length > 1 && (
                    <div className="mt-4 grid grid-cols-5 gap-2">
                      {filteredImageUrls.slice(0, 5).map((url, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`relative aspect-square rounded-md overflow-hidden border-2 ${
                            currentImageIndex === index
                              ? 'border-[#b85a00]'
                              : 'border-transparent hover:border-[#b85a00]/50'
                          }`}
                        >
                          <img
                            src={url}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Project Details */}
                <div>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white mb-4">{project.title}</h3>
                    <p className="text-gray-300 mb-6 whitespace-pre-line">
                      {project.fullDescription || project.description}
                    </p>
                    
                    {/* Visit Site Button */}
                    {project.url && (
                      <div className="mb-8">
                        <a 
                          href={project.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center bg-[#b85a00] hover:bg-[#a04d00] text-white px-6 py-3 rounded-md transition-colors shadow-lg shadow-black/20 text-base"
                        >
                          <span>Visit Live Site</span>
                          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Project Metadata */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {project.client && (
                      <div>
                        <h4 className="text-sm font-semibold text-[#b85a00] mb-1">Client</h4>
                        <p className="text-gray-300">{project.client}</p>
                      </div>
                    )}
                    {project.date && (
                      <div>
                        <h4 className="text-sm font-semibold text-[#b85a00] mb-1">Date</h4>
                        <p className="text-gray-300">{project.date}</p>
                      </div>
                    )}
                    {project.category && (
                      <div>
                        <h4 className="text-sm font-semibold text-[#b85a00] mb-1">Category</h4>
                        <p className="text-gray-300">{project.category}</p>
                      </div>
                    )}
                  </div>

                  {/* Services & Technologies */}
                  <div className="space-y-4">
                    {project.services && project.services.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-[#b85a00] mb-2">Services</h4>
                        <div className="flex flex-wrap gap-2">
                          {project.services.map((service, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-[#1a1a1a] rounded-full text-sm text-gray-300"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {project.technologies && project.technologies.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-[#b85a00] mb-2">Technologies</h4>
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-[#1a1a1a] rounded-full text-sm text-gray-300"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 