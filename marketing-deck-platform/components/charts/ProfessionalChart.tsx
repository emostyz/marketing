'use client'

import React, { useState } from 'react'
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Button } from '@/components/ui/button'
import { BarChart3, LineChart as LineIcon, PieChart as PieIcon, TrendingUp, Settings, Palette, Type } from 'lucide-react'

interface ChartData {
  [key: string]: any
}

interface ChartConfig {
  type: 'bar' | 'line' | 'area' | 'pie' | 'donut'
  title: string
  data: ChartData[]
  xAxis: string
  yAxis: string[]
  colors: string[]
  showGrid: boolean
  showLegend: boolean
  showTooltip: boolean
  animation: boolean
  theme: 'light' | 'dark' | 'colorful'
}

interface ProfessionalChartProps {
  config: ChartConfig
  onConfigChange?: (config: ChartConfig) => void
  editable?: boolean
  width?: number
  height?: number
}

const DEFAULT_COLORS = [
  '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
  '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
]

const THEME_COLORS = {
  light: ['#4285f4', '#34a853', '#fbbc04', '#ea4335', '#9c27b0', '#ff9800'],
  dark: ['#1a73e8', '#137333', '#f9ab00', '#d93025', '#8e24aa', '#ff8f00'],
  colorful: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3']
}

