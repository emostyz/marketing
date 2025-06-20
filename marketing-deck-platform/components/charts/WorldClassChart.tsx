'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  AreaChart,
  BarChart,
  LineChart,
  DonutChart,
  ScatterChart,
  Card,
  Title,
  Text,
  Flex,
  Metric,
  Badge,
  Callout
} from '@tremor/react'
import { Button } from '@/components/ui/Button'
import { 
  Settings, 
  Eye, 
  EyeOff, 
  Download, 
  Maximize2, 
  Filter,
  TrendingUp,
  BarChart3,
  Info,
  RefreshCw,
  Layers,
  PieChart
} from 'lucide-react'

interface AdvancedChartProps {
  data: any[]
  chartType: 'area' | 'bar' | 'line' | 'donut' | 'scatter' | 'heatmap' | 'treemap' | 'funnel' | 'waterfall'
  title: string
  subtitle?: string
  index: string
  categories: string[]
  colors?: string[]
  height?: number
  showCustomization?: boolean
  onDataChange?: (newData: any[]) => void
  businessImpact?: 'transformational' | 'significant' | 'moderate' | 'informational'
  actionability?: 'immediate' | 'short-term' | 'long-term' | 'monitoring'
  priority?: 'critical' | 'high' | 'medium' | 'low'
  confidence?: number
  advanced?: {
    trendlines?: boolean
    annotations?: Array<{text: string; position: any}>
    drillDown?: boolean
    filters?: string[]
    aggregations?: string[]
    comparisons?: string[]
  }
}

const PROFESSIONAL_COLOR_PALETTES = {
  blue: ['blue', 'sky', 'indigo', 'slate', 'cyan'],
  emerald: ['emerald', 'teal', 'green', 'lime', 'mint'],
  violet: ['violet', 'purple', 'fuchsia', 'pink', 'rose'],
  amber: ['amber', 'orange', 'yellow', 'lime', 'emerald'],
  corporate: ['slate', 'blue', 'emerald', 'violet', 'amber'],
  analytics: ['blue', 'emerald', 'violet', 'amber', 'rose'],
  executive: ['slate', 'blue', 'emerald', 'amber', 'red']
}

const CHART_TYPE_CONFIGS = {
  bar: { icon: BarChart3, label: 'Bar Chart', bestFor: 'Comparisons' },
  line: { icon: TrendingUp, label: 'Line Chart', bestFor: 'Trends' },
  area: { icon: Layers, label: 'Area Chart', bestFor: 'Volume over time' },
  donut: { icon: PieChart, label: 'Donut Chart', bestFor: 'Proportions' },
  scatter: { icon: RefreshCw, label: 'Scatter Plot', bestFor: 'Correlations' }
}

