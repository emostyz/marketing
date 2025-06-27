'use client'

import React from 'react'
import {
  BarChart,
  LineChart,
  AreaChart,
  DonutChart,
  PieChart,
  ScatterChart,
  Card,
  Title,
  Subtitle,
  Metric,
  Text,
  Flex,
  Grid,
  Badge
} from '@tremor/react'
import { TremorChartConfig } from '@/lib/slide-code/slide-schema'

interface WorldClassTremorChartProps {
  config: TremorChartConfig
  className?: string
  onConfigChange?: (config: TremorChartConfig) => void
}

export const WorldClassTremorChart: React.FC<WorldClassTremorChartProps> = ({
  config,
  className = '',
  onConfigChange
}) => {
  
  // McKinsey-style color palettes
  const McKinseyColors = {
    blue: ['#1e40af', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'],
    emerald: ['#059669', '#10b981', '#34d399', '#6ee7b7', '#9deccc', '#d1fae5'],
    violet: ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'],
    amber: ['#d97706', '#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7'],
    red: ['#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2'],
    neutral: ['#374151', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db', '#f3f4f6']
  }

  // Get colors based on palette
  const getColors = (): string[] => {
    if (config.colors && config.colors.length > 0) {
      return config.colors
    }
    return McKinseyColors[config.colorPalette as keyof typeof McKinseyColors] || McKinseyColors.blue
  }

  // Render chart component based on type
  const renderChart = () => {
    const colors = getColors()
    const commonProps = {
      data: config.data,
      categories: config.yAxisKey ? [config.yAxisKey].flat() : undefined,
      index: config.xAxisKey,
      colors: colors,
      showLegend: config.showLegend,
      showGrid: config.showGrid,
      showTooltip: config.showTooltip,
      animationDuration: config.animationDuration || 800,
      className: `h-${config.height || 300} ${config.className || ''}`,
      onValueChange: (value: any) => console.log('Chart interaction:', value)
    }

    // Add responsive handling
    const responsiveProps = config.responsive !== false ? {
      style: { width: '100%', height: config.height || 300 }
    } : {}

    switch (config.type) {
      case 'bar':
        return (
          <BarChart
            {...commonProps}
            {...responsiveProps}
            stack={config.stack}
            relative={config.relative}
            layout={config.showYAxis ? 'vertical' : 'horizontal'}
            showXAxis={config.showXAxis}
            showYAxis={config.showYAxis}
            xAxisLabel={config.xAxisLabel}
            yAxisLabel={config.yAxisLabel}
          />
        )

      case 'line':
        return (
          <LineChart
            {...commonProps}
            {...responsiveProps}
            curveType={config.curveType || 'linear'}
            connectNulls={config.connectNulls}
            showXAxis={config.showXAxis}
            showYAxis={config.showYAxis}
            xAxisLabel={config.xAxisLabel}
            yAxisLabel={config.yAxisLabel}
            enableLegendSlider={config.data.length > 20}
          />
        )

      case 'area':
        return (
          <AreaChart
            {...commonProps}
            {...responsiveProps}
            stack={config.stack}
            curveType={config.curveType || 'linear'}
            connectNulls={config.connectNulls}
            showXAxis={config.showXAxis}
            showYAxis={config.showYAxis}
            xAxisLabel={config.xAxisLabel}
            yAxisLabel={config.yAxisLabel}
          />
        )

      case 'pie':
        return (
          <PieChart
            data={config.data}
            category={config.valueKey || config.yAxisKey as string}
            index={config.categoryKey || config.xAxisKey}
            colors={colors}
            className={`h-${config.height || 300} ${config.className || ''}`}
            showLegend={config.showLegend}
            showTooltip={config.showTooltip}
            {...responsiveProps}
          />
        )

      case 'donut':
        return (
          <DonutChart
            data={config.data}
            category={config.valueKey || config.yAxisKey as string}
            index={config.categoryKey || config.xAxisKey}
            colors={colors}
            className={`h-${config.height || 300} ${config.className || ''}`}
            showLegend={config.showLegend}
            showTooltip={config.showTooltip}
            {...responsiveProps}
          />
        )

      case 'scatter':
        return (
          <ScatterChart
            {...commonProps}
            {...responsiveProps}
            showXAxis={config.showXAxis}
            showYAxis={config.showYAxis}
            xAxisLabel={config.xAxisLabel}
            yAxisLabel={config.yAxisLabel}
            enableLegendSlider={config.data.length > 50}
          />
        )

      default:
        return (
          <BarChart
            {...commonProps}
            {...responsiveProps}
            showXAxis={config.showXAxis}
            showYAxis={config.showYAxis}
          />
        )
    }
  }

  // Render McKinsey-style callout if configured
  const renderCallout = () => {
    if (!config.consultingStyle?.calloutValue) return null

    return (
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-blue-200">
        <Metric className="text-blue-600 font-bold">
          {config.consultingStyle.calloutValue}
        </Metric>
        <Text className="text-xs text-gray-600 mt-1">
          {config.consultingStyle.calloutLabel}
        </Text>
      </div>
    )
  }

  // Render benchmark line if configured
  const renderBenchmark = () => {
    if (!config.consultingStyle?.benchmark) return null

    const { benchmark } = config.consultingStyle
    return (
      <div className="absolute bottom-4 left-4 flex items-center space-x-2">
        <div 
          className="w-3 h-0.5" 
          style={{ backgroundColor: benchmark.color }}
        />
        <Text className="text-xs text-gray-600">
          {benchmark.label}: {benchmark.value}
        </Text>
      </div>
    )
  }

  // Render annotations
  const renderAnnotations = () => {
    if (!config.consultingStyle?.annotations) return null

    return (
      <div className="absolute inset-0 pointer-events-none">
        {config.consultingStyle.annotations.map((annotation, index) => (
          <div
            key={index}
            className="absolute text-xs font-medium"
            style={{
              left: `${typeof annotation.x === 'string' ? '50%' : annotation.x}%`,
              top: `${annotation.y}%`,
              color: annotation.color || '#374151',
              transform: typeof annotation.x === 'string' ? 'translateX(-50%)' : undefined
            }}
          >
            {annotation.text}
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      {/* Header */}
      <div className="mb-4">
        <Flex justifyContent="between" alignItems="start">
          <div>
            <Title className="text-lg font-semibold text-gray-900">
              {config.title}
            </Title>
            {config.subtitle && (
              <Subtitle className="text-sm text-gray-600 mt-1">
                {config.subtitle}
              </Subtitle>
            )}
          </div>
          
          {/* Business context badges */}
          <div className="flex space-x-2">
            {config.businessMetric && (
              <Badge variant="neutral" size="xs">
                {config.businessMetric}
              </Badge>
            )}
            {config.insightLevel && (
              <Badge 
                variant={config.insightLevel === 'strategic' ? 'emerald' : 'blue'} 
                size="xs"
              >
                {config.insightLevel}
              </Badge>
            )}
          </div>
        </Flex>
      </div>

      {/* Chart container with professional styling */}
      <div 
        className="relative"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.1)'
        }}
      >
        {renderChart()}
        {renderCallout()}
        {renderBenchmark()}
        {renderAnnotations()}
      </div>

      {/* Footer insights */}
      {config.consultingStyle?.emphasizeInsight && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <Text className="text-sm font-medium text-blue-900">
            💡 Key Insight: {config.consultingStyle.emphasizeInsight}
          </Text>
        </div>
      )}

      {/* Performance metrics for executives */}
      {config.audienceLevel === 'executive' && config.data.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <Metric className="text-sm font-semibold text-gray-700">
              {config.data.length}
            </Metric>
            <Text className="text-xs text-gray-500">Data Points</Text>
          </div>
          <div className="text-center">
            <Metric className="text-sm font-semibold text-gray-700">
              {config.type.toUpperCase()}
            </Metric>
            <Text className="text-xs text-gray-500">Chart Type</Text>
          </div>
          <div className="text-center">
            <Metric className="text-sm font-semibold text-gray-700">
              {config.insightLevel || 'Standard'}
            </Metric>
            <Text className="text-xs text-gray-500">Analysis Level</Text>
          </div>
        </div>
      )}
    </Card>
  )
}

// Chart builder utilities
export const createTremorChartConfig = (
  type: TremorChartConfig['type'],
  data: any[],
  options: Partial<TremorChartConfig> = {}
): TremorChartConfig => {
  
  // Auto-detect keys if not provided
  const autoDetectKeys = (data: any[]) => {
    if (!data || data.length === 0) return { x: 'x', y: 'y' }
    
    const firstRow = data[0]
    const keys = Object.keys(firstRow)
    
    // Find likely x-axis key (date, time, category, name)
    const xKey = keys.find(key => 
      key.toLowerCase().includes('date') || 
      key.toLowerCase().includes('time') ||
      key.toLowerCase().includes('name') ||
      key.toLowerCase().includes('category')
    ) || keys[0]
    
    // Find likely y-axis key (numeric values)
    const yKey = keys.find(key => 
      typeof firstRow[key] === 'number' && key !== xKey
    ) || keys[1]
    
    return { x: xKey, y: yKey }
  }

  const detectedKeys = autoDetectKeys(data)

  return {
    type,
    title: options.title || `${type.charAt(0).toUpperCase() + type.slice(1)} Chart`,
    subtitle: options.subtitle,
    data,
    xAxisKey: options.xAxisKey || detectedKeys.x,
    yAxisKey: options.yAxisKey || detectedKeys.y,
    categoryKey: options.categoryKey,
    valueKey: options.valueKey,
    colors: options.colors || ['#1e40af', '#2563eb', '#3b82f6', '#60a5fa'],
    colorPalette: options.colorPalette || 'blue',
    showXAxis: options.showXAxis !== false,
    showYAxis: options.showYAxis !== false,
    xAxisLabel: options.xAxisLabel,
    yAxisLabel: options.yAxisLabel,
    showGrid: options.showGrid !== false,
    showGridLines: options.showGridLines !== false,
    showLegend: options.showLegend !== false,
    legendPosition: options.legendPosition || 'bottom',
    showTooltip: options.showTooltip !== false,
    animateOnLoad: options.animateOnLoad !== false,
    animationDuration: options.animationDuration || 800,
    responsive: options.responsive !== false,
    height: options.height || 300,
    className: options.className || 'w-full',
    businessMetric: options.businessMetric,
    insightLevel: options.insightLevel || 'tactical',
    audienceLevel: options.audienceLevel || 'manager',
    consultingStyle: options.consultingStyle || {
      emphasizeInsight: false
    }
  }
}

// Predefined McKinsey-style chart configs
export const McKinseyChartPresets = {
  executiveDashboard: (data: any[]) => createTremorChartConfig('bar', data, {
    title: 'Executive Performance Dashboard',
    colorPalette: 'blue',
    audienceLevel: 'executive',
    insightLevel: 'strategic',
    consultingStyle: {
      emphasizeInsight: true,
      calloutValue: data.length > 0 ? Math.max(...data.map(d => Object.values(d)[1] as number)) : 0,
      calloutLabel: 'Peak Performance'
    }
  }),

  trendAnalysis: (data: any[]) => createTremorChartConfig('line', data, {
    title: 'Performance Trend Analysis',
    colorPalette: 'emerald',
    curveType: 'monotone',
    showGrid: true,
    consultingStyle: {
      emphasizeInsight: true
    }
  }),

  marketComparison: (data: any[]) => createTremorChartConfig('bar', data, {
    title: 'Market Position Analysis',
    colorPalette: 'violet',
    audienceLevel: 'executive',
    insightLevel: 'strategic',
    consultingStyle: {
      benchmark: {
        value: 100,
        label: 'Industry Average',
        color: '#ef4444'
      }
    }
  })
}

export default WorldClassTremorChart