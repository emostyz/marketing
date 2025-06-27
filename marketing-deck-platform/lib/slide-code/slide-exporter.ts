/**
 * Slide Code Export/Import System
 * Handles conversion between slides and code format
 */

import { SlideCode, PresentationCode, generateSlideCode, validateSlideCode, validatePresentationCode } from './slide-schema'

export class SlideCodeExporter {
  
  /**
   * Export a single slide to complete code format
   */
  static exportSlideToCode(slide: any): SlideCode {
    const slideCode = generateSlideCode(slide)
    
    // Add enhanced metadata for AI training
    slideCode.aiTrainingContext = {
      templateQuality: this.assessTemplateQuality(slide),
      designPrinciples: this.extractDesignPrinciples(slide),
      performanceMetrics: {
        timeToCreate: slide.metadata?.timeToCreate || 0,
        userSatisfaction: slide.metadata?.userSatisfaction || 0,
        businessValue: slide.metadata?.businessValue || 0
      }
    }
    
    return slideCode
  }
  
  /**
   * Export entire presentation to code format
   */
  static exportPresentationToCode(presentation: any): PresentationCode {
    return {
      id: presentation.id || `presentation_${Date.now()}`,
      version: '1.0.0',
      createdAt: presentation.createdAt || new Date().toISOString(),
      lastModified: new Date().toISOString(),
      title: presentation.title || 'Untitled Presentation',
      description: presentation.description,
      author: presentation.author || 'Unknown',
      company: presentation.company,
      slides: presentation.slides?.map((slide: any) => this.exportSlideToCode(slide)) || [],
      theme: presentation.theme || this.getDefaultTheme(),
      defaultLayout: presentation.defaultLayout || this.getDefaultLayout(),
      settings: {
        aspectRatio: presentation.settings?.aspectRatio || '16:9',
        dimensions: presentation.settings?.dimensions || { width: 1920, height: 1080 },
        defaultTransition: presentation.settings?.defaultTransition || {
          type: 'fade',
          duration: 300,
          easing: 'ease-in-out'
        },
        autoAdvance: presentation.settings?.autoAdvance,
        loop: presentation.settings?.loop || false,
        enableRemote: presentation.settings?.enableRemote || false
      },
      businessContext: {
        purpose: presentation.businessContext?.purpose || 'Business presentation',
        audience: presentation.businessContext?.audience || 'executives',
        duration: presentation.businessContext?.duration || 15,
        industry: presentation.businessContext?.industry || 'general',
        objectives: presentation.businessContext?.objectives || [],
        keyMessages: presentation.businessContext?.keyMessages || [],
        callToAction: presentation.businessContext?.callToAction
      },
      aiContext: {
        dataSource: presentation.aiContext?.dataSource || 'user_input',
        analysisType: presentation.aiContext?.analysisType || 'general',
        insightCount: presentation.slides?.reduce((sum: number, slide: any) => 
          sum + (slide.elements?.filter((e: any) => e.metadata?.businessRelevance === 'high').length || 0), 0) || 0,
        chartCount: presentation.slides?.reduce((sum: number, slide: any) => 
          sum + (slide.elements?.filter((e: any) => e.type === 'chart').length || 0), 0) || 0,
        qualityScore: this.calculateQualityScore(presentation),
        templateUsed: presentation.aiContext?.templateUsed,
        generationTime: presentation.aiContext?.generationTime || 0,
        userCustomizations: presentation.aiContext?.userCustomizations || 0
      }
    }
  }
  
  /**
   * Export to different formats
   */
  static exportToFormat(presentation: any, format: 'json' | 'yaml' | 'typescript' | 'python'): string {
    const code = this.exportPresentationToCode(presentation)
    
    switch (format) {
      case 'json':
        return JSON.stringify(code, null, 2)
        
      case 'yaml':
        return this.toYAML(code)
        
      case 'typescript':
        return this.toTypeScript(code)
        
      case 'python':
        return this.toPython(code)
        
      default:
        return JSON.stringify(code, null, 2)
    }
  }
  
