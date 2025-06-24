'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings, Palette, BarChart3, Brain, Shuffle, MessageCircle,
  TrendingUp, PieChart, LineChart, Edit3, Wand2, RefreshCw,
  ChevronRight, ChevronDown, Eye, EyeOff, Download, Share2,
  Copy, Trash2, Plus, Minus, RotateCw, Zap, Sparkles,
  Target, Lightbulb, CheckCircle, AlertCircle, Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNotifications } from '@/components/ui/NotificationSystem'

interface PostCreationEditorProps {
  presentation: any
  onUpdatePresentation: (updates: any) => void
  onClose: () => void
}

interface AIFeedback {
  id: string
  type: 'suggestion' | 'improvement' | 'warning' | 'insight'
  title: string
  description: string
  slideIndex?: number
  elementId?: string
  action?: () => void
  severity: 'low' | 'medium' | 'high'
}

interface ChartEditingData {
  elementId: string
  slideIndex: number
  chartType: 'bar' | 'line' | 'pie' | 'area' | 'scatter'
  data: any[]
  config: any
}

export function PostCreationEditor({
  presentation,
  onUpdatePresentation,
  onClose
}: PostCreationEditorProps) {
  const notifications = useNotifications()
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedChart, setSelectedChart] = useState<ChartEditingData | null>(null)
  const [aiFeedback, setAIFeedback] = useState<AIFeedback[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>(['charts'])

  // Get all charts from presentation
  const getAllCharts = useCallback(() => {
    const charts: ChartEditingData[] = []
    presentation?.slides?.forEach((slide: any, slideIndex: number) => {
      slide.content?.forEach((element: any) => {
        if (element.type === 'chart') {
          charts.push({
            elementId: element.id,
            slideIndex,
            chartType: element.content?.type || 'bar',
            data: element.content?.data || [],
            config: element.content?.config || {}
          })
        }
      })
    })
    return charts
  }, [presentation])

  // AI Analysis and Feedback Generation
  const generateAIFeedback = useCallback(async () => {
    setIsAnalyzing(true)
    
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const feedback: AIFeedback[] = [
        {
          id: '1',
          type: 'suggestion',
          title: 'Improve Chart Colors',
          description: 'Consider using a consistent color palette across all charts for better visual cohesion.',
          severity: 'medium',
          action: () => applyConsistentColors()
        },
        {
          id: '2',
          type: 'improvement',
          title: 'Reorder Slides for Better Flow',
          description: 'Moving the conclusion slide after the data analysis would create a more logical narrative.',
          severity: 'high',
          action: () => reorderSlides()
        },
        {
          id: '3',
          type: 'insight',
          title: 'Data Trend Detected',
          description: 'Your Q4 data shows a 23% uptick that could be highlighted with annotations.',
          slideIndex: 2,
          severity: 'high',
          action: () => highlightTrend(2)
        },
        {
          id: '4',
          type: 'warning',
          title: 'Chart Readability',
          description: 'Slide 3 chart has too many data points. Consider aggregating or using pagination.',
          slideIndex: 3,
          severity: 'medium',
          action: () => simplifyChart(3)
        }
      ]
      
      setAIFeedback(feedback)
      notifications.showSuccess('AI Analysis Complete', `Found ${feedback.length} insights and suggestions`)
    } catch (error) {
      notifications.showError('AI Analysis Failed', 'Please try again later')
    } finally {
      setIsAnalyzing(false)
    }
  }, [notifications])

  // Theme Management
  const availableThemes = [
    {
      id: 'modern-blue',
      name: 'Modern Blue',
      preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      colors: {
        primary: '#667eea',
        secondary: '#764ba2',
        accent: '#f093fb',
        background: '#ffffff',
        text: '#333333'
      }
    },
    {
      id: 'corporate-gray',
      name: 'Corporate Gray',
      preview: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
      colors: {
        primary: '#2c3e50',
        secondary: '#34495e',
        accent: '#3498db',
        background: '#ffffff',
        text: '#2c3e50'
      }
    },
    {
      id: 'vibrant-sunset',
      name: 'Vibrant Sunset',
      preview: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
      colors: {
        primary: '#ff6b6b',
        secondary: '#feca57',
        accent: '#48dbfb',
        background: '#ffffff',
        text: '#2f3542'
      }
    },
    {
      id: 'professional-green',
      name: 'Professional Green',
      preview: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      colors: {
        primary: '#11998e',
        secondary: '#38ef7d',
        accent: '#ff9ff3',
        background: '#ffffff',
        text: '#2f3542'
      }
    }
  ]

  const applyTheme = useCallback((theme: any) => {
    const updatedSlides = presentation.slides.map((slide: any) => ({
      ...slide,
      background: {
        ...slide.background,
        color: theme.colors.background,
        gradient: theme.preview
      },
      content: slide.content.map((element: any) => ({
        ...element,
        style: {
          ...element.style,
          color: element.type === 'text' ? theme.colors.text : element.style.color
        }
      }))
    }))

    onUpdatePresentation({
      ...presentation,
      theme: theme,
      slides: updatedSlides
    })

    notifications.showSuccess('Theme Applied', `${theme.name} theme has been applied to your presentation`)
  }, [presentation, onUpdatePresentation, notifications])

  // Chart Enhancement Functions
  const applyConsistentColors = useCallback(() => {
    const colorPalette = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']
    
    const updatedSlides = presentation.slides.map((slide: any) => ({
      ...slide,
      content: slide.content.map((element: any) => {
        if (element.type === 'chart') {
          return {
            ...element,
            content: {
              ...element.content,
              colors: colorPalette
            }
          }
        }
        return element
      })
    }))

    onUpdatePresentation({
      ...presentation,
      slides: updatedSlides
    })

    notifications.showSuccess('Colors Applied', 'Consistent color palette applied to all charts')
  }, [presentation, onUpdatePresentation, notifications])

  const reorderSlides = useCallback(() => {
    // Example: Move conclusion slide to the end
    const slides = [...presentation.slides]
    const conclusionIndex = slides.findIndex(slide => 
      slide.title.toLowerCase().includes('conclusion') || 
      slide.title.toLowerCase().includes('summary')
    )
    
    if (conclusionIndex !== -1 && conclusionIndex !== slides.length - 1) {
      const [conclusionSlide] = slides.splice(conclusionIndex, 1)
      slides.push(conclusionSlide)
      
      onUpdatePresentation({
        ...presentation,
        slides
      })
      
      notifications.showSuccess('Slides Reordered', 'Improved narrative flow by moving conclusion to the end')
    }
  }, [presentation, onUpdatePresentation, notifications])

  const highlightTrend = useCallback((slideIndex: number) => {
    // Add annotation to highlight trends
    notifications.showInfo('Trend Highlighted', `Added trend annotation to slide ${slideIndex + 1}`)
  }, [notifications])

  const simplifyChart = useCallback((slideIndex: number) => {
    // Simplify complex charts
    notifications.showInfo('Chart Simplified', `Optimized chart readability on slide ${slideIndex + 1}`)
  }, [notifications])

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }, [])

  const renderFeedbackItem = (feedback: AIFeedback) => {
    const icons = {
      suggestion: Lightbulb,
      improvement: TrendingUp,
      warning: AlertCircle,
      insight: Target
    }
    
    const colors = {
      suggestion: 'text-blue-600 bg-blue-50 border-blue-200',
      improvement: 'text-green-600 bg-green-50 border-green-200',
      warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      insight: 'text-purple-600 bg-purple-50 border-purple-200'
    }

    const Icon = icons[feedback.type]

    return (
      <motion.div
        key={feedback.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`border rounded-lg p-4 ${colors[feedback.type]}`}
      >
        <div className="flex items-start space-x-3">
          <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm mb-1">{feedback.title}</h4>
            <p className="text-sm opacity-80 mb-3">{feedback.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {feedback.slideIndex !== undefined && (
                  <Badge variant="outline" className="text-xs">
                    Slide {feedback.slideIndex + 1}
                  </Badge>
                )}
                <Badge 
                  variant={feedback.severity === 'high' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {feedback.severity} priority
                </Badge>
              </div>
              
              {feedback.action && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={feedback.action}
                  className="text-xs"
                >
                  Apply Fix
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-full max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Post-Creation Editor</h2>
              <p className="text-blue-100">
                Enhance your presentation with AI-powered insights and advanced editing tools
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-blue-600"
                onClick={generateAIFeedback}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <Brain className="w-4 h-4" />
                )}
                <span className="ml-2">AI Analysis</span>
              </Button>
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                ✕
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 border-r border-gray-200 bg-gray-50">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-4 mx-4 mt-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="charts">Charts</TabsTrigger>
                <TabsTrigger value="themes">Themes</TabsTrigger>
                <TabsTrigger value="ai">AI Insights</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="overview" className="h-full">
                  <ScrollArea className="h-full px-4">
                    <div className="space-y-4 py-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Presentation Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Total Slides</span>
                            <span className="font-medium">{presentation?.slides?.length || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Charts</span>
                            <span className="font-medium">{getAllCharts().length}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Theme</span>
                            <span className="font-medium">{presentation?.theme?.name || 'Default'}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <Shuffle className="w-4 h-4 mr-2" />
                            Reorder Slides
                          </Button>
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <Palette className="w-4 h-4 mr-2" />
                            Apply Theme
                          </Button>
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Enhance Charts
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="charts" className="h-full">
                  <ScrollArea className="h-full px-4">
                    <div className="space-y-4 py-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Chart Editor</h3>
                        <Badge variant="secondary">{getAllCharts().length} charts</Badge>
                      </div>

                      {getAllCharts().map((chart, index) => (
                        <Card key={chart.elementId} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <BarChart3 className="w-4 h-4 text-blue-600" />
                                <span className="font-medium text-sm">Chart {index + 1}</span>
                                <Badge variant="outline" className="text-xs">
                                  Slide {chart.slideIndex + 1}
                                </Badge>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedChart(chart)}
                              >
                                <Edit3 className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                            </div>
                            <div className="text-xs text-gray-500 mb-2">
                              Type: {chart.chartType} • Data points: {chart.data.length}
                            </div>
                            <div className="flex space-x-1">
                              <Button size="sm" variant="ghost" className="h-6 text-xs">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Trend
                              </Button>
                              <Button size="sm" variant="ghost" className="h-6 text-xs">
                                <Palette className="w-3 h-3 mr-1" />
                                Colors
                              </Button>
                              <Button size="sm" variant="ghost" className="h-6 text-xs">
                                <Settings className="w-3 h-3 mr-1" />
                                Config
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {getAllCharts().length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p className="text-sm">No charts found in this presentation</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="themes" className="h-full">
                  <ScrollArea className="h-full px-4">
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-1 gap-3">
                        {availableThemes.map((theme) => (
                          <motion.div
                            key={theme.id}
                            whileHover={{ scale: 1.02 }}
                            className="border rounded-lg p-3 cursor-pointer hover:shadow-md transition-all"
                            onClick={() => applyTheme(theme)}
                          >
                            <div className="flex items-center space-x-3">
                              <div 
                                className="w-12 h-8 rounded"
                                style={{ background: theme.preview }}
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{theme.name}</h4>
                                <div className="flex space-x-1 mt-1">
                                  {Object.values(theme.colors).slice(0, 4).map((color, index) => (
                                    <div
                                      key={index}
                                      className="w-3 h-3 rounded-full border border-gray-200"
                                      style={{ backgroundColor: color }}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="ai" className="h-full">
                  <ScrollArea className="h-full px-4">
                    <div className="space-y-4 py-4">
                      {aiFeedback.length > 0 ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">AI Insights</h3>
                            <Badge variant="secondary">{aiFeedback.length} items</Badge>
                          </div>
                          {aiFeedback.map(renderFeedbackItem)}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p className="text-sm mb-3">No AI analysis yet</p>
                          <Button 
                            size="sm" 
                            onClick={generateAIFeedback}
                            disabled={isAnalyzing}
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Run Analysis
                          </Button>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold mb-2">
                {activeTab === 'overview' && 'Presentation Overview'}
                {activeTab === 'charts' && 'Chart Management'}
                {activeTab === 'themes' && 'Theme Customization'}
                {activeTab === 'ai' && 'AI-Powered Insights'}
              </h3>
              <p className="text-gray-600 text-sm">
                {activeTab === 'overview' && 'Review and manage your presentation structure'}
                {activeTab === 'charts' && 'Edit and enhance your data visualizations'}
                {activeTab === 'themes' && 'Apply beautiful themes to your presentation'}
                {activeTab === 'ai' && 'Get intelligent suggestions to improve your presentation'}
              </p>
            </div>

            <div className="flex-1 p-6 overflow-auto">
              {/* Content based on active tab */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Slide Structure</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {presentation?.slides?.map((slide: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm">{index + 1}. {slide.title || `Slide ${index + 1}`}</span>
                            <div className="flex space-x-1">
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                <Edit3 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Content Completeness</span>
                          <span>85%</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Visual Consistency</span>
                          <span>92%</span>
                        </div>
                        <Progress value={92} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Data Quality</span>
                          <span>78%</span>
                        </div>
                        <Progress value={78} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'charts' && selectedChart && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Editing Chart {getAllCharts().findIndex(c => c.elementId === selectedChart.elementId) + 1}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm">
                        Advanced chart editing interface would go here with data table editing,
                        chart type switching, color customization, and AI-powered enhancements.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}