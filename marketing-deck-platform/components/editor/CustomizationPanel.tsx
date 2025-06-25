'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Type, Palette, Shapes, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Underline, MoreHorizontal, RotateCw, Move, Copy, Trash2,
  Lock, Unlock, Eye, EyeOff, Layers, Star, Heart, Zap, Download, Upload,
  ChevronDown, Search, FileImage, Sparkles, Wand2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { COLOR_PALETTES, FONT_FAMILIES, SHAPE_TEMPLATES } from '@/lib/design/design-system'

interface Element {
  id: string
  type: 'text' | 'shape' | 'image' | 'chart'
  content?: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  rotation: number
  style: any
  isLocked?: boolean
  isVisible?: boolean
  zIndex?: number
}

interface CustomizationPanelProps {
  selectedElements: Element[]
  onUpdateElement: (elementId: string, updates: Partial<Element>) => void
  onDeleteElement: (elementId: string) => void
  onDuplicateElement: (elementId: string) => void
  onToggleLock: (elementId: string) => void
  onToggleVisibility: (elementId: string) => void
}

const TEXT_ALIGNMENTS = [
  { id: 'left', icon: <AlignLeft className="w-4 h-4" /> },
  { id: 'center', icon: <AlignCenter className="w-4 h-4" /> },
  { id: 'right', icon: <AlignRight className="w-4 h-4" /> },
  { id: 'justify', icon: <AlignJustify className="w-4 h-4" /> }
]

const FONT_WEIGHTS = [
  { value: '100', label: 'Thin' },
  { value: '200', label: 'Extra Light' },
  { value: '300', label: 'Light' },
  { value: '400', label: 'Normal' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semi Bold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'Extra Bold' },
  { value: '900', label: 'Black' }
]

