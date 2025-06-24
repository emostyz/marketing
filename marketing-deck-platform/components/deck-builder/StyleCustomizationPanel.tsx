'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Palette, Type, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Underline, Strikethrough, MoreHorizontal,
  Paintbrush, Droplets, Square, Circle, Triangle, Image,
  RotateCcw, Copy, Trash2, Lock, Unlock, Eye, EyeOff,
  ChevronDown, ChevronRight, Zap, Layers, Move3D
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SlideElement {
  id: string
  type: 'text' | 'image' | 'chart' | 'table' | 'video' | 'audio' | 'shape' | 'icon'
  position: { x: number; y: number; width: number; height: number; rotation: number }
  style: any
  content: any
  layer: number
  locked: boolean
  hidden: boolean
  animations: any[]
}

interface StyleCustomizationPanelProps {
  selectedElements: SlideElement[]
  onUpdateElement: (elementId: string, updates: Partial<SlideElement>) => void
  onDeleteElement: (elementId: string) => void
  onDuplicateElement: (elementId: string) => void
}

const FONT_FAMILIES = [
  { value: 'Inter', label: 'Inter (Modern)' },
  { value: 'Arial', label: 'Arial (Classic)' },
  { value: 'Helvetica', label: 'Helvetica (Clean)' },
  { value: 'Georgia', label: 'Georgia (Serif)' },
  { value: 'Times New Roman', label: 'Times (Traditional)' },
  { value: 'Roboto', label: 'Roboto (Tech)' },
  { value: 'Open Sans', label: 'Open Sans (Friendly)' },
  { value: 'Montserrat', label: 'Montserrat (Elegant)' },
  { value: 'Playfair Display', label: 'Playfair (Luxury)' },
  { value: 'Source Sans Pro', label: 'Source Sans (Professional)' }
]

const COLOR_PRESETS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
  '#1F2937', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB', '#F3F4F6', '#F9FAFB',
  '#7C3AED', '#A855F7', '#C084FC', '#DDD6FE', '#EDE9FE', '#F3E8FF', '#FAF5FF',
  '#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#FECACA', '#FEE2E2', '#FEF2F2',
  '#059669', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5', '#ECFDF5',
  '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE', '#EFF6FF', '#F0F9FF',
  '#EA580C', '#F97316', '#FB923C', '#FDBA74', '#FED7AA', '#FFEDD5', '#FFF7ED',
  '#7C2D12', '#92400E', '#A16207', '#CA8A04', '#EAB308', '#FACC15', '#FEF3C7'
]

const GRADIENT_PRESETS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
]