export function WorldClassChart({
  data,
  chartType,
  title,
  subtitle,
  index,
  categories,
  colors = ['blue', 'emerald', 'violet'],
  height = 80,
  showCustomization = true,
  onDataChange,
  businessImpact = 'significant',
  actionability = 'immediate',
  priority = 'high',
  confidence = 85,
  advanced = {}
}: AdvancedChartProps) {
  const [currentColors, setCurrentColors] = useState(colors)
  const [currentCategories, setCurrentCategories] = useState(categories)
  const [currentChartType, setCurrentChartType] = useState(chartType)
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    categories.reduce((acc, cat) => ({ ...acc, [cat]: true }), {})
  )
  const [showSettings, setShowSettings] = useState(false)
  const [chartHeight, setChartHeight] = useState(height)
  const [selectedPalette, setSelectedPalette] = useState('analytics')
  const [showTrendlines, setShowTrendlines] = useState(advanced.trendlines || false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [drillDownLevel, setDrillDownLevel] = useState(0)
  const chartRef = useRef<HTMLDivElement>(null)

  // Filter data based on visible columns and active filters
  const filteredCategories = currentCategories.filter(cat => visibleColumns[cat])
  const filteredColors = filteredCategories.map((cat, idx) => 
    currentColors[currentCategories.indexOf(cat)] || currentColors[idx % currentColors.length]
  )

  // Calculate summary statistics
  const summaryStats = calculateSummaryStats(data, filteredCategories)

  const renderChart = () => {
    const commonProps = {
      data: processDataForVisualization(data, activeFilters),
      index,
      categories: filteredCategories,
      colors: filteredColors,
      height: chartHeight,
      showAnimation: true,
      showTooltip: true,
      showLegend: filteredCategories.length > 1,
      showGridLines: true,
      enableLegendSlider: filteredCategories.length > 5,
      className: "mt-4"
    }

    switch (currentChartType) {
      case 'area':
        return (
          <AreaChart 
            {...commonProps}
            stack={true}
            curveType="monotone"
            connectNulls={false}
          />
        )
      case 'line':
        return (
          <LineChart 
            {...commonProps}
            curveType="monotone"
            connectNulls={false}
          />
        )
      case 'scatter':
        return (
          <ScatterChart
            {...commonProps}
            category={filteredCategories[0]}
            x={filteredCategories[1] || index}
            y={filteredCategories[0]}
            size={filteredCategories[2]}
          />
        )
      case 'donut':
        return (
          <DonutChart
            data={data}
            category={filteredCategories[0]}
            index={index}
            colors={filteredColors}
            height={chartHeight}
            showAnimation={true}
            showTooltip={true}
            showLabel={true}
            variant="donut"
          />
        )
      default:
        return (
          <BarChart 
            {...commonProps}
            layout="vertical"
            stack={false}
          />
        )
    }
  }

  const handleColorPaletteChange = (palette: string) => {
    setSelectedPalette(palette)
    setCurrentColors(PROFESSIONAL_COLOR_PALETTES[palette as keyof typeof PROFESSIONAL_COLOR_PALETTES])
  }

  const exportChart = () => {
    if (chartRef.current) {
      // Implement chart export functionality
      console.log('Exporting chart...')
    }
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      critical: 'red',
      high: 'orange',
      medium: 'yellow',
      low: 'gray'
    }
    return colors[priority as keyof typeof colors] || 'gray'
  }

  const getImpactColor = (impact: string) => {
    const colors = {
      transformational: 'purple',
      significant: 'blue',
      moderate: 'green',
      informational: 'gray'
    }
    return colors[impact as keyof typeof colors] || 'gray'
  }

  return (
    <Card className="p-6 bg-gray-800/50 border-gray-700" ref={chartRef}>
      {/* Chart Header with Metadata */}
      <div className="mb-6">
        <Flex justifyContent="start" alignItems="start" className="mb-4">
          <div className="flex-1">
            <Title className="text-white text-xl mb-2">{title}</Title>
            {subtitle && <Text className="text-gray-400 mb-3">{subtitle}</Text>}
            
            {/* Business Context Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge 
                color={getPriorityColor(priority)} 
                size="sm"
                className="capitalize"
              >
                {priority} Priority
              </Badge>
              <Badge 
                color={getImpactColor(businessImpact)} 
                size="sm"
                className="capitalize"
              >
                {businessImpact} Impact
              </Badge>
              <Badge 
                color="blue" 
                size="sm"
                className="capitalize"
              >
                {actionability} Action
              </Badge>
              <Badge 
                color="emerald" 
                size="sm"
              >
                {confidence}% Confidence
              </Badge>
            </div>
          </div>
          
          {showCustomization && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={exportChart}
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          )}
        </Flex>

        {/* Summary Statistics */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          {Object.entries(summaryStats).map(([key, value]) => (
            <div key={key} className="text-center">
              <Metric className="text-white text-lg">{value}</Metric>
              <Text className="text-gray-400 text-xs capitalize">{key}</Text>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Customization Panel */}
      {showSettings && showCustomization && (
        <Card className="mb-6 p-4 bg-gray-900/50 border-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Chart Configuration */}
            <div>
              <Text className="text-gray-300 mb-3 font-semibold">Chart Configuration</Text>
              
              {/* Chart Type Selector */}
              <div className="mb-4">
                <Text className="text-gray-400 mb-2 text-sm">Chart Type</Text>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(CHART_TYPE_CONFIGS).map(([type, config]) => {
                    const Icon = config.icon
                    return (
                      <button
                        key={type}
                        onClick={() => setCurrentChartType(type as any)}
                        className={`p-2 rounded border text-xs flex items-center gap-2 transition-all ${
                          currentChartType === type
                            ? 'border-blue-500 bg-blue-900/30 text-blue-300'
                            : 'border-gray-600 bg-gray-800/50 text-gray-400 hover:border-gray-500'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{config.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Height Adjustment */}
              <div className="mb-4">
                <Text className="text-gray-400 mb-2 text-sm">Chart Height</Text>
                <select
                  value={chartHeight.toString()}
                  onChange={(e) => setChartHeight(Number(e.target.value))}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 text-sm"
                >
                  <option value="60">Compact (60px)</option>
                  <option value="80">Standard (80px)</option>
                  <option value="100">Large (100px)</option>
                  <option value="120">Extra Large (120px)</option>
                </select>
              </div>
            </div>

            {/* Data Configuration */}
            <div>
              <Text className="text-gray-300 mb-3 font-semibold">Data Configuration</Text>
              
              {/* Column Visibility */}
              <div className="mb-4">
                <Text className="text-gray-400 mb-2 text-sm">Visible Columns</Text>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {currentCategories.map((category) => (
                    <Flex key={category} justifyContent="start" alignItems="center">
                      <input
                        type="checkbox"
                        checked={visibleColumns[category]}
                        onChange={() => setVisibleColumns(prev => ({
                          ...prev,
                          [category]: !prev[category]
                        }))}
                        className="mr-2"
                      />
                      <Text className="text-gray-300 text-sm flex-1">{category}</Text>
                      {visibleColumns[category] ? (
                        <Eye className="w-3 h-3 text-green-400" />
                      ) : (
                        <EyeOff className="w-3 h-3 text-gray-500" />
                      )}
                    </Flex>
                  ))}
                </div>
              </div>

              {/* Advanced Features */}
              <div>
                <Text className="text-gray-400 mb-2 text-sm">Advanced Features</Text>
                <div className="space-y-2">
                  <Flex justifyContent="start" alignItems="center">
                    <input
                      type="checkbox"
                      checked={showTrendlines}
                      onChange={(e) => setShowTrendlines(e.target.checked)}
                      className="mr-2"
                    />
                    <Text className="text-gray-300 text-sm">Show Trendlines</Text>
                  </Flex>
                  <Flex justifyContent="start" alignItems="center">
                    <input
                      type="checkbox"
                      checked={advanced.drillDown}
                      onChange={() => {}}
                      className="mr-2"
                    />
                    <Text className="text-gray-300 text-sm">Enable Drill-down</Text>
                  </Flex>
                </div>
              </div>
            </div>

            {/* Style Configuration */}
            <div>
              <Text className="text-gray-300 mb-3 font-semibold">Style Configuration</Text>
              
              {/* Color Palette */}
              <div className="mb-4">
                <Text className="text-gray-400 mb-2 text-sm">Color Palette</Text>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(PROFESSIONAL_COLOR_PALETTES).map(palette => (
                    <button
                      key={palette}
                      onClick={() => handleColorPaletteChange(palette)}
                      className={`p-2 rounded border text-xs capitalize transition-all ${
                        selectedPalette === palette
                          ? 'border-blue-500 bg-blue-900/30 text-blue-300'
                          : 'border-gray-600 bg-gray-800/50 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      {palette}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Chart Rendering */}
      <div className="relative">
        {filteredCategories.length > 0 ? (
          <>
            {renderChart()}
            
            {/* Chart Annotations */}
            {advanced.annotations && advanced.annotations.length > 0 && (
              <div className="absolute top-4 right-4">
                <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-3 max-w-xs">
                  {advanced.annotations.map((annotation, idx) => (
                    <div key={idx} className="flex items-start gap-2 mb-2 last:mb-0">
                      <Info className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
                      <Text className="text-xs text-gray-300">{annotation.text}</Text>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="h-32 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <Text className="text-sm">No data columns selected for visualization</Text>
            </div>
          </div>
        )}
      </div>

      {/* Chart Footer with Insights */}
      <div className="mt-6 pt-4 border-t border-gray-600">
        <Flex justifyContent="between" alignItems="center">
          <div className="flex items-center gap-4">
            <Text className="text-xs text-gray-400">
              Data points: {data.length}
            </Text>
            <Text className="text-xs text-gray-400">
              Columns: {filteredCategories.length}
            </Text>
            <Text className="text-xs text-gray-400">
              Type: {CHART_TYPE_CONFIGS[currentChartType]?.label}
            </Text>
          </div>
          <Text className="text-xs text-gray-400">
            Brain-generated • Interactive • Professional
          </Text>
        </Flex>
      </div>
    </Card>
  )
}

// Utility functions
function calculateSummaryStats(data: any[], categories: string[]) {
  if (!data.length || !categories.length) return {}
  
  const stats: Record<string, string> = {}
  
  categories.forEach(cat => {
    const values = data.map(row => Number(row[cat])).filter(val => !isNaN(val))
    if (values.length > 0) {
      const sum = values.reduce((a, b) => a + b, 0)
      const avg = sum / values.length
      const max = Math.max(...values)
      
      stats[cat] = avg > 1000 ? `${(avg/1000).toFixed(1)}K` : avg.toFixed(1)
    }
  })
  
  return stats
}

function processDataForVisualization(data: any[], filters: string[]) {
  // Apply any active filters
  let processedData = [...data]
  
  // Implement filtering logic based on active filters
  if (filters.length > 0) {
    // Filter data based on active filters
  }
  
  return processedData
}