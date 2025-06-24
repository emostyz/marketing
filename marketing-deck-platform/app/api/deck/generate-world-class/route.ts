import { NextRequest, NextResponse } from 'next/server'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { InsightEnhancer } from '@/lib/ai/insight-enhancer'
import { getEnhancedPrompt } from '@/lib/ai/world-class-prompts'
import { selectBestTemplate, adaptTemplateToContext } from '@/lib/ai/deck-templates'
import { applyVisualExcellence } from '@/lib/ai/visual-excellence'
import { OpenAI } from 'openai'

interface GenerationContext {
  audience: string
  goal: string
  timeLimit: number
  industry: string
  decision: string
}

interface DataProfile {
  hasTimeSeries: boolean
  hasComparisons: boolean
  hasCorrelations: boolean
  complexity: 'low' | 'medium' | 'high'
  storyType: 'growth' | 'decline' | 'comparison' | 'discovery'
}

export async function POST(request: NextRequest) {
  try {
    const { datasetId, context } = await request.json() as {
      datasetId: string
      context: GenerationContext
    }
    
    console.log('🚀 Starting world-class deck generation...', { datasetId, context })
    
    // Initialize Supabase client
    const supabase = createClientComponentClient()
    
    // Get user from session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    const userId = session.user.id
    
    // 1. Fetch real data
    const { data: dataset, error: datasetError } = await supabase
      .from('datasets')
      .select('*')
      .eq('id', datasetId)
      .eq('user_id', userId)
      .single()
    
    if (datasetError || !dataset) {
      console.error('Dataset fetch error:', datasetError)
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 })
    }
    
    console.log('📊 Dataset loaded:', { 
      id: dataset.id, 
      filename: dataset.filename,
      rowCount: dataset.processed_data?.length || 0
    })
    
    // 2. Analyze data characteristics
    const dataProfile = analyzeDataProfile(dataset.processed_data)
    console.log('🔍 Data profile:', dataProfile)
    
    // 3. Select and adapt best template
    const baseTemplate = selectBestTemplate(dataProfile, context)
    const template = adaptTemplateToContext(baseTemplate, context, dataProfile)
    console.log('📋 Template selected:', template.name)
    
    // 4. Generate enhanced insights
    const enhancer = new InsightEnhancer()
    const rawInsights = await generateInitialInsights(dataset, context)
    console.log('💡 Raw insights generated:', rawInsights.length)
    
    const worldClassInsights = await enhancer.enhanceInsights(rawInsights, dataset, context)
    console.log('✨ Enhanced insights:', worldClassInsights.length)
    
    // 5. Create deck structure
    const deck = await createDeckStructure(template, worldClassInsights, dataset, context)
    console.log('🏗️ Deck structure created:', { slides: deck.slides.length })
    
    // 6. Apply visual excellence
    const polishedDeck = applyVisualExcellence(deck.slides, context.audience)
    console.log('🎨 Visual excellence applied')
    
    // 7. Generate executive coaching
    const coachingNotes = await generatePresentationCoaching(polishedDeck, context)
    console.log('🎤 Coaching notes generated')
    
    // 8. Save to database
    const { data: savedDeck, error: saveError } = await supabase
      .from('presentations')
      .insert({
        user_id: userId,
        dataset_id: datasetId,
        title: deck.title,
        template_name: template.name,
        context: context,
        quality_score: deck.qualityScore,
        coaching_notes: coachingNotes,
        slide_count: polishedDeck.length,
        estimated_duration: template.duration
      })
      .select()
      .single()
    
    if (saveError) {
      console.error('Deck save error:', saveError)
      return NextResponse.json({ error: 'Failed to save deck' }, { status: 500 })
    }
    
    console.log('💾 Deck saved:', savedDeck.id)
    
    // 9. Create slides with world-class content
    for (const [index, slide] of polishedDeck.entries()) {
      await createWorldClassSlide(supabase, savedDeck.id, slide, index)
    }
    
    console.log('✅ World-class deck generation complete!')
    
    return NextResponse.json({
      deckId: savedDeck.id,
      quality: 'world-class',
      qualityScore: deck.qualityScore,
      estimatedImpact: deck.estimatedImpact,
      coachingPreview: coachingNotes.keyTips,
      slidesGenerated: polishedDeck.length,
      templateUsed: template.name,
      insightsEnhanced: worldClassInsights.length
    })
    
  } catch (error) {
    console.error('❌ World-class deck generation failed:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Deck generation failed',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

async function generateInitialInsights(dataset: any, context: GenerationContext) {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    
    const prompt = getEnhancedPrompt(context.audience, dataset.processed_data, context)
    
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: prompt },
        { 
          role: "user", 
          content: `Analyze this data and generate strategic insights for ${context.audience}:
          
Dataset: ${dataset.filename}
Data sample: ${JSON.stringify(dataset.processed_data.slice(0, 20))}
Total rows: ${dataset.processed_data.length}

Generate 8-10 high-impact insights that would be valuable for ${context.goal}.` 
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    })
    
    const result = JSON.parse(response.choices[0].message.content || '{"insights": []}')
    return result.insights || []
    
  } catch (error) {
    console.error('Error generating initial insights:', error)
    // Fallback insights based on data analysis
    return generateFallbackInsights(dataset, context)
  }
}

