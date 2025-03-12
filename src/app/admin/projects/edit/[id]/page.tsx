'use client';

import { Metadata } from 'next';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import React from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import BackgroundDesign from '@/app/components/BackgroundDesign';
import ImageUrlHelper from '@/app/components/ImageUrlHelper';
import FirebaseStatus from '@/app/components/FirebaseStatus';
import { getDocument, updateDocument } from '@/lib/firebase/firebaseUtils';
import { Project, getProjects } from '@/lib/firebase/projectUtils';
import { compressImage } from '@/lib/utils/imageUtils';
import { useAuth } from '@/lib/firebase/auth';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Define the props type to match Next.js's expectations
type EditProjectProps = {
  params: {
    id: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function EditProject({ params }: EditProjectProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const routeParams = useParams();
  const id = routeParams.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const [showImageHelper, setShowImageHelper] = useState(false);
  const [activeImageField, setActiveImageField] = useState<'thumbnail' | 'gallery' | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [client, setClient] = useState('');
  const [date, setDate] = useState('');
  const [services, setServices] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [imageUrls, setImageUrls] = useState('');
  const [featured, setFeatured] = useState(false);
  const [order, setOrder] = useState<number>(0);
  const [url, setUrl] = useState('');

  const [uploadedThumbnail, setUploadedThumbnail] = useState<File | null>(null);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multipleFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchProject = async () => {
      if (user) {
        try {
          setIsLoading(true);
          const allProjects = await getProjects();
          const project = allProjects.find(p => p.id === params.id);
          
          if (project) {
            setTitle(project.title || '');
            setSlug(project.slug || '');
            setCategory(project.category || '');
            setDescription(project.description || '');
            setFullDescription(project.fullDescription || '');
            setClient(project.client || '');
            setDate(project.date || '');
            setServices(Array.isArray(project.services) ? project.services.join(', ') : '');
            setTechnologies(Array.isArray(project.technologies) ? project.technologies.join(', ') : '');
            setThumbnailUrl(project.thumbnailUrl || '');
            setImageUrls(Array.isArray(project.imageUrls) ? project.imageUrls.join(', ') : '');
            setFeatured(project.featured || false);
            setUrl(project.url || '');
          } else {
            setMessage('Project not found');
            setMessageType('error');
          }
        } catch (error) {
          console.error('Error fetching project:', error);
          setMessage(error instanceof Error ? error.message : 'Unknown error');
          setMessageType('error');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProject();
  }, [user, params.id]);

  // Debug featured state changes
  useEffect(() => {
    console.log('Featured state changed:', featured);
  }, [featured]);

  // Handle thumbnail image upload
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedThumbnail(file);
      
      try {
        // Compress the image before creating a preview
        const compressedImage = await compressImage(file, 1200, 800, 0.7);
        setThumbnailPreview(compressedImage);
      } catch (error) {
        console.error('Error compressing thumbnail:', error);
        
        // Fallback to regular FileReader if compression fails
        const reader = new FileReader();
        reader.onloadend = () => {
          setThumbnailPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Handle multiple image upload
  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setUploadedImages(prev => [...prev, ...files]);
      
      // Process each file
      for (const file of files) {
        try {
          // Compress the image
          const compressedImage = await compressImage(file, 1200, 800, 0.7);
          setImagePreviewUrls(prev => [...prev, compressedImage]);
        } catch (error) {
          console.error('Error compressing image:', error);
          
          // Fallback to regular FileReader if compression fails
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreviewUrls(prev => [...prev, reader.result as string]);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  // Remove an uploaded image
  const removeUploadedImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Remove an existing image URL
  const removeExistingImage = (index: number) => {
    const currentUrls = imageUrls.split(',').map(url => url.trim()).filter(url => url);
    currentUrls.splice(index, 1);
    setImageUrls(currentUrls.join(', '));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      // Convert uploaded thumbnail to base64 if it exists
      let finalThumbnailUrl = thumbnailUrl;
      if (uploadedThumbnail) {
        finalThumbnailUrl = thumbnailPreview;
      }
      
      // Combine uploaded images and image URLs
      let finalImageUrls: string[] = [];
      
      // Add image URLs from text input
      if (imageUrls) {
        finalImageUrls = imageUrls.split(',').map(url => url.trim()).filter(url => url);
      }
      
      // Add base64 images from uploads
      finalImageUrls = [...finalImageUrls, ...imagePreviewUrls];
      
      // Prepare project data
      const projectData: Omit<Project, 'id'> = {
        title,
        slug,
        category,
        description,
        fullDescription,
        client,
        date,
        services: services.split(',').map(s => s.trim()).filter(s => s),
        technologies: technologies.split(',').map(t => t.trim()).filter(t => t),
        thumbnailUrl: finalThumbnailUrl,
        imageUrls: finalImageUrls,
        url,
        featured,
        order: Date.now() // Update order to current timestamp
      };
      
      console.log('Updating project with featured status:', featured);
      console.log('Project data being saved:', JSON.stringify(projectData, null, 2));
      
      // Update project in Firestore
      await updateDocument('projects', id, projectData);
      
      setMessage('Project updated successfully!');
      setMessageType('success');
      
      // Redirect to admin projects page after a short delay
      setTimeout(() => {
        router.push('/admin/projects');
      }, 1500);
      
    } catch (error) {
      console.error('Error updating project:', error);
      setMessage(error instanceof Error ? error.message : 'Unknown error occurred');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageSelect = (url: string) => {
    if (activeImageField === 'thumbnail') {
      setThumbnailUrl(url);
    } else if (activeImageField === 'gallery') {
      // Add the new URL to the existing comma-separated list
      const currentUrls = imageUrls.split(',').map(u => u.trim()).filter(u => u);
      currentUrls.push(url);
      setImageUrls(currentUrls.join(', '));
    }
    
    // Close the image helper
    setShowImageHelper(false);
    setActiveImageField(null);
  };

  const openImageHelper = (field: 'thumbnail' | 'gallery') => {
    setActiveImageField(field);
    setShowImageHelper(true);
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BackgroundDesign />
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b85a00]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <BackgroundDesign />
      <Header />
      
      <main className="pt-24 md:pt-32 pb-16 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[#09090b]/95 backdrop-blur-md rounded-xl p-4 md:p-6 mb-6 border border-[#b85a00]/20"
          >
            <div className="flex justify-between items-center">
              <h1 className="text-2xl md:text-3xl font-bold text-white">Edit Project</h1>
              <Link 
                href="/admin/projects" 
                className="flex items-center space-x-2 bg-[#0f0f13] hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg transition-colors text-sm"
              >
                <FiArrowLeft size={16} />
                <span>Back to Projects</span>
              </Link>
            </div>
            <p className="text-gray-400 text-sm md:text-base mt-2">
              Update project details
            </p>
          </motion.div>
          
          {message && (
            <div className={`p-4 mb-6 rounded-lg ${
              messageType === 'success' ? 'bg-green-900/20 text-green-300' : 'bg-red-900/20 text-red-300'
            }`}>
              {message}
            </div>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-[#09090b]/95 backdrop-blur-md rounded-xl p-4 md:p-6 border border-[#b85a00]/20"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label htmlFor="title" className="block text-white font-medium mb-2">Project Title *</label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-[#0f0f13] border border-[#b85a00]/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00]/50 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="slug" className="block text-white font-medium mb-2">Slug *</label>
                  <input
                    id="slug"
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-[#0f0f13] border border-[#b85a00]/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00]/50 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-white font-medium mb-2">Category *</label>
                  <input
                    id="category"
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-[#0f0f13] border border-[#b85a00]/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00]/50 focus:border-transparent"
                  />
                </div>
                
                <div className="col-span-2">
                  <label htmlFor="description" className="block text-white font-medium mb-2">Short Description *</label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={2}
                    className="w-full px-4 py-2 bg-[#0f0f13] border border-[#b85a00]/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00]/50 focus:border-transparent"
                  />
                </div>
                
                <div className="col-span-2">
                  <label htmlFor="fullDescription" className="block text-white font-medium mb-2">Full Description</label>
                  <textarea
                    id="fullDescription"
                    value={fullDescription}
                    onChange={(e) => setFullDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 bg-[#0f0f13] border border-[#b85a00]/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00]/50 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="client" className="block text-white font-medium mb-2">Client</label>
                  <input
                    id="client"
                    type="text"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    className="w-full px-4 py-2 bg-[#0f0f13] border border-[#b85a00]/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00]/50 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="date" className="block text-white font-medium mb-2">Date</label>
                  <input
                    id="date"
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="e.g. January 2023"
                    className="w-full px-4 py-2 bg-[#0f0f13] border border-[#b85a00]/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00]/50 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="services" className="block text-white font-medium mb-2">Services (comma-separated)</label>
                  <input
                    id="services"
                    type="text"
                    value={services}
                    onChange={(e) => setServices(e.target.value)}
                    placeholder="e.g. UX/UI Design, Web Development"
                    className="w-full px-4 py-2 bg-[#0f0f13] border border-[#b85a00]/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00]/50 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="technologies" className="block text-white font-medium mb-2">Technologies (comma-separated)</label>
                  <input
                    id="technologies"
                    type="text"
                    value={technologies}
                    onChange={(e) => setTechnologies(e.target.value)}
                    placeholder="e.g. React, Next.js, Tailwind CSS"
                    className="w-full px-4 py-2 bg-[#0f0f13] border border-[#b85a00]/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00]/50 focus:border-transparent"
                  />
                </div>
                
                <div className="col-span-2">
                  <label htmlFor="thumbnailUrl" className="block text-white font-medium mb-2">Thumbnail Image</label>
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-2">
                      <label className="inline-flex items-center px-4 py-2 bg-[#0f0f13] text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer w-fit">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Upload New Thumbnail
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          onChange={handleThumbnailUpload} 
                          accept="image/*" 
                          className="hidden" 
                        />
                      </label>
                      {uploadedThumbnail && (
                        <div className="text-sm text-gray-400">
                          Selected: {uploadedThumbnail.name}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-gray-400 text-sm">
                      <span className="font-medium">OR</span> provide a URL:
                    </div>
                    
                    <div className="flex space-x-2">
                      <input
                        id="thumbnailUrl"
                        type="url"
                        value={thumbnailUrl}
                        onChange={(e) => setThumbnailUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 px-4 py-2 bg-[#0f0f13] border border-[#b85a00]/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00]/50 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => openImageHelper('thumbnail')}
                        className="px-4 py-2 bg-[#0f0f13] text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Find Image
                      </button>
                    </div>
                  </div>
                  
                  {(thumbnailPreview || thumbnailUrl) && (
                    <div className="mt-4 relative w-full h-40 bg-[#0f0f13] rounded-lg overflow-hidden">
                      <img 
                        src={thumbnailPreview || thumbnailUrl} 
                        alt="Thumbnail preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCAxNmw0LjU4Ni00LjU4NmEyIDIgMCAwMTIuODI4IDBMMTYgMTZtLTItMmwxLjU4Ni0xLjU4NmEyIDIgMCAwMTIuODI4IDBMMjAgMTRtLTYtNmguMDFNNiAyMGgxMmEyIDIgMCAwMDItMlY2YTIgMiAwIDAwLTItMkg2YTIgMiAwIDAwLTIgMnYxMmEyIDIgMCAwMDIgMnoiIHN0cm9rZT0iIzY2NiIgc3Ryb2tlLXdpZHRoPSIxLjUiIGZpbGw9Im5vbmUiLz48L3N2Zz4=';
                        }}
                      />
                    </div>
                  )}
                </div>
                
                <div className="col-span-2">
                  <label htmlFor="featured" className="flex items-center space-x-2 text-white">
                    <input
                      id="featured"
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => {
                        console.log('Checkbox changed to:', e.target.checked);
                        setFeatured(e.target.checked);
                      }}
                      className="rounded text-[#b85a00] focus:ring-[#b85a00]"
                    />
                    <span>Featured Project</span>
                  </label>
                  <p className="text-gray-400 text-sm mt-1">
                    Feature this project on the homepage
                  </p>
                </div>
                
                <div className="col-span-2">
                  <label htmlFor="url" className="block text-white font-medium mb-2">Project URL (Optional)</label>
                  <input
                    id="url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-4 py-2 bg-[#0f0f13] border border-[#b85a00]/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00]/50 focus:border-transparent"
                  />
                  <p className="text-gray-400 text-sm mt-1">
                    Enter the URL to the live project if available
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 bg-[#b85a00] hover:bg-[#a04d00] text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <FiSave size={18} />
                      <span>Update Project</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
          
          {showImageHelper && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-6 bg-[#09090b]/95 backdrop-blur-md rounded-xl p-4 md:p-6 border border-[#b85a00]/20"
            >
              <ImageUrlHelper onSelectImage={handleImageSelect} />
            </motion.div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 