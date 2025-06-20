'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface PresentationData {
  id?: string
  user_id: string
  title: string
  description?: string
  slides: any[]
  metadata: {
    datasetName?: string
    analysisType?: string
    confidence?: number
    generatedAt: string
    dataPoints?: number
    userRequirements?: string
    userGoals?: string
  }
  status: 'draft' | 'completed' | 'published'
  created_at?: string
  updated_at?: string
}

export interface DatasetData {
  id?: string
  user_id: string
  name: string
  description?: string
  file_name: string
  file_size: number
  data: any[]
  columns: string[]
  metadata: {
    rows: number
    uploadedAt: string
    fileType: string
    analysisCount?: number
  }
  created_at?: string
  updated_at?: string
}

class DatabaseHelpers {
  private supabase = createClientComponentClient()

  // Presentations
  async savePresentation(presentationData: PresentationData): Promise<{ data?: PresentationData, error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('presentations')
        .upsert({
          ...presentationData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase save error:', error)
        return { error: error.message }
      }

      return { data }
    } catch (error) {
      console.error('Database save error:', error)
      return { error: 'Failed to save presentation' }
    }
  }

  async loadUserPresentations(userId: string): Promise<{ data?: PresentationData[], error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('presentations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Supabase load error:', error)
        return { error: error.message }
      }

      return { data: data || [] }
    } catch (error) {
      console.error('Database load error:', error)
      return { error: 'Failed to load presentations' }
    }
  }

  async loadPresentation(id: string, userId: string): Promise<{ data?: PresentationData, error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('presentations')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Supabase load error:', error)
        return { error: error.message }
      }

      return { data }
    } catch (error) {
      console.error('Database load error:', error)
      return { error: 'Failed to load presentation' }
    }
  }

  async deletePresentation(id: string, userId: string): Promise<{ error?: string }> {
    try {
      const { error } = await this.supabase
        .from('presentations')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) {
        console.error('Supabase delete error:', error)
        return { error: error.message }
      }

      return {}
    } catch (error) {
      console.error('Database delete error:', error)
      return { error: 'Failed to delete presentation' }
    }
  }

  // Datasets
  async saveDataset(datasetData: DatasetData): Promise<{ data?: DatasetData, error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('datasets')
        .upsert({
          ...datasetData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase save dataset error:', error)
        return { error: error.message }
      }

      return { data }
    } catch (error) {
      console.error('Database save dataset error:', error)
      return { error: 'Failed to save dataset' }
    }
  }

  async loadUserDatasets(userId: string): Promise<{ data?: DatasetData[], error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('datasets')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Supabase load datasets error:', error)
        return { error: error.message }
      }

      return { data: data || [] }
    } catch (error) {
      console.error('Database load datasets error:', error)
      return { error: 'Failed to load datasets' }
    }
  }

  async deleteDataset(id: string, userId: string): Promise<{ error?: string }> {
    try {
      const { error } = await this.supabase
        .from('datasets')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) {
        console.error('Supabase delete dataset error:', error)
        return { error: error.message }
      }

      return {}
    } catch (error) {
      console.error('Database delete dataset error:', error)
      return { error: 'Failed to delete dataset' }
    }
  }

  // Analytics
  async incrementAnalysisCount(datasetId: string): Promise<void> {
    try {
      const { error } = await this.supabase.rpc('increment_analysis_count', {
        dataset_id: datasetId
      })

      if (error) {
        console.error('Failed to increment analysis count:', error)
      }
    } catch (error) {
      console.error('Error incrementing analysis count:', error)
    }
  }

  async getUserStats(userId: string): Promise<{
    totalPresentations: number
    totalDatasets: number
    totalSlides: number
    avgConfidence: number
  }> {
    try {
      const [presentationsResult, datasetsResult] = await Promise.all([
        this.supabase
          .from('presentations')
          .select('slides, metadata')
          .eq('user_id', userId),
        this.supabase
          .from('datasets')
          .select('id')
          .eq('user_id', userId)
      ])

      const presentations = presentationsResult.data || []
      const datasets = datasetsResult.data || []

      const totalSlides = presentations.reduce((sum, p) => sum + (p.slides?.length || 0), 0)
      const avgConfidence = presentations.length > 0 
        ? Math.round(presentations.reduce((sum, p) => sum + (p.metadata?.confidence || 0), 0) / presentations.length)
        : 0

      return {
        totalPresentations: presentations.length,
        totalDatasets: datasets.length,
        totalSlides,
        avgConfidence
      }
    } catch (error) {
      console.error('Error getting user stats:', error)
      return {
        totalPresentations: 0,
        totalDatasets: 0,
        totalSlides: 0,
        avgConfidence: 0
      }
    }
  }
}

export const dbHelpers = new DatabaseHelpers()