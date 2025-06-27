import PptxGenJS from 'pptxgenjs';

interface SlideElement {
  id: string;
  type: 'text' | 'chart' | 'image' | 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  chartConfig?: any;
  src?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

interface Slide {
  id: string;
  title: string;
  layout: 'title' | 'content' | 'comparison' | 'chart' | 'image';
  elements: SlideElement[];
  backgroundColor?: string;
}

interface Presentation {
  id: string;
  title: string;
  author: string;
  company?: string;
  subject?: string;
  slides: Slide[];
  theme: PresentationTheme;
}

interface PresentationTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  headingFont: string;
  bodyFont: string;
  logoUrl?: string;
}

export class PowerPointExporter {
  private pptx: PptxGenJS;
  
  constructor() {
    this.pptx = new PptxGenJS();
  }
  
  async export(presentation: Presentation): Promise<Blob> {
    // Configure presentation metadata
    this.pptx.author = presentation.author;
    this.pptx.company = presentation.company || '';
    this.pptx.title = presentation.title;
    this.pptx.subject = presentation.subject || 'Data-driven presentation created with EasyDecks.ai';
    
    // Set layout (16:9 widescreen)
    this.pptx.layout = 'LAYOUT_16x9';
    
    // Define color scheme based on theme
    this.pptx.theme = {
      headFontFace: presentation.theme.headingFont || 'Arial',
      bodyFontFace: presentation.theme.bodyFont || 'Arial'
    };
    
    // Create master slides for consistent branding
    this.createMasterSlides(presentation.theme);
    
    // Generate slides
    for (const slide of presentation.slides) {
      await this.createSlide(slide, presentation.theme);
    }
    
    // Return as blob for download
    return await this.pptx.write({ outputType: 'blob' }) as Blob;
  }
  
  private createMasterSlides(theme: PresentationTheme) {
    // Title slide master
    this.pptx.defineSlideMaster({
      title: 'TITLE_SLIDE',
      background: { color: theme.backgroundColor || 'FFFFFF' },
      objects: [
        {
          placeholder: {
            options: {
              name: 'title',
              type: 'title',
              x: 0.5,
              y: 2.5,
              w: 9,
              h: 2,
              fontSize: 44,
              bold: true,
              color: this.hexToColorCode(theme.primaryColor) || '1e293b',
              align: 'center'
            }
          }
        },
        {
          placeholder: {
            options: {
              name: 'subtitle',
              type: 'body',
              x: 0.5,
              y: 4.5,
              w: 9,
              h: 1,
              fontSize: 20,
              color: this.hexToColorCode(theme.secondaryColor) || '64748b',
              align: 'center'
            }
          }
        }
      ]
    });
    
    // Content slide master
    this.pptx.defineSlideMaster({
      title: 'CONTENT_SLIDE',
      background: { color: theme.backgroundColor || 'FFFFFF' },
      objects: [
        // Logo (if provided)
        ...(theme.logoUrl ? [{
          image: {
            x: 0.3,
            y: 0.3,
            w: 1.2,
            h: 0.4,
            path: theme.logoUrl
          }
        }] : []),
        
        // Slide number
        {
          text: {
            text: '<<slideNum>>',
            options: {
              x: 9,
              y: 5.2,
              w: 0.5,
              h: 0.3,
              fontSize: 10,
              color: '94a3b8',
              align: 'right'
            }
          }
        },
        
        // Company name/branding
        {
          text: {
            text: 'Generated with EasyDecks.ai',
            options: {
              x: 0.3,
              y: 5.2,
              w: 2,
              h: 0.3,
              fontSize: 8,
              color: 'cccccc',
              align: 'left'
            }
          }
        }
      ]
    });
  }
  
