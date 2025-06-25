'use client'

import React, { useRef, useEffect, useState } from 'react'
import Moveable from 'moveable'

interface MovableElementProps {
  id: string
  children: React.ReactNode
  position: { x: number; y: number }
  size: { width: number; height: number }
  rotation?: number
  isSelected?: boolean
  isLocked?: boolean
  onUpdate?: (updates: {
    position?: { x: number; y: number }
    size?: { width: number; height: number }
    rotation?: number
  }) => void
  onSelect?: () => void
  className?: string
  style?: React.CSSProperties
}

export default function MovableElement({
  id,
  children,
  position,
  size,
  rotation = 0,
  isSelected = false,
  isLocked = false,
  onUpdate,
  onSelect,
  className = '',
  style = {}
}: MovableElementProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const moveableRef = useRef<Moveable>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    if (!elementRef.current) return

    // Create Moveable instance
    const moveable = new Moveable(document.body, {
      target: elementRef.current,
      
      // Enable/disable based on selection and lock state
      draggable: isSelected && !isLocked,
      resizable: isSelected && !isLocked,
      rotatable: isSelected && !isLocked,
      
      // Snap to grid
      snappable: true,
      snapThreshold: 5,
      isDisplaySnapDigit: true,
      
      // Bounds
      bounds: { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight },
      
      // Resize guidelines
      renderDirections: ['nw', 'ne', 'sw', 'se', 'n', 'e', 's', 'w'],
      
      // Visual guidelines
      elementGuidelines: [],
      
      // Throttle for performance
      throttleDrag: 0,
      throttleResize: 0,
      throttleRotate: 0,
      
      // Edge snapping
      edgeDraggable: false,
      
      // Keep aspect ratio with shift key
      keepRatio: false,
      
      // Origin
      origin: true
    })

    // Event handlers
    moveable.on('dragStart', () => {
      setIsDragging(true)
    })

    moveable.on('drag', (e) => {
      e.target.style.transform = e.transform
      
      // Update position
      if (onUpdate) {
        onUpdate({
          position: {
            x: position.x + e.dist[0],
            y: position.y + e.dist[1]
          }
        })
      }
    })

    moveable.on('dragEnd', () => {
      setIsDragging(false)
    })

    moveable.on('resizeStart', () => {
      setIsDragging(true)
    })

    moveable.on('resize', (e) => {
      e.target.style.width = `${e.width}px`
      e.target.style.height = `${e.height}px`
      e.target.style.transform = e.drag.transform
      
      // Update size and position
      if (onUpdate) {
        onUpdate({
          size: { width: e.width, height: e.height },
          position: {
            x: position.x + e.drag.dist[0],
            y: position.y + e.drag.dist[1]
          }
        })
      }
    })

    moveable.on('resizeEnd', () => {
      setIsDragging(false)
    })

    moveable.on('rotateStart', () => {
      setIsDragging(true)
    })

    moveable.on('rotate', (e) => {
      e.target.style.transform = e.drag.transform
      
      // Update rotation
      if (onUpdate) {
        onUpdate({
          rotation: e.rotation,
          position: {
            x: position.x + e.drag.dist[0],
            y: position.y + e.drag.dist[1]
          }
        })
      }
    })

    moveable.on('rotateEnd', () => {
      setIsDragging(false)
    })

    moveableRef.current = moveable

    // Update moveable when selection changes
    if (isSelected && !isLocked) {
      moveable.updateTarget()
    } else {
      moveable.target = null
    }

    return () => {
      moveable.destroy()
    }
  }, [isSelected, isLocked, onUpdate, position])

  // Update element transform when props change
  useEffect(() => {
    if (elementRef.current && !isDragging) {
      elementRef.current.style.transform = `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`
      elementRef.current.style.width = `${size.width}px`
      elementRef.current.style.height = `${size.height}px`
    }
  }, [position, size, rotation, isDragging])

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onSelect) {
      onSelect()
    }
  }

  return (
    <div
      ref={elementRef}
      id={`movable-${id}`}
      className={`absolute cursor-pointer ${isSelected ? 'z-50' : 'z-10'} ${className}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        border: isSelected ? '2px solid #3b82f6' : 'none',
        outline: isSelected ? '1px solid rgba(59, 130, 246, 0.3)' : 'none',
        userSelect: 'none',
        ...style
      }}
      onClick={handleClick}
      onMouseDown={(e) => {
        // Prevent default only if not interacting with content
        if (e.target === elementRef.current) {
          e.preventDefault()
        }
      }}
    >
      {children}
      
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full pointer-events-none" />
      )}
      
      {/* Locked indicator */}
      {isLocked && (
        <div className="absolute top-2 right-2 text-xs bg-red-500 text-white px-1 rounded pointer-events-none">
          🔒
        </div>
      )}
    </div>
  )
}