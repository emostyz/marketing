'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, AreaChart, Area, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, Treemap, Sankey
} from 'recharts'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend as ChartLegend, LineElement, PointElement, ArcElement } from 'chart.js'
import { Bar as ChartJSBar, Line as ChartJSLine, Pie as ChartJSPie, Doughnut } from 'react-chartjs-2'
import * as d3 from 'd3'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, 
  LineChart as LineChartIcon, Activity, Target, AlertTriangle,
  Lightbulb, ArrowRight, CheckCircle, XCircle, Clock
} from 'lucide-react'

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, ChartTooltip, ChartLegend)

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
    theme?: string
    confidence?: number
  }
  charts?: ChartConfig[]
  design?: {
    concept?: any
    layout?: any
    uniqueFeatures?: any[]
    storytellingEnhancement?: any
  }
  visualNarrative?: {
    impact?: string
    emphasis?: string[]
    connections?: string[]
    narrative?: string
  }
  customization?: {
    visualStyle?: string
    innovationLevel?: string
    designComplexity?: string
    layout?: string
    animations?: any
    interactivity?: any
    colorScheme?: string[]
    enableAnimations?: boolean
    enableInteractivity?: boolean
  }
  metadata?: {
    narrativeRole?: string
    visualImpact?: string
    innovationScore?: number
    designComplexity?: string
    slideNumber?: number
  }
}

export interface ChartConfig {
  id: string
  type: string
  chartType: string
  title: string
  description?: string
  data: any[]
  xAxis?: string
  yAxis?: string
  configuration?: any
  customization?: {
    style?: string
    visualUpgrades?: string[]
    interactivity?: string[]
    storytelling?: string[]
    innovation?: string[]
  }
  integration?: any
  enhancement?: any
  businessValue?: string
  insights?: string[]
  visualInnovation?: {
    noveltyScore?: number
    designElements?: string[]
    interactivity?: string[]
    storytelling?: string
  }
}

interface WorldClassSlideRendererProps {
  slides: SlideData[]
  currentSlide: number
  onSlideChange: (index: number) => void
  onSlideEdit?: (slideId: string, updates: Partial<SlideData>) => void
  isEditable?: boolean
  className?: string
}

const COLORS: { [key: string]: string[] } = {
  futuristic: [
    '#6366f1', // Indigo
    '#06b6d4', // Cyan
    '#a21caf', // Fuchsia
    '#f59e42', // Orange
    '#f43f5e', // Rose
  ],
  executive: [
    '#1e293b', // Slate
    '#64748b', // Gray
    '#fbbf24', // Amber
    '#10b981', // Emerald
    '#f87171', // Red
  ],
  premium: [
    '#f59e42', // Orange
    '#6366f1', // Indigo
    '#06b6d4', // Cyan
    '#a21caf', // Fuchsia
    '#f43f5e', // Rose
  ],
  vibrant: [
    '#f43f5e', // Rose
    '#f59e42', // Orange
    '#10b981', // Emerald
    '#6366f1', // Indigo
    '#a21caf', // Fuchsia
  ],
}

