'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { RotateCcw, Move, Trash2, Copy, Lock, Unlock } from 'lucide-react'
import { TremorChartRenderer } from '@/components/charts/TremorChartRenderer'

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

interface SlideElementRendererProps {
  element: SlideElement
  isSelected?: boolean
  isMultiSelected?: boolean
  isEditing?: boolean
  onSelect?: (elementId: string, event?: React.MouseEvent) => void
  onUpdate?: (elementId: string, updates: Partial<SlideElement>) => void
  onDoubleClick?: (elementId: string) => void
  onDelete?: (elementId: string) => void
  onDuplicate?: (elementId: string) => void
  zoom?: number
  snapToGrid?: boolean
  showAlignmentGuides?: boolean
}

export default function SlideElementRenderer({
  element,
  isSelected = false,
  isMultiSelected = false,
  isEditing = false,
  onSelect,
  onUpdate,
  onDoubleClick,
  onDelete,
  onDuplicate,
  zoom = 100,
  snapToGrid = true,
  showAlignmentGuides = true
}: SlideElementRendererProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState('')
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [editingText, setEditingText] = useState(false)
  const [textValue, setTextValue] = useState(element.content || '')
  const elementRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Snap to grid function
  const snapToGridValue = useCallback((value: number, gridSize: number = 10) => {
    if (!snapToGrid) return value
    return Math.round(value / gridSize) * gridSize
  }, [snapToGrid])

  // Handle element selection and dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (element.isLocked) return
    
    e.stopPropagation()
    onSelect?.(element.id, e)
    
    // Double click for editing
    if (e.detail === 2) {
      onDoubleClick?.(element.id)
      if (element.type === 'text') {
        setEditingText(true)
        setTimeout(() => textareaRef.current?.focus(), 0)
      } else if (element.type === 'chart') {
        // Chart editing will be handled by the parent component via onDoubleClick
        console.log('Chart double-clicked for editing:', element.id)
      }
      return
    }

    // Start dragging
    setIsDragging(true)
    const rect = elementRef.current?.getBoundingClientRect()
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
  }

  // Handle resize handles
  const handleResizeMouseDown = (e: React.MouseEvent, handle: string) => {
    if (element.isLocked) return
    
    e.stopPropagation()
    setIsResizing(true)
    setResizeHandle(handle)
    onSelect?.(element.id)
  }

  // Mouse move handler for dragging and resizing
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (element.isLocked) return

    if (isDragging && onUpdate) {
      const container = elementRef.current?.parentElement
      if (container) {
        const containerRect = container.getBoundingClientRect()
        const newX = snapToGridValue(Math.max(0, Math.min(
          containerRect.width - element.size.width,
          e.clientX - containerRect.left - dragStart.x
        )))
        const newY = snapToGridValue(Math.max(0, Math.min(
          containerRect.height - element.size.height,
          e.clientY - containerRect.top - dragStart.y
        )))
        
        onUpdate(element.id, {
          position: { x: newX, y: newY }
        })
      }
    }

    if (isResizing && onUpdate && resizeHandle) {
      const container = elementRef.current?.parentElement
      if (container) {
        const containerRect = container.getBoundingClientRect()
        const mouseX = e.clientX - containerRect.left
        const mouseY = e.clientY - containerRect.top
        
        let newWidth = element.size.width
        let newHeight = element.size.height
        let newX = element.position.x
        let newY = element.position.y

        // Handle different resize directions
        switch (resizeHandle) {
          case 'se': // Southeast (bottom-right)
            newWidth = snapToGridValue(Math.max(50, mouseX - element.position.x))
            newHeight = snapToGridValue(Math.max(30, mouseY - element.position.y))
            break
          case 'sw': // Southwest (bottom-left)
            newWidth = snapToGridValue(Math.max(50, element.position.x + element.size.width - mouseX))
            newHeight = snapToGridValue(Math.max(30, mouseY - element.position.y))
            newX = snapToGridValue(Math.max(0, mouseX))
            break
          case 'ne': // Northeast (top-right)
            newWidth = snapToGridValue(Math.max(50, mouseX - element.position.x))
            newHeight = snapToGridValue(Math.max(30, element.position.y + element.size.height - mouseY))
            newY = snapToGridValue(Math.max(0, mouseY))
            break
          case 'nw': // Northwest (top-left)
            newWidth = snapToGridValue(Math.max(50, element.position.x + element.size.width - mouseX))
            newHeight = snapToGridValue(Math.max(30, element.position.y + element.size.height - mouseY))
            newX = snapToGridValue(Math.max(0, mouseX))
            newY = snapToGridValue(Math.max(0, mouseY))
            break
          case 'n': // North (top)
            newHeight = snapToGridValue(Math.max(30, element.position.y + element.size.height - mouseY))
            newY = snapToGridValue(Math.max(0, mouseY))
            break
          case 's': // South (bottom)
            newHeight = snapToGridValue(Math.max(30, mouseY - element.position.y))
            break
          case 'e': // East (right)
            newWidth = snapToGridValue(Math.max(50, mouseX - element.position.x))
            break
          case 'w': // West (left)
            newWidth = snapToGridValue(Math.max(50, element.position.x + element.size.width - mouseX))
            newX = snapToGridValue(Math.max(0, mouseX))
            break
        }

        onUpdate(element.id, {
          position: { x: newX, y: newY },
          size: { width: newWidth, height: newHeight }
        })
      }
    }
  }, [isDragging, isResizing, resizeHandle, dragStart, element, onUpdate, snapToGridValue])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsResizing(false)
    setResizeHandle('')
  }, [])

  // Add event listeners
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp])

  // Handle text editing
  const handleTextSubmit = () => {
    if (onUpdate && textValue !== element.content) {
      onUpdate(element.id, { content: textValue })
    }
    setEditingText(false)
  }

  const handleTextKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleTextSubmit()
    }
    if (e.key === 'Escape') {
      setTextValue(element.content || '')
      setEditingText(false)
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    if (editingText && textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [textValue, editingText])

  // Render different element types
  const renderElementContent = () => {
    const style = {
      ...element.style,
      width: '100%',
      height: '100%',
      fontSize: `${element.style?.fontSize || 16}px`,
      fontFamily: `${element.style?.fontFamily || 'Inter'}, sans-serif`,
      fontWeight: element.style?.fontWeight || 'normal',
      color: element.style?.color || '#000000',
      backgroundColor: element.style?.backgroundColor || 'transparent',
      textAlign: element.style?.textAlign || 'left',
      display: 'flex',
      alignItems: 'center',
      justifyContent: element.style?.textAlign === 'center' ? 'center' : 
                     element.style?.textAlign === 'right' ? 'flex-end' : 'flex-start',
      padding: element.type === 'text' ? '8px' : '0',
      borderRadius: `${element.style?.borderRadius || 0}px`,
      border: element.style?.borderWidth ? `${element.style.borderWidth}px solid ${element.style.borderColor || '#000'}` : 'none',
      opacity: element.style?.opacity || 1
    }

    switch (element.type) {
      case 'text':
        if (editingText) {
          return (
            <textarea
              ref={textareaRef}
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              onBlur={handleTextSubmit}
              onKeyDown={handleTextKeyDown}
              className="w-full h-full resize-none border-none outline-none bg-transparent"
              style={{
                fontSize: style.fontSize,
                fontFamily: style.fontFamily,
                fontWeight: style.fontWeight,
                color: style.color,
                textAlign: style.textAlign as any,
                padding: '8px',
                opacity: style.opacity
              }}
              autoFocus
            />
          )
        }
        return (
          <div 
            style={style}
            className="whitespace-pre-wrap overflow-hidden"
          >
            {element.content || 'Double-click to edit'}
          </div>
        )
      
      case 'image':
        return (
          <div 
            style={style} 
            className={cn(
              "overflow-hidden relative",
              element.content && "cursor-pointer hover:ring-2 hover:ring-blue-300 hover:ring-opacity-50 transition-all duration-200"
            )}
            title={element.content ? "Double-click to change image" : "No image selected - double-click to add image"}
          >
            {element.content ? (
              <>
                <img 
                  src={element.content} 
                  alt={element.metadata?.filename || "Slide element"} 
                  className="w-full h-full object-cover"
                  draggable={false}
                  onError={(e) => {
                    // Handle broken images gracefully
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.nextElementSibling.style.display = 'flex'
                  }}
                />
                <div className="hidden w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="w-8 h-8 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
                      🖼️
                    </div>
                    <p className="text-xs">Failed to load image</p>
                    <p className="text-xs text-gray-400 mt-1">Double-click to replace</p>
                  </div>
                </div>
                {/* Edit indicator overlay */}
                <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  ✏️ Edit
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-300 transition-colors">
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
                    🖼️
                  </div>
                  <p className="text-xs">No image selected</p>
                  <p className="text-xs text-gray-400 mt-1">Double-click to add image</p>
                </div>
              </div>
            )}
          </div>
        )
      
      case 'chart':
        // Ensure we have valid chart data and type
        const chartData = element.chartData || []
        const chartType = element.chartType || 'bar'
        
        // Convert chart type to match TremorChartRenderer expectations
        const tremortType = chartType === 'pie' ? 'donut' : 
                           chartType === 'scatter' ? 'scatter' : 
                           chartType === 'line' ? 'line' : 
                           chartType === 'area' ? 'area' : 'bar'
        
        return (
          <div 
            style={{ ...style, padding: '4px' }} 
            className={cn(
              "overflow-hidden relative",
              chartData.length > 0 && "cursor-pointer hover:ring-2 hover:ring-blue-300 hover:ring-opacity-50 transition-all duration-200"
            )}
            title={chartData.length > 0 ? "Double-click to edit chart" : "No chart data - double-click to add data"}
          >
            {chartData.length > 0 ? (
              <>
                <TremorChartRenderer
                  data={chartData}
                  type={tremortType as any}
                  title={element.content || element.metadata?.title || 'Chart'}
                  subtitle={element.metadata?.subtitle}
                  xAxisKey={element.metadata?.xAxis || Object.keys(chartData[0] || {})[0] || 'name'}
                  yAxisKey={element.metadata?.yAxis || Object.keys(chartData[0] || {}).find(key => 
                    typeof chartData[0]?.[key] === 'number'
                  ) || 'value'}
                  colors={element.style?.colors || ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6']}
                  showAnimation={true}
                  showGrid={element.metadata?.showGrid !== false}
                  showLegend={element.metadata?.showLegend !== false}
                  consultingStyle="mckinsey"
                  className="w-full h-full"
                  insight={element.metadata?.insight}
                  dataCallout={element.metadata?.dataCallout}
                />
                {/* Edit indicator overlay for charts with data */}
                <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  ✏️ Edit
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200 rounded cursor-pointer hover:bg-gray-200 transition-colors">
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
                    📊
                  </div>
                  <p className="text-xs">No chart data</p>
                  <p className="text-xs text-gray-400 mt-1">Double-click to edit</p>
                </div>
              </div>
            )}
          </div>
        )
      
      case 'shape':
        const shapeType = element.content || 'rectangle'
        const shapeStyle = element.metadata?.shapeStyle || {}
        
        // For SVG shapes, use SVG rendering
        const svgShapes = ['triangle', 'diamond', 'hexagon', 'star', 'heart', 'arrow-right', 'arrow-left', 'arrow-up', 'arrow-down']
        const isExistingBasicShape = ['circle', 'rectangle'].includes(shapeType)
        
        if (svgShapes.includes(shapeType)) {
          // Define SVG paths for different shapes
          const shapePaths: Record<string, string> = {
            triangle: 'M50,15 L85,85 L15,85 Z',
            diamond: 'M50,15 L85,50 L50,85 L15,50 Z',
            hexagon: 'M30,15 L70,15 L85,50 L70,85 L30,85 L15,50 Z',
            star: 'M50,5 L61,35 L95,35 L68,57 L79,91 L50,70 L21,91 L32,57 L5,35 L39,35 Z',
            heart: 'M50,85 C20,60 5,40 5,25 C5,15 15,5 25,5 C35,5 45,15 50,25 C55,15 65,5 75,5 C85,5 95,15 95,25 C95,40 80,60 50,85 Z',
            'arrow-right': 'M15,35 L65,35 L65,25 L85,50 L65,75 L65,65 L15,65 Z',
            'arrow-left': 'M85,35 L35,35 L35,25 L15,50 L35,75 L35,65 L85,65 Z',
            'arrow-up': 'M35,85 L35,35 L25,35 L50,15 L75,35 L65,35 L65,85 Z',
            'arrow-down': 'M35,15 L35,65 L25,65 L50,85 L75,65 L65,65 L65,15 Z'
          }
          
          return (
            <div 
              style={{ ...style, padding: '0' }} 
              className={cn(
                "w-full h-full cursor-pointer hover:ring-2 hover:ring-blue-300 hover:ring-opacity-50 transition-all duration-200"
              )}
              title="Double-click to edit shape"
            >
              <svg 
                width="100%" 
                height="100%" 
                viewBox="0 0 100 100" 
                className="w-full h-full"
              >
                <path
                  d={shapePaths[shapeType]}
                  fill={element.style?.backgroundColor || shapeStyle.fill || '#3B82F6'}
                  stroke={element.style?.borderColor || shapeStyle.stroke || '#1E40AF'}
                  strokeWidth={(element.style?.borderWidth || shapeStyle.strokeWidth || 2) * 2} // Scale for SVG
                  opacity={element.style?.opacity || shapeStyle.opacity || 1}
                />
              </svg>
              {/* Edit indicator overlay */}
              <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                ✏️ Edit
              </div>
            </div>
          )
        }
        
        // For basic shapes, use div with CSS
        return (
          <div 
            style={{
              ...style,
              backgroundColor: element.style?.backgroundColor || shapeStyle.fill || '#3B82F6',
              borderColor: element.style?.borderColor || shapeStyle.stroke || '#1E40AF',
              borderWidth: `${element.style?.borderWidth || shapeStyle.strokeWidth || 2}px`,
              borderStyle: 'solid',
              borderRadius: shapeType === 'circle' ? '50%' : `${element.style?.borderRadius || shapeStyle.borderRadius || 0}px`,
              opacity: element.style?.opacity || shapeStyle.opacity || 1,
              cursor: 'pointer'
            }}
            className={cn(
              "w-full h-full relative hover:ring-2 hover:ring-blue-300 hover:ring-opacity-50 transition-all duration-200"
            )}
            title="Double-click to edit shape"
          >
            {/* Edit indicator overlay */}
            <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              ✏️ Edit
            </div>
          </div>
        )
      
      default:
        return <div style={style}>Unknown element type</div>
    }
  }

  // Resize handles
  const resizeHandles = isSelected && !element.isLocked && !editingText ? [
    { position: 'nw', cursor: 'nw-resize', className: 'top-0 left-0 -translate-x-1/2 -translate-y-1/2' },
    { position: 'n', cursor: 'n-resize', className: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2' },
    { position: 'ne', cursor: 'ne-resize', className: 'top-0 right-0 translate-x-1/2 -translate-y-1/2' },
    { position: 'e', cursor: 'e-resize', className: 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2' },
    { position: 'se', cursor: 'se-resize', className: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2' },
    { position: 's', cursor: 's-resize', className: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' },
    { position: 'sw', cursor: 'sw-resize', className: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2' },
    { position: 'w', cursor: 'w-resize', className: 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2' },
  ] : []

  return (
    <motion.div
      ref={elementRef}
      className={cn(
        "absolute cursor-move select-none",
        isSelected && "ring-2 ring-blue-500",
        isMultiSelected && !isSelected && "ring-2 ring-purple-400",
        element.isLocked && "cursor-not-allowed",
        isDragging && "z-50",
        !element.isVisible && "opacity-50"
      )}
      style={{
        left: element.position.x,
        top: element.position.y,
        width: element.size.width,
        height: element.size.height,
        transform: `rotate(${element.rotation}deg)`,
        zIndex: isSelected ? 10 : 1,
      }}
      onMouseDown={handleMouseDown}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Element content */}
      <div className="w-full h-full relative">
        {renderElementContent()}
        
        {/* Selection outline */}
        {(isSelected || isMultiSelected) && !editingText && (
          <div className={cn(
            "absolute inset-0 border-2 pointer-events-none",
            isSelected ? "border-blue-500" : "border-purple-400"
          )} />
        )}
        
        {/* Lock indicator */}
        {element.isLocked && isSelected && (
          <div className="absolute top-2 right-2 text-red-500">
            <Lock size={16} />
          </div>
        )}
      </div>

      {/* Resize handles */}
      {resizeHandles.map((handle) => (
        <div
          key={handle.position}
          className={cn(
            "absolute w-3 h-3 bg-blue-500 border border-white rounded-sm",
            handle.className
          )}
          style={{ cursor: handle.cursor }}
          onMouseDown={(e) => handleResizeMouseDown(e, handle.position)}
        />
      ))}

      {/* Quick action buttons */}
      {isSelected && !editingText && !element.isLocked && (
        <div className="absolute -top-10 left-0 flex gap-1 bg-gray-800 rounded-md p-1">
          <button
            onClick={() => onDuplicate?.(element.id)}
            className="p-1 text-white hover:bg-gray-700 rounded"
            title="Duplicate"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={() => onDelete?.(element.id)}
            className="p-1 text-white hover:bg-red-600 rounded"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={() => onUpdate?.(element.id, { rotation: (element.rotation + 90) % 360 })}
            className="p-1 text-white hover:bg-gray-700 rounded"
            title="Rotate"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      )}

      {/* Alignment guides (would be implemented at parent level) */}
      {showAlignmentGuides && isSelected && isDragging && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Alignment guide lines would be rendered here */}
        </div>
      )}
    </motion.div>
  )
}