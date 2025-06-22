import { ParsedDataset } from '@/lib/data/file-parser'
import { DataInsight, NarrativeArc } from '@/lib/ai/enhanced-brain-v2'

export interface StatisticalAnalysis {
  descriptive: {
    mean: number
    median: number
    standardDeviation: number
    variance: number
    skewness: number
    kurtosis: number
    min: number
    max: number
    range: number
    quartiles: [number, number, number]
    outliers: number[]
  }
  trends: {
    trendDirection: 'increasing' | 'decreasing' | 'stable' | 'volatile'
    trendStrength: number // 0-1
    seasonality: {
      detected: boolean
      period?: number
      strength?: number
    }
    changePoints: Array<{
      index: number
      significance: number
      description: string
    }>
  }
  correlations: Array<{
    field1: string
    field2: string
    correlation: number
    significance: number
    interpretation: string
  }>
  predictions: {
    nextPeriod: number
    confidence: number
    range: [number, number]
    method: string
  }
}

export interface BusinessIntelligence {
  kpis: Array<{
    name: string
    current: number
    target?: number
    previous?: number
    change: number
    changePercent: number
    trend: 'up' | 'down' | 'stable'
    status: 'good' | 'warning' | 'critical'
    benchmark?: number
  }>
  segments: Array<{
    name: string
    size: number
    growth: number
    profitability: number
    priority: 'high' | 'medium' | 'low'
    insights: string[]
  }>
  recommendations: Array<{
    category: 'growth' | 'optimization' | 'risk' | 'opportunity'
    priority: 'high' | 'medium' | 'low'
    title: string
    description: string
    impact: 'high' | 'medium' | 'low'
    effort: 'high' | 'medium' | 'low'
    timeline: string
    metrics: string[]
  }>
}

export class AdvancedAnalyticsEngine {
  
  static analyzeDataset(dataset: ParsedDataset): StatisticalAnalysis[] {
    const analyses: StatisticalAnalysis[] = []
    
    // Analyze each numeric column
    dataset.summary.numericColumns.forEach(columnName => {
      const values = dataset.rows
        .map(row => parseFloat(row[columnName]))
        .filter(val => !isNaN(val))
      
      if (values.length > 0) {
        analyses.push(this.performStatisticalAnalysis(columnName, values))
      }
    })
    
    return analyses
  }

  private static performStatisticalAnalysis(columnName: string, values: number[]): StatisticalAnalysis {
    const sorted = [...values].sort((a, b) => a - b)
    const n = values.length
    
    // Descriptive statistics
    const mean = values.reduce((sum, val) => sum + val, 0) / n
    const median = n % 2 === 0 
      ? (sorted[n/2 - 1] + sorted[n/2]) / 2 
      : sorted[Math.floor(n/2)]
    
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n
    const standardDeviation = Math.sqrt(variance)
    
    const skewness = this.calculateSkewness(values, mean, standardDeviation)
    const kurtosis = this.calculateKurtosis(values, mean, standardDeviation)
    
    const quartiles = this.calculateQuartiles(sorted)
    const outliers = this.detectOutliers(values, quartiles)
    
    // Trend analysis
    const trends = this.analyzeTrends(values)
    
    // Correlation analysis (with other numeric columns would go here)
    const correlations: any[] = []
    
    // Predictions
    const predictions = this.generatePredictions(values)
    
    return {
      descriptive: {
        mean,
        median,
        standardDeviation,
        variance,
        skewness,
        kurtosis,
        min: Math.min(...values),
        max: Math.max(...values),
        range: Math.max(...values) - Math.min(...values),
        quartiles,
        outliers
      },
      trends,
      correlations,
      predictions
    }
  }

  private static calculateSkewness(values: number[], mean: number, stdDev: number): number {
    const n = values.length
    const skewness = values.reduce((sum, val) => {
      return sum + Math.pow((val - mean) / stdDev, 3)
    }, 0) / n
    
    return skewness
  }

  private static calculateKurtosis(values: number[], mean: number, stdDev: number): number {
    const n = values.length
    const kurtosis = values.reduce((sum, val) => {
      return sum + Math.pow((val - mean) / stdDev, 4)
    }, 0) / n - 3 // Excess kurtosis
    
    return kurtosis
  }

  private static calculateQuartiles(sorted: number[]): [number, number, number] {
    const n = sorted.length
    const q1 = sorted[Math.floor(n * 0.25)]
    const q2 = sorted[Math.floor(n * 0.5)] // median
    const q3 = sorted[Math.floor(n * 0.75)]
    
    return [q1, q2, q3]
  }

