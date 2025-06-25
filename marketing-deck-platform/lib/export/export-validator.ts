/**
 * Export Validation System
 * Comprehensive validation for presentation exports with quality assurance
 */

export interface ExportValidationResult {
  valid: boolean;
  score: number;
  issues: ExportIssue[];
  recommendations: string[];
  metadata: ExportMetadata;
}

export interface ExportIssue {
  severity: 'critical' | 'major' | 'minor';
  category: 'content' | 'format' | 'design' | 'data';
  description: string;
  solution: string;
  slideId?: string;
  elementId?: string;
}

export interface ExportMetadata {
  slideCount: number;
  elementCount: number;
  chartCount: number;
  textElementCount: number;
  estimatedFileSize: string;
  exportDuration?: number;
  compatibility: {
    powerpoint: boolean;
    googleSlides: boolean;
    keynote: boolean;
  };
}

export interface PresentationData {
  id: string;
  title: string;
  slides: SlideData[];
  theme?: ThemeData;
  metadata?: any;
}

export interface SlideData {
  id: string;
  title: string;
  layout: string;
  elements: ElementData[];
  notes?: string;
}

export interface ElementData {
  id?: string;
  type?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  chartConfig?: any;
  src?: string;
  [key: string]: any;
}

export interface ThemeData {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  headingFont: string;
  bodyFont: string;
}

export class ExportValidator {
  private validationRules: ValidationRule[];

  constructor() {
    this.validationRules = this.initializeValidationRules();
  }

  /**
   * Validate presentation before export
   */
  async validateForExport(
    presentation: PresentationData,
    format: 'pptx' | 'pdf' | 'json',
    options: any = {}
  ): Promise<ExportValidationResult> {
    console.log(`🔍 Validating presentation for ${format.toUpperCase()} export...`);

    const startTime = Date.now();
    const issues: ExportIssue[] = [];
    const recommendations: string[] = [];

    // Run all validation rules
    for (const rule of this.validationRules) {
      try {
        const ruleResult = await rule.validate(presentation, format, options);
        issues.push(...ruleResult.issues);
        recommendations.push(...ruleResult.recommendations);
      } catch (error) {
        console.warn(`Validation rule ${rule.name} failed:`, error);
        issues.push({
          severity: 'minor',
          category: 'format',
          description: `Validation rule ${rule.name} failed to execute`,
          solution: 'Contact support if this issue persists'
        });
      }
    }

    // Calculate metadata
    const metadata = this.calculateMetadata(presentation, format);
    metadata.exportDuration = Date.now() - startTime;

    // Calculate overall score
    const score = this.calculateValidationScore(issues, presentation);

    // Determine if valid for export
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    const valid = criticalIssues.length === 0 && score >= 70;

    const result: ExportValidationResult = {
      valid,
      score,
      issues,
      recommendations: [...new Set(recommendations)], // Remove duplicates
      metadata
    };

    console.log(`✅ Validation complete. Score: ${score}/100, Valid: ${valid ? 'Yes' : 'No'}`);
    return result;
  }

