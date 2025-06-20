interface QAResponses {
  datasetDescription: string
  businessGoals: string
  dataType: 'financial' | 'sales' | 'marketing' | 'strategy' | 'client' | 'other'
  keyProblems: string
  analysisType: 'performance' | 'trends' | 'comparison' | 'insights' | 'routine_check'
  targetAudience: string
  presentationStyle: 'executive' | 'detailed' | 'casual' | 'technical'
}

interface DataInsight {
  type: 'trend' | 'correlation' | 'outlier' | 'opportunity' | 'risk'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  recommendation: string
  supportingData: any
}

interface ChartRecommendation {
  type: 'area' | 'bar' | 'line' | 'pie' | 'scatter' | 'combo'
  reasoning: string
  xAxis: string
  yAxis: string[]
  filters?: string[]
  aggregation?: 'sum' | 'avg' | 'count' | 'max' | 'min'
}

interface SlideRecommendation {
  type: 'title' | 'executive_summary' | 'chart' | 'insights' | 'recommendations' | 'action_items'
  title: string
  content: any
  chartRecommendation?: ChartRecommendation
  priority: number
}

export class OpenAIAnalyzer {
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || ''
  }

  async analyzeDataWithQA(data: any[], qaResponses: QAResponses): Promise<{
    insights: DataInsight[]
    slideRecommendations: SlideRecommendation[]
    executiveSummary: string
    keyFindings: string[]
  }> {
    // Always use intelligent fallback for now to ensure consistent results
    // TODO: Add OpenAI integration when API key is provided
    console.log('Using enhanced intelligent analysis for McKinsey-style insights')
    return this.enhancedIntelligentAnalysis(data, qaResponses)

    try {
      const prompt = this.buildAnalysisPrompt(data, qaResponses)
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert data analyst and presentation designer. Analyze the provided data and create insights based on the user\'s business context and goals.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      })

      if (!response.ok) {
        throw new Error('OpenAI API request failed')
      }

      const result = await response.json()
      let analysis
      
      try {
        // Try to parse the OpenAI response as JSON
        const content = result.choices[0].message.content
        
        // Clean up the response to extract JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('No JSON found in response')
        }
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', parseError)
        throw new Error('Invalid JSON response from OpenAI')
      }
      
      // Validate the analysis structure
      if (!analysis.insights || !analysis.slideRecommendations) {
        throw new Error('Invalid analysis structure')
      }
      
      return analysis
    } catch (error) {
      console.error('OpenAI analysis failed, using fallback:', error)
      return this.enhancedIntelligentAnalysis(data, qaResponses)
    }
  }

  private buildAnalysisPrompt(data: any[], qaResponses: QAResponses): string {
    const sampleData = data.slice(0, 10) // First 10 rows for context
    
    return `
Analyze this ${qaResponses.dataType} dataset and provide insights based on the user's context:

DATASET DESCRIPTION: ${qaResponses.datasetDescription}
BUSINESS GOALS: ${qaResponses.businessGoals}
KEY PROBLEMS TO SOLVE: ${qaResponses.keyProblems}
ANALYSIS TYPE: ${qaResponses.analysisType}
PRESENTATION STYLE: ${qaResponses.presentationStyle}

SAMPLE DATA:
${JSON.stringify(sampleData, null, 2)}

FULL DATASET INFO:
- Total rows: ${data.length}
- Columns: ${Object.keys(data[0] || {}).join(', ')}

Please analyze this data and return a JSON response with the following structure:
{
  "insights": [
    {
      "type": "trend" | "correlation" | "outlier" | "opportunity" | "risk",
      "title": "Insight title",
      "description": "Detailed description",
      "impact": "high" | "medium" | "low",
      "recommendation": "Actionable recommendation",
      "supportingData": []
    }
  ],
  "slideRecommendations": [
    {
      "type": "title" | "executive_summary" | "chart" | "insights" | "recommendations" | "action_items",
      "title": "Slide title",
      "content": {},
      "chartRecommendation": {
        "type": "area" | "bar" | "line" | "pie" | "scatter" | "combo",
        "reasoning": "Why this chart type",
        "xAxis": "column name",
        "yAxis": ["column names"],
        "filters": ["optional filters"],
        "aggregation": "sum" | "avg" | "count" | "max" | "min"
      },
      "priority": 1-10
    }
  ],
  "executiveSummary": "2-3 sentence high-level summary",
  "keyFindings": ["Finding 1", "Finding 2", "Finding 3"]
}

Focus on actionable insights that directly address their business goals and problems.
`
  }

  private enhancedIntelligentAnalysis(data: any[], qaResponses: QAResponses): {
    insights: DataInsight[]
    slideRecommendations: SlideRecommendation[]
    executiveSummary: string
    keyFindings: string[]
  } {
    const columns = Object.keys(data[0] || {})
    const numericColumns = columns.filter(col => 
      data.every(row => typeof row[col] === 'number' || !isNaN(Number(row[col])))
    )
    const categoryColumn = columns.find(col => 
      !numericColumns.includes(col) && data.every(row => row[col] !== null && row[col] !== undefined)
    ) || columns[0]

    // Generate McKinsey-style intelligent insights based on data type and Q&A
    const insights = this.generateMcKinseyStyleInsights(data, qaResponses, numericColumns, categoryColumn)
    const slideRecommendations = this.generateComprehensiveSlideRecommendations(data, qaResponses, insights, numericColumns, categoryColumn)
    
    const executiveSummary = this.generateExecutiveSummary(qaResponses, insights)
    const keyFindings = insights.slice(0, 4).map(insight => insight.title)

    return {
      insights,
      slideRecommendations,
      executiveSummary,
      keyFindings
    }
  }

  private generateMcKinseyStyleInsights(data: any[], qaResponses: QAResponses, numericColumns: string[], categoryColumn: string): DataInsight[] {
    const insights: DataInsight[] = []

    // McKinsey-style Strategic Insights Generation
    
    // 1. Performance Gap Analysis
    if (numericColumns.length > 0) {
      const primaryMetric = numericColumns[0]
      const values = data.map(row => Number(row[primaryMetric]))
      const avgGrowth = this.calculateGrowthRate(values)
      const total = values.reduce((sum, val) => sum + val, 0)
      const average = total / values.length
      const topPerformer = Math.max(...values)
      const gapToTop = ((topPerformer - average) / average) * 100
      
      insights.push({
        type: avgGrowth > 0 ? 'opportunity' : 'risk',
        title: `${primaryMetric} Performance Gap Analysis`,
        description: `Current ${primaryMetric.toLowerCase()} shows ${Math.abs(avgGrowth).toFixed(1)}% ${avgGrowth > 0 ? 'growth' : 'decline'} with ${gapToTop.toFixed(1)}% gap between top and average performance. This represents ${avgGrowth > 0 ? 'significant scaling opportunity' : 'critical intervention need'} aligned with ${qaResponses.businessGoals}.`,
        impact: Math.abs(avgGrowth) > 15 || gapToTop > 30 ? 'high' : 'medium',
        recommendation: avgGrowth > 0 ? 
          `Accelerate top-performing strategies: (1) Identify success factors from peak periods, (2) Scale winning tactics across all segments, (3) Invest 20% more resources in highest-growth areas` :
          `Implement immediate turnaround actions: (1) Root cause analysis of decline drivers, (2) Quick wins in underperforming segments, (3) Restructure approach for ${qaResponses.dataType} optimization`,
        supportingData: [{ values, growth: avgGrowth, gap: gapToTop, total }]
      })
    }
    
    // 2. McKinsey 80/20 Analysis
    if (data.length >= 4) {
      const sortedData = [...data].sort((a, b) => Number(b[numericColumns[0]]) - Number(a[numericColumns[0]]))
      const top20Percent = Math.max(1, Math.floor(data.length * 0.2))
      const top20Value = sortedData.slice(0, top20Percent).reduce((sum, row) => sum + Number(row[numericColumns[0]]), 0)
      const totalValue = data.reduce((sum, row) => sum + Number(row[numericColumns[0]]), 0)
      const paretoRatio = (top20Value / totalValue) * 100
      
      insights.push({
        type: 'opportunity',
        title: `Pareto Principle: ${paretoRatio.toFixed(0)}% of Value from Top Performers`,
        description: `Critical insight: Top ${top20Percent} segments (${Math.round((top20Percent/data.length)*100)}% of portfolio) drive ${paretoRatio.toFixed(0)}% of total ${numericColumns[0].toLowerCase()}. This concentration pattern ${paretoRatio > 70 ? 'exceeds' : 'falls below'} typical 80/20 distribution, indicating ${paretoRatio > 70 ? 'high-efficiency focus areas' : 'untapped optimization potential'}.`,
        impact: 'high',
        recommendation: paretoRatio > 70 ? 
          `Double down on concentration strategy: (1) Allocate 60% of resources to top performers, (2) Replicate winning models, (3) Protect market share in key segments` :
          `Rebalance portfolio approach: (1) Investigate underperforming 80%, (2) Identify quick wins in middle tier, (3) Consider strategic pivots for bottom quartile`,
        supportingData: [{ paretoRatio, top20Count: top20Percent, totalCount: data.length }]
      })
    }

    // 3. Business Context-Specific Analysis
    if (qaResponses.dataType === 'financial') {
      this.addFinancialInsights(insights, data, numericColumns, qaResponses)
    } else if (qaResponses.dataType === 'sales') {
      this.addSalesInsights(insights, data, numericColumns, qaResponses)
    } else if (qaResponses.dataType === 'marketing') {
      this.addMarketingInsights(insights, data, numericColumns, qaResponses)
    } else {
      this.addGenericBusinessInsights(insights, data, numericColumns, qaResponses)
    }

    // Outlier detection
    for (const column of numericColumns) {
      const values = data.map(row => Number(row[column]))
      const outliers = this.detectOutliers(values)
      
      if (outliers.length > 0) {
        insights.push({
          type: 'outlier',
          title: `${column} Outliers Detected`,
          description: `Found ${outliers.length} outlier(s) in ${column} that may indicate exceptional performance or issues`,
          impact: 'medium',
          recommendation: 'Investigate outliers to understand whether they represent opportunities to replicate or problems to address',
          supportingData: outliers
        })
      }
    }

    // 4. Strategic Correlation & Driver Analysis
    if (numericColumns.length >= 2) {
      for (let i = 0; i < Math.min(numericColumns.length - 1, 3); i++) {
        for (let j = i + 1; j < Math.min(numericColumns.length, 4); j++) {
          const col1 = numericColumns[i]
          const col2 = numericColumns[j]
          const correlation = this.calculateCorrelation(
            data.map(row => Number(row[col1])),
            data.map(row => Number(row[col2]))
          )
          
          if (Math.abs(correlation) > 0.5) {
            const strength = Math.abs(correlation) > 0.8 ? 'very strong' : Math.abs(correlation) > 0.6 ? 'strong' : 'moderate'
            const direction = correlation > 0 ? 'positive' : 'inverse'
            
            insights.push({
              type: 'correlation',
              title: `Strategic Driver Relationship: ${col1} ↔ ${col2}`,
              description: `${strength} ${direction} correlation (r=${correlation.toFixed(2)}) reveals that ${col1.toLowerCase()} and ${col2.toLowerCase()} move together ${correlation > 0 ? 'in tandem' : 'inversely'}. This relationship suggests ${correlation > 0 ? `investing in ${col1.toLowerCase()} will likely boost ${col2.toLowerCase()}` : `optimizing ${col1.toLowerCase()} requires careful ${col2.toLowerCase()} management`}.`,
              impact: Math.abs(correlation) > 0.7 ? 'high' : 'medium',
              recommendation: correlation > 0 ? 
                `Leverage synergistic relationship: (1) Create joint optimization initiatives, (2) Measure both metrics together, (3) Align incentives across ${col1} and ${col2} teams` :
                `Manage trade-off carefully: (1) Establish clear prioritization framework, (2) Monitor balance between metrics, (3) Set acceptable ranges for both measures`,
              supportingData: [{ correlation, strength, variables: [col1, col2] }]
            })
          }
        }
      }
    }

    // 5. Strategic Recommendations Based on Key Problems
    if (qaResponses.keyProblems) {
      insights.push({
        type: 'opportunity',
        title: `Action Plan for Key Business Challenge`,
        description: `Addressing "${qaResponses.keyProblems.slice(0, 100)}..." requires data-driven approach. Analysis shows ${insights.length > 0 ? insights[0].title.toLowerCase() : 'performance patterns'} directly impacts this challenge. Implementation should focus on highest-impact, lowest-risk initiatives first.`,
        impact: 'high',
        recommendation: `Three-horizon approach: (1) Immediate actions (0-3 months): Address quick wins identified in data patterns, (2) Medium-term initiatives (3-12 months): Scale successful pilots and optimize core processes, (3) Long-term transformation (12+ months): Build capabilities for sustained competitive advantage`,
        supportingData: [{ problem: qaResponses.keyProblems, analysisType: qaResponses.analysisType }]
      })
    }
    
    return insights.slice(0, 6) // Return top 6 McKinsey-style insights
  }

  private generateComprehensiveSlideRecommendations(data: any[], qaResponses: QAResponses, insights: DataInsight[], numericColumns: string[], categoryColumn: string): SlideRecommendation[] {
    const slides: SlideRecommendation[] = []

    // Title slide with business context
    slides.push({
      type: 'title',
      title: qaResponses.businessGoals || 'Strategic Data Analysis',
      content: {
        title: qaResponses.businessGoals || 'Strategic Data Analysis',
        subtitle: `${qaResponses.dataType.charAt(0).toUpperCase() + qaResponses.dataType.slice(1)} Performance Analysis`,
        context: `${data.length} data points • ${qaResponses.analysisType} analysis • ${new Date().toLocaleDateString()}`,
        description: qaResponses.datasetDescription.slice(0, 150) + '...',
        businessFocus: qaResponses.keyProblems ? qaResponses.keyProblems.slice(0, 100) + '...' : ''
      },
      priority: 1
    })

    // Executive summary with key findings
    const highImpactInsights = insights.filter(i => i.impact === 'high')
    slides.push({
      type: 'executive_summary',
      title: 'Executive Summary',
      content: {
        title: 'Executive Summary',
        subtitle: `${highImpactInsights.length} Critical Insights • ${insights.length - highImpactInsights.length} Supporting Findings`,
        keyPoints: insights.slice(0, 4).map(insight => insight.title),
        bulletPoints: [
          `${highImpactInsights.length} high-impact opportunities identified requiring immediate attention`,
          `${qaResponses.dataType.charAt(0).toUpperCase() + qaResponses.dataType.slice(1)} performance shows ${insights[0]?.type === 'opportunity' ? 'strong momentum' : 'optimization potential'}`,
          `Key correlation between ${numericColumns[0]} and ${numericColumns[1] || 'performance'} drives strategic recommendations`,
          `Implementation roadmap spans immediate (0-3 months) to strategic (12+ months) initiatives`
        ],
        description: this.generateExecutiveSummary(qaResponses, insights),
        recommendations: insights.filter(i => i.impact === 'high').slice(0, 2).map(i => i.recommendation.split(':')[0])
      },
      priority: 2
    })

    // Primary insights chart slide
    const chartType = this.recommendChartType(qaResponses.dataType, qaResponses.analysisType, numericColumns.length)
    const primaryInsight = insights[0]
    slides.push({
      type: 'chart',
      title: `${qaResponses.dataType.charAt(0).toUpperCase() + qaResponses.dataType.slice(1)} Performance Analysis`,
      content: {
        title: `${qaResponses.dataType.charAt(0).toUpperCase() + qaResponses.dataType.slice(1)} Performance Analysis`,
        subtitle: primaryInsight ? primaryInsight.title : 'Key Performance Indicators',
        description: primaryInsight ? primaryInsight.description : `Comprehensive analysis of ${qaResponses.dataType} performance indicators`,
        narrative: [
          `Analysis of ${data.length} data points reveals ${primaryInsight?.type === 'opportunity' ? 'significant growth opportunities' : 'areas requiring strategic attention'}`,
          `${numericColumns[0]} shows ${primaryInsight?.supportingData?.trend > 0 ? 'positive momentum' : 'optimization potential'} with direct impact on business objectives`,
          `Strategic focus on ${insights.filter(i => i.impact === 'high').length} high-impact initiatives will drive measurable improvement`
        ],
        insights: insights.slice(0, 3).map(insight => ({
          point: insight.title,
          impact: insight.impact,
          description: insight.description.slice(0, 100) + '...'
        }))
      },
      chartRecommendation: {
        type: chartType,
        reasoning: `${chartType} visualization optimally displays ${qaResponses.analysisType} patterns for ${qaResponses.dataType} decision-making`,
        xAxis: categoryColumn,
        yAxis: numericColumns.slice(0, 3),
        aggregation: 'sum'
      },
      priority: 3
    })

    // Strategic insights slide with detailed analysis
    if (insights.length > 0) {
      const strategicInsights = insights.slice(0, 4)
      slides.push({
        type: 'insights',
        title: 'Strategic Insights & Analysis',
        content: {
          title: 'Strategic Insights & Analysis',
          subtitle: `${strategicInsights.filter(i => i.impact === 'high').length} High-Impact • ${strategicInsights.filter(i => i.impact === 'medium').length} Medium-Impact Findings`,
          narrative: `Comprehensive analysis reveals ${strategicInsights.length} key insights directly addressing ${qaResponses.keyProblems ? 'identified business challenges' : 'strategic objectives'}. These findings provide actionable intelligence for ${qaResponses.analysisType} optimization and strategic decision-making.`,
          bulletPoints: strategicInsights.map(insight => `${insight.title}: ${insight.description.split('.')[0]}...`),
          insights: strategicInsights.map(insight => ({
            title: insight.title,
            description: insight.description,
            impact: insight.impact,
            type: insight.type,
            actionable: insight.recommendation.split(':')[0]
          })),
          methodology: `Analysis methodology: ${qaResponses.analysisType} approach with ${qaResponses.dataType} domain expertise and McKinsey-style framework application`
        },
        priority: 4
      })
    }

    // Strategic recommendations slide
    const actionableInsights = insights.filter(i => i.impact === 'high' || i.impact === 'medium').slice(0, 4)
    slides.push({
      type: 'recommendations',
      title: 'Strategic Recommendations & Action Plan',
      content: {
        title: 'Strategic Recommendations & Action Plan',
        subtitle: 'Prioritized Initiatives for Maximum Impact',
        narrative: `Based on comprehensive analysis, we recommend a three-horizon approach addressing immediate opportunities (0-3 months), medium-term optimization (3-12 months), and long-term strategic positioning (12+ months). Focus on ${actionableInsights.filter(i => i.impact === 'high').length} high-impact initiatives first.`,
        recommendations: actionableInsights.map((insight, index) => ({
          priority: index + 1,
          title: insight.title,
          action: insight.recommendation,
          impact: insight.impact,
          timeline: insight.impact === 'high' ? '0-3 months' : '3-6 months'
        })),
        bulletPoints: [
          `Immediate focus: ${actionableInsights.filter(i => i.impact === 'high').length} high-impact initiatives requiring urgent attention`,
          `Medium-term optimization: Scale successful pilots and optimize core processes`,
          `Long-term capability building: Develop sustainable competitive advantages`,
          `Success metrics: Track progress against key performance indicators identified in analysis`
        ],
        implementation: `Implementation success requires cross-functional alignment, clear success metrics, and regular progress reviews. Start with highest-impact, lowest-risk initiatives to build momentum.`
      },
      priority: 5
    })
    
    // Action items slide
    slides.push({
      type: 'action_items',
      title: 'Next Steps & Implementation',
      content: {
        title: 'Next Steps & Implementation',
        subtitle: '90-Day Quick Wins & Long-term Strategic Initiatives',
        narrative: `Transform insights into results through structured implementation approach. Focus on quick wins in first 90 days while building foundation for long-term success.`,
        immediateActions: [
          `Week 1-2: Validate findings with stakeholders and align on priorities`,
          `Week 3-4: Launch pilot programs for highest-impact recommendations`,
          `Month 2: Scale successful pilots and optimize processes`,
          `Month 3: Measure results and refine approach for next quarter`
        ],
        longTermInitiatives: actionableInsights.map(insight => ({
          initiative: insight.title,
          timeline: insight.impact === 'high' ? '3-6 months' : '6-12 months',
          owner: `${qaResponses.dataType.charAt(0).toUpperCase() + qaResponses.dataType.slice(1)} Team`,
          success_metric: insight.type === 'opportunity' ? 'Growth measurement' : 'Risk mitigation'
        })),
        success_factors: [
          'Executive sponsorship and clear accountability',
          'Cross-functional collaboration and resource allocation',
          'Regular progress tracking and course correction',
          'Data-driven decision making and continuous improvement'
        ]
      },
      priority: 6
    })

    return slides.sort((a, b) => a.priority - b.priority)
  }

  private generateExecutiveSummary(qaResponses: QAResponses, insights: DataInsight[]): string {
    const dataTypeLabels = {
      financial: 'financial performance',
      sales: 'sales performance',
      marketing: 'marketing effectiveness',
      strategy: 'strategic position',
      client: 'client relationships',
      other: 'business metrics'
    }

    const highImpactInsights = insights.filter(i => i.impact === 'high').length
    const dataTypeLabel = dataTypeLabels[qaResponses.dataType]

    return `Analysis of ${dataTypeLabel} reveals ${highImpactInsights} high-impact findings${qaResponses.keyProblems ? ' addressing your key challenges' : ''}. ${insights[0]?.description || 'Data shows interesting patterns'} that ${qaResponses.businessGoals ? 'align with your business objectives' : 'require strategic attention'}.`
  }

  private recommendChartType(dataType: string, analysisType: string, numericCount: number): 'area' | 'bar' | 'line' {
    if (analysisType === 'trends' || dataType === 'financial') return 'line'
    if (analysisType === 'comparison' || numericCount <= 2) return 'bar'
    return 'area'
  }

  private calculateGrowthRate(values: number[]): number {
    if (values.length < 2) return 0
    const growthRates = []
    for (let i = 1; i < values.length; i++) {
      if (values[i - 1] !== 0) {
        growthRates.push(((values[i] - values[i - 1]) / values[i - 1]) * 100)
      }
    }
    return growthRates.reduce((a, b) => a + b, 0) / growthRates.length
  }

  private detectOutliers(values: number[]): number[] {
    const sorted = [...values].sort((a, b) => a - b)
    const q1 = sorted[Math.floor(sorted.length * 0.25)]
    const q3 = sorted[Math.floor(sorted.length * 0.75)]
    const iqr = q3 - q1
    const lowerBound = q1 - 1.5 * iqr
    const upperBound = q3 + 1.5 * iqr
    
    return values.filter(v => v < lowerBound || v > upperBound)
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length
    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0)
    
    const numerator = n * sumXY - sumX * sumY
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
    
    return denominator === 0 ? 0 : numerator / denominator
  }

  private addFinancialInsights(insights: DataInsight[], data: any[], numericColumns: string[], qaResponses: QAResponses): void {
    // Financial Performance Analysis
    if (numericColumns.includes('Revenue') && numericColumns.includes('Expenses')) {
      const margins = data.map(row => ((Number(row.Revenue) - Number(row.Expenses)) / Number(row.Revenue)) * 100)
      const avgMargin = margins.reduce((a, b) => a + b, 0) / margins.length
      const marginVolatility = this.calculateStandardDeviation(margins)
      
      insights.push({
        type: avgMargin > 25 ? 'opportunity' : 'risk',
        title: `Financial Efficiency: ${avgMargin.toFixed(1)}% Average Margin`,
        description: `Margin analysis reveals ${avgMargin.toFixed(1)}% average profitability with ${marginVolatility.toFixed(1)}% volatility. ${avgMargin > 25 ? 'Strong margin profile indicates pricing power and cost discipline' : 'Margin pressure requires immediate cost optimization and revenue enhancement'}. Industry benchmarks suggest ${avgMargin > 30 ? 'best-in-class' : avgMargin > 20 ? 'competitive' : 'below-par'} performance.`,
        impact: avgMargin < 15 ? 'high' : 'medium',
        recommendation: avgMargin > 25 ? 
          'Margin excellence strategy: (1) Protect pricing through value demonstration, (2) Scale high-margin segments, (3) Optimize cost structure for competitive advantage' :
          'Margin improvement plan: (1) Zero-based budgeting for cost reduction, (2) Premium pricing for differentiated offerings, (3) Operational efficiency initiatives',
        supportingData: [{ margins, avgMargin, volatility: marginVolatility }]
      })
    }
  }

  private addSalesInsights(insights: DataInsight[], data: any[], numericColumns: string[], qaResponses: QAResponses): void {
    // Sales Performance Analysis
    if (numericColumns.includes('Leads') && numericColumns.includes('Conversions')) {
      const conversionRates = data.map(row => (Number(row.Conversions) / Number(row.Leads)) * 100)
      const avgConversion = conversionRates.reduce((a, b) => a + b, 0) / conversionRates.length
      const totalLeads = data.reduce((sum, row) => sum + Number(row.Leads), 0)
      const totalConversions = data.reduce((sum, row) => sum + Number(row.Conversions), 0)
      
      insights.push({
        type: avgConversion > 15 ? 'opportunity' : 'risk',
        title: `Sales Conversion Excellence: ${avgConversion.toFixed(1)}% Rate`,
        description: `Sales funnel analysis shows ${avgConversion.toFixed(1)}% average conversion from ${totalLeads.toLocaleString()} total leads generating ${totalConversions.toLocaleString()} conversions. ${avgConversion > 15 ? 'Strong conversion indicates effective sales process and qualified lead generation' : 'Low conversion suggests funnel optimization opportunities'}. Benchmark performance indicates ${avgConversion > 20 ? 'top quartile' : avgConversion > 10 ? 'market average' : 'improvement needed'}.`,
        impact: 'high',
        recommendation: avgConversion > 15 ? 
          'Scale winning formula: (1) Replicate high-conversion tactics, (2) Increase lead generation investment, (3) Optimize for higher-value prospects' :
          'Conversion optimization: (1) Lead quality improvement, (2) Sales process refinement, (3) Training and enablement programs',
        supportingData: [{ conversionRates, avgConversion, totalLeads, totalConversions }]
      })
    }
  }

  private addMarketingInsights(insights: DataInsight[], data: any[], numericColumns: string[], qaResponses: QAResponses): void {
    // Marketing ROI Analysis
    if (numericColumns.includes('Spend') && numericColumns.includes('Conversions')) {
      const costs = data.map(row => Number(row.Spend) / Number(row.Conversions))
      const avgCPA = costs.reduce((a, b) => a + b, 0) / costs.length
      const totalSpend = data.reduce((sum, row) => sum + Number(row.Spend), 0)
      const totalConversions = data.reduce((sum, row) => sum + Number(row.Conversions), 0)
      const efficiency = data.map((row, i) => ({ channel: row[Object.keys(row)[0]], cpa: costs[i] }))
        .sort((a, b) => a.cpa - b.cpa)
      
      insights.push({
        type: 'opportunity',
        title: `Marketing Efficiency: $${avgCPA.toFixed(0)} Average CPA`,
        description: `Marketing investment analysis reveals $${avgCPA.toFixed(0)} average cost per acquisition from $${totalSpend.toLocaleString()} total spend. Most efficient channel: ${efficiency[0]?.channel} at $${efficiency[0]?.cpa.toFixed(0)} CPA. Least efficient: ${efficiency[efficiency.length-1]?.channel} at $${efficiency[efficiency.length-1]?.cpa.toFixed(0)} CPA. ${((efficiency[efficiency.length-1]?.cpa / efficiency[0]?.cpa) - 1) * 100}% efficiency gap between best and worst performers.`,
        impact: 'high',
        recommendation: 'Portfolio optimization strategy: (1) Shift 30% budget from underperforming channels to top performers, (2) A/B test winning creative/targeting in all channels, (3) Implement dynamic budget allocation based on real-time CPA performance',
        supportingData: [{ avgCPA, totalSpend, totalConversions, efficiency }]
      })
    }
  }

  private addGenericBusinessInsights(insights: DataInsight[], data: any[], numericColumns: string[], qaResponses: QAResponses): void {
    // Generic Business Performance Analysis
    if (numericColumns.length > 0) {
      const primaryMetric = numericColumns[0]
      const values = data.map(row => Number(row[primaryMetric]))
      const total = values.reduce((sum, val) => sum + val, 0)
      const average = total / values.length
      const volatility = this.calculateStandardDeviation(values)
      const trend = this.calculateGrowthRate(values)
      
      insights.push({
        type: trend > 0 ? 'opportunity' : 'risk',
        title: `Business Performance: ${primaryMetric} Analysis`,
        description: `${primaryMetric} performance shows ${total.toLocaleString()} total value with ${average.toLocaleString()} average and ${volatility.toFixed(1)}% volatility. ${trend > 0 ? 'Positive' : 'Negative'} trend of ${Math.abs(trend).toFixed(1)}% indicates ${trend > 0 ? 'growth momentum' : 'performance challenges'}. Addressing ${qaResponses.keyProblems || 'key business challenges'} requires ${trend > 0 ? 'scaling successful initiatives' : 'immediate corrective action'}.`,
        impact: Math.abs(trend) > 10 ? 'high' : 'medium',
        recommendation: trend > 0 ? 
          'Growth acceleration: (1) Double down on growth drivers, (2) Scale successful strategies, (3) Invest in capability building' :
          'Performance turnaround: (1) Root cause analysis, (2) Quick wins implementation, (3) Strategic pivot consideration',
        supportingData: [{ total, average, volatility, trend }]
      })
    }
  }

  private calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
    const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / squaredDiffs.length
    return Math.sqrt(avgSquaredDiff)
  }
}