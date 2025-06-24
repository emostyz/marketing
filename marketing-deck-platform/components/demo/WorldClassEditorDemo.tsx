'use client'

import React from 'react'
import WorldClassPresentationEditor from '@/components/editor/WorldClassPresentationEditor'

// Demo data to showcase the beautiful interface
const demoSlides = [
  {
    id: 'slide_1',
    number: 1,
    title: 'Strategic Market Analysis',
    subtitle: 'Q4 2024 Performance Review',
    content: {
      summary: 'Our comprehensive analysis reveals significant growth opportunities in emerging markets with a 45% increase in customer acquisition and strategic positioning advantages.',
      hiddenInsight: 'Customer retention follows a non-linear pattern with critical threshold effects at 6-month intervals.',
      strategicImplication: 'Market timing and threshold optimization create compound competitive advantages.'
    },
    keyTakeaways: [
      'Revenue growth exceeded targets by 23% driven by strategic market expansion',
      'Customer acquisition cost decreased 15% through optimized channel strategies', 
      'Market penetration in emerging segments increased 45% year-over-year',
      'Strategic partnerships delivered 67% of new business growth'
    ],
    charts: [
      {
        id: 'chart_1',
        type: 'area',
        title: 'Revenue Growth Trajectory',
        data: [
          { name: 'Q1', value: 1200000, growth: 12 },
          { name: 'Q2', value: 1450000, growth: 21 },
          { name: 'Q3', value: 1680000, growth: 16 },
          { name: 'Q4', value: 2100000, growth: 25 }
        ],
        config: {
          xAxisKey: 'name',
          yAxisKey: 'value',
          showAnimation: true,
          showLegend: true,
          valueFormatter: (value: number) => `$${(value / 1000000).toFixed(1)}M`
        },
        insights: [
          'Q4 performance shows acceleration beyond linear growth patterns',
          'Revenue trajectory indicates sustainable momentum into next quarter'
        ]
      }
    ],
    elements: [
      {
        id: 'element_1',
        type: 'text',
        content: 'Strategic Breakthrough',
        position: { x: 50, y: 400 },
        size: { width: 200, height: 50 },
        rotation: 0,
        style: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(59, 130, 246, 0.3)'
        },
        metadata: {
          source: 'ai_insight',
          confidence: 92,
          insightType: 'breakthrough'
        }
      }
    ],
    background: {
      type: 'gradient',
      gradient: { from: '#0f172a', to: '#1e293b', direction: '135deg' }
    },
    customStyles: {
      textColor: '#ffffff',
      accentColor: '#3b82f6'
    },
    aiInsights: {
      confidence: 92,
      keyFindings: ['Strategic inflection point identified', 'Market timing advantage confirmed'],
      recommendations: ['Accelerate expansion strategy', 'Optimize threshold performance'],
      dataStory: 'Performance data reveals strategic opportunities with compound advantages',
      businessImpact: 'Transformational growth potential through strategic optimization'
    }
  },
  {
    id: 'slide_2', 
    number: 2,
    title: 'Competitive Intelligence Insights',
    subtitle: 'Market Positioning & Strategic Advantages',
    content: {
      summary: 'Deep competitive analysis reveals significant market gaps and positioning opportunities that create sustainable competitive moats.',
      hiddenInsight: 'Competitors are missing critical customer segments with 40% higher lifetime value.',
      strategicImplication: 'First-mover advantage window in premium segments creates long-term competitive barriers.'
    },
    keyTakeaways: [
      'Identified 3 underserved market segments with premium pricing potential',
      'Competitive response time averages 18 months, creating strategic windows',
      'Customer switching costs in our favor increased 34% this quarter',
      'Brand differentiation scores improved across all key metrics'
    ],
    charts: [
      {
        id: 'chart_2',
        type: 'bar',
        title: 'Competitive Market Share Analysis',
        data: [
          { name: 'Our Company', value: 28, satisfaction: 94 },
          { name: 'Competitor A', value: 22, satisfaction: 76 },
          { name: 'Competitor B', value: 18, satisfaction: 68 },
          { name: 'Competitor C', value: 15, satisfaction: 72 },
          { name: 'Others', value: 17, satisfaction: 65 }
        ],
        config: {
          xAxisKey: 'name',
          yAxisKey: 'value',
          showAnimation: true,
          showLegend: true,
          valueFormatter: (value: number) => `${value}%`
        },
        insights: [
          'Market leadership position strengthening with highest satisfaction scores',
          'Competitive gap widening in customer satisfaction metrics'
        ]
      }
    ],
    elements: [],
    background: {
      type: 'gradient', 
      gradient: { from: '#1e293b', to: '#374151', direction: '135deg' }
    },
    customStyles: {
      textColor: '#ffffff',
      accentColor: '#10b981'
    },
    aiInsights: {
      confidence: 89,
      keyFindings: ['Competitive moat expansion confirmed', 'Premium segment opportunity identified'],
      recommendations: ['Accelerate premium segment capture', 'Strengthen competitive barriers'],
      dataStory: 'Competitive intelligence reveals strategic positioning advantages',
      businessImpact: 'Sustainable competitive advantages through strategic market positioning'
    }
  },
  {
    id: 'slide_3',
    number: 3,
    title: 'Strategic Recommendations',
    subtitle: 'Action Plan for Competitive Advantage',
    content: {
      summary: 'Based on comprehensive analysis, we recommend an integrated strategy focusing on threshold optimization, market timing, and competitive positioning to maximize strategic value creation.',
      hiddenInsight: 'Success probability increases exponentially when combining timing, positioning, and operational excellence strategies.',
      strategicImplication: 'Integrated strategy execution creates compound competitive advantages that are difficult for competitors to replicate.'
    },
    keyTakeaways: [
      'Implement threshold optimization strategy to maximize efficiency gains',
      'Accelerate premium segment expansion while competitive window remains open',
      'Strengthen operational moats through strategic capability building',
      'Execute integrated timing strategy for maximum competitive advantage'
    ],
    charts: [
      {
        id: 'chart_3',
        type: 'line',
        title: 'Strategic Value Creation Projection',
        data: [
          { name: 'Current', value: 100, projected: 100 },
          { name: '6M', value: 125, projected: 140 },
          { name: '12M', value: 156, projected: 185 },
          { name: '18M', value: 195, projected: 245 },
          { name: '24M', value: 244, projected: 320 }
        ],
        config: {
          xAxisKey: 'name',
          yAxisKey: 'projected',
          showAnimation: true,
          showLegend: true,
          valueFormatter: (value: number) => `${value}%`
        },
        insights: [
          'Integrated strategy delivers compound value creation over 24 months',
          'Strategic execution timing creates exponential advantage curves'
        ]
      }
    ],
    elements: [
      {
        id: 'element_3',
        type: 'text',
        content: 'Executive Action Required',
        position: { x: 400, y: 500 },
        size: { width: 250, height: 60 },
        rotation: 0,
        style: {
          fontSize: 14,
          fontWeight: 'bold',
          color: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        },
        metadata: {
          source: 'ai_insight',
          confidence: 95,
          insightType: 'action_required'
        }
      }
    ],
    background: {
      type: 'gradient',
      gradient: { from: '#374151', to: '#111827', direction: '135deg' }
    },
    customStyles: {
      textColor: '#ffffff',
      accentColor: '#f59e0b'
    },
    aiInsights: {
      confidence: 95,
      keyFindings: ['Integrated strategy maximizes value creation', 'Timing optimization creates exponential advantages'],
      recommendations: ['Execute integrated strategy immediately', 'Monitor competitive response timing'],
      dataStory: 'Strategic analysis reveals optimal execution pathway for competitive advantage',
      businessImpact: 'Transformational competitive positioning through strategic excellence'
    }
  }
]

export default function WorldClassEditorDemo() {
  const handleSave = async (slides: any[]) => {
    console.log('💾 Saving world-class presentation:', slides)
    // In a real app, this would save to the backend
  }

  const handleExport = async (format: string) => {
    console.log('📤 Exporting presentation as:', format)
    // In a real app, this would trigger export
  }

  const handleRegenerateSlide = async (slideIndex: number, customPrompt?: string) => {
    console.log('🔄 Regenerating slide:', slideIndex, customPrompt)
    // In a real app, this would call the AI service
    return demoSlides[slideIndex] // Return the same slide for demo
  }

  return (
    <div className="w-full h-screen">
      <WorldClassPresentationEditor
        presentationId="demo_presentation"
        initialSlides={demoSlides}
        onSave={handleSave}
        onExport={handleExport}
        onRegenerateSlide={handleRegenerateSlide}
      />
    </div>
  )
}