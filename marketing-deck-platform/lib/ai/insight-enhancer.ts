import { OpenAI } from 'openai'

export interface EnhancedInsight {
  headline: string
  impact: string
  evidence: string[]
  action: string
  executiveAction?: {
    action: string
    owner: string
    timeline: string
  }
  implementation?: {
    steps: string[]
    resources: string[]
    timeline: string
  }
  riskMitigation?: {
    risks: string[]
    mitigations: string[]
  }
  score?: {
    impact: number
    actionability: number
    clarity: number
    relevance: number
    total: number
  }
}

export class InsightEnhancer {
  private openai: OpenAI
  
  constructor() {
    this.openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: false
    })
  }
  
  async enhanceInsights(rawInsights: any[], data: any, context: any): Promise<EnhancedInsight[]> {
    try {
      // First, score existing insights
      const scoredInsights = await this.scoreInsights(rawInsights, context)
      
      // Take top 5 insights for enhancement
      const topInsights = scoredInsights.slice(0, 5)
      
      // Enhance each insight
      const enhancedInsights = await Promise.all(
        topInsights.map(insight => this.enhanceInsight(insight, data, context))
      )
      
      // Add executive actions
      const actionableInsights = enhancedInsights.map(insight => 
        this.addExecutiveActions(insight, context)
      )
      
      return actionableInsights
    } catch (error) {
      console.error('Error enhancing insights:', error)
      // Fallback to basic insights if AI enhancement fails
      return this.createFallbackInsights(rawInsights, data, context)
    }
  }
  
  private async scoreInsights(insights: any[], context: any) {
    try {
      const scoringPrompt = `
      Score these insights for a ${context.audience} audience on a scale of 0-10:
      1. Business Impact (0-10) - How much financial/strategic impact does this have?
      2. Actionability (0-10) - How clear and specific are the recommended actions?
      3. Clarity (0-10) - How easy is this to understand and communicate?
      4. Strategic Relevance (0-10) - How relevant is this to the business goals?
      
      Insights to score:
      ${JSON.stringify(insights.slice(0, 10))}
      
      Return as JSON array: [{"insight": "original insight text", "scores": {"impact": X, "actionability": X, "clarity": X, "relevance": X}, "total": X}]
      `
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [{ role: "user", content: scoringPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.3
      })
      
      const result = JSON.parse(response.choices[0].message.content || '{"insights": []}')
      const scores = result.insights || result || []
      
      return Array.isArray(scores) ? 
        scores.sort((a, b) => (b.total || 0) - (a.total || 0)) :
        insights.map(insight => ({ insight: insight.text || insight, scores: { impact: 5, actionability: 5, clarity: 5, relevance: 5 }, total: 20 }))
        
    } catch (error) {
      console.error('Error scoring insights:', error)
      // Return insights with default scores
      return insights.map(insight => ({
        insight: insight.text || insight,
        scores: { impact: 5, actionability: 5, clarity: 5, relevance: 5 },
        total: 20
      }))
    }
  }
  
  private async enhanceInsight(insight: any, data: any, context: any): Promise<EnhancedInsight> {
    try {
      const enhancementPrompt = `
      Transform this insight for maximum executive impact:
      
      Original: ${insight.insight || insight.text || insight}
      
      Requirements:
      1. Start with the business outcome (not the data observation)
      2. Quantify the impact in $ or % when possible
      3. Make it specific to ${context.industry || 'the business'}
      4. Add urgency if appropriate
      5. Keep headline under 15 words
      
      Example transformation:
      Weak: "Sales have increased by 23% in Q3"
      Strong: "Capture additional $4.2M revenue by expanding Q3's growth strategy"
      
      Context:
      - Industry: ${context.industry || 'general'}
      - Audience: ${context.audience || 'executives'}
      - Goal: ${context.goal || 'improve performance'}
      
      Return as JSON: {
        "headline": "Action-oriented headline",
        "impact": "Specific quantified impact",
        "evidence": ["Data point 1", "Data point 2", "Data point 3"],
        "action": "What to do next"
      }
      `
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [{ role: "user", content: enhancementPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.7
      })
      
      const enhanced = JSON.parse(response.choices[0].message.content || '{}')
      
      return {
        headline: enhanced.headline || "Insight requires analysis",
        impact: enhanced.impact || "Impact to be determined",
        evidence: enhanced.evidence || ["Data analysis pending"],
        action: enhanced.action || "Further investigation needed",
        score: insight.scores
      }
      
    } catch (error) {
      console.error('Error enhancing individual insight:', error)
      return this.createFallbackInsight(insight, context)
    }
  }
  
  private addExecutiveActions(insight: EnhancedInsight, context: any): EnhancedInsight {
    // Generate C-suite level actions based on insight type
    const insightType = this.classifyInsight(insight)
    
    const actions = {
      growth: {
        action: "Allocate resources to scale this initiative",
        owner: "Chief Growth Officer",
        timeline: "Within 30 days"
      },
      cost: {
        action: "Form task force to capture these savings",
        owner: "Chief Operating Officer", 
        timeline: "Within 2 weeks"
      },
      risk: {
        action: "Implement controls immediately",
        owner: "Chief Risk Officer",
        timeline: "Within 1 week"
      },
      opportunity: {
        action: "Fast-track pilot program",
        owner: "Chief Strategy Officer",
        timeline: "Within 45 days"
      },
      default: {
        action: "Conduct detailed analysis",
        owner: "Chief Analytics Officer",
        timeline: "Within 3 weeks"
      }
    }
    
    const executiveAction = actions[insightType] || actions.default
    
    return {
      ...insight,
      executiveAction,
      implementation: this.generateImplementationPlan(insight, context),
      riskMitigation: this.identifyRisks(insight, context)
    }
  }
  
  private classifyInsight(insight: EnhancedInsight): string {
    const headline = insight.headline.toLowerCase()
    
    if (headline.includes('revenue') || headline.includes('growth') || headline.includes('expand')) {
      return 'growth'
    }
    if (headline.includes('cost') || headline.includes('savings') || headline.includes('efficiency')) {
      return 'cost'
    }
    if (headline.includes('risk') || headline.includes('threat') || headline.includes('danger')) {
      return 'risk'
    }
    if (headline.includes('opportunity') || headline.includes('capture') || headline.includes('potential')) {
      return 'opportunity'
    }
    
    return 'default'
  }
  
  private generateImplementationPlan(insight: EnhancedInsight, context: any) {
    const insightType = this.classifyInsight(insight)
    
    const plans = {
      growth: {
        steps: [
          "Conduct market research validation",
          "Develop resource allocation plan", 
          "Launch pilot program",
          "Scale based on results"
        ],
        resources: ["Marketing team", "Product development", "Sales support"],
        timeline: "3-6 months"
      },
      cost: {
        steps: [
          "Audit current processes",
          "Identify optimization opportunities",
          "Implement efficiency measures",
          "Monitor and adjust"
        ],
        resources: ["Operations team", "Process improvement specialist", "Technology support"],
        timeline: "2-4 months"
      },
      risk: {
        steps: [
          "Assess risk severity",
          "Develop mitigation strategy",
          "Implement controls",
          "Monitor effectiveness"
        ],
        resources: ["Risk management team", "Compliance officer", "Legal support"],
        timeline: "1-2 months"
      },
      default: {
        steps: [
          "Gather additional data",
          "Conduct stakeholder interviews",
          "Develop action plan",
          "Begin implementation"
        ],
        resources: ["Analytics team", "Subject matter experts", "Project manager"],
        timeline: "1-3 months"
      }
    }
    
    return plans[insightType] || plans.default
  }
  
  private identifyRisks(insight: EnhancedInsight, context: any) {
    const insightType = this.classifyInsight(insight)
    
    const riskProfiles = {
      growth: {
        risks: [
          "Market conditions may change",
          "Resource constraints",
          "Competitive response"
        ],
        mitigations: [
          "Conduct scenario planning",
          "Secure adequate funding",
          "Monitor competitive landscape"
        ]
      },
      cost: {
        risks: [
          "Implementation complexity",
          "Employee resistance",
          "Unintended consequences"
        ],
        mitigations: [
          "Phase implementation carefully",
          "Communicate benefits clearly",
          "Monitor key metrics closely"
        ]
      },
      risk: {
        risks: [
          "Incomplete risk assessment",
          "Implementation delays",
          "Cost of mitigation"
        ],
        mitigations: [
          "Conduct thorough analysis",
          "Prioritize critical areas",
          "Balance cost vs. benefit"
        ]
      },
      default: {
        risks: [
          "Data quality issues",
          "Stakeholder alignment",
          "Resource availability"
        ],
        mitigations: [
          "Validate data sources",
          "Engage stakeholders early",
          "Secure necessary resources"
        ]
      }
    }
    
    return riskProfiles[insightType] || riskProfiles.default
  }
  
  private createFallbackInsights(rawInsights: any[], data: any, context: any): EnhancedInsight[] {
    // Create basic insights when AI enhancement fails
    return rawInsights.slice(0, 5).map((insight, index) => 
      this.createFallbackInsight(insight, context)
    )
  }
  
  private createFallbackInsight(insight: any, context: any): EnhancedInsight {
    const text = insight.text || insight.insight || insight.toString()
    
    return {
      headline: `Analyze ${text.slice(0, 50)}...`,
      impact: "Potential business impact identified",
      evidence: ["Data analysis required", "Further investigation needed"],
      action: "Conduct detailed analysis",
      executiveAction: {
        action: "Review findings with team",
        owner: "Department Head",
        timeline: "Within 2 weeks"
      },
      implementation: {
        steps: ["Gather more data", "Analyze findings", "Develop recommendations"],
        resources: ["Analytics team", "Subject matter experts"],
        timeline: "2-4 weeks"
      },
      riskMitigation: {
        risks: ["Incomplete analysis", "Resource constraints"],
        mitigations: ["Validate assumptions", "Secure adequate resources"]
      },
      score: {
        impact: 5,
        actionability: 5,
        clarity: 5,
        relevance: 5,
        total: 20
      }
    }
  }
}