  /**
   * Auto-fix common export issues
   */
  async autoFixIssues(presentation: PresentationData): Promise<{
    fixedPresentation: PresentationData;
    fixesApplied: string[];
  }> {
    console.log('🔧 Auto-fixing common export issues...');

    const fixedPresentation = JSON.parse(JSON.stringify(presentation)); // Deep clone
    const fixesApplied: string[] = [];

    // Fix 1: Ensure all slides have titles
    fixedPresentation.slides.forEach((slide: SlideData) => {
      if (!slide.title || slide.title.trim().length === 0) {
        slide.title = `Slide ${slide.id}`;
        fixesApplied.push(`Added title to slide ${slide.id}`);
      }
    });

    // Fix 2: Validate element positions
    fixedPresentation.slides.forEach((slide: SlideData) => {
      slide.elements.forEach((element: ElementData) => {
        // Ensure elements are within slide bounds
        if (element.x < 0) {
          element.x = 0;
          fixesApplied.push(`Fixed negative X position for element ${element.id}`);
        }
        if (element.y < 0) {
          element.y = 0;
          fixesApplied.push(`Fixed negative Y position for element ${element.id}`);
        }

        // Ensure minimum element sizes
        if (element.width < 10) {
          element.width = 100;
          fixesApplied.push(`Fixed minimum width for element ${element.id}`);
        }
        if (element.height < 10) {
          element.height = 50;
          fixesApplied.push(`Fixed minimum height for element ${element.id}`);
        }
      });
    });

    // Fix 3: Clean up empty content
    fixedPresentation.slides.forEach((slide: SlideData) => {
      slide.elements = slide.elements.filter((element: ElementData) => {
        if (element.type === 'text' && (!element.content || element.content.trim().length === 0)) {
          fixesApplied.push(`Removed empty text element ${element.id}`);
          return false;
        }
        return true;
      });
    });

    // Fix 4: Ensure theme is present
    if (!fixedPresentation.theme) {
      fixedPresentation.theme = {
        primaryColor: '#1E40AF',
        secondaryColor: '#7C3AED',
        backgroundColor: '#FFFFFF',
        headingFont: 'Arial',
        bodyFont: 'Arial'
      };
      fixesApplied.push('Added default theme');
    }

    console.log(`🔧 Applied ${fixesApplied.length} fixes`);
    return { fixedPresentation, fixesApplied };
  }

  /**
   * Calculate metadata for export
   */
  private calculateMetadata(presentation: PresentationData, format: string): ExportMetadata {
    const slideCount = presentation.slides.length;
    const elementCount = presentation.slides.reduce((sum, slide) => sum + slide.elements.length, 0);
    const chartCount = presentation.slides.reduce((sum, slide) => 
      sum + slide.elements.filter(e => e.type === 'chart').length, 0
    );
    const textElementCount = presentation.slides.reduce((sum, slide) => 
      sum + slide.elements.filter(e => e.type === 'text').length, 0
    );

    // Estimate file size based on content
    let estimatedSize = slideCount * 50; // Base size per slide in KB
    estimatedSize += chartCount * 100; // Charts add more size
    estimatedSize += textElementCount * 5; // Text elements

    const compatibility = {
      powerpoint: format === 'pptx',
      googleSlides: ['pptx', 'pdf'].includes(format),
      keynote: format === 'pptx'
    };

    return {
      slideCount,
      elementCount,
      chartCount,
      textElementCount,
      estimatedFileSize: `${estimatedSize} KB`,
      compatibility
    };
  }

  /**
   * Calculate overall validation score
   */
  private calculateValidationScore(issues: ExportIssue[], presentation: PresentationData): number {
    let score = 100;

    issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'major':
          score -= 15;
          break;
        case 'minor':
          score -= 5;
          break;
      }
    });

    // Bonus points for good practices
    const hasTitle = presentation.slides.some(s => s.layout === 'title');
    if (hasTitle) score += 5;

    const hasConclusion = presentation.slides.some(s => 
      s.title.toLowerCase().includes('conclusion') || 
      s.title.toLowerCase().includes('summary')
    );
    if (hasConclusion) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Initialize validation rules
   */
  private initializeValidationRules(): ValidationRule[] {
    return [
      new ContentValidationRule(),
      new FormatValidationRule(),
      new DesignValidationRule(),
      new DataValidationRule(),
      new CompatibilityValidationRule()
    ];
  }
}

// Validation Rule Interface
interface ValidationRule {
  name: string;
  validate(
    presentation: PresentationData, 
    format: string, 
    options: any
  ): Promise<{
    issues: ExportIssue[];
    recommendations: string[];
  }>;
}

// Content Validation Rule
class ContentValidationRule implements ValidationRule {
  name = 'ContentValidation';

  async validate(presentation: PresentationData): Promise<{
    issues: ExportIssue[];
    recommendations: string[];
  }> {
    const issues: ExportIssue[] = [];
    const recommendations: string[] = [];

    // Check for empty presentation
    if (presentation.slides.length === 0) {
      issues.push({
        severity: 'critical',
        category: 'content',
        description: 'Presentation has no slides',
        solution: 'Add at least one slide to the presentation'
      });
      return { issues, recommendations };
    }

    // Check slide content
    presentation.slides.forEach((slide, index) => {
      if (!slide.title || slide.title.trim().length === 0) {
        issues.push({
          severity: 'major',
          category: 'content',
          description: `Slide ${index + 1} is missing a title`,
          solution: 'Add a descriptive title to the slide',
          slideId: slide.id
        });
      }

      if (slide.elements.length === 0) {
        issues.push({
          severity: 'major',
          category: 'content',
          description: `Slide ${index + 1} has no content elements`,
          solution: 'Add text, charts, or images to the slide',
          slideId: slide.id
        });
      }

      // Check for overly long titles
      if (slide.title && slide.title.length > 80) {
        issues.push({
          severity: 'minor',
          category: 'content',
          description: `Slide ${index + 1} title is too long`,
          solution: 'Shorten the title to under 80 characters',
          slideId: slide.id
        });
      }
    });

    // Add recommendations
    if (presentation.slides.length < 3) {
      recommendations.push('Consider adding more slides for a complete presentation');
    }

    if (presentation.slides.length > 20) {
      recommendations.push('Consider reducing slide count for better audience engagement');
    }

    return { issues, recommendations };
  }
}

// Format Validation Rule
class FormatValidationRule implements ValidationRule {
  name = 'FormatValidation';

  async validate(
    presentation: PresentationData,
    format: string
  ): Promise<{
    issues: ExportIssue[];
    recommendations: string[];
  }> {
    const issues: ExportIssue[] = [];
    const recommendations: string[] = [];

    // Format-specific validations
    if (format === 'pdf') {
      // PDF doesn't support interactive elements
      presentation.slides.forEach((slide, slideIndex) => {
        slide.elements.forEach(element => {
          if (element.type === 'chart' && element.chartConfig) {
            recommendations.push(`Chart in slide ${slideIndex + 1} will be static in PDF format`);
          }
        });
      });
    }

    if (format === 'pptx') {
      // Check for PowerPoint compatibility
      presentation.slides.forEach((slide, slideIndex) => {
        slide.elements.forEach(element => {
          if (element.fontFamily && !this.isPowerPointFont(element.fontFamily)) {
            issues.push({
              severity: 'minor',
              category: 'format',
              description: `Unsupported font "${element.fontFamily}" in slide ${slideIndex + 1}`,
              solution: 'Use standard fonts like Arial, Times New Roman, or Calibri',
              slideId: slide.id,
              elementId: element.id
            });
          }
        });
      });
    }

    return { issues, recommendations };
  }

  private isPowerPointFont(fontFamily: string): boolean {
    const standardFonts = [
      'Arial', 'Times New Roman', 'Calibri', 'Helvetica', 'Verdana',
      'Tahoma', 'Georgia', 'Trebuchet MS', 'Comic Sans MS'
    ];
    return standardFonts.includes(fontFamily);
  }
}

// Design Validation Rule
class DesignValidationRule implements ValidationRule {
  name = 'DesignValidation';

  async validate(presentation: PresentationData): Promise<{
    issues: ExportIssue[];
    recommendations: string[];
  }> {
    const issues: ExportIssue[] = [];
    const recommendations: string[] = [];

    presentation.slides.forEach((slide, slideIndex) => {
      // Check for overlapping elements
      const overlaps = this.findOverlappingElements(slide.elements);
      if (overlaps.length > 0) {
        issues.push({
          severity: 'major',
          category: 'design',
          description: `Slide ${slideIndex + 1} has overlapping elements`,
          solution: 'Adjust element positions to avoid overlaps',
          slideId: slide.id
        });
      }

      // Check element density
      if (slide.elements.length > 8) {
        issues.push({
          severity: 'minor',
          category: 'design',
          description: `Slide ${slideIndex + 1} has too many elements (${slide.elements.length})`,
          solution: 'Consider splitting content across multiple slides',
          slideId: slide.id
        });
      }

      // Check for consistent sizing
      const textElements = slide.elements.filter(e => e.type === 'text');
      if (textElements.length > 1) {
        const fontSizes = textElements.map(e => e.fontSize || 16);
        const sizesVariation = Math.max(...fontSizes) - Math.min(...fontSizes);
        if (sizesVariation > 20) {
          recommendations.push(`Consider using more consistent font sizes in slide ${slideIndex + 1}`);
        }
      }
    });

    return { issues, recommendations };
  }

