'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth';
import { getProjects, Project } from '@/lib/firebase/projectUtils';
import Header from '../../../../components/Header';
import Footer from '../../../../components/Footer';
import BackgroundDesign from '../../../../components/BackgroundDesign';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import Link from 'next/link';

export default function DeleteProjectPage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);

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
          const foundProject = allProjects.find(p => p.id === params.id);
          
          if (foundProject) {
            setProject(foundProject);
          } else {
            setErrorMessage('Project not found');
          }
        } catch (error) {
          console.error('Error fetching project:', error);
          setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProject();
  }, [user, params.id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      // Delete the project from localStorage for now
      // In a real app, you would delete from Firestore
      if (typeof window !== 'undefined') {
        const localProjects = localStorage.getItem('localProjects');
        if (localProjects) {
          const projects = JSON.parse(localProjects) as Project[];
          
          // Filter out the project to delete
          const updatedProjects = projects.filter(p => p.id !== params.id);
          
          // Save back to localStorage
          localStorage.setItem('localProjects', JSON.stringify(updatedProjects));
        }
      }

      // Redirect to admin projects page
      router.push('/admin/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
      setIsDeleting(false);
    }
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
            className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 md:p-6 mb-6"
          >
            <div className="flex justify-between items-center">
              <h1 className="text-2xl md:text-3xl font-bold text-white">Delete Project</h1>
              <Link 
                href="/admin/projects" 
                className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg transition-colors text-sm"
              >
                <FiArrowLeft size={16} />
                <span>Back to Projects</span>
              </Link>
            </div>
            <p className="text-gray-400 text-sm md:text-base mt-2">
              Confirm project deletion
            </p>
          </motion.div>
          
          {errorMessage && (
            <div className="bg-red-900/20 text-red-300 p-4 rounded-lg mb-6 text-sm md:text-base">
              <p>Error: {errorMessage}</p>
            </div>
          )}
          
          {project ? (
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 md:p-6">
              <div className="flex items-center mb-6 text-amber-300">
                <FiAlertTriangle size={24} className="mr-3" />
                <h2 className="text-xl font-semibold">Warning: This action cannot be undone</h2>
              </div>
              
              <div className="mb-6">
                <p className="text-white mb-4">
                  Are you sure you want to delete the following project?
                </p>
                
                <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                  <h3 className="text-lg font-medium text-white mb-2">{project.title}</h3>
                  {project.category && (
                    <p className="text-gray-400 text-sm mb-2">Category: {project.category}</p>
                  )}
                  {project.description && (
                    <p className="text-gray-300 text-sm">{project.description}</p>
                  )}
                  {project.featured && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#b85a00]/20 text-[#b85a00]">
                        Featured
                      </span>
                    </div>
                  )}
                </div>
                
                <p className="text-red-300 text-sm">
                  Deleting this project will remove it from your portfolio and it cannot be recovered.
                </p>
              </div>
              
              <div className="flex justify-end space-x-4">
                <Link
                  href="/admin/projects"
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiTrash2 size={16} />
                  <span>{isDeleting ? 'Deleting...' : 'Delete Project'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 md:p-6 text-center">
              <p className="text-gray-400">Project not found or has been deleted.</p>
              <Link
                href="/admin/projects"
                className="mt-4 inline-block px-4 py-2 bg-[#b85a00] text-white rounded-lg hover:bg-[#a04d00] transition-colors"
              >
                Back to Projects
              </Link>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 