  /**
   * Generate Tremor chart code specifically
   */
  static exportChartCode(chartConfig: any): string {
    const chartCode = {
      component: 'TremorChart',
      props: {
        type: chartConfig.type,
        data: chartConfig.data,
        x: chartConfig.xAxisKey,
        y: chartConfig.yAxisKey,
        categories: chartConfig.categoryKey ? [chartConfig.categoryKey] : undefined,
        colors: chartConfig.colors,
        showLegend: chartConfig.showLegend,
        showGrid: chartConfig.showGrid,
        showTooltip: chartConfig.showTooltip,
        height: chartConfig.height || 300,
        className: chartConfig.className || 'w-full',
        // McKinsey-style enhancements
        consultingStyle: chartConfig.consultingStyle,
        // Animation
        animateOnLoad: chartConfig.animateOnLoad,
        animationDuration: chartConfig.animationDuration || 800,
        // Responsive
        responsive: chartConfig.responsive !== false
      },
      styling: {
        container: {
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          padding: '20px',
          border: '1px solid rgba(59, 130, 246, 0.2)'
        },
        title: {
          fontSize: '18px',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '12px'
        }
      },
      businessContext: {
        metric: chartConfig.businessMetric,
        insight: chartConfig.consultingStyle?.emphasizeInsight,
        audience: chartConfig.audienceLevel,
        purpose: this.getChartPurpose(chartConfig.type)
      }
    }
    
    return JSON.stringify(chartCode, null, 2)
  }
  
  // Helper methods
  private static assessTemplateQuality(slide: any): 'basic' | 'professional' | 'executive' | 'mckinsey' {
    let score = 0
    
    // Check design sophistication
    if (slide.elements?.some((e: any) => e.style?.boxShadow)) score += 1
    if (slide.elements?.some((e: any) => e.style?.backgroundImage?.includes('gradient'))) score += 1
    if (slide.elements?.some((e: any) => e.animations)) score += 1
    if (slide.elements?.some((e: any) => e.chartConfig?.consultingStyle)) score += 2
    if (slide.elements?.length > 5) score += 1
    
    if (score >= 5) return 'mckinsey'
    if (score >= 3) return 'executive'
    if (score >= 1) return 'professional'
    return 'basic'
  }
  
  private static extractDesignPrinciples(slide: any): string[] {
    const principles = []
    
    if (slide.elements?.some((e: any) => e.style?.textAlign === 'center')) {
      principles.push('center-aligned')
    }
    if (slide.elements?.some((e: any) => e.style?.boxShadow)) {
      principles.push('depth-shadows')
    }
    if (slide.elements?.some((e: any) => e.style?.backgroundImage?.includes('gradient'))) {
      principles.push('gradient-backgrounds')
    }
    if (slide.theme?.colors?.primary) {
      principles.push('consistent-branding')
    }
    if (slide.layout?.grid) {
      principles.push('grid-based-layout')
    }
    
    return principles
  }
  
  private static calculateQualityScore(presentation: any): number {
    let score = 70 // Base score
    
    // Slide count optimization
    const slideCount = presentation.slides?.length || 0
    if (slideCount >= 5 && slideCount <= 15) score += 10
    
    // Chart quality
    const hasCharts = presentation.slides?.some((s: any) => 
      s.elements?.some((e: any) => e.type === 'chart')
    )
    if (hasCharts) score += 15
    
    // Business context
    if (presentation.businessContext?.objectives?.length > 0) score += 5
    
    return Math.min(score, 100)
  }
  
  private static getChartPurpose(chartType: string): string {
    const purposes = {
      bar: 'Compare values across categories',
      line: 'Show trends over time',
      area: 'Display cumulative values or parts of a whole over time',
      pie: 'Show proportional relationships',
      donut: 'Display hierarchical data with emphasis on total',
      scatter: 'Reveal correlations between variables',
      heatmap: 'Visualize data density or intensity',
      funnel: 'Track conversion processes',
      gauge: 'Display progress toward goals',
      treemap: 'Show hierarchical data as nested rectangles'
    }
    return purposes[chartType as keyof typeof purposes] || 'Visualize data insights'
  }
  
  private static toYAML(obj: any): string {
    // Simple YAML conversion - in production, use a proper YAML library
    return `# Slide Code Export (YAML)
# Generated: ${new Date().toISOString()}

presentation:
  id: "${obj.id}"
  title: "${obj.title}"
  slides: ${obj.slides.length}
  
# Full object would be properly serialized here
# This is a simplified version for demonstration`
  }
  
  private static toTypeScript(obj: any): string {
    return `// TypeScript Slide Code Export
// Generated: ${new Date().toISOString()}

import { PresentationCode } from '@/lib/slide-code/slide-schema'

export const presentationCode: PresentationCode = ${JSON.stringify(obj, null, 2)}

export default presentationCode`
  }
  
