import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export interface ParsedDataColumn {
  name: string
  type: 'number' | 'string' | 'date' | 'boolean'
  samples: any[]
  uniqueCount: number
  nullCount: number
}

export interface ParsedDataset {
  id: string
  fileName: string
  fileType: string
  columns: ParsedDataColumn[]
  rows: any[]
  rowCount: number
  summary: {
    numericColumns: string[]
    dateColumns: string[]
    categoryColumns: string[]
    keyColumns: string[]
  }
  insights: {
    timeSeriesDetected: boolean
    potentialMetrics: string[]
    potentialDimensions: string[]
    dataQuality: 'excellent' | 'good' | 'fair' | 'poor'
    completeness: number
  }
}

export class FileParser {
  
  static async parseFile(file: File): Promise<ParsedDataset> {
    const fileType = file.type || file.name.split('.').pop()?.toLowerCase()
    
    if (!fileType) {
      throw new Error('Unable to determine file type')
    }

    let rawData: any[]
    
    if (fileType.includes('csv') || file.name.endsWith('.csv')) {
      rawData = await this.parseCSV(file)
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet') || 
               file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      rawData = await this.parseExcel(file)
    } else {
      throw new Error(`Unsupported file type: ${fileType}`)
    }

    return this.analyzeData(rawData, file.name, fileType)
  }

