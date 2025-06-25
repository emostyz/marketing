'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHotkeys } from 'react-hotkeys-hook'
import { useRouter } from 'next/navigation'
import Draggable from 'react-draggable'
import * as Toolbar from '@radix-ui/react-toolbar'
import * as Tooltip from '@radix-ui/react-tooltip'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { HexColorPicker } from 'react-colorful'
import { 
  Bold, Italic, Underline, Type, Image, BarChart3, Shapes,
  AlignLeft, AlignCenter, AlignRight, Layers, Trash2,
  Undo2, Redo2, Save, Download, Share2, Play, Grid,
  Lock, Unlock, Group, Ungroup, BringToFront, SendToBack,
  ArrowLeft, Check, AlertCircle, Plus, Minus, Menu,
  ChevronDown, Eye, Settings, Palette, Square, Circle,
  Triangle, Star, Heart, Upload, PaintBucket, MousePointer
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth/auth-context'
import { useAutoSave } from '@/hooks/useAutoSave'
import { SaveStatusIndicator } from '@/components/ui/SaveStatusIndicator'
import { ModernButton } from '@/components/ui/ModernButton'
import { cn } from '@/lib/utils'
import { pageTransitions } from '@/lib/animations/transitions'

type SlideElementType = 'select' | 'text' | 'image' | 'chart' | 'shape'

interface SlideElement {
  id: string
  type: Exclude<SlideElementType, 'select'>
  position: { x: number; y: number }
  size: { width: number; height: number }
  rotation?: number
  content?: any
  style?: any
  zIndex?: number
}

interface Slide {
  id: string
  title: string
  elements: SlideElement[]
  background: string
  theme: string
}

// Mock slides data with better structure
const mockSlides: Slide[] = [
  {
    id: '1',
    title: 'Title Slide',
    background: '#ffffff',
    theme: 'modern',
    elements: [
      {
        id: 'title-1',
        type: 'text',
        position: { x: 100, y: 180 },
        size: { width: 760, height: 80 },
        zIndex: 1,
        content: { 
          text: 'Q4 Sales Presentation', 
          fontSize: 48, 
          fontWeight: 'bold', 
          color: '#1a202c',
          fontFamily: 'Inter, sans-serif',
          textAlign: 'left'
        },
        style: {}
      },
      {
        id: 'subtitle-1',
        type: 'text',
        position: { x: 100, y: 280 },
        size: { width: 760, height: 40 },
        zIndex: 2,
        content: { 
          text: 'Strategic Review & Forward Outlook', 
          fontSize: 24, 
          color: '#4a5568',
          fontFamily: 'Inter, sans-serif',
          textAlign: 'left'
        },
        style: {}
      }
    ]
  },
  {
    id: '2',
    title: 'Revenue Growth',
    background: '#ffffff',
    theme: 'modern',
    elements: []
  }
]

const SHAPE_TYPES = [
  { type: 'rectangle', icon: Square, name: 'Rectangle' },
  { type: 'circle', icon: Circle, name: 'Circle' },
  { type: 'triangle', icon: Triangle, name: 'Triangle' },
  { type: 'star', icon: Star, name: 'Star' },
  { type: 'heart', icon: Heart, name: 'Heart' }
]

const CHART_TYPES = [
  { type: 'bar', name: 'Bar Chart' },
  { type: 'line', name: 'Line Chart' },
  { type: 'pie', name: 'Pie Chart' },
  { type: 'area', name: 'Area Chart' }
]

export function FunctionalEditor({ deckId }: { deckId?: string }) {
  const { user } = useAuth()
  const [slides, setSlides] = useState<Slide[]>(mockSlides)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [selectedElements, setSelectedElements] = useState<Set<string>>(new Set())
  const [selectedElement, setSelectedElement] = useState<SlideElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const [zoom, setZoom] = useState(100)
  const [deckTitle, setDeckTitle] = useState('Q4 Sales Presentation')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [activeColorTarget, setActiveColorTarget] = useState<'text' | 'background' | 'fill'>('text')
  const [tool, setTool] = useState<SlideElementType>('select')
  const [history, setHistory] = useState<Slide[][]>([mockSlides])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [presentationId, setPresentationId] = useState<string>(deckId || `presentation_${Date.now()}`)
  const router = useRouter()
  
  const currentSlide = slides[currentSlideIndex]
  
  // Prepare presentation data for auto-save
  const presentationData = {
    id: presentationId,
    title: deckTitle,
    slides: slides,
    userId: user?.id,
    status: 'draft' as const,
    metadata: {
      slideCount: slides.length,
      currentSlide: currentSlideIndex,
      lastModified: new Date().toISOString(),
      version: historyIndex + 1,
      tool: tool,
      zoom: zoom
    }
  }

  // Auto-save function that persists to database
  const savePresentationData = useCallback(async (data: typeof presentationData) => {
    try {
      const response = await fetch('/api/presentations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: data.id,
          title: data.title,
          slides: data.slides,
          status: data.status,
          isPublic: false,
          metadata: data.metadata
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save presentation')
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Auto-save error:', error)
      throw error
    }
  }, [])

  // Use the auto-save hook
  const autoSaveConfig = useAutoSave(presentationData, savePresentationData, {
    enabled: !!user, // Only auto-save for authenticated users
    interval: 15000, // Auto-save every 15 seconds
    debounceDelay: 2000, // Wait 2 seconds after last change
    conflictResolution: 'prompt' // Prompt user on conflicts
  })

  // Load existing presentation on mount
  useEffect(() => {
    const loadPresentation = async () => {
      if (deckId && user) {
        try {
          const response = await fetch(`/api/presentations/${deckId}`)
          if (response.ok) {
            const presentation = await response.json()
            if (presentation.slides && Array.isArray(presentation.slides)) {
              setSlides(presentation.slides)
              setDeckTitle(presentation.title || 'Untitled Presentation')
              // Restore metadata if available
              if (presentation.metadata) {
                setCurrentSlideIndex(presentation.metadata.currentSlide || 0)
                setZoom(presentation.metadata.zoom || 100)
              }
            }
          }
        } catch (error) {
          console.error('Failed to load presentation:', error)
        }
      }
    }

    loadPresentation()
  }, [deckId, user])
  
  // History management
  const saveToHistory = useCallback((newSlides: Slide[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newSlides)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])
  
  // Hotkeys
  useHotkeys('cmd+z', (e) => {
    e.preventDefault()
    undo()
  })
  useHotkeys('cmd+shift+z', (e) => {
    e.preventDefault()
    redo()
  })
  useHotkeys('cmd+s', (e) => {
    e.preventDefault()
    save()
  })
  useHotkeys('cmd+d', (e) => {
    e.preventDefault()
    duplicateSelected()
  })
  useHotkeys('delete', () => deleteSelected())
  useHotkeys('escape', () => {
    setSelectedElements(new Set())
    setSelectedElement(null)
    setTool('select')
  })
  
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setSlides(history[historyIndex - 1])
      toast.success('Undid last action')
    }
  }, [history, historyIndex])
  
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setSlides(history[historyIndex + 1])
      toast.success('Redid action')
    }
  }, [history, historyIndex])
  
  const save = useCallback(() => {
    toast.success('Presentation saved')
  }, [])
  
  const updateSlides = useCallback((newSlides: Slide[]) => {
    setSlides(newSlides)
    saveToHistory(newSlides)
  }, [saveToHistory])
  
  const addElement = useCallback((type: SlideElementType, position?: {x: number, y: number}) => {
    if (type === 'select') return;
    const newElement: SlideElement = {
      id: `${type}-${Date.now()}`,
      type: type as Exclude<SlideElementType, 'select'>,
      position: position || { x: 200, y: 200 },
      size: type === 'text' ? { width: 300, height: 50 } : { width: 200, height: 150 },
      zIndex: currentSlide.elements.length + 1,
      content: type === 'text' ? { 
        text: 'Click to edit text', 
        fontSize: 16, 
        color: '#000000',
        fontFamily: 'Inter, sans-serif',
        textAlign: 'left'
      } : type === 'chart' ? {
        type: 'bar',
        title: 'Sample Chart',
        data: [
          { name: 'A', value: 20 },
          { name: 'B', value: 40 },
          { name: 'C', value: 30 },
          { name: 'D', value: 60 }
        ]
      } : type === 'shape' ? {
        shapeType: 'rectangle',
        fillColor: '#3b82f6',
        strokeColor: '#1e40af',
        strokeWidth: 2
      } : {},
      style: {}
    }
    const updatedSlides = [...slides]
    updatedSlides[currentSlideIndex].elements.push(newElement)
    updateSlides(updatedSlides)
    setSelectedElements(new Set([newElement.id]))
    setSelectedElement(newElement)
    setTool('select')
    toast.success(`Added ${type}`)
  }, [slides, currentSlideIndex, updateSlides, currentSlide.elements.length])
  
  const updateElement = useCallback((elementId: string, updates: Partial<SlideElement>) => {
    const updatedSlides = [...slides]
    const elementIndex = updatedSlides[currentSlideIndex].elements.findIndex(el => el.id === elementId)
    if (elementIndex !== -1) {
      updatedSlides[currentSlideIndex].elements[elementIndex] = {
        ...updatedSlides[currentSlideIndex].elements[elementIndex],
        ...updates
      }
      updateSlides(updatedSlides)
      
      // Update selected element if it's the one being updated
      if (selectedElement?.id === elementId) {
        setSelectedElement(updatedSlides[currentSlideIndex].elements[elementIndex])
      }
    }
  }, [slides, currentSlideIndex, updateSlides, selectedElement])
  
  const deleteSelected = useCallback(() => {
    if (selectedElements.size === 0) return
    
    const updatedSlides = [...slides]
    updatedSlides[currentSlideIndex].elements = updatedSlides[currentSlideIndex].elements.filter(
      element => !selectedElements.has(element.id)
    )
    updateSlides(updatedSlides)
    setSelectedElements(new Set())
    setSelectedElement(null)
    toast.success(`Deleted ${selectedElements.size} element(s)`)
  }, [slides, currentSlideIndex, selectedElements, updateSlides])
  
  const duplicateSelected = useCallback(() => {
    if (selectedElements.size === 0) return
    
    const updatedSlides = [...slides]
    const currentElements = updatedSlides[currentSlideIndex].elements
    const newElements: SlideElement[] = []
    
    currentElements.forEach(element => {
      if (selectedElements.has(element.id)) {
        const duplicated = {
          ...element,
          id: `${element.type}-${Date.now()}-${Math.random()}`,
          position: { 
            x: element.position.x + 20, 
            y: element.position.y + 20 
          },
          zIndex: currentElements.length + newElements.length + 1
        }
        newElements.push(duplicated)
      }
    })
    
    updatedSlides[currentSlideIndex].elements.push(...newElements)
    updateSlides(updatedSlides)
    setSelectedElements(new Set(newElements.map(e => e.id)))
    toast.success(`Duplicated ${selectedElements.size} element(s)`)
  }, [slides, currentSlideIndex, selectedElements, updateSlides])

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (tool === 'select') {
      setSelectedElements(new Set())
      setSelectedElement(null)
      return
    }

    const canvas = e.currentTarget
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (100 / zoom)
    const y = (e.clientY - rect.top) * (100 / zoom)
    
    if (tool && ['text', 'chart', 'image', 'shape'].includes(tool)) {
      addElement(tool as Exclude<SlideElementType, 'select'>, { x, y })
    }
  }, [tool, zoom, addElement])

  const updateSlideBackground = useCallback((color: string) => {
    const updatedSlides = [...slides]
    updatedSlides[currentSlideIndex].background = color
    updateSlides(updatedSlides)
    toast.success('Background updated')
  }, [slides, currentSlideIndex, updateSlides])

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Top Toolbar */}
      <header className="h-14 bg-white border-b border-gray-200">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-4">
            <ModernButton
              variant="ghost" 
              size="sm"
              onClick={() => router.back()}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            />
            
            <div className="flex items-center gap-3">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={deckTitle}
                  onChange={(e) => setDeckTitle(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                  className="text-lg font-medium bg-transparent border-none outline-none focus:bg-gray-50 px-2 py-1 rounded"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="text-lg font-medium hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                >
                  {deckTitle}
                </button>
              )}
              
              {/* Auto-save status */}
              <div className="flex items-center gap-1 text-xs text-gray-500">
                {autoSaveConfig.isSaving ? (
                  <>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" />
                    Saving...
                  </>
                ) : autoSaveConfig.saveError ? (
                  <>
                    <AlertCircle className="w-3 h-3 text-red-500" />
                    Error saving
                  </>
                ) : (
                  <>
                    <Check className="w-3 h-3 text-green-600" />
                    Saved
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Right side */}
          <div className="flex items-center gap-2">
            <ModernButton 
              variant="ghost" 
              size="sm" 
              leftIcon={<Share2 className="w-4 h-4" />}
            >
              Share
            </ModernButton>
            
            <ModernButton
              variant="primary"
              size="sm"
              leftIcon={<Play className="w-4 h-4" />}
              onClick={() => setIsPlaying(true)}
            >
              Present
            </ModernButton>
          </div>
        </div>
      </header>
      
      {/* Editor Toolbar */}
      <Toolbar.Root className="h-12 bg-white border-b border-gray-200 px-4 flex items-center gap-1">
        {/* Tools */}
        <TooltipButton 
          tooltip="Select Tool" 
          onClick={() => setTool('select')}
          active={tool === 'select'}
        >
          <MousePointer className="w-4 h-4" />
        </TooltipButton>
        
        <Toolbar.Separator className="w-px h-6 bg-gray-300 mx-2" />
        
        {/* History */}
        <TooltipButton 
          tooltip="Undo (⌘Z)" 
          onClick={undo}
          disabled={historyIndex <= 0}
        >
          <Undo2 className="w-4 h-4" />
        </TooltipButton>
        
        <TooltipButton 
          tooltip="Redo (⌘⇧Z)" 
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
        >
          <Redo2 className="w-4 h-4" />
        </TooltipButton>
        
        <Toolbar.Separator className="w-px h-6 bg-gray-300 mx-2" />
        
        {/* Insert Elements */}
        <TooltipButton 
          tooltip="Add Text" 
          onClick={() => setTool('text')}
          active={tool === 'text'}
        >
          <Type className="w-4 h-4" />
        </TooltipButton>
        
        <TooltipButton 
          tooltip="Add Image" 
          onClick={() => setTool('image')}
          active={tool === 'image'}
        >
          <Image className="w-4 h-4" />
        </TooltipButton>
        
        {/* Chart Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className={cn(
                "p-2 rounded-lg transition-colors flex items-center gap-1",
                tool === 'chart'
                  ? "bg-blue-100 text-blue-600" 
                  : "hover:bg-gray-100 text-gray-700"
              )}
            >
              <BarChart3 className="w-4 h-4" />
              <ChevronDown className="w-3 h-3" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="min-w-[200px] bg-white rounded-lg shadow-lg border border-gray-200 p-1 z-50">
              {CHART_TYPES.map(chart => (
                <DropdownMenu.Item 
                  key={chart.type}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setTool('chart')
                    // Add chart with specific type
                    addElement('chart')
                  }}
                >
                  <BarChart3 className="w-4 h-4" />
                  {chart.name}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
        
        {/* Shape Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className={cn(
                "p-2 rounded-lg transition-colors flex items-center gap-1",
                tool === 'shape'
                  ? "bg-blue-100 text-blue-600" 
                  : "hover:bg-gray-100 text-gray-700"
              )}
            >
              <Shapes className="w-4 h-4" />
              <ChevronDown className="w-3 h-3" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="min-w-[200px] bg-white rounded-lg shadow-lg border border-gray-200 p-1 z-50">
              {SHAPE_TYPES.map(shape => (
                <DropdownMenu.Item 
                  key={shape.type}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setTool('shape')
                    addElement('shape')
                  }}
                >
                  <shape.icon className="w-4 h-4" />
                  {shape.name}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
        
        <Toolbar.Separator className="w-px h-6 bg-gray-300 mx-2" />
        
        {/* Background Color */}
        <DropdownMenu.Root open={showColorPicker && activeColorTarget === 'background'}>
          <DropdownMenu.Trigger asChild>
            <TooltipButton 
              tooltip="Background Color" 
              onClick={() => {
                setActiveColorTarget('background')
                setShowColorPicker(!showColorPicker)
              }}
            >
              <div className="flex items-center gap-1">
                <PaintBucket className="w-4 h-4" />
                <div 
                  className="w-3 h-3 rounded border border-gray-300"
                  style={{ backgroundColor: currentSlide.background }}
                />
              </div>
            </TooltipButton>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-50">
              <HexColorPicker 
                color={currentSlide.background} 
                onChange={(color) => updateSlideBackground(color)}
              />
              <div className="mt-2 flex gap-2">
                {['#ffffff', '#f3f4f6', '#e5e7eb', '#1f2937', '#3b82f6', '#ef4444'].map(color => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => updateSlideBackground(color)}
                  />
                ))}
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
        
        {/* Selection-specific tools */}
        {selectedElement && (
          <>
            <Toolbar.Separator className="w-px h-6 bg-gray-300 mx-2" />
            
            {selectedElement.type === 'text' && (
              <>
                <TooltipButton tooltip="Bold" onClick={() => {
                  const currentWeight = selectedElement.content?.fontWeight || 'normal'
                  updateElement(selectedElement.id, {
                    content: {
                      ...selectedElement.content,
                      fontWeight: currentWeight === 'bold' ? 'normal' : 'bold'
                    }
                  })
                }}>
                  <Bold className="w-4 h-4" />
                </TooltipButton>
                
                <TooltipButton tooltip="Italic" onClick={() => {
                  const currentStyle = selectedElement.content?.fontStyle || 'normal'
                  updateElement(selectedElement.id, {
                    content: {
                      ...selectedElement.content,
                      fontStyle: currentStyle === 'italic' ? 'normal' : 'italic'
                    }
                  })
                }}>
                  <Italic className="w-4 h-4" />
                </TooltipButton>
                
                {/* Text Color */}
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button className="p-2 rounded-lg transition-colors hover:bg-gray-100 flex items-center gap-1">
                      <Palette className="w-4 h-4" />
                      <div 
                        className="w-3 h-3 rounded border border-gray-300"
                        style={{ backgroundColor: selectedElement.content?.color || '#000000' }}
                      />
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-50">
                      <HexColorPicker 
                        color={selectedElement.content?.color || '#000000'} 
                        onChange={(color) => updateElement(selectedElement.id, {
                          content: {
                            ...selectedElement.content,
                            color
                          }
                        })}
                      />
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </>
            )}
            
            <TooltipButton tooltip="Delete" onClick={deleteSelected}>
              <Trash2 className="w-4 h-4" />
            </TooltipButton>
          </>
        )}
        
        {/* Right side tools */}
        <div className="ml-auto flex items-center gap-1">
          {/* Save Status */}
          <SaveStatusIndicator
            status={autoSaveConfig.isSaving ? 'saving' : autoSaveConfig.saveError ? 'error' : 'saved'}
            lastSaved={autoSaveConfig.lastSaved}
            hasUnsavedChanges={autoSaveConfig.hasUnsavedChanges}
            onForceSave={autoSaveConfig.saveNow}
          />
          
          <Toolbar.Separator className="w-px h-6 bg-gray-300 mx-2" />
          
          <TooltipButton 
            tooltip={showGrid ? "Hide Grid" : "Show Grid"} 
            onClick={() => setShowGrid(!showGrid)}
            active={showGrid}
          >
            <Grid className="w-4 h-4" />
          </TooltipButton>
        </div>
      </Toolbar.Root>
      
      {/* Main Editor Area */}
      <div className="flex-1 flex">
        {/* Slide Thumbnails */}
        <div className="w-60 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Slides</h3>
          </div>
          <div className="flex-1 overflow-auto p-2 space-y-2">
            {slides.map((slide, index) => (
              <motion.div
                key={slide.id}
                className={cn(
                  "relative rounded-lg border-2 transition-all cursor-pointer",
                  index === currentSlideIndex 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-200 hover:border-gray-300"
                )}
                onClick={() => setCurrentSlideIndex(index)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="aspect-[16/9] p-2">
                  <div 
                    className="w-full h-full rounded border border-gray-100 relative overflow-hidden"
                    style={{ backgroundColor: slide.background }}
                  >
                    {slide.elements.map(element => (
                      <div
                        key={element.id}
                        className="absolute text-xs"
                        style={{
                          left: `${(element.position.x / 960) * 100}%`,
                          top: `${(element.position.y / 540) * 100}%`,
                          width: `${(element.size.width / 960) * 100}%`,
                          height: `${(element.size.height / 540) * 100}%`,
                          fontSize: element.type === 'text' ? '6px' : undefined,
                          color: element.content?.color,
                          backgroundColor: element.type === 'shape' ? element.content?.fillColor : undefined,
                        }}
                      >
                        {element.type === 'text' && element.content?.text}
                        {element.type === 'shape' && <div className="w-full h-full bg-current rounded" />}
                        {element.type === 'chart' && <BarChart3 className="w-2 h-2" />}
                        {element.type === 'image' && <Image className="w-2 h-2" />}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute top-1 left-1 w-6 h-6 bg-white rounded border border-gray-200 flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </div>
              </motion.div>
            ))}
            
            {/* Add slide button */}
            <button
              onClick={() => {
                const newSlide: Slide = {
                  id: `slide-${Date.now()}`,
                  title: `Slide ${slides.length + 1}`,
                  elements: [],
                  background: '#ffffff',
                  theme: 'modern'
                }
                const newSlides = [...slides, newSlide]
                updateSlides(newSlides)
                setCurrentSlideIndex(slides.length)
              }}
              className="w-full aspect-[16/9] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
          <div className="relative">
            {/* Canvas */}
            <motion.div
              className="relative rounded-lg shadow-xl"
              style={{ 
                width: 960 * (zoom / 100), 
                height: 540 * (zoom / 100),
                backgroundColor: currentSlide.background,
                cursor: tool === 'select' ? 'default' : 'crosshair'
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleCanvasClick}
            >
              {/* Grid Overlay */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none rounded-lg overflow-hidden">
                  <svg width="100%" height="100%" className="opacity-10">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>
              )}
              
              {/* Elements */}
              {currentSlide?.elements
                .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                .map(element => (
                <EditableElement
                  key={element.id}
                  element={element}
                  isSelected={selectedElements.has(element.id)}
                  zoom={zoom}
                  onSelect={(multi) => {
                    if (multi) {
                      const newSelection = new Set(selectedElements)
                      if (selectedElements.has(element.id)) {
                        newSelection.delete(element.id)
                      } else {
                        newSelection.add(element.id)
                      }
                      setSelectedElements(newSelection)
                    } else {
                      setSelectedElements(new Set([element.id]))
                      setSelectedElement(element)
                    }
                  }}
                  onUpdate={(updates) => updateElement(element.id, updates)}
                />
              ))}
            </motion.div>
            
            {/* Zoom Controls */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white rounded-lg shadow-md px-3 py-2 border border-gray-200">
              <button 
                onClick={() => setZoom(Math.max(25, zoom - 25))} 
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm w-12 text-center">{zoom}%</span>
              <button 
                onClick={() => setZoom(Math.min(200, zoom + 25))} 
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Properties Panel */}
        {selectedElement && (
          <PropertiesPanel
            element={selectedElement}
            onUpdate={(updates) => updateElement(selectedElement.id, updates)}
          />
        )}
      </div>
      
      {/* Presentation Mode */}
      <AnimatePresence>
        {isPlaying && (
          <PresentationMode
            slides={slides}
            onClose={() => setIsPlaying(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function TooltipButton({ children, tooltip, onClick, active = false, disabled = false }: {
  children: React.ReactNode
  tooltip: string
  onClick: () => void
  active?: boolean
  disabled?: boolean
}) {
  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
              "p-2 rounded-lg transition-colors",
              disabled 
                ? "opacity-50 cursor-not-allowed" 
                : active 
                  ? "bg-blue-100 text-blue-600" 
                  : "hover:bg-gray-100 text-gray-700"
            )}
          >
            {children}
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-gray-900 text-white px-2 py-1 text-xs rounded shadow-lg z-50"
            sideOffset={5}
          >
            {tooltip}
            <Tooltip.Arrow className="fill-gray-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}

function EditableElement({ element, isSelected, zoom, onSelect, onUpdate }: {
  element: SlideElement
  isSelected: boolean
  zoom: number
  onSelect: (multi: boolean) => void
  onUpdate: (updates: Partial<SlideElement>) => void
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(element.content?.text || '')

  const handleDrag = useCallback((e: any, data: any) => {
    onUpdate({
      position: { x: data.x, y: data.y }
    })
  }, [onUpdate])

  const handleResize = useCallback((direction: string, deltaX: number, deltaY: number) => {
    const newSize = { ...element.size }
    const newPosition = { ...element.position }

    if (direction.includes('e')) newSize.width += deltaX
    if (direction.includes('w')) {
      newSize.width -= deltaX
      newPosition.x += deltaX
    }
    if (direction.includes('s')) newSize.height += deltaY
    if (direction.includes('n')) {
      newSize.height -= deltaY
      newPosition.y += deltaY
    }

    onUpdate({ 
      size: { 
        width: Math.max(20, newSize.width), 
        height: Math.max(20, newSize.height) 
      },
      position: newPosition
    })
  }, [element.size, element.position, onUpdate])

  return (
    <Draggable
      position={element.position}
      onDrag={handleDrag}
      onStart={() => setIsDragging(true)}
      onStop={() => setIsDragging(false)}
      disabled={isEditing}
      scale={zoom / 100}
    >
      <div
        className={cn(
          "absolute group cursor-move",
          isSelected && "ring-2 ring-blue-500 ring-offset-1"
        )}
        style={{
          width: element.size.width,
          height: element.size.height,
          zIndex: element.zIndex || 1
        }}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(e.shiftKey || e.metaKey)
        }}
        onDoubleClick={() => {
          if (element.type === 'text') {
            setIsEditing(true)
            setEditText(element.content?.text || '')
          }
        }}
      >
        {/* Element Content */}
        {element.type === 'text' ? (
          <div className="w-full h-full flex items-center">
            {isEditing ? (
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={() => {
                  setIsEditing(false)
                  onUpdate({
                    content: {
                      ...element.content,
                      text: editText
                    }
                  })
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    setIsEditing(false)
                    onUpdate({
                      content: {
                        ...element.content,
                        text: editText
                      }
                    })
                  }
                }}
                className="w-full h-full resize-none border-none outline-none bg-transparent"
                style={{
                  fontSize: element.content?.fontSize || 16,
                  fontWeight: element.content?.fontWeight || 'normal',
                  fontStyle: element.content?.fontStyle || 'normal',
                  color: element.content?.color || '#000',
                  fontFamily: element.content?.fontFamily || 'Inter, sans-serif',
                  textAlign: element.content?.textAlign || 'left'
                }}
                autoFocus
              />
            ) : (
              <div
                className="w-full h-full flex items-center"
                style={{
                  fontSize: element.content?.fontSize || 16,
                  fontWeight: element.content?.fontWeight || 'normal',
                  fontStyle: element.content?.fontStyle || 'normal',
                  color: element.content?.color || '#000',
                  fontFamily: element.content?.fontFamily || 'Inter, sans-serif',
                  textAlign: element.content?.textAlign || 'left',
                  padding: '4px'
                }}
              >
                {element.content?.text || 'Click to edit text'}
              </div>
            )}
          </div>
        ) : element.type === 'chart' ? (
          <div className="w-full h-full bg-blue-50 border border-blue-200 rounded flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-xs text-blue-600">{element.content?.title || 'Chart'}</div>
            </div>
          </div>
        ) : element.type === 'image' ? (
          <div className="w-full h-full bg-gray-100 border border-gray-300 rounded flex items-center justify-center">
            <div className="text-center">
              <Image className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <div className="text-xs text-gray-600">Image</div>
            </div>
          </div>
        ) : element.type === 'shape' ? (
          <div 
            className="w-full h-full rounded"
            style={{
              backgroundColor: element.content?.fillColor || '#3b82f6',
              border: `${element.content?.strokeWidth || 2}px solid ${element.content?.strokeColor || '#1e40af'}`,
              borderRadius: element.content?.shapeType === 'circle' ? '50%' : 
                          element.content?.shapeType === 'triangle' ? '0' : '4px'
            }}
          />
        ) : null}
        
        {/* Selection handles */}
        {isSelected && !isEditing && (
          <>
            {/* Corner resize handles */}
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full cursor-nw-resize" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full cursor-ne-resize" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full cursor-sw-resize" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full cursor-se-resize" />
            
            {/* Edge resize handles */}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full cursor-n-resize" />
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full cursor-s-resize" />
            <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full cursor-w-resize" />
            <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full cursor-e-resize" />
          </>
        )}
      </div>
    </Draggable>
  )
}

function PropertiesPanel({ element, onUpdate }: {
  element: SlideElement
  onUpdate: (updates: Partial<SlideElement>) => void
}) {
  return (
    <div className="w-64 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">Properties</h3>
      </div>
      <div className="p-3 space-y-4 overflow-auto">
        {/* Position */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Position
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="X"
              value={Math.round(element.position.x)}
              onChange={(e) => onUpdate({
                position: { ...element.position, x: Number(e.target.value) }
              })}
              className="px-2 py-1 text-xs border border-gray-300 rounded"
            />
            <input
              type="number"
              placeholder="Y"
              value={Math.round(element.position.y)}
              onChange={(e) => onUpdate({
                position: { ...element.position, y: Number(e.target.value) }
              })}
              className="px-2 py-1 text-xs border border-gray-300 rounded"
            />
          </div>
        </div>
        
        {/* Size */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Size
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="W"
              value={Math.round(element.size.width)}
              onChange={(e) => onUpdate({
                size: { ...element.size, width: Number(e.target.value) }
              })}
              className="px-2 py-1 text-xs border border-gray-300 rounded"
            />
            <input
              type="number"
              placeholder="H"
              value={Math.round(element.size.height)}
              onChange={(e) => onUpdate({
                size: { ...element.size, height: Number(e.target.value) }
              })}
              className="px-2 py-1 text-xs border border-gray-300 rounded"
            />
          </div>
        </div>
        
        {/* Text-specific properties */}
        {element.type === 'text' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Font Size
              </label>
              <input
                type="number"
                value={element.content?.fontSize || 16}
                onChange={(e) => onUpdate({
                  content: {
                    ...element.content,
                    fontSize: Number(e.target.value)
                  }
                })}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Text Alignment
              </label>
              <div className="flex gap-1">
                {['left', 'center', 'right'].map(align => (
                  <button
                    key={align}
                    onClick={() => onUpdate({
                      content: {
                        ...element.content,
                        textAlign: align
                      }
                    })}
                    className={cn(
                      "flex-1 px-2 py-1 text-xs border rounded transition-colors",
                      element.content?.textAlign === align
                        ? "bg-blue-100 border-blue-300 text-blue-700"
                        : "border-gray-300 hover:bg-gray-100"
                    )}
                  >
                    {align === 'left' ? <AlignLeft className="w-3 h-3" /> :
                     align === 'center' ? <AlignCenter className="w-3 h-3" /> :
                     <AlignRight className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
        
        {/* Shape-specific properties */}
        {element.type === 'shape' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Fill Color
              </label>
              <input
                type="color"
                value={element.content?.fillColor || '#3b82f6'}
                onChange={(e) => onUpdate({
                  content: {
                    ...element.content,
                    fillColor: e.target.value
                  }
                })}
                className="w-full h-8 rounded border border-gray-300"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Stroke Color
              </label>
              <input
                type="color"
                value={element.content?.strokeColor || '#1e40af'}
                onChange={(e) => onUpdate({
                  content: {
                    ...element.content,
                    strokeColor: e.target.value
                  }
                })}
                className="w-full h-8 rounded border border-gray-300"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Stroke Width
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={element.content?.strokeWidth || 2}
                onChange={(e) => onUpdate({
                  content: {
                    ...element.content,
                    strokeWidth: Number(e.target.value)
                  }
                })}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function PresentationMode({ slides, onClose }: {
  slides: Slide[]
  onClose: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  useHotkeys('escape', onClose)
  useHotkeys('arrowleft', () => setCurrentIndex(Math.max(0, currentIndex - 1)))
  useHotkeys('arrowright', () => setCurrentIndex(Math.min(slides.length - 1, currentIndex + 1)))
  
  const currentSlide = slides[currentIndex]
  
  return (
    <motion.div
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
      >
        <Eye className="w-6 h-6" />
      </button>
      
      <div className="w-full h-full flex items-center justify-center p-8">
        <div 
          className="relative rounded-lg shadow-2xl" 
          style={{ 
            width: 960, 
            height: 540,
            backgroundColor: currentSlide.background 
          }}
        >
          {currentSlide.elements
            .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
            .map(element => (
            <div
              key={element.id}
              className="absolute"
              style={{
                left: element.position.x,
                top: element.position.y,
                width: element.size.width,
                height: element.size.height,
                transform: `rotate(${element.rotation || 0}deg)`
              }}
            >
              {element.type === 'text' && (
                <div 
                  className="w-full h-full flex items-center"
                  style={{
                    fontSize: element.content?.fontSize || 16,
                    fontWeight: element.content?.fontWeight || 'normal',
                    fontStyle: element.content?.fontStyle || 'normal',
                    color: element.content?.color || '#000',
                    fontFamily: element.content?.fontFamily || 'Inter, sans-serif',
                    textAlign: element.content?.textAlign || 'left',
                    padding: '4px'
                  }}
                >
                  {element.content?.text || 'Text'}
                </div>
              )}
              {element.type === 'shape' && (
                <div 
                  className="w-full h-full"
                  style={{
                    backgroundColor: element.content?.fillColor || '#3b82f6',
                    border: `${element.content?.strokeWidth || 2}px solid ${element.content?.strokeColor || '#1e40af'}`,
                    borderRadius: element.content?.shapeType === 'circle' ? '50%' : '4px'
                  }}
                />
              )}
              {element.type === 'chart' && (
                <div className="w-full h-full bg-blue-50 border border-blue-200 rounded flex items-center justify-center">
                  <BarChart3 className="w-16 h-16 text-blue-500" />
                </div>
              )}
              {element.type === 'image' && (
                <div className="w-full h-full bg-gray-100 border border-gray-300 rounded flex items-center justify-center">
                  <Image className="w-16 h-16 text-gray-500" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Navigation */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 text-white">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="p-2 hover:bg-white/20 rounded disabled:opacity-50"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-sm">
          {currentIndex + 1} / {slides.length}
        </span>
        <button
          onClick={() => setCurrentIndex(Math.min(slides.length - 1, currentIndex + 1))}
          disabled={currentIndex === slides.length - 1}
          className="p-2 hover:bg-white/20 rounded disabled:opacity-50"
        >
          <ArrowLeft className="w-5 h-5 rotate-180" />
        </button>
      </div>
    </motion.div>
  )
}