'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, ThumbsUp, ThumbsDown, Eye, Sparkles, Brain, FileText, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'react-hot-toast'

interface Insight {
  id: string
  title: string
  description: string
  businessImplication: string
  confidence: number
  approved: boolean | null // null = pending, true = approved, false = rejected
}

interface DeckStructure {
  title: string
  description: string
  purpose: string
  slides: {
    id: string
    title: string
    purpose: string
    type: string
  }[]
}

interface RealTimeAnalysisFlowProps {
  datasetId: string
  context: any
  onComplete: (deckId: string) => void
  onBack: () => void
}

export const RealTimeAnalysisFlow: React.FC<RealTimeAnalysisFlowProps> = ({ 
  datasetId, 
  context, 
  onComplete, 
  onBack 
}) => {
  const [step, setStep] = useState<'analyzing' | 'insights' | 'structure' | 'generating'>('analyzing')
  const [insights, setInsights] = useState<Insight[]>([])
  const [deckStructure, setDeckStructure] = useState<DeckStructure | null>(null)
  const [progress, setProgress] = useState(0)
  const [currentAnalysisStep, setCurrentAnalysisStep] = useState('')
  const [generatedDeckId, setGeneratedDeckId] = useState<string | null>(null)

  // Start real-time analysis
  useEffect(() => {
    startRealTimeAnalysis()
  }, [])

  const startRealTimeAnalysis = async () => {
    try {
      // Step 1: Start analysis and get real-time insights
      setCurrentAnalysisStep('Analyzing your data patterns...')
      setProgress(10)

      // Simulate real-time insight generation
      const analysisSteps = [
        { step: 'Analyzing data patterns...', progress: 20 },
        { step: 'Identifying key trends...', progress: 35 },
        { step: 'Generating business insights...', progress: 50 },
        { step: 'Creating narrative structure...', progress: 65 },
        { step: 'Preparing insights for review...', progress: 80 }
      ]

      for (const { step: stepName, progress: stepProgress } of analysisSteps) {
        setCurrentAnalysisStep(stepName)
        setProgress(stepProgress)
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Add insights progressively
        if (stepProgress === 35) {
          addInsight({
            id: '1',
            title: 'Revenue Growth Acceleration',
            description: 'Revenue shows 34% quarter-over-quarter growth, indicating strong market traction',
            businessImplication: 'Suggests successful product-market fit and scalable business model',
            confidence: 92,
            approved: null
          })
        }
        
        if (stepProgress === 50) {
          addInsight({
            id: '2',
            title: 'Customer Acquisition Efficiency',
            description: 'Customer acquisition cost decreased by 28% while retention increased to 87%',
            businessImplication: 'Marketing optimization efforts are paying off significantly',
            confidence: 88,
            approved: null
          })
          
          addInsight({
            id: '3',
            title: 'Market Expansion Opportunity',
            description: 'Geographic data reveals untapped potential in three key markets',
            businessImplication: 'Strategic expansion could drive 60% additional revenue growth',
            confidence: 85,
            approved: null
          })
        }
      }

      setProgress(100)
      setCurrentAnalysisStep('Analysis complete!')
      setTimeout(() => setStep('insights'), 1000)

    } catch (error) {
      console.error('Analysis failed:', error)
      toast.error('Analysis failed. Please try again.')
    }
  }

  const addInsight = (insight: Insight) => {
    setInsights(prev => [...prev, insight])
    toast.success(`New insight: ${insight.title}`, { 
      icon: '💡',
      duration: 3000 
    })
  }

  const handleInsightApproval = (insightId: string, approved: boolean) => {
    setInsights(prev => prev.map(insight => 
      insight.id === insightId ? { ...insight, approved } : insight
    ))
    
    const insight = insights.find(i => i.id === insightId)
    if (insight) {
      toast.success(
        approved 
          ? `✅ "${insight.title}" added to deck` 
          : `❌ "${insight.title}" excluded from deck`,
        { duration: 2000 }
      )
    }
  }

  const proceedToStructureApproval = () => {
    const approvedInsights = insights.filter(i => i.approved === true)
    
    if (approvedInsights.length === 0) {
      toast.error('Please approve at least one insight to continue.')
      return
    }

    // Generate deck structure based on approved insights
    const structure: DeckStructure = {
      title: `${context.businessContext || 'Data Analysis'} Insights Report`,
      description: `Comprehensive analysis revealing ${approvedInsights.length} key business insights`,
      purpose: 'Present data-driven recommendations to drive strategic decision making',
      slides: [
        {
          id: 'title',
          title: 'Executive Summary',
          purpose: 'Overview of key findings and recommendations',
          type: 'title'
        },
        ...approvedInsights.map((insight, index) => ({
          id: `insight-${insight.id}`,
          title: insight.title,
          purpose: insight.businessImplication,
          type: 'insight'
        })),
        {
          id: 'recommendations',
          title: 'Strategic Recommendations',
          purpose: 'Actionable next steps based on data insights',
          type: 'recommendations'
        },
        {
          id: 'next-steps',
          title: 'Implementation Plan',
          purpose: 'Timeline and approach for implementing recommendations',
          type: 'action-plan'
        }
      ]
    }

    setDeckStructure(structure)
    setStep('structure')
  }

  const generateFinalDeck = async () => {
    if (!deckStructure) return

    setStep('generating')
    setProgress(0)
    setCurrentAnalysisStep('Generating final presentation...')

    try {
      // Call the actual deck generation API
      const response = await fetch('/api/deck/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          datasetId,
          context: {
            ...context,
            approvedInsights: insights.filter(i => i.approved === true),
            deckStructure
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate deck')
      }

      const result = await response.json()
      
      if (result.success && result.deckId) {
        setGeneratedDeckId(result.deckId)
        setProgress(100)
        setCurrentAnalysisStep('Deck generation complete!')
        
        toast.success(`🎉 Deck generated with ${result.slideCount} slides!`)
        
        setTimeout(() => {
          onComplete(result.deckId)
        }, 2000)
      } else {
        throw new Error(result.error || 'Deck generation failed')
      }

    } catch (error) {
      console.error('Deck generation failed:', error)
      toast.error('Failed to generate deck. Please try again.')
      setStep('structure') // Go back to structure approval
    }
  }

  const renderAnalyzingStep = () => (
    <Card className="p-8">
      <div className="text-center">
        <div className="mb-6">
          <Brain className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-white mb-2">Analyzing Your Data</h2>
          <p className="text-gray-400">{currentAnalysisStep}</p>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-3 mb-6">
          <motion.div 
            className="bg-blue-500 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        <div className="text-sm text-gray-400">
          Progress: {progress}%
        </div>
      </div>
      
      {/* Show insights as they come in */}
      {insights.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-white mb-4">Insights Found:</h3>
          <div className="space-y-3">
            {insights.map((insight) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 p-4 rounded-lg border border-gray-700"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  <h4 className="font-medium text-white">{insight.title}</h4>
                  <span className="text-xs text-gray-400">({insight.confidence}% confidence)</span>
                </div>
                <p className="text-sm text-gray-300">{insight.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )

  const renderInsightsStep = () => (
    <Card className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Review & Approve Insights</h2>
        <p className="text-gray-400">
          Approve the insights you want to include in your presentation. 
          Use 👍 to include or 👎 to exclude each insight.
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {insights.map((insight) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-lg border-2 transition-all ${
              insight.approved === true 
                ? 'border-green-500 bg-green-900/20' 
                : insight.approved === false 
                  ? 'border-red-500 bg-red-900/20'
                  : 'border-gray-600 bg-gray-800'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">{insight.title}</h3>
                <p className="text-gray-300 mb-2">{insight.description}</p>
                <p className="text-sm text-blue-400 mb-3">
                  <strong>Business Impact:</strong> {insight.businessImplication}
                </p>
                <div className="text-xs text-gray-400">
                  Confidence: {insight.confidence}%
                </div>
              </div>
              
              <div className="flex space-x-2 ml-4">
                <Button
                  size="sm"
                  variant={insight.approved === true ? "default" : "outline"}
                  onClick={() => handleInsightApproval(insight.id, true)}
                  className={insight.approved === true ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  <ThumbsUp className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={insight.approved === false ? "default" : "outline"}
                  onClick={() => handleInsightApproval(insight.id, false)}
                  className={insight.approved === false ? "bg-red-600 hover:bg-red-700" : ""}
                >
                  <ThumbsDown className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Upload
        </Button>
        <Button 
          onClick={proceedToStructureApproval}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={insights.filter(i => i.approved === true).length === 0}
        >
          Continue to Structure Review
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </Card>
  )

  const renderStructureStep = () => (
    <Card className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Approve Presentation Structure</h2>
        <p className="text-gray-400">
          Review the plain English structure and purpose of your presentation before we generate the final deck.
        </p>
      </div>

      {deckStructure && (
        <div className="space-y-6">
          {/* Presentation Overview */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-3">Presentation Overview</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-400">Title:</label>
                <p className="text-white">{deckStructure.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Description:</label>
                <p className="text-white">{deckStructure.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Purpose:</label>
                <p className="text-white">{deckStructure.purpose}</p>
              </div>
            </div>
          </div>

          {/* Slide Structure */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-4">Slide Structure ({deckStructure.slides.length} slides)</h3>
            <div className="space-y-3">
              {deckStructure.slides.map((slide, index) => (
                <div key={slide.id} className="flex items-start space-x-4 p-4 bg-gray-700 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{slide.title}</h4>
                    <p className="text-sm text-gray-400 mt-1">{slide.purpose}</p>
                  </div>
                  <div className="text-xs text-gray-500 capitalize">{slide.type}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-8">
        <Button onClick={() => setStep('insights')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Insights
        </Button>
        <Button 
          onClick={generateFinalDeck}
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Generate Presentation
        </Button>
      </div>
    </Card>
  )

  const renderGeneratingStep = () => (
    <Card className="p-8">
      <div className="text-center">
        <div className="mb-6">
          <FileText className="w-16 h-16 text-green-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold text-white mb-2">Generating Your Presentation</h2>
          <p className="text-gray-400">{currentAnalysisStep}</p>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-3 mb-6">
          <motion.div 
            className="bg-green-500 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        <div className="text-sm text-gray-400">
          Creating professional slides with charts and visualizations...
        </div>
      </div>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {step === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              {renderAnalyzingStep()}
            </motion.div>
          )}
          
          {step === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              {renderInsightsStep()}
            </motion.div>
          )}
          
          {step === 'structure' && (
            <motion.div
              key="structure"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              {renderStructureStep()}
            </motion.div>
          )}
          
          {step === 'generating' && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              {renderGeneratingStep()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}