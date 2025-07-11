import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { Project } from '@/lib/firebase/projectUtils';

const PROJECTS_KEY = 'projects';

// GET /api/projects - Get all projects
export async function GET() {
  try {
    console.log('Fetching projects from Vercel KV...');
    
    const projects = await kv.get<Project[]>(PROJECTS_KEY);
    
    if (!projects) {
      console.log('No projects found in KV, returning empty array');
      return NextResponse.json([]);
    }
    
    console.log(`Found ${projects.length} projects in KV`);
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create or update projects
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
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