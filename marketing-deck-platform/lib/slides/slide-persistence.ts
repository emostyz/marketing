import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { ClientAuth } from '@/lib/auth/client-auth'

export interface SlideData {
  id: string
  title: string
  subtitle?: string
  content: any
  charts: any[]
  narrative: string
  purpose: string
  executiveAction: any
  speakerNotes: string
  metadata: {
    createdAt: string
    updatedAt: string
    version: number
    tags: string[]
    analysisId?: string
  }
}

export interface PresentationData {
  id: string
  title: string
  slides: SlideData[]
  metadata: {
    userId: string
    industry: string
    businessContext: string
    createdAt: string
    updatedAt: string
    version: number
    totalSlides: number
    estimatedDuration: number
    analysisMetadata: any
  }
  exportFormats: {
    png?: string[]
    pdf?: string
    pptx?: string
  }
}

export class SlidePersistenceService {
  private supabase = createClientComponentClient()

  async savePresentation(presentationData: PresentationData): Promise<string> {
    try {
      // Get current user
      const user = await ClientAuth.getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Save presentation to database
      const { data, error } = await this.supabase
        .from('presentations')
        .upsert({
          id: presentationData.id,
          user_id: user.id,
          title: presentationData.title,
          slides_data: presentationData.slides,
          metadata: presentationData.metadata,
          export_formats: presentationData.exportFormats,
          updated_at: new Date().toISOString()
        })
        .select()

      if (error) {
        console.error('Error saving presentation:', error)
        throw error
      }

      console.log('✅ Presentation saved successfully:', presentationData.id)
      return presentationData.id
    } catch (error) {
      console.error('❌ Failed to save presentation:', error)
      throw error
    }
  }

