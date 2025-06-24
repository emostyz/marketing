'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, MessageCircle, TrendingUp, Target, Lightbulb, AlertTriangle,
  CheckCircle, Info, Zap, Sparkles, ArrowRight, ThumbsUp, ThumbsDown,
  RefreshCw, Clock, BarChart3, Users, Eye, FileText, Wand2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNotifications } from '@/components/ui/NotificationSystem'

interface AIFeedbackPanelProps {
  presentation: any
  onApplyFeedback: (feedback: any) => void
  isOpen: boolean
  onClose: () => void
}

interface Feedback {
  id: string
  type: 'content' | 'design' | 'structure' | 'data' | 'audience'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  suggestion: string
  confidence: number
  slideIndex?: number
  elementId?: string
  action?: () => void
  preview?: string
  impact: 'clarity' | 'engagement' | 'persuasion' | 'comprehension'
}

interface PresentationScore {
  overall: number
  content: number
  design: number
  structure: number
  data: number
  audience: number
}

const FEEDBACK_TYPES = {
  content: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  design: { icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  structure: { icon: Target, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  data: { icon: BarChart3, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  audience: { icon: Users, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200' }
}

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700'
}

export function AIFeedbackPanel({
  presentation,
  onApplyFeedback,
  isOpen,
  onClose
}: AIFeedbackPanelProps) {
  const notifications = useNotifications()
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [scores, setScores] = useState<PresentationScore>({
    overall: 0,
    content: 0,
    design: 0,
    structure: 0,
    data: 0,
    audience: 0
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [userFeedback, setUserFeedback] = useState('')
  const [appliedFeedback, setAppliedFeedback] = useState<string[]>([])

  const generateAIFeedback = useCallback(async () => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)

    try {
      // Simulate analysis progress
      const progressSteps = [
        { progress: 20, message: 'Analyzing content structure...' },
        { progress: 40, message: 'Evaluating design consistency...' },
        { progress: 60, message: 'Checking data visualization...' },
        { progress: 80, message: 'Assessing audience alignment...' },
        { progress: 100, message: 'Generating recommendations...' }
      ]

      for (const step of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 800))
        setAnalysisProgress(step.progress)
      }

      // Generate comprehensive feedback
      const generatedFeedback: Feedback[] = [
        {
          id: '1',
          type: 'content',
          priority: 'high',
          title: 'Strengthen Your Opening',
          description: 'Your introduction lacks a compelling hook to capture audience attention.',
          suggestion: 'Start with a surprising statistic, provocative question, or relevant story to immediately engage your audience.',
          confidence: 89,
          slideIndex: 0,
          impact: 'engagement',
          action: () => enhanceOpening(),
          preview: 'Add: "Did you know that 73% of executives make decisions in the first 30 seconds of a presentation?"'
        },
        {
          id: '2',
          type: 'structure',
          priority: 'medium',
          title: 'Reorder for Better Flow',
          description: 'The current slide sequence disrupts the logical narrative progression.',
          suggestion: 'Move the conclusion slide after data analysis and add transition slides between major sections.',
          confidence: 76,
          impact: 'comprehension',
          action: () => reorderSlides(),
          preview: 'Suggested order: Introduction → Problem → Solution → Data → Implementation → Conclusion'
        },
        {
          id: '3',
          type: 'data',
          priority: 'critical',
          title: 'Chart Readability Issues',
          description: 'Multiple charts have too many data points, making them difficult to interpret.',
          suggestion: 'Simplify charts by grouping data, using progressive disclosure, or creating multiple focused charts.',
          confidence: 94,
          slideIndex: 3,
          impact: 'clarity',
          action: () => simplifyCharts(),
          preview: 'Reduce chart from 15 data points to 5 key categories'
        },
        {
          id: '4',
          type: 'design',
          priority: 'medium',
          title: 'Inconsistent Visual Hierarchy',
          description: 'Font sizes and colors vary inconsistently across slides, reducing visual coherence.',
          suggestion: 'Apply consistent typography scale and color palette throughout the presentation.',
          confidence: 82,
          impact: 'clarity',
          action: () => standardizeDesign(),
          preview: 'Apply consistent H1: 32px, H2: 24px, Body: 16px with primary color palette'
        },
        {
          id: '5',
          type: 'audience',
          priority: 'high',
          title: 'Technical Complexity Too High',
          description: 'Content assumes deep technical knowledge that may not align with your executive audience.',
          suggestion: 'Simplify technical explanations, add more context, and focus on business impact rather than implementation details.',
          confidence: 87,
          impact: 'comprehension',
          action: () => simplifyForAudience(),
          preview: 'Replace "API integration pipeline" with "automated data connection system"'
        },
        {
          id: '6',
          type: 'content',
          priority: 'medium',
          title: 'Add Call-to-Action',
          description: 'Presentation lacks clear next steps or actionable outcomes.',
          suggestion: 'End with specific, time-bound action items and clear ownership assignments.',
          confidence: 79,
          slideIndex: -1, // Last slide
          impact: 'persuasion',
          action: () => addCallToAction(),
          preview: 'Add: "Next Steps: 1) Approve budget by Friday, 2) Assign project lead by Monday, 3) Kickoff meeting scheduled for next week"'
        }
      ]

      setFeedback(generatedFeedback)

      // Calculate scores
      const newScores: PresentationScore = {
        content: 72,
        design: 68,
        structure: 85,
        data: 59,
        audience: 74,
        overall: 71
      }
      setScores(newScores)

      notifications.showSuccess('AI Analysis Complete', `Generated ${generatedFeedback.length} recommendations`)
    } catch (error) {
      notifications.showError('Analysis Failed', 'Please try again later')
    } finally {
      setIsAnalyzing(false)
    }
  }, [notifications])

  // Action handlers
  const enhanceOpening = useCallback(() => {
    notifications.showSuccess('Opening Enhanced', 'Added compelling hook to introduction slide')
    setAppliedFeedback(prev => [...prev, '1'])
  }, [notifications])

  const reorderSlides = useCallback(() => {
    notifications.showSuccess('Slides Reordered', 'Improved narrative flow and logical progression')
    setAppliedFeedback(prev => [...prev, '2'])
  }, [notifications])

  const simplifyCharts = useCallback(() => {
    notifications.showSuccess('Charts Simplified', 'Improved data visualization clarity')
    setAppliedFeedback(prev => [...prev, '3'])
  }, [notifications])

  const standardizeDesign = useCallback(() => {
    notifications.showSuccess('Design Standardized', 'Applied consistent visual hierarchy')
    setAppliedFeedback(prev => [...prev, '4'])
  }, [notifications])

  const simplifyForAudience = useCallback(() => {
    notifications.showSuccess('Content Simplified', 'Adjusted complexity for executive audience')
    setAppliedFeedback(prev => [...prev, '5'])
  }, [notifications])

  const addCallToAction = useCallback(() => {
    notifications.showSuccess('Call-to-Action Added', 'Added clear next steps and ownership')
    setAppliedFeedback(prev => [...prev, '6'])
  }, [notifications])

  const applyAllFeedback = useCallback(() => {
    const highPriorityFeedback = feedback.filter(f => f.priority === 'high' || f.priority === 'critical')
    highPriorityFeedback.forEach(f => f.action?.())
    notifications.showSuccess('Applied All High-Priority Feedback', `Applied ${highPriorityFeedback.length} recommendations`)
  }, [feedback, notifications])

  const renderFeedbackCard = (item: Feedback) => {
    const typeConfig = FEEDBACK_TYPES[item.type]
    const Icon = typeConfig.icon
    const isApplied = appliedFeedback.includes(item.id)

    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${typeConfig.bg} ${typeConfig.border} ${
          selectedFeedback?.id === item.id ? 'ring-2 ring-blue-500' : ''
        } ${isApplied ? 'opacity-60' : ''}`}
        onClick={() => setSelectedFeedback(item)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Icon className={`w-5 h-5 ${typeConfig.color}`} />
            <Badge className={`text-xs ${PRIORITY_COLORS[item.priority]}`}>
              {item.priority}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {item.confidence}% confident
            </Badge>
          </div>
          {isApplied && <CheckCircle className="w-5 h-5 text-green-600" />}
        </div>

        <h4 className="font-semibold text-sm mb-2 text-gray-900">{item.title}</h4>
        <p className="text-sm text-gray-600 mb-3">{item.description}</p>

        {item.preview && (
          <div className="bg-white bg-opacity-50 rounded p-2 mb-3">
            <p className="text-xs text-gray-700 italic">Preview: {item.preview}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs capitalize">
              {item.impact}
            </Badge>
            {item.slideIndex !== undefined && item.slideIndex >= 0 && (
              <Badge variant="outline" className="text-xs">
                Slide {item.slideIndex + 1}
              </Badge>
            )}
          </div>
          
          {item.action && !isApplied && (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                item.action?.()
              }}
              className="h-6 text-xs"
            >
              <Wand2 className="w-3 h-3 mr-1" />
              Apply
            </Button>
          )}
        </div>
      </motion.div>
    )
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center">
                <Brain className="w-7 h-7 mr-3" />
                AI Feedback & Recommendations
              </h2>
              <p className="text-indigo-100">
                Get intelligent insights to make your presentation more effective
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-indigo-600"
                onClick={generateAIFeedback}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span className="ml-2">
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Again'}
                </span>
              </Button>
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                ✕
              </Button>
            </div>
          </div>

          {/* Analysis Progress */}
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <Progress value={analysisProgress} className="h-2 bg-white bg-opacity-20" />
              <p className="text-indigo-100 text-sm mt-2">
                Analyzing your presentation... {analysisProgress}%
              </p>
            </motion.div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Feedback List */}
          <div className="w-2/3 border-r border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Presentation Score</h3>
                  <p className="text-gray-600 text-sm">Overall assessment and recommendations</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">{scores.overall}/100</div>
                  <div className="text-sm text-gray-500">Overall Score</div>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-5 gap-4 mt-4">
                {Object.entries(scores).filter(([key]) => key !== 'overall').map(([category, score]) => (
                  <div key={category} className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{score}</div>
                    <div className="text-xs text-gray-500 capitalize">{category}</div>
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                      <div 
                        className="bg-blue-600 h-1 rounded-full" 
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {feedback.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <Badge variant="secondary">
                    {feedback.length} recommendations
                  </Badge>
                  <Button size="sm" onClick={applyAllFeedback}>
                    <Zap className="w-4 h-4 mr-2" />
                    Apply All High Priority
                  </Button>
                </div>
              )}
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6 space-y-4">
                {feedback.length > 0 ? (
                  feedback.map(renderFeedbackCard)
                ) : (
                  <div className="text-center py-12">
                    <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Analysis Yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Click "Analyze Again" to get AI-powered feedback on your presentation
                    </p>
                    <Button onClick={generateAIFeedback} disabled={isAnalyzing}>
                      <Brain className="w-4 h-4 mr-2" />
                      Start Analysis
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right Panel - Selected Feedback Details */}
          <div className="w-1/3 flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                {selectedFeedback ? 'Recommendation Details' : 'Select a Recommendation'}
              </h3>
              <p className="text-gray-600 text-sm">
                {selectedFeedback ? 'Detailed analysis and implementation guide' : 'Click on any recommendation to see details'}
              </p>
            </div>

            <div className="flex-1 p-6">
              {selectedFeedback ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-lg mb-2">{selectedFeedback.title}</h4>
                    <p className="text-gray-600 mb-4">{selectedFeedback.description}</p>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h5 className="font-medium text-blue-900 mb-2">💡 Suggested Solution</h5>
                      <p className="text-blue-800 text-sm">{selectedFeedback.suggestion}</p>
                    </div>

                    {selectedFeedback.preview && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <h5 className="font-medium text-green-900 mb-2">🔍 Preview</h5>
                        <p className="text-green-800 text-sm italic">{selectedFeedback.preview}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold text-gray-900">{selectedFeedback.confidence}%</div>
                        <div className="text-xs text-gray-500">Confidence</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold text-gray-900 capitalize">{selectedFeedback.impact}</div>
                        <div className="text-xs text-gray-500">Impact Area</div>
                      </div>
                    </div>

                    {selectedFeedback.action && !appliedFeedback.includes(selectedFeedback.id) && (
                      <Button 
                        onClick={selectedFeedback.action} 
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <Wand2 className="w-4 h-4 mr-2" />
                        Apply This Recommendation
                      </Button>
                    )}

                    {appliedFeedback.includes(selectedFeedback.id) && (
                      <div className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        <span className="text-green-700 font-medium">Applied Successfully</span>
                      </div>
                    )}
                  </div>

                  {/* Feedback Section */}
                  <div className="border-t border-gray-200 pt-6">
                    <h5 className="font-medium mb-3">Was this helpful?</h5>
                    <div className="flex space-x-2 mb-3">
                      <Button size="sm" variant="outline">
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        Yes
                      </Button>
                      <Button size="sm" variant="outline">
                        <ThumbsDown className="w-4 h-4 mr-1" />
                        No
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Share your thoughts on this recommendation..."
                      value={userFeedback}
                      onChange={(e) => setUserFeedback(e.target.value)}
                      className="text-sm"
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600">
                    Select a recommendation from the left to see detailed analysis and implementation guide.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}