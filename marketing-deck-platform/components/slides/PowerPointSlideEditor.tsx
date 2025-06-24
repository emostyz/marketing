'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Type, Square, Circle, Triangle, Image as ImageIcon, Palette, 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Plus, Minus, Trash2, Copy, Download, Save,
  ChevronUp, ChevronDown, Eye, EyeOff, Table,
  BarChart3, LineChart, PieChart, Layers,
  Lock, Unlock, Settings, RefreshCw, Database, X,
  RotateCw, RotateCcw, FlipHorizontal, FlipVertical,
  ZoomIn, ZoomOut, Grid, Move, MousePointer,
  Maximize2, Minimize2, CornerDownLeft, CornerDownRight,
  Link, Unlink, Play, Presentation, FileText,
  Scissors, Clipboard, ArrowUp, ArrowDown,
  ArrowLeft, ArrowRight, Sparkles, Wand2,
  ChevronLeft, ChevronRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { HexColorPicker } from 'react-colorful'
import * as Slider from '@radix-ui/react-slider'
import * as Select from '@radix-ui/react-select'
import { ExcelLevelChart } from '@/components/charts/ExcelLevelChart'
import { AdvancedFormatPanel } from '@/components/slides/AdvancedFormatPanel'
import { SlideElementRenderer } from '@/components/slides/SlideElementRenderer'

interface SlideElement {
  id: string
  type: 'text' | 'shape' | 'image' | 'chart' | 'table' | 'smartart' | 'video' | 'audio'
  x: number
  y: number
  width: number
  height: number
  rotation: number
  zIndex: number
  locked: boolean
  grouped?: string
  content?: string
  
  // PowerPoint-level styling
  style: {
    // Typography
    fontSize: number
    fontFamily: string
    fontWeight: string
    fontStyle: string
    textDecoration: string
    textAlign: 'left' | 'center' | 'right' | 'justify'
    verticalAlign: 'top' | 'middle' | 'bottom'
    lineHeight: number
    letterSpacing: number
    color: string
    
    // Background & Border
    backgroundColor: string
    backgroundImage?: string
    backgroundGradient?: {
      type: 'linear' | 'radial'
      direction: number
      stops: Array<{ offset: number, color: string }>
    }
    borderColor: string
    borderWidth: number
    borderStyle: 'solid' | 'dashed' | 'dotted'
    borderRadius: number
    
    // Shadow & Effects
    shadow: {
      enabled: boolean
      color: string
      offsetX: number
      offsetY: number
      blur: number
      spread: number
    }
    
    // Animations
    entrance?: AnimationConfig
    emphasis?: AnimationConfig
    exit?: AnimationConfig
  }
  
  // Shape-specific properties
  shapeType?: 'rectangle' | 'circle' | 'triangle' | 'arrow' | 'star' | 'polygon'
  shapePoints?: Array<{ x: number, y: number }>
  
  // Image properties
  src?: string
  alt?: string
  crop?: { x: number, y: number, width: number, height: number }
  filters?: {
    brightness: number
    contrast: number
    saturation: number
    blur: number
    sepia: number
  }
  
  // Chart properties
  chartData?: any[]
  chartConfig?: any
  
  // Table properties
  tableData?: Array<Array<string>>
  tableHeaders?: string[]
  
  // Link properties
  link?: {
    type: 'url' | 'slide' | 'email' | 'file'
    target: string
    tooltip?: string
  }
}

interface AnimationConfig {
  type: string
  duration: number
  delay: number
  direction?: 'left' | 'right' | 'up' | 'down'
  intensity?: 'slow' | 'medium' | 'fast'
}

interface SlideData {
  id: string
  title: string
  layout: 'title' | 'content' | 'two-column' | 'comparison' | 'chart' | 'image' | 'blank'
  elements: SlideElement[]
  background: {
    type: 'solid' | 'gradient' | 'image' | 'pattern'
    value: string
    gradient?: {
      type: 'linear' | 'radial'
      direction: number
      stops: Array<{ offset: number, color: string }>
    }
    pattern?: string
  }
  transitions: {
    entrance: string
    exit: string
    duration: number
  }
  notes: string
  hiddenSlide: boolean
}

