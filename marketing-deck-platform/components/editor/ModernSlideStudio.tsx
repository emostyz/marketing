'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Play, 
  Download, 
  Share2, 
  Settings,
  Layout,
  Palette,
  Type,
  BarChart3,
  Image,
  Square,
  Save
} from 'lucide-react'
import WorldClassSlideEditor from './WorldClassSlideEditor'

interface Slide {
  id: string
  title: string
  elements: any[]
}

interface ModernSlideStudioProps {
  initialSlides?: Slide[]
  onSave?: (slides: Slide[]) => void
  theme?: 'light' | 'dark' | 'modern'
}

export default function ModernSlideStudio({ 
  initialSlides = [], 
  onSave,
  theme = 'modern' 
}: ModernSlideStudioProps) {
  const [slides, setSlides] = useState<Slide[]>(
    initialSlides.length > 0 
      ? initialSlides 
      : [{ id: 'slide-1', title: 'Slide 1', elements: [] }]
  )
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  const currentSlide = slides[currentSlideIndex]

  // Add new slide
  const addSlide = () => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      title: `Slide ${slides.length + 1}`,
      elements: []
    }
    const newSlides = [...slides, newSlide]
    setSlides(newSlides)
    setCurrentSlideIndex(newSlides.length - 1)
  }

  // Delete slide
  const deleteSlide = (index: number) => {
    if (slides.length <= 1) return
    
    const newSlides = slides.filter((_, i) => i !== index)
    setSlides(newSlides)
    
    if (currentSlideIndex >= newSlides.length) {
      setCurrentSlideIndex(newSlides.length - 1)
    } else if (currentSlideIndex > index) {
      setCurrentSlideIndex(currentSlideIndex - 1)
    }
  }

  // Duplicate slide
  const duplicateSlide = (index: number) => {
    const slideToClone = slides[index]
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      title: `${slideToClone.title} (Copy)`,
      elements: JSON.parse(JSON.stringify(slideToClone.elements)) // Deep clone
    }
    
    const newSlides = [...slides]
    newSlides.splice(index + 1, 0, newSlide)
    setSlides(newSlides)
    setCurrentSlideIndex(index + 1)
  }

  // Update current slide elements
  const updateSlideElements = (elements: any[]) => {
    const newSlides = [...slides]
    newSlides[currentSlideIndex] = {
      ...currentSlide,
      elements
    }
    setSlides(newSlides)
  }

  // Save presentation
  const handleSave = () => {
    onSave?.(slides)
    // Also save to localStorage as backup
    localStorage.setItem('presentation-backup', JSON.stringify(slides))
  }

  // Navigation
  const goToSlide = (index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlideIndex(index)
    }
  }

  const nextSlide = () => goToSlide(currentSlideIndex + 1)
  const prevSlide = () => goToSlide(currentSlideIndex - 1)

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem('presentation-autosave', JSON.stringify(slides))
    }, 30000)
    
    return () => clearInterval(interval)
  }, [slides])

  // Load autosave on mount
  useEffect(() => {
    const autosave = localStorage.getItem('presentation-autosave')
    if (autosave && initialSlides.length === 0) {
      try {
        const savedSlides = JSON.parse(autosave)
        if (savedSlides.length > 0) {
          setSlides(savedSlides)
        }
      } catch (error) {
        console.error('Failed to load autosave:', error)
      }
    }
  }, [initialSlides.length])

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar - Slide Thumbnails */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-80'
      }`}>
        {/* Sidebar Header */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
          {!sidebarCollapsed && (
            <h2 className="text-lg font-semibold text-gray-800">Slides</h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* Slide List */}
        <div className="flex-1 overflow-y-auto p-4">
          {!sidebarCollapsed && (
            <>
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`mb-4 p-3 rounded-lg cursor-pointer transition-all ${
                    index === currentSlideIndex
                      ? 'bg-blue-50 border-2 border-blue-300 shadow-sm'
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => setCurrentSlideIndex(index)}
                >
                  {/* Slide Preview */}
                  <div className="aspect-video bg-white border border-gray-200 rounded mb-2 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                      Slide {index + 1}
                    </div>
                    {slide.elements.length > 0 && (
                      <div className="absolute inset-2">
                        {slide.elements.slice(0, 3).map((element, i) => (
                          <div
                            key={i}
                            className="absolute bg-blue-200 rounded"
                            style={{
                              left: `${(element.x / 1280) * 100}%`,
                              top: `${(element.y / 720) * 100}%`,
                              width: `${Math.min(80, (element.width / 1280) * 100)}%`,
                              height: `${Math.min(60, (element.height / 720) * 100)}%`
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Slide Info */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-800">{slide.title}</div>
                      <div className="text-xs text-gray-500">{slide.elements.length} elements</div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          duplicateSlide(index)
                        }}
                        className="p-1 h-6 w-6"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      {slides.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteSlide(index)
                          }}
                          className="p-1 h-6 w-6 text-red-500 hover:text-red-700"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Slide Button */}
              <Button
                variant="outline"
                onClick={addSlide}
                className="w-full mt-4 border-dashed border-2 h-16 text-gray-500 hover:text-gray-700 hover:border-gray-400"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Slide
              </Button>
            </>
          )}

          {sidebarCollapsed && (
            <div className="space-y-2">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`w-8 h-8 rounded cursor-pointer flex items-center justify-center text-xs font-medium ${
                    index === currentSlideIndex
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                  onClick={() => setCurrentSlideIndex(index)}
                >
                  {index + 1}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addSlide}
                className="w-8 h-8 p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-800">Presentation Studio</h1>
            <div className="text-sm text-gray-500">
              Slide {currentSlideIndex + 1} of {slides.length}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Navigation */}
            <Button
              variant="outline"
              size="sm"
              onClick={prevSlide}
              disabled={currentSlideIndex === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextSlide}
              disabled={currentSlideIndex === slides.length - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            {/* Actions */}
            <div className="mx-4 h-6 w-px bg-gray-300" />
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Present
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1">
          <WorldClassSlideEditor
            initialElements={currentSlide?.elements || []}
            onElementChange={updateSlideElements}
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  )
}