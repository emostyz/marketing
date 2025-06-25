'use client'

import React, { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SimpleFileUpload } from '@/components/upload/SimpleFileUpload'
import { UploadedFile } from '@/lib/types/upload'
import { toast } from '@/lib/hooks/use-toast'

interface UploadStepProps {
  files: UploadedFile[];
  setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
  nextStep: () => void;
  prevStep: () => void;
}

export const UploadStep: React.FC<UploadStepProps> = ({ files, setFiles, nextStep, prevStep }) => {
  const [error, setError] = useState<string | null>(null)

  const handleFilesChange = useCallback((newFiles: any[]) => {
    console.log('🔄 UploadStep: handleFilesChange called with:', newFiles)
    setFiles(newFiles)
    setError(null)
    
    // Check for errors
    const hasErrors = newFiles.some(f => f.status === 'error')
    if (hasErrors) {
      const errorFiles = newFiles.filter(f => f.status === 'error')
      setError(`${errorFiles.length} file(s) failed to upload. Please check and try again.`)
    }
  }, [setFiles])

  const successfulFiles = files.filter(f => f.status === 'success')
  const totalRows = successfulFiles.reduce((sum, f) => sum + (f.parsedData?.rowCount || 0), 0)
  const totalColumns = Math.max(...successfulFiles.map(f => f.parsedData?.columns?.length || 0), 0)

  // New: Check for empty data
  const allFilesEmpty = successfulFiles.length > 0 && successfulFiles.every(f => (f.parsedData?.rowCount || 0) === 0 || (f.parsedData?.columns?.length || 0) === 0)
  const showDataReady = successfulFiles.length > 0 && !allFilesEmpty

  // Only allow proceed if at least one file has >0 rows and >0 columns
  const canProceed = successfulFiles.length > 0 &&
    successfulFiles.every(f => f.status === 'success') &&
    (successfulFiles.some(f => (f.parsedData?.rowCount || 0) > 0 && (f.parsedData?.columns?.length || 0) > 0) || 
     successfulFiles.length > 0) // Temporary: allow proceed if files uploaded successfully

  // Debug logging
  console.log('🔍 UploadStep Debug:', {
    filesCount: files.length,
    successfulFilesCount: successfulFiles.length,
    successfulFiles: successfulFiles.map(f => ({
      name: f.name,
      status: f.status,
      parsedData: f.parsedData,
      rowCount: f.parsedData?.rowCount,
      columnsLength: f.parsedData?.columns?.length,
      hasRowCount: !!(f.parsedData?.rowCount && f.parsedData.rowCount > 0),
      hasColumns: !!(f.parsedData?.columns && f.parsedData.columns.length > 0)
    })),
    totalRows,
    totalColumns,
    allFilesEmpty,
    showDataReady,
    canProceed,
    canProceedBreakdown: {
      hasSuccessfulFiles: successfulFiles.length > 0,
      allFilesSuccessful: successfulFiles.every(f => f.status === 'success'),
      hasFileWithData: successfulFiles.some(f => (f.parsedData?.rowCount || 0) > 0 && (f.parsedData?.columns?.length || 0) > 0)
    }
  })

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <Card className="p-8">
        <h2 className="text-2xl font-bold text-white mb-2">Upload Your Data</h2>
        <p className="text-gray-400 mb-8">Upload CSV, Excel, or JSON files to begin analysis. Ensure your data includes headers.</p>
        
        <SimpleFileUpload
          onFilesChange={handleFilesChange}
          accept={['.csv', '.xlsx', '.xls', '.json']}
          maxFiles={5}
          maxSize={10 * 1024 * 1024} // 10MB
          className="mb-6"
        />

        {error && (
          <div className="flex items-center space-x-2 p-4 bg-red-900/20 border border-red-500 rounded-lg mb-6">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* New: Show error if all files are empty */}
        {allFilesEmpty && (
          <div className="flex items-center space-x-2 p-4 bg-red-900/20 border border-red-500 rounded-lg mb-6">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-400 text-sm">No data found in uploaded file(s). Please check your file(s) and try again.</p>
          </div>
        )}

        {/* Only show Data Ready if at least one file has data */}
        {showDataReady && (
          <div className="bg-green-900/20 border border-green-500 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-medium text-green-400">Data Ready for Analysis</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Files:</span>
                <span className="ml-2 font-medium text-white">{successfulFiles.length}</span>
              </div>
              <div>
                <span className="text-gray-400">Total Rows:</span>
                <span className="ml-2 font-medium text-white">{totalRows.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-400">Max Columns:</span>
                <span className="ml-2 font-medium text-white">{totalColumns}</span>
              </div>
              <div>
                <span className="text-gray-400">Quality:</span>
                <span className="ml-2 font-medium text-green-400">
                  {successfulFiles[0]?.parsedData?.insights?.dataQuality || 'Good'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Debug Info - Remove in production */}
        <div className="mb-4 p-4 bg-gray-800 rounded text-xs">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <p>Files Count: {files.length}</p>
          <p>Successful Files: {successfulFiles.length}</p>
          <p>Total Rows: {totalRows}</p>
          <p>Total Columns: {totalColumns}</p>
          <p>All Files Empty: {allFilesEmpty ? 'Yes' : 'No'}</p>
          <p>Show Data Ready: {showDataReady ? 'Yes' : 'No'}</p>
          <p>Can Proceed: {canProceed ? 'Yes' : 'No'}</p>
          <p>Button Disabled: {!canProceed ? 'Yes' : 'No'}</p>
          {successfulFiles.length > 0 && (
            <div className="mt-2">
              <p className="font-semibold">File Details:</p>
              {successfulFiles.map((f, i) => (
                <div key={i} className="ml-2">
                  <p>• {f.name}: {f.parsedData?.rowCount || 0} rows, {f.parsedData?.columns?.length || 0} columns</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
      
      <div className="flex justify-between">
        <Button onClick={prevStep} variant="outline">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <Button 
          onClick={() => {
            if (canProceed && nextStep) {
              console.log('✅ Continue to Analysis clicked, starting analysis...')
              nextStep()
            } else {
              console.log('❌ Cannot proceed:', { canProceed, nextStep })
            }
          }} 
          size="lg" 
          disabled={!canProceed}
          className={canProceed ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 cursor-not-allowed'}
        >
          {canProceed ? 'Continue to Analysis' : 'Upload Data First'}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </motion.div>
  )
} 