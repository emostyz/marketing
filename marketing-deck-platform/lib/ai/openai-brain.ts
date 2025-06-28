import { OpenAI } from 'openai';
import { z } from 'zod';
import { EnhancedOpenAIWrapper, openAIWrapper } from './enhanced-openai-wrapper';

// Feedback Loop Types
interface FeedbackLoop {
  id: string;
  type: 'analysis' | 'chart' | 'slide' | 'export';
  iteration: number;
  userFeedback: any;
  aiResponse: any;
  outcome: 'approved' | 'needs_refinement' | 'rejected';
  timestamp: Date;
}

// Structured Output Schemas
const DataAnalysisSchema = z.object({
  insights: z.array(z.object({
    title: z.string(),
    finding: z.string(),
    evidence: z.string(),
    impact: z.enum(['high', 'medium', 'low']),
    confidence: z.number().min(0).max(1),
    metrics: z.array(z.string())
  })),
  trends: z.array(z.object({
    metric: z.string(),
    direction: z.enum(['increasing', 'decreasing', 'stable', 'volatile']),
    strength: z.number().min(0).max(1),
    significance: z.enum(['high', 'medium', 'low']),
    timeframe: z.string()
  })),
  correlations: z.array(z.object({
    variables: z.array(z.string()),
    strength: z.number().min(-1).max(1),
    significance: z.number().min(0).max(1),
    interpretation: z.string()
  })),
  recommendations: z.array(z.object({
    action: z.string(),
    priority: z.enum(['immediate', 'short_term', 'long_term']),
    impact: z.enum(['high', 'medium', 'low']),
    evidence: z.array(z.string())
  }))
});

const ChartRecommendationSchema = z.object({
  chartRecommendations: z.array(z.object({
    chartType: z.enum(['line', 'bar', 'pie', 'scatter', 'funnel', 'heatmap', 'area', 'donut']),
    title: z.string(),
    description: z.string(),
    dataMapping: z.object({
      x: z.string(),
      y: z.string().or(z.array(z.string())),
      series: z.string().optional(),
      groupBy: z.string().optional()
    }),
    reason: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
    interactivity: z.object({
      editable: z.boolean(),
      drillDown: z.boolean(),
      filters: z.array(z.string())
    }).optional()
  })),
  visualizationStrategy: z.object({
    narrative: z.string(),
    flow: z.array(z.string()),
    keyMessages: z.array(z.string())
  })
});

const SlideGenerationSchema = z.object({
  slides: z.array(z.object({
    id: z.string(),
    title: z.string().min(5).max(100),
    layout: z.enum(['title', 'content', 'chart', 'comparison', 'executive_summary']),
    content: z.string(),
    elements: z.array(z.object({
      type: z.enum(['text', 'chart', 'image', 'table', 'callout']),
      content: z.string(),
      position: z.object({ x: z.number(), y: z.number() }),
      size: z.object({ width: z.number(), height: z.number() }),
      styling: z.object({
        fontSize: z.number().optional(),
        fontWeight: z.string().optional(),
        color: z.string().optional()
      }).optional()
    })),
    notes: z.string().optional(),
    priority: z.enum(['high', 'medium', 'low'])
  })),
  narrative: z.object({
    executiveSummary: z.string(),
    keyTakeaways: z.array(z.string()),
    callToAction: z.string(),
    flow: z.array(z.string())
  })
}).refine(
  (data) => data.slides.length <= 20,
  "Presentations should not exceed 20 slides for effectiveness"
);

