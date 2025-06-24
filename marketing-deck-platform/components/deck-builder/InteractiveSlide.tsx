'use client'

import React, { useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { 
  AreaChart, BarChart, LineChart, DonutChart
} from '@tremor/react'
import { 
  Palette, Eye, EyeOff, Move, Settings, RotateCcw,
  ZoomIn, ZoomOut, Download, Edit3, Grip, 
  ChevronUp, ChevronDown, Maximize2, Minimize2
} from 'lucide-react'
import { useDraggable } from '@dnd-kit/core'

interface InteractiveSlideProps {
  slide: any
  onUpdate: (slide: any) => void
}

const colorSchemes = {
  blue: ['blue-500', 'blue-400', 'blue-600', 'blue-300'],
  emerald: ['emerald-500', 'emerald-400', 'emerald-600', 'emerald-300'],
  violet: ['violet-500', 'violet-400', 'violet-600', 'violet-300'],
  amber: ['amber-500', 'amber-400', 'amber-600', 'amber-300'],
  red: ['red-500', 'red-400', 'red-600', 'red-300'],
  indigo: ['indigo-500', 'indigo-400', 'indigo-600', 'indigo-300'],
  pink: ['pink-500', 'pink-400', 'pink-600', 'pink-300'],
  teal: ['teal-500', 'teal-400', 'teal-600', 'teal-300']
}

const chartSizes = {
  small: { height: 48, className: 'h-48' },
  medium: { height: 64, className: 'h-64' },
  large: { height: 80, className: 'h-80' },
  xlarge: { height: 96, className: 'h-96' }
}

export function InteractiveSlide({ slide, onUpdate }: InteractiveSlideProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [chartType, setChartType] = useState(slide.chartType || 'bar')
  const [colorScheme, setColorScheme] = useState('blue')
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([])
  const [chartSize, setChartSize] = useState<keyof typeof chartSizes>('medium')
  const [showDataTable, setShowDataTable] = useState(false)
  const slideRef = useRef<HTMLDivElement>(null)

  // Get chart component based on type
  const getChartComponent = () => {
    switch (chartType) {
      case 'line':
        return LineChart
      case 'area':
        return AreaChart
      case 'donut':
        return DonutChart
      case 'bar':
      default:
        return BarChart
    }
  }

  // Get visible categories (excluding hidden ones)
  const getVisibleCategories = () => {
    return (slide.categories || []).filter((cat: string) => !hiddenColumns.includes(cat))
  }

  // Handle chart configuration updates
  const updateChartConfig = (updates: any) => {
    const updatedSlide = {
      ...slide,
      chartType,
      tremorConfig: {
        ...slide.tremorConfig,
        ...updates,
        colors: colorSchemes[colorScheme as keyof typeof colorSchemes],
        height: chartSizes[chartSize].height
      }
    }
    onUpdate(updatedSlide)
  }

  // Toggle column visibility
  const toggleColumn = (column: string) => {
    const newHiddenColumns = hiddenColumns.includes(column)
      ? hiddenColumns.filter(c => c !== column)
      : [...hiddenColumns, column]
    
    setHiddenColumns(newHiddenColumns)
    updateChartConfig({ categories: (slide.categories || []).filter((c: string) => !newHiddenColumns.includes(c)) })
  }

  // Change chart type
  const changeChartType = (newType: string) => {
    setChartType(newType)
    updateChartConfig({
      type: newType,
      showGradient: newType === 'area'
    })
  }

  // Change color scheme
  const changeColorScheme = (scheme: string) => {
    setColorScheme(scheme)
    updateChartConfig({
      colors: colorSchemes[scheme as keyof typeof colorSchemes]
    })
  }

  // Change chart size
  const changeChartSize = (size: keyof typeof chartSizes) => {
    setChartSize(size)
    updateChartConfig({
      height: chartSizes[size].height
    })
  }

  // Draggable slide component
  const DraggableSlide = ({ children }: { children: React.ReactNode }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: slide.id
    })

    const style = transform ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined

    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        {...listeners} 
        {...attributes}
        className={isDragging ? 'opacity-50' : ''}
      >
        {children}
      </div>
    )
  }

  const ChartComponent = getChartComponent()
  const visibleCategories = getVisibleCategories()

  return (
    <DraggableSlide>
      <Card className="mb-6 group relative overflow-hidden">
        {/* Slide Controls */}
        <div 
          className={`absolute top-4 right-4 z-10 transition-opacity ${
            showControls ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <div className="flex gap-2 bg-gray-900/90 backdrop-blur-sm rounded-lg p-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowControls(!showControls)}
              className="p-2"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(!isEditing)}
              className="p-2"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="p-2"
            >
              <Grip className="w-4 h-4 cursor-move" />
            </Button>
          </div>
        </div>

        {/* Enhanced Controls Panel */}
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 right-4 z-20 bg-gray-900/95 backdrop-blur-md rounded-lg p-4 shadow-xl border border-gray-700 w-80"
          >
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Chart Customization
            </h4>

            {/* Chart Type Selector */}
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-2">Chart Type</label>
              <div className="grid grid-cols-2 gap-2">
                {['bar', 'line', 'area', 'donut'].map((type) => (
                  <Button
                    key={type}
                    size="sm"
                    variant={chartType === type ? 'default' : 'secondary'}
                    onClick={() => changeChartType(type)}
                    className="text-xs capitalize"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            {/* Color Scheme Selector */}
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-2">Color Scheme</label>
              <div className="grid grid-cols-4 gap-2">
                {Object.keys(colorSchemes).map((scheme) => (
                  <button
                    key={scheme}
                    onClick={() => changeColorScheme(scheme)}
                    className={`w-8 h-8 rounded border-2 ${
                      colorScheme === scheme ? 'border-white' : 'border-gray-600'
                    }`}
                    style={{ 
                      background: `linear-gradient(45deg, var(--${scheme}-500), var(--${scheme}-300))` 
                    }}
                    title={scheme}
                  />
                ))}
              </div>
            </div>

            {/* Chart Size */}
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-2">Chart Size</label>
              <div className="flex gap-2">
                {Object.keys(chartSizes).map((size) => (
                  <Button
                    key={size}
                    size="sm"
                    variant={chartSize === size ? 'default' : 'secondary'}
                    onClick={() => changeChartSize(size as keyof typeof chartSizes)}
                    className="text-xs capitalize flex-1"
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            {/* Column Visibility */}
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-2">Data Columns</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {(slide.categories || []).map((category: string) => (
                  <Button
                    key={category}
                    size="sm"
                    variant={hiddenColumns.includes(category) ? 'secondary' : 'default'}
                    onClick={() => toggleColumn(category)}
                    className="w-full justify-between text-xs"
                  >
                    <span>{category}</span>
                    {hiddenColumns.includes(category) ? 
                      <EyeOff className="w-3 h-3" /> : 
                      <Eye className="w-3 h-3" />
                    }
                  </Button>
                ))}
              </div>
            </div>

            {/* Additional Controls */}
            <div className="flex gap-2 pt-2 border-t border-gray-700">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowDataTable(!showDataTable)}
                className="flex-1 text-xs"
              >
                <Eye className="w-3 h-3 mr-1" />
                Data
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="flex-1 text-xs"
              >
                <Download className="w-3 h-3 mr-1" />
                Export
              </Button>
            </div>
          </motion.div>
        )}

        {/* Slide Content */}
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            {isEditing ? (
              <input
                type="text"
                value={slide.title}
                onChange={(e) => onUpdate({ ...slide, title: e.target.value })}
                className="text-2xl font-bold text-white bg-transparent border-b border-gray-600 focus:border-blue-500 focus:outline-none w-full"
              />
            ) : (
              <h2 className="text-2xl font-bold text-white">{slide.title}</h2>
            )}
            
            {slide.content?.subtitle && (
              <p className="text-lg text-blue-300 mt-2">{slide.content.subtitle}</p>
            )}
            
            {slide.content?.description && (
              <p className="text-gray-300 text-sm mt-2">{slide.content.description}</p>
            )}
          </div>

          {/* Chart Section */}
          {slide.type === 'chart' && slide.data && slide.data.length > 0 && (
            <div className="mb-6">
              <div className={`${chartSizes[chartSize].className} mb-4`}>
                <ChartComponent
                  data={slide.data}
                  index={slide.index || 'name'}
                  categories={visibleCategories}
                  colors={colorSchemes[colorScheme as keyof typeof colorSchemes]}
                  showLegend={visibleCategories.length > 1}
                  className="w-full"
                />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                  <div className="text-lg font-semibold text-white">
                    {slide.data?.length || 0}
                  </div>
                  <div className="text-xs text-gray-400">Data Points</div>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                  <div className="text-lg font-semibold text-emerald-400">
                    {visibleCategories.length}
                  </div>
                  <div className="text-xs text-gray-400">Metrics</div>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                  <div className="text-lg font-semibold text-blue-400">
                    {((slide.data?.reduce((sum: number, item: any) => 
                      sum + (Object.values(item).filter(v => typeof v === 'number').reduce((a: any, b: any) => a + b, 0) as number), 0) || 0) / 1000).toFixed(1)}K
                  </div>
                  <div className="text-xs text-gray-400">Total Value</div>
                </div>
              </div>
            </div>
          )}

          {/* Data Table (when toggled) */}
          {showDataTable && slide.data && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3">Raw Data</h4>
                <div className="overflow-x-auto max-h-48 overflow-y-auto">
                  <table className="w-full text-xs text-gray-300">
                    <thead>
                      <tr className="border-b border-gray-700">
                        {Object.keys(slide.data[0] || {}).map((key) => (
                          <th key={key} className="text-left p-2 font-medium">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {slide.data.slice(0, 10).map((row: any, idx: number) => (
                        <tr key={idx} className="border-b border-gray-800">
                          {Object.values(row).map((value: any, colIdx) => (
                            <td key={colIdx} className="p-2">{String(value)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {slide.data.length > 10 && (
                    <div className="text-center text-gray-500 text-xs mt-2">
                      ... and {slide.data.length - 10} more rows
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Insights Panel */}
          {slide.content?.narrative && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  💡 Key Insights
                </h3>
                <div className="space-y-3">
                  {Array.isArray(slide.content.narrative) ? 
                    slide.content.narrative.map((point: string, idx: number) => (
                      <div key={idx} className="bg-blue-900/20 p-3 rounded-lg">
                        <p className="text-blue-200 text-sm">{point}</p>
                      </div>
                    )) :
                    <div className="bg-blue-900/20 p-3 rounded-lg">
                      <p className="text-blue-200 text-sm">{slide.content.narrative}</p>
                    </div>
                  }
                </div>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  🎯 The Story
                </h3>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {slide.content?.insights?.join(' ') || 
                     'This visualization reveals important patterns that drive strategic decision-making.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Content Slides */}
          {slide.type === 'content' && (
            <div className="space-y-4">
              {slide.content?.body && (
                <p className="text-gray-300">{slide.content.body}</p>
              )}
              
              {slide.content?.bulletPoints && (
                <ul className="space-y-2">
                  {slide.content.bulletPoints.map((point: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-blue-400 mt-1">•</span>
                      <span className="text-gray-200">{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Slide Number */}
        <div className="absolute bottom-4 left-4 text-xs text-gray-500">
          Slide {slide.id}
        </div>
      </Card>
    </DraggableSlide>
  )
}