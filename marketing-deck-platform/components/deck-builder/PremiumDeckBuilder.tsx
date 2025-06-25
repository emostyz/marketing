'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Sparkles, 
  ArrowRight, 
  ChevronLeft, 
  Settings,
  Palette,
  BarChart3,
  PieChart,
  TrendingUp,
  Target,
  Lightbulb,
  Zap,
  CheckCircle,
  Upload,
  FileText,
  Download,
  Share2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PremiumChartSystem } from '@/components/charts/PremiumChartSystem'
import { ProfessionalTemplateLibrary } from '@/components/templates/ProfessionalTemplateLibrary'
import { AIInsightEngine } from '@/components/ai/AIInsightEngine'
import { useAuth } from '@/lib/auth/auth-context'

interface PremiumDeckBuilderProps {
  initialTemplate?: string
  className?: string
}

interface DeckData {
  title: string
  slides: SlideData[]
  theme: DeckTheme
  metadata: DeckMetadata
}

interface SlideData {
  id: string
  type: 'title' | 'content' | 'chart' | 'insight' | 'conclusion'
  title: string
  content: any
  layout: SlideLayout
  animations: Animation[]
  notes: string
}

interface DeckTheme {
  name: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  fontSizes: {
    h1: number
    h2: number
    h3: number
    body: number
    caption: number
  }
  spacing: {
    slide: number
    section: number
    element: number
  }
  style: 'corporate' | 'consulting' | 'startup' | 'academic' | 'creative'
}

interface SlideLayout {
  template: string
  structure: 'single' | 'two-column' | 'three-column' | 'hero' | 'comparison'
  elements: LayoutElement[]
}

interface LayoutElement {
  id: string
  type: 'text' | 'chart' | 'image' | 'bullet' | 'callout' | 'metric'
  position: { x: number; y: number; width: number; height: number }
  content: any
  style: ElementStyle
}

interface ElementStyle {
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
  borderRadius?: number
  shadow?: boolean
  animation?: string
}

interface Animation {
  type: 'fadeIn' | 'zoomIn' | 'slideInLeft' | 'slideInRight' | 'slideInUp' | 'typewriter'
  duration: number
  delay: number
  easing: string
}

interface DeckMetadata {
  createdAt: Date
  lastModified: Date
  author: string
  version: string
  tags: string[]
  industry: string
  targetAudience: string
  presentation_length: number
}

// Professional color schemes inspired by top consulting firms
const PREMIUM_THEMES: DeckTheme[] = [
  {
    name: 'McKinsey Navy',
    primaryColor: '#003366',
    secondaryColor: '#0066CC', 
    accentColor: '#FFD700',
    fontFamily: 'Inter',
    fontSizes: { h1: 32, h2: 24, h3: 18, body: 14, caption: 12 },
    spacing: { slide: 40, section: 24, element: 16 },
    style: 'consulting'
  },
  {
    name: 'BCG Teal',
    primaryColor: '#005A5B',
    secondaryColor: '#00A3A4',
    accentColor: '#FF6B35',
    fontFamily: 'Inter',
    fontSizes: { h1: 30, h2: 22, h3: 16, body: 14, caption: 12 },
    spacing: { slide: 36, section: 20, element: 12 },
    style: 'consulting'
  },
  {
    name: 'Bain Red',
    primaryColor: '#CC092F',
    secondaryColor: '#E51937',
    accentColor: '#F8D7DA',
    fontFamily: 'Inter',
    fontSizes: { h1: 28, h2: 20, h3: 16, body: 13, caption: 11 },
    spacing: { slide: 32, section: 18, element: 10 },
    style: 'consulting'
  },
  {
    name: 'Corporate Blue',
    primaryColor: '#1E3A8A',
    secondaryColor: '#3B82F6',
    accentColor: '#DBEAFE',
    fontFamily: 'Inter',
    fontSizes: { h1: 36, h2: 26, h3: 20, body: 16, caption: 14 },
    spacing: { slide: 48, section: 28, element: 20 },
    style: 'corporate'
  },
  {
    name: 'Silicon Valley',
    primaryColor: '#111827',
    secondaryColor: '#6B7280',
    accentColor: '#10B981',
    fontFamily: 'SF Pro Display',
    fontSizes: { h1: 40, h2: 28, h3: 20, body: 16, caption: 14 },
    spacing: { slide: 44, section: 24, element: 16 },
    style: 'startup'
  }
]

