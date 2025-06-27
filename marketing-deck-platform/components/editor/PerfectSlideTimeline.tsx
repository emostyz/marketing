'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { 
  Play, Pause, SkipBack, SkipForward, RotateCcw, FastForward,
  Clock, Timer, Zap, Eye, Settings, Volume2, VolumeX,
  Layers, Grid, Maximize2, MousePointer, Sparkles, Crown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface Slide {
  id: string
  title: string
  duration?: number
  elements: any[]
  transition?: {
    type: string
    duration: number
    direction?: string
  }
  elementAnimations?: {
    [elementId: string]: {
      entrance: string
      delay: number
      duration: number
    }
  }
}

interface PerfectSlideTimelineProps {
  slides: Slide[]
  currentSlideIndex: number
  isPlaying?: boolean
  totalDuration?: number
  currentTime?: number
  onSlideChange?: (index: number) => void
  onPlay?: () => void
  onPause?: () => void
  onSeek?: (time: number) => void
  onSpeedChange?: (speed: number) => void
  onPreviewMode?: (enabled: boolean) => void
  className?: string
}

export default function PerfectSlideTimeline({
  slides,
  currentSlideIndex,
  isPlaying = false,
  totalDuration = 300, // 5 minutes default
  currentTime = 0,
  onSlideChange,
  onPlay,
  onPause,
  onSeek,
  onSpeedChange,
  onPreviewMode,
  className
}: PerfectSlideTimelineProps) {
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [previewMode, setPreviewMode] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  
  const timelineRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()

  // Calculate slide durations and positions
  const slideData = slides.map((slide, index) => {
    const duration = slide.duration || 30 // Default 30 seconds per slide
    const startTime = slides.slice(0, index).reduce((acc, s) => acc + (s.duration || 30), 0)
    const progress = totalDuration > 0 ? startTime / totalDuration : 0
    
    return {
      ...slide,
      duration,
      startTime,
      endTime: startTime + duration,
      progress: progress * 100,
      width: (duration / totalDuration) * 100
    }
  })

  const currentProgress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSlideClick = (index: number) => {
    onSlideChange?.(index)
    if (onSeek) {
      const slideStart = slideData[index]?.startTime || 0
      onSeek(slideStart)
    }
  }

  const handleTimelineClick = (event: React.MouseEvent) => {
    if (!timelineRef.current) return
    
    const rect = timelineRef.current.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const percentage = clickX / rect.width
    const seekTime = percentage * totalDuration
    
    onSeek?.(seekTime)
    
    // Find the slide at this time
    const slideIndex = slideData.findIndex(slide => 
      seekTime >= slide.startTime && seekTime <= slide.endTime
    )
    if (slideIndex !== -1) {
      onSlideChange?.(slideIndex)
    }
  }

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed)
    onSpeedChange?.(speed)
  }

  const togglePreviewMode = () => {
    const newPreviewMode = !previewMode
    setPreviewMode(newPreviewMode)
    onPreviewMode?.(newPreviewMode)
  }

  const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 2]

  return (
    <TooltipProvider>
      <Card className={cn("bg-gray-900/95 border-gray-700 shadow-xl", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              Perfect Timeline
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-500/30">
                {slides.length} Slides
              </Badge>
              <Badge variant="outline" className="text-xs text-blue-400 border-blue-500/30">
                {formatTime(totalDuration)}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Main Timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300">
                  {formatTime(currentTime)}
                </span>
                <span className="text-xs text-gray-500">/</span>
                <span className="text-sm text-gray-400">
                  {formatTime(totalDuration)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  isPlaying ? "bg-green-400 animate-pulse" : "bg-gray-600"
                )} />
                <span className="text-xs text-gray-400">
                  {isPlaying ? 'Playing' : 'Paused'}
                </span>
              </div>
            </div>

            {/* Timeline Bar */}
            <div
              ref={timelineRef}
              onClick={handleTimelineClick}
              className="relative h-12 bg-gray-800 rounded-lg border border-gray-600 cursor-pointer overflow-hidden"
            >
              {/* Slide Segments */}
              {slideData.map((slide, index) => (
                <motion.div
                  key={slide.id}
                  className={cn(
                    "absolute top-0 h-full border-r border-gray-600/50 transition-all duration-200",
                    index === currentSlideIndex 
                      ? "bg-blue-600/40 border-blue-400" 
                      : "bg-gray-700/50 hover:bg-gray-600/50"
                  )}
                  style={{
                    left: `${slide.progress}%`,
                    width: `${slide.width}%`
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSlideClick(index)
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Slide Info */}
                  <div className="p-2 h-full flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-white truncate">
                        {slide.title}
                      </span>
                      {slide.elementAnimations && Object.keys(slide.elementAnimations).length > 0 && (
                        <Sparkles className="w-3 h-3 text-yellow-400" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {slide.elements.length} elements
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatTime(slide.duration)}
                      </span>
                    </div>
                  </div>

                  {/* Transition Indicator */}
                  {slide.transition && (
                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-purple-400 rounded-tl" />
                  )}
                </motion.div>
              ))}

              {/* Progress Indicator */}
              <motion.div
                className="absolute top-0 w-0.5 h-full bg-yellow-400 shadow-lg shadow-yellow-400/50"
                style={{ left: `${currentProgress}%` }}
                animate={{ left: `${currentProgress}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />

              {/* Current Time Tooltip */}
              <motion.div
                className="absolute -top-8 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded border border-gray-600"
                style={{ left: `${currentProgress}%` }}
                animate={{ left: `${currentProgress}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {formatTime(currentTime)}
              </motion.div>
            </div>
          </div>

          <Separator className="bg-gray-700" />

          {/* Playback Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSlideClick(Math.max(0, currentSlideIndex - 1))}
                    disabled={currentSlideIndex === 0}
                    className="border-gray-600 text-gray-300 hover:border-blue-500/50 hover:text-blue-400"
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Previous Slide</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={isPlaying ? onPause : onPlay}
                    className={cn(
                      "border-gray-600 text-gray-300",
                      isPlaying 
                        ? "hover:border-red-500/50 hover:text-red-400"
                        : "hover:border-green-500/50 hover:text-green-400"
                    )}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isPlaying ? 'Pause' : 'Play'}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSlideClick(Math.min(slides.length - 1, currentSlideIndex + 1))}
                    disabled={currentSlideIndex === slides.length - 1}
                    className="border-gray-600 text-gray-300 hover:border-blue-500/50 hover:text-blue-400"
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Next Slide</TooltipContent>
              </Tooltip>
            </div>

            <div className="flex items-center gap-2">
              {/* Playback Speed */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">Speed:</span>
                <div className="flex border border-gray-600 rounded">
                  {playbackSpeeds.map((speed) => (
                    <button
                      key={speed}
                      onClick={() => handleSpeedChange(speed)}
                      className={cn(
                        "px-2 py-1 text-xs transition-colors",
                        playbackSpeed === speed
                          ? "bg-blue-600 text-white"
                          : "text-gray-400 hover:text-white hover:bg-gray-700"
                      )}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={cn(
                      "text-gray-400 hover:text-white",
                      !soundEnabled && "text-red-400 hover:text-red-300"
                    )}
                  >
                    {soundEnabled ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <VolumeX className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {soundEnabled ? 'Mute' : 'Unmute'} Sound Effects
                </TooltipContent>
              </Tooltip>

              {/* Preview Mode */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePreviewMode}
                    className={cn(
                      "text-gray-400 hover:text-white",
                      previewMode && "text-purple-400 hover:text-purple-300"
                    )}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle Preview Mode</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Advanced Controls */}
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden space-y-3"
              >
                <Separator className="bg-gray-700" />
                
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Settings className="w-4 h-4 text-gray-400" />
                    Advanced Timeline
                  </h4>

                  {/* Slide Details */}
                  <div className="space-y-2">
                    {slides.map((slide, index) => (
                      <motion.div
                        key={slide.id}
                        className={cn(
                          "flex items-center justify-between p-2 rounded border cursor-pointer transition-colors",
                          index === currentSlideIndex
                            ? "border-blue-500 bg-blue-900/20"
                            : "border-gray-600 hover:border-gray-500 hover:bg-gray-800/50"
                        )}
                        onClick={() => handleSlideClick(index)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-6 bg-gray-700 rounded flex items-center justify-center">
                            <span className="text-xs text-white">{index + 1}</span>
                          </div>
                          <div>
                            <p className="text-sm text-white truncate max-w-32">
                              {slide.title}
                            </p>
                            <p className="text-xs text-gray-400">
                              {slide.elements.length} elements
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {slide.transition && (
                            <Badge variant="outline" className="text-xs">
                              {slide.transition.type}
                            </Badge>
                          )}
                          <span className="text-xs text-gray-400">
                            {formatTime(slideData[index]?.duration || 30)}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle Advanced */}
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-gray-400 hover:text-white"
            >
              <Settings className="w-4 h-4 mr-2" />
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </Button>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}