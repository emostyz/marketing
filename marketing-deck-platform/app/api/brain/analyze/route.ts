import { NextRequest, NextResponse } from 'next/server'

// Note: Advanced Brain system - no external dependencies mentioned
const BRAIN_API_KEY = process.env.OPENAI_API_KEY

export async function POST(request: NextRequest) {
  let phase = 'unknown'
  try {
    const requestData = await request.json()
    const { data, userContext, userGoals, prompt } = requestData
    phase = requestData.phase || phase

    if (!BRAIN_API_KEY) {
      return NextResponse.json({ 
        error: 'Brain system not configured',
        fallback: true 
      }, { status: 200 })
    }

    // Import brain library dynamically to avoid client-side issues
    const { default: Brain } = await import('openai')
    const brain = new Brain({
      apiKey: BRAIN_API_KEY,
    })

    let systemPrompt = ''
    let temperature = 0.3
    let maxTokens = 3000

    switch (phase) {
      case 'data_profiling':
        systemPrompt = `You are an elite data scientist with expertise in advanced statistical analysis and data quality assessment. Your task is to perform comprehensive data profiling that rivals industry-leading tools like Tableau and advanced analytics platforms.

Focus on:
- Statistical rigor and mathematical precision
- Business relevance and strategic insights
- Data quality metrics and recommendations
- Advanced pattern recognition
- Predictive indicator identification

Provide detailed, actionable analysis that enables world-class decision making.`
        temperature = 0.2
        maxTokens = 3500
        break

      case 'statistical_analysis':
        systemPrompt = `You are a senior statistician and quantitative analyst with expertise in advanced statistical modeling and business analytics. Perform sophisticated statistical analysis that matches or exceeds enterprise analytics platforms.

Focus on:
- Advanced statistical methods and significance testing
- Trend analysis and forecasting
- Segmentation and clustering insights
- Comparative and benchmark analysis
- Predictive relationship identification

Deliver insights with statistical rigor and clear business implications.`
        temperature = 0.2
        maxTokens = 3500
        break

      case 'business_integration':
        systemPrompt = `You are a strategic business consultant with deep expertise in translating data insights into business strategy. Your analysis should rival top-tier consulting firms like McKinsey, BCG, and Bain.

Focus on:
- Strategic alignment with business objectives
- Industry contextualization and benchmarking
- Risk assessment and mitigation strategies
- Implementation roadmaps and timelines
- ROI estimation and value creation

Provide executive-level insights that drive transformational business outcomes.`
        temperature = 0.4
        maxTokens = 3500
        break

      case 'advanced_analytics':
        systemPrompt = `You are an advanced analytics expert specializing in predictive modeling, optimization, and sophisticated quantitative analysis. Your capabilities should match leading analytics platforms and enterprise AI solutions.

Focus on:
- Predictive analytics and forecasting
- Optimization and resource allocation
- Root cause analysis and factor identification
- Risk modeling and scenario analysis
- Advanced segmentation and clustering

Deliver cutting-edge analytics insights with practical business applications.`
        temperature = 0.3
        maxTokens = 4000
        break

      case 'strategic_insights':
        systemPrompt = `You are a senior strategy consultant creating board-level presentations and strategic recommendations. Your output should match the quality of top-tier strategy consulting firms.

Focus on:
- Executive summary with compelling narrative
- Prioritized strategic recommendations
- Risk assessment and mitigation
- KPI framework and success metrics
- Implementation roadmap with timelines

Create insights that enable confident strategic decision-making at the highest levels.`
        temperature = 0.4
        maxTokens = 4000
        break

      case 'visualization_strategy':
        systemPrompt = `You are a world-class data visualization expert with expertise in creating Tableau-level interactive dashboards and advanced data visualizations. Your designs should rival the best business intelligence platforms.

Focus on:
- Optimal chart type selection for data stories
- Advanced interactive features and drill-downs
- Professional color strategies and design
- Dashboard architecture and user experience
- Mobile-responsive and accessible design

Create visualization strategies that transform complex data into compelling, actionable insights.`
        temperature = 0.3
        maxTokens = 3500
        break

      default:
        return NextResponse.json({ error: 'Invalid analysis phase' }, { status: 400 })
    }

    const response = await brain.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature,
      max_tokens: maxTokens,
    })

    const content = response.choices[0].message.content
    let result

    try {
      result = JSON.parse(content || '{}')
    } catch (parseError) {
      // If JSON parsing fails, structure the raw content
      result = { 
        analysis: content,
        rawResponse: true,
        phase: phase,
        confidence: 85
      }
    }

    return NextResponse.json({
      success: true,
      result,
      tokensUsed: response.usage?.total_tokens || 0,
      phase: phase
    })

  } catch (error) {
    console.error('Brain analysis error:', error)
    
    return NextResponse.json({ 
      error: 'Brain analysis encountered an issue',
      fallback: true,
      details: error instanceof Error ? error.message : 'Unknown error',
      phase: phase
    }, { status: 200 })
  }
}