'use client'

import { Card, AreaChart, BarChart, LineChart, DonutChart, ScatterChart } from '@tremor/react'
import { useState } from 'react'

interface ChartData {
  [key: string]: any
}

interface ChartConfig {
  type: 'area' | 'bar' | 'line' | 'donut' | 'scatter' | 'combo'
  colors: string[]
  showLegend: boolean
  showGradient: boolean
  showGrid: boolean
  showTooltip: boolean
  animation: boolean
  height: number
}

interface TremorAdvancedChartProps {
  data: ChartData[]
  title: string
  config: ChartConfig
  index?: string
  categories?: string[]
  onConfigChange?: (config: ChartConfig) => void
  editable?: boolean
}

const colorPalettes = {
  blue: ['blue-500', 'blue-400', 'blue-600', 'blue-300', 'blue-700'],
  green: ['emerald-500', 'emerald-400', 'emerald-600', 'emerald-300', 'emerald-700'],
  purple: ['violet-500', 'violet-400', 'violet-600', 'violet-300', 'violet-700'],
  orange: ['orange-500', 'orange-400', 'orange-600', 'orange-300', 'orange-700'],
  red: ['red-500', 'red-400', 'red-600', 'red-300', 'red-700'],
  teal: ['teal-500', 'teal-400', 'teal-600', 'teal-300', 'teal-700'],
  pink: ['pink-500', 'pink-400', 'pink-600', 'pink-300', 'pink-700'],
  indigo: ['indigo-500', 'indigo-400', 'indigo-600', 'indigo-300', 'indigo-700']
}

