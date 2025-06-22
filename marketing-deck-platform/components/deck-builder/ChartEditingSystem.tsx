'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart3, LineChart, PieChart, TrendingUp, Target, Zap,
  Download, Upload, Settings, Palette, Type, Grid, Eye,
  EyeOff, RotateCw, Move, Copy, Trash2, Plus, Minus,
  ChevronDown, ChevronRight, MoreHorizontal, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ColorPicker } from '@/components/ui/color-picker'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { 
  ResponsiveContainer, BarChart, Bar, LineChart as RechartsLineChart, Line, 
  PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, Area, AreaChart, ScatterChart, Scatter,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Treemap, FunnelChart, Funnel, LabelList
} from 'recharts'

interface ChartData {
  id: string
  name: string
  data: any[]
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'radar' | 'treemap' | 'funnel'
  title: string
  subtitle?: string
  xAxisLabel?: string
  yAxisLabel?: string
  colors: string[]
  showGrid: boolean
  showLegend: boolean
  showTooltip: boolean
  showLabels: boolean
  theme: 'default' | 'dark' | 'colorful' | 'minimal' | 'corporate'
  animation: boolean
  dataKeys: string[]
  customStyles: any
}

interface ChartEditingSystemProps {
  chartData: ChartData
  onUpdateChart: (updates: Partial<ChartData>) => void
  onClose: () => void
  isOpen: boolean
}

