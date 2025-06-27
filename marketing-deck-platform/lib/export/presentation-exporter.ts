// Professional presentation export functionality (PDF/PPTX)

import { PresentationData } from '@/lib/services/enhanced-presentation-service'

// PPTX Export using pptxgenjs
export class PPTXExporter {
  private pptx: any
  
  constructor() {
    // Dynamic import for client-side only
    if (typeof window !== 'undefined') {
      this.initializePPTX()
    }
  }

  private async initializePPTX() {
    try {
      const PptxGenJS = await import('pptxgenjs')
      this.pptx = new PptxGenJS.default()
      
      // Set presentation properties
      this.pptx.author = 'EasyDecks.ai AI Presentation Platform'
      this.pptx.company = 'EasyDecks.ai'
      this.pptx.subject = 'AI-Generated Business Presentation'
      this.pptx.title = 'Professional Business Analysis'
      
      // Set default layout (16:9 widescreen)
      this.pptx.layout = 'LAYOUT_16x9'
      
      console.log('✅ PPTX exporter initialized')
    } catch (error) {
      console.error('❌ Failed to initialize PPTX exporter:', error)
    }
  }

  async exportPresentation(presentation: PresentationData): Promise<{ success: boolean; blob?: Blob; error?: string }> {
    try {
      if (!this.pptx) {
        await this.initializePPTX()
      }

      if (!this.pptx) {
        throw new Error('PPTX library not available')
      }

      console.log(`🚀 Exporting presentation: ${presentation.title}`)

      // Create slides from presentation data
      for (const [index, slideData] of presentation.slides.entries()) {
        await this.createSlide(slideData, index + 1)
      }

      // Generate and return the PPTX file
      const pptxBlob = await this.pptx.write({ outputType: 'blob' })
      
      console.log('✅ PPTX export completed')
      return { success: true, blob: pptxBlob }

    } catch (error: any) {
      console.error('❌ PPTX export failed:', error)
      return { success: false, error: error.message }
    }
  }

  private async createSlide(slideData: any, slideNumber: number) {
    const slide = this.pptx.addSlide()
    
    // Set slide background
    slide.background = { fill: 'FFFFFF' }
    
    // Add title if present
    if (slideData.title) {
      slide.addText(slideData.title, {
        x: 0.5,
        y: 0.3,
        w: 12,
        h: 1,
        fontSize: 32,
        fontFace: 'Arial',
        color: '1a365d',
        bold: true,
        align: 'left'
      })
    }

    // Add content elements
    if (slideData.elements && slideData.elements.length > 0) {
      for (const element of slideData.elements) {
        await this.addElementToSlide(slide, element)
      }
    }

    // Add charts if present
    if (slideData.charts && slideData.charts.length > 0) {
      for (const [chartIndex, chart] of slideData.charts.entries()) {
        await this.addChartToSlide(slide, chart, chartIndex)
      }
    }

    // Add slide number
    slide.addText(`${slideNumber}`, {
      x: 12.5,
      y: 7,
      w: 1,
      h: 0.3,
      fontSize: 12,
      fontFace: 'Arial',
      color: '666666',
      align: 'right'
    })
  }

  private async addElementToSlide(slide: any, element: any) {
    if (element.type === 'text' && element.content) {
      // Convert position from pixels to inches (approximate)
      const x = (element.position?.x || 80) / 96 // 96 DPI conversion
      const y = (element.position?.y || 100) / 96
      const w = (element.size?.width || 800) / 96
      const h = (element.size?.height || 100) / 96

      slide.addText(element.content, {
        x: Math.max(0.5, x),
        y: Math.max(0.5, y),
        w: Math.min(12, w),
        h: Math.min(6, h),
        fontSize: element.style?.fontSize || 16,
        fontFace: element.style?.fontFamily || 'Arial',
        color: element.style?.color?.replace('#', '') || '2d3748',
        bold: element.style?.fontWeight >= 600,
        align: element.style?.textAlign || 'left',
        wrap: true,
        valign: 'top'
      })
    }
  }

