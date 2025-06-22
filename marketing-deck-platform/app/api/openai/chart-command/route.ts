import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const { query, currentConfig, data } = await request.json()

    console.log(`🎨 Chart Command - Query: ${query}`)

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: 'OpenAI API key not configured',
        fallback: true
      }, { status: 200 })
    }

    const systemPrompt = `You are an expert chart designer and data visualization specialist. You excel at interpreting natural language requests and converting them into precise chart configuration changes.

Your task is to analyze the user's plain English request and return specific chart configuration updates that will implement their desired changes.

Available chart types: line, bar, area, scatter, donut, pie, heatmap, combo, stacked, grouped, waterfall, funnel, radar

Available color palettes: corporate, modern, elegant, vibrant, monochrome, pastel

Available interactions: zoom, pan, selection, hover, click, drag

Available style options: animation, tooltip, legend, gridLines, title, subtitle, height, colors, orientation, alignment

Return ONLY a JSON object with the specific configuration changes needed. Do not include explanations or markdown formatting.`

    const prompt = `
USER REQUEST: "${query}"

CURRENT CHART CONFIG:
${JSON.stringify(currentConfig, null, 2)}

SAMPLE DATA:
${JSON.stringify(data.slice(0, 5), null, 2)}

INSTRUCTIONS:
1. Analyze the user's request carefully
2. Identify what changes they want to make to the chart
3. Return ONLY a JSON object with the specific configuration properties that need to be updated
4. Use the exact property names from the current config
5. Only include properties that need to change
6. Ensure the response is valid JSON without markdown formatting

EXAMPLE RESPONSES:
- "Make this a line chart" → {"type": "line"}
- "Use blue colors" → {"colors": ["#1f77b4", "#ff7f0e", "#2ca02c"]}
- "Add a title" → {"title": "Chart Title"}
- "Make it taller" → {"height": 600}
- "Show percentages" → {"valueFormatter": "percentage"}

RESPONSE (JSON only):`

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 1000,
    })

    const content = response.choices[0].message.content
    console.log(`📥 Received chart command response: ${content}`)

    let result

    try {
      // Clean the content to handle markdown code blocks
      let cleanedContent = content || '{}'
      
      if (cleanedContent.includes('```json')) {
        cleanedContent = cleanedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      } else if (cleanedContent.includes('```')) {
        cleanedContent = cleanedContent.replace(/```\n?/g, '')
      }
      
      cleanedContent = cleanedContent.trim()
      
      result = JSON.parse(cleanedContent)
      console.log(`✅ Chart command parsed successfully`)
    } catch (parseError) {
      console.error(`❌ Chart command parse error:`, parseError)
      
      try {
        const jsonMatch = content?.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0])
          console.log('✅ Extracted JSON from chart command content')
        } else {
          result = { 
            error: 'Failed to parse chart command response',
            rawResponse: content
          }
        }
      } catch (extractError) {
        console.error('Failed to extract JSON from chart command:', extractError)
        result = { 
          error: 'Failed to parse or extract chart command JSON',
          rawResponse: content
        }
      }
    }

    return NextResponse.json({
      success: true,
      config: result,
      query,
      tokensUsed: response.usage?.total_tokens || 0
    })

  } catch (error) {
    console.error('Chart command error:', error)
    
    return NextResponse.json({ 
      error: 'Chart command failed',
      fallback: true,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 200 })
  }
} 