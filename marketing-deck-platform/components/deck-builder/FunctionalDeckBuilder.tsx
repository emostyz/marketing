'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, Pause, SkipBack, SkipForward, Download, Share2, Save, 
  Plus, Trash2, Copy, Move, Layers, Type, Image, BarChart3, 
  Table, Video, Mic, Settings, Undo, Redo, ZoomIn, ZoomOut,
  Grid, AlignLeft, AlignCenter, AlignRight, Bold, Italic, 
  Underline, Palette, Eye, EyeOff, Lock, Unlock, MessageCircle,
  ChevronDown, ChevronRight, Search, Filter, MoreHorizontal,
  FileText, Square, Circle, Triangle, Upload
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/lib/auth/auth-context'
import { undoRedoSystem } from '@/lib/undo-redo-system'
import { FunctionalSlideElement } from './FunctionalSlideElement'
import { ChartEditingSystem } from './ChartEditingSystem'
import { TemplateLibrary } from './TemplateLibrary'
import { CollaborationPanel } from './CollaborationPanel'
import { PresentationPreview } from './PresentationPreview'
import { AnimationPanel } from './AnimationPanel'
import { Animation, Transition, animationEngine, transitionEngine } from '@/lib/animations-system'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import { useNotifications } from '@/components/ui/NotificationSystem'
import { TierLimitModal } from '@/components/ui/TierLimitModal'

interface SlideElement {
  id: string
  type: 'text' | 'image' | 'chart' | 'table' | 'video' | 'audio' | 'shape' | 'icon'
  position: { x: number; y: number; width: number; height: number; rotation: number }
  style: any
  content: any
  layer: number
  locked: boolean
  hidden: boolean
  animations: any[]
}

interface Slide {
  id: string
  title: string
  content: SlideElement[]
  template: string
  notes: string
  duration: number
  animations: Animation[]
  transition?: Transition
  background: any
  locked: boolean
  hidden: boolean
  thumbnail?: string
}

interface Presentation {
  id: string
  title: string
  slides: Slide[]
  theme: any
  settings: any
  collaborators: any[]
  lastModified: Date
}

interface FunctionalDeckBuilderProps {
  presentationId?: string
  onSave?: (presentation: Presentation) => void
  onExport?: (format: string) => void
}

