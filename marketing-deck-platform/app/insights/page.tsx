'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import PublicNavigation from '@/components/navigation/PublicNavigation'
import PublicFooter from '@/components/navigation/PublicFooter'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ChevronDown, ChevronUp, FileText, BarChart3, Lightbulb, ArrowRight, Check, X, Edit3, Plus, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { ThinkingAnimation } from '@/components/ui/thinking-animation'
import EnhancedProgressTracker from '@/components/ui/enhanced-progress-tracker'
import LoadingButton from '@/components/ui/loading-button'

interface DataInsight {
  id: string
  type: 'trend' | 'anomaly' | 'correlation' | 'opportunity' | 'risk'
  title: string
  description: string
  confidence: number
  impact: 'critical' | 'high' | 'medium' | 'low'
  evidence: any[]
  recommendations: string[]
  businessImplication: string
}

interface SlideStructure {
  id: string
  title: string
  description: string
  type: 'intro' | 'key_insight' | 'data_analysis' | 'chart' | 'recommendation' | 'conclusion'
  order: number
  content: {
    bullet_points?: string[]
    chart_type?: string
    data_focus?: string
  }
}

interface PipelineStage {
  name: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  progress: number
}

export default function InsightsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [currentStage, setCurrentStage] = useState<'insights' | 'structure' | 'editing' | 'generating'>('insights')
  const [insights, setInsights] = useState<DataInsight[]>([])
  const [feedback, setFeedback] = useState<Record<string, 'thumbsup' | 'thumbsdown'>>({})
  const [proposedStructure, setProposedStructure] = useState<SlideStructure[]>([])
  const [editedStructure, setEditedStructure] = useState<SlideStructure[]>([])
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([
    { name: 'Data Analysis', description: 'Analyzing uploaded data for insights', status: 'pending', progress: 0 },
    { name: 'Structure Generation', description: 'Creating presentation outline', status: 'pending', progress: 0 },
    { name: 'Content Generation', description: 'Generating slide content and charts', status: 'pending', progress: 0 },
    { name: 'Quality Assurance', description: 'Validating and optimizing content', status: 'pending', progress: 0 },
    { name: 'Deck Assembly', description: 'Finalizing presentation', status: 'pending', progress: 0 }
  ])
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set())
  const [presentationId, setPresentationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentThinkingStage, setCurrentThinkingStage] = useState<string>('')
  const [currentThinkingMessage, setCurrentThinkingMessage] = useState<string>('')
  const [thinkingStartTime, setThinkingStartTime] = useState<Date | null>(null)
  const [progressSessionId, setProgressSessionId] = useState<string | null>(null)

  // Auto-start insights analysis when page loads
  useEffect(() => {
    if (user && !insights.length && currentStage === 'insights') {
      startInsightsAnalysis()
    }
  }, [user])

  const startInsightsAnalysis = async () => {
    if (!user) {
      toast.error('Please sign in to continue')
      return
    }

    setIsLoading(true)
    setThinkingStartTime(new Date())
    setCurrentThinkingStage('Data Analysis')
    setCurrentThinkingMessage('AI is analyzing your data to discover meaningful insights...')
    updateStageStatus('Data Analysis', 'in_progress', 25)

    try {
      // Step 1: Create progress session
      const sessionResponse = await fetch('/api/ai/insights/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          analysisType: 'insights_generation'
        })
      })

      if (!sessionResponse.ok) {
        throw new Error('Failed to start insights session')
      }

      const { sessionId } = await sessionResponse.json()
      setProgressSessionId(sessionId)

      // Step 2: Get data from localStorage and call Ultimate Brain API
      const storedData = localStorage.getItem('uploadedData')
      const csvRows = storedData ? JSON.parse(storedData) : []
      
      if (!csvRows || csvRows.length === 0) {
        throw new Error('No data found. Please upload data first.')
      }

      const response = await fetch('/api/ai/ultimate-brain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          userId: user.id,
          data: csvRows,
          context: {
            analysisType: 'insights_generation',
            sessionId
          },
          userFeedback: {},
          learningObjectives: ['Generate strategic business insights', 'Identify key trends and patterns', 'Provide actionable recommendations']
        })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze data')
      }

      const analysisResult = await response.json()
      updateStageStatus('Data Analysis', 'completed', 100)

      // Set insights from analysis - check both locations
      const insights = analysisResult.analysis?.strategicInsights || analysisResult.insights || []
      
      if (insights.length > 0) {
        setInsights(insights)
        toast.success('Insights generated! Please review and provide feedback.')
      } else {
        console.error('No insights found in Ultimate Brain response:', analysisResult)
        throw new Error('No insights generated from analysis')
      }
    } catch (error) {
      console.error('Insights analysis error:', error)
      updateStageStatus('Data Analysis', 'failed', 0)
      toast.error('Failed to generate insights. Please try again.')
    } finally {
      setIsLoading(false)
      setCurrentThinkingStage('')
      setCurrentThinkingMessage('')
      setThinkingStartTime(null)
    }
  }

  const submitFeedback = async () => {
    if (!user || Object.keys(feedback).length === 0) {
      toast.error('Please provide feedback on at least one insight')
      return
    }

    setIsLoading(true)
    setThinkingStartTime(new Date())
    setCurrentThinkingStage('Structure Generation')
    setCurrentThinkingMessage('AI is crafting a compelling presentation structure based on your feedback...')
    updateStageStatus('Structure Generation', 'in_progress', 25)

    try {
      // Step 2: Submit feedback and generate structure proposal
      const response = await fetch('/api/ai/generate-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: user.id,
          chatContinuity: true,
          insights: insights,
          feedback: feedback,
          requestType: 'structure_proposal'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate structure')
      }

      const structureResult = await response.json()
      updateStageStatus('Structure Generation', 'completed', 100)

      if (structureResult.slides) {
        setProposedStructure(structureResult.slides)
        setEditedStructure([...structureResult.slides])
        setCurrentStage('structure')
        toast.success('Presentation structure generated! Review and customize as needed.')
      }
    } catch (error) {
      console.error('Structure generation error:', error)
      updateStageStatus('Structure Generation', 'failed', 0)
      toast.error('Failed to generate structure. Please try again.')
    } finally {
      setIsLoading(false)
      setCurrentThinkingStage('')
      setCurrentThinkingMessage('')
      setThinkingStartTime(null)
    }
  }

  const generateDeck = async () => {
    if (!user || editedStructure.length === 0) {
      toast.error('Please finalize the presentation structure first')
      return
    }

    setIsLoading(true)
    setCurrentStage('generating')
    setThinkingStartTime(new Date())
    setCurrentThinkingStage('Deck Generation')
    setCurrentThinkingMessage('AI is creating your presentation and analyzing data with Python...')

    try {
      // Get uploaded data for deck generation
      const storedData = localStorage.getItem('uploadedData')
      const csvRows = storedData ? JSON.parse(storedData) : []
      
      if (!csvRows || csvRows.length === 0) {
        throw new Error('No data found. Please upload data first.')
      }

      // Create a dataset record first (required for deck generation)
      const datasetResponse = await fetch('/api/datasets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fileName: 'insights-dataset.json',
          fileType: 'application/json',
          fileSize: JSON.stringify(csvRows).length,
          folder: 'AI Generated',
          projectName: 'Insights Analysis',
          data: csvRows
        })
      })

      if (!datasetResponse.ok) {
        throw new Error('Failed to create dataset')
      }

      const { dataset } = await datasetResponse.json()

      // Use the main deck generation API with proper context
      setCurrentThinkingMessage('Generating your complete presentation with AI...')
      updateStageStatus('Content Generation', 'in_progress', 50)

      const deckResponse = await fetch('/api/deck/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          datasetId: dataset.id,
          context: {
            title: 'AI Generated Presentation',
            structure: editedStructure,
            insights: insights,
            presentationGoal: 'strategic insights presentation',
            targetAudience: 'executives',
            industry: 'business analysis'
          }
        })
      })

      if (!deckResponse.ok) {
        throw new Error('Failed to generate deck')
      }

      const deckResult = await deckResponse.json()
      setPresentationId(deckResult.deckId)

      updateStageStatus('Content Generation', 'completed', 100)
      updateStageStatus('Quality Assurance', 'completed', 100) 
      updateStageStatus('Deck Assembly', 'completed', 100)

      toast.success('Presentation generated successfully!')

      // Navigate to deck builder
      setTimeout(() => {
        setIsLoading(false)
        setCurrentThinkingStage('')
        setCurrentThinkingMessage('')
        setThinkingStartTime(null)
        router.push(`/editor/${deckResult.deckId}?generated=true`)
      }, 2000)

    } catch (error) {
      console.error('Deck generation error:', error)
      toast.error('Failed to generate deck. Please try again.')
      setIsLoading(false)
      setCurrentThinkingStage('')
      setCurrentThinkingMessage('')
      setThinkingStartTime(null)
    }
  }

  const executeSequentialPipeline = async (presentationId: string) => {
    try {
      // Step 3: Data Analysis → Python Processing → Interpretation
      setCurrentThinkingMessage('Python is crunching numbers and analyzing your data patterns...')
      updateStageStatus('Content Generation', 'in_progress', 20)
      
      const analysisResponse = await fetch('/api/ai/run-python-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: user.id,
          chatContinuity: true,
          presentationId,
          structure: editedStructure,
          phase: 'data_processing'
        })
      })

      if (!analysisResponse.ok) throw new Error('Python data analysis failed')
      const pythonResults = await analysisResponse.json()

      // Step 4: OpenAI interprets Python results
      setCurrentThinkingMessage('AI is interpreting the Python analysis results...')
      updateStageStatus('Content Generation', 'in_progress', 40)
      
      const interpretationResponse = await fetch('/api/ai/interpret-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: user.id,
          chatContinuity: true,
          presentationId,
          pythonResults,
          structure: editedStructure
        })
      })

      if (!interpretationResponse.ok) throw new Error('Analysis interpretation failed')
      const interpretationResult = await interpretationResponse.json()

      // Step 5: Generate Charts with Tremor
      setCurrentThinkingMessage('Creating beautiful charts and visualizations...')
      updateStageStatus('Content Generation', 'in_progress', 70)
      
      const chartsResponse = await fetch('/api/ai/generate-charts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: user.id,
          chatContinuity: true,
          presentationId,
          analysisResults: interpretationResult,
          structure: editedStructure,
          framework: 'tremor'
        })
      })

      if (!chartsResponse.ok) throw new Error('Chart generation failed')
      const chartsResult = await chartsResponse.json()

      updateStageStatus('Content Generation', 'completed', 100)

      // Step 6: Quality Assurance with 1-2 rounds of edits
      setCurrentThinkingMessage('AI is reviewing the presentation for quality and making improvements...')
      updateStageStatus('Quality Assurance', 'in_progress', 30)
      
      const qaResponse = await fetch('/api/ai/qa-deck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: user.id,
          chatContinuity: true,
          presentationId,
          contentData: chartsResult,
          structure: editedStructure,
          enableRevisions: true,
          maxRevisions: 2
        })
      })

      if (!qaResponse.ok) throw new Error('QA validation failed')
      const qaResult = await qaResponse.json()

      updateStageStatus('Quality Assurance', 'completed', 100)

      // Step 7: Final Assembly and Upload to Deck Builder
      setCurrentThinkingMessage('Assembling your final presentation and making it editable...')
      updateStageStatus('Deck Assembly', 'in_progress', 75)
      
      const uploadResponse = await fetch(`/api/presentations/${presentationId}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: user.id,
          finalData: qaResult,
          structure: editedStructure,
          makeEditable: true
        })
      })

      if (!uploadResponse.ok) throw new Error('Final upload failed')

      updateStageStatus('Deck Assembly', 'completed', 100)
      setCurrentThinkingMessage('Success! Your presentation is ready.')
      
      toast.success('Presentation generated successfully!')

      // Navigate to deck builder
      setTimeout(() => {
        setIsLoading(false)
        setCurrentThinkingStage('')
        setCurrentThinkingMessage('')
        setThinkingStartTime(null)
        router.push(`/deck-builder/${presentationId}?generated=true`)
      }, 2000)

    } catch (error) {
      console.error('Pipeline execution error:', error)
      toast.error(`Pipeline failed: ${error.message}`)
      // Mark current stage as failed
      const failedStageIndex = pipelineStages.findIndex(stage => stage.status === 'in_progress')
      if (failedStageIndex !== -1) {
        updateStageStatus(pipelineStages[failedStageIndex].name, 'failed', 0)
      }
      setIsLoading(false)
      setCurrentThinkingStage('')
      setCurrentThinkingMessage('')
      setThinkingStartTime(null)
    }
  }

  const updateStageStatus = (stageName: string, status: PipelineStage['status'], progress: number) => {
    setPipelineStages(prev => 
      prev.map(stage => 
        stage.name === stageName 
          ? { ...stage, status, progress }
          : stage
      )
    )
  }

  const toggleInsightExpansion = (insightId: string) => {
    setExpandedInsights(prev => {
      const newSet = new Set(prev)
      if (newSet.has(insightId)) {
        newSet.delete(insightId)
      } else {
        newSet.add(insightId)
      }
      return newSet
    })
  }

  const handleFeedback = async (insightId: string, type: 'thumbsup' | 'thumbsdown') => {
    // Update local state immediately
    setFeedback(prev => ({ ...prev, [insightId]: type }))
    
    // Send feedback to API immediately
    try {
      await fetch('/api/ai/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          userId: user?.id,
          insightId,
          vote: type
        })
      })
      console.log(`📝 Feedback sent: ${insightId} → ${type}`)
    } catch (error) {
      console.error('Failed to send feedback:', error)
      toast.error('Failed to save feedback')
    }
  }

  const updateSlideTitle = (slideId: string, title: string) => {
    setEditedStructure(prev => 
      prev.map(slide => 
        slide.id === slideId ? { ...slide, title } : slide
      )
    )
  }

  const updateSlideDescription = (slideId: string, description: string) => {
    setEditedStructure(prev => 
      prev.map(slide => 
        slide.id === slideId ? { ...slide, description } : slide
      )
    )
  }

  const reorderSlide = (slideId: string, direction: 'up' | 'down') => {
    const currentIndex = editedStructure.findIndex(slide => slide.id === slideId)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= editedStructure.length) return

    const newStructure = [...editedStructure]
    const [movedSlide] = newStructure.splice(currentIndex, 1)
    newStructure.splice(newIndex, 0, movedSlide)
    
    // Update order numbers
    const reorderedStructure = newStructure.map((slide, index) => ({
      ...slide,
      order: index + 1
    }))
    
    setEditedStructure(reorderedStructure)
  }

  const deleteSlide = (slideId: string) => {
    const newStructure = editedStructure
      .filter(slide => slide.id !== slideId)
      .map((slide, index) => ({ ...slide, order: index + 1 }))
    setEditedStructure(newStructure)
  }

  const addSlide = () => {
    const newSlide: SlideStructure = {
      id: `slide-${Date.now()}`,
      title: 'New Slide',
      description: 'Enter slide description',
      type: 'key_insight',
      order: editedStructure.length + 1,
      content: { bullet_points: [] }
    }
    setEditedStructure(prev => [...prev, newSlide])
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return <BarChart3 className="w-5 h-5" />
      case 'opportunity': return <Lightbulb className="w-5 h-5" />
      default: return <FileText className="w-5 h-5" />
    }
  }

  const getStageIcon = (status: PipelineStage['status']) => {
    switch (status) {
      case 'completed': return <Check className="w-5 h-5 text-green-500" />
      case 'failed': return <X className="w-5 h-5 text-red-500" />
      case 'in_progress': return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      default: return <div className="w-5 h-5 rounded-full bg-gray-400" />
    }
  }

  if (!user) {
    return (
      <>
        <PublicNavigation />
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-3xl font-bold mb-4">Sign In Required</h1>
            <p className="text-gray-400">Please sign in to access AI insights generation.</p>
          </div>
        </div>
        <PublicFooter />
      </>
    )
  }

  return (
    <>
      <PublicNavigation />
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-white mb-4">AI Insights & Structure</h1>
            <p className="text-lg text-gray-400">Generate insights from your data and create the perfect presentation structure.</p>
          </div>

          {/* Pipeline Progress */}
          <Card className="bg-gray-900/80 border-gray-800 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-6 h-6" />
                Pipeline Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pipelineStages.map((stage, index) => (
                  <div key={stage.name} className="flex items-center gap-4">
                    {getStageIcon(stage.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-medium">{stage.name}</span>
                        <span className="text-gray-400 text-sm">{stage.progress}%</span>
                      </div>
                      <div className="text-gray-400 text-sm mb-2">{stage.description}</div>
                      <Progress value={stage.progress} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Progress Tracking */}
          {isLoading && progressSessionId && (
            <div className="mb-8">
              <EnhancedProgressTracker 
                sessionId={progressSessionId}
                onComplete={(data) => {
                  setIsLoading(false)
                  setCurrentThinkingStage('')
                  setCurrentThinkingMessage('')
                  setThinkingStartTime(null)
                  if (data?.insights) {
                    setInsights(data.insights)
                    toast.success('Process completed successfully!')
                  }
                }}
                onError={(error) => {
                  setIsLoading(false)
                  setCurrentThinkingStage('')
                  setCurrentThinkingMessage('')
                  setThinkingStartTime(null)
                  toast.error(error)
                }}
                autoStart={true}
              />
            </div>
          )}

          {/* Fallback Thinking Animation for legacy flows */}
          {isLoading && currentThinkingStage && !progressSessionId && (
            <div className="mb-8">
              <ThinkingAnimation 
                stage={currentThinkingStage}
                message={currentThinkingMessage}
                estimatedTime={currentThinkingStage === 'Data Analysis' ? 45 : currentThinkingStage === 'Structure Generation' ? 30 : 120}
                startTime={thinkingStartTime || undefined}
              />
            </div>
          )}

          {/* Insights Section */}
          {currentStage === 'insights' && (
            <Card className="bg-gray-900/80 border-gray-800 mb-8">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lightbulb className="w-6 h-6" />
                  Generated Insights
                  {isLoading && <Loader2 className="w-5 h-5 animate-spin ml-2" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {insights.length === 0 ? (
                  <div className="text-center py-8">
                    <Lightbulb className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    {isLoading ? (
                      <p className="text-gray-400">Analyzing your data to generate insights...</p>
                    ) : (
                      <p className="text-gray-400">No insights generated yet. Upload data to get started.</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {insights.map((insight) => (
                      <div key={insight.id} className="border border-gray-700 rounded-lg p-4">
                        <div 
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => toggleInsightExpansion(insight.id)}
                        >
                          <div className="flex items-center gap-3">
                            {getInsightIcon(insight.type)}
                            <div>
                              <h3 className="text-white font-semibold">{insight.title}</h3>
                              <p className="text-gray-400 text-sm">
                                {insight.impact.toUpperCase()} impact • {Math.round(insight.confidence * 100)}% confidence
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant={feedback[insight.id] === 'thumbsup' ? 'default' : 'outline'}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleFeedback(insight.id, 'thumbsup')
                              }}
                            >
                              👍
                            </Button>
                            <Button
                              size="sm"
                              variant={feedback[insight.id] === 'thumbsdown' ? 'default' : 'outline'}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleFeedback(insight.id, 'thumbsdown')
                              }}
                            >
                              👎
                            </Button>
                            {expandedInsights.has(insight.id) ? 
                              <ChevronUp className="w-5 h-5 text-gray-400" /> : 
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            }
                          </div>
                        </div>
                        
                        {expandedInsights.has(insight.id) && (
                          <div className="mt-4 pt-4 border-t border-gray-700">
                            <p className="text-gray-300 mb-3">{insight.description}</p>
                            <div className="mb-3">
                              <h4 className="text-white font-medium mb-2">Business Implication:</h4>
                              <p className="text-gray-300">{insight.businessImplication}</p>
                            </div>
                            {insight.recommendations.length > 0 && (
                              <div>
                                <h4 className="text-white font-medium mb-2">Recommendations:</h4>
                                <ul className="text-gray-300 space-y-1">
                                  {insight.recommendations.map((rec, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                      {rec}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {insights.length > 0 && (
                      <div className="flex justify-center pt-4">
                        <LoadingButton 
                          onClick={submitFeedback}
                          disabled={Object.keys(feedback).length === 0}
                          loading={isLoading}
                          loadingText="Generating Structure..."
                          className="bg-blue-600 hover:bg-blue-700"
                          showArrow={true}
                        >
                          Generate Presentation Structure
                        </LoadingButton>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Structure Section */}
          {(currentStage === 'structure' || currentStage === 'editing') && (
            <Card className="bg-gray-900/80 border-gray-800 mb-8">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-6 h-6" />
                    Presentation Structure
                  </div>
                  <Button onClick={addSlide} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Slide
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {editedStructure.map((slide, index) => (
                    <div key={slide.id} className="border border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 mr-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-blue-400 font-mono text-sm">#{slide.order}</span>
                            <input
                              type="text"
                              value={slide.title}
                              onChange={(e) => updateSlideTitle(slide.id, e.target.value)}
                              className="bg-transparent text-white font-semibold text-lg border-none outline-none flex-1"
                            />
                          </div>
                          <textarea
                            value={slide.description}
                            onChange={(e) => updateSlideDescription(slide.id, e.target.value)}
                            className="bg-transparent text-gray-300 w-full border-none outline-none resize-none"
                            rows={2}
                          />
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                              {slide.type.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => reorderSlide(slide.id, 'up')}
                            disabled={index === 0}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => reorderSlide(slide.id, 'down')}
                            disabled={index === editedStructure.length - 1}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteSlide(slide.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-center pt-4">
                    <LoadingButton 
                      onClick={generateDeck}
                      disabled={editedStructure.length === 0}
                      loading={isLoading}
                      loadingText="Generating Deck..."
                      className="bg-green-600 hover:bg-green-700"
                      showArrow={true}
                    >
                      Generate Final Deck
                    </LoadingButton>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
      <PublicFooter />
    </>
  )
}