/**
 * OpenAI Fallback System
 * Provides mock responses when OpenAI API is unavailable (quota exceeded, billing issues, etc.)
 */

export interface MockInsight {
  id: string
  type: 'trend' | 'correlation' | 'anomaly' | 'opportunity'
  title: string
  description: string
  businessImplication: string
  actionableRecommendation: string
  confidence: number
  priority: number
  impact: 'low' | 'medium' | 'high'
  evidence: {
    dataPoints: string[]
    statisticalSignificance: number
  }
}

export interface MockAnalysisResult {
  insights: MockInsight[]
  summary: string
  keyFindings: string[]
  executiveSummary: string
  metadata: {
    noveltyScore: number
    analysisDepth: string
    confidence: number
  }
}

export class OpenAIFallback {
  static generateMockInsights(data: any[]): MockAnalysisResult {
    const sampleSize = data?.length || 100
    const mockInsights: MockInsight[] = [
      {
        id: 'insight_1',
        type: 'trend',
        title: 'Positive Growth Trajectory Identified',
        description: `Analysis of ${sampleSize} data points reveals a consistent upward trend over the observation period.`,
        businessImplication: 'Current strategies are showing positive results and should be maintained or expanded.',
        actionableRecommendation: 'Continue current initiatives while exploring opportunities to scale successful programs.',
        confidence: 87,
        priority: 8,
        impact: 'high',
        evidence: {
          dataPoints: ['Month-over-month growth: +12%', 'Trend consistency: 85%', 'Data quality: High'],
          statisticalSignificance: 0.95
        }
      },
      {
        id: 'insight_2',
        type: 'opportunity',
        title: 'Market Expansion Opportunity Detected',
        description: 'Data patterns suggest untapped potential in emerging market segments.',
        businessImplication: 'Significant revenue growth opportunity available with proper resource allocation.',
        actionableRecommendation: 'Develop targeted strategy for identified market segments within next quarter.',
        confidence: 78,
        priority: 7,
        impact: 'high',
        evidence: {
          dataPoints: ['Market gap identified: 23%', 'Competitive advantage: Strong', 'Resource requirement: Moderate'],
          statisticalSignificance: 0.82
        }
      },
      {
        id: 'insight_3',
        type: 'correlation',
        title: 'Key Performance Drivers Identified',
        description: 'Strong correlation found between customer engagement metrics and revenue outcomes.',
        businessImplication: 'Focus on engagement initiatives will directly impact bottom-line results.',
        actionableRecommendation: 'Implement engagement optimization program with measurable KPIs.',
        confidence: 92,
        priority: 9,
        impact: 'high',
        evidence: {
          dataPoints: ['Correlation coefficient: 0.84', 'Statistical significance: p<0.01', 'Sample size: Sufficient'],
          statisticalSignificance: 0.99
        }
      }
    ]

    return {
      insights: mockInsights,
      summary: `Comprehensive analysis of ${sampleSize} data points reveals strong positive indicators across multiple business metrics. Key trends show sustained growth with clear opportunities for strategic expansion.`,
      keyFindings: [
        'Consistent positive growth trajectory maintained',
        'Emerging market opportunities identified',
        'Strong correlation between engagement and revenue',
        'High-confidence actionable recommendations available'
      ],
      executiveSummary: 'Analysis indicates strong business performance with clear pathways for continued growth and expansion.',
      metadata: {
        noveltyScore: 75,
        analysisDepth: 'comprehensive',
        confidence: 85
      }
    }
  }

  static generateMockSlideStructure(context?: any): any[] {
    const companyName = context?.companyName || 'Your Company'
    const industry = context?.industry || 'Technology'
    
    return [
      {
        id: 'slide_title',
        type: 'title',
        title: `${companyName} Business Intelligence Report`,
        subtitle: `${industry} Market Analysis & Strategic Insights`,
        content: {
          summary: 'AI-powered analysis of business performance and market opportunities',
          confidence: 85,
          theme: 'Strategic Growth Analysis',
          emotionalTone: 'confident'
        },
        customization: {
          visualStyle: 'executive',
          innovationLevel: 'advanced',
          layout: 'title_slide_executive'
        }
      },
      {
        id: 'slide_overview',
        type: 'data_overview',
        title: 'Executive Summary',
        content: {
          summary: 'Comprehensive analysis reveals strong positive indicators across key business metrics',
          keyMetrics: [
            { name: 'Growth Rate', value: '12%', change: '+3% MoM' },
            { name: 'Market Position', value: 'Strong', change: 'Improving' },
            { name: 'Opportunity Score', value: '78/100', change: '+5 points' },
            { name: 'Risk Level', value: 'Low', change: 'Stable' }
          ],
          recommendations: [
            'Maintain current growth trajectory',
            'Explore identified market opportunities', 
            'Focus on engagement optimization'
          ],
          confidence: 87
        },
        keyTakeaways: [
          'Strong business performance indicators',
          'Clear growth opportunities identified',
          'Low risk profile maintained'
        ]
      },
      {
        id: 'slide_insights',
        type: 'insight',
        title: 'Key Strategic Insights',
        content: {
          summary: 'Data analysis reveals critical success factors and growth opportunities',
          businessImplication: 'Current strategies are effective with clear expansion potential',
          actionableRecommendation: 'Implement focused growth initiatives in identified areas',
          evidence: {
            dataPoints: ['Growth consistency: 85%', 'Market opportunity: 23%', 'Performance correlation: 0.84'],
            statisticalSignificance: 0.95
          },
          confidence: 92
        },
        charts: [{
          type: 'trend',
          title: 'Business Performance Trend',
          message: 'Consistent upward trajectory across key metrics',
          config: { 
            showTrend: true,
            highlightGrowth: true,
            timeframe: 'last_12_months'
          }
        }],
        keyTakeaways: [
          'Sustained positive growth trajectory',
          'Strong performance-outcome correlations',
          'Market expansion opportunities available'
        ]
      },
      {
        id: 'slide_recommendations',
        type: 'recommendations',
        title: 'Strategic Recommendations',
        content: {
          summary: 'Data-driven recommendations for continued growth and market expansion',
          recommendations: [
            {
              title: 'Maintain Growth Momentum',
              description: 'Continue current successful strategies while monitoring key performance indicators',
              priority: 'High',
              timeline: 'Ongoing'
            },
            {
              title: 'Market Expansion Initiative',
              description: 'Develop targeted approach for identified market segments',
              priority: 'High', 
              timeline: 'Next Quarter'
            },
            {
              title: 'Engagement Optimization',
              description: 'Implement data-driven engagement programs to maximize revenue correlation',
              priority: 'Medium',
              timeline: '6 Months'
            }
          ],
          nextSteps: [
            'Finalize market expansion strategy',
            'Allocate resources for growth initiatives',
            'Establish measurement framework'
          ],
          confidence: 89
        },
        keyTakeaways: [
          'Clear actionable recommendations available',
          'High-confidence strategic pathways identified',
          'Structured implementation plan provided'
        ]
      }
    ]
  }

