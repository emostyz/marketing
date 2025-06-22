'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Maximize, 
  Minimize, 
  Volume2, 
  VolumeX,
  Edit,
  Download,
  Share,
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ExportModal } from '@/components/export/ExportModal'

// Mock presentation data - would come from API
const mockPresentation = {
  id: '1',
  title: 'Q4 2024 Business Review',
  description: 'Comprehensive analysis of business performance and market insights',
  slides: [
    {
      id: 'slide-1',
      type: 'title',
      title: 'Q4 2024 Business Review',
      subtitle: 'Driving Growth Through Data-Driven Insights',
      backgroundImage: '/api/placeholder/1920/1080'
    },
    {
      id: 'slide-2',
      type: 'content',
      title: 'Executive Summary',
      bullets: [
        'Revenue grew 23% YoY to $45.2M',
        'Customer acquisition increased 35%',
        'Market share expanded to 18.5%',
        'Operational efficiency improved 28%'
      ]
    },
    {
      id: 'slide-3',
      type: 'chart',
      title: 'Revenue Growth Trajectory',
      chartType: 'line',
      data: [
        { quarter: 'Q1', revenue: 32.5, growth: 15 },
        { quarter: 'Q2', revenue: 38.1, growth: 18 },
        { quarter: 'Q3', revenue: 42.3, growth: 21 },
        { quarter: 'Q4', revenue: 45.2, growth: 23 }
      ]
    },
    {
      id: 'slide-4',
      type: 'content',
      title: 'Key Insights',
      bullets: [
        'Premium segment showing strongest growth (34% increase)',
        'Customer retention improved to 94%',
        'New market penetration exceeded targets by 120%',
        'AI-driven personalization increased conversion by 40%'
      ]
    },
    {
      id: 'slide-5',
      type: 'content',
      title: 'Strategic Recommendations',
      bullets: [
        'Accelerate premium product development',
        'Expand into two new geographic markets',
        'Invest in AI capabilities for competitive advantage',
        'Scale customer success team to maintain retention'
      ]
    }
  ],
  metadata: {
    duration: 15,
    createdAt: '2024-12-20',
    lastModified: '2024-12-20',
    author: 'Demo User'
  }
}

export default function PresentationPreview() {
  const params = useParams()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [presentation, setPresentation] = useState(mockPresentation)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  // Auto-advance slides when playing
  useEffect(() => {
    if (!isPlaying) return

    const timer = setInterval(() => {
      setCurrentSlide(prev => {
        if (prev >= presentation.slides.length - 1) {
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, 5000) // 5 seconds per slide

    return () => clearInterval(timer)
  }, [isPlaying, presentation.slides.length])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          previousSlide()
          break
        case 'ArrowRight':
        case ' ':
          e.preventDefault()
          nextSlide()
          break
        case 'Escape':
          if (isFullscreen) setIsFullscreen(false)
          break
        case 'f':
        case 'F':
          setIsFullscreen(!isFullscreen)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  const nextSlide = () => {
    if (currentSlide < presentation.slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const previousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

  const renderSlideContent = (slide: any) => {
    switch (slide.type) {
      case 'title':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-16">
            <h1 className="text-6xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {slide.title}
            </h1>
            <p className="text-2xl text-gray-300 max-w-3xl">
              {slide.subtitle}
            </p>
          </div>
        )
      
      case 'content':
        return (
          <div className="p-16">
            <h2 className="text-4xl font-bold mb-12 text-white">
              {slide.title}
            </h2>
            <ul className="space-y-6">
              {slide.bullets.map((bullet: string, idx: number) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.3 }}
                  className="flex items-start gap-4 text-xl text-gray-300"
                >
                  <div className="w-3 h-3 bg-blue-400 rounded-full mt-3 flex-shrink-0" />
                  {bullet}
                </motion.li>
              ))}
            </ul>
          </div>
        )
      
      case 'chart':
        return (
          <div className="p-16">
            <h2 className="text-4xl font-bold mb-12 text-white">
              {slide.title}
            </h2>
            <div className="bg-white/10 rounded-2xl p-8 h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <ChevronRight className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-gray-400">Chart visualization would appear here</p>
              </div>
            </div>
          </div>
        )
      
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">Slide content</p>
          </div>
        )
    }
  }

  return (
    <div className={`min-h-screen bg-gray-950 text-white ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header (hidden in fullscreen) */}
      {!isFullscreen && (
        <div className="bg-gray-900/50 border-b border-gray-800 p-4">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold">{presentation.title}</h1>
                <p className="text-sm text-gray-400">
                  {presentation.slides.length} slides • {presentation.metadata.duration} min
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Link href={`/deck-builder/${params.id}`}>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => setIsExportModalOpen(true)}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Preview Area */}
      <div className="flex-1 relative">
        {/* Slide Display */}
        <div className="relative h-screen bg-gradient-to-br from-gray-900 to-gray-950">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              {renderSlideContent(presentation.slides[currentSlide])}
            </motion.div>
          </AnimatePresence>

          {/* Slide Number */}
          <div className="absolute top-8 right-8 bg-black/50 px-4 py-2 rounded-lg">
            <span className="text-sm text-gray-300">
              {currentSlide + 1} / {presentation.slides.length}
            </span>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={previousSlide}
            disabled={currentSlide === 0}
            className="absolute left-8 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 rounded-full flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/70 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextSlide}
            disabled={currentSlide === presentation.slides.length - 1}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 rounded-full flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/70 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-black/70 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4">
            {/* Playback Controls */}
            <Button
              onClick={previousSlide}
              disabled={currentSlide === 0}
              size="sm"
              variant="outline"
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            <Button
              onClick={togglePlayback}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>

            <Button
              onClick={nextSlide}
              disabled={currentSlide === presentation.slides.length - 1}
              size="sm"
              variant="outline"
            >
              <SkipForward className="w-4 h-4" />
            </Button>

            {/* Progress Bar */}
            <div className="flex items-center gap-2 mx-4">
              <Clock className="w-4 h-4 text-gray-400" />
              <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${((currentSlide + 1) / presentation.slides.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Additional Controls */}
            <Button
              onClick={() => setIsMuted(!isMuted)}
              size="sm"
              variant="outline"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>

            <Button
              onClick={() => setIsFullscreen(!isFullscreen)}
              size="sm"
              variant="outline"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Slide Thumbnails (not shown in fullscreen) */}
      {!isFullscreen && (
        <div className="bg-gray-900/50 border-t border-gray-800 p-4">
          <div className="container mx-auto">
            <div className="flex gap-4 overflow-x-auto pb-2">
              {presentation.slides.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlide(idx)}
                  className={`flex-shrink-0 w-32 h-20 bg-gray-800 rounded-lg border-2 transition-colors ${
                    currentSlide === idx ? 'border-blue-500' : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="w-full h-full rounded-lg flex items-center justify-center text-xs text-gray-400">
                    Slide {idx + 1}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      <ExportModal 
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        presentationId={params.id as string}
        presentationTitle={presentation.title}
      />
    </div>
  )
}