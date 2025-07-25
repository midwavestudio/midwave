'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiPlus, FiGrid, FiImage, FiSettings, FiEye, FiLayout, FiGithub } from 'react-icons/fi';
import AdminDashboardLayout from './AdminDashboardLayout';

interface DashboardStat {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStat[]>([
    {
      title: 'Total Projects',
      value: 0,
      icon: <FiGrid size={24} />,
      color: 'bg-gradient-to-r from-blue-500 to-indigo-600',
    },
    {
      title: 'Total Images',
      value: 0,
      icon: <FiImage size={24} />,
      color: 'bg-gradient-to-r from-green-500 to-teal-600',
    },
    {
      title: 'Featured Projects',
      value: 0,
      icon: <FiEye size={24} />,
      color: 'bg-gradient-to-r from-yellow-500 to-orange-600',
    },
  ]);
  
  const [loading, setLoading] = useState(true);
  const [pushStatus, setPushStatus] = useState<{
    loading: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | null;
  }>({
    loading: false,
    message: '',
    type: null
  });

  const handleGitHubPush = async () => {
    setPushStatus({ loading: true, message: 'Pushing changes to GitHub...', type: 'info' });

    try {
      const response = await fetch('/api/github/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Admin dashboard update: ${new Date().toLocaleString()}`
        })
      });

      const data = await response.json();

      if (response.ok) {
        setPushStatus({
          loading: false,
          message: data.message,
          type: 'success'
        });
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setPushStatus({ loading: false, message: '', type: null });
        }, 5000);
      } else {
        // Handle specific Git not available error
        if (data.error === 'Git is not available in this environment') {
          setPushStatus({
            loading: false,
            message: `${data.message} ${data.suggestion}`,
            type: 'error'
          });
        } else {
          setPushStatus({
            loading: false,
            message: data.error || 'Failed to push to GitHub',
            type: 'error'
          });
        }
      }
    } catch (error) {
      console.error('Error pushing to GitHub:', error);
      setPushStatus({
        loading: false,
        message: 'Network error: Failed to push to GitHub',
        type: 'error'
      });
    }
  };
  
  // Fetch project stats on component mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        let projectCount = 0;
        let imageCount = 0;
        let featuredCount = 0;
        
        // Attempt to get projects from localStorage
        if (typeof window !== 'undefined') {
          const localProjects = localStorage.getItem('localProjects');
          if (localProjects) {
            const projects = JSON.parse(localProjects);
            projectCount = projects.length;
            
            // Count all images across projects
            imageCount = projects.reduce((total: number, project: any) => {
              return total + (project.imageUrls?.length || 0);
            }, 0);
            
            // Count featured projects
            featuredCount = projects.filter((project: any) => project.featured).length;
          }
        }
        
        // Update stats
        setStats([
          {
            title: 'Total Projects',
            value: projectCount,
            icon: <FiGrid size={24} />,
            color: 'bg-gradient-to-r from-blue-500 to-indigo-600',
          },
          {
            title: 'Total Images',
            value: imageCount,
            icon: <FiImage size={24} />,
            color: 'bg-gradient-to-r from-green-500 to-teal-600',
          },
          {
            title: 'Featured Projects',
            value: featuredCount,
            icon: <FiEye size={24} />,
            color: 'bg-gradient-to-r from-yellow-500 to-orange-600',
          },
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  const quickActions = [
    {
      title: 'Add New Project',
      description: 'Create a new portfolio project with images and details',
      icon: <FiPlus size={24} />,
      path: '/admin/projects/new',
      color: 'bg-[#b85a00]',
    },
    {
      title: 'Manage Projects',
      description: 'View, edit, and delete existing projects',
      icon: <FiGrid size={24} />,
      path: '/admin/projects',
      color: 'bg-indigo-600',
    },
    {
      title: 'UI Prototypes',
      description: 'Browse modern UI designs for social media marketing',
      icon: <FiLayout size={24} />,
      path: '/admin/ui-prototypes',
      color: 'bg-purple-600',
    },
    {
      title: 'Settings',
      description: 'Configure website settings and preferences',
      icon: <FiSettings size={24} />,
      path: '/admin/settings',
      color: 'bg-teal-600',
    },
    {
      title: 'Push to GitHub',
      description: 'Push your latest changes to GitHub repository',
      icon: <FiGithub size={24} />,
      path: '#',
      color: 'bg-gray-700',
      onClick: handleGitHubPush,
      disabled: pushStatus.loading,
    },
  ];
  
  return (
    <AdminDashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome to your portfolio management dashboard</p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-gray-800 shadow-lg border border-gray-700"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${stat.color}`}>
                  {stat.icon}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-300">{stat.title}</h3>
                  <div className="text-2xl font-bold text-white">
                    {loading ? (
                      <div className="w-12 h-6 bg-gray-700 animate-pulse rounded"></div>
                    ) : (
                      stat.value
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          
          {/* Push Status Message */}
          {pushStatus.message && (
            <div className={`mb-4 p-4 rounded-lg ${
              pushStatus.type === 'success' ? 'bg-green-900/50 border border-green-500 text-green-200' :
              pushStatus.type === 'error' ? 'bg-red-900/50 border border-red-500 text-red-200' :
              'bg-blue-900/50 border border-blue-500 text-blue-200'
            }`}>
              <div className="flex items-center">
                {pushStatus.loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                )}
                {pushStatus.message}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              action.onClick ? (
                <button
                  key={index}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={`group p-6 rounded-xl bg-gray-800 border border-gray-700 hover:border-gray-600 transition-all shadow-lg text-left w-full ${
                    action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <div className={`p-3 rounded-full ${action.color} w-fit mb-4 ${
                    action.disabled ? '' : 'group-hover:scale-105 transition-transform'
                  }`}>
                    {action.icon}
                  </div>
                  <h3 className={`text-lg font-medium text-white transition-colors ${
                    action.disabled ? '' : 'group-hover:text-[#ff9240]'
                  }`}>
                    {action.title}
                  </h3>
                  <p className="text-gray-400 mt-1">{action.description}</p>
                </button>
              ) : (
                <Link
                  key={index}
                  href={action.path}
                  className="group p-6 rounded-xl bg-gray-800 border border-gray-700 hover:border-gray-600 transition-all shadow-lg"
                >
                  <div className={`p-3 rounded-full ${action.color} w-fit mb-4`}>
                    {action.icon}
                  </div>
                  <h3 className="text-lg font-medium text-white group-hover:text-[#ff9240] transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-gray-400 mt-1">{action.description}</p>
                </Link>
              )
            ))}
          </div>
        </div>
        
        {/* Recent Projects */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Projects</h2>
            <Link
              href="/admin/projects"
              className="text-[#ff9240] hover:text-[#ffb680] transition-colors"
            >
              View All
            </Link>
          </div>
          
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            {loading ? (
              // Loading state
              <div className="p-6 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-700 animate-pulse rounded"></div>
                    <div className="space-y-2 flex-1">
                      <div className="w-1/3 h-4 bg-gray-700 animate-pulse rounded"></div>
                      <div className="w-1/2 h-3 bg-gray-700 animate-pulse rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <RecentProjectsList />
            )}
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}

function RecentProjectsList() {
  const [projects, setProjects] = useState<any[]>([]);
  
  useEffect(() => {
    // Get projects from localStorage
    if (typeof window !== 'undefined') {
      const localProjects = localStorage.getItem('localProjects');
      if (localProjects) {
        try {
          const allProjects = JSON.parse(localProjects);
          // Sort by recent first and take the most recent 5
          const recentProjects = [...allProjects]
            .sort((a, b) => {
              const dateA = a.updatedAt || a.date || '';
              const dateB = b.updatedAt || b.date || '';
              return new Date(dateB).getTime() - new Date(dateA).getTime();
            })
            .slice(0, 5);
          
          setProjects(recentProjects);
        } catch (error) {
          console.error('Error parsing recent projects:', error);
          setProjects([]);
        }
      }
    }
  }, []);
  
  if (projects.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400">
        <p>No projects found. Start by creating a new project.</p>
        <Link
          href="/admin/projects/new"
          className="inline-block mt-4 px-4 py-2 bg-[#b85a00] text-white rounded-md hover:bg-[#a04d00] transition-colors"
        >
          <span className="flex items-center gap-2">
            <FiPlus size={16} />
            Create Project
          </span>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="divide-y divide-gray-700">
      {projects.map((project) => (
        <div
          key={project.id}
          className="p-4 hover:bg-gray-750 transition-colors flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-gray-700 rounded overflow-hidden flex-shrink-0">
            {project.thumbnailUrl && (
              <img
                src={project.thumbnailUrl}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium truncate">{project.title}</h3>
            <p className="text-gray-400 text-sm truncate">{project.category}</p>
          </div>
          <div className="flex-shrink-0 flex gap-2">
            <Link
              href={`/admin/projects/edit/${project.id}`}
              className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
            >
              Edit
            </Link>
            <Link
              href={`/projects/${project.slug || project.id}`}
              target="_blank"
              className="p-2 bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 rounded transition-colors"
            >
              View
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
} 