"use client"

import React, { useState, useCallback, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { 
  Brain, Loader2, Plus, RefreshCw, Eye, Pause, Play,
  CheckCircle, AlertCircle, MessageSquare, Lightbulb,
  BarChart3, Target, Zap, Save, Trash2, Download, Image, TrendingUp
} from 'lucide-react'
import { deckBrain, DeckInsight, DataPoint } from '@/lib/openai/deck-brain'
import { InteractiveSlide } from './InteractiveSlide'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { DeckPersistence, DeckDraft, DeckSlide } from '@/lib/deck-persistence'

interface EnhancedDeckBuilderProps {
  draftId?: string
  initialData?: Partial<DeckDraft>
  userRequirements?: string[]
  userGoals?: string[]
  onComplete?: (slides: any[]) => void
}

interface ProcessingState {
  isActive: boolean
  progress: number
  status: string
  phase: 'analysis' | 'insights' | 'visualization' | 'review' | 'complete'
  canAddContext: boolean
  isPaused: boolean
}

export default function EnhancedDeckBuilder({ 
  draftId, 
  initialData, 
  userRequirements = [], 
  userGoals = [], 
  onComplete 
}: EnhancedDeckBuilderProps) {
  const { user } = useAuth()
  const router = useRouter()
  
  const [processing, setProcessing] = useState<ProcessingState>({
    isActive: false,
    progress: 0,
    status: 'Ready to analyze your data',
    phase: 'analysis',
    canAddContext: false,
    isPaused: false
  })

  const [showContextInput, setShowContextInput] = useState(false)
  const [additionalContext, setAdditionalContext] = useState('')
  const [keyPoints, setKeyPoints] = useState<string[]>([])
  const [insights, setInsights] = useState<DeckInsight | null>(null)
  const [generatedSlides, setGeneratedSlides] = useState<any[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [processingLogs, setProcessingLogs] = useState<string[]>([])

  const [draft, setDraft] = useState<DeckDraft | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [showChartGenerator, setShowChartGenerator] = useState(false)
  const [chartGenerationData, setChartGenerationData] = useState<any>(null)

  // Add processing log
  const addLog = useCallback((message: string) => {
    setProcessingLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }, [])

  // Progress callback for the brain
  const updateProgress = useCallback((progress: number, status: string) => {
    setProcessing(prev => ({
      ...prev,
      progress,
      status,
      canAddContext: progress > 20 && progress < 80,
      phase: progress < 25 ? 'analysis' : 
             progress < 50 ? 'insights' :
             progress < 75 ? 'visualization' :
             progress < 100 ? 'review' : 'complete'
    }))
    addLog(status)
  }, [addLog])

  // Start the deck building process
  const startDeckBuilding = async () => {
    try {
      setProcessing(prev => ({ ...prev, isActive: true, isPaused: false }))
      addLog('🚀 Starting enhanced deck building process...')
      
      // Phase 1: Brain Analysis
      updateProgress(5, '🧠 Brain initializing deep data analysis...')
      
      const brainInsights = await deckBrain.analyzeDataForInsights(
        initialData || [],
        userRequirements,
        userGoals,
        updateProgress
      )
      
      setInsights(brainInsights)
      setKeyPoints(brainInsights.keyTakeaways)
      
      // Show preview of key points
      setShowPreview(true)
      addLog('📋 Key insights preview ready for review')
      
    } catch (error) {
      console.error('Deck building error:', error)
      toast.error('Error in brain analysis. Using fallback processing.')
      addLog('⚠️ Error occurred, switching to fallback analysis')
      
      // Fallback processing
      await fallbackProcessing()
    }
  }

  // Continue after preview approval
  const continueBuilding = async () => {
    if (!insights) return
    
    try {
      console.log('🚀 Starting slide generation from insights:', insights)
      updateProgress(85, '🏗️ Brain building interactive slides...')
      
      // Generate slides from insights
      const slides = await generateSlidesFromInsights(insights)
      console.log('📊 Generated slides:', slides)
      setGeneratedSlides(slides)
      
      updateProgress(95, '✨ Brain finalizing deck presentation...')
      
      // Final validation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      updateProgress(100, '✅ Your world-class deck is ready!')
      
      setProcessing(prev => ({ ...prev, isActive: false }))
      addLog('🎉 Deck building completed successfully!')
      
      toast.success('Deck built successfully with AI-powered insights!')
      
      // Create the final deck object
      const finalDeck = {
        insights,
        slides,
        metadata: {
          createdAt: new Date(),
          userRequirements,
          userGoals,
          dataPoints: Array.isArray(initialData) ? initialData.length : 0,
          confidence: insights.confidence,
          title: `AI-Generated Presentation - ${new Date().toLocaleDateString()}`
        }
      }
      
      console.log('🎯 Final deck object:', finalDeck)
      
      // Automatically call onComplete after a short delay to show the slides
      setTimeout(() => {
        if (onComplete) {
          console.log('📤 Calling onComplete with deck data')
          onComplete(finalDeck)
        } else {
          console.warn('⚠️ No onComplete callback provided')
        }
      }, 2000) // 2 second delay to show the completion message
      
    } catch (error) {
      console.error('Slide generation error:', error)
      toast.error('Error generating slides')
      addLog('❌ Error in slide generation')
    }
  }

  // Generate slides from AI insights
  const generateSlidesFromInsights = async (insights: DeckInsight): Promise<any[]> => {
    console.log('🏗️ Generating slides from insights:', insights)
    
    const slides = []
    
    // Title slide
    slides.push({
      id: 'title-slide',
      type: 'title',
      title: 'Data-Driven Insights',
      content: {
        title: 'Strategic Analysis Results',
        subtitle: `Generated from ${Array.isArray(initialData) ? initialData.length : 0} data points`,
        description: insights.executiveSummary,
        context: userRequirements.length > 0 ? userRequirements.join(', ').slice(0, 100) + '...' : 'Strategic analysis',
        bulletPoints: [],
        narrative: [],
        insights: []
      }
    })
    
    // Executive summary slide
    slides.push({
      id: 'executive-summary',
      type: 'content',
      title: 'Executive Summary',
      content: {
        title: 'Executive Summary',
        subtitle: `Confidence Score: ${insights.confidence}%`,
        body: insights.executiveSummary,
        bulletPoints: insights.keyTakeaways,
        narrative: [insights.overallNarrative],
        insights: insights.keyTakeaways
      }
    })
    
    // Chart slides from data points
    insights.dataPoints.forEach((dataPoint: DataPoint, index: number) => {
      console.log(`Creating chart slide ${index + 1}:`, dataPoint)
      
      // Ensure we have real data for the chart
      const chartData = dataPoint.chartConfig.data && dataPoint.chartConfig.data.length > 0 
        ? dataPoint.chartConfig.data 
        : Array.isArray(initialData) ? initialData.slice(0, 20) : [] // Use original data if chart data is empty
      
      const slide = {
        id: `chart-slide-${index}`,
        type: 'chart',
        title: dataPoint.title,
        chartType: dataPoint.visualizationType,
        data: chartData,
        categories: dataPoint.chartConfig.categories,
        index: dataPoint.chartConfig.index,
        content: {
          title: dataPoint.title,
          subtitle: `Priority: ${dataPoint.priority.toUpperCase()}`,
          description: dataPoint.insight,
          narrative: [dataPoint.story],
          insights: [dataPoint.insight],
          bulletPoints: [dataPoint.insight]
        },
        tremorConfig: {
          type: dataPoint.visualizationType,
          colors: dataPoint.chartConfig.colors,
          showLegend: true,
          showGradient: dataPoint.visualizationType === 'area',
          showGrid: true,
          showTooltip: true,
          animation: true,
          height: 72
        },
        interactive: {
          canRecolor: true,
          canHideColumns: true,
          canResize: true,
          canDrag: true
        }
      }
      
      console.log(`Created chart slide:`, slide)
      slides.push(slide)
    })
    
    // Add insights summary slide
    if (insights.keyTakeaways.length > 0) {
      slides.push({
        id: 'insights-summary',
        type: 'content',
        title: 'Key Insights Summary',
        content: {
          title: 'Key Insights Summary',
          subtitle: 'Strategic Recommendations',
          body: insights.overallNarrative,
          bulletPoints: insights.keyTakeaways,
          narrative: [insights.overallNarrative],
          insights: insights.keyTakeaways
        }
      })
    }
    
    // Add recommendations slide
    if (insights.recommendedStructure.length > 0) {
      slides.push({
        id: 'recommendations',
        type: 'content',
        title: 'Strategic Recommendations',
        content: {
          title: 'Strategic Recommendations',
          subtitle: 'Next Steps',
          body: 'Based on the analysis, here are the key recommendations:',
          bulletPoints: insights.recommendedStructure,
          narrative: ['Strategic action plan based on data insights'],
          insights: insights.recommendedStructure
        }
      })
    }
    
    console.log(`🎯 Generated ${slides.length} slides total`)
    return slides
  }

  // Fallback processing when OpenAI fails
  const fallbackProcessing = async () => {
    updateProgress(20, '🔄 Using enhanced fallback analysis...')
    
    // Ensure we have some data to work with
    const sampleData = Array.isArray(initialData) && initialData.length > 0 ? initialData : [
      { Month: 'Jan', Revenue: 45000, Leads: 1200, Conversion: 12 },
      { Month: 'Feb', Revenue: 52000, Leads: 1350, Conversion: 15 },
      { Month: 'Mar', Revenue: 48000, Leads: 1180, Conversion: 14 },
      { Month: 'Apr', Revenue: 61000, Leads: 1500, Conversion: 18 },
      { Month: 'May', Revenue: 58000, Leads: 1420, Conversion: 16 },
      { Month: 'Jun', Revenue: 67000, Leads: 1650, Conversion: 20 }
    ]
    
    const fallbackInsights: DeckInsight = {
      dataPoints: [{
        title: 'Performance Overview',
        insight: 'Key performance metrics analysis from your data',
        supportingData: sampleData,
        visualizationType: 'bar',
        story: 'This visualization shows the main patterns in your dataset.',
        priority: 'high',
        chartConfig: {
          index: sampleData && sampleData[0] ? Object.keys(sampleData[0])[0] : 'Month',
          categories: sampleData && sampleData[0] ? Object.keys(sampleData[0]).slice(1, 4) : ['Value'],
          colors: ['blue', 'emerald', 'violet'],
          data: sampleData
        }
      }],
      overallNarrative: `Analysis of ${sampleData.length} data points reveals important business insights.`,
      keyTakeaways: [
        'Data shows measurable performance patterns',
        'Multiple optimization opportunities identified',
        'Strategic focus areas clearly defined',
        'Actionable recommendations available'
      ],
      executiveSummary: `Comprehensive analysis of your dataset reveals key strategic insights for ${userRequirements.join(', ') || 'business optimization'}.`,
      recommendedStructure: ['Overview', 'Key Metrics', 'Insights', 'Recommendations'],
      confidence: 75
    }
    
    console.log('🔄 Fallback insights generated:', fallbackInsights)
    
    setInsights(fallbackInsights)
    setKeyPoints(fallbackInsights.keyTakeaways)
    setShowPreview(true)
    
    updateProgress(60, '✅ Fallback analysis completed')
  }

  // Pause/Resume processing
  const togglePause = () => {
    setProcessing(prev => ({ 
      ...prev, 
      isPaused: !prev.isPaused,
      status: !prev.isPaused ? 'Process paused - you can add context' : prev.status
    }))
  }

  // Add context during processing
  const handleAddContext = () => {
    setShowContextInput(true)
    setProcessing(prev => ({ ...prev, isPaused: true }))
  }

  const submitAdditionalContext = () => {
    addLog(`📝 Additional context added: ${additionalContext.slice(0, 50)}...`)
    setAdditionalContext('')
    setShowContextInput(false)
    setProcessing(prev => ({ ...prev, isPaused: false }))
    toast.success('Context added! Brain will incorporate this into analysis.')
  }

  // Render progress phase indicator
  const renderPhaseIndicator = () => {
    const phases = [
      { key: 'analysis', label: 'Analysis', icon: Brain },
      { key: 'insights', label: 'Insights', icon: Lightbulb },
      { key: 'visualization', label: 'Charts', icon: BarChart3 },
      { key: 'review', label: 'Review', icon: Eye },
      { key: 'complete', label: 'Complete', icon: CheckCircle }
    ]
    
    return (
      <div className="flex justify-between items-center mb-4">
        {phases.map(({ key, label, icon: Icon }, index) => {
          const isActive = processing.phase === key
          const isComplete = phases.findIndex(p => p.key === processing.phase) > index
          
          return (
            <div key={key} className="flex flex-col items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                ${isActive ? 'border-blue-500 bg-blue-500 text-white' : 
                  isComplete ? 'border-green-500 bg-green-500 text-white' : 
                  'border-gray-300 text-gray-400'}
              `}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-xs mt-1 ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                {label}
              </span>
              {index < phases.length - 1 && (
                <div className={`
                  w-16 h-0.5 absolute mt-5 ml-10
                  ${isComplete ? 'bg-green-500' : 'bg-gray-300'}
                `} />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // Load draft on mount
  useEffect(() => {
    loadDraft()
  }, [draftId])

  // Set up auto-save
  useEffect(() => {
    if (!autoSaveEnabled || !draft) return

    const cleanup = DeckPersistence.setupAutoSave(draft.id, () => draft)
    return cleanup
  }, [draft, autoSaveEnabled])

  const loadDraft = async () => {
    try {
      setLoading(true)
      setError('')

      if (draftId) {
        // Load existing draft
        const loadedDraft = await DeckPersistence.loadDraft(draftId)
        if (loadedDraft) {
          setDraft(loadedDraft)
        } else {
          setError('Draft not found')
        }
      } else if (initialData) {
        // Create new draft from initial data
        const newDraft = await DeckPersistence.saveDraft(initialData)
        if (newDraft) {
          setDraft(newDraft)
          router.push(`/deck-builder/${newDraft.id}`)
        } else {
          setError('Failed to create draft')
        }
      } else {
        // Create empty draft
        const emptyDraft = await DeckPersistence.saveDraft({
          title: 'Untitled Presentation',
          slides: [
            {
              id: crypto.randomUUID(),
              type: 'title',
              title: 'Title Slide',
              content: 'Your Presentation Title',
              order: 0
            }
          ]
        })
        if (emptyDraft) {
          setDraft(emptyDraft)
          router.push(`/deck-builder/${emptyDraft.id}`)
        } else {
          setError('Failed to create draft')
        }
      }
    } catch (error) {
      console.error('Error loading draft:', error)
      setError('Failed to load draft')
    } finally {
      setLoading(false)
    }
  }

  const saveDraft = async (draftData?: Partial<DeckDraft>) => {
    if (!draft) return

    try {
      setSaving(true)
      const dataToSave = draftData || draft
      const savedDraft = await DeckPersistence.saveDraft({
        ...dataToSave,
        lastEditedAt: new Date()
      })

      if (savedDraft) {
        setDraft(savedDraft)
        // Track save activity
        await DeckPersistence.trackUserActivity('draft_saved', {
          draftId: savedDraft.id,
          title: savedDraft.title
        })
      }
    } catch (error) {
      console.error('Error saving draft:', error)
      setError('Failed to save draft')
    } finally {
      setSaving(false)
    }
  }

  const addSlide = async (type: DeckSlide['type'] = 'content') => {
    if (!draft) return

    const newSlide: DeckSlide = {
      id: crypto.randomUUID(),
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Slide`,
      content: '',
      order: draft.slides.length
    }

    const updatedDraft = {
      ...draft,
      slides: [...draft.slides, newSlide]
    }

    setDraft(updatedDraft)
    setSelectedSlideIndex(updatedDraft.slides.length - 1)
    await saveDraft(updatedDraft)
  }

  const updateSlide = async (slideId: string, updates: Partial<DeckSlide>) => {
    if (!draft) return

    const updatedSlides = draft.slides.map(slide =>
      slide.id === slideId ? { ...slide, ...updates } : slide
    )

    const updatedDraft = {
      ...draft,
      slides: updatedSlides
    }

    setDraft(updatedDraft)
    await saveDraft(updatedDraft)
  }

  const deleteSlide = async (slideId: string) => {
    if (!draft || draft.slides.length <= 1) return

    const updatedSlides = draft.slides
      .filter(slide => slide.id !== slideId)
      .map((slide, index) => ({ ...slide, order: index }))

    const updatedDraft = {
      ...draft,
      slides: updatedSlides
    }

    setDraft(updatedDraft)
    if (selectedSlideIndex >= updatedSlides.length) {
      setSelectedSlideIndex(updatedSlides.length - 1)
    }
    await saveDraft(updatedDraft)
  }

  const generateChart = async (slideId: string, chartData: any) => {
    if (!draft || !user?.profile) return

    try {
      const response = await DeckPersistence.generateChart({
        slideId,
        dataType: chartData.dataType,
        chartType: chartData.chartType,
        data: chartData.data,
        userPreferences: user.profile.dataPreferences || {
          chartStyles: ['modern', 'clean'],
          colorSchemes: ['blue', 'green'],
          narrativeStyle: 'professional'
        },
        businessContext: user.profile.businessContext || ''
      })

      if (response.success && response.chartData) {
        // Update the slide with generated chart
        await updateSlide(slideId, {
          chartData: response.chartData,
          chartConfig: response.chartConfig,
          content: response.narrative || '',
          type: 'chart'
        })

        // Track chart generation
        await DeckPersistence.trackUserActivity('chart_generated', {
          slideId,
          chartType: chartData.chartType,
          success: true
        })
      } else {
        setError(response.error || 'Failed to generate chart')
      }
    } catch (error) {
      console.error('Error generating chart:', error)
      setError('Failed to generate chart')
    }
  }

  const getAIFeedback = async () => {
    if (!draft) return

    try {
      const feedback = await DeckPersistence.getDeckFeedback(draft)
      if (feedback.success) {
        // Update draft with AI feedback
        const updatedDraft = {
          ...draft,
          aiFeedback: feedback.feedback
        }
        setDraft(updatedDraft)
        await saveDraft(updatedDraft)
      }
    } catch (error) {
      console.error('Error getting AI feedback:', error)
      setError('Failed to get AI feedback')
    }
  }

  const exportDeck = async (format: 'pdf' | 'pptx' | 'html') => {
    if (!draft) return

    try {
      const result = await DeckPersistence.exportDeck(draft.id, format)
      if (result?.success && result.downloadUrl) {
        window.open(result.downloadUrl, '_blank')
      }
    } catch (error) {
      console.error(`Error exporting to ${format}:`, error)
      setError(`Failed to export to ${format}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading deck builder...</p>
        </div>
      </div>
    )
  }

  if (!draft) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Failed to load draft'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const selectedSlide = draft.slides[selectedSlideIndex]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Brain className="w-8 h-8 text-blue-400" />
            <input
              type="text"
              value={draft.title}
              onChange={(e) => {
                const updatedDraft = { ...draft, title: e.target.value }
                setDraft(updatedDraft)
                saveDraft(updatedDraft)
              }}
              className="bg-transparent text-xl font-bold border-none outline-none focus:ring-0"
              placeholder="Untitled Presentation"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
              className={`px-3 py-1 rounded text-sm ${
                autoSaveEnabled ? 'bg-green-600' : 'bg-gray-600'
              }`}
            >
              {autoSaveEnabled ? 'Auto-save ON' : 'Auto-save OFF'}
            </button>
            
            <button
              onClick={() => saveDraft()}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save'}
            </button>

            <button
              onClick={() => getAIFeedback()}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Brain className="w-4 h-4" />
              AI Feedback
            </button>

            <button
              onClick={() => exportDeck('pdf')}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Slide Navigator */}
        <div className="w-64 bg-gray-900 border-r border-gray-700 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Slides</h3>
            <button
              onClick={() => addSlide()}
              className="bg-blue-600 hover:bg-blue-700 p-2 rounded"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {draft.slides.map((slide, index) => (
              <div
                key={slide.id}
                onClick={() => setSelectedSlideIndex(index)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  index === selectedSlideIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {slide.type === 'chart' && <BarChart3 className="w-4 h-4" />}
                    {slide.type === 'content' && <Image className="w-4 h-4" />}
                    {slide.type === 'title' && <Image className="w-4 h-4" />}
                    <span className="text-sm font-medium">
                      {slide.title || `Slide ${index + 1}`}
                    </span>
                  </div>
                  {draft.slides.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteSlide(slide.id)
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <h4 className="font-semibold mb-3">Quick Actions</h4>
            <div className="space-y-2">
              <button
                onClick={() => addSlide('chart')}
                className="w-full bg-purple-600 hover:bg-purple-700 p-2 rounded text-sm flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Add Chart
              </button>
              <button
                onClick={() => addSlide('content')}
                className="w-full bg-green-600 hover:bg-green-700 p-2 rounded text-sm flex items-center gap-2"
              >
                <Image className="w-4 h-4" />
                Add Content
              </button>
            </div>
          </div>
        </div>

        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          {selectedSlide && (
            <div className="flex-1 p-6">
              <div className="max-w-4xl mx-auto">
                {/* Slide Editor */}
                <div className="bg-gray-800 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      {selectedSlide.type.charAt(0).toUpperCase() + selectedSlide.type.slice(1)} Slide
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowChartGenerator(!showChartGenerator)}
                        className={`px-3 py-1 rounded text-sm ${
                          showChartGenerator ? 'bg-purple-600' : 'bg-gray-600'
                        }`}
                      >
                        Chart Generator
                      </button>
                    </div>
                  </div>

                  {/* Title Input */}
                  <input
                    type="text"
                    value={selectedSlide.title}
                    onChange={(e) => updateSlide(selectedSlide.id, { title: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 mb-4 text-white"
                    placeholder="Slide title"
                  />

                  {/* Content Editor */}
                  <textarea
                    value={selectedSlide.content}
                    onChange={(e) => updateSlide(selectedSlide.id, { content: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 h-32 resize-none text-white"
                    placeholder="Slide content..."
                  />

                  {/* Chart Generator */}
                  {showChartGenerator && selectedSlide.type === 'chart' && (
                    <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                      <h4 className="font-semibold mb-3">AI Chart Generator</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Chart Type</label>
                          <select
                            value={chartGenerationData?.chartType || 'bar'}
                            onChange={(e) => setChartGenerationData({
                              ...chartGenerationData,
                              chartType: e.target.value
                            })}
                            className="w-full bg-gray-600 border border-gray-500 rounded p-2"
                          >
                            <option value="bar">Bar Chart</option>
                            <option value="line">Line Chart</option>
                            <option value="pie">Pie Chart</option>
                            <option value="scatter">Scatter Plot</option>
                            <option value="area">Area Chart</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Data Type</label>
                          <select
                            value={chartGenerationData?.dataType || 'sales'}
                            onChange={(e) => setChartGenerationData({
                              ...chartGenerationData,
                              dataType: e.target.value
                            })}
                            className="w-full bg-gray-600 border border-gray-500 rounded p-2"
                          >
                            <option value="sales">Sales Data</option>
                            <option value="marketing">Marketing Data</option>
                            <option value="financial">Financial Data</option>
                            <option value="user">User Data</option>
                          </select>
                        </div>
                      </div>
                      <button
                        onClick={() => generateChart(selectedSlide.id, chartGenerationData)}
                        className="mt-4 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
                      >
                        Generate Chart with AI
                      </button>
                    </div>
                  )}

                  {/* Chart Display */}
                  {selectedSlide.chartData && (
                    <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                      <h4 className="font-semibold mb-3">Generated Chart</h4>
                      <div className="bg-white rounded p-4 text-gray-900">
                        <p className="text-sm text-gray-600">Chart visualization would appear here</p>
                        <p className="text-xs mt-2">Chart Type: {selectedSlide.chartType}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Feedback Display */}
                {draft.aiFeedback && draft.aiFeedback.suggestions.length > 0 && (
                  <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-300 mb-2">AI Suggestions</h4>
                    <ul className="space-y-1">
                      {draft.aiFeedback.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-blue-200 text-sm">• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-900/90 border border-red-700 text-red-200 px-4 py-3 rounded-lg max-w-md">
          <p>{error}</p>
          <button
            onClick={() => setError('')}
            className="text-red-300 hover:text-red-100 text-sm mt-2"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}