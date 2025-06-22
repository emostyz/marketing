import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const { chartData, chartType, chartConfig, businessContext } = await request.json()

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    console.log('🧠 CALLING OPENAI for chart quality assurance...')

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a world-class data visualization expert and executive presentation consultant. Your job is to ruthlessly evaluate charts for business presentations.

EVALUATION CRITERIA:
1. HELPFUL: Does this chart help the audience understand something important?
2. USEFUL: Can the audience take action based on this chart?
3. INSIGHTFUL: Does this chart reveal non-obvious patterns or insights?
4. BEAUTIFUL: Is this chart visually appealing and professionally designed?

Your response must be a JSON object with this exact structure:
{
  "verdict": "KEEP" | "KILL",
  "scores": {
    "helpful": 1-10,
    "useful": 1-10, 
    "insightful": 1-10,
    "beautiful": 1-10,
    "overall": 1-10
  },
  "reasoning": "Detailed explanation of your assessment",
  "improvements": ["suggestion 1", "suggestion 2", ...],
  "killReasons": ["reason 1", "reason 2", ...] // Only if verdict is KILL
}`
        },
        {
          role: 'user',
          content: `EVALUATE THIS CHART FOR EXECUTIVE PRESENTATION:

CHART TYPE: ${chartType}
BUSINESS CONTEXT: ${businessContext}

CHART DATA SAMPLE: ${JSON.stringify(chartData.slice(0, 5))}

CHART CONFIGURATION:
${JSON.stringify(chartConfig, null, 2)}

CRITICAL ASSESSMENT REQUIRED:
- Is this chart HELPFUL for decision makers?
- Is this chart USEFUL for taking action? 
- Does this chart provide INSIGHTFUL revelations?
- Is this chart BEAUTIFUL and professional?

If this chart fails on any criteria, verdict should be KILL.
Only charts that excel on ALL criteria should be KEEP.`
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    })

    const result = response.choices[0].message.content
    
    try {
      const qaResult = JSON.parse(result || '{}')
      
      console.log(`✅ Chart QA Result: ${qaResult.verdict} (Overall: ${qaResult.scores?.overall}/10)`)
      
      if (qaResult.verdict === 'KILL') {
        console.log('❌ CHART KILLED by OpenAI QA:', qaResult.killReasons)
      }

      return NextResponse.json({
        success: true,
        qa: qaResult,
        timestamp: new Date().toISOString()
      })
      
    } catch (parseError) {
      console.error('Failed to parse OpenAI QA response:', parseError)
      return NextResponse.json({ 
        error: 'Invalid QA response format',
        rawResponse: result 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Chart QA failed:', error)
    return NextResponse.json({ 
      error: 'Chart quality assurance failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}