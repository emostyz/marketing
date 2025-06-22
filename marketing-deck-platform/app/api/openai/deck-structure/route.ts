import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const { context, insights, narrativeArc } = await request.json()

    console.log(`🏗️ AI Deck Structure Analysis - Audience: ${context.targetAudience}, Type: ${context.presentationType}`)

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: 'OpenAI API key not configured',
        fallback: true
      }, { status: 200 })
    }

    const systemPrompt = `You are a world-class presentation architect and deck designer with expertise in creating compelling, data-driven presentations. You excel at analyzing business context, data insights, and audience needs to design the optimal deck structure.

Your task is to analyze the provided context and determine:
1. The optimal deck title and subtitle
2. The ideal number and sequence of slides
3. The most appropriate slide types for each section
4. The narrative flow that will engage the audience
5. The complexity level appropriate for the time limit and audience

Available slide types:
- title: Opening slide with hook
- agenda: Overview of presentation structure
- content: Text-heavy slides with bullet points
- chart: Data visualizations and analytics
- comparison: Side-by-side analysis
- timeline: Chronological sequences
- process: Step-by-step workflows
- quote: Expert testimonials or insights
- stats: Key metrics and numbers
- call-to-action: Clear next steps
- summary: Key takeaways
- custom: Specialized slide types

Consider the audience type:
- executive: High-level strategic insights, minimal detail
- investor: Financial focus, growth potential, risk assessment
- stakeholder: Balanced view, impact analysis
- team: Detailed implementation, technical depth
- client: Value proposition, benefits, solutions

Return a JSON object with the structure analysis.`

    const prompt = `
CONTEXT ANALYSIS:

Business Goals: ${context.businessGoals}
Target Audience: ${context.targetAudience}
Presentation Type: ${context.presentationType}
Time Limit: ${context.timeLimit} minutes
Industry: ${context.industry}
Key Questions: ${context.keyQuestions.join(', ')}
Constraints: ${context.constraints.join(', ')}

User Preferences:
- Chart Style: ${context.userPreferences.chartStyle}
- Narrative Style: ${context.userPreferences.narrativeStyle}
- Focus Areas: ${context.userPreferences.focusAreas.join(', ')}
- Avoid Topics: ${context.userPreferences.avoidTopics.join(', ')}

INSIGHTS SUMMARY:
${insights.map((i: any) => `- ${i.title} (${i.type}, ${i.impact} impact, ${i.confidence}% confidence)`).join('\n')}

NARRATIVE ARC:
${narrativeArc ? `
Hook: ${narrativeArc.hook}
Context: ${narrativeArc.context}
Rising Action: ${narrativeArc.risingAction.map((a: any) => a.title).join(', ')}
Climax: ${narrativeArc.climax.title}
Falling Action: ${narrativeArc.fallingAction.map((a: any) => a.title).join(', ')}
Resolution: ${narrativeArc.resolution}
Call to Action: ${narrativeArc.callToAction}
` : 'No narrative arc provided'}

ANALYSIS REQUIREMENTS:
1. Determine the optimal deck title and subtitle
2. Calculate the ideal number of slides based on time limit (${context.timeLimit} minutes)
3. Design the slide sequence that tells the most compelling story
4. Ensure the structure matches the audience type and presentation goals
5. Consider the narrative flow and data insights
6. Balance complexity with time constraints

Return a JSON object with:
{
  "title": "Compelling deck title",
  "subtitle": "Supporting subtitle",
  "slideCount": number,
  "structure": [
    {
      "position": 1,
      "type": "slide_type",
      "purpose": "What this slide accomplishes",
      "estimatedTime": seconds,
      "keyMessage": "Main takeaway"
    }
  ],
  "narrativeFlow": {
    "opening": "How to start",
    "development": "How to build the story",
    "climax": "Key turning point",
    "resolution": "How to conclude",
    "callToAction": "What to ask for"
  },
  "complexity": "simple|moderate|complex",
  "audienceFocus": ["primary_audience", "secondary_audience"],
  "keyThemes": ["theme1", "theme2", "theme3"]
}

RESPONSE (JSON only):`

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    })

    const content = response.choices[0].message.content
    console.log(`📥 Received deck structure analysis`)

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
      console.log(`✅ Deck structure analysis parsed successfully`)
    } catch (parseError) {
      console.error(`❌ Deck structure parse error:`, parseError)
      
      try {
        const jsonMatch = content?.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0])
          console.log('✅ Extracted JSON from deck structure content')
        } else {
          result = { 
            error: 'Failed to parse deck structure response',
            rawResponse: content
          }
        }
      } catch (extractError) {
        console.error('Failed to extract JSON from deck structure:', extractError)
        result = { 
          error: 'Failed to parse or extract deck structure JSON',
          rawResponse: content
        }
      }
    }

    return NextResponse.json({
      success: true,
      structure: result,
      tokensUsed: response.usage?.total_tokens || 0
    })

  } catch (error) {
    console.error('Deck structure error:', error)
    
    return NextResponse.json({ 
      error: 'Deck structure analysis failed',
      fallback: true,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 200 })
  }
} 