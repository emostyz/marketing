import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const { context, insights, narrativeArc } = await request.json()

    console.log(`🔍 Content Appropriateness Check - Industry: ${context.industry}, Audience: ${context.targetAudience}`)

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        check: {
          appropriate: true,
          reasons: ['API key not configured - assuming appropriate'],
          warnings: []
        }
      }, { status: 200 })
    }

    const systemPrompt = `You are a content moderation specialist and workplace appropriateness expert. Your role is to analyze presentation content and determine if it's suitable for professional work environments.

You must check for:
1. Inappropriate language, topics, or references
2. Content that could be offensive or discriminatory
3. Sensitive information that shouldn't be shared
4. Topics that violate workplace policies
5. Content that could create legal or ethical issues

Consider the context:
- Industry: ${context.industry}
- Target Audience: ${context.targetAudience}
- Presentation Type: ${context.presentationType}
- Business Goals: ${context.businessGoals}

Return a JSON object with the appropriateness assessment.`

    const prompt = `
CONTENT ANALYSIS:

Business Context:
- Industry: ${context.industry}
- Target Audience: ${context.targetAudience}
- Presentation Type: ${context.presentationType}
- Business Goals: ${context.businessGoals}
- Key Questions: ${context.keyQuestions.join(', ')}

Data Insights:
${insights.map((i: any) => `- ${i.title}: ${i.description}`).join('\n')}

Narrative Content:
${narrativeArc ? `
Hook: ${narrativeArc.hook}
Context: ${narrativeArc.context}
Rising Action: ${narrativeArc.risingAction.map((a: any) => a.title).join(', ')}
Climax: ${narrativeArc.climax.title}
Falling Action: ${narrativeArc.fallingAction.map((a: any) => a.title).join(', ')}
Resolution: ${narrativeArc.resolution}
Call to Action: ${narrativeArc.callToAction}
` : 'No narrative arc provided'}

User Preferences:
- Focus Areas: ${context.userPreferences.focusAreas.join(', ')}
- Avoid Topics: ${context.userPreferences.avoidTopics.join(', ')}

APPROPRIATENESS ASSESSMENT:
1. Review all content for inappropriate language, topics, or references
2. Check for potential workplace policy violations
3. Assess if content is suitable for the target audience
4. Identify any sensitive or confidential information
5. Flag any content that could create legal or ethical issues
6. Consider industry-specific appropriateness standards

Return a JSON object with:
{
  "appropriate": true/false,
  "reasons": ["reason1", "reason2"],
  "warnings": ["warning1", "warning2"],
  "riskLevel": "low|medium|high",
  "recommendations": ["recommendation1", "recommendation2"]
}

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
    console.log(`📥 Received content appropriateness check`)

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
      console.log(`✅ Content appropriateness check parsed successfully`)
    } catch (parseError) {
      console.error(`❌ Content check parse error:`, parseError)
      
      try {
        const jsonMatch = content?.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0])
          console.log('✅ Extracted JSON from content check content')
        } else {
          result = { 
            appropriate: true,
            reasons: ['Failed to parse content check - assuming appropriate'],
            warnings: []
          }
        }
      } catch (extractError) {
        console.error('Failed to extract JSON from content check:', extractError)
        result = { 
          appropriate: true,
          reasons: ['Failed to parse content check - assuming appropriate'],
          warnings: []
        }
      }
    }

    return NextResponse.json({
      success: true,
      check: result,
      tokensUsed: response.usage?.total_tokens || 0
    })

  } catch (error) {
    console.error('Content check error:', error)
    
    return NextResponse.json({ 
      success: true,
      check: {
        appropriate: true,
        reasons: ['Content check failed - assuming appropriate'],
        warnings: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 200 })
  }
} 