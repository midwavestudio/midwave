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
import { Project, getProjects, compressImage } from '@/lib/firebase/projectUtils';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import Link from 'next/link';
import { motion } from 'framer-motion';
import AdminLayout from '../../AdminLayout';

// Define the props type to match Next.js's expectations
type EditProjectProps = {
  params: {
    id: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function EditProject({ params }: EditProjectProps) {
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
    const fetchProject = async () => {
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
    };

    fetchProject();
  }, [params.id]);

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
        const compressedImage = await compressImage(file, 600, 400, 0.7);
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

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b85a00]"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Edit Project</h1>
        <p className="text-gray-500">Update project details</p>
      </div>
      
      {message && (
        <div className={`p-4 mb-6 rounded-lg ${
          messageType === 'success' ? 'bg-green-900/20 text-green-300' : 'bg-red-900/20 text-red-300'
        }`}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label htmlFor="title" className="block mb-2 font-medium">
              Project Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg"
            />
          </div>
          
          <div>
            <label htmlFor="slug" className="block mb-2 font-medium">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg"
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block mb-2 font-medium">
              Category <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg"
            />
          </div>
          
          <div className="col-span-2">
            <label htmlFor="description" className="block mb-2 font-medium">
              Short Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={2}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg"
            />
          </div>
          
          <div className="col-span-2">
            <label htmlFor="fullDescription" className="block mb-2 font-medium">
              Full Description
            </label>
            <textarea
              id="fullDescription"
              name="fullDescription"
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              rows={4}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg"
            />
          </div>
          
          <div>
            <label htmlFor="client" className="block mb-2 font-medium">
              Client
            </label>
            <input
              type="text"
              id="client"
              name="client"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg"
            />
          </div>
          
          <div>
            <label htmlFor="date" className="block mb-2 font-medium">
              Date
            </label>
            <input
              type="text"
              id="date"
              name="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="e.g. January 2023"
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg"
            />
          </div>
          
          <div>
            <label htmlFor="services" className="block mb-2 font-medium">
              Services (comma-separated)
            </label>
            <input
              type="text"
              id="services"
              name="services"
              value={services}
              onChange={(e) => setServices(e.target.value)}
              placeholder="e.g. UX/UI Design, Web Development"
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg"
            />
          </div>
          
          <div>
            <label htmlFor="technologies" className="block mb-2 font-medium">
              Technologies (comma-separated)
            </label>
            <input
              type="text"
              id="technologies"
              name="technologies"
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              placeholder="e.g. React, Next.js, Tailwind CSS"
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg"
            />
          </div>
          
          <div className="col-span-2">
            <label htmlFor="thumbnailUrl" className="block mb-2 font-medium">
              Thumbnail URL
            </label>
            <input
              type="text"
              id="thumbnailUrl"
              name="thumbnailUrl"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg"
            />
            <p className="mt-1 text-gray-400 text-sm">
              Enter a URL or upload an image below
            </p>
          </div>
          
          <div className="col-span-2">
            <label htmlFor="thumbnailUpload" className="block mb-2 font-medium">
              Upload New Thumbnail
            </label>
            <input
              type="file"
              id="thumbnailUpload"
              accept="image/*"
              onChange={handleThumbnailUpload}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg"
            />
            {thumbnailPreview && (
              <div className="mt-2">
                <p className="text-gray-400 mb-1">Preview:</p>
                <div className="relative w-32 h-32">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="object-cover w-full h-full rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="col-span-2">
            <label htmlFor="imagesUpload" className="block mb-2 font-medium">
              Add Project Images
            </label>
            <input
              type="file"
              id="imagesUpload"
              accept="image/*"
              multiple
              onChange={handleImagesUpload}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg"
            />
          </div>
          
          <div className="col-span-2">
            <label className="block mb-2 font-medium">
              Project Images
            </label>
            {imagePreviewUrls.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Project image ${index + 1}`}
                      className="object-cover w-full h-24 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeUploadedImage(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"
                      aria-label="Remove image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No images uploaded yet</p>
            )}
          </div>
          
          <div className="col-span-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={featured}
                onChange={(e) => {
                  console.log('Checkbox changed to:', e.target.checked);
                  setFeatured(e.target.checked);
                }}
                className="mr-2"
              />
              <label htmlFor="featured" className="font-medium">
                Featured project
              </label>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Featured projects are displayed on the homepage
            </p>
          </div>
          
          <div className="col-span-2">
            <label htmlFor="url" className="block mb-2 font-medium">
              Project URL (Optional)
            </label>
            <input
              type="url"
              id="url"
              name="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg"
            />
            <p className="mt-1 text-gray-400 text-sm">
              Enter the URL to the live project if available
            </p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.push('/admin/projects')}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 bg-[#b85a00] text-white rounded-lg ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#a04d00]'
            }`}
          >
            {isSubmitting ? 'Updating...' : 'Update Project'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
} 