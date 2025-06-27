import { NextRequest, NextResponse } from 'next/server'
import { AuthSystem } from '@/lib/auth/auth-system'
import { PowerPointExporter, exportPresentationToPowerPoint } from '@/lib/export/powerpoint-exporter'
import PDFDocument from 'pdfkit'

interface ExportRequest {
  format: 'pptx' | 'pdf'
  size: '16:9' | '4:3' | 'A4'
  theme?: {
    primaryColor: string
    secondaryColor: string
    backgroundColor: string
    headingFont: string
    bodyFont: string
    logoUrl?: string
  }
}

interface WorldClassSlide {
  id: string
  title: string
  layout: 'title' | 'content' | 'comparison' | 'chart' | 'image' | 'executive_summary'
  elements: Array<{
    id: string
    type: 'text' | 'chart' | 'image' | 'shape' | 'data_table'
    x: number
    y: number
    width: number
    height: number
    content?: string
    fontSize?: number
    fontFamily?: string
    fontWeight?: string
    color?: string
    textAlign?: 'left' | 'center' | 'right'
    chartConfig?: {
      type: 'line' | 'bar' | 'pie' | 'scatter' | 'area'
      data: any[]
      showLegend: boolean
      colors: string[]
      title?: string
    }
    src?: string
    backgroundColor?: string
    borderColor?: string
    borderWidth?: number
    editable?: boolean
    dataSource?: string
  }>
  backgroundColor?: string
  notes?: string
  slideNumber?: number
}

// Standard presentation sizes with optimal dimensions
const PRESENTATION_SIZES = {
  '16:9': { width: 1920, height: 1080, name: 'Widescreen (16:9)' },
  '4:3': { width: 1024, height: 768, name: 'Standard (4:3)' },
  'A4': { width: 794, height: 1123, name: 'A4 Portrait' }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // Handle demo decks without authentication
    const isDemo = id.startsWith('demo-deck-')
    let user = null
    
    if (!isDemo) {
      user = await AuthSystem.getCurrentUser()
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    } else {
      // For demo users, create a mock user
      user = { name: 'Demo User', email: 'demo@easydecks.ai', id: 'demo' }
    }

    const body = await request.json()
    const { format, size, theme, slides }: ExportRequest & { slides?: any[] } = body
    const presentationId = id

    // Validate inputs
    if (!format || !['pptx', 'pdf'].includes(format)) {
      return NextResponse.json({ error: 'Invalid format. Must be pptx or pdf' }, { status: 400 })
    }

    if (!size || !Object.keys(PRESENTATION_SIZES).includes(size)) {
      return NextResponse.json({ error: 'Invalid size. Must be 16:9, 4:3, or A4' }, { status: 400 })
    }

    // Get presentation data (use provided slides or fetch from database/memory)
    let presentation
    if (slides) {
      presentation = await createPresentationFromSlides(slides, presentationId, user)
    } else if (isDemo) {
      presentation = await getDemoPresentationData(presentationId)
    } else {
      presentation = await getPresentationData(presentationId, user.id)
    }
    
    if (!presentation) {
      return NextResponse.json({ error: 'Presentation not found' }, { status: 404 })
    }

    // Apply size-specific adjustments
    const sizedPresentation = adjustPresentationForSize(presentation, size)
    
    // Apply theme if provided
    if (theme) {
      sizedPresentation.theme = {
        ...sizedPresentation.theme,
        ...theme
      }
    }

    // Export based on format
    let blob: Blob
    let filename: string
    let mimeType: string

    if (format === 'pptx') {
      blob = await exportPresentationToPowerPoint(sizedPresentation)
      filename = `${presentation.title}_${size}.pptx`
      mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    } else {
      blob = await exportToPDF(sizedPresentation, size)
      filename = `${presentation.title}_${size}.pdf`
      mimeType = 'application/pdf'
    }

    // Convert blob to buffer for response
    const buffer = Buffer.from(await blob.arrayBuffer())

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString()
      }
    })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export presentation' },
      { status: 500 }
    )
  }
}

