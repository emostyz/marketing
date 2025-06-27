import { PresentationTemplate } from './template-system'

// Ultra-Modern Gradient Template
export const GRADIENT_TECH_TEMPLATE: PresentationTemplate = {
  id: 'gradient-tech',
  name: 'Gradient Tech',
  category: 'business',
  description: 'Ultra-modern gradient design perfect for tech presentations',
  slides: [
    {
      id: 'hero-slide',
      title: 'Tech Innovation',
      layout: 'title',
      elements: [
        {
          id: 'hero-title',
          type: 'text',
          position: { x: 60, y: 150, width: 840, height: 120, rotation: 0 },
          style: {
            fontSize: 64,
            fontFamily: 'Inter',
            fontWeight: '900',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center',
            letterSpacing: '-0.02em'
          },
          content: 'The Future of Innovation',
          layer: 1,
          locked: false,
          hidden: false,
          animations: []
        },
        {
          id: 'hero-subtitle',
          type: 'text',
          position: { x: 60, y: 290, width: 840, height: 60, rotation: 0 },
          style: {
            fontSize: 24,
            fontFamily: 'Inter',
            fontWeight: '400',
            color: '#64748B',
            textAlign: 'center',
            opacity: 0.8
          },
          content: 'Transforming ideas into reality through technology',
          layer: 1,
          locked: false,
          hidden: false,
          animations: []
        },
        {
          id: 'hero-accent',
          type: 'shape',
          position: { x: 300, y: 400, width: 360, height: 8, rotation: 0 },
          style: {
            background: 'linear-gradient(90deg, #667eea, #764ba2)',
            borderRadius: 4,
            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
          },
          content: { shape: 'rectangle' },
          layer: 0,
          locked: false,
          hidden: false,
          animations: []
        }
      ],
      template: 'gradient-tech',
      notes: '',
      duration: 5,
      animations: [],
      background: { 
        color: '#FFFFFF',
        image: 'radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.05) 0%, transparent 50%)'
      },
      locked: false,
      hidden: false
    },
    {
      id: 'stats-slide',
      title: 'Impact Metrics',
      layout: 'chart',
      elements: [
        {
          id: 'stats-title',
          type: 'text',
          position: { x: 60, y: 60, width: 840, height: 80, rotation: 0 },
          style: {
            fontSize: 48,
            fontFamily: 'Inter',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center'
          },
          content: 'Impact Metrics',
          layer: 1,
          locked: false,
          hidden: false,
          animations: []
        },
        {
          id: 'metric-1',
          type: 'text',
          position: { x: 80, y: 180, width: 200, height: 140, rotation: 0 },
          style: {
            fontSize: 16,
            fontFamily: 'Inter',
            fontWeight: '500',
            color: '#1E293B',
            textAlign: 'center',
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E2E8F0'
          },
          content: '250M+\n\nUsers Reached\n\nGlobal impact across 50+ countries',
          layer: 2,
          locked: false,
          hidden: false,
          animations: []
        },
        {
          id: 'metric-2',
          type: 'text',
          position: { x: 320, y: 180, width: 200, height: 140, rotation: 0 },
          style: {
            fontSize: 16,
            fontFamily: 'Inter',
            fontWeight: '500',
            color: '#1E293B',
            textAlign: 'center',
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E2E8F0'
          },
          content: '98.5%\n\nUptime\n\nReliable infrastructure performance',
          layer: 2,
          locked: false,
          hidden: false,
          animations: []
        },
        {
          id: 'metric-3',
          type: 'text',
          position: { x: 560, y: 180, width: 200, height: 140, rotation: 0 },
          style: {
            fontSize: 16,
            fontFamily: 'Inter',
            fontWeight: '500',
            color: '#1E293B',
            textAlign: 'center',
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E2E8F0'
          },
          content: '$2.5B\n\nRevenue\n\nGenerated for our partners',
          layer: 2,
          locked: false,
          hidden: false,
          animations: []
        },
        {
          id: 'chart-visualization',
          type: 'chart',
          position: { x: 80, y: 360, width: 680, height: 140, rotation: 0 },
          style: {
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 20,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E2E8F0'
          },
          content: {
            type: 'bar',
            data: [
              { name: 'Q1', growth: 85, revenue: 120 },
              { name: 'Q2', growth: 125, revenue: 180 },
              { name: 'Q3', growth: 165, revenue: 240 },
              { name: 'Q4', growth: 210, revenue: 320 }
            ],
            colors: ['#667eea', '#764ba2'],
            title: 'Quarterly Growth Trajectory'
          },
          layer: 1,
          locked: false,
          hidden: false,
          animations: []
        }
      ],
      template: 'gradient-tech',
      notes: 'Showcase key performance metrics with visual impact',
      duration: 10,
      animations: [],
      background: { 
        color: '#F8FAFC',
        image: 'radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.03) 0%, transparent 50%)'
      },
      locked: false,
      hidden: false
    }
  ],
  theme: {
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
    backgroundColor: '#FFFFFF',
    headingFont: 'Inter',
    bodyFont: 'Inter'
  },
  metadata: {
    author: 'EasyDecks.ai Design Team',
    version: '2.0',
    tags: ['modern', 'gradient', 'tech', 'business'],
    isPremium: true,
    rating: 4.9,
    downloads: 3247
  }
}