export function TremorAdvancedChart({ 
  data, 
  title, 
  config, 
  index, 
  categories, 
  onConfigChange,
  editable = false 
}: TremorAdvancedChartProps) {
  const [showControls, setShowControls] = useState(false)

  const valueFormatter = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toString()
  }

  const renderChart = () => {
    // Safety check for data
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-400">
          <p>No data available for chart</p>
        </div>
      )
    }

    const commonProps = {
      data,
      index: index || Object.keys(data[0] || {})[0],
      categories: categories || Object.keys(data[0] || {}).slice(1),
      colors: config.colors,
      valueFormatter,
      showLegend: config.showLegend,
      showGridLines: config.showGrid,
      className: `h-64`, // Fixed height for consistency
      enableLegendSlider: true,
      allowDecimals: false
    }

    switch (config.type) {
      case 'area':
        return (
          <AreaChart
            {...commonProps}
            showGradient={config.showGradient}
            connectNulls={true}
            curveType="monotone"
          />
        )
      case 'bar':
        return (
          <BarChart
            {...commonProps}
            showAnimation={config.animation}
          />
        )
      case 'line':
        return (
          <LineChart
            {...commonProps}
            connectNulls={true}
            curveType="monotone"
            showAnimation={config.animation}
          />
        )
      case 'donut':
        return (
          <DonutChart
            data={data}
            category={categories?.[0] || Object.keys(data[0] || {})[1]}
            index={index || Object.keys(data[0] || {})[0]}
            colors={config.colors}
            valueFormatter={valueFormatter}
            showLabel={true}
            showAnimation={config.animation}
            className={`h-${config.height}`}
          />
        )
      case 'scatter':
        return (
          <ScatterChart
            data={data}
            x={categories?.[0] || Object.keys(data[0] || {})[1]}
            y={categories?.[1] || Object.keys(data[0] || {})[2]}
            category={index || Object.keys(data[0] || {})[0]}
            colors={config.colors}
            showLegend={config.showLegend}
            enableLegendSlider={true}
            className={`h-${config.height}`}
          />
        )
      default:
        return (
          <AreaChart
            {...commonProps}
            showGradient={config.showGradient}
          />
        )
    }
  }

  const updateConfig = (updates: Partial<ChartConfig>) => {
    const newConfig = { ...config, ...updates }
    onConfigChange?.(newConfig)
  }

  return (
    <Card className="relative group">
      {editable && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={() => setShowControls(!showControls)}
            className="bg-gray-800 text-white p-2 rounded-lg text-xs hover:bg-gray-700"
          >
            ⚙️ Customize
          </button>
        </div>
      )}

      <h3 className="text-white mb-4">{title}</h3>
      
      {renderChart()}

      {showControls && editable && (
        <div className="absolute top-12 right-2 bg-gray-900 border border-gray-700 rounded-lg p-4 w-80 z-20 shadow-xl">
          <h4 className="text-white font-semibold mb-3">Chart Settings</h4>
          
          {/* Chart Type */}
          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-2">Chart Type</label>
            <select
              value={config.type}
              onChange={(e) => updateConfig({ type: e.target.value as any })}
              className="w-full bg-gray-800 text-white border border-gray-600 rounded p-2"
            >
              <option value="area">Area Chart</option>
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="donut">Donut Chart</option>
              <option value="scatter">Scatter Plot</option>
            </select>
          </div>

          {/* Color Palette */}
          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-2">Color Palette</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(colorPalettes).map(([name, colors]) => (
                <button
                  key={name}
                  onClick={() => updateConfig({ colors })}
                  className="flex space-x-1 p-2 rounded border hover:border-gray-500"
                  title={name}
                >
                  {colors.slice(0, 3).map((color, i) => (
                    <div key={i} className={`w-3 h-3 rounded bg-${color}`} />
                  ))}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <label className="flex items-center text-sm text-gray-300">
              <input
                type="checkbox"
                checked={config.showLegend}
                onChange={(e) => updateConfig({ showLegend: e.target.checked })}
                className="mr-2"
              />
              Show Legend
            </label>
            
            {(config.type === 'area' || config.type === 'line') && (
              <label className="flex items-center text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={config.showGradient}
                  onChange={(e) => updateConfig({ showGradient: e.target.checked })}
                  className="mr-2"
                />
                Show Gradient
              </label>
            )}
            
            <label className="flex items-center text-sm text-gray-300">
              <input
                type="checkbox"
                checked={config.showGrid}
                onChange={(e) => updateConfig({ showGrid: e.target.checked })}
                className="mr-2"
              />
              Show Grid Lines
            </label>
            
            <label className="flex items-center text-sm text-gray-300">
              <input
                type="checkbox"
                checked={config.animation}
                onChange={(e) => updateConfig({ animation: e.target.checked })}
                className="mr-2"
              />
              Enable Animation
            </label>
          </div>

          {/* Height Slider */}
          <div className="mt-4">
            <label className="block text-sm text-gray-300 mb-2">Chart Height</label>
            <input
              type="range"
              min="64"
              max="96"
              step="8"
              value={config.height}
              onChange={(e) => updateConfig({ height: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="text-xs text-gray-400 mt-1">{config.height * 4}px</div>
          </div>

          <button
            onClick={() => setShowControls(false)}
            className="w-full mt-4 bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Apply Changes
          </button>
        </div>
      )}
    </Card>
  )
}

// Enhanced Financial Charts
export function FinancialPerformanceChart({ data, editable = false }: { data: any[], editable?: boolean }) {
  const [config, setConfig] = useState<ChartConfig>({
    type: 'area',
    colors: ['emerald-500', 'blue-500', 'orange-500'],
    showLegend: true,
    showGradient: true,
    showGrid: true,
    showTooltip: true,
    animation: true,
    height: 80
  })

  return (
    <TremorAdvancedChart
      data={data}
      title="Financial Performance"
      config={config}
      onConfigChange={setConfig}
      editable={editable}
    />
  )
}

// Enhanced Sales Charts
export function SalesAnalyticsChart({ data, editable = false }: { data: any[], editable?: boolean }) {
  const [config, setConfig] = useState<ChartConfig>({
    type: 'bar',
    colors: ['blue-500', 'green-500', 'purple-500'],
    showLegend: true,
    showGradient: false,
    showGrid: true,
    showTooltip: true,
    animation: true,
    height: 80
  })

  return (
    <TremorAdvancedChart
      data={data}
      title="Sales Analytics"
      config={config}
      onConfigChange={setConfig}
      editable={editable}
    />
  )
}

// Enhanced Marketing Charts
export function MarketingROIChart({ data, editable = false }: { data: any[], editable?: boolean }) {
  const [config, setConfig] = useState<ChartConfig>({
    type: 'line',
    colors: ['orange-500', 'red-500', 'pink-500'],
    showLegend: true,
    showGradient: false,
    showGrid: true,
    showTooltip: true,
    animation: true,
    height: 80
  })

  return (
    <TremorAdvancedChart
      data={data}
      title="Marketing ROI Analysis"
      config={config}
      onConfigChange={setConfig}
      editable={editable}
    />
  )
}

// Multi-Chart Dashboard Component
export function TremorDashboard({ 
  charts, 
  editable = false 
}: { 
  charts: Array<{
    id: string
    title: string
    data: any[]
    type: 'financial' | 'sales' | 'marketing' | 'custom'
    config?: Partial<ChartConfig>
  }>
  editable?: boolean 
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {charts.map((chart) => {
        const defaultConfig: ChartConfig = {
          type: chart.type === 'financial' ? 'area' : chart.type === 'sales' ? 'bar' : 'line',
          colors: chart.type === 'financial' ? ['emerald-500', 'blue-500'] : 
                 chart.type === 'sales' ? ['blue-500', 'purple-500'] : ['orange-500', 'red-500'],
          showLegend: true,
          showGradient: chart.type === 'financial',
          showGrid: true,
          showTooltip: true,
          animation: true,
          height: 80,
          ...chart.config
        }

        return (
          <TremorAdvancedChart
            key={chart.id}
            data={chart.data}
            title={chart.title}
            config={defaultConfig}
            editable={editable}
          />
        )
      })}
    </div>
  )
}