  private async addChartToSlide(slide: any, chart: any, index: number) {
    try {
      // Position chart
      const chartX = 1 + (index * 5)
      const chartY = 3
      const chartW = 4
      const chartH = 3

      if (chart.type === 'bar' && chart.data) {
        slide.addChart(this.pptx.ChartType.bar, chart.data, {
          x: chartX,
          y: chartY,
          w: chartW,
          h: chartH,
          title: chart.title || 'Chart',
          showTitle: true,
          showLegend: false,
          chartColors: ['1e40af', '2563eb', '3b82f6', '60a5fa', '93c5fd']
        })
      } else if (chart.type === 'line' && chart.data) {
        slide.addChart(this.pptx.ChartType.line, chart.data, {
          x: chartX,
          y: chartY,
          w: chartW,
          h: chartH,
          title: chart.title || 'Chart',
          showTitle: true,
          showLegend: false,
          chartColors: ['1e40af']
        })
      } else if (chart.type === 'pie' && chart.data) {
        slide.addChart(this.pptx.ChartType.pie, chart.data, {
          x: chartX,
          y: chartY,
          w: chartW,
          h: chartH,
          title: chart.title || 'Chart',
          showTitle: true,
          showLegend: true,
          chartColors: ['1e40af', '2563eb', '3b82f6', '60a5fa', '93c5fd']
        })
      }
    } catch (error) {
      console.warn('⚠️ Failed to add chart to slide:', error)
    }
  }
}

// PDF Export using browser print API
export class PDFExporter {
  async exportPresentation(presentation: PresentationData): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`🚀 Exporting presentation to PDF: ${presentation.title}`)

      // Create a new window with the presentation content
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        throw new Error('Failed to open print window. Please allow popups.')
      }

      // Generate HTML content for the presentation
      const htmlContent = this.generatePresentationHTML(presentation)
      
      // Write content to the new window
      printWindow.document.write(htmlContent)
      printWindow.document.close()

      // Wait for content to load, then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
          printWindow.close()
        }, 500)
      }

      console.log('✅ PDF export initiated')
      return { success: true }

    } catch (error: any) {
      console.error('❌ PDF export failed:', error)
      return { success: false, error: error.message }
    }
  }

  private generatePresentationHTML(presentation: PresentationData): string {
    const slides = presentation.slides.map((slide, index) => {
      return `
        <div class="slide" style="
          width: 210mm;
          height: 297mm;
          page-break-after: always;
          padding: 20mm;
          background: white;
          font-family: Arial, sans-serif;
          position: relative;
          box-sizing: border-box;
        ">
          ${slide.title ? `
            <h1 style="
              font-size: 32px;
              color: #1a365d;
              margin-bottom: 20px;
              font-weight: bold;
            ">${slide.title}</h1>
          ` : ''}
          
          ${slide.elements ? slide.elements.map((element: any) => {
            if (element.type === 'text' && element.content) {
              return `
                <div style="
                  font-size: ${element.style?.fontSize || 16}px;
                  color: ${element.style?.color || '#2d3748'};
                  margin-bottom: 15px;
                  line-height: 1.6;
                  text-align: ${element.style?.textAlign || 'left'};
                  font-weight: ${element.style?.fontWeight >= 600 ? 'bold' : 'normal'};
                ">${element.content.replace(/\n/g, '<br>')}</div>
              `
            }
            return ''
          }).join('') : ''}
          
          ${slide.charts ? slide.charts.map((chart: any) => `
            <div style="
              margin: 20px 0;
              padding: 15px;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              background: #f8fafc;
            ">
              <h3 style="margin: 0 0 10px 0; color: #1a365d;">${chart.title || 'Chart'}</h3>
              <p style="margin: 0; color: #666; font-size: 14px;">Chart data would be rendered here in a full implementation</p>
            </div>
          `).join('') : ''}
          
          <div style="
            position: absolute;
            bottom: 15mm;
            right: 20mm;
            font-size: 12px;
            color: #666;
          ">
            ${index + 1} / ${presentation.slides.length}
          </div>
        </div>
      `
    }).join('')

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${presentation.title}</title>
          <style>
            @media print {
              body { margin: 0; }
              .slide { page-break-after: always; }
              .slide:last-child { page-break-after: auto; }
            }
            body {
              margin: 0;
              font-family: Arial, sans-serif;
            }
          </style>
        </head>
        <body>
          ${slides}
        </body>
      </html>
    `
  }
}

// Download helper function
export function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Main export function
export async function exportPresentation(
  presentation: PresentationData, 
  format: 'pdf' | 'pptx'
): Promise<{ success: boolean; error?: string }> {
  try {
    const filename = `${presentation.title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`

    if (format === 'pptx') {
      const exporter = new PPTXExporter()
      const result = await exporter.exportPresentation(presentation)
      
      if (result.success && result.blob) {
        downloadFile(result.blob, `${filename}.pptx`)
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } else if (format === 'pdf') {
      const exporter = new PDFExporter()
      return await exporter.exportPresentation(presentation)
    } else {
      return { success: false, error: 'Unsupported export format' }
    }
  } catch (error: any) {
    console.error('❌ Export failed:', error)
    return { success: false, error: error.message }
  }
}