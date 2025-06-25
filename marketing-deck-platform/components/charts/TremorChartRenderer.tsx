'use client'

import React from 'react'
import { 
  AreaChart, 
  BarChart, 
  LineChart, 
  DonutChart,
  ScatterChart
} from '@tremor/react'

interface TremorChartProps {
  data: any[]
  type: 'area' | 'bar' | 'line' | 'donut' | 'scatter'
  title?: string
  xAxisKey?: string
  yAxisKey?: string
  colors?: string[]
  className?: string
  showAnimation?: boolean
  showGrid?: boolean
  showLegend?: boolean
}

export default function TremorChartRenderer({
  data,
  type,
  title,
  xAxisKey = 'name',
  yAxisKey = 'value',
  colors = ['blue', 'emerald', 'amber', 'rose', 'violet', 'cyan'],
  className = '',
  showAnimation = true,
  showGrid = true,
  showLegend = true
}: TremorChartProps) {
  const commonProps = {
    data,
    index: xAxisKey,
    categories: [yAxisKey],
    colors,
    showAnimation,
    showGridLines: showGrid,
    showLegend,
    className: `h-64 w-full ${className}`,
    animationDuration: showAnimation ? 1000 : 0
  }

  switch (type) {
    case 'area':
      return (
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          {title && <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>}
          <AreaChart {...commonProps} />
        </div>
      )

    case 'bar':
      return (
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          {title && <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>}
          <BarChart {...commonProps} />
        </div>
      )

    case 'line':
      return (
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          {title && <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>}
          <LineChart {...commonProps} />
        </div>
      )

    case 'donut':
      return (
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          {title && <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>}
          <DonutChart
            data={data}
            category={yAxisKey}
            index={xAxisKey}
            colors={colors}
            className="h-64 w-full"
            showAnimation={showAnimation}
            animationDuration={showAnimation ? 1000 : 0}
          />
        </div>
      )

    case 'scatter':
      return (
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          {title && <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>}
          <ScatterChart {...commonProps} />
        </div>
      )

    default:
      return (
        <div className="bg-gray-100 p-4 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 text-center">Unsupported chart type: {type}</p>
        </div>
      )
  }
}