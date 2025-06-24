'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { 
  ChevronLeft, ChevronRight, Play, Save, Download, Settings, Plus, Grid, Eye, EyeOff,
  ZoomIn, ZoomOut, Undo, Redo, Copy, ClipboardPaste, Delete, Move, Type, Image as ImageIcon,
  BarChart3, Circle, Square, Triangle, Palette, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Underline, MoreHorizontal, Maximize2, Minimize2, RefreshCw, MessageSquare, Users,
  Brain
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import EnhancedSlideRenderer from './EnhancedSlideRenderer'
import WorldClassSlideRenderer from '@/components/slides/WorldClassSlideRenderer'
import { EnhancedAutoSave, type AutoSaveState } from '@/lib/auto-save/enhanced-auto-save'

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
  const [useWorldClassRenderer, setUseWorldClassRenderer] = useState(true)
  const [worldClassSlides, setWorldClassSlides] = useState<any[]>([])
  const [isCollaborativeMode, setIsCollaborativeMode] = useState(false)
  const [collaborators, setCollaborators] = useState<Array<{id: string, name: string, avatar: string, cursor?: {x: number, y: number}}>>([])
  const [comments, setComments] = useState<Array<{id: string, slideId: string, x: number, y: number, text: string, author: string, timestamp: number}>>([])
  const [showComments, setShowComments] = useState(false)
  
  // Auto-save state
  const [autoSaveInstance, setAutoSaveInstance] = useState<EnhancedAutoSave | null>(null)
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveState | null>(null)

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

  // Convert slides to WorldClassSlideRenderer format
  const convertToWorldClassSlides = useCallback(() => {
    return slides.map((slide, index) => ({
      id: slide.id,
      type: slide.title.toLowerCase().includes('title') || index === 0 ? 'title' : 
            slide.title.toLowerCase().includes('summary') ? 'executive_summary' :
            slide.title.toLowerCase().includes('data') || slide.title.toLowerCase().includes('overview') ? 'data_overview' :
            slide.title.toLowerCase().includes('recommendation') ? 'recommendations' :
            slide.aiInsights?.insightLevel === 'strategic' ? 'insight' :
            slide.aiInsights?.insightLevel === 'trend' ? 'trend_analysis' :
            slide.aiInsights?.insightLevel === 'anomaly' ? 'anomaly_detection' :
            'insight',
      title: slide.title,
      subtitle: slide.subtitle,
      content: {
        narrative: slide.content?.summary || slide.content,
        summary: slide.aiInsights?.dataStory || slide.content?.summary || slide.content,
        keyMetrics: slide.aiInsights?.keyFindings?.map((finding: string, idx: number) => ({
          name: `Metric ${idx + 1}`,
          value: finding,
          change: Math.random() > 0.5 ? `+${Math.floor(Math.random() * 20)}%` : `-${Math.floor(Math.random() * 10)}%`
        })) || [],
        recommendations: slide.aiInsights?.recommendations?.map((rec: string, idx: number) => ({
          title: `Recommendation ${idx + 1}`,
          description: rec,
          impact: ['High', 'Medium', 'Low'][idx % 3],
          timeline: ['Immediate', '1-3 months', '3-6 months'][idx % 3]
        })) || [],
        insights: slide.aiInsights ? [{
          title: slide.title,
          description: slide.aiInsights.dataStory || slide.content?.summary || 'Strategic insight',
          businessImplication: slide.aiInsights.businessImpact || 'Strategic business value',
          recommendation: slide.aiInsights.recommendations?.[0] || 'Take strategic action',
          confidence: slide.aiInsights.confidence || 85,
          evidence: {
            dataPoints: slide.aiInsights.keyFindings || []
          }
        }] : [],
        confidence: slide.aiInsights?.confidence || 85
      },
      charts: slide.charts?.map(chart => ({
        id: chart.id || `chart_${Date.now()}`,
        type: 'chart',
        chartType: chart.type || 'bar',
        title: chart.title || 'Data Visualization',
        description: chart.insights?.[0] || 'Strategic data insights',
        data: chart.data || [],
        xAxis: chart.config?.xAxisKey || 'name',
        yAxis: chart.config?.yAxisKey || 'value',
        configuration: chart.config || {},
        customization: {
          style: 'modern',
          visualUpgrades: ['gradient', 'shadow'],
          interactivity: ['hover', 'tooltip'],
          storytelling: [chart.hiddenPattern || 'Strategic insight'],
          innovation: ['animated-reveal']
        }
      })) || [],
      customization: {
        visualStyle: slide.style === 'mckinsey' ? 'executive' : 'futuristic',
        innovationLevel: 'advanced',
        designComplexity: 'moderate',
        layout: slide.layout || 'standard',
        animations: slide.animation,
        colorScheme: slide.customStyles?.accentColor ? [slide.customStyles.accentColor] : [],
        enableAnimations: true,
        enableInteractivity: true
      },
      metadata: {
        slideNumber: index + 1,
        narrativeRole: index === 0 ? 'setup' : 
                     index < slides.length / 2 ? 'build' :
                     index === Math.floor(slides.length * 0.7) ? 'climax' :
                     index < slides.length - 1 ? 'resolve' : 'inspire',
        visualImpact: slide.aiInsights?.insightLevel === 'strategic' ? 'dramatic' : 'moderate',
        innovationScore: 85,
        designComplexity: 'moderate'
      }
    }))
  }, [slides])

  // Update world class slides when slides change
  useEffect(() => {
    if (useWorldClassRenderer) {
      setWorldClassSlides(convertToWorldClassSlides())
    }
  }, [slides, useWorldClassRenderer, convertToWorldClassSlides])

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

  // Initialize auto-save system
  useEffect(() => {
    if (presentationId) {
      const autoSave = new EnhancedAutoSave({
        debounceMs: 3000, // 3 seconds
        maxRetries: 3,
        saveOnVisibilityChange: true,
        saveOnBeforeUnload: true,
        enableVersionHistory: true
      })
      
      autoSave.initialize(presentationId, setAutoSaveStatus)
      setAutoSaveInstance(autoSave)
      
      return () => {
        autoSave.destroy()
      }
    }
  }, [presentationId])

  // Auto-save when slides change
  useEffect(() => {
    if (autoSaveInstance && slides.length > 0) {
      const presentationData = {
        title: slides[0]?.title || 'Untitled Presentation',
        slides: slides,
        metadata: {
          currentSlideIndex,
          lastEditedAt: new Date().toISOString(),
          slideCount: slides.length,
          editingMode: useWorldClassRenderer ? 'world-class' : 'standard',
          zoom,
          fullscreen: isFullscreen
        }
      }
      
      autoSaveInstance.registerChange('slides_updated', presentationData)
    }
  }, [slides, autoSaveInstance, currentSlideIndex, useWorldClassRenderer, zoom, isFullscreen])

  // Comment creation function
  const createComment = useCallback((x: number, y: number) => {
    if (!showComments || !currentSlide) return
    
    const commentText = prompt('Add a comment:')
    if (commentText && commentText.trim()) {
      const newComment = {
        id: `comment_${Date.now()}`,
        slideId: currentSlide.id,
        x: x,
        y: y,
        text: commentText.trim(),
        author: 'Current User', // In a real app, this would be the logged-in user
        timestamp: Date.now()
      }
      setComments([...comments, newComment])
    }
  }, [showComments, currentSlide, comments])

  // Handle slide canvas double-click for comments
  const handleSlideDoubleClick = useCallback((event: React.MouseEvent) => {
    if (!showComments) return
    
    const rect = slideCanvasRef.current?.getBoundingClientRect()
    if (rect) {
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      createComment(x, y)
    }
  }, [showComments, createComment])

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
                  onClick={() => setUseWorldClassRenderer(!useWorldClassRenderer)}
                  className={cn(
                    "text-white hover:bg-gray-700",
                    useWorldClassRenderer ? "bg-blue-600 hover:bg-blue-700" : ""
                  )}
                >
                  <Brain className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle World-Class AI Renderer</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsCollaborativeMode(!isCollaborativeMode)}
                  className={cn(
                    "text-white hover:bg-gray-700",
                    isCollaborativeMode ? "bg-green-600 hover:bg-green-700" : ""
                  )}
                >
                  <Users className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle Collaborative Mode</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowComments(!showComments)}
                  className={cn(
                    "text-white hover:bg-gray-700",
                    showComments ? "bg-yellow-600 hover:bg-yellow-700" : ""
                  )}
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle Comments</TooltipContent>
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
                onDoubleClick={handleSlideDoubleClick}
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
                {useWorldClassRenderer && worldClassSlides.length > 0 ? (
                  <div className="absolute inset-0 overflow-hidden">
                    <div 
                      style={{ 
                        transform: `scale(${slideScale})`,
                        transformOrigin: 'top left',
                        width: SLIDE_WIDTH,
                        height: SLIDE_HEIGHT
                      }}
                    >
                      <WorldClassSlideRenderer
                        slides={worldClassSlides}
                        currentSlide={currentSlideIndex}
                        onSlideChange={goToSlide}
                        onSlideEdit={(slideId, updates) => {
                          // Update the corresponding slide in our slides array
                          const slideIndex = slides.findIndex(s => s.id === slideId)
                          if (slideIndex !== -1) {
                            const newSlides = [...slides]
                            newSlides[slideIndex] = { ...newSlides[slideIndex], ...updates }
                            setSlides(newSlides)
                            addToHistory(newSlides)
                          }
                        }}
                        isEditable={false}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                ) : (
                  <EnhancedSlideRenderer 
                    slide={currentSlide}
                    scale={slideScale}
                    isActive={true}
                  />
                )}

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

        {/* Collaborative Features Panel */}
        <AnimatePresence>
          {isCollaborativeMode && (
            <motion.div
              className="fixed right-4 top-1/2 transform -translate-y-1/2 w-80 bg-gray-800 rounded-lg border border-gray-700 shadow-2xl z-50"
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-white font-semibold flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Collaborators</span>
                </h3>
              </div>
              
              <div className="p-4 max-h-60 overflow-y-auto">
                {collaborators.length === 0 ? (
                  <div className="text-gray-400 text-center py-8">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No active collaborators</p>
                    <p className="text-sm mt-1">Share this presentation to collaborate</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {collaborators.map((collaborator) => (
                      <div key={collaborator.id} className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                          {collaborator.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="text-white text-sm font-medium">{collaborator.name}</div>
                          <div className="text-gray-400 text-xs">
                            {collaborator.cursor ? 'Active' : 'Viewing'}
                          </div>
                        </div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-gray-700">
                <Button 
                  size="sm" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    // Demo: Add a sample collaborator
                    const sampleCollaborator = {
                      id: `user_${Date.now()}`,
                      name: `User ${collaborators.length + 1}`,
                      avatar: '',
                      cursor: { x: Math.random() * 800, y: Math.random() * 600 }
                    }
                    setCollaborators([...collaborators, sampleCollaborator])
                  }}
                >
                  Invite Collaborator
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Comments Overlay */}
        {showComments && (
          <div className="absolute inset-0 pointer-events-none z-40">
            {comments
              .filter(comment => comment.slideId === currentSlide?.id)
              .map((comment) => (
                <motion.div
                  key={comment.id}
                  className="absolute pointer-events-auto"
                  style={{
                    left: `${comment.x}px`,
                    top: `${comment.y}px`
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="bg-yellow-400 text-black p-2 rounded-lg shadow-lg max-w-xs">
                    <div className="text-xs font-medium mb-1">{comment.author}</div>
                    <div className="text-sm">{comment.text}</div>
                    <div className="text-xs opacity-60 mt-1">
                      {new Date(comment.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  {/* Comment pointer */}
                  <div className="w-3 h-3 bg-yellow-400 transform rotate-45 -mt-1 ml-4"></div>
                </motion.div>
              ))}
          </div>
        )}

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
            {isCollaborativeMode && <span>• Collaborative Mode</span>}
            {collaborators.length > 0 && <span>• {collaborators.length} collaborator{collaborators.length === 1 ? '' : 's'}</span>}
          </div>
          
          <div className="flex items-center space-x-4">
            <span>Zoom: {Math.round(slideScale * 100)}%</span>
            {/* Auto-save status indicator */}
            {autoSaveStatus && (
              <div className="flex items-center space-x-2">
                <span className={cn(
                  "text-xs px-2 py-1 rounded flex items-center gap-1",
                  autoSaveStatus.status === 'saving' && "bg-yellow-500/20 text-yellow-400",
                  autoSaveStatus.status === 'saved' && "bg-green-500/20 text-green-400",
                  autoSaveStatus.status === 'error' && "bg-red-500/20 text-red-400",
                  autoSaveStatus.status === 'offline' && "bg-gray-500/20 text-gray-400",
                  autoSaveStatus.status === 'idle' && "bg-blue-500/20 text-blue-400"
                )}>
                  {autoSaveStatus.status === 'saving' && '💾 Saving...'}
                  {autoSaveStatus.status === 'saved' && '✅ Auto-saved'}
                  {autoSaveStatus.status === 'error' && '❌ Save failed'}
                  {autoSaveStatus.status === 'offline' && '📶 Offline'}
                  {autoSaveStatus.status === 'idle' && '📝 Ready'}
                </span>
                {autoSaveStatus.lastSaved && autoSaveStatus.status === 'saved' && (
                  <span className="text-xs text-gray-500">
                    {new Date(autoSaveStatus.lastSaved).toLocaleTimeString()}
                  </span>
                )}
              </div>
            )}
            {!autoSaveStatus && <span>• Ready</span>}
          </div>
        </motion.div>
      </div>
    </TooltipProvider>
  )
}