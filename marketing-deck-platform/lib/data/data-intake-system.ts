import { z } from 'zod'
import Papa from 'papaparse'

// Schema definitions for data validation
export const DatasetSchema = z.object({
  id: z.string(),
  filename: z.string(),
  uploadedAt: z.date(),
  userId: z.string(),
  fileType: z.enum(['csv', 'xlsx', 'json']),
  size: z.number(),
  rows: z.number(),
  columns: z.array(z.string()),
  schema: z.record(z.string()),
  preview: z.array(z.record(z.any())).max(10),
  processed: z.boolean().default(false),
  validationErrors: z.array(z.string()).optional(),
  metadata: z.object({
    hasHeaders: z.boolean(),
    encoding: z.string(),
    delimiter: z.string().optional(),
    dateColumns: z.array(z.string()).optional(),
    numericColumns: z.array(z.string()).optional(),
    categoricalColumns: z.array(z.string()).optional()
  })
})

export type Dataset = z.infer<typeof DatasetSchema>

export interface DataValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
  schema: Record<string, string>
  preview: Record<string, any>[]
  metadata: Dataset['metadata']
}

export class DataIntakeSystem {
  private maxFileSize = 10 * 1024 * 1024 // 10MB
  private supportedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/json']

  async validateAndProcessFile(
    file: File, 
    userId: string
  ): Promise<{ success: boolean; data?: Dataset; error?: string }> {
    try {
      // Basic file validation
      const validation = this.validateFile(file)
      if (!validation.isValid) {
        return { success: false, error: validation.error }
      }

      // Process based on file type
      const processedData = await this.processFileContent(file)
      if (!processedData.success) {
        return { success: false, error: processedData.error }
      }

      // Create dataset object with UUID
      const dataset: Dataset = {
        id: crypto.randomUUID(),
        filename: file.name,
        uploadedAt: new Date(),
        userId,
        fileType: this.getFileType(file),
        size: file.size,
        rows: processedData.data!.length,
        columns: Object.keys(processedData.data![0] || {}),
        schema: processedData.schema!,
        preview: processedData.data!.slice(0, 10),
        processed: true,
        validationErrors: processedData.errors,
        metadata: processedData.metadata!
      }

      // Validate schema
      const schemaValidation = DatasetSchema.safeParse(dataset)
      if (!schemaValidation.success) {
        return { 
          success: false, 
          error: `Schema validation failed: ${schemaValidation.error.message}` 
        }
      }

      return { success: true, data: dataset }

    } catch (error) {
      console.error('Data intake error:', error)
      return { 
        success: false, 
        error: `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }
    }
  }

  private validateFile(file: File): { isValid: boolean; error?: string } {
    if (file.size > this.maxFileSize) {
      return { 
        isValid: false, 
        error: `File too large. Maximum size is ${this.maxFileSize / 1024 / 1024}MB` 
      }
    }

    if (!this.supportedTypes.includes(file.type) && !this.isValidFileExtension(file.name)) {
      return { 
        isValid: false, 
        error: 'Unsupported file type. Please upload CSV, XLSX, or JSON files.' 
      }
    }

    return { isValid: true }
  }

  private isValidFileExtension(filename: string): boolean {
    const ext = filename.toLowerCase().split('.').pop()
    return ['csv', 'xlsx', 'xls', 'json'].includes(ext || '')
  }

  private getFileType(file: File): 'csv' | 'xlsx' | 'json' {
    const ext = file.name.toLowerCase().split('.').pop()
    switch (ext) {
      case 'xlsx':
      case 'xls':
        return 'xlsx'
      case 'json':
        return 'json'
      default:
        return 'csv'
    }
  }

  private async processFileContent(file: File): Promise<{
    success: boolean
    data?: Record<string, any>[]
    schema?: Record<string, string>
    metadata?: Dataset['metadata']
    errors?: string[]
    error?: string
  }> {
    try {
      const fileType = this.getFileType(file)
      
      switch (fileType) {
        case 'csv':
          return await this.processCSV(file)
        case 'json':
          return await this.processJSON(file)
        case 'xlsx':
          return await this.processExcel(file)
        default:
          return { success: false, error: 'Unsupported file type' }
      }
    } catch (error) {
      return { 
        success: false, 
        error: `File processing failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }
    }
  }

