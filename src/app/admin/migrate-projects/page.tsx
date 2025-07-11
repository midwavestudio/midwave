'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiCloud, FiDatabase, FiArrowRight, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import AdminDashboardLayout from '../AdminDashboardLayout';

export default function MigrateProjectsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [localProjects, setLocalProjects] = useState<any[]>([]);
  const [cloudProjects, setCloudProjects] = useState<any[]>([]);

  // Check current state
  const checkCurrentState = async () => {
    try {
      // Check localStorage
      if (typeof window !== 'undefined') {
        const localData = localStorage.getItem('localProjects');
        if (localData) {
          const projects = JSON.parse(localData);
          setLocalProjects(projects);
        }
      }

      // Check cloud storage
      const { fetchProjects } = await import('@/lib/api/projectsApi');
      const cloudProjectsData = await fetchProjects();
      setCloudProjects(cloudProjectsData);
    } catch (error) {
      console.error('Error checking current state:', error);
    }
  };

  // Perform migration
  const handleMigration = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      console.log('Starting migration...');
      
      if (localProjects.length === 0) {
        setMessage('No projects found in localStorage to migrate.');
        setIsSuccess(false);
        return;
      }

      const { migrateProjects } = await import('@/lib/api/projectsApi');
      
      // Migrate all localStorage projects to cloud
      const result = await migrateProjects(localProjects);
      
      if (result.success) {
        // Clear localStorage after successful migration
        localStorage.removeItem('localProjects');
        
        setIsSuccess(true);
        setMessage(`Successfully migrated ${result.count} projects to cloud storage! localStorage has been cleared.`);
        
        // Update state
        setLocalProjects([]);
        await checkCurrentState();
      } else {
        setIsSuccess(false);
        setMessage('Migration failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during migration:', error);
      setIsSuccess(false);
      setMessage(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize check on component mount
  useEffect(() => {
    checkCurrentState();
  }, []);

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/projects')}
            className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <FiArrowRight size={16} className="rotate-180" />
            <span>Back to Projects</span>
          </button>
          
          <div>
            <h1 className="text-2xl font-bold text-white">Migrate Projects to Cloud</h1>
            <p className="text-gray-400 mt-1">Move your projects from local storage to cloud storage</p>
          </div>
        </div>

        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Local Storage Status */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FiDatabase size={24} className="text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Local Storage</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Projects Found:</span>
                <span className="text-white font-semibold">{localProjects.length}</span>
              </div>
              
              {localProjects.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-300">Projects:</h3>
                  {localProjects.map((project, index) => (
                    <div key={index} className="bg-gray-700 rounded p-2 text-sm">
                      <div className="font-medium text-white">{project.title}</div>
                      <div className="text-gray-400">{project.category}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cloud Storage Status */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FiCloud size={24} className="text-green-400" />
              <h2 className="text-xl font-semibold text-white">Cloud Storage</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Projects Found:</span>
                <span className="text-white font-semibold">{cloudProjects.length}</span>
              </div>
              
              {cloudProjects.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-300">Projects:</h3>
                  {cloudProjects.map((project, index) => (
                    <div key={index} className="bg-gray-700 rounded p-2 text-sm">
                      <div className="font-medium text-white">{project.title}</div>
                      <div className="text-gray-400">{project.category}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Migration Action */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Migration</h2>
          
          {localProjects.length === 0 ? (
            <div className="flex items-start gap-3 p-4 bg-green-900/20 text-green-300 rounded-lg border border-green-900/50">
              <FiCheck size={20} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">No migration needed</p>
                <p className="text-sm text-green-400 mt-1">
                  No projects found in localStorage. All projects are already in cloud storage.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-blue-900/20 text-blue-300 rounded-lg border border-blue-900/50">
                <FiAlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Migration Available</p>
                  <p className="text-sm text-blue-400 mt-1">
                    Found {localProjects.length} project(s) in localStorage that can be migrated to cloud storage.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-orange-900/20 text-orange-300 rounded-lg border border-orange-900/50">
                <p className="font-medium mb-2">⚠️ Migration Process:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Projects will be copied from localStorage to cloud storage</li>
                  <li>localStorage will be cleared after successful migration</li>
                  <li>All devices will then see the same projects</li>
                  <li>This action cannot be undone</li>
                </ul>
              </div>

              <button
                onClick={handleMigration}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <FiCloud size={16} />
                )}
                <span>{isLoading ? 'Migrating...' : 'Migrate to Cloud Storage'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Result Message */}
        {message && (
          <div className={`p-4 rounded-lg border ${
            isSuccess 
              ? 'bg-green-900/20 text-green-300 border-green-900/50' 
              : 'bg-red-900/20 text-red-300 border-red-900/50'
          }`}>
            <div className="flex items-start gap-3">
              {isSuccess ? (
                <FiCheck size={20} className="flex-shrink-0 mt-0.5" />
              ) : (
                <FiAlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-medium">{isSuccess ? 'Success!' : 'Error'}</p>
                <p className="text-sm mt-1">{message}</p>
                {isSuccess && (
                  <div className="mt-3 space-x-3">
                    <button
                      onClick={() => router.push('/admin/projects')}
                      className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg transition-colors"
                    >
                      View Projects
                    </button>
                    <button
                      onClick={() => window.open('/projects', '_blank')}
                      className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      View Public Site
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={checkCurrentState}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Refresh Status
          </button>
        </div>
      </div>
    </AdminDashboardLayout>
  );
} 