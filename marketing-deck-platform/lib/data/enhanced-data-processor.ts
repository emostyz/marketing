// Enhanced Data Processing System
// This builds ON TOP of existing data processing without replacing it

import Papa from 'papaparse'

export interface ProcessedDataResult {
  data: any[]
  columns: string[]
  numericColumns: string[]
  categoryColumns: string[]
  dateColumns: string[]
  insights: DataInsight[]
  quality: DataQuality
  suggestions: ChartSuggestion[]
}

export interface DataInsight {
  type: 'trend' | 'correlation' | 'outlier' | 'pattern'
  column: string
  description: string
  confidence: number
  value: any
}

export interface DataQuality {
  completeness: number
  consistency: number
  accuracy: number
  uniqueness: number
  overall: number
}

export interface ChartSuggestion {
  type: 'bar' | 'line' | 'area' | 'donut' | 'scatter'
  title: string
  xAxis: string
  yAxis: string[]
  reasoning: string
  priority: number
}

export class EnhancedDataProcessor {
  // Process uploaded files with comprehensive analysis
  static async processFile(file: File): Promise<ProcessedDataResult> {
    console.log(`📊 Processing file: ${file.name} (${file.size} bytes)`)
    
    try {
      let rawData: any[] = []
      
      if (file.name.endsWith('.csv')) {
        rawData = await this.parseCSV(file)
      } else if (file.name.endsWith('.json')) {
        rawData = await this.parseJSON(file)
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        rawData = await this.parseExcel(file)
      } else {
        throw new Error('Unsupported file format. Please use CSV, JSON, or Excel files.')
      }
      
      if (!rawData || rawData.length === 0) {
        throw new Error('No data found in file')
      }
      
      // Clean and process the data
      const cleanedData = this.cleanData(rawData)
      const result = this.analyzeData(cleanedData)
      
      console.log(`✅ Processed ${result.data.length} rows with ${result.columns.length} columns`)
      return result
      
    } catch (error) {
      console.error('File processing error:', error)
      throw new Error(`Failed to process ${file.name}: ${error}`)
    }
  }
  
