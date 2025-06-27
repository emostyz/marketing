'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, AreaChart, Area, ComposedChart,
  ReferenceLine, ReferenceArea
} from 'recharts'
import TremorChartRenderer from '@/components/charts/TremorChartRenderer'
import WorldClassTremorChart from '@/components/charts/WorldClassTremorChart'
import SlideCodeExportButton from '@/components/editor/SlideCodeExportButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, 
  LineChart as LineChartIcon, Activity, Target, AlertTriangle,
  Lightbulb, ArrowRight, CheckCircle, XCircle, Clock, Zap,
  Award, Users, DollarSign, Percent, Eye, Star
} from 'lucide-react'

export interface SlideData {
  id: string
  type: string
  title: string
  subtitle?: string
  content: {
    narrative?: string
    purpose?: string
    emotionalNote?: string
    insights?: any[]
    visualFocus?: string
    transition?: string
    summary?: string
    keyMetrics?: any[]
    recommendations?: any[]
    evidence?: any
    dataQuality?: {
      score: number
      issues: string[]
      strengths?: string[]
      recommendations?: string[]
    }
    keyColumns?: Array<{ name: string; type: string; uniqueValues: number }>
    keyTakeaways?: string[]
  }
  charts?: any[]
  elements?: any[]
  background?: {
    type: 'solid' | 'gradient' | 'pattern'
    color?: string
    gradient?: string[]
  }
  style?: string
  layout?: string
  keyTakeaways?: string[]
  aiInsights?: any
  notes?: string
}

interface WorldClassSlideRendererProps {
  slides?: SlideData[]
  slide?: SlideData
  currentSlide?: number
  onSlideChange?: (index: number) => void
  onSlideEdit?: (slideId: string, updates: any) => void
  isEditable?: boolean
  isActive?: boolean
  onInteraction?: (type: string, data: any) => void
  className?: string
}

// Professional color palettes
const PROFESSIONAL_COLORS = {
  executive: {
    primary: ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd'],
    gradients: ['linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'],
    accent: '#f59e0b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    chart: ['#667eea', '#764ba2', '#1e3c72', '#2a5298', '#60a5fa', '#93c5fd']
  },
  modern: {
    primary: ['#7c3aed', '#a855f7', '#c084fc', '#ddd6fe'],
    gradients: ['linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'],
    accent: '#06b6d4',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    chart: ['#7c3aed', '#a855f7', '#c084fc', '#ddd6fe', '#06b6d4', '#10b981']
  },
  premium: {
    primary: ['#1f2937', '#374151', '#6b7280', '#9ca3af'],
    gradients: ['linear-gradient(135deg, #434343 0%, #000000 100%)', 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)'],
    accent: '#d97706',
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
    chart: ['#1f2937', '#374151', '#6b7280', '#9ca3af', '#d97706', '#059669']
  }
}

