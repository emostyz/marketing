'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Brain, FileText, ChevronLeft, ChevronRight, Download, Share, Settings } from 'lucide-react'
import { TremorChartRenderer } from '@/components/charts/TremorChartRenderer'
import { SlideElementRenderer } from '@/components/editor/SlideElementRenderer'

interface AISlideElement {
  id: string
  type: 'title' | 'bullets' | 'chart' | 'text' | 'image'
  x: number
  y: number
  width: number
  height: number
  content?: string
  data?: any[]
  chartType?: 'area' | 'bar' | 'line' | 'scatter' | 'pie'
  style?: {
    fontSize?: number
    fontWeight?: string
    color?: string
    backgroundColor?: string
    padding?: string
    borderRadius?: string
    border?: string
  }
}

interface AISlide {
  id: string
  title: string
  elements: {
    title?: string
    bullets?: string[]
    charts?: any[]
  }
  layout?: string
  background?: string
  transition?: string
}

interface AIDeckBuilderProps {
  presentationId: string
  aiGeneratedData?: {
    slides: AISlide[]
    metadata?: any
    insights_json?: any
    narrative_json?: any
    structure_json?: any
    final_deck_json?: any
  }
  onSave?: (slides: AISlide[]) => void
  onExport?: (format: string) => void
}

