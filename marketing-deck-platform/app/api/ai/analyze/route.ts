// Enhanced AI Analysis API Endpoint
// Integrates all AI analysis components for real data processing

import { NextRequest, NextResponse } from 'next/server'
import { DataPreparationEngine, AIReadyData } from '@/lib/ai/data-preparation'
import { InsightGenerationEngine, InsightGenerationResult } from '@/lib/ai/insight-generation'
import { ChartRecommendationEngine, ChartRecommendationResult } from '@/lib/ai/chart-recommendations'
import { ExecutiveSummaryGenerator, ExecutiveSummary } from '@/lib/ai/executive-summary'
import { NarrativeGenerationEngine, NarrativeGenerationResult } from '@/lib/ai/narrative-generation'
import { DesignInnovationEngine, DesignInnovationResult } from '@/lib/ai/design-innovation'
import { applyVisualExcellence } from '@/lib/ai/visual-excellence'

export interface AnalysisRequest {
  data: any[]
  datasetIds?: string[]
  context?: {
    industry?: string
    businessContext?: string
    targetAudience?: string
    description?: string
    factors?: string[]
    audience?: string
    goal?: string
    timeLimit?: number
    decision?: string
  }
  options?: {
    includeChartRecommendations?: boolean
    includeExecutiveSummary?: boolean
    includeNarrative?: boolean
    includeDesignInnovation?: boolean
    maxInsights?: number
    confidenceThreshold?: number
    innovationLevel?: 'standard' | 'advanced' | 'revolutionary'
    visualStyle?: 'executive' | 'modern' | 'sales' | 'futuristic' | 'premium' | 'vibrant'
    chartComplexity?: 'simple' | 'moderate' | 'complex'
    narrativeTone?: 'urgent' | 'confident' | 'optimistic' | 'analytical' | 'inspiring' | 'dramatic'
    designComplexity?: 'simple' | 'moderate' | 'complex'
    enableInteractivity?: boolean
    enableAnimations?: boolean
    customColorScheme?: string[]
    customLayoutPreferences?: string[]
  }
}

export interface AnalysisResponse {
  success: boolean
  data: {
    summary: AIReadyData
    insights: InsightGenerationResult
    chartRecommendations: ChartRecommendationResult
    executiveSummary: ExecutiveSummary
    narrative: NarrativeGenerationResult
    designInnovation: DesignInnovationResult
    slideStructure: any[]
    visualExcellence: any
    customizations: CustomizationSettings
    renderingInstructions: any
  }
  metadata: {
    processingTimeMs: number
    dataQualityScore: number
    totalInsights: number
    highPriorityCharts: number
    confidence: number
    innovationScore: number
    narrativeEngagement: number
    designComplexity: number
  }
  error?: string
}

export interface CustomizationSettings {
  visualStyle: string
  innovationLevel: string
  chartTypes: string[]
  colorScheme: string[]
  layoutTypes: string[]
  animationStyles: string[]
  interactivityFeatures: string[]
  narrativeStructure: any
  designFeatures: string[]
  renderingCapabilities: any
}

