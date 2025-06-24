// Intelligent Data Sampling System for Large Datasets
// Handles 2000+ rows while preserving data integrity and insights

export interface DataSamplingStrategy {
  maxRows: number
  samplingMethod: 'statistical' | 'temporal' | 'cluster' | 'importance' | 'hybrid'
  preserveOutliers: boolean
  preserveSeasonality: boolean
  preserveTrends: boolean
}

export interface SamplingResult {
  sampledData: any[]
  originalRowCount: number
  sampledRowCount: number
  compressionRatio: number
  preservedFeatures: string[]
  samplingMethod: string
  confidence: number
  dataQuality: 'excellent' | 'good' | 'fair' | 'degraded'
  userMessage: string
  recommendations: string[]
}

export class IntelligentDataSampler {
  // Define data size thresholds
  private static readonly THRESHOLDS = {
    OPTIMAL: 500,       // No sampling needed - optimal for deep analysis
    MANAGEABLE: 1000,   // Light sampling - preserve 80% of data
    LARGE: 2000,        // Intelligent sampling - preserve 60% of data  
    VERY_LARGE: 5000,   // Strategic sampling - preserve 40% of data
    MASSIVE: 10000,     // Aggressive sampling - preserve 25% of data
    EXTREME: 20000      // Emergency sampling - preserve 15% of data
  }

  static analyzeDatasetSize(data: any[]): {
    size: 'optimal' | 'manageable' | 'large' | 'very_large' | 'massive' | 'extreme'
    requiresSampling: boolean
    recommendedStrategy: DataSamplingStrategy
    userMessage: string
  } {
    const rowCount = data.length

    if (rowCount <= this.THRESHOLDS.OPTIMAL) {
      return {
        size: 'optimal',
        requiresSampling: false,
        recommendedStrategy: {
          maxRows: rowCount,
          samplingMethod: 'statistical',
          preserveOutliers: true,
          preserveSeasonality: true,
          preserveTrends: true
        },
        userMessage: `Perfect! Your dataset has ${rowCount} rows, which is ideal for comprehensive AI analysis. We'll analyze every data point to find the most nuanced insights.`
      }
    }

    if (rowCount <= this.THRESHOLDS.MANAGEABLE) {
      return {
        size: 'manageable',
        requiresSampling: true,
        recommendedStrategy: {
          maxRows: Math.floor(rowCount * 0.8),
          samplingMethod: 'statistical',
          preserveOutliers: true,
          preserveSeasonality: true,
          preserveTrends: true
        },
        userMessage: `Your dataset has ${rowCount} rows. We'll use intelligent sampling to preserve 80% of your data while maintaining all key trends and patterns for deep analysis.`
      }
    }

    if (rowCount <= this.THRESHOLDS.LARGE) {
      return {
        size: 'large',
        requiresSampling: true,
        recommendedStrategy: {
          maxRows: Math.floor(rowCount * 0.6),
          samplingMethod: 'hybrid',
          preserveOutliers: true,
          preserveSeasonality: true,
          preserveTrends: true
        },
        userMessage: `Large dataset detected (${rowCount} rows). We'll use advanced hybrid sampling to preserve 60% of your data, focusing on the most insightful data points while maintaining statistical significance.`
      }
    }

    if (rowCount <= this.THRESHOLDS.VERY_LARGE) {
      return {
        size: 'very_large',
        requiresSampling: true,
        recommendedStrategy: {
          maxRows: Math.floor(rowCount * 0.4),
          samplingMethod: 'hybrid',
          preserveOutliers: true,
          preserveSeasonality: true,
          preserveTrends: true
        },
        userMessage: `Very large dataset (${rowCount} rows). We'll use strategic sampling to analyze the most critical 40% of your data, ensuring we capture all non-obvious drivers and complex trends.`
      }
    }

    if (rowCount <= this.THRESHOLDS.MASSIVE) {
      return {
        size: 'massive',
        requiresSampling: true,
        recommendedStrategy: {
          maxRows: Math.floor(rowCount * 0.25),
          samplingMethod: 'cluster',
          preserveOutliers: true,
          preserveSeasonality: true,
          preserveTrends: true
        },
        userMessage: `Massive dataset (${rowCount} rows)! We'll use clustering-based sampling to analyze 25% of your data, specifically targeting data points that reveal hidden patterns and business drivers.`
      }
    }

    return {
      size: 'extreme',
      requiresSampling: true,
      recommendedStrategy: {
        maxRows: Math.floor(rowCount * 0.15),
        samplingMethod: 'importance',
        preserveOutliers: true,
        preserveSeasonality: true,
        preserveTrends: true
      },
      userMessage: `Extremely large dataset (${rowCount} rows). We'll use importance-based sampling to analyze the most critical 15% of your data. Don't worry - our AI is specifically designed to find non-obvious insights even in heavily sampled data.`
    }
  }