export default function FunctionalDeckBuilder({ 
  presentationId, 
  onSave, 
  onExport 
}: FunctionalDeckBuilderProps) {
  const { user } = useAuth()
  const notifications = useNotifications()
  const [presentation, setPresentation] = useState<Presentation | null>(null)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [selectedElements, setSelectedElements] = useState<string[]>([])
  const [editingElementId, setEditingElementId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [showGrid, setShowGrid] = useState(false)
  const [panelMode, setPanelMode] = useState<'design' | 'animations' | 'transitions' | 'notes'>('design')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [propertiesCollapsed, setPropertiesCollapsed] = useState(false)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [collaborationMode, setCollaborationMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTool, setSelectedTool] = useState<string>('select')
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false)
  const [showChartEditor, setShowChartEditor] = useState(false)
  const [editingChart, setEditingChart] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [clipboard, setClipboard] = useState<SlideElement[]>([])
  
  // Tier management
  const [showTierLimitModal, setShowTierLimitModal] = useState(false)
  const [tierLimitType, setTierLimitType] = useState<'presentations' | 'slides' | 'storage' | 'exports' | 'features'>('presentations')
  const [currentTier] = useState<'free' | 'pro' | 'enterprise'>('free') // Would come from user context
  const [tierUsage] = useState({ presentations: 2, slides: 8, storage: 45, exports: 3 }) // Would come from API
  const [tierLimits] = useState({ free: { presentations: 3, slides: 10, storage: 50, exports: 5 } })
  
  const canvasRef = useRef<HTMLDivElement>(null)
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null)

  // Tier management functions
  const checkTierLimit = useCallback((type: keyof typeof tierUsage) => {
    const usage = tierUsage[type]
    const limit = tierLimits[currentTier][type]
    return usage >= limit
  }, [tierUsage, tierLimits, currentTier])

  const showTierLimitDialog = useCallback((type: 'presentations' | 'slides' | 'storage' | 'exports' | 'features') => {
    setTierLimitType(type)
    setShowTierLimitModal(true)
  }, [])

  const handleUpgrade = useCallback((tier: 'pro' | 'enterprise') => {
    // Would integrate with payment system
    console.log('Upgrading to:', tier)
    notifications.showSuccess('Upgrade Initiated', `Redirecting to ${tier} upgrade page...`)
    // Redirect to payment flow
  }, [notifications])

  // Initialize presentation
  useEffect(() => {
    if (presentationId && presentationId !== 'new') {
      loadPresentation(presentationId)
    } else {
      createNewPresentation()
    }
  }, [presentationId])

  // Auto-save functionality
  useEffect(() => {
    if (presentation && presentation.id) {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current)
      }
      autoSaveRef.current = setTimeout(() => {
        handleAutoSave()
      }, 2000)
    }
    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current)
      }
    }
  }, [presentation])

  const loadPresentation = async (id: string) => {
    try {
      const response = await fetch(`/api/presentations/${id}`)
      const data = await response.json()
      if (data.success) {
        setPresentation(data.data)
        undoRedoSystem.clear()
      }
    } catch (error) {
      console.error('Error loading presentation:', error)
    }
  }

  const createNewPresentation = () => {
    const newPresentation: Presentation = {
      id: 'new-' + Date.now(),
      title: 'Untitled Presentation',
      slides: [createBlankSlide()],
      theme: {
        colors: {
          primary: '#2563eb',
          secondary: '#64748b',
          accent: '#f59e0b',
          background: '#ffffff',
          text: '#1e293b'
        },
        fonts: {
          heading: 'Inter',
          body: 'Inter',
          monospace: 'JetBrains Mono'
        },
        spacing: 'comfortable'
      },
      settings: {
        aspectRatio: '16:9',
        slideSize: 'standard',
        defaultTransition: 'slide'
      },
      collaborators: [],
      lastModified: new Date()
    }
    setPresentation(newPresentation)
    undoRedoSystem.clear()
  }

  const createBlankSlide = (): Slide => ({
    id: 'slide-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
    title: 'Untitled Slide',
    content: [],
    template: 'blank',
    notes: '',
    duration: 5,
    animations: [],
    background: { type: 'solid', color: '#ffffff' },
    locked: false,
    hidden: false
  })

  const createElement = (type: string, position: { x: number; y: number }) => {
    const baseElement: SlideElement = {
      id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: type as any,
      position: { 
        x: position.x, 
        y: position.y, 
        width: 200, 
        height: 100, 
        rotation: 0 
      },
      style: {
        backgroundColor: type === 'text' ? 'transparent' : '#ffffff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        borderRadius: 4,
        opacity: 1,
        fontSize: 16,
        fontFamily: 'Inter',
        fontWeight: '400',
        color: '#1f2937',
        textAlign: 'left'
      },
      content: getDefaultContent(type),
      layer: (presentation?.slides[currentSlideIndex]?.content.length || 0) + 1,
      locked: false,
      hidden: false,
      animations: []
    }

    return baseElement
  }

  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'text':
        return { text: 'Click to edit text', html: '<p>Click to edit text</p>' }
      case 'image':
        return { src: '', alt: '', caption: '' }
      case 'chart':
        return { 
          type: 'bar', 
          data: [
            { name: 'Jan', value: 400 },
            { name: 'Feb', value: 300 },
            { name: 'Mar', value: 500 },
            { name: 'Apr', value: 280 }
          ], 
          title: 'Sample Chart',
          colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b']
        }
      case 'table':
        return {
          headers: ['Column 1', 'Column 2'],
          rows: [['Row 1 Col 1', 'Row 1 Col 2'], ['Row 2 Col 1', 'Row 2 Col 2']]
        }
      case 'shape':
        return { shape: 'rectangle', fillColor: '#3b82f6' }
      default:
        return {}
    }
  }

  const saveState = (actionType: string, description: string) => {
    if (!presentation) return
    undoRedoSystem.saveState(
      presentation.slides,
      currentSlideIndex,
      selectedElements,
      actionType,
      description
    )
  }

  const handleAutoSave = useCallback(async () => {
    if (!presentation || !user) return
    
    setIsAutoSaving(true)
    try {
      const method = presentation.id.startsWith('new-') ? 'POST' : 'PUT'
      const url = '/api/presentations'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...presentation,
          id: presentation.id.startsWith('new-') ? undefined : presentation.id
        })
      })

      const data = await response.json()
      
      if (data.success && presentation.id.startsWith('new-')) {
        setPresentation(prev => prev ? { ...prev, id: data.data.id } : null)
      }
    } catch (error) {
      console.error('Auto-save failed:', error)
    } finally {
      setIsAutoSaving(false)
    }
  }, [presentation, user])

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (selectedTool === 'select') {
      setSelectedElements([])
      return
    }

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = ((e.clientX - rect.left) / (zoom / 100)) - (canvasRef.current?.scrollLeft || 0)
    const y = ((e.clientY - rect.top) / (zoom / 100)) - (canvasRef.current?.scrollTop || 0)

    if (selectedTool !== 'select') {
      // Check tier limits for elements per slide
      const currentSlide = presentation.slides[currentSlideIndex]
      if (currentSlide && currentSlide.content.length >= tierLimits[currentTier].slides) {
        showTierLimitDialog('slides')
        return
      }

      saveState('add_element', `Added ${selectedTool} element`)
      const newElement = createElement(selectedTool, { x, y })
      addElementToSlide(newElement)
      setSelectedElements([newElement.id])
      setSelectedTool('select')
      
      notifications.showSuccess('Element Added', `${selectedTool} element has been added to your slide`)
    }
  }

  const addElementToSlide = (element: SlideElement) => {
    if (!presentation) return
    
    const newSlides = [...presentation.slides]
    newSlides[currentSlideIndex] = {
      ...newSlides[currentSlideIndex],
      content: [...newSlides[currentSlideIndex].content, element]
    }
    
    setPresentation({ ...presentation, slides: newSlides })
  }

  const updateElement = (elementId: string, updates: Partial<SlideElement>) => {
    if (!presentation) return
    
    const newSlides = [...presentation.slides]
    const slideContent = [...newSlides[currentSlideIndex].content]
    const elementIndex = slideContent.findIndex(el => el.id === elementId)
    
    if (elementIndex !== -1) {
      slideContent[elementIndex] = { ...slideContent[elementIndex], ...updates }
      newSlides[currentSlideIndex] = {
        ...newSlides[currentSlideIndex],
        content: slideContent
      }
      setPresentation({ ...presentation, slides: newSlides })
    }
  }

  const deleteSelectedElements = () => {
    if (!presentation || selectedElements.length === 0) return
    
    saveState('delete_elements', `Deleted ${selectedElements.length} element(s)`)
    
    const newSlides = [...presentation.slides]
    newSlides[currentSlideIndex] = {
      ...newSlides[currentSlideIndex],
      content: newSlides[currentSlideIndex].content.filter(el => !selectedElements.includes(el.id))
    }
    
    setPresentation({ ...presentation, slides: newSlides })
    setSelectedElements([])
  }

  const copySelectedElements = () => {
    if (!presentation || selectedElements.length === 0) return
    
    const elementsToCopy = presentation.slides[currentSlideIndex].content
      .filter(el => selectedElements.includes(el.id))
    
    setClipboard(elementsToCopy)
  }

  const pasteElements = () => {
    if (!presentation || clipboard.length === 0) return
    
    saveState('paste_elements', `Pasted ${clipboard.length} element(s)`)
    
    const newElements = clipboard.map(element => ({
      ...element,
      id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: {
        ...element.position,
        x: element.position.x + 20,
        y: element.position.y + 20
      }
    }))

    const newSlides = [...presentation.slides]
    newSlides[currentSlideIndex] = {
      ...newSlides[currentSlideIndex],
      content: [...newSlides[currentSlideIndex].content, ...newElements]
    }
    
    setPresentation({ ...presentation, slides: newSlides })
    setSelectedElements(newElements.map(el => el.id))
  }

  // Animation management functions
  const addAnimation = (animation: Omit<Animation, 'id'>) => {
    if (!presentation) return
    
    saveState('add_animation', `Added ${animation.name} animation`)
    
    const newAnimation: Animation = {
      ...animation,
      id: `anim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
    
    const newSlides = [...presentation.slides]
    newSlides[currentSlideIndex] = {
      ...newSlides[currentSlideIndex],
      animations: [...newSlides[currentSlideIndex].animations, newAnimation]
    }
    
    setPresentation({ ...presentation, slides: newSlides })
  }

  const updateAnimation = (animationId: string, updates: Partial<Animation>) => {
    if (!presentation) return
    
    const newSlides = [...presentation.slides]
    const slide = newSlides[currentSlideIndex]
    slide.animations = slide.animations.map(anim => 
      anim.id === animationId ? { ...anim, ...updates } : anim
    )
    
    setPresentation({ ...presentation, slides: newSlides })
  }

  const deleteAnimation = (animationId: string) => {
    if (!presentation) return
    
    saveState('delete_animation', 'Deleted animation')
    
    const newSlides = [...presentation.slides]
    newSlides[currentSlideIndex] = {
      ...newSlides[currentSlideIndex],
      animations: newSlides[currentSlideIndex].animations.filter(anim => anim.id !== animationId)
    }
    
    setPresentation({ ...presentation, slides: newSlides })
  }

  const updateSlideTransition = (transition: Transition) => {
    if (!presentation) return
    
    const newSlides = [...presentation.slides]
    newSlides[currentSlideIndex] = {
      ...newSlides[currentSlideIndex],
      transition
    }
    
    setPresentation({ ...presentation, slides: newSlides })
  }

  const previewSlideAnimations = async () => {
    const currentSlide = presentation?.slides[currentSlideIndex]
    if (!currentSlide) return
    
    // Clear existing animations
    animationEngine.stopCurrentAnimation()
    
    // Add animations to engine
    currentSlide.animations.forEach(anim => animationEngine.addAnimation(anim))
    
    try {
      await animationEngine.playSlideAnimations(currentSlide.id, 'auto')
    } catch (error) {
      console.error('Animation preview error:', error)
    }
    
    // Clean up
    currentSlide.animations.forEach(anim => animationEngine.removeAnimation(anim.id))
  }

  const addSlide = (template: string = 'blank', index?: number) => {
    if (!presentation) return

    // Check tier limits for total presentations/slides
    if (presentation.slides.length >= tierLimits[currentTier].presentations * 10) { // Assuming 10 slides per presentation average
      showTierLimitDialog('presentations')
      return
    }

    saveState('add_slide', 'Added new slide')
    
    const newSlide = createBlankSlide()
    newSlide.template = template
    
    const insertIndex = index !== undefined ? index : currentSlideIndex + 1
    const newSlides = [...presentation.slides]
    newSlides.splice(insertIndex, 0, newSlide)
    
    setPresentation({ ...presentation, slides: newSlides })
    setCurrentSlideIndex(insertIndex)
    
    notifications.showSuccess('Slide Added', 'New slide has been added to your presentation')
  }

  const deleteSlide = (index: number) => {
    if (!presentation || presentation.slides.length <= 1) return

    saveState('delete_slide', `Deleted slide ${index + 1}`)
    
    const newSlides = presentation.slides.filter((_, i) => i !== index)
    setPresentation({ ...presentation, slides: newSlides })
    
    if (currentSlideIndex >= newSlides.length) {
      setCurrentSlideIndex(newSlides.length - 1)
    }
  }

  const duplicateSlide = (index: number) => {
    if (!presentation) return

    saveState('duplicate_slide', `Duplicated slide ${index + 1}`)
    
    const slideToClone = presentation.slides[index]
    const newSlide = { 
      ...slideToClone, 
      id: 'slide-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      title: slideToClone.title + ' (Copy)',
      content: slideToClone.content.map(element => ({
        ...element,
        id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }))
    }
    
    const newSlides = [...presentation.slides]
    newSlides.splice(index + 1, 0, newSlide)
    
    setPresentation({ ...presentation, slides: newSlides })
    setCurrentSlideIndex(index + 1)
  }

  const handleUndo = () => {
    const previousState = undoRedoSystem.undo()
    if (previousState && presentation) {
      setPresentation({
        ...presentation,
        slides: previousState.slides
      })
      setCurrentSlideIndex(previousState.currentSlideIndex)
      setSelectedElements(previousState.selectedElements)
    }
  }

  const handleRedo = () => {
    const nextState = undoRedoSystem.redo()
    if (nextState && presentation) {
      setPresentation({
        ...presentation,
        slides: nextState.slides
      })
      setCurrentSlideIndex(nextState.currentSlideIndex)
      setSelectedElements(nextState.selectedElements)
    }
  }

  // Template selection
  const handleTemplateSelect = useCallback((template: any) => {
    if (!presentation) return
    
    try {
      // Apply template to current slide
      const currentSlide = presentation.slides[currentSlideIndex]
      if (!currentSlide) return

      // Save state for undo
      undoRedoSystem.saveState(
        presentation.slides,
        currentSlideIndex,
        selectedElements,
        'apply_template',
        `Applied ${template.name} template`
      )

      const updatedSlide = {
        ...currentSlide,
        template: template.id,
        background: template.background || currentSlide.background,
        // Apply template-specific elements if they exist
        content: template.elements ? [...template.elements] : currentSlide.content
      }

      const updatedSlides = [...presentation.slides]
      updatedSlides[currentSlideIndex] = updatedSlide

      setPresentation({
        ...presentation,
        slides: updatedSlides,
        theme: template.theme || presentation.theme
      })

      setShowTemplateLibrary(false)
      notifications.showSuccess('Template Applied', `${template.name} template has been applied successfully`)
    } catch (error) {
      console.error('Failed to apply template:', error)
      notifications.showError('Template Error', 'Failed to apply template. Please try again.')
    }
  }, [presentation, currentSlideIndex, selectedElements])

  // Chart update functionality
  const handleChartUpdate = useCallback((updates: any) => {
    if (!presentation || !editingChart) return

    try {
      const currentSlide = presentation.slides[currentSlideIndex]
      if (!currentSlide) return

      // Save state for undo
      undoRedoSystem.saveState(
        presentation.slides,
        currentSlideIndex,
        selectedElements,
        'update_chart',
        'Updated chart data'
      )

      // Find and update the chart element
      const updatedContent = currentSlide.content.map(element => {
        if (element.type === 'chart' && element.id === editingChart.id) {
          return {
            ...element,
            content: {
              ...element.content,
              ...updates
            }
          }
        }
        return element
      })

      const updatedSlide = {
        ...currentSlide,
        content: updatedContent
      }

      const updatedSlides = [...presentation.slides]
      updatedSlides[currentSlideIndex] = updatedSlide

      setPresentation({
        ...presentation,
        slides: updatedSlides
      })

      setShowChartEditor(false)
      setEditingChart(null)
      notifications.showSuccess('Chart Updated', 'Your chart has been updated successfully')
    } catch (error) {
      console.error('Failed to update chart:', error)
      notifications.showError('Chart Update Failed', 'Failed to update chart. Please try again.')
    }
  }, [presentation, currentSlideIndex, selectedElements, editingChart])

  const handleKeyboardShortcuts = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 's':
          e.preventDefault()
          handleAutoSave()
          break
        case 'z':
          e.preventDefault()
          if (e.shiftKey) {
            handleRedo()
          } else {
            handleUndo()
          }
          break
        case 'c':
          e.preventDefault()
          copySelectedElements()
          break
        case 'v':
          e.preventDefault()
          pasteElements()
          break
        case 'd':
          e.preventDefault()
          duplicateSlide(currentSlideIndex)
          break
        case 'n':
          e.preventDefault()
          addSlide()
          break
      }
    }
    
    switch (e.key) {
      case 'Delete':
      case 'Backspace':
        if (selectedElements.length > 0 && !editingElementId) {
          deleteSelectedElements()
        }
        break
      case 'ArrowLeft':
        if (!editingElementId && currentSlideIndex > 0) {
          setCurrentSlideIndex(currentSlideIndex - 1)
        }
        break
      case 'ArrowRight':
        if (!editingElementId && presentation && currentSlideIndex < presentation.slides.length - 1) {
          setCurrentSlideIndex(currentSlideIndex + 1)
        }
        break
    }
  }, [currentSlideIndex, selectedElements, editingElementId, presentation])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardShortcuts)
    return () => document.removeEventListener('keydown', handleKeyboardShortcuts)
  }, [handleKeyboardShortcuts])

  if (!presentation) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading presentation...</p>
        </div>
      </div>
    )
  }

  const currentSlide = presentation.slides[currentSlideIndex]

  return (
    <TooltipProvider>
      <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
        {/* Top Toolbar */}
        <div className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-semibold text-gray-900 min-w-0">
                <input
                  value={presentation.title}
                  onChange={(e) => setPresentation({ ...presentation, title: e.target.value })}
                  className="bg-transparent border-none outline-none focus:bg-gray-50 px-2 py-1 rounded"
                />
              </h1>
              {isAutoSaving && (
                <Badge variant="secondary" className="text-xs">
                  Auto-saving...
                </Badge>
              )}
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex items-center space-x-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleUndo}
                    disabled={!undoRedoSystem.canUndo()}
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
                    onClick={handleRedo}
                    disabled={!undoRedoSystem.canRedo()}
                  >
                    <Redo className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Redo (Ctrl+Shift+Z)</TooltipContent>
              </Tooltip>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            <Tabs value={selectedTool} onValueChange={setSelectedTool} className="w-auto">
              <TabsList className="grid grid-cols-7 w-auto">
                <TabsTrigger value="select" className="px-3">
                  <div className="w-4 h-4 border border-gray-400 bg-white"></div>
                </TabsTrigger>
                <TabsTrigger value="text">
                  <Type className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="image">
                  <Image className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="chart">
                  <BarChart3 className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="table">
                  <Table className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="shape">
                  <Square className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="templates">
                  <FileText className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 mr-4">
              <Label className="text-sm">Zoom:</Label>
              <Select value={zoom.toString()} onValueChange={(value) => setZoom(parseInt(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50%</SelectItem>
                  <SelectItem value="75">75%</SelectItem>
                  <SelectItem value="100">100%</SelectItem>
                  <SelectItem value="125">125%</SelectItem>
                  <SelectItem value="150">150%</SelectItem>
                  <SelectItem value="200">200%</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="ghost" size="sm" onClick={() => setShowGrid(!showGrid)}>
              <Grid className={`w-4 h-4 ${showGrid ? 'text-blue-600' : ''}`} />
            </Button>
            
            <Separator orientation="vertical" className="h-6" />
            
            <Button variant="ghost" size="sm" onClick={() => setShowPreview(true)}>
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => setCollaborationMode(!collaborationMode)}>
              <MessageCircle className="w-4 h-4 mr-2" />
              Collaborate
            </Button>
            
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => onExport?.('pdf')}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Slide Navigator */}
          <motion.div 
            initial={false}
            animate={{ width: sidebarCollapsed ? 60 : 280 }}
            transition={{ duration: 0.2 }}
            className="bg-white border-r border-gray-200 flex flex-col shadow-sm"
          >
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                {!sidebarCollapsed && (
                  <h3 className="font-medium text-gray-900">Slides</h3>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                >
                  {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>
              
              {!sidebarCollapsed && (
                <div className="mt-2 flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => addSlide()}>
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowTemplateLibrary(true)}>
                    <FileText className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-2">
                {presentation.slides.map((slide, index) => (
                  <motion.div
                    key={slide.id}
                    layout
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative group cursor-pointer rounded-lg border-2 transition-all ${ 
                      index === currentSlideIndex 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setCurrentSlideIndex(index)}
                  >
                    {!sidebarCollapsed ? (
                      <div className="p-3">
                        <div className="aspect-video bg-white rounded border mb-2 relative overflow-hidden">
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">Slide {index + 1}</span>
                          </div>
                          
                          {slide.hidden && (
                            <div className="absolute top-1 right-1">
                              <EyeOff className="w-3 h-3 text-gray-500" />
                            </div>
                          )}
                          
                          {slide.locked && (
                            <div className="absolute top-1 left-1">
                              <Lock className="w-3 h-3 text-gray-500" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-700 truncate">
                            {slide.title}
                          </span>
                          <span className="text-xs text-gray-500">{index + 1}</span>
                        </div>
                        
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                duplicateSlide(index)
                              }}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            {presentation.slides.length > 1 && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteSlide(index)
                                }}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 flex items-center justify-center">
                        <span className="text-xs font-medium">{index + 1}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </motion.div>

          {/* Main Canvas Area */}
          <div className="flex-1 flex flex-col bg-gray-100">
            <div className="flex-1 flex items-center justify-center p-8">
              <div 
                ref={canvasRef}
                className="relative bg-white rounded-lg shadow-lg overflow-hidden"
                style={{ 
                  width: `${720 * (zoom / 100)}px`, 
                  height: `${405 * (zoom / 100)}px`
                }}
                onClick={handleCanvasClick}
              >
                {showGrid && (
                  <div 
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                      backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
                      backgroundSize: '20px 20px'
                    }}
                  />
                )}
                
                <div 
                  className="absolute inset-0"
                  style={{ 
                    backgroundColor: currentSlide.background?.color || '#ffffff',
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'top left'
                  }}
                >
                  {currentSlide.content.map((element) => (
                    <FunctionalSlideElement
                      key={element.id}
                      element={element}
                      isSelected={selectedElements.includes(element.id)}
                      isEditing={editingElementId === element.id}
                      onUpdate={(updates) => updateElement(element.id, updates)}
                      onStartEdit={() => setEditingElementId(element.id)}
                      onStopEdit={() => setEditingElementId(null)}
                      onSelect={() => setSelectedElements([element.id])}
                      zoom={zoom}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Bottom Timeline */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}>
                  <SkipBack className="w-4 h-4" />
                </Button>
                
                <div className="flex-1 bg-gray-100 rounded-full h-2 relative">
                  <div 
                    className="absolute top-0 left-0 h-2 bg-blue-600 rounded-full transition-all"
                    style={{ width: `${((currentSlideIndex + 1) / presentation.slides.length) * 100}%` }}
                  />
                </div>
                
                <Button variant="ghost" size="sm" onClick={() => setCurrentSlideIndex(Math.min(presentation.slides.length - 1, currentSlideIndex + 1))}>
                  <SkipForward className="w-4 h-4" />
                </Button>
                
                <span className="text-sm text-gray-600">
                  {currentSlideIndex + 1} of {presentation.slides.length}
                </span>
              </div>
            </div>
          </div>

          {/* Right Properties Panel */}
          <motion.div 
            initial={false}
            animate={{ width: propertiesCollapsed ? 60 : 320 }}
            transition={{ duration: 0.2 }}
            className="bg-white border-l border-gray-200 flex flex-col shadow-sm"
          >
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                {!propertiesCollapsed && (
                  <h3 className="font-medium text-gray-900">Properties</h3>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setPropertiesCollapsed(!propertiesCollapsed)}
                >
                  {propertiesCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>
              
              {!propertiesCollapsed && (
                <Tabs value={panelMode} onValueChange={(value: any) => setPanelMode(value)} className="mt-2">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="design" className="text-xs">Design</TabsTrigger>
                    <TabsTrigger value="animations" className="text-xs">Animate</TabsTrigger>
                    <TabsTrigger value="transitions" className="text-xs">Transition</TabsTrigger>
                    <TabsTrigger value="notes" className="text-xs">Notes</TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            </div>
            
            {!propertiesCollapsed && (
              <ScrollArea className="flex-1">
                <div className="p-4">
                  <TabsContent value="design" className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Background</Label>
                      <div className="mt-2 grid grid-cols-4 gap-2">
                        {['#ffffff', '#f8fafc', '#1e293b', '#3b82f6', '#ef4444', '#10b981'].map((color) => (
                          <button
                            key={color}
                            className="w-8 h-8 rounded border-2 border-gray-200 hover:border-gray-400 transition-colors"
                            style={{ backgroundColor: color }}
                            onClick={() => {
                              const newSlides = [...presentation.slides]
                              newSlides[currentSlideIndex] = {
                                ...newSlides[currentSlideIndex],
                                background: { type: 'solid', color }
                              }
                              setPresentation({ ...presentation, slides: newSlides })
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {selectedElements.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Selected Element</Label>
                        <div className="mt-2 space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={deleteSelectedElements}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={copySelectedElements}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="animations" className="h-full p-0">
                    <AnimationPanel
                      selectedElements={selectedElements}
                      slideId={currentSlide.id}
                      animations={currentSlide.animations}
                      slideTransition={currentSlide.transition}
                      onAddAnimation={addAnimation}
                      onUpdateAnimation={updateAnimation}
                      onDeleteAnimation={deleteAnimation}
                      onUpdateTransition={updateSlideTransition}
                      onPreviewAnimations={previewSlideAnimations}
                    />
                  </TabsContent>
                  
                  <TabsContent value="transitions" className="space-y-4">
                    <div className="p-4">
                      <AnimationPanel
                        selectedElements={selectedElements}
                        slideId={currentSlide.id}
                        animations={currentSlide.animations}
                        slideTransition={currentSlide.transition}
                        onAddAnimation={addAnimation}
                        onUpdateAnimation={updateAnimation}
                        onDeleteAnimation={deleteAnimation}
                        onUpdateTransition={updateSlideTransition}
                        onPreviewAnimations={previewSlideAnimations}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="notes" className="space-y-4">
                    <Label className="text-sm font-medium">Speaker Notes</Label>
                    <textarea
                      value={currentSlide.notes}
                      onChange={(e) => {
                        const newSlides = [...presentation.slides]
                        newSlides[currentSlideIndex] = {
                          ...newSlides[currentSlideIndex],
                          notes: e.target.value
                        }
                        setPresentation({ ...presentation, slides: newSlides })
                      }}
                      className="w-full h-32 p-3 border border-gray-200 rounded-lg resize-none text-sm"
                      placeholder="Add your speaker notes here..."
                    />
                  </TabsContent>
                </div>
              </ScrollArea>
            )}
          </motion.div>
        </div>

        {/* Template Library Modal */}
        <TemplateLibrary 
          isOpen={showTemplateLibrary}
          onClose={() => setShowTemplateLibrary(false)}
          onSelectTemplate={handleTemplateSelect}
        />

        {/* Chart Editor Modal */}
        {showChartEditor && editingChart && (
          <ChartEditingSystem
            chartData={editingChart}
            onUpdateChart={handleChartUpdate}
            onClose={() => setShowChartEditor(false)}
            isOpen={showChartEditor}
          />
        )}

        {/* Presentation Preview */}
        {showPreview && (
          <PresentationPreview
            presentation={presentation}
            isOpen={showPreview}
            onClose={() => setShowPreview(false)}
            startSlideIndex={currentSlideIndex}
          />
        )}

        {/* Collaboration Panel Overlay */}
        <AnimatePresence>
          {collaborationMode && (
            <CollaborationPanel 
              presentation={presentation}
              onClose={() => setCollaborationMode(false)}
            />
          )}
        </AnimatePresence>

        {/* Tier Limit Modal */}
        <TierLimitModal
          isOpen={showTierLimitModal}
          onClose={() => setShowTierLimitModal(false)}
          currentTier={currentTier}
          limitType={tierLimitType}
          currentUsage={tierUsage[tierLimitType]}
          maxUsage={tierLimits[currentTier][tierLimitType]}
          onUpgrade={handleUpgrade}
        />
      </div>
    </TooltipProvider>
  )
}