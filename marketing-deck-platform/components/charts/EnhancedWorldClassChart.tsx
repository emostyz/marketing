'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  AreaChart,
  BarChart,
  LineChart,
  DonutChart,
  Card,
  Title,
  Text,
  Flex,
  Metric,
  Badge
} from '@tremor/react'
import { Button } from '@/components/ui/Button'
import { 
  Settings, 
  Eye, 
  EyeOff, 
  Download, 
  Table,
  RefreshCw,
  Palette,
  TrendingUp,
  BarChart3,
  Info
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface EnhancedChartProps {
  type: 'area' | 'bar' | 'line' | 'donut' | 'combo'
  data: any[]
  index: string
  categories: string[]
  colors?: string[]
  height?: number
  showLegend?: boolean
  enableInteractivity?: boolean
  onColumnToggle?: (column: string) => void
  title?: string
  subtitle?: string
  valueFormatter?: (value: number) => string
  showDataTable?: boolean
  className?: string
}

// Professional color schemes with better contrast
const COLOR_SCHEMES = {
  corporate: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
  modern: ['#6366F1', '#14B8A6', '#F97316', '#EC4899', '#84CC16'],
  elegant: ['#4F46E5', '#059669', '#DC2626', '#7C3AED', '#0891B2'],
  vibrant: ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
  professional: ['#1E40AF', '#047857', '#B91C1C', '#6B21A8', '#B45309']
}

export function EnhancedWorldClassChart({
  type,
  data,
  index,
  categories,
  colors = COLOR_SCHEMES.corporate,
  height = 400,
  showLegend = true,
  enableInteractivity = false,
  onColumnToggle,
  title,
  subtitle,
  valueFormatter = (value) => value.toLocaleString(),
  showDataTable = false,
  className = ''
}: EnhancedChartProps) {
  const [visibleCategories, setVisibleCategories] = useState<string[]>(categories)
  const [selectedColorScheme, setSelectedColorScheme] = useState('corporate')
  const [showSettings, setShowSettings] = useState(false)
  const [currentColors, setCurrentColors] = useState(colors)
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setVisibleCategories(categories)
  }, [categories])

  const toggleCategory = (category: string) => {
    setVisibleCategories(prev => {
      const newCategories = prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
      
      if (onColumnToggle) {
        onColumnToggle(category)
      }
      
      return newCategories
    })
  }

  const changeColorScheme = (scheme: string) => {
    setSelectedColorScheme(scheme)
    setCurrentColors(COLOR_SCHEMES[scheme as keyof typeof COLOR_SCHEMES])
  }

  const exportChart = () => {
    // Implementation for chart export
    console.log('Exporting chart...')
  }

  const getChartColors = () => {
    return visibleCategories.map((cat, idx) => {
      const catIndex = categories.indexOf(cat)
      return currentColors[catIndex % currentColors.length]
    })
  }

  const renderChart = () => {
    const chartProps = {
      data,
      index,
      categories: visibleCategories,
      colors: getChartColors(),
      showAnimation: true,
      showTooltip: true,
      showLegend: showLegend && visibleCategories.length > 1,
      showGridLines: true,
      valueFormatter,
      className: "mt-4"
    }

    switch (type) {
      case 'area':
        return (
          <AreaChart 
            {...chartProps}
            showGradient={true}
            stack={true}
            curveType="monotone"
            connectNulls={false}
          />
        )
      
      case 'line':
        return (
          <LineChart 
            {...chartProps}
            curveType="monotone"
            connectNulls={false}
          />
        )
      
      case 'donut':
        return (
          <DonutChart
            data={data}
            category={visibleCategories[0]}
            index={index}
            colors={getChartColors()}
            showAnimation={true}
            showTooltip={true}
            valueFormatter={valueFormatter}
            className="mx-auto"
          />
        )
      
      case 'combo':
        return (
          <div className="relative">
            <BarChart 
              {...chartProps}
              stack={false}
            />
            <div className="absolute inset-0 pointer-events-none">
              <LineChart 
                {...chartProps}
                categories={[visibleCategories[visibleCategories.length - 1]]}
                colors={['#EF4444']}
                showLegend={false}
                className="opacity-80"
              />
            </div>
          </div>
        )
      
      default:
        return (
          <BarChart 
            {...chartProps}
            stack={false}
          />
        )
    }
  }

  return (
    <div className={`relative ${className}`} ref={chartRef}>
      {title && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>}
        </div>
      )}

      {/* Chart Controls */}
      {enableInteractivity && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowSettings(!showSettings)}
              className="text-xs"
            >
              <Settings className="w-3 h-3 mr-1" />
              Customize
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={exportChart}
              className="text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              Export
            </Button>
            {showDataTable !== undefined && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {}}
                className="text-xs"
              >
                <Table className="w-3 h-3 mr-1" />
                Data
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && enableInteractivity && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <Card className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Color Schemes */}
                <div>
                  <Text className="text-sm font-medium mb-2">Color Scheme</Text>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(COLOR_SCHEMES).map(scheme => (
                      <button
                        key={scheme}
                        onClick={() => changeColorScheme(scheme)}
                        className={`px-3 py-2 text-xs rounded border transition-all capitalize ${
                          selectedColorScheme === scheme
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                      >
                        {scheme}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Column Visibility */}
                <div>
                  <Text className="text-sm font-medium mb-2">Visible Columns</Text>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {categories.map(category => (
                      <label
                        key={category}
                        className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={visibleCategories.includes(category)}
                          onChange={() => toggleCategory(category)}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                        <span className="flex-1">{category}</span>
                        {visibleCategories.includes(category) ? (
                          <Eye className="w-3 h-3 text-green-500" />
                        ) : (
                          <EyeOff className="w-3 h-3 text-gray-400" />
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chart Container */}
      <div style={{ height: `${height}px` }} className="relative">
        {visibleCategories.length > 0 ? (
          renderChart()
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No data columns selected</p>
              <p className="text-xs mt-1">Enable columns from settings</p>
            </div>
          </div>
        )}
      </div>

      {/* Data Summary */}
      {data.length > 0 && visibleCategories.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {visibleCategories.slice(0, 4).map(category => {
              const values = data.map(d => parseFloat(d[category]) || 0)
              const sum = values.reduce((a, b) => a + b, 0)
              const avg = sum / values.length
              const max = Math.max(...values)
              const min = Math.min(...values)
              
              return (
                <div key={category}>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">{category}</Text>
                  <Metric className="text-sm mt-1">{valueFormatter(avg)}</Metric>
                  <Text className="text-xs text-gray-400 dark:text-gray-500">
                    {valueFormatter(min)} - {valueFormatter(max)}
                  </Text>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}