export async function POST(request: NextRequest): Promise<NextResponse<AnalysisResponse>> {
  const startTime = Date.now()
  
  try {
    console.log('🧠 Enhanced AI Analysis - Starting comprehensive analysis...')
    
    const body: AnalysisRequest = await request.json()
    const { data, datasetIds, context, options } = body

    // Validate input
    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json({
        success: false,
        data: {} as any,
        metadata: {} as any,
        error: 'Valid data array is required'
      }, { status: 400 })
    }

    console.log(`📊 Processing ${data.length} rows of data...`)

    // Step 1: Prepare data for AI analysis
    console.log('🔧 Step 1: Data preparation...')
    const preparedData = DataPreparationEngine.prepareDataForAI(data, undefined, context)
    
    console.log(`✅ Data prepared: ${preparedData.summary.totalRows} rows, ${preparedData.summary.totalColumns} columns, quality: ${preparedData.summary.dataQuality.score}/100`)

    // Step 2: Generate insights from real data
    console.log('🔍 Step 2: Generating insights...')
    const insightEngine = new InsightGenerationEngine()
    const insightResults = await insightEngine.generateInsights(preparedData, context)
    
    console.log(`✅ Generated ${insightResults.insights.length} insights (${insightResults.insights.filter(i => i.impact === 'high').length} high-impact)`)

    // Step 3: Generate chart recommendations
    console.log('📊 Step 3: Chart recommendations...')
    const chartRecommendations = ChartRecommendationEngine.generateRecommendations(preparedData)
    
    console.log(`✅ Generated ${chartRecommendations.recommendations.length} chart recommendations (${chartRecommendations.optimalCharts.length} optimal)`)

    // Step 4: Generate executive summary (if requested)
    let executiveSummary: ExecutiveSummary | null = null
    if (options?.includeExecutiveSummary !== false) {
      console.log('📋 Step 4: Executive summary...')
      try {
        const summaryGenerator = new ExecutiveSummaryGenerator()
        executiveSummary = await summaryGenerator.generateExecutiveSummary(
          preparedData,
          insightResults.insights,
          context
        )
        console.log(`✅ Executive summary generated (${executiveSummary.wordCount} words, ${executiveSummary.confidence}% confidence)`)
      } catch (summaryError) {
        console.warn('⚠️ Executive summary generation failed, continuing without:', summaryError)
        executiveSummary = null
      }
    }

    // Step 5: Generate compelling narrative (if requested)
    let narrativeResult: NarrativeGenerationResult | null = null
    if (options?.includeNarrative !== false) {
      console.log('📖 Step 5: Creating compelling narrative...')
      try {
        const narrativeEngine = new NarrativeGenerationEngine()
        narrativeResult = await narrativeEngine.generateDataStory(
          preparedData,
          insightResults.insights,
          chartRecommendations.recommendations,
          {
            ...context,
            narrativeTone: options?.narrativeTone || 'confident'
          }
        )
        console.log(`✅ Narrative created: ${narrativeResult.story.title} (engagement: ${narrativeResult.metadata.engagementScore}%)`)
      } catch (narrativeError) {
        console.warn('⚠️ Narrative generation failed, continuing without:', narrativeError)
        narrativeResult = null
      }
    }

    // Step 6: Generate design innovations (if requested) - Simplified
    let designInnovation: DesignInnovationResult | null = null
    if (options?.includeDesignInnovation !== false && narrativeResult) {
      console.log('🎨 Step 6: Creating design innovations (simplified)...')
      try {
        const designEngine = new DesignInnovationEngine()
        designInnovation = await designEngine.generateInnovativeDesigns(
          preparedData,
          insightResults.insights,
          chartRecommendations.recommendations,
          narrativeResult.story,
          {
            ...context,
            innovationLevel: options?.innovationLevel || 'advanced',
            designComplexity: options?.designComplexity || 'moderate'
          }
        )
        console.log(`✅ Design innovations created: ${designInnovation.slideDesigns.length} slides (innovation score: ${designInnovation.metadata.innovationScore}%)`)
      } catch (designError) {
        console.warn('⚠️ Design innovation failed, continuing without:', designError)
        designInnovation = null
      }
    }

    // Step 7: Create enhanced slide structure
    console.log('🎯 Step 7: Building enhanced slide structure...')
    const slideStructure = await buildEnhancedSlideStructure(
      preparedData,
      insightResults,
      chartRecommendations,
      executiveSummary,
      narrativeResult,
      designInnovation,
      context,
      options
    )
    
    console.log(`✅ Created ${slideStructure.length} enhanced slides`)

    // Step 8: Apply visual excellence
    console.log('✨ Step 8: Applying visual excellence...')
    const visualExcellence = applyVisualExcellence(
      slideStructure,
      options?.visualStyle || 'futuristic',
      options?.innovationLevel || 'advanced'
    )
    
    console.log(`✅ Visual excellence applied with ${options?.visualStyle || 'futuristic'} theme`)

    // Step 9: Generate customization settings
    const customizations = generateCustomizationSettings(
      options,
      chartRecommendations,
      narrativeResult,
      designInnovation
    )

    // Step 10: Generate rendering instructions for frontend/OpenAI
    const renderingInstructions = generateRenderingInstructions(
      slideStructure,
      customizations,
      designInnovation
    )

    const processingTime = Date.now() - startTime

    console.log(`🎉 Analysis complete in ${processingTime}ms`)

    return NextResponse.json({
      success: true,
      data: {
        summary: preparedData,
        insights: insightResults,
        chartRecommendations,
        executiveSummary: executiveSummary || null,
        narrative: narrativeResult || null,
        designInnovation: designInnovation || null,
        slideStructure,
        visualExcellence,
        customizations,
        renderingInstructions
      },
      metadata: {
        processingTimeMs: processingTime,
        dataQualityScore: preparedData.summary.dataQuality.score,
        totalInsights: insightResults.insights.length,
        highPriorityCharts: chartRecommendations.optimalCharts.length,
        confidence: Math.round(
          (insightResults.metadata.noveltyScore + 
           chartRecommendations.metadata.dataCompatibilityScore +
           (executiveSummary?.confidence || 75)) / 3
        ),
        innovationScore: designInnovation?.metadata.innovationScore || 0,
        narrativeEngagement: narrativeResult?.metadata.engagementScore || 0,
        designComplexity: designInnovation?.metadata.designComplexity || 0
      }
    })

  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('❌ Enhanced AI analysis failed:', error)
    
    return NextResponse.json({
      success: false,
      data: {} as any,
      metadata: {
        processingTimeMs: processingTime,
        dataQualityScore: 0,
        totalInsights: 0,
        highPriorityCharts: 0,
        confidence: 0,
        innovationScore: 0,
        narrativeEngagement: 0,
        designComplexity: 0
      },
      error: error instanceof Error ? error.message : 'Analysis failed'
    }, { status: 500 })
  }
}

