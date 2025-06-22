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
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts'
import { ChartConfig } from '@/lib/charts/chart-generator'

interface SlideTemplateProps {
  slide: {
    id: string
    number: number
    type: string
    title: string
    content: string
    charts?: ChartConfig[]
    keyTakeaways?: string[]
    style?: 'modern' | 'minimal' | 'corporate' | 'web3' | 'glassmorphic' | 'mckinsey'
  }
  className?: string
}

// Executive Summary Slide
export const ExecutiveSummarySlide: React.FC<SlideTemplateProps> = ({ slide, className = '' }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-12 flex flex-col justify-center relative overflow-hidden ${className}`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            {slide.title}
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
        </motion.div>

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-gray-300 leading-relaxed mb-8"
        >
          {slide.content}
        </motion.div>

        {/* Key Takeaways */}
        {slide.keyTakeaways && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {slide.keyTakeaways.slice(0, 3).map((takeaway, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {index === 0 ? '📈' : index === 1 ? '💡' : '🎯'}
                </div>
                <p className="text-gray-300">{takeaway}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// Data Visualization Slide
export const DataVisualizationSlide: React.FC<SlideTemplateProps> = ({ slide, className = '' }) => {
  const chart = slide.charts?.[0]
  
  if (!chart) return null

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 p-8 ${className}`}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h2 className="text-4xl font-bold text-white mb-2">{slide.title}</h2>
          <p className="text-gray-400 text-lg">{slide.content}</p>
        </motion.div>

        {/* Chart Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex-1 bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10"
        >
          <ResponsiveContainer width="100%" height="100%">
            {(() => {
              if (chart.type === 'line') {
                return (
                  <LineChart data={chart.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey={chart.xAxis} stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '12px',
                        color: '#F9FAFB'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey={Array.isArray(chart.yAxis) ? chart.yAxis[0] : chart.yAxis} 
                      stroke={Array.isArray(chart.color) ? chart.color[0] : chart.color} 
                      strokeWidth={3}
                      dot={{ fill: Array.isArray(chart.color) ? chart.color[0] : chart.color, strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                )
              }
              
              if (chart.type === 'bar') {
                return (
                  <BarChart data={chart.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey={chart.xAxis} stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '12px',
                        color: '#F9FAFB'
                      }} 
                    />
                    <Bar dataKey={Array.isArray(chart.yAxis) ? chart.yAxis[0] : chart.yAxis} fill={Array.isArray(chart.color) ? chart.color[0] : chart.color} radius={[4, 4, 0, 0]} />
                  </BarChart>
                )
              }

              if (chart.type === 'area') {
                return (
                  <AreaChart data={chart.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey={chart.xAxis} stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '12px',
                        color: '#F9FAFB'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey={Array.isArray(chart.yAxis) ? chart.yAxis[0] : chart.yAxis} 
                      stroke={Array.isArray(chart.color) ? chart.color[0] : chart.color} 
                      fill={Array.isArray(chart.color) ? chart.color[0] : chart.color}
                      fillOpacity={0.3}
                      strokeWidth={3}
                    />
                  </AreaChart>
                )
              }
              
              return <div>Chart type not supported</div>;
            })()}
          </ResponsiveContainer>
        </motion.div>

        {/* Insights */}
        {chart.insights && chart.insights.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {chart.insights.slice(0, 3).map((insight, index) => (
              <div key={index} className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <p className="text-blue-300 text-sm font-medium">{insight}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// Multi-Chart Dashboard Slide
export const DashboardSlide: React.FC<SlideTemplateProps> = ({ slide, className = '' }) => {
  const charts = slide.charts || []

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 ${className}`}
    >
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h2 className="text-3xl font-bold text-white mb-2">{slide.title}</h2>
        <p className="text-gray-400">{slide.content}</p>
      </motion.div>

      {/* Chart Grid */}
      <div className="h-5/6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {charts.slice(0, 4).map((chart, index) => (
          <motion.div
            key={chart.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10"
          >
            <h3 className="text-lg font-semibold text-white mb-3">{chart.title}</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                {(() => {
                  if (chart.type === 'line') {
                    return (
                      <LineChart data={chart.data}>
                        <XAxis dataKey={chart.xAxis} stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#F9FAFB',
                            fontSize: '12px'
                          }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey={Array.isArray(chart.yAxis) ? chart.yAxis[0] : chart.yAxis} 
                          stroke={Array.isArray(chart.color) ? chart.color[0] : chart.color} 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    )
                  }
                  
                  if (chart.type === 'bar') {
                    return (
                      <BarChart data={chart.data}>
                        <XAxis dataKey={chart.xAxis} stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#F9FAFB',
                            fontSize: '12px'
                          }} 
                        />
                        <Bar dataKey={Array.isArray(chart.yAxis) ? chart.yAxis[0] : chart.yAxis} fill={Array.isArray(chart.color) ? chart.color[0] : chart.color} radius={[2, 2, 0, 0]} />
                      </BarChart>
                    )
                  }

                  if (chart.type === 'area') {
                    return (
                      <AreaChart data={chart.data}>
                        <XAxis dataKey={chart.xAxis} stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#F9FAFB',
                            fontSize: '12px'
                          }} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey={Array.isArray(chart.yAxis) ? chart.yAxis[0] : chart.yAxis} 
                          stroke={Array.isArray(chart.color) ? chart.color[0] : chart.color} 
                          fill={Array.isArray(chart.color) ? chart.color[0] : chart.color}
                          fillOpacity={0.2}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    )
                  }
                  
                  return <div>Chart type not supported</div>;
                })()}
              </ResponsiveContainer>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// Key Insights Slide
export const KeyInsightsSlide: React.FC<SlideTemplateProps> = ({ slide, className = '' }) => {
  const insights = slide.keyTakeaways || []
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-10 ${className}`}
    >
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-5xl font-bold text-white mb-4">{slide.title}</h2>
        <p className="text-xl text-gray-300">{slide.content}</p>
      </motion.div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 h-3/4">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">
                  {index === 0 ? '🚀' : index === 1 ? '💎' : index === 2 ? '⚡' : '✨'}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Insight {index + 1}</h3>
              <p className="text-gray-300 leading-relaxed">{insight}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// Recommendations Slide
export const RecommendationsSlide: React.FC<SlideTemplateProps> = ({ slide, className = '' }) => {
  const recommendations = slide.keyTakeaways || []
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`w-full h-full bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 p-10 ${className}`}
    >
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-10"
      >
        <h2 className="text-5xl font-bold text-white mb-4">{slide.title}</h2>
        <p className="text-xl text-gray-300">{slide.content}</p>
      </motion.div>

      {/* Recommendations List */}
      <div className="space-y-6">
        {recommendations.map((recommendation, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.15 }}
            className="flex items-start space-x-6 bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
          >
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
              {index + 1}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-2">
                Recommendation {index + 1}
              </h3>
              <p className="text-gray-300 leading-relaxed">{recommendation}</p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <span className="text-emerald-400">→</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}