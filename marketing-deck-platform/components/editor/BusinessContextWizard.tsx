'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building2, Target, TrendingUp, Calendar, Users, Brain, 
  Upload, FileSpreadsheet, Database, ChevronRight, ChevronLeft,
  Lightbulb, BarChart3, PieChart, Zap, Sparkles, X, Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface BusinessContext {
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

interface BusinessContextWizardProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (context: BusinessContext, uploadedData?: any[]) => void
  initialContext?: Partial<BusinessContext>
}

const industries = [
  'Technology', 'Finance', 'Healthcare', 'E-commerce', 'Manufacturing',
  'Consulting', 'Education', 'Real Estate', 'Marketing', 'SaaS',
  'Fintech', 'Biotech', 'Energy', 'Automotive', 'Retail'
]

const businessModels = [
  'B2B SaaS', 'B2C Marketplace', 'B2B Services', 'E-commerce', 'Subscription',
  'Freemium', 'Enterprise Sales', 'Consulting', 'Product Sales', 'Licensing'
]

const commonKPIs = [
  'Revenue', 'Growth Rate', 'Customer Acquisition Cost', 'Monthly Recurring Revenue',
  'Churn Rate', 'Lifetime Value', 'Conversion Rate', 'Market Share',
  'Profit Margin', 'Employee Satisfaction', 'Customer Satisfaction', 'Retention Rate'
]