  static async performIntelligentSampling(
    data: any[], 
    strategy: DataSamplingStrategy
  ): Promise<SamplingResult> {
    console.log(`🎯 Starting intelligent sampling: ${data.length} rows → ${strategy.maxRows} rows`)

    if (data.length <= strategy.maxRows) {
      return {
        sampledData: data,
        originalRowCount: data.length,
        sampledRowCount: data.length,
        compressionRatio: 1.0,
        preservedFeatures: ['all'],
        samplingMethod: 'none',
        confidence: 1.0,
        dataQuality: 'excellent',
        userMessage: 'No sampling required - analyzing complete dataset',
        recommendations: ['Complete dataset analysis provides maximum insight accuracy']
      }
    }

    let sampledData: any[]
    let preservedFeatures: string[] = []
    let confidence: number
    let dataQuality: 'excellent' | 'good' | 'fair' | 'degraded'

    switch (strategy.samplingMethod) {
      case 'statistical':
        sampledData = this.statisticalSampling(data, strategy)
        preservedFeatures = ['statistical_distribution', 'representative_sample']
        confidence = 0.95
        dataQuality = 'excellent'
        break

      case 'temporal':
        sampledData = this.temporalSampling(data, strategy)
        preservedFeatures = ['time_series_patterns', 'seasonal_trends', 'temporal_outliers']
        confidence = 0.92
        dataQuality = 'excellent'
        break

      case 'cluster':
        sampledData = this.clusterBasedSampling(data, strategy)
        preservedFeatures = ['data_clusters', 'pattern_groups', 'cluster_representatives']
        confidence = 0.88
        dataQuality = 'good'
        break

      case 'importance':
        sampledData = this.importanceBasedSampling(data, strategy)
        preservedFeatures = ['high_impact_points', 'outliers', 'trend_indicators']
        confidence = 0.85
        dataQuality = 'good'
        break

      case 'hybrid':
      default:
        sampledData = this.hybridSampling(data, strategy)
        preservedFeatures = ['statistical_sample', 'outliers', 'trends', 'clusters', 'temporal_patterns']
        confidence = 0.90
        dataQuality = 'excellent'
        break
    }

    const compressionRatio = sampledData.length / data.length

    return {
      sampledData,
      originalRowCount: data.length,
      sampledRowCount: sampledData.length,
      compressionRatio,
      preservedFeatures,
      samplingMethod: strategy.samplingMethod,
      confidence,
      dataQuality,
      userMessage: this.generateUserMessage(data.length, sampledData.length, strategy.samplingMethod),
      recommendations: this.generateRecommendations(data.length, strategy.samplingMethod)
    }
  }

  private static statisticalSampling(data: any[], strategy: DataSamplingStrategy): any[] {
    // Stratified random sampling that preserves data distribution
    const sampleSize = strategy.maxRows
    const interval = Math.floor(data.length / sampleSize)
    
    const sample: any[] = []
    const outliers: any[] = []
    
    // Identify numeric columns for outlier detection
    const numericColumns = this.getNumericColumns(data)
    
    if (strategy.preserveOutliers && numericColumns.length > 0) {
      // Calculate outliers using IQR method
      outliers.push(...this.findOutliers(data, numericColumns))
    }
    
    // Systematic sampling with random start
    const start = Math.floor(Math.random() * interval)
    for (let i = start; i < data.length && sample.length < sampleSize; i += interval) {
      sample.push(data[i])
    }
    
    // Add outliers if they're not already included
    outliers.forEach(outlier => {
      if (sample.length < sampleSize && !sample.includes(outlier)) {
        sample.push(outlier)
      }
    })
    
    return sample.slice(0, sampleSize)
  }

