'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  AreaChart,
  BarChart,
  LineChart,
  DonutChart,
  ScatterChart,
  Card,
  Badge
} from '@tremor/react'
import { Button } from '@/components/ui/Button'
import { 
  Settings, 
  Palette, 
  TrendingUp,
  BarChart3,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Table,
  Filter,
  SortAsc,
  SortDesc,
  Plus,
  Minus,
  RotateCcw,
  MousePointer,
  Move,
  Maximize2,
  Copy,
  Trash2,
  Type,
  Grid3x3,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Layers,
  Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import * as Slider from '@radix-ui/react-slider'
import * as Select from '@radix-ui/react-select'
import { HexColorPicker } from 'react-colorful'

interface ExcelChartProps {
  data: any[]
  chartId: string
  title?: string
  subtitle?: string
  onUpdate?: (chartConfig: any) => void
  onDelete?: () => void
  onDuplicate?: () => void
  enableFullEditing?: boolean
  initialConfig?: ChartConfiguration
}

interface ChartConfiguration {
  type: 'bar' | 'line' | 'area' | 'donut' | 'scatter' | 'combo' | 'waterfall' | 'funnel'
  subtype: 'clustered' | 'stacked' | 'stacked100' | 'smooth' | 'straight' | 'stepped'
  orientation: 'vertical' | 'horizontal'
  index: string
  categories: string[]
  colors: string[]
  
  // Excel-level styling
  chartArea: {
    backgroundColor: string
    borderColor: string
    borderWidth: number
    borderRadius: number
    padding: { top: number, right: number, bottom: number, left: number }
    shadow: boolean
    gradient: boolean
  }
  
  // Axes configuration
  xAxis: {
    show: boolean
    title: string
    titleColor: string
    titleFont: { family: string, size: number, weight: string }
    labelColor: string
    labelFont: { family: string, size: number, weight: string }
    labelRotation: number
    gridLines: boolean
    gridColor: string
    gridStyle: 'solid' | 'dashed' | 'dotted'
    tickMarks: boolean
    reverse: boolean
    logarithmic: boolean
    min?: number
    max?: number
    interval?: number
  }
  
  yAxis: {
    show: boolean
    title: string
    titleColor: string
    titleFont: { family: string, size: number, weight: string }
    labelColor: string
    labelFont: { family: string, size: number, weight: string }
    labelFormat: 'number' | 'currency' | 'percentage' | 'date' | 'scientific'
    gridLines: boolean
    gridColor: string
    gridStyle: 'solid' | 'dashed' | 'dotted'
    tickMarks: boolean
    reverse: boolean
    logarithmic: boolean
    min?: number
    max?: number
    interval?: number
  }
  
  // Legend configuration
  legend: {
    show: boolean
    position: 'top' | 'bottom' | 'left' | 'right' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
    backgroundColor: string
    borderColor: string
    borderWidth: number
    font: { family: string, size: number, weight: string, color: string }
    itemSpacing: number
  }
  
  // Data series styling
  series: Array<{
    name: string
    type: 'bar' | 'line' | 'area' | 'scatter' | 'combo' | 'donut' | 'funnel' | 'waterfall'
    color: string
    pattern: 'solid' | 'striped' | 'dotted' | 'gradient'
    lineWidth: number
    lineStyle: 'solid' | 'dashed' | 'dotted'
    markerShape: 'circle' | 'square' | 'diamond' | 'triangle' | 'none'
    markerSize: number
    fill: boolean
    fillOpacity: number
    shadow: boolean
    visible: boolean
    yAxisIndex: 0 | 1
  }>
  
  // Data labels
  dataLabels: {
    show: boolean
    position: 'center' | 'insideEnd' | 'insideBase' | 'outside' | 'top' | 'bottom'
    font: { family: string, size: number, weight: string, color: string }
    format: string
    rotation: number
    backgroundColor: string
    borderColor: string
    borderRadius: number
  }
  
  // Animations
  animation: {
    enabled: boolean
    duration: number
    easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce'
    delay: number
  }
  
  // Interactivity
  interaction: {
    hover: boolean
    selection: boolean
    zoom: boolean
    pan: boolean
    brush: boolean
    crossfilter: boolean
  }
  
  // Export settings
  export: {
    backgroundColor: string
    width: number
    height: number
    scale: number
  }
}

const DEFAULT_CONFIG: ChartConfiguration = {
  type: 'bar',
  subtype: 'clustered',
  orientation: 'vertical',
  index: '',
  categories: [],
  colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'],
  
  chartArea: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 8,
    padding: { top: 20, right: 20, bottom: 20, left: 20 },
    shadow: false,
    gradient: false
  },
  
  xAxis: {
    show: true,
    title: '',
    titleColor: '#374151',
    titleFont: { family: 'Inter', size: 14, weight: '600' },
    labelColor: '#6B7280',
    labelFont: { family: 'Inter', size: 12, weight: '400' },
    labelRotation: 0,
    gridLines: false,
    gridColor: '#F3F4F6',
    gridStyle: 'solid',
    tickMarks: true,
    reverse: false,
    logarithmic: false
  },
  
  yAxis: {
    show: true,
    title: '',
    titleColor: '#374151',
    titleFont: { family: 'Inter', size: 14, weight: '600' },
    labelColor: '#6B7280',
    labelFont: { family: 'Inter', size: 12, weight: '400' },
    labelFormat: 'number',
    gridLines: true,
    gridColor: '#F3F4F6',
    gridStyle: 'solid',
    tickMarks: true,
    reverse: false,
    logarithmic: false
  },
  
  legend: {
    show: true,
    position: 'top',
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
    font: { family: 'Inter', size: 12, weight: '500', color: '#374151' },
    itemSpacing: 12
  },
  
  series: [],
  
  dataLabels: {
    show: false,
    position: 'outside',
    font: { family: 'Inter', size: 10, weight: '500', color: '#374151' },
    format: 'auto',
    rotation: 0,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderRadius: 0
  },
  
  animation: {
    enabled: true,
    duration: 1000,
    easing: 'easeOut',
    delay: 0
  },
  
  interaction: {
    hover: true,
    selection: false,
    zoom: false,
    pan: false,
    brush: false,
    crossfilter: false
  },
  
  export: {
    backgroundColor: '#FFFFFF',
    width: 800,
    height: 600,
    scale: 2
  }
}

