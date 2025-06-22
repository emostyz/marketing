'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Maximize, Minimize, Settings, Clock, Eye, EyeOff,
  RotateCcw, RotateCw, Download, Share2, MessageCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/Card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface PresentationPreviewProps {
  presentation: any
  isOpen: boolean
  onClose: () => void
  startSlideIndex?: number
}

export function PresentationPreview({ 
  presentation, 
  isOpen, 
  onClose, 
  startSlideIndex = 0 
}: PresentationPreviewProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(startSlideIndex)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [volume, setVolume] = useState([75])
  const [isMuted, setIsMuted] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState('1x')
  const [showNotes, setShowNotes] = useState(false)
  const [autoAdvance, setAutoAdvance] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [mouseTimeout, setMouseTimeout] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isPlaying && autoAdvance) {
      const interval = setInterval(() => {
        if (currentSlideIndex < presentation.slides.length - 1) {
          setCurrentSlideIndex(prev => prev + 1)
        } else {
          setIsPlaying(false)
        }
      }, (presentation.slides[currentSlideIndex]?.duration || 5) * 1000)

      return () => clearInterval(interval)
    }
  }, [isPlaying, currentSlideIndex, autoAdvance, presentation.slides])

  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1))
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isPlaying])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault()
          nextSlide()
          break
        case 'ArrowLeft':
          e.preventDefault()
          prevSlide()
          break
        case 'Escape':
          if (isFullscreen) {
            setIsFullscreen(false)
          } else {
            onClose()
          }
          break
        case 'f':
        case 'F':
          toggleFullscreen()
          break
        case 'p':
        case 'P':
          togglePlayback()
          break
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [isOpen, currentSlideIndex, isFullscreen, isPlaying])

  const nextSlide = () => {
    if (currentSlideIndex < presentation.slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1)
      resetSlideTimer()
    }
  }

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1)
      resetSlideTimer()
    }
  }

  const goToSlide = (index: number) => {
    setCurrentSlideIndex(index)
    resetSlideTimer()
  }

  const togglePlayback = () => {
    setIsPlaying(prev => !prev)
    if (!isPlaying) {
      resetSlideTimer()
    }
  }

  const resetSlideTimer = () => {
    const slideDuration = presentation.slides[currentSlideIndex]?.duration || 5
    setTimeRemaining(slideDuration)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleMouseMove = () => {
    setShowControls(true)
    if (mouseTimeout) {
      clearTimeout(mouseTimeout)
    }
    const timeout = setTimeout(() => {
      if (isFullscreen) {
        setShowControls(false)
      }
    }, 3000)
    setMouseTimeout(timeout)
  }

  useEffect(() => {
    resetSlideTimer()
  }, [currentSlideIndex])

  if (!isOpen || !presentation) return null

  const currentSlide = presentation.slides[currentSlideIndex]
  const progress = ((currentSlideIndex + 1) / presentation.slides.length) * 100

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 bg-black z-50 flex flex-col ${isFullscreen ? 'cursor-none' : ''}`}
        onMouseMove={handleMouseMove}
      >
        {/* Top Controls */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
                    <X className="w-5 h-5" />
                  </Button>
                  <div className="text-white">
                    <h2 className="font-semibold">{presentation.title}</h2>
                    <p className="text-sm text-gray-300">
                      Slide {currentSlideIndex + 1} of {presentation.slides.length}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNotes(!showNotes)}
                    className="text-white hover:bg-white/20"
                  >
                    {showNotes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Slide Display */}
          <div className="flex-1 flex items-center justify-center p-8">
            <motion.div
              key={currentSlideIndex}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full h-full max-w-5xl max-h-[80vh] bg-white rounded-lg shadow-2xl overflow-hidden"
              style={{ aspectRatio: '16/9' }}
            >
              {/* Slide Content */}
              <div className="w-full h-full p-8 flex flex-col">
                <h1 className="text-4xl font-bold text-gray-900 mb-6">
                  {currentSlide?.title || `Slide ${currentSlideIndex + 1}`}
                </h1>
                
                {/* Mock slide content */}
                <div className="flex-1 grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Key Points</h2>
                    <ul className="space-y-2 text-lg text-gray-700">
                      <li>• First important point</li>
                      <li>• Second key insight</li>
                      <li>• Third critical finding</li>
                      <li>• Fourth strategic recommendation</li>
                    </ul>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-6 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-32 h-32 bg-blue-500 rounded-lg mx-auto mb-4"></div>
                      <p className="text-gray-600">Chart or Visual Content</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Speaker Notes Panel */}
          <AnimatePresence>
            {showNotes && (
              <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                className="w-80 bg-gray-900 text-white p-6 overflow-y-auto"
              >
                <h3 className="text-lg font-semibold mb-4">Speaker Notes</h3>
                <div className="space-y-4">
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      Slide {currentSlideIndex + 1}
                    </Badge>
                    <p className="text-sm text-gray-300">
                      {currentSlide?.notes || 'No notes available for this slide.'}
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-700">
                    <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
                      <Clock className="w-4 h-4" />
                      <span>Timing</span>
                    </div>
                    <p className="text-sm">
                      Duration: {currentSlide?.duration || 5} seconds
                    </p>
                    {isPlaying && (
                      <p className="text-sm text-yellow-400">
                        Time remaining: {timeRemaining}s
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Controls */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-4"
            >
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-white/20 rounded-full h-1">
                  <motion.div
                    className="bg-white rounded-full h-1 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                {/* Left Controls */}
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevSlide}
                    disabled={currentSlideIndex === 0}
                    className="text-white hover:bg-white/20"
                  >
                    <SkipBack className="w-5 h-5" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlayback}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextSlide}
                    disabled={currentSlideIndex === presentation.slides.length - 1}
                    className="text-white hover:bg-white/20"
                  >
                    <SkipForward className="w-5 h-5" />
                  </Button>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                    <div className="w-20">
                      <Slider
                        value={isMuted ? [0] : volume}
                        onValueChange={setVolume}
                        max={100}
                        step={1}
                        className="text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Center - Slide Navigator */}
                <div className="flex items-center space-x-2">
                  {presentation.slides.map((_: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentSlideIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/60'
                      }`}
                    />
                  ))}
                </div>

                {/* Right Controls */}
                <div className="flex items-center space-x-4">
                  <Select value={playbackSpeed} onValueChange={setPlaybackSpeed}>
                    <SelectTrigger className="w-20 h-8 bg-white/20 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5x">0.5x</SelectItem>
                      <SelectItem value="0.75x">0.75x</SelectItem>
                      <SelectItem value="1x">1x</SelectItem>
                      <SelectItem value="1.25x">1.25x</SelectItem>
                      <SelectItem value="1.5x">1.5x</SelectItem>
                      <SelectItem value="2x">2x</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="text-white hover:bg-white/20"
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Slide Thumbnails (Bottom) */}
        {!isFullscreen && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-2 bg-black/60 rounded-lg p-2 backdrop-blur-sm">
              {presentation.slides.slice(
                Math.max(0, currentSlideIndex - 2),
                Math.min(presentation.slides.length, currentSlideIndex + 3)
              ).map((slide: any, index: number) => {
                const slideIndex = Math.max(0, currentSlideIndex - 2) + index
                return (
                  <button
                    key={slideIndex}
                    onClick={() => goToSlide(slideIndex)}
                    className={`w-16 h-10 bg-white rounded border-2 transition-all ${
                      slideIndex === currentSlideIndex 
                        ? 'border-blue-500 scale-110' 
                        : 'border-transparent opacity-60 hover:opacity-80'
                    }`}
                  >
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">{slideIndex + 1}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}