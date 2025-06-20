'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Type, Square, Circle, Triangle, Image, Palette, 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Plus, Minus, Trash2, Copy, Download, Save,
  ChevronUp, ChevronDown, Eye, EyeOff, Table,
  BarChart3, LineChart, PieChart, Layers,
  Lock, Unlock, Settings, RefreshCw, Database, X
} from 'lucide-react'
import { motion } from 'framer-motion'
import { HexColorPicker } from 'react-colorful'
import * as Slider from '@radix-ui/react-slider'
import * as Select from '@radix-ui/react-select'
import { EnhancedWorldClassChart } from '@/components/charts/EnhancedWorldClassChart'

interface SlideElement {
  id: string
  type: 'text' | 'shape' | 'image' | 'chart'
  x: number
  y: number
  width: number
  height: number
  content?: string
  style?: {
    fontSize?: number
    fontFamily?: string
    fontWeight?: string
    fontStyle?: string
    textAlign?: string
    color?: string
    backgroundColor?: string
    borderColor?: string
    borderWidth?: number
    borderRadius?: number
    opacity?: number
  }
  chartData?: any
  chartType?: string
  locked?: boolean
  zIndex?: number
}

interface SlideData {
  id: string
  type: string
  title: string
  content: any
  chartType?: string
  data?: any[]
  categories?: string[]
  index?: string
  tremorConfig?: any
  elements?: SlideElement[]
  background?: {
    type: 'solid' | 'gradient' | 'image'
    value: string
  }
}

interface ProfessionalSlideEditorProps {
  slide: SlideData
  onUpdate: (slide: SlideData) => void
  slideNumber: number
}

const fontFamilies = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Playfair Display', label: 'Playfair Display' }
]

const shapes = [
  { type: 'rectangle', icon: Square, label: 'Rectangle' },
  { type: 'circle', icon: Circle, label: 'Circle' },
  { type: 'triangle', icon: Triangle, label: 'Triangle' }
]