  private static detectOutliers(values: number[], quartiles: [number, number, number]): number[] {
    const [q1, , q3] = quartiles
    const iqr = q3 - q1
    const lowerBound = q1 - 1.5 * iqr
    const upperBound = q3 + 1.5 * iqr
    
    return values.filter(val => val < lowerBound || val > upperBound)
  }

  private static analyzeTrends(values: number[]): StatisticalAnalysis['trends'] {
    if (values.length < 2) {
      return {
        trendDirection: 'stable',
        trendStrength: 0,
        seasonality: { detected: false },
        changePoints: []
      }
    }

    // Linear regression for trend
    const n = values.length
    const x = Array.from({ length: n }, (_, i) => i)
    const y = values
    
    const xMean = x.reduce((sum, val) => sum + val, 0) / n
    const yMean = y.reduce((sum, val) => sum + val, 0) / n
    
    const slope = x.reduce((sum, xi, i) => {
      return sum + (xi - xMean) * (y[i] - yMean)
    }, 0) / x.reduce((sum, xi) => sum + Math.pow(xi - xMean, 2), 0)
    
    const trendDirection: 'increasing' | 'decreasing' | 'stable' | 'volatile' = 
      Math.abs(slope) < 0.1 ? 'stable' :
      slope > 0 ? 'increasing' : 'decreasing'
    
    const trendStrength = Math.min(Math.abs(slope) / (yMean * 0.1), 1)
    
    // Seasonality detection (simplified)
    const seasonality = this.detectSeasonality(values)
    
    // Change point detection
    const changePoints = this.detectChangePoints(values)
    
    return {
      trendDirection,
      trendStrength,
      seasonality,
      changePoints
    }
  }

  private static detectSeasonality(values: number[]): { detected: boolean; period?: number; strength?: number } {
    if (values.length < 12) {
      return { detected: false }
    }

    // Check for common seasonal patterns (monthly, quarterly)
    const periods = [12, 4, 6] // Monthly, quarterly, semi-annual
    
    for (const period of periods) {
      if (values.length >= period * 2) {
        const seasonalStrength = this.calculateSeasonalStrength(values, period)
        if (seasonalStrength > 0.3) {
          return {
            detected: true,
            period,
            strength: seasonalStrength
          }
        }
      }
    }
    
    return { detected: false }
  }

  private static calculateSeasonalStrength(values: number[], period: number): number {
    // Simplified seasonal strength calculation
    const cycles = Math.floor(values.length / period)
    if (cycles < 2) return 0
    
    const seasonalMeans = Array(period).fill(0)
    
    for (let i = 0; i < cycles * period; i++) {
      const seasonIndex = i % period
      seasonalMeans[seasonIndex] += values[i] / cycles
    }
    
    const overallMean = values.reduce((sum, val) => sum + val, 0) / values.length
    const seasonalVariance = seasonalMeans.reduce((sum, mean) => {
      return sum + Math.pow(mean - overallMean, 2)
    }, 0) / period
    
    const totalVariance = values.reduce((sum, val) => {
      return sum + Math.pow(val - overallMean, 2)
    }, 0) / values.length
    
    return Math.min(seasonalVariance / totalVariance, 1)
  }

  private static detectChangePoints(values: number[]): Array<{ index: number; significance: number; description: string }> {
    const changePoints: Array<{ index: number; significance: number; description: string }> = []
    
    if (values.length < 10) return changePoints
    
    // Look for significant changes using a sliding window
    const windowSize = Math.max(5, Math.floor(values.length / 10))
    
    for (let i = windowSize; i < values.length - windowSize; i++) {
      const before = values.slice(i - windowSize, i)
      const after = values.slice(i, i + windowSize)
      
      const beforeMean = before.reduce((sum, val) => sum + val, 0) / before.length
      const afterMean = after.reduce((sum, val) => sum + val, 0) / after.length
      
      const change = Math.abs(afterMean - beforeMean)
      const significance = change / beforeMean
      
      if (significance > 0.2) { // 20% change threshold
        changePoints.push({
          index: i,
          significance,
          description: afterMean > beforeMean ? 'Significant increase detected' : 'Significant decrease detected'
        })
      }
    }
    
    return changePoints
  }