async function createPresentationFromSlides(slides: any[], presentationId: string, user: any) {
  // Convert provided slides to presentation format
  return {
    id: presentationId,
    title: `Presentation ${presentationId}`,
    author: user.name || user.email || 'EasyDecks.ai User',
    company: 'EasyDecks.ai Analytics',
    subject: 'Generated presentation',
    slides: slides.map((slide, index) => ({
      id: slide.id || `slide-${index + 1}`,
      title: slide.title || `Slide ${index + 1}`,
      layout: slide.layout || 'content',
      backgroundColor: slide.backgroundColor || '#FFFFFF',
      elements: slide.elements || [],
      notes: slide.notes || '',
      slideNumber: index + 1
    })),
    theme: {
      primaryColor: '#1E40AF',
      secondaryColor: '#7C3AED', 
      backgroundColor: '#FFFFFF',
      headingFont: 'Arial',
      bodyFont: 'Arial'
    }
  }
}

async function getPresentationData(id: string, userId: number) {
  // Mock world-class presentation data
  // In production, this would fetch from database
  const mockPresentation = {
    id: id,
    title: 'Q4 2024 Business Analytics Report',
    author: 'Demo User',
    company: 'EasyDecks.ai Analytics',
    subject: 'Executive Business Intelligence Report',
    slides: [
      {
        id: 'slide-1',
        title: 'Executive Summary',
        layout: 'title' as const,
        elements: [
          {
            id: 'title',
            type: 'text' as const,
            x: 100, y: 200, width: 800, height: 100,
            content: 'Q4 2024 Business Analytics Report',
            fontSize: 48, fontWeight: 'bold', textAlign: 'center' as const
          },
          {
            id: 'subtitle',
            type: 'text' as const,
            x: 100, y: 320, width: 800, height: 60,
            content: 'Data-Driven Insights for Strategic Decision Making',
            fontSize: 24, textAlign: 'center' as const
          }
        ]
      },
      {
        id: 'slide-2',
        title: 'Key Performance Indicators',
        layout: 'content' as const,
        elements: [
          {
            id: 'kpi-chart',
            type: 'chart' as const,
            x: 100, y: 150, width: 600, height: 400,
            chartConfig: {
              type: 'bar' as const,
              data: [
                { period: 'Q1', revenue: 1250000, growth: 12 },
                { period: 'Q2', revenue: 1380000, growth: 18 },
                { period: 'Q3', revenue: 1420000, growth: 15 },
                { period: 'Q4', revenue: 1650000, growth: 22 }
              ],
              showLegend: true,
              colors: ['#3B82F6', '#10B981'],
              title: 'Quarterly Revenue Growth'
            }
          },
          {
            id: 'insights-text',
            type: 'text' as const,
            x: 720, y: 150, width: 300, height: 400,
            content: '• Q4 revenue exceeded targets by 22%\n• Customer acquisition increased 35%\n• Market share grew to 18.5%\n• Operational efficiency improved 28%\n• Net promoter score: 72',
            fontSize: 18, fontFamily: 'Arial'
          }
        ]
      },
      {
        id: 'slide-3',
        title: 'Market Analysis & Trends',
        layout: 'chart' as const,
        elements: [
          {
            id: 'trend-chart',
            type: 'chart' as const,
            x: 50, y: 150, width: 920, height: 350,
            chartConfig: {
              type: 'line' as const,
              data: [
                { month: 'Jan', marketShare: 15.2, competitors: 18.5, industry: 16.8 },
                { month: 'Feb', marketShare: 15.8, competitors: 18.1, industry: 17.0 },
                { month: 'Mar', marketShare: 16.3, competitors: 17.9, industry: 17.2 },
                { month: 'Apr', marketShare: 16.9, competitors: 17.6, industry: 17.3 },
                { month: 'May', marketShare: 17.2, competitors: 17.4, industry: 17.4 },
                { month: 'Jun', marketShare: 17.8, competitors: 17.1, industry: 17.6 }
              ],
              showLegend: true,
              colors: ['#6366F1', '#EF4444', '#10B981'],
              title: 'Market Share Progression'
            }
          }
        ]
      },
      {
        id: 'slide-4',
        title: 'Strategic Recommendations',
        layout: 'content' as const,
        elements: [
          {
            id: 'recommendations',
            type: 'text' as const,
            x: 100, y: 150, width: 820, height: 400,
            content: '1. ACCELERATE GROWTH\n   • Expand into emerging markets\n   • Increase R&D investment by 25%\n   • Launch premium product line\n\n2. OPERATIONAL EXCELLENCE\n   • Implement AI-driven automation\n   • Optimize supply chain efficiency\n   • Enhance customer support systems\n\n3. STRATEGIC PARTNERSHIPS\n   • Form alliances with industry leaders\n   • Develop ecosystem partnerships\n   • Explore acquisition opportunities',
            fontSize: 20, fontFamily: 'Arial'
          }
        ]
      }
    ],
    theme: {
      primaryColor: '#1E40AF',
      secondaryColor: '#7C3AED',
      backgroundColor: '#FFFFFF',
      headingFont: 'Arial',
      bodyFont: 'Arial'
    }
  }

  return mockPresentation
}