// Professional slide templates
const SLIDE_TEMPLATES = [
  {
    id: 'mckinsey-title',
    name: 'Executive Title',
    description: 'Clean title slide with subtitle and author',
    type: 'title',
    layout: {
      template: 'hero',
      structure: 'single' as const,
      elements: [
        {
          id: 'title',
          type: 'text' as const,
          position: { x: 10, y: 30, width: 80, height: 20 },
          content: { text: '', fontSize: 36, fontWeight: 'bold', textAlign: 'center' },
          style: {}
        },
        {
          id: 'subtitle', 
          type: 'text' as const,
          position: { x: 10, y: 55, width: 80, height: 10 },
          content: { text: '', fontSize: 18, textAlign: 'center' },
          style: {}
        }
      ]
    }
  },
  {
    id: 'insight-chart',
    name: 'Key Insight with Chart',
    description: 'Main insight with supporting visualization',
    type: 'insight',
    layout: {
      template: 'two-column',
      structure: 'two-column' as const,
      elements: [
        {
          id: 'insight-text',
          type: 'text' as const,
          position: { x: 5, y: 15, width: 45, height: 60 },
          content: { text: '', fontSize: 16 },
          style: { backgroundColor: '#F8F9FA', borderRadius: 8, shadow: true }
        },
        {
          id: 'chart',
          type: 'chart' as const,
          position: { x: 55, y: 15, width: 40, height: 60 },
          content: { chartType: 'bar', data: [] },
          style: {}
        }
      ]
    }
  },
  {
    id: 'three-metrics',
    name: 'Key Metrics Dashboard',
    description: 'Three key performance indicators',
    type: 'content',
    layout: {
      template: 'three-column',
      structure: 'three-column' as const,
      elements: [
        {
          id: 'metric1',
          type: 'metric' as const,
          position: { x: 5, y: 25, width: 25, height: 40 },
          content: { value: '', label: '', change: '+0%' },
          style: { backgroundColor: '#EBF8FF', borderRadius: 12 }
        },
        {
          id: 'metric2',
          type: 'metric' as const,
          position: { x: 37.5, y: 25, width: 25, height: 40 },
          content: { value: '', label: '', change: '+0%' },
          style: { backgroundColor: '#F0FFF4', borderRadius: 12 }
        },
        {
          id: 'metric3',
          type: 'metric' as const,
          position: { x: 70, y: 25, width: 25, height: 40 },
          content: { value: '', label: '', change: '+0%' },
          style: { backgroundColor: '#FFFBEB', borderRadius: 12 }
        }
      ]
    }
  },
  {
    id: 'pyramid-insight',
    name: 'Strategic Pyramid',
    description: 'Hierarchical insights with supporting data',
    type: 'insight',
    layout: {
      template: 'pyramid',
      structure: 'single' as const,
      elements: [
        {
          id: 'top-insight',
          type: 'callout' as const,
          position: { x: 30, y: 15, width: 40, height: 15 },
          content: { text: 'Key Strategic Insight', importance: 'high' },
          style: { backgroundColor: '#1E40AF', borderRadius: 8 }
        },
        {
          id: 'supporting-data',
          type: 'bullet' as const,
          position: { x: 15, y: 40, width: 70, height: 40 },
          content: { items: [] },
          style: {}
        }
      ]
    }
  }
]

// Add a helper to map string to allowed Animation type
const allowedAnimationTypes = [
  'fadeIn', 'zoomIn', 'slideInLeft', 'slideInRight', 'slideInUp', 'typewriter'
] as const;

type AllowedAnimationType = typeof allowedAnimationTypes[number];

function toAllowedAnimationType(type: string): AllowedAnimationType {
  if (allowedAnimationTypes.includes(type as AllowedAnimationType)) {
    return type as AllowedAnimationType;
  }
  return 'fadeIn'; // fallback
}