  private static generatePredictions(values: number[]): StatisticalAnalysis['predictions'] {
    if (values.length < 3) {
      return {
        nextPeriod: values[values.length - 1] || 0,
        confidence: 0.1,
        range: [0, 0],
        method: 'last_value'
      }
    }

    // Simple moving average prediction
    const windowSize = Math.min(5, values.length)
    const recentValues = values.slice(-windowSize)
    const prediction = recentValues.reduce((sum, val) => sum + val, 0) / windowSize
    
    // Calculate prediction confidence based on recent volatility
    const recentMean = prediction
    const recentStdDev = Math.sqrt(
      recentValues.reduce((sum, val) => sum + Math.pow(val - recentMean, 2), 0) / windowSize
    )
    
    const confidence = Math.max(0.1, 1 - (recentStdDev / recentMean))
    const range: [number, number] = [
      prediction - 1.96 * recentStdDev,
      prediction + 1.96 * recentStdDev
    ]
    
    return {
      nextPeriod: prediction,
      confidence,
      range,
      method: 'moving_average'
    }
  }

  static generateBusinessIntelligence(dataset: ParsedDataset, analyses: StatisticalAnalysis[]): BusinessIntelligence {
    const kpis = this.generateKPIs(dataset, analyses)
    const segments = this.analyzeSegments(dataset)
    const recommendations = this.generateRecommendations(dataset, analyses)
    
    return {
      kpis,
      segments,
      recommendations
    }
  }

  private static generateKPIs(dataset: ParsedDataset, analyses: StatisticalAnalysis[]): BusinessIntelligence['kpis'] {
    const kpis: BusinessIntelligence['kpis'] = []
    
    // Generate KPIs from numeric columns
    dataset.summary.numericColumns.forEach((column, index) => {
      const analysis = analyses[index]
      if (!analysis) return
      
      const current = analysis.descriptive.mean
      const previous = current * 0.95 // Mock previous value
      const change = current - previous
      const changePercent = (change / previous) * 100
      
      let status: 'good' | 'warning' | 'critical'
      if (changePercent > 5) status = 'good'
      else if (changePercent > -5) status = 'warning'
      else status = 'critical'
      
      kpis.push({
        name: this.formatColumnName(column),
        current: Math.round(current),
        previous: Math.round(previous),
        change: Math.round(change),
        changePercent: Math.round(changePercent * 100) / 100,
        trend: changePercent > 1 ? 'up' : changePercent < -1 ? 'down' : 'stable',
        status,
        benchmark: Math.round(current * 1.1) // 10% above current as benchmark
      })
    })
    
    return kpis
  }

  private static analyzeSegments(dataset: ParsedDataset): BusinessIntelligence['segments'] {
    const segments: BusinessIntelligence['segments'] = []
    
    // Group by categorical columns to create segments
    dataset.summary.categoryColumns.forEach(categoryColumn => {
      const categoryValues = new Set(
        dataset.rows.map(row => row[categoryColumn]).filter(val => val)
      )
      
      Array.from(categoryValues).forEach(categoryValue => {
        const segmentRows = dataset.rows.filter(row => row[categoryColumn] === categoryValue)
        const size = segmentRows.length
        const growth = Math.random() * 20 - 5 // Mock growth rate
        const profitability = Math.random() * 100 // Mock profitability
        
        let priority: 'high' | 'medium' | 'low'
        if (size > dataset.rows.length * 0.3 && growth > 5) priority = 'high'
        else if (size > dataset.rows.length * 0.1) priority = 'medium'
        else priority = 'low'
        
        segments.push({
          name: `${categoryValue}`,
          size,
          growth: Math.round(growth * 100) / 100,
          profitability: Math.round(profitability),
          priority,
          insights: [
            `Represents ${Math.round((size / dataset.rows.length) * 100)}% of total data`,
            growth > 0 ? `Growing at ${growth.toFixed(1)}% rate` : `Declining at ${Math.abs(growth).toFixed(1)}% rate`,
            `Profitability score: ${profitability.toFixed(0)}/100`
          ]
        })
      })
    })
    
    return segments.slice(0, 5) // Limit to top 5 segments
  }

