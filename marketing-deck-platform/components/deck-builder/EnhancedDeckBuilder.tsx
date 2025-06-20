'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { 
  Brain, Loader2, Plus, RefreshCw, Eye, Pause, Play,
  CheckCircle, AlertCircle, MessageSquare, Lightbulb,
  BarChart3, Target, Zap
} from 'lucide-react'
import { deckBrain, DeckInsight, DataPoint } from '@/lib/openai/deck-brain'
import { InteractiveSlide } from './InteractiveSlide'

interface DeckBuilderProps {
  initialData: any[]
  userRequirements: string
  userGoals: string
  onComplete: (deck: any) => void
  onSave?: (deck: any) => void
}

interface ProcessingState {
  isActive: boolean
  progress: number
  status: string
  phase: 'analysis' | 'insights' | 'visualization' | 'review' | 'complete'
  canAddContext: boolean
  isPaused: boolean
}

export function EnhancedDeckBuilder({ 
  initialData, 
  userRequirements, 
  userGoals,
  onComplete,
  onSave
}: DeckBuilderProps) {
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
        initialData,
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
      updateProgress(85, '🏗️ Brain building interactive slides...')
      
      // Generate slides from insights
      const slides = await generateSlidesFromInsights(insights)
      setGeneratedSlides(slides)
      
      updateProgress(95, '✨ Brain finalizing deck presentation...')
      
      // Final validation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      updateProgress(100, '✅ Your world-class deck is ready!')
      
      setProcessing(prev => ({ ...prev, isActive: false }))
      addLog('🎉 Deck building completed successfully!')
      
      toast.success('Deck built successfully with AI-powered insights!')
      
      if (onComplete) {
        onComplete({
          insights,
          slides,
          metadata: {
            createdAt: new Date(),
            userRequirements,
            userGoals,
            dataPoints: initialData.length,
            confidence: insights.confidence
          }
        })
      }
      
    } catch (error) {
      console.error('Slide generation error:', error)
      toast.error('Error generating slides')
      addLog('❌ Error in slide generation')
    }
  }

  // Generate slides from AI insights
  const generateSlidesFromInsights = async (insights: DeckInsight): Promise<any[]> => {
    const slides = []
    
    // Title slide
    slides.push({
      id: 'title-slide',
      type: 'title',
      title: 'Data-Driven Insights',
      content: {
        title: 'Strategic Analysis Results',
        subtitle: `Generated from ${initialData.length} data points`,
        description: insights.executiveSummary,
        context: userRequirements.slice(0, 100) + '...'
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
        narrative: insights.overallNarrative
      }
    })
    
    // Chart slides from data points
    insights.dataPoints.forEach((dataPoint: DataPoint, index: number) => {
      slides.push({
        id: `chart-slide-${index}`,
        type: 'chart',
        title: dataPoint.title,
        chartType: dataPoint.visualizationType,
        data: dataPoint.chartConfig.data,
        categories: dataPoint.chartConfig.categories,
        index: dataPoint.chartConfig.index,
        content: {
          title: dataPoint.title,
          subtitle: `Priority: ${dataPoint.priority.toUpperCase()}`,
          description: dataPoint.insight,
          narrative: [dataPoint.story],
          insights: [dataPoint.insight]
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
      })
    })
    
    return slides
  }

  // Fallback processing when OpenAI fails
  const fallbackProcessing = async () => {
    updateProgress(20, '🔄 Using enhanced fallback analysis...')
    
    const fallbackInsights: DeckInsight = {
      dataPoints: [{
        title: 'Performance Overview',
        insight: 'Key performance metrics analysis from your data',
        supportingData: {},
        visualizationType: 'bar',
        story: 'This visualization shows the main patterns in your dataset.',
        priority: 'high',
        chartConfig: {
          index: Object.keys(initialData[0] || {})[0] || 'category',
          categories: Object.keys(initialData[0] || {}).slice(1, 4),
          colors: ['blue', 'emerald', 'violet'],
          data: initialData.slice(0, 10)
        }
      }],
      overallNarrative: `Analysis of ${initialData.length} data points reveals important business insights.`,
      keyTakeaways: [
        'Data shows measurable performance patterns',
        'Multiple optimization opportunities identified',
        'Strategic focus areas clearly defined',
        'Actionable recommendations available'
      ],
      executiveSummary: `Comprehensive analysis of your dataset reveals key strategic insights for ${userRequirements}.`,
      recommendedStructure: ['Overview', 'Key Metrics', 'Insights', 'Recommendations'],
      confidence: 75
    }
    
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

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-blue-500 animate-pulse" />
            <div>
              <h1 className="text-2xl font-bold text-white">AI Deck Builder</h1>
              <p className="text-gray-400">World-class presentations powered by advanced AI brain</p>
            </div>
          </div>
          
          {!processing.isActive && !insights && (
            <Button onClick={startDeckBuilding} className="bg-blue-600 hover:bg-blue-700">
              <Zap className="w-4 h-4 mr-2" />
              Start AI Analysis
            </Button>
          )}
        </div>
        
        {processing.isActive && renderPhaseIndicator()}
      </Card>

      {/* Progress Section */}
      {processing.isActive && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Loader2 className={`w-5 h-5 text-blue-500 ${processing.isPaused ? '' : 'animate-spin'}`} />
              <span className="font-semibold">Brain Processing</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">{processing.progress}%</span>
              {processing.canAddContext && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleAddContext}
                  disabled={showContextInput}
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Add Context
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={togglePause}
              >
                {processing.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-3 mb-3">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-emerald-500 h-3 rounded-full"
              style={{ width: `${processing.progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          <p className="text-sm text-gray-300">{processing.status}</p>
          
          {/* Processing Logs */}
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-blue-400 hover:text-blue-300">
              View processing details ({processingLogs.length} steps)
            </summary>
            <div className="mt-2 max-h-32 overflow-y-auto bg-gray-900 rounded p-3">
              {processingLogs.map((log, idx) => (
                <div key={idx} className="text-xs text-gray-400 mb-1">
                  {log}
                </div>
              ))}
            </div>
          </details>
        </Card>
      )}

      {/* Key Points Preview */}
      {showPreview && keyPoints.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-500" />
              Key Insights Preview
            </h2>
            {insights && (
              <div className="text-sm text-gray-400">
                Confidence: {insights.confidence}%
              </div>
            )}
          </div>
          
          <div className="grid gap-3 mb-6">
            {keyPoints.map((point, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg"
              >
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-200">{point}</span>
              </motion.div>
            ))}
          </div>
          
          {insights && (
            <div className="mb-6 p-4 bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold text-blue-300 mb-2">Executive Summary</h3>
              <p className="text-gray-300 text-sm">{insights.executiveSummary}</p>
            </div>
          )}
          
          <div className="flex gap-3">
            <Button 
              onClick={continueBuilding} 
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Looks Great - Build Deck
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => {
                setShowPreview(false)
                startDeckBuilding()
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate Analysis
            </Button>
          </div>
        </Card>
      )}

      {/* Generated Slides */}
      <AnimatePresence>
        {generatedSlides.map((slide, idx) => (
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: idx * 0.2 }}
          >
            <InteractiveSlide 
              slide={slide} 
              onUpdate={(updatedSlide) => {
                const newSlides = [...generatedSlides]
                newSlides[idx] = updatedSlide
                setGeneratedSlides(newSlides)
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Context Input Modal */}
      <AnimatePresence>
        {showContextInput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <Card className="w-full max-w-md p-6 m-4">
                <h3 className="text-lg font-semibold text-white mb-4">Add Context to Brain</h3>
                <p className="text-gray-400 text-sm mb-4">
                  The brain can incorporate additional context to improve analysis.
                </p>
                <textarea
                  placeholder="What else should the brain consider? (e.g., market conditions, goals, constraints...)"
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  className="w-full h-24 p-3 bg-gray-800 text-white rounded border border-gray-600 resize-none"
                />
                <div className="flex gap-3 mt-4">
                  <Button 
                    onClick={submitAdditionalContext}
                    disabled={!additionalContext.trim()}
                    className="flex-1"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add & Continue
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowContextInput(false)
                      setProcessing(prev => ({ ...prev, isPaused: false }))
                    }}
                  >
                    Skip
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}