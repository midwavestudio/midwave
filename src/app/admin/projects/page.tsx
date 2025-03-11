'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import FirebaseStatus from '@/app/components/FirebaseStatus';
import { Project, getProjects } from '@/lib/firebase/projectUtils';
import { deleteDocument } from '@/lib/firebase/firebaseUtils';
import Link from 'next/link';

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'warning' | null>(null);
  const [usingLocalStorage, setUsingLocalStorage] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchProjects();
  }, []);

  const clearLocalProjects = () => {
    if (window.confirm('Are you sure you want to clear all locally stored projects? This cannot be undone.')) {
      localStorage.removeItem('localProjects');
      setUsingLocalStorage(false);
      setMessage('Local projects cleared successfully');
      setMessageType('success');
      fetchProjects();
    }
  };

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const projectsData = await getProjects();
      setProjects(projectsData);
      
      // Check if we're using localStorage
      if (typeof window !== 'undefined') {
        const localProjects = localStorage.getItem('localProjects');
        if (localProjects) {
          const parsedProjects = JSON.parse(localProjects);
          if (parsedProjects.length > 0) {
            setUsingLocalStorage(true);
            setMessage('Some projects are stored in localStorage because Firebase is not properly initialized. These projects will only be visible on this device.');
            setMessageType('warning');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      
      // Check if it's a Firebase permissions error
      if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
        setMessage(
          'Firebase permissions error: You need to update your Firestore security rules. ' +
          'Go to the Firebase Console > Firestore Database > Rules and update them to allow read/write access during development. ' +
          'Click here for a guide: '
        );
      } else {
        setMessage('Failed to load projects: ' + (error instanceof Error ? error.message : String(error)));
      }
      
      setMessageType('error');
      
      // Set empty projects array instead of using sample projects
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteDocument('projects', projectId);
        setMessage('Project deleted successfully');
        setMessageType('success');
        // Refresh the projects list
        fetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
        
        // Check if it's a Firebase permissions error
        if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
          setMessage(
            'Firebase permissions error: You need to update your Firestore security rules. ' +
            'Go to the Firebase Console > Firestore Database > Rules and update them to allow read/write access during development. ' +
            'Click here for a guide: '
          );
        } else {
          setMessage('Failed to delete project: ' + (error instanceof Error ? error.message : String(error)));
        }
        
        setMessageType('error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-white">Manage Projects</h1>
              <FirebaseStatus />
            </div>
            <div className="flex space-x-4">
              {usingLocalStorage && (
                <button
                  onClick={clearLocalProjects}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Clear Local Projects
                </button>
              )}
              <Link 
                href="/admin/projects/new" 
                className="px-4 py-2 bg-[#b85a00] text-white rounded-lg hover:bg-[#a04d00] transition-colors"
              >
                Add New Project
              </Link>
            </div>
          </div>
          
          {messageType && (
            <div className={`p-4 mb-6 rounded-lg ${
              messageType === 'success' ? 'bg-green-900/20 text-green-300' : 
              messageType === 'warning' ? 'bg-yellow-900/20 text-yellow-300' : 
              'bg-red-900/20 text-red-300'
            }`}>
              {message}
              {message.includes('Firebase permissions error') && (
                <Link href="/firebase-rules-guide" className="text-[#b85a00] hover:underline">
                  View Firebase Rules Guide
                </Link>
              )}
            </div>
          )}
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b85a00]"></div>
            </div>
          ) : (
            <div className="bg-[#0f0f13] rounded-lg shadow-lg overflow-hidden">
              {projects.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-800">
                  <thead className="bg-[#1a1a1a]">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Project
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Featured
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {projects.map((project) => (
                      <tr key={project.id} className="hover:bg-[#1a1a1a]">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 rounded bg-gray-700 overflow-hidden">
                              {project.thumbnailUrl ? (
                                <img 
                                  src={project.thumbnailUrl} 
                                  alt={project.title}
                                  className="h-10 w-10 object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCAxNmw0LjU4Ni00LjU4NmEyIDIgMCAwMTIuODI4IDBMMTYgMTZtLTItMmwxLjU4Ni0xLjU4NmEyIDIgMCAwMTIuODI4IDBMMjAgMTRtLTYtNmguMDFNNiAyMGgxMmEyIDIgMCAwMDItMlY2YTIgMiAwIDAwLTItMkg2YTIgMiAwIDAwLTIgMnYxMmEyIDIgMCAwMDIgMnoiIHN0cm9rZT0iIzY2NiIgc3Ryb2tlLXdpZHRoPSIxLjUiIGZpbGw9Im5vbmUiLz48L3N2Zz4=';
                                  }}
                                />
                              ) : (
                                <div className="h-10 w-10 flex items-center justify-center bg-gray-800 text-gray-500">
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">{project.title}</div>
                              <div className="text-sm text-gray-400">{project.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#b85a00]/20 text-[#b85a00]">
                            {project.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {project.featured ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900/20 text-green-300">
                              Featured
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-800 text-gray-400">
                              Not Featured
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link 
                            href={`/admin/projects/edit/${project.id}`}
                            className="text-[#b85a00] hover:text-[#a04d00] mr-4"
                          >
                            Edit
                          </Link>
                          <button 
                            onClick={() => handleDeleteProject(project.id)}
                            className="text-red-500 hover:text-red-400"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-400">No projects found. Add your first project!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 