'use client'

import React from 'react'
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

interface FallbackChartProps {
  data: any[]
  type: 'area' | 'bar' | 'line' | 'pie' | 'donut' | 'scatter'
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
  mckinsey: ['#1e40af', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'],
  bcg: ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
  bain: ['#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fecaca'],
  deloitte: ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0']
}

export function FallbackChartRenderer({
  data,
  type,
  title,
  subtitle,
  xAxisKey = 'name',
  yAxisKey = 'value',
  colors,
  className = '',
  showAnimation = true,
  showGrid = true,
  showLegend = true,
  consultingStyle = 'mckinsey',
  insight,
  dataCallout,
  showDataLabels = false
}: FallbackChartProps) {
  
  // Use consulting-specific colors if not provided
  const chartColors = colors || CONSULTING_COLORS[consultingStyle]
  
  // Professional chart container
  const ChartContainer = ({ children, chartType }: { children: React.ReactNode, chartType: string }) => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Professional header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {title && (
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 font-medium">
                {subtitle}
              </p>
            )}
            {dataCallout && (
              <div className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-blue-50 text-blue-700 mt-2">
                📊 {dataCallout}
              </div>
            )}
          </div>
          <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">
            {chartType}
          </div>
        </div>
      </div>
      
      {/* Chart content */}
      <div className="p-6">
        <div className={`h-80 w-full ${className}`}>
          {children}
        </div>
      </div>
      
      {/* Insight footer */}
      {insight && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Key Insight</p>
              <p className="text-sm text-gray-600">{insight}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // Ensure data is valid
  if (!data || data.length === 0) {
    return (
      <ChartContainer chartType={type}>
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="font-medium">No data available</p>
            <p className="text-xs mt-1">Please provide chart data</p>
          </div>
        </div>
      </ChartContainer>
    )
  }

  switch (type) {
    case 'bar':
      return (
        <ChartContainer chartType="Bar Chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
              <XAxis 
                dataKey={xAxisKey} 
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
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              {showLegend && <Legend />}
              <Bar 
                dataKey={yAxisKey} 
                fill={chartColors[0]}
                radius={[4, 4, 0, 0]}
                animationDuration={showAnimation ? 1000 : 0}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      )

    case 'line':
      return (
        <ChartContainer chartType="Line Chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
              <XAxis 
                dataKey={xAxisKey}
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
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              {showLegend && <Legend />}
              <Line 
                type="monotone" 
                dataKey={yAxisKey} 
                stroke={chartColors[0]}
                strokeWidth={3}
                dot={{ fill: chartColors[0], strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: chartColors[0], strokeWidth: 2 }}
                animationDuration={showAnimation ? 1000 : 0}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      )

    case 'area':
      return (
        <ChartContainer chartType="Area Chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
              <XAxis 
                dataKey={xAxisKey}
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
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              {showLegend && <Legend />}
              <Area 
                type="monotone" 
                dataKey={yAxisKey} 
                stroke={chartColors[0]}
                fill={chartColors[0]}
                fillOpacity={0.6}
                strokeWidth={2}
                animationDuration={showAnimation ? 1000 : 0}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      )

    case 'pie':
    case 'donut':
      return (
        <ChartContainer chartType="Pie Chart">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={type === 'donut' ? 60 : 0}
                outerRadius={120}
                paddingAngle={2}
                dataKey={yAxisKey}
                animationDuration={showAnimation ? 1000 : 0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      )

    default:
      return (
        <ChartContainer chartType="Unknown">
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="font-medium">Unsupported chart type: {type}</p>
              <p className="text-xs mt-1">Please select a supported format</p>
            </div>
          </div>
        </ChartContainer>
      )
  }
}

export default FallbackChartRenderer