/**
 * Supabase Client Configuration
 * 
 * This module initializes the Supabase client for authentication and database operations.
 * Environment variables are loaded from .dev.vars (local) or Cloudflare env (production).
 */

import { createClient } from '@supabase/supabase-js'

// Environment variables (set in .dev.vars for local, wrangler secrets for prod)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          code: string | null
          html: string | null
          css: string | null
          javascript: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          code?: string | null
          html?: string | null
          css?: string | null
          javascript?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          code?: string | null
          html?: string | null
          css?: string | null
          javascript?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          title: string
          messages: any[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          title: string
          messages?: any[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          title?: string
          messages?: any[]
          created_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          user_id: string
          name: string
          category: string
          description: string | null
          prompt: string
          tags: string[]
          is_favorite: boolean
          use_count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          category: string
          description?: string | null
          prompt: string
          tags?: string[]
          is_favorite?: boolean
          use_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          category?: string
          description?: string | null
          prompt?: string
          tags?: string[]
          is_favorite?: boolean
          use_count?: number
          created_at?: string
        }
      }
    }
  }
}

export type Project = Database['public']['Tables']['projects']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type Template = Database['public']['Tables']['templates']['Row']