// Elegant Minimal Template
export const ELEGANT_MINIMAL_TEMPLATE: PresentationTemplate = {
  id: 'elegant-minimal',
  name: 'Elegant Minimal',
  category: 'business',
  description: 'Clean, sophisticated design with perfect typography',
  slides: [
    {
      id: 'minimal-title',
      title: 'Elegant Presentation',
      layout: 'title',
      elements: [
        {
          id: 'main-heading',
          type: 'text',
          position: { x: 120, y: 180, width: 720, height: 100, rotation: 0 },
          style: {
            fontSize: 56,
            fontFamily: 'Playfair Display',
            fontWeight: '700',
            color: '#0F172A',
            textAlign: 'center',
            letterSpacing: '-0.01em',
            lineHeight: 1.1
          },
          content: 'Elegant Simplicity',
          layer: 1,
          locked: false,
          hidden: false,
          animations: []
        },
        {
          id: 'elegant-line',
          type: 'shape',
          position: { x: 380, y: 300, width: 200, height: 2, rotation: 0 },
          style: {
            backgroundColor: '#0F172A',
            borderRadius: 1
          },
          content: { shape: 'rectangle' },
          layer: 0,
          locked: false,
          hidden: false,
          animations: []
        },
        {
          id: 'subtitle-elegant',
          type: 'text',
          position: { x: 120, y: 340, width: 720, height: 50, rotation: 0 },
          style: {
            fontSize: 20,
            fontFamily: 'Inter',
            fontWeight: '400',
            color: '#64748B',
            textAlign: 'center',
            letterSpacing: '0.01em'
          },
          content: 'Where form meets function in perfect harmony',
          layer: 1,
          locked: false,
          hidden: false,
          animations: []
        }
      ],
      template: 'elegant-minimal',
      notes: '',
      duration: 5,
      animations: [],
      background: { color: '#FFFFFF' },
      locked: false,
      hidden: false
    },
    {
      id: 'content-slide',
      title: 'Key Insights',
      layout: 'content',
      elements: [
        {
          id: 'content-title',
          type: 'text',
          position: { x: 80, y: 80, width: 800, height: 60, rotation: 0 },
          style: {
            fontSize: 40,
            fontFamily: 'Playfair Display',
            fontWeight: '600',
            color: '#0F172A',
            textAlign: 'left'
          },
          content: 'Key Insights',
          layer: 1,
          locked: false,
          hidden: false,
          animations: []
        },
        {
          id: 'insight-1',
          type: 'text',
          position: { x: 80, y: 180, width: 360, height: 280, rotation: 0 },
          style: {
            fontSize: 18,
            fontFamily: 'Inter',
            fontWeight: '400',
            color: '#334155',
            textAlign: 'left',
            lineHeight: 1.6,
            backgroundColor: '#F8FAFC',
            borderRadius: 12,
            padding: 32,
            border: '1px solid #E2E8F0'
          },
          content: 'Design Philosophy\n\nOur approach emphasizes clarity, purpose, and emotional resonance. Every element serves a specific function while contributing to the overall aesthetic harmony.\n\nKey principles:\n• Intentional whitespace\n• Thoughtful typography\n• Purposeful color choices',
          layer: 1,
          locked: false,
          hidden: false,
          animations: []
        },
        {
          id: 'insight-2',
          type: 'text',
          position: { x: 480, y: 180, width: 360, height: 280, rotation: 0 },
          style: {
            fontSize: 18,
            fontFamily: 'Inter',
            fontWeight: '400',
            color: '#334155',
            textAlign: 'left',
            lineHeight: 1.6,
            backgroundColor: '#F1F5F9',
            borderRadius: 12,
            padding: 32,
            border: '1px solid #CBD5E1'
          },
          content: 'User Experience\n\nEvery interaction is crafted to feel natural and intuitive. We believe that the best designs are invisible – they simply work.\n\nCore values:\n• Accessibility first\n• Performance optimized\n• Emotionally engaging',
          layer: 1,
          locked: false,
          hidden: false,
          animations: []
        }
      ],
      template: 'elegant-minimal',
      notes: 'Present key insights with balanced layout',
      duration: 8,
      animations: [],
      background: { color: '#FFFFFF' },
      locked: false,
      hidden: false
    }
  ],
  theme: {
    primaryColor: '#0F172A',
    secondaryColor: '#64748B',
    backgroundColor: '#FFFFFF',
    headingFont: 'Playfair Display',
    bodyFont: 'Inter'
  },
  metadata: {
    author: 'Design Studio',
    version: '1.5',
    tags: ['minimal', 'elegant', 'clean', 'typography'],
    isPremium: false,
    rating: 4.8,
    downloads: 2156
  }
}

