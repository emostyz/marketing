/**
 * EasyDecks.ai Slide QA System
 * Comprehensive quality assurance for slide generation with OpenAI validation
 */

import { OpenAI } from 'openai';

export interface SlideQAResult {
  slideId: string;
  overallScore: number;
  passed: boolean;
  issues: QAIssue[];
  recommendations: string[];
  tests: {
    dataAccuracy: QATestResult;
    narrativeCoherence: QATestResult;
    visualClarity: QATestResult;
    executiveReadiness: QATestResult;
    contentQuality: QATestResult;
    designConsistency: QATestResult;
  };
}

export interface QAIssue {
  severity: 'critical' | 'major' | 'minor';
  category: 'data' | 'design' | 'content' | 'structure';
  description: string;
  suggestion: string;
  location?: string;
}

export interface QATestResult {
  passed: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
}

export interface SlideData {
  id: string;
  title: string;
  content: string;
  layout: string;
  elements: SlideElement[];
  notes?: string;
  rawData?: any[];
  insights?: any[];
  charts?: any[];
}

export interface SlideElement {
  type: 'text' | 'chart' | 'image' | 'table' | 'callout';
  content: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
  styling?: any;
}

export class SlideQASystem {
  private openai: OpenAI | null;
  private qaPrompts: Record<string, string>;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not found. QA system will use fallback validation.');
      this.openai = null;
    } else {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        timeout: 30000,
        maxRetries: 2
      });
    }

    this.qaPrompts = this.initializeQAPrompts();
  }

  /**
   * Main QA validation method for slides
   */
  async validateSlides(slides: SlideData[]): Promise<SlideQAResult[]> {
    console.log(`🔍 Starting QA validation for ${slides.length} slides...`);
    
    const results: SlideQAResult[] = [];

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      console.log(`   Validating slide ${i + 1}/${slides.length}: "${slide.title}"`);
      
      try {
        const qaResult = await this.validateSlide(slide, slides);
        results.push(qaResult);
      } catch (error) {
        console.error(`❌ QA failed for slide ${slide.id}:`, error);
        
        // Create fallback result
        results.push({
          slideId: slide.id,
          overallScore: 60, // Default moderate score
          passed: false,
          issues: [{
            severity: 'major',
            category: 'structure',
            description: 'QA validation failed due to system error',
            suggestion: 'Review slide manually for quality issues'
          }],
          recommendations: ['Manual review required due to QA system error'],
          tests: this.createFallbackTestResults()
        });
      }
    }

    console.log(`✅ QA validation completed. Average score: ${this.calculateAverageScore(results).toFixed(1)}/100`);
    return results;
  }

  /**
   * Validate individual slide
   */
  private async validateSlide(slide: SlideData, allSlides: SlideData[]): Promise<SlideQAResult> {
    const tests = {
      dataAccuracy: await this.testDataAccuracy(slide),
      narrativeCoherence: await this.testNarrativeCoherence(slide, allSlides),
      visualClarity: await this.testVisualClarity(slide),
      executiveReadiness: await this.testExecutiveReadiness(slide),
      contentQuality: await this.testContentQuality(slide),
      designConsistency: await this.testDesignConsistency(slide, allSlides)
    };

    // Calculate overall score
    const scores = Object.values(tests).map(test => test.score);
    const overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    // Collect all issues
    const allIssues: QAIssue[] = [];
    const allRecommendations: string[] = [];

    Object.entries(tests).forEach(([testName, result]) => {
      result.issues.forEach(issue => {
        allIssues.push({
          severity: result.score < 60 ? 'critical' : result.score < 80 ? 'major' : 'minor',
          category: this.getCategoryForTest(testName),
          description: issue,
          suggestion: `Improve ${testName}: ${issue}`,
          location: slide.id
        });
      });
      allRecommendations.push(...result.recommendations);
    });

    // Use AI for additional validation if available
    if (this.openai) {
      try {
        const aiValidation = await this.performAIValidation(slide);
        allRecommendations.push(...aiValidation.recommendations);
      } catch (error) {
        console.warn('AI validation failed, using rule-based validation only');
      }
    }

    return {
      slideId: slide.id,
      overallScore,
      passed: overallScore >= 75, // 75% threshold for passing
      issues: allIssues,
      recommendations: allRecommendations,
      tests
    };
  }

  /**
   * Test data accuracy and consistency
   */
  private async testDataAccuracy(slide: SlideData): Promise<QATestResult> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check for data consistency in charts
    if (slide.charts && slide.charts.length > 0) {
      slide.charts.forEach((chart, index) => {
        if (!chart.data || chart.data.length === 0) {
          issues.push(`Chart ${index + 1} has no data`);
          score -= 20;
        }

        if (chart.data && chart.data.some((item: any) => 
          Object.values(item).some(value => value === undefined || value === null)
        )) {
          issues.push(`Chart ${index + 1} contains undefined or null values`);
          score -= 15;
        }
      });
    }

    // Check for data references in content
    const contentHasNumbers = /\d+(\.\d+)?%?/.test(slide.content);
    if (contentHasNumbers && (!slide.rawData || slide.rawData.length === 0)) {
      issues.push('Content contains numbers but no supporting data source');
      score -= 25;
    }

    // Check for inconsistent data formats
    const percentagePattern = /\d+(\.\d+)?%/g;
    const currencyPattern = /\$\d+/g;
    const percentages = slide.content.match(percentagePattern) || [];
    const currencies = slide.content.match(currencyPattern) || [];

    if (percentages.length > 0 && percentages.some(p => parseFloat(p) > 100)) {
      issues.push('Percentage values over 100% detected');
      score -= 10;
    }

    // Add recommendations
    if (issues.length === 0) {
      recommendations.push('Data accuracy is excellent');
    } else {
      recommendations.push('Verify all data sources and calculations');
      recommendations.push('Ensure consistent data formatting throughout slide');
    }

    return {
      passed: score >= 75,
      score: Math.max(0, score),
      issues,
      recommendations
    };
  }

  /**
   * Test narrative coherence and flow
   */
  private async testNarrativeCoherence(slide: SlideData, allSlides: SlideData[]): Promise<QATestResult> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check title clarity
    if (!slide.title || slide.title.length < 5) {
      issues.push('Slide title is too short or missing');
      score -= 20;
    }

    if (slide.title && slide.title.length > 80) {
      issues.push('Slide title is too long for executive presentation');
      score -= 10;
    }

    // Check content structure
    if (!slide.content || slide.content.length < 20) {
      issues.push('Slide content is too brief to convey meaningful insights');
      score -= 15;
    }

    // Check for logical flow indicators
    const hasIntroduction = slide.content.toLowerCase().includes('introduction') || 
                           slide.content.toLowerCase().includes('overview');
    const hasConclusion = slide.content.toLowerCase().includes('conclusion') || 
                         slide.content.toLowerCase().includes('summary') ||
                         slide.content.toLowerCase().includes('recommendation');
    
    const slideIndex = allSlides.findIndex(s => s.id === slide.id);
    
    // First slide should have introduction elements
    if (slideIndex === 0 && !hasIntroduction && !slide.layout.includes('title')) {
      issues.push('First slide should introduce the presentation topic');
      score -= 15;
    }

    // Last slide should have conclusions
    if (slideIndex === allSlides.length - 1 && !hasConclusion) {
      issues.push('Final slide should include conclusions or recommendations');
      score -= 15;
    }

    // Check for narrative connectors
    const narrativeWords = ['therefore', 'however', 'furthermore', 'in addition', 'as a result', 'consequently'];
    const hasNarrativeFlow = narrativeWords.some(word => 
      slide.content.toLowerCase().includes(word)
    );

    if (!hasNarrativeFlow && slideIndex > 0) {
      issues.push('Slide lacks narrative connectors to previous content');
      score -= 10;
    }

    // Add recommendations
    if (issues.length === 0) {
      recommendations.push('Narrative coherence is excellent');
    } else {
      recommendations.push('Improve slide title clarity and length');
      recommendations.push('Add narrative connectors to improve flow');
      recommendations.push('Ensure each slide builds logically on previous content');
    }

    return {
      passed: score >= 75,
      score: Math.max(0, score),
      issues,
      recommendations
    };
  }

  /**
   * Test visual clarity and design
   */
  private async testVisualClarity(slide: SlideData): Promise<QATestResult> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check element count
    if (slide.elements && slide.elements.length > 7) {
      issues.push(`Too many elements (${slide.elements.length}). Maximum 7 recommended for clarity`);
      score -= 20;
    }

    // Check for visual balance
    if (slide.elements) {
      const textElements = slide.elements.filter(e => e.type === 'text').length;
      const visualElements = slide.elements.filter(e => ['chart', 'image'].includes(e.type)).length;

      if (textElements > 5) {
        issues.push('Too much text content. Consider using more visuals');
        score -= 15;
      }

      if (visualElements === 0 && slide.layout !== 'title') {
        issues.push('Slide lacks visual elements. Add charts or diagrams');
        score -= 10;
      }

      // Check for overlapping elements
      const overlapping = this.detectOverlappingElements(slide.elements);
      if (overlapping.length > 0) {
        issues.push(`${overlapping.length} elements are overlapping`);
        score -= 15;
      }
    }

    // Check content density
    const contentLength = slide.content.length;
    if (contentLength > 500) {
      issues.push('Content is too dense for a single slide');
      score -= 15;
    }

    // Check for consistent sizing
    if (slide.elements) {
      const inconsistentSizing = this.checkInconsistentSizing(slide.elements);
      if (inconsistentSizing) {
        issues.push('Element sizing lacks consistency');
        score -= 10;
      }
    }

    // Add recommendations
    if (issues.length === 0) {
      recommendations.push('Visual clarity is excellent');
    } else {
      recommendations.push('Reduce text density and increase visual elements');
      recommendations.push('Ensure consistent element sizing and spacing');
      recommendations.push('Follow 6x6 rule: max 6 bullet points with 6 words each');
    }

    return {
      passed: score >= 75,
      score: Math.max(0, score),
      issues,
      recommendations
    };
  }

  /**
   * Test executive readiness
   */
  private async testExecutiveReadiness(slide: SlideData): Promise<QATestResult> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check for executive-appropriate language
    const technicalJargon = ['API', 'database', 'algorithm', 'implementation', 'configuration'];
    const jargonCount = technicalJargon.filter(term => 
      slide.content.toLowerCase().includes(term.toLowerCase())
    ).length;

    if (jargonCount > 2) {
      issues.push('Too much technical jargon for executive audience');
      score -= 20;
    }

    // Check for actionable insights
    const actionWords = ['recommend', 'suggest', 'should', 'propose', 'advise', 'strategy'];
    const hasActionableContent = actionWords.some(word => 
      slide.content.toLowerCase().includes(word)
    );

    if (!hasActionableContent && !slide.layout.includes('title')) {
      issues.push('Slide lacks actionable insights or recommendations');
      score -= 25;
    }

    // Check for executive summary elements
    const hasSummary = slide.content.toLowerCase().includes('summary') ||
                      slide.content.toLowerCase().includes('key points') ||
                      slide.content.toLowerCase().includes('highlights');

    const slideIndex = slide.title.toLowerCase().includes('executive') || 
                      slide.title.toLowerCase().includes('summary');

    if (slideIndex && !hasSummary) {
      issues.push('Executive slides should include clear summary elements');
      score -= 15;
    }

    // Check for appropriate metrics
    const hasMetrics = /\d+%|\$\d+|ROI|revenue|profit|growth/i.test(slide.content);
    if (!hasMetrics && !slide.layout.includes('title')) {
      issues.push('Consider adding quantitative metrics for executive impact');
      score -= 10;
    }

    // Check slide complexity
    const sentenceCount = slide.content.split(/[.!?]/).length;
    if (sentenceCount > 10) {
      issues.push('Content too complex for executive consumption');
      score -= 15;
    }

    // Add recommendations
    if (issues.length === 0) {
      recommendations.push('Slide is executive-ready');
    } else {
      recommendations.push('Simplify language and reduce technical jargon');
      recommendations.push('Add clear, actionable recommendations');
      recommendations.push('Include relevant business metrics and ROI');
      recommendations.push('Structure content for quick executive scanning');
    }

    return {
      passed: score >= 75,
      score: Math.max(0, score),
      issues,
      recommendations
    };
  }

  /**
   * Test content quality with AI assistance
   */
  private async testContentQuality(slide: SlideData): Promise<QATestResult> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Basic content checks
    if (!slide.content || slide.content.trim().length === 0) {
      issues.push('Slide has no content');
      return {
        passed: false,
        score: 0,
        issues,
        recommendations: ['Add meaningful content to the slide']
      };
    }

    // Check for spelling and grammar (basic)
    const commonErrors = this.detectCommonErrors(slide.content);
    if (commonErrors.length > 0) {
      issues.push(...commonErrors);
      score -= commonErrors.length * 5;
    }

    // Check content relevance
    const hasRelevantKeywords = this.checkContentRelevance(slide);
    if (!hasRelevantKeywords) {
      issues.push('Content may not be relevant to slide title');
      score -= 15;
    }

    // Check for proper structure
    const hasStructure = this.checkContentStructure(slide.content);
    if (!hasStructure) {
      issues.push('Content lacks clear structure or bullet points');
      score -= 10;
    }

    // Use AI for advanced content quality if available
    if (this.openai) {
      try {
        const aiQuality = await this.assessContentQualityWithAI(slide);
        if (aiQuality.score < 80) {
          issues.push(aiQuality.feedback);
          score = Math.min(score, aiQuality.score);
        }
        recommendations.push(...aiQuality.suggestions);
      } catch (error) {
        console.warn('AI content quality assessment failed');
      }
    }

    return {
      passed: score >= 75,
      score: Math.max(0, score),
      issues,
      recommendations: recommendations.length > 0 ? recommendations : ['Content quality is satisfactory']
    };
  }

  /**
   * Test design consistency across slides
   */
  private async testDesignConsistency(slide: SlideData, allSlides: SlideData[]): Promise<QATestResult> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    if (allSlides.length < 2) {
      return {
        passed: true,
        score: 100,
        issues: [],
        recommendations: ['Design consistency check requires multiple slides']
      };
    }

    // Check layout consistency
    const layoutTypes = allSlides.map(s => s.layout);
    const uniqueLayouts = new Set(layoutTypes);
    
    if (uniqueLayouts.size > allSlides.length * 0.8) {
      issues.push('Too many different layout types. Consider standardizing');
      score -= 15;
    }

    // Check element positioning consistency
    const currentSlideElements = slide.elements || [];
    const otherSlides = allSlides.filter(s => s.id !== slide.id);
    
    const inconsistentPositioning = this.checkPositionConsistency(currentSlideElements, otherSlides);
    if (inconsistentPositioning) {
      issues.push('Element positioning inconsistent with other slides');
      score -= 10;
    }

    // Check color scheme consistency
    const inconsistentColors = this.checkColorConsistency(slide, allSlides);
    if (inconsistentColors) {
      issues.push('Color scheme deviates from presentation standard');
      score -= 10;
    }

    return {
      passed: score >= 75,
      score: Math.max(0, score),
      issues,
      recommendations: issues.length === 0 ? 
        ['Design consistency is excellent'] : 
        ['Standardize layouts and positioning', 'Maintain consistent color schemes']
    };
  }

  /**
   * AI-powered validation using OpenAI
   */
  private async performAIValidation(slide: SlideData): Promise<{ recommendations: string[] }> {
    if (!this.openai) {
      return { recommendations: [] };
    }

    const prompt = `${this.qaPrompts.contentQuality}

Slide Title: ${slide.title}
Slide Content: ${slide.content}
Layout: ${slide.layout}
Elements: ${slide.elements?.length || 0} elements

Provide specific recommendations for improving this slide:`;

    try {
      if (!this.openai) {
        return { recommendations: ['Use more data-driven insights', 'Improve visual clarity', 'Strengthen executive summary'] };
      }
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 500
      });

      const recommendations = response.choices[0]?.message?.content
        ?.split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^[-*]\s*/, '').trim()) || [];

      return { recommendations };
    } catch (error) {
      console.warn('AI validation failed:', error);
      return { recommendations: [] };
    }
  }

  /**
   * AI-powered content quality assessment
   */
  private async assessContentQualityWithAI(slide: SlideData): Promise<{ score: number; feedback: string; suggestions: string[] }> {
    const prompt = `${this.qaPrompts.aiContentQuality}

Title: ${slide.title}
Content: ${slide.content}

Rate the content quality (0-100) and provide feedback:`;

    try {
      if (!this.openai) {
        return { score: 75, feedback: 'AI validation unavailable - using fallback scoring', suggestions: ['Add more visual elements', 'Improve data presentation'] };
      }
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 300
      });

      const content = response.choices[0]?.message?.content || '';
      const scoreMatch = content.match(/Score:\s*(\d+)/i);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 75;

      return {
        score,
        feedback: content.includes('Issues:') ? content.split('Issues:')[1]?.split('\n')[0] || '' : '',
        suggestions: content.split('Suggestions:')[1]?.split('\n').filter(s => s.trim()) || []
      };
    } catch (error) {
      return { score: 75, feedback: '', suggestions: [] };
    }
  }

  // Utility methods
  private calculateAverageScore(results: SlideQAResult[]): number {
    if (results.length === 0) return 0;
    return results.reduce((sum, result) => sum + result.overallScore, 0) / results.length;
  }

  private getCategoryForTest(testName: string): 'data' | 'design' | 'content' | 'structure' {
    const categories: Record<string, 'data' | 'design' | 'content' | 'structure'> = {
      dataAccuracy: 'data',
      visualClarity: 'design',
      designConsistency: 'design',
      contentQuality: 'content',
      narrativeCoherence: 'structure',
      executiveReadiness: 'content'
    };
    return categories[testName] || 'content';
  }

  private createFallbackTestResults() {
    const fallbackResult: QATestResult = {
      passed: false,
      score: 60,
      issues: ['QA system error'],
      recommendations: ['Manual review required']
    };

    return {
      dataAccuracy: fallbackResult,
      narrativeCoherence: fallbackResult,
      visualClarity: fallbackResult,
      executiveReadiness: fallbackResult,
      contentQuality: fallbackResult,
      designConsistency: fallbackResult
    };
  }

  private detectOverlappingElements(elements: SlideElement[]): SlideElement[] {
    const overlapping: SlideElement[] = [];
    
    for (let i = 0; i < elements.length; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        const elem1 = elements[i];
        const elem2 = elements[j];
        
        const overlap = this.elementsOverlap(elem1, elem2);
        if (overlap && !overlapping.includes(elem1)) {
          overlapping.push(elem1);
        }
      }
    }
    
    return overlapping;
  }

  private elementsOverlap(elem1: SlideElement, elem2: SlideElement): boolean {
    const rect1 = {
      left: elem1.position.x,
      right: elem1.position.x + elem1.size.width,
      top: elem1.position.y,
      bottom: elem1.position.y + elem1.size.height
    };
    
    const rect2 = {
      left: elem2.position.x,
      right: elem2.position.x + elem2.size.width,
      top: elem2.position.y,
      bottom: elem2.position.y + elem2.size.height
    };
    
    return !(rect1.right < rect2.left || 
             rect2.right < rect1.left || 
             rect1.bottom < rect2.top || 
             rect2.bottom < rect1.top);
  }

  private checkInconsistentSizing(elements: SlideElement[]): boolean {
    const textElements = elements.filter(e => e.type === 'text');
    if (textElements.length < 2) return false;
    
    const widths = textElements.map(e => e.size.width);
    const avgWidth = widths.reduce((sum, w) => sum + w, 0) / widths.length;
    
    return widths.some(w => Math.abs(w - avgWidth) > avgWidth * 0.3);
  }

  private detectCommonErrors(content: string): string[] {
    const errors: string[] = [];
    
    // Check for common spelling errors
    const commonMisspellings = {
      'recieve': 'receive',
      'definately': 'definitely',
      'seperate': 'separate',
      'occured': 'occurred'
    };
    
    Object.entries(commonMisspellings).forEach(([wrong, correct]) => {
      if (content.toLowerCase().includes(wrong)) {
        errors.push(`Spelling error: "${wrong}" should be "${correct}"`);
      }
    });
    
    // Check for repeated words
    const words = content.split(/\s+/);
    for (let i = 0; i < words.length - 1; i++) {
      if (words[i].toLowerCase() === words[i + 1].toLowerCase()) {
        errors.push(`Repeated word: "${words[i]}"`);
      }
    }
    
    return errors;
  }

  private checkContentRelevance(slide: SlideData): boolean {
    const titleWords = slide.title.toLowerCase().split(/\s+/);
    const contentWords = slide.content.toLowerCase().split(/\s+/);
    
    const relevantWords = titleWords.filter(word => 
      word.length > 3 && contentWords.includes(word)
    );
    
    return relevantWords.length / titleWords.length > 0.3;
  }

  private checkContentStructure(content: string): boolean {
    // Check for bullet points, numbered lists, or clear sections
    const hasBullets = /[•\-\*]\s/.test(content);
    const hasNumbers = /\d+\.\s/.test(content);
    const hasSections = /\n\n/.test(content);
    
    return hasBullets || hasNumbers || hasSections;
  }

  private checkPositionConsistency(elements: SlideElement[], otherSlides: SlideData[]): boolean {
    // Simplified check - in real implementation, this would be more sophisticated
    const titleElements = elements.filter(e => e.type === 'text' && e.position.y < 100);
    return titleElements.length > 1; // Inconsistent if multiple title-position elements
  }

  private checkColorConsistency(slide: SlideData, allSlides: SlideData[]): boolean {
    // Simplified check - would analyze actual color schemes in real implementation
    return false; // Assume consistent for now
  }

  private initializeQAPrompts(): Record<string, string> {
    return {
      contentQuality: `You are an expert presentation reviewer. Analyze the slide content for:
1. Clarity and conciseness
2. Professional language
3. Logical structure
4. Actionable insights
5. Executive appropriateness

Rate the quality and provide specific improvement suggestions.`,

      aiContentQuality: `Rate this slide content quality (0-100) based on:
- Clarity and readability
- Professional tone
- Logical flow
- Executive appeal
- Actionable insights

Format: Score: X
Issues: [if any]
Suggestions: [list specific improvements]`
    };
  }
}

export const slideQASystem = new SlideQASystem();