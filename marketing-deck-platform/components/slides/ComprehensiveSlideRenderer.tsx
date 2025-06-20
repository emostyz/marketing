'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
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
          <div>
            <ul className="space-y-2">
              {slide.content.bulletPoints.map((point: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-400 mr-3 mt-1">•</span>
                  <span className="text-gray-200">{point}</span>
                </li>
              ))}
            </ul>
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
    <div className="p-6 h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white mb-2">{slide.content?.title || slide.title}</h1>
        {slide.content?.subtitle && (
          <h2 className="text-lg text-blue-300 mb-2">{slide.content.subtitle}</h2>
        )}
        {slide.content?.description && (
          <p className="text-gray-300 text-sm">{slide.content.description}</p>
        )}
      </div>

      <div className="flex-1 flex">
        <div className="flex-1 pr-4">
          {slide.data && slide.data.length > 0 ? (
            <TremorAdvancedChart
              data={slide.data}
              title=""
              config={slide.tremorConfig || {
                type: slide.chartType || 'bar',
                colors: ['blue-500', 'green-500', 'purple-500', 'orange-500'],
                showLegend: true,
                showGradient: slide.chartType === 'area',
                showGrid: true,
                showTooltip: true,
                animation: true,
                height: 64
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
          ) : (
            <div className="h-64 bg-gray-800/50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400">Chart data loading...</p>
              </div>
            </div>
          )}
        </div>

        <div className="w-80 pl-4 border-l border-gray-700">
          <h3 className="text-white font-semibold mb-3">Key Insights</h3>
          <div className="space-y-3">
            {slide.content?.narrative && Array.isArray(slide.content.narrative) && (
              <div className="space-y-2">
                {slide.content.narrative.map((point: string, index: number) => (
                  <div key={index} className="bg-gray-800/50 p-3 rounded text-sm">
                    <p className="text-gray-200">{point}</p>
                  </div>
                ))}
              </div>
            )}
            
            {slide.content?.insights && slide.content.insights.length > 0 && (
              <div className="space-y-2">
                {slide.content.insights.map((insight: any, index: number) => (
                  <div key={index} className="bg-blue-900/20 p-3 rounded text-sm">
                    {typeof insight === 'string' ? (
                      <p className="text-blue-200">{insight}</p>
                    ) : (
                      <div>
                        <p className="text-blue-200 font-medium">{insight.point}</p>
                        <p className="text-gray-300 text-xs mt-1">{insight.description}</p>
                        {insight.impact && (
                          <span className={`inline-block mt-1 px-2 py-1 rounded text-xs ${
                            insight.impact === 'high' ? 'bg-red-800 text-red-200' :
                            insight.impact === 'medium' ? 'bg-yellow-800 text-yellow-200' :
                            'bg-green-800 text-green-200'
                          }`}>
                            {insight.impact.toUpperCase()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
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