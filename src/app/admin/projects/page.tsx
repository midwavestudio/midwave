'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiEdit2, FiEye, FiTrash2, FiPlus, FiSearch, FiStar, FiFilter, FiAlertTriangle } from 'react-icons/fi';
import AdminDashboardLayout from '../AdminDashboardLayout';
import { initializeSampleProjects } from '@/lib/firebase/projectUtils';
import { hasSampleProjects } from '@/lib/utils/clearSampleProjects';

interface Project {
  id: string;
  title: string;
  slug?: string;
  description: string;
  category: string;
  date: string;
  thumbnailUrl?: string;
  imageUrls: string[];
  featured: boolean;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export default function ProjectsListPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [hasExistingSamples, setHasExistingSamples] = useState(false);
  
  // Load projects from localStorage on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      
      try {
        // Initialize empty projects array if none exist
        await initializeSampleProjects();
        
        // Get projects from localStorage
        if (typeof window !== 'undefined') {
          const localProjects = localStorage.getItem('localProjects');
          
          if (localProjects) {
            const parsedProjects: Project[] = JSON.parse(localProjects);
            setProjects(parsedProjects);
            
            // Extract unique categories
            const uniqueCategories = Array.from(
              new Set(parsedProjects.map(project => project.category))
            ).filter(Boolean);
            setCategories(uniqueCategories as string[]);
            
            // Check if there are sample projects
            setHasExistingSamples(hasSampleProjects());
          } else {
            setProjects([]);
            setHasExistingSamples(false);
          }
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, []);
  
  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => {
      // Filter by search term
      const matchesSearch = 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.tags && project.tags.some(tag => 
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ));
      
      // Filter by category
      const matchesCategory = !category || project.category === category;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const sortByValueA = 
        sortBy === 'updatedAt' ? (a.updatedAt || a.createdAt || a.date || '') :
        sortBy === 'title' ? a.title :
        sortBy === 'category' ? a.category :
        '';
        
      const sortByValueB = 
        sortBy === 'updatedAt' ? (b.updatedAt || b.createdAt || b.date || '') :
        sortBy === 'title' ? b.title :
        sortBy === 'category' ? b.category :
        '';
      
      if (sortDirection === 'asc') {
        return sortByValueA.localeCompare(sortByValueB);
      } else {
        return sortByValueB.localeCompare(sortByValueA);
      }
    });
  
  // Handle project deletion
  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        // Remove project from localStorage
        const updatedProjects = projects.filter(project => project.id !== projectId);
        localStorage.setItem('localProjects', JSON.stringify(updatedProjects));
        setProjects(updatedProjects);
        
        // Update categories if needed
        const uniqueCategories = Array.from(
          new Set(updatedProjects.map(project => project.category))
        ).filter(Boolean);
        setCategories(uniqueCategories as string[]);
        
        // Check if there are still sample projects
        setHasExistingSamples(hasSampleProjects());
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };
  
  // Toggle featured status
  const toggleFeatured = (projectId: string) => {
    try {
      const updatedProjects = projects.map(project => {
        if (project.id === projectId) {
          return {
            ...project,
            featured: !project.featured,
            updatedAt: new Date().toISOString(),
          };
        }
        return project;
      });
      
      localStorage.setItem('localProjects', JSON.stringify(updatedProjects));
      setProjects(updatedProjects);
    } catch (error) {
      console.error('Error updating featured status:', error);
    }
  };
  
  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Projects</h1>
            <p className="text-gray-400 mt-1">
              Manage your portfolio projects
            </p>
          </div>
          
          <div className="flex gap-3">
            {hasExistingSamples && (
              <Link
                href="/admin/projects/clear-samples"
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md transition-colors"
              >
                <FiAlertTriangle size={16} />
                <span>Clear Samples</span>
              </Link>
            )}
            <Link
              href="/admin/projects/reset-projects"
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
            >
              <span>Reset Projects</span>
            </Link>
            <Link
              href="/admin/projects/new"
              className="flex items-center gap-2 px-4 py-2 bg-[#b85a00] hover:bg-[#a04d00] text-white rounded-md transition-colors"
            >
              <FiPlus size={16} />
              <span>New Project</span>
            </Link>
          </div>
        </div>
        
        {/* Sample Projects Warning */}
        {hasExistingSamples && (
          <div className="bg-orange-900/20 border border-orange-900/50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <FiAlertTriangle className="text-orange-400 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <h3 className="text-orange-300 font-medium">Sample Projects Detected</h3>
                <p className="text-orange-400 text-sm mt-1">
                  Your portfolio contains sample/demo projects. These should be removed to show only your real work.
                </p>
                <Link
                  href="/admin/projects/clear-samples"
                  className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-md transition-colors"
                >
                  <span>Clear Sample Projects</span>
                </Link>
              </div>
            </div>
          </div>
        )}
        
        {/* Filters & Search */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00]/50"
              />
            </div>
            
            <div className="flex gap-3">
              <div className="w-full md:w-44 relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <FiFilter className="text-gray-400" />
                </div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00]/50 appearance-none"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div className="w-full md:w-48">
                <select
                  value={`${sortBy}-${sortDirection}`}
                  onChange={(e) => {
                    const [newSortBy, newSortDirection] = e.target.value.split('-');
                    setSortBy(newSortBy);
                    setSortDirection(newSortDirection);
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#b85a00]/50 appearance-none"
                >
                  <option value="updatedAt-desc">Newest First</option>
                  <option value="updatedAt-asc">Oldest First</option>
                  <option value="title-asc">Title (A-Z)</option>
                  <option value="title-desc">Title (Z-A)</option>
                  <option value="category-asc">Category (A-Z)</option>
                  <option value="category-desc">Category (Z-A)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Projects List */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-16 h-12 bg-gray-700 animate-pulse rounded"></div>
                  <div className="space-y-2 flex-1">
                    <div className="w-1/3 h-4 bg-gray-700 animate-pulse rounded"></div>
                    <div className="w-1/2 h-3 bg-gray-700 animate-pulse rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              {searchTerm || category ? (
                <p>No projects match your search criteria. Try changing your filters.</p>
              ) : (
                <>
                  <p className="mb-4">No projects found. Start by creating a new project.</p>
                  <Link
                    href="/admin/projects/new"
                    className="inline-block px-4 py-2 bg-[#b85a00] text-white rounded-md hover:bg-[#a04d00] transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <FiPlus size={16} />
                      Create Project
                    </span>
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="min-w-full divide-y divide-gray-700">
              <div className="hidden lg:flex bg-gray-750 text-xs text-gray-400 uppercase tracking-wider">
                <div className="w-16"></div>
                <div className="px-6 py-3 w-1/3">Project</div>
                <div className="px-6 py-3 w-1/6">Category</div>
                <div className="px-6 py-3 w-1/6">Date</div>
                <div className="px-6 py-3 w-1/6">Status</div>
                <div className="px-6 py-3 w-1/6">Actions</div>
              </div>
              
              <div className="divide-y divide-gray-700">
                {filteredProjects.map((project) => (
                  <div key={project.id} className="group hover:bg-gray-750 transition-colors">
                    <div className="hidden lg:flex items-center">
                      <div className="w-16 h-12 bg-gray-700 overflow-hidden flex-shrink-0 m-2">
                        {project.thumbnailUrl ? (
                          <img
                            src={project.thumbnailUrl}
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        ) : project.imageUrls && project.imageUrls[0] ? (
                          <img
                            src={project.imageUrls[0]}
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-700" />
                        )}
                      </div>
                      
                      <div className="px-6 py-4 w-1/3">
                        <div className="font-medium text-white">{project.title}</div>
                        <div className="text-gray-400 text-sm truncate max-w-xs">
                          {project.description.length > 80
                            ? project.description.substring(0, 80) + '...'
                            : project.description}
                        </div>
                      </div>
                      
                      <div className="px-6 py-4 w-1/6 text-gray-300">
                        {project.category}
                      </div>
                      
                      <div className="px-6 py-4 w-1/6 text-gray-300">
                        {project.date}
                      </div>
                      
                      <div className="px-6 py-4 w-1/6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            project.featured
                              ? 'bg-amber-900/30 text-amber-300'
                              : 'bg-blue-900/30 text-blue-300'
                          }`}
                        >
                          {project.featured ? 'Featured' : 'Standard'}
                        </span>
                      </div>
                      
                      <div className="px-6 py-4 w-1/6 flex space-x-2">
                        <button
                          onClick={() => toggleFeatured(project.id)}
                          className={`p-2 rounded ${
                            project.featured
                              ? 'bg-amber-900/30 text-amber-300 hover:bg-amber-900/50'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          } transition-colors`}
                          title={project.featured ? 'Remove from featured' : 'Add to featured'}
                        >
                          <FiStar size={16} />
                        </button>
                        
                        <Link
                          href={`/admin/projects/edit/${project.id}`}
                          className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                          title="Edit project"
                        >
                          <FiEdit2 size={16} />
                        </Link>
                        
                        <Link
                          href={`/projects/${project.slug || project.id}`}
                          target="_blank"
                          className="p-2 bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 rounded transition-colors"
                          title="View project"
                        >
                          <FiEye size={16} />
                        </Link>
                        
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="p-2 bg-red-900/30 hover:bg-red-900/50 text-red-300 rounded transition-colors"
                          title="Delete project"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Mobile view */}
                    <div className="flex lg:hidden p-4">
                      <div className="w-16 h-16 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                        {project.thumbnailUrl ? (
                          <img
                            src={project.thumbnailUrl}
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        ) : project.imageUrls && project.imageUrls[0] ? (
                          <img
                            src={project.imageUrls[0]}
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-700" />
                        )}
                      </div>
                      
                      <div className="ml-4 flex-1 min-w-0">
                        <div className="font-medium text-white truncate">{project.title}</div>
                        <div className="text-gray-400 text-sm mt-1">{project.category}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              project.featured
                                ? 'bg-amber-900/30 text-amber-300'
                                : 'bg-blue-900/30 text-blue-300'
                            }`}
                          >
                            {project.featured ? 'Featured' : 'Standard'}
                          </span>
                          <span className="text-gray-400 text-xs">{project.date}</span>
                        </div>
                        
                        <div className="flex mt-3 space-x-2">
                          <button
                            onClick={() => toggleFeatured(project.id)}
                            className={`p-1.5 rounded ${
                              project.featured
                                ? 'bg-amber-900/30 text-amber-300 hover:bg-amber-900/50'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            } transition-colors`}
                          >
                            <FiStar size={14} />
                          </button>
                          
                          <Link
                            href={`/admin/projects/edit/${project.id}`}
                            className="p-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                          >
                            <FiEdit2 size={14} />
                          </Link>
                          
                          <Link
                            href={`/projects/${project.slug || project.id}`}
                            target="_blank"
                            className="p-1.5 bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 rounded transition-colors"
                          >
                            <FiEye size={14} />
                          </Link>
                          
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            className="p-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-300 rounded transition-colors"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminDashboardLayout>
  );
} 