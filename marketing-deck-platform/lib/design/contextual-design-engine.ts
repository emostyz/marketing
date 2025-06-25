// Contextual Design Engine - Applies design based on context and audience

import { UserContext } from '@/lib/ai/openai-orchestrator'

export interface DesignTheme {
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
    success: string
    warning: string
    error: string
  }
  typography: {
    headingFont: string
    bodyFont: string
    dataFont: string
    headingSizes: number[]
    bodySize: number
    lineHeight: number
  }
  layout: {
    spacing: 'tight' | 'comfortable' | 'spacious'
    borderRadius: number
    shadows: boolean
    gradients: boolean
  }
  charts: {
    style: 'minimal' | 'professional' | 'bold' | 'technical'
    colorPalette: string[]
    animations: boolean
    interactivity: boolean
  }
  presentation: {
    slideRatio: '16:9' | '4:3'
    transitionStyle: 'slide' | 'fade' | 'zoom' | 'none'
    backgroundStyle: 'solid' | 'gradient' | 'pattern'
  }
}

export class ContextualDesignEngine {
  /**
   * Generate design theme based on context
   */
  static generateContextualTheme(context: UserContext): DesignTheme {
    // Determine base theme from context
    const baseTheme = this.selectBaseTheme(context)
    
    // Customize for industry
    const industryAdjustments = this.getIndustryAdjustments(context.industry)
    
    // Customize for audience
    const audienceAdjustments = this.getAudienceAdjustments(context.targetAudience)
    
    // Customize for presentation style
    const styleAdjustments = this.getStyleAdjustments(context.presentationStyle)
    
    // Customize for urgency
    const urgencyAdjustments = this.getUrgencyAdjustments(context.urgency)
    
    // Merge all customizations
    return this.mergeThemeAdjustments(baseTheme, [
      industryAdjustments,
      audienceAdjustments, 
      styleAdjustments,
      urgencyAdjustments
    ])
  }

  /**
   * Select base theme based on overall context
   */
  private static selectBaseTheme(context: UserContext): DesignTheme {
    // Executive presentation
    if (context.presentationStyle === 'executive' || 
        context.targetAudience?.toLowerCase().includes('executive') ||
        context.targetAudience?.toLowerCase().includes('c-level')) {
      return this.getExecutiveTheme()
    }
    
    // Technical presentation
    if (context.presentationStyle === 'technical' ||
        context.targetAudience?.toLowerCase().includes('engineer') ||
        context.targetAudience?.toLowerCase().includes('technical')) {
      return this.getTechnicalTheme()
    }
    
    // Sales presentation
    if (context.presentationStyle === 'sales' ||
        context.presentationGoal?.toLowerCase().includes('sell') ||
        context.presentationGoal?.toLowerCase().includes('pitch')) {
      return this.getSalesTheme()
    }
    
    // Board presentation
    if (context.presentationStyle === 'board' ||
        context.targetAudience?.toLowerCase().includes('board') ||
        context.decisionMakers?.some(dm => dm.toLowerCase().includes('board'))) {
      return this.getBoardTheme()
    }
    
    // Investor presentation
    if (context.presentationStyle === 'investor' ||
        context.targetAudience?.toLowerCase().includes('investor') ||
        context.presentationGoal?.toLowerCase().includes('funding')) {
      return this.getInvestorTheme()
    }
    
    // Default professional theme
    return this.getProfessionalTheme()
  }

  /**
   * Executive theme - Clean, minimal, authoritative
   */
  private static getExecutiveTheme(): DesignTheme {
    return {
      name: 'Executive',
      colors: {
        primary: '#1e40af', // Deep blue
        secondary: '#64748b', // Slate gray
        accent: '#f59e0b', // Amber
        background: '#ffffff',
        text: '#1e293b',
        success: '#10b981',
        warning: '#f59e0b', 
        error: '#ef4444'
      },
      typography: {
        headingFont: 'Inter',
        bodyFont: 'Inter',
        dataFont: 'JetBrains Mono',
        headingSizes: [48, 36, 28, 24],
        bodySize: 16,
        lineHeight: 1.5
      },
      layout: {
        spacing: 'spacious',
        borderRadius: 8,
        shadows: true,
        gradients: false
      },
      charts: {
        style: 'minimal',
        colorPalette: ['#1e40af', '#64748b', '#10b981', '#f59e0b'],
        animations: false,
        interactivity: true
      },
      presentation: {
        slideRatio: '16:9',
        transitionStyle: 'fade',
        backgroundStyle: 'solid'
      }
    }
  }

