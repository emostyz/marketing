'use client'

import React from 'react'
import { FallbackChartRenderer } from './FallbackChartRenderer'

// Try to import Tremor components with fallback
let AreaChart: any, BarChart: any, LineChart: any, DonutChart: any, ScatterChart: any
let tremorAvailable = false

try {
  // For beta version, try multiple import methods
  let tremorModule
  
  try {
    // Method 1: Direct import
    tremorModule = require('@tremor/react')
  } catch (e1) {
    try {
      // Method 2: ES6 import converted
      const importResult = import('@tremor/react')
      tremorModule = importResult
    } catch (e2) {
      throw new Error('All import methods failed')
    }
  }
  
  // Extract components with multiple fallback names (beta might have different exports)
  AreaChart = tremorModule.AreaChart || tremorModule.Area
  BarChart = tremorModule.BarChart || tremorModule.Bar  
  LineChart = tremorModule.LineChart || tremorModule.Line
  DonutChart = tremorModule.DonutChart || tremorModule.Donut || tremorModule.PieChart
  ScatterChart = tremorModule.ScatterChart || tremorModule.Scatter
  
  // Test if at least basic charts are available
  if (AreaChart && BarChart && LineChart) {
    tremorAvailable = true
    console.log('✅ Tremor charts loaded successfully')
    console.log('Available charts:', {
      area: !!AreaChart,
      bar: !!BarChart, 
      line: !!LineChart,
      donut: !!DonutChart,
      scatter: !!ScatterChart
    })
  } else {
    throw new Error('Essential Tremor components not available')
  }
} catch (error) {
  console.warn('⚠️ Tremor charts not available, using fallback renderer:', error.message)
  tremorAvailable = false
}

interface TremorChartProps {
  data: any[]
  type: 'area' | 'bar' | 'line' | 'donut' | 'scatter'
  title?: string
  subtitle?: string
  xAxisKey?: string
  yAxisKey?: string
  colors?: string[]
  className?: string
  showAnimation?: boolean
  showGrid?: boolean
  showLegend?: boolean
  consultingStyle?: 'mckinsey' | 'bcg' | 'bain' | 'deloitte'
  insight?: string
  dataCallout?: string
  showDataLabels?: boolean
}

// Professional consulting color palettes
const CONSULTING_COLORS = {
  mckinsey: {
    primary: ['blue-600', 'blue-500', 'blue-400', 'slate-600', 'slate-500'],
    accent: ['amber-500', 'emerald-500', 'rose-500'],
    neutral: ['slate-300', 'slate-400', 'slate-500']
  },
  bcg: {
    primary: ['emerald-600', 'emerald-500', 'emerald-400', 'teal-600', 'teal-500'],
    accent: ['orange-500', 'blue-500', 'purple-500'],
    neutral: ['gray-300', 'gray-400', 'gray-500']
  },
  bain: {
    primary: ['red-600', 'red-500', 'red-400', 'slate-600', 'slate-500'],
    accent: ['blue-500', 'emerald-500', 'amber-500'],
    neutral: ['slate-300', 'slate-400', 'slate-500']
  },
  deloitte: {
    primary: ['green-600', 'green-500', 'green-400', 'slate-600', 'slate-500'],
    accent: ['blue-500', 'purple-500', 'amber-500'],
    neutral: ['gray-300', 'gray-400', 'gray-500']
  }
}

function TremorChartRenderer({
  data,
  type,
  title,
  subtitle,
  xAxisKey = 'name',
  yAxisKey = 'value',
  colors,
  className = '',
  showAnimation = true,
  showGrid = false, // Consulting charts often have minimal gridlines
  showLegend = true,
  consultingStyle = 'mckinsey',
  insight,
  dataCallout,
  showDataLabels = false
}: TremorChartProps) {
  
  // If Tremor is not available, use fallback renderer
  if (!tremorAvailable) {
    return (
      <FallbackChartRenderer
        data={data}
        type={type}
        title={title}
        subtitle={subtitle}
        xAxisKey={xAxisKey}
        yAxisKey={yAxisKey}
        colors={colors}
        className={className}
        showAnimation={showAnimation}
        showGrid={showGrid}
        showLegend={showLegend}
        consultingStyle={consultingStyle}
        insight={insight}
        dataCallout={dataCallout}
        showDataLabels={showDataLabels}
      />
    )
  }
  
  // Use consulting-specific colors if not provided
  const chartColors = colors || CONSULTING_COLORS[consultingStyle].primary
  
  const commonProps = {
    data,
    index: xAxisKey,
    categories: [yAxisKey],
    colors: chartColors,
    showAnimation,
    showGridLines: showGrid,
    showLegend,
    className: `h-80 w-full ${className}`, // Increased height for professional look
    animationDuration: showAnimation ? 1200 : 0,
    showTooltip: true,
    showXAxis: true,
    showYAxis: true
  }

  // Professional chart container with consulting-style design
  const ChartContainer = ({ children, chartType }: { children: React.ReactNode, chartType: string }) => (
    <div className="bg-white border-l-4 border-l-blue-600 shadow-sm">
      {/* Professional header section like McKinsey charts */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {title && (
              <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 mb-2 font-medium">
                {subtitle}
              </p>
            )}
            {dataCallout && (
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                📊 {dataCallout}
              </div>
            )}
          </div>
          <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">
            {chartType.toUpperCase()} CHART
          </div>
        </div>
      </div>
      
      {/* Chart content area */}
      <div className="px-6 py-6">
        {children}
      </div>
      
      {/* Professional insight footer like consulting decks */}
      {insight && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Key Insight</p>
              <p className="text-sm text-gray-600 leading-relaxed">{insight}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  switch (type) {
    case 'area':
      return (
        <ChartContainer chartType="trend">
          <AreaChart 
            {...commonProps} 
            curveType="monotone"
            connectNulls={false}
            className="h-80 w-full"
          />
        </ChartContainer>
      )

    case 'bar':
      return (
        <ChartContainer chartType="comparison">
          <BarChart 
            {...commonProps}
            layout="vertical"
            className="h-80 w-full"
          />
        </ChartContainer>
      )

    case 'line':
      return (
        <ChartContainer chartType="performance">
          <LineChart 
            {...commonProps}
            curveType="monotone"
            connectNulls={false}
            className="h-80 w-full"
          />
        </ChartContainer>
      )

    case 'donut':
      return (
        <ChartContainer chartType="composition">
          <DonutChart
            data={data}
            category={yAxisKey}
            index={xAxisKey}
            colors={chartColors}
            className="h-80 w-full"
            showAnimation={showAnimation}
            animationDuration={showAnimation ? 1200 : 0}
            variant="pie"
            showTooltip={true}
          />
        </ChartContainer>
      )

    case 'scatter':
      return (
        <ChartContainer chartType="correlation">
          <ScatterChart 
            {...commonProps}
            className="h-80 w-full"
          />
        </ChartContainer>
      )

    default:
      return (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">Unsupported chart type: {type}</p>
            <p className="text-xs text-gray-400 mt-1">Please select a supported chart format</p>
          </div>
        </div>
      )
  }
}

// Export both named and default exports to fix import issues
export { TremorChartRenderer }
export default TremorChartRenderer