export default function ProfessionalChart({ 
  config, 
  onConfigChange, 
  editable = false,
  width = 400,
  height = 300 
}: ProfessionalChartProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editConfig, setEditConfig] = useState<ChartConfig>(config)

  const handleConfigUpdate = (updates: Partial<ChartConfig>) => {
    const newConfig = { ...editConfig, ...updates }
    setEditConfig(newConfig)
    if (onConfigChange) {
      onConfigChange(newConfig)
    }
  }

  const applyTheme = (theme: ChartConfig['theme']) => {
    const colors = THEME_COLORS[theme] || DEFAULT_COLORS
    handleConfigUpdate({ theme, colors })
  }

  const renderChart = (chartConfig: ChartConfig) => {
    const { type, data, xAxis, yAxis, colors, showGrid, showLegend, showTooltip } = chartConfig

    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    }

    switch (type) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />}
            <XAxis dataKey={xAxis} stroke="#666" fontSize={12} />
            <YAxis stroke="#666" fontSize={12} />
            {showTooltip && <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }} />}
            {showLegend && <Legend />}
            {yAxis.map((key, index) => (
              <Bar 
                key={key} 
                dataKey={key} 
                fill={colors[index % colors.length]}
                radius={[2, 2, 0, 0]}
              />
            ))}
          </BarChart>
        )

      case 'line':
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />}
            <XAxis dataKey={xAxis} stroke="#666" fontSize={12} />
            <YAxis stroke="#666" fontSize={12} />
            {showTooltip && <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }} />}
            {showLegend && <Legend />}
            {yAxis.map((key, index) => (
              <Line 
                key={key} 
                type="monotone" 
                dataKey={key} 
                stroke={colors[index % colors.length]}
                strokeWidth={3}
                dot={{ fill: colors[index % colors.length], strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, stroke: colors[index % colors.length], strokeWidth: 2, fill: '#fff' }}
              />
            ))}
          </LineChart>
        )

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />}
            <XAxis dataKey={xAxis} stroke="#666" fontSize={12} />
            <YAxis stroke="#666" fontSize={12} />
            {showTooltip && <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }} />}
            {showLegend && <Legend />}
            {yAxis.map((key, index) => (
              <Area 
                key={key} 
                type="monotone" 
                dataKey={key} 
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.6}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        )

      case 'pie':
      case 'donut':
        const pieData = data.map((item, index) => ({
          name: item[xAxis],
          value: item[yAxis[0]],
          fill: colors[index % colors.length]
        }))

        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={Math.min(width, height) * 0.35}
              innerRadius={type === 'donut' ? Math.min(width, height) * 0.15 : 0}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
          </PieChart>
        )

      default:
        return <div className="flex items-center justify-center h-full text-gray-500">Select a chart type</div>
    }
  }

  if (editable && isEditing) {
    return (
      <div className="w-full h-full bg-white border border-gray-300 rounded-lg overflow-hidden">
        {/* Chart Editor Header */}
        <div className="bg-gray-50 border-b border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">Chart Editor</h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>

        <div className="flex h-full">
          {/* Chart Preview */}
          <div className="flex-1 p-4 bg-white">
            <div className="w-full h-64 border border-gray-200 rounded-lg overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                {renderChart(editConfig)}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart Controls */}
          <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
            <div className="space-y-6">
              {/* Chart Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { type: 'bar', icon: BarChart3, label: 'Bar' },
                    { type: 'line', icon: LineIcon, label: 'Line' },
                    { type: 'area', icon: TrendingUp, label: 'Area' },
                    { type: 'pie', icon: PieIcon, label: 'Pie' },
                  ].map(({ type, icon: Icon, label }) => (
                    <Button
                      key={type}
                      variant={editConfig.type === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleConfigUpdate({ type: type as ChartConfig['type'] })}
                      className="flex items-center gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chart Title</label>
                <input
                  type="text"
                  value={editConfig.title}
                  onChange={(e) => handleConfigUpdate({ title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter chart title"
                />
              </div>

              {/* Data Mapping */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">X-Axis</label>
                <select
                  value={editConfig.xAxis}
                  onChange={(e) => handleConfigUpdate({ xAxis: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {editConfig.data.length > 0 && Object.keys(editConfig.data[0]).map(key => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Y-Axis</label>
                {editConfig.data.length > 0 && Object.keys(editConfig.data[0])
                  .filter(key => key !== editConfig.xAxis)
                  .map(key => (
                    <label key={key} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={editConfig.yAxis.includes(key)}
                        onChange={(e) => {
                          const newYAxis = e.target.checked
                            ? [...editConfig.yAxis, key]
                            : editConfig.yAxis.filter(y => y !== key)
                          handleConfigUpdate({ yAxis: newYAxis })
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{key}</span>
                    </label>
                  ))}
              </div>

              {/* Theme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                <div className="flex gap-2">
                  {Object.entries(THEME_COLORS).map(([theme, colors]) => (
                    <Button
                      key={theme}
                      variant={editConfig.theme === theme ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => applyTheme(theme as ChartConfig['theme'])}
                      className="capitalize"
                    >
                      {theme}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Color Palette */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Colors</label>
                <div className="flex flex-wrap gap-2">
                  {editConfig.colors.map((color, index) => (
                    <input
                      key={index}
                      type="color"
                      value={color}
                      onChange={(e) => {
                        const newColors = [...editConfig.colors]
                        newColors[index] = e.target.value
                        handleConfigUpdate({ colors: newColors })
                      }}
                      className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                    />
                  ))}
                </div>
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                <div className="space-y-2">
                  {[
                    { key: 'showGrid', label: 'Show Grid' },
                    { key: 'showLegend', label: 'Show Legend' },
                    { key: 'showTooltip', label: 'Show Tooltip' },
                    { key: 'animation', label: 'Animation' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editConfig[key as keyof ChartConfig] as boolean}
                        onChange={(e) => handleConfigUpdate({ [key]: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="w-full h-full bg-white rounded-lg overflow-hidden group relative"
      style={{ width, height }}
    >
      {/* Chart Title */}
      {config.title && (
        <div className="px-4 py-2 border-b border-gray-100">
          <h4 className="text-sm font-semibold text-gray-800 text-center">{config.title}</h4>
        </div>
      )}

      {/* Chart Container */}
      <div className="p-2" style={{ height: config.title ? 'calc(100% - 40px)' : '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart(config)}
        </ResponsiveContainer>
      </div>

      {/* Edit Button */}
      {editable && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="bg-white/90 backdrop-blur-sm"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

// Chart templates for quick insertion
export const CHART_TEMPLATES: Partial<ChartConfig>[] = [
  {
    type: 'bar',
    title: 'Revenue by Month',
    showGrid: true,
    showLegend: false,
    colors: THEME_COLORS.light
  },
  {
    type: 'line',
    title: 'Growth Trend',
    showGrid: true,
    showLegend: true,
    colors: THEME_COLORS.colorful
  },
  {
    type: 'pie',
    title: 'Market Share',
    showLegend: true,
    colors: THEME_COLORS.dark
  },
  {
    type: 'area',
    title: 'Performance Overview',
    showGrid: true,
    showLegend: false,
    colors: THEME_COLORS.light
  }
]