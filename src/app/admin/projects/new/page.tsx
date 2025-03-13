'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Project, compressImage } from '@/lib/firebase/projectUtils';
import AdminLayout from '../AdminLayout';

interface FormData {
  title: string;
  description: string;
  category: string;
  thumbnailUrl: string;
  featured: boolean;
}

export default function NewProjectPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    thumbnailUrl: '',
    featured: false,
  });
  const [uploadedThumbnail, setUploadedThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Generate a unique ID
      const id = `project-${Date.now()}`;
      
      // Process thumbnail to base64 if uploaded
      let thumbnailUrl = formData.thumbnailUrl;
      if (uploadedThumbnail) {
        try {
          thumbnailUrl = await compressImage(uploadedThumbnail);
          console.log('Thumbnail compressed and converted to base64');
        } catch (imgError) {
          console.error('Error compressing thumbnail:', imgError);
          if (thumbnailPreview) {
            thumbnailUrl = thumbnailPreview;
          }
        }
      }
      
      // Process uploaded images to base64
      const processedImageUrls = await Promise.all(
        uploadedImages.map(async (file, index) => {
          try {
            return await compressImage(file);
          } catch (imgError) {
            console.error(`Error compressing image ${index}:`, imgError);
            return imagePreviewUrls[index] || '';
          }
        })
      ).then(urls => urls.filter(url => url !== ''));
      
      // Create new project with featured explicitly set as a boolean
      const newProject: Project = {
        id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        thumbnailUrl,
        imageUrls: processedImageUrls,
        featured: Boolean(formData.featured), // Ensure it's a boolean
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        slug: formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
      };
      
      console.log(`Creating new project "${newProject.title}" with featured status: ${newProject.featured} (${typeof newProject.featured})`);
      console.log(`Project has ${processedImageUrls.length} images`);
      
      // Get existing projects if any
      let projects: Project[] = [];
      try {
        const existingProjects = localStorage.getItem('localProjects');
        projects = existingProjects ? JSON.parse(existingProjects) : [];
      } catch (parseError) {
        console.error('Error parsing existing projects:', parseError);
        projects = [];
      }
      
      // Add new project
      projects.push(newProject);
      
      // Save to localStorage
      localStorage.setItem('localProjects', JSON.stringify(projects));
      
      // Verify the save was successful
      const savedData = localStorage.getItem('localProjects');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        const savedProject = parsedData.find((p: Project) => p.id === id);
        console.log(`Project saved successfully. Featured status: ${savedProject?.featured} (${typeof savedProject?.featured})`);
        console.log(`Project has ${savedProject?.imageUrls?.length || 0} images saved`);
      }
      
      // Navigate back to projects page
      router.push('/admin/projects');
    } catch (error) {
      console.error('Error creating project:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred while creating the project');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Create New Project</h1>
        <p className="text-gray-500">Add a new project to your portfolio</p>
      </div>
      
      {errorMessage && (
        <div className="bg-red-900/20 text-red-300 p-4 rounded-lg mb-6">
          <p>{errorMessage}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block mb-2 font-medium">
            Project Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block mb-2 font-medium">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg"
          />
        </div>
        
        <div>
          <label htmlFor="category" className="block mb-2 font-medium">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg"
          >
            <option value="">Select a category</option>
            <option value="Web Development">Web Development</option>
            <option value="Mobile App">Mobile App</option>
            <option value="UI/UX Design">UI/UX Design</option>
            <option value="Branding">Branding</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="thumbnailUrl" className="block mb-2 font-medium">
            Thumbnail URL (optional)
          </label>
          <input
            type="url"
            id="thumbnailUrl"
            name="thumbnailUrl"
            value={formData.thumbnailUrl}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg"
          />
          <p className="mt-1 text-gray-400 text-sm">
            Enter a URL or upload an image below
          </p>
        </div>
        
        <div>
          <label htmlFor="thumbnailUpload" className="block mb-2 font-medium">
            Upload Thumbnail (optional)
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
        
        <div>
          <label htmlFor="imagesUpload" className="block mb-2 font-medium">
            Upload Project Images (optional)
          </label>
          <input
            type="file"
            id="imagesUpload"
            accept="image/*"
            multiple
            onChange={handleImagesUpload}
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg"
          />
          {imagePreviewUrls.length > 0 && (
            <div className="mt-2">
              <p className="text-gray-400 mb-1">Previews:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
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
            </div>
          )}
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="featured"
            name="featured"
            checked={formData.featured}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="featured" className="font-medium">
            Featured project
          </label>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
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
            {isSubmitting ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
} 