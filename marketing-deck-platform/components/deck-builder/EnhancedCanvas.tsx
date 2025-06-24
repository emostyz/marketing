'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Grid3X3, Target, Crosshair } from 'lucide-react'

interface EnhancedCanvasProps {
  children: React.ReactNode
  zoom: number
  showGrid: boolean
  selectedTool: string
  onCanvasClick: (e: React.MouseEvent) => void
  className?: string
}

export function EnhancedCanvas({
  children,
  zoom,
  showGrid,
  selectedTool,
  onCanvasClick,
  className = ''
}: EnhancedCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [showCrosshair, setShowCrosshair] = useState(false)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
  }, [])

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true)
    if (selectedTool !== 'select') {
      setShowCrosshair(true)
    }
  }, [selectedTool])

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false)
    setShowCrosshair(false)
  }, [])

  const handleClick = useCallback((e: React.MouseEvent) => {
    onCanvasClick(e)
  }, [onCanvasClick])

  // Update crosshair visibility when tool changes
  useEffect(() => {
    if (selectedTool === 'select') {
      setShowCrosshair(false)
    } else if (isHovering) {
      setShowCrosshair(true)
    }
  }, [selectedTool, isHovering])

  const gridSize = 20 * (zoom / 100)

  return (
    <div
      ref={canvasRef}
      className={`relative overflow-hidden bg-gray-100 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        cursor: selectedTool === 'select' ? 'default' : 'crosshair'
      }}
    >
      {/* Grid overlay */}
      <AnimatePresence>
        {showGrid && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(156, 163, 175, 0.3) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(156, 163, 175, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: `${gridSize}px ${gridSize}px`
            }}
          />
        )}
      </AnimatePresence>

      {/* Canvas content */}
      <div className="relative">
        {children}
      </div>

      {/* Crosshair cursor for drawing tools */}
      <AnimatePresence>
        {showCrosshair && selectedTool !== 'select' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute pointer-events-none z-50"
            style={{
              left: mousePosition.x - 10,
              top: mousePosition.y - 10
            }}
          >
            <div className="relative w-5 h-5">
              {/* Crosshair lines */}
              <div className="absolute left-1/2 top-0 w-px h-full bg-blue-500 transform -translate-x-1/2" />
              <div className="absolute top-1/2 left-0 h-px w-full bg-blue-500 transform -translate-y-1/2" />
              
              {/* Center dot */}
              <div className="absolute left-1/2 top-1/2 w-1 h-1 bg-blue-600 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
              
              {/* Tool indicator */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute left-1/2 top-1/2 w-6 h-6 border border-blue-400 border-dashed rounded-full transform -translate-x-1/2 -translate-y-1/2"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drawing tool preview */}
      <AnimatePresence>
        {selectedTool !== 'select' && isHovering && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2 pointer-events-none z-40"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-sm font-medium text-gray-700 capitalize">
                {selectedTool === 'rectangle' ? 'Rectangle' :
                 selectedTool === 'circle' ? 'Circle' :
                 selectedTool === 'triangle' ? 'Triangle' :
                 selectedTool === 'text' ? 'Text Box' :
                 selectedTool === 'image' ? 'Image' :
                 selectedTool === 'chart' ? 'Chart' :
                 selectedTool === 'table' ? 'Table' :
                 selectedTool === 'video' ? 'Video' :
                 selectedTool === 'audio' ? 'Audio' :
                 'Element'} Mode
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Click anywhere to add
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas ruler guides (when zoomed in) */}
      <AnimatePresence>
        {zoom > 100 && (
          <>
            {/* Top ruler */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-0 left-0 right-0 h-6 bg-white border-b border-gray-200 pointer-events-none z-30"
            >
              <div className="relative h-full">
                {Array.from({ length: Math.ceil((canvasRef.current?.clientWidth || 0) / gridSize) }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 h-full flex items-end"
                    style={{ left: i * gridSize }}
                  >
                    <div className="w-px h-2 bg-gray-400" />
                    {i % 5 === 0 && (
                      <span className="absolute bottom-0 left-1 text-xs text-gray-500">
                        {i * (gridSize / (zoom / 100))}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Left ruler */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-0 left-0 bottom-0 w-6 bg-white border-r border-gray-200 pointer-events-none z-30"
            >
              <div className="relative w-full h-full">
                {Array.from({ length: Math.ceil((canvasRef.current?.clientHeight || 0) / gridSize) }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute left-0 w-full flex items-center justify-end"
                    style={{ top: i * gridSize }}
                  >
                    <div className="h-px w-2 bg-gray-400" />
                    {i % 5 === 0 && (
                      <span 
                        className="absolute right-0 top-1 text-xs text-gray-500 transform -rotate-90 origin-right"
                        style={{ transformOrigin: 'right center' }}
                      >
                        {i * (gridSize / (zoom / 100))}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Empty state for new slides */}
      {React.Children.count(children) === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="text-center max-w-md">
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center"
            >
              <Plus className="w-12 h-12 text-blue-600" />
            </motion.div>
            
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Start Creating Your Slide
            </h3>
            
            <p className="text-gray-500 mb-6">
              Select a tool from the toolbar and click on the canvas to add elements
            </p>
            
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-blue-500" />
                <span>Use tools to add content</span>
              </div>
              <div className="flex items-center space-x-2">
                <Grid3X3 className="w-4 h-4 text-green-500" />
                <span>Toggle grid for alignment</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Canvas boundaries indicator */}
      <div className="absolute inset-0 border border-gray-300 pointer-events-none" />
    </div>
  )
}