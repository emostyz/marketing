'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, ThumbsUp, ThumbsDown, Eye, Sparkles, Brain, FileText, ArrowRight, ArrowLeft, Edit2, Trash2, Plus, ChevronUp, ChevronDown, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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

interface EditableSlide {
  id: string
  title: string
  purpose: string
  type: string
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
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null)
  const [tempSlideEdit, setTempSlideEdit] = useState<EditableSlide | null>(null)

  // Start real-time analysis
  useEffect(() => {
    startRealTimeAnalysis()
  }, [])

  const startRealTimeAnalysis = async () => {
    try {
      console.log('🚀 Starting REAL analysis with dataset:', datasetId)
      
      // Clear any existing insights to prevent duplicates
      setInsights([])
      
      // Step 1: Start analysis and get real-time insights
      setCurrentAnalysisStep('Analyzing your uploaded data...')
      setProgress(10)

      // First, fetch the actual dataset data
      console.log('📥 Fetching dataset data for analysis...', datasetId)
      let actualData: any[] = []
      
      if (datasetId.startsWith('demo-')) {
        // For demo datasets, generate sample data
        actualData = [
          { Date: '2024-01-01', Region: 'North America', Revenue: 45000, Units_Sold: 120, Product_Category: 'Electronics' },
          { Date: '2024-01-02', Region: 'Europe', Revenue: 38000, Units_Sold: 95, Product_Category: 'Electronics' },
          { Date: '2024-01-03', Region: 'Asia Pacific', Revenue: 52000, Units_Sold: 140, Product_Category: 'Software' },
          { Date: '2024-01-04', Region: 'North America', Revenue: 47000, Units_Sold: 125, Product_Category: 'Software' },
          { Date: '2024-01-05', Region: 'Europe', Revenue: 41000, Units_Sold: 110, Product_Category: 'Hardware' },
          { Date: '2024-01-06', Region: 'Asia Pacific', Revenue: 55000, Units_Sold: 150, Product_Category: 'Electronics' },
          { Date: '2024-01-07', Region: 'Latin America', Revenue: 28000, Units_Sold: 75, Product_Category: 'Software' },
          { Date: '2024-01-08', Region: 'Middle East', Revenue: 35000, Units_Sold: 90, Product_Category: 'Hardware' },
          { Date: '2024-01-09', Region: 'North America', Revenue: 49000, Units_Sold: 130, Product_Category: 'Electronics' },
          { Date: '2024-01-10', Region: 'Europe', Revenue: 43000, Units_Sold: 115, Product_Category: 'Software' }
        ]
        console.log('✅ Using demo dataset with', actualData.length, 'rows')
      } else {
        // For real datasets, fetch from API
        const datasetResponse = await fetch(`/api/datasets/${datasetId}`)
        if (!datasetResponse.ok) {
          throw new Error(`Failed to fetch dataset: ${datasetResponse.status}`)
        }
        const datasetResult = await datasetResponse.json()
        actualData = datasetResult.data?.processedData || datasetResult.processedData || []
        console.log('✅ Fetched real dataset with', actualData.length, 'rows')
      }

      if (!actualData || actualData.length === 0) {
        throw new Error('No data found in dataset')
      }

      // Analyze the data locally to generate REAL insights
      setProgress(30)
      setCurrentAnalysisStep('Analyzing data patterns...')
      
      const realInsights = analyzeDataLocally(actualData, context)
      console.log('📊 Generated real insights from actual data:', realInsights)

      if (realInsights.length === 0) {
        throw new Error('No meaningful insights could be extracted from this data')
      }

      setProgress(70)
      setCurrentAnalysisStep('Loading insights from your data...')
      
      // Add insights progressively for better UX
      for (let i = 0; i < realInsights.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 300))
        addInsight(realInsights[i])
      }

      setProgress(100)
      setCurrentAnalysisStep('Analysis complete! Review your insights below.')
      setTimeout(() => setStep('insights'), 1000)

    } catch (error) {
      console.error('❌ Real analysis failed:', error)
      toast.error('Analysis failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
      
      // NO FALLBACK INSIGHTS - they are terrible generic insights
      // Instead, show the error and let user retry or go back
      setCurrentAnalysisStep('Analysis failed. Please try again or go back to upload a different file.')
      setProgress(0)
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

    // Generate deck structure based on approved insights - NO DUPLICATES
    const uniqueInsightSlides = approvedInsights
      .filter((insight, index, array) => 
        array.findIndex(i => i.title === insight.title) === index
      )
      .map((insight, index) => ({
        id: `insight-${insight.id}-${index}`,
        title: insight.title,
        purpose: insight.businessImplication,
        type: 'insight'
      }))

    const structure: DeckStructure = {
      title: `${context.businessContext || context.description || 'Data Analysis'} Insights Report`,
      description: `Comprehensive analysis revealing ${uniqueInsightSlides.length} key business insights`,
      purpose: 'Present data-driven recommendations to drive strategic decision making',
      slides: [
        {
          id: 'title',
          title: 'Executive Summary',
          purpose: 'Overview of key findings and recommendations',
          type: 'title'
        },
        ...uniqueInsightSlides,
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

  // Slide editing functions
  const startEditingSlide = (slide: EditableSlide) => {
    setEditingSlideId(slide.id)
    setTempSlideEdit({ ...slide })
  }

  const saveSlideEdit = () => {
    if (!tempSlideEdit || !deckStructure) return
    
    const updatedStructure = {
      ...deckStructure,
      slides: deckStructure.slides.map(slide => 
        slide.id === tempSlideEdit.id ? tempSlideEdit : slide
      )
    }
    
    setDeckStructure(updatedStructure)
    setEditingSlideId(null)
    setTempSlideEdit(null)
    toast.success('Slide updated successfully')
  }

  const cancelSlideEdit = () => {
    setEditingSlideId(null)
    setTempSlideEdit(null)
  }

  const deleteSlide = (slideId: string) => {
    if (!deckStructure) return
    
    const updatedStructure = {
      ...deckStructure,
      slides: deckStructure.slides.filter(slide => slide.id !== slideId)
    }
    
    setDeckStructure(updatedStructure)
    toast.success('Slide removed')
  }

  const addNewSlide = () => {
    if (!deckStructure) return
    
    const newSlide = {
      id: `custom-slide-${Date.now()}`,
      title: 'New Slide',
      purpose: 'Add your content here',
      type: 'content'
    }
    
    const updatedStructure = {
      ...deckStructure,
      slides: [...deckStructure.slides, newSlide]
    }
    
    setDeckStructure(updatedStructure)
    toast.success('New slide added')
  }

  const moveSlide = (slideId: string, direction: 'up' | 'down') => {
    if (!deckStructure) return
    
    const currentIndex = deckStructure.slides.findIndex(s => s.id === slideId)
    if (currentIndex === -1) return
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= deckStructure.slides.length) return
    
    const newSlides = [...deckStructure.slides]
    const temp = newSlides[currentIndex]
    newSlides[currentIndex] = newSlides[newIndex]
    newSlides[newIndex] = temp
    
    const updatedStructure = {
      ...deckStructure,
      slides: newSlides
    }
    
    setDeckStructure(updatedStructure)
  }

  const updateStructureInfo = (field: keyof DeckStructure, value: string) => {
    if (!deckStructure) return
    
    setDeckStructure({
      ...deckStructure,
      [field]: value
    })
  }

  const generateFinalDeck = async () => {
    if (!deckStructure) return

    setStep('generating')
    setProgress(0)
    setCurrentAnalysisStep('Generating final presentation...')

    try {
      console.log('🎯 Generating deck with approved insights and structure')
      console.log('📊 Dataset ID:', datasetId)
      console.log('✨ Approved insights:', insights.filter(i => i.approved === true))
      console.log('🏗️ Deck structure:', deckStructure)

      // Progress simulation for better UX
      const progressSteps = [
        { progress: 20, message: 'Creating slide structure...' },
        { progress: 40, message: 'Generating visualizations...' },
        { progress: 60, message: 'Processing approved insights...' },
        { progress: 80, message: 'Finalizing presentation...' }
      ]

      for (const step of progressSteps) {
        setProgress(step.progress)
        setCurrentAnalysisStep(step.message)
        await new Promise(resolve => setTimeout(resolve, 800))
      }

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

      console.log('📡 Deck generation response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Deck generation failed:', response.status, errorText)
        throw new Error(`Failed to generate deck: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ Deck generation result:', result)
      
      if (result.success && result.deckId) {
        setGeneratedDeckId(result.deckId)
        setProgress(100)
        setCurrentAnalysisStep('Deck generation complete!')
        
        toast.success(`🎉 Deck generated with ${result.slideCount || deckStructure.slides.length} slides!`)
        
        console.log('🚀 Navigating to deck:', result.deckId)
        
        // Small delay then navigate
        setTimeout(() => {
          onComplete(result.deckId)
        }, 1500)
      } else {
        console.error('❌ Deck generation returned invalid result:', result)
        throw new Error(result.error || 'Deck generation failed - no deck ID returned')
      }

    } catch (error) {
      console.error('❌ Deck generation error:', error)
      toast.error('Failed to generate deck: ' + (error instanceof Error ? error.message : 'Unknown error'))
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
          Review and customize your presentation structure. You can edit titles, reorder slides, add new slides, or remove slides.
        </p>
      </div>

      {deckStructure && (
        <div className="space-y-6">
          {/* Editable Presentation Overview */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-3">Presentation Overview</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-400 block mb-1">Title:</label>
                <Input
                  value={deckStructure.title}
                  onChange={(e) => updateStructureInfo('title', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Enter presentation title"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400 block mb-1">Description:</label>
                <Input
                  value={deckStructure.description}
                  onChange={(e) => updateStructureInfo('description', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Enter presentation description"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400 block mb-1">Purpose:</label>
                <Input
                  value={deckStructure.purpose}
                  onChange={(e) => updateStructureInfo('purpose', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Enter presentation purpose"
                />
              </div>
            </div>
          </div>

          {/* Editable Slide Structure */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Slide Structure ({deckStructure.slides.length} slides)</h3>
              <Button 
                onClick={addNewSlide}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Slide
              </Button>
            </div>
            
            <div className="space-y-3">
              {deckStructure.slides.map((slide, index) => (
                <div key={slide.id} className="p-4 bg-gray-700 rounded-lg">
                  {editingSlideId === slide.id ? (
                    // Edit mode
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-2">
                          <Input
                            value={tempSlideEdit?.title || ''}
                            onChange={(e) => setTempSlideEdit(prev => prev ? {...prev, title: e.target.value} : null)}
                            className="bg-gray-600 border-gray-500 text-white"
                            placeholder="Slide title"
                          />
                          <Input
                            value={tempSlideEdit?.purpose || ''}
                            onChange={(e) => setTempSlideEdit(prev => prev ? {...prev, purpose: e.target.value} : null)}
                            className="bg-gray-600 border-gray-500 text-white text-sm"
                            placeholder="Slide purpose"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            onClick={saveSlideEdit}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button 
                            onClick={cancelSlideEdit}
                            size="sm"
                            variant="outline"
                            className="border-gray-500"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{slide.title}</h4>
                        <p className="text-sm text-gray-400 mt-1">{slide.purpose}</p>
                        <span className="text-xs text-gray-500 capitalize mt-1 inline-block">{slide.type}</span>
                      </div>
                      <div className="flex space-x-1">
                        <Button 
                          onClick={() => moveSlide(slide.id, 'up')}
                          size="sm"
                          variant="ghost"
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-white"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </Button>
                        <Button 
                          onClick={() => moveSlide(slide.id, 'down')}
                          size="sm"
                          variant="ghost"
                          disabled={index === deckStructure.slides.length - 1}
                          className="p-1 text-gray-400 hover:text-white"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                        <Button 
                          onClick={() => startEditingSlide(slide)}
                          size="sm"
                          variant="ghost"
                          className="p-1 text-gray-400 hover:text-white"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          onClick={() => deleteSlide(slide.id)}
                          size="sm"
                          variant="ghost"
                          className="p-1 text-gray-400 hover:text-red-400"
                          disabled={deckStructure.slides.length <= 2} // Keep at least 2 slides
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
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
        
        <div className="text-sm text-gray-400 mb-8">
          Creating professional slides with charts and visualizations...
        </div>

        {/* Show slide structure being built */}
        {deckStructure && progress > 20 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-left"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Building Your Slides:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deckStructure.slides.slice(0, Math.floor((progress / 100) * deckStructure.slides.length) + 1).map((slide, index) => (
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.2 }}
                  className="bg-gray-800 p-4 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-white text-sm">{slide.title}</h4>
                      <p className="text-xs text-gray-400 capitalize">{slide.type} slide</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1 mb-2">
                    <motion.div 
                      className="bg-green-500 h-1 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: index < Math.floor((progress / 100) * deckStructure.slides.length) ? "100%" : "0%" }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">{slide.purpose}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {generatedDeckId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-green-900/20 border border-green-500 rounded-lg"
          >
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="font-medium text-green-400">Presentation Generated Successfully!</span>
            </div>
            <p className="text-sm text-gray-300">Deck ID: {generatedDeckId}</p>
          </motion.div>
        )}
      </div>
    </Card>
  )

// Analyze data locally to generate REAL insights from actual data
function analyzeDataLocally(data: any[], context: any): Insight[] {
  if (!data || data.length === 0) return []
  
  const insights: Insight[] = []
  const columns = Object.keys(data[0] || {})
  
  // Find numeric columns
  const numericColumns = columns.filter(col => {
    const values = data.slice(0, Math.min(10, data.length)).map(row => row[col])
    return values.some(val => !isNaN(parseFloat(val)) && isFinite(val))
  })
  
  // Find date/time columns  
  const dateColumns = columns.filter(col => {
    const sample = String(data[0][col] || '')
    return sample && (sample.includes('/') || sample.includes('-') || col.toLowerCase().includes('date') || col.toLowerCase().includes('time'))
  })
  
  // Find categorical columns
  const categoricalColumns = columns.filter(col => !numericColumns.includes(col) && !dateColumns.includes(col))
  
  console.log('📊 Data analysis:', { numericColumns, dateColumns, categoricalColumns, totalRows: data.length })
  
  // 1. REVENUE/SALES ANALYSIS (if numeric columns exist)
  if (numericColumns.length > 0) {
    const revenueCol = numericColumns.find(col => 
      col.toLowerCase().includes('revenue') || 
      col.toLowerCase().includes('sales') || 
      col.toLowerCase().includes('amount') ||
      col.toLowerCase().includes('value')
    ) || numericColumns[0]
    
    const values = data.map(row => parseFloat(row[revenueCol])).filter(v => !isNaN(v))
    const total = values.reduce((a, b) => a + b, 0)
    const avg = total / values.length
    const max = Math.max(...values)
    const min = Math.min(...values)
    
    insights.push({
      id: `revenue_analysis_${Date.now()}`,
      title: `${revenueCol} Performance Analysis`,
      description: `Total ${revenueCol.toLowerCase()}: ${total.toLocaleString()}. Average: ${avg.toFixed(0)}. Range: ${min.toFixed(0)} - ${max.toFixed(0)}`,
      businessImplication: `${revenueCol} data shows ${avg > 1000 ? 'strong' : 'moderate'} performance with significant variance indicating potential optimization opportunities`,
      confidence: 90,
      approved: null
    })
  }
  
  // 2. REGIONAL/CATEGORY ANALYSIS (if categorical columns exist)
  if (categoricalColumns.length > 0 && numericColumns.length > 0) {
    const categoryCol = categoricalColumns.find(col => 
      col.toLowerCase().includes('region') || 
      col.toLowerCase().includes('category') || 
      col.toLowerCase().includes('type') ||
      col.toLowerCase().includes('segment')
    ) || categoricalColumns[0]
    
    const valueCol = numericColumns[0]
    
    // Group by category and sum values
    const groupedData = data.reduce((acc, row) => {
      const category = row[categoryCol]
      const value = parseFloat(row[valueCol]) || 0
      acc[category] = (acc[category] || 0) + value
      return acc
    }, {})
    
    const categories = Object.keys(groupedData)
    const bestCategory = categories.reduce((a, b) => groupedData[a] > groupedData[b] ? a : b)
    const worstCategory = categories.reduce((a, b) => groupedData[a] < groupedData[b] ? a : b)
    
    insights.push({
      id: `category_analysis_${Date.now()}`,
      title: `${categoryCol} Performance Breakdown`,
      description: `${bestCategory} is the top performing ${categoryCol.toLowerCase()} with ${groupedData[bestCategory].toLocaleString()} total ${valueCol.toLowerCase()}. ${worstCategory} shows lowest performance.`,
      businessImplication: `Focus on replicating ${bestCategory}'s success factors across other ${categoryCol.toLowerCase()}s. Investigate ${worstCategory} for improvement opportunities.`,
      confidence: 85,
      approved: null
    })
  }
  
  // 3. TREND ANALYSIS (if date columns exist)
  if (dateColumns.length > 0 && numericColumns.length > 0) {
    const dateCol = dateColumns[0]
    const valueCol = numericColumns[0]
    
    // Sort by date and analyze trend
    const sortedData = data
      .filter(row => row[dateCol] && row[valueCol])
      .sort((a, b) => new Date(a[dateCol]).getTime() - new Date(b[dateCol]).getTime())
    
    if (sortedData.length >= 3) {
      const firstValue = parseFloat(sortedData[0][valueCol])
      const lastValue = parseFloat(sortedData[sortedData.length - 1][valueCol])
      const change = lastValue - firstValue
      const percentChange = (change / firstValue) * 100
      
      const trendDirection = change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable'
      
      insights.push({
        id: `trend_analysis_${Date.now()}`,
        title: `${valueCol} Trend Over Time`,
        description: `${valueCol} is ${trendDirection} over time with a ${Math.abs(percentChange).toFixed(1)}% ${change > 0 ? 'increase' : 'decrease'} from ${firstValue.toFixed(0)} to ${lastValue.toFixed(0)}`,
        businessImplication: `${trendDirection === 'increasing' ? 'Positive momentum should be sustained and accelerated' : trendDirection === 'decreasing' ? 'Declining trend requires immediate attention and corrective action' : 'Stable performance may indicate market maturity or need for innovation'}`,
        confidence: 80,
        approved: null
      })
    }
  }
  
  // 4. DATA QUALITY INSIGHT
  const completeness = (data.length - data.filter(row => 
    Object.values(row).some(val => val === null || val === undefined || val === '')
  ).length) / data.length * 100
  
  if (completeness < 95) {
    insights.push({
      id: `data_quality_${Date.now()}`,
      title: 'Data Quality Assessment',
      description: `Dataset is ${completeness.toFixed(1)}% complete with ${data.length} records across ${columns.length} fields. ${100 - completeness > 0 ? 'Some missing values detected.' : ''}`,
      businessImplication: `${completeness > 90 ? 'High data quality enables confident decision making' : 'Data quality issues may impact analysis reliability and should be addressed'}`,
      confidence: 95,
      approved: null
    })
  }
  
  console.log('✅ Generated', insights.length, 'real insights from actual data')
  return insights
}

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