  private static toPython(obj: any): string {
    return `# Python Slide Code Export
# Generated: ${new Date().toISOString()}

import json
from typing import Dict, Any

presentation_code: Dict[str, Any] = ${JSON.stringify(obj, null, 2).replace(/"/g, "'")}

def create_slide_from_code(slide_code: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert slide code back to slide object
    Used for AI training and slide generation
    """
    return {
        'id': slide_code['id'],
        'title': slide_code['title'], 
        'elements': slide_code['elements'],
        'layout': slide_code['layout'],
        'theme': slide_code['theme']
    }

def train_ai_with_slide_examples(slide_codes: list) -> None:
    """
    Train OpenAI with high-quality slide examples
    """
    training_examples = []
    for slide_code in slide_codes:
        if slide_code.get('aiTrainingContext', {}).get('templateQuality') in ['executive', 'mckinsey']:
            training_examples.append({
                'input': slide_code['businessContext'],
                'output': slide_code['elements'],
                'quality_score': slide_code.get('aiContext', {}).get('qualityScore', 0)
            })
    
    # Use training_examples for OpenAI fine-tuning
    return training_examples`
  }
  
  private static getDefaultTheme() {
    // Import from schema
    return {
      name: 'Professional',
      colors: {
        primary: '#1e40af',
        secondary: '#64748b',
        background: '#ffffff'
      }
    }
  }
  
  private static getDefaultLayout() {
    return {
      type: 'content',
      grid: { columns: 12, rows: 8, gap: 16 },
      margins: { top: 60, right: 60, bottom: 60, left: 60 }
    }
  }
}

export class SlideCodeImporter {
  
  /**
   * Import slide from code format
   */
  static importSlideFromCode(slideCode: SlideCode): any {
    if (!validateSlideCode(slideCode)) {
      throw new Error('Invalid slide code format')
    }
    
    return {
      id: slideCode.id,
      number: slideCode.slideNumber,
      title: slideCode.title,
      subtitle: slideCode.subtitle,
      elements: slideCode.elements.map(this.importElementFromCode),
      background: slideCode.background,
      layout: slideCode.layout,
      theme: slideCode.theme,
      style: slideCode.theme.name,
      animations: slideCode.slideTransition,
      metadata: {
        ...slideCode.metadata,
        businessContext: slideCode.businessContext,
        aiTrainingContext: slideCode.aiTrainingContext
      }
    }
  }
  
  /**
   * Import presentation from code format
   */
  static importPresentationFromCode(presentationCode: PresentationCode): any {
    if (!validatePresentationCode(presentationCode)) {
      throw new Error('Invalid presentation code format')
    }
    
    return {
      id: presentationCode.id,
      title: presentationCode.title,
      description: presentationCode.description,
      slides: presentationCode.slides.map(this.importSlideFromCode),
      theme: presentationCode.theme,
      settings: presentationCode.settings,
      businessContext: presentationCode.businessContext,
      aiContext: presentationCode.aiContext,
      metadata: {
        createdAt: presentationCode.createdAt,
        lastModified: presentationCode.lastModified,
        author: presentationCode.author,
        company: presentationCode.company
      }
    }
  }
  
  /**
   * Import from different formats
   */
  static importFromFormat(codeString: string, format: 'json' | 'yaml' | 'typescript'): any {
    let codeObject
    
    switch (format) {
      case 'json':
        codeObject = JSON.parse(codeString)
        break
        
      case 'yaml':
        // Would use YAML parser in production
        throw new Error('YAML import not yet implemented')
        
      case 'typescript':
        // Extract JSON from TypeScript file
        const jsonMatch = codeString.match(/= ({[\s\S]*})/)?.[1]
        if (!jsonMatch) throw new Error('Invalid TypeScript format')
        codeObject = JSON.parse(jsonMatch)
        break
        
      default:
        throw new Error(`Unsupported format: ${format}`)
    }
    
    return this.importPresentationFromCode(codeObject)
  }
  
  private static importElementFromCode(elementCode: any): any {
    return {
      id: elementCode.id,
      type: elementCode.type,
      position: elementCode.position,
      size: elementCode.size,
      rotation: elementCode.rotation,
      content: elementCode.content,
      style: elementCode.style,
      animations: elementCode.animations,
      isLocked: elementCode.interactivity?.draggable === false,
      isVisible: true,
      metadata: elementCode.metadata,
      chartData: elementCode.chartConfig?.data,
      chartType: elementCode.chartConfig?.type,
      chartConfig: elementCode.chartConfig
    }
  }
}

// Export utilities for easy access
export const exportSlideToCode = SlideCodeExporter.exportSlideToCode
export const exportPresentationToCode = SlideCodeExporter.exportPresentationToCode
export const exportToFormat = SlideCodeExporter.exportToFormat
export const exportChartCode = SlideCodeExporter.exportChartCode

export const importSlideFromCode = SlideCodeImporter.importSlideFromCode
export const importPresentationFromCode = SlideCodeImporter.importPresentationFromCode
export const importFromFormat = SlideCodeImporter.importFromFormat