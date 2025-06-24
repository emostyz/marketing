'use client'

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import Moveable from 'moveable'
import { debounce } from 'lodash'
import { toast } from 'react-hot-toast'

interface SlideElement {
  id: string
  type: 'text' | 'image' | 'chart' | 'shape'
  position: { x: number; y: number }
  size: { width: number; height: number }
  rotation?: number
  content?: any
  style?: any
  isLocked?: boolean
  zIndex?: number
}

interface EditableElementProps {
  element: SlideElement
  slideId: string
  isSelected: boolean
  onSelect: () => void
  onUpdate: (updates: Partial<SlideElement>) => void
  onDelete?: () => void
  onDuplicate?: () => void
  containerRef?: React.RefObject<HTMLElement>
  guidelines?: { horizontal: number[]; vertical: number[] }
  snapToGrid?: boolean
  gridSize?: number
}

export function EditableElement({
  element,
  slideId,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  containerRef,
  guidelines = { horizontal: [0, 300, 600], vertical: [0, 400, 800] },
  snapToGrid = true,
  gridSize = 10
}: EditableElementProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const moveableRef = useRef<Moveable | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isRotating, setIsRotating] = useState(false)

  // Debounced update function to prevent excessive re-renders
  const debouncedUpdate = useMemo(
    () => debounce((updates: Partial<SlideElement>) => {
      onUpdate(updates)
    }, 50),
    [onUpdate]
  )

  // Initialize Moveable
  useEffect(() => {
    if (!elementRef.current || element.isLocked) return

    const container = containerRef?.current || document.querySelector('.slide-canvas') || document.body
    
    const moveable = new Moveable(container, {
      target: isSelected ? elementRef.current : null,
      
      // Core features
      draggable: isSelected && !element.isLocked,
      resizable: isSelected && !element.isLocked,
      rotatable: isSelected && !element.isLocked,
      
      // Snapping
      snappable: snapToGrid,
      snapCenter: true,
      snapThreshold: 5,
      snapGridWidth: gridSize,
      snapGridHeight: gridSize,
      isDisplaySnapDigit: true,
      
      // Guidelines
      horizontalGuidelines: guidelines.horizontal,
      verticalGuidelines: guidelines.vertical,
      elementGuidelines: Array.from(container.querySelectorAll('[data-element-id]')),
      
      // Bounds - keep within slide canvas
      bounds: { 
        left: 0, 
        top: 0, 
        right: 800, // Standard slide width
        bottom: 600 // Standard slide height
      },
      
      // Resize handles
      renderDirections: ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'],
      edge: true,
      
      // Performance optimization
      throttleDrag: 0,
      throttleResize: 0,
      throttleRotate: 0,
      
      // Visual settings
      zoom: 1,
      origin: true,
      padding: { left: 0, top: 0, right: 0, bottom: 0 },
      
      // Keep aspect ratio with shift key
      keepRatio: false,
      
      // Rotation threshold
      rotationPosition: 'top'
    })

    // Drag Events
    moveable.on('dragStart', () => {
      setIsDragging(true)
    })

    moveable.on('drag', (e) => {
      e.target.style.transform = e.transform
    })

    moveable.on('dragEnd', (e) => {
      setIsDragging(false)
      const newPosition = {
        x: element.position.x + e.lastEvent.translate[0],
        y: element.position.y + e.lastEvent.translate[1]
      }
      
      // Snap to grid if enabled
      if (snapToGrid) {
        newPosition.x = Math.round(newPosition.x / gridSize) * gridSize
        newPosition.y = Math.round(newPosition.y / gridSize) * gridSize
      }
      
      onUpdate({ position: newPosition })
    })

    // Resize Events
    moveable.on('resizeStart', () => {
      setIsResizing(true)
    })

    moveable.on('resize', (e) => {
      e.target.style.width = `${e.width}px`
      e.target.style.height = `${e.height}px`
      e.target.style.transform = e.drag.transform
    })

    moveable.on('resizeEnd', (e) => {
      setIsResizing(false)
      let newSize = {
        width: e.lastEvent.width,
        height: e.lastEvent.height
      }
      
      let newPosition = {
        x: element.position.x + e.lastEvent.drag.translate[0],
        y: element.position.y + e.lastEvent.drag.translate[1]
      }
      
      // Snap to grid if enabled
      if (snapToGrid) {
        newSize.width = Math.round(newSize.width / gridSize) * gridSize
        newSize.height = Math.round(newSize.height / gridSize) * gridSize
        newPosition.x = Math.round(newPosition.x / gridSize) * gridSize
        newPosition.y = Math.round(newPosition.y / gridSize) * gridSize
      }
      
      onUpdate({ 
        size: newSize,
        position: newPosition
      })
    })

    // Rotation Events
    moveable.on('rotateStart', () => {
      setIsRotating(true)
    })

    moveable.on('rotate', (e) => {
      e.target.style.transform = e.drag.transform
    })

    moveable.on('rotateEnd', (e) => {
      setIsRotating(false)
      onUpdate({ 
        rotation: e.lastEvent.rotation,
        position: {
          x: element.position.x + e.lastEvent.drag.translate[0],
          y: element.position.y + e.lastEvent.drag.translate[1]
        }
      })
    })

    moveableRef.current = moveable

    return () => {
      moveable.destroy()
    }
  }, [isSelected, element.isLocked, snapToGrid, gridSize])

  // Update element transform when props change (but not while dragging)
  useEffect(() => {
    if (elementRef.current && !isDragging && !isResizing && !isRotating) {
      const { x, y } = element.position
      const { width, height } = element.size
      const rotation = element.rotation || 0
      
      elementRef.current.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`
      elementRef.current.style.width = `${width}px`
      elementRef.current.style.height = `${height}px`
    }
  }, [element.position, element.size, element.rotation, isDragging, isResizing, isRotating])

  // Handle element selection
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onSelect()
  }, [onSelect])

  // Handle double-click for editing
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (element.type === 'text') {
      // Enable text editing mode
      const textElement = elementRef.current?.querySelector('.text-content') as HTMLElement
      if (textElement) {
        textElement.contentEditable = 'true'
        textElement.focus()
        
        // Select all text for easy editing
        const range = document.createRange()
        range.selectNodeContents(textElement)
        const selection = window.getSelection()
        selection?.removeAllRanges()
        selection?.addRange(range)
      }
    }
  }, [element.type])

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isSelected) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete element
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (onDelete && !element.isLocked) {
          onDelete()
        }
      }
      
      // Duplicate element
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault()
        if (onDuplicate) {
          onDuplicate()
        }
      }
      
      // Arrow key movement
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
        const step = e.shiftKey ? gridSize : 1
        const { x, y } = element.position
        
        let newPosition = { x, y }
        
        switch (e.key) {
          case 'ArrowUp':
            newPosition.y -= step
            break
          case 'ArrowDown':
            newPosition.y += step
            break
          case 'ArrowLeft':
            newPosition.x -= step
            break
          case 'ArrowRight':
            newPosition.x += step
            break
        }
        
        // Keep within bounds
        newPosition.x = Math.max(0, Math.min(800 - element.size.width, newPosition.x))
        newPosition.y = Math.max(0, Math.min(600 - element.size.height, newPosition.y))
        
        onUpdate({ position: newPosition })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSelected, element, onDelete, onDuplicate, onUpdate, gridSize])

  // Render element content based on type
  const renderContent = () => {
    switch (element.type) {
      case 'text':
        return (
          <div
            className="text-content w-full h-full p-2 outline-none"
            style={{
              fontSize: element.style?.fontSize || 16,
              fontFamily: element.style?.fontFamily || 'Inter',
              fontWeight: element.style?.fontWeight || 400,
              color: element.style?.color || '#000000',
              textAlign: element.style?.textAlign || 'left',
              lineHeight: element.style?.lineHeight || 1.5,
              backgroundColor: element.style?.backgroundColor || 'transparent',
              border: element.style?.border || 'none',
              borderRadius: element.style?.borderRadius || 0,
              overflow: 'hidden'
            }}
            onBlur={(e) => {
              const target = e.target as HTMLElement
              target.contentEditable = 'false'
              onUpdate({ 
                content: {
                  ...element.content,
                  text: target.textContent || '',
                  html: target.innerHTML || ''
                }
              })
            }}
            dangerouslySetInnerHTML={{ 
              __html: element.content?.html || element.content || 'Double-click to edit'
            }}
          />
        )
      
      case 'image':
        return (
          <div className="w-full h-full bg-gray-200 border border-gray-300 rounded flex items-center justify-center">
            {element.content?.src ? (
              <img 
                src={element.content.src} 
                alt={element.content.alt || ''} 
                className="max-w-full max-h-full object-contain"
                draggable={false}
              />
            ) : (
              <span className="text-gray-500 text-sm">Click to add image</span>
            )}
          </div>
        )
      
      case 'shape':
        return (
          <div 
            className="w-full h-full"
            style={{
              backgroundColor: element.style?.backgroundColor || '#3b82f6',
              border: element.style?.border || 'none',
              borderRadius: element.style?.borderRadius || 8,
              opacity: element.style?.opacity || 1
            }}
          />
        )
      
      case 'chart':
        return (
          <div className="w-full h-full bg-white border border-gray-300 rounded flex items-center justify-center">
            <span className="text-gray-500 text-sm">Chart placeholder</span>
          </div>
        )
      
      default:
        return <div className="w-full h-full bg-gray-100 border border-dashed border-gray-300" />
    }
  }

  return (
    <div
      ref={elementRef}
      data-element-id={element.id}
      className={`
        absolute cursor-move transition-all duration-100
        ${isSelected ? 'z-50' : 'z-10'}
        ${element.isLocked ? 'cursor-not-allowed' : 'cursor-move'}
        ${isDragging || isResizing || isRotating ? 'pointer-events-none' : 'pointer-events-auto'}
      `}
      style={{
        transform: `translate(${element.position.x}px, ${element.position.y}px) rotate(${element.rotation || 0}deg)`,
        width: `${element.size.width}px`,
        height: `${element.size.height}px`,
        zIndex: element.zIndex || 1,
        outline: isSelected && !element.isLocked ? '2px solid #3b82f6' : 'none',
        outlineOffset: '2px'
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {renderContent()}
      
      {/* Selection indicators */}
      {isSelected && !element.isLocked && (
        <>
          <div className="absolute -top-2 -left-2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white pointer-events-none" />
          <div className="absolute -top-2 -right-2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white pointer-events-none" />
          <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white pointer-events-none" />
          <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white pointer-events-none" />
        </>
      )}
      
      {/* Lock indicator */}
      {element.isLocked && (
        <div className="absolute top-1 right-1 text-xs bg-red-500 text-white px-1 py-0.5 rounded pointer-events-none">
          🔒
        </div>
      )}
      
      {/* Element type indicator */}
      {isSelected && (
        <div className="absolute -top-6 left-0 text-xs bg-blue-500 text-white px-2 py-1 rounded pointer-events-none">
          {element.type}
        </div>
      )}
    </div>
  )
}

export default EditableElement