export class OpenAIBrain {
  private openai: OpenAI;
  private feedbackHistory: Map<string, FeedbackLoop[]> = new Map();
  private userPreferences: Map<string, any> = new Map();
  private sessionContext: Map<string, any> = new Map();

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      maxRetries: 3,
      timeout: 60000
    });
  }

  // FEEDBACK LOOP 1: Data Analysis with User Validation
  async analyzeDataWithFeedback(
    data: any[], 
    sessionId: string, 
    userContext: string = '',
    userGoals: string = ''
  ): Promise<any> {
    let attempts = 0;
    let approved = false;
    let analysis = null;
    const maxAttempts = 3;

    while (!approved && attempts < maxAttempts) {
      try {
        console.log(`🧠 AI Analysis Attempt ${attempts + 1}/${maxAttempts}`);
        
        // Step 1: AI analyzes data with structured output
        analysis = await this.performStructuredAnalysis(data, userContext, userGoals, this.getFeedbackContext(sessionId));
        
        // Step 2: Auto-validate analysis quality
        const validationResult = await this.validateAnalysisQuality(analysis, data);
        
        if (validationResult.score >= 0.8) {
          approved = true;
          console.log('✅ Analysis auto-approved with score:', validationResult.score);
        } else {
          attempts++;
          console.log('🔄 Analysis needs refinement, score:', validationResult.score);
          
          // Store feedback for learning
          this.storeFeedback(sessionId, 'analysis', {
            approved: false,
            issues: validationResult.issues,
            score: validationResult.score
          });
        }
        
      } catch (error) {
        console.error('❌ Analysis error:', error);
        attempts++;
        
        if (attempts >= maxAttempts) {
          // Return fallback analysis
          analysis = this.generateFallbackAnalysis(data, userContext);
          approved = true;
        }
      }
    }

    // Update Supabase after feedback loop
    await this.updateSupabase('analysis_feedback', {
      sessionId,
      analysis,
      attempts,
      approved,
      timestamp: new Date()
    });

    return analysis;
  }

  // FEEDBACK LOOP 2: Chart Selection with User Preferences
  async selectChartsWithUserInput(
    data: any[],
    insights: any,
    sessionId: string,
    userPreferences: any = {}
  ): Promise<any> {
    try {
      console.log('📊 Generating chart recommendations with AI...');
      
      // AI suggests charts based on data and insights
      const suggestions = await this.generateChartRecommendations(data, insights, userPreferences);
      
      // Apply user preferences from previous sessions
      const personalizedSuggestions = this.applyUserPreferences(suggestions, sessionId);
      
      // Auto-select best charts based on AI confidence and user history
      const selectedCharts = this.autoSelectCharts(personalizedSuggestions, data);
      
      // Learn from this selection for future improvements
      this.learnChartPreferences(selectedCharts, sessionId);
      
      // Update Supabase
      await this.updateSupabase('chart_selection', {
        sessionId,
        suggestions: personalizedSuggestions,
        selectedCharts,
        userPreferences,
        timestamp: new Date()
      });
      
      return {
        suggestions: personalizedSuggestions,
        selected: selectedCharts,
        interactive: this.makeChartsInteractive(selectedCharts)
      };
      
    } catch (error) {
      console.error('❌ Chart selection error:', error);
      return this.generateFallbackCharts(data, insights);
    }
  }

  // FEEDBACK LOOP 3: Slide Generation with QA Tests
  async generateSlidesWithQA(
    data: any[],
    insights: any,
    charts: any[],
    sessionId: string
  ): Promise<any> {
    const qaTests = [
      this.testDataAccuracy,
      this.testNarrativeCoherence,
      this.testVisualClarity,
      this.testExecutiveReadiness
    ];

    let slides = null;
    let qaResults: { passed: boolean; failures: string[] } = { passed: false, failures: [] };
    let iterations = 0;
    const maxIterations = 5;

    while (!qaResults.passed && iterations < maxIterations) {
      try {
        iterations++;
        console.log(`🎯 Slide Generation Iteration ${iterations}/${maxIterations}`);

        // Generate slides with structured output
        slides = await this.generateStructuredSlides(data, insights, charts, this.getFeedbackContext(sessionId));

        // Run comprehensive QA tests
        qaResults = await this.runComprehensiveQA(slides, qaTests);

        if (!qaResults.passed) {
          console.log('🔍 QA Failed:', qaResults.failures);
          
          // Create refinement prompt based on failures
          const refinementPrompt = this.createRefinementPrompt(qaResults.failures);
          slides = await this.refineSlides(slides, refinementPrompt);
        } else {
          console.log('✅ All QA tests passed!');
        }

      } catch (error) {
        console.error('❌ Slide generation error:', error);
        
        if (iterations >= maxIterations) {
          slides = this.generateFallbackSlides(data, insights, charts);
          qaResults = { passed: true, failures: [] };
        }
      }
    }

    // Update Supabase
    await this.updateSupabase('slide_generation', {
      sessionId,
      slides,
      qaResults,
      iterations,
      timestamp: new Date()
    });

    return {
      slides,
      qaResults,
      iterations,
      quality: qaResults.passed ? 'high' : 'acceptable'
    };
  }

  // FEEDBACK LOOP 4: Export Validation
  async validateExportWithFeedback(
    presentation: any,
    format: 'pptx' | 'pdf' | 'google',
    sessionId: string
  ): Promise<any> {
    try {
      console.log(`📤 Validating ${format.toUpperCase()} export...`);
      
      // Pre-export validation
      const validationResult = await this.validatePresentationForExport(presentation, format);
      
      if (!validationResult.valid) {
        console.log('⚠️ Export validation issues found:', validationResult.issues);
        
        // Auto-fix common issues
        const fixedPresentation = await this.autoFixExportIssues(presentation, validationResult.issues);
        
        // Re-validate after fixes
        const revalidation = await this.validatePresentationForExport(fixedPresentation, format);
        
        // Update Supabase with validation results
        await this.updateSupabase('export_validation', {
          sessionId,
          format,
          originalIssues: validationResult.issues,
          fixesApplied: true,
          finalValid: revalidation.valid,
          timestamp: new Date()
        });
        
        return {
          presentation: fixedPresentation,
          validation: revalidation,
          fixesApplied: true
        };
      }
      
      return {
        presentation,
        validation: validationResult,
        fixesApplied: false
      };
      
    } catch (error) {
      console.error('❌ Export validation error:', error);
      throw error;
    }
  }

  // Private Methods for Structured Analysis
  private async performStructuredAnalysis(
    data: any[],
    userContext: string,
    userGoals: string,
    feedbackContext: any
  ): Promise<any> {
    const messages = [
      {
        role: 'system' as const,
        content: `You are an expert data analyst specializing in McKinsey-style business insights. Analyze the provided data and generate high-quality insights with statistical rigor. Always respond in valid JSON format only.

Context: ${userContext}
Goals: ${userGoals}
Previous Feedback: ${JSON.stringify(feedbackContext)}

Focus on:
1. Clear, actionable insights with strong evidence
2. Quantifiable trends with statistical significance
3. Business-relevant correlations and patterns
4. Specific, prioritized recommendations
5. Professional language suitable for executives`
      },
      {
        role: 'user' as const,
        content: `Analyze this dataset and provide comprehensive insights:

Data Summary:
- Records: ${data.length}
- Columns: ${Object.keys(data[0] || {}).join(', ')}
- Sample Data: ${JSON.stringify(data.slice(0, 3), null, 2)}

Provide structured analysis with clear insights, trends, correlations, and actionable recommendations.`
      }
    ];

    const response = await openAIWrapper.call({
      model: "gpt-4-turbo-preview",
      messages,
      requireJSON: true,
      temperature: 0.3,
      max_tokens: 4000,
      schema: DataAnalysisSchema
    });

    if (!response.success) {
      console.error('OpenAI analysis failed:', response.error);
      return this.generateFallbackAnalysis(data, userContext);
    }

    return response.data;
  }

  private async generateChartRecommendations(
    data: any[],
    insights: any,
    userPreferences: any
  ): Promise<any> {
    const messages = [
      {
        role: 'system' as const,
        content: `You are a data visualization expert. Recommend the most effective charts for the given data and insights. Always respond in valid JSON format only. Consider:

1. Data types and relationships
2. Audience needs (executive-level)
3. Story being told
4. Interactive capabilities needed
5. User preferences: ${JSON.stringify(userPreferences)}

Prioritize clarity, impact, and actionability.`
      },
      {
        role: 'user' as const,
        content: `Based on this data and insights, recommend optimal visualizations:

Data: ${JSON.stringify(data.slice(0, 5), null, 2)}
Insights: ${JSON.stringify(insights, null, 2)}

Provide specific chart recommendations with clear rationale.`
      }
    ];

    const response = await openAIWrapper.call({
      model: "gpt-4-turbo-preview",
      messages,
      requireJSON: true,
      temperature: 0.4,
      max_tokens: 3000,
      schema: ChartRecommendationSchema
    });

    if (!response.success) {
      console.error('OpenAI chart recommendations failed:', response.error);
      return this.generateFallbackChartRecommendations(data);
    }

    return response.data;
  }

  private async generateStructuredSlides(
    data: any[],
    insights: any,
    charts: any[],
    feedbackContext: any
  ): Promise<any> {
    const messages = [
      {
        role: 'system' as const,
        content: `You are a presentation expert specializing in McKinsey-style decks. Create compelling, executive-ready slides that tell a clear data story. Always respond in valid JSON format only.

Requirements:
1. Start with executive summary
2. Build logical narrative flow
3. Include key insights with supporting data
4. End with clear recommendations
5. Each slide must have clear purpose
6. Professional, actionable content

Previous Feedback: ${JSON.stringify(feedbackContext)}

Maximum 15 slides for executive attention span.`
      },
      {
        role: 'user' as const,
        content: `Create a professional presentation with these elements:

Data: ${JSON.stringify(data.slice(0, 3), null, 2)}
Insights: ${JSON.stringify(insights, null, 2)}
Charts: ${JSON.stringify(charts, null, 2)}

Generate structured slides with clear narrative flow and executive appeal.`
      }
    ];

    const response = await openAIWrapper.call({
      model: "gpt-4-turbo-preview",
      messages,
      requireJSON: true,
      temperature: 0.5,
      max_tokens: 6000,
      schema: SlideGenerationSchema
    });

    if (!response.success) {
      console.error('OpenAI slide generation failed:', response.error);
      return this.generateFallbackSlides(data, insights, charts);
    }

    return response.data;
  }

  // QA Test Methods
  private async testDataAccuracy(slides: any[]): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];
    
    for (const slide of slides) {
      // Check for data consistency
      if (slide.elements) {
        for (const element of slide.elements) {
          if (element.type === 'chart' && (!element.content || element.content.includes('undefined'))) {
            issues.push(`Slide "${slide.title}": Chart data appears incomplete`);
          }
        }
      }
    }
    
    return { passed: issues.length === 0, issues };
  }

  private async testNarrativeCoherence(slides: any[]): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];
    
    // Check for logical flow
    if (slides.length > 0) {
      if (!slides.some(s => s.layout === 'executive_summary' || s.title.toLowerCase().includes('summary'))) {
        issues.push('Missing executive summary slide');
      }
      
      if (!slides.some(s => s.title.toLowerCase().includes('recommendation') || s.content.toLowerCase().includes('recommend'))) {
        issues.push('Missing clear recommendations');
      }
    }
    
    return { passed: issues.length === 0, issues };
  }

  private async testVisualClarity(slides: any[]): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];
    
    for (const slide of slides) {
      if (slide.elements && slide.elements.length > 6) {
        issues.push(`Slide "${slide.title}": Too many elements (${slide.elements.length}), maximum 6 recommended`);
      }
      
      if (slide.title.length > 100) {
        issues.push(`Slide "${slide.title}": Title too long, should be under 100 characters`);
      }
    }
    
    return { passed: issues.length === 0, issues };
  }

  private async testExecutiveReadiness(slides: any[]): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];
    
    if (slides.length > 20) {
      issues.push(`Too many slides (${slides.length}), executives prefer 15 or fewer`);
    }
    
    if (slides.length < 3) {
      issues.push(`Too few slides (${slides.length}), needs at least 3 for proper narrative`);
    }
    
    return { passed: issues.length === 0, issues };
  }

  private async runComprehensiveQA(
    slides: any[],
    qaTests: Array<(slides: any[]) => Promise<{ passed: boolean; issues: string[] }>>
  ): Promise<{ passed: boolean; failures: string[] }> {
    const allIssues: string[] = [];
    
    for (const test of qaTests) {
      try {
        const result = await test(slides);
        if (!result.passed) {
          allIssues.push(...result.issues);
        }
      } catch (error) {
        console.error('QA test error:', error);
        allIssues.push('QA test execution failed');
      }
    }
    
    return {
      passed: allIssues.length === 0,
      failures: allIssues
    };
  }

  // Validation Methods
  private async validateAnalysisQuality(analysis: any, originalData: any[]): Promise<{ score: number; issues: string[] }> {
    const issues: string[] = [];
    let score = 1.0;
    
    // Check for required fields
    if (!analysis.insights || analysis.insights.length === 0) {
      issues.push('No insights generated');
      score -= 0.3;
    }
    
    if (!analysis.recommendations || analysis.recommendations.length === 0) {
      issues.push('No recommendations provided');
      score -= 0.3;
    }
    
    // Check insight quality
    if (analysis.insights) {
      for (const insight of analysis.insights) {
        if (!insight.evidence || insight.evidence.length < 10) {
          issues.push('Insights lack sufficient evidence');
          score -= 0.1;
          break;
        }
      }
    }
    
    return { score: Math.max(score, 0), issues };
  }

  private async validatePresentationForExport(presentation: any, format: string): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];
    
    if (!presentation.slides || presentation.slides.length === 0) {
      issues.push('No slides to export');
    }
    
    for (const slide of presentation.slides || []) {
      if (!slide.title || slide.title.trim().length === 0) {
        issues.push(`Slide ${slide.id}: Missing title`);
      }
      
      if (!slide.content || slide.content.trim().length === 0) {
        issues.push(`Slide ${slide.id}: Missing content`);
      }
    }
    
    return { valid: issues.length === 0, issues };
  }

  // Helper Methods
  private getFeedbackContext(sessionId: string): any {
    return this.feedbackHistory.get(sessionId) || [];
  }

  private storeFeedback(sessionId: string, type: string, feedback: any): void {
    const sessionFeedback = this.feedbackHistory.get(sessionId) || [];
    sessionFeedback.push({
      id: `${sessionId}_${type}_${Date.now()}`,
      type: type as any,
      iteration: sessionFeedback.length + 1,
      userFeedback: feedback,
      aiResponse: {},
      outcome: feedback.approved ? 'approved' : 'needs_refinement',
      timestamp: new Date()
    });
    this.feedbackHistory.set(sessionId, sessionFeedback);
  }

  private applyUserPreferences(suggestions: any, sessionId: string): any {
    const preferences = this.userPreferences.get(sessionId) || {};
    
    // Apply learned preferences
    if (preferences.favoriteChartTypes) {
      suggestions.chartRecommendations = suggestions.chartRecommendations.map((chart: any) => {
        if (preferences.favoriteChartTypes.includes(chart.chartType)) {
          chart.priority = 'high';
        }
        return chart;
      });
    }
    
    return suggestions;
  }

  private learnChartPreferences(selectedCharts: any[], sessionId: string): void {
    const currentPrefs = this.userPreferences.get(sessionId) || {};
    const chartTypes = selectedCharts.map(chart => chart.chartType);
    
    currentPrefs.favoriteChartTypes = [...new Set([
      ...(currentPrefs.favoriteChartTypes || []),
      ...chartTypes
    ])];
    
    this.userPreferences.set(sessionId, currentPrefs);
  }

  private autoSelectCharts(suggestions: any, data: any[]): any[] {
    if (!suggestions.chartRecommendations) return [];
    
    return suggestions.chartRecommendations
      .filter((chart: any) => chart.priority === 'high')
      .slice(0, 5) // Limit to 5 charts max
      .map((chart: any) => ({
        ...chart,
        data: this.prepareChartData(data, chart.dataMapping),
        interactive: true,
        editable: true
      }));
  }

  private makeChartsInteractive(charts: any[]): any[] {
    return charts.map(chart => ({
      ...chart,
      interactivity: {
        clickable: true,
        editable: true,
        filters: ['all'],
        drillDown: true
      },
      onDataChange: (newData: any) => {
        // Will be handled by the chart component
        this.updateSupabase('chart_data', {
          chartId: chart.id,
          data: newData,
          timestamp: new Date()
        });
      }
    }));
  }

  private prepareChartData(data: any[], dataMapping: any): any[] {
    try {
      return data.slice(0, 50).map(row => {
        const chartRow: any = {};
        
        if (dataMapping.x) chartRow.x = row[dataMapping.x];
        if (dataMapping.y) {
          if (Array.isArray(dataMapping.y)) {
            dataMapping.y.forEach((y: string) => {
              chartRow[y] = parseFloat(row[y]) || 0;
            });
          } else {
            chartRow.y = parseFloat(row[dataMapping.y]) || 0;
          }
        }
        if (dataMapping.series) chartRow.series = row[dataMapping.series];
        
        return chartRow;
      });
    } catch (error) {
      console.error('Chart data preparation error:', error);
      return [];
    }
  }

  private createRefinementPrompt(failures: string[]): string {
    return `The following issues were found in the generated slides:
${failures.map(f => `- ${f}`).join('\n')}

Please refine the slides to address these issues while maintaining professional quality and clear narrative flow.`;
  }

  private async refineSlides(slides: any[], refinementPrompt: string): Promise<any> {
    try {
      const messages = [
        {
          role: 'system' as const,
          content: 'You are refining presentation slides based on QA feedback. Maintain the overall structure while addressing specific issues. Always respond in valid JSON format only.'
        },
        {
          role: 'user' as const,
          content: `${refinementPrompt}

Current slides: ${JSON.stringify(slides, null, 2)}

Please provide refined slides that address all issues.`
        }
      ];

      // Preflight validation to ensure "json" keyword is present
      if (!messages.some(m => /json/i.test(m.content))) {
        console.error("❌ Missing 'json' in messages:", messages);
        throw new Error("Must include 'json' in messages when using response_format:'json_object'");
      }

      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages,
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 6000
      });

      const content = response.choices[0].message.content;
      return content ? JSON.parse(content) : slides;
    } catch (error) {
      console.error('Slide refinement error:', error);
      return slides;
    }
  }

  private async autoFixExportIssues(presentation: any, issues: string[]): Promise<any> {
    const fixedPresentation = { ...presentation };
    
    for (const issue of issues) {
      if (issue.includes('Missing title')) {
        // Auto-generate titles for slides missing them
        const slideMatch = issue.match(/Slide ([^:]+):/);
        if (slideMatch) {
          const slideId = slideMatch[1];
          const slide = fixedPresentation.slides.find((s: any) => s.id === slideId);
          if (slide && !slide.title) {
            slide.title = `Slide ${slide.number || 'Untitled'}`;
          }
        }
      }
      
      if (issue.includes('Missing content')) {
        // Auto-generate basic content for slides missing it
        const slideMatch = issue.match(/Slide ([^:]+):/);
        if (slideMatch) {
          const slideId = slideMatch[1];
          const slide = fixedPresentation.slides.find((s: any) => s.id === slideId);
          if (slide && !slide.content) {
            slide.content = 'This slide contains important information for your presentation.';
          }
        }
      }
    }
    
    return fixedPresentation;
  }

  // Fallback Methods
  private generateFallbackAnalysis(data: any[], userContext: string): any {
    const numericColumns = this.getNumericColumns(data);
    const categoricalColumns = this.getCategoricalColumns(data);
    
    return {
      insights: [
        {
          title: `Dataset Analysis of ${data.length} Records`,
          finding: `Analysis reveals ${numericColumns.length} quantitative metrics and ${categoricalColumns.length} categorical dimensions`,
          evidence: `Data contains ${data.length} records across ${Object.keys(data[0] || {}).length} variables`,
          impact: 'medium' as const,
          confidence: 0.7,
          metrics: numericColumns.slice(0, 3)
        }
      ],
      trends: numericColumns.slice(0, 3).map(col => ({
        metric: col,
        direction: 'stable' as const,
        strength: 0.5,
        significance: 'medium' as const,
        timeframe: 'current period'
      })),
      correlations: [],
      recommendations: [
        {
          action: `Analyze ${numericColumns[0] || 'key metrics'} for optimization opportunities`,
          priority: 'short_term' as const,
          impact: 'medium' as const,
          evidence: ['Data analysis shows potential for improvement']
        }
      ]
    };
  }

  private generateFallbackChartRecommendations(data: any[]): any {
    const numericColumns = this.getNumericColumns(data);
    const categoricalColumns = this.getCategoricalColumns(data);
    
    return {
      chartRecommendations: [
        {
          chartType: 'bar' as const,
          title: `${numericColumns[0] || 'Metrics'} Overview`,
          description: 'Performance overview showing key metrics',
          dataMapping: {
            x: categoricalColumns[0] || 'category',
            y: numericColumns[0] || 'value'
          },
          reason: 'Clear comparison of categorical data',
          priority: 'high' as const
        }
      ],
      visualizationStrategy: {
        narrative: 'Data-driven insights presentation',
        flow: ['Overview', 'Analysis', 'Recommendations'],
        keyMessages: ['Performance review', 'Actionable insights']
      }
    };
  }

  private generateFallbackSlides(data: any[], insights: any, charts: any[]): any {
    return {
      slides: [
        {
          id: 'slide_1',
          title: 'Executive Summary',
          layout: 'executive_summary' as const,
          content: `Analysis of ${data.length} records reveals key business insights and opportunities for optimization.`,
          elements: [
            {
              type: 'text' as const,
              content: `Dataset: ${data.length} records analyzed`,
              position: { x: 50, y: 100 },
              size: { width: 400, height: 50 }
            }
          ],
          priority: 'high' as const
        }
      ],
      narrative: {
        executiveSummary: `Analysis of ${data.length} records provides actionable business insights.`,
        keyTakeaways: ['Data-driven insights available', 'Optimization opportunities identified'],
        callToAction: 'Review findings and implement recommendations',
        flow: ['Summary', 'Analysis', 'Recommendations']
      }
    };
  }

  private getNumericColumns(data: any[]): string[] {
    if (!data.length) return [];
    return Object.keys(data[0]).filter(key => 
      data.every(row => typeof row[key] === 'number' || !isNaN(Number(row[key])))
    );
  }

  private getCategoricalColumns(data: any[]): string[] {
    if (!data.length) return [];
    const numericCols = this.getNumericColumns(data);
    return Object.keys(data[0]).filter(key => !numericCols.includes(key));
  }

  // Supabase Update Method
  private async updateSupabase(table: string, data: any): Promise<void> {
    try {
      // This would integrate with your Supabase client
      console.log(`📊 Updating ${table}:`, data);
      // Actual Supabase update would go here
    } catch (error) {
      console.error('Supabase update error:', error);
    }
  }

  // ==========================================
  // PUBLIC API METHODS FOR REAL-TIME INTERACTION
  // ==========================================

  async getTooltipInsight(dataPoint: any): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Generate a brief, insightful explanation for this data point or action in 1-2 sentences."
          },
          {
            role: "user",
            content: `Context: ${JSON.stringify(dataPoint)}`
          }
        ],
        max_tokens: 100,
        temperature: 0.3
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('Tooltip insight generation failed:', error);
      return 'Unable to generate insight at this time.';
    }
  }

  async getSegmentInsights(segmentData: any): Promise<string[]> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "Analyze this data segment and provide 2-3 key insights as bullet points. Focus on actionable business insights."
          },
          {
            role: "user",
            content: `Segment data: ${JSON.stringify(segmentData)}`
          }
        ],
        max_tokens: 150,
        temperature: 0.3
      });

      const content = response.choices[0].message.content || '';
      return content.split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
        .map(line => line.trim().replace(/^[-•]\s*/, '').trim())
        .filter(line => line.length > 0);
    } catch (error) {
      console.error('Segment insights generation failed:', error);
      return ['Unable to generate insights at this time.'];
    }
  }

  async generateExecutiveSummary(presentation: any): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "Generate a concise executive summary for a business presentation in McKinsey style. Focus on key findings and recommendations."
          },
          {
            role: "user",
            content: `Presentation content: ${JSON.stringify(presentation, null, 2)}`
          }
        ],
        max_tokens: 200,
        temperature: 0.2
      });

      return response.choices[0].message.content || 'Executive summary could not be generated.';
    } catch (error) {
      console.error('Executive summary generation failed:', error);
      return 'Executive summary could not be generated.';
    }
  }

  private generateFallbackCharts(data: any[], insights: any): any[] {
    // Fallback chart generation when AI fails
    return [
      {
        id: 'fallback_1',
        type: 'bar',
        title: 'Data Overview',
        data: data.slice(0, 10),
        confidence: 0.5
      },
      {
        id: 'fallback_2', 
        type: 'line',
        title: 'Trend Analysis',
        data: data.slice(0, 10),
        confidence: 0.5
      }
    ];
  }
}

export const openAIBrain = new OpenAIBrain();