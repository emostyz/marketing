'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ComprehensiveSlideRenderer } from '@/components/slides/ComprehensiveSlideRenderer'
import { ThemeSelector } from '@/components/themes/ThemeSelector'
import { savePresentation } from '@/lib/storage/presentation-storage'
import { AdvancedDataUploadModal } from '@/components/upload/AdvancedDataUploadModal'
import FunctionalDeckBuilder from '@/components/deck-builder/FunctionalDeckBuilder'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Toaster, toast } from 'react-hot-toast'
import { 
  Save, Download, ChevronLeft, ChevronRight, Plus, Brain, 
  FileDown, Palette, Settings, BarChart3, LineChart, PieChart,
  Type, Image, Trash2, Copy, Eye, ArrowLeft
} from 'lucide-react'
import { PresentationManager } from '@/lib/presentations/presentation-helpers'
// import { exportToPowerPoint } from '@/lib/export/powerpoint'

interface AdvancedPresentationEditorProps {
  userId: number
  presentationId?: string
  initialData?: any
  mode: 'new' | 'edit'
}

export function AdvancedPresentationEditor({ 
  userId, 
  presentationId, 
  initialData,
  mode 
}: AdvancedPresentationEditorProps) {
  const router = useRouter()
  const [presentation, setPresentation] = useState(initialData || {
    title: 'Untitled Presentation',
    slides: []
  })
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(mode === 'new' && presentation.slides.length === 0)
  const [showSettings, setShowSettings] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentTheme, setCurrentTheme] = useState('dark')
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('unsaved')
  const [showEnhancedBuilder, setShowEnhancedBuilder] = useState(false)
  const [enhancedBuilderData, setEnhancedBuilderData] = useState<any>(null)

  const currentSlide = presentation.slides[currentSlideIndex]

  const handleSave = async () => {
    setSaving(true)
    setSaveStatus('saving')
    
    try {
      const response = await fetch('/api/presentations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: presentation.title,
          slides: presentation.slides,
          theme: currentTheme,
          description: `AI-generated presentation with ${presentation.slides.length} slides`
        })
      })

      const data = await response.json()

      if (data.success) {
        setSaveStatus('saved')
        if (mode === 'new') {
          router.push(`/editor/${data.presentationId}`)
        }
      } else {
        throw new Error(data.error || 'Save failed')
      }
    } catch (error) {
      console.error('Save error:', error)
      setSaveStatus('unsaved')
      alert('Failed to save presentation')
    } finally {
      setSaving(false)
    }
  }

  const handleSlideUpdate = (updatedSlide: any) => {
    const newSlides = [...presentation.slides]
    newSlides[currentSlideIndex] = updatedSlide
    setPresentation({ ...presentation, slides: newSlides })
  }

  const addNewSlide = (type: 'content' | 'chart' = 'content') => {
    const newSlide = {
      id: Date.now().toString(),
      type,
      title: type === 'chart' ? 'New Chart Slide' : 'New Slide',
      content: {
        title: type === 'chart' ? 'New Chart Slide' : 'New Slide',
        body: type === 'chart' ? 'Chart description' : 'Add your content here'
      },
      ...(type === 'chart' && {
        chartType: 'bar',
        data: [
          { name: 'A', value: 100 },
          { name: 'B', value: 200 },
          { name: 'C', value: 150 }
        ]
      })
    }
    
    const newSlides = [...presentation.slides]
    newSlides.splice(currentSlideIndex + 1, 0, newSlide)
    
    setPresentation({ ...presentation, slides: newSlides })
    setCurrentSlideIndex(currentSlideIndex + 1)
  }

  const deleteSlide = (slideId: string) => {
    const newSlides = presentation.slides.filter((slide: any) => slide.id !== slideId)
    setPresentation({ ...presentation, slides: newSlides })
    
    if (currentSlideIndex >= newSlides.length) {
      setCurrentSlideIndex(Math.max(0, newSlides.length - 1))
    }
  }

  const duplicateSlide = () => {
    if (!currentSlide) return
    
    const duplicatedSlide = {
      ...currentSlide,
      id: Date.now().toString(),
      title: `${currentSlide.title} (Copy)`
    }
    
    const newSlides = [...presentation.slides]
    newSlides.splice(currentSlideIndex + 1, 0, duplicatedSlide)
    
    setPresentation({ ...presentation, slides: newSlides })
    setCurrentSlideIndex(currentSlideIndex + 1)
  }

  const handleDataUpload = async (uploadData: any) => {
    setShowUploadModal(false)
    
    // Check if using enhanced builder
    if (uploadData.useEnhancedBuilder) {
      // Redirect to enhanced deck builder
      setShowEnhancedBuilder(true)
      setEnhancedBuilderData(uploadData)
      return
    }
    
    // Fallback to original generation
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: uploadData.title,
          data: uploadData.data,
          qaResponses: uploadData.qaResponses,
          generateWithAI: true
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.slides) {
          setPresentation({
            title: uploadData.title,
            slides: result.slides
          })
          setCurrentSlideIndex(0)
          setSaveStatus('unsaved')
        }
      }
    } catch (error) {
      console.error('Error generating presentation:', error)
      alert('Failed to generate presentation')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExportToPowerPoint = async () => {
    if (!presentation.slides || presentation.slides.length === 0) {
      alert('No slides to export')
      return
    }

    setExporting(true)
    try {
      // Simple JSON export for now - PowerPoint export will be added later
      const exportData = {
        title: presentation.title,
        slides: presentation.slides,
        theme: currentTheme,
        exportedAt: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${presentation.title}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      alert('Presentation exported as JSON. PowerPoint export coming soon!')
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export presentation')
    } finally {
      setExporting(false)
    }
  }

  const handlePreviewMode = () => {
    // Open presentation in full-screen preview mode
    if (presentation.slides.length > 0) {
      // You could implement a full-screen preview modal here
      alert('Preview mode - would open full-screen presentation')
    }
  }

  const handleEnhancedDeckComplete = async (deckData: any) => {
    console.log('🎉 Enhanced deck complete! Received data:', deckData)
    
    // Process the slides to match the editor's expected format
    const processedSlides = (deckData.slides || []).map((slide: any, index: number) => {
      console.log(`Processing slide ${index + 1}:`, slide)
      
      // Convert the slide to the editor's format
      const processedSlide = {
        id: slide.id || `slide_${Date.now()}_${index}`,
        type: slide.type || 'content',
        title: slide.title || `Slide ${index + 1}`,
        content: {
          title: slide.content?.title || slide.title || `Slide ${index + 1}`,
          subtitle: slide.content?.subtitle || '',
          body: slide.content?.body || slide.content?.description || '',
          bulletPoints: slide.content?.bulletPoints || slide.content?.insights || [],
          description: slide.content?.description || slide.content?.body || '',
          narrative: slide.content?.narrative || [],
          insights: slide.content?.insights || slide.content?.bulletPoints || []
        },
        // Chart-specific properties
        ...(slide.chartType && {
          chartType: slide.chartType,
          data: slide.data || slide.chartData || [],
          categories: slide.categories || [],
          index: slide.index || '',
          tremorConfig: slide.tremorConfig || {
            type: slide.chartType,
            colors: ['blue', 'emerald', 'violet'],
            showLegend: true,
            showGradient: slide.chartType === 'area',
            showGrid: true,
            showTooltip: true,
            animation: true,
            height: 72
          }
        })
      }
      
      console.log(`Processed slide ${index + 1}:`, processedSlide)
      return processedSlide
    })
    
    // Create a unique presentation ID
    const presentationId = `pres_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const newPresentation = {
      id: presentationId,
      title: deckData.metadata?.title || enhancedBuilderData?.title || 'AI-Generated Presentation',
      description: `Generated from ${deckData.metadata?.dataPoints || 0} data points with ${processedSlides.length} slides`,
      slides: processedSlides,
      metadata: {
        datasetName: deckData.metadata?.datasetName || 'Dataset',
        analysisType: 'comprehensive',
        confidence: deckData.metadata?.confidence || 85,
        generatedAt: new Date().toISOString(),
        dataPoints: deckData.metadata?.dataPoints || 0,
        brainGenerated: true,
        strategicInsights: deckData.insights?.keyTakeaways?.length || 0,
        recommendations: deckData.insights?.strategicRecommendations?.length || 0,
        version: '2.0',
        worldClass: true
      },
      strategicInsights: deckData.insights,
      status: 'completed' as const
    }
    
    console.log('📋 Created new presentation:', newPresentation)
    console.log('📊 Total slides processed:', processedSlides.length)
    
    try {
      // Save the presentation using PresentationManager
      const saveSuccess = await PresentationManager.savePresentation(newPresentation, userId?.toString())
      
      if (saveSuccess) {
        console.log('✅ Presentation saved successfully')
        toast.success(`Generated ${processedSlides.length} slides with AI!`)
        
        // Navigate to the deck builder with the new presentation
        setTimeout(() => {
          router.push(`/deck-builder/${presentationId}`)
        }, 1500)
      } else {
        console.error('❌ Failed to save presentation')
        toast.error('Failed to save presentation. Please try again.')
      }
    } catch (error) {
      console.error('Error saving presentation:', error)
      toast.error('Error saving presentation. Please try again.')
    }
    
    // Clean up the enhanced builder state
    setShowEnhancedBuilder(false)
    setEnhancedBuilderData(null)
  }

  // Show enhanced deck builder
  if (showEnhancedBuilder && enhancedBuilderData) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
        <Toaster position="top-right" />
        
        {/* Header with back button */}
        <div className="border-b border-gray-700 bg-gray-900/50 px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => {
                setShowEnhancedBuilder(false)
                setEnhancedBuilderData(null)
              }}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Editor
            </Button>
            <h1 className="text-xl font-semibold">Enhanced AI Deck Builder</h1>
          </div>
        </div>

        {/* Enhanced Deck Builder */}
        <div className="flex-1 overflow-auto">
          <FunctionalDeckBuilder onSave={handleSave} />
        </div>
      </div>
    )
  }

  if (isGenerating) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 animate-pulse text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">AI is Generating Your Presentation</h2>
          <p className="text-gray-400">Analyzing your data and creating beautiful slides...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-900/50 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Dashboard
            </Button>
            <input
              type="text"
              value={presentation.title}
              onChange={(e) => setPresentation({ ...presentation, title: e.target.value })}
              className="text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowUploadModal(true)}
              size="sm"
            >
              <Brain className="w-4 h-4 mr-2" />
              AI Generate
            </Button>
            
            <ThemeSelector
              currentTheme={currentTheme}
              onThemeChange={(theme) => {
                setCurrentTheme(theme)
                setSaveStatus('unsaved')
              }}
            />
            
            <Button
              variant="ghost"
              onClick={handlePreviewMode}
              size="sm"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>

            <Button
              variant="ghost"
              onClick={handleExportToPowerPoint}
              disabled={exporting || presentation.slides.length === 0}
              size="sm"
            >
              <FileDown className="w-4 h-4 mr-2" />
              {exporting ? 'Exporting...' : 'Export PPT'}
            </Button>

            <Button
              onClick={handleSave}
              disabled={saving}
              size="sm"
              variant={saveStatus === 'saved' ? 'secondary' : 'default'}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Slide Thumbnails */}
        <div className="w-64 border-r border-gray-700 bg-gray-900/30 p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Slides ({presentation.slides.length})</h3>
            <div className="flex gap-1">
              <Button
                size="sm"
                onClick={() => addNewSlide('content')}
                className="flex items-center gap-1"
                title="Add Content Slide"
              >
                <Type className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                onClick={() => addNewSlide('chart')}
                className="flex items-center gap-1"
                title="Add Chart Slide"
              >
                <BarChart3 className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            {presentation.slides.map((slide: any, index: number) => (
              <div
                key={slide.id}
                onClick={() => setCurrentSlideIndex(index)}
                className={`group relative p-3 rounded cursor-pointer transition-all ${ 
                  index === currentSlideIndex
                    ? 'bg-blue-900/50 border-2 border-blue-500'
                    : 'bg-gray-800/50 hover:bg-gray-700/50 border-2 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium flex items-center gap-2">
                      {slide.type === 'chart' ? (
                        <BarChart3 className="w-3 h-3" />
                      ) : slide.type === 'title' ? (
                        <Type className="w-3 h-3" />
                      ) : (
                        <FileDown className="w-3 h-3" />
                      )}
                      Slide {index + 1}
                    </div>
                    <div className="text-xs text-gray-400 truncate mt-1">
                      {slide.content?.title || slide.title || 'Untitled'}
                    </div>
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        duplicateSlide()
                      }}
                      className="p-1"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteSlide(slide.id)
                      }}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {presentation.slides.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No slides yet</p>
                <p className="text-xs">Click AI Generate to start</p>
              </div>
            )}
          </div>
        </div>

        {/* Slide Editor */}
        <div className="flex-1 p-6">
          {currentSlide ? (
            <ComprehensiveSlideRenderer
              slide={currentSlide}
              onUpdate={handleSlideUpdate}
              editable={true}
              theme={currentTheme}
            />
          ) : (
            <Card className="h-full bg-gray-900/30 flex items-center justify-center">
              <div className="text-center">
                <Brain className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Slides Created Yet</h3>
                <p className="text-gray-400 mb-6">Upload your data to generate AI-powered slides</p>
                <Button onClick={() => setShowUploadModal(true)}>
                  <Brain className="w-4 h-4 mr-2" />
                  Generate with AI
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Slide Navigation */}
      <div className="border-t border-gray-700 bg-gray-900/50 px-6 py-3">
        <div className="flex justify-center items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
            disabled={currentSlideIndex === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <span className="text-sm text-gray-400">
            {presentation.slides.length > 0 ? currentSlideIndex + 1 : 0} / {presentation.slides.length}
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentSlideIndex(Math.min(presentation.slides.length - 1, currentSlideIndex + 1))}
            disabled={currentSlideIndex === presentation.slides.length - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Modals */}
      {showUploadModal && (
        <AdvancedDataUploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleDataUpload}
        />
      )}
    </div>
  )
}