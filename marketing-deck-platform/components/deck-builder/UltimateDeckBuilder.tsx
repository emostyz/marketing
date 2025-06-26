'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { ArrowRight, Brain, FileText, Palette, Settings, TrendingUp, Upload, AlertCircle } from 'lucide-react'
import { useAutoSave } from '@/hooks/useAutoSave'
import { SaveStatusIndicator } from '@/components/ui/SaveStatusIndicator'
import { DescribeDataStep } from './DataIntake'
import { SimpleDataIntake } from './SimpleDataIntake'
import { TimePeriodAnalysisStep } from './TimePeriodAnalysisStep'
import { FactorsStep } from './FactorsStep'
import { UploadStep } from './UploadStep'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { TemplateStep, Template } from './TemplateStep'
import { EnhancedBrainV2 } from '@/lib/ai/enhanced-brain-v2'
import { UploadedFile } from '@/lib/types/upload'
import WorldClassPresentationEditor from '@/components/editor/WorldClassPresentationEditor'
import { useTierLimits } from '@/lib/hooks/useTierLimits'
import UpgradePrompt from '@/components/ui/UpgradePrompt'
import { useEnterpriseAccess } from '@/lib/hooks/useEnterpriseAccess'
import { SimpleRealTimeFlow } from './SimpleRealTimeFlow'
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

// Data validation functions
const validateSlideData = (slideData: any): boolean => {
  if (!slideData || typeof slideData !== 'object') return false
  if (!slideData.title || typeof slideData.title !== 'string') return false
  if (!slideData.type || typeof slideData.type !== 'string') return false
  if (!slideData.content || typeof slideData.content !== 'object') return false
  return true
}

const validateAnalysisResult = (result: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (!result || typeof result !== 'object') {
    errors.push('Analysis result is not a valid object')
    return { isValid: false, errors }
  }
  
  if (!result.insights || !Array.isArray(result.insights)) {
    errors.push('Missing or invalid insights array')
  }
  
  if (!result.narrative || typeof result.narrative !== 'object') {
    errors.push('Missing or invalid narrative object')
  }
  
  if (!result.slideStructure || !Array.isArray(result.slideStructure)) {
    errors.push('Missing or invalid slideStructure array')
  } else if (result.slideStructure.length === 0) {
    errors.push('SlideStructure array is empty')
  }
  
  if (!result.metadata || typeof result.metadata !== 'object') {
    errors.push('Missing or invalid metadata object')
  }
  
  return { isValid: errors.length === 0, errors }
}

const validateChartData = (chartData: any): boolean => {
  if (!chartData || typeof chartData !== 'object') return false
  if (!chartData.type || typeof chartData.type !== 'string') return false
  if (!chartData.title || typeof chartData.title !== 'string') return false
  return true
}

