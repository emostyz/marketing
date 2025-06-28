'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { 
  ChevronLeft, ChevronRight, Play, Pause, Save, Download, Settings, Plus, Grid, Eye, EyeOff,
  ZoomIn, ZoomOut, Undo, Redo, Copy, ClipboardPaste, Delete, Move, Type, Image as ImageIcon,
  BarChart3, Circle, Square, Triangle, Palette, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Underline, MoreHorizontal, Maximize2, Minimize2, RefreshCw, MessageSquare, Users,
  Brain, Trash2, Layers, Group, Ungroup, ArrowUp, ArrowDown, ChevronsUp, ChevronsDown,
  Timer, MessageCircle, Target
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import SlideCanvas from './SlideCanvas'
import { EnhancedAutoSave, type AutoSaveState } from '@/lib/auto-save/enhanced-auto-save'
import UnifiedLayout from '@/components/layout/UnifiedLayout'
import PropertiesPanel from './PropertiesPanel'
import ChartEditor from './ChartEditor'
import ImageUploader from './ImageUploader'
import ShapeCreator from './ShapeCreator'
import BusinessContextWizard from './BusinessContextWizard'
import { PresentationPreview } from '@/components/deck-builder/PresentationPreview'

// Simple BusinessContext type for now
interface BusinessContext {
  companyName?: string
  industry?: string
  primaryGoal?: string
  targetAudience?: string
}

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
  chartData?: any[]
  chartType?: string
  isVisible?: boolean
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
  transition?: {
    type: 'slide' | 'fade' | 'zoom' | 'flip' | 'cube' | 'push'
    direction?: 'left' | 'right' | 'up' | 'down'
    duration?: number
    easing?: string
  }
  elementAnimations?: {
    [elementId: string]: {
      entrance: 'fadeIn' | 'slideIn' | 'zoomIn' | 'bounceIn' | 'flipIn'
      exit?: 'fadeOut' | 'slideOut' | 'zoomOut' | 'bounceOut' | 'flipOut'
      delay?: number
      duration?: number
    }
  }
}

interface WorldClassPresentationEditorProps {
  presentationId?: string
  initialSlides?: any[]
  onSave?: (slides: Slide[]) => void
  onExport?: (format: string) => void
  onRegenerateSlide?: (slideIndex: number, customPrompt?: string) => Promise<any>
  onAIEnhancement?: (slideId: string, request: string) => Promise<any>
  onAnalyzeData?: (dataPoints: any[]) => Promise<any>
  aiContext?: {
    businessGoals?: string[]
    timeframe?: string
    decisionMakers?: string[]
    originalData?: any
    analysisInsights?: any[]
  }
}

