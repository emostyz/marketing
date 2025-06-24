'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { 
  Brain, Loader2, Plus, RefreshCw, Eye, Pause, Play,
  CheckCircle, AlertCircle, MessageSquare, Lightbulb,
  BarChart3, Target, Zap, Settings, TrendingUp, TrendingDown,
  ArrowRight, ArrowLeft, Users, Target as TargetIcon
} from 'lucide-react'
import { EnhancedBrain, UserContext, AnalysisPhase, EnhancedInsight, NarrativeArc } from '@/lib/openai/enhanced-brain'
import { EnhancedWorldClassChart } from '@/components/charts/EnhancedWorldClassChart'

interface EnhancedInteractiveDeckBuilderProps {
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
  currentPhase: AnalysisPhase | null
  insights: EnhancedInsight[]
  narrativeArc: NarrativeArc | null
  userInputRequired: boolean
  userPrompt: string
  iteration: number
}

export function EnhancedInteractiveDeckBuilder({ 
  initialData, 
  userRequirements, 
  userGoals,
  onComplete,
  onSave
}: EnhancedInteractiveDeckBuilderProps) {
  const [processing, setProcessing] = useState<ProcessingState>({
    isActive: false,
    progress: 0,
    status: 'Ready to start enhanced analysis',
    currentPhase: null,
    insights: [],
    narrativeArc: null,
    userInputRequired: false,
    userPrompt: '',
    iteration: 0
  })

  const [userContext, setUserContext] = useState<UserContext>({
    businessGoals: userGoals,
    targetAudience: 'Executive team',
    keyQuestions: [],
    constraints: [],
    preferences: {
      chartStyle: 'interactive',
      narrativeStyle: 'executive',
      focusAreas: []
    }
  })

  const [userFeedback, setUserFeedback] = useState('')
  const [showContextSetup, setShowContextSetup] = useState(true)
  const [processingLogs, setProcessingLogs] = useState<string[]>([])

  // Add processing log
  const addLog = useCallback((message: string) => {
    setProcessingLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }, [])

  // Progress callback for the enhanced brain
  const updateProgress = useCallback((progress: number, status: string) => {
    setProcessing(prev => ({
      ...prev,
      progress,
      status
    }))
    addLog(status)
  }, [addLog])

  // Start the enhanced analysis
  const startEnhancedAnalysis = async () => {
    try {
      setProcessing(prev => ({ ...prev, isActive: true }))
      addLog('🚀 Starting enhanced recursive analysis...')
      
      const enhancedBrain = new EnhancedBrain(initialData, userContext)
      
      const result = await enhancedBrain.startAnalysis(updateProgress)
      
      setProcessing(prev => ({
        ...prev,
        insights: result.insights,
        narrativeArc: result.narrativeArc,
        isActive: false,
        progress: 100,
        status: 'Enhanced analysis complete!'
      }))
      
      addLog('✅ Enhanced analysis completed successfully')
      toast.success('Enhanced analysis complete!')
      
    } catch (error) {
      console.error('Enhanced analysis error:', error)
      toast.error('Error in enhanced analysis. Please try again.')
      addLog('❌ Enhanced analysis failed')
      setProcessing(prev => ({ ...prev, isActive: false }))
    }
  }

  // Handle user feedback
  const handleUserFeedback = async () => {
    if (!userFeedback.trim()) return
    
    try {
      setProcessing(prev => ({ ...prev, userInputRequired: false }))
      addLog(`💬 User feedback: ${userFeedback}`)
      
      // Update user context with feedback
      setUserContext(prev => ({
        ...prev,
        businessGoals: prev.businessGoals + `\n\nUser feedback: ${userFeedback}`
      }))
      
      // Continue analysis with updated context
      await startEnhancedAnalysis()
      
      setUserFeedback('')
    } catch (error) {
      console.error('Error processing user feedback:', error)
      toast.error('Error processing feedback')
    }
  }

  // Handle context setup completion
  const handleContextSetup = (context: Partial<UserContext>) => {
    setUserContext(prev => ({ ...prev, ...context }))
    setShowContextSetup(false)
    startEnhancedAnalysis()
  }

  // Generate slides from enhanced insights
  const generateSlidesFromInsights = (): any[] => {
    const slides: any[] = []
    
    if (!processing.narrativeArc) return slides

    // Title slide
    slides.push({
      id: 'title-slide',
      type: 'title',
      title: processing.narrativeArc.hook,
      content: {
        title: processing.narrativeArc.hook,
        subtitle: processing.narrativeArc.context,
        description: `Generated from ${initialData.length} data points with enhanced AI analysis`,
        bulletPoints: [],
        narrative: [],
        insights: []
      }
    })

    // Rising action slides
    processing.narrativeArc.risingAction.forEach((insight, index) => {
      slides.push({
        id: `rising-${index}`,
        type: 'chart',
        title: insight.title,
        content: {
          title: insight.title,
          subtitle: insight.description,
          description: insight.description,
          bulletPoints: insight.drivers,
          narrative: [insight.why],
          insights: insight.recommendations
        },
        chartType: insight.visualizationType,
        data: insight.chartConfig.data,
        categories: insight.chartConfig.metrics,
        index: insight.chartConfig.dimensions[0],
        tremorConfig: {
          colors: ['blue', 'emerald', 'violet'],
          height: 72
        }
      })
    })

    // Climax slide
    const climaxInsight = processing.narrativeArc.climax
    slides.push({
      id: 'climax',
      type: 'chart',
      title: climaxInsight.title,
      content: {
        title: climaxInsight.title,
        subtitle: climaxInsight.description,
        description: climaxInsight.description,
        bulletPoints: climaxInsight.drivers,
        narrative: [climaxInsight.why],
        insights: climaxInsight.recommendations
      },
      chartType: climaxInsight.visualizationType,
      data: climaxInsight.chartConfig.data,
      categories: climaxInsight.chartConfig.metrics,
      index: climaxInsight.chartConfig.dimensions[0],
      tremorConfig: {
        colors: ['red', 'amber', 'orange'],
        height: 80
      }
    })

    // Falling action slides
    processing.narrativeArc.fallingAction.forEach((insight, index) => {
      slides.push({
        id: `falling-${index}`,
        type: 'chart',
        title: insight.title,
        content: {
          title: insight.title,
          subtitle: insight.description,
          description: insight.description,
          bulletPoints: insight.drivers,
          narrative: [insight.why],
          insights: insight.recommendations
        },
        chartType: insight.visualizationType,
        data: insight.chartConfig.data,
        categories: insight.chartConfig.metrics,
        index: insight.chartConfig.dimensions[0],
        tremorConfig: {
          colors: ['green', 'emerald', 'teal'],
          height: 72
        }
      })
    })

    // Resolution slide
    slides.push({
      id: 'resolution',
      type: 'content',
      title: 'Resolution & Next Steps',
      content: {
        title: 'Resolution & Next Steps',
        subtitle: processing.narrativeArc.resolution,
        body: processing.narrativeArc.callToAction,
        bulletPoints: processing.insights
          .filter(i => i.impact === 'high')
          .flatMap(i => i.recommendations)
          .slice(0, 5),
        narrative: [processing.narrativeArc.resolution],
        insights: [processing.narrativeArc.callToAction]
      }
    })

    return slides
  }

  // Complete the deck building
  const completeDeckBuilding = () => {
    const slides = generateSlidesFromInsights()
    
    const finalDeck = {
      insights: processing.insights,
      narrativeArc: processing.narrativeArc,
      slides,
      metadata: {
        createdAt: new Date(),
        userRequirements,
        userGoals,
        dataPoints: initialData.length,
        confidence: processing.insights.reduce((sum, i) => sum + i.confidence, 0) / processing.insights.length,
        novelty: processing.insights.reduce((sum, i) => sum + i.novelty, 0) / processing.insights.length,
        title: `Enhanced AI Analysis - ${new Date().toLocaleDateString()}`,
        iteration: processing.iteration
      }
    }
    
    console.log('🎯 Final enhanced deck:', finalDeck)
    
    if (onComplete) {
      onComplete(finalDeck)
    }
  }

  // Context Setup Component
  const ContextSetup = () => (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <TargetIcon className="w-5 h-5 text-blue-500" />
        <h2 className="text-xl font-semibold text-white">Enhanced Analysis Setup</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="text-gray-300 text-sm mb-2 block">Target Audience</label>
          <select
            value={userContext.targetAudience}
            onChange={(e) => setUserContext(prev => ({ ...prev, targetAudience: e.target.value }))}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
          >
            <option value="Executive team">Executive team</option>
            <option value="Board of directors">Board of directors</option>
            <option value="Investors">Investors</option>
            <option value="Stakeholders">Stakeholders</option>
            <option value="Team members">Team members</option>
          </select>
        </div>

        <div>
          <label className="text-gray-300 text-sm mb-2 block">Key Questions</label>
          <textarea
            placeholder="What specific questions do you want answered? (one per line)"
            value={userContext.keyQuestions.join('\n')}
            onChange={(e) => setUserContext(prev => ({ 
              ...prev, 
              keyQuestions: e.target.value.split('\n').filter(q => q.trim()) 
            }))}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 h-20 resize-none"
          />
        </div>

        <div>
          <label className="text-gray-300 text-sm mb-2 block">Constraints</label>
          <textarea
            placeholder="What constraints or limitations should we consider?"
            value={userContext.constraints.join('\n')}
            onChange={(e) => setUserContext(prev => ({ 
              ...prev, 
              constraints: e.target.value.split('\n').filter(c => c.trim()) 
            }))}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 h-20 resize-none"
          />
        </div>

        <div>
          <label className="text-gray-300 text-sm mb-2 block">Focus Areas</label>
          <textarea
            placeholder="What specific areas should we focus on?"
            value={userContext.preferences.focusAreas.join('\n')}
            onChange={(e) => setUserContext(prev => ({ 
              ...prev, 
              preferences: {
                ...prev.preferences,
                focusAreas: e.target.value.split('\n').filter(f => f.trim())
              }
            }))}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 h-20 resize-none"
          />
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={() => handleContextSetup(userContext)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Brain className="w-4 h-4 mr-2" />
            Start Enhanced Analysis
          </Button>
        </div>
      </div>
    </Card>
  )

  // User Input Modal
  const UserInputModal = () => (
    <AnimatePresence>
      {processing.userInputRequired && (
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
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-white">Brain Needs Your Input</h3>
              </div>
              
              <p className="text-gray-400 text-sm mb-4">
                {processing.userPrompt}
              </p>
              
              <textarea
                placeholder="Provide your feedback or input..."
                value={userFeedback}
                onChange={(e) => setUserFeedback(e.target.value)}
                className="w-full h-24 p-3 bg-gray-800 text-white rounded border border-gray-600 resize-none mb-4"
              />
              
              <div className="flex gap-3">
                <Button 
                  onClick={handleUserFeedback}
                  disabled={!userFeedback.trim()}
                  className="flex-1"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Continue Analysis
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setProcessing(prev => ({ ...prev, userInputRequired: false }))}
                >
                  Skip
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <div className="space-y-6">
      {/* Context Setup */}
      {showContextSetup && <ContextSetup />}

      {/* Processing State */}
      {processing.isActive && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-6 h-6 text-blue-500 animate-pulse" />
            <h2 className="text-xl font-semibold text-white">Enhanced Brain Analysis</h2>
            <div className="ml-auto text-sm text-gray-400">
              Iteration {processing.iteration + 1}
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
          
          <p className="text-sm text-gray-300 mb-4">{processing.status}</p>
          
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

      {/* Enhanced Insights */}
      <AnimatePresence>
        {processing.insights.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                Enhanced Insights ({processing.insights.length})
              </h2>
              <div className="text-sm text-gray-400">
                Novelty: {Math.round(processing.insights.reduce((sum, i) => sum + i.novelty, 0) / processing.insights.length)}%
              </div>
            </div>
            
            <div className="space-y-4">
              {processing.insights.map((insight) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <EnhancedWorldClassChart 
                    insight={insight}
                    showInsights={true}
                    interactive={true}
                  />
                </motion.div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-emerald-900/20 rounded-lg border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300 font-medium">Enhanced Analysis Complete!</span>
              </div>
              <p className="text-sm text-gray-300 mb-4">
                The enhanced brain has discovered {processing.insights.length} insights with an average novelty score of {Math.round(processing.insights.reduce((sum, i) => sum + i.novelty, 0) / processing.insights.length)}%.
              </p>
              <div className="flex gap-3">
                <Button 
                  onClick={completeDeckBuilding}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Generate Enhanced Deck
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setProcessing(prev => ({ ...prev, iteration: prev.iteration + 1, isActive: true }))}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refine Further
                </Button>
              </div>
            </div>
          </Card>
        )}
      </AnimatePresence>

      {/* User Input Modal */}
      <UserInputModal />
    </div>
  )
} 