'use client'

import React, { useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { RotateCw, Move, Square, Eye, EyeOff, Lock, Unlock } from 'lucide-react'
import { cn } from '@/lib/utils'

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
}

interface DraggableElementProps {
  element: SlideElement
  isSelected: boolean
  isEditing: boolean
  slideScale: number
  onSelect: (elementId: string) => void
  onUpdate: (elementId: string, updates: Partial<SlideElement>) => void
  onStartDrag: () => void
  onEndDrag: () => void
  children: React.ReactNode
}

const RESIZE_HANDLE_SIZE = 8

export default function DraggableElement({
  element,
  isSelected,
  isEditing,
  slideScale,
  onSelect,
  onUpdate,
  onStartDrag,
  onEndDrag,
  children
}: DraggableElementProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, elementX: 0, elementY: 0 })
  const [resizeStart, setResizeStart] = useState({ 
    x: 0, y: 0, 
    width: 0, height: 0, 
    elementX: 0, elementY: 0 
  })

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (element.isLocked) return
    
    // FIXED: Prevent default and stop propagation properly
    e.preventDefault()
    e.stopPropagation()
    
    onSelect(element.id)
    
    if (!isEditing) return

    const rect = elementRef.current?.getBoundingClientRect()
    if (!rect) return

    setIsDragging(true)
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      elementX: element.position.x,
      elementY: element.position.y
    })
    onStartDrag()
    
    // FIXED: Attach event listeners immediately and properly clean up
    document.body.style.userSelect = 'none' // Prevent text selection
    document.body.style.cursor = 'grabbing'

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      
      const deltaX = (e.clientX - dragStart.x) / slideScale
      const deltaY = (e.clientY - dragStart.y) / slideScale

      // FIXED: Add bounds checking and smooth updates
      const newX = Math.max(0, Math.min(1200, dragStart.elementX + deltaX))
      const newY = Math.max(0, Math.min(650, dragStart.elementY + deltaY))

      onUpdate(element.id, {
        position: { x: newX, y: newY }
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      onEndDrag()
      
      // FIXED: Restore cursor and selection
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
      
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [element, isEditing, slideScale, onSelect, onUpdate, onStartDrag, onEndDrag, dragStart, isDragging])

  const handleResizeMouseDown = useCallback((e: React.MouseEvent, handle: string) => {
    if (element.isLocked) return
    
    e.preventDefault()
    e.stopPropagation()

    setIsResizing(true)
    setResizeHandle(handle)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: element.size.width,
      height: element.size.height,
      elementX: element.position.x,
      elementY: element.position.y
    })

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return

      const deltaX = (e.clientX - resizeStart.x) / slideScale
      const deltaY = (e.clientY - resizeStart.y) / slideScale

      let newWidth = resizeStart.width
      let newHeight = resizeStart.height
      let newX = resizeStart.elementX
      let newY = resizeStart.elementY

      switch (handle) {
        case 'nw':
          newWidth = Math.max(20, resizeStart.width - deltaX)
          newHeight = Math.max(20, resizeStart.height - deltaY)
          newX = resizeStart.elementX + deltaX
          newY = resizeStart.elementY + deltaY
          break
        case 'ne':
          newWidth = Math.max(20, resizeStart.width + deltaX)
          newHeight = Math.max(20, resizeStart.height - deltaY)
          newY = resizeStart.elementY + deltaY
          break
        case 'sw':
          newWidth = Math.max(20, resizeStart.width - deltaX)
          newHeight = Math.max(20, resizeStart.height + deltaY)
          newX = resizeStart.elementX + deltaX
          break
        case 'se':
          newWidth = Math.max(20, resizeStart.width + deltaX)
          newHeight = Math.max(20, resizeStart.height + deltaY)
          break
        case 'n':
          newHeight = Math.max(20, resizeStart.height - deltaY)
          newY = resizeStart.elementY + deltaY
          break
        case 's':
          newHeight = Math.max(20, resizeStart.height + deltaY)
          break
        case 'w':
          newWidth = Math.max(20, resizeStart.width - deltaX)
          newX = resizeStart.elementX + deltaX
          break
        case 'e':
          newWidth = Math.max(20, resizeStart.width + deltaX)
          break
      }

      onUpdate(element.id, {
        position: { x: Math.max(0, newX), y: Math.max(0, newY) },
        size: { width: newWidth, height: newHeight }
      })
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      setResizeHandle(null)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [element, slideScale, onUpdate, resizeStart, isResizing])

  const renderResizeHandles = () => {
    if (!isSelected || !isEditing || element.isLocked || element.isVisible === false) return null

    const handles = [
      { id: 'nw', className: 'top-0 left-0 cursor-nw-resize' },
      { id: 'ne', className: 'top-0 right-0 cursor-ne-resize' },
      { id: 'sw', className: 'bottom-0 left-0 cursor-sw-resize' },
      { id: 'se', className: 'bottom-0 right-0 cursor-se-resize' },
      { id: 'n', className: 'top-0 left-1/2 transform -translate-x-1/2 cursor-n-resize' },
      { id: 's', className: 'bottom-0 left-1/2 transform -translate-x-1/2 cursor-s-resize' },
      { id: 'w', className: 'top-1/2 left-0 transform -translate-y-1/2 cursor-w-resize' },
      { id: 'e', className: 'top-1/2 right-0 transform -translate-y-1/2 cursor-e-resize' }
    ]

    return (
      <>
        {handles.map((handle) => (
          <div
            key={handle.id}
            className={cn(
              'absolute bg-blue-500 border border-white rounded-sm hover:bg-blue-600 transition-colors z-10',
              handle.className
            )}
            style={{
              width: RESIZE_HANDLE_SIZE,
              height: RESIZE_HANDLE_SIZE,
              marginTop: handle.className.includes('top') ? -RESIZE_HANDLE_SIZE / 2 : 0,
              marginBottom: handle.className.includes('bottom') ? -RESIZE_HANDLE_SIZE / 2 : 0,
              marginLeft: handle.className.includes('left') ? -RESIZE_HANDLE_SIZE / 2 : 0,
              marginRight: handle.className.includes('right') ? -RESIZE_HANDLE_SIZE / 2 : 0,
            }}
            onMouseDown={(e) => handleResizeMouseDown(e, handle.id)}
          />
        ))}
      </>
    )
  }

  const renderSelectionBorder = () => {
    if (!isSelected || element.isVisible === false) return null

    return (
      <div
        className={cn(
          'absolute inset-0 border-2 pointer-events-none',
          element.isLocked ? 'border-red-500 border-dashed' : 'border-blue-500'
        )}
        style={{
          borderRadius: element.style?.borderRadius || 0
        }}
      />
    )
  }

  const renderElementIcons = () => {
    if (!isSelected || !isEditing) return null

    return (
      <div className="absolute -top-8 left-0 flex items-center gap-1 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs">
        {element.isLocked && <Lock className="w-3 h-3 text-red-400" />}
        {element.isVisible === false && <EyeOff className="w-3 h-3 text-gray-400" />}
        <span className="text-gray-300 capitalize">{element.type}</span>
      </div>
    )
  }

  if (element.isVisible === false) {
    return null
  }

  return (
    <motion.div
      ref={elementRef}
      className={cn(
        'absolute select-none',
        isDragging && 'z-30',
        isSelected && 'z-20',
        element.isLocked ? 'cursor-not-allowed' : (isDragging ? 'cursor-grabbing' : 'cursor-grab'),
        'pointer-events-auto' // FIXED: Ensure mouse events work
      )}
      style={{
        left: element.position.x * slideScale,
        top: element.position.y * slideScale,
        width: element.size.width * slideScale,
        height: element.size.height * slideScale,
        transform: `rotate(${element.rotation}deg)`,
        opacity: element.style?.opacity || 1,
        touchAction: 'none' // FIXED: Prevent touch scrolling during drag
      }}
      onMouseDown={handleMouseDown}
      animate={{
        scale: isDragging ? 1.05 : isSelected ? 1.02 : 1,
        filter: isDragging ? 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' : 'none'
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25
      }}
    >
      {/* Element Content */}
      <div className="w-full h-full relative">
        {children}
      </div>

      {/* Selection Border */}
      {renderSelectionBorder()}

      {/* Resize Handles */}
      {renderResizeHandles()}

      {/* Element Info */}
      {renderElementIcons()}

      {/* Rotation Handle */}
      {isSelected && isEditing && !element.isLocked && (
        <div
          className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-green-500 border border-white rounded-full cursor-grab hover:bg-green-600 flex items-center justify-center"
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
            
            const rect = elementRef.current?.getBoundingClientRect()
            if (!rect) return

            const centerX = rect.left + rect.width / 2
            const centerY = rect.top + rect.height / 2

            const handleMouseMove = (e: MouseEvent) => {
              const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX)
              const degrees = (angle * 180) / Math.PI + 90
              onUpdate(element.id, { rotation: ((degrees % 360) + 360) % 360 })
            }

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove)
              document.removeEventListener('mouseup', handleMouseUp)
            }

            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
          }}
        >
          <RotateCw className="w-2 h-2 text-white" />
        </div>
      )}
    </motion.div>
  )
}