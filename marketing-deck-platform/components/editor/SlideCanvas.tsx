'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import SlideElementRenderer from './SlideElementRenderer'
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
  metadata?: any
  chartData?: any[]
  chartType?: string
  isVisible?: boolean
}

interface Slide {
  id: string
  number: number
  title: string
  subtitle?: string
  content?: any
  elements: SlideElement[]
  background: any
  style?: string
  layout?: string
  animation?: any
  customStyles?: any
  charts?: any[]
  keyTakeaways?: string[]
  aiInsights?: any
  notes?: string
}

interface SlideCanvasProps {
  slide: Slide
  selectedElement?: string | null
  selectedElements?: string[]
  onElementSelect?: (elementId: string | null, event?: React.MouseEvent) => void
  onElementUpdate?: (elementId: string, updates: Partial<SlideElement>) => void
  onSlideUpdate?: (slideId: string, updates: Partial<Slide>) => void
  onElementDelete?: (elementId: string) => void
  onElementDuplicate?: (elementId: string) => void
  zoom?: number
  isEditable?: boolean
  showGrid?: boolean
  snapToGrid?: boolean
  className?: string
}

export default function SlideCanvas({
  slide,
  selectedElement,
  selectedElements = [],
  onElementSelect,
  onElementUpdate,
  onSlideUpdate,
  onElementDelete,
  onElementDuplicate,
  zoom = 100,
  isEditable = true,
  showGrid = false,
  snapToGrid = true,
  className
}: SlideCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 1280, height: 720 })

  useEffect(() => {
    // Standard presentation aspect ratio 16:9
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const container = canvasRef.current.parentElement
        if (container) {
          const containerWidth = container.clientWidth - 40 // Account for padding
          const aspectRatio = 16 / 9
          const width = Math.min(containerWidth, 1280)
          const height = width / aspectRatio
          
          setCanvasSize({ width, height })
        }
      }
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)
    return () => window.removeEventListener('resize', updateCanvasSize)
  }, [])

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if clicking on the canvas itself, not on elements
    if (e.target === e.currentTarget) {
      onElementSelect?.(null, e)
    }
  }

  const handleElementUpdate = (elementId: string, updates: Partial<SlideElement>) => {
    onElementUpdate?.(elementId, updates)
  }

  const getBackgroundStyle = () => {
    if (!slide.background) return { backgroundColor: '#ffffff' }

    switch (slide.background.type) {
      case 'solid':
        return { backgroundColor: slide.background.value || '#ffffff' }
      case 'gradient':
        return { background: slide.background.value || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
      case 'pattern':
        return { 
          backgroundColor: slide.background.value || '#f8fafc',
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }
      default:
        return { backgroundColor: '#ffffff' }
    }
  }

  const scale = zoom / 100

  return (
    <div className={cn('flex items-center justify-center p-4', className)}>
      <motion.div
        ref={canvasRef}
        className="relative bg-white shadow-2xl rounded-lg overflow-hidden border border-gray-200"
        style={{
          width: canvasSize.width * scale,
          height: canvasSize.height * scale,
          transform: `scale(${scale})`,
          transformOrigin: 'center',
          ...getBackgroundStyle()
        }}
        onClick={handleCanvasClick}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Slide title overlay (optional) */}
        {slide.title && (
          <div className="absolute top-4 left-4 right-4 z-5 pointer-events-none">
            <h2 className="text-2xl font-bold text-white drop-shadow-lg opacity-20">
              {slide.title}
            </h2>
          </div>
        )}

        {/* Render all slide elements */}
        {slide.elements.map((element) => (
          <SlideElementRenderer
            key={element.id}
            element={element}
            isSelected={selectedElement === element.id}
            isMultiSelected={selectedElements.includes(element.id)}
            onSelect={(elementId, event) => onElementSelect?.(elementId, event)}
            onUpdate={handleElementUpdate}
            onDoubleClick={(elementId) => {
              // Handle double-click to start text editing
              if (element.type === 'text') {
                onElementSelect?.(elementId)
              }
            }}
            onDelete={onElementDelete}
            onDuplicate={onElementDuplicate}
            snapToGrid={snapToGrid}
            zoom={100} // Elements handle their own scaling based on canvas scale
          />
        ))}

        {/* Advanced Grid overlay */}
        {showGrid && isEditable && (
          <div className="absolute inset-0 pointer-events-none opacity-30">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="advancedGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3b82f6" strokeWidth="0.5"/>
                  <path d="M 20 0 L 20 40 M 0 20 L 40 20" fill="none" stroke="#3b82f6" strokeWidth="0.25" opacity="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#advancedGrid)" />
            </svg>
          </div>
        )}

        {/* Selection grid overlay when element is selected */}
        {selectedElement && isEditable && !showGrid && (
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="selectionGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#3b82f6" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#selectionGrid)" />
            </svg>
          </div>
        )}

        {/* Slide number indicator */}
        <div className="absolute bottom-4 right-4 bg-black/20 text-white px-2 py-1 rounded text-sm font-medium">
          {slide.number}
        </div>

        {/* AI insights indicator */}
        {slide.aiInsights && (
          <div className="absolute top-4 right-4 bg-purple-500/80 text-white px-2 py-1 rounded text-xs font-medium">
            AI Enhanced
          </div>
        )}
      </motion.div>
    </div>
  )
}