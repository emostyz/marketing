import { ChartConfig } from './chart-generator'

export interface McKinseyInsight {
  type: 'key_metric' | 'trend' | 'comparison' | 'correlation' | 'recommendation'
  title: string
  value?: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  description: string
  impact: 'high' | 'medium' | 'low'
  actionable: boolean
  supporting_data: string[]
}

export interface McKinseySlideConfig {
  title: string
  subtitle?: string
  layout: 'single_chart' | 'chart_with_insights' | 'multi_chart_dashboard' | 'insight_focused'
  primary_chart?: ChartConfig
  secondary_charts?: ChartConfig[]
  insights: McKinseyInsight[]
  results_summary?: {
    key_metrics: Array<{
      label: string
      value: string
      change?: string
      changeType?: 'positive' | 'negative' | 'neutral'
    }>
  }
  actions_summary?: {
    immediate: string[]
    medium_term: string[]
    long_term: string[]
  }
  annotations?: Array<{
    position: { x: number, y: number }
    text: string
    type: 'callout' | 'highlight' | 'arrow'
    color?: string
  }>
}

export class McKinseyChartGenerator {
  
  static generateMcKinseySlide(
    data: any[],
    context: {
      industry: string
      businessContext: string
      objective: string
    },
    slideType: 'executive_summary' | 'deep_dive' | 'recommendations' = 'executive_summary'
  ): McKinseySlideConfig {
    
    if (!data || data.length === 0) {
      return this.createFallbackSlide(context, slideType)
    }

    switch (slideType) {
      case 'executive_summary':
        return this.generateExecutiveSummarySlide(data, context)
      case 'deep_dive':
        return this.generateDeepDiveSlide(data, context)
      case 'recommendations':
        return this.generateRecommendationsSlide(data, context)
      default:
        return this.generateExecutiveSummarySlide(data, context)
    }
  }

  private static generateExecutiveSummarySlide(
    data: any[],
    context: { industry: string, businessContext: string, objective: string }
  ): McKinseySlideConfig {
    
    const columns = Object.keys(data[0])
    const primaryMetric = this.identifyPrimaryMetric(data, columns)
    const keyInsight = this.extractKeyInsight(data, primaryMetric, context)
    
    // Generate primary chart with McKinsey styling
    const primaryChart: ChartConfig = {
      id: `mckinsey_primary_${Date.now()}`,
      type: 'bar',
      data: this.prepareChartData(data, primaryMetric),
      title: `${this.formatMetricName(primaryMetric)} Performance`,
      description: `Analysis of ${primaryMetric} across time periods`,
      xAxis: columns[0],
      yAxis: primaryMetric,
      color: '#1E40AF', // McKinsey blue
      style: 'minimal',
      showLegend: false,
      showGrid: true,
      showTooltip: true,
      animation: true,
      responsive: true,
      height: 400,
      insights: [],
      customOptions: {
        backgroundColor: '#FFFFFF',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        titleColor: '#1F2937',
        axisColor: '#6B7280',
        gridColor: '#E5E7EB',
        calloutColor: '#3B82F6',
        highlightColor: '#FEF3C7'
      }
    }

    // Generate insights
    const insights: McKinseyInsight[] = [
      {
        type: 'key_metric',
        title: keyInsight.title,
        value: keyInsight.value,
        change: keyInsight.change,
        changeType: keyInsight.changeType,
        description: keyInsight.description,
        impact: 'high',
        actionable: true,
        supporting_data: keyInsight.supportingData
      },
      ...this.generateSupportingInsights(data, primaryMetric, context)
    ]

    // Generate results summary
    const resultsMetrics = this.calculateKeyMetrics(data, primaryMetric)
    
    return {
      title: `${this.formatMetricName(primaryMetric)} has ${keyInsight.change} ${keyInsight.changeType === 'positive' ? 'since' : 'despite'} recent initiatives`,
      subtitle: `Analysis of ${context.businessContext} performance in ${context.industry}`,
      layout: 'chart_with_insights',
      primary_chart: primaryChart,
      insights,
      results_summary: {
        key_metrics: resultsMetrics
      },
      actions_summary: {
        immediate: this.generateActionItems(insights, 'immediate'),
        medium_term: this.generateActionItems(insights, 'medium_term'),
        long_term: this.generateActionItems(insights, 'long_term')
      },
      annotations: [
        {
          position: { x: 0.7, y: 0.3 },
          text: keyInsight.change || 'Key trend',
          type: 'callout',
          color: keyInsight.changeType === 'positive' ? '#10B981' : '#EF4444'
        }
      ]
    }
  }

