'use client';

import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { FiSave, FiX, FiImage, FiPlus, FiTrash2 } from 'react-icons/fi';
import AdminLayout from '../AdminLayout';
import { Project } from '@/lib/firebase/projectUtils';
import { uploadCompressedImageToBlob, uploadMultipleImagesToBlob } from '@/lib/utils/blobUtils';
import React from 'react';

// Helper to slugify a string
const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

export default function NewProjectPage() {
  const router = useRouter();
  
  // Initialize form with empty project data
  const [formData, setFormData] = useState<Project>({
    id: '',
    title: '',
    slug: '',
    category: '',
    description: '',
    fullDescription: '',
    client: '',
    date: new Date().toISOString().split('T')[0],
    services: [],
    technologies: [],
    thumbnailUrl: '',
    imageUrls: [],
    url: '',
    featured: false,
    order: 0
  });
  
  const [serviceInput, setServiceInput] = useState('');
  const [technologyInput, setTechnologyInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [imagesPreviews, setImagesPreviews] = useState<string[]>([]);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  
  const thumbnailFileRef = useRef<HTMLInputElement>(null);
  const imageFileRef = useRef<HTMLInputElement>(null);
  
  // Handle form input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox input separately
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }
    
    // Auto-generate slug when title changes
    if (name === 'title' && value) {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        slug: slugify(value),
        id: slugify(value) // Set ID same as slug for new projects
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear any error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Add service to the list
  const addService = () => {
    if (serviceInput.trim() && !formData.services?.includes(serviceInput.trim())) {
      setFormData(prev => ({
        ...prev,
        services: [...(prev.services || []), serviceInput.trim()]
      }));
      setServiceInput('');
    }
  };
  
  // Remove service from the list
  const removeService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services?.filter((_, i) => i !== index) || []
    }));
  };
  
  // Add technology to the list
  const addTechnology = () => {
    if (technologyInput.trim() && !formData.technologies?.includes(technologyInput.trim())) {
      setFormData(prev => ({
        ...prev,
        technologies: [...(prev.technologies || []), technologyInput.trim()]
      }));
      setTechnologyInput('');
    }
  };
  
  // Remove technology from the list
  const removeTechnology = (index: number) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies?.filter((_, i) => i !== index) || []
    }));
  };
  
  // Handle thumbnail upload
  const handleThumbnailUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      // Show loading state
      setThumbnailPreview('loading');
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.thumbnailUrl;
        return newErrors;
      });
      
      // Upload to Vercel Blob
      const result = await uploadCompressedImageToBlob(
        file, 
        800, 
        600, 
        0.8, 
        `thumbnail-${Date.now()}-${file.name}`
      );
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setThumbnailPreview(result.url);
      setFormData(prev => ({ ...prev, thumbnailUrl: result.url }));
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      setThumbnailPreview(null);
      setErrors(prev => ({ 
        ...prev, 
        thumbnailUrl: error instanceof Error ? error.message : 'Failed to upload thumbnail image' 
      }));
    }
  };
  
  // Handle images upload
  const handleImagesUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      // Clear any previous errors
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.imageUrls;
        return newErrors;
      });
      
      // Convert FileList to Array
      const fileArray = Array.from(files);
      
      // Upload to Vercel Blob
      const result = await uploadMultipleImagesToBlob(fileArray, 1200, 800, 0.9);
      
      if (result.errors.length > 0) {
        console.error('Some images failed to upload:', result.errors);
        setErrors(prev => ({ 
          ...prev, 
          imageUrls: `Some images failed to upload: ${result.errors.join(', ')}` 
        }));
      }
      
      if (result.urls.length > 0) {
        setImagesPreviews(prev => [...prev, ...result.urls]);
        setFormData(prev => ({
          ...prev,
          imageUrls: [...prev.imageUrls, ...result.urls]
        }));
      }
      
      // Reset file input
      if (imageFileRef.current) {
        imageFileRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      setErrors(prev => ({ 
        ...prev, 
        imageUrls: error instanceof Error ? error.message : 'Failed to upload images' 
      }));
    }
  };
  
  // Remove image preview and file
  const removeImage = (index: number) => {
    setImagesPreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
  };
  
  // Clear all images
  const clearAllImages = () => {
    setImagesPreviews([]);
    setFormData(prev => ({ ...prev, imageUrls: [] }));
    if (imageFileRef.current) {
      imageFileRef.current.value = '';
    }
  };
  
  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Project title is required';
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = 'Project slug is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    setErrors({});
    
    try {
      // Create project object with current timestamp
      const newProject: Project = {
        ...formData,
        id: formData.slug,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Project & { createdAt: string; updatedAt: string };
      
      console.log('Creating new project:', newProject.title);
      
      // Save to cloud storage
      try {
        const { createProject } = await import('@/lib/api/projectsApi');
        
        const createdProject = await createProject({
          title: newProject.title,
          slug: newProject.slug,
          category: newProject.category,
          description: newProject.description,
          fullDescription: newProject.fullDescription,
          client: newProject.client,
          date: newProject.date,
          services: newProject.services,
          technologies: newProject.technologies,
          thumbnailUrl: newProject.thumbnailUrl,
          imageUrls: newProject.imageUrls,
          url: newProject.url,
          featured: newProject.featured,
          order: newProject.order,
        });
        
        console.log('Project created successfully in cloud:', createdProject.title);
        
        // Redirect back to projects page
        router.push('/admin/projects');
      } catch (error) {
        console.error('Error saving project to cloud:', error);
        setErrors(prev => ({ 
          ...prev, 
          submit: error instanceof Error ? error.message : 'Failed to create project. Please try again.' 
        }));
      }
    } catch (error) {
      console.error('Error creating project:', error);
      setErrors(prev => ({ 
        ...prev, 
        submit: 'Failed to create project. Please try again.' 
      }));
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Create New Project</h1>
            <p className="text-gray-400">Add a new project to your portfolio</p>
          </div>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.push('/admin/projects')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
            >
              <FiX size={16} />
              <span>Cancel</span>
            </button>
            
            <button
              type="submit"
              form="project-form"
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-[#b85a00] hover:bg-[#a04d00] text-white rounded-lg disabled:opacity-50"
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              ) : (
                <FiSave size={16} />
              )}
              <span>Create Project</span>
            </button>
          </div>
        </div>
        
        {/* Error message */}
        {errors.submit && (
          <div className="p-4 bg-red-900/20 text-red-300 rounded-lg">
            {errors.submit}
          </div>
        )}
        
        {/* Form */}
        <form id="project-form" onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Project Details */}
            <div className="space-y-6">
              {/* Basic Project Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                  Project Information
                </h2>
                
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                      Project Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 bg-gray-800 border ${
                        errors.title ? 'border-red-500' : 'border-gray-700'
                      } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00]/50`}
                      placeholder="Enter project title"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                    )}
                  </div>
                  
                  {/* Slug */}
                  <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-300 mb-1">
                      URL Slug <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 bg-gray-800 border ${
                        errors.slug ? 'border-red-500' : 'border-gray-700'
                      } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00]/50`}
                      placeholder="project-url-slug"
                    />
                    {errors.slug && (
                      <p className="mt-1 text-sm text-red-500">{errors.slug}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">
                      This will be used in the URL: /projects/{formData.slug}
                    </p>
                  </div>
                  
                  {/* Category and Client */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00]/50"
                        placeholder="e.g., Web Development"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="client" className="block text-sm font-medium text-gray-300 mb-1">
                        Client
                      </label>
                      <input
                        type="text"
                        id="client"
                        name="client"
                        value={formData.client || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00]/50"
                        placeholder="Client name"
                      />
                    </div>
                  </div>
                  
                  {/* Date and URL */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">
                        Project Date
                      </label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00]/50"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-1">
                        Project URL
                      </label>
                      <input
                        type="url"
                        id="url"
                        name="url"
                        value={formData.url || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00]/50"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                  
                  {/* Featured Project Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Featured Project
                      </label>
                      <div className="pt-2">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="featured"
                            checked={Boolean(formData.featured)}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            formData.featured ? 'bg-[#b85a00]' : 'bg-gray-700'
                          }`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              formData.featured ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </div>
                          <span className="ml-2 text-gray-300 text-sm">
                            {formData.featured ? 'Yes' : 'No'}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Services & Technologies */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                  Services & Technologies
                </h2>
                
                <div className="space-y-4">
                  {/* Services */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Services
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={serviceInput}
                        onChange={(e) => setServiceInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00]/50"
                        placeholder="e.g., Web Design"
                      />
                      <button
                        type="button"
                        onClick={addService}
                        className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
                      >
                        <FiPlus size={16} />
                      </button>
                    </div>
                    
                    {formData.services && formData.services.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {formData.services.map((service, index) => (
                          <div 
                            key={index} 
                            className="flex items-center bg-gray-700 text-gray-200 px-2 py-1 rounded-md text-sm"
                          >
                            <span>{service}</span>
                            <button
                              type="button"
                              onClick={() => removeService(index)}
                              className="ml-1.5 text-gray-400 hover:text-red-400"
                            >
                              <FiX size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Technologies */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Technologies
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={technologyInput}
                        onChange={(e) => setTechnologyInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00]/50"
                        placeholder="e.g., React"
                      />
                      <button
                        type="button"
                        onClick={addTechnology}
                        className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
                      >
                        <FiPlus size={16} />
                      </button>
                    </div>
                    
                    {formData.technologies && formData.technologies.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {formData.technologies.map((tech, index) => (
                          <div 
                            key={index} 
                            className="flex items-center bg-gray-700 text-gray-200 px-2 py-1 rounded-md text-sm"
                          >
                            <span>{tech}</span>
                            <button
                              type="button"
                              onClick={() => removeTechnology(index)}
                              className="ml-1.5 text-gray-400 hover:text-red-400"
                            >
                              <FiX size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Media & Description */}
            <div className="space-y-6">
              {/* Project Media */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                  Project Media
                </h2>
                
                <div className="space-y-4">
                  {/* Thumbnail Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Thumbnail Image
                    </label>
                    <div className="mt-1 flex items-center gap-4">
                      <div className="w-24 h-24 bg-gray-800 border border-gray-700 rounded-md overflow-hidden flex items-center justify-center">
                        {thumbnailPreview === 'loading' ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#b85a00]"></div>
                        ) : thumbnailPreview ? (
                          <img 
                            src={thumbnailPreview} 
                            alt="Thumbnail preview" 
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => setExpandedImage(thumbnailPreview)}
                          />
                        ) : (
                          <FiImage size={24} className="text-gray-500" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div>
                          <input 
                            type="file"
                            ref={thumbnailFileRef}
                            onChange={handleThumbnailUpload}
                            accept="image/*"
                            className="hidden"
                          />
                          
                          <button
                            type="button"
                            onClick={() => thumbnailFileRef.current?.click()}
                            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
                          >
                            Select Thumbnail
                          </button>
                          
                          <p className="mt-1 text-xs text-gray-400">
                            Recommended size: 800x600px. Max size: 2MB
                          </p>
                        </div>
                        
                        {errors.thumbnailUrl && (
                          <p className="mt-1 text-sm text-red-500">{errors.thumbnailUrl}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Project Images Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Project Images
                    </label>
                    <div className="mt-1 space-y-3">
                      <div className="flex gap-2">
                        <input 
                          type="file"
                          ref={imageFileRef}
                          onChange={handleImagesUpload}
                          accept="image/*"
                          multiple
                          className="hidden"
                        />
                        
                        <button
                          type="button"
                          onClick={() => imageFileRef.current?.click()}
                          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
                        >
                          Add Images
                        </button>
                        
                        {imagesPreviews.length > 0 && (
                          <button
                            type="button"
                            onClick={clearAllImages}
                            className="px-3 py-2 bg-red-700 hover:bg-red-600 text-white rounded-md"
                          >
                            Clear All Images
                          </button>
                        )}
                      </div>
                      
                      <p className="mt-1 text-xs text-gray-400">
                        Recommended size: 1200x800px. Max size: 5MB per image
                      </p>
                      
                      {errors.imageUrls && (
                        <p className="mt-1 text-sm text-red-500">{errors.imageUrls}</p>
                      )}
                    </div>
                    
                    {/* Image Previews */}
                    {imagesPreviews.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {imagesPreviews.map((image, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={image} 
                              alt={`Project image ${index + 1}`} 
                              className="w-full h-32 object-cover rounded-md cursor-pointer"
                              onClick={() => setExpandedImage(image)}
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Expanded Image Modal */}
              {expandedImage && (
                <div 
                  className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                  onClick={() => setExpandedImage(null)}
                >
                  <div className="relative max-w-screen-xl max-h-screen">
                    <img 
                      src={expandedImage} 
                      alt="Expanded view" 
                      className="max-w-full max-h-[90vh] object-contain rounded-lg"
                    />
                    <button
                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedImage(null);
                      }}
                    >
                      <FiX size={24} />
                    </button>
                  </div>
                </div>
              )}
              
              {/* Project Descriptions */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                  Project Descriptions
                </h2>
                
                <div className="space-y-4">
                  {/* Short Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                      Short Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={2}
                      className={`w-full px-3 py-2 bg-gray-800 border ${
                        errors.description ? 'border-red-500' : 'border-gray-700'
                      } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00]/50`}
                      placeholder="Brief description of the project (shown in cards)"
                    ></textarea>
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                    )}
                  </div>
                  
                  {/* Full Description */}
                  <div>
                    <label htmlFor="fullDescription" className="block text-sm font-medium text-gray-300 mb-1">
                      Full Description
                    </label>
                    <textarea
                      id="fullDescription"
                      name="fullDescription"
                      value={formData.fullDescription || ''}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00]/50"
                      placeholder="Detailed description of the project (shown in project details)"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
} 