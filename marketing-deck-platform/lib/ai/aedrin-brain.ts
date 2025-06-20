import { OpenAI } from 'openai';
import { EventEmitter } from 'events';
import { AnalysisResult } from '@/lib/data/analyzer';

// Core system interfaces
interface SystemContext {
  userData: UserContext;
  analysisResults: Record<string, AnalysisResult>;
  generatedContent: Record<string, any>;
  userFeedback: UserFeedback[];
  iterationCount: number;
  currentPhase: WorkflowPhase;
  sessionId: string;
}

interface UserContext {
  goals?: string;
  audience?: string;
  company?: string;
  industry?: string;
  preferences?: {
    chartTypes: string[];
    colorThemes: string[];
    layoutStyles: string[];
  };
}

interface UserFeedback {
  id: string;
  type: 'edit' | 'suggestion_accepted' | 'suggestion_rejected' | 'chart_modified' | 'content_generated';
  timestamp: Date;
  element?: string;
  original?: any;
  modified?: any;
  confidence?: number;
}

interface UserInput {
  type: 'data_upload' | 'refine_content' | 'chart_modification' | 'narrative_adjustment' | 'export_request' | 'general_query';
  data?: any;
  file?: File;
  elementId?: string;
  modifications?: any;
  query?: string;
  context?: any;
}

interface SystemResponse {
  type: 'analysis' | 'suggestions' | 'content' | 'error' | 'confirmation';
  data?: any;
  suggestions?: Suggestion[];
  error?: string;
  confidence?: number;
}

interface Suggestion {
  id: string;
  type: 'content_improvement' | 'chart_enhancement' | 'layout_optimization' | 'narrative_flow';
  title: string;
  description: string;
  preview?: string;
  confidence: number;
  applyTo?: string[];
  action: () => void;
}

interface UserEdit {
  elementType: string;
  original: any;
  modified: any;
  elementId: string;
  context: any;
}

interface ChartModification {
  elementId: string;
  originalConfig: any;
  newConfig: any;
  modificationType: 'type_change' | 'data_mapping' | 'styling' | 'filtering';
}

type WorkflowPhase = 'upload' | 'analyze' | 'generate' | 'edit' | 'refine' | 'export';

interface GeneratedContent {
  slides: any[];
  narrativeThemes: string[];
  keyMessages: string[];
  supportingData: any[];
}

interface Intent {
  type: string;
  confidence: number;
  parameters?: any;
}

export class AedrinBrain extends EventEmitter {
  private openai: OpenAI;
  private context: SystemContext;
  
