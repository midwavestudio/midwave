'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import ImageUrlHelper from '@/app/components/ImageUrlHelper';
import FirebaseStatus from '@/app/components/FirebaseStatus';
import { addDocument } from '@/lib/firebase/firebaseUtils';
import { Project } from '@/lib/firebase/projectUtils';
import { compressImage } from '@/lib/utils/imageUtils';

export default function NewProject() {
  const router = useRouter();
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
  const [url, setUrl] = useState('');
  const [uploadedThumbnail, setUploadedThumbnail] = useState<File | null>(null);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multipleFileInputRef = useRef<HTMLInputElement>(null);

  // Generate slug from title
  useEffect(() => {
    if (title) {
      setSlug(title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''));
    }
  }, [title]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
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
        order: Date.now() // Use timestamp as order
      };
      
      // Add project to Firestore
      await addDocument('projects', projectData);
      
      setMessage('Project added successfully!');
      setMessageType('success');
      
      // Redirect to admin projects page after a short delay
      setTimeout(() => {
        router.push('/admin/projects');
      }, 1500);
      
    } catch (error) {
      console.error('Error adding project:', error);
      setMessage(`Failed to add project: ${error instanceof Error ? error.message : String(error)}`);
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

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-4">
                <h1 className="text-3xl font-bold text-white">Add New Project</h1>
                <FirebaseStatus />
              </div>
              <button
                onClick={() => router.push('/admin/projects')}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Back to Projects
              </button>
            </div>
            
            {messageType && (
              <div className={`p-4 mb-6 rounded-lg ${
                messageType === 'success' ? 'bg-green-900/20 text-green-300' : 'bg-red-900/20 text-red-300'
              }`}>
                {message}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="bg-[#0f0f13] rounded-lg shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-gray-300 mb-2">Project Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Slug *</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Category *</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00] focus:border-transparent"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-gray-300 mb-2">Short Description *</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={2}
                    className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00] focus:border-transparent"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-gray-300 mb-2">Full Description</label>
                  <textarea
                    value={fullDescription}
                    onChange={(e) => setFullDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Client</label>
                  <input
                    type="text"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Date</label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="e.g. January 2023"
                    className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Services (comma-separated)</label>
                  <input
                    type="text"
                    value={services}
                    onChange={(e) => setServices(e.target.value)}
                    placeholder="e.g. UX/UI Design, Web Development"
                    className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Technologies (comma-separated)</label>
                  <input
                    type="text"
                    value={technologies}
                    onChange={(e) => setTechnologies(e.target.value)}
                    placeholder="e.g. React, Next.js, Tailwind CSS"
                    className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00] focus:border-transparent"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-gray-300 mb-2">Thumbnail Image</label>
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-2">
                      <label className="inline-flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Upload Thumbnail
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
                        type="url"
                        value={thumbnailUrl}
                        onChange={(e) => setThumbnailUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00] focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => openImageHelper('thumbnail')}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Find Image
                      </button>
                    </div>
                  </div>
                  
                  {(thumbnailPreview || thumbnailUrl) && (
                    <div className="mt-4 relative w-full h-40 bg-gray-800 rounded-lg overflow-hidden">
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
                
                <div className="col-span-2 mt-6">
                  <label className="block text-gray-300 mb-2">Project Images</label>
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-2">
                      <label className="inline-flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Upload Images
                        <input 
                          type="file" 
                          ref={multipleFileInputRef}
                          onChange={handleImagesUpload} 
                          accept="image/*" 
                          multiple
                          className="hidden" 
                        />
                      </label>
                      {uploadedImages.length > 0 && (
                        <div className="text-sm text-gray-400">
                          Selected: {uploadedImages.length} image(s)
                        </div>
                      )}
                    </div>
                    
                    <div className="text-gray-400 text-sm">
                      <span className="font-medium">OR</span> provide URLs (comma-separated):
                    </div>
                    
                    <div className="flex space-x-2 mb-2">
                      <textarea
                        value={imageUrls}
                        onChange={(e) => setImageUrls(e.target.value)}
                        rows={3}
                        placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                        className="flex-1 px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00] focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => openImageHelper('gallery')}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors h-fit"
                      >
                        Find Images
                      </button>
                    </div>
                  </div>
                  
                  {/* Preview of all images (both uploaded and from URLs) */}
                  <div className="mt-4">
                    <div className="grid grid-cols-3 gap-2">
                      {/* Previews for URL images */}
                      {imageUrls.split(',').map((url, index) => {
                        const trimmedUrl = url.trim();
                        if (!trimmedUrl) return null;
                        
                        return (
                          <div key={`url-${index}`} className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden group">
                            <img 
                              src={trimmedUrl} 
                              alt={`Gallery image ${index + 1}`} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCAxNmw0LjU4Ni00LjU4NmEyIDIgMCAwMTIuODI4IDBMMTYgMTZtLTItMmwxLjU4Ni0xLjU4NmEyIDIgMCAwMTIuODI4IDBMMjAgMTRtLTYtNmguMDFNNiAyMGgxMmEyIDIgMCAwMDItMlY2YTIgMiAwIDAwLTItMkg2YTIgMiAwIDAwLTIgMnYxMmEyIDIgMCAwMDIgMnoiIHN0cm9rZT0iIzY2NiIgc3Ryb2tlLXdpZHRoPSIxLjUiIGZpbGw9Im5vbmUiLz48L3N2Zz4=';
                              }}
                            />
                          </div>
                        );
                      })}
                      
                      {/* Previews for uploaded images */}
                      {imagePreviewUrls.map((previewUrl, index) => (
                        <div key={`upload-${index}`} className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden group">
                          <img 
                            src={previewUrl} 
                            alt={`Uploaded image ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeUploadedImage(index)}
                            className="absolute top-1 right-1 bg-red-500/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove image"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-gray-400 text-sm mt-4">
                    Add images by uploading files or providing URLs. These will be displayed in the project modal.
                  </p>
                </div>
                
                <div className="col-span-2">
                  <label className="flex items-center space-x-2 text-gray-300">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="rounded text-[#b85a00] focus:ring-[#b85a00]"
                    />
                    <span>Featured Project</span>
                  </label>
                </div>
                
                <div className="col-span-2">
                  <label className="block text-gray-300 mb-2">Project URL (Optional)</label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00] focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter the URL to the live project if available</p>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    isSubmitting
                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                      : 'bg-[#b85a00] text-white hover:bg-[#a04d00]'
                  }`}
                >
                  {isSubmitting ? 'Adding Project...' : 'Add Project'}
                </button>
              </div>
            </form>
            
            {showImageHelper && (
              <div className="mt-6">
                <ImageUrlHelper onSelectImage={handleImageSelect} />
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 