export default function WorldClassPresentationEditor({
  presentationId,
  initialSlides = [],
  onSave,
  onExport,
  onRegenerateSlide,
  onAIEnhancement,
  onAnalyzeData,
  aiContext
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
      background: slide.background || { type: 'solid', value: '#ffffff' },
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

  // Load presentation data if presentationId is provided
  useEffect(() => {
    if (presentationId && presentationId !== 'draft') {
      const loadPresentation = async () => {
        try {
          console.log('Loading presentation:', presentationId)
          const response = await fetch(`/api/presentations/${presentationId}`)
          if (response.ok) {
            const data = await response.json()
            if (data.slides && data.slides.length > 0) {
              const convertedSlides = convertInitialSlides(data.slides)
              setSlides(convertedSlides)
              console.log('Loaded presentation with', convertedSlides.length, 'slides')
            }
          } else {
            console.warn('Presentation not found, using default slides')
          }
        } catch (error) {
          console.error('Error loading presentation:', error)
        }
      }
      loadPresentation()
    }
  }, [presentationId, convertInitialSlides])

  const [slides, setSlides] = useState<Slide[]>(() => {
    const converted = convertInitialSlides(initialSlides)
    if (converted.length === 0) {
      return [{
        id: 'slide_1',
        number: 1,
        title: 'New Presentation',
        elements: [],
        background: { type: 'solid', value: '#ffffff' }
      }]
    }
    return converted
  })
  
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  const [showThumbnails, setShowThumbnails] = useState(true)
  const [activeTab, setActiveTab] = useState('design')
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(true)
  const [showChartEditor, setShowChartEditor] = useState(false)
  const [showImageUploader, setShowImageUploader] = useState(false)
  const [showShapeCreator, setShowShapeCreator] = useState(false)
  const [showBusinessWizard, setShowBusinessWizard] = useState(false)
  const [editingElement, setEditingElement] = useState<string | null>(null)
  const [showPresentationMode, setShowPresentationMode] = useState(false)
  const [draggedSlideIndex, setDraggedSlideIndex] = useState<number | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  
  // Advanced features state
  const [history, setHistory] = useState<Slide[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [selectedElements, setSelectedElements] = useState<string[]>([])
  const [groupedElements, setGroupedElements] = useState<{[groupId: string]: string[]}>({})
  const [showGrid, setShowGrid] = useState(false)
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [masterTemplate, setMasterTemplate] = useState<any>(null)
  const [showTransitionPanel, setShowTransitionPanel] = useState(false)

  const SLIDE_WIDTH = 1280
  const SLIDE_HEIGHT = 720
  const THUMBNAIL_WIDTH = 180
  const THUMBNAIL_HEIGHT = 101

  const currentSlide = slides[currentSlideIndex]

  // History management for undo/redo
  const saveToHistory = useCallback((newSlides: Slide[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push([...newSlides])
    
    // Limit history to 50 entries
    if (newHistory.length > 50) {
      newHistory.shift()
    } else {
      setHistoryIndex(prev => prev + 1)
    }
    
    setHistory(newHistory)
  }, [history, historyIndex])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1]
      setSlides([...previousState])
      setHistoryIndex(prev => prev - 1)
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      setSlides([...nextState])
      setHistoryIndex(prev => prev + 1)
    }
  }, [history, historyIndex])

  // Initialize history
  useEffect(() => {
    if (history.length === 0) {
      setHistory([slides])
      setHistoryIndex(0)
    }
  }, [slides, history.length])

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault()
            handleSave()
            break
          case 'z':
            e.preventDefault()
            if (e.shiftKey) {
              redo()
            } else {
              undo()
            }
            break
          case 'y':
            e.preventDefault()
            redo()
            break
          case 'g':
            e.preventDefault()
            if (e.shiftKey) {
              // Ungroup elements
              if (selectedElement) {
                const groupId = Object.keys(groupedElements).find(id => 
                  groupedElements[id].includes(selectedElement)
                )
                if (groupId) ungroupElements(groupId)
              }
            } else {
              // Group elements
              if (selectedElements.length > 1) {
                groupElements(selectedElements)
              }
            }
            break
          case 'a':
            e.preventDefault()
            // Select all elements on current slide
            const allElementIds = currentSlide.elements.map(el => el.id)
            setSelectedElements(allElementIds)
            if (allElementIds.length > 0) {
              setSelectedElement(allElementIds[0])
            }
            break
        }
      } else {
        switch (e.key) {
          case ' ':
            // Only trigger on space if not typing in an input field
            if (!['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
              e.preventDefault()
              setShowPresentationMode(true)
            }
            break
          case 'Escape':
            // Clear selection
            setSelectedElement(null)
            setSelectedElements([])
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedElements, selectedElement, groupedElements, currentSlide.elements])

  // Real element manipulation functions
  const addElement = useCallback((type: SlideElement['type'], position = { x: 100, y: 100 }) => {
    const newElement: SlideElement = {
      id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      position,
      size: { 
        width: type === 'text' ? 200 : type === 'chart' ? 400 : 150, 
        height: type === 'text' ? 60 : type === 'chart' ? 300 : 150 
      },
      rotation: 0,
      content: type === 'text' ? 'Double-click to edit' : 
               type === 'shape' ? 'rectangle' : '',
      style: {
        fontSize: 16,
        fontFamily: 'Inter',
        color: '#000000',
        backgroundColor: type === 'shape' ? '#3B82F6' : 'transparent',
        borderColor: '#1E40AF',
        borderWidth: 0,
        borderRadius: 0,
        textAlign: 'left',
        opacity: 1
      },
      chartData: type === 'chart' ? [
        { name: 'Q1', value: 400 },
        { name: 'Q2', value: 300 },
        { name: 'Q3', value: 500 },
        { name: 'Q4', value: 450 }
      ] : undefined,
      chartType: type === 'chart' ? 'bar' : undefined,
      metadata: type === 'chart' ? {
        title: 'Sample Chart',
        xAxis: 'name',
        yAxis: 'value',
        showGrid: true,
        showLegend: true
      } : undefined,
      isLocked: false,
      isVisible: true
    }

    const newSlides = [...slides]
    newSlides[currentSlideIndex] = {
      ...newSlides[currentSlideIndex],
      elements: [...newSlides[currentSlideIndex].elements, newElement]
    }
    
    setSlides(newSlides)
    setSelectedElement(newElement.id)
    
    if (type === 'chart') {
      setShowChartEditor(true)
      setEditingElement(newElement.id)
    } else if (type === 'image') {
      setShowImageUploader(true)
      setEditingElement(newElement.id)
    } else if (type === 'shape') {
      setShowShapeCreator(true)
      setEditingElement(newElement.id)
    }
  }, [slides, currentSlideIndex])

  const updateElement = useCallback((elementId: string, updates: Partial<SlideElement>) => {
    const newSlides = [...slides]
    const slideIndex = currentSlideIndex
    const elementIndex = newSlides[slideIndex].elements.findIndex(el => el.id === elementId)
    
    if (elementIndex !== -1) {
      newSlides[slideIndex].elements[elementIndex] = {
        ...newSlides[slideIndex].elements[elementIndex],
        ...updates
      }
      saveToHistory(slides) // Save current state before change
      setSlides(newSlides)
      // Auto-save will handle saving automatically
    }
  }, [slides, currentSlideIndex, onSave, saveToHistory])

  const deleteElement = useCallback((elementId: string) => {
    const newSlides = [...slides]
    newSlides[currentSlideIndex] = {
      ...newSlides[currentSlideIndex],
      elements: newSlides[currentSlideIndex].elements.filter(el => el.id !== elementId)
    }
    saveToHistory(slides) // Save current state before change
    setSlides(newSlides)
    setSelectedElement(null)
    // Auto-save will handle saving automatically
  }, [slides, currentSlideIndex, saveToHistory])

  const duplicateElement = useCallback((elementId: string) => {
    const element = slides[currentSlideIndex].elements.find(el => el.id === elementId)
    if (element) {
      const duplicatedElement = {
        ...element,
        id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        position: {
          x: element.position.x + 20,
          y: element.position.y + 20
        }
      }
      
      const newSlides = [...slides]
      newSlides[currentSlideIndex] = {
        ...newSlides[currentSlideIndex],
        elements: [...newSlides[currentSlideIndex].elements, duplicatedElement]
      }
      saveToHistory(slides) // Save current state before change
      setSlides(newSlides)
      setSelectedElement(duplicatedElement.id)
      // Auto-save will handle saving automatically
    }
  }, [slides, currentSlideIndex, saveToHistory])

  const addTextElement = useCallback(() => {
    addElement('text')
  }, [addElement])

  const addImageElement = useCallback(() => {
    addElement('image')
  }, [addElement])

  const addChartElement = useCallback(() => {
    addElement('chart')
  }, [addElement])

  const addShapeElement = useCallback(() => {
    addElement('shape')
  }, [addElement])

  // Element layering functions
  const bringToFront = useCallback((elementId: string) => {
    const newSlides = [...slides]
    const slide = newSlides[currentSlideIndex]
    const elementIndex = slide.elements.findIndex(el => el.id === elementId)
    
    if (elementIndex !== -1) {
      const element = slide.elements[elementIndex]
      slide.elements.splice(elementIndex, 1)
      slide.elements.push(element)
      
      saveToHistory(slides)
      setSlides(newSlides)
    }
  }, [slides, currentSlideIndex, saveToHistory])

  const sendToBack = useCallback((elementId: string) => {
    const newSlides = [...slides]
    const slide = newSlides[currentSlideIndex]
    const elementIndex = slide.elements.findIndex(el => el.id === elementId)
    
    if (elementIndex !== -1) {
      const element = slide.elements[elementIndex]
      slide.elements.splice(elementIndex, 1)
      slide.elements.unshift(element)
      
      saveToHistory(slides)
      setSlides(newSlides)
    }
  }, [slides, currentSlideIndex, saveToHistory])

  const moveLayerUp = useCallback((elementId: string) => {
    const newSlides = [...slides]
    const slide = newSlides[currentSlideIndex]
    const elementIndex = slide.elements.findIndex(el => el.id === elementId)
    
    if (elementIndex !== -1 && elementIndex < slide.elements.length - 1) {
      const temp = slide.elements[elementIndex]
      slide.elements[elementIndex] = slide.elements[elementIndex + 1]
      slide.elements[elementIndex + 1] = temp
      
      saveToHistory(slides)
      setSlides(newSlides)
    }
  }, [slides, currentSlideIndex, saveToHistory])

  const moveLayerDown = useCallback((elementId: string) => {
    const newSlides = [...slides]
    const slide = newSlides[currentSlideIndex]
    const elementIndex = slide.elements.findIndex(el => el.id === elementId)
    
    if (elementIndex > 0) {
      const temp = slide.elements[elementIndex]
      slide.elements[elementIndex] = slide.elements[elementIndex - 1]
      slide.elements[elementIndex - 1] = temp
      
      saveToHistory(slides)
      setSlides(newSlides)
    }
  }, [slides, currentSlideIndex, saveToHistory])

  // Element grouping functions
  const groupElements = useCallback((elementIds: string[]) => {
    if (elementIds.length < 2) return
    
    const groupId = `group_${Date.now()}`
    setGroupedElements(prev => ({
      ...prev,
      [groupId]: elementIds
    }))
    
    // Select the group (first element as primary)
    setSelectedElement(elementIds[0])
    setSelectedElements(elementIds)
    
    // Save to history
    saveToHistory(slides)
  }, [slides, saveToHistory])

  const ungroupElements = useCallback((groupId: string) => {
    const elementsInGroup = groupedElements[groupId]
    
    setGroupedElements(prev => {
      const newGroups = { ...prev }
      delete newGroups[groupId]
      return newGroups
    })
    
    // Clear selection
    setSelectedElement(null)
    setSelectedElements([])
    
    // Save to history
    saveToHistory(slides)
  }, [groupedElements, slides, saveToHistory])

  // Transition and animation functions
  const updateSlideTransition = useCallback((slideIndex: number, transition: Slide['transition']) => {
    const newSlides = [...slides]
    newSlides[slideIndex] = {
      ...newSlides[slideIndex],
      transition
    }
    setSlides(newSlides)
    saveToHistory(slides)
  }, [slides, saveToHistory])

  const updateElementAnimation = useCallback((elementId: string, animation: NonNullable<Slide['elementAnimations']>[string]) => {
    const newSlides = [...slides]
    const currentSlide = newSlides[currentSlideIndex]
    
    currentSlide.elementAnimations = {
      ...currentSlide.elementAnimations,
      [elementId]: animation
    }
    
    setSlides(newSlides)
    saveToHistory(slides)
  }, [slides, currentSlideIndex, saveToHistory])

  const removeElementAnimation = useCallback((elementId: string) => {
    const newSlides = [...slides]
    const currentSlide = newSlides[currentSlideIndex]
    
    if (currentSlide.elementAnimations) {
      const newAnimations = { ...currentSlide.elementAnimations }
      delete newAnimations[elementId]
      currentSlide.elementAnimations = newAnimations
    }
    
    setSlides(newSlides)
    saveToHistory(slides)
  }, [slides, currentSlideIndex, saveToHistory])

  const addNewSlide = useCallback(() => {
    const newSlide: Slide = {
      id: `slide_${Date.now()}`,
      number: slides.length + 1,
      title: `Slide ${slides.length + 1}`,
      elements: [],
      background: { type: 'solid', value: '#ffffff' }
    }
    
    const newSlides = [...slides, newSlide]
    setSlides(newSlides)
    setCurrentSlideIndex(slides.length)
    
    if (onSave) {
      onSave(newSlides)
    }
  }, [slides, onSave])

  const deleteSlide = useCallback((slideIndex: number) => {
    if (slides.length <= 1) return // Don't delete the last slide
    
    const newSlides = slides.filter((_, index) => index !== slideIndex)
    // Renumber slides
    const renumberedSlides = newSlides.map((slide, index) => ({
      ...slide,
      number: index + 1
    }))
    
    setSlides(renumberedSlides)
    
    // Adjust current slide index
    if (currentSlideIndex >= slideIndex) {
      setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))
    }
    
    if (onSave) {
      onSave(renumberedSlides)
    }
  }, [slides, currentSlideIndex, onSave])

  const duplicateSlide = useCallback((slideIndex: number) => {
    const slideToClone = slides[slideIndex]
    const duplicatedSlide: Slide = {
      ...slideToClone,
      id: `slide_${Date.now()}`,
      number: slides.length + 1,
      title: `${slideToClone.title} (Copy)`,
      elements: slideToClone.elements.map(element => ({
        ...element,
        id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }))
    }
    
    const newSlides = [...slides, duplicatedSlide]
    setSlides(newSlides)
    setCurrentSlideIndex(slides.length)
    
    if (onSave) {
      onSave(newSlides)
    }
  }, [slides, onSave])

  const moveSlide = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return
    
    const newSlides = [...slides]
    const [movedSlide] = newSlides.splice(fromIndex, 1)
    newSlides.splice(toIndex, 0, movedSlide)
    
    // Renumber slides
    const renumberedSlides = newSlides.map((slide, index) => ({
      ...slide,
      number: index + 1
    }))
    
    setSlides(renumberedSlides)
    
    // Update current slide index if needed
    if (currentSlideIndex === fromIndex) {
      setCurrentSlideIndex(toIndex)
    } else if (fromIndex < currentSlideIndex && toIndex >= currentSlideIndex) {
      setCurrentSlideIndex(currentSlideIndex - 1)
    } else if (fromIndex > currentSlideIndex && toIndex <= currentSlideIndex) {
      setCurrentSlideIndex(currentSlideIndex + 1)
    }
    
    if (onSave) {
      onSave(renumberedSlides)
    }
  }, [slides, currentSlideIndex, onSave])

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedSlideIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedSlideIndex !== null) {
      moveSlide(draggedSlideIndex, dropIndex)
      setDraggedSlideIndex(null)
    }
  }

  const handleDragEnd = () => {
    setDraggedSlideIndex(null)
  }

  const handleSave = useCallback(async () => {
    setSaveStatus('saving')
    try {
      if (onSave) {
        await onSave(slides)
        setSaveStatus('saved')
        // Show saved status for 2 seconds
        setTimeout(() => setSaveStatus('idle'), 2000)
      } else {
        // If no onSave callback, save to localStorage as fallback
        const presentationData = {
          id: presentationId || 'draft',
          slides,
          lastModified: new Date().toISOString(),
          version: '1.0'
        }
        localStorage.setItem(`presentation_${presentationId || 'draft'}`, JSON.stringify(presentationData))
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      }
    } catch (error) {
      console.error('Save failed:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }, [slides, onSave, presentationId])

  // Auto-save functionality
  const autoSaveFunction = useCallback(async (slidesToSave: Slide[]) => {
    if (onSave) {
      return await onSave(slidesToSave)
    } else {
      // Fallback to localStorage
      const presentationData = {
        id: presentationId || 'draft',
        slides: slidesToSave,
        lastModified: new Date().toISOString(),
        version: '1.0'
      }
      localStorage.setItem(`presentation_${presentationId || 'draft'}`, JSON.stringify(presentationData))
      return { success: true, method: 'localStorage' }
    }
  }, [onSave, presentationId])

  const autoSaveResult = useAutoSave(slides, autoSaveFunction, {
    enabled: true,
    debounceDelay: 1000, // Wait 1 second after last change
    interval: 15000, // Backup save every 15 seconds
    onSaveStart: () => setSaveStatus('saving'),
    onSaveSuccess: () => {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    },
    onSaveError: (error) => {
      console.error('Auto-save error:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  })

  // Expose auto-save status and functions
  const { 
    hasUnsavedChanges, 
    lastSaved, 
    saveError, 
    saveNow: triggerManualSave,
    getStatusText 
  } = autoSaveResult

  const handleExport = useCallback(async (format: string) => {
    try {
      if (onExport) {
        await onExport(format)
      } else {
        // Fallback export functionality
        const dataStr = JSON.stringify(slides, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `presentation_${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }, [slides, onExport])

  return (
    <UnifiedLayout requireAuth={true} hideFooter={true} className="bg-gray-950">
      <TooltipProvider>
        <div className="h-screen bg-gray-950 text-white flex flex-col overflow-hidden">
          {/* Top Toolbar */}
          <motion.div 
            className="bg-gray-900/50 border-b border-gray-800 px-4 py-2 flex items-center justify-between shadow-lg backdrop-blur-sm"
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
                      onClick={handleSave}
                      disabled={saveStatus === 'saving'}
                      className={cn(
                        "text-white hover:bg-gray-700/50",
                        saveStatus === 'saved' && "text-green-400",
                        saveStatus === 'error' && "text-red-400"
                      )}
                    >
                      <Save className={cn(
                        "w-4 h-4", 
                        saveStatus === 'saving' && "animate-spin"
                      )} />
                      {saveStatus === 'saving' && <span className="ml-1 text-xs">Saving...</span>}
                      {saveStatus === 'saved' && <span className="ml-1 text-xs">Saved</span>}
                      {saveStatus === 'error' && <span className="ml-1 text-xs">Error</span>}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save (Ctrl+S)</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleExport('json')}
                      className="text-white hover:bg-gray-700/50"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Export</TooltipContent>
                </Tooltip>
              </div>

              <Separator orientation="vertical" className="h-6 bg-gray-600" />

              {/* Add Elements */}
              <div className="flex items-center space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={addTextElement}
                      className="text-white hover:bg-gray-700/50"
                    >
                      <Type className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add Text</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={addImageElement}
                      className="text-white hover:bg-gray-700/50"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add Image</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={addChartElement}
                      className="text-white hover:bg-gray-700/50"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add Chart</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={addShapeElement}
                      className="text-white hover:bg-gray-700/50"
                    >
                      <Circle className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add Shape</TooltipContent>
                </Tooltip>
              </div>

              <Separator orientation="vertical" className="h-6 bg-gray-600" />

              {/* Advanced Edit Tools */}
              <div className="flex items-center space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={undo}
                      disabled={historyIndex <= 0}
                      className="text-white hover:bg-gray-700/50"
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
                      className="text-white hover:bg-gray-700/50"
                    >
                      <Redo className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowGrid(!showGrid)}
                      className={cn(
                        "text-white hover:bg-gray-700/50",
                        showGrid && "bg-gray-700/50"
                      )}
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Toggle Grid</TooltipContent>
                </Tooltip>
              </div>

              {/* Layering Controls */}
              {selectedElement && (
                <>
                  <Separator orientation="vertical" className="h-6 bg-gray-600" />
                  <div className="flex items-center space-x-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => bringToFront(selectedElement)}
                          className="text-white hover:bg-gray-700/50"
                        >
                          <ChevronsUp className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Bring to Front</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => moveLayerUp(selectedElement)}
                          className="text-white hover:bg-gray-700/50"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Move Up</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => moveLayerDown(selectedElement)}
                          className="text-white hover:bg-gray-700/50"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Move Down</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => sendToBack(selectedElement)}
                          className="text-white hover:bg-gray-700/50"
                        >
                          <ChevronsDown className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Send to Back</TooltipContent>
                    </Tooltip>
                  </div>
                </>
              )}

              {/* Grouping Controls */}
              {selectedElements.length > 1 && (
                <>
                  <Separator orientation="vertical" className="h-6 bg-gray-600" />
                  <div className="flex items-center space-x-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => groupElements(selectedElements)}
                          className="text-white hover:bg-gray-700/50"
                        >
                          <Group className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Group Elements (Ctrl+G)</TooltipContent>
                    </Tooltip>
                  </div>
                </>
              )}

              {/* Ungroup Controls - Show when a grouped element is selected */}
              {selectedElement && Object.values(groupedElements).some(group => group.includes(selectedElement)) && (
                <>
                  <Separator orientation="vertical" className="h-6 bg-gray-600" />
                  <div className="flex items-center space-x-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const groupId = Object.keys(groupedElements).find(id => 
                              groupedElements[id].includes(selectedElement!)
                            )
                            if (groupId) ungroupElements(groupId)
                          }}
                          className="text-white hover:bg-gray-700/50"
                        >
                          <Ungroup className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Ungroup Elements (Ctrl+Shift+G)</TooltipContent>
                    </Tooltip>
                  </div>
                </>
              )}

              <Separator orientation="vertical" className="h-6 bg-gray-600" />

              {/* AI Features */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowBusinessWizard(true)}
                    className="text-purple-400 hover:bg-purple-900/20 border border-purple-500/30"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    <span className="text-sm">AI Generate</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Generate slides with AI</TooltipContent>
              </Tooltip>
              
              <Separator orientation="vertical" className="h-6 bg-gray-600" />
              
              {/* Transitions & Animations */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowTransitionPanel(!showTransitionPanel)}
                    className={cn(
                      "text-amber-400 hover:bg-amber-900/20 border border-amber-500/30",
                      showTransitionPanel && "bg-amber-900/20"
                    )}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    <span className="text-sm">Transitions</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Configure slide transitions and animations</TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-6 bg-gray-600" />
              
              {/* Save Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={triggerManualSave || handleSave}
                    disabled={saveStatus === 'saving'}
                    className={cn(
                      "text-blue-400 hover:bg-blue-900/20 border border-blue-500/30",
                      saveStatus === 'saved' && "text-green-400 border-green-500/30",
                      saveStatus === 'error' && "text-red-400 border-red-500/30"
                    )}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {saveStatus === 'saving' ? 'Saving...' : 
                       saveStatus === 'saved' ? 'Saved' : 
                       saveStatus === 'error' ? 'Error' : 'Save'}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Save presentation (Ctrl+S)</TooltipContent>
              </Tooltip>
              
              <Separator orientation="vertical" className="h-6 bg-gray-600" />
              
              {/* Presentation Mode */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowPresentationMode(true)}
                    className="text-green-400 hover:bg-green-900/20 border border-green-500/30"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    <span className="text-sm">Present</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Start full-screen presentation</TooltipContent>
              </Tooltip>
            </div>

            <div className="flex items-center space-x-4">
              {/* Zoom Controls */}
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setZoom(Math.max(25, zoom - 25))}
                  className="text-white hover:bg-gray-700/50"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-300 min-w-[3rem] text-center">{zoom}%</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setZoom(Math.min(200, zoom + 25))}
                  className="text-white hover:bg-gray-700/50"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Main Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Slide Thumbnails */}
            {showThumbnails && (
              <motion.div 
                className="w-60 bg-gray-900/30 border-r border-gray-800 p-4 overflow-y-auto"
                initial={{ x: -240 }}
                animate={{ x: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="space-y-3">
                  {/* Add New Slide Button */}
                  <motion.button
                    onClick={addNewSlide}
                    className="w-full p-4 border-2 border-dashed border-gray-500 rounded-lg text-gray-400 hover:border-blue-500 hover:text-blue-400 transition-all duration-200 flex flex-col items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Plus className="w-8 h-8" />
                    <span className="text-sm font-medium">Add New Slide</span>
                  </motion.button>

                  {slides.map((slide, index) => (
                    <motion.div
                      key={slide.id}
                      className={cn(
                        "relative cursor-pointer rounded-lg border-2 transition-all duration-200 group",
                        currentSlideIndex === index 
                          ? "border-blue-500 shadow-lg shadow-blue-500/25" 
                          : "border-gray-600 hover:border-gray-500",
                        draggedSlideIndex === index && "opacity-50"
                      )}
                      onClick={() => setCurrentSlideIndex(index)}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      whileHover={{ scale: draggedSlideIndex === null ? 1.02 : 1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div 
                        className="relative overflow-hidden bg-white border border-gray-600 rounded"
                        style={{ width: THUMBNAIL_WIDTH, height: THUMBNAIL_HEIGHT }}
                      >
                        {/* Miniature slide preview */}
                        <div 
                          className="absolute inset-0 transform origin-top-left"
                          style={{ 
                            transform: `scale(${THUMBNAIL_WIDTH / SLIDE_WIDTH})`,
                            width: SLIDE_WIDTH,
                            height: SLIDE_HEIGHT
                          }}
                        >
                          <SlideCanvas
                            slide={slide}
                            selectedElement={null}
                            onElementSelect={() => {}}
                            onElementUpdate={() => {}}
                            onSlideUpdate={() => {}}
                            onElementDelete={deleteElement}
                            onElementDuplicate={duplicateElement}
                            zoom={100}
                            isEditable={false}
                            className="w-full h-full"
                          />
                        </div>
                        
                        {/* Overlay with slide number */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-between p-2">
                          <div className="text-white text-xs font-semibold bg-black/40 backdrop-blur-sm rounded px-2 py-1">
                            {slide.number}
                          </div>
                        </div>
                        
                        {/* Slide actions - only show on hover */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              duplicateSlide(index)
                            }}
                            className="p-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                            title="Duplicate slide"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          {slides.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteSlide(index)
                              }}
                              className="p-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
                              title="Delete slide"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Main Slide Editor */}
            <div className="flex-1 flex flex-col bg-gray-900">
              {/* Slide Canvas Container */}
              <div className="flex-1 overflow-hidden">
                {currentSlide && (
                  <SlideCanvas
                    slide={currentSlide}
                    selectedElement={selectedElement}
                    selectedElements={selectedElements}
                    onElementSelect={(elementId, event) => {
                      if (event?.ctrlKey || event?.metaKey) {
                        // Multi-selection with Ctrl/Cmd+click
                        if (elementId) {
                          if (selectedElements.includes(elementId)) {
                            // Remove from selection
                            const newSelection = selectedElements.filter(id => id !== elementId)
                            setSelectedElements(newSelection)
                            setSelectedElement(newSelection.length > 0 ? newSelection[0] : null)
                          } else {
                            // Add to selection
                            const newSelection = [...selectedElements, elementId]
                            setSelectedElements(newSelection)
                            setSelectedElement(elementId)
                          }
                        }
                      } else {
                        // Single selection
                        setSelectedElement(elementId)
                        setSelectedElements(elementId ? [elementId] : [])
                      }
                    }}
                    onElementUpdate={(elementId, updates) => {
                      updateElement(elementId, updates)
                    }}
                    onSlideUpdate={(slideId, updates) => {
                      const newSlides = [...slides]
                      const slideIndex = newSlides.findIndex(s => s.id === slideId)
                      if (slideIndex !== -1) {
                        newSlides[slideIndex] = { ...newSlides[slideIndex], ...updates }
                        setSlides(newSlides)
                        if (onSave) {
                          onSave(newSlides)
                        }
                      }
                    }}
                    onElementDelete={deleteElement}
                    onElementDuplicate={duplicateElement}
                    onElementDoubleClick={(elementId, elementType) => {
                      // Handle double-click to open appropriate editor
                      if (elementType === 'chart') {
                        setEditingElement(elementId)
                        setShowChartEditor(true)
                      } else if (elementType === 'image') {
                        setEditingElement(elementId)
                        setShowImageUploader(true)
                      } else if (elementType === 'shape') {
                        setEditingElement(elementId)
                        setShowShapeCreator(true)
                      }
                    }}
                    zoom={zoom}
                    isEditable={true}
                    showGrid={showGrid}
                    snapToGrid={snapToGrid}
                    className="w-full h-full"
                  />
                )}
              </div>
            </div>

            {/* Properties Panel */}
            {activeTab === 'design' && (
              <PropertiesPanel
                selectedElement={currentSlide.elements.find(el => el.id === selectedElement) || null}
                onElementUpdate={updateElement}
                onAddElement={addElement}
                onDeleteElement={deleteElement}
                onDuplicateElement={duplicateElement}
                isVisible={showPropertiesPanel}
                onToggleVisibility={() => setShowPropertiesPanel(!showPropertiesPanel)}
                locked={!!selectedElement}
              />
            )}
          </div>

          {/* Transition Configuration Panel */}
          <AnimatePresence>
            {showTransitionPanel && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-800 border-t border-gray-700 overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Transitions & Animations</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTransitionPanel(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Slide Transitions */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-amber-400 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Slide Transition
                      </h4>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Transition Type</label>
                          <div className="grid grid-cols-3 gap-2">
                            {['slide', 'fade', 'zoom', 'flip', 'cube', 'push'].map((type) => (
                              <Button
                                key={type}
                                variant="outline"
                                size="sm"
                                onClick={() => updateSlideTransition(currentSlideIndex, {
                                  ...currentSlide.transition,
                                  type: type as any
                                })}
                                className={cn(
                                  "text-xs",
                                  currentSlide.transition?.type === type
                                    ? "bg-amber-900/40 border-amber-500 text-amber-400"
                                    : "border-gray-600 text-gray-300 hover:border-amber-500/50"
                                )}
                              >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Direction</label>
                          <div className="grid grid-cols-2 gap-2">
                            {['left', 'right', 'up', 'down'].map((direction) => (
                              <Button
                                key={direction}
                                variant="outline"
                                size="sm"
                                onClick={() => updateSlideTransition(currentSlideIndex, {
                                  ...currentSlide.transition,
                                  direction: direction as any
                                })}
                                className={cn(
                                  "text-xs",
                                  currentSlide.transition?.direction === direction
                                    ? "bg-amber-900/40 border-amber-500 text-amber-400"
                                    : "border-gray-600 text-gray-300 hover:border-amber-500/50"
                                )}
                              >
                                {direction.charAt(0).toUpperCase() + direction.slice(1)}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Duration (ms)</label>
                          <input
                            type="range"
                            min="200"
                            max="2000"
                            step="100"
                            value={currentSlide.transition?.duration || 500}
                            onChange={(e) => updateSlideTransition(currentSlideIndex, {
                              ...currentSlide.transition,
                              duration: parseInt(e.target.value)
                            })}
                            className="w-full accent-amber-500"
                          />
                          <div className="text-xs text-gray-400 text-center mt-1">
                            {currentSlide.transition?.duration || 500}ms
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Element Animations */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-purple-400 flex items-center gap-2">
                        <Timer className="w-4 h-4" />
                        Element Animation
                      </h4>
                      
                      {selectedElement ? (
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">Entrance Effect</label>
                            <div className="grid grid-cols-2 gap-2">
                              {['fadeIn', 'slideIn', 'zoomIn', 'bounceIn', 'flipIn'].map((entrance) => (
                                <Button
                                  key={entrance}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateElementAnimation(selectedElement, {
                                    ...currentSlide.elementAnimations?.[selectedElement],
                                    entrance: entrance as any
                                  })}
                                  className={cn(
                                    "text-xs",
                                    currentSlide.elementAnimations?.[selectedElement]?.entrance === entrance
                                      ? "bg-purple-900/40 border-purple-500 text-purple-400"
                                      : "border-gray-600 text-gray-300 hover:border-purple-500/50"
                                  )}
                                >
                                  {entrance.replace(/([A-Z])/g, ' $1').trim()}
                                </Button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">Delay (ms)</label>
                            <input
                              type="range"
                              min="0"
                              max="2000"
                              step="100"
                              value={currentSlide.elementAnimations?.[selectedElement]?.delay || 0}
                              onChange={(e) => updateElementAnimation(selectedElement, {
                                ...currentSlide.elementAnimations?.[selectedElement],
                                delay: parseInt(e.target.value)
                              })}
                              className="w-full accent-purple-500"
                            />
                            <div className="text-xs text-gray-400 text-center mt-1">
                              {currentSlide.elementAnimations?.[selectedElement]?.delay || 0}ms
                            </div>
                          </div>

                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">Duration (ms)</label>
                            <input
                              type="range"
                              min="100"
                              max="1500"
                              step="50"
                              value={currentSlide.elementAnimations?.[selectedElement]?.duration || 300}
                              onChange={(e) => updateElementAnimation(selectedElement, {
                                ...currentSlide.elementAnimations?.[selectedElement],
                                duration: parseInt(e.target.value)
                              })}
                              className="w-full accent-purple-500"
                            />
                            <div className="text-xs text-gray-400 text-center mt-1">
                              {currentSlide.elementAnimations?.[selectedElement]?.duration || 300}ms
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeElementAnimation(selectedElement)}
                            className="w-full text-xs border-red-600 text-red-400 hover:bg-red-900/20"
                          >
                            Remove Animation
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center text-gray-400 text-sm py-8">
                          Select an element to configure animations
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Footer/Status Bar */}
          <motion.div 
            className="bg-gray-900/80 border-t border-gray-800 px-4 py-3 flex items-center justify-between text-sm text-gray-300 backdrop-blur-sm"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Live Editor</span>
              </div>
              
              <div className="text-gray-400">
                Slide {currentSlideIndex + 1} of {slides.length}
              </div>
              
              {selectedElements.length > 1 && (
                <div className="flex items-center space-x-2 text-purple-400">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>{selectedElements.length} elements selected</span>
                </div>
              )}
              
              {selectedElement && selectedElements.length <= 1 && (
                <div className="flex items-center space-x-2 text-blue-400">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Element selected</span>
                </div>
              )}
              
              {Object.keys(groupedElements).length > 0 && (
                <div className="flex items-center space-x-2 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>{Object.keys(groupedElements).length} groups</span>
                </div>
              )}
              
              <div className="text-gray-400">
                Elements: {currentSlide?.elements?.length || 0}
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className={cn(
                "flex items-center space-x-2 text-xs",
                saveStatus === 'saving' && "text-yellow-400",
                saveStatus === 'saved' && "text-green-400",
                saveStatus === 'error' && "text-red-400",
                saveStatus === 'idle' && hasUnsavedChanges && "text-orange-400",
                saveStatus === 'idle' && !hasUnsavedChanges && "text-gray-400"
              )}>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  saveStatus === 'saving' && "bg-yellow-400 animate-pulse",
                  saveStatus === 'saved' && "bg-green-400",
                  saveStatus === 'error' && "bg-red-400",
                  saveStatus === 'idle' && hasUnsavedChanges && "bg-orange-400 animate-pulse",
                  saveStatus === 'idle' && !hasUnsavedChanges && "bg-gray-400"
                )}></div>
                <span>
                  {saveStatus === 'saving' ? 'Auto-saving...' : 
                   saveStatus === 'saved' ? 'Auto-saved' : 
                   saveStatus === 'error' ? 'Save Error' :
                   hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'}
                </span>
                {lastSaved && saveStatus !== 'saving' && (
                  <span className="text-gray-500">
                    • {getStatusText ? getStatusText() : 'Recently saved'}
                  </span>
                )}
              </div>
              
              <div className="text-gray-400">
                Canvas: {SLIDE_WIDTH} × {SLIDE_HEIGHT}
              </div>
              
              <div className="text-gray-400">
                Zoom: {zoom}%
              </div>
              
              <div className="flex items-center space-x-2 text-gray-400">
                <span>Keyboard shortcuts:</span>
                <Badge variant="secondary" className="text-xs px-1 py-0.5">Ctrl+S</Badge>
                <span className="text-gray-500">Save</span>
                <Badge variant="secondary" className="text-xs px-1 py-0.5">Space</Badge>
                <span className="text-gray-500">Present</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {showChartEditor && (
            <ChartEditor
              isOpen={showChartEditor}
              datasetId={slides[0]?.metadata?.datasetId}
              uploadedData={slides[0]?.metadata?.uploadedData}
              chartConfig={editingElement ? {
                type: (currentSlide.elements.find(el => el.id === editingElement)?.chartType || 'bar') as any,
                title: currentSlide.elements.find(el => el.id === editingElement)?.content || 'Chart from Your Data',
                data: currentSlide.elements.find(el => el.id === editingElement)?.chartData || [],
                xAxis: 'name',
                yAxis: ['value'],
                colors: ['#3B82F6', '#EF4444', '#10B981'],
                showLegend: true,
                showGrid: true,
                animate: true,
                height: 300
              } : null}
              onSave={(chartConfig) => {
                if (editingElement) {
                  updateElement(editingElement, {
                    chartData: chartConfig.data || [],
                    chartType: chartConfig.type || 'bar',
                    content: chartConfig.title || 'Chart',
                    metadata: {
                      ...currentSlide.elements.find(el => el.id === editingElement)?.metadata,
                      title: chartConfig.title,
                      xAxis: chartConfig.xAxis,
                      yAxis: chartConfig.yAxis?.[0] || chartConfig.yAxis,
                      showGrid: chartConfig.showGrid,
                      showLegend: chartConfig.showLegend,
                      colors: chartConfig.colors
                    },
                    style: {
                      ...currentSlide.elements.find(el => el.id === editingElement)?.style,
                      colors: chartConfig.colors
                    }
                  })
                }
                setShowChartEditor(false)
                setEditingElement(null)
              }}
              onClose={() => {
                setShowChartEditor(false)
                setEditingElement(null)
              }}
            />
          )}
          
          {showImageUploader && (
            <ImageUploader
              isOpen={showImageUploader}
              onImageSelect={(image) => {
                if (editingElement) {
                  updateElement(editingElement, {
                    content: image.url,
                    size: {
                      width: Math.min(image.width, 400),
                      height: Math.min(image.height, 300)
                    },
                    metadata: {
                      ...currentSlide.elements.find(el => el.id === editingElement)?.metadata,
                      originalWidth: image.width,
                      originalHeight: image.height,
                      filename: image.name,
                      fileSize: image.size,
                      fileType: image.type
                    }
                  })
                }
                setShowImageUploader(false)
                setEditingElement(null)
              }}
              onClose={() => {
                setShowImageUploader(false)
                setEditingElement(null)
              }}
            />
          )}
          
          {showShapeCreator && (
            <ShapeCreator
              isOpen={showShapeCreator}
              onShapeCreate={(shapeConfig) => {
                if (editingElement) {
                  updateElement(editingElement, {
                    content: shapeConfig.type,
                    size: shapeConfig.size,
                    style: {
                      ...currentSlide.elements.find(el => el.id === editingElement)?.style,
                      backgroundColor: shapeConfig.style.fill,
                      borderColor: shapeConfig.style.stroke,
                      borderWidth: shapeConfig.style.strokeWidth,
                      borderRadius: shapeConfig.style.borderRadius || 0,
                      opacity: shapeConfig.style.opacity
                    },
                    metadata: {
                      ...currentSlide.elements.find(el => el.id === editingElement)?.metadata,
                      shapeType: shapeConfig.type,
                      shapeStyle: shapeConfig.style
                    }
                  })
                }
                setShowShapeCreator(false)
                setEditingElement(null)
              }}
              onClose={() => {
                setShowShapeCreator(false)
                setEditingElement(null)
              }}
            />
          )}
          
          {showBusinessWizard && (
            <BusinessContextWizard
              onComplete={async (context: BusinessContext, userData?: any[]) => {
                // Simple slide generation for now
                const newSlide: Slide = {
                  id: `slide_${Date.now()}`,
                  number: slides.length + 1,
                  title: `${context.companyName || 'Company'} Analysis`,
                  subtitle: context.primaryGoal || 'Business Overview',
                  elements: [{
                    id: `element_${Date.now()}`,
                    type: 'text',
                    position: { x: 100, y: 200 },
                    size: { width: 600, height: 200 },
                    rotation: 0,
                    content: `Welcome to ${context.companyName || 'Our Company'}\n\n${context.primaryGoal || 'Business objectives and analysis'}`,
                    style: {
                      fontSize: '24px',
                      color: '#000000',
                      fontFamily: 'Inter, sans-serif',
                      textAlign: 'center'
                    }
                  }],
                  background: { type: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
                  style: 'ai-generated',
                  layout: 'title'
                }
                
                setSlides([...slides, newSlide])
                setCurrentSlideIndex(slides.length)
                setShowBusinessWizard(false)
                
                if (onSave) {
                  onSave([...slides, newSlide])
                }
              }}
              onClose={() => setShowBusinessWizard(false)}
            />
          )}
          
          {showPresentationMode && (
            <PresentationPreview
              presentation={{
                title: 'Current Presentation',
                slides: slides.map(slide => ({
                  ...slide,
                  duration: 5 // 5 seconds per slide default
                }))
              }}
              isOpen={showPresentationMode}
              onClose={() => setShowPresentationMode(false)}
              startSlideIndex={currentSlideIndex}
            />
          )}
        </AnimatePresence>
      </TooltipProvider>
    </UnifiedLayout>
  )
}