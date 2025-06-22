'use client'

import React, { useState, useCallback, useMemo } from 'react'
import {
  AreaChart,
  BarChart,
  LineChart,
  DonutChart,
  ScatterChart,
  Card
} from '@tremor/react'
import { Button } from '@/components/ui/Button'
import { 
  Settings, 
  Palette, 
  Eye, 
  EyeOff, 
  Filter, 
  TrendingUp, 
  TrendingDown,
  Target,
  AlertTriangle,
  Lightbulb,
  Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChartQA } from '@/lib/hooks/useOpenAIQA'

interface ChartConfig {
  data: any[]
  dimensions: string[]
  metrics: string[]
  filters: any[]
  annotations: any[]
}

interface EnhancedInsight {
  id: string
  type: 'trend' | 'anomaly' | 'correlation' | 'causation' | 'opportunity' | 'risk' | 'novel'
  title: string
  description: string
  confidence: number
  novelty: number
  impact: 'high' | 'medium' | 'low'
  dataEvidence: any[]
  drivers: string[]
  headwinds: string[]
  tailwinds: string[]
  why: string
  recommendations: string[]
  visualizationType: 'line' | 'bar' | 'area' | 'scatter' | 'heatmap' | 'composite' | 'donut'
  chartConfig: ChartConfig
}

interface EnhancedWorldClassChartProps {
  insight: EnhancedInsight
  onUpdate?: (updatedInsight: EnhancedInsight) => void
  showInsights?: boolean
  interactive?: boolean
}

const TREMOR_COLORS = [
  'blue', 'emerald', 'violet', 'amber', 'rose', 'cyan', 'indigo', 'teal', 'lime', 'orange',
  'red', 'purple', 'green', 'yellow', 'pink', 'gray', 'slate', 'zinc', 'neutral', 'stone'
]

const IMPACT_COLORS = {
  high: 'text-red-400',
  medium: 'text-yellow-400',
  low: 'text-green-400'
}

const TYPE_ICONS = {
  trend: TrendingUp,
  anomaly: AlertTriangle,
  correlation: Target,
  causation: Zap,
  opportunity: Lightbulb,
  risk: AlertTriangle,
  novel: Lightbulb
}