async function getDemoPresentationData(id: string) {
  // Try to get from global storage first
  global.demoDeckStorage = global.demoDeckStorage || new Map()
  const storedDeck = global.demoDeckStorage.get(id)
  
  if (storedDeck) {
    console.log('📊 Found demo deck in storage for export:', id)
    // Convert stored deck format to export format
    return {
      id: storedDeck.id,
      title: storedDeck.title,
      author: 'Demo User',
      company: 'EasyDecks.ai Analytics',
      subject: 'AI-Generated Demo Presentation',
      slides: storedDeck.slides.map((slide: any, index: number) => ({
        id: slide.id,
        title: slide.title || `Slide ${index + 1}`,
        layout: mapSlideTypeToLayout(slide.type),
        backgroundColor: slide.background?.color || '#FFFFFF',
        elements: slide.elements?.map((element: any) => ({
          id: element.id,
          type: element.type,
          x: element.position.x,
          y: element.position.y,
          width: element.position.width,
          height: element.position.height,
          content: element.content?.text || element.content?.html || '',
          fontSize: element.style?.fontSize,
          fontFamily: element.style?.fontFamily,
          fontWeight: element.style?.fontWeight,
          color: element.style?.color,
          textAlign: element.style?.textAlign,
          chartConfig: element.content?.type ? {
            type: element.content.type,
            data: element.content.data,
            title: element.content.title,
            colors: element.content.colors,
            showLegend: element.content.showLegend
          } : undefined,
          backgroundColor: element.style?.backgroundColor,
          borderColor: element.style?.borderColor,
          borderWidth: element.style?.borderWidth
        })) || [],
        notes: slide.notes || '',
        slideNumber: index + 1
      })),
      theme: storedDeck.theme || {
        primaryColor: '#2563eb',
        secondaryColor: '#64748b',
        backgroundColor: '#ffffff',
        headingFont: 'Inter',
        bodyFont: 'Inter'
      }
    }
  }
  
  // Fallback if not found in storage
  return null
}

function mapSlideTypeToLayout(slideType: string) {
  switch (slideType) {
    case 'executive_summary':
    case 'title':
      return 'title'
    case 'key_insights':
    case 'recommendations':
      return 'content'
    case 'detailed_analysis':
    case 'trends_analysis':
      return 'chart'
    default:
      return 'content'
  }
}