export function ExcelLevelChart({
  data,
  chartId,
  title,
  subtitle,
  onUpdate,
  onDelete,
  onDuplicate,
  enableFullEditing = true,
  initialConfig
}: ExcelChartProps) {
  const [config, setConfig] = useState<ChartConfiguration>(() => ({
    ...DEFAULT_CONFIG,
    ...initialConfig,
    index: initialConfig?.index || (data[0] ? Object.keys(data[0])[0] : ''),
    categories: initialConfig?.categories || (data[0] ? Object.keys(data[0]).slice(1) : [])
  }))
  
  const [showEditor, setShowEditor] = useState(false)
  const [editorTab, setEditorTab] = useState<'chart' | 'axes' | 'series' | 'style' | 'data'>('chart')
  const [isSelected, setIsSelected] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null)
  const [filteredData, setFilteredData] = useState(data)
  const [sortConfig, setSortConfig] = useState<{ column: string, direction: 'asc' | 'desc' } | null>(null)
  
  const chartRef = useRef<HTMLDivElement>(null)

  // Update parent when config changes
  useEffect(() => {
    if (onUpdate) {
      onUpdate({ ...config, data: filteredData })
    }
  }, [config, filteredData, onUpdate])

  // Initialize series configuration
  useEffect(() => {
    if (config.categories.length > 0 && config.series.length === 0) {
      const newSeries = config.categories.map((category, index) => ({
        name: category,
        type: config.type === 'combo' && index > 0 ? 'line' : config.type,
        color: config.colors[index % config.colors.length],
        pattern: 'solid' as const,
        lineWidth: 2,
        lineStyle: 'solid' as const,
        markerShape: 'circle' as const,
        markerSize: 4,
        fill: config.type === 'area',
        fillOpacity: 0.6,
        shadow: false,
        visible: true,
        yAxisIndex: 0 as const
      }))
      setConfig(prev => ({ ...prev, series: newSeries }))
    }
  }, [config.categories, config.type, config.colors])

  const updateConfig = useCallback((updates: Partial<ChartConfiguration>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }, [])

  const updateSeries = useCallback((index: number, updates: any) => {
    setConfig(prev => ({
      ...prev,
      series: prev.series.map((s, i) => i === index ? { ...s, ...updates } : s)
    }))
  }, [])

  // Advanced data filtering and sorting
  const handleSort = (column: string) => {
    const direction = sortConfig?.column === column && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    setSortConfig({ column, direction })
    
    const sorted = [...filteredData].sort((a, b) => {
      const aVal = a[column]
      const bVal = b[column]
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return direction === 'asc' ? aVal - bVal : bVal - aVal
      }
      
      const aStr = String(aVal).toLowerCase()
      const bStr = String(bVal).toLowerCase()
      return direction === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
    })
    
    setFilteredData(sorted)
  }

  // Chart export functionality
  const exportChart = async (format: 'png' | 'svg' | 'pdf' | 'excel') => {
    if (!chartRef.current) return

    try {
      switch (format) {
        case 'png':
          // Export as PNG with high quality
          const canvas = document.createElement('canvas')
          canvas.width = config.export.width * config.export.scale
          canvas.height = config.export.height * config.export.scale
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.fillStyle = config.export.backgroundColor
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            // Convert chart to image and draw on canvas
            const link = document.createElement('a')
            link.download = `${title || 'chart'}_${new Date().toISOString().split('T')[0]}.png`
            link.href = canvas.toDataURL()
            link.click()
          }
          break
          
        case 'excel':
          // Export data to Excel format
          const csvContent = [
            [config.index, ...config.categories].join(','),
            ...filteredData.map(row => 
              [row[config.index], ...config.categories.map(cat => row[cat] || '')].join(',')
            )
          ].join('\n')
          
          const blob = new Blob([csvContent], { type: 'text/csv' })
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.download = `${title || 'chart'}_data.csv`
          link.href = url
          link.click()
          URL.revokeObjectURL(url)
          break
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  // Render the actual chart based on configuration
  const renderChart = () => {
    const visibleSeries = config.series.filter(s => s.visible)
    const chartProps = {
      data: filteredData,
      index: config.index,
      categories: visibleSeries.map(s => s.name),
      colors: visibleSeries.map(s => s.color),
      showLegend: config.legend.show,
      showAnimation: config.animation.enabled,
      showTooltip: config.interaction.hover,
      showGridLines: config.yAxis.gridLines,
      valueFormatter: (value: number) => {
        switch (config.yAxis.labelFormat) {
          case 'currency': return `$${value.toLocaleString()}`
          case 'percentage': return `${value}%`
          case 'scientific': return value.toExponential(2)
          default: return value.toLocaleString()
        }
      },
      className: "w-full h-full"
    }

    switch (config.type) {
      case 'bar':
        return (
          <BarChart
            {...chartProps}
            stack={config.subtype === 'stacked' || config.subtype === 'stacked100'}
            layout={config.orientation === 'horizontal' ? 'horizontal' : 'vertical'}
            relative={config.subtype === 'stacked100'}
          />
        )
      
      case 'line':
        return (
          <LineChart
            {...chartProps}
            curveType={config.subtype === 'smooth' ? 'monotone' : config.subtype === 'stepped' ? 'step' : 'linear'}
            connectNulls={true}
          />
        )
      
      case 'area':
        return (
          <AreaChart
            {...chartProps}
            stack={config.subtype === 'stacked' || config.subtype === 'stacked100'}
            curveType={config.subtype === 'smooth' ? 'monotone' : 'linear'}
            showGradient={config.chartArea.gradient}
          />
        )
      
      case 'donut':
        return (
          <DonutChart
            data={filteredData}
            category={visibleSeries[0]?.name || config.categories[0]}
            index={config.index}
            colors={visibleSeries.map(s => s.color)}
            showAnimation={config.animation.enabled}
            showTooltip={config.interaction.hover}
            valueFormatter={chartProps.valueFormatter}
          />
        )
      
      case 'scatter':
        return (
          <ScatterChart
            data={filteredData}
            x={config.categories[0]}
            y={config.categories[1]}
            category={config.index}
            colors={config.colors}
            showLegend={config.legend.show}
            showTooltip={config.interaction.hover}
          />
        )
      
      case 'combo':
        return (
          <div className="relative w-full h-full">
            <BarChart
              {...chartProps}
              categories={visibleSeries.filter(s => s.type === 'bar').map(s => s.name)}
              colors={visibleSeries.filter(s => s.type === 'bar').map(s => s.color)}
            />
            <div className="absolute inset-0 pointer-events-none">
              <LineChart
                {...chartProps}
                categories={visibleSeries.filter(s => s.type === 'line').map(s => s.name)}
                colors={visibleSeries.filter(s => s.type === 'line').map(s => s.color)}
                showLegend={false}
                className="opacity-90"
              />
            </div>
          </div>
        )
      
      default:
        return <div className="flex items-center justify-center h-64 text-gray-400">Unsupported chart type</div>
    }
  }

  return (
    <div className="relative group">
      <Card 
        className={`p-6 transition-all ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'}`}
        onClick={() => setIsSelected(true)}
        style={{ 
          backgroundColor: config.chartArea.backgroundColor,
          borderColor: config.chartArea.borderColor,
          borderWidth: config.chartArea.borderWidth,
          borderRadius: config.chartArea.borderRadius
        }}
      >
        {/* Chart Header */}
        {(title || subtitle) && (
          <div className="mb-4">
            {title && (
              <h3 className="text-lg font-semibold" style={{ color: config.xAxis.titleColor }}>
                {title}
              </h3>
            )}
            {subtitle && (
              <span className="text-sm" style={{ color: config.yAxis.titleColor }}>
                {subtitle}
              </span>
            )}
          </div>
        )}

        {/* Excel-style toolbar (visible on selection) */}
        <AnimatePresence>
          {enableFullEditing && isSelected && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute -top-12 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10"
            >
              <div className="flex items-center gap-1 text-xs">
                <Button size="sm" variant="ghost" onClick={() => setShowEditor(true)}>
                  <Settings className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowColorPicker(chartId)}>
                  <Palette className="w-3 h-3" />
                </Button>
                <div className="w-px h-4 bg-gray-300 mx-1" />
                <Button size="sm" variant="ghost" onClick={() => exportChart('png')}>
                  <Download className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => exportChart('excel')}>
                  <Table className="w-3 h-3" />
                </Button>
                <div className="w-px h-4 bg-gray-300 mx-1" />
                {onDuplicate && (
                  <Button size="sm" variant="ghost" onClick={onDuplicate}>
                    <Copy className="w-3 h-3" />
                  </Button>
                )}
                {onDelete && (
                  <Button size="sm" variant="ghost" onClick={onDelete}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chart Content */}
        <div 
          ref={chartRef}
          className="w-full"
          style={{ height: '400px', padding: `${config.chartArea.padding.top}px ${config.chartArea.padding.right}px ${config.chartArea.padding.bottom}px ${config.chartArea.padding.left}px` }}
        >
          {renderChart()}
        </div>

        {/* Data Quality Indicators */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>{filteredData.length} data points</span>
            <span>{config.categories.length} series</span>
            {sortConfig && (
              <Badge className="text-xs">
                Sorted by {sortConfig.column} ({sortConfig.direction})
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowEditor(true)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Zap className="w-3 h-3 mr-1" />
              Customize
            </Button>
          </div>
        </div>
      </Card>

      {/* Advanced Chart Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-5/6 max-h-[800px] overflow-hidden"
            >
              <ChartEditorModal
                config={config}
                data={filteredData}
                onConfigChange={updateConfig}
                onSeriesChange={updateSeries}
                onClose={() => setShowEditor(false)}
                onSort={handleSort}
                sortConfig={sortConfig}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Color Picker Modal */}
      <AnimatePresence>
        {showColorPicker === chartId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg p-6 shadow-2xl"
            >
              <h3 className="text-lg font-semibold mb-4">Chart Colors</h3>
              <div className="grid grid-cols-4 gap-4 mb-4">
                {config.colors.map((color, index) => (
                  <div key={index} className="space-y-2">
                    <div className="text-xs text-gray-600">Color {index + 1}</div>
                    <HexColorPicker
                      color={color}
                      onChange={(newColor) => {
                        const newColors = [...config.colors]
                        newColors[index] = newColor
                        updateConfig({ colors: newColors })
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowColorPicker(null)}>Done</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Advanced Chart Editor Component
interface ChartEditorModalProps {
  config: ChartConfiguration
  data: any[]
  onConfigChange: (updates: Partial<ChartConfiguration>) => void
  onSeriesChange: (index: number, updates: any) => void
  onClose: () => void
  onSort: (column: string) => void
  sortConfig: { column: string, direction: 'asc' | 'desc' } | null
}

function ChartEditorModal({
  config,
  data,
  onConfigChange,
  onSeriesChange,
  onClose,
  onSort,
  sortConfig
}: ChartEditorModalProps) {
  const [activeTab, setActiveTab] = useState<'chart' | 'axes' | 'series' | 'style' | 'data'>('chart')

  const tabs = [
    { id: 'chart', label: 'Chart Type', icon: BarChart3 },
    { id: 'axes', label: 'Axes', icon: Grid3x3 },
    { id: 'series', label: 'Data Series', icon: Layers },
    { id: 'style', label: 'Styling', icon: Palette },
    { id: 'data', label: 'Data', icon: Table }
  ]

  return (
    <div className="flex h-full">
      {/* Tab Navigation */}
      <div className="w-48 bg-gray-50 border-r border-gray-200 p-4">
        <div className="space-y-2">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-blue-100 text-blue-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Chart Editor</h2>
          <Button variant="ghost" onClick={onClose}>
            ✕
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'chart' && (
            <ChartTypePanel config={config} onConfigChange={onConfigChange} />
          )}
          {activeTab === 'axes' && (
            <AxesPanel config={config} onConfigChange={onConfigChange} />
          )}
          {activeTab === 'series' && (
            <SeriesPanel config={config} onSeriesChange={onSeriesChange} />
          )}
          {activeTab === 'style' && (
            <StylePanel config={config} onConfigChange={onConfigChange} />
          )}
          {activeTab === 'data' && (
            <DataPanel data={data} onSort={onSort} sortConfig={sortConfig} />
          )}
        </div>
      </div>
    </div>
  )
}

// Individual panel components
function ChartTypePanel({ config, onConfigChange }: { config: ChartConfiguration, onConfigChange: (updates: any) => void }) {
  const chartTypes = [
    { type: 'bar', label: 'Bar Chart', icon: BarChart3, subtypes: ['clustered', 'stacked', 'stacked100'] },
    { type: 'line', label: 'Line Chart', icon: TrendingUp, subtypes: ['straight', 'smooth', 'stepped'] },
    { type: 'area', label: 'Area Chart', icon: BarChart3, subtypes: ['straight', 'smooth', 'stacked'] },
    { type: 'donut', label: 'Donut Chart', icon: BarChart3, subtypes: ['standard'] },
    { type: 'scatter', label: 'Scatter Plot', icon: BarChart3, subtypes: ['standard'] },
    { type: 'combo', label: 'Combo Chart', icon: BarChart3, subtypes: ['bar-line'] }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Chart Type</h3>
        <div className="grid grid-cols-3 gap-3">
          {chartTypes.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              onClick={() => onConfigChange({ type: type as any })}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                config.type === type 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Icon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <div className="text-sm font-medium">{label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Chart Subtype</h3>
        <div className="space-y-2">
          {chartTypes.find(t => t.type === config.type)?.subtypes.map(subtype => (
            <label key={subtype} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                checked={config.subtype === subtype}
                onChange={() => onConfigChange({ subtype })}
                className="text-blue-600"
              />
              <span className="capitalize">{subtype.replace(/([A-Z])/g, ' $1')}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Orientation</h3>
        <div className="space-y-2">
          {['vertical', 'horizontal'].map(orientation => (
            <label key={orientation} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                checked={config.orientation === orientation}
                onChange={() => onConfigChange({ orientation })}
                className="text-blue-600"
              />
              <span className="capitalize">{orientation}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

function AxesPanel({ config, onConfigChange }: { config: ChartConfiguration, onConfigChange: (updates: any) => void }) {
  return (
    <div className="space-y-8">
      {/* X-Axis Configuration */}
      <div>
        <h3 className="text-lg font-semibold mb-4">X-Axis</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={config.xAxis.show}
              onChange={(e) => onConfigChange({ 
                xAxis: { ...config.xAxis, show: e.target.checked }
              })}
            />
            <span>Show X-Axis</span>
          </label>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={config.xAxis.title}
              onChange={(e) => onConfigChange({
                xAxis: { ...config.xAxis, title: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="X-Axis Title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label Rotation</label>
              <Slider.Root
                value={[config.xAxis.labelRotation]}
                onValueChange={([value]) => onConfigChange({
                  xAxis: { ...config.xAxis, labelRotation: value }
                })}
                max={90}
                min={-90}
                step={15}
                className="relative flex items-center w-full h-5"
              >
                <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                  <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb className="block w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md" />
              </Slider.Root>
              <div className="text-xs text-gray-500 mt-1">{config.xAxis.labelRotation}°</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grid Style</label>
              <select
                value={config.xAxis.gridStyle}
                onChange={(e) => onConfigChange({
                  xAxis: { ...config.xAxis, gridStyle: e.target.value as any }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Y-Axis Configuration */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Y-Axis</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={config.yAxis.show}
              onChange={(e) => onConfigChange({ 
                yAxis: { ...config.yAxis, show: e.target.checked }
              })}
            />
            <span>Show Y-Axis</span>
          </label>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={config.yAxis.title}
              onChange={(e) => onConfigChange({
                yAxis: { ...config.yAxis, title: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Y-Axis Title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label Format</label>
              <select
                value={config.yAxis.labelFormat}
                onChange={(e) => onConfigChange({
                  yAxis: { ...config.yAxis, labelFormat: e.target.value as any }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="number">Number</option>
                <option value="currency">Currency</option>
                <option value="percentage">Percentage</option>
                <option value="date">Date</option>
                <option value="scientific">Scientific</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={config.yAxis.gridLines}
                  onChange={(e) => onConfigChange({
                    yAxis: { ...config.yAxis, gridLines: e.target.checked }
                  })}
                />
                <span>Show Grid Lines</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SeriesPanel({ config, onSeriesChange }: { config: ChartConfiguration, onSeriesChange: (index: number, updates: any) => void }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Data Series</h3>
      <div className="space-y-4">
        {config.series.map((series, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">{series.name}</h4>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={series.visible}
                  onChange={(e) => onSeriesChange(index, { visible: e.target.checked })}
                />
                <span className="text-sm">Visible</span>
              </label>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={series.color}
                    onChange={(e) => onSeriesChange(index, { color: e.target.value })}
                    className="w-12 h-8 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={series.color}
                    onChange={(e) => onSeriesChange(index, { color: e.target.value })}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chart Type</label>
                <select
                  value={series.type}
                  onChange={(e) => onSeriesChange(index, { type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="bar">Bar</option>
                  <option value="line">Line</option>
                  <option value="area">Area</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Line Width</label>
                <Slider.Root
                  value={[series.lineWidth]}
                  onValueChange={([value]) => onSeriesChange(index, { lineWidth: value })}
                  max={10}
                  min={1}
                  step={1}
                  className="relative flex items-center w-full h-5"
                >
                  <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                    <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                  </Slider.Track>
                  <Slider.Thumb className="block w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md" />
                </Slider.Root>
                <div className="text-xs text-gray-500 mt-1">{series.lineWidth}px</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marker Shape</label>
                <select
                  value={series.markerShape}
                  onChange={(e) => onSeriesChange(index, { markerShape: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="circle">Circle</option>
                  <option value="square">Square</option>
                  <option value="diamond">Diamond</option>
                  <option value="triangle">Triangle</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StylePanel({ config, onConfigChange }: { config: ChartConfiguration, onConfigChange: (updates: any) => void }) {
  return (
    <div className="space-y-8">
      {/* Chart Area Styling */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Chart Area</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
              <input
                type="color"
                value={config.chartArea.backgroundColor}
                onChange={(e) => onConfigChange({
                  chartArea: { ...config.chartArea, backgroundColor: e.target.value }
                })}
                className="w-full h-10 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Border Color</label>
              <input
                type="color"
                value={config.chartArea.borderColor}
                onChange={(e) => onConfigChange({
                  chartArea: { ...config.chartArea, borderColor: e.target.value }
                })}
                className="w-full h-10 border border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Border Width</label>
              <Slider.Root
                value={[config.chartArea.borderWidth]}
                onValueChange={([value]) => onConfigChange({
                  chartArea: { ...config.chartArea, borderWidth: value }
                })}
                max={10}
                min={0}
                step={1}
                className="relative flex items-center w-full h-5"
              >
                <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                  <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb className="block w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md" />
              </Slider.Root>
              <div className="text-xs text-gray-500 mt-1">{config.chartArea.borderWidth}px</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Border Radius</label>
              <Slider.Root
                value={[config.chartArea.borderRadius]}
                onValueChange={([value]) => onConfigChange({
                  chartArea: { ...config.chartArea, borderRadius: value }
                })}
                max={20}
                min={0}
                step={1}
                className="relative flex items-center w-full h-5"
              >
                <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                  <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb className="block w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md" />
              </Slider.Root>
              <div className="text-xs text-gray-500 mt-1">{config.chartArea.borderRadius}px</div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.chartArea.shadow}
                onChange={(e) => onConfigChange({
                  chartArea: { ...config.chartArea, shadow: e.target.checked }
                })}
              />
              <span>Drop Shadow</span>
            </label>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.chartArea.gradient}
                onChange={(e) => onConfigChange({
                  chartArea: { ...config.chartArea, gradient: e.target.checked }
                })}
              />
              <span>Gradient Background</span>
            </label>
          </div>
        </div>
      </div>

      {/* Legend Styling */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Legend</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={config.legend.show}
              onChange={(e) => onConfigChange({
                legend: { ...config.legend, show: e.target.checked }
              })}
            />
            <span>Show Legend</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
            <select
              value={config.legend.position}
              onChange={(e) => onConfigChange({
                legend: { ...config.legend, position: e.target.value as any }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="topLeft">Top Left</option>
              <option value="topRight">Top Right</option>
              <option value="bottomLeft">Bottom Left</option>
              <option value="bottomRight">Bottom Right</option>
            </select>
          </div>
        </div>
      </div>

      {/* Animation Settings */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Animation</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={config.animation.enabled}
              onChange={(e) => onConfigChange({
                animation: { ...config.animation, enabled: e.target.checked }
              })}
            />
            <span>Enable Animation</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (ms)</label>
            <Slider.Root
              value={[config.animation.duration]}
              onValueChange={([value]) => onConfigChange({
                animation: { ...config.animation, duration: value }
              })}
              max={3000}
              min={100}
              step={100}
              className="relative flex items-center w-full h-5"
            >
              <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb className="block w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md" />
            </Slider.Root>
            <div className="text-xs text-gray-500 mt-1">{config.animation.duration}ms</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Easing</label>
            <select
              value={config.animation.easing}
              onChange={(e) => onConfigChange({
                animation: { ...config.animation, easing: e.target.value as any }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="linear">Linear</option>
              <option value="easeIn">Ease In</option>
              <option value="easeOut">Ease Out</option>
              <option value="easeInOut">Ease In Out</option>
              <option value="bounce">Bounce</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

function DataPanel({ 
  data, 
  onSort, 
  sortConfig 
}: { 
  data: any[], 
  onSort: (column: string) => void, 
  sortConfig: { column: string, direction: 'asc' | 'desc' } | null 
}) {
  const columns = data.length > 0 ? Object.keys(data[0]) : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Data Table</h3>
        <div className="text-sm text-gray-500">{data.length} rows × {columns.length} columns</div>
      </div>

      <div className="overflow-auto border border-gray-200 rounded-lg max-h-96">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map(column => (
                <th key={column} className="px-4 py-2 text-left">
                  <button
                    onClick={() => onSort(column)}
                    className="flex items-center gap-2 font-medium hover:text-blue-600 transition-colors"
                  >
                    {column}
                    {sortConfig?.column === column && (
                      sortConfig.direction === 'asc' 
                        ? <SortAsc className="w-3 h-3" />
                        : <SortDesc className="w-3 h-3" />
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 50).map((row, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                {columns.map(column => (
                  <td key={column} className="px-4 py-2">
                    {typeof row[column] === 'number' 
                      ? row[column].toLocaleString()
                      : String(row[column])
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length > 50 && (
        <div className="text-sm text-gray-500 text-center">
          Showing first 50 rows of {data.length} total rows
        </div>
      )}
    </div>
  )
}