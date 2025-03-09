'use client';

import { useState, useEffect } from 'react';
import { sampleProjects } from '@/lib/firebase/sampleData';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProjectCard from '../components/ProjectCard';
import ProjectModal from '../components/ProjectModal';
import { Project } from '@/lib/firebase/projectUtils';

export default function TestProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    console.log('TestProjects component mounted');
    console.log('Sample projects available:', sampleProjects.length);
    
    // Directly set sample projects
    setProjects(sampleProjects);
  }, []);

  // Open project modal
  const handleProjectClick = (project: Project) => {
    console.log('Project clicked:', project.title);
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white mb-8">Test Projects Page</h1>
          
          <div className="bg-red-900/20 text-red-300 p-4 rounded-lg mb-6">
            This is a test page to verify sample projects are working correctly.
            <br />
            Sample projects available: {sampleProjects.length}
          </div>
          
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <div key={project.id} className="mb-6">
                  <ProjectCard
                    project={project}
                    onClick={() => handleProjectClick(project)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-400">No projects available.</p>
              <button 
                onClick={() => {
                  console.log('Manually setting sample projects');
                  setProjects(sampleProjects);
                }}
                className="mt-4 px-4 py-2 bg-[#b85a00] text-white rounded-lg hover:bg-[#a04d00] transition-colors"
              >
                Load Sample Projects
              </button>
            </div>
          )}
        </div>
      </main>
      
      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      
      <Footer />
    </div>
  );
} 