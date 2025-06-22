import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const { context, insights, narrativeArc } = await request.json()

    console.log(`📊 Slide Sequence Generation - ${context.targetAudience} presentation`)

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: 'OpenAI API key not configured',
        fallback: true
      }, { status: 200 })
    }

    const systemPrompt = `You are a world-class presentation designer and slide content creator. You excel at creating compelling, data-driven slides that tell a powerful story and engage audiences.

Your task is to generate a complete slide sequence with detailed content for each slide, including:
1. Slide titles and subtitles
2. Content structure and bullet points
3. Data visualizations and chart configurations
4. Layout and styling recommendations
5. Interactive elements and animations
6. Timing and pacing considerations

Available slide types:
- title: Opening slide with compelling hook
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

Consider the audience type and adjust complexity accordingly:
- executive: High-level strategic insights, minimal detail
- investor: Financial focus, growth potential, risk assessment
- stakeholder: Balanced view, impact analysis
- team: Detailed implementation, technical depth
- client: Value proposition, benefits, solutions

Return a JSON array of detailed slide objects.`

    const prompt = `
SLIDE SEQUENCE GENERATION:

Context:
- Business Goals: ${context.businessGoals}
- Target Audience: ${context.targetAudience}
- Presentation Type: ${context.presentationType}
- Time Limit: ${context.timeLimit} minutes
- Industry: ${context.industry}
- Key Questions: ${context.keyQuestions.join(', ')}

User Preferences:
- Chart Style: ${context.userPreferences.chartStyle}
- Narrative Style: ${context.userPreferences.narrativeStyle}
- Focus Areas: ${context.userPreferences.focusAreas.join(', ')}
- Avoid Topics: ${context.userPreferences.avoidTopics.join(', ')}

Key Insights:
${insights.map((i: any) => `- ${i.title}: ${i.description} (${i.impact} impact)`).join('\n')}

Narrative Arc:
${narrativeArc ? `
Hook: ${narrativeArc.hook}
Context: ${narrativeArc.context}
Rising Action: ${narrativeArc.risingAction.map((a: any) => a.title).join(', ')}
Climax: ${narrativeArc.climax.title}
Falling Action: ${narrativeArc.fallingAction.map((a: any) => a.title).join(', ')}
Resolution: ${narrativeArc.resolution}
Call to Action: ${narrativeArc.callToAction}
` : 'No narrative arc provided'}

GENERATION REQUIREMENTS:
1. Create ${context.slideCount || Math.ceil(context.timeLimit / 2)} slides
2. Each slide should have a clear purpose and key message
3. Include appropriate data visualizations for insights
4. Match the narrative flow and story arc
5. Consider audience type and complexity preferences
6. Include timing estimates for each slide
7. Design for the specified chart style and narrative style

Return a JSON array of slide objects with this structure:
[
  {
    "id": "slide_1",
    "type": "slide_type",
    "title": "Compelling slide title",
    "subtitle": "Supporting subtitle",
    "content": {
      "body": "Main content text",
      "bulletPoints": ["Point 1", "Point 2", "Point 3"],
      "narrative": ["Narrative point 1", "Narrative point 2"],
      "insights": ["Insight 1", "Insight 2"],
      "data": [{"key": "value"}],
      "chartConfig": {
        "type": "chart_type",
        "data": [{"key": "value"}],
        "categories": ["category1", "category2"],
        "colors": ["#color1", "#color2"]
      }
    },
    "layout": {
      "template": "standard|split|grid|hero|minimal|detailed",
      "alignment": "left|center|right",
      "spacing": "tight|normal|loose",
      "background": "solid|gradient|image|pattern"
    },
    "styling": {
      "theme": "professional|modern|creative|minimal|bold",
      "colorScheme": ["#color1", "#color2"],
      "fontFamily": "font_name",
      "fontSize": 16,
      "emphasis": "subtle|moderate|strong"
    },
    "interactions": {
      "animations": true/false,
      "clickable": true/false,
      "drillDown": true/false,
      "tooltips": true/false
    },
    "metadata": {
      "importance": "critical|important|supporting",
      "timeEstimate": 30,
      "audienceFocus": ["primary", "secondary"],
      "keyMessage": "Main takeaway from this slide"
    }
  }
]

RESPONSE (JSON array only):`

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 4000,
    })

    const content = response.choices[0].message.content
    console.log(`📥 Received slide sequence generation`)

    let result

    try {
      // Clean the content to handle markdown code blocks
      let cleanedContent = content || '[]'
      
      if (cleanedContent.includes('```json')) {
        cleanedContent = cleanedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      } else if (cleanedContent.includes('```')) {
        cleanedContent = cleanedContent.replace(/```\n?/g, '')
      }
      
      cleanedContent = cleanedContent.trim()
      
      result = JSON.parse(cleanedContent)
      console.log(`✅ Slide sequence generation parsed successfully: ${result.length} slides`)
    } catch (parseError) {
      console.error(`❌ Slide sequence parse error:`, parseError)
      
      try {
        const jsonMatch = content?.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0])
          console.log('✅ Extracted JSON array from slide sequence content')
        } else {
          result = []
          console.log('❌ No valid JSON array found in slide sequence response')
        }
      } catch (extractError) {
        console.error('Failed to extract JSON from slide sequence:', extractError)
        result = []
      }
    }

    return NextResponse.json({
      success: true,
      slides: result,
      tokensUsed: response.usage?.total_tokens || 0
    })

  } catch (error) {
    console.error('Slide sequence error:', error)
    
    return NextResponse.json({ 
      error: 'Slide sequence generation failed',
      fallback: true,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 200 })
  }
} 