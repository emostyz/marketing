'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Zap,
  TrendingUp,
  TrendingDown,
  Target,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Eye,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Sparkles,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  Info,
  Star,
  Award
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface DataInsight {
  id: string
  type: 'trend' | 'anomaly' | 'correlation' | 'opportunity' | 'risk' | 'forecast' | 'pattern'
  title: string
  description: string
  confidence: number
  impact: 'critical' | 'high' | 'medium' | 'low'
  novelty: number
  evidence: InsightEvidence[]
  recommendations: string[]
  chartSuggestion?: ChartSuggestion
  narrative: string
  businessImplication: string
}

interface InsightEvidence {
  metric: string
  value: number | string
  change?: number
  trend?: 'up' | 'down' | 'stable'
  benchmark?: number
}

interface ChartSuggestion {
  type: 'bar' | 'line' | 'area' | 'pie' | 'scatter' | 'heatmap'
  title: string
  reasoning: string
  config: any
}

interface AnalysisRequest {
  data: any[]
  context: string
  industry?: string
  objective?: string
  audience?: string
}

interface AIInsightEngineProps {
  data?: any[]
  context?: string
  onInsightGenerated?: (insights: DataInsight[]) => void
  onChartSuggested?: (suggestion: ChartSuggestion) => void
  className?: string
  autoAnalyze?: boolean
}

// Simulated AI analysis patterns and templates
const INSIGHT_PATTERNS = {
  trend: {
    icon: TrendingUp,
    color: 'blue',
    templates: [
      'Strong {direction} trend detected with {confidence}% confidence',
      '{metric} shows consistent {direction} movement over {period}',
      'Sustained {direction} trajectory suggests {implication}'
    ]
  },
  anomaly: {
    icon: AlertTriangle,
    color: 'yellow',
    templates: [
      'Unusual spike detected in {metric} during {period}',
      '{metric} deviates {percentage}% from expected pattern',
      'Anomalous behavior suggests {implication}'
    ]
  },
  opportunity: {
    icon: Lightbulb,
    color: 'green',
    templates: [
      'Untapped potential identified in {segment}',
      '{metric} indicates significant growth opportunity',
      'Market gap discovered with {value} potential'
    ]
  },
  risk: {
    icon: AlertTriangle,
    color: 'red',
    templates: [
      'Potential risk identified in {area}',
      'Declining {metric} suggests intervention needed',
      'Risk factors indicate {probability}% chance of {outcome}'
    ]
  },
  correlation: {
    icon: Target,
    color: 'purple',
    templates: [
      'Strong correlation found between {metric1} and {metric2}',
      '{strength} relationship detected with {confidence}% confidence',
      'Causal relationship suggests {implication}'
    ]
  }
}