function generateFallbackInsights(dataset: any, context: GenerationContext) {
  const data = dataset.processed_data || []
  const insights = []
  
  if (data.length === 0) {
    return [{ text: "No data available for analysis", type: "data-quality" }]
  }
  
  // Basic data insights
  insights.push({
    text: `Dataset contains ${data.length} records for analysis`,
    type: "overview"
  })
  
  // Column analysis
  const columns = Object.keys(data[0] || {})
  const numericColumns = columns.filter(col => 
    data.slice(0, 10).every(row => !isNaN(parseFloat(row[col])))
  )
  
  if (numericColumns.length > 0) {
    insights.push({
      text: `Key metrics identified: ${numericColumns.join(', ')}`,
      type: "metrics"
    })
  }
  
  // Time series detection
  const dateColumns = columns.filter(col =>
    data.slice(0, 5).some(row => {
      const val = row[col]
      return val && new Date(val).toString() !== 'Invalid Date'
    })
  )
  
  if (dateColumns.length > 0) {
    insights.push({
      text: `Time-based analysis possible with ${dateColumns[0]}`,
      type: "temporal"
    })
  }
  
  return insights
}

async function createDeckStructure(template: any, insights: any[], dataset: any, context: GenerationContext) {
  const slides = []
  
  // Generate title
  const title = generateDeckTitle(dataset, context)
  
  // Create slides based on template
  for (const slideTemplate of template.slides) {
    const slide = await createSlideFromTemplate(slideTemplate, insights, dataset, context)
    slides.push(slide)
  }
  
  // Calculate quality score
  const qualityScore = calculateDeckQuality(slides, insights, template)
  
  // Estimate business impact
  const estimatedImpact = estimateBusinessImpact(insights, context)
  
  return {
    title,
    slides,
    qualityScore,
    estimatedImpact,
    template: template.name
  }
}

function generateDeckTitle(dataset: any, context: GenerationContext): string {
  const industry = context.industry || 'Business'
  const goal = context.goal || 'Analysis'
  
  const titles = [
    `${industry} ${goal.charAt(0).toUpperCase() + goal.slice(1)} - Strategic Analysis`,
    `Data-Driven Insights for ${industry} Growth`,
    `${dataset.filename.replace('.csv', '')} - Executive Summary`,
    `Strategic Analysis: ${industry} Performance Review`
  ]
  
  return titles[Math.floor(Math.random() * titles.length)]
}

async function createSlideFromTemplate(slideTemplate: any, insights: any[], dataset: any, context: GenerationContext) {
  const slide: any = {
    type: slideTemplate.type,
    title: slideTemplate.title || `${slideTemplate.type.charAt(0).toUpperCase() + slideTemplate.type.slice(1)}`,
    layout: slideTemplate.layout,
    duration: slideTemplate.duration,
    content: [] as string[],
    elements: [] as any[],
    charts: [] as any[]
  }
  
  // Generate content based on slide type
  switch (slideTemplate.type) {
    case 'executiveSummary':
      slide.content = generateExecutiveSummary(insights, context)
      break
    case 'kpiDashboard':
      slide.content = generateKPIDashboard(dataset, context)
      slide.charts = generateDashboardCharts(dataset)
      break
    case 'deepDive':
      const topInsight = insights[0]
      if (topInsight) {
        slide.title = topInsight.headline || 'Key Finding'
        slide.content = [
          topInsight.impact,
          ...topInsight.evidence.slice(0, 3)
        ]
      }
      break
    case 'recommendations':
      slide.content = generateRecommendations(insights, context)
      break
    default:
      slide.content = [`Content for ${slideTemplate.type} slide`]
  }
  
  // Add visual elements
  slide.elements = generateSlideElements(slide, slideTemplate)
  
  return slide
}

function generateExecutiveSummary(insights: any[], context: GenerationContext): string[] {
  const summary = [
    `Executive Summary - ${context.goal.charAt(0).toUpperCase() + context.goal.slice(1)}`
  ]
  
  // Add top 3-4 insights
  insights.slice(0, 4).forEach((insight, index) => {
    summary.push(`${index + 1}. ${insight.headline || insight.text}`)
  })
  
  return summary
}

