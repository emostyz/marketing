/**
 * AI Slide Planner Service
 * Uses OpenAI to plan presentation structure and slide outlines
 */

import OpenAI from 'openai'
import { AnalysisResult, publishProgress, trackAIInteraction } from './bridge'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

export interface SlideOutline {
  id: string
  slideNumber: number
  title: string
  subtitle?: string
  bullets: string[]
  placeholderChartType: 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'donut' | 'metrics'
  layout: 'title-only' | 'text-left-chart-right' | 'text-right-chart-left' | 'bullets-only' | 'chart-focus' | 'executive-summary'
  priority: 'high' | 'medium' | 'low'
  estimatedDuration: number // seconds
  speakerNotes?: string
}

export interface PresentationStructure {
  title: string
  subtitle: string
  totalSlides: number
  estimatedDuration: number
  narrativeArc: string
  targetAudience: string
  keyMessage: string
  slides: SlideOutline[]
  metadata: {
    generatedAt: string
    contextUsed: any
    analysisQualityScore: number
  }
}

interface SlidePlannerContext {
  businessContext?: string
  targetAudience?: string
  presentationGoal?: string
  timeConstraint?: number // minutes
  industry?: string
  companyStage?: string
  keyQuestions?: string[]
}

const SLIDE_PLANNER_SYSTEM_PROMPT = `You are an expert presentation strategist and data storytelling specialist. Your role is to analyze data insights and create compelling slide structures for business presentations.

CORE PRINCIPLES:
- Every slide must tell part of a coherent story
- Start with context, build to insights, end with actions
- Maximum 8 slides for executive attention spans
- Each bullet point should be actionable and specific
- Charts should directly support the narrative, not just show data

SLIDE TYPES & LAYOUTS:
1. "title-only" - Opening/closing slides, section breaks
2. "executive-summary" - High-level overview with 3-4 key points
3. "text-left-chart-right" - Key insight + supporting visualization
4. "text-right-chart-left" - Data story + interpretation
5. "bullets-only" - Action items, recommendations, process steps
6. "chart-focus" - Data-driven slide where chart is primary element

CHART TYPE GUIDELINES:
- "line" - Trends over time, growth patterns, forecasts
- "bar" - Comparisons, rankings, categorical data
- "area" - Volume/magnitude over time, cumulative effects  
- "donut/pie" - Market share, composition, percentages
- "scatter" - Correlations, relationships between variables
- "metrics" - KPI cards, executive dashboards, key numbers

NARRATIVE ARCS:
1. "growth_story" - Current state → Growth evidence → Growth drivers → Next steps
2. "problem_solution" - Challenge → Data evidence → Root causes → Solutions
3. "opportunity_focus" - Market overview → Opportunity identification → Business case → Action plan
4. "performance_review" - Results summary → Key wins → Challenges → Forward plan
5. "strategic_analysis" - Landscape → Competitive position → Strategic options → Recommendations

BULLET POINT RULES:
- Maximum 5 bullets per slide
- Maximum 10 words per bullet
- Start with action verbs when possible
- Be specific with numbers and percentages
- Focus on business implications, not just data description

You must respond with valid JSON only.`