export default function WorldClassSlideRenderer({
  slides,
  currentSlide,
  onSlideChange,
  onSlideEdit,
  isEditable = false,
  className = ''
}: WorldClassSlideRendererProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const slideRef = useRef<HTMLDivElement>(null)
  
  const currentSlideData = slides[currentSlide]
  
  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 800)
    return () => clearTimeout(timer)
  }, [currentSlide])

  if (!currentSlideData) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No slide data available</p>
      </div>
    )
  }

  return (
    <div className={`world-class-slide-renderer ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          ref={slideRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="slide-container"
        >
          {renderSlideByType(currentSlideData, isEditable, onSlideEdit)}
        </motion.div>
      </AnimatePresence>
      
      {/* Slide Navigation */}
      <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-lg border">
        <Button 
          variant="outline" 
          onClick={() => onSlideChange(Math.max(0, currentSlide - 1))}
          disabled={currentSlide === 0}
        >
          Previous
        </Button>
        
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => onSlideChange(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        
        <Button 
          variant="outline"
          onClick={() => onSlideChange(Math.min(slides.length - 1, currentSlide + 1))}
          disabled={currentSlide === slides.length - 1}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

function renderSlideByType(slide: SlideData, isEditable: boolean, onSlideEdit?: (slideId: string, updates: Partial<SlideData>) => void) {
  const visualStyle = slide.customization?.visualStyle || 'futuristic'
  const colors = COLORS[visualStyle] || COLORS.futuristic
  
  switch (slide.type) {
    case 'title':
      return <TitleSlide slide={slide} colors={colors} />
    case 'executive_summary':
      return <ExecutiveSummarySlide slide={slide} colors={colors} />
    case 'data_overview':
      return <DataOverviewSlide slide={slide} colors={colors} />
    case 'setup':
    case 'build':
    case 'reveal':
    case 'climax':
    case 'resolve':
    case 'inspire':
      return <NarrativeSlide slide={slide} colors={colors} />
    case 'insight':
    case 'trend_analysis':
    case 'correlation_analysis':
    case 'anomaly_detection':
      return <InsightSlide slide={slide} colors={colors} />
    case 'recommendations':
      return <RecommendationsSlide slide={slide} colors={colors} />
    default:
      return <StandardSlide slide={slide} colors={colors} />
  }
}

function TitleSlide({ slide, colors }: { slide: SlideData; colors: string[] }) {
  return (
    <motion.div 
      className="min-h-[600px] flex flex-col justify-center items-center text-center p-12"
      style={{ 
        background: `linear-gradient(135deg, ${colors[0]}15 0%, ${colors[1]}15 100%)`,
        borderRadius: '16px'
      }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <motion.h1 
        className="text-5xl font-bold mb-6"
        style={{ color: colors[0] }}
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {slide.title}
      </motion.h1>
      
      {slide.subtitle && (
        <motion.h2 
          className="text-2xl text-gray-600 mb-8 max-w-4xl"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {slide.subtitle}
        </motion.h2>
      )}
      
      {slide.content.theme && (
        <motion.div
          className="flex items-center space-x-2 px-6 py-3 rounded-full"
          style={{ backgroundColor: `${colors[1]}20` }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.8 }}
        >
          <Badge variant="secondary" style={{ backgroundColor: colors[1], color: 'white' }}>
            {slide.content.theme}
          </Badge>
          {slide.content.confidence && (
            <span className="text-sm text-gray-600">
              {slide.content.confidence}% Confidence
            </span>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

function ExecutiveSummarySlide({ slide, colors }: { slide: SlideData; colors: string[] }) {
  return (
    <div className="min-h-[600px] p-8" style={{ borderRadius: '16px' }}>
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold mb-8" style={{ color: colors[0] }}>
          {slide.title}
        </h1>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Key Metrics */}
        {slide.content.keyMetrics && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity style={{ color: colors[1] }} />
                  <span>Key Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {slide.content.keyMetrics.map((metric: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                      <span className="font-medium">{metric.name}</span>
                      <div className="text-right">
                        <div className="text-xl font-bold" style={{ color: colors[0] }}>
                          {metric.value}
                        </div>
                        {metric.change && (
                          <div className={`text-sm flex items-center ${
                            metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {metric.change.startsWith('+') ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {metric.change}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {/* Recommendations */}
        {slide.content.recommendations && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target style={{ color: colors[2] }} />
                  <span>Strategic Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {slide.content.recommendations.map((rec: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border-l-4" style={{ borderLeftColor: colors[index % colors.length] }}>
                      <div className="mt-1">
                        <CheckCircle size={16} style={{ color: colors[index % colors.length] }} />
                      </div>
                      <div>
                        <div className="font-medium">{rec.title}</div>
                        <div className="text-sm text-gray-600">{rec.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
      
      {/* Summary */}
      {slide.content.summary && (
        <motion.div
          className="mt-8 p-6 rounded-lg"
          style={{ backgroundColor: `${colors[0]}10` }}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p className="text-lg text-gray-700 leading-relaxed">{slide.content.summary}</p>
        </motion.div>
      )}
    </div>
  )
}

function NarrativeSlide({ slide, colors }: { slide: SlideData; colors: string[] }) {
  const roleIcons = {
    setup: <Lightbulb />,
    build: <TrendingUp />,
    reveal: <AlertTriangle />,
    climax: <Target />,
    resolve: <CheckCircle />,
    inspire: <ArrowRight />
  }
  
  const roleColors = {
    setup: colors[0],
    build: colors[1],
    reveal: colors[2],
    climax: colors[3],
    resolve: colors[4] || colors[0],
    inspire: colors[0]
  }
  
  const icon = roleIcons[slide.metadata?.narrativeRole as keyof typeof roleIcons]
  const roleColor = roleColors[slide.metadata?.narrativeRole as keyof typeof roleColors] || colors[0]
  
  return (
    <div className="min-h-[600px] p-8">
      {/* Header with narrative role indicator */}
      <motion.div
        className="flex items-center space-x-4 mb-8"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="p-3 rounded-full" style={{ backgroundColor: `${roleColor}20` }}>
          <div style={{ color: roleColor }}>
            {icon}
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold" style={{ color: roleColor }}>
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p className="text-xl text-gray-600 mt-2">{slide.subtitle}</p>
          )}
        </div>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Narrative Content */}
        <motion.div
          className="lg:col-span-2"
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {slide.content.narrative && (
            <div className="mb-6 p-6 rounded-lg bg-white border-l-4" style={{ borderLeftColor: roleColor }}>
              <p className="text-lg leading-relaxed text-gray-700">{slide.content.narrative}</p>
            </div>
          )}
          
          {/* Insights */}
          {slide.content.insights && slide.content.insights.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold" style={{ color: roleColor }}>Key Insights</h3>
              {slide.content.insights.map((insight: any, index: number) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Badge variant="secondary" style={{ backgroundColor: colors[index % colors.length] }}>
                        {insight.confidence}%
                      </Badge>
                      <div className="flex-1">
                        <h4 className="font-medium mb-2">{insight.title}</h4>
                        <p className="text-gray-600 mb-2">{insight.description}</p>
                        <div className="text-sm text-gray-500">
                          <strong>Impact:</strong> {insight.businessImplication}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
        
        {/* Charts/Visualizations */}
        {slide.charts && slide.charts.length > 0 && (
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="space-y-6">
              {slide.charts.map((chart, index) => (
                <Card key={chart.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{chart.title}</CardTitle>
                    {chart.description && (
                      <p className="text-sm text-gray-600">{chart.description}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <WorldClassChart chart={chart} colors={colors} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Visual Impact Indicator */}
      {slide.visualNarrative?.impact && (
        <motion.div
          className="mt-8 p-4 rounded-lg flex items-center justify-between"
          style={{ backgroundColor: `${roleColor}10` }}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <span className="font-medium">Visual Impact:</span>
          <Badge 
            variant={slide.visualNarrative.impact === 'dramatic' ? 'destructive' : 'secondary'}
            style={{ 
              backgroundColor: slide.visualNarrative.impact === 'dramatic' ? colors[2] : colors[1],
              color: 'white'
            }}
          >
            {slide.visualNarrative.impact}
          </Badge>
        </motion.div>
      )}
    </div>
  )
}

function InsightSlide({ slide, colors }: { slide: SlideData; colors: string[] }) {
  return (
    <div className="min-h-[600px] p-8">
      <motion.h1
        className="text-4xl font-bold mb-8"
        style={{ color: colors[0] }}
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {slide.title}
      </motion.h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Content */}
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {slide.content.summary && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 style={{ color: colors[1] }} />
                  <span>Analysis Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg leading-relaxed">{slide.content.summary}</p>
              </CardContent>
            </Card>
          )}
          
          {slide.content.insights && slide.content.insights[0] && (
            <div className="space-y-4">
              {slide.content.insights[0].businessImplication && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Business Implication</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{slide.content.insights[0].businessImplication}</p>
                  </CardContent>
                </Card>
              )}
              
              {slide.content.insights[0].recommendation && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <ArrowRight style={{ color: colors[2] }} />
                      <span>Recommended Action</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{slide.content.insights[0].recommendation}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </motion.div>
        
        {/* Charts */}
        {slide.charts && slide.charts.length > 0 && (
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {slide.charts.map((chart, index) => (
              <Card key={chart.id} className="mb-6">
                <CardHeader>
                  <CardTitle>{chart.title}</CardTitle>
                  {chart.description && (
                    <p className="text-sm text-gray-600">{chart.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <WorldClassChart chart={chart} colors={colors} />
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

function RecommendationsSlide({ slide, colors }: { slide: SlideData; colors: string[] }) {
  return (
    <div className="min-h-[600px] p-8">
      <motion.h1
        className="text-4xl font-bold mb-8"
        style={{ color: colors[0] }}
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {slide.title}
      </motion.h1>
      
      {slide.content.recommendations && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {slide.content.recommendations.map((rec: any, index: number) => (
            <motion.div
              key={index}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-start space-x-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    >
                      {index + 1}
                    </div>
                    <span>{rec.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{rec.description}</p>
                  {rec.impact && (
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium">Expected Impact:</span>
                      <Badge variant="secondary">{rec.impact}</Badge>
                    </div>
                  )}
                  {rec.timeline && (
                    <div className="flex items-center space-x-2">
                      <Clock size={14} className="text-gray-500" />
                      <span className="text-sm text-gray-600">{rec.timeline}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

function DataOverviewSlide({ slide, colors }: { slide: SlideData; colors: string[] }) {
  return (
    <div className="min-h-[600px] p-8">
      <motion.h1
        className="text-4xl font-bold mb-8"
        style={{ color: colors[0] }}
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {slide.title}
      </motion.h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Data Quality */}
        {slide.content.dataQuality && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Data Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold" style={{ color: colors[1] }}>
                    {slide.content.dataQuality.score}/100
                  </div>
                </div>
                <Progress 
                  value={slide.content.dataQuality.score} 
                  className="mb-4"
                />
                {slide.content.dataQuality.issues && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Quality Indicators:</h4>
                    {slide.content.dataQuality.issues.map((issue: string, index: number) => (
                      <div key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                        <CheckCircle size={14} style={{ color: colors[2] }} />
                        <span>{issue}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {/* Column Information */}
        {slide.content.keyColumns && (
          <motion.div
            className="lg:col-span-2"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Data Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {slide.content.keyColumns.map((col: any, index: number) => (
                    <div key={index} className="p-3 rounded-lg border">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{col.name}</span>
                        <Badge variant="outline">{col.type}</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {col.uniqueValues} unique values
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
      
      {/* Timeline Chart */}
      {slide.charts && slide.charts.length > 0 && (
        <motion.div
          className="mt-8"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{slide.charts[0].title}</CardTitle>
            </CardHeader>
            <CardContent>
              <WorldClassChart chart={slide.charts[0]} colors={colors} />
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

function StandardSlide({ slide, colors }: { slide: SlideData; colors: string[] }) {
  return (
    <div className="min-h-[600px] p-8">
      <motion.h1
        className="text-4xl font-bold mb-8"
        style={{ color: colors[0] }}
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {slide.title}
      </motion.h1>
      
      {slide.subtitle && (
        <motion.p
          className="text-xl text-gray-600 mb-8"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {slide.subtitle}
        </motion.p>
      )}
      
      {slide.content.summary && (
        <motion.div
          className="prose max-w-none mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-lg leading-relaxed">{slide.content.summary}</p>
        </motion.div>
      )}
      
      {/* Charts */}
      {slide.charts && slide.charts.length > 0 && (
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {slide.charts.map((chart, index) => (
            <Card key={chart.id}>
              <CardHeader>
                <CardTitle>{chart.title}</CardTitle>
                {chart.description && (
                  <p className="text-sm text-gray-600">{chart.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <WorldClassChart chart={chart} colors={colors} />
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}
    </div>
  )
}

function WorldClassChart({ chart, colors }: { chart: ChartConfig; colors: string[] }) {
  const chartColors = colors.slice(0, Math.max(5, chart.data?.length || 0))
  
  if (!chart.data || chart.data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No data available for visualization
      </div>
    )
  }
  
  switch (chart.chartType || chart.type) {
    case 'line':
      return <LineChartComponent data={chart.data} colors={chartColors} />
    case 'bar':
      return <BarChartComponent data={chart.data} colors={chartColors} />
    case 'pie':
      return <PieChartComponent data={chart.data} colors={chartColors} />
    case 'area':
      return <AreaChartComponent data={chart.data} colors={chartColors} />
    case 'scatter':
      return <ScatterChartComponent data={chart.data} colors={chartColors} />
    case 'treemap':
      return <TreemapChartComponent data={chart.data} colors={chartColors} />
    case 'gauge':
      return <GaugeChartComponent data={chart.data} colors={chartColors} />
    case 'timeline':
      return <TimelineChartComponent data={chart.data} colors={chartColors} />
    default:
      return <BarChartComponent data={chart.data} colors={chartColors} />
  }
}

// Chart Components
function LineChartComponent({ data, colors }: { data: any[]; colors: string[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={colors[0]} 
          strokeWidth={3}
          dot={{ fill: colors[0], strokeWidth: 2, r: 6 }}
          activeDot={{ r: 8, stroke: colors[0], strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

function BarChartComponent({ data, colors }: { data: any[]; colors: string[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill={colors[0]} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function PieChartComponent({ data, colors }: { data: any[]; colors: string[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={100}
          fill={colors[0]}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}

function AreaChartComponent({ data, colors }: { data: any[]; colors: string[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke={colors[0]} 
          fill={`${colors[0]}30`} 
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function ScatterChartComponent({ data, colors }: { data: any[]; colors: string[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart data={data}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis dataKey="x" />
        <YAxis dataKey="y" />
        <Tooltip />
        <Scatter name="Data Points" data={data} fill={colors[0]} />
      </ScatterChart>
    </ResponsiveContainer>
  )
}

function TreemapChartComponent({ data, colors }: { data: any[]; colors: string[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <Treemap
        data={data}
        dataKey="value"
        stroke="#fff"
        fill={colors[1]}
      />
    </ResponsiveContainer>
  )
}

function GaugeChartComponent({ data, colors }: { data: any[]; colors: string[] }) {
  const value = data[0]?.value || 0
  const max = data[0]?.max || 100
  const percentage = (value / max) * 100
  
  return (
    <div className="h-64 flex flex-col items-center justify-center">
      <div className="relative w-48 h-24 mb-4">
        <svg width="192" height="96" viewBox="0 0 192 96">
          <path
            d="M 16 80 A 80 80 0 0 1 176 80"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <path
            d="M 16 80 A 80 80 0 0 1 176 80"
            fill="none"
            stroke={colors[0]}
            strokeWidth="8"
            strokeDasharray={`${percentage * 1.57} 157`}
            style={{ transition: 'stroke-dasharray 1s ease-in-out' }}
          />
        </svg>
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-2xl font-bold" style={{ color: colors[0] }}>
            {value}
          </div>
          <div className="text-sm text-gray-600">
            of {max}
          </div>
        </div>
      </div>
    </div>
  )
}

function TimelineChartComponent({ data, colors }: { data: any[]; colors: string[] }) {
  return (
    <div className="h-64 p-4">
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5" style={{ backgroundColor: colors[0] }}></div>
        <div className="space-y-6">
          {data.map((item, index) => (
            <motion.div
              key={index}
              className="relative flex items-center space-x-4"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div 
                className="w-3 h-3 rounded-full border-2 border-white"
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-gray-600">{item.value}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}