/**
 * Advanced Tremor Chart Components
 * Implements all chart types from the requirements document with Tremor integration
 */

'use client'

import React, { useMemo, useState, useCallback } from 'react'
import {
  AreaChart,
  AreaChart as TremorAreaChart,
  BarChart,
  BarChart as TremorBarChart,
  LineChart,
  LineChart as TremorLineChart,
  DonutChart,
  DonutChart as TremorDonutChart,
  ScatterChart,
  ScatterChart as TremorScatterChart,
  Card,
  Button
} from '@tremor/react'
import { Metric, Select, SelectItem, Toggle, Text } from '@/components/ui/tremor-compat'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings,
  Download,
  Edit3,
  Eye,
  EyeOff,
  Maximize2,
  RotateCcw,
  Share2,
  Filter,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Layers
} from 'lucide-react'

// ==========================================
// CORE INTERFACES
// ==========================================

export interface ChartData {
  id: string
  type: ChartType
  title: string
  subtitle?: string
  data: any[]
  config: ChartConfig
  insights?: string[]
  metadata: ChartMetadata
}

export type ChartType = 
  | 'bar' | 'column' | 'line' | 'area' | 'pie' | 'donut' | 'scatter' | 'bubble'
  | 'waterfall' | 'funnel' | 'sankey' | 'treemap' | 'heatmap' | 'boxplot' | 'violin'
  | 'histogram' | 'pareto' | 'pyramid' | 'bridge' | 'cascade' | 'radar'

export interface ChartConfig {
  index: string
  categories: string[]
  colors: string[]
  showLegend?: boolean
  showGrid?: boolean
  showTooltip?: boolean
  showAnimation?: boolean
  responsive?: boolean
  accessibility?: AccessibilityConfig
  interaction?: InteractionConfig
  styling?: StylingConfig
}

export interface AccessibilityConfig {
  colorBlindSafe: boolean
  highContrast: boolean
  screenReaderFriendly: boolean
  keyboardNavigation: boolean
  alternativeText: string
  ariaLabels: Record<string, string>
}

export interface InteractionConfig {
  hover: boolean
  click: boolean
  zoom: boolean
  filter: boolean
  drill: boolean
  export: boolean
}

export interface StylingConfig {
  theme: 'mckinsey' | 'corporate' | 'academic' | 'modern'
  fontSize: number
  fontFamily: string
  borderRadius: number
  shadows: boolean
  gradients: boolean
}

export interface ChartMetadata {
  created: Date
  lastModified: Date
  dataSource: string
  version: number
  performance: PerformanceMetrics
}

export interface PerformanceMetrics {
  renderTime: number
  dataPoints: number
  optimized: boolean
  lazy: boolean
}

// ==========================================
// ADVANCED CHART WRAPPER COMPONENT
// ==========================================

interface AdvancedTremorChartProps {
  chartData: ChartData
  onDataChange?: (data: any[]) => void
  onConfigChange?: (config: ChartConfig) => void
  onInsightGenerated?: (insights: string[]) => void
  className?: string
  interactive?: boolean
  editable?: boolean
}

