'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, AreaChart, Area, ComposedChart,
  ReferenceLine, ReferenceArea
} from 'recharts'
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
  slide: SlideData
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
    error: '#ef4444'
  },
  modern: {
    primary: ['#7c3aed', '#a855f7', '#c084fc', '#ddd6fe'],
    gradients: ['linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'],
    accent: '#06b6d4',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
  },
  premium: {
    primary: ['#1f2937', '#374151', '#6b7280', '#9ca3af'],
    gradients: ['linear-gradient(135deg, #434343 0%, #000000 100%)', 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)'],
    accent: '#d97706',
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626'
  }
}

const WorldClassSlideRenderer: React.FC<WorldClassSlideRendererProps> = ({
  slide,
  isActive = false,
  onInteraction,
  className = ''
}) => {
  const [chartAnimations, setChartAnimations] = useState(true)
  const [colorPalette, setColorPalette] = useState(PROFESSIONAL_COLORS.executive)
  
  useEffect(() => {
    // Set color palette based on slide style
    if (slide.style === 'modern') {
      setColorPalette(PROFESSIONAL_COLORS.modern)
    } else if (slide.style === 'premium') {
      setColorPalette(PROFESSIONAL_COLORS.premium)
    } else {
      setColorPalette(PROFESSIONAL_COLORS.executive)
    }
  }, [slide.style])

  const renderExecutiveChart = (chart: any, index: number) => {
    const chartId = `chart_${slide.id}_${index}`
    
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
            fill={`url(#gradient_${chartId})`}
            animationDuration={chartAnimations ? 2000 : 0}
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
              <stop offset="5%" stopColor={colorPalette.primary[0]} stopOpacity={1}/>
              <stop offset="95%" stopColor={colorPalette.primary[1]} stopOpacity={0.8}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="category" 
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
            dataKey="value" 
            fill={`url(#barGradient_${chartId})`}
            radius={[8, 8, 0, 0]}
            animationDuration={chartAnimations ? 1500 : 0}
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

  // Main render
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className={`w-full h-full bg-gradient-to-br from-gray-50 to-white ${className}`}
      style={{
        background: slide.background?.type === 'gradient' 
          ? `linear-gradient(135deg, ${slide.background.gradient?.[0] || '#f8fafc'}, ${slide.background.gradient?.[1] || '#ffffff'})`
          : slide.background?.color || '#ffffff'
      }}
    >
      <div className="w-full h-full p-8 overflow-y-auto">
        {/* Slide Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {slide.subtitle}
            </p>
          )}
        </motion.div>

        {/* Key Metrics */}
        {slide.content.keyMetrics && slide.content.keyMetrics.length > 0 && (
          renderMetricCards(slide.content.keyMetrics)
        )}

        {/* Charts Section */}
        {slide.charts && slide.charts.length > 0 && (
          <div className="space-y-8 mb-12">
            {slide.charts.map((chart, index) => renderExecutiveChart(chart, index))}
          </div>
        )}

        {/* Insights Section */}
        {slide.content.insights && slide.content.insights.length > 0 && (
          renderInsightCards(slide.content.insights)
        )}

        {/* Key Takeaways */}
        {slide.keyTakeaways && slide.keyTakeaways.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center mr-4">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Key Takeaways</h3>
            </div>
            
            <div className="space-y-4">
              {slide.keyTakeaways.map((takeaway, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                  className="flex items-start space-x-3"
                >
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 font-medium">{takeaway}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* AI Insights Badge */}
        {slide.aiInsights && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="fixed bottom-8 right-8 z-10"
          >
            <div className="bg-white rounded-full px-6 py-3 shadow-lg border border-gray-200 flex items-center space-x-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                AI Generated • {slide.aiInsights.confidence}% Confidence
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default WorldClassSlideRenderer