export default function CustomizationPanel({
  selectedElements,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onToggleLock,
  onToggleVisibility
}: CustomizationPanelProps) {
  const [activeTab, setActiveTab] = useState('style')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const selectedElement = selectedElements[0] // For now, work with single selection
  const hasSelection = selectedElements.length > 0
  const isMultiSelect = selectedElements.length > 1

  const updateElementStyle = useCallback((updates: any) => {
    if (!selectedElement) return
    onUpdateElement(selectedElement.id, {
      style: { ...selectedElement.style, ...updates }
    })
  }, [selectedElement, onUpdateElement])

  const updateElementProperty = useCallback((property: keyof Element, value: any) => {
    if (!selectedElement) return
    onUpdateElement(selectedElement.id, { [property]: value })
  }, [selectedElement, onUpdateElement])

  if (!hasSelection) {
    return (
      <div className="w-80 h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex items-center justify-center">
        <div className="text-center p-6">
          <Shapes className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Element Selected
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select an element to customize its properties
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isMultiSelect ? `${selectedElements.length} Elements` : selectedElement.type.charAt(0).toUpperCase() + selectedElement.type.slice(1)}
          </h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => selectedElement && onDuplicateElement(selectedElement.id)}
            disabled={!selectedElement}
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => selectedElement && onToggleLock(selectedElement.id)}
            disabled={!selectedElement}
          >
            {selectedElement?.isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => selectedElement && onToggleVisibility(selectedElement.id)}
            disabled={!selectedElement}
          >
            {selectedElement?.isVisible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => selectedElement && onDeleteElement(selectedElement.id)}
            disabled={!selectedElement}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-3 m-4 mb-0">
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="effects">Effects</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-4">
          <TabsContent value="style" className="space-y-4 mt-0">
            {/* Text-specific controls */}
            {selectedElement?.type === 'text' && (
              <>
                {/* Font Family */}
                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Select
                    value={selectedElement.style?.fontFamily || 'inter'}
                    onValueChange={(value) => {
                      const font = FONT_FAMILIES.find(f => f.id === value)
                      updateElementStyle({ fontFamily: font?.family })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_FAMILIES.map(font => (
                        <SelectItem key={font.id} value={font.id}>
                          <span style={{ fontFamily: font.family }}>{font.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Font Size */}
                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      value={[selectedElement.style?.fontSize || 16]}
                      onValueChange={([value]) => updateElementStyle({ fontSize: value })}
                      min={8}
                      max={120}
                      step={1}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={selectedElement.style?.fontSize || 16}
                      onChange={(e) => updateElementStyle({ fontSize: parseInt(e.target.value) })}
                      className="w-16"
                    />
                  </div>
                </div>

                {/* Font Weight */}
                <div className="space-y-2">
                  <Label>Font Weight</Label>
                  <Select
                    value={selectedElement.style?.fontWeight?.toString() || '400'}
                    onValueChange={(value) => updateElementStyle({ fontWeight: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_WEIGHTS.map(weight => (
                        <SelectItem key={weight.value} value={weight.value}>
                          {weight.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Text Style Toggles */}
                <div className="space-y-2">
                  <Label>Text Style</Label>
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant={selectedElement.style?.fontWeight === 'bold' || selectedElement.style?.fontWeight >= 700 ? 'default' : 'outline'}
                      onClick={() => updateElementStyle({ 
                        fontWeight: selectedElement.style?.fontWeight === 'bold' || selectedElement.style?.fontWeight >= 700 ? 'normal' : 'bold' 
                      })}
                    >
                      <Bold className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedElement.style?.fontStyle === 'italic' ? 'default' : 'outline'}
                      onClick={() => updateElementStyle({ 
                        fontStyle: selectedElement.style?.fontStyle === 'italic' ? 'normal' : 'italic' 
                      })}
                    >
                      <Italic className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedElement.style?.textDecoration === 'underline' ? 'default' : 'outline'}
                      onClick={() => updateElementStyle({ 
                        textDecoration: selectedElement.style?.textDecoration === 'underline' ? 'none' : 'underline' 
                      })}
                    >
                      <Underline className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Text Alignment */}
                <div className="space-y-2">
                  <Label>Text Alignment</Label>
                  <div className="flex items-center space-x-1">
                    {TEXT_ALIGNMENTS.map(alignment => (
                      <Button
                        key={alignment.id}
                        size="sm"
                        variant={selectedElement.style?.textAlign === alignment.id ? 'default' : 'outline'}
                        onClick={() => updateElementStyle({ textAlign: alignment.id })}
                      >
                        {alignment.icon}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Line Height */}
                <div className="space-y-2">
                  <Label>Line Height</Label>
                  <Slider
                    value={[selectedElement.style?.lineHeight || 1.4]}
                    onValueChange={([value]) => updateElementStyle({ lineHeight: value })}
                    min={1}
                    max={3}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-500">{selectedElement.style?.lineHeight || 1.4}</div>
                </div>

                {/* Letter Spacing */}
                <div className="space-y-2">
                  <Label>Letter Spacing</Label>
                  <Slider
                    value={[selectedElement.style?.letterSpacing || 0]}
                    onValueChange={([value]) => updateElementStyle({ letterSpacing: `${value}px` })}
                    min={-2}
                    max={10}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-500">{selectedElement.style?.letterSpacing || '0px'}</div>
                </div>
              </>
            )}

            {/* Color Controls */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>
                  {selectedElement?.type === 'text' ? 'Text Color' : 'Fill Color'}
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="color"
                    value={selectedElement?.style?.color || selectedElement?.style?.fill || '#000000'}
                    onChange={(e) => updateElementStyle({ 
                      [selectedElement?.type === 'text' ? 'color' : 'fill']: e.target.value 
                    })}
                    className="w-12 h-10"
                  />
                  <Input
                    value={selectedElement?.style?.color || selectedElement?.style?.fill || '#000000'}
                    onChange={(e) => updateElementStyle({ 
                      [selectedElement?.type === 'text' ? 'color' : 'fill']: e.target.value 
                    })}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Color Palettes */}
              <div className="space-y-2">
                <Label>Quick Colors</Label>
                <div className="grid grid-cols-6 gap-2">
                  {COLOR_PALETTES[0].colors.map((color, index) => (
                    <button
                      key={index}
                      className="w-8 h-8 rounded border-2 border-gray-200 hover:border-gray-400 transition-colors"
                      style={{ backgroundColor: color }}
                      onClick={() => updateElementStyle({ 
                        [selectedElement?.type === 'text' ? 'color' : 'fill']: color 
                      })}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Background Color (for text and shapes) */}
            {(selectedElement?.type === 'text' || selectedElement?.type === 'shape') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Background</Label>
                  <Switch
                    checked={!!selectedElement.style?.backgroundColor}
                    onCheckedChange={(checked) => updateElementStyle({ 
                      backgroundColor: checked ? '#ffffff' : undefined 
                    })}
                  />
                </div>
                {selectedElement.style?.backgroundColor && (
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      value={selectedElement.style.backgroundColor}
                      onChange={(e) => updateElementStyle({ backgroundColor: e.target.value })}
                      className="w-12 h-10"
                    />
                    <Input
                      value={selectedElement.style.backgroundColor}
                      onChange={(e) => updateElementStyle({ backgroundColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Border Controls */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Border</Label>
                <Switch
                  checked={!!selectedElement.style?.border || !!selectedElement.style?.stroke}
                  onCheckedChange={(checked) => updateElementStyle({ 
                    border: checked ? '1px solid #000000' : undefined,
                    stroke: checked ? '#000000' : undefined
                  })}
                />
              </div>
              
              {(selectedElement.style?.border || selectedElement.style?.stroke) && (
                <>
                  <div className="flex items-center space-x-2">
                    <Label className="w-16">Color</Label>
                    <Input
                      type="color"
                      value={selectedElement.style?.borderColor || selectedElement.style?.stroke || '#000000'}
                      onChange={(e) => updateElementStyle({ 
                        borderColor: e.target.value,
                        stroke: e.target.value
                      })}
                      className="w-12 h-8"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Width</Label>
                    <Slider
                      value={[selectedElement.style?.borderWidth || selectedElement.style?.strokeWidth || 1]}
                      onValueChange={([value]) => updateElementStyle({ 
                        borderWidth: `${value}px`,
                        strokeWidth: value
                      })}
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Border Radius (for rectangular elements) */}
            {(selectedElement?.type === 'text' || selectedElement?.type === 'shape') && (
              <div className="space-y-2">
                <Label>Border Radius</Label>
                <Slider
                  value={[selectedElement.style?.borderRadius || 0]}
                  onValueChange={([value]) => updateElementStyle({ borderRadius: `${value}px` })}
                  min={0}
                  max={50}
                  step={1}
                  className="w-full"
                />
                <div className="text-sm text-gray-500">{selectedElement.style?.borderRadius || '0px'}</div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="layout" className="space-y-4 mt-0">
            {/* Position */}
            <div className="space-y-3">
              <Label>Position</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-sm">X</Label>
                  <Input
                    type="number"
                    value={selectedElement?.position.x || 0}
                    onChange={(e) => updateElementProperty('position', {
                      ...selectedElement.position,
                      x: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
                <div>
                  <Label className="text-sm">Y</Label>
                  <Input
                    type="number"
                    value={selectedElement?.position.y || 0}
                    onChange={(e) => updateElementProperty('position', {
                      ...selectedElement.position,
                      y: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Size */}
            <div className="space-y-3">
              <Label>Size</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-sm">Width</Label>
                  <Input
                    type="number"
                    value={selectedElement?.size.width || 0}
                    onChange={(e) => updateElementProperty('size', {
                      ...selectedElement.size,
                      width: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
                <div>
                  <Label className="text-sm">Height</Label>
                  <Input
                    type="number"
                    value={selectedElement?.size.height || 0}
                    onChange={(e) => updateElementProperty('size', {
                      ...selectedElement.size,
                      height: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Rotation */}
            <div className="space-y-2">
              <Label>Rotation</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  value={[selectedElement?.rotation || 0]}
                  onValueChange={([value]) => updateElementProperty('rotation', value)}
                  min={-180}
                  max={180}
                  step={1}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={selectedElement?.rotation || 0}
                  onChange={(e) => updateElementProperty('rotation', parseInt(e.target.value) || 0)}
                  className="w-16"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateElementProperty('rotation', 0)}
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Z-Index */}
            <div className="space-y-2">
              <Label>Layer Order</Label>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateElementProperty('zIndex', (selectedElement?.zIndex || 0) + 1)}
                >
                  <Layers className="w-4 h-4 mr-1" />
                  Forward
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateElementProperty('zIndex', Math.max(0, (selectedElement?.zIndex || 0) - 1))}
                >
                  <Layers className="w-4 h-4 mr-1" />
                  Back
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="effects" className="space-y-4 mt-0">
            {/* Opacity */}
            <div className="space-y-2">
              <Label>Opacity</Label>
              <Slider
                value={[selectedElement?.style?.opacity || 1]}
                onValueChange={([value]) => updateElementStyle({ opacity: value })}
                min={0}
                max={1}
                step={0.01}
                className="w-full"
              />
              <div className="text-sm text-gray-500">{Math.round((selectedElement?.style?.opacity || 1) * 100)}%</div>
            </div>

            {/* Shadow */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Drop Shadow</Label>
                <Switch
                  checked={!!selectedElement?.style?.boxShadow}
                  onCheckedChange={(checked) => updateElementStyle({ 
                    boxShadow: checked ? '0 4px 8px rgba(0, 0, 0, 0.1)' : undefined 
                  })}
                />
              </div>
              
              {selectedElement?.style?.boxShadow && (
                <>
                  <div className="space-y-2">
                    <Label>Shadow Blur</Label>
                    <Slider
                      value={[8]} // Would need to parse the shadow value
                      onValueChange={([value]) => updateElementStyle({ 
                        boxShadow: `0 4px ${value}px rgba(0, 0, 0, 0.1)` 
                      })}
                      min={0}
                      max={50}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Shadow Color</Label>
                    <Input
                      type="color"
                      value="#000000"
                      onChange={(e) => updateElementStyle({ 
                        boxShadow: `0 4px 8px ${e.target.value}33` 
                      })}
                      className="w-full h-10"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Blur */}
            <div className="space-y-2">
              <Label>Blur</Label>
              <Slider
                value={[selectedElement?.style?.filter?.includes('blur') ? 2 : 0]}
                onValueChange={([value]) => updateElementStyle({ 
                  filter: value > 0 ? `blur(${value}px)` : undefined 
                })}
                min={0}
                max={20}
                step={1}
                className="w-full"
              />
            </div>

            {/* Transforms */}
            <div className="space-y-3">
              <Label>Transform</Label>
              
              <div className="space-y-2">
                <Label className="text-sm">Scale</Label>
                <Slider
                  value={[1]} // Would need to parse transform value
                  onValueChange={([value]) => {
                    // Update transform scale
                  }}
                  min={0.1}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">Skew X</Label>
                <Slider
                  value={[0]}
                  onValueChange={([value]) => {
                    // Update transform skew
                  }}
                  min={-45}
                  max={45}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}