const SLIDE_PLANNER_FUNCTION_SCHEMA = {
  name: "create_presentation_structure",
  description: "Create a structured presentation plan with slide outlines",
  parameters: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "Compelling presentation title (max 60 characters)"
      },
      subtitle: {
        type: "string", 
        description: "Supporting subtitle or context (max 100 characters)"
      },
      totalSlides: {
        type: "number",
        description: "Total number of slides (4-8 range)"
      },
      estimatedDuration: {
        type: "number",
        description: "Estimated presentation duration in minutes"
      },
      narrativeArc: {
        type: "string",
        enum: ["growth_story", "problem_solution", "opportunity_focus", "performance_review", "strategic_analysis"],
        description: "Overall story structure"
      },
      targetAudience: {
        type: "string",
        description: "Primary audience for this presentation"
      },
      keyMessage: {
        type: "string",
        description: "Single most important takeaway (max 150 characters)"
      },
      slides: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Unique slide identifier"
            },
            slideNumber: {
              type: "number",
              description: "Position in presentation (1-based)"
            },
            title: {
              type: "string",
              description: "Slide title (max 60 characters)"
            },
            subtitle: {
              type: "string",
              description: "Optional subtitle (max 80 characters)"
            },
            bullets: {
              type: "array",
              items: {
                type: "string"
              },
              description: "3-5 bullet points, max 10 words each"
            },
            placeholderChartType: {
              type: "string",
              enum: ["bar", "line", "pie", "scatter", "area", "donut", "metrics"],
              description: "Recommended chart type for this slide"
            },
            layout: {
              type: "string",
              enum: ["title-only", "text-left-chart-right", "text-right-chart-left", "bullets-only", "chart-focus", "executive-summary"],
              description: "Slide layout template"
            },
            priority: {
              type: "string",
              enum: ["high", "medium", "low"],
              description: "Importance level for this slide"
            },
            estimatedDuration: {
              type: "number",
              description: "Estimated time for this slide in seconds"
            },
            speakerNotes: {
              type: "string",
              description: "Brief talking points for presenter (max 200 characters)"
            }
          },
          required: ["id", "slideNumber", "title", "bullets", "placeholderChartType", "layout", "priority", "estimatedDuration"]
        }
      }
    },
    required: ["title", "subtitle", "totalSlides", "estimatedDuration", "narrativeArc", "targetAudience", "keyMessage", "slides"]
  }
}

export async function slidePlanner(
  analysisResult: AnalysisResult,
  context: SlidePlannerContext = {},
  deckId?: string
): Promise<PresentationStructure> {
  const startTime = Date.now()
  
  try {
    if (deckId) {
      await publishProgress(deckId, 'planning', 'Analyzing insights for slide structure')
    }

    // Prepare context for OpenAI
    const plannerInput = {
      dataAnalysis: {
        qualityScore: analysisResult.data_quality_score,
        basicStats: analysisResult.basic_statistics,
        keyInsights: analysisResult.key_insights,
        trends: analysisResult.trends,
        correlations: analysisResult.correlations.slice(0, 3), // Top 3 correlations
        segments: analysisResult.segments.slice(0, 2), // Top 2 segments
        narrativeArc: analysisResult.slide_recommendations.narrative_arc,
        recommendedCharts: analysisResult.slide_recommendations.chart_types_recommended
      },
      context: {
        businessContext: context.businessContext || 'General business presentation',
        targetAudience: context.targetAudience || 'Executive team',
        presentationGoal: context.presentationGoal || 'Share data insights and recommendations',
        timeConstraint: context.timeConstraint || 15,
        industry: context.industry || 'Technology',
        companyStage: context.companyStage || 'Growth stage',
        keyQuestions: context.keyQuestions || ['What are the key trends?', 'What should we do next?']
      }
    }

    const userPrompt = `Based on the following data analysis and business context, create a compelling presentation structure:

DATA ANALYSIS SUMMARY:
- Data Quality Score: ${analysisResult.data_quality_score}/100
- Key Insights Found: ${analysisResult.key_insights.length}
- Suggested Narrative: ${analysisResult.slide_recommendations.narrative_arc}
- Recommended Charts: ${analysisResult.slide_recommendations.chart_types_recommended.join(', ')}

INSIGHTS TO HIGHLIGHT:
${analysisResult.key_insights.map((insight, i) => `${i + 1}. ${insight.title}: ${insight.description}`).join('\n')}

BUSINESS CONTEXT:
- Audience: ${context.targetAudience || 'Executive team'}
- Goal: ${context.presentationGoal || 'Share insights and get buy-in'}
- Time Available: ${context.timeConstraint || 15} minutes
- Industry: ${context.industry || 'Technology'}

REQUIREMENTS:
- Create ${Math.min(8, Math.max(4, analysisResult.slide_recommendations.total_slides_suggested))} slides
- Follow the ${analysisResult.slide_recommendations.narrative_arc} narrative structure
- Include at least ${Math.min(3, analysisResult.key_insights.length)} slides with charts
- Each slide should advance the story toward actionable recommendations
- Keep executive attention with clear, concise content

Create a presentation structure that transforms this data into a compelling business story.`

    if (deckId) {
      await publishProgress(deckId, 'planning', 'Generating slide structure with AI')
    }

    // Call OpenAI with function calling
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SLIDE_PLANNER_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      functions: [SLIDE_PLANNER_FUNCTION_SCHEMA],
      function_call: { name: 'create_presentation_structure' },
      temperature: 0.3,
      max_tokens: 3000
    })

    const functionCall = completion.choices[0]?.message?.function_call
    if (!functionCall || !functionCall.arguments) {
      throw new Error('OpenAI did not return a valid function call')
    }

    const result = JSON.parse(functionCall.arguments) as PresentationStructure

    // Add metadata
    result.metadata = {
      generatedAt: new Date().toISOString(),
      contextUsed: context,
      analysisQualityScore: analysisResult.data_quality_score
    }

    // Validate result structure
    validatePresentationStructure(result)

    const executionTime = Date.now() - startTime

    // Track AI interaction
    if (deckId) {
      await trackAIInteraction(
        deckId,
        'slide_planner',
        completion.usage?.prompt_tokens || 0,
        completion.usage?.completion_tokens || 0,
        'gpt-4o-mini',
        true,
        undefined,
        executionTime
      )

      await publishProgress(deckId, 'planning', `Created ${result.totalSlides} slide structure`, {
        slideCount: result.totalSlides,
        narrativeArc: result.narrativeArc,
        estimatedDuration: result.estimatedDuration
      })
    }

    console.log(`✅ Slide planning completed: ${result.totalSlides} slides, ${result.narrativeArc} narrative`)
    
    return result

  } catch (error) {
    const executionTime = Date.now() - startTime
    
    if (deckId) {
      await trackAIInteraction(
        deckId,
        'slide_planner',
        0,
        0,
        'gpt-4o-mini',
        false,
        error.message,
        executionTime
      )
      
      await publishProgress(deckId, 'error', `Slide planning failed: ${error.message}`)
    }

    throw new Error(`Slide planning failed: ${error.message}`)
  }
}