  private static generateDeepDiveSlide(
    data: any[],
    context: { industry: string, businessContext: string, objective: string }
  ): McKinseySlideConfig {
    
    const columns = Object.keys(data[0])
    const numericColumns = columns.filter(col => 
      data.some(row => !isNaN(parseFloat(row[col])))
    )

    // Create multiple charts for deep analysis
    const charts: ChartConfig[] = numericColumns.slice(0, 4).map((column, index) => ({
      id: `mckinsey_chart_${index}_${Date.now()}`,
      type: index === 0 ? 'line' : index === 1 ? 'bar' : index === 2 ? 'area' : 'scatter',
      data: this.prepareChartData(data, column),
      title: this.formatMetricName(column),
      description: `Detailed analysis of ${column}`,
      xAxis: columns[0],
      yAxis: column,
      color: ['#1E40AF', '#059669', '#D97706', '#7C3AED'][index],
      style: 'minimal',
      showLegend: false,
      showGrid: true,
      showTooltip: true,
      animation: true,
      responsive: true,
      height: 200,
      insights: [],
      customOptions: {
        backgroundColor: '#FFFFFF',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
      }
    }))

    const insights = this.generateDeepInsights(data, numericColumns, context)

    return {
      title: `Deep dive: ${context.businessContext} performance drivers`,
      subtitle: `Comprehensive analysis across key metrics`,
      layout: 'multi_chart_dashboard',
      secondary_charts: charts,
      insights,
      results_summary: {
        key_metrics: this.calculateKeyMetrics(data, numericColumns[0])
      }
    }
  }

  private static generateRecommendationsSlide(
    data: any[],
    context: { industry: string, businessContext: string, objective: string }
  ): McKinseySlideConfig {
    
    const insights = this.generateRecommendationInsights(data, context)
    
    return {
      title: `Strategic recommendations to ${context.objective}`,
      subtitle: `Prioritized action plan based on data analysis`,
      layout: 'insight_focused',
      insights,
      actions_summary: {
        immediate: insights.filter(i => i.impact === 'high').map(i => i.description).slice(0, 3),
        medium_term: insights.filter(i => i.impact === 'medium').map(i => i.description).slice(0, 3),
        long_term: insights.filter(i => i.impact === 'low').map(i => i.description).slice(0, 2)
      }
    }
  }

  private static identifyPrimaryMetric(data: any[], columns: string[]): string {
    // Find the most important metric based on variance and business relevance
    const numericColumns = columns.filter(col => 
      data.some(row => !isNaN(parseFloat(row[col])))
    )
    
    if (numericColumns.length === 0) return columns[1] || columns[0]
    
    // Prioritize business-relevant terms
    const businessTerms = ['revenue', 'sales', 'profit', 'growth', 'users', 'conversion', 'retention']
    const relevantColumn = numericColumns.find(col => 
      businessTerms.some(term => col.toLowerCase().includes(term))
    )
    
    return relevantColumn || numericColumns[0]
  }

