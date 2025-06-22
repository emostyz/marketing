import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const { slideContent, slideType, targetAudience, businessContext } = await request.json()

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    console.log('🧠 CALLING OPENAI for slide quality assurance...')

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a world-class executive presentation consultant and McKinsey-level slide designer. Your job is to ruthlessly evaluate slides for C-level presentations.

EVALUATION CRITERIA:
1. HELPFUL: Does this slide help executives understand something critical?
2. USEFUL: Can executives take immediate action based on this slide?
3. INSIGHTFUL: Does this slide reveal game-changing insights or non-obvious patterns?
4. BEAUTIFUL: Is this slide visually stunning and executive-ready?

ADDITIONAL CRITERIA:
- Executive-ready content (no fluff, pure value)
- Clear narrative flow and logical structure
- Professional visual design that commands attention
- Actionable insights that drive decision-making

Your response must be a JSON object with this exact structure:
{
  "verdict": "KEEP" | "KILL",
  "scores": {
    "helpful": 1-10,
    "useful": 1-10, 
    "insightful": 1-10,
    "beautiful": 1-10,
    "executiveReady": 1-10,
    "overall": 1-10
  },
  "reasoning": "Detailed explanation of your assessment",
  "improvements": ["suggestion 1", "suggestion 2", ...],
  "killReasons": ["reason 1", "reason 2", ...] // Only if verdict is KILL
}`
        },
        {
          role: 'user',
          content: `EVALUATE THIS SLIDE FOR C-LEVEL PRESENTATION:

SLIDE TYPE: ${slideType}
TARGET AUDIENCE: ${targetAudience}
BUSINESS CONTEXT: ${businessContext}

SLIDE CONTENT:
${JSON.stringify(slideContent, null, 2)}

CRITICAL ASSESSMENT REQUIRED:
- Is this slide HELPFUL for C-level decision making?
- Is this slide USEFUL for immediate executive action? 
- Does this slide provide INSIGHTFUL revelations that matter?
- Is this slide BEAUTIFUL and presentation-ready?
- Is this slide EXECUTIVE-READY (McKinsey-quality)?

KILL IT if:
- Content is obvious, boring, or lacks insight
- Visual design is unprofessional or cluttered
- No clear action can be taken from this slide
- Not appropriate for executive-level audience
- Fails to meet McKinsey/BCG presentation standards

Only slides that excel on ALL criteria should be KEEP.`
        }
      ],
      temperature: 0.3,
      max_tokens: 1200
    })

    const result = response.choices[0].message.content
    
    try {
      const qaResult = JSON.parse(result || '{}')
      
      console.log(`✅ Slide QA Result: ${qaResult.verdict} (Overall: ${qaResult.scores?.overall}/10)`)
      
      if (qaResult.verdict === 'KILL') {
        console.log('❌ SLIDE KILLED by OpenAI QA:', qaResult.killReasons)
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
    console.error('Slide QA failed:', error)
    return NextResponse.json({ 
      error: 'Slide quality assurance failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}