export function AIDeckBuilder({ 
  presentationId, 
  aiGeneratedData, 
  onSave, 
  onExport 
}: AIDeckBuilderProps) {
  const [slides, setSlides] = useState<AISlide[]>([])
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    initializeSlides()
  }, [aiGeneratedData, presentationId])

  const initializeSlides = async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (aiGeneratedData?.slides) {
        // Use provided AI generated data
        setSlides(processAISlides(aiGeneratedData.slides))
      } else {
        // Fetch from API if no data provided
        const response = await fetch(`/api/presentations/${presentationId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.final_deck_json?.slides) {
            setSlides(processAISlides(data.final_deck_json.slides))
          } else {
            throw new Error('No slide data found')
          }
        } else {
          throw new Error('Failed to fetch presentation data')
        }
      }
    } catch (err) {
      console.error('Failed to initialize slides:', err)
      setError('Failed to load presentation data')
    } finally {
      setIsLoading(false)
    }
  }

  const processAISlides = (rawSlides: any[]): AISlide[] => {
    return rawSlides.map((slide, index) => ({
      id: slide.id || `slide-${index}`,
      title: slide.title || `Slide ${index + 1}`,
      elements: {
        title: slide.elements?.title || slide.title,
        bullets: slide.elements?.bullets || slide.content?.bullets || [],
        charts: slide.elements?.charts || slide.charts || []
      },
      layout: slide.layout || 'default',
      background: slide.background || '#1e293b',
      transition: slide.transition || 'fade'
    }))
  }

  const renderSlideElement = (element: any, slideData: AISlide) => {
    const { type, x, y, width, height, content, data, chartType, style } = element

    const elementStyle = {
      position: 'absolute' as const,
      left: x,
      top: y,
      width,
      height,
      ...style
    }

    switch (type) {
      case 'title':
        return (
          <div key={element.id} style={elementStyle} className="text-white">
            <h1 className="text-4xl font-bold">{content || slideData.title}</h1>
          </div>
        )
      
      case 'bullets':
        const bullets = content ? content.split('\n') : slideData.elements.bullets || []
        return (
          <div key={element.id} style={elementStyle} className="text-white">
            <ul className="space-y-2">
              {bullets.map((bullet: string, idx: number) => (
                <li key={idx} className="flex items-start">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        )
      
      case 'chart':
        if (data && Array.isArray(data)) {
          return (
            <div key={element.id} style={elementStyle}>
              <TremorChartRenderer
                type={chartType || 'area'}
                data={data}
                title={content || 'Chart'}
                className="h-full"
              />
            </div>
          )
        }
        return null
      
      case 'text':
        return (
          <div key={element.id} style={elementStyle} className="text-white">
            <p>{content}</p>
          </div>
        )
      
      default:
        return (
          <SlideElementRenderer
            key={element.id}
            element={element}
            style={elementStyle}
          />
        )
    }
  }

  const currentSlide = slides[currentSlideIndex]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-white mb-2">Loading Presentation</h2>
          <p className="text-gray-400">Processing AI-generated slides...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Presentation</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={initializeSlides}>Try Again</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white" data-cy="ai-deck-builder">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Brain className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold">AI-Generated Presentation</h1>
              <p className="text-gray-400 text-sm">
                Slide {currentSlideIndex + 1} of {slides.length}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSave?.(slides)}
              data-cy="save-button"
            >
              <FileText className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport?.('pdf')}
              data-cy="export-button"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
            >
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Slide Thumbnails */}
        <div className="w-64 bg-gray-900 border-r border-gray-800 p-4 overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">
            Slides
          </h3>
          <div className="space-y-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlideIndex(index)}
                data-cy="slide-thumbnail"
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  index === currentSlideIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <div className="text-sm font-medium truncate">{slide.title}</div>
                <div className="text-xs text-gray-400 mt-1">Slide {index + 1}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Slide Canvas */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {currentSlide && (
                <motion.div
                  key={currentSlide.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                  style={{
                    width: '1024px',
                    height: '768px',
                    background: currentSlide.background || '#1e293b',
                    borderRadius: '8px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                  }}
                >
                  {/* Default slide elements if no positioned elements */}
                  {(!currentSlide.elements.title && !currentSlide.elements.bullets && !currentSlide.elements.charts) ? (
                    <div className="p-16">
                      <h1 className="text-4xl font-bold text-white mb-8">
                        {currentSlide.title}
                      </h1>
                      {currentSlide.elements.bullets && currentSlide.elements.bullets.length > 0 && (
                        <ul className="space-y-4 text-white text-xl">
                          {currentSlide.elements.bullets.map((bullet, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="w-3 h-3 bg-blue-400 rounded-full mt-2 mr-4 flex-shrink-0" />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    // Render positioned elements
                    <>
                      {/* Title */}
                      {currentSlide.elements.title && (
                        <div
                          style={{ position: 'absolute', left: 64, top: 64, width: 896, height: 80 }}
                          className="text-white"
                          data-cy="slide-title"
                        >
                          <h1 className="text-4xl font-bold">{currentSlide.elements.title}</h1>
                        </div>
                      )}
                      
                      {/* Bullets */}
                      {currentSlide.elements.bullets && currentSlide.elements.bullets.length > 0 && (
                        <div
                          style={{ position: 'absolute', left: 64, top: 200, width: 500, height: 400 }}
                          className="text-white"
                          data-cy="slide-bullets"
                        >
                          <ul className="space-y-4 text-xl">
                            {currentSlide.elements.bullets.map((bullet, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="w-3 h-3 bg-blue-400 rounded-full mt-2 mr-4 flex-shrink-0" />
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Charts */}
                      {currentSlide.elements.charts && currentSlide.elements.charts.length > 0 && (
                        <div
                          style={{ position: 'absolute', right: 64, top: 200, width: 400, height: 400 }}
                          data-cy="tremor-chart"
                        >
                          <TremorChartRenderer
                            type={currentSlide.elements.charts[0].type || 'area'}
                            data={currentSlide.elements.charts[0].data || []}
                            title={currentSlide.elements.charts[0].title || 'Chart'}
                            className="h-full"
                          />
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                disabled={currentSlideIndex === 0}
                data-cy="previous-slide-button"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex items-center space-x-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlideIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentSlideIndex ? 'bg-blue-400' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
                disabled={currentSlideIndex === slides.length - 1}
                data-cy="next-slide-button"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIDeckBuilder