export interface TemplateSlide {
  id: string
  title: string
  layout: 'title' | 'content' | 'comparison' | 'chart' | 'image' | 'executive_summary' | 'section_header' | 'blank'
  elements: Array<{
    id: string
    type: 'text' | 'image' | 'chart' | 'table' | 'shape' | 'icon'
    position: { x: number; y: number; width: number; height: number; rotation: number }
    style: { [key: string]: any }
    content: any
    layer: number
    locked: boolean
    hidden: boolean
    animations: any[]
  }>
  template: string
  notes: string
  duration: number
  animations: any[]
  transition?: any
  background: {
    color?: string
    image?: string
    gradient?: string
  }
  locked: boolean
  hidden: boolean
}

export interface PresentationTemplate {
  id: string
  name: string
  category: string
  description: string
  slides: TemplateSlide[]
  theme: {
    primaryColor: string
    secondaryColor: string
    backgroundColor: string
    headingFont: string
    bodyFont: string
    logoUrl?: string
  }
  metadata: {
    author: string
    version: string
    tags: string[]
    isPremium: boolean
    rating: number
    downloads: number
  }
}

import { ENHANCED_TEMPLATES } from './enhanced-templates'

export const TEMPLATE_DEFINITIONS: Record<string, PresentationTemplate> = {
  ...ENHANCED_TEMPLATES,
  'modern-analytics': {
    id: 'modern-analytics',
    name: 'Modern Analytics Dashboard',
    category: 'analytics',
    description: 'Professional analytics presentation with modern charts and data visualizations',
    slides: [
      {
        id: 'title-slide',
        title: 'Analytics Dashboard',
        layout: 'title',
        elements: [
          {
            id: 'main-title',
            type: 'text',
            position: { x: 60, y: 120, width: 600, height: 80, rotation: 0 },
            style: {
              fontSize: 42,
              fontFamily: 'Inter',
              fontWeight: 'bold',
              color: '#1E40AF',
              textAlign: 'center'
            },
            content: 'Analytics Dashboard',
            layer: 1,
            locked: false,
            hidden: false,
            animations: []
          },
          {
            id: 'subtitle',
            type: 'text',
            position: { x: 60, y: 220, width: 600, height: 40, rotation: 0 },
            style: {
              fontSize: 24,
              fontFamily: 'Inter',
              fontWeight: 'normal',
              color: '#374151',
              textAlign: 'center'
            },
            content: 'Data-Driven Insights for Strategic Decisions',
            layer: 1,
            locked: false,
            hidden: false,
            animations: []
          }
        ],
        template: 'modern-analytics',
        notes: '',
        duration: 5,
        animations: [],
        background: { color: '#FFFFFF' },
        locked: false,
        hidden: false
      },
      {
        id: 'kpi-slide',
        title: 'Key Performance Indicators',
        layout: 'chart',
        elements: [
          {
            id: 'slide-title',
            type: 'text',
            position: { x: 60, y: 40, width: 600, height: 50, rotation: 0 },
            style: {
              fontSize: 32,
              fontFamily: 'Inter',
              fontWeight: 'bold',
              color: '#1E40AF',
              textAlign: 'left'
            },
            content: 'Key Performance Indicators',
            layer: 1,
            locked: false,
            hidden: false,
            animations: []
          },
          {
            id: 'main-chart',
            type: 'chart',
            position: { x: 60, y: 120, width: 400, height: 250, rotation: 0 },
            style: {},
            content: {
              type: 'bar',
              data: [
                { name: 'Q1', value: 85, target: 80 },
                { name: 'Q2', value: 92, target: 85 },
                { name: 'Q3', value: 88, target: 90 },
                { name: 'Q4', value: 96, target: 95 }
              ],
              colors: ['#3B82F6', '#10B981'],
              title: 'Quarterly Performance'
            },
            layer: 1,
            locked: false,
            hidden: false,
            animations: []
          },
          {
            id: 'metrics-text',
            type: 'text',
            position: { x: 500, y: 120, width: 160, height: 250, rotation: 0 },
            style: {
              fontSize: 16,
              fontFamily: 'Inter',
              fontWeight: 'normal',
              color: '#374151',
              textAlign: 'left'
            },
            content: '• Revenue Growth: +24%\n• Customer Satisfaction: 4.8/5\n• Market Share: +12%\n• Operational Efficiency: +18%\n• Team Productivity: +15%',
            layer: 1,
            locked: false,
            hidden: false,
            animations: []
          }
        ],
        template: 'modern-analytics',
        notes: 'Present the key metrics with supporting data visualization',
        duration: 8,
        animations: [],
        background: { color: '#FFFFFF' },
        locked: false,
        hidden: false
      },
      {
        id: 'trends-slide',
        title: 'Market Trends Analysis',
        layout: 'chart',
        elements: [
          {
            id: 'slide-title',
            type: 'text',
            position: { x: 60, y: 40, width: 600, height: 50, rotation: 0 },
            style: {
              fontSize: 32,
              fontFamily: 'Inter',
              fontWeight: 'bold',
              color: '#1E40AF',
              textAlign: 'left'
            },
            content: 'Market Trends Analysis',
            layer: 1,
            locked: false,
            hidden: false,
            animations: []
          },
          {
            id: 'trend-chart',
            type: 'chart',
            position: { x: 60, y: 120, width: 600, height: 250, rotation: 0 },
            style: {},
            content: {
              type: 'line',
              data: [
                { month: 'Jan', revenue: 120, competitors: 115, industry: 118 },
                { month: 'Feb', revenue: 125, competitors: 118, industry: 120 },
                { month: 'Mar', revenue: 132, competitors: 120, industry: 122 },
                { month: 'Apr', revenue: 138, competitors: 122, industry: 125 },
                { month: 'May', revenue: 145, competitors: 125, industry: 128 },
                { month: 'Jun', revenue: 152, competitors: 128, industry: 130 }
              ],
              colors: ['#3B82F6', '#EF4444', '#10B981'],
              title: 'Performance Comparison'
            },
            layer: 1,
            locked: false,
            hidden: false,
            animations: []
          }
        ],
        template: 'modern-analytics',
        notes: 'Compare performance against market trends and competitors',
        duration: 10,
        animations: [],
        background: { color: '#FFFFFF' },
        locked: false,
        hidden: false
      }
    ],
    theme: {
      primaryColor: '#1E40AF',
      secondaryColor: '#3B82F6',
      backgroundColor: '#FFFFFF',
      headingFont: 'Inter',
      bodyFont: 'Inter'
    },
    metadata: {
      author: 'AEDRIN Team',
      version: '1.0',
      tags: ['analytics', 'data', 'modern', 'charts'],
      isPremium: false,
      rating: 4.8,
      downloads: 1247
    }
  },

  'business-proposal': {
    id: 'business-proposal',
    name: 'Executive Business Proposal',
    category: 'business',
    description: 'Clean and professional template for business proposals and pitches',
    slides: [
      {
        id: 'cover-slide',
        title: 'Business Proposal',
        layout: 'title',
        elements: [
          {
            id: 'main-title',
            type: 'text',
            position: { x: 60, y: 140, width: 600, height: 60, rotation: 0 },
            style: {
              fontSize: 36,
              fontFamily: 'Arial',
              fontWeight: 'bold',
              color: '#1F2937',
              textAlign: 'center'
            },
            content: 'Business Proposal',
            layer: 1,
            locked: false,
            hidden: false,
            animations: []
          },
          {
            id: 'company-info',
            type: 'text',
            position: { x: 60, y: 220, width: 600, height: 80, rotation: 0 },
            style: {
              fontSize: 18,
              fontFamily: 'Arial',
              fontWeight: 'normal',
              color: '#6B7280',
              textAlign: 'center'
            },
            content: 'Presented by: [Your Company]\nDate: [Current Date]\nPrepared for: [Client Name]',
            layer: 1,
            locked: false,
            hidden: false,
            animations: []
          }
        ],
        template: 'business-proposal',
        notes: '',
        duration: 5,
        animations: [],
        background: { color: '#FFFFFF' },
        locked: false,
        hidden: false
      },
      {
        id: 'executive-summary',
        title: 'Executive Summary',
        layout: 'content',
        elements: [
          {
            id: 'slide-title',
            type: 'text',
            position: { x: 60, y: 40, width: 600, height: 50, rotation: 0 },
            style: {
              fontSize: 32,
              fontFamily: 'Arial',
              fontWeight: 'bold',
              color: '#1F2937',
              textAlign: 'left'
            },
            content: 'Executive Summary',
            layer: 1,
            locked: false,
            hidden: false,
            animations: []
          },
          {
            id: 'summary-content',
            type: 'text',
            position: { x: 60, y: 120, width: 600, height: 250, rotation: 0 },
            style: {
              fontSize: 18,
              fontFamily: 'Arial',
              fontWeight: 'normal',
              color: '#374151',
              textAlign: 'left'
            },
            content: '• Project Overview: [Brief description of the proposal]\n\n• Key Objectives:\n  - Objective 1: [Primary goal]\n  - Objective 2: [Secondary goal]\n  - Objective 3: [Additional goal]\n\n• Expected Outcomes:\n  - Deliverable 1: [Key deliverable]\n  - Deliverable 2: [Supporting deliverable]\n\n• Timeline: [Project duration]\n• Investment: [Budget range]',
            layer: 1,
            locked: false,
            hidden: false,
            animations: []
          }
        ],
        template: 'business-proposal',
        notes: 'Provide a high-level overview of the proposal',
        duration: 8,
        animations: [],
        background: { color: '#FFFFFF' },
        locked: false,
        hidden: false
      },
      {
        id: 'solution-details',
        title: 'Proposed Solution',
        layout: 'content',
        elements: [
          {
            id: 'slide-title',
            type: 'text',
            position: { x: 60, y: 40, width: 600, height: 50, rotation: 0 },
            style: {
              fontSize: 32,
              fontFamily: 'Arial',
              fontWeight: 'bold',
              color: '#1F2937',
              textAlign: 'left'
            },
            content: 'Proposed Solution',
            layer: 1,
            locked: false,
            hidden: false,
            animations: []
          },
          {
            id: 'solution-content',
            type: 'text',
            position: { x: 60, y: 120, width: 280, height: 250, rotation: 0 },
            style: {
              fontSize: 16,
              fontFamily: 'Arial',
              fontWeight: 'normal',
              color: '#374151',
              textAlign: 'left'
            },
            content: 'OUR APPROACH:\n\n1. Discovery Phase\n   • Stakeholder interviews\n   • Requirements analysis\n   • Current state assessment\n\n2. Design & Planning\n   • Solution architecture\n   • Implementation roadmap\n   • Risk mitigation strategy\n\n3. Execution\n   • Agile development\n   • Regular checkpoints\n   • Quality assurance',
            layer: 1,
            locked: false,
            hidden: false,
            animations: []
          },
          {
            id: 'benefits-content',
            type: 'text',
            position: { x: 380, y: 120, width: 280, height: 250, rotation: 0 },
            style: {
              fontSize: 16,
              fontFamily: 'Arial',
              fontWeight: 'normal',
              color: '#374151',
              textAlign: 'left'
            },
            content: 'KEY BENEFITS:\n\n• Increased Efficiency\n  - 40% faster processing\n  - Reduced manual effort\n\n• Cost Savings\n  - Lower operational costs\n  - Improved ROI\n\n• Enhanced Quality\n  - Better accuracy\n  - Consistent results\n\n• Scalability\n  - Future-ready solution\n  - Flexible architecture',
            layer: 1,
            locked: false,
            hidden: false,
            animations: []
          }
        ],
        template: 'business-proposal',
        notes: 'Detail the proposed solution and its benefits',
        duration: 10,
        animations: [],
        background: { color: '#FFFFFF' },
        locked: false,
        hidden: false
      }
    ],
    theme: {
      primaryColor: '#1F2937',
      secondaryColor: '#374151',
      backgroundColor: '#FFFFFF',
      headingFont: 'Arial',
      bodyFont: 'Arial'
    },
    metadata: {
      author: 'Design Studio',
      version: '1.0',
      tags: ['business', 'proposal', 'executive', 'professional'],
      isPremium: true,
      rating: 4.9,
      downloads: 2156
    }
  },

  'startup-pitch': {
    id: 'startup-pitch',
    name: 'Startup Pitch Deck',
    category: 'business',
    description: 'Perfect for startups looking to present to investors',
    slides: [
      {
        id: 'pitch-title',
        title: 'Startup Pitch',
        layout: 'title',
        elements: [
          {
            id: 'company-name',
            type: 'text',
            position: { x: 60, y: 120, width: 600, height: 80, rotation: 0 },
            style: {
              fontSize: 48,
              fontFamily: 'Inter',
              fontWeight: 'bold',
              color: '#7C3AED',
              textAlign: 'center'
            },
            content: '[Company Name]',
            layer: 1,
            locked: false,
            hidden: false,
            animations: []
          },
          {
            id: 'tagline',
            type: 'text',
            position: { x: 60, y: 220, width: 600, height: 40, rotation: 0 },
            style: {
              fontSize: 24,
              fontFamily: 'Inter',
              fontWeight: 'normal',
              color: '#1F2937',
              textAlign: 'center'
            },
            content: '[Your compelling tagline]',
            layer: 1,
            locked: false,
            hidden: false,
            animations: []
          }
        ],
        template: 'startup-pitch',
        notes: '',
        duration: 3,
        animations: [],
        background: { color: '#FFFFFF' },
        locked: false,
        hidden: false
      },
      {
        id: 'problem-slide',
        title: 'The Problem',
        layout: 'content',
        elements: [
          {
            id: 'slide-title',
            type: 'text',
            position: { x: 60, y: 40, width: 600, height: 50, rotation: 0 },
            style: {
              fontSize: 32,
              fontFamily: 'Inter',
              fontWeight: 'bold',
              color: '#7C3AED',
              textAlign: 'left'
            },
            content: 'The Problem',
            layer: 1,
            locked: false,
            hidden: false,
            animations: []
          },
          {
            id: 'problem-content',
            type: 'text',
            position: { x: 60, y: 120, width: 600, height: 250, rotation: 0 },
            style: {
              fontSize: 20,
              fontFamily: 'Inter',
              fontWeight: 'normal',
              color: '#374151',
              textAlign: 'left'
            },
            content: '💡 What problem are you solving?\n\n• Problem Statement: [Clear, concise problem description]\n\n• Market Pain Points:\n  - Pain point 1: [Specific issue]\n  - Pain point 2: [Another challenge]\n  - Pain point 3: [Additional problem]\n\n• Impact: [Who is affected and how]\n\n• Current Solutions: [Why existing solutions fall short]',
            layer: 1,
            locked: false,
            hidden: false,
            animations: []
          }
        ],
        template: 'startup-pitch',
        notes: 'Clearly articulate the problem you are solving',
        duration: 8,
        animations: [],
        background: { color: '#FFFFFF' },
        locked: false,
        hidden: false
      },
      {
        id: 'solution-slide',
        title: 'Our Solution',
        layout: 'content',
        elements: [
          {
            id: 'slide-title',
            type: 'text',
            position: { x: 60, y: 40, width: 600, height: 50, rotation: 0 },
            style: {
              fontSize: 32,
              fontFamily: 'Inter',
              fontWeight: 'bold',
              color: '#7C3AED',
              textAlign: 'left'
            },
            content: 'Our Solution',
            layer: 1,
            locked: false,
            hidden: false,
            animations: []
          },
          {
            id: 'solution-content',
            type: 'text',
            position: { x: 60, y: 120, width: 600, height: 250, rotation: 0 },
            style: {
              fontSize: 20,
              fontFamily: 'Inter',
              fontWeight: 'normal',
              color: '#374151',
              textAlign: 'left'
            },
            content: '🚀 How we solve the problem:\n\n• Core Solution: [Your unique approach]\n\n• Key Features:\n  - Feature 1: [Primary capability]\n  - Feature 2: [Supporting feature]\n  - Feature 3: [Differentiating feature]\n\n• Unique Value Proposition:\n  [What makes your solution different and better]\n\n• Competitive Advantage:\n  [Why you will win in the market]',
            layer: 1,
            locked: false,
            hidden: false,
            animations: []
          }
        ],
        template: 'startup-pitch',
        notes: 'Present your solution and unique value proposition',
        duration: 10,
        animations: [],
        background: { color: '#FFFFFF' },
        locked: false,
        hidden: false
      }
    ],
    theme: {
      primaryColor: '#7C3AED',
      secondaryColor: '#A855F7',
      backgroundColor: '#FFFFFF',
      headingFont: 'Inter',
      bodyFont: 'Inter'
    },
    metadata: {
      author: 'Pitch Perfect',
      version: '1.0',
      tags: ['startup', 'pitch', 'investor', 'funding'],
      isPremium: true,
      rating: 4.6,
      downloads: 1823
    }
  }
}

