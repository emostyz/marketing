'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card as UICard } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import {
  Upload, Brain, Palette, Settings, Eye, EyeOff, Download, Share,
  Play, Pause, SkipForward, SkipBack, RotateCcw, Save, Edit3,
  Plus, Minus, Target, Zap, Lightbulb, Sparkles, Wand2, CheckCircle,
  AlertCircle, Clock, Users, TrendingUp, BarChart3, PieChart,
  ChevronDown, ChevronUp, ArrowRight, ArrowLeft, Maximize, Minimize
} from 'lucide-react'

import { AdvancedTremorChartStudio } from '@/components/charts/AdvancedTremorChartStudio'
import { AdvancedThemeStudio, ThemeConfig } from '@/components/themes/AdvancedThemeStudio'
import { AIDeckArchitect, DeckContext, DeckStructure, SlideType } from '@/lib/openai/ai-deck-architect'
import { EnhancedBrain } from '@/lib/openai/enhanced-brain'

interface ProductionDeckBuilderProps {
  initialData?: any[]
  onComplete?: (deck: DeckStructure) => void
  className?: string
}

export function ProductionDeckBuilder({
  initialData = [],
  onComplete,
  className = ''
}: ProductionDeckBuilderProps) {
  const router = useRouter()
  
  // State management
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<any[]>(initialData)
  const [insights, setInsights] = useState<any[]>([])
  const [narrativeArc, setNarrativeArc] = useState<any>(null)
  const [deckStructure, setDeckStructure] = useState<DeckStructure | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showThemeStudio, setShowThemeStudio] = useState(false)
  const [showChartStudio, setShowChartStudio] = useState(false)
  const [selectedSlide, setSelectedSlide] = useState<SlideType | null>(null)
  const [deckContext, setDeckContext] = useState<DeckContext>({
    data: [],
    businessGoals: '',
    targetAudience: 'executive',
    keyQuestions: [],
    constraints: [],
    industry: '',
    presentationType: 'executive',
    timeLimit: 10,
    slideCount: 5,
    userPreferences: {
      chartStyle: 'minimal',
      narrativeStyle: 'executive',
      focusAreas: [],
      avoidTopics: []
    }
  })

  // Enhanced brain instance (will be initialized with actual data)
  const [enhancedBrain, setEnhancedBrain] = useState<EnhancedBrain | null>(null)

  // Step configurations
  const steps = [
    { id: 1, title: 'Data Upload', description: 'Upload your data files' },
    { id: 2, title: 'Context Setup', description: 'Define your presentation goals' },
    { id: 3, title: 'AI Analysis', description: 'AI analyzes your data and creates insights' },
    { id: 4, title: 'Deck Design', description: 'AI designs the optimal deck structure' },
    { id: 5, title: 'Customization', description: 'Customize theme and content' },
    { id: 6, title: 'Review & Export', description: 'Review and export your presentation' }
  ]

  // Handle data upload
  const handleDataUpload = useCallback((uploadedData: any[]) => {
    setData(uploadedData)
    setDeckContext(prev => ({ ...prev, data: uploadedData }))
    setCurrentStep(2)
    toast.success(`Uploaded ${uploadedData.length} data points`)
  }, [])

  // Handle context setup
  const handleContextUpdate = useCallback((context: Partial<DeckContext>) => {
    setDeckContext(prev => ({ ...prev, ...context }))
  }, [])

  // Generate insights and narrative
  const generateInsights = useCallback(async () => {
    if (!data.length) {
      toast.error('Please upload data first')
      return
    }

    setIsGenerating(true)
    try {
      console.log('🧠 Starting enhanced brain analysis...')
      
      if (!enhancedBrain) {
        console.error('Enhanced brain not initialized')
        return
      }
      
      const analysis = await enhancedBrain.startAnalysis((progress) => {
        console.log(`Analysis progress: ${progress}%`)
      })

      setInsights(analysis.insights)
      setNarrativeArc(analysis.narrativeArc)
      setCurrentStep(4)
      
      toast.success(`Generated ${analysis.insights.length} insights`)
      console.log('✅ Enhanced brain analysis completed')
    } catch (error) {
      console.error('❌ Enhanced brain analysis failed:', error)
      toast.error('Failed to analyze data. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }, [data, deckContext, enhancedBrain])

  // Generate complete deck
  const generateDeck = useCallback(async () => {
    if (!insights.length) {
      toast.error('Please generate insights first')
      return
    }

    setIsGenerating(true)
    try {
      console.log('🏗️ Starting AI deck architect...')
      
      const architect = new AIDeckArchitect(deckContext, insights, narrativeArc)
      const deck = await architect.designCompleteDeck()
      
      setDeckStructure(deck)
      setCurrentStep(5)
      
      toast.success(`Generated ${deck.slides.length} slides`)
      console.log('✅ AI deck architect completed')
    } catch (error) {
      console.error('❌ AI deck architect failed:', error)
      if (error instanceof Error && error.message.includes('inappropriate')) {
        toast.error('Content flagged as inappropriate. Please review your data and context.')
      } else {
        toast.error('Failed to generate deck. Please try again.')
      }
    } finally {
      setIsGenerating(false)
    }
  }, [deckContext, insights, narrativeArc])

  // Handle theme changes
  const handleThemeChange = useCallback((theme: ThemeConfig) => {
    if (deckStructure) {
      setDeckStructure(prev => prev ? {
        ...prev,
        theme: {
          name: theme.name,
          primaryColor: theme.primaryColor,
          secondaryColor: theme.secondaryColor,
          accentColor: theme.accentColor,
          backgroundColor: theme.backgroundColor,
          fontFamily: theme.fontFamily,
          fontSizes: theme.fontSizes
        }
      } : null)
    }
  }, [deckStructure])

  // Handle slide customization
  const handleSlideCustomization = useCallback(async (slideId: string, customizations: Partial<SlideType>) => {
    if (!deckStructure) return

    try {
      const architect = new AIDeckArchitect(deckContext, insights, narrativeArc)
      const updatedSlide = await architect.customizeSlide(slideId, customizations)
      
      setDeckStructure(prev => prev ? {
        ...prev,
        slides: prev.slides.map(slide => 
          slide.id === slideId ? updatedSlide : slide
        )
      } : null)
      
      toast.success('Slide customized successfully')
    } catch (error) {
      console.error('Slide customization failed:', error)
      toast.error('Failed to customize slide')
    }
  }, [deckContext, insights, narrativeArc, deckStructure])

  // Handle deck completion
  const handleDeckComplete = useCallback(async () => {
    if (!deckStructure) {
      toast.error('No deck to complete')
      return
    }

    try {
      // Save deck to database
      const response = await fetch('/api/presentations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: deckStructure.title,
          content: deckStructure,
          metadata: deckStructure.metadata
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('Deck saved successfully')
        onComplete?.(deckStructure)
        
        // Navigate to editor
        router.push(`/editor/${result.id}`)
      } else {
        throw new Error('Failed to save deck')
      }
    } catch (error) {
      console.error('Deck completion failed:', error)
      toast.error('Failed to save deck')
    }
  }, [deckStructure, onComplete, router])

  // Presentation controls
  const startPresentation = useCallback(() => {
    setIsPlaying(true)
    setCurrentSlide(0)
  }, [])

  const stopPresentation = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const nextSlide = useCallback(() => {
    if (deckStructure && currentSlide < deckStructure.slides.length - 1) {
      setCurrentSlide(prev => prev + 1)
    }
  }, [deckStructure, currentSlide])

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1)
    }
  }, [currentSlide])

  // Auto-advance presentation
  useEffect(() => {
    if (isPlaying && deckStructure) {
      const timer = setTimeout(() => {
        if (currentSlide < deckStructure.slides.length - 1) {
          nextSlide()
        } else {
          stopPresentation()
        }
      }, deckStructure.slides[currentSlide]?.metadata.timeEstimate * 1000 || 30000)

      return () => clearTimeout(timer)
    }
  }, [isPlaying, currentSlide, deckStructure, nextSlide, stopPresentation])

  // Current slide data
  const currentSlideData = useMemo(() => {
    if (!deckStructure || !deckStructure.slides[currentSlide]) return null
    return deckStructure.slides[currentSlide]
  }, [deckStructure, currentSlide])

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Production Deck Builder</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>Ready for 5k+ users</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowThemeStudio(!showThemeStudio)}
            >
              <Palette className="w-4 h-4 mr-1" />
              Theme
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowChartStudio(!showChartStudio)}
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              Charts
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowThemeStudio(!showThemeStudio)}
            >
              <Settings className="w-4 h-4 mr-1" />
              Settings
            </Button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mt-4">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep >= step.id
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-white border-gray-300 text-gray-500'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <div className="ml-3">
                  <div className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-400">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`ml-4 w-8 h-0.5 ${
                    currentStep > step.id ? 'bg-blue-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* Left Panel - Controls */}
        <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold">Data Upload</h3>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Drop your data files here</p>
                    <Button className="mt-2" size="sm">
                      Browse Files
                    </Button>
                  </div>
                  
                  {data.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        <span className="text-sm font-medium text-green-800">
                          {data.length} data points uploaded
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold">Context Setup</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Business Goals</label>
                    <textarea
                      value={deckContext.businessGoals}
                      onChange={(e) => handleContextUpdate({ businessGoals: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded"
                      rows={3}
                      placeholder="What are your main business objectives?"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Target Audience</label>
                    <select
                      value={deckContext.targetAudience}
                      onChange={(e) => handleContextUpdate({ targetAudience: e.target.value as any })}
                      className="w-full p-2 border border-gray-300 rounded"
                    >
                      <option value="executive">Executive</option>
                      <option value="investor">Investor</option>
                      <option value="stakeholder">Stakeholder</option>
                      <option value="team">Team</option>
                      <option value="client">Client</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Presentation Type</label>
                    <select
                      value={deckContext.presentationType}
                      onChange={(e) => handleContextUpdate({ presentationType: e.target.value as any })}
                      className="w-full p-2 border border-gray-300 rounded"
                    >
                      <option value="executive">Executive</option>
                      <option value="investor">Investor</option>
                      <option value="stakeholder">Stakeholder</option>
                      <option value="team">Team</option>
                      <option value="client">Client</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Time Limit (minutes)</label>
                    <input
                      type="number"
                      value={deckContext.timeLimit}
                      onChange={(e) => handleContextUpdate({ timeLimit: parseInt(e.target.value) })}
                      className="w-full p-2 border border-gray-300 rounded"
                      min="1"
                      max="60"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Industry</label>
                    <input
                      type="text"
                      value={deckContext.industry}
                      onChange={(e) => handleContextUpdate({ industry: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded"
                      placeholder="e.g., Technology, Healthcare, Finance"
                    />
                  </div>

                  <Button
                    onClick={() => setCurrentStep(3)}
                    disabled={!deckContext.businessGoals || !deckContext.industry}
                    className="w-full"
                  >
                    Continue to Analysis
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold">AI Analysis</h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Brain className="w-5 h-5 text-blue-500 mr-2" />
                      <span className="text-sm font-medium text-blue-800">
                        Enhanced Brain Analysis
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      AI is analyzing your data and creating insights...
                    </p>
                  </div>

                  {insights.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Generated Insights</h4>
                      {insights.slice(0, 3).map((insight, index) => (
                        <div key={index} className="bg-gray-50 rounded p-2">
                          <div className="text-xs font-medium">{insight.title}</div>
                          <div className="text-xs text-gray-600">{insight.description}</div>
                        </div>
                      ))}
                      {insights.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{insights.length - 3} more insights
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={generateInsights}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Analyzing...
                      </div>
                    ) : (
                      'Generate Insights'
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold">Deck Design</h3>
                <div className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Wand2 className="w-5 h-5 text-purple-500 mr-2" />
                      <span className="text-sm font-medium text-purple-800">
                        AI Deck Architect
                      </span>
                    </div>
                    <p className="text-xs text-purple-600 mt-1">
                      AI is designing your optimal deck structure...
                    </p>
                  </div>

                  {deckStructure && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Deck Structure</h4>
                      <div className="bg-gray-50 rounded p-2">
                        <div className="text-xs font-medium">{deckStructure.title}</div>
                        <div className="text-xs text-gray-600">
                          {deckStructure.slides.length} slides • {deckStructure.metadata.estimatedDuration} min
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={generateDeck}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Designing...
                      </div>
                    ) : (
                      'Generate Deck'
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold">Customization</h3>
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowThemeStudio(!showThemeStudio)}
                    className="w-full"
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    Customize Theme
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setShowChartStudio(!showChartStudio)}
                    className="w-full"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Customize Charts
                  </Button>

                  <Button
                    onClick={() => setCurrentStep(6)}
                    className="w-full"
                  >
                    Continue to Review
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 6 && (
              <motion.div
                key="step-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold">Review & Export</h3>
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Button
                      onClick={startPresentation}
                      disabled={isPlaying}
                      size="sm"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                    <Button
                      onClick={stopPresentation}
                      disabled={!isPlaying}
                      size="sm"
                      variant="outline"
                    >
                      <Pause className="w-4 h-4 mr-1" />
                      Stop
                    </Button>
                  </div>

                  <Button
                    onClick={handleDeckComplete}
                    className="w-full"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save & Open in Editor
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Center Panel - Preview */}
        <div className="flex-1 bg-gray-100 p-6">
          <div className="h-full bg-white rounded-lg shadow-lg overflow-hidden">
            {deckStructure && currentSlideData ? (
              <div className="h-full flex flex-col">
                {/* Slide Header */}
                <div className="bg-gray-50 border-b border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <h2 className="text-lg font-semibold">{currentSlideData.title}</h2>
                      <span className="text-sm text-gray-500">
                        Slide {currentSlide + 1} of {deckStructure.slides.length}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={prevSlide}
                        disabled={currentSlide === 0}
                        size="sm"
                        variant="outline"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={nextSlide}
                        disabled={currentSlide === deckStructure.slides.length - 1}
                        size="sm"
                        variant="outline"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Slide Content */}
                <div className="flex-1 p-8 overflow-auto">
                  <div
                    style={{
                      fontFamily: deckStructure.theme.fontFamily,
                      color: '#FFFFFF',
                      backgroundColor: deckStructure.theme.backgroundColor
                    }}
                  >
                    <h1 style={{ 
                      fontSize: deckStructure.theme.fontSizes.title,
                      color: deckStructure.theme.primaryColor
                    }}>
                      {currentSlideData.title}
                    </h1>
                    
                    {currentSlideData.subtitle && (
                      <h2 style={{ 
                        fontSize: deckStructure.theme.fontSizes.subtitle,
                        color: deckStructure.theme.secondaryColor
                      }}>
                        {currentSlideData.subtitle}
                      </h2>
                    )}

                    {currentSlideData.content.body && (
                      <p style={{ fontSize: deckStructure.theme.fontSizes.body }}>
                        {currentSlideData.content.body}
                      </p>
                    )}

                    {currentSlideData.content.bulletPoints && (
                      <ul className="mt-4 space-y-2">
                        {currentSlideData.content.bulletPoints.map((point: string, index: number) => (
                          <li key={index} style={{ fontSize: deckStructure.theme.fontSizes.body }}>
                            • {point}
                          </li>
                        ))}
                      </ul>
                    )}

                    {currentSlideData.content.chartConfig && (
                      <div className="mt-6">
                        <AdvancedTremorChartStudio
                          initialConfig={currentSlideData.content.chartConfig}
                          className="h-64"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {currentStep === 1 ? 'Upload your data to get started' :
                     currentStep === 2 ? 'Set up your presentation context' :
                     currentStep === 3 ? 'AI is analyzing your data' :
                     currentStep === 4 ? 'AI is designing your deck' :
                     currentStep === 5 ? 'Customize your presentation' :
                     'Review your presentation'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Follow the steps on the left to create your presentation
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Tools */}
        <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
          <AnimatePresence>
            {showThemeStudio && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <AdvancedThemeStudio
                  initialTheme={deckStructure?.theme}
                  onThemeChange={handleThemeChange}
                  className="h-full"
                />
              </motion.div>
            )}

            {showChartStudio && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <AdvancedTremorChartStudio
                  className="h-full"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
} 