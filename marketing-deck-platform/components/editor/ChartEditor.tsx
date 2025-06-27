'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart3, LineChart, PieChart, TrendingUp, Plus, Minus, 
  Download, Upload, Settings, Palette, RefreshCw, Save,
  X, ChevronDown, ChevronRight, Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { TremorChartRenderer } from '@/components/charts/TremorChartRenderer'

interface ChartData {
  [key: string]: string | number
}

interface ChartConfig {
  type: 'line' | 'bar' | 'area' | 'pie' | 'scatter' | 'combo'
  title: string
  data: ChartData[]
  xAxis: string
  yAxis: string[]
  colors: string[]
  showLegend: boolean
  showGrid: boolean
  animate: boolean
  height: number
}

interface ChartEditorProps {
  isOpen: boolean
  onClose: () => void
  chartConfig: ChartConfig | null
  onSave: (config: ChartConfig) => void
  datasetId?: string
  uploadedData?: any[]
}

const chartTypes = [
  { value: 'line', label: 'Line Chart', icon: LineChart },
  { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { value: 'area', label: 'Area Chart', icon: TrendingUp },
  { value: 'pie', label: 'Pie Chart', icon: PieChart },
  { value: 'scatter', label: 'Scatter Plot', icon: BarChart3 },
  { value: 'combo', label: 'Combo Chart', icon: BarChart3 }
]

const colorPresets = [
  ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'],
  ['#1E40AF', '#DC2626', '#059669', '#D97706', '#7C3AED'],
  ['#60A5FA', '#F87171', '#34D399', '#FBBF24', '#A78BFA'],
  ['#93C5FD', '#FCA5A5', '#6EE7B7', '#FDE047', '#C4B5FD'],
  ['#DBEAFE', '#FEE2E2', '#D1FAE5', '#FEF3C7', '#EDE9FE']
]

const sampleDatasets = {
  revenue: [
    { month: 'Jan', revenue: 4500, profit: 1200, costs: 3300 },
    { month: 'Feb', revenue: 5200, profit: 1800, costs: 3400 },
    { month: 'Mar', revenue: 4800, profit: 1400, costs: 3400 },
    { month: 'Apr', revenue: 6100, profit: 2300, costs: 3800 },
    { month: 'May', revenue: 5900, profit: 2100, costs: 3800 },
    { month: 'Jun', revenue: 7200, profit: 3000, costs: 4200 }
  ],
  users: [
    { date: '2024-01', active: 1200, new: 300, churned: 80 },
    { date: '2024-02', active: 1450, new: 350, churned: 100 },
    { date: '2024-03', active: 1680, new: 380, churned: 150 },
    { date: '2024-04', active: 1890, new: 410, churned: 200 },
    { date: '2024-05', active: 2100, new: 450, churned: 240 },
    { date: '2024-06', active: 2350, new: 500, churned: 250 }
  ],
  performance: [
    { metric: 'Speed', score: 85, target: 90 },
    { metric: 'Quality', score: 92, target: 95 },
    { metric: 'Efficiency', score: 78, target: 85 },
    { metric: 'Satisfaction', score: 88, target: 90 },
    { metric: 'Innovation', score: 75, target: 80 }
  ]
}

export default function ChartEditor({ isOpen, onClose, chartConfig, onSave, datasetId, uploadedData }: ChartEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [config, setConfig] = useState<ChartConfig>(
    chartConfig || {
      type: 'bar',
      title: 'Chart from Your Data',
      data: uploadedData && uploadedData.length > 0 ? uploadedData.slice(0, 20) : sampleDatasets.revenue,
      xAxis: uploadedData && uploadedData.length > 0 ? Object.keys(uploadedData[0])[0] : 'month',
      yAxis: uploadedData && uploadedData.length > 0 ? [Object.keys(uploadedData[0]).find(key => !isNaN(parseFloat(uploadedData[0][key]))) || Object.keys(uploadedData[0])[1]] : ['revenue'],
      colors: colorPresets[0],
      showLegend: true,
      showGrid: true,
      animate: true,
      height: 300
    }
  )
  const [isLoadingDataset, setIsLoadingDataset] = useState(false)
  const [datasetError, setDatasetError] = useState<string | null>(null)
  
  // Load dataset if provided but no uploaded data
  useEffect(() => {
    if (datasetId && (!uploadedData || uploadedData.length === 0)) {
      loadDatasetData()
    }
  }, [datasetId])
  
  const loadDatasetData = async () => {
    if (!datasetId) return
    
    setIsLoadingDataset(true)
    setDatasetError(null)
    
    try {
      const response = await fetch(`/api/datasets/${datasetId}`)
      if (!response.ok) {
        throw new Error(`Failed to load dataset: ${response.status}`)
      }
      
      const result = await response.json()
      const datasetData = result.data?.processedData || result.processedData || []
      
      if (datasetData.length > 0) {
        const numericColumns = Object.keys(datasetData[0]).filter(key => 
          !isNaN(parseFloat(datasetData[0][key]))
        )
        
        setConfig(prev => ({
          ...prev,
          title: `Analysis from ${result.filename || 'Your Dataset'}`,
          data: datasetData.slice(0, 50), // Limit to 50 rows for performance
          xAxis: Object.keys(datasetData[0])[0],
          yAxis: numericColumns.length > 0 ? [numericColumns[0]] : [Object.keys(datasetData[0])[1]]
        }))
      }
    } catch (error) {
      console.error('Failed to load dataset:', error)
      setDatasetError(error instanceof Error ? error.message : 'Failed to load dataset')
    } finally {
      setIsLoadingDataset(false)
    }
  }
  const [activeTab, setActiveTab] = useState('data')
  const [rawData, setRawData] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  const updateConfig = (updates: Partial<ChartConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }

  const loadSampleData = (datasetKey: keyof typeof sampleDatasets) => {
    const dataset = sampleDatasets[datasetKey]
    updateConfig({ data: dataset })
    setRawData(JSON.stringify(dataset, null, 2))
  }

  const handleDataImport = (dataStr: string) => {
    try {
      const parsed = JSON.parse(dataStr)
      if (Array.isArray(parsed)) {
        updateConfig({ data: parsed })
        setRawData(dataStr)
      }
    } catch (error) {
      console.error('Invalid JSON data')
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (file.name.endsWith('.json')) {
        handleDataImport(content)
      } else if (file.name.endsWith('.csv')) {
        // Simple CSV parsing
        const lines = content.split('\n')
        const headers = lines[0].split(',').map(h => h.trim())
        const data = lines.slice(1).filter(line => line.trim()).map(line => {
          const values = line.split(',')
          const obj: any = {}
          headers.forEach((header, index) => {
            const value = values[index]?.trim()
            obj[header] = isNaN(Number(value)) ? value : Number(value)
          })
          return obj
        })
        updateConfig({ data })
        setRawData(JSON.stringify(data, null, 2))
      }
    }
    reader.readAsText(file)
  }

  const addDataRow = () => {
    const newRow: ChartData = {}
    if (config.data.length > 0) {
      Object.keys(config.data[0]).forEach(key => {
        newRow[key] = typeof config.data[0][key] === 'number' ? 0 : ''
      })
    }
    updateConfig({ data: [...config.data, newRow] })
  }

  const removeDataRow = (index: number) => {
    const newData = config.data.filter((_, i) => i !== index)
    updateConfig({ data: newData })
  }

  const updateDataCell = (rowIndex: number, key: string, value: string | number) => {
    const newData = [...config.data]
    newData[rowIndex] = { ...newData[rowIndex], [key]: value }
    updateConfig({ data: newData })
  }

  const getAvailableKeys = () => {
    if (config.data.length === 0) return []
    return Object.keys(config.data[0])
  }

  const getNumericKeys = () => {
    if (config.data.length === 0) return []
    return Object.keys(config.data[0]).filter(key => 
      typeof config.data[0][key] === 'number'
    )
  }

  const generateSmartSuggestions = () => {
    if (config.data.length === 0) return []
    
    const keys = getAvailableKeys()
    const numericKeys = getNumericKeys()
    const categoricalKeys = keys.filter(key => !numericKeys.includes(key))
    
    const suggestions = []
    
    // Time series detection
    const dateKeys = keys.filter(key => 
      key.toLowerCase().includes('date') || 
      key.toLowerCase().includes('time') || 
      key.toLowerCase().includes('month') ||
      key.toLowerCase().includes('year')
    )
    
    if (dateKeys.length > 0 && numericKeys.length > 0) {
      suggestions.push({
        type: 'line',
        title: `${numericKeys[0]} Trend Over Time`,
        xAxis: dateKeys[0],
        yAxis: [numericKeys[0]],
        reason: 'Time series data detected - perfect for trend analysis'
      })
    }
    
    // Regional/categorical comparison
    if (categoricalKeys.length > 0 && numericKeys.length > 0) {
      const regionKey = categoricalKeys.find(key => 
        key.toLowerCase().includes('region') || 
        key.toLowerCase().includes('category') ||
        key.toLowerCase().includes('type')
      ) || categoricalKeys[0]
      
      suggestions.push({
        type: 'bar',
        title: `${numericKeys[0]} by ${regionKey}`,
        xAxis: regionKey,
        yAxis: [numericKeys[0]],
        reason: 'Categorical data found - ideal for comparisons'
      })
    }
    
    // Multi-metric analysis
    if (numericKeys.length > 1) {
      suggestions.push({
        type: 'scatter',
        title: `${numericKeys[0]} vs ${numericKeys[1]} Analysis`,
        xAxis: numericKeys[0],
        yAxis: [numericKeys[1]],
        reason: 'Multiple metrics - explore correlations'
      })
      
      if (categoricalKeys.length > 0) {
        suggestions.push({
          type: 'bar',
          title: 'Multi-Metric Performance Dashboard',
          xAxis: categoricalKeys[0],
          yAxis: numericKeys.slice(0, 3),
          reason: 'Multiple KPIs - comprehensive performance view'
        })
      }
    }
    
    // Pie chart for market share/composition
    if (categoricalKeys.length > 0 && numericKeys.length > 0) {
      suggestions.push({
        type: 'pie',
        title: `${numericKeys[0]} Distribution by ${categoricalKeys[0]}`,
        xAxis: categoricalKeys[0],
        yAxis: [numericKeys[0]],
        reason: 'Perfect for showing market share or composition'
      })
    }
    
    return suggestions.slice(0, 4) // Limit to top 4 suggestions
  }

  const applySuggestion = (suggestion: any) => {
    updateConfig({
      type: suggestion.type,
      title: suggestion.title,
      xAxis: suggestion.xAxis,
      yAxis: suggestion.yAxis
    })
  }

  const renderDataEditor = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">Chart Data</h3>
        <div className="flex gap-2">
          <Select onValueChange={loadSampleData}>
            <SelectTrigger className="w-32 bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder="Load sample" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="revenue" className="text-white">Revenue</SelectItem>
              <SelectItem value="users" className="text-white">Users</SelectItem>
              <SelectItem value="performance" className="text-white">Performance</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-white border-gray-600 hover:bg-gray-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Smart Chart Suggestions */}
      {(uploadedData && uploadedData.length > 0) || (config.data.length > 0 && config.data !== sampleDatasets.revenue) ? (
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <h4 className="text-sm font-medium text-blue-300">Smart Chart Suggestions</h4>
            <Badge variant="outline" className="text-xs text-blue-400 border-blue-400">
              Based on your data
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {generateSmartSuggestions().map((suggestion, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-600 hover:border-blue-500 transition-colors cursor-pointer"
                onClick={() => applySuggestion(suggestion)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <h5 className="text-sm font-medium text-white">{suggestion.title}</h5>
                    <Badge variant="outline" className="text-xs text-gray-400">
                      {suggestion.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{suggestion.reason}</p>
                </div>
                <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300">
                  Apply
                </Button>
              </div>
            ))}
          </div>
          
          {generateSmartSuggestions().length === 0 && (
            <p className="text-sm text-gray-400 text-center py-2">
              Upload your data or select sample data to see chart suggestions
            </p>
          )}
        </div>
      ) : null}

      {/* Dataset Loading Status */}
      {isLoadingDataset && (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-blue-400">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading your dataset...</span>
          </div>
        </div>
      )}

      {datasetError && (
        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-400">
            <X className="w-4 h-4" />
            <span className="text-sm">Failed to load dataset: {datasetError}</span>
          </div>
        </div>
      )}

      {/* Data Table */}
      {config.data.length > 0 && (
        <div className="border border-gray-600 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800">
                <tr>
                  {getAvailableKeys().map(key => (
                    <th key={key} className="px-3 py-2 text-left text-gray-300 font-medium">
                      {key}
                    </th>
                  ))}
                  <th className="px-3 py-2 w-16"></th>
                </tr>
              </thead>
              <tbody className="bg-gray-900">
                {config.data.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-t border-gray-700">
                    {getAvailableKeys().map(key => (
                      <td key={key} className="px-3 py-2">
                        <Input
                          value={row[key]}
                          onChange={(e) => {
                            const value = typeof row[key] === 'number' 
                              ? parseFloat(e.target.value) || 0
                              : e.target.value
                            updateDataCell(rowIndex, key, value)
                          }}
                          className="bg-transparent border-none p-0 text-white focus:bg-gray-800"
                        />
                      </td>
                    ))}
                    <td className="px-3 py-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDataRow(rowIndex)}
                        className="text-red-400 hover:bg-red-900"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-2 bg-gray-800 border-t border-gray-700">
            <Button
              variant="outline"
              size="sm"
              onClick={addDataRow}
              className="text-white border-gray-600 hover:bg-gray-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Row
            </Button>
          </div>
        </div>
      )}

      {/* Raw Data Editor */}
      <div className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:bg-gray-700"
        >
          {isExpanded ? <ChevronDown className="w-4 h-4 mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
          Raw JSON Editor
        </Button>
        {isExpanded && (
          <Textarea
            value={rawData || JSON.stringify(config.data, null, 2)}
            onChange={(e) => setRawData(e.target.value)}
            onBlur={() => handleDataImport(rawData)}
            className="bg-gray-800 border-gray-600 text-white font-mono text-xs min-h-32"
            placeholder="Paste JSON data here..."
          />
        )}
      </div>
    </div>
  )

  const renderStyleEditor = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-300">Chart Appearance</h3>
      
      <div className="space-y-3">
        <div>
          <Label className="text-xs text-gray-400">Chart Type</Label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {chartTypes.map(type => {
              const Icon = type.icon
              return (
                <Button
                  key={type.value}
                  variant={config.type === type.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateConfig({ type: type.value as any })}
                  className="flex flex-col items-center gap-1 h-auto py-3 text-white border-gray-600"
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs">{type.label}</span>
                </Button>
              )
            })}
          </div>
        </div>

        <div>
          <Label className="text-xs text-gray-400">Chart Title</Label>
          <Input
            value={config.title}
            onChange={(e) => updateConfig({ title: e.target.value })}
            className="bg-gray-800 border-gray-600 text-white"
          />
        </div>

        <div>
          <Label className="text-xs text-gray-400">X-Axis Field</Label>
          <Select value={config.xAxis} onValueChange={(value) => updateConfig({ xAxis: value })}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {getAvailableKeys().map(key => (
                <SelectItem key={key} value={key} className="text-white">
                  {key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-gray-400">Y-Axis Fields</Label>
          <div className="space-y-2">
            {getNumericKeys().map(key => (
              <div key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.yAxis.includes(key)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateConfig({ yAxis: [...config.yAxis, key] })
                    } else {
                      updateConfig({ yAxis: config.yAxis.filter(y => y !== key) })
                    }
                  }}
                  className="rounded"
                />
                <span className="text-sm text-gray-300">{key}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-xs text-gray-400">Color Scheme</Label>
          <div className="grid grid-cols-1 gap-2 mt-1">
            {colorPresets.map((preset, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => updateConfig({ colors: preset })}
                className="flex items-center gap-2 justify-start h-8 text-white border-gray-600"
              >
                <div className="flex gap-1">
                  {preset.map((color, colorIndex) => (
                    <div
                      key={colorIndex}
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className="text-xs">Palette {index + 1}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.showLegend}
              onChange={(e) => updateConfig({ showLegend: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm text-gray-300">Show Legend</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.showGrid}
              onChange={(e) => updateConfig({ showGrid: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm text-gray-300">Show Grid</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.animate}
              onChange={(e) => updateConfig({ animate: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm text-gray-300">Animate</span>
          </div>
        </div>
      </div>
    </div>
  )

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="flex h-full">
          {/* Left Panel - Controls */}
          <div className="w-80 border-r border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Chart Editor</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-400 hover:bg-gray-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-1 bg-gray-800 p-1 rounded mt-3">
                <Button
                  variant={activeTab === 'data' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('data')}
                  className="flex-1 text-xs"
                >
                  Data
                </Button>
                <Button
                  variant={activeTab === 'style' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('style')}
                  className="flex-1 text-xs"
                >
                  Style
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'data' && renderDataEditor()}
              {activeTab === 'style' && renderStyleEditor()}
            </div>

            <div className="p-4 border-t border-gray-700 flex gap-2">
              <Button
                onClick={() => onSave(config)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Chart
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="text-white border-gray-600 hover:bg-gray-700"
              >
                Cancel
              </Button>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-300">Preview</h3>
                <Badge variant="outline" className="text-gray-400">
                  {config.data.length} rows
                </Badge>
              </div>
            </div>

            <div className="flex-1 p-8 bg-white">
              <TremorChartRenderer
                data={config.data}
                type={config.type}
                title={config.title}
                xAxis={config.xAxis}
                yAxis={config.yAxis}
                colors={config.colors}
                showLegend={config.showLegend}
                showGrid={config.showGrid}
                animate={config.animate}
                height={400}
                consultingStyle={{
                  emphasizeInsight: true,
                  calloutValue: config.data.length > 0 ? Math.max(...config.data.map(d => d[config.yAxis[0]] || 0)) : undefined,
                  calloutLabel: 'Peak Performance',
                  annotations: config.data.length > 5 ? [{
                    x: config.data[Math.floor(config.data.length / 2)][config.xAxis],
                    y: 20,
                    text: 'Key Trend',
                    color: '#059669'
                  }] : undefined
                }}
                businessMetric={config.yAxis[0] || 'Performance'}
                audienceLevel="executive"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}