/**
 * Build enhanced slide structure with all customization features
 */
async function buildEnhancedSlideStructure(
  data: AIReadyData,
  insights: InsightGenerationResult,
  charts: ChartRecommendationResult,
  summary: ExecutiveSummary | null,
  narrative: NarrativeGenerationResult | null,
  designInnovation: DesignInnovationResult | null,
  context?: any,
  options?: any
): Promise<any[]> {
  const slides = []
  let slideIndex = 0

  // Use narrative structure if available, otherwise fallback to standard structure
  const useNarrative = narrative && options?.includeNarrative !== false
  const useDesign = designInnovation && options?.includeDesignInnovation !== false

  if (useNarrative && useDesign) {
    // ADVANCED: Use narrative-driven slide structure with design innovations
    console.log('🎭 Using narrative-driven structure with design innovations')
    
    return await buildNarrativeDrivenSlides(
      data, insights, charts, summary, narrative, designInnovation, context, options
    )
  } else if (useNarrative) {
    // STANDARD: Use narrative structure without design innovations
    console.log('📖 Using narrative-driven structure')
    
    return await buildNarrativeSlides(
      data, insights, charts, summary, narrative, context, options
    )
  }

  // BASIC: Standard slide structure (backwards compatibility)
  console.log('📊 Using standard slide structure')

  // Slide 1: Title slide with customization
  slides.push({
    id: `slide_title_${Date.now()}`,
    type: 'title',
    title: narrative?.story.title || context?.description || 'Data Analysis Results',
    subtitle: narrative?.story.narrative.opening || `Analysis of ${data.summary.totalRows} records | ${insights.insights.length} Key Insights`,
    content: {
      summary: summary?.summary || insights.summary,
      confidence: summary?.confidence || insights.metadata.noveltyScore,
      theme: narrative?.story.theme || 'Data-Driven Insights',
      emotionalTone: narrative?.story.emotionalTone || options?.narrativeTone || 'confident'
    },
    customization: {
      visualStyle: options?.visualStyle || 'futuristic',
      innovationLevel: options?.innovationLevel || 'advanced',
      layout: 'title_slide_' + (options?.visualStyle || 'futuristic')
    }
  })

  // Continue with standard slides...
  return buildStandardSlides(data, insights, charts, summary, context, options)
}

/**
 * Build standard slide structure (legacy compatibility)
 */
async function buildStandardSlides(
  data: AIReadyData,
  insights: InsightGenerationResult,
  charts: ChartRecommendationResult,
  summary: ExecutiveSummary | null,
  context?: any,
  options?: any
): Promise<any[]> {
  const slides = []

  // Use the original buildSlideStructure logic but with enhanced customization
  return buildSlideStructure(data, insights, charts, summary, context)
}

/**
 * Build slide structure from analysis results (original function)
 */