  private findOverlappingElements(elements: ElementData[]): string[] {
    const overlaps: string[] = [];
    
    for (let i = 0; i < elements.length; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        if (this.elementsOverlap(elements[i], elements[j])) {
          overlaps.push(`${elements[i].id} overlaps with ${elements[j].id}`);
        }
      }
    }
    
    return overlaps;
  }

  private elementsOverlap(elem1: ElementData, elem2: ElementData): boolean {
    return !(elem1.x + elem1.width < elem2.x || 
             elem2.x + elem2.width < elem1.x || 
             elem1.y + elem1.height < elem2.y || 
             elem2.y + elem2.height < elem1.y);
  }
}

// Data Validation Rule
class DataValidationRule implements ValidationRule {
  name = 'DataValidation';

  async validate(presentation: PresentationData): Promise<{
    issues: ExportIssue[];
    recommendations: string[];
  }> {
    const issues: ExportIssue[] = [];
    const recommendations: string[] = [];

    presentation.slides.forEach((slide, slideIndex) => {
      slide.elements.forEach(element => {
        if (element.type === 'chart') {
          if (!element.chartConfig) {
            issues.push({
              severity: 'critical',
              category: 'data',
              description: `Chart in slide ${slideIndex + 1} is missing configuration`,
              solution: 'Add chart configuration with data and display options',
              slideId: slide.id,
              elementId: element.id
            });
          } else if (!element.chartConfig.data || element.chartConfig.data.length === 0) {
            issues.push({
              severity: 'critical',
              category: 'data',
              description: `Chart in slide ${slideIndex + 1} has no data`,
              solution: 'Add data to the chart or remove the chart element',
              slideId: slide.id,
              elementId: element.id
            });
          }
        }

        if (element.type === 'image' && (!element.src || element.src.trim().length === 0)) {
          issues.push({
            severity: 'major',
            category: 'data',
            description: `Image in slide ${slideIndex + 1} is missing source`,
            solution: 'Add a valid image source or remove the image element',
            slideId: slide.id,
            elementId: element.id
          });
        }
      });
    });

    return { issues, recommendations };
  }
}

// Compatibility Validation Rule
class CompatibilityValidationRule implements ValidationRule {
  name = 'CompatibilityValidation';

  async validate(
    presentation: PresentationData,
    format: string
  ): Promise<{
    issues: ExportIssue[];
    recommendations: string[];
  }> {
    const issues: ExportIssue[] = [];
    const recommendations: string[] = [];

    // Check for features not supported in target format
    if (format === 'pdf') {
      const hasAnimations = presentation.slides.some(slide =>
        slide.elements.some(element => element.type === 'chart')
      );
      
      if (hasAnimations) {
        recommendations.push('Interactive charts will be converted to static images in PDF format');
      }
    }

    // Check color compatibility
    if (presentation.theme) {
      const colors = [
        presentation.theme.primaryColor,
        presentation.theme.secondaryColor,
        presentation.theme.backgroundColor
      ];

      colors.forEach(color => {
        if (color && !this.isValidColor(color)) {
          issues.push({
            severity: 'minor',
            category: 'format',
            description: `Invalid color format: ${color}`,
            solution: 'Use valid hex color codes (e.g., #FF0000)'
          });
        }
      });
    }

    return { issues, recommendations };
  }

  private isValidColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }
}

// Export the validator instance
export const exportValidator = new ExportValidator();