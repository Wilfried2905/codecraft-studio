/**
 * useProject Hook
 * 
 * Custom hook for managing project state and operations:
 * - Current project state
 * - Auto-save functionality
 * - Project CRUD operations
 * - Loading states
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { ProjectAutoSaver } from '../services/projectService'
import type { Project } from '../services/supabaseClient'
import { getProject, updateProject, createProject } from '../services/projectService'

export interface UseProjectReturn {
  currentProject: Project | null
  loading: boolean
  autoSaver: ProjectAutoSaver
  setCurrentProject: (project: Project | null) => void
  loadProject: (projectId: string) => Promise<void>
  saveProject: (data: { name?: string; code?: string; html?: string; css?: string; javascript?: string }) => Promise<void>
  createNewProject: (name: string) => Promise<Project | null>
  updateProjectCode: (code: string) => void
  updateProjectName: (name: string) => void
}

export function useProject(): UseProjectReturn {
  const { isAuthenticated } = useAuth()
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(false)
  const [autoSaver] = useState(() => new ProjectAutoSaver(2000))

  // Update auto-saver when project changes
  useEffect(() => {
    if (currentProject) {
      autoSaver.setProjectId(currentProject.id)
    } else {
      autoSaver.setProjectId(null)
    }
  }, [currentProject, autoSaver])

  // Load a project by ID
  const loadProject = useCallback(async (projectId: string) => {
    setLoading(true)
    try {
      const { project, error } = await getProject(projectId)
      if (!error && project) {
        setCurrentProject(project)
      }
    } catch (error) {
      console.error('Error loading project:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Save project (force save)
  const saveProject = useCallback(async (data: {
    name?: string
    code?: string
    html?: string
    css?: string
    javascript?: string
  }) => {
    if (!currentProject) return

    const { error } = await autoSaver.forceSave(data)
    if (!error) {
      // Update local state
      setCurrentProject(prev => prev ? { ...prev, ...data, updated_at: new Date().toISOString() } : null)
    }
  }, [currentProject, autoSaver])

  // Create a new project
  const createNewProject = useCallback(async (name: string): Promise<Project | null> => {
    if (!isAuthenticated) return null

    setLoading(true)
    try {
      const { project, error } = await createProject({ name })
      if (!error && project) {
        setCurrentProject(project)
        return project
      }
    } catch (error) {
      console.error('Error creating project:', error)
    } finally {
      setLoading(false)
    }
    return null
  }, [isAuthenticated])

  // Update project code (with auto-save)
  const updateProjectCode = useCallback((code: string) => {
    if (!currentProject) return

    // Update local state immediately
    setCurrentProject(prev => prev ? { ...prev, code } : null)

    // Schedule auto-save
    autoSaver.scheduleSave({ code })
  }, [currentProject, autoSaver])

  // Update project name
  const updateProjectName = useCallback((name: string) => {
    if (!currentProject) return

    // Update local state immediately
    setCurrentProject(prev => prev ? { ...prev, name } : null)

    // Schedule auto-save
    autoSaver.scheduleSave({ name })
  }, [currentProject, autoSaver])

  return {
    currentProject,
    loading,
    autoSaver,
    setCurrentProject,
    loadProject,
    saveProject,
    createNewProject,
    updateProjectCode,
    updateProjectName
  }
}
