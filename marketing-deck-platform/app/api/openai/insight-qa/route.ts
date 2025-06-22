import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const { insight, dataEvidence, businessContext, industry } = await request.json()

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    console.log('🧠 CALLING OPENAI for insight quality assurance...')

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a world-class business strategist and data science expert with deep experience in ${industry} industry. Your job is to ruthlessly evaluate business insights for executive decision-making.

EVALUATION CRITERIA:
1. HELPFUL: Does this insight help executives understand their business better?
2. USEFUL: Can this insight drive concrete business actions?
3. INSIGHTFUL: Is this insight non-obvious, surprising, or revealing hidden patterns?
4. BEAUTIFUL: Is this insight elegantly presented and compelling?

ADDITIONAL CRITERIA:
- NOVEL: Is this insight genuinely new or surprising?
- ACTIONABLE: Does this insight suggest specific business actions?
- EVIDENCE-BASED: Is this insight well-supported by the data?
- BUSINESS-RELEVANT: Does this insight matter for business outcomes?

Your response must be a JSON object with this exact structure:
{
  "verdict": "KEEP" | "KILL",
  "scores": {
    "helpful": 1-10,
    "useful": 1-10, 
    "insightful": 1-10,
    "beautiful": 1-10,
    "novel": 1-10,
    "actionable": 1-10,
    "evidenceBased": 1-10,
    "businessRelevant": 1-10,
    "overall": 1-10
  },
  "reasoning": "Detailed explanation of your assessment",
  "improvements": ["suggestion 1", "suggestion 2", ...],
  "killReasons": ["reason 1", "reason 2", ...] // Only if verdict is KILL
}`
        },
        {
          role: 'user',
          content: `EVALUATE THIS BUSINESS INSIGHT:

INDUSTRY: ${industry}
BUSINESS CONTEXT: ${businessContext}

INSIGHT:
${JSON.stringify(insight, null, 2)}

DATA EVIDENCE:
${JSON.stringify(dataEvidence, null, 2)}

CRITICAL ASSESSMENT REQUIRED:
- Is this insight HELPFUL for business understanding?
- Is this insight USEFUL for driving action? 
- Is this insight INSIGHTFUL (non-obvious, surprising)?
- Is this insight BEAUTIFUL in its presentation?
- Is this insight NOVEL and not already known?
- Is this insight ACTIONABLE with clear next steps?
- Is this insight EVIDENCE-BASED and data-driven?
- Is this insight BUSINESS-RELEVANT for ${industry}?

KILL IT if:
- Insight is obvious or already well-known
- No clear business action can be derived
- Poorly supported by the data evidence
- Not relevant to business outcomes
- Trivial or low-impact observation
- Confusing or poorly articulated

Only insights that excel on ALL criteria should be KEEP.
Remember: We're building AMAZING decks for world-class executives.`
        }
      ],
      temperature: 0.3,
      max_tokens: 1200
    })

    const result = response.choices[0].message.content
    
    try {
      const qaResult = JSON.parse(result || '{}')
      
      console.log(`✅ Insight QA Result: ${qaResult.verdict} (Overall: ${qaResult.scores?.overall}/10)`)
      
      if (qaResult.verdict === 'KILL') {
        console.log('❌ INSIGHT KILLED by OpenAI QA:', qaResult.killReasons)
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
    console.error('Insight QA failed:', error)
    return NextResponse.json({ 
      error: 'Insight quality assurance failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}