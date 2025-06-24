'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TremorAdvancedChart } from '@/components/charts/TremorAdvancedCharts'
import { Edit3, BarChart3, Type, Target } from 'lucide-react'

interface SlideData {
  id: string
  type: 'title' | 'content' | 'chart' | 'executive_summary' | 'insights' | 'recommendations' | 'action_items'
  title: string
  chartType?: 'area' | 'bar' | 'line' | 'donut' | 'scatter'
  content?: any
  data?: any[]
  categories?: string[]
  index?: string
  tremorConfig?: any
  textBlocks?: any[]
}

interface ComprehensiveSlideRendererProps {
  slide: SlideData
  onUpdate?: (slide: SlideData) => void
  editable?: boolean
  theme?: string
}

const themes = {
  dark: {
    background: 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950',
    text: 'text-white',
    accent: 'text-blue-400',
    card: 'bg-gray-900/50 border-gray-700'
  },
  blue: {
    background: 'bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950',
    text: 'text-white',
    accent: 'text-blue-300',
    card: 'bg-blue-900/50 border-blue-700'
  },
  purple: {
    background: 'bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950',
    text: 'text-white',
    accent: 'text-purple-300',
    card: 'bg-purple-900/50 border-purple-700'
  },
  green: {
    background: 'bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950',
    text: 'text-white',
    accent: 'text-emerald-300',
    card: 'bg-emerald-900/50 border-emerald-700'
  }
}

