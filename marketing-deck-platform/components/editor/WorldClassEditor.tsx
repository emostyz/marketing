'use client'

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { 
  Type, Image as ImageIcon, BarChart3, Square, Circle, Triangle, 
  AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline,
  Copy, ClipboardPaste, Delete, RotateCw, Maximize2, Minimize2,
  ZoomIn, ZoomOut, Undo, Redo, Save, Download, Play, Settings,
  Grid, Eye, EyeOff, Users, MessageSquare, Brain, Plus, MousePointer,
  Move, CornerUpLeft, CornerUpRight, CornerDownLeft, CornerDownRight,
  Minus, X, Check, ChevronDown, Palette, Link, Upload, Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// Professional slide element types
interface SlideElement {
  id: string
  type: 'text' | 'image' | 'shape' | 'chart' | 'line' | 'arrow'
  position: { x: number; y: number }
  size: { width: number; height: number }
  rotation: number
  content?: string
  style: {
    fontSize?: number
    fontFamily?: string
    fontWeight?: string
    color?: string
    backgroundColor?: string
    borderColor?: string
    borderWidth?: number
    borderRadius?: number
    opacity?: number
    textAlign?: 'left' | 'center' | 'right'
    padding?: number
    zIndex?: number
  }
  locked?: boolean
  groupId?: string
}

interface Slide {
  id: string
  title: string
  elements: SlideElement[]
  background: {
    type: 'solid' | 'gradient' | 'image'
    color?: string
    gradient?: { from: string; to: string; direction: string }
    image?: string
  }
  notes: string
  animations?: any[]
}

interface WorldClassEditorProps {
  slides?: Slide[]
  onSlidesChange?: (slides: Slide[]) => void
  onSave?: (slides: Slide[]) => void
  readonly?: boolean
}

// Snap guides for alignment
interface SnapGuide {
  id: string
  type: 'vertical' | 'horizontal'
  position: number
  elements: string[]
}

// Selection box for multi-select
interface SelectionBox {
  start: { x: number; y: number }
  end: { x: number; y: number }
  active: boolean
}

export default function WorldClassEditor({
  slides = [],
  onSlidesChange,
  onSave,
  readonly = false
}: WorldClassEditorProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [selectedElements, setSelectedElements] = useState<string[]>([])
  const [clipboard, setClipboard] = useState<SlideElement[]>([])
  const [zoom, setZoom] = useState(100)
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [showRulers, setShowRulers] = useState(true)
  const [activeTool, setActiveTool] = useState<string>('select')
  const [isPlaying, setIsPlaying] = useState(false)
  
  // Advanced editing state
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([])
  const [selectionBox, setSelectionBox] = useState<SelectionBox>({ start: { x: 0, y: 0 }, end: { x: 0, y: 0 }, active: false })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null)
  const [history, setHistory] = useState<Slide[][]>([slides])
  const [historyIndex, setHistoryIndex] = useState(0)
  
  // Real-time editing
  const [collaborators, setCollaborators] = useState<any[]>([])
  const [comments, setComments] = useState<any[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [editingText, setEditingText] = useState<string | null>(null)
  const [liveCursors, setLiveCursors] = useState<{ [userId: string]: { x: number; y: number; name: string; color: string } }>({})
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; items: any[] } | null>(null)
  const [showRealTimeIndicator, setShowRealTimeIndicator] = useState(false)
  
  // Refs
  const canvasRef = useRef<HTMLDivElement>(null)
  const selectionRef = useRef<HTMLDivElement>(null)
  
  // Constants
  const SLIDE_WIDTH = 1920
  const SLIDE_HEIGHT = 1080
  const GRID_SIZE = 20
  const SNAP_THRESHOLD = 8
  
  const currentSlide = slides[currentSlideIndex]
  const slideScale = zoom / 100
  
  // Professional keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (readonly) return
      
      // Cmd/Ctrl + shortcuts
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault()
            if (e.shiftKey) {
              redo()
            } else {
              undo()
            }
            break
          case 'c':
            e.preventDefault()
            copyElements()
            break
          case 'v':
            e.preventDefault()
            pasteElements()
            break
          case 'a':
            e.preventDefault()
            selectAll()
            break
          case 's':
            e.preventDefault()
            onSave?.(slides)
            break
          case 'd':
            e.preventDefault()
            duplicateElements()
            break
          case 'g':
            e.preventDefault()
            groupElements()
            break
        }
      }
      
      // Other shortcuts
      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          e.preventDefault()
          deleteElements()
          break
        case 'Escape':
          e.preventDefault()
          setSelectedElements([])
          setActiveTool('select')
          break
        case ' ':
          e.preventDefault()
          setActiveTool(activeTool === 'pan' ? 'select' : 'pan')
          break
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [readonly, selectedElements, activeTool, slides])
  
  // History management
  const addToHistory = useCallback((newSlides: Slide[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(JSON.parse(JSON.stringify(newSlides)))
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])
  
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      onSlidesChange?.(history[historyIndex - 1])
    }
  }, [history, historyIndex, onSlidesChange])
  
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      onSlidesChange?.(history[historyIndex + 1])
    }
  }, [history, historyIndex, onSlidesChange])
  
  // Professional selection system
  const selectAll = useCallback(() => {
    if (currentSlide) {
      setSelectedElements(currentSlide.elements.map(el => el.id))
    }
  }, [currentSlide])
  
  const copyElements = useCallback(() => {
    if (selectedElements.length > 0 && currentSlide) {
      const elementsToCopy = currentSlide.elements.filter(el => selectedElements.includes(el.id))
      setClipboard(JSON.parse(JSON.stringify(elementsToCopy)))
    }
  }, [selectedElements, currentSlide])
  
  const pasteElements = useCallback(() => {
    if (clipboard.length > 0 && currentSlide) {
      const newElements = clipboard.map(el => ({
        ...el,
        id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        position: { x: el.position.x + 20, y: el.position.y + 20 }
      }))
      
      const updatedSlide = {
        ...currentSlide,
        elements: [...currentSlide.elements, ...newElements]
      }
      
      const newSlides = [...slides]
      newSlides[currentSlideIndex] = updatedSlide
      onSlidesChange?.(newSlides)
      addToHistory(newSlides)
      setSelectedElements(newElements.map(el => el.id))
    }
  }, [clipboard, currentSlide, slides, currentSlideIndex, onSlidesChange, addToHistory])
  
  const deleteElements = useCallback(() => {
    if (selectedElements.length > 0 && currentSlide) {
      const updatedSlide = {
        ...currentSlide,
        elements: currentSlide.elements.filter(el => !selectedElements.includes(el.id))
      }
      
      const newSlides = [...slides]
      newSlides[currentSlideIndex] = updatedSlide
      onSlidesChange?.(newSlides)
      addToHistory(newSlides)
      setSelectedElements([])
    }
  }, [selectedElements, currentSlide, slides, currentSlideIndex, onSlidesChange, addToHistory])
  
  const duplicateElements = useCallback(() => {
    copyElements()
    setTimeout(() => pasteElements(), 10)
  }, [copyElements, pasteElements])
  
  const groupElements = useCallback(() => {
    if (selectedElements.length > 1) {
      const groupId = `group_${Date.now()}`
      // Implementation for grouping
    }
  }, [selectedElements])
  
  // Professional drag and drop with snap guides
  const handleElementDrag = useCallback((elementId: string, newPosition: { x: number; y: number }) => {
    if (!currentSlide) return
    
    // Snap to grid
    let snappedX = newPosition.x
    let snappedY = newPosition.y
    
    if (snapToGrid) {
      snappedX = Math.round(newPosition.x / GRID_SIZE) * GRID_SIZE
      snappedY = Math.round(newPosition.y / GRID_SIZE) * GRID_SIZE
    }
    
    // Generate snap guides
    const guides: SnapGuide[] = []
    const currentElement = currentSlide.elements.find(el => el.id === elementId)
    if (!currentElement) return
    
    // Check alignment with other elements
    currentSlide.elements.forEach(el => {
      if (el.id === elementId) return
      
      // Vertical alignment
      if (Math.abs(el.position.x - snappedX) < SNAP_THRESHOLD) {
        snappedX = el.position.x
        guides.push({
          id: `v_${el.id}`,
          type: 'vertical',
          position: el.position.x,
          elements: [elementId, el.id]
        })
      }
      
      // Horizontal alignment
      if (Math.abs(el.position.y - snappedY) < SNAP_THRESHOLD) {
        snappedY = el.position.y
        guides.push({
          id: `h_${el.id}`,
          type: 'horizontal',
          position: el.position.y,
          elements: [elementId, el.id]
        })
      }
    })
    
    setSnapGuides(guides)
    
    // Update element position
    const updatedSlide = {
      ...currentSlide,
      elements: currentSlide.elements.map(el =>
        el.id === elementId 
          ? { ...el, position: { x: snappedX, y: snappedY } }
          : el
      )
    }
    
    const newSlides = [...slides]
    newSlides[currentSlideIndex] = updatedSlide
    onSlidesChange?.(newSlides)
  }, [currentSlide, snapToGrid, slides, currentSlideIndex, onSlidesChange])
  
  // Professional element creation
  const createTextElement = useCallback((position: { x: number; y: number }) => {
    if (!currentSlide) return
    
    const newElement: SlideElement = {
      id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'text',
      position,
      size: { width: 200, height: 50 },
      rotation: 0,
      content: 'Double-click to edit',
      style: {
        fontSize: 18,
        fontFamily: 'Inter, sans-serif',
        fontWeight: '400',
        color: '#1f2937',
        textAlign: 'left',
        padding: 12,
        zIndex: 1
      }
    }
    
    const updatedSlide = {
      ...currentSlide,
      elements: [...currentSlide.elements, newElement]
    }
    
    const newSlides = [...slides]
    newSlides[currentSlideIndex] = updatedSlide
    onSlidesChange?.(newSlides)
    addToHistory(newSlides)
    setSelectedElements([newElement.id])
  }, [currentSlide, slides, currentSlideIndex, onSlidesChange, addToHistory])
  
  const createShapeElement = useCallback((shapeType: string, position: { x: number; y: number }) => {
    if (!currentSlide) return
    
    const newElement: SlideElement = {
      id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'shape',
      position,
      size: { width: 100, height: 100 },
      rotation: 0,
      content: shapeType,
      style: {
        backgroundColor: '#3b82f6',
        borderColor: '#1e40af',
        borderWidth: 2,
        borderRadius: shapeType === 'circle' ? 50 : shapeType === 'rounded-rect' ? 12 : 0,
        opacity: 1,
        zIndex: 1
      }
    }
    
    const updatedSlide = {
      ...currentSlide,
      elements: [...currentSlide.elements, newElement]
    }
    
    const newSlides = [...slides]
    newSlides[currentSlideIndex] = updatedSlide
    onSlidesChange?.(newSlides)
    addToHistory(newSlides)
    setSelectedElements([newElement.id])
  }, [currentSlide, slides, currentSlideIndex, onSlidesChange, addToHistory])
  
  // Canvas click handler
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (readonly) return
    
    // Hide context menu on click
    setContextMenu(null)
    
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const x = (e.clientX - rect.left) / slideScale
    const y = (e.clientY - rect.top) / slideScale
    
    switch (activeTool) {
      case 'text':
        createTextElement({ x, y })
        setActiveTool('select')
        break
      case 'rectangle':
        createShapeElement('rectangle', { x, y })
        setActiveTool('select')
        break
      case 'circle':
        createShapeElement('circle', { x, y })
        setActiveTool('select')
        break
      default:
        if (!e.target || (e.target as HTMLElement).closest('.slide-element')) return
        setSelectedElements([])
    }
  }, [readonly, activeTool, slideScale, createTextElement, createShapeElement])

  // Context menu handler
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    if (readonly) return
    
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const items = selectedElements.length > 0 ? [
      { label: 'Copy', icon: Copy, action: copyElements, shortcut: 'Cmd+C' },
      { label: 'Duplicate', icon: Copy, action: duplicateElements, shortcut: 'Cmd+D' },
      { label: 'Delete', icon: Delete, action: deleteElements, shortcut: 'Del' },
      { type: 'separator' },
      { label: 'Bring to Front', icon: Plus, action: () => {} },
      { label: 'Send to Back', icon: Minus, action: () => {} },
      { type: 'separator' },
      { label: 'Group', icon: Users, action: groupElements, shortcut: 'Cmd+G' }
    ] : [
      { label: 'Paste', icon: ClipboardPaste, action: pasteElements, shortcut: 'Cmd+V', disabled: clipboard.length === 0 },
      { type: 'separator' },
      { label: 'Add Text', icon: Type, action: () => createTextElement({ x: (e.clientX - rect.left) / slideScale, y: (e.clientY - rect.top) / slideScale }) },
      { label: 'Add Rectangle', icon: Square, action: () => createShapeElement('rectangle', { x: (e.clientX - rect.left) / slideScale, y: (e.clientY - rect.top) / slideScale }) },
      { label: 'Add Circle', icon: Circle, action: () => createShapeElement('circle', { x: (e.clientX - rect.left) / slideScale, y: (e.clientY - rect.top) / slideScale }) }
    ]
    
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      items
    })
  }, [readonly, selectedElements, copyElements, duplicateElements, deleteElements, groupElements, pasteElements, clipboard, createTextElement, createShapeElement, slideScale])

  // Mouse tracking for live cursors
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Simulate live cursor updates (would be websocket in real app)
    setShowRealTimeIndicator(true)
    setTimeout(() => setShowRealTimeIndicator(false), 100)
  }, [])

  // Simulated real-time collaboration
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const userId = 'user_' + Math.floor(Math.random() * 3)
        const colors = ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b']
        setLiveCursors(prev => ({
          ...prev,
          [userId]: {
            x: Math.random() * 800,
            y: Math.random() * 600,
            name: ['Alice', 'Bob', 'Carol'][Math.floor(Math.random() * 3)],
            color: colors[Math.floor(Math.random() * colors.length)]
          }
        }))
      }
    }, 2000)
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      {/* Professional Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-1">
          {/* File operations */}
          <Button variant="ghost" size="sm" onClick={() => onSave?.(slides)}>
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Separator orientation="vertical" className="h-6" />
          
          {/* Edit operations */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={undo}
            disabled={historyIndex <= 0}
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
          >
            <Redo className="w-4 h-4" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          
          {/* Tools */}
          <Button 
            variant={activeTool === 'select' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTool('select')}
          >
            <MousePointer className="w-4 h-4" />
          </Button>
          <Button 
            variant={activeTool === 'text' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTool('text')}
          >
            <Type className="w-4 h-4" />
          </Button>
          <Button 
            variant={activeTool === 'rectangle' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTool('rectangle')}
          >
            <Square className="w-4 h-4" />
          </Button>
          <Button 
            variant={activeTool === 'circle' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTool('circle')}
          >
            <Circle className="w-4 h-4" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          
          {/* View controls */}
          <Button 
            variant={showGrid ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => setZoom(Math.max(25, zoom - 25))}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium w-12 text-center">{zoom}%</span>
            <Button variant="ghost" size="sm" onClick={() => setZoom(Math.min(400, zoom + 25))}>
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => setIsPlaying(!isPlaying)}>
            <Play className="w-4 h-4 mr-1" />
            Present
          </Button>
        </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Slide Thumbnails */}
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Slides</h3>
            <div className="space-y-2">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={cn(
                    "relative group cursor-pointer rounded-lg border-2 transition-all",
                    currentSlideIndex === index 
                      ? "border-blue-500 bg-blue-50" 
                      : "border-gray-200 hover:border-gray-300"
                  )}
                  onClick={() => setCurrentSlideIndex(index)}
                >
                  <div className="aspect-video bg-white rounded p-2">
                    <div className="w-full h-full bg-gray-50 rounded text-xs text-gray-500 flex items-center justify-center">
                      Slide {index + 1}
                    </div>
                  </div>
                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-900 truncate">
                      {slide.title || `Slide ${index + 1}`}
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Add Slide
              </Button>
            </div>
          </div>
        </div>
        
        {/* Main Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 bg-gray-100 overflow-auto">
            <div className="p-8 flex items-center justify-center min-h-full">
              <div
                ref={canvasRef}
                className="relative bg-white shadow-xl rounded-lg overflow-hidden cursor-crosshair"
                style={{
                  width: SLIDE_WIDTH * slideScale,
                  height: SLIDE_HEIGHT * slideScale,
                  minWidth: SLIDE_WIDTH * slideScale,
                  minHeight: SLIDE_HEIGHT * slideScale
                }}
                onClick={handleCanvasClick}
                onContextMenu={handleContextMenu}
                onMouseMove={handleMouseMove}
              >
                {/* Grid */}
                {showGrid && (
                  <div 
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                      backgroundImage: `
                        linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                        linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                      `,
                      backgroundSize: `${GRID_SIZE * slideScale}px ${GRID_SIZE * slideScale}px`
                    }}
                  />
                )}
                
                {/* Snap Guides */}
                {snapGuides.map(guide => (
                  <div
                    key={guide.id}
                    className="absolute bg-blue-500 opacity-60 z-50 pointer-events-none"
                    style={{
                      [guide.type === 'vertical' ? 'left' : 'top']: guide.position * slideScale,
                      [guide.type === 'vertical' ? 'width' : 'height']: '1px',
                      [guide.type === 'vertical' ? 'height' : 'width']: '100%'
                    }}
                  />
                ))}
                
                {/* Slide Elements */}
                {currentSlide?.elements.map((element) => (
                  <motion.div
                    key={element.id}
                    className={cn(
                      "slide-element absolute cursor-move select-none",
                      selectedElements.includes(element.id) && "ring-2 ring-blue-500"
                    )}
                    style={{
                      left: element.position.x * slideScale,
                      top: element.position.y * slideScale,
                      width: element.size.width * slideScale,
                      height: element.size.height * slideScale,
                      transform: `rotate(${element.rotation}deg)`,
                      zIndex: element.style.zIndex || 1
                    }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    drag={!readonly && editingText !== element.id}
                    dragMomentum={false}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={() => setIsDragging(false)}
                    onDrag={(_, info) => {
                      const newX = (element.position.x * slideScale + info.offset.x) / slideScale
                      const newY = (element.position.y * slideScale + info.offset.y) / slideScale
                      handleElementDrag(element.id, { x: newX, y: newY })
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!selectedElements.includes(element.id)) {
                        setSelectedElements(e.metaKey || e.ctrlKey ? [...selectedElements, element.id] : [element.id])
                      }
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation()
                      if (element.type === 'text') {
                        setEditingText(element.id)
                      }
                    }}
                  >
                    {/* Element Content */}
                    {element.type === 'text' && (
                      <div
                        className="w-full h-full flex items-center justify-start p-2 overflow-hidden"
                        style={{
                          fontSize: (element.style.fontSize || 16) * slideScale,
                          fontFamily: element.style.fontFamily,
                          fontWeight: element.style.fontWeight,
                          color: element.style.color,
                          backgroundColor: element.style.backgroundColor,
                          textAlign: element.style.textAlign,
                          borderRadius: element.style.borderRadius
                        }}
                      >
                        {editingText === element.id ? (
                          <Textarea
                            value={element.content}
                            onChange={(e) => {
                              // Update element content
                              const updatedSlide = {
                                ...currentSlide!,
                                elements: currentSlide!.elements.map(el =>
                                  el.id === element.id ? { ...el, content: e.target.value } : el
                                )
                              }
                              const newSlides = [...slides]
                              newSlides[currentSlideIndex] = updatedSlide
                              onSlidesChange?.(newSlides)
                            }}
                            onBlur={() => setEditingText(null)}
                            onKeyDown={(e) => {
                              if (e.key === 'Escape' || (e.key === 'Enter' && e.metaKey)) {
                                setEditingText(null)
                              }
                            }}
                            className="w-full h-full resize-none border-none bg-transparent p-0 focus:outline-none focus:ring-0"
                            autoFocus
                          />
                        ) : (
                          <span className="select-none">{element.content}</span>
                        )}
                      </div>
                    )}
                    
                    {element.type === 'shape' && (
                      <div
                        className="w-full h-full"
                        style={{
                          backgroundColor: element.style.backgroundColor,
                          borderColor: element.style.borderColor,
                          borderWidth: element.style.borderWidth,
                          borderStyle: 'solid',
                          borderRadius: element.style.borderRadius,
                          opacity: element.style.opacity
                        }}
                      />
                    )}
                    
                    {/* Selection Handles */}
                    {selectedElements.includes(element.id) && !readonly && (
                      <>
                        {/* Corner handles */}
                        <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 border border-white rounded-sm cursor-nw-resize" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 border border-white rounded-sm cursor-ne-resize" />
                        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 border border-white rounded-sm cursor-sw-resize" />
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 border border-white rounded-sm cursor-se-resize" />
                        
                        {/* Edge handles */}
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 border border-white rounded-sm cursor-n-resize" />
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 border border-white rounded-sm cursor-s-resize" />
                        <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 border border-white rounded-sm cursor-w-resize" />
                        <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 border border-white rounded-sm cursor-e-resize" />
                        
                        {/* Rotation handle */}
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-500 border border-white rounded-full cursor-grab" />
                      </>
                    )}
                  </motion.div>
                ))}
                
                {/* Live Collaboration Cursors */}
                {Object.entries(liveCursors).map(([userId, cursor]) => (
                  <motion.div
                    key={userId}
                    className="absolute pointer-events-none z-50"
                    style={{
                      left: cursor.x,
                      top: cursor.y,
                      color: cursor.color
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                  >
                    <div className="relative">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8.5 2.5L20.5 8.5L12.5 12.5L8.5 20.5L8.5 2.5Z" />
                      </svg>
                      <div
                        className="absolute top-4 left-4 px-2 py-1 rounded text-white text-xs font-medium whitespace-nowrap"
                        style={{ backgroundColor: cursor.color }}
                      >
                        {cursor.name}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Properties Panel */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Properties</h3>
            
            {selectedElements.length === 1 && currentSlide && (
              (() => {
                const element = currentSlide.elements.find(el => el.id === selectedElements[0])
                if (!element) return null
                
                return (
                  <div className="space-y-4">
                    {/* Position & Size */}
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-2 block">Position & Size</label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-gray-500">X</label>
                          <Input
                            type="number"
                            value={Math.round(element.position.x)}
                            onChange={(e) => {
                              const newX = parseInt(e.target.value) || 0
                              handleElementDrag(element.id, { x: newX, y: element.position.y })
                            }}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Y</label>
                          <Input
                            type="number"
                            value={Math.round(element.position.y)}
                            onChange={(e) => {
                              const newY = parseInt(e.target.value) || 0
                              handleElementDrag(element.id, { x: element.position.x, y: newY })
                            }}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Width</label>
                          <Input
                            type="number"
                            value={Math.round(element.size.width)}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Height</label>
                          <Input
                            type="number"
                            value={Math.round(element.size.height)}
                            className="h-8"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Text Properties */}
                    {element.type === 'text' && (
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-2 block">Text</label>
                        <div className="space-y-2">
                          <Input
                            type="number"
                            placeholder="Font Size"
                            value={element.style.fontSize || 16}
                            className="h-8"
                          />
                          <Input
                            type="color"
                            value={element.style.color || '#000000'}
                            className="h-8"
                          />
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm">
                              <Bold className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Italic className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Underline className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm">
                              <AlignLeft className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <AlignCenter className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <AlignRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()
            )}
            
            {selectedElements.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <MousePointer className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Select an element to edit its properties</p>
              </div>
            )}
            
            {selectedElements.length > 1 && (
              <div className="text-center text-gray-500 py-8">
                <div className="w-12 h-12 mx-auto mb-3 opacity-50 flex items-center justify-center bg-gray-100 rounded">
                  {selectedElements.length}
                </div>
                <p>{selectedElements.length} elements selected</p>
                <div className="mt-4 space-y-2">
                  <Button size="sm" className="w-full">
                    Group Elements
                  </Button>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" className="flex-1">
                      <AlignLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1">
                      <AlignCenter className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1">
                      <AlignRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <span>Slide {currentSlideIndex + 1} of {slides.length}</span>
          {selectedElements.length > 0 && (
            <span>• {selectedElements.length} selected</span>
          )}
          {isDragging && <span>• Moving</span>}
        </div>
        <div className="flex items-center space-x-4">
          <span>Zoom: {zoom}%</span>
          <span>Ready</span>
          {showRealTimeIndicator && (
            <div className="flex items-center space-x-1 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Live</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setContextMenu(null)}
            />
            <motion.div
              className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-48"
              style={{
                left: contextMenu.x,
                top: contextMenu.y
              }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              {contextMenu.items.map((item, index) => (
                item.type === 'separator' ? (
                  <div key={index} className="h-px bg-gray-200 my-1" />
                ) : (
                  <button
                    key={index}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between transition-colors",
                      item.disabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => {
                      if (!item.disabled) {
                        item.action()
                        setContextMenu(null)
                      }
                    }}
                    disabled={item.disabled}
                  >
                    <div className="flex items-center space-x-2">
                      <item.icon className="w-4 h-4 text-gray-500" />
                      <span>{item.label}</span>
                    </div>
                    {item.shortcut && (
                      <span className="text-xs text-gray-400">{item.shortcut}</span>
                    )}
                  </button>
                )
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Collaboration Panel */}
      <AnimatePresence>
        {Object.keys(liveCursors).length > 0 && (
          <motion.div
            className="fixed top-20 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-40"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
          >
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Collaborating</span>
            </div>
            <div className="space-y-1">
              {Object.entries(liveCursors).map(([userId, cursor]) => (
                <div key={userId} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cursor.color }}
                  />
                  <span className="text-xs text-gray-600">{cursor.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}