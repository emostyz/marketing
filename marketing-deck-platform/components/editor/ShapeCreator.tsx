'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Circle, Square, Triangle, Star, Heart, Diamond, Hexagon, 
  Play, Pause, SkipForward, SkipBack, ArrowRight, ArrowLeft,
  ArrowUp, ArrowDown, Plus, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

interface ShapeCreatorProps {
  isOpen: boolean
  onClose: () => void
  onShapeCreate: (shape: ShapeConfig) => void
}

interface ShapeConfig {
  type: string
  style: {
    fill: string
    stroke: string
    strokeWidth: number
    opacity: number
    borderRadius?: number
  }
  size: { width: number; height: number }
}

const basicShapes = [
  { id: 'rectangle', name: 'Rectangle', icon: Square, path: null, hasRadius: true },
  { id: 'circle', name: 'Circle', icon: Circle, path: null },
  { id: 'triangle', name: 'Triangle', icon: Triangle, path: 'M50,15 L85,85 L15,85 Z' },
  { id: 'diamond', name: 'Diamond', icon: Diamond, path: 'M50,15 L85,50 L50,85 L15,50 Z' },
  { id: 'hexagon', name: 'Hexagon', icon: Hexagon, path: 'M30,15 L70,15 L85,50 L70,85 L30,85 L15,50 Z' },
  { id: 'star', name: 'Star', icon: Star, path: 'M50,5 L61,35 L95,35 L68,57 L79,91 L50,70 L21,91 L32,57 L5,35 L39,35 Z' },
  { id: 'heart', name: 'Heart', icon: Heart, path: 'M50,85 C20,60 5,40 5,25 C5,15 15,5 25,5 C35,5 45,15 50,25 C55,15 65,5 75,5 C85,5 95,15 95,25 C95,40 80,60 50,85 Z' }
]

const arrowShapes = [
  { id: 'arrow-right', name: 'Right Arrow', icon: ArrowRight, path: 'M15,35 L65,35 L65,25 L85,50 L65,75 L65,65 L15,65 Z' },
  { id: 'arrow-left', name: 'Left Arrow', icon: ArrowLeft, path: 'M85,35 L35,35 L35,25 L15,50 L35,75 L35,65 L85,65 Z' },
  { id: 'arrow-up', name: 'Up Arrow', icon: ArrowUp, path: 'M35,85 L35,35 L25,35 L50,15 L75,35 L65,35 L65,85 Z' },
  { id: 'arrow-down', name: 'Down Arrow', icon: ArrowDown, path: 'M35,15 L35,65 L25,65 L50,85 L75,65 L65,65 L65,15 Z' }
]

const colorPresets = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  '#14B8A6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'
]

