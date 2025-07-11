'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiTrash2, FiCheck, FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';
import AdminLayout from '../AdminLayout';
import { clearAllSampleProjects, hasSampleProjects, getUserProjects } from '@/lib/utils/clearSampleProjects';

export default function ClearSampleProjectsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasExistingSamples, setHasExistingSamples] = useState(false);
  const [userProjectCount, setUserProjectCount] = useState(0);
  const [totalProjects, setTotalProjects] = useState(0);

  // Check current state on component mount
  useEffect(() => {
    checkCurrentState();
  }, []);

  const checkCurrentState = () => {
    try {
      const hasSamples = hasSampleProjects();
      const userProjects = getUserProjects();
      
      setHasExistingSamples(hasSamples);
      setUserProjectCount(userProjects.length);
      
      // Get total project count
      if (typeof window !== 'undefined') {
        const localData = localStorage.getItem('localProjects');
        const allProjects = localData ? JSON.parse(localData) : [];
        setTotalProjects(allProjects.length);
      }
      
      console.log('Current state:', {
        hasSamples,
        userProjectCount: userProjects.length,
        totalProjects: totalProjects
      });
    } catch (error) {
      console.error('Error checking current state:', error);
    }
  };

  const handleClearSamples = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      console.log('Clearing sample projects...');
      const result = clearAllSampleProjects();
      
      if (result.success) {
        setIsSuccess(true);
        setMessage(result.message);
        
        // Update state after clearing
        setHasExistingSamples(false);
        setTotalProjects(result.removedCount > 0 ? totalProjects - result.removedCount : totalProjects);
        
        console.log('Sample projects cleared successfully');
      } else {
        setIsSuccess(false);
        setMessage(result.message);
      }
    } catch (error) {
      console.error('Error clearing sample projects:', error);
      setIsSuccess(false);
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/projects')}
            className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <FiArrowLeft size={16} />
            <span>Back to Projects</span>
          </button>
          
          <div>
            <h1 className="text-2xl font-bold text-white">Clear Sample Projects</h1>
            <p className="text-gray-400 mt-1">Remove all sample/demo projects and keep only your real projects</p>
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Current Project Status</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{totalProjects}</div>
              <div className="text-gray-400 text-sm">Total Projects</div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">{userProjectCount}</div>
              <div className="text-gray-400 text-sm">Your Projects</div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-400">{totalProjects - userProjectCount}</div>
              <div className="text-gray-400 text-sm">Sample Projects</div>
            </div>
          </div>

          {hasExistingSamples ? (
            <div className="flex items-start gap-3 p-4 bg-orange-900/20 text-orange-300 rounded-lg border border-orange-900/50">
              <FiAlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Sample projects detected</p>
                <p className="text-sm text-orange-400 mt-1">
                  Your portfolio currently contains {totalProjects - userProjectCount} sample/demo projects. 
                  These should be removed to show only your real work.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-4 bg-green-900/20 text-green-300 rounded-lg border border-green-900/50">
              <FiCheck size={20} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">No sample projects found</p>
                <p className="text-sm text-green-400 mt-1">
                  Your portfolio only contains your real projects. Great job!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Section */}
        {hasExistingSamples && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Remove Sample Projects</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-red-900/20 text-red-300 rounded-lg border border-red-900/50">
                <p className="font-medium mb-2">⚠️ This action will:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Remove all sample/demo projects from your portfolio</li>
                  <li>Keep all projects you've added through the admin panel</li>
                  <li>This action cannot be undone</li>
                </ul>
              </div>

              <button
                onClick={handleClearSamples}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <FiTrash2 size={16} />
                )}
                <span>{isLoading ? 'Clearing...' : 'Clear Sample Projects'}</span>
              </button>
            </div>
          </div>
        )}

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
                  <button
                    onClick={() => router.push('/admin/projects')}
                    className="mt-3 px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg transition-colors"
                  >
                    View Projects
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">What happens next?</h2>
          
          <div className="space-y-3 text-gray-300">
            <p>After clearing sample projects:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Your portfolio will only show projects you've added through the admin panel</li>
              <li>The homepage will display your real featured projects</li>
              <li>If you have no projects yet, the portfolio will appear empty until you add some</li>
              <li>You can add new projects using the "Add New Project" button</li>
            </ul>
            
            <div className="mt-4 p-3 bg-blue-900/20 text-blue-300 rounded-lg border border-blue-900/50">
              <p className="text-sm">
                💡 <strong>Tip:</strong> After clearing sample projects, make sure to add your own projects 
                and mark them as "featured" to display them on your homepage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 