  /**
   * Technical theme - Data-focused, detailed
   */
  private static getTechnicalTheme(): DesignTheme {
    return {
      name: 'Technical',
      colors: {
        primary: '#0f172a',
        secondary: '#475569',
        accent: '#06b6d4',
        background: '#f8fafc',
        text: '#0f172a',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
      },
      typography: {
        headingFont: 'Inter',
        bodyFont: 'Inter',
        dataFont: 'JetBrains Mono',
        headingSizes: [32, 28, 24, 20],
        bodySize: 14,
        lineHeight: 1.4
      },
      layout: {
        spacing: 'comfortable',
        borderRadius: 4,
        shadows: false,
        gradients: false
      },
      charts: {
        style: 'technical',
        colorPalette: ['#0f172a', '#06b6d4', '#10b981', '#8b5cf6', '#f59e0b'],
        animations: true,
        interactivity: true
      },
      presentation: {
        slideRatio: '16:9',
        transitionStyle: 'slide',
        backgroundStyle: 'solid'
      }
    }
  }

  /**
   * Sales theme - Bold, engaging, persuasive
   */
  private static getSalesTheme(): DesignTheme {
    return {
      name: 'Sales',
      colors: {
        primary: '#dc2626',
        secondary: '#1e40af',
        accent: '#f59e0b',
        background: '#ffffff',
        text: '#1f2937',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
      },
      typography: {
        headingFont: 'Inter',
        bodyFont: 'Inter', 
        dataFont: 'Inter',
        headingSizes: [56, 40, 32, 24],
        bodySize: 18,
        lineHeight: 1.6
      },
      layout: {
        spacing: 'comfortable',
        borderRadius: 12,
        shadows: true,
        gradients: true
      },
      charts: {
        style: 'bold',
        colorPalette: ['#dc2626', '#1e40af', '#10b981', '#f59e0b', '#8b5cf6'],
        animations: true,
        interactivity: true
      },
      presentation: {
        slideRatio: '16:9',
        transitionStyle: 'zoom',
        backgroundStyle: 'gradient'
      }
    }
  }

  /**
   * Board theme - Conservative, trustworthy, formal
   */
  private static getBoardTheme(): DesignTheme {
    return {
      name: 'Board',
      colors: {
        primary: '#1e293b',
        secondary: '#64748b',
        accent: '#0ea5e9',
        background: '#ffffff',
        text: '#1e293b',
        success: '#059669',
        warning: '#d97706',
        error: '#dc2626'
      },
      typography: {
        headingFont: 'Inter',
        bodyFont: 'Inter',
        dataFont: 'JetBrains Mono',
        headingSizes: [40, 32, 24, 20],
        bodySize: 16,
        lineHeight: 1.5
      },
      layout: {
        spacing: 'spacious',
        borderRadius: 6,
        shadows: false,
        gradients: false
      },
      charts: {
        style: 'professional',
        colorPalette: ['#1e293b', '#0ea5e9', '#059669', '#d97706'],
        animations: false,
        interactivity: false
      },
      presentation: {
        slideRatio: '4:3',
        transitionStyle: 'none',
        backgroundStyle: 'solid'
      }
    }
  }

  /**
   * Investor theme - Growth-focused, optimistic, data-driven
   */
  private static getInvestorTheme(): DesignTheme {
    return {
      name: 'Investor',
      colors: {
        primary: '#059669',
        secondary: '#1e40af',
        accent: '#f59e0b',
        background: '#ffffff',
        text: '#1f2937',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
      },
      typography: {
        headingFont: 'Inter',
        bodyFont: 'Inter',
        dataFont: 'JetBrains Mono',
        headingSizes: [44, 36, 28, 22],
        bodySize: 16,
        lineHeight: 1.5
      },
      layout: {
        spacing: 'comfortable',
        borderRadius: 10,
        shadows: true,
        gradients: true
      },
      charts: {
        style: 'professional',
        colorPalette: ['#059669', '#1e40af', '#f59e0b', '#8b5cf6', '#06b6d4'],
        animations: true,
        interactivity: true
      },
      presentation: {
        slideRatio: '16:9',
        transitionStyle: 'slide',
        backgroundStyle: 'gradient'
      }
    }
  }