  private async createSlide(slide: Slide, theme: PresentationTheme) {
    const pptSlide = this.pptx.addSlide({
      masterName: slide.layout === 'title' ? 'TITLE_SLIDE' : 'CONTENT_SLIDE'
    });
    
    // Add slide title if not title slide
    if (slide.layout !== 'title' && slide.title) {
      pptSlide.addText(slide.title, {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.8,
        fontSize: 32,
        bold: true,
        color: this.hexToColorCode(theme.primaryColor) || '1e293b',
        fontFace: theme.headingFont || 'Arial'
      });
    }
    
    // Add all slide elements
    for (const element of slide.elements) {
      await this.addElementToSlide(pptSlide, element, theme);
    }
  }
  
  private async addElementToSlide(slide: any, element: SlideElement, theme: PresentationTheme) {
    // Convert pixel coordinates to inches (PowerPoint uses inches)
    const x = this.pixelsToInches(element.x);
    const y = this.pixelsToInches(element.y);
    const w = this.pixelsToInches(element.width);
    const h = this.pixelsToInches(element.height);
    
    switch (element.type) {
      case 'text':
        this.addTextElement(slide, element, { x, y, w, h }, theme);
        break;
        
      case 'chart':
        await this.addChartElement(slide, element, { x, y, w, h }, theme);
        break;
        
      case 'image':
        await this.addImageElement(slide, element, { x, y, w, h });
        break;
        
      case 'shape':
        this.addShapeElement(slide, element, { x, y, w, h });
        break;
    }
  }
  
  private addTextElement(slide: any, element: SlideElement, position: any, theme: PresentationTheme) {
    const textOptions: any = {
      x: position.x,
      y: position.y,
      w: position.w,
      h: position.h,
      fontSize: element.fontSize || 18,
      fontFace: element.fontFamily || theme.bodyFont || 'Arial',
      color: this.hexToColorCode(element.color) || '000000',
      bold: element.fontWeight === 'bold',
      italic: element.fontStyle === 'italic',
      align: this.mapTextAlign(element.textAlign || 'left'),
      valign: 'top',
      margin: 0.1
    };
    
    // Handle bullet points
    if (element.content?.includes('•') || element.content?.includes('-')) {
      textOptions.bullet = true;
      textOptions.indent = 0.3;
    }
    
    // Clean up content and add to slide
    const content = element.content || 'Text element';
    slide.addText(content, textOptions);
  }
  
  private async addChartElement(slide: any, element: SlideElement, position: any, theme: PresentationTheme) {
    if (!element.chartConfig || !element.chartConfig.data) {
      // Add placeholder if no chart data
      slide.addText('Chart Placeholder\n(Data not available)', {
        x: position.x,
        y: position.y,
        w: position.w,
        h: position.h,
        fontSize: 16,
        align: 'center',
        valign: 'middle',
        color: '666666',
        fill: { color: 'f5f5f5' },
        border: { color: 'cccccc', pt: 1 }
      });
      return;
    }
    
    const chartData = this.transformChartDataForPowerPoint(
      element.chartConfig.data,
      element.chartConfig.type || 'bar'
    );
    
    const chartOptions = {
      x: position.x,
      y: position.y,
      w: position.w,
      h: position.h,
      showLegend: element.chartConfig.showLegend !== false,
      showTitle: false,
      chartColors: [
        this.hexToColorCode(theme.primaryColor) || '6366F1',
        this.hexToColorCode(theme.secondaryColor) || '8B5CF6',
        '06B6D4',
        '10B981',
        'F59E0B',
        'EF4444'
      ],
      showValue: true,
      dataLabelFormatCode: '#,##0',
      border: { pt: 1, color: 'E5E7EB' }
    };
    
    try {
      slide.addChart(
        this.mapChartType(element.chartConfig.type),
        chartData,
        chartOptions
      );
    } catch (error) {
      console.warn('Failed to add chart, adding placeholder instead:', error);
      slide.addText('Chart Error\n(Failed to render)', {
        x: position.x,
        y: position.y,
        w: position.w,
        h: position.h,
        fontSize: 16,
        align: 'center',
        valign: 'middle',
        color: 'dc2626',
        fill: { color: 'fef2f2' },
        border: { color: 'fca5a5', pt: 1 }
      });
    }
  }
  