export default function BusinessContextWizard({ 
  isOpen, 
  onClose, 
  onComplete, 
  initialContext = {} 
}: BusinessContextWizardProps) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [context, setContext] = useState<BusinessContext>({
    companyName: '',
    industry: '',
    businessModel: '',
    stage: 'growth',
    primaryGoal: '',
    secondaryGoals: [],
    timeHorizon: '',
    urgency: 'medium',
    audienceType: 'executives',
    audienceLevel: 'business',
    presentationContext: '',
    kpis: [],
    currentMetrics: {},
    benchmarks: {},
    analysisTimeframe: '',
    comparisonPeriods: [],
    dataFrequency: 'monthly',
    competitors: [],
    marketPosition: '',
    differentiators: [],
    constraints: [],
    designPreferences: [],
    narrativeStyle: 'executive',
    ...initialContext
  })
  
  const [uploadedData, setUploadedData] = useState<any[] | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)

  const steps = [
    { title: 'Company & Industry', icon: Building2 },
    { title: 'Goals & Timeline', icon: Target },
    { title: 'Audience & Context', icon: Users },
    { title: 'KPIs & Metrics', icon: TrendingUp },
    { title: 'Data Upload', icon: Database },
    { title: 'Generate Slides', icon: Sparkles }
  ]

  const updateContext = (updates: Partial<BusinessContext>) => {
    setContext(prev => ({ ...prev, ...updates }))
  }

  // Auto-save context to localStorage
  useEffect(() => {
    if (user?.id && context.companyName) {
      const draftKey = `business-context-draft-${user.id}`
      const draftData = {
        context,
        currentStep,
        timestamp: new Date().toISOString(),
        title: `${context.companyName} Business Context` || 'Business Context Draft'
      }
      localStorage.setItem(draftKey, JSON.stringify(draftData))
      console.log('📝 Business context draft saved:', draftKey)
    }
  }, [context, currentStep, user?.id])

  // Load draft on component mount
  useEffect(() => {
    if (user?.id && Object.keys(initialContext).length === 0) {
      const draftKey = `business-context-draft-${user.id}`
      const saved = localStorage.getItem(draftKey)
      if (saved) {
        try {
          const draft = JSON.parse(saved)
          setContext(prev => ({ ...prev, ...draft.context }))
          setCurrentStep(draft.currentStep || 0)
          console.log('📖 Loaded business context draft:', draft.title)
        } catch (error) {
          console.error('Failed to load business context draft:', error)
        }
      }
    }
  }, [user?.id, initialContext])

  const addToArray = (field: keyof BusinessContext, value: string) => {
    if (value.trim()) {
      const currentArray = context[field] as string[]
      updateContext({ [field]: [...currentArray, value.trim()] })
    }
  }

  const removeFromArray = (field: keyof BusinessContext, index: number) => {
    const currentArray = context[field] as string[]
    updateContext({ [field]: currentArray.filter((_, i) => i !== index) })
  }

  const handleDataUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      
      try {
        if (file.name.endsWith('.json')) {
          const data = JSON.parse(content)
          setUploadedData(Array.isArray(data) ? data : [data])
        } else if (file.name.endsWith('.csv')) {
          // Simple CSV parsing
          const lines = content.split('\n')
          const headers = lines[0].split(',').map(h => h.trim())
          const data = lines.slice(1).filter(line => line.trim()).map(line => {
            const values = line.split(',')
            const obj: any = {}
            headers.forEach((header, index) => {
              const value = values[index]?.trim()
              obj[header] = isNaN(Number(value)) ? value : Number(value)
            })
            return obj
          })
          setUploadedData(data)
        }
      } catch (error) {
        console.error('Error parsing file:', error)
      }
    }
    reader.readAsText(file)
  }, [])

  const generateSlides = async () => {
    setIsGenerating(true)
    setGenerationProgress(0)

    // Simulate AI brain processing with progress updates
    const progressSteps = [
      'Analyzing business context...',
      'Processing uploaded data...',
      'Generating insights...',
      'Creating visualizations...',
      'Building slide narratives...',
      'Finalizing presentation...'
    ]

    for (let i = 0; i < progressSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setGenerationProgress((i + 1) * (100 / progressSteps.length))
    }

    onComplete(context, uploadedData || undefined)
    setIsGenerating(false)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Company & Industry
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium text-gray-300">Company Name</Label>
              <Input
                value={context.companyName}
                onChange={(e) => updateContext({ companyName: e.target.value })}
                placeholder="Enter your company name"
                className="mt-1 bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-300">Industry</Label>
              <Select value={context.industry} onValueChange={(value) => updateContext({ industry: value })}>
                <SelectTrigger className="mt-1 bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {industries.map(industry => (
                    <SelectItem key={industry} value={industry} className="text-white">
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-300">Business Model</Label>
              <Select value={context.businessModel} onValueChange={(value) => updateContext({ businessModel: value })}>
                <SelectTrigger className="mt-1 bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select your business model" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {businessModels.map(model => (
                    <SelectItem key={model} value={model} className="text-white">
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-300">Company Stage</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {['startup', 'growth', 'mature', 'enterprise'].map(stage => (
                  <Button
                    key={stage}
                    variant={context.stage === stage ? 'default' : 'outline'}
                    onClick={() => updateContext({ stage: stage as any })}
                    className="text-white border-gray-600"
                  >
                    {stage.charAt(0).toUpperCase() + stage.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )

      case 1: // Goals & Timeline
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium text-gray-300">Primary Goal</Label>
              <Textarea
                value={context.primaryGoal}
                onChange={(e) => updateContext({ primaryGoal: e.target.value })}
                placeholder="What's the main objective of this presentation?"
                className="mt-1 bg-gray-800 border-gray-600 text-white"
                rows={3}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-300">Time Horizon</Label>
              <Select value={context.timeHorizon} onValueChange={(value) => updateContext({ timeHorizon: value })}>
                <SelectTrigger className="mt-1 bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select time horizon" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="Q1 2024" className="text-white">Q1 2024</SelectItem>
                  <SelectItem value="Q2 2024" className="text-white">Q2 2024</SelectItem>
                  <SelectItem value="Q3 2024" className="text-white">Q3 2024</SelectItem>
                  <SelectItem value="Q4 2024" className="text-white">Q4 2024</SelectItem>
                  <SelectItem value="FY 2024" className="text-white">FY 2024</SelectItem>
                  <SelectItem value="YTD" className="text-white">Year to Date</SelectItem>
                  <SelectItem value="Last 12 months" className="text-white">Last 12 months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-300">Urgency Level</Label>
              <div className="grid grid-cols-4 gap-2 mt-1">
                {['low', 'medium', 'high', 'critical'].map(level => (
                  <Button
                    key={level}
                    variant={context.urgency === level ? 'default' : 'outline'}
                    onClick={() => updateContext({ urgency: level as any })}
                    className={cn(
                      "text-white border-gray-600",
                      level === 'critical' && context.urgency === level && "bg-red-600 hover:bg-red-700"
                    )}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-300">Analysis Timeframe</Label>
              <Input
                value={context.analysisTimeframe}
                onChange={(e) => updateContext({ analysisTimeframe: e.target.value })}
                placeholder="e.g., Last 6 months, Q1-Q3 2024"
                className="mt-1 bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>
        )

      case 2: // Audience & Context
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium text-gray-300">Primary Audience</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {['executives', 'investors', 'team', 'clients', 'board'].map(audience => (
                  <Button
                    key={audience}
                    variant={context.audienceType === audience ? 'default' : 'outline'}
                    onClick={() => updateContext({ audienceType: audience as any })}
                    className="text-white border-gray-600"
                  >
                    {audience.charAt(0).toUpperCase() + audience.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-300">Audience Level</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {['technical', 'business', 'mixed'].map(level => (
                  <Button
                    key={level}
                    variant={context.audienceLevel === level ? 'default' : 'outline'}
                    onClick={() => updateContext({ audienceLevel: level as any })}
                    className="text-white border-gray-600"
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-300">Presentation Context</Label>
              <Textarea
                value={context.presentationContext}
                onChange={(e) => updateContext({ presentationContext: e.target.value })}
                placeholder="Board meeting, investor pitch, quarterly review, etc."
                className="mt-1 bg-gray-800 border-gray-600 text-white"
                rows={3}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-300">Narrative Style</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {['analytical', 'storytelling', 'executive', 'technical'].map(style => (
                  <Button
                    key={style}
                    variant={context.narrativeStyle === style ? 'default' : 'outline'}
                    onClick={() => updateContext({ narrativeStyle: style as any })}
                    className="text-white border-gray-600"
                  >
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )

      case 3: // KPIs & Metrics
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium text-gray-300">Key Performance Indicators</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {commonKPIs.map(kpi => (
                  <Button
                    key={kpi}
                    variant={context.kpis.includes(kpi) ? 'default' : 'outline'}
                    onClick={() => {
                      if (context.kpis.includes(kpi)) {
                        updateContext({ kpis: context.kpis.filter(k => k !== kpi) })
                      } else {
                        updateContext({ kpis: [...context.kpis, kpi] })
                      }
                    }}
                    className="text-white border-gray-600 text-sm"
                  >
                    {kpi}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-300">Selected KPIs</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {context.kpis.map((kpi, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {kpi}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => removeFromArray('kpis', index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-300">Data Frequency</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {['monthly', 'quarterly', 'yearly'].map(freq => (
                  <Button
                    key={freq}
                    variant={context.dataFrequency === freq ? 'default' : 'outline'}
                    onClick={() => updateContext({ dataFrequency: freq as any })}
                    className="text-white border-gray-600"
                  >
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-300">Market Position</Label>
              <Input
                value={context.marketPosition}
                onChange={(e) => updateContext({ marketPosition: e.target.value })}
                placeholder="e.g., Market leader, Challenger, Niche player"
                className="mt-1 bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>
        )

      case 4: // Data Upload
        return (
          <div className="space-y-6">
            <div className="text-center">
              <FileSpreadsheet className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Upload Your Data</h3>
              <p className="text-gray-400 mb-6">
                Upload CSV or JSON files with your business data for AI analysis
              </p>
            </div>

            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".csv,.json"
                onChange={handleDataUpload}
                className="hidden"
                id="data-upload"
              />
              <label
                htmlFor="data-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-white mb-2">Click to upload data file</p>
                <p className="text-gray-400 text-sm">CSV, JSON files supported</p>
              </label>
            </div>

            {uploadedData && (
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-white font-medium">Data uploaded successfully!</span>
                </div>
                <p className="text-gray-400 text-sm">
                  {uploadedData.length} rows of data ready for analysis
                </p>
                <div className="mt-2 max-h-32 overflow-y-auto">
                  <pre className="text-xs text-gray-300">
                    {JSON.stringify(uploadedData.slice(0, 3), null, 2)}
                    {uploadedData.length > 3 && '\n...'}
                  </pre>
                </div>
              </div>
            )}

            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="text-white font-medium mb-1">No data? No problem!</h4>
                  <p className="text-gray-300 text-sm">
                    Our AI brain can generate realistic sample data based on your business context and industry benchmarks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 5: // Generate Slides
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Ready to Generate</h3>
              <p className="text-gray-400 mb-6">
                Our AI brain will analyze your context and data to create professional slides
              </p>
            </div>

            {isGenerating ? (
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-white font-medium">Generating your presentation...</span>
                  </div>
                  <Progress value={generationProgress} className="w-full" />
                  <p className="text-gray-400 text-sm mt-2">{Math.round(generationProgress)}% complete</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Card className="bg-gray-800 border-gray-700 p-4">
                  <h4 className="text-white font-medium mb-3">What our AI will create:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-300">
                      <BarChart3 className="w-4 h-4 text-blue-400" />
                      <span className="text-sm">Real data analysis and insights</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <PieChart className="w-4 h-4 text-green-400" />
                      <span className="text-sm">Professional charts and visualizations</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <TrendingUp className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm">Business recommendations and forecasts</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Zap className="w-4 h-4 text-purple-400" />
                      <span className="text-sm">Executive-ready slide narratives</span>
                    </div>
                  </div>
                </Card>

                <Button
                  onClick={generateSlides}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Presentation with AI Brain
                </Button>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return context.companyName && context.industry && context.businessModel
      case 1:
        return context.primaryGoal && context.timeHorizon
      case 2:
        return context.presentationContext
      case 3:
        return context.kpis.length > 0
      case 4:
        return true // Data upload is optional
      case 5:
        return true
      default:
        return false
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">AI-Powered Presentation Builder</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:bg-gray-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mt-6">
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <div
                    key={index}
                    className={cn(
                      "flex flex-col items-center gap-2",
                      index <= currentStep ? "text-blue-400" : "text-gray-500"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full border-2 flex items-center justify-center",
                      index < currentStep && "bg-blue-600 border-blue-600",
                      index === currentStep && "border-blue-400",
                      index > currentStep && "border-gray-600"
                    )}>
                      {index < currentStep ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span className="text-xs text-center">{step.title}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-700 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0 || isGenerating}
              className="text-white border-gray-600 hover:bg-gray-700"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed() || isGenerating}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : null}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}