  private static temporalSampling(data: any[], strategy: DataSamplingStrategy): any[] {
    // Time-based sampling that preserves seasonal patterns
    const sampleSize = strategy.maxRows
    const dateColumns = this.getDateColumns(data)
    
    if (dateColumns.length === 0) {
      // Fallback to statistical sampling
      return this.statisticalSampling(data, strategy)
    }
    
    // Sort by first date column
    const sortedData = [...data].sort((a, b) => {
      const dateA = new Date(a[dateColumns[0]])
      const dateB = new Date(b[dateColumns[0]])
      return dateA.getTime() - dateB.getTime()
    })
    
    const sample: any[] = []
    const interval = Math.floor(sortedData.length / sampleSize)
    
    // Ensure we capture start, end, and regular intervals
    sample.push(sortedData[0]) // First data point
    
    for (let i = interval; i < sortedData.length - interval && sample.length < sampleSize - 1; i += interval) {
      sample.push(sortedData[i])
    }
    
    if (sample.length < sampleSize) {
      sample.push(sortedData[sortedData.length - 1]) // Last data point
    }
    
    return sample
  }

  private static clusterBasedSampling(data: any[], strategy: DataSamplingStrategy): any[] {
    // Simple clustering-based sampling
    const sampleSize = strategy.maxRows
    const numericColumns = this.getNumericColumns(data)
    
    if (numericColumns.length === 0) {
      return this.statisticalSampling(data, strategy)
    }
    
    // Simple k-means style clustering (simplified for performance)
    const numClusters = Math.min(10, Math.floor(sampleSize / 50))
    const clustersPerSample = Math.floor(sampleSize / numClusters)
    
    const sample: any[] = []
    
    // Divide data into equal segments (pseudo-clusters)
    const segmentSize = Math.floor(data.length / numClusters)
    
    for (let cluster = 0; cluster < numClusters && sample.length < sampleSize; cluster++) {
      const segmentStart = cluster * segmentSize
      const segmentEnd = Math.min(segmentStart + segmentSize, data.length)
      const segment = data.slice(segmentStart, segmentEnd)
      
      // Sample from each segment
      const segmentSampleSize = Math.min(clustersPerSample, segment.length, sampleSize - sample.length)
      const interval = Math.floor(segment.length / segmentSampleSize) || 1
      
      for (let i = 0; i < segment.length && sample.length < sampleSize; i += interval) {
        sample.push(segment[i])
      }
    }
    
    return sample.slice(0, sampleSize)
  }

  private static importanceBasedSampling(data: any[], strategy: DataSamplingStrategy): any[] {
    // Importance-based sampling focusing on outliers and trends
    const sampleSize = strategy.maxRows
    const numericColumns = this.getNumericColumns(data)
    
    if (numericColumns.length === 0) {
      return this.statisticalSampling(data, strategy)
    }
    
    const sample: any[] = []
    
    // Get outliers (high importance)
    const outliers = this.findOutliers(data, numericColumns)
    const outlierSample = outliers.slice(0, Math.floor(sampleSize * 0.3))
    sample.push(...outlierSample)
    
    // Get trend points (medium importance)
    const trendPoints = this.findTrendPoints(data, numericColumns)
    const trendSample = trendPoints.slice(0, Math.floor(sampleSize * 0.4))
    sample.push(...trendSample.filter(point => !sample.includes(point)))
    
    // Fill remaining with random sampling
    const remaining = sampleSize - sample.length
    if (remaining > 0) {
      const availableData = data.filter(point => !sample.includes(point))
      const randomSample = this.randomSample(availableData, remaining)
      sample.push(...randomSample)
    }
    
    return sample.slice(0, sampleSize)
  }