interface PowerPointSlideEditorProps {
  slide: SlideData
  onUpdate: (slide: SlideData) => void
  slideNumber: number
  masterSlides?: SlideData[]
  onApplyMaster?: (masterId: string) => void
}

const SLIDE_CONFIG = {
  width: 1280,
  height: 720,
  ratio: 16/9,
  gridSize: 10
}

const FONT_FAMILIES = [
  'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana',
  'Trebuchet MS', 'Arial Black', 'Impact', 'Comic Sans MS',
  'Courier New', 'Lucida Console', 'Tahoma', 'Palatino',
  'Garamond', 'Bookman', 'Avant Garde', 'Century Gothic'
]

const ANIMATION_TYPES = {
  entrance: [
    'fadeIn', 'slideInLeft', 'slideInRight', 'slideInUp', 'slideInDown',
    'zoomIn', 'bounceIn', 'rotateIn', 'flipInX', 'flipInY'
  ],
  emphasis: [
    'pulse', 'bounce', 'shake', 'swing', 'wobble',
    'flash', 'grow', 'shrink', 'spin', 'highlight'
  ],
  exit: [
    'fadeOut', 'slideOutLeft', 'slideOutRight', 'slideOutUp', 'slideOutDown',
    'zoomOut', 'bounceOut', 'rotateOut', 'flipOutX', 'flipOutY'
  ]
}