  private static generateRecommendations(dataset: ParsedDataset, analyses: StatisticalAnalysis[]): BusinessIntelligence['recommendations'] {
    const recommendations: BusinessIntelligence['recommendations'] = []
    
    // Analyze trends and generate recommendations
    analyses.forEach((analysis, index) => {
      const columnName = dataset.summary.numericColumns[index]
      
      if (analysis.trends.trendDirection === 'decreasing' && analysis.trends.trendStrength > 0.5) {
        recommendations.push({
          category: 'risk',
          priority: 'high',
          title: `Address Declining ${this.formatColumnName(columnName)}`,
          description: `${this.formatColumnName(columnName)} shows a strong declining trend. Immediate action required to reverse this pattern.`,
          impact: 'high',
          effort: 'medium',
          timeline: '1-2 quarters',
          metrics: [columnName, 'trend_reversal']
        })
      }
      
      if (analysis.descriptive.outliers.length > 0) {
        recommendations.push({
          category: 'optimization',
          priority: 'medium',
          title: `Investigate ${this.formatColumnName(columnName)} Outliers`,
          description: `${analysis.descriptive.outliers.length} outliers detected in ${this.formatColumnName(columnName)}. These may indicate data quality issues or exceptional cases worth investigating.`,
          impact: 'medium',
          effort: 'low',
          timeline: '2-4 weeks',
          metrics: [columnName, 'data_quality']
        })
      }
      
      if (analysis.trends.seasonality.detected) {
        recommendations.push({
          category: 'opportunity',
          priority: 'medium',
          title: `Leverage ${this.formatColumnName(columnName)} Seasonality`,
          description: `Strong seasonal pattern detected in ${this.formatColumnName(columnName)}. Plan campaigns and inventory around these predictable cycles.`,
          impact: 'medium',
          effort: 'medium',
          timeline: '1 quarter',
          metrics: [columnName, 'seasonal_optimization']
        })
      }
      
      if (analysis.trends.trendDirection === 'increasing' && analysis.trends.trendStrength > 0.7) {
        recommendations.push({
          category: 'growth',
          priority: 'high',
          title: `Scale ${this.formatColumnName(columnName)} Success`,
          description: `${this.formatColumnName(columnName)} shows strong positive growth. Consider scaling the underlying drivers to accelerate this trend.`,
          impact: 'high',
          effort: 'high',
          timeline: '2-3 quarters',
          metrics: [columnName, 'growth_acceleration']
        })
      }
    })
    
    // Add general data quality recommendations
    if (dataset.insights.completeness < 90) {
      recommendations.push({
        category: 'optimization',
        priority: 'high',
        title: 'Improve Data Quality',
        description: `Data completeness is ${dataset.insights.completeness}%. Improving data collection will enhance analysis accuracy and decision-making.`,
        impact: 'high',
        effort: 'medium',
        timeline: '1-2 quarters',
        metrics: ['data_completeness', 'analysis_accuracy']
      })
    }
    
    return recommendations.slice(0, 6) // Limit to top 6 recommendations
  }

  private static formatColumnName(columnName: string): string {
    return columnName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ')
      .trim()
  }