function adjustPresentationForSize(presentation: any, size: keyof typeof PRESENTATION_SIZES) {
  const dimensions = PRESENTATION_SIZES[size]
  const scaleFactor = dimensions.width / 1000 // Base scale from 1000px width
  
  // Clone presentation and adjust element positions/sizes
  const adjustedPresentation = JSON.parse(JSON.stringify(presentation))
  
  adjustedPresentation.slides.forEach((slide: WorldClassSlide) => {
    slide.elements.forEach(element => {
      element.x = Math.round(element.x * scaleFactor)
      element.y = Math.round(element.y * scaleFactor)
      element.width = Math.round(element.width * scaleFactor)
      element.height = Math.round(element.height * scaleFactor)
      
      if (element.fontSize) {
        element.fontSize = Math.round(element.fontSize * scaleFactor)
      }
    })
  })
  
  return adjustedPresentation
}

async function exportToPDF(presentation: any, size: keyof typeof PRESENTATION_SIZES): Promise<Blob> {
  const dimensions = PRESENTATION_SIZES[size]
  
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    const doc = new PDFDocument({
      size: [dimensions.width * 0.75, dimensions.height * 0.75], // Convert to points
      margin: 50
    })
    
    doc.on('data', chunk => chunks.push(chunk))
    doc.on('end', () => {
      const blob = new Blob([Buffer.concat(chunks)], { type: 'application/pdf' })
      resolve(blob)
    })
    doc.on('error', reject)
    
    // Add presentation metadata
    doc.info.Title = presentation.title
    doc.info.Author = presentation.author
    doc.info.Subject = presentation.subject || 'Generated by EasyDecks.ai'
    doc.info.Producer = 'EasyDecks.ai Analytics Platform'
    
    // Render each slide as a PDF page
    presentation.slides.forEach((slide: WorldClassSlide, index: number) => {
      if (index > 0) doc.addPage()
      
      // Add slide title
      if (slide.title && slide.layout !== 'title') {
        doc.fontSize(24).font('Helvetica-Bold')
        doc.text(slide.title, 50, 50, { width: dimensions.width * 0.75 - 100 })
      }
      
      // Add slide elements
      slide.elements.forEach(element => {
        const x = (element.x * 0.75) + 50
        const y = (element.y * 0.75) + (slide.layout === 'title' ? 50 : 100)
        
        if (element.type === 'text') {
          const fontSize = Math.max(10, (element.fontSize || 16) * 0.75)
          doc.fontSize(fontSize)
          doc.font(element.fontWeight === 'bold' ? 'Helvetica-Bold' : 'Helvetica')
          doc.text(element.content || '', x, y, {
            width: element.width * 0.75,
            align: element.textAlign || 'left'
          })
        } else if (element.type === 'chart') {
          // Add chart placeholder for PDF
          doc.rect(x, y, element.width * 0.75, element.height * 0.75)
          doc.stroke()
          doc.fontSize(14).text('Chart: ' + (element.chartConfig?.title || 'Data Visualization'), 
            x + 10, y + 10, { width: element.width * 0.75 - 20 })
        }
      })
      
      // Add page number
      doc.fontSize(10).text(`Page ${index + 1}`, 
        dimensions.width * 0.75 - 100, dimensions.height * 0.75 - 30)
    })
    
    doc.end()
  })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // Get available export options
  return NextResponse.json({
    formats: ['pptx', 'pdf'],
    sizes: Object.entries(PRESENTATION_SIZES).map(([key, value]) => ({
      id: key,
      name: value.name,
      dimensions: `${value.width}x${value.height}`
    })),
    themes: [
      { id: 'executive', name: 'Executive Blue', primaryColor: '#1E40AF', secondaryColor: '#7C3AED' },
      { id: 'modern', name: 'Modern Purple', primaryColor: '#7C3AED', secondaryColor: '#EC4899' },
      { id: 'corporate', name: 'Corporate Green', primaryColor: '#059669', secondaryColor: '#0891B2' },
      { id: 'creative', name: 'Creative Orange', primaryColor: '#EA580C', secondaryColor: '#DC2626' }
    ]
  })
}