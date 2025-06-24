'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Target, Zap, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SlideRendererProps {
  slide: any
  scale: number
  isActive?: boolean
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316']

export default function EnhancedSlideRenderer({ slide, scale, isActive = true }: SlideRendererProps) {
  // Chart component mapping
  const renderChart = (chart: any, index: number) => {
    const chartData = chart.data || []
    const config = chart.config || {}
    
    const commonProps = {
      width: 400 * scale,
      height: 250 * scale,
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    }

    switch (chart.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={250 * scale}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey={config.xAxisKey || 'name'} 
                stroke="rgba(255,255,255,0.7)"
                fontSize={12 * scale}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.7)"
                fontSize={12 * scale}
                tickFormatter={config.valueFormatter}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px'
                }}
                formatter={config.valueFormatter ? [config.valueFormatter] : undefined}
              />
              {config.showLegend && <Legend />}
              <Line 
                type="monotone" 
                dataKey={config.yAxisKey || 'value'} 
                stroke={COLORS[0]}
                strokeWidth={2 * scale}
                dot={{ fill: COLORS[0], strokeWidth: 2, r: 4 * scale }}
                activeDot={{ r: 6 * scale, stroke: COLORS[0], strokeWidth: 2 }}
                animationDuration={config.showAnimation ? 2000 : 0}
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={250 * scale}>
            <AreaChart {...commonProps}>
              <defs>
                <linearGradient id={`colorGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey={config.xAxisKey || 'name'} 
                stroke="rgba(255,255,255,0.7)"
                fontSize={12 * scale}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.7)"
                fontSize={12 * scale}
                tickFormatter={config.valueFormatter}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px'
                }}
                formatter={config.valueFormatter ? [config.valueFormatter] : undefined}
              />
              {config.showLegend && <Legend />}
              <Area 
                type="monotone" 
                dataKey={config.yAxisKey || 'value'} 
                stroke={COLORS[0]}
                strokeWidth={2 * scale}
                fillOpacity={0.6}
                fill={`url(#colorGradient${index})`}
                animationDuration={config.showAnimation ? 2000 : 0}
              />
            </AreaChart>
          </ResponsiveContainer>
        )

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={250 * scale}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey={config.xAxisKey || 'name'} 
                stroke="rgba(255,255,255,0.7)"
                fontSize={12 * scale}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.7)"
                fontSize={12 * scale}
                tickFormatter={config.valueFormatter}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px'
                }}
                formatter={config.valueFormatter ? [config.valueFormatter] : undefined}
              />
              {config.showLegend && <Legend />}
              <Bar 
                dataKey={config.yAxisKey || 'value'} 
                fill={COLORS[0]}
                radius={[4 * scale, 4 * scale, 0, 0]}
                animationDuration={config.showAnimation ? 2000 : 0}
              />
            </BarChart>
          </ResponsiveContainer>
        )

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={250 * scale}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80 * scale}
                fill="#8884d8"
                dataKey={config.yAxisKey || 'value'}
                animationDuration={config.showAnimation ? 2000 : 0}
              >
                {chartData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px'
                }}
                formatter={config.valueFormatter ? [config.valueFormatter] : undefined}
              />
            </PieChart>
          </ResponsiveContainer>
        )

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={250 * scale}>
            <ScatterChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey={config.xAxisKey || 'x'} 
                stroke="rgba(255,255,255,0.7)"
                fontSize={12 * scale}
                type="number"
              />
              <YAxis 
                dataKey={config.yAxisKey || 'y'}
                stroke="rgba(255,255,255,0.7)"
                fontSize={12 * scale}
                type="number"
                tickFormatter={config.valueFormatter}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px'
                }}
                formatter={config.valueFormatter ? [config.valueFormatter] : undefined}
              />
              {config.showLegend && <Legend />}
              <Scatter 
                data={chartData} 
                fill={COLORS[0]}
                animationDuration={config.showAnimation ? 2000 : 0}
              />
            </ScatterChart>
          </ResponsiveContainer>
        )

      default:
        return (
          <div className="w-full h-[250px] bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">Chart type not supported</span>
          </div>
        )
    }
  }

  const getInsightIcon = (insightType: string) => {
    switch (insightType) {
      case 'trend': return <TrendingUp className="w-4 h-4" />
      case 'decline': return <TrendingDown className="w-4 h-4" />
      case 'target': return <Target className="w-4 h-4" />
      case 'breakthrough': return <Zap className="w-4 h-4" />
      default: return <Star className="w-4 h-4" />
    }
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0"
        style={{
          background: slide.background?.type === 'gradient' 
            ? `linear-gradient(${slide.background.gradient?.direction || '135deg'}, ${slide.background.gradient?.from || '#0f172a'}, ${slide.background.gradient?.to || '#1e293b'})`
            : slide.background?.value || '#ffffff'
        }}
      />

      {/* Content Container */}
      <div className="relative w-full h-full p-8" style={{ padding: `${32 * scale}px` }}>
        {/* Header Section */}
        <div className="mb-8" style={{ marginBottom: `${32 * scale}px` }}>
          {/* Title */}
          {slide.title && (
            <motion.h1 
              className="font-bold mb-4"
              style={{ 
                color: slide.customStyles?.textColor || '#ffffff',
                fontSize: `${48 * scale}px`,
                lineHeight: 1.2,
                marginBottom: `${16 * scale}px`
              }}
              initial={isActive ? { y: -20, opacity: 0 } : false}
              animate={isActive ? { y: 0, opacity: 1 } : {}}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              {slide.title}
            </motion.h1>
          )}

          {/* Subtitle */}
          {slide.subtitle && (
            <motion.h2 
              className="text-gray-300 mb-6"
              style={{ 
                color: slide.customStyles?.textColor ? `${slide.customStyles.textColor}80` : 'rgba(255,255,255,0.7)',
                fontSize: `${24 * scale}px`,
                lineHeight: 1.3,
                marginBottom: `${24 * scale}px`
              }}
              initial={isActive ? { y: -20, opacity: 0 } : false}
              animate={isActive ? { y: 0, opacity: 1 } : {}}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              {slide.subtitle}
            </motion.h2>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6" style={{ gap: `${24 * scale}px` }}>
          {/* Left Column - Text Content */}
          <div className="col-span-6">
            {/* Content Summary */}
            {slide.content?.summary && (
              <motion.div 
                className="mb-6"
                style={{ marginBottom: `${24 * scale}px` }}
                initial={isActive ? { x: -20, opacity: 0 } : false}
                animate={isActive ? { x: 0, opacity: 1 } : {}}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <p style={{ 
                  color: slide.customStyles?.textColor || 'rgba(255,255,255,0.9)',
                  fontSize: `${18 * scale}px`,
                  lineHeight: 1.6
                }}>
                  {slide.content.summary}
                </p>
              </motion.div>
            )}

            {/* Key Takeaways */}
            {slide.keyTakeaways && slide.keyTakeaways.length > 0 && (
              <motion.div 
                className="space-y-3"
                style={{ gap: `${12 * scale}px` }}
                initial={isActive ? { x: -20, opacity: 0 } : false}
                animate={isActive ? { x: 0, opacity: 1 } : {}}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <h3 
                  className="font-semibold mb-4"
                  style={{ 
                    color: slide.customStyles?.accentColor || '#3b82f6',
                    fontSize: `${20 * scale}px`,
                    marginBottom: `${16 * scale}px`
                  }}
                >
                  Key Insights
                </h3>
                <div className="space-y-3" style={{ gap: `${12 * scale}px` }}>
                  {slide.keyTakeaways.map((takeaway: string, index: number) => (
                    <motion.div 
                      key={index}
                      className="flex items-start space-x-3"
                      style={{ gap: `${12 * scale}px` }}
                      initial={isActive ? { x: -20, opacity: 0 } : false}
                      animate={isActive ? { x: 0, opacity: 1 } : {}}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                    >
                      <div 
                        className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                        style={{ 
                          width: `${8 * scale}px`,
                          height: `${8 * scale}px`,
                          marginTop: `${8 * scale}px`,
                          backgroundColor: slide.customStyles?.accentColor || '#3b82f6'
                        }}
                      />
                      <span style={{ 
                        color: slide.customStyles?.textColor || 'rgba(255,255,255,0.9)',
                        fontSize: `${16 * scale}px`,
                        lineHeight: 1.5
                      }}>
                        {takeaway}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Charts and Visuals */}
          <div className="col-span-6">
            {slide.charts && slide.charts.length > 0 && (
              <motion.div
                className="space-y-6"
                style={{ gap: `${24 * scale}px` }}
                initial={isActive ? { x: 20, opacity: 0 } : false}
                animate={isActive ? { x: 0, opacity: 1 } : {}}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                {slide.charts.map((chart: any, index: number) => (
                  <div key={index} className="space-y-4" style={{ gap: `${16 * scale}px` }}>
                    {/* Chart Title */}
                    {chart.title && (
                      <h4 
                        className="font-semibold"
                        style={{ 
                          color: slide.customStyles?.textColor || 'rgba(255,255,255,0.9)',
                          fontSize: `${18 * scale}px`
                        }}
                      >
                        {chart.title}
                      </h4>
                    )}
                    
                    {/* Chart Container */}
                    <div 
                      className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10"
                      style={{ 
                        padding: `${16 * scale}px`,
                        borderRadius: `${8 * scale}px`
                      }}
                    >
                      {renderChart(chart, index)}
                    </div>

                    {/* Chart Insights */}
                    {chart.insights && chart.insights.length > 0 && (
                      <div className="space-y-2" style={{ gap: `${8 * scale}px` }}>
                        {chart.insights.map((insight: string, insightIndex: number) => (
                          <div 
                            key={insightIndex}
                            className="flex items-center space-x-2 text-sm bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 rounded-lg p-3"
                            style={{ 
                              gap: `${8 * scale}px`,
                              fontSize: `${14 * scale}px`,
                              padding: `${12 * scale}px`,
                              borderRadius: `${6 * scale}px`
                            }}
                          >
                            <div style={{ color: '#3b82f6' }}>
                              {getInsightIcon('breakthrough')}
                            </div>
                            <span style={{ 
                              color: slide.customStyles?.textColor || 'rgba(255,255,255,0.9)'
                            }}>
                              {insight}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* AI Insights Badge */}
        {slide.aiInsights?.confidence && (
          <motion.div 
            className="absolute top-4 right-4 bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-lg px-3 py-2"
            style={{ 
              top: `${16 * scale}px`,
              right: `${16 * scale}px`,
              padding: `${8 * scale}px ${12 * scale}px`,
              borderRadius: `${8 * scale}px`
            }}
            initial={isActive ? { scale: 0, opacity: 0 } : false}
            animate={isActive ? { scale: 1, opacity: 1 } : {}}
            transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
          >
            <div className="flex items-center space-x-2" style={{ gap: `${8 * scale}px` }}>
              <Zap className="w-4 h-4 text-blue-400" style={{ width: `${16 * scale}px`, height: `${16 * scale}px` }} />
              <span 
                className="text-blue-400 font-medium"
                style={{ fontSize: `${12 * scale}px` }}
              >
                AI Confidence: {slide.aiInsights.confidence}%
              </span>
            </div>
          </motion.div>
        )}

        {/* Hidden Insight Callout */}
        {slide.content?.hiddenInsight && (
          <motion.div 
            className="absolute bottom-4 left-4 bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 rounded-lg px-4 py-3 max-w-md"
            style={{ 
              bottom: `${16 * scale}px`,
              left: `${16 * scale}px`,
              padding: `${12 * scale}px ${16 * scale}px`,
              borderRadius: `${8 * scale}px`,
              maxWidth: `${384 * scale}px`
            }}
            initial={isActive ? { y: 20, opacity: 0 } : false}
            animate={isActive ? { y: 0, opacity: 1 } : {}}
            transition={{ delay: 1.0, duration: 0.6 }}
          >
            <div className="flex items-start space-x-2" style={{ gap: `${8 * scale}px` }}>
              <Star className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" style={{ width: `${20 * scale}px`, height: `${20 * scale}px` }} />
              <div>
                <h5 
                  className="font-semibold text-purple-400 mb-1"
                  style={{ 
                    fontSize: `${14 * scale}px`,
                    marginBottom: `${4 * scale}px`
                  }}
                >
                  Hidden Insight
                </h5>
                <p 
                  style={{ 
                    color: slide.customStyles?.textColor || 'rgba(255,255,255,0.9)',
                    fontSize: `${12 * scale}px`,
                    lineHeight: 1.4
                  }}
                >
                  {slide.content.hiddenInsight}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Subtle slide border */}
      <div 
        className="absolute inset-0 rounded-lg pointer-events-none"
        style={{ 
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)',
          borderRadius: `${8 * scale}px`
        }}
      />
    </div>
  )
}