function validatePresentationStructure(structure: PresentationStructure): void {
  if (!structure.title || structure.title.length > 60) {
    throw new Error('Invalid presentation title')
  }

  if (!structure.slides || structure.slides.length < 3 || structure.slides.length > 8) {
    throw new Error('Invalid slide count (must be 3-8)')
  }

  if (structure.totalSlides !== structure.slides.length) {
    throw new Error('Slide count mismatch')
  }

  // Validate each slide
  structure.slides.forEach((slide, index) => {
    if (slide.slideNumber !== index + 1) {
      throw new Error(`Slide ${index + 1} has incorrect slide number`)
    }

    if (!slide.title || slide.title.length > 60) {
      throw new Error(`Slide ${index + 1} has invalid title`)
    }

    if (!slide.bullets || slide.bullets.length < 1 || slide.bullets.length > 5) {
      throw new Error(`Slide ${index + 1} has invalid bullet count`)
    }

    slide.bullets.forEach((bullet, bulletIndex) => {
      if (bullet.split(' ').length > 12) {
        console.warn(`Slide ${index + 1}, bullet ${bulletIndex + 1} exceeds 12 words: "${bullet}"`)
      }
    })

    if (!['bar', 'line', 'pie', 'scatter', 'area', 'donut', 'metrics'].includes(slide.placeholderChartType)) {
      throw new Error(`Slide ${index + 1} has invalid chart type: ${slide.placeholderChartType}`)
    }

    if (!['title-only', 'text-left-chart-right', 'text-right-chart-left', 'bullets-only', 'chart-focus', 'executive-summary'].includes(slide.layout)) {
      throw new Error(`Slide ${index + 1} has invalid layout: ${slide.layout}`)
    }
  })

  console.log(`✅ Presentation structure validated: ${structure.slides.length} slides`)
}