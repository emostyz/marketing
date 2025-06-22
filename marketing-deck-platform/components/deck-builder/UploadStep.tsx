'use client'

import React, { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SimpleFileUpload } from '@/components/upload/SimpleFileUpload'
import { UploadedFile } from '@/lib/types/upload'

interface UploadStepProps {
  files: UploadedFile[];
  setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
  nextStep: () => void;
  prevStep: () => void;
}

export const UploadStep: React.FC<UploadStepProps> = ({ files, setFiles, nextStep, prevStep }) => {
  const [error, setError] = useState<string | null>(null)

  const handleFilesChange = useCallback((newFiles: any[]) => {
    setFiles(newFiles)
    setError(null)
    
    // Check for errors
    const hasErrors = newFiles.some(f => f.status === 'error')
    if (hasErrors) {
      const errorFiles = newFiles.filter(f => f.status === 'error')
      setError(`${errorFiles.length} file(s) failed to upload. Please check and try again.`)
    }
  }, [setFiles])

  const canProceed = files.length > 0 && 
                    files.every(f => f.status === 'success') && 
                    files.some(f => f.parsedData)

  const successfulFiles = files.filter(f => f.status === 'success')
  const totalRows = successfulFiles.reduce((sum, f) => sum + (f.parsedData?.rowCount || 0), 0)
  const totalColumns = Math.max(...successfulFiles.map(f => f.parsedData?.columns?.length || 0), 0)

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

        {successfulFiles.length > 0 && (
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
      </Card>
      
      <div className="flex justify-between">
        <Button onClick={prevStep} variant="outline">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <Button 
          onClick={nextStep} 
          size="lg" 
          disabled={!canProceed}
          className={canProceed ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          Continue to Analysis
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </motion.div>
  )
} 