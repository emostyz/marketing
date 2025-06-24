'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { 
  Type, 
  Image, 
  BarChart3, 
  Square, 
  Circle, 
  Triangle,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Save,
  Download,
  Undo,
  Redo,
  Copy,
  Trash2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Grid,
  Layers,
  Move,
  MousePointer
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import ProfessionalChart, { CHART_TEMPLATES } from '@/components/charts/ProfessionalChart'

// Standard PowerPoint slide dimensions (16:9 ratio)
const SLIDE_WIDTH = 1280
const SLIDE_HEIGHT = 720
const SLIDE_RATIO = SLIDE_WIDTH / SLIDE_HEIGHT

interface SlideElement {
  id: string
  type: 'text' | 'image' | 'chart' | 'shape'
  x: number
  y: number
  width: number
  height: number
  rotation: number
  content: any
  style: {
    fontSize?: number
    fontFamily?: string
    color?: string
    backgroundColor?: string
    borderColor?: string
    borderWidth?: number
    borderRadius?: number
    textAlign?: 'left' | 'center' | 'right'
    fontWeight?: 'normal' | 'bold'
    fontStyle?: 'normal' | 'italic'
    textDecoration?: 'none' | 'underline'
    opacity?: number
  }
  zIndex: number
}

interface WorldClassSlideEditorProps {
  initialElements?: SlideElement[]
  onSave?: (elements: SlideElement[]) => void
  onElementChange?: (elements: SlideElement[]) => void
}

