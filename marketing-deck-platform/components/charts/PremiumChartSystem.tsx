'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  Settings,
  Palette,
  BarChart3,
  LineChart as LineIcon,
  PieChart as PieIcon,
  Activity,
  Layers,
  Eye,
  EyeOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ChartDataPoint {
  [key: string]: any
}

interface ChartConfig {
  type: 'bar' | 'line' | 'area' | 'pie' | 'combo'
  title: string
  subtitle?: string
  data: ChartDataPoint[]
  xAxis: string
  yAxis: string[]
  colors: string[]
  theme: 'mckinsey' | 'bcg' | 'bain' | 'corporate' | 'startup'
  showGrid: boolean
  showLegend: boolean
  showTrendline: boolean
  annotations: ChartAnnotation[]
  insights: ChartInsight[]
}

interface ChartAnnotation {
  type: 'point' | 'line' | 'area'
  value: number | string
  label: string
  color: string
}

interface ChartInsight {
  id: string
  type: 'trend' | 'outlier' | 'correlation' | 'forecast'
  title: string
  description: string
  confidence: number
  impact: 'high' | 'medium' | 'low'
}

interface PremiumChartSystemProps {
  config: ChartConfig
  onConfigChange?: (config: ChartConfig) => void
  interactive?: boolean
  className?: string
}

