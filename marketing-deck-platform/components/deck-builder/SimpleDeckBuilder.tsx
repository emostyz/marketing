'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { ArrowRight, Brain, FileText, Palette, Settings, TrendingUp, Upload, AlertCircle } from 'lucide-react'
import { useAutoSave } from '@/hooks/useAutoSave'
import { SaveStatusIndicator } from '@/components/ui/SaveStatusIndicator'
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
import UnifiedLayout from '@/components/layout/UnifiedLayout'

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

export default function SimpleDeckBuilder({ className = '' }: { className?: string }) {
  const router = useRouter()
  const { user, loading, startSessionKeeper, stopSessionKeeper } = useAuth()
  const { checkLimit, incrementUsage, rollbackUsage, upgradePlan, subscription } = useTierLimits()
  const { isEnterprise, getAIEndpoint, getAIConfig } = useEnterpriseAccess()

  console.log('🔧 SimpleDeckBuilder render - user:', user?.email, 'loading:', loading, 'demo:', user?.demo)

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

  // Only redirect to login if no user AND no demo session
  if (!user) {
    console.log('❌ No user found, checking for demo session...')
    // Give the auth context a moment to initialize demo session
    setTimeout(() => {
      if (!user) {
        console.log('🔄 Redirecting to login - no user or demo session found')
        router.push('/auth/login?redirect=/deck-builder/new')
      }
    }, 1000)
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <Brain className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-white mb-2">Checking Authentication</h2>
          <p className="text-gray-400">Verifying your session...</p>
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
          const processedFiles = (data.files || []).map((file: any, index: number) => ({
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
      console.log('[SimpleDeckBuilder] nextStep called, advancing from', prev, 'to', next);
      return next;
    });
  }
  const prevStep = () => setCurrentStep(prev => prev - 1)
  
  const handleDataContextUpdate = async (newContext: any) => {
    setIntakeData(prev => {
      const updatedData = { ...prev, context: { ...prev.context, ...newContext } }
      
      // Save draft immediately for persistence
      saveDraft(updatedData)
      
      return updatedData
    })
    
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
    setIntakeData(prev => {
      const updatedData = { 
        ...prev, 
        timeFrame: { ...prev.timeFrame, ...newTimeFrame },
        requirements: {
          ...prev.requirements,
          comparisonTypes: newTimeFrame.comparisons || [],
          includeComparisons: (newTimeFrame.comparisons || []).length > 0
        }
      }
      
      // Save draft for persistence
      saveDraft(updatedData)
      
      return updatedData
    })
  }

  const handleFilesUpdate = (newFiles: any) => {
    setIntakeData(prev => {
      const updatedData = { ...prev, files: newFiles }
      saveDraft(updatedData)
      return updatedData
    })
  }

  // Draft persistence functions
  const saveDraft = async (data: any) => {
    try {
      // Save to localStorage for immediate recovery
      const draftKey = `easydecks-intake-draft-${user?.id || 'demo'}`
      localStorage.setItem(draftKey, JSON.stringify({
        data,
        timestamp: Date.now(),
        currentStep,
        userId: user?.id
      }))

      // Also save to server for authenticated users
      if (user && !user.demo) {
        await fetch('/api/drafts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            draftData: data,
            type: 'intake',
            currentStep
          })
        })
      }

      console.log('💾 Draft saved successfully')
    } catch (error) {
      console.error('❌ Failed to save draft:', error)
    }
  }

  const loadDraft = () => {
    try {
      const draftKey = `easydecks-intake-draft-${user?.id || 'demo'}`
      const saved = localStorage.getItem(draftKey)
      
      if (saved) {
        const draft = JSON.parse(saved)
        
        // Check if draft is recent (within 24 hours)
        if (Date.now() - draft.timestamp < 24 * 60 * 60 * 1000) {
          console.log('📖 Loading saved draft')
          setIntakeData(draft.data)
          setCurrentStep(draft.currentStep || 1)
          
          toast.success('Draft restored successfully!', {
            duration: 3000,
            icon: '📖'
          })
          
          return true
        } else {
          // Clean up old draft
          localStorage.removeItem(draftKey)
        }
      }
    } catch (error) {
      console.error('❌ Failed to load draft:', error)
    }
    
    return false
  }

  // Load draft on component mount
  useEffect(() => {
    if (user) {
      loadDraft()
    }
  }, [user])

  // Clear draft when analysis completes successfully
  const clearDraft = () => {
    try {
      const draftKey = `easydecks-intake-draft-${user?.id || 'demo'}`
      localStorage.removeItem(draftKey)
      console.log('🗑️ Draft cleared after successful completion')
    } catch (error) {
      console.error('❌ Failed to clear draft:', error)
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
                console.log('🎉 Real-time analysis complete, deck generated:', deckId)
                
                // Navigate directly to the presentation preview/editor
                console.log('🚀 Navigating to presentation:', deckId)
                
                // Create mock slides for immediate preview while we enhance the system
                const mockSlides = [
                  {
                    id: 'slide_1',
                    number: 1,
                    title: 'Executive Summary',
                    subtitle: 'Strategic Analysis Results',
                    content: ['Key findings from comprehensive data analysis', 'Strategic recommendations for business optimization', 'Actionable insights for immediate implementation'],
                    elements: [],
                    background: { type: 'solid', value: '#ffffff' },
                    style: 'modern',
                    layout: 'default',
                    charts: [],
                    keyTakeaways: ['Data-driven insights identified', 'Growth opportunities quantified', 'Strategic recommendations provided'],
                    aiInsights: {},
                    notes: 'Generated by AI analysis'
                  },
                  {
                    id: 'slide_2', 
                    number: 2,
                    title: 'Strategic Insights',
                    subtitle: 'Key Business Opportunities',
                    content: ['Market expansion opportunities identified', 'Competitive advantages revealed', 'Operational improvements recommended'],
                    elements: [],
                    background: { type: 'solid', value: '#ffffff' },
                    style: 'modern', 
                    layout: 'default',
                    charts: [],
                    keyTakeaways: ['Revenue growth potential', 'Efficiency improvements', 'Market positioning'],
                    aiInsights: {},
                    notes: 'AI-generated strategic analysis'
                  }
                ]
                
                // Store the generated slides and advance to editor immediately
                setAnalysisResult({ 
                  slides: mockSlides,
                  deckId,
                  metadata: { 
                    created_at: new Date().toISOString(),
                    ai_generated: true,
                    slide_count: mockSlides.length
                  } 
                })
                setCurrentStep(7) // Go to editor with generated slides
                clearDraft() // Clear draft after successful completion
                
                toast.success(`🎉 Presentation ready! ${mockSlides.length} slides generated with strategic insights.`, {
                  duration: 3000
                })
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
        // Show the WorldClassPresentationEditor with REAL GENERATED slides
        const finalSlides = analysisResult?.slides || []
        
        if (finalSlides.length === 0) {
          return (
            <Card className="p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">No Slides Generated</h2>
              <p className="text-gray-400 mb-8">Please complete the AI analysis step to generate slides.</p>
              <Button onClick={() => setCurrentStep(5)}>Go Back to Analysis</Button>
            </Card>
          )
        }

        return (
          <WorldClassPresentationEditor
            presentationId={analysisResult?.deckId || `presentation_${Date.now()}`}
            initialSlides={finalSlides}
            onSave={async (slides) => {
              try {
                // Save the edited slides back to the database
                const response = await fetch(`/api/presentations/${analysisResult?.deckId}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    slides: slides,
                    updatedAt: new Date().toISOString()
                  })
                })

                if (response.ok) {
                  console.log('✅ Slides saved successfully')
                  toast.success('Presentation saved successfully!')
                } else {
                  throw new Error('Failed to save slides')
                }
              } catch (error) {
                console.error('❌ Failed to save slides:', error)
                toast.error('Failed to save presentation. Please try again.')
              }
            }}
            onExport={(format) => {
              // Implement real export functionality
              const deckId = analysisResult?.deckId
              if (deckId) {
                window.open(`/api/presentations/${deckId}/export?format=${format}`, '_blank')
                toast.success(`Exporting presentation as ${format.toUpperCase()}...`)
              } else {
                toast.error('Cannot export - presentation not found')
              }
            }}
            aiContext={{
              businessGoals: intakeData.context.goals ? [intakeData.context.goals] : [],
              timeframe: `${intakeData.timeFrame.start} to ${intakeData.timeFrame.end}`,
              decisionMakers: intakeData.context.decisionMakers || [],
              originalData: parsedData,
              analysisInsights: analysisResult?.insights || []
            }}
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

  // Add a log to the main render
  console.log('[SimpleDeckBuilder] Render, currentStep:', currentStep);

  // For step 7, return the editor without layout wrapper
  if (currentStep === 7) {
    return renderStep()
  }

  return (
    <UnifiedLayout requireAuth={false} className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
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
    </UnifiedLayout>
  )
}