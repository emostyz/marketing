// Advanced Data Preparation for AI Analysis
// Prepares uploaded data for optimal LLM consumption

export interface AIReadyData {
  summary: DataSummary
  sampleData: any[]
  fullDataAvailable: boolean
  context: DataContext
  datasetIds?: string[]
}

export interface DataSummary {
  totalRows: number
  totalColumns: number
  columns: ColumnInfo[]
  timeRange?: TimeRange
  categories: CategoryInfo[]
  numericalSummary: NumericalSummary
  dataQuality: DataQuality
}

export interface ColumnInfo {
  name: string
  type: 'numeric' | 'string' | 'date' | 'boolean' | 'mixed'
  uniqueValues: number
  nullCount: number
  sampleValues: any[]
  stats?: ColumnStats
}

export interface ColumnStats {
  min?: number
  max?: number
  mean?: number
  median?: number
  stdDev?: number
  percentiles?: { p25: number; p50: number; p75: number; p95: number }
}

export interface TimeRange {
  start: string
  end: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'irregular'
  gaps: string[]
}

export interface CategoryInfo {
  column: string
  categories: { value: string; count: number; percentage: number }[]
  dominantCategory: string
}

export interface NumericalSummary {
  columns: string[]
  correlations: { col1: string; col2: string; correlation: number }[]
  outliers: { column: string; value: any; row: number }[]
  trends: { column: string; trend: 'increasing' | 'decreasing' | 'stable' | 'volatile' }[]
}

export interface DataQuality {
  score: number // 0-100
  issues: string[]
  strengths: string[]
  recommendations: string[]
}

export interface DataContext {
  industry?: string
  dataQuality: DataQuality
  suggestedFocus: string[]
  businessRelevance: string[]
}

export class DataPreparationEngine {
  
  /**
   * Prepare raw data for AI analysis
   */
  static prepareDataForAI(
    rawData: any[], 
    metadata?: any,
    context?: { industry?: string; businessContext?: string }
  ): AIReadyData {
    console.log('🔧 Preparing data for AI analysis...', { 
      rows: rawData.length, 
      industry: context?.industry 
    })

    if (!rawData || rawData.length === 0) {
      throw new Error('No data provided for analysis')
    }

    // Analyze data structure
    const columns = this.analyzeColumns(rawData)
    const dataQuality = this.assessDataQuality(rawData, columns)
    const timeRange = this.detectTimeRange(rawData, columns)
    const categories = this.analyzeCategories(rawData, columns)
    const numericalSummary = this.analyzeNumericalData(rawData, columns)

    // Generate intelligent sample
    const sampleData = this.intelligentSampling(rawData, 150)

    // Create summary
    const summary: DataSummary = {
      totalRows: rawData.length,
      totalColumns: columns.length,
      columns,
      timeRange,
      categories,
      numericalSummary,
      dataQuality
    }

    // Generate context insights
    const dataContext: DataContext = {
      industry: context?.industry,
      dataQuality,
      suggestedFocus: this.suggestAnalysisFocus(summary, context),
      businessRelevance: this.identifyBusinessRelevance(summary, context)
    }

    return {
      summary,
      sampleData,
      fullDataAvailable: true,
      context: dataContext
    }
  }

  /**
   * Analyze column types and characteristics
   */
  private static analyzeColumns(data: any[]): ColumnInfo[] {
    const firstRow = data[0]
    if (!firstRow || typeof firstRow !== 'object') {
      throw new Error('Invalid data format - expected array of objects')
    }

    const columnNames = Object.keys(firstRow)
    
    return columnNames.map(name => {
      const values = data.map(row => row[name]).filter(v => v != null)
      const uniqueValues = new Set(values).size
      const nullCount = data.length - values.length

      // Detect type
      const type = this.detectColumnType(values)
      
      // Get sample values (up to 5 unique)
      const sampleValues = Array.from(new Set(values)).slice(0, 5)

      // Calculate stats for numeric columns
      let stats: ColumnStats | undefined
      if (type === 'numeric') {
        stats = this.calculateColumnStats(values.map(Number))
      }

      return {
        name,
        type,
        uniqueValues,
        nullCount,
        sampleValues,
        stats
      }
    })
  }

