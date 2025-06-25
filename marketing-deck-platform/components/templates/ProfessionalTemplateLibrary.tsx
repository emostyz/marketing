'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Layout,
  Grid,
  Layers,
  Target,
  TrendingUp,
  BarChart3,
  PieChart,
  FileText,
  Crown,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Eye,
  Download,
  Star,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface SlideTemplate {
  id: string
  name: string
  description: string
  category: 'title' | 'content' | 'chart' | 'insight' | 'conclusion' | 'executive'
  difficulty: 'basic' | 'advanced' | 'expert'
  industry: string[]
  useCase: string[]
  preview: string
  elements: TemplateElement[]
  style: 'mckinsey' | 'bcg' | 'bain' | 'corporate' | 'startup'
  premium: boolean
}

interface TemplateElement {
  id: string
  type: 'text' | 'chart' | 'image' | 'callout' | 'metric' | 'bullet' | 'logo'
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
  fontSize?: number
  fontWeight?: string
  textAlign?: 'left' | 'center' | 'right'
  color?: string
}

interface ProfessionalTemplateLibraryProps {
  onSelectTemplate?: (template: SlideTemplate) => void
  selectedCategory?: string
  className?: string
}

// Professional slide templates inspired by top consulting firms
const SLIDE_TEMPLATES: SlideTemplate[] = [
  {
    id: 'mckinsey-executive-title',
    name: 'Executive Title Slide',
    description: 'Clean, authoritative title slide with space for key messaging',
    category: 'title',
    difficulty: 'basic',
    industry: ['consulting', 'finance', 'technology'],
    useCase: ['board presentation', 'client meeting', 'strategy review'],
    preview: '/templates/mckinsey-title.png',
    style: 'mckinsey',
    premium: false,
    elements: [
      {
        id: 'main-title',
        type: 'text',
        position: { x: 10, y: 35, width: 80, height: 15 },
        content: { text: 'Strategic Analysis & Recommendations', fontSize: 36, fontWeight: 'bold' },
        style: { textAlign: 'center', color: '#003366' }
      },
      {
        id: 'subtitle',
        type: 'text',
        position: { x: 10, y: 55, width: 80, height: 8 },
        content: { text: 'Q4 Business Review', fontSize: 18 },
        style: { textAlign: 'center', color: '#666666' }
      },
      {
        id: 'author-date',
        type: 'text',
        position: { x: 10, y: 75, width: 80, height: 5 },
        content: { text: 'Prepared for Executive Leadership • December 2024', fontSize: 14 },
        style: { textAlign: 'center', color: '#999999' }
      }
    ]
  },
  {
    id: 'bcg-key-insight',
    name: 'Key Insight with Evidence',
    description: 'Two-column layout with insight and supporting visualization',
    category: 'insight',
    difficulty: 'advanced',
    industry: ['consulting', 'healthcare', 'retail'],
    useCase: ['insight presentation', 'data storytelling', 'recommendation'],
    preview: '/templates/bcg-insight.png',
    style: 'bcg',
    premium: true,
    elements: [
      {
        id: 'slide-title',
        type: 'text',
        position: { x: 5, y: 5, width: 90, height: 8 },
        content: { text: 'Key Strategic Insight', fontSize: 24, fontWeight: 'bold' },
        style: { color: '#005A5B' }
      },
      {
        id: 'insight-callout',
        type: 'callout',
        position: { x: 5, y: 20, width: 45, height: 25 },
        content: { 
          text: 'Revenue growth accelerated 23% in Q4, driven primarily by enterprise customer expansion',
          importance: 'high'
        },
        style: { 
          backgroundColor: '#E8F6F6', 
          borderColor: '#00A3A4', 
          borderWidth: 3,
          borderRadius: 8,
          shadow: true
        }
      },
      {
        id: 'supporting-chart',
        type: 'chart',
        position: { x: 55, y: 20, width: 40, height: 35 },
        content: { chartType: 'line', title: 'Revenue Trend' },
        style: {}
      },
      {
        id: 'evidence-bullets',
        type: 'bullet',
        position: { x: 5, y: 50, width: 45, height: 35 },
        content: { 
          items: [
            'Enterprise deals increased 45% QoQ',
            'Average deal size grew to $120K',
            'Customer retention improved to 94%'
          ]
        },
        style: { fontSize: 14, color: '#333333' }
      },
      {
        id: 'recommendation',
        type: 'callout',
        position: { x: 55, y: 60, width: 40, height: 25 },
        content: { 
          text: 'RECOMMENDATION: Double down on enterprise sales with dedicated team expansion',
          importance: 'medium'
        },
        style: { 
          backgroundColor: '#FFF8DC', 
          borderColor: '#FF6B35', 
          borderWidth: 2,
          borderRadius: 6
        }
      }
    ]
  },
  {
    id: 'bain-metrics-dashboard',
    name: 'Executive Metrics Dashboard',
    description: 'Three-column KPI layout with trend indicators',
    category: 'executive',
    difficulty: 'expert',
    industry: ['private equity', 'consulting', 'finance'],
    useCase: ['board meeting', 'investor update', 'performance review'],
    preview: '/templates/bain-metrics.png',
    style: 'bain',
    premium: true,
    elements: [
      {
        id: 'dashboard-title',
        type: 'text',
        position: { x: 5, y: 5, width: 90, height: 8 },
        content: { text: 'Q4 Performance Dashboard', fontSize: 24, fontWeight: 'bold' },
        style: { color: '#CC092F' }
      },
      {
        id: 'metric-1',
        type: 'metric',
        position: { x: 5, y: 20, width: 28, height: 30 },
        content: { 
          value: '$2.4M', 
          label: 'Revenue', 
          change: '+23%',
          trend: 'up',
          period: 'vs Q3'
        },
        style: { 
          backgroundColor: '#FFF0F1', 
          borderColor: '#CC092F',
          borderWidth: 2,
          borderRadius: 12,
          textAlign: 'center'
        }
      },
      {
        id: 'metric-2',
        type: 'metric',
        position: { x: 36, y: 20, width: 28, height: 30 },
        content: { 
          value: '94%', 
          label: 'Customer Satisfaction', 
          change: '+2pts',
          trend: 'up',
          period: 'vs Q3'
        },
        style: { 
          backgroundColor: '#F0FFF4', 
          borderColor: '#22C55E',
          borderWidth: 2,
          borderRadius: 12,
          textAlign: 'center'
        }
      },
      {
        id: 'metric-3',
        type: 'metric',
        position: { x: 67, y: 20, width: 28, height: 30 },
        content: { 
          value: '18%', 
          label: 'Market Share', 
          change: '+3pts',
          trend: 'up',
          period: 'vs Q3'
        },
        style: { 
          backgroundColor: '#FFFBEB', 
          borderColor: '#F59E0B',
          borderWidth: 2,
          borderRadius: 12,
          textAlign: 'center'
        }
      },
      {
        id: 'key-drivers',
        type: 'bullet',
        position: { x: 5, y: 55, width: 42, height: 35 },
        content: { 
          title: 'Key Performance Drivers',
          items: [
            'Enterprise customer acquisition accelerated',
            'Product-market fit achieved in new segments',
            'Operational efficiency improvements delivered'
          ]
        },
        style: { fontSize: 14 }
      },
      {
        id: 'outlook',
        type: 'callout',
        position: { x: 52, y: 55, width: 43, height: 35 },
        content: { 
          text: 'Q1 2025 OUTLOOK: Maintain growth momentum with focus on market expansion and customer success',
          importance: 'high'
        },
        style: { 
          backgroundColor: '#E8F6F6', 
          borderColor: '#0891B2',
          borderWidth: 2,
          borderRadius: 8
        }
      }
    ]
  },
  {
    id: 'corporate-comparison',
    name: 'Strategic Comparison',
    description: 'Side-by-side comparison with decision framework',
    category: 'content',
    difficulty: 'advanced',
    industry: ['corporate', 'strategy', 'operations'],
    useCase: ['decision making', 'option evaluation', 'strategic planning'],
    preview: '/templates/corporate-comparison.png',
    style: 'corporate',
    premium: false,
    elements: [
      {
        id: 'comparison-title',
        type: 'text',
        position: { x: 5, y: 5, width: 90, height: 8 },
        content: { text: 'Strategic Option Evaluation', fontSize: 24, fontWeight: 'bold' },
        style: { color: '#1E3A8A' }
      },
      {
        id: 'option-a-header',
        type: 'text',
        position: { x: 5, y: 18, width: 42, height: 6 },
        content: { text: 'Option A: Organic Growth', fontSize: 18, fontWeight: 'semibold' },
        style: { backgroundColor: '#DBEAFE', color: '#1E3A8A', textAlign: 'center', borderRadius: 6 }
      },
      {
        id: 'option-b-header',
        type: 'text',
        position: { x: 53, y: 18, width: 42, height: 6 },
        content: { text: 'Option B: Strategic Acquisition', fontSize: 18, fontWeight: 'semibold' },
        style: { backgroundColor: '#FEF3C7', color: '#92400E', textAlign: 'center', borderRadius: 6 }
      },
      {
        id: 'option-a-details',
        type: 'bullet',
        position: { x: 5, y: 28, width: 42, height: 40 },
        content: { 
          items: [
            'Investment: $2M over 18 months',
            'Expected ROI: 15-20%',
            'Risk Level: Low',
            'Time to Market: 12-18 months',
            'Market Share Impact: +2-3%'
          ]
        },
        style: { fontSize: 14, backgroundColor: '#F8FAFC', borderRadius: 6 }
      },
      {
        id: 'option-b-details',
        type: 'bullet',
        position: { x: 53, y: 28, width: 42, height: 40 },
        content: { 
          items: [
            'Investment: $15M upfront',
            'Expected ROI: 25-30%',
            'Risk Level: Medium-High',
            'Time to Market: 6-9 months',
            'Market Share Impact: +8-12%'
          ]
        },
        style: { fontSize: 14, backgroundColor: '#FFFEF7', borderRadius: 6 }
      },
      {
        id: 'recommendation-box',
        type: 'callout',
        position: { x: 5, y: 75, width: 90, height: 15 },
        content: { 
          text: 'RECOMMENDATION: Pursue Option B with phased integration approach to mitigate execution risk',
          importance: 'high'
        },
        style: { 
          backgroundColor: '#DCFCE7', 
          borderColor: '#16A34A',
          borderWidth: 3,
          borderRadius: 8,
          textAlign: 'center'
        }
      }
    ]
  },
  {
    id: 'startup-growth-story',
    name: 'Growth Story Narrative',
    description: 'Timeline-based growth story with key milestones',
    category: 'content',
    difficulty: 'advanced',
    industry: ['startup', 'technology', 'venture capital'],
    useCase: ['fundraising', 'investor pitch', 'growth review'],
    preview: '/templates/startup-growth.png',
    style: 'startup',
    premium: true,
    elements: [
      {
        id: 'growth-title',
        type: 'text',
        position: { x: 5, y: 5, width: 90, height: 8 },
        content: { text: 'Our Growth Journey', fontSize: 28, fontWeight: 'bold' },
        style: { color: '#111827' }
      },
      {
        id: 'timeline-chart',
        type: 'chart',
        position: { x: 5, y: 20, width: 90, height: 35 },
        content: { chartType: 'area', title: 'Revenue Growth Trajectory' },
        style: {}
      },
      {
        id: 'milestone-1',
        type: 'callout',
        position: { x: 5, y: 60, width: 20, height: 15 },
        content: { 
          text: 'Q1 2023\nProduct-Market Fit\n$100K ARR',
          importance: 'medium'
        },
        style: { 
          backgroundColor: '#F3F4F6', 
          borderColor: '#6B7280',
          borderWidth: 2,
          borderRadius: 8,
          textAlign: 'center',
          fontSize: 12
        }
      },
      {
        id: 'milestone-2',
        type: 'callout',
        position: { x: 30, y: 60, width: 20, height: 15 },
        content: { 
          text: 'Q3 2023\nSeries A\n$500K ARR',
          importance: 'medium'
        },
        style: { 
          backgroundColor: '#EBF8FF', 
          borderColor: '#3B82F6',
          borderWidth: 2,
          borderRadius: 8,
          textAlign: 'center',
          fontSize: 12
        }
      },
      {
        id: 'milestone-3',
        type: 'callout',
        position: { x: 55, y: 60, width: 20, height: 15 },
        content: { 
          text: 'Q1 2024\nMarket Expansion\n$2M ARR',
          importance: 'medium'
        },
        style: { 
          backgroundColor: '#F0FDF4', 
          borderColor: '#10B981',
          borderWidth: 2,
          borderRadius: 8,
          textAlign: 'center',
          fontSize: 12
        }
      },
      {
        id: 'future-milestone',
        type: 'callout',
        position: { x: 80, y: 60, width: 15, height: 15 },
        content: { 
          text: 'Q4 2024\nSeries B Target\n$10M ARR',
          importance: 'high'
        },
        style: { 
          backgroundColor: '#FDF2F8', 
          borderColor: '#EC4899',
          borderWidth: 2,
          borderRadius: 8,
          textAlign: 'center',
          fontSize: 12
        }
      },
      {
        id: 'growth-insights',
        type: 'bullet',
        position: { x: 5, y: 80, width: 90, height: 15 },
        content: { 
          items: [
            '400% year-over-year growth sustained across 3 quarters',
            'Enterprise customer segment growing 2x faster than SMB',
            'Product expansion driving 60% of new revenue'
          ]
        },
        style: { fontSize: 14, color: '#374151' }
      }
    ]
  }
]

