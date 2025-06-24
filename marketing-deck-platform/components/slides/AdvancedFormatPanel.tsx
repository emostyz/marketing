'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  X, Palette, Type, Square, Image as ImageIcon, 
  BarChart3, Table, Settings, Layers, Eye,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  RotateCw, FlipHorizontal, FlipVertical, Lock, Unlock,
  ChevronDown, ChevronRight, Plus, Minus,
  Zap, Sparkles, Wand2, Target, Grid
} from 'lucide-react'
import { HexColorPicker } from 'react-colorful'
import * as Slider from '@radix-ui/react-slider'
import * as Select from '@radix-ui/react-select'
import * as Tabs from '@radix-ui/react-tabs'
import * as Collapsible from '@radix-ui/react-collapsible'

interface AdvancedFormatPanelProps {
  selectedElements: string[]
  elements: any[]
  onUpdateElement: (elementId: string, updates: any) => void
  onClose: () => void
}

export function AdvancedFormatPanel({
  selectedElements,
  elements,
  onUpdateElement,
  onClose
}: AdvancedFormatPanelProps) {
  const [activeTab, setActiveTab] = useState('style')
  const [expandedSections, setExpandedSections] = useState<string[]>(['fill', 'border', 'text'])
  
  const selectedElement = elements.find(el => selectedElements.includes(el.id))
  
  if (!selectedElement) {
    return (
      <motion.div
        initial={{ x: 320 }}
        animate={{ x: 0 }}
        exit={{ x: 320 }}
        className="w-80 bg-white border-l border-gray-200 shadow-lg h-full overflow-y-auto"
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Format</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-4 text-center text-gray-500">
          <Settings className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">Select an element to format</p>
        </div>
      </motion.div>
    )
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const updateStyle = (styleUpdates: any) => {
    onUpdateElement(selectedElement.id, {
      style: { ...selectedElement.style, ...styleUpdates }
    })
  }

  return (
    <motion.div
      initial={{ x: 320 }}
      animate={{ x: 0 }}
      exit={{ x: 320 }}
      className="w-80 bg-white border-l border-gray-200 shadow-lg h-full overflow-y-auto"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">Format</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {selectedElements.length} selected
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Element Type Info */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            {selectedElement.type === 'text' && <Type className="w-4 h-4 text-blue-600" />}
            {selectedElement.type === 'shape' && <Square className="w-4 h-4 text-blue-600" />}
            {selectedElement.type === 'image' && <ImageIcon className="w-4 h-4 text-blue-600" />}
            {selectedElement.type === 'chart' && <BarChart3 className="w-4 h-4 text-blue-600" />}
            {selectedElement.type === 'table' && <Table className="w-4 h-4 text-blue-600" />}
          </div>
          <div>
            <div className="font-medium text-sm capitalize">{selectedElement.type} Element</div>
            <div className="text-xs text-gray-500">
              {Math.round(selectedElement.width)} × {Math.round(selectedElement.height)}px
            </div>
          </div>
        </div>
      </div>

      {/* Format Tabs */}
      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="flex border-b border-gray-200">
          <Tabs.Trigger 
            value="style" 
            className="flex-1 px-3 py-2 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
          >
            Style
          </Tabs.Trigger>
          <Tabs.Trigger 
            value="effects" 
            className="flex-1 px-3 py-2 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
          >
            Effects
          </Tabs.Trigger>
          <Tabs.Trigger 
            value="layout" 
            className="flex-1 px-3 py-2 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
          >
            Layout
          </Tabs.Trigger>
        </Tabs.List>

        {/* Style Tab */}
        <Tabs.Content value="style" className="p-4 space-y-4">
          {/* Fill Section */}
          <Collapsible.Root 
            open={expandedSections.includes('fill')} 
            onOpenChange={() => toggleSection('fill')}
          >
            <Collapsible.Trigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-sm">Fill</span>
              </div>
              {expandedSections.includes('fill') ? 
                <ChevronDown className="w-4 h-4" /> : 
                <ChevronRight className="w-4 h-4" />
              }
            </Collapsible.Trigger>
            <Collapsible.Content className="mt-2 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={selectedElement.style.backgroundColor}
                    onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                    className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={selectedElement.style.backgroundColor}
                    onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                    className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded"
                  />
                </div>
              </div>

              {/* Gradient Options */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Gradient</label>
                <div className="space-y-2">
                  <select 
                    className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
                    value={selectedElement.style.backgroundGradient?.type || 'none'}
                    onChange={(e) => {
                      if (e.target.value === 'none') {
                        updateStyle({ backgroundGradient: null })
                      } else {
                        updateStyle({
                          backgroundGradient: {
                            type: e.target.value,
                            direction: 0,
                            stops: [
                              { offset: 0, color: selectedElement.style.backgroundColor },
                              { offset: 100, color: '#ffffff' }
                            ]
                          }
                        })
                      }
                    }}
                  >
                    <option value="none">No Gradient</option>
                    <option value="linear">Linear Gradient</option>
                    <option value="radial">Radial Gradient</option>
                  </select>

                  {selectedElement.style.backgroundGradient && (
                    <>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Direction</label>
                        <Slider.Root
                          value={[selectedElement.style.backgroundGradient.direction]}
                          onValueChange={([value]) => updateStyle({
                            backgroundGradient: {
                              ...selectedElement.style.backgroundGradient,
                              direction: value
                            }
                          })}
                          max={360}
                          step={15}
                          className="relative flex items-center w-full h-5"
                        >
                          <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                            <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                          </Slider.Track>
                          <Slider.Thumb className="block w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md" />
                        </Slider.Root>
                        <div className="text-xs text-gray-500 mt-1">{selectedElement.style.backgroundGradient.direction}°</div>
                      </div>

                      {/* Gradient Stops */}
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Color Stops</label>
                        {selectedElement.style.backgroundGradient.stops.map((stop: any, index: number) => (
                          <div key={index} className="flex items-center gap-2 mb-2">
                            <input
                              type="color"
                              value={stop.color}
                              onChange={(e) => {
                                const newStops = [...selectedElement.style.backgroundGradient.stops]
                                newStops[index] = { ...stop, color: e.target.value }
                                updateStyle({
                                  backgroundGradient: {
                                    ...selectedElement.style.backgroundGradient,
                                    stops: newStops
                                  }
                                })
                              }}
                              className="w-6 h-6 border border-gray-300 rounded cursor-pointer"
                            />
                            <Slider.Root
                              value={[stop.offset]}
                              onValueChange={([value]) => {
                                const newStops = [...selectedElement.style.backgroundGradient.stops]
                                newStops[index] = { ...stop, offset: value }
                                updateStyle({
                                  backgroundGradient: {
                                    ...selectedElement.style.backgroundGradient,
                                    stops: newStops
                                  }
                                })
                              }}
                              max={100}
                              className="relative flex items-center flex-1 h-5"
                            >
                              <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                                <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                              </Slider.Track>
                              <Slider.Thumb className="block w-3 h-3 bg-blue-500 rounded-full border border-white shadow-md" />
                            </Slider.Root>
                            <span className="text-xs text-gray-500 w-8">{stop.offset}%</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Pattern Fill */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Pattern</label>
                <div className="grid grid-cols-4 gap-2">
                  {['solid', 'dots', 'stripes', 'checkers'].map(pattern => (
                    <button
                      key={pattern}
                      className="p-2 border border-gray-300 rounded hover:bg-gray-50 text-xs capitalize"
                      onClick={() => updateStyle({ pattern })}
                    >
                      {pattern}
                    </button>
                  ))}
                </div>
              </div>
            </Collapsible.Content>
          </Collapsible.Root>

          {/* Border Section */}
          <Collapsible.Root 
            open={expandedSections.includes('border')} 
            onOpenChange={() => toggleSection('border')}
          >
            <Collapsible.Trigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <Square className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-sm">Border</span>
              </div>
              {expandedSections.includes('border') ? 
                <ChevronDown className="w-4 h-4" /> : 
                <ChevronRight className="w-4 h-4" />
              }
            </Collapsible.Trigger>
            <Collapsible.Content className="mt-2 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
                  <input
                    type="color"
                    value={selectedElement.style.borderColor}
                    onChange={(e) => updateStyle({ borderColor: e.target.value })}
                    className="w-full h-8 border border-gray-300 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Style</label>
                  <select 
                    value={selectedElement.style.borderStyle}
                    onChange={(e) => updateStyle({ borderStyle: e.target.value })}
                    className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
                  >
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                    <option value="double">Double</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Width</label>
                <Slider.Root
                  value={[selectedElement.style.borderWidth]}
                  onValueChange={([value]) => updateStyle({ borderWidth: value })}
                  max={20}
                  className="relative flex items-center w-full h-5"
                >
                  <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                    <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                  </Slider.Track>
                  <Slider.Thumb className="block w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md" />
                </Slider.Root>
                <div className="text-xs text-gray-500 mt-1">{selectedElement.style.borderWidth}px</div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Corner Radius</label>
                <Slider.Root
                  value={[selectedElement.style.borderRadius]}
                  onValueChange={([value]) => updateStyle({ borderRadius: value })}
                  max={50}
                  className="relative flex items-center w-full h-5"
                >
                  <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                    <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                  </Slider.Track>
                  <Slider.Thumb className="block w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md" />
                </Slider.Root>
                <div className="text-xs text-gray-500 mt-1">{selectedElement.style.borderRadius}px</div>
              </div>
            </Collapsible.Content>
          </Collapsible.Root>

          {/* Text Section (for text elements) */}
          {selectedElement.type === 'text' && (
            <Collapsible.Root 
              open={expandedSections.includes('text')} 
              onOpenChange={() => toggleSection('text')}
            >
              <Collapsible.Trigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-sm">Typography</span>
                </div>
                {expandedSections.includes('text') ? 
                  <ChevronDown className="w-4 h-4" /> : 
                  <ChevronRight className="w-4 h-4" />
                }
              </Collapsible.Trigger>
              <Collapsible.Content className="mt-2 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Font Family</label>
                    <select 
                      value={selectedElement.style.fontFamily}
                      onChange={(e) => updateStyle({ fontFamily: e.target.value })}
                      className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
                    >
                      {['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New', 'Impact', 'Comic Sans MS'].map(font => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Size</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={selectedElement.style.fontSize}
                        onChange={(e) => updateStyle({ fontSize: parseInt(e.target.value) })}
                        className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
                        min="8"
                        max="144"
                      />
                      <span className="text-xs text-gray-500">px</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Style</label>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant={selectedElement.style.fontWeight === 'bold' ? 'default' : 'ghost'}
                      onClick={() => updateStyle({ 
                        fontWeight: selectedElement.style.fontWeight === 'bold' ? 'normal' : 'bold' 
                      })}
                    >
                      <Bold className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedElement.style.fontStyle === 'italic' ? 'default' : 'ghost'}
                      onClick={() => updateStyle({ 
                        fontStyle: selectedElement.style.fontStyle === 'italic' ? 'normal' : 'italic' 
                      })}
                    >
                      <Italic className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant={selectedElement.style.textDecoration === 'underline' ? 'default' : 'ghost'}
                      onClick={() => updateStyle({ 
                        textDecoration: selectedElement.style.textDecoration === 'underline' ? 'none' : 'underline' 
                      })}
                    >
                      <Underline className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Alignment</label>
                  <div className="flex gap-1">
                    {['left', 'center', 'right', 'justify'].map(align => (
                      <Button
                        key={align}
                        size="sm"
                        variant={selectedElement.style.textAlign === align ? 'default' : 'ghost'}
                        onClick={() => updateStyle({ textAlign: align })}
                      >
                        {align === 'left' && <AlignLeft className="w-3 h-3" />}
                        {align === 'center' && <AlignCenter className="w-3 h-3" />}
                        {align === 'right' && <AlignRight className="w-3 h-3" />}
                        {align === 'justify' && <AlignCenter className="w-3 h-3" />}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedElement.style.color}
                      onChange={(e) => updateStyle({ color: e.target.value })}
                      className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={selectedElement.style.color}
                      onChange={(e) => updateStyle({ color: e.target.value })}
                      className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Line Height</label>
                  <Slider.Root
                    value={[selectedElement.style.lineHeight]}
                    onValueChange={([value]) => updateStyle({ lineHeight: value })}
                    min={0.5}
                    max={3}
                    step={0.1}
                    className="relative flex items-center w-full h-5"
                  >
                    <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                      <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                    </Slider.Track>
                    <Slider.Thumb className="block w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md" />
                  </Slider.Root>
                  <div className="text-xs text-gray-500 mt-1">{selectedElement.style.lineHeight}</div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Letter Spacing</label>
                  <Slider.Root
                    value={[selectedElement.style.letterSpacing]}
                    onValueChange={([value]) => updateStyle({ letterSpacing: value })}
                    min={-5}
                    max={10}
                    step={0.1}
                    className="relative flex items-center w-full h-5"
                  >
                    <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                      <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                    </Slider.Track>
                    <Slider.Thumb className="block w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md" />
                  </Slider.Root>
                  <div className="text-xs text-gray-500 mt-1">{selectedElement.style.letterSpacing}px</div>
                </div>
              </Collapsible.Content>
            </Collapsible.Root>
          )}
        </Tabs.Content>

        {/* Effects Tab */}
        <Tabs.Content value="effects" className="p-4 space-y-4">
          <ShadowEffectPanel selectedElement={selectedElement} updateStyle={updateStyle} />
          <TransformEffectPanel selectedElement={selectedElement} onUpdateElement={onUpdateElement} />
          <FilterEffectPanel selectedElement={selectedElement} updateStyle={updateStyle} onUpdateElement={onUpdateElement} />
        </Tabs.Content>

        {/* Layout Tab */}
        <Tabs.Content value="layout" className="p-4 space-y-4">
          <PositionPanel selectedElement={selectedElement} onUpdateElement={onUpdateElement} />
          <SizePanel selectedElement={selectedElement} onUpdateElement={onUpdateElement} />
          <LayerPanel selectedElement={selectedElement} onUpdateElement={onUpdateElement} />
        </Tabs.Content>
      </Tabs.Root>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium">Quick Actions</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline" className="text-xs">
            <Wand2 className="w-3 h-3 mr-1" />
            Auto Style
          </Button>
          <Button size="sm" variant="outline" className="text-xs">
            <Target className="w-3 h-3 mr-1" />
            Reset
          </Button>
          <Button size="sm" variant="outline" className="text-xs">
            <Zap className="w-3 h-3 mr-1" />
            AI Enhance
          </Button>
          <Button size="sm" variant="outline" className="text-xs">
            <Grid className="w-3 h-3 mr-1" />
            Snap Align
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// Sub-panels for Effects tab
function ShadowEffectPanel({ selectedElement, updateStyle }: any) {
  const shadow = selectedElement.style.shadow || {
    enabled: false,
    color: '#000000',
    offsetX: 0,
    offsetY: 0,
    blur: 0,
    spread: 0
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Drop Shadow</h4>
        <input
          type="checkbox"
          checked={shadow.enabled}
          onChange={(e) => updateStyle({
            shadow: { ...shadow, enabled: e.target.checked }
          })}
          className="rounded"
        />
      </div>

      {shadow.enabled && (
        <div className="space-y-3 pl-4 border-l-2 border-gray-200">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">X Offset</label>
              <Slider.Root
                value={[shadow.offsetX]}
                onValueChange={([value]) => updateStyle({
                  shadow: { ...shadow, offsetX: value }
                })}
                min={-20}
                max={20}
                className="relative flex items-center w-full h-5"
              >
                <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                  <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb className="block w-3 h-3 bg-blue-500 rounded-full border border-white shadow-md" />
              </Slider.Root>
              <div className="text-xs text-gray-500">{shadow.offsetX}px</div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Y Offset</label>
              <Slider.Root
                value={[shadow.offsetY]}
                onValueChange={([value]) => updateStyle({
                  shadow: { ...shadow, offsetY: value }
                })}
                min={-20}
                max={20}
                className="relative flex items-center w-full h-5"
              >
                <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                  <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb className="block w-3 h-3 bg-blue-500 rounded-full border border-white shadow-md" />
              </Slider.Root>
              <div className="text-xs text-gray-500">{shadow.offsetY}px</div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Blur</label>
            <Slider.Root
              value={[shadow.blur]}
              onValueChange={([value]) => updateStyle({
                shadow: { ...shadow, blur: value }
              })}
              max={30}
              className="relative flex items-center w-full h-5"
            >
              <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb className="block w-3 h-3 bg-blue-500 rounded-full border border-white shadow-md" />
            </Slider.Root>
            <div className="text-xs text-gray-500">{shadow.blur}px</div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Color</label>
            <input
              type="color"
              value={shadow.color}
              onChange={(e) => updateStyle({
                shadow: { ...shadow, color: e.target.value }
              })}
              className="w-full h-8 border border-gray-300 rounded cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function TransformEffectPanel({ selectedElement, onUpdateElement }: any) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">Transform</h4>
      
      <div className="grid grid-cols-3 gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onUpdateElement(selectedElement.id, {
            rotation: selectedElement.rotation + 90
          })}
          className="text-xs"
        >
          <RotateCw className="w-3 h-3" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onUpdateElement(selectedElement.id, {
            // Implement flip horizontal
          })}
          className="text-xs"
        >
          <FlipHorizontal className="w-3 h-3" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onUpdateElement(selectedElement.id, {
            // Implement flip vertical
          })}
          className="text-xs"
        >
          <FlipVertical className="w-3 h-3" />
        </Button>
      </div>

      <div>
        <label className="block text-xs text-gray-600 mb-1">Rotation</label>
        <Slider.Root
          value={[selectedElement.rotation]}
          onValueChange={([value]) => onUpdateElement(selectedElement.id, { rotation: value })}
          min={-180}
          max={180}
          className="relative flex items-center w-full h-5"
        >
          <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
            <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
          </Slider.Track>
          <Slider.Thumb className="block w-3 h-3 bg-blue-500 rounded-full border border-white shadow-md" />
        </Slider.Root>
        <div className="text-xs text-gray-500">{Math.round(selectedElement.rotation)}°</div>
      </div>
    </div>
  )
}

function FilterEffectPanel({ selectedElement, updateStyle, onUpdateElement }: any) {
  if (selectedElement.type !== 'image') return null

  const filters = selectedElement.filters || {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    sepia: 0
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">Image Filters</h4>
      
      {Object.entries(filters).map(([filter, value]) => (
        <div key={filter}>
          <label className="block text-xs text-gray-600 mb-1 capitalize">{filter}</label>
          <Slider.Root
            value={[value as number]}
            onValueChange={([newValue]) => onUpdateElement(selectedElement.id, {
              filters: { ...filters, [filter]: newValue }
            })}
            min={filter === 'blur' ? 0 : filter === 'brightness' || filter === 'contrast' ? 0 : 0}
            max={filter === 'blur' ? 10 : filter === 'brightness' || filter === 'contrast' ? 200 : 100}
            className="relative flex items-center w-full h-5"
          >
            <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
              <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-3 h-3 bg-blue-500 rounded-full border border-white shadow-md" />
          </Slider.Root>
          <div className="text-xs text-gray-500">
            {String(value)}{filter === 'blur' ? 'px' : '%'}
          </div>
        </div>
      ))}
    </div>
  )
}

function PositionPanel({ selectedElement, onUpdateElement }: any) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">Position</h4>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">X</label>
          <input
            type="number"
            value={Math.round(selectedElement.x)}
            onChange={(e) => onUpdateElement(selectedElement.id, { x: parseInt(e.target.value) || 0 })}
            className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Y</label>
          <input
            type="number"
            value={Math.round(selectedElement.y)}
            onChange={(e) => onUpdateElement(selectedElement.id, { y: parseInt(e.target.value) || 0 })}
            className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
          />
        </div>
      </div>
    </div>
  )
}

function SizePanel({ selectedElement, onUpdateElement }: any) {
  const [aspectRatioLocked, setAspectRatioLocked] = useState(false)
  const aspectRatio = selectedElement.width / selectedElement.height

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Size</h4>
        <Button
          size="sm"
          variant={aspectRatioLocked ? 'default' : 'ghost'}
          onClick={() => setAspectRatioLocked(!aspectRatioLocked)}
        >
          {aspectRatioLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Width</label>
          <input
            type="number"
            value={Math.round(selectedElement.width)}
            onChange={(e) => {
              const newWidth = parseInt(e.target.value) || 0
              const updates: any = { width: newWidth }
              if (aspectRatioLocked) {
                updates.height = newWidth / aspectRatio
              }
              onUpdateElement(selectedElement.id, updates)
            }}
            className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Height</label>
          <input
            type="number"
            value={Math.round(selectedElement.height)}
            onChange={(e) => {
              const newHeight = parseInt(e.target.value) || 0
              const updates: any = { height: newHeight }
              if (aspectRatioLocked) {
                updates.width = newHeight * aspectRatio
              }
              onUpdateElement(selectedElement.id, updates)
            }}
            className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
          />
        </div>
      </div>
    </div>
  )
}

function LayerPanel({ selectedElement, onUpdateElement }: any) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">Layer</h4>
      
      <div>
        <label className="block text-xs text-gray-600 mb-1">Z-Index</label>
        <input
          type="number"
          value={selectedElement.zIndex}
          onChange={(e) => onUpdateElement(selectedElement.id, { zIndex: parseInt(e.target.value) || 0 })}
          className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={selectedElement.locked}
          onChange={(e) => onUpdateElement(selectedElement.id, { locked: e.target.checked })}
          className="rounded"
        />
        <label className="text-xs text-gray-600">Lock Element</label>
      </div>
    </div>
  )
}