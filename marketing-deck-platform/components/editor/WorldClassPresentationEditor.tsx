'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { 
  ChevronLeft, ChevronRight, Play, Save, Download, Settings, Plus, Grid, Eye, EyeOff,
  ZoomIn, ZoomOut, Undo, Redo, Copy, ClipboardPaste, Delete, Move, Type, Image as ImageIcon,
  BarChart3, Circle, Square, Triangle, Palette, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Underline, MoreHorizontal, Maximize2, Minimize2, RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import EnhancedSlideRenderer from './EnhancedSlideRenderer'

interface SlideElement {
  id: string
  type: 'text' | 'image' | 'chart' | 'shape'
  position: { x: number; y: number }
  size: { width: number; height: number }
  rotation: number
  content?: string
  style?: any
  isLocked?: boolean
  metadata?: any
}

interface Slide {
  id: string
  number: number
  title: string
  subtitle?: string
  content?: any
  elements: SlideElement[]
  background: any
  style?: string
  layout?: string
  animation?: any
  customStyles?: any
  charts?: any[]
  keyTakeaways?: string[]
  aiInsights?: any
  notes?: string
}

interface WorldClassPresentationEditorProps {
  presentationId?: string
  initialSlides?: any[]
  onSave?: (slides: Slide[]) => void
  onExport?: (format: string) => void
  onRegenerateSlide?: (slideIndex: number, customPrompt?: string) => Promise<any>
}

