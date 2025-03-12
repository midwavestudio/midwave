'use client';

import { useState, useEffect } from 'react';
import { Project, getProjects } from '@/lib/firebase/projectUtils';
import { updateDocument } from '@/lib/firebase/firebaseUtils';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export default function DebugPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const allProjects = await getProjects();
        console.log('All projects:', allProjects);
        setProjects(allProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setMessage(`Error fetching projects: ${error instanceof Error ? error.message : String(error)}`);
        setMessageType('error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const toggleFeatured = async (project: Project) => {
    try {
      const newFeaturedValue = !project.featured;
      console.log(`Toggling featured status for ${project.title} to:`, newFeaturedValue);
      
      await updateDocument('projects', project.id, {
        featured: newFeaturedValue
      });
      
      // Update local state
      setProjects(prevProjects => 
        prevProjects.map(p => 
          p.id === project.id ? { ...p, featured: newFeaturedValue } : p
        )
      );
      
      setMessage(`Project "${project.title}" ${newFeaturedValue ? 'marked as featured' : 'unmarked as featured'}`);
      setMessageType('success');
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null);
        setMessageType(null);
      }, 3000);
    } catch (error) {
      console.error('Error updating project:', error);
      setMessage(`Error updating project: ${error instanceof Error ? error.message : String(error)}`);
      setMessageType('error');
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('localProjects');
    setMessage('Local storage cleared. Refreshing...');
    setMessageType('success');
    
    // Refresh the page after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">Debug Projects</h1>
            
            {message && (
              <div className={`p-4 mb-6 rounded-lg ${
                messageType === 'success' ? 'bg-green-900/20 text-green-300' : 'bg-red-900/20 text-red-300'
              }`}>
                {message}
              </div>
            )}
            
            <div className="mb-6 flex space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={clearLocalStorage}
                className="px-4 py-2 bg-red-900/30 text-red-300 rounded-lg hover:bg-red-900/50 transition-colors"
              >
                Clear Local Storage
              </button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b85a00]"></div>
              </div>
            ) : (
              <div className="bg-[#0f0f13] rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Projects ({projects.length})</h2>
                
                {projects.length === 0 ? (
                  <p className="text-gray-400">No projects found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Title
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Featured
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Featured Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {projects.map((project) => (
                          <tr key={project.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              {project.title}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                              {project.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                project.featured ? 'bg-green-900/30 text-green-300' : 'bg-gray-700 text-gray-300'
                              }`}>
                                {String(project.featured)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                              {typeof project.featured}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => toggleFeatured(project)}
                                className={`px-3 py-1 rounded text-sm ${
                                  project.featured 
                                    ? 'bg-red-900/30 text-red-300 hover:bg-red-900/50' 
                                    : 'bg-green-900/30 text-green-300 hover:bg-green-900/50'
                                }`}
                              >
                                {project.featured ? 'Unmark Featured' : 'Mark Featured'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 