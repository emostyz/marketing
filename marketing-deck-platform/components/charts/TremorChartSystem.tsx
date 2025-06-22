'use client'

import React from 'react'
import {
  AreaChart,
  BarChart,
  LineChart,
  DonutChart,
  ScatterChart,
  Card,
  Badge,
  Callout,
  ProgressBar
} from '@tremor/react'
import { ChartConfig } from '@/lib/charts/chart-generator'
import { motion } from 'framer-motion'

interface TremorChartProps {
  config: ChartConfig
  className?: string
  interactive?: boolean
  showHeader?: boolean
}

// World-class Tremor chart wrapper with Web3 styling
export const TremorChart: React.FC<TremorChartProps> = ({ 
  config, 
  className = '', 
  interactive = true,
  showHeader = true 
}) => {
  const getColorPalette = (style: string) => {
    const palettes = {
      modern: ['blue', 'emerald', 'violet', 'amber', 'rose'],
      minimal: ['slate', 'gray', 'zinc', 'neutral', 'stone'],
      corporate: ['blue', 'red', 'emerald', 'amber', 'indigo'],
      web3: ['violet', 'cyan', 'emerald', 'amber', 'rose'],
      glassmorphic: ['blue', 'violet', 'cyan', 'emerald', 'amber']
    }
    return palettes[style as keyof typeof palettes] || palettes.modern
  }

  const colors = getColorPalette(config.style)

  const chartProps = {
    data: config.data,
    index: config.xAxis,
    categories: Array.isArray(config.yAxis) ? config.yAxis : [config.yAxis],
    colors,
    showLegend: config.showLegend,
    showGridLines: config.showGrid,
    enableLegendSlider: true,
    allowDecimals: false,
    showAnimation: config.animation,
    animationDuration: 1000,
    curveType: 'monotone' as const,
    connectNulls: true
  }

  const renderChart = () => {
    switch (config.type) {
      case 'line':
        return <LineChart {...chartProps} />
      case 'bar':
        return <BarChart {...chartProps} />
      case 'area':
        return <AreaChart {...chartProps} />
      case 'donut':
      case 'pie':
        return (
          <DonutChart
            data={config.data}
            category="value"
            index="category"
            colors={colors}
            showAnimation={config.animation}
            showLabel={true}
            showTooltip={config.showTooltip}
          />
        )
      case 'scatter':
        return (
          <ScatterChart
            data={config.data}
            x={config.xAxis}
            y={Array.isArray(config.yAxis) ? config.yAxis[0] : config.yAxis}
            category={config.xAxis}  // Required prop for ScatterChart
            colors={colors}
            showLegend={config.showLegend}
            enableLegendSlider={true}
          />
        )
      default:
        return <BarChart {...chartProps} />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card 
        className={`
          ${config.style === 'glassmorphic' ? 'bg-white/5 backdrop-blur-xl border-white/10' : ''}
          ${config.style === 'web3' ? 'bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700' : ''}
          ${config.style === 'modern' ? 'bg-white dark:bg-slate-900' : ''}
          relative overflow-hidden
        `}
        decoration={config.style === 'web3' ? 'left' : 'top'}
        decorationColor={colors[0]}
      >
        {/* Background Effects for Web3 Style */}
        {config.style === 'web3' && (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full filter blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500 rounded-full filter blur-2xl"></div>
          </div>
        )}

        {showHeader && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative z-10"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className={`text-lg font-bold mb-2 ${
                  config.style === 'web3' ? 'text-white' : ''
                } ${
                  config.style === 'glassmorphic' ? 'text-white' : ''
                }`}>
                  {config.title}
                </h3>
                <p className={`
                  ${config.style === 'web3' ? 'text-gray-300' : ''}
                  ${config.style === 'glassmorphic' ? 'text-gray-300' : ''}
                `}>
                  {config.description}
                </p>
              </div>
              <Badge 
                color={colors[0] as any} 
                size="lg"
                className={config.style === 'web3' ? 'bg-blue-500/20 text-blue-300' : ''}
              >
                {config.type.toUpperCase()}
              </Badge>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative z-10"
          style={{ height: config.height || 400 }}
        >
          {renderChart()}
        </motion.div>

        {/* Insights Section */}
        {config.insights && config.insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 relative z-10"
          >
            <h4 className={`text-sm font-medium mb-3 ${
              config.style === 'web3' ? 'text-gray-300' : ''
            } ${
              config.style === 'glassmorphic' ? 'text-gray-300' : ''
            }`}>
              Key Insights
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {config.insights.slice(0, 3).map((insight, index) => (
                <div key={index}>
                  <Callout
                    title={`Insight ${index + 1}`}
                    color={colors[index % colors.length]}
                    className={`
                      ${config.style === 'web3' ? 'bg-white/5 border-white/10' : ''}
                      ${config.style === 'glassmorphic' ? 'bg-white/5 border-white/10' : ''}
                    `}
                  >
                    <p className={`
                      ${config.style === 'web3' ? 'text-gray-300' : ''}
                      ${config.style === 'glassmorphic' ? 'text-gray-300' : ''}
                    `}>
                      {insight}
                    </p>
                  </Callout>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  )
}

// Multi-chart dashboard component
export const TremorDashboard: React.FC<{ configs: ChartConfig[], title?: string }> = ({ 
  configs, 
  title = "Analytics Dashboard" 
}) => {
  const primaryMetrics = configs.reduce((acc, config) => {
    if (config.data && config.data.length > 0) {
      const latestData = config.data[config.data.length - 1]
      const value = latestData[Array.isArray(config.yAxis) ? config.yAxis[0] : config.yAxis]
      if (typeof value === 'number') {
        acc.push({
          title: config.title,
          value: value.toLocaleString(),
          change: Math.random() > 0.5 ? '+12.3%' : '-2.1%',
          changeType: Math.random() > 0.5 ? 'increase' : 'decrease'
        })
      }
    }
    return acc
  }, [] as any[])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-gray-600">Real-time analytics and insights</p>
      </motion.div>

      {/* Metrics Overview */}
      {primaryMetrics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {primaryMetrics.slice(0, 4).map((metric, index) => (
              <div key={index}>
                <Card decoration="top" decorationColor={index % 2 === 0 ? 'blue' : 'emerald'}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">{metric.title}</p>
                      <p className="text-2xl font-bold">{metric.value}</p>
                    </div>
                    <Badge 
                      color={metric.changeType === 'increase' ? 'emerald' : 'red'}
                      size="sm"
                    >
                      {metric.change}
                    </Badge>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Charts Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {configs.map((config, index) => (
            <div key={config.id} className={config.type === 'donut' ? 'lg:col-span-1' : 'lg:col-span-1'}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <TremorChart config={config} />
              </motion.div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

// Interactive chart with live data simulation
export const LiveTremorChart: React.FC<{ baseConfig: ChartConfig }> = ({ baseConfig }) => {
  const [data, setData] = React.useState(baseConfig.data)
  const [isLive, setIsLive] = React.useState(false)

  React.useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      setData(prevData => {
        const newData = [...prevData]
        // Simulate live data updates
        newData.forEach(item => {
          const yKey = Array.isArray(baseConfig.yAxis) ? baseConfig.yAxis[0] : baseConfig.yAxis
          if (typeof item[yKey] === 'number') {
            item[yKey] = item[yKey] * (0.95 + Math.random() * 0.1) // ±5% variation
          }
        })
        return newData
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [isLive, baseConfig.yAxis])

  const liveConfig = { ...baseConfig, data }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">Live Data Visualization</h3>
        <button
          onClick={() => setIsLive(!isLive)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            isLive 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {isLive ? 'Stop Live' : 'Start Live'}
        </button>
      </div>
      
      <TremorChart config={liveConfig} />
      
      {isLive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center space-x-2"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <p className="text-green-600">Live data updates every 2 seconds</p>
        </motion.div>
      )}
    </div>
  )
}