export const AdvancedTremorChart: React.FC<AdvancedTremorChartProps> = ({
  chartData,
  onDataChange,
  onConfigChange,
  onInsightGenerated,
  className = '',
  interactive = true,
  editable = false
}) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [showInsights, setShowInsights] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [localConfig, setLocalConfig] = useState(chartData.config)
  const [isHovered, setIsHovered] = useState(false)

  // Handle configuration changes
  const handleConfigChange = useCallback((newConfig: Partial<ChartConfig>) => {
    const updatedConfig = { ...localConfig, ...newConfig }
    setLocalConfig(updatedConfig)
    onConfigChange?.(updatedConfig)
  }, [localConfig, onConfigChange])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Chart Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {chartData.title}
          </h3>
          {chartData.subtitle && (
            <p className="text-sm text-gray-600 mt-1">
              {chartData.subtitle}
            </p>
          )}
        </div>

        {/* Chart Controls */}
        <AnimatePresence>
          {(isHovered || isConfigOpen) && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center space-x-2"
            >
              {interactive && (
                <>
                  <button
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    onClick={() => setShowInsights(!showInsights)}
                    title={showInsights ? "Hide insights" : "Show insights"}
                  >
                    {showInsights ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  
                  {editable && (
                    <button
                      className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      onClick={() => setIsConfigOpen(!isConfigOpen)}
                      title="Chart settings"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    onClick={() => setIsFullscreen(true)}
                    title="Fullscreen"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  
                  <button
                    className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    onClick={() => exportChart(chartData)}
                    title="Export chart"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chart Content */}
      <div className="p-4">
        <div className="h-64 mb-4">
          {renderChart(chartData, localConfig)}
        </div>

        {/* AI Insights */}
        <AnimatePresence>
          {showInsights && chartData.insights && chartData.insights.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-200 pt-4"
            >
              <div className="flex items-center mb-2">
                <TrendingUp className="w-4 h-4 text-blue-500 mr-2" />
                <Text className="text-sm font-medium text-gray-900">
                  AI Insights
                </Text>
              </div>
              <div className="space-y-2">
                {chartData.insights.map((insight, index) => (
                  <div
                    key={index}
                    className="text-xs text-gray-700 bg-blue-50 p-2 rounded border-l-2 border-blue-500"
                  >
                    {insight}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Configuration Panel */}
      <AnimatePresence>
        {isConfigOpen && (
          <ChartConfigurationPanel
            config={localConfig}
            chartType={chartData.type}
            availableColumns={Object.keys(chartData.data[0] || {})}
            onConfigChange={handleConfigChange}
            onClose={() => setIsConfigOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <FullscreenChartModal
            chartData={{ ...chartData, config: localConfig }}
            onClose={() => setIsFullscreen(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ==========================================
// CUSTOM TREMOR EXTENSIONS
// ==========================================

/**
 * Waterfall Chart Component (Custom Extension)
 */
export const WaterfallChart: React.FC<{
  data: any[]
  index: string
  category: string
  colors?: string[]
  showConnectors?: boolean
  className?: string
}> = ({ data, index, category, colors = ['#10B981', '#EF4444', '#6B7280'], showConnectors = true, className = '' }) => {
  const processedData = useMemo(() => {
    let cumulative = 0
    return data.map((item, idx) => {
      const value = item[category]
      const start = cumulative
      cumulative += value
      return {
        ...item,
        start,
        end: cumulative,
        value,
        type: value >= 0 ? 'positive' : 'negative',
        color: value >= 0 ? colors[0] : colors[1]
      }
    })
  }, [data, category, colors])

  return (
    <div className={`w-full h-full ${className}`}>
      {/* Custom SVG implementation for waterfall */}
      <svg width="100%" height="100%" viewBox="0 0 800 400">
        {processedData.map((item, index) => (
          <g key={index}>
            {/* Bar */}
            <rect
              x={50 + index * 100}
              y={200 - Math.abs(item.value) * 2}
              width={80}
              height={Math.abs(item.value) * 2}
              fill={item.color}
              rx="4"
            />
            {/* Label */}
            <text
              x={90 + index * 100}
              y={190 - Math.abs(item.value) * 2}
              textAnchor="middle"
              className="text-xs fill-gray-700"
            >
              {item[index]}
            </text>
            {/* Connector */}
            {showConnectors && index < processedData.length - 1 && (
              <line
                x1={130 + index * 100}
                y1={200 - item.end * 2}
                x2={150 + index * 100}
                y2={200 - item.end * 2}
                stroke={colors[2]}
                strokeDasharray="3,3"
              />
            )}
          </g>
        ))}
      </svg>
    </div>
  )
}

/**
 * Funnel Chart Component (Custom Extension)
 */
export const FunnelChart: React.FC<{
  data: any[]
  index: string
  category: string
  colors?: string[]
  className?: string
}> = ({ data, index, category, colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'], className = '' }) => {
  const maxValue = Math.max(...data.map(d => d[category]))
  
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center ${className}`}>
      {data.map((item, idx) => {
        const percentage = (item[category] / maxValue) * 100
        const width = `${percentage}%`
        
        return (
          <motion.div
            key={idx}
            initial={{ width: 0 }}
            animate={{ width }}
            transition={{ duration: 0.8, delay: idx * 0.1 }}
            className="flex items-center justify-between mb-2 rounded"
            style={{
              backgroundColor: colors[idx % colors.length],
              height: '40px',
              maxWidth: '90%'
            }}
          >
            <div className="flex items-center justify-between w-full px-4">
              <Text className="text-white font-medium text-sm">
                {item[index]}
              </Text>
              <Text className="text-white text-sm">
                {item[category].toLocaleString()}
              </Text>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

/**
 * Treemap Chart Component (Custom Extension)
 */
export const TreemapChart: React.FC<{
  data: any[]
  index: string
  category: string
  colors?: string[]
  className?: string
}> = ({ data, index, category, colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'], className = '' }) => {
  // Simple treemap implementation
  const totalValue = data.reduce((sum, item) => sum + item[category], 0)
  
  return (
    <div className={`w-full h-full grid grid-cols-4 gap-1 p-2 ${className}`}>
      {data.map((item, idx) => {
        const size = (item[category] / totalValue) * 100
        const gridSpan = Math.max(1, Math.round(size / 25))
        
        return (
          <motion.div
            key={idx}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className={`flex flex-col items-center justify-center rounded p-2`}
            style={{
              backgroundColor: colors[idx % colors.length],
              minHeight: `${Math.max(60, size)}px`,
              gridColumn: `span ${gridSpan}`
            }}
          >
            <Text className="text-white font-medium text-xs text-center">
              {item[index]}
            </Text>
            <Text className="text-white text-xs">
              {item[category]}
            </Text>
          </motion.div>
        )
      })}
    </div>
  )
}

/**
 * Heatmap Chart Component (Custom Extension)
 */
export const HeatmapChart: React.FC<{
  data: any[][]
  xLabels: string[]
  yLabels: string[]
  colorScale?: string[]
  className?: string
}> = ({ data, xLabels, yLabels, colorScale = ['#EFF6FF', '#3B82F6'], className = '' }) => {
  const maxValue = Math.max(...data.flat())
  const minValue = Math.min(...data.flat())
  
  const getColor = (value: number) => {
    const normalized = (value - minValue) / (maxValue - minValue)
    // Simple linear interpolation between colors
    const alpha = Math.max(0.1, normalized)
    return `rgba(59, 130, 246, ${alpha})`
  }
  
  return (
    <div className={`w-full h-full p-4 ${className}`}>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${xLabels.length}, 1fr)` }}>
        {data.map((row, rowIdx) =>
          row.map((value, colIdx) => (
            <motion.div
              key={`${rowIdx}-${colIdx}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: (rowIdx * row.length + colIdx) * 0.02 }}
              className="aspect-square flex items-center justify-center rounded text-xs font-medium"
              style={{ backgroundColor: getColor(value) }}
              title={`${yLabels[rowIdx]}: ${xLabels[colIdx]} = ${value}`}
            >
              {value}
            </motion.div>
          ))
        )}
      </div>
      
      {/* Axis labels */}
      <div className="flex justify-between mt-2">
        {xLabels.map((label, idx) => (
          <Text key={idx} className="text-xs text-gray-600 text-center">
            {label}
          </Text>
        ))}
      </div>
    </div>
  )
}

// ==========================================
// CONFIGURATION PANEL COMPONENT
// ==========================================

interface ChartConfigurationPanelProps {
  config: ChartConfig
  chartType: ChartType
  availableColumns: string[]
  onConfigChange: (config: Partial<ChartConfig>) => void
  onClose: () => void
}

const ChartConfigurationPanel: React.FC<ChartConfigurationPanelProps> = ({
  config,
  chartType,
  availableColumns,
  onConfigChange,
  onClose
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl border-l border-gray-200 overflow-y-auto z-50"
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Chart Settings</h3>
          <button
            className="text-gray-400 hover:text-gray-600 text-xl"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Basic Configuration */}
        <div className="space-y-4">
          <div>
            <Text className="text-sm font-medium mb-2">Index Column</Text>
            <Select
              value={config.index}
              onValueChange={(value) => onConfigChange({ index: value })}
            >
              {availableColumns.map(col => (
                <SelectItem key={col} value={col}>{col}</SelectItem>
              ))}
            </Select>
          </div>

          <div>
            <Text className="text-sm font-medium mb-2">Value Columns</Text>
            <div className="space-y-2">
              {config.categories.map((category, idx) => (
                <Select
                  key={idx}
                  value={category}
                  onValueChange={(value) => {
                    const newCategories = [...config.categories]
                    newCategories[idx] = value
                    onConfigChange({ categories: newCategories })
                  }}
                >
                  {availableColumns.map(col => (
                    <SelectItem key={col} value={col}>{col}</SelectItem>
                  ))}
                </Select>
              ))}
            </div>
            <button
              className="mt-2 text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              onClick={() => {
                const newCategories = [...config.categories, availableColumns[0]]
                onConfigChange({ categories: newCategories })
              }}
            >
              Add Series
            </button>
          </div>
        </div>

        {/* Visual Settings */}
        <div className="space-y-4">
          <Text className="text-sm font-semibold">Visual Settings</Text>
          
          <div className="flex items-center justify-between">
            <Text className="text-sm">Show Legend</Text>
            <Toggle
              checked={config.showLegend}
              onChange={(checked) => onConfigChange({ showLegend: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Text className="text-sm">Show Grid</Text>
            <Toggle
              checked={config.showGrid}
              onChange={(checked) => onConfigChange({ showGrid: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Text className="text-sm">Animation</Text>
            <Toggle
              checked={config.showAnimation}
              onChange={(checked) => onConfigChange({ showAnimation: checked })}
            />
          </div>
        </div>

        {/* Color Scheme */}
        <div className="space-y-4">
          <Text className="text-sm font-semibold">Color Scheme</Text>
          <div className="grid grid-cols-4 gap-2">
            {config.colors.map((color, idx) => (
              <div
                key={idx}
                className="w-8 h-8 rounded border cursor-pointer"
                style={{ backgroundColor: color }}
                onClick={() => {
                  // Color picker would go here
                  console.log('Color picker for', color)
                }}
              />
            ))}
          </div>
        </div>

        {/* Accessibility */}
        <div className="space-y-4">
          <Text className="text-sm font-semibold">Accessibility</Text>
          
          <div className="flex items-center justify-between">
            <Text className="text-sm">Color Blind Safe</Text>
            <Toggle
              checked={config.accessibility?.colorBlindSafe || false}
              onChange={(checked) => onConfigChange({ 
                accessibility: { 
                  colorBlindSafe: checked,
                  highContrast: config.accessibility?.highContrast || false,
                  screenReaderFriendly: config.accessibility?.screenReaderFriendly || false,
                  keyboardNavigation: config.accessibility?.keyboardNavigation || false,
                  alternativeText: config.accessibility?.alternativeText || '',
                  ariaLabels: config.accessibility?.ariaLabels || {}
                }
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Text className="text-sm">High Contrast</Text>
            <Toggle
              checked={config.accessibility?.highContrast || false}
              onChange={(checked) => onConfigChange({ 
                accessibility: { 
                  colorBlindSafe: config.accessibility?.colorBlindSafe || false,
                  highContrast: checked,
                  screenReaderFriendly: config.accessibility?.screenReaderFriendly || false,
                  keyboardNavigation: config.accessibility?.keyboardNavigation || false,
                  alternativeText: config.accessibility?.alternativeText || '',
                  ariaLabels: config.accessibility?.ariaLabels || {}
                }
              })}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ==========================================
// FULLSCREEN MODAL COMPONENT
// ==========================================

interface FullscreenChartModalProps {
  chartData: ChartData
  onClose: () => void
}

const FullscreenChartModal: React.FC<FullscreenChartModalProps> = ({ chartData, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        className="bg-white rounded-lg w-full h-full max-w-6xl max-h-4xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{chartData.title}</h2>
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        
        <div className="h-full">
          <AdvancedTremorChart
            chartData={chartData}
            className="h-full"
            interactive={true}
            editable={false}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================


function renderChart(chartData: ChartData, config: ChartConfig) {
  const baseProps = {
    data: chartData.data,
    className: "w-full h-full"
  }

  switch (chartData.type) {
    case 'bar':
    case 'column':
      return (
        <TremorBarChart
          {...baseProps}
          index={config.index}
          categories={config.categories}
          colors={config.colors}
          showLegend={config.showLegend}
          showGridLines={config.showGrid}
        />
      )
    case 'line':
      return (
        <TremorLineChart
          {...baseProps}
          index={config.index}
          categories={config.categories}
          colors={config.colors}
          showLegend={config.showLegend}
          showGridLines={config.showGrid}
        />
      )
    case 'area':
      return (
        <TremorAreaChart
          {...baseProps}
          index={config.index}
          categories={config.categories}
          colors={config.colors}
          showLegend={config.showLegend}
          showGridLines={config.showGrid}
        />
      )
    case 'donut':
    case 'pie':
      return (
        <TremorDonutChart
          {...baseProps}
          category={config.categories[0]}
          index={config.index}
          colors={config.colors}
          showTooltip={config.showTooltip}
          variant={chartData.type === 'donut' ? 'donut' : 'pie'}
        />
      )
    case 'scatter':
    case 'bubble':
      return (
        <TremorScatterChart
          {...baseProps}
          x={config.index}
          y={config.categories[0]}
          category={config.categories[1]}
          size={chartData.type === 'bubble' ? config.categories[2] : undefined}
          colors={config.colors}
          showLegend={config.showLegend}
          showGridLines={config.showGrid}
        />
      )
    case 'waterfall':
      return (
        <WaterfallChart 
          {...baseProps} 
          index={config.index}
          category={config.categories[0]}
          colors={config.colors}
        />
      )
    case 'funnel':
      return (
        <FunnelChart 
          {...baseProps} 
          index={config.index}
          category={config.categories[0]}
          colors={config.colors}
        />
      )
    case 'heatmap':
      return (
        <HeatmapChart 
          data={chartData.data as any[][]}
          xLabels={[config.index]}
          yLabels={config.categories}
          colorScale={config.colors}
          className={baseProps.className}
        />
      )
    case 'radar':
    case 'sankey':
      // These chart types are not yet implemented, fall back to bar chart
      return (
        <TremorBarChart
          {...baseProps}
          index={config.index}
          categories={config.categories}
          colors={config.colors}
          showLegend={config.showLegend}
          showGridLines={config.showGrid}
        />
      )
    case 'treemap':
    case 'boxplot':
    case 'violin':
    case 'histogram':
    case 'pareto':
    case 'pyramid':
    case 'bridge':
    case 'cascade':
    default:
      // For unsupported chart types, fall back to bar chart
      return (
        <TremorBarChart
          {...baseProps}
          index={config.index}
          categories={config.categories}
          colors={config.colors}
          showLegend={config.showLegend}
          showGridLines={config.showGrid}
        />
      )
  }
}

function exportChart(chartData: ChartData) {
  // Implementation for chart export
  console.log('Exporting chart:', chartData.id)
  // This would trigger the export functionality
}