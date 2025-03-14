'use client';

import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { FiSave, FiX, FiImage, FiPlus, FiTrash2 } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';
import AdminLayout from '../AdminLayout';
import { compressImage, Project, PLACEHOLDER_IMAGES } from '@/lib/firebase/projectUtils';

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

// Default project data
const DEFAULT_PROJECT: Omit<Project, 'id'> = {
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
};

export default function NewProjectPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<Omit<Project, 'id'>>(DEFAULT_PROJECT);
  const [serviceInput, setServiceInput] = useState('');
  const [technologyInput, setTechnologyInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [imagesPreviews, setImagesPreviews] = useState<string[]>([]);
  
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
        slug: slugify(value)
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
    if (serviceInput.trim()) {
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
      services: (prev.services || []).filter((_, i) => i !== index)
    }));
  };
  
  // Add technology to the list
  const addTechnology = () => {
    if (technologyInput.trim()) {
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
      technologies: (prev.technologies || []).filter((_, i) => i !== index)
    }));
  };
  
  // Handle thumbnail upload
  const handleThumbnailUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      // Handle image compression
      const base64Image = await compressImage(file, 800, 600, 0.8);
      setThumbnailPreview(base64Image);
      setFormData(prev => ({ ...prev, thumbnailUrl: base64Image }));
    } catch (error) {
      console.error('Error compressing thumbnail:', error);
      setErrors(prev => ({ ...prev, thumbnailUrl: 'Failed to process thumbnail image' }));
    }
  };
  
  // Handle project images upload
  const handleImagesUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      const newImagePromises = Array.from(files).map(file => 
        compressImage(file, 1200, 800, 0.8)
      );
      
      const newImages = await Promise.all(newImagePromises);
      
      setImagesPreviews(prev => [...prev, ...newImages]);
      setFormData(prev => ({
        ...prev,
        imageUrls: [...(prev.imageUrls || []), ...newImages]
      }));
    } catch (error) {
      console.error('Error compressing images:', error);
      setErrors(prev => ({ ...prev, imageUrls: 'Failed to process project images' }));
    }
  };
  
  // Remove a project image
  const removeImage = (index: number) => {
    setImagesPreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      imageUrls: (prev.imageUrls || []).filter((_, i) => i !== index)
    }));
  };
  
  // Validate form before submission
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    // Use placeholder thumbnail if none provided
    if (!formData.thumbnailUrl) {
      setFormData(prev => ({
        ...prev,
        thumbnailUrl: PLACEHOLDER_IMAGES.THUMBNAIL
      }));
    }
    
    // Use placeholder images if none provided
    if (!formData.imageUrls || formData.imageUrls.length === 0) {
      setFormData(prev => ({
        ...prev,
        imageUrls: [PLACEHOLDER_IMAGES.PROJECT]
      }));
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
    
    setIsLoading(true);
    
    try {
      // Create a unique ID for the project
      const id = uuidv4();
      
      // Ensure featured is a boolean
      const featured = Boolean(formData.featured);
      
      // Create project object
      const project: Project = {
        id,
        ...formData,
        featured,
        order: Number(formData.order) || 0
      };
      
      console.log('Creating new project:', project.title, '| Featured:', featured);
      
      // Store the project in localStorage
      if (typeof window !== 'undefined') {
        try {
          // Get existing projects
          const existingData = localStorage.getItem('localProjects');
          let projects: Project[] = [];
          
          if (existingData) {
            projects = JSON.parse(existingData);
          }
          
          // Add new project
          projects.push(project);
          
          // Save back to localStorage
          localStorage.setItem('localProjects', JSON.stringify(projects));
          
          // Verify the save
          const verifyData = localStorage.getItem('localProjects');
          const verifyProjects = verifyData ? JSON.parse(verifyData) as Project[] : [];
          const savedProject = verifyProjects.find(p => p.id === id);
          
          if (!savedProject) {
            throw new Error('Failed to verify project was saved');
          }
          
          console.log('New project saved successfully with id:', id);
          
          // Redirect back to projects page
          router.push('/admin/projects');
        } catch (error) {
          console.error('Error saving project to localStorage:', error);
          setErrors(prev => ({ 
            ...prev, 
            submit: 'Failed to save project. Please try again.' 
          }));
        }
      }
    } catch (error) {
      console.error('Error creating project:', error);
      setErrors(prev => ({ 
        ...prev, 
        submit: 'Failed to create project. Please try again.' 
      }));
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">New Project</h1>
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
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-[#b85a00] hover:bg-[#a04d00] text-white rounded-lg disabled:opacity-50"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              ) : (
                <FiSave size={16} />
              )}
              <span>Save Project</span>
            </button>
          </div>
        </div>
        
        {/* Error Message */}
        {errors.submit && (
          <div className="p-4 bg-red-900/20 text-red-300 rounded-lg">
            {errors.submit}
          </div>
        )}
        
        {/* Form */}
        <form id="project-form" onSubmit={handleSubmit} className="space-y-6">
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
                      Title <span className="text-red-500">*</span>
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
                      placeholder="Project Title"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                    )}
                  </div>
                  
                  {/* Slug */}
                  <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-300 mb-1">
                      Slug (URL-friendly name)
                    </label>
                    <input
                      type="text"
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00]/50"
                      placeholder="project-slug"
                    />
                    <p className="mt-1 text-xs text-gray-400">
                      Auto-generated from title. Used in URLs.
                    </p>
                  </div>
                  
                  {/* Category */}
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 bg-gray-800 border ${
                        errors.category ? 'border-red-500' : 'border-gray-700'
                      } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00]/50`}
                      placeholder="Web Development, UI/UX Design, etc."
                    />
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-500">{errors.category}</p>
                    )}
                  </div>
                  
                  {/* Client (Optional) */}
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
                      placeholder="Client Name (optional)"
                    />
                  </div>
                  
                  {/* Date */}
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">
                      Date
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
                  
                  {/* Project URL (Optional) */}
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
                  
                  {/* Featured & Order */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label htmlFor="order" className="block text-sm font-medium text-gray-300 mb-1">
                        Display Order
                      </label>
                      <input
                        type="number"
                        id="order"
                        name="order"
                        value={formData.order || 0}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00]/50"
                      />
                    </div>
                    
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
              
              {/* Tags */}
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
                        {thumbnailPreview ? (
                          <img 
                            src={thumbnailPreview} 
                            alt="Thumbnail preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FiImage size={24} className="text-gray-500" />
                        )}
                      </div>
                      
                      <div className="flex-1">
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
                    <div className="mt-1">
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
                              className="w-full h-32 object-cover rounded-md"
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