  private async processCSV(file: File): Promise<{
    success: boolean
    data?: Record<string, any>[]
    schema?: Record<string, string>
    metadata?: Dataset['metadata']
    errors?: string[]
  }> {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        complete: (results) => {
          if (results.errors.length > 0) {
            resolve({
              success: false,
              errors: results.errors.map(e => e.message)
            })
            return
          }

          const data = results.data as Record<string, any>[]
          if (data.length === 0) {
            resolve({
              success: false,
              errors: ['File appears to be empty']
            })
            return
          }

          const { schema, metadata } = this.analyzeDataStructure(data)

          resolve({
            success: true,
            data,
            schema,
            metadata: {
              ...metadata,
              hasHeaders: true,
              encoding: 'utf-8',
              delimiter: ','
            }
          })
        },
        error: (error) => {
          resolve({
            success: false,
            errors: [error.message]
          })
        }
      })
    })
  }

  private async processJSON(file: File): Promise<{
    success: boolean
    data?: Record<string, any>[]
    schema?: Record<string, string>
    metadata?: Dataset['metadata']
    errors?: string[]
  }> {
    try {
      const text = await file.text()
      const jsonData = JSON.parse(text)
      
      // Handle different JSON structures
      let data: Record<string, any>[]
      if (Array.isArray(jsonData)) {
        data = jsonData
      } else if (jsonData.data && Array.isArray(jsonData.data)) {
        data = jsonData.data
      } else if (typeof jsonData === 'object') {
        data = [jsonData]
      } else {
        return { success: false, errors: ['Invalid JSON structure'] }
      }

      if (data.length === 0) {
        return { success: false, errors: ['JSON file contains no data'] }
      }

      const { schema, metadata } = this.analyzeDataStructure(data)

      return {
        success: true,
        data,
        schema,
        metadata: {
          ...metadata,
          hasHeaders: true,
          encoding: 'utf-8'
        }
      }
    } catch (error) {
      return {
        success: false,
        errors: [`JSON parsing failed: ${error instanceof Error ? error.message : 'Invalid JSON'}`]
      }
    }
  }

  private async processExcel(file: File): Promise<{
    success: boolean
    data?: Record<string, any>[]
    schema?: Record<string, string>
    metadata?: Dataset['metadata']
    errors?: string[]
  }> {
    // For now, we'll convert Excel to CSV and process
    // In a real implementation, you'd use a library like xlsx
    return {
      success: false,
      errors: ['Excel processing not yet implemented. Please convert to CSV.']
    }
  }

  private analyzeDataStructure(data: Record<string, any>[]): {
    schema: Record<string, string>
    metadata: Omit<Dataset['metadata'], 'hasHeaders' | 'encoding' | 'delimiter'>
  } {
    const schema: Record<string, string> = {}
    const numericColumns: string[] = []
    const categoricalColumns: string[] = []
    const dateColumns: string[] = []

    const sampleRow = data[0]
    if (!sampleRow) {
      return {
        schema: {},
        metadata: { numericColumns, categoricalColumns, dateColumns }
      }
    }

    Object.keys(sampleRow).forEach(column => {
      const values = data.slice(0, 100).map(row => row[column]).filter(v => v != null)
      
      if (values.length === 0) {
        schema[column] = 'unknown'
        return
      }

      // Check if all values are numbers
      const isNumeric = values.every(v => !isNaN(Number(v)) && v !== '')
      if (isNumeric) {
        schema[column] = 'number'
        numericColumns.push(column)
        return
      }

      // Check if values look like dates
      const isDate = values.some(v => 
        typeof v === 'string' && 
        !isNaN(Date.parse(v)) && 
        v.match(/\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{2}-\d{2}-\d{4}/)
      )
      if (isDate) {
        schema[column] = 'date'
        dateColumns.push(column)
        return
      }

      // Check if it's categorical (limited unique values)
      const uniqueValues = new Set(values)
      const isLikelyCategorical = uniqueValues.size <= Math.max(10, values.length * 0.1)
      
      if (isLikelyCategorical) {
        schema[column] = 'categorical'
        categoricalColumns.push(column)
      } else {
        schema[column] = 'text'
      }
    })

    return {
      schema,
      metadata: { numericColumns, categoricalColumns, dateColumns }
    }
  }

  async saveDataset(dataset: Dataset): Promise<{ success: boolean; error?: string }> {
    try {
      // Save to database
      const response = await fetch('/api/data/datasets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataset)
      })

      if (!response.ok) {
        throw new Error(`Failed to save dataset: ${response.statusText}`)
      }

      return { success: true }
    } catch (error) {
      console.error('Dataset save error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save dataset' 
      }
    }
  }

  async getDataset(datasetId: string): Promise<{ success: boolean; data?: Dataset; error?: string }> {
    try {
      const response = await fetch(`/api/data/datasets/${datasetId}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch dataset: ${response.statusText}`)
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch dataset' 
      }
    }
  }
}