// Creative Portfolio Template
export const CREATIVE_PORTFOLIO_TEMPLATE: PresentationTemplate = {
  id: 'creative-portfolio',
  name: 'Creative Portfolio',
  category: 'creative',
  description: 'Bold, artistic design perfect for showcasing creative work',
  slides: [
    {
      id: 'portfolio-hero',
      title: 'Creative Portfolio',
      layout: 'title',
      elements: [
        {
          id: 'creative-bg-shape-1',
          type: 'shape',
          position: { x: 0, y: 0, width: 400, height: 540, rotation: 0 },
          style: {
            background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
            borderRadius: 0
          },
          content: { shape: 'rectangle' },
          layer: 0,
          locked: false,
          hidden: false,
          animations: []
        },
        {
          id: 'creative-bg-shape-2',
          type: 'shape',
          position: { x: 600, y: 200, width: 360, height: 340, rotation: 15 },
          style: {
            background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            borderRadius: 20,
            opacity: 0.8
          },
          content: { shape: 'rectangle' },
          layer: 0,
          locked: false,
          hidden: false,
          animations: []
        },
        {
          id: 'portfolio-title',
          type: 'text',
          position: { x: 420, y: 160, width: 500, height: 120, rotation: 0 },
          style: {
            fontSize: 64,
            fontFamily: 'Montserrat',
            fontWeight: '900',
            color: '#FFFFFF',
            textAlign: 'left',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            letterSpacing: '-0.02em'
          },
          content: 'Creative\nPortfolio',
          layer: 2,
          locked: false,
          hidden: false,
          animations: []
        },
        {
          id: 'portfolio-subtitle',
          type: 'text',
          position: { x: 420, y: 300, width: 400, height: 60, rotation: 0 },
          style: {
            fontSize: 22,
            fontFamily: 'Inter',
            fontWeight: '500',
            color: '#FFFFFF',
            textAlign: 'left',
            opacity: 0.9
          },
          content: 'Bringing ideas to life through design',
          layer: 2,
          locked: false,
          hidden: false,
          animations: []
        }
      ],
      template: 'creative-portfolio',
      notes: '',
      duration: 5,
      animations: [],
      background: { color: '#F8FAFC' },
      locked: false,
      hidden: false
    },
    {
      id: 'work-showcase',
      title: 'Featured Work',
      layout: 'image',
      elements: [
        {
          id: 'showcase-title',
          type: 'text',
          position: { x: 80, y: 60, width: 800, height: 70, rotation: 0 },
          style: {
            fontSize: 42,
            fontFamily: 'Montserrat',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center'
          },
          content: 'Featured Work',
          layer: 1,
          locked: false,
          hidden: false,
          animations: []
        },
        {
          id: 'project-1',
          type: 'image',
          position: { x: 80, y: 160, width: 260, height: 160, rotation: -2 },
          style: {
            borderRadius: 16,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            border: '4px solid #FFFFFF'
          },
          content: {
            src: '/api/placeholder/260/160',
            alt: 'Project 1'
          },
          layer: 1,
          locked: false,
          hidden: false,
          animations: []
        },
        {
          id: 'project-2',
          type: 'image',
          position: { x: 380, y: 180, width: 260, height: 160, rotation: 1 },
          style: {
            borderRadius: 16,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            border: '4px solid #FFFFFF'
          },
          content: {
            src: '/api/placeholder/260/160',
            alt: 'Project 2'
          },
          layer: 1,
          locked: false,
          hidden: false,
          animations: []
        },
        {
          id: 'project-3',
          type: 'image',
          position: { x: 680, y: 200, width: 260, height: 160, rotation: -1 },
          style: {
            borderRadius: 16,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            border: '4px solid #FFFFFF'
          },
          content: {
            src: '/api/placeholder/260/160',
            alt: 'Project 3'
          },
          layer: 1,
          locked: false,
          hidden: false,
          animations: []
        },
        {
          id: 'creative-accent',
          type: 'shape',
          position: { x: 200, y: 400, width: 120, height: 120, rotation: 45 },
          style: {
            background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
            borderRadius: 20,
            opacity: 0.6
          },
          content: { shape: 'rectangle' },
          layer: 0,
          locked: false,
          hidden: false,
          animations: []
        }
      ],
      template: 'creative-portfolio',
      notes: 'Showcase featured creative work with dynamic layout',
      duration: 8,
      animations: [],
      background: { color: '#FFFFFF' },
      locked: false,
      hidden: false
    }
  ],
  theme: {
    primaryColor: '#ff9a9e',
    secondaryColor: '#fecfef',
    backgroundColor: '#FFFFFF',
    headingFont: 'Montserrat',
    bodyFont: 'Inter'
  },
  metadata: {
    author: 'Creative Lab',
    version: '1.0',
    tags: ['creative', 'portfolio', 'artistic', 'colorful'],
    isPremium: false,
    rating: 4.7,
    downloads: 1834
  }
}

export const ENHANCED_TEMPLATES = {
  'gradient-tech': GRADIENT_TECH_TEMPLATE,
  'elegant-minimal': ELEGANT_MINIMAL_TEMPLATE,
  'creative-portfolio': CREATIVE_PORTFOLIO_TEMPLATE
}