'use client'

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence, PanInfo, useDragControls } from 'framer-motion'
import { 
  Type, Image, BarChart3, PieChart, LineChart, TrendingUp, Table2, 
  Video, Mic, Square, Circle, Triangle, Minus, Plus, RotateCcw, 
  RotateCw, Layers, Eye, EyeOff, Lock, Unlock, Copy, Trash2, 
  Move, MousePointer2, Palette, Grid3X3, ZoomIn, ZoomOut,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic,
  Underline, Link, List, FileImage, Sparkles, Wand2, Settings,
  MoreHorizontal, ChevronDown, Search, Star, Heart, Zap,
  Download, Share2, Play, Pause, FastForward, Rewind
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'react-hot-toast'

// Advanced element types
interface SlideElement {
  id: string
  type: 'text' | 'image' | 'chart' | 'shape' | 'video' | 'audio' | 'table' | 'icon' | 'line' | 'group'
  position: { x: number; y: number }
  size: { width: number; height: number }
  rotation: number
  opacity: number
  zIndex: number
  locked: boolean
  visible: boolean
  content: any
  style: {
    background?: string
    border?: string
    borderRadius?: number
    shadow?: string
    fontFamily?: string
    fontSize?: number
    fontWeight?: string
    color?: string
    textAlign?: 'left' | 'center' | 'right' | 'justify'
    padding?: number
    [key: string]: any
  }
  animation?: {
    entrance?: string
    exit?: string
    emphasis?: string
    duration?: number
    delay?: number
  }
  interactions?: {
    onClick?: string
    onHover?: string
    link?: string
  }
}

interface WorldClassSlideBuilderProps {
  slideId?: string
  initialElements?: SlideElement[]
  onSave?: (elements: SlideElement[]) => void
  onPreview?: () => void
  className?: string
}

// Professional color palettes
const COLOR_PALETTES = {
  corporate: {
    name: 'Corporate Blue',
    colors: ['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe', '#f8fafc']
  },
  modern: {
    name: 'Modern Purple',
    colors: ['#581c87', '#7c3aed', '#8b5cf6', '#a78bfa', '#ddd6fe', '#f5f3ff']
  },
  nature: {
    name: 'Nature Green', 
    colors: ['#14532d', '#16a34a', '#22c55e', '#4ade80', '#bbf7d0', '#f0fdf4']
  },
  sunset: {
    name: 'Sunset Orange',
    colors: ['#9a3412', '#ea580c', '#f97316', '#fb923c', '#fed7aa', '#fff7ed']
  },
  ocean: {
    name: 'Ocean Teal',
    colors: ['#134e4a', '#0f766e', '#14b8a6', '#5eead4', '#99f6e4', '#f0fdfa']
  },
  monochrome: {
    name: 'Monochrome',
    colors: ['#000000', '#374151', '#6b7280', '#9ca3af', '#e5e7eb', '#ffffff']
  }
}

// Professional font combinations
const FONT_COMBINATIONS = [
  { name: 'Corporate Classic', heading: 'Inter', body: 'Inter' },
  { name: 'Modern Sans', heading: 'Poppins', body: 'Open Sans' },
  { name: 'Professional', heading: 'Roboto', body: 'Roboto' },
  { name: 'Editorial', heading: 'Playfair Display', body: 'Source Sans Pro' },
  { name: 'Tech Forward', heading: 'Space Grotesk', body: 'DM Sans' },
  { name: 'Minimal', heading: 'IBM Plex Sans', body: 'IBM Plex Sans' }
]

// Chart templates
const CHART_TEMPLATES = [
  { type: 'bar', name: 'Bar Chart', icon: BarChart3, description: 'Compare categories' },
  { type: 'line', name: 'Line Chart', icon: LineChart, description: 'Show trends over time' },
  { type: 'pie', name: 'Pie Chart', icon: PieChart, description: 'Show proportions' },
  { type: 'area', name: 'Area Chart', icon: TrendingUp, description: 'Cumulative data' },
  { type: 'scatter', name: 'Scatter Plot', icon: Circle, description: 'Show correlations' },
  { type: 'heatmap', name: 'Heatmap', icon: Grid3X3, description: 'Intensity mapping' }
]

// Shape templates
const SHAPE_TEMPLATES = [
  { type: 'rectangle', name: 'Rectangle', icon: Square },
  { type: 'circle', name: 'Circle', icon: Circle },
  { type: 'triangle', name: 'Triangle', icon: Triangle },
  { type: 'line', name: 'Line', icon: Minus },
  { type: 'arrow', name: 'Arrow', icon: MousePointer2 }
]

// Snap guidelines
const SNAP_THRESHOLD = 8
const GUIDELINES = {
  vertical: [] as number[],
  horizontal: [] as number[]
}

export function WorldClassSlideBuilder({
  slideId = 'new-slide',
  initialElements = [],
  onSave,
  onPreview,
  className = ''
}: WorldClassSlideBuilderProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [elements, setElements] = useState<SlideElement[]>(initialElements)
  const [selectedElements, setSelectedElements] = useState<string[]>([])
  const [selectedTool, setSelectedTool] = useState<string>('select')
  const [zoom, setZoom] = useState(100)
  const [showGrid, setShowGrid] = useState(true)
  const [showRulers, setShowRulers] = useState(true)
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [snapToElements, setSnapToElements] = useState(true)
  const [guidelines, setGuidelines] = useState<{vertical: number[], horizontal: number[]}>({vertical: [], horizontal: []})
  const [isDragging, setIsDragging] = useState(false)
  const [dragPreview, setDragPreview] = useState<{x: number, y: number, visible: boolean}>({x: 0, y: 0, visible: false})
  const [history, setHistory] = useState<SlideElement[][]>([initialElements])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [currentTheme, setCurrentTheme] = useState('corporate')
  const [currentFont, setCurrentFont] = useState(0)
  const [showElementPanel, setShowElementPanel] = useState(true)
  const [showStylePanel, setShowStylePanel] = useState(true)
  const [showLayersPanel, setShowLayersPanel] = useState(false)
  const [showAnimationPanel, setShowAnimationPanel] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  // Calculate canvas dimensions
  const canvasSize = useMemo(() => ({
    width: 1920 * (zoom / 100),
    height: 1080 * (zoom / 100)
  }), [zoom])

  // Generate snap guidelines from existing elements
  const generateGuidelines = useCallback((excludeIds: string[] = []) => {
    const vertical: number[] = []
    const horizontal: number[] = []
    
    elements.forEach(element => {
      if (excludeIds.includes(element.id)) return
      
      const { x, y } = element.position
      const { width, height } = element.size
      
      // Add element boundaries to guidelines
      vertical.push(x, x + width, x + width / 2)
      horizontal.push(y, y + height, y + height / 2)
    })
    
    // Add canvas guidelines
    vertical.push(0, canvasSize.width, canvasSize.width / 2)
    horizontal.push(0, canvasSize.height, canvasSize.height / 2)
    
    return { vertical: [...new Set(vertical)], horizontal: [...new Set(horizontal)] }
  }, [elements, canvasSize])

  // Snap position to grid or guidelines
  const snapPosition = useCallback((x: number, y: number, excludeIds: string[] = []) => {
    let snappedX = x
    let snappedY = y
    const activeGuidelines = generateGuidelines(excludeIds)
    
    if (snapToGrid) {
      const gridSize = 20 * (zoom / 100)
      snappedX = Math.round(x / gridSize) * gridSize
      snappedY = Math.round(y / gridSize) * gridSize
    }
    
    if (snapToElements) {
      // Snap to vertical guidelines
      const closestVertical = activeGuidelines.vertical.reduce((closest, guideline) => 
        Math.abs(guideline - x) < Math.abs(closest - x) ? guideline : closest
      )
      if (Math.abs(closestVertical - x) < SNAP_THRESHOLD) {
        snappedX = closestVertical
      }
      
      // Snap to horizontal guidelines
      const closestHorizontal = activeGuidelines.horizontal.reduce((closest, guideline) => 
        Math.abs(guideline - y) < Math.abs(closest - y) ? guideline : closest
      )
      if (Math.abs(closestHorizontal - y) < SNAP_THRESHOLD) {
        snappedY = closestHorizontal
      }
    }
    
    return { x: snappedX, y: snappedY }
  }, [snapToGrid, snapToElements, zoom, generateGuidelines])

  // Add element to canvas
  const addElement = useCallback((type: string, position: { x: number; y: number }) => {
    const newElement: SlideElement = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: type as any,
      position: snapPosition(position.x, position.y),
      size: getDefaultSize(type),
      rotation: 0,
      opacity: 1,
      zIndex: elements.length,
      locked: false,
      visible: true,
      content: getDefaultContent(type),
      style: getDefaultStyle(type, currentTheme),
      animation: {
        entrance: 'fadeIn',
        duration: 0.5,
        delay: 0
      },
      interactions: {}
    }
    
    const newElements = [...elements, newElement]
    setElements(newElements)
    setSelectedElements([newElement.id])
    addToHistory(newElements)
    setSelectedTool('select')
    
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added to slide`)
  }, [elements, snapPosition, currentTheme])

  // Get default size for element type
  const getDefaultSize = (type: string) => {
    const scale = zoom / 100
    switch (type) {
      case 'text': return { width: 200 * scale, height: 40 * scale }
      case 'image': return { width: 300 * scale, height: 200 * scale }
      case 'chart': return { width: 400 * scale, height: 300 * scale }
      case 'table': return { width: 350 * scale, height: 200 * scale }
      case 'video': return { width: 480 * scale, height: 270 * scale }
      case 'audio': return { width: 300 * scale, height: 60 * scale }
      case 'shape': return { width: 100 * scale, height: 100 * scale }
      case 'icon': return { width: 60 * scale, height: 60 * scale }
      case 'line': return { width: 200 * scale, height: 2 * scale }
      default: return { width: 100 * scale, height: 100 * scale }
    }
  }

  // Get default content for element type
  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'text': return { text: 'Click to edit text', html: false }
      case 'image': return { src: '', alt: 'Image placeholder', caption: '' }
      case 'chart': return { type: 'bar', data: [], title: 'Chart Title' }
      case 'table': return { rows: 3, cols: 3, data: [], headers: true }
      case 'video': return { src: '', poster: '', controls: true }
      case 'audio': return { src: '', controls: true }
      case 'shape': return { shape: 'rectangle', fill: COLOR_PALETTES[currentTheme].colors[0] }
      case 'icon': return { name: 'star', family: 'lucide' }
      case 'line': return { thickness: 2, style: 'solid' }
      default: return {}
    }
  }

  // Get default style for element type
  const getDefaultStyle = (type: string, theme: string) => {
    const palette = COLOR_PALETTES[theme as keyof typeof COLOR_PALETTES]
    const font = FONT_COMBINATIONS[currentFont]
    
    const baseStyle = {
      fontFamily: font.body,
      color: palette.colors[0],
      background: 'transparent',
      border: 'none',
      borderRadius: 4,
      padding: 12,
      textAlign: 'left' as const
    }

    switch (type) {
      case 'text':
        return {
          ...baseStyle,
          fontSize: 16,
          fontWeight: '400',
          lineHeight: 1.4
        }
      case 'chart':
        return {
          ...baseStyle,
          background: palette.colors[5],
          border: `1px solid ${palette.colors[3]}`,
          borderRadius: 8
        }
      case 'image':
        return {
          ...baseStyle,
          border: `1px solid ${palette.colors[4]}`,
          borderRadius: 8,
          background: palette.colors[5]
        }
      case 'shape':
        return {
          ...baseStyle,
          background: palette.colors[1],
          border: 'none'
        }
      default:
        return baseStyle
    }
  }

  // Handle canvas click
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (selectedTool === 'select') {
      setSelectedElements([])
      return
    }

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = (e.clientX - rect.left) / (zoom / 100)
    const y = (e.clientY - rect.top) / (zoom / 100)

    addElement(selectedTool, { x, y })
  }, [selectedTool, zoom, addElement])

  // Handle element selection
  const handleElementSelect = useCallback((elementId: string, multiSelect = false) => {
    if (multiSelect) {
      setSelectedElements(prev => 
        prev.includes(elementId) 
          ? prev.filter(id => id !== elementId)
          : [...prev, elementId]
      )
    } else {
      setSelectedElements([elementId])
    }
  }, [])

  // Handle element drag
  const handleElementDrag = useCallback((elementId: string, info: PanInfo) => {
    const delta = {
      x: info.delta.x / (zoom / 100),
      y: info.delta.y / (zoom / 100)
    }

    setElements(prev => prev.map(element => {
      if (selectedElements.includes(element.id)) {
        const newPosition = {
          x: element.position.x + delta.x,
          y: element.position.y + delta.y
        }
        const snapped = snapPosition(newPosition.x, newPosition.y, selectedElements)
        return { ...element, position: snapped }
      }
      return element
    }))
  }, [selectedElements, zoom, snapPosition])

  // Handle element resize
  const handleElementResize = useCallback((elementId: string, newSize: { width: number; height: number }) => {
    setElements(prev => prev.map(element => 
      element.id === elementId 
        ? { ...element, size: newSize }
        : element
    ))
  }, [])

  // Add to history for undo/redo
  const addToHistory = useCallback((newElements: SlideElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push([...newElements])
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])

  // Undo/Redo functions
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setElements([...history[historyIndex - 1]])
    }
  }, [historyIndex, history])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setElements([...history[historyIndex + 1]])
    }
  }, [historyIndex, history])

  // Delete selected elements
  const deleteSelected = useCallback(() => {
    const newElements = elements.filter(element => !selectedElements.includes(element.id))
    setElements(newElements)
    setSelectedElements([])
    addToHistory(newElements)
    toast.success('Elements deleted')
  }, [elements, selectedElements, addToHistory])

  // Duplicate selected elements
  const duplicateSelected = useCallback(() => {
    const newElements = [...elements]
    const duplicated: string[] = []
    
    selectedElements.forEach(elementId => {
      const element = elements.find(el => el.id === elementId)
      if (element) {
        const duplicate: SlideElement = {
          ...element,
          id: `${element.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          position: {
            x: element.position.x + 20,
            y: element.position.y + 20
          },
          zIndex: newElements.length
        }
        newElements.push(duplicate)
        duplicated.push(duplicate.id)
      }
    })
    
    setElements(newElements)
    setSelectedElements(duplicated)
    addToHistory(newElements)
    toast.success('Elements duplicated')
  }, [elements, selectedElements, addToHistory])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
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
            // Copy logic
            break
          case 'v':
            e.preventDefault()
            // Paste logic
            break
          case 'd':
            e.preventDefault()
            duplicateSelected()
            break
          case 's':
            e.preventDefault()
            onSave?.(elements)
            break
        }
      } else {
        switch (e.key) {
          case 'Delete':
          case 'Backspace':
            e.preventDefault()
            deleteSelected()
            break
          case 'Escape':
            setSelectedElements([])
            setSelectedTool('select')
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, duplicateSelected, deleteSelected, elements, onSave])

  // Auto-save
  useEffect(() => {
    const timer = setInterval(() => {
      onSave?.(elements)
    }, 10000) // Auto-save every 10 seconds

    return () => clearInterval(timer)
  }, [elements, onSave])

  return (
    <div className={`flex h-screen bg-gray-50 ${className}`}>
      {/* Left Sidebar - Element Library */}
      <AnimatePresence>
        {showElementPanel && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="w-80 bg-white border-r border-gray-200 flex flex-col"
          >
            {/* Element Library Header */}
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Elements</h2>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search elements..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Element Categories */}
            <div className="flex-1 overflow-y-auto">
              {/* Text Elements */}
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Text & Content</h3>
                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedTool('text')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedTool === 'text' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Type className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-xs">Text</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedTool('image')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedTool === 'image' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-xs">Image</span>
                  </motion.button>
                </div>
              </div>

              {/* Charts */}
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Charts & Data</h3>
                <div className="grid grid-cols-2 gap-2">
                  {CHART_TEMPLATES.map((chart) => (
                    <motion.button
                      key={chart.type}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedTool('chart')}
                      className="p-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all"
                    >
                      <chart.icon className="w-6 h-6 mx-auto mb-1" />
                      <span className="text-xs">{chart.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Shapes */}
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Shapes</h3>
                <div className="grid grid-cols-2 gap-2">
                  {SHAPE_TEMPLATES.map((shape) => (
                    <motion.button
                      key={shape.type}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedTool('shape')}
                      className="p-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all"
                    >
                      <shape.icon className="w-6 h-6 mx-auto mb-1" />
                      <span className="text-xs">{shape.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Media */}
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Media</h3>
                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedTool('video')}
                    className="p-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all"
                  >
                    <Video className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-xs">Video</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedTool('audio')}
                    className="p-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all"
                  >
                    <Mic className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-xs">Audio</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
          {/* Left Side Tools */}
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedTool('select')}
              className={`p-2 rounded-lg ${
                selectedTool === 'select' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <MousePointer2 className="w-5 h-5" />
            </motion.button>

            <div className="h-6 w-px bg-gray-300" />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCw className="w-5 h-5" />
            </motion.button>

            <div className="h-6 w-px bg-gray-300" />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded-lg ${
                showGrid 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <Grid3X3 className="w-5 h-5" />
            </motion.button>

            <div className="h-6 w-px bg-gray-300" />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setZoom(Math.max(25, zoom - 25))}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              <ZoomOut className="w-5 h-5" />
            </motion.button>

            <span className="text-sm font-medium min-w-[50px] text-center">{zoom}%</span>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setZoom(Math.min(400, zoom + 25))}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              <ZoomIn className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Center - Slide Title */}
          <div className="flex-1 text-center">
            <input
              type="text"
              placeholder="Slide Title"
              className="text-lg font-medium text-gray-900 bg-transparent border-none outline-none text-center"
              defaultValue="Untitled Slide"
            />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-2 rounded-lg ${
                isPlaying 
                  ? 'bg-red-500 text-white' 
                  : 'bg-green-500 text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPreview}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Preview
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSave?.(elements)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Save
            </motion.button>
          </div>
        </div>

        {/* Canvas Container */}
        <div className="flex-1 overflow-hidden bg-gray-100 relative">
          <div 
            className="w-full h-full overflow-auto"
            style={{
              backgroundImage: showGrid ? `
                linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
              ` : 'none',
              backgroundSize: showGrid ? `${20 * (zoom / 100)}px ${20 * (zoom / 100)}px` : 'auto'
            }}
          >
            {/* Slide Canvas */}
            <motion.div
              ref={canvasRef}
              className="relative bg-white shadow-lg mx-auto my-8"
              style={{
                width: canvasSize.width,
                height: canvasSize.height,
                transform: `scale(${zoom / 100})`
              }}
              onClick={handleCanvasClick}
            >
              {/* Guidelines */}
              <AnimatePresence>
                {guidelines.vertical.map((x, index) => (
                  <motion.div
                    key={`v-${index}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-0 bottom-0 w-px bg-blue-500"
                    style={{ left: x }}
                  />
                ))}
                {guidelines.horizontal.map((y, index) => (
                  <motion.div
                    key={`h-${index}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute left-0 right-0 h-px bg-blue-500"
                    style={{ top: y }}
                  />
                ))}
              </AnimatePresence>

              {/* Slide Elements */}
              {elements.map((element) => (
                <SlideElementComponent
                  key={element.id}
                  element={element}
                  isSelected={selectedElements.includes(element.id)}
                  onSelect={handleElementSelect}
                  onDrag={handleElementDrag}
                  onResize={handleElementResize}
                  zoom={zoom}
                />
              ))}

              {/* Empty State */}
              {elements.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center"
                    >
                      <Sparkles className="w-12 h-12 text-blue-600" />
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold text-gray-700 mb-2">
                      Start Creating Magic
                    </h3>
                    
                    <p className="text-gray-500 mb-6 max-w-md">
                      Select an element from the library and click anywhere on the canvas to begin crafting your world-class presentation.
                    </p>
                    
                    <div className="flex justify-center space-x-4">
                      <Button
                        onClick={() => setSelectedTool('text')}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        <Type className="w-4 h-4 mr-2" />
                        Add Text
                      </Button>
                      <Button
                        onClick={() => setSelectedTool('chart')}
                        variant="outline"
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Add Chart
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Properties Panel */}
      <AnimatePresence>
        {showStylePanel && selectedElements.length > 0 && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="w-80 bg-white border-l border-gray-200 flex flex-col"
          >
            <PropertiesPanel
              selectedElements={selectedElements.map(id => elements.find(el => el.id === id)!).filter(Boolean)}
              onUpdate={(elementId, updates) => {
                setElements(prev => prev.map(element => 
                  element.id === elementId 
                    ? { ...element, ...updates }
                    : element
                ))
              }}
              colorPalettes={COLOR_PALETTES}
              fontCombinations={FONT_COMBINATIONS}
              currentTheme={currentTheme}
              onThemeChange={setCurrentTheme}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Individual slide element component
interface SlideElementComponentProps {
  element: SlideElement
  isSelected: boolean
  onSelect: (id: string, multiSelect?: boolean) => void
  onDrag: (id: string, info: PanInfo) => void
  onResize: (id: string, newSize: { width: number; height: number }) => void
  zoom: number
}

function SlideElementComponent({
  element,
  isSelected,
  onSelect,
  onDrag,
  onResize,
  zoom
}: SlideElementComponentProps) {
  const dragControls = useDragControls()
  const [isHovered, setIsHovered] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation()
    onSelect(element.id, e.ctrlKey || e.metaKey)
    dragControls.start(e)
  }

  const renderElementContent = () => {
    switch (element.type) {
      case 'text':
        return (
          <div
            className="w-full h-full flex items-center justify-center cursor-text"
            style={{
              fontSize: element.style.fontSize,
              fontFamily: element.style.fontFamily,
              fontWeight: element.style.fontWeight,
              color: element.style.color,
              textAlign: element.style.textAlign,
              padding: element.style.padding
            }}
            onDoubleClick={() => setIsEditing(true)}
          >
            {isEditing ? (
              <input
                type="text"
                defaultValue={element.content.text}
                className="w-full h-full bg-transparent border-none outline-none"
                onBlur={() => setIsEditing(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
                autoFocus
              />
            ) : (
              element.content.text
            )}
          </div>
        )
      
      case 'image':
        return (
          <div className="w-full h-full bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
            {element.content.src ? (
              <img
                src={element.content.src}
                alt={element.content.alt}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <div className="text-center text-gray-500">
                <Image className="w-8 h-8 mx-auto mb-2" />
                <span className="text-sm">Click to add image</span>
              </div>
            )}
          </div>
        )
      
      case 'chart':
        return (
          <div className="w-full h-full bg-white rounded border border-gray-200 p-4 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <BarChart3 className="w-8 h-8 mx-auto mb-2" />
              <span className="text-sm">{element.content.title || 'Chart'}</span>
            </div>
          </div>
        )
      
      case 'shape':
        const shapeStyle = {
          width: '100%',
          height: '100%',
          background: element.content.fill || element.style.background,
          borderRadius: element.content.shape === 'circle' ? '50%' : element.style.borderRadius
        }
        
        if (element.content.shape === 'triangle') {
          return (
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: `${element.size.width / 2}px solid transparent`,
                borderRight: `${element.size.width / 2}px solid transparent`,
                borderBottom: `${element.size.height}px solid ${element.content.fill}`
              }}
            />
          )
        }
        
        return <div style={shapeStyle} />
      
      default:
        return (
          <div className="w-full h-full bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
            <span className="text-gray-500 text-sm capitalize">{element.type}</span>
          </div>
        )
    }
  }

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0}
      onDrag={(_, info) => onDrag(element.id, info)}
      className={`absolute select-none group ${element.locked ? 'pointer-events-none' : ''}`}
      style={{
        left: element.position.x,
        top: element.position.y,
        width: element.size.width,
        height: element.size.height,
        transform: `rotate(${element.rotation}deg)`,
        opacity: element.opacity,
        zIndex: element.zIndex,
        visibility: element.visible ? 'visible' : 'hidden'
      }}
      onPointerDown={handlePointerDown}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: isSelected ? 1 : 1.02 }}
      animate={{
        scale: isSelected ? 1.02 : 1,
        boxShadow: isSelected 
          ? '0 0 0 2px #3b82f6, 0 4px 12px rgba(59, 130, 246, 0.3)'
          : isHovered 
            ? '0 2px 8px rgba(0, 0, 0, 0.1)'
            : '0 0 0 0px transparent'
      }}
      transition={{ duration: 0.2 }}
    >
      {/* Element Content */}
      <div 
        className="w-full h-full"
        style={{
          background: element.style.background,
          border: element.style.border,
          borderRadius: element.style.borderRadius,
          boxShadow: element.style.shadow
        }}
      >
        {renderElementContent()}
      </div>

      {/* Selection Handles */}
      <AnimatePresence>
        {isSelected && (
          <>
            {/* Corner Resize Handles */}
            {['nw', 'ne', 'sw', 'se'].map((corner) => (
              <motion.div
                key={corner}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className={`absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-sm cursor-${corner}-resize`}
                style={{
                  top: corner.includes('n') ? -6 : 'auto',
                  bottom: corner.includes('s') ? -6 : 'auto',
                  left: corner.includes('w') ? -6 : 'auto',
                  right: corner.includes('e') ? -6 : 'auto'
                }}
              />
            ))}

            {/* Rotation Handle */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute w-3 h-3 bg-green-500 border-2 border-white rounded-full cursor-grab"
              style={{
                top: -20,
                left: '50%',
                transform: 'translateX(-50%)'
              }}
            >
              <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-px h-4 bg-green-500" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Element Actions (on hover) */}
      <AnimatePresence>
        {isHovered && !isSelected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-10 left-0 bg-gray-900 text-white text-xs px-2 py-1 rounded pointer-events-none"
          >
            {element.type.charAt(0).toUpperCase() + element.type.slice(1)}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Properties panel component
interface PropertiesPanelProps {
  selectedElements: SlideElement[]
  onUpdate: (elementId: string, updates: Partial<SlideElement>) => void
  colorPalettes: typeof COLOR_PALETTES
  fontCombinations: typeof FONT_COMBINATIONS
  currentTheme: string
  onThemeChange: (theme: string) => void
}

function PropertiesPanel({
  selectedElements,
  onUpdate,
  colorPalettes,
  fontCombinations,
  currentTheme,
  onThemeChange
}: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState<'style' | 'layout' | 'animation'>('style')

  if (selectedElements.length === 0) return null

  const firstElement = selectedElements[0]
  const isMultiSelect = selectedElements.length > 1

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          {isMultiSelect 
            ? `${selectedElements.length} Elements` 
            : firstElement.type.charAt(0).toUpperCase() + firstElement.type.slice(1)
          }
        </h2>
        
        {/* Tabs */}
        <div className="flex mt-3 space-x-1 bg-gray-100 rounded-lg p-1">
          {(['style', 'layout', 'animation'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'style' && (
          <StylePanel
            element={firstElement}
            isMultiSelect={isMultiSelect}
            onUpdate={onUpdate}
            colorPalettes={colorPalettes}
            fontCombinations={fontCombinations}
            currentTheme={currentTheme}
            onThemeChange={onThemeChange}
          />
        )}
        
        {activeTab === 'layout' && (
          <LayoutPanel
            element={firstElement}
            isMultiSelect={isMultiSelect}
            onUpdate={onUpdate}
          />
        )}
        
        {activeTab === 'animation' && (
          <AnimationPanel
            element={firstElement}
            isMultiSelect={isMultiSelect}
            onUpdate={onUpdate}
          />
        )}
      </div>
    </div>
  )
}

// Style panel component
function StylePanel({
  element,
  isMultiSelect,
  onUpdate,
  colorPalettes,
  fontCombinations,
  currentTheme,
  onThemeChange
}: {
  element: SlideElement
  isMultiSelect: boolean
  onUpdate: (elementId: string, updates: Partial<SlideElement>) => void
  colorPalettes: typeof COLOR_PALETTES
  fontCombinations: typeof FONT_COMBINATIONS
  currentTheme: string
  onThemeChange: (theme: string) => void
}) {
  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Color Theme
        </label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(colorPalettes).map(([key, palette]) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onThemeChange(key)}
              className={`p-2 rounded-lg border-2 transition-all ${
                currentTheme === key
                  ? 'border-blue-500'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex space-x-1 mb-1">
                {palette.colors.slice(0, 4).map((color, index) => (
                  <div
                    key={index}
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600">{palette.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Text Styling (for text elements) */}
      {element.type === 'text' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Family
            </label>
            <select
              value={element.style.fontFamily}
              onChange={(e) => onUpdate(element.id, {
                style: { ...element.style, fontFamily: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {fontCombinations.map((font, index) => (
                <option key={index} value={font.body}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Size
              </label>
              <input
                type="number"
                value={element.style.fontSize}
                onChange={(e) => onUpdate(element.id, {
                  style: { ...element.style, fontSize: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="8"
                max="72"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Weight
              </label>
              <select
                value={element.style.fontWeight}
                onChange={(e) => onUpdate(element.id, {
                  style: { ...element.style, fontWeight: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="300">Light</option>
                <option value="400">Normal</option>
                <option value="500">Medium</option>
                <option value="600">Semi Bold</option>
                <option value="700">Bold</option>
                <option value="800">Extra Bold</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text Alignment
            </label>
            <div className="flex space-x-1">
              {[
                { value: 'left', icon: AlignLeft },
                { value: 'center', icon: AlignCenter },
                { value: 'right', icon: AlignRight },
                { value: 'justify', icon: AlignJustify }
              ].map(({ value, icon: Icon }) => (
                <motion.button
                  key={value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onUpdate(element.id, {
                    style: { ...element.style, textAlign: value as any }
                  })}
                  className={`flex-1 p-2 rounded border ${
                    element.style.textAlign === value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Icon className="w-4 h-4 mx-auto" />
                </motion.button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Color Picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Colors
        </label>
        <div className="space-y-3">
          <div>
            <span className="text-xs text-gray-500 mb-1 block">Text Color</span>
            <div className="flex space-x-2">
              {colorPalettes[currentTheme as keyof typeof colorPalettes].colors.map((color, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onUpdate(element.id, {
                    style: { ...element.style, color }
                  })}
                  className={`w-8 h-8 rounded-full border-2 ${
                    element.style.color === color
                      ? 'border-gray-900'
                      : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs text-gray-500 mb-1 block">Background</span>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onUpdate(element.id, {
                  style: { ...element.style, background: 'transparent' }
                })}
                className="w-8 h-8 rounded-full border-2 border-gray-300 bg-white relative"
              >
                <div className="absolute inset-1 bg-gradient-to-br from-red-500 to-red-500 opacity-20 rounded-full" 
                     style={{
                       background: 'linear-gradient(45deg, transparent 30%, red 30%, red 40%, transparent 40%)'
                     }}
                />
              </motion.button>
              {colorPalettes[currentTheme as keyof typeof colorPalettes].colors.map((color, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onUpdate(element.id, {
                    style: { ...element.style, background: color }
                  })}
                  className={`w-8 h-8 rounded-full border-2 ${
                    element.style.background === color
                      ? 'border-gray-900'
                      : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Border & Effects */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Border & Effects
        </label>
        <div className="space-y-3">
          <div>
            <span className="text-xs text-gray-500 mb-1 block">Border Radius</span>
            <input
              type="range"
              min="0"
              max="50"
              value={element.style.borderRadius || 0}
              onChange={(e) => onUpdate(element.id, {
                style: { ...element.style, borderRadius: parseInt(e.target.value) }
              })}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{element.style.borderRadius || 0}px</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Layout panel component
function LayoutPanel({
  element,
  isMultiSelect,
  onUpdate
}: {
  element: SlideElement
  isMultiSelect: boolean
  onUpdate: (elementId: string, updates: Partial<SlideElement>) => void
}) {
  return (
    <div className="space-y-6">
      {/* Position */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Position
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-xs text-gray-500 mb-1 block">X</span>
            <input
              type="number"
              value={Math.round(element.position.x)}
              onChange={(e) => onUpdate(element.id, {
                position: { ...element.position, x: parseInt(e.target.value) || 0 }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <span className="text-xs text-gray-500 mb-1 block">Y</span>
            <input
              type="number"
              value={Math.round(element.position.y)}
              onChange={(e) => onUpdate(element.id, {
                position: { ...element.position, y: parseInt(e.target.value) || 0 }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Size
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-xs text-gray-500 mb-1 block">Width</span>
            <input
              type="number"
              value={Math.round(element.size.width)}
              onChange={(e) => onUpdate(element.id, {
                size: { ...element.size, width: parseInt(e.target.value) || 0 }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <span className="text-xs text-gray-500 mb-1 block">Height</span>
            <input
              type="number"
              value={Math.round(element.size.height)}
              onChange={(e) => onUpdate(element.id, {
                size: { ...element.size, height: parseInt(e.target.value) || 0 }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Rotation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rotation
        </label>
        <input
          type="range"
          min="-180"
          max="180"
          value={element.rotation}
          onChange={(e) => onUpdate(element.id, {
            rotation: parseInt(e.target.value)
          })}
          className="w-full"
        />
        <span className="text-xs text-gray-500">{element.rotation}°</span>
      </div>

      {/* Opacity */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Opacity
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={element.opacity}
          onChange={(e) => onUpdate(element.id, {
            opacity: parseFloat(e.target.value)
          })}
          className="w-full"
        />
        <span className="text-xs text-gray-500">{Math.round(element.opacity * 100)}%</span>
      </div>

      {/* Z-Index */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Layer Order
        </label>
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onUpdate(element.id, {
              zIndex: element.zIndex + 1
            })}
            className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
          >
            Bring Forward
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onUpdate(element.id, {
              zIndex: Math.max(0, element.zIndex - 1)
            })}
            className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
          >
            Send Backward
          </motion.button>
        </div>
      </div>

      {/* Lock/Visibility */}
      <div className="grid grid-cols-2 gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onUpdate(element.id, {
            locked: !element.locked
          })}
          className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all ${
            element.locked
              ? 'border-red-500 bg-red-50 text-red-700'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          {element.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          <span className="text-sm">{element.locked ? 'Locked' : 'Unlocked'}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onUpdate(element.id, {
            visible: !element.visible
          })}
          className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all ${
            !element.visible
              ? 'border-orange-500 bg-orange-50 text-orange-700'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          {element.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          <span className="text-sm">{element.visible ? 'Visible' : 'Hidden'}</span>
        </motion.button>
      </div>
    </div>
  )
}

// Animation panel component
function AnimationPanel({
  element,
  isMultiSelect,
  onUpdate
}: {
  element: SlideElement
  isMultiSelect: boolean
  onUpdate: (elementId: string, updates: Partial<SlideElement>) => void
}) {
  const animationTypes = [
    'fadeIn', 'fadeInUp', 'fadeInDown', 'fadeInLeft', 'fadeInRight',
    'slideInUp', 'slideInDown', 'slideInLeft', 'slideInRight',
    'zoomIn', 'zoomOut', 'bounceIn', 'rotateIn', 'flipInX', 'flipInY'
  ]

  return (
    <div className="space-y-6">
      {/* Entrance Animation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Entrance Animation
        </label>
        <select
          value={element.animation?.entrance || 'fadeIn'}
          onChange={(e) => onUpdate(element.id, {
            animation: { ...element.animation, entrance: e.target.value }
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">No Animation</option>
          {animationTypes.map(type => (
            <option key={type} value={type}>
              {type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Duration
        </label>
        <input
          type="range"
          min="0.1"
          max="3"
          step="0.1"
          value={element.animation?.duration || 0.5}
          onChange={(e) => onUpdate(element.id, {
            animation: { ...element.animation, duration: parseFloat(e.target.value) }
          })}
          className="w-full"
        />
        <span className="text-xs text-gray-500">{element.animation?.duration || 0.5}s</span>
      </div>

      {/* Delay */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Delay
        </label>
        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          value={element.animation?.delay || 0}
          onChange={(e) => onUpdate(element.id, {
            animation: { ...element.animation, delay: parseFloat(e.target.value) }
          })}
          className="w-full"
        />
        <span className="text-xs text-gray-500">{element.animation?.delay || 0}s</span>
      </div>

      {/* Preview Animation */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        <Play className="w-4 h-4 inline mr-2" />
        Preview Animation
      </motion.button>
    </div>
  )
}