async function buildSlideStructure(
  data: AIReadyData,
  insights: InsightGenerationResult,
  charts: ChartRecommendationResult,
  summary: ExecutiveSummary | null,
  context?: any
): Promise<any[]> {
  const slides = []

  // Slide 1: Title slide
  slides.push({
    id: `slide_title_${Date.now()}`,
    type: 'title',
    title: context?.description || 'Data Analysis Results',
    subtitle: `Analysis of ${data.summary.totalRows} records | ${insights.insights.length} Key Insights`,
    content: {
      summary: summary?.summary || insights.summary,
      confidence: summary?.confidence || insights.metadata.noveltyScore
    }
  })

  // Slide 2: Executive Summary (if available)
  if (summary) {
    slides.push({
      id: `slide_exec_summary_${Date.now()}`,
      type: 'executive_summary',
      title: 'Executive Summary',
      content: {
        summary: summary.summary,
        keyMetrics: summary.keyMetrics.slice(0, 4),
        recommendations: summary.recommendations.slice(0, 3),
        confidence: summary.confidence
      },
      keyTakeaways: summary.keyMetrics.map(metric => 
        `${metric.name}: ${metric.value} ${metric.change ? `(${metric.change})` : ''}`
      )
    })
  }

  // Slide 3: Data Overview
  slides.push({
    id: `slide_data_overview_${Date.now()}`,
    type: 'data_overview',
    title: 'Data Overview & Quality',
    content: {
      summary: `Analysis of ${data.summary.totalRows} records across ${data.summary.totalColumns} dimensions`,
      dataQuality: data.summary.dataQuality,
      timeRange: data.summary.timeRange,
      keyColumns: data.summary.columns.slice(0, 6).map(col => ({
        name: col.name,
        type: col.type,
        uniqueValues: col.uniqueValues
      }))
    },
    charts: data.summary.timeRange ? [{
      type: 'line',
      title: 'Data Timeline',
      message: `Data spans from ${data.summary.timeRange.start} to ${data.summary.timeRange.end}`,
      config: { showTimeline: true }
    }] : []
  })

  // Slides 4-N: Top insights with visualizations
  const topInsights = insights.insights.filter(insight => 
    insight.impact === 'high' || insight.priority >= 7
  ).slice(0, 8)

  topInsights.forEach((insight, index) => {
    // Find relevant chart for this insight
    const relevantChart = charts.recommendations.find(chart => 
      chart.title.toLowerCase().includes(insight.title.toLowerCase().split(' ')[0]) ||
      (chart.data && typeof chart.data === 'string' && insight.evidence.dataPoints.some(dp => 
        dp.toLowerCase().includes(chart.data.toString().toLowerCase())
      ))
    )

    slides.push({
      id: `slide_insight_${index}_${Date.now()}`,
      type: insight.type === 'correlation' ? 'correlation_analysis' : 
            insight.type === 'trend' ? 'trend_analysis' :
            insight.type === 'anomaly' ? 'anomaly_detection' : 'insight',
      title: insight.title,
      content: {
        summary: insight.description,
        businessImplication: insight.businessImplication,
        actionableRecommendation: insight.actionableRecommendation,
        evidence: insight.evidence,
        confidence: insight.confidence
      },
      charts: relevantChart ? [{
        id: relevantChart.id,
        type: relevantChart.chartType,
        title: relevantChart.title,
        message: relevantChart.description,
        config: relevantChart.configuration,
        data: data.sampleData, // Use sample data for visualization
        insights: relevantChart.insights,
        businessValue: relevantChart.businessValue
      }] : [],
      keyTakeaways: [
        insight.description,
        insight.businessImplication,
        insight.actionableRecommendation
      ],
      metadata: {
        insightType: insight.type,
        priority: insight.priority,
        impact: insight.impact
      }
    })
  })

  // Final slide: Recommendations & Next Steps
  if (summary?.recommendations.length) {
    slides.push({
      id: `slide_recommendations_${Date.now()}`,
      type: 'recommendations',
      title: 'Strategic Recommendations',
      content: {
        summary: 'Key actionable recommendations based on data analysis',
        recommendations: summary.recommendations,
        nextSteps: summary.nextSteps,
        confidence: summary.confidence
      },
      keyTakeaways: summary.recommendations.map(rec => rec.title)
    })
  }

  return slides
}

/**
 * Build narrative-driven slides with full design innovation
 */
