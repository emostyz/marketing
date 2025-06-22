'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Plus, Trash2, Edit3, Save, RotateCcw, Download,
  BarChart3, LineChart, PieChart, TrendingUp, Table,
  Palette, Settings, Eye, EyeOff, ChevronDown, ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  ResponsiveContainer, BarChart, Bar, LineChart as RechartsLineChart, Line,
  PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend
} from 'recharts'

interface ChartData {
  id: string
  type: 'bar' | 'line' | 'pie' | 'area'
  title: string
  data: any[]
  colors: string[]
  showLegend: boolean
  showGrid: boolean
  xAxisLabel?: string
  yAxisLabel?: string
}

interface AdvancedChartEditorProps {
  isOpen: boolean
  chartData: ChartData
  onSave: (chartData: ChartData) => void
  onClose: () => void
}

const CHART_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
]

const PRESET_COLOR_SCHEMES = [
  { name: 'Blue Ocean', colors: ['#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'] },
  { name: 'Green Forest', colors: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'] },
  { name: 'Red Fire', colors: ['#EF4444', '#F87171', '#FCA5A5', '#FECACA'] },
  { name: 'Purple Galaxy', colors: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'] },
  { name: 'Orange Sunset', colors: ['#F59E0B', '#FBBF24', '#FCD34D', '#FEF3C7'] },
  { name: 'Professional', colors: ['#1E40AF', '#7C3AED', '#059669', '#DC2626'] }
]

export function AdvancedChartEditor({ isOpen, chartData, onSave, onClose }: AdvancedChartEditorProps) {
  const [workingData, setWorkingData] = useState<ChartData>(chartData)
  const [editingCell, setEditingCell] = useState<{ row: number; key: string } | null>(null)
  const [expandedSection, setExpandedSection] = useState<string>('data')

  useEffect(() => {
    setWorkingData(chartData)
  }, [chartData])

  const handleSave = () => {
    onSave(workingData)
    onClose()
  }

  const addDataRow = () => {
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
  }

  const removeDataRow = (index: number) => {
    setWorkingData({
      ...workingData,
      data: workingData.data.filter((_, i) => i !== index)
    })
  }

  const updateDataCell = (rowIndex: number, key: string, value: any) => {
    const newData = [...workingData.data]
    newData[rowIndex] = { ...newData[rowIndex], [key]: value }
    setWorkingData({ ...workingData, data: newData })
  }

  const addDataColumn = () => {
    const columnName = `column_${Object.keys(workingData.data[0] || {}).length + 1}`
    const newData = workingData.data.map(row => ({ ...row, [columnName]: 0 }))
    setWorkingData({ ...workingData, data: newData })
  }

  const removeDataColumn = (columnKey: string) => {
    const newData = workingData.data.map(row => {
      const { [columnKey]: removed, ...rest } = row
      return rest
    })
    setWorkingData({ ...workingData, data: newData })
  }

  const renameColumn = (oldKey: string, newKey: string) => {
    const newData = workingData.data.map(row => {
      const { [oldKey]: value, ...rest } = row
      return { ...rest, [newKey]: value }
    })
    setWorkingData({ ...workingData, data: newData })
  }

  const applyColorScheme = (colors: string[]) => {
    setWorkingData({ ...workingData, colors })
  }

  const renderDataTable = () => {
    if (!workingData.data.length) return null

    const columns = Object.keys(workingData.data[0])

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Chart Data</h4>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={addDataColumn}>
              <Plus className="w-4 h-4 mr-1" />
              Column
            </Button>
            <Button variant="outline" size="sm" onClick={addDataRow}>
              <Plus className="w-4 h-4 mr-1" />
              Row
            </Button>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {columns.map((column, columnIndex) => (
                    <th key={column} className="p-3 text-left">
                      <div className="flex items-center space-x-2">
                        <Input
                          value={column}
                          onChange={(e) => renameColumn(column, e.target.value)}
                          className="h-7 text-xs font-medium"
                        />
                        {columns.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDataColumn(column)}
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="p-3 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {workingData.data.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b hover:bg-gray-50">
                    {columns.map((column) => (
                      <td key={`${rowIndex}-${column}`} className="p-3">
                        {editingCell?.row === rowIndex && editingCell?.key === column ? (
                          <Input
                            value={row[column]}
                            onChange={(e) => {
                              const value = column === 'name' || column === 'category' 
                                ? e.target.value 
                                : parseFloat(e.target.value) || 0
                              updateDataCell(rowIndex, column, value)
                            }}
                            onBlur={() => setEditingCell(null)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') setEditingCell(null)
                            }}
                            className="h-8 text-xs"
                            autoFocus
                          />
                        ) : (
                          <div
                            className="h-8 flex items-center cursor-pointer hover:bg-gray-100 px-2 rounded"
                            onClick={() => setEditingCell({ row: rowIndex, key: column })}
                          >
                            {row[column]}
                          </div>
                        )}
                      </td>
                    ))}
                    <td className="p-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDataRow(rowIndex)}
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  const renderChartPreview = () => {
    if (!workingData.data.length) return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">No data to display</p>
      </div>
    )

    return (
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {workingData.type === 'bar' && (
            <BarChart data={workingData.data}>
              {workingData.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              {workingData.showLegend && <Legend />}
              <Bar dataKey="value" fill={workingData.colors[0]} />
            </BarChart>
          )}
          {workingData.type === 'line' && (
            <RechartsLineChart data={workingData.data}>
              {workingData.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              {workingData.showLegend && <Legend />}
              <Line type="monotone" dataKey="value" stroke={workingData.colors[0]} strokeWidth={2} />
            </RechartsLineChart>
          )}
          {workingData.type === 'pie' && (
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
                  <Cell key={`cell-${index}`} fill={workingData.colors[index % workingData.colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              {workingData.showLegend && <Legend />}
            </RechartsPieChart>
          )}
        </ResponsiveContainer>
      </div>
    )
  }

  const renderSection = (title: string, icon: any, content: React.ReactNode, sectionKey: string) => {
    const Icon = icon
    const isExpanded = expandedSection === sectionKey

    return (
      <Card className="mb-4">
        <CardHeader 
          className="p-4 cursor-pointer" 
          onClick={() => setExpandedSection(isExpanded ? '' : sectionKey)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Icon className="w-4 h-4" />
              <span>{title}</span>
            </CardTitle>
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </CardHeader>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <CardContent className="p-4 pt-0">
                {content}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    )
  }

  if (!isOpen) return null

  return (
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
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Advanced Chart Editor</h2>
            <p className="text-gray-600 text-sm">Create and customize your chart</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => setWorkingData(chartData)}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Chart
            </Button>
            <Button variant="ghost" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Settings */}
          <div className="w-1/3 border-r bg-gray-50">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">

                {/* Chart Type */}
                {renderSection('Chart Type', BarChart3, (
                  <div className="space-y-3">
                    <Label>Chart Type</Label>
                    <Select
                      value={workingData.type}
                      onValueChange={(value: any) => setWorkingData({ ...workingData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bar">Bar Chart</SelectItem>
                        <SelectItem value="line">Line Chart</SelectItem>
                        <SelectItem value="pie">Pie Chart</SelectItem>
                      </SelectContent>
                    </Select>

                    <div>
                      <Label>Chart Title</Label>
                      <Input
                        value={workingData.title}
                        onChange={(e) => setWorkingData({ ...workingData, title: e.target.value })}
                        placeholder="Enter chart title"
                        className="mt-1"
                      />
                    </div>
                  </div>
                ), 'type')}

                {/* Chart Data */}
                {renderSection('Chart Data', Table, renderDataTable(), 'data')}

                {/* Colors */}
                {renderSection('Colors & Styling', Palette, (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm">Color Schemes</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {PRESET_COLOR_SCHEMES.map((scheme) => (
                          <Button
                            key={scheme.name}
                            variant="outline"
                            size="sm"
                            className="h-auto p-2 flex flex-col"
                            onClick={() => applyColorScheme(scheme.colors)}
                          >
                            <div className="flex space-x-1 mb-1">
                              {scheme.colors.slice(0, 4).map((color, i) => (
                                <div
                                  key={i}
                                  className="w-3 h-3 rounded"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                            <span className="text-xs">{scheme.name}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm">Custom Colors</Label>
                      <div className="grid grid-cols-5 gap-2 mt-2">
                        {workingData.colors.map((color, index) => (
                          <div key={index} className="relative">
                            <input
                              type="color"
                              value={color}
                              onChange={(e) => {
                                const newColors = [...workingData.colors]
                                newColors[index] = e.target.value
                                setWorkingData({ ...workingData, colors: newColors })
                              }}
                              className="w-full h-8 rounded border border-gray-200 cursor-pointer"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ), 'colors')}

                {/* Display Options */}
                {renderSection('Display Options', Settings, (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Show Legend</Label>
                      <Button
                        variant={workingData.showLegend ? "default" : "outline"}
                        size="sm"
                        onClick={() => setWorkingData({ ...workingData, showLegend: !workingData.showLegend })}
                      >
                        {workingData.showLegend ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Show Grid</Label>
                      <Button
                        variant={workingData.showGrid ? "default" : "outline"}
                        size="sm"
                        onClick={() => setWorkingData({ ...workingData, showGrid: !workingData.showGrid })}
                      >
                        {workingData.showGrid ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                    </div>

                    <div>
                      <Label className="text-sm">X-Axis Label</Label>
                      <Input
                        value={workingData.xAxisLabel || ''}
                        onChange={(e) => setWorkingData({ ...workingData, xAxisLabel: e.target.value })}
                        placeholder="X-axis label"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-sm">Y-Axis Label</Label>
                      <Input
                        value={workingData.yAxisLabel || ''}
                        onChange={(e) => setWorkingData({ ...workingData, yAxisLabel: e.target.value })}
                        placeholder="Y-axis label"
                        className="mt-1"
                      />
                    </div>
                  </div>
                ), 'display')}

              </div>
            </ScrollArea>
          </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 flex flex-col">
            <div className="p-6 border-b">
              <h3 className="font-semibold text-gray-900">Chart Preview</h3>
              <p className="text-sm text-gray-600">Live preview of your chart</p>
            </div>
            <div className="flex-1 p-6">
              {renderChartPreview()}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}