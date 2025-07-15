'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiCloud, FiTrash2, FiRefreshCw, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import AdminDashboardLayout from '../AdminDashboardLayout';

export default function ForceCloudSyncPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [localProjects, setLocalProjects] = useState<any[]>([]);
  const [cloudProjects, setCloudProjects] = useState<any[]>([]);
  const [hasLocalStorage, setHasLocalStorage] = useState(false);
  const [kvStatus, setKvStatus] = useState<any>(null);

  // Check current state
  const checkCurrentState = async () => {
    try {
      // Check localStorage
      if (typeof window !== 'undefined') {
        const localData = localStorage.getItem('localProjects');
        if (localData) {
          const projects = JSON.parse(localData);
          setLocalProjects(projects);
          setHasLocalStorage(true);
        } else {
          setLocalProjects([]);
          setHasLocalStorage(false);
        }
      }

      // Check cloud storage
      const { fetchProjects } = await import('@/lib/api/projectsApi');
      const cloudProjectsData = await fetchProjects();
      setCloudProjects(cloudProjectsData);
      
      // Check Vercel KV status
      try {
        const statusResponse = await fetch('/api/projects/status');
        const statusData = await statusResponse.json();
        setKvStatus(statusData);
      } catch (error) {
        console.error('Error checking KV status:', error);
      }
    } catch (error) {
      console.error('Error checking current state:', error);
    }
  };

  // Force clear localStorage
  const forceClearLocalStorage = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      if (typeof window !== 'undefined') {
        // Clear all project-related localStorage
        localStorage.removeItem('localProjects');
        
        // Also clear any other project-related keys
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('project') || key.includes('sample'))) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
        });
        
        setIsSuccess(true);
        setMessage(`Successfully cleared localStorage. Removed ${keysToRemove.length + 1} project-related keys.`);
        
        // Update state
        await checkCurrentState();
      }
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      setIsSuccess(false);
      setMessage(`Error clearing localStorage: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Force Cloud Sync</h1>
          <p className="text-gray-400">
            Clear localStorage on all devices to ensure consistent project display from cloud storage.
          </p>
        </div>

        {/* Vercel KV Status */}
        {kvStatus && (
          <div className="bg-[#1a1a1a] rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <FiCloud className="mr-2" />
              Vercel KV Database Status
            </h2>
            
            <div className={`p-4 rounded-lg ${
              kvStatus.configured ? 'bg-green-900/20 border border-green-500/20' : 'bg-yellow-900/20 border border-yellow-500/20'
            }`}>
              <div className="flex items-center mb-2">
                {kvStatus.configured ? (
                  <FiCheck className="mr-2 text-green-500" />
                ) : (
                  <FiAlertTriangle className="mr-2 text-yellow-500" />
                )}
                <span className={kvStatus.configured ? 'text-green-300' : 'text-yellow-300'}>
                  {kvStatus.message}
                </span>
              </div>
              
              <div className="text-sm text-gray-400 space-y-1">
                <div>KV_REST_API_URL: {kvStatus.details.KV_REST_API_URL}</div>
                <div>KV_REST_API_TOKEN: {kvStatus.details.KV_REST_API_TOKEN}</div>
                <div>KV_REST_API_READ_ONLY_TOKEN: {kvStatus.details.KV_REST_API_READ_ONLY_TOKEN}</div>
              </div>
              
              <div className="mt-2 text-sm">
                <span className="font-medium">Current Mode:</span> {kvStatus.fallback}
              </div>
            </div>
          </div>
        )}

        {/* Current State */}
        <div className="bg-[#1a1a1a] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <FiCloud className="mr-2" />
            Current State
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* localStorage Status */}
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                {hasLocalStorage ? (
                  <FiAlertTriangle className="mr-2 text-yellow-500" />
                ) : (
                  <FiCheck className="mr-2 text-green-500" />
                )}
                localStorage
              </h3>
              
              {hasLocalStorage ? (
                <div>
                  <p className="text-yellow-500 mb-2">
                    ⚠️ localStorage contains {localProjects.length} projects
                  </p>
                  <div className="space-y-1">
                    {localProjects.map((project, index) => (
                      <div key={index} className="text-sm text-gray-400">
                        • {project.title || 'Untitled'} ({project.id})
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-green-500">✅ localStorage is clear</p>
              )}
            </div>

            {/* Cloud Storage Status */}
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                <FiCloud className="mr-2 text-blue-500" />
                Cloud Storage
              </h3>
              
              <p className="text-blue-500 mb-2">
                Cloud contains {cloudProjects.length} projects
              </p>
              <div className="space-y-1">
                {cloudProjects.map((project, index) => (
                  <div key={index} className="text-sm text-gray-400">
                    • {project.title || 'Untitled'} ({project.id})
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-[#1a1a1a] rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Actions</h2>
          
          <div className="space-y-4">
            <button
              onClick={forceClearLocalStorage}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <FiRefreshCw className="mr-2 animate-spin" />
              ) : (
                <FiTrash2 className="mr-2" />
              )}
              {isLoading ? 'Clearing...' : 'Clear localStorage'}
            </button>
            
            <button
              onClick={checkCurrentState}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FiRefreshCw className="mr-2" />
              Refresh Status
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            isSuccess ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
          }`}>
            {message}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-[#1a1a1a] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Instructions</h2>
          <div className="space-y-3 text-gray-300">
            <p>
              <strong>Problem:</strong> Some devices are showing old sample projects from localStorage 
              instead of your 3 real projects from cloud storage.
            </p>
            <p>
              <strong>Solution:</strong> Clear localStorage on all devices to force them to sync from cloud storage.
            </p>
            <p>
              <strong>Expected Result:</strong> All devices should show the same 3 projects:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Marketing Agency Website</li>
              <li>Land Development</li>
              <li>Architectural Visualization Studio (Arch Viz)</li>
            </ul>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Back
          </button>
          
          <button
            onClick={() => router.push('/admin/projects')}
            className="px-4 py-2 bg-[#b85a00] text-white rounded-lg hover:bg-[#a04a00]"
          >
            View Projects
          </button>
        </div>
      </div>
    </AdminDashboardLayout>
  );
} 