async function buildNarrativeDrivenSlides(
  data: AIReadyData,
  insights: InsightGenerationResult,
  charts: ChartRecommendationResult,
  summary: ExecutiveSummary | null,
  narrative: NarrativeGenerationResult,
  designInnovation: DesignInnovationResult,
  context: any,
  options: any
): Promise<any[]> {
  const slides = []
  
  // Build slides based on narrative structure and design innovations
  designInnovation.slideDesigns.forEach((slideDesign, index) => {
    const visualSlide = narrative.story.visualFlow[index]
    const narrativeSlide = narrative.story.structure.acts.setup
      .concat(narrative.story.structure.acts.conflict)
      .concat(narrative.story.structure.acts.resolution)
      .find(s => s.slideNumber === slideDesign.slideNumber)
    
    if (narrativeSlide && visualSlide) {
      const relevantInsights = insights.insights.filter(insight => 
        insight.priority >= 7 || insight.impact === 'high'
      ).slice(index, index + 2) // Up to 2 insights per slide
      
      const relevantCharts = slideDesign.chartIntegration.map(integration => {
        const chart = charts.recommendations.find(c => c.id === integration.chartId)
        if (chart) {
          return {
            ...chart,
            integration: integration,
            enhancement: integration.enhancement,
            customization: {
              style: integration.integrationStyle,
              visualUpgrades: integration.enhancement.visualUpgrade,
              interactivity: integration.enhancement.interactivityBoost,
              storytelling: integration.enhancement.storytellingImprovement,
              innovation: integration.enhancement.innovationElements
            }
          }
        }
        return null
      }).filter(Boolean)
      
      slides.push({
        id: `slide_narrative_${slideDesign.slideNumber}_${Date.now()}`,
        type: narrativeSlide.role,
        title: narrativeSlide.title,
        subtitle: narrativeSlide.subtitle,
        content: {
          narrative: narrativeSlide.narrative,
          purpose: narrativeSlide.purpose,
          emotionalNote: narrativeSlide.emotionalNote,
          insights: relevantInsights.map(insight => ({
            title: insight.title,
            description: insight.description,
            businessImplication: insight.businessImplication,
            recommendation: insight.actionableRecommendation,
            confidence: insight.confidence,
            evidence: insight.evidence
          })),
          visualFocus: narrativeSlide.visualFocus,
          transition: narrativeSlide.transition
        },
        charts: relevantCharts,
        design: {
          concept: slideDesign.designConcept,
          layout: slideDesign.layoutAdaptation,
          uniqueFeatures: slideDesign.uniqueFeatures,
          storytellingEnhancement: slideDesign.storytellingEnhancement
        },
        visualNarrative: {
          impact: visualSlide.impact,
          emphasis: visualSlide.emphasis,
          connections: visualSlide.connections,
          narrative: visualSlide.narrative
        },
        customization: {
          visualStyle: options?.visualStyle || 'futuristic',
          innovationLevel: options?.innovationLevel || 'advanced',
          designComplexity: slideDesign.designConcept.complexity,
          layout: slideDesign.layoutAdaptation.innovativeLayout,
          animations: slideDesign.designConcept.implementation.animations,
          interactivity: slideDesign.designConcept.implementation.interactivity,
          colorScheme: options?.customColorScheme || [],
          enableAnimations: options?.enableAnimations !== false,
          enableInteractivity: options?.enableInteractivity !== false
        },
        metadata: {
          narrativeRole: narrativeSlide.role,
          visualImpact: visualSlide.impact,
          innovationScore: slideDesign.designConcept.visualImpact,
          designComplexity: slideDesign.designConcept.complexity,
          slideNumber: slideDesign.slideNumber
        }
      })
    }
  })
  
  return slides
}

/**
 * Build narrative slides without design innovation
 */
