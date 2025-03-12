'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import BackgroundDesign from '../../../components/BackgroundDesign';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import Link from 'next/link';

export default function NewProjectPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    thumbnailUrl: '',
    featured: false,
  });

  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Create a new project in localStorage for now
      // In a real app, you would save to Firestore
      const newProject = {
        ...formData,
        id: `local-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        slug: formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
        // Ensure featured is a boolean
        featured: Boolean(formData.featured)
      };

      console.log(`Creating new project "${newProject.title}" with featured = ${newProject.featured} (type: ${typeof newProject.featured})`);

      // Save to localStorage with error handling
      if (typeof window !== 'undefined') {
        try {
          // Get existing projects
          let projects: any[] = [];
          const localProjects = localStorage.getItem('localProjects');
          
          if (localProjects) {
            try {
              projects = JSON.parse(localProjects);
              console.log('Found existing projects:', projects.length);
            } catch (parseError) {
              console.error('Error parsing existing projects:', parseError);
              projects = [];
            }
          }
          
          // Add new project
          projects.push(newProject);
          
          // Save back to localStorage
          localStorage.setItem('localProjects', JSON.stringify(projects));
          
          // Verify the save
          const verifyProjects = localStorage.getItem('localProjects');
          if (verifyProjects) {
            try {
              const parsedVerify = JSON.parse(verifyProjects);
              const savedProject = parsedVerify.find((p: any) => p.id === newProject.id);
              if (savedProject) {
                console.log(`Project saved successfully with featured = ${savedProject.featured} (type: ${typeof savedProject.featured})`);
              }
            } catch (verifyError) {
              console.error('Error verifying saved project:', verifyError);
            }
          }
          
          // Redirect to admin projects page
          router.push('/admin/projects');
        } catch (storageError) {
          console.error('Error accessing localStorage:', storageError);
          setErrorMessage('Error saving to localStorage. Your browser may have restrictions on localStorage in private/incognito mode.');
        }
      } else {
        console.warn('Window is not defined, cannot access localStorage');
        setErrorMessage('Cannot access localStorage');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
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
            className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 md:p-6 mb-6"
          >
            <div className="flex justify-between items-center">
              <h1 className="text-2xl md:text-3xl font-bold text-white">Add New Project</h1>
              <Link 
                href="/admin/projects" 
                className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg transition-colors text-sm"
              >
                <FiArrowLeft size={16} />
                <span>Back to Projects</span>
              </Link>
            </div>
            <p className="text-gray-400 text-sm md:text-base mt-2">
              Create a new project to showcase in your portfolio
            </p>
          </motion.div>
          
          {errorMessage && (
            <div className="bg-red-900/20 text-red-300 p-4 rounded-lg mb-6 text-sm md:text-base">
              <p>Error: {errorMessage}</p>
            </div>
          )}
          
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 md:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                    Project Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00] focus:border-transparent"
                    placeholder="Enter project title"
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00] focus:border-transparent"
                    placeholder="Describe your project"
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00] focus:border-transparent"
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
                  <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-gray-300 mb-1">
                    Thumbnail URL
                  </label>
                  <input
                    type="url"
                    id="thumbnailUrl"
                    name="thumbnailUrl"
                    value={formData.thumbnailUrl}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00] focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Enter a URL for the project thumbnail image
                  </p>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="h-4 w-4 text-[#b85a00] focus:ring-[#b85a00] border-gray-700 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-300">
                    Feature this project on the homepage
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#b85a00] hover:bg-[#a04d00] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiSave size={16} />
                  <span>{isSubmitting ? 'Saving...' : 'Save Project'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 