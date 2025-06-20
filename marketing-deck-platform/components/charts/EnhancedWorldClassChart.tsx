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
  onDataSelection?: (selectedData: any[]) => void
  onDataFilter?: (filters: Record<string, any>) => void
  onDrillDown?: (dataPoint: any, level: number) => void
  title?: string
  subtitle?: string
  valueFormatter?: (value: number) => string
  showDataTable?: boolean
  className?: string
  drillDownLevels?: string[]
  allowDataExport?: boolean
  enableCrossFilter?: boolean
  chartId?: string
  onChartInteraction?: (chartId: string, interaction: any) => void
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
  onDataSelection,
  onDataFilter,
  onDrillDown,
  title,
  subtitle,
  valueFormatter = (value) => value.toLocaleString(),
  showDataTable = false,
  className = '',
  drillDownLevels = [],
  allowDataExport = true,
  enableCrossFilter = false,
  chartId = 'chart',
  onChartInteraction
}: EnhancedChartProps) {
  const [visibleCategories, setVisibleCategories] = useState<string[]>(categories)
  const [selectedColorScheme, setSelectedColorScheme] = useState('corporate')
  const [showSettings, setShowSettings] = useState(false)
  const [currentColors, setCurrentColors] = useState(colors)
  const [selectedData, setSelectedData] = useState<any[]>([])
  const [dataFilters, setDataFilters] = useState<Record<string, any>>({})
  const [currentDrillLevel, setCurrentDrillLevel] = useState(0)
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [annotations, setAnnotations] = useState<Array<{id: string, x: number, y: number, text: string}>>([])
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

  // Advanced data selection handler
  const handleDataSelection = (selectedPoints: any[]) => {
    setSelectedData(selectedPoints)
    if (onDataSelection) onDataSelection(selectedPoints)
    if (onChartInteraction) {
      onChartInteraction(chartId, { type: 'selection', data: selectedPoints })
    }
  }

  // Advanced filtering
  const applyFilter = (column: string, value: any, operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' = 'equals') => {
    const newFilters = { ...dataFilters, [column]: { value, operator } }
    setDataFilters(newFilters)
    if (onDataFilter) onDataFilter(newFilters)
    if (onChartInteraction) {
      onChartInteraction(chartId, { type: 'filter', filters: newFilters })
    }
  }

  // Drill-down functionality
  const handleDrillDown = (dataPoint: any) => {
    if (drillDownLevels.length > currentDrillLevel + 1) {
      const nextLevel = currentDrillLevel + 1
      setCurrentDrillLevel(nextLevel)
      if (onDrillDown) onDrillDown(dataPoint, nextLevel)
      if (onChartInteraction) {
        onChartInteraction(chartId, { type: 'drillDown', dataPoint, level: nextLevel })
      }
    }
  }

  // Chart export functionality
  const exportChart = async () => {
    if (!chartRef.current) return
    
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = chartRef.current.offsetWidth
      canvas.height = chartRef.current.offsetHeight

      // Create downloadable image
      const link = document.createElement('a')
      link.download = `${title || 'chart'}_${new Date().toISOString().split('T')[0]}.png`
      link.href = canvas.toDataURL()
      link.click()

      // Also export data as CSV
      exportDataAsCSV()
    } catch (error) {
      console.error('Chart export failed:', error)
    }
  }

  // Data export as CSV
  const exportDataAsCSV = () => {
    const filteredData = getFilteredData()
    const headers = [index, ...visibleCategories]
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => headers.map(header => row[header] || '').join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const link = document.createElement('a')
    link.download = `${title || 'chart'}_data_${new Date().toISOString().split('T')[0]}.csv`
    link.href = URL.createObjectURL(blob)
    link.click()
  }

  // Get filtered data based on current filters
  const getFilteredData = () => {
    return data.filter(row => {
      return Object.entries(dataFilters).every(([column, filter]) => {
        const value = row[column]
        switch (filter.operator) {
          case 'contains':
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase())
          case 'greaterThan':
            return Number(value) > Number(filter.value)
          case 'lessThan':
            return Number(value) < Number(filter.value)
          case 'equals':
          default:
            return value === filter.value
        }
      })
    })
  }

  // Add annotation
  const addAnnotation = (x: number, y: number, text: string) => {
    const newAnnotation = {
      id: `annotation_${Date.now()}`,
      x,
      y,
      text
    }
    setAnnotations(prev => [...prev, newAnnotation])
  }

  // Zoom functionality
  const handleZoom = (delta: number) => {
    const newZoom = Math.max(0.5, Math.min(3, zoomLevel + delta))
    setZoomLevel(newZoom)
  }

  const getChartColors = () => {
    return visibleCategories.map((cat, idx) => {
      const catIndex = categories.indexOf(cat)
      return currentColors[catIndex % currentColors.length]
    })
  }

  const renderChart = () => {
    const filteredData = getFilteredData()
    const chartProps = {
      data: filteredData,
      index,
      categories: visibleCategories,
      colors: getChartColors(),
      showAnimation: true,
      showTooltip: true,
      showLegend: showLegend && visibleCategories.length > 1,
      showGridLines: true,
      valueFormatter,
      className: "mt-4",
      onValueChange: enableInteractivity ? handleDataSelection : undefined,
      allowDecimals: true,
      enableLegendSlider: true,
      rotateLabelX: { angle: -45 }
    }

    switch (type) {
      case 'area':
        return (
          <AreaChart 
            data={data}
            index={index}
            categories={visibleCategories}
            colors={getChartColors()}
            showAnimation={true}
            showTooltip={true}
            showLegend={showLegend}
            showGridLines={true}
            valueFormatter={valueFormatter}
            showGradient={true}
            stack={true}
            curveType="monotone"
            connectNulls={false}
          />
        )
      
      case 'line':
        return (
          <LineChart 
            data={data}
            index={index}
            categories={visibleCategories}
            colors={getChartColors()}
            showAnimation={true}
            showTooltip={true}
            showLegend={showLegend}
            showGridLines={true}
            valueFormatter={valueFormatter}
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
              data={data}
              index={index}
              categories={visibleCategories}
              colors={getChartColors()}
              showAnimation={true}
              showTooltip={true}
              showLegend={showLegend}
              showGridLines={true}
              valueFormatter={valueFormatter}
              stack={false}
            />
            <div className="absolute inset-0 pointer-events-none">
              <LineChart 
                data={data}
                index={index}
                categories={[visibleCategories[visibleCategories.length - 1]]}
                colors={['#EF4444']}
                showLegend={false}
                className="opacity-80"
                showAnimation={true}
                showTooltip={true}
                showGridLines={true}
                valueFormatter={valueFormatter}
              />
            </div>
          </div>
        )
      
      default:
        return (
          <BarChart 
            data={data}
            index={index}
            categories={visibleCategories}
            colors={getChartColors()}
            showAnimation={true}
            showTooltip={true}
            showLegend={showLegend}
            showGridLines={true}
            valueFormatter={valueFormatter}
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

      {/* Enhanced Chart Controls */}
      {enableInteractivity && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2 flex-wrap">
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
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Filter
            </Button>
            {allowDataExport && (
              <Button
                size="sm"
                variant="outline"
                onClick={exportChart}
                className="text-xs"
              >
                <Download className="w-3 h-3 mr-1" />
                Export
              </Button>
            )}
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
            {drillDownLevels.length > 0 && currentDrillLevel > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentDrillLevel(prev => Math.max(0, prev - 1))}
                className="text-xs"
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                Drill Up
              </Button>
            )}
          </div>
          
          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleZoom(-0.2)}
              className="text-xs px-2"
              disabled={zoomLevel <= 0.5}
            >
              -
            </Button>
            <span className="text-xs text-gray-600 min-w-[3rem] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleZoom(0.2)}
              className="text-xs px-2"
              disabled={zoomLevel >= 3}
            >
              +
            </Button>
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

      {/* Advanced Filter Panel */}
      <AnimatePresence>
        {showFilterPanel && enableInteractivity && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <Card className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <Text className="text-sm font-medium">Advanced Filters</Text>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDataFilters({})}
                  className="text-xs"
                >
                  Clear All
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[index, ...categories].map(column => {
                  const uniqueValues = [...new Set(data.map(row => row[column]))].slice(0, 10)
                  const isNumeric = typeof data[0]?.[column] === 'number'
                  
                  return (
                    <div key={column} className="space-y-2">
                      <Text className="text-xs font-medium text-gray-600 dark:text-gray-400 capitalize">
                        {column}
                      </Text>
                      
                      {isNumeric ? (
                        <div className="space-y-2">
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                const [operator, value] = e.target.value.split(':')
                                applyFilter(column, Number(value), operator as any)
                              }
                            }}
                            className="w-full text-xs p-2 border rounded bg-white dark:bg-gray-700"
                          >
                            <option value="">No filter</option>
                            <option value={`greaterThan:${Math.min(...data.map(r => r[column]))}`}>
                              Greater than min
                            </option>
                            <option value={`lessThan:${Math.max(...data.map(r => r[column]))}`}>
                              Less than max
                            </option>
                          </select>
                        </div>
                      ) : (
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              applyFilter(column, e.target.value, 'equals')
                            } else {
                              const newFilters = { ...dataFilters }
                              delete newFilters[column]
                              setDataFilters(newFilters)
                            }
                          }}
                          className="w-full text-xs p-2 border rounded bg-white dark:bg-gray-700"
                        >
                          <option value="">All values</option>
                          {uniqueValues.map(value => (
                            <option key={String(value)} value={String(value)}>
                              {String(value)}
                            </option>
                          ))}
                        </select>
                      )}
                      
                      {dataFilters[column] && (
                        <div className="flex items-center justify-between text-xs bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
                          <span className="text-blue-700 dark:text-blue-300">
                            {dataFilters[column].operator}: {String(dataFilters[column].value)}
                          </span>
                          <button
                            onClick={() => {
                              const newFilters = { ...dataFilters }
                              delete newFilters[column]
                              setDataFilters(newFilters)
                            }}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              
              {Object.keys(dataFilters).length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <Text className="text-xs text-gray-600 dark:text-gray-400">
                    Showing {getFilteredData().length} of {data.length} records
                  </Text>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chart Container with Enhanced Interactivity */}
      <div 
        style={{ 
          height: `${height}px`,
          transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
          transformOrigin: 'top left'
        }} 
        className="relative overflow-hidden"
        onDoubleClick={(e) => {
          if (enableInteractivity) {
            const rect = e.currentTarget.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top
            const text = prompt('Add annotation:')
            if (text) addAnnotation(x, y, text)
          }
        }}
      >
        {visibleCategories.length > 0 ? (
          <>
            {renderChart()}
            
            {/* Annotations Overlay */}
            {annotations.map(annotation => (
              <div
                key={annotation.id}
                className="absolute bg-yellow-200 dark:bg-yellow-800 text-black dark:text-white text-xs p-2 rounded shadow-lg border border-yellow-400 pointer-events-none"
                style={{
                  left: annotation.x,
                  top: annotation.y,
                  transform: 'translate(-50%, -100%)',
                  zIndex: 10
                }}
              >
                {annotation.text}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-yellow-400"></div>
              </div>
            ))}
            
            {/* Selection Indicator */}
            {selectedData.length > 0 && (
              <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                {selectedData.length} point{selectedData.length !== 1 ? 's' : ''} selected
              </div>
            )}
            
            {/* Drill-down Indicator */}
            {drillDownLevels.length > 0 && currentDrillLevel > 0 && (
              <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                Level {currentDrillLevel + 1}: {drillDownLevels[currentDrillLevel]}
              </div>
            )}
          </>
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

      {/* Enhanced Data Summary */}
      {data.length > 0 && visibleCategories.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Filter and Selection Summary */}
          {(Object.keys(dataFilters).length > 0 || selectedData.length > 0) && (
            <div className="mb-4 flex flex-wrap gap-2 text-xs">
              {Object.keys(dataFilters).length > 0 && (
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {Object.keys(dataFilters).length} filter{Object.keys(dataFilters).length !== 1 ? 's' : ''} active
                </Badge>
              )}
              {selectedData.length > 0 && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {selectedData.length} point{selectedData.length !== 1 ? 's' : ''} selected
                </Badge>
              )}
              {getFilteredData().length !== data.length && (
                <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                  Showing {getFilteredData().length} of {data.length} records
                </Badge>
              )}
            </div>
          )}
          
          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {visibleCategories.slice(0, 4).map(category => {
              const filteredData = getFilteredData()
              const values = filteredData.map(d => parseFloat(d[category]) || 0).filter(v => !isNaN(v))
              
              if (values.length === 0) return null
              
              const sum = values.reduce((a, b) => a + b, 0)
              const avg = sum / values.length
              const max = Math.max(...values)
              const min = Math.min(...values)
              const change = data.length > filteredData.length ? 
                ((avg - (data.map(d => parseFloat(d[category]) || 0).reduce((a, b) => a + b, 0) / data.length)) / avg * 100) : 0
              
              return (
                <div key={category} className="relative">
                  <Text className="text-xs text-gray-500 dark:text-gray-400 capitalize">{category}</Text>
                  <Metric className="text-sm mt-1">{valueFormatter(avg)}</Metric>
                  <Text className="text-xs text-gray-400 dark:text-gray-500">
                    {valueFormatter(min)} - {valueFormatter(max)}
                  </Text>
                  {Math.abs(change) > 1 && (
                    <div className={`text-xs mt-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {change > 0 ? '↗' : '↘'} {Math.abs(change).toFixed(1)}%
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          {/* Interactive Help */}
          {enableInteractivity && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Text className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
                Interactive Features:
              </Text>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                <div>• Double-click to add annotations</div>
                <div>• Use Filter panel for data exploration</div>
                <div>• Zoom with +/- controls</div>
                {drillDownLevels.length > 0 && <div>• Click data points to drill down</div>}
                {allowDataExport && <div>• Export chart and data</div>}
                <div>• Toggle columns in settings</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}