  constructor(sessionId?: string) {
    super();
    this.openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY!,
      dangerouslyAllowBrowser: false // Server-side only
    });
    
    this.context = {
      userData: {},
      analysisResults: {},
      generatedContent: {},
      userFeedback: [],
      iterationCount: 0,
      currentPhase: 'upload',
      sessionId: sessionId || `session-${Date.now()}`
    };
    
    this.initializeEventListeners();
  }
  
  // CENTRAL BRAIN: Process any input and route to appropriate handler
  async process(input: UserInput): Promise<SystemResponse> {
    try {
      // Update context with new input
      this.updateContext(input);
      
      // Determine intent and next action
      const intent = await this.determineIntent(input);
      
      switch (intent.type) {
        case 'data_upload':
          return this.handleDataUpload(input);
          
        case 'refine_content':
          return this.handleContentRefinement(input);
          
        case 'chart_modification':
          return this.handleChartModification(input);
          
        case 'narrative_adjustment':
          return this.handleNarrativeAdjustment(input);
          
        case 'export_request':
          return this.handleExport(input);
          
        default:
          return this.handleGeneralQuery(input);
      }
    } catch (error) {
      console.error('AEDRIN Brain processing error:', error);
      return {
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown processing error'
      };
    }
  }
  
  private async determineIntent(input: UserInput): Promise<Intent> {
    // Simple rule-based intent detection (can be enhanced with ML)
    if (input.file || input.type === 'data_upload') {
      return { type: 'data_upload', confidence: 0.9 };
    }
    
    if (input.type === 'chart_modification' || input.modifications) {
      return { type: 'chart_modification', confidence: 0.8 };
    }
    
    if (input.type === 'refine_content' || input.elementId) {
      return { type: 'refine_content', confidence: 0.8 };
    }
    
    if (input.type === 'export_request') {
      return { type: 'export_request', confidence: 0.9 };
    }
    
    return { type: 'general_query', confidence: 0.5 };
  }
  
  // FLYWHEEL COMPONENT 1: Data Analysis with Continuous Learning
  private async handleDataUpload(input: UserInput): Promise<SystemResponse> {
    const { file, data } = input;
    
    if (!file && !data) {
      return {
        type: 'error',
        error: 'No data provided for analysis'
      };
    }
    
    const previousAnalysis = Object.values(this.context.analysisResults)[0];
    
    const analysisPrompt = `
    Analyze this marketing/business data with the following context:
    - Previous insights: ${JSON.stringify(previousAnalysis?.insights?.slice(0, 3) || [])}
    - User goals: ${this.context.userData.goals || 'Not specified'}
    - Iteration: ${this.context.iterationCount}
    - Industry: ${this.context.userData.industry || 'General business'}
    
    Based on the data patterns, provide:
    1. 3-5 key insights that would be valuable for executive presentations
    2. Recommended visualizations with specific chart types
    3. Narrative themes that connect the insights
    4. Potential concerns or questions the data raises
    
    Learn from previous feedback: ${JSON.stringify(this.context.userFeedback.slice(-5))}
    
    Return JSON with structure:
    {
      "insights": [{"title": "...", "description": "...", "importance": 0.9}],
      "visualizations": [{"type": "line", "title": "...", "reasoning": "..."}],
      "narrativeThemes": ["Theme 1", "Theme 2"],
      "executiveSummary": "One-sentence key takeaway"
    }
    `;
    
    try {
      const analysis = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          { 
            role: 'system', 
            content: 'You are a senior data analyst and presentation expert who creates executive-ready insights from business data. Always respond with valid JSON.' 
          },
          { role: 'user', content: analysisPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3
      });
      
      const analysisResult = JSON.parse(analysis.choices[0].message.content || '{}');
      
      // Emit event for other components to react
      this.emit('analysis_complete', analysisResult);
      
      // Store in context for future reference
      this.context.analysisResults[`analysis-${Date.now()}`] = analysisResult;
      this.context.iterationCount++;
      this.context.currentPhase = 'analyze';
      
      return {
        type: 'analysis',
        data: analysisResult,
        suggestions: this.generateNextSteps(analysisResult)
      };
    } catch (error) {
      console.error('Analysis error:', error);
      return {
        type: 'error',
        error: 'Failed to analyze data. Please try again.'
      };
    }
  }
  
  // FLYWHEEL COMPONENT 2: Content Generation with Edit Tracking
  async generateContent(analysis: AnalysisResult, userContext?: UserContext): Promise<GeneratedContent> {
    const contentPrompt = `
    Generate executive presentation content based on this analysis:
    ${JSON.stringify(analysis.insights?.slice(0, 5))}
    
    User context:
    - Company: ${userContext?.company || this.context.userData.company || 'Organization'}
    - Audience: ${userContext?.audience || this.context.userData.audience || 'Executive team'}
    - Goals: ${userContext?.goals || this.context.userData.goals || 'Drive data-informed decisions'}
    
    Previous edits made by user (learn from these patterns):
    ${JSON.stringify(this.context.userFeedback.filter(f => f.type === 'edit').slice(-10))}
    
    Generate content that:
    1. Follows McKinsey-style executive communication
    2. Starts with key takeaways, then supports with data
    3. Uses clear, action-oriented language
    4. Matches patterns from user's previous edits
    
    Return JSON with:
    {
      "executiveSummary": "One powerful headline",
      "keyMessages": ["Message 1", "Message 2", "Message 3"],
      "slideOutlines": [
        {
          "title": "Slide Title",
          "keyMessage": "Main point",
          "supportingPoints": ["Point 1", "Point 2"],
          "suggestedChart": "line|bar|pie",
          "layout": "title|content|comparison"
        }
      ],
      "narrativeFlow": "How slides connect together",
      "callsToAction": ["Action 1", "Action 2"]
    }
    `;
    
    const content = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { 
          role: 'system', 
          content: 'You are a McKinsey senior partner who creates compelling executive presentations. Always respond with valid JSON.' 
        },
        { role: 'user', content: contentPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4
    });
    
    return JSON.parse(content.choices[0].message.content || '{}');
  }
  
  // FLYWHEEL COMPONENT 3: Real-time Refinement
  private initializeEventListeners() {
    // Listen for user edits in real-time
    this.on('user_edit', async (edit: UserEdit) => {
      // Learn from the edit
      this.context.userFeedback.push({
        id: `feedback-${Date.now()}`,
        type: 'edit',
        timestamp: new Date(),
        original: edit.original,
        modified: edit.modified,
        element: edit.elementType
      });
      
      // If significant edit, suggest related improvements
      if (this.isSignificantEdit(edit)) {
        const suggestions = await this.generateSmartSuggestions(edit);
        this.emit('suggestions_ready', suggestions);
      }
    });
    
    // Listen for chart modifications
    this.on('chart_modified', async (modification: ChartModification) => {
      // Understand why the user made this change
      const insight = await this.analyzeChartModification(modification);
      
      // Apply learning to other similar charts
      this.emit('apply_chart_pattern', {
        pattern: insight.pattern,
        applyTo: insight.similarCharts
      });
    });
    
    // Listen for content generation requests
    this.on('generate_content', async (context: any) => {
      const content = await this.generateContent(context.analysis, context.userContext);
      this.emit('content_ready', content);
    });
  }
  
  // FLYWHEEL COMPONENT 4: Intelligent Suggestions
  private async generateSmartSuggestions(edit: UserEdit): Promise<Suggestion[]> {
    const suggestionPrompt = `
    User edited: ${edit.elementType}
    Original: "${JSON.stringify(edit.original)}"
    Modified: "${JSON.stringify(edit.modified)}"
    
    Based on this edit pattern and context: ${JSON.stringify(edit.context)}
    
    Generate 2-3 smart suggestions for:
    1. Similar elements that could benefit from this change
    2. Related improvements to enhance overall presentation
    3. Ways to make the narrative more compelling
    
    Consider the full presentation context: ${JSON.stringify(this.context.generatedContent)}
    
    Return JSON array of suggestions:
    [
      {
        "id": "suggestion-1",
        "type": "content_improvement",
        "title": "Brief title",
        "description": "What this suggestion does",
        "confidence": 0.8,
        "preview": "Preview of the change"
      }
    ]
    `;
    
    try {
      const suggestions = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          { 
            role: 'system', 
            content: 'You are an AI presentation assistant that learns from user behavior to make intelligent suggestions. Always respond with valid JSON.' 
          },
          { role: 'user', content: suggestionPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.6
      });
      
      const result = JSON.parse(suggestions.choices[0].message.content || '{"suggestions": []}');
      return result.suggestions || [];
    } catch (error) {
      console.error('Error generating suggestions:', error);
      return [];
    }
  }
  
  private async analyzeChartModification(modification: ChartModification): Promise<any> {
    // Analyze why the user made this chart modification
    const analysisPrompt = `
    User modified a chart:
    - Element ID: ${modification.elementId}
    - Change type: ${modification.modificationType}
    - Original config: ${JSON.stringify(modification.originalConfig)}
    - New config: ${JSON.stringify(modification.newConfig)}
    
    Analyze the intent behind this change and suggest:
    1. Similar charts that might benefit from the same modification
    2. The pattern or principle the user is applying
    3. How to proactively apply this learning
    
    Return JSON with:
    {
      "intent": "Why user made this change",
      "pattern": "The design principle being applied",
      "similarCharts": ["chart-id-1", "chart-id-2"],
      "proactiveApplications": ["How to apply this learning elsewhere"]
    }
    `;
    
    try {
      const analysis = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert in data visualization and user experience who understands design patterns.' 
          },
          { role: 'user', content: analysisPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3
      });
      
      return JSON.parse(analysis.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Error analyzing chart modification:', error);
      return {};
    }
  }
  
  private isSignificantEdit(edit: UserEdit): boolean {
    // Determine if an edit is significant enough to warrant suggestions
    if (edit.elementType === 'text') {
      const originalLength = edit.original?.length || 0;
      const modifiedLength = edit.modified?.length || 0;
      const lengthChange = Math.abs(modifiedLength - originalLength);
      
      // Significant if major content change or complete rewrite
      return lengthChange > originalLength * 0.3 || lengthChange > 50;
    }
    
    if (edit.elementType === 'chart') {
      // Any chart modification is significant
      return true;
    }
    
    return false;
  }
  
  private generateNextSteps(analysisResult: any): Suggestion[] {
    const suggestions: Suggestion[] = [];
    
    // Suggest creating slides based on insights
    if (analysisResult.insights && analysisResult.insights.length > 0) {
      suggestions.push({
        id: 'create-slides',
        type: 'content_improvement',
        title: 'Generate presentation slides',
        description: `Create ${analysisResult.insights.length} slides highlighting your key insights`,
        confidence: 0.9,
        applyTo: ['presentation'],
        action: () => this.emit('generate_content', { analysis: analysisResult })
      });
    }
    
    // Suggest specific visualizations
    if (analysisResult.visualizations && analysisResult.visualizations.length > 0) {
      suggestions.push({
        id: 'add-charts',
        type: 'chart_enhancement',
        title: 'Add recommended charts',
        description: `Add ${analysisResult.visualizations.length} charts to visualize your data story`,
        confidence: 0.8,
        applyTo: ['charts'],
        action: () => this.emit('add_recommended_charts', analysisResult.visualizations)
      });
    }
    
    return suggestions;
  }
  
  private updateContext(input: UserInput): void {
    // Update user context based on input
    if (input.context) {
      this.context.userData = { ...this.context.userData, ...input.context };
    }
    
    // Update current phase based on input type
    const phaseMap: Record<string, WorkflowPhase> = {
      'data_upload': 'upload',
      'refine_content': 'edit',
      'chart_modification': 'edit',
      'export_request': 'export'
    };
    
    if (phaseMap[input.type]) {
      this.context.currentPhase = phaseMap[input.type];
    }
  }
  
  private async handleContentRefinement(input: UserInput): Promise<SystemResponse> {
    // Handle content refinement requests
    return {
      type: 'content',
      data: { message: 'Content refinement not yet implemented' }
    };
  }
  
  private async handleChartModification(input: UserInput): Promise<SystemResponse> {
    // Handle chart modification requests
    return {
      type: 'content',
      data: { message: 'Chart modification not yet implemented' }
    };
  }
  
  private async handleNarrativeAdjustment(input: UserInput): Promise<SystemResponse> {
    // Handle narrative adjustment requests
    return {
      type: 'content',
      data: { message: 'Narrative adjustment not yet implemented' }
    };
  }
  
  private async handleExport(input: UserInput): Promise<SystemResponse> {
    // Handle export requests
    return {
      type: 'confirmation',
      data: { message: 'Export preparation complete' }
    };
  }
  
  private async handleGeneralQuery(input: UserInput): Promise<SystemResponse> {
    // Handle general queries
    return {
      type: 'content',
      data: { message: 'General query handling not yet implemented' }
    };
  }
  
  // Public methods for external use
  getContext(): SystemContext {
    return { ...this.context };
  }
  
  updateUserContext(userContext: Partial<UserContext>): void {
    this.context.userData = { ...this.context.userData, ...userContext };
  }
  
  addFeedback(feedback: Omit<UserFeedback, 'id' | 'timestamp'>): void {
    this.context.userFeedback.push({
      ...feedback,
      id: `feedback-${Date.now()}`,
      timestamp: new Date()
    });
  }
}

// Singleton instance for server-side use
let brainInstance: AedrinBrain | null = null;

export function getAedrinBrain(sessionId?: string): AedrinBrain {
  if (!brainInstance) {
    brainInstance = new AedrinBrain(sessionId);
  }
  return brainInstance;
}