  /**
   * Default professional theme
   */
  private static getProfessionalTheme(): DesignTheme {
    return {
      name: 'Professional',
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#7c3aed',
        background: '#ffffff',
        text: '#1f2937',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
      },
      typography: {
        headingFont: 'Inter',
        bodyFont: 'Inter',
        dataFont: 'JetBrains Mono',
        headingSizes: [40, 32, 24, 20],
        bodySize: 16,
        lineHeight: 1.5
      },
      layout: {
        spacing: 'comfortable',
        borderRadius: 8,
        shadows: true,
        gradients: false
      },
      charts: {
        style: 'professional',
        colorPalette: ['#2563eb', '#7c3aed', '#10b981', '#f59e0b', '#06b6d4'],
        animations: true,
        interactivity: true
      },
      presentation: {
        slideRatio: '16:9',
        transitionStyle: 'slide',
        backgroundStyle: 'solid'
      }
    }
  }

  /**
   * Get industry-specific adjustments
   */
  private static getIndustryAdjustments(industry?: string): Partial<DesignTheme> {
    if (!industry) return {}

    const industryLower = industry.toLowerCase()

    if (industryLower.includes('finance') || industryLower.includes('banking')) {
      return {
        colors: {
          primary: '#1e40af',
          secondary: '#64748b',
          accent: '#059669'
        }
      }
    }

    if (industryLower.includes('tech') || industryLower.includes('software')) {
      return {
        colors: {
          primary: '#7c3aed',
          secondary: '#06b6d4',
          accent: '#10b981'
        },
        charts: {
          style: 'technical',
          animations: true
        }
      }
    }

    if (industryLower.includes('healthcare') || industryLower.includes('medical')) {
      return {
        colors: {
          primary: '#0ea5e9',
          secondary: '#64748b',
          accent: '#10b981'
        }
      }
    }

    if (industryLower.includes('energy') || industryLower.includes('oil')) {
      return {
        colors: {
          primary: '#059669',
          secondary: '#f59e0b',
          accent: '#dc2626'
        }
      }
    }

    return {}
  }

  /**
   * Get audience-specific adjustments
   */
  private static getAudienceAdjustments(audience?: string): Partial<DesignTheme> {
    if (!audience) return {}

    const audienceLower = audience.toLowerCase()

    if (audienceLower.includes('technical') || audienceLower.includes('engineer')) {
      return {
        typography: {
          bodySize: 14,
          lineHeight: 1.4
        },
        layout: {
          spacing: 'tight'
        }
      }
    }

    if (audienceLower.includes('executive') || audienceLower.includes('ceo')) {
      return {
        typography: {
          headingSizes: [48, 36, 28, 24],
          bodySize: 18
        },
        layout: {
          spacing: 'spacious'
        }
      }
    }

    return {}
  }

  /**
   * Get style-specific adjustments
   */
  private static getStyleAdjustments(style?: string): Partial<DesignTheme> {
    if (!style) return {}

    switch (style) {
      case 'executive':
        return {
          layout: { gradients: false, shadows: true },
          charts: { animations: false }
        }
      case 'technical':
        return {
          layout: { gradients: false, shadows: false },
          charts: { style: 'technical' }
        }
      case 'sales':
        return {
          layout: { gradients: true, shadows: true },
          charts: { animations: true, style: 'bold' }
        }
      default:
        return {}
    }
  }

  /**
   * Get urgency-specific adjustments
   */
  private static getUrgencyAdjustments(urgency?: string): Partial<DesignTheme> {
    if (!urgency) return {}

    switch (urgency) {
      case 'critical':
        return {
          colors: {
            accent: '#dc2626' // Red accent for urgency
          },
          presentation: {
            transitionStyle: 'none' // Faster navigation
          }
        }
      case 'high':
        return {
          colors: {
            accent: '#f59e0b' // Orange accent
          }
        }
      default:
        return {}
    }
  }

  /**
   * Merge theme adjustments
   */
  private static mergeThemeAdjustments(baseTheme: DesignTheme, adjustments: Partial<DesignTheme>[]): DesignTheme {
    let mergedTheme = { ...baseTheme }

    for (const adjustment of adjustments) {
      mergedTheme = {
        ...mergedTheme,
        ...adjustment,
        colors: { ...mergedTheme.colors, ...adjustment.colors },
        typography: { ...mergedTheme.typography, ...adjustment.typography },
        layout: { ...mergedTheme.layout, ...adjustment.layout },
        charts: { ...mergedTheme.charts, ...adjustment.charts },
        presentation: { ...mergedTheme.presentation, ...adjustment.presentation }
      }
    }

    return mergedTheme
  }
}

/**
 * Apply contextual design to presentation
 */
export function applyContextualDesign(context: UserContext): DesignTheme {
  return ContextualDesignEngine.generateContextualTheme(context)
}

export default ContextualDesignEngine