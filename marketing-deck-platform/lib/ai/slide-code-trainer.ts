/**
 * OpenAI Training Integration for Slide Code
 * Uses high-quality slide examples to train better slide generation
 */

import OpenAI from 'openai'
import { SlideCode, PresentationCode } from '@/lib/slide-code/slide-schema'
import { exportSlideToCode, exportPresentationToCode } from '@/lib/slide-code/slide-exporter'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export interface TrainingExample {
  input: {
    businessContext: any
    dataInsights: any[]
    requirements: any
  }
  output: {
    slideCode: SlideCode
    qualityScore: number
    userFeedback?: {
      rating: number
      improvements: string[]
    }
  }
  metadata: {
    templateQuality: 'basic' | 'professional' | 'executive' | 'mckinsey'
    industryContext: string
    audienceLevel: string
    designPrinciples: string[]
  }
}

export class SlideCodeTrainer {
  
  /**
   * Generate training examples from high-quality slide codes
   */
  static async generateTrainingExamples(slideDecks: any[]): Promise<TrainingExample[]> {
    const examples: TrainingExample[] = []
    
    for (const deck of slideDecks) {
      const presentationCode = exportPresentationToCode(deck)
      
      // Only use high-quality presentations for training
      if (presentationCode.aiContext?.qualityScore && presentationCode.aiContext.qualityScore >= 85) {
        for (const slide of presentationCode.slides) {
          // Only train on high-quality slides with good user feedback
          if (slide.aiTrainingContext?.templateQuality && 
              ['executive', 'mckinsey'].includes(slide.aiTrainingContext.templateQuality)) {
            
            examples.push({
              input: {
                businessContext: slide.businessContext || presentationCode.businessContext,
                dataInsights: this.extractDataInsights(slide),
                requirements: {
                  slideType: slide.businessContext?.slideType,
                  audience: slide.businessContext?.audience,
                  chartCount: slide.elements.filter(e => e.type === 'chart').length,
                  elementCount: slide.elements.length
                }
              },
              output: {
                slideCode: slide,
                qualityScore: presentationCode.aiContext?.qualityScore || 85,
                userFeedback: slide.aiTrainingContext?.userFeedback
              },
              metadata: {
                templateQuality: slide.aiTrainingContext.templateQuality,
                industryContext: slide.businessContext?.industry || 'general',
                audienceLevel: slide.businessContext?.audience || 'executive',
                designPrinciples: slide.aiTrainingContext.designPrinciples || []
              }
            })
          }
        }
      }
    }
    
    return examples
  }
  
  /**
   * Create OpenAI training prompt from slide examples
   */
  static createTrainingPrompt(examples: TrainingExample[]): string {
    const mcKinseyExamples = examples.filter(e => e.metadata.templateQuality === 'mckinsey')
    const executiveExamples = examples.filter(e => e.metadata.templateQuality === 'executive')
    
    return `You are a world-class slide generation AI trained on McKinsey and executive-level presentation examples.

TRAINING EXAMPLES - McKinsey Quality:
${mcKinseyExamples.slice(0, 3).map(example => `
Input Context: ${JSON.stringify(example.input.businessContext, null, 2)}
Data Insights: ${JSON.stringify(example.input.dataInsights, null, 2)}

Generated Slide Code:
${JSON.stringify(example.output.slideCode, null, 2)}

Quality Score: ${example.output.qualityScore}/100
Design Principles: ${example.metadata.designPrinciples.join(', ')}
User Rating: ${example.output.userFeedback?.rating || 'N/A'}

---`).join('\n')}

TRAINING EXAMPLES - Executive Quality:
${executiveExamples.slice(0, 2).map(example => `
Input Context: ${JSON.stringify(example.input.businessContext, null, 2)}
Generated Elements: ${example.output.slideCode.elements.length} elements
Quality Score: ${example.output.qualityScore}/100

---`).join('\n')}

KEY PATTERNS FROM HIGH-QUALITY SLIDES:

1. LAYOUT PATTERNS:
   - McKinsey slides use grid-based layouts with precise positioning
   - Executive slides emphasize visual hierarchy and whitespace
   - Strategic insights always have prominence through size and color

2. CHART CONFIGURATIONS:
   - Use Tremor charts with consultingStyle for McKinsey-level quality
   - Include calloutValue and annotations for key insights
   - Color palettes: blue for performance, emerald for growth, violet for innovation

3. TYPOGRAPHY HIERARCHY:
   - Title: 36-48px, bold, primary color
   - Subtitle: 20-24px, medium weight, secondary color  
   - Content: 16-18px, normal weight, readable contrast
   - Callouts: larger sizes with accent colors for emphasis

4. BUSINESS CONTEXT INTEGRATION:
   - Always map business metrics to appropriate chart types
   - Include confidence indicators for AI-generated insights
   - Add benchmark lines and annotations for strategic context

5. ELEMENT POSITIONING:
   - Use margin-based positioning: 60px margins minimum
   - Grid system: 12-column layout for consistency
   - Z-index layering: background (0), content (10), overlays (20)

When generating slides, follow these exact patterns and quality standards.`
  }
  
