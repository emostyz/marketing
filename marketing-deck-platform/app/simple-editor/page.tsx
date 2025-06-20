'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ChevronLeft, ChevronRight, Download, Play, BarChart3, LineChart, PieChart } from 'lucide-react'
import { BarChart, Bar, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default function SimpleEditor() {
  const [presentation, setPresentation] = useState<any>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('mockPresentation')
    if (stored) {
      setPresentation(JSON.parse(stored))
    }
  }, [])

  if (!presentation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No presentation found</h1>
          <p className="text-gray-400 mb-6">Please create a presentation first</p>
          <Button onClick={() => window.location.href = '/dashboard'}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const slides = presentation.slides || []
  const currentSlideData = slides[currentSlide]

  const renderSlideContent = (slide: any) => {
    switch (slide.type) {
      case 'title':
        return (
          <div className="text-center py-16">
            <h1 className="text-6xl font-bold mb-6">{slide.title}</h1>
            <h2 className="text-3xl text-blue-400 mb-4">{slide.content?.subtitle}</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">{slide.content?.description}</p>
          </div>
        )
      
      case 'metrics':
      case 'executive-dashboard':
        return (
          <div className="py-8">
            <h2 className="text-4xl font-bold mb-8 text-center">{slide.title}</h2>
            {slide.content?.summary && (
              <div className="text-center mb-8 p-4 bg-blue-900/30 rounded-lg">
                <p className="text-xl text-blue-200">{slide.content.summary}</p>
                <p className="text-sm text-blue-300 mt-2">Confidence: {slide.content.confidence}%</p>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {slide.content?.metrics?.map((metric: any, index: number) => (
                <Card key={index} className={`p-6 text-center bg-gradient-to-br ${
                  metric.status === 'positive' ? 'from-green-900/50 to-blue-900/50' :
                  metric.status === 'negative' ? 'from-red-900/50 to-orange-900/50' :
                  'from-blue-900/50 to-purple-900/50'
                }`}>
                  <div className="text-3xl font-bold text-blue-400">{metric.value.toLocaleString()}</div>
                  <div className="text-lg text-gray-300 capitalize">{metric.metric}</div>
                  {metric.change !== undefined && (
                    <div className={`text-sm mt-2 ${metric.change > 0 ? 'text-green-400' : metric.change < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                      {metric.change > 0 ? '↗' : metric.change < 0 ? '↘' : '→'} {Math.abs(metric.change).toFixed(1)}%
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )
      
      case 'chart':
      case 'advanced-chart':
        return (
          <div className="py-8">
            <h2 className="text-4xl font-bold mb-8 text-center">{slide.title}</h2>
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
              {slide.chartType === 'bar' && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={slide.content?.data}>
                    <XAxis dataKey="category" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              )}
              {slide.chartType === 'line' && (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={slide.content?.data}>
                    <XAxis dataKey="category" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              )}
              {slide.chartType === 'pie' && (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={slide.content?.data}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      dataKey="value"
                      label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    >
                      {slide.content?.data?.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="text-center">
              <p className="text-lg text-gray-300">{slide.narrative}</p>
            </div>
            {slide.content?.insights && (
              <div className="mt-6 grid md:grid-cols-3 gap-4">
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
            <h2 className="text-4xl font-bold mb-8 text-center">{slide.title}</h2>
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
              <Card className="p-6">
                <h3 className="text-2xl font-semibold mb-4 text-yellow-400">🚀 Opportunities</h3>
                <ul className="space-y-3">
                  {slide.content?.opportunities?.map((opp: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-300">{opp}</span>
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="p-6">
                <h3 className="text-2xl font-semibold mb-4 text-red-400">⚠️ Risk Factors</h3>
                <ul className="space-y-3">
                  {slide.content?.risks?.map((risk: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-300">{risk}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
            {slide.content?.nextSteps && (
              <Card className="p-6 mt-6">
                <h3 className="text-2xl font-semibold mb-4 text-purple-400">📋 Next Steps</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {slide.content.nextSteps.map((step: string, index: number) => (
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
            )}
          </div>
        )
      
      case 'appendix':
        return (
          <div className="py-8">
            <h2 className="text-4xl font-bold mb-8 text-center">{slide.title}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-blue-400">Methodology</h3>
                <p className="text-gray-300">{slide.content?.methodology}</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-green-400">Data Quality</h3>
                <div className="text-2xl font-bold text-green-300">{slide.content?.dataQuality}%</div>
                <p className="text-gray-300 text-sm mt-2">Data completeness score</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-yellow-400">Limitations</h3>
                <p className="text-gray-300">{slide.content?.limitations}</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-purple-400">Technical Notes</h3>
                <p className="text-gray-300">{slide.content?.technicalNotes}</p>
              </Card>
            </div>
          </div>
        )
      
      case 'summary':
        return (
          <div className="py-8">
            <h2 className="text-4xl font-bold mb-8 text-center">{slide.title}</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6">
                <h3 className="text-2xl font-semibold mb-4 text-blue-400">Key Insights</h3>
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
                <h3 className="text-2xl font-semibold mb-4 text-green-400">Recommendations</h3>
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
          </div>
        )
      
      default:
        return (
          <div className="py-16 text-center">
            <h2 className="text-4xl font-bold mb-4">{slide.title}</h2>
            <p className="text-xl text-gray-300">{slide.narrative}</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Header */}
      <header className="p-6 border-b border-white/10 flex justify-between items-center">
        <h1 className="text-2xl font-bold">{presentation.title}</h1>
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={() => setIsPlaying(!isPlaying)}>
            <Play className="w-4 h-4 mr-2" />
            {isPlaying ? 'Stop' : 'Present'}
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Slide Thumbnails */}
        <div className="w-64 border-r border-white/10 p-4 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Slides ({slides.length})</h3>
          {slides.map((slide: any, index: number) => (
            <Card
              key={slide.id}
              className={`p-3 mb-3 cursor-pointer transition-colors ${
                index === currentSlide ? 'border-blue-500 bg-blue-900/20' : 'hover:border-gray-600'
              }`}
              onClick={() => setCurrentSlide(index)}
            >
              <div className="text-sm font-medium">{index + 1}. {slide.title}</div>
              <div className="text-xs text-gray-400 mt-1">
                {slide.type === 'chart' && <BarChart3 className="w-3 h-3 inline mr-1" />}
                {slide.type}
              </div>
            </Card>
          ))}
        </div>

        {/* Main Slide Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-8 overflow-y-auto">
            <Card className="h-full min-h-[600px] p-8">
              {currentSlideData && renderSlideContent(currentSlideData)}
            </Card>
          </div>

          {/* Navigation */}
          <div className="p-4 border-t border-white/10 flex justify-between items-center">
            <Button
              variant="secondary"
              onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
              disabled={currentSlide === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <span className="text-sm text-gray-400">
              {currentSlide + 1} of {slides.length}
            </span>
            
            <Button
              variant="secondary"
              onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
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