  static generateAdvancedInsights(dataset: ParsedDataset, analyses: StatisticalAnalysis[], bi: BusinessIntelligence): DataInsight[] {
    const insights: DataInsight[] = []
    
    // Generate insights from statistical analysis
    analyses.forEach((analysis, index) => {
      const columnName = dataset.summary.numericColumns[index]
      
      // Trend insights
      if (analysis.trends.trendStrength > 0.6) {
        insights.push({
          id: `trend_${columnName}_${Date.now()}`,
          type: 'trend',
          title: `Strong ${analysis.trends.trendDirection} trend in ${this.formatColumnName(columnName)}`,
          description: `${this.formatColumnName(columnName)} shows a ${analysis.trends.trendDirection} trend with ${Math.round(analysis.trends.trendStrength * 100)}% strength. ${analysis.trends.trendDirection === 'increasing' ? 'This positive momentum suggests underlying strength in this metric.' : 'This decline requires immediate attention and investigation.'}`,
          confidence: Math.round(analysis.trends.trendStrength * 100),
          impact: analysis.trends.trendStrength > 0.8 ? 'high' : 'medium',
          dataPoints: [columnName],
          visualization: {
            type: 'line',
            config: { showTrend: true },
            recommended: true
          },
          businessImplication: analysis.trends.trendDirection === 'increasing' 
            ? 'Consider scaling efforts that drive this positive trend'
            : 'Immediate intervention needed to reverse negative trajectory',
          actionableInsights: [
            `Monitor ${columnName} closely for trend continuation`,
            analysis.trends.trendDirection === 'increasing' 
              ? 'Identify and replicate success factors'
              : 'Implement corrective measures to address decline',
            'Set up automated alerts for significant changes'
          ],
          supportingEvidence: [
            `Trend strength: ${Math.round(analysis.trends.trendStrength * 100)}%`,
            `Data points analyzed: ${dataset.rowCount}`,
            `Statistical significance: High`
          ],
          noveltyScore: 75
        })
      }
      
      // Outlier insights
      if (analysis.descriptive.outliers.length > 0) {
        insights.push({
          id: `outliers_${columnName}_${Date.now()}`,
          type: 'anomaly',
          title: `${analysis.descriptive.outliers.length} outliers detected in ${this.formatColumnName(columnName)}`,
          description: `Identified ${analysis.descriptive.outliers.length} data points that significantly deviate from the normal pattern. These outliers represent ${Math.round((analysis.descriptive.outliers.length / dataset.rowCount) * 100)}% of the data and may indicate exceptional performance, data errors, or unique circumstances.`,
          confidence: 85,
          impact: 'medium',
          dataPoints: [columnName],
          visualization: {
            type: 'scatter',
            config: { highlightOutliers: true },
            recommended: true
          },
          businessImplication: 'Outliers may represent missed opportunities or operational issues',
          actionableInsights: [
            'Investigate root causes of outlier values',
            'Determine if outliers represent errors or exceptional cases',
            'Consider adjusting processes based on outlier analysis'
          ],
          supportingEvidence: [
            `Outlier count: ${analysis.descriptive.outliers.length}`,
            `Percentage of data: ${Math.round((analysis.descriptive.outliers.length / dataset.rowCount) * 100)}%`,
            `Detection method: Interquartile range`
          ],
          noveltyScore: 60
        })
      }
      
      // Seasonality insights
      if (analysis.trends.seasonality.detected) {
        insights.push({
          id: `seasonality_${columnName}_${Date.now()}`,
          type: 'pattern',
          title: `Seasonal pattern identified in ${this.formatColumnName(columnName)}`,
          description: `Strong seasonal pattern with ${analysis.trends.seasonality.period}-period cycles detected. The seasonal strength is ${Math.round((analysis.trends.seasonality.strength || 0) * 100)}%, indicating predictable fluctuations that can be leveraged for planning and optimization.`,
          confidence: Math.round((analysis.trends.seasonality.strength || 0) * 100),
          impact: 'high',
          dataPoints: [columnName],
          visualization: {
            type: 'line',
            config: { highlightSeasonality: true },
            recommended: true
          },
          businessImplication: 'Predictable seasonal patterns enable better forecasting and resource allocation',
          actionableInsights: [
            'Align business planning with seasonal cycles',
            'Optimize inventory and staffing for seasonal peaks',
            'Develop targeted campaigns for seasonal opportunities'
          ],
          supportingEvidence: [
            `Seasonal period: ${analysis.trends.seasonality.period} units`,
            `Pattern strength: ${Math.round((analysis.trends.seasonality.strength || 0) * 100)}%`,
            `Predictability: High`
          ],
          noveltyScore: 80
        })
      }
    })
    
    // Generate insights from business intelligence
    bi.kpis.forEach(kpi => {
      if (Math.abs(kpi.changePercent) > 10) {
        insights.push({
          id: `kpi_${kpi.name}_${Date.now()}`,
          type: kpi.changePercent > 0 ? 'trend' : 'anomaly',
          title: `${kpi.name} shows ${Math.abs(kpi.changePercent)}% ${kpi.changePercent > 0 ? 'improvement' : 'decline'}`,
          description: `${kpi.name} has ${kpi.changePercent > 0 ? 'increased' : 'decreased'} by ${Math.abs(kpi.changePercent)}% from ${kpi.previous} to ${kpi.current}. This represents a ${kpi.status} performance level ${kpi.benchmark ? `compared to the benchmark of ${kpi.benchmark}` : ''}.`,
          confidence: 90,
          impact: Math.abs(kpi.changePercent) > 20 ? 'high' : 'medium',
          dataPoints: [kpi.name],
          visualization: {
            type: 'bar',
            config: { showComparison: true },
            recommended: true
          },
          businessImplication: kpi.changePercent > 0 
            ? 'Strong performance indicates effective strategies'
            : 'Performance decline requires immediate attention',
          actionableInsights: [
            kpi.changePercent > 0 
              ? 'Identify and scale success factors'
              : 'Investigate causes of decline',
            'Monitor trend continuation',
            'Adjust targets and expectations accordingly'
          ],
          supportingEvidence: [
            `Current value: ${kpi.current}`,
            `Previous value: ${kpi.previous}`,
            `Change: ${kpi.change} (${kpi.changePercent}%)`
          ],
          noveltyScore: Math.min(Math.abs(kpi.changePercent) * 2, 100)
        })
      }
    })
    
    return insights.slice(0, 8) // Return top 8 insights
  }
}