export default function ShapeCreator({ isOpen, onClose, onShapeCreate }: ShapeCreatorProps) {
  const [selectedCategory, setSelectedCategory] = useState<'basic' | 'arrows'>('basic')
  const [selectedShape, setSelectedShape] = useState(basicShapes[0])
  const [style, setStyle] = useState({
    fill: '#3B82F6',
    stroke: '#1E40AF',
    strokeWidth: 2,
    opacity: 1,
    borderRadius: 0
  })
  const [size, setSize] = useState({ width: 100, height: 100 })

  const currentShapes = selectedCategory === 'basic' ? basicShapes : arrowShapes

  const updateStyle = (property: string, value: any) => {
    setStyle(prev => ({ ...prev, [property]: value }))
  }

  const renderShape = (shape: any, isPreview = false) => {
    const svgSize = isPreview ? 200 : 60
    const strokeWidth = isPreview ? style.strokeWidth : 2
    
    if (shape.id === 'rectangle') {
      return (
        <rect
          x={strokeWidth / 2}
          y={strokeWidth / 2}
          width={svgSize - strokeWidth}
          height={svgSize - strokeWidth}
          fill={isPreview ? style.fill : '#3B82F6'}
          stroke={isPreview ? style.stroke : '#1E40AF'}
          strokeWidth={strokeWidth}
          opacity={isPreview ? style.opacity : 1}
          rx={isPreview ? style.borderRadius : 0}
          ry={isPreview ? style.borderRadius : 0}
        />
      )
    }
    
    if (shape.id === 'circle') {
      return (
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={(svgSize - strokeWidth) / 2}
          fill={isPreview ? style.fill : '#3B82F6'}
          stroke={isPreview ? style.stroke : '#1E40AF'}
          strokeWidth={strokeWidth}
          opacity={isPreview ? style.opacity : 1}
        />
      )
    }
    
    if (shape.path) {
      // Scale path to fit the SVG size
      const scaleFactor = svgSize / 100
      const scaledPath = shape.path.replace(/(\d+)/g, (match: string) => 
        String(Math.round(parseFloat(match) * scaleFactor))
      )
      
      return (
        <path
          d={scaledPath}
          fill={isPreview ? style.fill : '#3B82F6'}
          stroke={isPreview ? style.stroke : '#1E40AF'}
          strokeWidth={strokeWidth}
          opacity={isPreview ? style.opacity : 1}
        />
      )
    }
    
    return null
  }

  const handleCreateShape = () => {
    const shapeConfig: ShapeConfig = {
      type: selectedShape.id,
      style: {
        ...style,
        ...(selectedShape.hasRadius ? {} : { borderRadius: undefined })
      },
      size
    }
    onShapeCreate(shapeConfig)
    onClose()
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="flex h-full">
          {/* Left Panel - Shape Selection */}
          <div className="w-80 border-r border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Shape Creator</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-400 hover:bg-gray-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Category Tabs */}
              <div className="flex gap-1 bg-gray-800 p-1 rounded mt-3">
                <Button
                  variant={selectedCategory === 'basic' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedCategory('basic')}
                  className="flex-1 text-xs"
                >
                  Basic
                </Button>
                <Button
                  variant={selectedCategory === 'arrows' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedCategory('arrows')}
                  className="flex-1 text-xs"
                >
                  Arrows
                </Button>
              </div>
            </div>

            {/* Shape Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-3">
                {currentShapes.map((shape) => (
                  <Card
                    key={shape.id}
                    className={cn(
                      "p-3 cursor-pointer transition-all hover:bg-gray-750",
                      selectedShape.id === shape.id 
                        ? "bg-blue-600/20 border-blue-500" 
                        : "bg-gray-800 border-gray-700"
                    )}
                    onClick={() => setSelectedShape(shape)}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <svg width="60" height="60" viewBox="0 0 60 60">
                        {renderShape(shape)}
                      </svg>
                      <span className="text-xs text-gray-300 text-center">{shape.name}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Style Controls */}
            <div className="p-4 border-t border-gray-700 space-y-4">
              <h3 className="text-sm font-medium text-gray-300">Style Properties</h3>
              
              {/* Fill Color */}
              <div>
                <Label className="text-xs text-gray-400">Fill Color</Label>
                <div className="grid grid-cols-5 gap-2 mt-1">
                  {colorPresets.map((color) => (
                    <button
                      key={color}
                      onClick={() => updateStyle('fill', color)}
                      className={cn(
                        "w-8 h-8 rounded border-2 transition-all",
                        style.fill === color ? "border-white scale-110" : "border-gray-500 hover:scale-105"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Stroke Color */}
              <div>
                <Label className="text-xs text-gray-400">Stroke Color</Label>
                <div className="grid grid-cols-5 gap-2 mt-1">
                  {colorPresets.map((color) => (
                    <button
                      key={color}
                      onClick={() => updateStyle('stroke', color)}
                      className={cn(
                        "w-8 h-8 rounded border-2 transition-all",
                        style.stroke === color ? "border-white scale-110" : "border-gray-500 hover:scale-105"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Stroke Width */}
              <div>
                <Label className="text-xs text-gray-400">Stroke Width</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Slider
                    value={[style.strokeWidth]}
                    onValueChange={([value]) => updateStyle('strokeWidth', value)}
                    min={0}
                    max={10}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-xs text-gray-400 w-8">{style.strokeWidth}px</span>
                </div>
              </div>

              {/* Border Radius (for rectangles) */}
              {selectedShape.hasRadius && (
                <div>
                  <Label className="text-xs text-gray-400">Border Radius</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Slider
                      value={[style.borderRadius || 0]}
                      onValueChange={([value]) => updateStyle('borderRadius', value)}
                      min={0}
                      max={50}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-400 w-8">{style.borderRadius || 0}px</span>
                  </div>
                </div>
              )}

              {/* Opacity */}
              <div>
                <Label className="text-xs text-gray-400">Opacity</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Slider
                    value={[style.opacity]}
                    onValueChange={([value]) => updateStyle('opacity', value)}
                    min={0}
                    max={1}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="text-xs text-gray-400 w-8">{Math.round(style.opacity * 100)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-sm font-medium text-gray-300">Preview</h3>
            </div>

            <div className="flex-1 p-8 bg-white flex items-center justify-center">
              <div className="relative">
                <svg 
                  width="200" 
                  height="200" 
                  viewBox="0 0 200 200"
                  className="drop-shadow-lg"
                >
                  {renderShape(selectedShape, true)}
                </svg>
                
                {/* Size indicators */}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
                  {size.width} × {size.height}
                </div>
              </div>
            </div>

            {/* Size Controls */}
            <div className="p-4 border-t border-gray-700 space-y-3">
              <h3 className="text-sm font-medium text-gray-300">Size</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-400">Width</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Slider
                      value={[size.width]}
                      onValueChange={([value]) => setSize(prev => ({ ...prev, width: value }))}
                      min={20}
                      max={400}
                      step={10}
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-400 w-12">{size.width}px</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs text-gray-400">Height</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Slider
                      value={[size.height]}
                      onValueChange={([value]) => setSize(prev => ({ ...prev, height: value }))}
                      min={20}
                      max={400}
                      step={10}
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-400 w-12">{size.height}px</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleCreateShape}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Shape
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="text-white border-gray-600 hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}