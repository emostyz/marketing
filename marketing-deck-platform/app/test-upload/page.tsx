'use client'

import React, { useState } from 'react'
import { UploadStep } from '@/components/deck-builder/UploadStep'
import { UploadedFile } from '@/lib/types/upload'

export default function TestUploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [currentStep, setCurrentStep] = useState(1)

  const handleFilesUpdate = (newFiles: UploadedFile[]) => {
    console.log('🔄 TestUploadPage: handleFilesUpdate called with:', newFiles)
    setFiles(newFiles)
  }

  const handleNextStep = () => {
    console.log('🚀 TestUploadPage: Next step called!')
    setCurrentStep(prev => prev + 1)
  }

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Upload Test Page</h1>
        
        <div className="mb-4 p-4 bg-gray-800 rounded">
          <h2 className="text-lg font-semibold mb-2">Debug Info:</h2>
          <p>Current Step: {currentStep}</p>
          <p>Files Count: {files.length}</p>
          <p>Successful Files: {files.filter(f => f.status === 'success').length}</p>
          <p>Files with Data: {files.filter(f => f.parsedData?.rowCount > 0).length}</p>
        </div>

        <UploadStep
          files={files}
          setFiles={handleFilesUpdate}
          nextStep={handleNextStep}
          prevStep={handlePrevStep}
        />

        {currentStep > 1 && (
          <div className="mt-8 p-4 bg-green-900/20 border border-green-500 rounded">
            <h2 className="text-lg font-semibold text-green-400">Step {currentStep} reached!</h2>
            <p className="text-green-300">The Continue to Analysis button worked!</p>
          </div>
        )}
      </div>
    </div>
  )
} 