  private static extractKeyInsight(
    data: any[],
    metric: string,
    context: { industry: string, businessContext: string, objective: string }
  ): {
    title: string
    value: string
    change?: string
    changeType: 'positive' | 'negative' | 'neutral'
    description: string
    supportingData: string[]
  } {
    const values = data.map(row => parseFloat(row[metric])).filter(v => !isNaN(v))
    
    if (values.length < 2) {
      return {
        title: `${this.formatMetricName(metric)} Analysis`,
        value: values[0]?.toLocaleString() || 'N/A',
        description: `Current ${metric} performance in ${context.industry}`,
        changeType: 'neutral',
        supportingData: [`Data points: ${values.length}`]
      }
    }

    const latest = values[values.length - 1]
    const previous = values[values.length - 2]
    const change = ((latest - previous) / previous * 100)
    const changeFormatted = `${Math.abs(change).toFixed(1)}%`
    
    return {
      title: `${this.formatMetricName(metric)} Performance`,
      value: latest.toLocaleString(),
      change: changeFormatted,
      changeType: change >= 0 ? 'positive' : 'negative',
      description: `${this.formatMetricName(metric)} has ${change >= 0 ? 'increased' : 'decreased'} by ${changeFormatted} ${this.getTimeContext(data)}. ${this.generateInsightContext(change, context)}`,
      supportingData: [
        `Current value: ${latest.toLocaleString()}`,
        `Previous value: ${previous.toLocaleString()}`,
        `Change: ${change >= 0 ? '+' : ''}${change.toFixed(1)}%`,
        `Trend: ${change >= 5 ? 'Strong growth' : change >= 0 ? 'Growth' : change >= -5 ? 'Decline' : 'Strong decline'}`
      ]
    }
  }

  private static generateSupportingInsights(
    data: any[],
    primaryMetric: string,
    context: { industry: string, businessContext: string, objective: string }
  ): McKinseyInsight[] {
    const insights: McKinseyInsight[] = []
    const columns = Object.keys(data[0])
    const numericColumns = columns.filter(col => 
      col !== primaryMetric && data.some(row => !isNaN(parseFloat(row[col])))
    )

    // Add trend insight
    if (data.length >= 3) {
      insights.push({
        type: 'trend',
        title: 'Performance Trend',
        description: this.analyzeTrend(data, primaryMetric),
        impact: 'medium',
        actionable: true,
        supporting_data: ['Trend analysis based on historical data']
      })
    }

    // Add correlation insight if multiple metrics exist
    if (numericColumns.length > 0) {
      const correlation = this.calculateCorrelation(data, primaryMetric, numericColumns[0])
      insights.push({
        type: 'correlation',
        title: `${this.formatMetricName(primaryMetric)} vs ${this.formatMetricName(numericColumns[0])}`,
        description: this.describeCorrelation(correlation, primaryMetric, numericColumns[0]),
        impact: Math.abs(correlation) > 0.7 ? 'high' : 'medium',
        actionable: Math.abs(correlation) > 0.5,
        supporting_data: [`Correlation coefficient: ${correlation.toFixed(2)}`]
      })
    }

    return insights
  }

  private static generateDeepInsights(
    data: any[],
    metrics: string[],
    context: { industry: string, businessContext: string, objective: string }
  ): McKinseyInsight[] {
    return metrics.map((metric, index) => ({
      type: 'comparison' as const,
      title: `${this.formatMetricName(metric)} Analysis`,
      description: this.generateMetricAnalysis(data, metric, context),
      impact: index === 0 ? 'high' : index === 1 ? 'medium' : 'low',
      actionable: true,
      supporting_data: this.getMetricStats(data, metric)
    }))
  }

  private static generateRecommendationInsights(
    data: any[],
    context: { industry: string, businessContext: string, objective: string }
  ): McKinseyInsight[] {
    const columns = Object.keys(data[0])
    const primaryMetric = this.identifyPrimaryMetric(data, columns)
    
    return [
      {
        type: 'recommendation',
        title: 'Immediate Priority',
        description: `Focus on optimizing ${this.formatMetricName(primaryMetric)} through targeted initiatives`,
        impact: 'high',
        actionable: true,
        supporting_data: ['Based on primary metric analysis', 'Highest impact potential']
      },
      {
        type: 'recommendation',
        title: 'Strategic Investment',
        description: `Develop ${context.businessContext} capabilities to sustain growth in ${context.industry}`,
        impact: 'medium',
        actionable: true,
        supporting_data: ['Market analysis', 'Industry benchmarks']
      },
      {
        type: 'recommendation',
        title: 'Long-term Foundation',
        description: `Build data infrastructure and analytics capabilities for continuous optimization`,
        impact: 'low',
        actionable: true,
        supporting_data: ['Capability assessment', 'Future readiness']
      }
    ]
  }

