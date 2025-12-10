/**
 * Sharing Service
 * 
 * Handles project sharing operations:
 * - Create share links
 * - Get share by token
 * - Update share settings
 * - Delete shares
 * - Track view counts
 */

import { supabase } from './supabaseClient'

export interface ProjectShare {
  id: string
  project_id: string
  user_id: string
  share_token: string
  is_public: boolean
  can_fork: boolean
  can_comment: boolean
  view_count: number
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface CreateShareData {
  project_id: string
  is_public?: boolean
  can_fork?: boolean
  can_comment?: boolean
  expires_at?: string | null
}

export interface UpdateShareData {
  is_public?: boolean
  can_fork?: boolean
  can_comment?: boolean
  expires_at?: string | null
}

/**
 * Create a new share link for a project
 */
export async function createShare(data: CreateShareData): Promise<{ share: ProjectShare | null; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { share: null, error: new Error('User not authenticated') }
    }

    const { data: share, error } = await supabase
      .from('project_shares')
      .insert({
        project_id: data.project_id,
        user_id: user.id,
        is_public: data.is_public ?? true,
        can_fork: data.can_fork ?? true,
        can_comment: data.can_comment ?? true,
        expires_at: data.expires_at ?? null
      })
      .select()
      .single()

    return { share, error }
  } catch (error) {
    console.error('Error creating share:', error)
    return { share: null, error }
  }
}

/**
 * Get share by token (public access)
 */
export async function getShareByToken(token: string): Promise<{ share: ProjectShare | null; project: any | null; error: any }> {
  try {
    // Get share
    const { data: share, error: shareError } = await supabase
      .from('project_shares')
      .select('*')
      .eq('share_token', token)
      .single()

    if (shareError || !share) {
      return { share: null, project: null, error: shareError }
    }

    // Check if expired
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return { share: null, project: null, error: new Error('Share link has expired') }
    }

    // Get project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', share.project_id)
      .single()

    if (projectError) {
      return { share, project: null, error: projectError }
    }

    // Increment view count
    await supabase
      .from('project_shares')
      .update({ view_count: share.view_count + 1 })
      .eq('id', share.id)

    return { share, project, error: null }
  } catch (error) {
    console.error('Error getting share by token:', error)
    return { share: null, project: null, error }
  }
}

/**
 * Get all shares for a project
 */
export async function getProjectShares(projectId: string): Promise<{ shares: ProjectShare[]; error: any }> {
  try {
    const { data: shares, error } = await supabase
      .from('project_shares')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    return { shares: shares || [], error }
  } catch (error) {
    console.error('Error getting project shares:', error)
    return { shares: [], error }
  }
}

/**
 * Update share settings
 */
export async function updateShare(
  shareId: string,
  data: UpdateShareData
): Promise<{ share: ProjectShare | null; error: any }> {
  try {
    const { data: share, error } = await supabase
      .from('project_shares')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', shareId)
      .select()
      .single()

    return { share, error }
  } catch (error) {
    console.error('Error updating share:', error)
    return { share: null, error }
  }
}

/**
 * Delete a share link
 */
export async function deleteShare(shareId: string): Promise<{ error: any }> {
  try {
    const { error } = await supabase
      .from('project_shares')
      .delete()
      .eq('id', shareId)

    return { error }
  } catch (error) {
    console.error('Error deleting share:', error)
    return { error }
  }
}

/**
 * Fork a shared project
 */
export async function forkProject(shareToken: string): Promise<{ project: any | null; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { project: null, error: new Error('User not authenticated') }
    }

    // Get share and project
    const { share, project, error: getError } = await getShareByToken(shareToken)
    
    if (getError || !share || !project) {
      return { project: null, error: getError || new Error('Share not found') }
    }

    // Check if forking is allowed
    if (!share.can_fork) {
      return { project: null, error: new Error('Forking is not allowed for this project') }
    }

    // Create new project (fork)
    const { data: newProject, error: createError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: `${project.name} (Fork)`,
        description: `Forked from ${project.name}`,
        code: project.code,
        html: project.html,
        css: project.css,
        javascript: project.javascript
      })
      .select()
      .single()

    return { project: newProject, error: createError }
  } catch (error) {
    console.error('Error forking project:', error)
    return { project: null, error }
  }
}

/**
 * Generate share URL
 */
export function getShareUrl(token: string): string {
  const baseUrl = window.location.origin
  return `${baseUrl}/share/${token}`
}
