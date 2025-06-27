'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'
import { RotateCcw, Move, Trash2, Copy, Lock, Unlock } from 'lucide-react'

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
    
    // Double click for text editing
    if (e.detail === 2) {
      onDoubleClick?.(element.id)
      if (element.type === 'text') {
        setEditingText(true)
        setTimeout(() => textareaRef.current?.focus(), 0)
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
          <div style={style} className="overflow-hidden">
            {element.content ? (
              <img 
                src={element.content} 
                alt="Slide element" 
                className="w-full h-full object-cover"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                Image placeholder
              </div>
            )}
          </div>
        )
      
      case 'chart':
        return (
          <div style={style} className="p-2">
            <ResponsiveContainer width="100%" height="100%">
              {element.chartType === 'bar' ? (
                <BarChart data={element.chartData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              ) : element.chartType === 'line' ? (
                <LineChart data={element.chartData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              ) : (
                <PieChart>
                  <Pie
                    data={element.chartData || []}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#3B82F6"
                  />
                  <Tooltip />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        )
      
      case 'shape':
        return (
          <div 
            style={style}
            className={cn(
              "w-full h-full",
              element.content === 'circle' && "rounded-full",
              element.content === 'rectangle' && "rounded-lg"
            )}
          />
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