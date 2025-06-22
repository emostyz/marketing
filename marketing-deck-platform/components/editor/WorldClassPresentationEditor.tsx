'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Pause, 
  Square, 
  Edit3, 
  Type, 
  Image, 
  BarChart3, 
  Palette, 
  Layout, 
  Save, 
  Download, 
  Share2,
  Plus,
  Trash2,
  Move,
  Copy,
  Undo,
  Redo,
  Settings
} from 'lucide-react'
import { DndContext, DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { ExecutiveSummarySlide, DataVisualizationSlide, DashboardSlide, KeyInsightsSlide, RecommendationsSlide } from '@/components/slides/WorldClassSlideTemplates'
import { McKinseySlide } from '@/components/slides/McKinseySlideTemplates'
import { TremorChart, TremorDashboard } from '@/components/charts/TremorChartSystem'
import { ChartGenerator } from '@/lib/charts/chart-generator'
import { CollaborationProvider, useCollaboration } from '@/components/real-time/CollaborationProvider'
import { UserPresence, ConnectionStatus } from '@/components/real-time/UserPresence'
import { CommentSystem } from '@/components/real-time/CommentSystem'
import { McKinseyChartGenerator } from '@/lib/charts/mckinsey-chart-generator'

interface Slide {
  id: string
  number: number
  type: 'executive_summary' | 'data_visualization' | 'dashboard' | 'key_insights' | 'recommendations' | 'mckinsey' | 'custom'
  title: string
  content: string
  charts?: any[]
  keyTakeaways?: string[]
  style?: 'modern' | 'minimal' | 'corporate' | 'web3' | 'glassmorphic' | 'mckinsey'
  customStyles?: {
    backgroundColor?: string
    textColor?: string
    accentColor?: string
    layout?: string
  }
  mckinseyConfig?: any
}

interface PresentationEditorProps {
  presentationId: string
  initialSlides?: Slide[]
  onSave?: (slides: Slide[]) => void
  onExport?: (format: 'pptx' | 'pdf') => void
}

const PresentationEditorContent: React.FC<PresentationEditorProps> = ({
  presentationId,
  initialSlides = [],
  onSave,
  onExport
}) => {
  const [slides, setSlides] = useState<Slide[]>(initialSlides)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPresenting, setIsPresenting] = useState(false)
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [history, setHistory] = useState<Slide[][]>([initialSlides])
  const [historyIndex, setHistoryIndex] = useState(0)

  // Collaboration hooks
  const { 
    updateUserCursor, 
    updateUserSelection, 
    broadcastSlideUpdate, 
    broadcastPresentationUpdate,
    onSlideUpdate,
    onPresentationUpdate,
    setCurrentUser,
    currentUser
  } = useCollaboration()

  // Initialize current user for collaboration
  useEffect(() => {
    if (!currentUser) {
      // This would typically come from your auth system
      setCurrentUser({
        id: `user_${Date.now()}`,
        name: 'Current User', // Replace with actual user name
        email: 'user@example.com', // Replace with actual user email
        color: '#3B82F6'
      })
    }
  }, [currentUser, setCurrentUser])

  // Set up real-time collaboration listeners
  useEffect(() => {
    const unsubscribeSlideUpdate = onSlideUpdate((slideId: string, updates: any) => {
      setSlides(prevSlides => 
        prevSlides.map(slide => 
          slide.id === slideId ? { ...slide, ...updates } : slide
        )
      )
    })

    const unsubscribePresentationUpdate = onPresentationUpdate((updates: any) => {
      if (updates.slides) {
        setSlides(updates.slides)
      }
      if (updates.currentSlide !== undefined) {
        setCurrentSlide(updates.currentSlide)
      }
    })

    return () => {
      unsubscribeSlideUpdate()
      unsubscribePresentationUpdate()
    }
  }, [onSlideUpdate, onPresentationUpdate])

  // Track mouse movement for cursor sharing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      updateUserCursor({ x: e.clientX, y: e.clientY })
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [updateUserCursor])

  // Undo/Redo functionality
  const addToHistory = useCallback((newSlides: Slide[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push([...newSlides])
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setSlides([...history[historyIndex - 1]])
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setSlides([...history[historyIndex + 1]])
    }
  }, [history, historyIndex])

  // Slide management
  const addSlide = useCallback((type: Slide['type'], afterIndex?: number) => {
    const newSlide: Slide = {
      id: `slide_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      number: slides.length + 1,
      type,
      title: `New ${type.replace('_', ' ')} Slide`,
      content: 'Edit this content to add your insights...',
      style: 'web3',
      customStyles: {}
    }

    const insertIndex = afterIndex !== undefined ? afterIndex + 1 : slides.length
    const newSlides = [...slides]
    newSlides.splice(insertIndex, 0, newSlide)
    
    // Renumber slides
    newSlides.forEach((slide, index) => {
      slide.number = index + 1
    })

    setSlides(newSlides)
    addToHistory(newSlides)
    setCurrentSlide(insertIndex)
  }, [slides, addToHistory])

  const deleteSlide = useCallback((slideId: string) => {
    const newSlides = slides.filter(slide => slide.id !== slideId)
    newSlides.forEach((slide, index) => {
      slide.number = index + 1
    })
    
    setSlides(newSlides)
    addToHistory(newSlides)
    
    if (currentSlide >= newSlides.length) {
      setCurrentSlide(Math.max(0, newSlides.length - 1))
    }
  }, [slides, currentSlide, addToHistory])

  const duplicateSlide = useCallback((slideId: string) => {
    const slideIndex = slides.findIndex(slide => slide.id === slideId)
    if (slideIndex === -1) return

    const originalSlide = slides[slideIndex]
    const duplicatedSlide: Slide = {
      ...originalSlide,
      id: `slide_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: `${originalSlide.title} (Copy)`
    }

    const newSlides = [...slides]
    newSlides.splice(slideIndex + 1, 0, duplicatedSlide)
    
    newSlides.forEach((slide, index) => {
      slide.number = index + 1
    })

    setSlides(newSlides)
    addToHistory(newSlides)
    setCurrentSlide(slideIndex + 1)
  }, [slides, addToHistory])

  const updateSlide = useCallback((slideId: string, updates: Partial<Slide>) => {
    const newSlides = slides.map(slide => 
      slide.id === slideId ? { ...slide, ...updates } : slide
    )
    setSlides(newSlides)
    addToHistory(newSlides)
    
    // Broadcast real-time update
    broadcastSlideUpdate(slideId, updates)
  }, [slides, addToHistory, broadcastSlideUpdate])

  // Drag and drop
  const handleDragStart = (event: DragStartEvent) => {
    setSelectedSlideId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId !== overId) {
      const oldIndex = slides.findIndex(slide => slide.id === activeId)
      const newIndex = slides.findIndex(slide => slide.id === overId)

      const newSlides = [...slides]
      const [removed] = newSlides.splice(oldIndex, 1)
      newSlides.splice(newIndex, 0, removed)

      newSlides.forEach((slide, index) => {
        slide.number = index + 1
      })

      setSlides(newSlides)
      addToHistory(newSlides)
      setCurrentSlide(newIndex)
    }
    
    setSelectedSlideId(null)
  }

  // Presentation controls
  const startPresentation = () => {
    setIsPresenting(true)
    setCurrentSlide(0)
  }

  const stopPresentation = () => {
    setIsPresenting(false)
  }

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  // Save and export
  const savePresentation = async () => {
    if (onSave) {
      onSave(slides)
    }
    
    // Also save to API
    try {
      await fetch(`/api/presentations/${presentationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slides,
          updatedAt: new Date().toISOString()
        })
      })
    } catch (error) {
      console.error('Failed to save presentation:', error)
    }
  }

  const exportPresentation = (format: 'pptx' | 'pdf') => {
    if (onExport) {
      onExport(format)
    }
  }

  const renderSlideComponent = (slide: Slide) => {
    const props = { slide, className: 'w-full h-full' }
    
    switch (slide.type) {
      case 'executive_summary':
        return <ExecutiveSummarySlide {...props} />
      case 'data_visualization':
        return <DataVisualizationSlide {...props} />
      case 'dashboard':
        return <DashboardSlide {...props} />
      case 'key_insights':
        return <KeyInsightsSlide {...props} />
      case 'recommendations':
        return <RecommendationsSlide {...props} />
      case 'mckinsey':
        return slide.mckinseyConfig ? (
          <McKinseySlide config={slide.mckinseyConfig} className="w-full h-full" />
        ) : <ExecutiveSummarySlide {...props} />
      default:
        return <ExecutiveSummarySlide {...props} />
    }
  }

  if (isPresenting) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Presentation Controls */}
        <div className="absolute top-4 left-4 z-10 flex space-x-2">
          <button
            onClick={stopPresentation}
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
          >
            <Square className="w-5 h-5" />
          </button>
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
          >
            ←
          </button>
          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
          >
            →
          </button>
        </div>

        {/* Slide Counter */}
        <div className="absolute top-4 right-4 z-10 bg-black/50 text-white px-3 py-1 rounded-lg">
          {currentSlide + 1} / {slides.length}
        </div>

        {/* Current Slide */}
        <div className="flex-1 w-full h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
            >
              {slides[currentSlide] && renderSlideComponent(slides[currentSlide])}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Dots */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Presentation Editor</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={undo}
                disabled={historyIndex === 0}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex === history.length - 1}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>
            
            {/* Connection Status */}
            <ConnectionStatus />
          </div>

          {/* User Presence */}
          <div className="flex items-center space-x-4">
            <UserPresence />
            
            <div className="h-6 w-px bg-gray-600" />
            
            <div className="flex items-center space-x-2">
              <button
                onClick={savePresentation}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
              <button
                onClick={() => exportPresentation('pptx')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button
                onClick={startPresentation}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Present</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Slide Navigator */}
        <div className="w-80 bg-gray-900 border-r border-gray-800 p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Slides ({slides.length})</h2>
            <div className="relative">
              <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg group">
                <Plus className="w-4 h-4" />
              </button>
              {/* Add slide menu would go here */}
            </div>
          </div>

          <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <SortableContext items={slides.map(s => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {slides.map((slide, index) => (
                  <motion.div
                    key={slide.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                      bg-gray-800 rounded-lg p-3 cursor-pointer border-2 transition-all
                      ${currentSlide === index ? 'border-blue-500 bg-blue-900/20' : 'border-transparent hover:border-gray-600'}
                    `}
                    onClick={() => setCurrentSlide(index)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="text-xs text-gray-400 mb-1">Slide {slide.number}</div>
                        <div className="font-medium text-sm">{slide.title}</div>
                        <div className="text-xs text-gray-500 capitalize">{slide.type.replace('_', ' ')}</div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            duplicateSlide(slide.id)
                          }}
                          className="p-1 text-gray-400 hover:text-white"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteSlide(slide.id)
                          }}
                          className="p-1 text-gray-400 hover:text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Mini preview */}
                    <div className="bg-gray-700 rounded aspect-video text-xs flex items-center justify-center text-gray-400">
                      Preview
                    </div>
                  </motion.div>
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Add Slide Templates */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <h3 className="text-sm font-medium mb-3">Add Slide</h3>
            <div className="space-y-2">
              {[
                { type: 'executive_summary', icon: '📊', name: 'Executive Summary' },
                { type: 'data_visualization', icon: '📈', name: 'Data Visualization' },
                { type: 'dashboard', icon: '🎛️', name: 'Dashboard' },
                { type: 'key_insights', icon: '💡', name: 'Key Insights' },
                { type: 'recommendations', icon: '🎯', name: 'Recommendations' },
                { type: 'mckinsey', icon: '🏢', name: 'McKinsey Style' }
              ].map((template) => (
                <button
                  key={template.type}
                  onClick={() => addSlide(template.type as Slide['type'])}
                  className="w-full text-left bg-gray-800 hover:bg-gray-700 rounded-lg p-2 text-sm flex items-center space-x-2"
                >
                  <span>{template.icon}</span>
                  <span>{template.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          {/* Editor Toolbar */}
          <div className="bg-gray-900 border-b border-gray-800 p-3 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-white">
                <Type className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white">
                <Image className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white">
                <BarChart3 className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white">
                <Palette className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white">
                <Layout className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1"></div>
            
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-3 py-1 rounded text-sm ${
                isEditMode ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              {isEditMode ? 'Preview' : 'Edit'}
            </button>
          </div>

          {/* Slide Canvas */}
          <div className="flex-1 p-8 bg-gray-800">
            <div className="max-w-6xl mx-auto">
              <CommentSystem slideId={slides[currentSlide]?.id || 'no-slide'}>
                <div className="bg-white rounded-lg shadow-2xl aspect-video overflow-hidden">
                  {slides[currentSlide] && renderSlideComponent(slides[currentSlide])}
                </div>
              </CommentSystem>
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        <div className="w-80 bg-gray-900 border-l border-gray-800 p-4 overflow-y-auto">
          <h2 className="font-semibold mb-4">Properties</h2>
          
          {slides[currentSlide] && (
            <div className="space-y-4">
              {/* Slide Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={slides[currentSlide].title}
                  onChange={(e) => updateSlide(slides[currentSlide].id, { title: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                />
              </div>

              {/* Slide Content */}
              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <textarea
                  value={slides[currentSlide].content}
                  onChange={(e) => updateSlide(slides[currentSlide].id, { content: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white h-24 resize-none"
                />
              </div>

              {/* Style */}
              <div>
                <label className="block text-sm font-medium mb-2">Style</label>
                <select
                  value={slides[currentSlide].style || 'web3'}
                  onChange={(e) => updateSlide(slides[currentSlide].id, { style: e.target.value as any })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                >
                  <option value="modern">Modern</option>
                  <option value="minimal">Minimal</option>
                  <option value="corporate">Corporate</option>
                  <option value="web3">Web3</option>
                  <option value="glassmorphic">Glassmorphic</option>
                </select>
              </div>

              {/* Key Takeaways */}
              <div>
                <label className="block text-sm font-medium mb-2">Key Takeaways</label>
                {slides[currentSlide].keyTakeaways?.map((takeaway, index) => (
                  <div key={index} className="mb-2">
                    <input
                      type="text"
                      value={takeaway}
                      onChange={(e) => {
                        const newTakeaways = [...(slides[currentSlide].keyTakeaways || [])]
                        newTakeaways[index] = e.target.value
                        updateSlide(slides[currentSlide].id, { keyTakeaways: newTakeaways })
                      }}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                    />
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newTakeaways = [...(slides[currentSlide].keyTakeaways || []), 'New takeaway']
                    updateSlide(slides[currentSlide].id, { keyTakeaways: newTakeaways })
                  }}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  + Add Takeaway
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Main wrapper component with collaboration provider
export const WorldClassPresentationEditor: React.FC<PresentationEditorProps> = (props) => {
  return (
    <CollaborationProvider presentationId={props.presentationId}>
      <PresentationEditorContent {...props} />
    </CollaborationProvider>
  )
}