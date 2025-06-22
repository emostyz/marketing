'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts'
import { ArrowUp, ArrowDown, Target, TrendingUp, AlertCircle } from 'lucide-react'
import { McKinseySlideConfig, McKinseyInsight } from '@/lib/charts/mckinsey-chart-generator'

interface McKinseySlideProps {
  config: McKinseySlideConfig
  className?: string
}

// McKinsey-style color palette
const MCKINSEY_COLORS = {
  primary: '#1E40AF',      // McKinsey blue
  secondary: '#059669',    // Success green
  accent: '#D97706',       // Warning orange
  danger: '#DC2626',       // Error red
  neutral: '#6B7280',      // Neutral gray
  light: '#F8FAFC',        // Light background
  white: '#FFFFFF'
}

const MetricCard: React.FC<{
  label: string
  value: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  size?: 'sm' | 'md' | 'lg'
}> = ({ label, value, change, changeType, size = 'md' }) => {
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  }

  const valueClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  }

  return (
    <motion.div
      className={`bg-white rounded-lg border border-gray-200 ${sizeClasses[size]}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-sm text-gray-600 font-medium uppercase tracking-wide mb-1">
        {label}
      </div>
      <div className={`font-bold text-gray-900 ${valueClasses[size]} mb-1`}>
        {value}
      </div>
      {change && (
        <div className={`flex items-center space-x-1 text-sm ${
          changeType === 'positive' ? 'text-green-600' :
          changeType === 'negative' ? 'text-red-600' :
          'text-gray-600'
        }`}>
          {changeType === 'positive' && <ArrowUp className="w-3 h-3" />}
          {changeType === 'negative' && <ArrowDown className="w-3 h-3" />}
          <span>{change}</span>
        </div>
      )}
    </motion.div>
  )
}

const InsightCard: React.FC<{ insight: McKinseyInsight }> = ({ insight }) => {
  const getIcon = () => {
    switch (insight.type) {
      case 'key_metric':
        return <Target className="w-5 h-5" />
      case 'trend':
        return <TrendingUp className="w-5 h-5" />
      case 'recommendation':
        return <AlertCircle className="w-5 h-5" />
      default:
        return <Target className="w-5 h-5" />
    }
  }

  const getColor = () => {
    switch (insight.impact) {
      case 'high':
        return 'border-blue-200 bg-blue-50'
      case 'medium':
        return 'border-orange-200 bg-orange-50'
      case 'low':
        return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <motion.div
      className={`rounded-lg border p-4 ${getColor()}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-start space-x-3">
        <div className={`mt-1 ${
          insight.impact === 'high' ? 'text-blue-600' :
          insight.impact === 'medium' ? 'text-orange-600' :
          'text-gray-600'
        }`}>
          {getIcon()}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-2">{insight.title}</h4>
          <p className="text-gray-700 text-sm leading-relaxed mb-3">
            {insight.description}
          </p>
          {insight.value && (
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {insight.value}
              {insight.change && (
                <span className={`text-sm ml-2 ${
                  insight.changeType === 'positive' ? 'text-green-600' :
                  insight.changeType === 'negative' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  ({insight.change})
                </span>
              )}
            </div>
          )}
          {insight.supporting_data && insight.supporting_data.length > 0 && (
            <div className="text-xs text-gray-500 mt-2">
              {insight.supporting_data.join(' • ')}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

const McKinseyChart: React.FC<{ 
  chart: any
  annotations?: Array<{
    position: { x: number, y: number }
    text: string
    type: 'callout' | 'highlight' | 'arrow'
    color?: string
  }>
}> = ({ chart, annotations }) => {
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value?.toLocaleString()}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const renderChart = () => {
    const commonProps = {
      data: chart.data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    }

    switch (chart.type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey={chart.xAxis} 
              stroke="#6B7280" 
              fontSize={12}
              fontFamily="Inter, sans-serif"
            />
            <YAxis 
              stroke="#6B7280" 
              fontSize={12}
              fontFamily="Inter, sans-serif"
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey={chart.yAxis} 
              stroke={chart.color} 
              strokeWidth={3}
              dot={{ fill: chart.color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: chart.color }}
            />
          </LineChart>
        )
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey={chart.xAxis} 
              stroke="#6B7280" 
              fontSize={12}
              fontFamily="Inter, sans-serif"
            />
            <YAxis 
              stroke="#6B7280" 
              fontSize={12}
              fontFamily="Inter, sans-serif"
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={chart.yAxis} radius={[4, 4, 0, 0]}>
              {chart.data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={chart.color} />
              ))}
            </Bar>
          </BarChart>
        )
      
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey={chart.xAxis} 
              stroke="#6B7280" 
              fontSize={12}
              fontFamily="Inter, sans-serif"
            />
            <YAxis 
              stroke="#6B7280" 
              fontSize={12}
              fontFamily="Inter, sans-serif"
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey={chart.yAxis} 
              stroke={chart.color} 
              fill={chart.color}
              fillOpacity={0.2}
              strokeWidth={3}
            />
          </AreaChart>
        )
      
      default:
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey={chart.xAxis} stroke="#6B7280" fontSize={12} />
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={chart.yAxis} fill={chart.color} radius={[4, 4, 0, 0]} />
          </BarChart>
        )
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 relative">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{chart.title}</h3>
        {chart.description && (
          <p className="text-sm text-gray-600">{chart.description}</p>
        )}
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {annotations && annotations.map((annotation, index) => (
        <div
          key={index}
          className="absolute text-sm font-medium px-2 py-1 rounded"
          style={{
            left: `${annotation.position.x * 100}%`,
            top: `${annotation.position.y * 100}%`,
            backgroundColor: annotation.color || MCKINSEY_COLORS.primary,
            color: 'white',
            transform: 'translate(-50%, -50%)'
          }}
        >
          {annotation.text}
        </div>
      ))}
    </div>
  )
}

export const McKinseySlide: React.FC<McKinseySlideProps> = ({ config, className = '' }) => {
  
  const renderLayout = () => {
    switch (config.layout) {
      case 'single_chart':
        return (
          <div className="grid grid-cols-1 gap-8 h-full">
            {config.primary_chart && (
              <McKinseyChart 
                chart={config.primary_chart} 
                annotations={config.annotations}
              />
            )}
          </div>
        )

      case 'chart_with_insights':
        return (
          <div className="grid grid-cols-3 gap-8 h-full">
            {/* Main Chart */}
            <div className="col-span-2">
              {config.primary_chart && (
                <McKinseyChart 
                  chart={config.primary_chart} 
                  annotations={config.annotations}
                />
              )}
            </div>

            {/* Insights and Results */}
            <div className="space-y-6">
              {/* Results Section */}
              {config.results_summary && (
                <motion.div
                  className="bg-blue-50 rounded-lg border border-blue-200 p-5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="flex items-center space-x-2 mb-4">
                    <Target className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">Results</h3>
                  </div>
                  <div className="space-y-3">
                    {config.results_summary.key_metrics.map((metric, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-blue-800">• {metric.label}</span>
                        <div className="text-right">
                          <div className="font-semibold text-blue-900">{metric.value}</div>
                          {metric.change && (
                            <div className={`text-xs ${
                              metric.changeType === 'positive' ? 'text-green-600' :
                              metric.changeType === 'negative' ? 'text-red-600' :
                              'text-gray-600'
                            }`}>
                              {metric.change}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Actions Section */}
              {config.actions_summary && (
                <motion.div
                  className="bg-green-50 rounded-lg border border-green-200 p-5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <div className="flex items-center space-x-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-green-900">Actions</h3>
                  </div>
                  <div className="space-y-2">
                    {config.actions_summary.immediate.map((action, index) => (
                      <div key={index} className="text-sm text-green-800">
                        • {action}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )

      case 'multi_chart_dashboard':
        return (
          <div className="grid grid-cols-2 gap-6 h-full">
            {config.secondary_charts?.map((chart, index) => (
              <motion.div
                key={chart.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <McKinseyChart chart={chart} />
              </motion.div>
            ))}
          </div>
        )

      case 'insight_focused':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {config.insights.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </div>
        )

      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-500">
            Layout not configured
          </div>
        )
    }
  }

  return (
    <motion.div 
      className={`w-full h-full bg-gray-50 p-8 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
          {config.title}
        </h1>
        {config.subtitle && (
          <p className="text-lg text-gray-600 leading-relaxed">
            {config.subtitle}
          </p>
        )}
      </motion.div>

      {/* Content */}
      <div className="flex-1">
        {renderLayout()}
      </div>

      {/* Key Metrics Bar (if single chart layout) */}
      {config.layout === 'single_chart' && config.results_summary && (
        <motion.div 
          className="mt-8 grid grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {config.results_summary.key_metrics.map((metric, index) => (
            <MetricCard
              key={index}
              label={metric.label}
              value={metric.value}
              change={metric.change}
              changeType={metric.changeType}
              size="sm"
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}