'use client'

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import {
  AreaChart,
  BarChart,
  LineChart,
  DonutChart,
  ScatterChart,
  Card
} from '@tremor/react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Card as UICard } from '@/components/ui/Card'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import {
  Settings, Palette, Eye, EyeOff, Filter, TrendingUp, TrendingDown,
  BarChart3, PieChart, ScatterChart as ScatterIcon, LineChart as LineChartIcon, AreaChart as AreaChartIcon,
  Download, Upload, RotateCcw, Copy, Edit3, Type, Layout, Layers,
  ChevronDown, ChevronUp, Plus, Minus, Target, Zap, Lightbulb,
  Palette as PaletteIcon, Brush, Eye as EyeIcon, Grid3X3, AlignLeft,
  AlignCenter, AlignRight, Bold, Italic, Underline, Link, Image,
  Table, Database, FileText, Code, Sparkles, Wand2, Brain
} from 'lucide-react'

// Chart Types
export type ChartType = 
  | 'line' | 'bar' | 'area' | 'scatter' | 'donut' | 'pie' | 'heatmap' 
  | 'combo' | 'stacked' | 'grouped' | 'waterfall' | 'funnel' | 'radar'

// Data Structure
export interface ChartDataPoint {
  [key: string]: any
}

export interface ChartConfig {
  type: ChartType
  data: ChartDataPoint[]
  index: string
  categories: string[]
  colors: string[]
  height: number
  showAnimation: boolean
  showTooltip: boolean
  showLegend: boolean
  showGridLines: boolean
  valueFormatter?: (value: number) => string
  customTooltip?: (props: any) => React.ReactNode
  annotations?: ChartAnnotation[]
  filters?: ChartFilter[]
  title?: string
  subtitle?: string
  description?: string
  theme?: ChartTheme
  layout?: ChartLayout
  interactions?: ChartInteractions
}

export interface ChartAnnotation {
  id: string
  type: 'text' | 'line' | 'arrow' | 'shape'
  x: number
  y: number
  text?: string
  color?: string
  style?: 'solid' | 'dashed' | 'dotted'
  width?: number
}

export interface ChartFilter {
  field: string
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in'
  value: any
  label?: string
}

export interface ChartTheme {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
  grid: string
  border: string
  shadow: string
  fontFamily: string
  fontSize: number
  fontWeight: number
}

export interface ChartLayout {
  width: number
  height: number
  padding: number
  margin: number
  orientation: 'horizontal' | 'vertical'
  alignment: 'left' | 'center' | 'right'
  spacing: number
}

export interface ChartInteractions {
  enableZoom: boolean
  enablePan: boolean
  enableSelection: boolean
  enableHover: boolean
  enableClick: boolean
  enableDrag: boolean
}

// Professional Color Palettes
const PROFESSIONAL_PALETTES = {
  corporate: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f'],
  modern: ['#6366f1', '#14b8a6', '#f97316', '#ec4899', '#84cc16', '#06b6d4', '#8b5cf6', '#f59e0b'],
  elegant: ['#4f46e5', '#059669', '#dc2626', '#7c3aed', '#0891b2', '#65a30d', '#ea580c', '#be185d'],
  vibrant: ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'],
  monochrome: ['#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb', '#f3f4f6'],
  pastel: ['#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706', '#b45309', '#92400e']
}

// Chart Type Icons
const CHART_TYPE_ICONS = {
  line: LineChartIcon,
  bar: BarChart3,
  area: AreaChartIcon,
  scatter: ScatterIcon,
  donut: PieChart,
  pie: PieChart,
  heatmap: Grid3X3,
  combo: Layers,
  stacked: Layers,
  grouped: BarChart3,
  waterfall: TrendingUp,
  funnel: TrendingDown,
  radar: Target
}

interface AdvancedTremorChartStudioProps {
  initialConfig?: Partial<ChartConfig>
  onConfigChange?: (config: ChartConfig) => void
  onExport?: (config: ChartConfig) => void
  readOnly?: boolean
  className?: string
}

