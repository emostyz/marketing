'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { ArrowRight, Brain, FileText, Palette, Settings, TrendingUp, Upload, AlertCircle } from 'lucide-react'
import { DescribeDataStep } from './DataIntake'
import { SimpleDataIntake } from './SimpleDataIntake'
import { FactorsStep } from './FactorsStep'
import { UploadStep } from './UploadStep'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { motion } from 'framer-motion'
import { TemplateStep, Template } from './TemplateStep'
import { EnhancedBrainV2 } from '@/lib/ai/enhanced-brain-v2'
import { UploadedFile } from '@/lib/types/upload'
// import { Progress } from '@/components/ui/progress'

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      // Remove data:type;base64, prefix
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = error => reject(error)
  })
}



const AIAnalysisStep = ({ status, progress }: { status: string, progress: number }) => (
    <motion.div
      key="analysis"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-8"
    >
        <div className="relative mb-6">
            <div className="w-24 h-24 border-4 border-gray-800 border-t-blue-500 rounded-full animate-spin"></div>
            <Brain className="w-10 h-10 text-blue-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{status}</h2>
        <p className="text-gray-400 mb-6">Our AI is analyzing your data to find novel insights.</p>
        <div className="w-full bg-gray-800 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
    </motion.div>
);


export function UltimateDeckBuilder({ className = '' }) {
  const router = useRouter()
  const { user } = useAuth()
  
  const [currentStep, setCurrentStep] = useState(1)
  
  const [intakeData, setIntakeData] = useState<{
    files: UploadedFile[];
    context: any;
    timeFrame: any;
    requirements: any;
  }>({
    files: [],
    context: {
      description: '',
      industry: '',
      targetAudience: '',
      businessContext: '',
      keyMetrics: '',
      factors: [''],
      dataQuality: 'good',
      dataSource: '',
      collectionMethod: '',
      lastUpdated: new Date().toISOString().split('T')[0],
      confidence: 80
    },
    timeFrame: {
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
      dataFrequency: 'monthly'
    },
    requirements: {
      slidesCount: 10,
      presentationDuration: 15,
      tone: 'professional',
      style: 'modern',
      focusAreas: []
    }
  })

  const [analysisResult, setAnalysisResult] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisStatus, setAnalysisStatus] = useState('Initializing Analysis...')
  const [error, setError] = useState<string | null>(null)

  const steps = [
    { id: 1, title: 'Data Context', icon: <FileText /> },
    { id: 2, title: 'Influencing Factors', icon: <TrendingUp /> },
    { id: 3, title: 'Upload Data', icon: <Upload /> },
    { id: 4, title: 'AI Analysis', icon: <Brain /> },
    { id: 5, title: 'Template', icon: <Palette /> },
    { id: 6, title: 'Customize', icon: <Settings /> },
  ]

  const nextStep = () => setCurrentStep(prev => prev + 1)
  const prevStep = () => setCurrentStep(prev => prev - 1)
  
  const handleDataContextUpdate = async (newContext: any) => {
    setIntakeData(prev => ({ ...prev, context: { ...prev.context, ...newContext } }))
    
    // Save to user profile immediately
    try {
      await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: newContext.industry,
          targetAudience: newContext.targetAudience,
          businessContext: newContext.businessContext,
          keyMetrics: newContext.keyMetrics,
          dataDescription: newContext.description
        })
      })
    } catch (error) {
      console.error('Failed to save profile data:', error)
    }
  }

  const handleFilesUpdate = (newFiles: any) => {
    setIntakeData(prev => ({ ...prev, files: newFiles }))
  }

  const performAnalysis = async () => {
    setIsLoading(true)
    setProgress(10)
    
    setIsAnalyzing(true)
    setAnalysisStatus('Initializing Analysis...')
    setAnalysisProgress(10)
    
    // Move to the analysis step visually
    setCurrentStep(4) 

    // Simulate progress updates for a better UX
    const progressUpdates = [
      { progress: 25, status: 'Analyzing Data Patterns...' },
      { progress: 50, status: 'Generating Novel Insights...' },
      { progress: 75, status: 'Crafting Narrative Arc...' },
      { progress: 90, status: 'Designing Slide Structure...' },
    ];

    for (const update of progressUpdates) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalysisProgress(update.progress);
      setAnalysisStatus(update.status);
    }
    
    try {
      // Process uploaded files from cloud storage
      const processedFiles = intakeData.files.filter(f => f.status === 'success')

      // Use real parsed data from uploaded files
      const parsedData = processedFiles.map(file => {
        if (file.parsedData) {
          // Use the real parsed dataset
          const dataset = file.parsedData
          return {
            fileId: file.id,
            fileName: file.name,
            url: file.url,
            data: dataset.rows,
            columns: dataset.columns.map(col => col.name),
            rowCount: dataset.rowCount,
            dataType: dataset.insights.timeSeriesDetected ? 'timeseries' : 'tabular',
            insights: dataset.insights,
            summary: dataset.summary,
            columnDetails: dataset.columns,
            dataQuality: dataset.insights.dataQuality,
            potentialMetrics: dataset.insights.potentialMetrics,
            potentialDimensions: dataset.insights.potentialDimensions
          }
        } else if (file.type.includes('csv') || file.type.includes('excel') || file.type.includes('sheet')) {
          // Fallback to mock data if parsing failed
          return {
            fileId: file.id,
            fileName: file.name,
            url: file.url,
            data: mockDataFromFile(file.name, ''),
            columns: ['Period', 'Value', 'Category', 'Growth'],
            rowCount: 50,
            dataType: 'timeseries'
          }
        }
        return { 
          fileId: file.id,
          fileName: file.name, 
          url: file.url,
          data: [], 
          fileType: file.type 
        }
      })

      const requestData = {
        data: parsedData,
        context: {
          industry: intakeData.context.industry || 'Technology',
          targetAudience: intakeData.context.targetAudience || 'Executives',
          businessContext: intakeData.context.businessContext || 'Business presentation',
          description: intakeData.context.description || 'Data analysis presentation'
        },
        timeFrame: {
          start: '2024-01',
          end: '2024-12',
          dataFrequency: 'monthly',
          analysisType: 'trend'
        },
        requirements: {
          slidesCount: 12,
          presentationDuration: 15,
          focusAreas: ['Key Insights', 'Trends', 'Recommendations'],
          style: 'modern',
          includeCharts: true,
          includeExecutiveSummary: true
        }
      }

      // Helper function to create mock structured data from file content
      function mockDataFromFile(fileName: string, _content: string) {
        // In production, this would parse actual CSV/Excel data
        const baseData = []
        for (let i = 0; i < 12; i++) {
          baseData.push({
            period: `2024-${String(i + 1).padStart(2, '0')}`,
            revenue: Math.floor(Math.random() * 100000) + 50000,
            growth: (Math.random() * 20) - 5,
            category: ['Product A', 'Product B', 'Product C'][i % 3],
            customers: Math.floor(Math.random() * 1000) + 500
          })
        }
        return baseData
      }

      const response = await fetch('/api/openai/enhanced-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`Analysis failed with status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setAnalysisResult(result.result);
        setAnalysisStatus('Analysis Complete!');
        setAnalysisProgress(100);
        toast.success('AI analysis complete!');
        setProgress(100)
        setAnalysisResult(result.result)
        console.log('Final analysis result:', result.result)

        // Save the presentation to the database
        try {
          const response = await fetch('/api/presentations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              intakeData: intakeData,
              analysisResult: result.result,
              slideStructure: result.result.slideStructure, // Assuming this is part of the result
            }),
          })

          if (!response.ok) {
            throw new Error('Failed to save presentation')
          }

          const savedPresentation = await response.json()
          console.log('Presentation saved:', savedPresentation)
          // You might want to store the presentation ID
        } catch (error) {
          console.error('Error saving presentation:', error)
          setError('There was an error saving your presentation progress.')
          // We don't want to block the user if saving fails, so we don't set loading to false here.
        }

        // Move to the next step
        nextStep()
      } else {
        throw new Error(result.error || 'Unknown error during analysis');
      }

    } catch (error: any) {
      console.error("Analysis Error:", error);
      toast.error(error.message || 'Something went wrong');
      setError(error.message || 'An unexpected error occurred. Please try again.');
      setIsAnalyzing(false);
      setIsLoading(false);
      setCurrentStep(3); // Go back to upload step on error
    }
  };


  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template)
    console.log('Selected template:', template)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <SimpleDataIntake
            dataContext={intakeData.context}
            setDataContext={handleDataContextUpdate}
            nextStep={nextStep}
          />
        )
      case 2:
        return (
          <FactorsStep
            dataContext={intakeData.context}
            setDataContext={handleDataContextUpdate}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )
      case 3:
        return (
          <UploadStep
            files={intakeData.files}
            setFiles={handleFilesUpdate}
            nextStep={performAnalysis}
            prevStep={prevStep}
          />
        )
      case 4:
        return isAnalyzing ? (
          <AIAnalysisStep status={analysisStatus} progress={analysisProgress} />
        ) : (
          <TemplateStep
            onTemplateSelect={handleTemplateSelect}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )
      default:
        return (
            <Card className="p-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Step {currentStep}</h2>
                <p className="text-gray-400 mb-8">This step is under construction.</p>
                <Button onClick={prevStep}>Go Back</Button>
            </Card>
        )
    }
  }

  return (
    <div className={`min-h-screen bg-gray-950 text-white p-4 sm:p-8 ${className}`}>
      <div className="max-w-4xl mx-auto">
        {/* New Header */}
        <header className="mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Create a New Presentation
            </h1>
            <p className="mt-4 text-lg text-gray-400">
                Follow the steps below to generate a stunning, AI-powered deck.
            </p>
        </header>

        {/* New Stepper */}
        <div className="mb-12 flex items-center justify-between">
            {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center text-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${currentStep >= step.id ? 'bg-blue-600 border-blue-500' : 'bg-gray-800 border-gray-700'} transition-all duration-300`}>
                            {React.cloneElement(step.icon, { className: `w-6 h-6 ${currentStep >= step.id ? 'text-white' : 'text-gray-500'}` })}
                        </div>
                        <p className={`mt-2 text-sm font-medium ${currentStep >= step.id ? 'text-white' : 'text-gray-500'}`}>{step.title}</p>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-4 ${currentStep > index + 1 ? 'bg-blue-600' : 'bg-gray-700'}`} />
                    )}
                </React.Fragment>
            ))}
        </div>

        <main>
            {error && (
              <Card className="p-4 mb-6 border-red-500 bg-red-950/20">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-400">{error}</p>
                </div>
              </Card>
            )}
            <AnimatePresence mode="wait">
                {renderStep()}
            </AnimatePresence>
        </main>
      </div>
    </div>
  )
} 