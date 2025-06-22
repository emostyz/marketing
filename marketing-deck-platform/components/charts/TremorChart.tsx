'use client'

import React, { useState } from 'react'
import {
  AreaChart,
  BarChart,
  LineChart,
  DonutChart,
  Card
} from '@tremor/react'
import { Button } from '@/components/ui/Button'
import { Settings, Palette, Eye, EyeOff } from 'lucide-react'

interface TremorChartProps {
  data: any[]
  chartType: 'area' | 'bar' | 'line' | 'donut'
  title: string
  subtitle?: string
  index: string
  categories: string[]
  colors?: string[]
  height?: number
  showCustomization?: boolean
  onDataChange?: (newData: any[]) => void
}

const TREMOR_COLORS = [
  'blue', 'emerald', 'violet', 'amber', 'rose', 'cyan', 'indigo', 'teal', 'lime', 'orange',
  'red', 'purple', 'green', 'yellow', 'pink', 'gray', 'slate', 'zinc', 'neutral', 'stone'
]

export function TremorChart({
  data,
  chartType,
  title,
  subtitle,
  index,
  categories,
  colors = ['blue', 'emerald', 'violet'],
  height = 64,
  showCustomization = true,
  onDataChange
}: TremorChartProps) {
  const [currentColors, setCurrentColors] = useState(colors)
  const [currentCategories, setCurrentCategories] = useState(categories)
  const [currentChartType, setCurrentChartType] = useState(chartType)
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    categories.reduce((acc, cat) => ({ ...acc, [cat]: true }), {})
  )
  const [showSettings, setShowSettings] = useState(false)
  const [chartHeight, setChartHeight] = useState(height)

  // Filter data based on visible columns
  const filteredCategories = currentCategories.filter(cat => visibleColumns[cat])
  const filteredColors = filteredCategories.map((cat, idx) => 
    currentColors[currentCategories.indexOf(cat)] || currentColors[idx % currentColors.length]
  )

  const renderChart = () => {
    const commonProps = {
      data,
      index,
      categories: filteredCategories,
      colors: filteredColors,
      height: chartHeight,
      showAnimation: true,
      showTooltip: true,
      showLegend: filteredCategories.length > 1,
      showGridLines: true,
    }

    switch (currentChartType) {
      case 'area':
        return <AreaChart {...commonProps} />
      case 'line':
        return <LineChart {...commonProps} />
      case 'donut':
        return (
          <DonutChart
            data={data}
            category={filteredCategories[0]}
            index={index}
            colors={filteredColors}
            showAnimation={true}
            showTooltip={true}
            showLabel={true}
          />
        )
      default:
        return <BarChart {...commonProps} />
    }
  }

  const handleColorChange = (categoryIndex: number, newColor: string) => {
    const newColors = [...currentColors]
    newColors[categoryIndex] = newColor
    setCurrentColors(newColors)
  }

  const toggleColumnVisibility = (category: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  return (
    <Card className="p-6 bg-gray-800/50 border-gray-700">
      <div className="flex items-center mb-4">
        <div>
          <h3>{title}</h3>
          {subtitle && <span className="text-gray-400">{subtitle}</span>}
        </div>
        {showCustomization && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowSettings(!showSettings)}
            className="ml-auto"
          >
            <Settings className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Customization Panel */}
      {showSettings && showCustomization && (
        <Card className="mb-4 p-4 bg-gray-900/50 border-gray-600">
          <div className="space-y-4">
            {/* Chart Type Selector */}
            <div>
              <span className="text-gray-300 mb-2">Chart Type</span>
              <select
                value={currentChartType}
                onChange={(e) => setCurrentChartType(e.target.value as any)}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
              >
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="area">Area Chart</option>
                <option value="donut">Donut Chart</option>
              </select>
            </div>

            {/* Height Adjustment */}
            <div>
              <span className="text-gray-300 mb-2">Chart Height</span>
              <select
                value={chartHeight.toString()}
                onChange={(e) => setChartHeight(Number(e.target.value))}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
              >
                <option value="48">Small (48px)</option>
                <option value="64">Medium (64px)</option>
                <option value="80">Large (80px)</option>
                <option value="96">Extra Large (96px)</option>
              </select>
            </div>

            {/* Column Visibility */}
            <div>
              <span className="text-gray-300 mb-2">Visible Columns</span>
              <div className="space-y-2">
                {currentCategories.map((category) => (
                  <div key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={visibleColumns[category]}
                      onChange={() => toggleColumnVisibility(category)}
                      className="mr-2"
                    />
                    <span className="text-gray-300 ml-2">{category}</span>
                    {visibleColumns[category] ? (
                      <Eye className="w-4 h-4 text-green-400 ml-2" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-500 ml-2" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Color Customization */}
            <div>
              <span className="text-gray-300 mb-2">Colors</span>
              <div className="grid grid-cols-2 gap-2">
                {filteredCategories.map((category, idx) => (
                  <div key={category} className="space-y-1">
                    <span className="text-xs text-gray-400">{category}</span>
                    <select
                      value={currentColors[currentCategories.indexOf(category)]}
                      onChange={(e) => handleColorChange(currentCategories.indexOf(category), e.target.value)}
                      className="w-full bg-gray-700 text-white px-2 py-1 rounded border border-gray-600 text-xs"
                    >
                      {TREMOR_COLORS.map(color => (
                        <option key={color} value={color}>
                          {color}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Chart Rendering */}
      <div className="mt-4">
        {filteredCategories.length > 0 ? (
          renderChart()
        ) : (
          <div className="h-32 flex items-center justify-center text-gray-400">
            <span>No columns selected for visualization</span>
          </div>
        )}
      </div>

      {/* Chart Info */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-600">
        <span className="text-xs text-gray-400">
          Data points: {data.length} • Columns: {filteredCategories.length}
        </span>
        <span className="text-xs text-gray-400">
          Type: {currentChartType} • Interactive
        </span>
      </div>
    </Card>
  )
}