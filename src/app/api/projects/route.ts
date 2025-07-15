import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { Project } from '@/lib/firebase/projectUtils';

const PROJECTS_KEY = 'projects';

// GET /api/projects - Get all projects
export async function GET() {
  try {
    console.log('Fetching projects from Vercel KV...');
    
    // Check if Vercel KV is configured
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      console.log('Vercel KV not configured, returning default projects');
      
      // Return the user's 3 real projects as a fallback
      const defaultProjects: Project[] = [
        {
          id: 'marketing-agency-website',
          title: 'Marketing Agency Website',
          slug: 'marketing-agency-website',
          category: 'Web Development',
          description: 'A modern marketing agency website with responsive design and CMS integration.',
          fullDescription: 'Complete website solution for a marketing agency featuring modern design, responsive layout, and content management system.',
          client: 'Marketing Agency',
          date: '2023',
          services: ['Web Design', 'Frontend Development', 'CMS Integration'],
          technologies: ['React', 'Next.js', 'Tailwind CSS'],
          thumbnailUrl: '/images/adhocthumb.png',
          imageUrls: ['/images/adhocthumb.png'],
          url: 'https://example.com/marketing-agency',
          featured: true,
          order: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'land-development',
          title: 'Land Development',
          slug: 'land-development',
          category: 'Web Development',
          description: 'Land development project with custom features and responsive design.',
          fullDescription: 'Comprehensive land development platform that provides tools for property developers and investors.',
          client: 'Land Development Client',
          date: '2023',
          services: ['Web Design', 'Frontend Development', 'CMS Integration'],
          technologies: ['React', 'Next.js', 'Tailwind CSS'],
          thumbnailUrl: '/images/adhocthumb.png',
          imageUrls: ['/images/adhocthumb.png'],
          url: 'https://example.com/land-development',
          featured: true,
          order: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'architectural-visualization-studio',
          title: 'Architectural Visualization Studio',
          slug: 'architectural-visualization-studio',
          category: 'Design',
          description: 'Professional architectural visualization and 3D rendering services.',
          fullDescription: 'Specialized studio providing high-quality architectural visualization, 3D rendering, and design services for architects and developers.',
          client: 'Architecture Studio',
          date: '2023',
          services: ['3D Rendering', 'Architectural Visualization', 'Design'],
          technologies: ['3ds Max', 'V-Ray', 'Photoshop'],
          thumbnailUrl: '/images/adhocthumb.png',
          imageUrls: ['/images/adhocthumb.png'],
          url: 'https://example.com/arch-viz',
          featured: true,
          order: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      return NextResponse.json(defaultProjects);
    }
    
    const projects = await kv.get<Project[]>(PROJECTS_KEY);
    
    if (!projects) {
      console.log('No projects found in KV, returning empty array');
      return NextResponse.json([]);
    }
    
    console.log(`Found ${projects.length} projects in KV`);
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    
    // Return default projects as fallback
    console.log('Returning default projects as fallback');
    const defaultProjects: Project[] = [
      {
        id: 'marketing-agency-website',
        title: 'Marketing Agency Website',
        slug: 'marketing-agency-website',
        category: 'Web Development',
        description: 'A modern marketing agency website with responsive design and CMS integration.',
        fullDescription: 'Complete website solution for a marketing agency featuring modern design, responsive layout, and content management system.',
        client: 'Marketing Agency',
        date: '2023',
        services: ['Web Design', 'Frontend Development', 'CMS Integration'],
        technologies: ['React', 'Next.js', 'Tailwind CSS'],
        thumbnailUrl: '/images/adhocthumb.png',
        imageUrls: ['/images/adhocthumb.png'],
        url: 'https://example.com/marketing-agency',
        featured: true,
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'land-development',
        title: 'Land Development',
        slug: 'land-development',
        category: 'Web Development',
        description: 'Land development project with custom features and responsive design.',
        fullDescription: 'Comprehensive land development platform that provides tools for property developers and investors.',
        client: 'Land Development Client',
        date: '2023',
        services: ['Web Design', 'Frontend Development', 'CMS Integration'],
        technologies: ['React', 'Next.js', 'Tailwind CSS'],
        thumbnailUrl: '/images/adhocthumb.png',
        imageUrls: ['/images/adhocthumb.png'],
        url: 'https://example.com/land-development',
        featured: true,
        order: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'architectural-visualization-studio',
        title: 'Architectural Visualization Studio',
        slug: 'architectural-visualization-studio',
        category: 'Design',
        description: 'Professional architectural visualization and 3D rendering services.',
        fullDescription: 'Specialized studio providing high-quality architectural visualization, 3D rendering, and design services for architects and developers.',
        client: 'Architecture Studio',
        date: '2023',
        services: ['3D Rendering', 'Architectural Visualization', 'Design'],
        technologies: ['3ds Max', 'V-Ray', 'Photoshop'],
        thumbnailUrl: '/images/adhocthumb.png',
        imageUrls: ['/images/adhocthumb.png'],
        url: 'https://example.com/arch-viz',
        featured: true,
        order: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    return NextResponse.json(defaultProjects);
  }
}

// POST /api/projects - Create or update projects
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if Vercel KV is configured
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      console.log('Vercel KV not configured, cannot perform write operations');
      return NextResponse.json(
        { error: 'Cloud storage not configured. Please set up Vercel KV database.' },
        { status: 503 }
      );
    }
    
    if (body.action === 'create') {
      // Create a single project
      const projectData = body.project as Omit<Project, 'id'>;
      
      // Generate unique ID
      const timestamp = Date.now();
      const id = projectData.slug || `project-${timestamp}`;
      
      const newProject: Project = {
        ...projectData,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Project & { createdAt: string; updatedAt: string };
      
      // Get existing projects
      const existingProjects = await kv.get<Project[]>(PROJECTS_KEY) || [];
      
      // Check if project already exists
      const existingIndex = existingProjects.findIndex(p => 
        p.id === id || p.slug === projectData.slug
      );
      
      if (existingIndex >= 0) {
        return NextResponse.json(
          { error: 'Project with this slug already exists' },
          { status: 400 }
        );
      }
      
      // Add new project
      const updatedProjects = [...existingProjects, newProject];
      
      // Save to KV
      await kv.set(PROJECTS_KEY, updatedProjects);
      
      console.log(`Created project: ${newProject.title}`);
      return NextResponse.json(newProject);
      
    } else if (body.action === 'update') {
      // Update an existing project
      const { id, project: projectData } = body;
      
      const existingProjects = await kv.get<Project[]>(PROJECTS_KEY) || [];
      const projectIndex = existingProjects.findIndex(p => p.id === id);
      
      if (projectIndex === -1) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }
      
      // Update project
      const updatedProject = {
        ...existingProjects[projectIndex],
        ...projectData,
        updatedAt: new Date().toISOString(),
      };
      
      existingProjects[projectIndex] = updatedProject;
      
      // Save to KV
      await kv.set(PROJECTS_KEY, existingProjects);
      
      console.log(`Updated project: ${updatedProject.title}`);
      return NextResponse.json(updatedProject);
      
    } else if (body.action === 'migrate') {
      // Migrate projects from localStorage data
      const projects = body.projects as Project[];
      
      console.log(`Migrating ${projects.length} projects to KV...`);
      
      // Add timestamps to projects that don't have them
      const migratedProjects = projects.map(project => ({
        ...project,
        createdAt: project.createdAt || new Date().toISOString(),
        updatedAt: project.updatedAt || new Date().toISOString(),
      }));
      
      // Save all projects to KV
      await kv.set(PROJECTS_KEY, migratedProjects);
      
      console.log('Migration completed');
      return NextResponse.json({ success: true, count: migratedProjects.length });
      
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in POST /api/projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects - Delete projects
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action');
    
    if (action === 'clear-all') {
      // Clear all projects
      await kv.del(PROJECTS_KEY);
      console.log('Cleared all projects from KV');
      return NextResponse.json({ success: true });
    }
    
    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }
    
    const existingProjects = await kv.get<Project[]>(PROJECTS_KEY) || [];
    const filteredProjects = existingProjects.filter(p => p.id !== id);
    
    if (filteredProjects.length === existingProjects.length) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Save updated projects
    await kv.set(PROJECTS_KEY, filteredProjects);
    
    console.log(`Deleted project with ID: ${id}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 