export default function WorldClassSlideEditor({ 
  initialElements = [], 
  onSave, 
  onElementChange 
}: WorldClassSlideEditorProps) {
  const [elements, setElements] = useState<SlideElement[]>(initialElements)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [dragState, setDragState] = useState<{
    isDragging: boolean
    elementId: string | null
    startX: number
    startY: number
    startElementX: number
    startElementY: number
  }>({
    isDragging: false,
    elementId: null,
    startX: 0,
    startY: 0,
    startElementX: 0,
    startElementY: 0
  })
  const [resizeState, setResizeState] = useState<{
    isResizing: boolean
    elementId: string | null
    handle: string | null
    startX: number
    startY: number
    startWidth: number
    startHeight: number
  }>({
    isResizing: false,
    elementId: null,
    handle: null,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0
  })
  const [editingTextId, setEditingTextId] = useState<string | null>(null)
  const [zoom, setZoom] = useState(0.6)
  const [showGrid, setShowGrid] = useState(true)
  const [tool, setTool] = useState<'select' | 'text' | 'shape' | 'image' | 'chart'>('select')
  const [history, setHistory] = useState<SlideElement[][]>([initialElements])
  const [historyIndex, setHistoryIndex] = useState(0)

  const canvasRef = useRef<HTMLDivElement>(null)
  const textEditorRef = useRef<HTMLDivElement>(null)

  // Standard fonts available in presentations
  const fonts = [
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 
    'Tahoma', 'Trebuchet MS', 'Impact', 'Comic Sans MS', 'Courier New',
    'Calibri', 'Cambria', 'Candara', 'Consolas', 'Constantia'
  ]

  const selectedElement = selectedElementId ? elements.find(el => el.id === selectedElementId) : null

  // Add element to history for undo/redo
  const addToHistory = useCallback((newElements: SlideElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push([...newElements])
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])

  // Update elements and trigger callbacks
  const updateElements = useCallback((newElements: SlideElement[]) => {
    setElements(newElements)
    onElementChange?.(newElements)
  }, [onElementChange])

  // Undo/Redo functions
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevElements = history[historyIndex - 1]
      setElements(prevElements)
      setHistoryIndex(historyIndex - 1)
      onElementChange?.(prevElements)
    }
  }, [history, historyIndex, onElementChange])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextElements = history[historyIndex + 1]
      setElements(nextElements)
      setHistoryIndex(historyIndex + 1)
      onElementChange?.(nextElements)
    }
  }, [history, historyIndex, onElementChange])

  // Get canvas coordinates from mouse event
  const getCanvasCoordinates = useCallback((event: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 }
    
    const rect = canvasRef.current.getBoundingClientRect()
    const x = (event.clientX - rect.left) / zoom
    const y = (event.clientY - rect.top) / zoom
    
    return { x, y }
  }, [zoom])

  // Add new element
  const addElement = useCallback((type: SlideElement['type'], x: number, y: number) => {
    let content = null
    let width = 150
    let height = 100

    if (type === 'text') {
      content = 'Click to edit text'
      width = 200
      height = 50
    } else if (type === 'chart') {
      // Create sample chart data
      const sampleData = [
        { name: 'Jan', value: 400 },
        { name: 'Feb', value: 300 },
        { name: 'Mar', value: 500 },
        { name: 'Apr', value: 350 }
      ]
      content = {
        type: 'bar',
        title: 'Sample Chart',
        data: sampleData,
        xAxis: 'name',
        yAxis: ['value'],
        colors: ['#1f77b4', '#ff7f0e', '#2ca02c'],
        showGrid: true,
        showLegend: false,
        showTooltip: true,
        animation: true,
        theme: 'light'
      }
      width = 400
      height = 300
    }

    const newElement: SlideElement = {
      id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      x,
      y,
      width,
      height,
      rotation: 0,
      content,
      style: {
        fontSize: 16,
        fontFamily: 'Arial',
        color: '#000000',
        backgroundColor: type === 'shape' ? '#e3f2fd' : 'transparent',
        borderColor: '#1976d2',
        borderWidth: type === 'shape' ? 2 : 0,
        borderRadius: 0,
        textAlign: 'left',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'none',
        opacity: 1
      },
      zIndex: elements.length
    }

    const newElements = [...elements, newElement]
    updateElements(newElements)
    addToHistory(newElements)
    setSelectedElementId(newElement.id)
    
    if (type === 'text') {
      setTimeout(() => setEditingTextId(newElement.id), 100)
    }
  }, [elements, updateElements, addToHistory])

  // Handle canvas click
  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    if (tool !== 'select') {
      const { x, y } = getCanvasCoordinates(event)
      addElement(tool === 'text' ? 'text' : tool === 'shape' ? 'shape' : 'image', x, y)
      setTool('select')
      return
    }

    // Check if clicking on an element
    const { x, y } = getCanvasCoordinates(event)
    
    // Find the topmost element at this position
    const clickedElement = [...elements]
      .sort((a, b) => b.zIndex - a.zIndex)
      .find(el => 
        x >= el.x && 
        x <= el.x + el.width && 
        y >= el.y && 
        y <= el.y + el.height
      )

    if (clickedElement) {
      setSelectedElementId(clickedElement.id)
    } else {
      setSelectedElementId(null)
      setEditingTextId(null)
    }
  }, [tool, elements, getCanvasCoordinates, addElement])

  // Handle double click for text editing
  const handleElementDoubleClick = useCallback((elementId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    const element = elements.find(el => el.id === elementId)
    if (element?.type === 'text') {
      setEditingTextId(elementId)
      setSelectedElementId(elementId)
    }
  }, [elements])

  // Mouse down for dragging
  const handleMouseDown = useCallback((elementId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    
    const element = elements.find(el => el.id === elementId)
    if (!element) return

    const { x, y } = getCanvasCoordinates(event)
    
    setDragState({
      isDragging: true,
      elementId,
      startX: x,
      startY: y,
      startElementX: element.x,
      startElementY: element.y
    })
    
    setSelectedElementId(elementId)
  }, [elements, getCanvasCoordinates])

  // Handle mouse move for dragging and resizing
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (dragState.isDragging && dragState.elementId) {
      const { x, y } = getCanvasCoordinates(event)
      const deltaX = x - dragState.startX
      const deltaY = y - dragState.startY
      
      const newElements = elements.map(el => 
        el.id === dragState.elementId 
          ? { 
              ...el, 
              x: Math.max(0, Math.min(SLIDE_WIDTH - el.width, dragState.startElementX + deltaX)),
              y: Math.max(0, Math.min(SLIDE_HEIGHT - el.height, dragState.startElementY + deltaY))
            }
          : el
      )
      
      updateElements(newElements)
    }
    
    if (resizeState.isResizing && resizeState.elementId) {
      const { x, y } = getCanvasCoordinates(event)
      const deltaX = x - resizeState.startX
      const deltaY = y - resizeState.startY
      
      const newElements = elements.map(el => {
        if (el.id === resizeState.elementId) {
          let newWidth = el.width
          let newHeight = el.height
          let newX = el.x
          let newY = el.y
          
          switch (resizeState.handle) {
            case 'se':
              newWidth = Math.max(20, resizeState.startWidth + deltaX)
              newHeight = Math.max(20, resizeState.startHeight + deltaY)
              break
            case 'ne':
              newWidth = Math.max(20, resizeState.startWidth + deltaX)
              newHeight = Math.max(20, resizeState.startHeight - deltaY)
              newY = el.y + (resizeState.startHeight - newHeight)
              break
            case 'sw':
              newWidth = Math.max(20, resizeState.startWidth - deltaX)
              newHeight = Math.max(20, resizeState.startHeight + deltaY)
              newX = el.x + (resizeState.startWidth - newWidth)
              break
            case 'nw':
              newWidth = Math.max(20, resizeState.startWidth - deltaX)
              newHeight = Math.max(20, resizeState.startHeight - deltaY)
              newX = el.x + (resizeState.startWidth - newWidth)
              newY = el.y + (resizeState.startHeight - newHeight)
              break
          }
          
          return { ...el, width: newWidth, height: newHeight, x: newX, y: newY }
        }
        return el
      })
      
      updateElements(newElements)
    }
  }, [dragState, resizeState, elements, getCanvasCoordinates, updateElements])

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    if (dragState.isDragging) {
      addToHistory(elements)
    }
    if (resizeState.isResizing) {
      addToHistory(elements)
    }
    
    setDragState(prev => ({ ...prev, isDragging: false, elementId: null }))
    setResizeState(prev => ({ ...prev, isResizing: false, elementId: null, handle: null }))
  }, [dragState.isDragging, resizeState.isResizing, elements, addToHistory])

  // Handle resize handle mouse down
  const handleResizeMouseDown = useCallback((elementId: string, handle: string, event: React.MouseEvent) => {
    event.stopPropagation()
    
    const element = elements.find(el => el.id === elementId)
    if (!element) return
    
    const { x, y } = getCanvasCoordinates(event)
    
    setResizeState({
      isResizing: true,
      elementId,
      handle,
      startX: x,
      startY: y,
      startWidth: element.width,
      startHeight: element.height
    })
  }, [elements, getCanvasCoordinates])

  // Update element style
  const updateElementStyle = useCallback((elementId: string, styleUpdates: Partial<SlideElement['style']>) => {
    const newElements = elements.map(el => 
      el.id === elementId 
        ? { ...el, style: { ...el.style, ...styleUpdates } }
        : el
    )
    updateElements(newElements)
    addToHistory(newElements)
  }, [elements, updateElements, addToHistory])

  // Update element content
  const updateElementContent = useCallback((elementId: string, content: any) => {
    const newElements = elements.map(el => 
      el.id === elementId ? { ...el, content } : el
    )
    updateElements(newElements)
  }, [elements, updateElements])

  // Delete selected element
  const deleteElement = useCallback(() => {
    if (selectedElementId) {
      const newElements = elements.filter(el => el.id !== selectedElementId)
      updateElements(newElements)
      addToHistory(newElements)
      setSelectedElementId(null)
    }
  }, [selectedElementId, elements, updateElements, addToHistory])

  // Copy selected element
  const copyElement = useCallback(() => {
    if (selectedElement) {
      const newElement = {
        ...selectedElement,
        id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x: selectedElement.x + 20,
        y: selectedElement.y + 20,
        zIndex: elements.length
      }
      const newElements = [...elements, newElement]
      updateElements(newElements)
      addToHistory(newElements)
      setSelectedElementId(newElement.id)
    }
  }, [selectedElement, elements, updateElements, addToHistory])

  // Event listeners
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'z':
            event.preventDefault()
            if (event.shiftKey) {
              redo()
            } else {
              undo()
            }
            break
          case 'c':
            event.preventDefault()
            copyElement()
            break
          case 's':
            event.preventDefault()
            onSave?.(elements)
            break
        }
      } else {
        switch (event.key) {
          case 'Delete':
          case 'Backspace':
            if (!editingTextId) {
              event.preventDefault()
              deleteElement()
            }
            break
          case 'Escape':
            setSelectedElementId(null)
            setEditingTextId(null)
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, copyElement, deleteElement, editingTextId, elements, onSave])

  // Render element
  const renderElement = (element: SlideElement) => {
    const isSelected = selectedElementId === element.id
    const isEditing = editingTextId === element.id

    return (
      <div
        key={element.id}
        className={`absolute cursor-move ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        style={{
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height,
          transform: `rotate(${element.rotation}deg)`,
          zIndex: element.zIndex,
          fontSize: element.style.fontSize,
          fontFamily: element.style.fontFamily,
          color: element.style.color,
          backgroundColor: element.style.backgroundColor,
          border: element.style.borderWidth ? `${element.style.borderWidth}px solid ${element.style.borderColor}` : 'none',
          borderRadius: element.style.borderRadius,
          textAlign: element.style.textAlign,
          fontWeight: element.style.fontWeight,
          fontStyle: element.style.fontStyle,
          textDecoration: element.style.textDecoration,
          opacity: element.style.opacity,
          display: 'flex',
          alignItems: element.type === 'text' ? 'center' : 'center',
          justifyContent: element.type === 'text' ? element.style.textAlign : 'center',
          padding: element.type === 'text' ? '8px' : '0',
          overflow: 'hidden'
        }}
        onMouseDown={(e) => handleMouseDown(element.id, e)}
        onDoubleClick={(e) => handleElementDoubleClick(element.id, e)}
      >
        {element.type === 'text' && (
          <>
            {isEditing ? (
              <div
                ref={textEditorRef}
                contentEditable
                suppressContentEditableWarning
                className="w-full h-full outline-none resize-none bg-transparent"
                style={{
                  fontSize: element.style.fontSize,
                  fontFamily: element.style.fontFamily,
                  color: element.style.color,
                  textAlign: element.style.textAlign,
                  fontWeight: element.style.fontWeight,
                  fontStyle: element.style.fontStyle,
                  textDecoration: element.style.textDecoration,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: element.style.textAlign,
                  padding: '8px'
                }}
                onBlur={(e) => {
                  updateElementContent(element.id, e.currentTarget.textContent || '')
                  setEditingTextId(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    e.currentTarget.blur()
                  }
                }}
                autoFocus
              >
                {element.content}
              </div>
            ) : (
              <div className="w-full h-full flex items-center" style={{ justifyContent: element.style.textAlign }}>
                {element.content || 'Click to edit text'}
              </div>
            )}
          </>
        )}
        
        {element.type === 'shape' && (
          <div className="w-full h-full" />
        )}
        
        {element.type === 'image' && (
          <div className="w-full h-full bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-500">
            <Image className="w-8 h-8" />
          </div>
        )}
        
        {element.type === 'chart' && element.content && (
          <ProfessionalChart
            config={element.content}
            editable={isSelected}
            width={element.width}
            height={element.height}
            onConfigChange={(newConfig) => updateElementContent(element.id, newConfig)}
          />
        )}

        {/* Resize handles */}
        {isSelected && !isEditing && (
          <>
            <div
              className="absolute w-3 h-3 bg-blue-500 border border-white cursor-nw-resize"
              style={{ top: -6, left: -6 }}
              onMouseDown={(e) => handleResizeMouseDown(element.id, 'nw', e)}
            />
            <div
              className="absolute w-3 h-3 bg-blue-500 border border-white cursor-ne-resize"
              style={{ top: -6, right: -6 }}
              onMouseDown={(e) => handleResizeMouseDown(element.id, 'ne', e)}
            />
            <div
              className="absolute w-3 h-3 bg-blue-500 border border-white cursor-sw-resize"
              style={{ bottom: -6, left: -6 }}
              onMouseDown={(e) => handleResizeMouseDown(element.id, 'sw', e)}
            />
            <div
              className="absolute w-3 h-3 bg-blue-500 border border-white cursor-se-resize"
              style={{ bottom: -6, right: -6 }}
              onMouseDown={(e) => handleResizeMouseDown(element.id, 'se', e)}
            />
          </>
        )}
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-300 p-2 flex items-center gap-2 flex-wrap">
        {/* File operations */}
        <div className="flex items-center gap-1 mr-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSave?.(elements)}
            className="flex items-center gap-1"
          >
            <Save className="w-4 h-4" />
            Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={historyIndex <= 0}
            className="flex items-center gap-1"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="flex items-center gap-1"
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>

        {/* Tools */}
        <div className="flex items-center gap-1 mr-4">
          <Button
            variant={tool === 'select' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('select')}
            className="flex items-center gap-1"
          >
            <MousePointer className="w-4 h-4" />
            Select
          </Button>
          <Button
            variant={tool === 'text' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('text')}
            className="flex items-center gap-1"
          >
            <Type className="w-4 h-4" />
            Text
          </Button>
          <Button
            variant={tool === 'shape' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('shape')}
            className="flex items-center gap-1"
          >
            <Square className="w-4 h-4" />
            Shape
          </Button>
          <Button
            variant={tool === 'chart' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('chart')}
            className="flex items-center gap-1"
          >
            <BarChart3 className="w-4 h-4" />
            Chart
          </Button>
        </div>

        {/* Element actions */}
        {selectedElement && (
          <div className="flex items-center gap-1 mr-4">
            <Button
              variant="outline"
              size="sm"
              onClick={copyElement}
              className="flex items-center gap-1"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={deleteElement}
              className="flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Text formatting */}
        {selectedElement?.type === 'text' && (
          <div className="flex items-center gap-1 mr-4">
            <select
              value={selectedElement.style.fontFamily}
              onChange={(e) => updateElementStyle(selectedElement.id, { fontFamily: e.target.value })}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              {fonts.map(font => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
            
            <input
              type="number"
              value={selectedElement.style.fontSize}
              onChange={(e) => updateElementStyle(selectedElement.id, { fontSize: parseInt(e.target.value) })}
              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
              min="8"
              max="72"
            />
            
            <Button
              variant={selectedElement.style.fontWeight === 'bold' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateElementStyle(selectedElement.id, { 
                fontWeight: selectedElement.style.fontWeight === 'bold' ? 'normal' : 'bold' 
              })}
            >
              <Bold className="w-4 h-4" />
            </Button>
            
            <Button
              variant={selectedElement.style.fontStyle === 'italic' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateElementStyle(selectedElement.id, { 
                fontStyle: selectedElement.style.fontStyle === 'italic' ? 'normal' : 'italic' 
              })}
            >
              <Italic className="w-4 h-4" />
            </Button>
            
            <Button
              variant={selectedElement.style.textDecoration === 'underline' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateElementStyle(selectedElement.id, { 
                textDecoration: selectedElement.style.textDecoration === 'underline' ? 'none' : 'underline' 
              })}
            >
              <Underline className="w-4 h-4" />
            </Button>
            
            <Button
              variant={selectedElement.style.textAlign === 'left' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateElementStyle(selectedElement.id, { textAlign: 'left' })}
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
            
            <Button
              variant={selectedElement.style.textAlign === 'center' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateElementStyle(selectedElement.id, { textAlign: 'center' })}
            >
              <AlignCenter className="w-4 h-4" />
            </Button>
            
            <Button
              variant={selectedElement.style.textAlign === 'right' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateElementStyle(selectedElement.id, { textAlign: 'right' })}
            >
              <AlignRight className="w-4 h-4" />
            </Button>
            
            <input
              type="color"
              value={selectedElement.style.color}
              onChange={(e) => updateElementStyle(selectedElement.id, { color: e.target.value })}
              className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
            />
          </div>
        )}

        {/* View controls */}
        <div className="flex items-center gap-1 ml-auto">
          <Button
            variant={showGrid ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
            className="flex items-center gap-1"
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.max(0.25, zoom - 0.1))}
            className="flex items-center gap-1"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm px-2">{Math.round(zoom * 100)}%</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            className="flex items-center gap-1"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main editor area */}
      <div className="flex-1 flex">
        {/* Canvas container */}
        <div className="flex-1 overflow-auto bg-gray-200 p-8">
          <div 
            className="relative mx-auto bg-white shadow-2xl"
            style={{
              width: SLIDE_WIDTH * zoom,
              height: SLIDE_HEIGHT * zoom,
              transform: `scale(${zoom})`,
              transformOrigin: 'top left'
            }}
          >
            {/* Grid overlay */}
            {showGrid && (
              <div 
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #ddd 1px, transparent 1px),
                    linear-gradient(to bottom, #ddd 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }}
              />
            )}
            
            {/* Canvas */}
            <div
              ref={canvasRef}
              className="relative w-full h-full cursor-crosshair"
              style={{ width: SLIDE_WIDTH, height: SLIDE_HEIGHT }}
              onClick={handleCanvasClick}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              {elements.map(renderElement)}
            </div>
          </div>
        </div>

        {/* Properties panel */}
        <div className="w-80 bg-white border-l border-gray-300 p-4 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Properties</h3>
          
          {selectedElement ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Element Type</label>
                <div className="text-sm text-gray-600 capitalize">{selectedElement.type}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">X</label>
                  <input
                    type="number"
                    value={Math.round(selectedElement.x)}
                    onChange={(e) => {
                      const newElements = elements.map(el => 
                        el.id === selectedElement.id 
                          ? { ...el, x: parseInt(e.target.value) || 0 }
                          : el
                      )
                      updateElements(newElements)
                    }}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Y</label>
                  <input
                    type="number"
                    value={Math.round(selectedElement.y)}
                    onChange={(e) => {
                      const newElements = elements.map(el => 
                        el.id === selectedElement.id 
                          ? { ...el, y: parseInt(e.target.value) || 0 }
                          : el
                      )
                      updateElements(newElements)
                    }}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Width</label>
                  <input
                    type="number"
                    value={Math.round(selectedElement.width)}
                    onChange={(e) => {
                      const newElements = elements.map(el => 
                        el.id === selectedElement.id 
                          ? { ...el, width: Math.max(20, parseInt(e.target.value) || 20) }
                          : el
                      )
                      updateElements(newElements)
                    }}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    min="20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Height</label>
                  <input
                    type="number"
                    value={Math.round(selectedElement.height)}
                    onChange={(e) => {
                      const newElements = elements.map(el => 
                        el.id === selectedElement.id 
                          ? { ...el, height: Math.max(20, parseInt(e.target.value) || 20) }
                          : el
                      )
                      updateElements(newElements)
                    }}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    min="20"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Background Color</label>
                <input
                  type="color"
                  value={selectedElement.style.backgroundColor || '#ffffff'}
                  onChange={(e) => updateElementStyle(selectedElement.id, { backgroundColor: e.target.value })}
                  className="w-full h-8 border border-gray-300 rounded cursor-pointer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Border</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={selectedElement.style.borderColor || '#000000'}
                    onChange={(e) => updateElementStyle(selectedElement.id, { borderColor: e.target.value })}
                    className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="number"
                    value={selectedElement.style.borderWidth || 0}
                    onChange={(e) => updateElementStyle(selectedElement.id, { borderWidth: parseInt(e.target.value) || 0 })}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    min="0"
                    max="20"
                    placeholder="Width"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Opacity</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={selectedElement.style.opacity || 1}
                  onChange={(e) => updateElementStyle(selectedElement.id, { opacity: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 text-center">{Math.round((selectedElement.style.opacity || 1) * 100)}%</div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              Select an element to edit its properties
            </div>
          )}
          
          {/* Layers panel */}
          <div className="mt-8">
            <h4 className="text-md font-semibold mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Layers
            </h4>
            <div className="space-y-1">
              {[...elements]
                .sort((a, b) => b.zIndex - a.zIndex)
                .map((element, index) => (
                <div
                  key={element.id}
                  className={`p-2 rounded cursor-pointer text-sm flex items-center justify-between ${
                    selectedElementId === element.id ? 'bg-blue-100 border border-blue-300' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedElementId(element.id)}
                >
                  <span className="capitalize">
                    {element.type} {element.type === 'text' && element.content ? `"${element.content.substring(0, 15)}..."` : ''}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">#{elements.length - index}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}