  /**
   * Detect column data type
   */
  private static detectColumnType(values: any[]): ColumnInfo['type'] {
    if (values.length === 0) return 'mixed'

    const sample = values.slice(0, 100) // Sample for performance
    
    // Check for dates
    const datePattern = /^\d{4}-\d{2}-\d{2}|^\d{1,2}\/\d{1,2}\/\d{4}|^\d{2}\/\d{2}\/\d{4}/
    if (sample.some(v => datePattern.test(String(v)) || !isNaN(Date.parse(String(v))))) {
      return 'date'
    }

    // Check for numbers
    const numericCount = sample.filter(v => !isNaN(Number(v))).length
    if (numericCount / sample.length > 0.8) {
      return 'numeric'
    }

    // Check for booleans
    const booleanValues = new Set(['true', 'false', '1', '0', 'yes', 'no'])
    const booleanCount = sample.filter(v => 
      booleanValues.has(String(v).toLowerCase())
    ).length
    if (booleanCount / sample.length > 0.8) {
      return 'boolean'
    }

    return 'string'
  }

  /**
   * Calculate statistics for numeric columns
   */
  private static calculateColumnStats(values: number[]): ColumnStats {
    const sorted = values.sort((a, b) => a - b)
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
    
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      mean,
      median: sorted[Math.floor(sorted.length / 2)],
      stdDev: Math.sqrt(variance),
      percentiles: {
        p25: sorted[Math.floor(sorted.length * 0.25)],
        p50: sorted[Math.floor(sorted.length * 0.5)],
        p75: sorted[Math.floor(sorted.length * 0.75)],
        p95: sorted[Math.floor(sorted.length * 0.95)]
      }
    }
  }

  /**
   * Assess overall data quality
   */
  private static assessDataQuality(data: any[], columns: ColumnInfo[]): DataQuality {
    const issues: string[] = []
    const strengths: string[] = []
    const recommendations: string[] = []

    // Check for missing data
    const totalCells = data.length * columns.length
    const nullCells = columns.reduce((sum, col) => sum + col.nullCount, 0)
    const completeness = ((totalCells - nullCells) / totalCells) * 100

    if (completeness < 80) {
      issues.push(`High missing data rate: ${(100 - completeness).toFixed(1)}%`)
      recommendations.push('Consider data cleaning or imputation strategies')
    } else if (completeness > 95) {
      strengths.push('Excellent data completeness')
    }

    // Check for duplicate rows
    const uniqueRows = new Set(data.map(row => JSON.stringify(row))).size
    if (uniqueRows < data.length * 0.95) {
      issues.push('Potential duplicate records detected')
      recommendations.push('Remove duplicate entries for cleaner analysis')
    }

    // Check data size
    if (data.length < 10) {
      issues.push('Very small dataset - limited statistical significance')
    } else if (data.length > 1000) {
      strengths.push('Large dataset enabling robust statistical analysis')
    }

    // Check column variety
    const numericColumns = columns.filter(c => c.type === 'numeric').length
    if (numericColumns === 0) {
      issues.push('No numeric columns for quantitative analysis')
    } else if (numericColumns > 5) {
      strengths.push('Rich numeric data for comprehensive analysis')
    }

    // Calculate overall score
    let score = 60 // Base score
    score += Math.min(completeness * 0.3, 30) // Up to 30 points for completeness
    score += Math.min(numericColumns * 5, 15) // Up to 15 points for numeric variety
    score -= issues.length * 5 // Deduct for issues
    
    return {
      score: Math.max(0, Math.min(100, score)),
      issues,
      strengths,
      recommendations
    }
  }

  /**
   * Detect time range in data
   */
  private static detectTimeRange(data: any[], columns: ColumnInfo[]): TimeRange | undefined {
    const dateColumns = columns.filter(c => c.type === 'date')
    if (dateColumns.length === 0) return undefined

    // Use the first date column
    const dateColumn = dateColumns[0]
    const dates = data
      .map(row => new Date(row[dateColumn.name]))
      .filter(date => !isNaN(date.getTime()))
      .sort((a, b) => a.getTime() - b.getTime())

    if (dates.length === 0) return undefined

    const start = dates[0].toISOString().split('T')[0]
    const end = dates[dates.length - 1].toISOString().split('T')[0]

    // Detect frequency
    let frequency: TimeRange['frequency'] = 'irregular'
    if (dates.length > 1) {
      const intervals = []
      for (let i = 1; i < Math.min(dates.length, 10); i++) {
        intervals.push(dates[i].getTime() - dates[i-1].getTime())
      }
      const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length
      const days = avgInterval / (1000 * 60 * 60 * 24)

      if (days <= 1.5) frequency = 'daily'
      else if (days <= 8) frequency = 'weekly'
      else if (days <= 35) frequency = 'monthly'
      else if (days <= 100) frequency = 'quarterly'
      else frequency = 'yearly'
    }

    return { start, end, frequency, gaps: [] }
  }

  /**
   * Analyze categorical data
   */
  private static analyzeCategories(data: any[], columns: ColumnInfo[]): CategoryInfo[] {
    return columns
      .filter(col => col.type === 'string' && col.uniqueValues <= 50)
      .map(col => {
        const values = data.map(row => row[col.name]).filter(v => v != null)
        const counts = new Map<string, number>()
        
        values.forEach(value => {
          const str = String(value)
          counts.set(str, (counts.get(str) || 0) + 1)
        })

        const categories = Array.from(counts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 20) // Top 20 categories
          .map(([value, count]) => ({
            value,
            count,
            percentage: (count / values.length) * 100
          }))

        return {
          column: col.name,
          categories,
          dominantCategory: categories[0]?.value || ''
        }
      })
  }

  /**
   * Analyze numerical relationships
   */
  private static analyzeNumericalData(data: any[], columns: ColumnInfo[]): NumericalSummary {
    const numericColumns = columns.filter(c => c.type === 'numeric')
    
    // Calculate correlations
    const correlations: { col1: string; col2: string; correlation: number }[] = []
    for (let i = 0; i < numericColumns.length; i++) {
      for (let j = i + 1; j < numericColumns.length; j++) {
        const col1 = numericColumns[i].name
        const col2 = numericColumns[j].name
        
        const values1 = data.map(row => Number(row[col1])).filter(v => !isNaN(v))
        const values2 = data.map(row => Number(row[col2])).filter(v => !isNaN(v))
        
        if (values1.length === values2.length && values1.length > 2) {
          const correlation = this.calculateCorrelation(values1, values2)
          if (Math.abs(correlation) > 0.3) { // Only significant correlations
            correlations.push({ col1, col2, correlation })
          }
        }
      }
    }

    // Detect outliers and trends
    const outliers: { column: string; value: any; row: number }[] = []
    const trends: { column: string; trend: 'increasing' | 'decreasing' | 'stable' | 'volatile' }[] = []

    numericColumns.forEach(col => {
      const values = data.map((row, index) => ({ value: Number(row[col.name]), index }))
        .filter(v => !isNaN(v.value))

      // Detect outliers using IQR method
      const sortedValues = values.map(v => v.value).sort((a, b) => a - b)
      const q1 = sortedValues[Math.floor(sortedValues.length * 0.25)]
      const q3 = sortedValues[Math.floor(sortedValues.length * 0.75)]
      const iqr = q3 - q1
      const lowerBound = q1 - 1.5 * iqr
      const upperBound = q3 + 1.5 * iqr

      values.forEach(({ value, index }) => {
        if (value < lowerBound || value > upperBound) {
          outliers.push({ column: col.name, value, row: index })
        }
      })

      // Detect trend
      if (values.length > 5) {
        const trend = this.detectTrend(values.map(v => v.value))
        trends.push({ column: col.name, trend })
      }
    })

    return {
      columns: numericColumns.map(c => c.name),
      correlations,
      outliers: outliers.slice(0, 20), // Limit outliers
      trends
    }
  }

  /**
   * Calculate correlation coefficient
   */
  private static calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length
    const sumX = x.reduce((sum, val) => sum + val, 0)
    const sumY = y.reduce((sum, val) => sum + val, 0)
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0)
    const sumXX = x.reduce((sum, val) => sum + val * val, 0)
    const sumYY = y.reduce((sum, val) => sum + val * val, 0)

    const numerator = n * sumXY - sumX * sumY
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY))

    return denominator === 0 ? 0 : numerator / denominator
  }

  /**
   * Detect trend in time series data
   */
  private static detectTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' | 'volatile' {
    if (values.length < 3) return 'stable'

    // Calculate differences
    const diffs = []
    for (let i = 1; i < values.length; i++) {
      diffs.push(values[i] - values[i-1])
    }

    const avgDiff = diffs.reduce((sum, diff) => sum + diff, 0) / diffs.length
    const variance = diffs.reduce((sum, diff) => sum + Math.pow(diff - avgDiff, 2), 0) / diffs.length
    const stdDev = Math.sqrt(variance)

    // If standard deviation is very high relative to mean, it's volatile
    if (stdDev > Math.abs(avgDiff) * 3) return 'volatile'

    // Determine trend based on average difference
    const threshold = Math.max(Math.abs(avgDiff) * 0.1, stdDev * 0.5)
    if (avgDiff > threshold) return 'increasing'
    if (avgDiff < -threshold) return 'decreasing'
    return 'stable'
  }

  /**
   * Intelligent sampling for large datasets
   */
  private static intelligentSampling(data: any[], targetSize: number): any[] {
    if (data.length <= targetSize) return data

    const samples = []
    const step = Math.floor(data.length / targetSize)

    // Always include first and last
    samples.push(data[0])

    // Stratified sampling
    for (let i = step; i < data.length - 1; i += step) {
      samples.push(data[i])
    }

    samples.push(data[data.length - 1])

    // Fill remaining slots with random samples
    while (samples.length < targetSize && samples.length < data.length) {
      const randomIndex = Math.floor(Math.random() * data.length)
      if (!samples.includes(data[randomIndex])) {
        samples.push(data[randomIndex])
      }
    }

    return samples.slice(0, targetSize)
  }

  /**
   * Suggest analysis focus areas based on data characteristics
   */
  private static suggestAnalysisFocus(summary: DataSummary, context?: any): string[] {
    const suggestions = []

    // Time series analysis
    if (summary.timeRange) {
      suggestions.push('Time series trends and seasonality')
      suggestions.push('Period-over-period comparisons')
    }

    // Correlation analysis
    if (summary.numericalSummary.correlations.length > 0) {
      suggestions.push('Correlation and relationship analysis')
    }

    // Category analysis
    if (summary.categories.length > 0) {
      suggestions.push('Categorical performance analysis')
      suggestions.push('Segmentation insights')
    }

    // Outlier analysis
    if (summary.numericalSummary.outliers.length > 0) {
      suggestions.push('Anomaly detection and outlier analysis')
    }

    // Industry-specific suggestions
    if (context?.industry) {
      switch (context.industry.toLowerCase()) {
        case 'finance':
        case 'financial':
          suggestions.push('Risk assessment', 'Performance metrics', 'ROI analysis')
          break
        case 'sales':
        case 'marketing':
          suggestions.push('Conversion funnel analysis', 'Customer segmentation', 'Campaign performance')
          break
        case 'operations':
        case 'manufacturing':
          suggestions.push('Efficiency optimization', 'Quality metrics', 'Process improvement')
          break
        case 'hr':
        case 'human resources':
          suggestions.push('Employee performance', 'Retention analysis', 'Productivity metrics')
          break
      }
    }

    // Default suggestions
    if (suggestions.length === 0) {
      suggestions.push('Key performance indicators', 'Trend analysis', 'Comparative insights')
    }

    return suggestions.slice(0, 5) // Limit to top 5
  }

  /**
   * Identify business relevance of data patterns
   */
  private static identifyBusinessRelevance(summary: DataSummary, context?: any): string[] {
    const relevance = []

    // Revenue/financial relevance
    const revenueColumns = summary.columns.filter(col => 
      /revenue|sales|income|profit|cost|price|amount/i.test(col.name)
    )
    if (revenueColumns.length > 0) {
      relevance.push('Financial performance indicators')
    }

    // Customer relevance
    const customerColumns = summary.columns.filter(col =>
      /customer|client|user|buyer|visitor/i.test(col.name)
    )
    if (customerColumns.length > 0) {
      relevance.push('Customer behavior and preferences')
    }

    // Operational relevance
    const operationalColumns = summary.columns.filter(col =>
      /quantity|volume|count|rate|efficiency|time|duration/i.test(col.name)
    )
    if (operationalColumns.length > 0) {
      relevance.push('Operational efficiency metrics')
    }

    // Geographic relevance
    const geoColumns = summary.columns.filter(col =>
      /region|country|state|city|location|geography/i.test(col.name)
    )
    if (geoColumns.length > 0) {
      relevance.push('Geographic market insights')
    }

    return relevance
  }
}