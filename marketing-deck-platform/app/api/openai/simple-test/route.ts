import { NextRequest, NextResponse } from 'next/server'
import { OpenAIFallback } from '@/lib/ai/openai-fallback'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Simple OpenAI Test - Starting...')
    
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'No OpenAI API key' }, { status: 500 })
    }
    
    // Check if OpenAI is available
    const isAvailable = await OpenAIFallback.checkOpenAIAvailability()
    if (!isAvailable) {
      console.log('🎭 Using fallback mode due to OpenAI unavailability')
      const body = await request.json()
      const fallbackResponse = OpenAIFallback.createFallbackResponse(body.data || [])
      return NextResponse.json({
        ...fallbackResponse,
        message: 'OpenAI unavailable - using mock analysis'
      })
    }
    
    const body = await request.json()
    const { data } = body
    
    console.log('🧪 Test data received:', data?.length || 0, 'items')
    
    // Simple OpenAI call
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1',
        messages: [
          {
            role: 'user',
            content: `Analyze this data and create 3 professional business insights in JSON format: ${JSON.stringify(data?.slice(0, 5) || [])}`
          }
        ],
        max_tokens: 800,
        temperature: 0.7
      })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API Error:', errorText)
      return NextResponse.json({ error: `OpenAI API Error: ${response.status}` }, { status: 500 })
    }
    
    const result = await response.json()
    const insights = result.choices[0].message.content
    
    // Create simple slide structure
    const slideStructure = [
      {
        id: 'slide_1',
        type: 'title',
        title: 'Data Analysis Results',
        content: 'AI-generated insights from your data'
      },
      {
        id: 'slide_2',
        type: 'chart',
        title: 'Key Metrics Overview',
        content: insights,
        charts: [{
          type: 'bar',
          data: data?.slice(0, 10) || [],
          config: { responsive: true }
        }]
      },
      {
        id: 'slide_3',
        type: 'summary',
        title: 'Summary & Recommendations',
        content: 'Next steps based on analysis'
      }
    ]
    
    console.log('✅ Simple analysis complete!')
    
    return NextResponse.json({
      success: true,
      result: {
        insights: [
          {
            id: '1',
            type: 'trend',
            title: 'Data Analysis Complete',
            description: insights,
            confidence: 85
          }
        ],
        slideStructure,
        metadata: {
          confidence: 85,
          analysisDepth: 'basic',
          dataQuality: 75
        }
      }
    })
    
  } catch (error) {
    console.error('❌ Simple test error:', error)
    return NextResponse.json(
      { error: 'Simple test failed' },
      { status: 500 }
    )
  }
}