export function ComprehensiveSlideRenderer({ 
  slide, 
  onUpdate, 
  editable = false, 
  theme = 'dark' 
}: ComprehensiveSlideRendererProps) {
  const [isEditing, setIsEditing] = useState(false)
  const currentTheme = themes[theme as keyof typeof themes] || themes.dark

  const renderTitleSlide = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          {slide.content?.title || slide.title}
        </h1>
        <h2 className="text-xl text-blue-300 mb-4">
          {slide.content?.subtitle}
        </h2>
        {slide.content?.context && (
          <p className="text-sm text-gray-400 mb-2">{slide.content.context}</p>
        )}
        {slide.content?.description && (
          <p className="text-gray-300 max-w-2xl">{slide.content.description}</p>
        )}
      </div>
      {slide.content?.businessFocus && (
        <div className="bg-blue-900/30 p-4 rounded-lg max-w-2xl">
          <p className="text-sm text-blue-200">
            <strong>Key Focus:</strong> {slide.content.businessFocus}
          </p>
        </div>
      )}
    </div>
  )

  const renderContentSlide = () => (
    <div className="p-8 h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">{slide.content?.title || slide.title}</h1>
        {slide.content?.subtitle && (
          <h2 className="text-lg text-blue-300 mb-4">{slide.content.subtitle}</h2>
        )}
      </div>

      <div className="space-y-6">
        {slide.content?.narrative && (
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <p className="text-gray-200 leading-relaxed">{slide.content.narrative}</p>
          </div>
        )}

        {slide.content?.body && (
          <div>
            <p className="text-gray-300 mb-4">{slide.content.body}</p>
          </div>
        )}

        {slide.content?.bulletPoints && slide.content.bulletPoints.length > 0 && (
          <div className="space-y-3">
            {slide.content.bulletPoints.map((point: string, index: number) => (
              <div key={index} className="group">
                <div className="bg-gradient-to-r from-slate-700/30 to-slate-800/30 p-4 rounded-lg border border-slate-600/20 hover:border-blue-500/40 transition-all duration-200">
                  <div className="flex items-start">
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mr-4 mt-0.5 group-hover:from-blue-500 group-hover:to-blue-600 transition-all shadow-lg">
                      <span className="text-white text-sm font-bold">{index + 1}</span>
                    </div>
                    <p className="text-gray-200 leading-relaxed flex-1">{point}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {slide.content?.textBlocks && slide.content.textBlocks.length > 0 && (
          <div className="space-y-3">
            {slide.content.textBlocks.map((block: any, index: number) => (
              <div key={index} className="flex items-start">
                <span className="text-blue-400 mr-3 mt-1">•</span>
                <div>
                  <span className="text-white font-medium">
                    {block.text}
                  </span>
                  {block.impact && (
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      block.impact === 'high' ? 'bg-red-900/50 text-red-200' :
                      block.impact === 'medium' ? 'bg-yellow-900/50 text-yellow-200' :
                      'bg-green-900/50 text-green-200'
                    }`}>
                      {block.impact.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {slide.content?.recommendations && slide.content.recommendations.length > 0 && (
          <div className="bg-blue-900/20 p-4 rounded-lg">
            <h3 className="text-white font-semibold mb-3">Strategic Recommendations</h3>
            <div className="space-y-2">
              {slide.content.recommendations.map((rec: any, index: number) => (
                <div key={index} className="flex items-start">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">
                    {typeof rec === 'object' ? rec.priority : index + 1}
                  </span>
                  <div>
                    <p className="text-gray-200">
                      {typeof rec === 'string' ? rec : rec.action || rec.title}
                    </p>
                    {typeof rec === 'object' && rec.timeline && (
                      <span className="text-xs text-gray-400">Timeline: {rec.timeline}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {slide.content?.immediateActions && slide.content.immediateActions.length > 0 && (
          <div className="bg-green-900/20 p-4 rounded-lg">
            <h3 className="text-white font-semibold mb-3">Immediate Actions (90 Days)</h3>
            <ul className="space-y-2">
              {slide.content.immediateActions.map((action: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-400 mr-3 mt-1">✓</span>
                  <span className="text-gray-200">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )

  const renderChartSlide = () => (
    <div className="p-8 h-full flex flex-col">
      {/* Enhanced Header with Strategic Context */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-3">{slide.content?.title || slide.title}</h1>
            {slide.content?.hiddenInsight && (
              <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 p-3 rounded-lg mb-3">
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-amber-300 text-sm font-semibold">HIDDEN INSIGHT</span>
                </div>
                <p className="text-amber-100 text-sm leading-relaxed">{slide.content.hiddenInsight}</p>
              </div>
            )}
            {slide.content?.subtitle && (
              <h2 className="text-lg text-blue-300 mb-2">{slide.content.subtitle}</h2>
            )}
            {slide.content?.strategicImplication && (
              <div className="bg-blue-900/30 border border-blue-600/30 p-3 rounded-lg">
                <p className="text-blue-200 text-sm">
                  <span className="font-semibold">Strategic Impact:</span> {slide.content.strategicImplication}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Chart + Insights Layout */}
      <div className="flex-1 flex gap-8">
        {/* Chart Section - Enhanced */}
        <div className="flex-1">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-xl border border-gray-700/50 h-full">
            {slide.data && slide.data.length > 0 ? (
              <div className="h-full flex flex-col">
                <div className="mb-4">
                  <h3 className="text-white font-semibold text-lg mb-2">
                    {slide.content?.chartTitle || "Data Visualization"}
                  </h3>
                  {slide.content?.hiddenPattern && (
                    <div className="bg-purple-900/30 p-2 rounded text-xs">
                      <span className="text-purple-300 font-medium">Pattern Detected: </span>
                      <span className="text-purple-200">{slide.content.hiddenPattern}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <TremorAdvancedChart
                    data={slide.data}
                    title=""
                    config={slide.tremorConfig || {
                      type: slide.chartType || 'area',
                      colors: ['blue-500', 'emerald-500', 'purple-500', 'amber-500', 'rose-500'],
                      showLegend: true,
                      showGradient: slide.chartType === 'area',
                      showGrid: true,
                      showTooltip: true,
                      animation: true,
                      height: 80,
                      curveType: 'smooth',
                      strokeWidth: 3
                    }}
                    categories={slide.categories}
                    index={slide.index}
                    editable={editable}
                    onConfigChange={(newConfig) => {
                      if (onUpdate) {
                        onUpdate({ ...slide, tremorConfig: newConfig })
                      }
                    }}
                  />
                </div>
                {slide.content?.dataStory && (
                  <div className="mt-3 p-3 bg-gray-700/30 rounded text-xs">
                    <span className="text-gray-400">Chart Story: </span>
                    <span className="text-gray-300">{slide.content.dataStory}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full bg-gray-800/50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 font-medium">Chart data loading...</p>
                  <p className="text-gray-500 text-sm">Strategic visualization will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Strategic Insights Panel */}
        <div className="w-96">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 rounded-xl border border-slate-700/50 h-full">
            <div className="flex items-center mb-4">
              <Target className="w-5 h-5 text-blue-400 mr-2" />
              <h3 className="text-white font-bold text-lg">Strategic Insights</h3>
            </div>
            
            <div className="space-y-4 max-h-full overflow-y-auto">
              {/* Strategic Bullet Points */}
              {slide.content?.bulletPoints && slide.content.bulletPoints.length > 0 && (
                <div className="space-y-3">
                  {slide.content.bulletPoints.map((point: string, index: number) => (
                    <div key={index} className="group">
                      <div className="bg-gradient-to-r from-slate-700/50 to-slate-800/50 p-4 rounded-lg border border-slate-600/30 hover:border-blue-500/50 transition-all duration-200">
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-0.5 group-hover:bg-blue-500 transition-colors">
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          </div>
                          <p className="text-gray-200 leading-relaxed text-sm flex-1">{point}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Hidden Drivers Section */}
              {slide.content?.hiddenDrivers && (
                <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 p-4 rounded-lg border border-amber-600/30">
                  <div className="flex items-center mb-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mr-2"></div>
                    <span className="text-amber-300 font-semibold text-sm">HIDDEN DRIVERS</span>
                  </div>
                  <p className="text-amber-100 text-sm leading-relaxed">{slide.content.hiddenDrivers}</p>
                </div>
              )}

              {/* Strategic Value */}
              {slide.content?.strategicValue && (
                <div className="bg-gradient-to-r from-emerald-900/20 to-green-900/20 p-4 rounded-lg border border-emerald-600/30">
                  <div className="flex items-center mb-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
                    <span className="text-emerald-300 font-semibold text-sm">STRATEGIC VALUE</span>
                  </div>
                  <p className="text-emerald-100 text-sm leading-relaxed">{slide.content.strategicValue}</p>
                </div>
              )}

              {/* Legacy insights support */}
              {slide.content?.insights && slide.content.insights.length > 0 && (
                <div className="space-y-3">
                  {slide.content.insights.map((insight: any, index: number) => (
                    <div key={index} className="bg-blue-900/20 p-4 rounded-lg border border-blue-600/30">
                      {typeof insight === 'string' ? (
                        <p className="text-blue-200 text-sm">{insight}</p>
                      ) : (
                        <div>
                          <p className="text-blue-200 font-medium text-sm">{insight.point}</p>
                          <p className="text-gray-300 text-xs mt-1">{insight.description}</p>
                          {insight.impact && (
                            <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                              insight.impact === 'high' ? 'bg-red-800 text-red-200' :
                              insight.impact === 'medium' ? 'bg-yellow-800 text-yellow-200' :
                              'bg-green-800 text-green-200'
                            }`}>
                              {insight.impact.toUpperCase()} IMPACT
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Confidence Score */}
              {slide.content?.confidence && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Analysis Confidence</span>
                    <span className="text-blue-300 font-medium">{slide.content.confidence}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${slide.content.confidence || 85}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSlideContent = () => {
    switch (slide.type) {
      case 'title':
        return renderTitleSlide()
      case 'chart':
        return renderChartSlide()
      case 'content':
      case 'executive_summary':
      case 'insights':
      case 'recommendations':
      case 'action_items':
      default:
        return renderContentSlide()
    }
  }

  return (
    <div className={`relative w-full h-[600px] rounded-lg ${currentTheme.background} ${currentTheme.card} overflow-hidden`}>
      {/* Slide Type Indicator */}
      <div className="absolute top-4 left-4 z-10">
        <div className="flex items-center gap-2 bg-gray-900/70 px-3 py-1 rounded-full">
          {slide.type === 'chart' && <BarChart3 className="w-4 h-4 text-blue-400" />}
          {slide.type === 'title' && <Type className="w-4 h-4 text-green-400" />}
          {(slide.type === 'insights' || slide.type === 'recommendations') && <Target className="w-4 h-4 text-purple-400" />}
          <span className="text-xs text-gray-300 capitalize">{slide.type.replace('_', ' ')}</span>
        </div>
      </div>

      {/* Edit Button */}
      {editable && (
        <div className="absolute top-4 right-4 z-10">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(!isEditing)}
            className="bg-gray-900/70 hover:bg-gray-800"
          >
            <Edit3 className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Slide Content */}
      <div className="w-full h-full">
        {renderSlideContent()}
      </div>
    </div>
  )
}