  static async checkOpenAIAvailability(): Promise<boolean> {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.log('🚫 No OpenAI API key configured')
      return false
    }

    try {
      // Test with a minimal completion to check actual usage availability
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1
        })
      })

      if (response.ok) {
        console.log('✅ OpenAI API available and functional')
        return true
      } else {
        const error = await response.text()
        console.log('❌ OpenAI API unavailable:', response.status, error)
        
        // Parse error to determine if it's quota vs other issues
        try {
          const errorData = JSON.parse(error)
          if (errorData.error?.code === 'insufficient_quota') {
            console.log('💳 OpenAI quota exceeded - using fallback mode')
          } else if (errorData.error?.code === 'rate_limit_exceeded') {
            console.log('⏰ OpenAI rate limited - using fallback mode')
          }
        } catch (e) {
          // Error parsing, continue with fallback
        }
        
        return false
      }
    } catch (error) {
      console.log('❌ OpenAI API connection failed:', error)
      return false
    }
  }

  static createFallbackResponse(data: any[], context?: any) {
    console.log('🎭 Using OpenAI fallback mode - generating mock analysis...')
    
    const mockAnalysis = this.generateMockInsights(data)
    const slideStructure = this.generateMockSlideStructure(context)
    
    return {
      success: true,
      fallbackMode: true,
      data: {
        summary: {
          summary: {
            totalRows: data?.length || 100,
            totalColumns: Object.keys(data?.[0] || {}).length || 5,
            dataQuality: { score: 85 }
          }
        },
        insights: mockAnalysis,
        chartRecommendations: {
          recommendations: [
            {
              id: 'chart_1',
              chartType: 'line',
              title: 'Performance Trend',
              description: 'Business performance over time',
              configuration: { responsive: true, showTrend: true }
            },
            {
              id: 'chart_2', 
              chartType: 'bar',
              title: 'Key Metrics Comparison',
              description: 'Comparative analysis of key business metrics',
              configuration: { responsive: true, groupBy: 'category' }
            }
          ],
          optimalCharts: ['chart_1', 'chart_2'],
          metadata: { dataCompatibilityScore: 85 }
        },
        executiveSummary: {
          id: 'exec_summary',
          summary: mockAnalysis.executiveSummary,
          keyFindings: mockAnalysis.keyFindings,
          keyMetrics: [
            { name: 'Growth Rate', value: '12%', change: '+3% MoM' },
            { name: 'Confidence Score', value: '85%', change: 'High' }
          ],
          recommendations: [
            { title: 'Continue Growth Strategy', description: 'Maintain current positive trajectory' },
            { title: 'Explore Opportunities', description: 'Investigate identified market segments' }
          ],
          nextSteps: ['Implement recommendations', 'Monitor progress', 'Adjust strategy as needed'],
          riskAssessment: { risks: [], severity: 'low' },
          confidence: 85,
          wordCount: 150,
          executiveScore: 0,
          urgency: 'medium' as const
        },
        narrative: null,
        designInnovation: null,
        slideStructure,
        visualExcellence: { theme: 'executive', quality: 'high' },
        customizations: {
          visualStyle: 'executive',
          innovationLevel: 'standard',
          chartTypes: ['line', 'bar', 'pie'],
          colorScheme: ['#2563eb', '#dc2626', '#16a34a'],
          layoutTypes: ['standard', 'grid', 'modern'],
          animationStyles: ['fadeIn', 'slideIn'],
          interactivityFeatures: ['hover', 'click'],
          narrativeStructure: null,
          designFeatures: [],
          renderingCapabilities: {
            charts: ['line', 'bar', 'pie'],
            layouts: ['standard', 'grid'],
            animations: true,
            interactivity: true,
            customColors: true,
            narrativeFlow: false,
            designInnovation: false
          }
        },
        renderingInstructions: {
          renderingEngine: 'fallback-renderer',
          version: '1.0',
          mode: 'mock',
          message: 'Generated using fallback mode due to OpenAI unavailability'
        }
      },
      metadata: {
        processingTimeMs: 100,
        dataQualityScore: 85,
        totalInsights: 3,
        highPriorityCharts: 2,
        confidence: 85,
        innovationScore: 0,
        narrativeEngagement: 0,
        designComplexity: 0,
        fallbackMode: true,
        reason: 'OpenAI API quota exceeded or unavailable'
      }
    }
  }
}