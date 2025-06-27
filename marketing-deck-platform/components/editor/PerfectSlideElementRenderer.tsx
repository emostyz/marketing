'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, useAnimation, useDragControls } from 'framer-motion'
import { 
  Copy, Trash2, RotateCcw, Lock, Unlock, Eye, EyeOff, 
  Move, Maximize2, Minimize2, AlignCenter, AlignLeft, AlignRight,
  Bold, Italic, Underline, Palette, Type, ZoomIn, ZoomOut,
  MoreHorizontal, Settings, Layers, Group, ArrowUp, ArrowDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import TremorChartRenderer from '@/components/charts/TremorChartRenderer'

interface SlideElement {
  id: string
  type: 'text' | 'image' | 'chart' | 'shape'
  position: { x: number; y: number }
  size: { width: number; height: number }
  rotation: number
  content?: string
  style?: any
  isLocked?: boolean
  isVisible?: boolean
  metadata?: any
  chartData?: any[]
  chartType?: string
  zIndex?: number
  opacity?: number
  borderRadius?: number
  boxShadow?: string
  gradient?: string
}

interface PerfectSlideElementRendererProps {
  element: SlideElement
  isSelected?: boolean
  isMultiSelected?: boolean
  isEditing?: boolean
  onSelect?: (elementId: string, event?: React.MouseEvent) => void
  onUpdate?: (elementId: string, updates: Partial<SlideElement>) => void
  onDoubleClick?: (elementId: string) => void
  onDelete?: (elementId: string) => void
  onDuplicate?: (elementId: string) => void
  onMoveLayer?: (elementId: string, direction: 'up' | 'down' | 'top' | 'bottom') => void
  zoom?: number
  snapToGrid?: boolean
  showAdvancedControls?: boolean
  showAlignmentGuides?: boolean
  gridSize?: number
}

export default function PerfectSlideElementRenderer({
  element,
  isSelected = false,
  isMultiSelected = false,
  isEditing = false,
  onSelect,
  onUpdate,
  onDoubleClick,
  onDelete,
  onDuplicate,
  onMoveLayer,
  zoom = 100,
  snapToGrid = true,
  showAdvancedControls = true,
  showAlignmentGuides = true,
  gridSize = 20
}: PerfectSlideElementRendererProps) {
  const [editingText, setEditingText] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 })
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 })
  const [showAdvancedToolbar, setShowAdvancedToolbar] = useState(false)
  const [hovering, setHovering] = useState(false)

  const elementRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const dragControls = useDragControls()
  const controls = useAnimation()

  // Snap to grid helper
  const snapToGridValue = useCallback((value: number) => {
    if (!snapToGrid) return value
    return Math.round(value / gridSize) * gridSize
  }, [snapToGrid, gridSize])

  // Enhanced drag functionality with perfect precision
  const handleDragStart = (e: React.MouseEvent) => {
    if (element.isLocked || editingText) return
    
    e.stopPropagation()
    setIsDragging(true)
    setDragStartPos({ x: e.clientX, y: e.clientY })
    onSelect?.(element.id, e)
  }

  const handleDrag = useCallback((e: MouseEvent) => {
    if (!isDragging || !elementRef.current) return

    const deltaX = e.clientX - dragStartPos.x
    const deltaY = e.clientY - dragStartPos.y
    
    const newX = snapToGridValue(element.position.x + deltaX)
    const newY = snapToGridValue(element.position.y + deltaY)

    onUpdate?.(element.id, {
      position: { x: newX, y: newY }
    })

    setDragStartPos({ x: e.clientX, y: e.clientY })
  }, [isDragging, dragStartPos, element.position, element.id, onUpdate, snapToGridValue])

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Advanced resize handles
  const renderResizeHandles = () => {
    if (!isSelected || editingText || element.isLocked) return null

    const handles = [
      { position: 'top-left', cursor: 'nw-resize' },
      { position: 'top-right', cursor: 'ne-resize' },
      { position: 'bottom-left', cursor: 'sw-resize' },
      { position: 'bottom-right', cursor: 'se-resize' },
      { position: 'top', cursor: 'n-resize' },
      { position: 'bottom', cursor: 's-resize' },
      { position: 'left', cursor: 'w-resize' },
      { position: 'right', cursor: 'e-resize' }
    ]

    return handles.map((handle) => (
      <div
        key={handle.position}
        className={cn(
          "absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-sm shadow-lg",
          "hover:bg-blue-600 transition-colors duration-150",
          "cursor-" + handle.cursor.split('-')[0]
        )}
        style={{
          cursor: handle.cursor,
          ...(handle.position.includes('top') && { top: -6 }),
          ...(handle.position.includes('bottom') && { bottom: -6 }),
          ...(handle.position.includes('left') && { left: -6 }),
          ...(handle.position.includes('right') && { right: -6 }),
          ...(handle.position === 'top' && { left: '50%', transform: 'translateX(-50%)' }),
          ...(handle.position === 'bottom' && { left: '50%', transform: 'translateX(-50%)' }),
          ...(handle.position === 'left' && { top: '50%', transform: 'translateY(-50%)' }),
          ...(handle.position === 'right' && { top: '50%', transform: 'translateY(-50%)' })
        }}
        onMouseDown={(e) => {
          e.stopPropagation()
          setIsResizing(true)
          // Add resize logic here
        }}
      />
    ))
  }

  // Perfect hover controls with smooth animations
  const renderHoverControls = () => {
    if (!isSelected || editingText || element.isLocked || !showAdvancedControls) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="absolute -top-12 left-0 flex items-center gap-1 bg-gray-900/95 backdrop-blur-sm rounded-lg p-1 shadow-xl border border-gray-700"
        style={{ zIndex: 9999 }}
      >
        <TooltipProvider delayDuration={300}>
          {/* Duplicate */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onDuplicate?.(element.id)
                }}
                className="h-8 w-8 p-0 text-white hover:bg-blue-600/50 transition-all duration-150"
              >
                <Copy size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Duplicate (Ctrl+D)</TooltipContent>
          </Tooltip>

          {/* Delete */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete?.(element.id)
                }}
                className="h-8 w-8 p-0 text-white hover:bg-red-600/50 transition-all duration-150"
              >
                <Trash2 size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Delete (Del)</TooltipContent>
          </Tooltip>

          {/* Rotate */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onUpdate?.(element.id, { 
                    rotation: (element.rotation + 90) % 360 
                  })
                }}
                className="h-8 w-8 p-0 text-white hover:bg-green-600/50 transition-all duration-150"
              >
                <RotateCcw size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Rotate 90° (R)</TooltipContent>
          </Tooltip>

          {/* Lock/Unlock */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onUpdate?.(element.id, { 
                    isLocked: !element.isLocked 
                  })
                }}
                className="h-8 w-8 p-0 text-white hover:bg-yellow-600/50 transition-all duration-150"
              >
                {element.isLocked ? <Lock size={14} /> : <Unlock size={14} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {element.isLocked ? 'Unlock (Ctrl+L)' : 'Lock (Ctrl+L)'}
            </TooltipContent>
          </Tooltip>

          {/* Visibility */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onUpdate?.(element.id, { 
                    isVisible: !element.isVisible 
                  })
                }}
                className="h-8 w-8 p-0 text-white hover:bg-purple-600/50 transition-all duration-150"
              >
                {element.isVisible !== false ? <Eye size={14} /> : <EyeOff size={14} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {element.isVisible !== false ? 'Hide (H)' : 'Show (H)'}
            </TooltipContent>
          </Tooltip>

          {/* Layer Controls */}
          <div className="h-6 w-px bg-gray-600 mx-1" />
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onMoveLayer?.(element.id, 'up')
                }}
                className="h-8 w-8 p-0 text-white hover:bg-indigo-600/50 transition-all duration-150"
              >
                <ArrowUp size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Bring Forward (Ctrl+])</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onMoveLayer?.(element.id, 'down')
                }}
                className="h-8 w-8 p-0 text-white hover:bg-indigo-600/50 transition-all duration-150"
              >
                <ArrowDown size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Send Backward (Ctrl+[)</TooltipContent>
          </Tooltip>

          {/* Advanced Options */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowAdvancedToolbar(!showAdvancedToolbar)
                }}
                className="h-8 w-8 p-0 text-white hover:bg-gray-600/50 transition-all duration-150"
              >
                <MoreHorizontal size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">More Options</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.div>
    )
  }

  // Advanced toolbar for detailed styling
  const renderAdvancedToolbar = () => {
    if (!showAdvancedToolbar || !isSelected) return null

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="absolute -top-24 left-0 bg-gray-900/95 backdrop-blur-sm rounded-lg p-3 shadow-xl border border-gray-700 min-w-64"
        style={{ zIndex: 9998 }}
      >
        <div className="space-y-3">
          {/* Opacity Control */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-300 w-16">Opacity</span>
            <input
              type="range"
              min="0"
              max="100"
              value={(element.opacity || 1) * 100}
              onChange={(e) => onUpdate?.(element.id, { 
                opacity: parseInt(e.target.value) / 100 
              })}
              className="flex-1 accent-blue-500"
            />
            <span className="text-xs text-gray-400 w-8">
              {Math.round((element.opacity || 1) * 100)}%
            </span>
          </div>

          {/* Border Radius */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-300 w-16">Radius</span>
            <input
              type="range"
              min="0"
              max="50"
              value={element.borderRadius || 0}
              onChange={(e) => onUpdate?.(element.id, { 
                borderRadius: parseInt(e.target.value) 
              })}
              className="flex-1 accent-green-500"
            />
            <span className="text-xs text-gray-400 w-8">
              {element.borderRadius || 0}px
            </span>
          </div>

          {/* Z-Index */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-300 w-16">Z-Index</span>
            <input
              type="number"
              min="0"
              max="999"
              value={element.zIndex || 1}
              onChange={(e) => onUpdate?.(element.id, { 
                zIndex: parseInt(e.target.value) 
              })}
              className="flex-1 bg-gray-800 text-white text-xs px-2 py-1 rounded border border-gray-600"
            />
          </div>
        </div>
      </motion.div>
    )
  }

  // Perfect element content renderer
  const renderElementContent = () => {
    const commonStyle = {
      opacity: element.opacity || 1,
      borderRadius: element.borderRadius || 0,
      boxShadow: element.boxShadow || 'none',
      background: element.gradient || 'transparent',
      zIndex: element.zIndex || 1
    }

    switch (element.type) {
      case 'text':
        return editingText ? (
          <textarea
            ref={textareaRef}
            value={element.content || ''}
            onChange={(e) => onUpdate?.(element.id, { content: e.target.value })}
            onBlur={() => setEditingText(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setEditingText(false)
              }
            }}
            className="w-full h-full resize-none border-none outline-none bg-transparent text-inherit p-2 font-inherit"
            style={{
              fontSize: element.style?.fontSize || '16px',
              fontWeight: element.style?.fontWeight || 'normal',
              color: element.style?.color || '#000000',
              textAlign: element.style?.textAlign || 'left',
              ...commonStyle
            }}
          />
        ) : (
          <div
            className="w-full h-full p-2 cursor-text"
            style={{
              fontSize: element.style?.fontSize || '16px',
              fontWeight: element.style?.fontWeight || 'normal',
              color: element.style?.color || '#000000',
              textAlign: element.style?.textAlign || 'left',
              lineHeight: element.style?.lineHeight || '1.4',
              fontFamily: element.style?.fontFamily || 'inherit',
              ...commonStyle
            }}
          >
            {element.content || 'Double-click to edit text'}
          </div>
        )

      case 'chart':
        return (
          <div className="w-full h-full" style={commonStyle}>
            <TremorChartRenderer
              data={element.chartData || []}
              type={element.chartType as any || 'bar'}
              title=""
              className="w-full h-full"
            />
          </div>
        )

      case 'shape':
        return (
          <div
            className="w-full h-full"
            style={{
              backgroundColor: element.style?.backgroundColor || '#3b82f6',
              border: element.style?.border || 'none',
              ...commonStyle
            }}
          />
        )

      case 'image':
        return (
          <div
            className="w-full h-full bg-gray-200 flex items-center justify-center"
            style={commonStyle}
          >
            {element.content ? (
              <img
                src={element.content}
                alt="Slide element"
                className="w-full h-full object-cover"
                style={{ borderRadius: element.borderRadius || 0 }}
              />
            ) : (
              <div className="text-gray-500 text-center">
                <ImageIcon size={32} className="mx-auto mb-2" />
                <span className="text-sm">Image placeholder</span>
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center" style={commonStyle}>
            <span className="text-gray-500">Unknown element</span>
          </div>
        )
    }
  }

  // Mouse event handlers
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDrag)
      document.addEventListener('mouseup', handleDragEnd)
      return () => {
        document.removeEventListener('mousemove', handleDrag)
        document.removeEventListener('mouseup', handleDragEnd)
      }
    }
  }, [isDragging, handleDrag, handleDragEnd])

  return (
    <motion.div
      ref={elementRef}
      className={cn(
        "absolute select-none group",
        isSelected && "ring-2 ring-blue-500 ring-opacity-75",
        isMultiSelected && !isSelected && "ring-2 ring-purple-400 ring-opacity-75",
        element.isLocked && "cursor-not-allowed",
        isDragging && "z-50 cursor-grabbing",
        !isDragging && !element.isLocked && "cursor-grab hover:cursor-grab",
        element.isVisible === false && "opacity-50",
        hovering && "shadow-lg transition-shadow duration-200"
      )}
      style={{
        left: element.position.x,
        top: element.position.y,
        width: element.size.width,
        height: element.size.height,
        transform: `rotate(${element.rotation}deg)`,
        zIndex: element.zIndex || 1
      }}
      onMouseDown={handleDragStart}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => {
        setHovering(false)
        setShowAdvancedToolbar(false)
      }}
      onDoubleClick={(e) => {
        e.stopPropagation()
        onDoubleClick?.(element.id)
        if (element.type === 'text') {
          setEditingText(true)
          setTimeout(() => textareaRef.current?.focus(), 0)
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setContextMenuPos({ x: e.clientX, y: e.clientY })
        setShowContextMenu(true)
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: element.isVisible === false ? 0.5 : 1, 
        scale: 1 
      }}
      whileHover={{ 
        scale: isDragging ? 1 : 1.02,
        transition: { duration: 0.1 }
      }}
      transition={{ duration: 0.2 }}
    >
      {/* Element content */}
      <div className="w-full h-full relative overflow-hidden">
        {renderElementContent()}
        
        {/* Perfect selection outline */}
        {(isSelected || isMultiSelected) && !editingText && (
          <div 
            className={cn(
              "absolute inset-0 border-2 pointer-events-none",
              isSelected ? "border-blue-500 shadow-blue-500/25 shadow-lg" : "border-purple-400 shadow-purple-400/25 shadow-lg"
            )}
            style={{ borderRadius: element.borderRadius || 0 }}
          />
        )}
        
        {/* Lock indicator */}
        {element.isLocked && isSelected && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
          >
            <Lock size={12} />
          </motion.div>
        )}

        {/* Invisible indicator */}
        {element.isVisible === false && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-2 left-2 bg-gray-500 text-white rounded-full p-1"
          >
            <EyeOff size={12} />
          </motion.div>
        )}
      </div>

      {/* Resize handles */}
      {renderResizeHandles()}

      {/* Hover controls */}
      {renderHoverControls()}

      {/* Advanced toolbar */}
      {renderAdvancedToolbar()}
    </motion.div>
  )
}