function generateKPIDashboard(dataset: any, context: GenerationContext): string[] {
  const data = dataset.processed_data || []
  if (data.length === 0) return ['No KPI data available']
  
  const columns = Object.keys(data[0] || {})
  const numericColumns = columns.filter(col => 
    data.slice(0, 10).every((row: any) => !isNaN(parseFloat(row[col])))
  )
  
  const kpis = numericColumns.slice(0, 4).map(col => {
    const values = data.map((row: any) => parseFloat(row[col])).filter((val: number) => !isNaN(val))
    const avg = values.reduce((sum: number, val: number) => sum + val, 0) / values.length
    return `${col}: ${avg.toFixed(2)} (average)`
  })
  
  return kpis.length > 0 ? kpis : ['KPI analysis pending']
}

function generateDashboardCharts(dataset: any): any[] {
  const data = dataset.processed_data || []
  if (data.length === 0) return []
  
  const columns = Object.keys(data[0] || {})
  const numericColumns = columns.filter(col => 
    data.slice(0, 10).every((row: any) => !isNaN(parseFloat(row[col])))
  )
  
  return numericColumns.slice(0, 3).map(col => ({
    type: 'gauge',
    title: col,
    data: data.map((row: any) => parseFloat(row[col])).filter((val: number) => !isNaN(val))
  }))
}

function generateRecommendations(insights: any[], context: GenerationContext): string[] {
  const recommendations = ['Recommended Actions:']
  
  insights.slice(0, 3).forEach((insight, index) => {
    if (insight.action) {
      recommendations.push(`${index + 1}. ${insight.action}`)
    } else {
      recommendations.push(`${index + 1}. Investigate ${insight.headline || insight.text}`)
    }
  })
  
  return recommendations
}

function generateSlideElements(slide: any, slideTemplate: any): any[] {
  const elements = []
  
  // Title element
  elements.push({
    type: 'title',
    content: slide.title,
    position: { x: 100, y: 100 },
    size: { width: 800, height: 60 },
    style: {
      fontSize: 36,
      fontWeight: 700,
      color: '#1a365d'
    }
  })
  
  // Content elements
  slide.content.forEach((item: string, index: number) => {
    elements.push({
      type: 'text',
      content: item,
      position: { x: 100, y: 200 + (index * 50) },
      size: { width: 800, height: 40 },
      style: {
        fontSize: 18,
        fontWeight: 400,
        color: '#2d3748'
      }
    })
  })
  
  // Chart elements
  slide.charts?.forEach((chart: any, index: number) => {
    elements.push({
      type: 'chart',
      chartConfig: chart,
      position: { x: 500, y: 300 + (index * 250) },
      size: { width: 400, height: 200 }
    })
  })
  
  return elements
}

async function createWorldClassSlide(supabase: any, deckId: string, slideData: any, index: number) {
  try {
    const { data: slide, error: slideError } = await supabase
      .from('slides')
      .insert({
        presentation_id: deckId,
        order_index: index,
        layout: slideData.layout,
        title: slideData.title,
        background_color: '#ffffff',
        transition: 'fade'
      })
      .select()
      .single()
    
    if (slideError) {
      console.error('Error creating slide:', slideError)
      return
    }
    
    // Add elements with world-class design
    for (const element of slideData.elements || []) {
      const { error: elementError } = await supabase
        .from('elements')
        .insert({
          slide_id: slide.id,
          type: element.type,
          content: element.content,
          position_x: element.position.x,
          position_y: element.position.y,
          width: element.size.width,
          height: element.size.height,
          style: element.style,
          chart_config: element.chartConfig,
          z_index: element.zIndex || index
        })
      
      if (elementError) {
        console.error('Error creating element:', elementError)
      }
    }
    
  } catch (error) {
    console.error('Error in createWorldClassSlide:', error)
  }
}

async function generatePresentationCoaching(deck: any, context: GenerationContext) {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    
    const coachingPrompt = `
    Generate executive presentation coaching for this deck:
    - Audience: ${context.audience}
    - Goal: ${context.goal}
    - Time: ${context.timeLimit} minutes
    - Industry: ${context.industry}
    
    Deck has ${deck.length} slides covering: ${deck.map(s => s.type).join(', ')}
    
    Provide specific coaching advice as JSON:
    {
      "keyTips": ["tip1", "tip2", "tip3"],
      "openingHook": "powerful opening statement",
      "transitions": ["slide 1 to 2", "slide 2 to 3"],
      "toughQuestions": ["q1", "q2", "q3"],
      "powerPhrases": ["phrase1", "phrase2"],
      "avoidPhrases": ["phrase1", "phrase2"],
      "bodyLanguage": ["tip1", "tip2"],
      "closingStatement": "call to action"
    }
    `
    
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: coachingPrompt }],
      response_format: { type: "json_object" },
      temperature: 0.7
    })
    
    return JSON.parse(response.choices[0].message.content || '{}')
    
  } catch (error) {
    console.error('Error generating coaching:', error)
    return {
      keyTips: [
        "Start with your biggest finding",
        "Use the 'So what?' test for each slide",
        "End with specific next steps"
      ],
      openingHook: "Begin with the most important insight",
      closingStatement: "Clearly state what you need from the audience"
    }
  }
}