  private static async parseCSV(file: File): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const text = await file.text()
        
        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim(),
          complete: (results) => {
            if (results.errors.length > 0) {
              console.warn('CSV parsing warnings:', results.errors)
            }
            resolve(results.data)
          },
          error: (error: any) => {
            reject(new Error(`CSV parsing failed: ${error.message}`))
          }
        })
      } catch (error) {
        reject(new Error(`Failed to read CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`))
      }
    })
  }

  private static async parseExcel(file: File): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const arrayBuffer = await file.arrayBuffer()
        const data = new Uint8Array(arrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        
        // Get the first worksheet
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        
        // Convert to JSON with header row
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          blankrows: false
        })
        
        if (jsonData.length === 0) {
          throw new Error('Excel file appears to be empty')
        }
        
        // Convert to objects with first row as headers
        const headers = jsonData[0] as string[]
        const rows = jsonData.slice(1).map(row => {
          const obj: any = {}
          headers.forEach((header, index) => {
            obj[header] = (row as any[])[index]
          })
          return obj
        })
        
        resolve(rows)
      } catch (error) {
        reject(new Error(`Excel parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`))
      }
    })
  }

  private static analyzeData(rawData: any[], fileName: string, fileType: string): ParsedDataset {
    if (!rawData || rawData.length === 0) {
      throw new Error('No data found in file')
    }

    // Get all column names
    const allColumns = new Set<string>()
    rawData.forEach(row => {
      Object.keys(row || {}).forEach(key => allColumns.add(key))
    })

    const columnNames = Array.from(allColumns)
    const columns: ParsedDataColumn[] = columnNames.map(colName => 
      this.analyzeColumn(colName, rawData)
    )

    // Categorize columns
    const numericColumns = columns.filter(col => col.type === 'number').map(col => col.name)
    const dateColumns = columns.filter(col => col.type === 'date').map(col => col.name)
    const categoryColumns = columns.filter(col => 
      col.type === 'string' && col.uniqueCount < rawData.length * 0.5
    ).map(col => col.name)

    // Detect key columns (likely dimensions)
    const keyColumns = this.identifyKeyColumns(columns, rawData.length)

    // Data quality assessment
    const totalCells = rawData.length * columns.length
    const nullCells = columns.reduce((sum, col) => sum + col.nullCount, 0)
    const completeness = ((totalCells - nullCells) / totalCells) * 100

    let dataQuality: 'excellent' | 'good' | 'fair' | 'poor'
    if (completeness >= 95) dataQuality = 'excellent'
    else if (completeness >= 85) dataQuality = 'good'
    else if (completeness >= 70) dataQuality = 'fair'
    else dataQuality = 'poor'

    // Time series detection
    const timeSeriesDetected = this.detectTimeSeries(columns, rawData)

    // Identify potential metrics and dimensions
    const potentialMetrics = numericColumns.filter(col => 
      !this.isIdColumn(col) && !this.isPercentageColumn(col, rawData)
    )
    
    const potentialDimensions = [...categoryColumns, ...dateColumns]

    return {
      id: `dataset_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      fileName,
      fileType,
      columns,
      rows: rawData,
      rowCount: rawData.length,
      summary: {
        numericColumns,
        dateColumns,
        categoryColumns,
        keyColumns
      },
      insights: {
        timeSeriesDetected,
        potentialMetrics,
        potentialDimensions,
        dataQuality,
        completeness: Math.round(completeness)
      }
    }
  }

  private static analyzeColumn(columnName: string, data: any[]): ParsedDataColumn {
    const values = data.map(row => row[columnName]).filter(val => val !== null && val !== undefined && val !== '')
    const nonNullCount = values.length
    const nullCount = data.length - nonNullCount
    
    if (values.length === 0) {
      return {
        name: columnName,
        type: 'string',
        samples: [],
        uniqueCount: 0,
        nullCount
      }
    }

    // Type detection
    const numericValues = values.filter(val => !isNaN(Number(val)) && isFinite(Number(val)))
    const dateValues = values.filter(val => this.isDateLike(val))
    
    let type: 'number' | 'string' | 'date' | 'boolean'
    
    if (dateValues.length > values.length * 0.7) {
      type = 'date'
    } else if (numericValues.length > values.length * 0.8) {
      type = 'number'
    } else if (values.every(val => typeof val === 'boolean' || val === 'true' || val === 'false' || val === 1 || val === 0)) {
      type = 'boolean'
    } else {
      type = 'string'
    }

    const uniqueValues = new Set(values)
    const samples = Array.from(uniqueValues).slice(0, 5)

    return {
      name: columnName,
      type,
      samples,
      uniqueCount: uniqueValues.size,
      nullCount
    }
  }

  private static isDateLike(value: any): boolean {
    if (!value) return false
    
    const date = new Date(value)
    
    // Check if it's a valid date
    if (isNaN(date.getTime())) return false
    
    // Check common date patterns
    const str = String(value)
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}/, // YYYY-MM-DD
      /^\d{2}\/\d{2}\/\d{4}/, // MM/DD/YYYY
      /^\d{2}-\d{2}-\d{4}/, // MM-DD-YYYY
      /^\d{1,2}\/\d{1,2}\/\d{2,4}/, // M/D/YY or MM/DD/YYYY
      /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i, // Month names
      /^\d{4}$/ // Just year
    ]
    
    return datePatterns.some(pattern => pattern.test(str))
  }

  private static identifyKeyColumns(columns: ParsedDataColumn[], dataLength: number): string[] {
    return columns
      .filter(col => {
        // Likely to be a key/dimension if:
        // 1. Has reasonable unique count (not too few, not too many)
        // 2. Not purely numeric (unless it's an ID)
        // 3. Not date columns
        const uniqueRatio = col.uniqueCount / dataLength
        
        return (
          col.type === 'string' && 
          uniqueRatio > 0.1 && 
          uniqueRatio < 0.9 &&
          col.name.toLowerCase().includes('category') ||
          col.name.toLowerCase().includes('type') ||
          col.name.toLowerCase().includes('region') ||
          col.name.toLowerCase().includes('product') ||
          col.name.toLowerCase().includes('segment')
        )
      })
      .map(col => col.name)
  }

  private static detectTimeSeries(columns: ParsedDataColumn[], data: any[]): boolean {
    // Look for date columns
    const hasDateColumn = columns.some(col => col.type === 'date')
    
    // Look for time-related column names
    const timeColumns = columns.filter(col => {
      const name = col.name.toLowerCase()
      return name.includes('date') || name.includes('time') || 
             name.includes('month') || name.includes('year') ||
             name.includes('period') || name.includes('quarter')
    })
    
    return hasDateColumn || timeColumns.length > 0
  }

  private static isIdColumn(columnName: string): boolean {
    const name = columnName.toLowerCase()
    return name.includes('id') || name.includes('key') || name === 'index'
  }

  private static isPercentageColumn(columnName: string, data: any[]): boolean {
    const name = columnName.toLowerCase()
    const isPercentageName = name.includes('percent') || name.includes('rate') || name.includes('%')
    
    if (isPercentageName) return true
    
    // Check if values are between 0-100 and could be percentages
    const values = data.map(row => row[columnName]).filter(val => !isNaN(Number(val)))
    if (values.length === 0) return false
    
    const allBetween0And100 = values.every(val => Number(val) >= 0 && Number(val) <= 100)
    const avgValue = values.reduce((sum, val) => sum + Number(val), 0) / values.length
    
    return allBetween0And100 && avgValue < 50 // Likely percentage if avg is reasonable
  }
}