  private async addImageElement(slide: any, element: SlideElement, position: any) {
    if (!element.src) {
      // Add placeholder for missing image
      slide.addText('Image Placeholder\n(No image selected)', {
        x: position.x,
        y: position.y,
        w: position.w,
        h: position.h,
        fontSize: 16,
        align: 'center',
        valign: 'middle',
        color: '666666',
        fill: { color: 'f9fafb' },
        border: { color: 'e5e7eb', pt: 1 }
      });
      return;
    }
    
    try {
      slide.addImage({
        path: element.src,
        x: position.x,
        y: position.y,
        w: position.w,
        h: position.h,
        sizing: { type: 'contain' }
      });
    } catch (error) {
      console.warn('Failed to add image, adding placeholder instead:', error);
      slide.addText('Image Error\n(Failed to load)', {
        x: position.x,
        y: position.y,
        w: position.w,
        h: position.h,
        fontSize: 16,
        align: 'center',
        valign: 'middle',
        color: 'dc2626',
        fill: { color: 'fef2f2' },
        border: { color: 'fca5a5', pt: 1 }
      });
    }
  }
  
  private addShapeElement(slide: any, element: SlideElement, position: any) {
    const shapeOptions: any = {
      x: position.x,
      y: position.y,
      w: position.w,
      h: position.h,
      fill: { color: this.hexToColorCode(element.backgroundColor) || '6366f1' },
      line: element.borderWidth ? {
        color: this.hexToColorCode(element.borderColor) || '000000',
        width: element.borderWidth
      } : undefined
    };
    
    let shapeType;
    const elementShapeType = (element as any).shapeType;
    switch (elementShapeType) {
      case 'circle':
        shapeType = 'ellipse';
        break;
      case 'triangle':
        shapeType = 'triangle';
        break;
      default:
        shapeType = 'rect';
    }
    
    slide.addShape(shapeType, shapeOptions);
  }
  
  private transformChartDataForPowerPoint(data: any[], chartType: string): any[] {
    if (!data || data.length === 0) return [];
    
    // For PowerPoint charts, we need to transform data into the expected format
    const columns = Object.keys(data[0]);
    const categoryColumn = columns[0];
    const valueColumns = columns.slice(1).filter(col => 
      data.some(row => !isNaN(parseFloat(row[col])))
    );
    
    if (chartType === 'pie' || chartType === 'doughnut') {
      // Pie charts need name/value pairs
      return data.map(row => ({
        name: row[categoryColumn],
        value: parseFloat(row[valueColumns[0]]) || 0
      }));
    }
    
    // Other charts need categories and series
    const categories = data.map(row => row[categoryColumn]);
    const series = valueColumns.map(col => ({
      name: col,
      values: data.map(row => parseFloat(row[col]) || 0)
    }));
    
    return [
      {
        name: 'Categories',
        labels: categories
      },
      ...series
    ];
  }
  
  private mapChartType(chartType: string): any {
    const chartTypes: Record<string, any> = {
      'line': 'line',
      'bar': 'bar',
      'column': 'bar',
      'pie': 'pie',
      'doughnut': 'doughnut',
      'area': 'area',
      'scatter': 'scatter'
    };
    
    return chartTypes[chartType] || 'bar';
  }
  
  private mapTextAlign(align: string): string {
    const alignMap: Record<string, string> = {
      'left': 'left',
      'center': 'center',
      'right': 'right'
    };
    
    return alignMap[align] || 'left';
  }
  
  private pixelsToInches(pixels: number): number {
    // PowerPoint uses 96 DPI, so 96 pixels = 1 inch
    return pixels / 96;
  }
  
  private hexToColorCode(hex?: string): string | undefined {
    if (!hex) return undefined;
    
    // Remove # if present and ensure it's 6 characters
    const cleanHex = hex.replace('#', '').padEnd(6, '0').substring(0, 6);
    return cleanHex.toUpperCase();
  }
}

// Export utility function for use in API routes
export async function exportPresentationToPowerPoint(presentation: Presentation): Promise<Blob> {
  const exporter = new PowerPointExporter();
  return await exporter.export(presentation);
}