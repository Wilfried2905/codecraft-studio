/**
 * Version Service
 * 
 * Handles project versioning:
 * - Create version snapshots
 * - List versions
 * - Restore version
 * - Compare versions (diff)
 * - Tag versions
 */

import { supabase } from './supabaseClient'

export interface Version {
  id: string
  project_id: string
  user_id: string
  version_number: number
  tag: string | null
  message: string | null
  code_snapshot: string
  html_snapshot: string | null
  css_snapshot: string | null
  javascript_snapshot: string | null
  created_at: string
}

export interface CreateVersionData {
  project_id: string
  tag?: string
  message?: string
  code_snapshot: string
  html_snapshot?: string
  css_snapshot?: string
  javascript_snapshot?: string
}

/**
 * Create a new version snapshot
 */
export async function createVersion(data: CreateVersionData): Promise<{ version: Version | null; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { version: null, error: new Error('User not authenticated') }
    }

    const { data: version, error } = await supabase
      .from('versions')
      .insert({
        project_id: data.project_id,
        user_id: user.id,
        tag: data.tag || null,
        message: data.message || null,
        code_snapshot: data.code_snapshot,
        html_snapshot: data.html_snapshot || null,
        css_snapshot: data.css_snapshot || null,
        javascript_snapshot: data.javascript_snapshot || null
      })
      .select()
      .single()

    return { version, error }
  } catch (error) {
    console.error('Error creating version:', error)
    return { version: null, error }
  }
}

/**
 * Get all versions for a project
 */
export async function getProjectVersions(projectId: string): Promise<{ versions: Version[]; error: any }> {
  try {
    const { data: versions, error } = await supabase
      .from('versions')
      .select('*')
      .eq('project_id', projectId)
      .order('version_number', { ascending: false })

    return { versions: versions || [], error }
  } catch (error) {
    console.error('Error getting versions:', error)
    return { versions: [], error }
  }
}

/**
 * Get a specific version
 */
export async function getVersion(versionId: string): Promise<{ version: Version | null; error: any }> {
  try {
    const { data: version, error } = await supabase
      .from('versions')
      .select('*')
      .eq('id', versionId)
      .single()

    return { version, error }
  } catch (error) {
    console.error('Error getting version:', error)
    return { version: null, error }
  }
}

/**
 * Restore a project to a specific version
 */
export async function restoreVersion(versionId: string, projectId: string): Promise<{ success: boolean; error: any }> {
  try {
    // Get the version
    const { version, error: versionError } = await getVersion(versionId)
    
    if (versionError || !version) {
      return { success: false, error: versionError }
    }

    // Update the project with the version snapshot
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        code: version.code_snapshot,
        html: version.html_snapshot,
        css: version.css_snapshot,
        javascript: version.javascript_snapshot,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)

    if (updateError) {
      return { success: false, error: updateError }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Error restoring version:', error)
    return { success: false, error }
  }
}

/**
 * Delete a version
 */
export async function deleteVersion(versionId: string): Promise<{ error: any }> {
  try {
    const { error } = await supabase
      .from('versions')
      .delete()
      .eq('id', versionId)

    return { error }
  } catch (error) {
    console.error('Error deleting version:', error)
    return { error }
  }
}

/**
 * Simple diff between two strings
 */
export function getDiff(oldText: string, newText: string): { added: string[]; removed: string[]; unchanged: string[] } {
  const oldLines = oldText.split('\n')
  const newLines = newText.split('\n')
  
  const added: string[] = []
  const removed: string[] = []
  const unchanged: string[] = []
  
  const maxLines = Math.max(oldLines.length, newLines.length)
  
  for (let i = 0; i < maxLines; i++) {
    const oldLine = oldLines[i]
    const newLine = newLines[i]
    
    if (oldLine === newLine) {
      unchanged.push(newLine || '')
    } else if (oldLine && !newLine) {
      removed.push(oldLine)
    } else if (!oldLine && newLine) {
      added.push(newLine)
    } else if (oldLine !== newLine) {
      removed.push(oldLine)
      added.push(newLine)
    }
  }
  
  return { added, removed, unchanged }
}

/**
 * Auto-save version (create snapshot automatically)
 */
export async function autoSaveVersion(
  projectId: string,
  code: string,
  message?: string
): Promise<{ version: Version | null; error: any }> {
  return createVersion({
    project_id: projectId,
    code_snapshot: code,
    message: message || 'Auto-save'
  })
}