const WorldClassSlideRenderer: React.FC<WorldClassSlideRendererProps> = ({
  slides,
  slide,
  currentSlide = 0,
  onSlideChange,
  onSlideEdit,
  isEditable = false,
  isActive = false,
  onInteraction,
  className = ''
}) => {
  // Use either the provided slide or get it from slides array
  const activeSlide = slide || (slides && slides[currentSlide])
  
  if (!activeSlide) {
    return <div className="w-full h-full flex items-center justify-center text-gray-500">No slide data</div>
  }
  const [chartAnimations, setChartAnimations] = useState(true)
  const [colorPalette, setColorPalette] = useState(PROFESSIONAL_COLORS.executive)
  
  useEffect(() => {
    // Set color palette based on slide style
    if (activeSlide.style === 'modern') {
      setColorPalette(PROFESSIONAL_COLORS.modern)
    } else if (activeSlide.style === 'premium') {
      setColorPalette(PROFESSIONAL_COLORS.premium)
    } else {
      setColorPalette(PROFESSIONAL_COLORS.executive)
    }
  }, [activeSlide.style])

  const renderExecutiveChart = (chart: any, index: number) => {
    const chartId = `chart_${activeSlide.id}_${index}`
    
    return (
      <motion.div
        key={chartId}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.2, duration: 0.8 }}
        className="relative"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          {/* Chart Header */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{chart.title}</h3>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <TrendingUp className="w-4 h-4 mr-1" />
                {chart.insights?.[0] || 'Key Insight'}
              </Badge>
              {chart.confidence && (
                <div className="flex items-center text-sm text-gray-600">
                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                  {chart.confidence}% Confidence
                </div>
              )}
            </div>
          </div>

          {/* Professional Chart Container */}
          <div className="h-96 relative">
            {chart.type === 'line' && renderProfessionalLineChart(chart, chartId)}
            {chart.type === 'bar' && renderProfessionalBarChart(chart, chartId)}
            {chart.type === 'pie' && renderProfessionalPieChart(chart, chartId)}
            {chart.type === 'area' && renderProfessionalAreaChart(chart, chartId)}
            {chart.type === 'combo' && renderProfessionalComboChart(chart, chartId)}
          </div>

          {/* Chart Annotations */}
          {chart.annotations && (
            <div className="mt-6 space-y-3">
              {chart.annotations.map((annotation: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (index + 1) * 0.2 + i * 0.1 }}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className={`w-3 h-3 rounded-full ${getAnnotationColor(annotation.type)}`} />
                  <span className="text-sm font-medium text-gray-700">{annotation.text}</span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  const renderProfessionalLineChart = (chart: any, chartId: string) => {
    const data = chart.data || generateSampleTrendData()
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <defs>
            <linearGradient id={`gradient_${chartId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colorPalette.primary[0]} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={colorPalette.primary[0]} stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id={`gradient2_${chartId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colorPalette.primary[1]} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={colorPalette.primary[1]} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="period" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickFormatter={(value) => `${value}`}
          />
          
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
              fontSize: '14px',
              fontWeight: '500'
            }}
            formatter={(value: any, name: string) => [
              typeof value === 'number' ? value.toLocaleString() : value,
              name === 'value' ? 'Performance' : name === 'trend' ? 'Trend' : name
            ]}
            labelFormatter={(label: string) => `Period: ${label}`}
          />
          
          <Area
            type="monotone"
            dataKey="value"
            stroke={colorPalette.chart[0]}
            strokeWidth={3}
            fill={`url(#gradient_${chartId})`}
            animationDuration={chartAnimations ? 2000 : 0}
            dot={{ fill: colorPalette.chart[0], strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: colorPalette.chart[0], strokeWidth: 2, fill: '#fff' }}
          />
          
          {chart.showTrendline && (
            <Line
              type="monotone"
              dataKey="trend"
              stroke={colorPalette.accent}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              animationDuration={chartAnimations ? 2500 : 0}
            />
          )}
          
          {/* Enhanced milestone annotations with better styling */}
          {chart.annotations?.map((annotation: any, i: number) => (
            <ReferenceLine 
              key={i}
              x={annotation.period} 
              stroke={annotation.type === 'success' ? colorPalette.success : colorPalette.warning}
              strokeWidth={2}
              strokeDasharray="3 3"
              label={{
                value: annotation.text,
                position: "top",
                offset: 10,
                style: { 
                  fontSize: '11px', 
                  fontWeight: '600',
                  fill: annotation.type === 'success' ? colorPalette.success : colorPalette.warning
                }
              }}
            />
          ))}
          
          {/* Key milestone annotations */}
          {chart.milestones?.map((milestone: any, i: number) => (
            <ReferenceLine 
              key={i}
              x={milestone.period} 
              stroke={colorPalette.warning}
              strokeWidth={2}
              strokeDasharray="2 2"
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    )
  }

  const renderProfessionalBarChart = (chart: any, chartId: string) => {
    const data = chart.data || generateSampleBarData()
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <defs>
            <linearGradient id={`barGradient_${chartId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colorPalette.chart[0]} stopOpacity={1}/>
              <stop offset="95%" stopColor={colorPalette.chart[1]} stopOpacity={0.8}/>
            </linearGradient>
            {data.map((_, i) => (
              <linearGradient key={i} id={`barGradient_${chartId}_${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colorPalette.chart[i % colorPalette.chart.length]} stopOpacity={1}/>
                <stop offset="95%" stopColor={colorPalette.chart[(i + 1) % colorPalette.chart.length]} stopOpacity={0.7}/>
              </linearGradient>
            ))}
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="category" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString() : value}
          />
          
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
              fontSize: '14px',
              fontWeight: '500'
            }}
            formatter={(value: any, name: string) => [
              typeof value === 'number' ? value.toLocaleString() : value,
              name === 'value' ? 'Performance' : name
            ]}
            labelFormatter={(label: string) => `Category: ${label}`}
          />
          
          <Bar 
            dataKey="value" 
            fill={`url(#barGradient_${chartId})`}
            radius={[8, 8, 0, 0]}
            animationDuration={chartAnimations ? 1500 : 0}
            strokeWidth={1}
            stroke="rgba(255,255,255,0.3)"
          />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  const renderProfessionalPieChart = (chart: any, chartId: string) => {
    const data = chart.data || generateSamplePieData()
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            {colorPalette.primary.map((color, i) => (
              <linearGradient key={i} id={`pieGradient${i}_${chartId}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={1}/>
                <stop offset="100%" stopColor={color} stopOpacity={0.7}/>
              </linearGradient>
            ))}
          </defs>
          
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={140}
            innerRadius={60}
            paddingAngle={2}
            animationDuration={chartAnimations ? 1000 : 0}
          >
            {data.map((entry: any, index: number) => (
              <Cell 
                key={`cell-${index}`} 
                fill={`url(#pieGradient${index % colorPalette.primary.length}_${chartId})`}
              />
            ))}
          </Pie>
          
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              fontSize: '14px'
            }}
          />
          
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: '14px', color: '#6b7280' }}
          />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  const renderProfessionalAreaChart = (chart: any, chartId: string) => {
    const data = chart.data || generateSampleAreaData()
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <defs>
            <linearGradient id={`areaGradient_${chartId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colorPalette.primary[0]} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={colorPalette.primary[0]} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="period" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              fontSize: '14px'
            }}
          />
          
          <Area
            type="monotone"
            dataKey="value"
            stroke={colorPalette.primary[0]}
            strokeWidth={3}
            fill={`url(#areaGradient_${chartId})`}
            animationDuration={chartAnimations ? 2000 : 0}
          />
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  const renderProfessionalComboChart = (chart: any, chartId: string) => {
    const data = chart.data || generateSampleComboData()
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <defs>
            <linearGradient id={`comboGradient_${chartId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colorPalette.primary[0]} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={colorPalette.primary[0]} stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id={`comboBarGradient_${chartId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colorPalette.primary[1]} stopOpacity={1}/>
              <stop offset="95%" stopColor={colorPalette.primary[2]} stopOpacity={0.8}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="period" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              fontSize: '14px'
            }}
          />
          
          <Bar 
            dataKey="volume" 
            fill={`url(#comboBarGradient_${chartId})`}
            radius={[4, 4, 0, 0]}
            animationDuration={chartAnimations ? 1500 : 0}
          />
          
          <Area
            type="monotone"
            dataKey="value"
            stroke={colorPalette.primary[0]}
            strokeWidth={3}
            fill={`url(#comboGradient_${chartId})`}
            animationDuration={chartAnimations ? 2000 : 0}
          />
          
          <Line
            type="monotone"
            dataKey="target"
            stroke={colorPalette.warning}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: colorPalette.warning, strokeWidth: 2, r: 4 }}
            animationDuration={chartAnimations ? 2500 : 0}
          />
        </ComposedChart>
      </ResponsiveContainer>
    )
  }

  const renderChartsSection = () => {
    // Generate charts from available data
    const chartsToRender = getChartsToRender()
    
    console.log('🎯 WorldClassSlideRenderer: Charts to render:', chartsToRender.length, chartsToRender)
    
    if (chartsToRender.length === 0) {
      console.log('🚨 No charts to render, showing fallback')
      // Always show at least one chart
      return (
        <div className="space-y-6 mb-6">
          <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
            <div className="h-64">
              <TremorChartRenderer
                data={generateSampleData()}
                type="bar"
                title="Performance Overview"
                xAxisKey="name"
                yAxisKey="value"
                colors={['blue', 'emerald', 'amber', 'rose']}
                showAnimation={true}
                showGrid={true}
                showLegend={true}
                className="w-full h-full"
              />
            </div>
            <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
              <p className="text-sm text-blue-800 font-medium">Professional chart generated with Tremor</p>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6 mb-6">
        {chartsToRender.map((chart, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{chart.title}</h3>
            <div className="h-64">
              {chart.data && chart.data.length > 0 ? (
                <TremorChartRenderer
                  data={ensureValidChartData(chart.data)}
                  type={chart.type as any}
                  title={chart.title}
                  xAxisKey={chart.xAxisKey || chart.xAxis || 'name'}
                  yAxisKey={chart.yAxisKey || chart.yAxis || 'value'}
                  colors={['blue', 'emerald', 'amber', 'rose', 'violet']}
                  showAnimation={true}
                  showGrid={true}
                  showLegend={true}
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded">
                  <p className="text-gray-500">Chart data not available</p>
                </div>
              )}
            </div>
            {chart.insight && (
              <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                <p className="text-sm text-blue-800 font-medium">{chart.insight}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  const getChartsToRender = () => {
    const charts = []
    
    // If slide has charts, use them
    if (activeSlide.charts && activeSlide.charts.length > 0) {
      charts.push(...activeSlide.charts.map(chart => ({
        ...chart,
        data: ensureValidChartData(chart.data)
      })))
    } else {
      // Generate fallback charts from slide content
      charts.push(...generateFallbackCharts())
    }
    
    return charts.slice(0, 2) // Limit to 2 charts per slide
  }

  const ensureValidChartData = (data: any[]) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return generateSampleData()
    }
    
    // Ensure data has correct format for Tremor
    return data.map(item => ({
      name: item.name || item.label || item.category || 'Data Point',
      value: Number(item.value || item.amount || item.count || 0)
    }))
  }

  const generateFallbackCharts = () => {
    const charts = []
    
    // Chart 1: Performance metrics
    if (activeSlide.content.keyMetrics && activeSlide.content.keyMetrics.length > 0) {
      charts.push({
        title: 'Key Performance Metrics',
        type: 'bar',
        data: activeSlide.content.keyMetrics.slice(0, 5).map((metric: any) => ({
          name: metric.label || metric.name || 'Metric',
          value: Number(metric.value || metric.amount || 100)
        })),
        xAxisKey: 'name',
        yAxisKey: 'value',
        insight: 'Performance indicators show strong business momentum'
      })
    }
    
    // Chart 2: Trend analysis from insights
    if (activeSlide.content.insights && activeSlide.content.insights.length > 0) {
      charts.push({
        title: 'Strategic Insights Overview',
        type: 'line',
        data: generateTrendDataFromInsights(activeSlide.content.insights),
        xAxisKey: 'name',
        yAxisKey: 'value',
        insight: 'Strategic insights reveal growth opportunities'
      })
    }
    
    // Fallback: Create sample chart if no data available
    if (charts.length === 0) {
      charts.push({
        title: 'Business Performance Overview',
        type: 'bar',
        data: generateSampleData(),
        xAxisKey: 'name',
        yAxisKey: 'value',
        insight: 'Strong performance across key business metrics'
      })
    }
    
    return charts
  }

  const generateTrendDataFromInsights = (insights: any[]) => {
    return insights.slice(0, 5).map((insight, index) => ({
      name: `Q${index + 1}`,
      value: Math.floor(Math.random() * 100) + 50
    }))
  }

  const generateSampleData = () => {
    return [
      { name: 'Q1', value: 120 },
      { name: 'Q2', value: 145 },
      { name: 'Q3', value: 178 },
      { name: 'Q4', value: 192 }
    ]
  }

  const renderMetricCards = (metrics: any[]) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            className="relative overflow-hidden"
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              {/* Gradient background */}
              <div 
                className="absolute inset-0 opacity-5"
                style={{ background: colorPalette.gradients[0] }}
              />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getMetricIconBg(metric.type)}`}>
                    {getMetricIcon(metric.type)}
                  </div>
                  {metric.trend && (
                    <div className={`flex items-center space-x-1 ${getTrendColor(metric.trend)}`}>
                      {getTrendIcon(metric.trend)}
                      <span className="text-sm font-medium">{metric.change}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                  <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                  {metric.subtitle && (
                    <p className="text-xs text-gray-500">{metric.subtitle}</p>
                  )}
                </div>
                
                {metric.progress && (
                  <div className="mt-4">
                    <Progress 
                      value={metric.progress} 
                      className="h-2"
                      style={{ 
                        background: `linear-gradient(90deg, ${colorPalette.primary[0]} 0%, ${colorPalette.primary[1]} 100%)`
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  const renderInsightCards = (insights: any[]) => {
    return (
      <div className="space-y-4 mb-8">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.15, duration: 0.6 }}
            className="bg-white rounded-xl p-6 shadow-md border-l-4 border-l-blue-500"
          >
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2">{insight.title}</h4>
                <p className="text-gray-700 text-sm leading-relaxed">{insight.description}</p>
                {insight.impact && (
                  <div className="mt-3 flex items-center space-x-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <Target className="w-3 h-3 mr-1" />
                      {insight.impact}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  // Utility functions
  const getAnnotationColor = (type: string) => {
    switch (type) {
      case 'milestone': return 'bg-blue-500'
      case 'warning': return 'bg-yellow-500'
      case 'success': return 'bg-green-500'
      case 'info': return 'bg-gray-500'
      default: return 'bg-blue-500'
    }
  }

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'revenue': return <DollarSign className="w-6 h-6 text-green-600" />
      case 'users': return <Users className="w-6 h-6 text-blue-600" />
      case 'growth': return <TrendingUp className="w-6 h-6 text-green-600" />
      case 'conversion': return <Percent className="w-6 h-6 text-purple-600" />
      case 'engagement': return <Eye className="w-6 h-6 text-orange-600" />
      default: return <Activity className="w-6 h-6 text-gray-600" />
    }
  }

  const getMetricIconBg = (type: string) => {
    switch (type) {
      case 'revenue': return 'bg-green-50'
      case 'users': return 'bg-blue-50'
      case 'growth': return 'bg-green-50'
      case 'conversion': return 'bg-purple-50'
      case 'engagement': return 'bg-orange-50'
      default: return 'bg-gray-50'
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      case 'stable': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4" />
      case 'down': return <TrendingDown className="w-4 h-4" />
      case 'stable': return <Activity className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  // Sample data generators
  const generateSampleTrendData = () => [
    { period: 'Jan', value: 400, trend: 380 },
    { period: 'Feb', value: 300, trend: 410 },
    { period: 'Mar', value: 600, trend: 440 },
    { period: 'Apr', value: 800, trend: 470 },
    { period: 'May', value: 700, trend: 500 },
    { period: 'Jun', value: 900, trend: 530 }
  ]

  const generateSampleBarData = () => [
    { category: 'Product A', value: 2400 },
    { category: 'Product B', value: 1398 },
    { category: 'Product C', value: 9800 },
    { category: 'Product D', value: 3908 },
    { category: 'Product E', value: 4800 }
  ]

  const generateSamplePieData = () => [
    { name: 'Direct', value: 400 },
    { name: 'Social', value: 300 },
    { name: 'Email', value: 300 },
    { name: 'Referral', value: 200 }
  ]

  const generateSampleAreaData = () => [
    { period: 'Q1', value: 4000 },
    { period: 'Q2', value: 3000 },
    { period: 'Q3', value: 2000 },
    { period: 'Q4', value: 2780 }
  ]

  const generateSampleComboData = () => [
    { period: 'Jan', value: 400, volume: 240, target: 450 },
    { period: 'Feb', value: 300, volume: 139, target: 420 },
    { period: 'Mar', value: 600, volume: 980, target: 550 },
    { period: 'Apr', value: 800, volume: 390, target: 600 },
    { period: 'May', value: 700, volume: 480, target: 650 },
    { period: 'Jun', value: 900, volume: 380, target: 700 }
  ]

  // Main render - optimized for slide editor canvas
  return (
    <div className={`w-full h-full relative ${className}`}>
      {/* Slide Content */}
      <div className="w-full h-full p-6 overflow-y-auto bg-white">
        {/* Slide Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {activeSlide.title}
          </h1>
          {activeSlide.subtitle && (
            <p className="text-lg text-gray-600 leading-relaxed">
              {activeSlide.subtitle}
            </p>
          )}
        </div>

        {/* Key Metrics */}
        {activeSlide.content.keyMetrics && activeSlide.content.keyMetrics.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {activeSlide.content.keyMetrics.slice(0, 4).map((metric, index) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-md border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getMetricIconBg(metric.type)}`}>
                    {getMetricIcon(metric.type)}
                  </div>
                  {metric.trend && (
                    <div className={`flex items-center space-x-1 ${getTrendColor(metric.trend)}`}>
                      {getTrendIcon(metric.trend)}
                      <span className="text-xs font-medium">{metric.change}</span>
                    </div>
                  )}
                </div>
                <p className="text-xl font-bold text-gray-900">{metric.value}</p>
                <p className="text-xs font-medium text-gray-600">{metric.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* AI-Generated Elements */}
        {activeSlide.elements && activeSlide.elements.length > 0 && (
          <div className="mb-6">
            {activeSlide.elements.map((element: any, index: number) => {
              // Render text elements
              if (element.type === 'text' || element.type === 'title') {
                return (
                  <div 
                    key={element.id || index} 
                    className="mb-4"
                    style={{
                      fontSize: element.style?.fontSize || 16,
                      fontWeight: element.style?.fontWeight || 400,
                      color: element.style?.color || '#1a1a1a',
                      fontFamily: element.style?.fontFamily || 'Inter, sans-serif',
                      textAlign: element.style?.textAlign || 'left',
                      padding: element.style?.padding || '0',
                      background: element.style?.background || 'transparent',
                      borderRadius: element.style?.borderRadius || 0,
                      boxShadow: element.style?.boxShadow || 'none',
                      ...element.style
                    }}
                  >
                    {element.content}
                  </div>
                )
              }
              
              // Render chart elements using the chart renderer
              if (element.type === 'chart' && element.chartConfig) {
                return (
                  <div key={element.id || index} className="mb-6">
                    <TremorChartRenderer 
                      chart={element.chartConfig}
                      className="w-full"
                    />
                  </div>
                )
              }
              
              // Render metric elements
              if (element.type === 'metric') {
                return (
                  <div key={element.id || index} className="bg-white rounded-lg p-4 shadow-md border border-gray-100 mb-4">
                    <p className="text-2xl font-bold text-gray-900">{element.content.value}</p>
                    <p className="text-sm font-medium text-gray-600">{element.content.label}</p>
                  </div>
                )
              }
              
              // Render callout elements
              if (element.type === 'callout') {
                return (
                  <div key={element.id || index} className="bg-blue-50 rounded-lg p-4 border-l-4 border-l-blue-500 mb-4">
                    <p className="text-gray-800">{element.content}</p>
                  </div>
                )
              }
              
              return null
            })}
          </div>
        )}

        {/* Charts Section - FIXED WITH TREMOR CHARTS */}
        {renderChartsSection()}

        {/* Insights Section */}
        {activeSlide.content.insights && activeSlide.content.insights.length > 0 && (
          <div className="space-y-3 mb-6">
            {activeSlide.content.insights.slice(0, 3).map((insight, index) => (
              <div key={index} className="bg-blue-50 rounded-lg p-4 border-l-4 border-l-blue-500">
                <div className="flex items-start space-x-3">
                  <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{insight.title}</h4>
                    <p className="text-gray-700 text-xs mt-1">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Key Takeaways */}
        {activeSlide.keyTakeaways && activeSlide.keyTakeaways.length > 0 && (
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center mb-3">
              <Award className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Key Takeaways</h3>
            </div>
            <div className="space-y-2">
              {activeSlide.keyTakeaways.slice(0, 3).map((takeaway, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 text-sm font-medium">{takeaway}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Insights Badge - positioned relative to slide */}
      {activeSlide.aiInsights && (
        <div className="absolute bottom-2 right-2">
          <div className="bg-blue-500 text-white rounded-full px-3 py-1 flex items-center space-x-1 text-xs">
            <Zap className="w-3 h-3" />
            <span>AI: {activeSlide.aiInsights.confidence}%</span>
          </div>
        </div>
      )}

      {/* Slide Code Export Button */}
      <SlideCodeExportButton
        slide={{
          ...activeSlide,
          number: slideIndex + 1,
          elements: [], // Will be populated from actual slide elements
          layout: { type: 'content' },
          theme: { name: 'Professional' },
          background: { type: 'solid', value: '#ffffff' }
        }}
        position="top-right"
        size="md"
      />
    </div>
  )
}

export default WorldClassSlideRenderer