async function buildNarrativeSlides(
  data: AIReadyData,
  insights: InsightGenerationResult,
  charts: ChartRecommendationResult,
  summary: ExecutiveSummary | null,
  narrative: NarrativeGenerationResult,
  context: any,
  options: any
): Promise<any[]> {
  const slides = []
  
  // Build slides based on narrative structure
  narrative.story.structure.acts.setup
    .concat(narrative.story.structure.acts.conflict)
    .concat(narrative.story.structure.acts.resolution)
    .forEach((narrativeSlide, index) => {
      const visualSlide = narrative.story.visualFlow.find(v => v.slideNumber === narrativeSlide.slideNumber)
      
      if (visualSlide) {
        const relevantInsights = insights.insights.filter(insight => 
          insight.priority >= 6 || insight.impact === 'high'
        ).slice(index, index + 1) // 1 insight per slide
        
        const relevantChart = charts.recommendations[index % charts.recommendations.length]
        
        slides.push({
          id: `slide_narrative_simple_${narrativeSlide.slideNumber}_${Date.now()}`,
          type: narrativeSlide.role,
          title: narrativeSlide.title,
          subtitle: narrativeSlide.subtitle,
          content: {
            narrative: narrativeSlide.narrative,
            purpose: narrativeSlide.purpose,
            emotionalNote: narrativeSlide.emotionalNote,
            insights: relevantInsights,
            visualFocus: narrativeSlide.visualFocus
          },
          charts: relevantChart ? [{
            ...relevantChart,
            customization: {
              style: 'embedded',
              complexity: options?.chartComplexity || 'moderate'
            }
          }] : [],
          customization: {
            visualStyle: options?.visualStyle || 'modern',
            innovationLevel: 'standard',
            layout: 'standard_' + narrativeSlide.role,
            enableAnimations: options?.enableAnimations !== false
          },
          metadata: {
            narrativeRole: narrativeSlide.role,
            visualImpact: visualSlide.impact
          }
        })
      }
    })
  
  return slides
}

/**
 * Generate customization settings for the frontend
 */
function generateCustomizationSettings(
  options: any,
  charts: ChartRecommendationResult,
  narrative: NarrativeGenerationResult | null,
  designInnovation: DesignInnovationResult | null
): CustomizationSettings {
  const availableChartTypes = [...new Set(charts.recommendations.map(c => c.chartType))]
  const availableLayoutTypes = designInnovation 
    ? [...new Set(designInnovation.slideDesigns.map(s => s.layoutAdaptation.innovativeLayout))]
    : ['standard', 'grid', 'modern']
  
  return {
    visualStyle: options?.visualStyle || 'futuristic',
    innovationLevel: options?.innovationLevel || 'advanced',
    chartTypes: availableChartTypes,
    colorScheme: options?.customColorScheme || [],
    layoutTypes: availableLayoutTypes,
    animationStyles: [
      'fadeIn', 'slideIn', 'zoomIn', 'cinematicReveal', 'morphTransition'
    ],
    interactivityFeatures: [
      'hover', 'click', 'zoom', 'filter', 'drill-down', 'gesture-support'
    ],
    narrativeStructure: narrative ? {
      theme: narrative.story.theme,
      emotionalTone: narrative.story.emotionalTone,
      actStructure: {
        setup: narrative.story.structure.acts.setup.length,
        conflict: narrative.story.structure.acts.conflict.length,
        resolution: narrative.story.structure.acts.resolution.length
      },
      pacing: narrative.story.structure.pacing
    } : null,
    designFeatures: designInnovation ? [
      ...new Set(designInnovation.slideDesigns.flatMap(s => s.uniqueFeatures.map(f => f.name)))
    ] : [],
    renderingCapabilities: {
      charts: availableChartTypes,
      layouts: availableLayoutTypes,
      animations: true,
      interactivity: options?.enableInteractivity !== false,
      customColors: options?.customColorScheme?.length > 0,
      narrativeFlow: narrative !== null,
      designInnovation: designInnovation !== null
    }
  }
}

/**
 * Legacy narrative builder (for backwards compatibility)
 */
function buildNarrative(
  insights: InsightGenerationResult,
  charts: ChartRecommendationResult,
  context?: any
): any {
  const highImpactInsights = insights.insights.filter(i => i.impact === 'high')
  const trendInsights = insights.insights.filter(i => i.type === 'trend')
  const opportunityInsights = insights.insights.filter(i => i.type === 'opportunity')

  return {
    opening: {
      hook: insights.keyFindings[0] || 'Comprehensive data analysis reveals significant patterns',
      context: context?.businessContext || 'Strategic business analysis',
      scope: `Analysis of ${insights.insights.length} key insights across multiple dimensions`
    },
    body: {
      currentState: {
        summary: insights.summary,
        keyMetrics: highImpactInsights.slice(0, 3).map(i => i.title)
      },
      trends: {
        summary: `${trendInsights.length} significant trends identified`,
        patterns: trendInsights.map(t => t.title)
      },
      opportunities: {
        summary: `${opportunityInsights.length} strategic opportunities`,
        highlights: opportunityInsights.map(o => o.title)
      },
      risks: {
        summary: insights.insights.filter(i => i.type === 'anomaly').length > 0 
          ? 'Risk areas identified requiring attention'
          : 'No significant risk patterns detected',
        items: insights.insights.filter(i => i.type === 'anomaly').map(a => a.title)
      }
    },
    conclusion: {
      summary: insights.executiveSummary,
      nextSteps: [
        'Review detailed insights and recommendations',
        'Implement high-priority recommendations',
        'Monitor key metrics and track progress'
      ],
      callToAction: 'Strategic action required to capitalize on identified opportunities'
    },
    metadata: {
      confidence: insights.metadata.noveltyScore,
      dataQuality: charts.metadata.dataCompatibilityScore,
      analysisDepth: 'comprehensive'
    }
  }
}

