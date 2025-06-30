/**
 * Enhanced World-Class Deck Generation API
 * Integrates the new AI pipeline with your existing successful system
 * Falls back gracefully to maintain current functionality
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/api-auth'
import { enhanceExistingDeckGeneration } from '@/services/aiAgents/orchestrator'

// Import your existing generation logic as fallback
import { POST as existingGeneration } from '../generate-world-class/route'

export async function POST(request: NextRequest) {
  try {
    const { datasetId, context, enableEnhanced = true } = await request.json() as {
      datasetId: string
      context: any
      enableEnhanced?: boolean
    }
    
    console.log('🚀 Enhanced deck generation requested:', { 
      datasetId, 
      enableEnhanced,
      contextKeys: Object.keys(context || {})
    })
    
    // Get authenticated user
    const user = await requireAuth()
    console.log(`👤 User: ${user.id.slice(0, 8)}...${user.id.slice(-4)}`)
    
    // Check if enhanced pipeline is enabled and available
    if (enableEnhanced && process.env.ENABLE_ENHANCED_PIPELINE !== 'false') {
      try {
        console.log('✨ Attempting enhanced AI pipeline generation...')
        
        // Generate a deck ID for tracking
        const deckId = `enhanced-deck-${Date.now()}`
        
        // Use the enhanced orchestrator
        const enhancedResult = await enhanceExistingDeckGeneration(
          deckId,
          datasetId,
          {
            businessContext: context.goal || 'Executive presentation',
            targetAudience: context.audience || 'Leadership team',
            presentationGoal: context.goal || 'Share insights and get buy-in',
            timeConstraint: context.timeLimit || 15,
            industry: context.industry || 'Technology',
            companyStage: context.companyStage || 'Growth',
            keyQuestions: [
              'What are the key trends?',
              'What opportunities exist?',
              'What should we do next?'
            ]
          }
        )
        
        console.log('✅ Enhanced pipeline completed successfully!')
        console.log(`   - Quality Score: ${enhancedResult.metadata.qualityScore}`)
        console.log(`   - Slides: ${enhancedResult.slides.length}`)
        console.log(`   - Charts: ${enhancedResult.metadata.totalCharts}`)
        
        // Convert to format compatible with your existing frontend
        const compatibleResponse = {
          success: true,
          deckId: enhancedResult.id,
          slides: enhancedResult.slides.map(slide => ({
            id: slide.id,
            title: slide.title,
            content: slide.elements
              .filter(el => el.type === 'text' && el.content)
              .map(el => el.content)
              .filter(Boolean),
            elements: slide.elements,
            type: slide.layout,
            layout: slide.layout,
            charts: slide.elements
              .filter(el => el.type === 'chart')
              .map(el => ({
                type: el.chartType,
                data: el.chartData,
                title: el.content,
                metadata: el.metadata
              })),
            aiGenerated: true,
            aiPowered: true,
            editorFeatures: {
              smartPositioning: true,
              professionalLayers: true,
              advancedAnimations: true,
              intelligentGrouping: true,
              responsiveDesign: true
            }
          })),
          quality: 'enhanced-world-class',
          qualityScore: enhancedResult.metadata.qualityScore,
          estimatedImpact: 'High - Enhanced AI Analysis',
          slidesGenerated: enhancedResult.slides.length,
          templateUsed: enhancedResult.template || 'Enhanced Executive',
          enhancedFeatures: {
            pythonAnalysis: true,
            aiSlideStructure: true,
            intelligentCharts: true,
            professionalLayout: true,
            executiveTheme: true
          },
          debug: {
            pipeline: 'enhanced',
            analysisScore: enhancedResult.metadata.qualityScore,
            totalElements: enhancedResult.metadata.totalElements,
            chartsGenerated: enhancedResult.metadata.totalCharts,
            processingTimeMs: Date.now() - parseInt(deckId.split('-').pop() || '0')
          }
        }
        
        return NextResponse.json(compatibleResponse)
        
      } catch (enhancedError) {
        console.warn(`⚠️  Enhanced pipeline failed: ${enhancedError.message}`)
        console.log('🔄 Falling back to existing proven system...')
        
        // Fall back to your existing system
        return await existingGeneration(request)
      }
    } else {
      console.log('🔄 Enhanced pipeline disabled, using existing system')
      return await existingGeneration(request)
    }
    
  } catch (error) {
    console.error('❌ Enhanced generation route error:', error)
    
    // Final fallback to existing system
    try {
      console.log('🔄 Final fallback to existing generation system...')
      return await existingGeneration(request)
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError)
      return NextResponse.json({ 
        error: 'Both enhanced and fallback generation failed',
        details: {
          enhanced: error instanceof Error ? error.message : 'Unknown error',
          fallback: fallbackError instanceof Error ? fallbackError.message : 'Unknown error'
        }
      }, { status: 500 })
    }
  }
}