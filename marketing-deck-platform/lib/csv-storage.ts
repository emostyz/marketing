'use client'

import { createClientComponentClient } from '@/lib/supabase/client'

export interface CSVFileData {
  id?: string
  filename: string
  original_filename: string
  file_path: string
  file_size_bytes: number
  description: string // Required 2+ sentence description
  column_info?: any
  row_count?: number
  upload_date?: string
  last_used_at?: string
  metadata?: any
}

export interface CSVUploadRequest {
  file: File
  description: string
}

export class CSVStorage {
  private supabase = createClientComponentClient()

  // Validate description (must be at least 2 sentences)
  private validateDescription(description: string): { valid: boolean; error?: string } {
    if (!description || description.trim().length < 20) {
      return {
        valid: false,
        error: 'Description must be at least 20 characters long'
      }
    }

    // Count sentences (look for periods, exclamation marks, question marks)
    const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0)
    
    if (sentences.length < 2) {
      return {
        valid: false,
        error: 'Description must contain at least 2 complete sentences explaining what the data contains and how it will be used'
      }
    }

    return { valid: true }
  }

  // Parse CSV file and extract metadata
  private async parseCSVMetadata(file: File): Promise<{ columnInfo: any; rowCount: number; error?: string }> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          const lines = text.split('\n').filter(line => line.trim().length > 0)
          
          if (lines.length === 0) {
            resolve({ columnInfo: null, rowCount: 0, error: 'Empty CSV file' })
            return
          }

          // Get headers
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
          
          // Sample a few rows to determine column types
          const sampleRows = lines.slice(1, Math.min(6, lines.length))
          const columnInfo = headers.map(header => {
            const samples = sampleRows.map(row => {
              const values = row.split(',')
              const index = headers.indexOf(header)
              return values[index]?.trim().replace(/"/g, '') || ''
            })

            // Determine type based on samples
            let type = 'text'
            if (samples.every(s => !s || /^\d+$/.test(s))) {
              type = 'integer'
            } else if (samples.every(s => !s || /^\d*\.?\d+$/.test(s))) {
              type = 'number'
            } else if (samples.every(s => !s || /^\d{4}-\d{2}-\d{2}/.test(s))) {
              type = 'date'
            }

            return {
              name: header,
              type,
              samples: samples.slice(0, 3) // Keep first 3 samples
            }
          })

          resolve({
            columnInfo,
            rowCount: lines.length - 1 // Exclude header
          })
        } catch (error) {
          resolve({ columnInfo: null, rowCount: 0, error: 'Failed to parse CSV file' })
        }
      }

      reader.onerror = () => {
        resolve({ columnInfo: null, rowCount: 0, error: 'Failed to read file' })
      }

      reader.readAsText(file)
    })
  }

  // Upload CSV file with description
  async uploadCSV(request: CSVUploadRequest): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      // Validate file type
      if (!request.file.name.toLowerCase().endsWith('.csv')) {
        return { success: false, error: 'Only CSV files are allowed' }
      }

      // Validate file size (max 10MB)
      if (request.file.size > 10 * 1024 * 1024) {
        return { success: false, error: 'File size must be less than 10MB' }
      }

      // Validate description
      const descValidation = this.validateDescription(request.description)
      if (!descValidation.valid) {
        return { success: false, error: descValidation.error }
      }

      // Parse CSV metadata
      const { columnInfo, rowCount, error: parseError } = await this.parseCSVMetadata(request.file)
      if (parseError) {
        return { success: false, error: parseError }
      }

      // Generate unique filename
      const timestamp = Date.now()
      const filename = `${timestamp}_${request.file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('csv-files')
        .upload(filename, request.file)

      if (uploadError) {
        return { success: false, error: `Upload failed: ${uploadError.message}` }
      }

      // Save file metadata to database
      const { data, error: dbError } = await this.supabase
        .from('data_files')
        .insert({
          filename,
          original_filename: request.file.name,
          file_path: uploadData.path,
          file_size_bytes: request.file.size,
          description: request.description,
          column_info: columnInfo,
          row_count: rowCount,
          upload_date: new Date().toISOString(),
          last_used_at: new Date().toISOString(),
          metadata: {
            content_type: request.file.type,
            upload_timestamp: timestamp
          }
        })
        .select()
        .single()

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await this.supabase.storage.from('csv-files').remove([filename])
        return { success: false, error: `Database error: ${dbError.message}` }
      }

      return { success: true, id: data.id }
    } catch (error) {
      return { success: false, error: 'Upload failed due to unexpected error' }
    }
  }

  // Get user's CSV files
  async getUserCSVFiles(): Promise<{ success: boolean; data?: CSVFileData[]; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('data_files')
        .select('*')
        .order('upload_date', { ascending: false })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data: data || [] }
    } catch (error) {
      return { success: false, error: 'Failed to get CSV files' }
    }
  }

  // Get specific CSV file
  async getCSVFile(id: string): Promise<{ success: boolean; data?: CSVFileData; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('data_files')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      // Update last_used_at
      await this.supabase
        .from('data_files')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', id)

      return { success: true, data }
    } catch (error) {
      return { success: false, error: 'Failed to get CSV file' }
    }
  }

  // Download CSV file content
  async downloadCSVContent(id: string): Promise<{ success: boolean; content?: string; error?: string }> {
    try {
      // Get file metadata
      const { data: fileData, error: fileError } = await this.supabase
        .from('data_files')
        .select('file_path')
        .eq('id', id)
        .single()

      if (fileError) {
        return { success: false, error: fileError.message }
      }

      // Download file from storage
      const { data: storageData, error: storageError } = await this.supabase.storage
        .from('csv-files')
        .download(fileData.file_path)

      if (storageError) {
        return { success: false, error: storageError.message }
      }

      const content = await storageData.text()
      return { success: true, content }
    } catch (error) {
      return { success: false, error: 'Failed to download CSV content' }
    }
  }

  // Delete CSV file
  async deleteCSVFile(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get file metadata
      const { data: fileData, error: fileError } = await this.supabase
        .from('data_files')
        .select('file_path')
        .eq('id', id)
        .single()

      if (fileError) {
        return { success: false, error: fileError.message }
      }

      // Delete from storage
      const { error: storageError } = await this.supabase.storage
        .from('csv-files')
        .remove([fileData.file_path])

      if (storageError) {
        console.error('Failed to delete from storage:', storageError)
        // Continue with database deletion even if storage deletion fails
      }

      // Delete from database
      const { error: dbError } = await this.supabase
        .from('data_files')
        .delete()
        .eq('id', id)

      if (dbError) {
        return { success: false, error: dbError.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Failed to delete CSV file' }
    }
  }

  // Update CSV file description
  async updateCSVDescription(id: string, description: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate description
      const descValidation = this.validateDescription(description)
      if (!descValidation.valid) {
        return { success: false, error: descValidation.error }
      }

      const { error } = await this.supabase
        .from('data_files')
        .update({ 
          description,
          last_used_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Failed to update description' }
    }
  }

  // Search CSV files by name or description
  async searchCSVFiles(query: string): Promise<{ success: boolean; data?: CSVFileData[]; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('data_files')
        .select('*')
        .or(`original_filename.ilike.%${query}%,description.ilike.%${query}%`)
        .order('upload_date', { ascending: false })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data: data || [] }
    } catch (error) {
      return { success: false, error: 'Failed to search CSV files' }
    }
  }

  // Get CSV storage statistics
  async getStorageStats(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('data_files')
        .select('file_size_bytes, upload_date')

      if (error) {
        return { success: false, error: error.message }
      }

      const stats = {
        totalFiles: data?.length || 0,
        totalSizeBytes: data?.reduce((sum, file) => sum + (file.file_size_bytes || 0), 0) || 0,
        totalSizeMB: Math.round((data?.reduce((sum, file) => sum + (file.file_size_bytes || 0), 0) || 0) / (1024 * 1024) * 100) / 100,
        filesThisMonth: data?.filter(file => {
          const uploaded = new Date(file.upload_date)
          const now = new Date()
          return uploaded.getMonth() === now.getMonth() && uploaded.getFullYear() === now.getFullYear()
        }).length || 0
      }

      return { success: true, data: stats }
    } catch (error) {
      return { success: false, error: 'Failed to get storage stats' }
    }
  }
}

// React hook for CSV storage
export function useCSVStorage() {
  return new CSVStorage()
}