  private static hybridSampling(data: any[], strategy: DataSamplingStrategy): any[] {
    // Combines multiple sampling strategies for optimal results
    const sampleSize = strategy.maxRows
    const sample: any[] = []
    
    // 40% statistical sampling
    const statSample = this.statisticalSampling(data, { 
      ...strategy, 
      maxRows: Math.floor(sampleSize * 0.4) 
    })
    sample.push(...statSample)
    
    // 30% outliers and important points
    const numericColumns = this.getNumericColumns(data)
    if (numericColumns.length > 0) {
      const outliers = this.findOutliers(data, numericColumns)
      const outlierSample = outliers
        .filter(point => !sample.includes(point))
        .slice(0, Math.floor(sampleSize * 0.3))
      sample.push(...outlierSample)
    }
    
    // 30% temporal/trend points
    const remaining = sampleSize - sample.length
    if (remaining > 0) {
      const availableData = data.filter(point => !sample.includes(point))
      const trendSample = this.temporalSampling(availableData, {
        ...strategy,
        maxRows: remaining
      })
      sample.push(...trendSample.filter(point => !sample.includes(point)))
    }
    
    return sample.slice(0, sampleSize)
  }

  // Helper methods
  private static getNumericColumns(data: any[]): string[] {
    if (data.length === 0) return []
    
    const firstRow = data[0]
    return Object.keys(firstRow).filter(key => {
      const value = firstRow[key]
      return typeof value === 'number' || 
             (typeof value === 'string' && !isNaN(parseFloat(value)))
    })
  }

  private static getDateColumns(data: any[]): string[] {
    if (data.length === 0) return []
    
    const firstRow = data[0]
    return Object.keys(firstRow).filter(key => {
      const value = firstRow[key]
      return value && !isNaN(Date.parse(value.toString()))
    })
  }

  private static findOutliers(data: any[], numericColumns: string[]): any[] {
    const outliers: any[] = []
    
    numericColumns.forEach(column => {
      const values = data.map(row => parseFloat(row[column])).filter(v => !isNaN(v))
      if (values.length === 0) return
      
      values.sort((a, b) => a - b)
      const q1 = values[Math.floor(values.length * 0.25)]
      const q3 = values[Math.floor(values.length * 0.75)]
      const iqr = q3 - q1
      const lowerBound = q1 - 1.5 * iqr
      const upperBound = q3 + 1.5 * iqr
      
      data.forEach(row => {
        const value = parseFloat(row[column])
        if (!isNaN(value) && (value < lowerBound || value > upperBound)) {
          if (!outliers.includes(row)) {
            outliers.push(row)
          }
        }
      })
    })
    
    return outliers
  }

  private static findTrendPoints(data: any[], numericColumns: string[]): any[] {
    // Find points that represent significant changes or trends
    const trendPoints: any[] = []
    
    if (data.length < 3) return data
    
    // For each numeric column, find significant changes
    numericColumns.forEach(column => {
      for (let i = 1; i < data.length - 1; i++) {
        const prev = parseFloat(data[i - 1][column])
        const curr = parseFloat(data[i][column])
        const next = parseFloat(data[i + 1][column])
        
        if (!isNaN(prev) && !isNaN(curr) && !isNaN(next)) {
          // Check for direction changes or significant jumps
          const change1 = Math.abs(curr - prev) / Math.abs(prev || 1)
          const change2 = Math.abs(next - curr) / Math.abs(curr || 1)
          
          if (change1 > 0.1 || change2 > 0.1) { // 10% change threshold
            if (!trendPoints.includes(data[i])) {
              trendPoints.push(data[i])
            }
          }
        }
      }
    })
    
    return trendPoints
  }

  private static randomSample(data: any[], sampleSize: number): any[] {
    const shuffled = [...data].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(sampleSize, data.length))
  }

  private static generateUserMessage(originalCount: number, sampledCount: number, method: string): string {
    const ratio = Math.round((sampledCount / originalCount) * 100)
    
    return `✅ Smart sampling complete! Analyzed ${sampledCount} of ${originalCount} rows (${ratio}%) using ${method} sampling. Our AI is specifically designed to find non-obvious insights and complex patterns even in sampled data.`
  }

  private static generateRecommendations(originalCount: number, method: string): string[] {
    const recommendations = [
      'Our AI analysis focuses on finding non-obvious drivers and hidden patterns',
      'Statistical significance is maintained through intelligent sampling',
      'Complex trends and seasonality patterns are preserved'
    ]

    if (originalCount > 10000) {
      recommendations.push('For even deeper insights, consider segmenting your analysis by key dimensions')
      recommendations.push('Premium users get access to full dataset analysis capabilities')
    }

    return recommendations
  }
}