export function ProfessionalSlideEditor({ slide, onUpdate, slideNumber }: ProfessionalSlideEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [elementStart, setElementStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [showColorPicker, setShowColorPicker] = useState<'text' | 'background' | 'border' | null>(null)
  const [showDataTable, setShowDataTable] = useState(false)
  const [chartColumns, setChartColumns] = useState<Record<string, boolean>>({})
  const [showSettings, setShowSettings] = useState(false)

  // Initialize slide elements if not present
  const elements = slide.elements || []

  useEffect(() => {
    if (slide.categories) {
      const columns: Record<string, boolean> = {}
      slide.categories.forEach(cat => {
        columns[cat] = true
      })
      setChartColumns(columns)
    }
  }, [slide.categories])

  const handleMouseDown = (e: React.MouseEvent, elementId: string, action: 'drag' | 'resize') => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedElement(elementId)
    
    const element = elements.find(el => el.id === elementId)
    if (!element || element.locked) return

    if (action === 'drag') {
      setIsDragging(true)
      setDragStart({ x: e.clientX - element.x, y: e.clientY - element.y })
      setElementStart({ x: element.x, y: element.y, width: element.width, height: element.height })
    } else {
      setIsResizing(true)
      setDragStart({ x: e.clientX, y: e.clientY })
      setElementStart({ x: element.x, y: element.y, width: element.width, height: element.height })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!selectedElement) return

    const element = elements.find(el => el.id === selectedElement)
    if (!element) return

    if (isDragging) {
      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y
      
      updateElement(selectedElement, { x: newX, y: newY })
    } else if (isResizing) {
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y
      
      updateElement(selectedElement, {
        width: Math.max(50, elementStart.width + deltaX),
        height: Math.max(50, elementStart.height + deltaY)
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
  }

  const addElement = (type: SlideElement['type'], shapeType?: string) => {
    const newElement: SlideElement = {
      id: `element_${Date.now()}`,
      type,
      x: 100,
      y: 100,
      width: type === 'text' ? 300 : 200,
      height: type === 'text' ? 50 : 200,
      content: type === 'text' ? 'Click to edit text' : shapeType || '',
      style: {
        fontSize: 16,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'left',
        color: '#000000',
        backgroundColor: type === 'shape' ? '#3B82F6' : 'transparent',
        borderColor: '#E5E7EB',
        borderWidth: type === 'shape' ? 0 : 1,
        borderRadius: 0,
        opacity: 1
      },
      zIndex: elements.length
    }

    const updatedSlide = {
      ...slide,
      elements: [...elements, newElement]
    }
    onUpdate(updatedSlide)
    setSelectedElement(newElement.id)
  }

  const updateElement = (elementId: string, updates: Partial<SlideElement>) => {
    const updatedElements = elements.map(el =>
      el.id === elementId ? { ...el, ...updates } : el
    )
    
    onUpdate({
      ...slide,
      elements: updatedElements
    })
  }

  const updateElementStyle = (elementId: string, styleUpdates: Partial<SlideElement['style']>) => {
    const element = elements.find(el => el.id === elementId)
    if (!element) return

    updateElement(elementId, {
      style: { ...element.style, ...styleUpdates }
    })
  }

  const deleteElement = (elementId: string) => {
    const updatedElements = elements.filter(el => el.id !== elementId)
    onUpdate({
      ...slide,
      elements: updatedElements
    })
    setSelectedElement(null)
  }

  const duplicateElement = (elementId: string) => {
    const element = elements.find(el => el.id === elementId)
    if (!element) return

    const newElement = {
      ...element,
      id: `element_${Date.now()}`,
      x: element.x + 20,
      y: element.y + 20
    }

    onUpdate({
      ...slide,
      elements: [...elements, newElement]
    })
  }

  const updateBackground = (background: SlideData['background']) => {
    onUpdate({
      ...slide,
      background
    })
  }

  const toggleChartColumn = (column: string) => {
    const newColumns = { ...chartColumns, [column]: !chartColumns[column] }
    setChartColumns(newColumns)
    
    // Update slide with visible columns
    const visibleCategories = Object.entries(newColumns)
      .filter(([_, visible]) => visible)
      .map(([col]) => col)
    
    onUpdate({
      ...slide,
      categories: visibleCategories
    })
  }

  const renderElement = (element: SlideElement) => {
    const isSelected = selectedElement === element.id

    switch (element.type) {
      case 'text':
        return (
          <div
            contentEditable={isSelected}
            suppressContentEditableWarning
            onBlur={(e) => updateElement(element.id, { content: e.currentTarget.textContent || '' })}
            style={{
              fontSize: `${element.style?.fontSize}px`,
              fontFamily: element.style?.fontFamily,
              fontWeight: element.style?.fontWeight,
              fontStyle: element.style?.fontStyle,
              textAlign: element.style?.textAlign as any,
              color: element.style?.color,
              backgroundColor: element.style?.backgroundColor,
              padding: '8px',
              outline: isSelected ? '2px solid #3B82F6' : 'none',
              cursor: isSelected ? 'text' : 'move'
            }}
            className="w-full h-full"
          >
            {element.content}
          </div>
        )

      case 'shape':
        const shapeStyles = {
          backgroundColor: element.style?.backgroundColor,
          borderColor: element.style?.borderColor,
          borderWidth: `${element.style?.borderWidth}px`,
          borderStyle: 'solid',
          borderRadius: element.content === 'circle' ? '50%' : `${element.style?.borderRadius}px`,
          opacity: element.style?.opacity
        }

        if (element.content === 'triangle') {
          return (
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: `${element.width/2}px solid transparent`,
                borderRight: `${element.width/2}px solid transparent`,
                borderBottom: `${element.height}px solid ${element.style?.backgroundColor}`,
                opacity: element.style?.opacity
              }}
            />
          )
        }

        return <div style={shapeStyles} className="w-full h-full" />

      case 'chart':
        if (!slide.data || !slide.chartType) return null
        
        const visibleData = slide.data.map(row => {
          const filteredRow: any = { [slide.index || 'category']: row[slide.index || 'category'] }
          Object.entries(chartColumns).forEach(([col, visible]) => {
            if (visible) filteredRow[col] = row[col]
          })
          return filteredRow
        })

        return (
          <div className="w-full h-full p-4">
            <EnhancedWorldClassChart
              type={slide.chartType as any}
              data={visibleData}
              index={slide.index || 'category'}
              categories={Object.entries(chartColumns).filter(([_, v]) => v).map(([k]) => k)}
              colors={slide.tremorConfig?.colors}
              showLegend={true}
              height={element.height - 32}
              enableInteractivity={true}
              onColumnToggle={toggleChartColumn}
              title={slide.content?.title}
              subtitle={slide.content?.subtitle}
            />
          </div>
        )

      default:
        return null
    }
  }

  const selectedEl = elements.find(el => el.id === selectedElement)

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Left Toolbar */}
      <div className="w-16 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-4 gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => addElement('text')}
          className="w-12 h-12 p-0"
          title="Add Text"
        >
          <Type className="w-5 h-5" />
        </Button>
        
        {shapes.map(shape => (
          <Button
            key={shape.type}
            size="sm"
            variant="outline"
            onClick={() => addElement('shape', shape.type)}
            className="w-12 h-12 p-0"
            title={`Add ${shape.label}`}
          >
            <shape.icon className="w-5 h-5" />
          </Button>
        ))}

        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowSettings(!showSettings)}
          className="w-12 h-12 p-0 mt-auto"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="mx-auto" style={{ maxWidth: '1024px' }}>
          <Card className="mb-4 p-4 bg-gray-800 border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Slide {slideNumber}</h3>
                <p className="text-sm text-gray-400">{slide.title}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowDataTable(!showDataTable)}>
                  <Table className="w-4 h-4 mr-2" />
                  Data
                </Button>
                <Button size="sm" variant="outline">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </Card>

          {/* Slide Canvas */}
          <div
            ref={canvasRef}
            className="relative bg-white rounded-lg shadow-xl"
            style={{
              width: '100%',
              paddingBottom: '56.25%', // 16:9 aspect ratio
              background: slide.background?.type === 'gradient' 
                ? slide.background.value 
                : slide.background?.value || 'white'
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div className="absolute inset-0">
              {/* Render chart if it's a chart slide */}
              {slide.type === 'chart' && slide.data && (
                <div className="w-full h-full p-8">
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">{slide.content?.title}</h2>
                  <EnhancedWorldClassChart
                    type={slide.chartType as any}
                    data={slide.data}
                    index={slide.index || 'category'}
                    categories={slide.categories || []}
                    colors={slide.tremorConfig?.colors}
                    showLegend={true}
                    height={400}
                    enableInteractivity={true}
                    onColumnToggle={toggleChartColumn}
                    title={slide.content?.title}
                    subtitle={slide.content?.subtitle}
                    showDataTable={showDataTable}
                  />
                </div>
              )}

              {/* Render custom elements */}
              {elements.map(element => (
                <motion.div
                  key={element.id}
                  className={`absolute ${element.locked ? 'pointer-events-none' : ''}`}
                  style={{
                    left: element.x,
                    top: element.y,
                    width: element.width,
                    height: element.height,
                    zIndex: element.zIndex,
                    cursor: selectedElement === element.id ? 'move' : 'pointer'
                  }}
                  onMouseDown={(e) => handleMouseDown(e, element.id, 'drag')}
                  whileHover={{ scale: element.locked ? 1 : 1.01 }}
                  whileTap={{ scale: element.locked ? 1 : 0.99 }}
                >
                  {renderElement(element)}
                  
                  {/* Resize Handle */}
                  {selectedElement === element.id && !element.locked && (
                    <div
                      className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize"
                      onMouseDown={(e) => handleMouseDown(e, element.id, 'resize')}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Data Table Modal */}
          {showDataTable && slide.data && (
            <Card className="mt-4 p-4 bg-gray-800 border-gray-700 max-h-96 overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">Data Table</h4>
                <Button size="sm" variant="outline" onClick={() => setShowDataTable(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="px-2 py-1 text-left text-gray-300">
                        {slide.index || 'Index'}
                      </th>
                      {slide.categories?.map(cat => (
                        <th key={cat} className="px-2 py-1 text-left text-gray-300">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleChartColumn(cat)}
                              className="hover:text-white"
                            >
                              {chartColumns[cat] ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            </button>
                            {cat}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {slide.data.slice(0, 20).map((row, idx) => (
                      <tr key={idx} className="border-b border-gray-700">
                        <td className="px-2 py-1 text-gray-400">{row[slide.index || 'category']}</td>
                        {slide.categories?.map(cat => (
                          <td key={cat} className="px-2 py-1 text-gray-400">
                            {chartColumns[cat] ? row[cat] : '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Right Properties Panel */}
      {selectedEl && (
        <div className="w-80 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
          <h3 className="text-lg font-semibold text-white mb-4">Properties</h3>
          
          {/* Text Properties */}
          {selectedEl.type === 'text' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-300">Font Family</label>
                <select
                  value={selectedEl.style?.fontFamily}
                  onChange={(e) => updateElementStyle(selectedEl.id, { fontFamily: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-gray-700 text-white rounded"
                >
                  {fontFamilies.map(font => (
                    <option key={font.value} value={font.value}>{font.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-300">Font Size</label>
                <div className="flex items-center gap-2 mt-1">
                  <Slider.Root
                    value={[selectedEl.style?.fontSize || 16]}
                    onValueChange={([value]) => updateElementStyle(selectedEl.id, { fontSize: value })}
                    min={8}
                    max={72}
                    step={1}
                    className="flex-1 relative flex items-center h-5"
                  >
                    <Slider.Track className="bg-gray-600 relative flex-1 h-1 rounded">
                      <Slider.Range className="absolute bg-blue-500 h-full rounded" />
                    </Slider.Track>
                    <Slider.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg" />
                  </Slider.Root>
                  <span className="text-sm text-gray-300 w-12">{selectedEl.style?.fontSize}px</span>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-300 mb-2 block">Text Style</label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={selectedEl.style?.fontWeight === 'bold' ? 'default' : 'outline'}
                    onClick={() => updateElementStyle(selectedEl.id, { 
                      fontWeight: selectedEl.style?.fontWeight === 'bold' ? 'normal' : 'bold' 
                    })}
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedEl.style?.fontStyle === 'italic' ? 'default' : 'outline'}
                    onClick={() => updateElementStyle(selectedEl.id, { 
                      fontStyle: selectedEl.style?.fontStyle === 'italic' ? 'normal' : 'italic' 
                    })}
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedEl.style?.textAlign === 'left' ? 'default' : 'outline'}
                    onClick={() => updateElementStyle(selectedEl.id, { textAlign: 'left' })}
                  >
                    <AlignLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedEl.style?.textAlign === 'center' ? 'default' : 'outline'}
                    onClick={() => updateElementStyle(selectedEl.id, { textAlign: 'center' })}
                  >
                    <AlignCenter className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedEl.style?.textAlign === 'right' ? 'default' : 'outline'}
                    onClick={() => updateElementStyle(selectedEl.id, { textAlign: 'right' })}
                  >
                    <AlignRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-300">Text Color</label>
                <div className="mt-1">
                  <button
                    onClick={() => setShowColorPicker(showColorPicker === 'text' ? null : 'text')}
                    className="w-full h-10 rounded border border-gray-600"
                    style={{ backgroundColor: selectedEl.style?.color }}
                  />
                  {showColorPicker === 'text' && (
                    <div className="absolute z-10 mt-2">
                      <HexColorPicker
                        color={selectedEl.style?.color || '#000000'}
                        onChange={(color) => updateElementStyle(selectedEl.id, { color })}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Shape Properties */}
          {selectedEl.type === 'shape' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-300">Fill Color</label>
                <div className="mt-1">
                  <button
                    onClick={() => setShowColorPicker(showColorPicker === 'background' ? null : 'background')}
                    className="w-full h-10 rounded border border-gray-600"
                    style={{ backgroundColor: selectedEl.style?.backgroundColor }}
                  />
                  {showColorPicker === 'background' && (
                    <div className="absolute z-10 mt-2">
                      <HexColorPicker
                        color={selectedEl.style?.backgroundColor || '#3B82F6'}
                        onChange={(color) => updateElementStyle(selectedEl.id, { backgroundColor: color })}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-300">Border Width</label>
                <div className="flex items-center gap-2 mt-1">
                  <Slider.Root
                    value={[selectedEl.style?.borderWidth || 0]}
                    onValueChange={([value]) => updateElementStyle(selectedEl.id, { borderWidth: value })}
                    min={0}
                    max={10}
                    step={1}
                    className="flex-1 relative flex items-center h-5"
                  >
                    <Slider.Track className="bg-gray-600 relative flex-1 h-1 rounded">
                      <Slider.Range className="absolute bg-blue-500 h-full rounded" />
                    </Slider.Track>
                    <Slider.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg" />
                  </Slider.Root>
                  <span className="text-sm text-gray-300 w-12">{selectedEl.style?.borderWidth}px</span>
                </div>
              </div>

              {selectedEl.content !== 'circle' && selectedEl.content !== 'triangle' && (
                <div>
                  <label className="text-sm text-gray-300">Border Radius</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Slider.Root
                      value={[selectedEl.style?.borderRadius || 0]}
                      onValueChange={([value]) => updateElementStyle(selectedEl.id, { borderRadius: value })}
                      min={0}
                      max={50}
                      step={1}
                      className="flex-1 relative flex items-center h-5"
                    >
                      <Slider.Track className="bg-gray-600 relative flex-1 h-1 rounded">
                        <Slider.Range className="absolute bg-blue-500 h-full rounded" />
                      </Slider.Track>
                      <Slider.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg" />
                    </Slider.Root>
                    <span className="text-sm text-gray-300 w-12">{selectedEl.style?.borderRadius}px</span>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm text-gray-300">Opacity</label>
                <div className="flex items-center gap-2 mt-1">
                  <Slider.Root
                    value={[selectedEl.style?.opacity || 1]}
                    onValueChange={([value]) => updateElementStyle(selectedEl.id, { opacity: value })}
                    min={0}
                    max={1}
                    step={0.1}
                    className="flex-1 relative flex items-center h-5"
                  >
                    <Slider.Track className="bg-gray-600 relative flex-1 h-1 rounded">
                      <Slider.Range className="absolute bg-blue-500 h-full rounded" />
                    </Slider.Track>
                    <Slider.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg" />
                  </Slider.Root>
                  <span className="text-sm text-gray-300 w-12">{Math.round((selectedEl.style?.opacity || 1) * 100)}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Common Actions */}
          <div className="mt-6 space-y-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateElement(selectedEl.id, { locked: !selectedEl.locked })}
              className="w-full"
            >
              {selectedEl.locked ? <Unlock className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
              {selectedEl.locked ? 'Unlock' : 'Lock'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => duplicateElement(selectedEl.id)}
              className="w-full"
            >
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => deleteElement(selectedEl.id)}
              className="w-full text-red-500 hover:text-red-400"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>

          {/* Z-Index Controls */}
          <div className="mt-6">
            <label className="text-sm text-gray-300 mb-2 block">Layer Order</label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const maxZ = Math.max(...elements.map(el => el.zIndex || 0))
                  updateElement(selectedEl.id, { zIndex: maxZ + 1 })
                }}
                className="flex-1"
              >
                <ChevronUp className="w-4 h-4 mr-1" />
                Bring Front
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const minZ = Math.min(...elements.map(el => el.zIndex || 0))
                  updateElement(selectedEl.id, { zIndex: minZ - 1 })
                }}
                className="flex-1"
              >
                <ChevronDown className="w-4 h-4 mr-1" />
                Send Back
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Background Settings Panel */}
      {showSettings && (
        <div className="w-80 bg-gray-800 border-l border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Slide Background</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-300">Background Type</label>
              <select
                value={slide.background?.type || 'solid'}
                onChange={(e) => updateBackground({
                  type: e.target.value as any,
                  value: slide.background?.value || '#FFFFFF'
                })}
                className="w-full mt-1 px-3 py-2 bg-gray-700 text-white rounded"
              >
                <option value="solid">Solid Color</option>
                <option value="gradient">Gradient</option>
              </select>
            </div>

            {slide.background?.type === 'solid' && (
              <div>
                <label className="text-sm text-gray-300">Background Color</label>
                <div className="mt-1">
                  <button
                    onClick={() => setShowColorPicker(showColorPicker === 'background' ? null : 'background')}
                    className="w-full h-10 rounded border border-gray-600"
                    style={{ backgroundColor: slide.background?.value || '#FFFFFF' }}
                  />
                  {showColorPicker === 'background' && (
                    <div className="absolute z-10 mt-2">
                      <HexColorPicker
                        color={slide.background?.value || '#FFFFFF'}
                        onChange={(color) => updateBackground({
                          type: 'solid',
                          value: color
                        })}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {slide.background?.type === 'gradient' && (
              <div className="space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateBackground({
                    type: 'gradient',
                    value: 'linear-gradient(to right, #667eea, #764ba2)'
                  })}
                  className="w-full"
                >
                  Purple Gradient
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateBackground({
                    type: 'gradient',
                    value: 'linear-gradient(to right, #f093fb, #f5576c)'
                  })}
                  className="w-full"
                >
                  Pink Gradient
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateBackground({
                    type: 'gradient',
                    value: 'linear-gradient(to right, #4facfe, #00f2fe)'
                  })}
                  className="w-full"
                >
                  Blue Gradient
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateBackground({
                    type: 'gradient',
                    value: 'linear-gradient(to right, #43e97b, #38f9d7)'
                  })}
                  className="w-full"
                >
                  Green Gradient
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}