export default function WorldClassPresentationEditor({
  presentationId,
  initialSlides = [],
  onSave,
  onExport,
  onRegenerateSlide
}: WorldClassPresentationEditorProps) {
  // Convert initial slides to our format
  const convertInitialSlides = useCallback((slides: any[]): Slide[] => {
    return slides.map((slide, index) => ({
      id: slide.id || `slide_${index}`,
      number: slide.number || index + 1,
      title: slide.title || `Slide ${index + 1}`,
      subtitle: slide.subtitle,
      content: slide.content,
      elements: slide.elements || [],
      background: slide.background || { type: 'solid', value: '#0f172a' },
      style: slide.style || 'modern',
      layout: slide.layout || 'default',
      animation: slide.animation,
      customStyles: slide.customStyles,
      charts: slide.charts || [],
      keyTakeaways: slide.keyTakeaways || [],
      aiInsights: slide.aiInsights,
      notes: slide.notes || ''
    }))
  }, [])

  const [slides, setSlides] = useState<Slide[]>(() => convertInitialSlides(initialSlides))
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showThumbnails, setShowThumbnails] = useState(true)
  const [activeTab, setActiveTab] = useState('design')
  const [history, setHistory] = useState<Slide[][]>([slides])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [clipboard, setClipboard] = useState<SlideElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  const slideCanvasRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()

  // PowerPoint-like dimensions (16:9 aspect ratio)
  const SLIDE_WIDTH = 1280
  const SLIDE_HEIGHT = 720
  const THUMBNAIL_WIDTH = 180
  const THUMBNAIL_HEIGHT = 101

  const currentSlide = slides[currentSlideIndex]

  // Smooth animations for slide transitions
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95
    })
  }

  const thumbnailVariants = {
    idle: { scale: 1, y: 0 },
    hover: { scale: 1.05, y: -5 },
    active: { scale: 1.1, y: -8, boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)' }
  }

  // Navigation functions
  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlideIndex(index)
    }
  }, [slides.length])

  const nextSlide = useCallback(() => {
    if (currentSlideIndex < slides.length - 1) {
      goToSlide(currentSlideIndex + 1)
    }
  }, [currentSlideIndex, slides.length, goToSlide])

  const prevSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      goToSlide(currentSlideIndex - 1)
    }
  }, [currentSlideIndex, goToSlide])

  // History management
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

  // Element manipulation
  const copyElement = useCallback(() => {
    if (selectedElement) {
      const element = currentSlide.elements.find(el => el.id === selectedElement)
      if (element) {
        setClipboard({ ...element, id: `${element.id}_copy_${Date.now()}` })
      }
    }
  }, [selectedElement, currentSlide])

  const pasteElement = useCallback(() => {
    if (clipboard) {
      const newElement = {
        ...clipboard,
        id: `${clipboard.id}_paste_${Date.now()}`,
        position: {
          x: clipboard.position.x + 20,
          y: clipboard.position.y + 20
        }
      }
      
      const newSlides = [...slides]
      newSlides[currentSlideIndex].elements.push(newElement)
      setSlides(newSlides)
      addToHistory(newSlides)
      setSelectedElement(newElement.id)
    }
  }, [clipboard, slides, currentSlideIndex, addToHistory])

  const deleteElement = useCallback(() => {
    if (selectedElement) {
      const newSlides = [...slides]
      newSlides[currentSlideIndex].elements = newSlides[currentSlideIndex].elements.filter(
        el => el.id !== selectedElement
      )
      setSlides(newSlides)
      addToHistory(newSlides)
      setSelectedElement(null)
    }
  }, [selectedElement, slides, currentSlideIndex, addToHistory])

  // Slide regeneration
  const handleRegenerateSlide = useCallback(async () => {
    if (!onRegenerateSlide) return
    
    setIsRegenerating(true)
    try {
      const newSlideData = await onRegenerateSlide(currentSlideIndex)
      if (newSlideData) {
        const newSlides = [...slides]
        // Update the current slide with regenerated data while preserving manual edits
        newSlides[currentSlideIndex] = {
          ...newSlides[currentSlideIndex],
          title: newSlideData.title || newSlides[currentSlideIndex].title,
          content: newSlideData.content || newSlides[currentSlideIndex].content,
          charts: newSlideData.charts || newSlides[currentSlideIndex].charts,
          aiInsights: newSlideData.aiInsights || newSlides[currentSlideIndex].aiInsights
        }
        setSlides(newSlides)
        addToHistory(newSlides)
      }
    } finally {
      setIsRegenerating(false)
    }
  }, [onRegenerateSlide, currentSlideIndex, slides, addToHistory])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault()
            if (e.shiftKey) redo()
            else undo()
            break
          case 'c':
            e.preventDefault()
            copyElement()
            break
          case 'v':
            e.preventDefault()
            pasteElement()
            break
          case 's':
            e.preventDefault()
            onSave?.(slides)
            break
        }
      } else {
        switch (e.key) {
          case 'ArrowRight':
            e.preventDefault()
            nextSlide()
            break
          case 'ArrowLeft':
            e.preventDefault()
            prevSlide()
            break
          case 'Delete':
            e.preventDefault()
            deleteElement()
            break
          case 'F5':
            e.preventDefault()
            setIsPlaying(!isPlaying)
            break
          case 'F11':
            e.preventDefault()
            setIsFullscreen(!isFullscreen)
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, copyElement, pasteElement, nextSlide, prevSlide, deleteElement, onSave, slides, isPlaying, isFullscreen])

  // Calculate slide scale to fit viewport
  const calculateSlideScale = useCallback(() => {
    if (!slideCanvasRef.current) return 1
    
    const container = slideCanvasRef.current.parentElement
    if (!container) return 1
    
    const containerWidth = container.clientWidth - (showThumbnails ? 240 : 60)
    const containerHeight = container.clientHeight - 120 // Account for toolbar
    
    const scaleX = containerWidth / SLIDE_WIDTH
    const scaleY = containerHeight / SLIDE_HEIGHT
    
    return Math.min(scaleX, scaleY, zoom / 100)
  }, [showThumbnails, zoom])

  const slideScale = calculateSlideScale()

  return (
    <TooltipProvider>
      <div className={cn(
        "h-screen bg-gray-900 flex flex-col overflow-hidden",
        isFullscreen && "fixed inset-0 z-50"
      )}>
        {/* Top Toolbar */}
        <motion.div 
          className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between shadow-lg"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center space-x-4">
            {/* File Operations */}
            <div className="flex items-center space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onSave?.(slides)}
                    className="text-white hover:bg-gray-700"
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Save (Ctrl+S)</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onExport?.('pdf')}
                    className="text-white hover:bg-gray-700"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export</TooltipContent>
              </Tooltip>
            </div>

            <Separator orientation="vertical" className="h-6 bg-gray-600" />

            {/* Edit Operations */}
            <div className="flex items-center space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={undo}
                    disabled={historyIndex <= 0}
                    className="text-white hover:bg-gray-700 disabled:opacity-50"
                  >
                    <Undo className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={redo}
                    disabled={historyIndex >= history.length - 1}
                    className="text-white hover:bg-gray-700 disabled:opacity-50"
                  >
                    <Redo className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Redo (Ctrl+Shift+Z)</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={copyElement}
                    disabled={!selectedElement}
                    className="text-white hover:bg-gray-700 disabled:opacity-50"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy (Ctrl+C)</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={pasteElement}
                    disabled={!clipboard}
                    className="text-white hover:bg-gray-700 disabled:opacity-50"
                  >
                    <ClipboardPaste className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Paste (Ctrl+V)</TooltipContent>
              </Tooltip>
            </div>

            <Separator orientation="vertical" className="h-6 bg-gray-600" />

            {/* Insert Elements */}
            <div className="flex items-center space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
                    <Type className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add Text Box</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Insert Image</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Insert Chart</TooltipContent>
              </Tooltip>
            </div>

            <Separator orientation="vertical" className="h-6 bg-gray-600" />

            {/* AI Features */}
            <div className="flex items-center space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleRegenerateSlide}
                    disabled={!onRegenerateSlide || isRegenerating}
                    className="text-white hover:bg-gray-700 disabled:opacity-50"
                  >
                    <RefreshCw className={cn("w-4 h-4", isRegenerating && "animate-spin")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Regenerate Slide with AI</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Center - Slide Navigation */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={prevSlide}
              disabled={currentSlideIndex === 0}
              className="text-white hover:bg-gray-700 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <span className="text-white font-medium px-3 py-1 bg-gray-700 rounded-md">
              {currentSlideIndex + 1} / {slides.length}
            </span>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={nextSlide}
              disabled={currentSlideIndex === slides.length - 1}
              className="text-white hover:bg-gray-700 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Right - View Controls */}
          <div className="flex items-center space-x-4">
            {/* Zoom Controls */}
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setZoom(Math.max(25, zoom - 25))}
                className="text-white hover:bg-gray-700"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              
              <span className="text-white text-sm w-12 text-center">{zoom}%</span>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setZoom(Math.min(200, zoom + 25))}
                className="text-white hover:bg-gray-700"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6 bg-gray-600" />

            {/* View Options */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowThumbnails(!showThumbnails)}
                  className="text-white hover:bg-gray-700"
                >
                  {showThumbnails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle Slide Panel</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="text-white hover:bg-gray-700"
                >
                  <Play className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Start Slideshow (F5)</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="text-white hover:bg-gray-700"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle Fullscreen (F11)</TooltipContent>
            </Tooltip>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Slide Thumbnails Panel */}
          <AnimatePresence>
            {showThumbnails && (
              <motion.div 
                className="w-60 bg-gray-800 border-r border-gray-700 overflow-y-auto"
                initial={{ x: -240 }}
                animate={{ x: 0 }}
                exit={{ x: -240 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="p-4">
                  <h3 className="text-white font-semibold mb-4">Slides</h3>
                  <div className="space-y-3">
                    {slides.map((slide, index) => (
                      <motion.div
                        key={slide.id}
                        className={cn(
                          "relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200",
                          index === currentSlideIndex 
                            ? "border-blue-500 ring-2 ring-blue-500/30" 
                            : "border-gray-600 hover:border-gray-500"
                        )}
                        variants={thumbnailVariants}
                        initial="idle"
                        whileHover="hover"
                        animate={index === currentSlideIndex ? "active" : "idle"}
                        onClick={() => goToSlide(index)}
                      >
                        <div 
                          className="relative overflow-hidden"
                          style={{ width: THUMBNAIL_WIDTH, height: THUMBNAIL_HEIGHT }}
                        >
                          {/* Miniature slide preview */}
                          <div className="absolute inset-0 transform scale-[0.14] origin-top-left">
                            <EnhancedSlideRenderer 
                              slide={slide}
                              scale={1}
                              isActive={false}
                            />
                          </div>
                          
                          {/* Overlay with slide number */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-between p-2">
                            <div className="text-white text-xs font-semibold bg-black/40 backdrop-blur-sm rounded px-2 py-1">
                              {slide.number}
                            </div>
                            {slide.aiInsights?.confidence && (
                              <div className="text-blue-400 text-xs bg-blue-500/20 backdrop-blur-sm rounded px-2 py-1">
                                AI: {slide.aiInsights.confidence}%
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Add New Slide Button */}
                  <motion.button
                    className="w-full mt-4 p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-gray-500 transition-colors duration-200 text-gray-400 hover:text-gray-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Plus className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-sm">Add Slide</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Slide Editor */}
          <div className="flex-1 flex flex-col bg-gray-900">
            {/* Slide Canvas Container */}
            <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
              <motion.div
                ref={slideCanvasRef}
                className="relative bg-white rounded-lg shadow-2xl overflow-hidden"
                style={{
                  width: SLIDE_WIDTH * slideScale,
                  height: SLIDE_HEIGHT * slideScale,
                  transformOrigin: 'center center'
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {/* Slide Background */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: currentSlide?.background?.type === 'gradient' 
                      ? `linear-gradient(${currentSlide.background.gradient?.direction || '135deg'}, ${currentSlide.background.gradient?.from || '#0f172a'}, ${currentSlide.background.gradient?.to || '#1e293b'})`
                      : currentSlide?.background?.value || '#ffffff'
                  }}
                />

                {/* Enhanced Slide Content */}
                <EnhancedSlideRenderer 
                  slide={currentSlide}
                  scale={slideScale}
                  isActive={true}
                />

                {/* Draggable Elements Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <AnimatePresence>
                    {currentSlide?.elements?.map((element) => (
                      <motion.div
                        key={element.id}
                        className={cn(
                          "absolute cursor-move border-2 border-transparent rounded pointer-events-auto",
                          selectedElement === element.id && "border-blue-500 ring-2 ring-blue-500/30"
                        )}
                        style={{
                          left: element.position.x * slideScale,
                          top: element.position.y * slideScale,
                          width: element.size.width * slideScale,
                          height: element.size.height * slideScale,
                          transform: `rotate(${element.rotation}deg)`
                        }}
                        onClick={() => setSelectedElement(element.id)}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.02 }}
                        drag
                        dragMomentum={false}
                        onDragStart={() => setIsDragging(true)}
                        onDragEnd={() => setIsDragging(false)}
                      >
                        <div 
                          className="w-full h-full backdrop-blur-sm bg-black/20 rounded border border-white/20"
                          style={{
                            ...element.style,
                            fontSize: element.style?.fontSize ? `${element.style.fontSize * slideScale}px` : undefined
                          }}
                        >
                          {element.type === 'text' && (
                            <div className="w-full h-full flex items-center justify-center p-2">
                              <span className="text-white text-center">
                                {element.content}
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Slide Border for Visual Polish */}
                <div className="absolute inset-0 rounded-lg ring-1 ring-gray-200 pointer-events-none" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <motion.div 
          className="bg-gray-800 border-t border-gray-700 px-4 py-2 flex items-center justify-between text-sm text-gray-400"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center space-x-4">
            <span>Slide {currentSlideIndex + 1} of {slides.length}</span>
            {selectedElement && <span>• Element selected</span>}
            {isDragging && <span>• Dragging</span>}
          </div>
          
          <div className="flex items-center space-x-4">
            <span>Zoom: {Math.round(slideScale * 100)}%</span>
            <span>• Ready</span>
          </div>
        </motion.div>
      </div>
    </TooltipProvider>
  )
}