/**
 * Create instructions for OpenAI/system on how to render these advanced features
 */
export function generateRenderingInstructions(
  slideStructure: any[],
  customizations: CustomizationSettings,
  designInnovation?: DesignInnovationResult
): any {
  return {
    renderingEngine: 'advanced-presentation-renderer',
    version: '2.0',
    capabilities: {
      charts: {
        types: customizations.chartTypes,
        innovation: true,
        interactivity: customizations.interactivityFeatures,
        animations: customizations.animationStyles,
        customStyling: true
      },
      layouts: {
        types: customizations.layoutTypes,
        responsive: true,
        innovative: customizations.innovationLevel !== 'standard',
        customizable: true
      },
      visual: {
        style: customizations.visualStyle,
        colorScheme: customizations.colorScheme,
        gradients: true,
        shadows: true,
        modernEffects: true
      },
      narrative: {
        enabled: customizations.narrativeStructure !== null,
        structure: customizations.narrativeStructure,
        storytelling: true,
        emotionalTone: customizations.narrativeStructure?.emotionalTone
      },
      design: {
        innovation: customizations.innovationLevel,
        features: customizations.designFeatures,
        complexity: designInnovation?.metadata.designComplexity || 50,
        customizable: true
      }
    },
    instructions: {
      chartRendering: `Render charts using ${customizations.chartTypes.join(', ')} types with ${customizations.innovationLevel} innovation level. Apply ${customizations.visualStyle} visual style with advanced interactivity.`,
      layoutRendering: `Use ${customizations.layoutTypes.join(' or ')} layouts with ${customizations.innovationLevel} innovation. Ensure responsive design and modern aesthetics.`,
      visualStyling: `Apply ${customizations.visualStyle} theme with gradients, shadows, and modern effects. Use ${customizations.colorScheme.length > 0 ? 'custom' : 'default'} color scheme.`,
      narrativeFlow: customizations.narrativeStructure 
        ? `Follow ${customizations.narrativeStructure.actStructure.setup}-${customizations.narrativeStructure.actStructure.conflict}-${customizations.narrativeStructure.actStructure.resolution} act structure with ${customizations.narrativeStructure.emotionalTone} tone.`
        : 'Use standard slide progression.',
      interactivity: `Enable ${customizations.interactivityFeatures.join(', ')} interactive features with smooth animations.`,
      customization: 'All elements are fully customizable. Allow user modifications to colors, layouts, charts, and content.'
    },
    slideInstructions: slideStructure.map((slide, index) => ({
      slideNumber: index + 1,
      type: slide.type,
      renderingMode: slide.customization?.innovationLevel || 'standard',
      layout: slide.customization?.layout || 'standard',
      visualStyle: slide.customization?.visualStyle || 'modern',
      charts: slide.charts?.map(chart => ({
        type: chart.chartType || chart.type,
        style: chart.customization?.style || 'embedded',
        interactivity: chart.customization?.interactivity || ['hover', 'tooltip'],
        innovation: chart.customization?.innovation || [],
        data: chart.data
      })) || [],
      design: slide.design ? {
        concept: slide.design.concept.name,
        layout: slide.design.layout.innovativeLayout,
        features: slide.design.uniqueFeatures.map(f => f.name),
        complexity: slide.design.concept.complexity
      } : null,
      customization: slide.customization || { visualStyle: 'modern', innovationLevel: 'standard' }
    }))
  }
}

// Export the rendering instructions generator for use by frontend
export { generateRenderingInstructions }