export function StyleCustomizationPanel({
  selectedElements,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement
}: StyleCustomizationPanelProps) {
  const [activeTab, setActiveTab] = useState<'style' | 'position' | 'effects'>('style')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['text', 'colors']))

  const selectedElement = selectedElements[0] // Work with first selected element
  const hasSelection = selectedElements.length > 0
  const isTextElement = selectedElement?.type === 'text'
  const isImageElement = selectedElement?.type === 'image'
  const isChartElement = selectedElement?.type === 'chart'
  const isShapeElement = selectedElement?.type === 'shape'

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const updateElementStyle = (styleUpdates: any) => {
    if (!selectedElement) return
    onUpdateElement(selectedElement.id, {
      style: { ...selectedElement.style, ...styleUpdates }
    })
  }

  const updateElementContent = (contentUpdates: any) => {
    if (!selectedElement) return
    onUpdateElement(selectedElement.id, {
      content: { ...selectedElement.content, ...contentUpdates }
    })
  }

  const updateElementPosition = (positionUpdates: any) => {
    if (!selectedElement) return
    onUpdateElement(selectedElement.id, {
      position: { ...selectedElement.position, ...positionUpdates }
    })
  }

  if (!hasSelection) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Design Panel</h3>
          <p className="text-sm text-gray-500 mt-1">Select an element to customize</p>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <Paintbrush className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 text-sm">Select elements on the canvas to access styling options</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Design Panel</h3>
            <p className="text-xs text-gray-500 mt-1">
              {selectedElements.length} element{selectedElements.length !== 1 ? 's' : ''} selected
            </p>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDuplicateElement(selectedElement.id)}
              className="h-8 w-8 p-0"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteElement(selectedElement.id)}
              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 m-4 mb-0">
          <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
          <TabsTrigger value="position" className="text-xs">Position</TabsTrigger>
          <TabsTrigger value="effects" className="text-xs">Effects</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="style" className="h-full p-0 m-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                
                {/* Text Styling */}
                {isTextElement && (
                  <Card>
                    <CardHeader 
                      className="p-3 cursor-pointer" 
                      onClick={() => toggleSection('text')}
                    >
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center space-x-2">
                          <Type className="w-4 h-4" />
                          <span>Typography</span>
                        </CardTitle>
                        {expandedSections.has('text') ? 
                          <ChevronDown className="w-4 h-4" /> : 
                          <ChevronRight className="w-4 h-4" />
                        }
                      </div>
                    </CardHeader>
                    <AnimatePresence>
                      {expandedSections.has('text') && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                        >
                          <CardContent className="p-3 pt-0 space-y-4">
                            {/* Font Family */}
                            <div>
                              <Label className="text-xs font-medium">Font Family</Label>
                              <Select 
                                value={selectedElement.style?.fontFamily || 'Inter'} 
                                onValueChange={(value) => updateElementStyle({ fontFamily: value })}
                              >
                                <SelectTrigger className="mt-1 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {FONT_FAMILIES.map((font) => (
                                    <SelectItem key={font.value} value={font.value}>
                                      <span style={{ fontFamily: font.value }}>{font.label}</span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Font Size */}
                            <div>
                              <Label className="text-xs font-medium">
                                Font Size: {selectedElement.style?.fontSize || 16}px
                              </Label>
                              <Slider
                                value={[selectedElement.style?.fontSize || 16]}
                                onValueChange={(value) => updateElementStyle({ fontSize: value[0] })}
                                min={8}
                                max={120}
                                step={1}
                                className="mt-2"
                              />
                            </div>

                            {/* Text Formatting */}
                            <div>
                              <Label className="text-xs font-medium">Formatting</Label>
                              <div className="flex space-x-1 mt-2">
                                <Button
                                  variant={selectedElement.style?.fontWeight === 'bold' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => updateElementStyle({ 
                                    fontWeight: selectedElement.style?.fontWeight === 'bold' ? 'normal' : 'bold' 
                                  })}
                                  className="h-8 w-8 p-0"
                                >
                                  <Bold className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant={selectedElement.style?.fontStyle === 'italic' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => updateElementStyle({ 
                                    fontStyle: selectedElement.style?.fontStyle === 'italic' ? 'normal' : 'italic' 
                                  })}
                                  className="h-8 w-8 p-0"
                                >
                                  <Italic className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant={selectedElement.style?.textDecoration === 'underline' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => updateElementStyle({ 
                                    textDecoration: selectedElement.style?.textDecoration === 'underline' ? 'none' : 'underline' 
                                  })}
                                  className="h-8 w-8 p-0"
                                >
                                  <Underline className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant={selectedElement.style?.textDecoration === 'line-through' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => updateElementStyle({ 
                                    textDecoration: selectedElement.style?.textDecoration === 'line-through' ? 'none' : 'line-through' 
                                  })}
                                  className="h-8 w-8 p-0"
                                >
                                  <Strikethrough className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Text Alignment */}
                            <div>
                              <Label className="text-xs font-medium">Alignment</Label>
                              <div className="flex space-x-1 mt-2">
                                {[
                                  { value: 'left', icon: AlignLeft },
                                  { value: 'center', icon: AlignCenter },
                                  { value: 'right', icon: AlignRight },
                                  { value: 'justify', icon: AlignJustify }
                                ].map(({ value, icon: Icon }) => (
                                  <Button
                                    key={value}
                                    variant={selectedElement.style?.textAlign === value ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => updateElementStyle({ textAlign: value })}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Icon className="w-4 h-4" />
                                  </Button>
                                ))}
                              </div>
                            </div>

                            {/* Line Height */}
                            <div>
                              <Label className="text-xs font-medium">
                                Line Height: {selectedElement.style?.lineHeight || 1.4}
                              </Label>
                              <Slider
                                value={[selectedElement.style?.lineHeight || 1.4]}
                                onValueChange={(value) => updateElementStyle({ lineHeight: value[0] })}
                                min={0.8}
                                max={3}
                                step={0.1}
                                className="mt-2"
                              />
                            </div>
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                )}

                {/* Colors */}
                <Card>
                  <CardHeader 
                    className="p-3 cursor-pointer" 
                    onClick={() => toggleSection('colors')}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center space-x-2">
                        <Palette className="w-4 h-4" />
                        <span>Colors & Fill</span>
                      </CardTitle>
                      {expandedSections.has('colors') ? 
                        <ChevronDown className="w-4 h-4" /> : 
                        <ChevronRight className="w-4 h-4" />
                      }
                    </div>
                  </CardHeader>
                  <AnimatePresence>
                    {expandedSections.has('colors') && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <CardContent className="p-3 pt-0 space-y-4">
                          {/* Text Color */}
                          {isTextElement && (
                            <div>
                              <Label className="text-xs font-medium">Text Color</Label>
                              <div className="grid grid-cols-8 gap-2 mt-2">
                                {COLOR_PRESETS.map((color) => (
                                  <button
                                    key={color}
                                    className={`w-6 h-6 rounded border-2 ${
                                      selectedElement.style?.color === color 
                                        ? 'border-blue-500 ring-2 ring-blue-200' 
                                        : 'border-gray-200'
                                    }`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => updateElementStyle({ color })}
                                  />
                                ))}
                              </div>
                              <Input
                                type="color"
                                value={selectedElement.style?.color || '#000000'}
                                onChange={(e) => updateElementStyle({ color: e.target.value })}
                                className="mt-2 h-8"
                              />
                            </div>
                          )}

                          {/* Background Color */}
                          <div>
                            <Label className="text-xs font-medium">Background</Label>
                            <div className="grid grid-cols-8 gap-2 mt-2">
                              {COLOR_PRESETS.map((color) => (
                                <button
                                  key={color}
                                  className={`w-6 h-6 rounded border-2 ${
                                    selectedElement.style?.backgroundColor === color 
                                      ? 'border-blue-500 ring-2 ring-blue-200' 
                                      : 'border-gray-200'
                                  }`}
                                  style={{ backgroundColor: color }}
                                  onClick={() => updateElementStyle({ backgroundColor: color })}
                                />
                              ))}
                            </div>
                            <Input
                              type="color"
                              value={selectedElement.style?.backgroundColor || '#FFFFFF'}
                              onChange={(e) => updateElementStyle({ backgroundColor: e.target.value })}
                              className="mt-2 h-8"
                            />
                          </div>

                          {/* Gradients */}
                          <div>
                            <Label className="text-xs font-medium">Gradient Backgrounds</Label>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              {GRADIENT_PRESETS.map((gradient, index) => (
                                <button
                                  key={index}
                                  className="w-full h-8 rounded border-2 border-gray-200 hover:border-blue-300"
                                  style={{ background: gradient }}
                                  onClick={() => updateElementStyle({ background: gradient })}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Border */}
                          <div>
                            <Label className="text-xs font-medium">Border</Label>
                            <div className="space-y-2 mt-2">
                              <div className="flex space-x-2">
                                <Input
                                  type="color"
                                  value={selectedElement.style?.borderColor || '#000000'}
                                  onChange={(e) => updateElementStyle({ borderColor: e.target.value })}
                                  className="h-8 w-16"
                                />
                                <Input
                                  type="number"
                                  value={selectedElement.style?.borderWidth || 0}
                                  onChange={(e) => updateElementStyle({ borderWidth: parseInt(e.target.value) })}
                                  placeholder="Width"
                                  className="h-8 flex-1"
                                  min="0"
                                  max="20"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Border Radius</Label>
                                <Slider
                                  value={[selectedElement.style?.borderRadius || 0]}
                                  onValueChange={(value) => updateElementStyle({ borderRadius: value[0] })}
                                  min={0}
                                  max={50}
                                  step={1}
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>

              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="position" className="h-full p-0 m-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                
                {/* Position & Size */}
                <Card>
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <Move3D className="w-4 h-4" />
                      <span>Position & Size</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">X Position</Label>
                        <Input
                          type="number"
                          value={Math.round(selectedElement.position?.x || 0)}
                          onChange={(e) => updateElementPosition({ x: parseInt(e.target.value) || 0 })}
                          className="h-8 mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Y Position</Label>
                        <Input
                          type="number"
                          value={Math.round(selectedElement.position?.y || 0)}
                          onChange={(e) => updateElementPosition({ y: parseInt(e.target.value) || 0 })}
                          className="h-8 mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Width</Label>
                        <Input
                          type="number"
                          value={Math.round(selectedElement.position?.width || 0)}
                          onChange={(e) => updateElementPosition({ width: parseInt(e.target.value) || 0 })}
                          className="h-8 mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Height</Label>
                        <Input
                          type="number"
                          value={Math.round(selectedElement.position?.height || 0)}
                          onChange={(e) => updateElementPosition({ height: parseInt(e.target.value) || 0 })}
                          className="h-8 mt-1"
                        />
                      </div>
                    </div>

                    {/* Rotation */}
                    <div>
                      <Label className="text-xs">
                        Rotation: {Math.round(selectedElement.position?.rotation || 0)}°
                      </Label>
                      <Slider
                        value={[selectedElement.position?.rotation || 0]}
                        onValueChange={(value) => updateElementPosition({ rotation: value[0] })}
                        min={-180}
                        max={180}
                        step={1}
                        className="mt-2"
                      />
                    </div>

                    {/* Layer */}
                    <div>
                      <Label className="text-xs">Layer</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateElement(selectedElement.id, { layer: (selectedElement.layer || 0) + 1 })}
                          className="h-8"
                        >
                          <Layers className="w-4 h-4 mr-1" />
                          Bring Forward
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateElement(selectedElement.id, { layer: Math.max(0, (selectedElement.layer || 0) - 1) })}
                          className="h-8"
                        >
                          Send Back
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="effects" className="h-full p-0 m-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                
                {/* Shadow & Effects */}
                <Card>
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <Zap className="w-4 h-4" />
                      <span>Shadow & Effects</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-4">
                    
                    {/* Opacity */}
                    <div>
                      <Label className="text-xs">
                        Opacity: {Math.round((selectedElement.style?.opacity || 1) * 100)}%
                      </Label>
                      <Slider
                        value={[(selectedElement.style?.opacity || 1) * 100]}
                        onValueChange={(value) => updateElementStyle({ opacity: value[0] / 100 })}
                        min={0}
                        max={100}
                        step={1}
                        className="mt-2"
                      />
                    </div>

                    {/* Box Shadow */}
                    <div>
                      <Label className="text-xs">Drop Shadow</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {[
                          'none',
                          '0 1px 3px rgba(0,0,0,0.1)',
                          '0 4px 6px rgba(0,0,0,0.1)',
                          '0 10px 15px rgba(0,0,0,0.1)',
                          '0 20px 25px rgba(0,0,0,0.1)',
                          '0 25px 50px rgba(0,0,0,0.25)'
                        ].map((shadow, index) => (
                          <Button
                            key={index}
                            variant={selectedElement.style?.boxShadow === shadow ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateElementStyle({ boxShadow: shadow })}
                            className="h-8 text-xs"
                          >
                            {index === 0 ? 'None' : `Level ${index}`}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Transform */}
                    <div>
                      <Label className="text-xs">Scale</Label>
                      <Slider
                        value={[selectedElement.style?.transform?.scale || 1]}
                        onValueChange={(value) => updateElementStyle({ 
                          transform: { ...selectedElement.style?.transform, scale: value[0] }
                        })}
                        min={0.1}
                        max={3}
                        step={0.1}
                        className="mt-2"
                      />
                    </div>

                    {/* Visibility */}
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Visibility</Label>
                      <div className="flex space-x-1">
                        <Button
                          variant={selectedElement.hidden ? 'outline' : 'default'}
                          size="sm"
                          onClick={() => onUpdateElement(selectedElement.id, { hidden: !selectedElement.hidden })}
                          className="h-8 w-8 p-0"
                        >
                          {selectedElement.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant={selectedElement.locked ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => onUpdateElement(selectedElement.id, { locked: !selectedElement.locked })}
                          className="h-8 w-8 p-0"
                        >
                          {selectedElement.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                  </CardContent>
                </Card>

              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}