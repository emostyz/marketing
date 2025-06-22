import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { AuthSystem } from '@/lib/auth/auth-system'
import { DeckPersistence } from '@/lib/deck-persistence'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const user = await AuthSystem.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      slideId,
      dataType,
      chartType,
      data,
      userPreferences,
      businessContext
    } = await request.json()

    // Validate input
    if (!slideId || !dataType || !chartType || !data) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create a comprehensive prompt for chart generation
    const systemPrompt = `You are an expert data visualization specialist and presentation designer. Your task is to create professional charts and narratives for business presentations.

Key Requirements:
1. Generate charts that are visually appealing and business-appropriate
2. Create compelling narratives that explain the data insights
3. Follow the user's brand preferences and chart style guidelines
4. Ensure charts are optimized for presentation slides
5. Provide actionable insights and recommendations

User Preferences:
- Chart Styles: ${userPreferences.chartStyles.join(', ')}
- Color Schemes: ${userPreferences.colorSchemes.join(', ')}
- Narrative Style: ${userPreferences.narrativeStyle}
- Business Context: ${businessContext}

Available Chart Types: bar, line, pie, scatter, area, donut, radar, heatmap, funnel, treemap

Data Type: ${dataType}
Requested Chart Type: ${chartType}

Respond with a JSON object containing:
{
  "chartData": {
    "type": "chart_type",
    "data": [...],
    "options": {...}
  },
  "chartConfig": {
    "colors": [...],
    "layout": {...},
    "annotations": [...]
  },
  "narrative": "compelling narrative explaining the insights",
  "insights": ["key insight 1", "key insight 2", "key insight 3"],
  "recommendations": ["actionable recommendation 1", "actionable recommendation 2"],
  "suggestions": ["improvement suggestion 1", "improvement suggestion 2"]
}`

    const userPrompt = `Please analyze this data and create a ${chartType} chart:

Data: ${JSON.stringify(data, null, 2)}

Requirements:
1. Create a professional ${chartType} chart optimized for presentation slides
2. Use the specified chart styles and color schemes
3. Generate a compelling narrative that explains the key insights
4. Provide actionable business recommendations
5. Suggest improvements for the presentation

Please respond with the complete JSON structure as specified in the system prompt.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    let chartResult
    try {
      chartResult = JSON.parse(response)
    } catch (error) {
      console.error('Error parsing OpenAI response:', error)
      return NextResponse.json(
        { error: 'Invalid response format from AI' },
        { status: 500 }
      )
    }

    // Validate the response structure
    if (!chartResult.chartData || !chartResult.narrative) {
      return NextResponse.json(
        { error: 'Invalid chart generation response' },
        { status: 500 }
      )
    }

    // Track the chart generation activity
    await DeckPersistence.trackUserActivity('chart_generated', {
      slideId,
      chartType,
      dataType,
      success: true
    })

    // Return the generated chart data
    return NextResponse.json({
      success: true,
      chartData: chartResult.chartData,
      chartConfig: chartResult.chartConfig,
      narrative: chartResult.narrative,
      insights: chartResult.insights || [],
      recommendations: chartResult.recommendations || [],
      suggestions: chartResult.suggestions || []
    })

  } catch (error) {
    console.error('Chart generation error:', error)
    
    // Track the error
    try {
      await DeckPersistence.trackUserActivity('chart_generation_error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } catch (trackError) {
      console.error('Error tracking activity:', trackError)
    }

    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Chart generation failed' 
      },
      { status: 500 }
    )
  }
} 