export function AIInsightEngine({
  data = [],
  context = '',
  onInsightGenerated,
  onChartSuggested,
  className = '',
  autoAnalyze = false
}: AIInsightEngineProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [insights, setInsights] = useState<DataInsight[]>([])
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null)
  const [analysisStage, setAnalysisStage] = useState('')
  const [userFeedback, setUserFeedback] = useState<Record<string, 'positive' | 'negative'>>({})

  // Auto-analyze when data changes
  useEffect(() => {
    if (autoAnalyze && data.length > 0) {
      analyzeData()
    }
  }, [data, autoAnalyze])

  const analyzeData = useCallback(async () => {
    if (!data || data.length === 0) return

    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setInsights([])

    const stages = [
      'Preprocessing data patterns...',
      'Identifying statistical trends...',
      'Detecting anomalies and outliers...',
      'Analyzing correlations...',
      'Generating business insights...',
      'Creating recommendations...',
      'Finalizing analysis...'
    ]

    try {
      // Simulate progressive analysis
      for (let i = 0; i < stages.length; i++) {
        setAnalysisStage(stages[i])
        await new Promise(resolve => setTimeout(resolve, 800))
        setAnalysisProgress((i + 1) * (100 / stages.length))
      }

      // Generate insights based on data analysis
      const generatedInsights = generateInsights(data, context)
      setInsights(generatedInsights)
      onInsightGenerated?.(generatedInsights)

    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
      setAnalysisStage('')
    }
  }, [data, context, onInsightGenerated])

  const generateInsights = (dataset: any[], analysisContext: string): DataInsight[] => {
    if (!dataset || dataset.length === 0) return []

    const insights: DataInsight[] = []
    const numericColumns = getNumericColumns(dataset)

    // Trend Analysis
    numericColumns.forEach(column => {
      const values = dataset.map(row => row[column]).filter(v => typeof v === 'number')
      if (values.length > 2) {
        const trend = calculateTrend(values)
        if (Math.abs(trend.slope) > 0.1) {
          insights.push({
            id: `trend_${column}`,
            type: 'trend',
            title: `${trend.direction === 'up' ? 'Growing' : 'Declining'} ${column} Trend`,
            description: `${column} shows a ${trend.direction === 'up' ? 'positive' : 'negative'} trend with ${trend.strength} consistency`,
            confidence: Math.min(95, 70 + Math.abs(trend.correlation) * 25),
            impact: Math.abs(trend.slope) > 0.5 ? 'high' : 'medium',
            novelty: 75,
            evidence: [
              {
                metric: column,
                value: values[values.length - 1],
                change: trend.totalChange,
                trend: trend.direction as 'up' | 'down'
              }
            ],
            recommendations: [
              trend.direction === 'up' 
                ? `Continue current strategies driving ${column} growth`
                : `Investigate factors causing ${column} decline and implement corrective measures`
            ],
            chartSuggestion: {
              type: 'line',
              title: `${column} Trend Over Time`,
              reasoning: 'Line chart best shows the temporal trend pattern',
              config: { showTrendline: true }
            },
            narrative: `The data reveals a clear ${trend.direction}ward trend in ${column}, indicating ${trend.direction === 'up' ? 'positive momentum' : 'areas requiring attention'}.`,
            businessImplication: trend.direction === 'up' 
              ? `This positive trend suggests successful execution and market traction in ${column}.`
              : `The declining trend in ${column} may indicate market challenges or execution gaps requiring immediate attention.`
          })
        }
      }
    })

    // Outlier Detection
    numericColumns.forEach(column => {
      const values = dataset.map(row => row[column]).filter(v => typeof v === 'number')
      const outliers = detectOutliers(values)
      if (outliers.length > 0) {
        insights.push({
          id: `outlier_${column}`,
          type: 'anomaly',
          title: `Anomalies Detected in ${column}`,
          description: `${outliers.length} unusual data points found that deviate significantly from normal patterns`,
          confidence: 88,
          impact: outliers.length > values.length * 0.1 ? 'high' : 'medium',
          novelty: 82,
          evidence: [
            {
              metric: `${column} outliers`,
              value: outliers.length,
              benchmark: values.length
            }
          ],
          recommendations: [
            'Investigate root causes of anomalous data points',
            'Validate data collection and processing methods',
            'Consider if outliers represent genuine business events'
          ],
          chartSuggestion: {
            type: 'scatter',
            title: `${column} Distribution with Outliers`,
            reasoning: 'Scatter plot effectively highlights outlier data points',
            config: { highlightOutliers: true }
          },
          narrative: `Statistical analysis reveals several data points that fall outside normal patterns, warranting further investigation.`,
          businessImplication: 'These anomalies could represent either data quality issues or significant business events that require attention.'
        })
      }
    })

    // Correlation Analysis
    if (numericColumns.length >= 2) {
      for (let i = 0; i < numericColumns.length - 1; i++) {
        for (let j = i + 1; j < numericColumns.length; j++) {
          const col1 = numericColumns[i]
          const col2 = numericColumns[j]
          const correlation = calculateCorrelation(
            dataset.map(row => row[col1]).filter(v => typeof v === 'number'),
            dataset.map(row => row[col2]).filter(v => typeof v === 'number')
          )

          if (Math.abs(correlation) > 0.6) {
            insights.push({
              id: `correlation_${col1}_${col2}`,
              type: 'correlation',
              title: `Strong ${correlation > 0 ? 'Positive' : 'Negative'} Correlation Found`,
              description: `${col1} and ${col2} show ${Math.abs(correlation) > 0.8 ? 'very strong' : 'strong'} ${correlation > 0 ? 'positive' : 'negative'} correlation`,
              confidence: Math.min(95, 60 + Math.abs(correlation) * 35),
              impact: Math.abs(correlation) > 0.8 ? 'high' : 'medium',
              novelty: 70,
              evidence: [
                {
                  metric: 'Correlation coefficient',
                  value: correlation.toFixed(3)
                }
              ],
              recommendations: [
                correlation > 0 
                  ? `Leverage the positive relationship between ${col1} and ${col2} for strategic advantage`
                  : `Understand the inverse relationship to optimize resource allocation`
              ],
              chartSuggestion: {
                type: 'scatter',
                title: `${col1} vs ${col2} Correlation`,
                reasoning: 'Scatter plot best visualizes correlation between two variables',
                config: { showTrendline: true, correlation: correlation }
              },
              narrative: `Analysis reveals a significant relationship between ${col1} and ${col2}, providing insights into underlying business dynamics.`,
              businessImplication: correlation > 0 
                ? `This positive correlation suggests that improvements in ${col1} will likely drive gains in ${col2}.`
                : `The negative correlation indicates that optimization may require balancing these competing factors.`
            })
          }
        }
      }
    }

    // Opportunity Detection
    const avgValues = numericColumns.map(col => {
      const values = dataset.map(row => row[col]).filter(v => typeof v === 'number')
      return { column: col, average: values.reduce((sum, val) => sum + val, 0) / values.length }
    })

    avgValues.forEach(({ column, average }) => {
      const values = dataset.map(row => row[column]).filter(v => typeof v === 'number')
      const topQuartile = values.sort((a, b) => b - a).slice(0, Math.ceil(values.length * 0.25))
      const bottomQuartile = values.sort((a, b) => a - b).slice(0, Math.ceil(values.length * 0.25))
      
      if (topQuartile.length > 0 && bottomQuartile.length > 0) {
        const gap = (topQuartile[0] - bottomQuartile[0]) / average
        if (gap > 0.5) {
          insights.push({
            id: `opportunity_${column}`,
            type: 'opportunity',
            title: `Significant Improvement Potential in ${column}`,
            description: `Top performers exceed bottom quartile by ${(gap * 100).toFixed(0)}%, indicating substantial optimization opportunity`,
            confidence: 85,
            impact: gap > 1.0 ? 'critical' : 'high',
            novelty: 88,
            evidence: [
              {
                metric: 'Performance gap',
                value: `${(gap * 100).toFixed(0)}%`
              },
              {
                metric: 'Top quartile average',
                value: topQuartile.reduce((sum, val) => sum + val, 0) / topQuartile.length
              }
            ],
            recommendations: [
              'Analyze best practices from top performing segments',
              'Implement targeted improvement programs for underperforming areas',
              'Establish benchmarking and performance monitoring systems'
            ],
            chartSuggestion: {
              type: 'bar',
              title: `${column} Performance Distribution`,
              reasoning: 'Bar chart effectively shows performance gaps across segments',
              config: { highlightTopPerformers: true }
            },
            narrative: `Performance analysis reveals significant variation in ${column}, suggesting substantial improvement potential.`,
            businessImplication: `Closing this performance gap could deliver significant business value and competitive advantage.`
          })
        }
      }
    })

    return insights.slice(0, 6) // Return top 6 insights
  }

  const getNumericColumns = (data: any[]): string[] => {
    if (!data || data.length === 0) return []
    const sample = data[0]
    return Object.keys(sample).filter(key => 
      typeof sample[key] === 'number' || 
      (typeof sample[key] === 'string' && !isNaN(Number(sample[key])))
    )
  }

  const calculateTrend = (values: number[]) => {
    const n = values.length
    const xSum = (n * (n - 1)) / 2
    const ySum = values.reduce((sum, val) => sum + val, 0)
    const xySum = values.reduce((sum, val, idx) => sum + val * idx, 0)
    const xSquareSum = (n * (n - 1) * (2 * n - 1)) / 6

    const slope = (n * xySum - xSum * ySum) / (n * xSquareSum - xSum * xSum)
    const correlation = Math.abs(slope) / (Math.max(...values) - Math.min(...values)) * n

    return {
      slope,
      direction: slope > 0 ? 'up' : 'down',
      strength: Math.abs(correlation) > 0.7 ? 'strong' : Math.abs(correlation) > 0.4 ? 'moderate' : 'weak',
      correlation,
      totalChange: values[values.length - 1] - values[0]
    }
  }

  const detectOutliers = (values: number[]): number[] => {
    const sorted = [...values].sort((a, b) => a - b)
    const q1 = sorted[Math.floor(sorted.length * 0.25)]
    const q3 = sorted[Math.floor(sorted.length * 0.75)]
    const iqr = q3 - q1
    const lowerBound = q1 - 1.5 * iqr
    const upperBound = q3 + 1.5 * iqr

    return values.filter(val => val < lowerBound || val > upperBound)
  }

  const calculateCorrelation = (x: number[], y: number[]): number => {
    const n = Math.min(x.length, y.length)
    if (n === 0) return 0

    const xMean = x.slice(0, n).reduce((sum, val) => sum + val, 0) / n
    const yMean = y.slice(0, n).reduce((sum, val) => sum + val, 0) / n

    let numerator = 0
    let xSumSquares = 0
    let ySumSquares = 0

    for (let i = 0; i < n; i++) {
      const xDiff = x[i] - xMean
      const yDiff = y[i] - yMean
      numerator += xDiff * yDiff
      xSumSquares += xDiff * xDiff
      ySumSquares += yDiff * yDiff
    }

    const denominator = Math.sqrt(xSumSquares * ySumSquares)
    return denominator === 0 ? 0 : numerator / denominator
  }

  const handleInsightFeedback = (insightId: string, feedback: 'positive' | 'negative') => {
    setUserFeedback(prev => ({ ...prev, [insightId]: feedback }))
  }

  const getInsightIcon = (type: string) => {
    return INSIGHT_PATTERNS[type as keyof typeof INSIGHT_PATTERNS]?.icon || Brain
  }

  const getInsightColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 90) return 'Very High'
    if (confidence >= 75) return 'High'
    if (confidence >= 60) return 'Medium'
    return 'Low'
  }

  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Brain className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-500 text-center">Upload data to start generating AI-powered insights</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-6 h-6 text-blue-600" />
              <span>AI Insight Engine</span>
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Advanced analytics powered by machine learning
            </p>
          </div>
          <Button 
            onClick={analyzeData} 
            disabled={isAnalyzing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isAnalyzing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            {isAnalyzing ? 'Analyzing...' : 'Generate Insights'}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Analysis Progress */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-blue-900 font-medium">{analysisStage}</span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
              <p className="text-sm text-blue-700 mt-2">{analysisProgress.toFixed(0)}% complete</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Insights Results */}
        {insights.length > 0 && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-semibold text-gray-900">Analysis Summary</h4>
                <Badge variant="secondary">{insights.length} insights found</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(
                  insights.reduce((acc, insight) => {
                    acc[insight.impact] = (acc[insight.impact] || 0) + 1
                    return acc
                  }, {} as Record<string, number>)
                ).map(([impact, count]) => (
                  <div key={impact} className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <div className={`text-sm capitalize ${
                      impact === 'critical' ? 'text-red-600' :
                      impact === 'high' ? 'text-orange-600' :
                      impact === 'medium' ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {impact} impact
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights List */}
            <div className="space-y-4">
              {insights.map((insight, index) => {
                const Icon = getInsightIcon(insight.type)
                const isSelected = selectedInsight === insight.id
                
                return (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        isSelected ? 'ring-2 ring-blue-500 shadow-md' : ''
                      } ${getInsightColor(insight.impact)} border-l-4`}
                      onClick={() => setSelectedInsight(isSelected ? null : insight.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <Icon className="w-5 h-5" />
                              <h5 className="font-semibold text-gray-900">{insight.title}</h5>
                              <Badge variant="outline" className="text-xs">
                                {insight.type}
                              </Badge>
                            </div>
                            <p className="text-gray-700 mb-3">{insight.description}</p>
                            
                            <div className="flex items-center space-x-4 mb-3">
                              <div className="flex items-center space-x-1">
                                <Target className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600">
                                  {getConfidenceLabel(insight.confidence)} confidence ({insight.confidence}%)
                                </span>
                              </div>
                              <Badge 
                                variant={insight.impact === 'critical' ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                {insight.impact} impact
                              </Badge>
                            </div>

                            <AnimatePresence>
                              {isSelected && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="space-y-4 border-t border-gray-200 pt-4"
                                >
                                  <Tabs defaultValue="evidence" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3">
                                      <TabsTrigger value="evidence">Evidence</TabsTrigger>
                                      <TabsTrigger value="recommendations">Actions</TabsTrigger>
                                      <TabsTrigger value="chart">Visualization</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="evidence" className="space-y-3">
                                      <div className="space-y-2">
                                        {insight.evidence.map((evidence, idx) => (
                                          <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                            <span className="text-sm font-medium">{evidence.metric}</span>
                                            <div className="flex items-center space-x-2">
                                              <span className="text-sm">{evidence.value}</span>
                                              {evidence.trend && (
                                                <div className={`flex items-center ${
                                                  evidence.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                  {evidence.trend === 'up' ? 
                                                    <TrendingUp className="w-3 h-3" /> : 
                                                    <TrendingDown className="w-3 h-3" />
                                                  }
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                      <p className="text-sm text-gray-600 italic">{insight.narrative}</p>
                                    </TabsContent>

                                    <TabsContent value="recommendations" className="space-y-3">
                                      <div className="space-y-2">
                                        {insight.recommendations.map((rec, idx) => (
                                          <div key={idx} className="flex items-start space-x-2">
                                            <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">{rec}</span>
                                          </div>
                                        ))}
                                      </div>
                                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-sm text-blue-900 font-medium">Business Implication</p>
                                        <p className="text-sm text-blue-800 mt-1">{insight.businessImplication}</p>
                                      </div>
                                    </TabsContent>

                                    <TabsContent value="chart" className="space-y-3">
                                      {insight.chartSuggestion && (
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                          <div className="flex items-center space-x-2 mb-2">
                                            <BarChart3 className="w-4 h-4 text-gray-600" />
                                            <span className="font-medium">{insight.chartSuggestion.title}</span>
                                          </div>
                                          <p className="text-sm text-gray-600 mb-3">{insight.chartSuggestion.reasoning}</p>
                                          <Button 
                                            size="sm"
                                            onClick={() => onChartSuggested?.(insight.chartSuggestion!)}
                                            className="bg-blue-600 hover:bg-blue-700"
                                          >
                                            Create Chart
                                          </Button>
                                        </div>
                                      )}
                                    </TabsContent>
                                  </Tabs>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              size="sm"
                              variant={userFeedback[insight.id] === 'positive' ? 'default' : 'outline'}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleInsightFeedback(insight.id, 'positive')
                              }}
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant={userFeedback[insight.id] === 'negative' ? 'destructive' : 'outline'}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleInsightFeedback(insight.id, 'negative')
                              }}
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {insights.length === 0 && !isAnalyzing && (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Ready to Analyze</h4>
            <p className="text-gray-500 mb-4">Click "Generate Insights" to start AI-powered analysis of your data</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export type { DataInsight, ChartSuggestion, AnalysisRequest }