import { NextRequest, NextResponse } from 'next/server'
import { generateEnhancedSlideContent, analyzeDataForTremorCharts } from '@/lib/ai/enhancedSlideGenerator'

export async function POST(request: NextRequest) {
  try {
    const { 
      step = 'generate', 
      title = 'AI-Generated Presentation',
      data = [],
      qaResponses = null,
      generateWithAI = false
    } = await request.json()

    // Use sample data if none provided
    const sampleData = [
      { Month: 'Jan', Revenue: 45000, Leads: 1200, Conversion: 12 },
      { Month: 'Feb', Revenue: 52000, Leads: 1350, Conversion: 15 },
      { Month: 'Mar', Revenue: 48000, Leads: 1180, Conversion: 14 },
      { Month: 'Apr', Revenue: 61000, Leads: 1500, Conversion: 18 },
      { Month: 'May', Revenue: 58000, Leads: 1420, Conversion: 16 },
      { Month: 'Jun', Revenue: 67000, Leads: 1650, Conversion: 20 }
    ]

    const actualData = data.length > 0 ? data : sampleData

    // Generate AI-powered slides using the uploaded data and Q&A context
    const aiSlides = await generateEnhancedSlideContent(actualData, title, qaResponses)
    
    // Analyze data for optimal chart recommendations with Tremor integration
    const analysis = analyzeDataForTremorCharts(actualData, qaResponses)

    // Enhanced slides with proper IDs and configurations
    const slides = aiSlides.map((slide: any) => {
      if (slide.type === 'chart') {
        return {
          ...slide,
          id: slide.id || Date.now().toString() + Math.random(),
          chartType: slide.chartType || analysis.chartType,
          data: actualData,
          chartData: actualData,
          categories: (slide as any).categories || Object.keys(actualData[0] || {}).slice(1),
          index: (slide as any).index || Object.keys(actualData[0] || {})[0],
          tremorConfig: (slide as any).tremorConfig || (analysis as any).tremorConfig
        }
      }
      return {
        ...slide,
        id: slide.id || Date.now().toString() + Math.random()
      }
    })

    return NextResponse.json({ 
      slides, 
      analysis,
      success: true,
      message: generateWithAI ? 'AI-powered presentation with Q&A analysis generated successfully' : 'AI-powered presentation generated successfully',
      dataPoints: actualData.length,
      chartRecommendation: analysis.chartType,
      insights: analysis.insights,
      qaAnalysis: qaResponses ? true : false,
      tremorEnabled: true
    })
  } catch (error) {
    console.error('Generate API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate presentation', details: String(error) }, 
      { status: 500 }
    )
  }
}