'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import BackgroundDesign from '../../../components/BackgroundDesign';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import Link from 'next/link';
import { Project } from '@/lib/firebase/projectUtils';

export default function NewProjectPage() {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: target.checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Generate a unique ID
      const id = `project-${Date.now()}`;
      
      // Create new project with featured explicitly set as a boolean
      const newProject: Project = {
        id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        thumbnail: formData.thumbnailUrl,
        featured: Boolean(formData.featured), // Ensure it's a boolean
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        slug: formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
      };
      
      console.log(`Creating new project "${newProject.title}" with featured status: ${newProject.featured} (${typeof newProject.featured})`);
      
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
      }
      
      // Navigate back to projects page
      router.push('/admin/projects');
    } catch (e) {
      console.error('Error saving project:', e);
      setErrorMessage('Failed to save project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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