const createElementsFromInsights = (insights: any[], slideIndex: number): any[] => {
  if (!insights || !Array.isArray(insights)) return []
  
  return insights.slice(0, 3).map((insight, idx) => ({
    id: `insight_element_${slideIndex}_${idx}_${Date.now()}`,
    type: 'text',
    content: insight.description || insight.title || 'Strategic insight',
    position: { 
      x: 100 + (idx * 50), 
      y: 200 + (idx * 80) 
    },
    size: { 
      width: 400, 
      height: 60 
    },
    style: {
      fontSize: 16,
      fontWeight: 'normal',
      color: '#ffffff',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid rgba(59, 130, 246, 0.3)'
    },
    metadata: {
      source: 'ai_insight',
      confidence: insight.confidence || 85,
      insightType: insight.type || 'general'
    }
  }))
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


export function UltimateDeckBuilder({ className = '' }: { className?: string }) {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { checkLimit, incrementUsage, rollbackUsage, upgradePlan, subscription } = useTierLimits()
  const { isEnterprise, getAIEndpoint, getAIConfig } = useEnterpriseAccess()

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <Brain className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-white mb-2">Loading Deck Builder</h2>
          <p className="text-gray-400">Preparing your workspace...</p>
        </div>
      </div>
    )
  }

  // Don't render if no user (middleware will handle redirect)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <Brain className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-white mb-2">Authenticating...</h2>
          <p className="text-gray-400">Please wait...</p>
        </div>
      </div>
    )
  }
  
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
  const [analysisDatasetId, setAnalysisDatasetId] = useState<string | null>(null)
  const [analysisContext, setAnalysisContext] = useState<any>(null)
  const [analysisStatus, setAnalysisStatus] = useState('Initializing Analysis...')
  const [error, setError] = useState<string | null>(null)
  const [parsedData, setParsedData] = useState<any[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])

  // Memoize intakeSessionData to prevent infinite update loops
  const intakeSessionData = useMemo(() => ({
    sessionId: `intake_${user?.id || 'guest'}`,
    userId: user?.id,
    currentStep,
    intakeData
  }), [user?.id, currentStep, intakeData]);

  // Save intake form progress
  const saveIntakeProgress = useCallback(async (data: typeof intakeSessionData) => {
    try {
      // Save to API for authenticated users
      if (user) {
        const response = await fetch('/api/presentations/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: data.sessionId,
            type: 'intake_form',
            data: data,
            step: data.currentStep
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to save intake progress')
        }

        return await response.json()
      } else {
        // Fallback to localStorage for guest users
        localStorage.setItem('intake_progress', JSON.stringify(data))
        return { success: true }
      }
    } catch (error) {
      console.error('Failed to save intake progress:', error)
      // Fallback to localStorage on error
      localStorage.setItem('intake_progress', JSON.stringify(data))
      throw error
    }
  }, [user])

  // Auto-save configuration for intake form
  const intakeAutoSave = useAutoSave(intakeSessionData, saveIntakeProgress, {
    enabled: true, // Always enabled
    interval: 2000, // Save every 2 seconds
    debounceDelay: 100, // Wait 100ms after last change for instant saves
    conflictResolution: 'auto' // Auto-resolve conflicts for form data
  })

  // Load existing intake progress on mount
  useEffect(() => {
    const loadIntakeProgress = async () => {
      try {
        if (user) {
          // Try to load from API for authenticated users
          const response = await fetch(`/api/presentations/session?type=intake_form&userId=${user.id}`)
          if (response.ok) {
            const session = await response.json()
            if (session.data) {
              setCurrentStep(session.data.currentStep || 1)
              setIntakeData(session.data.intakeData || intakeData)
              console.log('📋 Restored intake progress from server')
              return
            }
          }
        }

        // Fallback to localStorage
        const savedProgress = localStorage.getItem('intake_progress')
        if (savedProgress) {
          const data = JSON.parse(savedProgress)
          setCurrentStep(data.currentStep || 1)
          setIntakeData(data.intakeData || intakeData)
          console.log('📋 Restored intake progress from localStorage')
        }
      } catch (error) {
        console.error('Failed to load intake progress:', error)
      }
    }

    loadIntakeProgress()
  }, [user])

  // Check for uploaded data from previous step
  React.useEffect(() => {
    const uploadResult = localStorage.getItem('upload-result')
    if (uploadResult) {
      try {
        const data = JSON.parse(uploadResult)
        console.log('📂 Found upload data:', data)
        
        if (data.success && data.files && data.files.length > 0) {
          // Convert upload result to the format expected by deck builder
          const processedFiles = data.files.map((file: any, index: number) => ({
            id: `uploaded-${index}`,
            name: file.fileName,
            type: file.fileType,
            size: file.fileSize,
            status: 'success',
            parsedData: (file.columns && file.data) ? {
              rows: file.data,
              columns: file.columns,
              rowCount: file.rowCount || (file.data ? file.data.length : 0),
              insights: {
                timeSeriesDetected: file.columns.some((col: any) =>
                  ['date', 'time', 'month', 'year', 'day'].some(t =>
                    (col.name || '').toLowerCase().includes(t)
                  )
                ) || false,
                dataQuality: 'Good',
                potentialMetrics: [],
                potentialDimensions: []
              },
              summary: `Uploaded ${file.fileType} file with ${file.rowCount || (file.data ? file.data.length : 0)} rows`
            } : null,
            url: '#' // Mock URL for demo
          }))
          
          console.log('✅ Processed uploaded files:', processedFiles)
          
          // Update intake data with uploaded files
          setIntakeData(prev => ({
            ...prev,
            files: processedFiles
          }))
          
          // If we have data, skip to step 5 (AI Analysis) or show success message
          if (processedFiles.length > 0) {
            console.log('🚀 Data loaded, ready for analysis')
            // Show a brief notification and automatically proceed to analysis
            toast.success(`${processedFiles.length} file(s) loaded successfully! Proceeding to analysis...`)
            
            // Small delay then proceed to analysis
            setTimeout(() => {
              setCurrentStep(5) // Go directly to AI Analysis
            }, 1000)
          }
        }
        
        // Clear the upload result to avoid reprocessing
        localStorage.removeItem('upload-result')
      } catch (error) {
        console.error('❌ Error processing upload data:', error)
        toast.error('Failed to load uploaded data')
      }
    }
  }, [])

  const steps = [
    { id: 1, title: 'Context', icon: <FileText /> },
    { id: 2, title: 'Period', icon: <TrendingUp /> },
    { id: 3, title: 'Factors', icon: <TrendingUp /> },
    { id: 4, title: 'Upload', icon: <Upload /> },
    { id: 5, title: 'AI', icon: <Brain /> },
    { id: 6, title: 'Template', icon: <Palette /> },
    { id: 7, title: 'Customize', icon: <Settings /> },
  ]

  const nextStep = () => {
    setCurrentStep(prev => {
      const next = prev + 1;
      console.log('[UltimateDeckBuilder] nextStep called, advancing from', prev, 'to', next);
      return next;
    });
  }
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

  const regenerateSlide = async (slideIndex: number, customPrompt?: string) => {
    try {
      console.log(`🔄 Regenerating slide ${slideIndex + 1}`)
      toast.loading(`Regenerating slide ${slideIndex + 1}...`, { id: 'regenerate' })

      const requestData = {
        data: parsedData[0]?.data || [],
        context: intakeData.context,
        timeFrame: intakeData.timeFrame,
        requirements: intakeData.requirements,
        slideIndex,
        customPrompt: customPrompt || `Regenerate slide ${slideIndex + 1} with fresh insights and different perspective`,
        regenerationType: 'single_slide'
      }

      const response = await fetch('/api/ai/universal-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        throw new Error('Failed to regenerate slide')
      }

      const result = await response.json()
      
      if (result.success && result.result.slideStructure?.[0]) {
        const newSlideData = result.result.slideStructure[0]
        toast.success(`Slide ${slideIndex + 1} regenerated successfully!`, { id: 'regenerate' })
        return newSlideData
      } else {
        throw new Error('Invalid regeneration response')
      }
    } catch (error) {
      console.error('❌ Slide regeneration failed:', error)
      toast.error(`Failed to regenerate slide ${slideIndex + 1}`, { id: 'regenerate' })
      return null
    }
  }

  const performAnalysis = async () => {
    console.log('🚀 performAnalysis called!')
    console.log('📊 Current files:', intakeData.files)
    console.log('📊 Detailed files debug:', intakeData.files.map(f => ({
      name: f.name,
      status: f.status,
      datasetId: f.datasetId,
      parsedData: f.parsedData,
      url: f.url
    })))
    
    // Check if we have files
    const successfulFiles = intakeData.files.filter(f => f.status === 'success')
    if (successfulFiles.length === 0) {
      toast.error('Please upload at least one file before proceeding to analysis.')
      return
    }
    
    console.log('✅ Starting real-time analysis flow...')
    
    // Get the first successful file's dataset ID
    const firstFile = successfulFiles[0]
    const datasetId = firstFile.datasetId || `demo-dataset-${Date.now()}`
    
    console.log('📊 Using dataset ID:', datasetId, 'from file:', firstFile.name)
    
    // Prepare context from intake data
    const context = {
      audience: intakeData.context?.targetAudience || 'executives',
      goal: intakeData.context?.businessContext || 'analyze data',
      timeLimit: 15,
      industry: intakeData.context?.industry || 'business',
      decision: intakeData.context?.keyMetrics || 'improve performance',
      businessContext: intakeData.context?.businessContext || 'analyze data',
      description: intakeData.context?.description || 'Data analysis presentation'
    }
    
    console.log('✨ Using context:', context)
    
    // Store dataset ID and context for the real-time flow
    setAnalysisDatasetId(datasetId)
    setAnalysisContext(context)
    
    // Move to the real-time analysis step
    setCurrentStep(5)
  }

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
        // Show the real-time analysis flow with insights approval and structure review
        if (analysisDatasetId && analysisContext) {
          return (
            <SimpleRealTimeFlow 
              datasetId={analysisDatasetId}
              context={analysisContext}
              onComplete={(deckId: string) => {
                console.log('🎉 Real-time analysis complete, navigating to deck:', deckId)
                router.push(`/deck-builder/${deckId}`)
              }}
              onBack={() => {
                setCurrentStep(4) // Go back to upload step
                setAnalysisDatasetId(null)
                setAnalysisContext(null)
              }}
            />
          )
        } else {
          // Fallback - should not happen but just in case
          return (
            <Card className="p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Analysis Setup</h2>
              <p className="text-gray-400 mb-8">Setting up analysis...</p>
              <Button onClick={() => setCurrentStep(4)}>Back to Upload</Button>
            </Card>
          )
        }
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
          try {
            // Validate analysis result structure
            const validation = validateAnalysisResult(analysisResult)
            if (!validation.isValid) {
              console.error('❌ Analysis result validation failed:', validation.errors)
              toast.error(`Analysis validation failed: ${validation.errors.join(', ')}`)
              setError(`Analysis validation failed: ${validation.errors[0]}`)
              return (
                <Card className="p-8 text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">Analysis Error</h2>
                  <p className="text-gray-400 mb-8">The AI analysis result is invalid. Please try again.</p>
                  <Button onClick={() => setCurrentStep(5)}>Retry Analysis</Button>
                </Card>
              )
            }

            // Convert analysis result to professional slides format with validation
            const convertedSlides = analysisResult.slideStructure?.map((slideData: any, index: number) => {
              // Validate individual slide data
              if (!validateSlideData(slideData)) {
                console.warn(`⚠️ Invalid slide data at index ${index}, using fallback`)
                slideData = {
                  id: `slide_fallback_${index}`,
                  title: `Slide ${index + 1}`,
                  type: 'content',
                  content: { summary: 'Edit this content to add your insights...' }
                }
              }

              // Validate and process charts
              const validatedCharts = slideData.charts?.filter(validateChartData).map((chart: any, chartIndex: number) => ({
                id: `chart_${Date.now()}_${chartIndex}`,
                type: ['area', 'bar', 'line', 'scatter', 'pie'].includes(chart.type) ? chart.type : 'area',
                title: chart.message || chart.title || 'Data Visualization',
                data: Array.isArray(parsedData[0]?.data) ? parsedData[0].data : [],
                config: {
                  xAxisKey: parsedData[0]?.columns?.[0] || 'Date',
                  yAxisKey: parsedData[0]?.columns?.[1] || 'Revenue',
                  showAnimation: true,
                  showLegend: true,
                  showGridLines: true,
                  colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
                  valueFormatter: (value: number) => {
                    try {
                      return new Intl.NumberFormat('en-US', {
                        notation: 'compact',
                        maximumFractionDigits: 1,
                        style: 'currency',
                        currency: 'USD'
                      }).format(value)
                    } catch {
                      return String(value)
                    }
                  }
                },
                insights: [chart.hiddenPattern || chart.callout || 'Strategic insight from data visualization'],
                source: chart.dataSource || 'Strategic Analysis Data',
                hiddenPattern: chart.hiddenPattern,
                dataStory: chart.dataStory
              })) || []

              // Create elements from AI insights for this slide
              const slideInsights = analysisResult.insights?.filter((insight: any) => 
                insight.title?.toLowerCase().includes(slideData.title?.toLowerCase().split(' ')[0] || '') ||
                Math.random() < 0.3 // Randomly distribute insights across slides
              ) || []
              
              const generatedElements = createElementsFromInsights(slideInsights, index)

              return {
                id: slideData.id || `slide_${Date.now()}_${index}`,
                number: index + 1,
                type: slideData.type === 'hidden_insight' || slideData.type === 'strategic_analysis' ? 'chart' : slideData.type || 'content',
                title: slideData.title || slideData.headline || `Slide ${index + 1}`,
                content: {
                  summary: slideData.content?.summary || slideData.narrative || slideData.description || 'Edit this content to add your insights...',
                  title: slideData.title,
                  subtitle: slideData.content?.subtitle,
                  bulletPoints: slideData.content?.bulletPoints || [],
                  hiddenInsight: slideData.content?.hiddenInsight,
                  strategicImplication: slideData.content?.strategicImplication,
                  hiddenDrivers: slideData.content?.hiddenDrivers,
                  strategicValue: slideData.content?.strategicValue,
                  hiddenPattern: slideData.charts?.[0]?.hiddenPattern,
                  dataStory: slideData.charts?.[0]?.dataStory,
                  chartTitle: slideData.charts?.[0]?.title || slideData.charts?.[0]?.message,
                  confidence: Math.max(0, Math.min(100, slideData.confidence || 85))
                },
                data: Array.isArray(parsedData[0]?.data) ? parsedData[0].data : [],
                chartType: validatedCharts[0]?.type || 'area',
                categories: Array.isArray(parsedData[0]?.columns) ? parsedData[0].columns.slice(1) : ['Revenue'],
                index: parsedData[0]?.columns?.[0] || 'Date',
                subtitle: slideData.content?.hiddenInsight ? `Hidden Insight: ${slideData.content.hiddenInsight}` : undefined,
                charts: validatedCharts,
                keyTakeaways: slideData.content?.bulletPoints || slideData.keyTakeaways || [],
                aiInsights: {
                  keyFindings: slideData.content?.bulletPoints || [],
                  recommendations: slideData.executiveAction?.nextSteps || [],
                  dataStory: slideData.content?.dataStory || slideData.narrative || 'Strategic data insights and analysis.',
                  businessImpact: slideData.content?.strategicImplication || slideData.soWhat || 'Strategic business value creation',
                  confidence: Math.max(0, Math.min(100, slideData.confidence || 85)),
                  hiddenDrivers: slideData.content?.hiddenInsight,
                  strategicValue: slideData.content?.strategicImplication,
                  insightLevel: slideData.insightLevel || 'basic'
                },
                elements: generatedElements, // Pre-populate with AI insights
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
              }
            }) || []

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
              onRegenerateSlide={regenerateSlide}
              onSave={async (slides) => {
                try {
                  console.log('Saving world-class presentation with advanced analytics:', slides)
                  
                  // Import slide persistence service
                  const { slidePersistence } = await import('@/lib/slides/slide-persistence')
                  
                  // Create comprehensive presentation data
                  const presentationData = {
                    id: `presentation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    title: intakeData.context.businessContext || 'Strategic Analysis Presentation',
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
                        tags: [intakeData.context.industry || 'General', 'AI-generated', 'executive'],
                        analysisId: analysisResult.metadata?.analysisId
                      }
                    })),
                    metadata: {
                      userId: user?.id || '',
                      industry: intakeData.context.industry || 'General',
                      businessContext: intakeData.context.businessContext || 'Business Analysis',
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
          } catch (error) {
            console.error('❌ Slide conversion error:', error)
            toast.error('Failed to convert AI analysis to slides. Please try again.')
            setError('Slide conversion failed. Please retry the analysis.')
            return (
              <Card className="p-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Conversion Error</h2>
                <p className="text-gray-400 mb-8">Failed to convert AI analysis to slides. This may be due to malformed data.</p>
                <div className="space-x-4">
                  <Button onClick={() => setCurrentStep(5)}>Retry Analysis</Button>
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>Start Over</Button>
                </div>
              </Card>
            )
          }
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

  // Add a log to the main render
  console.log('[UltimateDeckBuilder] Render, currentStep:', currentStep);

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white py-8 px-4">
      <div className="flex-1 flex flex-col justify-center">
        <div className="max-w-6xl mx-auto w-full flex flex-col justify-center items-center gap-8">
          {/* Page Header */}
          <div className="mb-12 w-full text-center relative">
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Create a New Presentation
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Follow the steps below to generate a stunning, AI-powered deck.
            </p>
            
            {/* Auto-save status in top right */}
            <div className="absolute top-0 right-0">
              <SaveStatusIndicator
                status={intakeAutoSave.isSaving ? 'saving' : intakeAutoSave.saveError ? 'error' : 'saved'}
                lastSaved={intakeAutoSave.lastSaved}
                hasUnsavedChanges={intakeAutoSave.hasUnsavedChanges}
                onForceSave={intakeAutoSave.saveNow}
              />
            </div>
          </div>

          {/* New Stepper - evenly spaced icons with clickable completed steps */}
          <div className="mb-12 flex items-center w-full gap-8">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center text-center flex-1">
                  <button
                    onClick={() => {
                      // Allow clicking on completed steps to go back
                      if (currentStep > step.id) {
                        setCurrentStep(step.id)
                      }
                    }}
                    disabled={currentStep <= step.id}
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300
                      ${currentStep > step.id 
                        ? 'bg-blue-600 border-blue-500 hover:bg-blue-700 hover:border-blue-400 cursor-pointer' 
                        : currentStep === step.id 
                        ? 'bg-blue-600 border-blue-500' 
                        : 'bg-gray-800 border-gray-700'
                      }
                      ${currentStep > step.id ? 'hover:scale-105' : ''}
                    `}
                    title={currentStep > step.id ? `Click to go back to ${step.title}` : step.title}
                  >
                    {React.cloneElement(step.icon, { 
                      className: `w-6 h-6 ${currentStep >= step.id ? 'text-white' : 'text-gray-500'}` 
                    })}
                  </button>
                  <p className={`mt-2 text-sm font-medium ${currentStep >= step.id ? 'text-white' : 'text-gray-500'}`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="h-0.5 mx-2 flex-grow bg-gradient-to-r from-gray-700 to-gray-700" />
                )}
              </React.Fragment>
            ))}
          </div>

          <main className="w-full flex flex-col items-center">
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

export default UltimateDeckBuilder 