export function ChartEditingSystem({ 
  chartData, 
  onUpdateChart, 
  onClose, 
  isOpen 
}: ChartEditingSystemProps) {
  const [activeTab, setActiveTab] = useState<'data' | 'design' | 'advanced'>('data')
  const [editingDataIndex, setEditingDataIndex] = useState<number | null>(null)
  const [newDataPoint, setNewDataPoint] = useState<any>({})
  const [chartPreview, setChartPreview] = useState<ChartData>(chartData)
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])

  useEffect(() => {
    setChartPreview(chartData)
  }, [chartData])

  const predefinedColors = [
    ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
    ['#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'],
    ['#1f2937', '#374151', '#6b7280', '#9ca3af', '#d1d5db'],
    ['#059669', '#0d9488', '#0891b2', '#0284c7', '#2563eb'],
    ['#dc2626', '#ea580c', '#d97706', '#ca8a04', '#65a30d']
  ]

  const chartThemes = {
    default: {
      backgroundColor: '#ffffff',
      textColor: '#374151',
      gridColor: '#e5e7eb',
      colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']
    },
    dark: {
      backgroundColor: '#1f2937',
      textColor: '#f9fafb',
      gridColor: '#374151',
      colors: ['#60a5fa', '#f87171', '#34d399', '#fbbf24', '#a78bfa']
    },
    colorful: {
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      gridColor: '#e5e7eb',
      colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57']
    },
    minimal: {
      backgroundColor: '#fafafa',
      textColor: '#525252',
      gridColor: '#d4d4d8',
      colors: ['#404040', '#737373', '#a3a3a3', '#d4d4d8', '#e5e5e5']
    },
    corporate: {
      backgroundColor: '#ffffff',
      textColor: '#1e293b',
      gridColor: '#e2e8f0',
      colors: ['#0f172a', '#334155', '#64748b', '#94a3b8', '#cbd5e1']
    }
  }

  const updateChartPreview = (updates: Partial<ChartData>) => {
    const newChartData = { ...chartPreview, ...updates }
    setChartPreview(newChartData)
    onUpdateChart(updates)
  }

  const addDataPoint = () => {
    if (!newDataPoint.name) return

    const updatedData = [...chartPreview.data, newDataPoint]
    updateChartPreview({ data: updatedData })
    setNewDataPoint({})
  }

  const updateDataPoint = (index: number, updates: any) => {
    const updatedData = chartPreview.data.map((item, i) => 
      i === index ? { ...item, ...updates } : item
    )
    updateChartPreview({ data: updatedData })
  }

  const deleteDataPoint = (index: number) => {
    const updatedData = chartPreview.data.filter((_, i) => i !== index)
    updateChartPreview({ data: updatedData })
  }

  const generateChartInsights = async () => {
    setIsGeneratingInsights(true)
    try {
      // Simulate AI insights generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const insights = [
        {
          type: 'trend',
          title: 'Upward Trend Detected',
          description: 'Data shows a 23% increase over the period',
          suggestion: 'Consider highlighting this growth in your presentation'
        },
        {
          type: 'outlier',
          title: 'Notable Data Point',
          description: 'March shows significantly higher values',
          suggestion: 'Add annotation to explain this spike'
        },
        {
          type: 'optimization',
          title: 'Chart Type Suggestion',
          description: 'A line chart might better show trends over time',
          suggestion: 'Switch to line chart for better trend visualization'
        }
      ]
      
      setSuggestions(insights)
    } catch (error) {
      console.error('Error generating insights:', error)
    } finally {
      setIsGeneratingInsights(false)
    }
  }

  const applyTheme = (themeName: keyof typeof chartThemes) => {
    const theme = chartThemes[themeName]
    updateChartPreview({
      theme: themeName,
      colors: theme.colors,
      customStyles: {
        ...chartPreview.customStyles,
        backgroundColor: theme.backgroundColor,
        textColor: theme.textColor,
        gridColor: theme.gridColor
      }
    })
  }

  const exportChartData = () => {
    const dataStr = JSON.stringify(chartPreview.data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${chartPreview.title || 'chart'}_data.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const renderChart = () => {
    const theme = chartThemes[chartPreview.theme]
    
    switch (chartPreview.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartPreview.data}>
              {chartPreview.showGrid && <CartesianGrid strokeDasharray="3 3" stroke={theme.gridColor} />}
              <XAxis 
                dataKey="name" 
                tick={{ fill: theme.textColor, fontSize: 12 }}
                axisLine={{ stroke: theme.gridColor }}
              />
              <YAxis 
                tick={{ fill: theme.textColor, fontSize: 12 }}
                axisLine={{ stroke: theme.gridColor }}
              />
              {chartPreview.showTooltip && <Tooltip />}
              {chartPreview.showLegend && <Legend />}
              {chartPreview.dataKeys.map((key, index) => (
                <Bar 
                  key={key}
                  dataKey={key} 
                  fill={chartPreview.colors[index % chartPreview.colors.length]}
                  animationDuration={chartPreview.animation ? 1000 : 0}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={chartPreview.data}>
              {chartPreview.showGrid && <CartesianGrid strokeDasharray="3 3" stroke={theme.gridColor} />}
              <XAxis 
                dataKey="name" 
                tick={{ fill: theme.textColor, fontSize: 12 }}
                axisLine={{ stroke: theme.gridColor }}
              />
              <YAxis 
                tick={{ fill: theme.textColor, fontSize: 12 }}
                axisLine={{ stroke: theme.gridColor }}
              />
              {chartPreview.showTooltip && <Tooltip />}
              {chartPreview.showLegend && <Legend />}
              {chartPreview.dataKeys.map((key, index) => (
                <Line 
                  key={key}
                  type="monotone" 
                  dataKey={key} 
                  stroke={chartPreview.colors[index % chartPreview.colors.length]}
                  strokeWidth={3}
                  dot={{ fill: chartPreview.colors[index % chartPreview.colors.length], r: 4 }}
                  animationDuration={chartPreview.animation ? 1000 : 0}
                />
              ))}
            </RechartsLineChart>
          </ResponsiveContainer>
        )
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={chartPreview.data}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey={chartPreview.dataKeys[0]}
                label={chartPreview.showLabels}
                animationDuration={chartPreview.animation ? 1000 : 0}
              >
                {chartPreview.data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={chartPreview.colors[index % chartPreview.colors.length]} 
                  />
                ))}
              </Pie>
              {chartPreview.showTooltip && <Tooltip />}
              {chartPreview.showLegend && <Legend />}
            </RechartsPieChart>
          </ResponsiveContainer>
        )
      
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartPreview.data}>
              {chartPreview.showGrid && <CartesianGrid strokeDasharray="3 3" stroke={theme.gridColor} />}
              <XAxis 
                dataKey="name" 
                tick={{ fill: theme.textColor, fontSize: 12 }}
                axisLine={{ stroke: theme.gridColor }}
              />
              <YAxis 
                tick={{ fill: theme.textColor, fontSize: 12 }}
                axisLine={{ stroke: theme.gridColor }}
              />
              {chartPreview.showTooltip && <Tooltip />}
              {chartPreview.showLegend && <Legend />}
              {chartPreview.dataKeys.map((key, index) => (
                <Area 
                  key={key}
                  type="monotone" 
                  dataKey={key} 
                  stackId="1"
                  stroke={chartPreview.colors[index % chartPreview.colors.length]}
                  fill={chartPreview.colors[index % chartPreview.colors.length]}
                  fillOpacity={0.6}
                  animationDuration={chartPreview.animation ? 1000 : 0}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )
      
      default:
        return (
          <div className="w-full h-[300px] bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">Select a chart type to preview</p>
            </div>
          </div>
        )
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Chart Editor</h2>
                <p className="text-gray-600">Design and customize your chart</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={generateChartInsights} disabled={isGeneratingInsights}>
                  {isGeneratingInsights ? (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                  AI Insights
                </Button>
                <Button variant="outline" onClick={exportChartData}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Left Panel - Chart Preview */}
              <div className="flex-1 p-6 bg-gray-50">
                <div className="bg-white rounded-lg p-6 h-full flex flex-col">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{chartPreview.title}</h3>
                    {chartPreview.subtitle && (
                      <p className="text-gray-600">{chartPreview.subtitle}</p>
                    )}
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center">
                    {renderChart()}
                  </div>
                  
                  {/* Chart Type Selector */}
                  <div className="mt-4 flex justify-center space-x-2">
                    {[
                      { type: 'bar', icon: BarChart3, label: 'Bar' },
                      { type: 'line', icon: LineChart, label: 'Line' },
                      { type: 'pie', icon: PieChart, label: 'Pie' },
                      { type: 'area', icon: TrendingUp, label: 'Area' }
                    ].map(({ type, icon: Icon, label }) => (
                      <Button
                        key={type}
                        variant={chartPreview.type === type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateChartPreview({ type: type as any })}
                        className="flex flex-col items-center py-3 px-4"
                      >
                        <Icon className="w-4 h-4 mb-1" />
                        <span className="text-xs">{label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Panel - Controls */}
              <div className="w-96 border-l border-gray-200 bg-white">
                <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="h-full flex flex-col">
                  <TabsList className="grid w-full grid-cols-3 p-1 m-4">
                    <TabsTrigger value="data">Data</TabsTrigger>
                    <TabsTrigger value="design">Design</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>

                  <div className="flex-1 overflow-hidden">
                    <TabsContent value="data" className="h-full p-4 pt-0">
                      <ScrollArea className="h-full">
                        <div className="space-y-4">
                          {/* Chart Title */}
                          <div>
                            <Label>Chart Title</Label>
                            <Input
                              value={chartPreview.title}
                              onChange={(e) => updateChartPreview({ title: e.target.value })}
                              placeholder="Enter chart title"
                              className="mt-1"
                            />
                          </div>

                          {/* Subtitle */}
                          <div>
                            <Label>Subtitle (Optional)</Label>
                            <Input
                              value={chartPreview.subtitle || ''}
                              onChange={(e) => updateChartPreview({ subtitle: e.target.value })}
                              placeholder="Enter subtitle"
                              className="mt-1"
                            />
                          </div>

                          {/* Data Points */}
                          <div>
                            <Label>Data Points</Label>
                            <div className="mt-2 space-y-2">
                              {chartPreview.data.map((item, index) => (
                                <Card key={index} className="p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium">{item.name}</span>
                                    <div className="flex space-x-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setEditingDataIndex(editingDataIndex === index ? null : index)}
                                      >
                                        <Settings className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteDataPoint(index)}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  {editingDataIndex === index && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      className="space-y-2 border-t pt-2"
                                    >
                                      <Input
                                        value={item.name}
                                        onChange={(e) => updateDataPoint(index, { name: e.target.value })}
                                        placeholder="Label"
                                      />
                                      {chartPreview.dataKeys.map((key) => (
                                        <Input
                                          key={key}
                                          type="number"
                                          value={item[key] || 0}
                                          onChange={(e) => updateDataPoint(index, { [key]: Number(e.target.value) })}
                                          placeholder={key}
                                        />
                                      ))}
                                    </motion.div>
                                  )}
                                </Card>
                              ))}

                              {/* Add New Data Point */}
                              <Card className="p-3 border-dashed border-gray-300">
                                <div className="space-y-2">
                                  <Input
                                    value={newDataPoint.name || ''}
                                    onChange={(e) => setNewDataPoint({ ...newDataPoint, name: e.target.value })}
                                    placeholder="Label"
                                  />
                                  {chartPreview.dataKeys.map((key) => (
                                    <Input
                                      key={key}
                                      type="number"
                                      value={newDataPoint[key] || ''}
                                      onChange={(e) => setNewDataPoint({ ...newDataPoint, [key]: Number(e.target.value) })}
                                      placeholder={key}
                                    />
                                  ))}
                                  <Button onClick={addDataPoint} className="w-full" size="sm">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Data Point
                                  </Button>
                                </div>
                              </Card>
                            </div>
                          </div>
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="design" className="h-full p-4 pt-0">
                      <ScrollArea className="h-full">
                        <div className="space-y-6">
                          {/* Theme Selection */}
                          <div>
                            <Label>Theme</Label>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                              {Object.entries(chartThemes).map(([name, theme]) => (
                                <Button
                                  key={name}
                                  variant={chartPreview.theme === name ? 'default' : 'outline'}
                                  className="flex flex-col items-center p-3 h-auto"
                                  onClick={() => applyTheme(name as any)}
                                >
                                  <div className="flex space-x-1 mb-2">
                                    {theme.colors.slice(0, 3).map((color, i) => (
                                      <div
                                        key={i}
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: color }}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs capitalize">{name}</span>
                                </Button>
                              ))}
                            </div>
                          </div>

                          {/* Color Palette */}
                          <div>
                            <Label>Color Palette</Label>
                            <div className="mt-2 space-y-2">
                              {predefinedColors.map((palette, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  className="w-full h-10 p-2"
                                  onClick={() => updateChartPreview({ colors: palette })}
                                >
                                  <div className="flex space-x-1 justify-center">
                                    {palette.map((color, i) => (
                                      <div
                                        key={i}
                                        className="w-6 h-6 rounded"
                                        style={{ backgroundColor: color }}
                                      />
                                    ))}
                                  </div>
                                </Button>
                              ))}
                            </div>
                          </div>

                          {/* Chart Options */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label>Show Grid</Label>
                              <Switch
                                checked={chartPreview.showGrid}
                                onCheckedChange={(checked) => updateChartPreview({ showGrid: checked })}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Label>Show Legend</Label>
                              <Switch
                                checked={chartPreview.showLegend}
                                onCheckedChange={(checked) => updateChartPreview({ showLegend: checked })}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Label>Show Tooltip</Label>
                              <Switch
                                checked={chartPreview.showTooltip}
                                onCheckedChange={(checked) => updateChartPreview({ showTooltip: checked })}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Label>Show Labels</Label>
                              <Switch
                                checked={chartPreview.showLabels}
                                onCheckedChange={(checked) => updateChartPreview({ showLabels: checked })}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Label>Animation</Label>
                              <Switch
                                checked={chartPreview.animation}
                                onCheckedChange={(checked) => updateChartPreview({ animation: checked })}
                              />
                            </div>
                          </div>
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="advanced" className="h-full p-4 pt-0">
                      <ScrollArea className="h-full">
                        <div className="space-y-6">
                          {/* AI Suggestions */}
                          {suggestions.length > 0 && (
                            <div>
                              <Label>AI Suggestions</Label>
                              <div className="mt-2 space-y-2">
                                {suggestions.map((suggestion, index) => (
                                  <Card key={index} className="p-3">
                                    <div className="flex items-start space-x-2">
                                      <Badge variant="secondary" className="mt-0.5">
                                        {suggestion.type}
                                      </Badge>
                                      <div className="flex-1">
                                        <h4 className="font-medium text-sm">{suggestion.title}</h4>
                                        <p className="text-xs text-gray-600 mt-1">{suggestion.description}</p>
                                        <p className="text-xs text-blue-600 mt-1">{suggestion.suggestion}</p>
                                      </div>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Data Keys Configuration */}
                          <div>
                            <Label>Data Series</Label>
                            <div className="mt-2 space-y-2">
                              {chartPreview.dataKeys.map((key, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <Input
                                    value={key}
                                    onChange={(e) => {
                                      const newKeys = [...chartPreview.dataKeys]
                                      newKeys[index] = e.target.value
                                      updateChartPreview({ dataKeys: newKeys })
                                    }}
                                    className="flex-1"
                                  />
                                  <ColorPicker
                                    value={chartPreview.colors[index] || '#3b82f6'}
                                    onChange={(color) => {
                                      const newColors = [...chartPreview.colors]
                                      newColors[index] = color
                                      updateChartPreview({ colors: newColors })
                                    }}
                                    trigger={
                                      <Button variant="outline" size="sm" className="px-3">
                                        <Palette className="w-4 h-4" />
                                      </Button>
                                    }
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const newKeys = chartPreview.dataKeys.filter((_, i) => i !== index)
                                      updateChartPreview({ dataKeys: newKeys })
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newKeys = [...chartPreview.dataKeys, `Series ${chartPreview.dataKeys.length + 1}`]
                                  updateChartPreview({ dataKeys: newKeys })
                                }}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Series
                              </Button>
                            </div>
                          </div>

                          {/* Axis Labels */}
                          <div className="space-y-4">
                            <div>
                              <Label>X-Axis Label</Label>
                              <Input
                                value={chartPreview.xAxisLabel || ''}
                                onChange={(e) => updateChartPreview({ xAxisLabel: e.target.value })}
                                placeholder="X-axis label"
                                className="mt-1"
                              />
                            </div>
                            
                            <div>
                              <Label>Y-Axis Label</Label>
                              <Input
                                value={chartPreview.yAxisLabel || ''}
                                onChange={(e) => updateChartPreview({ yAxisLabel: e.target.value })}
                                placeholder="Y-axis label"
                                className="mt-1"
                              />
                            </div>
                          </div>

                          {/* Custom CSS */}
                          <div>
                            <Label>Custom Styles (CSS)</Label>
                            <Textarea
                              value={JSON.stringify(chartPreview.customStyles || {}, null, 2)}
                              onChange={(e) => {
                                try {
                                  const styles = JSON.parse(e.target.value)
                                  updateChartPreview({ customStyles: styles })
                                } catch (error) {
                                  // Invalid JSON, ignore
                                }
                              }}
                              placeholder="Custom CSS styles in JSON format"
                              className="mt-1 font-mono text-sm"
                              rows={6}
                            />
                          </div>
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                {chartPreview.data.length} data points • {chartPreview.dataKeys.length} series
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={() => onUpdateChart(chartPreview)}>
                  Apply Changes
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}