function analyzeDataProfile(data: any[]): DataProfile {
  if (!data || data.length === 0) {
    return {
      hasTimeSeries: false,
      hasComparisons: false,
      hasCorrelations: false,
      complexity: 'low',
      storyType: 'discovery'
    }
  }
  
  const columns = Object.keys(data[0] || {})
  
  // Detect time series
  const hasTimeSeries = detectTimeSeries(data, columns)
  
  // Detect comparisons (categorical data)
  const hasComparisons = detectCategorical(data, columns)
  
  // Detect correlations (multiple numeric columns)
  const hasCorrelations = detectCorrelations(data, columns)
  
  // Assess complexity
  const complexity = assessComplexity(data, columns)
  
  // Determine story type
  const storyType = determineStoryType(data, columns, hasTimeSeries)
  
  return {
    hasTimeSeries,
    hasComparisons,
    hasCorrelations,
    complexity,
    storyType
  }
}

function detectTimeSeries(data: any[], columns: string[]): boolean {
  return columns.some(col =>
    data.slice(0, 5).some(row => {
      const val = row[col]
      return val && new Date(val).toString() !== 'Invalid Date'
    })
  )
}

function detectCategorical(data: any[], columns: string[]): boolean {
  return columns.some(col => {
    const values = data.slice(0, 20).map(row => row[col])
    const uniqueValues = new Set(values)
    return uniqueValues.size < values.length * 0.8 && uniqueValues.size > 1
  })
}

function detectCorrelations(data: any[], columns: string[]): boolean {
  const numericColumns = columns.filter(col =>
    data.slice(0, 10).every(row => !isNaN(parseFloat(row[col])))
  )
  
  return numericColumns.length >= 2
}

function assessComplexity(data: any[], columns: string[]): 'low' | 'medium' | 'high' {
  const columnCount = columns.length
  const rowCount = data.length
  
  if (columnCount <= 3 && rowCount <= 100) return 'low'
  if (columnCount <= 10 && rowCount <= 1000) return 'medium'
  return 'high'
}

function determineStoryType(data: any[], columns: string[], hasTimeSeries: boolean): 'growth' | 'decline' | 'comparison' | 'discovery' {
  if (hasTimeSeries) {
    // Check for growth/decline pattern
    const dateCol = columns.find(col =>
      data.slice(0, 5).some(row => {
        const val = row[col]
        return val && new Date(val).toString() !== 'Invalid Date'
      })
    )
    
    if (dateCol) {
      const numericCols = columns.filter(col => col !== dateCol &&
        data.slice(0, 10).every(row => !isNaN(parseFloat(row[col])))
      )
      
      if (numericCols.length > 0) {
        const values = data
          .sort((a, b) => new Date(a[dateCol]).getTime() - new Date(b[dateCol]).getTime())
          .map(row => parseFloat(row[numericCols[0]]))
          .filter(val => !isNaN(val))
        
        if (values.length >= 2) {
          const trend = values[values.length - 1] - values[0]
          return trend > 0 ? 'growth' : 'decline'
        }
      }
    }
  }
  
  // Check for comparison data
  const hasCategorical = detectCategorical(data, columns)
  if (hasCategorical) return 'comparison'
  
  return 'discovery'
}

function calculateDeckQuality(slides: any[], insights: any[], template: any): number {
  let score = 0.7 // Base score for using world-class system
  
  // Bonus for enhanced insights
  if (insights.some(i => i.headline && i.impact)) score += 0.1
  
  // Bonus for appropriate template selection
  if (template.name.includes('Board') || template.name.includes('Investor')) score += 0.1
  
  // Bonus for slide count optimization
  if (slides.length >= 5 && slides.length <= 15) score += 0.05
  
  // Bonus for visual design
  if (slides.every(s => s.elements && s.elements.length > 0)) score += 0.05
  
  return Math.min(score, 1.0) // Cap at 1.0
}

function estimateBusinessImpact(insights: any[], context: GenerationContext): string {
  const hasQuantifiedInsights = insights.some(i => 
    i.impact && (i.impact.includes('$') || i.impact.includes('%'))
  )
  
  if (hasQuantifiedInsights) {
    return "High - Quantified business impact identified"
  }
  
  if (context.goal.includes('funding') || context.goal.includes('investment')) {
    return "High - Strategic decision support"
  }
  
  return "Medium - Actionable insights provided"
}