export function EnhancedWorldClassChart({
  insight,
  onUpdate,
  showInsights = true,
  interactive = true
}: EnhancedWorldClassChartProps) {
  const [showSettings, setShowSettings] = useState(false)
  const [visibleMetrics, setVisibleMetrics] = useState<Record<string, boolean>>(
    insight.chartConfig.metrics.reduce((acc, metric) => ({ ...acc, [metric]: true }), {})
  )
  const [currentColors, setCurrentColors] = useState<string[]>(TREMOR_COLORS.slice(0, 3))
  const [showAnnotations, setShowAnnotations] = useState(true)
  const [activeFilters, setActiveFilters] = useState<any[]>(insight.chartConfig.filters)

  // OpenAI Quality Assurance
  const chartQA = useChartQA(
    insight.chartConfig.data,
    insight.visualizationType,
    insight.chartConfig,
    'Business presentation chart'
  )

  const TypeIcon = TYPE_ICONS[insight.type] || Target

  // Filter data based on visible metrics and active filters
  const filteredData = useMemo(() => {
    let data = insight.chartConfig.data

    // Apply filters
    if (activeFilters.length > 0) {
      data = data.filter(item => {
        return activeFilters.every(filter => {
          if (filter.operator === 'equals') {
            return item[filter.field] === filter.value
          } else if (filter.operator === 'greater_than') {
            return item[filter.field] > filter.value
          } else if (filter.operator === 'less_than') {
            return item[filter.field] < filter.value
          }
          return true
        })
      })
    }

    return data
  }, [insight.chartConfig.data, activeFilters])

  const visibleMetricsList = insight.chartConfig.metrics.filter(metric => visibleMetrics[metric])

  const renderChart = () => {
    const commonProps = {
      data: filteredData,
      index: insight.chartConfig.dimensions[0] || 'name',
      categories: visibleMetricsList,
      colors: currentColors,
      height: 72,
      showAnimation: true,
      showTooltip: true,
      showLegend: visibleMetricsList.length > 1,
      showGridLines: true,
    }

    switch (insight.visualizationType) {
      case 'area':
        return <AreaChart {...commonProps} />
      case 'line':
        return <LineChart {...commonProps} />
      case 'scatter':
        return (
          <ScatterChart
            data={filteredData}
            category={insight.chartConfig.dimensions[0]}
            x={visibleMetricsList[0]}
            y={visibleMetricsList[1]}
            size={visibleMetricsList[2]}
            colors={currentColors}
            showAnimation={true}
            showTooltip={true}
            showLegend={true}
          />
        )
      case 'donut':
        return (
          <DonutChart
            data={filteredData}
            category={visibleMetricsList[0]}
            index={insight.chartConfig.dimensions[0]}
            colors={currentColors}
            showAnimation={true}
            showTooltip={true}
            showLabel={true}
          />
        )
      default:
        return <BarChart {...commonProps} />
    }
  }

  const renderInsightBadge = () => (
    <div className="flex items-center gap-2 mb-3">
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
        insight.type === 'novel' ? 'bg-purple-900/30 text-purple-300 border border-purple-500/30' :
        insight.type === 'opportunity' ? 'bg-green-900/30 text-green-300 border border-green-500/30' :
        insight.type === 'risk' ? 'bg-red-900/30 text-red-300 border border-red-500/30' :
        'bg-blue-900/30 text-blue-300 border border-blue-500/30'
      }`}>
        <TypeIcon className="w-3 h-3" />
        {insight.type.toUpperCase()}
      </div>
      
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
        IMPACT_COLORS[insight.impact]
      } bg-gray-800/50 border border-gray-600`}>
        {insight.impact.toUpperCase()} IMPACT
      </div>
      
      <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-800/50 border border-gray-600">
        <Target className="w-3 h-3" />
        {insight.confidence}% CONF
      </div>
      
      {insight.novelty > 70 && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-900/30 text-amber-300 border border-amber-500/30">
          <Lightbulb className="w-3 h-3" />
          NOVEL
        </div>
      )}
    </div>
  )

  const renderDriversAnalysis = () => (
    <div className="mt-4 space-y-3">
      {/* Drivers */}
      {insight.drivers.length > 0 && (
        <div className="p-3 bg-green-900/20 rounded-lg border border-green-500/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-300">Key Drivers</span>
          </div>
          <div className="space-y-1">
            {insight.drivers.map((driver, idx) => (
              <div key={idx} className="text-xs text-green-200">• {driver}</div>
            ))}
          </div>
        </div>
      )}

      {/* Headwinds */}
      {insight.headwinds.length > 0 && (
        <div className="p-3 bg-red-900/20 rounded-lg border border-red-500/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-red-300">Headwinds</span>
          </div>
          <div className="space-y-1">
            {insight.headwinds.map((headwind, idx) => (
              <div key={idx} className="text-xs text-red-200">• {headwind}</div>
            ))}
          </div>
        </div>
      )}

      {/* Tailwinds */}
      {insight.tailwinds.length > 0 && (
        <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-300">Tailwinds</span>
          </div>
          <div className="space-y-1">
            {insight.tailwinds.map((tailwind, idx) => (
              <div key={idx} className="text-xs text-blue-200">• {tailwind}</div>
            ))}
          </div>
        </div>
      )}

      {/* Why */}
      <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-600">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">Why This Matters</span>
        </div>
        <p className="text-xs text-gray-200">{insight.why}</p>
      </div>

      {/* Recommendations */}
      {insight.recommendations.length > 0 && (
        <div className="p-3 bg-amber-900/20 rounded-lg border border-amber-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-300">Recommendations</span>
          </div>
          <div className="space-y-1">
            {insight.recommendations.map((rec, idx) => (
              <div key={idx} className="text-xs text-amber-200">• {rec}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderAnnotations = () => {
    if (!showAnnotations || !insight.chartConfig.annotations.length) return null

    return (
      <div className="mt-3 p-3 bg-gray-800/30 rounded-lg border border-gray-600">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">Key Annotations</span>
        </div>
        <div className="space-y-1">
          {insight.chartConfig.annotations.map((annotation, idx) => (
            <div key={idx} className="text-xs text-gray-200">
              <span className="font-medium">{annotation.point}:</span> {annotation.note}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Card className="p-6 bg-gray-800/50 border-gray-700">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-white mb-1 font-semibold">{insight.title}</h3>
          <p className="text-gray-400 text-sm">{insight.description}</p>
          {renderInsightBadge()}
        </div>
        
        {interactive && (
          <div className="flex gap-2">
            {/* OpenAI Quality Assurance Button */}
            <Button
              size="sm"
              variant={chartQA.result?.verdict === 'KILL' ? 'destructive' : chartQA.result?.verdict === 'KEEP' ? 'default' : 'outline'}
              onClick={chartQA.runQA}
              disabled={chartQA.isLoading}
              title={chartQA.result ? `OpenAI QA: ${chartQA.result.verdict} (${chartQA.result.scores.overall}/10)` : 'Run OpenAI Quality Assurance'}
            >
              {chartQA.isLoading ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Zap className={`w-4 h-4 ${chartQA.result?.verdict === 'KILL' ? 'text-red-400' : chartQA.result?.verdict === 'KEEP' ? 'text-green-400' : ''}`} />
              )}
            </Button>
            
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="mb-4">
        {renderChart()}
      </div>

      {/* OpenAI QA Results */}
      {chartQA.result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 p-4 rounded-lg border ${
            chartQA.result.verdict === 'KILL' 
              ? 'bg-red-900/20 border-red-500/50' 
              : 'bg-green-900/20 border-green-500/50'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className={`w-4 h-4 ${chartQA.result.verdict === 'KILL' ? 'text-red-400' : 'text-green-400'}`} />
            <span className={`font-semibold ${chartQA.result.verdict === 'KILL' ? 'text-red-400' : 'text-green-400'}`}>
              OpenAI QA: {chartQA.result.verdict}
            </span>
            <span className="text-gray-400 text-sm">
              Overall: {chartQA.result.scores.overall}/10
            </span>
          </div>
          
          <p className="text-gray-300 text-sm mb-3">{chartQA.result.reasoning}</p>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Helpful:</span>
                <span className="text-white">{chartQA.result.scores.helpful}/10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Useful:</span>
                <span className="text-white">{chartQA.result.scores.useful}/10</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Insightful:</span>
                <span className="text-white">{chartQA.result.scores.insightful}/10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Beautiful:</span>
                <span className="text-white">{chartQA.result.scores.beautiful}/10</span>
              </div>
            </div>
          </div>

          {chartQA.result.improvements.length > 0 && (
            <div className="mt-3">
              <span className="text-gray-400 text-xs block mb-1">Improvements:</span>
              <ul className="text-xs text-gray-300 space-y-1">
                {chartQA.result.improvements.map((improvement, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="text-yellow-400 text-[10px] mt-0.5">•</span>
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {chartQA.result.killReasons && chartQA.result.killReasons.length > 0 && (
            <div className="mt-3">
              <span className="text-red-400 text-xs block mb-1">Kill Reasons:</span>
              <ul className="text-xs text-gray-300 space-y-1">
                {chartQA.result.killReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="text-red-400 text-[10px] mt-0.5">•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}

      {chartQA.error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-yellow-900/20 border border-yellow-500/50 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 text-sm">QA Error: {chartQA.error}</span>
          </div>
        </motion.div>
      )}

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && interactive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-gray-900/50 rounded-lg border border-gray-600"
          >
            <div className="space-y-4">
              {/* Metric Visibility */}
              <div>
                <span className="text-gray-300 text-sm mb-2 block">Visible Metrics</span>
                <div className="space-y-2">
                  {insight.chartConfig.metrics.map((metric) => (
                    <div key={metric} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={visibleMetrics[metric]}
                        onChange={() => setVisibleMetrics(prev => ({
                          ...prev,
                          [metric]: !prev[metric]
                        }))}
                        className="mr-2"
                      />
                      <span className="text-gray-300 text-sm">{metric}</span>
                      {visibleMetrics[metric] ? (
                        <Eye className="w-4 h-4 text-green-400 ml-2" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-500 ml-2" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Color Customization */}
              <div>
                <span className="text-gray-300 text-sm mb-2 block">Colors</span>
                <div className="grid grid-cols-3 gap-2">
                  {currentColors.map((color, idx) => (
                    <select
                      key={idx}
                      value={color}
                      onChange={(e) => {
                        const newColors = [...currentColors]
                        newColors[idx] = e.target.value
                        setCurrentColors(newColors)
                      }}
                      className="bg-gray-700 text-white px-2 py-1 rounded border border-gray-600 text-xs"
                    >
                      {TREMOR_COLORS.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  ))}
                </div>
              </div>

              {/* Annotations Toggle */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={showAnnotations}
                  onChange={() => setShowAnnotations(!showAnnotations)}
                  className="mr-2"
                />
                <span className="text-gray-300 text-sm">Show Annotations</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Insights Panel */}
      {showInsights && (
        <div className="space-y-4">
          {renderDriversAnalysis()}
          {renderAnnotations()}
        </div>
      )}
    </Card>
  )
}