  private static prepareChartData(data: any[], metric: string): any[] {
    return data.map(row => ({
      ...row,
      [metric]: parseFloat(row[metric]) || 0
    }))
  }

  private static calculateKeyMetrics(data: any[], metric: string): Array<{
    label: string
    value: string
    change?: string
    changeType?: 'positive' | 'negative' | 'neutral'
  }> {
    const values: number[] = data.map(row => parseFloat(row[metric])).filter(v => !isNaN(v))
    
    if (values.length === 0) return []
    
    const latest = values[values.length - 1]
    const average = values.reduce((sum, v) => sum + v, 0) / values.length
    const max = Math.max(...values)
    const min = Math.min(...values)
    
    const metrics = [
      {
        label: 'Current',
        value: latest.toLocaleString()
      },
      {
        label: 'Average',
        value: average.toFixed(0)
      },
      {
        label: 'Peak',
        value: max.toLocaleString()
      }
    ]

    if (values.length >= 2) {
      // Calculate percentage change with type safety
      const prev = values[values.length - 2];
      const curr = values[values.length - 1];
      const changePercent = ((curr - prev) / prev * 100);
      (metrics[0] as any).change = `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(1)}%`;
      (metrics[0] as any).changeType = changePercent >= 0 ? 'positive' : 'negative';
    }

    return metrics
  }

  private static generateActionItems(insights: McKinseyInsight[], timeframe: string): string[] {
    const timeframeMap = {
      immediate: insights.filter(i => i.impact === 'high' && i.actionable),
      medium_term: insights.filter(i => i.impact === 'medium' && i.actionable),
      long_term: insights.filter(i => i.impact === 'low' && i.actionable)
    }

    return timeframeMap[timeframe as keyof typeof timeframeMap]
      ?.map(insight => this.convertInsightToAction(insight, timeframe))
      .slice(0, 3) || []
  }

  private static convertInsightToAction(insight: McKinseyInsight, timeframe: string): string {
    const actionVerbs = {
      immediate: ['Optimize', 'Fix', 'Implement', 'Launch'],
      medium_term: ['Develop', 'Build', 'Scale', 'Enhance'],
      long_term: ['Establish', 'Transform', 'Innovate', 'Evolve']
    }

    const verbs = actionVerbs[timeframe as keyof typeof actionVerbs] || actionVerbs.immediate
    const verb = verbs[Math.floor(Math.random() * verbs.length)]
    
    return `${verb} ${insight.title.toLowerCase()}`
  }

  private static formatMetricName(metric: string): string {
    return metric
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ')
      .trim()
  }

  private static getTimeContext(data: any[]): string {
    const timeKeys = ['date', 'time', 'period', 'quarter', 'month', 'year']
    const timeColumn = Object.keys(data[0]).find(key => 
      timeKeys.some(timeKey => key.toLowerCase().includes(timeKey))
    )
    
    if (timeColumn && data.length >= 2) {
      return `from ${data[data.length - 2][timeColumn]} to ${data[data.length - 1][timeColumn]}`
    }
    
    return 'in the latest period'
  }

  private static generateInsightContext(
    change: number,
    context: { industry: string, businessContext: string, objective: string }
  ): string {
    if (Math.abs(change) < 2) {
      return `Performance remains stable in the ${context.industry} sector.`
    } else if (change > 10) {
      return `This represents strong momentum toward ${context.objective}.`
    } else if (change > 0) {
      return `Positive trajectory supports ${context.objective} in ${context.industry}.`
    } else if (change > -10) {
      return `This decline requires attention to maintain ${context.objective}.`
    } else {
      return `Significant decline demands immediate intervention to recover ${context.objective}.`
    }
  }

