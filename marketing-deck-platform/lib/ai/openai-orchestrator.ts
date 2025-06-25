// OpenAI Orchestrator - Intelligent Presentation Generation System
// Uses OpenAI to analyze context, orchestrate Python analysis, and create custom presentations

import OpenAI from 'openai'
import { executeAdvancedPythonAnalysis } from '@/lib/python/advanced-analysis-engine'
import { generateCustomSlideStructure } from '@/lib/slides/custom-slide-generator'
import { applyContextualDesign } from '@/lib/design/contextual-design-engine'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export interface UserContext {
  // From intake form - ALL context preserved
  businessContext?: string
  industry?: string
  companySize?: string
  targetAudience?: string
  presentationGoal?: string
  decisionMakers?: string[]
  timeframe?: string
  specificQuestions?: string[]
  keyMetrics?: string[]
  competitiveContext?: string
  brandGuidelines?: any
  presentationStyle?: 'executive' | 'technical' | 'sales' | 'board' | 'investor' | 'internal'
  urgency?: 'low' | 'medium' | 'high' | 'critical'
  dataType?: string
  expectedOutcomes?: string[]
  constraints?: string[]
  previousAnalyses?: string[]
  stakeholders?: string[]
  budgetImplications?: string
  regulatoryConsiderations?: string
  geographicScope?: string
  customerSegments?: string[]
  seasonality?: boolean
  marketConditions?: string
}

export interface AnalysisTask {
  id: string
  type: 'statistical' | 'ml' | 'visualization' | 'prediction' | 'correlation' | 'segmentation'
  description: string
  pythonCode: string
  expectedOutput: string
  priority: number
  dependencies: string[]
}

export interface FeedbackLoop {
  iteration: number
  aiInsights: string[]
  pythonResults: any
  qualityScore: number
  improvements: string[]
  humanFeedbackRequested: boolean
  nextActions: string[]
}

export interface CustomPresentation {
  narrativeStructure: 'problem-solution' | 'situation-complication-resolution' | 'before-after-bridge' | 'hero-journey' | 'data-story' | 'executive-briefing'
  designTheme: string
  colorPalette: string[]
  slides: CustomSlide[]
  transitionStyle: string
  interactivityLevel: 'static' | 'interactive' | 'immersive'
  confidenceLevel: number
  executiveSummary: string
  keyRecommendations: string[]
}

export interface CustomSlide {
  id: string
  type: string
  title: string
  subtitle?: string
  narrative: string
  content: any
  visualElements: any[]
  charts: any[]
  designSpecifications: any
  interactiveElements: any[]
  notes: string
  transitions: any
}

export class OpenAIOrchestrator {
  private context: UserContext
  private data: any[]
  private analysisHistory: FeedbackLoop[] = []
  private maxIterations: number = 5

  constructor(context: UserContext, data: any[]) {
    this.context = context
    this.data = data
  }

  /**
   * Main orchestration method - AI-driven analysis and presentation generation
   */
  async orchestrateIntelligentPresentation(): Promise<CustomPresentation> {
    console.log('🧠 OpenAI Orchestrator: Starting intelligent presentation generation...')
    
    // Step 1: AI analyzes context and plans approach
    const analysisStrategy = await this.planAnalysisStrategy()
    console.log('📋 Analysis strategy:', analysisStrategy)

    // Step 2: AI-guided iterative analysis with Python
    const refinedInsights = await this.iterativeAnalysisWithFeedback(analysisStrategy)
    console.log('🔄 Refined insights after feedback loops:', refinedInsights)

    // Step 3: AI creates custom narrative and structure
    const customNarrative = await this.generateCustomNarrative(refinedInsights)
    console.log('📖 Custom narrative structure:', customNarrative)

    // Step 4: AI designs presentation based on context
    const presentationDesign = await this.designContextualPresentation(customNarrative)
    console.log('🎨 Presentation design:', presentationDesign)

    // Step 5: Generate final custom slides
    const customSlides = await this.generateCustomSlides(presentationDesign, refinedInsights)
    console.log('📄 Generated custom slides:', customSlides.length)

    return {
      narrativeStructure: customNarrative.structure,
      designTheme: presentationDesign.theme,
      colorPalette: presentationDesign.colors,
      slides: customSlides,
      transitionStyle: presentationDesign.transitions,
      interactivityLevel: presentationDesign.interactivity,
      confidenceLevel: refinedInsights.finalConfidence,
      executiveSummary: refinedInsights.executiveSummary,
      keyRecommendations: refinedInsights.recommendations
    }
  }

