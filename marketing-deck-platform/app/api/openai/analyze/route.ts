import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const { data, userContext, userGoals, phase } = await request.json()

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: 'OpenAI API key not configured',
        fallback: true 
      }, { status: 200 })
    }

    let prompt = ''
    
    switch (phase) {
      case 'data_analysis':
        prompt = `
        You are a world-class data analyst with expertise in McKinsey-style analysis. Analyze this dataset deeply:

        Dataset: ${JSON.stringify(data.slice(0, 5), null, 2)}
        Total records: ${data.length}
        Context: ${userContext}

        Perform a comprehensive analysis including:
        1. Data quality assessment
        2. Key patterns and trends identification
        3. Statistical significance of findings
        4. Outliers and anomalies
        5. Correlation analysis between variables

        Return a JSON object with detailed findings.
        `
        break

      case 'contextual_insights':
        prompt = `
        As a strategic consultant, generate actionable insights for this business context:

        Business Context: ${userContext}
        Business Goals: ${userGoals}
        Data Summary: ${data.length} records with ${Object.keys(data[0] || {}).length} columns

        Generate:
        1. Executive summary (2-3 sentences)
        2. Top 5 key takeaways that directly address the business goals
        3. Strategic implications
        4. Opportunities for immediate action

        Focus on business impact, not just data observations. Make insights actionable.

        Return as JSON with clear structure.
        `
        break

      case 'story_discovery':
        prompt = `
        You are a master storyteller and data visualization expert. Create compelling narratives:

        Business Context: ${userContext}
        Data: ${JSON.stringify(data.slice(0, 3), null, 2)}

        Create:
        1. An overarching story that connects all data points
        2. Individual micro-stories for each key finding
        3. Recommended presentation flow (slide sequence)
        4. Call-to-action moments

        Think like a McKinsey consultant presenting to C-suite executives.

        Return as JSON with story structure and recommended flow.
        `
        break

      case 'visualization_strategy':
        const numericColumns = getNumericColumns(data)
        const categoricalColumns = getCategoricalColumns(data)
        
        prompt = `
        You are a visualization expert specializing in charts. Design the optimal chart strategy:

        Available Data Columns:
        - Numeric: ${numericColumns.join(', ')}
        - Categorical: ${categoricalColumns.join(', ')}
        
        Business Goals: ${userGoals}
        Sample Data: ${JSON.stringify(data.slice(0, 3), null, 2)}

        For each key story point, recommend:
        1. Chart type (line, bar, area, donut, scatter)
        2. Specific columns to visualize
        3. Color strategy for maximum impact
        4. Supporting narrative for each chart
        5. Priority level (high, medium, low)

        Return as JSON with dataPoints array containing chart specifications.
        `
        break

      default:
        return NextResponse.json({ error: 'Invalid phase' }, { status: 400 })
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: phase === 'story_discovery' ? 0.6 : 0.3,
      max_tokens: 2000,
    })

    const content = response.choices[0].message.content
    let result

    try {
      result = JSON.parse(content || '{}')
    } catch (parseError) {
      // If JSON parsing fails, return raw content
      result = { content, rawResponse: true }
    }

    return NextResponse.json({
      success: true,
      result,
      tokensUsed: response.usage?.total_tokens || 0
    })

  } catch (error) {
    console.error('OpenAI API error:', error)
    
    return NextResponse.json({ 
      error: 'OpenAI analysis failed',
      fallback: true,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 200 })
  }
}

// Utility functions
function getNumericColumns(data: any[]): string[] {
  if (!data.length) return []
  return Object.keys(data[0]).filter(key => 
    data.every(row => typeof row[key] === 'number' || !isNaN(Number(row[key])))
  )
}

function getCategoricalColumns(data: any[]): string[] {
  if (!data.length) return []
  const numericCols = getNumericColumns(data)
  return Object.keys(data[0]).filter(key => !numericCols.includes(key))
}