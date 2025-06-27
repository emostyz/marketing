'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Type, Image as ImageIcon, BarChart3, Circle, Square, Triangle, 
  Palette, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline,
  Plus, Minus, RotateCw, Eye, EyeOff, Lock, Unlock, Trash2, Copy,
  Settings, ChevronDown, ChevronRight, Upload, Move
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface SlideElement {
  id: string
  type: 'text' | 'image' | 'chart' | 'shape'
  position: { x: number; y: number }
  size: { width: number; height: number }
  rotation: number
  content?: string
  style?: {
    fontSize?: number
    fontFamily?: string
    fontWeight?: string
    color?: string
    backgroundColor?: string
    borderColor?: string
    borderWidth?: number
    borderRadius?: number
    textAlign?: 'left' | 'center' | 'right'
    opacity?: number
  }
  chartData?: any
  chartType?: string
  isLocked?: boolean
  isVisible?: boolean
}

interface PropertiesPanelProps {
  selectedElement: SlideElement | null
  onElementUpdate: (elementId: string, updates: Partial<SlideElement>) => void
  onAddElement: (type: SlideElement['type']) => void
  onDeleteElement: (elementId: string) => void
  onDuplicateElement: (elementId: string) => void
  isVisible: boolean
  onToggleVisibility: () => void
  locked?: boolean // PREVENT CLOSING ON CLICK
}

const fontFamilies = [
  'Inter', 'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana',
  'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Playfair Display'
]

const colorPresets = [
  '#000000', '#FFFFFF', '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280', '#F3F4F6'
]

const chartTypes = [
  { value: 'line', label: 'Line Chart' },
  { value: 'bar', label: 'Bar Chart' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'area', label: 'Area Chart' },
  { value: 'scatter', label: 'Scatter Plot' },
  { value: 'combo', label: 'Combo Chart' }
]

