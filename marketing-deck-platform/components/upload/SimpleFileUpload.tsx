'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, CheckCircle, X, AlertCircle, Loader2 } from 'lucide-react'
import { useDropzone, FileWithPath } from 'react-dropzone'
import { UploadedFile } from '@/lib/types/upload'

interface SimpleFileUploadProps {
  onFilesChange: (files: UploadedFile[]) => void
  accept?: string[]
  maxFiles?: number
  maxSize?: number
  disabled?: boolean
  className?: string
}

export const SimpleFileUpload: React.FC<SimpleFileUploadProps> = ({
  onFilesChange,
  accept = ['.csv', '.xlsx', '.xls', '.json'],
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  disabled = false,
  className = ''
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const updateFile = useCallback((id: string, updates: Partial<UploadedFile>) => {
    setFiles(prev => {
      const newFiles = prev.map(f => f.id === id ? { ...f, ...updates } : f)
      onFilesChange(newFiles)
      return newFiles
    })
  }, [onFilesChange])

  const uploadFile = async (file: FileWithPath): Promise<UploadedFile> => {
    const tempFile: UploadedFile = {
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
    }

    // Add temp file immediately
    setFiles(prev => {
      const newFiles = [...prev, tempFile]
      onFilesChange(newFiles)
      return newFiles
    })

    try {
      console.log('🔄 Uploading file:', file.name)
      
      // Validate file
      if (file.size > maxSize) {
        throw new Error(`File size too large. Maximum size is ${(maxSize / 1024 / 1024).toFixed(1)}MB`)
      }

      const allowedExtensions = accept.map(ext => ext.replace('.', '').toLowerCase())
      const fileExt = file.name.split('.').pop()?.toLowerCase()
      if (fileExt && !allowedExtensions.includes(fileExt)) {
        throw new Error(`File type not supported. Allowed types: ${accept.join(', ')}`)
      }

      // Create form data
      const formData = new FormData()
      formData.append('file', file)

      // Upload with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Upload failed with status ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Upload failed')
      }

      console.log('✅ Upload successful:', result.file?.id)

      const successFile: UploadedFile = {
        ...tempFile,
        id: result.file?.id || tempFile.id,
        status: 'success',
        url: result.file?.url,
        parsedData: result.parsedData
      }

      updateFile(tempFile.id, successFile)
      return successFile

    } catch (error) {
      console.error('❌ Upload error:', error)
      
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      const errorFile: UploadedFile = {
        ...tempFile,
        status: 'error',
        error: errorMessage
      }

      updateFile(tempFile.id, errorFile)
      return errorFile
    }
  }

  const onDrop = useCallback(async (acceptedFiles: FileWithPath[], rejectedFiles: any[]) => {
    if (disabled) return

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(rejection => {
        console.warn('File rejected:', rejection.file.name, rejection.errors)
      })
    }

    // Check total file count
    if (files.length + acceptedFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`)
      return
    }

    setIsUploading(true)

    try {
      // Upload files sequentially to avoid overwhelming the server
      for (const file of acceptedFiles) {
        await uploadFile(file)
      }
    } finally {
      setIsUploading(false)
    }
  }, [disabled, files.length, maxFiles, uploadFile])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    disabled: disabled || isUploading,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/json': ['.json']
    },
    maxFiles,
    maxSize,
    multiple: maxFiles > 1
  })

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const newFiles = prev.filter(f => f.id !== id)
      onFilesChange(newFiles)
      return newFiles
    })
  }, [onFilesChange])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive && !isDragReject ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}
          ${isDragReject ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}
          ${!isDragActive && !isDragReject ? 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500' : ''}
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          {isUploading ? (
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          ) : (
            <Upload className={`w-12 h-12 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          )}
          
          <div>
            {isDragReject ? (
              <p className="text-red-600 font-medium">Some files are not supported</p>
            ) : isDragActive ? (
              <p className="text-blue-600 font-medium">Drop files here...</p>
            ) : (
              <>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {isUploading ? 'Uploading...' : 'Upload your data files'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Drag & drop files here, or click to browse
                </p>
              </>
            )}
          </div>
          
          {!isUploading && (
            <div className="text-xs text-gray-400 space-y-1">
              <p>Supported: {accept.join(', ')}</p>
              <p>Max size: {(maxSize / 1024 / 1024).toFixed(1)}MB per file</p>
              <p>Max files: {maxFiles}</p>
            </div>
          )}
        </div>
      </div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Uploaded Files ({files.length})
            </h3>
            
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(file.size / 1024).toFixed(1)} KB
                      {file.parsedData && (
                        <span className="ml-2">
                          • {file.parsedData.rowCount} rows • {file.parsedData.columns?.length} columns
                        </span>
                      )}
                    </p>
                    {file.error && (
                      <p className="text-xs text-red-600 mt-1">{file.error}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Status Indicator */}
                  {file.status === 'uploading' && (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                      <span className="text-sm text-blue-600">Uploading...</span>
                    </div>
                  )}
                  {file.status === 'success' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {file.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFile(file.id)}
                    disabled={file.status === 'uploading'}
                    className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Summary */}
      {files.length > 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {files.filter(f => f.status === 'success').length} successful, {' '}
          {files.filter(f => f.status === 'error').length} failed, {' '}
          {files.filter(f => f.status === 'uploading').length} uploading
        </div>
      )}
    </div>
  )
}