// When accessing SLIDE_TEMPLATES[n].layout.elements[n].animation, add a type guard:
const getAnimationType = (element: any, fallback: AllowedAnimationType): AllowedAnimationType => {
  if (element && typeof element.animation === 'string' && allowedAnimationTypes.includes(element.animation as AllowedAnimationType)) {
    return element.animation as AllowedAnimationType;
  }
  return fallback;
};

export function PremiumDeckBuilder({ 
  initialTemplate, 
  className = '' 
}: PremiumDeckBuilderProps) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [deckData, setDeckData] = useState<DeckData>({
    title: '',
    slides: [],
    theme: PREMIUM_THEMES[0],
    metadata: {
      createdAt: new Date(),
      lastModified: new Date(),
      author: user?.name || 'Unknown',
      version: '1.0',
      tags: [],
      industry: '',
      targetAudience: '',
      presentation_length: 10
    }
  })

  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [uploadedData, setUploadedData] = useState<any>(null)
  const [aiInsights, setAiInsights] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)

  const steps = [
    { id: 1, name: 'Template', icon: Palette, description: 'Choose professional template' },
    { id: 2, name: 'Data', icon: Upload, description: 'Upload your data' },
    { id: 3, name: 'AI Analysis', icon: Brain, description: 'AI generates insights' },
    { id: 4, name: 'Review', icon: CheckCircle, description: 'Review and customize' },
    { id: 5, name: 'Generate', icon: Sparkles, description: 'Create presentation' }
  ]

  const handleTemplateSelect = useCallback((templateId: string) => {
    setSelectedTemplate(templateId)
    const theme = PREMIUM_THEMES.find(t => t.name.toLowerCase().includes(templateId.toLowerCase())) || PREMIUM_THEMES[0]
    setDeckData(prev => ({ ...prev, theme }))
  }, [])

  const handleDataUpload = useCallback((data: any) => {
    setUploadedData(data)
    console.log('Data uploaded:', data)
  }, [])

  const generateAIInsights = useCallback(async () => {
    if (!uploadedData) return

    setIsGenerating(true)
    setGenerationProgress(0)

    try {
      // Simulate progressive AI analysis
      const steps = [
        'Analyzing data patterns...',
        'Identifying key insights...',
        'Generating narrative structure...',
        'Creating visualizations...',
        'Optimizing layout...'
      ]

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        setGenerationProgress((i + 1) * 20)
      }

      // Generate high-quality insights
      const insights = [
        {
          id: '1',
          type: 'trend',
          title: 'Revenue Growth Acceleration',
          description: 'Q4 shows 23% increase vs previous quarter, indicating strong market adoption',
          confidence: 92,
          impact: 'high',
          chartType: 'line',
          data: uploadedData?.revenue || []
        },
        {
          id: '2', 
          type: 'opportunity',
          title: 'Untapped Market Segment',
          description: 'Enterprise customers show 40% higher LTV but represent only 15% of current base',
          confidence: 88,
          impact: 'high',
          chartType: 'bar',
          data: uploadedData?.segments || []
        },
        {
          id: '3',
          type: 'risk',
          title: 'Customer Acquisition Cost Rising',
          description: 'CAC increased 18% while conversion rates remain flat, suggesting saturation',
          confidence: 85,
          impact: 'medium',
          chartType: 'area',
          data: uploadedData?.metrics || []
        }
      ]

      setAiInsights(insights)
      setGenerationProgress(100)

    } catch (error) {
      console.error('Error generating insights:', error)
    } finally {
      setIsGenerating(false)
    }
  }, [uploadedData])

  const generatePresentationSlides = useCallback(() => {
    if (!aiInsights.length) return

    const slides: SlideData[] = [
      // Title slide
      {
        id: 'title-slide',
        type: 'title',
        title: deckData.title || 'Strategic Analysis',
        content: {
          subtitle: `${deckData.metadata.industry} Market Analysis`,
          author: deckData.metadata.author,
          date: new Date().toLocaleDateString()
        },
        layout: SLIDE_TEMPLATES[0].layout,
        animations: [
          { type: getAnimationType(SLIDE_TEMPLATES[0].layout.elements[0], 'fadeIn'), duration: 0.8, delay: 0, easing: 'ease-out' }
        ],
        notes: 'Opening slide with key presentation overview'
      },
      // Insight slides
      ...aiInsights.map((insight, index) => ({
        id: `insight-${insight.id}`,
        type: 'insight' as const,
        title: insight.title,
        content: {
          insight: insight.description,
          chart: {
            type: getAnimationType(SLIDE_TEMPLATES[1].layout.elements[1], 'fadeIn'),
            data: insight.data,
            title: insight.title,
            config: {
              colors: [deckData.theme.primaryColor, deckData.theme.secondaryColor, deckData.theme.accentColor],
              theme: deckData.theme.style
            }
          },
          recommendations: [
            'Prioritize implementation based on impact',
            'Monitor key metrics weekly',
            'Establish success criteria'
          ]
        },
        layout: SLIDE_TEMPLATES[1].layout,
        animations: [
          { type: getAnimationType(SLIDE_TEMPLATES[1].layout.elements[0], 'slideInLeft'), duration: 0.6, delay: 0.2, easing: 'ease-out' },
          { type: getAnimationType(SLIDE_TEMPLATES[1].layout.elements[1], 'slideInRight'), duration: 0.6, delay: 0.4, easing: 'ease-out' }
        ],
        notes: `Key insight: ${insight.description}`
      })),
      // Conclusion slide
      {
        id: 'conclusion',
        type: 'conclusion',
        title: 'Next Steps & Recommendations',
        content: {
          summary: 'Strategic priorities for next quarter',
          actions: [
            'Focus on enterprise customer acquisition',
            'Optimize marketing channel efficiency', 
            'Monitor market expansion opportunities'
          ],
          timeline: '90-day implementation plan'
        },
        layout: SLIDE_TEMPLATES[3].layout,
        animations: [
          { type: getAnimationType(SLIDE_TEMPLATES[3].layout.elements[0], 'fadeIn'), duration: 1.0, delay: 0, easing: 'ease-out' }
        ],
        notes: 'Actionable next steps with clear timeline'
      }
    ]

    setDeckData(prev => ({ ...prev, slides }))
  }, [aiInsights, deckData.title, deckData.theme, deckData.metadata])

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Choose Your Template</h2>
              <p className="text-gray-400">Select a professional template that matches your presentation style</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PREMIUM_THEMES.map((theme) => (
                <motion.div
                  key={theme.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTemplateSelect(theme.name)}
                  className={`cursor-pointer p-6 rounded-xl border-2 transition-all ${
                    selectedTemplate === theme.name
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div 
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: theme.primaryColor }}
                    />
                    <div 
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: theme.secondaryColor }}
                    />
                    <div 
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{theme.name}</h3>
                  <Badge variant="outline" className="mb-3">
                    {theme.style}
                  </Badge>
                  <p className="text-sm text-gray-400">
                    Professional {theme.style} template with clean typography and consistent spacing
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Upload Your Data</h2>
              <p className="text-gray-400">Upload CSV, Excel, or JSON files to generate insights</p>
            </div>
            <Card className="border-gray-700 bg-gray-800/50">
              <CardContent className="p-8">
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Drop files here or click to upload</h3>
                  <p className="text-gray-400 mb-4">Supports CSV, XLSX, JSON (max 10MB)</p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      // Mock data upload
                      const mockData = {
                        revenue: [
                          { month: 'Jan', value: 4000 },
                          { month: 'Feb', value: 3000 },
                          { month: 'Mar', value: 5000 },
                          { month: 'Apr', value: 4500 },
                          { month: 'May', value: 6000 },
                          { month: 'Jun', value: 5500 }
                        ],
                        segments: [
                          { segment: 'Enterprise', customers: 150, revenue: 800000 },
                          { segment: 'SMB', customers: 450, revenue: 320000 },
                          { segment: 'Startup', customers: 280, revenue: 180000 }
                        ]
                      }
                      handleDataUpload(mockData)
                    }}
                  >
                    Use Sample Data
                  </Button>
                </div>
                {uploadedData && (
                  <div className="mt-6 p-4 bg-green-900/20 border border-green-700 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-green-300">Data uploaded successfully</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">AI Analysis</h2>
              <p className="text-gray-400">Our AI is analyzing your data to find strategic insights</p>
            </div>
            
            {!isGenerating && aiInsights.length === 0 && (
              <Card className="border-gray-700 bg-gray-800/50">
                <CardContent className="p-8 text-center">
                  <Brain className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-4">Ready to Generate Insights</h3>
                  <Button 
                    onClick={generateAIInsights}
                    disabled={!uploadedData}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate AI Insights
                  </Button>
                </CardContent>
              </Card>
            )}

            {isGenerating && (
              <Card className="border-gray-700 bg-gray-800/50">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-white">Analyzing data patterns...</span>
                  </div>
                  <Progress value={generationProgress} className="mb-2" />
                  <p className="text-sm text-gray-400">{generationProgress}% complete</p>
                </CardContent>
              </Card>
            )}

            {aiInsights.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Generated Insights</h3>
                {aiInsights.map((insight) => (
                  <Card key={insight.id} className="border-gray-700 bg-gray-800/50">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-white mb-2">{insight.title}</h4>
                          <p className="text-gray-300 mb-3">{insight.description}</p>
                          <div className="flex items-center space-x-4">
                            <Badge variant={insight.impact === 'high' ? 'destructive' : 'secondary'}>
                              {insight.impact} impact
                            </Badge>
                            <span className="text-sm text-gray-400">{insight.confidence}% confidence</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Review & Customize</h2>
              <p className="text-gray-400">Review generated slides and make adjustments</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-gray-700 bg-gray-800/50">
                <CardHeader>
                  <CardTitle className="text-white">Presentation Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400">Title</label>
                      <input
                        type="text"
                        value={deckData.title}
                        onChange={(e) => setDeckData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter presentation title"
                        className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Industry</label>
                      <input
                        type="text"
                        value={deckData.metadata.industry}
                        onChange={(e) => setDeckData(prev => ({ 
                          ...prev, 
                          metadata: { ...prev.metadata, industry: e.target.value }
                        }))}
                        placeholder="e.g., Technology, Healthcare"
                        className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Target Audience</label>
                      <input
                        type="text"
                        value={deckData.metadata.targetAudience}
                        onChange={(e) => setDeckData(prev => ({ 
                          ...prev, 
                          metadata: { ...prev.metadata, targetAudience: e.target.value }
                        }))}
                        placeholder="e.g., Executive Leadership"
                        className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-700 bg-gray-800/50">
                <CardHeader>
                  <CardTitle className="text-white">Slide Structure</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['Title Slide', ...aiInsights.map(i => i.title), 'Next Steps'].map((title, index) => (
                      <div key={index} className="flex items-center space-x-3 p-2 bg-gray-700/50 rounded">
                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">{index + 1}</span>
                        <span className="text-white text-sm">{title}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Generate Presentation</h2>
              <p className="text-gray-400">Your professional presentation is ready</p>
            </div>
            
            <Card className="border-gray-700 bg-gray-800/50">
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-4">Presentation Generated Successfully!</h3>
                <p className="text-gray-300 mb-6">
                  Your {aiInsights.length + 2} slide presentation is ready with professional formatting and insights.
                </p>
                <div className="flex justify-center space-x-4">
                  <Button 
                    onClick={generatePresentationSlides}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Open Editor
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button variant="outline">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 ${className}`}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-600 text-gray-400'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-white">{step.name}</p>
                  <p className="text-xs text-gray-400">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-px bg-gray-700 mx-8" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-800">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <Button
            onClick={() => {
              if (currentStep === 5) {
                generatePresentationSlides()
              } else {
                setCurrentStep(Math.min(5, currentStep + 1))
              }
            }}
            disabled={
              (currentStep === 1 && !selectedTemplate) ||
              (currentStep === 2 && !uploadedData) ||
              (currentStep === 3 && !aiInsights.length)
            }
            className="bg-blue-600 hover:bg-blue-700"
          >
            {currentStep === 5 ? 'Complete' : 'Next'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}