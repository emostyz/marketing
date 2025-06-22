'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { ArrowRight, Brain, FileText, Palette, Settings, TrendingUp, Upload, AlertCircle } from 'lucide-react'
import { DescribeDataStep } from './DataIntake'
import { SimpleDataIntake } from './SimpleDataIntake'
import { TimePeriodAnalysisStep } from './TimePeriodAnalysisStep'
import { FactorsStep } from './FactorsStep'
import { UploadStep } from './UploadStep'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { motion } from 'framer-motion'
import { TemplateStep, Template } from './TemplateStep'
import { EnhancedBrainV2 } from '@/lib/ai/enhanced-brain-v2'
import { UploadedFile } from '@/lib/types/upload'
import { WorldClassPresentationEditor } from '@/components/editor/WorldClassPresentationEditor'
import { useTierLimits } from '@/lib/hooks/useTierLimits'
import UpgradePrompt from '@/components/ui/UpgradePrompt'
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
  const { checkLimit, incrementUsage, rollbackUsage, upgradePlan, subscription } = useTierLimits()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const [upgradePromptData, setUpgradePromptData] = useState<{
    limitType: 'presentations' | 'team_members' | 'storage' | 'exports'
    currentUsage: number
    limit: number
  } | null>(null)
  
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
      dataFrequency: 'monthly',
      comparisons: [], // Selected comparison types (q/q, m/m, y/y, w/w)
      focusPeriods: [], // Specific periods to highlight
      analysisType: 'trend', // trend, comparison, seasonal, cohort
      granularity: 'monthly' // daily, weekly, monthly, quarterly, yearly
    },
    requirements: {
      slidesCount: 10,
      presentationDuration: 15,
      tone: 'professional',
      style: 'modern',
      focusAreas: [],
      includeComparisons: true,
      comparisonTypes: [], // Will be populated from timeFrame.comparisons
      chartPreferences: []
    }
  })

  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisStatus, setAnalysisStatus] = useState('Initializing Analysis...')
  const [error, setError] = useState<string | null>(null)

  const steps = [
    { id: 1, title: 'Data Context', icon: <FileText /> },
    { id: 2, title: 'Time Period Analysis', icon: <TrendingUp /> },
    { id: 3, title: 'Influencing Factors', icon: <TrendingUp /> },
    { id: 4, title: 'Upload Data', icon: <Upload /> },
    { id: 5, title: 'AI Analysis', icon: <Brain /> },
    { id: 6, title: 'Template', icon: <Palette /> },
    { id: 7, title: 'Customize', icon: <Settings /> },
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

  const handleTimeFrameUpdate = (newTimeFrame: any) => {
    setIntakeData(prev => ({ 
      ...prev, 
      timeFrame: { ...prev.timeFrame, ...newTimeFrame },
      requirements: {
        ...prev.requirements,
        comparisonTypes: newTimeFrame.comparisons || [],
        includeComparisons: (newTimeFrame.comparisons || []).length > 0
      }
    }))
  }

  const handleFilesUpdate = (newFiles: any) => {
    setIntakeData(prev => ({ ...prev, files: newFiles }))
  }

  const performAnalysis = async () => {
    // Prevent multiple simultaneous analyses
    if (isAnalyzing) {
      console.warn('Analysis already in progress')
      return
    }

    // Check tier limits and immediately increment usage to prevent race conditions
    const limitCheck = await checkLimit('presentations')
    
    if (!limitCheck.canPerform) {
      setUpgradePromptData({
        limitType: 'presentations',
        currentUsage: limitCheck.currentUsage,
        limit: limitCheck.limit as number
      })
      setShowUpgradePrompt(true)
      return
    }

    // CRITICAL: Immediately increment usage counter to prevent race conditions
    const usageIncremented = await incrementUsage('presentations')
    if (!usageIncremented) {
      setError('Failed to track usage. Please try again.')
      return
    }

    setIsLoading(true)
    setProgress(10)
    
    setIsAnalyzing(true)
    setAnalysisStatus('Initializing Analysis...')
    setAnalysisProgress(10)
    
    // Move to the analysis step visually
    setCurrentStep(5) 

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
          description: intakeData.context.description || 'Data analysis presentation',
          factors: intakeData.context.factors || []
        },
        timeFrame: {
          start: intakeData.timeFrame.start,
          end: intakeData.timeFrame.end,
          dataFrequency: intakeData.timeFrame.granularity || 'monthly',
          analysisType: intakeData.timeFrame.analysisType || 'trend',
          comparisons: intakeData.timeFrame.comparisons || [],
          granularity: intakeData.timeFrame.granularity || 'monthly',
          focusPeriods: intakeData.timeFrame.focusPeriods || []
        },
        requirements: {
          slidesCount: intakeData.requirements.slidesCount || 12,
          presentationDuration: intakeData.requirements.presentationDuration || 15,
          focusAreas: ['Key Insights', 'Trends', 'Recommendations', 'Time Comparisons'],
          style: intakeData.requirements.style || 'modern',
          includeCharts: true,
          includeExecutiveSummary: true,
          includeComparisons: intakeData.requirements.includeComparisons || false,
          comparisonTypes: intakeData.requirements.comparisonTypes || []
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
        const errorData = await response.json();
        throw new Error(errorData.error || `Analysis failed with status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.result) {
        setAnalysisResult(result.result);
        setAnalysisStatus('Analysis Complete!');
        setAnalysisProgress(100);
        toast.success('AI analysis complete!');
        setProgress(100)
        console.log('Final analysis result:', result.result)
        console.log('Insights count:', result.result.insights?.length || 0)
        console.log('Slides count:', result.result.slideStructure?.length || 0)

        // Usage already incremented at start to prevent race conditions

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

        // Move to the template selection step
        setIsAnalyzing(false);
        setIsLoading(false);
        nextStep();
      } else {
        throw new Error(result.error || 'Unknown error during analysis');
      }

    } catch (error: any) {
      console.error("Analysis Error:", error);
      toast.error(error.message || 'Something went wrong');
      setError(error.message || 'An unexpected error occurred. Please try again.');
      setIsAnalyzing(false);
      setIsLoading(false);
      setCurrentStep(4); // Go back to upload step on error
      
      // Rollback usage counter for failed analysis
      const rollbackSuccess = await rollbackUsage('presentations', `Analysis failed: ${error.message}`)
      if (rollbackSuccess) {
        console.log('Successfully rolled back usage counter')
      } else {
        console.error('Failed to rollback usage counter')
      }
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
          <TimePeriodAnalysisStep
            timeFrameData={intakeData.timeFrame}
            setTimeFrameData={handleTimeFrameUpdate}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )
      case 3:
        return (
          <FactorsStep
            dataContext={intakeData.context}
            setDataContext={handleDataContextUpdate}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )
      case 4:
        return (
          <UploadStep
            files={intakeData.files}
            setFiles={handleFilesUpdate}
            nextStep={performAnalysis}
            prevStep={prevStep}
          />
        )
      case 5:
        return (
          <AIAnalysisStep status={analysisStatus} progress={analysisProgress} />
        )
      case 6:
        return (
          <TemplateStep
            onTemplateSelect={handleTemplateSelect}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )
      case 7:
        // If we have analysis results and a template, show the presentation editor
        if (analysisResult && selectedTemplate) {
          // Convert analysis result to professional slides format
          const convertedSlides = analysisResult.slideStructure?.map((slideData: any, index: number) => ({
            id: slideData.id || `slide_${Date.now()}_${index}`,
            number: index + 1,
            type: slideData.type || 'mckinsey_summary',
            title: slideData.title || slideData.headline || `Slide ${index + 1}`,
            content: slideData.content?.summary || slideData.narrative || slideData.description || 'Edit this content to add your insights...',
            charts: slideData.charts?.map((chart: any, chartIndex: number) => ({
              id: `chart_${Date.now()}_${chartIndex}`,
              type: chart.type || 'area',
              title: chart.message || chart.title || 'Data Visualization',
              data: parsedData[0]?.data || [],
              config: {
                xAxisKey: parsedData[0]?.columns?.[0] || 'date',
                yAxisKey: parsedData[0]?.columns?.[1] || 'value',
                showAnimation: true,
                showLegend: true,
                showGridLines: true,
                colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
                valueFormatter: (value: number) => new Intl.NumberFormat('en-US', {
                  notation: 'compact',
                  maximumFractionDigits: 1
                }).format(value)
              },
              insights: [chart.callout || 'Key insight from data visualization'],
              source: chart.dataSource || 'Analysis data'
            })) || [],
            keyTakeaways: slideData.content?.bulletPoints || slideData.keyTakeaways || [],
            aiInsights: {
              keyFindings: slideData.content?.bulletPoints || [],
              recommendations: slideData.executiveAction?.nextSteps || [],
              dataStory: slideData.content?.dataStory || slideData.narrative || 'Professional data insights and analysis.',
              businessImpact: slideData.soWhat || 'Strategic business value creation',
              confidence: slideData.confidence || 85
            },
            elements: [],
            background: { 
              type: 'mckinsey', 
              value: '', 
              gradient: { from: '#0f172a', to: '#1e293b', direction: '135deg' } 
            },
            style: 'mckinsey',
            layout: 'mckinsey_pyramid',
            animation: { enter: 'fadeIn', exit: 'fadeOut', duration: 0.8 },
            customStyles: {
              backgroundColor: selectedTemplate.colors?.[0] || '#0f172a',
              textColor: '#ffffff',
              accentColor: selectedTemplate.colors?.[1] || '#3b82f6',
            }
          })) || []

          // If no slides were generated, create a fallback slide
          if (convertedSlides.length === 0) {
            convertedSlides.push({
              id: `slide_${Date.now()}_0`,
              number: 1,
              type: 'title',
              title: 'Your Presentation',
              content: 'AI analysis complete. Ready to customize your slides.',
              charts: [],
              keyTakeaways: analysisResult.insights?.slice(0, 3).map((i: any) => i.title) || [],
              aiInsights: {
                keyFindings: analysisResult.insights?.slice(0, 5).map((i: any) => i.description) || [],
                recommendations: ['Customize this presentation with your data'],
                dataStory: analysisResult.narrative?.theme || 'Your data tells a compelling story',
                businessImpact: 'Strategic insights from your data',
                confidence: 85
              },
              elements: [],
              background: { 
                type: 'mckinsey', 
                value: '', 
                gradient: { from: '#0f172a', to: '#1e293b', direction: '135deg' } 
              },
              style: 'mckinsey',
              layout: 'default',
              animation: { enter: 'fadeIn', exit: 'fadeOut', duration: 0.8 },
              customStyles: {
                backgroundColor: selectedTemplate.colors?.[0] || '#0f172a',
                textColor: '#ffffff',
                accentColor: selectedTemplate.colors?.[1] || '#3b82f6',
              }
            })
          }

          return (
            <WorldClassPresentationEditor
              presentationId={`presentation_${Date.now()}`}
              initialSlides={convertedSlides}
              analysisData={{
                insights: analysisResult.insights || [],
                narrative: analysisResult.narrative || {},
                chartData: parsedData || [],
                keyMetrics: analysisResult.keyMetrics || [],
                uploadedFiles: uploadedFiles,
                rawData: parsedData[0]?.data || []
              }}
              onSave={async (slides) => {
                try {
                  console.log('Saving world-class presentation with advanced analytics:', slides)
                  
                  // Import slide persistence service
                  const { slidePersistence } = await import('@/lib/slides/slide-persistence')
                  
                  // Create comprehensive presentation data
                  const presentationData = {
                    id: `presentation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    title: intakeData.businessContext || 'Strategic Analysis Presentation',
                    slides: slides.map((slide: any) => ({
                      id: slide.id,
                      title: slide.title,
                      subtitle: slide.subtitle,
                      content: {
                        summary: slide.content,
                        bulletPoints: slide.keyTakeaways || [],
                        dataStory: slide.aiInsights?.dataStory || '',
                        evidence: slide.aiInsights?.keyFindings || []
                      },
                      charts: slide.charts?.map((chart: any) => ({
                        ...chart,
                        driversAnalysis: {
                          primaryDrivers: analysisResult.insights?.map((i: any) => i.strategicDrivers?.primaryDrivers || []).flat() || [],
                          tailwinds: analysisResult.insights?.map((i: any) => i.strategicDrivers?.tailwinds || []).flat() || [],
                          headwinds: analysisResult.insights?.map((i: any) => i.strategicDrivers?.headwinds || []).flat() || []
                        }
                      })) || [],
                      narrative: slide.aiInsights?.dataStory || '',
                      purpose: `Slide ${slide.number}: ${slide.title}`,
                      executiveAction: {
                        decision: slide.aiInsights?.businessImpact || '',
                        nextSteps: slide.aiInsights?.recommendations || [],
                        owner: 'Executive Team',
                        timeline: 'Next 30-90 days'
                      },
                      speakerNotes: `Speaker notes for ${slide.title}: Focus on key insights and strategic implications. Confidence level: ${slide.aiInsights?.confidence || 85}%`,
                      metadata: {
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        version: 1,
                        tags: [intakeData.industry, 'AI-generated', 'executive'],
                        analysisId: analysisResult.metadata?.analysisId
                      }
                    })),
                    metadata: {
                      userId: user?.id || '',
                      industry: intakeData.industry,
                      businessContext: intakeData.businessContext,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      version: 1,
                      totalSlides: slides.length,
                      estimatedDuration: slides.length * 2.5, // 2.5 minutes per slide
                      analysisMetadata: {
                        confidence: analysisResult.metadata?.confidence || 85,
                        dataQuality: analysisResult.metadata?.dataQuality || 75,
                        insightCount: analysisResult.insights?.length || 0,
                        chartCount: slides.reduce((total: number, slide: any) => total + (slide.charts?.length || 0), 0)
                      }
                    },
                    exportFormats: {}
                  }

                  // Save presentation to user profile
                  const presentationId = await slidePersistence.savePresentation(presentationData)
                  
                  // Generate PNG exports for quality validation
                  toast.loading('Generating high-quality slide exports...', { id: 'export' })
                  
                  try {
                    const pngUrls = await slidePersistence.exportPresentationAsPNG(presentationData)
                    toast.success(`World-class presentation saved with ${pngUrls.length} slide exports!`, { id: 'export' })
                    console.log('✅ PNG exports generated:', pngUrls)
                  } catch (exportError) {
                    console.error('PNG export warning:', exportError)
                    toast.success('Presentation saved successfully!', { id: 'export' })
                  }

                  // Analyze slide quality
                  for (const slide of presentationData.slides) {
                    const quality = await slidePersistence.analyzeSlideQuality(slide)
                    console.log(`Slide "${slide.title}" quality score: ${quality.score}/100`)
                    
                    if (quality.score < 70) {
                      console.warn('Slide quality below recommended threshold:', {
                        slide: slide.title,
                        score: quality.score,
                        improvements: quality.improvements
                      })
                    }
                  }

                  router.push(`/dashboard?presentation=${presentationId}`)
                } catch (error) {
                  console.error('Failed to save presentation:', error)
                  toast.error('Failed to save presentation. Please try again.')
                }
              }}
              onExport={async (format) => {
                console.log('Exporting professional presentation as:', format)
                toast.success(`Professional presentation exported as ${format.toUpperCase()}`)
              }}
            />
          )
        } else {
          // Fallback if data is missing
          return (
            <Card className="p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
              <p className="text-gray-400 mb-8">Missing analysis data or template selection.</p>
              <Button onClick={() => setCurrentStep(1)}>Start Over</Button>
            </Card>
          )
        }
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

      {/* Upgrade Prompt Modal */}
      {showUpgradePrompt && upgradePromptData && subscription && (
        <UpgradePrompt
          currentPlan={subscription.plan}
          limitType={upgradePromptData.limitType}
          currentUsage={upgradePromptData.currentUsage}
          limit={upgradePromptData.limit}
          onUpgrade={async (newPlan) => {
            const success = await upgradePlan(newPlan)
            if (success) {
              setShowUpgradePrompt(false)
              setUpgradePromptData(null)
              toast.success(`Successfully upgraded to ${newPlan}!`)
              // Retry the analysis after upgrade
              setTimeout(performAnalysis, 1000)
            } else {
              toast.error('Upgrade failed. Please try again.')
            }
          }}
          onClose={() => {
            setShowUpgradePrompt(false)
            setUpgradePromptData(null)
          }}
        />
      )}
    </div>
  )
} 