  private static analyzeTrend(data: any[], metric: string): string {
    const values = data.map(row => parseFloat(row[metric])).filter(v => !isNaN(v))
    
    if (values.length < 3) return 'Insufficient data for trend analysis'
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2))
    const secondHalf = values.slice(Math.floor(values.length / 2))
    
    const firstAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length
    
    const trendChange = ((secondAvg - firstAvg) / firstAvg * 100)
    
    if (Math.abs(trendChange) < 5) {
      return `${this.formatMetricName(metric)} shows stable performance with minimal variation`
    } else if (trendChange > 15) {
      return `Strong upward trend with ${trendChange.toFixed(1)}% improvement in recent periods`
    } else if (trendChange > 0) {
      return `Positive trend showing ${trendChange.toFixed(1)}% growth trajectory`
    } else if (trendChange > -15) {
      return `Declining trend with ${Math.abs(trendChange).toFixed(1)}% decrease requiring attention`
    } else {
      return `Significant downward trend with ${Math.abs(trendChange).toFixed(1)}% decline demanding urgent action`
    }
  }

  private static calculateCorrelation(data: any[], metric1: string, metric2: string): number {
    const pairs = data.map(row => ({
      x: parseFloat(row[metric1]),
      y: parseFloat(row[metric2])
    })).filter(pair => !isNaN(pair.x) && !isNaN(pair.y))
    
    if (pairs.length < 2) return 0
    
    const n = pairs.length
    const sumX = pairs.reduce((sum, p) => sum + p.x, 0)
    const sumY = pairs.reduce((sum, p) => sum + p.y, 0)
    const sumXY = pairs.reduce((sum, p) => sum + p.x * p.y, 0)
    const sumXX = pairs.reduce((sum, p) => sum + p.x * p.x, 0)
    const sumYY = pairs.reduce((sum, p) => sum + p.y * p.y, 0)
    
    const numerator = n * sumXY - sumX * sumY
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY))
    
    return denominator === 0 ? 0 : numerator / denominator
  }

  private static describeCorrelation(correlation: number, metric1: string, metric2: string): string {
    const absCorr = Math.abs(correlation)
    const direction = correlation > 0 ? 'positive' : 'negative'
    const strength = absCorr > 0.8 ? 'strong' : absCorr > 0.5 ? 'moderate' : 'weak'
    
    return `${strength.charAt(0).toUpperCase() + strength.slice(1)} ${direction} correlation (${correlation.toFixed(2)}) between ${this.formatMetricName(metric1)} and ${this.formatMetricName(metric2)}`
  }

  private static generateMetricAnalysis(
    data: any[],
    metric: string,
    context: { industry: string, businessContext: string, objective: string }
  ): string {
    const values = data.map(row => parseFloat(row[metric])).filter(v => !isNaN(v))
    const average = values.reduce((sum, v) => sum + v, 0) / values.length
    const latest = values[values.length - 1]
    const variance = latest > average ? 'above' : 'below'
    const percentage = Math.abs(((latest - average) / average) * 100).toFixed(1)
    
    return `Current ${this.formatMetricName(metric)} is ${percentage}% ${variance} average, indicating ${variance === 'above' ? 'strong' : 'weak'} performance in ${context.businessContext}`
  }

  private static getMetricStats(data: any[], metric: string): string[] {
    const values = data.map(row => parseFloat(row[metric])).filter(v => !isNaN(v))
    
    if (values.length === 0) return ['No data available']
    
    const average = values.reduce((sum, v) => sum + v, 0) / values.length
    const max = Math.max(...values)
    const min = Math.min(...values)
    
    return [
      `Average: ${average.toFixed(2)}`,
      `Range: ${min.toFixed(2)} - ${max.toFixed(2)}`,
      `Data points: ${values.length}`
    ]
  }

  private static createFallbackSlide(
    context: { industry: string, businessContext: string, objective: string },
    slideType: string
  ): McKinseySlideConfig {
    return {
      title: `${context.businessContext} Analysis`,
      subtitle: `${slideType.replace('_', ' ')} for ${context.industry}`,
      layout: 'insight_focused',
      insights: [
        {
          type: 'key_metric',
          title: 'Data Required',
          description: `Upload data to generate insights for ${context.objective}`,
          impact: 'high',
          actionable: true,
          supporting_data: ['No data available for analysis']
        }
      ]
    }
  }
}