  async loadPresentation(presentationId: string): Promise<PresentationData | null> {
    try {
      const user = await ClientAuth.getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await this.supabase
        .from('presentations')
        .select('*')
        .eq('id', presentationId)
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error loading presentation:', error)
        return null
      }

      return {
        id: data.id,
        title: data.title,
        slides: data.slides_data,
        metadata: data.metadata,
        exportFormats: data.export_formats || {}
      }
    } catch (error) {
      console.error('❌ Failed to load presentation:', error)
      return null
    }
  }

  async getUserPresentations(): Promise<PresentationData[]> {
    try {
      const user = await ClientAuth.getCurrentUser()
      if (!user) {
        return []
      }

      const { data, error } = await this.supabase
        .from('presentations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error loading user presentations:', error)
        return []
      }

      return data.map(item => ({
        id: item.id,
        title: item.title,
        slides: item.slides_data,
        metadata: item.metadata,
        exportFormats: item.export_formats || {}
      }))
    } catch (error) {
      console.error('❌ Failed to load user presentations:', error)
      return []
    }
  }

  async deletePresentation(presentationId: string): Promise<boolean> {
    try {
      const user = await ClientAuth.getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { error } = await this.supabase
        .from('presentations')
        .delete()
        .eq('id', presentationId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting presentation:', error)
        return false
      }

      console.log('✅ Presentation deleted successfully:', presentationId)
      return true
    } catch (error) {
      console.error('❌ Failed to delete presentation:', error)
      return false
    }
  }

  async exportSlideAsPNG(slideData: SlideData): Promise<string> {
    try {
      // This would typically use a service like Puppeteer or Canvas to generate PNG
      // For now, we'll simulate the export process
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        throw new Error('Could not get canvas context')
      }

      // Set canvas dimensions for presentation slide (16:9 aspect ratio)
      canvas.width = 1920
      canvas.height = 1080

      // Create high-quality slide rendering
      ctx.fillStyle = '#0F1419' // Dark background
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add slide title
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 48px Inter, sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(slideData.title, 80, 120)

      // Add subtitle if exists
      if (slideData.subtitle) {
        ctx.fillStyle = '#9CA3AF'
        ctx.font = '32px Inter, sans-serif'
        ctx.fillText(slideData.subtitle, 80, 180)
      }

      // Add content bullets
      if (slideData.content?.bulletPoints) {
        ctx.fillStyle = '#FFFFFF'
        ctx.font = '28px Inter, sans-serif'
        slideData.content.bulletPoints.forEach((bullet: string, index: number) => {
          const y = 280 + (index * 60)
          ctx.fillText(`• ${bullet}`, 120, y)
        })
      }

      // Convert canvas to blob and upload
      return new Promise((resolve, reject) => {
        canvas.toBlob(async (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'))
            return
          }

          try {
            // Upload to Supabase storage
            const fileName = `slides/${slideData.id}_${Date.now()}.png`
            const { data, error } = await this.supabase.storage
              .from('slide-exports')
              .upload(fileName, blob, {
                contentType: 'image/png',
                upsert: true
              })

            if (error) {
              reject(error)
              return
            }

            // Get public URL
            const { data: urlData } = this.supabase.storage
              .from('slide-exports')
              .getPublicUrl(fileName)

            console.log('✅ Slide exported as PNG:', urlData.publicUrl)
            resolve(urlData.publicUrl)
          } catch (uploadError) {
            reject(uploadError)
          }
        }, 'image/png', 0.95)
      })
    } catch (error) {
      console.error('❌ Failed to export slide as PNG:', error)
      throw error
    }
  }

  async exportPresentationAsPNG(presentationData: PresentationData): Promise<string[]> {
    try {
      const pngUrls: string[] = []
      
      for (const slide of presentationData.slides) {
        const pngUrl = await this.exportSlideAsPNG(slide)
        pngUrls.push(pngUrl)
      }

      // Update presentation with PNG export URLs
      await this.savePresentation({
        ...presentationData,
        exportFormats: {
          ...presentationData.exportFormats,
          png: pngUrls
        }
      })

      console.log('✅ Presentation exported as PNG collection:', pngUrls.length, 'slides')
      return pngUrls
    } catch (error) {
      console.error('❌ Failed to export presentation as PNG:', error)
      throw error
    }
  }

  async analyzeSlideQuality(slideData: SlideData): Promise<{
    score: number
    recommendations: string[]
    strengths: string[]
    improvements: string[]
  }> {
    try {
      // Analyze slide quality based on executive presentation best practices
      let score = 0
      const recommendations: string[] = []
      const strengths: string[] = []
      const improvements: string[] = []

      // Title quality (20 points)
      if (slideData.title.length > 0) {
        score += 10
        if (slideData.title.length >= 20 && slideData.title.length <= 80) {
          score += 10
          strengths.push('Title length is optimal for executive attention')
        } else {
          improvements.push('Consider adjusting title length (20-80 characters ideal)')
        }
      } else {
        improvements.push('Add a compelling title')
      }

      // Content structure (25 points)
      if (slideData.content?.bulletPoints) {
        score += 15
        if (slideData.content.bulletPoints.length >= 3 && slideData.content.bulletPoints.length <= 5) {
          score += 10
          strengths.push('Optimal number of bullet points for executive presentations')
        } else if (slideData.content.bulletPoints.length > 5) {
          improvements.push('Consider reducing bullet points to 3-5 for better impact')
        }
      } else {
        improvements.push('Add structured content with bullet points')
      }

      // Charts and data visualization (25 points)
      if (slideData.charts && slideData.charts.length > 0) {
        score += 15
        if (slideData.charts.some(chart => chart.driversAnalysis)) {
          score += 10
          strengths.push('Charts include drivers analysis for deeper insights')
        } else {
          improvements.push('Add drivers analysis to charts for strategic depth')
        }
      } else {
        improvements.push('Consider adding data visualizations to support your narrative')
      }

      // Executive action (15 points)
      if (slideData.executiveAction) {
        score += 10
        if (slideData.executiveAction.nextSteps && slideData.executiveAction.nextSteps.length > 0) {
          score += 5
          strengths.push('Clear action items defined for executive follow-up')
        } else {
          improvements.push('Add specific next steps for executive action')
        }
      } else {
        improvements.push('Include executive action section with clear next steps')
      }

      // Speaker notes (15 points)
      if (slideData.speakerNotes && slideData.speakerNotes.length > 50) {
        score += 15
        strengths.push('Comprehensive speaker notes for effective delivery')
      } else {
        improvements.push('Add detailed speaker notes for professional presentation')
      }

      // Generate recommendations based on score
      if (score >= 85) {
        recommendations.push('Excellent slide quality - ready for C-suite presentation')
      } else if (score >= 70) {
        recommendations.push('Good slide quality - minor improvements recommended')
      } else if (score >= 50) {
        recommendations.push('Moderate slide quality - several improvements needed')
      } else {
        recommendations.push('Significant improvements needed for executive-level presentation')
      }

      return {
        score,
        recommendations,
        strengths,
        improvements
      }
    } catch (error) {
      console.error('❌ Failed to analyze slide quality:', error)
      throw error
    }
  }
}

export const slidePersistence = new SlidePersistenceService()