  // Enhanced CSV parsing with better error handling
  private static async parseCSV(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => {
          // Clean header names
          return header.trim().replace(/[^a-zA-Z0-9_]/g, '_')
        },
        transform: (value: string, header: string) => {
          // Handle common data cleaning
          if (typeof value === 'string') {
            value = value.trim()
            
            // Handle currency
            if (value.startsWith('$') || value.startsWith('€') || value.startsWith('£')) {
              const num = parseFloat(value.replace(/[^0-9.-]/g, ''))
              return isNaN(num) ? value : num
            }
            
            // Handle percentages
            if (value.endsWith('%')) {
              const num = parseFloat(value.replace('%', ''))
              return isNaN(num) ? value : num / 100
            }
            
            // Handle dates
            if (header.toLowerCase().includes('date') || header.toLowerCase().includes('time')) {
              const date = new Date(value)
              return isNaN(date.getTime()) ? value : date.toISOString().split('T')[0]
            }
          }
          
          return value
        },
        complete: (results) => {
          if (results.errors.length > 0) {
            console.warn('CSV parsing warnings:', results.errors)
          }
          resolve(results.data as any[])
        },
        error: (error) => {
          reject(new Error(`CSV parsing failed: ${error.message}`))
        }
      })
    })
  }
  
  // JSON parsing with validation
  private static async parseJSON(file: File): Promise<any[]> {
    const text = await file.text()
    const data = JSON.parse(text)
    
    if (Array.isArray(data)) {
      return data
    } else if (data.data && Array.isArray(data.data)) {
      return data.data
    } else {
      throw new Error('JSON file must contain an array of objects')
    }
  }
  
  // Excel parsing (would need additional library like xlsx)
  private static async parseExcel(file: File): Promise<any[]> {
    // For now, suggest CSV conversion
    throw new Error('Excel files are not yet supported. Please convert to CSV format.')
    
    // TODO: Implement Excel parsing with xlsx library
    // import * as XLSX from 'xlsx'
    // const workbook = XLSX.read(await file.arrayBuffer())
    // const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    // return XLSX.utils.sheet_to_json(worksheet)
  }
  
  // Clean and normalize data
  private static cleanData(rawData: any[]): any[] {
    return rawData.filter(row => {
      // Remove completely empty rows
      const values = Object.values(row).filter(val => val !== null && val !== undefined && val !== '')
      return values.length > 0
    }).map(row => {
      // Clean individual values
      const cleaned: any = {}
      for (const [key, value] of Object.entries(row)) {
        if (value === null || value === undefined || value === '') {
          cleaned[key] = null
        } else if (typeof value === 'string') {
          cleaned[key] = value.trim() || null
        } else {
          cleaned[key] = value
        }
      }
      return cleaned
    })
  }
  
  // Comprehensive data analysis
  private static analyzeData(data: any[]): ProcessedDataResult {
    if (data.length === 0) {
      throw new Error('No valid data rows found')
    }
    
    const columns = Object.keys(data[0])
    const numericColumns = this.identifyNumericColumns(data, columns)
    const categoryColumns = this.identifyCategoryColumns(data, columns)
    const dateColumns = this.identifyDateColumns(data, columns)
    
    const insights = this.generateInsights(data, numericColumns, categoryColumns)
    const quality = this.assessDataQuality(data, columns)
    const suggestions = this.generateChartSuggestions(data, numericColumns, categoryColumns, dateColumns)
    
    return {
      data,
      columns,
      numericColumns,
      categoryColumns,
      dateColumns,
      insights,
      quality,
      suggestions
    }
  }
  
  // Identify numeric columns
  private static identifyNumericColumns(data: any[], columns: string[]): string[] {
    return columns.filter(col => {
      const values = data.map(row => row[col]).filter(val => val !== null && val !== undefined)
      const numericValues = values.filter(val => typeof val === 'number' || !isNaN(Number(val)))
      return numericValues.length / values.length > 0.8 // 80% threshold
    })
  }
  
  // Identify category columns
  private static identifyCategoryColumns(data: any[], columns: string[]): string[] {
    return columns.filter(col => {
      const values = data.map(row => row[col]).filter(val => val !== null && val !== undefined)
      const uniqueValues = new Set(values).size
      return uniqueValues > 1 && uniqueValues < values.length * 0.5 // Less than 50% unique
    })
  }
  
  // Identify date columns
  private static identifyDateColumns(data: any[], columns: string[]): string[] {
    return columns.filter(col => {
      if (col.toLowerCase().includes('date') || col.toLowerCase().includes('time')) {
        return true
      }
      
      const values = data.slice(0, 10).map(row => row[col]).filter(val => val !== null)
      const dateValues = values.filter(val => {
        const date = new Date(val)
        return !isNaN(date.getTime())
      })
      
      return dateValues.length / values.length > 0.8
    })
  }
  
  // Generate data insights
  private static generateInsights(data: any[], numericColumns: string[], categoryColumns: string[]): DataInsight[] {
    const insights: DataInsight[] = []
    
    // Trend analysis for numeric columns
    for (const col of numericColumns) {
      const values = data.map(row => Number(row[col])).filter(val => !isNaN(val))
      if (values.length > 2) {
        const trend = this.calculateTrend(values)
        if (Math.abs(trend) > 5) {
          insights.push({
            type: 'trend',
            column: col,
            description: `${col} shows ${trend > 0 ? 'increasing' : 'decreasing'} trend of ${Math.abs(trend).toFixed(1)}%`,
            confidence: Math.min(Math.abs(trend) / 10, 1),
            value: trend
          })
        }
      }
    }
    
    // Correlation analysis
    if (numericColumns.length >= 2) {
      for (let i = 0; i < numericColumns.length - 1; i++) {
        for (let j = i + 1; j < numericColumns.length; j++) {
          const col1 = numericColumns[i]
          const col2 = numericColumns[j]
          const correlation = this.calculateCorrelation(data, col1, col2)
          
          if (Math.abs(correlation) > 0.5) {
            insights.push({
              type: 'correlation',
              column: `${col1} & ${col2}`,
              description: `Strong ${correlation > 0 ? 'positive' : 'negative'} correlation (${(correlation * 100).toFixed(0)}%) between ${col1} and ${col2}`,
              confidence: Math.abs(correlation),
              value: correlation
            })
          }
        }
      }
    }
    
    // Pattern detection in categories
    for (const col of categoryColumns) {
      const distribution = this.calculateDistribution(data, col)
      const maxPercent = Math.max(...Object.values(distribution))
      if (maxPercent > 0.6) {
        const dominantCategory = Object.entries(distribution).find(([_, percent]) => percent === maxPercent)?.[0]
        insights.push({
          type: 'pattern',
          column: col,
          description: `${dominantCategory} dominates ${col} with ${(maxPercent * 100).toFixed(0)}% of data`,
          confidence: maxPercent,
          value: dominantCategory
        })
      }
    }
    
    return insights.slice(0, 8) // Limit to top 8 insights
  }
  
  // Calculate trend percentage
  private static calculateTrend(values: number[]): number {
    if (values.length < 2) return 0
    const firstHalf = values.slice(0, Math.floor(values.length / 2))
    const secondHalf = values.slice(Math.floor(values.length / 2))
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
    
    return firstAvg === 0 ? 0 : ((secondAvg - firstAvg) / firstAvg) * 100
  }
  
  // Calculate correlation between two columns
  private static calculateCorrelation(data: any[], col1: string, col2: string): number {
    const values1 = data.map(row => Number(row[col1])).filter(val => !isNaN(val))
    const values2 = data.map(row => Number(row[col2])).filter(val => !isNaN(val))
    
    if (values1.length !== values2.length || values1.length < 3) return 0
    
    const mean1 = values1.reduce((a, b) => a + b, 0) / values1.length
    const mean2 = values2.reduce((a, b) => a + b, 0) / values2.length
    
    const numerator = values1.reduce((sum, val, i) => sum + (val - mean1) * (values2[i] - mean2), 0)
    const denominator = Math.sqrt(
      values1.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0) *
      values2.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0)
    )
    
    return denominator === 0 ? 0 : numerator / denominator
  }
  
  // Calculate distribution for categorical data
  private static calculateDistribution(data: any[], column: string): Record<string, number> {
    const counts: Record<string, number> = {}
    const total = data.length
    
    data.forEach(row => {
      const value = String(row[column] || 'Unknown')
      counts[value] = (counts[value] || 0) + 1
    })
    
    const distribution: Record<string, number> = {}
    for (const [key, count] of Object.entries(counts)) {
      distribution[key] = count / total
    }
    
    return distribution
  }
  
  // Assess overall data quality
  private static assessDataQuality(data: any[], columns: string[]): DataQuality {
    const totalCells = data.length * columns.length
    let nullCells = 0
    let inconsistentCells = 0
    
    // Count nulls and inconsistencies
    for (const row of data) {
      for (const col of columns) {
        if (row[col] === null || row[col] === undefined || row[col] === '') {
          nullCells++
        }
      }
    }
    
    const completeness = ((totalCells - nullCells) / totalCells) * 100
    const consistency = Math.max(0, 100 - (inconsistentCells / totalCells) * 100)
    const accuracy = Math.min(100, 80 + (completeness - 80) * 0.5) // Estimate based on completeness
    const uniqueness = columns.length > 0 ? (new Set(data.map(row => JSON.stringify(row))).size / data.length) * 100 : 100
    
    const overall = (completeness + consistency + accuracy + uniqueness) / 4
    
    return {
      completeness: Math.round(completeness),
      consistency: Math.round(consistency),
      accuracy: Math.round(accuracy),
      uniqueness: Math.round(uniqueness),
      overall: Math.round(overall)
    }
  }
  
  // Generate intelligent chart suggestions
  private static generateChartSuggestions(data: any[], numericColumns: string[], categoryColumns: string[], dateColumns: string[]): ChartSuggestion[] {
    const suggestions: ChartSuggestion[] = []
    
    // Time series charts for date + numeric data
    if (dateColumns.length > 0 && numericColumns.length > 0) {
      suggestions.push({
        type: 'line',
        title: `${numericColumns[0]} Over Time`,
        xAxis: dateColumns[0],
        yAxis: [numericColumns[0]],
        reasoning: 'Time series data is best visualized with line charts to show trends',
        priority: 10
      })
    }
    
    // Category comparison charts
    if (categoryColumns.length > 0 && numericColumns.length > 0) {
      suggestions.push({
        type: 'bar',
        title: `${numericColumns[0]} by ${categoryColumns[0]}`,
        xAxis: categoryColumns[0],
        yAxis: [numericColumns[0]],
        reasoning: 'Bar charts are ideal for comparing values across categories',
        priority: 9
      })
    }
    
    // Multi-metric area charts
    if (numericColumns.length >= 2) {
      suggestions.push({
        type: 'area',
        title: 'Multi-Metric Performance',
        xAxis: categoryColumns[0] || dateColumns[0] || 'Index',
        yAxis: numericColumns.slice(0, 3),
        reasoning: 'Area charts show cumulative impact of multiple metrics',
        priority: 8
      })
    }
    
    // Distribution charts for single category
    if (categoryColumns.length > 0) {
      const distribution = this.calculateDistribution(data, categoryColumns[0])
      if (Object.keys(distribution).length <= 8) {
        suggestions.push({
          type: 'donut',
          title: `${categoryColumns[0]} Distribution`,
          xAxis: categoryColumns[0],
          yAxis: ['Count'],
          reasoning: 'Donut charts effectively show proportional distributions',
          priority: 7
        })
      }
    }
    
    return suggestions.sort((a, b) => b.priority - a.priority).slice(0, 4)
  }
}