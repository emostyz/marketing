'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, Settings, Palette, Grid, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'react-hot-toast'

// Import all our beautiful components
import WorldClassPresentationEditor from '@/components/editor/WorldClassPresentationEditor'
import AdvancedTemplateSelector from '@/components/editor/AdvancedTemplateSelector'
import ElementsLibrary from '@/components/editor/ElementsLibrary'
import ChartCustomizer from '@/components/editor/ChartCustomizer'
import CustomizationPanel from '@/components/editor/CustomizationPanel'
import { presentationPersistence } from '@/lib/services/presentation-persistence'

interface Template {
  id: string
  name: string
  description: string
  category: string
  thumbnail: string
  isPremium: boolean
  tags: string[]
  slides: number
  rating: number
  downloads: number
  template_data: any
  colors: string[]
  style: 'modern' | 'classic' | 'minimal' | 'bold' | 'elegant'
}

const DEMO_SLIDES = [
  {
    id: 'slide_1',
    number: 1,
    title: 'Executive Summary',
    subtitle: 'Strategic Business Analysis Q4 2024',
    content: {
      summary: 'Our comprehensive analysis reveals transformational growth opportunities with strategic competitive advantages and measurable business impact.',
      hiddenInsight: 'Market timing creates compound competitive advantages that exponentially increase value creation potential.',
      strategicImplication: 'First-mover advantage window identified with 67% probability of market capture success.'
    },
    keyTakeaways: [
      'Revenue growth exceeded targets by 34% through strategic optimization',
      'Market penetration increased 45% via threshold-based scaling approach',
      'Competitive positioning strengthened with sustainable moat development',
      'Strategic execution timeline accelerated by 6 months ahead of projections'
    ],
    charts: [
      {
        id: 'chart_1',
        type: 'area',
        title: 'Strategic Value Creation Timeline',
        data: [
          { name: 'Q1', value: 1000000, target: 950000, growth: 15 },
          { name: 'Q2', value: 1340000, target: 1200000, growth: 34 },
          { name: 'Q3', value: 1680000, target: 1450000, growth: 25 },
          { name: 'Q4', value: 2250000, target: 1800000, growth: 34 }
        ],
        config: {
          xAxisKey: 'name',
          yAxisKey: 'value',
          showAnimation: true,
          showLegend: true,
          valueFormatter: (value: number) => `$${(value / 1000000).toFixed(1)}M`
        },
        insights: [
          'Q4 performance demonstrates exponential value creation through strategic execution',
          'Target achievement rate of 125% indicates sustainable momentum trajectory'
        ]
      }
    ],
    elements: [
      {
        id: 'insight_1',
        type: 'text',
        content: 'Strategic Breakthrough Identified',
        position: { x: 50, y: 450 },
        size: { width: 300, height: 60 },
        rotation: 0,
        style: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#ffffff',
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          padding: '16px',
          borderRadius: '12px',
          border: '2px solid rgba(59, 130, 246, 0.4)'
        },
        metadata: {
          source: 'ai_insight',
          confidence: 94,
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
      confidence: 94,
      keyFindings: [
        'Strategic inflection point achieved through threshold optimization',
        'Competitive moat established with measurable differentiation',
        'Market timing advantage creates exponential value multiplier'
      ],
      recommendations: [
        'Accelerate strategic scaling to capture full market opportunity',
        'Implement advanced analytics for competitive intelligence monitoring',
        'Execute integrated growth strategy across all business verticals'
      ],
      dataStory: 'Performance data reveals strategic transformation with compound competitive advantages',
      businessImpact: 'Transformational business value creation through strategic excellence and market positioning'
    }
  }
]

export default function ComprehensiveEditorDemo() {
  const [currentView, setCurrentView] = useState<'template' | 'editor'>('template')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [currentSlides, setCurrentSlides] = useState(DEMO_SLIDES)
  const [selectedElements, setSelectedElements] = useState<string[]>([])
  const [showElementsLibrary, setShowElementsLibrary] = useState(true)
  const [showCustomizationPanel, setShowCustomizationPanel] = useState(true)
  const [showChartCustomizer, setShowChartCustomizer] = useState(false)
  const [selectedChart, setSelectedChart] = useState(null)

  // Template selection
  const handleTemplateSelect = useCallback((template: Template) => {
    setSelectedTemplate(template)
    setCurrentView('editor')
    toast.success(`Template "${template.name}" selected!`)
  }, [])

  const handleTemplatePreview = useCallback((template: Template) => {
    toast.info(`Previewing template: ${template.name}`)
  }, [])

  // Element management
  const handleAddElement = useCallback((element: any) => {
    const newSlides = [...currentSlides]
    newSlides[0].elements.push(element)
    setCurrentSlides(newSlides)
    toast.success('Element added to slide!')
  }, [currentSlides])

  const handleUpdateElement = useCallback((elementId: string, updates: any) => {
    const newSlides = [...currentSlides]
    const elementIndex = newSlides[0].elements.findIndex(el => el.id === elementId)
    if (elementIndex !== -1) {
      newSlides[0].elements[elementIndex] = { ...newSlides[0].elements[elementIndex], ...updates }
      setCurrentSlides(newSlides)
    }
  }, [currentSlides])

  const handleDeleteElement = useCallback((elementId: string) => {
    const newSlides = [...currentSlides]
    newSlides[0].elements = newSlides[0].elements.filter(el => el.id !== elementId)
    setCurrentSlides(newSlides)
    setSelectedElements(prev => prev.filter(id => id !== elementId))
    toast.success('Element deleted!')
  }, [currentSlides])

  const handleDuplicateElement = useCallback((elementId: string) => {
    const newSlides = [...currentSlides]
    const element = newSlides[0].elements.find(el => el.id === elementId)
    if (element) {
      const duplicated = {
        ...element,
        id: `${element.id}_copy_${Date.now()}`,
        position: {
          x: element.position.x + 20,
          y: element.position.y + 20
        }
      }
      newSlides[0].elements.push(duplicated)
      setCurrentSlides(newSlides)
      toast.success('Element duplicated!')
    }
  }, [currentSlides])

  const handleToggleLock = useCallback((elementId: string) => {
    const newSlides = [...currentSlides]
    const elementIndex = newSlides[0].elements.findIndex(el => el.id === elementId)
    if (elementIndex !== -1) {
      newSlides[0].elements[elementIndex].isLocked = !newSlides[0].elements[elementIndex].isLocked
      setCurrentSlides(newSlides)
      toast.success(newSlides[0].elements[elementIndex].isLocked ? 'Element locked' : 'Element unlocked')
    }
  }, [currentSlides])

  const handleToggleVisibility = useCallback((elementId: string) => {
    const newSlides = [...currentSlides]
    const elementIndex = newSlides[0].elements.findIndex(el => el.id === elementId)
    if (elementIndex !== -1) {
      newSlides[0].elements[elementIndex].isVisible = !newSlides[0].elements[elementIndex].isVisible
      setCurrentSlides(newSlides)
      toast.success(newSlides[0].elements[elementIndex].isVisible ? 'Element shown' : 'Element hidden')
    }
  }, [currentSlides])

  // Presentation management
  const handleSavePresentation = useCallback(async (slides: any[]) => {
    try {
      toast.loading('Saving presentation...', { id: 'save' })
      
      const presentationData = {
        title: selectedTemplate?.name || 'My Beautiful Presentation',
        description: 'Created with world-class editor featuring comprehensive customization',
        slides: slides.map((slide, index) => ({
          id: slide.id,
          slide_number: index + 1,
          slide_type: slide.type || 'content',
          title: slide.title,
          subtitle: slide.subtitle,
          content: {
            summary: slide.content?.summary || slide.content,
            bullet_points: slide.keyTakeaways || [],
            hidden_insight: slide.content?.hiddenInsight,
            strategic_implication: slide.content?.strategicImplication
          },
          elements: slide.elements?.map((el: any) => ({
            id: el.id,
            type: el.type,
            content: el.content,
            position: el.position,
            size: el.size,
            rotation: el.rotation || 0,
            style: {
              font_family: el.style?.fontFamily,
              font_size: el.style?.fontSize,
              font_weight: el.style?.fontWeight,
              font_style: el.style?.fontStyle,
              text_align: el.style?.textAlign,
              color: el.style?.color,
              background_color: el.style?.backgroundColor,
              border: el.style?.border,
              border_radius: el.style?.borderRadius,
              opacity: el.style?.opacity,
              box_shadow: el.style?.boxShadow
            },
            is_locked: el.isLocked || false,
            is_visible: el.isVisible !== false,
            z_index: el.zIndex || 0,
            metadata: {
              template_id: el.metadata?.templateId,
              source: el.metadata?.source || 'manual',
              created_at: el.metadata?.createdAt || new Date().toISOString(),
              updated_at: new Date().toISOString(),
              customizations: el.metadata?.customizable || []
            }
          })) || [],
          background: slide.background || { type: 'solid', value: '#ffffff' },
          style: {
            font_family: slide.customStyles?.fontFamily,
            text_color: slide.customStyles?.textColor,
            accent_color: slide.customStyles?.accentColor,
            layout: slide.layout
          },
          charts: slide.charts?.map((chart: any) => ({
            id: chart.id,
            type: chart.type,
            title: chart.title,
            data: chart.data,
            config: {
              x_axis_key: chart.config?.xAxisKey,
              y_axis_key: chart.config?.yAxisKey,
              show_animation: chart.config?.showAnimation || false,
              show_legend: chart.config?.showLegend || false,
              show_grid_lines: chart.config?.showGridLines || false,
              colors: chart.config?.colors || ['#3b82f6']
            },
            style: {
              width: chart.style?.width || 400,
              height: chart.style?.height || 300,
              background_color: chart.style?.backgroundColor,
              border_radius: chart.style?.borderRadius,
              padding: chart.style?.padding
            },
            insights: chart.insights || [],
            metadata: {
              template_id: chart.template?.id,
              data_source: 'user_input',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              customizations: chart.customizable || []
            }
          })) || [],
          ai_insights: slide.aiInsights ? {
            confidence: slide.aiInsights.confidence,
            key_findings: slide.aiInsights.keyFindings,
            recommendations: slide.aiInsights.recommendations,
            data_story: slide.aiInsights.dataStory,
            business_impact: slide.aiInsights.businessImpact
          } : undefined,
          metadata: {
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            version: 1,
            template_used: selectedTemplate?.id,
            custom_elements_count: slide.elements?.length || 0
          }
        })),
        template_id: selectedTemplate?.id,
        metadata: {
          version: 1,
          total_slides: slides.length,
          estimated_duration: slides.length * 2.5,
          design_system_version: '1.0.0',
          custom_fonts: ['Inter', 'Roboto', 'Playfair Display'],
          custom_colors: ['#3b82f6', '#ef4444', '#10b981'],
          custom_elements: []
        },
        status: 'draft' as const
      }

      const presentationId = await presentationPersistence.savePresentation(presentationData)
      
      // Track usage
      await presentationPersistence.trackPresentationUsage(presentationId, 'created', {
        template_used: selectedTemplate?.id,
        elements_count: slides.reduce((total, slide) => total + (slide.elements?.length || 0), 0),
        charts_count: slides.reduce((total, slide) => total + (slide.charts?.length || 0), 0),
        customizations_applied: true
      })

      toast.success('✨ Beautiful presentation saved successfully!', { id: 'save' })
      console.log('🎉 Presentation saved with ID:', presentationId)
    } catch (error) {
      console.error('❌ Save error:', error)
      toast.error('Failed to save presentation. Please try again.', { id: 'save' })
    }
  }, [selectedTemplate])

  const handleExportPresentation = useCallback(async (format: string) => {
    toast.success(`🚀 Exporting presentation as ${format.toUpperCase()}`)
    // Export functionality would be implemented here
  }, [])

  const handleRegenerateSlide = useCallback(async (slideIndex: number, customPrompt?: string) => {
    toast.loading('🧠 AI is regenerating slide with fresh insights...', { id: 'regenerate' })
    
    // Simulate AI regeneration
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    toast.success('✨ Slide regenerated with enhanced insights!', { id: 'regenerate' })
    return currentSlides[slideIndex]
  }, [currentSlides])

  const selectedElementObjects = currentSlides[0]?.elements?.filter(el => 
    selectedElements.includes(el.id)
  ) || []

  return (
    <div className="w-full h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <AnimatePresence mode="wait">
        {currentView === 'template' && (
          <motion.div
            key="template-selector"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full h-full"
          >
            <AdvancedTemplateSelector
              onSelectTemplate={handleTemplateSelect}
              onPreviewTemplate={handleTemplatePreview}
            />
          </motion.div>
        )}

        {currentView === 'editor' && (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full h-full flex"
          >
            {/* Main Editor */}
            <div className="flex-1 flex">
              <WorldClassPresentationEditor
                presentationId={`demo_${Date.now()}`}
                initialSlides={currentSlides}
                onSave={handleSavePresentation}
                onExport={handleExportPresentation}
                onRegenerateSlide={handleRegenerateSlide}
              />
            </div>

            {/* Elements Library */}
            <AnimatePresence>
              {showElementsLibrary && (
                <motion.div
                  initial={{ x: 320 }}
                  animate={{ x: 0 }}
                  exit={{ x: 320 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <ElementsLibrary
                    onAddElement={handleAddElement}
                    selectedElements={selectedElements}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Customization Panel */}
            <AnimatePresence>
              {showCustomizationPanel && selectedElementObjects.length > 0 && (
                <motion.div
                  initial={{ x: 320 }}
                  animate={{ x: 0 }}
                  exit={{ x: 320 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <CustomizationPanel
                    selectedElements={selectedElementObjects}
                    onUpdateElement={handleUpdateElement}
                    onDeleteElement={handleDeleteElement}
                    onDuplicateElement={handleDuplicateElement}
                    onToggleLock={handleToggleLock}
                    onToggleVisibility={handleToggleVisibility}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chart Customizer */}
            <AnimatePresence>
              {showChartCustomizer && selectedChart && (
                <motion.div
                  initial={{ x: 320 }}
                  animate={{ x: 0 }}
                  exit={{ x: 320 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <ChartCustomizer
                    chart={selectedChart}
                    onUpdateChart={(updatedChart) => {
                      // Update chart in slides
                      console.log('Chart updated:', updatedChart)
                    }}
                    onCloseCustomizer={() => setShowChartCustomizer(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Buttons */}
      {currentView === 'editor' && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="fixed bottom-6 right-6 flex flex-col space-y-3"
        >
          <Button
            size="sm"
            onClick={() => setShowElementsLibrary(!showElementsLibrary)}
            className={`${showElementsLibrary ? 'bg-blue-500' : 'bg-gray-600'} shadow-lg`}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => setCurrentView('template')}
            className="bg-purple-500 shadow-lg"
          >
            <Palette className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => handleSavePresentation(currentSlides)}
            className="bg-green-500 shadow-lg"
          >
            <Save className="w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </div>
  )
}