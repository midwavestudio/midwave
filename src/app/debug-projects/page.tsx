'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/lib/firebase/projectUtils';

export default function DebugProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [rawData, setRawData] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const localData = localStorage.getItem('localProjects');
        setRawData(localData || 'No data found');
        
        if (localData) {
          const parsedProjects = JSON.parse(localData);
          setProjects(parsedProjects);
        }
      } catch (error) {
        console.error('Error reading localStorage:', error);
        setRawData(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  }, []);

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        try {
          const localData = localStorage.getItem('localProjects');
          setRawData(localData || 'No data found');
          
          if (localData) {
            const parsedProjects = JSON.parse(localData);
            setProjects(parsedProjects);
          }
        } catch (error) {
          console.error('Error reading localStorage:', error);
          setRawData(`Error: ${error.message}`);
        } finally {
          setLoading(false);
        }
      }
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f13] text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Debug Projects - Loading...</h1>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b85a00]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f13] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Debug Projects</h1>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-[#b85a00] hover:bg-[#a04d00] text-white rounded-lg transition-colors"
          >
            Refresh Data
          </button>
        </div>

        {/* Summary */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{projects.length}</div>
              <div className="text-gray-400 text-sm">Total Projects</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">
                {projects.filter(p => p.featured).length}
              </div>
              <div className="text-gray-400 text-sm">Featured Projects</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400">
                {new Set(projects.map(p => p.category)).size}
              </div>
              <div className="text-gray-400 text-sm">Categories</div>
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Projects in localStorage</h2>
          {projects.length === 0 ? (
            <p className="text-gray-400">No projects found in localStorage</p>
          ) : (
            <div className="space-y-4">
              {projects.map((project, index) => (
                <div key={project.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                    <div className="flex gap-2">
                      {project.featured && (
                        <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">
                          Featured
                        </span>
                      )}
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                        {project.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p><strong>ID:</strong> {project.id}</p>
                    <p><strong>Slug:</strong> {project.slug}</p>
                    <p><strong>Description:</strong> {project.description}</p>
                    <p><strong>Thumbnail:</strong> {project.thumbnailUrl ? '✓' : '✗'}</p>
                    <p><strong>Images:</strong> {project.imageUrls?.length || 0}</p>
                    <p><strong>URL:</strong> {project.url || 'None'}</p>
                    <p><strong>Order:</strong> {project.order || 0}</p>
                    {project.createdAt && (
                      <p><strong>Created:</strong> {new Date(project.createdAt).toLocaleString()}</p>
                    )}
                    {project.updatedAt && (
                      <p><strong>Updated:</strong> {new Date(project.updatedAt).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Raw Data */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4">Raw localStorage Data</h2>
          <pre className="bg-gray-900 rounded-lg p-4 text-sm text-gray-300 overflow-auto max-h-96">
            {rawData}
          </pre>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="flex gap-4">
              <a
                href="/admin/projects"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Go to Admin
              </a>
              <a
                href="/projects"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                View Public Projects
              </a>
              <button
                onClick={() => {
                  if (confirm('This will clear all projects from localStorage. Are you sure?')) {
                    localStorage.removeItem('localProjects');
                    refreshData();
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Clear All Projects
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 