  /**
   * Generate slide using trained patterns
   */
  static async generateSlideWithTraining(
    businessContext: any,
    dataInsights: any[],
    requirements: any
  ): Promise<SlideCode> {
    
    // Get training examples for this context
    const trainingExamples = await this.getRelevantTrainingExamples(
      businessContext.industry, 
      businessContext.audience
    )
    
    const prompt = `${this.createTrainingPrompt(trainingExamples)}

NOW GENERATE A NEW SLIDE:

Business Context:
${JSON.stringify(businessContext, null, 2)}

Data Insights:
${JSON.stringify(dataInsights, null, 2)}

Requirements:
${JSON.stringify(requirements, null, 2)}

Generate a complete slide code following the McKinsey-quality patterns above. Include:
1. Professional layout with precise positioning
2. World-class Tremor charts with consultingStyle configurations
3. Strategic typography hierarchy
4. Business-relevant color schemes
5. Appropriate animations and interactivity

Return the complete SlideCode object in JSON format:`

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 2000
      })

      const slideCode = JSON.parse(response.choices[0].message.content || '{}')
      
      // Enhance with training context
      slideCode.aiTrainingContext = {
        templateQuality: 'executive',
        designPrinciples: [
          'grid-based-layout',
          'visual-hierarchy',
          'professional-typography',
          'strategic-color-usage',
          'data-driven-insights'
        ],
        performanceMetrics: {
          trainingExamplesUsed: trainingExamples.length,
          confidenceScore: 92,
          generationMethod: 'ai-training-enhanced'
        }
      }
      
      return slideCode
      
    } catch (error) {
      console.error('AI slide generation failed:', error)
      throw new Error('Failed to generate slide with AI training')
    }
  }
  
  /**
   * Update slide structure when user reorders/deletes slides
   */
  static async updateSlideStructureCode(
    originalSlides: SlideCode[],
    reorderedSlides: any[],
    deletedSlides: string[]
  ): Promise<SlideCode[]> {
    
    const updatedSlides: SlideCode[] = []
    
    for (const [newIndex, slide] of reorderedSlides.entries()) {
      const originalSlide = originalSlides.find(s => s.id === slide.id)
      
      if (originalSlide) {
        // Update slide number and dependencies
        const updatedSlide = {
          ...originalSlide,
          slideNumber: newIndex + 1,
          lastModified: new Date().toISOString(),
          metadata: {
            ...originalSlide.metadata,
            reorderedFromPosition: originalSlide.slideNumber,
            deletedSlidesImpact: deletedSlides.length
          }
        }
        
        // Update cross-references in elements (if any reference other slides)
        updatedSlide.elements = updatedSlide.elements.map(element => {
          if (element.content && typeof element.content === 'string') {
            // Update any slide references in content
            let updatedContent = element.content
            deletedSlides.forEach(deletedId => {
              updatedContent = updatedContent.replace(
                new RegExp(`slide ${deletedId}`, 'gi'),
                'previous analysis'
              )
            })
            return { ...element, content: updatedContent }
          }
          return element
        })
        
        updatedSlides.push(updatedSlide)
      }
    }
    
    return updatedSlides
  }
  
  // Helper methods
  private static extractDataInsights(slide: SlideCode): any[] {
    const insights = []
    
    // Extract from chart elements
    slide.elements.forEach(element => {
      if (element.type === 'chart' && element.chartConfig) {
        insights.push({
          type: 'chart_insight',
          chartType: element.chartConfig.type,
          businessMetric: element.chartConfig.businessMetric,
          dataPoints: element.chartConfig.data?.length || 0,
          insightLevel: element.chartConfig.insightLevel
        })
      }
      
      // Extract from text elements with business context
      if (element.type === 'text' && element.metadata?.businessRelevance === 'high') {
        insights.push({
          type: 'text_insight',
          content: element.content,
          priority: element.metadata.visualPriority,
          businessRelevance: element.metadata.businessRelevance
        })
      }
    })
    
    return insights
  }
  
  private static async getRelevantTrainingExamples(
    industry: string,
    audience: string
  ): Promise<TrainingExample[]> {
    // In production, this would query a database of training examples
    // For now, return mock examples based on industry/audience
    
    const mockExamples: TrainingExample[] = [
      {
        input: {
          businessContext: { industry, audience, slideType: 'insights' },
          dataInsights: [{ type: 'revenue_growth', confidence: 92 }],
          requirements: { chartCount: 1, elementCount: 4 }
        },
        output: {
          slideCode: {} as SlideCode, // Would be populated from actual training data
          qualityScore: 94
        },
        metadata: {
          templateQuality: 'mckinsey',
          industryContext: industry,
          audienceLevel: audience,
          designPrinciples: ['grid-based-layout', 'strategic-color-usage']
        }
      }
    ]
    
    return mockExamples.filter(example => 
      example.metadata.industryContext === industry &&
      example.metadata.audienceLevel === audience
    )
  }
}

// Export training utilities
export const generateSlideWithAITraining = SlideCodeTrainer.generateSlideWithTraining
export const updateSlideStructureCode = SlideCodeTrainer.updateSlideStructureCode
export const generateTrainingExamples = SlideCodeTrainer.generateTrainingExamples