// Professional color schemes based on top consulting firms
const THEME_PALETTES = {
  mckinsey: {
    primary: '#003366',
    secondary: '#0066CC',
    accent: '#FFD700',
    colors: ['#003366', '#0066CC', '#FFD700', '#00A86B', '#FF6B35', '#8B5A2B']
  },
  bcg: {
    primary: '#005A5B',
    secondary: '#00A3A4',
    accent: '#FF6B35',
    colors: ['#005A5B', '#00A3A4', '#FF6B35', '#4A90E2', '#7ED321', '#F5A623']
  },
  bain: {
    primary: '#CC092F',
    secondary: '#E51937',
    accent: '#F8D7DA',
    colors: ['#CC092F', '#E51937', '#F8D7DA', '#1E3A8A', '#059669', '#D97706']
  },
  corporate: {
    primary: '#1E3A8A',
    secondary: '#3B82F6',
    accent: '#DBEAFE',
    colors: ['#1E3A8A', '#3B82F6', '#DBEAFE', '#059669', '#DC2626', '#7C2D12']
  },
  startup: {
    primary: '#111827',
    secondary: '#6B7280',
    accent: '#10B981',
    colors: ['#111827', '#6B7280', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444']
  }
}

// Advanced chart templates
const CHART_TEMPLATES = [
  {
    id: 'executive-overview',
    name: 'Executive Overview',
    type: 'bar' as const,
    description: 'Clean bar chart with emphasis on key metrics',
    config: {
      showGrid: true,
      showLegend: false,
      showTrendline: false,
      annotations: []
    }
  },
  {
    id: 'trend-analysis',
    name: 'Trend Analysis',
    type: 'line' as const,
    description: 'Line chart with trend indicators and forecasting',
    config: {
      showGrid: true,
      showLegend: true,
      showTrendline: true,
      annotations: []
    }
  },
  {
    id: 'market-share',
    name: 'Market Share',
    type: 'pie' as const,
    description: 'Pie chart with professional segmentation',
    config: {
      showGrid: false,
      showLegend: true,
      showTrendline: false,
      annotations: []
    }
  },
  {
    id: 'performance-area',
    name: 'Performance Overview',
    type: 'area' as const,
    description: 'Area chart showing cumulative performance',
    config: {
      showGrid: true,
      showLegend: true,
      showTrendline: false,
      annotations: []
    }
  }
]

export function PremiumChartSystem({
  config,
  onConfigChange,
  interactive = true,
  className = ''
}: PremiumChartSystemProps) {
  const [activeInsight, setActiveInsight] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  const currentTheme = THEME_PALETTES[config.theme] || THEME_PALETTES.corporate

  // Generate dynamic insights based on data
  const generateInsights = useCallback((data: ChartDataPoint[]) => {
    if (!data || data.length === 0) return []

    const insights: ChartInsight[] = []
    
    // Trend analysis
    if (data.length > 2) {
      const values = data.map(d => d[config.yAxis[0]] || 0)
      const trend = values[values.length - 1] - values[0]
      
      insights.push({
        id: 'trend',
        type: 'trend',
        title: trend > 0 ? 'Positive Growth Trend' : 'Declining Trend',
        description: `${Math.abs(trend).toFixed(1)} point ${trend > 0 ? 'increase' : 'decrease'} from start to end`,
        confidence: 85,
        impact: Math.abs(trend) > 100 ? 'high' : 'medium'
      })
    }

    // Outlier detection
    const values = data.map(d => d[config.yAxis[0]] || 0)
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const outliers = values.filter(val => Math.abs(val - mean) > mean * 0.3)
    
    if (outliers.length > 0) {
      insights.push({
        id: 'outlier',
        type: 'outlier',
        title: 'Outliers Detected',
        description: `${outliers.length} data points significantly above/below average`,
        confidence: 92,
        impact: 'medium'
      })
    }

    return insights
  }, [config.yAxis])

  const insights = useMemo(() => generateInsights(config.data), [config.data, generateInsights])

  const renderChart = () => {
    if (!config.data || config.data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>No data available</p>
          </div>
        </div>
      )
    }

    const commonProps = {
      data: config.data,
      margin: { top: 20, right: 30, left: 20, bottom: 20 }
    }

    const customTooltip = ({ active, payload, label }: any) => {
      if (!active || !payload || !payload.length) return null

      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </p>
          ))}
        </div>
      )
    }

    switch (config.type) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis 
              dataKey={config.xAxis} 
              stroke="#6b7280" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6b7280" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip content={customTooltip} />
            {config.showLegend && <Legend />}
            {config.yAxis.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={config.colors[index % config.colors.length]}
                radius={[4, 4, 0, 0]}
                name={key}
              />
            ))}
            {config.annotations.map((annotation, index) => (
              annotation.type === 'line' && (
                <ReferenceLine
                  key={index}
                  y={annotation.value as number}
                  stroke={annotation.color}
                  strokeDasharray="5 5"
                  label={{ value: annotation.label, position: 'top' }}
                />
              )
            ))}
          </BarChart>
        )

      case 'line':
        return (
          <LineChart {...commonProps}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis 
              dataKey={config.xAxis} 
              stroke="#6b7280" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6b7280" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip content={customTooltip} />
            {config.showLegend && <Legend />}
            {config.yAxis.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={config.colors[index % config.colors.length]}
                strokeWidth={3}
                dot={{ fill: config.colors[index % config.colors.length], strokeWidth: 0, r: 5 }}
                activeDot={{ r: 7, stroke: config.colors[index % config.colors.length], strokeWidth: 2, fill: '#fff' }}
                name={key}
              />
            ))}
          </LineChart>
        )

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis 
              dataKey={config.xAxis} 
              stroke="#6b7280" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6b7280" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip content={customTooltip} />
            {config.showLegend && <Legend />}
            {config.yAxis.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={config.colors[index % config.colors.length]}
                fill={config.colors[index % config.colors.length]}
                fillOpacity={0.4}
                strokeWidth={2}
                name={key}
              />
            ))}
          </AreaChart>
        )

      case 'pie':
        const pieData = config.data.map((item, index) => ({
          name: item[config.xAxis],
          value: item[config.yAxis[0]],
          fill: config.colors[index % config.colors.length]
        }))

        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={120}
              innerRadius={40}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={customTooltip} />
            {config.showLegend && <Legend />}
          </PieChart>
        )

      default:
        return <div className="flex items-center justify-center h-full text-gray-500">Chart type not supported</div>;
    }
  }

  const renderInsights = () => {
    if (!insights.length) return null

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900 flex items-center">
          <Zap className="w-4 h-4 mr-2 text-yellow-500" />
          AI Insights
        </h4>
        {insights.map((insight) => (
          <Card
            key={insight.id}
            className={`cursor-pointer transition-all duration-200 ${
              activeInsight === insight.id ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-sm'
            }`}
            onClick={() => setActiveInsight(activeInsight === insight.id ? null : insight.id)}
          >
            <CardContent className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h5 className="text-sm font-medium text-gray-900">{insight.title}</h5>
                  <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                </div>
                <div className="flex items-center space-x-2 ml-3">
                  <Badge 
                    variant={insight.impact === 'high' ? 'destructive' : insight.impact === 'medium' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {insight.impact}
                  </Badge>
                  <span className="text-xs text-gray-500">{insight.confidence}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold" style={{ color: currentTheme.primary }}>
              {config.title}
            </CardTitle>
            {config.subtitle && (
              <p className="text-sm text-gray-600 mt-1">{config.subtitle}</p>
            )}
          </div>
          {interactive && (
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Chart Container */}
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>

        {/* Insights Section */}
        <AnimatePresence>
          {insights.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-200 pt-4"
            >
              {renderInsights()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && interactive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-200 pt-4 mt-4"
            >
              <Tabs defaultValue="style" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="style">Style</TabsTrigger>
                  <TabsTrigger value="data">Data</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value="style" className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium mb-2">Theme</h5>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(THEME_PALETTES).map(([themeName, theme]) => (
                        <Button
                          key={themeName}
                          size="sm"
                          variant={config.theme === themeName ? 'default' : 'outline'}
                          onClick={() => onConfigChange?.({ 
                            ...config, 
                            theme: themeName as any,
                            colors: theme.colors 
                          })}
                          className="capitalize"
                        >
                          {themeName}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium mb-2">Chart Type</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {CHART_TEMPLATES.map((template) => (
                        <Button
                          key={template.id}
                          size="sm"
                          variant={config.type === template.type ? 'default' : 'outline'}
                          onClick={() => onConfigChange?.({ 
                            ...config, 
                            type: template.type,
                            ...template.config 
                          })}
                          className="flex items-center space-x-2"
                        >
                          {template.type === 'bar' && <BarChart3 className="w-4 h-4" />}
                          {template.type === 'line' && <LineIcon className="w-4 h-4" />}
                          {template.type === 'pie' && <PieIcon className="w-4 h-4" />}
                          {template.type === 'area' && <Activity className="w-4 h-4" />}
                          <span>{template.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="data" className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p>Data configuration options would go here.</p>
                    <p className="mt-2">Current data points: {config.data.length}</p>
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Show Grid</label>
                    <Button
                      size="sm"
                      variant={config.showGrid ? 'default' : 'outline'}
                      onClick={() => onConfigChange?.({ ...config, showGrid: !config.showGrid })}
                    >
                      {config.showGrid ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Show Legend</label>
                    <Button
                      size="sm"
                      variant={config.showLegend ? 'default' : 'outline'}
                      onClick={() => onConfigChange?.({ ...config, showLegend: !config.showLegend })}
                    >
                      {config.showLegend ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

// Export chart templates for use in other components
export { CHART_TEMPLATES, THEME_PALETTES }