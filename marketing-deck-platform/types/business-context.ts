export interface BusinessContext {
  // Company & Industry
  companyName: string
  industry: string
  businessModel: string
  stage: 'startup' | 'growth' | 'mature' | 'enterprise'
  
  // Goals & Objectives  
  primaryGoal: string
  secondaryGoals: string[]
  timeHorizon: string
  urgency: 'low' | 'medium' | 'high' | 'critical'
  
  // Target Audience
  audienceType: 'executives' | 'investors' | 'team' | 'clients' | 'board'
  audienceLevel: 'technical' | 'business' | 'mixed'
  presentationContext: string
  
  // KPIs & Metrics
  kpis: string[]
  currentMetrics: { [key: string]: string | number }
  benchmarks: { [key: string]: string | number }
  
  // Timeline & Data
  analysisTimeframe: string
  comparisonPeriods: string[]
  dataFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  
  // Competitive Context
  competitors: string[]
  marketPosition: string
  differentiators: string[]
  
  // Constraints & Preferences
  constraints: string[]
  designPreferences: string[]
  narrativeStyle: 'analytical' | 'storytelling' | 'executive' | 'technical'
}

export interface AIGenerationRequest {
  businessContext: BusinessContext
  userData?: any[]
  slideCount?: number
  focusAreas?: string[]
  customPrompts?: string[]
}

export interface AIGenerationResponse {
  slides: GeneratedSlide[]
  insights: BusinessInsight[]
  recommendations: ActionableRecommendation[]
  metadata: {
    confidence: number
    processingTime: number
    dataQuality: number
    aiProvider: string
  }
}

export interface GeneratedSlide {
  id: string
  type: 'title' | 'content' | 'chart' | 'metrics' | 'insights' | 'recommendations'
  title: string
  subtitle?: string
  content?: string
  elements: SlideElement[]
  background: {
    type: 'solid' | 'gradient'
    value: string
  }
  layout: string
  metadata: {
    confidence: number
    insights: string[]
    businessRelevance: number
    dataSource: string
  }
}

export interface SlideElement {
  id: string
  type: 'text' | 'image' | 'chart' | 'shape' | 'metric-card' | 'insight-card'
  position: { x: number; y: number }
  size: { width: number; height: number }
  rotation: number
  content: string
  style: any
  chartData?: any[]
  chartType?: string
  metadata?: {
    aiGenerated: boolean
    confidence: number
    businessContext: string
  }
}

export interface BusinessInsight {
  title: string
  description: string
  type: 'trend' | 'anomaly' | 'opportunity' | 'risk'
  confidence: number
  businessImplication: string
  evidence: string[]
  recommendations: string[]
  metrics: {
    impact: 'low' | 'medium' | 'high'
    urgency: 'low' | 'medium' | 'high'
    feasibility: 'low' | 'medium' | 'high'
  }
}

export interface ActionableRecommendation {
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  effort: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high'
  timeline: string
  prerequisites: string[]
  successMetrics: string[]
  risks: string[]
  estimatedROI?: number
}

export interface MetricCard {
  label: string
  value: string | number
  trend: 'up' | 'down' | 'flat'
  change?: string
  icon?: string
  color: string
  confidence: number
  historicalData?: Array<{
    period: string
    value: number
  }>
}

export interface ChartConfiguration {
  type: 'line' | 'bar' | 'area' | 'pie' | 'scatter' | 'combo'
  title: string
  data: any[]
  xAxis: string
  yAxis: string[]
  colors: string[]
  annotations?: Array<{
    type: 'line' | 'point' | 'box'
    position: any
    text: string
    color?: string
  }>
  businessContext: {
    kpi: string
    timeframe: string
    benchmark?: number
    target?: number
  }
}

export interface AIProvider {
  name: string
  type: 'openai' | 'anthropic' | 'local' | 'custom'
  endpoint: string
  model: string
  capabilities: string[]
  costPerToken: number
  rateLimits: {
    requestsPerMinute: number
    tokensPerMinute: number
  }
  reliability: number
}