export function applyTemplateToPresentation(
  currentPresentation: any,
  template: PresentationTemplate,
  replaceAll: boolean = false
): any {
  if (replaceAll) {
    // Replace entire presentation with template
    return {
      ...currentPresentation,
      title: template.name,
      slides: template.slides.map((slide, index) => ({
        ...slide,
        id: `slide-${Date.now()}-${index}`,
        elements: slide.elements.map((element, elemIndex) => ({
          ...element,
          id: `element-${Date.now()}-${elemIndex}`
        }))
      })),
      theme: template.theme,
      lastModified: new Date()
    }
  } else {
    // Add template slides to current presentation
    const newSlides = template.slides.map((slide, index) => ({
      ...slide,
      id: `slide-${Date.now()}-${index}`,
      elements: slide.elements.map((element, elemIndex) => ({
        ...element,
        id: `element-${Date.now()}-${elemIndex}`
      }))
    }))

    return {
      ...currentPresentation,
      slides: [...currentPresentation.slides, ...newSlides],
      theme: {
        ...currentPresentation.theme,
        ...template.theme
      },
      lastModified: new Date()
    }
  }
}

export function createBlankSlideFromTemplate(template: string = 'blank'): TemplateSlide {
  const slideId = `slide-${Date.now()}`
  
  return {
    id: slideId,
    title: 'New Slide',
    layout: 'blank',
    elements: [],
    template: template,
    notes: '',
    duration: 5,
    animations: [],
    background: { color: '#FFFFFF' },
    locked: false,
    hidden: false
  }
}