export default function PropertiesPanel({
  selectedElement,
  onElementUpdate,
  onAddElement,
  onDeleteElement,
  onDuplicateElement,
  isVisible,
  onToggleVisibility,
  locked = false
}: PropertiesPanelProps) {
  const [activeSection, setActiveSection] = useState('style')
  const [customColor, setCustomColor] = useState('#000000')

  const handleStyleUpdate = (property: string, value: any) => {
    if (!selectedElement) return
    
    onElementUpdate(selectedElement.id, {
      style: {
        ...selectedElement.style,
        [property]: value
      }
    })
  }

  const handlePositionUpdate = (property: 'x' | 'y', value: number) => {
    if (!selectedElement) return
    
    onElementUpdate(selectedElement.id, {
      position: {
        ...selectedElement.position,
        [property]: value
      }
    })
  }

  const handleSizeUpdate = (property: 'width' | 'height', value: number) => {
    if (!selectedElement) return
    
    onElementUpdate(selectedElement.id, {
      size: {
        ...selectedElement.size,
        [property]: value
      }
    })
  }

  const renderColorPicker = (currentColor: string, onChange: (color: string) => void) => (
    <div className="space-y-3">
      <div className="grid grid-cols-6 gap-2">
        {colorPresets.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={cn(
              "w-8 h-8 rounded border-2 transition-all",
              currentColor === color ? "border-blue-500 scale-110" : "border-gray-300 hover:scale-105"
            )}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={customColor}
          onChange={(e) => {
            setCustomColor(e.target.value)
            onChange(e.target.value)
          }}
          className="w-8 h-8 rounded border border-gray-300"
        />
        <Input
          value={customColor}
          onChange={(e) => {
            setCustomColor(e.target.value)
            onChange(e.target.value)
          }}
          placeholder="#000000"
          className="flex-1 text-xs"
        />
      </div>
    </div>
  )

  const renderAddElementSection = () => (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-300">Add Elements</h3>
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => onAddElement('text')}
          variant="outline"
          size="sm"
          className="flex flex-col items-center gap-1 h-auto py-3 text-white border-gray-600 hover:bg-gray-700"
        >
          <Type className="w-4 h-4" />
          <span className="text-xs">Text</span>
        </Button>
        <Button
          onClick={() => onAddElement('image')}
          variant="outline"
          size="sm"
          className="flex flex-col items-center gap-1 h-auto py-3 text-white border-gray-600 hover:bg-gray-700"
        >
          <ImageIcon className="w-4 h-4" />
          <span className="text-xs">Image</span>
        </Button>
        <Button
          onClick={() => onAddElement('chart')}
          variant="outline"
          size="sm"
          className="flex flex-col items-center gap-1 h-auto py-3 text-white border-gray-600 hover:bg-gray-700"
        >
          <BarChart3 className="w-4 h-4" />
          <span className="text-xs">Chart</span>
        </Button>
        <Button
          onClick={() => onAddElement('shape')}
          variant="outline"
          size="sm"
          className="flex flex-col items-center gap-1 h-auto py-3 text-white border-gray-600 hover:bg-gray-700"
        >
          <Circle className="w-4 h-4" />
          <span className="text-xs">Shape</span>
        </Button>
      </div>
    </div>
  )

  const renderStyleSection = () => {
    if (!selectedElement) return null

    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-300">Style Properties</h3>
        
        {/* Text Properties */}
        {selectedElement.type === 'text' && (
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-gray-400">Font Family</Label>
              <Select
                value={selectedElement.style?.fontFamily || 'Inter'}
                onValueChange={(value) => handleStyleUpdate('fontFamily', value)}
              >
                <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {fontFamilies.map((font) => (
                    <SelectItem key={font} value={font} className="text-white hover:bg-gray-700">
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-gray-400">Font Size</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[selectedElement.style?.fontSize || 16]}
                  onValueChange={([value]) => handleStyleUpdate('fontSize', value)}
                  min={8}
                  max={72}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-gray-400 w-8">{selectedElement.style?.fontSize || 16}px</span>
              </div>
            </div>

            <div>
              <Label className="text-xs text-gray-400">Font Weight</Label>
              <Select
                value={selectedElement.style?.fontWeight || 'normal'}
                onValueChange={(value) => handleStyleUpdate('fontWeight', value)}
              >
                <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="normal" className="text-white hover:bg-gray-700">Normal</SelectItem>
                  <SelectItem value="bold" className="text-white hover:bg-gray-700">Bold</SelectItem>
                  <SelectItem value="lighter" className="text-white hover:bg-gray-700">Light</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-gray-400">Text Color</Label>
              {renderColorPicker(
                selectedElement.style?.color || '#000000',
                (color) => handleStyleUpdate('color', color)
              )}
            </div>

            <div>
              <Label className="text-xs text-gray-400">Text Alignment</Label>
              <div className="flex gap-1">
                {['left', 'center', 'right'].map((align) => (
                  <Button
                    key={align}
                    variant={selectedElement.style?.textAlign === align ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStyleUpdate('textAlign', align)}
                    className="flex-1"
                  >
                    {align === 'left' && <AlignLeft className="w-4 h-4" />}
                    {align === 'center' && <AlignCenter className="w-4 h-4" />}
                    {align === 'right' && <AlignRight className="w-4 h-4" />}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chart Properties */}
        {selectedElement.type === 'chart' && (
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-gray-400">Chart Type</Label>
              <Select
                value={selectedElement.chartType || 'bar'}
                onValueChange={(value) => onElementUpdate(selectedElement.id, { chartType: value })}
              >
                <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {chartTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="text-white hover:bg-gray-700">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Background and Border */}
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-gray-400">Background Color</Label>
            {renderColorPicker(
              selectedElement.style?.backgroundColor || '#ffffff',
              (color) => handleStyleUpdate('backgroundColor', color)
            )}
          </div>

          <div>
            <Label className="text-xs text-gray-400">Border Color</Label>
            {renderColorPicker(
              selectedElement.style?.borderColor || '#000000',
              (color) => handleStyleUpdate('borderColor', color)
            )}
          </div>

          <div>
            <Label className="text-xs text-gray-400">Border Width</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[selectedElement.style?.borderWidth || 0]}
                onValueChange={([value]) => handleStyleUpdate('borderWidth', value)}
                min={0}
                max={10}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-gray-400 w-8">{selectedElement.style?.borderWidth || 0}px</span>
            </div>
          </div>

          <div>
            <Label className="text-xs text-gray-400">Border Radius</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[selectedElement.style?.borderRadius || 0]}
                onValueChange={([value]) => handleStyleUpdate('borderRadius', value)}
                min={0}
                max={50}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-gray-400 w-8">{selectedElement.style?.borderRadius || 0}px</span>
            </div>
          </div>

          <div>
            <Label className="text-xs text-gray-400">Opacity</Label>
            <div className="flex items-center gap-2">
              <Slider
                value={[selectedElement.style?.opacity || 1]}
                onValueChange={([value]) => handleStyleUpdate('opacity', value)}
                min={0}
                max={1}
                step={0.1}
                className="flex-1"
              />
              <span className="text-xs text-gray-400 w-8">{Math.round((selectedElement.style?.opacity || 1) * 100)}%</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderPositionSection = () => {
    if (!selectedElement) return null

    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-300">Position & Size</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-gray-400">X Position</Label>
            <Input
              type="number"
              value={selectedElement.position.x}
              onChange={(e) => handlePositionUpdate('x', parseInt(e.target.value) || 0)}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-400">Y Position</Label>
            <Input
              type="number"
              value={selectedElement.position.y}
              onChange={(e) => handlePositionUpdate('y', parseInt(e.target.value) || 0)}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-400">Width</Label>
            <Input
              type="number"
              value={selectedElement.size.width}
              onChange={(e) => handleSizeUpdate('width', parseInt(e.target.value) || 0)}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-400">Height</Label>
            <Input
              type="number"
              value={selectedElement.size.height}
              onChange={(e) => handleSizeUpdate('height', parseInt(e.target.value) || 0)}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs text-gray-400">Rotation</Label>
          <div className="flex items-center gap-2">
            <Slider
              value={[selectedElement.rotation]}
              onValueChange={([value]) => onElementUpdate(selectedElement.id, { rotation: value })}
              min={0}
              max={360}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-gray-400 w-12">{selectedElement.rotation}°</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onElementUpdate(selectedElement.id, { isLocked: !selectedElement.isLocked })}
            className="flex-1 text-white border-gray-600 hover:bg-gray-700"
          >
            {selectedElement.isLocked ? <Unlock className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
            {selectedElement.isLocked ? 'Unlock' : 'Lock'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onElementUpdate(selectedElement.id, { isVisible: !selectedElement.isVisible })}
            className="flex-1 text-white border-gray-600 hover:bg-gray-700"
          >
            {selectedElement.isVisible !== false ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
            {selectedElement.isVisible !== false ? 'Hide' : 'Show'}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDuplicateElement(selectedElement.id)}
            className="flex-1 text-white border-gray-600 hover:bg-gray-700"
          >
            <Copy className="w-4 h-4 mr-2" />
            Duplicate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDeleteElement(selectedElement.id)}
            className="flex-1 text-red-400 border-red-600 hover:bg-red-900"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    )
  }

  if (!isVisible && !locked) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="properties-panel"
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 320, opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
        className="bg-gray-900/80 border-l border-gray-800 overflow-hidden backdrop-blur-sm"
        onMouseDown={(e) => e.stopPropagation()} // PREVENT CLOSING
        onClick={(e) => e.stopPropagation()} // PREVENT CLOSING
      >
        <div className="h-full flex flex-col">
          {/* Header - FIXED: Prevent accidental closing */}
          <div className="p-4 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-gray-900/90 backdrop-blur-sm z-10">
            <h2 className="text-sm font-medium text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-blue-400" />
              Properties Panel
            </h2>
            {!locked && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleVisibility()
                }}
                className="text-gray-400 hover:bg-gray-700 hover:text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Add Elements Section */}
            {renderAddElementSection()}

            <Separator className="bg-gray-700" />

            {/* Element Properties - ENHANCED UI */}
            {selectedElement ? (
              <div className="space-y-4">
                {/* Element Info Badge */}
                <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-blue-400 capitalize">
                      {selectedElement.type} Element
                    </div>
                    <div className="text-xs text-gray-400">
                      ID: {selectedElement.id.slice(-8)}
                    </div>
                  </div>
                </div>

                {/* Section Tabs */}
                <div className="flex gap-1 bg-gray-800/50 p-1 rounded-lg border border-gray-700">
                  <Button
                    variant={activeSection === 'style' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveSection('style')
                    }}
                    className={cn(
                      "flex-1 text-xs transition-all",
                      activeSection === 'style'
                        ? "bg-blue-600 text-white shadow-lg"
                        : "text-gray-300 hover:text-white hover:bg-gray-700"
                    )}
                  >
                    <Palette className="w-3 h-3 mr-1" />
                    Style
                  </Button>
                  <Button
                    variant={activeSection === 'position' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveSection('position')
                    }}
                    className={cn(
                      "flex-1 text-xs transition-all",
                      activeSection === 'position'
                        ? "bg-blue-600 text-white shadow-lg"
                        : "text-gray-300 hover:text-white hover:bg-gray-700"
                    )}
                  >
                    <Move className="w-3 h-3 mr-1" />
                    Position
                  </Button>
                </div>

                {/* Section Content */}
                {activeSection === 'style' && renderStyleSection()}
                {activeSection === 'position' && renderPositionSection()}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400">Select an element to edit properties</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}