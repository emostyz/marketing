'use client'

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  ChevronLeft, ChevronRight, Play, Save, Download, Settings,
  Plus, Grid, Eye, EyeOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import EnhancedSlideEditor from './EnhancedSlideEditor'

interface SlideElement {
  id: string
  type: 'text' | 'image' | 'chart' | 'shape'
  position: { x: number; y: number }
  size: { width: number; height: number }
  rotation: number
  content?: string
  style?: any
  isLocked?: boolean
}

interface Slide {
  id: string
  title: string
  elements: SlideElement[]
  backgroundColor: string
  notes?: string
}

interface DraggablePresentationEditorProps {
  presentationId?: string
  initialSlides?: any[]
  onSave?: (slides: Slide[]) => void
  onExport?: (format: string) => void
}

export default function DraggablePresentationEditor({
  presentationId,
  initialSlides = [],
  onSave,
  onExport
}: DraggablePresentationEditorProps) {
  // Convert initial slides to our format
  const convertInitialSlides = useCallback((slides: any[]): Slide[] => {
    return slides.map((slide, index) => ({
      id: slide.id || `slide_${index}`,
      title: slide.title || `Slide ${index + 1}`,
      backgroundColor: slide.background?.value || '#ffffff',
      elements: slide.elements || [],
      notes: slide.notes || ''
    }))
  }, [])

  const [slides, setSlides] = useState<Slide[]>(() => 
    initialSlides.length > 0 ? convertInitialSlides(initialSlides) : [
      {
        id: 'slide_1',
        title: 'Title Slide',
        backgroundColor: '#ffffff',
        elements: [
          {
            id: 'title_text',
            type: 'text',
            position: { x: 100, y: 100 },
            size: { width: 600, height: 80 },
            rotation: 0,
            content: 'Presentation Title',
            style: {
              fontSize: 48,
              fontWeight: 700,
              color: '#1e293b',
              textAlign: 'center'
            },
            isLocked: false
          },
          {
            id: 'subtitle_text',
            type: 'text',
            position: { x: 100, y: 200 },
            size: { width: 600, height: 40 },
            rotation: 0,
            content: 'Subtitle or Date',
            style: {
              fontSize: 24,
              fontWeight: 400,
              color: '#64748b',
              textAlign: 'center'
            },
            isLocked: false
          }
        ]
      }
    ]
  )

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [showThumbnails, setShowThumbnails] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)

  const currentSlide = slides[currentSlideIndex]

  // Slide operations
  const addSlide = useCallback(() => {
    const newSlide: Slide = {
      id: `slide_${Date.now()}`,
      title: `Slide ${slides.length + 1}`,
      backgroundColor: '#ffffff',
      elements: [],
      notes: ''
    }
    setSlides(prev => [...prev, newSlide])
    setCurrentSlideIndex(slides.length)
  }, [slides.length])

  const deleteSlide = useCallback((slideIndex: number) => {
    if (slides.length > 1) {
      setSlides(prev => prev.filter((_, i) => i !== slideIndex))
      if (currentSlideIndex >= slideIndex && currentSlideIndex > 0) {
        setCurrentSlideIndex(currentSlideIndex - 1)
      }
    }
  }, [slides.length, currentSlideIndex])

  const duplicateSlide = useCallback((slideIndex: number) => {
    const slide = slides[slideIndex]
    const newSlide: Slide = {
      ...slide,
      id: `slide_${Date.now()}`,
      title: `${slide.title} (Copy)`,
      elements: slide.elements.map(el => ({
        ...el,
        id: `${el.id}_copy_${Date.now()}`
      }))
    }
    setSlides(prev => [...prev.slice(0, slideIndex + 1), newSlide, ...prev.slice(slideIndex + 1)])
  }, [slides])

  const updateSlideElements = useCallback((slideIndex: number, elements: SlideElement[]) => {
    setSlides(prev => prev.map((slide, i) => 
      i === slideIndex ? { ...slide, elements } : slide
    ))
  }, [])

  const updateSlideBackground = useCallback((slideIndex: number, backgroundColor: string) => {
    setSlides(prev => prev.map((slide, i) => 
      i === slideIndex ? { ...slide, backgroundColor } : slide
    ))
  }, [])

  // Navigation
  const nextSlide = useCallback(() => {
    setCurrentSlideIndex(prev => Math.min(prev + 1, slides.length - 1))
  }, [slides.length])

  const prevSlide = useCallback(() => {
    setCurrentSlideIndex(prev => Math.max(prev - 1, 0))
  }, [])

  // Save and export
  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(slides)
    }
  }, [slides, onSave])

  const handleExport = useCallback(async (format: string) => {
    if (onExport) {
      onExport(format)
      return
    }

    // Default export implementation
    try {
      const response = await fetch(`/api/presentations/${presentationId}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format: format,
          size: '16:9',
          slides: slides.map(slide => ({
            id: slide.id,
            title: slide.title,
            layout: 'content',
            backgroundColor: slide.backgroundColor,
            elements: slide.elements.map(element => ({
              id: element.id,
              type: element.type,
              x: element.position.x,
              y: element.position.y,
              width: element.size.width,
              height: element.size.height,
              content: element.content,
              fontSize: element.style?.fontSize,
              fontFamily: element.style?.fontFamily,
              fontWeight: element.style?.fontWeight,
              color: element.style?.color,
              textAlign: element.style?.textAlign,
              backgroundColor: element.style?.backgroundColor,
            }))
          }))
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `presentation.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        console.error('Export failed')
      }
    } catch (error) {
      console.error('Error exporting presentation:', error)
    }
  }, [onExport, presentationId, slides])

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">Presentation Editor</h1>
          <span className="text-sm text-gray-400">
            Slide {currentSlideIndex + 1} of {slides.length}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowThumbnails(!showThumbnails)}
          >
            <Grid className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            <Play className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
          >
            <Save className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleExport('pptx')}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Slide Thumbnails */}
        {showThumbnails && (
          <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Slides</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={addSlide}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {slides.map((slide, index) => (
                <Card
                  key={slide.id}
                  className={`p-3 cursor-pointer transition-colors ${
                    index === currentSlideIndex 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => setCurrentSlideIndex(index)}
                >
                  <div className="aspect-video bg-white rounded mb-2 relative overflow-hidden">
                    <div 
                      className="w-full h-full text-xs"
                      style={{ backgroundColor: slide.backgroundColor }}
                    >
                      {slide.elements.map(element => (
                        <div
                          key={element.id}
                          className="absolute"
                          style={{
                            left: `${(element.position.x / 800) * 100}%`,
                            top: `${(element.position.y / 600) * 100}%`,
                            width: `${(element.size.width / 800) * 100}%`,
                            height: `${(element.size.height / 600) * 100}%`,
                            fontSize: '6px',
                            overflow: 'hidden'
                          }}
                        >
                          {element.type === 'text' && element.content}
                          {element.type === 'shape' && (
                            <div 
                              className="w-full h-full"
                              style={{ backgroundColor: element.style?.backgroundColor }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm font-medium truncate">{slide.title}</div>
                  <div className="text-xs text-gray-400">{slide.elements.length} elements</div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          {/* Slide Navigation */}
          <div className="bg-gray-800 border-b border-gray-700 p-2 flex items-center justify-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevSlide}
              disabled={currentSlideIndex === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <span className="text-sm">
              {currentSlide?.title || `Slide ${currentSlideIndex + 1}`}
            </span>

            <Button
              variant="ghost"
              size="sm"
              onClick={nextSlide}
              disabled={currentSlideIndex === slides.length - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Enhanced Slide Editor */}
          <div className="flex-1">
            {currentSlide && (
              <EnhancedSlideEditor
                slideId={currentSlide.id}
                elements={currentSlide.elements}
                onElementsChange={(elements) => updateSlideElements(currentSlideIndex, elements)}
                backgroundColor={currentSlide.backgroundColor}
                onBackgroundChange={(color) => updateSlideBackground(currentSlideIndex, color)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 border-t border-gray-700 p-2 flex items-center justify-between">
        <div className="text-sm text-gray-400">
          Enhanced editor with drag & drop, resize, and rotate
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => duplicateSlide(currentSlideIndex)}
          >
            Duplicate Slide
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => deleteSlide(currentSlideIndex)}
            disabled={slides.length <= 1}
          >
            Delete Slide
          </Button>
        </div>
      </div>
    </div>
  )
}