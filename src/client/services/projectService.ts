/**
 * Project Service
 * 
 * Handles CRUD operations for user projects with Supabase:
 * - Create new projects
 * - Read/List user projects
 * - Update existing projects
 * - Delete projects
 * - Auto-save functionality
 */

import { supabase } from './supabaseClient'
import type { Project } from './supabaseClient'

export interface CreateProjectData {
  name: string
  description?: string
  code?: string
  html?: string
  css?: string
  javascript?: string
}

export interface UpdateProjectData {
  name?: string
  description?: string
  code?: string
  html?: string
  css?: string
  javascript?: string
}

/**
 * Create a new project
 */
export async function createProject(data: CreateProjectData): Promise<{ project: Project | null; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { project: null, error: new Error('User not authenticated') }
    }

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: data.name,
        description: data.description || null,
        code: data.code || null,
        html: data.html || null,
        css: data.css || null,
        javascript: data.javascript || null
      })
      .select()
      .single()

    return { project, error }
  } catch (error) {
    console.error('Error creating project:', error)
    return { project: null, error }
  }
}

/**
 * Get all projects for the current user
 */
export async function getUserProjects(): Promise<{ projects: Project[]; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { projects: [], error: new Error('User not authenticated') }
    }

    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    return { projects: projects || [], error }
  } catch (error) {
    console.error('Error getting projects:', error)
    return { projects: [], error }
  }
}

/**
 * Get a single project by ID
 */
export async function getProject(projectId: string): Promise<{ project: Project | null; error: any }> {
  try {
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    return { project, error }
  } catch (error) {
    console.error('Error getting project:', error)
    return { project: null, error }
  }
}

/**
 * Update an existing project
 */
export async function updateProject(
  projectId: string,
  data: UpdateProjectData
): Promise<{ project: Project | null; error: any }> {
  try {
    const { data: project, error } = await supabase
      .from('projects')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .select()
      .single()

    return { project, error }
  } catch (error) {
    console.error('Error updating project:', error)
    return { project: null, error }
  }
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string): Promise<{ error: any }> {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)

    return { error }
  } catch (error) {
    console.error('Error deleting project:', error)
    return { error }
  }
}

/**
 * Search projects by name or description
 */
export async function searchProjects(query: string): Promise<{ projects: Project[]; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { projects: [], error: new Error('User not authenticated') }
    }

    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('updated_at', { ascending: false })

    return { projects: projects || [], error }
  } catch (error) {
    console.error('Error searching projects:', error)
    return { projects: [], error }
  }
}

/**
 * Auto-save project helper
 * Debounces save operations to avoid excessive API calls
 */
export class ProjectAutoSaver {
  private projectId: string | null = null
  private timeout: NodeJS.Timeout | null = null
  private delay: number = 2000 // 2 seconds

  constructor(delay: number = 2000) {
    this.delay = delay
  }

  /**
   * Set the current project ID
   */
  setProjectId(projectId: string | null) {
    this.projectId = projectId
  }

  /**
   * Schedule an auto-save
   */
  scheduleSave(data: UpdateProjectData) {
    // Clear existing timeout
    if (this.timeout) {
      clearTimeout(this.timeout)
    }

    // Schedule new save
    this.timeout = setTimeout(async () => {
      if (this.projectId) {
        await updateProject(this.projectId, data)
        console.log('✅ Project auto-saved')
      }
    }, this.delay)
  }

  /**
   * Force immediate save
   */
  async forceSave(data: UpdateProjectData) {
    if (this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = null
    }

    if (this.projectId) {
      const { error } = await updateProject(this.projectId, data)
      if (!error) {
        console.log('✅ Project saved')
      }
      return { error }
    }

    return { error: new Error('No project ID set') }
  }

  /**
   * Cancel pending save
   */
  cancel() {
    if (this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = null
    }
  }
}
