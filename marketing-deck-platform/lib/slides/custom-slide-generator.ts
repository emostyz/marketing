// Custom Slide Generator - Creates tailored slides based on AI orchestration

import OpenAI from 'openai'
import { UserContext, CustomSlide, CustomPresentation } from '@/lib/ai/openai-orchestrator'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export interface SlideGenerationRequest {
  context: UserContext
  insights: any
  narrative: any
  design: any
  data: any[]
  pythonResults: any
}

export class CustomSlideGenerator {
  private context: UserContext
  private data: any[]

  constructor(context: UserContext, data: any[]) {
    this.context = context
    this.data = data
  }

  /**
   * Generate completely custom slides based on orchestrated analysis
   */
  async generateCustomSlides(request: SlideGenerationRequest): Promise<CustomSlide[]> {
    console.log('🎨 Generating custom slides with full context awareness...')

    // Generate slides based on presentation goal and audience
    const slides = await this.createContextualSlides(request)
    
    // Enhance slides with actual data and visualizations
    const enhancedSlides = await this.enhanceWithData(slides, request)
    
    // Apply custom design specifications
    const styledSlides = await this.applyCustomDesign(enhancedSlides, request.design)
    
    return styledSlides
  }

  /**
   * Create slides tailored to specific context and narrative
   */
  private async createContextualSlides(request: SlideGenerationRequest): Promise<CustomSlide[]> {
    const prompt = `
You are creating a custom presentation that is perfectly tailored to this specific context and audience.

COMPLETE CONTEXT (USE EVERY DETAIL):
Business Context: ${this.context.businessContext}
Industry: ${this.context.industry}
Company Size: ${this.context.companySize}
Target Audience: ${this.context.targetAudience}
Decision Makers: ${this.context.decisionMakers?.join(', ')}
Presentation Goal: ${this.context.presentationGoal}
Timeframe: ${this.context.timeframe}
Urgency: ${this.context.urgency}
Specific Questions: ${this.context.specificQuestions?.join('; ')}
Key Metrics: ${this.context.keyMetrics?.join(', ')}
Expected Outcomes: ${this.context.expectedOutcomes?.join('; ')}
Presentation Style: ${this.context.presentationStyle}
Competitive Context: ${this.context.competitiveContext}
Budget Implications: ${this.context.budgetImplications}
Regulatory Considerations: ${this.context.regulatoryConsiderations}
Geographic Scope: ${this.context.geographicScope}
Customer Segments: ${this.context.customerSegments?.join(', ')}
Market Conditions: ${this.context.marketConditions}

INSIGHTS FROM ANALYSIS:
${JSON.stringify(request.insights, null, 2)}

NARRATIVE STRUCTURE:
${JSON.stringify(request.narrative, null, 2)}

PYTHON ANALYSIS RESULTS:
${JSON.stringify(request.pythonResults, null, 2)}

DATA STRUCTURE:
Columns: ${Object.keys(this.data[0] || {}).join(', ')}
Rows: ${this.data.length}
Sample: ${JSON.stringify(this.data.slice(0, 2), null, 2)}

Create slides that:
1. Address EVERY specific question from the context
2. Speak directly to ${this.context.targetAudience} in ${this.context.industry}
3. Drive toward ${this.context.presentationGoal}
4. Respect the ${this.context.urgency} urgency level
5. Use the ${this.context.presentationStyle} style
6. Consider the ${this.context.timeframe} timeframe
7. Account for ${this.context.competitiveContext} competitive landscape
8. Address ${this.context.budgetImplications} budget implications

Return a JSON array of slides. Each slide should be completely customized for this context:

[
  {
    "id": "slide_1",
    "type": "opening|problem_statement|situation_analysis|data_insight|competitive_analysis|financial_impact|recommendation|implementation|next_steps|closing",
    "title": "Title that resonates with ${this.context.targetAudience}",
    "subtitle": "Subtitle that speaks to ${this.context.presentationGoal}",
    "narrative": "The specific story this slide tells for this audience",
    "content": {
      "primaryMessage": "Main message tailored to context",
      "supportingPoints": [
        "Point that addresses specific context element",
        "Point that uses actual data from our analysis"
      ],
      "callToAction": "Action specific to this audience and goal",
      "contextConnection": "How this connects to their specific situation"
    },
    "dataRequirements": [
      "Specific data points needed from our dataset",
      "Calculations needed from Python analysis"
    ],
    "visualStrategy": "How to visualize this for maximum impact with this audience",
    "rhetoricalApproach": "How to persuade this specific audience",
    "urgencyAlignment": "How this respects the urgency level",
    "goalAlignment": "How this drives toward the presentation goal"
  }
]

Create ${this.getOptimalSlideCount()} slides total.
`

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000
    })

    const result = JSON.parse(response.choices[0].message.content || '{"slides": []}')
    return result.slides || []
  }

  /**
   * Enhance slides with actual data and Python analysis results
   */
  private async enhanceWithData(slides: CustomSlide[], request: SlideGenerationRequest): Promise<CustomSlide[]> {
    const enhancedSlides: CustomSlide[] = []

    for (const slide of slides) {
      const enhancedSlide = await this.populateSlideWithData(slide, request)
      enhancedSlides.push(enhancedSlide)
    }

    return enhancedSlides
  }

  /**
   * Populate individual slide with real data and visualizations
   */
  private async populateSlideWithData(slide: CustomSlide, request: SlideGenerationRequest): Promise<CustomSlide> {
    const prompt = `
Populate this slide with real data and create specific visual elements.

SLIDE TO POPULATE:
${JSON.stringify(slide, null, 2)}

AVAILABLE DATA:
Columns: ${Object.keys(this.data[0] || {}).join(', ')}
Sample Data: ${JSON.stringify(this.data.slice(0, 3), null, 2)}
Total Rows: ${this.data.length}

PYTHON ANALYSIS RESULTS:
${JSON.stringify(request.pythonResults, null, 2)}

CONTEXT FOR RELEVANCE:
Target Audience: ${this.context.targetAudience}
Presentation Goal: ${this.context.presentationGoal}
Key Metrics: ${this.context.keyMetrics?.join(', ')}
Specific Questions: ${this.context.specificQuestions?.join('; ')}

Create a fully populated slide with:
1. Real data values from our dataset
2. Actual calculations and metrics
3. Specific visual elements with exact positioning
4. Charts with real data and proper configuration
5. Text elements with actual content

Return JSON:
{
  "id": "${slide.id}",
  "type": "${slide.type}",
  "title": "Populated title with real data/metrics",
  "subtitle": "Populated subtitle",
  "narrative": "Enhanced narrative with specific insights",
  "content": {
    "primaryMessage": "Message with actual data points",
    "supportingPoints": ["Points with real metrics and calculations"],
    "keyInsights": ["Insights from actual Python analysis"],
    "dataEvidence": ["Specific evidence from our dataset"],
    "recommendations": ["Actionable recommendations based on real analysis"]
  },
  "visualElements": [
    {
      "id": "element_id",
      "type": "text|shape|icon|metric_card",
      "content": {
        "text": "Actual content with real data",
        "value": "Calculated metric",
        "format": "number|percentage|currency"
      },
      "position": {"x": 60, "y": 40, "width": 680, "height": 80},
      "style": {
        "fontSize": 24,
        "fontWeight": "bold",
        "color": "#1f2937",
        "backgroundColor": "#ffffff",
        "borderRadius": 8,
        "textAlign": "center"
      },
      "layer": 1
    }
  ],
  "charts": [
    {
      "id": "chart_id",
      "type": "bar|line|pie|scatter",
      "title": "Chart title with context",
      "description": "What this chart reveals",
      "data": "Reference to specific data points",
      "xAxis": "actual column name",
      "yAxis": "actual column name", 
      "configuration": {
        "colors": ["#3b82f6", "#8b5cf6", "#10b981"],
        "theme": "professional",
        "showGrid": true,
        "showTooltip": true
      },
      "insights": ["What the chart reveals about the business"],
      "position": {"x": 60, "y": 160, "width": 680, "height": 320}
    }
  ],
  "keyTakeaways": [
    "Takeaway with specific metric",
    "Takeaway with actual insight"
  ],
  "speakerNotes": "Notes for presenter about this specific content"
}
`

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 2000
    })

    return JSON.parse(response.choices[0].message.content || '{}')
  }

  /**
   * Apply custom design specifications to slides
   */
  private async applyCustomDesign(slides: CustomSlide[], design: any): Promise<CustomSlide[]> {
    return slides.map(slide => {
      // Apply design theme to visual elements
      if (slide.visualElements) {
        slide.visualElements = slide.visualElements.map(element => ({
          ...element,
          style: {
            ...element.style,
            ...this.getDesignStyles(design, element.type)
          }
        }))
      }

      // Apply design to charts
      if (slide.charts) {
        slide.charts = slide.charts.map(chart => ({
          ...chart,
          configuration: {
            ...chart.configuration,
            colors: design.colors || chart.configuration.colors,
            theme: design.chartStyle || 'professional'
          }
        }))
      }

      return {
        ...slide,
        designSpecifications: {
          theme: design.theme,
          colorPalette: design.colors,
          typography: design.typography,
          layout: design.layout
        }
      }
    })
  }

  /**
   * Get design styles based on theme and element type
   */
  private getDesignStyles(design: any, elementType: string): any {
    const baseStyles = {
      fontFamily: design.typography?.body || 'Inter',
      color: design.colors?.[0] || '#1f2937'
    }

    switch (elementType) {
      case 'text':
        return {
          ...baseStyles,
          fontSize: design.theme === 'executive' ? 18 : 16
        }
      case 'shape':
        return {
          ...baseStyles,
          backgroundColor: design.colors?.[1] || '#f9fafb',
          borderColor: design.colors?.[2] || '#e5e7eb'
        }
      case 'metric_card':
        return {
          ...baseStyles,
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          borderRadius: 12
        }
      default:
        return baseStyles
    }
  }

  /**
   * Determine optimal slide count based on context
   */
  private getOptimalSlideCount(): number {
    let baseCount = 6 // Minimum professional presentation

    // Adjust based on context
    if (this.context.urgency === 'critical') baseCount = 4 // Shorter for urgency
    if (this.context.presentationStyle === 'executive') baseCount = 5 // Concise for executives
    if (this.context.presentationStyle === 'technical') baseCount = 8 // More detail for technical
    if (this.context.specificQuestions && this.context.specificQuestions.length > 3) baseCount += 2
    if (this.data.length > 1000) baseCount += 1 // More slides for complex data

    return Math.min(baseCount, 10) // Cap at 10 slides
  }
}

/**
 * Main function to generate custom slide structure
 */
export async function generateCustomSlideStructure(request: SlideGenerationRequest): Promise<CustomSlide[]> {
  const generator = new CustomSlideGenerator(request.context, request.data)
  return generator.generateCustomSlides(request)
}

export default CustomSlideGenerator