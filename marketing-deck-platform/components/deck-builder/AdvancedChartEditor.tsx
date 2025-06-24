'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3, LineChart, PieChart, TrendingUp, Table,
  Plus, Minus, Edit3, Save, RotateCcw, Download,
  Palette, Settings, Eye, EyeOff, ChevronDown, ChevronRight,
  Target, Zap, Brain, Sparkles, AlertTriangle, Info,
  Copy, Trash2, ArrowUp, ArrowDown, Filter, SortAsc
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import {
  ResponsiveContainer, BarChart, Bar, LineChart as RechartsLineChart, Line,
  PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, Area, AreaChart, ScatterChart, Scatter
} from 'recharts'
import { useNotifications } from '@/components/ui/NotificationSystem'

interface AdvancedChartEditorProps {
  chartData: any
  onUpdateChart: (updates: any) => void
  onClose: () => void
  isOpen: boolean
}

interface DataInsight {
  id: string
  type: 'trend' | 'outlier' | 'correlation' | 'pattern'
  title: string
  description: string
  confidence: number
  action?: () => void
}

const CHART_TYPES = [
  { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { value: 'line', label: 'Line Chart', icon: LineChart },
  { value: 'pie', label: 'Pie Chart', icon: PieChart },
  { value: 'area', label: 'Area Chart', icon: TrendingUp },
  { value: 'scatter', label: 'Scatter Plot', icon: Target }
]

const COLOR_PALETTES = [
  {
    name: 'Professional Blue',
    colors: ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe']
  },
  {
    name: 'Modern Green',
    colors: ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0']
  },
  {
    name: 'Vibrant Orange',
    colors: ['#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa']
  },
  {
    name: 'Purple Gradient',
    colors: ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe']
  },
  {
    name: 'Rainbow',
    colors: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6']
  }
]

export function AdvancedChartEditor({
  chartData,
  onUpdateChart,
  onClose,
  isOpen
}: AdvancedChartEditorProps) {
  const notifications = useNotifications()
  const [workingData, setWorkingData] = useState(chartData)
  const [activeTab, setActiveTab] = useState('data')
  const [selectedCells, setSelectedCells] = useState<string[]>([])
  const [dataInsights, setDataInsights] = useState<DataInsight[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  // Generate AI insights about the data
  const generateDataInsights = useCallback(async () => {
    setIsAnalyzing(true)
    
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const insights: DataInsight[] = [
        {
          id: '1',
          type: 'trend',
          title: 'Upward Trend Detected',
          description: 'Data shows a consistent 12% month-over-month growth pattern.',
          confidence: 92,
          action: () => addTrendLine()
        },
        {
          id: '2',
          type: 'outlier',
          title: 'Outlier in March Data',
          description: 'March value (450) is 23% higher than expected based on trend.',
          confidence: 87,
          action: () => highlightOutlier()
        },
        {
          id: '3',
          type: 'pattern',
          title: 'Seasonal Pattern',
          description: 'Q4 typically shows 18% higher values than Q2-Q3 average.',
          confidence: 78,
          action: () => addSeasonalAnnotation()
        }
      ]
      
      setDataInsights(insights)
      notifications.showSuccess('Analysis Complete', `Found ${insights.length} data insights`)
    } catch (error) {
      notifications.showError('Analysis Failed', 'Could not analyze chart data')
    } finally {
      setIsAnalyzing(false)
    }
  }, [notifications])

  // Data manipulation functions
  const addDataRow = useCallback(() => {
    let newRow: any = {}
    if (workingData.data.length > 0) {
      Object.keys(workingData.data[0]).forEach(key => {
        newRow[key] = key === 'name' || key === 'category' ? `New ${key}` : 0
      })
    } else {
      newRow = { name: 'New Item', value: 100 }
    }
    
    setWorkingData({
      ...workingData,
      data: [...workingData.data, newRow]
    })
  }, [workingData])

  const removeDataRow = useCallback((index: number) => {
    setWorkingData({
      ...workingData,
      data: workingData.data.filter((_: any, i: number) => i !== index)
    })
  }, [workingData])

  const updateCell = useCallback((rowIndex: number, key: string, value: any) => {
    const newData = [...workingData.data]
    newData[rowIndex] = { ...newData[rowIndex], [key]: value }
    setWorkingData({ ...workingData, data: newData })
  }, [workingData])

  const addColumn = useCallback(() => {
    const columnName = `column_${Object.keys(workingData.data[0] || {}).length + 1}`
    const newData = workingData.data.map((row: any) => ({ ...row, [columnName]: 0 }))
    setWorkingData({ ...workingData, data: newData })
  }, [workingData])

  const removeColumn = useCallback((columnKey: string) => {
    const newData = workingData.data.map((row: any) => {
      const { [columnKey]: removed, ...rest } = row
      return rest
    })
    setWorkingData({ ...workingData, data: newData })
  }, [workingData])

  // AI enhancement functions
  const addTrendLine = useCallback(() => {
    setWorkingData({
      ...workingData,
      showTrendLine: true,
      config: {
        ...workingData.config,
        trendLine: { show: true, color: '#ef4444' }
      }
    })
    notifications.showSuccess('Trend Line Added', 'Trend line visualization enabled')
  }, [workingData, notifications])

  const highlightOutlier = useCallback(() => {
    notifications.showSuccess('Outlier Highlighted', 'Outlier data points marked for attention')
  }, [notifications])

  const addSeasonalAnnotation = useCallback(() => {
    notifications.showSuccess('Annotation Added', 'Seasonal pattern annotation added')
  }, [notifications])

  const applyColorPalette = useCallback((palette: any) => {
    setWorkingData({
      ...workingData,
      colors: palette.colors
    })
  }, [workingData])

  const changeChartType = useCallback((newType: string) => {
    setWorkingData({
      ...workingData,
      type: newType
    })
  }, [workingData])

  const handleSave = useCallback(() => {
    onUpdateChart(workingData)
    onClose()
  }, [workingData, onUpdateChart, onClose])

  const renderChart = useMemo(() => {
    if (!workingData.data.length) return null

    const chartProps = {
      data: workingData.data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    }

    switch (workingData.type) {
      case 'bar':
        return (
          <BarChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill={workingData.colors?.[0] || '#3b82f6'} />
          </BarChart>
        )
      
      case 'line':
        return (
          <RechartsLineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={workingData.colors?.[0] || '#3b82f6'} 
              strokeWidth={2}
            />
          </RechartsLineChart>
        )
      
      case 'pie':
        return (
          <RechartsPieChart>
            <Pie
              data={workingData.data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label
            >
              {workingData.data.map((entry: any, index: number) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={workingData.colors?.[index % workingData.colors.length] || '#3b82f6'} 
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </RechartsPieChart>
        )
      
      case 'area':
        return (
          <AreaChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="value"
              stroke={workingData.colors?.[0] || '#3b82f6'}
              fill={workingData.colors?.[0] || '#3b82f6'}
              fillOpacity={0.3}
            />
          </AreaChart>
        )
      
      default:
        return null
    }
  }, [workingData])

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-full max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Advanced Chart Editor</h2>
              <p className="text-blue-100">
                Edit data, customize appearance, and get AI-powered insights
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-blue-600"
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span className="ml-2">{previewMode ? 'Edit' : 'Preview'}</span>
              </Button>
              <Button
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-blue-600"
                onClick={generateDataInsights}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <Brain className="w-4 h-4" />
                )}
                <span className="ml-2">AI Insights</span>
              </Button>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                ✕
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Controls */}
          <div className="w-80 border-r border-gray-200 bg-gray-50">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-4 mx-4 mt-4">
                <TabsTrigger value="data">Data</TabsTrigger>
                <TabsTrigger value="style">Style</TabsTrigger>
                <TabsTrigger value="ai">AI</TabsTrigger>
                <TabsTrigger value="config">Config</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="data" className="h-full">
                  <ScrollArea className="h-full px-4">
                    <div className="space-y-4 py-4">
                      {/* Chart Type Selection */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Chart Type</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Select 
                            value={workingData.type} 
                            onValueChange={changeChartType}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CHART_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  <div className="flex items-center space-x-2">
                                    <type.icon className="w-4 h-4" />
                                    <span>{type.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </CardContent>
                      </Card>

                      {/* Data Table */}
                      <Card>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">Data Table</CardTitle>
                            <div className="flex space-x-1">
                              <Button size="sm" variant="outline" onClick={addDataRow}>
                                <Plus className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={addColumn}>
                                <Plus className="w-3 h-3 mr-1" />
                                Col
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {workingData.data.length > 0 ? (
                            <div className="border rounded-lg overflow-hidden">
                              <div className="overflow-x-auto max-h-60">
                                <table className="w-full text-sm">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      {Object.keys(workingData.data[0]).map((column) => (
                                        <th key={column} className="p-2 text-left border-b">
                                          <div className="flex items-center space-x-1">
                                            <span>{column}</span>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => removeColumn(column)}
                                              className="h-4 w-4 p-0"
                                            >
                                              <Minus className="w-2 h-2" />
                                            </Button>
                                          </div>
                                        </th>
                                      ))}
                                      <th className="p-2 w-8"></th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {workingData.data.map((row: any, rowIndex: number) => (
                                      <tr key={rowIndex} className="hover:bg-gray-50">
                                        {Object.entries(row).map(([key, value]: [string, any]) => (
                                          <td key={`${rowIndex}-${key}`} className="p-2 border-b">
                                            <Input
                                              value={value}
                                              onChange={(e) => {
                                                const newValue = key === 'name' || key === 'category' 
                                                  ? e.target.value 
                                                  : parseFloat(e.target.value) || 0
                                                updateCell(rowIndex, key, newValue)
                                              }}
                                              className="h-6 text-xs border-0 focus:border-blue-300"
                                            />
                                          </td>
                                        ))}
                                        <td className="p-2 border-b">
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => removeDataRow(rowIndex)}
                                            className="h-4 w-4 p-0 text-red-500"
                                          >
                                            <Trash2 className="w-2 h-2" />
                                          </Button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500">
                              <Table className="w-8 h-8 mx-auto mb-2 opacity-30" />
                              <p className="text-xs">No data available</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="style" className="h-full">
                  <ScrollArea className="h-full px-4">
                    <div className="space-y-4 py-4">
                      {/* Color Palettes */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Color Palette</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {COLOR_PALETTES.map((palette) => (
                            <motion.div
                              key={palette.name}
                              whileHover={{ scale: 1.02 }}
                              className="cursor-pointer p-2 border rounded-lg hover:shadow-sm"
                              onClick={() => applyColorPalette(palette)}
                            >
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-xs font-medium">{palette.name}</span>
                              </div>
                              <div className="flex space-x-1">
                                {palette.colors.map((color, index) => (
                                  <div
                                    key={index}
                                    className="w-4 h-4 rounded border border-gray-200"
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                            </motion.div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Chart Settings */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Chart Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label className="text-xs">Title</Label>
                            <Input
                              value={workingData.title || ''}
                              onChange={(e) => setWorkingData({ ...workingData, title: e.target.value })}
                              className="h-7 text-xs mt-1"
                              placeholder="Chart title"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Show Legend</Label>
                            <Button
                              size="sm"
                              variant={workingData.showLegend ? "default" : "outline"}
                              onClick={() => setWorkingData({ 
                                ...workingData, 
                                showLegend: !workingData.showLegend 
                              })}
                              className="h-6"
                            >
                              {workingData.showLegend ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Show Grid</Label>
                            <Button
                              size="sm"
                              variant={workingData.showGrid ? "default" : "outline"}
                              onClick={() => setWorkingData({ 
                                ...workingData, 
                                showGrid: !workingData.showGrid 
                              })}
                              className="h-6"
                            >
                              {workingData.showGrid ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="ai" className="h-full">
                  <ScrollArea className="h-full px-4">
                    <div className="space-y-4 py-4">
                      {dataInsights.length > 0 ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-sm">Data Insights</h3>
                            <Badge variant="secondary">{dataInsights.length} insights</Badge>
                          </div>
                          {dataInsights.map((insight) => (
                            <Card key={insight.id} className="border-l-4 border-l-blue-500">
                              <CardContent className="p-3">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-medium text-sm">{insight.title}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {insight.confidence}% confident
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600 mb-3">{insight.description}</p>
                                {insight.action && (
                                  <Button
                                    size="sm"
                                    onClick={insight.action}
                                    className="h-6 text-xs"
                                  >
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    Apply
                                  </Button>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p className="text-sm mb-3">No insights generated yet</p>
                          <Button 
                            size="sm" 
                            onClick={generateDataInsights}
                            disabled={isAnalyzing}
                          >
                            <Zap className="w-4 h-4 mr-2" />
                            Analyze Data
                          </Button>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="config" className="h-full">
                  <ScrollArea className="h-full px-4">
                    <div className="space-y-4 py-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Advanced Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label className="text-xs">Animation Duration (ms)</Label>
                            <Slider
                              value={[workingData.animationDuration || 1000]}
                              onValueChange={([value]) => setWorkingData({ 
                                ...workingData, 
                                animationDuration: value 
                              })}
                              min={0}
                              max={3000}
                              step={100}
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Chart Opacity</Label>
                            <Slider
                              value={[workingData.opacity || 1]}
                              onValueChange={([value]) => setWorkingData({ 
                                ...workingData, 
                                opacity: value 
                              })}
                              min={0.1}
                              max={1}
                              step={0.1}
                              className="mt-2"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Right Panel - Chart Preview */}
          <div className="flex-1 flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Chart Preview</h3>
                  <p className="text-gray-600 text-sm">Live preview of your chart</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button size="sm" variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 flex items-center justify-center">
              {renderChart ? (
                <ResponsiveContainer width="100%" height="100%">
                  {renderChart}
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-gray-500">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>No chart data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}