export function ProfessionalTemplateLibrary({
  onSelectTemplate,
  selectedCategory,
  className = ''
}: ProfessionalTemplateLibraryProps) {
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>(selectedCategory || 'all')
  const [filterStyle, setFilterStyle] = useState<string>('all')
  const [showPremiumOnly, setShowPremiumOnly] = useState(false)

  const categories = [
    { id: 'all', name: 'All Templates', icon: Grid },
    { id: 'title', name: 'Title Slides', icon: FileText },
    { id: 'executive', name: 'Executive', icon: Crown },
    { id: 'insight', name: 'Insights', icon: Zap },
    { id: 'content', name: 'Content', icon: Layout },
    { id: 'chart', name: 'Charts', icon: BarChart3 }
  ]

  const styles = [
    { id: 'all', name: 'All Styles' },
    { id: 'mckinsey', name: 'McKinsey' },
    { id: 'bcg', name: 'BCG' },
    { id: 'bain', name: 'Bain' },
    { id: 'corporate', name: 'Corporate' },
    { id: 'startup', name: 'Startup' }
  ]

  const filteredTemplates = SLIDE_TEMPLATES.filter(template => {
    if (filterCategory !== 'all' && template.category !== filterCategory) return false
    if (filterStyle !== 'all' && template.style !== filterStyle) return false
    if (showPremiumOnly && !template.premium) return false
    return true
  })

  const handleTemplateSelect = useCallback((template: SlideTemplate) => {
    setActiveTemplate(template.id)
    onSelectTemplate?.(template)
  }, [onSelectTemplate])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'basic': return 'bg-green-100 text-green-800'
      case 'advanced': return 'bg-yellow-100 text-yellow-800'
      case 'expert': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStyleColor = (style: string) => {
    switch (style) {
      case 'mckinsey': return '#003366'
      case 'bcg': return '#005A5B'
      case 'bain': return '#CC092F'
      case 'corporate': return '#1E3A8A'
      case 'startup': return '#111827'
      default: return '#6B7280'
    }
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Professional Template Library</h2>
        <p className="text-gray-600">Choose from world-class presentation templates inspired by top consulting firms</p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <Tabs value={filterCategory} onValueChange={setFilterCategory}>
          <TabsList className="grid w-full grid-cols-6">
            {categories.map((category) => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="flex items-center space-x-2"
              >
                <category.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <select
              value={filterStyle}
              onChange={(e) => setFilterStyle(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {styles.map((style) => (
                <option key={style.id} value={style.id}>{style.name}</option>
              ))}
            </select>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showPremiumOnly}
                onChange={(e) => setShowPremiumOnly(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Premium only</span>
              <Crown className="w-4 h-4 text-yellow-500" />
            </label>
          </div>

          <Badge variant="secondary">
            {filteredTemplates.length} templates
          </Badge>
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredTemplates.map((template) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  activeTemplate === template.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
                }`}
                onClick={() => handleTemplateSelect(template)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <CardTitle className="text-lg font-semibold">{template.name}</CardTitle>
                        {template.premium && (
                          <Crown className="w-5 h-5 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mt-2">
                    <Badge 
                      className={getDifficultyColor(template.difficulty)}
                      variant="secondary"
                    >
                      {template.difficulty}
                    </Badge>
                    <Badge 
                      variant="outline"
                      style={{ borderColor: getStyleColor(template.style), color: getStyleColor(template.style) }}
                    >
                      {template.style}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Template Preview */}
                  <div 
                    className="w-full h-32 mb-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center"
                    style={{ borderColor: getStyleColor(template.style) + '40' }}
                  >
                    <div className="text-center">
                      <Layout className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">{template.elements.length} elements</p>
                    </div>
                  </div>

                  {/* Use Cases */}
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Best for:</h5>
                    <div className="flex flex-wrap gap-1">
                      {template.useCase.slice(0, 2).map((useCase, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {useCase}
                        </Badge>
                      ))}
                      {template.useCase.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.useCase.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                    </div>
                    <Button 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTemplateSelect(template)
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <span>Use Template</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Layout className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-500">Try adjusting your filters to see more templates</p>
        </div>
      )}
    </div>
  )
}

// Export templates for use in other components
export { SLIDE_TEMPLATES }
export type { SlideTemplate, TemplateElement }