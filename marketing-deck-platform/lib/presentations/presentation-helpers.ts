// Enhanced Presentation Helper Functions
// This builds ON TOP of the existing system without replacing it

import { dbHelpers } from '@/lib/supabase/database-helpers'

export interface EnhancedPresentationData {
  id: string
  title: string
  description: string
  slides: any[]
  metadata: {
    datasetName?: string
    analysisType?: string
    confidence?: number
    generatedAt: string
    dataPoints?: number
    brainGenerated?: boolean
    strategicInsights?: number
    recommendations?: number
    risks?: number
    version?: string
    worldClass?: boolean
  }
  strategicInsights?: any
  status: 'draft' | 'completed' | 'published'
  user_id?: string
}

export class PresentationManager {
  // Enhanced save that works with both localStorage and database
  static async savePresentation(presentation: EnhancedPresentationData, userId?: string): Promise<boolean> {
    try {
      // Always save to localStorage first for immediate access
      localStorage.setItem(`presentation_${presentation.id}`, JSON.stringify(presentation))
      
      // If user is authenticated, also save to database
      if (userId) {
        try {
          await dbHelpers.savePresentation({
            ...presentation,
            user_id: userId
          })
          console.log('✅ Presentation saved to database')
        } catch (dbError) {
          console.warn('Database save failed, using localStorage:', dbError)
          // Continue with localStorage as fallback
        }
      }
      
      return true
    } catch (error) {
      console.error('Failed to save presentation:', error)
      return false
    }
  }
  
  // Enhanced load that checks both sources
  static async loadPresentation(presentationId: string, userId?: string): Promise<EnhancedPresentationData | null> {
    try {
      // First check database if user is authenticated
      if (userId) {
        try {
          const { data: dbPresentation } = await dbHelpers.loadPresentation(presentationId, userId)
          if (dbPresentation) {
            console.log('✅ Loaded from database')
            return {
              id: dbPresentation.id!,
              title: dbPresentation.title,
              description: dbPresentation.description || 'AI Generated Presentation',
              slides: dbPresentation.slides || [],
              metadata: dbPresentation.metadata,
              status: dbPresentation.status,
              user_id: dbPresentation.user_id
            }
          }
        } catch (dbError) {
          console.warn('Database load failed, checking localStorage:', dbError)
        }
      }
      
      // Fallback to localStorage
      const savedData = localStorage.getItem(`presentation_${presentationId}`)
      if (savedData) {
        console.log('✅ Loaded from localStorage')
        return JSON.parse(savedData)
      }
      
      console.warn('❌ Presentation not found in database or localStorage')
      return null
    } catch (error) {
      console.error('Failed to load presentation:', error)
      return null
    }
  }
  
  // Get all presentations for a user
  static async getUserPresentations(userId: string): Promise<EnhancedPresentationData[]> {
    try {
      const { data: presentations } = await dbHelpers.loadUserPresentations(userId)
      return (presentations || []).map((p: any) => ({
        id: p.id!,
        title: p.title,
        description: p.description || 'AI Generated Presentation',
        slides: p.slides || [],
        metadata: p.metadata,
        status: p.status,
        user_id: p.user_id
      }))
    } catch (error) {
      console.error('Failed to load user presentations:', error)
      return []
    }
  }
  
  // Migrate localStorage presentations to database
  static async migrateLocalPresentations(userId: string): Promise<void> {
    try {
      const localKeys = Object.keys(localStorage).filter(key => key.startsWith('presentation_'))
      
      for (const key of localKeys) {
        const data = localStorage.getItem(key)
        if (data) {
          const presentation = JSON.parse(data)
          presentation.user_id = userId
          
          try {
            await dbHelpers.savePresentation(presentation)
            console.log(`✅ Migrated ${presentation.title} to database`)
          } catch (error) {
            console.warn(`Failed to migrate ${presentation.title}:`, error)
          }
        }
      }
    } catch (error) {
      console.error('Migration failed:', error)
    }
  }
}

// Enhanced data flow helpers
export class DataFlowManager {
  // Process uploaded data and prepare for AI analysis
  static processUploadData(uploadData: any): any {
    const processedData = {
      ...uploadData,
      data: Array.isArray(uploadData.data) ? uploadData.data : [],
      metadata: {
        ...uploadData.metadata,
        processedAt: new Date().toISOString(),
        dataPoints: uploadData.data?.length || 0
      }
    }
    
    console.log(`📊 Processed ${processedData.data.length} data points`)
    return processedData
  }
  
  // Generate presentation from analysis results
  static async generatePresentationFromAnalysis(
    analysis: any,
    uploadData: any,
    slides: any[]
  ): Promise<EnhancedPresentationData> {
    const presentationId = `pres_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const presentation: EnhancedPresentationData = {
      id: presentationId,
      title: uploadData.title || 'AI-Generated Strategic Analysis',
      description: `Advanced brain analysis with ${slides.length} slides and ${analysis?.dataPoints?.length || 0} key insights`,
      slides: slides,
      metadata: {
        datasetName: uploadData.fileName || 'Dataset',
        analysisType: uploadData.qaResponses?.analysisType || 'comprehensive',
        confidence: analysis?.confidence || 85,
        generatedAt: new Date().toISOString(),
        dataPoints: uploadData.data?.length || 0,
        brainGenerated: true,
        strategicInsights: analysis?.dataPoints?.length || 0,
        recommendations: analysis?.strategicRecommendations?.length || 0,
        version: '2.0',
        worldClass: true
      },
      strategicInsights: analysis,
      status: 'completed'
    }
    
    console.log(`🎯 Generated presentation: ${presentation.title}`)
    return presentation
  }
}

// Navigation helpers that ensure proper flow
export class NavigationManager {
  static async navigateToPresentation(presentationId: string, router: any, delay: number = 1000): Promise<void> {
    try {
      console.log(`🚀 Navigating to presentation: ${presentationId}`)
      
      // Add a small delay to ensure data is saved
      await new Promise(resolve => setTimeout(resolve, delay))
      
      // Navigate to deck builder
      router.push(`/deck-builder/${presentationId}`)
    } catch (error) {
      console.error('Navigation failed:', error)
      throw error
    }
  }
  
  static async ensurePresentationExists(presentationId: string): Promise<boolean> {
    const presentation = await PresentationManager.loadPresentation(presentationId)
    return presentation !== null
  }
}