  /**
   * Step 1: AI plans analysis strategy based on context
   */
  private async planAnalysisStrategy(): Promise<{tasks: AnalysisTask[], approach: string}> {
    const prompt = `
You are an expert data analyst and presentation strategist. Analyze this context and data to plan the optimal analysis approach.

CONTEXT (preserve ALL details):
Business Context: ${this.context.businessContext || 'Not specified'}
Industry: ${this.context.industry || 'Not specified'}
Company Size: ${this.context.companySize || 'Not specified'}
Target Audience: ${this.context.targetAudience || 'Not specified'}
Presentation Goal: ${this.context.presentationGoal || 'Not specified'}
Decision Makers: ${this.context.decisionMakers?.join(', ') || 'Not specified'}
Timeframe: ${this.context.timeframe || 'Not specified'}
Specific Questions: ${this.context.specificQuestions?.join('; ') || 'Not specified'}
Key Metrics: ${this.context.keyMetrics?.join(', ') || 'Not specified'}
Presentation Style: ${this.context.presentationStyle || 'Not specified'}
Urgency: ${this.context.urgency || 'Not specified'}
Data Type: ${this.context.dataType || 'Not specified'}
Expected Outcomes: ${this.context.expectedOutcomes?.join('; ') || 'Not specified'}

DATA SAMPLE: ${JSON.stringify(this.data.slice(0, 3))}
DATA SIZE: ${this.data.length} rows
DATA COLUMNS: ${Object.keys(this.data[0] || {}).join(', ')}

Based on this context, create a comprehensive analysis strategy. Return a JSON object with:
{
  "approach": "Description of overall analytical approach",
  "tasks": [
    {
      "id": "unique_id",
      "type": "statistical|ml|visualization|prediction|correlation|segmentation",
      "description": "What this analysis will discover",
      "pythonCode": "Python code to execute this analysis",
      "expectedOutput": "What we expect to learn",
      "priority": 1-10,
      "dependencies": ["task_ids this depends on"]
    }
  ],
  "narrativeDirection": "What story this analysis will tell",
  "presentationStyle": "Recommended presentation approach based on context"
}

Focus on:
1. The specific business questions from the context
2. The target audience and decision makers
3. The timeframe and urgency
4. The presentation goal and expected outcomes
5. Industry-specific considerations
`

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3
    })

    return JSON.parse(response.choices[0].message.content || '{}')
  }

  /**
   * Step 2: Iterative analysis with AI feedback loops
   */
  private async iterativeAnalysisWithFeedback(strategy: any): Promise<any> {
    let currentInsights: any = { results: [], confidence: 0 }
    
    for (let iteration = 0; iteration < this.maxIterations; iteration++) {
      console.log(`🔄 Iteration ${iteration + 1}/${this.maxIterations}`)
      
      // Execute Python analyses
      const pythonResults = await this.executePythonTasks(strategy.tasks, currentInsights)
      
      // AI reviews results and provides feedback
      const aiReview = await this.aiReviewAndFeedback(pythonResults, currentInsights, iteration)
      
      // Update insights based on feedback
      currentInsights = await this.incorporateFeedback(pythonResults, aiReview)
      
      // Store feedback loop
      this.analysisHistory.push({
        iteration: iteration + 1,
        aiInsights: aiReview.insights,
        pythonResults: pythonResults,
        qualityScore: aiReview.qualityScore,
        improvements: aiReview.improvements,
        humanFeedbackRequested: aiReview.requestHumanInput,
        nextActions: aiReview.nextActions
      })

      // Check if we're satisfied with the results
      if (aiReview.qualityScore >= 85 && !aiReview.requestHumanInput) {
        console.log(`✅ Analysis converged after ${iteration + 1} iterations`)
        break
      }
      
      // If human feedback is needed, we would pause here for input
      if (aiReview.requestHumanInput) {
        console.log('👤 Human feedback requested - would pause for input in full implementation')
      }
    }

    return currentInsights
  }

  /**
   * Execute Python analysis tasks
   */
  private async executePythonTasks(tasks: AnalysisTask[], previousInsights: any): Promise<any> {
    const results: any = {}
    
    // Sort tasks by priority and dependencies
    const sortedTasks = tasks.sort((a, b) => b.priority - a.priority)
    
    for (const task of sortedTasks) {
      try {
        console.log(`🐍 Executing Python task: ${task.description}`)
        
        // Execute the Python analysis
        const pythonResult = await executeAdvancedPythonAnalysis({
          code: task.pythonCode,
          data: this.data,
          context: this.context,
          previousResults: results,
          previousInsights: previousInsights
        })
        
        results[task.id] = pythonResult
        console.log(`✅ Task ${task.id} completed`)
      } catch (error) {
        console.error(`❌ Task ${task.id} failed:`, error)
        results[task.id] = { error: String(error), fallback: true }
      }
    }
    
    return results
  }

  /**
   * AI reviews Python results and provides feedback
   */
  private async aiReviewAndFeedback(pythonResults: any, currentInsights: any, iteration: number): Promise<any> {
    const prompt = `
You are reviewing analysis results for iteration ${iteration + 1}. Provide comprehensive feedback.

ORIGINAL CONTEXT (ALL PRESERVED):
${JSON.stringify(this.context, null, 2)}

PYTHON RESULTS:
${JSON.stringify(pythonResults, null, 2)}

CURRENT INSIGHTS:
${JSON.stringify(currentInsights, null, 2)}

ANALYSIS HISTORY:
${JSON.stringify(this.analysisHistory, null, 2)}

Evaluate the results and provide feedback. Return JSON:
{
  "qualityScore": 0-100,
  "insights": ["Key insights discovered"],
  "improvements": ["What could be improved"],
  "requestHumanInput": boolean,
  "nextActions": ["What to do in next iteration"],
  "businessImpact": "How this impacts the business context",
  "recommendationStrength": "How confident we are in recommendations",
  "missingAnalyses": ["What additional analyses would help"],
  "contextAlignment": "How well this addresses the original context"
}

Focus on:
1. Does this answer the specific business questions?
2. Are we addressing the target audience needs?
3. Do we have enough insight for the presentation goal?
4. Is the urgency being respected?
5. Are we missing any key analyses for this industry/context?
`

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3
    })

    return JSON.parse(response.choices[0].message.content || '{}')
  }

  /**
   * Incorporate AI feedback into insights
   */
  private async incorporateFeedback(pythonResults: any, aiReview: any): Promise<any> {
    return {
      results: pythonResults,
      insights: aiReview.insights,
      businessImpact: aiReview.businessImpact,
      confidence: aiReview.qualityScore,
      recommendations: aiReview.nextActions,
      finalConfidence: aiReview.qualityScore,
      executiveSummary: this.generateExecutiveSummary(aiReview, pythonResults)
    }
  }

  /**
   * Step 3: Generate custom narrative based on context and insights
   */
  private async generateCustomNarrative(insights: any): Promise<any> {
    const prompt = `
Create a custom narrative structure for this presentation based on the context and insights.

FULL CONTEXT:
${JSON.stringify(this.context, null, 2)}

INSIGHTS:
${JSON.stringify(insights, null, 2)}

Create a narrative that is perfectly tailored to:
- The target audience (${this.context.targetAudience})
- The presentation goal (${this.context.presentationGoal})
- The decision makers (${this.context.decisionMakers?.join(', ')})
- The urgency level (${this.context.urgency})
- The industry context (${this.context.industry})

Return JSON:
{
  "structure": "problem-solution|situation-complication-resolution|before-after-bridge|hero-journey|data-story|executive-briefing",
  "openingHook": "Compelling opening that grabs attention",
  "narrativeArc": [
    {
      "section": "section name",
      "purpose": "why this section exists",
      "keyMessage": "main message",
      "evidenceNeeded": ["what data/charts support this"],
      "audienceConnect": "how this resonates with target audience"
    }
  ],
  "closingCall": "Strong call to action",
  "emotionalTone": "confident|urgent|optimistic|analytical|inspiring",
  "rhetoricalStrategy": "How to persuade this specific audience"
}
`

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7
    })

    return JSON.parse(response.choices[0].message.content || '{}')
  }

  /**
   * Step 4: Design contextual presentation
   */
  private async designContextualPresentation(narrative: any): Promise<any> {
    const prompt = `
Design a presentation that perfectly matches the context and narrative.

CONTEXT:
${JSON.stringify(this.context, null, 2)}

NARRATIVE:
${JSON.stringify(narrative, null, 2)}

Create a design that considers:
- Industry: ${this.context.industry}
- Audience: ${this.context.targetAudience}
- Style: ${this.context.presentationStyle}
- Brand guidelines: ${JSON.stringify(this.context.brandGuidelines)}
- Urgency: ${this.context.urgency}

Return JSON:
{
  "theme": "professional|modern|executive|technical|creative|corporate",
  "colors": ["primary", "secondary", "accent", "background"],
  "typography": {
    "headers": "font choice for headers",
    "body": "font choice for body text",
    "data": "font choice for data/numbers"
  },
  "layout": "grid|freeform|structured|magazine|dashboard",
  "visualStyle": "minimalist|rich|data-heavy|story-driven",
  "chartStyle": "technical|executive|modern|traditional",
  "transitions": "subtle|dynamic|none",
  "interactivity": "static|interactive|immersive",
  "brandAlignment": "how this aligns with brand guidelines"
}
`

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.5
    })

    return JSON.parse(response.choices[0].message.content || '{}')
  }

  /**
   * Step 5: Generate custom slides
   */
  private async generateCustomSlides(design: any, insights: any): Promise<CustomSlide[]> {
    const prompt = `
Generate custom slides that perfectly execute this presentation.

FULL CONTEXT:
${JSON.stringify(this.context, null, 2)}

DESIGN:
${JSON.stringify(design, null, 2)}

INSIGHTS:
${JSON.stringify(insights, null, 2)}

Create slides that:
1. Address every specific question from the context
2. Use the exact data we have: ${Object.keys(this.data[0] || {}).join(', ')}
3. Follow the design specifications
4. Tell a compelling story for ${this.context.targetAudience}
5. Drive toward ${this.context.presentationGoal}

Return JSON array of slides:
[
  {
    "id": "unique_id",
    "type": "title|executive_summary|problem_statement|analysis|insight|recommendation|next_steps",
    "title": "Slide title",
    "subtitle": "Slide subtitle",
    "narrative": "The story this slide tells",
    "content": {
      "mainMessage": "Key message",
      "supportingPoints": ["bullet points"],
      "dataStory": "How data supports this message"
    },
    "visualElements": [
      {
        "type": "text|shape|icon",
        "content": "element content",
        "style": "styling specifications",
        "position": {"x": 0, "y": 0, "width": 100, "height": 50}
      }
    ],
    "charts": [
      {
        "type": "bar|line|pie|scatter|heatmap",
        "title": "chart title", 
        "data": "reference to specific data",
        "insights": ["what the chart reveals"],
        "style": "chart styling based on design"
      }
    ],
    "designSpecifications": {
      "backgroundColor": "color",
      "textColor": "color",
      "accentColor": "color",
      "layout": "layout type"
    },
    "notes": "Speaker notes for this slide"
  }
]

Make ${Math.min(8, Math.max(4, Math.ceil(this.data.length / 100)))} slides total.
`

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.6,
      max_tokens: 4000
    })

    const result = JSON.parse(response.choices[0].message.content || '{"slides": []}')
    return result.slides || []
  }

  /**
   * Generate executive summary from analysis
   */
  private generateExecutiveSummary(aiReview: any, pythonResults: any): string {
    const keyInsights = aiReview.insights?.slice(0, 3) || []
    const businessImpact = aiReview.businessImpact || 'Significant insights discovered'
    
    return `${businessImpact}. Key findings: ${keyInsights.join('; ')}. Confidence: ${aiReview.qualityScore}%.`
  }
}

export default OpenAIOrchestrator