export function PowerPointSlideEditor({ slide, onUpdate, slideNumber, masterSlides, onApplyMaster }: PowerPointSlideEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [selectedElements, setSelectedElements] = useState<string[]>([])
  const [tool, setTool] = useState<'select' | 'text' | 'shape' | 'line' | 'chart'>('select')
  const [zoom, setZoom] = useState(1)
  const [showGrid, setShowGrid] = useState(true)
  const [showRulers, setShowRulers] = useState(true)
  const [showGuides, setShowGuides] = useState(true)
  const [clipboard, setClipboard] = useState<SlideElement[]>([])
  const [history, setHistory] = useState<SlideData[]>([slide])
  const [historyIndex, setHistoryIndex] = useState(0)
  
  // PowerPoint-style panels
  const [showFormatPanel, setShowFormatPanel] = useState(false)
  const [showAnimationPanel, setShowAnimationPanel] = useState(false)
  const [showSlideTransitions, setShowSlideTransitions] = useState(false)
  const [showMasterSlides, setShowMasterSlides] = useState(false)
  
  // Interaction states
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [elementStart, setElementStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [showContextMenu, setShowContextMenu] = useState<{ x: number, y: number, elementId?: string } | null>(null)

  // Save to history
  const saveToHistory = useCallback((newSlide: SlideData) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newSlide)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])

  // Update slide and save to history
  const updateSlide = useCallback((updates: Partial<SlideData>) => {
    const newSlide = { ...slide, ...updates }
    onUpdate(newSlide)
    saveToHistory(newSlide)
  }, [slide, onUpdate, saveToHistory])

  // Element manipulation functions
  const addElement = useCallback((type: SlideElement['type'], x = 100, y = 100) => {
    const newElement: SlideElement = {
      id: `element-${Date.now()}`,
      type,
      x,
      y,
      width: type === 'text' ? 300 : type === 'chart' ? 400 : 200,
      height: type === 'text' ? 60 : type === 'chart' ? 300 : 150,
      rotation: 0,
      zIndex: slide.elements.length,
      locked: false,
      style: {
        fontSize: 18,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'none',
        textAlign: 'left',
        verticalAlign: 'top',
        lineHeight: 1.4,
        letterSpacing: 0,
        color: '#000000',
        backgroundColor: type === 'shape' ? '#4F46E5' : 'transparent',
        borderColor: 'transparent',
        borderWidth: 0,
        borderStyle: 'solid',
        borderRadius: 0,
        shadow: {
          enabled: false,
          color: '#000000',
          offsetX: 0,
          offsetY: 0,
          blur: 0,
          spread: 0
        }
      }
    }

    // Type-specific initialization
    switch (type) {
      case 'text':
        newElement.content = 'Click to edit text'
        break
      case 'shape':
        newElement.shapeType = 'rectangle'
        break
      case 'image':
        newElement.src = undefined
        newElement.alt = 'Image placeholder'
        break
      case 'chart':
        newElement.chartData = []
        break
      case 'table':
        newElement.tableData = [['Header 1', 'Header 2'], ['Cell 1', 'Cell 2']]
        newElement.tableHeaders = ['Header 1', 'Header 2']
        break
    }

    updateSlide({ elements: [...slide.elements, newElement] })
    setSelectedElements([newElement.id])
  }, [slide.elements, updateSlide])

  const updateElement = useCallback((elementId: string, updates: Partial<SlideElement>) => {
    const newElements = slide.elements.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    )
    updateSlide({ elements: newElements })
  }, [slide.elements, updateSlide])

  const deleteElements = useCallback((elementIds: string[]) => {
    const newElements = slide.elements.filter(el => !elementIds.includes(el.id))
    updateSlide({ elements: newElements })
    setSelectedElements([])
  }, [slide.elements, updateSlide])

  const duplicateElements = useCallback((elementIds: string[]) => {
    const elementsToDuplicate = slide.elements.filter(el => elementIds.includes(el.id))
    const duplicatedElements = elementsToDuplicate.map(el => ({
      ...el,
      id: `element-${Date.now()}-${Math.random()}`,
      x: el.x + 20,
      y: el.y + 20,
      zIndex: slide.elements.length + 1
    }))
    
    updateSlide({ elements: [...slide.elements, ...duplicatedElements] })
    setSelectedElements(duplicatedElements.map(el => el.id))
  }, [slide.elements, updateSlide])

  const groupElements = useCallback((elementIds: string[]) => {
    if (elementIds.length < 2) return
    
    const groupId = `group-${Date.now()}`
    const newElements = slide.elements.map(el => 
      elementIds.includes(el.id) ? { ...el, grouped: groupId } : el
    )
    updateSlide({ elements: newElements })
  }, [slide.elements, updateSlide])

  const ungroupElements = useCallback((elementIds: string[]) => {
    const element = slide.elements.find(el => elementIds.includes(el.id))
    if (!element?.grouped) return
    
    const newElements = slide.elements.map(el => 
      el.grouped === element.grouped ? { ...el, grouped: undefined } : el
    )
    updateSlide({ elements: newElements })
  }, [slide.elements, updateSlide])

  // Copy/Paste functionality
  const copyElements = useCallback(() => {
    const elementsToCopy = slide.elements.filter(el => selectedElements.includes(el.id))
    setClipboard(elementsToCopy)
  }, [selectedElements, slide.elements])

  const pasteElements = useCallback(() => {
    if (clipboard.length === 0) return
    
    const pastedElements = clipboard.map(el => ({
      ...el,
      id: `element-${Date.now()}-${Math.random()}`,
      x: el.x + 20,
      y: el.y + 20,
      zIndex: slide.elements.length + 1
    }))
    
    updateSlide({ elements: [...slide.elements, ...pastedElements] })
    setSelectedElements(pastedElements.map(el => el.id))
  }, [clipboard, slide.elements, updateSlide])

  // Alignment functions
  const alignElements = useCallback((alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    const elementsToAlign = slide.elements.filter(el => selectedElements.includes(el.id))
    if (elementsToAlign.length < 2) return
    
    const bounds = {
      left: Math.min(...elementsToAlign.map(el => el.x)),
      right: Math.max(...elementsToAlign.map(el => el.x + el.width)),
      top: Math.min(...elementsToAlign.map(el => el.y)),
      bottom: Math.max(...elementsToAlign.map(el => el.y + el.height))
    }
    
    const centerX = (bounds.left + bounds.right) / 2
    const centerY = (bounds.top + bounds.bottom) / 2
    
    const newElements = slide.elements.map(el => {
      if (!selectedElements.includes(el.id)) return el
      
      let updates: Partial<SlideElement> = {}
      
      switch (alignment) {
        case 'left':
          updates.x = bounds.left
          break
        case 'center':
          updates.x = centerX - el.width / 2
          break
        case 'right':
          updates.x = bounds.right - el.width
          break
        case 'top':
          updates.y = bounds.top
          break
        case 'middle':
          updates.y = centerY - el.height / 2
          break
        case 'bottom':
          updates.y = bounds.bottom - el.height
          break
      }
      
      return { ...el, ...updates }
    })
    
    updateSlide({ elements: newElements })
  }, [selectedElements, slide.elements, updateSlide])

  // Layer management
  const moveLayer = useCallback((elementIds: string[], direction: 'front' | 'back' | 'forward' | 'backward') => {
    const newElements = [...slide.elements]
    
    elementIds.forEach(elementId => {
      const elementIndex = newElements.findIndex(el => el.id === elementId)
      if (elementIndex === -1) return
      
      const element = newElements[elementIndex]
      
      switch (direction) {
        case 'front':
          element.zIndex = Math.max(...newElements.map(el => el.zIndex)) + 1
          break
        case 'back':
          element.zIndex = Math.min(...newElements.map(el => el.zIndex)) - 1
          break
        case 'forward':
          element.zIndex += 1
          break
        case 'backward':
          element.zIndex -= 1
          break
      }
    })
    
    updateSlide({ elements: newElements })
  }, [slide.elements, updateSlide])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      
      const isCmd = e.metaKey || e.ctrlKey
      const isShift = e.shiftKey
      
      if (isCmd) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault()
            if (isShift) {
              // Redo
              if (historyIndex < history.length - 1) {
                const newIndex = historyIndex + 1
                setHistoryIndex(newIndex)
                onUpdate(history[newIndex])
              }
            } else {
              // Undo
              if (historyIndex > 0) {
                const newIndex = historyIndex - 1
                setHistoryIndex(newIndex)
                onUpdate(history[newIndex])
              }
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
            setSelectedElements(slide.elements.map(el => el.id))
            break
          case 'd':
            e.preventDefault()
            duplicateElements(selectedElements)
            break
          case 'g':
            e.preventDefault()
            if (isShift) {
              ungroupElements(selectedElements)
            } else {
              groupElements(selectedElements)
            }
            break
        }
      }
      
      // Non-modifier shortcuts
      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          e.preventDefault()
          deleteElements(selectedElements)
          break
        case 'Escape':
          setSelectedElements([])
          setTool('select')
          break
        case 'ArrowLeft':
          e.preventDefault()
          moveSelectedElements(-1, 0, isShift ? 10 : 1)
          break
        case 'ArrowRight':
          e.preventDefault()
          moveSelectedElements(1, 0, isShift ? 10 : 1)
          break
        case 'ArrowUp':
          e.preventDefault()
          moveSelectedElements(0, -1, isShift ? 10 : 1)
          break
        case 'ArrowDown':
          e.preventDefault()
          moveSelectedElements(0, 1, isShift ? 10 : 1)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedElements, history, historyIndex, onUpdate, copyElements, pasteElements, duplicateElements, groupElements, ungroupElements, deleteElements])

  const moveSelectedElements = (deltaX: number, deltaY: number, multiplier = 1) => {
    const newElements = slide.elements.map(el => {
      if (selectedElements.includes(el.id)) {
        return {
          ...el,
          x: el.x + (deltaX * multiplier),
          y: el.y + (deltaY * multiplier)
        }
      }
      return el
    })
    updateSlide({ elements: newElements })
  }

  // Context menu
  const handleContextMenu = (e: React.MouseEvent, elementId?: string) => {
    e.preventDefault()
    setShowContextMenu({
      x: e.clientX,
      y: e.clientY,
      elementId
    })
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* PowerPoint-style Ribbon Toolbar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <PowerPointRibbon
          tool={tool}
          onToolChange={setTool}
          selectedElements={selectedElements}
          onAddElement={addElement}
          onAlignElements={alignElements}
          onMoveLayer={moveLayer}
          onFormatPanel={() => setShowFormatPanel(!showFormatPanel)}
          onAnimationPanel={() => setShowAnimationPanel(!showAnimationPanel)}
          onTransitionsPanel={() => setShowSlideTransitions(!showSlideTransitions)}
          onMasterSlides={() => setShowMasterSlides(!showMasterSlides)}
          zoom={zoom}
          onZoomChange={setZoom}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid(!showGrid)}
          showRulers={showRulers}
          onToggleRulers={() => setShowRulers(!showRulers)}
          showGuides={showGuides}
          onToggleGuides={() => setShowGuides(!showGuides)}
        />
      </div>

      <div className="flex-1 flex">
        {/* Slide Thumbnails Panel */}
        <SlideThumbnailPanel
          currentSlide={slide}
          slideNumber={slideNumber}
          onSlideUpdate={updateSlide}
        />

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Rulers */}
          {showRulers && <SlideRulers zoom={zoom} />}
          
          {/* Canvas */}
          <div className="flex-1 overflow-auto bg-gray-200 p-8 relative">
            <div className="flex items-center justify-center min-h-full">
              <motion.div
                ref={canvasRef}
                className="relative bg-white shadow-xl"
                style={{
                  width: SLIDE_CONFIG.width,
                  height: SLIDE_CONFIG.height,
                  transformOrigin: 'center'
                }}
                animate={{ scale: zoom }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                onContextMenu={(e) => handleContextMenu(e)}
              >
                {/* Grid overlay */}
                {showGrid && (
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                      backgroundImage: `
                        linear-gradient(to right, #000 1px, transparent 1px),
                        linear-gradient(to bottom, #000 1px, transparent 1px)
                      `,
                      backgroundSize: `${SLIDE_CONFIG.gridSize * zoom}px ${SLIDE_CONFIG.gridSize * zoom}px`
                    }}
                  />
                )}

                {/* Slide background */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: slide.background.type === 'solid' 
                      ? slide.background.value
                      : slide.background.type === 'gradient' && slide.background.gradient
                        ? `linear-gradient(${slide.background.gradient.direction}deg, ${slide.background.gradient.stops.map(stop => `${stop.color} ${stop.offset}%`).join(', ')})`
                        : slide.background.type === 'image' 
                          ? `url(${slide.background.value}) center/cover`
                          : '#FFFFFF'
                  }}
                />

                {/* Slide elements */}
                <AnimatePresence>
                  {slide.elements
                    .sort((a, b) => a.zIndex - b.zIndex)
                    .map(element => (
                      <SlideElementRenderer
                        key={element.id}
                        element={element}
                        isSelected={selectedElements.includes(element.id)}
                        onSelect={(elementId: string, addToSelection: boolean) => {
                          if (addToSelection) {
                            setSelectedElements(prev => [...prev, elementId])
                          } else {
                            setSelectedElements([elementId])
                          }
                        }}
                        onUpdate={(updates: any) => updateElement(element.id, updates as Partial<SlideElement>)}
                        onContextMenu={(e: React.MouseEvent) => handleContextMenu(e, element.id)}
                        zoom={zoom}
                        showGuides={showGuides}
                      />
                    ))}
                </AnimatePresence>

                {/* Selection rectangle for multi-select */}
                {tool === 'select' && (
                  <SelectionRectangle 
                    onElementsSelected={setSelectedElements}
                    elements={slide.elements}
                    zoom={zoom}
                  />
                )}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Format Panel */}
        <AnimatePresence>
          {showFormatPanel && (
            <FormatPanel
              selectedElements={selectedElements}
              elements={slide.elements}
              onUpdateElement={updateElement}
              onClose={() => setShowFormatPanel(false)}
            />
          )}
        </AnimatePresence>

        {/* Animation Panel */}
        <AnimatePresence>
          {showAnimationPanel && (
            <AnimationPanel
              selectedElements={selectedElements}
              elements={slide.elements}
              onUpdateElement={updateElement}
              onClose={() => setShowAnimationPanel(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {showContextMenu && (
          <ContextMenu
            x={showContextMenu.x}
            y={showContextMenu.y}
            elementId={showContextMenu.elementId}
            onClose={() => setShowContextMenu(null)}
            onCopy={copyElements}
            onPaste={pasteElements}
            onDelete={() => showContextMenu.elementId && deleteElements([showContextMenu.elementId])}
            onDuplicate={() => showContextMenu.elementId && duplicateElements([showContextMenu.elementId])}
            onGroup={() => selectedElements.length > 1 && groupElements(selectedElements)}
            onUngroup={() => ungroupElements(selectedElements)}
            onMoveLayer={moveLayer}
            hasClipboard={clipboard.length > 0}
            selectedCount={selectedElements.length}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// PowerPoint-style Ribbon Component
function PowerPointRibbon({ 
  tool, onToolChange, selectedElements, onAddElement, onAlignElements, 
  onMoveLayer, onFormatPanel, onAnimationPanel, onTransitionsPanel, onMasterSlides,
  zoom, onZoomChange, showGrid, onToggleGrid, showRulers, onToggleRulers,
  showGuides, onToggleGuides
}: any) {
  const [activeTab, setActiveTab] = useState<'home' | 'insert' | 'design' | 'transitions' | 'animations' | 'view'>('home')

  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'insert', label: 'Insert' },
    { id: 'design', label: 'Design' },
    { id: 'transitions', label: 'Transitions' },
    { id: 'animations', label: 'Animations' },
    { id: 'view', label: 'View' }
  ]

  return (
    <div className="px-4 py-2">
      {/* Tab Headers */}
      <div className="flex items-center gap-6 mb-3 border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-2 text-sm font-medium transition-colors relative ${
              activeTab === tab.id 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex items-center gap-6">
        {activeTab === 'home' && (
          <>
            {/* Clipboard Group */}
            <div className="flex items-center gap-2 pr-4 border-r border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Clipboard</div>
              <Button size="sm" variant="ghost" title="Paste">
                <Clipboard className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" title="Copy">
                <Copy className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" title="Cut">
                <Scissors className="w-4 h-4" />
              </Button>
            </div>

            {/* Font Group */}
            <div className="flex items-center gap-2 pr-4 border-r border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Font</div>
              <select className="text-sm border border-gray-300 rounded px-2 py-1">
                {FONT_FAMILIES.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
              <select className="text-sm border border-gray-300 rounded px-2 py-1 w-16">
                {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <Button size="sm" variant="ghost" title="Bold">
                <Bold className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" title="Italic">
                <Italic className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" title="Underline">
                <Underline className="w-4 h-4" />
              </Button>
            </div>

            {/* Paragraph Group */}
            <div className="flex items-center gap-2 pr-4 border-r border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Paragraph</div>
              <Button size="sm" variant="ghost" title="Align Left" onClick={() => onAlignElements('left')}>
                <AlignLeft className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" title="Align Center" onClick={() => onAlignElements('center')}>
                <AlignCenter className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" title="Align Right" onClick={() => onAlignElements('right')}>
                <AlignRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Arrange Group */}
            <div className="flex items-center gap-2 pr-4 border-r border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Arrange</div>
              <Button size="sm" variant="ghost" title="Bring to Front" onClick={() => onMoveLayer(selectedElements, 'front')}>
                <ArrowUp className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" title="Send to Back" onClick={() => onMoveLayer(selectedElements, 'back')}>
                <ArrowDown className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" title="Group">
                <Layers className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}

        {activeTab === 'insert' && (
          <>
            {/* Content Group */}
            <div className="flex items-center gap-2 pr-4 border-r border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Content</div>
              <Button size="sm" variant="ghost" onClick={() => onAddElement('text')} title="Text Box">
                <Type className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onAddElement('image')} title="Image">
                <ImageIcon className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onAddElement('table')} title="Table">
                <Table className="w-4 h-4" />
              </Button>
            </div>

            {/* Shapes Group */}
            <div className="flex items-center gap-2 pr-4 border-r border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Shapes</div>
              <Button size="sm" variant="ghost" onClick={() => onAddElement('shape')} title="Rectangle">
                <Square className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onAddElement('shape')} title="Circle">
                <Circle className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onAddElement('shape')} title="Triangle">
                <Triangle className="w-4 h-4" />
              </Button>
            </div>

            {/* Charts Group */}
            <div className="flex items-center gap-2 pr-4 border-r border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Charts</div>
              <Button size="sm" variant="ghost" onClick={() => onAddElement('chart')} title="Chart">
                <BarChart3 className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" title="Line Chart">
                <LineChart className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" title="Pie Chart">
                <PieChart className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}

        {activeTab === 'view' && (
          <>
            {/* Show Group */}
            <div className="flex items-center gap-2 pr-4 border-r border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Show</div>
              <Button 
                size="sm" 
                variant={showRulers ? "default" : "ghost"} 
                onClick={onToggleRulers} 
                title="Rulers"
              >
                Rulers
              </Button>
              <Button 
                size="sm" 
                variant={showGrid ? "default" : "ghost"} 
                onClick={onToggleGrid} 
                title="Gridlines"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant={showGuides ? "default" : "ghost"} 
                onClick={onToggleGuides} 
                title="Guides"
              >
                Guides
              </Button>
            </div>

            {/* Zoom Group */}
            <div className="flex items-center gap-2 pr-4 border-r border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Zoom</div>
              <Button size="sm" variant="ghost" onClick={() => onZoomChange(Math.max(0.1, zoom - 0.1))}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium min-w-[4rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button size="sm" variant="ghost" onClick={() => onZoomChange(Math.min(3, zoom + 0.1))}>
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>

            {/* Master Slides */}
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={onMasterSlides} title="Master Slides">
                <FileText className="w-4 h-4" />
                Master
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Placeholder components - these would need to be implemented
const SlideThumbnailPanel = ({ slides, currentSlide, onSlideSelect }: any) => (
  <div className="w-64 bg-gray-100 border-r border-gray-200 p-4">
    <h3 className="font-semibold mb-2">Slides</h3>
    <div className="space-y-2">
      {slides?.map((slide: any, index: number) => (
        <div 
          key={slide.id}
          className={`p-2 border rounded cursor-pointer ${
            currentSlide?.id === slide.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onClick={() => onSlideSelect?.(index)}
        >
          <div className="text-xs font-medium">{slide.title}</div>
        </div>
      ))}
    </div>
  </div>
)

const SlideRulers = ({ zoom }: { zoom: number }) => (
  <div className="absolute top-0 left-0 w-full h-6 bg-gray-100 border-b border-gray-200">
    {/* Ruler implementation */}
  </div>
)

const SelectionRectangle = ({ bounds, onResize }: any) => (
  <div 
    className="absolute border-2 border-blue-500 pointer-events-none"
    style={{
      left: bounds.x,
      top: bounds.y,
      width: bounds.width,
      height: bounds.height
    }}
  />
)

const FormatPanel = ({ selectedElements, onClose }: any) => (
  <div className="w-80 bg-white border-l border-gray-200 p-4">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold">Format</h3>
      <Button variant="ghost" size="sm" onClick={onClose}>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
    {/* Format panel content */}
  </div>
)

const AnimationPanel = ({ slide, onClose }: any) => (
  <div className="w-80 bg-white border-l border-gray-200 p-4">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold">Animations</h3>
      <Button variant="ghost" size="sm" onClick={onClose}>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
    {/* Animation panel content */}
  </div>
)

const ContextMenu = ({ x, y, onClose, children }: any) => (
  <div 
    className="absolute bg-white border border-gray-200 rounded-lg shadow-lg z-50"
    style={{ left: x, top: y }}
  >
    {children}
  </div>
)

export default PowerPointSlideEditor