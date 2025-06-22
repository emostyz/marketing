import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const { data, userContext, userGoals, phase } = await request.json()

    // Debug environment variables
    console.log('🔍 Environment check:')
    console.log('- OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY)
    console.log('- OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length || 0)
    console.log('- OPENAI_API_KEY starts with sk-:', process.env.OPENAI_API_KEY?.startsWith('sk-') || false)

    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not configured')
      return NextResponse.json({ 
        error: 'OpenAI API key not configured',
        fallback: true,
        debug: {
          envExists: !!process.env.OPENAI_API_KEY,
          envLength: process.env.OPENAI_API_KEY?.length || 0
        }
      }, { status: 200 })
    }

    // Test the API key format
    if (!process.env.OPENAI_API_KEY.startsWith('sk-')) {
      console.error('❌ OpenAI API key format invalid')
      return NextResponse.json({ 
        error: 'OpenAI API key format invalid',
        fallback: true,
        debug: {
          keyStartsWith: process.env.OPENAI_API_KEY.substring(0, 10) + '...'
        }
      }, { status: 200 })
    }

    console.log(`🧠 OpenAI Analysis - Phase: ${phase}, Data points: ${data?.length || 0}`)

    let prompt = ''
    
    switch (phase) {
      case 'data_analysis':
        prompt = `
        You are a world-class McKinsey consultant analyzing real business data. Analyze this dataset deeply and provide specific, actionable insights.

        DATASET ANALYSIS:
        Dataset: ${JSON.stringify(data.slice(0, 10), null, 2)}
        Total records: ${data.length}
        Columns: ${Object.keys(data[0] || {}).join(', ')}
        Business Context: ${userContext}

        REQUIREMENTS:
        1. Identify key patterns, trends, and anomalies in the ACTUAL data
        2. Calculate specific metrics and percentages from the real numbers
        3. Find correlations between different data columns
        4. Identify outliers or unusual data points
        5. Provide statistical insights with exact numbers

        FORMAT YOUR RESPONSE AS JSON:
        {
          "keyMetrics": {
            "totalRecords": number,
            "dateRange": "string",
            "topPerformers": ["specific values"],
            "growthRate": "percentage",
            "anomalies": ["specific findings"]
          },
          "trends": [
            {
              "trend": "description with specific numbers",
              "significance": "high/medium/low",
              "dataPoints": ["specific examples"]
            }
          ],
          "correlations": [
            {
              "variables": ["col1", "col2"],
              "strength": "strong/medium/weak",
              "insight": "specific finding with numbers"
            }
          ],
          "recommendations": [
            "specific actionable recommendation with data backing"
          ]
        }

        Use the ACTUAL numbers from the data. Be specific and quantitative.
        `
        break

      case 'contextual_insights':
        prompt = `
        As a McKinsey consultant, generate strategic insights for this business context using the REAL data analysis.

        BUSINESS CONTEXT: ${userContext}
        BUSINESS GOALS: ${userGoals}
        DATA SUMMARY: ${data.length} records with columns: ${Object.keys(data[0] || {}).join(', ')}

        REQUIREMENTS:
        1. Executive summary (2-3 sentences with specific numbers)
        2. Top 5 key takeaways that directly address the business goals
        3. Strategic implications with data backing
        4. Opportunities for immediate action with specific metrics
        5. Risk factors identified in the data

        FORMAT YOUR RESPONSE AS JSON:
        {
          "executiveSummary": "2-3 sentence summary with specific numbers and insights",
          "keyTakeaways": [
            "Specific insight with data backing",
            "Another insight with numbers",
            "Third insight with metrics"
          ],
          "strategicImplications": [
            {
              "implication": "specific strategic finding",
              "dataBacking": "specific numbers from data",
              "impact": "high/medium/low"
            }
          ],
          "opportunities": [
            {
              "opportunity": "specific opportunity",
              "potentialValue": "quantified value",
              "actionRequired": "specific action"
            }
          ],
          "risks": [
            {
              "risk": "specific risk identified",
              "probability": "high/medium/low",
              "mitigation": "specific mitigation strategy"
            }
          ]
        }

        Focus on business impact, not just data observations. Use specific numbers from the data.
        `
        break

      case 'story_discovery':
        prompt = `
        You are a master storyteller and data visualization expert. Create compelling narratives from this REAL business data.

        BUSINESS CONTEXT: ${userContext}
        DATA ANALYSIS: ${JSON.stringify(data.slice(0, 5), null, 2)}
        TOTAL RECORDS: ${data.length}

        REQUIREMENTS:
        1. Create an overarching story that connects all data points with specific numbers
        2. Identify individual micro-stories for each key finding
        3. Recommend presentation flow (slide sequence)
        4. Create call-to-action moments with data backing
        5. Identify the "hero" metrics and "villain" problems in the data

        FORMAT YOUR RESPONSE AS JSON:
        {
          "overallStory": {
            "narrative": "compelling story with specific numbers",
            "heroMetrics": ["specific positive metrics"],
            "villainProblems": ["specific issues to address"],
            "climax": "key turning point in the data"
          },
          "microStories": [
            {
              "title": "specific story title",
              "narrative": "story with specific data points",
              "dataBacking": ["specific numbers"],
              "emotionalHook": "why this matters"
            }
          ],
          "recommendedFlow": [
            {
              "slideNumber": 1,
              "type": "title/executive/chart/insight",
              "title": "specific slide title",
              "keyMessage": "specific message with numbers"
            }
          ],
          "callToActions": [
            {
              "moment": "specific moment in presentation",
              "action": "specific action required",
              "urgency": "why now",
              "dataBacking": "specific numbers supporting urgency"
            }
          ]
        }

        Think like a McKinsey consultant presenting to C-suite executives. Use specific numbers and data points.
        `
        break

      case 'visualization_strategy':
        const numericColumns = getNumericColumns(data)
        const categoricalColumns = getCategoricalColumns(data)
        
        prompt = `
        You are a visualization expert specializing in professional charts. Design the optimal chart strategy for this REAL business data.

        DATA STRUCTURE:
        - Numeric columns: ${numericColumns.join(', ')}
        - Categorical columns: ${categoricalColumns.join(', ')}
        - Sample data: ${JSON.stringify(data.slice(0, 3), null, 2)}
        - Total records: ${data.length}
        
        BUSINESS GOALS: ${userGoals}
        BUSINESS CONTEXT: ${userContext}

        REQUIREMENTS:
        For each key story point, recommend:
        1. Chart type (line, bar, area, donut, scatter) with justification
        2. Specific columns to visualize with reasoning
        3. Color strategy for maximum impact
        4. Supporting narrative with specific numbers
        5. Priority level (high, medium, low) with reasoning
        6. Expected insights from this visualization

        FORMAT YOUR RESPONSE AS JSON:
        {
          "dataPoints": [
            {
              "title": "specific chart title",
              "insight": "specific insight this chart will reveal",
              "visualizationType": "bar/line/area/donut/scatter",
              "justification": "why this chart type is best",
              "story": "narrative this chart tells with specific numbers",
              "priority": "high/medium/low",
              "priorityReason": "why this priority level",
              "chartConfig": {
                "index": "column name for x-axis",
                "categories": ["column names for y-axis"],
                "colors": ["blue", "emerald", "violet"],
                "dataMapping": {
                  "xAxis": "specific column",
                  "yAxis": ["specific columns"],
                  "series": "if applicable"
                }
              },
              "expectedInsights": [
                "specific insight with numbers",
                "another insight with data"
              ]
            }
          ],
          "overallStrategy": {
            "theme": "consistent visual theme",
            "colorPalette": ["primary colors"],
            "narrativeFlow": "how charts tell the story"
          }
        }

        Each chart must reference specific columns and expected insights. Use the actual data structure.
        `
        break

      default:
        return NextResponse.json({ error: 'Invalid phase' }, { status: 400 })
    }

    console.log(`📤 Sending to OpenAI - Phase: ${phase}`)

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      temperature: phase === 'story_discovery' ? 0.6 : 0.3,
      max_tokens: 3000,
    })

    const content = response.choices[0].message.content
    console.log(`📥 Received from OpenAI - Phase: ${phase}, Tokens: ${response.usage?.total_tokens}`)

    let result

    try {
      // Clean the content to handle markdown code blocks
      let cleanedContent = content || '{}'
      
      // Remove markdown code blocks if present
      if (cleanedContent.includes('```json')) {
        cleanedContent = cleanedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      } else if (cleanedContent.includes('```')) {
        cleanedContent = cleanedContent.replace(/```\n?/g, '')
      }
      
      // Trim whitespace
      cleanedContent = cleanedContent.trim()
      
      console.log('🧹 Cleaned content:', cleanedContent.substring(0, 200) + '...')
      
      result = JSON.parse(cleanedContent)
      console.log(`✅ Parsed JSON successfully for phase: ${phase}`)
    } catch (parseError) {
      console.error(`❌ JSON parse error for phase ${phase}:`, parseError)
      console.log('Raw content:', content)
      
      // Try to extract JSON from the content if it contains JSON-like structure
      try {
        const jsonMatch = content?.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0])
          console.log('✅ Extracted JSON from content')
        } else {
          // If JSON parsing fails, return structured fallback
          result = { 
            content, 
            rawResponse: true,
            error: 'Failed to parse JSON response'
          }
        }
      } catch (extractError) {
        console.error('Failed to extract JSON:', extractError)
        result = { 
          content, 
          rawResponse: true,
          error: 'Failed to parse or extract JSON'
        }
      }
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