export function AdvancedTremorChartStudio({
  initialConfig,
  onConfigChange,
  onExport,
  readOnly = false,
  className = ''
}: AdvancedTremorChartStudioProps) {
  const [config, setConfig] = useState<ChartConfig>({
    type: 'bar',
    data: [],
    index: 'name',
    categories: [],
    colors: PROFESSIONAL_PALETTES.corporate,
    height: 400,
    showAnimation: true,
    showTooltip: true,
    showLegend: true,
    showGridLines: true,
    annotations: [],
    filters: [],
    theme: {
      primary: '#1f77b4',
      secondary: '#ff7f0e',
      accent: '#2ca02c',
      background: '#ffffff',
      text: '#1f2937',
      grid: '#e5e7eb',
      border: '#d1d5db',
      shadow: 'rgba(0, 0, 0, 0.1)',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: 14,
      fontWeight: 400
    },
    layout: {
      width: 800,
      height: 400,
      padding: 20,
      margin: 10,
      orientation: 'horizontal',
      alignment: 'center',
      spacing: 10
    },
    interactions: {
      enableZoom: true,
      enablePan: true,
      enableSelection: true,
      enableHover: true,
      enableClick: true,
      enableDrag: false
    },
    ...initialConfig
  })

  const [activeTab, setActiveTab] = useState('chart')
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(false)
  const [plainEnglishQuery, setPlainEnglishQuery] = useState('')
  const [isProcessingQuery, setIsProcessingQuery] = useState(false)
  const [selectedDataPoints, setSelectedDataPoints] = useState<any[]>([])
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })

  const chartRef = useRef<HTMLDivElement>(null)

  // Process plain English queries
  const processPlainEnglishQuery = useCallback(async (query: string) => {
    if (!query.trim()) return

    setIsProcessingQuery(true)
    try {
      // Send query to OpenAI for interpretation
      const response = await fetch('/api/openai/chart-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          currentConfig: config,
          data: config.data
        })
      })

      const result = await response.json()
      if (result.success && result.config) {
        setConfig(prev => ({ ...prev, ...result.config }))
        toast.success('Chart updated based on your request!')
      }
    } catch (error) {
      console.error('Error processing query:', error)
      toast.error('Failed to process your request')
    } finally {
      setIsProcessingQuery(false)
    }
  }, [config])

  // Chart rendering based on type
  const renderChart = useMemo(() => {
    const commonProps = {
      data: config.data,
      index: config.index,
      categories: config.categories,
      colors: config.colors,
      height: config.height,
      showAnimation: config.showAnimation,
      showTooltip: config.showTooltip,
      showLegend: config.showLegend,
      showGridLines: config.showGridLines,
      valueFormatter: config.valueFormatter,
      customTooltip: config.customTooltip
    }

    switch (config.type) {
      case 'line':
        return <LineChart {...commonProps} />
      case 'area':
        return <AreaChart {...commonProps} />
      case 'scatter':
        return (
          <ScatterChart
            data={config.data}
            category={config.index}
            x={config.categories[0]}
            y={config.categories[1]}
            size={config.categories[2]}
            colors={config.colors}
            showAnimation={config.showAnimation}
            showTooltip={config.showTooltip}
            showLegend={config.showLegend}
          />
        )
      case 'donut':
      case 'pie':
        return (
          <DonutChart
            data={config.data}
            category={config.categories[0]}
            index={config.index}
            colors={config.colors}
            showAnimation={config.showAnimation}
            showTooltip={config.showTooltip}
            showLabel={true}
          />
        )
      case 'combo':
        return (
          <div className="relative">
            <BarChart {...commonProps} />
            <div className="absolute inset-0 pointer-events-none">
              <LineChart
                data={config.data}
                index={config.index}
                categories={[config.categories[config.categories.length - 1]]}
                colors={['#ef4444']}
                showLegend={false}
                className="opacity-80"
              />
            </div>
          </div>
        )
      case 'stacked':
        return <BarChart {...commonProps} stack={true} />
      default:
        return <BarChart {...commonProps} />
    }
  }, [config])

  // Advanced customization panel
  const AdvancedCustomizationPanel = () => (
    <AnimatePresence>
      {showAdvancedPanel && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Data Configuration */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Data</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Index Field</label>
                  <select
                    value={config.index}
                    onChange={(e) => setConfig(prev => ({ ...prev, index: e.target.value }))}
                    className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  >
                    {config.data.length > 0 && Object.keys(config.data[0]).map(key => (
                      <option key={key} value={key}>{key}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Categories</label>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {config.data.length > 0 && Object.keys(config.data[0]).map(key => (
                      <label key={key} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={config.categories.includes(key)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setConfig(prev => ({
                                ...prev,
                                categories: [...prev.categories, key]
                              }))
                            } else {
                              setConfig(prev => ({
                                ...prev,
                                categories: prev.categories.filter(cat => cat !== key)
                              }))
                            }
                          }}
                          className="mr-2"
                        />
                        {key}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Style Configuration */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Style</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Color Palette</label>
                  <div className="grid grid-cols-2 gap-1">
                    {Object.entries(PROFESSIONAL_PALETTES).map(([name, colors]) => (
                      <button
                        key={name}
                        onClick={() => setConfig(prev => ({ ...prev, colors }))}
                        className={`p-1 rounded border text-xs ${
                          config.colors === colors ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                        }`}
                      >
                        <div className="flex space-x-1 mb-1">
                          {colors.slice(0, 3).map((color, idx) => (
                            <div
                              key={idx}
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        {name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Height: {config.height}px</label>
                  <input
                    type="range"
                    min="200"
                    max="800"
                    value={config.height}
                    onChange={(e) => setConfig(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                <div className="space-y-1">
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={config.showAnimation}
                      onChange={(e) => setConfig(prev => ({ ...prev, showAnimation: e.target.checked }))}
                      className="mr-2"
                    />
                    Animation
                  </label>
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={config.showTooltip}
                      onChange={(e) => setConfig(prev => ({ ...prev, showTooltip: e.target.checked }))}
                      className="mr-2"
                    />
                    Tooltip
                  </label>
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={config.showLegend}
                      onChange={(e) => setConfig(prev => ({ ...prev, showLegend: e.target.checked }))}
                      className="mr-2"
                    />
                    Legend
                  </label>
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={config.showGridLines}
                      onChange={(e) => setConfig(prev => ({ ...prev, showGridLines: e.target.checked }))}
                      className="mr-2"
                    />
                    Grid Lines
                  </label>
                </div>
              </div>
            </div>

            {/* Layout Configuration */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Layout</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Orientation</label>
                  <select
                    value={config.layout?.orientation}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      layout: { ...prev.layout!, orientation: e.target.value as 'horizontal' | 'vertical' }
                    }))}
                    className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  >
                    <option value="horizontal">Horizontal</option>
                    <option value="vertical">Vertical</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Alignment</label>
                  <div className="flex space-x-1">
                    {['left', 'center', 'right'].map(align => (
                      <button
                        key={align}
                        onClick={() => setConfig(prev => ({
                          ...prev,
                          layout: { ...prev.layout!, alignment: align as 'left' | 'center' | 'right' }
                        }))}
                        className={`p-1 rounded border ${
                          config.layout?.alignment === align ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                        }`}
                      >
                        {align === 'left' && <AlignLeft className="w-3 h-3" />}
                        {align === 'center' && <AlignCenter className="w-3 h-3" />}
                        {align === 'right' && <AlignRight className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Title</label>
                  <input
                    type="text"
                    value={config.title || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    placeholder="Chart title"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Subtitle</label>
                  <input
                    type="text"
                    value={config.subtitle || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, subtitle: e.target.value }))}
                    className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    placeholder="Chart subtitle"
                  />
                </div>
              </div>
            </div>

            {/* Interactions Configuration */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Interactions</h4>
              <div className="space-y-2">
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={config.interactions?.enableZoom}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      interactions: { ...prev.interactions!, enableZoom: e.target.checked }
                    }))}
                    className="mr-2"
                  />
                  Zoom
                </label>
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={config.interactions?.enablePan}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      interactions: { ...prev.interactions!, enablePan: e.target.checked }
                    }))}
                    className="mr-2"
                  />
                  Pan
                </label>
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={config.interactions?.enableSelection}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      interactions: { ...prev.interactions!, enableSelection: e.target.checked }
                    }))}
                    className="mr-2"
                  />
                  Selection
                </label>
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={config.interactions?.enableHover}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      interactions: { ...prev.interactions!, enableHover: e.target.checked }
                    }))}
                    className="mr-2"
                  />
                  Hover
                </label>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Chart Type Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {Object.entries(CHART_TYPE_ICONS).map(([type, Icon]) => (
            <button
              key={type}
              onClick={() => setConfig(prev => ({ ...prev, type: type as ChartType }))}
              className={`p-2 rounded-lg border transition-all ${
                config.type === type
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              title={type.charAt(0).toUpperCase() + type.slice(1)}
            >
              <Icon className="w-5 h-5" />
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAdvancedPanel(!showAdvancedPanel)}
          >
            <Settings className="w-4 h-4 mr-1" />
            {showAdvancedPanel ? 'Hide' : 'Advanced'}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onExport?.(config)}
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Plain English Query */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium">Plain English Chart Editor</span>
        </div>
        <div className="flex gap-2">
          <Input
            value={plainEnglishQuery}
            onChange={(e) => setPlainEnglishQuery(e.target.value)}
            placeholder="e.g., 'Make this a line chart with blue colors' or 'Add a trend line and show percentages'"
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && processPlainEnglishQuery(plainEnglishQuery)}
          />
          <Button
            onClick={() => processPlainEnglishQuery(plainEnglishQuery)}
            disabled={isProcessingQuery || !plainEnglishQuery.trim()}
          >
            {isProcessingQuery ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Chart Container */}
      <div
        ref={chartRef}
        className="relative bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
        style={{
          transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
          transformOrigin: 'top left'
        }}
      >
        {config.title && (
          <div className="mb-4 text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{config.title}</h3>
            {config.subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{config.subtitle}</p>
            )}
          </div>
        )}

        {renderChart}

        {/* Annotations Overlay */}
        {config.annotations?.map((annotation) => (
          <div
            key={annotation.id}
            className="absolute bg-yellow-200 dark:bg-yellow-800 text-black dark:text-white text-xs p-2 rounded shadow-lg border border-yellow-400 pointer-events-none"
            style={{
              left: `${annotation.x}%`,
              top: `${annotation.y}%`,
              transform: 'translate(-50%, -100%)',
              zIndex: 10
            }}
          >
            {annotation.text}
          </div>
        ))}
      </div>

      {/* Advanced Customization Panel */}
      <AdvancedCustomizationPanel />

      {/* Zoom Controls */}
      {config.interactions?.enableZoom && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.1))}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {Math.round(zoomLevel * 100)}%
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.1))}
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setZoomLevel(1)
              setPanOffset({ x: 0, y: 0 })
            }}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
} 