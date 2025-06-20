'use client'
import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { 
  ChevronLeft, ChevronRight, Play, Download, Save, 
  BarChart3, LineChart, PieChart, FileText,
  Home, Settings, Share2, Eye
} from 'lucide-react'
import { BarChart, Bar, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

const sampleSlides = [
  {
    id: 1,
    type: 'title',
    title: 'Sales Performance Analysis',
    content: {
      subtitle: 'Q4 2024 Executive Summary',
      description: 'Data-driven insights and strategic recommendations for continued growth'
    },
    narrative: 'This executive presentation analyzes Q4 sales performance across 6 key metrics.'
  },
  {
    id: 2,
    type: 'executive-dashboard',
    title: 'Executive KPI Dashboard',
    content: {
      summary: 'Q4 performance shows strong upward momentum across all key metrics with 92% confidence',
      confidence: 92,
      metrics: [
        { metric: 'Revenue', value: 2450000, change: 15.8, trend: 'positive', status: 'positive' },
        { metric: 'Leads', value: 8750, change: 12.3, trend: 'positive', status: 'positive' },
        { metric: 'Conversion', value: 18.5, change: 8.7, trend: 'positive', status: 'positive' }
      ]
    },
    narrative: 'Executive summary: Strong performance across all metrics with Revenue leading at $2.45M'
  },
  {
    id: 3,
    type: 'advanced-chart',
    title: 'Revenue Performance Analysis',
    chartType: 'bar',
    content: {
      data: [
        { category: 'Q1', value: 1850000 },
        { category: 'Q2', value: 2100000 },
        { category: 'Q3', value: 2200000 },
        { category: 'Q4', value: 2450000 }
      ],
      insights: [
        'Peak performance: $2,450,000 in Q4',
        'Average Revenue: $2,150,000',
        'Performance range: 32.4% variation'
      ],
      aiAnalysis: {
        trend: 'Growing',
        volatility: 12.5,
        outliers: 0,
        prediction: 'Continued growth expected based on current trajectory'
      }
    },
    narrative: 'Revenue analysis reveals peak performance of $2,450,000 in Q4. Strong quarterly growth trend.'
  },
  {
    id: 4,
    type: 'strategic-insights',
    title: 'Strategic Insights & AI Recommendations',
    content: {
      insights: [
        'Revenue demonstrates positive performance trajectory with consistent quarter-over-quarter growth',
        'Data analysis across 4 quarters reveals 92% confidence in trend patterns',
        'Key variables show strong correlation with overall performance metrics'
      ],
      recommendations: [
        'Optimize revenue allocation strategies for maximum ROI in Q1 2025',
        'Implement data-driven monitoring for lead generation channels',
        'Establish predictive analytics framework for quarterly forecasting'
      ],
      opportunities: [
        'Scale successful Q4 strategies across all business units',
        'Leverage data insights for competitive advantage in market expansion',
        'Implement machine learning for predictive performance optimization'
      ],
      risks: [
        'Monitor market saturation effects on lead generation efficiency',
        'Data quality variations may impact forecast accuracy',
        'External economic factors not captured in current dataset'
      ],
      nextSteps: [
        'Implement recommended optimization strategies within 30 days',
        'Establish monthly performance review cadence',
        'Develop predictive analytics capabilities',
        'Create automated reporting dashboard'
      ],
      aiConfidence: 92
    },
    narrative: 'Strategic analysis reveals significant growth opportunities with high confidence recommendations.'
  }
]

export default function SlideEditor() {
  const router = useRouter()
  const params = useParams()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState(sampleSlides)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
    }, 1000)
  }

  const handleExport = () => {
    alert('Export functionality would download presentation as PowerPoint/PDF')
  }

  const handlePresent = () => {
    setIsPlaying(!isPlaying)
  }

  const nextSlide = () => {
    setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))
  }

  const prevSlide = () => {
    setCurrentSlide(Math.max(0, currentSlide - 1))
  }

  const renderSlideContent = (slide: any) => {
    switch (slide.type) {
      case 'title':
        return (
          <div className="text-center py-16">
            <h1 className="text-6xl font-bold mb-6 text-white">{slide.title}</h1>
            <h2 className="text-3xl text-blue-400 mb-4">{slide.content?.subtitle}</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">{slide.content?.description}</p>
          </div>
        )

      case 'executive-dashboard':
        return (
          <div className="py-8">
            <h2 className="text-4xl font-bold mb-8 text-center text-white">{slide.title}</h2>
            <div className="text-center mb-8 p-4 bg-blue-900/30 rounded-lg">
              <p className="text-xl text-blue-200">{slide.content.summary}</p>
              <p className="text-sm text-blue-300 mt-2">AI Confidence: {slide.content.confidence}%</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {slide.content.metrics.map((metric: any, index: number) => (
                <Card key={index} className={`p-6 text-center bg-gradient-to-br ${
                  metric.status === 'positive' ? 'from-green-900/50 to-blue-900/50' :
                  metric.status === 'negative' ? 'from-red-900/50 to-orange-900/50' :
                  'from-blue-900/50 to-purple-900/50'
                }`}>
                  <div className="text-3xl font-bold text-blue-400">{metric.value.toLocaleString()}</div>
                  <div className="text-lg text-gray-300 capitalize">{metric.metric}</div>
                  <div className={`text-sm mt-2 ${metric.change > 0 ? 'text-green-400' : metric.change < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                    {metric.change > 0 ? '↗' : metric.change < 0 ? '↘' : '→'} {Math.abs(metric.change).toFixed(1)}%
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )

      case 'advanced-chart':
        return (
          <div className="py-8">
            <h2 className="text-4xl font-bold mb-8 text-center text-white">{slide.title}</h2>
            {slide.content?.aiAnalysis && (
              <div className="mb-6 p-4 bg-purple-900/30 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-200 mb-2">AI Analysis</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>Trend: <span className="text-purple-300">{slide.content.aiAnalysis.trend}</span></div>
                  <div>Volatility: <span className="text-purple-300">{slide.content.aiAnalysis.volatility?.toFixed(1)}%</span></div>
                  <div>Outliers: <span className="text-purple-300">{slide.content.aiAnalysis.outliers}</span></div>
                </div>
                <p className="text-purple-200 mt-2">{slide.content.aiAnalysis.prediction}</p>
              </div>
            )}
            <div className="h-96 mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={slide.content?.data}>
                  <XAxis dataKey="category" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mb-6">
              <p className="text-lg text-gray-300">{slide.narrative}</p>
            </div>
            {slide.content?.insights && (
              <div className="grid md:grid-cols-3 gap-4">
                {slide.content.insights.map((insight: string, index: number) => (
                  <div key={index} className="p-3 bg-blue-900/20 rounded-lg">
                    <div className="text-sm text-blue-200">💡 {insight}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 'strategic-insights':
        return (
          <div className="py-8">
            <h2 className="text-4xl font-bold mb-8 text-center text-white">{slide.title}</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6">
                <h3 className="text-2xl font-semibold mb-4 text-blue-400">🔍 Key Insights</h3>
                <ul className="space-y-3">
                  {slide.content?.insights?.map((insight: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-300">{insight}</span>
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="p-6">
                <h3 className="text-2xl font-semibold mb-4 text-green-400">📈 Strategic Recommendations</h3>
                <ul className="space-y-3">
                  {slide.content?.recommendations?.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-300">{rec}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
            <Card className="p-6 mt-6">
              <h3 className="text-2xl font-semibold mb-4 text-purple-400">📋 Next Steps</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {slide.content?.nextSteps?.map((step: string, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-purple-900/20 rounded-lg">
                    <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="text-gray-300">{step}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <span className="text-sm text-purple-300">AI Confidence: {slide.content.aiConfidence}%</span>
              </div>
            </Card>
          </div>
        )

      default:
        return (
          <div className="py-16 text-center">
            <h2 className="text-4xl font-bold mb-4 text-white">{slide.title}</h2>
            <p className="text-xl text-gray-300">{slide.narrative}</p>
          </div>
        )
    }
  }

  const currentSlideData = slides[currentSlide]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <div className="border-l border-gray-600 pl-4">
              <h1 className="text-xl font-semibold">Demo Presentation</h1>
              <p className="text-sm text-gray-400">4 slides • Last saved 2 min ago</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="ghost" size="sm" onClick={handlePresent}>
              <Play className="w-4 h-4 mr-2" />
              {isPlaying ? 'Stop' : 'Present'}
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="secondary" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Slide Thumbnails */}
        <div className="w-64 border-r border-gray-700 bg-gray-900/30 p-4 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Slides ({slides.length})</h3>
          {slides.map((slide, index) => (
            <Card
              key={slide.id}
              className={`p-3 mb-3 cursor-pointer transition-all ${
                index === currentSlide ? 'border-blue-500 bg-blue-900/20' : 'hover:border-gray-500'
              }`}
              onClick={() => setCurrentSlide(index)}
            >
              <div className="text-sm font-medium mb-1">{index + 1}. {slide.title}</div>
              <div className="text-xs text-gray-400 flex items-center gap-1">
                {slide.type === 'advanced-chart' && <BarChart3 className="w-3 h-3" />}
                {slide.type === 'executive-dashboard' && <Eye className="w-3 h-3" />}
                {slide.type === 'strategic-insights' && <FileText className="w-3 h-3" />}
                {slide.type}
              </div>
            </Card>
          ))}
        </div>

        {/* Main Slide Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-8 overflow-y-auto">
            <Card className="h-full min-h-[600px] p-8 bg-gray-900/30">
              {currentSlideData && renderSlideContent(currentSlideData)}
            </Card>
          </div>

          {/* Navigation Controls */}
          <div className="p-4 border-t border-gray-700 bg-gray-900/50 flex justify-between items-center">
            <Button
              variant="secondary"
              onClick={prevSlide}
              disabled={currentSlide === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">
                {currentSlide + 1} of {slides.length}
              </span>
              
              {/* Quick slide navigation */}
              <div className="flex gap-1">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentSlide ? 'bg-blue-500' : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <Button
              variant="secondary"
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}